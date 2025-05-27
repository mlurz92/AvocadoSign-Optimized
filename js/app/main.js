let processedData = [];
let currentData = [];
let localRawData = typeof patientDataRaw !== 'undefined' ? patientDataRaw : [];

const mainAppInterface = {};

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
        if (typeof state === 'undefined' || typeof t2CriteriaManager === 'undefined' || typeof dataProcessor === 'undefined' ||
            typeof viewRenderer === 'undefined' || typeof ui_helpers === 'undefined' || typeof uiComponents === 'undefined' ||
            typeof exportService === 'undefined' || typeof tableRenderer === 'undefined' ||
            typeof dataTabLogic === 'undefined' || typeof auswertungTabLogic === 'undefined' ||
            typeof statistikTabLogic === 'undefined' || typeof praesentationTabLogic === 'undefined' ||
            typeof publikationTabLogic === 'undefined' || typeof publicationRenderer === 'undefined' ||
            typeof publicationTextGenerator === 'undefined' || typeof studyT2CriteriaManager === 'undefined' ||
            typeof bruteForceManager === 'undefined' || typeof generalEventHandlers === 'undefined' ||
            typeof auswertungEventHandlers === 'undefined' || typeof statistikEventHandlers === 'undefined' ||
            typeof praesentationEventHandlers === 'undefined' || typeof publikationEventHandlers === 'undefined' ||
            typeof chartRenderer === 'undefined' || typeof statisticsService === 'undefined'
        ) {
             throw new Error("Ein oder mehrere Kernmodule oder Event-Handler-Module sind nicht verfügbar. Überprüfen Sie die Skript-Ladereihenfolge und Dateipfade in index.html.");
        }

        mainAppInterface.handleGlobalKollektivChange = _handleGlobalKollektivChange;
        mainAppInterface.processTabChange = processTabChange;
        mainAppInterface.handleSortRequest = handleSortRequest;
        mainAppInterface.applyAndRefreshAll = applyAndRefreshAll;
        mainAppInterface.getProcessedData = () => processedData;
        mainAppInterface.getRawData = () => localRawData;
        mainAppInterface.updateGlobalUIState = updateUIState;
        mainAppInterface.refreshCurrentTab = refreshCurrentTab;


        state.init();
        t2CriteriaManager.initialize();

        processedData = dataProcessor.processPatientData(localRawData);

        if (processedData.length === 0) {
            console.warn("Keine validen Patientendaten gefunden nach Prozessierung.");
            ui_helpers.showToast("Warnung: Keine validen Patientendaten geladen.", "warning");
        }

        initializeBruteForceManager();

        publikationTabLogic.initializeData(
            localRawData,
            t2CriteriaManager.getAppliedCriteria(),
            t2CriteriaManager.getAppliedLogic(),
            bruteForceManager.getAllResults()
        );

        filterAndPrepareData();
        updateUIState();
        setupEventListeners();

        const initialTabId = state.getActiveTabId() || 'publikation-tab';
        const initialTabElement = document.getElementById(initialTabId);
         if(initialTabElement && bootstrap.Tab) {
            const tab = bootstrap.Tab.getOrCreateInstance(initialTabElement);
            if(tab) tab.show();
         } else {
             state.setActiveTabId('publikation-tab');
             const fallbackTabElement = document.getElementById('publikation-tab');
             if(fallbackTabElement && bootstrap.Tab) bootstrap.Tab.getOrCreateInstance(fallbackTabElement).show();
         }
        processTabChange(state.getActiveTabId());

        const mainTabNav = document.getElementById('mainTab');
        if(mainTabNav) {
            mainTabNav.querySelectorAll('.nav-link').forEach(navLink => {
                const tabKey = navLink.id.replace('-tab', '');
                const tooltipText = TOOLTIP_CONTENT.mainTabs[tabKey] || `Wechsel zum Tab '${navLink.textContent.trim()}'`;
                navLink.setAttribute('data-tippy-content', tooltipText);
            });
        }

        const kurzanleitungButton = document.getElementById('btn-kurzanleitung');
        if (kurzanleitungButton && TOOLTIP_CONTENT.kurzanleitungButton?.description) {
            kurzanleitungButton.setAttribute('data-tippy-content', TOOLTIP_CONTENT.kurzanleitungButton.description.replace('${APP_CONFIG.APP_VERSION}', APP_CONFIG.APP_VERSION));
        }
        
        if (!loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START)) {
            ui_helpers.showKurzanleitung();
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START, 'shown');
        } else {
            const kurzanleitungModalTitle = document.querySelector('#kurzanleitung-modal .modal-title');
            const kurzanleitungModalBody = document.querySelector('#kurzanleitung-modal .modal-body');
            if (kurzanleitungModalTitle && UI_TEXTS.kurzanleitung?.title) kurzanleitungModalTitle.innerHTML = UI_TEXTS.kurzanleitung.title;
            if (kurzanleitungModalBody && UI_TEXTS.kurzanleitung?.content) {
                 let content = UI_TEXTS.kurzanleitung.content;
                 content = content.replace(/\$\{APP_CONFIG\.APP_VERSION\}/g, APP_CONFIG.APP_VERSION);
                 content = content.replace(/\$\{formatNumber\(APP_CONFIG\.STATISTICAL_CONSTANTS\.SIGNIFICANCE_LEVEL, 2\)\.replace\('\.', ','\)\}/g, formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, 2).replace('.', ','));
                 content = content.replace(/\$\{APP_CONFIG\.UI_SETTINGS\.CONTEXT_HELP_ICON_CLASS\}/g, APP_CONFIG.UI_SETTINGS.CONTEXT_HELP_ICON_CLASS);
                 kurzanleitungModalBody.innerHTML = content;
            }
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
        const currentKollektiv = state.getCurrentKollektiv();
        const filteredByKollektiv = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv);
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
        const appliedLogic = t2CriteriaManager.getAppliedLogic();
        const evaluatedData = t2CriteriaManager.evaluateDataset(filteredByKollektiv, appliedCriteria, appliedLogic);

        let sortState = null;
        const activeTabId = state.getActiveTabId();
        if (activeTabId === 'daten-tab') { sortState = state.getDatenTableSort(); }
        else if (activeTabId === 'auswertung-tab') { sortState = state.getAuswertungTableSort(); }

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
        const currentKollektiv = state.getCurrentKollektiv();
        const headerStats = dataProcessor.calculateHeaderStats(currentData, currentKollektiv);
        ui_helpers.updateHeaderStatsUI(headerStats);
        ui_helpers.updateKollektivButtonsUI(currentKollektiv);
        ui_helpers.updateStatistikSelectorsUI(state.getCurrentStatsLayout(), state.getCurrentStatsKollektiv1(), state.getCurrentStatsKollektiv2());
        ui_helpers.updatePresentationViewSelectorUI(state.getCurrentPresentationView());

        const praesStudySelect = document.getElementById('praes-study-select');
        if (praesStudySelect) {
            praesStudySelect.value = state.getCurrentPresentationStudyId() || '';
        }

        if (state.getActiveTabId() === 'publikation-tab') {
            ui_helpers.updatePublikationUI(state.getCurrentPublikationLang(), state.getCurrentPublikationSection(), state.getCurrentPublikationBruteForceMetric());
        }
        const bfResults = bruteForceManager.getAllResults();
        ui_helpers.updateExportButtonStates(state.getActiveTabId(), bfResults && Object.keys(bfResults).length > 0, currentData && currentData.length > 0);
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
        } else if (target.closest('#publikation-tab-pane')) {
             if (target.id === 'publikation-sprache-switch') {
                publikationEventHandlers.handlePublikationSpracheChange(target, mainAppInterface);
            } else if (target.id === 'publikation-bf-metric-select') {
                publikationEventHandlers.handlePublikationBfMetricChange(target, mainAppInterface);
            }
        }
    });
}

