let processedData = [];
let currentData = [];
let bruteForceWorker = null;
let isBruteForceRunning = false;
let lastBruteForceResults = null;
let localRawData = typeof patientDataRaw !== 'undefined' ? patientDataRaw : [];

const debouncedUpdateSizeInput = debounce(handleT2SizeInputChange, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);
const debouncedUpdateSizeRange = debounce(handleT2SizeRangeChange, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);

function initializeApp() {
    console.log(`Initialisiere ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION}...`);
    const requiredLibs = ['bootstrap', 'd3', 'tippy', 'Papa', 'JSZip'];
    const missingLibs = requiredLibs.filter(lib => typeof window[lib] === 'undefined' && typeof window[lib.toLowerCase()] === 'undefined');

    if (missingLibs.length > 0) {
        console.error("Externe Bibliotheken fehlen:", missingLibs.join(', '));
        ui_helpers.updateElementHTML('app-container', `<div class="alert alert-danger m-5">Fehler: Kritische Bibliotheken (${missingLibs.join(', ')}) konnten nicht geladen werden. Die Anwendung kann nicht gestartet werden.</div>`);
        return;
    }
     if (!document.getElementById('app-container')) {
         console.error("Applikations-Container ('app-container') wurde im DOM nicht gefunden!");
         return;
     }

    try {
        if (typeof state === 'undefined' || typeof t2CriteriaManager === 'undefined' || typeof dataProcessor === 'undefined' || typeof viewRenderer === 'undefined' || typeof ui_helpers === 'undefined' || typeof exportService === 'undefined' || typeof publicationRenderer === 'undefined' || typeof publicationLogic === 'undefined' || typeof studyT2CriteriaManager === 'undefined' || typeof statisticsService === 'undefined' || typeof uiComponents === 'undefined' || typeof uiViewLogic === 'undefined' || typeof tableRenderer === 'undefined' || typeof chartRenderer === 'undefined') {
             throw new Error("Ein oder mehrere Kernmodule der Anwendung sind nicht verfügbar. Überprüfen Sie die Skript-Einbindungen.");
        }

        state.init();
        t2CriteriaManager.initialize();

        processedData = dataProcessor.processPatientData(localRawData);

        if (processedData.length === 0) {
            console.warn("Keine validen Patientendaten gefunden nach der initialen Prozessierung.");
            ui_helpers.showToast("Warnung: Keine validen Patientendaten geladen. Die Funktionalität ist eingeschränkt.", "warning", 5000);
        }

        filterAndPrepareData();
        updateUIState();
        setupEventListeners();
        initializeBruteForceWorker();

        const initialTabId = state.getActiveTabId() || APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB;
        const initialTabElement = document.getElementById(initialTabId);
         if(initialTabElement && bootstrap.Tab) {
            const tab = bootstrap.Tab.getOrCreateInstance(initialTabElement);
            if(tab) tab.show();
            else { handleTabShown(initialTabId); }
         } else {
             state.setActiveTabId(APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB);
             const fallbackTabElement = document.getElementById(APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB);
             if(fallbackTabElement && bootstrap.Tab) {
                 const fallBackTabInstance = bootstrap.Tab.getOrCreateInstance(fallbackTabElement);
                 if(fallBackTabInstance) fallBackTabInstance.show();
                 else { handleTabShown(APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB); }
             } else {
                handleTabShown(APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB);
             }
         }

        ui_helpers.initializeTooltips(document.body);
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());

        ui_helpers.showToast(`Anwendung ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION} erfolgreich initialisiert.`, 'success', 3000);
        console.log("App Initialisierung abgeschlossen.");

    } catch (error) {
         console.error("Schwerwiegender Fehler während der App-Initialisierung:", error);
         ui_helpers.updateElementHTML('app-container', `<div class="alert alert-danger m-5">Ein schwerwiegender Initialisierungsfehler ist aufgetreten: ${error.message}. Bitte überprüfen Sie die Konsole und stellen Sie sicher, dass alle Skripte korrekt geladen wurden und fehlerfrei sind.</div>`);
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
        if (activeTabId === 'daten-tab-pane') { sortState = state.getDatenTableSort(); }
        else if (activeTabId === 'auswertung-tab-pane') { sortState = state.getAuswertungTableSort(); }

        if(sortState && sortState.key && Array.isArray(evaluatedData)) {
             evaluatedData.sort(getSortFunction(sortState.key, sortState.direction, sortState.subKey));
        }
        currentData = evaluatedData;
    } catch (error) {
         console.error("Fehler bei filterAndPrepareData:", error);
         currentData = [];
         ui_helpers.showToast("Fehler bei der Datenaufbereitung. Einige Ansichten könnten unvollständig sein.", "danger");
    }
}

