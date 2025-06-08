// js/ui/view_logic/statistik_tab.js

class StatistikViewLogic {
    constructor() {
        this.statisticsResultsElement = document.getElementById('statistics-results');
        this.rocChartCanvas = document.getElementById('roc-chart');
        this.runBruteForceButton = document.getElementById('run-brute-force');
        this.bruteForceResultsElement = document.getElementById('brute-force-results');

        this.rocChartInstance = null; // Speichert die Chart.js Instanz für die ROC-Kurve

        this.addEventListeners();
    }

    addEventListeners() {
        if (this.runBruteForceButton) {
            this.runBruteForceButton.addEventListener('click', () => this.handleRunBruteForce());
        }
        // Listener für AppState-Änderungen, um die Ansicht zu aktualisieren
        AppState.addChangeListener('patientData', () => this.updateView());
        AppState.addChangeListener('selectedCriteria', () => this.updateView());
    }

    /**
     * Erstellt den HTML-Inhalt für die deskriptive Statistik.
     * @param {Object} stats - Die deskriptiven Statistikdaten.
     * @param {string} indexSuffix - Ein Suffix für IDs, um Eindeutigkeit bei mehreren Sektionen zu gewährleisten.
     * @param {string} kollektivName - Der Name des Kollektivs für die Anzeige.
     * @returns {string} Der HTML-Code für die deskriptive Statistik.
     */
    createDeskriptiveStatistikContentHTML(stats, indexSuffix = '0', kollektivName = '') {
        if (!stats || !stats.deskriptiv || !stats.deskriptiv.anzahlPatienten) return '<p class="text-muted small p-3">Keine deskriptiven Daten verfügbar.</p>';
        const total = stats.deskriptiv.anzahlPatienten;
        const na = '--';
        const fv = (val, dig = 1) => (typeof val === 'number' && !isNaN(val)) ? val.toFixed(dig) : na;
        const fP = (val, dig = 1) => (typeof val === 'number' && !isNaN(val)) ? (val * 100).toFixed(dig) + '%' : na;
        const fLK = (lkData) => `${fv(lkData?.median,1)} (${fv(lkData?.min,0)}-${fv(lkData?.max,0)}) [${fv(lkData?.mean,1)} ± ${fv(lkData?.sd,1)}]`;
        const d = stats.deskriptiv;
        const ageChartId = `chart-stat-age-${indexSuffix}`;
        const genderChartId = `chart-stat-gender-${indexSuffix}`;
        const displayKollektivName = TextConfig.getKollektivDisplayName(kollektivName);

        let tableHTML = `
            <div class="row g-3 p-2">
                <div class="col-md-6">
                    <div class="table-responsive mb-3">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-demographie-${indexSuffix}">
                            <caption>Demographie & Status (N=${total})</caption>
                            <thead class="visually-hidden"><tr><th>Metrik</th><th>Wert</th></tr></thead>
                            <tbody>
                                <tr data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.deskriptiveStatistik.alterMedian?.description || 'Alter (Median, Min-Max, [Mittelwert ± SD])')}"><td>Alter Median (Min-Max) [Mean ± SD]</td><td>${fv(d.alter?.median, 1)} (${fv(d.alter?.min, 0)} - ${fv(d.alter?.max, 0)}) [${fv(d.alter?.mean, 1)} ± ${fv(d.alter?.sd, 1)}]</td></tr>
                                <tr data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.deskriptiveStatistik.geschlecht?.description || 'Geschlechterverteilung')}"><td>Geschlecht (m / w) (n / %)</td><td>${d.geschlecht?.m ?? 0} / ${d.geschlecht?.f ?? 0} (${fP(total > 0 ? (d.geschlecht?.m ?? 0) / total : NaN, 1)} / ${fP(total > 0 ? (d.geschlecht?.f ?? 0) / total : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.datenTable.therapie || 'Therapieverteilung')}"><td>Therapie (direkt OP / nRCT) (n / %)</td><td>${d.therapie?.['direkt OP'] ?? 0} / ${d.therapie?.nRCT ?? 0} (${fP(total > 0 ? (d.therapie?.['direkt OP'] ?? 0) / total : NaN, 1)} / ${fP(total > 0 ? (d.therapie?.nRCT ?? 0) / total : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.deskriptiveStatistik.nStatus?.description || 'N-Status Verteilung (Pathologie)')}"><td>N Status (+ / -) (n / %)</td><td>${d.nStatus?.plus ?? 0} / ${d.nStatus?.minus ?? 0} (${fP(total > 0 ? (d.nStatus?.plus ?? 0) / total : NaN, 1)} / ${fP(total > 0 ? (d.nStatus?.minus ?? 0) / total : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.deskriptiveStatistik.asStatus?.description || 'Avocado Sign Status Verteilung')}"><td>AS Status (+ / -) (n / %)</td><td>${d.asStatus?.plus ?? 0} / ${d.asStatus?.minus ?? 0} (${fP(total > 0 ? (d.asStatus?.plus ?? 0) / total : NaN, 1)} / ${fP(total > 0 ? (d.asStatus?.minus ?? 0) / total : NaN, 1)})</td></tr>
                                <tr data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.deskriptiveStatistik.t2Status?.description || 'T2-Status Verteilung (angewandte Kriterien)')}"><td>T2 Status (+ / -) (n / %)</td><td>${d.t2Status?.plus ?? 0} / ${d.t2Status?.minus ?? 0} (${fP(total > 0 ? (d.t2Status?.plus ?? 0) / total : NaN, 1)} / ${fP(total > 0 ? (d.t2Status?.minus ?? 0) / total : NaN, 1)})</td></tr>
                            </tbody>
                        </table>
                    </div>
                     <div class="table-responsive">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-lk-${indexSuffix}">
                             <caption>Lymphknotenanzahlen (Median (Min-Max) [Mean ± SD])</caption>
                             <thead class="visually-hidden"><tr><th>Metrik</th><th>Wert</th></tr></thead>
                             <tbody>
                                <tr data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlPatho?.description || 'Gesamtzahl histopathologisch untersuchter Lymphknoten pro Patient.')}"><td>LK N gesamt</td><td>${fLK(d.lkAnzahlen?.n?.total)}</td></tr>
                                <tr data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlPathoPlus?.description || 'Anzahl pathologisch positiver (N+) Lymphknoten pro Patient, nur bei Patienten mit N+ Status (n=' + (d.nStatus?.plus ?? 0) + ').')}"><td>LK N+ <sup>*</sup></td><td>${fLK(d.lkAnzahlen?.n?.plus)}</td></tr>
                                <tr data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlAS?.description || 'Gesamtzahl im T1KM-MRT sichtbarer und bewerteter Lymphknoten pro Patient.')}"><td>LK AS gesamt</td><td>${fLK(d.lkAnzahlen?.as?.total)}</td></tr>
                                <tr data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlASPlus?.description || 'Anzahl Avocado Sign positiver (AS+) Lymphknoten pro Patient, nur bei Patienten mit AS+ Status (n=' + (d.asStatus?.plus ?? 0) + ').')}"><td>LK AS+ <sup>**</sup></td><td>${fLK(d.lkAnzahlen?.as?.plus)}</td></tr>
                                <tr data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlT2?.description || 'Gesamtzahl im T2-MRT sichtbarer und für die Kriterienbewertung herangezogener Lymphknoten pro Patient.')}"><td>LK T2 gesamt</td><td>${fLK(d.lkAnzahlen?.t2?.total)}</td></tr>
                                <tr data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlT2Plus?.description || 'Anzahl T2-positiver Lymphknoten (gemäß aktueller Kriterien) pro Patient, nur bei Patienten mit T2+ Status (n=' + (d.t2Status?.plus ?? 0) + ').')}"><td>LK T2+ <sup>***</sup></td><td>${fLK(d.lkAnzahlen?.t2?.plus)}</td></tr>
                             </tbody>
                        </table>
                     </div>
                    <p class="small text-muted mt-1 mb-0"><sup>*</sup> Nur bei N+ Patienten (n=${d.nStatus?.plus ?? 0}); <sup>**</sup> Nur bei AS+ Patienten (n=${d.asStatus?.plus ?? 0}); <sup>***</sup> Nur bei T2+ Patienten (n=${d.t2Status?.plus ?? 0}).</p>
                </div>
                <div class="col-md-6 d-flex flex-column">
                    <div class="mb-2 flex-grow-1" id="${ageChartId}" style="min-height: 150px;" data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.deskriptiveStatistik.chartAge?.description || 'Altersverteilung der Patienten.').replace('[KOLLEKTIV]', `<strong>${displayKollektivName}</strong>`)}">
                       <p class="text-muted small text-center p-3">Lade Altersverteilung...</p>
                    </div>
                    <div class="flex-grow-1" id="${genderChartId}" style="min-height: 150px;" data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.deskriptiveStatistik.chartGender?.description || 'Geschlechterverteilung der Patienten.').replace('[KOLLEKTIV]', `<strong>${displayKollektivName}</strong>`)}">
                       <p class="text-muted small text-center p-3">Lade Geschlechterverteilung...</p>
                    </div>
                </div>
            </div>`;
        return tableHTML;
    }

