const resultsGenerator = (() => {

    function _getSectionTitle(sectionId, lang) {
        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === 'results');
        const subSectionConfig = mainSectionConfig?.subSections.find(ss => ss.id === sectionId);
        if (subSectionConfig && UI_TEXTS.publikationTab?.sectionLabels?.[subSectionConfig.labelKey]) {
            return UI_TEXTS.publikationTab.sectionLabels[subSectionConfig.labelKey];
        }
        const fallbackTitle = sectionId.replace('ergebnisse_', '').replace(/_/g, ' ');
        return fallbackTitle.charAt(0).toUpperCase() + fallbackTitle.slice(1);
    }

    function _generatePatientCharacteristicsResults(aggregatedData, lang) {
        const common = aggregatedData.common;
        const demo = common.demographicsGesamt;
        const title = _getSectionTitle('ergebnisse_patientencharakteristika', lang);
        const flowDiagramId = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.id;
        const flowDiagramLabel = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.radiologyLabel;
        const table1Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id;
        const table1Label = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.radiologyLabel;
        const figure2AId = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id;
        const figure2ALabel = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.radiologyLabel;
        const figure2BId = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id;
        const figure2BLabel = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.radiologyLabel;


        const numPatients = radiologyFormatter.formatRadiologyNumber(demo.patientCount, 0);
        const meanAge = radiologyFormatter.formatRadiologyNumber(demo.meanAge, 0);
        const sdAge = radiologyFormatter.formatRadiologyNumber(demo.sdAge, 0);
        const medianAge = radiologyFormatter.formatRadiologyNumber(demo.medianAge, 0);
        const iqrAge = demo.iqrAge && typeof demo.iqrAge[0] === 'number' && typeof demo.iqrAge[1] === 'number' ? `${radiologyFormatter.formatRadiologyNumber(demo.iqrAge[0], 0)}–${radiologyFormatter.formatRadiologyNumber(demo.iqrAge[1], 0)}` : "N/A";

        const numMen = radiologyFormatter.formatRadiologyNumber(demo.countMen, 0);
        const percentMen = radiologyFormatter.formatPercentageForRadiology(demo.countMen, demo.patientCount, 0);
        
        const numNRCT = radiologyFormatter.formatRadiologyNumber(common.nNRCT, 0);
        const percentNRCT = radiologyFormatter.formatPercentageForRadiology(common.nNRCT, common.nGesamt, 0);
        const numDirektOP = radiologyFormatter.formatRadiologyNumber(common.nDirektOP, 0);
        const percentDirektOP = radiologyFormatter.formatPercentageForRadiology(common.nDirektOP, common.nGesamt, 0);
        const numNPlus = radiologyFormatter.formatRadiologyNumber(demo.countNPlus, 0);
        const percentNPlus = radiologyFormatter.formatPercentageForRadiology(demo.countNPlus, demo.patientCount, 0);


        if (lang === 'de') {
            return `
                <h3 id="ergebnisse_patientencharakteristika-title">${title}</h3>
                <p>Insgesamt wurden ${numPatients} Patienten in die finale Analyse eingeschlossen (siehe <a href="#${flowDiagramId}">${flowDiagramLabel}</a>). Das mittlere Alter betrug ${meanAge} ± ${sdAge} Jahre (Median, ${medianAge} Jahre; IQR, ${iqrAge} Jahre); ${percentMen} waren Männer. Die Altersverteilung ist in <a href="#${figure2AId}">${figure2ALabel}</a> dargestellt. Von diesen erhielten ${numNRCT} Patienten (${percentNRCT.split('(')[1].split(')')[0]}) eine neoadjuvante Radiochemotherapie (nRCT), während ${numDirektOP} Patienten (${percentDirektOP.split('(')[1].split(')')[0]}) primär operiert wurden. Die Geschlechterverteilung ist in <a href="#${figure2BId}">${figure2BLabel}</a> dargestellt. Ein histopathologisch gesicherter Lymphknotenbefall (N+) lag bei ${numNPlus} Patienten (${percentNPlus.split('(')[1].split(')')[0]}) vor. Detaillierte Patientencharakteristika sind in <a href="#${table1Id}">${table1Label}</a> zusammengefasst.</p>
            `;
        } else {
            return `
                <h3 id="ergebnisse_patientencharakteristika-title">${title}</h3>
                <p>A total of ${numPatients} patients were included in the final analysis (see <a href="#${flowDiagramId}">${flowDiagramLabel}</a>). The mean age was ${meanAge} ± ${sdAge} years (median, ${medianAge} years; IQR, ${iqrAge} years); ${percentMen} were men. The age distribution is presented in <a href="#${figure2AId}">${figure2ALabel}</a>. Of these, ${numNRCT} patients (${percentNRCT.split('(')[1].split(')')[0]}) received neoadjuvant chemoradiotherapy (nCRT), while ${numDirektOP} patients (${percentDirektOP.split('(')[1].split(')')[0]}) underwent upfront surgery. The gender distribution is shown in <a href="#${figure2BId}">${figure2BLabel}</a>. Histopathologically confirmed lymph node involvement (N+) was present in ${numNPlus} patients (${percentNPlus.split('(')[1].split(')')[0]}). Detailed patient characteristics are summarized in <a href="#${table1Id}">${table1Label}</a>.</p>
            `;
        }
    }

    function _generateASPerformanceResults(aggregatedData, lang) {
        const common = aggregatedData.common;
        const statsGesamt = aggregatedData.allKollektivStats.Gesamt;
        const statsDirektOP = aggregatedData.allKollektivStats['direkt OP'];
        const statsNRCT = aggregatedData.allKollektivStats.nRCT;
        const asGesamt = statsGesamt?.gueteAS;
        const asDirektOP = statsDirektOP?.gueteAS;
        const asNRCT = statsNRCT?.gueteAS;
        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.id;
        const tableLabel = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.radiologyLabel;
        const title = _getSectionTitle('ergebnisse_as_diagnostische_guete', lang);

        const sensGesamt = asGesamt ? radiologyFormatter.formatPercentageForRadiology(asGesamt.sens.n_success, asGesamt.sens.n_trials, 0) : '--% (N/A)';
        const spezGesamt = asGesamt ? radiologyFormatter.formatPercentageForRadiology(asGesamt.spez.n_success, asGesamt.spez.n_trials, 0) : '--% (N/A)';
        const aucGesamt = asGesamt ? radiologyFormatter.formatRadiologyCI(asGesamt.auc.value, asGesamt.auc.ci.lower, asGesamt.auc.ci.upper, 2, false) : '--';

        const sensDirektOP = asDirektOP ? radiologyFormatter.formatPercentageForRadiology(asDirektOP.sens.n_success, asDirektOP.sens.n_trials, 0) : '--% (N/A)';
        const spezDirektOP = asDirektOP ? radiologyFormatter.formatPercentageForRadiology(asDirektOP.spez.n_success, asDirektOP.spez.n_trials, 0) : '--% (N/A)';
        const aucDirektOP = asDirektOP ? radiologyFormatter.formatRadiologyCI(asDirektOP.auc.value, asDirektOP.auc.ci.lower, asDirektOP.auc.ci.upper, 2, false) : '--';

        const sensNRCT = asNRCT ? radiologyFormatter.formatPercentageForRadiology(asNRCT.sens.n_success, asNRCT.sens.n_trials, 0) : '--% (N/A)';
        const spezNRCT = asNRCT ? radiologyFormatter.formatPercentageForRadiology(asNRCT.spez.n_success, asNRCT.spez.n_trials, 0) : '--% (N/A)';
        const aucNRCT = asNRCT ? radiologyFormatter.formatRadiologyCI(asNRCT.auc.value, asNRCT.auc.ci.lower, asNRCT.auc.ci.upper, 2, false) : '--';

        if (lang === 'de') {
            return `
                <h3 id="ergebnisse_as_diagnostische_guete-title">${title}</h3>
                <p>Die diagnostische Leistung des Avocado Signs (AS) zur Prädiktion des pathologischen N-Status ist in <a href="#${tableId}">${tableLabel}</a> detailliert dargestellt. Im Gesamtkollektiv (N=${common.nGesamt}) wies das AS eine Sensitivität von ${sensGesamt}, eine Spezifität von ${spezGesamt} und eine AUC von ${aucGesamt} auf. Bei Patienten der Direkt-OP-Gruppe (N=${common.nDirektOP}) erreichte das AS eine Sensitivität von ${sensDirektOP} bei einer Spezifität von ${spezDirektOP} (AUC ${aucDirektOP}). In der nRCT-Gruppe (N=${common.nNRCT}) betrug die Sensitivität ${sensNRCT} und die Spezifität ${spezNRCT} (AUC ${aucNRCT}).</p>
            `;
        } else {
            return `
                <h3 id="ergebnisse_as_diagnostische_guete-title">${title}</h3>
                <p>The diagnostic performance of the Avocado Sign (AS) for predicting pathologic N-status is detailed in <a href="#${tableId}">${tableLabel}</a>. In the overall cohort (N=${common.nGesamt}), the AS demonstrated a sensitivity of ${sensGesamt}, a specificity of ${spezGesamt}, and an AUC of ${aucGesamt}. In patients undergoing upfront surgery (N=${common.nDirektOP}), AS achieved a sensitivity of ${sensDirektOP} and a specificity of ${spezDirektOP} (AUC ${aucDirektOP}). In the nCRT group (N=${common.nNRCT}), sensitivity was ${sensNRCT} and specificity was ${spezNRCT} (AUC ${aucNRCT}).</p>
            `;
        }
    }

    function _generateT2LiteraturePerformanceResults(aggregatedData, lang) {
        const common = aggregatedData.common;
        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id;
        const tableLabel = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.radiologyLabel;
        const title = _getSectionTitle('ergebnisse_t2_literatur_diagnostische_guete', lang);
        let text = '';

        if (lang === 'de') {
            text += `<h3 id="ergebnisse_t2_literatur_diagnostische_guete-title">${title}</h3><p>Die Performance der etablierten T2-Kriteriensets aus der Literatur, angewendet auf die entsprechenden Subkollektive unserer Studienpopulation, ist in <a href="#${tableId}">${tableLabel}</a> zusammengefasst.`;
        } else {
            text += `<h3 id="ergebnisse_t2_literatur_diagnostische_guete-title">${title}</h3><p>The performance of established T2 criteria sets from the literature, applied to the respective subcohorts of our study population, is summarized in <a href="#${tableId}">${tableLabel}</a>.`;
        }
        
        const kohStats = aggregatedData.allKollektivStats.Gesamt?.gueteT2_literatur?.koh_2008_morphology;
        const barbaroStats = aggregatedData.allKollektivStats.nRCT?.gueteT2_literatur?.barbaro_2024_restaging;
        const rutegardStats = aggregatedData.allKollektivStats['direkt OP']?.gueteT2_literatur?.rutegard_et_al_esgar;

        if (kohStats?.auc?.value) {
            text += lang === 'de' ? ` Kriterien nach Koh et al. zeigten eine AUC von ${radiologyFormatter.formatRadiologyCI(kohStats.auc.value, kohStats.auc.ci.lower, kohStats.auc.ci.upper, 2, false)} im Gesamtkollektiv (N=${common.nGesamt}).` : ` Criteria by Koh et al. showed an AUC of ${radiologyFormatter.formatRadiologyCI(kohStats.auc.value, kohStats.auc.ci.lower, kohStats.auc.ci.upper, 2, false)} in the overall cohort (N=${common.nGesamt}).`;
        }
        if (barbaroStats?.auc?.value) {
            text += lang === 'de' ? ` Kriterien nach Barbaro et al. (N=${common.nNRCT} nRCT-Gruppe) zeigten eine AUC von ${radiologyFormatter.formatRadiologyCI(barbaroStats.auc.value, barbaroStats.auc.ci.lower, barbaroStats.auc.ci.upper, 2, false)}.` : ` Criteria by Barbaro et al. (N=${common.nNRCT} nCRT group) showed an AUC of ${radiologyFormatter.formatRadiologyCI(barbaroStats.auc.value, barbaroStats.auc.ci.lower, barbaroStats.auc.ci.upper, 2, false)}.` ;
        }
         if (rutegardStats?.auc?.value) {
            text += lang === 'de' ? ` ESGAR-Kriterien (N=${common.nDirektOP} Direkt-OP-Gruppe, evaluiert nach Rutegård et al.) zeigten eine AUC von ${radiologyFormatter.formatRadiologyCI(rutegardStats.auc.value, rutegardStats.auc.ci.lower, rutegardStats.auc.ci.upper, 2, false)}.` : ` ESGAR criteria (N=${common.nDirektOP} Upfront Surgery group, evaluated according to Rutegård et al.) showed an AUC of ${radiologyFormatter.formatRadiologyCI(rutegardStats.auc.value, rutegardStats.auc.ci.lower, rutegardStats.auc.ci.upper, 2, false)}.` ;
        }
        text += `</p>`;
        return text;
    }

    function _generateT2OptimizedPerformanceResults(aggregatedData, lang) {
        const common = aggregatedData.common;
        const bfZielMetricKey = common.targetBruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        let bfZielMetricDisplay = bfZielMetricKey;
        const metricOption = PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === bfZielMetricKey);
        if (metricOption) {
            bfZielMetricDisplay = lang === 'de' ? metricOption.labelDe : metricOption.labelEn;
        }

        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id;
        const tableLabel = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.radiologyLabel;
        const title = _getSectionTitle('ergebnisse_t2_optimiert_diagnostische_guete', lang).replace('{BF_METRIC_NAME}', bfZielMetricDisplay);
        
        let text = '';
        if (lang === 'de') {
            text += `<h3 id="ergebnisse_t2_optimiert_diagnostische_guete-title">${title}</h3><p>Mittels Brute-Force-Algorithmus wurden für jedes Studienkollektiv spezifische T2-Kriteriensets identifiziert, welche die <strong>${bfZielMetricDisplay}</strong> maximieren. Die diagnostische Güte dieser Sets ist in <a href="#${tableId}">${tableLabel}</a> dargestellt.`;
        } else {
            text += `<h3 id="ergebnisse_t2_optimiert_diagnostische_guete-title">${title}</h3><p>Using a brute-force algorithm, specific T2 criteria sets maximizing <strong>${bfZielMetricDisplay}</strong> were identified for each study cohort. The diagnostic performance of these sets is presented in <a href="#${tableId}">${tableLabel}</a>.`;
        }
        
        const bfGesamt = aggregatedData.allKollektivStats.Gesamt?.gueteT2_bruteforce;
        if (bfGesamt?.auc?.value) {
            text += lang === 'de' ? ` Im Gesamtkollektiv (N=${common.nGesamt}) erreichten die optimierten Kriterien eine AUC von ${radiologyFormatter.formatRadiologyCI(bfGesamt.auc.value, bfGesamt.auc.ci.lower, bfGesamt.auc.ci.upper, 2, false)}.` : ` In the overall cohort (N=${common.nGesamt}), optimized criteria achieved an AUC of ${radiologyFormatter.formatRadiologyCI(bfGesamt.auc.value, bfGesamt.auc.ci.lower, bfGesamt.auc.ci.upper, 2, false)}.`;
        }
        text += `</p>`;
        return text;
    }

    function _generateComparisonASvsT2Results(aggregatedData, lang) {
        const common = aggregatedData.common;
        const bfZielMetricKey = common.targetBruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        let bfZielMetricDisplay = bfZielMetricKey;
        const metricOption = PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === bfZielMetricKey);
        if (metricOption) {
            bfZielMetricDisplay = lang === 'de' ? metricOption.labelDe : metricOption.labelEn;
        }

        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.id;
        const tableLabel = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.radiologyLabel;
        const figLabelGesamt = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.radiologyLabel;
        const figIdDirektOP = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartdirektOP.id;
        const figLabelDirektOP = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartdirektOP.radiologyLabel;
        const figIdNRCT = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartnRCT.id;
        const figLabelNRCT = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartnRCT.radiologyLabel;
        const title = _getSectionTitle('ergebnisse_vergleich_as_vs_t2', lang);

        const vergleichGesamt = aggregatedData.allKollektivStats.Gesamt?.vergleichASvsT2_bruteforce;
        const aucASGesamt = aggregatedData.allKollektivStats.Gesamt?.gueteAS?.auc?.value;
        const aucBFGesamt = aggregatedData.allKollektivStats.Gesamt?.gueteT2_bruteforce?.auc?.value;
        const pDelongGesamt = vergleichGesamt?.delong?.pValue;
        const pMcNemarGesamt = vergleichGesamt?.mcnemar?.pValue;

        let text = '';
        if (lang === 'de') {
            text = `<h3 id="ergebnisse_vergleich_as_vs_t2-title">${title}</h3><p>Die statistischen Vergleiche der diagnostischen Leistung zwischen dem Avocado Sign (AS) und den T2-Kriteriensets (optimiert für die Zielmetrik ${bfZielMetricDisplay}) sind in <a href="#${tableId}">${tableLabel}</a> detailliert. Visuelle Vergleiche sind in <a href="#${PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.id}">${figLabelGesamt}</a> (Gesamt), <a href="#${figIdDirektOP}">${figLabelDirektOP}</a> (Direkt OP) und <a href="#${figIdNRCT}">${figLabelNRCT}</a> (nRCT) dargestellt. `;
            if (aucASGesamt !== undefined && aucBFGesamt !== undefined && pDelongGesamt !== undefined) {
                text += `Im Gesamtkollektiv (N=${common.nGesamt}) unterschieden sich die AUC-Werte für AS (${radiologyFormatter.formatRadiologyNumber(aucASGesamt, 2, true)}) und optimierte T2-Kriterien (${radiologyFormatter.formatRadiologyNumber(aucBFGesamt, 2, true)}) nicht signifikant (${radiologyFormatter.formatRadiologyPValue(pDelongGesamt)}). `;
            }
             if (pMcNemarGesamt !== undefined) {
                 text += `Der McNemar-Test für Accuracy ergab ${radiologyFormatter.formatRadiologyPValue(pMcNemarGesamt)}.`;
             }
        } else {
            text = `<h3 id="ergebnisse_vergleich_as_vs_t2-title">${title}</h3><p>Statistical comparisons of diagnostic performance between the Avocado Sign (AS) and T2 criteria sets (optimized for the target metric ${bfZielMetricDisplay}) are detailed in <a href="#${tableId}">${tableLabel}</a>. Visual comparisons are presented in <a href="#${PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.id}">${figLabelGesamt}</a> (Overall), <a href="#${figIdDirektOP}">${figLabelDirektOP}</a> (Upfront Surgery), and <a href="#${figIdNRCT}">${figLabelNRCT}</a> (nCRT). `;
            if (aucASGesamt !== undefined && aucBFGesamt !== undefined && pDelongGesamt !== undefined) {
                text += `In the overall cohort (N=${common.nGesamt}), AUC values for AS (${radiologyFormatter.formatRadiologyNumber(aucASGesamt, 2, true)}) and optimized T2 criteria (${radiologyFormatter.formatRadiologyNumber(aucBFGesamt, 2, true)}) did not differ significantly (${radiologyFormatter.formatRadiologyPValue(pDelongGesamt)}). `;
            }
             if (pMcNemarGesamt !== undefined) {
                 text += `The McNemar test for accuracy yielded ${radiologyFormatter.formatRadiologyPValue(pMcNemarGesamt)}.`;
             }
        }
        text += `</p>`;
        return text;
    }

    function generateResultsSection(aggregatedData, lang = 'de') {
        if (!aggregatedData || !aggregatedData.common || !aggregatedData.allKollektivStats) {
            return lang === 'de' ? "<h3>Ergebnisse</h3><p>Sektion konnte nicht generiert werden: Daten fehlen.</p>" : "<h3>Results</h3><p>Section could not be generated: data missing.</p>";
        }

        let html = `<h2 id="results-title">${UI_TEXTS.publikationTab.sectionLabels.ergebnisse}</h2>`;
        html += _generatePatientCharacteristicsResults(aggregatedData, lang);
        html += _generateASPerformanceResults(aggregatedData, lang);
        html += _generateT2LiteraturePerformanceResults(aggregatedData, lang);
        html += _generateT2OptimizedPerformanceResults(aggregatedData, lang);
        html += _generateComparisonASvsT2Results(aggregatedData, lang);

        return html;
    }

    return Object.freeze({
        generateResultsSection,
        generatePatientCharacteristicsText: _generatePatientCharacteristicsResults,
        generateASPerformanceText: _generateASPerformanceResults,
        generateT2LiteraturePerformanceText: _generateT2LiteraturePerformanceResults,
        generateT2OptimizedPerformanceText: _generateT2OptimizedPerformanceResults,
        generateComparisonASvsT2Text: _generateComparisonASvsT2Results
    });

})();
