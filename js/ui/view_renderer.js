const viewRenderer = (() => {
    let currentKollektiv = null;
    let currentActiveTabId = null;
    let isInitialized = false;

    const tabContentFunctions = {
        'daten-tab-pane': (data) => dataTabLogic.createDatenTableHTML(data.patienten, stateManager.getDatenTableSort()),
        'auswertung-tab-pane': (data) => {
            const t2ControlsHTML = uiComponents.createT2CriteriaControls(t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
            const bruteForceCardHTML = uiComponents.createBruteForceCard(currentKollektiv, bruteForceManager.isWorkerAvailable());
            const tableContainerHTML = `<div class="mt-3 card"><div class="card-header d-flex justify-content-between align-items-center"><span>Auswertungstabelle (Kollektiv: ${getKollektivDisplayName(currentKollektiv)})</span><button class="btn btn-sm btn-outline-secondary" id="auswertung-toggle-details" data-action="expand"><i class="fas fa-chevron-down me-1"></i>Alle Details Anzeigen</button></div><div id="auswertung-table-container" class="table-responsive"></div></div>`;
            return `<div class="row g-3"><div class="col-xl-5">${t2ControlsHTML}</div><div class="col-xl-7">${bruteForceCardHTML}</div></div>${tableContainerHTML}`;
        },
        'statistik-tab-pane': (data) => {
            const layout = stateManager.getCurrentStatsLayout();
            let content = '';
            if (layout === 'einzel') {
                const stats = data.statistics[currentKollektiv];
                if (stats) {
                    content += uiComponents.createStatistikCard('deskriptiv-stats', `Deskriptive Statistik - Kollektiv: ${getKollektivDisplayName(currentKollektiv)}`, statistikTabLogic.createDeskriptiveStatistikContentHTML(stats, 'single', currentKollektiv), true, 'statistikTab.deskriptivCard');
                    content += uiComponents.createStatistikCard('as-guete', `Diagnostische Güte AS - Kollektiv: ${getKollektivDisplayName(currentKollektiv)}`, statistikTabLogic.createGueteContentHTML(stats.as, 'AS', currentKollektiv), false, 'statistikTab.asGueteCard', [{chartId: 'chart-stat-as-roc-single', format:'svg'},{chartId: 'chart-stat-as-roc-single', format:'png'}]);
                    content += uiComponents.createStatistikCard('t2-guete', `Diagnostische Güte T2 - Kollektiv: ${getKollektivDisplayName(currentKollektiv)}`, statistikTabLogic.createGueteContentHTML(stats.t2, 'T2', currentKollektiv), false, 'statistikTab.t2GueteCard', [{chartId: 'chart-stat-t2-roc-single', format:'svg'},{chartId: 'chart-stat-t2-roc-single', format:'png'}]);
                    content += uiComponents.createStatistikCard('as-vs-t2-vergleich', `Vergleich AS vs. T2 - Kollektiv: ${getKollektivDisplayName(currentKollektiv)}`, statistikTabLogic.createVergleichContentHTML(stats.vergleich, currentKollektiv, 'T2'), false, 'statistikTab.asVsT2VergleichCard');
                    content += uiComponents.createStatistikCard('assoziationen', `Assoziationen mit N-Status - Kollektiv: ${getKollektivDisplayName(currentKollektiv)}`, statistikTabLogic.createAssoziationContentHTML(stats.assoziationen, currentKollektiv, t2CriteriaManager.getAppliedCriteria()), false, 'statistikTab.assoziationenCard');
                    content += uiComponents.createStatistikCard('kriterien-vergleich-global', `Vergleich Kriteriensätze - Kollektiv: ${getKollektivDisplayName(currentKollektiv)}`, statistikTabLogic.createCriteriaComparisonTableHTML(data.criteriaComparisonResults || [], currentKollektiv), false, 'statistikTab.kriterienVergleichCard');

                } else {
                    content = `<p class="text-muted">Statistiken für Kollektiv ${getKollektivDisplayName(currentKollektiv)} nicht verfügbar.</p>`;
                }
            } else if (layout === 'vergleich') {
                const kollektiv1 = stateManager.getCurrentStatsKollektiv1();
                const kollektiv2 = stateManager.getCurrentStatsKollektiv2();
                const stats1 = data.statistics[kollektiv1];
                const stats2 = data.statistics[kollektiv2];
                content = `<div class="row g-3">
                                <div class="col-lg-6">${uiComponents.createStatistikCard('deskriptiv-stats-k1', `Deskriptive Statistik - Kollektiv: ${getKollektivDisplayName(kollektiv1)}`, stats1 ? statistikTabLogic.createDeskriptiveStatistikContentHTML(stats1, 'k1', kollektiv1) : '<p class="text-muted small p-2">Daten nicht verfügbar.</p>', true, 'statistikTab.deskriptivCard')}</div>
                                <div class="col-lg-6">${uiComponents.createStatistikCard('deskriptiv-stats-k2', `Deskriptive Statistik - Kollektiv: ${getKollektivDisplayName(kollektiv2)}`, stats2 ? statistikTabLogic.createDeskriptiveStatistikContentHTML(stats2, 'k2', kollektiv2) : '<p class="text-muted small p-2">Daten nicht verfügbar.</p>', true, 'statistikTab.deskriptivCard')}</div>
                                <div class="col-lg-6">${uiComponents.createStatistikCard('as-guete-k1', `Diagnostische Güte AS - Kollektiv: ${getKollektivDisplayName(kollektiv1)}`, stats1 ? statistikTabLogic.createGueteContentHTML(stats1.as, 'AS', kollektiv1) : '<p class="text-muted small p-2">Daten nicht verfügbar.</p>', false, 'statistikTab.asGueteCard',[{chartId: 'chart-stat-as-roc-k1', format:'svg'},{chartId: 'chart-stat-as-roc-k1', format:'png'}])}</div>
                                <div class="col-lg-6">${uiComponents.createStatistikCard('as-guete-k2', `Diagnostische Güte AS - Kollektiv: ${getKollektivDisplayName(kollektiv2)}`, stats2 ? statistikTabLogic.createGueteContentHTML(stats2.as, 'AS', kollektiv2) : '<p class="text-muted small p-2">Daten nicht verfügbar.</p>', false, 'statistikTab.asGueteCard',[{chartId: 'chart-stat-as-roc-k2', format:'svg'},{chartId: 'chart-stat-as-roc-k2', format:'png'}])}</div>
                                <div class="col-lg-6">${uiComponents.createStatistikCard('t2-guete-k1', `Diagnostische Güte T2 - Kollektiv: ${getKollektivDisplayName(kollektiv1)}`, stats1 ? statistikTabLogic.createGueteContentHTML(stats1.t2, 'T2', kollektiv1) : '<p class="text-muted small p-2">Daten nicht verfügbar.</p>', false, 'statistikTab.t2GueteCard',[{chartId: 'chart-stat-t2-roc-k1', format:'svg'},{chartId: 'chart-stat-t2-roc-k1', format:'png'}])}</div>
                                <div class="col-lg-6">${uiComponents.createStatistikCard('t2-guete-k2', `Diagnostische Güte T2 - Kollektiv: ${getKollektivDisplayName(kollektiv2)}`, stats2 ? statistikTabLogic.createGueteContentHTML(stats2.t2, 'T2', kollektiv2) : '<p class="text-muted small p-2">Daten nicht verfügbar.</p>', false, 'statistikTab.t2GueteCard', [{chartId: 'chart-stat-t2-roc-k2', format:'svg'},{chartId: 'chart-stat-t2-roc-k2', format:'png'}])}</div>
                           </div>`;
                if (data.kollektivVergleichStats) {
                    content += `<div class="mt-3">${uiComponents.createStatistikCard('kollektiv-vergleich', `Direkter Vergleich: ${getKollektivDisplayName(kollektiv1)} vs. ${getKollektivDisplayName(kollektiv2)}`, statistikTabLogic.createVergleichKollektiveContentHTML(data.kollektivVergleichStats, kollektiv1, kollektiv2), false, 'statistikTab.kollektivVergleichCard')}</div>`;
                }
            }
            return `<div id="statistik-layout-controls" class="mb-3"></div>${content}`;
        },
        'praesentation-tab-pane': (data) => {
            const currentView = stateManager.getCurrentPresentationView();
            const selectedStudyId = stateManager.getCurrentPresentationStudyId();
            return praesentationTabLogic.createPresentationTabContent(currentView, data.presentationData, selectedStudyId, currentKollektiv);
        },
        'publikation-tab-pane': (data) => {
             const headerHTML = uiComponents.createPublikationTabHeader();
             return headerHTML;
        },
        'export-tab-pane': (data) => uiComponents.createExportOptions(currentKollektiv)
    };

    function initialize(initialKollektiv) {
        currentKollektiv = initialKollektiv;
        currentActiveTabId = stateManager.getActiveTabId();
        isInitialized = true;
    }

    function renderTabContent(tabId, data = {}, options = {}) {
        currentActiveTabId = tabId;
        currentKollektiv = stateManager.getCurrentKollektiv();
        const tabPaneContentContainer = document.getElementById(tabId);

        if (!tabPaneContentContainer) {
            console.error(`Tab-Container '${tabId}' nicht gefunden.`);
            return;
        }
        if (typeof tabContentFunctions[tabId] !== 'function') {
            console.error(`Keine Rendering-Funktion für Tab-ID '${tabId}' definiert.`);
            ui_helpers.updateElementHTML(tabPaneContentContainer.id, `<p class="text-danger">Inhalt für diesen Tab konnte nicht geladen werden.</p>`);
            return;
        }

        try {
            const content = tabContentFunctions[tabId](data);
            ui_helpers.updateElementHTML(tabPaneContentContainer.id, content);

            if (tabId === 'statistik-tab-pane') {
                 statistikEventHandlers.renderLayoutControls(stateManager.getCurrentStatsLayout(), stateManager.getCurrentStatsKollektiv1(), stateManager.getCurrentStatsKollektiv2());
                 if (data.statistics && chartRenderer) {
                    const layout = stateManager.getCurrentStatsLayout();
                    const kollektiv1 = layout === 'vergleich' ? stateManager.getCurrentStatsKollektiv1() : currentKollektiv;
                    const kollektiv2 = layout === 'vergleich' ? stateManager.getCurrentStatsKollektiv2() : null;
                    chartRenderer.renderStatistikCharts(data.statistics, kollektiv1, kollektiv2, layout);
                 }
            } else if (tabId === 'auswertung-tab-pane') {
                auswertungTabLogic.initialize(data.patientenFuerAuswertung, bruteForceManager);
                ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
                if (bruteForceManager) {
                    bruteForceManager.updateKollektiv(currentKollektiv);
                    bruteForceManager.updateUIBasedOnState();
                }
            } else if (tabId === 'daten-tab-pane') {
                dataTabLogic.initialize(data.patienten, stateManager.getDatenTableSort());
            } else if (tabId === 'praesentation-tab-pane') {
                 if (data.presentationData && chartRenderer) {
                     chartRenderer.renderPraesentationCharts(stateManager.getCurrentPresentationView(), data.presentationData, stateManager.getCurrentPresentationStudyId());
                 }
                 praesentationEventHandlers.renderStudySelector(stateManager.getCurrentPresentationStudyId(), data.presentationData?.availableStudySets || []);
                 ui_helpers.updatePresentationViewSelectorUI(stateManager.getCurrentPresentationView());
            } else if (tabId === 'export-tab-pane') {
                exportEventHandlers.updateButtonStates();
            } else if (tabId === 'publikation-tab-pane') {
                publikationTabLogic.renderContent();
            }

            ui_helpers.initializeTooltips(tabPaneContentContainer);
            if (options.focusElementId) {
                const focusEl = document.getElementById(options.focusElementId);
                if (focusEl) focusEl.focus();
            }

        } catch (error) {
            console.error(`Fehler beim Rendern des Tabs '${tabId}':`, error);
            ui_helpers.updateElementHTML(tabPaneContentContainer.id, `<p class="text-danger">Ein Fehler ist beim Laden dieses Tabs aufgetreten. Details siehe Konsole.</p>`);
        }
    }
    
    function refreshCurrentTab(data, options) {
        if (currentActiveTabId && isInitialized) {
            renderTabContent(currentActiveTabId, data, options);
        }
    }

    return Object.freeze({
        initialize,
        renderTabContent,
        refreshCurrentTab
    });

})();
