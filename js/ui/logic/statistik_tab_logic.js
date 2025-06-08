const statistikTabLogic = (() => {

    function createDeskriptiveStatistikContentHTML(stats, indexSuffix = '0', kollektivName = '') {
        if (!stats || !stats.deskriptiv || !stats.deskriptiv.anzahlPatienten) return '<p class="text-muted small p-3">Keine deskriptiven Daten verfügbar.</p>';
        const d = stats.deskriptiv;
        const total = d.anzahlPatienten;
        const na = '--';
        const fv = (val, dig = 1) => utils.formatNumber(val, dig, na);
        const fP = (val, dig = 1) => utils.formatPercent(val, dig, na);
        const fLK = (lkData) => `${fv(lkData?.median,1)} (${fv(lkData?.min,0)}-${fv(lkData?.max,0)})`;
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
    
    return Object.freeze({
        createDeskriptiveStatistikContentHTML,
        createGueteContentHTML,
        createVergleichContentHTML
    });

})();
