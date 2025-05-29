const bruteForceManager = (() => {
    let workerInstance = null;
    let isRunning = false;
    let currentKollektivDataFunc = null;
    let onUpdateCallback = null;
    let onCompleteCallback = null;
    let mainAppInterfaceRef = null;
    let currentProgressData = null;
    let allKollektivResults = {};
    let isWorkerReallyAvailable = false;
    let currentRunConfig = {};

    function _initializeWorker() {
        try {
            if (typeof Worker === "undefined") {
                console.error("BruteForceManager: Web Workers werden von diesem Browser nicht unterstützt.");
                ui_helpers.showToast("Brute-Force-Optimierung nicht verfügbar (Browser-Inkompatibilität).", "danger");
                isWorkerReallyAvailable = false;
                return;
            }
            workerInstance = new Worker(APP_CONFIG.PATHS.BRUTE_FORCE_WORKER);
            isWorkerReallyAvailable = true;

            workerInstance.onmessage = (event) => {
                const { type, payload } = event.data;
                currentProgressData = payload;

                switch (type) {
                    case 'started':
                        isRunning = true;
                        if (mainAppInterfaceRef && typeof mainAppInterfaceRef.setUIInteraction === 'function') {
                            mainAppInterfaceRef.setUIInteraction(false);
                        }
                        if (onUpdateCallback) onUpdateCallback('started', payload);
                        break;
                    case 'progress':
                        if (onUpdateCallback) onUpdateCallback('progress', payload);
                        break;
                    case 'complete':
                        isRunning = false;
                        allKollektivResults[payload.kollektiv] = payload;
                        if (mainAppInterfaceRef && typeof mainAppInterfaceRef.setUIInteraction === 'function') {
                            mainAppInterfaceRef.setUIInteraction(true);
                        }
                        if (onUpdateCallback) onUpdateCallback('result', payload);
                        if (onCompleteCallback) onCompleteCallback(payload.bestResult, payload.kollektiv);
                        if (workerInstance) workerInstance.terminate();
                        _initializeWorker();
                        break;
                    case 'error':
                        isRunning = false;
                        console.error("Fehler im Brute-Force Worker:", payload.message);
                        ui_helpers.showToast(`Brute-Force Fehler: ${payload.message}`, "danger");
                        if (mainAppInterfaceRef && typeof mainAppInterfaceRef.setUIInteraction === 'function') {
                            mainAppInterfaceRef.setUIInteraction(true);
                        }
                        if (onUpdateCallback) onUpdateCallback('error', payload);
                        if (workerInstance) workerInstance.terminate();
                        _initializeWorker();
                        break;
                    default:
                        console.warn("Unbekannter Nachrichtentyp vom Brute-Force Worker:", type);
                }
            };

            workerInstance.onerror = (error) => {
                isRunning = false;
                console.error("Schwerwiegender Fehler im Brute-Force Worker:", error.message, error.filename, error.lineno);
                ui_helpers.showToast(`Kritischer Fehler im Brute-Force Worker: ${error.message}. Optimierung abgebrochen.`, "danger");
                currentProgressData = { message: error.message };
                if (mainAppInterfaceRef && typeof mainAppInterfaceRef.setUIInteraction === 'function') {
                    mainAppInterfaceRef.setUIInteraction(true);
                }
                if (onUpdateCallback) onUpdateCallback('error', currentProgressData);
                if (workerInstance) workerInstance.terminate();
                _initializeWorker();
            };

        } catch (e) {
            console.error("Fehler beim Initialisieren des Brute-Force Workers:", e);
            ui_helpers.showToast("Brute-Force Worker konnte nicht gestartet werden.", "danger");
            isWorkerReallyAvailable = false;
        }
    }

    function initialize(kollektivDataFunc, updateCb, completeCb, mainAppInterface) {
        currentKollektivDataFunc = kollektivDataFunc;
        onUpdateCallback = updateCb;
        onCompleteCallback = completeCb;
        mainAppInterfaceRef = mainAppInterface;
        allKollektivResults = {};
        _initializeWorker();
    }

    function updateKollektivData(kollektivDataFunc) {
        currentKollektivDataFunc = kollektivDataFunc;
    }

    function startBruteForce(targetMetric, currentKollektivName) {
        if (isRunning) {
            ui_helpers.showToast("Eine Brute-Force-Optimierung läuft bereits.", "warning");
            return;
        }
        if (!isWorkerReallyAvailable || !workerInstance) {
             ui_helpers.showToast("Brute-Force Worker ist nicht verfügbar. Bitte Seite neu laden.", "danger");
            _initializeWorker();
            if(!isWorkerReallyAvailable) return;
        }

        if (typeof currentKollektivDataFunc !== 'function') {
            ui_helpers.showToast("Datenquelle für Brute-Force nicht korrekt initialisiert.", "danger");
            return;
        }

        const filteredData = currentKollektivDataFunc();
        if (!filteredData || filteredData.length === 0) {
            ui_helpers.showToast(`Keine Daten im Kollektiv '${getKollektivDisplayName(currentKollektivName)}' für Brute-Force.`, "warning");
            return;
        }
        if(filteredData.length < APP_CONFIG.STATISTICAL_CONSTANTS.CI_WARNING_SAMPLE_SIZE_THRESHOLD * 2) {
            ui_helpers.showToast(`Warnung: Sehr kleine Fallzahl (N=${filteredData.length}) im Kollektiv '${getKollektivDisplayName(currentKollektivName)}'. Ergebnisse der Brute-Force-Optimierung könnten instabil sein.`, "warning", 6000);
        }


        currentRunConfig = {
            targetMetric,
            kollektivName,
            nGesamt: filteredData.length,
            nPlus: filteredData.filter(p => p.n === '+').length,
            nMinus: filteredData.filter(p => p.n === '-').length
        };

        currentProgressData = {
             kollektiv: currentKollektivName,
             metric: targetMetric,
             nGesamt: currentRunConfig.nGesamt,
             nPlus: currentRunConfig.nPlus,
             nMinus: currentRunConfig.nMinus
        };


        if (onUpdateCallback) onUpdateCallback('start', currentProgressData);

        workerInstance.postMessage({
            type: 'start',
            payload: {
                data: filteredData,
                t2CriteriaSettings: cloneDeep(APP_CONFIG.T2_CRITERIA_SETTINGS),
                metric: targetMetric,
                kollektivName: currentKollektivName,
                defaultT2Logic: APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC
            }
        });
        isRunning = true;
        if (mainAppInterfaceRef && typeof mainAppInterfaceRef.setUIInteraction === 'function') {
            mainAppInterfaceRef.setUIInteraction(false);
        }
    }

    function cancelBruteForce() {
        if (workerInstance && isRunning) {
            workerInstance.terminate();
            _initializeWorker();
            isRunning = false;
            currentProgressData = { message: 'Manuell abgebrochen.', kollektiv: currentRunConfig.kollektivName, metric: currentRunConfig.targetMetric, nGesamt: currentRunConfig.nGesamt, nPlus: currentRunConfig.nPlus, nMinus: currentRunConfig.nMinus };
            if (mainAppInterfaceRef && typeof mainAppInterfaceRef.setUIInteraction === 'function') {
                mainAppInterfaceRef.setUIInteraction(true);
            }
            if (onUpdateCallback) onUpdateCallback('cancelled', currentProgressData);
            ui_helpers.showToast("Brute-Force-Optimierung abgebrochen.", "info");
        }
    }

    function isWorkerAvailable() {
        return isWorkerReallyAvailable;
    }

    function getIsRunning() {
        return isRunning;
    }

    function getCurrentState() {
        if (isRunning && currentProgressData?.type === 'started') return 'started';
        if (isRunning && currentProgressData?.type === 'progress') return 'progress';
        if (!isRunning && currentProgressData?.type === 'complete') return 'result';
        if (!isRunning && currentProgressData?.type === 'cancelled') return 'cancelled';
        if (!isRunning && currentProgressData?.type === 'error') return 'error';
        return 'idle';
    }

    function getCurrentData() {
        return currentProgressData ? cloneDeep(currentProgressData) : null;
    }

    function getResultsForKollektiv(kollektivName) {
        return allKollektivResults[kollektivName] ? cloneDeep(allKollektivResults[kollektivName]) : null;
    }

    function getAllResults() {
        return cloneDeep(allKollektivResults);
    }

    function hasAnyResults() {
        return Object.keys(allKollektivResults).length > 0;
    }


    return Object.freeze({
        initialize,
        updateKollektivData,
        startBruteForce,
        cancelBruteForce,
        isWorkerAvailable,
        isRunning: getIsRunning,
        getCurrentState,
        getCurrentData,
        getResultsForKollektiv,
        getAllResults,
        hasAnyResults
    });

})();
