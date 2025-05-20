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
        ui_helpers.updateElementHTML('app-container', `<div class="alert alert-danger m-5">Fehler: Bibliotheken (${missingLibs.join(', ')}) konnten nicht vollständig geladen werden.</div>`);
        return;
    }
     if (!document.getElementById('app-container')) {
         console.error("App container ('app-container') nicht gefunden!");
         return;
     }

    try {
        if (typeof state === 'undefined' || typeof t2CriteriaManager === 'undefined' || typeof dataProcessor === 'undefined' ||
            typeof viewRenderer === 'undefined' || typeof ui_helpers === 'undefined' || typeof exportService === 'undefined' ||
            typeof dataTabLogic === 'undefined' || typeof auswertungTabLogic === 'undefined' ||
            typeof statistikTabLogic === 'undefined' || typeof praesentationTabLogic === 'undefined' ||
            typeof publikationTabLogic === 'undefined' || typeof publicationRenderer === 'undefined' ||
            typeof publicationTextGenerator === 'undefined' || typeof studyT2CriteriaManager === 'undefined'
        ) {
             throw new Error("Ein oder mehrere Kernmodule sind nicht verfügbar. Überprüfen Sie die Skript-Ladereihenfolge und Dateipfade.");
        }

        state.init();
        t2CriteriaManager.initialize();

        processedData = dataProcessor.processPatientData(localRawData);

        if (processedData.length === 0) {
            console.warn("Keine validen Patientendaten gefunden nach Prozessierung.");
            ui_helpers.showToast("Warnung: Keine validen Patientendaten geladen.", "warning");
        }

        publikationTabLogic.initializeData(processedData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), null);


        filterAndPrepareData();
        updateUIState();
        setupEventListeners();
        initializeBruteForceWorker();

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

        if (state.getActiveTabId() === 'publikation-tab') {
            ui_helpers.updatePublikationUI(state.getCurrentPublikationLang(), state.getCurrentPublikationSection(), state.getCurrentPublikationBruteForceMetric());
        }
        ui_helpers.updateExportButtonStates(state.getActiveTabId(), !!lastBruteForceResults, currentData && currentData.length > 0);
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
    const kollektivButton = target.closest('header .btn-group button[data-kollektiv]');
    const auswertungPane = target.closest('#auswertung-tab-pane');
    const statistikPane = target.closest('#statistik-tab-pane');
    const exportButton = target.closest('#export-tab-pane button[id^="export-"]');
    const praesDownloadButton = target.closest('#praesentation-tab-pane button[id^="download-"]');
    const toggleAllDatenBtn = target.closest('#daten-toggle-details');
    const toggleAllAuswBtn = target.closest('#auswertung-toggle-details');
    const modalExportBtn = target.closest('#export-bruteforce-modal-txt');
    const publikationNavLink = target.closest('#publikation-sections-nav .publikation-section-link');

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
    if (modalExportBtn && !modalExportBtn.disabled) { exportService.exportBruteForceReport(lastBruteForceResults, state.getCurrentKollektiv()); return; }
    if (publikationNavLink) { event.preventDefault(); handlePublikationSectionChange(publikationNavLink.dataset.sectionId); return; }

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

    switch (tabId) {
        case 'daten-tab': viewRenderer.renderDatenTab(currentData, state.getDatenTableSort()); break;
        case 'auswertung-tab': viewRenderer.renderAuswertungTab(currentData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), state.getAuswertungTableSort(), currentKollektiv, !!bruteForceWorker); break;
        case 'statistik-tab': viewRenderer.renderStatistikTab(processedData, appliedCriteria, appliedLogic, state.getCurrentStatsLayout(), state.getCurrentStatsKollektiv1(), state.getCurrentStatsKollektiv2(), currentKollektiv); break;
        case 'praesentation-tab': viewRenderer.renderPresentationTab(state.getCurrentPresentationView(), state.getCurrentPresentationStudyId(), currentKollektiv, processedData, appliedCriteria, appliedLogic); break;
        case 'publikation-tab': viewRenderer.renderPublikationTab(state.getCurrentPublikationLang(), state.getCurrentPublikationSection(), currentKollektiv, processedData, lastBruteForceResults); break;
        case 'export-tab': viewRenderer.renderExportTab(currentKollektiv); break;
        default: console.warn(`Unbekannter Tab angezeigt: ${tabId}`); const paneId = tabId.replace('-tab', '-tab-pane'); ui_helpers.updateElementHTML(paneId, `<div class="alert alert-warning m-3">Inhalt für Tab '${tabId}' nicht implementiert.</div>`);
    }
    updateUIState();
}