    /**
     * Erstellt den HTML-Inhalt für die Gütekriterien.
     * @param {Object} stats - Die Gütekriterienstatistik.
     * @param {string} methode - Der Name der diagnostischen Methode (z.B. "AS" oder "T2").
     * @param {string} kollektivName - Der Name des Kollektivs.
     * @returns {string} Der HTML-Code für die Gütekriterien.
     */
    createGueteContentHTML(stats, methode, kollektivName) {
        if (!stats || !stats.tp === undefined) return '<p class="text-muted small p-3">Keine Gütedaten verfügbar.</p>'; // stats.tp ist der sicherere Check
        const matrix = { rp: stats.tp, fp: stats.fp, fn: stats.fn, rn: stats.tn }; // Korrekte Zuordnung
        const na = '--';
        const displayKollektivName = TextConfig.getKollektivDisplayName(kollektivName);
        const fCI_perf = (m, key) => {
            const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
            const isPercent = !(key === 'f1' || key === 'auc');
            return Common.formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, digits, isPercent, na);
        };

        let matrixHTML = `<h6 class="px-2 pt-2">Konfusionsmatrix (${methode} vs. N)</h6><table class="table table-sm table-bordered text-center small mx-2 mb-3" style="width: auto;" id="table-guete-matrix-${methode}-${kollektivName.replace(/\s+/g, '_')}"><thead class="small"><tr><th></th><th>N+ (Patho)</th><th>N- (Patho)</th></tr></thead><tbody><tr><td class="fw-bold">${methode}+</td><td data-tippy-content="Richtig Positiv (RP): ${methode}+ und N+. Anzahl Patienten, die von Methode ${methode} korrekt als positiv vorhergesagt wurden.">${matrix.rp !== undefined ? matrix.rp : na}</td><td data-tippy-content="Falsch Positiv (FP): ${methode}+ aber N-. Anzahl Patienten, die von Methode ${methode} fälschlicherweise als positiv vorhergesagt wurden (Typ-I-Fehler).">${matrix.fp !== undefined ? matrix.fp : na}</td></tr><tr><td class="fw-bold">${methode}-</td><td data-tippy-content="Falsch Negativ (FN): ${methode}- aber N+. Anzahl Patienten, die von Methode ${methode} fälschlicherweise als negativ vorhergesagt wurden (Typ-II-Fehler).">${matrix.fn !== undefined ? matrix.fn : na}</td><td data-tippy-content="Richtig Negativ (RN): ${methode}- und N-. Anzahl Patienten, die von Methode ${methode} korrekt als negativ vorhergesagt wurden.">${matrix.rn !== undefined ? matrix.rn : na}</td></tr></tbody></table>`;
        
