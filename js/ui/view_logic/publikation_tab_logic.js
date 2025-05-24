const publikationTabLogic = (() => {

    let allKollektivStats = null;
    let rawGlobalData = null;
    let globalAppliedT2Criteria = null;
    let globalAppliedT2Logic = null;
    let globalBruteForceResultsPerKollektiv = null;

    function initializeData(globalRawDataInput, appliedCriteria, appliedLogic, bfResultsPerKollektiv) {
        rawGlobalData = globalRawDataInput;
        globalAppliedT2Criteria = appliedCriteria;
        globalAppliedT2Logic = appliedLogic;
        globalBruteForceResultsPerKollektiv = bfResultsPerKollektiv;

        allKollektivStats = statisticsService.calculateAllStatsForPublication(
            rawGlobalData,
            globalAppliedT2Criteria,
            globalAppliedT2Logic,
            globalBruteForceResultsPerKollektiv
        );
    }

    function getRenderedSectionContent(mainSectionId, lang, currentKollektiv) {
        if (!allKollektivStats) {
            const fallbackAppliedCriteria = t2CriteriaManager.getAppliedCriteria();
            const fallbackAppliedLogic = t2CriteriaManager.getAppliedLogic();
            const fallbackBfResults = typeof lastBruteForceResults !== 'undefined' ? lastBruteForceResults : null;

            let fallbackBfResultsForAllKollektive = null;
            if (fallbackBfResults && fallbackBfResults.kollektiv) {
                fallbackBfResultsForAllKollektive = { [fallbackBfResults.kollektiv]: fallbackBfResults };
            } else {
                fallbackBfResultsForAllKollektive = fallbackBfResults; // Pass through if it's already in the correct format or null
            }

            allKollektivStats = statisticsService.calculateAllStatsForPublication(
                rawGlobalData || (typeof patientDataRaw !== 'undefined' ? patientDataRaw : []),
                fallbackAppliedCriteria,
                fallbackAppliedLogic,
                fallbackBfResultsForAllKollektive
            );
            if (!allKollektivStats) {
                 return '<p class="text-danger">Statistische Grunddaten für Publikations-Tab konnten nicht geladen werden.</p>';
            }
        }

        const options = {
            currentKollektiv: currentKollektiv,
            bruteForceMetric: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
        };
        return publicationRenderer.renderSectionContent(mainSectionId, lang, allKollektivStats, allKollektivStats, options);
    }

    function updateDynamicChartsForPublicationTab(mainSectionId, lang, currentKollektiv) {
        if (!allKollektivStats || !allKollektivStats[currentKollektiv]) {
            console.warn("Keine Daten für Chart-Rendering im Publikationstab vorhanden für Kollektiv:", currentKollektiv);
            return;
        }
        const dataForCurrentKollektiv = allKollektivStats[currentKollektiv];
        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === mainSectionId);

        if (!mainSection || !mainSection.subSections) {
            return;
        }

        mainSection.subSections.forEach(subSection => {
            const subSectionId = subSection.id;

            if (subSectionId === 'ergebnisse_patientencharakteristika' && dataForCurrentKollektiv?.deskriptiv) {
                const alterChartId = `pub-chart-alter-${currentKollektiv.replace(/\s+/g, '-')}`;
                const genderChartId = `pub-chart-gender-${currentKollektiv.replace(/\s+/g, '-')}`;
                const ageChartElement = document.getElementById(alterChartId);
                const genderChartElement = document.getElementById(genderChartId);

                if (ageChartElement) {
                    if(dataForCurrentKollektiv.deskriptiv.alterData && dataForCurrentKollektiv.deskriptiv.alterData.length > 0){
                        chartRenderer.renderAgeDistributionChart(dataForCurrentKollektiv.deskriptiv.alterData || [], alterChartId, { height: 200, margin: { top: 10, right: 10, bottom: 35, left: 40 } });
                    } else {
                        ui_helpers.updateElementHTML(alterChartId, `<p class="text-muted small text-center p-3">Keine Daten für Altersverteilung (${getKollektivDisplayName(currentKollektiv)}).</p>`);
                    }
                }
                if (genderChartElement && dataForCurrentKollektiv.deskriptiv.geschlecht) {
                    const genderData = [
                        {label: UI_TEXTS.legendLabels.male, value: dataForCurrentKollektiv.deskriptiv.geschlecht.m ?? 0},
                        {label: UI_TEXTS.legendLabels.female, value: dataForCurrentKollektiv.deskriptiv.geschlecht.f ?? 0}
                    ];
                    if(dataForCurrentKollektiv.deskriptiv.geschlecht.unbekannt > 0) {
                        genderData.push({label: UI_TEXTS.legendLabels.unknownGender, value: dataForCurrentKollektiv.deskriptiv.geschlecht.unbekannt });
                    }
                     if(genderData.some(d => d.value > 0)) {
                        chartRenderer.renderPieChart(genderData, genderChartId, { height: 200, margin: { top: 10, right: 10, bottom: 35, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderData.length });
                    } else {
                         ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung (${getKollektivDisplayName(currentKollektiv)}).</p>`);
                    }
                } else if (genderChartElement) {
                     ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung (${getKollektivDisplayName(currentKollektiv)}).</p>`);
                }
            } else if (['ergebnisse_as_performance', 'ergebnisse_vergleich_performance'].includes(subSectionId)) {
                const rocChartId = `pub-chart-roc-${subSectionId.replace('ergebnisse_','')}`;
                const barChartId = `pub-chart-bar-${subSectionId.replace('ergebnisse_','')}`;
                const rocChartElement = document.getElementById(rocChartId);
                const barChartElement = document.getElementById(barChartId);

                if (rocChartElement) {
                    if (dataForCurrentKollektiv?.gueteAS && dataForCurrentKollektiv?.gueteT2_angewandt) {
                         ui_helpers.updateElementHTML(rocChartId, `<div class="p-3 text-center text-muted small">ROC-Kurven-Darstellung für binäre Tests erfordert Schwellenwert-Daten. AUC(AS): ${formatNumber(dataForCurrentKollektiv.gueteAS.auc?.value,3)}, AUC(Angew. T2): ${formatNumber(dataForCurrentKollektiv.gueteT2_angewandt.auc?.value,3)}</div>`);
                    } else {
                        ui_helpers.updateElementHTML(rocChartId, `<p class="text-muted small text-center p-3">Keine Daten für ROC Chart (${getKollektivDisplayName(currentKollektiv)}).</p>`);
                    }
                }

                if (barChartElement) {
                    if (dataForCurrentKollektiv?.gueteAS && dataForCurrentKollektiv?.gueteT2_angewandt) {
                         const chartDataComp = [
                            { metric: 'Sens', AS: dataForCurrentKollektiv.gueteAS.sens?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.sens?.value ?? 0 },
                            { metric: 'Spez', AS: dataForCurrentKollektiv.gueteAS.spez?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.spez?.value ?? 0 },
                            { metric: 'PPV', AS: dataForCurrentKollektiv.gueteAS.ppv?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.ppv?.value ?? 0 },
                            { metric: 'NPV', AS: dataForCurrentKollektiv.gueteAS.npv?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.npv?.value ?? 0 },
                            { metric: 'Acc', AS: dataForCurrentKollektiv.gueteAS.acc?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.acc?.value ?? 0 },
                            { metric: 'AUC', AS: dataForCurrentKollektiv.gueteAS.auc?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.auc?.value ?? 0 }
                        ];
                        chartRenderer.renderComparisonBarChart(chartDataComp, barChartId, { height: 280, margin: { top: 20, right: 20, bottom: 50, left: 50 } }, 'Angew. T2');
                    } else {
                         ui_helpers.updateElementHTML(barChartId, `<p class="text-muted small text-center p-3">Keine Daten für Vergleichs-Balkendiagramm (${getKollektivDisplayName(currentKollektiv)}).</p>`);
                    }
                }
            }
        });
    }


    return Object.freeze({
        initializeData,
        getRenderedSectionContent,
        updateDynamicChartsForPublicationTab
    });

})();