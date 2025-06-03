const dataTabEventHandlers = (() => {
    let tableInstance = null;
    let currentFilterValue = '';

    function _applyFilter() {
        if (tableInstance) {
            tableInstance.filter(currentFilterValue);
        }
    }

    function register(tableRendererInstance) {
        if (!tableRendererInstance) {
            console.error("DataTabEventHandlers: TableRenderer Instanz nicht übergeben.");
            return;
        }
        tableInstance = tableRendererInstance;

        const filterInput = document.getElementById('daten-filter-input');
        if (filterInput) {
            filterInput.addEventListener('input', debounce((event) => {
                currentFilterValue = event.target.value;
                _applyFilter();
            }, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS));
        } else {
            console.warn("Filter-Input 'daten-filter-input' nicht gefunden.");
        }

        const toggleDetailsButton = document.getElementById('daten-toggle-details');
        if (toggleDetailsButton) {
            toggleDetailsButton.addEventListener('click', () => {
                ui_helpers.toggleAllDetails('daten-table-body', 'daten-toggle-details');
            });
        } else {
            console.warn("Toggle-Details-Button 'daten-toggle-details' nicht gefunden.");
        }

        const tableHeader = document.getElementById('daten-table-header');
        if (tableHeader) {
            tableHeader.addEventListener('click', (event) => {
                const headerCell = event.target.closest('th[data-sort-key]');
                if (headerCell) {
                    const sortKey = headerCell.dataset.sortKey;
                    let subKey = null;
                    if (event.target.closest('.sortable-sub-header')) {
                        subKey = event.target.closest('.sortable-sub-header').dataset.subKey;
                    }
                    if (mainAppInterface && typeof mainAppInterface.handleSortChange === 'function') {
                         console.warn("Veralteter Aufruf an mainAppInterface.handleSortChange in data_tab_event_handlers. Benutze stattdessen dataTabLogic.");
                    } else if (dataTabLogic && typeof dataTabLogic.handleSortChange === 'function') {
                         dataTabLogic.handleSortChange(sortKey, subKey);
                    } else {
                        console.error("Sortierfunktion in dataTabLogic nicht gefunden.");
                    }
                }
            });
        } else {
            console.warn("Tabellenkopf 'daten-table-header' nicht gefunden.");
        }
        
        const tableBody = document.getElementById('daten-table-body');
        if(tableBody) {
            ui_helpers.attachRowCollapseListeners(tableBody);
            tableBody.addEventListener('click', (event) => {
                 const row = event.target.closest('tr[data-patient-id]');
                 if (row && row.dataset.patientId) {
                     if (dataTabLogic && typeof dataTabLogic.handleRowClick === 'function') {
                         dataTabLogic.handleRowClick(row.dataset.patientId, Array.from(row.parentNode.children).indexOf(row), event);
                     }
                 }
            });
        } else {
            console.warn("Tabellenkörper 'daten-table-body' nicht gefunden.");
        }
    }
    
    function clearFilter() {
        const filterInput = document.getElementById('daten-filter-input');
        if (filterInput) {
            filterInput.value = '';
        }
        currentFilterValue = '';
        _applyFilter();
    }


    return {
        register,
        clearFilter
    };
})();
