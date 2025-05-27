const statistikTabLogic = (() => {

    function createDeskriptiveStatistikContentHTML(stats, indexSuffix = '0', kollektivName = '') {
        if (!stats || !stats.deskriptiv || !stats.deskriptiv.anzahlPatienten) return '<p class="text-muted small p-3">Keine deskriptiven Daten verfügbar.</p>';
        const total = stats.deskriptiv.anzahlPatienten;
        const na = '--';
        const fv = (val, dig = 1, useStd = false) => formatNumber(val, dig, na, useStd);
        const fP = (val, dig = 1) => formatPercent(val, dig, na);
        const fLK = (lkData) => `${fv(lkData?.median,1)} (${fv(lkData?.min,0)}-${fv(lkData?.max,0)}) [${fv(lkData?.mean,1)} ± ${fv(lkData?.sd,1)}]`;
        const d = stats.deskriptiv;
        const ageChartId = `chart-stat-age-${indexSuffix}`;
        const genderChartId = `chart-stat-gender-${indexSuffix}`;
        const displayKollektivName = getKollektivDisplayName(kollektivName);

        let tableHTML = `
            <div class="row g-3 p-2">
                <div class="col-md-6">
                    <div class="table-responsive mb-3">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-demographie-${indexSuffix}">
                            <caption>Demographie & Status (N=${total})</caption>
                            <thead class="visually-hidden"><tr><th>Metrik</th><th>Wert</th></tr></thead>
                            <tbody>
                                <tr data-tippy-content="${(TOOLTIP_CONTENT.deskriptiveStatistik.alterMedian?.description || 'Alter (Median, Min-Max, [Mittelwert ± SD])')}"><td>Alter Median (Min-Max) [Mean ± SD]</td><td>${fv(d.alter?.median, 1, lang==='en')} (${fv(d.alter?.min, 0, lang==='en')} - ${fv(d.alter?.max, 0, lang==='en')}) [${fv(d.alter?.mean, 1, lang==='en')} ± ${fv(d.alter?.sd, 1, lang==='en')}]</td></tr>
                                <tr data-tippy-content="${(TOOLTIP_CONTENT.deskriptiveStatistik.geschlecht?.description || 'Geschlechterverteilung')}"><td>Geschlecht (m / w) (n / %)</td><td>${d.geschlecht?.m ?? 0} / ${d.geschlecht?.f ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.geschlecht?.m ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.geschlecht?.f ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${(TOOLTIP_CONTENT.datenTable.therapie || 'Therapieverteilung')}"><td>Therapie (direkt OP / nRCT) (n / %)</td><td>${d.therapie?.['direkt OP'] ?? 0} / ${d.therapie?.nRCT ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.therapie?.['direkt OP'] ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.therapie?.nRCT ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${(TOOLTIP_CONTENT.deskriptiveStatistik.nStatus?.description || 'N-Status Verteilung (Pathologie)')}"><td>N Status (+ / -) (n / %)</td><td>${d.nStatus?.plus ?? 0} / ${d.nStatus?.minus ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.nStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.nStatus?.minus ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${(TOOLTIP_CONTENT.deskriptiveStatistik.asStatus?.description || 'Avocado Sign Status Verteilung')}"><td>AS Status (+ / -) (n / %)</td><td>${d.asStatus?.plus ?? 0} / ${d.asStatus?.minus ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.asStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.asStatus?.minus ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${(TOOLTIP_CONTENT.deskriptiveStatistik.t2Status?.description || 'T2-Status Verteilung (angewandte Kriterien)')}"><td>T2 Status (+ / -) (n / %)</td><td>${d.t2Status?.plus ?? 0} / ${d.t2Status?.minus ?? 0} (${fP(d.anzahlPatienten > 0 ? (d.t2Status?.plus ?? 0) / d.anzahlPatienten : NaN, 1)} / ${fP(d.anzahlPatienten > 0 ? (d.t2Status?.minus ?? 0) / d.anzahlPatienten : NaN, 1)})</td></tr>
                            </tbody>
                        </table>
                    </div>
                     <div class="table-responsive">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-lk-${indexSuffix}">
                             <caption>Lymphknotenanzahlen (Median (Min-Max) [Mean ± SD])</caption>
                             <thead class="visually-hidden"><tr><th>Metrik</th><th>Wert</th></tr></thead>
                             <tbody>
                                <tr data-tippy-content="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlPatho?.description || 'Gesamtzahl histopathologisch untersuchter Lymphknoten pro Patient.')}"><td>LK N gesamt</td><td>${fLK(d.lkAnzahlen?.n?.total)}</td></tr>
                                <tr data-tippy-content="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlPathoPlus?.description || 'Anzahl pathologisch positiver (N+) Lymphknoten pro Patient, nur bei Patienten mit N+ Status (n=' + (d.nStatus?.plus ?? 0) + ').')}"><td>LK N+ <sup>*</sup></td><td>${fLK(d.lkAnzahlen?.n?.plus)}</td></tr>
                                <tr data-tippy-content="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlAS?.description || 'Gesamtzahl im T1KM-MRT sichtbarer und bewerteter Lymphknoten pro Patient.')}"><td>LK AS gesamt</td><td>${fLK(d.lkAnzahlen?.as?.total)}</td></tr>
                                <tr data-tippy-content="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlASPlus?.description || 'Anzahl Avocado Sign positiver (AS+) Lymphknoten pro Patient, nur bei Patienten mit AS+ Status (n=' + (d.asStatus?.plus ?? 0) + ').')}"><td>LK AS+ <sup>**</sup></td><td>${fLK(d.lkAnzahlen?.as?.plus)}</td></tr>
                                <tr data-tippy-content="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlT2?.description || 'Gesamtzahl im T2-MRT sichtbarer und für die Kriterienbewertung herangezogener Lymphknoten pro Patient.')}"><td>LK T2 gesamt</td><td>${fLK(d.lkAnzahlen?.t2?.total)}</td></tr>
                                <tr data-tippy-content="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlT2Plus?.description || 'Anzahl T2-positiver Lymphknoten (gemäß aktueller Kriterien) pro Patient, nur bei Patienten mit T2+ Status (n=' + (d.t2Status?.plus ?? 0) + ').')}"><td>LK T2+ <sup>***</sup></td><td>${fLK(d.lkAnzahlen?.t2?.plus)}</td></tr>
                             </tbody>
                        </table>
                     </div>
                    <p class="small text-muted mt-1 mb-0"><sup>*</sup> Nur bei N+ Patienten (n=${d.nStatus?.plus ?? 0}); <sup>**</sup> Nur bei AS+ Patienten (n=${d.asStatus?.plus ?? 0}); <sup>***</sup> Nur bei T2+ Patienten (n=${d.t2Status?.plus ?? 0}).</p>
                </div>
                <div class="col-md-6 d-flex flex-column">
                    <div class="mb-2 flex-grow-1" id="${ageChartId}" style="min-height: 150px;" data-tippy-content="${(TOOLTIP_CONTENT.deskriptiveStatistik.chartAge?.description || 'Altersverteilung der Patienten.').replace('[KOLLEKTIV]', `<strong>${displayKollektivName}</strong>`)}">
                       <p class="text-muted small text-center p-3">Lade Altersverteilung...</p>
                    </div>
                    <div class="flex-grow-1" id="${genderChartId}" style="min-height: 150px;" data-tippy-content="${(TOOLTIP_CONTENT.deskriptiveStatistik.chartGender?.description || 'Geschlechterverteilung der Patienten.').replace('[KOLLEKTIV]', `<strong>${displayKollektivName}</strong>`)}">
                       <p class="text-muted small text-center p-3">Lade Geschlechterverteilung...</p>
                    </div>
                </div>
            </div>`;
        return tableHTML;
    }

    function createGueteContentHTML(stats, methode, kollektivName) {
        if (!stats || !stats.matrix) return '<p class="text-muted small p-3">Keine Gütedaten verfügbar.</p>';
        const matrix = stats.matrix; const na = '--';
        const displayKollektivName = getKollektivDisplayName(kollektivName);
        const fCI_perf = (m, key) => {
            const digits = (key === 'f1' || key === 'auc' || key === 'lrPlus' || key === 'lrMinus') ? 3 : 1;
            const isPercent = !(key === 'f1' || key === 'auc' || key === 'lrPlus' || key === 'lrMinus');
            return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, digits, isPercent, na);
        };
        let matrixHTML = `<h6 class="px-2 pt-2">Konfusionsmatrix (${methode} vs. N)</h6><table class="table table-sm table-bordered text-center small mx-2 mb-3" style="width: auto;" id="table-guete-matrix-${methode}-${kollektivName.replace(/\s+/g, '_')}"><thead class="small"><tr><th></th><th>N+ (Patho)</th><th>N- (Patho)</th></tr></thead><tbody><tr><td class="fw-bold">${methode}+</td><td data-tippy-content="Richtig Positiv (RP): ${methode}+ und N+. Anzahl Patienten, die von Methode ${methode} korrekt als positiv vorhergesagt wurden.">${formatNumber(matrix.rp,0,na)}</td><td data-tippy-content="Falsch Positiv (FP): ${methode}+ aber N-. Anzahl Patienten, die von Methode ${methode} fälschlicherweise als positiv vorhergesagt wurden (Typ-I-Fehler).">${formatNumber(matrix.fp,0,na)}</td></tr><tr><td class="fw-bold">${methode}-</td><td data-tippy-content="Falsch Negativ (FN): ${methode}- aber N+. Anzahl Patienten, die von Methode ${methode} fälschlicherweise als negativ vorhergesagt wurden (Typ-II-Fehler).">${formatNumber(matrix.fn,0,na)}</td><td data-tippy-content="Richtig Negativ (RN): ${methode}- und N-. Anzahl Patienten, die von Methode ${methode} korrekt als negativ vorhergesagt wurden.">${formatNumber(matrix.rn,0,na)}</td></tr></tbody></table>`;
        let metricsHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-guete-metrics-${methode}-${kollektivName.replace(/\s+/g, '_')}"><caption>Diagnostische Gütekriterien für Methode ${methode} im Kollektiv ${displayKollektivName}</caption><thead><tr><th>Metrik</th><th>Wert (95% CI)</th><th>CI Methode</th></tr></thead><tbody>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('sens', methode)}">Sensitivität</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('sens', stats.sens, methode, displayKollektivName)}">${fCI_perf(stats.sens, 'sens')}</td><td>${stats.sens?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('spez', methode)}">Spezifität</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('spez', stats.spez, methode, displayKollektivName)}">${fCI_perf(stats.spez, 'spez')}</td><td>${stats.spez?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('ppv', methode)}">PPV</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('ppv', stats.ppv, methode, displayKollektivName)}">${fCI_perf(stats.ppv, 'ppv')}</td><td>${stats.ppv?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('npv', methode)}">NPV</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('npv', stats.npv, methode, displayKollektivName)}">${fCI_perf(stats.npv, 'npv')}</td><td>${stats.npv?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('acc', methode)}">Accuracy</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('acc', stats.acc, methode, displayKollektivName)}">${fCI_perf(stats.acc, 'acc')}</td><td>${stats.acc?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('balAcc', methode)}">Balanced Accuracy</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('balAcc', stats.balAcc, methode, displayKollektivName)}">${fCI_perf(stats.balAcc, 'balAcc')}</td><td>${stats.balAcc?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('f1', methode)}">F1-Score</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('f1', stats.f1, methode, displayKollektivName)}">${fCI_perf(stats.f1, 'f1')}</td><td>${stats.f1?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('auc', methode)}">AUC (Bal. Acc.)</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('auc', stats.auc, methode, displayKollektivName)}">${fCI_perf(stats.auc, 'auc')}</td><td>${stats.auc?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('lrPlus', methode)}">LR+</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('lrPlus', stats.lrPlus, methode, displayKollektivName)}">${fCI_perf(stats.lrPlus, 'lrPlus')}</td><td>${stats.lrPlus?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('lrMinus', methode)}">LR-</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('lrMinus', stats.lrMinus, methode, displayKollektivName)}">${fCI_perf(stats.lrMinus, 'lrMinus')}</td><td>${stats.lrMinus?.method || na}</td></tr>
        </tbody></table></div>`;
        return matrixHTML + metricsHTML;
    }

    function createVergleichContentHTML(stats, kollektivName, t2ShortName = 'T2') {
        if (!stats) return '<p class="text-muted small p-3">Keine Vergleichsdaten verfügbar.</p>';
        const na = '--';
        const fPVal = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : formatNumber(pVal, 3, na, true)) : na;
        const displayKollektivName = getKollektivDisplayName(kollektivName);
        const methode1Name = 'AS';
        const methode2Name = t2ShortName;

        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}"><caption>Statistische Vergleiche zwischen Avocado Sign (AS) und T2-Kriterien (${t2ShortName}) im Kollektiv ${displayKollektivName}</caption><thead><tr><th>Test / Metrik</th><th>Wert / Statistik</th><th>p-Wert / 95% CI</th><th>Methode</th></tr></thead><tbody>
            <tr><td data-tippy-content="${ui_helpers.getTestDescriptionHTML('mcnemar', methode2Name, methode1Name, methode2Name)}">McNemar (Accuracy)</td><td>${formatNumber(stats.mcnemar?.statistic, 3, na, true)} (df=${stats.mcnemar?.df || na})</td><td data-tippy-content="${ui_helpers.getTestInterpretationHTML('mcnemar', stats.mcnemar, displayKollektivName, methode2Name, methode1Name, methode2Name)}">${fPVal(stats.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(stats.mcnemar?.pValue)}</td><td>${stats.mcnemar?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getTestDescriptionHTML('delong', methode2Name, methode1Name, methode2Name)}">DeLong (AUC)</td><td>Z=${formatNumber(stats.delong?.Z, 3, na, true)}</td><td data-tippy-content="${ui_helpers.getTestInterpretationHTML('delong', stats.delong, displayKollektivName, methode2Name, methode1Name, methode2Name)}">${fPVal(stats.delong?.pValue)} ${getStatisticalSignificanceSymbol(stats.delong?.pValue)}</td><td>${stats.delong?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('diffSens', methode1Name, methode2Name)}">Differenz Sensitivität (AS - ${methode2Name})</td>
                <td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('diffSens', stats.diffSens, methode1Name, methode2Name, displayKollektivName)}">${formatCI(stats.diffSens?.value, stats.diffSens?.ci?.lower, stats.diffSens?.ci?.upper, 1, true, na)}</td>
                <td>(${formatNumber(stats.diffSens?.ci?.lower, 1, na, true)}% - ${formatNumber(stats.diffSens?.ci?.upper, 1, na, true)}%)</td>
                <td>${stats.diffSens?.method || na}</td></tr>
            <tr><td data-tippy-content="${ui_helpers.getMetricDescriptionHTML('diffSpez', methode1Name, methode2Name)}">Differenz Spezifität (AS - ${methode2Name})</td>
                <td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('diffSpez', stats.diffSpez, methode1Name, methode2Name, displayKollektivName)}">${formatCI(stats.diffSpez?.value, stats.diffSpez?.ci?.lower, stats.diffSpez?.ci?.upper, 1, true, na)}</td>
                <td>(${formatNumber(stats.diffSpez?.ci?.lower, 1, na, true)}% - ${formatNumber(stats.diffSpez?.ci?.upper, 1, na, true)}%)</td>
                <td>${stats.diffSpez?.method || na}</td></tr>
        </tbody></table></div>`;
        return tableHTML;
    }


    function createAssoziationContentHTML(stats, kollektivName, criteria) {
        if (!stats || Object.keys(stats).length === 0) return '<p class="text-muted small p-3">Keine Assoziationsdaten verfügbar.</p>';
        const na = '--'; const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : formatNumber(pVal, 3, na, true)) : na;
        const displayKollektivName = getKollektivDisplayName(kollektivName);
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
             return ui_helpers.getAssociationInterpretationHTML(pTooltipKey, assocObj, merkmalName, displayKollektivName);
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
             const descriptionTemplate = TOOLTIP_CONTENT.statMetrics[pTooltipKey]?.description || TOOLTIP_CONTENT.statMetrics.defaultP.description || 'Testbeschreibung nicht verfügbar.';
             return descriptionTemplate.replace(/\[MERKMAL\]/g, `<strong>'${merkmalName}'</strong>`).replace(/\[VARIABLE\]/g, `<strong>'${merkmalName}'</strong>`);
        };

        const getMerkmalDescriptionHTMLAssoc = (key, assocObj) => {
             const baseName = TOOLTIP_CONTENT.statMetrics[key]?.name || assocObj?.featureName || key;
             const tooltipDescription = TOOLTIP_CONTENT.statMetrics[key]?.description || `Dieses Merkmal ('${baseName}') wird auf Assoziation mit dem N-Status getestet.`;
             return tooltipDescription.replace(/\[MERKMAL\]/g, `<strong>'${baseName}'</strong>`).replace(/\[METHODE\]/g, `<strong>'${baseName}'</strong>`);
        };


        const addRow = (key, assocObj, isActive = true) => {
            if (!assocObj) return '';
            const merkmalName = assocObj.featureName || key;
            const orStr = formatCI(assocObj.or?.value, assocObj.or?.ci?.lower, assocObj.or?.ci?.upper, 2, false, na);
            const rdValPerc = formatNumber(assocObj.rd?.value !== null && !isNaN(assocObj.rd?.value) ? assocObj.rd.value * 100 : NaN, 1, na, false);
            const rdCILowerPerc = formatNumber(assocObj.rd?.ci?.lower !== null && !isNaN(assocObj.rd?.ci?.lower) ? assocObj.rd.ci.lower * 100 : NaN, 1, na, false);
            const rdCIUpperPerc = formatNumber(assocObj.rd?.ci?.upper !== null && !isNaN(assocObj.rd?.ci?.upper) ? assocObj.rd.ci.upper * 100 : NaN, 1, na, false);
            const rdStr = rdValPerc !== na ? `${rdValPerc}% (${rdCILowerPerc}% - ${rdCIUpperPerc}%)` : na;
            const phiStr = formatNumber(assocObj.phi?.value, 2, na, true);
            const pStr = fP(assocObj.pValue);
            const sigSymbol = getStatisticalSignificanceSymbol(assocObj.pValue);
            const testName = assocObj.testName || na;
            const aktivText = isActive ? '' : ' <small class="text-muted">(inaktiv in T2-Def.)</small>';

            return `<tr>
                <td data-tippy-content="${getMerkmalDescriptionHTMLAssoc(key, assocObj)}">${merkmalName}${aktivText}</td>
                <td data-tippy-content="${ui_helpers.getAssociationInterpretationHTML('or', assocObj, merkmalName, displayKollektivName)}">${orStr}</td>
                <td data-tippy-content="${ui_helpers.getAssociationInterpretationHTML('rd', assocObj, merkmalName, displayKollektivName)}">${rdStr}</td>
                <td data-tippy-content="${ui_helpers.getAssociationInterpretationHTML('phi', assocObj, merkmalName, displayKollektivName)}">${phiStr}</td>
                <td data-tippy-content="${getPValueInterpretationAssoc(key, assocObj)}">${pStr} ${sigSymbol}</td>
                <td data-tippy-content="${getTestDescriptionAssoc(assocObj, key)}">${testName}</td>
            </tr>`;
        };

        if (stats.as) tableHTML += addRow('as', stats.as);
        if (stats.size_mwu && stats.size_mwu.testName && !stats.size_mwu.testName.includes("Invalid") && !stats.size_mwu.testName.includes("Nicht genug")) {
            const mwuObj = stats.size_mwu;
            const pStr = fP(mwuObj.pValue);
            const sigSymbol = getStatisticalSignificanceSymbol(mwuObj.pValue);
            const pTooltip = getPValueInterpretationAssoc('size_mwu', mwuObj);
            const descTooltip = TOOLTIP_CONTENT.statMetrics.size_mwu.description || "Vergleich der medianen Lymphknotengröße zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test.";
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
        if (!stats) return '<p class="text-muted small p-3">Keine Kollektiv-Vergleichsdaten verfügbar.</p>';
        const na = '--';
        const fPVal = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : formatNumber(pVal, 3, na, true)) : na;
        const kollektiv1Display = getKollektivDisplayName(kollektiv1Name);
        const kollektiv2Display = getKollektivDisplayName(kollektiv2Name);

        const accAS = stats.accuracyComparison?.as;
        const accT2 = stats.accuracyComparison?.t2;
        const aucAS = stats.aucComparison?.as;
        const aucT2 = stats.aucComparison?.t2;
        const sensASComp = stats.sensComparisonAS;
        const spezASComp = stats.spezComparisonAS;
        const sensT2Comp = stats.sensComparisonT2;
        const spezT2Comp = stats.spezComparisonT2;

        const getPValueInterpretationComp = (pValue, testKey, methode) => {
             const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[testKey]?.interpretation || 'Keine Interpretation verfügbar.';
             const pStr = (pValue !== null && !isNaN(pValue)) ? (pValue < 0.001 ? '&lt;0.001' : formatNumber(pValue, 3, na, true)) : na;
             const sigText = getStatisticalSignificanceText(pValue);
             return interpretationTemplate
                 .replace(/\[METHODE\]/g, `<strong>${methode}</strong>`)
                 .replace(/\[KOLLEKTIV1\]/g, `<strong>${kollektiv1Display}</strong>`)
                 .replace(/\[KOLLEKTIV2\]/g, `<strong>${kollektiv2Display}</strong>`)
                 .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                 .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`);
        };
        
        const getDiffInterpretation = (diffData, methode, metricName) => {
            if (!diffData) return na;
            const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[`diff${metricName}`]?.interpretation || `Differenz der ${metricName} ([METHODE1] - [METHODE2])`;
            return interpretationTemplate
                .replace(/\[METHODE1\]/g, `<strong>${methode} in ${kollektiv1Display}</strong>`)
                .replace(/\[METHODE2\]/g, `<strong>${methode} in ${kollektiv2Display}</strong>`)
                .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektiv1Display} vs. ${kollektiv2Display}</strong>`) // General context
                .replace(/\[WERT\]/g, `<strong>${formatNumber(diffData.value, 3, na, true)}</strong>`)
                .replace(/\[PROZENTPUNKTE\]/g, `(${formatNumber(diffData.value * 100, 1, na, true)} PP)`)
                .replace(/\[LOWER\]/g, `<strong>${formatNumber(diffData.ci?.lower, 3, na, true)}</strong>`)
                .replace(/\[UPPER\]/g, `<strong>${formatNumber(diffData.ci?.upper, 3, na, true)}</strong>`)
                .replace(/\[HOEHER_NIEDRIGER_GLEICH\]/g, diffData.value > 1e-9 ? 'höher' : (diffData.value < -1e-9 ? 'niedriger' : 'annähernd gleich'));
        };


        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-kollektive-${kollektiv1Name.replace(/\s+/g, '_')}-vs-${kollektiv2Name.replace(/\s+/g, '_')}"><caption>Vergleich der diagnostischen Leistung zwischen den Kollektiven ${kollektiv1Display} und ${kollektiv2Display}</caption><thead><tr><th>Vergleich</th><th>Methode</th><th>Wert / Diff. (95% CI)</th><th>p-Wert</th><th>Test</th></tr></thead><tbody>`;
        
        tableHTML += `<tr><td>Accuracy</td><td>AS</td><td data-tippy-content="${(TOOLTIP_CONTENT.statMetrics.accComp?.description || 'Vergleich Accuracy AS zw. Kollektiven.').replace('[METHODE]','AS')}">Vergleich</td><td data-tippy-content="${getPValueInterpretationComp(accAS?.pValue, 'accComp', 'AS')}">${fPVal(accAS?.pValue)} ${getStatisticalSignificanceSymbol(accAS?.pValue)}</td><td>${accAS?.testName || na}</td></tr>`;
        tableHTML += `<tr><td>Accuracy</td><td>T2</td><td data-tippy-content="${(TOOLTIP_CONTENT.statMetrics.accComp?.description || 'Vergleich Accuracy T2 zw. Kollektiven.').replace('[METHODE]','T2')}">Vergleich</td><td data-tippy-content="${getPValueInterpretationComp(accT2?.pValue, 'accComp', 'T2')}">${fPVal(accT2?.pValue)} ${getStatisticalSignificanceSymbol(accT2?.pValue)}</td><td>${accT2?.testName || na}</td></tr>`;
        
        tableHTML += `<tr><td>AUC</td><td>AS</td><td data-tippy-content="${getDiffInterpretation(aucAS, 'AS', 'AUC')}">${formatCI(aucAS?.diffAUC, aucAS?.ci?.lower, aucAS?.ci?.upper, 3, false, na)} (Z=${formatNumber(aucAS?.Z, 2, na, true)})</td><td data-tippy-content="${getPValueInterpretationComp(aucAS?.pValue, 'aucComp', 'AS')}">${fPVal(aucAS?.pValue)} ${getStatisticalSignificanceSymbol(aucAS?.pValue)}</td><td data-tippy-content="${(TOOLTIP_CONTENT.statMetrics.aucComp?.description || 'Vergleich AUC AS zw. Kollektiven.').replace('[METHODE]','AS')}">${aucAS?.method || na}</td></tr>`;
        tableHTML += `<tr><td>AUC</td><td>T2</td><td data-tippy-content="${getDiffInterpretation(aucT2, 'T2', 'AUC')}">${formatCI(aucT2?.diffAUC, aucT2?.ci?.lower, aucT2?.ci?.upper, 3, false, na)} (Z=${formatNumber(aucT2?.Z, 2, na, true)})</td><td data-tippy-content="${getPValueInterpretationComp(aucT2?.pValue, 'aucComp', 'T2')}">${fPVal(aucT2?.pValue)} ${getStatisticalSignificanceSymbol(aucT2?.pValue)}</td><td data-tippy-content="${(TOOLTIP_CONTENT.statMetrics.aucComp?.description || 'Vergleich AUC T2 zw. Kollektiven.').replace('[METHODE]','T2')}">${aucT2?.method || na}</td></tr>`;

        tableHTML += `<tr><td>Sensitivität</td><td>AS</td><td data-tippy-content="${getDiffInterpretation(sensASComp, 'AS', 'Sens')}">${formatCI(sensASComp?.value, sensASComp?.ci?.lower, sensASComp?.ci?.upper, 1, true, na)}</td><td>${na}</td><td>${sensASComp?.method || na}</td></tr>`;
        tableHTML += `<tr><td>Spezifität</td><td>AS</td><td data-tippy-content="${getDiffInterpretation(spezASComp, 'AS', 'Spez')}">${formatCI(spezASComp?.value, spezASComp?.ci?.lower, spezASComp?.ci?.upper, 1, true, na)}</td><td>${na}</td><td>${spezASComp?.method || na}</td></tr>`;
        tableHTML += `<tr><td>Sensitivität</td><td>T2</td><td data-tippy-content="${getDiffInterpretation(sensT2Comp, 'T2', 'Sens')}">${formatCI(sensT2Comp?.value, sensT2Comp?.ci?.lower, sensT2Comp?.ci?.upper, 1, true, na)}</td><td>${na}</td><td>${sensT2Comp?.method || na}</td></tr>`;
        tableHTML += `<tr><td>Spezifität</td><td>T2</td><td data-tippy-content="${getDiffInterpretation(spezT2Comp, 'T2', 'Spez')}">${formatCI(spezT2Comp?.value, spezT2Comp?.ci?.lower, spezT2Comp?.ci?.upper, 1, true, na)}</td><td>${na}</td><td>${spezT2Comp?.method || na}</td></tr>`;
        
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function createCriteriaComparisonTableHTML(results, globalKollektivName) {
         if (!Array.isArray(results) || results.length === 0) return '<p class="text-muted small p-3">Keine Daten für Kriterienvergleich verfügbar.</p>';
         const tc = TOOLTIP_CONTENT || {}; const cc = tc.criteriaComparisonTable || {};
         const headers = [
             { key: 'set', label: cc.tableHeaderSet || "Methode / Kriteriensatz", tooltip: cc.tableHeaderSet || "Die diagnostische Methode oder der spezifische Kriteriensatz, der evaluiert wird. 'Angewandte T2 Kriterien' sind die aktuell im Auswertungstab definierten. Literatur-Kriterien werden ggf. auf ihrem spezifischen Zielkollektiv evaluiert (in Klammern angegeben)." },
             { key: 'sens', label: cc.tableHeaderSens || "Sens.", tooltip: (cc.tableHeaderSens || "Sensitivität") + ": " + ui_helpers.getMetricDescriptionHTML('sens', 'der Methode') },
             { key: 'spez', label: cc.tableHeaderSpez || "Spez.", tooltip: (cc.tableHeaderSpez || "Spezifität") + ": " + ui_helpers.getMetricDescriptionHTML('spez', 'der Methode') },
             { key: 'ppv', label: cc.tableHeaderPPV || "PPV", tooltip: (cc.tableHeaderPPV || "PPV") + ": " + ui_helpers.getMetricDescriptionHTML('ppv', 'der Methode') },
             { key: 'npv', label: cc.tableHeaderNPV || "NPV", tooltip: (cc.tableHeaderNPV || "NPV") + ": " + ui_helpers.getMetricDescriptionHTML('npv', 'der Methode') },
             { key: 'acc', label: cc.tableHeaderAcc || "Acc.", tooltip: (cc.tableHeaderAcc || "Accuracy") + ": " + ui_helpers.getMetricDescriptionHTML('acc', 'der Methode') },
             { key: 'auc', label: cc.tableHeaderAUC || "AUC/BalAcc", tooltip: (cc.tableHeaderAUC || "AUC/Bal. Accuracy") + ": " + ui_helpers.getMetricDescriptionHTML('auc', 'der Methode') },
             { key: 'lrPlus', label: cc.tableHeaderLRplus || "LR+", tooltip: (cc.tableHeaderLRplus || "LR+") + ": " + ui_helpers.getMetricDescriptionHTML('lrPlus', 'der Methode') },
             { key: 'lrMinus', label: cc.tableHeaderLRminus || "LR-", tooltip: (cc.tableHeaderLRminus || "LR-") + ": " + ui_helpers.getMetricDescriptionHTML('lrMinus', 'der Methode') }
         ];
         const tableId = "table-kriterien-vergleich";
         const displayGlobalKollektivName = getKollektivDisplayName(globalKollektivName);
         let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped table-hover small caption-top" id="${tableId}"><caption>Vergleich verschiedener Kriteriensätze (vs. N) für das globale Kollektiv: ${displayGlobalKollektivName}</caption><thead class="small"><tr>`;
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
             const displayKollektivForInterpretation = getKollektivDisplayName(kollektivForInterpretation);

             if (isApplied) nameDisplay = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
             else if (isAS) nameDisplay = APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME;

             let nameSuffix = '';
             if (isLiteratur && result.specificKollektivName && result.specificKollektivName !== globalKollektivName) {
                 nameSuffix = ` <small class="text-muted fst-italic">(eval. auf ${displayKollektivForInterpretation}, N=${patientCountForInterpretation || '?'})</small>`;
             } else if ((isApplied || isAS) && patientCountForInterpretation !== undefined) {
                 nameSuffix = ` <small class="text-muted fst-italic">(N=${patientCountForInterpretation || '?'})</small>`;
             }
             
             const createMetricDataForTooltip = (value) => ({ value: value, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} });

             const tooltipSens = ui_helpers.getMetricInterpretationHTML('sens', createMetricDataForTooltip(result.sens), nameDisplay, displayKollektivForInterpretation);
             const tooltipSpez = ui_helpers.getMetricInterpretationHTML('spez', createMetricDataForTooltip(result.spez), nameDisplay, displayKollektivForInterpretation);
             const tooltipPPV = ui_helpers.getMetricInterpretationHTML('ppv', createMetricDataForTooltip(result.ppv), nameDisplay, displayKollektivForInterpretation);
             const tooltipNPV = ui_helpers.getMetricInterpretationHTML('npv', createMetricDataForTooltip(result.npv), nameDisplay, displayKollektivForInterpretation);
             const tooltipAcc = ui_helpers.getMetricInterpretationHTML('acc', createMetricDataForTooltip(result.acc), nameDisplay, displayKollektivForInterpretation);
             const tooltipAUC = ui_helpers.getMetricInterpretationHTML('auc', createMetricDataForTooltip(result.auc), nameDisplay, displayKollektivForInterpretation);
             const tooltipLRplus = ui_helpers.getMetricInterpretationHTML('lrPlus', createMetricDataForTooltip(result.lrPlus), nameDisplay, displayKollektivForInterpretation);
             const tooltipLRminus = ui_helpers.getMetricInterpretationHTML('lrMinus', createMetricDataForTooltip(result.lrMinus), nameDisplay, displayKollektivForInterpretation);


             tableHTML += `<tr class="${rowClass}">
                             <td class="fw-bold">${nameDisplay}${nameSuffix}</td>
                             <td data-tippy-content="${tooltipSens}">${formatPercent(result.sens, 1)}</td>
                             <td data-tippy-content="${tooltipSpez}">${formatPercent(result.spez, 1)}</td>
                             <td data-tippy-content="${tooltipPPV}">${formatPercent(result.ppv, 1)}</td>
                             <td data-tippy-content="${tooltipNPV}">${formatPercent(result.npv, 1)}</td>
                             <td data-tippy-content="${tooltipAcc}">${formatPercent(result.acc, 1)}</td>
                             <td data-tippy-content="${tooltipAUC}">${formatNumber(result.auc, 3, '--', true)}</td>
                             <td data-tippy-content="${tooltipLRplus}">${formatNumber(result.lrPlus, 2, '--', true)}</td>
                             <td data-tippy-content="${tooltipLRminus}">${formatNumber(result.lrMinus, 2, '--', true)}</td>
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
