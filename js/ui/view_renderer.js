const viewRenderer = (() => {
    const initializedTabs = new Set();

    function _initializeTab(tabId, rendererFunction, ...args) {
        const tabPane = document.getElementById(tabId);
        if (tabPane && !initializedTabs.has(tabId) && typeof rendererFunction === 'function') {
            rendererFunction(...args);
            initializedTabs.add(tabId);
        } else if (tabPane && initializedTabs.has(tabId) && typeof rendererFunction === 'function') {
            rendererFunction(...args);
        }
    }

    function renderDatenTab(data, sortState) {
        const tableBody = document.getElementById('daten-table-body');
        const paginationContainer = document.getElementById('daten-pagination-container');
        const itemsPerPage = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.UI_SETTINGS?.DEFAULT_TABLE_ROWS_PER_PAGE) ? APP_CONFIG.UI_SETTINGS.DEFAULT_TABLE_ROWS_PER_PAGE : 50;
        const totalPages = Array.isArray(data) ? Math.ceil(data.length / itemsPerPage) : 0;
        const currentPage = (typeof state !== 'undefined' && typeof state.getCurrentDatenTablePage === 'function') ? state.getCurrentDatenTablePage() : 1;

        if (tableBody && typeof tableRenderer !== 'undefined' && typeof tableRenderer.createDatenTableRow === 'function') {
            tableBody.innerHTML = '';
            if (Array.isArray(data) && data.length > 0) {
                const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                paginatedData.forEach(patient => {
                    tableBody.innerHTML += tableRenderer.createDatenTableRow(patient);
                });
            } else {
                tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Keine Daten im ausgewählten Kollektiv gefunden.</td></tr>`;
            }
            if (typeof ui_helpers !== 'undefined') {
                ui_helpers.attachRowCollapseListeners(tableBody);
                ui_helpers.updateSortIcons('daten-table-header', sortState);
                ui_helpers.initializeTooltips(tableBody);
            }
        }
        if (typeof paginationManager !== 'undefined' && paginationContainer) {
             paginationContainer.innerHTML = paginationManager.createPaginationControls('daten', currentPage, totalPages);
             paginationManager.attachPaginationEventListeners('daten', totalPages, (newPage) => {
                if (typeof state !== 'undefined' && typeof state.setCurrentDatenTablePage === 'function') state.setCurrentDatenTablePage(newPage);
                if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshCurrentTab === 'function') mainAppInterface.refreshCurrentTab();
             });
        }
    }

    function renderAuswertungTab(data, appliedCriteria, appliedLogic, currentKollektiv, bfResults, bfWorkerAvailable) {
        const auswertungControlsContainer = document.getElementById('auswertung-t2-kriterien-controls-container');
        const auswertungTableBody = document.getElementById('auswertung-table-body');
        const t2MetricsOverviewContainer = document.getElementById('t2-metrics-overview-container');
        const bruteForceContainer = document.getElementById('brute-force-container');
        const paginationContainer = document.getElementById('auswertung-pagination-container');
        const itemsPerPage = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.UI_SETTINGS?.DEFAULT_TABLE_ROWS_PER_PAGE) ? APP_CONFIG.UI_SETTINGS.DEFAULT_TABLE_ROWS_PER_PAGE : 50;
        const totalPages = Array.isArray(data) ? Math.ceil(data.length / itemsPerPage) : 0;
        const currentPage = (typeof state !== 'undefined' && typeof state.getCurrentAuswertungTablePage === 'function') ? state.getCurrentAuswertungTablePage() : 1;
        const auswertungTabPane = document.getElementById('auswertung-tab-pane');

        if (auswertungControlsContainer && !initializedTabs.has('auswertung-tab-controls')) {
            if (typeof ui_components !== 'undefined' && typeof ui_components.createT2CriteriaControls === 'function') {
                auswertungControlsContainer.innerHTML = ui_components.createT2CriteriaControls(appliedCriteria, appliedLogic);
            }
            initializedTabs.add('auswertung-tab-controls');
        }

        if (typeof ui_helpers !== 'undefined') {
            ui_helpers.updateT2CriteriaControlsUI(appliedCriteria, appliedLogic);
            if (typeof t2CriteriaManager !== 'undefined' && typeof t2CriteriaManager.isUnsaved === 'function') {
                 ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
            }
        }

        if (bruteForceContainer && !initializedTabs.has('auswertung-tab-bf')) {
            if (typeof ui_components !== 'undefined' && typeof ui_components.createBruteForceCard === 'function') {
                bruteForceContainer.innerHTML = ui_components.createBruteForceCard(currentKollektiv, bfWorkerAvailable);
            }
            initializedTabs.add('auswertung-tab-bf');
        }
         if (typeof ui_helpers !== 'undefined') {
            ui_helpers.updateBruteForceUI(bfResults?.status || 'idle', bfResults || {}, bfWorkerAvailable, currentKollektiv);
         }


        if (t2MetricsOverviewContainer && typeof ui_components !== 'undefined' && typeof ui_components.createT2MetricsOverview === 'function') {
            const evaluatedData = (typeof t2CriteriaManager !== 'undefined' && typeof t2CriteriaManager.evaluateDataset === 'function') ? t2CriteriaManager.evaluateDataset(cloneDeep(data), appliedCriteria, appliedLogic) : cloneDeep(data);
            const perfStats = (typeof statisticsService !== 'undefined' && typeof statisticsService.calculateDiagnosticPerformance === 'function') ? statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n') : null;
            t2MetricsOverviewContainer.innerHTML = ui_components.createT2MetricsOverview(perfStats, currentKollektiv);
        }

        if (auswertungTableBody && typeof tableRenderer !== 'undefined' && typeof tableRenderer.createAuswertungTableRow === 'function') {
            auswertungTableBody.innerHTML = '';
             const evaluatedDataForTable = (typeof t2CriteriaManager !== 'undefined' && typeof t2CriteriaManager.evaluateDataset === 'function') ? t2CriteriaManager.evaluateDataset(cloneDeep(data), appliedCriteria, appliedLogic) : cloneDeep(data);

            if (Array.isArray(evaluatedDataForTable) && evaluatedDataForTable.length > 0) {
                const paginatedData = evaluatedDataForTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                paginatedData.forEach(patient => {
                    auswertungTableBody.innerHTML += tableRenderer.createAuswertungTableRow(patient, appliedCriteria, appliedLogic);
                });
            } else {
                 auswertungTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Keine Patienten im ausgewählten Kollektiv gefunden.</td></tr>`;
            }

            if (typeof ui_helpers !== 'undefined') {
                ui_helpers.attachRowCollapseListeners(auswertungTableBody);
                const defaultSort = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.DEFAULT_SETTINGS?.AUSWERTUNG_TABLE_SORT) ? APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT : { key: 'nr', direction: 'asc', subKey: null };
                ui_helpers.updateSortIcons('auswertung-table-header', ((typeof state !== 'undefined' && typeof state.getCurrentAuswertungTableSort === 'function') ? state.getCurrentAuswertungTableSort() : null) || defaultSort);
            }
        }

        if (typeof paginationManager !== 'undefined' && paginationContainer) {
             paginationContainer.innerHTML = paginationManager.createPaginationControls('auswertung', currentPage, totalPages);
             paginationManager.attachPaginationEventListeners('auswertung', totalPages, (newPage) => {
                if(typeof state !== 'undefined' && typeof state.setCurrentAuswertungTablePage === 'function') state.setCurrentAuswertungTablePage(newPage);
                if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshCurrentTab === 'function') mainAppInterface.refreshCurrentTab();
             });
        }
        if (auswertungTabPane && typeof ui_helpers !== 'undefined') {
            ui_helpers.initializeTooltips(auswertungTabPane);
        }
    }

    function renderStatistikTab(currentKollektiv, statistikLayout, statistikKollektiv1, statistikKollektiv2) {
        const statistikControlsContainer = document.getElementById('statistik-controls-container');
        const spinner = document.getElementById('statistik-spinner');
        const statistikTabPane = document.getElementById('statistik-tab-pane');

        if (spinner) spinner.classList.remove('d-none');

        if (statistikControlsContainer && !initializedTabs.has('statistik-tab-controls')) {
            const kollektivOptions = ['Gesamt', 'direkt OP', 'nRCT'];
            const getDisplayNameFunc = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName : (k) => k;
            const selectOptionsHTML = kollektivOptions.map(k => {
                const displayName = getDisplayNameFunc(k);
                return `<option value="${k}">${displayName}</option>`;
            }).join('');

            statistikControlsContainer.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-md-auto mb-2 mb-md-0">
                        <button class="btn btn-outline-primary btn-sm" id="statistik-toggle-vergleich" data-tippy-content="${(TOOLTIP_CONTENT.statistikToggleVergleich?.description || 'Layout umschalten')}"><i class="fas fa-user-cog me-1"></i> Einzelansicht Aktiv</button>
                    </div>
                    <div class="col-md-auto mb-2 mb-md-0 d-none" id="statistik-kollektiv-select-1-container">
                        <label for="statistik-kollektiv-select-1" class="form-label form-label-sm visually-hidden">Kollektiv 1</label>
                        <select class="form-select form-select-sm" id="statistik-kollektiv-select-1" data-tippy-content="${(TOOLTIP_CONTENT.statistikKollektiv1?.description || 'Kollektiv 1 wählen')}">
                           ${selectOptionsHTML}
                        </select>
                    </div>
                    <div class="col-md-auto mb-2 mb-md-0 d-none" id="statistik-kollektiv-select-2-container">
                        <label for="statistik-kollektiv-select-2" class="form-label form-label-sm visually-hidden">Kollektiv 2</label>
                        <select class="form-select form-select-sm" id="statistik-kollektiv-select-2" data-tippy-content="${(TOOLTIP_CONTENT.statistikKollektiv2?.description || 'Kollektiv 2 wählen')}">
                            ${selectOptionsHTML}
                        </select>
                    </div>
                </div>`;
            initializedTabs.add('statistik-tab-controls');
        }
        if (typeof ui_helpers !== 'undefined') {
            ui_helpers.updateStatistikSelectorsUI(statistikLayout, statistikKollektiv1, statistikKollektiv2);
        }

        if (typeof statistikTabLogic !== 'undefined' && typeof statistikTabLogic.displayStatistics === 'function' &&
            typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.getGlobalData === 'function' &&
            typeof t2CriteriaManager !== 'undefined' && typeof t2CriteriaManager.getAppliedT2Criteria === 'function' &&
            typeof state !== 'undefined') {
            statistikTabLogic.displayStatistics(
                mainAppInterface.getGlobalData(),
                statistikLayout,
                statistikKollektiv1,
                statistikKollektiv2,
                t2CriteriaManager.getAppliedT2Criteria(),
                t2CriteriaManager.getAppliedT2Logic()
            );
        }
        if (spinner) spinner.classList.add('d-none');
        if (statistikTabPane && typeof ui_helpers !== 'undefined') {
            ui_helpers.initializeTooltips(statistikTabPane);
        }
    }

    function renderPraesentationTab(currentView, currentStudyId, currentGlobalKollektiv) {
        const praesControlsContainer = document.getElementById('praesentation-controls-container');
        const spinner = document.getElementById('praesentation-spinner');
        const praesentationTabPane = document.getElementById('praesentation-tab-pane');

        if(spinner) spinner.classList.remove('d-none');

        if (praesControlsContainer && !initializedTabs.has('praesentation-tab-controls')) {
            const studyOptions = (typeof studyT2CriteriaManager !== 'undefined' && typeof studyT2CriteriaManager.getAllStudyCriteriaSets === 'function' ? studyT2CriteriaManager.getAllStudyCriteriaSets() : []).map(set =>
                 `<option value="${set.id}" ${set.id === currentStudyId ? 'selected' : ''}>${set.name || set.id}</option>`
            ).join('');
            const appliedCriteriaDisplayName = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.SPECIAL_IDS?.APPLIED_CRITERIA_DISPLAY_NAME) ? APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME : "Eingestellte Kriterien";

            praesControlsContainer.innerHTML = `
                <div class="row align-items-center justify-content-center">
                    <div class="col-md-auto mb-2 mb-md-0">
                         <div class="btn-group btn-group-sm" role="group" aria-label="Präsentationsansicht wählen" data-tippy-content="${(TOOLTIP_CONTENT.praesentation?.viewSelect?.description || 'Ansicht wählen')}">
                            <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as" value="as-pur" ${currentView === 'as-pur' ? 'checked' : ''} autocomplete="off">
                            <label class="btn btn-outline-primary" for="praes-ansicht-as">Avocado Sign (Performance)</label>
                            <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as-vs-t2" value="as-vs-t2" ${currentView === 'as-vs-t2' ? 'checked' : ''} autocomplete="off">
                            <label class="btn btn-outline-primary" for="praes-ansicht-as-vs-t2">AS vs. T2 (Vergleich)</label>
                        </div>
                    </div>
                    <div class="col-md-auto mb-2 mb-md-0" id="praes-study-select-container" style="display: ${currentView === 'as-vs-t2' ? '' : 'none'};">
                        <label for="praes-study-select" class="form-label form-label-sm visually-hidden">T2-Basis</label>
                        <select class="form-select form-select-sm" id="praes-study-select" data-tippy-content="${(TOOLTIP_CONTENT.praesentation?.studySelect?.description || 'T2-Basis wählen')}">
                            <option value="${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID}" ${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID === currentStudyId ? 'selected' : ''}>${appliedCriteriaDisplayName}</option>
                            ${studyOptions}
                        </select>
                    </div>
                </div>`;
            initializedTabs.add('praesentation-tab-controls');
        }
        if (typeof ui_helpers !== 'undefined') {
            ui_helpers.updatePresentationViewSelectorUI(currentView);
        }

        if (typeof praesentationTabLogic !== 'undefined' && typeof praesentationTabLogic.renderPresentation === 'function' &&
            typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.getGlobalData === 'function' &&
            typeof t2CriteriaManager !== 'undefined') {
            const globalData = mainAppInterface.getGlobalData();
            const appliedCriteria = t2CriteriaManager.getAppliedT2Criteria();
            const appliedLogic = t2CriteriaManager.getAppliedT2Logic();
            praesentationTabLogic.renderPresentation(globalData, currentView, currentStudyId, currentGlobalKollektiv, appliedCriteria, appliedLogic);
        }

        if(spinner) spinner.classList.add('d-none');
        if (praesentationTabPane && typeof ui_helpers !== 'undefined') {
            ui_helpers.initializeTooltips(praesentationTabPane);
        }
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

            const currentPublicationBFMetric = ((typeof state !== 'undefined' && typeof state.getCurrentPublikationBruteForceMetric === 'function') ? state.getCurrentPublikationBruteForceMetric() : null) || ((typeof PUBLICATION_CONFIG !== 'undefined') ? PUBLICATION_CONFIG.defaultBruteForceMetricForPublication : 'Balanced Accuracy');

            if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.initializeData === 'function' &&
                typeof mainAppInterface !== 'undefined' && typeof t2CriteriaManager !== 'undefined' &&
                typeof bruteForceManager !== 'undefined' && typeof PUBLICATION_CONFIG !== 'undefined' && typeof ui_helpers !== 'undefined') {
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
            }
        }

        if (spinner) spinner.classList.add('d-none');
        if (publikationTabPane && typeof ui_helpers !== 'undefined') {
            ui_helpers.initializeTooltips(publikationTabPane);
        }
    }

    function renderExportTab(currentKollektiv) {
        const exportContainer = document.getElementById('export-options-container');
        const exportTabPane = document.getElementById('export-tab-pane');

        if (exportContainer && !initializedTabs.has('export-tab-content')) {
            if (typeof ui_components !== 'undefined' && typeof ui_components.createExportOptions === 'function') {
                exportContainer.innerHTML = ui_components.createExportOptions(currentKollektiv);
            }
            initializedTabs.add('export-tab-content');
        } else if (exportContainer && initializedTabs.has('export-tab-content')) {
            const exportDescEl = exportContainer.querySelector('.small.text-muted.mb-3');
            if(exportDescEl && typeof getKollektivDisplayName === 'function' && typeof TOOLTIP_CONTENT !== 'undefined' && TOOLTIP_CONTENT.exportTab?.description) {
                exportDescEl.innerHTML = TOOLTIP_CONTENT.exportTab.description.replace('[KOLLEKTIV]', `<strong>${getKollektivDisplayName(currentKollektiv)}</strong>`);
            }
        }

        if (typeof exportService !== 'undefined' && typeof bruteForceManager !== 'undefined' &&
            typeof mainAppInterface !== 'undefined' && typeof ui_helpers !== 'undefined' && typeof state !== 'undefined') {
            const hasBruteForceResults = bruteForceManager.hasAnyResults ? bruteForceManager.hasAnyResults() : Object.keys(bruteForceManager.getAllResults() || {}).length > 0;
            const canExportDataDependent = (mainAppInterface.getGlobalData()?.length ?? 0) > 0;
            ui_helpers.updateExportButtonStates(state.getActiveTabId(), hasBruteForceResults, canExportDataDependent);
        }
        if (exportTabPane && typeof ui_helpers !== 'undefined') {
            ui_helpers.initializeTooltips(exportTabPane);
        }
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

        if (targetNavLink && targetTabPane && typeof state !== 'undefined' && typeof ui_helpers !== 'undefined' &&
            typeof bruteForceManager !== 'undefined' && typeof mainAppInterface !== 'undefined') {
            state.setActiveTabId(tabId);
            refreshCurrentTab(tabId, true);
            const hasBruteForceResults = bruteForceManager.hasAnyResults ? bruteForceManager.hasAnyResults() : Object.keys(bruteForceManager.getAllResults() || {}).length > 0;
            ui_helpers.updateExportButtonStates(tabId, hasBruteForceResults, (mainAppInterface.getGlobalData()?.length ?? 0) > 0);
            setTimeout(() => {
               const currentTabElement = document.getElementById(tabId);
               if (currentTabElement) ui_helpers.initializeTooltips(currentTabElement);
            }, 150);
        } else {
            console.warn(`Tab mit ID '${tabId}' oder zugehöriger Nav-Link nicht gefunden, oder Kernmodule nicht verfügbar.`);
        }
    }


    function refreshCurrentTab(activeTabId = (typeof state !== 'undefined' && typeof state.getActiveTabId === 'function' ? state.getActiveTabId() : null), isTabSwitch = false) {
        if (!activeTabId) {
             console.warn("refreshCurrentTab: Keine aktive Tab-ID verfügbar.");
             return;
        }
        const currentKollektiv = (typeof state !== 'undefined' && typeof state.getCurrentKollektiv === 'function') ? state.getCurrentKollektiv() : ( (typeof APP_CONFIG !== 'undefined') ? APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV : 'Gesamt');

        if (typeof mainAppInterface === 'undefined' || typeof mainAppInterface.getGlobalData !== 'function') {
            console.warn("mainAppInterface oder globale Daten nicht verfügbar in refreshCurrentTab.");
            return;
        }
        const globalData = mainAppInterface.getGlobalData();

        if (!globalData || typeof dataProcessor === 'undefined' || typeof dataProcessor.filterDataByKollektiv !== 'function' || typeof dataProcessor.sortData !== 'function') {
            console.warn("Globale Daten oder dataProcessor-Funktionen nicht verfügbar für Tab-Aktualisierung.");
            return;
        }
        const filteredData = dataProcessor.filterDataByKollektiv(globalData, currentKollektiv);

        switch (activeTabId) {
            case 'daten-tab-pane':
                const datenSortState = ((typeof state !== 'undefined' && typeof state.getCurrentDatenTableSort === 'function') ? state.getCurrentDatenTableSort() : null) || (typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT : { key: 'nr', direction: 'asc', subKey: null });
                const sortedData = dataProcessor.sortData(filteredData, datenSortState.key, datenSortState.direction, datenSortState.subKey);
                renderDatenTab(sortedData, datenSortState);
                break;
            case 'auswertung-tab-pane':
                if (typeof t2CriteriaManager !== 'undefined' && typeof bruteForceManager !== 'undefined') {
                    const appliedCriteria = t2CriteriaManager.getAppliedT2Criteria();
                    const appliedLogic = t2CriteriaManager.getAppliedT2Logic();
                    const bfResults = bruteForceManager.getResultsForKollektiv(currentKollektiv) || bruteForceManager.getAllResults()?.[currentKollektiv] || { status: 'idle' };
                    const auswertungSortState = ((typeof state !== 'undefined' && typeof state.getCurrentAuswertungTableSort === 'function') ? state.getCurrentAuswertungTableSort() : null) || (typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT : { key: 'nr', direction: 'asc', subKey: null });
                    const sortedAuswertungData = dataProcessor.sortData(filteredData, auswertungSortState.key, auswertungSortState.direction, auswertungSortState.subKey);
                    renderAuswertungTab(sortedAuswertungData, appliedCriteria, appliedLogic, currentKollektiv, bfResults, bruteForceManager.isWorkerAvailable());
                }
                break;
            case 'statistik-tab-pane':
                if (typeof state !== 'undefined' && typeof state.getCurrentStatistikLayout === 'function') {
                    renderStatistikTab(currentKollektiv, state.getCurrentStatistikLayout(), state.getCurrentStatistikKollektiv1(), state.getCurrentStatistikKollektiv2());
                }
                break;
            case 'praesentation-tab-pane':
                 if (typeof state !== 'undefined' && typeof state.getCurrentPresentationView === 'function') {
                    renderPraesentationTab(state.getCurrentPresentationView(), state.getCurrentPresentationStudyId(), currentKollektiv);
                 }
                break;
            case 'publikation-tab-pane':
                if (typeof state !== 'undefined' && typeof state.getCurrentPublikationSection === 'function') {
                    renderPublikationTab(state.getCurrentPublikationSection(), state.getCurrentPublikationLang(), currentKollektiv);
                }
                break;
            case 'export-tab-pane':
                renderExportTab(currentKollektiv);
                break;
        }
         if (!isTabSwitch && typeof ui_helpers !== 'undefined') {
             const activeTabElement = document.getElementById(activeTabId);
             if (activeTabElement) ui_helpers.initializeTooltips(activeTabElement);
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
