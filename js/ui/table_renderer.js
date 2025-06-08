const tableRenderer = (() => {

    function _createDatenDetailRowContent(patient) {
         if (!Array.isArray(patient.lymphknoten_t2) || patient.lymphknoten_t2.length === 0) {
             return '<p class="m-0 p-2 text-muted small">Keine T2-Lymphknoten für diesen Patienten erfasst.</p>';
         }

         let content = '<h6 class="w-100 mb-2 ps-1">T2 Lymphknoten Merkmale:</h6>';
         patient.lymphknoten_t2.forEach((lk, index) => {
            if (!lk) return;
            const groesseText = utils.formatNumber(lk.groesse, 1, 'N/A');
            const formText = lk.form || '--';
            const konturText = lk.kontur || '--';
            const homogenitaetText = lk.homogenitaet || '--';
            const signalText = lk.signal || 'N/A';

            const signalIcon = ui_helpers.getT2IconSVG('signal', lk.signal);
            const formIcon = ui_helpers.getT2IconSVG('form', lk.form);
            const konturIcon = ui_helpers.getT2IconSVG('kontur', lk.kontur);
            const homogenitaetIcon = ui_helpers.getT2IconSVG('homogenitaet', lk.homogenitaet);
            const sizeIcon = ui_helpers.getT2IconSVG('ruler-horizontal');

            content += `<div class="sub-row-item border rounded mb-1 p-1 w-100 align-items-center small">
                           <strong class="me-2">LK ${index + 1}:</strong>
                           <span class="me-2 text-nowrap" data-tippy-content="${TOOLTIP_CONTENT.t2Size?.description || 'Größe'}">${sizeIcon}${groesseText !== 'N/A' ? groesseText + 'mm' : groesseText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content="${TOOLTIP_CONTENT.t2Form?.description || 'Form'}">${formIcon}${formText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content="${TOOLTIP_CONTENT.t2Kontur?.description || 'Kontur'}">${konturIcon}${konturText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content="${TOOLTIP_CONTENT.t2Homogenitaet?.description || 'Homogenität'}">${homogenitaetIcon}${homogenitaetText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content="${TOOLTIP_CONTENT.t2Signal?.description || 'Signal'}">${signalIcon}${signalText}</span>
                        </div>`;
         });
         return content;
    }

    function createDatenTableRow(patient) {
        if (!patient || typeof patient.nr !== 'number') return '';
        const rowId = `daten-row-${patient.nr}`;
        const detailRowId = `daten-detail-${patient.nr}`;
        const hasT2Nodes = Array.isArray(patient.lymphknoten_t2) && patient.lymphknoten_t2.length > 0;
        const geschlechtText = UI_TEXTS.legendLabels[patient.geschlecht === 'm' ? 'male' : (patient.geschlecht === 'f' ? 'female' : 'unknownGender')];
        const therapieText = utils.getKollektivDisplayName(patient.therapie);
        const naPlaceholder = '--';

        const bemerkungText = ui_helpers.escapeMarkdown(patient.bemerkung || '');
        const tooltipBemerkung = bemerkungText ? bemerkungText : (TOOLTIP_CONTENT.datenTable.bemerkung || 'Bemerkung');
        const tooltipExpand = hasT2Nodes ? (TOOLTIP_CONTENT.datenTable.expandRow || 'Details anzeigen') : 'Keine T2-LK Details verfügbar';

        const t2StatusIcon = patient.t2 === '+' ? 'plus' : (patient.t2 === '-' ? 'minus' : 'unknown');

        return `
            <tr id="${rowId}" ${hasT2Nodes ? `class="clickable-row"` : ''} ${hasT2Nodes ? `data-bs-toggle="collapse"` : ''} data-bs-target="#${detailRowId}" aria-expanded="false" aria-controls="${detailRowId}">
                <td data-label="Nr." data-tippy-content="${TOOLTIP_CONTENT.datenTable.nr}">${patient.nr}</td>
                <td data-label="Name" data-tippy-content="${TOOLTIP_CONTENT.datenTable.name}">${patient.name || naPlaceholder}</td>
                <td data-label="Vorname" data-tippy-content="${TOOLTIP_CONTENT.datenTable.vorname}">${patient.vorname || naPlaceholder}</td>
                <td data-label="Geschlecht" data-tippy-content="${TOOLTIP_CONTENT.datenTable.geschlecht}">${geschlechtText}</td>
                <td data-label="Alter" data-tippy-content="${TOOLTIP_CONTENT.datenTable.alter}">${utils.formatNumber(patient.alter, 0, naPlaceholder)}</td>
                <td data-label="Therapie" data-tippy-content="${TOOLTIP_CONTENT.datenTable.therapie}">${therapieText}</td>
                <td data-label="N/AS/T2" data-tippy-content="${TOOLTIP_CONTENT.datenTable.n_as_t2}">
                    <span class="status-${patient.n === '+' ? 'plus' : 'minus'}" data-tippy-content="Pathologie N-Status">${patient.n ?? '?'}</span> /
                    <span class="status-${patient.as === '+' ? 'plus' : 'minus'}" data-tippy-content="Avocado Sign Status">${patient.as ?? '?'}</span> /
                    <span class="status-${t2StatusIcon}" id="status-t2-pat-${patient.nr}" data-tippy-content="T2 Status (angewandte Kriterien)">${patient.t2 ?? '?'}</span>
                </td>
                <td data-label="Bemerkung" class="text-truncate" style="max-width: 150px;" data-tippy-content="${tooltipBemerkung}">${bemerkungText || naPlaceholder}</td>
                 <td class="text-center p-1" data-tippy-content="${tooltipExpand}">
                     ${hasT2Nodes ? '<button class="btn btn-sm btn-outline-secondary p-1 row-toggle-button"><i class="fas fa-chevron-down row-toggle-icon"></i></button>' : ''}
                 </td>
            </tr>
            ${hasT2Nodes ? `<tr class="sub-row"><td colspan="9" class="p-0 border-0"><div class="collapse" id="${detailRowId}"><div class="sub-row-content p-2 bg-light">${_createDatenDetailRowContent(patient)}</div></div></td></tr>` : ''}
        `;
    }

    function _createAuswertungDetailRowContent(patient, appliedCriteria, appliedLogic) {
        if (!Array.isArray(patient.lymphknoten_t2_bewertet) || patient.lymphknoten_t2_bewertet.length === 0) {
            return '<p class="m-0 p-2 text-muted small">Keine T2-Lymphknoten für Bewertung vorhanden.</p>';
        }
        const criteriaFormatted = studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, true);
        let content = `<h6 class="w-100 mb-2 ps-1" data-tippy-content="Bewertung jedes T2-LK basierend auf den angewendeten Kriterien.">T2 LK Bewertung (Logik: ${UI_TEXTS.t2LogicDisplayNames[appliedLogic] || appliedLogic}, Kriterien: ${criteriaFormatted})</h6>`;

        patient.lymphknoten_t2_bewertet.forEach((lk, index) => {
            if (!lk || !lk.checkResult) return;
            const baseClass = "sub-row-item border rounded mb-1 p-1 w-100 align-items-center small";
            const highlightClass = lk.isPositive ? 'bg-status-red-light' : '';
            let itemContent = `<strong class="me-2">LK ${index + 1}: ${lk.isPositive ? '<span class="badge bg-danger text-white">Pos.</span>' : '<span class="badge bg-success text-white">Neg.</span>'}</strong>`;

            const formatCriterionCheck = (key, iconType, valueText, checkResultForLK) => {
                if (!appliedCriteria?.[key]?.active) return '';
                const checkMet = checkResultForLK[key] === true;
                const hlClass = lk.isPositive && checkMet ? 'highlight-suspekt-feature' : '';
                const icon = ui_helpers.getT2IconSVG(iconType || key, valueText);
                return `<span class="me-2 text-nowrap ${hlClass}" data-tippy-content="Status: ${checkMet ? 'Erfüllt' : 'Nicht erfüllt'}">${icon} ${valueText || '--'}</span>`;
            };

            itemContent += formatCriterionCheck('size', 'ruler-horizontal', `${utils.formatNumber(lk.groesse, 1, 'N/A')}mm`, lk.checkResult);
            itemContent += formatCriterionCheck('form', null, lk.form, lk.checkResult);
            itemContent += formatCriterionCheck('kontur', null, lk.kontur, lk.checkResult);
            itemContent += formatCriterionCheck('homogenitaet', null, lk.homogenitaet, lk.checkResult);
            itemContent += formatCriterionCheck('signal', null, lk.signal || 'N/A', lk.checkResult);
            content += `<div class="${baseClass} ${highlightClass}">${itemContent}</div>`;
        });
        return content;
    }

    function createAuswertungTableRow(patient, appliedCriteria, appliedLogic) {
        if (!patient || typeof patient.nr !== 'number') return '';
        const rowId = `auswertung-row-${patient.nr}`;
        const detailRowId = `auswertung-detail-${patient.nr}`;
        const hasBewerteteNodes = Array.isArray(patient.lymphknoten_t2_bewertet) && patient.lymphknoten_t2_bewertet.length > 0;

        const nCountsText = `${utils.formatNumber(patient.anzahl_patho_n_plus_lk, 0, '-')} / ${utils.formatNumber(patient.anzahl_patho_lk, 0, '-')}`;
        const asCountsText = `${utils.formatNumber(patient.anzahl_as_plus_lk, 0, '-')} / ${utils.formatNumber(patient.anzahl_as_lk, 0, '-')}`;
        const t2CountsText = `${utils.formatNumber(patient.anzahl_t2_plus_lk, 0, '-')} / ${utils.formatNumber(patient.anzahl_t2_lk, 0, '-')}`;
        const tooltipExpand = hasBewerteteNodes ? (TOOLTIP_CONTENT.auswertungTable.expandRow) : 'Keine T2-LK Bewertung verfügbar';
        const t2StatusIcon = patient.t2 === '+' ? 'plus' : 'minus';

        return `
            <tr id="${rowId}" ${hasBewerteteNodes ? `class="clickable-row"` : ''} ${hasBewerteteNodes ? `data-bs-toggle="collapse"` : ''} data-bs-target="#${detailRowId}" aria-expanded="false" aria-controls="${detailRowId}">
                <td data-label="Nr." data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.nr}">${patient.nr}</td>
                <td data-label="Name" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.name}">${patient.name || '--'}</td>
                <td data-label="Therapie" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.therapie}">${utils.getKollektivDisplayName(patient.therapie)}</td>
                <td data-label="N/AS/T2" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.n_as_t2}">
                    <span class="status-${patient.n === '+' ? 'plus' : 'minus'}" data-tippy-content="Pathologie N-Status">${patient.n ?? '?'}</span> /
                    <span class="status-${patient.as === '+' ? 'plus' : 'minus'}" data-tippy-content="Avocado Sign Status">${patient.as ?? '?'}</span> /
                    <span class="status-${t2StatusIcon}" data-tippy-content="T2 Status (angewandte Kriterien)">${patient.t2 ?? '?'}</span>
                </td>
                <td data-label="N+/N ges." class="text-center" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.n_counts}">${nCountsText}</td>
                <td data-label="AS+/AS ges." class="text-center" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.as_counts}">${asCountsText}</td>
                <td data-label="T2+/T2 ges." class="text-center" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.t2_counts}">${t2CountsText}</td>
                <td class="text-center p-1" data-tippy-content="${tooltipExpand}">
                     ${hasBewerteteNodes ? '<button class="btn btn-sm btn-outline-secondary p-1 row-toggle-button"><i class="fas fa-chevron-down row-toggle-icon"></i></button>' : ''}
                </td>
            </tr>
            ${hasBewerteteNodes ? `<tr class="sub-row"><td colspan="8" class="p-0 border-0"><div class="collapse" id="${detailRowId}"><div class="sub-row-content p-2 bg-light">${_createAuswertungDetailRowContent(patient, appliedCriteria, appliedLogic)}</div></div></td></tr>` : ''}
        `;
    }

    return Object.freeze({
        createDatenTableRow,
        createAuswertungTableRow
    });
})();
