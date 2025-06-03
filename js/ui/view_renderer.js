const viewRenderer = (() => {
    let initialDataCache = null;
    let currentKollektivCache = null;
    let bruteForceManagerCache = null;

    function initialize(initialData, currentKollektiv, bruteForceManager) {
        initialDataCache = initialData;
        currentKollektivCache = currentKollektiv;
        bruteForceManagerCache = bruteForceManager;

        const tabs = document.querySelectorAll('.navigation-tabs .nav-link');
        tabs.forEach(tab => {
            tab.addEventListener('show.bs.tab', function (event) {
                const tabId = event.target.id.replace('-link', '-pane');
                stateManager.setActiveTabId(tabId);
                if (mainAppInterface && typeof mainAppInterface.refreshCurrentTab === 'function') {
                    mainAppInterface.refreshCurrentTab();
                } else {
                    renderTabContent(tabId, initialDataCache, currentKollektivCache, bruteForceManagerCache);
                }
            });
        });
    }

    function renderTabContent(tabId, initialData, currentKollektiv, bruteForceManagerInstance) {
        const tabPaneContentContainer = document.getElementById(tabId);
        if (!tabPaneContentContainer) {
            console.error(`Tab-Pane Container mit ID '${tabId}' nicht gefunden.`);
            return;
        }

        let content = `<p class="text-muted p-3">Inhalt für Tab '${tabId}' wird geladen...</p>`;
        ui_helpers.updateElementHTML(tabPaneContentContainer.id, content);

        try {
            switch (tabId) {
                case 'daten-tab-pane':
                    content = renderDatenTab(initialData, currentKollektiv);
                    break;
                case 'auswertung-tab-pane':
                    content = renderAuswertungTab(initialData, currentKollektiv, bruteForceManagerInstance);
                    break;
                case 'statistik-tab-pane':
                    content = renderStatistikTab(stateManager.getCurrentStatsLayout(), stateManager.getStatsKollektiv1(), stateManager.getStatsKollektiv2());
                    break;
                case 'praesentation-tab-pane':
                    content = renderPraesentationTab(stateManager.getCurrentPresentationView(), stateManager.getCurrentPresentationStudyId());
                    break;
                case 'publikation-tab-pane':
                    content = renderPublikationTab(stateManager.getCurrentPublikationLang(), stateManager.getCurrentPublikationSection(), stateManager.getCurrentPublikationBruteForceMetric());
                    break;
                case 'export-tab-pane':
                    content = renderExportTab(currentKollektiv);
                    break;
                default:
                    console.warn(`Unbekannter Tab-Typ für Rendering: ${tabId}`);
                    content = `<p class="text-danger p-3">Unbekannter Tab-Typ: ${tabId}</p>`;
            }
        } catch (error) {
            console.error(`Fehler beim Rendern des Tabs '${tabId}':`, error);
            content = `<p class="text-danger p-3">Fehler beim Laden des Tabs '${tabId}'. Details siehe Konsole.</p>`;
        }
        
        ui_helpers.updateElementHTML(tabPaneContentContainer.id, content);
        ui_helpers.initializeTooltips(tabPaneContentContainer);
    }

    function renderDatenTab(data, currentKollektiv) {
        const tableContainerId = 'daten-table-container';
        const toggleDetailsButtonId = 'daten-toggle-details';
        const filterInputId = 'daten-filter-input';
        const tableHeaderId = 'daten-table-header';

        let html = `
            <div class="row mb-3">
                <div class="col-md-8">
                    <input type="text" id="${filterInputId}" class="form-control form-control-sm" placeholder="${TOOLTIP_CONTENT.datenTable.filterInput}">
                </div>
                <div class="col-md-4 text-end">
                    <button class="btn btn-sm btn-outline-secondary" id="${toggleDetailsButtonId}" data-action="expand" data-tippy-content="${TOOLTIP_CONTENT.datenTable.expandAll}">
                        Alle Details Anzeigen <i class="fas fa-chevron-down ms-1"></i>
                    </button>
                </div>
            </div>
            <div id="${tableContainerId}" class="table-responsive">
                <p class="text-muted">Daten werden geladen...</p>
            </div>`;
        return html;
    }

    function renderAuswertungTab(data, currentKollektiv, bruteForceManagerInstance) {
        const tableContainerId = 'auswertung-table-container';
        const toggleDetailsButtonId = 'auswertung-toggle-details';
        const tableHeaderId = 'auswertung-table-header';
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
        const appliedLogic = t2CriteriaManager.getAppliedLogic();
        
        let html = `
            <div class="row">
                <div class="col-lg-5 mb-3 mb-lg-0">
                    ${uiComponents.createT2CriteriaControls(appliedCriteria, appliedLogic)}
                </div>
                <div class="col-lg-7">
                    <div class="row">
                        ${uiComponents.createBruteForceCard(currentKollektiv, bruteForceManagerInstance.isWorkerAvailable())}
                        <div class="col-12 mt-3">
                            ${uiComponents.createT2MetricsOverview(null, currentKollektiv)}
                        </div>
                    </div>
                </div>
            </div>
            <hr class="my-4">
            <h4 class="mb-3">Patientenübersicht (angewandte Kriterien)</h4>
             <div class="d-flex justify-content-end mb-2">
                <button class="btn btn-sm btn-outline-secondary" id="${toggleDetailsButtonId}" data-action="expand" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.expandAll}">
                    Alle Details Anzeigen <i class="fas fa-chevron-down ms-1"></i>
                </button>
            </div>
            <div id="${tableContainerId}" class="table-responsive">
                <p class="text-muted">Auswertungsdaten werden geladen...</p>
            </div>`;
        return html;
    }

    function renderStatistikTab(currentLayout, kollektiv1, kollektiv2) {
        const isVergleich = currentLayout === 'vergleich';
        const currentKollektiv = stateManager.getCurrentKollektiv();
        const displayKollektiv1 = getKollektivDisplayName(kollektiv1);
        const displayKollektiv2 = getKollektivDisplayName(kollektiv2);
        
        const kollektivOptions = ['Gesamt', 'direkt OP', 'nRCT'].map(kId =>
            `<option value="${kId}" ${kId === (isVergleich ? kollektiv1 : currentKollektiv) ? 'selected' : ''}>${getKollektivDisplayName(kId)}</option>`
        ).join('');
        const kollektiv2Options = ['Gesamt', 'direkt OP', 'nRCT'].map(kId =>
            `<option value="${kId}" ${kId === kollektiv2 ? 'selected' : ''}>${getKollektivDisplayName(kId)}</option>`
        ).join('');
        
        const merkmalOptions = [
            {value: "geschlecht_m", label: "Geschlecht (männlich)"},
            {value: "alter_ueber_median", label: "Alter (über Median Gesamt)"}
        ].map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
        
        const t2SetOptions = [
            { value: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, label: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME},
            ...PUBLICATION_CONFIG.literatureCriteriaSets.map(s => ({value: s.id, label: s.nameKey})),
            { value: 'bruteforce_optimized', label: 'Brute-Force optimiert (akt. Metrik)'}
        ].map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');

        let html = `
            <div class="row mb-3 align-items-center">
                <div class="col-md-auto mb-2 mb-md-0">
                    <button class="btn btn-sm btn-outline-primary" id="statistik-toggle-vergleich" data-tippy-content="${TOOLTIP_CONTENT.statistikLayoutSwitch[currentLayout]}">
                        ${UI_TEXTS.statistikTab.layoutSwitchLabel[currentLayout]}
                    </button>
                </div>
                <div class="col-md-auto mb-2 mb-md-0 ${isVergleich ? 'd-none' : ''}" id="statistik-kollektiv-select-einzel-container">
                    <select id="statistik-kollektiv-select-einzel" class="form-select form-select-sm" data-tippy-content="${TOOLTIP_CONTENT.statistikKollektivSelect.einzel}">
                        ${kollektivOptions}
                    </select>
                </div>
                <div class="col-md-auto mb-2 mb-md-0 ${isVergleich ? '' : 'd-none'}" id="statistik-kollektiv-select-1-container">
                    <label for="statistik-kollektiv-select-1" class="form-label-sm me-1">Koll. 1:</label>
                    <select id="statistik-kollektiv-select-1" class="form-select form-select-sm d-inline-block" style="width:auto;" data-tippy-content="${TOOLTIP_CONTENT.statistikKollektivSelect.kollektiv1}">
                        ${kollektivOptions}
                    </select>
                </div>
                <div class="col-md-auto ${isVergleich ? '' : 'd-none'}" id="statistik-kollektiv-select-2-container">
                    <label for="statistik-kollektiv-select-2" class="form-label-sm me-1">Koll. 2:</label>
                    <select id="statistik-kollektiv-select-2" class="form-select form-select-sm d-inline-block" style="width:auto;" data-tippy-content="${TOOLTIP_CONTENT.statistikKollektivSelect.kollektiv2}">
                        ${kollektiv2Options}
                    </select>
                </div>
            </div>
            <div id="statistik-content-area" class="row g-3">
                 <p class="text-muted">Statistikdaten werden geladen...</p>
            </div>`;
        return html;
    }

    function renderPraesentationTab(currentView, currentStudyId) {
        const studyOptions = PUBLICATION_CONFIG.literatureCriteriaSets.map(set =>
            `<option value="${set.id}" ${set.id === currentStudyId ? 'selected' : ''}>${set.nameKey}</option>`
        ).join('');

        let html = `
            <div class="row mb-3 align-items-center">
                <div class="col-md-auto mb-2 mb-md-0">
                    <label class="form-label-sm me-2">${UI_TEXTS.praesentationTab.viewSelectLabel}</label>
                    <div class="btn-group btn-group-sm" role="group" aria-label="Präsentationsansicht wählen" data-tippy-content="${TOOLTIP_CONTENT.praesentationTabTooltips.viewSelect}">
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as-pur" value="as-pur" ${currentView === 'as-pur' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary praes-view-btn" for="praes-ansicht-as-pur">${UI_TEXTS.praesentationTab.viewOptions.asPur}</label>
                        
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as-vs-t2" value="as-vs-t2" ${currentView === 'as-vs-t2' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary praes-view-btn" for="praes-ansicht-as-vs-t2">${UI_TEXTS.praesentationTab.viewOptions.asVsT2}</label>
                    </div>
                </div>
                <div class="col-md-auto mb-2 mb-md-0 ${currentView === 'as-vs-t2' ? '' : 'd-none'}" id="praes-study-select-container">
                    <label for="praes-study-select" class="form-label-sm me-1">${UI_TEXTS.praesentationTab.studySelectLabel}</label>
                    <select class="form-select form-select-sm d-inline-block" style="width:auto;" id="praes-study-select" data-tippy-content="${TOOLTIP_CONTENT.praesentationTabTooltips.studySelect}">
                        ${studyOptions}
                    </select>
                </div>
            </div>
            <div id="praesentation-content-area" class="row g-3">
                 <p class="text-muted">Präsentationsdaten werden geladen...</p>
            </div>`;
        return html;
    }

    function renderPublikationTab(currentLang, currentSection, currentBfMetric) {
        return uiComponents.createPublikationTabHeader();
    }
    
    function renderExportTab(currentKollektiv) {
        return uiComponents.createExportOptions(currentKollektiv);
    }


    return Object.freeze({
        initialize,
        renderTabContent,
        renderDatenTab,
        renderAuswertungTab,
        renderStatistikTab,
        renderPraesentationTab,
        renderPublikationTab,
        renderExportTab
    });
})();
