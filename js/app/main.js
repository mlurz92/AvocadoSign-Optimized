const main = (() => {
    let _rawData = [];
    let _isAppInitialized = false;

    const _mainAppInterface = Object.freeze({
        getRawData: () => cloneDeep(_rawData),
        getFilteredData: (kollektivId) => {
            if (typeof dataProcessor === 'undefined') return [];
            const processed = dataProcessor.processRawData(cloneDeep(_rawData));
            return dataProcessor.filterDataByKollektiv(processed, kollektivId || state.getCurrentKollektiv());
        },
        getStateSnapshot: () => {
            if (typeof state === 'undefined') return {};
            return state.getStateSnapshot();
        },
        getUiHelpers: () => {
            if (typeof ui_helpers === 'undefined') return {};
            return ui_helpers;
        },
        getT2CriteriaManager: () => {
            if (typeof t2CriteriaManager === 'undefined') return {};
            return t2CriteriaManager;
        },
        getBruteForceManager: () => {
            if (typeof bruteForceManager === 'undefined') return {};
            return bruteForceManager;
        },
        getPublicationStats: () => {
            if (typeof publicationTabLogic === 'undefined' || !publicationTabLogic.isInitialized()) return null;
            return publicationTabLogic.getFullPublicationStats();
        },
        getPraesentationData: () => {
             if (typeof praesentationTabLogic === 'undefined' || !praesentationTabLogic.isInitialized()) return { asPur: null, asVsT2: null};
             const logicModule = praesentationTabLogic;
             if (typeof logicModule._prepareDatenAsPur === 'function' && typeof logicModule._prepareDatenAsVsT2 === 'function') {
                return {
                    asPur: logicModule._praesentationData && logicModule._praesentationView === 'as-pur' ? logicModule._praesentationData : logicModule._prepareDatenAsPur(),
                    asVsT2: logicModule._praesentationData && logicModule._praesentationView === 'as-vs-t2' ? logicModule._praesentationData : logicModule._prepareDatenAsVsT2()
                };
             }
             return { asPur: null, asVsT2: null};
        },
        refreshCurrentTab: () => _refreshCurrentTab(),
        showToast: (message, type = 'info', duration = 3000) => {
            if (typeof ui_helpers !== 'undefined') ui_helpers.showToast(message, type, duration);
        },
        updateBruteForceUI: (status, tested, total, metric, best, kollektiv, resultsData) => {
            if (typeof ui_helpers !== 'undefined') ui_helpers.updateBruteForceUI(status, tested, total, metric, best, kollektiv, resultsData);
        },
        setBruteForceResults: (results) => {
            if (typeof state !== 'undefined') state.setBruteForceResults(results);
        },
        setBruteForceStatus: (status, details) => {
             if (typeof state !== 'undefined') state.setBruteForceStatus(status, details);
        },
        clearBruteForceResults: () => {
            if (typeof state !== 'undefined') state.clearBruteForceResults();
        },
        attachDataEventListeners: (containerId) => {
            if (typeof dataEventHandlers !== 'undefined') dataEventHandlers.attachDataEventListeners(containerId);
        },
        attachAuswertungEventListeners: (containerId) => {
            if (typeof auswertungEventHandlers !== 'undefined') auswertungEventHandlers.attachAuswertungEventListeners(containerId);
        },
        attachStatistikEventListeners: (containerId) => {
            if (typeof statistikEventHandlers !== 'undefined') statistikEventHandlers.attachStatistikEventListeners(containerId);
        },
        attachPraesentationEventListeners: (containerId) => {
            if (typeof praesentationEventHandlers !== 'undefined') praesentationEventHandlers.attachPraesentationEventListeners(containerId);
        },
        attachPublikationEventListeners: (containerId) => {
            if (typeof publikationEventHandlers !== 'undefined') publikationEventHandlers.attachPublikationEventListeners(containerId);
        },
        attachGeneralEventListeners: () => {
            if (typeof generalEventHandlers !== 'undefined') generalEventHandlers.attachGeneralEventListeners();
        }
    });

    function _showLoadingOverlay(message = 'Lade...') {
        const overlay = document.getElementById('loading-overlay');
        const msgElement = document.getElementById('loading-message');
        if (overlay) overlay.style.display = 'flex';
        if (msgElement) msgElement.textContent = message;
    }

    function _hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    function _initializeModules() {
        _showLoadingOverlay('Initialisiere Module...');
        console.log("main.js: Initialisiere Module...");
        
        if (typeof state === 'undefined') throw new Error("State Modul nicht gefunden.");
        state.initialize(_mainAppInterface);
        console.log("main.js: State Modul initialisiert.");

        if (typeof dataProcessor === 'undefined') throw new Error("DataProcessor Modul nicht gefunden.");
        dataProcessor.initialize();
        console.log("main.js: DataProcessor Modul initialisiert.");
        
        if (typeof t2CriteriaManager === 'undefined') throw new Error("T2CriteriaManager Modul nicht gefunden.");
        t2CriteriaManager.initialize(_mainAppInterface);
        console.log("main.js: T2CriteriaManager Modul initialisiert.");

        if (typeof studyT2CriteriaManager === 'undefined') throw new Error("StudyT2CriteriaManager Modul nicht gefunden.");
        studyT2CriteriaManager.initialize(APP_CONFIG.LITERATURE_T2_CRITERIA_SETS);
        console.log("main.js: StudyT2CriteriaManager Modul initialisiert.");

        if (typeof statisticsService === 'undefined') throw new Error("StatisticsService Modul nicht gefunden.");
        statisticsService.initialize();
        console.log("main.js: StatisticsService Modul initialisiert.");
        
        if (typeof bruteForceManager === 'undefined') throw new Error("BruteForceManager Modul nicht gefunden.");
        bruteForceManager.initialize(_mainAppInterface);
        console.log("main.js: BruteForceManager Modul initialisiert.");

        if (typeof exportService === 'undefined') throw new Error("ExportService Modul nicht gefunden.");
        exportService.initialize(_mainAppInterface);
        console.log("main.js: ExportService Modul initialisiert.");

        if (typeof dataTabLogic === 'undefined') throw new Error("DataTabLogic Modul nicht gefunden.");
        dataTabLogic.initialize(_mainAppInterface);
        console.log("main.js: DataTabLogic Modul initialisiert.");

        if (typeof auswertungTabLogic === 'undefined') throw new Error("AuswertungTabLogic Modul nicht gefunden.");
        auswertungTabLogic.initialize(_mainAppInterface);
        console.log("main.js: AuswertungTabLogic Modul initialisiert.");
        
        if (typeof statistikTabLogic === 'undefined') throw new Error("StatistikTabLogic Modul nicht gefunden.");
        statistikTabLogic.initialize(_mainAppInterface);
        console.log("main.js: StatistikTabLogic Modul initialisiert.");

        if (typeof praesentationTabLogic === 'undefined') throw new Error("PraesentationTabLogic Modul nicht gefunden.");
        praesentationTabLogic.initialize(_mainAppInterface);
        console.log("main.js: PraesentationTabLogic Modul initialisiert.");
        
        if (typeof publicationTabLogic === 'undefined') throw new Error("PublicationTabLogic Modul nicht gefunden.");
        publicationTabLogic.initialize(_mainAppInterface);
        console.log("main.js: PublicationTabLogic Modul initialisiert.");

        if (typeof exportTabLogic === 'undefined') throw new Error("ExportTabLogic Modul nicht gefunden.");
        exportTabLogic.initialize(_mainAppInterface);
        console.log("main.js: ExportTabLogic Modul initialisiert.");

        if (typeof viewRenderer === 'undefined') throw new Error("ViewRenderer Modul nicht gefunden.");
        viewRenderer.initializeViewRenderer();
        console.log("main.js: ViewRenderer Modul initialisiert.");

        if (typeof generalEventHandlers === 'undefined') throw new Error("GeneralEventHandlers Modul nicht gefunden.");
        generalEventHandlers.initialize(_mainAppInterface);
        console.log("main.js: GeneralEventHandlers Modul initialisiert.");
        
        if (typeof dataEventHandlers === 'undefined') throw new Error("DataEventHandlers Modul nicht gefunden.");
        dataEventHandlers.initialize(_mainAppInterface);
        console.log("main.js: DataEventHandlers Modul initialisiert.");
        
        if (typeof auswertungEventHandlers === 'undefined') throw new Error("AuswertungEventHandlers Modul nicht gefunden.");
        auswertungEventHandlers.initialize(_mainAppInterface);
        console.log("main.js: AuswertungEventHandlers Modul initialisiert.");
        
        if (typeof statistikEventHandlers === 'undefined') throw new Error("StatistikEventHandlers Modul nicht gefunden.");
        statistikEventHandlers.initialize(_mainAppInterface);
        console.log("main.js: StatistikEventHandlers Modul initialisiert.");
        
        if (typeof praesentationEventHandlers === 'undefined') throw new Error("PraesentationEventHandlers Modul nicht gefunden.");
        praesentationEventHandlers.initialize(_mainAppInterface);
        console.log("main.js: PraesentationEventHandlers Modul initialisiert.");
        
        if (typeof publikationEventHandlers === 'undefined') throw new Error("PublikationEventHandlers Modul nicht gefunden.");
        publikationEventHandlers.initialize(_mainAppInterface);
        console.log("main.js: PublikationEventHandlers Modul initialisiert.");

        console.log("main.js: Alle Module erfolgreich initialisiert.");
    }

    function _updateHeaderStats() {
        if (typeof state === 'undefined' || typeof ui_helpers === 'undefined') return;
        const snapshot = state.getStateSnapshot();
        ui_helpers.updateHeaderStats(snapshot.headerStats);
    }
    
    function _updateKollektivButtonsUI() {
        if (typeof state === 'undefined' || typeof ui_helpers === 'undefined') return;
        const currentKollektiv = state.getCurrentKollektiv();
        ui_helpers.updateKollektivButtons(currentKollektiv);
    }

    function _handleKollektivChange(event) {
        if (!event.target.dataset.kollektiv || typeof state === 'undefined') return;
        const newKollektiv = event.target.dataset.kollektiv;
        state.setCurrentKollektiv(newKollektiv);
    }

    function _handleTabChange(event) {
        if (typeof state === 'undefined') return;
        let newTabId;
        if (event && event.target && event.target.id) {
            newTabId = event.target.id;
        } else {
            const activeTabEl = document.querySelector('#main-tabs .nav-link.active');
            newTabId = activeTabEl ? activeTabEl.id : (APP_CONFIG.DEFAULT_SETTINGS.DEFAULT_TAB_ID || 'daten-tab');
        }
        
        const previousTabId = state.getCurrentTabId();
        if (newTabId !== previousTabId) {
            state.setCurrentTabId(newTabId);
            console.log(`main.js: Tab gewechselt von ${previousTabId} zu ${newTabId}`);
        } else if (event) { 
             _refreshCurrentTab(); 
        }
    }

    function _refreshCurrentTab(forceFullRender = false) {
        _showLoadingOverlay('Lade Tab-Inhalt...');
        console.log("main.js: _refreshCurrentTab aufgerufen.");
        if (typeof state === 'undefined' || typeof viewRenderer === 'undefined') {
            console.error("main.js: State oder ViewRenderer nicht verfügbar für Tab-Refresh.");
             _hideLoadingOverlay();
            return;
        }
        const activeTabId = state.getCurrentTabId();
        const stateSnapshot = state.getStateSnapshot();
        
        console.log(`main.js: Rendere Tab-Inhalt für ${activeTabId}`);
        viewRenderer.renderTabContent(activeTabId, stateSnapshot, _mainAppInterface, forceFullRender);
        
        _attachTabEventListeners(activeTabId);
        _hideLoadingOverlay();
        console.log(`main.js: Tab ${activeTabId} erfolgreich aktualisiert und EventListener angehängt.`);
    }

    function _attachTabEventListeners(activeTabId) {
        console.log(`main.js: Hänge Event-Listener für Tab ${activeTabId} an.`);
        const tabPaneId = `${activeTabId}-pane`;
        
        switch (activeTabId) {
            case 'daten-tab':
                if (typeof dataEventHandlers !== 'undefined' && dataEventHandlers.attachDataEventListeners) {
                    dataEventHandlers.attachDataEventListeners(tabPaneId);
                }
                break;
            case 'auswertung-tab':
                if (typeof auswertungEventHandlers !== 'undefined' && auswertungEventHandlers.attachAuswertungEventListeners) {
                    auswertungEventHandlers.attachAuswertungEventListeners(tabPaneId);
                }
                break;
            case 'statistik-tab':
                 if (typeof statistikEventHandlers !== 'undefined' && statistikEventHandlers.attachStatistikEventListeners) {
                    statistikEventHandlers.attachStatistikEventListeners(tabPaneId);
                }
                break;
            case 'praesentation-tab':
                 if (typeof praesentationEventHandlers !== 'undefined' && praesentationEventHandlers.attachPraesentationEventListeners) {
                    praesentationEventHandlers.attachPraesentationEventListeners(tabPaneId);
                }
                break;
            case 'publikation-tab':
                 if (typeof publikationEventHandlers !== 'undefined' && publikationEventHandlers.attachPublikationEventListeners) {
                    publikationEventHandlers.attachPublikationEventListeners(tabPaneId);
                }
                break;
            case 'export-tab':
                break;
            default:
                console.warn(`main.js: Keine spezifischen Event-Listener für Tab ${activeTabId} definiert.`);
        }
    }
    
    function _initializeGlobalEventListeners() {
        const kollektivButtons = document.querySelectorAll('.btn-group[aria-label="Kollektiv Auswahl"] button');
        kollektivButtons.forEach(button => {
            button.addEventListener('click', _handleKollektivChange);
        });

        const tabElements = document.querySelectorAll('#main-tabs .nav-link');
        tabElements.forEach(tabEl => {
            tabEl.addEventListener('shown.bs.tab', _handleTabChange);
        });
        console.log("main.js: Globale Event-Listener (Kollektiv, Tabs) initialisiert.");
    }

    function _initializeAppUI() {
        if (typeof state === 'undefined' || typeof ui_helpers === 'undefined' || typeof generalEventHandlers === 'undefined') {
            console.error("main.js: Kritische UI-Module (State, UI Helpers, GeneralEventHandlers) nicht verfügbar für UI-Initialisierung.");
            return;
        }
        
        _updateKollektivButtonsUI();
        _updateHeaderStats();

        state.subscribe(_refreshCurrentTab);
        state.subscribe(_updateHeaderStats);
        console.log("main.js: _refreshCurrentTab und _updateHeaderStats für State-Änderungen subskribiert.");

        _initializeGlobalEventListeners();
        generalEventHandlers.attachGeneralEventListeners();

        const initialTabEl = document.querySelector(`#main-tabs .nav-link[data-bs-target="#${state.getCurrentTabId()}-pane"]`) || document.getElementById(APP_CONFIG.DEFAULT_SETTINGS.DEFAULT_TAB_ID || 'daten-tab');
        if (initialTabEl) {
            const tabInstance = bootstrap.Tab.getInstance(initialTabEl) || new bootstrap.Tab(initialTabEl);
            tabInstance.show();
            _handleTabChange({target: initialTabEl}); // Manually trigger for the first load
        } else {
            _handleTabChange(); // Fallback to load default if specific initial tab not found
        }
        _isAppInitialized = true;
        console.log(`main.js: Anwendung initialisiert. Aktives Kollektiv: ${state.getCurrentKollektiv()}, Aktiver Tab: ${state.getCurrentTabId()}`);
    }

    function _loadInitialData() {
        _showLoadingOverlay('Lade Rohdaten...');
        console.log("main.js: Lade Rohdaten...");
        if (typeof window.PATIENT_DATA !== 'undefined') {
            _rawData = cloneDeep(window.PATIENT_DATA);
            if (typeof state !== 'undefined') {
                state.setRawData(_rawData);
            }
            console.log(`main.js: ${_rawData.length} Rohdatensätze geladen.`);
        } else {
            console.error("main.js: PATIENT_DATA nicht gefunden. Stellen Sie sicher, dass data.js geladen wurde und PATIENT_DATA global verfügbar ist.");
            _mainAppInterface.showToast("Fehler: Patientendaten konnten nicht geladen werden!", "error", 0);
            _hideLoadingOverlay();
            return false;
        }
        return true;
    }

    function initializeApp() {
        console.log(`main.js: Initialisiere Lymphknoten T2 - Avocado Sign Analyse v${APP_CONFIG.APP_VERSION}...`);
        document.addEventListener('DOMContentLoaded', () => {
             _showLoadingOverlay('Anwendung wird gestartet...');
            try {
                _initializeModules();
                if (_loadInitialData()) {
                    _initializeAppUI();
                }
            } catch (error) {
                console.error("Kritischer Fehler während der Anwendungsinitialisierung:", error.message, error.stack);
                _mainAppInterface.showToast(`Kritischer Initialisierungsfehler: ${error.message}. App möglicherweise nicht funktionsfähig.`, "error", 0);
            } finally {
                _hideLoadingOverlay();
            }
        });
    }

    return Object.freeze({
        initializeApp,
        getInterface: () => _mainAppInterface 
    });

})();

main.initializeApp();
