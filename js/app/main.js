const mainAppInterface = (() => {
    let _isLoading = false;
    let _fullRawData = [];
    let _filteredRawData = [];
    let _appliedT2Criteria = null;
    let _appliedT2Logic = null;
    let _bruteForceResults = null;
    let _allStatistikData = null;

    function _loadInitialData() {
        try {
            _fullRawData = dataProcessor.preprocessRawData(patientDataRaw);
            _appliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
            _appliedT2Logic = t2CriteriaManager.getAppliedLogic();
            _filteredRawData = dataProcessor.filterDataByKollektiv(_fullRawData, state.getCurrentKollektiv());
            _filteredRawData = t2CriteriaManager.evaluateDataset(_filteredRawData, _appliedT2Criteria, _appliedT2Logic);
        } catch (error) {
            console.error("Fehler beim Laden und Verarbeiten der Initialdaten:", error);
            ui_helpers.showToast("Fehler beim Laden der Initialdaten. Details siehe Konsole.", "danger");
            _fullRawData = []; 
            _filteredRawData = [];
        }
    }

    function _initializeModules() {
        state.init();
        t2CriteriaManager.initialize();
        exportService.setCurrentKollektiv(state.getCurrentKollektiv());
        
        const bfInitialized = bruteForceManager.init({
            onStarted: _handleBruteForceStarted,
            onProgress: _handleBruteForceProgress,
            onResult: _handleBruteForceResult,
            onError: _handleBruteForceError,
            onCancelled: _handleBruteForceCancelled
        });
        if (!bfInitialized && !bruteForceManager.isWorkerAvailable()) {
            ui_helpers.showToast("Brute-Force Optimierungsmodul konnte nicht initialisiert werden. Worker möglicherweise nicht unterstützt.", "warning");
        }
        dataProcessor.init(_fullRawData);
    }

    function _setupEventListeners() {
        const kollektivButtons = document.querySelectorAll('.kollektiv-btn');
        kollektivButtons.forEach(button => {
            button.addEventListener('click', () => generalEventHandlers.handleKollektivChange(button.dataset.kollektiv, mainAppInterface));
        });

        const tabButtons = document.querySelectorAll('#main-tabs .nav-link');
        tabButtons.forEach(button => {
            button.addEventListener('shown.bs.tab', (event) => generalEventHandlers.handleTabShownEvent(event, mainAppInterface));
        });
        
        const kurzanleitungButton = document.getElementById('btn-show-kurzanleitung');
        if (kurzanleitungButton) {
            kurzanleitungButton.addEventListener('click', generalEventHandlers.handleKurzanleitungClick);
        }
        
        const modalExportBruteForceButton = document.getElementById('export-bruteforce-modal-txt');
        if (modalExportBruteForceButton) {
            modalExportBruteForceButton.addEventListener('click', generalEventHandlers.handleModalExportBruteForceClick);
        }

        document.body.addEventListener('click', function(event) {
            const target = event.target.closest('button, input[type="radio"], th[data-sort-key], .sortable-sub-header, .praes-view-btn, .publikation-section-link');
            if (!target) return;

            if (target.matches('.chart-download-btn')) generalEventHandlers.handleSingleChartDownload(target);
            if (target.matches('.table-download-png-btn')) generalEventHandlers.handleSingleTableDownload(target);
            if (target.id === 'daten-toggle-details') generalEventHandlers.handleToggleAllDetailsClick('daten-toggle-details', 'daten-table-body');
            if (target.id === 'auswertung-toggle-details') generalEventHandlers.handleToggleAllDetailsClick('auswertung-toggle-details', 'auswertung-table-body');
            
            if (target.closest('#t2-criteria-card')) {
                if (target.matches('.criteria-checkbox')) auswertungEventHandlers.handleT2CheckboxChange(target);
                else if (target.id === 't2-logic-switch') auswertungEventHandlers.handleT2LogicChange(target);
                else if (target.matches('.t2-criteria-button')) auswertungEventHandlers.handleT2CriteriaButtonClick(target);
                else if (target.id === 'btn-reset-criteria') auswertungEventHandlers.handleResetCriteria();
                else if (target.id === 'btn-apply-criteria') auswertungEventHandlers.handleApplyCriteria(mainAppInterface);
            }
            if (target.closest('#brute-force-card-container') || target.closest('#brute-force-result-container')) {
                if (target.id === 'btn-start-brute-force') auswertungEventHandlers.handleStartBruteForce(mainAppInterface);
                else if (target.id === 'btn-cancel-brute-force') auswertungEventHandlers.handleCancelBruteForce();
                else if (target.id === 'btn-apply-best-bf-criteria') auswertungEventHandlers.handleApplyBestBfCriteria(mainAppInterface);
            }
            if (target.closest('#statistik-tab-pane')) {
                if (target.id === 'statistik-toggle-vergleich') statistikEventHandlers.handleStatsLayoutToggle(target, mainAppInterface);
            }
             if (target.closest('#praesentation-tab-pane')) {
                if (target.matches('.praes-view-btn')) {
                    const radioInput = document.getElementById(target.getAttribute('for'));
                    if (radioInput) praesentationEventHandlers.handlePresentationViewChange(radioInput.value, mainAppInterface);
                }
            }
            if (target.closest('#publikation-tab-pane')) {
                if (target.matches('.publikation-section-link')) publikationEventHandlers.handlePublikationSectionChange(target.dataset.sectionId, mainAppInterface);
            }
            if(target.matches('th[data-sort-key]:not([data-sub-keys])')) generalEventHandlers.handleSortClick(target, null, mainAppInterface);
            if(target.matches('.sortable-sub-header')) generalEventHandlers.handleSortClick(target.closest('th[data-sort-key]'), target, mainAppInterface);
        });

        document.body.addEventListener('change', function(event) {
            const target = event.target;
            if (!target) return;
            if (target.id === 'input-size') auswertungEventHandlers.handleT2SizeInputChange(target.value);
            if (target.id === 'range-size') auswertungEventHandlers.handleT2SizeRangeChange(target.value);
            if (target.id === 'brute-force-metric') auswertungEventHandlers.handleBruteForceMetricChange(target);
            if (target.id === 'statistik-kollektiv-select-1' || target.id === 'statistik-kollektiv-select-2') statistikEventHandlers.handleStatistikKollektivChange(target, mainAppInterface);
            if (target.id === 'praes-study-select') praesentationEventHandlers.handlePresentationStudySelectChange(target.value, mainAppInterface);
            if (target.id === 'publikation-sprache-switch') publikationEventHandlers.handlePublikationSpracheChange(target, mainAppInterface);
            if (target.id === 'publikation-bf-metric-select') publikationEventHandlers.handlePublikationBfMetricChange(target, mainAppInterface);
        });
        
        document.body.addEventListener('click', function(event) {
            if (event.target.closest('#export-tab-pane') && event.target.matches('button[id^="export-"]')) {
                mainAppInterface.handleExportRequest(event.target.id.replace('export-', ''));
            }
            if (event.target.closest('#praesentation-tab-pane') && event.target.matches('button[id^="download-"]')) {
                praesentationEventHandlers.handlePresentationDownloadClick(event.target, mainAppInterface);
            }
        });
    }

    function _handleBruteForceStarted(payload) {
        _isLoading = true;
        ui_helpers.updateBruteForceUI('started', payload, bruteForceManager.isWorkerAvailable(), state.getCurrentKollektiv());
        ui_helpers.showToast(`Brute-Force-Optimierung für Kollektiv '${getKollektivDisplayName(payload.kollektiv)}' gestartet (${formatNumber(payload.totalCombinations,0)} Kombinationen).`, 'info', 8000);
    }

    function _handleBruteForceProgress(payload) {
        ui_helpers.updateBruteForceUI('progress', payload, true, payload.kollektiv);
    }

    function _handleBruteForceResult(payload) {
        _bruteForceResults = bruteForceManager.getAllResults();
        _isLoading = false;
        if (payload && payload.bestResult && payload.results) {
            ui_helpers.updateBruteForceUI('result', payload, true, payload.kollektiv);
            ui_helpers.showToast(`Brute-Force-Optimierung für '${getKollektivDisplayName(payload.kollektiv)}' abgeschlossen. Beste Metrik (${payload.metric}): ${formatNumber(payload.bestResult.metricValue, 4)}.`, 'success');
            
            if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.refreshDataAndRender === 'function') {
                 publikationTabLogic.refreshDataAndRender(_fullRawData, _appliedT2Criteria, _appliedT2Logic, _bruteForceResults);
            }
            document.dispatchEvent(new CustomEvent('bruteForceRunCompleted', { detail: { kollektiv: payload.kollektiv } }));
        } else {
            ui_helpers.updateBruteForceUI('error', { message: "Kein valides Ergebnis." }, true, payload?.kollektiv);
            ui_helpers.showToast(`Optimierung für '${getKollektivDisplayName(payload?.kollektiv)}' beendet, aber kein valides Ergebnis gefunden.`, 'warning');
        }
        ui_helpers.updateExportButtonStates(state.getActiveTabId(), !!_bruteForceResults && !!_bruteForceResults[state.getCurrentKollektiv()], _filteredRawData.length > 0);
    }

    function _handleBruteForceError(payload) {
        _isLoading = false;
        ui_helpers.updateBruteForceUI('error', payload, bruteForceManager.isWorkerAvailable(), payload?.kollektiv || state.getCurrentKollektiv());
        ui_helpers.showToast(`Fehler bei Brute-Force-Optimierung: ${payload?.message || 'Unbekannter Fehler.'}`, 'danger');
        ui_helpers.updateExportButtonStates(state.getActiveTabId(), !!_bruteForceResults && !!_bruteForceResults[state.getCurrentKollektiv()], _filteredRawData.length > 0);
    }

    function _handleBruteForceCancelled(payload) {
        _isLoading = false;
        ui_helpers.updateBruteForceUI('cancelled', payload, true, payload?.kollektiv);
        ui_helpers.showToast(`Brute-Force-Optimierung für '${getKollektivDisplayName(payload?.kollektiv)}' abgebrochen.`, 'info');
        ui_helpers.updateExportButtonStates(state.getActiveTabId(), !!_bruteForceResults && !!_bruteForceResults[state.getCurrentKollektiv()], _filteredRawData.length > 0);
    }

    function _updateAndRenderAll(forceFullRecalculation = false) {
        if (_isLoading && !forceFullRecalculation) return;

        _isLoading = true;
        _appliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
        _appliedT2Logic = t2CriteriaManager.getAppliedLogic();
        _updateFilteredDataAndStats();
        _updateAndRenderHeader();
        _updateAndRenderCurrentTab();

        _isLoading = false;
        exportService.setCurrentKollektiv(state.getCurrentKollektiv());
        _bruteForceResults = bruteForceManager.getAllResults();
        ui_helpers.updateExportButtonStates(state.getActiveTabId(), !!_bruteForceResults && !!_bruteForceResults[state.getCurrentKollektiv()], _filteredRawData.length > 0);
        
        if (state.getActiveTabId() === 'publikation-tab' && typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.refreshDataAndRender === 'function') {
             publikationTabLogic.refreshDataAndRender(_fullRawData, _appliedT2Criteria, _appliedT2Logic, _bruteForceResults);
        }
        ui_helpers.initializeTooltips();
    }

    function _updateFilteredDataAndStats() {
        _filteredRawData = dataProcessor.filterDataByKollektiv(_fullRawData, state.getCurrentKollektiv());
        _filteredRawData = t2CriteriaManager.evaluateDataset(_filteredRawData, _appliedT2Criteria, _appliedT2Logic);
        
        if (typeof statisticsService !== 'undefined') {
             _allStatistikData = {
                deskriptivGlobal: statisticsService.calculateDescriptiveStats(_filteredRawData),
                gueteASGlobal: statisticsService.calculateDiagnosticPerformance(_filteredRawData, 'as', 'n'),
                gueteT2Global: statisticsService.calculateDiagnosticPerformance(_filteredRawData, 't2', 'n'),
                vergleichASvsT2Global: statisticsService.compareDiagnosticMethods(_filteredRawData, 'as', 't2', 'n'),
                assoziationenGlobal: statisticsService.calculateAssociations(_filteredRawData, _appliedT2Criteria)
            };
        } else {
            console.error("statisticsService ist nicht verfügbar. Statistiken können nicht berechnet werden.");
            _allStatistikData = { deskriptivGlobal: null, gueteASGlobal: null, gueteT2Global: null, vergleichASvsT2Global: null, assoziationenGlobal: null };
        }
    }

    function _updateAndRenderHeader() {
        const headerStats = dataProcessor.calculateHeaderStats(_filteredRawData, state.getCurrentKollektiv());
        ui_helpers.updateHeaderStatsUI(headerStats);
        ui_helpers.updateKollektivButtonsUI(state.getCurrentKollektiv());
    }
    
    function _updateAndRenderCurrentTab(forceRecalculateStats = false) {
        const activeTabId = state.getActiveTabId();
        
        if (forceRecalculateStats || !_allStatistikData) {
            _updateFilteredDataAndStats();
        }
        _bruteForceResults = bruteForceManager.getAllResults();

        switch (activeTabId) {
            case 'daten-tab':
                viewRenderer.renderDatenTab(_filteredRawData, state.getDatenTableSort());
                break;
            case 'auswertung-tab':
                viewRenderer.renderAuswertungTab(_filteredRawData, _appliedT2Criteria, _appliedT2Logic, state.getAuswertungTableSort(), state.getCurrentKollektiv(), bruteForceManager.isWorkerAvailable());
                break;
            case 'statistik-tab':
                viewRenderer.renderStatistikTab(
                    _fullRawData, 
                    _appliedT2Criteria, 
                    _appliedT2Logic, 
                    state.getCurrentStatsLayout(), 
                    state.getCurrentStatsKollektiv1(), 
                    state.getCurrentStatsKollektiv2(),
                    state.getCurrentKollektiv()
                );
                break;
            case 'praesentation-tab':
                 viewRenderer.renderPresentationTab(
                    state.getCurrentPresentationView(),
                    state.getCurrentPresentationStudyId(),
                    state.getCurrentKollektiv(),
                    _fullRawData,
                    _appliedT2Criteria,
                    _appliedT2Logic
                 );
                break;
            case 'publikation-tab':
                viewRenderer.renderPublikationTab(
                    state.getCurrentPublikationLang(),
                    state.getCurrentPublikationSection(),
                    state.getCurrentKollektiv(),
                    _fullRawData,
                    _bruteForceResults
                );
                break;
            case 'export-tab':
                viewRenderer.renderExportTab(state.getCurrentKollektiv());
                break;
            default:
                console.warn("Unbekannter Tab zum Rendern:", activeTabId);
                const firstTabPane = document.querySelector('.tab-pane');
                if (firstTabPane) {
                    const fallbackTabId = firstTabPane.id.replace('-pane','');
                    if(state.setActiveTabId(fallbackTabId)){
                        _updateAndRenderCurrentTab();
                    }
                }
        }
    }
        
    function handleGlobalKollektivChange(newKollektiv, source = "user") {
        if (_isLoading) return false;
        if (state.setCurrentKollektiv(newKollektiv)) {
            _updateAndRenderAll(true);
            if (source === "user") {
                 ui_helpers.showToast(`Kollektiv auf '${getKollektivDisplayName(newKollektiv)}' geändert.`, "info");
            }
            return true;
        }
        return false;
    }

    function applyAndRefreshAll() {
        if (_isLoading) return;
        t2CriteriaManager.applyCriteria();
        _appliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
        _appliedT2Logic = t2CriteriaManager.getAppliedLogic();
        _updateAndRenderAll(true);
        ui_helpers.markCriteriaSavedIndicator(false);
    }

    function handleSortRequest(tableContext, key, subKey = null) {
        if (_isLoading) return;
        let sortChanged = false;
        if (tableContext === 'daten') {
            sortChanged = state.updateDatenTableSortDirection(key, subKey);
        } else if (tableContext === 'auswertung') {
            sortChanged = state.updateAuswertungTableSortDirection(key, subKey);
        }
        if (sortChanged) {
            _updateAndRenderCurrentTab();
        }
    }

    function processTabChange(newTabIdRaw) {
        const newTabId = newTabIdRaw.replace('-pane','');
        if (_isLoading && newTabId !== state.getActiveTabId()) {
             ui_helpers.showToast("System ist beschäftigt. Bitte warten Sie, bis der aktuelle Vorgang abgeschlossen ist.", "warning");
             const oldTabButton = document.getElementById(state.getActiveTabId());
             if (oldTabButton) {
                const newTabButtonElement = document.getElementById(newTabId);
                 if (newTabButtonElement) {
                    const newTab = bootstrap.Tab.getInstance(newTabButtonElement);
                    if(newTab) newTab.show(); // Should switch back via Bootstrap
                }
             }
            return;
        }
        if(state.setActiveTabId(newTabId)) {
             _updateAndRenderAll(true);
        }
    }
    
    function handleExportRequest(exportType) {
        if (_isLoading) { ui_helpers.showToast("System ist beschäftigt, bitte warten Sie.", "warning"); return; }
         _bruteForceResults = bruteForceManager.getAllResults(); // Ensure latest results
         exportService.exportData(
            exportType,
            _fullRawData,
            _appliedT2Criteria,
            _appliedT2Logic,
            _bruteForceResults,
            _allStatistikData,
            state.getCurrentKollektiv()
         );
    }
    
    function initApp() {
        _loadInitialData(); 
        _initializeModules();
        _setupEventListeners();
        _updateAndRenderAll(true);

        const firstStartKey = APP_CONFIG.STORAGE_KEYS.FIRST_APP_START;
        const versionMarkForTutorial = `shown_for_${APP_CONFIG.APP_VERSION}`;
        if (localStorage.getItem(firstStartKey) !== versionMarkForTutorial) {
            ui_helpers.showKurzanleitung();
            localStorage.setItem(firstStartKey, versionMarkForTutorial);
        }
        _bruteForceResults = bruteForceManager.getAllResults();
        ui_helpers.updateExportButtonStates(state.getActiveTabId(), !!_bruteForceResults && !!_bruteForceResults[state.getCurrentKollektiv()], _filteredRawData.length > 0);
        
        const appVersionDisplay = document.getElementById('app-version-display');
        if (appVersionDisplay) {
            appVersionDisplay.textContent = APP_CONFIG.APP_VERSION;
        }

        const activeTabFromStorageOrHash = location.hash.replace('#','');
        if (activeTabFromStorageOrHash) {
            const tabElement = document.getElementById(activeTabFromStorageOrHash);
            if (tabElement && bootstrap.Tab.getInstance(tabElement)) {
                 bootstrap.Tab.getInstance(tabElement).show();
                 processTabChange(activeTabFromStorageOrHash);
            } else if (tabElement) {
                 const bsTab = new bootstrap.Tab(tabElement);
                 bsTab.show();
                 processTabChange(activeTabFromStorageOrHash);
            }
        } else {
             const defaultTab = document.getElementById(state.getActiveTabId() || 'daten-tab');
             if(defaultTab) {
                 const bsTab = bootstrap.Tab.getOrCreateInstance(defaultTab);
                 if (bsTab) bsTab.show();
             }
        }
         window.addEventListener('hashchange', () => {
            const newTabIdFromHash = location.hash.replace('#','');
            if (newTabIdFromHash && newTabIdFromHash !== state.getActiveTabId()) {
                const tabElement = document.getElementById(newTabIdFromHash);
                if (tabElement) {
                     const bsTab = bootstrap.Tab.getOrCreateInstance(tabElement);
                     if (bsTab) bsTab.show(); // This will trigger 'shown.bs.tab'
                }
            }
        });
    }

    return Object.freeze({
        initApp,
        getRawData: () => _fullRawData,
        getProcessedData: () => _fullRawData,
        getFilteredData: () => _filteredRawData,
        getAppliedT2Criteria: () => _appliedT2Criteria,
        getAppliedT2Logic: () => _appliedT2Logic,
        getAllStatistikData: () => _allStatistikData,
        getBruteForceResults: () => bruteForceManager.getAllResults(),
        isLoading: () => _isLoading,
        handleGlobalKollektivChange,
        applyAndRefreshAll,
        handleSortRequest,
        processTabChange,
        handleExportRequest,
        refreshCurrentTab: () => _updateAndRenderCurrentTab(true)
    });
})();

document.addEventListener('DOMContentLoaded', mainAppInterface.initApp);
