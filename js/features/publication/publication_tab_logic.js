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
            console.error("Fehler bei der Berechnung der Publikationsstatistiken:", error);
            allKollektivStats = null;
            ui_helpers.showToast("Fehler bei der Vorbereitung der Publikationsdaten.", "danger");
        }
    }

    function getRenderedSectionContent(mainSectionId, lang, currentKollektivId) {
        if (!allKollektivStats) {
            console.warn("PublikationTabLogic: allKollektivStats nicht initialisiert. Versuche erneute Initialisierung.");
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
            references: { // Diese könnten auch aus APP_CONFIG kommen, falls dort zentralisiert.
                lurzSchaefer2025: "Lurz & Schäfer (2025) [DOI: 10.1007/s00330-025-11462-y]",
                lurzSchaefer2025StudyPeriod: "Januar 2020 und November 2023",
                lurzSchaefer2025MRISystem: "3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers)",
                lurzSchaefer2025ContrastAgent: "Gadoteridol (ProHance; Bracco)",
                lurzSchaefer2025T2SliceThickness: "2-3 mm",
                lurzSchaefer2025RadiologistExperience: ["29", "7", "19"],
                koh2008: "Koh et al. (2008) [DOI: 10.1016/j.ijrobp.2007.10.016]",
                barbaro2024: "Barbaro et al. (2024) [DOI: 10.1016/j.radonc.2024.110124]",
                rutegard2025: "Rutegård et al. (2025) [DOI: 10.1007/s00330-025-11361-2]",
                beetsTan2018ESGAR: "Beets-Tan et al. (2018, ESGAR Consensus) [DOI: 10.1007/s00330-017-5026-2]"
            },
            bruteForceMetricForPublication: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
        };

        const optionsForRenderer = {
            currentKollektiv: currentKollektivId, // Der global gewählte Kollektiv für Kontext
            bruteForceMetric: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
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

        mainSectionConfig.subSections.forEach(subSection => {
            const subSectionId = subSection.id;

            if (subSectionId === 'ergebnisse_patientencharakteristika') {
                const dataForGesamtKollektiv = allKollektivStats['Gesamt'];
                if (dataForGesamtKollektiv?.deskriptiv) {
                    const alterChartId = `pub-chart-alter-Gesamt`;
                    const genderChartId = `pub-chart-gender-Gesamt`;
                    const ageChartElement = document.getElementById(alterChartId);
                    const genderChartElement = document.getElementById(genderChartId);

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
                }
            } else if (subSectionId === 'ergebnisse_vergleich_performance') {
                const kollektiveForCharts = ['Gesamt', 'direkt OP', 'nRCT'];
                kollektiveForCharts.forEach(kolId => {
                    const chartId = `pub-chart-vergleich-${kolId.replace(/\s+/g, '-')}`;
                    const chartElement = document.getElementById(chartId);
                    const dataForThisKollektiv = allKollektivStats[kolId];

                    if (chartElement && dataForThisKollektiv) {
                        const asStats = dataForThisKollektiv.gueteAS;
                        // Verwende die BF-Ergebnisse basierend auf der im State ausgewählten Metrik für die Publikationsansicht
                        const bfResultsForDisplay = bruteForceManager.getResultsForKollektiv(kolId);
                        let bfStatsForChart = null;
                        let bfDefForChart = null;

                        if (bfResultsForDisplay && bfResultsForDisplay.metric === state.getCurrentPublikationBruteForceMetric() && bfResultsForDisplay.bestResult) {
                             // Wenn die gespeicherten BF-Ergebnisse mit der aktuellen Auswahl übereinstimmen
                             const bfCriteria = bfResultsForDisplay.bestResult.criteria;
                             const bfLogic = bfResultsForDisplay.bestResult.logic;
                             const evaluatedDataBF = t2CriteriaManager.evaluateDataset(cloneDeep(dataProcessor.filterDataByKollektiv(rawGlobalDataInputForLogic, kolId)), bfCriteria, bfLogic);
                             bfStatsForChart = statisticsService.calculateDiagnosticPerformance(evaluatedDataBF, 't2', 'n');
                             bfDefForChart = {
                                 criteria: bfCriteria,
                                 logic: bfLogic,
                                 metricName: bfResultsForDisplay.metric,
                                 metricValue: bfResultsForDisplay.bestResult.metricValue
                             };
                        } else if (dataForThisKollektiv.gueteT2_bruteforce && dataForThisKollektiv.bruteforce_definition) {
                            // Fallback auf die Standard-BF-Metrik, die in allKollektivStats gespeichert ist
                            bfStatsForChart = dataForThisKollektiv.gueteT2_bruteforce;
                            bfDefForChart = dataForThisKollektiv.bruteforce_definition;
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
                                const t2Label = `BF-T2 (${(bfDefForChart.metricName || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication).substring(0,6)}.)`;
                                chartRenderer.renderComparisonBarChart(chartDataComp, chartId, { height: 250, margin: { top: 20, right: 20, bottom: 50, left: 50 } }, t2Label);
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
            }
        });
    }

    return Object.freeze({
        initializeData,
        getRenderedSectionContent,
        updateDynamicChartsForPublicationTab
    });

})();