function updateUIState() {
    try {
        const headerStats = dataProcessor.calculateHeaderStats(currentData, state.getCurrentKollektiv());
        ui_helpers.updateHeaderStatsUI(headerStats);
        ui_helpers.updateKollektivButtonsUI(state.getCurrentKollektiv());
        ui_helpers.updateStatistikSelectorsUI(state.getCurrentStatsLayout(), state.getCurrentStatsKollektiv1(), state.getCurrentStatsKollektiv2());
        ui_helpers.updatePresentationViewSelectorUI(state.getCurrentPresentationView());
        if (state.getActiveTabId() === 'publikation-tab-pane') {
            ui_helpers.updatePublikationTabSteuerungUI(state.getCurrentPublikationLang(), state.getCurrentPublikationSection());
        }
        ui_helpers.updateExportButtonStates(state.getActiveTabId(), !!lastBruteForceResults, currentData && currentData.length > 0);
    } catch (error) {
        console.error("Fehler beim Aktualisieren des globalen UI-Zustands:", error);
    }
}

function setupEventListeners() {
    document.body.addEventListener('click', handleBodyClickDelegation);

    const mainTabNav = document.getElementById('mainTab');
    if (mainTabNav) { mainTabNav.addEventListener('shown.bs.tab', handleTabShownEvent); }
    else { console.error("Haupt-Tab-Navigationselement ('mainTab') nicht gefunden. Tab-Wechsel-Events werden nicht ausgelöst."); }

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
        } else if (target.closest('#statistik-tab-pane')) { handleStatistikChange(event); }
        else if (target.closest('#praesentation-tab-pane')) { handlePresentationChangeDelegation(event); }
        else if (target.closest('#publikation-tab-pane') && target.id === 'publikation-sprache-switch') {
            handlePublikationLanguageChange(target.checked ? 'en' : 'de');
        }
    });
}

