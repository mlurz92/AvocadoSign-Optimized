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

        function _updateHeaderStats(stats) {
            uiHelpers.updateElementHTML('header-kollektiv', stats.kollektiv);
            uiHelpers.updateElementHTML('header-anzahl-patienten', stats.anzahlPatienten);
            uiHelpers.updateElementHTML('header-status-n', stats.statusN);
            uiHelpers.updateElementHTML('header-status-as', stats.statusAS);
            uiHelpers.updateElementHTML('header-status-t2', stats.statusT2);
        }

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
                        const statsLayout = stateManager.getStatsLayout();
                        let statsForRendering;
                        if (statsLayout === 'vergleich') {
                            const kollektiv1Data = dataProcessor.filterDataByKollektiv(processedData, stateManager.getStatsKollektiv1());
                            const kollektiv2Data = dataProcessor.filterDataByKollektiv(processedData, stateManager.getStatsKollektiv2());
                            statsForRendering = {
                                kollektiv1: statisticsService.calculateAllStats(kollektiv1Data, appliedCriteria, appliedLogic),
                                kollektiv2: statisticsService.calculateAllStats(kollektiv2Data, appliedCriteria, appliedLogic)
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
                const tableBody = activePane.querySelector('.data-table tbody');
                if(tableBody) uiHelpers.attachRowCollapseListeners(tableBody);
            }
            
            const controller = controllers[activeTabId];
            if (controller && typeof controller.onTabEnter === 'function') {
                controller.onTabEnter();
            }
            
            if (activeTabId === 'auswertung-tab') {
                const dashboardStats = statisticsService.calculateDescriptiveStats(evaluatedData);
                const headerStats = dataProcessor.calculateHeaderStats(evaluatedData, stateManager.getCurrentKollektiv());

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
                if (statsLayout === 'einzel') {
                    const stats = statisticsService.calculateAllStats(evaluatedData, t2CriteriaManager.getCriteria(), t2CriteriaManager.getLogic());
                    const chartData = [
                        { metric: 'Sensitivität', values: [{ name: 'AS', ...stats.avocadoSign.sens }, { name: 'T2', ...stats.t2.sens }] },
                        { metric: 'Spezifität', values: [{ name: 'AS', ...stats.avocadoSign.spez }, { name: 'T2', ...stats.t2.spez }] },
                        { metric: 'PPV', values: [{ name: 'AS', ...stats.avocadoSign.ppv }, { name: 'T2', ...stats.t2.ppv }] },
                        { metric: 'NPV', values: [{ name: 'AS', ...stats.avocadoSign.npv }, { name: 'T2', ...stats.t2.npv }] },
                        { metric: 'Accuracy', values: [{ name: 'AS', ...stats.avocadoSign.acc }, { name: 'T2', ...stats.t2.acc }] },
                        { metric: 'AUC', values: [{ name: 'AS', ...stats.avocadoSign.auc }, { name: 'T2', ...stats.t2.auc }] }
                    ];
                    chartRenderer.renderPerformanceComparisonChart(`chart-as-vs-t2-${stateManager.getCurrentKollektiv()}`, chartData, { method1: 'AS', method2: 'T2' });
                } else if (statsLayout === 'vergleich') {
                    const k1 = stateManager.getStatsKollektiv1();
                    const k2 = stateManager.getStatsKollektiv2();
                    const data1 = dataProcessor.filterDataByKollektiv(processedData, k1);
                    const data2 = dataProcessor.filterDataByKollektiv(processedData, k2);
                    const stats1 = statisticsService.calculateAllStats(data1, t2CriteriaManager.getCriteria(), t2CriteriaManager.getLogic());
                    const stats2 = statisticsService.calculateAllStats(data2, t2CriteriaManager.getCriteria(), t2CriteriaManager.getLogic());

                    const chartData1 = [
                        { metric: 'Sens', values: [{ name: 'AS', ...stats1.avocadoSign.sens }, { name: 'T2', ...stats1.t2.sens }] },
                        { metric: 'Spez', values: [{ name: 'AS', ...stats1.avocadoSign.spez }, { name: 'T2', ...stats1.t2.spez }] },
                        { metric: 'AUC', values: [{ name: 'AS', ...stats1.avocadoSign.auc }, { name: 'T2', ...stats1.t2.auc }] }
                    ];
                     chartRenderer.renderPerformanceComparisonChart(`chart-container-as-vs-t2-${k1}-comp`, chartData1, { method1: 'AS', method2: 'T2' });

                    const chartData2 = [
                        { metric: 'Sens', values: [{ name: 'AS', ...stats2.avocadoSign.sens }, { name: 'T2', ...stats2.t2.sens }] },
                        { metric: 'Spez', values: [{ name: 'AS', ...stats2.avocadoSign.spez }, { name: 'T2', ...stats2.t2.spez }] },
                        { metric: 'AUC', values: [{ name: 'AS', ...stats2.avocadoSign.auc }, { name: 'T2', ...stats2.t2.auc }] }
                    ];
                     chartRenderer.renderPerformanceComparisonChart(`chart-container-as-vs-t2-${k2}-comp`, chartData2, { method1: 'AS', method2: 'T2' });
                }

            } else if (activeTabId === 'praesentation-tab') {
                const currentView = stateManager.getPresentationView();
                const praesData = praesentationController.getPresentationData(processedData);

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
                        chartRenderer.renderPerformanceComparisonChart('praes-chart-as-vs-t2', chartData, { method1: 'AS', method2: t2ShortName });
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
            
            _updateHeaderStats(headerStats);
            uiHelpers.updateKollektivButtonsUI(currentKollektiv);
            
            _renderActiveTab(evaluatedData, stateManager.getActiveTabId());
        }

        function init() {
            processedData = dataProcessor.processPatientData(patientDataRaw);
            stateManager.init();
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
            document.querySelectorAll('#app-nav .nav-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.tab-content .tab-pane').forEach(p => p.classList.remove('active', 'show'));
            
            const initialTabEl = document.getElementById(initialTabId);
            if (initialTabEl) initialTabEl.classList.add('active');
            const initialPaneEl = document.getElementById(`${initialTabId}-pane`);
            if (initialPaneEl) initialPaneEl.classList.add('active', 'show');

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
