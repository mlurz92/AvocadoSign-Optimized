let processedData = [];
let currentData = [];
let localRawData = typeof patientDataRaw !== 'undefined' ? patientDataRaw : [];

const debouncedUpdateSizeInput = debounce(handleT2SizeInputChange, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);
const debouncedUpdateSizeRange = debounce(handleT2SizeRangeChange, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);

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
            typeof viewRenderer === 'undefined' || typeof ui_helpers === 'undefined' || typeof exportService === 'undefined' ||
            typeof dataTabLogic === 'undefined' || typeof auswertungTabLogic === 'undefined' ||
            typeof statistikTabLogic === 'undefined' || typeof praesentationTabLogic === 'undefined' ||
            typeof publikationTabLogic === 'undefined' || typeof publicationRenderer === 'undefined' ||
            typeof publicationTextGenerator === 'undefined' || typeof studyT2CriteriaManager === 'undefined' ||
            typeof bruteForceManager === 'undefined'
        ) {
             throw new Error("Ein oder mehrere Kernmodule sind nicht verfügbar. Überprüfen Sie die Skript-Ladereihenfolge und Dateipfade in index.html.");
        }

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
        
        const initialTabId = state.getActiveTabId() || 'daten-tab';
        const initialTabElement = document.getElementById(initialTabId);
         if(initialTabElement && bootstrap.Tab) {
            const tab = bootstrap.Tab.getOrCreateInstance(initialTabElement);
            if(tab) tab.show();
         } else {
             state.setActiveTabId('daten-tab');
             const fallbackTabElement = document.getElementById('daten-tab');
             if(fallbackTabElement && bootstrap.Tab) bootstrap.Tab.getOrCreateInstance(fallbackTabElement).show();
         }
        handleTabShown(state.getActiveTabId());

        const mainTabNav = document.getElementById('mainTab');
        if(mainTabNav) {
            mainTabNav.querySelectorAll('.nav-link').forEach(navLink => {
                const tabKey = navLink.id.replace('-tab', '');
                const tooltipText = TOOLTIP_CONTENT.mainTabs[tabKey] || `Wechsel zum Tab '${navLink.textContent.trim()}'`;
                navLink.setAttribute('data-tippy-content', tooltipText);
            });
        }
        ui_helpers.initializeTooltips(document.body);
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());

        const kurzanleitungModalTitle = document.querySelector('#kurzanleitung-modal .modal-title');
        const kurzanleitungModalBody = document.querySelector('#kurzanleitung-modal .modal-body');
        if (kurzanleitungModalTitle) kurzanleitungModalTitle.innerHTML = UI_TEXTS.kurzanleitung.title;
        if (kurzanleitungModalBody) kurzanleitungModalBody.innerHTML = UI_TEXTS.kurzanleitung.content;


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
    if (mainTabEl) { mainTabEl.addEventListener('shown.bs.tab', handleTabShownEvent); }
    else { console.error("Haupt-Tab-Navigationselement ('mainTab') nicht gefunden."); }

    document.body.addEventListener('input', (event) => {
        if (event.target.id === 'range-size' && event.target.closest('#auswertung-tab-pane')) {
            debouncedUpdateSizeRange(event.target.value);
        }
    });

    document.body.addEventListener('change', (event) => {
        const target = event.target;
        if (target.closest('#auswertung-tab-pane')) {
             if (target.id === 'input-size') { debouncedUpdateSizeInput(target.value); }
             else if (target.matches('.criteria-checkbox')) { handleT2CheckboxChange(target); }
             else if (target.id === 't2-logic-switch') { handleT2LogicChange(target); }
             else if (target.id === 'brute-force-metric') { }
        } else if (target.closest('#statistik-tab-pane')) { handleStatistikChange(event); }
        else if (target.closest('#praesentation-tab-pane')) { handlePresentationChangeDelegation(event); }
        else if (target.closest('#publikation-tab-pane')) { handlePublikationChange(event); }
    });
}

