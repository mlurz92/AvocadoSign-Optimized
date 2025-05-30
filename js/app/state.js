const mainAppInterface = (() => {
    let _globalRawData = null;
    let _processedData = null;

    let _dataProcessor = null;
    let _t2CriteriaManager = null;
    let _studyT2CriteriaManager = null;
    let _statisticsService = null;
    let _bruteForceManager = null;
    let _exportService = null;
    let _viewRenderer = null;
    let _state = null;
    let _uiHelpers = null;
    let _uiComponents = null;
    let _chartRenderer = null;
    let _tableRenderer = null;
    // _paginationManager wurde entfernt
    let _publicationTextGenerator = null;
    let _publicationRenderer = null;
    let _publikationTabLogic = null;
    let _radiologyFormatter = null;
    let _citationManager = null;

    let _generalEventHandlers = null;
    let _auswertungEventHandlers = null;
    let _statistikEventHandlers = null;
    let _praesentationEventHandlers = null;
    let _publikationEventHandlers = null;

    function _initializeModules() {
        _dataProcessor = typeof dataProcessor !== 'undefined' ? dataProcessor : null;
        _t2CriteriaManager = typeof t2CriteriaManager !== 'undefined' ? t2CriteriaManager : null;
        _studyT2CriteriaManager = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager : null;
        _statisticsService = typeof statisticsService !== 'undefined' ? statisticsService : null;
        _bruteForceManager = typeof bruteForceManager !== 'undefined' ? bruteForceManager : null;
        _exportService = typeof exportService !== 'undefined' ? exportService : null;
        _viewRenderer = typeof viewRenderer !== 'undefined' ? viewRenderer : null;
        _state = typeof state !== 'undefined' ? state : null;
        _uiHelpers = typeof ui_helpers !== 'undefined' ? ui_helpers : null;
        _uiComponents = typeof ui_components !== 'undefined' ? ui_components : null;
        _chartRenderer = typeof chart_renderer !== 'undefined' ? chart_renderer : null;
        _tableRenderer = typeof tableRenderer !== 'undefined' ? tableRenderer : null;
        _publicationTextGenerator = typeof publicationTextGenerator !== 'undefined' ? publicationTextGenerator : null;
        _publicationRenderer = typeof publicationRenderer !== 'undefined' ? publicationRenderer : null;
        _publikationTabLogic = typeof publikationTabLogic !== 'undefined' ? publikationTabLogic : null;
        _radiologyFormatter = typeof radiologyFormatter !== 'undefined' ? radiologyFormatter : null;
        _citationManager = typeof citationManager !== 'undefined' ? citationManager : null;

        _generalEventHandlers = typeof generalEventHandlers !== 'undefined' ? generalEventHandlers : null;
        _auswertungEventHandlers = typeof auswertungEventHandlers !== 'undefined' ? auswertungEventHandlers : null;
        _statistikEventHandlers = typeof statistikEventHandlers !== 'undefined' ? statistikEventHandlers : null;
        _praesentationEventHandlers = typeof praesentationEventHandlers !== 'undefined' ? praesentationEventHandlers : null;
        _publikationEventHandlers = typeof publikationEventHandlers !== 'undefined' ? publikationEventHandlers : null;

        if (_bruteForceManager && typeof _bruteForceManager.init === 'function') {
            if (_t2CriteriaManager && _statisticsService && _dataProcessor) {
                _bruteForceManager.init(APP_CONFIG.PATHS.BRUTE_FORCE_WORKER, _t2CriteriaManager, _statisticsService, _dataProcessor);
            } else {
                console.error("BruteForceManager konnte nicht initialisiert werden: Abhängigkeiten (T2CriteriaManager, StatisticsService, DataProcessor) fehlen.");
            }
        }

        const modules = { _dataProcessor, _t2CriteriaManager, _studyT2CriteriaManager, _statisticsService, _bruteForceManager, _exportService, _viewRenderer, _state, _uiHelpers, _uiComponents, _chartRenderer, _tableRenderer, _publicationTextGenerator, _publicationRenderer, _publikationTabLogic, _radiologyFormatter, _citationManager, _generalEventHandlers, _auswertungEventHandlers, _statistikEventHandlers, _praesentationEventHandlers, _publikationEventHandlers };
        for (const moduleName in modules) {
            if (modules[moduleName] === null) {
                console.error(`Modul ${moduleName.replace('_','')} konnte nicht initialisiert werden oder ist nicht verfügbar.`);
            }
        }

        if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.PERFORMANCE_SETTINGS && APP_CONFIG.PERFORMANCE_SETTINGS.ENABLE_GPU_ACCELERATION_CSS) {
            document.body.classList.add('gpu-accelerated-css');
        }
    }

    function _loadAndProcessData() {
        if (typeof PATIENT_DATA !== 'undefined' && Array.isArray(PATIENT_DATA)) {
            _globalRawData = PATIENT_DATA;
        } else {
            console.error("Globale Patientendaten (PATIENT_DATA) nicht gefunden oder ungültig.");
            _globalRawData = [];
            if (_uiHelpers && typeof _uiHelpers.showToast === 'function') {
                _uiHelpers.showToast("Fehler beim Laden der Patientendaten.", "danger");
            }
        }

        if (_dataProcessor && typeof _dataProcessor.processData === 'function') {
            _processedData = _dataProcessor.processData(_globalRawData);
        } else {
            console.error("Data Processor nicht verfügbar. Daten können nicht verarbeitet werden.");
            _processedData = _globalRawData; 
        }
    }

    function _setupInitialView() {
        if (!_state || !_viewRenderer || !_uiHelpers || !_dataProcessor || !_t2CriteriaManager) {
            console.error("UI Initialisierung fehlgeschlagen: Notwendige Module nicht verfügbar (State, ViewRenderer, UI Helpers, DataProcessor, T2CriteriaManager).");
            return;
        }
        _state.init();
        const currentKollektiv = _state.getCurrentKollektiv();
        _uiHelpers.updateKollektivButtonsUI(currentKollektiv);

        const filteredData = _dataProcessor.filterDataByKollektiv(_processedData, currentKollektiv);
        const headerStats = _dataProcessor.calculateHeaderStats(filteredData, _t2CriteriaManager.getAppliedCriteria(), _t2CriteriaManager.getAppliedLogic());
        _uiHelpers.updateHeaderStatsUI(headerStats);

        const initialTabId = _state.getActiveTabId() || APP_CONFIG?.DEFAULT_SETTINGS?.ACTIVE_TAB_ID || 'daten-tab-pane';
        _viewRenderer.showTab(initialTabId);

        let bfHasResults = false;
        if (typeof _bruteForceManager !== 'undefined' && typeof _bruteForceManager.hasAnyResults === 'function') {
            bfHasResults = _bruteForceManager.hasAnyResults();
        }
        _uiHelpers.updateExportButtonStates(initialTabId, bfHasResults, (_processedData?.length || 0) > 0);
    }

    function _attachGlobalEventListeners() {
        if (!_generalEventHandlers || typeof _generalEventHandlers.attachEventListeners !== 'function') {
            console.warn("General Event Handlers nicht verfügbar."); return;
        }
        _generalEventHandlers.attachEventListeners(mainAppInterface);
    }

    function _attachSpecificEventListeners() {
        const handlers = [
            _auswertungEventHandlers,
            _statistikEventHandlers,
            _praesentationEventHandlers,
            _publikationEventHandlers
        ];
        handlers.forEach(handler => {
            if (handler && typeof handler.attachEventListeners === 'function') {
                handler.attachEventListeners(mainAppInterface);
            } else {
                const handlerName = Object.keys({_auswertungEventHandlers, _statistikEventHandlers, _praesentationEventHandlers, _publikationEventHandlers}).find(key => ({_auswertungEventHandlers, _statistikEventHandlers, _praesentationEventHandlers, _publikationEventHandlers}[key] === handler));
                console.warn(`${handlerName || 'Spezifischer Event Handler'} nicht verfügbar.`);
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

                if(_uiHelpers && typeof _uiHelpers.initializeTooltips === 'function'){
                     setTimeout(() => _uiHelpers.initializeTooltips(document.body), 500);
                }
                
                const appVersionFooter = document.getElementById('app-version-footer');
                if(appVersionFooter && typeof APP_CONFIG !== 'undefined' && APP_CONFIG.APP_VERSION) {
                    appVersionFooter.textContent = APP_CONFIG.APP_VERSION;
                }
                if(appContainer) appContainer.classList.remove('d-none'); // Show app only if all initializations likely succeeded
                if(loadingIndicator) loadingIndicator.style.display = 'none';

            } catch (error) {
                 console.error("Schwerwiegender Fehler während der Initialisierung der Anwendung:", error);
                 if (loadingIndicator) {
                     loadingIndicator.innerHTML = `<p style="color: red; font-weight: bold;">Fehler beim Start der Anwendung. Bitte Konsole prüfen.</p><p style="font-size: 0.8em; color: #555;">Details: ${error.message}</p>`;
                     loadingIndicator.style.display = 'flex'; // Ensure it's visible
                 }
                 if(appContainer) appContainer.classList.add('d-none'); // Hide app container on critical error
            }
        });
    }

    function getGlobalData() {
        return _processedData || [];
    }

    function renderView(tabId) {
        if (_viewRenderer && typeof _viewRenderer.showTab === 'function') {
            _viewRenderer.showTab(tabId);
        } else {
            console.error("ViewRenderer nicht verfügbar, Tab kann nicht gerendert werden.");
        }
    }

    function refreshCurrentTab(optionalTabId) {
        if (_viewRenderer && typeof _viewRenderer.refreshCurrentTab === 'function') {
            _viewRenderer.refreshCurrentTab(optionalTabId);
        } else {
            console.error("ViewRenderer nicht verfügbar, Tab kann nicht aktualisiert werden.");
        }
    }

    return Object.freeze({
        init,
        getGlobalData,
        renderView,
        refreshCurrentTab
    });

})();

mainAppInterface.init();
