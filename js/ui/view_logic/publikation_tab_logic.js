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
        globalBruteForceResultsPerKollektiv = bfResultsPerKollektiv; // Expected format: { "Gesamt": bfResultGesamt, "direkt OP": bfResultDirektOP, ... }

        allKollektivStats = statisticsService.calculateAllStatsForPublication(
            rawGlobalData,
            globalAppliedT2Criteria,
            globalAppliedT2Logic,
            globalBruteForceResultsPerKollektiv // Pass the structured BF results
        );
    }

    function getRenderedSectionContent(mainSectionId, lang, currentKollektiv) {
        if (!allKollektivStats) {
            // Fallback: Try to re-initialize/re-calculate if allKollektivStats is null
            const fallbackAppliedCriteria = t2CriteriaManager.getAppliedCriteria();
            const fallbackAppliedLogic = t2CriteriaManager.getAppliedLogic();
            // Attempt to get lastBruteForceResults from main.js scope if available (this is a bit of a hack for robustness)
            let fallbackBfResultsForAllKollektive = null;
            if (typeof lastBruteForceResults !== 'undefined' && lastBruteForceResults) {
                if (lastBruteForceResults.kollektiv && !lastBruteForceResults[lastBruteForceResults.kollektiv]) { // Single result format
                     fallbackBfResultsForAllKollektive = { [lastBruteForceResults.kollektiv]: lastBruteForceResults };
                } else { // Already in multi-kollektiv format or needs re-check
                    fallbackBfResultsForAllKollektive = lastBruteForceResults;
                }
            }


            allKollektivStats = statisticsService.calculateAllStatsForPublication(
                rawGlobalData || (typeof patientDataRaw !== 'undefined' ? patientDataRaw : []),
                fallbackAppliedCriteria,
                fallbackAppliedLogic,
                fallbackBfResultsForAllKollektive
            );
            if (!allKollektivStats) {
                 return '<p class="text-danger">Statistische Grunddaten für Publikations-Tab konnten nicht geladen oder berechnet werden.</p>';
            }
        }

        const options = {
            currentKollektiv: currentKollektiv,
            bruteForceMetric: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
        };
        // publicationData and kollektiveData are the same (allKollektivStats) in this context
        return publicationRenderer.renderSectionContent(mainSectionId, lang, allKollektivStats, allKollektivStats, options);
    }

    function updateDynamicChartsForPublicationTab(mainSectionId, lang, currentKollektiv) {
        if (!allKollektivStats || !allKollektivStats[currentKollektiv]) {
            console.warn("Keine Daten für Chart-Rendering im Publikationstab vorhanden für Kollektiv:", currentKollektiv);
            return;
        }
        const dataForCurrentKollektiv = allKollektivStats[currentKollektiv];
        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === mainSectionId);

        if (!mainSectionConfig || !mainSectionConfig.subSections) {
            return;
        }

        mainSectionConfig.subSections.forEach(subSection => {
            const subSectionId = subSection.id;

            if (subSectionId === 'ergebnisse_patientencharakteristika' && dataForCurrentKollektiv?.deskriptiv) {
                const alterChartId = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.alterChartContainerIdPrefix}${currentKollektiv.replace(/\s+/g, '-')}`;
                const genderChartId = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.genderChartContainerIdPrefix}${currentKollektiv.replace(/\s+/g, '-')}`;
                const ageChartElement = document.getElementById(alterChartId);
                const genderChartElement = document.getElementById(genderChartId);

                if (ageChartElement) {
                    if(dataForCurrentKollektiv.deskriptiv.alterData && dataForCurrentKollektiv.deskriptiv.alterData.length > 0){
                        chartRenderer.renderAgeDistributionChart(dataForCurrentKollektiv.deskriptiv.alterData || [], alterChartId, { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 45 } });
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
                        chartRenderer.renderPieChart(genderData, genderChartId, { height: 220, margin: { top: 10, right: 10, bottom: 45, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderData.length });
                    } else {
                         ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung (${getKollektivDisplayName(currentKollektiv)}).</p>`);
                    }
                } else if (genderChartElement) {
                     ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung (${getKollektivDisplayName(currentKollektiv)}).</p>`);
                }
            } else if (['ergebnisse_as_performance', 'ergebnisse_vergleich_performance'].includes(subSectionId)) {
                const rocChartContainerId = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.rocChartContainerIdPrefix}${subSectionId.replace('ergebnisse_','')}`;
                const barChartContainerId = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichBarChartContainerIdPrefix}${subSectionId.replace('ergebnisse_','')}`;
                const rocChartElement = document.getElementById(rocChartContainerId);
                const barChartElement = document.getElementById(barChartContainerId);

                const statsAS = dataForCurrentKollektiv?.gueteAS;
                const statsT2Angewandt = dataForCurrentKollektiv?.gueteT2_angewandt;

                if (rocChartElement) {
                    if (statsAS?.auc && statsT2Angewandt?.auc) {
                         // For binary tests, ROC is just a point. We can show AUC values.
                         // A more complex ROC might involve plotting multiple methods if data was structured differently (e.g. continuous scores).
                         // For now, displaying AUCs is informative.
                         const aucASText = formatCI(statsAS.auc, 3, false, lang);
                         const aucT2Text = formatCI(statsT2Angewandt.auc, 3, false, lang);
                         ui_helpers.updateElementHTML(rocChartContainerId, `<div class="p-3 text-center text-muted small">AUC (Bal. Acc.) für ${getKollektivDisplayName(currentKollektiv)}:<br>Avocado Sign: ${aucASText}<br>Angewandte T2: ${aucT2Text}<br><small>(ROC-Kurven-Visualisierung für binäre Tests oft auf diesen Punkt reduziert)</small></div>`);
                    } else {
                        ui_helpers.updateElementHTML(rocChartContainerId, `<p class="text-muted small text-center p-3">Keine Daten für ROC Chart (${getKollektivDisplayName(currentKollektiv)}).</p>`);
                    }
                }

                if (barChartElement) {
                    if (statsAS && statsT2Angewandt) {
                         const chartDataComp = [
                            { metric: 'Sens', AS: statsAS.sens?.value ?? NaN, T2: statsT2Angewandt.sens?.value ?? NaN },
                            { metric: 'Spez', AS: statsAS.spez?.value ?? NaN, T2: statsT2Angewandt.spez?.value ?? NaN },
                            { metric: 'PPV', AS: statsAS.ppv?.value ?? NaN, T2: statsT2Angewandt.ppv?.value ?? NaN },
                            { metric: 'NPV', AS: statsAS.npv?.value ?? NaN, T2: statsT2Angewandt.npv?.value ?? NaN },
                            { metric: 'Acc', AS: statsAS.acc?.value ?? NaN, T2: statsT2Angewandt.acc?.value ?? NaN },
                            { metric: 'AUC', AS: statsAS.auc?.value ?? NaN, T2: statsT2Angewandt.auc?.value ?? NaN }
                        ].filter(d => !isNaN(d.AS) && !isNaN(d.T2));

                        if (chartDataComp.length > 0) {
                            chartRenderer.renderComparisonBarChart(chartDataComp, barChartContainerId, { height: 300, margin: { top: 20, right: 20, bottom: 60, left: 55 } }, 'Angew. T2');
                        } else {
                             ui_helpers.updateElementHTML(barChartContainerId, `<p class="text-muted small text-center p-3">Unvollständige Daten für Vergleichs-Balkendiagramm (${getKollektivDisplayName(currentKollektiv)}).</p>`);
                        }
                    } else {
                         ui_helpers.updateElementHTML(barChartContainerId, `<p class="text-muted small text-center p-3">Keine Daten für Vergleichs-Balkendiagramm (${getKollektivDisplayName(currentKollektiv)}).</p>`);
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
