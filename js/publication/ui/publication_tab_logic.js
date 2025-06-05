const publicationTabLogic = (() => {
    let currentAggregatedPublicationData = null;

    function preparePublicationData(globalRawData, appliedT2Criteria, appliedT2Logic, allBruteForceResults, targetBruteForceMetricKey) {
        try {
            currentAggregatedPublicationData = publicationDataAggregator.getAggregatedPublicationData(
                globalRawData,
                appliedT2Criteria,
                appliedT2Logic,
                allBruteForceResults,
                targetBruteForceMetricKey
            );
            if (!currentAggregatedPublicationData) {
                console.error("PublicationTabLogic: Failed to aggregate publication data.");
                return false;
            }
            return true;
        } catch (error) {
            console.error("PublicationTabLogic: Error in preparePublicationData:", error);
            currentAggregatedPublicationData = null;
            return false;
        }
    }

    function getSectionHTML(sectionId, lang) {
        if (!currentAggregatedPublicationData) {
            const errorMsg = lang === 'de' ? 'Fehler: Publikationsdaten nicht initialisiert. Bitte laden Sie den Tab neu oder überprüfen Sie die Datenquellen.' : 'Error: Publication data not initialized. Please reload the tab or check data sources.';
            return `<p class="text-danger">${errorMsg}</p>`;
        }
        if (typeof publicationMainController === 'undefined' || typeof publicationMainController.getFullPublicationSectionHTML !== 'function') {
            const errorMsg = lang === 'de' ? 'Fehler: Publikations-Controller nicht verfügbar.' : 'Error: Publication controller not available.';
            return `<p class="text-danger">${errorMsg}</p>`;
        }
        return publicationMainController.getFullPublicationSectionHTML(currentAggregatedPublicationData, sectionId, lang);
    }
    
    function renderDynamicContentForSection(sectionId, lang) {
        if (!currentAggregatedPublicationData || !currentAggregatedPublicationData.allKollektivStats || !currentAggregatedPublicationData.common) {
            return;
        }

        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (!mainSectionConfig || !mainSectionConfig.subSections) {
            return;
        }

        mainSectionConfig.subSections.forEach(subSection => {
            const subSectionId = subSection.id;
            const commonData = currentAggregatedPublicationData.common;

            if (subSectionId === 'ergebnisse_patientencharakteristika') {
                const ageChartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart;
                const genderChartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart;
            
                if (ageChartConfig && document.getElementById(`${ageChartConfig.id}-chart-area`)) {
                    if (currentAggregatedPublicationData.allKollektivStats.Gesamt?.deskriptiv?.alterData && currentAggregatedPublicationData.allKollektivStats.Gesamt.deskriptiv.alterData.length > 0) {
                        chartRenderer.renderAgeDistributionChart(
                            currentAggregatedPublicationData.allKollektivStats.Gesamt.deskriptiv.alterData,
                            ageChartConfig.id,
                            { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 45 }, lang: lang }
                        );
                    } else {
                        ui_helpers.updateElementHTML(`${ageChartConfig.id}-chart-area`, `<p class="text-muted small text-center p-3">${lang === 'de' ? 'Keine Daten für Altersverteilung.' : 'No data for age distribution.'}</p>`);
                    }
                }

                if (genderChartConfig && document.getElementById(`${genderChartConfig.id}-chart-area`)) {
                     const genderStats = currentAggregatedPublicationData.allKollektivStats.Gesamt?.deskriptiv?.geschlecht;
                    if (genderStats) {
                        const genderDataForChart = [
                            { label: UI_TEXTS.legendLabels.male[lang] || 'Male', value: genderStats.m || 0 },
                            { label: UI_TEXTS.legendLabels.female[lang] || 'Female', value: genderStats.f || 0 }
                        ];
                        if (genderStats.unbekannt > 0) {
                            genderDataForChart.push({ label: UI_TEXTS.legendLabels.unknownGender[lang] || 'Unknown', value: genderStats.unbekannt });
                        }
                        if (genderDataForChart.some(d => d.value > 0)) {
                             chartRenderer.renderPieChart(
                                genderDataForChart,
                                genderChartConfig.id,
                                { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderDataForChart.length, lang: lang }
                            );
                        } else {
                             ui_helpers.updateElementHTML(`${genderChartConfig.id}-chart-area`, `<p class="text-muted small text-center p-3">${lang === 'de' ? 'Keine Daten für Geschlechterverteilung.' : 'No data for gender distribution.'}</p>`);
                        }
                    } else {
                        ui_helpers.updateElementHTML(`${genderChartConfig.id}-chart-area`, `<p class="text-muted small text-center p-3">${lang === 'de' ? 'Keine Daten für Geschlechterverteilung.' : 'No data for gender distribution.'}</p>`);
                    }
                }

            } else if (subSectionId === 'ergebnisse_vergleich_as_vs_t2') {
                const kollektiveForCharts = ['Gesamt', 'direkt OP', 'nRCT'];
                const targetBfMetric = commonData.targetBruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
                
                kollektiveForCharts.forEach(kolId => {
                    let chartConfigKey;
                    if (kolId === 'Gesamt') chartConfigKey = 'vergleichPerformanceChartGesamt';
                    else if (kolId === 'direkt OP') chartConfigKey = 'vergleichPerformanceChartdirektOP';
                    else if (kolId === 'nRCT') chartConfigKey = 'vergleichPerformanceChartnRCT';
                    else return;

                    const chartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse[chartConfigKey];
                    if (!chartConfig || !chartConfig.id) return;

                    const chartElementContainer = document.getElementById(`${chartConfig.id}-chart-area`);
                    const statsForThisKollektiv = currentAggregatedPublicationData.allKollektivStats[kolId];

                    if (chartElementContainer && statsForThisKollektiv) {
                        const asStats = statsForThisKollektiv.gueteAS;
                        const bfStats = statsForThisKollektiv.gueteT2_bruteforce;
                        const bfDef = statsForThisKollektiv.bruteforce_definition;
                        
                        let chartDataComp = [];
                        let t2LabelForChart = lang === 'de' ? 'T2 (optim.)' : 'T2 (optim.)';

                        if (asStats && bfStats && bfDef && bfDef.metricName === targetBfMetric) {
                            chartDataComp = [
                                { metric: 'Sens', AS: asStats.sens?.value ?? NaN, T2: bfStats.sens?.value ?? NaN },
                                { metric: 'Spez', AS: asStats.spez?.value ?? NaN, T2: bfStats.spez?.value ?? NaN },
                                { metric: 'PPV', AS: asStats.ppv?.value ?? NaN, T2: bfStats.ppv?.value ?? NaN },
                                { metric: 'NPV', AS: asStats.npv?.value ?? NaN, T2: bfStats.npv?.value ?? NaN },
                                { metric: 'Acc', AS: asStats.acc?.value ?? NaN, T2: bfStats.acc?.value ?? NaN },
                                { metric: 'AUC', AS: asStats.auc?.value ?? NaN, T2: bfStats.auc?.value ?? NaN }
                            ].filter(d => !isNaN(parseFloat(d.AS)) && !isNaN(parseFloat(d.T2)) && isFinite(parseFloat(d.AS)) && isFinite(parseFloat(d.T2)) );
                            
                            const bfMetricDisplayShort = (bfDef.metricName || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication).substring(0,6) + ".";
                            t2LabelForChart = `BF-T2 (${bfMetricDisplayShort})`;
                        }

                        if (chartDataComp.length > 0) {
                            chartRenderer.renderComparisonBarChart(
                                chartDataComp,
                                chartConfig.id,
                                { height: 250, margin: { top: 20, right: 20, bottom: 50, left: 50 }, lang: lang },
                                t2LabelForChart
                            );
                        } else {
                             ui_helpers.updateElementHTML(chartElementContainer.id, `<p class="text-muted small text-center p-3">${lang === 'de' ? 'Keine validen Vergleichsdaten für Chart' : 'No valid comparison data for chart'} (${getKollektivDisplayName(kolId)}).</p>`);
                        }
                    } else if (chartElementContainer) {
                         ui_helpers.updateElementHTML(chartElementContainer.id, `<p class="text-muted small text-center p-3">${lang === 'de' ? 'Keine Daten für Kollektiv' : 'No data for cohort'} ${getKollektivDisplayName(kolId)}.</p>`);
                    }
                });
            }
        });
    }

    return Object.freeze({
        preparePublicationData,
        getSectionHTML,
        renderDynamicContentForSection
    });
})();
