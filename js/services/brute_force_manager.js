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
                const appConfigSnapshot = _mainAppInterface.getStateSnapshot().appConfig;
                const workerPath = appConfigSnapshot.WORKER_PATHS.BRUTE_FORCE;

                if (!workerPath) {
                    throw new Error("Worker path for Brute-Force is not defined in APP_CONFIG.");
                }
                _worker = new Worker(workerPath);
                _isWorkerAvailable = true;

                _worker.onmessage = (e) => {
                    const { type, payload, error, message } = e.data;

                    switch (type) {
                        case 'initialized':
                            _isWorkerAvailable = true;
                            _isOptimizationRunning = false;
                            if (_mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().updateBruteForceUI === 'function') {
                                _mainAppInterface.getUiHelpers().updateBruteForceUI('idle', {}, _isWorkerAvailable, _mainAppInterface.getStateSnapshot().currentKollektiv);
                            }
                            console.info("Brute-Force Worker erfolgreich initialisiert.");
                            break;
                        case 'started':
                             _isOptimizationRunning = true;
                             if (_mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().updateBruteForceUI === 'function' && _currentOptimizationJob) {
                                _mainAppInterface.getUiHelpers().updateBruteForceUI('started', payload, _isWorkerAvailable, _currentOptimizationJob.kollektiv);
                             }
                             if (typeof _mainAppInterface.setBruteForceStatus === 'function') {
                                 _mainAppInterface.setBruteForceStatus('running', {
                                     kollektiv: _currentOptimizationJob?.kollektiv,
                                     metric: _currentOptimizationJob?.metric,
                                     progress: 0,
                                     totalCombinations: payload.totalCombinations || 0,
                                     startTime: Date.now()
                                 });
                             }
                            break;
                        case 'progress':
                            if (_mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().updateBruteForceUI === 'function' && _currentOptimizationJob) {
                                _mainAppInterface.getUiHelpers().updateBruteForceUI('progress', payload, _isWorkerAvailable, _currentOptimizationJob.kollektiv);
                            }
                             if (typeof _mainAppInterface.setBruteForceStatus === 'function') {
                                 const currentBfState = _mainAppInterface.getStateSnapshot().bruteForceResults || {};
                                 _mainAppInterface.setBruteForceStatus('running', {
                                     ...currentBfState,
                                     kollektiv: _currentOptimizationJob?.kollektiv || currentBfState.kollektiv,
                                     metric: _currentOptimizationJob?.metric || currentBfState.metric,
                                     progress: payload.testedCount,
                                     totalCombinations: payload.totalCombinations,
                                     currentBestResult: payload.currentBestResult
                                 });
                             }
                            break;
                        case 'completed':
                            _isOptimizationRunning = false;
                            if (typeof _mainAppInterface.setBruteForceResults === 'function') {
                                _mainAppInterface.setBruteForceResults(payload); // payload enthält hier results, bestResult etc.
                            }
                            if (_mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().updateBruteForceUI === 'function' && _currentOptimizationJob) {
                                _mainAppInterface.getUiHelpers().updateBruteForceUI('result', payload, _isWorkerAvailable, _currentOptimizationJob.kollektiv);
                            }
                            _currentOptimizationJob = null;
                            break;
                        case 'error':
                            _isOptimizationRunning = false;
                            console.error('Brute-Force Worker Fehler:', error, message, payload);
                            if (_mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().showToast === 'function') {
                                _mainAppInterface.getUiHelpers().showToast(`Brute-Force Fehler: ${message || error || 'Unbekannter Fehler'}`, 'error');
                            }
                            if (_mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().updateBruteForceUI === 'function') {
                                const jobDetails = _currentOptimizationJob || {};
                                _mainAppInterface.getUiHelpers().updateBruteForceUI('error', { message: message || error || 'Fehler im Worker.' }, _isWorkerAvailable, jobDetails.kollektiv);
                            }
                             if (typeof _mainAppInterface.setBruteForceStatus === 'function') {
                                 _mainAppInterface.setBruteForceStatus('error', { error: message || error, kollektiv: _currentOptimizationJob?.kollektiv, metric: _currentOptimizationJob?.metric });
                             }
                            _currentOptimizationJob = null;
                            break;
                        case 'cancelled':
                            _isOptimizationRunning = false;
                            if (_mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().updateBruteForceUI === 'function' && _currentOptimizationJob) {
                                _mainAppInterface.getUiHelpers().updateBruteForceUI('cancelled', payload, _isWorkerAvailable, _currentOptimizationJob.kollektiv);
                            }
                            if (typeof _mainAppInterface.setBruteForceStatus === 'function') {
                                 _mainAppInterface.setBruteForceStatus('cancelled', { kollektiv: _currentOptimizationJob?.kollektiv, metric: _currentOptimizationJob?.metric });
                            }
                            if (typeof _mainAppInterface.clearBruteForceResults === 'function') {
                                const kollektivToClear = _currentOptimizationJob?.kollektiv || _mainAppInterface.getStateSnapshot().currentKollektiv;
                                _mainAppInterface.clearBruteForceResults(kollektivToClear);
                            }
                            if (_mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().showToast === 'function') {
                                _mainAppInterface.getUiHelpers().showToast('Brute-Force Optimierung abgebrochen.', 'info');
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
                    const appConfigSnapshotOnError = _mainAppInterface.getStateSnapshot().appConfig;
                    const workerPathOnError = appConfigSnapshotOnError.WORKER_PATHS.BRUTE_FORCE;
                    console.error('Fehler beim Initialisieren des Brute-Force Workers:', err.message, err);

                    if (_mainAppInterface && _mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().showToast === 'function') {
                        _mainAppInterface.getUiHelpers().showToast(`Kritischer Fehler: Brute-Force Worker konnte nicht geladen werden. Pfad: ${workerPathOnError}. Fehler: ${err.message}. Weitere Details in der Konsole.`, 'error', 10000);
                    }
                    if (_mainAppInterface && _mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().updateBruteForceUI === 'function') {
                         _mainAppInterface.getUiHelpers().updateBruteForceUI('error', { message: 'Worker nicht geladen/Fehler.'}, false, null);
                    }
                     if (_mainAppInterface && typeof _mainAppInterface.setBruteForceStatus === 'function') {
                        _mainAppInterface.setBruteForceStatus('error', { error: 'Worker konnte nicht geladen werden.', fatal: true });
                     }
                    _currentOptimizationJob = null;
                };

                _worker.postMessage({ type: 'initialize', payload: { appConfig: _mainAppInterface.getStateSnapshot().appConfig } });

            } catch (error) {
                _isWorkerAvailable = false;
                console.error("Fehler bei der Erstellung des Brute-Force Workers:", error);
                 if (_mainAppInterface && _mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().showToast === 'function') {
                    _mainAppInterface.getUiHelpers().showToast(`Fehler bei Worker-Erstellung: ${error.message}`, 'error', 10000);
                }
                if (_mainAppInterface && _mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().updateBruteForceUI === 'function') {
                    _mainAppInterface.getUiHelpers().updateBruteForceUI('error', { message: 'Worker nicht erstellt.' }, false, null);
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

    function hasResults(kollektivId) {
        if (!_mainAppInterface) return false;
        const stateSnapshot = _mainAppInterface.getStateSnapshot();
        const bfResults = stateSnapshot.bruteForceResults;

        if (!bfResults || bfResults.status !== 'completed' || !bfResults.bestResult) {
            return false;
        }
        if (kollektivId) {
            return bfResults.kollektiv === kollektivId;
        }
        // If no kollektivId is provided, check if there are any results for the currently stored kollektiv
        return !!bfResults.kollektiv;
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
        const appConfigSnapshot = _mainAppInterface.getStateSnapshot().appConfig;

        try {
            const clonedData = cloneDeep(rawData);
            const allLiteratures = (typeof studyT2CriteriaManager !== 'undefined' && typeof studyT2CriteriaManager.getAllStudyCriteriaSets === 'function')
                                    ? studyT2CriteriaManager.getAllStudyCriteriaSets(false)
                                    : [];
            const payloadForWorker = {
                kollektiv,
                metric,
                rawData: clonedData,
                t2CriteriaSettings: appConfigSnapshot.T2_CRITERIA_SETTINGS,
                allT2Literatures: allLiteratures,
                appConfig: {
                    PERFORMANCE_SETTINGS: appConfigSnapshot.PERFORMANCE_SETTINGS,
                    STATISTICAL_CONSTANTS: appConfigSnapshot.STATISTICAL_CONSTANTS
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
                _mainAppInterface.getUiHelpers().updateBruteForceUI('error', { message: 'Startfehler' }, _isWorkerAvailable, kollektiv);
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
            const currentKollektivForUI = _currentOptimizationJob?.kollektiv || _mainAppInterface?.getStateSnapshot()?.currentKollektiv;
             if (_mainAppInterface && _mainAppInterface.getUiHelpers() && typeof _mainAppInterface.getUiHelpers().updateBruteForceUI === 'function') {
                _mainAppInterface.getUiHelpers().updateBruteForceUI('cancelled', {}, _isWorkerAvailable, currentKollektivForUI);
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
        hasResults,
        startOptimization,
        cancelOptimization,
        getCurrentOptimizationJobDetails
    });

})();