function handleBodyClickDelegation(event) {
    const target = event.target;
    const closestButton = target.closest('button');
    const closestHeader = target.closest('th[data-sort-key]');
    const closestSubHeader = target.closest('.sortable-sub-header');
    const chartDownloadButton = target.closest('.chart-download-btn[data-chart-id][data-format]');
    const tableDownloadButton = target.closest('.table-download-png-btn[data-table-id]');
    const kollektivButton = target.closest('header button[data-kollektiv]');
    const auswertungPane = target.closest('#auswertung-tab-pane');
    const statistikPane = target.closest('#statistik-tab-pane');
    const exportButton = target.closest('#export-tab-pane button[id^="export-"]');
    const praesDownloadButton = target.closest('#praesentation-tab-pane button[id^="download-"]');
    const toggleAllDatenBtn = target.closest('#daten-toggle-details');
    const toggleAllAuswBtn = target.closest('#auswertung-toggle-details');
    const modalExportBtn = target.closest('#export-bruteforce-modal-txt');
    const publikationNavLink = target.closest('#publikation-sections-nav .publikation-section-link');
    const kurzanleitungButton = target.closest('#btn-kurzanleitung');

    const clickableRowParent = target.closest('tr.clickable-row[data-bs-target]');
    if (clickableRowParent && target.closest('a, button, input, select, .btn-close, [data-bs-toggle="modal"], .table-download-png-btn, .chart-download-btn')) {
        event.stopPropagation();
        return;
    }

    if (kollektivButton && kollektivButton.dataset.kollektiv) { handleKollektivChange(kollektivButton.dataset.kollektiv); return; }
    if (closestHeader) { handleSortClick(closestHeader, closestSubHeader); return; }
    if (chartDownloadButton) { handleSingleChartDownload(chartDownloadButton); return; }
    if (tableDownloadButton) { handleSingleTableDownload(tableDownloadButton); return; }
    if (toggleAllDatenBtn) { ui_helpers.toggleAllDetails('daten-table-body', 'daten-toggle-details'); return; }
    if (toggleAllAuswBtn) { ui_helpers.toggleAllDetails('auswertung-table-body', 'auswertung-toggle-details'); return; }
    if (modalExportBtn && !modalExportBtn.disabled) { exportService.exportBruteForceReport(bruteForceManager.getResultsForKollektiv(state.getCurrentKollektiv()), state.getCurrentKollektiv()); return; }
    if (publikationNavLink) { event.preventDefault(); handlePublikationSectionChange(publikationNavLink.dataset.sectionId); return; }
    if (kurzanleitungButton) { ui_helpers.showKurzanleitung(); return; }


    if (auswertungPane) {
        const criteriaButton = target.closest('.t2-criteria-button'); const resetButton = target.closest('#btn-reset-criteria'); const applyButton = target.closest('#btn-apply-criteria'); const startBfButton = target.closest('#btn-start-brute-force'); const cancelBfButton = target.closest('#btn-cancel-brute-force'); const applyBestBfButton = target.closest('#btn-apply-best-bf-criteria');
        if (criteriaButton && !criteriaButton.disabled) handleT2CriteriaButtonClick(criteriaButton); else if (resetButton) handleResetCriteria(); else if (applyButton) handleApplyCriteria(); else if (startBfButton && !startBfButton.disabled) handleStartBruteForce(); else if (cancelBfButton) handleCancelBruteForce(); else if (applyBestBfButton && !applyBestBfButton.disabled) handleApplyBestBfCriteria(); return;
    }
    if (statistikPane) { const statsToggleButton = target.closest('#statistik-toggle-vergleich'); if(statsToggleButton) { handleStatsLayoutToggle(statsToggleButton); return; } }
    if (exportButton && !exportButton.disabled && !exportButton.id.startsWith('export-bruteforce-modal')) { handleExportAction(exportButton.id.replace('export-', '')); return; }
    if (praesDownloadButton && !praesDownloadButton.disabled && !praesDownloadButton.classList.contains('table-download-png-btn') && !praesDownloadButton.classList.contains('chart-download-btn')) { handlePresentationDownloadClick(praesDownloadButton); return; }
}

