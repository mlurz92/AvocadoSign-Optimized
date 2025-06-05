const mainAppInterface = (() => {
    const PATIENT_RAW_DATA = window.PATIENT_RAW_DATA || [];

    function loadInitialDataAndSettings() {
        stateManager.loadAppliedT2Criteria();
        stateManager.loadAppliedT2Logic();
        stateManager.loadCurrentKollektiv();
        stateManager.loadCurrentBruteForceResult();

        const initialUserSettings = {
            datenTableSort: APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT,
            auswertungTableSort: APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT,
            statsLayout: APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT,
            statsKollektiv1: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1,
            statsKollektiv2: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2,
            praesentationView: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW,
            praesentationStudyId: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID,
            praesentationLang: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG, // Use same default as pub
            publikationLang: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG,
            publikationSection: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION,
            publikationBruteForceMetric: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC,
            currentKollektivForBruteForce: APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV,
            bruteForceActiveMetric: APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC
        };

        Object.keys(initialUserSettings).forEach(key => {
            const storageKey = APP_CONFIG.STORAGE_KEYS[key.toUpperCase()] || APP_CONFIG.STORAGE_KEYS[key] || `userSetting_${key}`;
            const storedValue = loadFromLocalStorage(storageKey);
            if (storedValue !== null) {
                initialUserSettings[key] = storedValue;
            }
        });
        stateManager.updateUserSettings(initialUserSettings, false); // false to not save again immediately
    }

    function initializeEventHandlers() {
        generalEventHandlers.init();
        auswertungEventHandlers.init();
        statistikEventHandlers.init();
        praesentationEventHandlers.init();
        publikationEventHandlers.init();
        exportEventHandlers.init();

        document.querySelectorAll('#main-nav .nav-link').forEach(tabLink => {
            tabLink.addEventListener('click', handleTabChange);
        });
    }

    function refreshCurrentTab(forceReloadData = false) {
        const activeTabId = stateManager.getActiveTabId();
        const targetElementId = `${activeTabId}-tab-pane`;
        const currentKollektiv = राज्य.currentKollektiv;
        const appliedT2Criteria = राज्य.appliedT2Criteria;
        const t2Logic = राज्य.appliedT2Logic;
        const userSettings = राज्य.userSettings;

        ui_helpers.showLoadingOverlay(true, activeTabId);

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
                    const aggregatedStats = statisticsService.getAggregatedStats(PATIENT_RAW_DATA, appliedT2Criteria, t2Logic, राज्य.bruteForceResults, userSettings.publikationBruteForceMetric);
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
                        राज्य.bruteForceResults,
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
            ui_helpers.updateElementHTML(targetElementId, `<p class="text-danger">Fehler beim Laden des Tabs. Details siehe Konsole.</p>`);
            ui_helpers.showToast(`Fehler beim Laden von Tab '${activeTabId}'.`, 'danger');
        } finally {
            ui_helpers.showLoadingOverlay(false);
        }
        viewRenderer.updateHeaderStats();
        viewRenderer.updateActiveTabInUI(activeTabId);
    }


    function handleTabChange(event) {
        event.preventDefault();
        if (!event.currentTarget || !event.currentTarget.dataset.bsTarget) return;

        const newTabId = event.currentTarget.dataset.bsTarget.substring(1).replace('-tab-pane', '');
        const oldTabId = stateManager.getActiveTabId();

        if (newTabId !== oldTabId) {
            stateManager.setActiveTabId(newTabId);
            refreshCurrentTab();
        }
    }
    
    function handleBruteForceUpdate(event) {
        const { status, progress, result, error, kollektiv } = event.detail;
        const activeTabId = stateManager.getActiveTabId();
        const currentKollektiv = राज्य.currentKollektiv;

        if (error) {
            ui_helpers.showToast(`Brute-Force Fehler: ${error}`, 'danger', 8000);
        }

        if (result && kollektiv) {
            stateManager.setBruteForceResultForKollektiv(kollektiv, result);
        }
        
        if (activeTabId === 'auswertung' && kollektiv === currentKollektiv) {
            refreshCurrentTab();
        } else if (activeTabId === 'auswertung' && status === 'completed' && kollektiv !== currentKollektiv) {
            // If on auswertung tab, but for a different kollektiv, still show a success message
             ui_helpers.showToast(`Brute-Force für Kollektiv '${getKollektivDisplayName(kollektiv)}' abgeschlossen.`, 'success');
        }

        if (activeTabId === 'statistik' || activeTabId === 'publikation' || activeTabId === 'praesentation') {
             if (status === 'completed' && result) {
                 refreshCurrentTab(true); // Force data reload for these tabs
             }
        }
        viewRenderer.updateHeaderStats(); // Update T2 header stats if BF result changed applied criteria if user applies it
    }


    function initApp() {
        if (typeof d3 === 'undefined') {
            console.error("D3.js nicht geladen. Diagramme können nicht gerendert werden.");
            document.body.innerHTML = "<p class='text-danger p-5 text-center'>Fehler: D3.js konnte nicht geladen werden. Bitte überprüfen Sie die Internetverbindung und versuchen Sie es erneut.</p>";
            return;
        }
        if (typeof Papa === 'undefined' || typeof JSZip === 'undefined' || typeof saveAs === 'undefined' || typeof ExcelJS === 'undefined' || typeof html2canvas === 'undefined') {
            console.warn("Eine oder mehrere Exportbibliotheken (PapaParse, JSZip, FileSaver, ExcelJS, html2canvas) nicht geladen. Exportfunktionalität ist eingeschränkt.");
        }


        document.dispatchEvent(new CustomEvent('appStateLoading', { detail: { message: 'Lade Einstellungen...' }}));
        loadInitialDataAndSettings();
        document.dispatchEvent(new CustomEvent('appStateLoaded', { detail: { message: 'Einstellungen geladen.' }}));

        document.dispatchEvent(new CustomEvent('appUILoading', { detail: { message: 'Initialisiere UI Komponenten...' }}));
        ui_components.initDynamicUIElements(PATIENT_RAW_DATA.length > 0);
        initializeEventHandlers();
        document.dispatchEvent(new CustomEvent('appUILoaded', { detail: { message: 'UI Komponenten initialisiert.' }}));
        
        document.addEventListener('bruteForceUpdate', handleBruteForceUpdate);

        const firstTabId = stateManager.getActiveTabId() || 'daten';
        stateManager.setActiveTabId(firstTabId);
        refreshCurrentTab();
        
        ui_helpers.checkFirstAppStart();
    }

    return Object.freeze({
        initApp,
        refreshCurrentTab,
        handleTabChange,
        getRawData: () => PATIENT_RAW_DATA,
        getAggregatedDataForPublikation: () => publicationTabLogic.currentAggregatedPublicationData // Expose for potential direct access if needed
    });

})();

document.addEventListener('DOMContentLoaded', mainAppInterface.initApp);
