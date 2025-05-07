const bruteForceManager = (() => {
    let worker = null;
    let isOptimizing = false;
    let currentKollektivForWorker = null;
    let currentMetricForWorker = null;
    let lastResults = null;

    function initializeWorker() {
        if (!window.Worker) {
            ui_helpers.showToast("Web Worker werden von diesem Browser nicht unterstützt. Brute-Force-Optimierung ist nicht verfügbar.", "danger");
            ui_helpers.updateBruteForceUI('error', { message: 'Web Worker nicht unterstützt' }, false, state.getCurrentKollektiv());
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
                console.error("BruteForceManager: Nachricht vom Worker konnte nicht deserialisiert werden.", e);
                ui_helpers.showToast("Kommunikationsfehler mit Hintergrundprozess.", "warning");
            };
            return true;
        } catch (error) {
            console.error("BruteForceManager: Fehler beim Initialisieren des Web Workers:", error);
            ui_helpers.showToast("Initialisierung des Hintergrundprozesses fehlgeschlagen.", "danger");
            ui_helpers.updateBruteForceUI('error', { message: 'Worker-Initialisierung fehlgeschlagen' }, false, state.getCurrentKollektiv());
            worker = null;
            return false;
        }
    }

    function startOptimization(data, metric, kollektiv, t2SizeRangeConfig) {
        if (isOptimizing) {
            ui_helpers.showToast("Optimierung läuft bereits.", "info");
            return;
        }
        if (!worker) {
            if (!initializeWorker()) {
                return;
            }
        }
        if (!data || data.length === 0) {
            ui_helpers.showToast("Keine Daten für die Optimierung vorhanden.", "warning");
            return;
        }

        isOptimizing = true;
        currentKollektivForWorker = kollektiv;
        currentMetricForWorker = metric;
        lastResults = null;

        ui_helpers.updateBruteForceUI('start', { metric: metric, kollektiv: kollektiv }, true, kollektiv);
        const workerPayload = {
            data: data.map(p => ({ nr: p.nr, n: p.n, lymphknoten_t2: p.lymphknoten_t2 })),
            metric: metric,
            kollektiv: kollektiv,
            t2SizeRange: t2SizeRangeConfig || APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE
        };
        worker.postMessage({ action: 'start', payload: workerPayload });
    }

    function cancelOptimization() {
        if (!isOptimizing || !worker) {
            ui_helpers.showToast("Keine laufende Optimierung zum Abbrechen.", "info");
            return;
        }
        worker.postMessage({ action: 'cancel' });
    }

    function handleWorkerMessage(event) {
        if (!event.data || !event.data.type) {
            console.warn("BruteForceManager: Ungültige Nachricht vom Worker empfangen.", event.data);
            return;
        }
        const { type, payload } = event.data;
        const displayKollektiv = payload?.kollektiv || currentKollektivForWorker || state.getCurrentKollektiv();
        const displayMetric = payload?.metric || currentMetricForWorker || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;

        switch (type) {
            case 'started':
                ui_helpers.updateBruteForceUI('started', { ...payload, metric: displayMetric }, true, displayKollektiv, studyT2CriteriaManager.formatCriteriaForDisplay);
                break;
            case 'progress':
                ui_helpers.updateBruteForceUI('progress', { ...payload, metric: displayMetric }, true, displayKollektiv, studyT2CriteriaManager.formatCriteriaForDisplay);
                break;
            case 'result':
                isOptimizing = false;
                lastResults = payload;
                ui_helpers.updateBruteForceUI('result', payload, true, displayKollektiv, studyT2CriteriaManager.formatCriteriaForDisplay);
                if (payload && payload.results && payload.results.length > 0) {
                    const modalBody = document.querySelector('#brute-force-modal .modal-body');
                    if (modalBody) {
                        modalBody.innerHTML = uiComponents.createBruteForceModalContent(payload.results, payload.metric, payload.kollektiv, payload.duration, payload.totalTested);
                        ui_helpers.initializeTooltips(modalBody);
                    }
                    ui_helpers.showToast("Brute-Force-Optimierung abgeschlossen.", "success");
                } else {
                    ui_helpers.showToast("Optimierung ohne valide Ergebnisse abgeschlossen.", "warning");
                }
                if (typeof auswertungTabLogic !== 'undefined' && typeof auswertungTabLogic.updateLastBruteForceResults === 'function') {
                     auswertungTabLogic.updateLastBruteForceResults(lastResults);
                }
                break;
            case 'cancelled':
                isOptimizing = false;
                ui_helpers.updateBruteForceUI('cancelled', {}, true, displayKollektiv, studyT2CriteriaManager.formatCriteriaForDisplay);
                ui_helpers.showToast("Optimierung abgebrochen.", "warning");
                break;
            case 'error':
                isOptimizing = false;
                ui_helpers.showToast(`Fehler bei Optimierung: ${payload.message || 'Unbekannt'}`, "danger");
                ui_helpers.updateBruteForceUI('error', payload, true, displayKollektiv, studyT2CriteriaManager.formatCriteriaForDisplay);
                break;
            default:
                console.warn("BruteForceManager: Unbekannter Nachrichtentyp vom Worker:", type, payload);
        }
    }

    function handleWorkerError(error) {
        console.error("BruteForceManager: Fehler im Web Worker:", error);
        isOptimizing = false;
        ui_helpers.showToast("Schwerwiegender Fehler im Hintergrundprozess.", "danger");
        ui_helpers.updateBruteForceUI('error', { message: error.message || "Unbekannter Worker-Fehler" }, false, state.getCurrentKollektiv());
        worker = null;
    }

    function getLastResults() {
        return lastResults ? cloneDeep(lastResults) : null;
    }

    function isWorkerAvailable() {
        return !!worker;
    }

    return Object.freeze({
        initializeWorker,
        startOptimization,
        cancelOptimization,
        getLastResults,
        isWorkerAvailable
    });
})();