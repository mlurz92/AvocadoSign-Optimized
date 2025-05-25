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
        const localizedTexts = getLocalizedUITexts(lang);
        const generalTexts = localizedTexts.general || {};

        if (!allKollektivStats) {
            if (rawGlobalDataInputForLogic && appliedCriteriaForLogic && appliedLogicForLogic) {
                initializeData(rawGlobalDataInputForLogic, appliedCriteriaForLogic, appliedLogicForLogic, bfResultsPerKollektivForLogic);
            }
            if (!allKollektivStats) {
                const errorMsg = lang === 'de' ?
                    'Statistische Grunddaten für Publikations-Tab konnten nicht geladen werden. Bitte führen Sie ggf. Analysen durch oder laden Sie die Seite neu.' :
                    'Core statistical data for the Publication tab could not be loaded. Please perform analyses if necessary or reload the page.';
                return `<p class="text-danger">${errorMsg}</p>`;
            }
        }

        const currentBruteForceMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const bruteForceMetricConfig = PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === currentBruteForceMetric);
        const bruteForceMetricLabel = bruteForceMetricConfig ? bruteForceMetricConfig.label : currentBruteForceMetric;


        const options = {
            currentKollektiv: currentKollektiv,
            bruteForceMetric: currentBruteForceMetric, // The value
            bruteForceMetricDisplay: bruteForceMetricLabel, // The display label
            lang: lang,
            localizedTexts: localizedTexts
        };

        // commonData needs to be constructed with localized names for the publicationTextGenerator
        const commonDataForTextGen = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            currentKollektivName: getKollektivDisplayName(currentKollektiv, lang, localizedTexts),
            nGesamt: allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0,
            nDirektOP: allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
            nNRCT: allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0,
            t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
            t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
            bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            references: { // These are generally kept as is, but could be localized if needed
                lurzSchaefer2025: "Lurz & Schäfer (2025)",
                koh2008: "Koh et al. (2008)",
                barbaro2024: "Barbaro et al. (2024)",
                rutegard2025: "Rutegård et al. (2025)",
                beetsTan2018ESGAR: "ESGAR Consensus (Beets-Tan et al. 2018)"
            },
            bruteForceMetricForPublication: bruteForceMetricLabel // Pass the display name
        };
        
        // publicationData (allKollektivStats) and kollektiveData (allKollektivStats) are the same here.
        return publicationRenderer.renderSectionContent(mainSectionId, lang, allKollektivStats, allKollektivStats, options, commonDataForTextGen);
    }

    function updateDynamicChartsForPublicationTab(mainSectionId, lang, currentKollektivNameForContextOnly) {
        const localizedTexts = getLocalizedUITexts(lang);
        const chartTitles = localizedTexts.chartTitles || {};
        const legendLabels = localizedTexts.legendLabels || {};
        const generalTexts = localizedTexts.general || {};
        const na = generalTexts.notApplicable || 'N/A';

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
                            chartRenderer.renderAgeDistributionChart(dataForGesamtKollektiv.deskriptiv.alterData || [], alterChartId, { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 45 }, lang: lang });
                        } else {
                            const noDataText = lang === 'de' ? 'Keine Daten für Altersverteilung (Gesamtkollektiv).' : 'No data for age distribution (Overall Cohort).';
                            ui_helpers.updateElementHTML(alterChartId, `<p class="text-muted small text-center p-3">${noDataText}</p>`);
                        }
                    }
                    if (genderChartElement && dataForGesamtKollektiv.deskriptiv.geschlecht) {
                        const genderData = [
                            { label: legendLabels.male || 'Männlich', value: dataForGesamtKollektiv.deskriptiv.geschlecht.m ?? 0 },
                            { label: legendLabels.female || 'Weiblich', value: dataForGesamtKollektiv.deskriptiv.geschlecht.f ?? 0 }
                        ];
                        if (dataForGesamtKollektiv.deskriptiv.geschlecht.unbekannt > 0) {
                            genderData.push({ label: legendLabels.unknownGender || 'Unbekannt', value: dataForGesamtKollektiv.deskriptiv.geschlecht.unbekannt });
                        }
                        if (genderData.some(d => d.value > 0)) {
                            chartRenderer.renderPieChart(genderData, genderChartId, { height: 220, margin: { top: 10, right: 10, bottom: 40, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderData.length, lang: lang });
                        } else {
                            const noDataText = lang === 'de' ? 'Keine Daten für Geschlechterverteilung (Gesamtkollektiv).' : 'No data for gender distribution (Overall Cohort).';
                            ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">${noDataText}</p>`);
                        }
                    } else if (genderChartElement) {
                        const noDataText = lang === 'de' ? 'Keine Daten für Geschlechterverteilung (Gesamtkollektiv).' : 'No data for gender distribution (Overall Cohort).';
                        ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">${noDataText}</p>`);
                    }
                }
            } else if (subSectionId === 'ergebnisse_vergleich_performance') {
                const kollektiveForCharts = ['Gesamt', 'direkt OP', 'nRCT'];
                kollektiveForCharts.forEach(kolId => {
                    const chartId = `pub-chart-vergleich-${kolId.replace(/\s+/g, '-')}`;
                    const chartElement = document.getElementById(chartId);
                    const dataForThisKollektiv = allKollektivStats[kolId];
                    const localizedKollektivName = getKollektivDisplayName(kolId, lang, localizedTexts);


                    if (chartElement && dataForThisKollektiv) {
                        const asStats = dataForThisKollektiv.gueteAS;
                        const bfStats = dataForThisKollektiv.gueteT2_bruteforce;
                        const bfDef = dataForThisKollektiv.bruteforce_definition;

                        if (asStats && bfStats && bfDef) {
                            const chartDataComp = [
                                { metric: legendLabels.sens || 'Sens', AS: asStats.sens?.value ?? NaN, T2: bfStats.sens?.value ?? NaN },
                                { metric: legendLabels.spez || 'Spez', AS: asStats.spez?.value ?? NaN, T2: bfStats.spez?.value ?? NaN },
                                { metric: legendLabels.ppv || 'PPV', AS: asStats.ppv?.value ?? NaN, T2: bfStats.ppv?.value ?? NaN },
                                { metric: legendLabels.npv || 'NPV', AS: asStats.npv?.value ?? NaN, T2: bfStats.npv?.value ?? NaN },
                                { metric: legendLabels.acc || 'Acc', AS: asStats.acc?.value ?? NaN, T2: bfStats.acc?.value ?? NaN },
                                { metric: legendLabels.auc || 'AUC', AS: asStats.auc?.value ?? NaN, T2: bfStats.auc?.value ?? NaN }
                            ].filter(d => !isNaN(d.AS) && !isNaN(d.T2));

                            if (chartDataComp.length > 0) {
                                const bfMetricLabel = PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === bfDef.metricName)?.label || bfDef.metricName;
                                const t2Label = (legendLabels.bfT2 || 'BF-T2 ({METRIC_NAME})').replace('{METRIC_NAME}', bfMetricLabel.substring(0,6) + (bfMetricLabel.length > 6 ? '.' : ''));
                                chartRenderer.renderComparisonBarChart(chartDataComp, chartId, { height: 250, margin: { top: 20, right: 20, bottom: 50, left: 50 }, lang: lang }, t2Label, legendLabels.avocadoSign);
                            } else {
                                const noDataText = (lang === 'de' ? 'Keine validen Vergleichsdaten für Chart ({KOLLEKTIV}).' : 'No valid comparison data for chart ({KOLLEKTIV}).').replace('{KOLLEKTIV}', localizedKollektivName);
                                ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">${noDataText}</p>`);
                            }
                        } else {
                             const incompleteDataText = (lang === 'de' ? 'Unvollständige Daten für Vergleichschart ({KOLLEKTIV}).' : 'Incomplete data for comparison chart ({KOLLEKTIV}).').replace('{KOLLEKTIV}', localizedKollektivName);
                            ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">${incompleteDataText}</p>`);
                        }
                    } else if (chartElement) {
                         const noDataForCohortText = (lang === 'de' ? 'Keine Daten für {KOLLEKTIV}.' : 'No data for {KOLLEKTIV}.').replace('{KOLLEKTIV}', localizedKollektivName);
                         ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">${noDataForCohortText}</p>`);
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
