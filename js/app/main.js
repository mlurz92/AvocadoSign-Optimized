(function() {
    'use strict';

    const CORE_MODULE_DEFINITIONS = [
        { name: 'APP_CONFIG', path: 'js/config/app_config.js', expectedType: 'object' },
        { name: 'UI_TEXTS', path: 'js/config/text_config.js', expectedType: 'object' },
        { name: 'TOOLTIP_CONTENT', path: 'js/config/text_config.js', expectedType: 'object' },
        { name: 'PUBLICATION_CONFIG', path: 'js/config/publication_config.js', expectedType: 'object' },
        { name: 'PUBLICATION_CONTENT_TEMPLATES', path: 'js/config/publication_content_templates.js', expectedType: 'object' },
        { name: 'getKollektivDisplayName', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'formatNumber', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'formatPercent', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'formatCI', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'getCurrentDateString', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'saveToLocalStorage', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'loadFromLocalStorage', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'debounce', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'isObject', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'cloneDeep', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'deepMerge', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'getObjectValueByPath', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'getSortFunction', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'getStatisticalSignificanceSymbol', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'getStatisticalSignificanceText', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'getPValueText', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'generateUUID', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'clampNumber', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'arraysAreEqual', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'getAUCBewertung', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'getPhiBewertung', path: 'js/utils/utils.js', expectedType: 'function' },
        { name: 'patientData', path: 'data/data.js', expectedType: 'array' },
        { name: 'dataProcessor', path: 'js/core/data_processor.js', expectedType: 'object' },
        { name: 't2CriteriaManager', path: 'js/core/t2_criteria_manager.js', expectedType: 'object' },
        { name: 'studyT2CriteriaManager', path: 'js/core/study_criteria_manager.js', expectedType: 'object' },
        { name: 'statisticsService', path: 'js/services/statistics_service.js', expectedType: 'object' },
        { name: 'bruteForceManager', path: 'js/services/brute_force_manager.js', expectedType: 'object' },
        { name: 'exportService', path: 'js/services/export_service.js', expectedType: 'object' },
        { name: 'stateManager', path: 'js/app/state.js', expectedType: 'object' },
        { name: 'ui_helpers', path: 'js/ui/core/ui_helpers.js', expectedType: 'object' },
        { name: 'uiComponents', path: 'js/ui/core/ui_components.js', expectedType: 'object' },
        { name: 'tableRenderer', path: 'js/ui/renderers/table_renderer.js', expectedType: 'object' },
        { name: 'chartRenderer', path: 'js/ui/renderers/chart_renderer.js', expectedType: 'object' },
        { name: 'publicationTextGenerator', path: 'js/ui/renderers/publication_text_generator.js', expectedType: 'object' },
        { name: 'publicationRenderer', path: 'js/ui/renderers/publication_renderer.js', expectedType: 'object' },
        { name: 'dataTabLogic', path: 'js/ui/view_logic/data_tab_logic.js', expectedType: 'object' },
        { name: 'auswertungTabLogic', path: 'js/ui/view_logic/auswertung_tab_logic.js', expectedType: 'object' },
        { name: 'statistikTabLogic', path: 'js/ui/view_logic/statistik_tab_logic.js', expectedType: 'object' },
        { name: 'praesentationTabLogic', path: 'js/ui/view_logic/praesentation_tab_logic.js', expectedType: 'object' },
        { name: 'publikationTabLogic', path: 'js/ui/view_logic/publikation_tab_logic.js', expectedType: 'object' },
        { name: 'viewRenderer', path: 'js/ui/view_renderer.js', expectedType: 'object' },
        { name: 'generalEventHandlers', path: 'js/ui/event_handlers/general_event_handlers.js', expectedType: 'object' },
        { name: 'dataTabEventHandlers', path: 'js/ui/event_handlers/data_tab_event_handlers.js', expectedType: 'object' },
        { name: 'auswertungEventHandlers', path: 'js/ui/event_handlers/auswertung_event_handlers.js', expectedType: 'object' },
        { name: 'statistikEventHandlers', path: 'js/ui/event_handlers/statistik_event_handlers.js', expectedType: 'object' },
        { name: 'praesentationEventHandlers', path: 'js/ui/event_handlers/praesentation_event_handlers.js', expectedType: 'object' },
        { name: 'publikationEventHandlers', path: 'js/ui/event_handlers/publikation_event_handlers.js', expectedType: 'object' },
        { name: 'exportEventHandlers', path: 'js/ui/event_handlers/export_event_handlers.js', expectedType: 'object' }
    ];

    let currentActiveTabId = null;
    let currentKollektiv = null;
    let currentT2Criteria = null;
    let currentT2Logic = null;
    let currentData = null;
    let currentHeaderStats = null;

    const mainAppInterface = {
        handleKollektivChange: (newKollektiv) => {
            currentKollektiv = newKollektiv;
            stateManager.setCurrentKollektiv(newKollektiv);
            mainAppInterface.refreshAllTabs(true);
        },
        handleT2CriteriaChange: (newCriteria, newLogic) => {
            currentT2Criteria = newCriteria;
            currentT2Logic = newLogic;
            mainAppInterface.refreshCurrentTab(true);
        },
        handleSortChange: (tabId, sortKey, subKey = null) => {
            if (tabId === 'daten-tab-pane') {
                dataTabLogic.handleSortChange(sortKey, subKey);
            } else if (tabId === 'auswertung-tab-pane') {
                auswertungTabLogic.handleSortChange(sortKey, subKey);
            }
        },
        handlePublikationSettingsChange: () => {
            const currentPublikationSection = stateManager.getCurrentPublikationSection();
            const currentPublikationLang = stateManager.getCurrentPublikationLang();
            const currentKollektivForContext = stateManager.getCurrentKollektiv();

            const commonData = {
                appName: APP_CONFIG.APP_NAME,
                appVersion: APP_CONFIG.APP_VERSION,
                nGesamt: window.allKollektivStatsForPublikationTab?.Gesamt?.deskriptiv?.anzahlPatienten || 0,
                nDirektOP: window.allKollektivStatsForPublikationTab?.['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
                nNRCT: window.allKollektivStatsForPublikationTab?.nRCT?.deskriptiv?.anzahlPatienten || 0,
                t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
                t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
                bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
                significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
                references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
                bruteForceMetricForPublication: stateManager.getCurrentPublikationBruteForceMetric()
            };
            const publicationOptions = {
                currentKollektiv: currentKollektivForContext,
                bruteForceMetric: stateManager.getCurrentPublikationBruteForceMetric(),
                appliedCriteria: t2CriteriaManager.getAppliedCriteria(),
                appliedLogic: t2CriteriaManager.getAppliedLogic(),
                publicationElements: PUBLICATION_CONFIG.publicationElements 
            };
            
            const content = publicationRenderer.renderSectionContent(currentPublikationSection, currentPublikationLang, window.allKollektivStatsForPublikationTab, commonData, publicationOptions);
            const contentArea = document.getElementById('publikation-content-area');
            if (contentArea) {
                ui_helpers.updateElementHTML(contentArea.id, content);
                publikationTabLogic.updateDynamicChartsForPublicationTab(currentPublikationSection, currentPublikationLang, currentKollektivForContext);
                ui_helpers.initializeTooltips(contentArea);
            }
            ui_helpers.updatePublikationUI(currentPublikationLang, currentPublikationSection, stateManager.getCurrentPublikationBruteForceMetric());
        },
        handleExportRequest: (exportType, options = {}) => {
            const allStats = statisticsService.calculateAllStatsForPublication(
                dataProcessor.getRawData(),
                t2CriteriaManager.getAppliedCriteria(),
                t2CriteriaManager.getAppliedLogic(),
                bruteForceManager.getAllStoredResults()
            );
            const commonData = {
                appName: APP_CONFIG.APP_NAME,
                appVersion: APP_CONFIG.APP_VERSION,
                nGesamt: allStats.Gesamt?.deskriptiv?.anzahlPatienten || 0,
                nDirektOP: allStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
                nNRCT: allStats.nRCT?.deskriptiv?.anzahlPatienten || 0,
                t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
                t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
                bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
                significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
                references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
                bruteForceMetricForPublication: stateManager.getCurrentPublikationBruteForceMetric()
            };
            const publicationOptions = {
                currentKollektiv: stateManager.getCurrentKollektiv(),
                bruteForceMetric: stateManager.getCurrentPublikationBruteForceMetric(),
                appliedCriteria: t2CriteriaManager.getAppliedCriteria(),
                appliedLogic: t2CriteriaManager.getAppliedLogic(),
                publicationElements: PUBLICATION_CONFIG.publicationElements
            };

            switch (exportType) {
                case 'statistikCSV':
                    exportService.exportStatistikCSV(allStats, stateManager.getCurrentKollektiv(), t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
                    break;
                case 'bruteforce-txt':
                    const bfResults = bruteForceManager.getResultsForKollektiv(options.kollektiv, options.metric);
                    if (bfResults) {
                        exportService.exportBruteForceTXT(bfResults);
                    } else {
                        ui_helpers.showToast(`Keine Brute-Force Ergebnisse für Kollektiv '${getKollektivDisplayName(options.kollektiv)}' und Metrik '${options.metric}' vorhanden.`, "warning");
                    }
                    break;
                case 'deskriptivMD':
                     exportService.exportPublikationSectionMarkdown('statistik', 'deskriptiv', stateManager.getCurrentPublikationLang(), allStats, commonData, publicationOptions);
                    break;
                case 'datenMD':
                    const dataForDatenMD = dataProcessor.getProcessedData(stateManager.getCurrentKollektiv());
                    exportService.exportPublikationSectionMarkdown('daten', 'datenliste', stateManager.getCurrentPublikationLang(), allStats, commonData, { ...publicationOptions, data: dataForDatenMD });
                    break;
                case 'auswertungMD':
                    const dataForAuswertungMD = dataProcessor.getProcessedData(stateManager.getCurrentKollektiv());
                    exportService.exportPublikationSectionMarkdown('auswertung', 'auswertungstabelle', stateManager.getCurrentPublikationLang(), allStats, commonData, { ...publicationOptions, data: dataForAuswertungMD });
                    break;
                case 'filteredDataCSV':
                    exportService.exportStatistikCSV(allStats, stateManager.getCurrentKollektiv(), t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
                    break;
                case 'comprehensiveReportHTML':
                    ui_helpers.showToast("Umfassender HTML-Bericht wird generiert (Funktion noch nicht vollständig implementiert).", "info");
                    break;
                case 'chartSinglePNG':
                     if (options.chartId && options.format === 'png') {
                        chartRenderer.exportChartAsPNG(options.chartId, exportService.generateFilename(options.chartName || 'Diagramm', stateManager.getCurrentKollektiv(), 'png'), { scale: 2 });
                    }
                    break;
                case 'chartSingleSVG':
                     if (options.chartId && options.format === 'svg') {
                        chartRenderer.exportChartAsSVG(options.chartId, exportService.generateFilename(options.chartName || 'Diagramm', stateManager.getCurrentKollektiv(), 'svg'));
                    }
                    break;
                case 'tableSinglePNG':
                    ui_helpers.showToast("Tabellen-PNG-Export wird generiert (Funktion noch nicht vollständig implementiert).", "info");
                    break;
                case 'publikationMethodenMD':
                case 'publikationErgebnisseMD':
                case 'publikationReferenzenMD':
                    exportService.exportPublikationSectionMarkdown(exportType.replace('publikation', '').replace('MD', ''), options.sectionName, stateManager.getCurrentPublikationLang(), allStats, commonData, publicationOptions);
                    break;
                case 'publicationTableTSV':
                    exportService.exportPublicationTableTSV(allStats, stateManager.getCurrentPublikationLang(), options.tableKey, commonData);
                    break;
                case 'referencesBibTeX':
                    exportService.exportReferencesBibTeX();
                    break;
                case 'allZIP':
                case 'csvZIP':
                case 'mdZIP':
                case 'pngZIP':
                case 'svgZIP':
                    ui_helpers.showToast("ZIP-Export wird generiert (Funktion noch nicht vollständig implementiert).", "info");
                    break;
                case 'praesentationPerformanceASPurCSV':
                    ui_helpers.showToast("Export von AS Performance CSV wird generiert (Funktion noch nicht vollständig implementiert).", "info");
                    break;
                case 'praesentationPerformanceASPurMD':
                    ui_helpers.showToast("Export von AS Performance MD wird generiert (Funktion noch nicht vollständig implementiert).", "info");
                    break;
                case 'praesentationPerformanceASvsT2CSV':
                    ui_helpers.showToast("Export von AS vs T2 CSV wird generiert (Funktion noch nicht vollständig implementiert).", "info");
                    break;
                case 'praesentationCompTableASvsT2MD':
                    ui_helpers.showToast("Export von AS vs T2 Comp Table MD wird generiert (Funktion noch nicht vollständig implementiert).", "info");
                    break;
                case 'praesentationTestsASvsT2MD':
                    ui_helpers.showToast("Export von AS vs T2 Tests MD wird generiert (Funktion noch nicht vollständig implementiert).", "info");
                    break;
                default:
                    ui_helpers.showToast(`Unbekannter Exporttyp: ${exportType}`, "warning");
            }
        },
        refreshCurrentTab: (forceStatRecalculation = false) => {
            _renderCurrentTab(forceStatRecalculation);
        },
        refreshAllTabs: (forceStatRecalculation = false) => {
            _renderAllTabs(forceStatRecalculation);
        },
        updateAllUIComponents: () => {
            _updateUI();
        },
        refreshStatistikTab: (forceStatRecalculation = false) => {
             _renderStatistikTab(forceStatRecalculation);
        },
        refreshPublikationTab: (forceStatRecalculation = false) => {
             _renderPublikationTab(forceStatRecalculation);
        }
    };

    function checkCoreModulesAvailability() {
        const missingModules = [];
        const improperlyTypedModules = [];

        CORE_MODULE_DEFINITIONS.forEach(moduleDef => {
            const moduleObject = window[moduleDef.name];
            let typeCheckPassed = false;

            if (moduleDef.expectedType === 'array') {
                typeCheckPassed = Array.isArray(moduleObject);
            } else {
                typeCheckPassed = (typeof moduleObject === moduleDef.expectedType);
            }

            if (typeof moduleObject === 'undefined') {
                missingModules.push(`${moduleDef.name} (erwartet aus ${moduleDef.path})`);
            } else if (!typeCheckPassed) {
                improperlyTypedModules.push(`${moduleDef.name} (erwartet Typ: ${moduleDef.expectedType}, gefunden: ${typeof moduleObject} aus ${moduleDef.path})`);
            }
        });

        if (missingModules.length > 0 || improperlyTypedModules.length > 0) {
            let comprehensiveErrorMessage = "Fehler bei der Initialisierung der Anwendung:\n";
            if (missingModules.length > 0) {
                comprehensiveErrorMessage += `Die folgenden Kernmodule konnten nicht gefunden werden (prüfen Sie Pfade in index.html und Fehler in den Skriptdateien selbst):\n- ${missingModules.join('\n- ')}\n\n`;
            }
            if (improperlyTypedModules.length > 0) {
                comprehensiveErrorMessage += `Die folgenden Kernmodule haben einen unerwarteten Typ (prüfen Sie die Implementierung der Module):\n- ${improperlyTypedModules.join('\n- ')}\n\n`;
            }
            comprehensiveErrorMessage += "Die App-Initialisierung wird abgebrochen. Bitte überprüfen Sie die Browser-Konsole auf weitere Fehlerdetails aus den einzelnen Skriptdateien.";
            
            console.error(comprehensiveErrorMessage); 
            
            const errorDisplayElement = document.getElementById('loading-error-message');
            if (errorDisplayElement) {
                errorDisplayElement.textContent = comprehensiveErrorMessage.replace(/\n/g, ' ').replace(/- /g, ''); 
                errorDisplayElement.style.display = 'block';
            }
            const loadingIndicatorElement = document.getElementById('loading-indicator');
            if (loadingIndicatorElement) {
                const spinnerElement = loadingIndicatorElement.querySelector('.spinner-border');
                const loadingTextElement = loadingIndicatorElement.querySelector('p.mt-3.text-primary.fw-bold');
                if (spinnerElement) spinnerElement.style.display = 'none';
                if (loadingTextElement) loadingTextElement.style.display = 'none';
            }
            return false; 
        }
        return true; 
    }

    function _updateUI() {
        if (currentHeaderStats) {
            ui_helpers.updateHeaderStatsUI(currentHeaderStats);
        }
        ui_helpers.updateKollektivButtonsUI(currentKollektiv);
        ui_helpers.updateExportButtonStates(currentActiveTabId, bruteForceManager.getAllStoredResults() !== null && Object.keys(bruteForceManager.getAllStoredResults()).length > 0, currentData && currentData.length > 0);
        ui_helpers.updateT2CriteriaControlsUI(currentT2Criteria, currentT2Logic);
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.areCriteriaUnsaved());
        ui_helpers.updateBruteForceUI(bruteForceManager.isRunning() ? 'progress' : 'idle', bruteForceManager.getResultsForKollektiv(currentKollektiv, stateManager.getBruteForceMetric()), bruteForceManager.isWorkerAvailable(), currentKollektiv);
        ui_helpers.updatePresentationViewSelectorUI(stateManager.getCurrentPresentationView());
        ui_helpers.updatePublikationUI(stateManager.getCurrentPublikationLang(), stateManager.getCurrentPublikationSection(), stateManager.getCurrentPublikationBruteForceMetric());
    }

    function _renderCurrentTab(forceStatRecalculation = false) {
        let activeTabId = stateManager.getActiveTabId();
        const validTabIds = ['daten-tab-pane', 'auswertung-tab-pane', 'statistik-tab-pane', 'praesentation-tab-pane', 'publikation-tab-pane', 'export-tab-pane'];
        if (!validTabIds.includes(activeTabId)) {
            activeTabId = APP_CONFIG.DEFAULT_SETTINGS.activeTabId;
            stateManager.setActiveTabId(activeTabId);
        }
        currentActiveTabId = activeTabId; 

        if (forceStatRecalculation || !currentData || !currentHeaderStats) {
            currentData = dataProcessor.getProcessedData(currentKollektiv);
            currentT2Criteria = t2CriteriaManager.getAppliedCriteria();
            currentT2Logic = t2CriteriaManager.getAppliedLogic();
            currentHeaderStats = dataProcessor.getHeaderStats(currentKollektiv, currentT2Criteria, currentT2Logic);
        }

        switch (activeTabId) {
            case 'daten-tab-pane':
                viewRenderer.renderDatenTab();
                break;
            case 'auswertung-tab-pane':
                viewRenderer.renderAuswertungTab(currentData, bruteForceManager);
                break;
            case 'statistik-tab-pane':
                _renderStatistikTab(forceStatRecalculation);
                break;
            case 'praesentation-tab-pane':
                _renderPraesentationTab(forceStatRecalculation);
                break;
            case 'publikation-tab-pane':
                _renderPublikationTab(forceStatRecalculation);
                break;
            case 'export-tab-pane':
                viewRenderer.renderExportTab(currentKollektiv);
                if (typeof exportEventHandlers !== 'undefined' && exportEventHandlers.register) {
                    exportEventHandlers.register();
                }
                break;
            default:
                console.warn(`Unerwarteter aktiver Tab-ID: ${activeTabId}`);
                viewRenderer.renderDatenTab();
        }
        _updateUI();
    }

    function _renderAllTabs(forceStatRecalculation = false) {
        currentData = dataProcessor.getProcessedData(currentKollektiv);
        currentT2Criteria = t2CriteriaManager.getAppliedCriteria();
        currentT2Logic = t2CriteriaManager.getAppliedLogic();
        currentHeaderStats = dataProcessor.getHeaderStats(currentKollektiv, currentT2Criteria, currentT2Logic);

        viewRenderer.renderDatenTab();
        viewRenderer.renderAuswertungTab(currentData, bruteForceManager);
        _renderStatistikTab(forceStatRecalculation);
        _renderPraesentationTab(forceStatRecalculation);
        _renderPublikationTab(forceStatRecalculation);
        viewRenderer.renderExportTab(currentKollektiv);
        if (typeof exportEventHandlers !== 'undefined' && exportEventHandlers.register) {
            exportEventHandlers.register();
        }

        _updateUI();
    }

    function _renderStatistikTab(forceStatRecalculation = false) {
        let statsEinze = null;
        let statsVergleich = null;
        const currentStatsLayout = stateManager.getCurrentStatsLayout();
        const kollektiv1 = stateManager.getStatsKollektiv1();
        const kollektiv2 = stateManager.getStatsKollektiv2();
        const currentKollektivForTab = currentStatsLayout === 'einzel' ? stateManager.getCurrentKollektiv() : kollektiv1;


        if (forceStatRecalculation || !window.allKollektivStatsForStatistikTab) {
            window.allKollektivStatsForStatistikTab = statisticsService.calculateAllStatsForPublication(
                dataProcessor.getRawData(),
                t2CriteriaManager.getAppliedCriteria(),
                t2CriteriaManager.getAppliedLogic(),
                bruteForceManager.getAllStoredResults()
            );
        }
        
        if (currentStatsLayout === 'einzel') {
            statsEinze = window.allKollektivStatsForStatistikTab[currentKollektivForTab];
        } else if (currentStatsLayout === 'vergleich') {
            const statsKoll1 = window.allKollektivStatsForStatistikTab[kollektiv1];
            const statsKoll2 = window.allKollektivStatsForStatistikTab[kollektiv2];

            if (statsKoll1 && statsKoll2) {
                 statsVergleich = {
                    accuracyComparison: {
                        as: statisticsService.calculateComparisonStats(statsKoll1, kollektiv1, studyT2CriteriaManager.getAllStudyCriteriaSets(), bruteForceManager.getAllStoredResults())?.accuracyComparison?.as,
                        t2: statisticsService.calculateComparisonStats(statsKoll1, kollektiv1, studyT2CriteriaManager.getAllStudyCriteriaSets(), bruteForceManager.getAllStoredResults())?.accuracyComparison?.t2
                    },
                    aucComparison: {
                        as: statisticsService.calculateComparisonStats(statsKoll1, kollektiv1, studyT2CriteriaManager.getAllStudyCriteriaSets(), bruteForceManager.getAllStoredResults())?.aucComparison?.as,
                        t2: statisticsService.calculateComparisonStats(statsKoll1, kollektiv1, studyT2CriteriaManager.getAllStudyCriteriaSets(), bruteForceManager.getAllStoredResults())?.aucComparison?.t2
                    }
                };
                if (statsKoll1.deskriptiv && statsKoll2.deskriptiv) {
                    statsVergleich.kollektiv1Data = statsKoll1.deskriptiv;
                    statsVergleich.kollektiv2Data = statsKoll2.deskriptiv;
                }

            } else {
                statsVergleich = null;
            }
        }
        viewRenderer.renderStatistikTab(statsEinze, statsVergleich, currentStatsLayout, kollektiv1, kollektiv2, currentKollektivForTab);
    }

    function _renderPraesentationTab(forceStatRecalculation = false) {
        let presentationData = {};
        const currentPresentationView = stateManager.getCurrentPresentationView();
        const currentGlobalKollektiv = stateManager.getCurrentKollektiv();
        const selectedStudyId = stateManager.getCurrentPresentationStudyId();

        if (forceStatRecalculation || !window.allKollektivStatsForPresentationTab) {
            window.allKollektivStatsForPresentationTab = statisticsService.calculateAllStatsForPublication(
                dataProcessor.getRawData(),
                t2CriteriaManager.getAppliedCriteria(),
                t2CriteriaManager.getAppliedLogic(),
                bruteForceManager.getAllStoredResults()
            );
        }

        const allStats = window.allKollektivStatsForPresentationTab;

        if (currentPresentationView === 'as-pur') {
            presentationData = {
                statsGesamt: allStats['Gesamt']?.gueteAS,
                statsDirektOP: allStats['direkt OP']?.gueteAS,
                statsNRCT: allStats['nRCT']?.gueteAS,
                kollektiv: currentGlobalKollektiv,
                statsCurrentKollektiv: allStats[currentGlobalKollektiv]?.gueteAS,
                patientCount: allStats[currentGlobalKollektiv]?.deskriptiv?.anzahlPatienten || 0
            };
        } else if (currentPresentationView === 'as-vs-t2') {
            let comparisonCriteriaSet = null;
            let t2CriteriaLabelShort = 'T2';
            let t2CriteriaLabelFull = 'T2-Kriterien';
            let kollektivForComparison = currentGlobalKollektiv;
            let patientCountForComparison = allStats[currentGlobalKollektiv]?.deskriptiv?.anzahlPatienten || 0;
            let statsT2ForComparison = null;
            let vergleichForComparison = null;

            if (selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                comparisonCriteriaSet = {
                    id: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID,
                    name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                    displayShortName: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                    criteria: t2CriteriaManager.getAppliedCriteria(),
                    logic: t2CriteriaManager.getAppliedLogic(),
                    studyInfo: { reference: 'Benutzerdefiniert (aktuell im Auswertungstab eingestellt)' }
                };
                statsT2ForComparison = allStats[currentGlobalKollektiv]?.gueteT2_angewandt;
                vergleichForComparison = allStats[currentGlobalKollektiv]?.vergleichASvsT2_angewandt;
                t2CriteriaLabelShort = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
                t2CriteriaLabelFull = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
            } else if (selectedStudyId) {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
                if (studySet) {
                    comparisonCriteriaSet = studySet;
                    t2CriteriaLabelShort = studySet.displayShortName || studySet.name;
                    t2CriteriaLabelFull = studySet.name;
                    
                    kollektivForComparison = studySet.applicableKollektiv || currentGlobalKollektiv;
                    patientCountForComparison = allStats[kollektivForComparison]?.deskriptiv?.anzahlPatienten || 0;

                    statsT2ForComparison = allStats[kollektivForComparison]?.gueteT2_literatur?.[selectedStudyId];
                    vergleichForComparison = allStats[kollektivForComparison]?.[`vergleichASvsT2_literatur_${selectedStudyId}`];
                }
            }

            presentationData = {
                statsAS: allStats[kollektivForComparison]?.gueteAS,
                statsT2: statsT2ForComparison,
                vergleich: vergleichForComparison,
                comparisonCriteriaSet: comparisonCriteriaSet,
                kollektivForComparison: kollektivForComparison,
                patientCountForComparison: patientCountForComparison,
                t2CriteriaLabelShort: t2CriteriaLabelShort,
                t2CriteriaLabelFull: t2CriteriaLabelFull
            };
        }
        viewRenderer.renderPraesentationTab(currentPresentationView, presentationData, selectedStudyId, currentGlobalKollektiv);
    }

    function _renderPublikationTab(forceStatRecalculation = false) {
        if (forceStatRecalculation || !window.allKollektivStatsForPublikationTab) {
            window.allKollektivStatsForPublikationTab = statisticsService.calculateAllStatsForPublication(
                dataProcessor.getRawData(),
                t2CriteriaManager.getAppliedCriteria(),
                t2CriteriaManager.getAppliedLogic(),
                bruteForceManager.getAllStoredResults()
            );
        }
        
        publikationTabLogic.initializeData(
            dataProcessor.getRawData(),
            t2CriteriaManager.getAppliedCriteria(),
            t2CriteriaManager.getAppliedLogic(),
            bruteForceManager.getAllStoredResults()
        );

        viewRenderer.renderPublikationTab();
    }


    async function startApplication() {
        try {
            if (!checkCoreModulesAvailability()) {
                return; 
            }

            stateManager.initialize();
            
            currentKollektiv = stateManager.getCurrentKollektiv();
            
            dataProcessor.initializeData(patientData);
            currentData = dataProcessor.getProcessedData(currentKollektiv);
            t2CriteriaManager.initialize(APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC, APP_CONFIG.DEFAULT_SETTINGS.APPLIED_CRITERIA);
            studyT2CriteriaManager.initialize();
            bruteForceManager.initialize();
            bruteForceManager.updateData(currentData);
            bruteForceManager.updateKollektiv(currentKollektiv);


            currentT2Criteria = t2CriteriaManager.getAppliedCriteria();
            currentT2Logic = t2CriteriaManager.getAppliedLogic();
            currentHeaderStats = dataProcessor.getHeaderStats(currentKollektiv, currentT2Criteria, currentT2Logic);

            viewRenderer.initialize(currentData, currentKollektiv, currentT2Criteria, currentT2Logic, bruteForceManager);
            dataTabLogic.initialize(currentData, currentKollektiv);
            auswertungTabLogic.initialize(currentData, bruteForceManager);
            
            _updateUI();

            const mainTabsElement = document.getElementById('mainTabs');
            if (mainTabsElement) {
                const tabButtons = mainTabsElement.querySelectorAll('.nav-link');
                tabButtons.forEach(button => {
                    button.addEventListener('click', (event) => {
                        const newTabId = event.currentTarget.dataset.bsTarget.substring(1);
                        stateManager.setActiveTabId(newTabId);
                        _renderCurrentTab(true); 
                    });
                });
            }
            
            generalEventHandlers.register();

            _renderCurrentTab(true); 

            if (stateManager.isFirstAppStart()) {
                ui_helpers.showKurzanleitung(); 
                stateManager.setFirstAppStart(false); 
            } else {
                setTimeout(() => {
                    if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshCurrentTab === 'function') {
                        mainAppInterface.refreshCurrentTab(false); 
                    }
                }, 100);
            }

            console.log("Avocado Sign Analyse Anwendung erfolgreich initialisiert und alle Module geladen.");
            
            const loadingIndicatorElement = document.getElementById('loading-indicator');
            const appContainerElement = document.getElementById('app-container');

            if (loadingIndicatorElement) loadingIndicatorElement.style.display = 'none';
            if (appContainerElement) appContainerElement.style.visibility = 'visible';

        } catch (error) {
            console.error('Schwerwiegender Fehler während der App-Initialisierung:', error);
            const errorDisplayElement = document.getElementById('loading-error-message');
            if (errorDisplayElement) {
                errorDisplayElement.textContent = `Kritischer Initialisierungsfehler: ${error.message}. Details siehe Konsole.`;
                errorDisplayElement.style.display = 'block';
            }
            const loadingIndicatorElement = document.getElementById('loading-indicator');
            if (loadingIndicatorElement) {
                const spinnerElement = loadingIndicatorElement.querySelector('.spinner-border');
                const loadingTextElement = loadingIndicatorElement.querySelector('p.mt-3.text-primary.fw-bold');
                if (spinnerElement) spinnerElement.style.display = 'none';
                if (loadingTextElement) loadingTextElement.style.display = 'none';
            }
        }
    }

    window.mainAppInterface = mainAppInterface;
    document.addEventListener('DOMContentLoaded', startApplication);

})();
