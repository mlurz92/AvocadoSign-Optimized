const tableRenderer = (() => {

    function _getGlobalConfig(configKey, fallback = {}) {
        if (configKey === 'APP_CONFIG') return typeof APP_CONFIG !== 'undefined' ? APP_CONFIG : fallback;
        if (configKey === 'UI_TEXTS') return typeof UI_TEXTS !== 'undefined' ? UI_TEXTS : fallback;
        if (configKey === 'TOOLTIP_CONTENT') return typeof TOOLTIP_CONTENT !== 'undefined' ? TOOLTIP_CONTENT : fallback;
        return fallback;
    }

    function _getStatusBadge(statusValue, positiveClass = 'bg-danger', negativeClass = 'bg-success', unknownClass = 'bg-secondary', positiveText = '+', negativeText = '-', unknownText = '?') {
        let badgeClass = unknownClass;
        let badgeText = unknownText;
        if (statusValue === 1) {
            badgeClass = positiveClass;
            badgeText = positiveText;
        } else if (statusValue === 0) {
            badgeClass = negativeClass;
            badgeText = negativeText;
        }
        return `<span class="badge ${badgeClass} status-badge">${badgeText}</span>`;
    }

    function createDatenTableRow(patient) {
        if (!patient || typeof patient !== 'object') return '<tr><td colspan="9" class="text-danger">Fehlerhafte Patientendaten.</td></tr>';
        const appConfig = _getGlobalConfig('APP_CONFIG', { UI_SETTINGS: {} });
        const uiTexts = _getGlobalConfig('UI_TEXTS', { geschlecht: {}, therapie: {} });
        const tooltipContent = _getGlobalConfig('TOOLTIP_CONTENT', { datenTableDetails: {} });
        const uiHelpersAvailable = typeof ui_helpers !== 'undefined';

        const escapedBemerkung = uiHelpersAvailable && typeof ui_helpers.escapeMarkdown === 'function'
                                ? ui_helpers.escapeMarkdown(patient.bemerkung || '')
                                : (patient.bemerkung || '').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));

        const rowId = `patient-row-${patient.id_patient || generateUUID()}`;
        const detailsId = `details-${patient.id_patient || generateUUID()}`;
        const hasLymphknoten = patient.lymphknoten && patient.lymphknoten.length > 0;
        const geschlechtText = uiTexts.geschlecht?.[patient.geschlecht] || patient.geschlecht || '--';
        const therapieText = uiTexts.therapie?.[patient.therapie] || patient.therapie || '--';

        let lymphknotenDetailsHTML = `<p class="text-muted small">${tooltipContent.datenTableDetails.keineLymphknoten || 'Keine Lymphknoten für diesen Patienten erfasst.'}</p>`;
        if (hasLymphknoten) {
            lymphknotenDetailsHTML = `<table class="table table-sm table-borderless table-responsive-sm small mb-0">
                <thead class="small"><tr>
                    <th data-tippy-content="${tooltipContent.datenTableDetails.lkNr || 'LK Nr.'}">${uiTexts.datenTableDetails?.lkNr || 'LK Nr.'}</th>
                    <th data-tippy-content="${tooltipContent.datenTableDetails.asStatus || 'AS Status'}">${uiTexts.datenTableDetails?.asStatus || 'AS'}</th>
                    <th data-tippy-content="${tooltipContent.datenTableDetails.nStatus || 'N Status'}">${uiTexts.datenTableDetails?.nStatus || 'N'}</th>
                    <th data-tippy-content="${tooltipContent.datenTableDetails.t2Details || 'T2 Details'}">${uiTexts.datenTableDetails?.t2Details || 'T2-Details'}</th>
                </tr></thead><tbody>`;
            patient.lymphknoten.forEach((lk, index) => {
                let t2DetailsIcons = '';
                if (lk.t2_kriterien && typeof lk.t2_kriterien === 'object' && uiHelpersAvailable && typeof ui_helpers.getT2IconSVG === 'function') {
                    Object.entries(lk.t2_kriterien).forEach(([key, crit]) => {
                        if (crit && typeof crit === 'object' && crit.erfuellt !== undefined) { // Check for detailed object structure
                           let displayValue = crit.wert_text || crit.wert || (key === 'size' ? (crit.groesse_mm !== undefined ? `${formatNumber(crit.groesse_mm,1)}mm` : '?') : '?');
                           if (crit.erfuellt) {
                             t2DetailsIcons += `<span class="me-1" data-tippy-content="${uiTexts.t2CriteriaShort?.[key] || key}: ${displayValue} (${uiTexts.t2KriterienErfuelltKurz || 'erfüllt'})">${ui_helpers.getT2IconSVG(key, crit.wert)}</span>`;
                           } else {
                             t2DetailsIcons += `<span class="me-1 opacity-50" data-tippy-content="${uiTexts.t2CriteriaShort?.[key] || key}: ${displayValue} (${uiTexts.t2KriterienNichtErfuelltKurz || 'n.e.'})">${ui_helpers.getT2IconSVG(key, crit.wert)}</span>`;
                           }
                        } else if (typeof crit === 'boolean' && crit === true) { // Fallback for simple boolean true if erfuellt/wert not present
                             t2DetailsIcons += `<span class="me-1" data-tippy-content="${uiTexts.t2CriteriaShort?.[key] || key}: ${uiTexts.t2KriterienErfuelltKurz || 'erfüllt'}">${ui_helpers.getT2IconSVG(key, 'erfuellt')}</span>`;
                        }
                    });
                } else if (lk.t2_kriterien && typeof lk.t2_kriterien === 'object') { // Fallback if no getT2IconSVG but object exists
                     t2DetailsIcons = JSON.stringify(lk.t2_kriterien);
                } else {
                    t2DetailsIcons = '--';
                }
                if(t2DetailsIcons === '') t2DetailsIcons = '--';


                lymphknotenDetailsHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${_getStatusBadge(lk.as_status_lk, 'bg-as-positive', 'bg-as-negative')}</td>
                        <td>${_getStatusBadge(lk.n_status_lk)}</td>
                        <td class="lk-t2-details-icons">${t2DetailsIcons}</td>
                    </tr>`;
            });
            lymphknotenDetailsHTML += `</tbody></table>`;
        }

        return `
            <tr id="${rowId}" data-bs-toggle="collapse" data-bs-target="#${detailsId}" aria-expanded="false" aria-controls="${detailsId}" class="${hasLymphknoten ? 'accordion-toggle' : ''} table-row-main">
                <td class="text-center col-nr">${patient.nr || '--'}</td>
                <td class="col-name">${patient.name || '--'}</td>
                <td class="col-vorname">${patient.vorname || '--'}</td>
                <td class="text-center col-geschlecht">${geschlechtText}</td>
                <td class="text-center col-alter">${formatNumber(patient.alter_jahre, 0) || '--'}</td>
                <td class="col-therapie">${therapieText}</td>
                <td class="text-center col-status">
                    ${_getStatusBadge(patient.n_status_patient)}
                    ${_getStatusBadge(patient.as_status_patient, 'bg-as-positive', 'bg-as-negative')}
                    ${_getStatusBadge(patient.t2_status_patient, 'bg-t2-positive', 'bg-t2-negative')}
                </td>
                <td class="col-bemerkung small">${escapedBemerkung}</td>
                <td class="text-center col-details">
                    ${hasLymphknoten ? '<i class="fas fa-chevron-down row-toggle-icon"></i>' : ''}
                </td>
            </tr>
            ${hasLymphknoten ? `
            <tr class="sub-row">
                <td colspan="9" class="p-0">
                    <div id="${detailsId}" class="collapse">
                        <div class="card card-body sub-row-card">
                            <h6 class="card-title small mb-1">${tooltipContent.datenTableDetails.lkUebersichtTitel || 'Lymphknoten Details'} für Pat. ${patient.name || '--'} (${patient.nr || '?'})</h6>
                            ${lymphknotenDetailsHTML}
                        </div>
                    </div>
                </td>
            </tr>` : ''}`;
    }

    function createAuswertungTableRow(patient, currentAppliedCriteria, currentAppliedLogic) {
        if (!patient || typeof patient !== 'object') return '<tr><td colspan="8" class="text-danger">Fehlerhafte Patientendaten.</td></tr>';
        const appConfig = _getGlobalConfig('APP_CONFIG', { UI_SETTINGS: {}, SPECIAL_IDS: {} });
        const uiTexts = _getGlobalConfig('UI_TEXTS', { therapie: {} });
        const tooltipContent = _getGlobalConfig('TOOLTIP_CONTENT', { auswertungTableDetails: {} });
        const uiHelpersAvailable = typeof ui_helpers !== 'undefined';
        const appliedCriteriaDisplayName = appConfig.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME || "Angewandt";

        const rowId = `auswertung-row-${patient.id_patient || generateUUID()}`;
        const detailsId = `auswertung-details-${patient.id_patient || generateUUID()}`;
        const hasLymphknoten = patient.lymphknoten && patient.lymphknoten.length > 0;
        const therapieText = uiTexts.therapie?.[patient.therapie] || patient.therapie || '--';

        let lymphknotenDetailsHTML = `<p class="text-muted small">${tooltipContent.auswertungTableDetails.keineLymphknoten || 'Keine Lymphknoten für diesen Patienten erfasst oder nach Filterung relevant.'}</p>`;
        if (hasLymphknoten) {
            lymphknotenDetailsHTML = `<table class="table table-sm table-borderless table-responsive-sm small mb-0">
                <thead class="small"><tr>
                    <th data-tippy-content="${tooltipContent.auswertungTableDetails.lkNr || 'LK Nr.'}">${uiTexts.auswertungTableDetails?.lkNr || 'LK Nr.'}</th>
                    <th data-tippy-content="${tooltipContent.auswertungTableDetails.asStatusLk || 'AS Status (LK)'}">${uiTexts.auswertungTableDetails?.asStatusLk || 'AS (LK)'}</th>
                    <th data-tippy-content="${tooltipContent.auswertungTableDetails.nStatusLk || 'N Status (LK)'}">${uiTexts.auswertungTableDetails?.nStatusLk || 'N (LK)'}</th>
                    <th data-tippy-content="${tooltipContent.auswertungTableDetails.t2StatusLk || 'T2 Status (LK)'}">${uiTexts.auswertungTableDetails?.t2StatusLk || `T2 (${appliedCriteriaDisplayName}, LK)`}</th>
                    <th data-tippy-content="${tooltipContent.auswertungTableDetails.t2DetailsLk || 'Erfüllte T2 Kriterien (LK)'}">${uiTexts.auswertungTableDetails?.t2DetailsLk || 'T2 Details (LK)'}</th>
                </tr></thead><tbody>`;

            patient.lymphknoten.forEach((lk, index) => {
                let t2DetailsIconsLk = '';
                let t2ErfuelltLk = false;
                if (lk.t2_kriterien_details && typeof lk.t2_kriterien_details === 'object' && uiHelpersAvailable && typeof ui_helpers.getT2IconSVG === 'function') {
                     Object.entries(lk.t2_kriterien_details).forEach(([key, crit]) => {
                        if (crit && typeof crit === 'object' && crit.erfuellt !== undefined && currentAppliedCriteria[key]?.active) {
                           let displayValue = crit.wert_text || crit.wert || (key === 'size' ? (crit.groesse_mm !== undefined ? `${formatNumber(crit.groesse_mm,1)}mm` : '?') : '?');
                           if (crit.erfuellt) {
                             t2DetailsIconsLk += `<span class="me-1" data-tippy-content="${uiTexts.t2CriteriaShort?.[key] || key}: ${displayValue} (${uiTexts.t2KriterienErfuelltKurz || 'erfüllt'})">${ui_helpers.getT2IconSVG(key, crit.wert)}</span>`;
                             t2ErfuelltLk = true; // Mark if any applied criterion is met (for simple OR logic, more complex for AND)
                           } else {
                             t2DetailsIconsLk += `<span class="me-1 opacity-50" data-tippy-content="${uiTexts.t2CriteriaShort?.[key] || key}: ${displayValue} (${uiTexts.t2KriterienNichtErfuelltKurz || 'n.e.'})">${ui_helpers.getT2IconSVG(key, crit.wert)}</span>`;
                           }
                        }
                    });
                     if(t2DetailsIconsLk === '') t2DetailsIconsLk = '--';
                } else {
                    t2DetailsIconsLk = '--';
                }
                 // Determine LK T2 status based on individual criteria and logic
                const lkT2Status = (typeof t2CriteriaManager !== 'undefined' && lk.t2_kriterien_details)
                                    ? t2CriteriaManager.evaluateSingleLymphnode(lk.t2_kriterien_details, currentAppliedCriteria, currentAppliedLogic)
                                    : lk.t2_status_lk; // Fallback to pre-calculated if manager not available or no details


                lymphknotenDetailsHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${_getStatusBadge(lk.as_status_lk, 'bg-as-positive', 'bg-as-negative')}</td>
                        <td>${_getStatusBadge(lk.n_status_lk)}</td>
                        <td>${_getStatusBadge(lkT2Status, 'bg-t2-positive', 'bg-t2-negative')}</td>
                        <td class="lk-t2-details-icons">${t2DetailsIconsLk}</td>
                    </tr>`;
            });
            lymphknotenDetailsHTML += `</tbody></table>`;
        }
        
        const nPathoGesamt = patient.lymphknoten_n_patho_gesamt ?? 0;
        const nGesamt = patient.lymphknoten_n_gesichtet_gesamt ?? 0;
        const asPosGesamt = patient.lymphknoten_as_pos_gesamt ?? 0;
        const asGesamt = patient.lymphknoten_as_gesichtet_gesamt ?? 0;
        const t2PosGesamt = patient.lymphknoten_t2_pos_gesamt ?? 0;
        const t2Gesamt = patient.lymphknoten_t2_gesichtet_gesamt ?? 0;


        return `
            <tr id="${rowId}" data-bs-toggle="collapse" data-bs-target="#${detailsId}" aria-expanded="false" aria-controls="${detailsId}" class="${hasLymphknoten ? 'accordion-toggle' : ''} table-row-main">
                <td class="text-center col-nr">${patient.nr || '--'}</td>
                <td class="col-name">${patient.name || '--'}</td>
                <td class="col-therapie">${therapieText}</td>
                <td class="text-center col-status">
                    ${_getStatusBadge(patient.n_status_patient)}
                    ${_getStatusBadge(patient.as_status_patient, 'bg-as-positive', 'bg-as-negative')}
                    ${_getStatusBadge(patient.t2_status_patient, 'bg-t2-positive', 'bg-t2-negative')}
                </td>
                <td class="text-center col-lk-count" data-tippy-content="${tooltipContent.auswertungTable?.n_counts || 'Pathologische N / Gesamt N Lymphknoten'}">${nPathoGesamt}/${nGesamt}</td>
                <td class="text-center col-lk-count" data-tippy-content="${tooltipContent.auswertungTable?.as_counts || 'AS Positive / Gesamt AS Lymphknoten'}">${asPosGesamt}/${asGesamt}</td>
                <td class="text-center col-lk-count" data-tippy-content="${tooltipContent.auswertungTable?.t2_counts || 'T2 Positive / Gesamt T2 Lymphknoten'}">${t2PosGesamt}/${t2Gesamt}</td>
                <td class="text-center col-details">
                    ${hasLymphknoten ? '<i class="fas fa-chevron-down row-toggle-icon"></i>' : ''}
                </td>
            </tr>
            ${hasLymphknoten ? `
            <tr class="sub-row">
                <td colspan="8" class="p-0">
                    <div id="${detailsId}" class="collapse">
                        <div class="card card-body sub-row-card">
                            <h6 class="card-title small mb-1">${tooltipContent.auswertungTableDetails.lkUebersichtTitel || 'Lymphknoten Details'} für Pat. ${patient.name || '--'} (${patient.nr || '?'})</h6>
                            ${lymphknotenDetailsHTML}
                        </div>
                    </div>
                </td>
            </tr>` : ''}`;
    }

    return Object.freeze({
        createDatenTableRow,
        createAuswertungTableRow
    });

})();
