const dataTabLogic = (() => {
    let allProcessedData = null;
    let currentKollektiv = APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
    let currentPage = 1;
    let rowsPerPage = APP_CONFIG.UI_SETTINGS.DEFAULT_TABLE_ROWS_PER_PAGE;
    let sortState = cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT);

    const columns = Object.freeze([
        Object.freeze({ key: 'nr', label: 'Nr.', sortable: true, tooltipKey: 'datenTable.nr' }),
        Object.freeze({ key: 'name', label: 'Name, Vorname', sortable: true, tooltipKey: 'datenTable.name' }),
        Object.freeze({ key: 'geschlecht', label: 'Geschl.', sortable: true, tooltipKey: 'datenTable.geschlecht' }),
        Object.freeze({ key: 'alter', label: 'Alter', sortable: true, tooltipKey: 'datenTable.alter' }),
        Object.freeze({ key: 'therapie', label: 'Therapie', sortable: true, tooltipKey: 'datenTable.therapie' }),
        Object.freeze({ key: 'n_as_t2', label: 'N / AS / T2', sortable: true, isStatusColumn: true, subSortKeys: ['n', 'as', 't2'], tooltipKey: 'datenTable.n_as_t2' }),
        Object.freeze({ key: 'bemerkung', label: 'Bemerkung', sortable: false, tooltipKey: 'datenTable.bemerkung' })
    ]);

    function initialize(processedData, initialSettings) {
        allProcessedData = processedData;
        if (initialSettings) {
            currentKollektiv = initialSettings.currentKollektiv || currentKollektiv;
            const savedSortState = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_SORT);
            if (savedSortState) {
                sortState = savedSortState;
            }
        }
        currentPage = 1;
    }

    function updateData(processedData, newSettings) {
        allProcessedData = processedData;
        if (newSettings) {
            currentKollektiv = newSettings.currentKollektiv || currentKollektiv;
            const savedSortState = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_SORT);
            sortState = savedSortState || cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT);
        }
        currentPage = 1;
    }

    function setSort(key, subKey = null) {
        if (sortState.key === key && sortState.subKey === subKey) {
            sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
            sortState.key = key;
            sortState.subKey = subKey;
            sortState.direction = 'asc';
        }
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_SORT, sortState);
        currentPage = 1;
        renderTabContent();
    }

    function setCurrentPage(page) {
        const filteredData = dataProcessor.filterDataByKollektiv(allProcessedData, currentKollektiv);
        const totalPages = Math.ceil((filteredData?.length || 0) / rowsPerPage);
        currentPage = Math.max(1, Math.min(page, totalPages));
        renderTabContent();
    }

    function renderTabContent() {
        if (!allProcessedData) {
            console.warn("DataTabLogic: allProcessedData ist nicht initialisiert.");
            const container = document.getElementById('daten-tab-content');
            if(container) ui_helpers.updateElementHTML('daten-tab-content', '<p class="text-danger p-3">Keine Daten zum Anzeigen vorhanden. Bitte laden Sie die Seite neu.</p>');
            return;
        }

        const filteredData = dataProcessor.filterDataByKollektiv(allProcessedData, currentKollektiv);
        const tableHeaderId = 'daten-tabelle-header';

        tableRenderer.renderDatenTabelle(filteredData, currentPage, rowsPerPage, sortState, columns);
        ui_helpers.updateSortIcons(tableHeaderId, sortState);

        const anzahlPatientenInfoElement = document.getElementById('daten-anzahl-patienten-info');
        if (anzahlPatientenInfoElement) {
            const totalRows = filteredData.length;
            const startRow = (currentPage - 1) * rowsPerPage + 1;
            const endRow = Math.min(currentPage * rowsPerPage, totalRows);
             if(totalRows > 0) {
                anzahlPatientenInfoElement.textContent = `Zeige ${startRow}-${endRow} von ${totalRows} Patienten im Kollektiv '${getKollektivDisplayName(currentKollektiv)}'.`;
             } else {
                anzahlPatientenInfoElement.textContent = `Keine Patienten im Kollektiv '${getKollektivDisplayName(currentKollektiv)}'.`;
             }
        }
        const tableElement = document.getElementById('daten-tabelle');
        if(tableElement) ui_helpers.initializeTooltips(tableElement);
        const paginationElement = document.getElementById('daten-pagination');
        if(paginationElement) ui_helpers.initializeTooltips(paginationElement);
        const headerElement = document.getElementById(tableHeaderId);
        if(headerElement) ui_helpers.initializeTooltips(headerElement);

    }

    function getFilteredDataForExport() {
        if (!allProcessedData) return [];
        const filteredData = dataProcessor.filterDataByKollektiv(allProcessedData, currentKollektiv);
        return filteredData.slice().sort(getSortFunction(sortState.key, sortState.direction, sortState.subKey));
    }

    return Object.freeze({
        initialize,
        updateData,
        setSort,
        setCurrentPage,
        renderTabContent,
        getFilteredDataForExport,
        getColumns: () => columns
    });
})();
