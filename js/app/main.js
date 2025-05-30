const mainAppInterface = (() => {
    let _globalRawData = null;
    let _processedData = null;

    let _dataProcessorModule = null;
    let _t2CriteriaManagerModule = null;
    let _studyT2CriteriaManagerModule = null;
    let _statisticsServiceModule = null;
    let _bruteForceManagerModule = null;
    let _exportServiceModule = null;
    let _viewRendererModule = null;
    let _stateModule = null;
    let _uiHelpersModule = null;
    let _uiComponentsModule = null;
    let _chartRendererModule = null;
    let _tableRendererModule = null;
    let _publicationTextGeneratorModule = null;
    let _publicationRendererModule = null;
    let _publikationTabLogicModule = null;
    let _radiologyFormatterModule = null;
    let _citationManagerModule = null;

    let _generalEventHandlersModule = null;
    let _auswertungEventHandlersModule = null;
    let _statistikEventHandlersModule = null;
    let _praesentationEventHandlersModule = null;
    let _publikationEventHandlersModule = null;

    function _initializeModules() {
        _dataProcessorModule = typeof dataProcessor !== 'undefined' ? dataProcessor : null;
        _t2CriteriaManagerModule = typeof t2CriteriaManager !== 'undefined' ? t2CriteriaManager : null;
        _studyT2CriteriaManagerModule = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager : null;
        _statisticsServiceModule = typeof statisticsService !== 'undefined' ? statisticsService : null;
        _bruteForceManagerModule = typeof bruteForceManager !== 'undefined' ? bruteForceManager : null;
        _exportServiceModule = typeof exportService !== 'undefined' ? exportService : null;
        _viewRendererModule = typeof viewRenderer !== 'undefined' ? viewRenderer : null;
        _stateModule = typeof state !== 'undefined' ? state : null;
        _uiHelpersModule = typeof ui_helpers !== 'undefined' ? ui_helpers : null;
        _uiComponentsModule = typeof uiComponents !== 'undefined' ? uiComponents : null;
        _chartRendererModule = typeof chartRenderer !== 'undefined' ? chartRenderer : null;
        _tableRendererModule = typeof tableRenderer !== 'undefined' ? tableRenderer : null;
        _publicationTextGeneratorModule = typeof publicationTextGenerator !== 'undefined' ? publicationTextGenerator : null;
        _publicationRendererModule = typeof publicationRenderer !== 'undefined' ? publicationRenderer : null;
        _publikationTabLogicModule = typeof publikationTabLogic !== 'undefined' ? publikationTabLogic : null;
        _radiologyFormatterModule = typeof radiologyFormatter !== 'undefined' ? radiologyFormatter : null;
        _citationManagerModule = typeof citationManager !== 'undefined' ? citationManager : null;

        _generalEventHandlersModule = typeof generalEventHandlers !== 'undefined' ? generalEventHandlers : null;
        _auswertungEventHandlersModule = typeof auswertungEventHandlers !== 'undefined' ? auswertungEventHandlers : null;
        _statistikEventHandlersModule = typeof statistikEventHandlers !== 'undefined' ? statistikEventHandlers : null;
        _praesentationEventHandlersModule = typeof praesentationEventHandlers !== 'undefined' ? praesentationEventHandlers : null;
        _publikationEventHandlersModule = typeof publikationEventHandlers !== 'undefined' ? publikationEventHandlers : null;

        if (_bruteForceManagerModule && typeof _bruteForceManagerModule.init === 'function') {
             _bruteForceManagerModule.init({
                onProgress: (payload) => {
                    if (_uiHelpersModule) _uiHelpersModule.updateBruteForceUI('progress', payload, true, payload?.kollektiv);
                },
                onResult: (payload) => {
                    if (_uiHelpersModule) _uiHelpersModule.updateBruteForceUI('result', payload, true, payload?.kollektiv);
                     if (mainAppInterface && typeof mainAppInterface.updateGlobalUIState === 'function') {
                        mainAppInterface.updateGlobalUIState();
                    }
                },
                onError: (payload) => {
                    if (_uiHelpersModule) {
                        _uiHelpersModule.showToast(`Brute-Force Fehler: ${payload?.message || 'Unbekannt'}`, 'danger');
                        _uiHelpersModule.updateBruteForceUI('error', payload, _bruteForceManagerModule.isWorkerAvailable(), payload?.kollektiv);
                    }
                },
                onCancelled: (payload) => {
                    if (_uiHelpersModule) {
                         _uiHelpersModule.showToast(`Brute-Force Analyse für Kollektiv '${payload?.kollektiv || 'unbekannt'}' abgebrochen.`, 'warning');
                         _uiHelpersModule.updateBruteForceUI('cancelled', payload, true, payload?.kollektiv);
                    }
                },
                onStarted: (payload) => {
                     if (_uiHelpersModule) _uiHelpersModule.updateBruteForceUI('started', payload, true, payload?.kollektiv);
                }
            });
        } else {
             console.error("BruteForceManager konnte nicht initialisiert werden oder init-Funktion fehlt.");
        }

        const modules = { _dataProcessorModule, _t2CriteriaManagerModule, _studyT2CriteriaManagerModule, _statisticsServiceModule, _bruteForceManagerModule, _exportServiceModule, _viewRendererModule, _stateModule, _uiHelpersModule, _uiComponentsModule, _chartRendererModule, _tableRendererModule, _publicationTextGeneratorModule, _publicationRendererModule, _publikationTabLogicModule, _radiologyFormatterModule, _citationManagerModule, _generalEventHandlersModule, _auswertungEventHandlersModule, _statistikEventHandlersModule, _praesentationEventHandlersModule, _publikationEventHandlersModule };
        for (const moduleName in modules) {
            if (modules[moduleName] === null) {
                console.error(`Modul ${moduleName.replace('_', '').replace('Module','')} konnte nicht initialisiert werden oder ist nicht verfügbar.`);
            }
        }

        if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.PERFORMANCE_SETTINGS && APP_CONFIG.PERFORMANCE_SETTINGS.ENABLE_GPU_ACCELERATION_CSS) {
            document.body.classList.add('gpu-accelerated-css');
        }
    }

    function _loadAndProcessData() {
        if (typeof patientDataRaw !== 'undefined' && Array.isArray(patientDataRaw)) {
            _globalRawData = patientDataRaw;
        } else {
            console.error("Globale Patientendaten (patientDataRaw) nicht gefunden oder ungültig.");
            _globalRawData = [];
            if (_uiHelpersModule && typeof _uiHelpersModule.showToast === 'function') {
                _uiHelpersModule.showToast("Fehler beim Laden der Patientendaten.", "danger");
            }
        }

        if (_dataProcessorModule && typeof _dataProcessorModule.processData === 'function') {
            _processedData = _dataProcessorModule.processData(_globalRawData);
        } else {
            console.error("Data Processor nicht verfügbar. Daten können nicht verarbeitet werden.");
            _processedData = cloneDeep(_globalRawData);
        }
    }

    function _setupInitialView() {
        if (!_stateModule || !_viewRendererModule || !_uiHelpersModule || !_dataProcessorModule || !_t2CriteriaManagerModule) {
            console.error("UI Initialisierung fehlgeschlagen: Notwendige Module nicht verfügbar.");
            return;
        }
        _stateModule.init();
        _t2CriteriaManagerModule.initialize();
        
        const currentKollektiv = _stateModule.getCurrentKollektiv();
        _uiHelpersModule.updateKollektivButtonsUI(currentKollektiv);

        const filteredData = _dataProcessorModule.filterDataByKollektiv(_processedData, currentKollektiv);
        const evaluatedData = _t2CriteriaManagerModule.evaluateDataset(filteredData, _t2CriteriaManagerModule.getAppliedCriteria(), _t2CriteriaManagerModule.getAppliedLogic());
        const headerStats = _dataProcessorModule.calculateHeaderStats(evaluatedData, currentKollektiv);
        _uiHelpersModule.updateHeaderStatsUI(headerStats);

        const initialTabId = _stateModule.getActiveTabId() || APP_CONFIG?.DEFAULT_SETTINGS?.ACTIVE_TAB_ID || 'daten-tab-pane';
        _viewRendererModule.showTab(initialTabId);

        let bfHasResults = false;
        if (typeof _bruteForceManagerModule !== 'undefined' && typeof _bruteForceManagerModule.getAllResults === 'function') {
            const allBfResults = _bruteForceManagerModule.getAllResults();
            bfHasResults = Object.keys(allBfResults).length > 0 && Object.values(allBfResults).some(res => res && res.results && res.results.length > 0);
        }
        _uiHelpersModule.updateExportButtonStates(initialTabId, bfHasResults, (_processedData?.length || 0) > 0);
    }

    function _attachGlobalEventListeners() {
        if (!_generalEventHandlersModule || typeof _generalEventHandlersModule.attachEventListeners !== 'function') {
            console.warn("General Event Handlers nicht verfügbar."); return;
        }
        _generalEventHandlersModule.attachEventListeners(mainAppInterface);
    }

    function _attachSpecificEventListeners() {
        const handlers = [
            _auswertungEventHandlersModule,
            _statistikEventHandlersModule,
            _praesentationEventHandlersModule,
            _publikationEventHandlersModule
        ];
        handlers.forEach(handler => {
            if (handler && typeof handler.attachEventListeners === 'function') {
                handler.attachEventListeners(mainAppInterface);
            } else {
                const handlerName = Object.keys({_auswertungEventHandlersModule, _statistikEventHandlersModule, _praesentationEventHandlersModule, _publikationEventHandlersModule}).find(key => ({_auswertungEventHandlersModule, _statistikEventHandlersModule, _praesentationEventHandlersModule, _publikationEventHandlersModule}[key] === handler));
                console.warn(`${handlerName || 'Spezifischer Event Handler'} nicht verfügbar oder attachEventListeners fehlt.`);
            }
        });
    }


    function init() {
        if (typeof APP_CONFIG === 'undefined' || typeof UI_TEXTS === 'undefined' || typeof TOOLTIP_CONTENT === 'undefined' || typeof PUBLICATION_CONFIG === 'undefined' || typeof RADIOLOGY_FORMAT_CONFIG === 'undefined') {
            document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif; color: red; background: #fff1f1; border: 1px solid red;"><strong>Kritischer Fehler:</strong> Eine oder mehrere Konfigurationsdateien (APP_CONFIG, UI_TEXTS, etc.) konnten nicht geladen werden. Die Anwendung kann nicht gestartet werden. Bitte überprüfen Sie die Konsolenausgabe auf fehlende Skript-Dateien und deren korrekte Ladereihenfolge.</div>';
            console.error("Kritischer Fehler: Konfigurationsdateien nicht geladen. Stellen Sie sicher, dass alle config/*.js Dateien vor anderen App-Skripten in index.html geladen werden.");
            return;
        }

        document.addEventListener('DOMContentLoaded', () => {
            const appContainer = document.getElementById('app-container');
            const loadingIndicator = document.getElementById('loading-indicator');
            
            try {
                _initializeModules();
                _loadAndProcessData();
                _setupInitialView();
                _attachGlobalEventListeners();
                _attachSpecificEventListeners();

                if(_uiHelpersModule && typeof _uiHelpersModule.initializeTooltips === 'function'){
                     setTimeout(() => _uiHelpersModule.initializeTooltips(document.body), 500);
                }
                
                const appVersionFooter = document.getElementById('app-version-footer');
                if(appVersionFooter && typeof APP_CONFIG !== 'undefined' && APP_CONFIG.APP_VERSION) {
                    appVersionFooter.textContent = APP_CONFIG.APP_VERSION;
                }
                if(appContainer) appContainer.classList.remove('d-none');
                if(loadingIndicator) loadingIndicator.style.display = 'none';

            } catch (error) {
                 console.error("Schwerwiegender Fehler während der Initialisierung der Anwendung:", error);
                 if (loadingIndicator) {
                     loadingIndicator.innerHTML = `<p style="color: red; font-weight: bold;">Fehler beim Start der Anwendung. Bitte Konsole prüfen.</p><p style="font-size: 0.8em; color: #555;">Details: ${error.message}</p>`;
                     loadingIndicator.style.display = 'flex';
                 }
                 if(appContainer) appContainer.classList.add('d-none');
            }
        });
    }

    function getGlobalData() {
        return _processedData || [];
    }
    
    function getRawData() {
        return _globalRawData || [];
    }

    function getProcessedData() {
        return _processedData || [];
    }


    function renderView(tabId) {
        if (_viewRendererModule && typeof _viewRendererModule.showTab === 'function') {
            _viewRendererModule.showTab(tabId);
        } else {
            console.error("ViewRenderer nicht verfügbar, Tab kann nicht gerendert werden.");
        }
    }

    function refreshCurrentTab(optionalTabId) {
        if (_viewRendererModule && typeof _viewRendererModule.refreshCurrentTab === 'function') {
            _viewRendererModule.refreshCurrentTab(optionalTabId);
        } else {
            console.error("ViewRenderer nicht verfügbar, Tab kann nicht aktualisiert werden.");
        }
    }
    
    function applyAndRefreshAll() {
        if (_t2CriteriaManagerModule) {
            _t2CriteriaManagerModule.applyCriteria();
        }
        if (_stateModule) {
            _stateModule.setUnsavedCriteriaChanges(false);
        }
        if (_uiHelpersModule && typeof _uiHelpersModule.markCriteriaSavedIndicator === 'function') {
            _uiHelpersModule.markCriteriaSavedIndicator(false);
        }
        updateGlobalUIState();
        refreshCurrentTab();
    }

    function updateGlobalUIState() {
        if (!_stateModule || !_uiHelpersModule || !_dataProcessorModule || !_t2CriteriaManagerModule) {
            console.warn("Abhängigkeiten für updateGlobalUIState nicht vollständig verfügbar.");
            return;
        }
        const currentKollektiv = _stateModule.getCurrentKollektiv();
        _uiHelpersModule.updateKollektivButtonsUI(currentKollektiv);

        const filteredData = _dataProcessorModule.filterDataByKollektiv(getProcessedData(), currentKollektiv);
        const evaluatedData = _t2CriteriaManagerModule.evaluateDataset(filteredData, _t2CriteriaManagerModule.getAppliedCriteria(), _t2CriteriaManagerModule.getAppliedLogic());
        const headerStats = _dataProcessorModule.calculateHeaderStats(evaluatedData, currentKollektiv);
        _uiHelpersModule.updateHeaderStatsUI(headerStats);

        let bfHasResults = false;
        if (typeof _bruteForceManagerModule !== 'undefined' && typeof _bruteForceManagerModule.getAllResults === 'function') {
            const allBfResults = _bruteForceManagerModule.getAllResults();
            bfHasResults = Object.keys(allBfResults).length > 0 && Object.values(allBfResults).some(res => res && res.results && res.results.length > 0);
        }
        _uiHelpersModule.updateExportButtonStates(_stateModule.getActiveTabId(), bfHasResults, (_processedData?.length || 0) > 0);
    }


    function handleGlobalKollektivChange(newKollektiv, source = "user") {
        if (!_stateModule) return false;
        if (_stateModule.getCurrentKollektiv() === newKollektiv && source !== "auto_praesentation_force_refresh") {
            return false; 
        }
        _stateModule.setCurrentKollektiv(newKollektiv);
        _stateModule.setCurrentDatenTablePage(1); 
        _stateModule.setCurrentAuswertungTablePage(1);

        updateGlobalUIState();
        refreshCurrentTab();
        return true;
    }

    function handleSortRequest(tableContext, key, subKey = null) {
        if (!_stateModule || !_dataProcessorModule) return;
        let currentSort, setSortFunction, setPageFunction;

        if (tableContext === 'daten') {
            currentSort = _stateModule.getCurrentDatenTableSort();
            setSortFunction = _stateModule.setCurrentDatenTableSort;
            setPageFunction = _stateModule.setCurrentDatenTablePage;
        } else if (tableContext === 'auswertung') {
            currentSort = _stateModule.getCurrentAuswertungTableSort();
            setSortFunction = _stateModule.setCurrentAuswertungTableSort;
            setPageFunction = _stateModule.setCurrentAuswertungTablePage;
        } else {
            return;
        }

        let direction = 'asc';
        if (currentSort.key === key && currentSort.subKey === subKey) {
            direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        }
        
        setSortFunction({ key, direction, subKey });
        setPageFunction(1); 
        refreshCurrentTab();
    }
    
    function processTabChange(targetTabId) {
        if (!_stateModule) return;
        _stateModule.setActiveTabId(targetTabId);
        refreshCurrentTab(targetTabId, true);
    }


    return Object.freeze({
        init,
        getGlobalData,
        getRawData,
        getProcessedData,
        renderView,
        refreshCurrentTab,
        applyAndRefreshAll,
        updateGlobalUIState,
        handleGlobalKollektivChange,
        handleSortRequest,
        processTabChange,
        
        // Getter für interne Module (vorsichtig verwenden, primär für Event-Handler)
        get _state() { return _stateModule; },
        get _dataProcessor() { return _dataProcessorModule; },
        get _t2CriteriaManager() { return _t2CriteriaManagerModule; },
        get _studyT2CriteriaManager() { return _studyT2CriteriaManagerModule; },
        get _statisticsService() { return _statisticsServiceModule; },
        get _bruteForceManager() { return _bruteForceManagerModule; },
        get _exportService() { return _exportServiceModule; },
        get _uiHelpers() { return _uiHelpersModule; },
        get _viewRenderer() { return _viewRendererModule; }
    });

})();

mainAppInterface.init();
