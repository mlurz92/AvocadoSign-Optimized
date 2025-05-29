const mainApp = (() => {
    let localRawData = [];
    let currentProcessedData = [];
    let currentKollektivData = [];
    let currentAppliedT2Criteria = null;
    let currentAppliedT2Logic = null;
    let bruteForceResultsPerKollektiv = {}; // Store results from BF worker

    const tabUpdateFunctions = {
        'daten': () => { if (typeof dataTabLogic !== 'undefined') dataTabLogic.updateDynamicContent(currentKollektivData); },
        'auswertung': () => { if (typeof auswertungTabLogic !== 'undefined') auswertungTabLogic.updateDynamicContent(currentKollektivData); },
        'statistik': () => { if (typeof statistikTabLogic !== 'undefined') statistikTabLogic.updateDynamicContent(currentKollektivData, localRawData, currentAppliedT2Criteria, currentAppliedT2Logic); },
        'praesentation': () => { if (typeof praesentationTabLogic !== 'undefined') praesentationTabLogic.updateDynamicContent(currentKollektivData, localRawData, currentAppliedT2Criteria, currentAppliedT2Logic, bruteForceResultsPerKollektiv); },
        'publikation': () => {
            if (typeof publikationTabLogic !== 'undefined') {
                // Main content is rendered via viewRenderer calling getRenderedSectionContent
                // Dynamic tables and charts are updated after DOM is ready
                setTimeout(() => {
                    publikationTabLogic.updateDynamicChartsAndTablesForPublicationTab(
                        state.getCurrentPublikationSection(),
                        state.getCurrentPublikationLang(),
                        state.getCurrentKollektiv()
                    );
                }, 100); // Short delay to ensure DOM is ready
            }
        },
        'export': () => { /* Export tab has mostly static buttons, data passed on demand */ }
    };

    function _loadAndProcessInitialData() {
        if (typeof PATIENT_DATA === 'undefined' || !Array.isArray(PATIENT_DATA)) {
            console.error("PATIENT_DATA nicht gefunden oder ungültig. App kann nicht initialisiert werden.");
            ui_helpers.showToast("Kritischer Fehler: Patientendaten konnten nicht geladen werden!", "danger", 0);
            document.getElementById('app-loading-indicator').innerHTML = '<p class="text-danger">Fehler beim Laden der Patientendaten. Die Anwendung kann nicht gestartet werden.</p>';
            return false;
        }
        localRawData = cloneDeep(PATIENT_DATA);
        currentProcessedData = dataProcessor.processRawData(localRawData);

        currentAppliedT2Criteria = state.getAppliedT2Criteria();
        currentAppliedT2Logic = state.getAppliedT2Logic();
        currentProcessedData = t2CriteriaManager.evaluateDataset(currentProcessedData, currentAppliedT2Criteria, currentAppliedT2Logic);

        _updateApplicationForKollektivChange(state.getCurrentKollektiv(), true); // Initial load
        return true;
    }

    function _updateApplicationForKollektivChange(newKollektiv, isInitialLoad = false) {
        currentKollektivData = dataProcessor.filterDataByKollektiv(currentProcessedData, newKollektiv);

        // Initialize tab logics with potentially new data context
        if (typeof dataTabLogic !== 'undefined' && typeof dataTabLogic.initializeData === 'function') dataTabLogic.initializeData(currentKollektivData);
        if (typeof auswertungTabLogic !== 'undefined' && typeof auswertungTabLogic.initializeData === 'function') auswertungTabLogic.initializeData(currentKollektivData, currentAppliedT2Criteria, currentAppliedT2Logic);
        if (typeof statistikTabLogic !== 'undefined' && typeof statistikTabLogic.initializeData === 'function') statistikTabLogic.initializeData(currentKollektivData, localRawData, currentAppliedT2Criteria, currentAppliedT2Logic);
        if (typeof praesentationTabLogic !== 'undefined' && typeof praesentationTabLogic.initializeData === 'function') praesentationTabLogic.initializeData(currentKollektivData, localRawData, currentAppliedT2Criteria, currentAppliedT2Logic, bruteForceResultsPerKollektiv);
        if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.initializeData === 'function') {
             publikationTabLogic.initializeData(localRawData, currentAppliedT2Criteria, currentAppliedT2Logic, bruteForceResultsPerKollektiv);
        }


        if (isInitialLoad) {
            viewRenderer.renderAllTabs(currentKollektivData, localRawData, currentAppliedT2Criteria, currentAppliedT2Logic, bruteForceResultsPerKollektiv, newKollektiv);
        } else {
            const activeTabId = state.getCurrentActiveTab() || 'daten'; // default if not found
            viewRenderer.renderSpecificTab(activeTabId, currentKollektivData, localRawData, currentAppliedT2Criteria, currentAppliedT2Logic, bruteForceResultsPerKollektiv, newKollektiv);
            if (tabUpdateFunctions[activeTabId]) {
                tabUpdateFunctions[activeTabId]();
            }
        }
        ui_helpers.updateHeaderStats(currentKollektivData, newKollektiv);
    }

    function _handleKollektivChange(newKollektiv) {
        if (state.getCurrentKollektiv() !== newKollektiv) {
            state.setCurrentKollektiv(newKollektiv);
            _updateApplicationForKollektivChange(newKollektiv);
            ui_helpers.showToast(`Kollektiv auf '${getKollektivDisplayName(newKollektiv)}' geändert.`, 'info', 2000);
        }
    }

    function _handleTabChange(tabId) {
        const currentActiveTab = state.getCurrentActiveTab();
        if (currentActiveTab !== tabId) {
            state.setCurrentActiveTab(tabId);
            viewRenderer.renderSpecificTab(tabId, currentKollektivData, localRawData, currentAppliedT2Criteria, currentAppliedT2Logic, bruteForceResultsPerKollektiv, state.getCurrentKollektiv());
            if (tabUpdateFunctions[tabId]) {
                tabUpdateFunctions[tabId]();
            }
        } else if (tabId === 'publikation') { // Re-render dynamics even if tab is already active, e.g., after lang switch
             if (tabUpdateFunctions[tabId]) {
                tabUpdateFunctions[tabId]();
            }
        }
    }

    function _handleGlobalAction(action, payload) {
        switch (action) {
            case 'applyT2Criteria':
                currentAppliedT2Criteria = payload.criteria;
                currentAppliedT2Logic = payload.logic;
                state.setAppliedT2Criteria(currentAppliedT2Criteria);
                state.setAppliedT2Logic(currentAppliedT2Logic);
                currentProcessedData = t2CriteriaManager.evaluateDataset(cloneDeep(localRawData), currentAppliedT2Criteria, currentAppliedT2Logic); // Re-evaluate all
                _updateApplicationForKollektivChange(state.getCurrentKollektiv()); // This will re-render the active tab
                ui_helpers.showToast("T2-Kriterien angewendet und gespeichert.", "success");
                break;
            case 'bruteForceStarted':
                if (typeof auswertungTabLogic !== 'undefined' && typeof auswertungTabLogic.handleBruteForceUpdate === 'function') {
                    auswertungTabLogic.handleBruteForceUpdate({ status: 'started', kollektiv: payload.kollektiv, totalCombinations: payload.totalCombinations });
                }
                break;
            case 'bruteForceProgress':
                 if (typeof auswertungTabLogic !== 'undefined' && typeof auswertungTabLogic.handleBruteForceUpdate === 'function') {
                    auswertungTabLogic.handleBruteForceUpdate({ status: 'progress', ...payload });
                 }
                break;
            case 'bruteForceCompleted':
                bruteForceResultsPerKollektiv[payload.results.kollektiv] = payload.results; // Store results
                if (typeof auswertungTabLogic !== 'undefined' && typeof auswertungTabLogic.handleBruteForceUpdate === 'function') {
                    auswertungTabLogic.handleBruteForceUpdate({ status: 'completed', results: payload.results });
                }
                 ui_helpers.showToast(`Brute-Force Optimierung für Kollektiv '${getKollektivDisplayName(payload.results.kollektiv)}' abgeschlossen.`, "success");
                break;
            case 'bruteForceCancelled':
                if (typeof auswertungTabLogic !== 'undefined' && typeof auswertungTabLogic.handleBruteForceUpdate === 'function') {
                    auswertungTabLogic.handleBruteForceUpdate({ status: 'cancelled' });
                }
                ui_helpers.showToast("Brute-Force Optimierung abgebrochen.", "warning");
                break;
            case 'bruteForceError':
                if (typeof auswertungTabLogic !== 'undefined' && typeof auswertungTabLogic.handleBruteForceUpdate === 'function') {
                    auswertungTabLogic.handleBruteForceUpdate({ status: 'error', message: payload.message });
                }
                ui_helpers.showToast(`Fehler bei Brute-Force Optimierung: ${payload.message}`, "danger");
                break;
            case 'resetState':
                state.resetStateToDefaults();
                currentAppliedT2Criteria = state.getAppliedT2Criteria();
                currentAppliedT2Logic = state.getAppliedT2Logic();
                currentProcessedData = t2CriteriaManager.evaluateDataset(cloneDeep(localRawData), currentAppliedT2Criteria, currentAppliedT2Logic);
                _updateApplicationForKollektivChange(state.getCurrentKollektiv(), true); // Re-render all with defaults
                viewRenderer.setActiveTab(state.getCurrentActiveTab() || 'daten');
                ui_helpers.showToast("Alle Einstellungen auf Standardwerte zurückgesetzt.", "success");
                break;
             case 'updatePublikationTab': // Triggered by lang or BF metric change
                _handleTabChange('publikation'); // This will re-render and call updateDynamic...
                break;
             case 'handleChartColorSchemeChange':
                 state.setCurrentChartColorScheme(payload.scheme);
                 ui_helpers.applyChartColorScheme(payload.scheme);
                 _updateApplicationForKollektivChange(state.getCurrentKollektiv()); // Re-render to apply new colors to charts
                 ui_helpers.showToast(`Farbschema auf '${payload.scheme === 'default' ? 'Standard' : 'Alternativ'}' geändert.`, 'info');
                 break;
            default:
                console.warn("Unbekannte globale Aktion:", action, payload);
        }
    }

    function initBruteForceWorker() {
        if (typeof bruteForceManager !== 'undefined' && typeof bruteForceManager.initializeWorker === 'function') {
            bruteForceManager.initializeWorker(
                APP_CONFIG.PATHS.BRUTE_FORCE_WORKER,
                (progressData) => _handleGlobalAction('bruteForceProgress', progressData),
                (results) => _handleGlobalAction('bruteForceCompleted', { results }),
                (errorMsg) => _handleGlobalAction('bruteForceError', { message: errorMsg }),
                () => _handleGlobalAction('bruteForceCancelled', {})
            );
            return true;
        }
        console.warn("BruteForceManager nicht verfügbar, Worker kann nicht initialisiert werden.");
        _handleGlobalAction('bruteForceError', { message: "Worker-Manager nicht geladen." });
        return false;
    }

    function initializeApplication() {
        ui_helpers.setupMoreTabsDropdown();
        const isFirstStart = state.loadStateFromLocalStorage();

        try {
            ui_helpers.initializeTooltips(document.body); // Global init
            const dataLoadedSuccessfully = _loadAndProcessInitialData();
            if (!dataLoadedSuccessfully) return; // Stop if data loading failed

            initBruteForceWorker();

            if (typeof generalEventHandlers !== 'undefined') generalEventHandlers.setupGlobalEventListeners(_handleKollektivChange, _handleTabChange, _handleGlobalAction);
            if (typeof auswertungEventHandlers !== 'undefined') auswertungEventHandlers.setupAuswertungEventListeners(_handleGlobalAction);
            if (typeof statistikEventHandlers !== 'undefined') statistikEventHandlers.setupStatistikEventListeners(_handleGlobalAction);
            if (typeof praesentationEventHandlers !== 'undefined') praesentationEventHandlers.setupPraesentationEventListeners(_handleGlobalAction);
            if (typeof publikationEventHandlers !== 'undefined') publikationEventHandlers.setupPublikationEventListeners(_handleGlobalAction);
            // Data tab event listeners might be handled by general or specific if complex interactions are added.

            const initialTabId = state.getCurrentActiveTab() || 'daten';
            viewRenderer.setActiveTab(initialTabId);
            if (tabUpdateFunctions[initialTabId]) { // Ensure initial tab content is also fully updated
                tabUpdateFunctions[initialTabId]();
            }
            ui_helpers.applyChartColorScheme(state.getCurrentChartColorScheme());


            if (isFirstStart) {
                setTimeout(() => {
                    const kurzanleitungModal = new bootstrap.Modal(document.getElementById('kurzanleitung-modal'));
                    kurzanleitungModal.show();
                    state.setFirstAppStart(false);
                }, 1000);
            }
            ui_helpers.hideLoadingIndicator();

        } catch (error) {
            console.error("Fehler während der Anwendungsinitialisierung:", error);
            ui_helpers.showToast("Ein kritischer Fehler ist während des Starts aufgetreten. Bitte laden Sie die Seite neu.", "danger", 0);
            document.getElementById('app-loading-indicator').innerHTML = `<p class="text-danger display-6">Initialisierungsfehler. <br><small class="text-muted">${error.message}</small></p>`;
        }
    }

    document.addEventListener("DOMContentLoaded", initializeApplication);

    return {
        // Expose specific methods if needed by other modules, e.g., for testing or very specific callbacks.
        // Generally, interactions should flow via events and _handleGlobalAction or state changes.
        getCurrentKollektivData: () => currentKollektivData,
        getLocalRawData: () => localRawData,
        getAppliedT2Criteria: () => currentAppliedT2Criteria,
        getAppliedT2Logic: () => currentAppliedT2Logic,
        getBruteForceResults: () => bruteForceResultsPerKollektiv,
        forceUiUpdateForKollektiv: _updateApplicationForKollektivChange // For explicit refresh from external if needed
    };

})();
