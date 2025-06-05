const bruteForceManager = (() => {
    let worker = null;
    let isRunningState = false;
    let currentKollektivRunning = null;
    let allKollektivResults = {};

    function initializeWorker() {
        if (!window.Worker) {
            console.error("BruteForceManager: Web Worker nicht unterstützt.");
            document.dispatchEvent(new CustomEvent('bruteForceUpdate', { detail: { status: 'error', error: 'Web Worker nicht unterstützt.' } }));
            return false;
        }
        try {
            if (worker) {
                worker.terminate();
                worker = null;
            }
            worker = new Worker(APP_CONFIG.PATHS.BRUTE_FORCE_WORKER);
            worker.onmessage = handleWorkerMessage;
            worker.onerror = handleWorkerError;
            worker.onmessageerror = (e) => {
                console.error("BruteForceManager: Worker messageerror:", e);
                document.dispatchEvent(new CustomEvent('bruteForceUpdate', { detail: { status: 'error', error: 'Worker-Kommunikationsfehler (messageerror).', kollektiv: currentKollektivRunning } }));
                isRunningState = false;
                currentKollektivRunning = null;
                worker = null;
            };
            return true;
        } catch (e) {
            console.error("BruteForceManager: Fehler bei der Worker-Initialisierung:", e);
            worker = null;
            document.dispatchEvent(new CustomEvent('bruteForceUpdate', { detail: { status: 'error', error: `Worker-Initialisierungsfehler: ${e.message}`, kollektiv: currentKollektivRunning } }));
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
                currentKollektivRunning = payload?.kollektiv || currentKollektivRunning;
                document.dispatchEvent(new CustomEvent('bruteForceUpdate', { detail: { status: 'started', progress: { tested: 0, total: payload.totalCombinations }, kollektiv: payload.kollektiv } }));
                break;
            case 'progress':
                if (isRunningState) {
                    document.dispatchEvent(new CustomEvent('bruteForceUpdate', { detail: { status: 'running', progress: { tested: payload.tested, total: payload.total, currentBest: payload.currentBest, metric: payload.metric }, kollektiv: payload.kollektiv } }));
                }
                break;
            case 'result':
                isRunningState = false;
                const resultKollektiv = payload?.kollektiv || currentKollektivRunning;
                if (resultKollektiv && payload && payload.bestResult) {
                    allKollektivResults[resultKollektiv] = cloneDeep(payload);
                } else {
                    console.warn("BruteForceManager: Unvollständiges Ergebnis vom Worker, Kollektiv-Info fehlt oder kein bestResult. Payload:", payload, "CurrentKollektivRunning:", currentKollektivRunning);
                }
                currentKollektivRunning = null;
                document.dispatchEvent(new CustomEvent('bruteForceUpdate', { detail: { status: 'completed', result: payload, kollektiv: resultKollektiv } }));
                break;
            case 'cancelled':
                isRunningState = false;
                const cancelledKollektiv = payload?.kollektiv || currentKollektivRunning;
                currentKollektivRunning = null;
                document.dispatchEvent(new CustomEvent('bruteForceUpdate', { detail: { status: 'cancelled', kollektiv: cancelledKollektiv } }));
                break;
            case 'error':
                isRunningState = false;
                const errorKollektiv = payload?.kollektiv || currentKollektivRunning;
                currentKollektivRunning = null;
                document.dispatchEvent(new CustomEvent('bruteForceUpdate', { detail: { status: 'error', error: payload?.message, kollektiv: errorKollektiv } }));
                break;
            default:
                console.warn(`BruteForceManager: Unbekannter Nachrichtentyp vom Worker: ${type}`, payload);
        }
    }

    function handleWorkerError(error) {
        console.error("BruteForceManager: Globaler Fehler im Brute Force Worker:", error);
        isRunningState = false;
        const erroredKollektiv = currentKollektivRunning;
        currentKollektivRunning = null;
        document.dispatchEvent(new CustomEvent('bruteForceUpdate', { detail: { status: 'error', error: error.message || 'Unbekannter Worker-Fehler', kollektiv: erroredKollektiv } }));
        worker = null;
    }

    function init() {
        allKollektivResults = {};
        return initializeWorker();
    }

    function startAnalysis(data, metric, kollektiv) {
        if (isRunningState) {
            document.dispatchEvent(new CustomEvent('bruteForceUpdate', { detail: { status: 'error', error: "Eine Optimierung läuft bereits.", kollektiv: kollektiv } }));
            return false;
        }
        if (!worker) {
            const workerInitialized = initializeWorker();
            if (!workerInitialized) {
                document.dispatchEvent(new CustomEvent('bruteForceUpdate', { detail: { status: 'error', error: "Worker nicht verfügbar und Initialisierung fehlgeschlagen.", kollektiv: kollektiv } }));
                return false;
            }
        }
        if (!data || data.length === 0) {
            document.dispatchEvent(new CustomEvent('bruteForceUpdate', { detail: { status: 'error', error: "Keine Daten für Optimierung übergeben.", kollektiv: kollektiv } }));
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
        return true;
    }

    function cancelAnalysis() {
        if (!isRunningState || !worker) {
            return false;
        }
        worker.postMessage({ action: 'cancel' });
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
        }
    }
    
    function getCurrentProgress() {
        // This function is a placeholder for a more detailed progress tracking
        // if the worker sends more granular progress updates.
        // For now, the progress is sent directly via the 'progress' message type.
        return null;
    }

    return Object.freeze({
        init,
        startAnalysis,
        cancelAnalysis,
        getResultsForKollektiv,
        getAllResults,
        isRunning: isAnalysisRunning,
        isWorkerAvailable,
        terminateWorker,
        getCurrentProgress // Export this for completeness if needed elsewhere
    });
})();
