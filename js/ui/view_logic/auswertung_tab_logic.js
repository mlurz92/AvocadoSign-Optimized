const auswertungTabLogic = (() => {

    function createAuswertungTableHTML(data, sortState, appliedCriteria, appliedLogic) {
        if (!Array.isArray(data)) {
            console.error("createAuswertungTableHTML: Ungültige Daten für Auswertungstabelle, Array erwartet.");
            return '<p class="text-danger">Fehler: Ungültige Auswertungsdaten für Tabelle.</p>';
        }

        const tableId = 'auswertung-table';
        const columns = [
            { key: 'nr', label: 'Nr', tooltip: window.TOOLTIP_CONTENT.auswertungTable.nr || 'Fortlaufende Nummer des Patienten.' },
            { key: 'name', label: 'Name', tooltip: window.TOOLTIP_CONTENT.auswertungTable.name || 'Nachname des Patienten (anonymisiert/kodiert).' },
            { key: 'therapie', label: 'Therapie', tooltip: window.TOOLTIP_CONTENT.auswertungTable.therapie || 'Angewandte Therapie vor der Operation.' },
            { key: 'status', label: 'N/AS/T2', tooltip: window.TOOLTIP_CONTENT.auswertungTable.n_as_t2 || 'Status: Pathologie (N), Avocado Sign (AS), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung.', subKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}]},
            { key: 'anzahl_patho_lk', label: 'N+/N ges.', tooltip: window.TOOLTIP_CONTENT.auswertungTable.n_counts || 'Pathologisch N+ LK / Gesamt N LK.', textAlign: 'center' },
            { key: 'anzahl_as_lk', label: 'AS+/AS ges.', tooltip: window.TOOLTIP_CONTENT.auswertungTable.as_counts || 'Avocado Sign (AS)+ LK / Gesamt AS LK.', textAlign: 'center' },
            { key: 'anzahl_t2_lk', label: 'T2+/T2 ges.', tooltip: window.TOOLTIP_CONTENT.auswertungTable.t2_counts || 'T2+ LK (aktuelle Kriterien) / Gesamt T2 LK.', textAlign: 'center' },
            { key: 'details', label: '', width: '30px'}
        ];

        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
        tableHTML += _createTableHeaderHTML(tableId, sortState, columns);
        tableHTML += `<tbody id="${tableId}-body">`;

        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">Keine Patienten im ausgewählten Kollektiv gefunden.</td></tr>`;
        } else {
            data.forEach(patient => {
                tableHTML += window.tableRenderer.createAuswertungTableRow(patient, appliedCriteria, appliedLogic);
            });
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    function _createTableHeaderHTML(tableId, sortState, columns) {
        let headerHTML = `<thead class="small sticky-top bg-light" id="${tableId}-header"><tr>`;
        columns.forEach(col => {
            let sortIconHTML = '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>';
            let mainHeaderClass = '';
            let thStyle = col.width ? `style="width: ${col.width};"` : '';
             if (col.textAlign) mainHeaderClass += ` text-${col.textAlign}`;

            let isMainKeyActiveSort = false;
            let activeSubKey = null;

            if (sortState && sortState.key === col.key) {
                if (col.subKeys && col.subKeys.some(sk => sk.key === sortState.subKey)) {
                    isMainKeyActiveSort = true;
                    activeSubKey = sortState.subKey;
                    sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                } else if (!col.subKeys && (sortState.subKey === null || sortState.subKey === undefined)) {
                    isMainKeyActiveSort = true;
                    sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                    thStyle += (thStyle ? ' ' : 'style="') + 'color: var(--primary-color);"';
                    if(!thStyle.endsWith('"')) thStyle += '"';
                }
            }
            
            const baseTooltipContent = col.tooltip || col.label;

            const subHeaders = col.subKeys ? col.subKeys.map(sk => {
                 const isActiveSubSort = activeSubKey === sk.key;
                 const style = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                 const subLabel = sk.label || sk.key.toUpperCase();
                 const subTooltip = `Sortieren nach Status ${subLabel}. ${baseTooltipContent}`;
                 return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}" data-tippy-content="${subTooltip}">${subLabel}</span>`;
             }).join(' / ') : '';

            const mainTooltip = col.subKeys ? `${baseTooltipContent} Klicken Sie auf N, AS oder T2 für Sub-Sortierung.` : (col.key === 'details' ? (window.TOOLTIP_CONTENT.auswertungTable.expandRow || 'Details ein-/ausblenden') : `Sortieren nach ${col.label}. ${baseTooltipContent}`);
            const sortAttributes = `data-sort-key="${col.key}" ${col.subKeys || col.key === 'details' ? '' : 'style="cursor: pointer;"'}`;
            const thClass = mainHeaderClass;

            if (col.subKeys) {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} data-tippy-content="${mainTooltip}" ${thStyle}>${col.label} ${subHeaders ? `(${subHeaders})` : ''} ${isMainKeyActiveSort && !activeSubKey ? sortIconHTML : '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>'}</th>`;
             } else {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} data-tippy-content="${mainTooltip}" ${thStyle}>${col.label} ${col.key === 'details' ? '' : sortIconHTML}</th>`;
             }
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }

    function createAuswertungTableCardHTML(data, sortState, appliedCriteria, appliedLogic) {
        const tableHTML = createAuswertungTableHTML(data, sortState, appliedCriteria, appliedLogic);
        const toggleButtonTooltip = window.TOOLTIP_CONTENT.auswertungTable.expandAll || 'Alle Detailansichten (Bewertung einzelner T2-LKs) für Patienten in dieser Tabelle ein- oder ausblenden.';
        return `
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>Patientenübersicht & Auswertungsergebnisse (basierend auf angewandten T2-Kriterien)</span>
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
        createAuswertungTableHTML,
        createAuswertungTableCardHTML
    });

})();