function handleTabShownEvent(event) {
    if (event.target && event.target.id && state.setActiveTabId(event.target.id)) {
        filterAndPrepareData();
        updateUIState();
        handleTabShown(event.target.id);
    }
}

function handleTabShown(tabId) {
    if (typeof viewRenderer === 'undefined') {
        console.error(`viewRenderer ist nicht verfügbar in handleTabShown (Tab: ${tabId}).`);
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
        default: console.warn(`Unbekannter Tab angezeigt: ${tabId}`); const paneId = tabId.replace('-tab', '-tab-pane'); ui_helpers.updateElementHTML(paneId, `<div class="alert alert-warning m-3">Inhalt für Tab '${tabId}' nicht implementiert.</div>`);
    }
    updateUIState();
}

function _handleGlobalKollektivChange(newKollektiv, source = "user") {
    if (state.setCurrentKollektiv(newKollektiv)) {
        filterAndPrepareData();
        updateUIState();
        handleTabShown(state.getActiveTabId());
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

function handleKollektivChange(newKollektiv) {
    return _handleGlobalKollektivChange(newKollektiv, "user");
}

function handleSortClick(sortHeader, sortSubHeader) { const key = sortHeader?.dataset.sortKey; if (!key) return; const subKey = sortSubHeader?.dataset.subKey || null; const tableBody = sortHeader.closest('table')?.querySelector('tbody'); let tableId = null; if (tableBody?.id === 'daten-table-body') tableId = 'daten'; else if (tableBody?.id === 'auswertung-table-body') tableId = 'auswertung'; if (tableId) handleSort(tableId, key, subKey); }
function handleSort(tableId, key, subKey = null) { let sortStateUpdated = false; if(tableId === 'daten') sortStateUpdated = state.updateDatenTableSortDirection(key, subKey); else if (tableId === 'auswertung') sortStateUpdated = state.updateAuswertungTableSortDirection(key, subKey); if(sortStateUpdated) { const sortState = (tableId === 'daten') ? state.getDatenTableSort() : state.getAuswertungTableSort(); filterAndPrepareData(); if (tableId === 'daten' && state.getActiveTabId() === 'daten-tab') viewRenderer.renderDatenTab(currentData, sortState); else if (tableId === 'auswertung' && state.getActiveTabId() === 'auswertung-tab') { viewRenderer.renderAuswertungTab(currentData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), sortState, state.getCurrentKollektiv(), bruteForceManager.isWorkerAvailable() ); } } }
function handleT2CheckboxChange(checkbox) { const key = checkbox.value; const isActive = checkbox.checked; if(t2CriteriaManager.toggleCriterionActive(key, isActive)){ ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleT2LogicChange(logicSwitch) { const newLogic = logicSwitch.checked ? 'ODER' : 'UND'; if(t2CriteriaManager.updateLogic(newLogic)) { ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleT2CriteriaButtonClick(button) { const criterionKey = button.dataset.criterion; const value = button.dataset.value; let changed = false; if (!t2CriteriaManager.getCurrentCriteria()[criterionKey]?.active) changed = t2CriteriaManager.toggleCriterionActive(criterionKey, true) || changed; changed = t2CriteriaManager.updateCriterionValue(criterionKey, value) || changed; if (changed) { ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleT2SizeInputChange(value) { if (t2CriteriaManager.updateCriterionThreshold(value)) { if (!t2CriteriaManager.getCurrentCriteria().size?.active) t2CriteriaManager.toggleCriterionActive('size', true); ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } else { const current = t2CriteriaManager.getCurrentCriteria().size?.threshold; const input = document.getElementById('input-size'); if(input && current !== undefined) input.value = formatNumber(current, 1, '', true); ui_helpers.showToast("Ungültiger Wert für Größe.", "warning"); } }
function handleT2SizeRangeChange(value) { if (t2CriteriaManager.updateCriterionThreshold(value)) { if (!t2CriteriaManager.getCurrentCriteria().size?.active) t2CriteriaManager.toggleCriterionActive('size', true); ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleResetCriteria() { t2CriteriaManager.resetCriteria(); ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); ui_helpers.showToast('T2 Kriterien zurückgesetzt (nicht angewendet).', 'info'); }
function handleApplyCriteria() { t2CriteriaManager.applyCriteria(); filterAndPrepareData(); ui_helpers.markCriteriaSavedIndicator(false); updateUIState(); handleTabShown(state.getActiveTabId()); ui_helpers.showToast('T2-Kriterien angewendet & gespeichert.', 'success'); }
function handleApplyBestBfCriteria() { const currentKollektiv = state.getCurrentKollektiv(); const bfResultForKollektiv = bruteForceManager.getResultsForKollektiv(currentKollektiv); if (!bfResultForKollektiv?.bestResult?.criteria) { ui_helpers.showToast('Keine gültigen Brute-Force-Ergebnisse für dieses Kollektiv zum Anwenden.', 'warning'); return; } const best = bfResultForKollektiv.bestResult; Object.keys(best.criteria).forEach(key => { if(key === 'logic') return; const criterion = best.criteria[key]; t2CriteriaManager.toggleCriterionActive(key, criterion.active); if(criterion.active) { if(key === 'size') t2CriteriaManager.updateCriterionThreshold(criterion.threshold); else t2CriteriaManager.updateCriterionValue(key, criterion.value); } }); t2CriteriaManager.updateLogic(best.logic); ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); handleApplyCriteria(); ui_helpers.showToast('Beste Brute-Force Kriterien angewendet & gespeichert.', 'success'); }
function handleStatsLayoutToggle(button) { setTimeout(() => { const isPressed = button.classList.contains('active'); const newLayout = isPressed ? 'vergleich' : 'einzel'; if (state.setCurrentStatsLayout(newLayout)) { updateUIState(); if (state.getActiveTabId() === 'statistik-tab') handleTabShown('statistik-tab'); } }, 50); }
function handleStatistikChange(event) { const target = event.target; let needsRender = false; if (target.id === 'statistik-kollektiv-select-1') needsRender = state.setCurrentStatsKollektiv1(target.value); else if (target.id === 'statistik-kollektiv-select-2') needsRender = state.setCurrentStatsKollektiv2(target.value); if(needsRender && state.getCurrentStatsLayout() === 'vergleich' && state.getActiveTabId() === 'statistik-tab') handleTabShown('statistik-tab'); }
function handlePresentationChangeDelegation(event) { const viewRadio = event.target.closest('input[name="praesentationAnsicht"]'); const studySelect = event.target.closest('#praes-study-select'); if(viewRadio) handlePresentationViewChange(viewRadio.value); else if (studySelect) handlePresentationStudySelectChange(studySelect.value); }
function handlePresentationViewChange(view) { if (state.setCurrentPresentationView(view)) { updateUIState(); if (state.getActiveTabId() === 'praesentation-tab') handleTabShown('praesentation-tab'); } }

function handlePresentationStudySelectChange(studyId) {
    if (!studyId || state.getCurrentPresentationStudyId() === studyId) return;

    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId);
    let kollektivChanged = false;
    let refreshNeeded = false;

    if (studySet?.applicableKollektiv) {
        const targetKollektiv = studySet.applicableKollektiv;
        if (state.getCurrentKollektiv() !== targetKollektiv) {
            kollektivChanged = _handleGlobalKollektivChange(targetKollektiv, "auto_praesentation");
            refreshNeeded = kollektivChanged;
        }
    }

    const studyIdChanged = state.setCurrentPresentationStudyId(studyId);
    if (studyIdChanged && !refreshNeeded) {
        refreshNeeded = true;
    }
    
    if (refreshNeeded) {
        updateUIState(); 
        if (state.getActiveTabId() === 'praesentation-tab') {
            handleTabShown('praesentation-tab');
        }
    }
}

function handlePresentationDownloadClick(button) { const actionId = button.id; const currentKollektiv = state.getCurrentKollektiv(); let presentationData = null; const globalKollektivDaten = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv); const statsASForCurrent = statisticsService.calculateDiagnosticPerformance(globalKollektivDaten, 'as', 'n'); const statsGesamtAS = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'Gesamt'), 'as', 'n'); const statsDirektOPAS = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'direkt OP'), 'as', 'n'); const statsNRCTAS = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'nRCT'), 'as', 'n'); presentationData = { kollektiv: currentKollektiv, patientCount: globalKollektivDaten?.length ?? 0, statsCurrentKollektiv: statsASForCurrent, statsGesamt: statsGesamtAS, statsDirektOP: statsDirektOPAS, statsNRCT: statsNRCTAS }; const currentView = state.getCurrentPresentationView(); if (currentView === 'as-vs-t2') { const studyId = state.getCurrentPresentationStudyId(); let comparisonCohortData = globalKollektivDaten; let comparisonKollektivName = currentKollektiv; if (studyId && studyId !== APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) { const studySetForKollektiv = studyT2CriteriaManager.getStudyCriteriaSetById(studyId); if (studySetForKollektiv?.applicableKollektiv && studySetForKollektiv.applicableKollektiv !== currentKollektiv) { comparisonKollektivName = studySetForKollektiv.applicableKollektiv; comparisonCohortData = dataProcessor.filterDataByKollektiv(processedData, comparisonKollektivName); } } presentationData.kollektivForComparison = comparisonKollektivName; presentationData.patientCountForComparison = comparisonCohortData?.length ?? 0; if (comparisonCohortData && comparisonCohortData.length > 0) { presentationData.statsAS = statisticsService.calculateDiagnosticPerformance(comparisonCohortData, 'as', 'n'); let studySet = null; let evaluatedDataT2 = null; const isApplied = studyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID; const appliedCriteria = t2CriteriaManager.getAppliedCriteria(); const appliedLogic = t2CriteriaManager.getAppliedLogic(); if(isApplied) { studySet = { criteria: appliedCriteria, logic: appliedLogic, id: studyId, name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME, displayShortName: 'Angewandt', studyInfo: { reference: "Benutzerdefiniert (aktuell im Auswertungstab eingestellt)", patientCohort: `Vergleichskollektiv: ${getKollektivDisplayName(comparisonKollektivName)} (N=${presentationData.patientCountForComparison})`, investigationType: "N/A", focus: "Benutzereinstellung", keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic) || "Keine" } }; evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(comparisonCohortData), appliedCriteria, appliedLogic); } else { studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId); if(studySet) evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(comparisonCohortData), studySet); } if (studySet && evaluatedDataT2 && evaluatedDataT2.length > 0) { presentationData.statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n'); let asDataForDirectComparison = cloneDeep(comparisonCohortData); evaluatedDataT2.forEach((p, i) => { if (asDataForDirectComparison[i]) p.as = asDataForDirectComparison[i].as; }); presentationData.vergleich = statisticsService.compareDiagnosticMethods(evaluatedDataT2, 'as', 't2', 'n'); presentationData.comparisonCriteriaSet = studySet; presentationData.t2CriteriaLabelShort = studySet.displayShortName || 'T2'; presentationData.t2CriteriaLabelFull = `${isApplied ? 'Aktuell angewandt' : (studySet.name || 'Studie')}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic)}`; } else if (studySet) { presentationData.statsT2 = null; presentationData.vergleich = null; presentationData.comparisonCriteriaSet = studySet; presentationData.t2CriteriaLabelShort = studySet.displayShortName || 'T2'; presentationData.t2CriteriaLabelFull = `${studySet.name}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic)}`; } } } exportService.exportPraesentationData(actionId, presentationData, currentKollektiv); }
function handleExportAction(exportType) { filterAndPrepareData(); const dataForExport = currentData; const currentKollektiv = state.getCurrentKollektiv(); const appliedCriteria = t2CriteriaManager.getAppliedCriteria(); const appliedLogic = t2CriteriaManager.getAppliedLogic(); const allBfResults = bruteForceManager.getAllResults(); const currentKollektivBfResult = allBfResults ? allBfResults[currentKollektiv] : null; const canExportDataDep = Array.isArray(dataForExport) && dataForExport.length > 0; if (!canExportDataDep && !['bruteforce-txt', 'all-zip', 'png-zip', 'svg-zip', 'csv-zip', 'md-zip', 'html'].includes(exportType)) { ui_helpers.showToast("Keine Daten für diesen Export verfügbar.", "warning"); return; } if (exportType === 'bruteforce-txt' && (!currentKollektivBfResult || !currentKollektivBfResult.results || currentKollektivBfResult.results.length === 0 )) { ui_helpers.showToast("Keine Brute-Force Ergebnisse für Export dieses Kollektivs.", "warning"); return; } if (['all-zip', 'csv-zip', 'md-zip'].includes(exportType) && !canExportDataDep && (!allBfResults || Object.keys(allBfResults).length === 0) ) { ui_helpers.showToast("Keine Daten/Ergebnisse für ZIP-Export.", "warning"); return; } if (exportType === 'html' && !canExportDataDep) { ui_helpers.showToast("Keine Daten für HTML-Report.", "warning"); return; } switch (exportType) { case 'statistik-csv': exportService.exportStatistikCSV(localRawData, currentKollektiv, appliedCriteria, appliedLogic); break; case 'bruteforce-txt': exportService.exportBruteForceReport(currentKollektivBfResult, currentKollektiv); break; case 'deskriptiv-md': { const stats = statisticsService.calculateAllStatsForPublication(localRawData, appliedCriteria, appliedLogic, allBfResults)[currentKollektiv]; exportService.exportTableMarkdown(stats?.deskriptiv, 'deskriptiv', currentKollektiv); break; } case 'daten-md': exportService.exportTableMarkdown(dataForExport, 'daten', currentKollektiv); break; case 'auswertung-md': exportService.exportTableMarkdown(dataForExport, 'auswertung', currentKollektiv, appliedCriteria, appliedLogic); break; case 'filtered-data-csv': exportService.exportFilteredDataCSV(dataForExport, currentKollektiv); break; case 'comprehensive-report-html': exportService.exportComprehensiveReportHTML(localRawData, currentKollektivBfResult, currentKollektiv, appliedCriteria, appliedLogic); break; case 'charts-png': exportService.exportChartsZip('#app-container', 'PNG_ZIP', currentKollektiv, 'png'); break; case 'charts-svg': exportService.exportChartsZip('#app-container', 'SVG_ZIP', currentKollektiv, 'svg'); break; case 'all-zip': case 'csv-zip': case 'md-zip': exportService.exportCategoryZip(exportType, localRawData, allBfResults, currentKollektiv, appliedCriteria, appliedLogic); break; default: console.warn(`Unbekannter Export-Typ: ${exportType}`); ui_helpers.showToast(`Export-Typ '${exportType}' nicht implementiert.`, 'warning'); break; } }
function handleSingleChartDownload(button) { const chartId = button.dataset.chartId; const format = button.dataset.format; const chartName = button.dataset.chartName || chartId.replace(/^chart-/, '').replace(/-container$/, '').replace(/-content$/, '').replace(/-[0-9]+$/, ''); if (chartId && (format === 'png' || format === 'svg')) exportService.exportSingleChart(chartId, format, state.getCurrentKollektiv(), {chartName: chartName}); else ui_helpers.showToast("Fehler beim Chart-Download.", "warning"); }
function handleSingleTableDownload(button) { if (!button) return; const tableId = button.dataset.tableId; const tableName = button.dataset.tableName || 'Tabelle'; if (tableId && APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT) exportService.exportTablePNG(tableId, state.getCurrentKollektiv(), 'TABLE_PNG_EXPORT', tableName); else if (!tableId) ui_helpers.showToast(`Fehler: Tabelle '${tableName}' nicht gefunden.`, "danger"); }
function handlePublikationChange(event) { const target = event.target; if (target.id === 'publikation-sprache-switch') { if(state.setCurrentPublikationLang(target.checked ? 'en' : 'de')) { updateUIState(); handleTabShown('publikation-tab'); } } else if (target.id === 'publikation-bf-metric-select') { if(state.setCurrentPublikationBruteForceMetric(target.value)) { updateUIState(); handleTabShown('publikation-tab'); } } }
function handlePublikationSectionChange(sectionId) { if (state.setCurrentPublikationSection(sectionId)) { updateUIState(); handleTabShown('publikation-tab'); const contentArea = document.getElementById('publikation-content-area'); if(contentArea) contentArea.scrollTop = 0; } }

function initializeBruteForceManager() {
    const bfCallbacks = {
        onStarted: handleBruteForceStarted,
        onProgress: handleBruteForceProgress,
        onResult: handleBruteForceResult,
        onCancelled: handleBruteForceCancelled,
        onError: handleBruteForceError
    };
    const workerAvailable = bruteForceManager.init(bfCallbacks);
    ui_helpers.updateBruteForceUI('idle', {}, workerAvailable, state.getCurrentKollektiv());
}

function handleStartBruteForce() {
    if (bruteForceManager.isRunning() || !bruteForceManager.isWorkerAvailable()) return;
    const metric = document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
    const currentKollektiv = state.getCurrentKollektiv();
    const dataForWorker = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv).map(p => ({ nr: p.nr, n: p.n, lymphknoten_t2: p.lymphknoten_t2 }));

    if (dataForWorker.length === 0) {
        ui_helpers.showToast("Keine Daten für Optimierung im aktuellen Kollektiv.", "warning");
        ui_helpers.updateBruteForceUI('idle', {}, bruteForceManager.isWorkerAvailable(), currentKollektiv);
        return;
    }
    ui_helpers.updateBruteForceUI('start', { metric: metric, kollektiv: currentKollektiv }, true, currentKollektiv);
    bruteForceManager.startAnalysis(dataForWorker, metric, currentKollektiv);
    updateUIState();
}

