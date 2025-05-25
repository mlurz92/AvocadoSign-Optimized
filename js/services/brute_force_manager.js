const bruteForceManager = (() => {
    let worker = null;
    let isRunningState = false;
    let currentKollektivRunning = null;
    let allKollektivResults = {}; // Stores results per kollektivId

    let onProgressCallback = null;
    let onResultCallback = null;
    let onErrorCallback = null;
    let onCancelledCallback = null;
    let onStartedCallback = null;

    function initializeWorker() {
        if (!window.Worker) {
            console.error("BruteForceManager: Web Worker nicht unterstützt.");
            if (onErrorCallback) {
                const lang = typeof state !== 'undefined' ? state.getCurrentPublikationLang() : 'de';
                const errorMsg = lang === 'de' ? 'Web Worker nicht unterstützt.' : 'Web Workers not supported.';
                onErrorCallback({ message: errorMsg });
            }
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
                if (onErrorCallback) {
                    const lang = typeof state !== 'undefined' ? state.getCurrentPublikationLang() : 'de';
                    const errorMsg = lang === 'de' ? 'Worker-Kommunikationsfehler (messageerror).' : 'Worker communication error (messageerror).';
                    onErrorCallback({ message: errorMsg });
                }
                 isRunningState = false; // Ensure state is reset on message error
                 currentKollektivRunning = null;
            };
            return true;
        } catch (e) {
            console.error("BruteForceManager: Fehler bei der Worker-Initialisierung:", e);
            worker = null;
            if (onErrorCallback) {
                const lang = typeof state !== 'undefined' ? state.getCurrentPublikationLang() : 'de';
                const errorMsg = lang === 'de' ? `Worker-Initialisierungsfehler: ${e.message}` : `Worker initialization error: ${e.message}`;
                onErrorCallback({ message: errorMsg });
            }
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
                isRunningState = true; // isRunningState is correctly set here
                if (onStartedCallback) onStartedCallback(payload);
                break;
            case 'progress':
                if (isRunningState && onProgressCallback) onProgressCallback(payload);
                break;
            case 'result':
                isRunningState = false;
                if (payload && payload.kollektiv && payload.bestResult) {
                    allKollektivResults[payload.kollektiv] = cloneDeep(payload);
                } else if (payload && currentKollektivRunning && payload.bestResult) { // Fallback if worker doesn't send kollektiv
                    allKollektivResults[currentKollektivRunning] = cloneDeep(payload);
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
        if (onErrorCallback) {
            const lang = typeof state !== 'undefined' ? state.getCurrentPublikationLang() : 'de';
            const errorMsg = error.message || (lang === 'de' ? 'Unbekannter Worker-Fehler' : 'Unknown worker error');
            onErrorCallback({ message: errorMsg });
        }
        worker = null; 
    }

    function init(callbacks = {}) {
        onProgressCallback = callbacks.onProgress || null;
        onResultCallback = callbacks.onResult || null;
        onErrorCallback = callbacks.onError || null;
        onCancelledCallback = callbacks.onCancelled || null;
        onStartedCallback = callbacks.onStarted || null;
        allKollektivResults = {}; // Reset results on init
        return initializeWorker();
    }

    function startAnalysis(data, metric, kollektiv) {
        const lang = typeof state !== 'undefined' ? state.getCurrentPublikationLang() : 'de';
        if (isRunningState) {
            const errorMsg = lang === 'de' ? "Eine Optimierung läuft bereits." : "An optimization is already running.";
            console.warn("BruteForceManager: Analyse läuft bereits. Startanfrage ignoriert.");
            if (onErrorCallback) onErrorCallback({ message: errorMsg});
            return false;
        }
        if (!worker) {
            const errorMsg = lang === 'de' ? "Worker nicht verfügbar." : "Worker not available.";
            console.error("BruteForceManager: Worker nicht verfügbar. Start abgebrochen.");
            if (onErrorCallback) onErrorCallback({ message: errorMsg});
            return false;
        }
        if (!data || data.length === 0) {
            const errorMsg = lang === 'de' ? "Keine Daten für Optimierung übergeben." : "No data provided for optimization.";
            console.warn("BruteForceManager: Keine Daten für die Analyse übergeben.");
             if (onErrorCallback) onErrorCallback({ message: errorMsg});
            return false;
        }

        currentKollektivRunning = kollektiv;
        // isRunningState will be set to true by the 'started' message from the worker.
        // Setting it here prematurely might lead to race conditions if worker init fails immediately.
        // However, to prevent immediate re-starts, we can set a "pending start" flag or rely on the UI to disable start.
        // For simplicity here, we trust the worker will send 'started' or 'error'.
        // The UI handler should already disable the start button.

        worker.postMessage({
            action: 'start',
            payload: {
                data: data, // Ensure data is structured as the worker expects
                metric: metric,
                kollektiv: kollektiv,
                t2SizeRange: cloneDeep(APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE) // Pass a clone
            }
        });
        // isRunningState is set in 'started' handler.
        return true;
    }

    function cancelAnalysis() {
        if (!isRunningState || !worker) {
            console.warn("BruteForceManager: Keine laufende Analyse zum Abbrechen oder Worker nicht verfügbar.");
            return false;
        }
        worker.postMessage({ action: 'cancel' });
        // State (isRunningState, currentKollektivRunning) is reset in 'cancelled' or 'error' handlers
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
