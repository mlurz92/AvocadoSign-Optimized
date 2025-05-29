const viewRenderer = (() => {
    let mainAppInterfaceInstance = null;

    function initializeUI(mainAppInterface, dataLoaded) {
        mainAppInterfaceInstance = mainAppInterface;
        const initialTabId = state.getActiveTabId() || 'daten-tab';

        const tabContainer = document.getElementById('main-tab-content');
        if (!tabContainer) {
            console.error("Haupt-Tab-Container 'main-tab-content' nicht gefunden.");
            return;
        }
        tabContainer.innerHTML = '';

        const tabConfigs = [
            { id: 'daten-tab', labelKey: 'daten', contentId: 'daten-tab-pane', logic: dataTabLogic },
            { id: 'auswertung-tab', labelKey: 'auswertung', contentId: 'auswertung-tab-pane', logic: auswertungTabLogic },
            { id: 'statistik-tab', labelKey: 'statistik', contentId: 'statistik-tab-pane', logic: statistikTabLogic },
            { id: 'praesentation-tab', labelKey: 'praesentation', contentId: 'praesentation-tab-pane', logic: praesentationTabLogic },
            { id: 'publikation-tab', labelKey: 'publikation', contentId: 'publikation-tab-pane', logic: publicationTabLogic },
            { id: 'export-tab', labelKey: 'export', contentId: 'export-tab-pane', logic: null }
        ];

        tabConfigs.forEach(tabConfig => {
            const pane = document.createElement('div');
            pane.className = 'tab-pane fade';
            pane.id = tabConfig.contentId;
            pane.setAttribute('role', 'tabpanel');
            pane.setAttribute('aria-labelledby', tabConfig.id);
            if (tabConfig.id === initialTabId) {
                pane.classList.add('show', 'active');
            }

            if (tabConfig.id === 'auswertung-tab') {
                pane.innerHTML = `
                    <div class="row">
                        <div class="col-lg-5 col-xl-4 mb-3" id="t2-criteria-definition-container">
                            <p class="text-muted">Lade T2 Kriterien Definition...</p>
                        </div>
                        <div class="col-lg-7 col-xl-8">
                            <div class="row" id="auswertung-dashboard-content">
                                </div>
                             <div id="brute-force-container" class="mt-3">
                                </div>
                        </div>
                    </div>
                    <hr class="my-3">
                    <div id="t2-metrics-overview-container" class="mb-3">
                        </div>
                    <div class="table-responsive">
                        <table class="table table-hover table-sm" id="auswertung-tabelle">
                            <thead id="auswertung-tabelle-header">
                                <tr>
                                    <th scope="col" class="sortable-header" data-sort-key="nr" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.nr?.description || 'Nr.'}">Nr. <i class="fas fa-sort text-muted opacity-50 ms-1"></i></th>
                                    <th scope="col" class="sortable-header" data-sort-key="name" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.name?.description || 'Name'}">Name <i class="fas fa-sort text-muted opacity-50 ms-1"></i></th>
                                    <th scope="col" class="sortable-header" data-sort-key="therapie" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.therapie?.description || 'Therapie'}">Therapie <i class="fas fa-sort text-muted opacity-50 ms-1"></i></th>
                                    <th scope="col" class="sortable-header" data-sort-key="n_as_t2" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.n_as_t2?.description || 'N/AS/T2 Status'}">
                                        N <span class="sortable-sub-header" data-sub-key="n">(N)</span> /
                                        AS <span class="sortable-sub-header" data-sub-key="as">(AS)</span> /
                                        T2 <span class="sortable-sub-header" data-sub-key="t2">(T2)</span>
                                        <i class="fas fa-sort text-muted opacity-50 ms-1"></i>
                                    </th>
                                    <th scope="col" class="sortable-header" data-sort-key="n_counts" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.n_counts?.description || 'N LK'}">N LK (+/Ges.) <i class="fas fa-sort text-muted opacity-50 ms-1"></i></th>
                                    <th scope="col" class="sortable-header" data-sort-key="as_counts" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.as_counts?.description || 'AS LK'}">AS LK (+/Ges.) <i class="fas fa-sort text-muted opacity-50 ms-1"></i></th>
                                    <th scope="col" class="sortable-header" data-sort-key="t2_counts" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.t2_counts?.description || 'T2 LK'}">T2 LK (+/Ges.) <i class="fas fa-sort text-muted opacity-50 ms-1"></i></th>
                                    <th scope="col" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.expandRow?.description || 'Details'}"></th>
                                </tr>
                            </thead>
                            <tbody id="auswertung-tabelle-body"></tbody>
                        </table>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <small id="auswertung-anzahl-patienten-info" class="text-muted"></small>
                        <nav id="auswertung-pagination" aria-label="Auswertungstabellen Navigation"></nav>
                    </div>`;
            } else if (tabConfig.id === 'daten-tab') {
                pane.innerHTML = `
                    <div class="table-responsive">
                        <table class="table table-hover table-sm" id="daten-tabelle">
                            <thead id="daten-tabelle-header">
                                 <tr>
                                    <th scope="col" class="sortable-header" data-sort-key="nr" data-tippy-content="${TOOLTIP_CONTENT.datenTable.nr?.description || 'Nr.'}">Nr. <i class="fas fa-sort text-muted opacity-50 ms-1"></i></th>
                                    <th scope="col" class="sortable-header" data-sort-key="name" data-tippy-content="${TOOLTIP_CONTENT.datenTable.name?.description || 'Name'}">Name, Vorname <i class="fas fa-sort text-muted opacity-50 ms-1"></i></th>
                                    <th scope="col" class="sortable-header" data-sort-key="geschlecht" data-tippy-content="${TOOLTIP_CONTENT.datenTable.geschlecht?.description || 'Geschlecht'}">Geschl. <i class="fas fa-sort text-muted opacity-50 ms-1"></i></th>
                                    <th scope="col" class="sortable-header" data-sort-key="alter" data-tippy-content="${TOOLTIP_CONTENT.datenTable.alter?.description || 'Alter'}">Alter <i class="fas fa-sort text-muted opacity-50 ms-1"></i></th>
                                    <th scope="col" class="sortable-header" data-sort-key="therapie" data-tippy-content="${TOOLTIP_CONTENT.datenTable.therapie?.description || 'Therapie'}">Therapie <i class="fas fa-sort text-muted opacity-50 ms-1"></i></th>
                                    <th scope="col" class="sortable-header" data-sort-key="n_as_t2" data-tippy-content="${TOOLTIP_CONTENT.datenTable.n_as_t2?.description || 'N/AS/T2 Status'}">
                                        N <span class="sortable-sub-header" data-sub-key="n">(N)</span> /
                                        AS <span class="sortable-sub-header" data-sub-key="as">(AS)</span> /
                                        T2 <span class="sortable-sub-header" data-sub-key="t2">(T2)</span>
                                        <i class="fas fa-sort text-muted opacity-50 ms-1"></i>
                                    </th>
                                    <th scope="col" data-tippy-content="${TOOLTIP_CONTENT.datenTable.bemerkung?.description || 'Bemerkung'}">Bemerkung</th>
                                    <th scope="col" data-tippy-content="${TOOLTIP_CONTENT.datenTable.expandRow?.description || 'Details'}"></th>
                                </tr>
                            </thead>
                            <tbody id="daten-tabelle-body"></tbody>
                        </table>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <small id="daten-anzahl-patienten-info" class="text-muted"></small>
                        <nav id="daten-pagination" aria-label="Datentabellen Navigation"></nav>
                    </div>`;
            } else if (tabConfig.id === 'statistik-tab') {
                 pane.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 id="statistik-tab-content-title" class="mb-0">Statistische Auswertung</h5>
                        <div>
                            <select id="statistik-kollektiv-select-1" class="form-select form-select-sm d-none me-2" style="width:auto;" aria-label="Kollektiv 1 Auswahl" data-tippy-content="${TOOLTIP_CONTENT.statistikKollektiv1?.description || 'Kollektiv 1'}"></select>
                            <select id="statistik-kollektiv-select-2" class="form-select form-select-sm d-none me-2" style="width:auto;" aria-label="Kollektiv 2 Auswahl" data-tippy-content="${TOOLTIP_CONTENT.statistikKollektiv2?.description || 'Kollektiv 2'}"></select>
                            <button id="statistik-toggle-vergleich" class="btn btn-sm btn-outline-secondary" data-tippy-content="${TOOLTIP_CONTENT.statistikLayout?.description || 'Layout umschalten'}">
                                <i class="fas fa-user-cog me-1"></i> Einzelansicht Aktiv
                            </button>
                        </div>
                    </div>
                    <div class="row g-3" id="statistik-tab-content">
                        <p class="text-muted">Statistiken werden geladen...</p>
                    </div>`;
            } else if (tabConfig.id === 'praesentation-tab') {
                pane.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 id="praesentation-tab-content-title" class="mb-0">Präsentationsansicht</h5>
                        <div>
                            <div class="btn-group btn-group-sm me-2" role="group" aria-label="Präsentationsansicht Auswahl" id="praesentation-view-selector" data-tippy-content="${TOOLTIP_CONTENT.praesentation?.viewSelect?.description || 'Ansicht auswählen'}">
                                <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as-pur" value="as-pur" autocomplete="off">
                                <label class="btn btn-outline-primary" for="praes-ansicht-as-pur">AS Performance</label>
                                <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as-vs-t2" value="as-vs-t2" autocomplete="off">
                                <label class="btn btn-outline-primary" for="praes-ansicht-as-vs-t2">AS vs. T2</label>
                            </div>
                             <select id="praes-study-select" class="form-select form-select-sm d-inline-block" style="width:auto; display:none;" aria-label="Studienauswahl für T2-Basis" data-tippy-content="${TOOLTIP_CONTENT.praesentation?.studySelect?.description || 'T2-Basis für Vergleich'}"></select>
                        </div>
                    </div>
                    <div class="card mb-3 d-none" id="praes-t2-basis-info-card">
                        <div class="card-header card-header-sm" data-tippy-content="${TOOLTIP_CONTENT.praesentation?.t2BasisInfoCard?.title || 'Info T2-Basis'}">${TOOLTIP_CONTENT.praesentation?.t2BasisInfoCard?.title || 'Informationen zur T2-Vergleichsbasis'}</div>
                        <div class="card-body p-2" id="praes-t2-basis-info-card-content"></div>
                    </div>
                    <div id="praesentation-tab-content">
                        <p class="text-muted">Präsentationsdaten werden geladen...</p>
                    </div>`;
            } else if (tabConfig.id === 'publikation-tab') {
                pane.innerHTML = uiComponents.createPublikationTabHeader();
            } else if (tabConfig.id === 'export-tab') {
                pane.innerHTML = `<div id="export-options-container"><p class="text-muted">Exportoptionen werden geladen...</p></div>`;
            } else {
                 pane.innerHTML = `<p class="text-muted">Inhalt für ${tabConfig.labelKey} wird geladen...</p>`;
            }
            tabContainer.appendChild(pane);
        });

        if (dataLoaded) {
            renderTabContent(initialTabId, state.getCurrentAppState());
        } else {
            showLoadingState(true);
        }
        ui_helpers.initializeTooltips(document.body);
    }

    function renderTabContent(tabId, appState) {
        showLoadingState(true);
        ui_helpers.updateKollektivButtonsUI(appState.currentKollektiv);
        ui_helpers.updateHeaderStatsUI(appState.headerStats);
        ui_helpers.updateExportButtonStates(tabId, bruteForceManager.hasAnyResults(), true);


        const targetPane = document.getElementById(`${tabId}-pane`);
        if (!targetPane) {
            console.error(`Tab-Pane für ID '${tabId}' nicht gefunden.`);
            showLoadingState(false);
            return;
        }

        document.querySelectorAll('#main-tab-content .tab-pane').forEach(pane => {
            pane.classList.remove('show', 'active');
        });
        targetPane.classList.add('show', 'active');

        document.querySelectorAll('#main-tabs .nav-link').forEach(link => {
            link.classList.toggle('active', link.id === tabId);
            link.setAttribute('aria-selected', String(link.id === tabId));
        });


        try {
            switch (tabId) {
                case 'daten-tab':
                    dataTabLogic.updateData(appState.allProcessedData, appState);
                    dataTabLogic.renderTabContent();
                    break;
                case 'auswertung-tab':
                    auswertungTabLogic.updateData(appState.allProcessedData, appState);
                    auswertungTabLogic.renderTabContent();
                    break;
                case 'statistik-tab':
                    statistikTabLogic.updateData(appState.allProcessedData, appState);
                    statistikTabLogic.renderTabContent();
                    break;
                case 'praesentation-tab':
                    praesentationTabLogic.updateData(appState.allProcessedData, appState);
                    praesentationTabLogic.renderTabContent();
                    break;
                case 'publikation-tab':
                    const publicationContentArea = document.getElementById('publikation-content-area');
                    if(publicationContentArea) publicationContentArea.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade...</span></div><p class="mt-2 text-muted">Inhalte werden generiert...</p></div>`;
                    setTimeout(() => {
                        publicationTabLogic.initializeData(appState.allProcessedData, appState.appliedT2Criteria, appState.appliedT2Logic, bruteForceManager.getAllResults());
                        const contentHTML = publicationTabLogic.getRenderedSectionContent(appState.currentPublikationSection, appState.currentPublikationLang, appState.currentKollektiv);
                        if(publicationContentArea) ui_helpers.updateElementHTML('publikation-content-area', contentHTML);
                        ui_helpers.updatePublikationUI(appState.currentPublikationLang, appState.currentPublikationSection, appState.currentPublikationBruteForceMetric);
                        setTimeout(() => {
                           publicationTabLogic.updateDynamicChartsForPublicationTab(appState.currentPublikationSection, appState.currentPublikationLang, appState.currentKollektiv);
                           if(publicationContentArea) ui_helpers.initializeTooltips(publicationContentArea);
                        }, 50);
                    },0);
                    break;
                case 'export-tab':
                    const exportContainer = document.getElementById('export-options-container');
                    if (exportContainer) {
                        exportContainer.innerHTML = uiComponents.createExportOptions(appState.currentKollektiv);
                        ui_helpers.initializeTooltips(exportContainer);
                    }
                    break;
                default:
                    console.warn(`Kein Renderer für Tab-ID '${tabId}' definiert.`);
                    if(targetPane) targetPane.innerHTML = `<p class="text-warning">Kein Inhalt für diesen Tab definiert.</p>`;
            }
        } catch (error) {
            console.error(`Fehler beim Rendern des Tabs '${tabId}':`, error);
            showErrorMessage(`Fehler beim Laden des Tabs '${tabId}'. Details siehe Konsole.`, `${tabId}-pane`);
        } finally {
            showLoadingState(false);
        }
    }

    function showLoadingState(isLoading) {
        const loader = document.getElementById('main-loader');
        const content = document.getElementById('main-tab-content');
        if (loader) loader.style.display = isLoading ? 'flex' : 'none';
        if (content) content.style.display = isLoading ? 'none' : '';
    }

    function showErrorMessage(message, targetElementId = 'main-tab-content') {
        const target = document.getElementById(targetElementId);
        if (target) {
            target.innerHTML = `<div class="alert alert-danger m-3" role="alert">${message}</div>`;
        }
    }

    return Object.freeze({
        initializeUI,
        renderTabContent,
        showLoadingState,
        showErrorMessage
    });

})();
