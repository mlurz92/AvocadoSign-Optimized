const uiViewLogic = (() => {

    // Interne Hilfsfunktionen zum Generieren der Tooltip-Inhalte
    function _getMetricDescriptionHTML(key, methode = '') {
       const desc = window.TOOLTIP_CONTENT.statMetrics[key]?.description || key;
       // Ersetze nur [METHODE], falls vorhanden. Andere Platzhalter sind hier nicht relevant.
       return desc.replace(/\[METHODE\]/g, methode);
    }

    function _getMetricInterpretationHTML(key, metricData, methode = '', kollektivName = '') {
        const interpretationTemplate = window.TOOLTIP_CONTENT.statMetrics[key]?.interpretation || 'Keine Interpretation verfügbar.';
        // Stelle sicher, dass metricData ein Objekt ist, auch wenn nur der Wert übergeben wird
        const data = (typeof metricData === 'object' && metricData !== null) ? metricData : { value: metricData, ci: null, method: 'N/A' };
        const na = '--';
        const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
        const isPercent = !(key === 'f1' || key === 'auc');
        const valueStr = window.formatNumber(data?.value, digits, na);
        const lowerStr = window.formatNumber(data?.ci?.lower, digits, na);
        const upperStr = window.formatNumber(data?.ci?.upper, digits, na);
        const ciMethodStr = data?.method || 'N/A'; // Verwende N/A wenn Methode nicht verfügbar
        const bewertungStr = (key === 'auc') ? window.getAUCBewertung(data?.value) : '';

        // Ersetze alle relevanten Platzhalter sorgfältig
        let interpretation = interpretationTemplate
            .replace(/\[METHODE\]/g, methode)
            .replace(/\[WERT\]/g, `<strong>${valueStr}${isPercent ? '%' : ''}</strong>`)
            .replace(/\[LOWER\]/g, lowerStr)
            .replace(/\[UPPER\]/g, upperStr)
            .replace(/\[METHOD_CI\]/g, ciMethodStr)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
            .replace(/\[BEWERTUNG\]/g, `<strong>${bewertungStr}</strong>`);

        // Entferne Sätze/Teile, die sich auf CI beziehen, falls keine CI-Daten vorhanden sind
        if (lowerStr === na || upperStr === na) {
             interpretation = interpretation.replace(/\(95% CI nach .*?: .*? - .*?\)/g, '(Keine CI-Daten verfügbar)');
             interpretation = interpretation.replace(/nach \[METHOD_CI\]:/g, ''); // Entferne auch den Methodenteil, wenn CIs fehlen
        }
         interpretation = interpretation.replace(/p=\[P_WERT\], \[SIGNIFIKANZ\]/g,''); // Entferne p-Wert Teil falls nicht relevant für diese Metrik
         interpretation = interpretation.replace(/<hr.*?>.*$/, ''); // Sicherstellen, dass kein <hr> übrig bleibt

        return interpretation;
    }


    function _getTestDescriptionHTML(key, t2ShortName = 'T2') {
        const desc = window.TOOLTIP_CONTENT.statMetrics[key]?.description || key;
        return desc.replace(/\[T2_SHORT_NAME\]/g, t2ShortName);
    }

    function _getTestInterpretationHTML(key, testData, kollektivName = '', t2ShortName = 'T2') {
        const interpretationTemplate = window.TOOLTIP_CONTENT.statMetrics[key]?.interpretation || 'Keine Interpretation verfügbar.';
         if (!testData) return 'Keine Daten für Interpretation verfügbar.';
        const na = '--';
        const pValue = testData?.pValue;
        const pStr = (pValue !== null && !isNaN(pValue)) ? (pValue < 0.001 ? '&lt;0.001' : window.formatNumber(pValue, 3, na)) : na;
        const sigSymbol = window.getStatisticalSignificanceSymbol(pValue);
        const sigText = window.getStatisticalSignificanceText(pValue);
         return interpretationTemplate
            .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
            .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
            .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
            .replace(/\[T2_SHORT_NAME\]/g, t2ShortName)
            .replace(/<hr.*?>.*$/, ''); // Sicherstellen, dass kein <hr> übrig bleibt
    }

    function _getAssociationInterpretationHTML(key, assocObj, merkmalName, kollektivName) {
        const interpretationTemplate = window.TOOLTIP_CONTENT.statMetrics[key]?.interpretation || 'Keine Interpretation verfügbar.';
        if (!assocObj) return 'Keine Daten für Interpretation verfügbar.';
        const na = '--';
        let valueStr = na, lowerStr = na, upperStr = na, ciMethodStr = na, bewertungStr = '', pStr = na, sigSymbol = '', sigText = '', pVal = NaN;
        const assozPValue = assocObj?.pValue; // p-Wert für Assoziation (Fisher/MWU)

        if (key === 'or') {
            valueStr = window.formatNumber(assocObj.or?.value, 2, na);
            lowerStr = window.formatNumber(assocObj.or?.ci?.lower, 2, na);
            upperStr = window.formatNumber(assocObj.or?.ci?.upper, 2, na);
            ciMethodStr = assocObj.or?.method || na;
            pStr = (assozPValue !== null && !isNaN(assozPValue)) ? (assozPValue < 0.001 ? '&lt;0.001' : window.formatNumber(assozPValue, 3, na)) : na;
            sigSymbol = window.getStatisticalSignificanceSymbol(assozPValue);
            sigText = window.getStatisticalSignificanceText(assozPValue);
        } else if (key === 'rd') {
            valueStr = window.formatNumber(assocObj.rd?.value !== null && !isNaN(assocObj.rd?.value) ? assocObj.rd.value * 100 : NaN, 1, na);
            lowerStr = window.formatNumber(assocObj.rd?.ci?.lower !== null && !isNaN(assocObj.rd?.ci?.lower) ? assocObj.rd.ci.lower * 100 : NaN, 1, na);
            upperStr = window.formatNumber(assocObj.rd?.ci?.upper !== null && !isNaN(assocObj.rd?.ci?.upper) ? assocObj.rd.ci.upper * 100 : NaN, 1, na);
            ciMethodStr = assocObj.rd?.method || na;
        } else if (key === 'phi') {
            valueStr = window.formatNumber(assocObj.phi?.value, 2, na);
            bewertungStr = window.getPhiBewertung(assocObj.phi?.value);
        } else if (key === 'fisher' || key === 'mannwhitney' || key === 'pvalue') { // Added 'pvalue' for direct use
             pVal = assocObj?.pValue;
             pStr = (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : window.formatNumber(pVal, 3, na)) : na;
             sigSymbol = window.getStatisticalSignificanceSymbol(pVal);
             sigText = window.getStatisticalSignificanceText(pVal);
             // Use the defaultP interpretation template if specific one not found
             const specificInterpretation = window.TOOLTIP_CONTENT.statMetrics[key]?.interpretation;
             const templateToUse = specificInterpretation || window.TOOLTIP_CONTENT.statMetrics.defaultP.interpretation;
             return templateToUse
                 .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
                 .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
                 .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                 .replace(/\[MERKMAL\]/g, `'${merkmalName}'`) // Add MERKMAL replacement
                 .replace(/\[VARIABLE\]/g, `'${merkmalName}'`) // Add VARIABLE replacement
                 .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
                 .replace(/<hr.*?>.*$/, '');
        }

        let interpretation = interpretationTemplate
            .replace(/\[MERKMAL\]/g, `'${merkmalName}'`)
            .replace(/\[WERT\]/g, `<strong>${valueStr}${key === 'rd' ? '%' : ''}</strong>`)
            .replace(/\[LOWER\]/g, `<strong>${lowerStr}${key === 'rd' ? '%' : ''}</strong>`)
            .replace(/\[UPPER\]/g, `<strong>${upperStr}${key === 'rd' ? '%' : ''}</strong>`)
            .replace(/\[METHOD_CI\]/g, `<em>${ciMethodStr}</em>`)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
            .replace(/\[FAKTOR_TEXT\]/g, assocObj?.or?.value > 1 ? window.UI_TEXTS.statMetrics.orFaktorTexte.ERHOEHT : (assocObj?.or?.value < 1 ? window.UI_TEXTS.statMetrics.orFaktorTexte.VERRINGERT : window.UI_TEXTS.statMetrics.orFaktorTexte.UNVERAENDERT))
            .replace(/\[HOEHER_NIEDRIGER\]/g, assocObj?.rd?.value > 0 ? window.UI_TEXTS.statMetrics.rdRichtungTexte.HOEHER : (assocObj?.rd?.value < 0 ? window.UI_TEXTS.statMetrics.rdRichtungTexte.NIEDRIGER : window.UI_TEXTS.statMetrics.rdRichtungTexte.GLEICH))
            .replace(/\[STAERKE\]/g, `<strong>${bewertungStr}</strong>`)
            .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
            .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
            .replace(/<hr.*?>.*$/, ''); // Sicherstellen, dass kein <hr> übrig bleibt

         // Remove CI part if data is missing
         if (key === 'or' || key === 'rd') {
            if (lowerStr === na || upperStr === na) {
                interpretation = interpretation.replace(/\(95% CI nach .*?: .*? - .*?\)/g, '(Keine CI-Daten verfügbar)');
                interpretation = interpretation.replace(/nach \[METHOD_CI\]:/g, ''); // Remove method if CI is missing
            }
         }
         // Remove p-value part from OR interpretation if p-value is missing (shouldn't happen with Fisher)
         if (key === 'or' && pStr === na) {
             interpretation = interpretation.replace(/, p=.*?, .*?\)/g, ')');
         }

        return interpretation;
    }

    function createTableHeaderHTML(tableId, sortState, columns) {
        let headerHTML = `<thead class="small" id="${tableId}-header"><tr>`;
        columns.forEach(col => {
            let sortIconHTML = '<i class="fas fa-sort text-muted opacity-50"></i>';
            let mainHeaderStyle = '';
            if (sortState && sortState.key === col.key && !col.subKeys) {
                sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary"></i>`;
                mainHeaderStyle = 'style="color: var(--primary-color);"';
            }

            const subHeaders = col.subKeys ? col.subKeys.map(sk => {
                 let subIconHTML = '';
                 const isActiveSubSort = sortState && sortState.key === col.key && sortState.subKey === sk.key;
                 if(isActiveSubSort) {
                    sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary"></i>`;
                    subIconHTML = sortIconHTML;
                 }
                 const style = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                 return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}" data-tippy-content="Sortieren nach ${col.label} -> ${sk.label}">${sk.label}</span>`;
             }).join(' / ') : '';

            const sortAttributes = `data-sort-key="${col.key}" ${col.subKeys ? '' : 'style="cursor: pointer;"'}`;
            const tooltip = col.tooltip ? `data-tippy-content="${col.tooltip}"` : '';
            const thClass = col.textAlign ? `text-${col.textAlign}` : '';
            const styleAttr = col.width ? `style="width: ${col.width};"` : '';

            if (col.subKeys) {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} ${tooltip} ${styleAttr}>${col.label} (${subHeaders}) ${sortIconHTML}</th>`;
             } else {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} ${tooltip} ${styleAttr} ${mainHeaderStyle}>${col.label} ${sortIconHTML}</th>`;
             }
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }

    function createPatientenTableHTML(data, sortState) {
        if (!Array.isArray(data)) return '<p class="text-danger">Fehler: Ungültige Patientendaten für Tabelle.</p>';

        const tableId = 'patienten-table';
        const columns = [
            { key: 'nr', label: 'Nr', tooltip: window.TOOLTIP_CONTENT.patientTable.nr },
            { key: 'name', label: 'Name', tooltip: window.TOOLTIP_CONTENT.patientTable.name },
            { key: 'vorname', label: 'Vorname', tooltip: window.TOOLTIP_CONTENT.patientTable.vorname },
            { key: 'geschlecht', label: 'Geschl.', tooltip: window.TOOLTIP_CONTENT.patientTable.geschlecht },
            { key: 'alter', label: 'Alter', tooltip: window.TOOLTIP_CONTENT.patientTable.alter },
            { key: 'therapie', label: 'Therapie', tooltip: window.TOOLTIP_CONTENT.patientTable.therapie },
            { key: 'status', label: 'N/AS/T2', tooltip: window.TOOLTIP_CONTENT.patientTable.n_as_t2, subKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}] },
            { key: 'bemerkung', label: 'Bemerkung', tooltip: window.TOOLTIP_CONTENT.patientTable.bemerkung },
            { key: 'details', label: '', width: '30px'}
        ];

        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
        tableHTML += createTableHeaderHTML(tableId, sortState, columns);
        tableHTML += `<tbody id="${tableId}-body">`;
        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">Keine Patienten im ausgewählten Kollektiv gefunden.</td></tr>`;
        } else {
            data.forEach(patient => {
                tableHTML += window.tableRenderer.createPatientTableRow(patient);
            });
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

     function createAuswertungTableHTML(data, sortState, appliedCriteria, appliedLogic) {
         if (!Array.isArray(data)) return '<p class="text-danger">Fehler: Ungültige Auswertungsdaten für Tabelle.</p>';

         const tableId = 'auswertung-table';
         const columns = [
             { key: 'nr', label: 'Nr', tooltip: window.TOOLTIP_CONTENT.auswertungTable.nr },
             { key: 'name', label: 'Name', tooltip: window.TOOLTIP_CONTENT.auswertungTable.name },
             { key: 'therapie', label: 'Therapie', tooltip: window.TOOLTIP_CONTENT.auswertungTable.therapie },
             { key: 'status', label: 'N/AS/T2', tooltip: window.TOOLTIP_CONTENT.auswertungTable.n_as_t2, subKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}]},
             { key: 'anzahl_patho_lk', label: 'N+/N ges.', tooltip: window.TOOLTIP_CONTENT.auswertungTable.n_counts, textAlign: 'center' },
             { key: 'anzahl_as_lk', label: 'AS+/AS ges.', tooltip: window.TOOLTIP_CONTENT.auswertungTable.as_counts, textAlign: 'center' },
             { key: 'anzahl_t2_lk', label: 'T2+/T2 ges.', tooltip: window.TOOLTIP_CONTENT.auswertungTable.t2_counts, textAlign: 'center' },
             { key: 'details', label: '', width: '30px'}
         ];

         let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
         tableHTML += createTableHeaderHTML(tableId, sortState, columns);
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

    function createAuswertungTableCardHTML(data, sortState, appliedCriteria, appliedLogic) {
        const tableHTML = createAuswertungTableHTML(data, sortState, appliedCriteria, appliedLogic);
        return `
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>Patientenübersicht & Auswertungsergebnisse</span>
                        <button id="auswertung-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${window.TOOLTIP_CONTENT.auswertungTable.expandAll || 'Alle Details ein-/ausblenden'}">
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

    function createDeskriptiveStatistikContentHTML(stats, indexSuffix = '0', kollektivName = '') {
        if (!stats || !stats.deskriptiv || !stats.deskriptiv.anzahlPatienten) return '<p class="text-muted small p-3">Keine deskriptiven Daten verfügbar.</p>';
        const total = stats.deskriptiv.anzahlPatienten;
        const na = '--';
        const fv = (val, dig = 1) => window.formatNumber(val, dig, na);
        const fP = (val, dig = 1) => window.formatPercent(val, dig, na);
        const fLK = (lkData) => `${fv(lkData?.median,1)} (${fv(lkData?.min,0)}-${fv(lkData?.max,0)}) [${fv(lkData?.mean,1)} ± ${fv(lkData?.sd,1)}]`;
        const d = stats.deskriptiv;
        const ageChartId = `chart-stat-age-${indexSuffix}`;
        const genderChartId = `chart-stat-gender-${indexSuffix}`;

        let tableHTML = `
            <div class="row g-3 p-2">
                <div class="col-md-6">
                    <div class="table-responsive mb-3">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-demographie-${indexSuffix}">
                            <caption>Demographie & Status (N=${total})</caption>
                            <thead class="visually-hidden"><tr><th>Metrik</th><th>Wert</th></tr></thead>
                            <tbody>
                                <tr data-tippy-content="${window.TOOLTIP_CONTENT.deskriptiveStatistik.alterMedian?.description || 'Alter'}"><td>Alter Median (Min-Max) [Mean ± SD]</td><td>${fv(d.alter?.median, 1)} (${fv(d.alter?.min, 0)} - ${fv(d.alter?.max, 0)}) [${fv(d.alter?.mean, 1)} ± ${fv(d.alter?.sd, 1)}]</td></tr>
                                <tr data-tippy-content="${window.TOOLTIP_CONTENT.deskriptiveStatistik.geschlecht?.description || 'Geschlecht'}"><td>Geschlecht (m / w) (n / %)</td><td>${d.geschlecht?.m ?? 0} / ${d.geschlecht?.f ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.geschlecht?.m ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.geschlecht?.f ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${window.TOOLTIP_CONTENT.patientTable.therapie || 'Therapie'}"><td>Therapie (direkt OP / nRCT) (n / %)</td><td>${d.therapie?.['direkt OP'] ?? 0} / ${d.therapie?.nRCT ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.therapie?.['direkt OP'] ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.therapie?.nRCT ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${window.TOOLTIP_CONTENT.deskriptiveStatistik.nStatus?.description || 'N Status'}"><td>N Status (+ / -) (n / %)</td><td>${d.nStatus?.plus ?? 0} / ${d.nStatus?.minus ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.nStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.nStatus?.minus ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${window.TOOLTIP_CONTENT.deskriptiveStatistik.asStatus?.description || 'AS Status'}"><td>AS Status (+ / -) (n / %)</td><td>${d.asStatus?.plus ?? 0} / ${d.asStatus?.minus ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.asStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.asStatus?.minus ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${window.TOOLTIP_CONTENT.deskriptiveStatistik.t2Status?.description || 'T2 Status'}"><td>T2 Status (+ / -) (n / %)</td><td>${d.t2Status?.plus ?? 0} / ${d.t2Status?.minus ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.t2Status?.plus ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.t2Status?.minus ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                            </tbody>
                        </table>
                    </div>
                     <div class="table-responsive">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-lk-${indexSuffix}">
                             <caption>Lymphknotenanzahlen (Median (Min-Max) [Mean ± SD])</caption>
                             <thead class="visually-hidden"><tr><th>Metrik</th><th>Wert</th></tr></thead>
                             <tbody>
                                <tr data-tippy-content="${window.TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlPatho?.description || 'LK N gesamt'}"><td>LK N gesamt</td><td>${fLK(d.lkAnzahlen?.n?.total)}</td></tr>
                                <tr data-tippy-content="${window.TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlPathoPlus?.description || 'LK N+'}"><td>LK N+ <sup>*</sup></td><td>${fLK(d.lkAnzahlen?.n?.plus)}</td></tr>
                                <tr data-tippy-content="${window.TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlAS?.description || 'LK AS gesamt'}"><td>LK AS gesamt</td><td>${fLK(d.lkAnzahlen?.as?.total)}</td></tr>
                                <tr data-tippy-content="${window.TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlASPlus?.description || 'LK AS+'}"><td>LK AS+ <sup>**</sup></td><td>${fLK(d.lkAnzahlen?.as?.plus)}</td></tr>
                                <tr data-tippy-content="${window.TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlT2?.description || 'LK T2 gesamt'}"><td>LK T2 gesamt</td><td>${fLK(d.lkAnzahlen?.t2?.total)}</td></tr>
                                <tr data-tippy-content="${window.TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlT2Plus?.description || 'LK T2+'}"><td>LK T2+ <sup>***</sup></td><td>${fLK(d.lkAnzahlen?.t2?.plus)}</td></tr>
                             </tbody>
                        </table>
                     </div>
                    <p class="small text-muted mt-1 mb-0"><sup>*</sup> Nur bei N+ Patienten (n=${d.nStatus?.plus ?? 0}); <sup>**</sup> Nur bei AS+ Patienten (n=${d.asStatus?.plus ?? 0}); <sup>***</sup> Nur bei T2+ Patienten (n=${d.t2Status?.plus ?? 0}).</p>
                </div>
                <div class="col-md-6 d-flex flex-column">
                    <div class="mb-2 flex-grow-1" id="${ageChartId}" style="min-height: 150px;" data-tippy-content="${window.TOOLTIP_CONTENT.deskriptiveStatistik.chartAge?.description || 'Altersverteilung'}">
                       <p class="text-muted small text-center p-3">Lade Altersverteilung...</p>
                    </div>
                    <div class="flex-grow-1" id="${genderChartId}" style="min-height: 150px;" data-tippy-content="${window.TOOLTIP_CONTENT.deskriptiveStatistik.chartGender?.description || 'Geschlechterverteilung'}">
                       <p class="text-muted small text-center p-3">Lade Geschlechterverteilung...</p>
                    </div>
                </div>
            </div>`;
        return tableHTML;
    }

    function createGueteContentHTML(stats, methode, kollektivName) {
        if (!stats || !stats.matrix) return '<p class="text-muted small p-3">Keine Gütedaten verfügbar.</p>';
        const matrix = stats.matrix; const na = '--';
        const fCI_perf = (m, key) => { const digits = (key === 'f1' || key === 'auc') ? 3 : 1; const isPercent = !(key === 'f1' || key === 'auc'); return window.formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, digits, isPercent, na); };
        let matrixHTML = `<h6 class="px-2 pt-2">Konfusionsmatrix (${methode} vs. N)</h6><table class="table table-sm table-bordered text-center small mx-2 mb-3" style="width: auto;" id="table-guete-matrix-${methode}-${kollektivName.replace(/\s+/g, '_')}"><thead class="small"><tr><th></th><th>N+ (Patho)</th><th>N- (Patho)</th></tr></thead><tbody><tr><td class="fw-bold">${methode}+</td><td data-tippy-content="Richtig Positiv (RP): ${methode}+ und N+">${window.formatNumber(matrix.rp,0,na)}</td><td data-tippy-content="Falsch Positiv (FP): ${methode}+ aber N-">${window.formatNumber(matrix.fp,0,na)}</td></tr><tr><td class="fw-bold">${methode}-</td><td data-tippy-content="Falsch Negativ (FN): ${methode}- aber N+">${window.formatNumber(matrix.fn,0,na)}</td><td data-tippy-content="Richtig Negativ (RN): ${methode}- und N-">${window.formatNumber(matrix.rn,0,na)}</td></tr></tbody></table>`;
        let metricsHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-guete-metrics-${methode}-${kollektivName.replace(/\s+/g, '_')}"><caption>Diagnostische Gütekriterien</caption><thead><tr><th>Metrik</th><th>Wert (95% CI)</th><th>CI Methode</th></tr></thead><tbody>
            <tr><td data-tippy-content="${window.ui_helpers.getMetricDescriptionHTML('sens', methode)}">Sensitivität</td><td data-tippy-content="${window.ui_helpers.getMetricInterpretationHTML('sens', stats.sens, methode, kollektivName)}">${fCI_perf(stats.sens, 'sens')}</td><td>${stats.sens?.method || na}</td></tr>
            <tr><td data-tippy-content="${window.ui_helpers.getMetricDescriptionHTML('spez', methode)}">Spezifität</td><td data-tippy-content="${window.ui_helpers.getMetricInterpretationHTML('spez', stats.spez, methode, kollektivName)}">${fCI_perf(stats.spez, 'spez')}</td><td>${stats.spez?.method || na}</td></tr>
            <tr><td data-tippy-content="${window.ui_helpers.getMetricDescriptionHTML('ppv', methode)}">PPV</td><td data-tippy-content="${window.ui_helpers.getMetricInterpretationHTML('ppv', stats.ppv, methode, kollektivName)}">${fCI_perf(stats.ppv, 'ppv')}</td><td>${stats.ppv?.method || na}</td></tr>
            <tr><td data-tippy-content="${window.ui_helpers.getMetricDescriptionHTML('npv', methode)}">NPV</td><td data-tippy-content="${window.ui_helpers.getMetricInterpretationHTML('npv', stats.npv, methode, kollektivName)}">${fCI_perf(stats.npv, 'npv')}</td><td>${stats.npv?.method || na}</td></tr>
            <tr><td data-tippy-content="${window.ui_helpers.getMetricDescriptionHTML('acc', methode)}">Accuracy</td><td data-tippy-content="${window.ui_helpers.getMetricInterpretationHTML('acc', stats.acc, methode, kollektivName)}">${fCI_perf(stats.acc, 'acc')}</td><td>${stats.acc?.method || na}</td></tr>
            <tr><td data-tippy-content="${window.ui_helpers.getMetricDescriptionHTML('balAcc', methode)}">Balanced Accuracy</td><td data-tippy-content="${window.ui_helpers.getMetricInterpretationHTML('balAcc', stats.balAcc, methode, kollektivName)}">${fCI_perf(stats.balAcc, 'balAcc')}</td><td>${stats.balAcc?.method || na}</td></tr>
            <tr><td data-tippy-content="${window.ui_helpers.getMetricDescriptionHTML('f1', methode)}">F1-Score</td><td data-tippy-content="${window.ui_helpers.getMetricInterpretationHTML('f1', stats.f1, methode, kollektivName)}">${fCI_perf(stats.f1, 'f1')}</td><td>${stats.f1?.method || na}</td></tr>
            <tr><td data-tippy-content="${window.ui_helpers.getMetricDescriptionHTML('auc', methode)}">AUC (Bal. Acc.)</td><td data-tippy-content="${window.ui_helpers.getMetricInterpretationHTML('auc', stats.auc, methode, kollektivName)}">${fCI_perf(stats.auc, 'auc')}</td><td>${stats.auc?.method || na}</td></tr>
        </tbody></table></div>`;
        return matrixHTML + metricsHTML;
    }

    function createVergleichContentHTML(stats, kollektivName, t2ShortName = 'T2') {
        if (!stats) return '<p class="text-muted small p-3">Keine Vergleichsdaten verfügbar.</p>';
        const na = '--'; const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : window.formatNumber(pVal, 3, na, true)) : na;
        const displayKollektivName = window.getKollektivDisplayName(kollektivName);
        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}"><caption>Statistische Vergleiche zwischen Avocado Sign (AS) und T2-Kriterien (${t2ShortName}) im Kollektiv ${displayKollektivName}</caption><thead><tr><th>Test</th><th>Statistik</th><th>p-Wert</th><th>Methode</th></tr></thead><tbody>
            <tr><td data-tippy-content="${window.ui_helpers.getTestDescriptionHTML('mcnemar', t2ShortName)}">McNemar (Accuracy)</td><td>${window.formatNumber(stats.mcnemar?.statistic, 3, na, true)} (df=${stats.mcnemar?.df || na})</td><td data-tippy-content="${window.ui_helpers.getTestInterpretationHTML('mcnemar', stats.mcnemar, displayKollektivName, t2ShortName)}">${fP(stats.mcnemar?.pValue)} ${window.getStatisticalSignificanceSymbol(stats.mcnemar?.pValue)}</td><td>${stats.mcnemar?.method || na}</td></tr>
            <tr><td data-tippy-content="${window.ui_helpers.getTestDescriptionHTML('delong', t2ShortName)}">DeLong (AUC)</td><td>Z=${window.formatNumber(stats.delong?.Z, 3, na, true)}</td><td data-tippy-content="${window.ui_helpers.getTestInterpretationHTML('delong', stats.delong, displayKollektivName, t2ShortName)}">${fP(stats.delong?.pValue)} ${window.getStatisticalSignificanceSymbol(stats.delong?.pValue)}</td><td>${stats.delong?.method || na}</td></tr>
        </tbody></table></div>`;
        return tableHTML;
    }

    function createAssoziationContentHTML(stats, kollektivName, criteria) {
        if (!stats || Object.keys(stats).length === 0) return '<p class="text-muted small p-3">Keine Assoziationsdaten verfügbar.</p>';
        const na = '--'; const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : window.formatNumber(pVal, 3, na, true)) : na;
        const displayKollektivName = window.getKollektivDisplayName(kollektivName);
        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-assoziation-${kollektivName.replace(/\s+/g, '_')}"><caption>Assoziation zwischen Merkmalen und N-Status (+/-) für Kollektiv ${displayKollektivName}</caption><thead><tr><th>Merkmal</th><th>OR (95% CI)</th><th>RD (%) (95% CI)</th><th>Phi (φ)</th><th>p-Wert</th><th>Test</th></tr></thead><tbody>`;

        const getPValueInterpretationAssoc = (key, assocObj) => {
             const testName = assocObj?.testName || '';
             let pTooltipKey = 'defaultP';
             if (testName) {
                if (testName.toLowerCase().includes("fisher")) pTooltipKey = 'fisher';
                else if (testName.toLowerCase().includes("mann-whitney")) pTooltipKey = 'mannwhitney';
             } else if (key === 'size_mwu') {
                pTooltipKey = 'mannwhitney';
             }
             const merkmalName = assocObj?.featureName || key;
             return window.ui_helpers.getAssociationInterpretationHTML(pTooltipKey, assocObj, merkmalName, displayKollektivName);
        };
        const getTestDescriptionAssoc = (assocObj, key) => {
             const testName = assocObj?.testName || '';
             let pTooltipKey = 'defaultP';
             if (testName) {
                if (testName.toLowerCase().includes("fisher")) pTooltipKey = 'fisher';
                else if (testName.toLowerCase().includes("mann-whitney")) pTooltipKey = 'mannwhitney';
             } else if (key === 'size_mwu') {
                pTooltipKey = 'mannwhitney';
             }
             const merkmalName = assocObj?.featureName || key;
             const descriptionTemplate = window.TOOLTIP_CONTENT.statMetrics[pTooltipKey]?.description || window.TOOLTIP_CONTENT.statMetrics.defaultP.description || 'Testbeschreibung nicht verfügbar.';
             return descriptionTemplate.replace(/\[MERKMAL\]/g, `<strong>'${merkmalName}'</strong>`).replace(/\[VARIABLE\]/g, `<strong>'${merkmalName}'</strong>`);
        };

        const getMerkmalDescriptionHTMLAssoc = (key, assocObj) => {
             const baseName = window.TOOLTIP_CONTENT.statMetrics[key]?.name || assocObj?.featureName || key;
             const tooltipDescription = window.TOOLTIP_CONTENT.statMetrics[key]?.description || `Dieses Merkmal ('${baseName}') wird auf Assoziation mit dem N-Status getestet.`;
             return tooltipDescription.replace(/\[MERKMAL\]/g, `<strong>'${baseName}'</strong>`).replace(/\[METHODE\]/g, `<strong>'${baseName}'</strong>`);
        };


        const addRow = (key, assocObj, isActive = true) => {
            if (!assocObj) return '';
            const merkmalName = assocObj.featureName || key;
            const orStr = window.formatCI(assocObj.or?.value, assocObj.or?.ci?.lower, assocObj.or?.ci?.upper, 2, false, na);
            const rdValPerc = window.formatNumber(assocObj.rd?.value !== null && !isNaN(assocObj.rd?.value) ? assocObj.rd.value * 100 : NaN, 1, na, false);
            const rdCILowerPerc = window.formatNumber(assocObj.rd?.ci?.lower !== null && !isNaN(assocObj.rd?.ci?.lower) ? assocObj.rd.ci.lower * 100 : NaN, 1, na, false);
            const rdCIUpperPerc = window.formatNumber(assocObj.rd?.ci?.upper !== null && !isNaN(assocObj.rd?.ci?.upper) ? assocObj.rd.ci.upper * 100 : NaN, 1, na, false);
            const rdStr = rdValPerc !== na ? `${rdValPerc}% (${rdCILowerPerc}% - ${rdCIUpperPerc}%)` : na;
            const phiStr = window.formatNumber(assocObj.phi?.value, 2, na, true);
            const pStr = fP(assocObj.pValue);
            const sigSymbol = window.getStatisticalSignificanceSymbol(assocObj.pValue);
            const testName = assocObj.testName || na;
            const aktivText = isActive ? '' : ' <small class="text-muted">(inaktiv in T2-Def.)</small>';

            return `<tr>
                <td data-tippy-content="${getMerkmalDescriptionHTMLAssoc(key, assocObj)}">${merkmalName}${aktivText}</td>
                <td data-tippy-content="${window.ui_helpers.getAssociationInterpretationHTML('or', assocObj, merkmalName, displayKollektivName)}">${orStr}</td>
                <td data-tippy-content="${window.ui_helpers.getAssociationInterpretationHTML('rd', assocObj, merkmalName, displayKollektivName)}">${rdStr}</td>
                <td data-tippy-content="${window.ui_helpers.getAssociationInterpretationHTML('phi', assocObj, merkmalName, displayKollektivName)}">${phiStr}</td>
                <td data-tippy-content="${getPValueInterpretationAssoc(key, assocObj)}">${pStr} ${sigSymbol}</td>
                <td data-tippy-content="${getTestDescriptionAssoc(assocObj, key)}">${testName}</td>
            </tr>`;
        };

        if (stats.as) tableHTML += addRow('as', stats.as);
        if (stats.size_mwu && stats.size_mwu.testName && !stats.size_mwu.testName.includes("Invalid") && !stats.size_mwu.testName.includes("Nicht genug")) {
            const mwuObj = stats.size_mwu;
            const pStr = fP(mwuObj.pValue);
            const sigSymbol = window.getStatisticalSignificanceSymbol(mwuObj.pValue);
            const pTooltip = getPValueInterpretationAssoc('size_mwu', mwuObj);
            const descTooltip = window.TOOLTIP_CONTENT.statMetrics.size_mwu.description || "Vergleich der medianen Lymphknotengröße zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test.";
            const testDescTooltip = getTestDescriptionAssoc(mwuObj, 'size_mwu');
            tableHTML += `<tr>
                <td data-tippy-content="${descTooltip}">${mwuObj.featureName || 'LK Größe (Median Vgl.)'}</td>
                <td>${na}</td><td>${na}</td><td>${na}</td>
                <td data-tippy-content="${pTooltip}">${pStr} ${sigSymbol}</td>
                <td data-tippy-content="${testDescTooltip}">${mwuObj.testName || na}</td>
            </tr>`;
        }
        const featureOrder = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
        featureOrder.forEach(key => {
            if (stats[key]) {
                const isActive = criteria[key]?.active === true;
                tableHTML += addRow(key, stats[key], isActive);
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function createVergleichKollektiveContentHTML(stats, kollektiv1Name, kollektiv2Name) {
        if (!stats || !stats.accuracyComparison || !stats.aucComparison) return '<p class="text-muted small p-3">Keine Kollektiv-Vergleichsdaten verfügbar.</p>';
        const na = '--'; const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : window.formatNumber(pVal, 3, na, true)) : na;
        const kollektiv1Display = window.getKollektivDisplayName(kollektiv1Name); const kollektiv2Display = window.getKollektivDisplayName(kollektiv2Name);
        const accAS = stats.accuracyComparison?.as; const accT2 = stats.accuracyComparison?.t2;
        const aucAS = stats.aucComparison?.as; const aucT2 = stats.aucComparison?.t2;

        const getPValueInterpretationComp = (pValue, testKey, methode) => {
             const interpretationTemplate = window.TOOLTIP_CONTENT.statMetrics[testKey]?.interpretation || 'Keine Interpretation verfügbar.';
             const pStr = (pValue !== null && !isNaN(pValue)) ? (pValue < 0.001 ? '&lt;0.001' : window.formatNumber(pValue, 3, na, true)) : na;
             const sigText = window.getStatisticalSignificanceText(pValue);
             return interpretationTemplate
                 .replace(/\[METHODE\]/g, `<strong>${methode}</strong>`)
                 .replace(/\[KOLLEKTIV1\]/g, `<strong>${kollektiv1Display}</strong>`)
                 .replace(/\[KOLLEKTIV2\]/g, `<strong>${kollektiv2Display}</strong>`)
                 .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                 .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`);
        };

        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-kollektive-${kollektiv1Name.replace(/\s+/g, '_')}-vs-${kollektiv2Name.replace(/\s+/g, '_')}"><caption>Vergleich der diagnostischen Leistung zwischen den Kollektiven ${kollektiv1Display} und ${kollektiv2Display}</caption><thead><tr><th>Vergleich</th><th>Methode</th><th>p-Wert</th><th>Test</th></tr></thead><tbody>`;
        tableHTML += `<tr><td>Accuracy</td><td>AS</td><td data-tippy-content="${getPValueInterpretationComp(accAS?.pValue, 'accComp', 'AS')}">${fP(accAS?.pValue)} ${window.getStatisticalSignificanceSymbol(accAS?.pValue)}</td><td data-tippy-content="${(window.TOOLTIP_CONTENT.statMetrics.accComp?.description || 'Vergleich Accuracy der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','AS')}">${accAS?.testName || na}</td></tr>`;
        tableHTML += `<tr><td>Accuracy</td><td>T2</td><td data-tippy-content="${getPValueInterpretationComp(accT2?.pValue, 'accComp', 'T2')}">${fP(accT2?.pValue)} ${window.getStatisticalSignificanceSymbol(accT2?.pValue)}</td><td data-tippy-content="${(window.TOOLTIP_CONTENT.statMetrics.accComp?.description || 'Vergleich Accuracy der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','T2')}">${accT2?.testName || na}</td></tr>`;
        tableHTML += `<tr><td>AUC</td><td>AS</td><td data-tippy-content="${getPValueInterpretationComp(aucAS?.pValue, 'aucComp', 'AS')}">${fP(aucAS?.pValue)} ${window.getStatisticalSignificanceSymbol(aucAS?.pValue)} (Diff: ${window.formatNumber(aucAS?.diffAUC, 3, na, true)}, Z=${window.formatNumber(aucAS?.Z, 2, na, true)})</td><td data-tippy-content="${(window.TOOLTIP_CONTENT.statMetrics.aucComp?.description || 'Vergleich AUC der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','AS')}">${aucAS?.method || na}</td></tr>`;
        tableHTML += `<tr><td>AUC</td><td>T2</td><td data-tippy-content="${getPValueInterpretationComp(aucT2?.pValue, 'aucComp', 'T2')}">${fP(aucT2?.pValue)} ${window.getStatisticalSignificanceSymbol(aucT2?.pValue)} (Diff: ${window.formatNumber(aucT2?.diffAUC, 3, na, true)}, Z=${window.formatNumber(aucT2?.Z, 2, na, true)})</td><td data-tippy-content="${(window.TOOLTIP_CONTENT.statMetrics.aucComp?.description || 'Vergleich AUC der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','T2')}">${aucT2?.method || na}</td></tr>`;
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function createCriteriaComparisonTableHTML(results, globalKollektivName) {
         if (!Array.isArray(results) || results.length === 0) return '<p class="text-muted small p-3">Keine Daten für Kriterienvergleich verfügbar.</p>';
         const tc = window.TOOLTIP_CONTENT || {}; const cc = tc.criteriaComparisonTable || {};
         const headers = [
             { key: 'set', label: cc.tableHeaderSet || "Methode / Kriteriensatz", tooltip: cc.tableHeaderSet || "Die diagnostische Methode oder der spezifische Kriteriensatz, der evaluiert wird. 'Angewandte T2 Kriterien' sind die aktuell im Auswertungstab definierten. Literatur-Kriterien werden ggf. auf ihrem spezifischen Zielkollektiv evaluiert (in Klammern angegeben)." },
             { key: 'sens', label: cc.tableHeaderSens || "Sens.", tooltip: (cc.tableHeaderSens || "Sensitivität") + ": " + window.ui_helpers.getMetricDescriptionHTML('sens', 'der Methode') },
             { key: 'spez', label: cc.tableHeaderSpez || "Spez.", tooltip: (cc.tableHeaderSpez || "Spezifität") + ": " + window.ui_helpers.getMetricDescriptionHTML('spez', 'der Methode') },
             { key: 'ppv', label: cc.tableHeaderPPV || "PPV", tooltip: (cc.tableHeaderPPV || "PPV") + ": " + window.ui_helpers.getMetricDescriptionHTML('ppv', 'der Methode') },
             { key: 'npv', label: cc.tableHeaderNPV || "NPV", tooltip: (cc.tableHeaderNPV || "NPV") + ": " + window.ui_helpers.getMetricDescriptionHTML('npv', 'der Methode') },
             { key: 'acc', label: cc.tableHeaderAcc || "Acc.", tooltip: (cc.tableHeaderAcc || "Accuracy") + ": " + window.ui_helpers.getMetricDescriptionHTML('acc', 'der Methode') },
             { key: 'auc', label: cc.tableHeaderAUC || "AUC/BalAcc", tooltip: (cc.tableHeaderAUC || "AUC/Bal. Accuracy") + ": " + window.ui_helpers.getMetricDescriptionHTML('auc', 'der Methode') }
         ];
         const tableId = "table-kriterien-vergleich";
         const displayGlobalKollektivName = window.getKollektivDisplayName(globalKollektivName);
         let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped table-hover small caption-top" id="${tableId}"><caption>Vergleich verschiedener Kriteriensätze (vs. N) für das globale Kollektiv: ${displayGlobalKollektivName}</caption><thead><tr><th>Test</th><th>Statistik</th><th>p-Wert</th><th>Methode</th></tr></thead><tbody>`;
         headers.forEach(h => {
            const tooltipAttr = h.tooltip ? `data-tippy-content="${h.tooltip}"` : '';
            tableHTML += `<th ${tooltipAttr}>${h.label}</th>`;
         });
         tableHTML += `</tr></thead><tbody>`;

         results.forEach(result => {
             const isApplied = result.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
             const isAS = result.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID;
             const isLiteratur = !isApplied && !isAS;

             let rowClass = '';
             if (isApplied) rowClass = 'table-primary';
             else if (isAS) rowClass = 'table-info';

             let nameDisplay = result.name || 'Unbekannt';
             let kollektivForInterpretation = result.specificKollektivName || globalKollektivName;
             let patientCountForInterpretation = result.specificKollektivN !== undefined ? result.specificKollektivN : result.globalN;
             const displayKollektivForInterpretation = window.getKollektivDisplayName(kollektivForInterpretation);

             if (isApplied) nameDisplay = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
             else if (isAS) nameDisplay = APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME;

             let nameSuffix = '';
             if (isLiteratur && result.specificKollektivName && result.specificKollektivName !== globalKollektivName) {
                 nameSuffix = ` <small class="text-muted fst-italic">(eval. auf ${displayKollektivForInterpretation}, N=${patientCountForInterpretation || '?'})</small>`;
             } else if ((isApplied || isAS) && patientCountForInterpretation !== undefined) {
                 nameSuffix = ` <small class="text-muted fst-italic">(N=${patientCountForInterpretation || '?'})</small>`;
             }
             const metricForTooltipAS = { value: result.sens, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} };
             const metricForTooltipSpez = { value: result.spez, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} };
             const metricForTooltipPPV = { value: result.ppv, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} };
             const metricForTooltipNPV = { value: result.npv, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} };
             const metricForTooltipAcc = { value: result.acc, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} };
             const metricForTooltipAUC = { value: result.auc, matrix_components: {total: patientCountForInterpretation} };


             const tooltipSens = window.ui_helpers.getMetricInterpretationHTML('sens', metricForTooltipAS, nameDisplay, displayKollektivForInterpretation);
             const tooltipSpez = window.ui_helpers.getMetricInterpretationHTML('spez', metricForTooltipSpez, nameDisplay, displayKollektivForInterpretation);
             const tooltipPPV = window.ui_helpers.getMetricInterpretationHTML('ppv', metricForTooltipPPV, nameDisplay, displayKollektivForInterpretation);
             const tooltipNPV = window.ui_helpers.getMetricInterpretationHTML('npv', metricForTooltipNPV, nameDisplay, displayKollektivForInterpretation);
             const tooltipAcc = window.ui_helpers.getMetricInterpretationHTML('acc', metricForTooltipAcc, nameDisplay, displayKollektivForInterpretation);
             const tooltipAUC = window.ui_helpers.getMetricInterpretationHTML('auc', metricForTooltipAUC, nameDisplay, displayKollektivForInterpretation);

             tableHTML += `<tr class="${rowClass}">
                             <td class="fw-bold">${nameDisplay}${nameSuffix}</td>
                             <td data-tippy-content="${tooltipSens}">${window.formatPercent(result.sens, 1)}</td>
                             <td data-tippy-content="${tooltipSpez}">${window.formatPercent(result.spez, 1)}</td>
                             <td data-tippy-content="${tooltipPPV}">${window.formatPercent(result.ppv, 1)}</td>
                             <td data-tippy-content="${tooltipNPV}">${window.formatPercent(result.npv, 1)}</td>
                             <td data-tippy-content="${tooltipAcc}">${window.formatPercent(result.acc, 1)}</td>
                             <td data-tippy-content="${tooltipAUC}">${window.formatNumber(result.auc, 3, '--', true)}</td>
                           </tr>`;
         });
         tableHTML += `</tbody></table></div>`;
         tableHTML += `<p class="small text-muted px-2 mt-1">Hinweis: Werte für Literatur-Kriteriensätze werden idealerweise auf deren spezifischem Zielkollektiv (falls von globalem Kollektiv abweichend, in Klammern angegeben) berechnet, um eine faire Vergleichbarkeit mit den Originalpublikationen zu gewährleisten. Avocado Sign und 'Angewandte T2 Kriterien' beziehen sich immer auf das für diese Zeile angegebene N (Patientenzahl des spezifischen Kollektivs).</p>`
         return tableHTML;
    }

    return Object.freeze({
        createDeskriptiveStatistikContentHTML,
        createGueteContentHTML,
        createVergleichContentHTML,
        createAssoziationContentHTML,
        createVergleichKollektiveContentHTML,
        createCriteriaComparisonTableHTML
    });

})();
