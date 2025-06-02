const publicationTabLogic = (() => {
    let _mainAppInterface = null;
    let _globalRawData = [];
    let _currentKollektivGlobal = '';
    let _appliedT2CriteriaGlobal = null;
    let _appliedT2LogicGlobal = '';
    let _bruteForceResultsGlobal = null;
    let _publikationLang = 'de';
    let _publikationSection = 'methoden_studienanlage';
    let _publikationBruteForceMetric = 'Balanced Accuracy';
    let _isInitialized = false;
    let _isDataStale = true;
    let _publicationStats = null;

    function _getGlobalConfig(configKey) {
        if (_mainAppInterface && typeof _mainAppInterface.getStateSnapshot === 'function') {
            const snapshot = _mainAppInterface.getStateSnapshot();
            if (configKey === 'APP_CONFIG') return snapshot.appConfig;
            if (configKey === 'UI_TEXTS') return snapshot.uiTexts;
            if (configKey === 'TOOLTIP_CONTENT') return snapshot.tooltipContent;
            if (configKey === 'PUBLICATION_CONFIG') return snapshot.publicationConfig;
            return snapshot.appConfig;
        }
        if (configKey === 'APP_CONFIG') return typeof APP_CONFIG !== 'undefined' ? APP_CONFIG : {};
        if (configKey === 'UI_TEXTS') return typeof UI_TEXTS !== 'undefined' ? UI_TEXTS : {};
        if (configKey === 'TOOLTIP_CONTENT') return typeof TOOLTIP_CONTENT !== 'undefined' ? TOOLTIP_CONTENT : {};
        if (configKey === 'PUBLICATION_CONFIG') return typeof PUBLICATION_CONFIG !== 'undefined' ? PUBLICATION_CONFIG : {};
        return typeof APP_CONFIG !== 'undefined' ? APP_CONFIG : {};
    }

    function initialize(mainAppInterface) {
        if (_isInitialized) return;
        _mainAppInterface = mainAppInterface;
        _isInitialized = true;
    }

    function setDataStale() {
        _isDataStale = true;
        _publicationStats = null;
    }

    function isInitialized() {
        return _isInitialized;
    }

    function _getCommonDataForTextGenerator() {
        if (!_publicationStats || typeof state === 'undefined') {
            console.warn("publicationTabLogic._getCommonDataForTextGenerator: _publicationStats oder state nicht verfügbar.");
            return {};
        }
        const appConfig = _getGlobalConfig('APP_CONFIG');
        const publicationConfig = _getGlobalConfig('PUBLICATION_CONFIG');
        
        return {
            references: appConfig.REFERENCES_FOR_PUBLICATION,
            appVersion: appConfig.APP_VERSION,
            appName: appConfig.APP_NAME,
            significanceLevel: appConfig.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            bootstrapReplications: appConfig.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            appliedT2CriteriaGlobal: cloneDeep(_appliedT2CriteriaGlobal),
            appliedT2LogicGlobal: _appliedT2LogicGlobal,
            nGesamt: _publicationStats?.Gesamt?.deskriptiv?.anzahlPatienten,
            nDirektOP: _publicationStats?.['direkt OP']?.deskriptiv?.anzahlPatienten,
            nNRCT: _publicationStats?.nRCT?.deskriptiv?.anzahlPatienten,
            bruteForceMetricForPublication: _publikationBruteForceMetric,
            publicationConfig: publicationConfig
        };
    }

    function _initializeData() {
        if (!_isDataStale && _publicationStats && !_publicationStats.error) {
            return _publicationStats;
        }
        _isDataStale = true; 
        _publicationStats = null;

        try {
            if (typeof dataProcessor === 'undefined' || typeof statisticsService === 'undefined' || !_globalRawData) {
                throw new Error("Abhängigkeiten (dataProcessor, statisticsService) oder Rohdaten für _initializeData nicht verfügbar.");
            }
            const processedDataFull = dataProcessor.processRawData(cloneDeep(_globalRawData));
            if (!processedDataFull || !Array.isArray(processedDataFull) || processedDataFull.length === 0) {
                throw new Error("Keine verarbeiteten Patientendaten verfügbar für Publikationsstatistiken.");
            }

            const allStats = statisticsService.calculateAllStatsForPublication(
                processedDataFull,
                _appliedT2CriteriaGlobal,
                _appliedT2LogicGlobal,
                _bruteForceResultsGlobal,
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
        const tabPaneId = 'publikation-tab-pane';
        let tabPane = document.getElementById(tabPaneId);

        if (!tabPane) {
            console.error(`PublicationTabLogic: Tab-Pane '${tabPaneId}' nicht gefunden. Kann Tab nicht rendern.`);
            return;
        }
        
        const appConfig = _getGlobalConfig('APP_CONFIG');
        const publicationConfig = _getGlobalConfig('PUBLICATION_CONFIG');
        const uiTexts = _getGlobalConfig('UI_TEXTS');
        
        const sidebarId = 'publikation-sidebar-nav-container';
        const mainContentContainerId = appConfig?.TAB_CONTENT_AREAS?.['publikation-tab'] || 'publikation-main-content-container';
        const controlsId = 'publikation-controls-container';
        const contentAreaId = 'publikation-content-area';

        let sidebarArea = document.getElementById(sidebarId);
        let mainContentAreaContainer = document.getElementById(mainContentContainerId);
        let controlsArea;
        let mainContentArea;

        if (!sidebarArea || !mainContentAreaContainer) {
            console.warn("PublicationTabLogic: Grundstruktur (Sidebar oder Main-Content-Container) nicht im DOM gefunden. Erstelle sie neu innerhalb des Tab-Panes.");
            tabPane.innerHTML = `
                <div class="container-fluid mt-3">
                    <div class="row">
                        <div class="col-md-3" id="${sidebarId}"></div>
                        <div class="col-md-9" id="${mainContentContainerId}"></div>
                    </div>
                </div>`;
            sidebarArea = document.getElementById(sidebarId);
            mainContentAreaContainer = document.getElementById(mainContentContainerId);
        }
        
        if (mainContentAreaContainer) {
            controlsArea = document.getElementById(controlsId);
            mainContentArea = document.getElementById(contentAreaId);

            if (!controlsArea || !mainContentArea) {
                 console.warn("PublicationTabLogic: Controls- oder Content-Area nicht im Main-Content-Container gefunden. Erstelle sie neu.");
                 mainContentAreaContainer.innerHTML = `
                    <div class="d-flex justify-content-end align-items-center mb-2 p-2 border-bottom" id="${controlsId}"></div>
                    <div id="${contentAreaId}" class="p-3 publication-text-render-area"></div>`;
                 controlsArea = document.getElementById(controlsId);
                 mainContentArea = document.getElementById(contentAreaId);
            }
        }

        if (!sidebarArea || !mainContentAreaContainer || !controlsArea || !mainContentArea) {
            console.error("Ein oder mehrere Hauptcontainer/Steuerungselemente für den Publikationstab konnten auch nach Neuerstellung nicht gefunden/erstellt werden.");
            if (tabPane) tabPane.innerHTML = '<p class="text-danger p-3">Fehler: Kritisches Layout-Element für Publikationstab fehlt und konnte nicht wiederhergestellt werden.</p>';
            return;
        }
        
        controlsArea.innerHTML = ''; 
        sidebarArea.innerHTML = '';
        mainContentArea.innerHTML = '';


        if (typeof publicationTextGenerator === 'undefined' || typeof publicationRenderer === 'undefined') {
            mainContentArea.innerHTML = '<p class="text-danger p-3">Fehler: Notwendige Publikationsmodule (Generator oder Renderer) nicht geladen.</p>';
            return;
        }
        
        if (!_publicationStats || _publicationStats.error) {
            mainContentArea.innerHTML = `<div class="alert alert-danger m-3">Fehler beim Laden der Publikationsdaten: ${_publicationStats?.error || 'Unbekannter Fehler'}.</div>`;
            sidebarArea.innerHTML = '<p class="text-muted p-2 small">Daten nicht verfügbar.</p>';
            return;
        }

        const bfMetricOptionsHTML = publicationConfig.bruteForceMetricsForPublication.map(opt =>
            `<option value="${opt.value}" ${opt.value === _publikationBruteForceMetric ? 'selected' : ''}>${opt.label}</option>`
        ).join('');
        const langSwitchLabel = uiTexts?.publikationTab?.spracheSwitchLabel?.[_publikationLang] || (_publikationLang === 'en' ? 'English' : 'Deutsch');
        const copyButtonTooltip = _getGlobalConfig('TOOLTIP_CONTENT')?.publikationTabTooltips?.copyCurrentSectionMD?.description || "Kopiert den Markdown-Text der aktuellen Sektion.";

        controlsArea.innerHTML = `
            <div class="me-3">
               <label for="publikation-bf-metric-select" class="form-label form-label-sm mb-0 me-1">${uiTexts?.publikationTab?.bruteForceMetricSelectLabel || 'BF-Metrik (Ref.):'}</label>
               <select class="form-select form-select-sm d-inline-block" id="publikation-bf-metric-select" style="width: auto;" data-tippy-content="${_getGlobalConfig('TOOLTIP_CONTENT')?.publikationTabTooltips?.bruteForceMetricSelect?.description || 'Optimierungsmetrik für T2 (BF).'}">
                   ${bfMetricOptionsHTML}
               </select>
            </div>
            <div class="form-check form-switch" data-tippy-content="${_getGlobalConfig('TOOLTIP_CONTENT')?.publikationTabTooltips?.spracheSwitch?.description || 'Sprache wechseln.'}">
                <input class="form-check-input" type="checkbox" role="switch" id="publikation-sprache-switch" ${_publikationLang === 'en' ? 'checked' : ''}>
                <label class="form-check-label fw-bold" for="publikation-sprache-switch" id="publikation-sprache-label">${langSwitchLabel}</label>
            </div>
             <button class="btn btn-sm btn-outline-secondary ms-3" id="copy-current-publication-section-md" data-tippy-content="${copyButtonTooltip}">
                <i class="fas fa-copy me-1"></i> Akt. Sektion als MD
            </button>
        `;


        const tocItems = publicationTextGenerator.getTableOfContents(_publikationLang, _publicationStats);
        sidebarArea.innerHTML = publicationRenderer.renderSidebarNavigation(tocItems, _publikationSection, _publikationLang);

        const commonDataForGenerator = _getCommonDataForTextGenerator();
        const optionsForGenerator = { bruteForceMetric: _publikationBruteForceMetric };

        const sectionBaseHTML = publicationRenderer.renderContent(
            _publikationLang,
            _publikationSection,
            _publicationStats,
            commonDataForGenerator,
            optionsForGenerator
        );
        mainContentArea.innerHTML = sectionBaseHTML;

        const pubElementsConfig = publicationConfig.publicationElements;

        if (_publikationSection === 'methoden_t2_definition' && pubElementsConfig.methoden?.literaturT2KriterienTabelle) {
            const el = document.getElementById(pubElementsConfig.methoden.literaturT2KriterienTabelle.id);
            if (el && typeof publicationRenderer.renderLiteraturT2KriterienTabelle === 'function') {
                const title = _publikationLang === 'de' ? pubElementsConfig.methoden.literaturT2KriterienTabelle.titleDe : pubElementsConfig.methoden.literaturT2KriterienTabelle.titleEn;
                el.innerHTML = publicationRenderer.renderLiteraturT2KriterienTabelle(_publikationLang, commonDataForGenerator, pubElementsConfig.methoden.literaturT2KriterienTabelle.id, title);
            }
        } else if (_publikationSection === 'ergebnisse_patientencharakteristika' && pubElementsConfig.ergebnisse) {
            const tableConf = pubElementsConfig.ergebnisse.patientenCharakteristikaTabelle;
            const elTable = document.getElementById(tableConf.id);
            if (elTable && typeof publicationRenderer.renderPatientenCharakteristikaTabelle === 'function') {
                const titleTable = _publikationLang === 'de' ? tableConf.titleDe : tableConf.titleEn;
                elTable.innerHTML = publicationRenderer.renderPatientenCharakteristikaTabelle(_publicationStats, _publikationLang, commonDataForGenerator, tableConf.id, titleTable);
            }
            const chartDataGesamt = _publicationStats?.Gesamt?.deskriptiv;
            if (chartDataGesamt && typeof chart_renderer !== 'undefined') {
                const ageChartConf = pubElementsConfig.ergebnisse.alterVerteilungChart;
                const elChartAge = document.getElementById(ageChartConf.id);
                if(elChartAge && chart_renderer.renderAgeDistributionChart && chartDataGesamt.alterData && Array.isArray(chartDataGesamt.alterData) && chartDataGesamt.alterData.length > 0) {
                    const titleAge = _publikationLang === 'de' ? ageChartConf.titleDe : ageChartConf.titleEn;
                    chart_renderer.renderAgeDistributionChart(ageChartConf.id, chartDataGesamt.alterData, getKollektivDisplayName('Gesamt'), {title: titleAge, margin: {top: 50, right: 20, bottom: 50, left: 60}});
                } else if (elChartAge) { elChartAge.innerHTML = `<p class="text-muted small p-2">${_publikationLang === 'de' ? 'Keine Daten für Altersverteilung.' : 'No data for age distribution.'}</p>`;}
                
                const genderChartConf = pubElementsConfig.ergebnisse.geschlechtVerteilungChart;
                const elChartGender = document.getElementById(genderChartConf.id);
                if(elChartGender && chart_renderer.renderPieChart && chartDataGesamt.geschlecht) {
                    const titleGender = _publikationLang === 'de' ? genderChartConf.titleDe : genderChartConf.titleEn;
                    const genderDataForChart = [
                        { label: uiTexts.legendLabels.male, value: chartDataGesamt.geschlecht.m || 0, color: appConfig.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE},
                        { label: uiTexts.legendLabels.female, value: chartDataGesamt.geschlecht.f || 0, color: appConfig.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN },
                        { label: uiTexts.legendLabels.unknownGender || 'Unbekannt', value: chartDataGesamt.geschlecht.unbekannt || 0, color: '#cccccc' }
                    ].filter(d => d.value > 0);
                    if (genderDataForChart.length > 0) chart_renderer.renderPieChart(genderChartConf.id, genderDataForChart, {title: titleGender, showLegend: true, legendPosition: 'bottom', margin: {top: 50, right: 20, bottom: 50, left: 20}});
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
                        if (['Gesamt', 'direkt OP'].includes(kollektivId)) tableHTML += '<hr class="my-3"/>';
                    }
                });
                el.innerHTML = tableHTML || `<p class="text-muted">${_publikationLang==='de'?'Keine Daten für diese Tabelle.':'No data for this table.'}</p>`;
            }
        } else if (_publikationSection === 'ergebnisse_literatur_t2_performance' && pubElementsConfig.ergebnisse?.diagnostischeGueteLiteraturT2Tabelle) {
             const tableConf = pubElementsConfig.ergebnisse.diagnostischeGueteLiteraturT2Tabelle;
             const el = document.getElementById(tableConf.id);
             if(el && typeof publicationRenderer.renderDiagnostischeGueteTabelle === 'function' && typeof studyT2CriteriaManager !== 'undefined') {
                 let tableHTML = '';
                 publicationConfig.literatureCriteriaSets.forEach((studyConf, index, arr) => {
                     const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyConf.id);
                     if(studySet) {
                         const targetKollektiv = studySet.applicableKollektiv || 'Gesamt';
                         const stats = _publicationStats?.[targetKollektiv]?.gueteT2_literatur?.[studyConf.id];
                         if (stats) {
                              const kollektivDisplayName = getKollektivDisplayName(targetKollektiv);
                              const nPat = _publicationStats[targetKollektiv]?.deskriptiv?.anzahlPatienten || 'N/A';
                              const subTitle = `${_publikationLang === 'de' ? tableConf.titleDe : tableConf.titleEn} - ${studySet.name} (${kollektivDisplayName}, N=${nPat})`;
                              tableHTML += publicationRenderer.renderDiagnostischeGueteTabelle(stats, studySet.name, kollektivDisplayName, _publikationLang, `${tableConf.id}-${studyConf.id}`, subTitle);
                              if (index < arr.length - 1) tableHTML += '<hr class="my-3"/>';
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
                ['Gesamt', 'direkt OP', 'nRCT'].forEach((kId, index, arr) => {
                     const bfGueteKey = `gueteT2_bruteforce_metric_${_publikationBruteForceMetric.replace(/\s+/g, '_')}`;
                     const bfDefKey = `bruteforce_definition_metric_${_publikationBruteForceMetric.replace(/\s+/g, '_')}`;
                     const bfStats = _publicationStats?.[kId]?.[bfGueteKey];
                     const bfDef = _publicationStats?.[kId]?.[bfDefKey];
                     
                     if(bfStats && bfDef && bfDef.metricName === _publikationBruteForceMetric) {
                        const kollektivDisplayName = getKollektivDisplayName(kId);
                        const nPat = _publicationStats[kId]?.deskriptiv?.anzahlPatienten || 'N/A';
                        const subTitle = `${titleBase} - ${kollektivDisplayName} (N=${nPat})`;
                        const methodenName = _publikationLang==='de' ? `Optimierte T2 (für ${bfDef.metricName})` : `Optimized T2 (for ${bfDef.metricName})`;
                        tableHTML += publicationRenderer.renderDiagnostischeGueteTabelle(bfStats, methodenName, kollektivDisplayName, _publikationLang, `${tableConf.id}-${kId.replace(/\s+/g, '')}`, subTitle);
                        if (index < arr.length - 1) tableHTML += '<hr class="my-3"/>';
                     }
                });
                el.innerHTML = tableHTML || `<p class="text-muted">${_publikationLang==='de'?'Keine Daten für diese Tabelle (ggf. andere BF-Metrik ausgewählt als für die Optimierung verwendet wurde).':'No data for this table (possibly different BF metric selected than used for optimization).'}</p>`;
            }
        } else if (_publikationSection === 'ergebnisse_vergleich_performance' && pubElementsConfig.ergebnisse) {
            const tableConf = pubElementsConfig.ergebnisse.statistischerVergleichAST2Tabelle;
            const elTable = document.getElementById(tableConf.id);
            if (elTable && typeof publicationRenderer.renderStatistischerVergleichTabelle === 'function') {
                const titleTable = (_publikationLang === 'de' ? tableConf.titleDe : tableConf.titleEn).replace('{BF_METRIC}', _publikationBruteForceMetric);
                elTable.innerHTML = publicationRenderer.renderStatistischerVergleichTabelle(_publicationStats, commonDataForGenerator, _publikationLang, tableConf.id, titleTable, optionsForGenerator);
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
                    const bfGueteKeyCompare = `gueteT2_bruteforce_metric_${_publikationBruteForceMetric.replace(/\s+/g, '_')}`;
                    const bfDefKeyCompare = `bruteforce_definition_metric_${_publikationBruteForceMetric.replace(/\s+/g, '_')}`;
                    const statsBF = _publicationStats?.[item.id]?.[bfGueteKeyCompare];
                    const bfDef = _publicationStats?.[item.id]?.[bfDefKeyCompare];
                    const nPat = _publicationStats?.[item.id]?.deskriptiv?.anzahlPatienten || 'N/A';

                    if (elChart && statsAS && statsBF && bfDef && bfDef.metricName === _publikationBruteForceMetric) {
                        const chartTitle = (_publikationLang==='de' ? item.titleConf.titleDe : item.titleConf.titleEn)
                                            .replace(/\{BF_METRIC\}/g, _publikationBruteForceMetric)
                                            .replace(/\{Kollektiv\}/g, getKollektivDisplayName(item.id))
                                            .replace(/\[N_GESAMT\]|\[N_DIREKT_OP\]|\[N_NRCT\]/g, String(nPat));
                        const chartData = [
                            { group: uiTexts.statMetrics.sens.name || 'Sens.', AS: statsAS.sens, T2_Opt: statsBF.sens },
                            { group: uiTexts.statMetrics.spez.name || 'Spez.', AS: statsAS.spez, T2_Opt: statsBF.spez },
                            { group: uiTexts.statMetrics.ppv.name || 'PPV', AS: statsAS.ppv, T2_Opt: statsBF.ppv },
                            { group: uiTexts.statMetrics.npv.name || 'NPV', AS: statsAS.npv, T2_Opt: statsBF.npv },
                            { group: uiTexts.statMetrics.acc.name || 'Acc.', AS: statsAS.acc, T2_Opt: statsBF.acc },
                            { group: uiTexts.statMetrics.auc.name || 'AUC', AS: statsAS.auc, T2_Opt: statsBF.auc }
                        ];
                        const series = [
                            { name: uiTexts.legendLabels.avocadoSign || 'AS', key: 'AS', color: appConfig.CHART_SETTINGS.AS_COLOR, showCI: true },
                            { name: `T2 Opt. (${bfDef.metricName})`, key: 'T2_Opt', color: appConfig.CHART_SETTINGS.T2_COLOR, showCI: true }
                        ];
                         chart_renderer.renderComparisonBarChart(item.elId, chartData, series, { title: chartTitle, yAxisLabel: 'Wert', barType: 'grouped', groupKey: 'group', showLegend: true, legendPosition: 'bottom', includeCI: true, yDomain: [0,1], margin: {top: 60, right: 20, bottom: 70, left: 60} });
                    } else if(elChart) {
                         elChart.innerHTML = `<p class="text-center text-muted small mt-3 p-2 border rounded">${_publikationLang === 'de' ? 'Vergleichsdiagramm nicht verfügbar (fehlende Daten oder abweichende BF-Metrik).' : 'Comparison chart not available (missing data or differing BF metric).'}</p>`;
                    }
                });
            }
        } else if (_publikationSection === 'referenzen_liste' && pubElementsConfig.referenzen?.referenzenTabelle) {
             const tableConf = pubElementsConfig.referenzen.referenzenTabelle;
             const el = document.getElementById(tableConf.id);
             if (el && typeof publicationRenderer.renderReferenzenTabelle === 'function') {
                const title = _publikationLang === 'de' ? tableConf.titleDe : tableConf.titleEn;
                el.innerHTML = publicationRenderer.renderReferenzenTabelle(commonDataForGenerator.references, _publikationLang, tableConf.id, title);
            }
        }
        
        const uiHelpers = _mainAppInterface.getUiHelpers();
        if (uiHelpers) {
            uiHelpers.updatePublikationUI(_publikationLang, _publikationSection, _publikationBruteForceMetric);
            uiHelpers.initializeTooltips(tabPane); // Initialize tooltips for the entire tab pane
        }
        if (typeof publicationRenderer.attachPublicationTabEventListeners === 'function') {
            publicationRenderer.attachPublicationTabEventListeners(mainContentArea, _publicationStats, _publikationLang, _publikationSection, _publikationBruteForceMetric, commonDataForGenerator, optionsForGenerator);
        }
    }


    function initializeTab(data, currentKollektiv, appliedT2Criteria, appliedT2Logic, bruteForceResults, publikationLang, publikationSection, publikationBruteForceMetric) {
        if (!_mainAppInterface) {
            console.error("PublicationTabLogic: Hauptinterface nicht initialisiert.");
            return;
        }
        _globalRawData = cloneDeep(data);
        _currentKollektivGlobal = currentKollektiv;
        _appliedT2CriteriaGlobal = cloneDeep(appliedT2Criteria);
        _appliedT2LogicGlobal = appliedT2Logic;
        _bruteForceResultsGlobal = cloneDeep(bruteForceResults);
        _publikationLang = publikationLang;
        _publikationSection = publikationSection;
        _publikationBruteForceMetric = publikationBruteForceMetric;
        
        const publicationConfig = _getGlobalConfig('PUBLICATION_CONFIG');
        const mainSectionConfig = publicationConfig.sections.find(s => s.id === _publikationSection || (s.subSections && s.subSections.some(sub => sub.id === _publikationSection)));
        let effectiveSection = _publikationSection;

        if (mainSectionConfig && mainSectionConfig.subSections && mainSectionConfig.subSections.length > 0) {
            const isCurrentSectionAMainSection = mainSectionConfig.id === _publikationSection;
            if (isCurrentSectionAMainSection) { 
                effectiveSection = mainSectionConfig.subSections[0].id;
            }
        } else if (!mainSectionConfig && publicationConfig.sections.length > 0 && publicationConfig.sections[0].subSections && publicationConfig.sections[0].subSections.length > 0) {
            effectiveSection = publicationConfig.sections[0].subSections[0].id;
        } else if (!mainSectionConfig && publicationConfig.sections.length > 0) { // Fallback if section not found, go to first valid section
             effectiveSection = publicationConfig.sections[0].subSections ? publicationConfig.sections[0].subSections[0].id : publicationConfig.sections[0].id;
        }


        _publikationSection = effectiveSection; 
        
        if (typeof state !== 'undefined' && state.getCurrentPublikationSection() !== _publikationSection) {
            state.setCurrentPublikationSection(_publikationSection); // Update global state if effective section changed
        }

        setDataStale(); 
        _initializeData(); 
        _renderPublicationTabContent(); 
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
        getFullPublicationStats,
        _getCommonDataForTextGenerator 
    });
})();