function handleBodyClickDelegation(event) {
    const target = event.target;
    const closestButton = target.closest('button');
    const closestHeader = target.closest('th[data-sort-key]');
    const closestSubHeader = target.closest('.sortable-sub-header');

    const clickableRowParent = target.closest('tr.clickable-row[data-bs-target]');
     if (clickableRowParent && (target.closest('a, button, input, select, .btn-close, [data-bs-toggle="modal"], .table-download-png-btn, .chart-download-btn'))) {
    } else if (clickableRowParent) {
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
        const exportId = target.closest('#export-tab-pane button[id^="export-"]').id.replace('export-', '');
        if (exportId === 'publikation-paket-zip') {
            exportService.exportCategoryZip('publikation_paket', localRawData, bruteForceManager.getAllResults(), state.getCurrentKollektiv(), t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), state.getCurrentPublikationLang(), state.getCurrentPublikationBruteForceMetric());
        } else if (exportId === 'konfiguration-json') {
            exportService.exportConfiguration(state.getCurrentKollektiv(), t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), bruteForceManager.getResultsForKollektiv(state.getCurrentKollektiv()));
        } else {
             exportService.exportCategoryZip(exportId, localRawData, bruteForceManager.getAllResults(), state.getCurrentKollektiv(), t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
        }
        return;
    }
    if (target.closest('#praesentation-tab-pane button[id^="download-"]') && !target.closest('#praesentation-tab-pane button[id^="download-"]').disabled && !target.closest('#praesentation-tab-pane button[id^="download-"]').classList.contains('table-download-png-btn') && !target.closest('#praesentation-tab-pane button[id^="download-"]').classList.contains('chart-download-btn')) {
        praesentationEventHandlers.handlePresentationDownloadClick(target.closest('#praesentation-tab-pane button[id^="download-"]'), mainAppInterface);
        return;
    }
     if (target.closest('#publikation-sections-nav .publikation-section-link')) {
        event.preventDefault();
        publikationEventHandlers.handlePublikationSectionChange(target.closest('#publikation-sections-nav .publikation-section-link').dataset.sectionId, mainAppInterface);
        return;
    }
}

