const mainAppInterface = (() => {
    let _globalData = {
        rawData: [],
        processedData: [],
        filteredData: [],
        currentKollektiv: null
    };
    let _activeTabId = null;
    let _isLoading = false;
    let _isInitialized = false;

    function _showLoadingOverlay(message = 'Lade Anwendung...') {
        _isLoading = true;
        const overlay = document.getElementById('loading-overlay');
        const messageElement = document.getElementById('loading-message');
        if (overlay) overlay.style.display = 'flex';
        if (messageElement) messageElement.textContent = message;
    }

    function _hideLoadingOverlay() {
        _isLoading = false;
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    function _initializeData() {
        _showLoadingOverlay('Lade Patientendaten...');
        try {
            if (typeof patientDataRaw !== 'undefined' && Array.isArray(patientDataRaw)) {
                _globalData.rawData = cloneDeep(patientDataRaw);
                _globalData.processedData = dataProcessor.processRawData(_globalData.rawData);
                _globalData.currentKollektiv = state.getCurrentKollektiv();
                _globalData.filteredData = dataProcessor.filterDataByKollektiv(_globalData.processedData, _globalData.currentKollektiv);
            } else {
                throw new Error("Globale Variable 'patientDataRaw' nicht gefunden oder ist kein Array.");
            }
        } catch (error) {
            console.error("Fehler beim Initialisieren der Daten:", error);
            ui_helpers.showToast("Fehler beim Laden der Patientendaten.", "danger");
            _globalData.rawData = []; _globalData.processedData = []; _globalData.filteredData = [];
        }
    }

    function _initializeGlobalState() {
        try {
            if (typeof state !== 'undefined' && typeof state.initialize === 'function') {
                state.initialize();
                _activeTabId = state.getActiveTabId();
                _globalData.currentKollektiv = state.getCurrentKollektiv();
            } else {
                throw new Error("State Modul oder state.initialize ist nicht verfügbar.");
            }
        } catch (error) {
            console.error("Schwerwiegender Fehler bei der State-Initialisierung:", error);
            _activeTabId = APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB_ID || 'daten-tab';
            _globalData.currentKollektiv = APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
            ui_helpers.showToast("Kritischer Fehler: Anwendung konnte nicht korrekt initialisiert werden (State-Modul).", "danger");
        }
    }

    function _initializeUI() {
        const appNameElement = document.getElementById('app-title');
        if (appNameElement) {
            appNameElement.textContent = `${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION}`;
            document.title = `${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION}`;
        }
        ui_helpers.updateKollektivButtonsUI(_globalData.currentKollektiv);
        ui_helpers.updateHeaderStatsUI(dataProcessor.calculateHeaderStats(_globalData.filteredData, _globalData.currentKollektiv));
        ui_helpers.updateExportButtonStates(_activeTabId, bruteForceManager.hasResults(_globalData.currentKollektiv), _globalData.filteredData.length > 0);

        const firstAppStart = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START);
        if (firstAppStart === null || firstAppStart !== APP_CONFIG.APP_VERSION) {
            ui_helpers.showKurzanleitung();
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START, APP_CONFIG.APP_VERSION);
        }

        const initialTabElement = document.querySelector(`.nav-tabs .nav-link[data-bs-target="#${_activeTabId}-pane"]`);
        if (initialTabElement) {
            try {
                 const tab = new bootstrap.Tab(initialTabElement);
                 tab.show();
            } catch (e) {
                 console.error("Fehler beim Initialisieren des Bootstrap Tabs:", e);
                 initialTabElement.classList.add('active');
                 const initialTabPane = document.getElementById(`${_activeTabId}-pane`);
                 if(initialTabPane) initialTabPane.classList.add('show', 'active');
            }
        }
        // _handleTabChange wird nun erst nach vollständiger Initialisierung von ViewRenderer aufgerufen
        // durch das 'shown.bs.tab' Event oder explizit am Ende von initializeApplication, falls nötig.
        // Für den initialen Load rufen wir es hier noch auf, nachdem ViewRenderer initialisiert wurde.
        if (viewRenderer && typeof viewRenderer.renderTabContent === 'function') {
             _handleTabChange(_activeTabId, true);
        } else {
            console.error("ViewRenderer nicht bereit für initialen Tab-Load in _initializeUI.");
        }
    }

    function _initializeEventHandlers() {
        generalEventHandlers.initialize(mainAppInterface);
        dataEventHandlers.initialize(mainAppInterface);
        auswertungEventHandlers.initialize(mainAppInterface);

        if (typeof statistikEventHandlers.initialize === 'function') {
            statistikEventHandlers.initialize(mainAppInterface);
        } else {
            console.warn("statistikEventHandlers.initialize ist nicht definiert. Überspringe Initialisierung.");
        }
        if (typeof praesentationEventHandlers.initialize === 'function') {
            praesentationEventHandlers.initialize(mainAppInterface);
        } else {
            console.warn("praesentationEventHandlers.initialize ist nicht definiert. Überspringe Initialisierung.");
        }
        if (typeof publikationEventHandlers.initialize === 'function') {
            publikationEventHandlers.initialize(mainAppInterface);
        } else {
            console.warn("publikationEventHandlers.initialize ist nicht definiert. Überspringe Initialisierung.");
        }

        document.querySelectorAll('.nav-tabs .nav-link').forEach(tabButton => {
            tabButton.addEventListener('shown.bs.tab', event => { // Geändert zu shown.bs.tab
                const buttonId = event.currentTarget.id;
                if (buttonId) {
                    const newTabId = buttonId;
                    if (_activeTabId !== newTabId || state.getForceTabRefresh()) { // Auch bei forceRefresh handeln
                        _activeTabId = newTabId;
                        state.setActiveTabId(_activeTabId);
                        _handleTabChange(_activeTabId);
                    }
                } else {
                     console.error("Fehlende ID am Tab-Button-Element:", event.currentTarget);
                }
            });
        });

        document.querySelectorAll('button[data-kollektiv]').forEach(button => {
            button.addEventListener('click', event => {
                const newKollektiv = event.currentTarget.getAttribute('data-kollektiv');
                _handleKollektivChange(newKollektiv, event.currentTarget.id);
            });
        });

         const kurzanleitungButton = document.getElementById('show-kurzanleitung-btn');
         if (kurzanleitungButton) {
             kurzanleitungButton.addEventListener('click', () => ui_helpers.showKurzanleitung());
         }
    }

    function _handleTabChange(newTabId, isInitialLoad = false) {
        if (_isLoading && !isInitialLoad && !state.getForceTabRefresh()) {
            console.warn("Tab-Wechsel ignoriert, da die Anwendung bereits lädt.");
            const previousTabId = state.getPreviousTabId() || APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB_ID || 'daten-tab';
            const previousTabElement = document.querySelector(`.nav-tabs .nav-link[data-bs-target="#${previousTabId}-pane"]`);
            if (previousTabElement) {
                 try {
                    const tabInstance = bootstrap.Tab.getInstance(previousTabElement) || new bootstrap.Tab(previousTabElement);
                    tabInstance.show();
                 } catch(e){ console.error("Fehler beim Zurücksetzen des Tabs:", e);}
            }
            return;
        }
        _showLoadingOverlay(`Lade Tab: ${newTabId.replace('-tab','').replace(/^\w/, c => c.toUpperCase())}...`);
        _activeTabId = newTabId;

        const stateSnapshot = {
            rawData: _globalData.rawData,
            currentKollektiv: state.getCurrentKollektiv(),
            appliedT2Criteria: t2CriteriaManager.getAppliedCriteria(),
            appliedT2Logic: t2CriteriaManager.getAppliedLogic(),
            datenSortState: state.getCurrentDatenSortState(),
            auswertungSortState: state.getCurrentAuswertungSortState(),
            bruteForceResults: bruteForceManager.getAllResults(), // Hier das Gesamtobjekt übergeben
            bruteForceState: bruteForceManager.getState(), // aktuellen globalen Brute-Force Status
            statsLayout: state.getCurrentStatsLayout(),
            statsKollektiv1: state.getCurrentStatsKollektiv1(),
            statsKollektiv2: state.getCurrentStatsKollektiv2(),
            praesentationView: state.getCurrentPresentationView(),
            praesentationStudyId: state.getCurrentPresentationStudyId(),
            publikationLang: state.getCurrentPublikationLang(),
            publikationSection: state.getCurrentPublikationSection(),
            publikationBruteForceMetric: state.getCurrentPublikationBruteForceMetric(),
            forceTabRefresh: state.getForceTabRefresh() // Flag weitergeben
        };

        viewRenderer.renderTabContent(newTabId, _globalData.filteredData, stateSnapshot);
        ui_helpers.updateExportButtonStates(newTabId, bruteForceManager.hasResults(state.getCurrentKollektiv()), _globalData.filteredData.length > 0);
    }

    function _handleKollektivChange(newKollektiv, targetButtonId = null) {
        _showLoadingOverlay(`Filtere Kollektiv: ${getKollektivDisplayName(newKollektiv)}...`);
        state.setCurrentKollektiv(newKollektiv);
        _globalData.currentKollektiv = newKollektiv;
        _globalData.processedData = dataProcessor.processRawData(_globalData.rawData);
        _globalData.filteredData = dataProcessor.filterDataByKollektiv(_globalData.processedData, _globalData.currentKollektiv);

        const currentAppliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
        const currentAppliedT2Logic = t2CriteriaManager.getAppliedLogic();
        _globalData.filteredData = t2CriteriaManager.evaluateDataset(cloneDeep(_globalData.filteredData), currentAppliedT2Criteria, currentAppliedT2Logic);


        ui_helpers.updateKollektivButtonsUI(newKollektiv);
        if(targetButtonId) ui_helpers.highlightElement(targetButtonId);

        ui_helpers.updateHeaderStatsUI(dataProcessor.calculateHeaderStats(_globalData.filteredData, newKollektiv));

        state.setForceTabRefresh(true); // Erzwinge Refresh des aktuellen Tabs
        refreshCurrentTab(true); // Ruft _handleTabChange indirekt mit forceTabRefresh = true auf
    }


    function _handleBruteForceStart(payload) {
        state.setBruteForceState('start');
        ui_helpers.updateBruteForceUI('start', payload, bruteForceManager.isWorkerAvailable(), state.getCurrentKollektiv());
    }
    function _handleBruteForceStarted(payload) {
        state.setBruteForceState('started');
        ui_helpers.updateBruteForceUI('started', payload, bruteForceManager.isWorkerAvailable(), state.getCurrentKollektiv());
    }
    function _handleBruteForceProgress(payload) {
         if (state.getBruteForceState() !== 'progress' && state.getBruteForceState() !== 'started') { state.setBruteForceState('progress'); }
        ui_helpers.updateBruteForceUI('progress', payload, bruteForceManager.isWorkerAvailable(), state.getCurrentKollektiv());
    }
    function _handleBruteForceResult(payload) {
        state.setBruteForceState('result');
        ui_helpers.updateBruteForceUI('result', payload, bruteForceManager.isWorkerAvailable(), state.getCurrentKollektiv());
        ui_helpers.updateExportButtonStates(_activeTabId, true, _globalData.filteredData.length > 0);
        if (_activeTabId === 'auswertung-tab' || _activeTabId === 'publikation-tab' || _activeTabId === 'export-tab') {
            state.setForceTabRefresh(true); // Erzwinge Refresh, um neue BF-Daten zu zeigen
            refreshCurrentTab(true);
        }
        ui_helpers.showToast(`Brute-Force Optimierung für Kollektiv '${getKollektivDisplayName(payload.kollektiv)}' abgeschlossen.`, 'success');
    }
    function _handleBruteForceError(payload) {
        state.setBruteForceState('error');
        ui_helpers.updateBruteForceUI('error', payload, bruteForceManager.isWorkerAvailable(), state.getCurrentKollektiv());
        ui_helpers.showToast(`Fehler bei Brute-Force: ${payload.message}`, 'danger');
    }
    function _handleBruteForceCancelled(payload) {
        state.setBruteForceState('cancelled');
        ui_helpers.updateBruteForceUI('cancelled', payload, bruteForceManager.isWorkerAvailable(), state.getCurrentKollektiv());
        ui_helpers.showToast("Brute-Force Optimierung abgebrochen.", "info");
    }

    function initializeApplication() {
        if (_isInitialized) { console.warn("Anwendung bereits initialisiert."); return; }
        _showLoadingOverlay('Initialisiere Anwendung...');
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                _initializeGlobalState(); // State zuerst, um Defaults zu haben
                _initializeData(); // Dann Daten laden

                // Module initialisieren, die vom State oder den Rohdaten abhängen
                t2CriteriaManager.initialize();
                studyT2CriteriaManager.initialize();

                // ViewRenderer initialisieren, bevor die UI-Logik den ersten Tab rendert
                if (typeof viewRenderer !== 'undefined' && typeof viewRenderer.initialize === 'function') {
                    viewRenderer.initialize(mainAppInterface);
                } else {
                     console.error("ViewRenderer konnte nicht initialisiert werden.");
                }


                await bruteForceManager.initialize({
                    onStart: _handleBruteForceStart,
                    onStarted: _handleBruteForceStarted,
                    onProgress: _handleBruteForceProgress,
                    onResult: _handleBruteForceResult,
                    onError: _handleBruteForceError,
                    onCancelled: _handleBruteForceCancelled
                });

                _initializeEventHandlers(); // Event Handler nach den Modulen, aber vor _initializeUI, das Events auslösen kann
                _initializeUI(); // UI initialisieren und ersten Tab rendern

                _isInitialized = true;
                 console.log(`${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION} initialisiert. Aktives Kollektiv: ${getKollektivDisplayName(_globalData.currentKollektiv)}, Aktiver Tab: ${_activeTabId}`);

            } catch (error) {
                console.error("Schwerwiegender Fehler während der Anwendungsinitialisierung:", error);
                const overlay = document.getElementById('loading-overlay');
                const messageElement = document.getElementById('loading-message');
                if (messageElement) messageElement.innerHTML = `<span class="text-danger">Kritischer Fehler bei der Initialisierung!</span><br><small>${error.message}</small><br><small>Bitte versuchen Sie, die Seite neu zu laden oder prüfen Sie die Browser-Konsole.</small>`;
                if (overlay) overlay.style.display = 'flex';
            } finally {
                // _hideLoadingOverlay wird nun durch renderTabContent gesteuert
                 if(!_isLoading && _isInitialized) _hideLoadingOverlay(); // Nur wenn kein Tab-Laden aktiv ist
            }
        });
    }

    function refreshCurrentTab(forceDataRefresh = false) {
        // Wenn forceDataRefresh explizit true ist, setze das State-Flag, damit _handleTabChange es sieht
        if (forceDataRefresh && typeof state !== 'undefined' && typeof state.setForceTabRefresh === 'function') {
            state.setForceTabRefresh(true);
        }

        if (!_activeTabId || (_isLoading && !state.getForceTabRefresh())) {
            if(_isLoading) console.warn("RefreshCurrentTab ignoriert oder verzögert, da Anwendung bereits lädt und kein Force-Refresh aktiv ist.");
            if (!_activeTabId) return;
            if (_isLoading && !state.getForceTabRefresh()) return;
        }
        // _handleTabChange wird nun aufgerufen, auch wenn _activeTabId === newTabId (was hier der Fall ist),
        // wenn state.getForceTabRefresh() true ist (siehe Logik im 'shown.bs.tab' Handler und _handleTabChange).
        // Ein direkter Aufruf von _handleTabChange hier ist richtig.
        _handleTabChange(_activeTabId);
    }

    function notifyDataProcessingChange() {
        _globalData.processedData = dataProcessor.processRawData(_globalData.rawData);
        _globalData.filteredData = dataProcessor.filterDataByKollektiv(_globalData.processedData, state.getCurrentKollektiv());
        _globalData.filteredData = t2CriteriaManager.evaluateDataset(cloneDeep(_globalData.filteredData), t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
        ui_helpers.updateHeaderStatsUI(dataProcessor.calculateHeaderStats(_globalData.filteredData, state.getCurrentKollektiv()));
        ui_helpers.markCriteriaSavedIndicator(false); // Indikator zurücksetzen
        
        // Datenstati für alle relevanten Tab-Logiken auf "stale" setzen
        if(typeof auswertungTabLogic !== 'undefined' && typeof auswertungTabLogic.setDataStale === 'function') auswertungTabLogic.setDataStale();
        if(typeof statistikTabLogic !== 'undefined' && typeof statistikTabLogic.setDataStale === 'function') statistikTabLogic.setDataStale();
        if(typeof praesentationTabLogic !== 'undefined' && typeof praesentationTabLogic.setDataStale === 'function') praesentationTabLogic.setDataStale();
        if(typeof publicationTabLogic !== 'undefined' && typeof publicationTabLogic.setDataStale === 'function') publicationTabLogic.setDataStale();
        if(typeof exportTabLogic !== 'undefined' && typeof exportTabLogic.setDataStale === 'function') exportTabLogic.setDataStale();

        state.setForceTabRefresh(true); // Erzwingt Neuladen des aktuellen Tabs, um Änderungen zu reflektieren
        refreshCurrentTab(true); // Explizit true, um state.setForceTabRefresh zu setzen und _handleTabChange zu triggern
    }
    
    function updateGlobalUIState() {
        // Diese Funktion könnte verwendet werden, um UI-Elemente zu aktualisieren, die nicht direkt Teil eines Tabs sind,
        // aber vom globalen State abhängen, z.B. Header-Infos, globale Buttons.
        // Momentan wird das meiste davon in _handleKollektivChange oder beim Tab-Wechsel gehandhabt.
        // Fürs Erste lassen wir sie leer oder fügen spezifische Aufrufe hinzu, falls nötig.
        ui_helpers.updateKollektivButtonsUI(state.getCurrentKollektiv());
        // ui_helpers.updateStatistikSelectorsUI(...); // Beispiel, falls dies global relevant wäre
    }


    return Object.freeze({
        initializeApplication,
        refreshCurrentTab,
        showLoadingOverlay: _showLoadingOverlay,
        hideLoadingOverlay: _hideLoadingOverlay,
        getGlobalData: () => cloneDeep(_globalData),
        getActiveTabId: () => _activeTabId,
        notifyDataProcessingChange,
        updateGlobalUIState // Exportiert, falls von Event Handlern benötigt
    });

})();

mainAppInterface.initializeApplication();
