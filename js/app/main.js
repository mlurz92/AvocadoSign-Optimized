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
                _globalData.currentKollektiv = state.getCurrentKollektiv(); // State sollte hier initialisiert sein
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
        // Der Aufruf state.initialize() ist hier kritisch. 
        // state.js muss korrekt geladen sein und initialize als Methode exportieren.
        try {
            if (typeof state !== 'undefined' && typeof state.initialize === 'function') {
                state.initialize();
                _activeTabId = state.getActiveTabId(); // Nach Initialisierung des States abrufen
                _globalData.currentKollektiv = state.getCurrentKollektiv();
            } else {
                throw new Error("State Modul oder state.initialize ist nicht verfügbar.");
            }
        } catch (error) {
            console.error("Schwerwiegender Fehler bei der State-Initialisierung:", error);
            _activeTabId = APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB_ID || 'daten-tab'; // Fallback
            _globalData.currentKollektiv = APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV; // Fallback
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

        const initialTabElement = document.querySelector(`.nav-tabs .nav-link[href="#${_activeTabId}-pane"]`);
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
        _handleTabChange(_activeTabId, true);
    }

    function _initializeEventHandlers() {
        generalEventHandlers.initialize(mainAppInterface);
        auswertungEventHandlers.initialize(mainAppInterface);
        statistikEventHandlers.initialize(mainAppInterface);
        praesentationEventHandlers.initialize(mainAppInterface);
        publikationEventHandlers.initialize(mainAppInterface);
        dataEventHandlers.initialize(mainAppInterface);


        document.querySelectorAll('.nav-tabs .nav-link').forEach(tab => {
            tab.addEventListener('show.bs.tab', event => {
                const newTabId = event.target.getAttribute('href').substring(1).replace('-pane', '');
                if (_activeTabId !== newTabId) { 
                    _activeTabId = newTabId;
                    state.setActiveTabId(_activeTabId); // Zustand aktualisieren
                    _handleTabChange(_activeTabId);
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
        if (_isLoading && !isInitialLoad) {
            console.warn("Tab-Wechsel ignoriert, da die Anwendung bereits lädt.");
            const previousTabId = state.getPreviousTabId() || APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB_ID || 'daten-tab';
            const previousTabElement = document.querySelector(`.nav-tabs .nav-link[href="#${previousTabId}-pane"]`);
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
            bruteForceState: bruteForceManager.getState(),
            bruteForceResults: bruteForceManager.getAllResults(),
            statsLayout: state.getCurrentStatsLayout(),
            statsKollektiv1: state.getCurrentStatsKollektiv1(),
            statsKollektiv2: state.getCurrentStatsKollektiv2(),
            praesentationView: state.getCurrentPresentationView(),
            praesentationStudyId: state.getCurrentPresentationStudyId(),
            forceTabRefresh: state.getForceTabRefresh()
        };
        
        viewRenderer.renderTabContent(newTabId, _globalData.processedData, stateSnapshot);
        ui_helpers.updateExportButtonStates(newTabId, bruteForceManager.hasResults(state.getCurrentKollektiv()), _globalData.filteredData.length > 0);
    }

    function _handleKollektivChange(newKollektiv, targetButtonId = null) {
        _showLoadingOverlay(`Filtere Kollektiv: ${getKollektivDisplayName(newKollektiv)}...`);
        state.setCurrentKollektiv(newKollektiv);
        _globalData.currentKollektiv = newKollektiv;
        _globalData.filteredData = dataProcessor.filterDataByKollektiv(_globalData.processedData, newKollektiv);

        ui_helpers.updateKollektivButtonsUI(newKollektiv);
        if(targetButtonId) ui_helpers.highlightElement(targetButtonId);

        ui_helpers.updateHeaderStatsUI(dataProcessor.calculateHeaderStats(_globalData.filteredData, newKollektiv));
        
        if (typeof auswertungTabLogic !== 'undefined') auswertungTabLogic.setDataStale();
        if (typeof statistikTabLogic !== 'undefined') statistikTabLogic.setDataStale();
        if (typeof praesentationTabLogic !== 'undefined') praesentationTabLogic.setDataStale();
        if (typeof publikationTabLogic !== 'undefined') publikationTabLogic.setDataStale();
        
        refreshCurrentTab(true);
        // _hideLoadingOverlay(); // Wird im finally-Block von renderTabContent (aufgerufen durch refreshCurrentTab) erledigt
    }


    function _handleBruteForceStart(payload) {
        state.setBruteForceState('start');
        ui_helpers.updateBruteForceUI('start', payload, true, state.getCurrentKollektiv());
    }
    function _handleBruteForceStarted(payload) {
        state.setBruteForceState('started');
        ui_helpers.updateBruteForceUI('started', payload, true, state.getCurrentKollektiv());
    }
    function _handleBruteForceProgress(payload) {
         if (state.getBruteForceState() !== 'progress' && state.getBruteForceState() !== 'started') { state.setBruteForceState('progress'); }
        ui_helpers.updateBruteForceUI('progress', payload, true, state.getCurrentKollektiv());
    }
    function _handleBruteForceResult(payload) {
        state.setBruteForceState('result');
        ui_helpers.updateBruteForceUI('result', payload, true, state.getCurrentKollektiv());
        ui_helpers.updateExportButtonStates(_activeTabId, true, _globalData.filteredData.length > 0);
        if (_activeTabId === 'auswertung-tab' || _activeTabId === 'publikation-tab') {
             if (typeof publikationTabLogic !== 'undefined') publikationTabLogic.setDataStale();
             if(_activeTabId === 'publikation-tab') refreshCurrentTab(true);
             else if(_activeTabId === 'auswertung-tab' && payload.kollektiv === state.getCurrentKollektiv()) refreshCurrentTab(true);
        }
        ui_helpers.showToast(`Brute-Force Optimierung für Kollektiv '${getKollektivDisplayName(payload.kollektiv)}' abgeschlossen.`, 'success');
    }
    function _handleBruteForceError(payload) {
        state.setBruteForceState('error');
        ui_helpers.updateBruteForceUI('error', payload, true, state.getCurrentKollektiv());
        ui_helpers.showToast(`Fehler bei Brute-Force: ${payload.message}`, 'danger');
    }
    function _handleBruteForceCancelled() {
        state.setBruteForceState('cancelled');
        ui_helpers.updateBruteForceUI('cancelled', {}, true, state.getCurrentKollektiv());
        ui_helpers.showToast("Brute-Force Optimierung abgebrochen.", "info");
    }

    function initializeApplication() {
        if (_isInitialized) { console.warn("Anwendung bereits initialisiert."); return; }
        _showLoadingOverlay('Initialisiere Anwendung...');
        document.addEventListener('DOMContentLoaded', () => {
            try {
                _initializeGlobalState(); // Hier wird state.initialize() aufgerufen
                _initializeData();      // Nutzt den initialisierten State
                
                t2CriteriaManager.initialize(state.getAppliedT2Criteria(), state.getAppliedT2Logic());
                studyT2CriteriaManager.initialize();
                bruteForceManager.initialize({
                    onStart: _handleBruteForceStart,
                    onStarted: _handleBruteForceStarted,
                    onProgress: _handleBruteForceProgress,
                    onResult: _handleBruteForceResult,
                    onError: _handleBruteForceError,
                    onCancelled: _handleBruteForceCancelled
                });
                
                _initializeUI(); // Nutzt initialisierte Daten und State für erste UI-Updates und Tab-Rendering
                _initializeEventHandlers();
                _isInitialized = true;
                 console.log(`${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION} initialisiert. Aktives Kollektiv: ${getKollektivDisplayName(_globalData.currentKollektiv)}, Aktiver Tab: ${_activeTabId}`);

            } catch (error) {
                console.error("Schwerwiegender Fehler während der Anwendungsinitialisierung:", error);
                const overlay = document.getElementById('loading-overlay');
                const messageElement = document.getElementById('loading-message');
                if (messageElement) messageElement.innerHTML = `<span class="text-danger">Kritischer Fehler bei der Initialisierung!</span><br><small>${error.message}</small><br><small>Bitte versuchen Sie, die Seite neu zu laden oder prüfen Sie die Browser-Konsole.</small>`;
                if (overlay) overlay.style.display = 'flex'; // Sicherstellen, dass Overlay sichtbar ist, um Fehler anzuzeigen
                 // Nicht _hideLoadingOverlay() aufrufen, damit Fehlermeldung sichtbar bleibt
            } finally {
                // _hideLoadingOverlay() wird nun im _handleTabChange (via viewRenderer) oder hier nicht mehr global aufgerufen,
                // außer bei Erfolg, da der viewRenderer es übernimmt.
                // Bei einem Fehler oben bleibt das Overlay mit der Fehlermeldung stehen.
                if(_isInitialized) _hideLoadingOverlay(); // Nur bei erfolgreicher Initialisierung ausblenden
            }
        });
    }

    function refreshCurrentTab(forceDataRefresh = false, newSortState = null) {
        if (!_activeTabId || (_isLoading && !forceDataRefresh)) { // Erlaube refresh, wenn forceDataRefresh true ist, auch wenn isLoading
            if(_isLoading) console.warn("RefreshCurrentTab ignoriert oder verzögert, da Anwendung bereits lädt.");
             // Wenn isLoading, aber kein forceDataRefresh, dann nicht unterbrechen.
             // Wenn nicht isLoading, aber kein _activeTabId, dann abbrechen.
            if (!_activeTabId) return;
            if (_isLoading && !forceDataRefresh) return;
        }
        _showLoadingOverlay(`Aktualisiere Tab: ${_activeTabId.replace('-tab','').replace(/^\w/, c => c.toUpperCase())}...`);
        
        if (forceDataRefresh) {
            _globalData.currentKollektiv = state.getCurrentKollektiv();
            _globalData.processedData = dataProcessor.processRawData(_globalData.rawData);
            _globalData.filteredData = dataProcessor.filterDataByKollektiv(_globalData.processedData, _globalData.currentKollektiv);
            
            const currentAppliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
            const currentAppliedT2Logic = t2CriteriaManager.getAppliedLogic();
             _globalData.filteredData = t2CriteriaManager.evaluateDataset(cloneDeep(_globalData.filteredData), currentAppliedT2Criteria, currentAppliedT2Logic);

            ui_helpers.updateHeaderStatsUI(dataProcessor.calculateHeaderStats(_globalData.filteredData, _globalData.currentKollektiv));
            ui_helpers.updateExportButtonStates(_activeTabId, bruteForceManager.hasResults(_globalData.currentKollektiv), _globalData.filteredData.length > 0);
             
             if (typeof auswertungTabLogic !== 'undefined') auswertungTabLogic.setDataStale();
             if (typeof statistikTabLogic !== 'undefined') statistikTabLogic.setDataStale();
             if (typeof praesentationTabLogic !== 'undefined') praesentationTabLogic.setDataStale();
             if (typeof publikationTabLogic !== 'undefined') publikationTabLogic.setDataStale();
        }

        if (newSortState && _activeTabId === 'daten-tab') {
            state.setCurrentDatenSortState(newSortState);
        }

        const stateSnapshot = {
            rawData: _globalData.rawData,
            currentKollektiv: state.getCurrentKollektiv(),
            appliedT2Criteria: t2CriteriaManager.getAppliedCriteria(),
            appliedT2Logic: t2CriteriaManager.getAppliedLogic(),
            datenSortState: state.getCurrentDatenSortState(),
            bruteForceState: bruteForceManager.getState(),
            bruteForceResults: bruteForceManager.getAllResults(),
            statsLayout: state.getCurrentStatsLayout(),
            statsKollektiv1: state.getCurrentStatsKollektiv1(),
            statsKollektiv2: state.getCurrentStatsKollektiv2(),
            praesentationView: state.getCurrentPresentationView(),
            praesentationStudyId: state.getCurrentPresentationStudyId(),
            forceTabRefresh: forceDataRefresh || state.getForceTabRefresh()
        };
        viewRenderer.renderTabContent(_activeTabId, _globalData.filteredData, stateSnapshot);
    }


    return Object.freeze({
        initializeApplication,
        refreshCurrentTab,
        showLoadingOverlay: _showLoadingOverlay, 
        hideLoadingOverlay: _hideLoadingOverlay, 
        getGlobalData: () => _globalData,
        getActiveTabId: () => _activeTabId,
        notifyDataProcessingChange: () => {
            _globalData.processedData = dataProcessor.processRawData(_globalData.rawData);
            _globalData.filteredData = dataProcessor.filterDataByKollektiv(_globalData.processedData, state.getCurrentKollektiv());
            _globalData.filteredData = t2CriteriaManager.evaluateDataset(cloneDeep(_globalData.filteredData), t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
             ui_helpers.updateHeaderStatsUI(dataProcessor.calculateHeaderStats(_globalData.filteredData, state.getCurrentKollektiv()));
             ui_helpers.markCriteriaSavedIndicator(false);
        }
    });

})();

mainAppInterface.initializeApplication();