function handleBodyClickDelegation(event) {
    const target = event.target;
    const closestButton = target.closest('button');
    const closestHeader = target.closest('th[data-sort-key]');
    const closestSubHeader = target.closest('.sortable-sub-header');
    const chartDownloadButton = target.closest('.chart-download-btn[data-chart-id][data-format]');
    const tableDownloadButton = target.closest('.table-download-png-btn[data-table-id]');
    const kollektivButton = target.closest('header .btn-group button[data-kollektiv]');
    const auswertungPane = target.closest('#auswertung-tab-pane');
    const statistikPane = target.closest('#statistik-tab-pane');
    const publikationPane = target.closest('#publikation-tab-pane');
    const exportButton = target.closest('#export-tab-pane button[id^="export-"]');
    const praesDownloadButton = target.closest('#praesentation-content-area button[id^="download-"]');
    const toggleAllDatenBtn = target.closest('#daten-toggle-details');
    const toggleAllAuswBtn = target.closest('#auswertung-toggle-details');
    const modalExportBtn = target.closest('#export-bruteforce-modal-txt');
    const clickableRow = target.closest('tr.clickable-row[data-bs-target]');

    if (clickableRow && target.closest('a, button, input, select, .btn-close, [data-bs-toggle="modal"], .table-download-png-btn, .chart-download-btn')) { event.stopPropagation(); return; }
    if (kollektivButton && kollektivButton.dataset.kollektiv) { handleKollektivChange(kollektivButton.dataset.kollektiv); return; }
    if (closestHeader) { handleSortClick(closestHeader, closestSubHeader); return; }
    if (chartDownloadButton) { handleSingleChartDownload(chartDownloadButton); return; }
    if (tableDownloadButton) { handleSingleTableDownload(tableDownloadButton); return; }
    if (toggleAllDatenBtn) { ui_helpers.toggleAllDetails('daten-table-body', 'daten-toggle-details'); return; }
    if (toggleAllAuswBtn) { ui_helpers.toggleAllDetails('auswertung-table-body', 'auswertung-toggle-details'); return; }
    if (modalExportBtn && !modalExportBtn.disabled) { exportService.exportBruteForceReport(lastBruteForceResults, state.getCurrentKollektiv()); return; }

    if (auswertungPane) {
        const criteriaButton = target.closest('.t2-criteria-button'); const resetButton = target.closest('#btn-reset-criteria'); const applyButton = target.closest('#btn-apply-criteria'); const startBfButton = target.closest('#btn-start-brute-force'); const cancelBfButton = target.closest('#btn-cancel-brute-force'); const applyBestBfButton = target.closest('#btn-apply-best-bf-criteria');
        if (criteriaButton && !criteriaButton.disabled) { handleT2CriteriaButtonClick(criteriaButton); return; }
        if (resetButton) { handleResetCriteria(); return; }
        if (applyButton) { handleApplyCriteria(); return; }
        if (startBfButton && !startBfButton.disabled) { handleStartBruteForce(); return; }
        if (cancelBfButton) { handleCancelBruteForce(); return; }
        if (applyBestBfButton && !applyBestBfButton.disabled) { handleApplyBestBfCriteria(); return; }
    }
    if (statistikPane) { const statsToggleButton = target.closest('#statistik-toggle-vergleich'); if(statsToggleButton) { handleStatsLayoutToggle(statsToggleButton); return; } }
    if (publikationPane) { const pubSectionButton = target.closest('.pub-section-btn'); if (pubSectionButton && pubSectionButton.dataset.sectionId) { handlePublikationSectionChange(pubSectionButton.dataset.sectionId); return; }}
    if (exportButton && !exportButton.disabled && !exportButton.id.startsWith('export-bruteforce-modal')) { handleExportAction(exportButton.id.replace('export-', '')); return; }
    if (praesDownloadButton && !praesDownloadButton.disabled && !praesDownloadButton.classList.contains('table-download-png-btn') && !praesDownloadButton.classList.contains('chart-download-btn')) { handlePresentationDownloadClick(praesDownloadButton); return; }
}

function handleTabShownEvent(event) {
    if (event.target && event.target.id) {
        const newTabPaneId = event.target.getAttribute('data-bs-target')?.substring(1) || event.target.id.replace('-tab', '-tab-pane');
        if (state.setActiveTabId(newTabPaneId)) {
            filterAndPrepareData();
            updateUIState();
            handleTabShown(newTabPaneId);
        }
    }
}

function handleTabShown(tabPaneId) {
    if (typeof viewRenderer === 'undefined') {
        console.error(`viewRenderer ist nicht verfügbar in handleTabShown (Tab-Pane: ${tabPaneId}).`);
        ui_helpers.showToast(`Fehler: UI Renderer nicht bereit für Tab-Pane '${tabPaneId}'.`, 'danger');
        ui_helpers.updateElementHTML(tabPaneId, `<div class="alert alert-danger m-3">Interner Fehler: UI Renderer konnte nicht geladen werden.</div>`);
        return;
    }
    const currentKollektiv = state.getCurrentKollektiv();
    const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
    const appliedLogic = t2CriteriaManager.getAppliedLogic();

    switch (tabPaneId) {
        case 'daten-tab-pane': viewRenderer.renderDatenTab(currentData, state.getDatenTableSort()); break;
        case 'auswertung-tab-pane': viewRenderer.renderAuswertungTab(currentData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), state.getAuswertungTableSort(), currentKollektiv, !!bruteForceWorker); break;
        case 'statistik-tab-pane': viewRenderer.renderStatistikTab(processedData, appliedCriteria, appliedLogic, state.getCurrentStatsLayout(), state.getCurrentStatsKollektiv1(), state.getCurrentStatsKollektiv2(), currentKollektiv); break;
        case 'praesentation-tab-pane': viewRenderer.renderPresentationTab(state.getCurrentPresentationView(), state.getCurrentPresentationStudyId(), currentKollektiv, processedData, appliedCriteria, appliedLogic); break;
        case 'publikation-tab-pane': viewRenderer.renderPublikationTab(state.getCurrentPublikationLang(), state.getCurrentPublikationSection(), processedData, tabPaneId); break;
        case 'export-tab-pane': viewRenderer.renderExportTab(currentKollektiv); break;
        default: console.warn(`Unbekanntes Tab-Pane angezeigt: ${tabPaneId}`); ui_helpers.updateElementHTML(tabPaneId, `<div class="alert alert-warning m-3">Inhalt für Tab-Pane '${tabPaneId}' nicht implementiert.</div>`);
    }
    updateUIState();
}

