const dataRenderer = (() => {

    function render(data, sortState) {
        const tableId = "daten-table";
        const tableBodyId = "daten-table-body";
        const toggleAllButtonId = "daten-toggle-details";
        const noDataMessage = `<td colspan="9" class="text-center text-muted p-3">Keine Patientendaten für das aktuelle Kollektiv verfügbar.</td>`;

        const headers = [
            { key: 'expand', label: '', sortable: false, class: 'text-center p-1', style: 'width: 40px;' },
            { key: 'nr', label: 'Nr.', sortable: true, tooltip: TOOLTIP_CONTENT.datenTable.nr.description },
            { key: 'name', label: 'Name', sortable: true, tooltip: TOOLTIP_CONTENT.datenTable.name.description },
            { key: 'vorname', label: 'Vorname', sortable: true, tooltip: TOOLTIP_CONTENT.datenTable.vorname.description },
            { key: 'geschlecht', label: 'G', sortable: true, tooltip: TOOLTIP_CONTENT.datenTable.geschlecht.description, class: 'text-center' },
            { key: 'alter', label: 'Alter', sortable: true, tooltip: TOOLTIP_CONTENT.datenTable.alter.description, class: 'text-center' },
            { key: 'therapie', label: 'Therapie', sortable: true, tooltip: TOOLTIP_CONTENT.datenTable.therapie.description },
            {
                key: 'status',
                label: 'N | AS | T2',
                sortable: true,
                subSortKeys: [
                    { key: 'n', label: 'N' },
                    { key: 'as', label: 'AS' },
                    { key: 't2', label: 'T2' }
                ],
                tooltip: TOOLTIP_CONTENT.datenTable.n_as_t2.description,
                class: 'text-center'
            },
            { key: 'bemerkung', label: 'Bemerkung', sortable: true, tooltip: TOOLTIP_CONTENT.datenTable.bemerkung.description, style: 'min-width: 150px;'}
        ];
        
        const tableHeaderHTML = tableRenderer.createSortableTableHeaders(headers, sortState);
        
        let tableBodyHTML = '';
        if (!data || data.length === 0) {
            tableBodyHTML = `<tr>${noDataMessage}</tr>`;
        } else {
            tableBodyHTML = data.map(patient => tableRenderer.createDatenTableRow(patient)).join('');
        }

        return `
            <div class="d-flex justify-content-end mb-2">
                <button class="btn btn-sm btn-outline-secondary" id="${toggleAllButtonId}" data-tippy-content="${TOOLTIP_CONTENT.datenTable.expandAll.description}" data-action="expand">
                    <i class="fas fa-chevron-down me-1"></i>Alle Details Anzeigen
                </button>
            </div>
            <div class="table-responsive">
                <table class="table table-sm table-hover data-table" id="${tableId}">
                    ${tableHeaderHTML}
                    <tbody id="${tableBodyId}">
                        ${tableBodyHTML}
                    </tbody>
                </table>
            </div>`;
    }

    return Object.freeze({
        render
    });

})();
