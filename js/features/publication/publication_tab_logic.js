const publicationTabLogic = (() => {

    let allKollektivStats = null;
    let rawGlobalDataInputForLogic = null;
    let appliedCriteriaForLogic = null;
    let appliedLogicForLogic = null;
    let bfResultsPerKollektivForLogic = null;

    function initializeData(globalRawData, appliedCriteria, appliedLogic, bfResultsPerKollektiv) {
        rawGlobalDataInputForLogic = globalRawData;
        appliedCriteriaForLogic = appliedCriteria;
        appliedLogicForLogic = appliedLogic;
        bfResultsPerKollektivForLogic = bfResultsPerKollektiv;

        try {
            allKollektivStats = statisticsService.calculateAllStatsForPublication(
                rawGlobalDataInputForLogic,
                appliedCriteriaForLogic,
                appliedLogicForLogic,
                bfResultsPerKollektivForLogic
            );
        } catch (error) {
            console.error("Fehler bei der Berechnung der Publikationsstatistiken:", error);
            allKollektivStats = null;
            if (typeof ui_helpers !== 'undefined' && ui_helpers.showToast) {
                ui_helpers.showToast("Fehler bei der Vorbereitung der Publikationsdaten.", "danger");
            }
        }
    }

    function getRenderedSectionContent(mainSectionId, lang, currentKollektivId) {
        if (!allKollektivStats) {
            console.warn("publicationTabLogic: allKollektivStats nicht initialisiert. Versuche erneute Initialisierung.");
            if (rawGlobalDataInputForLogic && appliedCriteriaForLogic && appliedLogicForLogic && typeof statisticsService !== 'undefined') {
                initializeData(rawGlobalDataInputForLogic, appliedCriteriaForLogic, appliedLogicForLogic, bfResultsPerKollektivForLogic);
            }
            if (!allKollektivStats) {
                return '<p class="text-danger">Statistische Grunddaten für Publikations-Tab konnten nicht geladen werden. Bitte führen Sie ggf. Analysen durch oder laden Sie die Seite neu.</p>';
            }
        }

        const commonDataForGenerator = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            nGesamt: allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0,
            nDirektOP: allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
            nNRCT: allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0,
            t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
            t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
            bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            references: PUBLICATION_CONFIG.referenceManagement.references.reduce((acc, ref) => { acc[ref.key] = ref.text; return acc; }, {}),
            bruteForceMetricForPublication: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication,
            appliedCriteriaDefinition: studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteriaForLogic, appliedLogicForLogic, false)
        };

        const optionsForRenderer = {
            currentKollektiv: currentKollektivId,
            bruteForceMetric: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
        };

        return publicationTabRenderer.renderSectionContent(mainSectionId, lang, allKollektivStats, commonDataForGenerator, optionsForRenderer);
    }

    function updateDynamicChartsForPublicationTab(mainSectionId, lang, currentKollektivNameForContextOnly) {
        if (!allKollektivStats || !rawGlobalDataInputForLogic) {
            console.warn("Keine Daten für Chart-Rendering im Publikationstab vorhanden.");
            return;
        }

        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === mainSectionId);
        if (!mainSectionConfig || !mainSectionConfig.subSections) {
            return;
        }

        mainSectionConfig.subSections.forEach(subSection => {
            const subSectionId = subSection.id;

            if (subSectionId === 'ergebnisse_patientencharakteristika') {
                const dataForGesamtKollektiv = allKollektivStats['Gesamt'];
                if (dataForGesamtKollektiv?.deskriptiv) {
                    const alterChartId = PUBLICATION_CONFIG.publicationElements.figures.avocadoSignExamples.id;
                    const genderChartId = PUBLICATION_CONFIG.publicationElements.figures.genderDistributionChart.id;
                    const consortChartId = PUBLICATION_CONFIG.publicationElements.figures.consortDiagram.id;


                    const ageChartElement = document.getElementById(alterChartId);
                    const genderChartElement = document.getElementById(genderChartId);
                    const consortElement = document.getElementById(consortChartId);


                    if (ageChartElement) {
                        if (dataForGesamtKollektiv.deskriptiv.alterData && dataForGesamtKollektiv.deskriptiv.alterData.length > 0) {
                            chartRenderer.renderAgeDistributionChart(dataForGesamtKollektiv.deskriptiv.alterData || [], alterChartId, { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 45 } });
                        } else {
                            ui_helpers.updateElementHTML(alterChartId, `<p class="text-muted small text-center p-3">Keine Daten für Altersverteilung (Gesamtkollektiv).</p>`);
                        }
                    }
                    if (genderChartElement && dataForGesamtKollektiv.deskriptiv.geschlecht) {
                        const genderData = [
                            { label: UI_TEXTS.legendLabels.male, value: dataForGesamtKollektiv.deskriptiv.geschlecht.m ?? 0 },
                            { label: UI_TEXTS.legendLabels.female, value: dataForGesamtKollektiv.deskriptiv.geschlecht.f ?? 0 }
                        ];
                        if (dataForGesamtKollektiv.deskriptiv.geschlecht.unbekannt > 0) {
                            genderData.push({ label: UI_TEXTS.legendLabels.unknownGender, value: dataForGesamtKollektiv.deskriptiv.geschlecht.unbekannt });
                        }
                        if (genderData.some(d => d.value > 0)) {
                            chartRenderer.renderPieChart(genderData, genderChartId, { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderData.length });
                        } else {
                            ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung (Gesamtkollektiv).</p>`);
                        }
                    } else if (genderChartElement) {
                        ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung (Gesamtkollektiv).</p>`);
                    }
                    if (consortElement && typeof publicationTabComponents !== 'undefined' && typeof publicationTabComponents.renderConsortDiagram === 'function') {
                         publicationTabComponents.renderConsortDiagram(consortChartId, lang, allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten, allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten, allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten);
                    } else if (consortElement) {
                        ui_helpers.updateElementHTML(consortChartId, `<p class="text-muted small text-center p-3">CONSORT-Diagramm Renderer nicht verfügbar.</p>`);
                    }
                }
            } else if (subSectionId === 'ergebnisse_vergleich_as_vs_t2') {
                const kollektiveForCharts = ['Gesamt', 'direkt OP', 'nRCT'];
                const chartConfigs = [
                    PUBLICATION_CONFIG.publicationElements.figures.performanceComparisonOverall,
                    PUBLICATION_CONFIG.publicationElements.figures.performanceComparisonDirektOP,
                    PUBLICATION_CONFIG.publicationElements.figures.performanceComparisonNRCT
                ];
                const rocConfig = PUBLICATION_CONFIG.publicationElements.figures.rocCurvesComparison;
                const rocChartElement = document.getElementById(rocConfig.id);

                kollektiveForCharts.forEach((kolId, index) => {
                    const chartId = chartConfigs[index].id;
                    const chartElement = document.getElementById(chartId);
                    const dataForThisKollektiv = allKollektivStats[kolId];

                    if (chartElement && dataForThisKollektiv) {
                        const asStats = dataForThisKollektiv.gueteAS;
                        let bfStatsForChart = dataForThisKollektiv.gueteT2_bruteforce;
                        let bfDefForChart = dataForThisKollektiv.bruteforce_definition;
                        const pubBfMetric = state.getCurrentPublikationBruteForceMetric();

                        if (bfDefForChart && bfDefForChart.metricName !== pubBfMetric) {
                            const bfResultsForKollektiv = bruteForceManager.getResultsForKollektiv(kolId);
                            if (bfResultsForKollektiv && bfResultsForKollektiv.results) {
                                const bestForSelectedMetric = bfResultsForKollektiv.results.reduce((best, current) => {
                                    if(current.metricName === pubBfMetric && current.metricValue > (best ? best.metricValue : -Infinity)) {
                                        return current;
                                    }
                                    return best;
                                }, null);

                                if (bestForSelectedMetric) {
                                     const filteredData = dataProcessor.filterDataByKollektiv(rawGlobalDataInputForLogic, kolId);
                                     const evaluatedDataBF = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), bestForSelectedMetric.criteria, bestForSelectedMetric.logic);
                                     bfStatsForChart = statisticsService.calculateDiagnosticPerformance(evaluatedDataBF, 't2', 'n');
                                     bfDefForChart = { criteria: bestForSelectedMetric.criteria, logic: bestForSelectedMetric.logic, metricValue: bestForSelectedMetric.metricValue, metricName: pubBfMetric };
                                }
                            }
                        }


                        if (asStats && bfStatsForChart && bfDefForChart) {
                            const chartDataComp = [
                                { metric: 'Sens', AS: asStats.sens?.value ?? NaN, T2: bfStatsForChart.sens?.value ?? NaN },
                                { metric: 'Spez', AS: asStats.spez?.value ?? NaN, T2: bfStatsForChart.spez?.value ?? NaN }
                            ].filter(d => !isNaN(d.AS) && !isNaN(d.T2));

                            if (chartDataComp.length > 0) {
                                const t2Label = `BF-T2 (${(bfDefForChart.metricName || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication).substring(0,6)}.)`;
                                chartRenderer.renderComparisonBarChart(chartDataComp, chartId, { height: 250, margin: { top: 20, right: 20, bottom: 50, left: 50 }, yAxisLabel: lang === 'de' ? 'Wert' : 'Value' }, t2Label);
                            } else {
                                ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">Keine validen Vergleichsdaten für Chart (${getKollektivDisplayName(kolId)}).</p>`);
                            }
                        } else {
                            ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">Unvollständige Daten für Vergleichschart (${getKollektivDisplayName(kolId)}).</p>`);
                        }
                    } else if (chartElement) {
                         ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">Keine Daten für ${getKollektivDisplayName(kolId)}.</p>`);
                    }
                });
                if (rocChartElement && allKollektivStats['Gesamt']?.gueteAS) {
                    // Placeholder for ROC curve rendering, data needs to be properly prepared
                    // For now, just indicates that a ROC curve for AS (Gesamtkollektiv) would go here
                    // Actual ROC data (FPR/TPR pairs) would need to be generated by statisticsService
                    // For a binary test like AS, the ROC is just two points (0,0 -> FPR,TPR -> 1,1)
                    // True ROC curves are for tests with variable thresholds
                    const asGesamtStats = allKollektivStats['Gesamt'].gueteAS;
                    if (asGesamtStats && !isNaN(asGesamtStats.sens?.value) && !isNaN(asGesamtStats.spez?.value)) {
                        const fpr = 1 - asGesamtStats.spez.value;
                        const tpr = asGesamtStats.sens.value;
                        const rocDataAS = [{fpr:0, tpr:0}, {fpr: fpr, tpr: tpr}, {fpr:1, tpr:1}];
                        chartRenderer.renderROCCurve(rocDataAS, rocConfig.id, { aucValue: asGesamtStats.auc, lineColor: APP_CONFIG.CHART_SETTINGS.AS_COLOR, showPoints: true });
                    } else {
                         ui_helpers.updateElementHTML(rocConfig.id, `<p class="text-muted small text-center p-3">ROC-Daten für Avocado Sign (Gesamtkollektiv) nicht verfügbar.</p>`);
                    }
                } else if (rocChartElement) {
                     ui_helpers.updateElementHTML(rocConfig.id, `<p class="text-muted small text-center p-3">Platzhalter für ROC-Kurven.</p>`);
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
