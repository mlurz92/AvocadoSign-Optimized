const auswertungTabLogic = (() => {

    function createAuswertungTableHTML(data, sortState, appliedCriteria, appliedLogic) {
        if (!Array.isArray(data)) {
            console.error("createAuswertungTableHTML: Ungültige Daten für Auswertungstabelle, Array erwartet.");
            return '<p class="text-danger">Fehler: Ungültige Auswertungsdaten für Tabelle.</p>';
        }

        const tableId = 'auswertung-table';
        const columns = [
            { key: 'nr', label: 'Nr', tooltip: TOOLTIP_CONTENT?.de?.auswertungTable?.nr || 'Nr.' },
            { key: 'name', label: 'Name', tooltip: TOOLTIP_CONTENT?.de?.auswertungTable?.name || 'Name' },
            { key: 'therapie', label: 'Therapie', tooltip: TOOLTIP_CONTENT?.de?.auswertungTable?.therapie || 'Therapie' },
            { key: 'status', label: 'N/AS/T2', tooltip: TOOLTIP_CONTENT?.de?.auswertungTable?.n_as_t2 || 'N/AS/T2 Status', subKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}]},
            { key: 'anzahl_patho_lk', label: 'N+/N ges.', tooltip: TOOLTIP_CONTENT?.de?.auswertungTable?.n_counts || 'N+ LKs / N gesamt LKs (Pathologie)', textAlign: 'center' },
            { key: 'anzahl_as_lk', label: 'AS+/AS ges.', tooltip: TOOLTIP_CONTENT?.de?.auswertungTable?.as_counts || 'AS+ LKs / AS gesamt LKs (T1KM)', textAlign: 'center' },
            { key: 'anzahl_t2_lk', label: 'T2+/T2 ges.', tooltip: TOOLTIP_CONTENT?.de?.auswertungTable?.t2_counts || 'T2+ LKs / T2 gesamt LKs (angew. Kriterien)', textAlign: 'center' },
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

            const subHeaders = col.subKeys ? col.subKeys.map(sk => {
                 const isActiveSubSort = activeSubKey === sk.key;
                 const style = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                 const thLabel = col.label || col.key;
                 const subLabel = sk.label || sk.key;
                 return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}" data-tippy-content="Sortieren nach ${thLabel} -> ${subLabel}">${subLabel}</span>`;
             }).join(' / ') : '';

            const sortAttributes = `data-sort-key="${col.key}" ${col.subKeys || col.key === 'details' ? '' : 'style="cursor: pointer;"'}`;
            const tooltip = col.tooltip && col.key !== 'details' ? `data-tippy-content="${col.tooltip}"` : '';
            const thClass = mainHeaderClass;

            if (col.subKeys) {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} ${tooltip} ${thStyle}>${col.label} ${subHeaders ? `(${subHeaders})` : ''} ${sortIconHTML}</th>`;
             } else {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} ${tooltip} ${thStyle}>${col.label} ${col.key === 'details' ? '' : sortIconHTML}</th>`;
             }
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }

    function createAuswertungTableCardHTML(data, sortState, appliedCriteria, appliedLogic, lang = 'de') {
        const effectiveLang = UI_TEXTS?.auswertungTab?.tableCard?.[lang] ? lang : 'de';
        const uiStrings = UI_TEXTS.auswertungTab?.tableCard?.[effectiveLang] || UI_TEXTS.auswertungTab?.tableCard?.de || {};

        const tableHTML = createAuswertungTableHTML(data, sortState, appliedCriteria, appliedLogic); // Lang not needed as table content is mostly data/icons
        const toggleButtonTooltip = TOOLTIP_CONTENT?.[effectiveLang]?.auswertungTable?.expandAll || TOOLTIP_CONTENT?.de?.auswertungTable?.expandAll || 'Alle Details ein-/ausblenden';
        const cardTitle = uiStrings.title || "Patientenübersicht & Auswertungsergebnisse";
        const toggleButtonText = uiStrings.expandAllButton || "Alle Details";

        return `
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>${cardTitle}</span>
                        <button id="auswertung-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${toggleButtonTooltip}">
                           ${toggleButtonText} <i class="fas fa-chevron-down ms-1"></i>
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
