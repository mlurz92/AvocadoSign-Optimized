document.addEventListener('DOMContentLoaded', () => {

    const mainApp = (() => {
        let processedData = [];
        let isFirstRender = true;
        let lastActiveTabId = null;

        const mainAppInterface = {
            updateAndRender: () => updateAndRender()
        };

        const controllers = {
            'daten-tab': dataController,
            'auswertung-tab': auswertungController,
            'statistik-tab': statistikController,
            'praesentation-tab': praesentationController,
            'publikation-tab': publikationController,
            'export-tab': exportController
        };

        function _renderActiveTab(evaluatedData, activeTabId) {
            const tabPaneContainer = document.getElementById('app-tab-content');
            if (!tabPaneContainer) return;

            const spinnerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height: 50vh;"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade...</span></div></div>`;
            const activePane = document.getElementById(`${activeTabId}-pane`);
            if(activePane) activePane.innerHTML = spinnerHTML;

            setTimeout(() => {
                let contentHTML = '';
                const currentKollektiv = stateManager.getCurrentKollektiv();
                const appliedCriteria = t2CriteriaManager.getCriteria();
                const appliedLogic = t2CriteriaManager.getLogic();

                switch (activeTabId) {
                    case 'daten-tab':
                        contentHTML = dataRenderer.render(evaluatedData, stateManager.getSortState('daten'));
                        break;
                    case 'auswertung-tab':
                        const dashboardStats = statisticsService.calculateDescriptiveStats(evaluatedData);
                        const t2Metrics = statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n');
                        contentHTML = auswertungRenderer.render(evaluatedData, dashboardStats, appliedCriteria, appliedLogic, stateManager.getSortState('auswertung'), currentKollektiv, bruteForceManager.isWorkerAvailable(), t2Metrics);
                        break;
                    case 'statistik-tab':
                        // Statistik-Tab kann im Einzel- oder Vergleichsmodus sein
                        const statsLayout = stateManager.getStatsLayout();
                        let statsForRendering;
                        if (statsLayout === 'vergleich') {
                            const kollektiv1Data = dataProcessor.filterDataByKollektiv(processedData, stateManager.getStatsKollektiv1());
                            const kollektiv2Data = dataProcessor.filterDataByKollektiv(processedData, stateManager.getStatsKollektiv2());
                            const evaluatedKollektiv1 = t2CriteriaManager.evaluateDatasetWithCriteria(kollektiv1Data, appliedCriteria, appliedLogic);
                            const evaluatedKollektiv2 = t2CriteriaManager.evaluateDatasetWithCriteria(kollektiv2Data, appliedCriteria, appliedLogic);
                            statsForRendering = {
                                kollektiv1: statisticsService.calculateAllStats(evaluatedKollektiv1, appliedCriteria, appliedLogic),
                                kollektiv2: statisticsService.calculateAllStats(evaluatedKollektiv2, appliedCriteria, appliedLogic)
                            };
                        } else {
                            statsForRendering = statisticsService.calculateAllStats(evaluatedData, appliedCriteria, appliedLogic);
                        }
                        contentHTML = statistikRenderer.render(statsForRendering, statsLayout, stateManager.getStatsKollektiv1(), stateManager.getStatsKollektiv2());
                        break;
                    case 'praesentation-tab':
                        const praesData = praesentationController.getPresentationData(processedData);
                        contentHTML = praesentationRenderer.render(stateManager.getPresentationView(), praesData, stateManager.getPresentationStudyId());
                        break;
                    case 'publikation-tab':
                        contentHTML = publikationController.renderContent(processedData);
                        break;
                    case 'export-tab':
                        const hasBruteForceResults = Object.keys(bruteForceManager.getAllResults()).length > 0;
                        contentHTML = exportRenderer.render(hasBruteForceResults, evaluatedData.length > 0);
                        break;
                    default:
                        contentHTML = `<p class="text-danger">Tab "${activeTabId}" konnte nicht geladen werden.</p>`;
                }
                if(activePane) activePane.innerHTML = contentHTML;
                _postRenderUpdates(activeTabId, evaluatedData);
            }, 50);
        }

        function _postRenderUpdates(activeTabId, evaluatedData) {
            uiHelpers.destroyTooltips();
            const activePane = document.getElementById(`${activeTabId}-pane`);
            if (activePane) {
                uiHelpers.initializeTooltips(activePane);
            }
            
            const controller = controllers[activeTabId];
            if (controller && typeof controller.onTabEnter === 'function') {
                controller.onTabEnter();
            }
            
            if (activeTabId === 'auswertung-tab') {
                const dashboardStats = statisticsService.calculateDescriptiveStats(evaluatedData);
                 if(dashboardStats && dashboardStats.count > 0) {
                    chartRenderer.renderBarChart('dashboard-chart-gender', [{label: 'M', value: dashboardStats.gender.m}, {label: 'W', value: dashboardStats.gender.f}], {yAxisLabel: 'Anzahl'});
                    chartRenderer.renderBarChart('dashboard-chart-therapy', [{label: 'Direkt OP', value: dashboardStats.therapy['direkt OP']}, {label: 'nRCT', value: dashboardStats.therapy.nRCT}], {yAxisLabel: 'Anzahl'});
                    
                    // Render age distribution histogram for dashboard
                    const ageBins = d3.bin().thresholds(10)(dashboardStats.ageData); // 10 bins for age distribution
                    const ageChartData = ageBins.map(d => ({ label: `${Math.floor(d.x0)}-${Math.floor(d.x1)}`, value: d.length }));
                    chartRenderer.renderBarChart('dashboard-chart-age', ageChartData, { xAxisLabel: 'Alter (Jahre)', yAxisLabel: 'Anzahl Patienten' });

                    // Render N-Status distribution
                    const nStatusData = [
                        { label: 'N+', value: dashboardStats.nStatus.positive },
                        { label: 'N-', value: dashboardStats.nStatus.negative }
                    ].filter(d => d.value > 0); // Only show if counts are positive
                    chartRenderer.renderBarChart('dashboard-chart-status-n', nStatusData, { yAxisLabel: 'Anzahl Patienten' });

                    // Render AS-Status distribution
                    const asStatusData = [
                        { label: 'AS+', value: headerStats.asPos },
                        { label: 'AS-', value: headerStats.asNeg }
                    ].filter(d => d.value > 0);
                    chartRenderer.renderBarChart('dashboard-chart-status-as', asStatusData, { yAxisLabel: 'Anzahl Patienten' });

                    // Render T2-Status distribution
                    const t2StatusData = [
                        { label: 'T2+', value: headerStats.t2Pos },
                        { label: 'T2-', value: headerStats.t2Neg }
                    ].filter(d => d.value > 0);
                    chartRenderer.renderBarChart('dashboard-chart-status-t2', t2StatusData, { yAxisLabel: 'Anzahl Patienten' });

                }
            } else if (activeTabId === 'statistik-tab') {
                const currentKollektiv = stateManager.getCurrentKollektiv();
                const currentKollektiv1 = stateManager.getStatsKollektiv1();
                const currentKollektiv2 = stateManager.getStatsKollektiv2();
                const statsLayout = stateManager.getStatsLayout();
                const appliedCriteria = t2CriteriaManager.getCriteria();
                const appliedLogic = t2CriteriaManager.getLogic();

                let statsToChart;
                let method1Label = APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME;
                let method2Label = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
                let containerId = `chart-as-vs-t2-${currentKollektiv}`;


                if (statsLayout === 'vergleich') {
                    const kollektiv1Data = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv1);
                    const kollektiv2Data = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv2);
                    const evaluatedKollektiv1 = t2CriteriaManager.evaluateDatasetWithCriteria(kollektiv1Data, appliedCriteria, appliedLogic);
                    const evaluatedKollektiv2 = t2CriteriaManager.evaluateDatasetWithCriteria(kollektiv2Data, appliedCriteria, appliedLogic);
                    
                    const stats1 = statisticsService.calculateAllStats(evaluatedKollektiv1, appliedCriteria, appliedLogic);
                    const stats2 = statisticsService.calculateAllStats(evaluatedKollektiv2, appliedCriteria, appliedLogic);

                    statsToChart = {
                        avocadoSign: stats1.avocadoSign,
                        t2: stats2.t2 // This charts T2 criteria of selected K2 against AS of selected K1
                    };
                    method1Label = getKollektivDisplayName(currentKollektiv1);
                    method2Label = getKollektivDisplayName(currentKollektiv2);
                    containerId = `chart-as-vs-t2-kollektiv-comparison`; // Unique ID for comparison chart
                } else {
                    statsToChart = statisticsService.calculateAllStats(evaluatedData, appliedCriteria, appliedLogic);
                    method1Label = APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME;
                    method2Label = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
                    containerId = `chart-as-vs-t2-${currentKollektiv}`;
                }

                if (statsToChart && statsToChart.avocadoSign && statsToChart.t2) { // Ensure data exists for chart
                    const chartData = [
                        { metric: 'Sensitivität', values: [{ name: method1Label, ...statsToChart.avocadoSign.sens }, { name: method2Label, ...statsToChart.t2.sens }] },
                        { metric: 'Spezifität', values: [{ name: method1Label, ...statsToChart.avocadoSign.spez }, { name: method2Label, ...statsToChart.t2.spez }] },
                        { metric: 'PPV', values: [{ name: method1Label, ...statsToChart.avocadoSign.ppv }, { name: method2Label, ...statsToChart.t2.ppv }] },
                        { metric: 'NPV', values: [{ name: method1Label, ...statsToChart.avocadoSign.npv }, { name: method2Label, ...statsToChart.t2.npv }] },
                        { metric: 'Accuracy', values: [{ name: method1Label, ...statsToChart.avocadoSign.acc }, { name: method2Label, ...statsToChart.t2.acc }] },
                        { metric: 'AUC', values: [{ name: method1Label, ...statsToChart.avocadoSign.auc }, { name: method2Label, ...statsToChart.t2.auc }] }
                    ];
                    chartRenderer.renderPerformanceComparisonChart(containerId, chartData, { method1: method1Label, method2: method2Label });
                }

            } else if (activeTabId === 'praesentation-tab') {
                const currentView = stateManager.getPresentationView();
                if (currentView === 'as-pur') {
                    const praesData = praesentationController.getPresentationData(processedData);
                    const descriptiveStats = praesData.asPur?.descriptive;
                    const asPerformanceStats = praesData.asPur?.avocadoSign;

                    if (descriptiveStats) {
                        const genderData = [{label: 'M', value: descriptiveStats.gender.m}, {label: 'W', value: descriptiveStats.gender.f}];
                        const therapyData = [{label: 'Direkt OP', value: descriptiveStats.therapy['direkt OP']}, {label: 'nRCT', value: descriptiveStats.therapy.nRCT}];
                        const ageData = d3.bin().thresholds(10)(descriptiveStats.ageData).map(d => ({label: `${Math.floor(d.x0)}-${Math.floor(d.x1)}`, value: d.length}));
                        
                        // Render charts if elements exist
                        // chartRenderer.renderBarChart('praes-chart-gender-as-pur', genderData, {yAxisLabel: 'Anzahl'}); // These specific IDs are not in current HTML but in dashboard.
                        // chartRenderer.renderBarChart('praes-chart-therapy-as-pur', therapyData, {yAxisLabel: 'Anzahl'});
                        // chartRenderer.renderBarChart('praes-chart-age-as-pur', ageData, {xAxisLabel: 'Alter (Jahre)', yAxisLabel: 'Anzahl'});
                    }

                    if (asPerformanceStats) {
                         const chartData = [
                            { metric: 'Sensitivität', values: [{ name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...asPerformanceStats.sens }] },
                            { metric: 'Spezifität', values: [{ name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...asPerformanceStats.spez }] },
                            { metric: 'PPV', values: [{ name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...asPerformanceStats.ppv }] },
                            { metric: 'NPV', values: [{ name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...asPerformanceStats.npv }] },
                            { metric: 'Accuracy', values: [{ name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...asPerformanceStats.acc }] },
                            { metric: 'AUC', values: [{ name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...asPerformanceStats.auc }] }
                        ];
                        // This needs to be rendered against a dummy T2 if it's a comparison chart, or as a single bar chart
                        // For a single method, a simple bar chart is better.
                        // For praes-chart-as-pur, assuming a single bar chart
                        const singleMetricData = [
                             { label: 'Sens', value: asPerformanceStats.sens.value },
                             { label: 'Spez', value: asPerformanceStats.spez.value },
                             { label: 'PPV', value: asPerformanceStats.ppv.value },
                             { label: 'NPV', value: asPerformanceStats.npv.value },
                             { label: 'Acc', value: asPerformanceStats.acc.value },
                             { label: 'AUC', value: asPerformanceStats.auc.value }
                         ];
                         chartRenderer.renderBarChart('praes-chart-as-pur', singleMetricData, {yAxisLabel: 'Wert'});
                    }

                } else if (currentView === 'as-vs-t2') {
                    const praesData = praesentationController.getPresentationData(processedData);
                    const asVsT2Stats = praesData.asVsT2;
                    const selectedStudyId = stateManager.getPresentationStudyId();
                    const selectedStudy = studyCriteriaManager.getStudyCriteriaSetById(selectedStudyId);
                    const t2ShortName = selectedStudy ? selectedStudy.displayShortName || selectedStudy.name : 'T2';

                    if (asVsT2Stats && asVsT2Stats.avocadoSign && asVsT2Stats.t2) {
                        const chartData = [
                            { metric: 'Sensitivität', values: [{ name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...asVsT2Stats.avocadoSign.sens }, { name: t2ShortName, ...asVsT2Stats.t2.sens }] },
                            { metric: 'Spezifität', values: [{ name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...asVsT2Stats.t2.spez }, { name: t2ShortName, ...asVsT2Stats.t2.spez }] },
                            { metric: 'PPV', values: [{ name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...asVsT2Stats.avocadoSign.ppv }, { name: t2ShortName, ...asVsT2Stats.t2.ppv }] },
                            { metric: 'NPV', values: [{ name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...asVsT2Stats.avocadoSign.npv }, { name: t2ShortName, ...asVsT2Stats.t2.npv }] },
                            { metric: 'Accuracy', values: [{ name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...asVsT2Stats.avocadoSign.acc }, { name: t2ShortName, ...asVsT2Stats.t2.acc }] },
                            { metric: 'AUC', values: [{ name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...asVsT2Stats.avocadoSign.auc }, { name: t2ShortName, ...asVsT2Stats.t2.auc }] }
                        ];
                        chartRenderer.renderPerformanceComparisonChart('praes-chart-as-vs-t2', chartData, { method1: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, method2: t2ShortName });
                    }
                }
            }
        }
        
        function _handleTabChange(event) {
            const link = event.target.closest('a.nav-link');
            if (!link) return;
            event.preventDefault();
            
            const newTabId = link.id;
            if (newTabId === stateManager.getActiveTabId()) return;

            if(lastActiveTabId && controllers[lastActiveTabId] && typeof controllers[lastActiveTabId].onTabExit === 'function') {
                controllers[lastActiveTabId].onTabExit();
            }

            // Remove active classes from old tab and pane
            document.querySelector('#app-nav .nav-link.active')?.classList.remove('active');
            document.querySelector('.tab-content .tab-pane.active')?.classList.remove('active', 'show');
            
            // Add active classes to new tab and pane
            link.classList.add('active');
            const newPane = document.getElementById(`${newTabId}-pane`);
            if(newPane) newPane.classList.add('active', 'show');

            stateManager.setActiveTabId(newTabId);
            lastActiveTabId = newTabId;
            updateAndRender();
        }
        
        function _handleKollektivChange(event) {
            const button = event.target.closest('[data-kollektiv]');
            if (button && stateManager.setCurrentKollektiv(button.dataset.kollektiv)) {
                updateAndRender();
            }
        }

        function updateAndRender() {
            const currentKollektiv = stateManager.getCurrentKollektiv();
            const filteredData = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv);
            const evaluatedData = t2CriteriaManager.evaluateDatasetWithCriteria(filteredData, t2CriteriaManager.getCriteria(), t2CriteriaManager.getLogic());
            const headerStats = dataProcessor.calculateHeaderStats(evaluatedData, currentKollektiv);
            
            uiHelpers.updateHeaderStatsUI(headerStats);
            uiHelpers.updateKollektivButtonsUI(currentKollektiv);
            
            _renderActiveTab(evaluatedData, stateManager.getActiveTabId());
        }

        function init() {
            console.log(`Initialisiere ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION}...`);
            
            processedData = dataProcessor.processPatientData(patientDataRaw);
            stateManager.init();
            t2CriteriaManager.initialize();

            Object.values(controllers).forEach(controller => {
                if (typeof controller.init === 'function') {
                    controller.init(mainAppInterface);
                }
            });
            
            bruteForceManager.init({
                onStarted: (payload) => controllers['auswertung-tab'].updateBruteForceUI('started', payload),
                onProgress: (payload) => controllers['auswertung-tab'].updateBruteForceUI('progress', payload),
                onResult: (payload) => controllers['auswertung-tab'].updateBruteForceUI('result', payload),
                onCancelled: (payload) => controllers['auswertung-tab'].updateBruteForceUI('cancelled', payload),
                onError: (payload) => controllers['auswertung-tab'].updateBruteForceUI('error', payload)
            });

            document.getElementById('app-nav').addEventListener('click', _handleTabChange);
            document.querySelector('.kollektiv-selector').addEventListener('click', _handleKollektivChange);
            document.getElementById('show-kurzanleitung-btn').addEventListener('click', () => uiHelpers.showKurzanleitung());

            const initialTabId = stateManager.getActiveTabId();
            lastActiveTabId = initialTabId;
            const initialTabElement = document.getElementById(initialTabId);
            const initialPaneElement = document.getElementById(`${initialTabId}-pane`);

            document.querySelector('#app-nav .nav-link.active')?.classList.remove('active');
            document.querySelector('.tab-content .tab-pane.active')?.classList.remove('active', 'show');
            if(initialTabElement) initialTabElement.classList.add('active');
            if(initialPaneElement) initialPaneElement.classList.add('active', 'show');

            if (isFirstRender) {
                const firstStart = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START);
                if (firstStart === null) {
                    const modalBody = document.getElementById('kurzanleitung-modal-body');
                    if (modalBody) modalBody.innerHTML = UI_TEXTS.kurzanleitung.content;
                    uiHelpers.showKurzanleitung();
                    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START, 'done');
                }
                isFirstRender = false;
            }

            updateAndRender();
        }

        return { init };

    })();

    mainApp.init();
});
