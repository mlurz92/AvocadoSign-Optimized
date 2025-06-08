const dataTabLogic = (() => {

    function _createTableHeaderHTML(tableId, sortState, columns) {
        let headerHTML = `<thead class="small sticky-top bg-light" id="${tableId}-header"><tr>`;
        columns.forEach(col => {
            let sortIconHTML = '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>';
            let thClass = col.textAlign ? `text-${col.textAlign}` : '';
            let thStyle = col.width ? `style="width: ${col.width};"` : '';

            if (sortState && sortState.key === col.key) {
                if (!col.subKeys || (col.subKeys && col.subKeys.some(sk => sk.key === sortState.subKey))) {
                    sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                }
            }

            const baseTooltipContent = col.tooltip || col.label;
            const subHeaders = col.subKeys ? col.subKeys.map(sk => {
                 const isActiveSubSort = sortState.key === col.key && sk.key === sortState.subKey;
                 const style = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                 return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}" data-tippy-content="Sortieren nach: ${sk.label}">${sk.label}</span>`;
            }).join(' / ') : '';

            const mainTooltip = col.key === 'details' ? (TOOLTIP_CONTENT.datenTable.expandRow || 'Details') : baseTooltipContent;
            const sortAttributes = `data-sort-key="${col.key}" ${col.subKeys || col.key === 'details' ? '' : 'style="cursor: pointer;"'}`;

            headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} data-tippy-content="${mainTooltip}" ${thStyle}>${col.label}${subHeaders ? ` (${subHeaders})` : ''} ${col.key === 'details' ? '' : sortIconHTML}</th>`;
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }

    function createDatenTableHTML(data, sortState) {
        if (!Array.isArray(data)) {
            return '<p class="text-danger">Fehler: Ungültige Daten für Tabelle.</p>';
        }

        const tableId = 'daten-table';
        const columns = [
            { key: 'nr', label: 'Nr', tooltip: TOOLTIP_CONTENT.datenTable.nr },
            { key: 'name', label: 'Name', tooltip: TOOLTIP_CONTENT.datenTable.name },
            { key: 'vorname', label: 'Vorname', tooltip: TOOLTIP_CONTENT.datenTable.vorname },
            { key: 'geschlecht', label: 'Geschl.', tooltip: TOOLTIP_CONTENT.datenTable.geschlecht },
            { key: 'alter', label: 'Alter', tooltip: TOOLTIP_CONTENT.datenTable.alter },
            { key: 'therapie', label: 'Therapie', tooltip: TOOLTIP_CONTENT.datenTable.therapie },
            { key: 'status', label: 'N/AS/T2', tooltip: TOOLTIP_CONTENT.datenTable.n_as_t2, subKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}] },
            { key: 'bemerkung', label: 'Bemerkung', tooltip: TOOLTIP_CONTENT.datenTable.bemerkung },
            { key: 'details', label: '', width: '30px'}
        ];

        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
        tableHTML += _createTableHeaderHTML(tableId, sortState, columns);
        tableHTML += `<tbody id="${tableId}-body">`;

        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">Keine Daten im ausgewählten Kollektiv gefunden.</td></tr>`;
        } else {
            data.forEach(patient => {
                tableHTML += tableRenderer.createDatenTableRow(patient);
            });
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    return Object.freeze({
        createDatenTableHTML
    });

})();