        let metricsHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-guete-metrics-${methode}-${kollektivName.replace(/\s+/g, '_')}"><caption>Diagnostische Gütekriterien für Methode ${methode} im Kollektiv ${displayKollektivName}</caption><thead><tr><th>Metrik</th><th>Wert (95% CI)</th><th>CI Methode</th></tr></thead><tbody>
            <tr><td data-tippy-content="${Common.getMetricDescriptionHTML('sens', methode)}">Sensitivität</td><td data-tippy-content="${Common.getMetricInterpretationHTML('sens', stats.sens, methode, displayKollektivName)}">${fCI_perf(stats.sens, 'sens')}</td><td>${stats.sens?.method || na}</td></tr>
            <tr><td data-tippy-content="${Common.getMetricDescriptionHTML('spez', methode)}">Spezifität</td><td data-tippy-content="${Common.getMetricInterpretationHTML('spez', stats.spez, methode, displayKollektivName)}">${fCI_perf(stats.spez, 'spez')}</td><td>${stats.spez?.method || na}</td></tr>
            <tr><td data-tippy-content="${Common.getMetricDescriptionHTML('ppv', methode)}">PPV</td><td data-tippy-content="${Common.getMetricInterpretationHTML('ppv', stats.ppv, methode, displayKollektivName)}">${fCI_perf(stats.ppv, 'ppv')}</td><td>${stats.ppv?.method || na}</td></tr>
            <tr><td data-tippy-content="${Common.getMetricDescriptionHTML('npv', methode)}">NPV</td><td data-tippy-content="${Common.getMetricInterpretationHTML('npv', stats.npv, methode, displayKollektivName)}">${fCI_perf(stats.npv, 'npv')}</td><td>${stats.npv?.method || na}</td></tr>
            <tr><td data-tippy-content="${Common.getMetricDescriptionHTML('acc', methode)}">Accuracy</td><td data-tippy-content="${Common.getMetricInterpretationHTML('acc', stats.acc, methode, displayKollektivName)}">${fCI_perf(stats.acc, 'acc')}</td><td>${stats.acc?.method || na}</td></tr>
            <tr><td data-tippy-content="${Common.getMetricDescriptionHTML('balAcc', methode)}">Balanced Accuracy</td><td data-tippy-content="${Common.getMetricInterpretationHTML('balAcc', stats.balAcc, methode, displayKollektivName)}">${fCI_perf(stats.balAcc, 'balAcc')}</td><td>${stats.balAcc?.method || na}</td></tr>
            <tr><td data-tippy-content="${Common.getMetricDescriptionHTML('f1', methode)}">F1-Score</td><td data-tippy-content="${Common.getMetricInterpretationHTML('f1', stats.f1, methode, displayKollektivName)}">${fCI_perf(stats.f1, 'f1')}</td><td>${stats.f1?.method || na}</td></tr>
            <tr><td data-tippy-content="${Common.getMetricDescriptionHTML('auc', methode)}">AUC (Bal. Acc.)</td><td data-tippy-content="${Common.getMetricInterpretationHTML('auc', stats.auc, methode, displayKollektivName)}">${fCI_perf(stats.auc, 'auc')}</td><td>${stats.auc?.method || na}</td></tr>
        </tbody></table></div>`;
        return matrixHTML + metricsHTML;
    }

    /**
     * Erstellt den HTML-Inhalt für den Vergleich von Avocado Sign und T2-Kriterien.
     * @param {Object} stats - Die Vergleichsstatistik.
     * @param {string} kollektivName - Der Name des Kollektivs.
     * @param {string} t2ShortName - Der Kurzname für T2-Kriterien (z.B. "T2").
     * @returns {string} Der HTML-Code für den Vergleich.
     */
    createVergleichContentHTML(stats, kollektivName, t2ShortName = 'T2') {
        if (!stats || (!stats.mcnemar && !stats.delong)) return '<p class="text-muted small p-3">Keine Vergleichsdaten verfügbar.</p>';
        const na = '--';
        const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : StatisticsServiceInstance.roundToDecimalPlaces(pVal, 3)) : na;
        const displayKollektivName = TextConfig.getKollektivDisplayName(kollektivName);
        
        const getPValueInterpretationComp = (pValue, testKey, methode) => {
             const interpretationTemplate = TextConfig.TOOLTIP_CONTENT.statMetrics[testKey]?.interpretation || 'Keine Interpretation verfügbar.';
             const pStr = (pValue !== null && !isNaN(pValue)) ? (pValue < 0.001 ? '&lt;0.001' : StatisticsServiceInstance.roundToDecimalPlaces(pValue, 3)) : na;
             const sigText = Common.getStatisticalSignificanceText(pValue);
             return interpretationTemplate
                 .replace(/\[METHODE\]/g, `<strong>${methode}</strong>`)
                 .replace(/\[KOLLEKTIV1\]/g, `<strong>${displayKollektivName}</strong>`)
                 .replace(/\[KOLLEKTIV2\]/g, `<strong>${displayKollektivName}</strong>`) // Für diesen Kontext ist es dasselbe Kollektiv
                 .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                 .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`);
        };

        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}"><caption>Statistische Vergleiche zwischen Avocado Sign (AS) und T2-Kriterien (${t2ShortName}) im Kollektiv ${displayKollektivName}</caption><thead><tr><th>Test</th><th>Statistik</th><th>p-Wert</th><th>Methode</th></tr></thead><tbody>`;
        tableHTML += `<tr><td data-tippy-content="${Common.getTestDescriptionHTML('mcnemar', t2ShortName)}">McNemar (Accuracy)</td><td>${StatisticsServiceInstance.roundToDecimalPlaces(stats.mcnemar?.statistic, 3)} (df=${stats.mcnemar?.df || na})</td><td data-tippy-content="${getPValueInterpretationComp(stats.mcnemar?.pValue, 'mcnemar', 'McNemar')}">${fP(stats.mcnemar?.pValue)} ${Common.getStatisticalSignificanceSymbol(stats.mcnemar?.pValue)}</td><td>${stats.mcnemar?.method || na}</td></tr>`;
        tableHTML += `<tr><td data-tippy-content="${Common.getTestDescriptionHTML('delong', t2ShortName)}">DeLong (AUC)</td><td>Z=${StatisticsServiceInstance.roundToDecimalPlaces(stats.delong?.Z, 3)}</td><td data-tippy-content="${getPValueInterpretationComp(stats.delong?.pValue, 'delong', 'DeLong')}">${fP(stats.delong?.pValue)} ${Common.getStatisticalSignificanceSymbol(stats.delong?.pValue)} (Diff: ${StatisticsServiceInstance.roundToDecimalPlaces(stats.delong?.diffAUC, 3)}, Z=${StatisticsServiceInstance.roundToDecimalPlaces(stats.delong?.Z, 2)})</td><td>${stats.delong?.method || na}</td></tr>`;
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    /**
     * Erstellt den HTML-Inhalt für die Assoziationsanalyse.
     * @param {Object} stats - Die Assoziationsstatistik.
     * @param {string} kollektivName - Der Name des Kollektivs.
     * @param {Object} criteria - Die Kriterien, die zur Bestimmung der "Active"-Spalte verwendet werden.
     * @returns {string} Der HTML-Code für die Assoziationsanalyse.
     */
    createAssoziationContentHTML(stats, kollektivName, criteria) {
        if (!stats || Object.keys(stats).length === 0) return '<p class="text-muted small p-3">Keine Assoziationsdaten verfügbar.</p>';
        const na = '--';
        const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : StatisticsServiceInstance.roundToDecimalPlaces(pVal, 3)) : na;
        const displayKollektivName = TextConfig.getKollektivDisplayName(kollektivName);
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
             return Common.getAssociationInterpretationHTML(pTooltipKey, assocObj, merkmalName, displayKollektivName);
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
             const descriptionTemplate = TextConfig.TOOLTIP_CONTENT.statMetrics[pTooltipKey]?.description || TextConfig.TOOLTIP_CONTENT.statMetrics.defaultP.description || 'Testbeschreibung nicht verfügbar.';
             return descriptionTemplate.replace(/\[MERKMAL\]/g, `<strong>'${merkmalName}'</strong>`).replace(/\[VARIABLE\]/g, `<strong>'${merkmalName}'</strong>`);
        };

        const getMerkmalDescriptionHTMLAssoc = (key, assocObj) => {
             const baseName = TextConfig.TOOLTIP_CONTENT.statMetrics[key]?.name || assocObj?.featureName || key;
             const tooltipDescription = TextConfig.TOOLTIP_CONTENT.statMetrics[key]?.description || `Dieses Merkmal ('${baseName}') wird auf Assoziation mit dem N-Status getestet.`;
             return tooltipDescription.replace(/\[MERKMAL\]/g, `<strong>'${baseName}'</strong>`).replace(/\[METHODE\]/g, `<strong>'${baseName}'</strong>`);
        };


        const addRow = (key, assocObj, isActive = true) => {
            if (!assocObj) return '';
            const merkmalName = assocObj.featureName || key;
            const orStr = Common.formatCI(assocObj.or?.value, assocObj.or?.ci?.lower, assocObj.or?.ci?.upper, 2, false, na);
            const rdVal = assocObj.rd?.value;
            const rdCILower = assocObj.rd?.ci?.lower;
            const rdCIUpper = assocObj.rd?.ci?.upper;

            // Überprüfen, ob RD-Werte Zahlen sind, bevor multipliziert wird
            const rdValPerc = (typeof rdVal === 'number' && !isNaN(rdVal)) ? StatisticsServiceInstance.roundToDecimalPlaces(rdVal * 100, 1) : na;
            const rdCILowerPerc = (typeof rdCILower === 'number' && !isNaN(rdCILower)) ? StatisticsServiceInstance.roundToDecimalPlaces(rdCILower * 100, 1) : na;
            const rdCIUpperPerc = (typeof rdCIUpper === 'number' && !isNaN(rdCIUpper)) ? StatisticsServiceInstance.roundToDecimalPlaces(rdCIUpper * 100, 1) : na;

            const rdStr = (rdValPerc !== na && rdCILowerPerc !== na && rdCIUpperPerc !== na) ? `${rdValPerc}% (${rdCILowerPerc}% - ${rdCIUpperPerc}%)` : na;
            const phiStr = StatisticsServiceInstance.roundToDecimalPlaces(assocObj.phi?.value, 2);
            const pStr = fP(assocObj.pValue);
            const sigSymbol = Common.getStatisticalSignificanceSymbol(assocObj.pValue);
            const testName = assocObj.testName || na;
            const aktivText = isActive ? '' : ' <small class="text-muted">(inaktiv in T2-Def.)</small>';

            return `<tr>
                <td data-tippy-content="${getMerkmalDescriptionHTMLAssoc(key, assocObj)}">${merkmalName}${aktivText}</td>
                <td data-tippy-content="${Common.getAssociationInterpretationHTML('or', assocObj, merkmalName, displayKollektivName)}">${orStr}</td>
                <td data-tippy-content="${Common.getAssociationInterpretationHTML('rd', assocObj, merkmalName, displayKollektivName)}">${rdStr}</td>
                <td data-tippy-content="${Common.getAssociationInterpretationHTML('phi', assocObj, merkmalName, displayKollektivName)}">${phiStr}</td>
                <td data-tippy-content="${getPValueInterpretationAssoc(key, assocObj)}">${pStr} ${sigSymbol}</td>
                <td data-tippy-content="${getTestDescriptionAssoc(assocObj, key)}">${testName}</td>
            </tr>`;
        };

        if (stats.as) tableHTML += addRow('as', stats.as, true); // Avocado Sign immer aktiv
        if (stats.size_mwu && !isNaN(stats.size_mwu.pValue) && stats.size_mwu.testName && !stats.size_mwu.testName.includes("Invalid") && !stats.size_mwu.testName.includes("Nicht genug")) {
            const mwuObj = stats.size_mwu;
            const pStr = fP(mwuObj.pValue);
            const sigSymbol = Common.getStatisticalSignificanceSymbol(mwuObj.pValue);
            const pTooltip = getPValueInterpretationAssoc('size_mwu', mwuObj);
            const descTooltip = TextConfig.TOOLTIP_CONTENT.statMetrics.size_mwu.description || "Vergleich der medianen Lymphknotengröße zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test.";
            const testDescTooltip = getTestDescriptionAssoc(mwuObj, 'size_mwu');
            tableHTML += `<tr>
                <td data-tippy-content="${descTooltip}">${mwuObj.featureName || 'LK Größe (Median Vgl.)'}</td>
                <td>${na}</td><td>${na}</td><td>${na}</td>
                <td data-tippy-content="${pTooltip}">${pStr} ${sigSymbol}</td>
                <td data-tippy-content="${testDescTooltip}">${mwuObj.testName || na}</td>
            </tr>`;
        }
        
        // Reihenfolge der Features für die Assoziationstabelle
        const featureOrder = ['diameter_ln_max', 'morphology_round', 'signal_heterogeneous', 'edema_peritumoral', 'signal_low', 'inhomogeneous_contrast', 'necrosis', 'capsular_invasion'];
        featureOrder.forEach(key => {
            if (stats[key]) {
                // Ermittle, ob das Merkmal in den aktuell angewendeten T2-Kriterien aktiv ist
                // Hier müsste auf die `appliedT2Criteria` aus dem Auswertungstab zugegriffen werden
                // oder eine Liste der aktuell aktiven T2-Kriterien von `AppState` geholt werden.
                // Da `appliedT2Criteria` in `AuswertungViewLogic` liegt, müssen wir sie über `AppState` oder
                // ein globales Event holen. Für jetzt nehmen wir an, dass `criteria` korrekt übergeben wird.
                const isActive = criteria && criteria.some(c => c.param === key);
                tableHTML += addRow(key, stats[key], isActive);
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    /**
     * Erstellt den HTML-Inhalt für den Vergleich verschiedener Kollektive.
     * @param {Object} stats - Die Vergleichsstatistik zwischen Kollektiven.
     * @param {string} kollektiv1Name - Der Name des ersten Kollektivs.
     * @param {string} kollektiv2Name - Der Name des zweiten Kollektivs.
     * @returns {string} Der HTML-Code für den Kollektiv-Vergleich.
     */
    createVergleichKollektiveContentHTML(stats, kollektiv1Name, kollektiv2Name) {
        if (!stats || !stats.accuracyComparison || !stats.aucComparison) return '<p class="text-muted small p-3">Keine Kollektiv-Vergleichsdaten verfügbar.</p>';
        const na = '--';
        const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : StatisticsServiceInstance.roundToDecimalPlaces(pVal, 3)) : na;
        const kollektiv1Display = TextConfig.getKollektivDisplayName(kollektiv1Name);
        const kollektiv2Display = TextConfig.getKollektivDisplayName(kollektiv2Name);
        const accAS = stats.accuracyComparison?.as;
        const accT2 = stats.accuracyComparison?.t2;
        const aucAS = stats.aucComparison?.as;
        const aucT2 = stats.aucComparison?.t2;

        const getPValueInterpretationComp = (pValue, testKey, methode) => {
             const interpretationTemplate = TextConfig.TOOLTIP_CONTENT.statMetrics[testKey]?.interpretation || 'Keine Interpretation verfügbar.';
             const pStr = (pValue !== null && !isNaN(pValue)) ? (pValue < 0.001 ? '&lt;0.001' : StatisticsServiceInstance.roundToDecimalPlaces(pValue, 3)) : na;
             const sigText = Common.getStatisticalSignificanceText(pValue);
             return interpretationTemplate
                 .replace(/\[METHODE\]/g, `<strong>${methode}</strong>`)
                 .replace(/\[KOLLEKTIV1\]/g, `<strong>${kollektiv1Display}</strong>`)
                 .replace(/\[KOLLEKTIV2\]/g, `<strong>${kollektiv2Display}</strong>`)
                 .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                 .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`);
        };

        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-kollektive-${kollektiv1Name.replace(/\s+/g, '_')}-vs-${kollektiv2Name.replace(/\s+/g, '_')}"><caption>Vergleich der diagnostischen Leistung zwischen den Kollektiven ${kollektiv1Display} und ${kollektiv2Display}</caption><thead><tr><th>Vergleich</th><th>Methode</th><th>p-Wert</th><th>Test</th></tr></thead><tbody>`;
        tableHTML += `<tr><td>Accuracy</td><td>AS</td><td data-tippy-content="${getPValueInterpretationComp(accAS?.pValue, 'accComp', 'AS')}">${fP(accAS?.pValue)} ${Common.getStatisticalSignificanceSymbol(accAS?.pValue)}</td><td data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.statMetrics.accComp?.description || 'Vergleich Accuracy der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','AS')}">${accAS?.testName || na}</td></tr>`;
        tableHTML += `<tr><td>Accuracy</td><td>T2</td><td data-tippy-content="${getPValueInterpretationComp(accT2?.pValue, 'accComp', 'T2')}">${fP(accT2?.pValue)} ${Common.getStatisticalSignificanceSymbol(accT2?.pValue)}</td><td data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.statMetrics.accComp?.description || 'Vergleich Accuracy der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','T2')}">${accT2?.testName || na}</td></tr>`;
        tableHTML += `<tr><td>AUC</td><td>AS</td><td data-tippy-content="${getPValueInterpretationComp(aucAS?.pValue, 'aucComp', 'AS')}">${fP(aucAS?.pValue)} ${Common.getStatisticalSignificanceSymbol(aucAS?.pValue)} (Diff: ${StatisticsServiceInstance.roundToDecimalPlaces(aucAS?.diffAUC, 3)}, Z=${StatisticsServiceInstance.roundToDecimalPlaces(aucAS?.Z, 2)})</td><td data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.statMetrics.aucComp?.description || 'Vergleich AUC der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','AS')}">${aucAS?.method || na}</td></tr>`;
        tableHTML += `<tr><td>AUC</td><td>T2</td><td data-tippy-content="${getPValueInterpretationComp(aucT2?.pValue, 'aucComp', 'T2')}">${fP(aucT2?.pValue)} ${Common.getStatisticalSignificanceSymbol(aucT2?.pValue)} (Diff: ${StatisticsServiceInstance.roundToDecimalPlaces(aucT2?.diffAUC, 3)}, Z=${StatisticsServiceInstance.roundToDecimalPlaces(aucT2?.Z, 2)})</td><td data-tippy-content="${(TextConfig.TOOLTIP_CONTENT.statMetrics.aucComp?.description || 'Vergleich AUC der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','T2')}">${aucT2?.method || na}</td></tr>`;
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    /**
     * Erstellt den HTML-Inhalt für die Vergleichstabelle der Kriterien.
     * @param {Array<Object>} results - Die Ergebnisse der Kriterienvergleiche.
     * @param {string} globalKollektivName - Der Name des globalen Kollektivs.
     * @returns {string} Der HTML-Code für die Kriterienvergleichstabelle.
     */
    createCriteriaComparisonTableHTML(results, globalKollektivName) {
         if (!Array.isArray(results) || results.length === 0) return '<p class="text-muted small p-3">Keine Daten für Kriterienvergleich verfügbar.</p>';
         const tc = TextConfig.TOOLTIP_CONTENT || {};
         const cc = tc.criteriaComparisonTable || {};
         const headers = [
             { key: 'set', label: cc.tableHeaderSet || "Methode / Kriteriensatz", tooltip: cc.tableHeaderSet || "Die diagnostische Methode oder der spezifische Kriteriensatz, der evaluiert wird. 'Angewandte T2 Kriterien' sind die aktuell im Auswertungstab definierten. Literatur-Kriterien werden ggf. auf ihrem spezifischen Zielkollektiv evaluiert (in Klammern angegeben)." },
             { key: 'sens', label: cc.tableHeaderSens || "Sens.", tooltip: (cc.tableHeaderSens || "Sensitivität") + ": " + Common.getMetricDescriptionHTML('sens', 'der Methode') },
             { key: 'spez', label: cc.tableHeaderSpez || "Spez.", tooltip: (cc.tableHeaderSpez || "Spezifität") + ": " + Common.getMetricDescriptionHTML('spez', 'der Methode') },
             { key: 'ppv', label: cc.tableHeaderPPV || "PPV", tooltip: (cc.tableHeaderPPV || "PPV") + ": " + Common.getMetricDescriptionHTML('ppv', 'der Methode') },
             { key: 'npv', label: cc.tableHeaderNPV || "NPV", tooltip: (cc.tableHeaderNPV || "NPV") + ": " + Common.getMetricDescriptionHTML('npv', 'der Methode') },
             { key: 'acc', label: cc.tableHeaderAcc || "Acc.", tooltip: (cc.tableHeaderAcc || "Accuracy") + ": " + Common.getMetricDescriptionHTML('acc', 'der Methode') },
             { key: 'auc', label: cc.tableHeaderAUC || "AUC/BalAcc", tooltip: (cc.tableHeaderAUC || "AUC/Bal. Accuracy") + ": " + Common.getMetricDescriptionHTML('auc', 'der Methode') }
         ];
         const tableId = "table-kriterien-vergleich";
         const displayGlobalKollektivName = TextConfig.getKollektivDisplayName(globalKollektivName);
         let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped table-hover small caption-top" id="${tableId}"><caption>Vergleich verschiedener Kriteriensätze (vs. N) für das globale Kollektiv: ${displayGlobalKollektivName}</caption><thead class="small"><tr>`;
         headers.forEach(h => {
            const tooltipAttr = h.tooltip ? `data-tippy-content="${h.tooltip}"` : '';
            tableHTML += `<th ${tooltipAttr}>${h.label}</th>`;
         });
         tableHTML += `</tr></thead><tbody>`;

         results.forEach(result => {
             const isApplied = result.id === AppConfig.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
             const isAS = result.id === AppConfig.SPECIAL_IDS.AVOCADO_SIGN_ID;
             const isLiteratur = !isApplied && !isAS;

             let rowClass = '';
             if (isApplied) rowClass = 'table-primary';
             else if (isAS) rowClass = 'table-info';

             let nameDisplay = result.name || 'Unbekannt';
             let kollektivForInterpretation = result.specificKollektivName || globalKollektivName;
             let patientCountForInterpretation = result.specificKollektivN !== undefined ? result.specificKollektivN : result.globalN;
             const displayKollektivForInterpretation = TextConfig.getKollektivDisplayName(kollektivForInterpretation);

             if (isApplied) nameDisplay = AppConfig.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
             else if (isAS) nameDisplay = AppConfig.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME;

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


             const tooltipSens = Common.getMetricInterpretationHTML('sens', metricForTooltipAS, nameDisplay, displayKollektivForInterpretation);
             const tooltipSpez = Common.getMetricInterpretationHTML('spez', metricForTooltipSpez, nameDisplay, displayKollektivForInterpretation);
             const tooltipPPV = Common.getMetricInterpretationHTML('ppv', metricForTooltipPPV, nameDisplay, displayKollektivForInterpretation);
             const tooltipNPV = Common.getMetricInterpretationHTML('npv', metricForTooltipNPV, nameDisplay, displayKollektivForInterpretation);
             const tooltipAcc = Common.getMetricInterpretationHTML('acc', metricForTooltipAcc, nameDisplay, displayKollektivForInterpretation);
             const tooltipAUC = Common.getMetricInterpretationHTML('auc', metricForTooltipAUC, nameDisplay, displayKollektivForInterpretation);

             tableHTML += `<tr class="${rowClass}">
                             <td class="fw-bold">${nameDisplay}${nameSuffix}</td>
                             <td data-tippy-content="${tooltipSens}">${StatisticsServiceInstance.roundToDecimalPlaces(result.sens * 100, 1)}%</td>
                             <td data-tippy-content="${tooltipSpez}">${StatisticsServiceInstance.roundToDecimalPlaces(result.spez * 100, 1)}%</td>
                             <td data-tippy-content="${tooltipPPV}">${StatisticsServiceInstance.roundToDecimalPlaces(result.ppv * 100, 1)}%</td>
                             <td data-tippy-content="${tooltipNPV}">${StatisticsServiceInstance.roundToDecimalPlaces(result.npv * 100, 1)}%</td>
                             <td data-tippy-content="${tooltipAcc}">${StatisticsServiceInstance.roundToDecimalPlaces(result.acc * 100, 1)}%</td>
                             <td data-tippy-content="${tooltipAUC}">${StatisticsServiceInstance.roundToDecimalPlaces(result.auc, 3)}</td>
                           </tr>`;
         });
         tableHTML += `</tbody></table></div>`;
         tableHTML += `<p class="small text-muted px-2 mt-1">Hinweis: Werte für Literatur-Kriteriensätze werden idealerweise auf deren spezifischem Zielkollektiv (falls von globalem Kollektiv abweichend, in Klammern angegeben) berechnet, um eine faire Vergleichbarkeit mit den Originalpublikationen zu gewährleisten. Avocado Sign und 'Angewandte T2 Kriterien' beziehen sich immer auf das für diese Zeile angegebene N (Patientenzahl des spezifischen Kollektivs).</p>`;
         return tableHTML;
    }

    /**
     * Behandelt den Start der Brute-Force-Optimierung.
     */
    async handleRunBruteForce() {
        const patientData = AppState.patientData;
        if (!patientData || patientData.length === 0) {
            this.bruteForceResultsElement.innerHTML = '<p class="text-danger">Bitte zuerst Patientendaten laden.</p>';
            return;
        }

        // Annahme: Brute-Force soll Avocado Sign optimieren.
        // Später könnte man eine Auswahl für Kriterientypen hinzufügen.
        const criteriaType = Constants.CRITERIA_TYPES.AVOCADO_SIGN;
        const groundTruthKey = 'n_status'; // Pathologischer N-Status als Ground Truth

        this.runBruteForceButton.disabled = true;
        this.runBruteForceButton.textContent = 'Brute Force läuft...';
        this.bruteForceResultsElement.innerHTML = '<p class="text-info">Brute Force Optimierung gestartet. Dies kann eine Weile dauern...</p><div class="progress mt-2"><div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>';

        // Listener für Fortschritts-Updates vom Worker
        BruteForceManagerInstance.addProgressListener((progress) => {
            const progressBar = this.bruteForceResultsElement.querySelector('.progress-bar');
            if (progressBar) {
                // Hier wird der Roh-Iterationszähler verwendet.
                // Eine genauere Fortschrittsanzeige müsste die Gesamtanzahl der Iterationen kennen.
                // Für jetzt: Einfaches Update. Man könnte maxIterations vom Worker senden lassen.
                const percentage = Math.min(100, Math.floor((progress / 1000000) * 100)); // Beispiel: Max 1M Iterationen
                progressBar.style.width = `${percentage}%`;
                progressBar.setAttribute('aria-valuenow', percentage);
                progressBar.textContent = `${percentage}%`;
            }
        });

        try {
            const result = await BruteForceManagerInstance.startBruteForce(patientData, criteriaType, groundTruthKey);
            this.displayBruteForceResults(result);
        } catch (error) {
            console.error("Fehler bei der Brute Force Optimierung:", error);
            this.bruteForceResultsElement.innerHTML = `<p class="text-danger">Fehler bei der Brute Force Optimierung: ${error.message || error}</p>`;
        } finally {
            this.runBruteForceButton.disabled = false;
            this.runBruteForceButton.textContent = 'Brute Force Optimierung starten';
            // Fortschrittsbalken zurücksetzen
            const progressBar = this.bruteForceResultsElement.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = '0%';
                progressBar.setAttribute('aria-valuenow', 0);
                progressBar.textContent = '';
            }
            BruteForceManagerInstance.removeProgressListener(); // Listener entfernen
        }
    }

    /**
     * Zeigt die Ergebnisse der Brute-Force-Optimierung an.
     * @param {Object} result - Das Ergebnisobjekt von der Brute-Force-Optimierung.
     */
    displayBruteForceResults(result) {
        if (!result || !result.metrics) {
            this.bruteForceResultsElement.innerHTML = '<p class="text-warning">Brute Force Optimierung abgeschlossen, aber keine Ergebnisse. Möglicherweise nicht genug Daten oder keine optimale Kombination gefunden.</p>';
            return;
        }

        let resultHTML = `
            <h3>Optimale Kriterienkombination (Brute Force)</h3>
            <p>Optimierter F1-Score: <strong>${StatisticsServiceInstance.roundToDecimalPlaces(result.score, 4)}</strong></p>
            <p>Erfüllte Kriterien (Min.): <strong>${result.minCriteriaToMeet}</strong></p>
            <p>Kriterien-IDs: <code>${result.criteriaCombination.join(', ')}</code></p>
            <h4>Metriken der optimalen Kombination:</h4>
            <div class="table-responsive">
                <table class="table table-sm table-striped small">
                    <thead>
                        <tr>
                            <th>Metrik</th>
                            <th>Wert</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>True Positives (TP)</td><td>${result.metrics.tp}</td></tr>
                        <tr><td>True Negatives (TN)</td><td>${result.metrics.tn}</td></tr>
                        <tr><td>False Positives (FP)</td><td>${result.metrics.fp}</td></tr>
                        <tr><td>False Negatives (FN)</td><td>${result.metrics.fn}</td></tr>
                        <tr><td>Total</td><td>${result.metrics.total}</td></tr>
                        <tr><td>Sensitivität</td><td>${StatisticsServiceInstance.roundToDecimalPlaces(result.metrics.sensitivity * 100, 2)}%</td></tr>
                        <tr><td>Spezifität</td><td>${StatisticsServiceInstance.roundToDecimalPlaces(result.metrics.specificity * 100, 2)}%</td></tr>
                        <tr><td>Accuracy</td><td>${StatisticsServiceInstance.roundToDecimalPlaces(result.metrics.accuracy * 100, 2)}%</td></tr>
                        <tr><td>PPV</td><td>${StatisticsServiceInstance.roundToDecimalPlaces(result.metrics.ppv * 100, 2)}%</td></tr>
                        <tr><td>NPV</td><td>${StatisticsServiceInstance.roundToDecimalPlaces(result.metrics.npv * 100, 2)}%</td></tr>
                        <tr><td>F1-Score</td><td>${StatisticsServiceInstance.roundToDecimalPlaces(result.metrics.f1Score, 4)}</td></tr>
                    </tbody>
                </table>
            </div>
            <p class="mt-3 text-muted small">Hinweis: Die genaue Bedeutung der Kriterien-IDs finden Sie in den Anwendungs-Konstanten.</p>
        `;
        this.bruteForceResultsElement.innerHTML = resultHTML;
        Tooltip.initializeTooltips();
    }

    /**
     * Aktualisiert die Ansicht des Statistik-Tabs.
     * Berechnet Statistiken neu und rendert die Ergebnisse.
     */
    updateView() {
        const patientData = AppState.patientData;
        if (!patientData || patientData.length === 0) {
            this.statisticsResultsElement.innerHTML = '<p class="text-muted">Bitte Patientendaten im "Daten"-Tab laden, um Statistiken anzuzeigen.</p>';
            if (this.rocChartInstance) {
                this.rocChartInstance.destroy();
                this.rocChartInstance = null;
            }
            this.bruteForceResultsElement.innerHTML = '';
            return;
        }

        // 1. Deskriptive Statistik
        const descriptiveStats = StatisticsServiceInstance.calculateDescriptiveStatistics(patientData);
        let deskriptivHTML = `
            <h2>Deskriptive Statistik</h2>
            <div class="card mb-4">
                <div class="card-body">
                    ${this.createDeskriptiveStatistikContentHTML(descriptiveStats, 'global', 'Gesamtkollektiv')}
                </div>
            </div>
        `;

        // 2. Gütekriterien für Avocado Sign und T2
        // Stellen Sie sicher, dass avocado_sign_status und t2_criteria_status vorhanden sind
        // und dass der avocado_sign_score für die ROC-Kurve verfügbar ist.
        // Diese sollten bereits durch den Auswertungstab gesetzt worden sein.
        const asMetrics = StatisticsServiceInstance.calculateMetrics(patientData, 'avocado_sign_status', 'n_status');
        const t2Metrics = StatisticsServiceInstance.calculateMetrics(patientData, 't2_criteria_status', 'n_status');

        let gueteHTML = `
            <h2>Diagnostische Gütekriterien</h2>
            <div class="row">
                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-header">Avocado Sign</div>
                        <div class="card-body">
                            ${this.createGueteContentHTML(asMetrics, 'AS', 'Gesamtkollektiv')}
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-header">T2-Kriterien</div>
                        <div class="card-body">
                            ${this.createGueteContentHTML(t2Metrics, 'T2', 'Gesamtkollektiv')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 3. Vergleich (McNemar, DeLong)
        const mcnemarResult = StatisticsServiceInstance.calculateMcNemarTest(patientData, 'avocado_sign_status', 't2_criteria_status', 'n_status');
        
        // Für DeLong müssen wir Daten mit kontinuierlichen Scores liefern, die für ROC relevant sind.
        // Hier: Avocado Sign Score vs. N-Status als Ground Truth.
        const rocDataForDelong = patientData.map(p => ({
            avocado_score: p.avocado_sign_score, // Kontinuierlicher Score
            t2_score: p.t2_criteria_score, // Kontinuierlicher Score
            groundTruth: p.n_status
        }));
        // Der DeLong-Test im StatisticsService ist als Platzhalter, daher die Ergebnisse hier NaN.
        const delongResult = StatisticsServiceInstance.calculateDeLongTest(
            rocDataForDelong.filter(d => typeof d.avocado_score === 'number' && !isNaN(d.avocado_score)),
            rocDataForDelong.filter(d => typeof d.t2_score === 'number' && !isNaN(d.t2_score)),
            'avocado_score', 't2_score', 'groundTruth'
        );

        let vergleichHTML = `
            <h2>Vergleich von AS und T2-Kriterien</h2>
            <div class="card mb-4">
                <div class="card-body">
                    ${this.createVergleichContentHTML({ mcnemar: mcnemarResult, delong: delongResult }, 'Gesamtkollektiv', 'T2')}
                </div>
            </div>
        `;

        // 4. Assoziationsanalyse
        const associationStats = {};
        // Hole alle Parameter, die in den Avocado Sign Kriterien oder T2 Kriterien definiert sind
        const allRelevantParams = new Set();
        Constants.AVOCADO_SIGN_CRITERIA.forEach(c => allRelevantParams.add(c.param));
        Object.values(Constants.T2_CRITERIA_DEFINITIONS).flat().forEach(c => allRelevantParams.add(c.param));
        
        allRelevantParams.forEach(param => {
            // Führe Assoziationsanalyse nur für boolesche Features durch (OR, RD, Phi, Chi-Quadrat)
            // oder numerische (Mann-Whitney U)
            // Hier Annahme: Wenn Parameter boolesch ist, wird er mit Chi-Quadrat getestet.
            // Wenn numerisch, dann mit Mann-Whitney U.
            const firstPatientValue = patientData.length > 0 ? patientData[0][param] : undefined;

            if (typeof firstPatientValue === 'boolean') {
                 associationStats[param] = StatisticsServiceInstance.calculateAssociationStatistics(patientData, param, 'n_status');
                 associationStats[param].featureName = Constants.AVOCADO_SIGN_CRITERIA.find(c => c.param === param)?.name ||
                                                         Object.values(Constants.T2_CRITERIA_DEFINITIONS).flat().find(c => c.param === param)?.name || param;
            } else if (typeof firstPatientValue === 'number') {
                 associationStats[`${param}_mwu`] = StatisticsServiceInstance.calculateMannWhitneyU(patientData, param, 'n_status');
                 associationStats[`${param}_mwu`].featureName = Constants.AVOCADO_SIGN_CRITERIA.find(c => c.param === param)?.name ||
                                                              Object.values(Constants.T2_CRITERIA_DEFINITIONS).flat().find(c => c.param === param)?.name || param;
            }
        });
        
        // Übertrage den `featureName` für Avocado Sign selbst in die Assoziationsergebnisse
        associationStats.as = StatisticsServiceInstance.calculateAssociationStatistics(patientData, 'avocado_sign_status', 'n_status');
        associationStats.as.featureName = "Avocado Sign";

        // Für die Darstellung der "aktiven" Kriterien in der Assoziationstabelle,
        // nutzen wir die `appliedT2Criteria` aus dem `AuswertungViewLogicInstance`,
        // welche die flache Liste aller angewendeten einzelnen Kriterien enthält.
        const currentlyAppliedT2Criteria = AuswertungViewLogicInstance.appliedT2Criteria;

        let assoziationHTML = `
            <h2>Assoziationsanalyse mit N-Status</h2>
            <div class="card mb-4">
                <div class="card-body">
                    ${this.createAssoziationContentHTML(associationStats, 'Gesamtkollektiv', currentlyAppliedT2Criteria)}
                </div>
            </div>
        `;

        // 5. Kriterien-Vergleichstabelle (Performance Literatur vs. AS vs. T2 angewandt)
        const criteriaComparisonResults = [
            { id: AppConfig.SPECIAL_IDS.AVOCADO_SIGN_ID, name: AppConfig.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...asMetrics, globalN: patientData.length },
            { id: AppConfig.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, name: AppConfig.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME, ...t2Metrics, globalN: patientData.length },
            // Feste Literatur-Kriterien-Sets hinzufügen (berechnet auf globalem Kollektiv)
            ...Object.keys(Constants.T2_CRITERIA_DEFINITIONS).map(key => {
                const definition = Constants.T2_CRITERIA_DEFINITIONS[key];
                const simulatedData = patientData.map(p => ({
                    ...p,
                    // Hier berechnen wir den T2-Status für jedes Literatur-Set direkt
                    // um die Metriken zu erhalten.
                    // Die calculateT2Criteria Funktion im T2CriteriaManagerInstance prüft, ob ALLE Kriterien des Sets erfüllt sind.
                    t2_status_literatur: T2CriteriaManagerInstance.calculateT2Criteria(p, definition)
                }));
                const metrics = StatisticsServiceInstance.calculateMetrics(simulatedData, 't2_status_literatur', 'n_status');
                // AUC für binäre Klassifizierer ist NaN, es sei denn, wir haben einen Score
                // Für diese Literatur-Kriterien nehmen wir an, dass sie einen score hätten.
                // Wenn kein Score verfügbar, ist AUC NaN.
                const rocResult = StatisticsServiceInstance.calculateROCAndAUC(simulatedData, 't2_criteria_score', 'n_status'); // Nutzt den Score, falls er existiert
                return {
                    id: key,
                    name: key,
                    sens: metrics.sensitivity,
                    spez: metrics.specificity,
                    ppv: metrics.ppv,
                    npv: metrics.npv,
                    acc: metrics.accuracy,
                    auc: rocResult.auc, // Nimmt AUC aus der Berechnung, ist NaN wenn kein Score vorhanden
                    globalN: patientData.length
                };
            })
        ];

        let criteriaComparisonHTML = `
            <h2>Vergleich verschiedener Kriteriensätze</h2>
            <div class="card mb-4">
                <div class="card-body">
                    ${this.createCriteriaComparisonTableHTML(criteriaComparisonResults, 'Gesamtkollektiv')}
                </div>
            </div>
        `;

        this.statisticsResultsElement.innerHTML = deskriptivHTML + gueteHTML + vergleichHTML + assoziationHTML + criteriaComparisonHTML;

        // Diagramme nach dem Rendern der HTML-Struktur zeichnen
        this.drawCharts(descriptiveStats);
        // ROC-Kurve mit dem tatsächlichen Avocado Sign Score
        const rocData = patientData.map(p => ({
            score: p.avocado_sign_score !== undefined ? p.avocado_sign_score : (p.avocado_sign_status ? 1 : 0),
            groundTruth: p.n_status
        }));
        const rocResult = StatisticsServiceInstance.calculateROCAndAUC(rocData, 'score', 'groundTruth');
        this.drawROCChart(rocResult.rocPoints);
        Tooltip.initializeTooltips(); // Initialisiere Tooltips für die neu gerenderten Elemente
    }

    /**
     * Zeichnet die Alters- und Geschlechterverteilungsdiagramme.
     * @param {Object} descriptiveStats - Die deskriptiven Statistikdaten.
     */
    drawCharts(descriptiveStats) {
        if (!descriptiveStats || !descriptiveStats.deskriptiv) return;

        // Altersverteilungs-Histogramm (beispielhaft, benötigt Altersdaten in Klassen)
        const ageChartCtxElement = document.getElementById(`chart-stat-age-global`);
        if (ageChartCtxElement) {
            const ageData = descriptiveStats.deskriptiv.alter.data || []; // Annahme: `alter.data` enthält die Rohdaten
            const ageBins = [0, 40, 50, 60, 70, 100]; // Beispiel-Bins
            const ageLabels = ["<40", "40-50", "50-60", "60-70", ">70"];
            const binnedData = new Array(ageBins.length - 1).fill(0);

            ageData.forEach(age => {
                for (let i = 0; i < ageBins.length - 1; i++) {
                    if (age >= ageBins[i] && (age < ageBins[i+1] || i === ageBins.length - 2)) {
                        binnedData[i]++;
                        break;
                    }
                }
            });

            if (ageChartCtxElement.chart) ageChartCtxElement.chart.destroy(); // Vorherige Instanz zerstören
            ageChartCtxElement.chart = new Chart(ageChartCtxElement.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ageLabels,
                    datasets: [{
                        label: 'Anzahl Patienten',
                        data: binnedData,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `Altersverteilung (${TextConfig.getKollektivDisplayName('Gesamtkollektiv')})`
                        },
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Anzahl Patienten' } },
                        x: { title: { display: true, text: 'Alter (Jahre)' } }
                    }
                }
            });
        }

        // Geschlechterverteilungs-Donut-Chart
        const genderChartCtxElement = document.getElementById(`chart-stat-gender-global`);
        if (genderChartCtxElement) {
            if (genderChartCtxElement.chart) genderChartCtxElement.chart.destroy(); // Vorherige Instanz zerstören
            const genderLabels = ['Männlich', 'Weiblich', 'Unbekannt'];
            const genderData = [
                descriptiveStats.deskriptiv.geschlecht?.m ?? 0,
                descriptiveStats.deskriptiv.geschlecht?.f ?? 0,
                descriptiveStats.deskriptiv.geschlecht?.u ?? 0
            ];
            const backgroundColors = ['#36A2EB', '#FF6384', '#FFCE56'];

            genderChartCtxElement.chart = new Chart(genderChartCtxElement.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: genderLabels,
                    datasets: [{
                        data: genderData,
                        backgroundColor: backgroundColors
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `Geschlechterverteilung (${TextConfig.getKollektivDisplayName('Gesamtkollektiv')})`
                        },
                        legend: { position: 'right' }
                    }
                }
            });
        }
    }

    /**
     * Zeichnet die ROC-Kurve mit Chart.js.
     * @param {Array<Object>} rocPoints - Array von ROC-Punkten ({fpr, tpr}).
     */
    drawROCChart(rocPoints) {
        if (!this.rocChartCanvas) return;

        if (this.rocChartInstance) {
            this.rocChartInstance.destroy();
        }

        const data = {
            labels: rocPoints.map(p => p.fpr), // FPR Werte auf der X-Achse
            datasets: [{
                label: 'ROC Curve',
                data: rocPoints.map(p => ({ x: p.fpr, y: p.tpr })),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                pointRadius: 3,
                pointBackgroundColor: 'rgb(75, 192, 192)'
            },
            {
                label: 'Random Classifier',
                data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
                fill: false,
                borderColor: 'rgb(201, 203, 207)',
                borderDash: [5, 5],
                pointRadius: 0
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'ROC Curve (Avocado Sign)'
                },
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        title: (context) => `FPR: ${StatisticsServiceInstance.roundToDecimalPlaces(context[0].parsed.x, 3)}`,
                        label: (context) => `TPR: ${StatisticsServiceInstance.roundToDecimalPlaces(context[0].parsed.y, 3)}`
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'False Positive Rate (1 - Specificity)'
                    },
                    min: 0,
                    max: 1
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'True Positive Rate (Sensitivity)'
                    },
                    min: 0,
                    max: 1
                }
            }
        };

        this.rocChartInstance = new Chart(this.rocChartCanvas, {
            type: 'scatter',
            data: data,
            options: options
        });
    }
}

// Instanziierung der Klasse, um sie global verfügbar zu machen.
const StatistikViewLogicInstance = new StatistikViewLogic();