function handleKollektivChange(newKollektiv) { if (state.setCurrentKollektiv(newKollektiv)) { filterAndPrepareData(); updateUIState(); handleTabShown(state.getActiveTabId()); ui_helpers.showToast(`Kollektiv '${getKollektivDisplayName(newKollektiv)}' ausgewählt.`, 'info'); return true; } return false; }
function handleSortClick(sortHeader, sortSubHeader) { const key = sortHeader?.dataset.sortKey; if (!key) return; const subKey = sortSubHeader?.dataset.subKey || null; const tableBody = sortHeader.closest('table')?.querySelector('tbody'); let tableId = null; if (tableBody?.id === 'daten-table-body') tableId = 'daten'; else if (tableBody?.id === 'auswertung-table-body') tableId = 'auswertung'; if (tableId) handleSort(tableId, key, subKey); }
function handleSort(tableId, key, subKey = null) { let sortStateUpdated = false; if(tableId === 'daten') sortStateUpdated = state.updateDatenTableSortDirection(key, subKey); else if (tableId === 'auswertung') sortStateUpdated = state.updateAuswertungTableSortDirection(key, subKey); if(sortStateUpdated) { const sortState = (tableId === 'daten') ? state.getDatenTableSort() : state.getAuswertungTableSort(); filterAndPrepareData(); if (tableId === 'daten' && state.getActiveTabId() === 'daten-tab-pane') viewRenderer.renderDatenTab(currentData, sortState); else if (tableId === 'auswertung' && state.getActiveTabId() === 'auswertung-tab-pane') { viewRenderer.renderAuswertungTab(currentData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), sortState, state.getCurrentKollektiv(), !!bruteForceWorker ); } } }
function handleT2CheckboxChange(checkbox) { const key = checkbox.value; const isActive = checkbox.checked; if(t2CriteriaManager.toggleCriterionActive(key, isActive)){ ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleT2LogicChange(logicSwitch) { const newLogic = logicSwitch.checked ? 'ODER' : 'UND'; if(t2CriteriaManager.updateLogic(newLogic)) { ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleT2CriteriaButtonClick(button) { const criterionKey = button.dataset.criterion; const value = button.dataset.value; let changed = false; if (!t2CriteriaManager.getCurrentCriteria()[criterionKey]?.active) changed = t2CriteriaManager.toggleCriterionActive(criterionKey, true) || changed; changed = t2CriteriaManager.updateCriterionValue(criterionKey, value) || changed; if (changed) { ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleT2SizeInputChange(value) { if (t2CriteriaManager.updateCriterionThreshold(value)) { if (!t2CriteriaManager.getCurrentCriteria().size?.active) t2CriteriaManager.toggleCriterionActive('size', true); ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } else { const current = t2CriteriaManager.getCurrentCriteria().size?.threshold; const input = document.getElementById('input-size'); if(input && current !== undefined) input.value = formatNumber(current, 1, '', true); ui_helpers.showToast("Ungültiger Wert für Größe.", "warning"); } }
function handleT2SizeRangeChange(value) { if (t2CriteriaManager.updateCriterionThreshold(value)) { if (!t2CriteriaManager.getCurrentCriteria().size?.active) t2CriteriaManager.toggleCriterionActive('size', true); ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleResetCriteria() { t2CriteriaManager.resetCriteria(); ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); ui_helpers.showToast('T2 Kriterien zurückgesetzt (nicht angewendet).', 'info'); }
function handleApplyCriteria() { t2CriteriaManager.applyCriteria(); filterAndPrepareData(); ui_helpers.markCriteriaSavedIndicator(false); updateUIState(); handleTabShown(state.getActiveTabId()); ui_helpers.showToast('T2-Kriterien angewendet & gespeichert.', 'success'); }
function handleApplyBestBfCriteria() { if (!lastBruteForceResults?.bestResult?.criteria) { ui_helpers.showToast('Keine gültigen Brute-Force-Ergebnisse zum Anwenden.', 'warning'); return; } const best = lastBruteForceResults.bestResult; Object.keys(best.criteria).forEach(key => { if(key === 'logic') return; const criterion = best.criteria[key]; t2CriteriaManager.toggleCriterionActive(key, criterion.active); if(criterion.active) { if(key === 'size') t2CriteriaManager.updateCriterionThreshold(criterion.threshold); else t2CriteriaManager.updateCriterionValue(key, criterion.value); } }); t2CriteriaManager.updateLogic(best.logic); ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); handleApplyCriteria(); ui_helpers.showToast('Beste Brute-Force Kriterien angewendet & gespeichert.', 'success'); }
function handleStatsLayoutToggle(button) { setTimeout(() => { const isPressed = button.classList.contains('active'); const newLayout = isPressed ? 'vergleich' : 'einzel'; if (state.setCurrentStatsLayout(newLayout)) { updateUIState(); if (state.getActiveTabId() === 'statistik-tab-pane') handleTabShown('statistik-tab-pane'); } }, 50); }
function handleStatistikChange(event) { const target = event.target; let needsRender = false; if (target.id === 'statistik-kollektiv-select-1') needsRender = state.setCurrentStatsKollektiv1(target.value); else if (target.id === 'statistik-kollektiv-select-2') needsRender = state.setCurrentStatsKollektiv2(target.value); if(needsRender && state.getCurrentStatsLayout() === 'vergleich' && state.getActiveTabId() === 'statistik-tab-pane') handleTabShown('statistik-tab-pane'); }
function handlePresentationChangeDelegation(event) { const viewRadio = event.target.closest('input[name="praesentationAnsicht"]'); const studySelect = event.target.closest('#praes-study-select'); if(viewRadio) handlePresentationViewChange(viewRadio.value); else if (studySelect) handlePresentationStudySelectChange(studySelect.value); }
function handlePresentationViewChange(view) { if (state.setCurrentPresentationView(view)) { updateUIState(); if (state.getActiveTabId() === 'praesentation-tab-pane') handleTabShown('praesentation-tab-pane'); } }
function handlePresentationStudySelectChange(studyId) { if (!studyId || state.getCurrentPresentationStudyId() === studyId) return; const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId); let kollektivChanged = false; if (studySet?.applicableKollektiv && state.getCurrentKollektiv() !== studySet.applicableKollektiv && studyId !== APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) kollektivChanged = handleKollektivChange(studySet.applicableKollektiv); const studyIdChanged = state.setCurrentPresentationStudyId(studyId); if (studyIdChanged || kollektivChanged) { updateUIState(); if (state.getActiveTabId() === 'praesentation-tab-pane') handleTabShown('praesentation-tab-pane'); } }
function handlePresentationDownloadClick(button) { const actionId = button.id; const currentKollektiv = state.getCurrentKollektiv(); let presentationData = null; const filteredData = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv); if (filteredData?.length > 0) { const statsAS = statisticsService.calculateDiagnosticPerformance(filteredData, 'as', 'n'); const appliedCriteria = t2CriteriaManager.getAppliedCriteria(); const appliedLogic = t2CriteriaManager.getAppliedLogic(); presentationData = { statsAS: statsAS, kollektiv: currentKollektiv, patientCount: filteredData.length, statsGesamt: statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'Gesamt'), 'as', 'n'), statsDirektOP: statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'direkt OP'), 'as', 'n'), statsNRCT: statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'nRCT'), 'as', 'n') }; if (state.getCurrentPresentationView() === 'as-vs-t2') { const studyId = state.getCurrentPresentationStudyId(); let studySet = null, evaluatedDataT2 = null; const isApplied = studyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID; if(isApplied) { studySet = { criteria: appliedCriteria, logic: appliedLogic, id: studyId, name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME, displayShortName: 'Angewandt', studyInfo: { reference: "Benutzerdefiniert", patientCohort: `Aktuell: ${getKollektivDisplayName(currentKollektiv)} (N=${presentationData.patientCount})`, investigationType: "N/A", focus: "Benutzereinstellung", keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic) || "Keine" } }; evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), appliedCriteria, appliedLogic); } else { studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId); if(studySet) evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(filteredData), studySet); } if (studySet && evaluatedDataT2) { presentationData.statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n'); evaluatedDataT2.forEach((p, i) => { if (filteredData[i]) p.as = filteredData[i].as; }); presentationData.vergleich = statisticsService.compareDiagnosticMethods(evaluatedDataT2, 'as', 't2', 'n'); presentationData.comparisonCriteriaSet = studySet; presentationData.t2CriteriaLabelShort = studySet.displayShortName || 'T2'; presentationData.t2CriteriaLabelFull = `${isApplied ? 'Aktuell angewandt' : (studySet.name || 'Studie')}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic)}`; } } } exportService.exportPraesentationData(actionId, presentationData, currentKollektiv); }

function handleExportAction(exportType) {
    filterAndPrepareData();
    const dataForExport = currentData;
    const currentKollektiv = state.getCurrentKollektiv();
    const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
    const appliedLogic = t2CriteriaManager.getAppliedLogic();
    const canExport = Array.isArray(dataForExport) && dataForExport.length > 0;
    if (!canExport && !['bruteforce-txt', 'all-zip', 'png-zip', 'svg-zip', 'csv-zip', 'md-zip'].includes(exportType)) { ui_helpers.showToast("Keine Daten für diesen Export verfügbar.", "warning"); return; }
    if (exportType === 'bruteforce-txt' && !lastBruteForceResults) { ui_helpers.showToast("Keine Brute-Force Ergebnisse für Export.", "warning"); return; }
    if (['all-zip', 'png-zip', 'svg-zip', 'csv-zip', 'md-zip'].includes(exportType) && !canExport && !lastBruteForceResults) { ui_helpers.showToast("Keine Daten/Ergebnisse für ZIP-Export.", "warning"); return; }
    switch (exportType) {
        case 'statistik-csv': exportService.exportStatistikCSV(dataForExport, currentKollektiv, appliedCriteria, appliedLogic); break;
        case 'bruteforce-txt': exportService.exportBruteForceReport(lastBruteForceResults, currentKollektiv); break;
        case 'deskriptiv-md': { const stats = statisticsService.calculateStatsForExport(dataForExport, appliedCriteria, appliedLogic); exportService.exportTableMarkdown(stats?.deskriptiv, 'deskriptiv', currentKollektiv); break; }
        case 'patienten-md': exportService.exportTableMarkdown(dataForExport, 'patienten', currentKollektiv); break;
        case 'auswertung-md': exportService.exportTableMarkdown(dataForExport, 'auswertung', currentKollektiv, appliedCriteria, appliedLogic); break;
        case 'filtered-data-csv': exportService.exportFilteredDataCSV(dataForExport, currentKollektiv); break;
        case 'comprehensive-report-html': exportService.exportComprehensiveReportHTML(dataForExport, lastBruteForceResults, currentKollektiv, appliedCriteria, appliedLogic); break;
        case 'charts-png': exportService.exportChartsZip('#app-container', 'PNG_ZIP', currentKollektiv, 'png'); break;
        case 'charts-svg': exportService.exportChartsZip('#app-container', 'SVG_ZIP', currentKollektiv, 'svg'); break;
        case 'all-zip': case 'csv-zip': case 'md-zip': exportService.exportCategoryZip(exportType, dataForExport, lastBruteForceResults, currentKollektiv, appliedCriteria, appliedLogic); break;
        default: console.warn(`Unbekannter Export-Typ: ${exportType}`); ui_helpers.showToast(`Export-Typ '${exportType}' nicht implementiert.`, 'warning'); break;
    }
}
function handlePublikationSectionChange(sectionId) {
    if (state.setCurrentPublikationSection(sectionId)) {
        updateUIState();
        if (state.getActiveTabId() === 'publikation-tab-pane') {
             viewRenderer.renderPublikationTab(state.getCurrentPublikationLang(), sectionId, processedData, 'publikation-tab-pane');
        }
    }
}
function handlePublikationLanguageChange(newLang) {
    if (state.setCurrentPublikationLang(newLang)) {
        updateUIState();
        if (state.getActiveTabId() === 'publikation-tab-pane') {
            viewRenderer.renderPublikationTab(newLang, state.getCurrentPublikationSection(), processedData, 'publikation-tab-pane');
        }
    }
}

function handleSingleChartDownload(button) { const chartId = button.dataset.chartId; const format = button.dataset.format; if (chartId && (format === 'png' || format === 'svg')) { const chartElement = document.getElementById(chartId); const chartTitleElement = chartElement?.closest('.publication-chart-placeholder-wrapper, .card')?.querySelector('.card-header, .publication-chart-title'); const chartNameOverride = chartTitleElement?.textContent?.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').substring(0,30) || chartId; exportService.exportSingleChart(chartId, format, state.getCurrentKollektiv(), {chartName: chartNameOverride}); } else ui_helpers.showToast("Fehler beim Chart-Download: Ungültige ID oder Format.", "warning"); }
function handleSingleTableDownload(button) { if (!button) return; const tableId = button.dataset.tableId; const tableName = button.dataset.tableName || 'Tabelle'; if (tableId && APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT) exportService.exportTablePNG(tableId, state.getCurrentKollektiv(), 'TABLE_PNG_EXPORT', tableName); else if (!tableId) ui_helpers.showToast(`Fehler: Tabelle '${tableName}' nicht gefunden.`, "danger"); }
function initializeBruteForceWorker() { if (!window.Worker) { ui_helpers.showToast("Web Worker werden von Ihrem Browser nicht unterstützt. Die Brute-Force-Optimierung ist nicht verfügbar.", "danger", 7000); ui_helpers.updateBruteForceUI('error', {message: 'Web Worker not supported'}, false, state.getCurrentKollektiv()); return; } try { if(bruteForceWorker) bruteForceWorker.terminate(); bruteForceWorker = new Worker(APP_CONFIG.PATHS.BRUTE_FORCE_WORKER); bruteForceWorker.onmessage = handleBruteForceMessage; bruteForceWorker.onerror = handleBruteForceError; bruteForceWorker.onmessageerror = (e) => { console.error("Ein Fehler in der Web Worker Kommunikation ist aufgetreten:", e); ui_helpers.showToast("Kommunikationsfehler mit Hintergrundprozess.", "danger"); }; ui_helpers.updateBruteForceUI('idle', {}, true, state.getCurrentKollektiv()); } catch (e) { console.error("Fehler bei der Initialisierung des Brute Force Workers:", e); ui_helpers.showToast("Fehler: Start des Hintergrundprozesses für Optimierung fehlgeschlagen.", "danger", 7000); bruteForceWorker = null; ui_helpers.updateBruteForceUI('error', {message: 'Worker init failed'}, false, state.getCurrentKollektiv()); } }
function handleStartBruteForce() { if (isBruteForceRunning || !bruteForceWorker) { ui_helpers.showToast(isBruteForceRunning ? "Optimierung läuft bereits." : "Optimierungsmodul nicht bereit.", "warning"); return; } isBruteForceRunning = true; lastBruteForceResults = null; const metric = document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC; const currentKollektiv = state.getCurrentKollektiv(); const dataForWorker = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv).map(p => ({ nr: p.nr, n: p.n, lymphknoten_t2: p.lymphknoten_t2 })); if (dataForWorker.length === 0) { ui_helpers.showToast("Keine Patientendaten im aktuellen Kollektiv für Optimierung vorhanden.", "warning"); isBruteForceRunning = false; ui_helpers.updateBruteForceUI('idle', {}, !!bruteForceWorker, currentKollektiv); return; } ui_helpers.updateBruteForceUI('start', { metric: metric, kollektiv: currentKollektiv }, true, currentKollektiv); bruteForceWorker.postMessage({ action: 'start', payload: { data: dataForWorker, metric: metric, kollektiv: currentKollektiv, t2SizeRange: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE } }); updateUIState(); }
function handleCancelBruteForce() { if (!isBruteForceRunning || !bruteForceWorker) return; bruteForceWorker.postMessage({ action: 'cancel' }); isBruteForceRunning = false; ui_helpers.updateBruteForceUI('cancelled', {}, true, state.getCurrentKollektiv()); ui_helpers.showToast('Optimierung vom Benutzer abgebrochen.', 'warning'); updateUIState(); }
function handleBruteForceMessage(event) { if (!event || !event.data) { console.warn("Leere Nachricht vom Brute Force Worker empfangen."); return;} const { type, payload } = event.data; if (!isBruteForceRunning && type !== 'cancelled' && type !== 'error') return; const currentKollektiv = payload?.kollektiv || state.getCurrentKollektiv(); const currentMetric = payload?.metric || (type === 'progress' ? payload?.currentBest?.metric : null) || document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC; switch (type) { case 'started': ui_helpers.updateBruteForceUI('started', { ...payload, metric: currentMetric }, true, currentKollektiv); break; case 'progress': ui_helpers.updateBruteForceUI('progress', { ...payload, metric: currentMetric }, true, currentKollektiv); break; case 'result': isBruteForceRunning = false; lastBruteForceResults = payload; ui_helpers.updateBruteForceUI('result', payload, true, currentKollektiv); if(payload?.results?.length > 0){ const modalBody = document.querySelector('#brute-force-modal .modal-body'); if (modalBody && typeof uiComponents !== 'undefined' && uiComponents.createBruteForceModalContent) { modalBody.innerHTML = uiComponents.createBruteForceModalContent(payload.results, payload.metric, payload.kollektiv, payload.duration, payload.totalTested); ui_helpers.initializeTooltips(modalBody); } ui_helpers.showToast('Optimierung erfolgreich abgeschlossen.', 'success'); } else { ui_helpers.showToast('Optimierung abgeschlossen, aber keine validen Ergebnisse gefunden.', 'warning'); } updateUIState(); break; case 'cancelled': isBruteForceRunning = false; ui_helpers.updateBruteForceUI('cancelled', {}, true, state.getCurrentKollektiv()); updateUIState(); break; case 'error': isBruteForceRunning = false; ui_helpers.showToast(`Fehler bei Optimierung: ${payload?.message || 'Unbekannter Fehler im Worker.'}`, 'danger', 7000); ui_helpers.updateBruteForceUI('error', payload, true, currentKollektiv); updateUIState(); break; default: console.warn(`Unbekannter Nachrichtentyp vom Worker empfangen: ${type}`); } }
function handleBruteForceError(error) { console.error("Fehler im Brute Force Worker aufgetreten:", error); isBruteForceRunning = false; ui_helpers.showToast("Kritischer Fehler: Hintergrundverarbeitung für Optimierung gestoppt. Details siehe Konsole.", "danger", 7000); ui_helpers.updateBruteForceUI('error', { message: error.message || 'Allgemeiner Worker Fehler' }, false, state.getCurrentKollektiv()); bruteForceWorker = null; updateUIState(); }

document.addEventListener('DOMContentLoaded', initializeApp);