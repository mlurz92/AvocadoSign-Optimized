const dataTab = (() => {

    function _createDatenDetailRowContent(patient) {
        if (!Array.isArray(patient.lymphknoten_t2) || patient.lymphknoten_t2.length === 0) {
            return `<p class="m-0 p-2 text-muted small">${TEXT_CONFIG.de.datenTab.keineT2LK}</p>`;
        }

        let content = `<h6 class="w-100 mb-2 ps-1">${TEXT_CONFIG.de.datenTab.detailTitel}</h6>`;
        patient.lymphknoten_t2.forEach((lk, index) => {
            if (!lk) return;
            
            const groesseText = formatNumber(lk.groesse, 1, 'N/A');
            const formText = lk.form || '--';
            const konturText = lk.kontur || '--';
            const homogenitaetText = lk.homogenitaet || '--';
            const signalText = lk.signal || 'N/A';

            const formIcon = commonComponents.createT2CriteriaIcon(CONSTANTS.T2_CRITERIA_KEYS.FORM, lk.form);
            const konturIcon = commonComponents.createT2CriteriaIcon(CONSTANTS.T2_CRITERIA_KEYS.KONTUR, lk.kontur);
            const homogenitaetIcon = commonComponents.createT2CriteriaIcon(CONSTANTS.T2_CRITERIA_KEYS.HOMOGENITAET, lk.homogenitaet);
            const signalIcon = commonComponents.createT2CriteriaIcon(CONSTANTS.T2_CRITERIA_KEYS.SIGNAL, lk.signal);

            content += `
                <div class="sub-row-item border rounded mb-1 p-1 w-100 align-items-center small">
                   <strong class="me-2">LK ${index + 1}:</strong>
                   <span class="me-3 text-nowrap" data-tippy-content="${TEXT_CONFIG.de.tooltips.t2Size}">${groesseText} mm</span>
                   <span class="me-3 text-nowrap" data-tippy-content="${TEXT_CONFIG.de.tooltips.t2Form}">${formIcon} ${formText}</span>
                   <span class="me-3 text-nowrap" data-tippy-content="${TEXT_CONFIG.de.tooltips.t2Kontur}">${konturIcon} ${konturText}</span>
                   <span class="me-3 text-nowrap" data-tippy-content="${TEXT_CONFIG.de.tooltips.t2Homogenitaet}">${homogenitaetIcon} ${homogenitaetText}</span>
                   <span class="me-3 text-nowrap" data-tippy-content="${TEXT_CONFIG.de.tooltips.t2Signal}">${signalIcon} ${signalText}</span>
                </div>`;
        });
        return content;
    }

    function _createDatenTableRow(patient) {
        if (!patient || typeof patient.nr !== 'number') return '';
        const rowId = `daten-row-${patient.nr}`;
        const detailRowId = `daten-detail-${patient.nr}`;
        const hasT2Nodes = Array.isArray(patient.lymphknoten_t2) && patient.lymphknoten_t2.length > 0;
        
        const geschlechtText = patient.geschlecht === 'm' ? 'm' : patient.geschlecht === 'f' ? 'w' : '?';
        const therapieText = getKollektivDisplayName(patient.therapie);
        const naPlaceholder = '--';

        const t2StatusIcon = patient.t2 === '+' ? 'plus' : patient.t2 === '-' ? 'minus' : 'unknown';
        const t2StatusText = patient.t2 ?? '?';

        return `
            <tr id="${rowId}" ${hasT2Nodes ? `class="clickable-row"` : ''} ${hasT2Nodes ? `data-bs-toggle="collapse"` : ''} data-bs-target="#${detailRowId}" aria-expanded="false" aria-controls="${detailRowId}">
                <td data-label="Nr.">${patient.nr}</td>
                <td data-label="Name">${patient.name || naPlaceholder}</td>
                <td data-label="Vorname">${patient.vorname || naPlaceholder}</td>
                <td data-label="Geschlecht">${geschlechtText}</td>
                <td data-label="Alter">${formatNumber(patient.alter, 0, naPlaceholder)}</td>
                <td data-label="Therapie">${therapieText}</td>
                <td data-label="N/AS/T2">
                    <span class="status-${patient.n === '+' ? 'plus' : 'minus'}">${patient.n ?? '?'}</span> /
                    <span class="status-${patient.as === '+' ? 'plus' : 'minus'}">${patient.as ?? '?'}</span> /
                    <span class="status-${t2StatusIcon}" id="status-t2-pat-${patient.nr}">${t2StatusText}</span>
                </td>
                <td data-label="Bemerkung" class="text-truncate" style="max-width: 150px;">${patient.bemerkung || ''}</td>
                <td class="text-center p-1" style="width: 30px;">
                    ${hasT2Nodes ? `<button class="btn btn-sm btn-outline-secondary p-1 row-toggle-button" aria-label="Details"><i class="fas fa-chevron-down row-toggle-icon"></i></button>` : ''}
                </td>
            </tr>
            ${hasT2Nodes ? `
            <tr class="sub-row">
                 <td colspan="9" class="p-0 border-0">
                    <div class="collapse" id="${detailRowId}">
                        <div class="sub-row-content p-2 bg-light border-top border-bottom">
                           ${_createDatenDetailRowContent(patient)}
                        </div>
                    </div>
                 </td>
            </tr>` : ''}
        `;
    }

    function _createTableHeader(tableId, sortState) {
        const columns = [
            { key: CONSTANTS.DATA_KEYS.PATIENT_NR, label: 'Nr', tooltipKey: 'nr' },
            { key: 'name', label: 'Name', tooltipKey: 'name' },
            { key: 'vorname', label: 'Vorname', tooltipKey: 'vorname' },
            { key: 'geschlecht', label: 'Geschl.', tooltipKey: 'geschlecht' },
            { key: 'alter', label: 'Alter', tooltipKey: 'alter' },
            { key: CONSTANTS.DATA_KEYS.THERAPIE, label: 'Therapie', tooltipKey: 'therapie' },
            { key: 'status', label: 'N/AS/T2', tooltipKey: 'n_as_t2', subKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}] },
            { key: 'bemerkung', label: 'Bemerkung', tooltipKey: 'bemerkung' },
            { key: 'details', label: '', width: '30px', tooltipKey: 'expandRow'}
        ];

        let headerHTML = `<thead class="small sticky-top bg-light" id="${tableId}-header"><tr>`;
        columns.forEach(col => {
            const tooltipContent = TEXT_CONFIG.de.tooltips.datenTable[col.tooltipKey] || col.label;
            let sortIconHTML = col.key !== 'details' ? '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>' : '';
            let thClass = '';

            if (sortState && sortState.key === col.key && !col.subKeys) {
                sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                thClass = 'text-primary';
            }

            const subHeaders = col.subKeys ? col.subKeys.map(sk => {
                 const isActiveSubSort = sortState && sortState.key === col.key && sortState.subKey === sk.key;
                 if (isActiveSubSort) {
                     sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                 }
                 const style = isActiveSubSort ? 'font-weight: bold; color: var(--primary-color);' : '';
                 return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}">${sk.label}</span>`;
            }).join(' / ') : '';

            const sortAttributes = `data-sort-key="${col.key}" ${col.key !== 'details' ? 'style="cursor: pointer;"' : ''}`;
            const finalTooltip = col.subKeys ? `${tooltipContent} Klicken zur Sortierung nach ${col.subKeys.map(sk=>sk.label).join('/')}.` : tooltipContent;

            headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} data-tippy-content="${finalTooltip}" style="${col.width ? `width:${col.width}` : ''}">
                ${col.label} ${subHeaders ? `(${subHeaders})` : ''} ${sortIconHTML}
            </th>`;
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }

    function render(data, sortState) {
        if (!Array.isArray(data)) {
            return '<p class="text-danger">Fehler: Ungültige Patientendaten für Tabelle.</p>';
        }

        const tableId = 'daten-table';
        const tableHeader = _createTableHeader(tableId, sortState);
        
        let tableBody = `<tbody id="${tableId}-body">`;
        if (data.length === 0) {
            tableBody += `<tr><td colspan="9" class="text-center text-muted p-3">Keine Patienten im ausgewählten Kollektiv gefunden.</td></tr>`;
        } else {
            data.forEach(patient => {
                tableBody += _createDatenTableRow(patient);
            });
        }
        tableBody += `</tbody>`;

        const tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">${tableHeader}${tableBody}</table>`;
        
        const toggleButtonHTML = `
             <div class="d-flex justify-content-end mb-3">
                 <button id="${CONSTANTS.SELECTORS.DATEN_TOGGLE_DETAILS.substring(1)}" class="btn btn-sm btn-outline-secondary" data-action="expand">
                    Alle Details Anzeigen <i class="fas fa-chevron-down ms-1"></i>
                </button>
             </div>`;

        return `${toggleButtonHTML}<div class="table-responsive">${tableHTML}</div>`;
    }

    return Object.freeze({
        render
    });

})();
