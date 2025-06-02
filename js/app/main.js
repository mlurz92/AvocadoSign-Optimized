const main = (() => {
    let _rawData = [];
    let _isAppInitialized = false;
    let _currentSortStateDaten = { key: 'nr', direction: 'asc', subKey: null };
    let _currentSortStateAuswertung = { key: 'nr', direction: 'asc', subKey: null };

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
            if (typeof publicationTabLogic === 'undefined' || !publicationTabLogic.isInitialized()) {
                 console.warn("mainAppInterface.getPublicationStats: publicationTabLogic nicht bereit.");
                 return null;
            }
            return publicationTabLogic.getFullPublicationStats();
        },
        getPraesentationData: () => {
             if (typeof praesentationTabLogic === 'undefined' || !praesentationTabLogic.isInitialized() || typeof state === 'undefined') {
                 console.warn("mainAppInterface.getPraesentationData: praesentationTabLogic oder state nicht bereit.");
                 return { asPur: null, asVsT2: null};
             }
             const currentView = state.getCurrentPresentationView();
             const internalData = praesentationTabLogic._praesentationData;

             return {
                 asPur: (internalData && currentView === 'as-pur') ? internalData : (typeof praesentationTabLogic._prepareDatenAsPur === 'function' ? praesentationTabLogic._prepareDatenAsPur() : null),
                 asVsT2: (internalData && currentView === 'as-vs-t2') ? internalData : (typeof praesentationTabLogic._prepareDatenAsVsT2 === 'function' ? praesentationTabLogic._prepareDatenAsVsT2() : null)
             };
        },
        refreshCurrentTab: (forceFullRender = false, newSortState = null) => {
            if (newSortState) {
                const currentTabId = state.getCurrentTabId();
                if (currentTabId === 'daten-tab') {
                    _currentSortStateDaten = newSortState;
                     if (typeof state !== 'undefined' && typeof state.setCurrentDatenSortState === 'function') {
                        state.setCurrentDatenSortState(newSortState);
                    }
                } else if (currentTabId === 'auswertung-tab') {
                    _currentSortStateAuswertung = newSortState;
                    if (typeof state !== 'undefined' && typeof state.setCurrentAuswertungSortState === 'function') {
                        state.setCurrentAuswertungSortState(newSortState);
                    }
                }
            }
            _refreshCurrentTab(forceFullRender);
        },
        showToast: (message, type = 'info', duration = 3000) => {
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showToast === 'function') {
                 ui_helpers.showToast(message, type, duration);
            }
        },
        updateBruteForceUI: (status, data, isWorkerAvailable, kollektiv, uiUpdatePayload = null) => {
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.updateBruteForceUI === 'function') {
                const payloadForUI = uiUpdatePayload || data;
                ui_helpers.updateBruteForceUI(status, payloadForUI, isWorkerAvailable, kollektiv);
            }
        },
        setBruteForceResults: (results) => {
            if (typeof state !== 'undefined' && typeof state.setBruteForceResults === 'function') {
                state.setBruteForceResults(results);
            }
        },
        setBruteForceStatus: (status, details) => {
             if (typeof state !== 'undefined' && typeof state.setBruteForceStatus === 'function') {
                 state.setBruteForceStatus(status, details);
            }
        },
        clearBruteForceResults: (kollektivId) => {
            if (typeof state !== 'undefined' && typeof state.clearBruteForceResults === 'function') {
                state.clearBruteForceResults(kollektivId);
            }
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
        studyT2CriteriaManager.initialize();
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
        viewRenderer.initialize(_mainAppInterface);
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
        const headerStatsFormatted = {
            kollektiv: getKollektivDisplayName(snapshot.currentKollektiv),
            anzahlPatienten: snapshot.headerStats.anzahlPatienten,
            statusN: `${snapshot.headerStats.nPatho.pos} / ${snapshot.headerStats.nPatho.neg}`,
            statusAS: `${snapshot.headerStats.asStatus.pos} / ${snapshot.headerStats.asStatus.neg}`,
            statusT2: `${snapshot.headerStats.t2Status.pos} / ${snapshot.headerStats.t2Status.neg}`
        };
        ui_helpers.updateHeaderStatsUI(headerStatsFormatted);
    }

    function _updateKollektivButtonsUI() {
        if (typeof state === 'undefined' || typeof ui_helpers === 'undefined') return;
        const currentKollektiv = state.getCurrentKollektiv();
        ui_helpers.updateKollektivButtonsUI(currentKollektiv);
    }

    function _handleKollektivChange(event) {
        if (!event.target.dataset.kollektiv || typeof state === 'undefined') return;
        _showLoadingOverlay('Wechsle Kollektiv...');
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
            newTabId = activeTabEl ? activeTabEl.id : (state.getStateSnapshot().appConfig.DEFAULT_SETTINGS.DEFAULT_TAB_ID || 'daten-tab');
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
        if (typeof state === 'undefined' || typeof viewRenderer === 'undefined' || typeof t2CriteriaManager === 'undefined') {
            console.error("main.js: State, ViewRenderer oder T2CriteriaManager nicht verfügbar für Tab-Refresh.");
             _hideLoadingOverlay();
            return;
        }
        const activeTabId = state.getCurrentTabId();
        const stateSnapshot = state.getStateSnapshot();
        const filteredData = _mainAppInterface.getFilteredData(stateSnapshot.currentKollektiv);

        let processedDataForTab;
        if (activeTabId === 'daten-tab' || activeTabId === 'auswertung-tab') {
             processedDataForTab = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), stateSnapshot.appliedT2Criteria, stateSnapshot.appliedT2Logic);
        } else {
             processedDataForTab = filteredData;
        }

        console.log(`main.js: Rendere Tab-Inhalt für ${activeTabId}`);
        viewRenderer.renderTabContent(activeTabId, processedDataForTab, stateSnapshot);

        _attachTabEventListeners(activeTabId);

        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.updateExportButtonStates === 'function') {
            const bfManager = _mainAppInterface.getBruteForceManager();
            const hasBruteForceData = bfManager && typeof bfManager.hasResults === 'function' ? bfManager.hasResults(stateSnapshot.currentKollektiv) : false;
            const canExportData = stateSnapshot.rawData && stateSnapshot.rawData.length > 0;
            ui_helpers.updateExportButtonStates(activeTabId, hasBruteForceData, canExportData);
        }
        _hideLoadingOverlay();
        console.log(`main.js: Tab ${activeTabId} erfolgreich aktualisiert und EventListener angehängt.`);
    }

    function _attachTabEventListeners(activeTabId) {
        console.log(`main.js: Hänge Event-Listener für Tab ${activeTabId} an.`);
        const tabPaneId = `${activeTabId}-pane`;

        switch (activeTabId) {
            case 'daten-tab':
                if (typeof dataEventHandlers !== 'undefined' && dataEventHandlers.attachDataEventListeners) {
                }
                break;
            case 'auswertung-tab':
                if (typeof auswertungEventHandlers !== 'undefined' && auswertungEventHandlers.attachAuswertungEventListeners) {
                    auswertungEventHandlers.attachAuswertungEventListeners(tabPaneId);
                }
                break;
            case 'statistik-tab':
                const toggleButton = document.getElementById('statistik-toggle-vergleich');
                const select1 = document.getElementById('statistik-kollektiv-select-1');
                const select2 = document.getElementById('statistik-kollektiv-select-2');
                if (toggleButton) {
                    toggleButton.removeEventListener('click', _handleStatsLayoutToggle);
                    toggleButton.addEventListener('click', _handleStatsLayoutToggle);
                }
                if (select1) {
                     select1.removeEventListener('change', _handleStatistikKollektivChange);
                     select1.addEventListener('change', _handleStatistikKollektivChange);
                }
                if (select2) {
                     select2.removeEventListener('change', _handleStatistikKollektivChange);
                     select2.addEventListener('change', _handleStatistikKollektivChange);
                }
                break;
            case 'praesentation-tab':
                 if (typeof praesentationEventHandlers !== 'undefined' && praesentationEventHandlers.attachPraesentationEventListeners) {
                    praesentationEventHandlers.attachPraesentationEventListeners(tabPaneId);
                }
                break;
            case 'publikation-tab':
                const langSwitch = document.getElementById('publikation-sprache-switch');
                const bfMetricSelectPub = document.getElementById('publikation-bf-metric-select');
                const sectionNavContainer = document.getElementById('publikation-sidebar-nav-container');
                const copyButton = document.getElementById('copy-current-publication-section-md');

                if (langSwitch) {
                    langSwitch.removeEventListener('change', _handlePublikationSpracheChange);
                    langSwitch.addEventListener('change', _handlePublikationSpracheChange);
                }
                if (bfMetricSelectPub) {
                    bfMetricSelectPub.removeEventListener('change', _handlePublikationBfMetricChange);
                    bfMetricSelectPub.addEventListener('change', _handlePublikationBfMetricChange);
                }
                if (sectionNavContainer) {
                    sectionNavContainer.removeEventListener('click', _handlePublikationSectionClick);
                    sectionNavContainer.addEventListener('click', _handlePublikationSectionClick);
                }
                 if (copyButton && typeof publikationEventHandlers !== 'undefined' && typeof publikationEventHandlers.handleCopyCurrentSectionMarkdown === 'function'){
                    copyButton.removeEventListener('click', publikationEventHandlers.handleCopyCurrentSectionMarkdown);
                    copyButton.addEventListener('click', publikationEventHandlers.handleCopyCurrentSectionMarkdown);
                }
                break;
            case 'export-tab':
                const exportButtonContainer = document.getElementById('export-content-area');
                if (exportButtonContainer) {
                    exportButtonContainer.removeEventListener('click', _handleExportButtonClick);
                    exportButtonContainer.addEventListener('click', _handleExportButtonClick);
                }
                break;
            default:
                console.warn(`main.js: Keine spezifischen Event-Listener für Tab ${activeTabId} definiert.`);
        }
    }

    function _handleStatsLayoutToggle(event) {
        if (typeof statistikEventHandlers !== 'undefined' && typeof statistikEventHandlers.handleStatsLayoutToggle === 'function') {
             statistikEventHandlers.handleStatsLayoutToggle(event.currentTarget, _mainAppInterface);
        }
    }
    function _handleStatistikKollektivChange(event) {
        if (typeof statistikEventHandlers !== 'undefined' && typeof statistikEventHandlers.handleStatistikKollektivChange === 'function') {
            statistikEventHandlers.handleStatistikKollektivChange(event.target, _mainAppInterface);
        }
    }
    function _handlePublikationSpracheChange(event) {
        if (typeof publikationEventHandlers !== 'undefined' && typeof publikationEventHandlers.handlePublikationSpracheChange === 'function') {
            publikationEventHandlers.handlePublikationSpracheChange(event.target, _mainAppInterface);
        }
    }
    function _handlePublikationBfMetricChange(event) {
        if (typeof publikationEventHandlers !== 'undefined' && typeof publikationEventHandlers.handlePublikationBfMetricChange === 'function') {
            publikationEventHandlers.handlePublikationBfMetricChange(event.target, _mainAppInterface);
        }
    }
    function _handlePublikationSectionClick(event) {
        const link = event.target.closest('a.publikation-section-link');
        if (link && link.dataset.sectionId && typeof publikationEventHandlers !== 'undefined' && typeof publikationEventHandlers.handlePublikationSectionChange === 'function') {
            event.preventDefault();
            publikationEventHandlers.handlePublikationSectionChange(link.dataset.sectionId, _mainAppInterface);
        }
    }
    function _handleExportButtonClick(event) {
        const button = event.target.closest('button[id^="export-"]');
        if (button && typeof exportService !== 'undefined' && typeof exportService.triggerExport === 'function') {
            const exportType = button.id.substring('export-'.length).toUpperCase().replace(/-/g, '_');
            exportService.triggerExport(exportType);
        }
    }


    function _initializeGlobalEventListeners() {
        const kollektivButtons = document.querySelectorAll('header .btn-group[aria-label="Kollektiv Auswahl"] button');
        kollektivButtons.forEach(button => {
            button.addEventListener('click', _handleKollektivChange);
        });

        const tabElements = document.querySelectorAll('#main-tabs .nav-link');
        tabElements.forEach(tabEl => {
            tabEl.addEventListener('shown.bs.tab', _handleTabChange);
        });

        const kurzanleitungButton = document.getElementById('show-kurzanleitung-btn');
        if (kurzanleitungButton && typeof ui_helpers !== 'undefined' && typeof ui_helpers.showKurzanleitung === 'function') {
            kurzanleitungButton.addEventListener('click', ui_helpers.showKurzanleitung);
        }
        if (typeof generalEventHandlers !== 'undefined' && typeof generalEventHandlers.initialize === 'function') {
            generalEventHandlers.initialize(_mainAppInterface);
        }

        console.log("main.js: Globale Event-Listener (Kollektiv, Tabs, Kurzanleitung) initialisiert.");
    }

    function _initializeAppUI() {
        if (typeof state === 'undefined' || typeof ui_helpers === 'undefined') {
            console.error("main.js: Kritische UI-Module (State, UI Helpers) nicht verfügbar für UI-Initialisierung.");
            return;
        }

        _updateKollektivButtonsUI();
        _updateHeaderStats();

        state.subscribe((changeType) => {
            if (changeType === 'currentKollektiv' || changeType === 'appliedT2Criteria' || changeType === 'rawData') {
                _updateHeaderStats();
                _refreshCurrentTab(true);
            } else if (changeType === 'currentTabId' || changeType === 'statistikLayout' || changeType === 'praesentationView' || changeType === 'praesentationStudyId' || changeType === 'publikationLang' || changeType === 'publikationSection' || changeType === 'publikationBruteForceMetric') {
                _refreshCurrentTab();
            } else if (changeType === 'bruteForceResults' || changeType === 'bruteForceStatus') {
                 if (state.getCurrentTabId() === 'auswertung-tab') _refreshCurrentTab();
            }
        });
        console.log("main.js: Listener für State-Änderungen subskribiert.");

        _initializeGlobalEventListeners();

        const initialTabId = state.getCurrentTabId();
        const initialTabEl = document.querySelector(`#main-tabs .nav-link[data-bs-target="#${initialTabId}-pane"]`) || document.getElementById(initialTabId);

        if (initialTabEl) {
            const tabInstance = bootstrap.Tab.getInstance(initialTabEl) || new bootstrap.Tab(initialTabEl);
            tabInstance.show();
            _handleTabChange({target: initialTabEl});
        } else {
             console.warn(`Initial-Tab-Element für ID '${initialTabId}' nicht gefunden. Fallback auf Default-Logik in _handleTabChange.`);
            _handleTabChange();
        }
        _isAppInitialized = true;
        console.log(`main.js: Anwendung initialisiert. Aktives Kollektiv: ${state.getCurrentKollektiv()}, Aktiver Tab: ${state.getCurrentTabId()}`);

        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showKurzanleitung === 'function') {
            const appConfigForKurzanleitung = state.getStateSnapshot().appConfig;
            if (!loadFromLocalStorage(`${appConfigForKurzanleitung.STORAGE_PREFIX}.kurzanleitungGesehen`)) {
                ui_helpers.showKurzanleitung();
                saveToLocalStorage(`${appConfigForKurzanleitung.STORAGE_PREFIX}.kurzanleitungGesehen`, true);
            }
        }
    }

    function _loadInitialData() {
        _showLoadingOverlay('Lade Rohdaten...');
        console.log("main.js: Lade Rohdaten...");
        if (typeof patientDataRaw !== 'undefined') {
            _rawData = cloneDeep(patientDataRaw);
            if (typeof state !== 'undefined') {
                state.setRawData(_rawData);
            }
            console.log(`main.js: ${_rawData.length} Rohdatensätze geladen.`);
        } else {
            console.error("main.js: patientDataRaw nicht gefunden. Stellen Sie sicher, dass data.js geladen wurde und patientDataRaw global verfügbar ist.");
            _mainAppInterface.showToast("Fehler: Patientendaten konnten nicht geladen werden!", "error", 0);
            _hideLoadingOverlay();
            return false;
        }
        return true;
    }

    function initializeApp() {
        const appConfigGlobal = (typeof APP_CONFIG !== 'undefined') ? APP_CONFIG : { APP_VERSION: "N/A", STORAGE_PREFIX: "avocadoSignTool", DEFAULT_SETTINGS: {DEFAULT_TAB_ID: "daten-tab"} };
        console.log(`main.js: Initialisiere ${appConfigGlobal.APP_NAME} v${appConfigGlobal.APP_VERSION}...`);
        document.addEventListener('DOMContentLoaded', () => {
             _showLoadingOverlay('Anwendung wird gestartet...');
            try {
                _initializeModules();
                if (_loadInitialData()) {
                    _initializeAppUI();
                }
            } catch (error) {
                console.error("Kritischer Fehler während der Anwendungsinitialisierung:", error.message, error.stack);
                if(_mainAppInterface && typeof _mainAppInterface.showToast === 'function'){
                    _mainAppInterface.showToast(`Kritischer Initialisierungsfehler: ${error.message}. App möglicherweise nicht funktionsfähig.`, "error", 0);
                } else {
                    alert(`Kritischer Initialisierungsfehler: ${error.message}. App möglicherweise nicht funktionsfähig.`);
                }
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
