const mainAppInterface = (() => {
    const PATIENT_RAW_DATA = window.PATIENT_RAW_DATA || [];
    let processedData = []; // Store processed data here
    let currentFilteredData = []; // Store currently filtered data

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
            const storageKeyInConfig = APP_CONFIG.STORAGE_KEYS[key.toUpperCase()];
            const storedValue = loadFromLocalStorage(storageKeyInConfig);
            if (storedValue !== null) {
                initialUserSettings[key] = storedValue;
            }
        });
        stateManager.updateUserSettings(initialUserSettings, false);
    }

    function processAllData() {
        if (typeof dataProcessor === 'undefined' || typeof t2CriteriaManager === 'undefined') {
            console.error("CRITICAL: dataProcessor oder t2CriteriaManager nicht verfügbar.");
            return;
        }
        processedData = dataProcessor.processPatientData(PATIENT_RAW_DATA);
        processedData = t2CriteriaManager.evaluateDataset(processedData, stateManager.getAppliedT2Criteria(), stateManager.getAppliedT2Logic());
    }

    function filterCurrentData() {
        if (typeof dataProcessor === 'undefined') {
            console.error("CRITICAL: dataProcessor nicht verfügbar zum Filtern der Daten.");
            return;
        }
        currentFilteredData = dataProcessor.filterDataByKollektiv(processedData, stateManager.getCurrentKollektiv());
    }

    function applyAndRefreshAll(forceReloadData = false) {
        if (forceReloadData) {
            processAllData();
        }
        filterCurrentData();
        refreshCurrentTab();
        updateGlobalUIState();
    }

    function handleGlobalKollektivChange(newKollektiv, source = "user") {
        const oldKollektiv = stateManager.getCurrentKollektiv();
        if (stateManager.setCurrentKollektiv(newKollektiv)) {
            filterCurrentData();
            refreshCurrentTab();
            updateGlobalUIState();
            if (source === "user") {
                 ui_helpers.showToast(`Kollektiv auf '${getKollektivDisplayName(newKollektiv)}' geändert.`, 'info');
            } else if (source === "auto_praesentation") {
                ui_helpers.showToast(`Kollektiv automatisch auf '${getKollektivDisplayName(newKollektiv)}' geändert (erforderlich für ausgewählte Studie).`, 'info', 6000);
            }
            return true;
        }
        return false;
    }

    function updateGlobalUIState() {
        viewRenderer.updateHeaderStats();
        viewRenderer.updateActiveTabInUI(stateManager.getActiveTabId());
        const applyBtn = document.getElementById('btn-apply-criteria');
        if (applyBtn) {
            ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
        }
    }

    function initializeEventHandlers() {
        // Kollektiv-Auswahl im Header
        document.querySelectorAll('input[name="kollektiv-options"]').forEach(radio => {
            radio.addEventListener('change', (event) => handleGlobalKollektivChange(event.target.value));
        });

        // Info-Button
        document.getElementById('app-info-button')?.addEventListener('click', ui_helpers.showKurzanleitung);

        // Haupt-Navigation (Tabs)
        document.querySelectorAll('#main-nav .nav-link').forEach(tabLink => {
            tabLink.addEventListener('click', (event) => {
                event.preventDefault();
                const newTabId = event.currentTarget.dataset.bsTarget.substring(1).replace('-tab-pane', '');
                stateManager.setActiveTabId(newTabId);
                refreshCurrentTab();
            });
        });

        // Auswertung Tab Event Handlers
        document.getElementById('t2-logic-switch')?.addEventListener('change', (event) => auswertungEventHandlers.handleT2LogicChange(event.target));
        document.querySelectorAll('.criteria-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (event) => auswertungEventHandlers.handleT2CheckboxChange(event.target));
        });
        document.querySelectorAll('.t2-criteria-button').forEach(button => {
            button.addEventListener('click', (event) => auswertungEventHandlers.handleT2CriteriaButtonClick(event.target));
        });
        document.getElementById('range-size')?.addEventListener('input', (event) => auswertungEventHandlers.handleT2SizeRangeChange(event.target.value));
        document.getElementById('input-size')?.addEventListener('change', (event) => auswertungEventHandlers.handleT2SizeInputChange(event.target.value)); // 'change' für manuelle Eingabe
        document.getElementById('btn-reset-criteria')?.addEventListener('click', auswertungEventHandlers.handleResetCriteria);
        document.getElementById('btn-apply-criteria')?.addEventListener('click', () => auswertungEventHandlers.handleApplyCriteria(mainAppInterface));
        document.getElementById('btn-start-brute-force')?.addEventListener('click', () => auswertungEventHandlers.handleStartBruteForce(mainAppInterface));
        document.getElementById('btn-cancel-brute-force')?.addEventListener('click', auswertungEventHandlers.handleCancelBruteForce);
        document.getElementById('btn-apply-best-bf-criteria')?.addEventListener('click', () => auswertungEventHandlers.handleApplyBestBfCriteria(mainAppInterface));
        document.getElementById('brute-force-metric')?.addEventListener('change', auswertungEventHandlers.handleBruteForceMetricChange);
        document.getElementById('btn-show-brute-force-details')?.addEventListener('click', () => ui_helpers.showBruteForceModal(bruteForceManager.getResultsForKollektiv(stateManager.getCurrentKollektiv())));
        document.getElementById('brute-force-modal-export-btn')?.addEventListener('click', ui_helpers.handleModalExportBruteForceClick);

        // Statistik Tab Event Handlers
        document.querySelectorAll('input[name="statistikAnsicht"]').forEach(radio => {
             radio.addEventListener('change', (event) => statistikEventHandlers.handleStatsLayoutToggle(event.target, mainAppInterface));
        });
        document.getElementById('statistik-kollektiv-select-1')?.addEventListener('change', (event) => statistikEventHandlers.handleStatistikKollektivChange(event.target, mainAppInterface));
        document.getElementById('statistik-kollektiv-select-2')?.addEventListener('change', (event) => statistikEventHandlers.handleStatistikKollektivChange(event.target, mainAppInterface));

        // Präsentation Tab Event Handlers
        document.querySelectorAll('input[name="praesentationAnsicht"]').forEach(radio => {
            radio.addEventListener('change', (event) => praesentationEventHandlers.handlePresentationViewChange(event.target.value, mainAppInterface));
        });
        document.getElementById('praes-study-select')?.addEventListener('change', (event) => praesentationEventHandlers.handlePresentationStudySelectChange(event.target.value, mainAppInterface));
        document.getElementById('download-performance-as-pur-csv')?.addEventListener('click', (event) => praesentationEventHandlers.handlePresentationDownloadClick(event.target, mainAppInterface));
        document.getElementById('download-performance-as-pur-md')?.addEventListener('click', (event) => praesentationEventHandlers.handlePresentationDownloadClick(event.target, mainAppInterface));
        document.getElementById('download-chart-as-pur-perf-chart-png')?.addEventListener('click', (event) => praesentationEventHandlers.handlePresentationDownloadClick(event.target, mainAppInterface));
        document.getElementById('download-chart-as-pur-perf-chart-svg')?.addEventListener('click', (event) => praesentationEventHandlers.handlePresentationDownloadClick(event.target, mainAppInterface));

        document.getElementById('download-performance-as-vs-t2-csv')?.addEventListener('click', (event) => praesentationEventHandlers.handlePresentationDownloadClick(event.target, mainAppInterface));
        document.getElementById('download-comp-table-as-vs-t2-md')?.addEventListener('click', (event) => praesentationEventHandlers.handlePresentationDownloadClick(event.target, mainAppInterface));
        document.getElementById('download-tests-as-vs-t2-md')?.addEventListener('click', (event) => praesentationEventHandlers.handlePresentationDownloadClick(event.target, mainAppInterface));
        document.getElementById('download-chart-as-vs-t2-png')?.addEventListener('click', (event) => praesentationEventHandlers.handlePresentationDownloadClick(event.target, mainAppInterface));
        document.getElementById('download-chart-as-vs-t2-svg')?.addEventListener('click', (event) => praesentationEventHandlers.handlePresentationDownloadClick(event.target, mainAppInterface));
        
        document.querySelectorAll('.table-download-png-btn').forEach(button => {
            button.addEventListener('click', (event) => generalEventHandlers.handleSingleTableDownload(event.target));
        });
        document.querySelectorAll('.chart-download-btn').forEach(button => {
            button.addEventListener('click', (event) => generalEventHandlers.handleSingleChartDownload(event.target));
        });

        // Publikation Tab Event Handlers
        publikationEventHandlers.init(); // Initialisiert sprach-/sektionsspezifische Handler

        // Export Tab Event Handlers
        document.getElementById('export-statistik-csv')?.addEventListener('click', () => exportEventHandlers.exportStatsCSV(mainAppInterface));
        document.getElementById('export-bruteforce-txt')?.addEventListener('click', () => exportEventHandlers.exportBruteForceTXT(mainAppInterface));
        document.getElementById('export-deskriptiv-md')?.addEventListener('click', () => exportEventHandlers.exportDeskriptivMD(mainAppInterface));
        document.getElementById('export-comprehensive-report-html')?.addEventListener('click', () => exportEventHandlers.exportComprehensiveHTML(mainAppInterface));
        document.getElementById('export-daten-md')?.addEventListener('click', () => exportEventHandlers.exportDatenMD(mainAppInterface));
        document.getElementById('export-auswertung-md')?.addEventListener('click', () => exportEventHandlers.exportAuswertungMD(mainAppInterface));
        document.getElementById('export-filtered-data-csv')?.addEventListener('click', () => exportEventHandlers.exportFilteredDataCSV(mainAppInterface));
        document.getElementById('export-charts-png')?.addEventListener('click', () => exportEventHandlers.exportAllChartsPNG(mainAppInterface));
        document.getElementById('export-charts-svg')?.addEventListener('click', () => exportEventHandlers.exportAllChartsSVG(mainAppInterface));

        document.getElementById('export-all-zip')?.addEventListener('click', () => exportEventHandlers.createDataPackages(mainAppInterface, 'all'));
        document.getElementById('export-csv-zip')?.addEventListener('click', () => exportEventHandlers.createDataPackages(mainAppInterface, 'csv'));
        document.getElementById('export-md-zip')?.addEventListener('click', () => exportEventHandlers.createDataPackages(mainAppInterface, 'md'));
        document.getElementById('export-xlsx-zip')?.addEventListener('click', () => exportEventHandlers.createDataPackages(mainAppInterface, 'xlsx'));
        document.getElementById('export-png-zip')?.addEventListener('click', () => exportEventHandlers.createDataPackages(mainAppInterface, 'png'));
        document.getElementById('export-svg-zip')?.addEventListener('click', () => exportEventHandlers.createDataPackages(mainAppInterface, 'svg'));


        // Handler für Sortierung in Tabellen (delegiert an `generalEventHandlers`)
        document.addEventListener('click', (event) => {
            const sortHeader = event.target.closest('.sortable-header');
            const sortSubHeader = event.target.closest('.sortable-sub-header');
            if (sortHeader || sortSubHeader) {
                generalEventHandlers.handleSortClick(sortHeader || event.target, sortSubHeader, mainAppInterface);
            }
        });

        // Handler für das Ein-/Ausblenden von Details in Tabellen
        document.addEventListener('click', (event) => {
            const toggleButton = event.target.closest('#daten-toggle-details, #auswertung-toggle-details');
            if (toggleButton) {
                const tableBodyId = toggleButton.id === 'daten-toggle-details' ? 'daten-table-body' : 'auswertung-table-body';
                ui_helpers.toggleAllDetails(tableBodyId, toggleButton.id);
            }
        });
    }

    function refreshCurrentTab() {
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
                    viewRenderer.renderDatenTab(currentFilteredData, userSettings.datenTableSort);
                    break;
                case 'auswertung':
                    const bruteForceResult = stateManager.getBruteForceResultForKollektiv(currentKollektiv);
                    const bruteForceInProgress = bruteForceManager.isRunning();
                    const bruteForceProgress = bruteForceManager.getCurrentProgress(); // Dummy-Funktion, muss in BFM implementiert sein
                    viewRenderer.renderAuswertungTab(currentFilteredData, appliedT2Criteria, t2Logic, userSettings.auswertungTableSort, currentKollektiv, bruteForceManager.isWorkerAvailable());
                    break;
                case 'statistik':
                    const statsSettings = {
                        layout: userSettings.statsLayout,
                        kollektiv1: userSettings.statsKollektiv1,
                        kollektiv2: userSettings.statsKollektiv2,
                    };
                    viewRenderer.renderStatistikTab(processedData, appliedT2Criteria, t2Logic, statsSettings.layout, statsSettings.kollektiv1, statsSettings.kollektiv2, currentKollektiv);
                    break;
                case 'praesentation':
                    const praesSettings = {
                        view: userSettings.praesentationView,
                        studyId: userSettings.praesentationStudyId,
                        lang: userSettings.praesentationLang
                    };
                    viewRenderer.renderPresentationTab(praesSettings.view, praesSettings.studyId, currentKollektiv, processedData, appliedT2Criteria, t2Logic);
                    break;
                case 'publikation':
                    publicationTabLogic.preparePublicationData(
                        processedData, // Use full processed data for publication
                        appliedT2Criteria,
                        t2Logic,
                        allBruteForceResults,
                        userSettings.publikationBruteForceMetric
                    );
                    viewRenderer.renderPublikationTab(userSettings.publikationLang, userSettings.publikationSection, currentKollektiv, processedData, allBruteForceResults);
                    break;
                case 'export':
                    viewRenderer.renderExportTab(currentKollektiv);
                    break;
                default:
                    console.warn("Unbekannter Tab:", activeTabId);
                    ui_helpers.updateElementHTML(targetElementId, `<p>Inhalt für Tab "${activeTabId}" nicht gefunden.</p>`);
            }
        } catch (error) {
            console.error(`Fehler beim Rendern von Tab '${activeTabId}':`, error);
            ui_helpers.updateElementHTML(targetElementId, `<p class="text-danger p-3">Fehler beim Laden des Tabs. Details siehe Konsole.</p>`);
            ui_helpers.showToast(`Fehler beim Laden von Tab '${activeTabId}'.`, 'danger');
        } finally {
            ui_helpers.showLoadingOverlay(false, null, activeTabId);
        }
        updateGlobalUIState();
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
        processAllData(); // Process all data once at startup
        filterCurrentData(); // Filter for current selected kollektiv
        document.dispatchEvent(new CustomEvent('appStateLoaded', { detail: { message: 'Einstellungen geladen.' }}));

        document.dispatchEvent(new CustomEvent('appUILoading', { detail: { message: 'Initialisiere UI Komponenten...' }}));
        if (typeof ui_components !== 'undefined' && typeof ui_components.initDynamicUIElements === 'function') {
            ui_components.initDynamicUIElements(PATIENT_RAW_DATA && PATIENT_RAW_DATA.length > 0);
        }
        initializeEventHandlers();
        document.dispatchEvent(new CustomEvent('appUILoaded', { detail: { message: 'UI Komponenten initialisiert.' }}));
        
        document.removeEventListener('bruteForceUpdate', handleBruteForceUpdate);
        document.addEventListener('bruteForceUpdate', handleBruteForceUpdate);

        const firstTabId = stateManager.getActiveTabId();
        stateManager.setActiveTabId(firstTabId);
        refreshCurrentTab();
        
        ui_helpers.checkFirstAppStart();
        t2CriteriaManager.initializeT2CriteriaState(); // Initialize T2 criteria state based on local storage
    }

    function handleBruteForceUpdate(event) {
        if (!event || !event.detail) return;
        const { status, progress, result, error, kollektiv } = event.detail;
        const activeTabId = stateManager.getActiveTabId();
        const currentKollektivState = stateManager.getCurrentKollektiv();

        if (error) {
             ui_helpers.showToast(`Brute-Force Fehler: ${error}`, 'danger', 8000);
        }

        if (result && kollektiv) {
            stateManager.setBruteForceResultForKollektiv(kollektiv, result);
        }
        
        // Always refresh view if brute force is in progress or completed and it matches the current kollektiv
        if (activeTabId === 'auswertung' && kollektiv === currentKollektivState) {
            viewRenderer.renderAuswertungTab(currentFilteredData, stateManager.getAppliedT2Criteria(), stateManager.getAppliedT2Logic(), stateManager.getUserSettings().auswertungTableSort, currentKollektivState, bruteForceManager.isWorkerAvailable());
            ui_helpers.updateBruteForceUI(status, progress, bruteForceManager.isWorkerAvailable(), kollektiv);
        } else if (status === 'completed' && kollektiv !== currentKollektivState) {
            ui_helpers.showToast(`Brute-Force für Kollektiv '${getKollektivDisplayName(kollektiv)}' abgeschlossen.`, 'success');
        }

        // Refresh other tabs that depend on BF results when completed
        if (status === 'completed' && (activeTabId === 'statistik' || activeTabId === 'publikation' || activeTabId === 'praesentation')) {
            refreshCurrentTab();
        }
        updateGlobalUIState();
    }


    return Object.freeze({
        initApp,
        refreshCurrentTab,
        handleGlobalKollektivChange, // Exported for use by other modules
        applyAndRefreshAll, // Exported for use by other modules
        updateGlobalUIState, // Exported for use by other modules
        getProcessedData: () => cloneDeep(processedData), // Provide full processed data for exports/publication aggregation
        getCurrentFilteredData: () => cloneDeep(currentFilteredData), // Provide currently filtered data
        getRawData: () => PATIENT_RAW_DATA, // Provide raw data for special cases like initial processing
    });

})();

document.addEventListener('DOMContentLoaded', mainAppInterface.initApp);
