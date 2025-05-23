const statistikTabLogic = (() => {

    function createDeskriptiveStatistikContentHTML(stats, indexSuffix = '0', kollektivName = '') {
        const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
        if (!stats || !stats.deskriptiv || !stats.deskriptiv.anzahlPatienten) {
            const noDataText = langKey === 'de' ? 'Keine deskriptiven Daten verfügbar.' : 'No descriptive data available.';
            return `<p class="text-muted small p-3">${noDataText}</p>`;
        }

        const total = stats.deskriptiv.anzahlPatienten;
        const na = '--';
        const fv = (val, dig = 1) => formatNumber(val, dig, na, false, langKey);
        const fP = (val, dig = 1) => formatPercent(val, dig, na, langKey);
        const fLK = (lkData) => `${fv(lkData?.median,1)} (${fv(lkData?.min,0)}-${fv(lkData?.max,0)}) [${fv(lkData?.mean,1)} ± ${fv(lkData?.sd,1)}]`;
        const d = stats.deskriptiv;
        const ageChartId = `chart-stat-age-${indexSuffix}`;
        const genderChartId = `chart-stat-gender-${indexSuffix}`;

        const getTooltipDesc = (category, key, fallbackDe, fallbackEn) => {
            const entry = TOOLTIP_CONTENT[category]?.[key]?.description;
            if (typeof entry === 'object') return entry[langKey] || entry['de'] || (langKey === 'de' ? fallbackDe : fallbackEn);
            return entry || (langKey === 'de' ? fallbackDe : fallbackEn);
        };

        const ageChartTooltipTextBase = TOOLTIP_CONTENT.deskriptiveStatistik.chartAge?.description;
        const ageChartTooltipText = ((typeof ageChartTooltipTextBase === 'object' ? ageChartTooltipTextBase[langKey] : ageChartTooltipTextBase?.[langKey]) || ageChartTooltipTextBase?.['de'] || (langKey === 'de' ? 'Altersverteilung für Kollektiv [KOLLEKTIV]' : 'Age Distribution for cohort [KOLLEKTIV]')).replace('[KOLLEKTIV]', kollektivName);
        const genderChartTooltipTextBase = TOOLTIP_CONTENT.deskriptiveStatistik.chartGender?.description;
        const genderChartTooltipText = ((typeof genderChartTooltipTextBase === 'object' ? genderChartTooltipTextBase[langKey] : genderChartTooltipTextBase?.[langKey]) || genderChartTooltipTextBase?.['de'] || (langKey === 'de' ? 'Geschlechterverteilung für Kollektiv [KOLLEKTIV]' : 'Gender Distribution for cohort [KOLLEKTIV]')).replace('[KOLLEKTIV]', kollektivName);

        const demographieCaption = langKey === 'de' ? `Demographie & Status (N=${total})` : `Demographics & Status (N=${total})`;
        const lkCaption = langKey === 'de' ? 'Lymphknotenanzahlen (Median (Min-Max) [Mean ± SD])' : 'Lymph Node Counts (Median (Min-Max) [Mean ± SD])';
        const metricHeader = langKey === 'de' ? 'Metrik' : 'Metric';
        const valueHeader = langKey === 'de' ? 'Wert' : 'Value';
        const ageLabel = langKey === 'de' ? 'Alter Median (Min-Max) [Mean ± SD]' : 'Age Median (Min-Max) [Mean ± SD]';
        const genderLabel = langKey === 'de' ? 'Geschlecht (m / w) (n / %)' : 'Gender (m / f) (n / %)';
        const therapyLabel = langKey === 'de' ? 'Therapie (direkt OP / nRCT) (n / %)' : 'Therapy (Upfront Surgery / nCRT) (n / %)';
        const nStatusLabel = langKey === 'de' ? 'N Status (+ / -) (n / %)' : 'N Status (+ / -) (n / %)';
        const asStatusLabel = langKey === 'de' ? 'AS Status (+ / -) (n / %)' : 'AS Status (+ / -) (n / %)';
        const t2StatusLabel = langKey === 'de' ? 'T2 Status (+ / -) (n / %)' : 'T2 Status (+ / -) (n / %)';
        const lkNTotalLabel = langKey === 'de' ? 'LK N gesamt' : 'LN N total';
        const lkNPlusLabel = langKey === 'de' ? 'LK N+' : 'LN N+';
        const lkASTotalLabel = langKey === 'de' ? 'LK AS gesamt' : 'LN AS total';
        const lkASPlusLabel = langKey === 'de' ? 'LK AS+' : 'LN AS+';
        const lkT2TotalLabel = langKey === 'de' ? 'LK T2 gesamt' : 'LN T2 total';
        const lkT2PlusLabel = langKey === 'de' ? 'LK T2+' : 'LN T2+';
        const footnote1 = langKey === 'de' ? 'Nur bei N+ Patienten' : 'Only in N+ patients';
        const footnote2 = langKey === 'de' ? 'Nur bei AS+ Patienten' : 'Only in AS+ patients';
        const footnote3 = langKey === 'de' ? 'Nur bei T2+ Patienten' : 'Only in T2+ patients';
        const loadingAgeText = langKey === 'de' ? 'Lade Altersverteilung...' : 'Loading age distribution...';
        const loadingGenderText = langKey === 'de' ? 'Lade Geschlechterverteilung...' : 'Loading gender distribution...';


        let tableHTML = `
            <div class="row g-3 p-2">
                <div class="col-md-6">
                    <div class="table-responsive mb-3">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-demographie-${indexSuffix}">
                            <caption>${demographieCaption}</caption>
                            <thead class="visually-hidden"><tr><th>${metricHeader}</th><th>${valueHeader}</th></tr></thead>
                            <tbody>
                                <tr data-tippy-content="${getTooltipDesc('deskriptiveStatistik', 'alterMedian', 'Alter', 'Age')}"><td>${ageLabel}</td><td>${fv(d.alter?.median, 1)} (${fv(d.alter?.min, 0)} - ${fv(d.alter?.max, 0)}) [${fv(d.alter?.mean, 1)} ± ${fv(d.alter?.sd, 1)}]</td></tr>
                                <tr data-tippy-content="${getTooltipDesc('deskriptiveStatistik', 'geschlecht', 'Geschlecht', 'Gender')}"><td>${genderLabel}</td><td>${d.geschlecht?.m ?? 0} / ${d.geschlecht?.f ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.geschlecht?.m ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.geschlecht?.f ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${getTooltipDesc('datenTable', 'therapie', 'Therapie', 'Therapy')}"><td>${therapyLabel}</td><td>${d.therapie?.['direkt OP'] ?? 0} / ${d.therapie?.nRCT ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.therapie?.['direkt OP'] ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.therapie?.nRCT ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${getTooltipDesc('deskriptiveStatistik', 'nStatus', 'N Status', 'N Status')}"><td>${nStatusLabel}</td><td>${d.nStatus?.plus ?? 0} / ${d.nStatus?.minus ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.nStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.nStatus?.minus ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${getTooltipDesc('deskriptiveStatistik', 'asStatus', 'AS Status', 'AS Status')}"><td>${asStatusLabel}</td><td>${d.asStatus?.plus ?? 0} / ${d.asStatus?.minus ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.asStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.asStatus?.minus ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${getTooltipDesc('deskriptiveStatistik', 't2Status', 'T2 Status', 'T2 Status')}"><td>${t2StatusLabel}</td><td>${d.t2Status?.plus ?? 0} / ${d.t2Status?.minus ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.t2Status?.plus ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.t2Status?.minus ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                            </tbody>
                        </table>
                    </div>
                     <div class="table-responsive">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-lk-${indexSuffix}">
                             <caption>${lkCaption}</caption>
                             <thead class="visually-hidden"><tr><th>${metricHeader}</th><th>${valueHeader}</th></tr></thead>
                             <tbody>
                                <tr data-tippy-content="${getTooltipDesc('deskriptiveStatistik', 'lkAnzahlPatho', 'LK N gesamt', 'LN N total')}"><td>${lkNTotalLabel}</td><td>${fLK(d.lkAnzahlen?.n?.total)}</td></tr>
                                <tr data-tippy-content="${getTooltipDesc('deskriptiveStatistik', 'lkAnzahlPathoPlus', 'LK N+', 'LN N+')}"><td>${lkNPlusLabel} <sup>*</sup></td><td>${fLK(d.lkAnzahlen?.n?.plus)}</td></tr>
                                <tr data-tippy-content="${getTooltipDesc('deskriptiveStatistik', 'lkAnzahlAS', 'LK AS gesamt', 'LN AS total')}"><td>${lkASTotalLabel}</td><td>${fLK(d.lkAnzahlen?.as?.total)}</td></tr>
                                <tr data-tippy-content="${getTooltipDesc('deskriptiveStatistik', 'lkAnzahlASPlus', 'LK AS+', 'LN AS+')}"><td>${lkASPlusLabel} <sup>**</sup></td><td>${fLK(d.lkAnzahlen?.as?.plus)}</td></tr>
                                <tr data-tippy-content="${getTooltipDesc('deskriptiveStatistik', 'lkAnzahlT2', 'LK T2 gesamt', 'LN T2 total')}"><td>${lkT2TotalLabel}</td><td>${fLK(d.lkAnzahlen?.t2?.total)}</td></tr>
                                <tr data-tippy-content="${getTooltipDesc('deskriptiveStatistik', 'lkAnzahlT2Plus', 'LK T2+', 'LN T2+')}"><td>${lkT2PlusLabel} <sup>***</sup></td><td>${fLK(d.lkAnzahlen?.t2?.plus)}</td></tr>
                             </tbody>
                        </table>
                     </div>
                    <p class="small text-muted mt-1 mb-0"><sup>*</sup> ${footnote1} (n=${d.nStatus?.plus ?? 0}); <sup>**</sup> ${footnote2} (n=${d.asStatus?.plus ?? 0}); <sup>***</sup> ${footnote3} (n=${d.t2Status?.plus ?? 0}).</p>
                </div>
                <div class="col-md-6 d-flex flex-column">
                    <div class="mb-2 flex-grow-1" id="${ageChartId}" style="min-height: 150px;" data-tippy-content="${ageChartTooltipText}">
                       <p class="text-muted small text-center p-3">${loadingAgeText}</p>
                    </div>
                    <div class="flex-grow-1" id="${genderChartId}" style="min-height: 150px;" data-tippy-content="${genderChartTooltipText}">
                       <p class="text-muted small text-center p-3">${loadingGenderText}</p>
                    </div>
                </div>
            </div>`;
        return tableHTML;
    }

    function createGueteContentHTML(stats, methode, kollektivName) {
        const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
        if (!stats || !stats.matrix) {
            const noDataText = langKey === 'de' ? 'Keine Gütedaten verfügbar.' : 'No performance data available.';
            return `<p class="text-muted small p-3">${noDataText}</p>`;
        }

        const matrix = stats.matrix; const na = '--';
        const fCI_perf = (m, key) => { const digits = (key === 'f1' || key === 'auc') ? 3 : 1; const isPercent = !(key === 'f1' || key === 'auc'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, digits, isPercent, na, langKey); };

        const confusionMatrixTitle = langKey === 'de' ? 'Konfusionsmatrix' : 'Confusion Matrix';
        const pathoLabel = langKey === 'de' ? 'Patho' : 'Patho';
        const tpTooltip = langKey === 'de' ? `Richtig Positiv (RP): ${methode}+ und N+` : `True Positive (TP): ${methode}+ and N+`;
        const fpTooltip = langKey === 'de' ? `Falsch Positiv (FP): ${methode}+ aber N-` : `False Positive (FP): ${methode}+ but N-`;
        const fnTooltip = langKey === 'de' ? `Falsch Negativ (FN): ${methode}- aber N+` : `False Negative (FN): ${methode}- but N+`;
        const tnTooltip = langKey === 'de' ? `Richtig Negativ (RN): ${methode}- und N-` : `True Negative (TN): ${methode}- and N-`;
        const metricsTableCaption = langKey === 'de' ? 'Diagnostische Gütekriterien' : 'Diagnostic Performance Metrics';
        const metricHeader = langKey === 'de' ? 'Metrik' : 'Metric';
        const valueCIHeader = langKey === 'de' ? 'Wert (95% CI)' : 'Value (95% CI)';
        const ciMethodHeader = langKey === 'de' ? 'CI Methode' : 'CI Method';


        let matrixHTML = `<h6 class="px-2 pt-2">${confusionMatrixTitle} (${methode} vs. N)</h6><table class="table table-sm table-bordered text-center small mx-2 mb-3" style="width: auto;" id="table-guete-matrix-${methode}-${kollektivName.replace(/\s+/g, '_')}"><thead class="small"><tr><th></th><th>N+ (${pathoLabel})</th><th>N- (${pathoLabel})</th></tr></thead><tbody><tr><td class="fw-bold">${methode}+</td><td data-tippy-content="${tpTooltip}">${formatNumber(matrix.rp, 0, na, false, langKey)}</td><td data-tippy-content="${fpTooltip}">${formatNumber(matrix.fp, 0, na, false, langKey)}</td></tr><tr><td class="fw-bold">${methode}-</td><td data-tippy-content="${fnTooltip}">${formatNumber(matrix.fn, 0, na, false, langKey)}</td><td data-tippy-content="${tnTooltip}">${formatNumber(matrix.rn, 0, na, false, langKey)}</td></tr></tbody></table>`;
        let metricsHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-guete-metrics-${methode}-${kollektivName.replace(/\s+/g, '_')}"><caption>${metricsTableCaption}</caption><thead><tr><th>${metricHeader}</th><th>${valueCIHeader}</th><th>${ciMethodHeader}</th></tr></thead><tbody>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('sens', methode, langKey)}">${TOOLTIP_CONTENT.statMetrics.sens.name[langKey] || TOOLTIP_CONTENT.statMetrics.sens.name.de}</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('sens', stats.sens, methode, kollektivName, langKey)}">${fCI_perf(stats.sens, 'sens')}</td><td>${stats.sens?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('spez', methode, langKey)}">${TOOLTIP_CONTENT.statMetrics.spez.name[langKey] || TOOLTIP_CONTENT.statMetrics.spez.name.de}</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('spez', stats.spez, methode, kollektivName, langKey)}">${fCI_perf(stats.spez, 'spez')}</td><td>${stats.spez?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('ppv', methode, langKey)}">${TOOLTIP_CONTENT.statMetrics.ppv.name[langKey] || TOOLTIP_CONTENT.statMetrics.ppv.name.de}</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('ppv', stats.ppv, methode, kollektivName, langKey)}">${fCI_perf(stats.ppv, 'ppv')}</td><td>${stats.ppv?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('npv', methode, langKey)}">${TOOLTIP_CONTENT.statMetrics.npv.name[langKey] || TOOLTIP_CONTENT.statMetrics.npv.name.de}</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('npv', stats.npv, methode, kollektivName, langKey)}">${fCI_perf(stats.npv, 'npv')}</td><td>${stats.npv?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('acc', methode, langKey)}">${TOOLTIP_CONTENT.statMetrics.acc.name[langKey] || TOOLTIP_CONTENT.statMetrics.acc.name.de}</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('acc', stats.acc, methode, kollektivName, langKey)}">${fCI_perf(stats.acc, 'acc')}</td><td>${stats.acc?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('balAcc', methode, langKey)}">${TOOLTIP_CONTENT.statMetrics.balacc.name[langKey] || TOOLTIP_CONTENT.statMetrics.balacc.name.de}</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('balAcc', stats.balAcc, methode, kollektivName, langKey)}">${fCI_perf(stats.balAcc, 'balAcc')}</td><td>${stats.balAcc?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('f1', methode, langKey)}">${TOOLTIP_CONTENT.statMetrics.f1.name[langKey] || TOOLTIP_CONTENT.statMetrics.f1.name.de}</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('f1', stats.f1, methode, kollektivName, langKey)}">${fCI_perf(stats.f1, 'f1')}</td><td>${stats.f1?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('auc', methode, langKey)}">${TOOLTIP_CONTENT.statMetrics.auc.name[langKey] || TOOLTIP_CONTENT.statMetrics.auc.name.de} (Bal. Acc.)</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('auc', stats.auc, methode, kollektivName, langKey)}">${fCI_perf(stats.auc, 'auc')}</td><td>${stats.auc?.method || na}</td></tr>
        </tbody></table></div>`;
        return matrixHTML + metricsHTML;
    }

    function createVergleichContentHTML(stats, kollektivName, t2ShortName = 'T2') {
        const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
        if (!stats) {
            const noDataText = langKey === 'de' ? 'Keine Vergleichsdaten verfügbar.' : 'No comparison data available.';
            return `<p class="text-muted small p-3">${noDataText}</p>`;
        }

        const na = '--';
        const fP = (pVal) => (pVal !== null && !isNaN(pVal) && isFinite(pVal)) ? (pVal < 0.001 ? (langKey === 'de' ? '&lt;0,001' : '&lt;.001') : formatNumber(pVal, 3, na, false, langKey)) : na;
        const testHeader = langKey === 'de' ? 'Test' : 'Test';
        const statisticHeader = langKey === 'de' ? 'Statistik' : 'Statistic';
        const pValueHeader = langKey === 'de' ? 'p-Wert' : 'p-value';
        const methodHeader = langKey === 'de' ? 'Methode' : 'Method';

        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}"><thead><tr><th>${testHeader}</th><th>${statisticHeader}</th><th>${pValueHeader}</th><th>${methodHeader}</th></tr></thead><tbody>
            <tr><td data-tippy-content="${ui_helpers.getTestDescriptionHTML('mcnemar', t2ShortName, langKey)}">McNemar (Accuracy)</td><td>${formatNumber(stats.mcnemar?.statistic, 3, na, false, langKey)} (df=${stats.mcnemar?.df || na})</td><td data-tippy-content="${ui_helpers.getTestInterpretationHTML('mcnemar', stats.mcnemar, kollektivName, t2ShortName, langKey)}">${fP(stats.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(stats.mcnemar?.pValue)}</td><td>${stats.mcnemar?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getTestDescriptionHTML('delong', t2ShortName, langKey)}">DeLong (AUC)</td><td>Z=${formatNumber(stats.delong?.Z, 3, na, false, langKey)}</td><td data-tippy-content="${ui_helpers.getTestInterpretationHTML('delong', stats.delong, kollektivName, t2ShortName, langKey)}">${fP(stats.delong?.pValue)} ${getStatisticalSignificanceSymbol(stats.delong?.pValue)}</td><td>${stats.delong?.method || na}</td></tr>
        </tbody></table></div>`;
        return tableHTML;
    }

    function createAssoziationContentHTML(stats, kollektivName, criteria) {
        const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
        if (!stats || Object.keys(stats).length === 0) {
            const noDataText = langKey === 'de' ? 'Keine Assoziationsdaten verfügbar.' : 'No association data available.';
            return `<p class="text-muted small p-3">${noDataText}</p>`;
        }

        const na = '--';
        const fP = (pVal) => (pVal !== null && !isNaN(pVal) && isFinite(pVal)) ? (pVal < 0.001 ? (langKey === 'de' ? '&lt;0,001' : '&lt;.001') : formatNumber(pVal, 3, na, false, langKey)) : na;

        const tableCaption = langKey === 'de' ? 'Assoziation zwischen Merkmalen und N-Status (+/-)' : 'Association between Features and N-Status (+/-)';
        const featureHeader = langKey === 'de' ? 'Merkmal' : 'Feature';
        const pValueHeader = langKey === 'de' ? 'p-Wert' : 'p-value';
        const testHeader = langKey === 'de' ? 'Test' : 'Test';
        const inactiveSuffix = langKey === 'de' ? ' (inaktiv)' : ' (inactive)';


        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-assoziation-${kollektivName.replace(/\s+/g, '_')}"><caption>${tableCaption}</caption><thead><tr><th>${featureHeader}</th><th>OR (95% CI)</th><th>RD (%) (95% CI)</th><th>Phi (φ)</th><th>${pValueHeader}</th><th>${testHeader}</th></tr></thead><tbody>`;

        const getPValueInterpretationAssoc = (key, assocObj) => {
            const testName = assocObj?.testName || '';
            const pTooltipKey = testName.includes("Fisher") ? 'fisher' : (testName.includes("Mann-Whitney") ? 'mannwhitney' : (key === 'size_mwu' ? 'mannwhitney' : 'defaultP'));
            const merkmalName = assocObj?.featureName || (TOOLTIP_CONTENT.statMetrics[key]?.name?.[langKey] || TOOLTIP_CONTENT.statMetrics[key]?.name?.['de'] || key);
            return ui_helpers.getAssociationInterpretationHTML(pTooltipKey, assocObj, merkmalName, kollektivName, langKey);
        };
        const getTestDescriptionAssoc = (assocObj) => {
            const testName = assocObj?.testName || '';
            const pTooltipKey = testName.includes("Fisher") ? 'fisher' : (testName.includes("Mann-Whitney") ? 'mannwhitney' : 'defaultP');
            const merkmalName = assocObj?.featureName || '';
            const descriptionBase = TOOLTIP_CONTENT.statMetrics[pTooltipKey]?.description;
            const description = (typeof descriptionBase === 'object' ? (descriptionBase[langKey] || descriptionBase['de']) : descriptionBase) || (langKey === 'de' ? 'Testbeschreibung nicht verfügbar.' : 'Test description not available.');
            return description.replace(/\[MERKMAL\]/g, `'${merkmalName}'`).replace(/\[VARIABLE\]/g, `'${merkmalName}'`);
        };
        const getMerkmalDescriptionHTMLAssoc = (key, assocObj) => {
            const baseName = TOOLTIP_CONTENT.statMetrics[key]?.name?.[langKey] || TOOLTIP_CONTENT.statMetrics[key]?.name?.['de'] || assocObj?.featureName || key;
            const featureLabel = langKey === 'de' ? 'Merkmal:' : 'Feature:';
            return `${featureLabel} ${baseName}`;
        };

        const addRow = (key, assocObj, isActive = true) => {
            if (!assocObj) return '';
            const merkmalName = assocObj.featureName || (TOOLTIP_CONTENT.statMetrics[key]?.name?.[langKey] || TOOLTIP_CONTENT.statMetrics[key]?.name?.['de'] || key);
            const orStr = formatCI(assocObj.or?.value, assocObj.or?.ci?.lower, assocObj.or?.ci?.upper, 2, false, na, langKey);
            const rdVal = assocObj.rd?.value !== null && !isNaN(assocObj.rd.value) && isFinite(assocObj.rd.value) ? assocObj.rd.value * 100 : NaN;
            const rdCILowerVal = assocObj.rd?.ci?.lower !== null && !isNaN(assocObj.rd.ci.lower) && isFinite(assocObj.rd.ci.lower) ? assocObj.rd.ci.lower * 100 : NaN;
            const rdCIUpperVal = assocObj.rd?.ci?.upper !== null && !isNaN(assocObj.rd.ci.upper) && isFinite(assocObj.rd.ci.upper) ? assocObj.rd.ci.upper * 100 : NaN;

            const rdValPerc = formatNumber(rdVal, 1, na, false, langKey);
            const rdCILowerPerc = formatNumber(rdCILowerVal, 1, na, false, langKey);
            const rdCIUpperPerc = formatNumber(rdCIUpperVal, 1, na, false, langKey);

            const rdStr = (rdValPerc !== na && rdCILowerPerc !== na && rdCIUpperPerc !== na) ? `${rdValPerc}% (${rdCILowerPerc}% – ${rdCIUpperPerc}%)` : (rdValPerc !== na ? `${rdValPerc}%` : na);

            const phiStr = formatNumber(assocObj.phi?.value, 2, na, false, langKey);
            const pStr = fP(assocObj.pValue);
            const sigSymbol = getStatisticalSignificanceSymbol(assocObj.pValue);
            const testName = assocObj.testName || na;
            const aktivText = isActive ? '' : ` <small class="text-muted">${inactiveSuffix}</small>`;

            return `<tr>
                <td data-tippy-content="${getMerkmalDescriptionHTMLAssoc(key, assocObj)}">${merkmalName}${aktivText}</td>
                <td data-tippy-content="${ui_helpers.getAssociationInterpretationHTML('or', assocObj, merkmalName, kollektivName, langKey)}">${orStr}</td>
                <td data-tippy-content="${ui_helpers.getAssociationInterpretationHTML('rd', assocObj, merkmalName, kollektivName, langKey)}">${rdStr}</td>
                <td data-tippy-content="${ui_helpers.getAssociationInterpretationHTML('phi', assocObj, merkmalName, kollektivName, langKey)}">${phiStr}</td>
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
            const descTooltipBase = langKey === 'de' ? "Vergleich der medianen Lymphknotengröße zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test." : "Comparison of median lymph node size between N+ and N- patients using Mann-Whitney U test.";
            const mwuFeatureDisplayName = mwuObj.featureName || (langKey === 'de' ? 'LK Größe (Median Vgl.)' : 'LN Size (Median Comp.)');
            const testDescTooltip = getTestDescriptionAssoc(mwuObj);
            tableHTML += `<tr>
                <td data-tippy-content="${descTooltipBase}">${mwuFeatureDisplayName}</td>
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
        const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
        if (!stats || !stats.accuracyComparison || !stats.aucComparison) {
            const noDataText = langKey === 'de' ? 'Keine Kollektiv-Vergleichsdaten verfügbar.' : 'No cohort comparison data available.';
            return `<p class="text-muted small p-3">${noDataText}</p>`;
        }

        const na = '--';
        const fP = (pVal) => (pVal !== null && !isNaN(pVal) && isFinite(pVal)) ? (pVal < 0.001 ? (langKey === 'de' ? '&lt;0,001' : '&lt;.001') : formatNumber(pVal, 3, na, false, langKey)) : na;
        const kollektiv1Display = getKollektivDisplayName(kollektiv1Name, langKey);
        const kollektiv2Display = getKollektivDisplayName(kollektiv2Name, langKey);
        const accAS = stats.accuracyComparison?.as;
        const accT2 = stats.accuracyComparison?.t2;
        const aucAS = stats.aucComparison?.as;
        const aucT2 = stats.aucComparison?.t2;

        const getPValueInterpretationComp = (pValue, testKey, methode) => {
            const interpretationTemplateBase = TOOLTIP_CONTENT.statMetrics[testKey]?.interpretation;
            const interpretationTemplate = (typeof interpretationTemplateBase === 'object' ? (interpretationTemplateBase[langKey] || interpretationTemplateBase['de']) : interpretationTemplateBase) || (langKey === 'de' ? 'Keine Interpretation verfügbar.' : 'No interpretation available.');
            const pStr = (pValue !== null && !isNaN(pValue) && isFinite(pValue)) ? (pValue < 0.001 ? (langKey === 'de' ? '&lt;0,001' : '&lt;.001') : formatNumber(pValue, 3, na, false, langKey)) : na;
            const sigText = getStatisticalSignificanceText(pValue, APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, langKey);
            return interpretationTemplate
                .replace(/\[METHODE\]/g, methode)
                .replace(/\[KOLLEKTIV1\]/g, `<strong>${kollektiv1Display}</strong>`)
                .replace(/\[KOLLEKTIV2\]/g, `<strong>${kollektiv2Display}</strong>`)
                .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`);
        };

        const getTestDescComp = (testKey, methode) => {
            const descriptionBase = TOOLTIP_CONTENT.statMetrics[testKey]?.description;
            const description = (typeof descriptionBase === 'object' ? (descriptionBase[langKey] || descriptionBase['de']) : descriptionBase) || (langKey === 'de' ? 'Testbeschreibung nicht verfügbar.' : 'Test description not available.');
            return description.replace('[METHODE]', methode);
        };

        const comparisonHeader = langKey === 'de' ? 'Vergleich' : 'Comparison';
        const methodHeader = langKey === 'de' ? 'Methode' : 'Method';
        const pValueHeader = langKey === 'de' ? 'p-Wert' : 'p-value';
        const testHeader = langKey === 'de' ? 'Test' : 'Test';

        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-kollektive-${kollektiv1Name.replace(/\s+/g, '_')}-vs-${kollektiv2Name.replace(/\s+/g, '_')}"><thead><tr><th>${comparisonHeader}</th><th>${methodHeader}</th><th>${pValueHeader}</th><th>${testHeader}</th></tr></thead><tbody>`;
        tableHTML += `<tr><td>Accuracy</td><td>AS</td><td data-tippy-content="${getPValueInterpretationComp(accAS?.pValue, 'accComp', 'AS')}">${fP(accAS?.pValue)} ${getStatisticalSignificanceSymbol(accAS?.pValue)}</td><td data-tippy-content="${getTestDescComp('accComp','AS')}">${accAS?.testName || na}</td></tr>`;
        tableHTML += `<tr><td>Accuracy</td><td>T2</td><td data-tippy-content="${getPValueInterpretationComp(accT2?.pValue, 'accComp', 'T2')}">${fP(accT2?.pValue)} ${getStatisticalSignificanceSymbol(accT2?.pValue)}</td><td data-tippy-content="${getTestDescComp('accComp','T2')}">${accT2?.testName || na}</td></tr>`;
        tableHTML += `<tr><td>AUC</td><td>AS</td><td data-tippy-content="${getPValueInterpretationComp(aucAS?.pValue, 'aucComp', 'AS')}">${fP(aucAS?.pValue)} ${getStatisticalSignificanceSymbol(aucAS?.pValue)} (Diff: ${formatNumber(aucAS?.diffAUC, 3, na, false, langKey)}, Z=${formatNumber(aucAS?.Z, 2, na, false, langKey)})</td><td data-tippy-content="${getTestDescComp('aucComp','AS')}">${aucAS?.method || na}</td></tr>`;
        tableHTML += `<tr><td>AUC</td><td>T2</td><td data-tippy-content="${getPValueInterpretationComp(aucT2?.pValue, 'aucComp', 'T2')}">${fP(aucT2?.pValue)} ${getStatisticalSignificanceSymbol(aucT2?.pValue)} (Diff: ${formatNumber(aucT2?.diffAUC, 3, na, false, langKey)}, Z=${formatNumber(aucT2?.Z, 2, na, false, langKey)})</td><td data-tippy-content="${getTestDescComp('aucComp','T2')}">${aucT2?.method || na}</td></tr>`;
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function createCriteriaComparisonTableHTML(results, kollektivName) {
        const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
        if (!Array.isArray(results) || results.length === 0) {
            const noDataText = langKey === 'de' ? 'Keine Daten für Kriterienvergleich verfügbar.' : 'No data for criteria comparison available.';
            return `<p class="text-muted small p-3">${noDataText}</p>`;
        }

        const tc = TOOLTIP_CONTENT || {}; const cc = tc.criteriaComparisonTable || {};
        const getHeaderLabel = (key, fallbackDe, fallbackEn) => {
            const labelBase = cc[key];
            if (typeof labelBase === 'object') return (labelBase[langKey] || labelBase['de']) || (langKey === 'de' ? fallbackDe : fallbackEn);
            return labelBase || (langKey === 'de' ? fallbackDe : fallbackEn);
        };

        const headers = [
            { key: 'set', label: getHeaderLabel('tableHeaderSet', "Methode / Kriterienset", "Method / Criteria Set"), tooltipKey: null },
            { key: 'sens', label: getHeaderLabel('tableHeaderSens', "Sens.", "Sens."), tooltipKey: 'sens' },
            { key: 'spez', label: getHeaderLabel('tableHeaderSpez', "Spez.", "Spec."), tooltipKey: 'spez' },
            { key: 'ppv', label: getHeaderLabel('tableHeaderPPV', "PPV", "PPV"), tooltipKey: 'ppv' },
            { key: 'npv', label: getHeaderLabel('tableHeaderNPV', "NPV", "NPV"), tooltipKey: 'npv' },
            { key: 'acc', label: getHeaderLabel('tableHeaderAcc', "Acc.", "Acc."), tooltipKey: 'acc' },
            { key: 'auc', label: getHeaderLabel('tableHeaderAUC', "AUC/BalAcc", "AUC/BalAcc"), tooltipKey: 'auc' }
        ];
        const tableId = "table-kriterien-vergleich";
        const tableCaptionText = langKey === 'de' ? 'Vergleich verschiedener Kriteriensätze (vs. N) für Kollektiv:' : 'Comparison of different criteria sets (vs. N) for cohort:';
        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped table-hover small caption-top" id="${tableId}"><caption>${tableCaptionText} ${kollektivName}</caption><thead class="small"><tr>`;

        headers.forEach(h => {
            const tooltipAttr = h.tooltipKey ? `data-tippy-content="${ui_helpers.getMetricDescriptionHTML(h.tooltipKey, (langKey === 'de' ? 'Ausgewählte Methode' : 'Selected Method'), langKey)}"` : '';
            tableHTML += `<th ${tooltipAttr}>${h.label}</th>`;
        });
        tableHTML += `</tr></thead><tbody>`;
        results.forEach(result => {
            const isApplied = result.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
            const isAS = result.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID;
            const rowClass = isApplied ? 'table-primary' : (isAS ? 'table-info' : '');
            let nameDisplay = result.name || (langKey === 'de' ? 'Unbekannt' : 'Unknown');
            if (isApplied) nameDisplay = UI_TEXTS.kollektivDisplayNames.applied_criteria[langKey] || UI_TEXTS.kollektivDisplayNames.applied_criteria.de;
            else if (isAS) nameDisplay = UI_TEXTS.kollektivDisplayNames.avocado_sign[langKey] || UI_TEXTS.kollektivDisplayNames.avocado_sign.de;

            const tooltipSens = ui_helpers.getMetricInterpretationHTML('sens', { value: result.sens }, nameDisplay, kollektivName, langKey);
            const tooltipSpez = ui_helpers.getMetricInterpretationHTML('spez', { value: result.spez }, nameDisplay, kollektivName, langKey);
            const tooltipPPV = ui_helpers.getMetricInterpretationHTML('ppv', { value: result.ppv }, nameDisplay, kollektivName, langKey);
            const tooltipNPV = ui_helpers.getMetricInterpretationHTML('npv', { value: result.npv }, nameDisplay, kollektivName, langKey);
            const tooltipAcc = ui_helpers.getMetricInterpretationHTML('acc', { value: result.acc }, nameDisplay, kollektivName, langKey);
            const tooltipAUC = ui_helpers.getMetricInterpretationHTML('auc', { value: result.auc }, nameDisplay, kollektivName, langKey);

            tableHTML += `<tr class="${rowClass}"><td class="fw-bold">${nameDisplay}</td><td data-tippy-content="${tooltipSens}">${formatPercent(result.sens, 1, '--', langKey)}</td><td data-tippy-content="${tooltipSpez}">${formatPercent(result.spez, 1, '--', langKey)}</td><td data-tippy-content="${tooltipPPV}">${formatPercent(result.ppv, 1, '--', langKey)}</td><td data-tippy-content="${tooltipNPV}">${formatPercent(result.npv, 1, '--', langKey)}</td><td data-tippy-content="${tooltipAcc}">${formatPercent(result.acc, 1, '--', langKey)}</td><td data-tippy-content="${tooltipAUC}">${formatNumber(result.auc, 3, '--', false, langKey)}</td></tr>`;
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
