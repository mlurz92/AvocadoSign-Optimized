const dataTabEventHandlers = (() => {

    function register() {
        const dataTabPane = document.getElementById('daten-tab-pane');
        if (!dataTabPane) {
            console.warn("DataTabEventHandlers: Daten-Tab-Pane ('daten-tab-pane') nicht gefunden. Handler nicht registriert.");
            return;
        }

        const toggleDetailsButton = dataTabPane.querySelector('#daten-toggle-details');
        if (toggleDetailsButton) {
            toggleDetailsButton.removeEventListener('click', _handleToggleDetailsClick);
            toggleDetailsButton.addEventListener('click', _handleToggleDetailsClick);
        } else {
            console.warn("DataTabEventHandlers: Toggle-Details-Button ('daten-toggle-details') nicht gefunden.");
        }

        const tableHeader = dataTabPane.querySelector('#daten-table-header');
        if (tableHeader) {
            tableHeader.removeEventListener('click', _handleTableHeaderClick);
            tableHeader.addEventListener('click', _handleTableHeaderClick);
        } else {
            console.warn("DataTabEventHandlers: Tabellenkopf ('daten-table-header') nicht gefunden.");
        }
        
        const tableBody = dataTabPane.querySelector('#daten-table-body');
        if(tableBody) {
            tableBody.removeEventListener('click', _handleTableBodyClick);
            tableBody.addEventListener('click', _handleTableBodyClick);
        } else {
            console.warn("DataTabEventHandlers: Tabellenkörper ('daten-table-body') nicht gefunden.");
        }
    }

    function _handleToggleDetailsClick(event) {
        const button = event.currentTarget;
        ui_helpers.toggleAllDetails('daten-table-body', button.id);
    }

    function _handleTableHeaderClick(event) {
        const headerCell = event.target.closest('th[data-sort-key]');
        if (headerCell) {
            const sortKey = headerCell.dataset.sortKey;
            let subKey = null;
            if (event.target.closest('.sortable-sub-header')) {
                subKey = event.target.closest('.sortable-sub-header').dataset.subKey;
            }
            if (typeof dataTabLogic !== 'undefined' && typeof dataTabLogic.handleSortChange === 'function') {
                dataTabLogic.handleSortChange(sortKey, subKey);
            } else {
                console.error("Sortierfunktion in dataTabLogic nicht gefunden.");
            }
        }
    }

    function _handleTableBodyClick(event) {
        const row = event.target.closest('tr[data-patient-id]');
        if (row && row.dataset.patientId) {
            if (typeof dataTabLogic !== 'undefined' && typeof dataTabLogic.handleRowClick === 'function') {
                dataTabLogic.handleRowClick(row.dataset.patientId, Array.from(row.parentNode.children).indexOf(row), event);
            }
        }
    }

    return Object.freeze({
        register
    });
})();

window.dataTabEventHandlers = dataTabEventHandlers;
