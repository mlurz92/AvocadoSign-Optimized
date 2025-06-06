let processedData = [];
let currentData = [];
let localRawData = typeof patientDataRaw !== 'undefined' ? patientDataRaw : [];
let stateManager = typeof state !== 'undefined' ? state : {}; // Fallback, wird in init überschrieben
let allKollektivStatsForPublication = null;


const mainAppInterface = {
    handleGlobalKollektivChange: (newKollektiv, source) => _handleGlobalKollektivChange(newKollektiv, source),
    processTabChange: (tabId) => processTabChange(tabId),
    handleSortRequest: (tableContext, key, subKey) => handleSortRequest(tableContext, key, subKey),
    applyAndRefreshAll: () => applyAndRefreshAll(),
    getProcessedData: () => cloneDeep(processedData),
    getRawData: () => cloneDeep(localRawData),
    getAppliedT2Criteria: () => t2CriteriaManager.getAppliedCriteria(),
    getAppliedT2Logic: () => t2CriteriaManager.getAppliedLogic(),
    getAllBruteForceResults: () => bruteForceManager.getAllResults(),
    updateGlobalUIState: () => updateUIState(),
    refreshCurrentTab: () => refreshCurrentTab()
};

const debouncedUpdateSizeInput_Main = debounce((value) => {
    if (typeof auswertungEventHandlers !== 'undefined' && typeof auswertungEventHandlers.handleT2SizeInputChange === 'function') {
        auswertungEventHandlers.handleT2SizeInputChange(value);
    }
}, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);

const debouncedUpdateSizeRange_Main = debounce((value) => {
    if (typeof auswertungEventHandlers !== 'undefined' && typeof auswertungEventHandlers.handleT2SizeRangeChange === 'function') {
        auswertungEventHandlers.handleT2SizeRangeChange(value);
    }
}, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);


