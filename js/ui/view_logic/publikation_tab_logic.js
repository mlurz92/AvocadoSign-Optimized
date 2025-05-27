const publikationTabLogic = (() => {

    let allKollektivStats = { isLoading: false, data: null, error: null, needsCalculation: true };
    let isCalculatingStats = false;
    let statsCalculationPromise = null;

    function initializeData(globalRawData, appliedCriteria, appliedLogic, bfResultsPerKollektiv) {
        // Berechnung wird nicht mehr hier direkt angestoßen.
        // Setzt nur den initialen Zustand, dass Berechnung notwendig ist.
        allKollektivStats = { isLoading: false, data: null, error: null, needsCalculation: true };
        isCalculatingStats = false;
        statsCalculationPromise = null;
        console.log("PublikationTabLogic: Initialisiert. Statistiken werden bei Bedarf berechnet.");
    }

    async function triggerStatsCalculation(globalRawData, appliedCriteria, appliedLogic, bfResultsPerKollektiv, callback) {
        if (isCalculatingStats && statsCalculationPromise) {
            console.log("PublikationTabLogic: Statistikberechnung läuft bereits oder ist geplant.");
            return statsCalculationPromise;
        }

        isCalculatingStats = true;
        allKollektivStats = { isLoading: true, data: null, error: null, needsCalculation: false };
        console.log("PublikationTabLogic: Starte Statistikberechnung für Publikationsdaten...");

        if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshCurrentTab === 'function' && state.getActiveTabId() === 'publikation-tab') {
             mainAppInterface.refreshCurrentTab();
        }

        statsCalculationPromise = new Promise((resolve) => {
            // Simuliert Asynchronität, aber die Berechnung selbst ist blockierend
            // Für eine echte nicht-blockierende UI müsste dies in einen Web Worker
            setTimeout(async () => {
                try {
                    if (!globalRawData || !appliedCriteria || !appliedLogic || typeof statisticsService === 'undefined') {
                        throw new Error("Unvollständige Basisdaten für Statistikberechnung.");
                    }
                    const calculatedStats = statisticsService.calculateAllStatsForPublication(
                        globalRawData,
                        appliedCriteria,
                        appliedLogic,
                        bfResultsPerKollektiv
                    );

                    if (!calculatedStats) {
                        throw new Error("calculateAllStatsForPublication lieferte null.");
                    }
                    allKollektivStats = { isLoading: false, data: calculatedStats, error: null, needsCalculation: false };
                    console.log("PublikationTabLogic: Statistikberechnung erfolgreich abgeschlossen.");
                    if (callback) callback(true, null);
                    resolve(true);
                } catch (error) {
                    console.error("PublikationTabLogic: Fehler bei der Berechnung der Publikationsstatistiken:", error);
                    allKollektivStats = { isLoading: false, data: null, error: error.message || "Unbekannter Fehler bei Statistikberechnung.", needsCalculation: true };
                    if (callback) callback(false, error.message);
                    resolve(false);
                } finally {
                    isCalculatingStats = false;
                    statsCalculationPromise = null;
                    if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshCurrentTab === 'function' && state.getActiveTabId() === 'publikation-tab') {
                         mainAppInterface.refreshCurrentTab();
                    }
                }
            }, 50); // Kurzer Timeout, um UI Updates (Ladeanzeige) zu ermöglichen, bevor die blockierende Berechnung startet
        });
        return statsCalculationPromise;
    }

    function ensureStatsAreCalculated(mainAppInterface, callback) {
        if (allKollektivStats.data && !allKollektivStats.needsCalculation) {
            if (callback) callback(true, null);
            return Promise.resolve(true);
        }
        if (isCalculatingStats) {
            if (callback) { // Wenn ein Callback da ist, warten bis Promise erfüllt ist
                return statsCalculationPromise.then(success => callback(success, allKollektivStats.error)).catch(err => callback(false, err.message));
            }
            return statsCalculationPromise || Promise.resolve(false); // Wenn kein Callback, nur das Promise zurückgeben
        }
        if (allKollektivStats.needsCalculation || allKollektivStats.error) { // Auch bei Fehler erneut versuchen
            if (typeof mainAppInterface.getRawData !== 'function') {
                 const errorMsg = "mainAppInterface.getRawData ist nicht verfügbar in ensureStatsAreCalculated.";
                 console.error(errorMsg);
                 allKollektivStats = { isLoading: false, data:null, error: errorMsg, needsCalculation: true};
                 if(callback) callback(false, errorMsg);
                 return Promise.resolve(false);
            }
            return triggerStatsCalculation(
                mainAppInterface.getRawData(),
                t2CriteriaManager.getAppliedCriteria(),
                t2CriteriaManager.getAppliedLogic(),
                bruteForceManager.getAllResults(),
                callback
            );
        }
        if (callback) callback(false, "Unbekannter Zustand in ensureStatsAreCalculated.");
        return Promise.resolve(false);
    }


    function getRenderedSectionContent(mainSectionId, lang, currentGlobalKollektivId, mainAppInterface) {
        if (allKollektivStats.isLoading) {
            return `<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade Statistikdaten für Publikation...</span></div><p class="mt-2 text-muted">Umfangreiche Statistiken werden berechnet...</p></div>`;
        }
        if (allKollektivStats.error) {
            return `<p class="text-danger p-3"><strong>Fehler beim Laden der Publikationsdaten:</strong> ${allKollektivStats.error}<br>Bitte versuchen Sie, die Statistiken erneut zu generieren.</p><div class="text-center p-3"><button class="btn btn-primary" id="btn-retry-pub-stats-calc">${lang === 'de' ? 'Statistiken erneut generieren' : 'Regenerate Statistics'}</button></div>`;
        }
        if (allKollektivStats.needsCalculation || !allKollektivStats.data) {
             return `<div class="alert alert-info text-center">
                        <p>${lang === 'de' ? 'Die statistischen Daten für den Publikationsentwurf wurden noch nicht generiert.' : 'Statistical data for the publication draft has not been generated yet.'}</p>
                        <button class="btn btn-primary" id="btn-generate-pub-stats">
                            <i class="fas fa-calculator me-1"></i> ${lang === 'de' ? 'Statistiken jetzt generieren' : 'Generate Statistics Now'}
                        </button>
                     </div>`;
        }

        const statsData = allKollektivStats.data;
        const commonDataForGenerator = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            nGesamt: statsData.Gesamt?.deskriptiv?.anzahlPatienten || 0,
            nDirektOP: statsData['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
            nNRCT: statsData.nRCT?.deskriptiv?.anzahlPatienten || 0,
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

        if (!publicationRenderer || typeof publicationRenderer.renderSectionContent !== 'function') {
            return '<p class="text-danger p-3"><strong>Fehler:</strong> Publikations-Renderer ist nicht verfügbar.</p>';
        }
        return publicationRenderer.renderSectionContent(mainSectionId, lang, statsData, commonDataForGenerator, optionsForRenderer);
    }

    function updateDynamicChartsForPublicationTab(mainSectionId, lang, currentKollektivNameForContextOnly) {
        if (!allKollektivStats || allKollektivStats.isLoading || allKollektivStats.error || !allKollektivStats.data || allKollektivStats.needsCalculation) {
            console.warn("PublikationTabLogic.updateDynamicCharts: Keine validen oder vollständigen Daten für Chart-Rendering.");
            return;
        }
        const statsData = allKollektivStats.data;
        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === mainSectionId);
        if (!mainSectionConfig || !mainSectionConfig.subSections) {
            return;
        }

        mainSectionConfig.subSections.forEach(subSection => {
            const subSectionId = subSection.id;
            if (subSectionId === 'ergebnisse_patientencharakteristika') {
                const dataForGesamtKollektiv = statsData['Gesamt'];
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
                    const dataForThisKollektiv = statsData[kolId];
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
                            chartDataComp.forEach(methodData => { entry[methodData.metric] = methodData[metricKey]; });
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
                        if (asStats) { rocDatasets.push({ name: UI_TEXTS.legendLabels.avocadoSign, points: statisticsService._getROCPointsFromStats(asStats), color: APP_CONFIG.CHART_SETTINGS.AS_COLOR, auc: asStats.auc?.value }); }
                        const bfStats = dataForThisKollektiv.gueteT2_bruteforce;
                        const bfDef = dataForThisKollektiv.bruteforce_definition;
                        if (bfStats && bfDef && bfDef.metricName === currentPubBfMetric) { rocDatasets.push({ name: `${lang === 'de' ? 'Opt. T2' : 'Opt. T2'} (${bfDef.metricName.substring(0,6)})`, points: statisticsService._getROCPointsFromStats(bfStats), color: APP_CONFIG.CHART_SETTINGS.T2_COLOR, auc: bfStats.auc?.value });}
                        PUBLICATION_CONFIG.literatureCriteriaSets.forEach((litConf, index) => {
                            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(litConf.id);
                             if (studySet && (studySet.applicableKollektiv === kolId || (studySet.applicableKollektiv === 'Gesamt' && kolId === 'Gesamt'))) {
                                const litStats = dataForThisKollektiv.gueteT2_literatur?.[litConf.id];
                                if (litStats) { rocDatasets.push({ name: studySet.displayShortName || litConf.id, points: statisticsService._getROCPointsFromStats(litStats), color: APP_CONFIG.CHART_SETTINGS.LITERATURE_SET_COLORS[index % APP_CONFIG.CHART_SETTINGS.LITERATURE_SET_COLORS.length], auc: litStats.auc?.value }); }
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
        updateDynamicChartsForPublicationTab,
        triggerStatsCalculation,
        ensureStatsAreCalculated,
        getAllKollektivStats: () => allKollektivStats // Für Testzwecke oder Export
    });

})();
