const publicationController = (() => {

    let allKollektivStats = null;
    let rawGlobalData = null;
    let appliedCriteria = null;
    let appliedLogic = null;
    let bfResults = null;

    function initialize(globalRawData, criteria, logic, bruteForceResults) {
        rawGlobalData = globalRawData;
        appliedCriteria = criteria;
        appliedLogic = logic;
        bfResults = bruteForceResults;
        try {
            allKollektivStats = statisticsService.calculateAllStatsForPublication(
                rawGlobalData,
                appliedCriteria,
                appliedLogic,
                bfResults
            );
        } catch (error) {
            allKollektivStats = null;
        }
    }

    function _getCommonDataForGenerator() {
        return {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            nGesamt: allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 0,
            nDirektOP: allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
            nNRCT: allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 0,
            bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION,
            rawData: rawGlobalData
        };
    }

    function renderPublicationTab() {
        const lang = state.getCurrentPublikationLang();
        const section = state.getCurrentPublikationSection();
        const bfMetric = state.getCurrentPublikationBruteForceMetric();

        if (!allKollektivStats) {
            ui_helpers.updateElementHTML('publikation-tab-pane', '<div class="alert alert-danger m-3">Fehler: Statistische Daten konnten nicht initialisiert werden.</div>');
            return;
        }

        const headerHTML = uiComponents.createPublikationTabHeader();
        ui_helpers.updateElementHTML('publikation-tab-pane', headerHTML);
        
        const contentHTML = publicationRenderer.renderSectionContent(section, lang, allKollektivStats, _getCommonDataForGenerator(), { bruteForceMetric: bfMetric });
        const contentArea = document.getElementById('publikation-content-area');
        if (contentArea) {
            contentArea.innerHTML = contentHTML;
        }

        setTimeout(() => {
            _updateDynamicContent(section, lang, bfMetric);
            ui_helpers.updatePublikationUI(lang, section, bfMetric);
            ui_helpers.initializeTooltips(document.getElementById('publikation-tab-pane'));
        }, 50);
    }

    function _updateDynamicContent(section, lang, bfMetric) {
        _renderDynamicCharts(section, lang);
        _runAndRenderHealthCheck(section, lang, bfMetric);
    }

    function _renderDynamicCharts(mainSectionId, lang) {
        if (!allKollektivStats) return;
        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === mainSectionId);
        if (!mainSectionConfig?.subSections) return;

        mainSectionConfig.subSections.forEach(subSection => {
            if (subSection.id === 'ergebnisse_patientencharakteristika') {
                const gesamtStats = allKollektivStats['Gesamt']?.deskriptiv;
                if (gesamtStats) {
                    const ageChartArea = document.getElementById('pub-figure-results-1a-alter-verteilung-chart-area');
                    const genderChartArea = document.getElementById('pub-figure-results-1b-geschlecht-verteilung-chart-area');
                    if(ageChartArea) chartRenderer.renderAgeDistributionChart(gesamtStats.alterData, ageChartArea.id, {}, lang);
                    if(genderChartArea) {
                        const genderDataForChart = Object.entries(gesamtStats.geschlecht).map(([key, value]) => ({ label: UI_TEXTS.legendLabels[key === 'm' ? 'male' : 'female'], value: value }));
                        chartRenderer.renderPieChart(genderDataForChart, genderChartArea.id, {innerRadiusFactor: 0}, lang);
                    }
                }
            } else if (subSection.id === 'ergebnisse_vergleich_as_vs_t2') {
                ['Gesamt', 'direkt OP', 'nRCT'].forEach(kolId => {
                    const chartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse[`vergleichPerformanceChart${kolId.replace(/\s+/g, '')}`];
                    const chartArea = document.getElementById(`${chartConfig.id}-chart-area`);
                    if (chartArea) {
                        const asStats = allKollektivStats[kolId]?.gueteAS;
                        const bfStats = allKollektivStats[kolId]?.gueteT2_bruteforce;
                        if (asStats && bfStats) {
                            const chartData = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'].map(m => ({
                                metric: m.toUpperCase(),
                                AS: asStats[m]?.value ?? NaN,
                                T2: bfStats[m]?.value ?? NaN
                            })).filter(d => !isNaN(d.AS) && !isNaN(d.T2));
                            const t2Label = `BF-T2`;
                            chartRenderer.renderComparisonBarChart(chartData, chartArea.id, {}, t2Label);
                        }
                    }
                });
            }
        });
    }

    function _runAndRenderHealthCheck(sectionId, lang, bfMetric) {
        let healthCheckContainer = document.getElementById('manuscript-health-check-container');
        if (!healthCheckContainer) {
            healthCheckContainer = document.createElement('div');
            healthCheckContainer.id = 'manuscript-health-check-container';
            healthCheckContainer.className = 'mt-4';
            const navColumn = document.querySelector('#publikation-tab-pane .col-md-3');
            if (navColumn) navColumn.appendChild(healthCheckContainer);
        }
        
        const commonData = _getCommonDataForGenerator();
        commonData.bruteForceMetricForPublication = bfMetric;
        const issues = manuscriptHealthCheck.performCheck(sectionId, lang, allKollektivStats, commonData);
        const resultsHTML = manuscriptHealthCheck.renderHealthCheckResults(issues);
        ui_helpers.updateElementHTML('manuscript-health-check-container', resultsHTML);
    }
    
    return Object.freeze({
        initialize,
        renderPublicationTab
    });

})();
