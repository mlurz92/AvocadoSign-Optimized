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
         if (_citationManager && typeof _citationManager.init === 'function') {
            _citationManager.init();
        }


        if (_bruteForceManager && typeof _bruteForceManager.init === 'function' && typeof APP_CONFIG !== 'undefined' && APP_CONFIG.PATHS?.BRUTE_FORCE_WORKER) {
            const workerInitialized = _bruteForceManager.init({
                onProgress: (progressData) => {
                    if (_uiHelpers && _viewRenderer && _bruteForceManager && _state) {
                        _uiHelpers.updateBruteForceUI('progress', progressData, _bruteForceManager.isWorkerAvailable(), progressData.kollektiv);
                         if (typeof _state.getActiveTabId === 'function' && _state.getActiveTabId() === 'auswertung-tab-pane' && typeof _viewRenderer.refreshCurrentTab === 'function') _viewRenderer.refreshCurrentTab();
                    }
                },
                onResult: (resultData) => {
                    if (_uiHelpers && _viewRenderer && _bruteForceManager && _state && _uiComponents) {
                        _uiHelpers.updateBruteForceUI('result', resultData, _bruteForceManager.isWorkerAvailable(), resultData.kollektiv);
                        const modalBody = document.getElementById('brute-force-modal-body');
                        if (modalBody && typeof _uiComponents.createBruteForceModalContent === 'function') {
                             modalBody.innerHTML = _uiComponents.createBruteForceModalContent(resultData);
                        }
                        if (_uiHelpers) _uiHelpers.initializeTooltips(modalBody);
                         if (typeof _state.getActiveTabId === 'function' && _state.getActiveTabId() === 'auswertung-tab-pane' && typeof _viewRenderer.refreshCurrentTab === 'function') _viewRenderer.refreshCurrentTab();
                        const hasBruteForceResults = _bruteForceManager.hasAnyResults ? _bruteForceManager.hasAnyResults() : Object.keys(_bruteForceManager.getAllResults() || {}).length > 0;
                         _uiHelpers.updateExportButtonStates(_state.getActiveTabId(), hasBruteForceResults, (_processedData?.length ?? 0) > 0);
                    }
                },
                onError: (errorData) => {
                    if (_uiHelpers && _viewRenderer && _bruteForceManager && _state) {
                        _uiHelpers.showToast(`Brute-Force Fehler: ${errorData.message}`, 'danger');
                        _uiHelpers.updateBruteForceUI('error', errorData, _bruteForceManager.isWorkerAvailable(), errorData.kollektiv);
                        if (typeof _state.getActiveTabId === 'function' && _state.getActiveTabId() === 'auswertung-tab-pane' && typeof _viewRenderer.refreshCurrentTab === 'function') _viewRenderer.refreshCurrentTab();
                    }
                },
                onCancelled: (cancelData) => {
                    if (_uiHelpers && _viewRenderer && _bruteForceManager && _state) {
                        _uiHelpers.showToast('Brute-Force Analyse abgebrochen.', 'warning');
                        _uiHelpers.updateBruteForceUI('cancelled', cancelData, _bruteForceManager.isWorkerAvailable(), cancelData.kollektiv);
                         if (typeof _state.getActiveTabId === 'function' && _state.getActiveTabId() === 'auswertung-tab-pane' && typeof _viewRenderer.refreshCurrentTab === 'function') _viewRenderer.refreshCurrentTab();
                    }
                },
                onStarted: (startData) => {
                     if (_uiHelpers && _viewRenderer && _bruteForceManager && _state) {
                        _uiHelpers.updateBruteForceUI('started', startData, _bruteForceManager.isWorkerAvailable(), startData.kollektiv);
                         if (typeof _state.getActiveTabId === 'function' && _state.getActiveTabId() === 'auswertung-tab-pane' && typeof _viewRenderer.refreshCurrentTab === 'function') _viewRenderer.refreshCurrentTab();
                     }
                }
            });
             if(!workerInitialized && _uiHelpers) {
                _uiHelpers.showToast("Brute-Force Worker konnte nicht initialisiert werden.", "warning");
             }
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
            _processedData = _dataProcessor.processPatientData(cloneDeep(_globalRawData));
        } else {
            console.error("Data Processor nicht verfügbar. Daten können nicht verarbeitet werden.");
            _processedData = cloneDeep(_globalRawData);
        }

        if (_t2CriteriaManager && typeof _t2CriteriaManager.evaluateDataset === 'function' && _processedData) {
            _processedData = _t2CriteriaManager.evaluateDataset(_processedData, _t2CriteriaManager.getAppliedT2Criteria(), _t2CriteriaManager.getAppliedT2Logic());
        } else {
            console.error("T2CriteriaManager nicht verfügbar oder Daten fehlen. T2 Status kann nicht initial berechnet werden.");
             if (_processedData) {
                _processedData.forEach(p => {
                    if(p) {
                        p.t2 = null;
                        p.anzahl_t2_plus_lk = 0;
                        p.lymphknoten_t2_bewertet = (p.lymphknoten_t2 || []).map(lk => ({...lk, isPositive: false, checkResult: {}}));
                    }
                });
            }
        }
    }

    function _updateGlobalUIState() {
        if (!_state || !_uiHelpers || !_dataProcessor || !_processedData) return;
        const currentKollektiv = _state.getCurrentKollektiv();
        _uiHelpers.updateKollektivButtonsUI(currentKollektiv);

        const filteredData = _dataProcessor.filterDataByKollektiv(_processedData, currentKollektiv);
        const headerStats = _dataProcessor.calculateHeaderStats(filteredData, currentKollektiv);
        _uiHelpers.updateHeaderStatsUI(headerStats);
        if (_bruteForceManager && _uiHelpers && _state) {
            const hasBruteForceResults = _bruteForceManager.hasAnyResults ? _bruteForceManager.hasAnyResults() : Object.keys(_bruteForceManager.getAllResults() || {}).length > 0;
             _uiHelpers.updateExportButtonStates(_state.getActiveTabId(), hasBruteForceResults, (_processedData?.length ?? 0) > 0);
        }
    }

    function _setupInitialView() {
        if (!_state || !_viewRenderer || !_uiHelpers || !_dataProcessor || !_processedData) {
            console.error("UI Initialisierung fehlgeschlagen: Kernmodule oder Daten nicht verfügbar.");
            return;
        }
        _state.init();
        _updateGlobalUIState();

        const initialTabId = _state.getActiveTabId() || (typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB_ID : null) || 'daten-tab-pane';
        if (typeof _viewRenderer.showTab === 'function') {
            _viewRenderer.showTab(initialTabId);
        }


        const appVersionFooter = document.getElementById('app-version-footer');
        if (appVersionFooter && typeof APP_CONFIG !== 'undefined' && APP_CONFIG.APP_VERSION) {
            appVersionFooter.textContent = APP_CONFIG.APP_VERSION;
        }
        const kurzanleitungModalBody = document.getElementById('kurzanleitung-modal-body');
        if(kurzanleitungModalBody && typeof UI_TEXTS !== 'undefined' && UI_TEXTS.kurzanleitung && UI_TEXTS.kurzanleitung.content) {
            kurzanleitungModalBody.innerHTML = UI_TEXTS.kurzanleitung.content;
        }
         const kurzanleitungModalLabel = document.getElementById('kurzanleitungModalLabel');
         if(kurzanleitungModalLabel && typeof UI_TEXTS !== 'undefined' && UI_TEXTS.kurzanleitung && UI_TEXTS.kurzanleitung.title) {
            kurzanleitungModalLabel.innerHTML = `<i class="fas fa-info-circle me-2"></i> ${UI_TEXTS.kurzanleitung.title}`;
         }
    }

    function _attachGlobalEventListeners() {
        if(!_generalEventHandlers || !_uiHelpers || !_state || !_exportService) return;

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

            const exportButton = event.target.closest('button[id^="export-"]');
            if (exportButton && exportButton.id !== 'export-bruteforce-modal-txt') {
                 const exportActionId = exportButton.id;
                 const currentKollektiv = _state.getCurrentKollektiv();
                 const globalData = getGlobalData();
                 const appliedCriteria = _t2CriteriaManager.getAppliedT2Criteria();
                 const appliedLogic = _t2CriteriaManager.getAppliedT2Logic();
                 const bfResults = _bruteForceManager.getAllResults();

                switch (exportActionId) {
                    case 'export-statistik-csv':
                        _exportService.exportStatistikCSV(globalData, currentKollektiv, appliedCriteria, appliedLogic);
                        break;
                    case 'export-bruteforce-txt':
                        const bfData = _bruteForceManager.getResultsForKollektiv(currentKollektiv);
                        if (bfData) _exportService.exportBruteForceReport(bfData);
                        else _uiHelpers.showToast("Keine Brute-Force Daten für Export.", "warning");
                        break;
                    case 'export-deskriptiv-md':
                        const statsData = _statisticsService.calculateDescriptiveStats(_dataProcessor.filterDataByKollektiv(globalData, currentKollektiv));
                        _exportService.exportTableMarkdown(statsData, 'deskriptiv', currentKollektiv);
                        break;
                    case 'export-daten-md':
                        _exportService.exportTableMarkdown(_dataProcessor.filterDataByKollektiv(globalData, currentKollektiv), 'daten', currentKollektiv);
                        break;
                    case 'export-auswertung-md':
                         _exportService.exportTableMarkdown(_dataProcessor.filterDataByKollektiv(globalData, currentKollektiv), 'auswertung', currentKollektiv, appliedCriteria, appliedLogic);
                        break;
                    case 'export-filtered-data-csv':
                        _exportService.exportFilteredDataCSV(_dataProcessor.filterDataByKollektiv(globalData, currentKollektiv), currentKollektiv);
                        break;
                    case 'export-comprehensive-report-html':
                        _exportService.exportComprehensiveReportHTML(globalData, bfResults[currentKollektiv], currentKollektiv, appliedCriteria, appliedLogic);
                        break;
                    case 'export-publication-md':
                        _exportService.exportPublicationMarkdown(_state, _statisticsService, _dataProcessor, _bruteForceManager, mainAppInterface);
                        break;
                    case 'export-charts-png':
                        _exportService.exportChartsZip('#app-container', 'PNG_ZIP', currentKollektiv, 'png');
                        break;
                    case 'export-charts-svg':
                        _exportService.exportChartsZip('#app-container', 'SVG_ZIP', currentKollektiv, 'svg');
                        break;
                    case 'export-all-zip':
                    case 'export-csv-zip':
                    case 'export-md-zip':
                    case 'export-png-zip': // Wird durch exportChartsZip gehandhabt
                    case 'export-svg-zip': // Wird durch exportChartsZip gehandhabt
                         const category = exportActionId.replace('export-', '').replace('-zip','');
                        _exportService.exportCategoryZip(category, globalData, bfResults, currentKollektiv, appliedCriteria, appliedLogic);
                        break;
                    default:
                        console.warn(`Unbekannte Export-Aktion: ${exportActionId}`);
                        _uiHelpers.showToast("Unbekannte Export-Aktion.", "warning");
                        break;
                }
            }
        });

        if (_auswertungEventHandlers) _auswertungEventHandlers.attachEventListeners(mainAppInterface);
        if (_statistikEventHandlers) _statistikEventHandlers.attachEventListeners(mainAppInterface);
        if (_praesentationEventHandlers) _praesentationEventHandlers.attachEventListeners(mainAppInterface);
        if (_publikationEventHandlers) _publikationEventHandlers.attachEventListeners(mainAppInterface);
    }

    function _handleGlobalKollektivChange(newKollektiv, source = "user") {
        if (!_state || !_dataProcessor || !_viewRenderer || !_uiHelpers) return false;
        if (_state.getCurrentKollektiv() === newKollektiv && source === "user") return false;

        _state.setCurrentKollektiv(newKollektiv);
        _state.setCurrentDatenTablePage(1);
        _state.setCurrentAuswertungTablePage(1);
        _updateGlobalUIState();
        _viewRenderer.refreshCurrentTab();
        if (source === "user") _uiHelpers.showToast(`Kollektiv auf '${getKollektivDisplayName(newKollektiv)}' geändert.`, 'info');
        return true;
    }

    function _processTabChange(targetTabId) {
        if(!_state || !_viewRenderer) return;
        _state.setActiveTabId(targetTabId);
        _viewRenderer.refreshCurrentTab(targetTabId, true);
    }

    function _handleSortRequest(tableContext, key, subKey = null) {
        if(!_state || !_viewRenderer) return;
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
        if(!_t2CriteriaManager || !_state || !_globalRawData || !_viewRenderer || !_dataProcessor || !_uiHelpers) return;
        _t2CriteriaManager.applyCriteria();
        _state.setUnsavedCriteriaChanges(false);
        _processedData = _t2CriteriaManager.evaluateDataset(cloneDeep(_globalRawData), _t2CriteriaManager.getAppliedT2Criteria(), _t2CriteriaManager.getAppliedT2Logic());
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
        getGlobalData: () => _globalRawData ? cloneDeep(_globalRawData) : [], // Gibt die Rohdaten zurück, da _processedData T2-abhängig ist
        getRawData: () => _globalRawData ? cloneDeep(_globalRawData) : [],
        getProcessedData: () => _processedData ? cloneDeep(_processedData) : [], // Gibt die aktuell verarbeiteten Daten zurück
        renderView: (tabId) => { // Exponierte Methode
            if (_viewRenderer && typeof _viewRenderer.showTab === 'function') {
                _viewRenderer.showTab(tabId);
            }
        },
        refreshCurrentTab: () => { // Exponierte Methode
             if (_viewRenderer && typeof _viewRenderer.refreshCurrentTab === 'function') {
                _viewRenderer.refreshCurrentTab();
            }
        },
        handleGlobalKollektivChange: _handleGlobalKollektivChange,
        processTabChange: _processTabChange,
        handleSortRequest: _handleSortRequest,
        applyAndRefreshAll: _applyAndRefreshAll,
        updateGlobalUIState: _updateGlobalUIState
    });

})();

mainAppInterface.init();
