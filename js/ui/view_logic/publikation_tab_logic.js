const publikationTabLogic = (() => {
    const TAB_ID = 'publikation-tab-pane';
    let currentLanguage = APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG;
    let currentSection = APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION;
    let currentBruteForceMetric = APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC;
    let allKollektivStats = null;
    let commonPublicationData = {};

    function initializePublicationTab() {
        currentLanguage = state.getCurrentPublikationLang() || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG;
        currentSection = state.getCurrentPublikationSection() || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION;
        currentBruteForceMetric = state.getCurrentPublikationBruteForceMetric() || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC;
        
        prepareCommonData();
        fetchAllKollektivStats().then(() => {
            renderPublicationTab();
            if (typeof publikationEventHandlers !== 'undefined' && typeof publikationEventHandlers.setupPublicationTabEventHandlers === 'function') {
                const mainAppInterface = {
                    refreshCurrentTab: async () => {
                        const activeTabId = state.getActiveTabId();
                        if (activeTabId === TAB_ID) {
                           await refreshPublicationTab();
                        }
                    }
                };
                publikationEventHandlers.setupPublicationTabEventHandlers(mainAppInterface);
            }
        }).catch(error => {
            console.error("Fehler beim Abrufen der Kollektivstatistiken für den Publikation-Tab:", error);
            const tabContainer = document.getElementById(TAB_ID);
            if (tabContainer) {
                tabContainer.innerHTML = `<div class="alert alert-danger m-3">Fehler beim Laden der statistischen Daten. Publikations-Tab kann nicht angezeigt werden.</div>`;
            }
        });
    }

    async function fetchAllKollektivStats() {
        const rawData = kollektivStore.getAllProcessedData();
        const appliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
        const appliedT2Logic = t2CriteriaManager.getAppliedLogic();
        const allBruteForceResults = bruteForceManager.getAllResults();
        if (typeof statisticsService !== 'undefined' && typeof statisticsService.calculateAllStatsForPublication === 'function') {
            allKollektivStats = statisticsService.calculateAllStatsForPublication(rawData, appliedT2Criteria, appliedT2Logic, allBruteForceResults);
        } else {
            allKollektivStats = null;
            console.error("statisticsService.calculateAllStatsForPublication ist nicht verfügbar.");
            throw new Error("Statistik-Service nicht verfügbar.");
        }
    }
    
    function prepareCommonData() {
        const gesamtStats = allKollektivStats && allKollektivStats.Gesamt ? allKollektivStats.Gesamt.deskriptiv : null;
        const direktOPStats = allKollektivStats && allKollektivStats['direkt OP'] ? allKollektivStats['direkt OP'].deskriptiv : null;
        const nRCTStats = allKollektivStats && allKollektivStats.nRCT ? allKollektivStats.nRCT.deskriptiv : null;

        commonPublicationData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            currentKollektivNameGlobal: getKollektivDisplayName(state.getCurrentKollektiv()),
            nGesamtGlobal: gesamtStats?.anzahlPatienten || 0,
            nDirektOPGlobal: direktOPStats?.anzahlPatienten || 0,
            nNRCTGlobal: nRCTStats?.anzahlPatienten || 0,
            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
            appliedT2Criteria: t2CriteriaManager.getAppliedCriteria(),
            appliedT2Logic: t2CriteriaManager.getAppliedLogic(),
            bruteForceMetricForPublication: currentBruteForceMetric
        };
    }

    function renderPublicationTab() {
        const tabContainer = document.getElementById(TAB_ID);
        if (!tabContainer) {
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showLoadingSpinner === 'function') {
                ui_helpers.showLoadingSpinner(TAB_ID, `Container '${TAB_ID}' nicht gefunden.`);
            }
            return;
        }

        if (!allKollektivStats) {
            tabContainer.innerHTML = '<p class="text-center text-muted p-5">Statistische Daten werden noch berechnet oder sind nicht verfügbar. Bitte warten oder erneut versuchen.</p>';
             if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showLoadingSpinner === 'function') {
                ui_helpers.hideLoadingSpinner(TAB_ID);
            }
            return;
        }
        
        prepareCommonData(); // Ensure common data is fresh based on potentially updated allKollektivStats

        tabContainer.innerHTML = '';

        const row = ui_helpers.createElementWithAttributes('div', { class: 'row g-0' });
        const navCol = ui_helpers.createElementWithAttributes('div', { class: 'col-md-3 border-end' });
        const contentCol = ui_helpers.createElementWithAttributes('div', { class: 'col-md-9' });

        navCol.appendChild(createPublicationNav());
        contentCol.appendChild(createPublicationContentArea());

        row.appendChild(navCol);
        row.appendChild(contentCol);
        tabContainer.appendChild(row);

        renderSectionContent(currentSection);
        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.initTooltips === 'function') {
            ui_helpers.initTooltips(tabContainer);
        }
    }

    function createPublicationNav() {
        const navWrapper = ui_helpers.createElementWithAttributes('div', { class: 'p-3 sticky-top' });
        navWrapper.style.top = `calc(${getComputedStyle(document.documentElement).getPropertyValue('--sticky-header-offset') || '110px'} + 1px)`;


        const langSwitchWrapper = ui_helpers.createElementWithAttributes('div', { class: 'mb-3' });
        const langLabel = ui_helpers.createElementWithAttributes('label', { for: 'publication-language-switch', class: 'form-label form-label-sm' }, 'Sprache der Texte:');
        const langSelect = uiComponents.createSelect({
            id: 'publication-language-switch',
            name: 'publicationLanguage',
            selectOptions: [
                { value: 'de', text: UI_TEXTS.publikationTab.spracheSwitchLabel.de || 'Deutsch' },
                { value: 'en', text: UI_TEXTS.publikationTab.spracheSwitchLabel.en || 'English' }
            ],
            value: currentLanguage,
            selectClass: 'form-select-sm',
            wrapperClass: 'mb-0',
            onChange: (event) => handleLanguageChange(event.target.value)
        });
        langSwitchWrapper.appendChild(langLabel);
        langSwitchWrapper.appendChild(langSelect);
        navWrapper.appendChild(langSwitchWrapper);
        
        const bfMetricOptions = PUBLICATION_CONFIG.bruteForceMetricsForPublication.map(m => ({value: m.value, text: m.label}));
        const bfMetricSelect = uiComponents.createSelect({
            id: 'publication-bf-metric-select',
            label: UI_TEXTS.publikationTab.bruteForceMetricSelectLabel || 'Optimierungsmetrik für T2 (BF):',
            selectOptions: bfMetricOptions,
            value: currentBruteForceMetric,
            selectClass: 'form-select-sm',
            wrapperClass: 'mb-3',
            tooltipKey: 'tooltip.publikationTabTooltips.bruteForceMetricSelect',
            onChange: (event) => handleBruteForceMetricChange(event.target.value)
        });
        navWrapper.appendChild(bfMetricSelect);

        const exportAllButton = uiComponents.createButton({
            id: 'btn-export-publication-md-all',
            text: 'Alle Sektionen als MD ZIP',
            iconClass: 'fas fa-file-archive',
            btnClass: 'btn-outline-primary btn-sm w-100 mb-3',
            tooltipKey: 'tooltip.exportTab.mdZIP'
        });
        navWrapper.appendChild(exportAllButton);


        const navList = ui_helpers.createElementWithAttributes('ul', { class: 'nav nav-pills flex-column', id: 'publication-sections-nav' });
        PUBLICATION_CONFIG.sections.forEach(section => {
            const sectionLabelText = UI_TEXTS.publikationTab.sectionLabels[section.labelKey] || section.labelKey.charAt(0).toUpperCase() + section.labelKey.slice(1);
            const mainSectionHeader = ui_helpers.createElementWithAttributes('li', {class: 'nav-item mt-2'});
            mainSectionHeader.appendChild(ui_helpers.createElementWithAttributes('span', {class: 'nav-link disabled'}, sectionLabelText));
            navList.appendChild(mainSectionHeader);

            section.subSections.forEach(subSection => {
                const li = ui_helpers.createElementWithAttributes('li', { class: 'nav-item' });
                const a = ui_helpers.createElementWithAttributes('a', {
                    class: `nav-link list-group-item-action ${subSection.id === currentSection ? 'active' : ''}`,
                    href: '#',
                    'data-section-id': subSection.id
                }, subSection.label[currentLanguage] || subSection.label.de);
                 if (subSection.tooltipKey && typeof TOOLTIP_CONTENT.publikationTabTooltips[subSection.tooltipKey] !== 'undefined') {
                    a.setAttribute('data-tippy-content', TOOLTIP_CONTENT.publikationTabTooltips[subSection.tooltipKey]);
                }
                li.appendChild(a);
                navList.appendChild(li);
            });
        });
        navWrapper.appendChild(navList);
        return navWrapper;
    }

    function createPublicationContentArea() {
        const contentArea = ui_helpers.createElementWithAttributes('div', { id: 'publikation-content-area', class: 'p-3' });
        contentArea.innerHTML = '<p class="text-muted">Wählen Sie eine Sektion aus dem Menü.</p>';
        return contentArea;
    }

    function renderSectionContent(sectionId) {
        const contentArea = document.getElementById('publikation-content-area');
        if (!contentArea) return;

        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showLoadingSpinner === 'function') {
            ui_helpers.showLoadingSpinner('publikation-content-area', `Lade Inhalt für Sektion '${sectionId}'...`);
        }
        
        // Ensure commonPublicationData is up-to-date before rendering a section
        prepareCommonData();

        setTimeout(() => {
            try {
                if (typeof publicationRenderer !== 'undefined' && typeof publicationRenderer.renderPublicationSection === 'function') {
                    const sectionElement = publicationRenderer.renderPublicationSection(sectionId, currentLanguage, allKollektivStats, commonPublicationData);
                    contentArea.innerHTML = '';
                    contentArea.appendChild(sectionElement);
                    
                    const figuresToRender = sectionElement.querySelectorAll('figure[data-chart-render-info]');
                    figuresToRender.forEach(fig => {
                        try {
                            const chartInfo = JSON.parse(fig.dataset.chartRenderInfo);
                            if (chartInfo && chartInfo.targetDivId && document.getElementById(chartInfo.targetDivId)) {
                                renderSpecificChartForPublication(chartInfo.chartIdToRender, chartInfo.targetDivId, chartInfo.kollektivId, chartInfo.subType);
                            }
                        } catch (e) {
                            console.error("Fehler beim Parsen/Rendern eines Diagramms für Publikation:", e, fig.dataset.chartRenderInfo);
                        }
                    });

                } else {
                    throw new Error("publicationRenderer nicht verfügbar.");
                }
            } catch (error) {
                console.error(`Fehler beim Rendern der Sektion '${sectionId}':`, error);
                contentArea.innerHTML = `<div class="alert alert-warning">Inhalt für Sektion '${sectionId}' konnte nicht geladen werden. Details in der Konsole.</div>`;
            }
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.hideLoadingSpinner === 'function') {
                ui_helpers.hideLoadingSpinner('publikation-content-area');
            }
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.initTooltips === 'function') {
                ui_helpers.initTooltips(contentArea);
            }
            contentArea.scrollTop = 0;
        }, 50);
    }
    
    function renderSpecificChartForPublication(chartType, containerId, kollektivId, subType) {
        if (!allKollektivStats || !chartRenderer) return;
        const kollektivStats = allKollektivStats[kollektivId];
        if (!kollektivStats) return;

        let chartData, chartOptions = {kollektivForExport: kollektivId};
        const kollektivDisplayName = getKollektivDisplayName(kollektivId);

        switch(chartType) {
            case 'Altersverteilung':
                chartData = kollektivStats.deskriptiv?.alterData || [];
                chartOptions = { ...chartOptions, xAxisLabel: UI_TEXTS.axisLabels.age, yAxisLabel: UI_TEXTS.axisLabels.patientCount, title: `Altersverteilung (${kollektivDisplayName})`, chartNameForFilename: `Alter_${kollektivId.replace(/\s+/g,'_')}` };
                chartManager.manageChartContainer(containerId, chartRenderer.renderHistogram, chartData, chartOptions);
                break;
            case 'Geschlechterverteilung':
                const g = kollektivStats.deskriptiv?.geschlecht;
                chartData = g ? [{label: UI_TEXTS.legendLabels.male, value: g.m}, {label: UI_TEXTS.legendLabels.female, value: g.f}] : [];
                if(g && g.unbekannt > 0) chartData.push({label: UI_TEXTS.legendLabels.unknownGender, value: g.unbekannt});
                chartOptions = { ...chartOptions, title: `Geschlechter (${kollektivDisplayName})`, chartNameForFilename: `Gender_${kollektivId.replace(/\s+/g,'_')}` };
                chartManager.manageChartContainer(containerId, chartRenderer.renderPieChart, chartData, chartOptions);
                break;
            case 'ROC':
                let perfData;
                if (subType === 'AS') perfData = kollektivStats.gueteAS;
                else if (subType === 'T2angewandt') perfData = kollektivStats.gueteT2_angewandt;
                else if (subType && subType.startsWith('LitT2_')) {
                    const litSetId = subType.substring('LitT2_'.length);
                    perfData = kollektivStats.gueteT2_literatur?.[litSetId];
                } else if (subType === 'T2optimiert') {
                    perfData = kollektivStats.gueteT2_bruteforce;
                }
                if (perfData) {
                    chartData = { points: dataProcessor.generateROCPointsFromConfusionMatrix(perfData.matrix, subType), auc: perfData.auc?.value, auc_ci_lower: perfData.auc?.ci?.lower, auc_ci_upper: perfData.auc?.ci?.upper };
                    chartOptions = { ...chartOptions, title: `ROC Kurve: ${subType} (${kollektivDisplayName})`, chartNameForFilename: `ROC_${subType}_${kollektivId.replace(/\s+/g,'_')}` };
                    chartManager.manageChartContainer(containerId, chartRenderer.renderROCCurve, chartData, chartOptions);
                }
                break;
             case 'Vergleich_Performance_Alle_Methoden':
                const methodsData = [];
                if (kollektivStats.gueteAS) methodsData.push({name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, ...kollektivStats.gueteAS});
                if (kollektivStats.gueteT2_angewandt) methodsData.push({name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME, ...kollektivStats.gueteT2_angewandt});
                // Add BF optimized if available
                const bfDisplayDataPub = _getBruteForceResultsForDisplay(allKollektivStats, kollektivId, currentBruteForceMetric);
                if (bfDisplayDataPub && bfDisplayDataPub.performance) {
                     methodsData.push({name: `Opt. T2 (${currentBruteForceMetric})`, ...bfDisplayDataPub.performance});
                }
                 PUBLICATION_CONFIG.literatureCriteriaSets.forEach(setConf => {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(setConf.id);
                    if (studySet) {
                        let dataForThisStudySet = kollektivStats;
                        let evalKollektivId = kollektivId;
                        if (studySet.applicableKollektiv && studySet.applicableKollektiv !== kollektivId) {
                             evalKollektivId = studySet.applicableKollektiv;
                             dataForThisStudySet = allKollektivStats[evalKollektivId];
                        }
                        const perf = dataForThisStudySet?.gueteT2_literatur?.[setConf.id];
                        if(perf) methodsData.push({name: studySet.name || setConf.id, ...perf});
                    }
                });

                const metricsToCompare = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'];
                const barChartData = metricsToCompare.flatMap(metricKey =>
                    methodsData.map(method => ({
                        label: `${method.name} - ${metricKey.toUpperCase()}`,
                        value: method[metricKey]?.value ?? NaN,
                        group: metricKey.toUpperCase()
                    }))
                ).filter(d => !isNaN(d.value));

                const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
                                     .domain(methodsData.map(m => m.name));

                chartOptions = {
                    ...chartOptions,
                    xAxisLabel: 'Methode & Metrik',
                    yAxisLabel: 'Wert',
                    title: `Leistungsvergleich (${kollektivDisplayName})`,
                    chartNameForFilename: `PerfComp_${kollektivId.replace(/\s+/g,'_')}`,
                    colorScale: (label) => {
                        const methodName = label.split(' - ')[0];
                        return colorScale(methodName);
                    }
                };
                chartManager.manageChartContainer(containerId, chartRenderer.renderBarChart, barChartData, chartOptions);
                break;

            default:
                if(document.getElementById(containerId)) document.getElementById(containerId).innerHTML = `<p class="text-muted small">Diagrammtyp '${chartType}' nicht implementiert für Publikationsansicht.</p>`;
        }
    }
    
    function _getBruteForceResultsForDisplay(allStats, kollektivId, bfMetricName) {
        const kollektivStats = allStats?.[kollektivId] || null;
        if (kollektivStats?.bruteforce_definition && kollektivStats?.bruteforce_definition?.metricName === bfMetricName) {
            return {
                definition: kollektivStats.bruteforce_definition,
                performance: kollektivStats.gueteT2_bruteforce
            };
        }
        return null;
    }


    function handleLanguageChange(newLang) {
        if (currentLanguage !== newLang) {
            state.setCurrentPublikationLang(newLang);
            currentLanguage = newLang;
            const navCol = document.querySelector('#publikation-tab-pane .col-md-3');
            const contentColPresent = !!document.getElementById('publikation-content-area');
            
            if (navCol) {
                navCol.innerHTML = '';
                navCol.appendChild(createPublicationNav());
            }
            if(contentColPresent) {
                 renderSectionContent(currentSection);
            } else {
                renderPublicationTab(); // Full re-render if content area was missing
            }
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.initTooltips === 'function' && navCol) {
                ui_helpers.initTooltips(navCol);
            }
        }
    }

    function handleSectionChange(newSectionId) {
        if (currentSection !== newSectionId) {
            state.setCurrentPublikationSection(newSectionId);
            currentSection = newSectionId;
            document.querySelectorAll('#publication-sections-nav .nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.dataset.sectionId === newSectionId) {
                    link.classList.add('active');
                }
            });
            renderSectionContent(newSectionId);
        }
    }
    
    function handleBruteForceMetricChange(newMetric) {
        if (currentBruteForceMetric !== newMetric) {
            state.setCurrentPublikationBruteForceMetric(newMetric);
            currentBruteForceMetric = newMetric;
            // commonPublicationData muss aktualisiert werden, bevor die Sektion neu gerendert wird
            prepareCommonData(); 
            renderSectionContent(currentSection); // Re-render current section to reflect new BF metric in texts and potentially charts
        }
    }

    async function refreshPublicationTab() {
        currentLanguage = state.getCurrentPublikationLang() || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG;
        currentSection = state.getCurrentPublikationSection() || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION;
        currentBruteForceMetric = state.getCurrentPublikationBruteForceMetric() || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC;
        
        await fetchAllKollektivStats(); // Daten neu laden und verarbeiten
        prepareCommonData(); // Common data neu aufbereiten
        renderPublicationTab(); // Den Tab komplett neu zeichnen
    }
    
    function handleGlobalDataChange() {
        const tabPane = document.getElementById(TAB_ID);
        const isActive = tabPane && tabPane.classList.contains('active') && tabPane.classList.contains('show');
        
        // Daten immer neu laden, auch wenn der Tab nicht aktiv ist, damit `allKollektivStats` aktuell ist.
        fetchAllKollektivStats().then(() => {
            prepareCommonData();
            if (isActive) {
                renderPublicationTab();
            }
        }).catch(error => {
            console.error("Fehler beim Aktualisieren der globalen Daten für Publikation-Tab:", error);
            if (isActive) {
                 tabPane.innerHTML = '<div class="alert alert-warning">Daten konnten nicht aktualisiert werden.</div>';
            }
        });
    }


    return {
        init: initializePublicationTab,
        render: renderPublicationTab,
        refresh: refreshPublicationTab,
        handleLanguageChange,
        handleSectionChange,
        handleBruteForceMetricChange,
        handleGlobalDataChange
    };
})();
