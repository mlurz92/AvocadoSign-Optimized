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
                        const stats = statisticsService.calculateAllStats(evaluatedData, appliedCriteria, appliedLogic);
                        contentHTML = statistikRenderer.render(stats, stateManager.getStatsLayout(), stateManager.getStatsKollektiv1(), stateManager.getStatsKollektiv2());
                        break;
                    case 'praesentation-tab':
                        const praesStats = presentationController.getPresentationData(processedData);
                        contentHTML = praesentationRenderer.render(stateManager.getPresentationView(), praesStats, stateManager.getPresentationStudyId());
                        break;
                    case 'publikation-tab':
                        contentHTML = publikationController.renderContent();
                        break;
                    case 'export-tab':
                        contentHTML = exportRenderer.render(Object.keys(bruteForceManager.getAllResults()).length > 0, processedData.length > 0);
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
            uiHelpers.initializeTooltips(document.getElementById(`${activeTabId}-pane`));
            
            const controller = controllers[activeTabId];
            if (controller && typeof controller.onTabEnter === 'function') {
                controller.onTabEnter();
            }
            
            if (activeTabId === 'auswertung-tab') {
                const dashboardStats = statisticsService.calculateDescriptiveStats(evaluatedData);
                 if(dashboardStats && dashboardStats.count > 0) {
                    chartRenderer.renderBarChart('dashboard-chart-gender', [{label: 'M', value: dashboardStats.gender.m}, {label: 'W', value: dashboardStats.gender.f}], {yAxisLabel: 'Anzahl'});
                    chartRenderer.renderBarChart('dashboard-chart-therapy', [{label: 'Direkt OP', value: dashboardStats.therapy['direkt OP']}, {label: 'nRCT', value: dashboardStats.therapy.nRCT}], {yAxisLabel: 'Anzahl'});
                }
            } else if (activeTabId === 'statistik-tab') {
                 const stats = statisticsService.calculateAllStats(evaluatedData, t2CriteriaManager.getCriteria(), t2CriteriaManager.getLogic());
                 const chartData = stats.comparison ? [
                    { metric: 'Sensitivität', values: [{ name: 'Avocado Sign', ...stats.avocadoSign.sens }, { name: 'T2', ...stats.t2.sens }] },
                    { metric: 'Spezifität', values: [{ name: 'Avocado Sign', ...stats.avocadoSign.spez }, { name: 'T2', ...stats.t2.spez }] },
                    { metric: 'AUC', values: [{ name: 'Avocado Sign', ...stats.avocadoSign.auc }, { name: 'T2', ...stats.t2.auc }] }
                 ] : [];
                 chartRenderer.renderPerformanceComparisonChart(`chart-as-vs-t2-${stateManager.getCurrentKollektiv()}`, chartData, {method1: 'Avocado Sign', method2: 'T2'});
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

            document.querySelector('#app-nav .nav-link.active')?.classList.remove('active');
            document.querySelector('.tab-content .tab-pane.active')?.classList.remove('active', 'show');
            
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
                onProgress: (payload) => auswertungController.updateBruteForceUI('progress', payload),
                onResult: (payload) => auswertungController.updateBruteForceUI('result', payload),
                onError: (payload) => auswertungController.updateBruteForceUI('error', payload),
                onCancelled: (payload) => auswertungController.updateBruteForceUI('cancelled', payload),
                onStarted: (payload) => auswertungController.updateBruteForceUI('started', payload)
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
