const uiManager = (() => {

    let _mainAppInterface = {};

    function _updateHeaderUI() {
        const state = appState.getState();
        const allData = _mainAppInterface.getProcessedData();
        const currentData = dataManager.filterDataByKollektiv(allData, state.currentKollektiv);
        const headerStats = dataManager.calculateHeaderStats(currentData, state.currentKollektiv);

        document.querySelector(CONSTANTS.SELECTORS.HEADER_KOLLEKTIV).textContent = headerStats.kollektiv;
        document.querySelector(CONSTANTS.SELECTORS.HEADER_ANZAHL_PATIENTEN).textContent = headerStats.anzahlPatienten;
        document.querySelector(CONSTANTS.SELECTORS.HEADER_STATUS_N).textContent = headerStats.statusN;
        document.querySelector(CONSTANTS.SELECTORS.HEADER_STATUS_AS).textContent = headerStats.statusAS;
        document.querySelector(CONSTANTS.SELECTORS.HEADER_STATUS_T2).textContent = headerStats.statusT2;
        
        document.querySelectorAll(CONSTANTS.SELECTORS.KOLLEKTIV_BUTTONS).forEach(btn => {
            btn.classList.toggle(CONSTANTS.CLASSES.ACTIVE, btn.dataset.kollektiv === state.currentKollektiv);
        });
    }

    function _renderTabContent(tabId) {
        const paneId = `${tabId}-pane`;
        const container = document.getElementById(paneId);
        if (!container) return;

        container.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade...</span></div></div>`;
        
        const state = appState.getState();
        const allData = _mainAppInterface.getProcessedData();
        const currentData = dataManager.filterDataByKollektiv(allData, state.currentKollektiv);
        const bfResults = bruteForceManager.getAllResults();

        let contentHTML = '';
        
        try {
            switch (tabId) {
                case 'daten-tab':
                    contentHTML = dataTab.render(currentData, state.datenTableSort);
                    break;
                case 'auswertung-tab':
                    contentHTML = auswertungTab.render(currentData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), state.auswertungTableSort, state.currentKollektiv);
                    break;
                case 'statistik-tab':
                    contentHTML = statistikTab.render(allData, state.currentStatsLayout, state.currentStatsKollektiv1, state.currentStatsKollektiv2, state.currentKollektiv);
                    break;
                case 'praesentation-tab':
                    contentHTML = praesentationTab.render(state.currentPresentationView, state.currentPresentationStudyId, state.currentKollektiv, allData);
                    break;
                case 'publikation-tab':
                    contentHTML = publikationTab.render(allData, bfResults, state.currentPublikationLang, state.currentPublikationSection, state.currentPublikationBruteForceMetric);
                    break;
                case 'export-tab':
                    contentHTML = exportTab.render(state.currentKollektiv);
                    break;
                default:
                    contentHTML = `<p class="text-warning">Unbekannter Tab: ${tabId}</p>`;
            }
            container.innerHTML = contentHTML;
            _postRender(tabId, currentData, allData, bfResults);
        } catch (error) {
            container.innerHTML = `<div class="alert alert-danger m-3">Fehler beim Laden des Tabs ${tabId}: ${error.message}</div>`;
        }
    }

    function _postRender(tabId, currentData, allData, bfResults) {
        tooltip.init(document.getElementById(`${tabId}-pane`));
        
        switch (tabId) {
            case 'daten-tab':
            case 'auswertung-tab':
                uiManager.attachCollapseEventListeners(`#${tabId}-body`);
                if(tabId === 'auswertung-tab') {
                    _updateAuswertungDashboard(currentData);
                }
                break;
            case 'statistik-tab':
                _updateStatistikCharts(allData);
                break;
            case 'publikation-tab':
                const scrollSpyTarget = document.querySelector(CONSTANTS.SELECTORS.PUBLIKATION_SECTIONS_NAV);
                if (scrollSpyTarget) {
                    new bootstrap.ScrollSpy(document.body, {
                        target: CONSTANTS.SELECTORS.PUBLIKATION_SECTIONS_NAV,
                        offset: 150
                    });
                }
                break;
        }
    }

    function _updateAuswertungDashboard(data) {
        const stats = statisticsService.calculateDescriptiveStats(data);
        if (!stats) return;
        
        charts.renderAgeDistributionChart(stats.alter.alterData, 'chart-dash-age');
        charts.renderPieChart([{label: 'm', value: stats.geschlecht.m}, {label: 'w', value: stats.geschlecht.f}], 'chart-dash-gender');
        charts.renderPieChart([{label: 'direkt OP', value: stats.therapie['direkt OP']}, {label: 'nRCT', value: stats.therapie.nRCT}], 'chart-dash-therapy');
        charts.renderPieChart([{label: 'N+', value: stats.nStatus.plus}, {label: 'N-', value: stats.nStatus.minus}], 'chart-dash-status-n');
        charts.renderPieChart([{label: 'AS+', value: stats.asStatus.plus}, {label: 'AS-', value: stats.asStatus.minus}], 'chart-dash-status-as');
        charts.renderPieChart([{label: 'T2+', value: stats.t2Status.plus}, {label: 'T2-', value: stats.t2Status.minus}], 'chart-dash-status-t2');
    }

    function _updateStatistikCharts(allData) {
        const state = appState.getState();
        const kollektiveToRender = state.currentStatsLayout === 'einzel' ? [state.currentKollektiv] : [state.currentStatsKollektiv1, state.currentStatsKollektiv2];
        
        kollektiveToRender.forEach((kolId, index) => {
            const data = dataManager.filterDataByKollektiv(allData, kolId);
            const stats = statisticsService.calculateAllStatsForPublication(data, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), bruteForceManager.getAllResults())[kolId];
            if(stats){
                charts.renderConfusionMatrix(stats.gueteAS.matrix, `matrix-AS-${index}`);
                charts.renderROCCurve(stats.rocAS, `roc-AS-${index}`, { auc: stats.gueteAS.auc.value });
                charts.renderConfusionMatrix(stats.gueteT2_angewandt.matrix, `matrix-T2-${index}`);
                charts.renderROCCurve(stats.rocT2, `roc-T2-${index}`, { auc: stats.gueteT2_angewandt.auc.value, color: APP_CONFIG.CHART_SETTINGS.T2_COLOR });
            }
        });
    }

    function _handleTabChange(event) {
        if(event.target.id){
            appState.setActiveTabId(event.target.id);
            _renderTabContent(event.target.id);
        }
    }
    
    function _handleAppEvents(event) {
        const target = event.target;
        const kollektivBtn = target.closest('[data-kollektiv]');
        const sortHeader = target.closest('th[data-sort-key]');
        
        if (kollektivBtn) {
            _mainAppInterface.handleGlobalKollektivChange(kollektivBtn.dataset.kollektiv);
            return;
        }

        if(sortHeader){
            const subKey = target.closest('.sortable-sub-header')?.dataset.subKey || null;
            _mainAppInterface.handleSortRequest(sortHeader.closest('table').id.includes('daten') ? 'daten' : 'auswertung', sortHeader.dataset.sortKey, subKey);
            return;
        }

        // Delegating to specific handlers
        if(target.closest(CONSTANTS.SELECTORS.AUSWERTUNG_TAB_PANE)) auswertungEventHandlers.handle(event, _mainAppInterface);
        if(target.closest(CONSTANTS.SELECTORS.STATISTIK_TAB_PANE)) statistikEventHandlers.handle(event, _mainAppInterface);
        if(target.closest(CONSTANTS.SELECTORS.PRAESENTATION_TAB_PANE)) praesentationEventHandlers.handle(event, _mainAppInterface);
        if(target.closest(CONSTANTS.SELECTORS.PUBLIKATION_TAB_PANE)) publikationEventHandlers.handle(event, _mainAppInterface);
        if(target.closest(CONSTANTS.SELECTORS.EXPORT_TAB_PANE)) exportEventHandlers.handle(event, _mainAppInterface);

        generalEventHandlers.handle(event, _mainAppInterface);
    }
    
    function attachCollapseEventListeners(tableBodySelector) {
        const tableBody = document.querySelector(tableBodySelector);
        if (tableBody) {
            tableBody.addEventListener('show.bs.collapse', e => {
                const triggerRow = e.target.closest('tr.sub-row')?.previousElementSibling;
                triggerRow?.querySelector('.row-toggle-icon')?.classList.replace('fa-chevron-down', 'fa-chevron-up');
            });
            tableBody.addEventListener('hide.bs.collapse', e => {
                const triggerRow = e.target.closest('tr.sub-row')?.previousElementSibling;
                triggerRow?.querySelector('.row-toggle-icon')?.classList.replace('fa-chevron-up', 'fa-chevron-down');
            });
        }
    }

    function init(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelector(CONSTANTS.SELECTORS.MAIN_TAB_NAV).addEventListener('show.bs.tab', _handleTabChange);
            document.body.addEventListener('click', _handleAppEvents);
            document.body.addEventListener('change', _handleAppEvents); // For select, checkbox, radio
            document.body.addEventListener('input', _handleAppEvents); // For range slider

            const initialTab = appState.getActiveTabId() || 'publikation-tab';
            const tabEl = document.getElementById(initialTab);
            if (tabEl) {
                new bootstrap.Tab(tabEl).show();
            } else {
                new bootstrap.Tab(document.getElementById('publikation-tab')).show();
            }
            _updateHeaderUI();
        });
    }
    
    return Object.freeze({
        init,
        renderTab: _renderTabContent,
        updateHeader: _updateHeaderUI,
        attachCollapseEventListeners
    });
})();
