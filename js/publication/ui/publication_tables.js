const publicationTables = (() => {

    function _generateTableShell(tableId, radiologyLabel, title, lang, footnoteKey) {
        let footnoteText = "";
        if (footnoteKey && typeof UI_TEXTS !== 'undefined' && UI_TEXTS.TOOLTIP_CONTENT && UI_TEXTS.TOOLTIP_CONTENT.publicationFootnotes && UI_TEXTS.TOOLTIP_CONTENT.publicationFootnotes[footnoteKey]) {
            footnoteText = lang === 'de' ?
                (UI_TEXTS.TOOLTIP_CONTENT.publicationFootnotes[footnoteKey].de || UI_TEXTS.TOOLTIP_CONTENT.publicationFootnotes[footnoteKey].en) :
                (UI_TEXTS.TOOLTIP_CONTENT.publicationFootnotes[footnoteKey].en || UI_TEXTS.TOOLTIP_CONTENT.publicationFootnotes[footnoteKey].de);
        } else if (footnoteKey) {
            footnoteText = `Fußnote für ${footnoteKey} nicht gefunden.`;
        }


        const fullTitle = `${radiologyLabel}: ${title}.`;
        let html = `<div class="publication-table-container mt-4 mb-5" id="${tableId}-container">`;
        html += `<p class="publication-table-title"><strong>${fullTitle}</strong></p>`;
        html += `<div class="table-responsive">`;
        html += `<table class="table table-sm table-bordered table-striped small publication-table" id="${tableId}">`;
        return { htmlOpening: html, footnoteText: footnoteText };
    }

    function _finalizeTableShell(htmlSoFar, footnoteText, lang) {
        htmlSoFar += `</tbody></table></div>`;
        if (footnoteText) {
            htmlSoFar += `<p class="publication-table-footnote small mt-1"><em>${footnoteText}</em></p>`;
        }
        htmlSoFar += `</div>`;
        return htmlSoFar;
    }

    function renderLiteraturT2KriterienTabelle(aggregatedData, lang = 'de') {
        const tableConfig = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle;
        const title = lang === 'de' ? tableConfig.titleDe : tableConfig.titleEn;
        const shell = _generateTableShell(tableConfig.id, tableConfig.radiologyLabel, title, lang, 'literaturT2Kriterien');
        let html = shell.htmlOpening;

        html += `<thead><tr>
                    <th>${lang === 'de' ? 'Studie / Kriteriensatz' : 'Study / Criteria Set'}</th>
                    <th>${lang === 'de' ? 'Primäres Zielkollektiv (Orig.)' : 'Primary Target Cohort (Orig.)'}</th>
                    <th>${lang === 'de' ? 'Kernkriterien (Kurzfassung)' : 'Core Criteria (Summary)'}</th>
                    <th>${lang === 'de' ? 'Logik' : 'Logic'}</th>
                </tr></thead><tbody>`;

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const kriterienText = studySet.logic === 'KOMBINIERT' ?
                    (studySet.studyInfo?.keyCriteriaSummary || studySet.description || (lang === 'de' ? 'Details siehe Originalpublikation' : 'Details see original publication')) :
                    studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, false);

                html += `<tr>
                            <td>${studySet.name || studySet.labelKey}</td>
                            <td>${getKollektivDisplayName(studySet.applicableKollektiv)} (${studySet.context || 'N/A'})</td>
                            <td style="white-space: normal;">${kriterienText}</td>
                            <td>${(UI_TEXTS.t2LogicDisplayNames && UI_TEXTS.t2LogicDisplayNames[studySet.logic]) || studySet.logic}</td>
                          </tr>`;
            }
        });
        return _finalizeTableShell(html, shell.footnoteText, lang);
    }

    function renderPatientenCharakteristikaTabelle(aggregatedData, lang = 'de') {
        if (!aggregatedData || !aggregatedData.allKollektivStats || !aggregatedData.allKollektivStats.Gesamt?.deskriptiv) {
            return `<p class="text-danger">${lang === 'de' ? 'Patientencharakteristika-Tabelle nicht verfügbar: Daten fehlen.' : 'Patient characteristics table not available: data missing.'}</p>`;
        }
        const tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle;
        const title = lang === 'de' ? tableConfig.titleDe : tableConfig.titleEn;
        const shell = _generateTableShell(tableConfig.id, tableConfig.radiologyLabel, title, lang, 'patientenCharakteristika');
        let html = shell.htmlOpening;

        const gesamtData = aggregatedData.allKollektivStats.Gesamt.deskriptiv;
        const direktOpData = aggregatedData.allKollektivStats['direkt OP']?.deskriptiv || {};
        const nrctData = aggregatedData.allKollektivStats.nRCT?.deskriptiv || {};

        const nGesamt = gesamtData.anzahlPatienten || 0;
        const nDirektOP = direktOpData.anzahlPatienten || 0;
        const nNRCT = nrctData.anzahlPatienten || 0;

        html += `<thead><tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>${getKollektivDisplayName('Gesamt')} (N=${radiologyFormatter.formatRadiologyNumber(nGesamt, 0)})</th>
                    <th>${getKollektivDisplayName('direkt OP')} (N=${radiologyFormatter.formatRadiologyNumber(nDirektOP, 0)})</th>
                    <th>${getKollektivDisplayName('nRCT')} (N=${radiologyFormatter.formatRadiologyNumber(nNRCT, 0)})</th>
                </tr></thead><tbody>`;

        const na = '--';
        const addRow = (labelDe, labelEn, getterGesamt, getterDirektOP, getterNRCT) => {
            html += `<tr>
                        <td>${lang === 'de' ? labelDe : labelEn}</td>
                        <td>${getterGesamt(gesamtData, nGesamt) || na}</td>
                        <td>${nDirektOP > 0 ? (getterDirektOP(direktOpData, nDirektOP) || na) : na}</td>
                        <td>${nNRCT > 0 ? (getterNRCT(nrctData, nNRCT) || na) : na}</td>
                      </tr>`;
        };

        addRow(
            lang === 'de' ? 'Alter (Jahre), Median (IQR)' : 'Age (Years), Median (IQR)',
            lang === 'de' ? 'Age (Years), Median (IQR)' : 'Age (Years), Median (IQR)',
            (p) => p.alter ? radiologyFormatter.formatMedianIQR(p.alter.median, p.alter.q1, p.alter.q3, 0, 0) : na,
            (p) => p.alter ? radiologyFormatter.formatMedianIQR(p.alter.median, p.alter.q1, p.alter.q3, 0, 0) : na,
            (p) => p.alter ? radiologyFormatter.formatMedianIQR(p.alter.median, p.alter.q1, p.alter.q3, 0, 0) : na
        );
        addRow(
            lang === 'de' ? 'Alter (Jahre), Mittelwert ± SD' : 'Age (Years), Mean ± SD',
            lang === 'de' ? 'Age (Years), Mean ± SD' : 'Age (Years), Mean ± SD',
            (p) => p.alter ? radiologyFormatter.formatMeanSD(p.alter.mean, p.alter.sd, 0, 0) : na,
            (p) => p.alter ? radiologyFormatter.formatMeanSD(p.alter.mean, p.alter.sd, 0, 0) : na,
            (p) => p.alter ? radiologyFormatter.formatMeanSD(p.alter.mean, p.alter.sd, 0, 0) : na
        );
        addRow(
            lang === 'de' ? 'Männer, n (%)' : 'Men, n (%)',
            lang === 'de' ? 'Men, n (%)' : 'Men, n (%)',
            (p, total) => radiologyFormatter.formatPercentageForRadiology(p.geschlecht?.m, total, 0),
            (p, total) => radiologyFormatter.formatPercentageForRadiology(p.geschlecht?.m, total, 0),
            (p, total) => radiologyFormatter.formatPercentageForRadiology(p.geschlecht?.m, total, 0)
        );
        addRow(
            lang === 'de' ? 'Pathologischer N-Status positiv, n (%)' : 'Pathologic N-Status positive, n (%)',
            lang === 'de' ? 'Pathologic N-Status positive, n (%)' : 'Pathologic N-Status positive, n (%)',
            (p, total) => radiologyFormatter.formatPercentageForRadiology(p.nStatus?.plus, total, 0),
            (p, total) => radiologyFormatter.formatPercentageForRadiology(p.nStatus?.plus, total, 0),
            (p, total) => radiologyFormatter.formatPercentageForRadiology(p.nStatus?.plus, total, 0)
        );
         return _finalizeTableShell(html, shell.footnoteText, lang);
    }

    function _renderSinglePerformanceTable(statsData, methodName, kollektivId, lang, tableConfig) {
        const title = (lang === 'de' ? tableConfig.titleDe : tableConfig.titleEn).replace('{METHOD_NAME}', methodName).replace('{KOLLEKTIV_NAME}', getKollektivDisplayName(kollektivId));
        const shell = _generateTableShell(tableConfig.id + "_" + methodName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') + "_" + kollektivId.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''), tableConfig.radiologyLabel, title, lang, tableConfig.footnoteKey || 'diagnostischeGuete');
        let html = shell.htmlOpening;
        const nPat = statsData?.matrix ? (statsData.matrix.rp + statsData.matrix.fp + statsData.matrix.fn + statsData.matrix.rn) : 0;
        const na = '--';

        html += `<thead><tr>
                    <th>${lang === 'de' ? 'Metrik' : 'Metric'}</th>
                    <th>${lang === 'de' ? 'Wert (95% KI)' : 'Value (95% CI)'}</th>
                    <th>${lang === 'de' ? 'Nenner (Erfolg/Gesamt)' : 'Denominator (Success/Total)'}</th>
                 </tr></thead><tbody>`;

        if (!statsData || nPat === 0) {
            html += `<tr><td colspan="3">${lang === 'de' ? 'Keine ausreichenden Daten für diese Analyse.' : 'Insufficient data for this analysis.'}</td></tr>`;
        } else {
            const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
            const metricNames = {
                sens: lang === 'de' ? 'Sensitivität' : 'Sensitivity',
                spez: lang === 'de' ? 'Spezifität' : 'Specificity',
                ppv: lang === 'de' ? 'Positiver Prädiktiver Wert' : 'Positive Predictive Value',
                npv: lang === 'de' ? 'Negativer Prädiktiver Wert' : 'Negative Predictive Value',
                acc: lang === 'de' ? 'Genauigkeit' : 'Accuracy',
                balAcc: lang === 'de' ? 'Balanced Accuracy' : 'Balanced Accuracy',
                f1: lang === 'de' ? 'F1-Score' : 'F1-Score',
                auc: lang === 'de' ? 'AUC' : 'AUC'
            };

            metrics.forEach(key => {
                const metric = statsData[key];
                const isRate = !['f1', 'auc'].includes(key);
                const digits = (key === 'auc' || key === 'f1') ? 2 : 0; // Radiology uses 2 for AUC, and often 0 for %
                const formattedCI = metric ? radiologyFormatter.formatRadiologyCI(metric.value, metric.ci?.lower, metric.ci?.upper, digits, isRate) : na;
                const nSuccess = metric?.n_success !== undefined && metric?.n_success !== null && !isNaN(metric.n_success) ? radiologyFormatter.formatRadiologyNumber(metric.n_success,0) : '?';
                const nTrials = metric?.n_trials !== undefined && metric?.n_trials !== null && !isNaN(metric.n_trials) ? radiologyFormatter.formatRadiologyNumber(metric.n_trials,0): '?';
                const denominatorStr = (metric?.n_success !== undefined && metric?.n_trials !== undefined) ? `${nSuccess}/${nTrials}` : na;

                html += `<tr>
                            <td>${metricNames[key]}</td>
                            <td>${formattedCI}</td>
                            <td>${denominatorStr}</td>
                         </tr>`;
            });
        }
        return _finalizeTableShell(html, shell.footnoteText, lang);
    }
    
    function renderDiagnostischeGueteASTabelle(aggregatedData, lang = 'de') {
        const tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle;
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        let combinedHtml = '';
        kollektive.forEach(kolId => {
            const statsAS = aggregatedData.allKollektivStats[kolId]?.gueteAS;
            combinedHtml += _renderSinglePerformanceTable(statsAS, 'Avocado Sign', kolId, lang, tableConfig);
        });
        return combinedHtml;
    }

    function renderDiagnostischeGueteLiteraturT2Tabelle(aggregatedData, lang = 'de') {
        const tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle;
        let combinedHtml = '';
        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(litConf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(litConf.id);
            if (studySet) {
                const targetKollektiv = studySet.applicableKollektiv || 'Gesamt';
                const statsLit = aggregatedData.allKollektivStats[targetKollektiv]?.gueteT2_literatur?.[litConf.id];
                combinedHtml += _renderSinglePerformanceTable(statsLit, studySet.name || litConf.labelKey, targetKollektiv, lang, tableConfig);
            }
        });
        return combinedHtml;
    }
    
    function renderDiagnostischeGueteOptimierteT2Tabelle(aggregatedData, lang = 'de') {
        const common = aggregatedData.common;
        const bfZielMetricKey = common.targetBruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        let bfZielMetricDisplay = bfZielMetricKey;
        const metricOption = PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === bfZielMetricKey);
        if (metricOption) {
            bfZielMetricDisplay = lang === 'de' ? metricOption.labelDe : metricOption.labelEn;
        }
        const tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle;
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        let combinedHtml = '';

        kollektive.forEach(kolId => {
            const statsBF = aggregatedData.allKollektivStats[kolId]?.gueteT2_bruteforce;
            const methodName = (lang === 'de' ? `Optimierte T2-Kriterien (Ziel: ${bfZielMetricDisplay})` : `Optimized T2 Criteria (Target: ${bfZielMetricDisplay})`);
            combinedHtml += _renderSinglePerformanceTable(statsBF, methodName, kolId, lang, tableConfig);
        });
        return combinedHtml;
    }

    function renderStatistischerVergleichAST2Tabelle(aggregatedData, lang = 'de') {
        const common = aggregatedData.common;
        const tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle;
        const title = lang === 'de' ? tableConfig.titleDe : tableConfig.titleEn;
        const shell = _generateTableShell(tableConfig.id, tableConfig.radiologyLabel, title, lang, 'statistischerVergleich');
        let html = shell.htmlOpening;
        const na = '--';
        
        html += `<thead><tr>
                    <th>${lang === 'de' ? 'Vergleich' : 'Comparison'}</th>
                    <th>${lang === 'de' ? 'Kollektiv' : 'Cohort'}</th>
                    <th>${lang === 'de' ? 'AUC Methode 1' : 'AUC Method 1'}</th>
                    <th>${lang === 'de' ? 'AUC Methode 2' : 'AUC Method 2'}</th>
                    <th>${lang === 'de' ? 'Differenz AUC (M1–M2)' : 'AUC Difference (M1–M2)'}</th>
                    <th>${lang === 'de' ? 'P-Wert (DeLong)' : 'P Value (DeLong)'}</th>
                    <th>${lang === 'de' ? 'P-Wert (McNemar, Acc.)' : 'P Value (McNemar, Acc.)'}</th>
                </tr></thead><tbody>`;

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const bfZielMetricKey = common.targetBruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
         let bfZielMetricDisplay = bfZielMetricKey;
        const metricOption = PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === bfZielMetricKey);
        if (metricOption) {
            bfZielMetricDisplay = lang === 'de' ? metricOption.labelDe : metricOption.labelEn;
        }


        kollektive.forEach(kolId => {
            const asStats = aggregatedData.allKollektivStats[kolId]?.gueteAS;
            const bfStats = aggregatedData.allKollektivStats[kolId]?.gueteT2_bruteforce;
            const vergleichASvsBF = aggregatedData.allKollektivStats[kolId]?.vergleichASvsT2_bruteforce;

            if (asStats && bfStats && vergleichASvsBF) {
                const aucASStr = radiologyFormatter.formatRadiologyCI(asStats.auc?.value, asStats.auc?.ci?.lower, asStats.auc?.ci?.upper, 2, false);
                const aucBFStr = radiologyFormatter.formatRadiologyCI(bfStats.auc?.value, bfStats.auc?.ci?.lower, bfStats.auc?.ci?.upper, 2, false);
                const diffAUCStr = radiologyFormatter.formatRadiologyNumber(vergleichASvsBF.delong?.diffAUC, 2, false, true);
                const pDelong = radiologyFormatter.formatRadiologyPValue(vergleichASvsBF.delong?.pValue);
                const pMcNemar = radiologyFormatter.formatRadiologyPValue(vergleichASvsBF.mcnemar?.pValue);
                
                html += `<tr>
                            <td>AS vs. T2 (optim. ${bfZielMetricDisplay})</td>
                            <td>${getKollektivDisplayName(kolId)}</td>
                            <td>${aucASStr}</td>
                            <td>${aucBFStr}</td>
                            <td>${diffAUCStr}</td>
                            <td>${pDelong}</td>
                            <td>${pMcNemar}</td>
                         </tr>`;
            } else {
                 html += `<tr>
                            <td>AS vs. T2 (optim. ${bfZielMetricDisplay})</td>
                            <td>${getKollektivDisplayName(kolId)}</td>
                            <td colspan="5">${lang === 'de' ? 'Daten für diesen Vergleich nicht vollständig.' : 'Data for this comparison incomplete.'}</td>
                         </tr>`;
            }
        });
        return _finalizeTableShell(html, shell.footnoteText, lang);
    }

    return Object.freeze({
        renderLiteraturT2KriterienTabelle,
        renderPatientenCharakteristikaTabelle,
        renderDiagnostischeGueteASTabelle,
        renderDiagnostischeGueteLiteraturT2Tabelle,
        renderDiagnostischeGueteOptimierteT2Tabelle,
        renderStatistischerVergleichAST2Tabelle
    });
})();
