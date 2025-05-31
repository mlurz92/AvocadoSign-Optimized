const bruteForceManager = (() => {
    let worker = null;
    let currentKollektivForRun = null;
    let currentMetricForRun = '';
    let startTimeForRun = null;
    let totalCombinationsForRun = 0;
    let testedCombinationsForRun = 0;
    let currentBestResultForRun = null;
    let allResultsForCurrentRun = []; 
    let currentRunId = null;

    let _allBruteForceResultsByKollektiv = {}; // Speichert die letzten Ergebnisse pro Kollektiv
    let _currentState = 'idle'; // idle, pending_init, running, cancelled, error, result

    let _onStartCallback = () => {};
    let _onStartedCallback = () => {};
    let _onProgressCallback = () => {};
    let _onResultCallback = () => {};
    let _onErrorCallback = () => {};
    let _onCancelledCallback = () => {};
    let _isInitializing = false;


    function initialize(callbacks) {
        if (_currentState !== 'idle' && _currentState !== 'error' && !_isInitializing) {
            console.warn("Brute-Force Manager ist bereits initialisiert oder beschäftigt.");
            if (_currentState === 'pending_init') return Promise.resolve(worker !== null); // Bereits in Initialisierung
            return Promise.resolve(worker !== null);
        }
        _isInitializing = true;
        _currentState = 'pending_init';

        return new Promise((resolve) => {
            if (typeof Worker !== 'undefined') {
                try {
                    if (worker) { // Falls ein alter Worker existiert (z.B. nach Fehler), terminieren
                        worker.terminate();
                        worker = null;
                    }
                    worker = new Worker(APP_CONFIG.PATHS.BRUTE_FORCE_WORKER);
                    worker.onmessage = _handleWorkerMessage;
                    worker.onerror = _handleWorkerError;

                    if (callbacks) {
                        _onStartCallback = callbacks.onStart || _onStartCallback;
                        _onStartedCallback = callbacks.onStarted || _onStartedCallback;
                        _onProgressCallback = callbacks.onProgress || _onProgressCallback;
                        _onResultCallback = callbacks.onResult || _onResultCallback;
                        _onErrorCallback = callbacks.onError || _onErrorCallback;
                        _onCancelledCallback = callbacks.onCancelled || _onCancelledCallback;
                    }
                    _currentState = 'idle';
                    _isInitializing = false;
                    console.log("Brute-Force Worker initialisiert.");
                    resolve(true);
                } catch (e) {
                    console.error("Fehler beim Initialisieren des Brute-Force Workers:", e);
                    worker = null;
                    _currentState = 'error';
                    _isInitializing = false;
                    _onErrorCallback({ message: `Worker-Initialisierungsfehler: ${e.message}` });
                    resolve(false);
                }
            } else {
                console.warn("Web Workers werden von diesem Browser nicht unterstützt.");
                _currentState = 'error';
                _isInitializing = false;
                _onErrorCallback({ message: "Web Workers nicht unterstützt." });
                resolve(false);
            }
        });
    }

    function _handleWorkerError(error) {
        console.error('Fehler vom Brute-Force Worker:', error.message, error);
        _currentState = 'error';
        _onErrorCallback({ message: error.message || "Unbekannter Worker-Fehler", filename: error.filename, lineno: error.lineno });
    }

    function _handleWorkerMessage(e) {
        if (!e.data || !e.data.type) {
            console.warn("Ungültige Nachricht vom Worker empfangen:", e.data);
            return;
        }
        
        // Ignoriere Nachrichten von einem alten Lauf, falls ein neuer gestartet wurde
        if (e.data.runId && e.data.runId !== currentRunId && e.data.type !== 'ready') {
            console.log("Nachricht von veraltetem Worker-Lauf ignoriert:", e.data.runId, "Aktuell:", currentRunId);
            return;
        }

        switch (e.data.type) {
            case 'ready':
                console.log("Brute-Force Worker ist bereit.");
                // Dieser Status wird intern gehandhabt, muss nicht unbedingt nach außen
                break;
            case 'started':
                totalCombinationsForRun = e.data.payload.totalCombinations;
                _currentState = 'running'; // Intern als 'running' setzen, obwohl extern als 'started' signalisiert
                _onStartedCallback({
                    totalCombinations: totalCombinationsForRun,
                    kollektiv: currentKollektivForRun,
                    metric: currentMetricForRun
                });
                break;
            case 'progress':
                testedCombinationsForRun = e.data.payload.testedCombinations;
                if (e.data.payload.currentBest) {
                    currentBestResultForRun = e.data.payload.currentBest;
                }
                _onProgressCallback({
                    tested: testedCombinationsForRun,
                    total: totalCombinationsForRun,
                    currentBest: currentBestResultForRun,
                    metric: currentMetricForRun,
                    kollektiv: currentKollektivForRun
                });
                break;
            case 'result':
                _currentState = 'result';
                const resultsPayload = e.data.payload;
                allResultsForCurrentRun = resultsPayload.results;
                currentBestResultForRun = resultsPayload.results[0] || null; // Das beste Ergebnis ist an Index 0
                const duration = performance.now() - startTimeForRun;

                const fullResultData = {
                    kollektiv: currentKollektivForRun,
                    metric: currentMetricForRun,
                    results: allResultsForCurrentRun,
                    bestResult: currentBestResultForRun,
                    duration: duration,
                    totalTested: testedCombinationsForRun, // Tatsächlich getestet
                    nGesamt: resultsPayload.nGesamt,
                    nPlus: resultsPayload.nPlus,
                    nMinus: resultsPayload.nMinus
                };
                _allBruteForceResultsByKollektiv[currentKollektivForRun] = fullResultData;
                _onResultCallback(fullResultData);
                break;
            case 'cancelled': // Vom Worker bestätigt
                if(_currentState === 'running') { // Nur wenn es wirklich lief
                     _currentState = 'cancelled';
                     _onCancelledCallback({kollektiv: currentKollektivForRun, metric: currentMetricForRun});
                }
                break;
            case 'error':
                _currentState = 'error';
                _onErrorCallback({ message: e.data.payload.message || "Unbekannter Fehler im Worker.", kollektiv: currentKollektivForRun, metric: currentMetricForRun });
                break;
            default:
                console.warn("Unbekannter Nachrichtentyp vom Worker:", e.data.type);
        }
    }

    async function startOptimization(data, kollektiv, metric) {
        if (_isInitializing) {
            ui_helpers.showToast("Brute-Force Manager initialisiert noch. Bitte kurz warten.", "info");
            return;
        }
        if (!worker && _currentState !== 'error') { // Versuche Re-Initialisierung wenn kein Worker da, aber auch kein permanenter Fehler
            console.log("Worker nicht vorhanden, versuche Re-Initialisierung...");
            const success = await initialize({}); // Re-Initialisiere mit Standard-Callbacks
            if (!success) {
                 ui_helpers.showToast("Brute-Force Worker konnte nicht initialisiert werden. Optimierung nicht möglich.", "danger");
                 return;
            }
        } else if (_currentState === 'error' && !worker) {
            ui_helpers.showToast("Brute-Force Worker ist in einem Fehlerzustand und nicht verfügbar.", "danger");
            return;
        }

        if (_currentState === 'running') {
            ui_helpers.showToast("Eine Brute-Force-Optimierung läuft bereits.", "warning");
            return;
        }
        if (!data || data.length === 0) {
            _onErrorCallback({ message: "Keine Daten für die Optimierung vorhanden." });
            return;
        }

        _currentState = 'start'; // Externer Status, intern wird es zu 'running' wenn der Worker 'started' sendet
        currentKollektivForRun = kollektiv;
        currentMetricForRun = metric;
        startTimeForRun = performance.now();
        testedCombinationsForRun = 0;
        totalCombinationsForRun = 0;
        currentBestResultForRun = null;
        allResultsForCurrentRun = [];
        currentRunId = generateUUID(); // Eindeutige ID für diesen Lauf

        _onStartCallback({ kollektiv: currentKollektivForRun, metric: currentMetricForRun });

        worker.postMessage({
            type: 'start',
            payload: {
                data: cloneDeep(data), // Stelle sicher, dass der Worker eine Kopie erhält
                metric: metric,
                runId: currentRunId,
                t2Settings: cloneDeep(APP_CONFIG.T2_CRITERIA_SETTINGS) // Worker braucht die möglichen Werte
            }
        });
    }

    function cancelOptimization() {
        if (_currentState === 'running' && worker) {
            worker.postMessage({ type: 'cancel', payload: {runId: currentRunId} });
            _currentState = 'cancelled'; // Setze lokal sofort, Worker bestätigt es später
            _onCancelledCallback({kollektiv: currentKollektivForRun, metric: currentMetricForRun});
            console.log("Brute-Force-Optimierung Abbruch angefordert.");
        } else {
            console.log("Keine laufende Optimierung zum Abbrechen oder Worker nicht aktiv.");
        }
    }
    
    function getResultsForCurrentRun() {
        return {
            kollektiv: currentKollektivForRun,
            metric: currentMetricForRun,
            results: cloneDeep(allResultsForCurrentRun),
            bestResult: cloneDeep(currentBestResultForRun),
            duration: (_currentState === 'result' && startTimeForRun) ? (performance.now() - startTimeForRun) : null,
            totalTested: testedCombinationsForRun
        };
    }
    
    function getAllResults() {
        return cloneDeep(_allBruteForceResultsByKollektiv);
    }

    function getBestResultForKollektiv(kollektivId) {
        return cloneDeep(_allBruteForceResultsByKollektiv[kollektivId]?.bestResult || null);
    }

    function getState() {
        return _currentState;
    }

    function hasResults(kollektivId) {
        return !!_allBruteForceResultsByKollektiv[kollektivId]?.results?.length;
    }
    
    function isWorkerAvailable() {
        return typeof Worker !== 'undefined' && worker !== null && _currentState !== 'error' && _currentState !== 'pending_init';
    }

    return Object.freeze({
        initialize,
        startOptimization,
        cancelOptimization,
        getResultsForCurrentRun, // Umbenannt für Klarheit
        getAllResults,
        getBestResultForKollektiv,
        getState,
        hasResults,
        isWorkerAvailable
    });
})();
