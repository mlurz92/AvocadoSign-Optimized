const publikationContentGenerator = (() => {

    const NA = '--';

    function _formatValue(value, digits = 1, unit = '', placeholder = NA) {
        if (value === null || value === undefined || isNaN(value)) return placeholder;
        return `${formatNumber(value, digits, placeholder)}${unit}`;
    }

    function _formatPercentValue(value, digits = 1, placeholder = NA) {
        if (value === null || value === undefined || isNaN(value)) return placeholder;
        return formatPercent(value, digits, placeholder);
    }

    function _formatCIValue(metricObj, digits = 1, isPercent = true, placeholder = NA) {
        if (!metricObj || typeof metricObj.value !== 'number' || isNaN(metricObj.value)) return placeholder;
        const valueStr = isPercent ? formatPercent(metricObj.value, digits, placeholder) : formatNumber(metricObj.value, digits, placeholder);
        if (!metricObj.ci || typeof metricObj.ci.lower !== 'number' || typeof metricObj.ci.upper !== 'number' || isNaN(metricObj.ci.lower) || isNaN(metricObj.ci.upper)) {
            return valueStr;
        }
        const lowerStr = isPercent ? formatPercent(metricObj.ci.lower, digits, placeholder) : formatNumber(metricObj.ci.lower, digits, placeholder);
        const upperStr = isPercent ? formatPercent(metricObj.ci.upper, digits, placeholder) : formatNumber(metricObj.ci.upper, digits, placeholder);
        return `${valueStr} (95% CI: ${lowerStr} – ${upperStr})`;
    }

    function _getPValueText(pValue, significanceLevel = APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL) {
        if (pValue === null || pValue === undefined || isNaN(pValue)) return `p = ${NA}`;
        if (pValue < 0.001) return "p < 0.001";
        return `p = ${formatNumber(pValue, 3)}`;
    }

    function _getStudyPatientNumbers(studyId) {
        const study = studyT2CriteriaManager.getStudyCriteriaSetById(studyId);
        if (!study || !study.studyInfo || !study.studyInfo.patientCohort) return 'N/A';
        const match = study.studyInfo.patientCohort.match(/N\s*=\s*(\d+)/i);
        return match ? match[1] : 'N/A';
    }

    function _getPatientCharacteristicsTableHTML(descriptiveStats, lang) {
        if (!descriptiveStats || descriptiveStats.anzahlPatienten === 0) {
            return `<p class="text-muted">${lang === 'de' ? 'Keine Patientendaten für Tabelle verfügbar.' : 'No patient data available for table.'}</p>`;
        }
        const d = descriptiveStats;
        const totalN = d.anzahlPatienten;
        const headers = lang === 'de' ?
            ["Merkmal", "Gesamtkollektiv (N=" + totalN + ")"] :
            ["Characteristic", "Overall Cohort (N=" + totalN + ")"];

        const rows = [
            [lang === 'de' ? "Alter, Median (IQR) [Jahre]" : "Age, Median (IQR) [Years]", `${_formatValue(d.alter?.median, 1)} (${_formatValue(d.alter?.q1,1)}–${_formatValue(d.alter?.q3,1)})`],
            [lang === 'de' ? "Alter, Mittelwert (SD) [Jahre]" : "Age, Mean (SD) [Years]", `${_formatValue(d.alter?.mean, 1)} (${_formatValue(d.alter?.sd, 1)})`],
            [lang === 'de' ? "Geschlecht, n (%)" : "Sex, n (%)", ""],
            [`  ${UI_TEXTS.legendLabels.male}`, `${d.geschlecht?.m || 0} (${_formatPercentValue((d.geschlecht?.m || 0) / totalN)})`],
            [`  ${UI_TEXTS.legendLabels.female}`, `${d.geschlecht?.f || 0} (${_formatPercentValue((d.geschlecht?.f || 0) / totalN)})`],
            [lang === 'de' ? "Therapiegruppe, n (%)" : "Treatment Group, n (%)", ""],
            [`  ${UI_TEXTS.kollektivDisplayNames['direkt OP']}`, `${d.therapie?.['direkt OP'] || 0} (${_formatPercentValue((d.therapie?.['direkt OP'] || 0) / totalN)})`],
            [`  ${UI_TEXTS.kollektivDisplayNames['nRCT']}`, `${d.therapie?.nRCT || 0} (${_formatPercentValue((d.therapie?.nRCT || 0) / totalN)})`],
            [lang === 'de' ? "Pathologischer N-Status, n (%)" : "Pathological N-Status, n (%)", ""],
            [`  N+`, `${d.nStatus?.plus || 0} (${_formatPercentValue((d.nStatus?.plus || 0) / totalN)})`],
            [`  N-`, `${d.nStatus?.minus || 0} (${_formatPercentValue((d.nStatus?.minus || 0) / totalN)})`],
        ];

        let html = `<div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th>${headers[0]}</th><th>${headers[1]}</th></tr></thead><tbody>`;
        rows.forEach(row => {
            html += `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`;
        });
        html += `</tbody></table></div>`;
        return html;
    }

    function _getPerformanceTableHTML(perfData, methodName, lang, includeCI = true) {
        if (!perfData) return `<p class="text-muted">${lang === 'de' ? `Keine Performancedaten für ${methodName} verfügbar.` : `No performance data available for ${methodName}.`}</p>`;
        const headers = lang === 'de' ?
            ["Metrik", `Wert${includeCI ? " (95% CI)" : ""}`] :
            ["Metric", `Value${includeCI ? " (95% CI)" : ""}`];
        const metrics = [
            {key: 'sens', name: lang === 'de' ? "Sensitivität" : "Sensitivity"},
            {key: 'spez', name: lang === 'de' ? "Spezifität" : "Specificity"},
            {key: 'ppv', name: lang === 'de' ? "Positiver Prädiktiver Wert" : "Positive Predictive Value"},
            {key: 'npv', name: lang === 'de' ? "Negativer Prädiktiver Wert" : "Negative Predictive Value"},
            {key: 'acc', name: lang === 'de' ? "Accuracy" : "Accuracy"},
            {key: 'balAcc', name: lang === 'de' ? "Balanced Accuracy" : "Balanced Accuracy"},
            {key: 'f1', name: "F1-Score"},
            {key: 'auc', name: "AUC"}
        ];
        let html = `<div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th>${headers[0]}</th><th>${headers[1]}</th></tr></thead><tbody>`;
        metrics.forEach(metric => {
            const metricObj = perfData[metric.key];
            const valueStr = includeCI ? _formatCIValue(metricObj, (metric.key === 'auc' || metric.key === 'f1' || metric.key === 'balAcc') ? 3 : 1, true, NA) : _formatPercentValue(metricObj?.value, (metric.key === 'auc' || metric.key === 'f1' || metric.key === 'balAcc') ? 3 : 1, NA);
            html += `<tr><td>${metric.name}</td><td>${valueStr}</td></tr>`;
        });
        html += `</tbody></table></div>`;
        return html;
    }

    function _getComparisonTableHTML(asPerf, t2Perf, t2SetName, compStats, lang) {
         if (!asPerf || !t2Perf || !compStats) return `<p class="text-muted">${lang === 'de' ? 'Unvollständige Daten für Vergleichstabelle.' : 'Incomplete data for comparison table.'}</p>`;
         const headers = lang === 'de' ?
            ["Metrik", "Avocado Sign (95% CI)", `${t2SetName} (95% CI)`, "p-Wert (Vergleich)"] :
            ["Metric", "Avocado Sign (95% CI)", `${t2SetName} (95% CI)`, "p-value (Comparison)"];

        const metrics = [
            {key: 'acc', name: lang === 'de' ? "Accuracy" : "Accuracy", test: compStats.mcnemar},
            {key: 'auc', name: "AUC", test: compStats.delong}
        ];
        let html = `<div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th>${headers[0]}</th><th>${headers[1]}</th><th>${headers[2]}</th><th>${headers[3]}</th></tr></thead><tbody>`;
        metrics.forEach(metric => {
            const asVal = _formatCIValue(asPerf[metric.key], 3, false, NA);
            const t2Val = _formatCIValue(t2Perf[metric.key], 3, false, NA);
            const pText = _getPValueText(metric.test?.pValue);
            html += `<tr><td>${metric.name}</td><td>${asVal}</td><td>${t2Val}</td><td>${pText}</td></tr>`;
        });
        html += `</tbody></table></div>`;
        return html;
    }

    function _getOptimizedT2ComparisonTableHTML(asPerf, optimizedT2Perf, optimizedT2CriteriaText, compStats, lang, kollektivName) {
        if (!asPerf || !optimizedT2Perf || !compStats) return `<p class="text-muted">${lang === 'de' ? `Keine Daten für Vergleichstabelle (Optimiert vs. AS) für Kollektiv ${kollektivName}.` : `Incomplete data for comparison table (Optimized vs. AS) for cohort ${kollektivName}.`}</p>`;

        const headers = lang === 'de' ?
            ["Metrik", "Avocado Sign (95% CI)", `Optimiertes T2 (${kollektivName}) (95% CI)`, "p-Wert (Vergleich)"] :
            ["Metric", "Avocado Sign (95% CI)", `Optimized T2 (${kollektivName}) (95% CI)`, "p-value (Comparison)"];

        const metrics = [
            {key: 'sens', name: lang === 'de' ? "Sensitivität" : "Sensitivity"},
            {key: 'spez', name: lang === 'de' ? "Spezifität" : "Specificity"},
            {key: 'ppv', name: lang === 'de' ? "PPV" : "PPV"},
            {key: 'npv', name: lang === 'de' ? "NPV" : "NPV"},
            {key: 'acc', name: lang === 'de' ? "Accuracy" : "Accuracy", test: compStats.mcnemar},
            {key: 'balAcc', name: lang === 'de' ? "Balanced Accuracy" : "Balanced Accuracy"},
            {key: 'auc', name: "AUC", test: compStats.delong}
        ];
        let html = `<p class="small text-muted">${lang === 'de' ? 'Optimierte Kriterien:' : 'Optimized criteria:'} ${optimizedT2CriteriaText}</p>`;
        html += `<div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th>${headers[0]}</th><th>${headers[1]}</th><th>${headers[2]}</th><th>${headers[3]}</th></tr></thead><tbody>`;
        metrics.forEach(metric => {
            const asVal = _formatCIValue(asPerf[metric.key], (metric.key === 'auc' || metric.key === 'balAcc') ? 3 : 1, true, NA);
            const t2Val = _formatCIValue(optimizedT2Perf[metric.key], (metric.key === 'auc' || metric.key === 'balAcc') ? 3 : 1, true, NA);
            const pText = metric.test ? _getPValueText(metric.test?.pValue) : NA;
            html += `<tr><td>${metric.name}</td><td>${asVal}</td><td>${t2Val}</td><td>${pText}</td></tr>`;
        });
        html += `</tbody></table></div>`;
        return html;
    }

    function _getEinzelmerkmaleTableHTML(associations, lang, currentGlobalKollektiv) {
        if (!associations || Object.keys(associations).length === 0) {
            return `<p class="text-muted">${lang === 'de' ? 'Keine Assoziationsdaten für einzelne Merkmale verfügbar.' : 'No association data available for individual features.'}</p>`;
        }
        const headers = lang === 'de' ?
            ["T2-Merkmal", "OR (95% CI)", "RD (%) (95% CI)", "Phi (φ)", "p-Wert"] :
            ["T2 Feature", "OR (95% CI)", "RD (%) (95% CI)", "Phi (φ)", "p-value"];

        let html = `<div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th>${headers[0]}</th><th>${headers[1]}</th><th>${headers[2]}</th><th>${headers[3]}</th><th>${headers[4]}</th></tr></thead><tbody>`;
        const featureOrder = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];

        featureOrder.forEach(key => {
            const assocData = associations[key];
            if (assocData && assocData.featureName) {
                const orStr = _formatCIValue(assocData.or, 2, false, NA);
                const rdVal = assocData.rd?.value !== null && !isNaN(assocData.rd.value) ? assocData.rd.value * 100 : NaN;
                const rdLower = assocData.rd?.ci?.lower !== null && !isNaN(assocData.rd.ci.lower) ? assocData.rd.ci.lower * 100 : NaN;
                const rdUpper = assocData.rd?.ci?.upper !== null && !isNaN(assocData.rd.ci.upper) ? assocData.rd.ci.upper * 100 : NaN;
                const rdStr = `${_formatValue(rdVal, 1, '%')} (${_formatValue(rdLower,1)}% – ${_formatValue(rdUpper,1)}%)`;
                const phiStr = _formatValue(assocData.phi?.value, 2, '', NA);
                const pText = _getPValueText(assocData.pValue);
                html += `<tr><td>${assocData.featureName}</td><td>${orStr}</td><td>${rdStr}</td><td>${phiStr}</td><td>${pText}</td></tr>`;
            }
        });
        html += `</tbody></table></div>`;
        return html;
    }


    function _generateMethodenSectionHTML(lang, allProcessedData) {
        let html = '';
        const descStatsAll = statisticsService.calculateDescriptiveStats(allProcessedData);
        const nGesamt = descStatsAll?.anzahlPatienten || 0;
        const nDirektOP = allProcessedData.filter(p => p.therapie === 'direkt OP').length;
        const nNRCT = allProcessedData.filter(p => p.therapie === 'nRCT').length;

        let textStudienanlage = UI_TEXTS.publikationTab.methodenSection.studienanlage.textVorschlag[lang] || '';
        textStudienanlage = textStudienanlage
            .replace(/\[N_GESAMT\]/g, nGesamt)
            .replace(/\[N_DIREKT_OP\]/g, nDirektOP)
            .replace(/\[N_DIREKT_OP_PERCENT\]/g, _formatPercentValue(nDirektOP / nGesamt))
            .replace(/\[N_NRCT\]/g, nNRCT)
            .replace(/\[N_NRCT_PERCENT\]/g, _formatPercentValue(nNRCT / nGesamt))
            .replace(/\[PLATZHALTER_ETHIKVOTUM_NUMMER\]/g, lang === 'de' ? '2019-12345-BO-ff' : '2019-12345-BO-ff (Example)');

        html += publikationUIComponents.createPublikationContentCard(
            UI_TEXTS.publikationTab.methodenSection.studienanlage.title[lang],
            textStudienanlage,
            "pub-methoden-studie", "text"
        );

        html += publikationUIComponents.createPublikationContentCard(
            UI_TEXTS.publikationTab.methodenSection.mrtProtokoll.title[lang],
            UI_TEXTS.publikationTab.methodenSection.mrtProtokoll.textVorschlag[lang],
            "pub-methoden-mrt", "text"
        );

        let textBildanalyse = UI_TEXTS.publikationTab.methodenSection.bildanalyse.textVorschlag[lang] || '';
        textBildanalyse = textBildanalyse
            .replace(/\[KOH_N\]/g, _getStudyPatientNumbers('koh_2008_morphology'))
            .replace(/\[BARBARO_N\]/g, _getStudyPatientNumbers('barbaro_2024_restaging'))
            .replace(/\[RUTEGARD_N\]/g, _getStudyPatientNumbers('rutegard_et_al_esgar'))
            .replace(/\[PLATZHALTER_INTEROBSERVER_T2_DETAILS\]/g, lang === 'de' ? 'Die Interobserver-Reliabilität für die T2-Merkmale wurde in dieser Studie nicht erneut evaluiert und basiert auf den Angaben der zitierten Literatur bzw. der klinischen Routine.' : 'Interobserver reliability for T2 features was not re-evaluated in this study and is based on the cited literature or clinical routine.');

        html += publikationUIComponents.createPublikationContentCard(
            UI_TEXTS.publikationTab.methodenSection.bildanalyse.title[lang],
            textBildanalyse,
            "pub-methoden-bildanalyse", "text"
        );

        html += publikationUIComponents.createPublikationContentCard(
            UI_TEXTS.publikationTab.methodenSection.histopathologie.title[lang],
            UI_TEXTS.publikationTab.methodenSection.histopathologie.textVorschlag[lang],
            "pub-methoden-histo", "text"
        );

        let textStatistik = UI_TEXTS.publikationTab.methodenSection.statistik.textVorschlag[lang] || '';
        textStatistik = textStatistik
            .replace(/\[APP_CONFIG.APP_VERSION\]/g, APP_CONFIG.APP_VERSION)
            .replace(/\${APP_CONFIG.APP_VERSION}/g, APP_CONFIG.APP_VERSION)
            .replace(/\[APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS\]/g, APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS)
            .replace(/\${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS}/g, APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS)
            .replace(/\[APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL\]/g, APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL)
            .replace(/\${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL}/g, APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL);


        html += publikationUIComponents.createPublikationContentCard(
            UI_TEXTS.publikationTab.methodenSection.statistik.title[lang],
            textStatistik,
            "pub-methoden-statistik", "text"
        );

        return { html: html, charts: [] };
    }

    function _generateErgebnisseSectionHTML(lang, filteredData, allProcessedData, appliedCriteria, appliedLogic, currentGlobalKollektiv, lastBruteForceResults) {
        let html = '';
        const charts = [];
        const kollektivDisplayName = getKollektivDisplayName(currentGlobalKollektiv);
        const descStats = statisticsService.calculateDescriptiveStats(filteredData);
        const nGesamtCurrentKollektiv = descStats?.anzahlPatienten || 0;

        let textPatienten = UI_TEXTS.publikationTab.ergebnisseSection.patientenCharakteristika.textVorschlag[lang] || '';
        textPatienten = textPatienten
            .replace(/\[N_GESAMT\]/g, nGesamtCurrentKollektiv)
            .replace(/\[MEDIAN_ALTER\]/g, _formatValue(descStats.alter?.median, 1))
            .replace(/\[IQR_ALTER_Q1\]/g, _formatValue(descStats.alter?.q1, 1))
            .replace(/\[IQR_ALTER_Q3\]/g, _formatValue(descStats.alter?.q3, 1))
            .replace(/\[N_MAENNLICH\]/g, descStats.geschlecht?.m || 0)
            .replace(/\[N_MAENNLICH_PERCENT\]/g, _formatPercentValue((descStats.geschlecht?.m || 0) / nGesamtCurrentKollektiv))
            .replace(/\[N_DIREKT_OP\]/g, filteredData.filter(p => p.therapie === 'direkt OP').length)
            .replace(/\[N_DIREKT_OP_PERCENT\]/g, _formatPercentValue(filteredData.filter(p => p.therapie === 'direkt OP').length / nGesamtCurrentKollektiv))
            .replace(/\[N_NRCT\]/g, filteredData.filter(p => p.therapie === 'nRCT').length)
            .replace(/\[N_NRCT_PERCENT\]/g, _formatPercentValue(filteredData.filter(p => p.therapie === 'nRCT').length / nGesamtCurrentKollektiv))
            .replace(/\[N_N_PLUS\]/g, descStats.nStatus?.plus || 0)
            .replace(/\[N_N_PLUS_PERCENT\]/g, _formatPercentValue((descStats.nStatus?.plus || 0) / nGesamtCurrentKollektiv));

        html += publikationUIComponents.createPublikationContentCard(
            UI_TEXTS.publikationTab.ergebnisseSection.patientenCharakteristika.title[lang],
            textPatienten + _getPatientCharacteristicsTableHTML(descStats, lang),
            "pub-ergebnisse-charakteristika", "table"
        );

        const perfAS = statisticsService.calculateDiagnosticPerformance(filteredData, 'as', 'n');
        let textASPerf = UI_TEXTS.publikationTab.ergebnisseSection.performanceASGesamt.textVorschlag[lang] || '';
        textASPerf = textASPerf
            .replace(/\[N_GESAMT\]/g, nGesamtCurrentKollektiv)
            .replace(/\[AS_SENS_GESAMT\]/g, _formatValue(perfAS?.sens?.value * 100, 1))
            .replace(/\[AS_SENS_CI_L_GESAMT\]/g, _formatValue(perfAS?.sens?.ci?.lower * 100, 1))
            .replace(/\[AS_SENS_CI_U_GESAMT\]/g, _formatValue(perfAS?.sens?.ci?.upper * 100, 1))
            .replace(/\[AS_SPEZ_GESAMT\]/g, _formatValue(perfAS?.spez?.value * 100, 1))
            .replace(/\[AS_SPEZ_CI_L_GESAMT\]/g, _formatValue(perfAS?.spez?.ci?.lower * 100, 1))
            .replace(/\[AS_SPEZ_CI_U_GESAMT\]/g, _formatValue(perfAS?.spez?.ci?.upper * 100, 1))
            .replace(/\[AS_AUC_GESAMT\]/g, _formatValue(perfAS?.auc?.value, 3))
            .replace(/\[AS_AUC_CI_L_GESAMT\]/g, _formatValue(perfAS?.auc?.ci?.lower, 3))
            .replace(/\[AS_AUC_CI_U_GESAMT\]/g, _formatValue(perfAS?.auc?.ci?.upper, 3));

        html += publikationUIComponents.createPublikationContentCard(
            `${UI_TEXTS.publikationTab.ergebnisseSection.performanceASGesamt.title[lang]} (${kollektivDisplayName})`,
            textASPerf + _getPerformanceTableHTML(perfAS, "Avocado Sign", lang),
            "pub-ergebnisse-as-kollektiv", "table"
        );

        let vergleichTextGesamt = UI_TEXTS.publikationTab.ergebnisseSection.vergleichAST2Literatur.textVorschlag[lang] || '';
        let vergleichTabellenHTML = '';
        const literaturSets = APP_CONFIG.DEFAULT_SETTINGS.CRITERIA_COMPARISON_SETS.filter(id => id !== APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID && id !== APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID);

        literaturSets.forEach((setId, index) => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(setId);
            if (!studySet) return;

            const targetKollektivId = studySet.applicableKollektiv || 'Gesamt';
            const targetKollektivData = dataProcessor.filterDataByKollektiv(allProcessedData, targetKollektivId);
            const targetKollektivName = getKollektivDisplayName(targetKollektivId);
            const targetN = targetKollektivData.length;

            if (targetN === 0) return;

            const evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(targetKollektivData), studySet);
            const perfAS_TargetKollektiv = statisticsService.calculateDiagnosticPerformance(targetKollektivData, 'as', 'n');
            const perfT2_TargetKollektiv = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n');
            const vergleichStats_TargetKollektiv = statisticsService.compareDiagnosticMethods(evaluatedDataT2, 'as', 't2', 'n');

            const t2SetName = studySet.name || studySet.id;
            vergleichTabellenHTML += `<h4>${lang === 'de' ? 'Vergleich mit' : 'Comparison with'} ${t2SetName} (${targetKollektivName}, N=${targetN})</h4>`;
            vergleichTabellenHTML += _getComparisonTableHTML(perfAS_TargetKollektiv, perfT2_TargetKollektiv, t2SetName, vergleichStats_TargetKollektiv, lang);

            const placeholderBase = setId.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
            vergleichTextGesamt = vergleichTextGesamt
                .replace(new RegExp(`\\[N_${placeholderBase}_VERGLEICH\\]`, 'g'), targetN)
                .replace(new RegExp(`\\[AS_AUC_${placeholderBase}_VERGLEICH\\]`, 'g'), _formatValue(perfAS_TargetKollektiv?.auc?.value, 3))
                .replace(new RegExp(`\\[${placeholderBase}_AUC_${placeholderBase}_VERGLEICH\\]`, 'g'), _formatValue(perfT2_TargetKollektiv?.auc?.value, 3))
                .replace(new RegExp(`\\[P_DELONG_AS_VS_${placeholderBase}\\]`, 'g'), _getPValueText(vergleichStats_TargetKollektiv?.delong?.pValue))
                .replace(new RegExp(`\\[AS_ACC_${placeholderBase}_VERGLEICH\\]`, 'g'), _formatPercentValue(perfAS_TargetKollektiv?.acc?.value))
                .replace(new RegExp(`\\[${placeholderBase}_ACC_${placeholderBase}_VERGLEICH\\]`, 'g'), _formatPercentValue(perfT2_TargetKollektiv?.acc?.value))
                .replace(new RegExp(`\\[P_MCNEMAR_AS_VS_${placeholderBase}\\]`, 'g'), _getPValueText(vergleichStats_TargetKollektiv?.mcnemar?.pValue))
                .replace(new RegExp(`\\[SIGNIFIKANZ_ACC_AS_VS_${placeholderBase}(_EN)?\\]`, 'g'), (match, p1_en) => {
                    const pVal = vergleichStats_TargetKollektiv?.mcnemar?.pValue;
                    if (pVal === null || pVal === undefined || isNaN(pVal)) return lang === 'de' ? 'nicht eindeutig' : 'inconclusive';
                    return pVal < APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL ? (lang === 'de' ? 'signifikant' : 'significantly') : (lang === 'de' ? 'nicht signifikant' : 'not significantly');
                })
                .replace(new RegExp(`\\[VERGLEICH_AUC_AS_VS_${placeholderBase}(_EN)?\\]`, 'g'), (match, p1_en) => {
                     const diff = (perfAS_TargetKollektiv?.auc?.value || 0) - (perfT2_TargetKollektiv?.auc?.value || 0);
                     if (Math.abs(diff) < 0.01 && (vergleichStats_TargetKollektiv?.delong?.pValue >= APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL) ) return lang === 'de' ? 'vergleichbar' : 'comparable';
                     return diff > 0 ? (lang === 'de' ? 'höher' : 'higher') : (lang === 'de' ? 'niedriger' : 'lower');
                })
                 .replace(new RegExp(`\\[VERGLEICH_ACC_AS_VS_${placeholderBase}(_EN)?\\]`, 'g'), (match, p1_en) => {
                     const diff = (perfAS_TargetKollektiv?.acc?.value || 0) - (perfT2_TargetKollektiv?.acc?.value || 0);
                     if (Math.abs(diff) < 0.01 && (vergleichStats_TargetKollektiv?.mcnemar?.pValue >= APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL) ) return lang === 'de' ? 'vergleichbar' : 'comparable';
                     return diff > 0 ? (lang === 'de' ? 'höher' : 'higher') : (lang === 'de' ? 'niedriger' : 'lower');
                });
        });

        html += publikationUIComponents.createPublikationContentCard(
            UI_TEXTS.publikationTab.ergebnisseSection.vergleichAST2Literatur.title[lang],
            vergleichTextGesamt + vergleichTabellenHTML,
            "pub-ergebnisse-vergleich-as-t2-literatur", "table"
        );

        let textOptimiert = UI_TEXTS.publikationTab.ergebnisseSection.optimierteT2Kriterien.textVorschlag[lang] || '';
        let optimierteTabellenHTML = '';
        const kollektiveForBF = ['Gesamt', 'direkt OP', 'nRCT'];
        kollektiveForBF.forEach(kollId => {
            const bfResKoll = lastBruteForceResults && lastBruteForceResults.kollektiv === kollId ? lastBruteForceResults : null; // Annahme: lastBruteForceResults enthält nur für ein Kollektiv
            const bfDataKoll = dataProcessor.filterDataByKollektiv(allProcessedData, kollId);
            const nKoll = bfDataKoll.length;
            if (nKoll === 0) return;

            const placeholderBase = `OPTIMAL_T2_KRITERIEN_${kollId.toUpperCase().replace(' ','')}`;
            const placeholderBalAcc = `OPTIMAL_T2_BALACC_${kollId.toUpperCase().replace(' ','')}`;
            const placeholderSens = `OPTIMAL_T2_SENS_${kollId.toUpperCase().replace(' ','')}`;
            const placeholderSpez = `OPTIMAL_T2_SPEZ_${kollId.toUpperCase().replace(' ','')}`;
            const placeholderTextKey = `${placeholderBase}_TEXT${lang === 'en' ? '_EN' : ''}`;

            if (bfResKoll && bfResKoll.bestResult) {
                const bestCrit = bfResKoll.bestResult;
                const critText = studyT2CriteriaManager.formatCriteriaForDisplay(bestCrit.criteria, bestCrit.logic, false);
                const evalDataOpt = t2CriteriaManager.evaluateDataset(cloneDeep(bfDataKoll), bestCrit.criteria, bestCrit.logic);
                const perfOpt = statisticsService.calculateDiagnosticPerformance(evalDataOpt, 't2', 'n');
                const perfASOptKoll = statisticsService.calculateDiagnosticPerformance(bfDataKoll, 'as', 'n');
                const compStatsOpt = statisticsService.compareDiagnosticMethods(evalDataOpt, 'as', 't2', 'n');

                textOptimiert = textOptimiert
                    .replace(new RegExp(`\\[${placeholderTextKey}\\]`, 'g'), critText)
                    .replace(new RegExp(`\\[${placeholderBalAcc}\\]`, 'g'), _formatValue(perfOpt?.balAcc?.value, 3))
                    .replace(new RegExp(`\\[${placeholderSens}\\]`, 'g'), _formatPercentValue(perfOpt?.sens?.value))
                    .replace(new RegExp(`\\[${placeholderSpez}\\]`, 'g'), _formatPercentValue(perfOpt?.spez?.value));

                optimierteTabellenHTML += `<h4>${lang === 'de' ? 'Kollektiv:' : 'Cohort:'} ${getKollektivDisplayName(kollId)} (N=${nKoll})</h4>`;
                optimierteTabellenHTML += _getOptimizedT2ComparisonTableHTML(perfASOptKoll, perfOpt, critText, compStatsOpt, lang, getKollektivDisplayName(kollId));
            } else {
                 textOptimiert = textOptimiert
                    .replace(new RegExp(`\\[${placeholderTextKey}\\]`, 'g'), lang === 'de' ? 'Keine Optimierungsergebnisse verfügbar' : 'No optimization results available')
                    .replace(new RegExp(`\\[${placeholderBalAcc}\\]`, 'g'), NA)
                    .replace(new RegExp(`\\[${placeholderSens}\\]`, 'g'), NA)
                    .replace(new RegExp(`\\[${placeholderSpez}\\]`, 'g'), NA);
            }
        });
         textOptimiert = textOptimiert.replace(/\[N_GESAMT\]/g, allProcessedData.length)
                                   .replace(/\[N_DIREKT_OP\]/g, allProcessedData.filter(p => p.therapie === 'direkt OP').length)
                                   .replace(/\[N_NRCT\]/g, allProcessedData.filter(p => p.therapie === 'nRCT').length);


        html += publikationUIComponents.createPublikationContentCard(
            UI_TEXTS.publikationTab.ergebnisseSection.optimierteT2Kriterien.title[lang],
            textOptimiert + optimierteTabellenHTML,
            "pub-ergebnisse-optimiert-t2", "table"
        );

        const associations = statisticsService.calculateAssociations(filteredData, appliedCriteria);
        let textEinzel = UI_TEXTS.publikationTab.ergebnisseSection.einzelmerkmaleT2.textVorschlag[lang] || '';
        const sigMerkmale = [], nonSigMerkmale = [];
        if (associations) {
            const featureKeys = ['size_mwu', 'form', 'kontur', 'homogenitaet', 'signal']; // size_mwu für MWU, andere für Fisher
            featureKeys.forEach(key => {
                const assocData = associations[key];
                if (assocData && assocData.featureName) {
                    if (assocData.pValue < APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL) {
                        sigMerkmale.push(assocData.featureName);
                    } else {
                        nonSigMerkmale.push(assocData.featureName);
                    }
                }
            });
        }
        textEinzel = textEinzel
            .replace(/\[N_GESAMT\]/g, nGesamtCurrentKollektiv)
            .replace(/\[LISTE_SIGNIFIKANTE_MERKMALE_DE\]/g, sigMerkmale.length > 0 ? sigMerkmale.join(', ') : (lang === 'de' ? 'keinen der untersuchten Parameter' : 'none of the investigated parameters'))
            .replace(/\[LISTE_NICHT_SIGNIFIKANTE_MERKMALE_DE\]/g, nonSigMerkmale.length > 0 ? nonSigMerkmale.join(', ') : (lang === 'de' ? 'keinen der untersuchten Parameter' : 'none of the investigated parameters'))
            .replace(/\[LIST_SIGNIFICANT_FEATURES_EN\]/g, sigMerkmale.length > 0 ? sigMerkmale.join(', ') : (lang === 'de' ? 'keinen der untersuchten Parameter' : 'none of the investigated parameters'))
            .replace(/\[LIST_NON_SIGNIFICANT_FEATURES_EN\]/g, nonSigMerkmale.length > 0 ? nonSigMerkmale.join(', ') : (lang === 'de' ? 'keinen der untersuchten Parameter' : 'none of the investigated parameters'));

        html += publikationUIComponents.createPublikationContentCard(
            `${UI_TEXTS.publikationTab.ergebnisseSection.einzelmerkmaleT2.title[lang]} (${kollektivDisplayName})`,
            textEinzel + _getEinzelmerkmaleTableHTML(associations, lang, kollektivDisplayName),
            "pub-ergebnisse-einzelmerkmale-t2", "table"
        );

        return { html: html, charts: charts };
    }


    function getSectionContentHTML(activeSection, lang, filteredData, appliedCriteria, appliedLogic, currentGlobalKollektiv, allProcessedData, lastBruteForceResults) {
        switch (activeSection) {
            case 'methoden':
                return _generateMethodenSectionHTML(lang, allProcessedData);
            case 'ergebnisse':
                return _generateErgebnisseSectionHTML(lang, filteredData, allProcessedData, appliedCriteria, appliedLogic, currentGlobalKollektiv, lastBruteForceResults);
            default:
                return { html: `<p class="text-muted">${lang === 'de' ? 'Inhalt für Sektion' : 'Content for section'} '${activeSection}' ${lang === 'de' ? 'nicht implementiert.' : 'not implemented.'}</p>`, charts: [] };
        }
    }

    return Object.freeze({
        getSectionContentHTML
    });

})();
