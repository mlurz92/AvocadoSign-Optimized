const publikationTabLogic = (() => {

    let allKollektivStats = null;
    let rawGlobalDataInputForLogic = null;
    let appliedCriteriaForLogic = null;
    let appliedLogicForLogic = null;
    let bfResultsPerKollektivForLogic = null;
    let citationManagerInitialized = false;

    function initializeData(globalRawData, appliedCriteria, appliedLogic, bfResultsPerKollektiv) {
        rawGlobalDataInputForLogic = globalRawData;
        appliedCriteriaForLogic = appliedCriteria;
        appliedLogicForLogic = appliedLogic;
        bfResultsPerKollektivForLogic = bfResultsPerKollektiv;

        if (typeof citationManager !== 'undefined' && !citationManagerInitialized) {
            citationManager.init();
            citationManagerInitialized = true;
        }

        try {
            if (typeof statisticsService !== 'undefined' && typeof statisticsService.calculateAllStatsForPublication === 'function') {
                allKollektivStats = statisticsService.calculateAllStatsForPublication(
                    rawGlobalDataInputForLogic,
                    appliedCriteriaForLogic,
                    appliedLogicForLogic,
                    bfResultsPerKollektivForLogic
                );
            } else {
                throw new Error("statisticsService.calculateAllStatsForPublication ist nicht verfügbar.");
            }
        } catch (error) {
            console.error("Fehler bei der Berechnung der Publikationsstatistiken:", error);
            allKollektivStats = null;
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showToast === 'function') {
                ui_helpers.showToast("Fehler bei der Vorbereitung der Publikationsdaten.", "danger");
            }
        }
    }

    function getRenderedSectionContent(mainSectionId, lang, currentKollektivId) {
        if (typeof citationManager !== 'undefined') {
            citationManager.reset();
        } else {
            console.warn("citationManager in getRenderedSectionContent nicht verfügbar.");
        }

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
            nGesamt: allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 0,
            nDirektOP: allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
            nNRCT: allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 0,
            references: APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES,
            studyPeriod: APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES?.LURZ_SCHAEFER_2025?.studyPeriod || "January 2020 and November 2023",
            mrtSystem: APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES?.LURZ_SCHAEFER_2025?.mrtSystem || "3.0-T MRI system (MAGNETOM Prisma Fit, Siemens Healthineers, Erlangen, Germany)",
            contrastAgent: APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES?.LURZ_SCHAEFER_2025?.contrastAgent || "gadoteridol (ProHance, Bracco Imaging, Milan, Italy)"
        };

        const optionsForRenderer = {
            currentKollektiv: currentKollektivId,
            bruteForceMetric: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication,
            lang: lang
        };
        
        if (typeof publicationRenderer !== 'undefined' && typeof publicationTextGenerator !== 'undefined') {
            return publicationRenderer.renderSectionContent(mainSectionId, lang, allKollektivStats, commonDataForGenerator, optionsForRenderer);
        } else {
            return '<p class="text-danger">Fehler: Publikations-Renderer oder Textgenerator nicht verfügbar.</p>';
        }
    }

    function updateDynamicChartsForPublicationTab(mainSectionId, lang, currentKollektivIdForContext) {
        if (!allKollektivStats || typeof chart_renderer === 'undefined') {
            console.warn("Keine Daten oder Chart-Renderer für Chart-Rendering im Publikationstab vorhanden.");
            return;
        }

        const chartOptionsBase = { styleProfile: 'radiology', lang: lang };
        const pubElements = PUBLICATION_CONFIG.publicationElements;

        const renderChartIfExists = (elementId, renderFunction, dataExtractor, chartSpecificOptions = {}) => {
            const chartElement = document.getElementById(elementId);
            if (chartElement) {
                try {
                    const dataForChart = dataExtractor();
                    if (dataForChart === null || (Array.isArray(dataForChart) && dataForChart.length === 0)) {
                        ui_helpers.updateElementHTML(elementId, `<p class="text-muted small text-center p-2">Keine Daten für dieses Diagramm verfügbar (${elementId}).</p>`);
                    } else {
                        renderFunction(elementId, dataForChart, { ...chartOptionsBase, ...chartSpecificOptions });
                    }
                } catch (error) {
                    console.error(`Fehler beim Rendern von Diagramm ${elementId}:`, error);
                    ui_helpers.updateElementHTML(elementId, `<p class="text-danger small text-center p-2">Fehler beim Laden des Diagramms ${elementId}.</p>`);
                }
            }
        };

        if (mainSectionId === 'ergebnisse') {
            // Patientencharakteristika Charts
            renderChartIfExists(
                pubElements.ergebnisse.patientenCharakteristikaAbbildungen.alterVerteilungChart.id,
                chart_renderer.renderAgeDistributionChart,
                () => allKollektivStats?.Gesamt?.deskriptiv?.alterData || [],
                { height: 250, margin: { bottom: 50, left: 50 } }
            );
            renderChartIfExists(
                pubElements.ergebnisse.patientenCharakteristikaAbbildungen.geschlechtVerteilungChart.id,
                chart_renderer.renderPieChart,
                () => {
                    const genderData = allKollektivStats?.Gesamt?.deskriptiv?.geschlecht;
                    if (!genderData) return null;
                    return [
                        { label: UI_TEXTS.legendLabels.male, value: genderData.m ?? 0 },
                        { label: UI_TEXTS.legendLabels.female, value: genderData.f ?? 0 },
                        ...(genderData.unbekannt > 0 ? [{ label: UI_TEXTS.legendLabels.unknownGender, value: genderData.unbekannt }] : [])
                    ];
                },
                { height: 250, legendBelow: true, innerRadiusFactor: 0 }
            );

            // ROC Kurven - Platzhalter oder sehr simple Darstellung, da statistics_service keine ROC-Daten liefert
            const rocKollektive = ['Gesamt', 'direkt OP', 'nRCT'];
            const rocMethoden = [
                { key: 'as', name: 'Avocado Sign' },
                { key: 't2bf', name: `Optimierte T2 (${state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication})` },
                // Hier müssten die Literatur-T2-Methoden spezifisch pro Kollektiv definiert werden.
            ];
            
            Object.values(pubElements.ergebnisse.rocKurven).forEach(rocConfig => {
                if(typeof rocConfig === 'object' && rocConfig.id){
                    const chartElement = document.getElementById(rocConfig.id);
                    if (chartElement) {
                         // Simplifizierte Darstellung eines einzelnen Punktes (Sens, 1-Spez)
                        let kollektivIdForRoc = 'Gesamt';
                        let methodKeyForRoc = 'as'; // Default
                        if (rocConfig.id.includes('_as_')) methodKeyForRoc = 'as';
                        else if (rocConfig.id.includes('_t2bf_')) methodKeyForRoc = 't2bf'; // 't2bf' ist kein direkter Key in allKollektivStats.guete...
                        // Add more specific parsing logic if needed based on ID pattern

                        if (rocConfig.id.includes('_direktop')) kollektivIdForRoc = 'direkt OP';
                        else if (rocConfig.id.includes('_nrct')) kollektivIdForRoc = 'nRCT';
                        else if (rocConfig.id.includes('_gesamt')) kollektivIdForRoc = 'Gesamt';

                        let performanceData;
                        if(methodKeyForRoc === 'as') performanceData = allKollektivStats?.[kollektivIdForRoc]?.gueteAS;
                        else if (methodKeyForRoc === 't2bf') performanceData = allKollektivStats?.[kollektivIdForRoc]?.gueteT2_bruteforce;
                        // TODO: Add logic for literature T2 ROC points if needed

                        if (performanceData && performanceData.sens && performanceData.spez) {
                            const rocPointData = [{
                                fpr: 1 - (performanceData.spez.value || 0),
                                tpr: performanceData.sens.value || 0,
                                threshold: undefined // No specific threshold for single point
                            }];
                             chart_renderer.renderROCCurve(rocPointData, rocConfig.id, {
                                ...chartOptionsBase,
                                height: 280,
                                margin: { top: 20, right: 20, bottom: 50, left: 60 },
                                aucValue: performanceData.auc?.value, // Pass AUC if available
                                aucCI: performanceData.auc?.ci,
                                showPoints: true // Show the single operating point
                            });
                        } else {
                             ui_helpers.updateElementHTML(rocConfig.id, `<p class="text-muted small text-center p-2">ROC-Daten für ${rocConfig.titleDe || rocConfig.id} nicht verfügbar.</p>`);
                        }
                    }
                }
            });


            // Vergleichs-Balkendiagramme (AS vs. Optimierte T2)
            ['Gesamt', 'direkt OP', 'nRCT'].forEach(kolId => {
                const chartConfig = pubElements.ergebnisse.vergleichsBalkendiagramme[kolId.toLowerCase().replace(' ', '')];
                if (!chartConfig) return;

                renderChartIfExists(
                    chartConfig.id,
                    chart_renderer.renderComparisonBarChart,
                    () => {
                        const asStats = allKollektivStats?.[kolId]?.gueteAS;
                        const bfStats = allKollektivStats?.[kolId]?.gueteT2_bruteforce;
                        if (!asStats || !bfStats) return null;
                        return ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'].map(m => ({
                            metric: m.toUpperCase().replace('BALACC', 'BalAcc').replace('ACC', 'Acc'),
                            AS: asStats[m]?.value ?? NaN,
                            T2: bfStats[m]?.value ?? NaN,
                        })).filter(d => !isNaN(d.AS) && !isNaN(d.T2));
                    },
                    { height: 280, margin: { top: 20, right: 20, bottom: 60, left: 50 }, t2Label: `Opt. T2 (${(allKollektivStats?.[kolId]?.bruteforce_definition?.metricName || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication).substring(0,6)}.)` }
                );
            });
            
            // Forest Plots - Beispiel für Sensitivität und Spezifität im Gesamtkollektiv
            const forestPlotConfigSensSpez = pubElements.ergebnisse.forestPlotsPerformance?.gesamt_sens_spez;
            if (forestPlotConfigSensSpez && document.getElementById(forestPlotConfigSensSpez.id)) {
                const forestData = [];
                const gesamtStats = allKollektivStats?.Gesamt;
                if (gesamtStats) {
                    if (gesamtStats.gueteAS?.sens) forestData.push({ label: "AS Sens.", pointEstimate: gesamtStats.gueteAS.sens.value, ciLower: gesamtStats.gueteAS.sens.ci?.lower, ciUpper: gesamtStats.gueteAS.sens.ci?.upper });
                    if (gesamtStats.gueteAS?.spez) forestData.push({ label: "AS Spez.", pointEstimate: gesamtStats.gueteAS.spez.value, ciLower: gesamtStats.gueteAS.spez.ci?.lower, ciUpper: gesamtStats.gueteAS.spez.ci?.upper });

                    const bfDefGesamt = gesamtStats.bruteforce_definition;
                    if (gesamtStats.gueteT2_bruteforce?.sens && bfDefGesamt) forestData.push({ label: `Opt.T2 (${bfDefGesamt.metricName.substring(0,6)}.) Sens.`, pointEstimate: gesamtStats.gueteT2_bruteforce.sens.value, ciLower: gesamtStats.gueteT2_bruteforce.sens.ci?.lower, ciUpper: gesamtStats.gueteT2_bruteforce.sens.ci?.upper });
                    if (gesamtStats.gueteT2_bruteforce?.spez && bfDefGesamt) forestData.push({ label: `Opt.T2 (${bfDefGesamt.metricName.substring(0,6)}.) Spez.`, pointEstimate: gesamtStats.gueteT2_bruteforce.spez.value, ciLower: gesamtStats.gueteT2_bruteforce.spez.ci?.lower, ciUpper: gesamtStats.gueteT2_bruteforce.spez.ci?.upper });
                    
                    // Beispiel Literatur Koh
                     const kohData = gesamtStats.gueteT2_literatur?.['koh_2008_morphology'];
                     if(kohData?.sens) forestData.push({ label: `Koh et al. Sens.`, pointEstimate: kohData.sens.value, ciLower: kohData.sens.ci?.lower, ciUpper: kohData.sens.ci?.upper });
                     if(kohData?.spez) forestData.push({ label: `Koh et al. Spez.`, pointEstimate: kohData.spez.value, ciLower: kohData.spez.ci?.lower, ciUpper: kohData.spez.ci?.upper });
                }

                if (forestData.length > 0) {
                    renderChartIfExists(
                        forestPlotConfigSensSpez.id,
                        chart_renderer.renderForestPlot,
                        () => forestData,
                        { height: Math.max(200, forestData.length * 40 + 80), xAxisLabel: "Wert (95% KI)", xScaleType: 'linear', margin: {left: 150, bottom: 50, top: 30} }
                    );
                } else {
                     ui_helpers.updateElementHTML(forestPlotConfigSensSpez.id, `<p class="text-muted small text-center p-2">Keine Daten für Forest Plot (${forestPlotConfigSensSpez.id}).</p>`);
                }
            }


        }
    }

    return Object.freeze({
        initializeData,
        getRenderedSectionContent,
        updateDynamicChartsForPublicationTab
    });

})();
