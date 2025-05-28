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
                worker = null;
            }
            worker = new Worker(APP_CONFIG.PATHS.BRUTE_FORCE_WORKER);
            worker.onmessage = handleWorkerMessage;
            worker.onerror = handleWorkerError;
            worker.onmessageerror = (e) => {
                console.error("BruteForceManager: Worker messageerror:", e);
                if (onErrorCallback) onErrorCallback({ message: 'Worker-Kommunikationsfehler (messageerror).' });
                 isRunningState = false;
                 currentKollektivRunning = null;
                 worker = null; // Set worker to null to allow re-initialization attempt
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
                currentKollektivRunning = payload?.kollektiv || currentKollektivRunning;
                if (onStartedCallback) onStartedCallback(payload);
                break;
            case 'progress':
                if (isRunningState && onProgressCallback) onProgressCallback(payload);
                break;
            case 'result':
                isRunningState = false;
                const resultKollektiv = payload?.kollektiv || currentKollektivRunning;
                if (resultKollektiv && payload && payload.bestResult && payload.results) {
                    // The payload from worker now contains the full 'metrics' object for each result.
                    // cloneDeep will correctly copy this richer structure.
                    allKollektivResults[resultKollektiv] = cloneDeep(payload);
                } else {
                    console.warn("BruteForceManager: Unvollständiges Ergebnis vom Worker. Payload:", payload, "CurrentKollektivRunning:", currentKollektivRunning);
                }
                currentKollektivRunning = null;
                if (onResultCallback) onResultCallback(payload);
                break;
            case 'cancelled':
                isRunningState = false;
                const cancelledKollektiv = payload?.kollektiv || currentKollektivRunning;
                console.log(`BruteForceManager: Analyse für Kollektiv '${cancelledKollektiv}' abgebrochen.`);
                currentKollektivRunning = null;
                if (onCancelledCallback) onCancelledCallback(payload);
                break;
            case 'error':
                isRunningState = false;
                const errorKollektiv = payload?.kollektiv || currentKollektivRunning;
                console.error(`BruteForceManager: Fehler vom Worker für Kollektiv '${errorKollektiv}':`, payload?.message);
                currentKollektivRunning = null;
                if (onErrorCallback) onErrorCallback(payload);
                // Worker might be in an unusable state, consider re-initializing or nullifying
                // worker = null; // Decided against auto-nullifying here to allow explicit re-init attempt
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
        if (onErrorCallback) onErrorCallback({ message: error.message || 'Unbekannter Worker-Fehler', kollektiv: erroredKollektiv });
        worker = null; // Worker is likely broken, set to null for re-initialization attempt.
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
        if (isRunningState) {
            console.warn("BruteForceManager: Analyse läuft bereits. Startanfrage ignoriert.");
            if (onErrorCallback) onErrorCallback({ message: "Eine Optimierung läuft bereits.", kollektiv: kollektiv });
            return false;
        }
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

        currentKollektivRunning = kollektiv;
        isRunningState = true; // Set running state immediately

        worker.postMessage({
            action: 'start',
            payload: {
                data: data, // Ensure data is properly structured for the worker
                metric: metric,
                kollektiv: kollektiv,
                t2SizeRange: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE // Ensure this is always passed
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
        // isRunningState will be set to false by the worker's 'cancelled' message
        console.log("BruteForceManager: Abbruchanfrage an Worker gesendet.");
        return true;
    }

    function getResultsForKollektiv(kollektivId) {
        // Returns a deep clone to prevent modification of stored results
        return allKollektivResults[kollektivId] ? cloneDeep(allKollektivResults[kollektivId]) : null;
    }

    function getAllResults() {
        // Returns a deep clone of all results
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

    // Expose cloneDeep for use by other modules if necessary, or keep it internal.
    // For now, assume it's primarily for internal use by the manager itself.
    function cloneDeep(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        try {
            if (typeof self !== 'undefined' && self.structuredClone) {
                return self.structuredClone(obj);
            } else {
                return JSON.parse(JSON.stringify(obj));
            }
        } catch(e) {
            console.error("BruteForceManager: Fehler beim Klonen, Fallback...", e, obj);
            if (Array.isArray(obj)) {
                const arrCopy = [];
                for(let i = 0; i < obj.length; i++){
                    arrCopy[i] = cloneDeep(obj[i]);
                }
                return arrCopy;
            }
            if (typeof obj === 'object') {
                const objCopy = {};
                for(const key in obj) {
                    if(Object.prototype.hasOwnProperty.call(obj, key)) {
                        objCopy[key] = cloneDeep(obj[key]);
                    }
                }
                return objCopy;
            }
            return obj;
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
