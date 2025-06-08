const auswertungTabLogic = (() => {

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

            const mainTooltip = col.key === 'details' ? (TOOLTIP_CONTENT.auswertungTable.expandRow || 'Details') : baseTooltipContent;
            const sortAttributes = `data-sort-key="${col.key}" ${col.subKeys || col.key === 'details' ? '' : 'style="cursor: pointer;"'}`;

            headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} data-tippy-content="${mainTooltip}" ${thStyle}>${col.label}${subHeaders ? ` (${subHeaders})` : ''} ${col.key === 'details' ? '' : sortIconHTML}</th>`;
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }

    function _createAuswertungTableHTML(data, sortState, appliedCriteria, appliedLogic) {
        if (!Array.isArray(data)) {
            return '<p class="text-danger">Fehler: Ungültige Auswertungsdaten für Tabelle.</p>';
        }

        const tableId = 'auswertung-table';
        const columns = [
            { key: 'nr', label: 'Nr', tooltip: TOOLTIP_CONTENT.auswertungTable.nr },
            { key: 'name', label: 'Name', tooltip: TOOLTIP_CONTENT.auswertungTable.name },
            { key: 'therapie', label: 'Therapie', tooltip: TOOLTIP_CONTENT.auswertungTable.therapie },
            { key: 'status', label: 'N/AS/T2', tooltip: TOOLTIP_CONTENT.auswertungTable.n_as_t2, subKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}]},
            { key: 'anzahl_patho_lk', label: 'N+/N ges.', tooltip: TOOLTIP_CONTENT.auswertungTable.n_counts, textAlign: 'center' },
            { key: 'anzahl_as_lk', label: 'AS+/AS ges.', tooltip: TOOLTIP_CONTENT.auswertungTable.as_counts, textAlign: 'center' },
            { key: 'anzahl_t2_lk', label: 'T2+/T2 ges.', tooltip: TOOLTIP_CONTENT.auswertungTable.t2_counts, textAlign: 'center' },
            { key: 'details', label: '', width: '30px'}
        ];

        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
        tableHTML += _createTableHeaderHTML(tableId, sortState, columns);
        tableHTML += `<tbody id="${tableId}-body">`;

        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">Keine Patienten im ausgewählten Kollektiv gefunden.</td></tr>`;
        } else {
            data.forEach(patient => {
                tableHTML += tableRenderer.createAuswertungTableRow(patient, appliedCriteria, appliedLogic);
            });
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    function createAuswertungTableCardHTML(data, sortState, appliedCriteria, appliedLogic) {
        const tableHTML = _createAuswertungTableHTML(data, sortState, appliedCriteria, appliedLogic);
        const toggleButtonTooltip = TOOLTIP_CONTENT.auswertungTable.expandAll;
        return `
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>Patientenübersicht & Auswertungsergebnisse</span>
                        <button id="auswertung-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${toggleButtonTooltip}">
                           Alle Details <i class="fas fa-chevron-down ms-1"></i>
                       </button>
                    </div>
                    <div class="card-body p-0">
                        <div id="auswertung-table-container" class="table-responsive">
                           ${tableHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    return Object.freeze({
        createAuswertungTableCardHTML
    });

})();
