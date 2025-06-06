document.addEventListener('DOMContentLoaded', () => {

    const mainApp = (() => {

        const tabPaneContainer = document.getElementById('app-tab-content');
        let isFirstRenderDone = false;

        function _renderActiveTab() {
            if (!tabPaneContainer) return;
            const activeTabId = stateManager.getActiveTabId();
            const currentKollektiv = stateManager.getCurrentKollektiv();
            const data = dataProcessor.getFilteredData();
            let contentHTML = '';

            const spinnerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;"><div class="spinner-border" role="status"><span class="visually-hidden">Lade...</span></div></div>`;
            tabPaneContainer.innerHTML = spinnerHTML;

            setTimeout(() => {
                switch (activeTabId) {
                    case 'daten-tab':
                        contentHTML = dataRenderer.render(data, stateManager.getSortState('daten'));
                        break;
                    case 'auswertung-tab':
                        const dashboardStats = statisticsService.calculateDashboardStats(data);
                        const t2Metrics = statisticsService.calculatePerformanceMetrics(data, 't2');
                        contentHTML = auswertungRenderer.render(data, dashboardStats, t2CriteriaManager.getCriteria(), t2CriteriaManager.getLogic(), stateManager.getSortState('auswertung'), currentKollektiv, bruteForceManager.isWorkerAvailable(), t2Metrics);
                        break;
                    case 'statistik-tab':
                        const stats = statisticsService.calculateAllStats(data);
                        contentHTML = statistikRenderer.render(stats, stateManager.getStatsLayout(), stateManager.getStatsKollektiv1(), stateManager.getStatsKollektiv2());
                        break;
                    case 'praesentation-tab':
                         const praesStats = {
                            asPur: statisticsService.calculateAllStats(dataProcessor.getFilteredData("Gesamt")),
                            asVsT2: statisticsService.calculateAllStats(data)
                         };
                        contentHTML = praesentationRenderer.render(stateManager.getPresentationView(), praesStats, stateManager.getPresentationStudyId());
                        break;
                    case 'publikation-tab':
                        contentHTML = publikationController.renderAndGetContent();
                        break;
                    case 'export-tab':
                        contentHTML = exportRenderer.render(bruteForceManager.hasResults(), dataProcessor.isDataLoaded());
                        break;
                    default:
                        contentHTML = `<p>Tab "${activeTabId}" nicht gefunden.</p>`;
                }
                
                tabPaneContainer.innerHTML = contentHTML;
                _postRenderUpdates(activeTabId, data);

            }, APP_CONFIG.PERFORMANCE_SETTINGS.SPINNER_DELAY_MS);
        }

        function _postRenderUpdates(activeTabId, data) {
            uiHelpers.initializeTooltips(tabPaneContainer);
            
            if (activeTabId === 'daten-tab') {
                const tableBody = document.getElementById('daten-table-body');
                if (tableBody) uiHelpers.attachRowCollapseListeners(tableBody);
            } else if (activeTabId === 'auswertung-tab') {
                const tableBody = document.getElementById('auswertung-table-body');
                if (tableBody) uiHelpers.attachRowCollapseListeners(tableBody);
                const dashboardStats = statisticsService.calculateDashboardStats(data);
                chartRenderer.renderPieChart('dashboard-chart-gender', dashboardStats.gender, true);
                chartRenderer.renderPieChart('dashboard-chart-therapy', dashboardStats.therapy, true);
                chartRenderer.renderPieChart('dashboard-chart-status-n', dashboardStats.nStatus, true);
                chartRenderer.renderPieChart('dashboard-chart-status-as', dashboardStats.asStatus, true);
                chartRenderer.renderPieChart('dashboard-chart-status-t2', dashboardStats.t2Status, true);
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
            dataProcessor.filterData(currentKollektiv);
            
            const stats = statisticsService.getGlobalHeaderStats(dataProcessor.getFilteredData());
            uiHelpers.updateHeaderStatsUI(stats);
            uiHelpers.updateKollektivButtonsUI(currentKollektiv);
            
            _renderActiveTab();
        }

        function _handleTabChange(event) {
            event.preventDefault();
            const newTabId = event.target.getAttribute('href').substring(1);
            stateManager.setActiveTabId(newTabId);
            updateAndRender();
        }
        
        function _handleKollektivChange(event) {
            const newKollektiv = event.target.closest('[data-kollektiv]')?.dataset.kollektiv;
            if (newKollektiv) {
                stateManager.setCurrentKollektiv(newKollektiv);
                updateAndRender();
            }
        }

        function init() {
            console.log(`Initialisiere ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION}...`);
            
            const mainAppInterface = { updateAndRender };
            
            try {
                dataController.init(mainAppInterface);
                auswertungController.init(mainAppInterface);
                statistikController.init(mainAppInterface);
                praesentationController.init(mainAppInterface);
                exportController.init(mainAppInterface);
                publikationController.init(mainAppInterface);
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
