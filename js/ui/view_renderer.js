const viewRenderer = (() => {
    const initializedTabs = new Set();

    function _checkDependencies(functionName, requiredModules) {
        for (const moduleName in requiredModules) {
            if (typeof requiredModules[moduleName] === 'undefined' || requiredModules[moduleName] === null) {
                console.error(`viewRenderer.${functionName}: Abhängigkeit '${moduleName}' ist nicht verfügbar.`);
                return false;
            }
            if (typeof requiredModules[moduleName] === 'object' && requiredModules[moduleName] !== null) {
                for(const method in requiredModules[moduleName].methods) {
                    if(typeof requiredModules[moduleName].obj[method] !== 'function'){
                         console.error(`viewRenderer.${functionName}: Methode '${method}' von Abhängigkeit '${moduleName}' ist nicht verfügbar.`);
                         return false;
                    }
                }
            }
        }
        return true;
    }

    function renderDatenTab(data, sortState) {
        const deps = { APP_CONFIG, state, tableRenderer, ui_helpers, paginationManager, mainAppInterface };
        if (!_checkDependencies('renderDatenTab', deps)) return;

        const tableBody = document.getElementById('daten-table-body');
        const paginationContainer = document.getElementById('daten-pagination-container');
        const itemsPerPage = APP_CONFIG.UI_SETTINGS?.DEFAULT_TABLE_ROWS_PER_PAGE || 50;
        const totalPages = Array.isArray(data) ? Math.ceil(data.length / itemsPerPage) : 0;
        const currentPage = state.getCurrentDatenTablePage() || 1;

        if (!tableBody) { console.error("viewRenderer.renderDatenTab: tableBody 'daten-table-body' nicht gefunden."); return; }
        tableBody.innerHTML = '';
        if (Array.isArray(data) && data.length > 0) {
            const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
            paginatedData.forEach(patient => {
                tableBody.innerHTML += tableRenderer.createDatenTableRow(patient);
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Keine Daten im ausgewählten Kollektiv gefunden.</td></tr>`;
        }
        ui_helpers.attachRowCollapseListeners(tableBody);
        ui_helpers.updateSortIcons('daten-table-header', sortState);
        ui_helpers.initializeTooltips(tableBody);

        if (!paginationContainer) { console.warn("viewRenderer.renderDatenTab: paginationContainer 'daten-pagination-container' nicht gefunden."); }
        else {
            paginationContainer.innerHTML = paginationManager.createPaginationControls('daten', currentPage, totalPages);
            paginationManager.attachPaginationEventListeners('daten', totalPages, (newPage) => {
                state.setCurrentDatenTablePage(newPage);
                mainAppInterface.refreshCurrentTab();
            });
        }
    }

    function renderAuswertungTab(data, appliedCriteria, appliedLogic, currentKollektiv, bfResults, bfWorkerAvailable) {
        const deps = { APP_CONFIG, state, ui_components, ui_helpers, t2CriteriaManager, statisticsService, tableRenderer, paginationManager, mainAppInterface, cloneDeep };
        if (!_checkDependencies('renderAuswertungTab', deps)) return;

        const auswertungControlsContainer = document.getElementById('auswertung-t2-kriterien-controls-container');
        const auswertungTableBody = document.getElementById('auswertung-table-body');
        const t2MetricsOverviewContainer = document.getElementById('t2-metrics-overview-container');
        const bruteForceContainer = document.getElementById('brute-force-container');
        const paginationContainer = document.getElementById('auswertung-pagination-container');
        const itemsPerPage = APP_CONFIG.UI_SETTINGS?.DEFAULT_TABLE_ROWS_PER_PAGE || 50;
        const totalPages = Array.isArray(data) ? Math.ceil(data.length / itemsPerPage) : 0;
        const currentPage = state.getCurrentAuswertungTablePage() || 1;
        const auswertungTabPane = document.getElementById('auswertung-tab-pane');

        if (auswertungControlsContainer && !initializedTabs.has('auswertung-tab-controls')) {
            auswertungControlsContainer.innerHTML = ui_components.createT2CriteriaControls(appliedCriteria, appliedLogic);
            initializedTabs.add('auswertung-tab-controls');
        } else if (!auswertungControlsContainer) { console.error("viewRenderer.renderAuswertungTab: auswertungControlsContainer nicht gefunden."); }

        ui_helpers.updateT2CriteriaControlsUI(appliedCriteria, appliedLogic);
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());

        if (bruteForceContainer && !initializedTabs.has('auswertung-tab-bf')) {
            bruteForceContainer.innerHTML = ui_components.createBruteForceCard(currentKollektiv, bfWorkerAvailable);
            initializedTabs.add('auswertung-tab-bf');
        } else if (!bruteForceContainer) { console.error("viewRenderer.renderAuswertungTab: bruteForceContainer nicht gefunden."); }
        ui_helpers.updateBruteForceUI(bfResults?.status || 'idle', bfResults || {}, bfWorkerAvailable, currentKollektiv);

        if (t2MetricsOverviewContainer) {
            const evaluatedData = t2CriteriaManager.evaluateDataset(cloneDeep(data), appliedCriteria, appliedLogic);
            const perfStats = statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n');
            t2MetricsOverviewContainer.innerHTML = ui_components.createT2MetricsOverview(perfStats, currentKollektiv);
        } else { console.warn("viewRenderer.renderAuswertungTab: t2MetricsOverviewContainer nicht gefunden."); }

        if (auswertungTableBody) {
            auswertungTableBody.innerHTML = '';
            const evaluatedDataForTable = t2CriteriaManager.evaluateDataset(cloneDeep(data), appliedCriteria, appliedLogic);
            if (Array.isArray(evaluatedDataForTable) && evaluatedDataForTable.length > 0) {
                const paginatedData = evaluatedDataForTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                paginatedData.forEach(patient => {
                    auswertungTableBody.innerHTML += tableRenderer.createAuswertungTableRow(patient, appliedCriteria, appliedLogic);
                });
            } else {
                 auswertungTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Keine Patienten im ausgewählten Kollektiv gefunden.</td></tr>`;
            }
            ui_helpers.attachRowCollapseListeners(auswertungTableBody);
            const defaultSort = APP_CONFIG.DEFAULT_SETTINGS?.AUSWERTUNG_TABLE_SORT || { key: 'nr', direction: 'asc', subKey: null };
            ui_helpers.updateSortIcons('auswertung-table-header', state.getCurrentAuswertungTableSort() || defaultSort);
        } else { console.error("viewRenderer.renderAuswertungTab: auswertungTableBody nicht gefunden."); }

        if (paginationContainer) {
             paginationContainer.innerHTML = paginationManager.createPaginationControls('auswertung', currentPage, totalPages);
             paginationManager.attachPaginationEventListeners('auswertung', totalPages, (newPage) => {
                state.setCurrentAuswertungTablePage(newPage);
                mainAppInterface.refreshCurrentTab();
             });
        } else { console.warn("viewRenderer.renderAuswertungTab: auswertung-pagination-container nicht gefunden.");}

        if (auswertungTabPane) ui_helpers.initializeTooltips(auswertungTabPane);
    }

    function renderStatistikTab(currentKollektiv, statistikLayout, statistikKollektiv1, statistikKollektiv2) {
        const deps = { TOOLTIP_CONTENT, getKollektivDisplayName, ui_helpers, statistikTabLogic, mainAppInterface, t2CriteriaManager, state };
        if (!_checkDependencies('renderStatistikTab', deps)) return;

        const statistikControlsContainer = document.getElementById('statistik-controls-container');
        const spinner = document.getElementById('statistik-spinner');
        const statistikTabPane = document.getElementById('statistik-tab-pane');

        if (spinner) spinner.classList.remove('d-none');

        if (statistikControlsContainer && !initializedTabs.has('statistik-tab-controls')) {
            const kollektivOptions = ['Gesamt', 'direkt OP', 'nRCT'];
            const getDisplayNameFunc = getKollektivDisplayName;
            const selectOptionsHTML = kollektivOptions.map(k => `<option value="${k}">${getDisplayNameFunc(k)}</option>`).join('');
            const toggleButtonTooltip = TOOLTIP_CONTENT.statistikToggleVergleich?.description || 'Layout umschalten';
            const kollektiv1Tooltip = TOOLTIP_CONTENT.statistikKollektiv1?.description || 'Kollektiv 1 wählen';
            const kollektiv2Tooltip = TOOLTIP_CONTENT.statistikKollektiv2?.description || 'Kollektiv 2 wählen';

            statistikControlsContainer.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-md-auto mb-2 mb-md-0">
                        <button class="btn btn-outline-primary btn-sm" id="statistik-toggle-vergleich" data-tippy-content="${toggleButtonTooltip}"><i class="fas fa-user-cog me-1"></i> Einzelansicht Aktiv</button>
                    </div>
                    <div class="col-md-auto mb-2 mb-md-0 d-none" id="statistik-kollektiv-select-1-container">
                        <label for="statistik-kollektiv-select-1" class="form-label form-label-sm visually-hidden">Kollektiv 1</label>
                        <select class="form-select form-select-sm" id="statistik-kollektiv-select-1" data-tippy-content="${kollektiv1Tooltip}">${selectOptionsHTML}</select>
                    </div>
                    <div class="col-md-auto mb-2 mb-md-0 d-none" id="statistik-kollektiv-select-2-container">
                        <label for="statistik-kollektiv-select-2" class="form-label form-label-sm visually-hidden">Kollektiv 2</label>
                        <select class="form-select form-select-sm" id="statistik-kollektiv-select-2" data-tippy-content="${kollektiv2Tooltip}">${selectOptionsHTML}</select>
                    </div>
                </div>`;
            initializedTabs.add('statistik-tab-controls');
        } else if (!statistikControlsContainer) { console.error("viewRenderer.renderStatistikTab: statistikControlsContainer nicht gefunden."); }

        ui_helpers.updateStatistikSelectorsUI(statistikLayout, statistikKollektiv1, statistikKollektiv2);
        statistikTabLogic.displayStatistics(mainAppInterface.getGlobalData(), statistikLayout, statistikKollektiv1, statistikKollektiv2, t2CriteriaManager.getAppliedT2Criteria(), t2CriteriaManager.getAppliedT2Logic());

        if (spinner) spinner.classList.add('d-none');
        if (statistikTabPane) ui_helpers.initializeTooltips(statistikTabPane);
    }

    function renderPraesentationTab(currentView, currentStudyId, currentGlobalKollektiv) {
        const deps = { APP_CONFIG, TOOLTIP_CONTENT, studyT2CriteriaManager, ui_helpers, praesentationTabLogic, mainAppInterface, t2CriteriaManager };
        if (!_checkDependencies('renderPraesentationTab', deps)) return;

        const praesControlsContainer = document.getElementById('praesentation-controls-container');
        const spinner = document.getElementById('praesentation-spinner');
        const praesentationTabPane = document.getElementById('praesentation-tab-pane');

        if(spinner) spinner.classList.remove('d-none');

        if (praesControlsContainer && !initializedTabs.has('praesentation-tab-controls')) {
            const studyOptions = studyT2CriteriaManager.getAllStudyCriteriaSets().map(set => `<option value="${set.id}" ${set.id === currentStudyId ? 'selected' : ''}>${set.name || set.id}</option>`).join('');
            const appliedCriteriaDisplayName = APP_CONFIG.SPECIAL_IDS?.APPLIED_CRITERIA_DISPLAY_NAME || "Eingestellte Kriterien";
            const appliedCriteriaId = APP_CONFIG.SPECIAL_IDS?.APPLIED_CRITERIA_STUDY_ID || "applied_criteria";
            const viewSelectTooltip = TOOLTIP_CONTENT.praesentation?.viewSelect?.description || 'Ansicht wählen';
            const studySelectTooltip = TOOLTIP_CONTENT.praesentation?.studySelect?.description || 'T2-Basis wählen';

            praesControlsContainer.innerHTML = `
                <div class="row align-items-center justify-content-center">
                    <div class="col-md-auto mb-2 mb-md-0">
                         <div class="btn-group btn-group-sm" role="group" aria-label="Präsentationsansicht wählen" data-tippy-content="${viewSelectTooltip}">
                            <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as" value="as-pur" ${currentView === 'as-pur' ? 'checked' : ''} autocomplete="off">
                            <label class="btn btn-outline-primary" for="praes-ansicht-as">Avocado Sign (Performance)</label>
                            <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as-vs-t2" value="as-vs-t2" ${currentView === 'as-vs-t2' ? 'checked' : ''} autocomplete="off">
                            <label class="btn btn-outline-primary" for="praes-ansicht-as-vs-t2">AS vs. T2 (Vergleich)</label>
                        </div>
                    </div>
                    <div class="col-md-auto mb-2 mb-md-0" id="praes-study-select-container" style="display: ${currentView === 'as-vs-t2' ? '' : 'none'};">
                        <label for="praes-study-select" class="form-label form-label-sm visually-hidden">T2-Basis</label>
                        <select class="form-select form-select-sm" id="praes-study-select" data-tippy-content="${studySelectTooltip}">
                            <option value="${appliedCriteriaId}" ${appliedCriteriaId === currentStudyId ? 'selected' : ''}>${appliedCriteriaDisplayName}</option>
                            ${studyOptions}
                        </select>
                    </div>
                </div>`;
            initializedTabs.add('praesentation-tab-controls');
        } else if (!praesControlsContainer) { console.error("viewRenderer.renderPraesentationTab: praesControlsContainer nicht gefunden."); }

        ui_helpers.updatePresentationViewSelectorUI(currentView);
        const globalData = mainAppInterface.getGlobalData();
        const appliedCriteria = t2CriteriaManager.getAppliedT2Criteria();
        const appliedLogic = t2CriteriaManager.getAppliedT2Logic();
        praesentationTabLogic.renderPresentation(globalData, currentView, currentStudyId, currentGlobalKollektiv, appliedCriteria, appliedLogic);

        if(spinner) spinner.classList.add('d-none');
        if (praesentationTabPane) ui_helpers.initializeTooltips(praesentationTabPane);
    }

    function renderPublikationTab(currentSection, currentLang, currentGlobalKollektiv) {
        const deps = { state, PUBLICATION_CONFIG, UI_TEXTS, TOOLTIP_CONTENT, ui_components, publikationTabLogic, mainAppInterface, t2CriteriaManager, bruteForceManager, ui_helpers };
        if (!_checkDependencies('renderPublikationTab', deps)) return;

        const publikationTabPane = document.getElementById('publikation-tab-pane');
        const spinner = document.getElementById('publikation-spinner');
        if (spinner) spinner.classList.remove('d-none');

        if (publikationTabPane) {
            if (!initializedTabs.has('publikation-tab-header')) {
                publikationTabPane.innerHTML = ui_components.createPublikationTabHeader();
                initializedTabs.add('publikation-tab-header');
            }
            const currentPublicationBFMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
            const globalData = mainAppInterface.getGlobalData();
            const appliedCriteria = t2CriteriaManager.getAppliedT2Criteria();
            const appliedLogic = t2CriteriaManager.getAppliedT2Logic();
            const bfResults = bruteForceManager.getAllResults();

            publikationTabLogic.initializeData(globalData, appliedCriteria, appliedLogic, bfResults);
            ui_helpers.updatePublikationUI(currentLang, currentSection, currentPublicationBFMetric);
            const sectionToRender = currentSection || PUBLICATION_CONFIG.defaultSubSection;
            publikationTabLogic.getRenderedSectionContent(sectionToRender, currentLang, currentGlobalKollektiv);
            if(typeof publikationTabLogic.updateDynamicChartsForPublicationTab === 'function') {
                publikationTabLogic.updateDynamicChartsForPublicationTab(sectionToRender, currentLang, currentGlobalKollektiv);
            }
        } else { console.error("viewRenderer.renderPublikationTab: publikationTabPane nicht gefunden."); }

        if (spinner) spinner.classList.add('d-none');
        if (publikationTabPane) ui_helpers.initializeTooltips(publikationTabPane);
    }

    function renderExportTab(currentKollektiv) {
        const deps = { ui_components, TOOLTIP_CONTENT, getKollektivDisplayName, exportService, bruteForceManager, mainAppInterface, ui_helpers, state };
        if (!_checkDependencies('renderExportTab', deps)) return;

        const exportContainer = document.getElementById('export-options-container');
        const exportTabPane = document.getElementById('export-tab-pane');

        if (exportContainer && !initializedTabs.has('export-tab-content')) {
            exportContainer.innerHTML = ui_components.createExportOptions(currentKollektiv);
            initializedTabs.add('export-tab-content');
        } else if (exportContainer && initializedTabs.has('export-tab-content')) {
            const exportDescEl = exportContainer.querySelector('.small.text-muted.mb-3');
            if(exportDescEl) exportDescEl.innerHTML = TOOLTIP_CONTENT.exportTab.description.replace('[KOLLEKTIV]', `<strong>${getKollektivDisplayName(currentKollektiv)}</strong>`);
        } else if (!exportContainer) { console.error("viewRenderer.renderExportTab: exportContainer nicht gefunden."); }

        const hasBruteForceResults = bruteForceManager.hasAnyResults ? bruteForceManager.hasAnyResults() : Object.keys(bruteForceManager.getAllResults() || {}).length > 0;
        const canExportDataDependent = (mainAppInterface.getGlobalData()?.length ?? 0) > 0;
        ui_helpers.updateExportButtonStates(state.getActiveTabId(), hasBruteForceResults, canExportDataDependent);
        if (exportTabPane) ui_helpers.initializeTooltips(exportTabPane);
    }

    function showTab(tabId) {
        const deps = { state, ui_helpers, bruteForceManager, mainAppInterface };
        if (!_checkDependencies('showTab', deps)) return;

        const tabPanes = document.querySelectorAll('.tab-pane');
        const navLinks = document.querySelectorAll('.nav-tabs .nav-link, .nav-pills .nav-link');
        let targetTabPane = null;
        let targetNavLink = null;

        tabPanes.forEach(pane => {
            const paneIsTarget = pane.id === tabId;
            pane.classList.toggle('show', paneIsTarget);
            pane.classList.toggle('active', paneIsTarget);
            if (paneIsTarget) targetTabPane = pane;
        });
        navLinks.forEach(link => {
            const linkIsTarget = link.dataset.bsTarget === `#${tabId}`;
            link.classList.toggle('active', linkIsTarget);
            link.setAttribute('aria-selected', String(linkIsTarget));
            if (linkIsTarget) targetNavLink = link;
        });

        if (targetNavLink && targetTabPane) {
            state.setActiveTabId(tabId);
            refreshCurrentTab(tabId, true);
            const hasBruteForceResults = bruteForceManager.hasAnyResults ? bruteForceManager.hasAnyResults() : Object.keys(bruteForceManager.getAllResults() || {}).length > 0;
            ui_helpers.updateExportButtonStates(tabId, hasBruteForceResults, (mainAppInterface.getGlobalData()?.length ?? 0) > 0);
            setTimeout(() => {
               const currentTabElement = document.getElementById(tabId);
               if (currentTabElement) ui_helpers.initializeTooltips(currentTabElement);
            }, 150);
        } else {
            console.warn(`viewRenderer.showTab: Tab mit ID '${tabId}' oder zugehöriger Nav-Link nicht gefunden.`);
        }
    }

    function refreshCurrentTab(activeTabIdParam = null, isTabSwitch = false) {
        const activeTabId = activeTabIdParam || (typeof state !== 'undefined' ? state.getActiveTabId() : null);
        const deps = { state, APP_CONFIG, mainAppInterface, dataProcessor, t2CriteriaManager, bruteForceManager, ui_helpers };
         if (!activeTabId) { console.warn("viewRenderer.refreshCurrentTab: Keine aktive Tab-ID verfügbar."); return; }
        if (!_checkDependencies('refreshCurrentTab', deps)) {
            if (isTabSwitch) {
                const targetPane = document.getElementById(activeTabId);
                if (targetPane) targetPane.innerHTML = "<p class='text-danger p-3'>Fehler beim Laden der Tab-Daten: Abhängigkeiten fehlen.</p>";
            }
            return;
        }

        const currentKollektiv = state.getCurrentKollektiv() || APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
        const globalData = mainAppInterface.getGlobalData();
        const filteredData = dataProcessor.filterDataByKollektiv(globalData, currentKollektiv);

        switch (activeTabId) {
            case 'daten-tab-pane':
                const datenSortState = state.getCurrentDatenTableSort() || APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT;
                const sortedData = dataProcessor.sortData(filteredData, datenSortState.key, datenSortState.direction, datenSortState.subKey);
                renderDatenTab(sortedData, datenSortState);
                break;
            case 'auswertung-tab-pane':
                const appliedCriteria = t2CriteriaManager.getAppliedT2Criteria();
                const appliedLogic = t2CriteriaManager.getAppliedT2Logic();
                const bfResults = bruteForceManager.getResultsForKollektiv(currentKollektiv) || bruteForceManager.getAllResults()?.[currentKollektiv] || { status: 'idle' };
                const auswertungSortState = state.getCurrentAuswertungTableSort() || APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT;
                const sortedAuswertungData = dataProcessor.sortData(filteredData, auswertungSortState.key, auswertungSortState.direction, auswertungSortState.subKey);
                renderAuswertungTab(sortedAuswertungData, appliedCriteria, appliedLogic, currentKollektiv, bfResults, bruteForceManager.isWorkerAvailable());
                break;
            case 'statistik-tab-pane':
                renderStatistikTab(currentKollektiv, state.getCurrentStatistikLayout(), state.getCurrentStatistikKollektiv1(), state.getCurrentStatistikKollektiv2());
                break;
            case 'praesentation-tab-pane':
                renderPraesentationTab(state.getCurrentPresentationView(), state.getCurrentPresentationStudyId(), currentKollektiv);
                break;
            case 'publikation-tab-pane':
                renderPublikationTab(state.getCurrentPublikationSection(), state.getCurrentPublikationLang(), currentKollektiv);
                break;
            case 'export-tab-pane':
                renderExportTab(currentKollektiv);
                break;
            default:
                console.warn(`viewRenderer.refreshCurrentTab: Unbekannte Tab-ID '${activeTabId}'`);
        }
         if (!isTabSwitch) {
             const activeTabElement = document.getElementById(activeTabId);
             if (activeTabElement) ui_helpers.initializeTooltips(activeTabElement);
         }
    }

    return Object.freeze({
        showTab,
        refreshCurrentTab
    });

})();
