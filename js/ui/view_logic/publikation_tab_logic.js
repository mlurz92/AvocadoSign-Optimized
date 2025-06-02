const publikationTabLogic = (() => {

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
                bfResultsPerKollektivForLogic,
                state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
            );
        } catch (error) {
            console.error("Fehler bei der Berechnung der Publikationsstatistiken:", error);
            allKollektivStats = null;
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showToast === 'function') {
                ui_helpers.showToast("Fehler bei der Vorbereitung der Publikationsdaten.", "danger");
            }
        }
    }

    function getRenderedSectionContent(mainSectionId, lang, currentKollektivId) {
        if (!allKollektivStats) {
            console.warn("PublikationTabLogic: allKollektivStats nicht initialisiert. Versuche erneute Initialisierung.");
            if (rawGlobalDataInputForLogic && appliedCriteriaForLogic && appliedLogicForLogic && typeof statisticsService !== 'undefined' && typeof state !== 'undefined' && typeof PUBLICATION_CONFIG !== 'undefined') {
                initializeData(rawGlobalDataInputForLogic, appliedCriteriaForLogic, appliedLogicForLogic, bfResultsPerKollektivForLogic);
            }
            if (!allKollektivStats) {
                return '<p class="text-danger">Statistische Grunddaten für Publikations-Tab konnten nicht geladen werden. Bitte führen Sie ggf. Analysen durch oder laden Sie die Seite neu.</p>';
            }
        }
        
        const currentPublikationBfMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

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
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
            bruteForceMetricForPublication: currentPublikationBfMetric,
            ciMethodProportion: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION,
            ciMethodEffectsize: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE,
        };

        const optionsForRenderer = {
            currentKollektiv: currentKollektivId,
            bruteForceMetric: currentPublikationBfMetric
        };

        return publicationRenderer.renderSectionContent(mainSectionId, lang, allKollektivStats, commonDataForGenerator, optionsForRenderer);
    }

    function updateDynamicChartsForPublicationTab(mainSectionId, lang, currentKollektivNameForContextOnly) {
        if (!allKollektivStats) {
            console.warn("Keine Daten für Chart-Rendering im Publikationstab vorhanden.");
            return;
        }

        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === mainSectionId);
        if (!mainSectionConfig || !mainSectionConfig.subSections) {
            return;
        }
        
        const currentPublikationBfMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        mainSectionConfig.subSections.forEach(subSection => {
            const subSectionId = subSection.id;

            if (subSectionId === 'ergebnisse_patientencharakteristika') {
                const dataForGesamtKollektiv = allKollektivStats['Gesamt'];
                if (dataForGesamtKollektiv?.deskriptiv) {
                    const alterChartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart;
                    const genderChartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart;
                    const ageChartElement = document.getElementById(alterChartConfig.id);
                    const genderChartElement = document.getElementById(genderChartConfig.id);

                    if (ageChartElement) {
                        if (dataForGesamtKollektiv.deskriptiv.alterData && dataForGesamtKollektiv.deskriptiv.alterData.length > 0) {
                            chartRenderer.renderAgeDistributionChart(dataForGesamtKollektiv.deskriptiv.alterData || [], alterChartConfig.id, { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 45 } });
                        } else {
                            ui_helpers.updateElementHTML(alterChartConfig.id, `<p class="text-muted small text-center p-3">Keine Daten für Altersverteilung (Gesamtkollektiv).</p>`);
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
                            chartRenderer.renderPieChart(genderData, genderChartConfig.id, { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderData.length });
                        } else {
                            ui_helpers.updateElementHTML(genderChartConfig.id, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung (Gesamtkollektiv).</p>`);
                        }
                    } else if (genderChartElement) {
                        ui_helpers.updateElementHTML(genderChartConfig.id, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung (Gesamtkollektiv).</p>`);
                    }
                }
            } else if (subSectionId === 'ergebnisse_vergleich_performance') {
                const chartConfigs = [
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt,
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartDirektOP,
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartNRCT
                ];
                const kollektiveForCharts = ['Gesamt', 'direkt OP', 'nRCT'];

                kollektiveForCharts.forEach((kolId, index) => {
                    const chartConfig = chartConfigs[index];
                    const chartElement = document.getElementById(chartConfig.id);
                    const dataForThisKollektiv = allKollektivStats[kolId];

                    if (chartElement && dataForThisKollektiv) {
                        const asStats = dataForThisKollektiv.gueteAS;
                        let bfStatsForChart = dataForThisKollektiv.gueteT2_bruteforce;
                        let bfDefForChart = dataForThisKollektiv.bruteforce_definition;

                        if (!bfStatsForChart || !bfDefForChart || bfDefForChart.metricName !== currentPublikationBfMetric) {
                            console.warn(`PublikationTabLogic: BF-Daten für Kollektiv ${kolId} und Metrik ${currentPublikationBfMetric} nicht direkt in allKollektivStats gefunden. Versuche Neuberechnung oder Fallback.`);
                            const bfResultsFromManager = bruteForceManager.getResultsForKollektiv(kolId);
                            if (bfResultsFromManager && bfResultsFromManager.metric === currentPublikationBfMetric && bfResultsFromManager.bestResult) {
                                 const tempEvalData = t2CriteriaManager.evaluateDataset(cloneDeep(dataProcessor.filterDataByKollektiv(rawGlobalDataInputForLogic, kolId)), bfResultsFromManager.bestResult.criteria, bfResultsFromManager.bestResult.logic);
                                 bfStatsForChart = statisticsService.calculateDiagnosticPerformance(tempEvalData, 't2', 'n');
                                 bfDefForChart = {
                                     criteria: bfResultsFromManager.bestResult.criteria,
                                     logic: bfResultsFromManager.bestResult.logic,
                                     metricName: bfResultsFromManager.metric,
                                     metricValue: bfResultsFromManager.bestResult.metricValue
                                 };
                            } else {
                                 bfStatsForChart = null;
                                 bfDefForChart = null;
                                 console.warn(`Keine passenden BF-Ergebnisse für ${kolId} und Metrik ${currentPublikationBfMetric} gefunden, auch nicht im Manager.`);
                            }
                        }


                        if (asStats && bfStatsForChart && bfDefForChart) {
                            const chartDataComp = [
                                { metric: 'Sens', AS: asStats.sens?.value ?? NaN, T2: bfStatsForChart.sens?.value ?? NaN },
                                { metric: 'Spez', AS: asStats.spez?.value ?? NaN, T2: bfStatsForChart.spez?.value ?? NaN },
                                { metric: 'PPV', AS: asStats.ppv?.value ?? NaN, T2: bfStatsForChart.ppv?.value ?? NaN },
                                { metric: 'NPV', AS: asStats.npv?.value ?? NaN, T2: bfStatsForChart.npv?.value ?? NaN },
                                { metric: 'Acc', AS: asStats.acc?.value ?? NaN, T2: bfStatsForChart.acc?.value ?? NaN },
                                { metric: 'AUC', AS: asStats.auc?.value ?? NaN, T2: bfStatsForChart.auc?.value ?? NaN }
                            ].filter(d => !isNaN(d.AS) && !isNaN(d.T2));

                            if (chartDataComp.length > 0) {
                                const t2Label = `BF-T2 (${(bfDefForChart.metricName || currentPublikationBfMetric).substring(0,6)}.)`;
                                chartRenderer.renderComparisonBarChart(chartDataComp, chartConfig.id, { height: 250, margin: { top: 20, right: 20, bottom: 50, left: 50 } }, t2Label);
                            } else {
                                ui_helpers.updateElementHTML(chartConfig.id, `<p class="text-muted small text-center p-3">Keine validen Vergleichsdaten für Chart (${getKollektivDisplayName(kolId)}).</p>`);
                            }
                        } else {
                             let reason = "Unvollständige Basisdaten";
                             if (!asStats) reason = "AS Statistiken fehlen";
                             else if (!bfStatsForChart) reason = `BF Statistiken für Metrik '${currentPublikationBfMetric}' fehlen`;
                             else if (!bfDefForChart) reason = `BF Definition für Metrik '${currentPublikationBfMetric}' fehlt`;
                            ui_helpers.updateElementHTML(chartConfig.id, `<p class="text-muted small text-center p-3">${reason} für Vergleichschart (${getKollektivDisplayName(kolId)}).</p>`);
                        }
                    } else if (chartElement) {
                         ui_helpers.updateElementHTML(chartConfig.id, `<p class="text-muted small text-center p-3">Keine Daten für ${getKollektivDisplayName(kolId)}.</p>`);
                    }
                });
            }
        });
    }

    return Object.freeze({
        initializeData,
        getRenderedSectionContent,
        updateDynamicChartsForPublicationTab
    });

})();
