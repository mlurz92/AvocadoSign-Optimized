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
            _fullRawData = dataProcessor.preprocessRawData(patientData);
            _filteredRawData = dataProcessor.filterDataByKollektiv(_fullRawData, state.getCurrentKollektiv());
            _appliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
            _appliedT2Logic = t2CriteriaManager.getAppliedLogic();
            _filteredRawData = t2CriteriaManager.evaluateDataset(_filteredRawData, _appliedT2Criteria, _appliedT2Logic);
        } catch (error) {
            console.error("Fehler beim Laden und Verarbeiten der Initialdaten:", error);
            ui_helpers.showToast("Fehler beim Laden der Initialdaten. Details siehe Konsole.", "danger");
            _fullRawData = []; _filteredRawData = [];
        }
    }

    function _initializeModules() {
        state.init();
        dataProcessor.init(_fullRawData);
        t2CriteriaManager.init();
        studyT2CriteriaManager.init();
        exportService.setCurrentKollektiv(state.getCurrentKollektiv());
        _setupBruteForceCallbacks();
        if (!bruteForceManager.isWorkerAvailable()) {
            const bfInitialized = bruteForceManager.init({
                onStarted: _handleBruteForceStarted,
                onProgress: _handleBruteForceProgress,
                onResult: _handleBruteForceResult,
                onError: _handleBruteForceError,
                onCancelled: _handleBruteForceCancelled
            });
            if (!bfInitialized) {
                ui_helpers.showToast("Brute-Force Optimierungsmodul konnte nicht initialisiert werden. Worker möglicherweise nicht unterstützt.", "warning");
            }
        }
    }

    function _setupEventListeners() {
        generalEventHandlers.registerGlobalEventListeners();
        generalEventHandlers.registerHeaderEventListeners(mainAppInterface);
        generalEventHandlers.registerTabEventListeners(mainAppInterface);
        auswertungEventHandlers.registerAuswertungTabEventListeners(mainAppInterface);
        statistikEventHandlers.registerStatistikTabEventListeners(mainAppInterface);
        praesentationEventHandlers.registerPraesentationTabEventListeners(mainAppInterface);
        publikationEventHandlers.registerPublikationTabEventListeners(mainAppInterface);
    }

    function _setupBruteForceCallbacks() {
        bruteForceManager.init({
            onStarted: _handleBruteForceStarted,
            onProgress: _handleBruteForceProgress,
            onResult: _handleBruteForceResult,
            onError: _handleBruteForceError,
            onCancelled: _handleBruteForceCancelled
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
        _bruteForceResults = bruteForceManager.getAllResults(); // Update cache with all results from manager
        _isLoading = false;
        if (payload && payload.bestResult && payload.results) {
            ui_helpers.updateBruteForceUI('result', payload, true, payload.kollektiv);
            ui_helpers.showToast(`Brute-Force-Optimierung für '${getKollektivDisplayName(payload.kollektiv)}' abgeschlossen. Beste Metrik (${payload.metric}): ${formatNumber(payload.bestResult.metricValue, 4)}.`, 'success');
            mainAppInterface.refreshDataForPublikationTab(); // Ensure publication tab gets new BF results
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

    function _updateAndRenderAll(newKollektiv = null, newCriteria = null, newLogic = null) {
        _isLoading = true;
        ui_helpers.showToast("Daten werden aktualisiert...", "info", 1000);

        if (newKollektiv) state.setCurrentKollektiv(newKollektiv);
        if (newCriteria) _appliedT2Criteria = newCriteria; // Already cloned by t2Manager
        if (newLogic) _appliedT2Logic = newLogic;

        _updateFilteredDataAndStats();
        _updateAndRenderHeader();
        _updateAndRenderCurrentTab();

        _isLoading = false;
        exportService.setCurrentKollektiv(state.getCurrentKollektiv());
        ui_helpers.updateExportButtonStates(state.getActiveTabId(), !!_bruteForceResults && !!_bruteForceResults[state.getCurrentKollektiv()], _filteredRawData.length > 0);
        
        if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.refreshDataAndRender === 'function') {
            publikationTabLogic.refreshDataAndRender(_fullRawData, _appliedT2Criteria, _appliedT2Logic, _bruteForceResults);
        }
        ui_helpers.initializeTooltips(); // Re-init for any new content
    }

    function _updateFilteredDataAndStats() {
        _filteredRawData = dataProcessor.filterDataByKollektiv(_fullRawData, state.getCurrentKollektiv());
        _filteredRawData = t2CriteriaManager.evaluateDataset(_filteredRawData, _appliedT2Criteria, _appliedT2Logic);
        
        if (typeof statisticsService !== 'undefined') {
            _allStatistikData = {
                deskriptiv: statisticsService.calculateDescriptiveStats(_filteredRawData),
                gueteAS: statisticsService.calculateDiagnosticPerformance(_filteredRawData, 'as', 'n'),
                gueteT2: statisticsService.calculateDiagnosticPerformance(_filteredRawData, 't2', 'n'),
                vergleichASvsT2: statisticsService.compareDiagnosticMethods(_filteredRawData, 'as', 't2', 'n'),
                assoziationen: statisticsService.calculateAssociations(_filteredRawData, _appliedT2Criteria),
                vergleichKollektive: null, // This is calculated on demand in renderStatistikTab
                criteriaComparisonResults: studyT2CriteriaManager.getCriteriaComparisonResults(_fullRawData, state.getCurrentKollektiv(), _appliedT2Criteria, _appliedT2Logic)
            };
        } else {
            console.error("statisticsService ist nicht verfügbar. Statistiken können nicht berechnet werden.");
            _allStatistikData = null;
        }
    }

    function _updateAndRenderHeader() {
        const headerStats = {
            kollektiv: getKollektivDisplayName(state.getCurrentKollektiv()),
            anzahlPatienten: _filteredRawData.length,
            statusN: dataProcessor.getSummaryStatus(_filteredRawData, 'n'),
            statusAS: dataProcessor.getSummaryStatus(_filteredRawData, 'as'),
            statusT2: dataProcessor.getSummaryStatus(_filteredRawData, 't2')
        };
        ui_helpers.updateHeaderStatsUI(headerStats);
        ui_helpers.updateKollektivButtonsUI(state.getCurrentKollektiv());
    }

    function _updateAndRenderCurrentTab() {
        viewRenderer.renderTabContent(
            state.getActiveTabId(),
            _filteredRawData,
            _appliedT2Criteria,
            _appliedT2Logic,
            _allStatistikData,
            _bruteForceResults, // Pass all BF results
            state,
            mainAppInterface
        );
    }

    function handleKollektivChange(newKollektiv) {
        if (_isLoading) return;
        _updateAndRenderAll(newKollektiv, null, null);
    }

    function handleApplyT2Criteria(newCriteria, newLogic) {
        if (_isLoading) return;
        t2CriteriaManager.setAppliedCriteria(newCriteria, newLogic);
        _updateAndRenderAll(null, newCriteria, newLogic);
        ui_helpers.showToast("T2-Kriterien erfolgreich angewendet und gespeichert.", "success");
        ui_helpers.markCriteriaSavedIndicator(false);
        const t2Card = document.getElementById('t2-criteria-card');
        if(t2Card && t2Card._tippy && t2Card._tippy.state.isEnabled) t2Card._tippy.hide();
    }

    function handleSortTable(tableId, newSortKey, newSortDirection, newSubKey = null) {
        if (_isLoading) return;
        state.setTableSortState(tableId, newSortKey, newSortDirection, newSubKey);
        _updateAndRenderCurrentTab(); // Re-render current tab with new sort
    }

    function handleTabChange(newTabId) {
        if (_isLoading && newTabId !== state.getActiveTabId()) return; // Prevent tab change during other loads
        state.setActiveTabId(newTabId);
        _updateAndRenderAll(); // Full re-render to ensure all contexts are fresh
    }

    function handleBruteForceStart(metric) {
        if (_isLoading || bruteForceManager.isRunning()) {
            ui_helpers.showToast("Optimierung läuft bereits oder System ist beschäftigt.", "warning");
            return;
        }
        const currentKollektiv = state.getCurrentKollektiv();
        const dataForWorker = dataProcessor.filterDataByKollektiv(_fullRawData, currentKollektiv);

        if (dataForWorker.length === 0) {
             ui_helpers.showToast(`Keine Daten im Kollektiv '${getKollektivDisplayName(currentKollektiv)}' für Optimierung.`, "warning");
             return;
        }
        state.setCurrentBruteForceMetric(metric);
        // Pass a deep clone of data to worker if necessary, but worker should handle its own copy
        bruteForceManager.startAnalysis(dataForWorker, metric, currentKollektiv);
    }

    function handleExportRequest(exportType) {
         if (_isLoading) { ui_helpers.showToast("System ist beschäftigt, bitte warten Sie.", "warning"); return; }
         exportService.exportData(
            exportType,
            _fullRawData, // Export service will filter by _currentKollektiv internally if needed or use it for filename
            _appliedT2Criteria,
            _appliedT2Logic,
            _bruteForceResults, // Pass all BF results
            _allStatistikData,
            state.getCurrentKollektiv()
         );
    }

    function handleSingleChartExport(chartId, format, chartName) {
        if (_isLoading) { ui_helpers.showToast("System ist beschäftigt, bitte warten Sie.", "warning"); return; }
        const isPublicationContext = document.getElementById('publikation-tab-pane')?.classList.contains('active');
        exportService.exportSingleChart(chartId, format, chartName, isPublicationContext);
    }
    
    function handleSingleTableExport(tableId, tableName) {
        if (_isLoading) { ui_helpers.showToast("System ist beschäftigt, bitte warten Sie.", "warning"); return; }
        exportService.exportTableAsPng(tableId, tableName);
    }

    function initApp() {
        _initializeModules();
        _loadInitialData();
        _setupEventListeners();
        viewRenderer.renderInitialLayout();
        _updateAndRenderAll(); // Initial full render

        const firstStartKey = APP_CONFIG.STORAGE_KEYS.FIRST_APP_START;
        const versionMarkForTutorial = `shown_for_${APP_CONFIG.APP_VERSION}`;
        if (localStorage.getItem(firstStartKey) !== versionMarkForTutorial) {
            ui_helpers.showKurzanleitung();
            localStorage.setItem(firstStartKey, versionMarkForTutorial);
        }
         ui_helpers.updateExportButtonStates(state.getActiveTabId(), false, _filteredRawData.length > 0); // BF results initially false
    }

    return {
        initApp,
        getFullRawData: () => _fullRawData,
        getFilteredRawData: () => _filteredRawData,
        getAppliedT2Criteria: () => _appliedT2Criteria,
        getAppliedT2Logic: () => _appliedT2Logic,
        getAllStatistikData: () => _allStatistikData,
        getBruteForceResults: () => _bruteForceResults,
        isLoading: () => _isLoading,
        handleKollektivChange,
        handleApplyT2Criteria,
        handleSortTable,
        handleTabChange,
        handleBruteForceStart,
        handleExportRequest,
        handleSingleChartExport,
        handleSingleTableExport,
        refreshCurrentTab: _updateAndRenderCurrentTab,
        refreshAll: _updateAndRenderAll,
        refreshDataForPublikationTab: () => { // Specifically for BF results update
            if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.refreshDataAndRender === 'function') {
                 _bruteForceResults = bruteForceManager.getAllResults(); // ensure manager results are fetched
                 publikationTabLogic.refreshDataAndRender(_fullRawData, _appliedT2Criteria, _appliedT2Logic, _bruteForceResults);
            }
        }
    };
})();

document.addEventListener('DOMContentLoaded', mainAppInterface.initApp);
