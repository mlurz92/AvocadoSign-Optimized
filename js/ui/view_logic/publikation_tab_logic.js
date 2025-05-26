const publikationTabLogic = (() => {

    let allKollektivStats = null;
    let rawGlobalDataInputForLogic = null;
    let appliedCriteriaForLogic = null;
    let appliedLogicForLogic = null;
    let bfResultsPerKollektivForLogic = null;

    function _getLang() {
        return (typeof state !== 'undefined' && state.getCurrentPublikationLang) ? state.getCurrentPublikationLang() : 'de';
    }

    function _getText(textObjPath, lang, replacements = {}) {
        const textObj = getObjectValueByPath(UI_TEXTS, textObjPath);
        let text = 'N/A Text Key: ' + textObjPath;
        if (textObj) {
            if (typeof textObj === 'string') {
                text = textObj;
            } else if (textObj[lang]) {
                text = textObj[lang];
            } else if (textObj['de']) {
                text = textObj['de'];
            } else if (typeof Object.values(textObj)[0] === 'string') {
                text = Object.values(textObj)[0];
            }
        }
        for (const key in replacements) {
            text = text.replace(new RegExp(`{${key.toUpperCase()}}`, 'g'), replacements[key]);
        }
        return text;
    }

    function initializeData(globalRawData, appliedCriteria, appliedLogic, bfResultsPerKollektiv) {
        rawGlobalDataInputForLogic = globalRawData;
        appliedCriteriaForLogic = appliedCriteria;
        appliedLogicForLogic = appliedLogic;
        bfResultsPerKollektivForLogic = bfResultsPerKollektiv;

        if (typeof statisticsService !== 'undefined' && typeof statisticsService.calculateAllStatsForPublication === 'function') {
            allKollektivStats = statisticsService.calculateAllStatsForPublication(
                rawGlobalDataInputForLogic,
                appliedCriteriaForLogic,
                appliedLogicForLogic,
                bfResultsPerKollektivForLogic
            );
        } else {
            console.error("PublikationTabLogic: statisticsService.calculateAllStatsForPublication ist nicht verfügbar.");
            allKollektivStats = null;
        }
    }

    function getRenderedSectionContent(mainSectionId, lang, currentKollektiv) {
        if (!allKollektivStats) {
            console.warn("PublikationTabLogic: allKollektivStats nicht initialisiert. Versuche erneute Initialisierung.");
            if (rawGlobalDataInputForLogic && appliedCriteriaForLogic && appliedLogicForLogic && typeof statisticsService !== 'undefined') {
                initializeData(rawGlobalDataInputForLogic, appliedCriteriaForLogic, appliedLogicForLogic, bfResultsPerKollektivForLogic);
            }
            if (!allKollektivStats) {
                const errorMsg = lang === 'de' ?
                    '<p class="text-danger">Statistische Grunddaten für Publikations-Tab konnten nicht geladen werden. Bitte führen Sie ggf. Analysen durch oder laden Sie die Seite neu.</p>' :
                    '<p class="text-danger">Statistical base data for the Publication tab could not be loaded. Please perform analyses if necessary or reload the page.</p>';
                return errorMsg;
            }
        }

        const currentBruteForceMetric = (typeof state !== 'undefined' && state.getCurrentPublikationBruteForceMetric) ?
                                          state.getCurrentPublikationBruteForceMetric() :
                                          PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const bruteForceMetricConfig = PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === currentBruteForceMetric);
        const bruteForceMetricName = bruteForceMetricConfig ? _getText(`UI_TEXTS.${bruteForceMetricConfig.labelKey}`, lang) || currentBruteForceMetric : currentBruteForceMetric;


        const options = {
            currentKollektiv: currentKollektiv,
            bruteForceMetric: currentBruteForceMetric,
            bruteForceMetricForPublicationName: bruteForceMetricName // Sprachabhängiger Name für Texte
        };

        if (typeof publicationRenderer !== 'undefined' && typeof publicationRenderer.renderSectionContent === 'function') {
            return publicationRenderer.renderSectionContent(mainSectionId, lang, allKollektivStats, allKollektivStats, options);
        } else {
            console.error("PublikationTabLogic: publicationRenderer.renderSectionContent ist nicht verfügbar.");
            const errorMsg = lang === 'de' ? "Fehler beim Rendern des Sektionsinhalts." : "Error rendering section content.";
            return `<p class="text-danger">${errorMsg}</p>`;
        }
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
                    const alterChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungGesamtChart.id;
                    const genderChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.genderVerteilungGesamtChart.id;
                    const ageChartElement = document.getElementById(alterChartId);
                    const genderChartElement = document.getElementById(genderChartId);

                    const chartOptionsAge = {
                        height: 220,
                        margin: { top: 10, right: 10, bottom: 40, left: 45 },
                        xAxisLabelKey: 'age', // UI_TEXTS.axisLabels.age
                        yAxisLabelKey: 'patientCount' // UI_TEXTS.axisLabels.patientCount
                    };
                    const chartOptionsGender = {
                        height: 220,
                        margin: { top: 10, right: 10, bottom: 40, left: 10 },
                        innerRadiusFactor: 0.0,
                        legendBelow: true
                    };

                    if (ageChartElement) {
                        if (dataForGesamtKollektiv.deskriptiv.alterData && dataForGesamtKollektiv.deskriptiv.alterData.length > 0) {
                            chartRenderer.renderAgeDistributionChart(dataForGesamtKollektiv.deskriptiv.alterData || [], alterChartId, chartOptionsAge);
                        } else {
                            ui_helpers.updateElementHTML(alterChartId, `<p class="text-muted small text-center p-3">${_getText('publikationTab.publicationMisc.noData', lang)}</p>`);
                        }
                    }
                    if (genderChartElement && dataForGesamtKollektiv.deskriptiv.geschlecht) {
                        const genderData = [
                            { label: _getText('legendLabels.male', lang), value: dataForGesamtKollektiv.deskriptiv.geschlecht.m ?? 0 },
                            { label: _getText('legendLabels.female', lang), value: dataForGesamtKollektiv.deskriptiv.geschlecht.f ?? 0 }
                        ];
                        if (dataForGesamtKollektiv.deskriptiv.geschlecht.unbekannt > 0) {
                            genderData.push({ label: _getText('legendLabels.unknownGender', lang), value: dataForGesamtKollektiv.deskriptiv.geschlecht.unbekannt });
                        }
                        chartOptionsGender.legendItemCount = genderData.length;
                        if (genderData.some(d => d.value > 0)) {
                            chartRenderer.renderPieChart(genderData, genderChartId, chartOptionsGender);
                        } else {
                            ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">${_getText('publikationTab.publicationMisc.noData', lang)}</p>`);
                        }
                    } else if (genderChartElement) {
                        ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">${_getText('publikationTab.publicationMisc.noData', lang)}</p>`);
                    }
                }
            } else if (subSectionId === 'ergebnisse_vergleich_performance') {
                const chartConfigs = [
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichMetrikenGesamtChart,
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichMetrikenDirektOPChart,
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichMetrikenNRCTChart
                ];
                 const cohortMap = { 'Gesamt': 'Gesamt', 'direkt-OP': 'direkt OP', 'nRCT': 'nRCT' };


                chartConfigs.forEach(chartConf => {
                    const cohortKeyFromId = Object.keys(cohortMap).find(key => chartConf.id.includes(key));
                    const kolId = cohortMap[cohortKeyFromId] || 'Gesamt';

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
                                const t2LabelText = `BF-T2 (${bfDef.metricName.substring(0,6)}.)`; // Metrikname ist nicht sprachabhängig
                                const chartOptions = {
                                    height: 250,
                                    margin: { top: 20, right: 20, bottom: 50, left: 50 },
                                    yAxisLabelKey: 'metricValue'
                                };
                                chartRenderer.renderComparisonBarChart(chartDataComp, chartId, chartOptions, t2LabelText);
                            } else {
                                ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">${_getText('publikationTab.publicationMisc.noValidData', lang)} (Chart: ${getKollektivDisplayName(kolId, lang)})</p>`);
                            }
                        } else {
                             ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">${_getText('publikationTab.publicationMisc.noData', lang)} (Chart: ${getKollektivDisplayName(kolId, lang)})</p>`);
                        }
                    } else if (chartElement) {
                         ui_helpers.updateElementHTML(chartId, `<p class="text-muted small text-center p-3">${_getText('publikationTab.publicationMisc.noData', lang)} (${getKollektivDisplayName(kolId, lang)})</p>`);
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