function initializeApp() {
    console.log(`Initialisiere ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION}...`);
    const requiredLibs = {
        'bootstrap': typeof bootstrap !== 'undefined' && bootstrap.Toast && bootstrap.Tab && bootstrap.Modal && bootstrap.Collapse,
        'd3': typeof d3 !== 'undefined',
        'tippy': typeof tippy !== 'undefined',
        'Papa': typeof Papa !== 'undefined',
        'JSZip': typeof JSZip !== 'undefined'
    };
    const missingLibs = Object.keys(requiredLibs).filter(lib => !requiredLibs[lib]);

    if (missingLibs.length > 0) {
        console.error("Externe Bibliotheken fehlen oder sind unvollständig:", missingLibs.join(', '));
        ui_helpers.updateElementHTML('app-container', `<div class="alert alert-danger m-5">Fehler: Bibliotheken (${missingLibs.join(', ')}) konnten nicht vollständig geladen werden. Die Anwendung kann nicht gestartet werden.</div>`);
        return;
    }
     if (!document.getElementById('app-container')) {
         console.error("App container ('app-container') nicht gefunden!");
         document.body.innerHTML = `<div class="alert alert-danger m-5">Schwerwiegender Fehler: App-Container nicht im HTML gefunden. Anwendung kann nicht starten.</div>`;
         return;
     }

    try {
        if (typeof stateManager === 'undefined' || typeof t2CriteriaManager === 'undefined' || typeof dataProcessor === 'undefined' ||
            typeof ui_helpers === 'undefined' || typeof exportService === 'undefined' ||
            typeof dataTabRenderer === 'undefined' || typeof auswertungTabRenderer === 'undefined' ||
            typeof statistikTabRenderer === 'undefined' || typeof praesentationTabRenderer === 'undefined' ||
            typeof exportTabRenderer === 'undefined' ||
            typeof publicationController === 'undefined' ||
            typeof studyT2CriteriaManager === 'undefined' ||
            typeof bruteForceManager === 'undefined' || typeof generalEventHandlers === 'undefined' ||
            typeof auswertungEventHandlers === 'undefined' || typeof statistikEventHandlers === 'undefined' ||
            typeof praesentationEventHandlers === 'undefined' || typeof publikationEventHandlers === 'undefined'
        ) {
             throw new Error("Ein oder mehrere Kernmodule oder Event-Handler-Module sind nicht verfügbar. Überprüfen Sie die Skript-Ladereihenfolge und Dateipfade in index.html.");
        }

        stateManager.init();
        t2CriteriaManager.initialize();
        processedData = dataProcessor.processPatientData(localRawData);

        if (processedData.length === 0) {
            console.warn("Keine validen Patientendaten gefunden nach Prozessierung.");
            ui_helpers.showToast("Warnung: Keine validen Patientendaten geladen.", "warning");
        }

        initializeBruteForceManager();
        recalculateAllStatsForPublication();

        filterAndPrepareData();
        updateUIState();
        setupEventListeners();

        const initialTabId = stateManager.getActiveTabId() || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION === 'abstract' ? 'publikation-tab' : 'daten-tab'; // Default to daten-tab or publikation-tab if abstract is default
        const initialTabElement = document.getElementById(initialTabId);
         if(initialTabElement && bootstrap.Tab) {
            const tab = bootstrap.Tab.getOrCreateInstance(initialTabElement);
            if(tab) tab.show();
            stateManager.setActiveTabId(initialTabId);
         } else {
             const fallbackTabId = 'daten-tab';
             stateManager.setActiveTabId(fallbackTabId);
             const fallbackTabElement = document.getElementById(fallbackTabId);
             if(fallbackTabElement && bootstrap.Tab) bootstrap.Tab.getOrCreateInstance(fallbackTabElement).show();
         }
        processTabChange(stateManager.getActiveTabId());

        const mainTabNav = document.getElementById('mainTab');
        if(mainTabNav) {
            mainTabNav.querySelectorAll('.nav-link').forEach(navLink => {
                const tabKey = navLink.id.replace('-tab', '');
                const tooltipText = UI_TEXTS.TOOLTIP_CONTENT.mainTabs[tabKey] || `Wechsel zum Tab '${navLink.textContent.trim()}'`;
                navLink.setAttribute('data-tippy-content', tooltipText);
            });
        }

        if (localStorage.getItem(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START) !== 'false') {
            ui_helpers.showKurzanleitung();
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START, 'false');
        }
        const kurzanleitungButton = document.getElementById('btn-kurzanleitung');
        if (kurzanleitungButton && UI_TEXTS.TOOLTIP_CONTENT.kurzanleitungButton?.description) {
            kurzanleitungButton.setAttribute('data-tippy-content', UI_TEXTS.TOOLTIP_CONTENT.kurzanleitungButton.description);
        }


        ui_helpers.initializeTooltips(document.body);
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());


        ui_helpers.showToast('Anwendung initialisiert.', 'success', 2500);
        console.log("App Initialisierung abgeschlossen.");

    } catch (error) {
         console.error("Fehler während der App-Initialisierung:", error);
         ui_helpers.updateElementHTML('app-container', `<div class="alert alert-danger m-5">Initialisierungsfehler: ${error.message}. Stellen Sie sicher, dass alle Skripte korrekt geladen wurden und die Dateipfade in index.html aktuell sind.</div>`);
    }
}

 function filterAndPrepareData() {
    try {
        const currentKollektiv = stateManager.getCurrentKollektiv();
        const filteredByKollektiv = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv);
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
        const appliedLogic = t2CriteriaManager.getAppliedLogic();
        const evaluatedData = t2CriteriaManager.evaluateDataset(filteredByKollektiv, appliedCriteria, appliedLogic);

        let sortState = null;
        const activeTabId = stateManager.getActiveTabId();
        if (activeTabId === 'daten-tab') { sortState = stateManager.getDatenTableSort(); }
        else if (activeTabId === 'auswertung-tab') { sortState = stateManager.getAuswertungTableSort(); }

        if(sortState && sortState.key) {
             evaluatedData.sort(getSortFunction(sortState.key, sortState.direction, sortState.subKey));
        }
        currentData = evaluatedData;
    } catch (error) {
         console.error("Fehler bei filterAndPrepareData:", error);
         currentData = [];
         ui_helpers.showToast("Fehler bei der Datenaufbereitung.", "danger");
    }
}

