const viewRenderer = (() => {
    let currentVisibleTabId = null;
    const tabRenderFunctions = {};
    let globalData = null;

    function _showLoadingSpinner(tabPaneId) {
        const tabPane = document.getElementById(tabPaneId);
        if (tabPane) {
            tabPane.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Lade Inhalte...</span>
                                    </div>
                                 </div>`;
        }
    }

    function _hideLoadingSpinner(tabPaneId) {
        // Normalerweise wird der Inhalt direkt überschrieben, aber falls ein explizites Entfernen nötig wäre:
        // const tabPane = document.getElementById(tabPaneId);
        // if (tabPane) {
        // const spinner = tabPane.querySelector('.spinner-border');
        // if (spinner) spinner.parentElement.remove();
        // }
    }


    function _renderDatenTab(tabPaneId, dataPayload) {
        const content = `
            <div class="container-fluid mt-3">
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <span>Patientenliste</span>
                                <button class="btn btn-sm btn-outline-secondary" id="daten-toggle-details" data-action="expand" data-tippy-content="${TOOLTIP_CONTENT.datenTable.expandAll}">
                                    Alle Details Einblenden <i class="fas fa-chevron-down ms-1"></i>
                                </button>
                            </div>
                            <div class="card-body p-0">
                                <div id="daten-table-container" class="table-responsive">
                                    <p class="p-3 text-muted">Lade Patientendaten...</p>
                                </div>
                            </div>
                             <div class="card-footer d-flex justify-content-between align-items-center small text-muted">
                                <span id="daten-table-info"></span>
                                <div id="daten-table-pagination"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        document.getElementById(tabPaneId).innerHTML = content;
        datenTabLogic.initializeTab(dataPayload.filteredData, dataPayload.sortStateDaten);
        ui_helpers.attachRowCollapseListeners(document.getElementById('daten-table-body'));
    }

    function _renderAuswertungTab(tabPaneId, dataPayload) {
        const dashboardCardsHTML = `
            <div class="row g-2 mb-3">
                ${uiComponents.createDashboardCard('N-Status (Patho)', '<h3 id="dash-status-n" class="text-center placeholder-glow"><span class="placeholder col-6"></span></h3>', null, 'text-center', 'bg-light-subtle')}
                ${uiComponents.createDashboardCard('AS-Status', '<h3 id="dash-status-as" class="text-center placeholder-glow"><span class="placeholder col-6"></span></h3>', null, 'text-center', 'bg-light-subtle')}
                ${uiComponents.createDashboardCard('T2-Status (angew.)', '<h3 id="dash-status-t2" class="text-center placeholder-glow"><span class="placeholder col-6"></span></h3>', null, 'text-center', 'bg-light-subtle')}
                ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.ageDistribution, '', 'chart-dash-ageDistribution', '', '', 'p-1')}
                ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.genderDistribution, '', 'chart-dash-genderDistribution', '', '', 'p-1', [{chartId: 'chart-dash-genderDistribution', format: 'png', chartName: 'Geschlechterverteilung'}])}
                ${uiComponents.createDashboardCard('T2 Metriken Übersicht', '<div id="t2-metrics-overview-placeholder" class="small placeholder-glow"><span class="placeholder col-12"></span><span class="placeholder col-10"></span></div>', null, 'col-xl-4 col-lg-12 col-md-12 col-sm-12 dashboard-card-col-full-lg', 'bg-light', 'p-1 justify-content-center')}
            </div>`;

        const content = `
            <div class="container-fluid mt-3">
                ${uiComponents.createT2CriteriaControls(dataPayload.appliedT2Criteria, dataPayload.appliedT2Logic)}
                <div class="mt-3">${dashboardCardsHTML}</div>
                ${uiComponents.createBruteForceCard(dataPayload.currentKollektiv, dataPayload.isBruteForceWorkerAvailable)}
                <div class="modal fade" id="brute-force-modal" tabindex="-1" aria-labelledby="bruteForceModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-xl modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="bruteForceModalLabel">${TOOLTIP_CONTENT.bruteForceModal.title}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
                            </div>
                            <div class="modal-body" id="brute-force-modal-body"><p class="text-center">Lade Ergebnisse...</p></div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" id="export-bruteforce-modal-txt" data-tippy-content="${TOOLTIP_CONTENT.bruteForceModal.exportButton}" disabled>
                                    <i class="fas fa-file-alt me-1"></i> Detaillierten Bericht exportieren (.txt)
                                </button>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schließen</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <span>Auswertungsergebnisse pro Patient</span>
                                <button class="btn btn-sm btn-outline-secondary" id="auswertung-toggle-details" data-action="expand" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.expandAll}">
                                   Alle Details Einblenden <i class="fas fa-chevron-down ms-1"></i>
                                </button>
                            </div>
                            <div class="card-body p-0">
                                <div id="auswertung-table-container" class="table-responsive">
                                    <p class="p-3 text-muted">Lade Auswertungsdaten...</p>
                                </div>
                            </div>
                            <div class="card-footer d-flex justify-content-between align-items-center small text-muted">
                                <span id="auswertung-table-info"></span>
                                <div id="auswertung-table-pagination"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        document.getElementById(tabPaneId).innerHTML = content;
        auswertungTabLogic.initializeTab(dataPayload.filteredData, dataPayload.sortStateAuswertung, dataPayload.appliedT2Criteria, dataPayload.appliedT2Logic, dataPayload.currentKollektiv, dataPayload.isBruteForceWorkerAvailable, dataPayload.bruteForceResultsForCurrentKollektiv);
        ui_helpers.attachRowCollapseListeners(document.getElementById('auswertung-table-body'));
    }

    function _renderStatistikTab(tabPaneId, dataPayload) {
        const content = `
            <div class="container-fluid mt-3">
                <div class="row mb-3 sticky-top bg-light py-2 shadow-sm" style="top: ${getComputedStyle(document.documentElement).getPropertyValue('--sticky-header-offset') || '111px'}; z-index: 1010;">
                    <div class="col-md-4 d-flex align-items-center">
                        <button class="btn btn-sm btn-outline-primary me-3" id="statistik-toggle-vergleich" data-tippy-content="${TOOLTIP_CONTENT.statistikLayout.description}">
                            <i class="fas fa-user-cog me-1"></i> Einzelansicht Aktiv
                        </button>
                    </div>
                    <div class="col-md-4 d-none" id="statistik-kollektiv-select-1-container">
                        <label for="statistik-kollektiv-select-1" class="form-label form-label-sm">Kollektiv 1:</label>
                        <select class="form-select form-select-sm" id="statistik-kollektiv-select-1" data-tippy-content="${TOOLTIP_CONTENT.statistikKollektiv1.description}">
                            <option value="Gesamt">Gesamt</option>
                            <option value="direkt OP">Direkt OP</option>
                            <option value="nRCT">nRCT</option>
                        </select>
                    </div>
                    <div class="col-md-4 d-none" id="statistik-kollektiv-select-2-container">
                         <label for="statistik-kollektiv-select-2" class="form-label form-label-sm">Kollektiv 2:</label>
                        <select class="form-select form-select-sm" id="statistik-kollektiv-select-2" data-tippy-content="${TOOLTIP_CONTENT.statistikKollektiv2.description}">
                            <option value="Gesamt">Gesamt</option>
                            <option value="direkt OP">Direkt OP</option>
                            <option value="nRCT">nRCT</option>
                        </select>
                    </div>
                </div>
                <div class="row g-3" id="statistik-cards-container">
                     <p class="text-center p-5 text-muted">Statistiken werden geladen...</p>
                </div>
            </div>`;
        document.getElementById(tabPaneId).innerHTML = content;
        statistikTabLogic.initializeTab(dataPayload.filteredData, dataPayload.appliedT2Criteria, dataPayload.appliedT2Logic, dataPayload.currentKollektiv, dataPayload.statsLayout, dataPayload.statsKollektiv1, dataPayload.statsKollektiv2, dataPayload.bruteForceResults);
    }

    function _renderPraesentationTab(tabPaneId, dataPayload) {
        const content = `
            <div class="container-fluid mt-3">
                <div class="row mb-3 sticky-top bg-light py-2 shadow-sm" style="top: ${getComputedStyle(document.documentElement).getPropertyValue('--sticky-header-offset') || '111px'}; z-index: 1010;">
                    <div class="col-md-5">
                        <label class="form-label form-label-sm">Ansicht wählen:</label>
                        <div class="btn-group w-100" role="group" aria-label="Präsentationsansicht wählen" data-tippy-content="${TOOLTIP_CONTENT.praesentation.viewSelect.description}">
                            <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as-pur" value="as-pur" autocomplete="off">
                            <label class="btn btn-sm btn-outline-primary" for="praes-ansicht-as-pur">Avocado Sign (Performance)</label>

                            <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as-vs-t2" value="as-vs-t2" autocomplete="off">
                            <label class="btn btn-sm btn-outline-primary" for="praes-ansicht-as-vs-t2">AS vs. T2 (Vergleich)</label>
                        </div>
                    </div>
                    <div class="col-md-7" id="praes-study-select-container" style="display: none;">
                        <label for="praes-study-select" class="form-label form-label-sm">T2-Vergleichsbasis wählen:</label>
                        <select class="form-select form-select-sm" id="praes-study-select" data-tippy-content="${TOOLTIP_CONTENT.praesentation.studySelect.description}">
                            <option value="${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID}">${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME} (aktuell eingestellt)</option>
                            ${PUBLICATION_CONFIG.literatureCriteriaSets.map(set => `<option value="${set.id}">${set.nameKey}</option>`).join('')}
                            <option value="bruteforce_optimized">Brute-Force optimierte Kriterien (je nach Kollektiv)</option>
                        </select>
                    </div>
                </div>
                <div id="praesentation-content-area">
                    <p class="text-center p-5 text-muted">Präsentationsinhalte werden geladen...</p>
                </div>
            </div>`;
        document.getElementById(tabPaneId).innerHTML = content;
        praesentationTabLogic.initializeTab(dataPayload.filteredData, dataPayload.appliedT2Criteria, dataPayload.appliedT2Logic, dataPayload.currentKollektiv, dataPayload.presentationView, dataPayload.presentationStudyId, dataPayload.bruteForceResults);
    }

    function _renderPublikationTab(tabPaneId, dataPayload) {
        // publicationComponents ist nun im globalen Scope oder importiert
        const headerHTML = publicationComponents.createPublikationTabHeader();
        document.getElementById(tabPaneId).innerHTML = headerHTML;
        // Die Logik zum Befüllen von #publikation-content-area ist in publikationTabLogic
        publikationTabLogic.initializeTab(dataPayload.rawData, dataPayload.appliedT2Criteria, dataPayload.appliedT2Logic, dataPayload.bruteForceResults);
    }

    function _renderExportTab(tabPaneId, dataPayload) {
        const content = `
            <div class="container-fluid mt-3">
                 ${uiComponents.createExportOptions(dataPayload.currentKollektiv)}
            </div>`;
        document.getElementById(tabPaneId).innerHTML = content;
        // Export-Tab hat keine eigene Logik-Datei, Buttons werden direkt von Event-Handlern behandelt.
        // Der Status der Buttons wird durch ui_helpers.updateExportButtonStates() gesteuert.
        ui_helpers.updateExportButtonStates(currentVisibleTabId, dataPayload.hasBruteForceResults, (dataPayload.filteredData && dataPayload.filteredData.length > 0) );
    }

    tabRenderFunctions['daten-tab'] = _renderDatenTab;
    tabRenderFunctions['auswertung-tab'] = _renderAuswertungTab;
    tabRenderFunctions['statistik-tab'] = _renderStatistikTab;
    tabRenderFunctions['praesentation-tab'] = _renderPraesentationTab;
    tabRenderFunctions['publikation-tab'] = _renderPublikationTab;
    tabRenderFunctions['export-tab'] = _renderExportTab;


    function renderTabContent(tabId, data) {
        globalData = data; // Store data for potential re-renders or access by tab logics
        currentVisibleTabId = tabId;
        const tabPaneId = `${tabId}-pane`;
        const renderFn = tabRenderFunctions[tabId];

        _showLoadingSpinner(tabPaneId);
        
        // Use a small timeout to allow spinner to render before potentially blocking JS execution
        setTimeout(() => {
            try {
                if (typeof renderFn === 'function') {
                    const dataPayload = {
                        rawData: globalData.rawData,
                        filteredData: globalData.filteredData,
                        appliedT2Criteria: globalData.appliedT2Criteria,
                        appliedT2Logic: globalData.appliedT2Logic,
                        currentKollektiv: globalData.currentKollektiv,
                        isBruteForceWorkerAvailable: globalData.isBruteForceWorkerAvailable,
                        bruteForceResults: globalData.bruteForceResults, // Alle Kollektive
                        bruteForceResultsForCurrentKollektiv: globalData.bruteForceResults?.[globalData.currentKollektiv],
                        hasBruteForceResults: globalData.bruteForceResults && Object.keys(globalData.bruteForceResults).some(k => globalData.bruteForceResults[k]?.results?.length > 0),
                        sortStateDaten: globalData.sortStateDaten,
                        sortStateAuswertung: globalData.sortStateAuswertung,
                        statsLayout: globalData.statsLayout,
                        statsKollektiv1: globalData.statsKollektiv1,
                        statsKollektiv2: globalData.statsKollektiv2,
                        presentationView: globalData.presentationView,
                        presentationStudyId: globalData.presentationStudyId
                    };
                    renderFn(tabPaneId, dataPayload);
                } else {
                    document.getElementById(tabPaneId).innerHTML = `<div class="alert alert-warning">Inhalt für Tab '${tabId}' konnte nicht geladen werden (Renderfunktion nicht gefunden).</div>`;
                    console.error(`Renderfunktion für Tab '${tabId}' nicht gefunden.`);
                }
            } catch (error) {
                console.error(`Fehler beim Rendern des Tabs '${tabId}':`, error);
                document.getElementById(tabPaneId).innerHTML = `<div class="alert alert-danger">Fehler beim Laden des Inhalts für Tab '${tabId}'. Details siehe Konsole.</div>`;
            } finally {
                 _hideLoadingSpinner(tabPaneId); // In der Regel nicht nötig, da Inhalt überschrieben wird
                 ui_helpers.initializeTooltips(document.getElementById(tabPaneId));
                 ui_helpers.updateExportButtonStates(currentVisibleTabId, (globalData?.bruteForceResults && Object.keys(globalData.bruteForceResults).some(k => globalData.bruteForceResults[k]?.results?.length > 0)), (globalData?.filteredData && globalData.filteredData.length > 0) );

            }
        }, 50);
    }
    
    function refreshCurrentTab(newData) {
        if (currentVisibleTabId) {
            if (newData) globalData = newData; // Optional: Update globalData if new full dataset is passed
            
            const tabLogicMap = {
                'daten-tab': datenTabLogic,
                'auswertung-tab': auswertungTabLogic,
                'statistik-tab': statistikTabLogic,
                'praesentation-tab': praesentationTabLogic,
                'publikation-tab': publikationTabLogic
                // Export-Tab hat keine eigene refresh-Logik hier
            };
            
            const currentTabLogic = tabLogicMap[currentVisibleTabId];
            if (currentTabLogic && typeof currentTabLogic.refreshTab === 'function') {
                const dataPayload = {
                    rawData: globalData.rawData,
                    filteredData: globalData.filteredData,
                    appliedT2Criteria: globalData.appliedT2Criteria,
                    appliedT2Logic: globalData.appliedT2Logic,
                    currentKollektiv: globalData.currentKollektiv,
                    isBruteForceWorkerAvailable: globalData.isBruteForceWorkerAvailable,
                    bruteForceResults: globalData.bruteForceResults,
                    bruteForceResultsForCurrentKollektiv: globalData.bruteForceResults?.[globalData.currentKollektiv],
                    hasBruteForceResults: globalData.bruteForceResults && Object.keys(globalData.bruteForceResults).some(k => globalData.bruteForceResults[k]?.results?.length > 0),
                    sortStateDaten: globalData.sortStateDaten,
                    sortStateAuswertung: globalData.sortStateAuswertung,
                    statsLayout: globalData.statsLayout,
                    statsKollektiv1: globalData.statsKollektiv1,
                    statsKollektiv2: globalData.statsKollektiv2,
                    presentationView: globalData.presentationView,
                    presentationStudyId: globalData.presentationStudyId
                };
                currentTabLogic.refreshTab(
                    dataPayload.rawData,
                    dataPayload.appliedT2Criteria,
                    dataPayload.appliedT2Logic,
                    dataPayload.bruteForceResults
                );
                 ui_helpers.initializeTooltips(document.getElementById(`${currentVisibleTabId}-pane`));
                 ui_helpers.updateExportButtonStates(currentVisibleTabId, dataPayload.hasBruteForceResults, (dataPayload.filteredData && dataPayload.filteredData.length > 0) );

            } else if (currentVisibleTabId === 'export-tab') {
                // Export-Tab wird meist direkt über `renderTabContent` aktualisiert oder Buttons werden enabled/disabled
                ui_helpers.updateExportButtonStates(currentVisibleTabId, (globalData?.bruteForceResults && Object.keys(globalData.bruteForceResults).some(k => globalData.bruteForceResults[k]?.results?.length > 0)), (globalData?.filteredData && globalData.filteredData.length > 0) );
            }
        }
    }


    return Object.freeze({
        renderTabContent,
        refreshCurrentTab
    });

})();
