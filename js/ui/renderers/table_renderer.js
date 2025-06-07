const tableRenderer = (() => {

    function createSortableTableHeaders(columns, sortState = {}) {
        let headerHTML = '<thead><tr>';
        columns.forEach(header => {
            const { key, label, sortable = true, tooltip = '', subSortKeys, style = '', class: headerClass = '' } = header;
            const thStyle = style ? `style="${style}"` : '';
            const tippyContent = tooltip ? `data-tippy-content="${tooltip}"` : '';
            const sortableClass = sortable ? 'sortable-header' : '';
            const thClasses = [headerClass, sortableClass].filter(Boolean).join(' ');

            let sortIconHTML = '';
            if (sortable) {
                sortIconHTML = '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>';
                if (sortState.key === key) {
                    if (!subSortKeys || !sortState.subKey || subSortKeys.some(sk => sk.key === sortState.subKey)) {
                        sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                    }
                }
            }

            headerHTML += `<th scope="col" class="${thClasses}" ${thStyle} data-sort-key="${key}" ${tippyContent}>`;

            if (subSortKeys && Array.isArray(subSortKeys)) {
                const subHeaders = subSortKeys.map(sk => {
                    const isActiveSubSort = sortState.key === key && sortState.subKey === sk.key;
                    const subStyle = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                    const subTooltip = `Sortieren nach Status ${sk.label}.`;
                    return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${subStyle}" data-tippy-content="${subTooltip}">${sk.label}</span>`;
                }).join(' / ');
                headerHTML += `${label} (${subHeaders}) ${sortIconHTML}`;
            } else {
                headerHTML += `${label} ${sortIconHTML}`;
            }

            headerHTML += `</th>`;
        });
        headerHTML += '</tr></thead>';
        return headerHTML;
    }

    function createDatenTableRow(patient) {
        if (!patient) return '';
        const rowId = `patient-row-${patient.nr}`;
        const collapseId = `collapse-details-${patient.nr}`;
        const hasT2Data = patient.lymphknoten_t2 && patient.lymphknoten_t2.length > 0;

        let rowHTML = `
            <tr id="${rowId}" class="${hasT2Data ? 'clickable-row' : ''}" ${hasT2Data ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}"` : ''} data-patient-id="${patient.nr}">
                <td class="text-center p-1">
                    ${hasT2Data ? `<button class="btn btn-sm row-toggle-button" aria-label="Details anzeigen/ausblenden" data-tippy-content="${TOOLTIP_CONTENT.datenTable.expandRow.description}"><i class="fas fa-chevron-down row-toggle-icon"></i></button>` : ''}
                </td>
                <td>${patient.nr ?? 'N/A'}</td>
                <td>${patient.name || 'N/A'}</td>
                <td>${patient.vorname || ''}</td>
                <td class="text-center">${patient.geschlecht === 'm' ? 'M' : (patient.geschlecht === 'f' ? 'W' : 'U')}</td>
                <td class="text-center">${patient.alter ?? 'N/A'}</td>
                <td>${getKollektivDisplayName(patient.therapie) || 'N/A'}</td>
                <td class="text-center">
                    <span class="status-badge ${getStatusClass(patient.n)}">${patient.n || '?'}</span> |
                    <span class="status-badge ${getStatusClass(patient.as)}">${patient.as || '?'}</span> |
                    <span class="status-badge ${getStatusClass(patient.t2)}">${patient.t2 || '?'}</span>
                </td>
                <td style="white-space: normal; max-width: 300px; overflow-wrap: break-word;">${patient.bemerkung || ''}</td>
            </tr>`;

        if (hasT2Data) {
            rowHTML += `
                <tr class="sub-row">
                    <td colspan="9" class="p-0">
                        <div class="collapse" id="${collapseId}">
                            ${_createT2LymphknotenDetailHTML(patient.lymphknoten_t2)}
                        </div>
                    </td>
                </tr>`;
        }
        return rowHTML;
    }

    function createAuswertungTableRow(patient, appliedCriteria, appliedLogic) {
        if (!patient) return '';
        const rowId = `auswertung-patient-row-${patient.nr}`;
        const collapseId = `auswertung-collapse-details-${patient.nr}`;
        const hasT2BewertetData = patient.lymphknoten_t2_bewertet && patient.lymphknoten_t2_bewertet.length > 0;

        let rowHTML = `
            <tr id="${rowId}" class="${hasT2BewertetData ? 'clickable-row' : ''}" ${hasT2BewertetData ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}"` : ''} data-patient-id="${patient.nr}">
                <td class="text-center p-1">
                    ${hasT2BewertetData ? `<button class="btn btn-sm row-toggle-button" aria-label="Details anzeigen/ausblenden" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.expandRow.description}"><i class="fas fa-chevron-down row-toggle-icon"></i></button>` : ''}
                </td>
                <td>${patient.nr ?? 'N/A'}</td>
                <td>${patient.name || 'N/A'}</td>
                <td>${getKollektivDisplayName(patient.therapie) || 'N/A'}</td>
                <td class="text-center">
                    <span class="status-badge ${getStatusClass(patient.n)}">${patient.n || '?'}</span> |
                    <span class="status-badge ${getStatusClass(patient.as)}">${patient.as || '?'}</span> |
                    <span class="status-badge ${getStatusClass(patient.t2)}">${patient.t2 || '?'}</span>
                </td>
                <td class="text-center">${formatNumber(patient.anzahl_patho_n_plus_lk, 0, '0')} / ${formatNumber(patient.anzahl_patho_lk, 0, '0')}</td>
                <td class="text-center">${formatNumber(patient.anzahl_as_plus_lk, 0, '0')} / ${formatNumber(patient.anzahl_as_lk, 0, '0')}</td>
                <td class="text-center">${formatNumber(patient.anzahl_t2_plus_lk, 0, '0')} / ${formatNumber(patient.anzahl_t2_lk, 0, '0')}</td>
            </tr>`;

        if (hasT2BewertetData) {
            rowHTML += `
                <tr class="sub-row">
                    <td colspan="8" class="p-0">
                        <div class="collapse" id="${collapseId}">
                            ${_createAuswertungT2LymphknotenDetailHTML(patient.lymphknoten_t2_bewertet, appliedCriteria, appliedLogic)}
                        </div>
                    </td>
                </tr>`;
        }
        return rowHTML;
    }

    function _createT2LymphknotenDetailHTML(lymphknotenT2Array) {
        if (!Array.isArray(lymphknotenT2Array) || lymphknotenT2Array.length === 0) {
            return `<div class="p-2 text-muted small"><em>Keine T2-Lymphknotendaten für diesen Patienten verfügbar.</em></div>`;
        }

        let detailHtml = '<div class="sub-row-content container-fluid"><div class="row g-2">';
        lymphknotenT2Array.forEach((lk, index) => {
            if (!lk) return;
            detailHtml += `<div class="col-12 col-md-6 col-lg-4">
                            <div class="sub-row-item border rounded">
                                <strong class="me-2">LK #${index + 1}:</strong>
                                <span class="me-2">${uiComponents.getIconForT2Feature('size')}Größe: ${formatNumber(lk.groesse, 1, 'N/A')}mm</span>
                                <span class="me-2">${uiComponents.getIconForT2Feature('form', lk.form)}Form: ${lk.form || 'N/A'}</span>
                                <span class="me-2">${uiComponents.getIconForT2Feature('kontur', lk.kontur)}Kontur: ${lk.kontur || 'N/A'}</span>
                                <span class="me-2">${uiComponents.getIconForT2Feature('homogenitaet', lk.homogenitaet)}Homog.: ${lk.homogenitaet || 'N/A'}</span>
                                <span class="me-2">${uiComponents.getIconForT2Feature('signal', lk.signal)}Signal: ${lk.signal || 'N/A'}</span>
                           </div>
                         </div>`;
        });
        detailHtml += '</div></div>';
        return detailHtml;
    }

    function _createAuswertungT2LymphknotenDetailHTML(lymphknotenT2BewertetArray, currentCriteria, currentLogic) {
        if (!Array.isArray(lymphknotenT2BewertetArray) || lymphknotenT2BewertetArray.length === 0) {
            return `<div class="p-2 text-muted small"><em>Keine T2-Lymphknoten für diesen Patienten bewertet oder vorhanden.</em></div>`;
        }

        let detailHtml = '<div class="sub-row-content container-fluid"><div class="row g-2">';
        lymphknotenT2BewertetArray.forEach((lkBewertet, index) => {
            if (!lkBewertet || !lkBewertet.lk) return;
            const lk = lkBewertet.lk;
            const evaluationDetails = lkBewertet.evaluationDetails || {};
            const passesOverall = lkBewertet.passes;
            const passesClass = passesOverall ? 'bg-status-red-light' : '';

            let detailItemHTML = `<div class="col-12 col-md-6 col-lg-4"><div class="sub-row-item border rounded ${passesClass}">`;
            detailItemHTML += `<strong class="me-2">LK #${index + 1} (${passesOverall ? 'Positiv' : 'Negativ'}):</strong>`;

            const criteriaKeys = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
            criteriaKeys.forEach(key => {
                if (currentCriteria[key]?.active) {
                    const displayValue = lk[key] !== null && lk[key] !== undefined ? (key === 'size' ? `${formatNumber(lk[key], 1)}mm` : lk[key]) : 'N/A';
                    const criterionMet = evaluationDetails[key]?.met; // Check if the individual criterion was met
                    
                    // Determine if this specific criterion contributed to the overall positive status
                    // For 'UND' logic, ALL active criteria must be met AND `criterionMet` must be true.
                    // For 'ODER' logic, at least ONE active criterion must be met AND `criterionMet` must be true AND `passesOverall` must be true.
                    let isContributing = false;
                    if (currentLogic === 'UND') {
                        isContributing = (evaluationDetails[key] === true); // 'evaluationDetails[key]' directly holds the boolean result for 'UND'
                    } else { // 'ODER'
                        isContributing = (evaluationDetails[key] === true && passesOverall); // For 'ODER', it contributed if it was true AND the LK overall passed
                    }
                    
                    const textClass = isContributing ? 'highlight-suspekt-feature' : '';
                    const icon = uiComponents.getIconForT2Feature(key, lk[key], evaluationDetails[key]); // Pass evaluationDetails[key] (boolean) to getIconForT2Feature
                    const labelText = { size: 'Größe', form: 'Form', kontur: 'Kontur', homogenitaet: 'Homog.', signal: 'Signal' }[key] || key;
                    detailItemHTML += `<span class="me-2 ${textClass}">${icon}${labelText}: ${displayValue}</span>`;
                }
            });

            detailItemHTML += `</div></div>`;
            detailHtml += detailItemHTML;
        });
        detailHtml += '</div></div>';
        return detailHtml;
    }

    return Object.freeze({
        createSortableTableHeaders,
        createDatenTableRow,
        createAuswertungTableRow
    });

})();
