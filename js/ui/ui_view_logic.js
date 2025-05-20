const uiViewLogic = (() => {

    function _getMetricDescriptionHTML(key, methode = '') {
       const desc = TOOLTIP_CONTENT.statMetrics[key]?.description || key;
       return desc.replace(/\[METHODE\]/g, methode);
    }

    function _getMetricInterpretationHTML(key, metricData, methode = '', kollektivName = '') {
        const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[key]?.interpretation || 'Keine Interpretation verfügbar.';
        const data = (typeof metricData === 'object' && metricData !== null) ? metricData : { value: metricData, ci: null, method: 'N/A' };
        const na = '--';
        const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
        const isPercent = !(key === 'f1' || key === 'auc');
        const valueStr = formatNumber(data?.value, digits, na);
        const lowerStr = formatNumber(data?.ci?.lower, digits, na);
        const upperStr = formatNumber(data?.ci?.upper, digits, na);
        const ciMethodStr = data?.method || 'N/A';
        const bewertungStr = (key === 'auc') ? getAUCBewertung(data?.value) : '';

        let interpretation = interpretationTemplate
            .replace(/\[METHODE\]/g, methode)
            .replace(/\[WERT\]/g, `<strong>${valueStr}${isPercent ? '%' : ''}</strong>`)
            .replace(/\[LOWER\]/g, lowerStr)
            .replace(/\[UPPER\]/g, upperStr)
            .replace(/\[METHOD_CI\]/g, ciMethodStr)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
            .replace(/\[BEWERTUNG\]/g, `<strong>${bewertungStr}</strong>`);

        if (lowerStr === na || upperStr === na) {
             interpretation = interpretation.replace(/\(95% CI nach .*?: .*? - .*?\)/g, '(Keine CI-Daten verfügbar)');
             interpretation = interpretation.replace(/nach \[METHOD_CI\]:/g, '');
        }
         interpretation = interpretation.replace(/p=\[P_WERT\], \[SIGNIFIKANZ\]/g,'');
         interpretation = interpretation.replace(/<hr.*?>.*$/, '');

        return interpretation;
    }


    function _getTestDescriptionHTML(key, t2ShortName = 'T2') {
        const desc = TOOLTIP_CONTENT.statMetrics[key]?.description || key;
        return desc.replace(/\[T2_SHORT_NAME\]/g, t2ShortName);
    }

    function _getTestInterpretationHTML(key, testData, kollektivName = '', t2ShortName = 'T2') {
        const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[key]?.interpretation || 'Keine Interpretation verfügbar.';
         if (!testData) return 'Keine Daten für Interpretation verfügbar.';
        const na = '--';
        const pValue = testData?.pValue;
        const pStr = (pValue !== null && !isNaN(pValue)) ? (pValue < 0.001 ? '&lt;0.001' : formatNumber(pValue, 3, na)) : na;
        const sigSymbol = getStatisticalSignificanceSymbol(pValue);
        const sigText = getStatisticalSignificanceText(pValue);
         return interpretationTemplate
            .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
            .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
            .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
            .replace(/\[T2_SHORT_NAME\]/g, t2ShortName)
            .replace(/<hr.*?>.*$/, '');
    }

    function _getAssociationInterpretationHTML(key, assocObj, merkmalName, kollektivName) {
        const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[key]?.interpretation || 'Keine Interpretation verfügbar.';
        if (!assocObj) return 'Keine Daten für Interpretation verfügbar.';
        const na = '--';
        let valueStr = na, lowerStr = na, upperStr = na, ciMethodStr = na, bewertungStr = '', pStr = na, sigSymbol = '', sigText = '', pVal = NaN;
        const assozPValue = assocObj?.pValue;

        if (key === 'or') {
            valueStr = formatNumber(assocObj.or?.value, 2, na);
            lowerStr = formatNumber(assocObj.or?.ci?.lower, 2, na);
            upperStr = formatNumber(assocObj.or?.ci?.upper, 2, na);
            ciMethodStr = assocObj.or?.method || na;
            pStr = (assozPValue !== null && !isNaN(assozPValue)) ? (assozPValue < 0.001 ? '&lt;0.001' : formatNumber(assozPValue, 3, na)) : na;
            sigSymbol = getStatisticalSignificanceSymbol(assozPValue);
            sigText = getStatisticalSignificanceText(assozPValue);
        } else if (key === 'rd') {
            valueStr = formatNumber(assocObj.rd?.value !== null && !isNaN(assocObj.rd?.value) ? assocObj.rd.value * 100 : NaN, 1, na);
            lowerStr = formatNumber(assocObj.rd?.ci?.lower !== null && !isNaN(assocObj.rd?.ci?.lower) ? assocObj.rd.ci.lower * 100 : NaN, 1, na);
            upperStr = formatNumber(assocObj.rd?.ci?.upper !== null && !isNaN(assocObj.rd?.ci?.upper) ? assocObj.rd.ci.upper * 100 : NaN, 1, na);
            ciMethodStr = assocObj.rd?.method || na;
        } else if (key === 'phi') {
            valueStr = formatNumber(assocObj.phi?.value, 2, na);
            bewertungStr = getPhiBewertung(assocObj.phi?.value);
        } else if (key === 'fisher' || key === 'mannwhitney' || key === 'pvalue') {
             pVal = assocObj?.pValue;
             pStr = (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : formatNumber(pVal, 3, na)) : na;
             sigSymbol = getStatisticalSignificanceSymbol(pVal);
             sigText = getStatisticalSignificanceText(pVal);
             const specificInterpretation = TOOLTIP_CONTENT.statMetrics[key]?.interpretation;
             const templateToUse = specificInterpretation || TOOLTIP_CONTENT.statMetrics.defaultP.interpretation;
             return templateToUse
                 .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
                 .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
                 .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                 .replace(/\[MERKMAL\]/g, `'${merkmalName}'`)
                 .replace(/\[VARIABLE\]/g, `'${merkmalName}'`)
                 .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
                 .replace(/<hr.*?>.*$/, '');
        }

        let interpretation = interpretationTemplate
            .replace(/\[MERKMAL\]/g, `'${merkmalName}'`)
            .replace(/\[WERT\]/g, `<strong>${valueStr}${key === 'rd' ? '%' : ''}</strong>`)
            .replace(/\[LOWER\]/g, lowerStr)
            .replace(/\[UPPER\]/g, upperStr)
            .replace(/\[METHOD_CI\]/g, ciMethodStr)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
            .replace(/\[FAKTOR_TEXT\]/g, assocObj?.or?.value > 1 ? TOOLTIP_CONTENT.statMetrics.orFaktorTexte.ERHOEHT : (assocObj?.or?.value < 1 ? TOOLTIP_CONTENT.statMetrics.orFaktorTexte.VERRINGERT : TOOLTIP_CONTENT.statMetrics.orFaktorTexte.UNVERAENDERT))
            .replace(/\[HOEHER_NIEDRIGER\]/g, assocObj?.rd?.value > 0 ? TOOLTIP_CONTENT.statMetrics.rdRichtungTexte.HOEHER : (assocObj?.rd?.value < 0 ? TOOLTIP_CONTENT.statMetrics.rdRichtungTexte.NIEDRIGER : TOOLTIP_CONTENT.statMetrics.rdRichtungTexte.GLEICH))
            .replace(/\[STAERKE\]/g, `<strong>${bewertungStr}</strong>`)
            .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
            .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
            .replace(/<hr.*?>.*$/, '');

         if (key === 'or' || key === 'rd') {
            if (lowerStr === na || upperStr === na) {
                interpretation = interpretation.replace(/\(95% CI nach .*?: .*? - .*?\)/g, '(Keine CI-Daten verfügbar)');
                interpretation = interpretation.replace(/nach \[METHOD_CI\]:/g, '');
            }
         }
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
                 const tooltipTextSub = col.tooltipSubKeyTemplate ? col.tooltipSubKeyTemplate.replace('{SUB_KEY_LABEL}', sk.label) : `Sortieren nach ${col.label} -> ${sk.label}`;
                 return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}" data-tippy-content="${tooltipTextSub}">${sk.label}</span>`;
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

    function createDatenTableHTML(data, sortState) { // Umbenannt
        if (!Array.isArray(data)) return '<p class="text-danger">Fehler: Ungültige Patientendaten für Tabelle.</p>';

        const tableId = 'daten-table'; // Geändert
        const columns = [
            { key: 'nr', label: 'Nr', tooltip: TOOLTIP_CONTENT.datenTable.nr },
            { key: 'name', label: 'Name', tooltip: TOOLTIP_CONTENT.datenTable.name },
            { key: 'vorname', label: 'Vorname', tooltip: TOOLTIP_CONTENT.datenTable.vorname },
            { key: 'geschlecht', label: 'Geschl.', tooltip: TOOLTIP_CONTENT.datenTable.geschlecht },
            { key: 'alter', label: 'Alter', tooltip: TOOLTIP_CONTENT.datenTable.alter },
            { key: 'therapie', label: 'Therapie', tooltip: TOOLTIP_CONTENT.datenTable.therapie },
            { key: 'status', label: 'N/AS/T2', tooltip: TOOLTIP_CONTENT.datenTable.n_as_t2, subKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}], tooltipSubKeyTemplate: "Sortieren nach Status -> {SUB_KEY_LABEL}" },
            { key: 'bemerkung', label: 'Bemerkung', tooltip: TOOLTIP_CONTENT.datenTable.bemerkung },
            { key: 'details', label: '', width: '30px'}
        ];

        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
        tableHTML += createTableHeaderHTML(tableId, sortState, columns);
        tableHTML += `<tbody id="${tableId}-body">`;
        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">Keine Daten im ausgewählten Kollektiv gefunden.</td></tr>`;
        } else {
            data.forEach(patient => {
                tableHTML += tableRenderer.createPatientTableRow(patient);
            });
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

     function createAuswertungTableHTML(data, sortState, appliedCriteria, appliedLogic) {
         if (!Array.isArray(data)) return '<p class="text-danger">Fehler: Ungültige Auswertungsdaten für Tabelle.</p>';

         const tableId = 'auswertung-table';
         const columns = [
             { key: 'nr', label: 'Nr', tooltip: TOOLTIP_CONTENT.auswertungTable.nr },
             { key: 'name', label: 'Name', tooltip: TOOLTIP_CONTENT.auswertungTable.name },
             { key: 'therapie', label: 'Therapie', tooltip: TOOLTIP_CONTENT.auswertungTable.therapie },
             { key: 'status', label: 'N/AS/T2', tooltip: TOOLTIP_CONTENT.auswertungTable.n_as_t2, subKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}], tooltipSubKeyTemplate: "Sortieren nach Status -> {SUB_KEY_LABEL}"},
             { key: 'anzahl_patho_lk', label: 'N+/N ges.', tooltip: TOOLTIP_CONTENT.auswertungTable.n_counts, textAlign: 'center' },
             { key: 'anzahl_as_lk', label: 'AS+/AS ges.', tooltip: TOOLTIP_CONTENT.auswertungTable.as_counts, textAlign: 'center' },
             { key: 'anzahl_t2_lk', label: 'T2+/T2 ges.', tooltip: TOOLTIP_CONTENT.auswertungTable.t2_counts, textAlign: 'center' },
             { key: 'details', label: '', width: '30px'}
         ];

         let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
         tableHTML += createTableHeaderHTML(tableId, sortState, columns);
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

    function createAuswertungTableCardHTML(data, sortState, appliedCriteria, appliedLogic) {
        const tableHTML = createAuswertungTableHTML(data, sortState, appliedCriteria, appliedLogic);
        return `
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>Patientenübersicht & Auswertungsergebnisse</span>
                        <button id="auswertung-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.expandAll || 'Alle Details ein-/ausblenden'}">
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
        const fv = (val, dig = 1) => formatNumber(val, dig, na);
        const fP = (val, dig = 1) => formatPercent(val, dig, na);
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
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.alterMedian?.description || 'Alter'}"><td>Alter Median (Min-Max) [Mean ± SD]</td><td>${fv(d.alter?.median, 1)} (${fv(d.alter?.min, 0)} - ${fv(d.alter?.max, 0)}) [${fv(d.alter?.mean, 1)} ± ${fv(d.alter?.sd, 1)}]</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.geschlecht?.description || 'Geschlecht'}"><td>Geschlecht (m / w) (n / %)</td><td>${d.geschlecht?.m ?? 0} / ${d.geschlecht?.f ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.geschlecht?.m ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.geschlecht?.f ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.datenTable.therapie || 'Therapie'}"><td>Therapie (direkt OP / nRCT) (n / %)</td><td>${d.therapie?.['direkt OP'] ?? 0} / ${d.therapie?.nRCT ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.therapie?.['direkt OP'] ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.therapie?.nRCT ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.nStatus?.description || 'N Status'}"><td>N Status (+ / -) (n / %)</td><td>${d.nStatus?.plus ?? 0} / ${d.nStatus?.minus ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.nStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.nStatus?.minus ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.asStatus?.description || 'AS Status'}"><td>AS Status (+ / -) (n / %)</td><td>${d.asStatus?.plus ?? 0} / ${d.asStatus?.minus ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.asStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.asStatus?.minus ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.t2Status?.description || 'T2 Status'}"><td>T2 Status (+ / -) (n / %)</td><td>${d.t2Status?.plus ?? 0} / ${d.t2Status?.minus ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.t2Status?.plus ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.t2Status?.minus ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                            </tbody>
                        </table>
                    </div>
                     <div class="table-responsive">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-lk-${indexSuffix}">
                             <caption>Lymphknotenanzahlen (Median (Min-Max) [Mean ± SD])</caption>
                             <thead class="visually-hidden"><tr><th>Metrik</th><th>Wert</th></tr></thead>
                             <tbody>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlPatho?.description || 'LK N gesamt'}"><td>LK N gesamt</td><td>${fLK(d.lkAnzahlen?.n?.total)}</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlPathoPlus?.description || 'LK N+'}"><td>LK N+ <sup>*</sup></td><td>${fLK(d.lkAnzahlen?.n?.plus)}</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlAS?.description || 'LK AS gesamt'}"><td>LK AS gesamt</td><td>${fLK(d.lkAnzahlen?.as?.total)}</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlASPlus?.description || 'LK AS+'}"><td>LK AS+ <sup>**</sup></td><td>${fLK(d.lkAnzahlen?.as?.plus)}</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlT2?.description || 'LK T2 gesamt'}"><td>LK T2 gesamt</td><td>${fLK(d.lkAnzahlen?.t2?.total)}</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlT2Plus?.description || 'LK T2+'}"><td>LK T2+ <sup>***</sup></td><td>${fLK(d.lkAnzahlen?.t2?.plus)}</td></tr>
                             </tbody>
                        </table>
                     </div>
                    <p class="small text-muted mt-1 mb-0"><sup>*</sup> Nur bei N+ Patienten (n=${d.nStatus?.plus ?? 0}); <sup>**</sup> Nur bei AS+ Patienten (n=${d.asStatus?.plus ?? 0}); <sup>***</sup> Nur bei T2+ Patienten (n=${d.t2Status?.plus ?? 0}).</p>
                </div>
                <div class="col-md-6 d-flex flex-column">
                    <div class="mb-2 flex-grow-1" id="${ageChartId}" style="min-height: 150px;" data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.chartAge?.description || 'Altersverteilung'}">
                       <p class="text-muted small text-center p-3">Lade Altersverteilung...</p>
                    </div>
                    <div class="flex-grow-1" id="${genderChartId}" style="min-height: 150px;" data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.chartGender?.description || 'Geschlechterverteilung'}">
                       <p class="text-muted small text-center p-3">Lade Geschlechterverteilung...</p>
                    </div>
                </div>
            </div>`;
        return tableHTML;
    }

    function createGueteContentHTML(stats, methode, kollektivName) {
        if (!stats || !stats.matrix) return '<p class="text-muted small p-3">Keine Gütedaten verfügbar.</p>';
        const matrix = stats.matrix; const na = '--';
        const fCI_perf = (m, key) => { const digits = (key === 'f1' || key === 'auc') ? 3 : 1; const isPercent = !(key === 'f1' || key === 'auc'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, digits, isPercent, na); };
        let matrixHTML = `<h6 class="px-2 pt-2">Konfusionsmatrix (${methode} vs. N)</h6><table class="table table-sm table-bordered text-center small mx-2 mb-3" style="width: auto;" id="table-guete-matrix-${methode}-${kollektivName.replace(/\s+/g, '_')}"><thead class="small"><tr><th></th><th>N+ (Patho)</th><th>N- (Patho)</th></tr></thead><tbody><tr><td class="fw-bold">${methode}+</td><td data-tippy-content="Richtig Positiv (RP): ${methode}+ und N+">${formatNumber(matrix.rp,0,na)}</td><td data-tippy-content="Falsch Positiv (FP): ${methode}+ aber N-">${formatNumber(matrix.fp,0,na)}</td></tr><tr><td class="fw-bold">${methode}-</td><td data-tippy-content="Falsch Negativ (FN): ${methode}- aber N+">${formatNumber(matrix.fn,0,na)}</td><td data-tippy-content="Richtig Negativ (RN): ${methode}- und N-">${formatNumber(matrix.rn,0,na)}</td></tr></tbody></table>`;
        let metricsHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-guete-metrics-${methode}-${kollektivName.replace(/\s+/g, '_')}"><caption>Diagnostische Gütekriterien</caption><thead><tr><th>Metrik</th><th>Wert (95% CI)</th><th>CI Methode</th></tr></thead><tbody>
            <tr><td data-tippy-content="${_getMetricDescriptionHTML('sens', methode)}">Sensitivität</td><td data-tippy-content="${_getMetricInterpretationHTML('sens', stats.sens, methode, kollektivName)}">${fCI_perf(stats.sens, 'sens')}</td><td>${stats.sens?.method || na}</td></tr>
            <tr><td data-tippy-content="${_getMetricDescriptionHTML('spez', methode)}">Spezifität</td><td data-tippy-content="${_getMetricInterpretationHTML('spez', stats.spez, methode, kollektivName)}">${fCI_perf(stats.spez, 'spez')}</td><td>${stats.spez?.method || na}</td></tr>
            <tr><td data-tippy-content="${_getMetricDescriptionHTML('ppv', methode)}">PPV</td><td data-tippy-content="${_getMetricInterpretationHTML('ppv', stats.ppv, methode, kollektivName)}">${fCI_perf(stats.ppv, 'ppv')}</td><td>${stats.ppv?.method || na}</td></tr>
            <tr><td data-tippy-content="${_getMetricDescriptionHTML('npv', methode)}">NPV</td><td data-tippy-content="${_getMetricInterpretationHTML('npv', stats.npv, methode, kollektivName)}">${fCI_perf(stats.npv, 'npv')}</td><td>${stats.npv?.method || na}</td></tr>
            <tr><td data-tippy-content="${_getMetricDescriptionHTML('acc', methode)}">Accuracy</td><td data-tippy-content="${_getMetricInterpretationHTML('acc', stats.acc, methode, kollektivName)}">${fCI_perf(stats.acc, 'acc')}</td><td>${stats.acc?.method || na}</td></tr>
            <tr><td data-tippy-content="${_getMetricDescriptionHTML('balAcc', methode)}">Balanced Accuracy</td><td data-tippy-content="${_getMetricInterpretationHTML('balAcc', stats.balAcc, methode, kollektivName)}">${fCI_perf(stats.balAcc, 'balAcc')}</td><td>${stats.balAcc?.method || na}</td></tr>
            <tr><td data-tippy-content="${_getMetricDescriptionHTML('f1', methode)}">F1-Score</td><td data-tippy-content="${_getMetricInterpretationHTML('f1', stats.f1, methode, kollektivName)}">${fCI_perf(stats.f1, 'f1')}</td><td>${stats.f1?.method || na}</td></tr>
            <tr><td data-tippy-content="${_getMetricDescriptionHTML('auc', methode)}">AUC (Bal. Acc.)</td><td data-tippy-content="${_getMetricInterpretationHTML('auc', stats.auc, methode, kollektivName)}">${fCI_perf(stats.auc, 'auc')}</td><td>${stats.auc?.method || na}</td></tr>
        </tbody></table></div>`;
        return matrixHTML + metricsHTML;
    }

    function createVergleichContentHTML(stats, kollektivName) {
        if (!stats) return '<p class="text-muted small p-3">Keine Vergleichsdaten verfügbar.</p>';
        const na = '--'; const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '<0.001' : formatNumber(pVal, 3, na)) : na;
        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}"><thead><tr><th>Test</th><th>Statistik</th><th>p-Wert</th><th>Methode</th></tr></thead><tbody>
            <tr><td data-tippy-content="${_getTestDescriptionHTML('mcnemar')}">McNemar (Accuracy)</td><td>${formatNumber(stats.mcnemar?.statistic, 3, na)} (df=${stats.mcnemar?.df || na})</td><td data-tippy-content="${_getTestInterpretationHTML('mcnemar', stats.mcnemar, kollektivName)}">${fP(stats.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(stats.mcnemar?.pValue)}</td><td>${stats.mcnemar?.method || na}</td></tr>
            <tr><td data-tippy-content="${_getTestDescriptionHTML('delong')}">DeLong (AUC)</td><td>Z=${formatNumber(stats.delong?.Z, 3, na)}</td><td data-tippy-content="${_getTestInterpretationHTML('delong', stats.delong, kollektivName)}">${fP(stats.delong?.pValue)} ${getStatisticalSignificanceSymbol(stats.delong?.pValue)}</td><td>${stats.delong?.method || na}</td></tr>
        </tbody></table></div>`;
        return tableHTML;
    }

    function createAssoziationContentHTML(stats, kollektivName, criteria) {
        if (!stats || Object.keys(stats).length === 0) return '<p class="text-muted small p-3">Keine Assoziationsdaten verfügbar.</p>';
        const na = '--'; const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '<0.001' : formatNumber(pVal, 3, na)) : na;
        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-assoziation-${kollektivName.replace(/\s+/g, '_')}"><caption>Assoziation zwischen Merkmalen und N-Status (+/-)</caption><thead><tr><th>Merkmal</th><th>OR (95% CI)</th><th>RD (%) (95% CI)</th><th>Phi (φ)</th><th>p-Wert</th><th>Test</th></tr></thead><tbody>`;

        const getPValueInterpretationAssoc = (key, assocObj) => {
             const testName = assocObj?.testName || '';
             const pTooltipKey = testName.includes("Fisher") ? 'fisher' : (testName.includes("Mann-Whitney") ? 'mannwhitney' : 'defaultP');
             const merkmalName = assocObj?.featureName || key;
             return _getTestInterpretationHTML(pTooltipKey, assocObj, kollektivName).replace(/\[MERKMAL\]/g, `'${merkmalName}'`).replace(/\[VARIABLE\]/g, `'${merkmalName}'`);
        };
        const getTestDescriptionAssoc = (assocObj) => {
             const testName = assocObj?.testName || '';
             const pTooltipKey = testName.includes("Fisher") ? 'fisher' : (testName.includes("Mann-Whitney") ? 'mannwhitney' : 'defaultP');
             const merkmalName = assocObj?.featureName || '';
             return (TOOLTIP_CONTENT.statMetrics[pTooltipKey]?.description || '').replace('[MERKMAL]', merkmalName).replace('[VARIABLE]', merkmalName);
        };
        const getMerkmalDescriptionHTMLAssoc = (key, assocObj) => {
             const baseName = TOOLTIP_CONTENT.statMetrics[key]?.name || assocObj?.featureName || key;
             return `Merkmal: ${baseName}`;
        };

        const addRow = (key, assocObj, isActive = true) => {
            if (!assocObj) return '';
            const merkmalName = assocObj.featureName || key;
            const orStr = formatCI(assocObj.or?.value, assocObj.or?.ci?.lower, assocObj.or?.ci?.upper, 2, false, na);
            const rdValPerc = formatNumber(assocObj.rd?.value !== null && !isNaN(assocObj.rd?.value) ? assocObj.rd.value * 100 : NaN, 1, na);
            const rdCILowerPerc = formatNumber(assocObj.rd?.ci?.lower !== null && !isNaN(assocObj.rd?.ci?.lower) ? assocObj.rd.ci.lower * 100 : NaN, 1, na);
            const rdCIUpperPerc = formatNumber(assocObj.rd?.ci?.upper !== null && !isNaN(assocObj.rd?.ci?.upper) ? assocObj.rd.ci.upper * 100 : NaN, 1, na);
            const rdStr = `${rdValPerc} (${rdCILowerPerc} - ${rdCIUpperPerc})`;
            const phiStr = formatNumber(assocObj.phi?.value, 2, na);
            const pStr = fP(assocObj.pValue);
            const sigSymbol = getStatisticalSignificanceSymbol(assocObj.pValue);
            const testName = assocObj.testName || na;
            const aktivText = isActive ? '' : ' <small class="text-muted">(inaktiv)</small>';

            return `<tr>
                <td data-tippy-content="${getMerkmalDescriptionHTMLAssoc(key, assocObj)}">${merkmalName}${aktivText}</td>
                <td data-tippy-content="${_getAssociationInterpretationHTML('or', assocObj, merkmalName, kollektivName)}">${orStr}</td>
                <td data-tippy-content="${_getAssociationInterpretationHTML('rd', assocObj, merkmalName, kollektivName)}">${rdStr}</td>
                <td data-tippy-content="${_getAssociationInterpretationHTML('phi', assocObj, merkmalName, kollektivName)}">${phiStr}</td>
                <td data-tippy-content="${getPValueInterpretationAssoc(key, assocObj)}">${pStr} ${sigSymbol}</td>
                <td data-tippy-content="${getTestDescriptionAssoc(assocObj)}">${testName}</td>
            </tr>`;
        };

        if (stats.as) tableHTML += addRow('as', stats.as);
        if (stats.size_mwu && stats.size_mwu.testName && !stats.size_mwu.testName.includes("Invalid") && !stats.size_mwu.testName.includes("Nicht genug")) {
            const mwuObj = stats.size_mwu;
            const pStr = fP(mwuObj.pValue);
            const sigSymbol = getStatisticalSignificanceSymbol(mwuObj.pValue);
            const pTooltip = getPValueInterpretationAssoc('size_mwu', mwuObj);
            const descTooltip = "Vergleich der medianen Lymphknotengröße zwischen N+ und N-.";
            const testDescTooltip = getTestDescriptionAssoc(mwuObj);
            tableHTML += `<tr>
                <td data-tippy-content="${descTooltip}">LK Größe (Median Vgl.)</td>
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
        const na = '--'; const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '<0.001' : formatNumber(pVal, 3, na)) : na; const kollektiv1Display = getKollektivDisplayName(kollektiv1Name); const kollektiv2Display = getKollektivDisplayName(kollektiv2Name);
        const accAS = stats.accuracyComparison?.as; const accT2 = stats.accuracyComparison?.t2; const aucAS = stats.aucComparison?.as; const aucT2 = stats.aucComparison?.t2;
        const getPValueInterpretationComp = (pValue, testKey, methode) => {
             const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[testKey]?.interpretation || 'Keine Interpretation verfügbar.';
             const pStr = (pValue !== null && !isNaN(pValue)) ? (pValue < 0.001 ? '&lt;0.001' : formatNumber(pValue, 3, na)) : na;
             const sigText = getStatisticalSignificanceText(pValue);
             return interpretationTemplate
                 .replace(/\[METHODE\]/g, methode)
                 .replace(/\[KOLLEKTIV1\]/g, `<strong>${kollektiv1Display}</strong>`)
                 .replace(/\[KOLLEKTIV2\]/g, `<strong>${kollektiv2Display}</strong>`)
                 .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                 .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`);
        };
        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-kollektive-${kollektiv1Name.replace(/\s+/g, '_')}-vs-${kollektiv2Name.replace(/\s+/g, '_')}"><thead><tr><th>Vergleich</th><th>Methode</th><th>p-Wert</th><th>Test</th></tr></thead><tbody>`;
        tableHTML += `<tr><td>Accuracy</td><td>AS</td><td data-tippy-content="${getPValueInterpretationComp(accAS?.pValue, 'accComp', 'AS')}">${fP(accAS?.pValue)} ${getStatisticalSignificanceSymbol(accAS?.pValue)}</td><td data-tippy-content="${TOOLTIP_CONTENT.statMetrics.accComp?.description.replace('[METHODE]','AS')}">${accAS?.testName || na}</td></tr>`;
        tableHTML += `<tr><td>Accuracy</td><td>T2</td><td data-tippy-content="${getPValueInterpretationComp(accT2?.pValue, 'accComp', 'T2')}">${fP(accT2?.pValue)} ${getStatisticalSignificanceSymbol(accT2?.pValue)}</td><td data-tippy-content="${TOOLTIP_CONTENT.statMetrics.accComp?.description.replace('[METHODE]','T2')}">${accT2?.testName || na}</td></tr>`;
        tableHTML += `<tr><td>AUC</td><td>AS</td><td data-tippy-content="${getPValueInterpretationComp(aucAS?.pValue, 'aucComp', 'AS')}">${fP(aucAS?.pValue)} ${getStatisticalSignificanceSymbol(aucAS?.pValue)} (Diff: ${formatNumber(aucAS?.diffAUC, 3, na)}, Z=${formatNumber(aucAS?.Z, 2, na)})</td><td data-tippy-content="${TOOLTIP_CONTENT.statMetrics.aucComp?.description.replace('[METHODE]','AS')}">${aucAS?.method || na}</td></tr>`;
        tableHTML += `<tr><td>AUC</td><td>T2</td><td data-tippy-content="${getPValueInterpretationComp(aucT2?.pValue, 'aucComp', 'T2')}">${fP(aucT2?.pValue)} ${getStatisticalSignificanceSymbol(aucT2?.pValue)} (Diff: ${formatNumber(aucT2?.diffAUC, 3, na)}, Z=${formatNumber(aucT2?.Z, 2, na)})</td><td data-tippy-content="${TOOLTIP_CONTENT.statMetrics.aucComp?.description.replace('[METHODE]','T2')}">${aucT2?.method || na}</td></tr>`;
        tableHTML += `</tbody></table></div>`; return tableHTML;
    }

    function createCriteriaComparisonTableHTML(results, kollektivName) {
         if (!Array.isArray(results) || results.length === 0) return '<p class="text-muted small p-3">Keine Daten für Kriterienvergleich verfügbar.</p>';
         const tc = TOOLTIP_CONTENT || {}; const cc = tc.criteriaComparisonTable || {};
         const headers = [
             { key: 'set', label: cc.tableHeaderSet || "Methode / Kriteriensatz", tooltip: null },
             { key: 'sens', label: cc.tableHeaderSens || "Sens.", tooltip: cc.tableHeaderSens },
             { key: 'spez', label: cc.tableHeaderSpez || "Spez.", tooltip: cc.tableHeaderSpez },
             { key: 'ppv', label: cc.tableHeaderPPV || "PPV", tooltip: cc.tableHeaderPPV },
             { key: 'npv', label: cc.tableHeaderNPV || "NPV", tooltip: cc.tableHeaderNPV },
             { key: 'acc', label: cc.tableHeaderAcc || "Acc.", tooltip: cc.tableHeaderAcc },
             { key: 'auc', label: cc.tableHeaderAUC || "AUC/BalAcc", tooltip: cc.tableHeaderAUC }
         ];
         const tableId = "table-kriterien-vergleich";
         let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped table-hover small caption-top" id="${tableId}"><caption>Vergleich verschiedener Kriteriensätze (vs. N) für Kollektiv: ${kollektivName}</caption><thead class="small"><tr>`;
         headers.forEach(h => {
            const tooltipAttr = h.tooltip ? `data-tippy-content="${h.tooltip}"` : '';
            tableHTML += `<th ${tooltipAttr}>${h.label}</th>`;
         });
         tableHTML += `</tr></thead><tbody>`;
         results.forEach(result => {
             const isApplied = result.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID; const isAS = result.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID; const rowClass = isApplied ? 'table-primary' : (isAS ? 'table-info' : ''); let nameDisplay = result.name || 'Unbekannt'; if (isApplied) nameDisplay = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME; else if (isAS) nameDisplay = APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME;
             const tooltipSens = _getMetricInterpretationHTML('sens', { value: result.sens }, nameDisplay, kollektivName);
             const tooltipSpez = _getMetricInterpretationHTML('spez', { value: result.spez }, nameDisplay, kollektivName);
             const tooltipPPV = _getMetricInterpretationHTML('ppv', { value: result.ppv }, nameDisplay, kollektivName);
             const tooltipNPV = _getMetricInterpretationHTML('npv', { value: result.npv }, nameDisplay, kollektivName);
             const tooltipAcc = _getMetricInterpretationHTML('acc', { value: result.acc }, nameDisplay, kollektivName);
             const tooltipAUC = _getMetricInterpretationHTML('auc', { value: result.auc }, nameDisplay, kollektivName);

             tableHTML += `<tr class="${rowClass}"><td class="fw-bold">${nameDisplay}</td><td data-tippy-content="${tooltipSens}">${formatPercent(result.sens, 1)}</td><td data-tippy-content="${tooltipSpez}">${formatPercent(result.spez, 1)}</td><td data-tippy-content="${tooltipPPV}">${formatPercent(result.ppv, 1)}</td><td data-tippy-content="${tooltipNPV}">${formatPercent(result.npv, 1)}</td><td data-tippy-content="${tooltipAcc}">${formatPercent(result.acc, 1)}</td><td data-tippy-content="${tooltipAUC}">${formatNumber(result.auc, 3)}</td></tr>`;
         });
         tableHTML += `</tbody></table></div>`; return tableHTML;
    }


    function _createPresentationView_ASPUR_HTML(presentationData) {
        const { statsGesamt, statsDirektOP, statsNRCT, kollektiv, statsCurrentKollektiv, patientCount } = presentationData || {}; const kollektives = ['Gesamt', 'direkt OP', 'nRCT']; const statsMap = { 'Gesamt': statsGesamt, 'direkt OP': statsDirektOP, 'nRCT': statsNRCT }; const currentKollektivName = getKollektivDisplayName(kollektiv);
        const hasDataForCurrent = !!(statsCurrentKollektiv && statsCurrentKollektiv.matrix && statsCurrentKollektiv.matrix.rp !== undefined && (statsCurrentKollektiv.matrix.rp + statsCurrentKollektiv.matrix.fp + statsCurrentKollektiv.matrix.fn + statsCurrentKollektiv.matrix.rn) > 0);
        const createPerfTableRow = (stats, kollektivKey) => { const kollektivDisplayName = getKollektivDisplayName(kollektivKey); const na = '--'; const fCI_p = (m, k) => { const d = (k === 'auc'||k==='f1') ? 3 : 1; const p = !(k === 'auc'||k==='f1'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, na); }; const getInterpretationTT = (mk, st) => { return _getMetricInterpretationHTML(mk, st, 'AS', kollektivDisplayName); }; if (!stats || typeof stats.matrix !== 'object') return `<tr><td class="fw-bold" data-tippy-content="${TOOLTIP_CONTENT.praesentation.asPurPerfTable?.kollektiv || 'Kollektiv'}">${kollektivDisplayName} (N=?)</td><td colspan="6" class="text-muted text-center">Daten fehlen</td></tr>`; const count = stats.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : 0; return `<tr><td class="fw-bold" data-tippy-content="${TOOLTIP_CONTENT.praesentation.asPurPerfTable?.kollektiv || 'Kollektiv'}">${kollektivDisplayName} (N=${count})</td><td data-tippy-content="${getInterpretationTT('sens', stats)}">${fCI_p(stats.sens, 'sens')}</td><td data-tippy-content="${getInterpretationTT('spez', stats)}">${fCI_p(stats.spez, 'spez')}</td><td data-tippy-content="${getInterpretationTT('ppv', stats)}">${fCI_p(stats.ppv, 'ppv')}</td><td data-tippy-content="${getInterpretationTT('npv', stats)}">${fCI_p(stats.npv, 'npv')}</td><td data-tippy-content="${getInterpretationTT('acc', stats)}">${fCI_p(stats.acc, 'acc')}</td><td data-tippy-content="${getInterpretationTT('auc', stats)}">${fCI_p(stats.auc, 'auc')}</td></tr>`; };
        const perfCSVTooltip = TOOLTIP_CONTENT.praesentation.downloadPerformanceCSV?.description || "CSV"; const perfMDTooltip = TOOLTIP_CONTENT.praesentation.downloadPerformanceMD?.description || "MD"; const tablePNGTooltip = TOOLTIP_CONTENT.praesentation.downloadTablePNG?.description || "Tabelle als PNG"; const perfChartPNGTooltip = `Chart (${currentKollektivName}) PNG`; const perfChartSVGTooltip = `Chart (${currentKollektivName}) SVG`; const chartId = "praes-as-pur-perf-chart"; const tableId = "praes-as-pur-perf-table"; const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image':'fa-download'; const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code':'fa-download';
        const tooltipKeys = ['kollektiv', 'sens', 'spez', 'ppv', 'npv', 'acc', 'auc'];
        let tableHTML = `<div class="col-12"><div class="card h-100"><div class="card-header d-flex justify-content-between align-items-center"><span>AS Performance vs. N für alle Kollektive</span><button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="dl-${tableId}-png" data-table-id="${tableId}" data-table-name="Praes_AS_Perf" data-tippy-content="${tablePNGTooltip}"><i class="fas fa-image"></i></button></div><div class="card-body p-0"><div class="table-responsive"><table class="table table-striped table-hover table-sm small mb-0" id="${tableId}"><thead class="small"><tr>${tooltipKeys.map((key, index) => `<th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asPurPerfTable?.[key] || _getMetricDescriptionHTML(key, 'AS') || ''}">${index === 0 ? 'Kollektiv' : (key.charAt(0).toUpperCase() + key.slice(1) + '. (95% CI)')}</th>`).join('')}</tr></thead><tbody>${kollektives.map(k => createPerfTableRow(statsMap[k], k)).join('')}</tbody></table></div></div><div class="card-footer text-end p-1"><button class="btn btn-sm btn-outline-secondary me-1" id="download-performance-as-pur-csv" data-tippy-content="${perfCSVTooltip}"><i class="fas fa-file-csv me-1"></i>CSV</button><button class="btn btn-sm btn-outline-secondary" id="download-performance-as-pur-md" data-tippy-content="${perfMDTooltip}"><i class="fab fa-markdown me-1"></i>MD</button></div></div></div>`;
        let chartHTML = `<div class="col-lg-8 offset-lg-2"><div class="card"><div class="card-header d-flex justify-content-between align-items-center"><span>Visualisierung Güte (AS vs. N) - Kollektiv: ${currentKollektivName}</span><span class="card-header-buttons"><button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="dl-${chartId}-png" data-chart-id="${chartId}" data-format="png" data-tippy-content="${perfChartPNGTooltip}"><i class="fas ${dlIconPNG}"></i></button><button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="dl-${chartId}-svg" data-chart-id="${chartId}" data-format="svg" data-tippy-content="${perfChartSVGTooltip}"><i class="fas ${dlIconSVG}"></i></button></span></div><div class="card-body p-1"><div id="${chartId}" class="praes-chart-container border rounded" style="min-height: 280px;" data-tippy-content="Balkendiagramm der Gütekriterien für AS vs. N für Kollektiv ${currentKollektivName}.">${hasDataForCurrent ? '' : `<p class="text-center text-muted p-3">Keine Daten für Chart (${currentKollektivName}).</p>`}</div></div></div></div>`;
        return `<div class="row g-3"><div class="col-12"><h3 class="text-center mb-3">Diagnostische Güte - Avocado Sign</h3></div>${tableHTML}${chartHTML}</div>`;
    }

    function _createPresentationView_ASvsT2_HTML(presentationData, selectedStudyId = null, currentKollektiv = 'Gesamt') {
        const { statsAS, statsT2, vergleich, comparisonCriteriaSet, kollektiv, patientCount, t2CriteriaLabelShort, t2CriteriaLabelFull } = presentationData || {};
        const kollektivName = getKollektivDisplayName(kollektiv);
        const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
        const appliedName = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME || "Eingestellte Kriterien";
        const t2ShortNameEffective = t2CriteriaLabelShort || 'T2';

        let comparisonBasisName = "N/A";
        let comparisonInfoHTML = '<p class="text-muted small">Bitte wählen Sie eine Vergleichsbasis.</p>';

        if (selectedStudyId && comparisonCriteriaSet) {
            const studyInfo = comparisonCriteriaSet.studyInfo;
            comparisonBasisName = comparisonCriteriaSet.displayShortName || comparisonCriteriaSet.name || (isApplied ? appliedName : selectedStudyId);
            let criteriaHTML = '<span class="text-muted">Keine Kriteriendetails.</span>';
            let detailsSrc = studyInfo?.criteriaDetails;
            if (!detailsSrc && isApplied && presentationData?.comparisonCriteriaSet?.criteria) {
                 detailsSrc = { logic: presentationData.comparisonCriteriaSet.logic, rules: Object.keys(presentationData.comparisonCriteriaSet.criteria).filter(k=>k!=='logic').map(k=>({...presentationData.comparisonCriteriaSet.criteria[k], key:k})) };
            }

            if (detailsSrc) {
                 if (detailsSrc.logic === 'KOMBINIERT' && studyInfo?.keyCriteriaSummary) { criteriaHTML = `<strong>Logik:</strong> KOMBINIERT<br><strong>Regel:</strong> ${studyInfo.keyCriteriaSummary}`; }
                 else if ((detailsSrc.logic === 'UND' || detailsSrc.logic === 'ODER') && Array.isArray(detailsSrc.rules)) { const active = detailsSrc.rules.filter(r => r.active); if (active.length > 0) { const ruleStrings = active.map(r => { if (r.key === 'size') return `Größe ${r.condition || '>='} ${formatNumber(r.threshold, 1, '?')}mm`; const keyName = r.key.charAt(0).toUpperCase() + r.key.slice(1); return `${keyName} = ${r.value || '?'}`; }); const sep = detailsSrc.logic === 'UND' ? ' UND ' : ' ODER '; criteriaHTML = `<strong>Logik:</strong> ${detailsSrc.logic}<br><strong>Regel(n):</strong> ${ruleStrings.join(sep)}`; } else { criteriaHTML = `<strong>Logik:</strong> ${detailsSrc.logic}<br><strong>Regel(n):</strong> Keine aktiven Kriterien`; } }
            } else if (studyInfo?.keyCriteriaSummary) { criteriaHTML = `<strong>Regel:</strong> ${studyInfo.keyCriteriaSummary}`; }

            comparisonInfoHTML = `<dl class="row small mb-0">
                                    <dt class="col-sm-5" data-tippy-content="${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.reference}">Referenz:</dt><dd class="col-sm-7">${studyInfo?.reference || (isApplied ? 'Benutzerdefiniert' : 'N/A')}</dd>
                                    <dt class="col-sm-5" data-tippy-content="${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.patientCohort}">Orig.-Kohorte:</dt><dd class="col-sm-7">${studyInfo?.patientCohort || 'N/A'}</dd>
                                    <dt class="col-sm-5" data-tippy-content="Untersuchungstyp der Originalstudie (Baseline oder Restaging)">Untersuchung:</dt><dd class="col-sm-7">${studyInfo?.investigationType || 'N/A'}</dd>
                                    <dt class="col-sm-5" data-tippy-content="${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.focus}">Studienfokus:</dt><dd class="col-sm-7">${studyInfo?.focus || 'N/A'}</dd>
                                    <dt class="col-sm-5" data-tippy-content="${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.keyCriteriaSummary}">Kriterien:</dt><dd class="col-sm-7">${criteriaHTML}</dd>
                                </dl>`;
        }

        const studySets = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.getAllStudyCriteriaSets() : [];
        const appliedOptionHTML = `<option value="${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID}" ${isApplied ? 'selected' : ''}>-- ${appliedName} --</option>`;
        const studyOptionsHTML = studySets.map(set => `<option value="${set.id}" ${selectedStudyId === set.id ? 'selected' : ''}>${set.name || set.id}</option>`).join('');

        let resultsHTML = '';
        const canDisplayResults = !!(selectedStudyId && presentationData && statsAS && statsT2 && vergleich && comparisonCriteriaSet && patientCount > 0);
        const na = '--';
        const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image':'fa-download';
        const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code':'fa-download';

        if (canDisplayResults) {
            const fPVal = (r,d=3) => { const p = r?.pValue; return (p !== null && !isNaN(p)) ? (p < 0.001 ? '&lt;0.001' : formatNumber(p, d, na)) : na; };
            const perfCSV = TOOLTIP_CONTENT.praesentation.downloadPerformanceCSV?.description || "CSV"; const perfMD = TOOLTIP_CONTENT.praesentation.downloadPerformanceMD?.description || "MD"; const testsMD = TOOLTIP_CONTENT.praesentation.downloadCompTestsMD?.description || "Tests MD"; const chartPNG = TOOLTIP_CONTENT.praesentation.downloadCompChartPNG?.description || "Chart PNG"; const chartSVG = TOOLTIP_CONTENT.praesentation.downloadCompChartSVG?.description || "Chart SVG"; const tablePNG = TOOLTIP_CONTENT.praesentation.downloadTablePNG?.description || "Tabelle als PNG";
            const compTablePNG = TOOLTIP_CONTENT.praesentation.downloadCompTablePNG?.description || "Vergleichstabelle PNG";
            const compTitle = `Stat. Vergleich (AS vs. ${t2ShortNameEffective})`; const perfTitle = `Vergleich Metriken (AS vs. ${t2ShortNameEffective})`; const chartTitle = `Vergleichs-Chart (AS vs. ${t2ShortNameEffective})`;
            const perfTableId = "praes-as-vs-t2-comp-table"; const testTableId = "praes-as-vs-t2-test-table"; const infoCardId = "praes-t2-basis-info-card"; const chartContainerId = "praes-comp-chart-container";

            let comparisonTableHTML = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0" id="${perfTableId}"><thead class="small"><tr><th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asVsT2PerfTable?.metric || 'Metrik'}">Metrik</th><th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asVsT2PerfTable?.asValue || 'AS Wert'}">AS (Wert, 95% CI)</th><th data-tippy-content="${(TOOLTIP_CONTENT.praesentation.asVsT2PerfTable?.t2Value || 'T2 Wert').replace('[T2_SHORT_NAME]', t2ShortNameEffective)}">${t2ShortNameEffective} (Wert, 95% CI)</th></tr></thead><tbody>`;
            const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
            const metricNames = { sens: 'Sensitivität', spez: 'Spezifität', ppv: 'PPV', npv: 'NPV', acc: 'Accuracy', balAcc: 'Bal. Accuracy', f1: 'F1-Score', auc: 'AUC' };
            metrics.forEach(key => {
                 const isRate = !(key === 'f1' || key === 'auc'); const digits = isRate ? 1 : 3;
                 const valAS = formatCI(statsAS[key]?.value, statsAS[key]?.ci?.lower, statsAS[key]?.ci?.upper, digits, isRate, na);
                 const valT2 = formatCI(statsT2[key]?.value, statsT2[key]?.ci?.lower, statsT2[key]?.ci?.upper, digits, isRate, na);
                 const tooltipDesc = _getMetricDescriptionHTML(key, 'Wert');
                 const tooltipAS = _getMetricInterpretationHTML(key, statsAS[key], 'AS', kollektivName);
                 const tooltipT2 = _getMetricInterpretationHTML(key, statsT2[key], t2ShortNameEffective, kollektivName);
                 comparisonTableHTML += `<tr><td data-tippy-content="${tooltipDesc}">${metricNames[key]}</td><td data-tippy-content="${tooltipAS}">${valAS}</td><td data-tippy-content="${tooltipT2}">${valT2}</td></tr>`;
            });
            comparisonTableHTML += `</tbody></table></div>`;
            const compTableDownloadBtns = [ {id: `dl-${perfTableId}-png`, icon: 'fa-image', tooltip: compTablePNG, format: 'png', tableId: perfTableId, tableName: `Praes_ASvsT2_Metrics_${selectedStudyId || 'none'}`} ];
            const comparisonTableCardHTML = uiComponents.createStatistikCard(perfTableId+'_card', perfTitle, comparisonTableHTML, false, 'praesentation.comparisonTableCard', compTableDownloadBtns, perfTableId);

            let testsTableHTML = `<table class="table table-sm table-striped small mb-0" id="${testTableId}"><thead class="small visually-hidden"><tr><th>Test</th><th>Statistik</th><th>p-Wert</th><th>Methode</th></tr></thead><tbody>`;
            const mcNemarDesc = _getTestDescriptionHTML('mcnemar', t2ShortNameEffective);
            const mcNemarInterp = _getTestInterpretationHTML('mcnemar', vergleich?.mcnemar, kollektivName, t2ShortNameEffective);
            const delongDesc = _getTestDescriptionHTML('delong', t2ShortNameEffective);
            const delongInterp = _getTestInterpretationHTML('delong', vergleich?.delong, kollektivName, t2ShortNameEffective);
            testsTableHTML += `<tr><td data-tippy-content="${mcNemarDesc}">McNemar (Acc)</td><td>${formatNumber(vergleich?.mcnemar?.statistic, 3, '--')} (df=${vergleich?.mcnemar?.df || '--'})</td><td data-tippy-content="${mcNemarInterp}"> ${fPVal(vergleich?.mcnemar)} ${getStatisticalSignificanceSymbol(vergleich?.mcnemar?.pValue)}</td><td class="text-muted">${vergleich?.mcnemar?.method || '--'}</td></tr>`;
            testsTableHTML += `<tr><td data-tippy-content="${delongDesc}">DeLong (AUC)</td><td>Z=${formatNumber(vergleich?.delong?.Z, 3, '--')}</td><td data-tippy-content="${delongInterp}"> ${fPVal(vergleich?.delong)} ${getStatisticalSignificanceSymbol(vergleich?.delong?.pValue)}</td><td class="text-muted">${vergleich?.delong?.method || '--'}</td></tr>`;
            testsTableHTML += `</tbody></table>`;
            const testTableDownloadBtns = [ {id: `dl-${testTableId}-png`, icon: 'fa-image', tooltip: tablePNG, format: 'png', tableId: testTableId, tableName: `Praes_ASvsT2_Tests_${selectedStudyId || 'none'}`} ];
            const testsCardHTML = uiComponents.createStatistikCard(testTableId+'_card', compTitle, testsTableHTML, false, null, testTableDownloadBtns, testTableId);

            resultsHTML = `
                <div class="row g-3 presentation-comparison-row">
                     <div class="col-lg-7 col-xl-7 presentation-comparison-col-left">
                        <div class="card h-100">
                             <div class="card-header d-flex justify-content-between align-items-center">
                                 <span>${chartTitle}</span>
                                 <span class="card-header-buttons">
                                     <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="download-chart-as-vs-t2-png" data-chart-id="${chartContainerId}" data-format="png" data-tippy-content="${chartPNG}"><i class="fas ${dlIconPNG}"></i></button>
                                     <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="download-chart-as-vs-t2-svg" data-chart-id="${chartContainerId}" data-format="svg" data-tippy-content="${chartSVG}"><i class="fas ${dlIconSVG}"></i></button>
                                 </span>
                             </div>
                            <div class="card-body p-1 d-flex align-items-center justify-content-center">
                                 <div id="${chartContainerId}" class="praes-chart-container w-100" style="min-height: 300px;" data-tippy-content="Balkendiagramm: Vergleich der Gütekriterien (AS vs. ${t2ShortNameEffective}).">
                                     <p class="text-muted small text-center p-3">Lade Vergleichschart...</p>
                                 </div>
                            </div>
                             <div class="card-footer text-end p-1">
                                <button class="btn btn-sm btn-outline-secondary me-1" id="download-performance-as-vs-t2-csv" data-tippy-content="${perfCSV}"><i class="fas fa-file-csv me-1"></i>Tabelle (CSV)</button>
                                <button class="btn btn-sm btn-outline-secondary" id="download-performance-as-vs-t2-md" data-tippy-content="${perfMD}"><i class="fab fa-markdown me-1"></i>Tabelle (MD)</button>
                           </div>
                        </div>
                    </div>
                    <div class="col-lg-5 col-xl-5 presentation-comparison-col-right d-flex flex-column">
                         <div class="card mb-3 flex-shrink-0 praes-t2-basis-info-card" id="${infoCardId}" data-tippy-content="${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.description}">
                            <div class="card-header card-header-sm">${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.title}</div>
                            <div class="card-body p-2">${comparisonInfoHTML}</div>
                         </div>
                         <div class="card mb-3 flex-grow-0">
                             ${comparisonTableCardHTML}
                         </div>
                         <div class="card flex-grow-1">
                              ${testsCardHTML}
                             <div class="card-footer text-end p-1">
                                <button class="btn btn-sm btn-outline-secondary" id="download-tests-as-vs-t2-md" data-tippy-content="${testsMD}"><i class="fab fa-markdown me-1"></i>Tests (MD)</button>
                            </div>
                         </div>
                    </div>
                </div>`;
        } else if (selectedStudyId && presentationData && patientCount === 0) {
            resultsHTML = `<div class="alert alert-warning">Keine Patientendaten für Kollektiv (${kollektivName}) für Vergleich vorhanden.</div>`;
        } else if (selectedStudyId && !comparisonCriteriaSet) {
            resultsHTML = `<div class="alert alert-danger">Fehler: Vergleichs-Kriterien (ID: ${selectedStudyId}) nicht gefunden.</div>`;
        } else {
            resultsHTML = `<div class="alert alert-info">Bitte wählen Sie oben eine Vergleichsbasis für Kollektiv '${kollektivName}'.</div>`;
        }

        return `<div class="row mb-4"><div class="col-12"><h4 class="text-center mb-1">Vergleich: Avocado Sign vs. T2-Kriterien</h4><p class="text-center text-muted small mb-3">Aktuelles Kollektiv: <strong>${kollektivName}</strong> (N=${patientCount ?? '?'})</p><div class="row justify-content-center"><div class="col-md-9 col-lg-7" id="praes-study-select-container"><div class="input-group input-group-sm"><label class="input-group-text" for="praes-study-select">T2-Vergleichsbasis:</label><select class="form-select" id="praes-study-select" data-tippy-content="${TOOLTIP_CONTENT.praesentation.studySelect.description}"><option value="" ${!selectedStudyId ? 'selected' : ''} disabled>-- Bitte wählen --</option>${appliedOptionHTML}<option value="" disabled>--- Publizierte Kriterien ---</option>${studyOptionsHTML}</select></div><div id="praes-study-description" class="mt-2 small text-muted">${comparisonBasisName === 'N/A' ? 'Keine Basis gewählt' : `Aktuelle T2 Basis: <strong>${comparisonBasisName}</strong>`}</div></div></div></div></div><div id="praesentation-as-vs-t2-results">${resultsHTML}</div>`;
    }

    function createPresentationTabContent(view, presentationData, selectedStudyId = null, currentKollektiv = 'Gesamt') {
        let viewSelectorHTML = `<div class="row mb-4"><div class="col-12 d-flex justify-content-center"><div class="btn-group btn-group-sm" role="group" aria-label="Präsentationsansicht Auswahl" data-tippy-content="${TOOLTIP_CONTENT.praesentation.viewSelect.description}"><input type="radio" class="btn-check" name="praesentationAnsicht" id="ansicht-as-pur" autocomplete="off" value="as-pur" ${view === 'as-pur' ? 'checked' : ''}><label class="btn btn-outline-primary praes-view-btn" for="ansicht-as-pur"><i class="fas fa-star me-1"></i> Avocado Sign (Daten)</label><input type="radio" class="btn-check" name="praesentationAnsicht" id="ansicht-as-vs-t2" value="as-vs-t2" autocomplete="off" ${view === 'as-vs-t2' ? 'checked' : ''}><label class="btn btn-outline-primary praes-view-btn" for="ansicht-as-vs-t2"><i class="fas fa-exchange-alt me-1"></i> AS vs. T2 (Vergleich)</label></div></div></div>`;
        let contentHTML = '';
        if (view === 'as-pur') {
            contentHTML = _createPresentationView_ASPUR_HTML(presentationData);
        } else if (view === 'as-vs-t2') {
            contentHTML = _createPresentationView_ASvsT2_HTML(presentationData, selectedStudyId, currentKollektiv);
        } else {
            contentHTML = '<div class="alert alert-warning">Unbekannte Ansicht ausgewählt.</div>';
        }
        return viewSelectorHTML + `<div id="praesentation-content-area">${contentHTML}</div>`;
    }

    return Object.freeze({
        createDatenTableHTML: createDatenTableHTML, // Umbenannt
        createAuswertungTableHTML,
        createAuswertungTableCardHTML,
        createDeskriptiveStatistikContentHTML,
        createGueteContentHTML,
        createVergleichContentHTML,
        createAssoziationContentHTML,
        createVergleichKollektiveContentHTML,
        createCriteriaComparisonTableHTML,
        createPresentationTabContent
    });

})();