function updateUIState() {
    try {
        const currentKollektiv = stateManager.getCurrentKollektiv();
        const headerStats = dataProcessor.calculateHeaderStats(currentData, currentKollektiv);
        ui_helpers.updateHeaderStatsUI(headerStats);
        ui_helpers.updateKollektivButtonsUI(currentKollektiv);
        ui_helpers.updateStatistikSelectorsUI(stateManager.getCurrentStatsLayout(), stateManager.getCurrentStatsKollektiv1(), stateManager.getCurrentStatsKollektiv2());
        ui_helpers.updatePresentationViewSelectorUI(stateManager.getCurrentPresentationView());

        const praesStudySelect = document.getElementById('praes-study-select');
        if (praesStudySelect) {
            praesStudySelect.value = stateManager.getCurrentPresentationStudyId() || '';
        }

        if (stateManager.getActiveTabId() === 'publikation-tab') {
            ui_helpers.updatePublikationUI(stateManager.getCurrentPublikationLang(), stateManager.getCurrentPublikationSection(), stateManager.getCurrentPublikationBruteForceMetric());
        }
        const bfResults = bruteForceManager.getAllResults();
        ui_helpers.updateExportButtonStates(stateManager.getActiveTabId(), bfResults && Object.keys(bfResults).length > 0, currentData && currentData.length > 0);
    } catch (error) {
        console.error("Fehler beim Aktualisieren des globalen UI-Zustands:", error);
    }
}

function setupEventListeners() {
    document.body.addEventListener('click', handleBodyClickDelegation);

    const mainTabEl = document.getElementById('mainTab');
    if (mainTabEl) { mainTabEl.addEventListener('shown.bs.tab', (event) => generalEventHandlers.handleTabShownEvent(event, mainAppInterface)); }
    else { console.error("Haupt-Tab-Navigationselement ('mainTab') nicht gefunden."); }

    document.body.addEventListener('input', (event) => {
        if (event.target.id === 'range-size' && event.target.closest('#auswertung-tab-pane')) {
            debouncedUpdateSizeRange_Main(event.target.value);
        }
    });

    document.body.addEventListener('change', (event) => {
        const target = event.target;
        if (target.closest('#auswertung-tab-pane')) {
             if (target.id === 'input-size') { debouncedUpdateSizeInput_Main(target.value); }
             else if (target.matches('.criteria-checkbox')) { auswertungEventHandlers.handleT2CheckboxChange(target); }
             else if (target.id === 't2-logic-switch') { auswertungEventHandlers.handleT2LogicChange(target); }
             else if (target.id === 'brute-force-metric') { auswertungEventHandlers.handleBruteForceMetricChange(target); }
        } else if (target.closest('#statistik-tab-pane')) {
            if(target.id === 'statistik-kollektiv-select-1' || target.id === 'statistik-kollektiv-select-2') {
                statistikEventHandlers.handleStatistikKollektivChange(target, mainAppInterface);
            }
        } else if (target.closest('#praesentation-tab-pane')) {
            if (target.matches('input[name="praesentationAnsicht"]')) {
                praesentationEventHandlers.handlePresentationViewChange(target.value, mainAppInterface);
            } else if (target.id === 'praes-study-select') {
                praesentationEventHandlers.handlePresentationStudySelectChange(target.value, mainAppInterface);
            }
        } else if (target.closest('.publication-controls-wrapper')) {
             if (target.id === 'publikation-sprache-switch') {
                publikationEventHandlers.handlePublikationSpracheChange(target);
            } else if (target.id === 'publikation-bf-metric-select') {
                publikationEventHandlers.handlePublikationBfMetricChange(target);
            }
        }
    });
}

