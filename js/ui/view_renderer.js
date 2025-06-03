const viewRenderer = (() => {
    let currentData = null;
    let activeTabId = null;
    let bruteForceManagerInstance = null;
    let dataProcessed = false;

    const tabContentFunctions = {
        'daten-tab-pane': (data, options) => dataTabLogic.createDatenTableHTML(data.patientenDaten, options.sortState),
        'auswertung-tab-pane': (data, options) => {
            const t2ControlsHTML = uiComponents.createT2CriteriaControls(options.appliedCriteria, options.appliedLogic);
            const bruteForceCardHTML = uiComponents.createBruteForceCard(options.currentKollektivName, options.workerAvailable);
            const t2MetricsOverviewHTML = uiComponents.createT2MetricsOverview(options.t2Metrics, options.currentKollektiv);
            const toggleDetailsButton = `<div class="d-flex justify-content-end mb-2"><button class="btn btn-sm btn-outline-secondary" id="auswertung-toggle-details" data-action="expand">${UI_TEXTS.auswertungTab.toggleDetailsExpand}</button></div>`;
            return `<div class="row"><div class="col-lg-5 col-xl-4">${t2ControlsHTML}</div><div class="col-lg-7 col-xl-8">${bruteForceCardHTML}${t2MetricsOverviewHTML}</div></div><hr class="my-3">${toggleDetailsButton}<div id="auswertung-table-container"></div>`;
        },
        'statistik-tab-pane': (data, options) => statistikTabLogic.createStatistikTabContent(data.patientenDaten, options.currentKollektiv, options.statsLayout, options.statsKollektiv1, options.statsKollektiv2, options.selectedAppliedCriteria, options.selectedT2Logic),
        'praesentation-tab-pane': (data, options) => praesentationTabLogic.createPresentationTabContent(options.currentView, options.presentationData, options.selectedStudyId, options.currentKollektiv),
        'publikation-tab-pane': (data, options) => publikationTabLogic.getPublikationTabHTML(options.currentLang, options.currentSection, options.publicationData),
        'export-tab-pane': (data, options) => uiComponents.createExportOptions(options.currentKollektiv)
    };

    function initialize(data, bfManager) {
        currentData = data;
        bruteForceManagerInstance = bfManager;
        if (currentData && currentData.patientenDaten && Array.isArray(currentData.patientenDaten)) {
            dataProcessed = true;
        }
        activeTabId = stateManager.getActiveTabId() || 'daten-tab-pane';
        renderTabContent(activeTabId);
    }
    
    function showInitialScreen() {
        const loadingIndicator = document.getElementById('loading-indicator');
        const appContainer = document.getElementById('app-container');
        if (loadingIndicator) loadingIndicator.style.display = 'flex';
        if (appContainer) appContainer.style.visibility = 'hidden';

        setTimeout(() => {
            ui_helpers.showKurzanleitung();
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            if (appContainer) appContainer.style.visibility = 'visible';
        }, APP_CONFIG.UI_SETTINGS.SPINNER_DELAY_MS + 500);
    }

    function hideLoadingIndicator() {
         const loadingIndicator = document.getElementById('loading-indicator');
         if (loadingIndicator) loadingIndicator.style.display = 'none';
         const appContainer = document.getElementById('app-container');
         if (appContainer) appContainer.style.visibility = 'visible';
    }

    function renderTabContent(tabId, options = {}) {
        const tabPaneContentContainer = document.getElementById(tabId);
        if (!tabPaneContentContainer) {
            console.error(`Tab-Container mit ID ${tabId} nicht gefunden.`);
            return;
        }

        if (!currentData || !dataProcessed) {
            console.warn("Daten sind noch nicht vollständig geladen oder verarbeitet für Tab:", tabId);
            ui_helpers.updateElementHTML(tabPaneContentContainer.id, '<p class="text-center text-muted">Daten werden geladen...</p>');
            return;
        }

        let content = `<p class="text-danger">Inhalt für Tab '${tabId}' konnte nicht generiert werden.</p>`;
        const renderFunction = tabContentFunctions[tabId];

        if (typeof renderFunction === 'function') {
            const defaultOptions = {
                currentKollektiv: stateManager.getCurrentKollektiv(),
                currentKollektivName: getKollektivDisplayName(stateManager.getCurrentKollektiv()),
                sortState: tabId === 'daten-tab-pane' ? stateManager.getDatenTableSort() : stateManager.getAuswertungTableSort(),
                appliedCriteria: t2CriteriaManager.getAppliedCriteria(),
                appliedLogic: t2CriteriaManager.getAppliedLogic(),
                workerAvailable: bruteForceManagerInstance ? bruteForceManagerInstance.isWorkerAvailable() : false,
                t2Metrics: statisticsService.calculatePerformanceMetrics(currentData.patientenDaten, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), stateManager.getCurrentKollektiv()).t2,
                statsLayout: stateManager.getStatsLayout(),
                statsKollektiv1: stateManager.getStatsKollektiv1(),
                statsKollektiv2: stateManager.getStatsKollektiv2(),
                selectedAppliedCriteria: t2CriteriaManager.getAppliedCriteria(),
                selectedT2Logic: t2CriteriaManager.getAppliedLogic(),
                currentView: stateManager.getPresentationView(),
                presentationData: mainAppInterface.getPresentationData(),
                selectedStudyId: stateManager.getPresentationStudyId(),
                currentLang: stateManager.getCurrentPublikationLang(),
                currentSection: stateManager.getCurrentPublikationSection(),
                publicationData: mainAppInterface.getPublicationData()
            };
            const mergedOptions = { ...defaultOptions, ...options };
            try {
                content = renderFunction(currentData, mergedOptions);
            } catch (error) {
                console.error(`Fehler beim Generieren des Inhalts für Tab ${tabId}:`, error);
                content = `<p class="text-danger">Fehler beim Laden des Inhalts für Tab ${tabId}. Details siehe Konsole.</p>`;
            }
        }
        
        ui_helpers.updateElementHTML(tabPaneContentContainer.id, content);

        if (typeof ui_helpers.initializeTooltips === 'function') {
            ui_helpers.initializeTooltips(tabPaneContentContainer);
        }

        if (tabId === 'daten-tab-pane' && typeof dataTabLogic.refreshUI === 'function') {
            dataTabLogic.refreshUI();
        } else if (tabId === 'auswertung-tab-pane' && typeof auswertungTabLogic.refreshUI === 'function') {
            auswertungTabLogic.refreshUI();
        } else if (tabId === 'statistik-tab-pane' && typeof statistikEventHandlers.attachStatistikEventListeners === 'function') {
            statistikEventHandlers.attachStatistikEventListeners(currentData.patientenDaten);
        } else if (tabId === 'praesentation-tab-pane' && typeof praesentationEventHandlers.attachPraesentationEventListeners === 'function') {
            praesentationEventHandlers.attachPraesentationEventListeners();
        } else if (tabId === 'publikation-tab-pane' && typeof publikationEventHandlers.attachPublikationEventListeners === 'function') {
            publikationEventHandlers.attachPublikationEventListeners();
        } else if (tabId === 'export-tab-pane' && typeof exportEventHandlers.attachExportEventListeners === 'function') {
            exportEventHandlers.attachExportEventListeners();
        }
        
        const mainTabContent = document.getElementById('mainTabContent');
        if(mainTabContent) mainTabContent.scrollTop = 0;
    }

    function updateCurrentData(newData) {
        currentData = newData;
        if (currentData && currentData.patientenDaten && Array.isArray(currentData.patientenDaten)) {
            dataProcessed = true;
        } else {
            dataProcessed = false;
        }
    }

    return Object.freeze({
        initialize,
        renderTabContent,
        updateCurrentData,
        showInitialScreen,
        hideLoadingIndicator
    });
})();
