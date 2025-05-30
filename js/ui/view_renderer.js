const viewRenderer = (() => {
    const initializedTabs = new Set();

    function _initializeTab(tabId, rendererFunction, ...args) {
        const tabPane = document.getElementById(tabId);
        if (tabPane && !initializedTabs.has(tabId)) {
            rendererFunction(...args);
            initializedTabs.add(tabId);
        } else if (tabPane && initializedTabs.has(tabId) && rendererFunction) {
            rendererFunction(...args); // Re-render if needed on subsequent calls
        }
    }

    function renderDatenTab(data, sortState) {
        const tableBody = document.getElementById('daten-table-body');
        const paginationContainer = document.getElementById('daten-pagination-container');
        const itemsPerPage = APP_CONFIG.UI_SETTINGS.DEFAULT_TABLE_ROWS_PER_PAGE;
        const totalPages = Math.ceil(data.length / itemsPerPage);
        const currentPage = state.getCurrentDatenTablePage();

        if (tableBody) {
            tableBody.innerHTML = '';
            const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
            paginatedData.forEach(patient => {
                if (typeof tableRenderer !== 'undefined') {
                    tableBody.innerHTML += tableRenderer.createDatenTableRow(patient);
                }
            });
            ui_helpers.attachRowCollapseListeners(tableBody);
            ui_helpers.updateSortIcons('daten-table-header', sortState);
            ui_helpers.initializeTooltips(tableBody);
        }
        if (typeof paginationManager !== 'undefined' && paginationContainer) {
             paginationContainer.innerHTML = paginationManager.createPaginationControls('daten', currentPage, totalPages);
             paginationManager.attachPaginationEventListeners('daten', totalPages, (newPage) => {
                state.setCurrentDatenTablePage(newPage);
                renderDatenTab(data, sortState); // Re-render with new page
             });
        }
    }

    function renderAuswertungTab(data, appliedCriteria, appliedLogic, currentKollektiv, bfResults, bfWorkerAvailable) {
        const auswertungControlsContainer = document.getElementById('auswertung-t2-kriterien-controls-container');
        const auswertungTableBody = document.getElementById('auswertung-table-body');
        const t2MetricsOverviewContainer = document.getElementById('t2-metrics-overview-container');
        const bruteForceContainer = document.getElementById('brute-force-container');
        const paginationContainer = document.getElementById('auswertung-pagination-container');
        const itemsPerPage = APP_CONFIG.UI_SETTINGS.DEFAULT_TABLE_ROWS_PER_PAGE;
        const totalPages = Math.ceil(data.length / itemsPerPage);
        const currentPage = state.getCurrentAuswertungTablePage();

        if (auswertungControlsContainer && !initializedTabs.has('auswertung-tab-controls')) {
            if (typeof ui_components !== 'undefined') {
                auswertungControlsContainer.innerHTML = ui_components.createT2CriteriaControls(appliedCriteria, appliedLogic);
            }
            initializedTabs.add('auswertung-tab-controls');
        }
        ui_helpers.updateT2CriteriaControlsUI(appliedCriteria, appliedLogic);
        ui_helpers.markCriteriaSavedIndicator(state.getUnsavedCriteriaChanges());

        if (bruteForceContainer && !initializedTabs.has('auswertung-tab-bf')) {
            if (typeof ui_components !== 'undefined') {
                bruteForceContainer.innerHTML = ui_components.createBruteForceCard(currentKollektiv, bfWorkerAvailable);
            }
            initializedTabs.add('auswertung-tab-bf');
        }
        ui_helpers.updateBruteForceUI(bfResults?.status || 'idle', bfResults || {}, bfWorkerAvailable, currentKollektiv);


        if (t2MetricsOverviewContainer && typeof ui_components !== 'undefined') {
            const evaluatedData = typeof t2CriteriaManager !== 'undefined' ? t2CriteriaManager.evaluateDataset(cloneDeep(data), appliedCriteria, appliedLogic) : data;
            const perfStats = typeof statisticsService !== 'undefined' ? statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n') : null;
            t2MetricsOverviewContainer.innerHTML = ui_components.createT2MetricsOverview(perfStats, currentKollektiv);
        }

        if (auswertungTableBody && typeof tableRenderer !== 'undefined') {
            auswertungTableBody.innerHTML = '';
             const evaluatedDataForTable = typeof t2CriteriaManager !== 'undefined' ? t2CriteriaManager.evaluateDataset(cloneDeep(data), appliedCriteria, appliedLogic) : data;
             const paginatedData = evaluatedDataForTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
            paginatedData.forEach(patient => {
                auswertungTableBody.innerHTML += tableRenderer.createAuswertungTableRow(patient, appliedCriteria, appliedLogic);
            });
            ui_helpers.attachRowCollapseListeners(auswertungTableBody);
            ui_helpers.updateSortIcons('auswertung-table-header', state.getCurrentAuswertungTableSort() || APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT);
        }

        if (typeof paginationManager !== 'undefined' && paginationContainer) {
             paginationContainer.innerHTML = paginationManager.createPaginationControls('auswertung', currentPage, totalPages);
             paginationManager.attachPaginationEventListeners('auswertung', totalPages, (newPage) => {
                state.setCurrentAuswertungTablePage(newPage);
                renderAuswertungTab(data, appliedCriteria, appliedLogic, currentKollektiv, bfResults, bfWorkerAvailable);
             });
        }
        ui_helpers.initializeTooltips(document.getElementById('auswertung-tab-pane'));
    }

    function renderStatistikTab(currentKollektiv, statistikLayout, statistikKollektiv1, statistikKollektiv2) {
        const statistikControlsContainer = document.getElementById('statistik-controls-container');
        const spinner = document.getElementById('statistik-spinner');
        if (spinner) spinner.classList.remove('d-none');

        if (statistikControlsContainer && !initializedTabs.has('statistik-tab-controls')) {
            const selectOptions = ['Gesamt', 'direkt OP', 'nRCT'].map(k => `<option value="${k}" ${k === currentKollektiv ? 'selected' : ''}>${getKollektivDisplayName(k)}</option>`).join('');
            statistikControlsContainer.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-md-auto mb-2 mb-md-0">
                        <button class="btn btn-outline-primary btn-sm" id="statistik-toggle-vergleich" data-tippy-content="${TOOLTIP_CONTENT.statistikToggleVergleich.description}"><i class="fas fa-user-cog me-1"></i> Einzelansicht Aktiv</button>
                    </div>
                    <div class="col-md-auto mb-2 mb-md-0 d-none" id="statistik-kollektiv-select-1-container">
                        <label for="statistik-kollektiv-select-1" class="form-label form-label-smvisually-hidden">Kollektiv 1</label>
                        <select class="form-select form-select-sm" id="statistik-kollektiv-select-1" data-tippy-content="${TOOLTIP_CONTENT.statistikKollektiv1.description}">
                           ${selectOptions.replace(`value="${currentKollektiv}" selected`, `value="${statistikKollektiv1}" selected`)}
                        </select>
                    </div>
                    <div class="col-md-auto mb-2 mb-md-0 d-none" id="statistik-kollektiv-select-2-container">
                        <label for="statistik-kollektiv-select-2" class="form-label form-label-sm visually-hidden">Kollektiv 2</label>
                        <select class="form-select form-select-sm" id="statistik-kollektiv-select-2" data-tippy-content="${TOOLTIP_CONTENT.statistikKollektiv2.description}">
                            ${selectOptions.replace(`value="${currentKollektiv}" selected`, `value="${statistikKollektiv2}" selected`)}
                        </select>
                    </div>
                </div>`;
            initializedTabs.add('statistik-tab-controls');
        }
        ui_helpers.updateStatistikSelectorsUI(statistikLayout, statistikKollektiv1, statistikKollektiv2);

        if (typeof statistikTabLogic !== 'undefined') {
            statistikTabLogic.displayStatistics(
                state.getFilteredData(),
                statistikLayout,
                statistikKollektiv1,
                statistikKollektiv2,
                t2CriteriaManager.getAppliedCriteria(),
                t2CriteriaManager.getAppliedLogic()
            );
        }
        if (spinner) spinner.classList.add('d-none');
        ui_helpers.initializeTooltips(document.getElementById('statistik-tab-pane'));
    }

    function renderPraesentationTab(currentView, currentStudyId, currentGlobalKollektiv) {
        const praesControlsContainer = document.getElementById('praesentation-controls-container');
        const spinner = document.getElementById('praesentation-spinner');
        if(spinner) spinner.classList.remove('d-none');

        if (praesControlsContainer && !initializedTabs.has('praesentation-tab-controls')) {
            const studyOptions = studyT2CriteriaManager.getAvailableStudySets().map(set =>
                 `<option value="${set.id}" ${set.id === currentStudyId ? 'selected' : ''}>${set.name}</option>`
            ).join('');

            praesControlsContainer.innerHTML = `
                <div class="row align-items-center justify-content-center">
                    <div class="col-md-auto mb-2 mb-md-0">
                         <div class="btn-group btn-group-sm" role="group" aria-label="Präsentationsansicht wählen" data-tippy-content="${TOOLTIP_CONTENT.praesentation.viewSelect.description}">
                            <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as" value="as-pur" ${currentView === 'as-pur' ? 'checked' : ''} autocomplete="off">
                            <label class="btn btn-outline-primary" for="praes-ansicht-as">Avocado Sign (Performance)</label>
                            <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as-vs-t2" value="as-vs-t2" ${currentView === 'as-vs-t2' ? 'checked' : ''} autocomplete="off">
                            <label class="btn btn-outline-primary" for="praes-ansicht-as-vs-t2">AS vs. T2 (Vergleich)</label>
                        </div>
                    </div>
                    <div class="col-md-auto mb-2 mb-md-0" id="praes-study-select-container" style="display: ${currentView === 'as-vs-t2' ? '' : 'none'};">
                        <label for="praes-study-select" class="form-label form-label-sm visually-hidden">T2-Basis</label>
                        <select class="form-select form-select-sm" id="praes-study-select" data-tippy-content="${TOOLTIP_CONTENT.praesentation.studySelect.description}">
                            <option value="applied_criteria" ${'applied_criteria' === currentStudyId ? 'selected' : ''}>${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME}</option>
                            ${studyOptions}
                        </select>
                    </div>
                </div>`;
            initializedTabs.add('praesentation-tab-controls');
        }
        ui_helpers.updatePresentationViewSelectorUI(currentView);

        if (typeof praesentationTabLogic !== 'undefined') {
            const globalData = mainAppInterface.getGlobalData();
            const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
            const appliedLogic = t2CriteriaManager.getAppliedLogic();
            praesentationTabLogic.renderPresentation(globalData, currentView, currentStudyId, currentGlobalKollektiv, appliedCriteria, appliedLogic);
        }

        if(spinner) spinner.classList.add('d-none');
        ui_helpers.initializeTooltips(document.getElementById('praesentation-tab-pane'));
    }

    function renderPublikationTab(currentSection, currentLang, currentGlobalKollektiv) {
        const publikationTabPane = document.getElementById('publikation-tab-pane');
        const spinner = document.getElementById('publikation-spinner');
        if (spinner) spinner.classList.remove('d-none');

        if (publikationTabPane) {
            if (!initializedTabs.has('publikation-tab-header')) {
                 if (typeof ui_components !== 'undefined' && typeof ui_components.createPublikationTabHeader === 'function') {
                    publikationTabPane.innerHTML = ui_components.createPublikationTabHeader();
                 }
                 initializedTabs.add('publikation-tab-header');
            }

            const currentPublicationBFMetric = state.getCurrentPublikationBruteForceMetric();

            if (typeof publikationTabLogic !== 'undefined') {
                const globalData = mainAppInterface.getGlobalData();
                const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
                const appliedLogic = t2CriteriaManager.getAppliedLogic();
                const bfResults = bruteForceManager.getAllResults();

                publikationTabLogic.initializeData(globalData, appliedCriteria, appliedLogic, bfResults);
                ui_helpers.updatePublikationUI(currentLang, currentSection, currentPublicationBFMetric);

                const sectionToRender = currentSection || PUBLICATION_CONFIG.defaultSubSection;
                publikationTabLogic.getRenderedSectionContent(sectionToRender, currentLang, currentGlobalKollektiv);
                // Charts will be rendered after content is in DOM
                publikationTabLogic.updateDynamicChartsForPublicationTab(sectionToRender, currentLang, currentGlobalKollektiv);
            }
        }

        if (spinner) spinner.classList.add('d-none');
        ui_helpers.initializeTooltips(publikationTabPane);
    }

    function renderExportTab(currentKollektiv) {
        const exportContainer = document.getElementById('export-options-container');
        if (exportContainer && !initializedTabs.has('export-tab-content')) {
            if (typeof ui_components !== 'undefined') {
                exportContainer.innerHTML = ui_components.createExportOptions(currentKollektiv);
            }
            initializedTabs.add('export-tab-content');
        } else if (exportContainer && initializedTabs.has('export-tab-content')) {
            // Update dynamic parts if needed, e.g., if currentKollektiv changes filename examples
            // For now, re-rendering the whole options might be simpler if kollektiv affects more.
            // Or more selectively update:
            const exportDescEl = exportContainer.querySelector('.small.text-muted.mb-3');
            if(exportDescEl) exportDescEl.innerHTML = TOOLTIP_CONTENT.exportTab.description.replace('[KOLLEKTIV]', `<strong>${getKollektivDisplayName(currentKollektiv)}</strong>`);
        }

        if (typeof exportService !== 'undefined') {
            const hasBruteForceResults = bruteForceManager.hasAnyResults();
            const canExportDataDependent = mainAppInterface.getGlobalData()?.length > 0;
            ui_helpers.updateExportButtonStates(state.getActiveTabId(), hasBruteForceResults, canExportDataDependent);
        }
        ui_helpers.initializeTooltips(document.getElementById('export-tab-pane'));
    }


    function showTab(tabId) {
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
            if (typeof ui_helpers !== 'undefined') {
                ui_helpers.updateExportButtonStates(tabId, bruteForceManager.hasAnyResults(), mainAppInterface.getGlobalData()?.length > 0);
            }
            setTimeout(() => { // ensure content is visible for Tippy
               if (document.getElementById(tabId)) ui_helpers.initializeTooltips(document.getElementById(tabId));
            }, 100);
        } else {
            console.warn(`Tab mit ID '${tabId}' oder zugehöriger Nav-Link nicht gefunden.`);
        }
    }


    function refreshCurrentTab(activeTabId = state.getActiveTabId(), isTabSwitch = false) {
        const currentKollektiv = state.getCurrentKollektiv();
        if (typeof mainAppInterface === 'undefined' || !mainAppInterface.getGlobalData()) {
            console.warn("mainAppInterface oder globale Daten nicht verfügbar in refreshCurrentTab.");
            return;
        }
        const globalData = mainAppInterface.getGlobalData();
        const filteredData = dataProcessor.filterDataByKollektiv(globalData, currentKollektiv);

        switch (activeTabId) {
            case 'daten-tab-pane':
                const datenSortState = state.getCurrentDatenTableSort();
                const sortedData = dataProcessor.sortData(filteredData, datenSortState.key, datenSortState.direction, datenSortState.subKey);
                renderDatenTab(sortedData, datenSortState);
                break;
            case 'auswertung-tab-pane':
                const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
                const appliedLogic = t2CriteriaManager.getAppliedLogic();
                const bfResults = bruteForceManager.getAllResultsForKollektiv(currentKollektiv) || bruteForceManager.getGlobalStatus();
                const auswertungSortState = state.getCurrentAuswertungTableSort();
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
        }
         if (!isTabSwitch) {
             if (document.getElementById(activeTabId)) ui_helpers.initializeTooltips(document.getElementById(activeTabId));
         }
    }


    return Object.freeze({
        renderDatenTab,
        renderAuswertungTab,
        renderStatistikTab,
        renderPraesentationTab,
        renderPublikationTab,
        renderExportTab,
        showTab,
        refreshCurrentTab
    });

})();