function handleBodyClickDelegation(event) {
    const target = event.target;
    const closestButton = target.closest('button');
    const closestHeader = target.closest('th[data-sort-key]');
    const closestSubHeader = target.closest('.sortable-sub-header');
    const closestNavLink = target.closest('a.nav-link');

    const clickableRowParent = target.closest('tr.clickable-row[data-bs-target]');
     if (clickableRowParent && (target.closest('a, button, input, select, .btn-close, [data-bs-toggle="modal"], .table-download-png-btn, .chart-download-btn'))) {
        event.stopPropagation();
    }


    if (closestButton?.dataset.kollektiv) { generalEventHandlers.handleKollektivChange(closestButton.dataset.kollektiv, mainAppInterface); return; }
    if (closestHeader) { generalEventHandlers.handleSortClick(closestHeader, closestSubHeader, mainAppInterface); return; }
    if (target.closest('.chart-download-btn[data-chart-id][data-format]')) { generalEventHandlers.handleSingleChartDownload(target.closest('.chart-download-btn')); return; }
    if (target.closest('.table-download-png-btn[data-table-id]')) { generalEventHandlers.handleSingleTableDownload(target.closest('.table-download-png-btn')); return; }
    if (target.closest('#daten-toggle-details')) { generalEventHandlers.handleToggleAllDetailsClick('daten-toggle-details', 'daten-table-body'); return; }
    if (target.closest('#auswertung-toggle-details')) { generalEventHandlers.handleToggleAllDetailsClick('auswertung-toggle-details', 'auswertung-table-body'); return; }
    if (target.closest('#export-bruteforce-modal-txt') && !target.closest('#export-bruteforce-modal-txt').disabled) { generalEventHandlers.handleModalExportBruteForceClick(); return; }
    if (target.closest('#btn-kurzanleitung')) { generalEventHandlers.handleKurzanleitungClick(); return; }


    if (target.closest('#auswertung-tab-pane')) {
        if (target.closest('.t2-criteria-button') && !target.closest('.t2-criteria-button').disabled) { auswertungEventHandlers.handleT2CriteriaButtonClick(target.closest('.t2-criteria-button')); return; }
        if (target.closest('#btn-reset-criteria')) { auswertungEventHandlers.handleResetCriteria(); return; }
        if (target.closest('#btn-apply-criteria')) { auswertungEventHandlers.handleApplyCriteria(mainAppInterface); return; }
        if (target.closest('#btn-start-brute-force') && !target.closest('#btn-start-brute-force').disabled) { auswertungEventHandlers.handleStartBruteForce(mainAppInterface); return; }
        if (target.closest('#btn-cancel-brute-force')) { auswertungEventHandlers.handleCancelBruteForce(); return; }
        if (target.closest('#btn-apply-best-bf-criteria') && !target.closest('#btn-apply-best-bf-criteria').disabled) { auswertungEventHandlers.handleApplyBestBfCriteria(mainAppInterface); return; }
    }
    if (target.closest('#statistik-tab-pane')) {
        if (target.closest('#statistik-toggle-vergleich')) { statistikEventHandlers.handleStatsLayoutToggle(target.closest('#statistik-toggle-vergleich'), mainAppInterface); return;}
    }
    if (target.closest('#export-tab-pane button[id^="export-"]') && !target.closest('#export-tab-pane button[id^="export-"]').disabled && !target.closest('#export-tab-pane button[id^="export-"]').id.startsWith('export-bruteforce-modal')) {
        exportService.exportCategoryZip(target.closest('#export-tab-pane button[id^="export-"]').id.replace('export-', ''), localRawData, bruteForceManager.getAllResults(), stateManager.getCurrentKollektiv(), t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
        return;
    }
    if (target.closest('#praesentation-tab-pane button[id^="download-"]') && !target.closest('#praesentation-tab-pane button[id^="download-"]').disabled && !target.closest('#praesentation-tab-pane button[id^="download-"]').classList.contains('table-download-png-btn') && !target.closest('#praesentation-tab-pane button[id^="download-"]').classList.contains('chart-download-btn')) {
        praesentationEventHandlers.handlePresentationDownloadClick(target.closest('#praesentation-tab-pane button[id^="download-"]'), mainAppInterface);
        return;
    }
     if (closestNavLink && closestNavLink.classList.contains('publikation-section-link')) {
        event.preventDefault();
        publikationEventHandlers.handlePublikationSectionChange(closestNavLink.dataset.sectionId);
        return;
    }
}

function processTabChange(tabId) {
    if (stateManager.setActiveTabId(tabId)) {
        filterAndPrepareData();
        updateUIState();
        _renderCurrentTab(tabId);
    }
}

function _renderCurrentTab(tabId) {
    if (typeof dataTabRenderer === 'undefined' || typeof auswertungTabRenderer === 'undefined' || typeof statistikTabRenderer === 'undefined' || typeof praesentationTabRenderer === 'undefined' || typeof exportTabRenderer === 'undefined' || typeof publicationController === 'undefined') {
        console.error(`Einer der Renderer oder der publicationController ist nicht verfügbar in _renderCurrentTab (Tab: ${tabId}).`);
        ui_helpers.showToast(`Fehler: UI Renderer nicht bereit für Tab '${tabId}'.`, 'danger');
        const paneId = tabId.replace('-tab', '-tab-pane');
        ui_helpers.updateElementHTML(paneId, `<div class="alert alert-danger m-3">Interner Fehler: UI Renderer konnte nicht geladen werden.</div>`);
        return;
    }
    const currentKollektiv = stateManager.getCurrentKollektiv();
    const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
    const appliedLogic = t2CriteriaManager.getAppliedLogic();

    if (['daten-tab', 'auswertung-tab', 'statistik-tab', 'praesentation-tab'].includes(tabId)) {
        filterAndPrepareData();
    }

    switch (tabId) {
        case 'daten-tab': dataTabRenderer.renderDatenTab(currentData, stateManager.getDatenTableSort()); break;
        case 'auswertung-tab': auswertungTabRenderer.renderAuswertungTab(currentData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), stateManager.getAuswertungTableSort(), currentKollektiv, bruteForceManager.isWorkerAvailable()); break;
        case 'statistik-tab': statistikTabRenderer.renderStatistikTab(processedData, appliedCriteria, appliedLogic, stateManager.getCurrentStatsLayout(), stateManager.getCurrentStatsKollektiv1(), stateManager.getCurrentStatsKollektiv2(), currentKollektiv); break;
        case 'praesentation-tab': praesentationTabRenderer.renderPresentationTab(stateManager.getCurrentPresentationView(), stateManager.getCurrentPresentationStudyId(), currentKollektiv, processedData, appliedCriteria, appliedLogic); break;
        case 'publikation-tab':
            recalculateAllStatsForPublication();
            publicationController.initialize(
                mainAppInterface,
                allKollektivStatsForPublication,
                localRawData,
                appliedCriteria,
                appliedLogic,
                bruteForceManager.getAllResults()
            );
            break;
        case 'export-tab': exportTabRenderer.renderExportTab(currentKollektiv); break;
        default: console.warn(`Unbekannter Tab für Rendering: ${tabId}`); const paneId = tabId.replace('-tab', '-tab-pane'); ui_helpers.updateElementHTML(paneId, `<div class="alert alert-warning m-3">Inhalt für Tab '${tabId}' nicht implementiert.</div>`);
    }
}

