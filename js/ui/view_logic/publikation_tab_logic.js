const publikationTabLogic = (() => {
    const TAB_ID = 'publikation-tab-pane';
    let currentPublicationLanguage = 'de';
    let currentPublicationSection = 'methoden_studienanlage';
    let currentPublicationBruteForceMetric = APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC;
    let allKollektivStatsCache = null;
    let commonPublicationDataCache = null;

    function initializePublicationTab() {
        currentPublicationLanguage = state.getCurrentPublikationLang() || 'de';
        currentPublicationSection = state.getCurrentPublikationSection() || PUBLICATION_CONFIG.defaultSection;
        currentPublicationBruteForceMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        renderPublicationTab();
        publikationEventHandlers.setupPublicationTabEventHandlers();
    }

    function renderPublicationTab() {
        const tabContainer = document.getElementById(TAB_ID);
        if (!tabContainer) {
            ui_helpers.showLoadingSpinner(TAB_ID, `Container '${TAB_ID}' nicht gefunden.`);
            return;
        }
        ui_helpers.showLoadingSpinner(TAB_ID, 'Lade Publikationswerkzeuge...');

        const rawData = kollektivStore.getCurrentKollektivRawData();
        const appliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
        const appliedT2Logic = t2CriteriaManager.getAppliedLogic();
        const allBruteForceResults = bruteForceManager.getAllResults();

        try {
            allKollektivStatsCache = statisticsService.calculateAllStatsForPublication(rawData, appliedT2Criteria, appliedT2Logic, allBruteForceResults);
            commonPublicationDataCache = {
                appName: APP_CONFIG.APP_NAME,
                appVersion: APP_CONFIG.APP_VERSION,
                currentGlobalKollektivName: getKollektivDisplayName(state.getCurrentKollektiv()),
                nGesamtGlobal: allKollektivStatsCache?.Gesamt?.deskriptiv?.anzahlPatienten || 0,
                nDirektOPGlobal: allKollektivStatsCache?.['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
                nNRCTGlobal: allKollektivStatsCache?.nRCT?.deskriptiv?.anzahlPatienten || 0,
                significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
                references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
                bruteForceMetricForPublication: currentPublicationBruteForceMetric,
                appliedT2Criteria: appliedT2Criteria,
                appliedT2Logic: appliedT2Logic
            };

        } catch (error) {
            console.error("Fehler beim Berechnen der globalen Statistiken für den Publikationstab:", error);
            allKollektivStatsCache = null;
            commonPublicationDataCache = {};
            tabContainer.innerHTML = `<div class="alert alert-danger m-3">Fehler bei der Vorbereitung der Statistikdaten für die Publikation. Details siehe Konsole.</div>`;
            return;
        }


        tabContainer.innerHTML = `
            <div class="sticky-top bg-light p-3 border-bottom mb-3 shadow-sm" style="top: ${APP_CONFIG.UI_SETTINGS.STICKY_HEADER_OFFSET}; z-index: 1010;">
                <div class="row align-items-center gy-2">
                    <div class="col-md-auto">
                        <label for="publication-language-switch" class="form-label me-2 mb-0">Sprache:</label>
                        <select id="publication-language-switch" class="form-select form-select-sm d-inline-block w-auto">
                            <option value="de" ${currentPublicationLanguage === 'de' ? 'selected' : ''}>Deutsch</option>
                            <option value="en" ${currentPublicationLanguage === 'en' ? 'selected' : ''}>English</option>
                        </select>
                    </div>
                    <div class="col-md-auto">
                         <label for="publication-bf-metric-select" class="form-label me-2 mb-0">BF-Ergebnisse für Metrik:</label>
                         <select id="publication-bf-metric-select" class="form-select form-select-sm d-inline-block w-auto"></select>
                    </div>
                    <div class="col-md text-md-end mt-2 mt-md-0">
                        <button id="btn-export-publication-md-all" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-file-alt me-1"></i> Alle Sektionen (MD)
                        </button>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-3">
                    <nav id="publication-sections-nav" class="list-group list-group-flush sticky-top" style="top: calc(${APP_CONFIG.UI_SETTINGS.STICKY_HEADER_OFFSET} + 80px);"></nav>
                </div>
                <div class="col-md-9">
                    <div id="publication-content-area" class="bg-white p-3 p-md-4 border rounded shadow-sm" style="min-height: 400px;"></div>
                </div>
            </div>
        `;

        populateBruteForceMetricSelect();
        renderPublicationNavMenu();
        renderPublicationContentArea();
        ui_helpers.initTooltips(tabContainer);
    }

    function populateBruteForceMetricSelect() {
        const selectEl = document.getElementById('publication-bf-metric-select');
        if (!selectEl) return;
        selectEl.innerHTML = '';
        const metricOptions = PUBLICATION_CONFIG.bruteForceMetricsForPublication || [{value: APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC, text: APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC}];
        metricOptions.forEach(opt => {
            const optionEl = ui_helpers.createElementWithAttributes('option', { value: opt.value }, opt.text);
            if (opt.value === currentPublicationBruteForceMetric) optionEl.selected = true;
            selectEl.appendChild(optionEl);
        });
    }

    function renderPublicationNavMenu() {
        const navContainer = document.getElementById('publication-sections-nav');
        if (!navContainer) return;
        navContainer.innerHTML = '';

        PUBLICATION_CONFIG.sections.forEach(mainSection => {
            const mainSectionHeader = ui_helpers.createListGroupItem({
                text: mainSection.title[currentPublicationLanguage] || mainSection.title.de,
                itemClass: 'disabled fw-bold text-primary mt-2',
            });
            navContainer.appendChild(mainSectionHeader);

            mainSection.subSections.forEach(subSection => {
                const subSectionLink = ui_helpers.createListGroupItem({
                    text: subSection.title[currentPublicationLanguage] || subSection.title.de,
                    itemClass: `list-group-item-action ${subSection.id === currentPublicationSection ? 'active' : ''}`,
                    dataset: { sectionId: subSection.id },
                    onClick: () => handleSectionChange(subSection.id)
                });
                navContainer.appendChild(subSectionLink);
            });
        });
    }

    function renderPublicationContentArea() {
        const contentArea = document.getElementById('publication-content-area');
        if (!contentArea) return;
        ui_helpers.showLoadingSpinner('publication-content-area', 'Lade Sektionsinhalt...');

        if (!allKollektivStatsCache) {
            contentArea.innerHTML = '<p class="text-danger">Statistikdaten konnten nicht geladen werden. Inhalt kann nicht generiert werden.</p>';
            return;
        }
        if (!commonPublicationDataCache) {
             contentArea.innerHTML = '<p class="text-danger">Allgemeine Publikationsdaten konnten nicht geladen werden.</p>';
             return;
        }
        commonPublicationDataCache.bruteForceMetricForPublication = currentPublicationBruteForceMetric;


        try {
            const sectionContent = publicationRenderer.renderPublicationSection(
                currentPublicationSection,
                currentPublicationLanguage,
                allKollektivStatsCache,
                commonPublicationDataCache
            );
            contentArea.innerHTML = '';
            contentArea.appendChild(sectionContent);

            const chartPlaceholders = contentArea.querySelectorAll('[data-chart-id]');
            chartPlaceholders.forEach(placeholder => {
                const chartIdToRender = placeholder.dataset.chartId;
                const chartConfig = PUBLICATION_CONFIG.publicationElements.charts[chartIdToRender];
                if (chartConfig && typeof chartConfig.renderFunction === 'function') {
                    const chartData = chartConfig.dataExtractor(allKollektivStatsCache, commonPublicationDataCache);
                    const chartOptions = chartConfig.options ? chartConfig.options(currentPublicationLanguage, commonPublicationDataCache, allKollektivStatsCache) : {};
                    const chartContainerDiv = ui_helpers.createElementWithAttributes('div', { id: `pub-chart-${chartIdToRender}`, class: 'publication-chart-container my-3' });
                    placeholder.parentNode.replaceChild(chartContainerDiv, placeholder);
                    chartManager.manageChartContainer(`pub-chart-${chartIdToRender}`, chartConfig.renderFunction, chartData, chartOptions);
                } else {
                    placeholder.textContent = `[Chart-Platzhalter: ${chartIdToRender} - Konfiguration oder Renderfunktion fehlt]`;
                }
            });

             ui_helpers.initTooltips(contentArea);

        } catch (error) {
            console.error(`Fehler beim Rendern der Publikationssektion '${currentPublicationSection}':`, error);
            contentArea.innerHTML = `<div class="alert alert-danger">Fehler beim Laden des Inhalts für Sektion '${currentPublicationSection}'. Details in der Konsole.</div>`;
        }
    }


    function handleLanguageChange(newLang) {
        if (state.setCurrentPublikationLang(newLang)) {
            currentPublicationLanguage = newLang;
            renderPublicationNavMenu();
            renderPublicationContentArea();
        }
    }

    function handleSectionChange(newSectionId) {
        if (state.setCurrentPublikationSection(newSectionId)) {
            currentPublicationSection = newSectionId;
            const navItems = document.querySelectorAll('#publication-sections-nav .list-group-item-action');
            navItems.forEach(item => {
                item.classList.toggle('active', item.dataset.sectionId === newSectionId);
            });
            renderPublicationContentArea();
            const contentArea = document.getElementById('publication-content-area');
            if(contentArea) contentArea.scrollTop = 0;
        }
    }

    function handleBruteForceMetricChange(newMetric) {
        if (state.setCurrentPublikationBruteForceMetric(newMetric)) {
            currentPublicationBruteForceMetric = newMetric;
            if(commonPublicationDataCache) commonPublicationDataCache.bruteForceMetricForPublication = newMetric;
            renderPublicationContentArea();
        }
    }

    function handleGlobalDataChange() {
         allKollektivStatsCache = null;
         commonPublicationDataCache = null;
         renderPublicationTab();
    }


    return {
        init: initializePublicationTab,
        render: renderPublicationTab,
        refresh: handleGlobalDataChange,
        handleLanguageChange,
        handleSectionChange,
        handleBruteForceMetricChange
    };
})();
