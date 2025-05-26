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

        if (rawGlobalDataInputForLogic && Array.isArray(rawGlobalDataInputForLogic) && rawGlobalDataInputForLogic.length > 0) {
            allKollektivStats = statisticsService.calculateAllStatsForPublication(
                rawGlobalDataInputForLogic,
                appliedCriteriaForLogic,
                appliedLogicForLogic,
                bfResultsPerKollektivForLogic
            );
        } else {
            allKollektivStats = null;
            console.warn("PublikationTabLogic: Ungültige oder leere Rohdaten bei Initialisierung.");
        }
    }

    function getRenderedSectionContent(mainSectionId, lang, currentKollektivForContextOnly) {
        if (!allKollektivStats) {
            console.warn("PublikationTabLogic: allKollektivStats nicht initialisiert. Versuche erneute Initialisierung.");
            if (rawGlobalDataInputForLogic && appliedCriteriaForLogic && appliedLogicForLogic) {
                initializeData(rawGlobalDataInputForLogic, appliedCriteriaForLogic, appliedLogicForLogic, bfResultsPerKollektivForLogic);
            }
            if (!allKollektivStats) {
                return '<p class="text-danger">Statistische Grunddaten für Publikations-Tab konnten nicht geladen werden. Bitte führen Sie ggf. Analysen durch oder laden Sie die Seite neu.</p>';
            }
        }

        const options = {
            currentKollektiv: currentKollektivForContextOnly,
            bruteForceMetricForDisplay: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication,
            defaultBruteForceMetric: PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
        };
        return publicationRenderer.renderSectionContent(mainSectionId, lang, allKollektivStats, options);
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
                const dataForGesamtKollektiv = allKollektivStats[APP_CONFIG.KOLLEKTIV_IDS.GESAMT];
                if (dataForGesamtKollektiv?.deskriptiv) {
                    const ageChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartAlterGesamt.id;
                    const genderChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartGenderGesamt.id;
                    const ageChartElement = document.getElementById(ageChartId);
                    const genderChartElement = document.getElementById(genderChartId);

                    if (ageChartElement) {
                        if (dataForGesamtKollektiv.deskriptiv.alterData && dataForGesamtKollektiv.deskriptiv.alterData.length > 0) {
                            chartRenderer.renderAgeDistributionChart(dataForGesamtKollektiv.deskriptiv.alterData || [], ageChartId, { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 45 } });
                        } else {
                            ui_helpers.updateElementHTML(ageChartId, `<p class="text-muted small text-center p-3">Keine Daten für Altersverteilung (Gesamtkollektiv).</p>`);
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
                const kollektiveForCharts = [
                    { id: APP_CONFIG.KOLLEKTIV_IDS.GESAMT, chartId: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichsChartGesamt.id, litSetId: 'koh_2008_morphology' },
                    { id: APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP, chartId: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichsChartDirektOP.id, litSetId: 'rutegard_et_al_esgar' },
                    { id: APP_CONFIG.KOLLEKTIV_IDS.NRCT, chartId: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichsChartNRCT.id, litSetId: 'barbaro_2024_restaging' }
                ];

                kollektiveForCharts.forEach(kolInfo => {
                    const chartElement = document.getElementById(kolInfo.chartId);
                    const dataForThisKollektiv = allKollektivStats[kolInfo.id];

                    if (chartElement && dataForThisKollektiv) {
                        const asStats = dataForThisKollektiv.gueteAS;
                        const litStats = dataForThisKollektiv.gueteT2_literatur?.[kolInfo.litSetId];
                        const bfStats = dataForThisKollektiv.gueteT2_bruteforce;
                        const bfDef = dataForThisKollektiv.bruteforce_definition; // Contains the metric it was optimized for

                        const chartDataComp = [];
                        const metrics = ['Sens', 'Spez', 'PPV', 'NPV', 'Acc', 'AUC'];

                        metrics.forEach(metric => {
                            const mLower = metric.toLowerCase();
                            const item = { metric: metric, 'AS': NaN, 'Lit. T2': NaN, 'BF T2': NaN };
                            if(asStats?.[mLower]?.value !== undefined) item['AS'] = asStats[mLower].value;
                            if(litStats?.[mLower]?.value !== undefined) item['Lit. T2'] = litStats[mLower].value;
                            if(bfStats?.[mLower]?.value !== undefined) item['BF T2'] = bfStats[mLower].value;

                            if (!isNaN(item['AS']) && !isNaN(item['Lit. T2']) && !isNaN(item['BF T2'])) {
                                chartDataComp.push(item);
                            } else if (!isNaN(item['AS'])) { // Fallback if some T2 methods are missing
                                const partialItem = {metric: item.metric, 'AS': item['AS']};
                                if(!isNaN(item['Lit. T2'])) partialItem['Lit. T2'] = item['Lit. T2'];
                                if(!isNaN(item['BF T2'])) partialItem['BF T2'] = item['BF T2'];
                                chartDataComp.push(partialItem);
                            }
                        });


                        if (chartDataComp.length > 0) {
                            const litShortName = studyT2CriteriaManager.getStudyCriteriaSetById(kolInfo.litSetId)?.displayShortName || 'Lit. T2';
                            const bfMetricName = bfDef?.metricName ? bfDef.metricName.substring(0,6) + '.' : 'BF';
                            const t2LabelForChart = { 'Lit. T2': litShortName, 'BF T2': `BF (${bfMetricName})`};


                            const subGroupsForChart = ['AS'];
                            if (chartDataComp.some(d => d['Lit. T2'] !== undefined && !isNaN(d['Lit. T2']))) subGroupsForChart.push('Lit. T2');
                            if (chartDataComp.some(d => d['BF T2'] !== undefined && !isNaN(d['BF T2']))) subGroupsForChart.push('BF T2');

                            const finalChartData = chartDataComp.map(item => {
                                const newItem = {metric: item.metric};
                                subGroupsForChart.forEach(sg => newItem[sg] = item[sg]);
                                return newItem;
                            });


                            chartRenderer.renderComparisonBarChart(
                                finalChartData,
                                kolInfo.chartId,
                                {
                                    height: 280,
                                    margin: { top: 20, right: 10, bottom: 65, left: 45 },
                                    subgroupDisplayNames: {
                                        'AS': UI_TEXTS.legendLabels.avocadoSign,
                                        'Lit. T2': t2LabelForChart['Lit. T2'],
                                        'BF T2': t2LabelForChart['BF T2']
                                    },
                                    colorScaleRange: [CHART_DEFAULTS.AS_COLOR, CHART_DEFAULTS.TERTIARY_COLOR_GREEN, CHART_DEFAULTS.SECONDARY_COLOR]
                                }
                            );
                        } else {
                            ui_helpers.updateElementHTML(kolInfo.chartId, `<p class="text-muted small text-center p-3">Keine validen Vergleichsdaten für Chart (${getKollektivDisplayName(kolInfo.id)}).</p>`);
                        }
                    } else if (chartElement) {
                         ui_helpers.updateElementHTML(kolInfo.chartId, `<p class="text-muted small text-center p-3">Keine Daten für ${getKollektivDisplayName(kolInfo.id)}.</p>`);
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
