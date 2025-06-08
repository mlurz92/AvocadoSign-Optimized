const uiManager = (() => {
    let _mainAppInterface = {};
    let _isInitialized = false;

    function _updateHeaderUI() {
        const state = appState.getState();
        const allData = _mainAppInterface.getProcessedData();
        const currentData = dataManager.filterDataByKollektiv(allData, state.getCurrentKollektiv()); // Use state.getCurrentKollektiv()
        const headerStats = dataManager.calculateHeaderStats(currentData, state.getCurrentKollektiv()); // Use state.getCurrentKollektiv()

        document.querySelector(CONSTANTS.SELECTORS.HEADER_KOLLEKTIV).textContent = headerStats.kollektiv;
        document.querySelector(CONSTANTS.SELECTORS.HEADER_ANZAHL_PATIENTEN).textContent = headerStats.anzahlPatienten;
        document.querySelector(CONSTANTS.SELECTORS.HEADER_STATUS_N).textContent = headerStats.statusN;
        document.querySelector(CONSTANTS.SELECTORS.HEADER_STATUS_AS).textContent = headerStats.statusAS;
        document.querySelector(CONSTANTS.SELECTORS.HEADER_STATUS_T2).textContent = headerStats.statusT2;
        
        document.querySelectorAll(CONSTANTS.SELECTORS.KOLLEKTIV_BUTTONS).forEach(btn => {
            btn.classList.toggle(CONSTANTS.CLASSES.ACTIVE, btn.dataset.kollektiv === state.getCurrentKollektiv()); // Use state.getCurrentKollektiv()
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
                const currentData = dataManager.filterDataByKollektiv(allData, state.getCurrentKollektiv());
                const bfResults = bruteForceManager.getAllResults();
                const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
                const appliedLogic = t2CriteriaManager.getAppliedLogic();
                
                let contentHTML = '';

                switch (tabId) {
                    case 'daten-tab':
                        contentHTML = dataTab.render(currentData, state.getDatenTableSort());
                        break;
                    case 'auswertung-tab':
                        contentHTML = auswertungTab.render(currentData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), state.getAuswertungTableSort(), state.getCurrentKollektiv());
                        break;
                    case 'statistik-tab':
                        // Statistik-Tab benötigt das gesamte Rohdatenset, um Kollektive dynamisch zu filtern und zu vergleichen
                        contentHTML = statistikTab.render(allData, state.getStatsLayout(), state.getStatsKollektiv1(), state.getStatsKollektiv2(), state.getCurrentKollektiv());
                        break;
                    case 'praesentation-tab':
                        const presentationData = _mainAppInterface.getPresentationData(); // Call new function
                        contentHTML = praesentationTab.render(presentationData.view, presentationData, presentationData.selectedStudyId, presentationData.kollektiv);
                        break;
                    case 'publikation-tab':
                        const publicationData = _mainAppInterface.getPublicationData(); // Call new function
                        contentHTML = publikationTab.render(publicationData.allKollektivStats, publicationData.commonData, publicationData.lang, publicationData.activeSectionId, publicationData.bruteForceMetric);
                        break;
                    case 'export-tab':
                        contentHTML = exportTab.render(state.getCurrentKollektiv(), bfResults);
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
                _updateStatistikCharts(allData); // Call update charts for Statistik Tab
                break;
            case 'publikation-tab':
                const scrollSpyTarget = document.querySelector(CONSTANTS.SELECTORS.PUBLIKATION_SECTIONS_NAV);
                if (scrollSpyTarget) {
                    new bootstrap.ScrollSpy(document.body, {
                        target: CONSTANTS.SELECTORS.PUBLIKATION_SECTIONS_NAV,
                        offset: parseInt(APP_CONFIG.UI_SETTINGS.STICKY_HEADER_OFFSET) + 1 // Adjust offset for sticky header
                    });
                }
                publikationTabLogic.updateDynamicChartsForPublicationTab(appState.getPublikationSection()); // Corrected: publikationTab to publikationTabLogic
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
        const state = appState.getState();
        const kollektiveToRender = state.currentStatsLayout === 'einzel' ? [state.currentKollektiv] : [state.currentStatsKollektiv1, state.currentStatsKollektiv2];
        
        kollektiveToRender.forEach((kolId, index) => {
            const data = dataManager.filterDataByKollektiv(allData, kolId);
            const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
            const appliedLogic = t2CriteriaManager.getAppliedLogic();
            const evaluatedData = t2CriteriaManager.evaluateDataset(data, appliedCriteria, appliedLogic);
            const stats = statisticsService.calculateAllStatsForPublication(evaluatedData, appliedCriteria, appliedLogic, bruteForceManager.getAllResults())[kolId];
            
            if(stats){
                charts.renderConfusionMatrix(stats.gueteAS.matrix, `matrix-AS-${index}`);
                charts.renderROCCurve(stats.gueteAS.rocData, `roc-AS-${index}`, { auc: stats.gueteAS.auc.value }); // Assuming rocData exists
                charts.renderConfusionMatrix(stats.gueteT2_angewandt.matrix, `matrix-T2-${index}`);
                charts.renderROCCurve(stats.gueteT2_angewandt.rocData, `roc-T2-${index}`, { auc: stats.gueteT2_angewandt.auc.value, color: APP_CONFIG.CHART_SETTINGS.T2_COLOR }); // Assuming rocData exists
            }
        });
    }

    function _handleTabChange(event) {
        if(event.target && event.target.id){
            // Store active tab ID
            appState.setActiveTabId(event.target.id);
            // Render content for the new tab
            _renderTab(event.target.id);
        }
    }
    
    function _handleAppEvents(event) {
        const { type, target } = event;
        
        // Global event handling (delegation)
        if(type === 'click') {
            if(target.closest('[data-kollektiv]')) { 
                generalEventHandlers.handleKollektivChange(target.closest('[data-kollektiv]').dataset.kollektiv, _mainAppInterface); 
                return; // Event handled, prevent further delegation for this click
            }
            if(target.closest('th[data-sort-key]')) { 
                generalEventHandlers.handleSortClick(target.closest('th[data-sort-key]'), target.closest('.sortable-sub-header'), _mainAppInterface); 
                return; // Event handled
            }
            if(target.closest(CONSTANTS.SELECTORS.BTN_KURANLEITUNG)) {
                generalEventHandlers.handleKurzanleitungClick();
                return;
            }
            // Add other global click handlers here
        }

        // Delegate to specific tab handlers
        const auswertungPane = target.closest(CONSTANTS.SELECTORS.AUSWERTUNG_TAB_PANE);
        const statistikPane = target.closest(CONSTANTS.SELECTORS.STATISTIK_TAB_PANE);
        const praesentationPane = target.closest(CONSTANTS.SELECTORS.PRAESENTATION_TAB_PANE);
        const publikationPane = target.closest(CONSTANTS.SELECTORS.PUBLIKATION_TAB_PANE);
        const exportPane = target.closest(CONSTANTS.SELECTORS.EXPORT_TAB_PANE);

        if(auswertungPane) auswertungEventHandlers.handle(event, _mainAppInterface);
        else if(statistikPane) statistikEventHandlers.handle(event, _mainAppInterface);
        else if(praesentationPane) praesentationEventHandlers.handle(event, _mainAppInterface);
        else if(publikationPane) publikationEventHandlers.handle(event, _mainAppInterface);
        else if(exportPane) exportEventHandlers.handle(event, _mainAppInterface);
    }
    
    function attachCollapseEventListeners(scopeSelector) {
        const parent = document.querySelector(scopeSelector);
        if (!parent) return;

        // Use event delegation for collapse events
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
        
        // Attach event listeners
        document.querySelector(CONSTANTS.SELECTORS.MAIN_TAB_NAV)?.addEventListener('shown.bs.tab', _handleTabChange); // Bootstrap's 'shown.bs.tab' is better than 'show.bs.tab'
        document.body.addEventListener('click', _handleAppEvents);
        document.body.addEventListener('change', _handleAppEvents); // For select, checkbox, radio
        document.body.addEventListener('input', _handleAppEvents); // For range slider
        
        // Set initial tab and render
        const initialTabId = appState.getActiveTabId();
        const tabEl = document.getElementById(initialTabId);
        if(tabEl) {
            new bootstrap.Tab(tabEl).show();
            // _renderTab is called by the 'shown.bs.tab' event handler, so no need to call it directly here after showing tab
        } else {
            const fallbackTabEl = document.getElementById('publikation-tab');
            new bootstrap.Tab(fallbackTabEl).show();
            // _renderTab('publikation-tab'); // Will be called by event handler
        }
        _updateHeaderUI();
        ui_helpers.showKurzanleitung(); // Show kurzanleitung modal on app start

        _isInitialized = true;
    }
    
    return Object.freeze({
        init,
        renderTab: _renderTab,
        updateHeader: _updateHeaderUI,
        attachCollapseEventListeners
    });
})();
