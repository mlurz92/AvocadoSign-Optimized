const publicationRenderer = (() => {

    function renderSectionContent(sectionId, lang, allKollektivStats, commonDataFromLogic, options = {}) {
        if (!sectionId || !lang || !allKollektivStats || !commonDataFromLogic) {
            return '<p class="text-danger">Fehler: Notwendige Daten für die Sektionsanzeige fehlen.</p>';
        }

        const commonData = {
            ...commonDataFromLogic,
            bruteForceMetricForPublication: options.bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
        };

        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (!mainSection || !mainSection.subSections || mainSection.subSections.length === 0) {
            return `<p class="text-warning">Keine Unterabschnitte für '${sectionId}' definiert.</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${sectionId}">`;
        combinedHtml += `<h1 class="mb-4 display-6">${UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey]}</h1>`;

        mainSection.subSections.forEach(subSection => {
            combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            
            combinedHtml += publicationTextGenerator.getSectionText(subSection.id, lang, allKollektivStats, commonData);

            if (subSection.id === 'methoden_patientenkohorte') {
                combinedHtml += publicationFigures.renderFlowDiagram(allKollektivStats, lang);
            }
            else if (subSection.id === 'methoden_bildanalyse_t2_kriterien') { 
                combinedHtml += publicationTables.renderLiteraturT2KriterienTabelle(lang);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += publicationTables.renderPatientenCharakteristikaTabelle(allKollektivStats, lang);
                combinedHtml += '<div class="row mt-4 g-3">';
                combinedHtml += `<div class="col-md-6">${publicationFigures.renderAgeDistributionChart(allKollektivStats.Gesamt?.deskriptiv?.alterData, 'pub-figure-results-1a-alter-verteilung', {}, lang)}</div>`;
                combinedHtml += `<div class="col-md-6">${publicationFigures.renderGenderDistributionChart(allKollektivStats.Gesamt?.deskriptiv?.geschlecht, 'pub-figure-results-1b-geschlecht-verteilung', {}, lang)}</div>`;
                combinedHtml += '</div>';
            } else if (subSection.id === 'ergebnisse_as_diagnostische_guete') { 
                combinedHtml += publicationTables.renderDiagnostischeGueteTabelle(allKollektivStats, lang, subSection.id, commonData);
            } else if (subSection.id === 'ergebnisse_t2_literatur_diagnostische_guete') { 
                combinedHtml += publicationTables.renderDiagnostischeGueteTabelle(allKollektivStats, lang, subSection.id, commonData);
            } else if (subSection.id === 'ergebnisse_t2_optimiert_diagnostische_guete') { 
                combinedHtml += publicationTables.renderDiagnostischeGueteTabelle(allKollektivStats, lang, subSection.id, commonData);
            } else if (subSection.id === 'ergebnisse_vergleich_as_vs_t2') { 
                 combinedHtml += publicationTables.renderVergleichAST2Tabelle(allKollektivStats, lang, commonData);
                 combinedHtml += '<div class="row mt-4 g-3">';
                 const kollektiveForCharts = ['Gesamt', 'direkt OP', 'nRCT'];
                 const chartElementsConfig = [
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt,
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartdirektOP,
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartnRCT
                 ];

                 kollektiveForCharts.forEach((kolId, index) => {
                    const chartConfig = chartElementsConfig[index];
                    const chartId = chartConfig.id;
                    const asStats = allKollektivStats?.[kolId]?.gueteAS;
                    const bfStats = allKollektivStats?.[kolId]?.gueteT2_bruteforce;
                    let chartDataComp = [];
                    let t2Label = `BF-T2 (${commonData.bruteForceMetricForPublication.substring(0,6)}.)`;

                    if (asStats && bfStats) {
                        chartDataComp = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'].map(m => ({
                            metric: m.toUpperCase(),
                            AS: asStats[m]?.value ?? NaN,
                            T2: bfStats[m]?.value ?? NaN
                        })).filter(d => !isNaN(d.AS) && !isNaN(d.T2));
                    }
                    combinedHtml += `<div class="col-md-4">${publicationFigures.renderComparisonPerformanceChart(kolId, chartDataComp, chartId, {}, t2Label, lang)}</div>`;
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
