const statistikTabLogic = (() => {

    function createDeskriptiveStatistikContentHTML(stats, indexSuffix = '0', kollektivName = '') {
        if (!stats || !stats.deskriptiv || !stats.deskriptiv.anzahlPatienten) return '<p class="text-muted small p-3">Keine deskriptiven Daten verfügbar.</p>';
        const d = stats.deskriptiv;
        const total = d.anzahlPatienten;
        const na = '--';
        const fv = (val, dig = 1) => utils.formatNumber(val, dig, na);
        const fP = (val, dig = 1) => utils.formatPercent(val, dig, na);
        const fLK = (lkData) => `${fv(lkData?.median,1)} (${fv(lkData?.min,0)}–${fv(lkData?.max,0)})`;
        const ageChartId = `chart-stat-age-${indexSuffix}`;
        const genderChartId = `chart-stat-gender-${indexSuffix}`;
        const displayKollektivName = utils.getKollektivDisplayName(kollektivName);

        return `
            <div class="row g-3 p-2">
                <div class="col-md-6">
                    <div class="table-responsive mb-3">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-demographie-${indexSuffix}">
                            <caption>Demographie & Status (N=${total})</caption>
                            <thead class="visually-hidden"><tr><th>Metrik</th><th>Wert</th></tr></thead>
                            <tbody>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.alter.description}"><td>Alter Median (Min–Max) [Jahre]</td><td>${fv(d.alter?.median, 1)} (${fv(d.alter?.min, 0)}–${fv(d.alter?.max, 0)})</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.geschlecht.description}"><td>Geschlecht (m / w) [n (%)]</td><td>${d.geschlecht?.m ?? 0} / ${d.geschlecht?.f ?? 0} (${fP((d.geschlecht?.m ?? 0) / total, 1)} / ${fP((d.geschlecht?.f ?? 0) / total, 1)})</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.datenTable.therapie}"><td>Therapie (direkt OP / nRCT) [n (%)]</td><td>${d.therapie?.['direkt OP'] ?? 0} / ${d.therapie?.nRCT ?? 0} (${fP((d.therapie?.['direkt OP'] ?? 0) / total, 1)} / ${fP((d.therapie?.nRCT ?? 0) / total, 1)})</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.nStatus.description}"><td>N-Status (+ / -) [n (%)]</td><td>${d.nStatus?.plus ?? 0} / ${d.nStatus?.minus ?? 0} (${fP((d.nStatus?.plus ?? 0) / total, 1)} / ${fP((d.nStatus?.minus ?? 0) / total, 1)})</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.asStatus.description}"><td>AS-Status (+ / -) [n (%)]</td><td>${d.asStatus?.plus ?? 0} / ${d.asStatus?.minus ?? 0} (${fP((d.asStatus?.plus ?? 0) / total, 1)} / ${fP((d.asStatus?.minus ?? 0) / total, 1)})</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.t2Status.description}"><td>T2-Status (+ / -) [n (%)]</td><td>${d.t2Status?.plus ?? 0} / ${d.t2Status?.minus ?? 0} (${fP((d.t2Status?.plus ?? 0) / total, 1)} / ${fP((d.t2Status?.minus ?? 0) / total, 1)})</td></tr>
                            </tbody>
                        </table>
                    </div>
                     <div class="table-responsive">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-lk-${indexSuffix}">
                             <caption>Lymphknotenanzahlen (Median (Min–Max))</caption>
                             <thead class="visually-hidden"><tr><th>Metrik</th><th>Wert</th></tr></thead>
                             <tbody>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlPatho.description}"><td>LK N gesamt</td><td>${fLK(d.lkAnzahlen?.n?.total)}</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlPathoPlus.description.replace('(n=0)', `(n=${d.nStatus?.plus ?? 0})`)}"><td>LK N+ <sup>*</sup></td><td>${fLK(d.lkAnzahlen?.n?.plus)}</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlAS.description}"><td>LK AS gesamt</td><td>${fLK(d.lkAnzahlen?.as?.total)}</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlASPlus.description.replace('(n=0)', `(n=${d.asStatus?.plus ?? 0})`)}"><td>LK AS+ <sup>**</sup></td><td>${fLK(d.lkAnzahlen?.as?.plus)}</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlT2.description}"><td>LK T2 gesamt</td><td>${fLK(d.lkAnzahlen?.t2?.total)}</td></tr>
                                <tr data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlT2Plus.description.replace('(n=0)', `(n=${d.t2Status?.plus ?? 0})`)}"><td>LK T2+ <sup>***</sup></td><td>${fLK(d.lkAnzahlen?.t2?.plus)}</td></tr>
                             </tbody>
                        </table>
                     </div>
                    <p class="small text-muted mt-1 mb-0"><sup>*</sup> Nur bei N+ Patienten (n=${d.nStatus?.plus ?? 0}); <sup>**</sup> Nur bei AS+ Patienten (n=${d.asStatus?.plus ?? 0}); <sup>***</sup> Nur bei T2+ Patienten (n=${d.t2Status?.plus ?? 0}).</p>
                </div>
                <div class="col-md-6 d-flex flex-column">
                    <div class="mb-2 flex-grow-1" id="${ageChartId}" data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.chartAge.description.replace('[KOLLEKTIV]', `<strong>${displayKollektivName}</strong>`)}"></div>
                    <div class="flex-grow-1" id="${genderChartId}" data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.chartGender.description.replace('[KOLLEKTIV]', `<strong>${displayKollektivName}</strong>`)}"></div>
                </div>
            </div>`;
    }

    function createGueteContentHTML(stats, methode, kollektivName) {
        if (!stats || !stats.matrix) return '<p class="text-muted small p-3">Keine Gütedaten verfügbar.</p>';
        const matrix = stats.matrix; const na = '--';
        const displayKollektivName = utils.getKollektivDisplayName(kollektivName);
        const fCI_perf = (m, key) => utils.formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, (key === 'f1' || key === 'auc') ? 3 : 1, !(key === 'f1' || key === 'auc'), na);
        
        const matrixHTML = `<h6 class="px-2 pt-2">Konfusionsmatrix (${methode} vs. N)</h6>
            <table class="table table-sm table-bordered text-center small mx-2 mb-3" style="width: auto;" id="table-guete-matrix-${methode}-${kollektivName.replace(/\s+/g, '_')}">
            <thead><tr><th></th><th>N+</th><th>N-</th></tr></thead>
            <tbody>
                <tr><td class="fw-bold">${methode}+</td><td data-tippy-content="Richtig Positiv (RP)">${utils.formatNumber(matrix.rp,0,na)}</td><td data-tippy-content="Falsch Positiv (FP)">${utils.formatNumber(matrix.fp,0,na)}</td></tr>
                <tr><td class="fw-bold">${methode}-</td><td data-tippy-content="Falsch Negativ (FN)">${utils.formatNumber(matrix.fn,0,na)}</td><td data-tippy-content="Richtig Negativ (RN)">${utils.formatNumber(matrix.rn,0,na)}</td></tr>
            </tbody></table>`;
        
        const metricsHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-guete-metrics-${methode}-${kollektivName.replace(/\s+/g, '_')}">
            <caption>Diagnostische Güte für ${methode} (Kollektiv: ${displayKollektivName})</caption>
            <thead><tr><th>Metrik</th><th>Wert (95%-KI)</th><th>CI Methode</th></tr></thead>
            <tbody>
                <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('sens', methode)}">Sensitivität</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('sens', stats.sens, methode, displayKollektivName)}">${fCI_perf(stats.sens, 'sens')}</td><td>${stats.sens?.method || na}</td></tr>
                <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('spez', methode)}">Spezifität</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('spez', stats.spez, methode, displayKollektivName)}">${fCI_perf(stats.spez, 'spez')}</td><td>${stats.spez?.method || na}</td></tr>
                <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('ppv', methode)}">PPV</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('ppv', stats.ppv, methode, displayKollektivName)}">${fCI_perf(stats.ppv, 'ppv')}</td><td>${stats.ppv?.method || na}</td></tr>
                <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('npv', methode)}">NPV</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('npv', stats.npv, methode, displayKollektivName)}">${fCI_perf(stats.npv, 'npv')}</td><td>${stats.npv?.method || na}</td></tr>
                <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('acc', methode)}">Accuracy</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('acc', stats.acc, methode, displayKollektivName)}">${fCI_perf(stats.acc, 'acc')}</td><td>${stats.acc?.method || na}</td></tr>
                <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('balAcc', methode)}">Balanced Accuracy</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('balAcc', stats.balAcc, methode, displayKollektivName)}">${fCI_perf(stats.balAcc, 'balAcc')}</td><td>${stats.balAcc?.method || na}</td></tr>
                <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('f1', methode)}">F1-Score</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('f1', stats.f1, methode, displayKollektivName)}">${fCI_perf(stats.f1, 'f1')}</td><td>${stats.f1?.method || na}</td></tr>
                <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('auc', methode)}">AUC (Bal. Acc.)</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('auc', stats.auc, methode, displayKollektivName)}">${fCI_perf(stats.auc, 'auc')}</td><td>${stats.auc?.method || na}</td></tr>
            </tbody></table></div>`;
        return matrixHTML + metricsHTML;
    }

    function createVergleichContentHTML(stats, kollektivName, t2ShortName = 'T2') {
        if (!stats) return '<p class="text-muted small p-3">Keine Vergleichsdaten verfügbar.</p>';
        const na = '--';
        const displayKollektivName = utils.getKollektivDisplayName(kollektivName);
        return `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}">
            <caption>Stat. Vergleich AS vs. ${t2ShortName} (Kollektiv: ${displayKollektivName})</caption>
            <thead><tr><th>Test</th><th>Statistik</th><th>p-Wert</th><th>Methode</th></tr></thead>
            <tbody>
                <tr><td data-tippy-content="${ui_helpers.getTestDescriptionHTML('mcnemar', t2ShortName)}">McNemar (Accuracy)</td><td>${utils.formatNumber(stats.mcnemar?.statistic, 3, na, true)} (df=${stats.mcnemar?.df || na})</td><td data-tippy-content="${ui_helpers.getTestInterpretationHTML('mcnemar', stats.mcnemar, displayKollektivName, t2ShortName)}">${utils.getPValueText(stats.mcnemar?.pValue)} ${utils.getStatisticalSignificanceSymbol(stats.mcnemar?.pValue)}</td><td>${stats.mcnemar?.method || na}</td></tr>
                <tr><td data-tippy-content="${ui_helpers.getTestDescriptionHTML('delong', t2ShortName)}">DeLong (AUC)</td><td>Z=${utils.formatNumber(stats.delong?.Z, 3, na, true)}</td><td data-tippy-content="${ui_helpers.getTestInterpretationHTML('delong', stats.delong, displayKollektivName, t2ShortName)}">${utils.getPValueText(stats.delong?.pValue)} ${utils.getStatisticalSignificanceSymbol(stats.delong?.pValue)}</td><td>${stats.delong?.method || na}</td></tr>
            </tbody></table></div>`;
    }

    function createAssoziationContentHTML(stats, kollektivName, criteria) {
        if (!stats || Object.keys(stats).length === 0) return '<p class="text-muted small p-3">Keine Assoziationsdaten verfügbar.</p>';
        const na = '--';
        const displayKollektivName = utils.getKollektivDisplayName(kollektivName);
        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-assoziation-${kollektivName.replace(/\s+/g, '_')}">
            <caption>Assoziation zwischen Merkmalen und N-Status (+/-) für Kollektiv ${displayKollektivName}</caption>
            <thead><tr><th>Merkmal</th><th>OR (95%-KI)</th><th>Phi (φ)</th><th>p-Wert</th><th>Test</th></tr></thead><tbody>`;

        const addRow = (key, assocObj, isActive = true) => {
            if (!assocObj) return '';
            const orStr = utils.formatCI(assocObj.or?.value, assocObj.or?.ci?.lower, assocObj.or?.ci?.upper, 2, false, na);
            const phiStr = utils.formatNumber(assocObj.phi?.value, 2, na, true);
            const pStr = utils.getPValueText(assocObj.pValue);
            const sigSymbol = utils.getStatisticalSignificanceSymbol(assocObj.pValue);
            const aktivText = isActive ? '' : ' <small class="text-muted">(inaktiv)</small>';
            return `<tr>
                <td data-tippy-content="${ui_helpers.getAssociationInterpretationHTML(key, assocObj, assocObj.featureName, displayKollektivName)}">${assocObj.featureName}${aktivText}</td>
                <td data-tippy-content="${ui_helpers.getAssociationInterpretationHTML('or', assocObj, assocObj.featureName, displayKollektivName)}">${orStr}</td>
                <td data-tippy-content="${ui_helpers.getAssociationInterpretationHTML('phi', assocObj, assocObj.featureName, displayKollektivName)}">${phiStr}</td>
                <td data-tippy-content="${ui_helpers.getAssociationInterpretationHTML('pvalue', assocObj, assocObj.featureName, displayKollektivName)}">${pStr} ${sigSymbol}</td>
                <td data-tippy-content="${ui_helpers.getTestDescriptionHTML(assocObj.testName?.includes('Fisher') ? 'fisher' : 'default', t2ShortName)}">${assocObj.testName || na}</td>
            </tr>`;
        };

        if (stats.as) tableHTML += addRow('as', stats.as);
        if (stats.size_mwu?.testName) {
            tableHTML += `<tr>
                <td data-tippy-content="${ui_helpers.getAssociationInterpretationHTML('size_mwu', stats.size_mwu, stats.size_mwu.featureName, displayKollektivName)}">${stats.size_mwu.featureName}</td>
                <td>${na}</td><td>${na}</td>
                <td data-tippy-content="${ui_helpers.getAssociationInterpretationHTML('pvalue', stats.size_mwu, stats.size_mwu.featureName, displayKollektivName)}">${utils.getPValueText(stats.size_mwu.pValue)} ${utils.getStatisticalSignificanceSymbol(stats.size_mwu.pValue)}</td>
                <td data-tippy-content="${ui_helpers.getTestDescriptionHTML('mannwhitney')}">${stats.size_mwu.testName}</td>
            </tr>`;
        }
        ['size', 'form', 'kontur', 'homogenitaet', 'signal'].forEach(key => {
            if (stats[key]) tableHTML += addRow(key, stats[key], criteria[key]?.active);
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }
    
    function createVergleichKollektiveContentHTML(stats, kollektiv1Name, kollektiv2Name) {
        if (!stats || !stats.accuracyComparison || !stats.aucComparison) return '<p class="text-muted small p-3">Keine Kollektiv-Vergleichsdaten verfügbar.</p>';
        const na = '--';
        const kollektiv1Display = utils.getKollektivDisplayName(kollektiv1Name); 
        const kollektiv2Display = utils.getKollektivDisplayName(kollektiv2Name);
        const accAS = stats.accuracyComparison?.as; 
        const accT2 = stats.accuracyComparison?.t2;
        const aucAS = stats.aucComparison?.as; 
        const aucT2 = stats.aucComparison?.t2;

        return `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0">
            <caption>Vergleich zw. ${kollektiv1Display} und ${kollektiv2Display}</caption>
            <thead><tr><th>Vergleich</th><th>Methode</th><th>p-Wert</th><th>Test</th></tr></thead><tbody>
                <tr><td>Accuracy</td><td>AS</td><td data-tippy-content="${ui_helpers.getTestInterpretationHTML('accComp', accAS, 'AS')}">${utils.getPValueText(accAS?.pValue)} ${utils.getStatisticalSignificanceSymbol(accAS?.pValue)}</td><td>${accAS?.testName || na}</td></tr>
                <tr><td>Accuracy</td><td>T2</td><td data-tippy-content="${ui_helpers.getTestInterpretationHTML('accComp', accT2, 'T2')}">${utils.getPValueText(accT2?.pValue)} ${utils.getStatisticalSignificanceSymbol(accT2?.pValue)}</td><td>${accT2?.testName || na}</td></tr>
                <tr><td>AUC</td><td>AS</td><td data-tippy-content="${ui_helpers.getTestInterpretationHTML('aucComp', aucAS, 'AS')}">${utils.getPValueText(aucAS?.pValue)} ${utils.getStatisticalSignificanceSymbol(aucAS?.pValue)}</td><td>${aucAS?.method || na}</td></tr>
                <tr><td>AUC</td><td>T2</td><td data-tippy-content="${ui_helpers.getTestInterpretationHTML('aucComp', aucT2, 'T2')}">${utils.getPValueText(aucT2?.pValue)} ${utils.getStatisticalSignificanceSymbol(aucT2?.pValue)}</td><td>${aucT2?.method || na}</td></tr>
            </tbody></table></div>`;
    }

    function createCriteriaComparisonTableHTML(results, globalKollektivName) {
         if (!Array.isArray(results) || results.length === 0) return '<p class="text-muted small p-3">Keine Daten für Kriterienvergleich verfügbar.</p>';
         const headers = ['Methode/Kriteriensatz', 'Sens.', 'Spez.', 'PPV', 'NPV', 'Acc.', 'AUC/BalAcc'];
         let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped table-hover small caption-top">
            <caption>Vergleich für globales Kollektiv: ${utils.getKollektivDisplayName(globalKollektivName)}</caption>
            <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
         results.forEach(result => {
             const rowClass = result.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID ? 'table-primary' : (result.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID ? 'table-info' : '');
             tableHTML += `<tr class="${rowClass}">
                             <td class="fw-bold">${result.name}</td>
                             <td>${utils.formatPercent(result.sens, 1)}</td>
                             <td>${utils.formatPercent(result.spez, 1)}</td>
                             <td>${utils.formatPercent(result.ppv, 1)}</td>
                             <td>${utils.formatPercent(result.npv, 1)}</td>
                             <td>${utils.formatPercent(result.acc, 1)}</td>
                             <td>${utils.formatNumber(result.auc, 3, '--', true)}</td>
                           </tr>`;
         });
         tableHTML += `</tbody></table></div>`;
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
