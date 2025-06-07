const dataTabLogic = (() => {

    const dataTableId = 'daten-table-body';
    const dataTableHeaderId = 'daten-table-header';
    let currentSortState = APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT;

    function init() {
        _attachEventListeners();
        ui_helpers.updateSortIcons(dataTableHeaderId, currentSortState);
        ui_helpers.initializeTooltips(document.getElementById('data-tab-pane'));
    }

    function _attachEventListeners() {
        const tableHeader = document.getElementById(dataTableHeaderId);
        if (tableHeader) {
            tableHeader.querySelectorAll('th[data-sort-key]').forEach(header => {
                header.addEventListener('click', (event) => {
                    const sortKey = header.dataset.sortKey;
                    let subKey = header.dataset.subKey;
                    
                    const clickedElement = event.target.closest('[data-sub-key]');
                    if (clickedElement) {
                        subKey = clickedElement.dataset.subKey;
                    } else if (sortKey === 'n_as_t2') {
                        subKey = null; // Reset subKey if parent header is clicked again without specific sub-element
                    }

                    if (currentSortState.key === sortKey && currentSortState.subKey === subKey) {
                        currentSortState.direction = currentSortState.direction === 'asc' ? 'desc' : 'asc';
                    } else {
                        currentSortState.key = sortKey;
                        currentSortState.subKey = subKey;
                        currentSortState.direction = 'asc';
                    }
                    render(state.getProcessedData());
                });
            });
        }

        const toggleDetailsBtn = document.getElementById('daten-toggle-details');
        if (toggleDetailsBtn) {
            toggleDetailsBtn.addEventListener('click', () => {
                ui_helpers.toggleAllDetails(dataTableId, 'daten-toggle-details');
            });
        }
    }

    function render(processedData) {
        tableRenderer.renderDataTable(processedData, currentSortState);
        ui_helpers.updateSortIcons(dataTableHeaderId, currentSortState);
        ui_helpers.initializeTooltips(document.getElementById('data-tab-pane'));
    }

    return Object.freeze({
        init,
        render
    });

})();
