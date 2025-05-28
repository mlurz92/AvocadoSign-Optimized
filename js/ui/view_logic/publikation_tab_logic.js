const publikationTabLogic = (() => {
    let _currentLang = state.getCurrentPublikationLang() || PUBLICATION_CONFIG.defaultLanguage;
    let _currentSection = state.getCurrentPublikationSection() || PUBLICATION_CONFIG.defaultSection;
    let _currentBruteForceMetricForPublication = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
    let _allPublicationStats = null;
    let _fullRawDataCache = null;
    let _appliedT2CriteriaCache = null;
    let _appliedT2LogicCache = null;
    let _bruteForceResultsCache = null;
    let _isInitialized = false;

    function initializeData(fullRawData, appliedT2Criteria, appliedT2Logic, bruteForceResults) {
        _fullRawDataCache = fullRawData;
        _appliedT2CriteriaCache = appliedT2Criteria;
        _appliedT2LogicCache = appliedT2Logic;
        _bruteForceResultsCache = bruteForceResults; // This comes from bruteForceManager.getAllResults()

        if (typeof publicationStatsService !== 'undefined' && typeof publicationStatsService.calculateAllStatsForPublicationTab === 'function') {
            _allPublicationStats = publicationStatsService.calculateAllStatsForPublicationTab(
                _fullRawDataCache,
                _appliedT2CriteriaCache,
                _appliedT2LogicCache,
                _bruteForceResultsCache, // Pass the results from all kollektivs
                _currentBruteForceMetricForPublication
            );
        } else {
            console.error("PublikationTabLogic: publicationStatsService nicht verfügbar.");
            _allPublicationStats = null;
        }
        _isInitialized = true;
    }

    function getRenderedSectionContent() {
        const currentUITexts = getUITexts();
        if (!_allPublicationStats) {
            return `<p class="text-warning">${currentUITexts.publikationTab.textGenerierungsHinweis || 'Statistische Daten für Publikation werden noch aufbereitet oder sind nicht verfügbar.'}</p>`;
        }
        const sectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === _currentSection);
        if (!sectionConfig) return `<p class="text-danger">Sektion "${_currentSection}" nicht gefunden.</p>`;

        const publicationData = {
            allKollektivStats: _allPublicationStats,
            currentLang: _currentLang,
            currentSectionId: _currentSection,
            currentBruteForceMetric: _currentBruteForceMetricForPublication,
            config: PUBLICATION_CONFIG,
            appConfig: APP_CONFIG
        };
        return publicationTextGenerator.generateSectionText(publicationData);
    }

    function renderTablesForSection(sectionData, sectionConfig) {
        if (!sectionData || !sectionConfig || !sectionConfig.subSections) return;
        const currentUITexts = getUITexts();

        sectionConfig.subSections.forEach(subSection => {
            const elementsOfType = PUBLICATION_CONFIG.publicationElements[_currentSection];
            if (elementsOfType) {
                Object.values(elementsOfType).forEach(elementConfig => {
                    if (elementConfig.id.startsWith('pub-table-') && document.getElementById(elementConfig.id)) {
                        const tableContainer = document.getElementById(elementConfig.id);
                        const tableTitle = _currentLang === 'en' ? elementConfig.titleEn : elementConfig.titleDe;
                        const tableHTML = publicationRenderer.renderPublicationTable(
                            elementConfig.id,
                            tableTitle,
                            _allPublicationStats,
                            _currentLang,
                            _currentBruteForceMetricForPublication,
                            subSection.id // Pass subSectionId to determine which table to render
                        );
                        if (tableContainer) {
                            tableContainer.innerHTML = tableHTML || `<p class="text-muted small">Tabelle "${tableTitle}" konnte nicht generiert werden.</p>`;
                            ui_helpers.initializeTooltips(tableContainer);
                        }
                    }
                });
            }
             // Special handling for general tables if any (not typical for this structure)
            const generalTableElementId = `table-container-${_currentSection}-${subSection.id}`;
            const generalTableContainer = document.getElementById(generalTableElementId);
            if (generalTableContainer) {
                 const generalTableTitle = currentUITexts.publikationTab.sectionLabels[subSection.id]?.[_currentLang] || subSection.label;
                 const generalTableHTML = publicationRenderer.renderPublicationTable(
                    generalTableElementId.replace('container-', ''), // Construct an ID for the table itself
                    generalTableTitle,
                    _allPublicationStats,
                    _currentLang,
                    _currentBruteForceMetricForPublication,
                    subSection.id // Pass subSection.id to allow specific logic
                );
                if(generalTableHTML && generalTableHTML.includes('<table')) { // Only render if content is a table
                    generalTableContainer.innerHTML = generalTableHTML;
                    ui_helpers.initializeTooltips(generalTableContainer);
                } else if (generalTableHTML) { // Render as text if not a table
                    generalTableContainer.innerHTML = `<div class="generated-text-block">${generalTableHTML}</div>`;
                }
            }
        });
    }

    function renderChartsForSection(sectionData, sectionConfig) {
        if (!sectionData || !sectionConfig || !sectionConfig.subSections) return;

        sectionConfig.subSections.forEach(subSection => {
            const elementsOfType = PUBLICATION_CONFIG.publicationElements[_currentSection];
            if (elementsOfType) {
                Object.values(elementsOfType).forEach(elementConfig => {
                    if (elementConfig.id.startsWith('pub-chart-') && document.getElementById(elementConfig.id)) {
                        const chartContainer = document.getElementById(elementConfig.id);
                        const chartTitle = (_currentLang === 'en' ? elementConfig.titleEn : elementConfig.titleDe) || "Diagramm";
                        
                        const styleOptions = {
                            lang: _currentLang,
                            grayscale: state.getCurrentChartSettings().grayscaleExport || false,
                            styleProfile: 'journal'
                        };
                        
                        publicationRenderer.renderPublicationChart(
                            elementConfig.id,
                            chartTitle,
                            _allPublicationStats,
                            styleOptions,
                            _currentBruteForceMetricForPublication,
                             subSection.id // Pass subSection.id
                        );
                    }
                });
            }
            // Handle general chart placeholders if any
            const generalChartElementId = `chart-container-${_currentSection}-${subSection.id}`;
            const generalChartContainer = document.getElementById(generalChartElementId);
            if(generalChartContainer) {
                const currentUITexts = getUITexts();
                const generalChartTitle = currentUITexts.publikationTab.sectionLabels[subSection.id]?.[_currentLang] || subSection.label;
                 const styleOptions = {
                    lang: _currentLang,
                    grayscale: state.getCurrentChartSettings().grayscaleExport || false,
                    styleProfile: 'journal'
                };
                publicationRenderer.renderPublicationChart(
                    generalChartElementId.replace('container-', ''),
                    generalChartTitle,
                    _allPublicationStats,
                    styleOptions,
                    _currentBruteForceMetricForPublication,
                    subSection.id
                );
            }
        });
    }

    function updateDynamicContent(forceDataRecomputation = false) {
        const contentArea = document.getElementById('publikation-content-area');
        if (!contentArea) return;

        if (forceDataRecomputation || !_isInitialized) {
            if (_fullRawDataCache && _appliedT2CriteriaCache && _appliedT2LogicCache && _bruteForceResultsCache) {
                 initializeData(_fullRawDataCache, _appliedT2CriteriaCache, _appliedT2LogicCache, _bruteForceResultsCache);
            } else {
                contentArea.innerHTML = '<p class="text-danger">Initialisierungsdaten für Publikationsstatistiken fehlen. Bitte laden Sie die Seite neu oder führen Sie Analysen durch.</p>';
                return;
            }
        }

        if (!_allPublicationStats && _isInitialized) {
             contentArea.innerHTML = '<p class="text-warning">Statistische Daten für Publikation konnten nicht vollständig aufbereitet werden.</p>';
             return;
        } else if (!_allPublicationStats && !_isInitialized) {
            contentArea.innerHTML = '<p class="text-info">Daten werden geladen...</p>';
            return;
        }

        const sectionContentHTML = getRenderedSectionContent();
        contentArea.innerHTML = sectionContentHTML;

        const sectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === _currentSection);
        if (sectionConfig) {
            renderTablesForSection(_allPublicationStats, sectionConfig);
            renderChartsForSection(_allPublicationStats, sectionConfig);
        }
        ui_helpers.updatePublikationUI(_currentLang, _currentSection, _currentBruteForceMetricForPublication);
        ui_helpers.initializeTooltips(contentArea);
    }


    function handleLanguageChange(event) {
        _currentLang = event.target.checked ? 'en' : 'de';
        state.setCurrentPublikationLang(_currentLang);
        updateDynamicContent();
    }

    function handleSectionChange(event) {
        event.preventDefault();
        const targetLink = event.target.closest('.publikation-section-link');
        if (!targetLink) return;
        _currentSection = targetLink.dataset.sectionId;
        if (_currentSection) {
            state.setCurrentPublikationSection(_currentSection);
            document.querySelectorAll('#publikation-sections-nav .nav-link').forEach(link => link.classList.remove('active'));
            targetLink.classList.add('active');
            updateDynamicContent();
            const contentArea = document.getElementById('publikation-content-area');
            if(contentArea) contentArea.scrollTop = 0;
        }
    }

    function handleBfMetricChange(event) {
        _currentBruteForceMetricForPublication = event.target.value;
        state.setCurrentPublikationBruteForceMetric(_currentBruteForceMetricForPublication);
        // Data needs to be re-processed with the new target metric for BF results
        initializeData(_fullRawDataCache, _appliedT2CriteriaCache, _appliedT2LogicCache, _bruteForceResultsCache);
        updateDynamicContent();
    }
    
    function handleNewBruteForceResults() {
        if (_isInitialized && document.getElementById('publikation-tab-pane')?.classList.contains('active')) {
            // Refresh data only if new BF results are available and the tab is active
            // Or, always refresh if BF results are a direct dependency for current view, even if not active.
            // For simplicity, let's assume an active tab check is sufficient.
             _bruteForceResultsCache = bruteForceManager.getAllResults(); // Get latest results
             initializeData(_fullRawDataCache, _appliedT2CriteriaCache, _appliedT2LogicCache, _bruteForceResultsCache);
             updateDynamicContent();
        }
    }


    function init(fullRawData, appliedT2Criteria, appliedT2Logic, bruteForceResults) {
        initializeData(fullRawData, appliedT2Criteria, appliedT2Logic, bruteForceResults);

        const langSwitch = document.getElementById('publikation-sprache-switch');
        const sectionNav = document.getElementById('publikation-sections-nav');
        const bfMetricSelect = document.getElementById('publikation-bf-metric-select');

        if (langSwitch) langSwitch.addEventListener('change', handleLanguageChange);
        if (sectionNav) sectionNav.addEventListener('click', handleSectionChange);
        if (bfMetricSelect) bfMetricSelect.addEventListener('change', handleBfMetricChange);

        // Initial content rendering
        const initialSectionLink = sectionNav?.querySelector(`.nav-link[data-section-id="${_currentSection}"]`);
        if (initialSectionLink) initialSectionLink.classList.add('active');
        updateDynamicContent();

        document.addEventListener('bruteForceRunCompleted', handleNewBruteForceResults);
    }

    function refreshDataAndRender(fullRawData, appliedT2Criteria, appliedT2Logic, bruteForceResults) {
         initializeData(fullRawData, appliedT2Criteria, appliedT2Logic, bruteForceResults);
         updateDynamicContent();
    }

    return Object.freeze({
        init,
        updateDynamicContent, // Expose for external refresh if needed
        refreshDataAndRender // Expose for explicit data refresh and re-render
    });
})();
