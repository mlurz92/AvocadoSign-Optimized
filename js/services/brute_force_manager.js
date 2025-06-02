const bruteForceManager = (() => {
    let _worker = null;
    let _isWorkerAvailable = false;
    let _isOptimizationRunning = false;
    let _currentOptimizationJob = null;
    let _mainAppInterface = null;

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
        _isWorkerAvailable = false;
        _isOptimizationRunning = false;
        _currentOptimizationJob = null;

        if (typeof Worker !== 'undefined') {
            try {
                const workerPath = APP_CONFIG.WORKER_PATHS.BRUTE_FORCE;
                if (!workerPath) {
                    throw new Error("Worker path for Brute-Force is not defined in APP_CONFIG.");
                }
                _worker = new Worker(workerPath);
                _isWorkerAvailable = true; 

                _worker.onmessage = (e) => {
                    const { type, payload, error, message } = e.data;
                    const uiHelpers = _mainAppInterface.getUiHelpers();
                    const appState = _mainAppInterface.getState();

                    switch (type) {
                        case 'initialized':
                            _isWorkerAvailable = true;
                            _isOptimizationRunning = false;
                            if (uiHelpers && typeof uiHelpers.updateBruteForceUI === 'function') {
                                uiHelpers.updateBruteForceUI('idle', 0, 0, '', null, appState.getCurrentKollektiv());
                            }
                            console.info("Brute-Force Worker erfolgreich initialisiert.");
                            break;
                        case 'started':
                             _isOptimizationRunning = true;
                             if (uiHelpers && typeof uiHelpers.updateBruteForceUI === 'function' && _currentOptimizationJob) {
                                uiHelpers.updateBruteForceUI('running', 0, payload.totalCombinations || 0, _currentOptimizationJob.metric, null, _currentOptimizationJob.kollektiv);
                             }
                             if (appState && typeof appState.setBruteForceStatus === 'function') {
                                 appState.setBruteForceStatus('running', { 
                                     kollektiv: _currentOptimizationJob?.kollektiv, 
                                     metric: _currentOptimizationJob?.metric,
                                     progress: 0,
                                     totalCombinations: payload.totalCombinations || 0,
                                     startTime: Date.now()
                                 });
                             }
                            break;
                        case 'progress':
                            if (uiHelpers && typeof uiHelpers.updateBruteForceUI === 'function' && _currentOptimizationJob) {
                                uiHelpers.updateBruteForceUI('running', payload.testedCount, payload.totalCombinations, _currentOptimizationJob.metric, payload.currentBestResult, _currentOptimizationJob.kollektiv);
                            }
                             if (appState && typeof appState.setBruteForceStatus === 'function') {
                                 const currentStatus = appState.getBruteForceResults() || {};
                                 appState.setBruteForceStatus('running', { 
                                     ...currentStatus,
                                     progress: payload.testedCount,
                                     totalCombinations: payload.totalCombinations,
                                     currentBestResult: payload.currentBestResult
                                 });
                             }
                            break;
                        case 'completed':
                            _isOptimizationRunning = false;
                            if (appState && typeof appState.setBruteForceResults === 'function') {
                                appState.setBruteForceResults(payload);
                            }
                            if (uiHelpers && typeof uiHelpers.updateBruteForceUI === 'function' && _currentOptimizationJob) {
                                uiHelpers.updateBruteForceUI('completed', payload.totalTested, payload.totalTested, _currentOptimizationJob.metric, payload.bestResult, _currentOptimizationJob.kollektiv, payload);
                            }
                            _currentOptimizationJob = null;
                            break;
                        case 'error':
                            _isOptimizationRunning = false;
                            console.error('Brute-Force Worker Fehler:', error, message, payload);
                            if (uiHelpers && typeof uiHelpers.showToast === 'function') {
                                uiHelpers.showToast(`Brute-Force Fehler: ${message || error || 'Unbekannter Fehler'}`, 'error');
                            }
                            if (uiHelpers && typeof uiHelpers.updateBruteForceUI === 'function') {
                                uiHelpers.updateBruteForceUI('error', 0, 0, _currentOptimizationJob?.metric, message || error || 'Fehler im Worker.', _currentOptimizationJob?.kollektiv);
                            }
                             if (appState && typeof appState.setBruteForceStatus === 'function') {
                                 appState.setBruteForceStatus('error', { error: message || error, kollektiv: _currentOptimizationJob?.kollektiv, metric: _currentOptimizationJob?.metric });
                             }
                            _currentOptimizationJob = null;
                            break;
                        case 'cancelled':
                            _isOptimizationRunning = false;
                            if (uiHelpers && typeof uiHelpers.updateBruteForceUI === 'function' && _currentOptimizationJob) {
                                uiHelpers.updateBruteForceUI('cancelled', payload?.testedCount || 0, payload?.totalCombinations || 0, _currentOptimizationJob.metric, null, _currentOptimizationJob.kollektiv);
                            }
                            if (appState && typeof appState.setBruteForceStatus === 'function') {
                                 appState.setBruteForceStatus('cancelled', { kollektiv: _currentOptimizationJob?.kollektiv, metric: _currentOptimizationJob?.metric });
                            }
                            if (appState && typeof appState.clearBruteForceResults === 'function') {
                                appState.clearBruteForceResults();
                            }
                            if (uiHelpers && typeof uiHelpers.showToast === 'function') {
                                uiHelpers.showToast('Brute-Force Optimierung abgebrochen.', 'info');
                            }
                            _currentOptimizationJob = null;
                            break;
                        default:
                            console.warn('Unbekannte Nachricht vom Brute-Force Worker:', e.data);
                    }
                };

                _worker.onerror = (err) => {
                    _isWorkerAvailable = false;
                    _isOptimizationRunning = false;
                    console.error('Fehler beim Initialisieren des Brute-Force Workers:', err.message, err);
                    if (_mainAppInterface && _mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().showToast === 'function') {
                        _mainAppInterface.getUiHelpers().showToast(`Kritischer Fehler: Brute-Force Worker konnte nicht geladen werden. Pfad: ${workerPath}. Fehler: ${err.message}. Weitere Details in der Konsole.`, 'error', 10000);
                    }
                    if (_mainAppInterface && _mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().updateBruteForceUI === 'function') {
                         _mainAppInterface.getUiHelpers().updateBruteForceUI('error',0,0,'','Worker nicht geladen/Fehler.');
                    }
                     if (_mainAppInterface && _mainAppInterface.getState() && typeof _mainAppInterface.getState().setBruteForceStatus === 'function') {
                        _mainAppInterface.getState().setBruteForceStatus('error', { error: 'Worker konnte nicht geladen werden.', fatal: true });
                     }
                    _currentOptimizationJob = null;
                };
                
                _worker.postMessage({ type: 'initialize', payload: { appConfig: APP_CONFIG } });


            } catch (error) {
                _isWorkerAvailable = false;
                console.error("Fehler bei der Erstellung des Brute-Force Workers:", error);
                 if (_mainAppInterface && _mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().showToast === 'function') {
                    _mainAppInterface.getUiHelpers().showToast(`Fehler bei Worker-Erstellung: ${error.message}`, 'error', 10000);
                }
                if (_mainAppInterface && _mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().updateBruteForceUI === 'function') {
                    _mainAppInterface.getUiHelpers().updateBruteForceUI('error',0,0,'','Worker nicht erstellt.');
                }
            }
        } else {
            _isWorkerAvailable = false;
            console.warn("Web Workers werden von diesem Browser nicht unterstützt.");
            if (_mainAppInterface && _mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().showToast === 'function') {
                _mainAppInterface.getUiHelpers().showToast("Web Workers nicht unterstützt. Brute-Force nicht verfügbar.", "warning", 8000);
            }
        }
    }

    function isWorkerAvailable() {
        return _isWorkerAvailable;
    }

    function isOptimizationRunning() {
        return _isOptimizationRunning;
    }

    function startOptimization(kollektiv, metric, rawData) {
        if (!_isWorkerAvailable) {
            console.error("Brute-Force Worker ist nicht verfügbar. Optimierung kann nicht gestartet werden.");
            if (_mainAppInterface && _mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().showToast === 'function') {
                _mainAppInterface.getUiHelpers().showToast('Brute-Force Optimierung nicht möglich: Worker nicht bereit.', 'error');
            }
            return false;
        }
        if (_isOptimizationRunning) {
            console.warn("Eine Brute-Force-Optimierung läuft bereits.");
             if (_mainAppInterface && _mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().showToast === 'function') {
                _mainAppInterface.getUiHelpers().showToast('Optimierung läuft bereits.', 'info');
            }
            return false;
        }

        _isOptimizationRunning = true; 
        _currentOptimizationJob = { kollektiv, metric, startTime: Date.now() };

        try {
            const clonedData = cloneDeep(rawData);
            const allLiteratures = (typeof studyT2CriteriaManager !== 'undefined' && typeof studyT2CriteriaManager.getAllStudyCriteriaSets === 'function') 
                                    ? studyT2CriteriaManager.getAllStudyCriteriaSets(false) 
                                    : [];
            const payloadForWorker = {
                kollektiv,
                metric,
                rawData: clonedData,
                t2CriteriaSettings: APP_CONFIG.T2_CRITERIA_SETTINGS,
                allT2Literatures: allLiteratures,
                appConfig: { 
                    PERFORMANCE_SETTINGS: APP_CONFIG.PERFORMANCE_SETTINGS,
                    STATISTICAL_CONSTANTS: APP_CONFIG.STATISTICAL_CONSTANTS
                }
            };
            _worker.postMessage({ type: 'start', payload: payloadForWorker });
            console.info(`Brute-Force Optimierung gestartet für Kollektiv '${kollektiv}' mit Metrik '${metric}'.`);
            return true;

        } catch (error) {
            _isOptimizationRunning = false;
            _currentOptimizationJob = null;
            console.error("Fehler beim Vorbereiten oder Senden der Startnachricht an den Brute-Force Worker:", error);
             if (_mainAppInterface && _mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().showToast === 'function') {
                _mainAppInterface.getUiHelpers().showToast(`Fehler beim Start der Optimierung: ${error.message}`, 'error');
            }
            if (_mainAppInterface && _mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().updateBruteForceUI === 'function') {
                _mainAppInterface.getUiHelpers().updateBruteForceUI('error',0,0,metric,'Startfehler',kollektiv);
            }
            return false;
        }
    }

    function cancelOptimization() {
        if (_isOptimizationRunning && _worker) {
            _worker.postMessage({ type: 'cancel' });
            console.info("Abbruchanforderung an Brute-Force Worker gesendet.");
        } else {
            console.warn("Keine laufende Optimierung zum Abbrechen oder Worker nicht verfügbar.");
            _isOptimizationRunning = false; 
             if (_mainAppInterface && _mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().updateBruteForceUI === 'function' && _currentOptimizationJob) {
                _mainAppInterface.getUiHelpers().updateBruteForceUI('cancelled', 0, 0, _currentOptimizationJob.metric, null, _currentOptimizationJob.kollektiv);
             } else if (_mainAppInterface && _mainAppInterface.getUiHelpers()) {
                 _mainAppInterface.getUiHelpers().updateBruteForceUI('idle');
             }
            _currentOptimizationJob = null;
        }
    }
    
    function getCurrentOptimizationJobDetails() {
        return cloneDeep(_currentOptimizationJob);
    }

    return Object.freeze({
        initialize,
        isWorkerAvailable,
        isOptimizationRunning,
        startOptimization,
        cancelOptimization,
        getCurrentOptimizationJobDetails
    });

})();
