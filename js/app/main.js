document.addEventListener('DOMContentLoaded', () => {

    const mainApp = (() => {
        let rawData = [];
        let processedData = [];
        let isFirstRender = true;
        let lastActiveTabId = null;

        const mainAppInterface = {
            updateAndRender: () => updateAndRender(),
            getGlobalEvaluatedData: () => {
                const appliedCriteria = t2CriteriaManager.getCriteria();
                const appliedLogic = t2CriteriaManager.getLogic();
                return t2CriteriaManager.evaluateDatasetWithCriteria(processedData, appliedCriteria, appliedLogic);
            },
            getProcessedData: () => dataProcessor.getProcessedData(),
        };

        const controllers = {
            'daten-tab': dataController,
            'auswertung-tab': auswertungController,
            'statistik-tab': statistikController,
            'praesentation-tab': praesentationController,
            'publikation-tab': publikationController,
            'export-tab': exportController
        };
        
        function _updateHeaderStats(stats) {
            uiHelpers.updateElementHTML('header-kollektiv', stats.kollektiv);
            uiHelpers.updateElementHTML('header-anzahl-patienten', stats.anzahlPatienten);
            uiHelpers.updateElementHTML('header-status-n', stats.statusN);
            uiHelpers.updateElementHTML('header-status-as', stats.statusAS);
            uiHelpers.updateElementHTML('header-status-t2', stats.statusT2);
        }

        function _renderActiveTab(filteredData, globallyEvaluatedData, activeTabId) {
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
                        contentHTML = dataRenderer.render(filteredData, stateManager.getSortState('daten'));
                        break;
                    case 'auswertung-tab':
                        const dashboardStats = statisticsService.calculateDescriptiveStats(filteredData);
                        const t2Metrics = statisticsService.calculateDiagnosticPerformance(filteredData, 't2', 'n');
                        contentHTML = auswertungRenderer.render(filteredData, dashboardStats, appliedCriteria, appliedLogic, stateManager.getSortState('auswertung'), currentKollektiv, bruteForceManager.isWorkerAvailable(), t2Metrics);
                        break;
                    case 'statistik-tab':
                        const statsLayout = stateManager.getStatsLayout();
                        let statsForRendering;
                        if (statsLayout === 'vergleich') {
                            const kollektiv1Data = dataProcessor.filterDataByKollektiv(globallyEvaluatedData, stateManager.getStatsKollektiv1());
                            const kollektiv2Data = dataProcessor.filterDataByKollektiv(globallyEvaluatedData, stateManager.getStatsKollektiv2());
                            statsForRendering = {
                                kollektiv1: statisticsService.calculateAllStats(kollektiv1Data, appliedCriteria, appliedLogic),
                                kollektiv2: statisticsService.calculateAllStats(kollektiv2Data, appliedCriteria, appliedLogic)
                            };
                        } else {
                            statsForRendering = statisticsService.calculateAllStats(filteredData, appliedCriteria, appliedLogic);
                        }
                        contentHTML = statistikRenderer.render(statsForRendering, statsLayout, stateManager.getStatsKollektiv1(), stateManager.getStatsKollektiv2());
                        break;
                    case 'praesentation-tab':
                        const praesData = praesentationController.getPresentationData(globallyEvaluatedData);
                        contentHTML = praesentationRenderer.render(stateManager.getPresentationView(), praesData, stateManager.getPresentationStudyId());
                        break;
                    case 'publikation-tab':
                        contentHTML = publikationController.renderContent(globallyEvaluatedData);
                        break;
                    case 'export-tab':
                        const hasBruteForceResults = Object.keys(bruteForceManager.getAllResults()).length > 0;
                        contentHTML = exportRenderer.render(hasBruteForceResults, filteredData.length > 0);
                        break;
                    default:
                        contentHTML = `<p class="text-danger">Tab "${activeTabId}" konnte nicht geladen werden.</p>`;
                }
                if(activePane) activePane.innerHTML = contentHTML;
                _postRenderUpdates(activeTabId, filteredData, globallyEvaluatedData);
            }, 50);
        }

        function _postRenderUpdates(activeTabId, filteredData, globallyEvaluatedData) {
            uiHelpers.destroyTooltips();
            const activePane = document.getElementById(`${activeTabId}-pane`);
            if (activePane) {
                uiHelpers.initializeTooltips(activePane);
                const tableBody = activePane.querySelector('.data-table tbody');
                if(tableBody) uiHelpers.attachRowCollapseListeners(tableBody);
            }
            
            const controller = controllers[activeTabId];
            if (controller && typeof controller.onTabEnter === 'function') {
                controller.onTabEnter(mainAppInterface);
            }
            
            if (activeTabId === 'auswertung-tab') {
                const dashboardStats = statisticsService.calculateDescriptiveStats(filteredData);
                const headerStats = dataProcessor.calculateHeaderStats(filteredData, stateManager.getCurrentKollektiv());
                 if(dashboardStats && dashboardStats.count > 0) {
                    chartRenderer.renderBarChart('dashboard-chart-gender', [{label: 'M', value: dashboardStats.gender.m}, {label: 'W', value: dashboardStats.gender.f}], {yAxisLabel: 'Anzahl'});
                    chartRenderer.renderBarChart('dashboard-chart-therapy', [{label: 'Direkt OP', value: dashboardStats.therapy['direkt OP']}, {label: 'nRCT', value: dashboardStats.therapy.nRCT}], {yAxisLabel: 'Anzahl'});
                    
                    const ageBins = d3.bin().thresholds(10)(dashboardStats.ageData);
                    const ageChartData = ageBins.map(d => ({ label: `${Math.floor(d.x0)}-${Math.floor(d.x1)}`, value: d.length }));
                    chartRenderer.renderBarChart('dashboard-chart-age', ageChartData, { xAxisLabel: 'Alter (Jahre)', yAxisLabel: 'Anzahl Patienten' });

                    chartRenderer.renderBarChart('dashboard-chart-status-n', [{ label: 'N+', value: headerStats.nPos }, { label: 'N-', value: headerStats.nNeg }].filter(d => d.value > 0), { yAxisLabel: 'Anzahl Patienten' });
                    chartRenderer.renderBarChart('dashboard-chart-status-as', [{ label: 'AS+', value: headerStats.asPos }, { label: 'AS-', value: headerStats.asNeg }].filter(d => d.value > 0), { yAxisLabel: 'Anzahl Patienten' });
                    chartRenderer.renderBarChart('dashboard-chart-status-t2', [{ label: 'T2+', value: headerStats.t2Pos }, { label: 'T2-', value: headerStats.t2Neg }].filter(d => d.value > 0), { yAxisLabel: 'Anzahl Patienten' });
                }
            } else if (activeTabId === 'statistik-tab') {
                const statsLayout = stateManager.getStatsLayout();
                const appliedCriteria = t2CriteriaManager.getCriteria();
                const appliedLogic = t2CriteriaManager.getLogic();

                if (statsLayout === 'einzel') {
                    const stats = statisticsService.calculateAllStats(filteredData, appliedCriteria, appliedLogic);
                    if(stats && stats.avocadoSign && stats.t2) {
                        const chartData = [
                            { metric: 'Sensitivität', values: [{ name: 'AS', ...stats.avocadoSign.sens }, { name: 'T2', ...stats.t2.sens }] },
                            { metric: 'Spezifität', values: [{ name: 'AS', ...stats.avocadoSign.spez }, { name: 'T2', ...stats.t2.spez }] },
                            { metric: 'PPV', values: [{ name: 'AS', ...stats.avocadoSign.ppv }, { name: 'T2', ...stats.t2.ppv }] },
                            { metric: 'NPV', values: [{ name: 'AS', ...stats.avocadoSign.npv }, { name: 'T2', ...stats.t2.npv }] },
                            { metric: 'Accuracy', values: [{ name: 'AS', ...stats.avocadoSign.acc }, { name: 'T2', ...stats.t2.acc }] },
                            { metric: 'AUC', values: [{ name: 'AS', ...stats.avocadoSign.auc }, { name: 'T2', ...stats.t2.auc }] }
                        ];
                        chartRenderer.renderPerformanceComparisonChart(`chart-as-vs-t2-${stateManager.getCurrentKollektiv()}`, chartData, { method1: 'AS', method2: 'T2' }, { yAxisLabel: 'Wert'});
                    }
                } else if (statsLayout === 'vergleich') {
                    const k1 = stateManager.getStatsKollektiv1();
                    const k2 = stateManager.getStatsKollektiv2();
                    const data1 = dataProcessor.filterDataByKollektiv(globallyEvaluatedData, k1);
                    const data2 = dataProcessor.filterDataByKollektiv(globallyEvaluatedData, k2);
                    const stats1 = statisticsService.calculateAllStats(data1, appliedCriteria, appliedLogic);
                    const stats2 = statisticsService.calculateAllStats(data2, appliedCriteria, appliedLogic);
                    
                    if (stats1 && stats1.avocadoSign && stats1.t2) {
                         const chartData1 = [
                            { metric: 'Sens', values: [{ name: 'AS', ...stats1.avocadoSign.sens }, { name: 'T2', ...stats1.t2.sens }] },
                            { metric: 'Spez', values: [{ name: 'AS', ...stats1.avocadoSign.spez }, { name: 'T2', ...stats1.t2.spez }] },
                            { metric: 'AUC', values: [{ name: 'AS', ...stats1.avocadoSign.auc }, { name: 'T2', ...stats1.t2.auc }] }
                        ];
                         chartRenderer.renderPerformanceComparisonChart(`chart-as-vs-t2-${k1}-compare`, chartData1, { method1: 'AS', method2: 'T2' }, { yAxisLabel: 'Wert'});
                    }
                    if (stats2 && stats2.avocadoSign && stats2.t2) {
                        const chartData2 = [
                            { metric: 'Sens', values: [{ name: 'AS', ...stats2.avocadoSign.sens }, { name: 'T2', ...stats2.t2.sens }] },
                            { metric: 'Spez', values: [{ name: 'AS', ...stats2.avocadoSign.spez }, { name: 'T2', ...stats2.t2.spez }] },
                            { metric: 'AUC', values: [{ name: 'AS', ...stats2.avocadoSign.auc }, { name: 'T2', ...stats2.t2.auc }] }
                        ];
                         chartRenderer.renderPerformanceComparisonChart(`chart-as-vs-t2-${k2}-comp`, chartData2, { method1: 'AS', method2: 'T2' }, { yAxisLabel: 'Wert'});
                    }
                }

            } else if (activeTabId === 'praesentation-tab') {
                const currentView = stateManager.getPresentationView();
                const praesData = praesentationController.getPresentationData(globallyEvaluatedData);

                if (currentView === 'as-pur' && praesData.asPur) {
                    const asPerformanceStats = praesData.asPur.avocadoSign;
                    if (asPerformanceStats) {
                        const singleMetricData = [
                             { label: 'Sens', value: asPerformanceStats.sens.value }, { label: 'Spez', value: asPerformanceStats.spez.value },
                             { label: 'PPV', value: asPerformanceStats.ppv.value }, { label: 'NPV', value: asPerformanceStats.npv.value },
                             { label: 'Acc', value: asPerformanceStats.acc.value }, { label: 'AUC', value: asPerformanceStats.auc.value }
                         ];
                         chartRenderer.renderBarChart('praes-chart-as-pur', singleMetricData, {yAxisLabel: 'Wert'});
                    }
                } else if (currentView === 'as-vs-t2' && praesData.asVsT2) {
                    const asVsT2Stats = praesData.asVsT2;
                    const selectedStudyId = stateManager.getPresentationStudyId();
                    const selectedStudy = studyCriteriaManager.getStudyCriteriaSetById(selectedStudyId) || { displayShortName: 'T2 (angewandt)' };
                    const t2ShortName = selectedStudy.displayShortName || selectedStudy.name;

                    if (asVsT2Stats.avocadoSign && asVsT2Stats.t2) {
                        const chartData = [
                            { metric: 'Sens', values: [{ name: 'AS', ...asVsT2Stats.avocadoSign.sens }, { name: t2ShortName, ...asVsT2Stats.t2.sens }] },
                            { metric: 'Spez', values: [{ name: 'AS', ...asVsT2Stats.avocadoSign.spez }, { name: t2ShortName, ...asVsT2Stats.t2.spez }] },
                            { metric: 'PPV', values: [{ name: 'AS', ...asVsT2Stats.avocadoSign.ppv }, { name: t2ShortName, ...asVsT2Stats.t2.ppv }] },
                            { metric: 'NPV', values: [{ name: 'AS', ...asVsT2Stats.avocadoSign.npv }, { name: t2ShortName, ...asVsT2Stats.t2.npv }] },
                            { metric: 'AUC', values: [{ name: 'AS', ...asVsT2Stats.avocadoSign.auc }, { name: t2ShortName, ...asVsT2Stats.t2.auc }] }
                        ];
                        chartRenderer.renderPerformanceComparisonChart('praes-chart-as-vs-t2', chartData, { method1: 'AS', method2: t2ShortName }, { yAxisLabel: 'Wert'});
                    }
                }
            }
        }
        
        function _handleTabChange(event) {
            const link = event.target.closest('a.nav-link');
            if (!link || link.classList.contains('active')) return;
            event.preventDefault();
            
            const newTabId = link.id;

            if(lastActiveTabId && controllers[lastActiveTabId] && typeof controllers[lastActiveTabId].onTabExit === 'function') {
                controllers[lastActiveTabId].onTabExit();
            }

            document.querySelectorAll('#app-nav .nav-link.active, .tab-content .tab-pane.active').forEach(el => el.classList.remove('active', 'show'));
            
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
            // 1. Evaluate ALL data first to create a consistent global dataset
            const appliedCriteria = t2CriteriaManager.getCriteria();
            const appliedLogic = t2CriteriaManager.getLogic();
            const globallyEvaluatedData = t2CriteriaManager.evaluateDatasetWithCriteria(processedData, appliedCriteria, appliedLogic);

            // 2. Filter this global dataset for the current view/kollektiv
            const currentKollektiv = stateManager.getCurrentKollektiv();
            const filteredData = dataProcessor.filterDataByKollektiv(globallyEvaluatedData, currentKollektiv);
            
            // 3. Update UI elements based on the filtered data
            const headerStats = dataProcessor.calculateHeaderStats(filteredData, currentKollektiv);
            _updateHeaderStats(headerStats);
            uiHelpers.updateKollektivButtonsUI(currentKollektiv);
            
            const activeTabId = stateManager.getActiveTabId();
            const activeTab = document.querySelector(`#app-nav a#${activeTabId}`);
            if (activeTab && !activeTab.classList.contains('active')) {
                const tab = new bootstrap.Tab(activeTab);
                tab.show();
            }
            
            // 4. Render the active tab, passing BOTH filtered and global data as needed
            _renderActiveTab(filteredData, globallyEvaluatedData, activeTabId);
        }

        function init() {
            rawData = patientDataRaw;
            stateManager.init();
            processedData = dataProcessor.processPatientData(rawData);
            t2CriteriaManager.initialize();

            Object.values(controllers).forEach(controller => {
                if (typeof controller.init === 'function') {
                    controller.init(mainAppInterface);
                }
            });
            
            bruteForceManager.init({
                onStarted: (p) => controllers['auswertung-tab'].updateBruteForceUI('started', p),
                onProgress: (p) => controllers['auswertung-tab'].updateBruteForceUI('progress', p),
                onResult: (p) => controllers['auswertung-tab'].updateBruteForceUI('result', p),
                onCancelled: (p) => controllers['auswertung-tab'].updateBruteForceUI('cancelled', p),
                onError: (p) => controllers['auswertung-tab'].updateBruteForceUI('error', p)
            });

            document.getElementById('app-nav').addEventListener('click', _handleTabChange);
            document.querySelector('.kollektiv-selector').addEventListener('click', _handleKollektivChange);
            document.getElementById('show-kurzanleitung-btn').addEventListener('click', uiHelpers.showKurzanleitung);

            const initialTabId = stateManager.getActiveTabId();
            lastActiveTabId = initialTabId;
            const initialTabEl = document.getElementById(initialTabId);
            if (initialTabEl) {
                 const tab = new bootstrap.Tab(initialTabEl);
                 tab.show();
            }

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

        return { init, updateAndRender };

    })();

    mainApp.init();
});