function processTabChange(tabId) {
    if (state.setActiveTabId(tabId)) {
        filterAndPrepareData();
        updateUIState();
        _renderCurrentTab(tabId);
    }
}

function _renderCurrentTab(tabId) {
    if (typeof viewRenderer === 'undefined') {
        console.error(`viewRenderer ist nicht verfügbar in _renderCurrentTab (Tab: ${tabId}).`);
        ui_helpers.showToast(`Fehler: UI Renderer nicht bereit für Tab '${tabId}'.`, 'danger');
        const paneId = tabId.replace('-tab', '-tab-pane');
        ui_helpers.updateElementHTML(paneId, `<div class="alert alert-danger m-3">Interner Fehler: UI Renderer konnte nicht geladen werden.</div>`);
        return;
    }
    const currentKollektiv = state.getCurrentKollektiv();
    const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
    const appliedLogic = t2CriteriaManager.getAppliedLogic();

    if (['daten-tab', 'auswertung-tab', 'statistik-tab', 'praesentation-tab'].includes(tabId)) {
        filterAndPrepareData();
    }

    switch (tabId) {
        case 'daten-tab': viewRenderer.renderDatenTab(currentData, state.getDatenTableSort()); break;
        case 'auswertung-tab': viewRenderer.renderAuswertungTab(currentData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), state.getAuswertungTableSort(), currentKollektiv, bruteForceManager.isWorkerAvailable()); break;
        case 'statistik-tab': viewRenderer.renderStatistikTab(processedData, appliedCriteria, appliedLogic, state.getCurrentStatsLayout(), state.getCurrentStatsKollektiv1(), state.getCurrentStatsKollektiv2(), currentKollektiv); break;
        case 'praesentation-tab': viewRenderer.renderPresentationTab(state.getCurrentPresentationView(), state.getCurrentPresentationStudyId(), currentKollektiv, processedData, appliedCriteria, appliedLogic); break;
        case 'publikation-tab':
            publikationTabLogic.initializeData(
                localRawData, 
                appliedCriteria,
                appliedLogic,
                bruteForceManager.getAllResults()
            );
            viewRenderer.renderPublikationTab(state.getCurrentPublikationLang(), state.getCurrentPublikationSection(), currentKollektiv, localRawData, bruteForceManager.getAllResults());
            break;
        case 'export-tab': viewRenderer.renderExportTab(currentKollektiv); break;
        default: console.warn(`Unbekannter Tab für Rendering: ${tabId}`); const paneId = tabId.replace('-tab', '-tab-pane'); ui_helpers.updateElementHTML(paneId, `<div class="alert alert-warning m-3">Inhalt für Tab '${tabId}' nicht implementiert.</div>`);
    }
}

