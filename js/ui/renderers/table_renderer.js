const tableRenderer = (() => {

    function _createDatenDetailRowContent(patient) {
         if (!Array.isArray(patient.lymphknoten_t2) || patient.lymphknoten_t2.length === 0) {
             const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
             const noDataText = langKey === 'de' ? 'Keine T2-Lymphknoten für diesen Patienten erfasst.' : 'No T2 lymph nodes recorded for this patient.';
             return `<p class="m-0 p-2 text-muted small">${noDataText}</p>`;
         }
         const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
         const headerText = langKey === 'de' ? 'T2 Lymphknoten Merkmale:' : 'T2 Lymph Node Characteristics:';
         let content = `<h6 class="w-100 mb-2 ps-1">${headerText}</h6>`;

         patient.lymphknoten_t2.forEach((lk, index) => {
            if (!lk) return;
            const groesseText = formatNumber(lk.groesse, 1, 'N/A', false, langKey);
            const formText = UI_TEXTS.t2CriteriaValues[lk.form]?.[langKey] || UI_TEXTS.t2CriteriaValues[lk.form]?.['de'] || lk.form || '--';
            const konturText = UI_TEXTS.t2CriteriaValues[lk.kontur]?.[langKey] || UI_TEXTS.t2CriteriaValues[lk.kontur]?.['de'] || lk.kontur || '--';
            const homogenitaetText = UI_TEXTS.t2CriteriaValues[lk.homogenitaet]?.[langKey] || UI_TEXTS.t2CriteriaValues[lk.homogenitaet]?.['de'] || lk.homogenitaet || '--';
            const signalText = UI_TEXTS.t2CriteriaValues[lk.signal]?.[langKey] || UI_TEXTS.t2CriteriaValues[lk.signal]?.['de'] || lk.signal || 'N/A';

            const signalIcon = ui_helpers.getT2IconSVG('signal', lk.signal);
            const formIcon = ui_helpers.getT2IconSVG('form', lk.form);
            const konturIcon = ui_helpers.getT2IconSVG('kontur', lk.kontur);
            const homogenitaetIcon = ui_helpers.getT2IconSVG('homogenitaet', lk.homogenitaet);
            const sizeIcon = ui_helpers.getT2IconSVG('ruler-horizontal', null);

            const sizeTooltipBase = TOOLTIP_CONTENT.t2Size?.description;
            const sizeTooltip = (typeof sizeTooltipBase === 'object' ? sizeTooltipBase[langKey] : sizeTooltipBase?.[langKey]) || sizeTooltipBase?.['de'] || (langKey === 'de' ? 'Größe (Kurzachse)' : 'Size (Short Axis)');
            const formTooltipBase = TOOLTIP_CONTENT.t2Form?.description;
            const formTooltip = (typeof formTooltipBase === 'object' ? formTooltipBase[langKey] : formTooltipBase?.[langKey]) || formTooltipBase?.['de'] || (langKey === 'de' ? 'Form' : 'Shape');
            const konturTooltipBase = TOOLTIP_CONTENT.t2Kontur?.description;
            const konturTooltip = (typeof konturTooltipBase === 'object' ? konturTooltipBase[langKey] : konturTooltipBase?.[langKey]) || konturTooltipBase?.['de'] || (langKey === 'de' ? 'Kontur' : 'Border');
            const homogenitaetTooltipBase = TOOLTIP_CONTENT.t2Homogenitaet?.description;
            const homogenitaetTooltip = (typeof homogenitaetTooltipBase === 'object' ? homogenitaetTooltipBase[langKey] : homogenitaetTooltipBase?.[langKey]) || homogenitaetTooltipBase?.['de'] || (langKey === 'de' ? 'Homogenität' : 'Homogeneity');
            const signalTooltipBase = TOOLTIP_CONTENT.t2Signal?.description;
            const signalTooltip = (typeof signalTooltipBase === 'object' ? signalTooltipBase[langKey] : signalTooltipBase?.[langKey]) || signalTooltipBase?.['de'] || (langKey === 'de' ? 'Signalintensität' : 'Signal Intensity');
            const lkLabel = langKey === 'de' ? 'LK' : 'LN';

            content += `<div class="sub-row-item border rounded mb-1 p-1 w-100 align-items-center small">
                           <strong class="me-2">${lkLabel} ${index + 1}:</strong>
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
        const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
        const rowId = `daten-row-${patient.nr}`;
        const detailRowId = `daten-detail-${patient.nr}`;
        const hasT2Nodes = Array.isArray(patient.lymphknoten_t2) && patient.lymphknoten_t2.length > 0;
        const geschlechtText = patient.geschlecht === 'm' ? (UI_TEXTS.legendLabels.male[langKey] || UI_TEXTS.legendLabels.male.de) : (patient.geschlecht === 'f' ? (UI_TEXTS.legendLabels.female[langKey] || UI_TEXTS.legendLabels.female.de) : (UI_TEXTS.legendLabels.unknownGender[langKey] || UI_TEXTS.legendLabels.unknownGender.de));
        const therapieText = getKollektivDisplayName(patient.therapie, langKey);
        const naPlaceholder = '--';

        const tooltipNr = (TOOLTIP_CONTENT.datenTable.nr?.[langKey] || TOOLTIP_CONTENT.datenTable.nr?.['de']) || (langKey === 'de' ? 'Nr.' : 'No.');
        const tooltipName = (TOOLTIP_CONTENT.datenTable.name?.[langKey] || TOOLTIP_CONTENT.datenTable.name?.['de']) || (langKey === 'de' ? 'Name' : 'Name');
        const tooltipVorname = (TOOLTIP_CONTENT.datenTable.vorname?.[langKey] || TOOLTIP_CONTENT.datenTable.vorname?.['de']) || (langKey === 'de' ? 'Vorname' : 'First Name');
        const tooltipGeschlecht = (TOOLTIP_CONTENT.datenTable.geschlecht?.[langKey] || TOOLTIP_CONTENT.datenTable.geschlecht?.['de']) || (langKey === 'de' ? 'Geschlecht' : 'Gender');
        const tooltipAlter = (TOOLTIP_CONTENT.datenTable.alter?.[langKey] || TOOLTIP_CONTENT.datenTable.alter?.['de']) || (langKey === 'de' ? 'Alter' : 'Age');
        const tooltipTherapie = (TOOLTIP_CONTENT.datenTable.therapie?.[langKey] || TOOLTIP_CONTENT.datenTable.therapie?.['de']) || (langKey === 'de' ? 'Therapie' : 'Therapy');
        const tooltipStatus = (TOOLTIP_CONTENT.datenTable.n_as_t2?.[langKey] || TOOLTIP_CONTENT.datenTable.n_as_t2?.['de']) || (langKey === 'de' ? 'N/AS/T2 Status' : 'N/AS/T2 Status');
        const bemerkungText = ui_helpers.escapeMarkdown(patient.bemerkung || '');
        const tooltipBemerkungTextBase = TOOLTIP_CONTENT.datenTable.bemerkung;
        const tooltipBemerkungText = (typeof tooltipBemerkungTextBase === 'object' ? tooltipBemerkungTextBase[langKey] : tooltipBemerkungTextBase?.[langKey]) || tooltipBemerkungTextBase?.['de'] || (langKey === 'de' ? 'Bemerkung' : 'Comment');
        const finalTooltipBemerkung = bemerkungText ? bemerkungText : tooltipBemerkungText;

        const tooltipExpandBase = TOOLTIP_CONTENT.datenTable.expandRow;
        const tooltipExpandText = (typeof tooltipExpandBase === 'object' ? tooltipExpandBase[langKey] : tooltipExpandBase?.[langKey]) || tooltipExpandBase?.['de'] || (langKey==='de'?'Details anzeigen/ausblenden':'Show/hide details');
        const noDetailsText = langKey === 'de' ? 'Keine T2-Lymphknoten Details verfügbar' : 'No T2 lymph node details available';
        const finalTooltipExpand = hasT2Nodes ? tooltipExpandText : noDetailsText;

        const t2StatusIcon = patient.t2 === '+' ? 'plus' : patient.t2 === '-' ? 'minus' : 'unknown';
        const t2StatusText = patient.t2 ?? '?';
        const t2StatusTooltip = langKey === 'de' ? "T2 Status (Vorhersage basierend auf aktuell angewendeten Kriterien)" : "T2 Status (Prediction based on currently applied criteria)";
        const asStatusTooltip = langKey === 'de' ? "Avocado Sign Status (Vorhersage)" : "Avocado Sign Status (Prediction)";
        const nStatusTooltip = langKey === 'de' ? "Pathologie N-Status (Goldstandard)" : "Pathology N-Status (Gold Standard)";


        return `
            <tr id="${rowId}" ${hasT2Nodes ? `class="clickable-row"` : ''} ${hasT2Nodes ? `data-bs-toggle="collapse"` : ''} data-bs-target="#${detailRowId}" aria-expanded="false" aria-controls="${detailRowId}">
                <td data-label="Nr." data-tippy-content="${tooltipNr}">${patient.nr}</td>
                <td data-label="Name" data-tippy-content="${tooltipName}">${patient.name || naPlaceholder}</td>
                <td data-label="Vorname" data-tippy-content="${tooltipVorname}">${patient.vorname || naPlaceholder}</td>
                <td data-label="Geschlecht" data-tippy-content="${tooltipGeschlecht}">${geschlechtText}</td>
                <td data-label="Alter" data-tippy-content="${tooltipAlter}">${formatNumber(patient.alter, 0, naPlaceholder, false, langKey)}</td>
                <td data-label="Therapie" data-tippy-content="${tooltipTherapie}">${therapieText}</td>
                <td data-label="N/AS/T2" data-tippy-content="${tooltipStatus}">
                    <span class="status-${patient.n === '+' ? 'plus' : (patient.n === '-' ? 'minus' : 'unknown')}" data-tippy-content="${nStatusTooltip}">${patient.n ?? '?'}</span> /
                    <span class="status-${patient.as === '+' ? 'plus' : (patient.as === '-' ? 'minus' : 'unknown')}" data-tippy-content="${asStatusTooltip}">${patient.as ?? '?'}</span> /
                    <span class="status-${t2StatusIcon}" id="status-t2-pat-${patient.nr}" data-tippy-content="${t2StatusTooltip}">${t2StatusText}</span>
                </td>
                <td data-label="Bemerkung" class="text-truncate" style="max-width: 150px;" data-tippy-content="${finalTooltipBemerkung}">${bemerkungText || naPlaceholder}</td>
                 <td class="text-center p-1" style="width: 30px;" data-tippy-content="${finalTooltipExpand}">
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
        const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
        if (!Array.isArray(patient.lymphknoten_t2_bewertet) || patient.lymphknoten_t2_bewertet.length === 0) {
            const noDataText = langKey === 'de' ? 'Keine T2-Lymphknoten für Bewertung vorhanden oder Bewertung nicht durchgeführt.' : 'No T2 lymph nodes available for evaluation or evaluation not performed.';
            return `<p class="m-0 p-2 text-muted small">${noDataText}</p>`;
        }

        const activeCriteriaKeys = Object.keys(appliedCriteria || {}).filter(key => key !== 'logic' && appliedCriteria[key]?.active === true);
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l, s, lang) => 'Formatierungsfehler';
        const criteriaFormatted = formatCriteriaFunc(appliedCriteria, appliedLogic, true, langKey);
        const naPlaceholder = '--';
        const logicDisplay = UI_TEXTS.t2LogicDisplayNames[appliedLogic?.toUpperCase()]?.[langKey] || appliedLogic?.toUpperCase() || 'N/A';
        const headerTextBase = TOOLTIP_CONTENT.auswertungTable.expandRow;
        const headerTextTooltip = (typeof headerTextBase === 'object' ? headerTextBase[langKey] : headerTextBase?.[langKey]) || headerTextBase?.['de'] || (langKey === 'de' ? 'Bewertung T2 LK' : 'Evaluation T2 LN');
        const criteriaLabelText = langKey === 'de' ? 'Kriterien' : 'Criteria';
        const logicLabelText = langKey === 'de' ? 'Logik' : 'Logic';
        const lkLabel = langKey === 'de' ? 'LK' : 'LN';
        const positiveBadgeText = langKey === 'de' ? 'Pos.' : 'Pos.';
        const negativeBadgeText = langKey === 'de' ? 'Neg.' : 'Neg.';
        const positiveTooltip = langKey === 'de' ? 'Positiv bewertet' : 'Rated positive';
        const negativeTooltip = langKey === 'de' ? 'Negativ bewertet' : 'Rated negative';


        let content = `<h6 class="w-100 mb-2 ps-1" data-tippy-content="${headerTextTooltip}">${logicLabelText}: ${logicDisplay}, ${criteriaLabelText}: ${criteriaFormatted || (langKey==='de'?'Keine':'None')}</h6>`;

        patient.lymphknoten_t2_bewertet.forEach((lk, index) => {
            if (!lk || !lk.checkResult) {
                const invalidDataText = langKey === 'de' ? 'Ungültige Bewertungsdaten' : 'Invalid evaluation data';
                content += `<div class="sub-row-item border rounded mb-1 p-1 w-100 align-items-center small fst-italic text-muted">${lkLabel} ${index + 1}: ${invalidDataText}</div>`;
                return;
            }

            const baseClass = "sub-row-item border rounded mb-1 p-1 w-100 align-items-center small";
            const highlightClass = lk.isPositive ? 'bg-status-red-light' : '';
            let itemContent = `<strong class="me-2">${lkLabel} ${index + 1}: ${lk.isPositive ? `<span class="badge bg-danger text-white ms-1" data-tippy-content="${positiveTooltip}">${positiveBadgeText}</span>` : `<span class="badge bg-success text-white ms-1" data-tippy-content="${negativeTooltip}">${negativeBadgeText}</span>`}</strong>`;

            const formatCriterionCheck = (key, iconType, valueFromLK, checkResultForLK) => {
                if (!appliedCriteria?.[key]?.active) return '';
                const checkMet = checkResultForLK[key] === true;
                const checkFailed = checkResultForLK[key] === false;
                let hlClass = '';

                if (lk.isPositive) { // Highlight if the LN is positive AND this criterion contributed
                    if (checkMet && (appliedLogic === 'ODER' || activeCriteriaKeys.every(actK => checkResultForLK[actK] === true))) {
                        hlClass = 'highlight-suspekt-feature';
                    }
                }

                const icon = ui_helpers.getT2IconSVG(iconType || key, valueFromLK);
                const textValue = (key === 'size')
                    ? `${formatNumber(valueFromLK, 1, 'N/A', false, langKey)}mm`
                    : (UI_TEXTS.t2CriteriaValues[valueFromLK]?.[langKey] || UI_TEXTS.t2CriteriaValues[valueFromLK]?.['de'] || valueFromLK || naPlaceholder);

                const tooltipKey = 't2' + key.charAt(0).toUpperCase() + key.slice(1);
                const tooltipBase = TOOLTIP_CONTENT[tooltipKey]?.description;
                const tooltipDescText = (typeof tooltipBase === 'object' ? tooltipBase[langKey] : tooltipBase?.[langKey]) || tooltipBase?.['de'] || `${langKey === 'de' ? 'Merkmal' : 'Feature'} ${key}`;

                const statusTextDe = checkMet ? 'Erfüllt' : (checkFailed ? 'Nicht erfüllt' : (checkResultForLK[key] === null ? 'Nicht anwendbar/geprüft' : 'Unbekannt'));
                const statusTextEn = checkMet ? 'Met' : (checkFailed ? 'Not met' : (checkResultForLK[key] === null ? 'Not applicable/checked' : 'Unknown'));
                const statusText = langKey === 'de' ? statusTextDe : statusTextEn;
                const finalTooltip = `${tooltipDescText} | Status: ${statusText}`;

                return `<span class="me-2 text-nowrap ${hlClass}" data-tippy-content="${finalTooltip}">${icon} ${textValue}</span>`;
            };

            itemContent += formatCriterionCheck('size', 'ruler-horizontal', lk.groesse, lk.checkResult);
            itemContent += formatCriterionCheck('form', null, lk.form, lk.checkResult);
            itemContent += formatCriterionCheck('kontur', null, lk.kontur, lk.checkResult);
            itemContent += formatCriterionCheck('homogenitaet', null, lk.homogenitaet, lk.checkResult);
            itemContent += formatCriterionCheck('signal', null, lk.signal, lk.checkResult);


            content += `<div class="${baseClass} ${highlightClass}">${itemContent}</div>`;
        });
        return content;
    }

    function createAuswertungTableRow(patient, appliedCriteria, appliedLogic) {
        if (!patient || typeof patient.nr !== 'number') return '';
        const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
        const rowId = `auswertung-row-${patient.nr}`;
        const detailRowId = `auswertung-detail-${patient.nr}`;
        const hasBewerteteNodes = Array.isArray(patient.lymphknoten_t2_bewertet) && patient.lymphknoten_t2_bewertet.length > 0;
        const therapieText = getKollektivDisplayName(patient.therapie, langKey);
        const naPlaceholder = '--';

        const nCountsText = `${formatNumber(patient.anzahl_patho_n_plus_lk, 0, '-', false, langKey)} / ${formatNumber(patient.anzahl_patho_lk, 0, '-', false, langKey)}`;
        const asCountsText = `${formatNumber(patient.anzahl_as_plus_lk, 0, '-', false, langKey)} / ${formatNumber(patient.anzahl_as_lk, 0, '-', false, langKey)}`;
        const t2CountsText = `${formatNumber(patient.anzahl_t2_plus_lk, 0, '-', false, langKey)} / ${formatNumber(patient.anzahl_t2_lk, 0, '-', false, langKey)}`;

        const tooltipNr = (TOOLTIP_CONTENT.auswertungTable.nr?.[langKey] || TOOLTIP_CONTENT.auswertungTable.nr?.['de']) || (langKey === 'de' ? 'Nr.' : 'No.');
        const tooltipName = (TOOLTIP_CONTENT.auswertungTable.name?.[langKey] || TOOLTIP_CONTENT.auswertungTable.name?.['de']) || (langKey === 'de' ? 'Name' : 'Name');
        const tooltipTherapie = (TOOLTIP_CONTENT.auswertungTable.therapie?.[langKey] || TOOLTIP_CONTENT.auswertungTable.therapie?.['de']) || (langKey === 'de' ? 'Therapie' : 'Therapy');
        const tooltipStatus = (TOOLTIP_CONTENT.auswertungTable.n_as_t2?.[langKey] || TOOLTIP_CONTENT.auswertungTable.n_as_t2?.['de']) || (langKey === 'de' ? 'N/AS/T2 Status' : 'N/AS/T2 Status');
        const tooltipNCounts = (TOOLTIP_CONTENT.auswertungTable.n_counts?.[langKey] || TOOLTIP_CONTENT.auswertungTable.n_counts?.['de']) || (langKey === 'de' ? 'N+ LKs / N gesamt LKs (Pathologie)' : 'N+ LNs / N total LNs (Pathology)');
        const tooltipASCounts = (TOOLTIP_CONTENT.auswertungTable.as_counts?.[langKey] || TOOLTIP_CONTENT.auswertungTable.as_counts?.['de']) || (langKey === 'de' ? 'AS+ LKs / AS gesamt LKs (T1KM)' : 'AS+ LNs / AS total LNs (T1c)');
        const tooltipT2Counts = (TOOLTIP_CONTENT.auswertungTable.t2_counts?.[langKey] || TOOLTIP_CONTENT.auswertungTable.t2_counts?.['de']) || (langKey === 'de' ? 'T2+ LKs / T2 gesamt LKs (angew. Kriterien)' : 'T2+ LNs / T2 total LNs (applied criteria)');
        const tooltipExpandBase = TOOLTIP_CONTENT.auswertungTable.expandRow;
        const tooltipExpandText = (typeof tooltipExpandBase === 'object' ? tooltipExpandBase[langKey] : tooltipExpandBase?.[langKey]) || tooltipExpandBase?.['de'] || (langKey === 'de' ? 'Details zur T2-Bewertung anzeigen/ausblenden' : 'Show/hide T2 evaluation details');
        const noDetailsText = langKey === 'de' ? 'Keine T2-Lymphknoten Bewertung verfügbar' : 'No T2 lymph node evaluation available';
        const finalTooltipExpand = hasBewerteteNodes ? tooltipExpandText : noDetailsText;

        const t2StatusIcon = patient.t2 === '+' ? 'plus' : patient.t2 === '-' ? 'minus' : 'unknown';
        const t2StatusText = patient.t2 ?? '?';
        const t2StatusTooltip = langKey === 'de' ? "T2 Status (Vorhersage basierend auf aktuell angewendeten Kriterien)" : "T2 Status (Prediction based on currently applied criteria)";
        const asStatusTooltip = langKey === 'de' ? "Avocado Sign Status (Vorhersage)" : "Avocado Sign Status (Prediction)";
        const nStatusTooltip = langKey === 'de' ? "Pathologie N-Status (Goldstandard)" : "Pathology N-Status (Gold Standard)";

        return `
            <tr id="${rowId}" ${hasBewerteteNodes ? `class="clickable-row"` : ''} ${hasBewerteteNodes ? `data-bs-toggle="collapse"` : ''} data-bs-target="#${detailRowId}" aria-expanded="false" aria-controls="${detailRowId}">
                <td data-label="Nr." data-tippy-content="${tooltipNr}">${patient.nr}</td>
                <td data-label="Name" data-tippy-content="${tooltipName}">${patient.name || naPlaceholder}</td>
                <td data-label="Therapie" data-tippy-content="${tooltipTherapie}">${therapieText}</td>
                <td data-label="N/AS/T2" data-tippy-content="${tooltipStatus}">
                    <span class="status-${patient.n === '+' ? 'plus' : (patient.n === '-' ? 'minus' : 'unknown')}" data-tippy-content="${nStatusTooltip}">${patient.n ?? '?'}</span> /
                    <span class="status-${patient.as === '+' ? 'plus' : (patient.as === '-' ? 'minus' : 'unknown')}" data-tippy-content="${asStatusTooltip}">${patient.as ?? '?'}</span> /
                    <span class="status-${t2StatusIcon}" id="status-t2-ausw-${patient.nr}" data-tippy-content="${t2StatusTooltip}">${t2StatusText}</span>
                </td>
                <td data-label="N+/N ges." class="text-center" data-tippy-content="${tooltipNCounts}">${nCountsText}</td>
                <td data-label="AS+/AS ges." class="text-center" data-tippy-content="${tooltipASCounts}">${asCountsText}</td>
                <td data-label="T2+/T2 ges." class="text-center" id="t2-counts-${patient.nr}" data-tippy-content="${tooltipT2Counts}">${t2CountsText}</td>
                 <td class="text-center p-1" style="width: 30px;" data-tippy-content="${finalTooltipExpand}">
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
