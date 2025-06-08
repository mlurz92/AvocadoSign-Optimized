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

    function _handleWorkerMessage(event) {
        if (!event || !event.data) {
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
                if (resultKollektiv && payload && payload.bestResult) {
                    allKollektivResults[resultKollektiv] = utils.cloneDeep(payload);
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
                break;
        }
    }

    function _handleWorkerError(error) {
        isRunningState = false;
        const erroredKollektiv = currentKollektivRunning;
        currentKollektivRunning = null;
        if (onErrorCallback) onErrorCallback({ message: error.message || 'Unbekannter Worker-Fehler', kollektiv: erroredKollektiv });
        worker = null;
    }

    function _initializeWorker() {
        if (!window.Worker) {
            if (onErrorCallback) onErrorCallback({ message: 'Web Worker nicht unterstützt.' });
            return false;
        }
        try {
            if (worker) {
                worker.terminate();
                worker = null;
            }
            worker = new Worker(APP_CONFIG.PATHS.BRUTE_FORCE_WORKER);
            worker.onmessage = _handleWorkerMessage;
            worker.onerror = _handleWorkerError;
            return true;
        } catch (e) {
            worker = null;
            if (onErrorCallback) onErrorCallback({ message: `Worker-Initialisierungsfehler: ${e.message}` });
            return false;
        }
    }

    function init(callbacks = {}) {
        onProgressCallback = callbacks.onProgress || null;
        onResultCallback = callbacks.onResult || null;
        onErrorCallback = callbacks.onError || null;
        onCancelledCallback = callbacks.onCancelled || null;
        onStartedCallback = callbacks.onStarted || null;
        allKollektivResults = {};
        return _initializeWorker();
    }

    function startAnalysis(data, metric, kollektiv) {
        if (isRunningState) {
            if (onErrorCallback) onErrorCallback({ message: "Eine Optimierung läuft bereits.", kollektiv: kollektiv });
            return false;
        }
        if (!worker) {
            const workerInitialized = _initializeWorker();
            if (!workerInitialized) {
                if (onErrorCallback) onErrorCallback({ message: "Worker nicht verfügbar und Initialisierung fehlgeschlagen.", kollektiv: kollektiv });
                return false;
            }
        }
        if (!data || data.length === 0) {
             if (onErrorCallback) onErrorCallback({ message: "Keine Daten für Optimierung übergeben.", kollektiv: kollektiv });
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
        return allKollektivResults[kollektivId] ? utils.cloneDeep(allKollektivResults[kollektivId]) : null;
    }

    function getAllResults() {
        return utils.cloneDeep(allKollektivResults);
    }

    function isRunning() {
        return isRunningState;
    }

    function isWorkerAvailable() {
        return !!worker;
    }

    return Object.freeze({
        init,
        startAnalysis,
        cancelAnalysis,
        getResultsForKollektiv,
        getAllResults,
        isRunning,
        isWorkerAvailable
    });
})();
