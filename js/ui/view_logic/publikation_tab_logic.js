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
                bfResultsPerKollektivForLogic
            );
        } catch (error) {
            allKollektivStats = null;
            ui_helpers.showToast("Fehler bei der Vorbereitung der Publikationsdaten.", "danger");
        }
    }

    function getRenderedSectionContent(mainSectionId, lang, currentKollektivId) {
        if (!allKollektivStats) {
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
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION,
            bruteForceMetricForPublication: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication,
            rawData: rawGlobalDataInputForLogic
        };

        const optionsForRenderer = {
            currentKollektiv: currentKollektivId,
            bruteForceMetric: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
        };

        return publicationRenderer.renderSectionContent(mainSectionId, lang, allKollektivStats, commonDataForGenerator, optionsForRenderer);
    }

    function updateDynamicChartsForPublicationTab(mainSectionId, lang, currentKollektivNameForContextOnly) {
        if (!allKollektivStats) {
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
                    const alterChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id;
                    const genderChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id;
                    const ageChartElement = document.getElementById(`${alterChartId}-chart-area`);
                    const genderChartElement = document.getElementById(`${genderChartId}-chart-area`);

                    const histOpts = { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 45 } };
                    const pieOpts = { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true };

                    if (ageChartElement) {
                        if (dataForGesamtKollektiv.deskriptiv.alterData && dataForGesamtKollektiv.deskriptiv.alterData.length > 0) {
                            chartRenderer.renderAgeDistributionChart(dataForGesamtKollektiv.deskriptiv.alterData || [], alterChartId, histOpts);
                        } else {
                            ui_helpers.updateElementHTML(ageChartElement.id, `<p class="text-muted small text-center p-3">Keine Daten für Altersverteilung (Gesamtkollektiv).</p>`);
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
                            chartRenderer.renderPieChart(genderData, genderChartId, { ...pieOpts, legendItemCount: genderData.length });
                        } else {
                            ui_helpers.updateElementHTML(genderChartElement.id, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung (Gesamtkollektiv).</p>`);
                        }
                    } else if (genderChartElement) {
                        ui_helpers.updateElementHTML(genderChartElement.id, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung (Gesamtkollektiv).</p>`);
                    }
                }
            } else if (subSectionId === 'ergebnisse_vergleich_as_vs_t2') {
                const kollektiveForCharts = ['Gesamt', 'direkt OP', 'nRCT'];
                const bruteForceMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

                if (!PUBLICATION_CONFIG || 
                    !PUBLICATION_CONFIG.publicationElements || 
                    !PUBLICATION_CONFIG.publicationElements.ergebnisse ||
                    typeof PUBLICATION_CONFIG.publicationElements.ergebnisse !== 'object') {
                    return; 
                }

                kollektiveForCharts.forEach(kolId => {
                    const chartConfigKey = `vergleichPerformanceChart${kolId.replace(/\s+/g, '')}`;
                    const chartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse[chartConfigKey];
                    
                    if (!chartConfig || typeof chartConfig !== 'object' || !chartConfig.id) {
                        return; 
                    }
                    const chartId = chartConfig.id;
                    const chartElement = document.getElementById(`${chartId}-chart-area`);
                    
                    const dataForThisKollektivOriginal = dataProcessor.filterDataByKollektiv(rawGlobalDataInputForLogic, kolId);
                    const dataForThisKollektivStats = allKollektivStats[kolId]; // This should contain all stats

                    if (chartElement && dataForThisKollektivStats) {
                        const asStats = dataForThisKollektivStats.gueteAS;
                        
                        let bfStatsForChart = null;
                        let bfDefForChart = null;

                        const bfResultsForDisplay = bruteForceManager.getResultsForKollektiv(kolId);

                        if (bfResultsForDisplay && bfResultsForDisplay.metric === bruteForceMetric && bfResultsForDisplay.bestResult) {
                             const bfCriteria = bfResultsForDisplay.bestResult.criteria;
                             const bfLogic = bfResultsForDisplay.bestResult.logic;
                             const evaluatedDataBF = t2CriteriaManager.evaluateDataset(cloneDeep(dataForThisKollektivOriginal), bfCriteria, bfLogic);
                             bfStatsForChart = statisticsService.calculateDiagnosticPerformance(evaluatedDataBF, 't2', 'n');
                             bfDefForChart = {
                                 criteria: bfCriteria,
                                 logic: bfLogic,
                                 metricName: bfResultsForDisplay.metric,
                                 metricValue: bfResultsForDisplay.bestResult.metricValue
                             };
                        } else if (dataForThisKollektivStats.gueteT2_bruteforce && dataForThisKollektivStats.bruteforce_definition) {
                            bfStatsForChart = dataForThisKollektivStats.gueteT2_bruteforce;
                            bfDefForChart = dataForThisKollektivStats.bruteforce_definition;
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
                                const t2Label = `BF-T2 (${(bfDefForChart.metricName || bruteForceMetric).substring(0,6)}.)`;
                                chartRenderer.renderComparisonBarChart(chartDataComp, chartId, { height: 250, margin: { top: 20, right: 20, bottom: 50, left: 50 } }, t2Label);
                            } else {
                                ui_helpers.updateElementHTML(chartElement.id, `<p class="text-muted small text-center p-3">Keine validen Vergleichsdaten für Chart (${getKollektivDisplayName(kolId)}).</p>`);
                            }
                        } else {
                            ui_helpers.updateElementHTML(chartElement.id, `<p class="text-muted small text-center p-3">Unvollständige Daten für Vergleichschart (${getKollektivDisplayName(kolId)}).</p>`);
                        }
                    } else if (chartElement) {
                         ui_helpers.updateElementHTML(chartElement.id, `<p class="text-muted small text-center p-3">Keine Daten für ${getKollektivDisplayName(kolId)}.</p>`);
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