function _handleGlobalKollektivChange(newKollektiv, source = "user") {
    if (stateManager.setCurrentKollektiv(newKollektiv)) {
        filterAndPrepareData();
        recalculateAllStatsForPublication();
        updateUIState();
        _renderCurrentTab(stateManager.getActiveTabId());
         if (stateManager.getActiveTabId() === 'publikation-tab' && typeof publicationController !== 'undefined' && typeof publicationController.refreshWithNewData === 'function') {
            publicationController.refreshWithNewData(allKollektivStatsForPublication, localRawData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), bruteForceManager.getAllResults());
        }

        if (source === "user") {
            ui_helpers.showToast(`Kollektiv '${getKollektivDisplayName(newKollektiv)}' ausgewählt.`, 'info');
        } else if (source === "auto_praesentation") {
            ui_helpers.showToast(`Globales Kollektiv automatisch auf '${getKollektivDisplayName(newKollektiv)}' gesetzt (passend zur Studienauswahl im Präsentation-Tab).`, 'info', 4000);
            const headerButton = document.querySelector(`header button[data-kollektiv="${newKollektiv}"]`);
            if(headerButton) {
                ui_helpers.highlightElement(headerButton.id);
            }
        }
        return true;
    }
    return false;
}

function handleSortRequest(tableContext, key, subKey = null) {
    let sortStateUpdated = false;
    if (tableContext === 'daten') {
        sortStateUpdated = stateManager.updateDatenTableSortDirection(key, subKey);
    } else if (tableContext === 'auswertung') {
        sortStateUpdated = stateManager.updateAuswertungTableSortDirection(key, subKey);
    }

    if (sortStateUpdated) {
        filterAndPrepareData();
        const sortState = (tableContext === 'daten') ? stateManager.getDatenTableSort() : stateManager.getAuswertungTableSort();
        if (tableContext === 'daten' && stateManager.getActiveTabId() === 'daten-tab') {
            dataTabRenderer.renderDatenTab(currentData, sortState);
        } else if (tableContext === 'auswertung' && stateManager.getActiveTabId() === 'auswertung-tab') {
            auswertungTabRenderer.renderAuswertungTab(currentData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), sortState, stateManager.getCurrentKollektiv(), bruteForceManager.isWorkerAvailable());
        }
    }
}

function applyAndRefreshAll() {
    t2CriteriaManager.applyCriteria();
    filterAndPrepareData();
    recalculateAllStatsForPublication();
    ui_helpers.markCriteriaSavedIndicator(false);
    updateUIState();
    _renderCurrentTab(stateManager.getActiveTabId());
    if (stateManager.getActiveTabId() === 'publikation-tab' && typeof publicationController !== 'undefined' && typeof publicationController.refreshWithNewData === 'function') {
         publicationController.refreshWithNewData(allKollektivStatsForPublication, localRawData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), bruteForceManager.getAllResults());
    }
}

