const publicationController = (() => {
    let mainAppInterfaceInstance;
    let currentAllKollektivStats;
    let currentRawGlobalData;
    let currentAppliedCriteria;
    let currentAppliedLogic;
    let currentBruteForceResults;

    function _getCommonDataForGenerator() {
        const lang = stateManager.getCurrentPublikationLang();
        return {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            nGesamt: currentAllKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 0,
            nDirektOP: currentAllKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
            nNRCT: currentAllKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 0,
            t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
            t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
            bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION,
            bruteForceMetricForPublication: stateManager.getCurrentPublikationBruteForceMetric(),
            rawData: currentRawGlobalData,
            currentKollektivName: getKollektivDisplayName(stateManager.getCurrentKollektiv()),
            lang: lang
        };
    }

    function _renderFullPublicationTab() {
        const lang = stateManager.getCurrentPublikationLang();
        const sectionId = stateManager.getCurrentPublikationSection();
        const commonData = _getCommonDataForGenerator();

        const tabPane = document.getElementById('publikation-tab-pane');
        if (tabPane && typeof publicationViewRenderer !== 'undefined' && typeof publicationViewRenderer.renderPublikationTabHTML === 'function') {
            tabPane.innerHTML = publicationViewRenderer.renderPublikationTabHTML(
                sectionId,
                lang,
                currentAllKollektivStats,
                commonData
            );
            _triggerDynamicChartRendering(sectionId, lang, commonData.currentKollektivName);
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.initializeTooltips === 'function') {
                ui_helpers.initializeTooltips(tabPane);
            }
             if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.updatePublikationUI === 'function') {
                 ui_helpers.updatePublikationUI(lang, sectionId, commonData.bruteForceMetricForPublication);
             }
        } else {
            console.error("Fehler beim Rendern des Publikation-Tabs: Renderer oder Tab-Pane nicht gefunden.");
            if(tabPane) tabPane.innerHTML = '<p class="text-danger p-3">Fehler beim Laden des Publikation-Tabs.</p>';
        }
    }

    function _triggerDynamicChartRendering(mainSectionId, lang, currentKollektivNameForContextOnly) {
        if (typeof chartRenderer === 'undefined' || typeof PUBLICATION_CONFIG === 'undefined' || !currentAllKollektivStats) {
            console.warn("Chart Renderer, PUBLICATION_CONFIG oder Statistikdaten nicht verfügbar für dynamische Charts.");
            return;
        }

        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === mainSectionId);
        if (!mainSectionConfig || !mainSectionConfig.subSections) {
            return;
        }

        mainSectionConfig.subSections.forEach(subSection => {
            const subSectionId = subSection.id;

            if (subSectionId === 'ergebnisse_patientencharakteristika') {
                const dataForGesamtKollektiv = currentAllKollektivStats?.Gesamt;
                if (dataForGesamtKollektiv?.deskriptiv) {
                    const ageChartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart;
                    const genderChartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart;
                    const ageChartElementArea = document.getElementById(`${ageChartConfig.id}-chart-area`);
                    if (ageChartElementArea) {
                        if (dataForGesamtKollektiv.deskriptiv.alterData && dataForGesamtKollektiv.deskriptiv.alterData.length > 0) {
                            chartRenderer.renderAgeDistributionChart(dataForGesamtKollektiv.deskriptiv.alterData, `${ageChartConfig.id}-chart-area`, { height: 280, margin: { top: 20, right: 20, bottom: 60, left: 50 } });
                        } else {
                             ui_helpers.updateElementHTML(`${ageChartConfig.id}-chart-area`, `<p class="text-muted small text-center p-3">${lang === 'de' ? 'Keine Daten für Altersverteilung.' : 'No data for age distribution.'}</p>`);
                        }
                    }

                    const genderChartElementArea = document.getElementById(`${genderChartConfig.id}-chart-area`);
                     if (genderChartElementArea && dataForGesamtKollektiv.deskriptiv.geschlecht) {
                        const genderDataToRender = [
                            { label: UI_TEXTS.legendLabels.male, value: dataForGesamtKollektiv.deskriptiv.geschlecht.m ?? 0 },
                            { label: UI_TEXTS.legendLabels.female, value: dataForGesamtKollektiv.deskriptiv.geschlecht.f ?? 0 }
                        ];
                        if (dataForGesamtKollektiv.deskriptiv.geschlecht.unbekannt > 0) {
                            genderDataToRender.push({ label: UI_TEXTS.legendLabels.unknownGender, value: dataForGesamtKollektiv.deskriptiv.geschlecht.unbekannt });
                        }
                        if (genderDataToRender.some(d => d.value > 0)) {
                            chartRenderer.renderPieChart(genderDataToRender, `${genderChartConfig.id}-chart-area`, { height: 280, margin: { top: 20, right: 20, bottom: 60, left: 20 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderDataToRender.length });
                        } else {
                             ui_helpers.updateElementHTML(`${genderChartConfig.id}-chart-area`, `<p class="text-muted small text-center p-3">${lang === 'de' ? 'Keine Daten für Geschlechterverteilung.' : 'No data for gender distribution.'}</p>`);
                        }
                    } else if (genderChartElementArea) {
                         ui_helpers.updateElementHTML(`${genderChartConfig.id}-chart-area`, `<p class="text-muted small text-center p-3">${lang === 'de' ? 'Keine Daten für Geschlechterverteilung.' : 'No data for gender distribution.'}</p>`);
                    }
                }
            } else if (subSectionId === 'ergebnisse_vergleich_as_vs_t2') {
                const kollektiveForCharts = ['Gesamt', 'direkt OP', 'nRCT'];
                const bfMetric = stateManager.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
                 const pubErgebnisseConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse;
                 const chartElementsConfig = [
                    pubErgebnisseConfig.vergleichPerformanceChartGesamt,
                    pubErgebnisseConfig.vergleichPerformanceChartdirektOP,
                    pubErgebnisseConfig.vergleichPerformanceChartnRCT
                 ];

                kollektiveForCharts.forEach((kolId, index) => {
                    const chartConfig = chartElementsConfig[index];
                    if (!chartConfig || !chartConfig.id) return;
                    
                    const chartElementArea = document.getElementById(`${chartConfig.id}-chart-area`);
                    const statsForThisKollektiv = currentAllKollektivStats?.[kolId];

                    if (chartElementArea && statsForThisKollektiv) {
                        const asStats = statsForThisKollektiv.gueteAS;
                        const bfStatsForChart = statsForThisKollektiv.gueteT2_bruteforce;
                        const bfDefForChart = statsForThisKollektiv.bruteforce_definition;
                        const nPatForChart = statsForThisKollektiv.deskriptiv?.anzahlPatienten;

                        if (asStats && bfStatsForChart && bfDefForChart) {
                            const chartDataComp = [
                                { metric: 'Sens', AS: asStats.sens?.value ?? NaN, T2: bfStatsForChart.sens?.value ?? NaN },
                                { metric: 'Spez', AS: asStats.spez?.value ?? NaN, T2: bfStatsForChart.spez?.value ?? NaN },
                                { metric: 'PPV', AS: asStats.ppv?.value ?? NaN, T2: bfStatsForChart.ppv?.value ?? NaN },
                                { metric: 'NPV', AS: asStats.npv?.value ?? NaN, T2: bfStatsForChart.npv?.value ?? NaN },
                                { metric: 'Acc', AS: asStats.acc?.value ?? NaN, T2: bfStatsForChart.acc?.value ?? NaN },
                                { metric: 'AUC', AS: asStats.auc?.value ?? NaN, T2: bfStatsForChart.auc?.value ?? NaN }
                            ].filter(d => typeof d.AS === 'number' && !isNaN(d.AS) && typeof d.T2 === 'number' && !isNaN(d.T2));

                            if (chartDataComp.length > 0) {
                                const t2Label = `BF-T2 (${(bfDefForChart.metricName || bfMetric).substring(0,6)}.)`;
                                chartRenderer.renderComparisonBarChart(chartDataComp, `${chartConfig.id}-chart-area`, { height: 300, margin: { top: 25, right: 25, bottom: 70, left: 55 }, bfMetricName: bfDefForChart.metricName, nPat: nPatForChart }, t2Label);
                            } else {
                                ui_helpers.updateElementHTML(`${chartConfig.id}-chart-area`, `<p class="text-muted small text-center p-3">${lang === 'de' ? 'Keine validen Daten für Vergleichschart' : 'No valid data for comparison chart'} (${getKollektivDisplayName(kolId)}).</p>`);
                            }
                        } else {
                            ui_helpers.updateElementHTML(`${chartConfig.id}-chart-area`, `<p class="text-muted small text-center p-3">${lang === 'de' ? 'Unvollständige Daten für Vergleichschart' : 'Incomplete data for comparison chart'} (${getKollektivDisplayName(kolId)}).</p>`);
                        }
                    } else if (chartElementArea) {
                         ui_helpers.updateElementHTML(`${chartConfig.id}-chart-area`, `<p class="text-muted small text-center p-3">${lang === 'de' ? 'Keine Daten für' : 'No data for'} ${getKollektivDisplayName(kolId)}.</p>`);
                    }
                });
            }
        });
    }

    function initializeController(appInterface, allStats, rawData, appliedCriteria, appliedLogic, bfResults) {
        mainAppInterfaceInstance = appInterface;
        currentAllKollektivStats = allStats;
        currentRawGlobalData = rawData;
        currentAppliedCriteria = appliedCriteria;
        currentAppliedLogic = appliedLogic;
        currentBruteForceResults = bfResults;
        _renderFullPublicationTab();
    }

    function handleLanguageChange(newLang) {
        if (typeof stateManager !== 'undefined' && stateManager.setCurrentPublikationLang(newLang)) {
            _renderFullPublicationTab();
            if (mainAppInterfaceInstance && typeof mainAppInterfaceInstance.updateGlobalUIState === 'function') {
                mainAppInterfaceInstance.updateGlobalUIState();
            }
        }
    }

    function handleSectionChange(newSectionId) {
        if (typeof stateManager !== 'undefined' && stateManager.setCurrentPublikationSection(newSectionId)) {
            _renderFullPublicationTab();
             if (mainAppInterfaceInstance && typeof mainAppInterfaceInstance.updateGlobalUIState === 'function') {
                mainAppInterfaceInstance.updateGlobalUIState();
            }
            const contentArea = document.getElementById('publication-content-area');
            if (contentArea) {
                contentArea.scrollTop = 0;
            }
        }
    }

    function handleBfMetricChange(newMetric) {
        if (typeof stateManager !== 'undefined' && stateManager.setCurrentPublikationBruteForceMetric(newMetric)) {
            if (typeof statisticsService !== 'undefined' && typeof dataProcessor !== 'undefined' && typeof t2CriteriaManager !== 'undefined' && typeof bruteForceManager !== 'undefined' && currentRawGlobalData) {
                 currentAllKollektivStats = statisticsService.calculateAllStatsForPublication(
                    currentRawGlobalData,
                    currentAppliedCriteria,
                    currentAppliedLogic,
                    currentBruteForceResults
                );
            } else {
                console.warn("Abhängigkeiten für Neuberechnung der Statistiken nach BF-Metrik-Änderung fehlen.");
            }
            _renderFullPublicationTab();
            if (mainAppInterfaceInstance && typeof mainAppInterfaceInstance.updateGlobalUIState === 'function') {
                mainAppInterfaceInstance.updateGlobalUIState();
            }
        }
    }

    function refreshControllerWithNewData(allStats, rawData, appliedCriteria, appliedLogic, bfResults) {
        currentAllKollektivStats = allStats;
        currentRawGlobalData = rawData;
        currentAppliedCriteria = appliedCriteria;
        currentAppliedLogic = appliedLogic;
        currentBruteForceResults = bfResults;
        _renderFullPublicationTab();
    }

    return Object.freeze({
        initialize: initializeController,
        handleLanguageChange,
        handleSectionChange,
        handleBfMetricChange,
        refreshWithNewData
    });
})();
