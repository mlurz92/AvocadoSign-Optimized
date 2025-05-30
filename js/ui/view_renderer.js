const viewRenderer = (() => {
    let currentSortState = {
        daten: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT),
        auswertung: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT)
    };
    let dataTablePagination = null;
    let auswertungTablePagination = null;

    function _updateAndRenderTable(tableId, data, rowCreationFn, sortStateKey, itemsPerPage = APP_CONFIG.UI_SETTINGS.DEFAULT_TABLE_ROWS_PER_PAGE) {
        const tableBody = document.getElementById(`${tableId}-body`);
        const paginationControls = document.getElementById(`${tableId}-pagination`);
        const tableInfo = document.getElementById(`${tableId}-info`);
        const tableHeaderId = `${tableId}-header`;

        if (!tableBody || !paginationControls || !tableInfo || !document.getElementById(tableHeaderId)) {
            console.error(`Tabellenelemente für ${tableId} nicht gefunden.`);
            return null;
        }

        const sortFunction = getSortFunction(currentSortState[sortStateKey].key, currentSortState[sortStateKey].direction, currentSortState[sortStateKey].subKey);
        const sortedData = [...data].sort(sortFunction);

        const paginationInstance = new simpleDatatables.DataTable(document.createElement('table'), {
            data: {
                headings: [], // Dummy, da wir nur die Paginierungslogik nutzen
                data: sortedData.map((_, index) => [index]) // Dummy-Daten für Paginierung
            },
            perPage: itemsPerPage,
            searchable: false,
            sortable: false,
            header: false,
            footer: false,
            labels: {
                placeholder: "Suchen...",
                perPage: "{select} Einträge pro Seite",
                noRows: "Keine Einträge gefunden",
                info: "Zeige {start} bis {end} von {rows} Einträgen"
            }
        });
        
        paginationInstance.on('datatable.page', (page) => {
            renderPage(page);
        });
        
        paginationInstance.on('datatable.perpage', (perPage) => {
             renderPage(1); // Reset to first page on perPage change
        });

        function renderPage(page) {
            const currentPage = page || paginationInstance.currentPage || 1;
            const startIndex = (currentPage - 1) * paginationInstance.options.perPage;
            const endIndex = startIndex + paginationInstance.options.perPage;
            const pageData = sortedData.slice(startIndex, endIndex);

            tableBody.innerHTML = '';
            pageData.forEach(item => {
                tableBody.innerHTML += rowCreationFn(item);
            });
            ui_helpers.initializeTooltips(tableBody);
            ui_helpers.attachRowCollapseListeners(tableBody);
             if (tableInfo) tableInfo.innerHTML = paginationInstance.labels.info.replace('{start}', sortedData.length > 0 ? startIndex + 1 : 0).replace('{end}', Math.min(endIndex, sortedData.length)).replace('{rows}', sortedData.length);
        }
        
        if (paginationControls) paginationControls.innerHTML = '';
        if (sortedData.length > itemsPerPage) {
             const paginationList = document.createElement('ul');
             paginationList.className = 'pagination pagination-sm justify-content-end mb-0';
             paginationControls.appendChild(paginationList);
             paginationInstance.paginationRender(paginationList); // Render Bootstrap 5 compatible pagination
        }


        renderPage(1);
        ui_helpers.updateSortIcons(tableHeaderId, currentSortState[sortStateKey]);
        return paginationInstance;
    }

    function renderDatenTab() {
        const currentKollektiv = state.getCurrentKollektiv();
        const filteredData = dataProcessor.filterDataByKollektiv(mainAppInterface.getRawData(), currentKollektiv);
        ui_helpers.updateElementHTML('daten-tab-content', `<div class="table-responsive"><table class="table table-sm table-hover table-striped data-table" id="daten-table"><thead><tr id="daten-table-header">${dataTabLogic.getDatenTableHeaderHTML()}</tr></thead><tbody id="daten-table-body"></tbody></table></div><div id="daten-table-pagination" class="mt-2"></div><div id="daten-table-info" class="small text-muted mt-1"></div>`);
        dataTablePagination = _updateAndRenderTable('daten-table', filteredData, tableRenderer.createDatenTableRow, 'daten');
        ui_helpers.initializeTooltips(document.getElementById('daten-table-header'));
    }

    function renderAuswertungTab() {
        const currentKollektiv = state.getCurrentKollektiv();
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
        const appliedLogic = t2CriteriaManager.getAppliedLogic();
        const isBruteForceWorkerAvailable = bruteForceManager.isWorkerAvailable();
        const displayKollektivName = getKollektivDisplayName(currentKollektiv);

        ui_helpers.updateElementHTML('auswertung-criteria-controls-container', uiComponents.createT2CriteriaControls(appliedCriteria, appliedLogic));
        ui_helpers.updateElementHTML('auswertung-bruteforce-container', uiComponents.createBruteForceCard(displayKollektivName, isBruteForceWorkerAvailable));
        ui_helpers.updateT2CriteriaControlsUI(appliedCriteria, appliedLogic);
        auswertungTabLogic.initializeAuswertungDataAndUI();
        
        const tableContainerHTML = `<div class="table-responsive mt-3"><table class="table table-sm table-hover table-striped data-table" id="auswertung-table"><thead><tr id="auswertung-table-header">${auswertungTabLogic.getAuswertungTableHeaderHTML()}</tr></thead><tbody id="auswertung-table-body"></tbody></table></div><div id="auswertung-table-pagination" class="mt-2"></div><div id="auswertung-table-info" class="small text-muted mt-1"></div>`;
        ui_helpers.updateElementHTML('auswertung-table-container', tableContainerHTML);

        const evaluatedData = auswertungTabLogic.getProcessedDataForTable();
        auswertungTablePagination = _updateAndRenderTable('auswertung-table', evaluatedData, (patient) => tableRenderer.createAuswertungTableRow(patient, appliedCriteria, appliedLogic), 'auswertung');
        ui_helpers.initializeTooltips(document.getElementById('auswertung-tab-pane'));
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.hasUnappliedChanges());
    }


    function renderStatistikTab() {
        const currentKollektiv = state.getCurrentKollektiv();
        const currentLayout = state.getCurrentStatsLayout();
        const kollektiv1 = state.getCurrentStatsKollektiv1();
        const kollektiv2 = state.getCurrentStatsKollektiv2();
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
        const appliedLogic = t2CriteriaManager.getAppliedLogic();
        const rawData = mainAppInterface.getRawData();

        ui_helpers.updateStatistikSelectorsUI(currentLayout, kollektiv1, kollektiv2);
        statistikTabLogic.calculateAndDisplayStatistics(rawData, appliedCriteria, appliedLogic, currentLayout, kollektiv1, kollektiv2);
        ui_helpers.initializeTooltips(document.getElementById('statistik-tab-pane'));
    }

    function renderPraesentationTab() {
        const currentView = state.getCurrentPresentationView();
        const currentStudyId = state.getCurrentPresentationStudyId();
        ui_helpers.updatePresentationViewSelectorUI(currentView);
        
        const studySelect = document.getElementById('praes-study-select');
        if (studySelect) {
            if(!studySelect.options.length) { // Populate if empty
                const defaultOption = document.createElement('option');
                defaultOption.value = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
                defaultOption.textContent = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
                studySelect.appendChild(defaultOption);
                PUBLICATION_CONFIG.literatureCriteriaSets.forEach(setConf => {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(setConf.id);
                    if (studySet) {
                        const option = document.createElement('option');
                        option.value = setConf.id;
                        option.textContent = studySet.name;
                        studySelect.appendChild(option);
                    }
                });
            }
            studySelect.value = currentStudyId || APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
        }

        const rawData = mainAppInterface.getRawData();
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
        const appliedLogic = t2CriteriaManager.getAppliedLogic();

        praesentationTabLogic.updatePresentationContent(rawData, appliedCriteria, appliedLogic, currentView, currentStudyId || APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID);
        ui_helpers.initializeTooltips(document.getElementById('praesentation-tab-pane'));
    }

    function renderPublikationTab() {
        const tabContentArea = document.getElementById('publikation-tab-content-area');
        if (!tabContentArea) return;
        tabContentArea.innerHTML = uiComponents.createPublikationTabHeader();

        const rawData = mainAppInterface.getRawData();
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
        const appliedLogic = t2CriteriaManager.getAppliedLogic();
        const bfResults = bruteForceManager.getAllResults();

        publikationTabLogic.initializeData(rawData, appliedCriteria, appliedLogic, bfResults);

        const lang = state.getCurrentPublikationLang();
        const sectionId = state.getCurrentPublikationSection() || PUBLICATION_CONFIG.defaultSubSection;
        const globalKollektiv = state.getCurrentKollektiv();
        
        ui_helpers.updatePublikationUI(lang, sectionId, state.getCurrentPublikationBruteForceMetric());
        publikationTabLogic.getRenderedSectionContent(sectionId, lang, globalKollektiv); // Rendert Text und Tabellen-HTML
        publikationTabLogic.updateDynamicChartsForPublicationTab(sectionId, lang, globalKollektiv); // Rendert Charts in die Platzhalter

        ui_helpers.initializeTooltips(document.getElementById('publikation-tab-pane'));
        publikationEventHandlers.attachPublikationTabEventHandlers();
    }


    function renderExportTab() {
        const currentKollektiv = state.getCurrentKollektiv();
        ui_helpers.updateElementHTML('export-tab-content', uiComponents.createExportOptions(currentKollektiv));
        ui_helpers.updateExportButtonStates(state.getActiveTabId(), bruteForceManager.hasAnyResults(), mainAppInterface.getFilteredData().length > 0);
        ui_helpers.initializeTooltips(document.getElementById('export-tab-pane'));
        generalEventHandlers.attachExportButtonListeners(document.getElementById('export-tab-content'));
    }
    
    function renderAdminTab() {
        const content = `
            <div class="row">
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-header">Anwendungszustand (State)</div>
                        <div class="card-body">
                            <pre id="admin-state-output" class="bg-light p-2 rounded small" style="max-height: 300px; overflow-y: auto;"></pre>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-header">LocalStorage Management</div>
                        <div class="card-body">
                            <button class="btn btn-sm btn-danger mb-2" id="btn-clear-localstorage" data-tippy-content="Löscht ALLE im LocalStorage gespeicherten Daten dieser Anwendung (Kriterien, Zustand etc.). Die Seite wird danach neu geladen.">
                                <i class="fas fa-trash-alt me-1"></i> LocalStorage löschen & Neu laden
                            </button>
                            <p class="small text-muted">Aktuell belegter Speicher durch diese Anwendung: <span id="localstorage-size">--</span> KB</p>
                        </div>
                    </div>
                </div>
                 <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-header">Brute-Force Worker Test</div>
                        <div class="card-body">
                            <button class="btn btn-sm btn-info mb-2" id="btn-test-bruteforce-worker" data-tippy-content="Startet einen einfachen Testlauf des Brute-Force Workers.">
                                <i class="fas fa-microchip me-1"></i> Worker Testlauf
                            </button>
                             <div id="bruteforce-worker-test-output" class="small text-muted mt-2"></div>
                        </div>
                    </div>
                </div>
            </div>`;
        ui_helpers.updateElementHTML('admin-tab-content', content);
        ui_helpers.initializeTooltips(document.getElementById('admin-tab-content'));
        generalEventHandlers.attachAdminTabListeners();
    }

    function updateAllSortIcons() {
        ui_helpers.updateSortIcons('daten-table-header', currentSortState.daten);
        ui_helpers.updateSortIcons('auswertung-table-header', currentSortState.auswertung);
    }
    
    function updateTableSortState(tableType, newKey, newSubKey = null) {
        if (currentSortState[tableType].key === newKey && currentSortState[tableType].subKey === newSubKey) {
            currentSortState[tableType].direction = currentSortState[tableType].direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortState[tableType].key = newKey;
            currentSortState[tableType].subKey = newSubKey;
            currentSortState[tableType].direction = 'asc';
        }
        state.saveTableSortSettings(tableType, currentSortState[tableType]);
    }

    function getCurrentSortStateFor(tableType) {
        return currentSortState[tableType];
    }
    
    function initializeSortStates() {
        currentSortState.daten = state.loadTableSortSettings('daten') || cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT);
        currentSortState.auswertung = state.loadTableSortSettings('auswertung') || cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT);
    }


    return Object.freeze({
        renderDatenTab,
        renderAuswertungTab,
        renderStatistikTab,
        renderPraesentationTab,
        renderPublikationTab,
        renderExportTab,
        renderAdminTab,
        updateTableSortState,
        getCurrentSortStateFor,
        updateAllSortIcons,
        initializeSortStates
    });

})();
