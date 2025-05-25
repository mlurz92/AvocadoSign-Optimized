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

        allKollektivStats = statisticsService.calculateAllStatsForPublication(
            rawGlobalDataInputForLogic,
            appliedCriteriaForLogic,
            appliedLogicForLogic,
            bfResultsPerKollektivForLogic
        );
    }

    function getRenderedSectionContent(mainSectionId, lang, currentKollektiv) {
        const langUiTexts = getUiTexts(lang);

        if (!allKollektivStats) {
            console.warn("PublikationTabLogic: allKollektivStats nicht initialisiert. Versuche erneute Initialisierung.");
            if (rawGlobalDataInputForLogic && appliedCriteriaForLogic && appliedLogicForLogic) {
                initializeData(rawGlobalDataInputForLogic, appliedCriteriaForLogic, appliedLogicForLogic, bfResultsPerKollektivForLogic);
            }
            if (!allKollektivStats) {
                return `<p class="text-danger">${langUiTexts.error?.publicationDataLoadFailed || 'Statistische Grunddaten für Publikations-Tab konnten nicht geladen werden. Bitte führen Sie ggf. Analysen durch oder laden Sie die Seite neu.'}</p>`;
            }
        }

        const options = {
            currentKollektiv: currentKollektiv,
            bruteForceMetric: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
        };
        return publicationRenderer.renderSectionContent(mainSectionId, lang, allKollektivStats, allKollektivStats, options);
    }

    function updateDynamicChartsForPublicationTab(mainSectionId, lang, currentKollektivNameForContextOnly) {
        const langUiTexts = getUiTexts(lang);
        const chartTexts = langUiTexts.chartTitles || {};
        const legendTexts = langUiTexts.legendLabels || {};
        const axisTexts = langUiTexts.axisLabels || {};
        const noDataText = langUiTexts.chartNoData || 'Keine Daten für Diagramm.';
        const errorText = langUiTexts.chartError || 'Diagrammfehler.';

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
                    const alterChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaAlterChart.id;
                    const genderChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaGeschlechtChart.id;
                    const ageChartElement = document.getElementById(alterChartId);
                    const genderChartElement = document.getElementById(genderChartId);

                    if (ageChartElement) {
                        if (dataForGesamtKollektiv.deskriptiv.alterData && dataForGesamtKollektiv.deskriptiv.alterData.length > 0) {
                            const ageChartOptions = {
                                height: 220,
                                margin: { top: 10, right: 10, bottom: 40, left: 45 },
                                xAxisLabel: axisTexts.age,
                                yAxisLabel: axisTexts.patientCount
                            };
                            chartRenderer.renderAgeDistributionChart(dataForGesamtKollektiv.deskriptiv.alterData || [], alterChartId, ageChartOptions);
                        } else {
                            ui_helpers.updateElementHTML(alterChartId, `<p class="text-muted small text-center p-3">${noDataText}</p>`);
                        }
                    }
                    if (genderChartElement && dataForGesamtKollektiv.deskriptiv.geschlecht) {
                        const genderData = [
                            { label: legendTexts.male, value: dataForGesamtKollektiv.deskriptiv.geschlecht.m ?? 0 },
                            { label: legendTexts.female, value: dataForGesamtKollektiv.deskriptiv.geschlecht.f ?? 0 }
                        ];
                        if (dataForGesamtKollektiv.deskriptiv.geschlecht.unbekannt > 0) {
                            genderData.push({ label: legendTexts.unknownGender, value: dataForGesamtKollektiv.deskriptiv.geschlecht.unbekannt });
                        }
                        if (genderData.some(d => d.value > 0)) {
                            const genderChartOptions = {
                                height: 220,
                                margin: { top: 10, right: 10, bottom: 40, left: 10 },
                                innerRadiusFactor: 0.0,
                                legendBelow: true,
                                legendItemCount: genderData.length
                            };
                            chartRenderer.renderPieChart(genderData, genderChartId, genderChartOptions);
                        } else {
                            ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">${noDataText}</p>`);
                        }
                    } else if (genderChartElement) {
                        ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">${noDataText}</p>`);
                    }
                }
            } else if (subSectionId === 'ergebnisse_vergleich_performance') {
                const kollektiveForChartsConfig = [
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt,
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartDirektOP,
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartNRCT
                ];
                const kollektivIds = ['Gesamt', 'direkt OP', 'nRCT'];


                kollektiveForChartsConfig.forEach((chartConf, index) => {
                    const kolId = kollektivIds[index];
                    const chartId = chartConf.id;
                    const chartElement = document.getElementById(chartId);
                    const dataForThisKollektiv = allKollektivStats[kolId];

                    if (chartElement && dataForThisKollektiv) {
                        const asStats = dataForThisKollektiv.gueteAS;
                        const bfStats = dataForThisKollektiv.gueteT2_bruteforce;
                        const bfDef = dataForThisKollektiv.bruteforce_definition;

                        if (asStats && bfStats && bfDef) {
                            const chartDataComp = [
                                { metric: 'Sens', AS: asStats.sens?.value ?? NaN, T2: bfStats.sens?.value ?? NaN },
                                { metric: 'Spez', AS: asStats.spez?.value ?? NaN, T2: bfStats.spez?.value ?? NaN },
                                { metric: 'PPV', AS: asStats.ppv?.value ?? NaN, T2: bfStats.ppv?.value ?? NaN },
                                { metric: 'NPV', AS: asStats.npv?.value ?? NaN, T2: bfStats.npv?.value ?? NaN },
                                { metric: 'Acc', AS: asStats.acc?.value ?? NaN, T2: bfStats.acc?.value ?? NaN },
                                { metric: 'AUC', AS: asStats.auc?.value ?? NaN, T2: bfStats.auc?.value ?? NaN }
                            ].filter(d => !isNaN(d.AS) && !isNaN(d.T2));

                            if (chartDataComp.length > 0) {
                                const t2LabelText = (langUiTexts.publicationTab?.bfShortLabelForChart || 'BF-T2 ({METRIC_NAME_SHORT}.)')
                                                    .replace('{METRIC_NAME_SHORT}', bfDef.metricName.substring(0,6));
                                const chartOptions = {
                                    height: 250,
                                    margin: { top: 20, right: 20, bottom: 50, left: 50 },
                                    yAxisLabel: axisTexts.metricValue,
                                    legendLabels: {
                                        AS: legendTexts.avocadoSign,
                                        T2: t2LabelText
                                    }
                                };
                                chartRenderer.renderComparisonBarChart(chartDataComp, chartId, chartOptions, t2LabelText);
                            } else {
                                ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">${noDataText.replace('{KOLLEKTIV}', getKollektivDisplayName(kolId, lang))}</p>`);
                            }
                        } else {
                             ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">${(langUiTexts.incompleteDataForChart || 'Unvollständige Daten für Vergleichschart ({KOLLEKTIV})').replace('{KOLLEKTIV}', getKollektivDisplayName(kolId, lang))}</p>`);
                        }
                    } else if (chartElement) {
                         ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">${noDataText.replace('{KOLLEKTIV}', getKollektivDisplayName(kolId, lang))}</p>`);
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
