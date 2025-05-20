const statistikTabLogic = (() => {

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
        const valueStr = formatNumber(data?.value, digits, na, isPercent); // useStandardFormat = isPercent for consistency
        const lowerStr = formatNumber(data?.ci?.lower, digits, na, isPercent);
        const upperStr = formatNumber(data?.ci?.upper, digits, na, isPercent);
        const ciMethodStr = data?.method || 'N/A';
        const bewertungStr = (key === 'auc') ? getAUCBewertung(data?.value) : '';

        let interpretation = interpretationTemplate
            .replace(/\[METHODE\]/g, methode)
            .replace(/\[WERT\]/g, `<strong>${valueStr}${isPercent && valueStr !== na ? '%' : ''}</strong>`)
            .replace(/\[LOWER\]/g, lowerStr)
            .replace(/\[UPPER\]/g, upperStr)
            .replace(/\[METHOD_CI\]/g, ciMethodStr)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
            .replace(/\[BEWERTUNG\]/g, `<strong>${bewertungStr}</strong>`);

        if (lowerStr === na || upperStr === na || ciMethodStr === na) {
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
        } else if (key === 'fisher' || key === 'mannwhitney' || key === 'pvalue' || key === 'size_mwu') {
             pVal = assocObj?.pValue;
             pStr = (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : formatNumber(pVal, 3, na)) : na;
             sigSymbol = getStatisticalSignificanceSymbol(pVal);
             sigText = getStatisticalSignificanceText(pVal);
             const templateToUse = TOOLTIP_CONTENT.statMetrics[key]?.interpretation || TOOLTIP_CONTENT.statMetrics.defaultP.interpretation;
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
            .replace(/\[WERT\]/g, `<strong>${valueStr}${key === 'rd' && valueStr !== na ? '%' : ''}</strong>`)
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
            if (lowerStr === na || upperStr === na || ciMethodStr === na) {
                interpretation = interpretation.replace(/\(95% CI nach .*?: .*? - .*?\)/g, '(Keine CI-Daten verfügbar)');
                interpretation = interpretation.replace(/nach \[METHOD_CI\]:/g, '');
            }
         }
         if (key === 'or' && pStr === na) {
             interpretation = interpretation.replace(/, p=.*?, .*?\)/g, ')');
         }
        return interpretation;
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

    function createVergleichContentHTML(stats, kollektivName, t2ShortName = 'T2') {
        if (!stats) return '<p class="text-muted small p-3">Keine Vergleichsdaten verfügbar.</p>';
        const na = '--'; const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '<0.001' : formatNumber(pVal, 3, na)) : na;
        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}"><thead><tr><th>Test</th><th>Statistik</th><th>p-Wert</th><th>Methode</th></tr></thead><tbody>
            <tr><td data-tippy-content="${_getTestDescriptionHTML('mcnemar', t2ShortName)}">McNemar (Accuracy)</td><td>${formatNumber(stats.mcnemar?.statistic, 3, na)} (df=${stats.mcnemar?.df || na})</td><td data-tippy-content="${_getTestInterpretationHTML('mcnemar', stats.mcnemar, kollektivName, t2ShortName)}">${fP(stats.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(stats.mcnemar?.pValue)}</td><td>${stats.mcnemar?.method || na}</td></tr>
            <tr><td data-tippy-content="${_getTestDescriptionHTML('delong', t2ShortName)}">DeLong (AUC)</td><td>Z=${formatNumber(stats.delong?.Z, 3, na)}</td><td data-tippy-content="${_getTestInterpretationHTML('delong', stats.delong, kollektivName, t2ShortName)}">${fP(stats.delong?.pValue)} ${getStatisticalSignificanceSymbol(stats.delong?.pValue)}</td><td>${stats.delong?.method || na}</td></tr>
        </tbody></table></div>`;
        return tableHTML;
    }

    function createAssoziationContentHTML(stats, kollektivName, criteria) {
        if (!stats || Object.keys(stats).length === 0) return '<p class="text-muted small p-3">Keine Assoziationsdaten verfügbar.</p>';
        const na = '--'; const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '<0.001' : formatNumber(pVal, 3, na)) : na;
        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-assoziation-${kollektivName.replace(/\s+/g, '_')}"><caption>Assoziation zwischen Merkmalen und N-Status (+/-)</caption><thead><tr><th>Merkmal</th><th>OR (95% CI)</th><th>RD (%) (95% CI)</th><th>Phi (φ)</th><th>p-Wert</th><th>Test</th></tr></thead><tbody>`;

        const getPValueInterpretationAssoc = (key, assocObj) => {
             const testName = assocObj?.testName || '';
             const pTooltipKey = testName.includes("Fisher") ? 'fisher' : (testName.includes("Mann-Whitney") ? 'mannwhitney' : (key === 'size_mwu' ? 'mannwhitney' : 'defaultP'));
             const merkmalName = assocObj?.featureName || key;
             return _getAssociationInterpretationHTML(pTooltipKey, assocObj, merkmalName, kollektivName);
        };
        const getTestDescriptionAssoc = (assocObj) => {
             const testName = assocObj?.testName || '';
             const pTooltipKey = testName.includes("Fisher") ? 'fisher' : (testName.includes("Mann-Whitney") ? 'mannwhitney' : 'defaultP');
             const merkmalName = assocObj?.featureName || '';
             return (TOOLTIP_CONTENT.statMetrics[pTooltipKey]?.description || '').replace('[MERKMAL]', `'${merkmalName}'`).replace('[VARIABLE]', `'${merkmalName}'`);
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
            const rdStr = rdValPerc !== na ? `${rdValPerc}% (${rdCILowerPerc}% - ${rdCIUpperPerc}%)` : na;
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
            const descTooltip = "Vergleich der medianen Lymphknotengröße zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test.";
            const testDescTooltip = getTestDescriptionAssoc(mwuObj);
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
        const na = '--'; const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '<0.001' : formatNumber(pVal, 3, na)) : na;
        const kollektiv1Display = getKollektivDisplayName(kollektiv1Name); const kollektiv2Display = getKollektivDisplayName(kollektiv2Name);
        const accAS = stats.accuracyComparison?.as; const accT2 = stats.accuracyComparison?.t2;
        const aucAS = stats.aucComparison?.as; const aucT2 = stats.aucComparison?.t2;

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
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function createCriteriaComparisonTableHTML(results, kollektivName) {
         if (!Array.isArray(results) || results.length === 0) return '<p class="text-muted small p-3">Keine Daten für Kriterienvergleich verfügbar.</p>';
         const tc = TOOLTIP_CONTENT || {}; const cc = tc.criteriaComparisonTable || {};
         const headers = [
             { key: 'set', label: cc.tableHeaderSet || "Methode / Kriteriensatz", tooltip: null },
             { key: 'sens', label: cc.tableHeaderSens || "Sens.", tooltip: TOOLTIP_CONTENT.statMetrics.sens.description.replace('[METHODE]','Ausgewählte Methode') },
             { key: 'spez', label: cc.tableHeaderSpez || "Spez.", tooltip: TOOLTIP_CONTENT.statMetrics.spez.description.replace('[METHODE]','Ausgewählte Methode') },
             { key: 'ppv', label: cc.tableHeaderPPV || "PPV", tooltip: TOOLTIP_CONTENT.statMetrics.ppv.description.replace('[METHODE]','Ausgewählte Methode') },
             { key: 'npv', label: cc.tableHeaderNPV || "NPV", tooltip: TOOLTIP_CONTENT.statMetrics.npv.description.replace('[METHODE]','Ausgewählte Methode') },
             { key: 'acc', label: cc.tableHeaderAcc || "Acc.", tooltip: TOOLTIP_CONTENT.statMetrics.acc.description.replace('[METHODE]','Ausgewählte Methode') },
             { key: 'auc', label: cc.tableHeaderAUC || "AUC/BalAcc", tooltip: TOOLTIP_CONTENT.statMetrics.auc.description.replace('[METHODE]','Ausgewählte Methode') }
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

    return Object.freeze({
        createDeskriptiveStatistikContentHTML,
        createGueteContentHTML,
        createVergleichContentHTML,
        createAssoziationContentHTML,
        createVergleichKollektiveContentHTML,
        createCriteriaComparisonTableHTML
    });

})();