function _handleGlobalKollektivChange(newKollektiv, source = "user") {
    if (state.setCurrentKollektiv(newKollektiv)) {
        filterAndPrepareData();
        updateUIState();
        _renderCurrentTab(state.getActiveTabId());
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
        sortStateUpdated = state.updateDatenTableSortDirection(key, subKey);
    } else if (tableContext === 'auswertung') {
        sortStateUpdated = state.updateAuswertungTableSortDirection(key, subKey);
    }

    if (sortStateUpdated) {
        filterAndPrepareData();
        const sortState = (tableContext === 'daten') ? state.getDatenTableSort() : state.getAuswertungTableSort();
        if (tableContext === 'daten' && state.getActiveTabId() === 'daten-tab') {
            viewRenderer.renderDatenTab(currentData, sortState);
        } else if (tableContext === 'auswertung' && state.getActiveTabId() === 'auswertung-tab') {
            viewRenderer.renderAuswertungTab(currentData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), sortState, state.getCurrentKollektiv(), bruteForceManager.isWorkerAvailable());
        }
    }
}

function applyAndRefreshAll() {
    t2CriteriaManager.applyCriteria();
    filterAndPrepareData();
    ui_helpers.markCriteriaSavedIndicator(false);
    updateUIState();
    _renderCurrentTab(state.getActiveTabId());
}

function refreshCurrentTab(){
    _renderCurrentTab(state.getActiveTabId());
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
    const currentKollektiv = payload?.kollektiv || state.getCurrentKollektiv();
    const metric = document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
    ui_helpers.updateBruteForceUI('started', { ...payload, metric: metric, kollektiv: currentKollektiv }, true, currentKollektiv);
}

function handleBruteForceProgress(payload) {
    const currentKollektiv = payload?.kollektiv || state.getCurrentKollektiv();
    const metric = payload?.metric || document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
    ui_helpers.updateBruteForceUI('progress', {...payload, metric: metric, kollektiv: currentKollektiv}, true, currentKollektiv);
}

function handleBruteForceResult(payload) {
    const resultKollektiv = payload?.kollektiv || state.getCurrentKollektiv();
    ui_helpers.updateBruteForceUI('result', {...payload, kollektiv: resultKollektiv}, true, resultKollektiv);
    if (payload?.results?.length > 0) {
        const modalBody = document.querySelector('#brute-force-modal .modal-body');
        if (modalBody) {
            modalBody.innerHTML = uiComponents.createBruteForceModalContent(payload);
            ui_helpers.initializeTooltips(modalBody);
        }
        ui_helpers.showToast('Optimierung abgeschlossen.', 'success');
        publikationTabLogic.initializeData(localRawData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), bruteForceManager.getAllResults());
        if (state.getActiveTabId() === 'publikation-tab') {
            _renderCurrentTab('publikation-tab');
        }
    } else {
        ui_helpers.showToast('Optimierung ohne valide Ergebnisse.', 'warning');
    }
    updateUIState();
}

function handleBruteForceCancelled(payload) {
    const currentKollektiv = payload?.kollektiv || state.getCurrentKollektiv();
    ui_helpers.updateBruteForceUI('cancelled', {}, bruteForceManager.isWorkerAvailable(), currentKollektiv);
    ui_helpers.showToast('Optimierung abgebrochen.', 'warning');
    updateUIState();
}

function handleBruteForceError(payload) {
    const currentKollektiv = payload?.kollektiv || state.getCurrentKollektiv();
    ui_helpers.showToast(`Optimierungsfehler: ${payload?.message || 'Unbekannt'}`, 'danger');
    ui_helpers.updateBruteForceUI('error', payload, bruteForceManager.isWorkerAvailable(), currentKollektiv);
    updateUIState();
}

document.addEventListener('DOMContentLoaded', initializeApp);