function refreshCurrentTab(){
    if (stateManager.getActiveTabId() === 'publikation-tab') {
        recalculateAllStatsForPublication();
         if (typeof publicationController !== 'undefined' && typeof publicationController.refreshWithNewData === 'function') {
            publicationController.refreshWithNewData(allKollektivStatsForPublication, localRawData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), bruteForceManager.getAllResults());
        } else {
             _renderCurrentTab(stateManager.getActiveTabId());
        }
    } else {
        _renderCurrentTab(stateManager.getActiveTabId());
    }
}

function recalculateAllStatsForPublication() {
    if (typeof statisticsService !== 'undefined' && typeof dataProcessor !== 'undefined' && typeof t2CriteriaManager !== 'undefined' && typeof bruteForceManager !== 'undefined' && localRawData) {
        allKollektivStatsForPublication = statisticsService.calculateAllStatsForPublication(
            localRawData,
            t2CriteriaManager.getAppliedCriteria(),
            t2CriteriaManager.getAppliedLogic(),
            bruteForceManager.getAllResults()
        );
    } else {
        console.warn("Abhängigkeiten für die Neuberechnung von allKollektivStatsForPublication fehlen.");
        allKollektivStatsForPublication = null;
    }
}


function initializeBruteForceManager() {
    const bfCallbacks = {
        onStarted: handleBruteForceStarted,
        onProgress: handleBruteForceProgress,
        onResult: handleBruteForceResult,
        onCancelled: handleBruteForceCancelled,
        onError: handleBruteForceError
    };
    bruteForceManager.init(bfCallbacks);
}

function handleBruteForceStarted(payload) {
    const currentKollektiv = payload?.kollektiv || stateManager.getCurrentKollektiv();
    const metric = document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
    ui_helpers.updateBruteForceUI('started', { ...payload, metric: metric, kollektiv: currentKollektiv }, true, currentKollektiv);
}

function handleBruteForceProgress(payload) {
    const currentKollektiv = payload?.kollektiv || stateManager.getCurrentKollektiv();
    const metric = payload?.metric || document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
    ui_helpers.updateBruteForceUI('progress', {...payload, metric: metric, kollektiv: currentKollektiv}, true, currentKollektiv);
}

function handleBruteForceResult(payload) {
    const resultKollektiv = payload?.kollektiv || stateManager.getCurrentKollektiv();
    ui_helpers.updateBruteForceUI('result', {...payload, kollektiv: resultKollektiv}, true, resultKollektiv);
    if (payload?.results?.length > 0) {
        const modalBody = document.querySelector('#brute-force-modal .modal-body');
        if (modalBody) {
            modalBody.innerHTML = uiComponents.createBruteForceModalContent(payload);
            ui_helpers.initializeTooltips(modalBody);
        }
        ui_helpers.showToast('Optimierung abgeschlossen.', 'success');
        recalculateAllStatsForPublication();
        if (stateManager.getActiveTabId() === 'publikation-tab' && typeof publicationController !== 'undefined' && typeof publicationController.refreshWithNewData === 'function') {
             publicationController.refreshWithNewData(allKollektivStatsForPublication, localRawData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), bruteForceManager.getAllResults());
        }
    } else {
        ui_helpers.showToast('Optimierung ohne valide Ergebnisse.', 'warning');
    }
    updateUIState();
}

function handleBruteForceCancelled(payload) {
    const currentKollektiv = payload?.kollektiv || stateManager.getCurrentKollektiv();
    ui_helpers.updateBruteForceUI('cancelled', {}, bruteForceManager.isWorkerAvailable(), currentKollektiv);
    ui_helpers.showToast('Optimierung abgebrochen.', 'warning');
    updateUIState();
}

function handleBruteForceError(payload) {
    const currentKollektiv = payload?.kollektiv || stateManager.getCurrentKollektiv();
    ui_helpers.showToast(`Optimierungsfehler: ${payload?.message || 'Unbekannt'}`, 'danger');
    ui_helpers.updateBruteForceUI('error', payload, bruteForceManager.isWorkerAvailable(), currentKollektiv);
    updateUIState();
}

document.addEventListener('DOMContentLoaded', initializeApp);
