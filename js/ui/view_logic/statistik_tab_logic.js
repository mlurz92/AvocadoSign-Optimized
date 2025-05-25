const statistikTabLogic = (() => {

    function createDeskriptiveStatistikContentHTML(stats, indexSuffix = '0', kollektivName = '', lang = 'de') {
        const effectiveLang = UI_TEXTS?.kollektivDisplayNames?.[lang] ? lang : 'de';
        const noDataMsg = effectiveLang === 'de' ? 'Keine deskriptiven Daten verfügbar.' : 'No descriptive data available.';
        if (!stats || !stats.deskriptiv || !stats.deskriptiv.anzahlPatienten) return `<p class="text-muted small p-3">${noDataMsg}</p>`;

        const total = stats.deskriptiv.anzahlPatienten;
        const na = '--';
        const fv = (val, dig = 1) => formatNumber(val, dig, na, false, effectiveLang);
        const fP = (val, dig = 1) => formatPercent(val, dig, na, effectiveLang);
        const fLK = (lkData) => `${fv(lkData?.median,1)} (${fv(lkData?.min,0)}-${fv(lkData?.max,0)}) [${fv(lkData?.mean,1)} ± ${fv(lkData?.sd,1)}]`;
        const d = stats.deskriptiv;
        const ageChartId = `chart-stat-age-${indexSuffix}`;
        const genderChartId = `chart-stat-gender-${indexSuffix}`;
        
        const tableTexts = UI_TEXTS.statistikTab?.deskriptiv?.table?.[effectiveLang] || UI_TEXTS.statistikTab?.deskriptiv?.table?.de || {};
        const tooltipBase = TOOLTIP_CONTENT?.[effectiveLang]?.deskriptiveStatistik || TOOLTIP_CONTENT?.de?.deskriptiveStatistik || {};

        let tableHTML = `
            <div class="row g-3 p-2">
                <div class="col-md-6">
                    <div class="table-responsive mb-3">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-demographie-${indexSuffix}">
                            <caption>${tableTexts.captionDemographie || 'Demographie & Status'} (N=${total})</caption>
                            <thead class="visually-hidden"><tr><th>${tableTexts.headerMetric || 'Metrik'}</th><th>${tableTexts.headerValue || 'Wert'}</th></tr></thead>
                            <tbody>
                                <tr data-tippy-content="${tooltipBase.alterMedian?.description || 'Alter'}"><td>${tableTexts.rowAge || 'Alter Median (Min-Max) [Mean ± SD]'}</td><td>${fv(d.alter?.median, 1)} (${fv(d.alter?.min, 0)} - ${fv(d.alter?.max, 0)}) [${fv(d.alter?.mean, 1)} ± ${fv(d.alter?.sd, 1)}]</td></tr>
                                <tr data-tippy-content="${tooltipBase.geschlecht?.description || 'Geschlecht'}"><td>${tableTexts.rowGender || 'Geschlecht (m / w) (n / %)'}</td><td>${d.geschlecht?.m ?? 0} / ${d.geschlecht?.f ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.geschlecht?.m ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.geschlecht?.f ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${tooltipBase.therapie?.description || TOOLTIP_CONTENT?.de?.datenTable?.therapie || 'Therapie'}"><td>${tableTexts.rowTherapy || 'Therapie (direkt OP / nRCT) (n / %)'}</td><td>${d.therapie?.['direkt OP'] ?? 0} / ${d.therapie?.nRCT ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.therapie?.['direkt OP'] ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.therapie?.nRCT ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${tooltipBase.nStatus?.description || 'N Status'}"><td>${tableTexts.rowNStatus || 'N Status (+ / -) (n / %)'}</td><td>${d.nStatus?.plus ?? 0} / ${d.nStatus?.minus ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.nStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.nStatus?.minus ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${tooltipBase.asStatus?.description || 'AS Status'}"><td>${tableTexts.rowASStatus || 'AS Status (+ / -) (n / %)'}</td><td>${d.asStatus?.plus ?? 0} / ${d.asStatus?.minus ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.asStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.asStatus?.minus ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${tooltipBase.t2Status?.description || 'T2 Status'}"><td>${tableTexts.rowT2Status || 'T2 Status (+ / -) (n / %)'}</td><td>${d.t2Status?.plus ?? 0} / ${d.t2Status?.minus ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.t2Status?.plus ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.t2Status?.minus ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                            </tbody>
                        </table>
                    </div>
                     <div class="table-responsive">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-lk-${indexSuffix}">
                             <caption>${tableTexts.captionLKCounts || 'Lymphknotenanzahlen (Median (Min-Max) [Mean ± SD])'}</caption>
                             <thead class="visually-hidden"><tr><th>${tableTexts.headerMetric || 'Metrik'}</th><th>${tableTexts.headerValue || 'Wert'}</th></tr></thead>
                             <tbody>
                                <tr data-tippy-content="${tooltipBase.lkAnzahlPatho?.description || 'LK N gesamt'}"><td>${tableTexts.rowLKNTotal || 'LK N gesamt'}</td><td>${fLK(d.lkAnzahlen?.n?.total)}</td></tr>
                                <tr data-tippy-content="${tooltipBase.lkAnzahlPathoPlus?.description || 'LK N+'}"><td>${tableTexts.rowLKNPositive || 'LK N+'} <sup>*</sup></td><td>${fLK(d.lkAnzahlen?.n?.plus)}</td></tr>
                                <tr data-tippy-content="${tooltipBase.lkAnzahlAS?.description || 'LK AS gesamt'}"><td>${tableTexts.rowLKASTotal || 'LK AS gesamt'}</td><td>${fLK(d.lkAnzahlen?.as?.total)}</td></tr>
                                <tr data-tippy-content="${tooltipBase.lkAnzahlASPlus?.description || 'LK AS+'}"><td>${tableTexts.rowLKASPositive || 'LK AS+'} <sup>**</sup></td><td>${fLK(d.lkAnzahlen?.as?.plus)}</td></tr>
                                <tr data-tippy-content="${tooltipBase.lkAnzahlT2?.description || 'LK T2 gesamt'}"><td>${tableTexts.rowLKT2Total || 'LK T2 gesamt'}</td><td>${fLK(d.lkAnzahlen?.t2?.total)}</td></tr>
                                <tr data-tippy-content="${tooltipBase.lkAnzahlT2Plus?.description || 'LK T2+'}"><td>${tableTexts.rowLKT2Positive || 'LK T2+'} <sup>***</sup></td><td>${fLK(d.lkAnzahlen?.t2?.plus)}</td></tr>
                             </tbody>
                        </table>
                     </div>
                    <p class="small text-muted mt-1 mb-0">${(tableTexts.footnotes || '<sup>*</sup> Nur bei N+ Patienten (n=[N_PLUS]); <sup>**</sup> Nur bei AS+ Patienten (n=[AS_PLUS]); <sup>***</sup> Nur bei T2+ Patienten (n=[T2_PLUS]).').replace('[N_PLUS]', d.nStatus?.plus ?? 0).replace('[AS_PLUS]', d.asStatus?.plus ?? 0).replace('[T2_PLUS]', d.t2Status?.plus ?? 0)}</p>
                </div>
                <div class="col-md-6 d-flex flex-column">
                    <div class="mb-2 flex-grow-1" id="${ageChartId}" style="min-height: 150px;" data-tippy-content="${(tooltipBase.chartAge?.description || 'Altersverteilung').replace('[KOLLEKTIV]', kollektivName)}">
                       <p class="text-muted small text-center p-3">${tableTexts.loadingAgeChart || 'Lade Altersverteilung...'}</p>
                    </div>
                    <div class="flex-grow-1" id="${genderChartId}" style="min-height: 150px;" data-tippy-content="${(tooltipBase.chartGender?.description || 'Geschlechterverteilung').replace('[KOLLEKTIV]', kollektivName)}">
                       <p class="text-muted small text-center p-3">${tableTexts.loadingGenderChart || 'Lade Geschlechterverteilung...'}</p>
                    </div>
                </div>
            </div>`;
        return tableHTML;
    }

    function createGueteContentHTML(stats, methode, kollektivName, lang = 'de') {
        const effectiveLang = UI_TEXTS?.kollektivDisplayNames?.[lang] ? lang : 'de';
        const noDataMsg = effectiveLang === 'de' ? 'Keine Gütedaten verfügbar.' : 'No performance data available.';
        if (!stats || !stats.matrix) return `<p class="text-muted small p-3">${noDataMsg}</p>`;

        const matrix = stats.matrix; const na = '--';
        const fCI_perf = (m, key) => { const digits = (key === 'f1' || key === 'auc') ? 3 : 1; const isPercent = !(key === 'f1' || key === 'auc'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, digits, isPercent, na, effectiveLang); };
        const tableTexts = UI_TEXTS.statistikTab?.guete?.table?.[effectiveLang] || UI_TEXTS.statistikTab?.guete?.table?.de || {};

        let matrixHTML = `<h6 class="px-2 pt-2">${(tableTexts.confusionMatrixTitle || 'Konfusionsmatrix ({METHODE} vs. N)').replace('{METHODE}', methode)}</h6><table class="table table-sm table-bordered text-center small mx-2 mb-3" style="width: auto;" id="table-guete-matrix-${methode}-${kollektivName.replace(/\s+/g, '_')}"><thead class="small"><tr><th></th><th>${tableTexts.headerNPathoPositive || 'N+ (Patho)'}</th><th>${tableTexts.headerNPathoNegative || 'N- (Patho)'}</th></tr></thead><tbody><tr><td class="fw-bold">${methode}+</td><td data-tippy-content="${(tableTexts.tooltipTP || 'Richtig Positiv (RP): {METHODE}+ und N+').replace('{METHODE}', methode)}">${formatNumber(matrix.rp,0,na,false,effectiveLang)}</td><td data-tippy-content="${(tableTexts.tooltipFP || 'Falsch Positiv (FP): {METHODE}+ aber N-').replace('{METHODE}', methode)}">${formatNumber(matrix.fp,0,na,false,effectiveLang)}</td></tr><tr><td class="fw-bold">${methode}-</td><td data-tippy-content="${(tableTexts.tooltipFN || 'Falsch Negativ (FN): {METHODE}- aber N+').replace('{METHODE}', methode)}">${formatNumber(matrix.fn,0,na,false,effectiveLang)}</td><td data-tippy-content="${(tableTexts.tooltipTN || 'Richtig Negativ (RN): {METHODE}- und N-').replace('{METHODE}', methode)}">${formatNumber(matrix.rn,0,na,false,effectiveLang)}</td></tr></tbody></table>`;
        let metricsHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-guete-metrics-${methode}-${kollektivName.replace(/\s+/g, '_')}"><caption>${tableTexts.captionDiagnosticMetrics || 'Diagnostische Gütekriterien'}</caption><thead><tr><th>${tableTexts.headerMetric || 'Metrik'}</th><th>${tableTexts.headerValueCI || 'Wert (95% CI)'}</th><th>${tableTexts.headerCIMethod || 'CI Methode'}</th></tr></thead><tbody>`;
        const metricRows = [
            {key: 'sens', name: tableTexts.rowSens || 'Sensitivität'}, {key: 'spez', name: tableTexts.rowSpez || 'Spezifität'}, {key: 'ppv', name: tableTexts.rowPPV || 'PPV'},
            {key: 'npv', name: tableTexts.rowNPV || 'NPV'}, {key: 'acc', name: tableTexts.rowAcc || 'Accuracy'}, {key: 'balAcc', name: tableTexts.rowBalAcc || 'Balanced Accuracy'},
            {key: 'f1', name: tableTexts.rowF1 || 'F1-Score'}, {key: 'auc', name: tableTexts.rowAUC || 'AUC (Bal. Acc.)'}
        ];
        metricRows.forEach(row => {
            metricsHTML += `<tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML(row.key, methode, effectiveLang)}">${row.name}</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML(row.key, stats[row.key], methode, kollektivName, effectiveLang)}">${fCI_perf(stats[row.key], row.key)}</td><td>${stats[row.key]?.method || na}</td></tr>`;
        });
        metricsHTML += `</tbody></table></div>`;
        return matrixHTML + metricsHTML;
    }

    function createVergleichContentHTML(stats, kollektivName, t2ShortName = 'T2', lang = 'de') {
        const effectiveLang = UI_TEXTS?.kollektivDisplayNames?.[lang] ? lang : 'de';
        const noDataMsg = effectiveLang === 'de' ? 'Keine Vergleichsdaten verfügbar.' : 'No comparison data available.';
        if (!stats) return `<p class="text-muted small p-3">${noDataMsg}</p>`;

        const na = '--'; const fP = (pVal) => getPValueText(pVal, effectiveLang);
        const tableTexts = UI_TEXTS.statistikTab?.vergleichASvsT2?.table?.[effectiveLang] || UI_TEXTS.statistikTab?.vergleichASvsT2?.table?.de || {};

        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}"><thead><tr><th>${tableTexts.headerTest || 'Test'}</th><th>${tableTexts.headerStatistic || 'Statistik'}</th><th>${tableTexts.headerPValue || 'p-Wert'}</th><th>${tableTexts.headerMethod || 'Methode'}</th></tr></thead><tbody>
            <tr><td data-tippy-content="${ui_helpers.getTestDescriptionHTML('mcnemar', t2ShortName, effectiveLang)}">${tableTexts.rowMcNemar || 'McNemar (Accuracy)'}</td><td>${formatNumber(stats.mcnemar?.statistic, 3, na, false, effectiveLang)} (df=${stats.mcnemar?.df || na})</td><td data-tippy-content="${ui_helpers.getTestInterpretationHTML('mcnemar', stats.mcnemar, kollektivName, t2ShortName, effectiveLang)}">${fP(stats.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(stats.mcnemar?.pValue)}</td><td>${stats.mcnemar?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getTestDescriptionHTML('delong', t2ShortName, effectiveLang)}">${tableTexts.rowDeLong || 'DeLong (AUC)'}</td><td>Z=${formatNumber(stats.delong?.Z, 3, na, false, effectiveLang)}</td><td data-tippy-content="${ui_helpers.getTestInterpretationHTML('delong', stats.delong, kollektivName, t2ShortName, effectiveLang)}">${fP(stats.delong?.pValue)} ${getStatisticalSignificanceSymbol(stats.delong?.pValue)}</td><td>${stats.delong?.method || na}</td></tr>
        </tbody></table></div>`;
        return tableHTML;
    }

    function createAssoziationContentHTML(stats, kollektivName, criteria, lang = 'de') {
        const effectiveLang = UI_TEXTS?.kollektivDisplayNames?.[lang] ? lang : 'de';
        const noDataMsg = effectiveLang === 'de' ? 'Keine Assoziationsdaten verfügbar.' : 'No association data available.';
        if (!stats || Object.keys(stats).length === 0) return `<p class="text-muted small p-3">${noDataMsg}</p>`;

        const na = '--'; const fP = (pVal) => getPValueText(pVal, effectiveLang);
        const tableTexts = UI_TEXTS.statistikTab?.assoziation?.table?.[effectiveLang] || UI_TEXTS.statistikTab?.assoziation?.table?.de || {};

        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-assoziation-${kollektivName.replace(/\s+/g, '_')}"><caption>${tableTexts.caption || 'Assoziation zwischen Merkmalen und N-Status (+/-)'}</caption><thead><tr><th>${tableTexts.headerFeature || 'Merkmal'}</th><th>${tableTexts.headerOR || 'OR (95% CI)'}</th><th>${tableTexts.headerRD || 'RD (%) (95% CI)'}</th><th>${tableTexts.headerPhi || 'Phi (φ)'}</th><th>${tableTexts.headerPValue || 'p-Wert'}</th><th>${tableTexts.headerTest || 'Test'}</th></tr></thead><tbody>`;

        const getPValueInterpretationAssoc = (key, assocObj) => {
             const testName = assocObj?.testName || '';
             const pTooltipKey = testName.includes("Fisher") ? 'fisher' : (testName.includes("Mann-Whitney") ? 'mannwhitney' : (key === 'size_mwu' ? 'mannwhitney' : 'defaultP'));
             const merkmalName = assocObj?.featureName || key;
             return ui_helpers.getAssociationInterpretationHTML(pTooltipKey, assocObj, merkmalName, kollektivName, effectiveLang);
        };
        const getTestDescriptionAssoc = (assocObj) => {
             const testName = assocObj?.testName || '';
             const pTooltipKey = testName.includes("Fisher") ? 'fisher' : (testName.includes("Mann-Whitney") ? 'mannwhitney' : 'defaultP');
             const merkmalName = assocObj?.featureName || '';
             const desc = TOOLTIP_CONTENT?.[effectiveLang]?.statMetrics?.[pTooltipKey]?.description || TOOLTIP_CONTENT?.de?.statMetrics?.[pTooltipKey]?.description || '';
             return desc.replace('[MERKMAL]', `'${merkmalName}'`).replace('[VARIABLE]', `'${merkmalName}'`);
        };
        const getMerkmalDescriptionHTMLAssoc = (key, assocObj) => {
             const baseName = TOOLTIP_CONTENT?.[effectiveLang]?.statMetrics?.[key]?.name || TOOLTIP_CONTENT?.de?.statMetrics?.[key]?.name || assocObj?.featureName || key;
             return `${tableTexts.featureTooltipPrefix || 'Merkmal'}: ${baseName}`;
        };

        const addRow = (key, assocObj, isActive = true) => {
            if (!assocObj) return '';
            const merkmalName = assocObj.featureName || key;
            const orStr = formatCI(assocObj.or?.value, assocObj.or?.ci?.lower, assocObj.or?.ci?.upper, 2, false, na, effectiveLang);
            const rdValPerc = formatNumber(assocObj.rd?.value !== null && !isNaN(assocObj.rd?.value) ? assocObj.rd.value * 100 : NaN, 1, na, false, effectiveLang);
            const rdCILowerPerc = formatNumber(assocObj.rd?.ci?.lower !== null && !isNaN(assocObj.rd?.ci?.lower) ? assocObj.rd.ci.lower * 100 : NaN, 1, na, false, effectiveLang);
            const rdCIUpperPerc = formatNumber(assocObj.rd?.ci?.upper !== null && !isNaN(assocObj.rd?.ci?.upper) ? assocObj.rd.ci.upper * 100 : NaN, 1, na, false, effectiveLang);
            const rdStr = rdValPerc !== na ? `${rdValPerc}% (${rdCILowerPerc}% - ${rdCIUpperPerc}%)` : na;
            const phiStr = formatNumber(assocObj.phi?.value, 2, na, false, effectiveLang);
            const pStr = fP(assocObj.pValue);
            const sigSymbol = getStatisticalSignificanceSymbol(assocObj.pValue);
            const testName = assocObj.testName || na;
            const aktivText = isActive ? '' : ` <small class="text-muted">(${(tableTexts.inactiveLabel || 'inaktiv')})</small>`;

            return `<tr>
                <td data-tippy-content="${getMerkmalDescriptionHTMLAssoc(key, assocObj)}">${merkmalName}${aktivText}</td>
                <td data-tippy-content="${ui_helpers.getAssociationInterpretationHTML('or', assocObj, merkmalName, kollektivName, effectiveLang)}">${orStr}</td>
                <td data-tippy-content="${ui_helpers.getAssociationInterpretationHTML('rd', assocObj, merkmalName, kollektivName, effectiveLang)}">${rdStr}</td>
                <td data-tippy-content="${ui_helpers.getAssociationInterpretationHTML('phi', assocObj, merkmalName, kollektivName, effectiveLang)}">${phiStr}</td>
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
            const descTooltip = effectiveLang === 'de' ? "Vergleich der medianen Lymphknotengröße zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test." : "Comparison of median lymph node size between N+ and N- patients using Mann-Whitney U test.";
            const testDescTooltip = getTestDescriptionAssoc(mwuObj);
            tableHTML += `<tr>
                <td data-tippy-content="${descTooltip}">${mwuObj.featureName || (effectiveLang === 'de' ? 'LK Größe (Median Vgl.)' : 'LN Size (Median Comp.)')}</td>
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

    function createVergleichKollektiveContentHTML(stats, kollektiv1Name, kollektiv2Name, lang = 'de') {
        const effectiveLang = UI_TEXTS?.kollektivDisplayNames?.[lang] ? lang : 'de';
        const noDataMsg = effectiveLang === 'de' ? 'Keine Kollektiv-Vergleichsdaten verfügbar.' : 'No cohort comparison data available.';
        if (!stats || !stats.accuracyComparison || !stats.aucComparison) return `<p class="text-muted small p-3">${noDataMsg}</p>`;

        const na = '--'; const fP = (pVal) => getPValueText(pVal, effectiveLang);
        const kollektiv1Display = getKollektivDisplayName(kollektiv1Name, effectiveLang); const kollektiv2Display = getKollektivDisplayName(kollektiv2Name, effectiveLang);
        const accAS = stats.accuracyComparison?.as; const accT2 = stats.accuracyComparison?.t2;
        const aucAS = stats.aucComparison?.as; const aucT2 = stats.aucComparison?.t2;
        const tableTexts = UI_TEXTS.statistikTab?.vergleichKollektive?.table?.[effectiveLang] || UI_TEXTS.statistikTab?.vergleichKollektive?.table?.de || {};


        const getPValueInterpretationComp = (pValue, testKey, methode) => {
             const interpretationTemplate = TOOLTIP_CONTENT?.[effectiveLang]?.statMetrics?.[testKey]?.interpretation || TOOLTIP_CONTENT?.de?.statMetrics?.[testKey]?.interpretation || (effectiveLang === 'de' ? 'Keine Interpretation verfügbar.' : 'No interpretation available.');
             const pStrVal = (pValue !== null && !isNaN(pValue)) ? (pValue < 0.001 ? (effectiveLang === 'de' ? '<0,001' : '<.001') : formatNumber(pValue, 3, na, false, effectiveLang)) : na;
             const sigText = getStatisticalSignificanceText(pValue, APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, effectiveLang);
             return interpretationTemplate
                 .replace(/\[METHODE\]/g, methode)
                 .replace(/\[KOLLEKTIV1\]/g, `<strong>${kollektiv1Display}</strong>`)
                 .replace(/\[KOLLEKTIV2\]/g, `<strong>${kollektiv2Display}</strong>`)
                 .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                 .replace(/\[P_WERT\]/g, `<strong>${pStrVal}</strong>`);
        };

        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-kollektive-${kollektiv1Name.replace(/\s+/g, '_')}-vs-${kollektiv2Name.replace(/\s+/g, '_')}"><thead><tr><th>${tableTexts.headerComparison || 'Vergleich'}</th><th>${tableTexts.headerMethod || 'Methode'}</th><th>${tableTexts.headerPValue || 'p-Wert'}</th><th>${tableTexts.headerTest || 'Test'}</th></tr></thead><tbody>`;
        tableHTML += `<tr><td>${tableTexts.rowAccuracy || 'Accuracy'}</td><td>AS</td><td data-tippy-content="${getPValueInterpretationComp(accAS?.pValue, 'accComp', 'AS')}">${fP(accAS?.pValue)} ${getStatisticalSignificanceSymbol(accAS?.pValue)}</td><td data-tippy-content="${(TOOLTIP_CONTENT?.[effectiveLang]?.statMetrics?.accComp?.description || TOOLTIP_CONTENT?.de?.statMetrics?.accComp?.description || '').replace('[METHODE]','AS')}">${accAS?.testName || na}</td></tr>`;
        tableHTML += `<tr><td>${tableTexts.rowAccuracy || 'Accuracy'}</td><td>T2</td><td data-tippy-content="${getPValueInterpretationComp(accT2?.pValue, 'accComp', 'T2')}">${fP(accT2?.pValue)} ${getStatisticalSignificanceSymbol(accT2?.pValue)}</td><td data-tippy-content="${(TOOLTIP_CONTENT?.[effectiveLang]?.statMetrics?.accComp?.description || TOOLTIP_CONTENT?.de?.statMetrics?.accComp?.description || '').replace('[METHODE]','T2')}">${accT2?.testName || na}</td></tr>`;
        tableHTML += `<tr><td>AUC</td><td>AS</td><td data-tippy-content="${getPValueInterpretationComp(aucAS?.pValue, 'aucComp', 'AS')}">${fP(aucAS?.pValue)} ${getStatisticalSignificanceSymbol(aucAS?.pValue)} (Diff: ${formatNumber(aucAS?.diffAUC, 3, na, false, effectiveLang)}, Z=${formatNumber(aucAS?.Z, 2, na, false, effectiveLang)})</td><td data-tippy-content="${(TOOLTIP_CONTENT?.[effectiveLang]?.statMetrics?.aucComp?.description || TOOLTIP_CONTENT?.de?.statMetrics?.aucComp?.description || '').replace('[METHODE]','AS')}">${aucAS?.method || na}</td></tr>`;
        tableHTML += `<tr><td>AUC</td><td>T2</td><td data-tippy-content="${getPValueInterpretationComp(aucT2?.pValue, 'aucComp', 'T2')}">${fP(aucT2?.pValue)} ${getStatisticalSignificanceSymbol(aucT2?.pValue)} (Diff: ${formatNumber(aucT2?.diffAUC, 3, na, false, effectiveLang)}, Z=${formatNumber(aucT2?.Z, 2, na, false, effectiveLang)})</td><td data-tippy-content="${(TOOLTIP_CONTENT?.[effectiveLang]?.statMetrics?.aucComp?.description || TOOLTIP_CONTENT?.de?.statMetrics?.aucComp?.description || '').replace('[METHODE]','T2')}">${aucT2?.method || na}</td></tr>`;
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function createCriteriaComparisonTableHTML(results, kollektivName, lang = 'de') {
        const effectiveLang = UI_TEXTS?.kollektivDisplayNames?.[lang] ? lang : 'de';
        const noDataMsg = effectiveLang === 'de' ? 'Keine Daten für Kriterienvergleich verfügbar.' : 'No data available for criteria comparison.';
        if (!Array.isArray(results) || results.length === 0) return `<p class="text-muted small p-3">${noDataMsg}</p>`;

        const tc = TOOLTIP_CONTENT?.[effectiveLang]?.criteriaComparisonTable || TOOLTIP_CONTENT?.de?.criteriaComparisonTable || {};
        const tableHeaders = UI_TEXTS.statistikTab?.criteriaComparison?.tableHeaders?.[effectiveLang] || UI_TEXTS.statistikTab?.criteriaComparison?.tableHeaders?.de || {};

        const headers = [
             { key: 'set', label: tableHeaders.set || "Methode / Kriteriensatz", tooltip: tc.tableHeaderSet || null },
             { key: 'sens', label: tableHeaders.sens || "Sens.", tooltip: ui_helpers.getMetricDescriptionHTML('sens', (effectiveLang==='de'?'Ausgewählte Methode':'Selected Method'), effectiveLang) },
             { key: 'spez', label: tableHeaders.spez || "Spez.", tooltip: ui_helpers.getMetricDescriptionHTML('spez', (effectiveLang==='de'?'Ausgewählte Methode':'Selected Method'), effectiveLang) },
             { key: 'ppv', label: tableHeaders.ppv || "PPV", tooltip: ui_helpers.getMetricDescriptionHTML('ppv', (effectiveLang==='de'?'Ausgewählte Methode':'Selected Method'), effectiveLang) },
             { key: 'npv', label: tableHeaders.npv || "NPV", tooltip: ui_helpers.getMetricDescriptionHTML('npv', (effectiveLang==='de'?'Ausgewählte Methode':'Selected Method'), effectiveLang) },
             { key: 'acc', label: tableHeaders.acc || "Acc.", tooltip: ui_helpers.getMetricDescriptionHTML('acc', (effectiveLang==='de'?'Ausgewählte Methode':'Selected Method'), effectiveLang) },
             { key: 'auc', label: tableHeaders.auc || "AUC/BalAcc", tooltip: ui_helpers.getMetricDescriptionHTML('auc', (effectiveLang==='de'?'Ausgewählte Methode':'Selected Method'), effectiveLang) }
         ];
         const tableId = "table-kriterien-vergleich";
         const captionText = (tableHeaders.caption || 'Vergleich verschiedener Kriteriensätze (vs. N) für Kollektiv: {KOLLEKTIV_NAME}').replace('{KOLLEKTIV_NAME}', kollektivName);
         let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped table-hover small caption-top" id="${tableId}"><caption>${captionText}</caption><thead class="small"><tr>`;
         headers.forEach(h => {
            const tooltipAttr = h.tooltip ? `data-tippy-content="${h.tooltip}"` : '';
            tableHTML += `<th ${tooltipAttr}>${h.label}</th>`;
         });
         tableHTML += `</tr></thead><tbody>`;
         results.forEach(result => {
             const isApplied = result.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID; const isAS = result.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID; const rowClass = isApplied ? 'table-primary' : (isAS ? 'table-info' : '');
             let nameDisplay = getKollektivDisplayName(result.name, effectiveLang);
             if (isApplied) nameDisplay = getKollektivDisplayName(APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, effectiveLang);
             else if (isAS) nameDisplay = getKollektivDisplayName(APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID, effectiveLang);

             const tooltipSens = ui_helpers.getMetricInterpretationHTML('sens', { value: result.sens }, nameDisplay, kollektivName, effectiveLang);
             const tooltipSpez = ui_helpers.getMetricInterpretationHTML('spez', { value: result.spez }, nameDisplay, kollektivName, effectiveLang);
             const tooltipPPV = ui_helpers.getMetricInterpretationHTML('ppv', { value: result.ppv }, nameDisplay, kollektivName, effectiveLang);
             const tooltipNPV = ui_helpers.getMetricInterpretationHTML('npv', { value: result.npv }, nameDisplay, kollektivName, effectiveLang);
             const tooltipAcc = ui_helpers.getMetricInterpretationHTML('acc', { value: result.acc }, nameDisplay, kollektivName, effectiveLang);
             const tooltipAUC = ui_helpers.getMetricInterpretationHTML('auc', { value: result.auc }, nameDisplay, kollektivName, effectiveLang);

             tableHTML += `<tr class="${rowClass}"><td class="fw-bold">${nameDisplay}</td><td data-tippy-content="${tooltipSens}">${formatPercent(result.sens, 1, '--%', effectiveLang)}</td><td data-tippy-content="${tooltipSpez}">${formatPercent(result.spez, 1, '--%', effectiveLang)}</td><td data-tippy-content="${tooltipPPV}">${formatPercent(result.ppv, 1, '--%', effectiveLang)}</td><td data-tippy-content="${tooltipNPV}">${formatPercent(result.npv, 1, '--%', effectiveLang)}</td><td data-tippy-content="${tooltipAcc}">${formatPercent(result.acc, 1, '--%', effectiveLang)}</td><td data-tippy-content="${tooltipAUC}">${formatNumber(result.auc, 3, '--', false, effectiveLang)}</td></tr>`;
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
