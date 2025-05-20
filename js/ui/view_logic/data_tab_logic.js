const dataTabLogic = (() => {

    function createDatenTableHTML(data, sortState) {
        if (!Array.isArray(data)) {
            console.error("createDatenTableHTML: Ungültige Daten für Tabelle, Array erwartet.");
            return '<p class="text-danger">Fehler: Ungültige Daten für Tabelle.</p>';
        }

        const tableId = 'daten-table'; // ID angepasst an den neuen Tab-Namen "Daten"
        const columns = [
            { key: 'nr', label: 'Nr', tooltip: TOOLTIP_CONTENT.datenTable.nr },
            { key: 'name', label: 'Name', tooltip: TOOLTIP_CONTENT.datenTable.name },
            { key: 'vorname', label: 'Vorname', tooltip: TOOLTIP_CONTENT.datenTable.vorname },
            { key: 'geschlecht', label: 'Geschl.', tooltip: TOOLTIP_CONTENT.datenTable.geschlecht },
            { key: 'alter', label: 'Alter', tooltip: TOOLTIP_CONTENT.datenTable.alter },
            { key: 'therapie', label: 'Therapie', tooltip: TOOLTIP_CONTENT.datenTable.therapie },
            { key: 'status', label: 'N/AS/T2', tooltip: TOOLTIP_CONTENT.datenTable.n_as_t2, subKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}] },
            { key: 'bemerkung', label: 'Bemerkung', tooltip: TOOLTIP_CONTENT.datenTable.bemerkung },
            { key: 'details', label: '', width: '30px'} // Für den Expand-Button
        ];

        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
        tableHTML += _createTableHeaderHTML(tableId, sortState, columns); // Private Hilfsfunktion
        tableHTML += `<tbody id="${tableId}-body">`;

        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">Keine Daten im ausgewählten Kollektiv gefunden.</td></tr>`;
        } else {
            data.forEach(patient => {
                // tableRenderer.createDatenTableRow anstatt tableRenderer.createPatientTableRow
                tableHTML += tableRenderer.createDatenTableRow(patient);
            });
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    // Private Hilfsfunktion, da sie nur hier benötigt wird und stark an das Spalten-Setup gekoppelt ist.
    function _createTableHeaderHTML(tableId, sortState, columns) {
        let headerHTML = `<thead class="small sticky-top bg-light" id="${tableId}-header"><tr>`; // sticky-top für fixierten Header beim Scrollen
        columns.forEach(col => {
            let sortIconHTML = '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>'; // Standard-Icon
            let mainHeaderClass = '';
            let thStyle = col.width ? `style="width: ${col.width};"` : '';
            if (col.textAlign) mainHeaderClass += ` text-${col.textAlign}`;

            // Bestimme, ob die Hauptspalte oder eine Unterspalte aktiv sortiert ist
            let isMainKeyActiveSort = false;
            let activeSubKey = null;

            if (sortState && sortState.key === col.key) {
                if (col.subKeys && col.subKeys.some(sk => sk.key === sortState.subKey)) {
                    isMainKeyActiveSort = true; // Markiere Hauptspalte als aktiv, wenn eine ihrer Unterspalten sortiert ist
                    activeSubKey = sortState.subKey;
                    sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                } else if (!col.subKeys && (sortState.subKey === null || sortState.subKey === undefined)) {
                    isMainKeyActiveSort = true;
                    sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                    thStyle += ' color: var(--primary-color);'; // Hebe aktiven Haupt-Header hervor
                }
            }

            const subHeaders = col.subKeys ? col.subKeys.map(sk => {
                 let subIconHTML = ''; // Icons werden jetzt am Haupt-TH angezeigt
                 const isActiveSubSort = activeSubKey === sk.key;
                 const style = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                 const thLabel = col.label || col.key;
                 const subLabel = sk.label || sk.key;
                 return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}" data-tippy-content="Sortieren nach ${thLabel} -> ${subLabel}">${subLabel}</span>`;
             }).join(' / ') : '';

            const sortAttributes = `data-sort-key="${col.key}" ${col.subKeys ? '' : 'style="cursor: pointer;"'}`;
            const tooltip = col.tooltip ? `data-tippy-content="${col.tooltip}"` : '';
            const thClass = mainHeaderClass; // mainHeaderClass enthält bereits text-align

            if (col.subKeys) {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} ${tooltip} ${thStyle}>${col.label} ${subHeaders ? `(${subHeaders})` : ''} ${sortIconHTML}</th>`;
             } else {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} ${tooltip} ${thStyle}>${col.label} ${sortIconHTML}</th>`;
             }
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }


    return Object.freeze({
        createDatenTableHTML
    });

})();
