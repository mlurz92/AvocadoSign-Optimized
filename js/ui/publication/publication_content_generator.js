const publicationContentGenerator = (() => {

    function generateSectionHtml(mainSectionId, lang, allKollektivStats, commonData) {
        let combinedHtml = '';
        const sectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === mainSectionId);

        if (!sectionConfig || !sectionConfig.subSections) {
            return `<p>Error: Section configuration for '${mainSectionId}' not found.</p>`;
        }

        sectionConfig.subSections.forEach(subSection => {
            combinedHtml += `<div class="publication-sub-section mb-5" id="pub-content-${subSection.id}">`;

            combinedHtml += publicationTextGeneratorRadiology.getSectionText(subSection.id, lang, allKollektivStats, commonData);

            switch (subSection.id) {
                case 'methoden_patientenkohorte':
                    if (typeof publicationFigureGeneratorRadiology !== 'undefined' && typeof publicationFigureGeneratorRadiology.renderFlowDiagramRadiology === 'function') {
                        combinedHtml += publicationFigureGeneratorRadiology.renderFlowDiagramRadiology(allKollektivStats, lang);
                    }
                    break;
                case 'methoden_bildanalyse_t2_kriterien':
                    if (typeof publicationTableGeneratorRadiology !== 'undefined' && typeof publicationTableGeneratorRadiology.renderLiteraturT2KriterienTabelleRadiology === 'function') {
                        combinedHtml += publicationTableGeneratorRadiology.renderLiteraturT2KriterienTabelleRadiology(lang);
                    }
                    break;
                case 'ergebnisse_patientencharakteristika':
                    if (typeof publicationTableGeneratorRadiology !== 'undefined' && typeof publicationTableGeneratorRadiology.renderPatientenCharakteristikaTabelleRadiology === 'function') {
                        combinedHtml += publicationTableGeneratorRadiology.renderPatientenCharakteristikaTabelleRadiology(allKollektivStats, lang, commonData);
                    }
                    if (typeof publicationFigureGeneratorRadiology !== 'undefined') {
                        const ageChartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart;
                        const genderChartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart;
                        if (ageChartConfig && typeof publicationFigureGeneratorRadiology.renderAgeDistributionChartRadiology === 'function') {
                            combinedHtml += publicationFigureGeneratorRadiology.renderAgeDistributionChartRadiology(
                                allKollektivStats.Gesamt?.deskriptiv?.alterData || [],
                                ageChartConfig.id,
                                { height: 280, margin: { top: 20, right: 20, bottom: 60, left: 50 } },
                                lang
                            );
                        }
                        if (genderChartConfig && typeof publicationFigureGeneratorRadiology.renderGenderDistributionChartRadiology === 'function') {
                             combinedHtml += publicationFigureGeneratorRadiology.renderGenderDistributionChartRadiology(
                                allKollektivStats.Gesamt?.deskriptiv?.geschlecht,
                                genderChartConfig.id,
                                { height: 280, margin: { top: 20, right: 20, bottom: 60, left: 20 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: (allKollektivStats.Gesamt?.deskriptiv?.geschlecht?.unbekannt > 0 ? 3:2) },
                                lang
                            );
                        }
                    }
                    break;
                case 'ergebnisse_as_diagnostische_guete':
                case 'ergebnisse_t2_literatur_diagnostische_guete':
                case 'ergebnisse_t2_optimiert_diagnostische_guete':
                    if (typeof publicationTableGeneratorRadiology !== 'undefined' && typeof publicationTableGeneratorRadiology.renderDiagnostischeGueteTabelleRadiology === 'function') {
                        combinedHtml += publicationTableGeneratorRadiology.renderDiagnostischeGueteTabelleRadiology(allKollektivStats, lang, subSection.id, commonData);
                    }
                    break;
                 case 'ergebnisse_vergleich_as_vs_t2':
                    if (typeof publicationTableGeneratorRadiology !== 'undefined' && typeof publicationTableGeneratorRadiology.renderStatistischerVergleichAST2TabelleRadiology === 'function') {
                        combinedHtml += publicationTableGeneratorRadiology.renderStatistischerVergleichAST2TabelleRadiology(allKollektivStats, lang, commonData);
                    }
                    if (typeof publicationFigureGeneratorRadiology !== 'undefined' && typeof publicationFigureGeneratorRadiology.renderComparisonPerformanceChartRadiology === 'function') {
                        const kollektiveForCharts = ['Gesamt', 'direkt OP', 'nRCT'];
                        const chartConfigs = [
                            PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt,
                            PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartdirektOP,
                            PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartnRCT
                        ];
                        combinedHtml += '<div class="row mt-4 g-3 justify-content-center">';
                        kollektiveForCharts.forEach((kolId, index) => {
                            const chartConfig = chartConfigs[index];
                            if (!chartConfig || !chartConfig.id) {
                                console.warn(`Konfiguration für Vergleichschart Kollektiv '${kolId}' nicht gefunden.`);
                                return;
                            }
                            const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;
                            const asStats = allKollektivStats?.[kolId]?.gueteAS;
                            const bfStats = allKollektivStats?.[kolId]?.gueteT2_bruteforce;
                            let chartDataComp = [];
                            let t2LabelForChart = 'T2 (opt.)';
                            let nPatForChart = allKollektivStats?.[kolId]?.deskriptiv?.anzahlPatienten;


                            if (asStats && bfStats && bfDef) {
                                chartDataComp = [
                                    { metric: 'Sens', AS: asStats.sens?.value ?? NaN, T2: bfStats.sens?.value ?? NaN },
                                    { metric: 'Spez', AS: asStats.spez?.value ?? NaN, T2: bfStats.spez?.value ?? NaN },
                                    { metric: 'PPV', AS: asStats.ppv?.value ?? NaN, T2: bfStats.ppv?.value ?? NaN },
                                    { metric: 'NPV', AS: asStats.npv?.value ?? NaN, T2: bfStats.npv?.value ?? NaN },
                                    { metric: 'Acc', AS: asStats.acc?.value ?? NaN, T2: bfStats.acc?.value ?? NaN },
                                    { metric: 'AUC', AS: asStats.auc?.value ?? NaN, T2: bfStats.auc?.value ?? NaN }
                                ].filter(d => !isNaN(d.AS) && !isNaN(d.T2));
                                t2LabelForChart = `BF-T2 (${(bfDef.metricName || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication).substring(0,6)}.)`;
                            }
                            combinedHtml += `<div class="col-md-6 col-lg-4">`;
                            combinedHtml += publicationFigureGeneratorRadiology.renderComparisonPerformanceChartRadiology(
                                kolId,
                                chartDataComp,
                                chartConfig.id,
                                { height: 300, margin: { top: 25, right: 25, bottom: 70, left: 55 }, bfMetricName: bfDef?.metricName, nPat: nPatForChart },
                                t2LabelForChart,
                                lang
                            );
                            combinedHtml += `</div>`;
                        });
                        combinedHtml += '</div>';
                    }
                    break;
                default:
                    break;
            }
            combinedHtml += `</div>`;
        });
        return combinedHtml;
    }

    return Object.freeze({
        generateSectionHtml
    });
})();
