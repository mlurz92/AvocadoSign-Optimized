const appController = (() => {
    let processedData = [];
    let currentData = [];
    let rawData = [];

    function _filterAndPrepareData() {
        try {
            const currentKollektiv = state.getCurrentKollektiv();
            const filteredByKollektiv = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv);
            const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
            const appliedLogic = t2CriteriaManager.getAppliedLogic();
            const evaluatedData = t2CriteriaManager.evaluateDataset(filteredByKollektiv, appliedCriteria, appliedLogic);

            let sortState;
            const activeTabId = state.getActiveTabId();
            if (activeTabId === 'daten-tab') {
                sortState = state.getDatenTableSort();
            } else if (activeTabId === 'auswertung-tab') {
                sortState = state.getAuswertungTableSort();
            }

            if (sortState && sortState.key) {
                evaluatedData.sort(utils.getSortFunction(sortState.key, sortState.direction, sortState.subKey));
            }
            currentData = evaluatedData;
        } catch (error) {
            currentData = [];
        }
    }

    function _updateUIState() {
        ui_helpers.updateKollektivButtonsUI(state.getCurrentKollektiv());
        ui_helpers.updateStatistikSelectorsUI(state.getCurrentStatsLayout(), state.getCurrentStatsKollektiv1(), state.getCurrentStatsKollektiv2());
        ui_helpers.updatePresentationViewSelectorUI(state.getCurrentPresentationView());
        ui_helpers.updatePublikationUI(state.getCurrentPublikationLang(), state.getCurrentPublikationSection(), state.getCurrentPublikationBruteForceMetric());
        
        const bfResults = bruteForceManager.getAllResults();
        const hasBfResults = bfResults && Object.keys(bfResults).length > 0;
        const canExport = processedData && processedData.length > 0;
        ui_helpers.updateExportButtonStates(state.getActiveTabId(), hasBfResults, canExport);
    }
    
    function refreshCurrentTab() {
        _filterAndPrepareData();
        _updateUIState();
        viewRenderer.renderCurrentTab();
    }

    function _handleGlobalKollektivChange(newKollektiv, source = "user") {
        if (state.setCurrentKollektiv(newKollektiv)) {
            refreshCurrentTab();
            if (source === "user") {
                ui_helpers.showToast(`Kollektiv '${utils.getKollektivDisplayName(newKollektiv)}' ausgewählt.`, 'info');
            } else if (source === "auto_praesentation") {
                ui_helpers.showToast(`Globales Kollektiv automatisch auf '${utils.getKollektivDisplayName(newKollektiv)}' gesetzt.`, 'info', 4000);
            }
            return true;
        }
        return false;
    }

    function _processTabChange(tabId) {
        if (state.setActiveTabId(tabId)) {
            refreshCurrentTab();
        }
    }

    function _handleSortRequest(tableContext, key, subKey = null) {
        let sortStateUpdated = false;
        if (tableContext === 'daten') {
            sortStateUpdated = state.updateDatenTableSortDirection(key, subKey);
        } else if (tableContext === 'auswertung') {
            sortStateUpdated = state.updateAuswertungTableSortDirection(key, subKey);
        }
        if (sortStateUpdated) {
            refreshCurrentTab();
        }
    }

    function _applyAndRefreshAll() {
        t2CriteriaManager.applyCriteria();
        refreshCurrentTab();
        ui_helpers.markCriteriaSavedIndicator(false);
    }
    
    function _startBruteForceAnalysis(metric) {
        const currentKollektiv = state.getCurrentKollektiv();
        const dataForWorker = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv).map(p => ({
            nr: p.nr,
            n: p.n,
            lymphknoten_t2: utils.cloneDeep(p.lymphknoten_t2)
        }));

        if (dataForWorker.length === 0) {
            ui_helpers.showToast("Keine Daten für Optimierung im aktuellen Kollektiv.", "warning");
            return;
        }
        ui_helpers.updateBruteForceUI('start', { metric, kollektiv: currentKollektiv }, true, currentKollektiv);
        bruteForceManager.startAnalysis(dataForWorker, metric, currentKollektiv);
    }

    function _initializeBruteForceManager() {
        const bfCallbacks = {
            onStarted: (payload) => ui_helpers.updateBruteForceUI('started', payload, true, payload.kollektiv),
            onProgress: (payload) => ui_helpers.updateBruteForceUI('progress', payload, true, payload.kollektiv),
            onResult: (payload) => {
                ui_helpers.updateBruteForceUI('result', payload, true, payload.kollektiv);
                publicationController.initialize(rawData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), bruteForceManager.getAllResults());
                if (state.getActiveTabId() === 'publikation-tab') {
                    refreshCurrentTab();
                }
            },
            onCancelled: (payload) => ui_helpers.updateBruteForceUI('cancelled', {}, true, payload.kollektiv),
            onError: (payload) => ui_helpers.updateBruteForceUI('error', payload, false, payload.kollektiv)
        };
        bruteForceManager.init(bfCallbacks);
    }
    
    function _setupEventListeners() {
        const appContainer = document.getElementById('app-container');
        if(!appContainer) return;
        
        appContainer.addEventListener('click', (event) => {
            const target = event.target;
            const button = target.closest('button');

            if(button?.dataset.kollektiv) { generalEventHandlers.handleKollektivChange(button.dataset.kollektiv, this); }
            else if(target.closest('th[data-sort-key]')) { generalEventHandlers.handleSortClick(target.closest('th[data-sort-key]'), target.closest('.sortable-sub-header'), this); }
            else if(button?.id === 'btn-apply-criteria') { auswertungEventHandlers.handleApplyCriteria(this); }
            else if(button?.id === 'btn-start-brute-force') { auswertungEventHandlers.handleStartBruteForce(this); }
        });
        
        document.getElementById('mainTab')?.addEventListener('shown.bs.tab', (event) => generalEventHandlers.handleTabShownEvent(event, this));
    }

    function init(patientData) {
        rawData = patientData;
        state.init();
        t2CriteriaManager.initialize();
        processedData = dataProcessor.processPatientData(rawData);
        _initializeBruteForceManager();
        
        publicationController.initialize(rawData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), bruteForceManager.getAllResults());

        _filterAndPrepareData();
        _updateUIState();
        _setupEventListeners();

        const initialTabId = state.getActiveTabId();
        const tabElement = document.getElementById(initialTabId);
        if (tabElement) {
            const tab = new bootstrap.Tab(tabElement);
            tab.show();
        }
        refreshCurrentTab();
        ui_helpers.showKurzanleitung();
    }

    return {
        init,
        refreshCurrentTab,
        handleGlobalKollektivChange: _handleGlobalKollektivChange,
        processTabChange: _processTabChange,
        handleSortRequest: _handleSortRequest,
        applyAndRefreshAll: _applyAndRefreshAll,
        startBruteForceAnalysis: _startBruteForceAnalysis,
        getProcessedData: () => processedData,
        getRawData: () => rawData
    };
})();
