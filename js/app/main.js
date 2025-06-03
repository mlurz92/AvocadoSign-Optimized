let mainAppInterface = null;
let canvgInstance = null;

async function _svgToPngDataURL(svgElement, scale = 1, backgroundColor = '#ffffff') {
    if (!svgElement || typeof svgElement.getBoundingClientRect !== 'function') {
        console.error("Ungültiges SVG-Element für PNG-Konvertierung übergeben.");
        return Promise.reject("Ungültiges SVG-Element");
    }

    const rect = svgElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) {
        console.error("SVG-Element hat keine Dimensionen für PNG-Konvertierung.");
        return Promise.reject("SVG hat keine Dimensionen");
    }
    
    const scaledWidth = Math.ceil(width * scale);
    const scaledHeight = Math.ceil(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error("Konnte keinen 2D-Kontext vom Canvas erhalten.");
        return Promise.reject("Canvas 2D-Kontext Fehler");
    }

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, scaledWidth, scaledHeight);
    ctx.save();
    ctx.scale(scale, scale);
    
    const svgString = new XMLSerializer().serializeToString(svgElement);

    try {
        if (!canvgInstance || typeof canvgInstance.Canvg !== 'function') {
            if (typeof Canvg !== 'undefined') {
                 canvgInstance = { Canvg: Canvg, presets: Canvg.presets };
            } else {
                console.error("Canvg Bibliothek nicht global verfügbar.");
                return Promise.reject("Canvg nicht verfügbar");
            }
        }
        const v = await canvgInstance.Canvg.from(ctx, svgString, canvgInstance.presets.offscreen());
        await v.render();
        ctx.restore(); 
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Fehler während der SVG zu PNG Konvertierung mit Canvg:', error);
        ctx.restore();
        return Promise.reject(error);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    if (typeof stateManager === 'undefined' || typeof dataProcessor === 'undefined' || 
        typeof ui_helpers === 'undefined' || typeof uiComponents === 'undefined' ||
        typeof t2CriteriaManager === 'undefined' || typeof studyT2CriteriaManager === 'undefined' ||
        typeof viewRenderer === 'undefined' || typeof generalEventHandlers === 'undefined' ||
        typeof dataTabEventHandlers === 'undefined' || typeof auswertungTabEventHandlers === 'undefined' ||
        typeof statistikEventHandlers === 'undefined' || typeof praesentationEventHandlers === 'undefined' ||
        typeof publikationEventHandlers === 'undefined' || typeof exportEventHandlers === 'undefined' ||
        typeof exportService === 'undefined' || typeof statisticsService === 'undefined' ||
        typeof chartRenderer === 'undefined' || typeof bruteForceManager === 'undefined' ||
        typeof APP_CONFIG === 'undefined' || typeof UI_TEXTS === 'undefined' || typeof TOOLTIP_CONTENT === 'undefined') {
        console.error("Ein oder mehrere Kernmodule konnten nicht geladen werden. App-Initialisierung abgebrochen.");
        const loadingErrorElement = document.getElementById('loading-error-message');
        if(loadingErrorElement) {
            loadingErrorElement.textContent = "Fehler beim Laden der Anwendungskomponenten. Bitte versuchen Sie, die Seite neu zu laden oder kontaktieren Sie den Support.";
            loadingErrorElement.style.display = 'block';
        }
        const appContainer = document.getElementById('app-container');
        if(appContainer) appContainer.style.display = 'none';
        const loadingIndicator = document.getElementById('loading-indicator');
        if(loadingIndicator) loadingIndicator.style.display = 'none';
        return;
    }

    stateManager.initialize();
    dataProcessor.initializeData(patientDataRaw);
    const initialData = dataProcessor.getProcessedData();
    
    t2CriteriaManager.initialize(APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC, getDefaultT2Criteria());
    studyT2CriteriaManager.initialize();

    bruteForceManager.initialize();
    bruteForceManager.updateData(initialData);


    mainAppInterface = (() => {
        let isInitialized = false;
        let currentActiveTabId = stateManager.getActiveTabId();
        let currentKollektiv = stateManager.getCurrentKollektiv();
        let currentT2Criteria = t2CriteriaManager.getAppliedCriteria();
        let currentT2Logic = t2CriteriaManager.getAppliedLogic();
        let allStats = null;
        let bfResultsCache = {};

        const _calculateAllStatsIfNeeded = () => {
            const bfResultsForMetric = bruteForceManager.getResultsForKollektiv(currentKollektiv, stateManager.getCurrentPublikationBruteForceMetric()) || 
                                       bruteForceManager.getResultsForKollektiv(currentKollektiv, stateManager.getBruteForceMetric());
            const bfResultsKey = `${currentKollektiv}-${stateManager.getCurrentPublikationBruteForceMetric()}-${JSON.stringify(currentT2Criteria)}-${currentT2Logic}`;
            if (!allStats || allStats.cacheKey !== bfResultsKey || (bfResultsForMetric && (!bfResultsCache[currentKollektiv] || bfResultsCache[currentKollektiv][stateManager.getCurrentPublikationBruteForceMetric()] !== bfResultsForMetric))) {
                 const allBfResults = bruteForceManager.getAllStoredResults();
                 allStats = statisticsService.calculateAllStatsForPublication(initialData, currentT2Criteria, currentT2Logic, allBfResults);
                 allStats.cacheKey = bfResultsKey;
                 if (bfResultsForMetric) {
                     if(!bfResultsCache[currentKollektiv]) bfResultsCache[currentKollektiv] = {};
                     bfResultsCache[currentKollektiv][stateManager.getCurrentPublikationBruteForceMetric()] = bfResultsForMetric;
                 }
            }
            return allStats;
        };
        
        const _getCommonDataForPublikation = () => {
            _calculateAllStatsIfNeeded();
            return {
                appName: APP_CONFIG.APP_NAME,
                appVersion: APP_CONFIG.APP_VERSION,
                nGesamt: allStats.Gesamt?.deskriptiv?.anzahlPatienten || 0,
                nDirektOP: allStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
                nNRCT: allStats.nRCT?.deskriptiv?.anzahlPatienten || 0,
                references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
                t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
                t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
                bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
                significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
                bruteForceMetricForPublication: stateManager.getCurrentPublikationBruteForceMetric()
            };
        };

        function refreshCurrentTab(forceRecalculateStats = false) {
            if (!isInitialized) return;
            currentActiveTabId = stateManager.getActiveTabId();
            currentKollektiv = stateManager.getCurrentKollektiv();
            currentT2Criteria = t2CriteriaManager.getAppliedCriteria();
            currentT2Logic = t2CriteriaManager.getAppliedLogic();
            
            if(forceRecalculateStats) allStats = null; // Force recalculation

            let dataForTab;
            switch (currentActiveTabId) {
                case 'daten-tab':
                    dataTabLogic.updateData(initialData);
                    viewRenderer.renderDatenTab(initialData);
                    break;
                case 'auswertung-tab':
                    auswertungTabLogic.updateData(initialData);
                    viewRenderer.renderAuswertungTab(initialData, currentKollektiv, bruteForceManager);
                    break;
                case 'statistik-tab':
                    statistikTabLogic.updateData(_calculateAllStatsIfNeeded(), currentKollektiv, stateManager.getCurrentStatsLayout(), stateManager.getStatsKollektiv1(), stateManager.getStatsKollektiv2());
                    viewRenderer.renderStatistikTab(stateManager.getCurrentStatsLayout(), stateManager.getStatsKollektiv1(), stateManager.getStatsKollektiv2());
                    break;
                case 'praesentation-tab':
                    praesentationTabLogic.updateData(_calculateAllStatsIfNeeded(), currentKollektiv, stateManager.getCurrentPresentationView(), stateManager.getCurrentPresentationStudyId());
                    viewRenderer.renderPraesentationTab(stateManager.getCurrentPresentationView(), stateManager.getCurrentPresentationStudyId());
                    break;
                case 'publikation-tab':
                     publikationTabLogic.initializeData(initialData, currentT2Criteria, currentT2Logic, bruteForceManager.getAllStoredResults());
                     viewRenderer.renderPublikationTab(stateManager.getCurrentPublikationLang(), stateManager.getCurrentPublikationSection(), stateManager.getCurrentPublikationBruteForceMetric());
                    break;
                case 'export-tab':
                    viewRenderer.renderExportTab(currentKollektiv);
                    break;
                default:
                    console.warn(`Unbekannter Tab für Refresh: ${currentActiveTabId}`);
            }
            ui_helpers.updateHeaderStatsUI(dataProcessor.getHeaderStats(currentKollektiv, currentT2Criteria, currentT2Logic));
            ui_helpers.updateKollektivButtonsUI(currentKollektiv);
            ui_helpers.updateExportButtonStates(currentActiveTabId, Object.keys(bruteForceManager.getAllStoredResults() || {}).length > 0, initialData.length > 0);
        }

        function updateAllUIComponents() {
            if (!isInitialized) return;
            refreshCurrentTab();
            ui_helpers.updateT2CriteriaControlsUI(currentT2Criteria, currentT2Logic);
            ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.areCriteriaUnsaved());
            ui_helpers.updateStatistikSelectorsUI(stateManager.getCurrentStatsLayout(), stateManager.getStatsKollektiv1(), stateManager.getStatsKollektiv2());
            ui_helpers.updatePresentationViewSelectorUI(stateManager.getCurrentPresentationView());
            const praesStudySelect = document.getElementById('praes-study-select');
            if (praesStudySelect) praesStudySelect.value = stateManager.getCurrentPresentationStudyId() || '';
             ui_helpers.updatePublikationUI(stateManager.getCurrentPublikationLang(), stateManager.getCurrentPublikationSection(), stateManager.getCurrentPublikationBruteForceMetric());
             const bfResults = bruteForceManager.getResultsForKollektiv(bruteForceManager.getCurrentKollektiv() || currentKollektiv, bruteForceManager.getCurrentTargetMetric() || stateManager.getBruteForceMetric());
             const bfStatus = bruteForceManager.isRunning() ? 'progress' : (bfResults ? 'result' : 'idle');
             ui_helpers.updateBruteForceUI(bfStatus, bfResults || {}, bruteForceManager.isWorkerAvailable(), bruteForceManager.getCurrentKollektiv() || currentKollektiv);

        }
        
        function handleKollektivChange(newKollektiv) {
            if(currentKollektiv === newKollektiv) return;
            currentKollektiv = newKollektiv;
            stateManager.setCurrentKollektiv(newKollektiv);
            allStats = null; 
            bruteForceManager.updateKollektiv(newKollektiv);
        }

        function handleT2CriteriaChange(newCriteria, newLogic) {
            const debouncedRefresh = debounce(() => {
                t2CriteriaManager.setCriteria(newCriteria, newLogic);
                mainAppInterface.refreshAllTabs(true); 
                ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.areCriteriaUnsaved());
            }, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);
            debouncedRefresh();
        }
        
        function refreshAllTabs(forceRecalculateStats = false) {
            if (forceRecalculateStats) allStats = null;
            currentKollektiv = stateManager.getCurrentKollektiv();
            currentT2Criteria = t2CriteriaManager.getAppliedCriteria();
            currentT2Logic = t2CriteriaManager.getAppliedLogic();

            dataTabLogic.updateData(initialData);
            auswertungTabLogic.updateData(initialData);
            statistikTabLogic.updateData(_calculateAllStatsIfNeeded(), currentKollektiv, stateManager.getCurrentStatsLayout(), stateManager.getStatsKollektiv1(), stateManager.getStatsKollektiv2());
            praesentationTabLogic.updateData(_calculateAllStatsIfNeeded(), currentKollektiv, stateManager.getCurrentPresentationView(), stateManager.getCurrentPresentationStudyId());
            publikationTabLogic.initializeData(initialData, currentT2Criteria, currentT2Logic, bruteForceManager.getAllStoredResults());
            
            refreshCurrentTab(); 
        }
        
        function handlePublikationSettingsChange() {
            viewRenderer.renderPublikationTab(stateManager.getCurrentPublikationLang(), stateManager.getCurrentPublikationSection(), stateManager.getCurrentPublikationBruteForceMetric());
        }
        
        function handleExportRequest(exportType, options = {}) {
             _calculateAllStatsIfNeeded(); 
             const currentLang = stateManager.getCurrentPublikationLang();
             const commonData = _getCommonDataForPublikation();
             const pubOptions = { 
                lang: currentLang, 
                appliedCriteria: t2CriteriaManager.getAppliedCriteria(),
                appliedLogic: t2CriteriaManager.getAppliedLogic(),
                publicationElements: PUBLICATION_CONFIG.publicationElements
             };

            switch(exportType) {
                case 'statistikCSV':
                    exportService.exportStatistikCSV(allStats, currentKollektiv, currentT2Criteria, currentT2Logic);
                    break;
                case 'bruteForceTXT':
                    const bfResults = bruteForceManager.getResultsForKollektiv(options.kollektiv || currentKollektiv, options.metric || stateManager.getBruteForceMetric());
                    if (bfResults) exportService.exportBruteForceTXT(bfResults);
                    else ui_helpers.showToast("Keine Brute-Force Ergebnisse für diesen Export verfügbar.", "warning");
                    break;
                 case 'publikationMethodenMD':
                    exportService.exportPublikationSectionMarkdown('methoden', options.sectionName, currentLang, allStats, commonData, pubOptions);
                    break;
                case 'publikationErgebnisseMD':
                    exportService.exportPublikationSectionMarkdown('ergebnisse', options.sectionName, currentLang, allStats, commonData, pubOptions);
                    break;
                case 'publikationReferenzenMD':
                    exportService.exportPublikationSectionMarkdown('referenzen', 'referenzen', currentLang, allStats, commonData, pubOptions);
                    break;
                case 'publicationTableTSV':
                    exportService.exportPublicationTableTSV(allStats, currentLang, options.tableKey, commonData);
                    break;
                case 'referencesBibTeX':
                    exportService.exportReferencesBibTeX();
                    break;
                 case 'allZIP':
                    const exportFunctionsForZip = {
                        statistikCSV: { data: statisticsService.calculateAllStatsForPublication(initialData, currentT2Criteria, currentT2Logic, bruteForceManager.getAllStoredResults())[currentKollektiv] },
                        bruteForceTXT: true, 
                        deskriptiveStatistikMD: { content: viewRenderer.getDeskriptiveStatistikMarkdown(allStats[currentKollektiv]?.deskriptiv, currentKollektiv) },
                        datenMD: { content: viewRenderer.getDatenMarkdown(initialData, currentKollektiv) },
                        auswertungMD: { content: viewRenderer.getAuswertungMarkdown(initialData, currentKollektiv, currentT2Criteria, currentT2Logic) },
                        filteredDataCSV: { data: auswertungTabLogic.getFilteredData(currentKollektiv) }
                    };
                    exportService.exportAllToZip(exportFunctionsForZip, currentKollektiv, currentLang, allStats, commonData, pubOptions, currentT2Criteria, currentT2Logic);
                    break;
                default:
                    console.warn(`Unbekannter Export-Typ angefordert: ${exportType}`);
                    ui_helpers.showToast("Unbekannter Export-Typ.", "warning");
            }
        }


        return Object.freeze({
            initializeApp: () => {
                viewRenderer.initialize(initialData, currentKollektiv, bruteForceManager);
                generalEventHandlers.register();
                dataTabEventHandlers.register();
                auswertungTabEventHandlers.register(bruteForceManager);
                statistikEventHandlers.register();
                praesentationEventHandlers.register();
                publikationEventHandlers.register();
                exportEventHandlers.register();
                isInitialized = true;
                updateAllUIComponents();
                if(stateManager.isFirstAppStart()) {
                    ui_helpers.showKurzanleitung();
                    stateManager.setFirstAppStart(false);
                }
            },
            refreshCurrentTab,
            updateAllUIComponents,
            handleKollektivChange,
            handleT2CriteriaChange,
            handlePublikationSettingsChange,
            handleExportRequest,
            refreshAllTabs,
            getStatistikDaten: () => _calculateAllStatsIfNeeded(),
            getCommonDataForPublikation: _getCommonDataForPublikation,
            getBruteForceManager: () => bruteForceManager
        });
    })();

    mainAppInterface.initializeApp();
    
    document.addEventListener('bruteForceResultsUpdated', (event) => {
        if(mainAppInterface) mainAppInterface.refreshAllTabs(true);
    });
    document.addEventListener('stateChanged', (event) => {
        if(mainAppInterface) {
            const changedKeys = event.detail.changedKeys;
            if (changedKeys.includes(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV) ||
                changedKeys.includes(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT) ||
                changedKeys.includes(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1) ||
                changedKeys.includes(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2) ||
                changedKeys.includes(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW) ||
                changedKeys.includes(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID) ||
                changedKeys.includes(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG) ||
                changedKeys.includes(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION) ||
                changedKeys.includes(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC) ||
                changedKeys.includes(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_METRIC)
                ) {
                mainAppInterface.updateAllUIComponents();
            }
        }
    });
    
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    const appContainer = document.getElementById('app-container');
    if (appContainer) appContainer.style.visibility = 'visible';

}
