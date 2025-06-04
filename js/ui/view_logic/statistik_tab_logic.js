const statistikTabLogic = (() => {

    function createDeskriptiveStatistikContentHTML(stats, indexSuffix = '0', kollektivName = '') {
        if (!stats || !stats.deskriptiv || !stats.deskriptiv.anzahlPatienten) return '<p class="text-muted small p-3">Keine deskriptiven Daten verfügbar.</p>';
        const total = stats.deskriptiv.anzahlPatienten;
        const na = '--';
        const lang = typeof stateManager !== 'undefined' ? stateManager.getCurrentPublikationLang() || 'de' : 'de';
        const fv = (val, dig = 1, useStd = false) => formatNumber(val, dig, na, lang === 'en' || useStd);
        const fP = (val, dig = 1) => formatPercent(val, dig, na, lang);
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
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.alterMedian?.description || 'Alter (Median, Min-Max, [Mittelwert ± SD])')}"><td>Alter Median (Min-Max) [Mean ± SD]</td><td>${fv(d.alter?.median, 1)} (${fv(d.alter?.min, 0)} - ${fv(d.alter?.max, 0)}) [${fv(d.alter?.mean, 1)} ± ${fv(d.alter?.sd, 1)}]</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.geschlecht?.description || 'Geschlechterverteilung')}"><td>Geschlecht (m / w) (n / %)</td><td>${d.geschlecht?.m ?? 0} / ${d.geschlecht?.f ?? 0} (${fP((d.anzahlPatienten > 0 ? (d.geschlecht?.m ?? 0) / d.anzahlPatienten : NaN), 1)} / ${fP((d.anzahlPatienten > 0 ? (d.geschlecht?.f ?? 0) / d.anzahlPatienten : NaN), 1)})</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.datenTable.therapie || 'Therapieverteilung')}"><td>Therapie (direkt OP / nRCT) (n / %)</td><td>${d.therapie?.['direkt OP'] ?? 0} / ${d.therapie?.nRCT ?? 0} (${fP((d.anzahlPatienten > 0 ? (d.therapie?.['direkt OP'] ?? 0) / d.anzahlPatienten : NaN), 1)} / ${fP((d.anzahlPatienten > 0 ? (d.therapie?.nRCT ?? 0) / d.anzahlPatienten : NaN), 1)})</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.nStatus?.description || 'N-Status Verteilung (Pathologie)')}"><td>N Status (+ / -) (n / %)</td><td>${d.nStatus?.plus ?? 0} / ${d.nStatus?.minus ?? 0} (${fP((d.anzahlPatienten > 0 ? (d.nStatus?.plus ?? 0) / d.anzahlPatienten : NaN), 1)} / ${fP((d.anzahlPatienten > 0 ? (d.nStatus?.minus ?? 0) / d.anzahlPatienten : NaN), 1)})</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.asStatus?.description || 'Avocado Sign Status Verteilung')}"><td>AS Status (+ / -) (n / %)</td><td>${d.asStatus?.plus ?? 0} / ${d.asStatus?.minus ?? 0} (${fP((d.anzahlPatienten > 0 ? (d.asStatus?.plus ?? 0) / d.anzahlPatienten : NaN), 1)} / ${fP((d.anzahlPatienten > 0 ? (d.asStatus?.minus ?? 0) / d.anzahlPatienten : NaN), 1)})</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.t2Status?.description || 'T2-Status Verteilung (angewandte Kriterien)')}"><td>T2 Status (+ / -) (n / %)</td><td>${d.t2Status?.plus ?? 0} / ${d.t2Status?.minus ?? 0} (${fP((d.anzahlPatienten > 0 ? (d.t2Status?.plus ?? 0) / d.anzahlPatienten : NaN), 1)} / ${fP((d.anzahlPatienten > 0 ? (d.t2Status?.minus ?? 0) / d.anzahlPatienten : NaN), 1)})</td></tr>
                            </tbody>
                        </table>
                    </div>
                     <div class="table-responsive">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-lk-${indexSuffix}">
                             <caption>Lymphknotenanzahlen (Median (Min-Max) [Mean ± SD])</caption>
                             <thead class="visually-hidden"><tr><th>Metrik</th><th>Wert</th></tr></thead>
                             <tbody>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlPatho?.description || 'Gesamtzahl histopathologisch untersuchter Lymphknoten pro Patient.')}"><td>LK N gesamt</td><td>${fLK(d.lkAnzahlen?.n?.total)}</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlPathoPlus?.description || 'Anzahl pathologisch positiver (N+) Lymphknoten pro Patient, nur bei Patienten mit N+ Status (n=' + (d.nStatus?.plus ?? 0) + ').')}"><td>LK N+ <sup>*</sup></td><td>${fLK(d.lkAnzahlen?.n?.plus)}</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlAS?.description || 'Gesamtzahl im T1KM-MRT sichtbarer und bewerteter Lymphknoten pro Patient.')}"><td>LK AS gesamt</td><td>${fLK(d.lkAnzahlen?.as?.total)}</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlASPlus?.description || 'Anzahl Avocado Sign positiver (AS+) Lymphknoten pro Patient, nur bei Patienten mit AS+ Status (n=' + (d.asStatus?.plus ?? 0) + ').')}"><td>LK AS+ <sup>**</sup></td><td>${fLK(d.lkAnzahlen?.as?.plus)}</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlT2?.description || 'Gesamtzahl im T2-MRT sichtbarer und für die Kriterienbewertung herangezogener Lymphknoten pro Patient.')}"><td>LK T2 gesamt</td><td>${fLK(d.lkAnzahlen?.t2?.total)}</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlT2Plus?.description || 'Anzahl T2-positiver Lymphknoten (gemäß aktueller Kriterien) pro Patient, nur bei Patienten mit T2+ Status (n=' + (d.t2Status?.plus ?? 0) + ').')}"><td>LK T2+ <sup>***</sup></td><td>${fLK(d.lkAnzahlen?.t2?.plus)}</td></tr>
                             </tbody>
                        </table>
                     </div>
                    <p class="small text-muted mt-1 mb-0"><sup>*</sup> Nur bei N+ Patienten (n=${d.nStatus?.plus ?? 0}); <sup>**</sup> Nur bei AS+ Patienten (n=${d.asStatus?.plus ?? 0}); <sup>***</sup> Nur bei T2+ Patienten (n=${d.t2Status?.plus ?? 0}).</p>
                </div>
                <div class="col-md-6 d-flex flex-column">
                    <div class="mb-2 flex-grow-1" id="${ageChartId}" style="min-height: 150px;" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.chartAge?.description || 'Altersverteilung der Patienten.').replace('[KOLLEKTIV]', `<strong>${displayKollektivName}</strong>`)}">
                       <p class="text-muted small text-center p-3">Lade Altersverteilung...</p>
                    </div>
                    <div class="flex-grow-1" id="${genderChartId}" style="min-height: 150px;" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.chartGender?.description || 'Geschlechterverteilung der Patienten.').replace('[KOLLEKTIV]', `<strong>${displayKollektivName}</strong>`)}">
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
        const currentLang = typeof stateManager !== 'undefined' ? stateManager.getCurrentPublikationLang() || 'de' : 'de';
        const fCI_perf = (m, key) => {
            const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
            const isPercent = !(key === 'f1' || key === 'auc');
            return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, digits, isPercent, na, currentLang);
        };
        let matrixHTML = `<h6 class="px-2 pt-2">Konfusionsmatrix (${methode} vs. N)</h6><table class="table table-sm table-bordered text-center small mx-2 mb-3" style="width: auto;" id="table-guete-matrix-${methode}-${kollektivName.replace(/\s+/g, '_')}"><thead class="small"><tr><th></th><th>N+ (Patho)</th><th>N- (Patho)</th></tr></thead><tbody><tr><td class="fw-bold">${methode}+</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="Richtig Positiv (RP): ${methode}+ und N+. Anzahl Patienten, die von Methode ${methode} korrekt als positiv vorhergesagt wurden.">${formatNumber(matrix.rp,0,na,currentLang === 'en')}</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="Falsch Positiv (FP): ${methode}+ aber N-. Anzahl Patienten, die von Methode ${methode} fälschlicherweise als positiv vorhergesagt wurden (Typ-I-Fehler).">${formatNumber(matrix.fp,0,na,currentLang === 'en')}</td></tr><tr><td class="fw-bold">${methode}-</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="Falsch Negativ (FN): ${methode}- aber N+. Anzahl Patienten, die von Methode ${methode} fälschlicherweise als negativ vorhergesagt wurden (Typ-II-Fehler).">${formatNumber(matrix.fn,0,na,currentLang === 'en')}</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="Richtig Negativ (RN): ${methode}- und N-. Anzahl Patienten, die von Methode ${methode} korrekt als negativ vorhergesagt wurden.">${formatNumber(matrix.rn,0,na,currentLang === 'en')}</td></tr></tbody></table>`;
        let metricsHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-guete-metrics-${methode}-${kollektivName.replace(/\s+/g, '_')}"><caption>Diagnostische Gütekriterien für Methode ${methode} im Kollektiv ${displayKollektivName}</caption><thead><tr><th>Metrik</th><th>Wert (95% CI)</th><th>CI Methode</th></tr></thead><tbody>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('sens', methode)}">Sensitivität</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('sens', stats.sens, methode, displayKollektivName)}">${fCI_perf(stats.sens, 'sens')}</td><td>${stats.sens?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('spez', methode)}">Spezifität</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('spez', stats.spez, methode, displayKollektivName)}">${fCI_perf(stats.spez, 'spez')}</td><td>${stats.spez?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('ppv', methode)}">PPV</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('ppv', stats.ppv, methode, displayKollektivName)}">${fCI_perf(stats.ppv, 'ppv')}</td><td>${stats.ppv?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('npv', methode)}">NPV</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('npv', stats.npv, methode, displayKollektivName)}">${fCI_perf(stats.npv, 'npv')}</td><td>${stats.npv?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('acc', methode)}">Accuracy</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('acc', stats.acc, methode, displayKollektivName)}">${fCI_perf(stats.acc, 'acc')}</td><td>${stats.acc?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('balAcc', methode)}">Balanced Accuracy</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('balAcc', stats.balAcc, methode, displayKollektivName)}">${fCI_perf(stats.balAcc, 'balAcc')}</td><td>${stats.balAcc?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('f1', methode)}">F1-Score</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('f1', stats.f1, methode, displayKollektivName)}">${fCI_perf(stats.f1, 'f1')}</td><td>${stats.f1?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('auc', methode)}">AUC (Bal. Acc.)</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('auc', stats.auc, methode, displayKollektivName)}">${fCI_perf(stats.auc, 'auc')}</td><td>${stats.auc?.method || na}</td></tr>
        </tbody></table></div>`;
        return matrixHTML + metricsHTML;
    }

    function createVergleichContentHTML(stats, kollektivName, t2ShortName = 'T2') {
        if (!stats) return '<p class="text-muted small p-3">Keine Vergleichsdaten verfügbar.</p>';
        const na = '--';
        const currentLang = typeof stateManager !== 'undefined' ? stateManager.getCurrentPublikationLang() || 'de' : 'de';
        const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : formatNumber(pVal, 3, na, currentLang === 'en')) : na;
        const displayKollektivName = getKollektivDisplayName(kollektivName);
        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}"><caption>Statistische Vergleiche zwischen Avocado Sign (AS) und T2-Kriterien (${t2ShortName}) im Kollektiv ${displayKollektivName}</caption><thead><tr><th>Test</th><th>Statistik</th><th>p-Wert</th><th>Methode</th></tr></thead><tbody>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getTestDescriptionHTML('mcnemar', t2ShortName)}">McNemar (Accuracy)</td><td>${formatNumber(stats.mcnemar?.statistic, 3, na, currentLang === 'en')} (df=${stats.mcnemar?.df || na})</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getTestInterpretationHTML('mcnemar', stats.mcnemar, displayKollektivName, t2ShortName)}">${fP(stats.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(stats.mcnemar?.pValue)}</td><td>${stats.mcnemar?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getTestDescriptionHTML('delong', t2ShortName)}">DeLong (AUC)</td><td>Z=${formatNumber(stats.delong?.Z, 3, na, currentLang === 'en')}</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getTestInterpretationHTML('delong', stats.delong, displayKollektivName, t2ShortName)}">${fP(stats.delong?.pValue)} ${getStatisticalSignificanceSymbol(stats.delong?.pValue)}</td><td>${stats.delong?.method || na}</td></tr>
        </tbody></table></div>`;
        return tableHTML;
    }

    function createAssoziationContentHTML(stats, kollektivName, criteria) {
        if (!stats || Object.keys(stats).length === 0) return '<p class="text-muted small p-3">Keine Assoziationsdaten verfügbar.</p>';
        const na = '--';
        const currentLang = typeof stateManager !== 'undefined' ? stateManager.getCurrentPublikationLang() || 'de' : 'de';
        const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : formatNumber(pVal, 3, na, currentLang === 'en')) : na;
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
            const orStr = formatCI(assocObj.or?.value, assocObj.or?.ci?.lower, assocObj.or?.ci?.upper, 2, false, na, currentLang);
            const rdValPerc = formatNumber(assocObj.rd?.value !== null && !isNaN(assocObj.rd?.value) ? assocObj.rd.value * 100 : NaN, 1, na, currentLang === 'en');
            const rdCILowerPerc = formatNumber(assocObj.rd?.ci?.lower !== null && !isNaN(assocObj.rd?.ci?.lower) ? assocObj.rd.ci.lower * 100 : NaN, 1, na, currentLang === 'en');
            const rdCIUpperPerc = formatNumber(assocObj.rd?.ci?.upper !== null && !isNaN(assocObj.rd?.ci?.upper) ? assocObj.rd.ci.upper * 100 : NaN, 1, na, currentLang === 'en');
            const rdStr = rdValPerc !== na ? `${rdValPerc}% (${rdCILowerPerc}% - ${rdCIUpperPerc}%)` : na;
            const phiStr = formatNumber(assocObj.phi?.value, 2, na, currentLang === 'en');
            const pStr = fP(assocObj.pValue);
            const sigSymbol = getStatisticalSignificanceSymbol(assocObj.pValue);
            const testName = assocObj.testName || na;
            const aktivText = isActive ? '' : ' <small class="text-muted">(inaktiv in T2-Def.)</small>';

            return `<tr>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getMerkmalDescriptionHTMLAssoc(key, assocObj)}">${merkmalName}${aktivText}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getAssociationInterpretationHTML('or', assocObj, merkmalName, displayKollektivName)}">${orStr}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getAssociationInterpretationHTML('rd', assocObj, merkmalName, displayKollektivName)}">${rdStr}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getAssociationInterpretationHTML('phi', assocObj, merkmalName, displayKollektivName)}">${phiStr}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getPValueInterpretationAssoc(key, assocObj)}">${pStr} ${sigSymbol}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getTestDescriptionAssoc(assocObj, key)}">${testName}</td>
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
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${descTooltip}">${mwuObj.featureName || 'LK Größe (Median Vgl.)'}</td>
                <td>${na}</td><td>${na}</td><td>${na}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${pTooltip}">${pStr} ${sigSymbol}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${testDescTooltip}">${mwuObj.testName || na}</td>
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
        const na = '--';
        const currentLang = typeof stateManager !== 'undefined' ? stateManager.getCurrentPublikationLang() || 'de' : 'de';
        const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : formatNumber(pVal, 3, na, currentLang === 'en')) : na;
        const kollektiv1Display = getKollektivDisplayName(kollektiv1Name); const kollektiv2Display = getKollektivDisplayName(kollektiv2Name);
        const accAS = stats.accuracyComparison?.as; const accT2 = stats.accuracyComparison?.t2;
        const aucAS = stats.aucComparison?.as; const aucT2 = stats.aucComparison?.t2;

        const getPValueInterpretationComp = (pValue, testKey, methode) => {
             const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[testKey]?.interpretation || 'Keine Interpretation verfügbar.';
             const pStr = (pValue !== null && !isNaN(pValue)) ? (pValue < 0.001 ? '&lt;0.001' : formatNumber(pValue, 3, na, currentLang === 'en')) : na;
             const sigText = getStatisticalSignificanceText(pValue);
             return interpretationTemplate
                 .replace(/\[METHODE\]/g, `<strong>${methode}</strong>`)
                 .replace(/\[KOLLEKTIV1\]/g, `<strong>${kollektiv1Display}</strong>`)
                 .replace(/\[KOLLEKTIV2\]/g, `<strong>${kollektiv2Display}</strong>`)
                 .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                 .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`);
        };

        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-kollektive-${kollektiv1Name.replace(/\s+/g, '_')}-vs-${kollektiv2Name.replace(/\s+/g, '_')}"><caption>Vergleich der diagnostischen Leistung zwischen den Kollektiven ${kollektiv1Display} und ${kollektiv2Display}</caption><thead><tr><th>Vergleich</th><th>Methode</th><th>p-Wert</th><th>Test</th></tr></thead><tbody>`;
        tableHTML += `<tr><td>Accuracy</td><td>AS</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getPValueInterpretationComp(accAS?.pValue, 'accComp', 'AS')}">${fP(accAS?.pValue)} ${getStatisticalSignificanceSymbol(accAS?.pValue)}</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.statMetrics.accComp?.description || 'Vergleich Accuracy der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','AS')}">${accAS?.testName || na}</td></tr>`;
        tableHTML += `<tr><td>Accuracy</td><td>T2</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getPValueInterpretationComp(accT2?.pValue, 'accComp', 'T2')}">${fP(accT2?.pValue)} ${getStatisticalSignificanceSymbol(accT2?.pValue)}</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.statMetrics.accComp?.description || 'Vergleich Accuracy der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','T2')}">${accT2?.testName || na}</td></tr>`;
        tableHTML += `<tr><td>AUC</td><td>AS</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getPValueInterpretationComp(aucAS?.pValue, 'aucComp', 'AS')}">${fP(aucAS?.pValue)} ${getStatisticalSignificanceSymbol(aucAS?.pValue)} (Diff: ${formatNumber(aucAS?.diffAUC, 3, na, currentLang === 'en')}, Z=${formatNumber(aucAS?.Z, 2, na, currentLang === 'en')})</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.statMetrics.aucComp?.description || 'Vergleich AUC der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','AS')}">${aucAS?.method || na}</td></tr>`;
        tableHTML += `<tr><td>AUC</td><td>T2</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getPValueInterpretationComp(aucT2?.pValue, 'aucComp', 'T2')}">${fP(aucT2?.pValue)} ${getStatisticalSignificanceSymbol(aucT2?.pValue)} (Diff: ${formatNumber(aucT2?.diffAUC, 3, na, currentLang === 'en')}, Z=${formatNumber(aucT2?.Z, 2, na, currentLang === 'en')})</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.statMetrics.aucComp?.description || 'Vergleich AUC der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','T2')}">${aucT2?.method || na}</td></tr>`;
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function createCriteriaComparisonTableHTML(results, globalKollektivName) {
         if (!Array.isArray(results) || results.length === 0) return '<p class="text-muted small p-3">Keine Daten für Kriterienvergleich verfügbar.</p>';
         const tc = TOOLTIP_CONTENT || {}; const cc = tc.criteriaComparisonTable || {};
         const currentLang = typeof stateManager !== 'undefined' ? stateManager.getCurrentPublikationLang() || 'de' : 'de';
         const headers = [
             { key: 'set', label: cc.tableHeaderSet || "Methode / Kriteriensatz", tooltip: cc.tableHeaderSetTooltip || "Die diagnostische Methode oder der spezifische Kriteriensatz, der evaluiert wird. 'Angewandte T2 Kriterien' sind die aktuell im Auswertungstab definierten. Literatur-Kriterien werden ggf. auf ihrem spezifischen Zielkollektiv evaluiert (in Klammern angegeben)." },
             { key: 'sens', label: cc.tableHeaderSens || "Sens.", tooltip: (cc.tableHeaderSensTooltip || "Sensitivität") + ": " + ui_helpers.getMetricDescriptionHTML('sens', 'der Methode') },
             { key: 'spez', label: cc.tableHeaderSpez || "Spez.", tooltip: (cc.tableHeaderSpezTooltip || "Spezifität") + ": " + ui_helpers.getMetricDescriptionHTML('spez', 'der Methode') },
             { key: 'ppv', label: cc.tableHeaderPPV || "PPV", tooltip: (cc.tableHeaderPPVTooltip || "PPV") + ": " + ui_helpers.getMetricDescriptionHTML('ppv', 'der Methode') },
             { key: 'npv', label: cc.tableHeaderNPV || "NPV", tooltip: (cc.tableHeaderNPVTooltip || "NPV") + ": " + ui_helpers.getMetricDescriptionHTML('npv', 'der Methode') },
             { key: 'acc', label: cc.tableHeaderAcc || "Acc.", tooltip: (cc.tableHeaderAccTooltip || "Accuracy") + ": " + ui_helpers.getMetricDescriptionHTML('acc', 'der Methode') },
             { key: 'auc', label: cc.tableHeaderAUC || "AUC/BalAcc", tooltip: (cc.tableHeaderAUCTooltip || "AUC/Bal. Accuracy") + ": " + ui_helpers.getMetricDescriptionHTML('auc', 'der Methode') }
         ];
         const tableId = "table-kriterien-vergleich";
         const displayGlobalKollektivName = getKollektivDisplayName(globalKollektivName);
         let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped table-hover small caption-top" id="${tableId}"><caption>Vergleich verschiedener Kriteriensätze (vs. N) für das globale Kollektiv: ${displayGlobalKollektivName}</caption><thead class="small"><tr>`;
         headers.forEach(h => {
            const tooltipAttr = h.tooltip ? `data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${h.tooltip}"` : '';
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

             const metricForTooltipSens = { value: result.sens, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} };
             const metricForTooltipSpez = { value: result.spez, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} };
             const metricForTooltipPPV = { value: result.ppv, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} };
             const metricForTooltipNPV = { value: result.npv, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} };
             const metricForTooltipAcc = { value: result.acc, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} };
             const metricForTooltipAUC = { value: result.auc, matrix_components: {total: patientCountForInterpretation} };


             const tooltipSens = ui_helpers.getMetricInterpretationHTML('sens', metricForTooltipSens, nameDisplay, displayKollektivForInterpretation);
             const tooltipSpez = ui_helpers.getMetricInterpretationHTML('spez', metricForTooltipSpez, nameDisplay, displayKollektivForInterpretation);
             const tooltipPPV = ui_helpers.getMetricInterpretationHTML('ppv', metricForTooltipPPV, nameDisplay, displayKollektivForInterpretation);
             const tooltipNPV = ui_helpers.getMetricInterpretationHTML('npv', metricForTooltipNPV, nameDisplay, displayKollektivForInterpretation);
             const tooltipAcc = ui_helpers.getMetricInterpretationHTML('acc', metricForTooltipAcc, nameDisplay, displayKollektivForInterpretation);
             const tooltipAUC = ui_helpers.getMetricInterpretationHTML('auc', metricForTooltipAUC, nameDisplay, displayKollektivForInterpretation);

             tableHTML += `<tr class="${rowClass}">
                             <td class="fw-bold">${nameDisplay}${nameSuffix}</td>
                             <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltipSens}">${formatPercent(result.sens, 1, '--', currentLang)}</td>
                             <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltipSpez}">${formatPercent(result.spez, 1, '--', currentLang)}</td>
                             <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltipPPV}">${formatPercent(result.ppv, 1, '--', currentLang)}</td>
                             <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltipNPV}">${formatPercent(result.npv, 1, '--', currentLang)}</td>
                             <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltipAcc}">${formatPercent(result.acc, 1, '--', currentLang)}</td>
                             <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltipAUC}">${formatNumber(result.auc, 3, '--', currentLang === 'en')}</td>
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

window.statistikTabLogic = statistikTabLogic;
