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
        const effectiveLang = UI_TEXTS?.kollektivDisplayNames?.[lang] ? lang : 'de';
        if (!allKollektivStats) {
            console.warn("PublikationTabLogic: allKollektivStats nicht initialisiert. Versuche erneute Initialisierung.");
            if (rawGlobalDataInputForLogic && appliedCriteriaForLogic && appliedLogicForLogic) {
                initializeData(rawGlobalDataInputForLogic, appliedCriteriaForLogic, appliedLogicForLogic, bfResultsPerKollektivForLogic);
            }
            if (!allKollektivStats) {
                const errorMsg = effectiveLang === 'de' ? 'Statistische Grunddaten für Publikations-Tab konnten nicht geladen werden. Bitte führen Sie ggf. Analysen durch oder laden Sie die Seite neu.' : 'Basic statistical data for the Publication tab could not be loaded. Please perform analyses if necessary or reload the page.';
                return `<p class="text-danger">${errorMsg}</p>`;
            }
        }

        const options = {
            currentKollektiv: currentKollektiv,
            bruteForceMetric: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
        };
        return publicationRenderer.renderSectionContent(mainSectionId, effectiveLang, allKollektivStats, allKollektivStats, options);
    }

    function updateDynamicChartsForPublicationTab(mainSectionId, lang, currentKollektivNameForContextOnly) {
        const effectiveLang = UI_TEXTS?.kollektivDisplayNames?.[lang] ? lang : 'de';

        if (!allKollektivStats) {
            const warnMsg = effectiveLang === 'de' ? "Keine Daten für Chart-Rendering im Publikationstab vorhanden." : "No data available for chart rendering in the publication tab.";
            console.warn(warnMsg);
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
                    const ageChartElement = document.getElementById(alterChartId);
                    const genderChartElement = document.getElementById(genderChartId);

                    const alterChartTitleKey = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.captionKey;
                    const genderChartTitleKey = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.captionKey;

                    const alterChartTitle = UI_TEXTS?.publikationTab?.figureCaptions?.[effectiveLang]?.[alterChartTitleKey]?.replace('[KOLLEKTIV]', getKollektivDisplayName("Gesamt", effectiveLang)) || (effectiveLang === 'de' ? 'Abb. 1a: Altersverteilung' : 'Fig. 1a: Age Distribution');
                    const genderChartTitle = UI_TEXTS?.publikationTab?.figureCaptions?.[effectiveLang]?.[genderChartTitleKey]?.replace('[KOLLEKTIV]', getKollektivDisplayName("Gesamt", effectiveLang)) || (effectiveLang === 'de' ? 'Abb. 1b: Geschlechterverteilung' : 'Fig. 1b: Gender Distribution');


                    if (ageChartElement) {
                        if (dataForGesamtKollektiv.deskriptiv.alterData && dataForGesamtKollektiv.deskriptiv.alterData.length > 0) {
                            chartRenderer.renderAgeDistributionChart(dataForGesamtKollektiv.deskriptiv.alterData || [], alterChartId, {
                                height: 220,
                                margin: { top: 10, right: 10, bottom: 40, left: 45 },
                                lang: effectiveLang,
                                xAxisLabel: UI_TEXTS?.axisLabels?.[effectiveLang]?.age,
                                yAxisLabel: UI_TEXTS?.axisLabels?.[effectiveLang]?.patientCount,
                                tooltipLabels: {
                                    age: UI_TEXTS?.axisLabels?.[effectiveLang]?.ageShort || (effectiveLang === 'de' ? 'Alter' : 'Age'),
                                    count: UI_TEXTS?.axisLabels?.[effectiveLang]?.countShort || (effectiveLang === 'de' ? 'Anzahl' : 'Count')
                                }
                            });
                        } else {
                            const errorMsg = effectiveLang === 'de' ? 'Keine Daten für Altersverteilung (Gesamtkollektiv).' : 'No data for age distribution (Overall Cohort).';
                            ui_helpers.updateElementHTML(alterChartId, `<p class="text-muted small text-center p-3">${errorMsg}</p>`);
                        }
                    }
                    if (genderChartElement && dataForGesamtKollektiv.deskriptiv.geschlecht) {
                        const genderData = [
                            { label: UI_TEXTS?.legendLabels?.[effectiveLang]?.male || 'Männlich', value: dataForGesamtKollektiv.deskriptiv.geschlecht.m ?? 0 },
                            { label: UI_TEXTS?.legendLabels?.[effectiveLang]?.female || 'Weiblich', value: dataForGesamtKollektiv.deskriptiv.geschlecht.f ?? 0 }
                        ];
                        if (dataForGesamtKollektiv.deskriptiv.geschlecht.unbekannt > 0) {
                            genderData.push({ label: UI_TEXTS?.legendLabels?.[effectiveLang]?.unknownGender || 'Unbekannt', value: dataForGesamtKollektiv.deskriptiv.geschlecht.unbekannt });
                        }
                        if (genderData.some(d => d.value > 0)) {
                            chartRenderer.renderPieChart(genderData, genderChartId, {
                                height: 220,
                                margin: { top: 10, right: 10, bottom: 40, left: 10 },
                                innerRadiusFactor: 0.0,
                                legendBelow: true,
                                legendItemCount: genderData.length,
                                lang: effectiveLang
                            });
                        } else {
                            const errorMsg = effectiveLang === 'de' ? 'Keine Daten für Geschlechterverteilung (Gesamtkollektiv).' : 'No data for gender distribution (Overall Cohort).';
                            ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">${errorMsg}</p>`);
                        }
                    } else if (genderChartElement) {
                        const errorMsg = effectiveLang === 'de' ? 'Keine Daten für Geschlechterverteilung (Gesamtkollektiv).' : 'No data for gender distribution (Overall Cohort).';
                        ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">${errorMsg}</p>`);
                    }
                }
            } else if (subSectionId === 'ergebnisse_vergleich_performance') {
                const kollektiveForCharts = [
                    {id: 'Gesamt', chartHtmlId: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichChartGesamt.id, figKey: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichChartGesamt.captionKey},
                    {id: 'direkt OP', chartHtmlId: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichChartDirektOP.id, figKey: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichChartDirektOP.captionKey},
                    {id: 'nRCT', chartHtmlId: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichChartNRCT.id, figKey: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichChartNRCT.captionKey}
                ];

                kollektiveForCharts.forEach(kolInfo => {
                    const chartId = kolInfo.chartHtmlId;
                    const chartElement = document.getElementById(chartId);
                    const dataForThisKollektiv = allKollektivStats[kolInfo.id];

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
                                const bfTargetMetricName = UI_TEXTS?.publikationTab?.bfMetrics?.[effectiveLang]?.[bfDef.metricName.replace(/ /g,'').toLowerCase()] || UI_TEXTS?.publikationTab?.bfMetrics?.de?.[bfDef.metricName.replace(/ /g,'').toLowerCase()] || bfDef.metricName;
                                const t2LegendLabel = `BF-T2 (${bfTargetMetricName.substring(0,6)}.)`;
                                const chartTitleText = UI_TEXTS?.publikationTab?.figureCaptions?.[effectiveLang]?.[kolInfo.figKey]?.replace('[KOLLEKTIV]', getKollektivDisplayName(kolInfo.id, effectiveLang)) || (effectiveLang === 'de' ? `Vergleich für ${getKollektivDisplayName(kolInfo.id, effectiveLang)}` : `Comparison for ${getKollektivDisplayName(kolInfo.id, effectiveLang)}`);

                                chartRenderer.renderComparisonBarChart(chartDataComp, chartId, {
                                    height: 250,
                                    margin: { top: 20, right: 20, bottom: 50, left: 50 },
                                    lang: effectiveLang,
                                    yAxisLabel: UI_TEXTS?.axisLabels?.[effectiveLang]?.metricValue,
                                    t2LabelForLegend: t2LegendLabel,
                                    subgroupDisplayNames: {
                                        'AS': UI_TEXTS?.legendLabels?.[effectiveLang]?.avocadoSign || 'Avocado Sign (AS)',
                                        'T2': t2LegendLabel
                                    }
                                });
                            } else {
                                const errorMsg = effectiveLang === 'de' ? `Keine validen Vergleichsdaten für Chart (${getKollektivDisplayName(kolInfo.id, effectiveLang)}).` : `No valid comparison data for chart (${getKollektivDisplayName(kolInfo.id, effectiveLang)}).`;
                                ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">${errorMsg}</p>`);
                            }
                        } else {
                            const errorMsg = effectiveLang === 'de' ? `Unvollständige Daten für Vergleichschart (${getKollektivDisplayName(kolInfo.id, effectiveLang)}).` : `Incomplete data for comparison chart (${getKollektivDisplayName(kolInfo.id, effectiveLang)}).`;
                            ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">${errorMsg}</p>`);
                        }
                    } else if (chartElement) {
                         const errorMsg = effectiveLang === 'de' ? `Keine Daten für ${getKollektivDisplayName(kolInfo.id, effectiveLang)}.` : `No data for ${getKollektivDisplayName(kolInfo.id, effectiveLang)}.`;
                         ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">${errorMsg}</p>`);
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
