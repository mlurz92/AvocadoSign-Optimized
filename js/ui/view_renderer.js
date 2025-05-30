const viewRenderer = (() => {
    const initializedTabs = new Set();

    function _initializeTab(tabId, rendererFunction, ...args) {
        const tabPane = document.getElementById(tabId);
        if (tabPane && (!initializedTabs.has(tabId) || rendererFunction === renderAuswertungTab || rendererFunction === renderPublikationTab || rendererFunction === renderDatenTab || rendererFunction === renderStatistikTab || rendererFunction === renderPraesentationTab || rendererFunction === renderExportTab ) ) { // Auswertung, Publikation, Daten etc. immer neu rendern, da dynamisch
            if (rendererFunction) {
                rendererFunction(...args);
            }
            if (tabId !== 'auswertung-tab-pane' && tabId !== 'publikation-tab-pane' && tabId !== 'daten-tab-pane' && tabId !== 'statistik-tab-pane' && tabId !== 'praesentation-tab-pane' && tabId !== 'export-tab-pane') { // Controls etc. nur einmal initialisieren
                 initializedTabs.add(tabId);
            }
        } else if (tabPane && initializedTabs.has(tabId) && rendererFunction) {
            // No re-render for already initialized static tabs,
            // but dynamic tabs handled above.
        }
    }

    function renderDatenTab(data, sortState) {
        const tableBody = document.getElementById('daten-table-body');
        const paginationContainer = document.getElementById('daten-pagination-container');
        const itemsPerPage = APP_CONFIG.UI_SETTINGS.DEFAULT_TABLE_ROWS_PER_PAGE;
        const totalPages = Math.ceil(data.length / itemsPerPage);
        const currentPage = state.getCurrentDatenTablePage();

        if (tableBody && typeof tableRenderer !== 'undefined') {
            tableBody.innerHTML = '';
            const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
            paginatedData.forEach(patient => {
                tableBody.innerHTML += tableRenderer.createDatenTableRow(patient);
            });
            ui_helpers.attachRowCollapseListeners(tableBody);
            ui_helpers.updateSortIcons('daten-table-header', sortState);
        }

        if (paginationContainer && typeof ui_helpers !== 'undefined') {
            paginationContainer.innerHTML = ui_helpers.createPaginationControlsHTML('daten', currentPage, totalPages);
            paginationContainer.querySelectorAll('.page-nav-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (button.parentElement.classList.contains('disabled') || button.parentElement.classList.contains('active')) return;
                    
                    const target = event.currentTarget;
                    let newPage = currentPage;
                    const pageAction = target.dataset.pageAction;
                    const pageNumber = target.dataset.pageNumber;

                    if (pageAction === 'prev') {
                        newPage = Math.max(1, currentPage - 1);
                    } else if (pageAction === 'next') {
                        newPage = Math.min(totalPages, currentPage + 1);
                    } else if (pageNumber) {
                        newPage = parseInt(pageNumber, 10);
                    }

                    if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
                        state.setCurrentDatenTablePage(newPage);
                        if (typeof mainAppInterface !== 'undefined') {
                            mainAppInterface.refreshCurrentTab('daten-tab-pane');
                        }
                    }
                });
            });
            ui_helpers.initializeTooltips(paginationContainer);
        }
        if (tableBody) ui_helpers.initializeTooltips(tableBody);
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

        if (auswertungControlsContainer && !initializedTabs.has('auswertung-tab-controls-init')) {
            if (typeof ui_components !== 'undefined') {
                auswertungControlsContainer.innerHTML = ui_components.createT2CriteriaControls(appliedCriteria, appliedLogic);
            }
            initializedTabs.add('auswertung-tab-controls-init');
        }
        ui_helpers.updateT2CriteriaControlsUI(appliedCriteria, appliedLogic);
        ui_helpers.markCriteriaSavedIndicator(state.getUnsavedCriteriaChanges());

        if (bruteForceContainer && !initializedTabs.has('auswertung-tab-bf-init')) {
            if (typeof ui_components !== 'undefined') {
                bruteForceContainer.innerHTML = ui_components.createBruteForceCard(currentKollektiv, bfWorkerAvailable);
            }
            initializedTabs.add('auswertung-tab-bf-init');
        }
        ui_helpers.updateBruteForceUI(bfResults?.status || 'idle', bfResults || {}, bfWorkerAvailable, currentKollektiv);


        if (t2MetricsOverviewContainer && typeof ui_components !== 'undefined' && typeof statisticsService !== 'undefined' && typeof t2CriteriaManager !== 'undefined') {
            const evaluatedData = t2CriteriaManager.evaluateDataset(cloneDeep(data), appliedCriteria, appliedLogic);
            const perfStats = statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n');
            t2MetricsOverviewContainer.innerHTML = ui_components.createT2MetricsOverview(perfStats, currentKollektiv);
        }

        if (auswertungTableBody && typeof tableRenderer !== 'undefined' && typeof t2CriteriaManager !== 'undefined') {
            auswertungTableBody.innerHTML = '';
             const evaluatedDataForTable = t2CriteriaManager.evaluateDataset(cloneDeep(data), appliedCriteria, appliedLogic);
             const paginatedData = evaluatedDataForTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
            paginatedData.forEach(patient => {
                auswertungTableBody.innerHTML += tableRenderer.createAuswertungTableRow(patient, appliedCriteria, appliedLogic);
            });
            ui_helpers.attachRowCollapseListeners(auswertungTableBody);
            ui_helpers.updateSortIcons('auswertung-table-header', state.getCurrentAuswertungTableSort() || APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT);
        }

        if (paginationContainer && typeof ui_helpers !== 'undefined') {
             paginationContainer.innerHTML = ui_helpers.createPaginationControlsHTML('auswertung', currentPage, totalPages);
             paginationContainer.querySelectorAll('.page-nav-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (button.parentElement.classList.contains('disabled') || button.parentElement.classList.contains('active')) return;

                    const target = event.currentTarget;
                    let newPage = currentPage;
                     const pageAction = target.dataset.pageAction;
                    const pageNumber = target.dataset.pageNumber;

                    if (pageAction === 'prev') {
                        newPage = Math.max(1, currentPage - 1);
                    } else if (pageAction === 'next') {
                        newPage = Math.min(totalPages, currentPage + 1);
                    } else if (pageNumber) {
                        newPage = parseInt(pageNumber, 10);
                    }

                    if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
                        state.setCurrentAuswertungTablePage(newPage);
                         if (typeof mainAppInterface !== 'undefined') {
                            mainAppInterface.refreshCurrentTab('auswertung-tab-pane');
                        }
                    }
                });
            });
            ui_helpers.initializeTooltips(paginationContainer);
        }
        if (document.getElementById('auswertung-tab-pane')) ui_helpers.initializeTooltips(document.getElementById('auswertung-tab-pane'));
    }

    function renderStatistikTab(currentKollektiv, statistikLayout, statistikKollektiv1, statistikKollektiv2) {
        const statistikControlsContainer = document.getElementById('statistik-controls-container');
        const spinner = document.getElementById('statistik-spinner');
        if (spinner) spinner.classList.remove('d-none');

        if (statistikControlsContainer && !initializedTabs.has('statistik-tab-controls-init')) {
            const selectOptions = ['Gesamt', 'direkt OP', 'nRCT'].map(k => `<option value="${k}" ${k === currentKollektiv ? 'selected' : ''}>${getKollektivDisplayName(k)}</option>`).join('');
            statistikControlsContainer.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-md-auto mb-2 mb-md-0">
                        <button class="btn btn-outline-primary btn-sm" id="statistik-toggle-vergleich" data-tippy-content="${TOOLTIP_CONTENT.statistikToggleVergleich.description}"><i class="fas fa-user-cog me-1"></i> Einzelansicht Aktiv</button>
                    </div>
                    <div class="col-md-auto mb-2 mb-md-0 d-none" id="statistik-kollektiv-select-1-container">
                        <label for="statistik-kollektiv-select-1" class="form-label form-label-sm visually-hidden">Kollektiv 1</label>
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
            initializedTabs.add('statistik-tab-controls-init');
        }
        ui_helpers.updateStatistikSelectorsUI(statistikLayout, statistikKollektiv1, statistikKollektiv2);

        if (typeof statistikTabLogic !== 'undefined' && typeof state !== 'undefined' && typeof t2CriteriaManager !== 'undefined' && typeof mainAppInterface !== 'undefined') {
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
        if (document.getElementById('statistik-tab-pane')) ui_helpers.initializeTooltips(document.getElementById('statistik-tab-pane'));
    }

    function renderPraesentationTab(currentView, currentStudyId, currentGlobalKollektiv) {
        const praesControlsContainer = document.getElementById('praesentation-controls-container');
        const spinner = document.getElementById('praesentation-spinner');
        if(spinner) spinner.classList.remove('d-none');

        if (praesControlsContainer && !initializedTabs.has('praesentation-tab-controls-init')) {
             if (typeof studyT2CriteriaManager !== 'undefined') {
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
                initializedTabs.add('praesentation-tab-controls-init');
             }
        }
        ui_helpers.updatePresentationViewSelectorUI(currentView);

        if (typeof praesentationTabLogic !== 'undefined' && typeof mainAppInterface !== 'undefined' && typeof t2CriteriaManager !== 'undefined') {
            const globalData = mainAppInterface.getGlobalData();
            const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
            const appliedLogic = t2CriteriaManager.getAppliedLogic();
            praesentationTabLogic.renderPresentation(globalData, currentView, currentStudyId, currentGlobalKollektiv, appliedCriteria, appliedLogic);
        }

        if(spinner) spinner.classList.add('d-none');
        if (document.getElementById('praesentation-tab-pane')) ui_helpers.initializeTooltips(document.getElementById('praesentation-tab-pane'));
    }

    function renderPublikationTab(currentSection, currentLang, currentGlobalKollektiv) {
        const publikationTabPane = document.getElementById('publikation-tab-pane');
        const spinner = document.getElementById('publikation-spinner');
        if (spinner) spinner.classList.remove('d-none');

        if (publikationTabPane) {
            if (!initializedTabs.has('publikation-tab-header-init')) {
                 if (typeof ui_components !== 'undefined' && typeof ui_components.createPublikationTabHeader === 'function') {
                    publikationTabPane.innerHTML = ui_components.createPublikationTabHeader();
                 }
                 initializedTabs.add('publikation-tab-header-init');
            }

            const currentPublicationBFMetric = typeof state !== 'undefined' ? state.getCurrentPublikationBruteForceMetric() : PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

            if (typeof publikationTabLogic !== 'undefined' && typeof mainAppInterface !== 'undefined' && typeof t2CriteriaManager !== 'undefined' && typeof bruteForceManager !== 'undefined') {
                const globalData = mainAppInterface.getGlobalData();
                const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
                const appliedLogic = t2CriteriaManager.getAppliedLogic();
                const bfResults = bruteForceManager.getAllResults();

                publikationTabLogic.initializeData(globalData, appliedCriteria, appliedLogic, bfResults);
                ui_helpers.updatePublikationUI(currentLang, currentSection, currentPublicationBFMetric);

                const sectionToRender = currentSection || PUBLICATION_CONFIG.defaultSubSection;
                publikationTabLogic.getRenderedSectionContent(sectionToRender, currentLang, currentGlobalKollektiv);
                publikationTabLogic.updateDynamicChartsForPublicationTab(sectionToRender, currentLang, currentGlobalKollektiv);
            }
        }

        if (spinner) spinner.classList.add('d-none');
        if (publikationTabPane) ui_helpers.initializeTooltips(publikationTabPane);
    }

    function renderExportTab(currentKollektiv) {
        const exportContainer = document.getElementById('export-options-container');
        if (exportContainer && !initializedTabs.has('export-tab-content-init')) {
            if (typeof ui_components !== 'undefined') {
                exportContainer.innerHTML = ui_components.createExportOptions(currentKollektiv);
            }
            initializedTabs.add('export-tab-content-init');
        } else if (exportContainer && initializedTabs.has('export-tab-content-init')) {
            const exportDescEl = exportContainer.querySelector('.small.text-muted.mb-3');
            if(exportDescEl) exportDescEl.innerHTML = TOOLTIP_CONTENT.exportTab.description.replace('[KOLLEKTIV]', `<strong>${getKollektivDisplayName(currentKollektiv)}</strong>`);
        }

        if (typeof exportService !== 'undefined' && typeof bruteForceManager !== 'undefined' && typeof mainAppInterface !== 'undefined' && typeof state !== 'undefined') {
            const hasBruteForceResults = bruteForceManager.hasAnyResults();
            const canExportDataDependent = mainAppInterface.getGlobalData()?.length > 0;
            ui_helpers.updateExportButtonStates(state.getActiveTabId(), hasBruteForceResults, canExportDataDependent);
        }
        if (document.getElementById('export-tab-pane')) ui_helpers.initializeTooltips(document.getElementById('export-tab-pane'));
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
            if (typeof state !== 'undefined') state.setActiveTabId(tabId);
            refreshCurrentTab(tabId, true);
            if (typeof ui_helpers !== 'undefined' && typeof bruteForceManager !== 'undefined' && typeof mainAppInterface !== 'undefined' && typeof state !== 'undefined') {
                ui_helpers.updateExportButtonStates(tabId, bruteForceManager.hasAnyResults(), mainAppInterface.getGlobalData()?.length > 0);
            }
            setTimeout(() => {
               if (document.getElementById(tabId)) ui_helpers.initializeTooltips(document.getElementById(tabId));
            }, 100);
        } else {
            console.warn(`Tab mit ID '${tabId}' oder zugehöriger Nav-Link nicht gefunden.`);
        }
    }


    function refreshCurrentTab(activeTabId = (typeof state !== 'undefined' ? state.getActiveTabId() : 'daten-tab-pane'), isTabSwitch = false) {
        if (typeof state === 'undefined' || typeof dataProcessor === 'undefined' || typeof t2CriteriaManager === 'undefined' || typeof mainAppInterface === 'undefined') {
            console.warn("refreshCurrentTab: Notwendige Module (state, dataProcessor, t2CriteriaManager, mainAppInterface) nicht verfügbar.");
            return;
        }
        const currentKollektiv = state.getCurrentKollektiv();
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
                const bfResults = typeof bruteForceManager !== 'undefined' ? (bruteForceManager.getAllResultsForKollektiv(currentKollektiv) || bruteForceManager.getGlobalStatus()) : {};
                const bfWorkerAvailable = typeof bruteForceManager !== 'undefined' ? bruteForceManager.isWorkerAvailable() : false;
                const auswertungSortState = state.getCurrentAuswertungTableSort();
                const sortedAuswertungData = dataProcessor.sortData(filteredData, auswertungSortState.key, auswertungSortState.direction, auswertungSortState.subKey);
                renderAuswertungTab(sortedAuswertungData, appliedCriteria, appliedLogic, currentKollektiv, bfResults, bfWorkerAvailable);
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
         if (!isTabSwitch) { // Tooltips for the whole tab pane, only if not a tab switch (showTab handles it)
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
