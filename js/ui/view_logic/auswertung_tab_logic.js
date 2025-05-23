const auswertungTabLogic = (() => {

    function createAuswertungTableHTML(data, sortState, appliedCriteria, appliedLogic) {
        if (!Array.isArray(data)) {
            console.error("createAuswertungTableHTML: Ungültige Daten für Auswertungstabelle, Array erwartet.");
            const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
            const errorText = langKey === 'de' ? 'Fehler: Ungültige Auswertungsdaten für Tabelle.' : 'Error: Invalid evaluation data for table.';
            return `<p class="text-danger">${errorText}</p>`;
        }
        const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';

        const tableId = 'auswertung-table';
        const columns = [
            { key: 'nr', label: langKey === 'de' ? 'Nr.' : 'No.', tooltipKey: 'nr' },
            { key: 'name', label: langKey === 'de' ? 'Name' : 'Name', tooltipKey: 'name' },
            { key: 'therapie', label: langKey === 'de' ? 'Therapie' : 'Therapy', tooltipKey: 'therapie' },
            { key: 'status', label: 'N/AS/T2', tooltipKey: 'n_as_t2', subKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}]},
            { key: 'anzahl_patho_lk', label: langKey === 'de' ? 'N+/N ges.' : 'N+/N total', tooltipKey: 'n_counts', textAlign: 'center' },
            { key: 'anzahl_as_lk', label: langKey === 'de' ? 'AS+/AS ges.' : 'AS+/AS total', tooltipKey: 'as_counts', textAlign: 'center' },
            { key: 'anzahl_t2_lk', label: langKey === 'de' ? 'T2+/T2 ges.' : 'T2+/T2 total', tooltipKey: 't2_counts', textAlign: 'center' },
            { key: 'details', label: '', width: '30px', tooltipKey: null}
        ];

        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
        tableHTML += _createTableHeaderHTML(tableId, sortState, columns, langKey);
        tableHTML += `<tbody id="${tableId}-body">`;

        if (data.length === 0) {
            const noDataText = langKey === 'de' ? 'Keine Patienten im ausgewählten Kollektiv gefunden.' : 'No patients found in the selected cohort.';
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">${noDataText}</td></tr>`;
        } else {
            data.forEach(patient => {
                tableHTML += tableRenderer.createAuswertungTableRow(patient, appliedCriteria, appliedLogic);
            });
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    function _createTableHeaderHTML(tableId, sortState, columns, langKey) {
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
                    thStyle += (thStyle ? ' ' : 'style="') + 'color: var(--primary-color);';
                    if(!thStyle.endsWith('"')) thStyle += '"';
                }
            }
            const thLabelText = col.label;
            const subHeaders = col.subKeys ? col.subKeys.map(sk => {
                 const isActiveSubSort = activeSubKey === sk.key;
                 const style = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                 const subLabel = sk.label || sk.key;
                 const sortText = langKey === 'de' ? 'Sortieren nach' : 'Sort by';
                 return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}" data-tippy-content="${sortText} ${thLabelText} -> ${subLabel}">${subLabel}</span>`;
             }).join(' / ') : '';

            const sortAttributes = `data-sort-key="${col.key}" ${col.subKeys || col.key === 'details' ? '' : 'style="cursor: pointer;"'}`;
            const tooltipBase = col.tooltipKey ? TOOLTIP_CONTENT.auswertungTable[col.tooltipKey] : null;
            const tooltipText = tooltipBase ? ((typeof tooltipBase === 'object' ? tooltipBase[langKey] : tooltipBase?.[langKey]) || tooltipBase?.['de'] || col.label) : '';
            const tooltip = tooltipText && col.key !== 'details' ? `data-tippy-content="${tooltipText}"` : '';
            const thClass = mainHeaderClass;

            if (col.subKeys) {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} ${tooltip} ${thStyle}>${thLabelText} ${subHeaders ? `(${subHeaders})` : ''} ${sortIconHTML}</th>`;
             } else {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} ${tooltip} ${thStyle}>${thLabelText} ${col.key === 'details' ? '' : sortIconHTML}</th>`;
             }
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }

    function createAuswertungTableCardHTML(data, sortState, appliedCriteria, appliedLogic) {
        const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
        const tableHTML = createAuswertungTableHTML(data, sortState, appliedCriteria, appliedLogic);

        const cardTitleText = langKey === 'de' ? 'Patientenübersicht & Auswertungsergebnisse' : 'Patient Overview & Evaluation Results';
        const buttonText = langKey === 'de' ? 'Alle Details' : 'All Details';
        const tooltipTextBase = TOOLTIP_CONTENT.auswertungTable.expandAll;
        const toggleButtonTooltip = (typeof tooltipTextBase === 'object' ? tooltipTextBase[langKey] : tooltipTextBase?.[langKey]) || (langKey==='de'?'Alle Details ein-/ausblenden':'Expand/collapse all details');

        return `
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>${cardTitleText}</span>
                        <button id="auswertung-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${toggleButtonTooltip}">
                           ${buttonText} <i class="fas fa-chevron-down ms-1"></i>
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
