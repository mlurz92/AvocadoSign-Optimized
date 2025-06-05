const publicationRenderer = (() => {

    function renderSectionContent(sectionId, lang, allKollektivStats, commonDataFromLogic, options = {}) {
        if (!sectionId || !lang || !allKollektivStats || !commonDataFromLogic) {
            return '<p class="text-danger">Fehler: Notwendige Daten für die Sektionsanzeige fehlen.</p>';
        }

        const { currentKollektiv, bruteForceMetric } = options;
        const commonData = {
            ...commonDataFromLogic,
            currentKollektivName: getKollektivDisplayName(currentKollektiv),
            bruteForceMetricForPublication: bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication,
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION,
            rawData: commonDataFromLogic.rawData // Sicherstellen, dass rawData im commonData-Objekt enthalten ist
        };

        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (!mainSection || !mainSection.subSections || mainSection.subSections.length === 0) {
            return `<p class="text-warning">Keine Unterabschnitte für Hauptabschnitt '${sectionId}' definiert.</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${sectionId}">`;
        combinedHtml += `<h1 class="mb-4 display-6">${UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey}</h1>`;

        mainSection.subSections.forEach(subSection => {
            combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            
            const textContentHtml = publicationTextGenerator.getSectionText(subSection.id, lang, allKollektivStats, commonData);
            combinedHtml += textContentHtml || `<p class="text-muted">Inhalt für diesen Unterabschnitt (ID: ${subSection.id}, Sprache: ${lang}) wird noch generiert.</p>`;

            if (subSection.id === 'methoden_patientenkohorte') {
                combinedHtml += publicationFigures.renderFlowDiagram(allKollektivStats, lang);
            }
            else if (subSection.id === 'methoden_bildanalyse_t2_kriterien') { 
                combinedHtml += publicationTables.renderLiteraturT2KriterienTabelle(lang);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += publicationTables.renderPatientenCharakteristikaTabelle(allKollektivStats, lang);
                combinedHtml += '<div class="row mt-4 g-3">';
                // Altersverteilung Chart
                combinedHtml += `<div class="col-md-6">${publicationFigures.renderAgeDistributionChart(allKollektivStats.Gesamt?.deskriptiv?.alterData || [], PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id, {height: 220, margin: { top: 10, right: 10, bottom: 40, left: 45 }}, lang)}</div>`;
                // Geschlechterverteilung Chart
                combinedHtml += `<div class="col-md-6">${publicationFigures.renderGenderDistributionChart(allKollektivStats.Gesamt?.deskriptiv?.geschlecht, PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id, {height: 220, margin: { top: 10, right: 10, bottom: 40, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: 3}, lang)}</div>`;
                combinedHtml += '</div>';
            } else if (subSection.id === 'ergebnisse_as_diagnostische_guete') { 
                combinedHtml += publicationTables.renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSection.id, commonData);
            } else if (subSection.id === 'ergebnisse_t2_literatur_diagnostische_guete') { 
                combinedHtml += publicationTables.renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSection.id, commonData);
            } else if (subSection.id === 'ergebnisse_t2_optimiert_diagnostische_guete') { 
                combinedHtml += publicationTables.renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSection.id, commonData);
            } else if (subSection.id === 'ergebnisse_vergleich_as_vs_t2') { 
                 combinedHtml += publicationTables.renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSection.id, commonData);
                 combinedHtml += '<div class="row mt-4 g-3">';
                 const kollektiveForCharts = ['Gesamt', 'direkt OP', 'nRCT'];
                 
                 const pubErgebnisseConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse;
                 if (!pubErgebnisseConfig || typeof pubErgebnisseConfig !== 'object') {
                    combinedHtml += '</div>';
                    combinedHtml += `</div>`;
                    return;
                 }

                 const chartElementsConfig = [
                    pubErgebnisseConfig.vergleichPerformanceChartGesamt,
                    pubErgebnisseConfig.vergleichPerformanceChartdirektOP,
                    pubErgebnisseConfig.vergleichPerformanceChartnRCT
                 ];

                 kollektiveForCharts.forEach((kolId, index) => {
                    const chartConfig = chartElementsConfig[index];
                    if (!chartConfig || typeof chartConfig !== 'object' || !chartConfig.id) {
                        combinedHtml += `<div class="col-md-4"><p class="text-warning small">Fehler: Chart-Konfiguration für ${getKollektivDisplayName(kolId)} ungültig.</p></div>`;
                        return; 
                    }
                    const chartId = chartConfig.id;
                    
                    const bfResultsForDisplay = bruteForceManager.getResultsForKollektiv(kolId);
                    let bfStatsForChart = null;
                    let bfDefForChart = null;

                    if (bfResultsForDisplay && bfResultsForDisplay.metric === commonData.bruteForceMetricForPublication && bfResultsForDisplay.bestResult) {
                        const dataForThisKollektiv = dataProcessor.filterDataByKollektiv(commonData.rawData, kolId);
                        const bfCriteria = bfResultsForDisplay.bestResult.criteria;
                        const bfLogic = bfResultsForDisplay.bestResult.logic;
                        const evaluatedDataBF = t2CriteriaManager.evaluateDataset(cloneDeep(dataForThisKollektiv), bfCriteria, bfLogic);
                        bfStatsForChart = statisticsService.calculateDiagnosticPerformance(evaluatedDataBF, 't2', 'n');
                        bfDefForChart = {
                            criteria: bfCriteria,
                            logic: bfLogic,
                            metricName: bfResultsForDisplay.metric,
                            metricValue: bfResultsForDisplay.bestResult.metricValue
                        };
                    } else if (allKollektivStats?.[kolId]?.gueteT2_bruteforce && allKollektivStats?.[kolId]?.bruteforce_definition) {
                        bfStatsForChart = allKollektivStats[kolId].gueteT2_bruteforce;
                        bfDefForChart = allKollektivStats[kolId].bruteforce_definition;
                    }

                    const asStats = allKollektivStats?.[kolId]?.gueteAS;
                    let chartDataComp = [];
                    let t2Label = 'T2';

                    if (asStats && bfStatsForChart && bfDefForChart) {
                        chartDataComp = [
                            { metric: 'Sens', AS: asStats.sens?.value ?? NaN, T2: bfStatsForChart.sens?.value ?? NaN },
                            { metric: 'Spez', AS: asStats.spez?.value ?? NaN, T2: bfStatsForChart.spez?.value ?? NaN },
                            { metric: 'PPV', AS: asStats.ppv?.value ?? NaN, T2: bfStatsForChart.ppv?.value ?? NaN },
                            { metric: 'NPV', AS: asStats.npv?.value ?? NaN, T2: bfStatsForChart.npv?.value ?? NaN },
                            { metric: 'Acc', AS: asStats.acc?.value ?? NaN, T2: bfStatsForChart.acc?.value ?? NaN },
                            { metric: 'AUC', AS: asStats.auc?.value ?? NaN, T2: bfStatsForChart.auc?.value ?? NaN }
                        ].filter(d => !isNaN(d.AS) && !isNaN(d.T2));
                        t2Label = `BF-T2 (${(bfDefForChart.metricName || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication).substring(0,6)}.)`;
                    }
                    
                    combinedHtml += `<div class="col-md-4">${publicationFigures.renderComparisonPerformanceChart(kolId, chartDataComp, chartId, {height: 250, margin: { top: 20, right: 20, bottom: 50, left: 50 }}, t2Label, lang, commonData.rawData)}</div>`;
                 });
                 combinedHtml += '</div>';
            }
            combinedHtml += `</div>`;
        });

        combinedHtml += `</div>`;
        return combinedHtml;
    }

    return Object.freeze({
        renderSectionContent
    });

})();
