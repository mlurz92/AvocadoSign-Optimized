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
    let _utils = null;

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
        _utils = typeof utils === 'object' && utils !== null ? utils : null;

        _generalEventHandlers = typeof generalEventHandlers !== 'undefined' ? generalEventHandlers : null;
        _auswertungEventHandlers = typeof auswertungEventHandlers !== 'undefined' ? auswertungEventHandlers : null;
        _statistikEventHandlers = typeof statistikEventHandlers !== 'undefined' ? statistikEventHandlers : null;
        _praesentationEventHandlers = typeof praesentationEventHandlers !== 'undefined' ? praesentationEventHandlers : null;
        _publikationEventHandlers = typeof publikationEventHandlers !== 'undefined' ? publikationEventHandlers : null;

        const modules = {
            _appConfig: typeof APP_CONFIG,
            _publicationConfig: typeof PUBLICATION_CONFIG,
            _radiologyFormatConfig: typeof RADIOLOGY_FORMAT_CONFIG,
            _textConfig: typeof UI_TEXTS,
            _tooltipConfig: typeof TOOLTIP_CONTENT,
            _utilsMod: _utils,
            _radiologyFormatterMod: _radiologyFormatter,
            _citationManagerMod: _citationManager,
            _patientDataGlobal: typeof PATIENT_DATA,
            _dataProcessorMod: _dataProcessor,
            _t2CriteriaManagerMod: _t2CriteriaManager,
            _studyT2CriteriaManagerMod: _studyT2CriteriaManager,
            _statisticsServiceMod: _statisticsService,
            _bruteForceManagerMod: _bruteForceManager,
            _exportServiceMod: _exportService,
            _uiHelpersMod: _uiHelpers,
            _uiComponentsMod: _uiComponents,
            _paginationManagerMod: _paginationManager,
            _tableRendererMod: _tableRenderer,
            _chartRendererMod: _chartRenderer,
            _publicationTextGeneratorMod: _publicationTextGenerator,
            _publicationRendererMod: _publicationRenderer,
            _dataTabLogicGlobal: typeof dataTabLogic,
            _auswertungTabLogicGlobal: typeof auswertungTabLogic,
            _statistikTabLogicGlobal: typeof statistikTabLogic,
            _praesentationTabLogicGlobal: typeof praesentationTabLogic,
            _publikationTabLogicMod: _publikationTabLogic,
            _viewRendererMod: _viewRenderer,
            _generalEventHandlersMod: _generalEventHandlers,
            _auswertungEventHandlersMod: _auswertungEventHandlers,
            _statistikEventHandlersMod: _statistikEventHandlers,
            _praesentationEventHandlersMod: _praesentationEventHandlers,
            _publikationEventHandlersMod: _publikationEventHandlers,
            _stateMod: _state
        };

        let allModulesAvailable = true;
        for (const moduleName in modules) {
            const moduleValue = modules[moduleName];
            let isUnavailable = false;

            if (moduleName.endsWith('Global') || moduleName.startsWith('_appConfig') || moduleName.startsWith('_publicationConfig') || moduleName.startsWith('_radiologyFormatConfig') || moduleName.startsWith('_textConfig') || moduleName.startsWith('_tooltipConfig') || moduleName.startsWith('_patientDataGlobal')) {
                if (moduleValue === 'undefined') {
                    isUnavailable = true;
                }
            } else {
                if (moduleValue === null) {
                    isUnavailable = true;
                }
            }

            if (isUnavailable) {
                console.error(`Modul oder Konfiguration ${moduleName.replace('_','').replace('Mod','').replace('Global','')} konnte nicht initialisiert werden oder ist nicht verfügbar.`);
                allModulesAvailable = false;
            }
        }

        if (!allModulesAvailable) {
            if(_uiHelpers && typeof _uiHelpers.showToast === 'function') {
                _uiHelpers.showToast("Einige Kernmodule oder Konfigurationen konnten nicht geladen werden. Die Anwendung ist möglicherweise nicht voll funktionsfähig.", "danger", 10000);
            } else {
                alert("Kritischer Fehler: Kernmodule oder Konfigurationen konnten nicht geladen werden. Die Anwendung kann nicht gestartet werden.");
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
                        if (_uiHelpers && typeof _uiHelpers.initializeTooltips === 'function') _uiHelpers.initializeTooltips(modalBody);
                        if (typeof _state.getActiveTabId === 'function' && _state.getActiveTabId() === 'auswertung-tab-pane' && typeof _viewRenderer.refreshCurrentTab === 'function') _viewRenderer.refreshCurrentTab();
                        const hasBruteForceResults = _bruteForceManager.getAllResults && Object.keys(_bruteForceManager.getAllResults() || {}).length > 0;
                        if (_uiHelpers && typeof _uiHelpers.updateExportButtonStates === 'function') _uiHelpers.updateExportButtonStates(_state.getActiveTabId(), hasBruteForceResults, (_processedData?.length ?? 0) > 0);
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
            if (!workerInitialized && _uiHelpers && typeof _uiHelpers.showToast === 'function') {
                _uiHelpers.showToast("Brute-Force Worker konnte nicht initialisiert werden.", "warning");
            }
        }
        return true;
    }

    function _loadAndProcessData() {
        if(!_utils) {
            console.error("Utils Modul nicht verfügbar in _loadAndProcessData.");
            _globalRawData = [];
            _processedData = [];
            if(_uiHelpers && typeof _uiHelpers.showToast === 'function') _uiHelpers.showToast("Kritischer Fehler: Utils-Modul fehlt.", "danger");
            return;
        }

        if (typeof PATIENT_DATA !== 'undefined' && Array.isArray(PATIENT_DATA)) {
            _globalRawData = PATIENT_DATA;
        } else {
            console.error("Globale Patientendaten (PATIENT_DATA) nicht gefunden oder ungültig.");
            _globalRawData = [];
            if(_uiHelpers && typeof _uiHelpers.showToast === 'function') _uiHelpers.showToast("Fehler beim Laden der Patientendaten.", "danger");
        }

        if (_dataProcessor && typeof _dataProcessor.processPatientData === 'function') {
            _processedData = _dataProcessor.processPatientData(_utils.cloneDeep(_globalRawData));
        } else {
            console.error("Data Processor nicht verfügbar. Daten können nicht verarbeitet werden.");
            _processedData = _utils.cloneDeep(_globalRawData);
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
        if (!_state || !_uiHelpers || !_dataProcessor || !_processedData || !_utils) return;
        const currentKollektiv = _state.getCurrentKollektiv();
        _uiHelpers.updateKollektivButtonsUI(currentKollektiv);

        const filteredData = _dataProcessor.filterDataByKollektiv(_processedData, currentKollektiv);
        const headerStats = _dataProcessor.calculateHeaderStats(filteredData, currentKollektiv);
        _uiHelpers.updateHeaderStatsUI(headerStats);
        if (_bruteForceManager && _uiHelpers && _state) {
            const hasBruteForceResults = _bruteForceManager.getAllResults && Object.keys(_bruteForceManager.getAllResults() || {}).length > 0;
            if(typeof _uiHelpers.updateExportButtonStates === 'function') _uiHelpers.updateExportButtonStates(_state.getActiveTabId(), hasBruteForceResults, (_processedData?.length ?? 0) > 0);
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
        if(!_generalEventHandlers || !_uiHelpers || !_state || !_exportService || !_dataProcessor || !_t2CriteriaManager || !_bruteForceManager || !_statisticsService || !_utils) {
            console.error("Einige Kernmodule für globale EventListener fehlen.");
            return;
        }

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
                const globalDataForExport = getGlobalData();
                const appliedCriteriaForExport = _t2CriteriaManager.getAppliedT2Criteria();
                const appliedLogicForExport = _t2CriteriaManager.getAppliedT2Logic();
                const bfResultsForExport = _bruteForceManager.getAllResults();
                const filteredDataForExport = _dataProcessor.filterDataByKollektiv(globalDataForExport, currentKollektiv);

                switch (exportActionId) {
                    case 'export-statistik-csv':
                        if(typeof _exportService.exportStatistikCSV === 'function') _exportService.exportStatistikCSV(globalDataForExport, currentKollektiv, appliedCriteriaForExport, appliedLogicForExport);
                        else console.warn('Exportfunktion exportStatistikCSV nicht gefunden.');
                        break;
                    case 'export-bruteforce-txt':
                        const bfData = _bruteForceManager.getResultsForKollektiv(currentKollektiv);
                        if (bfData && typeof _exportService.exportBruteForceReport === 'function') _exportService.exportBruteForceReport(bfData);
                        else if (!bfData && _uiHelpers && typeof _uiHelpers.showToast === 'function') _uiHelpers.showToast("Keine Brute-Force Daten für Export.", "warning");
                        else console.warn('Exportfunktion exportBruteForceReport nicht gefunden.');
                        break;
                    case 'export-deskriptiv-md':
                        const statsData = _statisticsService.calculateDescriptiveStats(filteredDataForExport);
                        if(typeof _exportService.exportTableMarkdown === 'function') _exportService.exportTableMarkdown(statsData, 'deskriptiv', currentKollektiv);
                        else console.warn('Exportfunktion exportTableMarkdown nicht gefunden.');
                        break;
                    case 'export-daten-md':
                        if(typeof _exportService.exportTableMarkdown === 'function') _exportService.exportTableMarkdown(filteredDataForExport, 'daten', currentKollektiv);
                        else console.warn('Exportfunktion exportTableMarkdown nicht gefunden.');
                        break;
                    case 'export-auswertung-md':
                        if(typeof _exportService.exportTableMarkdown === 'function') _exportService.exportTableMarkdown(filteredDataForExport, 'auswertung', currentKollektiv, appliedCriteriaForExport, appliedLogicForExport);
                        else console.warn('Exportfunktion exportTableMarkdown nicht gefunden.');
                        break;
                    case 'export-filtered-data-csv':
                        if(typeof _exportService.exportFilteredDataCSV === 'function') _exportService.exportFilteredDataCSV(filteredDataForExport, currentKollektiv);
                        else console.warn('Exportfunktion exportFilteredDataCSV nicht gefunden.');
                        break;
                    case 'export-comprehensive-report-html':
                        if(typeof _exportService.exportComprehensiveReportHTML === 'function') _exportService.exportComprehensiveReportHTML(globalDataForExport, bfResultsForExport[currentKollektiv], currentKollektiv, appliedCriteriaForExport, appliedLogicForExport);
                        else console.warn('Exportfunktion exportComprehensiveReportHTML nicht gefunden.');
                        break;
                    case 'export-publication-md':
                        if (typeof _exportService.exportPublicationMarkdown === 'function') {
                            _exportService.exportPublicationMarkdown(_state, _statisticsService, _dataProcessor, _bruteForceManager, mainAppInterface, _publicationTextGenerator, _publikationTabLogic);
                        } else {
                            console.warn("ExportService: exportPublicationMarkdown nicht implementiert.");
                            if (_uiHelpers && typeof _uiHelpers.showToast === 'function') _uiHelpers.showToast("Publikations-Markdown-Export (noch) nicht verfügbar.", "info");
                        }
                        break;
                    case 'export-charts-png':
                        if(typeof _exportService.exportChartsZip === 'function') _exportService.exportChartsZip('#app-container', 'PNG_ZIP', currentKollektiv, 'png');
                        else console.warn('Exportfunktion exportChartsZip nicht gefunden.');
                        break;
                    case 'export-charts-svg':
                        if(typeof _exportService.exportChartsZip === 'function') _exportService.exportChartsZip('#app-container', 'SVG_ZIP', currentKollektiv, 'svg');
                        else console.warn('Exportfunktion exportChartsZip nicht gefunden.');
                        break;
                    case 'export-all-zip':
                    case 'export-csv-zip':
                    case 'export-md-zip':
                        const category = exportActionId.replace('export-', '').replace('-zip','');
                        if(typeof _exportService.exportCategoryZip === 'function') _exportService.exportCategoryZip(category, globalDataForExport, bfResultsForExport, currentKollektiv, appliedCriteriaForExport, appliedLogicForExport);
                        else console.warn('Exportfunktion exportCategoryZip nicht gefunden.');
                        break;
                    default:
                        if (!exportActionId.startsWith('export-png-zip') && !exportActionId.startsWith('export-svg-zip') && !exportActionId.startsWith('export-xlsx-zip')) {
                            console.warn(`Unbekannte Export-Aktion: ${exportActionId}`);
                            if (_uiHelpers && typeof _uiHelpers.showToast === 'function') _uiHelpers.showToast("Unbekannte Export-Aktion.", "warning");
                        }
                        break;
                }
            }
        });

        if (_auswertungEventHandlers && typeof _auswertungEventHandlers.attachEventListeners === 'function') _auswertungEventHandlers.attachEventListeners(mainAppInterface);
        if (_statistikEventHandlers && typeof _statistikEventHandlers.attachEventListeners === 'function') _statistikEventHandlers.attachEventListeners(mainAppInterface);
        if (_praesentationEventHandlers && typeof _praesentationEventHandlers.attachEventListeners === 'function') _praesentationEventHandlers.attachEventListeners(mainAppInterface);
        if (_publikationEventHandlers && typeof _publikationEventHandlers.attachEventListeners === 'function') _publikationEventHandlers.attachEventListeners(mainAppInterface);
    }

    function _handleGlobalKollektivChange(newKollektiv, source = "user") {
        if (!_state || !_dataProcessor || !_viewRenderer || !_uiHelpers || !_utils) return false;
        if (_state.getCurrentKollektiv() === newKollektiv && source === "user") return false;

        _state.setCurrentKollektiv(newKollektiv);
        _state.setCurrentDatenTablePage(1);
        _state.setCurrentAuswertungTablePage(1);
        _updateGlobalUIState();
        _viewRenderer.refreshCurrentTab();
        if (source === "user" && _utils && typeof _utils.getKollektivDisplayName === 'function') {
            if (_uiHelpers && typeof _uiHelpers.showToast === 'function') _uiHelpers.showToast(`Kollektiv auf '${_utils.getKollektivDisplayName(newKollektiv)}' geändert.`, 'info');
        } else if (source === "user" && _uiHelpers && typeof _uiHelpers.showToast === 'function') {
             _uiHelpers.showToast(`Kollektiv auf '${newKollektiv}' geändert.`, 'info');
        }
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
        if(!_t2CriteriaManager || !_state || !_globalRawData || !_viewRenderer || !_dataProcessor || !_uiHelpers || !_utils) return;
        _t2CriteriaManager.applyCriteria();
        _state.setUnsavedCriteriaChanges(false);
        _processedData = _t2CriteriaManager.evaluateDataset(_utils.cloneDeep(_globalRawData), _t2CriteriaManager.getAppliedT2Criteria(), _t2CriteriaManager.getAppliedT2Logic());
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
        getGlobalData: () => (_globalRawData && _utils) ? _utils.cloneDeep(_globalRawData) : [],
        getRawData: () => (_globalRawData && _utils) ? _utils.cloneDeep(_globalRawData) : [],
        getProcessedData: () => (_processedData && _utils) ? _utils.cloneDeep(_processedData) : [],
        renderView: (tabId) => {
            if (_viewRenderer && typeof _viewRenderer.showTab === 'function') {
                _viewRenderer.showTab(tabId);
            }
        },
        refreshCurrentTab: () => {
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
