(() => {
    let localRawData = [];
    let localProcessedData = [];
    let currentAppliedCriteria = state.getAppliedT2Criteria();
    let currentAppliedLogic = state.getAppliedT2Logic();
    let allKollektivStatsCache = null; // Wird von StatistikTabLogic verwendet
    let currentBruteForceResults = {}; // Pro Kollektiv ID
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
        const currentChartColorScheme = state.getCurrentChartColorScheme();

        const filteredData = dataProcessor.filterDataByKollektiv(localProcessedData, currentKollektiv);

        viewRenderer.renderAppHeader(localProcessedData, currentKollektiv);
        viewRenderer.renderDatenTab(filteredData);
        viewRenderer.renderAuswertungTab(
            dataProcessor.filterDataByKollektiv(localRawData, currentKollektiv), // Rohdaten für Dashboard
            filteredData, // verarbeitete Daten für Tabelle
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
            currentBruteForceResults, // Alle BF Ergebnisse übergeben
            currentPublikationLang,
            currentPublikationSection,
            currentPublikationBfMetric
        );
        viewRenderer.renderExportTab(currentKollektiv);

        ui_helpers.updateActiveKollektivButton(currentKollektiv);
        ui_helpers.updateActiveTab(activeTabOverride || state.getActiveTabInternal() || 'daten-tab'); // state.getActiveTabInternal() ist hypothetisch, Logik kommt aus _setupEventListeners
        ui_helpers.initializeTooltips(); // Re-initialisiere Tooltips für neu gerenderte Elemente
    }


    function _initializeApplication() {
        console.log(`Starte Avocado Sign Analyse Tool v${APP_CONFIG.APP_VERSION}`);
        const isFirstStart = state.loadStateFromLocalStorage();
        if (isFirstStart) {
            ui_helpers.showToast("Willkommen! Dies scheint Ihr erster Start zu sein. Eine Kurzanleitung finden Sie über den Info-Button oben rechts.", "info", 7000);
            state.setFirstAppStart(false);
        }

        currentAppliedCriteria = state.getAppliedT2Criteria();
        currentAppliedLogic = state.getAppliedT2Logic();
        document.getElementById('app-version-display').textContent = `v${APP_CONFIG.APP_VERSION}`;


        try {
            localRawData = PATIENT_DATA ? cloneDeep(PATIENT_DATA) : [];
            if (localRawData.length === 0) {
                throw new Error("Patientendaten (PATIENT_DATA) konnten nicht geladen werden oder sind leer.");
            }
            localProcessedData = dataProcessor.processRawData(localRawData);
            localProcessedData = t2CriteriaManager.evaluateDataset(localProcessedData, currentAppliedCriteria, currentAppliedLogic);
        } catch (error) {
            console.error("Fehler bei der Initialisierung der Basisdaten:", error);
            ui_helpers.showToast("Kritischer Fehler: Basisdaten konnten nicht geladen oder verarbeitet werden. Die Anwendung ist möglicherweise nicht funktionsfähig.", "danger", 10000);
            document.getElementById('app-container').innerHTML = `<div class="alert alert-danger m-5">Fehler beim Laden der App-Daten. Bitte Konsole prüfen.</div>`;
            return;
        }
        
        // Initialisiere Tab-spezifische Logiken, die Daten benötigen
        datenTabLogic.initializeTable(dataProcessor.filterDataByKollektiv(localProcessedData, state.getCurrentKollektiv()));
        auswertungTabLogic.initializeDashboardAndTable(
            dataProcessor.filterDataByKollektiv(localRawData, state.getCurrentKollektiv()), // Für Dashboard
            dataProcessor.filterDataByKollektiv(localProcessedData, state.getCurrentKollektiv()), // Für Tabelle
            currentAppliedCriteria, currentAppliedLogic
        );
        statistikTabLogic.initializeStatistics(localRawData, currentAppliedCriteria, currentAppliedLogic, state.getCurrentKollektiv(), state.getCurrentStatsLayout(), state.getCurrentStatsKollektiv1(), state.getCurrentStatsKollektiv2());
        praesentationTabLogic.initializePraesentation(localRawData, currentAppliedCriteria, currentAppliedLogic, state.getCurrentKollektiv(), state.getCurrentPresentationView(), state.getCurrentPresentationStudyId());
        publikationTabLogic.initializeData(localRawData, currentAppliedCriteria, currentAppliedLogic, currentBruteForceResults);


        _updateUI(state.getActiveTabInternal() || 'daten-tab'); // Rendere UI basierend auf geladenem oder Standardzustand
        _setupEventListeners();
        ui_helpers.initializeTooltips(document.body); // Globale Initialisierung

        bruteForceManager.initializeWorker(
            APP_CONFIG.PATHS.BRUTE_FORCE_WORKER,
            (message) => { // onMessage
                if (message.type === 'START') {
                    isBruteForceRunning = true;
                    currentBruteForceResults[message.kollektiv] = { status: 'running', progress: 0, results: [], bestResult: null, metric: message.metric, kollektiv: message.kollektiv };
                    ui_helpers.updateBruteForceUI('START', message.kollektiv, message.metric, message.totalCombinations);
                    ui_helpers.showToast(`Brute-Force für Kollektiv '${getKollektivDisplayName(message.kollektiv)}' gestartet (${formatNumber(message.totalCombinations,0)} Kombinationen).`, "info");
                } else if (message.type === 'PROGRESS') {
                    currentBruteForceResults[message.kollektiv].progress = message.progress;
                    currentBruteForceResults[message.kollektiv].bestResult = message.currentBest;
                    currentBruteForceResults[message.kollektiv].testedCount = message.testedCount;
                    ui_helpers.updateBruteForceUI('PROGRESS', message.kollektiv, message.metric, message.totalCombinations, message.progress, message.currentBest, message.testedCount);
                } else if (message.type === 'DONE') {
                    isBruteForceRunning = false;
                    currentBruteForceResults[message.kollektiv] = {
                        status: 'done',
                        progress: 1,
                        results: message.results,
                        bestResult: message.results[0] || null, // Das beste Ergebnis ist das erste
                        metric: message.metric,
                        kollektiv: message.kollektiv,
                        duration: message.duration,
                        totalTested: message.totalTested,
                        nGesamt: message.nGesamt,
                        nPlus: message.nPlus,
                        nMinus: message.nMinus
                    };
                    ui_helpers.updateBruteForceUI('DONE', message.kollektiv, message.metric, message.totalTested, 1, message.results[0], message.totalTested, message.duration, message.nGesamt, message.nPlus, message.nMinus);
                    ui_helpers.showToast(`Brute-Force für Kollektiv '${getKollektivDisplayName(message.kollektiv)}' abgeschlossen.`, "success");
                    _updateUI(); // Aktualisiere UI, falls Ergebnisse in anderen Tabs verwendet werden (z.B. Publikation)
                } else if (message.type === 'CANCELLED') {
                    isBruteForceRunning = false;
                     currentBruteForceResults[message.kollektiv] = { status: 'cancelled', progress: 0, results: [], bestResult: null, metric: message.metric, kollektiv: message.kollektiv };
                    ui_helpers.updateBruteForceUI('CANCELLED', message.kollektiv, message.metric);
                    ui_helpers.showToast(`Brute-Force für Kollektiv '${getKollektivDisplayName(message.kollektiv)}' abgebrochen.`, "warning");
                } else if (message.type === 'ERROR') {
                    isBruteForceRunning = false;
                    currentBruteForceResults[message.kollektiv] = { status: 'error', error: message.error, metric: message.metric, kollektiv: message.kollektiv };
                    ui_helpers.updateBruteForceUI('ERROR', message.kollektiv, message.metric, 0,0,null,0,0,0,0,0, message.error);
                    ui_helpers.showToast(`Fehler bei Brute-Force: ${message.error}`, "danger");
                }
            },
            (error) => { // onError
                isBruteForceRunning = false;
                ui_helpers.updateBruteForceUI('ERROR', state.getCurrentKollektiv(), state.getBruteForceMetricInternal ? state.getBruteForceMetricInternal() : 'N/A',0,0,null,0,0,0,0,0, error.message || 'Worker Error');
                ui_helpers.showToast("Fehler beim Initialisieren des Brute-Force Workers. Optimierung nicht möglich.", "danger");
                bruteForceWorkerInstance = null; // Markiere als nicht verfügbar
                // UI-Update, um Start-Button zu deaktivieren, falls noch nicht geschehen
                const bfStartButton = document.getElementById('btn-start-brute-force');
                if (bfStartButton) {
                    bfStartButton.disabled = true;
                    bfStartButton.innerHTML = '<i class="fas fa-times-circle me-1"></i> Worker nicht verfügbar';
                }
            }
        );
        bruteForceWorkerInstance = bruteForceManager.getWorker(); // Speichere die Instanz für späteren Zugriff

        const themeToggleButton = document.getElementById('theme-toggle-button');
        if(themeToggleButton) {
            const currentTheme = localStorage.getItem('app-theme') || 'light';
            document.body.setAttribute('data-bs-theme', currentTheme);
            themeToggleButton.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            themeToggleButton.setAttribute('data-tippy-content', currentTheme === 'dark' ? 'Helles Design' : 'Dunkles Design');
        }


    }

    function _setupEventListeners() {
        generalEventHandlers.setupKollektivSwitch(_updateUI, localProcessedData, localRawData, currentAppliedCriteria, currentAppliedLogic, currentBruteForceResults);
        generalEventHandlers.setupTabNavigation(_updateUI);
        generalEventHandlers.setupGlobalActions(localProcessedData, currentAppliedCriteria, currentAppliedLogic);

        auswertungTabEventHandlers.setupT2CriteriaChangeHandlers(localRawData, localProcessedData, _updateUI, currentAppliedCriteria, currentAppliedLogic, currentBruteForceResults);
        auswertungTabEventHandlers.setupBruteForceControls(localProcessedData, isBruteForceRunning, bruteForceWorkerInstance);

        statistikTabEventHandlers.setupStatistikTabControls(_updateUI, localRawData, currentAppliedCriteria, currentAppliedLogic);
        praesentationTabEventHandlers.setupPraesentationTabControls(_updateUI, localRawData, currentAppliedCriteria, currentAppliedLogic);
        publikationEventHandlers.setupPublikationTabControls(_updateUI, localRawData, currentAppliedCriteria, currentAppliedLogic, currentBruteForceResults);
        generalEventHandlers.setupExportTabEventListeners(localRawData, currentAppliedCriteria, currentAppliedLogic, currentBruteForceResults);

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
                themeToggleButton.setAttribute('data-tippy-content', newTheme === 'dark' ? 'Helles Design' : 'Dunkles Design');
                ui_helpers.initializeTooltips(themeToggleButton); // Tippy Update für dieses Element
            });
        }

        const kurzanleitungButton = document.getElementById('kurzanleitung-button');
        if (kurzanleitungButton) {
            kurzanleitungButton.addEventListener('click', () => {
                ui_helpers.showModal(UI_TEXTS.kurzanleitung.title, UI_TEXTS.kurzanleitung.content);
            });
        }
    }

    window.onerror = function (message, source, lineno, colno, error) {
        console.error("Globaler Fehler:", message, "in", source, ` Zeile ${lineno}:${colno}`, error);
        const errorMsg = `Ein unerwarteter Fehler ist aufgetreten: ${message}. Details siehe Konsole.`;
        ui_helpers.showToast(errorMsg, "danger", 8000);
        const errorContainer = document.getElementById('global-error-container');
        if(errorContainer) {
            errorContainer.innerHTML = `<div class="alert alert-danger m-3">${errorMsg}</div>`;
            errorContainer.style.display = 'block';
        }
        return true; // Verhindert Default-Fehlerbehandlung des Browsers
    };

    window.addEventListener('DOMContentLoaded', _initializeApplication);

})();