function handleKollektivChange(newKollektiv) { if (state.setCurrentKollektiv(newKollektiv)) { filterAndPrepareData(); updateUIState(); handleTabShown(state.getActiveTabId()); ui_helpers.showToast(`Kollektiv '${getKollektivDisplayName(newKollektiv)}' ausgewählt.`, 'info'); return true; } return false; }
function handleSortClick(sortHeader, sortSubHeader) { const key = sortHeader?.dataset.sortKey; if (!key) return; const subKey = sortSubHeader?.dataset.subKey || null; const tableBody = sortHeader.closest('table')?.querySelector('tbody'); let tableId = null; if (tableBody?.id === 'daten-table-body') tableId = 'daten'; else if (tableBody?.id === 'auswertung-table-body') tableId = 'auswertung'; if (tableId) handleSort(tableId, key, subKey); }
function handleSort(tableId, key, subKey = null) { let sortStateUpdated = false; if(tableId === 'daten') sortStateUpdated = state.updateDatenTableSortDirection(key, subKey); else if (tableId === 'auswertung') sortStateUpdated = state.updateAuswertungTableSortDirection(key, subKey); if(sortStateUpdated) { const sortState = (tableId === 'daten') ? state.getDatenTableSort() : state.getAuswertungTableSort(); filterAndPrepareData(); if (tableId === 'daten' && state.getActiveTabId() === 'daten-tab') viewRenderer.renderDatenTab(currentData, sortState); else if (tableId === 'auswertung' && state.getActiveTabId() === 'auswertung-tab') { viewRenderer.renderAuswertungTab(currentData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), sortState, state.getCurrentKollektiv(), !!bruteForceWorker ); } } }
function handleT2CheckboxChange(checkbox) { const key = checkbox.value; const isActive = checkbox.checked; if(t2CriteriaManager.toggleCriterionActive(key, isActive)){ ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleT2LogicChange(logicSwitch) { const newLogic = logicSwitch.checked ? 'ODER' : 'UND'; if(t2CriteriaManager.updateLogic(newLogic)) { ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleT2CriteriaButtonClick(button) { const criterionKey = button.dataset.criterion; const value = button.dataset.value; let changed = false; if (!t2CriteriaManager.getCurrentCriteria()[criterionKey]?.active) changed = t2CriteriaManager.toggleCriterionActive(criterionKey, true) || changed; changed = t2CriteriaManager.updateCriterionValue(criterionKey, value) || changed; if (changed) { ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleT2SizeInputChange(value) { if (t2CriteriaManager.updateCriterionThreshold(value)) { if (!t2CriteriaManager.getCurrentCriteria().size?.active) t2CriteriaManager.toggleCriterionActive('size', true); ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } else { const current = t2CriteriaManager.getCurrentCriteria().size?.threshold; const input = document.getElementById('input-size'); if(input && current !== undefined) input.value = formatNumber(current, 1, '', true); ui_helpers.showToast("Ungültiger Wert für Größe.", "warning"); } }
function handleT2SizeRangeChange(value) { if (t2CriteriaManager.updateCriterionThreshold(value)) { if (!t2CriteriaManager.getCurrentCriteria().size?.active) t2CriteriaManager.toggleCriterionActive('size', true); ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleResetCriteria() { t2CriteriaManager.resetCriteria(); ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); ui_helpers.showToast('T2 Kriterien zurückgesetzt (nicht angewendet).', 'info'); }
function handleApplyCriteria() { t2CriteriaManager.applyCriteria(); filterAndPrepareData(); ui_helpers.markCriteriaSavedIndicator(false); updateUIState(); handleTabShown(state.getActiveTabId()); ui_helpers.showToast('T2-Kriterien angewendet & gespeichert.', 'success'); }
function handleApplyBestBfCriteria() { if (!lastBruteForceResults?.bestResult?.criteria) { ui_helpers.showToast('Keine gültigen Brute-Force-Ergebnisse zum Anwenden.', 'warning'); return; } const best = lastBruteForceResults.bestResult; Object.keys(best.criteria).forEach(key => { if(key === 'logic') return; const criterion = best.criteria[key]; t2CriteriaManager.toggleCriterionActive(key, criterion.active); if(criterion.active) { if(key === 'size') t2CriteriaManager.updateCriterionThreshold(criterion.threshold); else t2CriteriaManager.updateCriterionValue(key, criterion.value); } }); t2CriteriaManager.updateLogic(best.logic); ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); handleApplyCriteria(); ui_helpers.showToast('Beste Brute-Force Kriterien angewendet & gespeichert.', 'success'); }
function handleStatsLayoutToggle(button) { setTimeout(() => { const isPressed = button.classList.contains('active'); const newLayout = isPressed ? 'vergleich' : 'einzel'; if (state.setCurrentStatsLayout(newLayout)) { updateUIState(); if (state.getActiveTabId() === 'statistik-tab') handleTabShown('statistik-tab'); } }, 50); }
function handleStatistikChange(event) { const target = event.target; let needsRender = false; if (target.id === 'statistik-kollektiv-select-1') needsRender = state.setCurrentStatsKollektiv1(target.value); else if (target.id === 'statistik-kollektiv-select-2') needsRender = state.setCurrentStatsKollektiv2(target.value); if(needsRender && state.getCurrentStatsLayout() === 'vergleich' && state.getActiveTabId() === 'statistik-tab') handleTabShown('statistik-tab'); }
function handlePresentationChangeDelegation(event) { const viewRadio = event.target.closest('input[name="praesentationAnsicht"]'); const studySelect = event.target.closest('#praes-study-select'); if(viewRadio) handlePresentationViewChange(viewRadio.value); else if (studySelect) handlePresentationStudySelectChange(studySelect.value); }
function handlePresentationViewChange(view) { if (state.setCurrentPresentationView(view)) { updateUIState(); if (state.getActiveTabId() === 'praesentation-tab') handleTabShown('praesentation-tab'); } }
function handlePresentationStudySelectChange(studyId) { if (!studyId || state.getCurrentPresentationStudyId() === studyId) return; const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId); let kollektivChanged = false; if (studySet?.applicableKollektiv && state.getCurrentKollektiv() !== studySet.applicableKollektiv && studySet.applicableKollektiv !== 'Gesamt') { kollektivChanged = handleKollektivChange(studySet.applicableKollektiv); } const studyIdChanged = state.setCurrentPresentationStudyId(studyId); if (studyIdChanged || kollektivChanged) { updateUIState(); if (state.getActiveTabId() === 'praesentation-tab') handleTabShown('praesentation-tab'); } }
function handlePresentationDownloadClick(button) { const actionId = button.id; const currentKollektiv = state.getCurrentKollektiv(); let presentationData = null; const filteredData = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv); if (filteredData?.length > 0) { const statsAS = statisticsService.calculateDiagnosticPerformance(filteredData, 'as', 'n'); const statsGesamt = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'Gesamt'), 'as', 'n'); const statsDirektOP = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'direkt OP'), 'as', 'n'); const statsNRCT = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'nRCT'), 'as', 'n'); presentationData = { statsAS, kollektiv: currentKollektiv, patientCount: filteredData.length, statsGesamt, statsDirektOP, statsNRCT, statsCurrentKollektiv: statsAS }; if (state.getCurrentPresentationView() === 'as-vs-t2') { const studyId = state.getCurrentPresentationStudyId(); let studySet = null, evaluatedDataT2 = null; const isApplied = studyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID; const appliedCriteria = t2CriteriaManager.getAppliedCriteria(); const appliedLogic = t2CriteriaManager.getAppliedLogic(); if(isApplied) { studySet = { criteria: appliedCriteria, logic: appliedLogic, id: studyId, name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME, displayShortName: 'Angewandt', studyInfo: { reference: "Benutzerdefiniert", patientCohort: `Aktuell: ${getKollektivDisplayName(currentKollektiv)} (N=${presentationData.patientCount})`, investigationType: "N/A", focus: "Benutzereinstellung", keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic) || "Keine" } }; evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), appliedCriteria, appliedLogic); } else { studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId); if(studySet) evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(filteredData), studySet); } if (studySet && evaluatedDataT2) { presentationData.statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n'); evaluatedDataT2.forEach((p, i) => { if (filteredData[i]) p.as = filteredData[i].as; }); presentationData.vergleich = statisticsService.compareDiagnosticMethods(evaluatedDataT2, 'as', 't2', 'n'); presentationData.comparisonCriteriaSet = studySet; presentationData.t2CriteriaLabelShort = studySet.displayShortName || 'T2'; presentationData.t2CriteriaLabelFull = `${isApplied ? 'Aktuell angewandt' : (studySet.name || 'Studie')}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic)}`; } } } exportService.exportPraesentationData(actionId, presentationData, currentKollektiv); }
function handleExportAction(exportType) { filterAndPrepareData(); const dataForExport = currentData; const currentKollektiv = state.getCurrentKollektiv(); const appliedCriteria = t2CriteriaManager.getAppliedCriteria(); const appliedLogic = t2CriteriaManager.getAppliedLogic(); const canExport = Array.isArray(dataForExport) && dataForExport.length > 0; if (!canExport && !['bruteforce-txt', 'all-zip', 'png-zip', 'svg-zip', 'csv-zip', 'md-zip', 'html'].includes(exportType)) { ui_helpers.showToast("Keine Daten für diesen Export verfügbar.", "warning"); return; } if (exportType === 'bruteforce-txt' && !lastBruteForceResults) { ui_helpers.showToast("Keine Brute-Force Ergebnisse für Export.", "warning"); return; } if (['all-zip', 'png-zip', 'svg-zip', 'csv-zip', 'md-zip', 'html'].includes(exportType) && !canExport && !lastBruteForceResults && exportType !== 'html') { ui_helpers.showToast("Keine Daten/Ergebnisse für ZIP-Export.", "warning"); return; } if (exportType === 'html' && !canExport) { ui_helpers.showToast("Keine Daten für HTML-Report.", "warning"); return; } switch (exportType) { case 'statistik-csv': exportService.exportStatistikCSV(processedData, currentKollektiv, appliedCriteria, appliedLogic); break; case 'bruteforce-txt': exportService.exportBruteForceReport(lastBruteForceResults, currentKollektiv); break; case 'deskriptiv-md': { const stats = statisticsService.calculateAllStatsForPublication(processedData, appliedCriteria, appliedLogic, lastBruteForceResults ? {[currentKollektiv]: lastBruteForceResults} : {})[currentKollektiv]; exportService.exportTableMarkdown(stats?.deskriptiv, 'deskriptiv', currentKollektiv); break; } case 'daten-md': exportService.exportTableMarkdown(dataForExport, 'daten', currentKollektiv); break; case 'auswertung-md': exportService.exportTableMarkdown(dataForExport, 'auswertung', currentKollektiv, appliedCriteria, appliedLogic); break; case 'filtered-data-csv': exportService.exportFilteredDataCSV(dataForExport, currentKollektiv); break; case 'comprehensive-report-html': exportService.exportComprehensiveReportHTML(processedData, lastBruteForceResults, currentKollektiv, appliedCriteria, appliedLogic); break; case 'charts-png': exportService.exportChartsZip('#app-container', 'PNG_ZIP', currentKollektiv, 'png'); break; case 'charts-svg': exportService.exportChartsZip('#app-container', 'SVG_ZIP', currentKollektiv, 'svg'); break; case 'all-zip': case 'csv-zip': case 'md-zip': exportService.exportCategoryZip(exportType, processedData, lastBruteForceResults, currentKollektiv, appliedCriteria, appliedLogic); break; default: console.warn(`Unbekannter Export-Typ: ${exportType}`); ui_helpers.showToast(`Export-Typ '${exportType}' nicht implementiert.`, 'warning'); break; } }
function handleSingleChartDownload(button) { const chartId = button.dataset.chartId; const format = button.dataset.format; const chartName = button.dataset.chartName || chartId.replace(/^chart-/, '').replace(/-container$/, '').replace(/-content$/, '').replace(/-[0-9]+$/, ''); if (chartId && (format === 'png' || format === 'svg')) exportService.exportSingleChart(chartId, format, state.getCurrentKollektiv(), {chartName: chartName}); else ui_helpers.showToast("Fehler beim Chart-Download.", "warning"); }
function handleSingleTableDownload(button) { if (!button) return; const tableId = button.dataset.tableId; const tableName = button.dataset.tableName || 'Tabelle'; if (tableId && APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT) exportService.exportTablePNG(tableId, state.getCurrentKollektiv(), 'TABLE_PNG_EXPORT', tableName); else if (!tableId) ui_helpers.showToast(`Fehler: Tabelle '${tableName}' nicht gefunden.`, "danger"); }
function handlePublikationChange(event) { const target = event.target; if (target.id === 'publikation-sprache-switch') { if(state.setCurrentPublikationLang(target.checked ? 'en' : 'de')) { updateUIState(); handleTabShown('publikation-tab'); } } else if (target.id === 'publikation-bf-metric-select') { if(state.setCurrentPublikationBruteForceMetric(target.value)) { updateUIState(); handleTabShown('publikation-tab'); } } }
function handlePublikationSectionChange(sectionId) { if (state.setCurrentPublikationSection(sectionId)) { updateUIState(); handleTabShown('publikation-tab'); const contentArea = document.getElementById('publikation-content-area'); if(contentArea) contentArea.scrollTop = 0; } }
function initializeBruteForceWorker() { if (!window.Worker) { ui_helpers.showToast("Web Worker nicht unterstützt.", "danger"); ui_helpers.updateBruteForceUI('error', {message: 'Web Worker not supported'}, false, state.getCurrentKollektiv()); return; } try { if(bruteForceWorker) bruteForceWorker.terminate(); bruteForceWorker = new Worker(APP_CONFIG.PATHS.BRUTE_FORCE_WORKER); bruteForceWorker.onmessage = handleBruteForceMessage; bruteForceWorker.onerror = handleBruteForceError; bruteForceWorker.onmessageerror = (e) => console.error("Worker messageerror:", e); ui_helpers.updateBruteForceUI('idle', {}, true, state.getCurrentKollektiv()); } catch (e) { console.error("Fehler Initialisierung Brute Force Worker:", e); ui_helpers.showToast("Fehler: Worker Start fehlgeschlagen.", "danger"); bruteForceWorker = null; ui_helpers.updateBruteForceUI('error', {message: 'Worker init failed'}, false, state.getCurrentKollektiv()); } }
function handleStartBruteForce() { if (isBruteForceRunning || !bruteForceWorker) return; isBruteForceRunning = true; lastBruteForceResults = null; const metric = document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC; const currentKollektiv = state.getCurrentKollektiv(); const dataForWorker = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv).map(p => ({ nr: p.nr, n: p.n, lymphknoten_t2: p.lymphknoten_t2 })); if (dataForWorker.length === 0) { ui_helpers.showToast("Keine Daten für Optimierung.", "warning"); isBruteForceRunning = false; ui_helpers.updateBruteForceUI('idle', {}, !!bruteForceWorker, currentKollektiv); return; } ui_helpers.updateBruteForceUI('start', { metric: metric, kollektiv: currentKollektiv }, true, currentKollektiv); bruteForceWorker.postMessage({ action: 'start', payload: { data: dataForWorker, metric: metric, kollektiv: currentKollektiv, t2SizeRange: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE } }); updateUIState(); }
function handleCancelBruteForce() { if (!isBruteForceRunning || !bruteForceWorker) return; bruteForceWorker.postMessage({ action: 'cancel' }); isBruteForceRunning = false; ui_helpers.updateBruteForceUI('cancelled', {}, true, state.getCurrentKollektiv()); ui_helpers.showToast('Optimierung abgebrochen.', 'warning'); updateUIState(); }
function handleBruteForceMessage(event) { if (!event || !event.data) return; const { type, payload } = event.data; if (!isBruteForceRunning && type !== 'cancelled' && type !== 'error') return; const currentKollektiv = state.getCurrentKollektiv(); const currentMetric = payload?.metric || (type === 'progress' ? payload?.currentBest?.metric : null) || document.getElementById('brute-force-metric')?.value || 'Balanced Accuracy'; switch (type) { case 'started': ui_helpers.updateBruteForceUI('started', { ...payload, metric: currentMetric }, true, currentKollektiv); break; case 'progress': ui_helpers.updateBruteForceUI('progress', { ...payload, metric: currentMetric }, true, currentKollektiv); break; case 'result': isBruteForceRunning = false; lastBruteForceResults = payload; ui_helpers.updateBruteForceUI('result', payload, true, currentKollektiv); if(payload?.results?.length > 0){ const modalBody = document.querySelector('#brute-force-modal .modal-body'); if (modalBody) { modalBody.innerHTML = uiComponents.createBruteForceModalContent(payload.results, payload.metric, payload.kollektiv, payload.duration, payload.totalTested); ui_helpers.initializeTooltips(modalBody); } ui_helpers.showToast('Optimierung abgeschlossen.', 'success'); if (state.getActiveTabId() === 'publikation-tab') { publikationTabLogic.initializeData(processedData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), lastBruteForceResults); handleTabShown('publikation-tab'); } } else { ui_helpers.showToast('Optimierung ohne valide Ergebnisse.', 'warning'); } updateUIState(); break; case 'cancelled': isBruteForceRunning = false; ui_helpers.updateBruteForceUI('cancelled', {}, true, currentKollektiv); updateUIState(); break; case 'error': isBruteForceRunning = false; ui_helpers.showToast(`Optimierungsfehler: ${payload?.message || 'Unbekannt'}`, 'danger'); ui_helpers.updateBruteForceUI('error', payload, true, currentKollektiv); updateUIState(); break; default: console.warn(`Unbekannter Worker Nachrichtentyp: ${type}`); } }
function handleBruteForceError(error) { console.error("Fehler im Brute Force Worker:", error); isBruteForceRunning = false; ui_helpers.showToast("Fehler: Hintergrundverarbeitung gestoppt.", "danger"); ui_helpers.updateBruteForceUI('error', { message: error.message || 'Worker Error' }, false, state.getCurrentKollektiv()); bruteForceWorker = null; updateUIState(); }

document.addEventListener('DOMContentLoaded', initializeApp);
