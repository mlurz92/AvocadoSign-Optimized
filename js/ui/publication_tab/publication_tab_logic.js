const publicationTabLogic = (() => {
    let _mainAppInterface = null;
    let _globalRawData = [];
    let _currentKollektivGlobal = '';
    let _appliedT2CriteriaGlobal = null;
    let _appliedT2LogicGlobal = '';
    let _bruteForceResults = null;
    let _publikationLang = 'de';
    let _publikationSection = 'methoden_studienanlage';
    let _publikationBruteForceMetric = 'Balanced Accuracy';
    let _isInitialized = false;
    let _isDataStale = true;
    let _publicationStats = null;

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
    }

    function setDataStale() {
        _isDataStale = true;
        _publicationStats = null;
    }

    function isInitialized() {
        return _isInitialized;
    }

    function _getCommonDataForTextGenerator() {
        if (!_publicationStats || typeof state === 'undefined' || typeof APP_CONFIG === 'undefined' || typeof PUBLICATION_CONFIG === 'undefined') {
            return {};
        }
        return {
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION,
            appVersion: APP_CONFIG.APP_VERSION,
            appName: APP_CONFIG.APP_NAME,
            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            appliedT2CriteriaGlobal: cloneDeep(_appliedT2CriteriaGlobal),
            appliedT2LogicGlobal: _appliedT2LogicGlobal,
            nGesamt: _publicationStats?.Gesamt?.deskriptiv?.anzahlPatienten,
            nDirektOP: _publicationStats?.['direkt OP']?.deskriptiv?.anzahlPatienten,
            nNRCT: _publicationStats?.nRCT?.deskriptiv?.anzahlPatienten,
            bruteForceMetricForPublication: _publikationBruteForceMetric
        };
    }

    function _initializeData() {
        if (!_isDataStale && _publicationStats && !_publicationStats.error) {
            return _publicationStats;
        }
        _isDataStale = true;
        _publicationStats = null;

        try {
            if (typeof dataProcessor === 'undefined' || typeof statisticsService === 'undefined') {
                throw new Error("Abhängigkeiten (dataProcessor, statisticsService) für _initializeData nicht verfügbar.");
            }
            const processedDataFull = dataProcessor.processRawData(cloneDeep(_globalRawData));
            if (!processedDataFull || !Array.isArray(processedDataFull) || processedDataFull.length === 0) {
                throw new Error("Keine verarbeiteten Patientendaten verfügbar für Publikationsstatistiken.");
            }

            const allStats = statisticsService.calculateAllStatsForPublication(
                processedDataFull,
                _appliedT2CriteriaGlobal,
                _appliedT2LogicGlobal,
                _bruteForceResults,
                _publikationBruteForceMetric
            );

            if (!allStats) {
                throw new Error("Fehler bei der Berechnung der umfassenden Statistiken für die Publikation.");
            }
            _publicationStats = allStats;
            _isDataStale = false;

        } catch (error) {
            console.error("Fehler bei der Berechnung der Statistikdaten für den Publikationstab:", error);
            _publicationStats = { error: error.message, details: {} };
            _isDataStale = false;
        }
        return _publicationStats;
    }


    function _renderPublicationTabContent() {
        const tabContentPane = document.getElementById('publikation-tab-pane');
        const mainContentArea = document.getElementById('publikation-content-area');
        const sidebarArea = document.getElementById('publikation-sidebar-nav-container');

        if (!tabContentPane || !mainContentArea || !sidebarArea) {
            console.error("Ein oder mehrere Hauptcontainer für den Publikationstab nicht gefunden.");
            if (tabContentPane) tabContentPane.innerHTML = '<p class="text-danger p-3">Fehler: Haupt-Layout-Elemente für Publikationstab fehlen.</p>';
            return;
        }

        if (!_publicationStats || _publicationStats.error) {
            mainContentArea.innerHTML = `<div class="alert alert-danger m-3">Fehler beim Laden der Publikationsdaten: ${_publicationStats?.error || 'Unbekannter Fehler'}. Bitte überprüfen Sie die Browser-Konsole für Details.</div>`;
            sidebarArea.innerHTML = '<p class="text-muted p-2 small">Daten nicht verfügbar.</p>';
            return;
        }

        if (typeof publicationTextGenerator === 'undefined' || typeof publicationRenderer === 'undefined') {
            mainContentArea.innerHTML = '<p class="text-danger p-3">Fehler: Notwendige Publikationsmodule (Generator oder Renderer) nicht geladen.</p>';
            return;
        }

        const tocItems = publicationTextGenerator.getTableOfContents(_publikationLang, _publicationStats);
        sidebarArea.innerHTML = publicationRenderer.renderSidebarNavigation(tocItems, _publikationSection, _publikationLang);

        const commonDataForRenderer = _getCommonDataForTextGenerator();
        const optionsForRenderer = { bruteForceMetric: _publikationBruteForceMetric };

        const sectionBaseHTML = publicationRenderer.renderContent(
            _publikationLang,
            _publikationSection,
            _publicationStats,
            commonDataForRenderer,
            optionsForRenderer
        );
        mainContentArea.innerHTML = sectionBaseHTML;

        const pubElementsConfig = PUBLICATION_CONFIG.publicationElements;

        if (_publikationSection === 'methoden_t2_definition' && pubElementsConfig.methoden?.literaturT2KriterienTabelle) {
            const el = document.getElementById(pubElementsConfig.methoden.literaturT2KriterienTabelle.id);
            if (el && typeof publicationRenderer.renderLiteraturT2KriterienTabelle === 'function') {
                const title = _publikationLang === 'de' ? pubElementsConfig.methoden.literaturT2KriterienTabelle.titleDe : pubElementsConfig.methoden.literaturT2KriterienTabelle.titleEn;
                el.innerHTML = publicationRenderer.renderLiteraturT2KriterienTabelle(_publikationLang, commonDataForRenderer, pubElementsConfig.methoden.literaturT2KriterienTabelle.id, title);
            }
        } else if (_publikationSection === 'ergebnisse_patientencharakteristika' && pubElementsConfig.ergebnisse) {
            const tableConf = pubElementsConfig.ergebnisse.patientenCharakteristikaTabelle;
            const elTable = document.getElementById(tableConf.id);
            if (elTable && typeof publicationRenderer.renderPatientenCharakteristikaTabelle === 'function') {
                const titleTable = _publikationLang === 'de' ? tableConf.titleDe : tableConf.titleEn;
                elTable.innerHTML = publicationRenderer.renderPatientenCharakteristikaTabelle(_publicationStats, _publikationLang, commonDataForRenderer, tableConf.id, titleTable);
            }
            const chartDataGesamt = _publicationStats?.Gesamt?.deskriptiv;
            if (chartDataGesamt && typeof chart_renderer !== 'undefined') {
                const ageChartConf = pubElementsConfig.ergebnisse.alterVerteilungChart;
                const elChartAge = document.getElementById(ageChartConf.id);
                if(elChartAge && chart_renderer.renderAgeDistributionChart && chartDataGesamt.alterData && Array.isArray(chartDataGesamt.alterData) && chartDataGesamt.alterData.length > 0) {
                    const titleAge = _publikationLang === 'de' ? ageChartConf.titleDe : ageChartConf.titleEn;
                    chart_renderer.renderAgeDistributionChart(elChartAge.id, chartDataGesamt.alterData, getKollektivDisplayName('Gesamt'), {title: titleAge});
                } else if (elChartAge) { elChartAge.innerHTML = `<p class="text-muted small p-2">${_publikationLang === 'de' ? 'Keine Daten für Altersverteilung.' : 'No data for age distribution.'}</p>`;}
                
                const genderChartConf = pubElementsConfig.ergebnisse.geschlechtVerteilungChart;
                const elChartGender = document.getElementById(genderChartConf.id);
                if(elChartGender && chart_renderer.renderPieChart && chartDataGesamt.geschlecht) {
                    const titleGender = _publikationLang === 'de' ? genderChartConf.titleDe : genderChartConf.titleEn;
                    const genderDataForChart = [
                        { label: UI_TEXTS.legendLabels.male, value: chartDataGesamt.geschlecht.m || 0, color: APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE},
                        { label: UI_TEXTS.legendLabels.female, value: chartDataGesamt.geschlecht.f || 0, color: APP_CONFIG.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN },
                        { label: UI_TEXTS.legendLabels.unknownGender || 'Unbekannt', value: chartDataGesamt.geschlecht.unbekannt || 0, color: '#cccccc' }
                    ].filter(d => d.value > 0);
                    if (genderDataForChart.length > 0) chart_renderer.renderPieChart(elChartGender.id, genderDataForChart, {title: titleGender, showLegend: true, legendPosition: 'bottom'});
                    else if(elChartGender) { elChartGender.innerHTML = `<p class="text-muted small p-2">${_publikationLang === 'de' ? 'Keine Daten für Geschlechtsverteilung.' : 'No data for gender distribution.'}</p>`;}
                } else if (elChartGender) { elChartGender.innerHTML = `<p class="text-muted small p-2">${_publikationLang === 'de' ? 'Keine Daten für Geschlechtsverteilung.' : 'No data for gender distribution.'}</p>`;}
            }
        } else if (_publikationSection === 'ergebnisse_as_performance' && pubElementsConfig.ergebnisse?.diagnostischeGueteASTabelle) {
            const tableConf = pubElementsConfig.ergebnisse.diagnostischeGueteASTabelle;
            const el = document.getElementById(tableConf.id);
            if (el && typeof publicationRenderer.renderDiagnostischeGueteTabelle === 'function') {
                const titleBase = _publikationLang === 'de' ? tableConf.titleDe : tableConf.titleEn;
                let tableHTML = '';
                ['Gesamt', 'direkt OP', 'nRCT'].forEach(kollektivId => {
                    if (_publicationStats?.[kollektivId]?.gueteAS) {
                        const kollektivDisplayName = getKollektivDisplayName(kollektivId);
                        const nPat = _publicationStats[kollektivId].deskriptiv?.anzahlPatienten || 'N/A';
                        const subTitle = `${titleBase} - ${kollektivDisplayName} (N=${nPat})`;
                        tableHTML += publicationRenderer.renderDiagnostischeGueteTabelle(_publicationStats[kollektivId].gueteAS, 'Avocado Sign', kollektivDisplayName, _publikationLang, `${tableConf.id}-${kollektivId.replace(/\s+/g, '')}`, subTitle);
                        tableHTML += '<hr class="my-3"/>';
                    }
                });
                el.innerHTML = tableHTML || `<p class="text-muted">${_publikationLang==='de'?'Keine Daten für diese Tabelle.':'No data for this table.'}</p>`;
            }
        } else if (_publikationSection === 'ergebnisse_literatur_t2_performance' && pubElementsConfig.ergebnisse?.diagnostischeGueteLiteraturT2Tabelle) {
             const tableConf = pubElementsConfig.ergebnisse.diagnostischeGueteLiteraturT2Tabelle;
             const el = document.getElementById(tableConf.id);
             if(el && typeof publicationRenderer.renderDiagnostischeGueteTabelle === 'function' && typeof studyT2CriteriaManager !== 'undefined') {
                 let tableHTML = '';
                 PUBLICATION_CONFIG.literatureCriteriaSets.forEach(studyConf => {
                     const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyConf.id);
                     if(studySet) {
                         const targetKollektiv = studySet.applicableKollektiv || 'Gesamt';
                         const stats = _publicationStats?.[targetKollektiv]?.gueteT2_literatur?.[studyConf.id];
                         if (stats) {
                              const kollektivDisplayName = getKollektivDisplayName(targetKollektiv);
                              const nPat = _publicationStats[targetKollektiv]?.deskriptiv?.anzahlPatienten || 'N/A';
                              const subTitle = `${_publikationLang === 'de' ? tableConf.titleDe : tableConf.titleEn} - ${studySet.name} (${kollektivDisplayName}, N=${nPat})`;
                              tableHTML += publicationRenderer.renderDiagnostischeGueteTabelle(stats, studySet.name, kollektivDisplayName, _publikationLang, `${tableConf.id}-${studyConf.id}`, subTitle);
                              tableHTML += '<hr class="my-3"/>';
                         }
                     }
                 });
                 el.innerHTML = tableHTML || `<p class="text-muted">${_publikationLang==='de'?'Keine Daten für diese Tabelle.':'No data for this table.'}</p>`;
             }
        } else if (_publikationSection === 'ergebnisse_optimierte_t2_performance' && pubElementsConfig.ergebnisse?.diagnostischeGueteOptimierteT2Tabelle) {
            const tableConf = pubElementsConfig.ergebnisse.diagnostischeGueteOptimierteT2Tabelle;
            const el = document.getElementById(tableConf.id);
            if(el && typeof publicationRenderer.renderDiagnostischeGueteTabelle === 'function') {
                let tableHTML = '';
                const titleBase = (_publikationLang === 'de' ? tableConf.titleDe : tableConf.titleEn).replace('{BF_METRIC}', _publikationBruteForceMetric);
                ['Gesamt', 'direkt OP', 'nRCT'].forEach(kId => {
                     const bfStats = _publicationStats?.[kId]?.gueteT2_bruteforce;
                     const bfDef = _publicationStats?.[kId]?.bruteforce_definition;
                     if(bfStats && bfDef && bfDef.metricName === _publikationBruteForceMetric) {
                        const kollektivDisplayName = getKollektivDisplayName(kId);
                        const nPat = _publicationStats[kId]?.deskriptiv?.anzahlPatienten || 'N/A';
                        const subTitle = `${titleBase} - ${kollektivDisplayName} (N=${nPat})`;
                        const methodenName = _publikationLang==='de' ? `Optimierte T2 (für ${bfDef.metricName})` : `Optimized T2 (for ${bfDef.metricName})`;
                        tableHTML += publicationRenderer.renderDiagnostischeGueteTabelle(bfStats, methodenName, kollektivDisplayName, _publikationLang, `${tableConf.id}-${kId.replace(/\s+/g, '')}`, subTitle);
                        tableHTML += '<hr class="my-3"/>';
                     }
                });
                el.innerHTML = tableHTML || `<p class="text-muted">${_publikationLang==='de'?'Keine Daten für diese Tabelle (ggf. andere BF-Metrik ausgewählt als für die Optimierung verwendet wurde).':'No data for this table (possibly different BF metric selected than used for optimization).'}</p>`;
            }
        } else if (_publikationSection === 'ergebnisse_vergleich_performance' && pubElementsConfig.ergebnisse) {
            const tableConf = pubElementsConfig.ergebnisse.statistischerVergleichAST2Tabelle;
            const elTable = document.getElementById(tableConf.id);
            if (elTable && typeof publicationRenderer.renderStatistischerVergleichTabelle === 'function') {
                const titleTable = (_publikationLang === 'de' ? tableConf.titleDe : tableConf.titleEn).replace('{BF_METRIC}', _publikationBruteForceMetric);
                elTable.innerHTML = publicationRenderer.renderStatistischerVergleichTabelle(_publicationStats, commonDataForRenderer, _publikationLang, tableConf.id, titleTable, optionsForRenderer);
            }
            const chartKollektiveConfigs = [
                { id: 'Gesamt', elId: pubElementsConfig.ergebnisse.vergleichPerformanceChartGesamt.id, titleConf: pubElementsConfig.ergebnisse.vergleichPerformanceChartGesamt },
                { id: 'direkt OP', elId: pubElementsConfig.ergebnisse.vergleichPerformanceChartDirektOP.id, titleConf: pubElementsConfig.ergebnisse.vergleichPerformanceChartDirektOP },
                { id: 'nRCT', elId: pubElementsConfig.ergebnisse.vergleichPerformanceChartNRCT.id, titleConf: pubElementsConfig.ergebnisse.vergleichPerformanceChartNRCT }
            ];
            if (typeof chart_renderer !== 'undefined') {
                chartKollektiveConfigs.forEach(item => {
                    const elChart = document.getElementById(item.elId);
                    const statsAS = _publicationStats?.[item.id]?.gueteAS;
                    const statsBF = _publicationStats?.[item.id]?.gueteT2_bruteforce;
                    const bfDef = _publicationStats?.[item.id]?.bruteforce_definition;
                    const nPat = _publicationStats?.[item.id]?.deskriptiv?.anzahlPatienten || 'N/A';

                    if (elChart && statsAS && statsBF && bfDef && bfDef.metricName === _publikationBruteForceMetric) {
                        const chartTitle = (_publikationLang==='de' ? item.titleConf.titleDe : item.titleConf.titleEn)
                                            .replace('{BF_METRIC}', _publikationBruteForceMetric)
                                            .replace('{Kollektiv}', getKollektivDisplayName(item.id))
                                            .replace(/\[N_GESAMT\]/g, String(nPat)).replace(/\[N_DIREKT_OP\]/g, String(nPat)).replace(/\[N_NRCT\]/g, String(nPat));
                        const chartData = [
                            { group: UI_TEXTS.statMetrics.sens.name || 'Sens.', AS: statsAS.sens, T2_Opt: statsBF.sens },
                            { group: UI_TEXTS.statMetrics.spez.name || 'Spez.', AS: statsAS.spez, T2_Opt: statsBF.spez },
                            { group: UI_TEXTS.statMetrics.ppv.name || 'PPV', AS: statsAS.ppv, T2_Opt: statsBF.ppv },
                            { group: UI_TEXTS.statMetrics.npv.name || 'NPV', AS: statsAS.npv, T2_Opt: statsBF.npv },
                            { group: UI_TEXTS.statMetrics.acc.name || 'Acc.', AS: statsAS.acc, T2_Opt: statsBF.acc },
                            { group: UI_TEXTS.statMetrics.auc.name || 'AUC', AS: statsAS.auc, T2_Opt: statsBF.auc }
                        ];
                        const series = [
                            { name: 'AS', key: 'AS', color: APP_CONFIG.CHART_SETTINGS.AS_COLOR, showCI: true },
                            { name: `T2 Opt. (${bfDef.metricName})`, key: 'T2_Opt', color: APP_CONFIG.CHART_SETTINGS.T2_COLOR, showCI: true }
                        ];
                         chart_renderer.renderComparisonBarChart(item.elId, chartData, series, { title: chartTitle, yAxisLabel: 'Wert', barType: 'grouped', groupKey: 'group', showLegend: true, includeCI: true, yDomain: [0,1] });
                    } else if(elChart) {
                         elChart.innerHTML = `<p class="text-center text-muted small mt-3">${_publikationLang === 'de' ? 'Vergleichsdiagramm nicht verfügbar (fehlende Daten oder abweichende BF-Metrik).' : 'Comparison chart not available (missing data or differing BF metric).'}</p>`;
                    }
                });
            }
        }
        
        if (typeof ui_helpers !== 'undefined') {
            ui_helpers.updatePublikationUI(_publikationLang, _publikationSection, _publikationBruteForceMetric, _bruteForceResults);
            ui_helpers.initializeTooltips(tabContentPane);
        }
        if (typeof publicationRenderer.attachPublicationTabEventListeners === 'function') {
            publicationRenderer.attachPublicationTabEventListeners(mainContentArea, _publicationStats, _publikationLang, _publikationSection, _publikationBruteForceMetric);
        }
    }


    function initializeTab(data, currentKollektiv, appliedT2Criteria, appliedT2Logic, bruteForceResults, publikationLang, publikationSection, publikationBruteForceMetric) {
        _globalRawData = data;
        _currentKollektivGlobal = currentKollektiv;
        _appliedT2CriteriaGlobal = appliedT2Criteria;
        _appliedT2LogicGlobal = appliedT2Logic;
        _bruteForceResults = bruteForceResults;
        _publikationLang = publikationLang;
        _publikationSection = publikationSection;
        _publikationBruteForceMetric = publikationBruteForceMetric;
        
        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === _publikationSection || (s.subSections && s.subSections.some(sub => sub.id === _publikationSection)));
        let effectiveSection = _publikationSection;

        if (mainSectionConfig && mainSectionConfig.subSections && mainSectionConfig.subSections.length > 0) {
            const isCurrentSectionASubSection = mainSectionConfig.subSections.some(sub => sub.id === _publikationSection);
            if (!isCurrentSectionASubSection) { // If _publikationSection is a main category, pick its first subSection
                effectiveSection = mainSectionConfig.subSections[0].id;
            }
        } else if (!mainSectionConfig && PUBLICATION_CONFIG.sections.length > 0 && PUBLICATION_CONFIG.sections[0].subSections.length > 0) {
            // Fallback if _publikationSection is completely invalid
            effectiveSection = PUBLICATION_CONFIG.sections[0].subSections[0].id;
        }
        _publikationSection = effectiveSection; // Update internal state if changed
        if (typeof state !== 'undefined' && state.getCurrentPublikationSection() !== _publikationSection) {
            state.setCurrentPublikationSection(_publikationSection); // Update global state and save
        }


        setDataStale(); 
        _initializeData(); 
        _renderPublicationTabContent(); 

        _isInitialized = true;
    }

    function getFullPublicationStats() {
        if (_isDataStale || !_publicationStats || _publicationStats.error) {
            _initializeData();
        }
        return cloneDeep(_publicationStats);
    }


    return Object.freeze({
        initialize,
        initializeTab,
        isInitialized,
        setDataStale,
        getFullPublicationStats 
    });
})();
