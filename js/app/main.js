(() => {
    let localRawData = [];
    let localProcessedData = [];
    let currentAppliedCriteria = null; // Wird in _initializeApplication aus state geladen
    let currentAppliedLogic = null;  // Wird in _initializeApplication aus state geladen
    let allKollektivStatsCache = null;
    let currentBruteForceResults = {};
    let isBruteForceRunning = false;
    let bruteForceWorkerInstance = null;

    function _updateUI(activeTabOverride = null) {
        const currentKollektiv = state.getCurrentKollektiv();
        const currentPublikationLang = state.getCurrentPublikationLang();
        const currentPublikationSection = state.getCurrentPublikationSection();
        const currentPublikationBfMetric = state.getCurrentPublikationBruteForceMetric();
        const currentStatsLayout = state.getCurrentStatsLayout();
        const currentStatsKollektiv1 = state.getCurrentStatsKollektiv1();
        const currentStatsKollektiv2 = state.getCurrentStatsKollektiv2();
        const currentPresentationView = state.getCurrentPresentationView();
        const currentPresentationStudyId = state.getCurrentPresentationStudyId();

        // Stelle sicher, dass currentAppliedCriteria und currentAppliedLogic aktuelle Werte aus dem State haben
        currentAppliedCriteria = state.getAppliedT2Criteria();
        currentAppliedLogic = state.getAppliedT2Logic();

        // Neuberechnung von localProcessedData basierend auf aktuellen Kriterien
        // Dies ist wichtig, wenn _updateUI nach Kriterienänderung gerufen wird.
        if (localRawData && localRawData.length > 0 && currentAppliedCriteria && currentAppliedLogic) {
             try {
                const reprocessedData = dataProcessor.processRawData(localRawData); // Beginne mit rohen Daten für korrekte Basis
                localProcessedData = t2CriteriaManager.evaluateDataset(reprocessedData, currentAppliedCriteria, currentAppliedLogic);
             } catch (e) {
                console.error("Fehler bei der Neubewertung von localProcessedData in _updateUI:", e);
                ui_helpers.showToast("Fehler bei der Aktualisierung der T2-Bewertung.", "danger");
             }
        } else if (!localRawData || localRawData.length === 0) {
            // Wenn localRawData leer ist, kann auch localProcessedData nicht sinnvoll sein.
            localProcessedData = [];
        }


        const filteredData = dataProcessor.filterDataByKollektiv(localProcessedData, currentKollektiv);
        const filteredRawData = dataProcessor.filterDataByKollektiv(localRawData, currentKollektiv);


        viewRenderer.renderAppHeader(localProcessedData, currentKollektiv); // Verwendet processed data für Header Stats
        viewRenderer.renderDatenTab(filteredData);
        viewRenderer.renderAuswertungTab(
            filteredRawData, // Rohdaten für Dashboard
            filteredData,    // verarbeitete Daten für Tabelle
            currentAppliedCriteria,
            currentAppliedLogic,
            currentKollektiv,
            currentBruteForceResults[currentKollektiv] || null,
            isBruteForceRunning
        );
        viewRenderer.renderStatistikTab(
            localRawData, // Rohdaten für Statistikberechnungen
            currentAppliedCriteria,
            currentAppliedLogic,
            currentKollektiv,
            currentStatsLayout,
            currentStatsKollektiv1,
            currentStatsKollektiv2
        );
        viewRenderer.renderPraesentationTab(
            localRawData,
            currentAppliedCriteria,
            currentAppliedLogic,
            currentKollektiv,
            currentPresentationView,
            currentPresentationStudyId
        );
        viewRenderer.renderPublikationTab(
            localRawData,
            currentAppliedCriteria,
            currentAppliedLogic,
            currentKollektiv,
            currentBruteForceResults,
            currentPublikationLang,
            currentPublikationSection,
            currentPublikationBfMetric
        );
        viewRenderer.renderExportTab(currentKollektiv);

        ui_helpers.updateActiveKollektivButton(currentKollektiv);
        ui_helpers.updateActiveTab(activeTabOverride || state.getActiveTabInternal() || 'daten-tab');
        ui_helpers.initializeTooltips(document.body); // Re-initialisiere Tooltips global
    }


    function _initializeApplication() {
        console.log(`Starte Avocado Sign Analyse Tool v${APP_CONFIG.APP_VERSION}`);
        const isFirstStart = state.loadStateFromLocalStorage(); // Lädt den State und gibt isFirstAppStart zurück

        currentAppliedCriteria = state.getAppliedT2Criteria(); // Hole Kriterien nach dem Laden aus dem State
        currentAppliedLogic = state.getAppliedT2Logic();   // Hole Logik nach dem Laden aus dem State
        document.getElementById('app-version-display').textContent = `v${APP_CONFIG.APP_VERSION}`;

        try {
            if (typeof PATIENT_DATA !== 'undefined' && PATIENT_DATA && Array.isArray(PATIENT_DATA) && PATIENT_DATA.length > 0) {
                localRawData = cloneDeep(PATIENT_DATA);
            } else {
                localRawData = [];
                console.error("PATIENT_DATA ist nicht definiert, leer, kein Array oder hat keine Einträge. Überprüfen Sie data/data.js und die Ladereihenfolge der Skripte.");
                ui_helpers.showToast("Kritischer Fehler: Patientendaten (PATIENT_DATA) konnten nicht geladen werden. Die Anwendung ist möglicherweise nicht funktionsfähig.", "danger", 10000);
                document.getElementById('app-container').innerHTML = `<div class="alert alert-danger m-5">Fehler beim Laden der App-Daten (PATIENT_DATA). Bitte Konsole prüfen und sicherstellen, dass 'data/data.js' korrekt geladen wird und 'PATIENT_DATA' global definiert.</div>`;
                return; // Stoppe weitere Initialisierung
            }

            localProcessedData = dataProcessor.processRawData(localRawData);
            localProcessedData = t2CriteriaManager.evaluateDataset(localProcessedData, currentAppliedCriteria, currentAppliedLogic);

        } catch (error) {
            console.error("Fehler bei der Initialisierung der Basisdaten:", error);
            ui_helpers.showToast("Kritischer Fehler: Basisdaten konnten nicht geladen oder verarbeitet werden. Die Anwendung ist möglicherweise nicht funktionsfähig.", "danger", 10000);
            document.getElementById('app-container').innerHTML = `<div class="alert alert-danger m-5">Fehler beim Laden der App-Daten. Bitte Konsole prüfen.</div>`;
            return;
        }
        
        datenTabLogic.initializeTable(dataProcessor.filterDataByKollektiv(localProcessedData, state.getCurrentKollektiv()));
        auswertungTabLogic.initializeDashboardAndTable(
            dataProcessor.filterDataByKollektiv(localRawData, state.getCurrentKollektiv()),
            dataProcessor.filterDataByKollektiv(localProcessedData, state.getCurrentKollektiv()),
            currentAppliedCriteria, currentAppliedLogic
        );
        statistikTabLogic.initializeStatistics(localRawData, currentAppliedCriteria, currentAppliedLogic, state.getCurrentKollektiv(), state.getCurrentStatsLayout(), state.getCurrentStatsKollektiv1(), state.getCurrentStatsKollektiv2());
        praesentationTabLogic.initializePraesentation(localRawData, currentAppliedCriteria, currentAppliedLogic, state.getCurrentKollektiv(), state.getCurrentPresentationView(), state.getCurrentPresentationStudyId());
        publikationTabLogic.initializeData(localRawData, currentAppliedCriteria, currentAppliedLogic, currentBruteForceResults);


        _updateUI(state.getActiveTabInternal() || 'daten-tab');
        _setupEventListeners();
        ui_helpers.initializeTooltips(document.body);

        if (isFirstStart) { // Zeige Toast erst nach initialem UI Render
            ui_helpers.showToast("Willkommen! Dies scheint Ihr erster Start zu sein. Eine Kurzanleitung finden Sie über den Info-Button (<i class='fas fa-info-circle'></i>) oben rechts.", "info", 10000);
            state.setFirstAppStart(false); // Setze nach dem ersten Start und Toast
        }


        bruteForceManager.initializeWorker(
            APP_CONFIG.PATHS.BRUTE_FORCE_WORKER,
            (message) => {
                const currentKollektivForBF = message.kollektiv || state.getCurrentKollektiv();
                if (message.type === 'START') {
                    isBruteForceRunning = true;
                    currentBruteForceResults[currentKollektivForBF] = { status: 'running', progress: 0, results: [], bestResult: null, metric: message.metric, kollektiv: currentKollektivForBF, totalCombinations: message.totalCombinations, testedCount: 0 };
                    ui_helpers.updateBruteForceUI('START', currentKollektivForBF, message.metric, message.totalCombinations);
                    ui_helpers.showToast(`Brute-Force für Kollektiv '${getKollektivDisplayName(currentKollektivForBF)}' gestartet (${formatNumber(message.totalCombinations,0)} Kombinationen).`, "info");
                } else if (message.type === 'PROGRESS') {
                    if (!currentBruteForceResults[currentKollektivForBF]) currentBruteForceResults[currentKollektivForBF] = { status: 'running', results: [], kollektiv: currentKollektivForBF, totalCombinations: message.totalCombinations };
                    currentBruteForceResults[currentKollektivForBF].progress = message.progress;
                    currentBruteForceResults[currentKollektivForBF].bestResult = message.currentBest;
                    currentBruteForceResults[currentKollektivForBF].testedCount = message.testedCount;
                    currentBruteForceResults[currentKollektivForBF].metric = message.metric; // Store metric from message
                    ui_helpers.updateBruteForceUI('PROGRESS', currentKollektivForBF, message.metric, currentBruteForceResults[currentKollektivForBF].totalCombinations || message.totalCombinations, message.progress, message.currentBest, message.testedCount);
                } else if (message.type === 'DONE') {
                    isBruteForceRunning = false;
                    currentBruteForceResults[currentKollektivForBF] = {
                        status: 'done',
                        progress: 1,
                        results: message.results,
                        bestResult: message.results && message.results.length > 0 ? message.results[0] : null,
                        metric: message.metric,
                        kollektiv: currentKollektivForBF,
                        duration: message.duration,
                        totalTested: message.totalTested,
                        nGesamt: message.nGesamt,
                        nPlus: message.nPlus,
                        nMinus: message.nMinus,
                        totalCombinations: currentBruteForceResults[currentKollektivForBF]?.totalCombinations || message.totalTested // Ensure totalCombinations is stored
                    };
                    ui_helpers.updateBruteForceUI('DONE', currentKollektivForBF, message.metric, currentBruteForceResults[currentKollektivForBF].totalCombinations, 1, currentBruteForceResults[currentKollektivForBF].bestResult, message.totalTested, message.duration, message.nGesamt, message.nPlus, message.nMinus);
                    ui_helpers.showToast(`Brute-Force für Kollektiv '${getKollektivDisplayName(currentKollektivForBF)}' abgeschlossen.`, "success");
                    publikationTabLogic.initializeData(localRawData, state.getAppliedT2Criteria(), state.getAppliedT2Logic(), currentBruteForceResults); // Re-init with new BF results
                    if(state.getActiveTabInternal() === 'publikation-tab') _updateUI('publikation-tab'); // If on pub tab, refresh it.
                } else if (message.type === 'CANCELLED') {
                    isBruteForceRunning = false;
                     currentBruteForceResults[currentKollektivForBF] = { status: 'cancelled', progress: 0, results: [], bestResult: null, metric: message.metric || currentBruteForceResults[currentKollektivForBF]?.metric , kollektiv: currentKollektivForBF, totalCombinations: currentBruteForceResults[currentKollektivForBF]?.totalCombinations };
                    ui_helpers.updateBruteForceUI('CANCELLED', currentKollektivForBF, currentBruteForceResults[currentKollektivForBF].metric, currentBruteForceResults[currentKollektivForBF].totalCombinations, currentBruteForceResults[currentKollektivForBF].progress, currentBruteForceResults[currentKollektivForBF].bestResult, currentBruteForceResults[currentKollektivForBF].testedCount);
                    ui_helpers.showToast(`Brute-Force für Kollektiv '${getKollektivDisplayName(currentKollektivForBF)}' abgebrochen.`, "warning");
                } else if (message.type === 'ERROR') {
                    isBruteForceRunning = false;
                    currentBruteForceResults[currentKollektivForBF] = { status: 'error', error: message.error, metric: message.metric || currentBruteForceResults[currentKollektivForBF]?.metric, kollektiv: currentKollektivForBF, totalCombinations: currentBruteForceResults[currentKollektivForBF]?.totalCombinations };
                    ui_helpers.updateBruteForceUI('ERROR', currentKollektivForBF, currentBruteForceResults[currentKollektivForBF].metric, currentBruteForceResults[currentKollektivForBF].totalCombinations,0,null,0,0,0,0,0, message.error);
                    ui_helpers.showToast(`Fehler bei Brute-Force: ${message.error}`, "danger");
                }
            },
            (error) => {
                isBruteForceRunning = false;
                const activeKollektiv = state.getCurrentKollektiv();
                ui_helpers.updateBruteForceUI('ERROR', activeKollektiv, state.getBruteForceMetricInternal ? state.getBruteForceMetricInternal() : APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC ,0,0,null,0,0,0,0,0, error.message || 'Worker Error');
                ui_helpers.showToast("Fehler beim Initialisieren des Brute-Force Workers. Optimierung nicht möglich.", "danger");
                bruteForceWorkerInstance = null;
                const bfStartButton = document.getElementById('btn-start-brute-force');
                if (bfStartButton) {
                    bfStartButton.disabled = true;
                    bfStartButton.innerHTML = '<i class="fas fa-times-circle me-1"></i> Worker nicht verfügbar';
                }
            }
        );
        bruteForceWorkerInstance = bruteForceManager.getWorker();

        const themeToggleButton = document.getElementById('theme-toggle-button');
        if(themeToggleButton) {
            let currentTheme = localStorage.getItem('app-theme');
            if (!currentTheme || (currentTheme !== 'light' && currentTheme !== 'dark')) { // Ensure valid theme or default
                currentTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                localStorage.setItem('app-theme', currentTheme);
            }
            document.body.setAttribute('data-bs-theme', currentTheme);
            themeToggleButton.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            themeToggleButton.setAttribute('data-tippy-content', currentTheme === 'dark' ? 'Helles Design' : 'Dunkles Design');
            ui_helpers.initializeTooltips(themeToggleButton);
        }
    }

    function _setupEventListeners() {
        generalEventHandlers.setupKollektivSwitch(_updateUI, localRawData, localProcessedData, currentAppliedCriteria, currentAppliedLogic, currentBruteForceResults, publikationTabLogic);
        generalEventHandlers.setupTabNavigation(_updateUI, state);
        generalEventHandlers.setupGlobalActions(localRawData, currentAppliedCriteria, currentAppliedLogic, currentBruteForceResults);

        auswertungTabEventHandlers.setupT2CriteriaChangeHandlers(localRawData, localProcessedData, _updateUI, currentAppliedCriteria, currentAppliedLogic, currentBruteForceResults, publikationTabLogic);
        auswertungTabEventHandlers.setupBruteForceControls(localRawData, () => isBruteForceRunning, bruteForceWorkerInstance, () => currentBruteForceResults);


        statistikTabEventHandlers.setupStatistikTabControls(_updateUI, localRawData, () => state.getAppliedT2Criteria(), () => state.getAppliedT2Logic());
        praesentationTabEventHandlers.setupPraesentationTabControls(_updateUI, localRawData, () => state.getAppliedT2Criteria(), () => state.getAppliedT2Logic());
        publikationEventHandlers.setupPublikationTabControls(_updateUI, localRawData, () => state.getAppliedT2Criteria(), () => state.getAppliedT2Logic(), () => currentBruteForceResults, publikationTabLogic); // Pass logic module
        generalEventHandlers.setupExportTabEventListeners(localRawData, () => state.getAppliedT2Criteria(), () => state.getAppliedT2Logic(), () => currentBruteForceResults);

        document.addEventListener('exportSingleChartRequested', (event) => {
            const { chartElementId, format, chartName, kollektiv, additionalOptions } = event.detail;
            exportService.exportSingleChart(chartElementId, format, kollektiv || state.getCurrentKollektiv(), { chartName, ...additionalOptions });
        });
        document.addEventListener('exportTablePNGRequested', (event) => {
            const { tableElementId, tableName, kollektiv, typeKey } = event.detail;
            exportService.exportTablePNG(tableElementId, kollektiv || state.getCurrentKollektiv(), typeKey || 'TABLE_PNG_EXPORT', tableName);
        });

        const themeToggleButton = document.getElementById('theme-toggle-button');
        if (themeToggleButton) {
            themeToggleButton.addEventListener('click', () => {
                const currentTheme = document.body.getAttribute('data-bs-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.body.setAttribute('data-bs-theme', newTheme);
                localStorage.setItem('app-theme', newTheme);
                themeToggleButton.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
                const tippyInstance = themeToggleButton._tippy;
                if (tippyInstance) tippyInstance.setContent(newTheme === 'dark' ? 'Helles Design' : 'Dunkles Design');
            });
        }

        const kurzanleitungButton = document.getElementById('kurzanleitung-button');
        if (kurzanleitungButton) {
            kurzanleitungButton.addEventListener('click', () => {
                 const anleitungContent = typeof UI_TEXTS !== 'undefined' && UI_TEXTS.kurzanleitung ? UI_TEXTS.kurzanleitung.content.replace('${APP_CONFIG.APP_VERSION}', APP_CONFIG.APP_VERSION).replace('${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL}', String(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL).replace('.',',')) : 'Kurzanleitung nicht verfügbar.';
                 const anleitungTitle = typeof UI_TEXTS !== 'undefined' && UI_TEXTS.kurzanleitung ? UI_TEXTS.kurzanleitung.title : 'Kurzanleitung';
                ui_helpers.showModal(anleitungTitle, anleitungContent);
            });
        }

        // Persist active tab on change
        const mainTabs = document.getElementById('main-tabs');
        if (mainTabs) {
            mainTabs.addEventListener('shown.bs.tab', function (event) {
                if(event.target && event.target.id) {
                    state.setActiveTabInternal(event.target.id); // Hypothetical state function to save tab
                }
            });
        }
    }

    window.onerror = function (message, source, lineno, colno, error) {
        console.error("Globaler Fehler:", message, "in", source, ` Zeile ${lineno}:${colno}`, error);
        const errorMsg = `Ein unerwarteter Fehler ist aufgetreten: ${message}. Details siehe Konsole.`;
        ui_helpers.showToast(errorMsg, "danger", 8000);
        const errorContainer = document.getElementById('global-error-container');
        if(errorContainer) {
            errorContainer.innerHTML = `<div class="alert alert-danger m-3 p-2 small">${errorMsg}</div>`;
            errorContainer.style.display = 'block';
        }
        return true;
    };

    window.addEventListener('DOMContentLoaded', _initializeApplication);

})();
