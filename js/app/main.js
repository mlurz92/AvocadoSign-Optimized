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

        const modules = { _dataProcessor, _t2CriteriaManager, _studyT2CriteriaManager, _statisticsService, _bruteForceManager, _exportService, _viewRenderer, _state, _uiHelpers, _uiComponents, _chartRenderer, _tableRenderer, _paginationManager, _publicationTextGenerator, _publicationRenderer, _publikationTabLogic, _radiologyFormatter, _citationManager, _generalEventHandlers, _auswertungEventHandlers, _statistikEventHandlers, _praesentationEventHandlers, _publikationEventHandlers };
        let allModulesAvailable = true;
        for (const moduleName in modules) {
            if (modules[moduleName] === null) {
                console.error(`Modul ${moduleName.replace('_','')} konnte nicht initialisiert werden oder ist nicht verfügbar.`);
                allModulesAvailable = false;
            }
        }
        if (!allModulesAvailable) {
            if(_uiHelpers && typeof _uiHelpers.showToast === 'function') {
                _uiHelpers.showToast("Einige Kernmodule konnten nicht geladen werden. Die Anwendung ist möglicherweise nicht voll funktionsfähig.", "danger", 10000);
            }
            return false;
        }

        if (_t2CriteriaManager && typeof _t2CriteriaManager.initialize === 'function') {
            _t2CriteriaManager.initialize();
        }

        if (_bruteForceManager && typeof _bruteForceManager.init === 'function') {
            _bruteForceManager.init({
                onProgress: (progressData) => {
                    if (_uiHelpers && _viewRenderer) {
                        _uiHelpers.updateBruteForceUI('progress', progressData, _bruteForceManager.isWorkerAvailable(), progressData.kollektiv);
                        if (_state.getActiveTabId() === 'auswertung-tab-pane') _viewRenderer.refreshCurrentTab();
                    }
                },
                onResult: (resultData) => {
                    if (_uiHelpers && _viewRenderer) {
                        _uiHelpers.updateBruteForceUI('result', resultData, _bruteForceManager.isWorkerAvailable(), resultData.kollektiv);
                        const modalBody = document.getElementById('brute-force-modal-body');
                        if (modalBody && _uiComponents) modalBody.innerHTML = _uiComponents.createBruteForceModalContent(resultData);
                        if (_uiHelpers) _uiHelpers.initializeTooltips(modalBody);
                        if (_state.getActiveTabId() === 'auswertung-tab-pane') _viewRenderer.refreshCurrentTab();
                         _uiHelpers.updateExportButtonStates(_state.getActiveTabId(), _bruteForceManager.hasAnyResults(), _processedData.length > 0);
                    }
                },
                onError: (errorData) => {
                    if (_uiHelpers && _viewRenderer) {
                        _uiHelpers.showToast(`Brute-Force Fehler: ${errorData.message}`, 'danger');
                        _uiHelpers.updateBruteForceUI('error', errorData, _bruteForceManager.isWorkerAvailable(), errorData.kollektiv);
                        if (_state.getActiveTabId() === 'auswertung-tab-pane') _viewRenderer.refreshCurrentTab();
                    }
                },
                onCancelled: (cancelData) => {
                    if (_uiHelpers && _viewRenderer) {
                        _uiHelpers.showToast('Brute-Force Analyse abgebrochen.', 'warning');
                        _uiHelpers.updateBruteForceUI('cancelled', cancelData, _bruteForceManager.isWorkerAvailable(), cancelData.kollektiv);
                         if (_state.getActiveTabId() === 'auswertung-tab-pane') _viewRenderer.refreshCurrentTab();
                    }
                },
                onStarted: (startData) => {
                     if (_uiHelpers && _viewRenderer) {
                        _uiHelpers.updateBruteForceUI('started', startData, _bruteForceManager.isWorkerAvailable(), startData.kollektiv);
                         if (_state.getActiveTabId() === 'auswertung-tab-pane') _viewRenderer.refreshCurrentTab();
                     }
                }
            });
        }
        return true;
    }

    function _loadAndProcessData() {
        if (typeof PATIENT_DATA !== 'undefined' && Array.isArray(PATIENT_DATA)) {
            _globalRawData = PATIENT_DATA;
        } else {
            console.error("Globale Patientendaten (PATIENT_DATA) nicht gefunden oder ungültig.");
            _globalRawData = [];
            if(_uiHelpers) _uiHelpers.showToast("Fehler beim Laden der Patientendaten.", "danger");
        }

        if (_dataProcessor && typeof _dataProcessor.processPatientData === 'function') {
            _processedData = _dataProcessor.processPatientData(_globalRawData);
        } else {
            console.error("Data Processor nicht verfügbar. Daten können nicht verarbeitet werden.");
            _processedData = cloneDeep(_globalRawData);
        }

        if (_t2CriteriaManager && typeof _t2CriteriaManager.evaluateDataset === 'function' && _processedData) {
            _processedData = _t2CriteriaManager.evaluateDataset(_processedData, _t2CriteriaManager.getAppliedT2Criteria(), _t2CriteriaManager.getAppliedT2Logic());
        } else {
            console.error("T2CriteriaManager nicht verfügbar oder Daten fehlen. T2 Status kann nicht initial berechnet werden.");
        }
    }

    function _updateGlobalUIState() {
        if (!_state || !_uiHelpers || !_dataProcessor || !_processedData) return;
        const currentKollektiv = _state.getCurrentKollektiv();
        _uiHelpers.updateKollektivButtonsUI(currentKollektiv);

        const filteredData = _dataProcessor.filterDataByKollektiv(_processedData, currentKollektiv);
        const headerStats = _dataProcessor.calculateHeaderStats(filteredData, currentKollektiv);
        _uiHelpers.updateHeaderStatsUI(headerStats);
        _uiHelpers.updateExportButtonStates(_state.getActiveTabId(), _bruteForceManager.hasAnyResults(), _processedData.length > 0);
    }

    function _setupInitialView() {
        if (!_state || !_viewRenderer || !_uiHelpers || !_dataProcessor || !_processedData) {
            console.error("UI Initialisierung fehlgeschlagen: Kernmodule oder Daten nicht verfügbar.");
            return;
        }
        _state.init();
        _updateGlobalUIState();

        const initialTabId = _state.getActiveTabId() || APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB_ID || 'daten-tab-pane';
        _viewRenderer.showTab(initialTabId);

        const appVersionFooter = document.getElementById('app-version-footer');
        if (appVersionFooter && APP_CONFIG.APP_VERSION) {
            appVersionFooter.textContent = APP_CONFIG.APP_VERSION;
        }
        const kurzanleitungModalBody = document.getElementById('kurzanleitung-modal-body');
        if(kurzanleitungModalBody && UI_TEXTS.kurzanleitung && UI_TEXTS.kurzanleitung.content) {
            kurzanleitungModalBody.innerHTML = UI_TEXTS.kurzanleitung.content;
        }
         const kurzanleitungModalLabel = document.getElementById('kurzanleitungModalLabel');
         if(kurzanleitungModalLabel && UI_TEXTS.kurzanleitung && UI_TEXTS.kurzanleitung.title) {
            kurzanleitungModalLabel.innerHTML = `<i class="fas fa-info-circle me-2"></i> ${UI_TEXTS.kurzanleitung.title}`;
         }
    }

    function _attachGlobalEventListeners() {
        const kollektivButtons = document.querySelectorAll('#kollektiv-buttons-container button[data-kollektiv]');
        kollektivButtons.forEach(button => {
            button.addEventListener('click', () => _generalEventHandlers.handleKollektivChange(button.dataset.kollektiv, mainAppInterface));
        });

        const navLinks = document.querySelectorAll('.nav-tabs .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('shown.bs.tab', (event) => _generalEventHandlers.handleTabShownEvent(event, mainAppInterface));
        });

        document.body.addEventListener('click', (event) => {
            const sortHeader = event.target.closest('th[data-sort-key]');
            const sortSubHeader = event.target.closest('.sortable-sub-header');
            if (sortSubHeader && sortHeader) {
                _generalEventHandlers.handleSortClick(sortHeader, sortSubHeader, mainAppInterface);
            } else if (sortHeader && !sortHeader.querySelector('.sortable-sub-header')) {
                 _generalEventHandlers.handleSortClick(sortHeader, null, mainAppInterface);
            }

            if (event.target.closest('#daten-toggle-details')) {
                _generalEventHandlers.handleToggleAllDetailsClick('daten-toggle-details', 'daten-table-body');
            }
            if (event.target.closest('#auswertung-toggle-details')) {
                _generalEventHandlers.handleToggleAllDetailsClick('auswertung-toggle-details', 'auswertung-table-body');
            }
            if (event.target.closest('#kurzanleitung-button')) {
                _generalEventHandlers.handleKurzanleitungClick();
            }
            if (event.target.closest('#export-bruteforce-modal-txt')) {
                _generalEventHandlers.handleModalExportBruteForceClick();
            }
            const chartDownloadBtn = event.target.closest('.chart-download-btn');
            if(chartDownloadBtn) {
                _generalEventHandlers.handleSingleChartDownload(chartDownloadBtn);
            }
            const tableDownloadPngBtn = event.target.closest('.table-download-png-btn');
            if(tableDownloadPngBtn) {
                _generalEventHandlers.handleSingleTableDownload(tableDownloadPngBtn);
            }
        });

        if (_auswertungEventHandlers) _auswertungEventHandlers.attachEventListeners(mainAppInterface);
        if (_statistikEventHandlers) _statistikEventHandlers.attachEventListeners(mainAppInterface);
        if (_praesentationEventHandlers) _praesentationEventHandlers.attachEventListeners(mainAppInterface);
        if (_publikationEventHandlers) _publikationEventHandlers.attachEventListeners(mainAppInterface);

        const exportTab = document.getElementById('export-tab-pane');
        if (exportTab && _exportService) {
            exportTab.addEventListener('click', (event) => {
                const button = event.target.closest('button[id^="export-"]');
                if (button) {
                    _exportService.handleExportAction(
                        button.id,
                        _processedData,
                        _state.getCurrentKollektiv(),
                        _t2CriteriaManager.getAppliedT2Criteria(),
                        _t2CriteriaManager.getAppliedT2Logic(),
                        _bruteForceManager.getAllResults(),
                        _state,
                        mainAppInterface
                    );
                }
            });
        }
    }

    function _handleGlobalKollektivChange(newKollektiv, source = "user") {
        if (_state.getCurrentKollektiv() === newKollektiv && source === "user") return false;
        _state.setCurrentKollektiv(newKollektiv);
        _state.setCurrentDatenTablePage(1);
        _state.setCurrentAuswertungTablePage(1);
        _updateGlobalUIState();
        _viewRenderer.refreshCurrentTab();
        if (_uiHelpers && source === "user") _uiHelpers.showToast(`Kollektiv auf '${getKollektivDisplayName(newKollektiv)}' geändert.`, 'info');
        return true;
    }

    function _processTabChange(targetTabId) {
        _state.setActiveTabId(targetTabId);
        _viewRenderer.refreshCurrentTab(targetTabId, true);
    }

    function _handleSortRequest(tableContext, key, subKey = null) {
        let currentSort, pageSetter, newPage = 1;

        if (tableContext === 'daten') {
            currentSort = _state.getCurrentDatenTableSort();
            pageSetter = _state.setCurrentDatenTablePage;
        } else if (tableContext === 'auswertung') {
            currentSort = _state.getCurrentAuswertungTableSort();
            pageSetter = _state.setCurrentAuswertungTablePage;
        } else {
            return;
        }

        let direction = 'asc';
        if (currentSort.key === key && (currentSort.subKey === subKey || (currentSort.subKey === null && subKey === null) )) {
            direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        }

        const newSortState = { key, direction, subKey };

        if (tableContext === 'daten') {
            _state.setCurrentDatenTableSort(newSortState);
        } else if (tableContext === 'auswertung') {
            _state.setCurrentAuswertungTableSort(newSortState);
        }
        pageSetter(newPage);
        _viewRenderer.refreshCurrentTab();
    }

    function _applyAndRefreshAll() {
        _t2CriteriaManager.applyCriteria();
        _state.setUnsavedCriteriaChanges(false);
        _processedData = _t2CriteriaManager.evaluateDataset(getGlobalData(), _t2CriteriaManager.getAppliedT2Criteria(), _t2CriteriaManager.getAppliedT2Logic());
        _updateGlobalUIState();
        _viewRenderer.refreshCurrentTab();
    }

    function init() {
        document.addEventListener('DOMContentLoaded', () => {
            const appContainer = document.getElementById('app-container');
            const loadingIndicator = document.getElementById('loading-indicator');

            const modulesInitialized = _initializeModules();
            if(!modulesInitialized && appContainer && loadingIndicator) {
                loadingIndicator.innerHTML = '<p class="text-danger">Fehler beim Laden der Anwendungsmodule. Bitte Konsole prüfen.</p>';
                return;
            }

            _loadAndProcessData();
            _setupInitialView();
            _attachGlobalEventListeners();


            if(appContainer) appContainer.classList.remove('d-none');
            if(loadingIndicator) loadingIndicator.style.display = 'none';

            if(_uiHelpers && typeof _uiHelpers.initializeTooltips === 'function'){
                 setTimeout(() => _uiHelpers.initializeTooltips(document.body), 500);
            }
        });
    }

    return Object.freeze({
        init,
        getGlobalData: () => _processedData ? cloneDeep(_processedData) : [],
        getRawData: () => _globalRawData ? cloneDeep(_globalRawData) : [],
        getProcessedData: () => _processedData ? cloneDeep(_processedData) : [],
        renderView,
        refreshCurrentTab,
        handleGlobalKollektivChange: _handleGlobalKollektivChange,
        processTabChange: _processTabChange,
        handleSortRequest: _handleSortRequest,
        applyAndRefreshAll: _applyAndRefreshAll,
        updateGlobalUIState: _updateGlobalUIState
    });

})();

mainAppInterface.init();
