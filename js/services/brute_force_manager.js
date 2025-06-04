const bruteForceManager = (() => {
    let _worker = null;
    let _isRunning = false;
    let _currentKollektiv = null;
    let _currentTargetMetric = null;
    let _resultsByKollektivAndMetric = {};
    let _currentData = [];

    const _t2CriteriaOptions = {
        SIZE_RANGE: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE,
        FORM_VALUES: APP_CONFIG.T2_CRITERIA_SETTINGS.FORM_VALUES,
        KONTUR_VALUES: APP_CONFIG.T2_CRITERIA_SETTINGS.KONTUR_VALUES,
        HOMOGENITAET_VALUES: APP_CONFIG.T2_CRITERIA_SETTINGS.HOMOGENITAET_VALUES,
        SIGNAL_VALUES: APP_CONFIG.T2_CRITERIA_SETTINGS.SIGNAL_VALUES
    };
    const _allCriteriaKeys = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];


    function initialize() {
        if (window.Worker) {
            try {
                _worker = new Worker(APP_CONFIG.PATHS.BRUTE_FORCE_WORKER);
                _worker.onmessage = _handleWorkerMessage;
                _worker.onerror = _handleWorkerError;
                console.log("BruteForceManager: Worker initialisiert.");
                ui_helpers.updateBruteForceUI('idle', {}, true, _currentKollektiv);
            } catch (error) {
                console.error("BruteForceManager: Fehler beim Initialisieren des Workers:", error);
                _worker = null;
                 ui_helpers.updateBruteForceUI('error', { message: 'Worker-Initialisierung fehlgeschlagen.'}, false, _currentKollektiv);
            }
        } else {
            console.warn("BruteForceManager: Web Workers werden von diesem Browser nicht unterstützt.");
             ui_helpers.updateBruteForceUI('error', { message: 'Web Worker nicht unterstützt.'}, false, _currentKollektiv);
        }
         _resultsByKollektivAndMetric = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_RESULTS) || {};
    }

    function updateData(newData) {
        if (Array.isArray(newData)) {
            _currentData = newData;
        } else {
            console.error("BruteForceManager: Ungültige Daten für Update empfangen.");
            _currentData = [];
        }
    }
    
    function updateKollektiv(newKollektiv) {
        if (_currentKollektiv !== newKollektiv && !_isRunning) {
            _currentKollektiv = newKollektiv;
             const results = getResultsForKollektiv(_currentKollektiv, _currentTargetMetric || stateManager.getBruteForceMetric());
             if (results && results.bestResult) {
                  ui_helpers.updateBruteForceUI('result', results, isWorkerAvailable(), _currentKollektiv);
             } else {
                  ui_helpers.updateBruteForceUI('idle', {}, isWorkerAvailable(), _currentKollektiv);
             }
        } else if (_currentKollektiv !== newKollektiv && _isRunning) {
            ui_helpers.showToast("Kollektiv kann nicht während einer laufenden Optimierung geändert werden.", "warning");
        }
    }

    function startOptimization(kollektivId, targetMetric) {
        if (!_worker) {
            ui_helpers.showToast("Brute-Force Worker ist nicht verfügbar.", "danger");
            console.error("BruteForceManager: Worker nicht initialisiert.");
            return;
        }
        if (_isRunning) {
            ui_helpers.showToast("Eine Brute-Force-Optimierung läuft bereits.", "warning");
            console.warn("BruteForceManager: Optimierung bereits aktiv.");
            return;
        }

        _isRunning = true;
        _currentKollektiv = kollektivId;
        _currentTargetMetric = targetMetric;
        
        const filteredData = auswertungTabLogic.getFilteredData(kollektivId);
        if (!filteredData || filteredData.length === 0) {
            _isRunning = false;
            ui_helpers.showToast(`Keine Daten für Kollektiv '${getKollektivDisplayName(kollektivId)}' vorhanden.`, "warning");
            ui_helpers.updateBruteForceUI('error', { message: 'Keine Daten.' }, true, _currentKollektiv);
            return;
        }

        ui_helpers.updateBruteForceUI('start', { kollektiv: _currentKollektiv, metric: _currentTargetMetric }, true, _currentKollektiv);
        _worker.postMessage({
            command: 'start',
            data: filteredData,
            kollektiv: _currentKollektiv,
            targetMetric: _currentTargetMetric,
            t2CriteriaOptions: _t2CriteriaOptions,
            allCriteriaKeys: _allCriteriaKeys
        });
    }

    function cancelOptimization() {
        if (_worker && _isRunning) {
            _worker.terminate(); 
            _worker = null; 
            initialize(); 
            _isRunning = false;
            ui_helpers.updateBruteForceUI('cancelled', {}, isWorkerAvailable(), _currentKollektiv);
            ui_helpers.showToast("Brute-Force-Optimierung abgebrochen.", "info");
            console.log("BruteForceManager: Optimierung abgebrochen und Worker neu initialisiert.");
        } else if (!_isRunning) {
            console.warn("BruteForceManager: Keine laufende Optimierung zum Abbrechen.");
        } else {
            console.error("BruteForceManager: Worker nicht verfügbar zum Abbrechen.");
        }
    }

    function _handleWorkerMessage(e) {
        const { type, ...data } = e.data;

        if (type === 'progress') {
            ui_helpers.updateBruteForceUI('progress', data, true, _currentKollektiv);
        } else if (type === 'result') {
            _isRunning = false;
            if (!_resultsByKollektivAndMetric[_currentKollektiv]) {
                _resultsByKollektivAndMetric[_currentKollektiv] = {};
            }
            _resultsByKollektivAndMetric[_currentKollektiv][_currentTargetMetric] = {
                results: data.results,
                bestResult: data.bestResult,
                metric: data.metric,
                kollektiv: data.kollektiv,
                duration: data.duration,
                totalTested: data.totalTested,
                nGesamt: data.nGesamt,
                nPlus: data.nPlus,
                nMinus: data.nMinus,
                timestamp: new Date().toISOString()
            };
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_RESULTS, _resultsByKollektivAndMetric);
            ui_helpers.updateBruteForceUI('result', _resultsByKollektivAndMetric[_currentKollektiv][_currentTargetMetric], true, _currentKollektiv);
            
            const event = new CustomEvent('bruteForceResultsUpdated', { 
                detail: { 
                    kollektivId: _currentKollektiv, 
                    metric: _currentTargetMetric,
                    results: _resultsByKollektivAndMetric[_currentKollektiv][_currentTargetMetric]
                } 
            });
            document.dispatchEvent(event);
            if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshStatistikTab === 'function') {
                mainAppInterface.refreshStatistikTab();
            }
             if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshPublikationTab === 'function') {
                mainAppInterface.refreshPublikationTab();
            }

        } else if (type === 'started') {
             ui_helpers.updateBruteForceUI('started', data, true, _currentKollektiv);
        } else {
            console.warn("BruteForceManager: Unbekannter Nachrichtentyp vom Worker:", type, data);
        }
    }

    function _handleWorkerError(error) {
        console.error("BruteForceManager: Fehler vom Worker:", error);
        _isRunning = false;
        ui_helpers.updateBruteForceUI('error', { message: error.message || 'Unbekannter Worker-Fehler.' }, true, _currentKollektiv);
        ui_helpers.showToast(`Fehler bei der Brute-Force-Optimierung: ${error.message}`, "danger");
        if (_worker) {
            _worker.terminate();
            _worker = null;
            initialize(); 
        }
    }

    function getResultsForKollektiv(kollektivId, metricName) {
        if (_resultsByKollektivAndMetric[kollektivId] && _resultsByKollektivAndMetric[kollektivId][metricName]) {
            return cloneDeep(_resultsByKollektivAndMetric[kollektivId][metricName]);
        }
        return null;
    }
    
    function getAllStoredResults() {
        return cloneDeep(_resultsByKollektivAndMetric);
    }

    function isWorkerAvailable() {
        return !!_worker;
    }

    function isRunning() {
        return _isRunning;
    }
    
    function getCurrentKollektiv() {
        return _currentKollektiv;
    }

    function getCurrentTargetMetric() {
        return _currentTargetMetric;
    }
    
    function resetResults(kollektivId = null, metricName = null) {
        let message = "";
        if (kollektivId && metricName) {
            if (_resultsByKollektivAndMetric[kollektivId] && _resultsByKollektivAndMetric[kollektivId][metricName]) {
                delete _resultsByKollektivAndMetric[kollektivId][metricName];
                message = `Ergebnisse für Kollektiv '${getKollektivDisplayName(kollektivId)}' und Metrik '${metricName}' zurückgesetzt.`;
            } else {
                 message = `Keine Ergebnisse für Kollektiv '${getKollektivDisplayName(kollektivId)}' und Metrik '${metricName}' zum Zurücksetzen gefunden.`;
            }
        } else if (kollektivId) {
            if (_resultsByKollektivAndMetric[kollektivId]) {
                delete _resultsByKollektivAndMetric[kollektivId];
                message = `Alle Ergebnisse für Kollektiv '${getKollektivDisplayName(kollektivId)}' zurückgesetzt.`;
            } else {
                 message = `Keine Ergebnisse für Kollektiv '${getKollektivDisplayName(kollektivId)}' zum Zurücksetzen gefunden.`;
            }
        } else {
            _resultsByKollektivAndMetric = {};
            message = "Alle Brute-Force-Ergebnisse wurden zurückgesetzt.";
        }
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_RESULTS, _resultsByKollektivAndMetric);
        ui_helpers.showToast(message, "info");
        
        const currentDisplayKollektiv = _currentKollektiv || stateManager.getCurrentKollektiv();
        const currentDisplayMetric = _currentTargetMetric || stateManager.getBruteForceMetric();
        const resultsForDisplay = getResultsForKollektiv(currentDisplayKollektiv, currentDisplayMetric);
        
        if (resultsForDisplay && resultsForDisplay.bestResult) {
            ui_helpers.updateBruteForceUI('result', resultsForDisplay, isWorkerAvailable(), currentDisplayKollektiv);
        } else {
            ui_helpers.updateBruteForceUI('idle', {}, isWorkerAvailable(), currentDisplayKollektiv);
        }

        const event = new CustomEvent('bruteForceResultsUpdated', { detail: { allReset: !kollektivId } });
        document.dispatchEvent(event);
         if (typeof mainAppInterface !== 'undefined') {
            if(mainAppInterface.refreshStatistikTab) mainAppInterface.refreshStatistikTab();
            if(mainAppInterface.refreshPublikationTab) mainAppInterface.refreshPublikationTab();
        }
    }


    return Object.freeze({
        initialize,
        updateData,
        updateKollektiv,
        startOptimization,
        cancelOptimization,
        getResultsForKollektiv,
        getAllStoredResults,
        isWorkerAvailable,
        isRunning,
        getCurrentKollektiv,
        getCurrentTargetMetric,
        resetResults
    });
})();

window.bruteForceManager = bruteForceManager;
