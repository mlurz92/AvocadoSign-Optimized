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

        try {
            allKollektivStats = statisticsService.calculateAllStatsForPublication(
                rawGlobalData,
                globalAppliedT2Criteria,
                globalAppliedT2Logic,
                globalBruteForceResultsPerKollektiv
            );
        } catch (error) {
            console.error("Fehler bei der Initialisierung der Publikationsdaten mit statisticsService.calculateAllStatsForPublication:", error);
            allKollektivStats = null;
        }


        if (!allKollektivStats) {
            console.warn("publikationTabLogic.initializeData: allKollektivStats konnte nicht initialisiert werden. Versuche Fallback.");
            const fallbackAppliedCriteria = t2CriteriaManager ? t2CriteriaManager.getAppliedCriteria() : getDefaultT2Criteria();
            const fallbackAppliedLogic = t2CriteriaManager ? t2CriteriaManager.getAppliedLogic() : APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
            
            let fallbackBfResults = null;
            if (globalBruteForceResultsPerKollektiv) {
                 fallbackBfResults = globalBruteForceResultsPerKollektiv;
            } else if (typeof lastBruteForceResults !== 'undefined' && lastBruteForceResults !== null) {
                 fallbackBfResults = lastBruteForceResults;
            }

            try {
                allKollektivStats = statisticsService.calculateAllStatsForPublication(
                    rawGlobalData || (typeof patientDataRaw !== 'undefined' ? patientDataRaw : []),
                    fallbackAppliedCriteria,
                    fallbackAppliedLogic,
                    fallbackBfResults
                );
            } catch (error) {
                console.error("Fehler beim Fallback-Versuch, Publikationsdaten zu initialisieren:", error);
                allKollektivStats = null;
            }
        }
    }

    function getRenderedSectionContent(mainSectionId, lang, currentKollektivGlobalFromState) {
        if (!allKollektivStats) {
             initializeData(rawGlobalData, globalAppliedT2Criteria, globalAppliedT2Logic, globalBruteForceResultsPerKollektiv);
             if (!allKollektivStats) {
                return '<p class="text-danger">Statistische Grunddaten für Publikations-Tab konnten nicht geladen oder initialisiert werden. Bitte führen Sie ggf. Analysen in anderen Tabs erneut aus und laden Sie die Seite neu.</p>';
             }
        }

        const options = {
            currentKollektiv: currentKollektivGlobalFromState,
            bruteForceMetric: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
        };
        return publicationRenderer.renderSectionContent(mainSectionId, lang, allKollektivStats, options);
    }

    function updateDynamicChartsForPublicationTab(mainSectionId, lang, currentKollektivGlobal) {
        if (!allKollektivStats) {
            console.warn("Keine Daten (allKollektivStats) für Chart-Rendering im Publikationstab vorhanden.");
            return;
        }
        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === mainSectionId);
        if (!mainSectionConfig || !mainSectionConfig.subSections) return;

        const publicationBfMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        mainSectionConfig.subSections.forEach(subSectionConfig => {
            const subSectionId = subSectionConfig.id;
            const dataForCurrentGlobalKollektiv = allKollektivStats[currentKollektivGlobal];

            if (subSectionId === 'ergebnisse_patientencharakteristika') {
                const deskriptivData = dataForCurrentGlobalKollektiv?.deskriptiv;
                const ageChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartAlter.idPrefix + (currentKollektivGlobal || 'Gesamt').replace(/\s+/g, '-');
                const genderChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartGeschlecht.idPrefix + (currentKollektivGlobal || 'Gesamt').replace(/\s+/g, '-');
                const ageChartElement = document.getElementById(ageChartId);
                const genderChartElement = document.getElementById(genderChartId);

                if (ageChartElement && deskriptivData?.alterData && deskriptivData.alterData.length > 0) {
                    chartRenderer.renderAgeDistributionChart(deskriptivData.alterData, ageChartId, { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 45 } });
                } else if (ageChartElement) {
                    ui_helpers.updateElementHTML(ageChartId, `<p class="text-muted small text-center p-3">Keine Daten für Altersverteilung (${getKollektivDisplayName(currentKollektivGlobal)}).</p>`);
                }

                if (genderChartElement && deskriptivData?.geschlecht) {
                    const genderData = [
                        {label: UI_TEXTS.legendLabels.male, value: deskriptivData.geschlecht.m ?? 0},
                        {label: UI_TEXTS.legendLabels.female, value: deskriptivData.geschlecht.f ?? 0}
                    ];
                    if(deskriptivData.geschlecht.unbekannt > 0) {
                        genderData.push({label: UI_TEXTS.legendLabels.unknownGender, value: deskriptivData.geschlecht.unbekannt });
                    }
                     if(genderData.some(d => d.value > 0)) {
                        chartRenderer.renderPieChart(genderData, genderChartId, { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderData.length });
                    } else if (genderChartElement) {
                         ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung (${getKollektivDisplayName(currentKollektivGlobal)}).</p>`);
                    }
                } else if (genderChartElement) {
                     ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung (${getKollektivDisplayName(currentKollektivGlobal)}).</p>`);
                }
            } else if (subSectionId === 'ergebnisse_as_performance') {
                const chartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartASPerformanceAllKollektive.id;
                const chartElement = document.getElementById(chartId);
                if (chartElement) {
                    const chartData = [];
                    ['Gesamt', 'direkt OP', 'nRCT'].forEach(kolId => {
                        const stats = allKollektivStats[kolId]?.gueteAS;
                        if (stats) {
                            chartData.push({ metric: getKollektivDisplayName(kolId), Sens: stats.sens?.value, Spez: stats.spez?.value, PPV: stats.ppv?.value, NPV: stats.npv?.value, Acc: stats.acc?.value, AUC: stats.auc?.value });
                        }
                    });
                    if (chartData.length > 0) {
                        // This needs a transformation for renderComparisonBarChart or a dedicated renderer.
                        // For now, let's prepare for a grouped bar chart where metrics are groups, and kollektive are subgroups.
                        const metricsToPlot = ['Sens', 'Spez', 'Acc', 'AUC'];
                        const transformedChartData = metricsToPlot.map(metricName => {
                            const entry = { metric: metricName };
                            chartData.forEach(kolData => {
                                entry[kolData.metric] = kolData[metricName]; // kolData.metric is actually kollektivDisplayName
                            });
                            return entry;
                        });
                         const subgroupLabels = chartData.reduce((acc, curr) => { acc[curr.metric] = curr.metric; return acc; } , {});
                        chartRenderer.renderComparisonBarChart(transformedChartData, chartId, { height: 300, margin: {top: 20, right: 20, bottom: 70, left: 50}, subgroupsOverride: subgroupLabels }, 'Kollektiv');
                    } else {
                         ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">Keine Daten für AS Performance Chart.</p>`);
                    }
                }
            } else if (subSectionId === 'ergebnisse_literatur_t2_performance') {
                 const chartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartLiteraturT2Performance.id;
                 const chartElement = document.getElementById(chartId);
                 if (chartElement) {
                    const chartData = [];
                    const litSets = [
                        {id: 'rutegard_et_al_esgar', kol: 'direkt OP', name: 'ESGAR (Direkt OP)'},
                        {id: 'koh_2008_morphology', kol: 'Gesamt', name: 'Koh (Gesamt)'},
                        {id: 'barbaro_2024_restaging', kol: 'nRCT', name: 'Barbaro (nRCT)'}
                    ];
                    litSets.forEach(ls => {
                        const stats = allKollektivStats[ls.kol]?.gueteT2_literatur?.[ls.id];
                        if (stats) {
                             chartData.push({ metric: ls.name, Sens: stats.sens?.value, Spez: stats.spez?.value, AUC: stats.auc?.value });
                        }
                    });
                     if (chartData.length > 0) {
                        const metricsToPlot = ['Sens', 'Spez', 'AUC'];
                        const transformedChartData = metricsToPlot.map(metricName => {
                            const entry = { metric: metricName };
                            chartData.forEach(setData => { entry[setData.metric] = setData[metricName]; }); // setData.metric is lit study name
                            return entry;
                        });
                        const subgroupLabels = chartData.reduce((acc, curr) => { acc[curr.metric] = curr.metric; return acc; } , {});
                        chartRenderer.renderComparisonBarChart(transformedChartData, chartId, { height: 300, margin: {top: 20, right: 20, bottom: 80, left: 50}, subgroupsOverride: subgroupLabels }, 'Literatur-Set');
                    } else {
                        ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">Keine Daten für Literatur T2 Performance Chart.</p>`);
                    }
                 }
            } else if (subSectionId === 'ergebnisse_optimierte_t2_performance') {
                 const chartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartBFT2Performance.id;
                 const chartElement = document.getElementById(chartId);
                 if (chartElement) {
                    const chartData = [];
                     ['Gesamt', 'direkt OP', 'nRCT'].forEach(kolId => {
                        const bfDef = allKollektivStats[kolId]?.bruteforce_definition;
                        const stats = allKollektivStats[kolId]?.gueteT2_bruteforce;
                        if (stats && bfDef && bfDef.metricName === publicationBfMetric) {
                            chartData.push({ metric: getKollektivDisplayName(kolId), Sens: stats.sens?.value, Spez: stats.spez?.value, Acc: stats.acc?.value, AUC: stats.auc?.value });
                        } else if (stats && bfDef) { // Show if optimized for different metric
                             chartData.push({ metric: `${getKollektivDisplayName(kolId)} (Opt: ${bfDef.metricName})`, Sens: stats.sens?.value, Spez: stats.spez?.value, Acc: stats.acc?.value, AUC: stats.auc?.value });
                        }
                    });
                    if (chartData.length > 0) {
                        const metricsToPlot = ['Sens', 'Spez', 'Acc', 'AUC'];
                        const transformedChartData = metricsToPlot.map(metricName => {
                            const entry = { metric: metricName };
                            chartData.forEach(kolData => { entry[kolData.metric] = kolData[metricName]; });
                            return entry;
                        });
                        const subgroupLabels = chartData.reduce((acc, curr) => { acc[curr.metric] = curr.metric; return acc; } , {});
                        chartRenderer.renderComparisonBarChart(transformedChartData, chartId, { height: 300, margin: {top: 20, right: 20, bottom: 90, left: 50}, subgroupsOverride: subgroupLabels }, 'Kollektiv (BF Opt.)');
                    } else {
                         ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">Keine Daten für BF-optimierte T2 Performance Chart für Metrik "${publicationBfMetric}".</p>`);
                    }
                 }
            } else if (subSectionId === 'ergebnisse_vergleich_performance') {
                const barChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartVergleichASvsT2Bar.id;
                const rocChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartVergleichASvsT2ROC.id;
                const barChartElement = document.getElementById(barChartId);
                const rocChartElement = document.getElementById(rocChartId);

                if (dataForCurrentGlobalKollektiv) {
                    const statsAS = dataForCurrentGlobalKollektiv.gueteAS;
                    const statsT2_angewandt = dataForCurrentGlobalKollektiv.gueteT2_angewandt;

                    if (barChartElement && statsAS && statsT2_angewandt) {
                         const chartDataComp = [
                            { metric: 'Sens', AS: statsAS.sens?.value ?? 0, T2: statsT2_angewandt.sens?.value ?? 0 },
                            { metric: 'Spez', AS: statsAS.spez?.value ?? 0, T2: statsT2_angewandt.spez?.value ?? 0 },
                            { metric: 'PPV', AS: statsAS.ppv?.value ?? 0, T2: statsT2_angewandt.ppv?.value ?? 0 },
                            { metric: 'NPV', AS: statsAS.npv?.value ?? 0, T2: statsT2_angewandt.npv?.value ?? 0 },
                            { metric: 'Acc', AS: statsAS.acc?.value ?? 0, T2: statsT2_angewandt.acc?.value ?? 0 },
                            { metric: 'AUC', AS: statsAS.auc?.value ?? 0, T2: statsT2_angewandt.auc?.value ?? 0 }
                        ];
                        chartRenderer.renderComparisonBarChart(chartDataComp, barChartId, { height: 280, margin: { top: 20, right: 20, bottom: 60, left: 50 } }, 'Angew. T2');
                    } else if (barChartElement) {
                         ui_helpers.updateElementHTML(barChartId, `<p class="text-muted small text-center p-3">Keine Daten für Vergleichs-Balkendiagramm (${getKollektivDisplayName(currentKollektivGlobal)}).</p>`);
                    }
                     // ROC Chart: AS vs Angewandt T2 für aktuelles globales Kollektiv.
                     // This requires specific ROC data points (TPR/FPR). For now, we show a placeholder or a single ROC for AS if data is available.
                     // A true comparison ROC needs data for both methods to be passed to a modified chartRenderer function.
                    if (rocChartElement && statsAS) {
                        // Placeholder: Real ROC comparison would need more data structure.
                        // For now, just display AUCs.
                        const asAuc = statsAS.auc?.value;
                        const t2Auc = statsT2_angewandt?.auc?.value;
                        let content = `<div class="p-3 text-center text-muted small">ROC-Kurven-Vergleich (AS vs. Angew. T2) erfordert spezifische ROC-Punktedaten für beide Methoden.`;
                        if (!isNaN(asAuc)) content += `<br>AUC (AS): ${formatNumber(asAuc,3)}`;
                        if (!isNaN(t2Auc)) content += `<br>AUC (Angew. T2): ${formatNumber(t2Auc,3)}`;
                        content += ` für ${getKollektivDisplayName(currentKollektivGlobal)}</div>`;
                        ui_helpers.updateElementHTML(rocChartId, content);
                        // Example for a single ROC curve if available (e.g. for AS, if rocData points were available)
                        // if (dataForCurrentGlobalKollektiv.rocDataAS) {
                        //    chartRenderer.renderROCCurve(dataForCurrentGlobalKollektiv.rocDataAS, rocChartId, { aucValue: statsAS.auc });
                        // }
                    } else if (rocChartElement) {
                        ui_helpers.updateElementHTML(rocChartId, `<p class="text-muted small text-center p-3">Keine Daten für ROC Chart (${getKollektivDisplayName(currentKollektivGlobal)}).</p>`);
                    }
                } else if (barChartElement || rocChartElement) {
                     if(barChartElement) ui_helpers.updateElementHTML(barChartId, `<p class="text-muted small text-center p-3">Keine Daten für ${getKollektivDisplayName(currentKollektivGlobal)}.</p>`);
                     if(rocChartElement) ui_helpers.updateElementHTML(rocChartId, `<p class="text-muted small text-center p-3">Keine Daten für ${getKollektivDisplayName(currentKollektivGlobal)}.</p>`);
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
