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
            console.warn("publikationTabLogic.getRenderedSectionContent: allKollektivStats nicht initialisiert. Versuche Fallback-Initialisierung.");
            const fallbackAppliedCriteria = t2CriteriaManager.getAppliedCriteria ? t2CriteriaManager.getAppliedCriteria() : getDefaultT2Criteria();
            const fallbackAppliedLogic = t2CriteriaManager.getAppliedLogic ? t2CriteriaManager.getAppliedLogic() : APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
            
            let fallbackBfResults = null;
            if (typeof lastBruteForceResults !== 'undefined' && lastBruteForceResults !== null) {
                 fallbackBfResults = lastBruteForceResults; // lastBruteForceResults should be in {kollektiv: data} format
            }


            allKollektivStats = statisticsService.calculateAllStatsForPublication(
                rawGlobalData || (typeof patientDataRaw !== 'undefined' ? patientDataRaw : []),
                fallbackAppliedCriteria,
                fallbackAppliedLogic,
                fallbackBfResults 
            );
            if (!allKollektivStats) {
                 return '<p class="text-danger">Statistische Grunddaten für Publikations-Tab konnten nicht geladen werden. Bitte führen Sie ggf. Analysen in anderen Tabs erneut aus.</p>';
            }
        }

        const options = {
            currentKollektiv: currentKollektiv, // Das global ausgewählte Kollektiv für kontextuelle Hervorhebungen
            bruteForceMetric: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
        };
        // publicationRenderer erwartet nur allKollektivStats als Datenquelle
        return publicationRenderer.renderSectionContent(mainSectionId, lang, allKollektivStats, options);
    }

    function updateDynamicChartsForPublicationTab(mainSectionId, lang, currentKollektivGlobal) {
        if (!allKollektivStats) {
            console.warn("Keine Daten für Chart-Rendering im Publikationstab vorhanden.");
            return;
        }
        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === mainSectionId);
        if (!mainSectionConfig || !mainSectionConfig.subSections) return;

        mainSectionConfig.subSections.forEach(subSectionConfig => {
            const subSectionId = subSectionConfig.id;

            if (subSectionId === 'ergebnisse_patientencharakteristika') {
                // Charts for each Kollektiv if they were individually displayed,
                // but here we use currentKollektivGlobal as context for single display.
                const dataForChart = allKollektivStats[currentKollektivGlobal]?.deskriptiv;
                const alterChartId = `pub-chart-alter-${currentKollektivGlobal.replace(/\s+/g, '-')}`;
                const genderChartId = `pub-chart-gender-${currentKollektivGlobal.replace(/\s+/g, '-')}`;
                const ageChartElement = document.getElementById(alterChartId);
                const genderChartElement = document.getElementById(genderChartId);

                if (ageChartElement && dataForChart) {
                    if(dataForChart.alterData && dataForChart.alterData.length > 0){
                        chartRenderer.renderAgeDistributionChart(dataForChart.alterData || [], alterChartId, { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 45 } });
                    } else {
                        ui_helpers.updateElementHTML(alterChartId, `<p class="text-muted small text-center p-3">Keine Daten für Altersverteilung (${getKollektivDisplayName(currentKollektivGlobal)}).</p>`);
                    }
                }
                if (genderChartElement && dataForChart && dataForChart.geschlecht) {
                    const genderData = [
                        {label: UI_TEXTS.legendLabels.male, value: dataForChart.geschlecht.m ?? 0},
                        {label: UI_TEXTS.legendLabels.female, value: dataForChart.geschlecht.f ?? 0}
                    ];
                    if(dataForChart.geschlecht.unbekannt > 0) {
                        genderData.push({label: UI_TEXTS.legendLabels.unknownGender, value: dataForChart.geschlecht.unbekannt });
                    }
                     if(genderData.some(d => d.value > 0)) {
                        chartRenderer.renderPieChart(genderData, genderChartId, { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderData.length });
                    } else {
                         ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung (${getKollektivDisplayName(currentKollektivGlobal)}).</p>`);
                    }
                } else if (genderChartElement) {
                     ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung (${getKollektivDisplayName(currentKollektivGlobal)}).</p>`);
                }

            } else if (['ergebnisse_as_performance', 'ergebnisse_vergleich_performance'].includes(subSectionId)) {
                // For these sections, we expect comparison charts.
                // The specific chart (e.g., AS vs. T2 Applied for currentKollektivGlobal) will be rendered.
                const rocChartId = `pub-chart-roc-${subSectionId.replace('ergebnisse_','')}`; // e.g., pub-chart-roc-vergleich-performance
                const barChartId = `pub-chart-bar-${subSectionId.replace('ergebnisse_','')}`; // e.g., pub-chart-bar-vergleich-performance
                const rocChartElement = document.getElementById(rocChartId);
                const barChartElement = document.getElementById(barChartId);

                const dataForCurrentKollektiv = allKollektivStats[currentKollektivGlobal];

                // Example: ROC and Bar for AS vs T2_angewandt for the currentKollektivGlobal
                if (rocChartElement && dataForCurrentKollektiv?.gueteAS && dataForCurrentKollektiv?.gueteT2_angewandt) {
                     // Simplified: For a real ROC comparison, you'd need FPR/TPR arrays for both methods.
                     // Here, we just show AUCs as a placeholder text.
                     ui_helpers.updateElementHTML(rocChartId, `<div class="p-3 text-center text-muted small">ROC-Kurven-Darstellung für Vergleiche (z.B. AS vs. T2 angewandt) erfordert spezifische ROC-Daten.<br>AUC(AS): ${formatNumber(dataForCurrentKollektiv.gueteAS.auc?.value,3)}, AUC(Angew. T2): ${formatNumber(dataForCurrentKollektiv.gueteT2_angewandt.auc?.value,3)} für ${getKollektivDisplayName(currentKollektivGlobal)}</div>`);
                } else if (rocChartElement) {
                    ui_helpers.updateElementHTML(rocChartId, `<p class="text-muted small text-center p-3">Keine Daten für ROC Chart (${getKollektivDisplayName(currentKollektivGlobal)}).</p>`);
                }

                if (barChartElement && dataForCurrentKollektiv?.gueteAS && dataForCurrentKollektiv?.gueteT2_angewandt) {
                     const chartDataComp = [
                        { metric: 'Sens', AS: dataForCurrentKollektiv.gueteAS.sens?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.sens?.value ?? 0 },
                        { metric: 'Spez', AS: dataForCurrentKollektiv.gueteAS.spez?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.spez?.value ?? 0 },
                        { metric: 'PPV', AS: dataForCurrentKollektiv.gueteAS.ppv?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.ppv?.value ?? 0 },
                        { metric: 'NPV', AS: dataForCurrentKollektiv.gueteAS.npv?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.npv?.value ?? 0 },
                        { metric: 'Acc', AS: dataForCurrentKollektiv.gueteAS.acc?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.acc?.value ?? 0 },
                        { metric: 'AUC', AS: dataForCurrentKollektiv.gueteAS.auc?.value ?? 0, T2: dataForCurrentKollektiv.gueteT2_angewandt.auc?.value ?? 0 }
                    ];
                    chartRenderer.renderComparisonBarChart(chartDataComp, barChartId, { height: 280, margin: { top: 20, right: 20, bottom: 60, left: 50 } }, 'Angew. T2');
                } else if (barChartElement) {
                     ui_helpers.updateElementHTML(barChartId, `<p class="text-muted small text-center p-3">Keine Daten für Vergleichs-Balkendiagramm (${getKollektivDisplayName(currentKollektivGlobal)}).</p>`);
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
