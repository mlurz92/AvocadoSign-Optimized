const uiManager = (() => {
    let _mainAppInterface = {};
    let _isInitialized = false;

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

    function _renderTab(tabId) {
        if (!tabId) return;
        const paneId = `${tabId}-pane`;
        const container = document.getElementById(paneId);
        if (!container) return;

        container.innerHTML = `<div class="d-flex justify-content-center align-items-center p-5" style="min-height: 300px;"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade...</span></div></div>`;
        
        requestAnimationFrame(() => {
            try {
                const state = appState.getState();
                const allData = _mainAppInterface.getProcessedData();
                const currentData = dataManager.filterDataByKollektiv(allData, state.currentKollektiv);
                const bfResults = bruteForceManager.getAllResults();
                const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
                const appliedLogic = t2CriteriaManager.getAppliedLogic();
                
                let contentHTML = '';

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
                        const presentationData = _mainAppInterface.getPresentationData();
                        contentHTML = praesentationTab.render(state.currentPresentationView, state.currentPresentationStudyId, state.currentKollektiv, presentationData);
                        break;
                    case 'publikation-tab':
                        const publicationData = _mainAppInterface.getPublicationData();
                        contentHTML = publikationTab.render(publicationData.allKollektivStats, publicationData.commonData, state.currentPublikationLang, state.currentPublikationSection, state.currentPublikationBruteForceMetric);
                        break;
                    case 'export-tab':
                        contentHTML = exportTab.render(state.currentKollektiv, bfResults);
                        break;
                    default:
                        contentHTML = `<p class="text-warning p-3">Unbekannter Tab: ${tabId}</p>`;
                }
                
                container.innerHTML = contentHTML;
                _postRender(tabId, currentData, allData, bfResults);

            } catch (error) {
                container.innerHTML = `<div class="alert alert-danger m-3">Fehler beim Laden des Tabs ${tabId}: ${error.message}<br><pre>${error.stack}</pre></div>`;
            }
        });
    }

    function _postRender(tabId, currentData, allData, bfResults) {
        tooltip.init(document.getElementById(`${tabId}-pane`));
        
        switch (tabId) {
            case 'daten-tab':
            case 'auswertung-tab':
                attachCollapseEventListeners(`#${tabId}-pane`);
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
                publikationTab.updateDynamicChartsForPublicationTab(appState.getState().currentPublikationSection);
                break;
        }
    }

    function _updateAuswertungDashboard(data) {
        const stats = statisticsService.calculateDescriptiveStats(data);
        if (!stats) return;
        
        charts.renderAgeDistributionChart(stats.alter.alterData, 'chart-dash-age');
        charts.renderPieChart([{label: 'm', value: stats.geschlecht.m}, {label: 'w', value: stats.geschlecht.f}], 'chart-dash-gender');
        charts.renderPieChart([{label: 'direkt OP', value: stats.therapie[CONSTANTS.KOLEKTIV.DIREKT_OP]}, {label: 'nRCT', value: stats.therapie[CONSTANTS.KOLEKTIV.NRCT]}], 'chart-dash-therapy');
        charts.renderPieChart([{label: 'N+', value: stats.nStatus.plus}, {label: 'N-', value: stats.nStatus.minus}], 'chart-dash-status-n');
        charts.renderPieChart([{label: 'AS+', value: stats.asStatus.plus}, {label: 'AS-', value: stats.asStatus.minus}], 'chart-dash-status-as');
        charts.renderPieChart([{label: 'T2+', value: stats.t2Status.plus}, {label: 'T2-', value: stats.t2Status.minus}], 'chart-dash-status-t2');
    }

    function _updateStatistikCharts(allData) {
        // Implementation for rendering charts in statistik tab
    }

    function _handleTabChange(event) {
        if(event.target && event.target.id){
            appState.setActiveTabId(event.target.id);
            _renderTabContent(event.target.id);
        }
    }
    
    function _handleAppEvents(event) {
        const { type, target } = event;
        let delegated = false;
        
        if(type === 'click') {
            if(target.closest('[data-kollektiv]')) { generalEventHandlers.handleKollektivChange(target.closest('[data-kollektiv]').dataset.kollektiv, _mainAppInterface); delegated = true; }
            else if(target.closest('th[data-sort-key]')) { generalEventHandlers.handleSortClick(target.closest('th[data-sort-key]'), target.closest('.sortable-sub-header'), _mainAppInterface); delegated = true; }
            else if(target.closest(CONSTANTS.SELECTORS.BTN_KURANLEITUNG)) { generalEventHandlers.handleKurzanleitungClick(); delegated = true; }
        }

        if(target.closest(CONSTANTS.SELECTORS.AUSWERTUNG_TAB_PANE)) auswertungEventHandlers.handle(event, _mainAppInterface);
        else if(target.closest(CONSTANTS.SELECTORS.STATISTIK_TAB_PANE)) statistikEventHandlers.handle(event, _mainAppInterface);
        else if(target.closest(CONSTANTS.SELECTORS.PRAESENTATION_TAB_PANE)) praesentationEventHandlers.handle(event, _mainAppInterface);
        else if(target.closest(CONSTANTS.SELECTORS.PUBLIKATION_TAB_PANE)) publikationEventHandlers.handle(event, _mainAppInterface);
        else if(target.closest(CONSTANTS.SELECTORS.EXPORT_TAB_PANE)) exportEventHandlers.handle(event, _mainAppInterface);
    }
    
    function attachCollapseEventListeners(scopeSelector) {
        const parent = document.querySelector(scopeSelector);
        if (!parent) return;

        parent.addEventListener('show.bs.collapse', e => {
            const triggerRow = e.target.closest('tr.sub-row')?.previousElementSibling;
            const icon = triggerRow?.querySelector('.row-toggle-icon');
            if(icon) icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        });
        parent.addEventListener('hide.bs.collapse', e => {
            const triggerRow = e.target.closest('tr.sub-row')?.previousElementSibling;
            const icon = triggerRow?.querySelector('.row-toggle-icon');
            if(icon) icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
        });
    }

    function init(mainAppInterface) {
        if (_isInitialized) return;
        _mainAppInterface = mainAppInterface;
        
        document.querySelector(CONSTANTS.SELECTORS.MAIN_TAB_NAV)?.addEventListener('show.bs.tab', _handleTabChange);
        document.body.addEventListener('click', _handleAppEvents);
        document.body.addEventListener('change', _handleAppEvents);
        document.body.addEventListener('input', _handleAppEvents);
        
        const initialTabId = appState.getActiveTabId();
        const tabEl = document.getElementById(initialTabId);
        if(tabEl) {
            new bootstrap.Tab(tabEl).show();
            _renderTabContent(initialTabId);
        } else {
            const fallbackTabEl = document.getElementById('publikation-tab');
            new bootstrap.Tab(fallbackTabEl).show();
            _renderTabContent('publikation-tab');
        }
        _updateHeaderUI();
        _isInitialized = true;
    }
    
    return Object.freeze({
        init,
        renderTab: _renderTabContent,
        updateHeader: _updateHeaderUI,
        attachCollapseEventListeners
    });
})();
