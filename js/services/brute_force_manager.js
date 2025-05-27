const bruteForceManager = (() => {
    let worker = null;
    let isRunningState = false;
    let currentKollektivRunning = null;
    let allKollektivResults = {};

    let onProgressCallback = null;
    let onResultCallback = null;
    let onErrorCallback = null;
    let onCancelledCallback = null;
    let onStartedCallback = null;

    function initializeWorker() {
        if (!window.Worker) {
            console.error("BruteForceManager: Web Worker nicht unterstützt.");
            if (onErrorCallback) onErrorCallback({ message: 'Web Worker nicht unterstützt.' });
            return false;
        }
        try {
            if (worker) {
                worker.terminate();
            }
            worker = new Worker(APP_CONFIG.PATHS.BRUTE_FORCE_WORKER);
            worker.onmessage = handleWorkerMessage;
            worker.onerror = handleWorkerError;
            worker.onmessageerror = (e) => {
                console.error("BruteForceManager: Worker messageerror:", e);
                if (onErrorCallback) onErrorCallback({ message: 'Worker-Kommunikationsfehler (messageerror).' });
            };
            console.log("BruteForceManager: Worker erfolgreich initialisiert.");
            return true;
        } catch (e) {
            console.error("BruteForceManager: Fehler bei der Worker-Initialisierung:", e);
            worker = null;
            if (onErrorCallback) onErrorCallback({ message: `Worker-Initialisierungsfehler: ${e.message}` });
            return false;
        }
    }

    function handleWorkerMessage(event) {
        if (!event || !event.data) {
            console.warn("BruteForceManager: Ungültige Nachricht vom Worker empfangen.");
            return;
        }
        const { type, payload } = event.data;

        switch (type) {
            case 'started':
                isRunningState = true;
                if (onStartedCallback) onStartedCallback(payload);
                break;
            case 'progress':
                if (isRunningState && onProgressCallback) onProgressCallback(payload);
                break;
            case 'result':
                isRunningState = false;
                if (payload && payload.kollektiv && payload.bestResult) {
                    allKollektivResults[payload.kollektiv] = cloneDeep(payload); // payload now includes nGesamt, nPlus, nMinus
                } else if (payload && currentKollektivRunning && payload.bestResult) {
                    allKollektivResults[currentKollektivRunning] = cloneDeep(payload);
                     console.warn("BruteForceManager: Ergebnis vom Worker ohne Kollektiv-Info, verwende currentKollektivRunning:", currentKollektivRunning);
                } else {
                    console.warn("BruteForceManager: Unvollständiges Ergebnis vom Worker, Kollektiv-Info fehlt oder kein bestResult.");
                }
                currentKollektivRunning = null;
                if (onResultCallback) onResultCallback(payload);
                break;
            case 'cancelled':
                isRunningState = false;
                currentKollektivRunning = null;
                if (onCancelledCallback) onCancelledCallback(payload);
                break;
            case 'error':
                isRunningState = false;
                currentKollektivRunning = null;
                if (onErrorCallback) onErrorCallback(payload);
                break;
            default:
                console.warn(`BruteForceManager: Unbekannter Nachrichtentyp vom Worker: ${type}`);
        }
    }

    function handleWorkerError(error) {
        console.error("BruteForceManager: Fehler im Brute Force Worker:", error);
        isRunningState = false;
        currentKollektivRunning = null;
        if (onErrorCallback) onErrorCallback({ message: error.message || 'Unbekannter Worker-Fehler' });
        worker = null;
    }

    function init(callbacks = {}) {
        onProgressCallback = callbacks.onProgress || null;
        onResultCallback = callbacks.onResult || null;
        onErrorCallback = callbacks.onError || null;
        onCancelledCallback = callbacks.onCancelled || null;
        onStartedCallback = callbacks.onStarted || null;
        allKollektivResults = {};
        return initializeWorker();
    }

    function startAnalysis(data, metric, kollektiv) {
        if (isRunningState) {
            console.warn("BruteForceManager: Analyse läuft bereits. Startanfrage ignoriert.");
            if (onErrorCallback) onErrorCallback({ message: "Eine Optimierung läuft bereits."});
            return false;
        }
        if (!worker) {
            console.error("BruteForceManager: Worker nicht verfügbar. Start abgebrochen.");
            if (onErrorCallback) onErrorCallback({ message: "Worker nicht verfügbar."});
            return false;
        }
        if (!data || data.length === 0) {
            console.warn("BruteForceManager: Keine Daten für die Analyse übergeben.");
             if (onErrorCallback) onErrorCallback({ message: "Keine Daten für Optimierung übergeben."});
            return false;
        }

        currentKollektivRunning = kollektiv;
        isRunningState = true;

        worker.postMessage({
            action: 'start',
            payload: {
                data: data,
                metric: metric,
                kollektiv: kollektiv,
                t2SizeRange: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE
            }
        });
        console.log(`BruteForceManager: Analyse gestartet für Kollektiv '${kollektiv}' mit Metrik '${metric}'.`);
        return true;
    }

    function cancelAnalysis() {
        if (!isRunningState || !worker) {
            console.warn("BruteForceManager: Keine laufende Analyse zum Abbrechen oder Worker nicht verfügbar.");
            return false;
        }
        worker.postMessage({ action: 'cancel' });
        console.log("BruteForceManager: Abbruchanfrage an Worker gesendet.");
        return true;
    }

    function getResultsForKollektiv(kollektivId) {
        return allKollektivResults[kollektivId] ? cloneDeep(allKollektivResults[kollektivId]) : null;
    }

    function getAllResults() {
        return cloneDeep(allKollektivResults);
    }

    function isAnalysisRunning() {
        return isRunningState;
    }

    function isWorkerAvailable() {
        return !!worker;
    }

    function terminateWorker() {
        if (worker) {
            worker.terminate();
            worker = null;
            isRunningState = false;
            currentKollektivRunning = null;
            console.log("BruteForceManager: Worker terminiert.");
        }
    }

    return Object.freeze({
        init,
        startAnalysis,
        cancelAnalysis,
        getResultsForKollektiv,
        getAllResults,
        isRunning: isAnalysisRunning,
        isWorkerAvailable,
        terminateWorker
    });
})();