function handleCancelBruteForce() {
    if (!bruteForceManager.isRunning() || !bruteForceManager.isWorkerAvailable()) return;
    bruteForceManager.cancelAnalysis();
}

function handleBruteForceStarted(payload) {
    const currentKollektiv = state.getCurrentKollektiv();
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
        if (state.getActiveTabId() === 'publikation-tab') {
            publikationTabLogic.initializeData(localRawData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), bruteForceManager.getAllResults());
            handleTabShown('publikation-tab');
        }
    } else {
        ui_helpers.showToast('Optimierung ohne valide Ergebnisse.', 'warning');
    }
    updateUIState();
}

function handleBruteForceCancelled(payload) {
    const currentKollektiv = state.getCurrentKollektiv();
    ui_helpers.updateBruteForceUI('cancelled', {}, true, currentKollektiv);
    ui_helpers.showToast('Optimierung abgebrochen.', 'warning');
    updateUIState();
}

function handleBruteForceError(payload) {
    const currentKollektiv = state.getCurrentKollektiv();
    ui_helpers.showToast(`Optimierungsfehler: ${payload?.message || 'Unbekannt'}`, 'danger');
    ui_helpers.updateBruteForceUI('error', payload, bruteForceManager.isWorkerAvailable(), currentKollektiv);
    updateUIState();
}

document.addEventListener('DOMContentLoaded', initializeApp);
