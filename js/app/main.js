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
    let _paginationManager = null;
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
        _paginationManager = typeof paginationManager !== 'undefined' ? paginationManager : null;
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
            _bruteForceManager.init(APP_CONFIG.PATHS.BRUTE_FORCE_WORKER, _t2CriteriaManager, _statisticsService, _dataProcessor);
        }

        const modules = { _dataProcessor, _t2CriteriaManager, _studyT2CriteriaManager, _statisticsService, _bruteForceManager, _exportService, _viewRenderer, _state, _uiHelpers, _uiComponents, _chartRenderer, _tableRenderer, _paginationManager, _publicationTextGenerator, _publicationRenderer, _publikationTabLogic, _radiologyFormatter, _citationManager, _generalEventHandlers, _auswertungEventHandlers, _statistikEventHandlers, _praesentationEventHandlers, _publikationEventHandlers };
        for (const moduleName in modules) {
            if (modules[moduleName] === null) {
                console.error(`Modul ${moduleName.replace('_','')} konnte nicht initialisiert werden oder ist nicht verfügbar.`);
            }
        }

        if (APP_CONFIG.PERFORMANCE_SETTINGS.ENABLE_GPU_ACCELERATION_CSS) {
            document.body.classList.add('gpu-accelerated-css');
        }
    }

    function _loadAndProcessData() {
        if (typeof PATIENT_DATA !== 'undefined' && Array.isArray(PATIENT_DATA)) {
            _globalRawData = PATIENT_DATA;
        } else {
            console.error("Globale Patientendaten (PATIENT_DATA) nicht gefunden oder ungültig.");
            _globalRawData = [];
            _uiHelpers?.showToast("Fehler beim Laden der Patientendaten.", "danger");
        }

        if (_dataProcessor && typeof _dataProcessor.processData === 'function') {
            _processedData = _dataProcessor.processData(_globalRawData);
        } else {
            console.error("Data Processor nicht verfügbar. Daten können nicht verarbeitet werden.");
            _processedData = _globalRawData; // Fallback auf Rohdaten, wenn Processor fehlt
        }
    }

    function _setupInitialView() {
        if (!_state || !_viewRenderer || !_uiHelpers) {
            console.error("UI Initialisierung fehlgeschlagen: State, ViewRenderer oder UI Helpers nicht verfügbar.");
            return;
        }
        _state.init();
        const currentKollektiv = _state.getCurrentKollektiv();
        _uiHelpers.updateKollektivButtonsUI(currentKollektiv);

        const filteredData = _dataProcessor.filterDataByKollektiv(_processedData, currentKollektiv);
        const headerStats = _dataProcessor.calculateHeaderStats(filteredData, _t2CriteriaManager.getAppliedCriteria(), _t2CriteriaManager.getAppliedLogic());
        _uiHelpers.updateHeaderStatsUI(headerStats);

        const initialTabId = _state.getActiveTabId() || APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB_ID || 'daten-tab-pane';
        _viewRenderer.showTab(initialTabId);
        _uiHelpers.updateExportButtonStates(initialTabId, _bruteForceManager.hasAnyResults(), _processedData.length > 0);
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
            document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif; color: red; background: #fff1f1; border: 1px solid red;"><strong>Kritischer Fehler:</strong> Eine oder mehrere Konfigurationsdateien (APP_CONFIG, UI_TEXTS, etc.) konnten nicht geladen werden. Die Anwendung kann nicht gestartet werden. Bitte überprüfen Sie die Konsolenausgabe auf fehlende Skript-Dateien.</div>';
            console.error("Kritischer Fehler: Konfigurationsdateien nicht geladen.");
            return;
        }

        document.addEventListener('DOMContentLoaded', () => {
            const appContainer = document.getElementById('app-container');
            const loadingIndicator = document.getElementById('loading-indicator');
            if(appContainer) appContainer.classList.remove('d-none');
            if(loadingIndicator) loadingIndicator.style.display = 'none';

            _initializeModules();
            _loadAndProcessData();
            _setupInitialView();
            _attachGlobalEventListeners();
            _attachSpecificEventListeners();

            if(_uiHelpers && typeof _uiHelpers.initializeTooltips === 'function'){
                 setTimeout(() => _uiHelpers.initializeTooltips(document.body), 500); // Initial tooltips for whole body
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

    function refreshCurrentTab() {
        if (_viewRenderer && typeof _viewRenderer.refreshCurrentTab === 'function') {
            _viewRenderer.refreshCurrentTab();
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
