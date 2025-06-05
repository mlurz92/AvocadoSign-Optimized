const mainAppInterface = (() => {
    const PATIENT_RAW_DATA = window.PATIENT_RAW_DATA || [];

    function loadInitialDataAndSettings() {
        if (typeof stateManager === 'undefined') {
            console.error("CRITICAL: stateManager ist nicht verfügbar in loadInitialDataAndSettings. Ladereihenfolge prüfen!");
            return;
        }
        stateManager.loadAppliedT2Criteria();
        stateManager.loadAppliedT2Logic();
        stateManager.loadCurrentKollektiv();
        stateManager.getAllBruteForceResultsFromStorage(); // Load all previously stored BF results

        const initialUserSettings = {
            datenTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT),
            auswertungTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT),
            statsLayout: APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT,
            statsKollektiv1: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1,
            statsKollektiv2: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2,
            praesentationView: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW,
            praesentationStudyId: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID,
            praesentationLang: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG,
            publikationLang: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG,
            publikationSection: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION,
            publikationBruteForceMetric: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC,
            currentKollektivForBruteForce: APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV,
            bruteForceActiveMetric: APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC
        };

        Object.keys(initialUserSettings).forEach(key => {
            const storageKeyInConfig = Object.keys(APP_CONFIG.STORAGE_KEYS).find(k => k.toLowerCase() === key.toLowerCase());
            const storageKey = storageKeyInConfig ? APP_CONFIG.STORAGE_KEYS[storageKeyInConfig] : `userSetting_${key}`;
            const storedValue = loadFromLocalStorage(storageKey);
            if (storedValue !== null) {
                initialUserSettings[key] = storedValue;
            }
        });
        stateManager.updateUserSettings(initialUserSettings, false); 
    }

    function initializeEventHandlers() {
        generalEventHandlers.init();
        auswertungEventHandlers.init();
        statistikEventHandlers.init();
        praesentationEventHandlers.init();
        publikationEventHandlers.init();
        exportEventHandlers.init(); // Sicherstellen, dass dies aufgerufen wird

        document.querySelectorAll('#main-nav .nav-link').forEach(tabLink => {
            tabLink.removeEventListener('click', handleTabChange); // Vorsorglich entfernen
            tabLink.addEventListener('click', handleTabChange);
        });
    }

    function refreshCurrentTab(forceReloadData = false) {
        if (typeof stateManager === 'undefined' || typeof viewRenderer === 'undefined' || typeof ui_helpers === 'undefined' || typeof dataProcessor === 'undefined' || typeof statisticsService === 'undefined' || typeof publicationDataAggregator === 'undefined') {
            console.error("CRITICAL: Eines der Kernmodule (stateManager, viewRenderer, etc.) ist nicht verfügbar in refreshCurrentTab.");
            const el = document.getElementById(stateManager?.getActiveTabId() + "-tab-pane");
            if (el) ui_helpers.updateElementHTML(el.id, `<p class="text-danger p-3">Kritischer Fehler: Kernkomponenten der Anwendung fehlen. Bitte Seite neu laden.</p>`);
            return;
        }

        const activeTabId = stateManager.getActiveTabId();
        const targetElementId = `${activeTabId}-tab-pane`;
        const currentKollektiv = stateManager.getCurrentKollektiv();
        const appliedT2Criteria = stateManager.getAppliedT2Criteria();
        const t2Logic = stateManager.getAppliedT2Logic();
        const userSettings = stateManager.getUserSettings();
        const allBruteForceResults = stateManager.getAllBruteForceResults();

        ui_helpers.showLoadingOverlay(true, null, activeTabId);

        try {
            switch (activeTabId) {
                case 'daten':
                    viewRenderer.renderDatenTab(targetElementId, currentKollektiv, userSettings.datenTableSort);
                    break;
                case 'auswertung':
                    const bruteForceResult = stateManager.getBruteForceResultForKollektiv(currentKollektiv);
                    const bruteForceInProgress = bruteForceManager.isWorkerRunning();
                    const bruteForceProgress = bruteForceManager.getCurrentProgress();
                    viewRenderer.renderAuswertungTab(targetElementId, currentKollektiv, appliedT2Criteria, t2Logic, userSettings.auswertungTableSort, bruteForceResult, bruteForceInProgress, bruteForceProgress);
                    break;
                case 'statistik':
                    const statsSettings = {
                        layout: userSettings.statsLayout,
                        kollektiv1: userSettings.statsKollektiv1,
                        kollektiv2: userSettings.statsKollektiv2,
                    };
                    const aggregatedStats = statisticsService.getAggregatedStats(PATIENT_RAW_DATA, appliedT2Criteria, t2Logic, allBruteForceResults, userSettings.publikationBruteForceMetric);
                    viewRenderer.renderStatistikTab(targetElementId, statsSettings, aggregatedStats);
                    break;
                case 'praesentation':
                     const praesSettings = {
                        view: userSettings.praesentationView,
                        studyId: userSettings.praesentationStudyId,
                        lang: userSettings.praesentationLang
                    };
                    const praesAggregatedData = publicationDataAggregator.getAggregatedPublicationData(
                        PATIENT_RAW_DATA,
                        appliedT2Criteria,
                        t2Logic,
                        allBruteForceResults,
                        userSettings.publikationBruteForceMetric
                    );
                    viewRenderer.renderPraesentationTab(targetElementId, praesSettings, praesAggregatedData);
                    break;
                case 'publikation':
                    viewRenderer.renderPublikationTab(targetElementId, userSettings);
                    break;
                case 'export':
                    viewRenderer.renderExportTab(targetElementId, currentKollektiv);
                    break;
                default:
                    console.warn("Unbekannter Tab:", activeTabId);
                    ui_helpers.updateElementHTML(targetElementId, `<p>Inhalt für Tab "${activeTabId}" nicht gefunden.</p>`);
            }
        } catch (error) {
            console.error(`Fehler beim Rendern von Tab '${activeTabId}':`, error);
            ui_helpers.updateElementHTML(targetElementId, `<p class="text-danger p-3">Fehler beim Laden des Tabs. Details siehe Konsole.</p>`);
            if (typeof ui_helpers.showToast === 'function') {
                ui_helpers.showToast(`Fehler beim Laden von Tab '${activeTabId}'.`, 'danger');
            }
        } finally {
            ui_helpers.showLoadingOverlay(false, null, activeTabId);
        }
        viewRenderer.updateHeaderStats();
        viewRenderer.updateActiveTabInUI(activeTabId);
    }


    function handleTabChange(event) {
        if (!event || !event.currentTarget) return;
        event.preventDefault();
        if (!event.currentTarget.dataset || !event.currentTarget.dataset.bsTarget) return;

        const newTabId = event.currentTarget.dataset.bsTarget.substring(1).replace('-tab-pane', '');
        const oldTabId = stateManager.getActiveTabId();

        if (newTabId !== oldTabId) {
            stateManager.setActiveTabId(newTabId);
            refreshCurrentTab();
        }
    }
    
    function handleBruteForceUpdate(event) {
        if (!event || !event.detail) return;
        const { status, progress, result, error, kollektiv } = event.detail;
        const activeTabId = stateManager.getActiveTabId();
        const currentKollektivState = stateManager.getCurrentKollektiv();

        if (error) {
            if (typeof ui_helpers.showToast === 'function') {
                 ui_helpers.showToast(`Brute-Force Fehler: ${error}`, 'danger', 8000);
            } else {
                console.error(`Brute-Force Fehler: ${error}`);
            }
        }

        if (result && kollektiv) {
            stateManager.setBruteForceResultForKollektiv(kollektiv, result);
        }
        
        if (activeTabId === 'auswertung' && kollektiv === currentKollektivState) {
            refreshCurrentTab();
        } else if (activeTabId === 'auswertung' && status === 'completed' && kollektiv !== currentKollektivState) {
            if (typeof ui_helpers.showToast === 'function') {
                ui_helpers.showToast(`Brute-Force für Kollektiv '${getKollektivDisplayName(kollektiv)}' abgeschlossen.`, 'success');
            }
        }

        if (status === 'completed' && (activeTabId === 'statistik' || activeTabId === 'publikation' || activeTabId === 'praesentation')) {
            refreshCurrentTab(true); 
        }
        if (typeof viewRenderer !== 'undefined' && typeof viewRenderer.updateHeaderStats === 'function') {
             viewRenderer.updateHeaderStats();
        }
    }


    function initApp() {
        if (typeof d3 === 'undefined') {
            console.error("CRITICAL: D3.js nicht geladen. Diagramme können nicht gerendert werden.");
            document.body.innerHTML = "<p class='text-danger p-5 text-center'>Fehler: D3.js konnte nicht geladen werden. Bitte Internetverbindung prüfen und Seite neu laden.</p>";
            return;
        }
        if (typeof Papa === 'undefined' || typeof JSZip === 'undefined' || typeof saveAs === 'undefined' || typeof ExcelJS === 'undefined' || typeof html2canvas === 'undefined') {
            console.warn("WARNUNG: Eine oder mehrere Exportbibliotheken (PapaParse, JSZip, FileSaver, ExcelJS, html2canvas) nicht geladen. Exportfunktionalität ist eingeschränkt.");
        }
        if (typeof stateManager === 'undefined') {
            console.error("CRITICAL: stateManager nicht initialisiert. Anwendung kann nicht starten.");
            document.body.innerHTML = "<p class='text-danger p-5 text-center'>Kritischer Fehler: stateManager konnte nicht initialisiert werden. App-Start abgebrochen.</p>";
            return;
        }

        document.dispatchEvent(new CustomEvent('appStateLoading', { detail: { message: 'Lade Einstellungen...' }}));
        loadInitialDataAndSettings();
        document.dispatchEvent(new CustomEvent('appStateLoaded', { detail: { message: 'Einstellungen geladen.' }}));

        document.dispatchEvent(new CustomEvent('appUILoading', { detail: { message: 'Initialisiere UI Komponenten...' }}));
        if (typeof ui_components !== 'undefined' && typeof ui_components.initDynamicUIElements === 'function') {
            ui_components.initDynamicUIElements(PATIENT_RAW_DATA && PATIENT_RAW_DATA.length > 0);
        }
        initializeEventHandlers();
        document.dispatchEvent(new CustomEvent('appUILoaded', { detail: { message: 'UI Komponenten initialisiert.' }}));
        
        document.removeEventListener('bruteForceUpdate', handleBruteForceUpdate); // Remove before adding
        document.addEventListener('bruteForceUpdate', handleBruteForceUpdate);

        const firstTabId = stateManager.getActiveTabId(); // getActiveTabId already has default
        stateManager.setActiveTabId(firstTabId); // Ensure it's set in state before first refresh
        refreshCurrentTab();
        
        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.checkFirstAppStart === 'function') {
             ui_helpers.checkFirstAppStart();
        }
    }

    return Object.freeze({
        initApp,
        refreshCurrentTab,
        handleTabChange,
        getRawData: () => PATIENT_RAW_DATA,
        // getAggregatedDataForPublikation: ist jetzt besser über stateManager.getAllBruteForceResults() + publicationDataAggregator zugänglich
    });

})();

document.addEventListener('DOMContentLoaded', mainAppInterface.initApp);
