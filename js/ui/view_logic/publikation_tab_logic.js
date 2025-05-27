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
            if (!globalRawData || !appliedCriteria || !appliedLogic || typeof statisticsService === 'undefined') {
                console.error("PublikationTabLogic.initializeData: Unvollständige Basisdaten für Statistikberechnung.");
                allKollektivStats = null;
                ui_helpers.showToast("Fehler: Unvollständige Daten für Publikations-Tab-Vorbereitung.", "danger");
                return;
            }
            allKollektivStats = statisticsService.calculateAllStatsForPublication(
                rawGlobalDataInputForLogic,
                appliedCriteriaForLogic,
                appliedLogicForLogic,
                bfResultsPerKollektivForLogic
            );
            if (!allKollektivStats) {
                 console.warn("PublikationTabLogic.initializeData: calculateAllStatsForPublication lieferte null.");
                 ui_helpers.showToast("Warnung: Statistiken für Publikation-Tab konnten nicht vollständig berechnet werden.", "warning");
            }
        } catch (error) {
            console.error("PublikationTabLogic.initializeData: Fehler bei der Berechnung der Publikationsstatistiken:", error);
            allKollektivStats = null;
            ui_helpers.showToast("Schwerwiegender Fehler bei der Vorbereitung der Publikationsdaten.", "danger");
        }
    }

    function getRenderedSectionContent(mainSectionId, lang, currentGlobalKollektivId) {
        if (!allKollektivStats) {
            console.error("PublikationTabLogic.getRenderedSectionContent: allKollektivStats ist nicht initialisiert. Dies sollte in main.js erfolgen. Zeige Fehlermeldung an.");
            return '<p class="text-danger"><strong>Fehler:</strong> Die statistischen Grunddaten für den Publikations-Tab konnten nicht geladen werden. Bitte überprüfen Sie die Konsolenausgabe auf Fehler während der Initialisierung und versuchen Sie ggf. die Seite neu zu laden oder wenden Sie sich an den Support.</p>';
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
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {
                lurzSchaefer2025: "Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025. DOI: 10.1007/s00330-025-11462-y",
                koh2008: "Koh DM, et al. Int J Radiat Oncol Biol Phys. 2008;71(2):456-461",
                barbaro2024: "Barbaro B, et al. Radiother Oncol. 2024;193:110124",
                rutegard2025: "Rutegård MK, et al. Eur Radiol. 2025. DOI: 10.1007/s00330-025-11361-2",
                beetsTan2018ESGAR: "Beets-Tan RGH, et al. Eur Radiol. 2018;28(4):1465-1475",
                zhuang2021: "Zhuang Z, et al. Front Oncol. 2021;11:709070",
                alSukhni2012: "Al-Sukhni E, et al. Ann Surg Oncol. 2012;19(7):2212-2223",
                ethicsVote: "Ethikvotum Nr. 2023-101, Ethikkommission der Sächsischen Landesärztekammer"
            },
            bruteForceMetricForPublication: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
        };

        const optionsForRenderer = {
            currentKollektiv: currentGlobalKollektivId,
            bruteForceMetric: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
        };

        return publicationRenderer.renderSectionContent(mainSectionId, lang, allKollektivStats, commonDataForGenerator, optionsForRenderer);
    }

    function _getROCPointsFromStats(statsObj) {
        if (!statsObj || isNaN(statsObj.sens?.value) || isNaN(statsObj.spez?.value)) {
            return [{fpr:0, tpr:0}, {fpr:1, tpr:1}];
        }
        const sens = statsObj.sens.value;
        const spez = statsObj.spez.value;
        return [
            { fpr: 0, tpr: 0 },
            { fpr: 1 - spez, tpr: sens },
            { fpr: 1, tpr: 1 }
        ];
    }

    function updateDynamicChartsForPublicationTab(mainSectionId, lang, currentKollektivNameForContextOnly) {
        if (!allKollektivStats) {
            console.warn("PublikationTabLogic.updateDynamicCharts: Keine Daten für Chart-Rendering im Publikationstab vorhanden (allKollektivStats ist null). Diagramme können nicht aktualisiert werden.");
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
                    const alterChartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart;
                    const genderChartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart;
                    const alterChartId = `${alterChartConfig.idPrefix || alterChartConfig.id}-Gesamt`;
                    const genderChartId = `${genderChartConfig.idPrefix || genderChartConfig.id}-Gesamt`;

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
                const currentPubBfMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

                kollektiveForCharts.forEach(kolId => {
                    const dataForThisKollektiv = allKollektivStats[kolId];
                    if (!dataForThisKollektiv) return;

                    const balkenChartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceBalkenChart;
                    const balkenChartId = `${balkenChartConfig.idPrefix}-${kolId.replace(/\s+/g, '_')}`;
                    const balkenChartElement = document.getElementById(balkenChartId);

                    if (balkenChartElement) {
                        const asStats = dataForThisKollektiv.gueteAS;
                        const bfStats = dataForThisKollektiv.gueteT2_bruteforce;
                        const bfDef = dataForThisKollektiv.bruteforce_definition;
                        
                        let chartDataComp = [];
                        if (asStats) chartDataComp.push({metric: 'AS', ...Object.fromEntries(['Sens', 'Spez', 'PPV', 'NPV', 'Acc', 'AUC'].map(m => [m, asStats[m.toLowerCase()]?.value ?? NaN])) });
                        if (bfStats && bfDef && bfDef.metricName === currentPubBfMetric) {
                            chartDataComp.push({metric: `Opt. T2 (${bfDef.metricName.substring(0,6)})`, ...Object.fromEntries(['Sens', 'Spez', 'PPV', 'NPV', 'Acc', 'AUC'].map(m => [m, bfStats[m.toLowerCase()]?.value ?? NaN])) });
                        }
                        
                        const firstLitSetConf = PUBLICATION_CONFIG.literatureCriteriaSets.find(lc => {
                            const s = studyT2CriteriaManager.getStudyCriteriaSetById(lc.id);
                            return s && (s.applicableKollektiv === kolId || (s.applicableKollektiv === 'Gesamt' && kolId === 'Gesamt'));
                        });
                        if (firstLitSetConf) {
                            const litStats = dataForThisKollektiv.gueteT2_literatur?.[firstLitSetConf.id];
                            if(litStats) chartDataComp.push({metric: studyT2CriteriaManager.getStudyCriteriaSetById(firstLitSetConf.id)?.displayShortName || firstLitSetConf.id, ...Object.fromEntries(['Sens', 'Spez', 'PPV', 'NPV', 'Acc', 'AUC'].map(m => [m, litStats[m.toLowerCase()]?.value ?? NaN])) });
                        }

                        const metricsToDisplay = ['Sens', 'Spez', 'PPV', 'NPV', 'Acc', 'AUC'];
                        const transformedChartData = metricsToDisplay.map(metricKey => {
                            const entry = { metric: metricKey };
                            chartDataComp.forEach(methodData => {
                                entry[methodData.metric] = methodData[metricKey];
                            });
                            return entry;
                        }).filter(d => Object.values(d).some(val => typeof val === 'number' && !isNaN(val)));


                        if (transformedChartData.length > 0 && chartDataComp.length > 0) {
                            const t2LabelForChart = chartDataComp.length > 1 ? chartDataComp[1].metric : 'T2';
                            chartRenderer.renderComparisonBarChart(transformedChartData, balkenChartId, { height: 280, margin: { top: 20, right: 20, bottom: 60, left: 50 } }, t2LabelForChart);
                        } else {
                            ui_helpers.updateElementHTML(balkenChartId, `<p class="text-muted small text-center p-3">${lang === 'de' ? `Keine/unvollständige Daten für Vergleichs-Balkendiagramm (${getKollektivDisplayName(kolId)}).` : `No/incomplete data for comparison bar chart (${getKollektivDisplayName(kolId)}).`}</p>`);
                        }
                    }

                    const rocChartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichROCChart;
                    const rocChartId = `${rocChartConfig.idPrefix}-${kolId.replace(/\s+/g, '_')}`;
                    const rocChartElement = document.getElementById(rocChartId);

                    if (rocChartElement) {
                        const rocDatasets = [];
                        const asStats = dataForThisKollektiv.gueteAS;
                        if (asStats) {
                            rocDatasets.push({
                                name: UI_TEXTS.legendLabels.avocadoSign,
                                points: _getROCPointsFromStats(asStats),
                                color: APP_CONFIG.CHART_SETTINGS.AS_COLOR,
                                auc: asStats.auc?.value
                            });
                        }

                        const bfStats = dataForThisKollektiv.gueteT2_bruteforce;
                        const bfDef = dataForThisKollektiv.bruteforce_definition;
                        if (bfStats && bfDef && bfDef.metricName === currentPubBfMetric) {
                             rocDatasets.push({
                                name: `${lang === 'de' ? 'Opt. T2' : 'Opt. T2'} (${bfDef.metricName.substring(0,6)})`,
                                points: _getROCPointsFromStats(bfStats),
                                color: APP_CONFIG.CHART_SETTINGS.T2_COLOR,
                                auc: bfStats.auc?.value
                            });
                        }
                        
                        PUBLICATION_CONFIG.literatureCriteriaSets.forEach((litConf, index) => {
                            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(litConf.id);
                             if (studySet && (studySet.applicableKollektiv === kolId || (studySet.applicableKollektiv === 'Gesamt' && kolId === 'Gesamt'))) {
                                const litStats = dataForThisKollektiv.gueteT2_literatur?.[litConf.id];
                                if (litStats) {
                                    rocDatasets.push({
                                        name: studySet.displayShortName || litConf.id,
                                        points: _getROCPointsFromStats(litStats),
                                        color: APP_CONFIG.CHART_SETTINGS.LITERATURE_SET_COLORS[index % APP_CONFIG.CHART_SETTINGS.LITERATURE_SET_COLORS.length],
                                        auc: litStats.auc?.value
                                    });
                                }
                            }
                        });

                        if (rocDatasets.length > 0) {
                            chartRenderer.renderComparisonROCCurve(rocDatasets, rocChartId, { height: 300, margin: { top: 20, right: 20, bottom: 70, left: 60 }, showPointsOnComparison: false, legendColumns: 2 });
                        } else {
                            ui_helpers.updateElementHTML(rocChartId, `<p class="text-muted small text-center p-3">${lang === 'de' ? `Keine Daten für ROC-Vergleich (${getKollektivDisplayName(kolId)}).` : `No data for ROC comparison (${getKollektivDisplayName(kolId)}).`}</p>`);
                        }
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
