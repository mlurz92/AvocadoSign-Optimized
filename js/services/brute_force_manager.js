const bruteForceManager = (() => {
    let worker = null;
    let isRunningState = false;
    let currentKollektivRunning = null; // Stores the kollektiv ID for the currently running analysis
    let allKollektivResults = {}; // Stores the results per kollektiv

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
            // Terminate existing worker if any, to ensure a fresh start
            if (worker) {
                worker.terminate();
                worker = null;
            }
            // Create a new worker instance
            worker = new Worker(APP_CONFIG.PATHS.BRUTE_FORCE_WORKER);
            // Assign event handlers
            worker.onmessage = handleWorkerMessage;
            worker.onerror = handleWorkerError;
            worker.onmessageerror = (e) => {
                console.error("BruteForceManager: Worker messageerror:", e);
                if (onErrorCallback) onErrorCallback({ message: 'Worker-Kommunikationsfehler (messageerror).' });
                 isRunningState = false;
                 currentKollektivRunning = null;
                 worker = null; // Invalidate worker if it encounters a message error
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
                currentKollektivRunning = payload?.kollektiv || currentKollektivRunning; // Update kollektiv in case it was not set before
                if (onStartedCallback) onStartedCallback(payload);
                break;
            case 'progress':
                if (isRunningState && onProgressCallback) onProgressCallback(payload);
                break;
            case 'result':
                isRunningState = false;
                const resultKollektiv = payload?.kollektiv || currentKollektivRunning;
                if (resultKollektiv && payload && payload.bestResult) {
                    allKollektivResults[resultKollektiv] = cloneDeep(payload); // Store results
                } else {
                    console.warn("BruteForceManager: Unvollständiges Ergebnis vom Worker, Kollektiv-Info fehlt oder kein bestResult. Payload:", payload, "CurrentKollektivRunning:", currentKollektivRunning);
                }
                currentKollektivRunning = null; // Reset running kollektiv
                if (onResultCallback) onResultCallback(payload);
                break;
            case 'cancelled':
                isRunningState = false;
                const cancelledKollektiv = payload?.kollektiv || currentKollektivRunning;
                console.log(`BruteForceManager: Analyse für Kollektiv '${cancelledKollektiv}' abgebrochen.`);
                currentKollektivRunning = null; // Reset running kollektiv
                if (onCancelledCallback) onCancelledCallback(payload);
                break;
            case 'error':
                isRunningState = false;
                const errorKollektiv = payload?.kollektiv || currentKollektivRunning;
                console.error(`BruteForceManager: Fehler vom Worker für Kollektiv '${errorKollektiv}':`, payload?.message);
                currentKollektivRunning = null; // Reset running kollektiv
                if (onErrorCallback) onErrorCallback(payload);
                break;
            default:
                console.warn(`BruteForceManager: Unbekannter Nachrichtentyp vom Worker: ${type}`, payload);
        }
    }

    function handleWorkerError(error) {
        console.error("BruteForceManager: Globaler Fehler im Brute Force Worker:", error);
        isRunningState = false;
        const erroredKollektiv = currentKollektivRunning; // Capture kollektiv before resetting
        currentKollektivRunning = null;
        if (onErrorCallback) onErrorCallback({ message: error.message || 'Unbekannter Worker-Fehler', kollektiv: erroredKollektiv });
        worker = null; // Invalidate worker on global error
    }

    function setCallbacks(callbacks = {}) {
        onProgressCallback = callbacks.onProgress || null;
        onResultCallback = callbacks.onResult || null;
        onErrorCallback = callbacks.onError || null;
        onCancelledCallback = callbacks.onCancelled || null;
        onStartedCallback = callbacks.onStarted || null;
    }

    function init(callbacks = {}) {
        setCallbacks(callbacks); // Set initial callbacks
        allKollektivResults = {}; // Clear previous results on init
        currentKollektivRunning = null; // Ensure no stale running state
        isRunningState = false;
        return initializeWorker(); // Try to initialize worker
    }

    function startAnalysis(data, metric, kollektiv) {
        if (isRunningState) {
            console.warn("BruteForceManager: Analyse läuft bereits. Startanfrage ignoriert.");
            if (onErrorCallback) onErrorCallback({ message: "Eine Optimierung läuft bereits.", kollektiv: kollektiv });
            return false;
        }
        // Ensure worker is available or try to initialize it
        if (!worker) {
            const workerInitialized = initializeWorker();
            if (!workerInitialized) {
                console.error("BruteForceManager: Worker nicht verfügbar und konnte nicht initialisiert werden. Start abgebrochen.");
                if (onErrorCallback) onErrorCallback({ message: "Worker nicht verfügbar und Initialisierung fehlgeschlagen.", kollektiv: kollektiv });
                return false;
            }
        }
        if (!data || data.length === 0) {
            console.warn("BruteForceManager: Keine Daten für die Analyse übergeben.");
             if (onErrorCallback) onErrorCallback({ message: "Keine Daten für Optimierung übergeben.", kollektiv: kollektiv });
            return false;
        }

        currentKollektivRunning = kollektiv; // Store the kollektiv that started the analysis
        isRunningState = true; // Set running state before posting message

        worker.postMessage({
            action: 'start',
            payload: {
                data: data,
                metric: metric,
                kollektiv: kollektiv,
                t2SizeRange: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE // Pass size range from config
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
        return !!worker; // Returns true if worker object exists, false otherwise
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
        terminateWorker,
        setCallbacks,
        // Expose currentKollektivRunning for debugging/status display if needed by controllers
        get currentKollektivRunning() { return currentKollektivRunning; }
    });
})();
