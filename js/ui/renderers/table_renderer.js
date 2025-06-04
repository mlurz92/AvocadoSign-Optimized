const tableRenderer = (() => {

    function _createDatenDetailRowContent(patient) {
         if (!Array.isArray(patient.lymphknoten_t2) || patient.lymphknoten_t2.length === 0) {
             return '<p class="m-0 p-2 text-muted small">Keine T2-Lymphknoten für diesen Patienten erfasst.</p>';
         }

         let content = '<h6 class="w-100 mb-2 ps-1">T2 Lymphknoten Merkmale:</h6>';
         patient.lymphknoten_t2.forEach((lk, index) => {
            if (!lk) return;
            const groesseText = formatNumber(lk.groesse, 1, 'N/A');
            const formText = lk.form || '--';
            const konturText = lk.kontur || '--';
            const homogenitaetText = lk.homogenitaet || '--';
            const signalText = lk.signal || 'N/A';

            const signalIcon = ui_helpers.getT2IconSVG('signal', lk.signal);
            const formIcon = ui_helpers.getT2IconSVG('form', lk.form);
            const konturIcon = ui_helpers.getT2IconSVG('kontur', lk.kontur);
            const homogenitaetIcon = ui_helpers.getT2IconSVG('homogenitaet', lk.homogenitaet);
            const sizeIcon = ui_helpers.getT2IconSVG('ruler-horizontal', null);

            const sizeTooltip = TOOLTIP_CONTENT.t2Size?.description || 'Größe (Kurzachse)';
            const formTooltip = TOOLTIP_CONTENT.t2Form?.description || 'Form';
            const konturTooltip = TOOLTIP_CONTENT.t2Kontur?.description || 'Kontur';
            const homogenitaetTooltip = TOOLTIP_CONTENT.t2Homogenitaet?.description || 'Homogenität';
            const signalTooltip = TOOLTIP_CONTENT.t2Signal?.description || 'Signalintensität';


            content += `<div class="sub-row-item border rounded mb-1 p-1 w-100 align-items-center small">
                           <strong class="me-2">LK ${index + 1}:</strong>
                           <span class="me-2 text-nowrap" data-tippy-content="${sizeTooltip}">${sizeIcon}${groesseText !== 'N/A' ? groesseText + 'mm' : groesseText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content="${formTooltip}">${formIcon}${formText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content="${konturTooltip}">${konturIcon}${konturText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content="${homogenitaetTooltip}">${homogenitaetIcon}${homogenitaetText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content="${signalTooltip}">${signalIcon}${signalText}</span>
                        </div>`;
         });
         return content;
    }

    function createDatenTableRow(patient) {
        if (!patient || typeof patient.nr !== 'number') return '';
        const rowId = `daten-row-${patient.nr}`;
        const detailRowId = `daten-detail-${patient.nr}`;
        const hasT2Nodes = Array.isArray(patient.lymphknoten_t2) && patient.lymphknoten_t2.length > 0;
        const geschlechtText = patient.geschlecht === 'm' ? (UI_TEXTS.legendLabels.male || 'Männlich') : patient.geschlecht === 'f' ? (UI_TEXTS.legendLabels.female || 'Weiblich') : (UI_TEXTS.legendLabels.unknownGender || 'Unbekannt');
        const therapieText = getKollektivDisplayName(patient.therapie);
        const naPlaceholder = '--';

        const tooltipNr = TOOLTIP_CONTENT.datenTable.nr || 'Nr.';
        const tooltipName = TOOLTIP_CONTENT.datenTable.name || 'Name';
        const tooltipVorname = TOOLTIP_CONTENT.datenTable.vorname || 'Vorname';
        const tooltipGeschlecht = TOOLTIP_CONTENT.datenTable.geschlecht || 'Geschlecht';
        const tooltipAlter = TOOLTIP_CONTENT.datenTable.alter || 'Alter';
        const tooltipTherapie = TOOLTIP_CONTENT.datenTable.therapie || 'Therapie';
        const tooltipStatus = TOOLTIP_CONTENT.datenTable.n_as_t2 || 'N/AS/T2 Status';
        const bemerkungText = ui_helpers.escapeMarkdown(patient.bemerkung || '');
        const tooltipBemerkung = bemerkungText ? bemerkungText : (TOOLTIP_CONTENT.datenTable.bemerkung || 'Bemerkung');
        const tooltipExpand = hasT2Nodes ? (TOOLTIP_CONTENT.datenTable.expandRow || 'Details anzeigen/ausblenden') : 'Keine T2-Lymphknoten Details verfügbar';

        const t2StatusIcon = patient.t2 === '+' ? 'plus' : patient.t2 === '-' ? 'minus' : 'unknown';
        const t2StatusText = patient.t2 ?? '?';

        return `
            <tr id="${rowId}" ${hasT2Nodes ? `class="clickable-row"` : ''} ${hasT2Nodes ? `data-bs-toggle="collapse"` : ''} data-bs-target="#${detailRowId}" aria-expanded="false" aria-controls="${detailRowId}">
                <td data-label="Nr." data-tippy-content="${tooltipNr}">${patient.nr}</td>
                <td data-label="Name" data-tippy-content="${tooltipName}">${patient.name || naPlaceholder}</td>
                <td data-label="Vorname" data-tippy-content="${tooltipVorname}">${patient.vorname || naPlaceholder}</td>
                <td data-label="Geschlecht" data-tippy-content="${tooltipGeschlecht}">${geschlechtText}</td>
                <td data-label="Alter" data-tippy-content="${tooltipAlter}">${formatNumber(patient.alter, 0, naPlaceholder)}</td>
                <td data-label="Therapie" data-tippy-content="${tooltipTherapie}">${therapieText}</td>
                <td data-label="N/AS/T2" data-tippy-content="${tooltipStatus}">
                    <span class="status-${patient.n === '+' ? 'plus' : (patient.n === '-' ? 'minus' : 'unknown')}" data-tippy-content="Pathologie N-Status (Goldstandard)">${patient.n ?? '?'}</span> /
                    <span class="status-${patient.as === '+' ? 'plus' : (patient.as === '-' ? 'minus' : 'unknown')}" data-tippy-content="Avocado Sign Status (Vorhersage)">${patient.as ?? '?'}</span> /
                    <span class="status-${t2StatusIcon}" id="status-t2-pat-${patient.nr}" data-tippy-content="T2 Status (Vorhersage basierend auf aktuell angewendeten Kriterien)">${t2StatusText}</span>
                </td>
                <td data-label="Bemerkung" class="text-truncate" style="max-width: 150px;" data-tippy-content="${tooltipBemerkung}">${bemerkungText || naPlaceholder}</td>
                 <td class="text-center p-1" style="width: 30px;" data-tippy-content="${tooltipExpand}">
                     ${hasT2Nodes ? '<button class="btn btn-sm btn-outline-secondary p-1 row-toggle-button" aria-label="Details ein-/ausklappen"><i class="fas fa-chevron-down row-toggle-icon"></i></button>' : ''}
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

    function _createAuswertungDetailRowContent(patient, appliedCriteria, appliedLogic) {
        if (!Array.isArray(patient.lymphknoten_t2_bewertet) || patient.lymphknoten_t2_bewertet.length === 0) {
            return '<p class="m-0 p-2 text-muted small">Keine T2-Lymphknoten für Bewertung vorhanden oder Bewertung nicht durchgeführt.</p>';
        }

        const activeCriteriaKeys = Object.keys(appliedCriteria || {}).filter(key => key !== 'logic' && appliedCriteria[key]?.active === true);
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'Formatierungsfehler';
        const criteriaFormatted = formatCriteriaFunc(appliedCriteria, appliedLogic, true);
        const naPlaceholder = '--';

        let content = `<h6 class="w-100 mb-2 ps-1" data-tippy-content="Zeigt die Bewertung jedes einzelnen T2-Lymphknotens basierend auf den aktuell angewendeten Kriterien. Erfüllte Kriterien, die zur Positiv-Bewertung beitragen, sind hervorgehoben.">T2 LK Bewertung (Logik: ${UI_TEXTS.t2LogicDisplayNames[appliedLogic] || appliedLogic || 'N/A'}, Kriterien: ${criteriaFormatted || 'N/A'})</h6>`;

        patient.lymphknoten_t2_bewertet.forEach((lk, index) => {
            if (!lk || !lk.checkResult) {
                content += `<div class="sub-row-item border rounded mb-1 p-1 w-100 align-items-center small fst-italic text-muted">LK ${index + 1}: Ungültige Bewertungsdaten</div>`;
                return;
            }

            const baseClass = "sub-row-item border rounded mb-1 p-1 w-100 align-items-center small";
            const highlightClass = lk.isPositive ? 'bg-status-red-light' : '';
            let itemContent = `<strong class="me-2">LK ${index + 1}: ${lk.isPositive ? '<span class="badge bg-danger text-white ms-1" data-tippy-content="Positiv bewertet">Pos.</span>' : '<span class="badge bg-success text-white ms-1" data-tippy-content="Negativ bewertet">Neg.</span>'}</strong>`;

            const formatCriterionCheck = (key, iconType, valueText, checkResultForLK) => {
                if (!appliedCriteria?.[key]?.active) return '';
                const checkMet = checkResultForLK[key] === true;
                const checkFailed = checkResultForLK[key] === false;
                let hlClass = '';

                if (lk.isPositive) { // Highlight only if the LK itself is positive overall
                    if (checkMet && (appliedLogic === 'ODER' || (appliedLogic === 'UND' && activeCriteriaKeys.every(k => checkResultForLK[k] === true)))) {
                        hlClass = 'highlight-suspekt-feature';
                    }
                }


                const icon = ui_helpers.getT2IconSVG(iconType || key, valueText);
                const text = valueText || naPlaceholder;
                const tooltipKey = 't2' + key.charAt(0).toUpperCase() + key.slice(1);
                const tooltipBase = TOOLTIP_CONTENT[tooltipKey]?.description || `Merkmal ${key}`;
                const statusText = checkMet ? 'Erfüllt' : (checkFailed ? 'Nicht erfüllt' : (checkResultForLK[key] === null ? 'Nicht anwendbar/geprüft' : 'Unbekannt'));
                const tooltip = `${tooltipBase} | Status: ${statusText}`;

                return `<span class="me-2 text-nowrap ${hlClass}" data-tippy-content="${tooltip}">${icon} ${text}</span>`;
            };

            itemContent += formatCriterionCheck('size', 'ruler-horizontal', `${formatNumber(lk.groesse, 1, 'N/A')}mm`, lk.checkResult);
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
        const therapieText = getKollektivDisplayName(patient.therapie);
        const naPlaceholder = '--';

        const nCountsText = `${formatNumber(patient.anzahl_patho_n_plus_lk, 0, '-')} / ${formatNumber(patient.anzahl_patho_lk, 0, '-')}`;
        const asCountsText = `${formatNumber(patient.anzahl_as_plus_lk, 0, '-')} / ${formatNumber(patient.anzahl_as_lk, 0, '-')}`;
        const t2CountsText = `${formatNumber(patient.anzahl_t2_plus_lk, 0, '-')} / ${formatNumber(patient.anzahl_t2_lk, 0, '-')}`;

        const tooltipNr = TOOLTIP_CONTENT.auswertungTable.nr || 'Nr.';
        const tooltipName = TOOLTIP_CONTENT.auswertungTable.name || 'Name';
        const tooltipTherapie = TOOLTIP_CONTENT.auswertungTable.therapie || 'Therapie';
        const tooltipStatus = TOOLTIP_CONTENT.auswertungTable.n_as_t2 || 'N/AS/T2 Status';
        const tooltipNCounts = TOOLTIP_CONTENT.auswertungTable.n_counts || 'N+ LKs / N gesamt LKs (Pathologie)';
        const tooltipASCounts = TOOLTIP_CONTENT.auswertungTable.as_counts || 'AS+ LKs / AS gesamt LKs (T1KM)';
        const tooltipT2Counts = TOOLTIP_CONTENT.auswertungTable.t2_counts || 'T2+ LKs / T2 gesamt LKs (angew. Kriterien)';
        const tooltipExpand = hasBewerteteNodes ? (TOOLTIP_CONTENT.auswertungTable.expandRow || 'Details zur T2-Bewertung anzeigen/ausblenden') : 'Keine T2-Lymphknoten Bewertung verfügbar';

        const t2StatusIcon = patient.t2 === '+' ? 'plus' : patient.t2 === '-' ? 'minus' : 'unknown';
        const t2StatusText = patient.t2 ?? '?';

        return `
            <tr id="${rowId}" ${hasBewerteteNodes ? `class="clickable-row"` : ''} ${hasBewerteteNodes ? `data-bs-toggle="collapse"` : ''} data-bs-target="#${detailRowId}" aria-expanded="false" aria-controls="${detailRowId}">
                <td data-label="Nr." data-tippy-content="${tooltipNr}">${patient.nr}</td>
                <td data-label="Name" data-tippy-content="${tooltipName}">${patient.name || naPlaceholder}</td>
                <td data-label="Therapie" data-tippy-content="${tooltipTherapie}">${therapieText}</td>
                <td data-label="N/AS/T2" data-tippy-content="${tooltipStatus}">
                    <span class="status-${patient.n === '+' ? 'plus' : (patient.n === '-' ? 'minus' : 'unknown')}" data-tippy-content="Pathologie N-Status (Goldstandard)">${patient.n ?? '?'}</span> /
                    <span class="status-${patient.as === '+' ? 'plus' : (patient.as === '-' ? 'minus' : 'unknown')}" data-tippy-content="Avocado Sign Status (Vorhersage)">${patient.as ?? '?'}</span> /
                    <span class="status-${t2StatusIcon}" id="status-t2-ausw-${patient.nr}" data-tippy-content="T2 Status (Vorhersage basierend auf aktuell angewendeten Kriterien)">${t2StatusText}</span>
                </td>
                <td data-label="N+/N ges." class="text-center" data-tippy-content="${tooltipNCounts}">${nCountsText}</td>
                <td data-label="AS+/AS ges." class="text-center" data-tippy-content="${tooltipASCounts}">${asCountsText}</td>
                <td data-label="T2+/T2 ges." class="text-center" id="t2-counts-${patient.nr}" data-tippy-content="${tooltipT2Counts}">${t2CountsText}</td>
                 <td class="text-center p-1" style="width: 30px;" data-tippy-content="${tooltipExpand}">
                     ${hasBewerteteNodes ? '<button class="btn btn-sm btn-outline-secondary p-1 row-toggle-button" aria-label="Details ein-/ausklappen"><i class="fas fa-chevron-down row-toggle-icon"></i></button>' : ''}
                 </td>
            </tr>
             ${hasBewerteteNodes ? `
            <tr class="sub-row">
                 <td colspan="8" class="p-0 border-0">
                    <div class="collapse" id="${detailRowId}">
                        <div class="sub-row-content p-2 bg-light border-top border-bottom">
                           ${_createAuswertungDetailRowContent(patient, appliedCriteria, appliedLogic)}
                        </div>
                    </div>
                 </td>
            </tr>` : ''}
        `;
    }

    return Object.freeze({
        createDatenTableRow,
        createAuswertungTableRow
    });

})();
