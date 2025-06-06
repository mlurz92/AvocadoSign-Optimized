document.addEventListener('DOMContentLoaded', () => {

    const mainApp = (() => {

        const tabPaneContainer = document.getElementById('app-tab-content');
        let isFirstRenderDone = false;
        let processedData = [];

        function _renderActiveTab(data) {
            if (!tabPaneContainer) return;
            
            const activeTabId = stateManager.getActiveTabId();
            const currentKollektiv = stateManager.getCurrentKollektiv();
            let contentHTML = '';

            const spinnerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;"><div class="spinner-border" role="status"><span class="visually-hidden">Lade...</span></div></div>`;
            tabPaneContainer.innerHTML = spinnerHTML;

            setTimeout(() => {
                switch (activeTabId) {
                    case 'daten-tab':
                        contentHTML = dataRenderer.render(data, stateManager.getSortState('daten'));
                        break;
                    case 'auswertung-tab':
                        const dashboardStats = statisticsService.calculateDescriptiveStats(data);
                        const t2Metrics = statisticsService.calculateDiagnosticPerformance(data, 't2', 'n');
                        const evaluatedDataForAuswertung = t2CriteriaManager.evaluateDatasetWithCriteria(data, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
                        contentHTML = auswertungRenderer.render(evaluatedDataForAuswertung, dashboardStats, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), stateManager.getSortState('auswertung'), currentKollektiv, bruteForceManager.isWorkerAvailable(), t2Metrics);
                        break;
                    case 'statistik-tab':
                        const evaluatedDataForStats = t2CriteriaManager.evaluateDatasetWithCriteria(data, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
                        const stats = {
                           descriptive: statisticsService.calculateDescriptiveStats(evaluatedDataForStats),
                           avocadoSign: statisticsService.calculateDiagnosticPerformance(evaluatedDataForStats, 'as', 'n'),
                           t2: statisticsService.calculateDiagnosticPerformance(evaluatedDataForStats, 't2', 'n'),
                           comparison: statisticsService.compareDiagnosticMethods(evaluatedDataForStats, 'as', 't2', 'n'),
                           associations: statisticsService.calculateAssociations(evaluatedDataForStats, t2CriteriaManager.getAppliedCriteria())
                        };
                        contentHTML = statistikRenderer.render(stats, stateManager.getStatsLayout(), stateManager.getStatsKollektiv1(), stateManager.getStatsKollektiv2());
                        break;
                    case 'praesentation-tab':
                        const currentStudyId = stateManager.getPresentationStudyId() || APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
                        const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(currentStudyId);
                        const praesKollektiv = studySet?.applicableKollektiv || 'Gesamt';
                        const praesDataFiltered = dataProcessor.filterDataByKollektiv(processedData, praesKollektiv);
                        const praesDataEvaluated = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(praesDataFiltered, studySet);

                        const praesStats = {
                            asPur: statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'Gesamt'), 'as', 'n'),
                            asVsT2: {
                                avocadoSign: statisticsService.calculateDiagnosticPerformance(praesDataEvaluated, 'as', 'n'),
                                t2: statisticsService.calculateDiagnosticPerformance(praesDataEvaluated, 't2', 'n'),
                                comparison: statisticsService.compareDiagnosticMethods(praesDataEvaluated, 'as', 't2', 'n'),
                            }
                        };
                        contentHTML = praesentationRenderer.render(stateManager.getPresentationView(), praesStats, stateManager.getPresentationStudyId());
                        break;
                    case 'publikation-tab':
                        contentHTML = publikationController.renderAndGetContent();
                        break;
                    case 'export-tab':
                        contentHTML = exportRenderer.render(bruteForceManager.getAllResults(), processedData.length > 0);
                        break;
                    default:
                        contentHTML = `<p>Tab "${activeTabId}" nicht gefunden.</p>`;
                }
                
                tabPaneContainer.innerHTML = contentHTML;
                _postRenderUpdates(activeTabId, data);

            }, 100);
        }

        function _postRenderUpdates(activeTabId, data) {
            uiHelpers.initializeTooltips(tabPaneContainer);
            
            if (activeTabId === 'daten-tab') {
                const tableBody = document.getElementById('daten-table-body');
                if (tableBody) uiHelpers.attachRowCollapseListeners(tableBody);
            } else if (activeTabId === 'auswertung-tab') {
                const tableBody = document.getElementById('auswertung-table-body');
                if (tableBody) uiHelpers.attachRowCollapseListeners(tableBody);
                const dashboardStats = statisticsService.calculateDescriptiveStats(data);
                if(dashboardStats && dashboardStats.anzahlPatienten > 0) {
                    chartRenderer.renderPieChart('dashboard-chart-gender', [{label: 'M', value: dashboardStats.geschlecht.m}, {label: 'W', value: dashboardStats.geschlecht.f}], true);
                    chartRenderer.renderPieChart('dashboard-chart-therapy', [{label: 'pRCT', value: dashboardStats.therapie['direkt OP']}, {label: 'nRCT', value: dashboardStats.therapie.nRCT}], true);
                    chartRenderer.renderPieChart('dashboard-chart-status-n', [{label: 'N+', value: dashboardStats.nStatus.plus}, {label: 'N-', value: dashboardStats.nStatus.minus}], true);
                    chartRenderer.renderPieChart('dashboard-chart-status-as', [{label: 'AS+', value: dashboardStats.asStatus.plus}, {label: 'AS-', value: dashboardStats.asStatus.minus}], true);
                    const t2Data = t2CriteriaManager.evaluateDatasetWithCriteria(data, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
                    const t2Stats = dataProcessor.calculateHeaderStats(t2Data, stateManager.getCurrentKollektiv());
                    chartRenderer.renderPieChart('dashboard-chart-status-t2', [{label: 'T2+', value: t2Stats.t2Pos}, {label: 'T2-', value: t2Stats.t2Neg}], true);
                    chartRenderer.renderAgeDistribution('dashboard-chart-age', dashboardStats.alterData);
                }
            } else if (activeTabId === 'statistik-tab') {
                statistikController.updateView();
            } else if (activeTabId === 'praesentation-tab') {
                praesentationController.updateView();
            } else if (activeTabId === 'publikation-tab') {
                publikationController.updateView();
            } else if (activeTabId === 'export-tab') {
                exportController.updateView();
            }

            if (!isFirstRenderDone) {
                _handleFirstAppStart();
                isFirstRenderDone = true;
            }
        }
        
        function _handleFirstAppStart() {
            const firstStart = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START);
            if (firstStart === null) {
                uiHelpers.showKurzanleitung().then(() => {
                    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START, 'done');
                });
            }
        }
        
        function updateAndRender() {
            const currentKollektiv = stateManager.getCurrentKollektiv();
            const filteredData = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv);
            
            const evaluatedData = t2CriteriaManager.evaluateDatasetWithCriteria(filteredData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
            const headerStats = dataProcessor.calculateHeaderStats(evaluatedData, currentKollektiv);
            
            uiHelpers.updateHeaderStatsUI(headerStats);
            uiHelpers.updateKollektivButtonsUI(currentKollektiv);
            
            _renderActiveTab(evaluatedData);
        }

        function _handleTabChange(event) {
            event.preventDefault();
            const link = event.target.closest('a');
            if (!link || !link.dataset.bsToggle) return;

            const newTabId = link.getAttribute('href').substring(1);
            stateManager.setActiveTabId(newTabId);
            updateAndRender();
        }
        
        function _handleKollektivChange(event) {
            const button = event.target.closest('[data-kollektiv]');
            if (button) {
                const newKollektiv = button.dataset.kollektiv;
                stateManager.setCurrentKollektiv(newKollektiv);
                updateAndRender();
            }
        }

        function init() {
            console.log(`Initialisiere ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION}...`);
            
            processedData = dataProcessor.processPatientData(patientDataRaw);
            stateManager.init();
            t2CriteriaManager.initialize();
            
            const mainAppInterface = { updateAndRender };
            
            try {
                dataController.init(mainAppInterface);
                auswertungController.init(mainAppInterface);
                statistikController.init(mainAppInterface);
                praesentationController.init(mainAppInterface);
                exportController.init(mainAppInterface);
                publikationController.init(mainAppInterface);
                bruteForceManager.init({
                    onProgress: (payload) => auswertungController.updateBruteForceUI('progress', payload),
                    onResult: (payload) => auswertungController.updateBruteForceUI('result', payload),
                    onError: (payload) => auswertungController.updateBruteForceUI('error', payload),
                    onCancelled: (payload) => auswertungController.updateBruteForceUI('cancelled', payload),
                    onStarted: (payload) => auswertungController.updateBruteForceUI('started', payload)
                });
            } catch (error) {
                 console.error("Fehler bei der Controller-Initialisierung:", error);
                 uiHelpers.showToast("Ein kritischer Fehler ist bei der Initialisierung der App aufgetreten.", "danger");
                 return;
            }

            document.querySelectorAll('#app-nav .nav-link').forEach(tab => tab.addEventListener('click', _handleTabChange));
            document.querySelector('.kollektiv-selector').addEventListener('click', _handleKollektivChange);
            document.getElementById('show-kurzanleitung-btn').addEventListener('click', () => uiHelpers.showKurzanleitung());

            updateAndRender();
        }

        return { init };

    })();

    mainApp.init();
});
