let processedData = [];
let currentData = [];
let localRawData = typeof patientDataRaw !== 'undefined' ? patientDataRaw : [];

const debouncedUpdateSizeInput = debounce(handleT2SizeInputChange, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);
const debouncedUpdateSizeRange = debounce(handleT2SizeRangeChange, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);

function initializeApp() {
    const initialLang = state.getCurrentPublikationLang() || 'de';
    const localizedInitialTexts = getLocalizedUITexts(initialLang);

    console.log(`${(localizedInitialTexts.general && localizedInitialTexts.general.loading) || 'Initialisiere'} ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION}...`);
    
    const requiredLibs = {
        'bootstrap': typeof bootstrap !== 'undefined' && bootstrap.Toast && bootstrap.Tab && bootstrap.Modal && bootstrap.Collapse,
        'd3': typeof d3 !== 'undefined',
        'tippy': typeof tippy !== 'undefined',
        'Papa': typeof Papa !== 'undefined',
        'JSZip': typeof JSZip !== 'undefined'
    };
    const missingLibs = Object.keys(requiredLibs).filter(lib => !requiredLibs[lib]);

    if (missingLibs.length > 0) {
        const errorMsg = initialLang === 'de' ?
            `Fehler: Bibliotheken (${missingLibs.join(', ')}) konnten nicht vollständig geladen werden.` :
            `Error: Libraries (${missingLibs.join(', ')}) could not be fully loaded.`;
        console.error("Externe Bibliotheken fehlen oder sind unvollständig:", missingLibs.join(', '));
        ui_helpers.updateElementHTML('app-container', `<div class="alert alert-danger m-5">${errorMsg}</div>`);
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
            typeof publicationTextGenerator === 'undefined' || typeof studyT2CriteriaManager === 'undefined' ||
            typeof bruteForceManager === 'undefined'
        ) {
             throw new Error(initialLang === 'de' ? "Ein oder mehrere Kernmodule sind nicht verfügbar. Überprüfen Sie die Skript-Ladereihenfolge und Dateipfade." : "One or more core modules are not available. Check script loading order and file paths.");
        }

        state.init();
        t2CriteriaManager.initialize();

        processedData = dataProcessor.processPatientData(localRawData);

        if (processedData.length === 0) {
            const noDataWarn = initialLang === 'de' ? "Keine validen Patientendaten gefunden nach Prozessierung." : "No valid patient data found after processing.";
            console.warn(noDataWarn);
            ui_helpers.showToast(noDataWarn, "warning");
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

        ui_helpers.initializeTooltips(document.body);
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());

        const initSuccessMsg = initialLang === 'de' ? 'Anwendung initialisiert.' : 'Application initialized.';
        ui_helpers.showToast(initSuccessMsg, 'success', 2500);
        const initDoneMsg = initialLang === 'de' ? "App Initialisierung abgeschlossen." : "App initialization complete.";
        console.log(initDoneMsg);

    } catch (error) {
         console.error("Fehler während der App-Initialisierung:", error);
         const errorInitMsg = (initialLang === 'de' ? `Initialisierungsfehler: ${error.message}. Stellen Sie sicher, dass alle Skripte korrekt geladen wurden und die Dateipfade in index.html aktuell sind.` : `Initialization error: ${error.message}. Ensure all scripts are loaded correctly and file paths in index.html are current.`);
         ui_helpers.updateElementHTML('app-container', `<div class="alert alert-danger m-5">${errorInitMsg}</div>`);
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
         const lang = state.getCurrentPublikationLang() || 'de';
         const errorMsg = lang === 'de' ? "Fehler bei der Datenaufbereitung." : "Error during data preparation.";
         ui_helpers.showToast(errorMsg, "danger");
    }
}

function updateUIState() {
    try {
        const currentKollektiv = state.getCurrentKollektiv();
        const headerStats = dataProcessor.calculateHeaderStats(currentData, currentKollektiv); // calculateHeaderStats now uses lang from state
        ui_helpers.updateHeaderStatsUI(headerStats);
        ui_helpers.updateKollektivButtonsUI(currentKollektiv); // This may need lang if button texts are dynamic
        ui_helpers.updateStatistikSelectorsUI(state.getCurrentStatsLayout(), state.getCurrentStatsKollektiv1(), state.getCurrentStatsKollektiv2()); // Uses lang from state for button text
        ui_helpers.updatePresentationViewSelectorUI(state.getCurrentPresentationView()); // Labels are static in HTML for now

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
    if (modalExportBtn && !modalExportBtn.disabled) { exportService.exportBruteForceReport(bruteForceManager.getResultsForKollektiv(state.getCurrentKollektiv()), state.getCurrentKollektiv()); return; }
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
        updateUIState(); // Call this after data prep to ensure UI reflects correct state for the new tab
        handleTabShown(event.target.id);
    }
}

function handleTabShown(tabId) {
    const lang = state.getCurrentPublikationLang() || 'de';
    const localizedTexts = getLocalizedUITexts(lang);

    if (typeof viewRenderer === 'undefined') {
        const errorMsg = lang === 'de' ? `Fehler: UI Renderer nicht bereit für Tab '${tabId}'.` : `Error: UI Renderer not ready for tab '${tabId}'.`;
        console.error(errorMsg);
        ui_helpers.showToast(errorMsg, 'danger');
        const paneId = tabId.replace('-tab', '-tab-pane');
        const errorHtml = lang === 'de' ? `<div class="alert alert-danger m-3">Interner Fehler: UI Renderer konnte nicht geladen werden.</div>` : `<div class="alert alert-danger m-3">Internal Error: UI Renderer could not be loaded.</div>`;
        ui_helpers.updateElementHTML(paneId, errorHtml);
        return;
    }
    const currentKollektiv = state.getCurrentKollektiv();
    const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
    const appliedLogic = t2CriteriaManager.getAppliedLogic();

    // Pass lang and localizedTexts to tab render functions
    switch (tabId) {
        case 'daten-tab': viewRenderer.renderDatenTab(currentData, state.getDatenTableSort(), lang, localizedTexts); break;
        case 'auswertung-tab': viewRenderer.renderAuswertungTab(currentData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), state.getAuswertungTableSort(), currentKollektiv, bruteForceManager.isWorkerAvailable(), lang, localizedTexts); break;
        case 'statistik-tab': viewRenderer.renderStatistikTab(processedData, appliedCriteria, appliedLogic, state.getCurrentStatsLayout(), state.getCurrentStatsKollektiv1(), state.getCurrentStatsKollektiv2(), currentKollektiv, lang, localizedTexts); break;
        case 'praesentation-tab': viewRenderer.renderPresentationTab(state.getCurrentPresentationView(), state.getCurrentPresentationStudyId(), currentKollektiv, processedData, appliedCriteria, appliedLogic, lang, localizedTexts); break;
        case 'publikation-tab':
            viewRenderer.renderPublikationTab(lang, state.getCurrentPublikationSection(), currentKollektiv, localRawData, bruteForceManager.getAllResults()); // lang is passed directly
            break;
        case 'export-tab': viewRenderer.renderExportTab(currentKollektiv, lang, localizedTexts); break; // createExportOptions now fetches lang from state
        default: 
            console.warn(`Unbekannter Tab angezeigt: ${tabId}`); 
            const paneId = tabId.replace('-tab', '-tab-pane'); 
            const unknownTabText = (lang === 'de' ? `Inhalt für Tab '${tabId}' nicht implementiert.` : `Content for tab '${tabId}' not implemented.`);
            ui_helpers.updateElementHTML(paneId, `<div class="alert alert-warning m-3">${unknownTabText}</div>`);
    }
    // updateUIState() is called in handleTabShownEvent after this function completes
}

function handleKollektivChange(newKollektiv) { 
    if (state.setCurrentKollektiv(newKollektiv)) { 
        filterAndPrepareData(); 
        updateUIState(); 
        handleTabShown(state.getActiveTabId()); 
        const lang = state.getCurrentPublikationLang() || 'de';
        const localizedTexts = getLocalizedUITexts(lang);
        const kollektivDisplayName = getKollektivDisplayName(newKollektiv, lang, localizedTexts);
        const toastMsg = (lang === 'de' ? `Kollektiv '${kollektivDisplayName}' ausgewählt.` : `Cohort '${kollektivDisplayName}' selected.`);
        ui_helpers.showToast(toastMsg, 'info'); 
        return true; 
    } 
    return false; 
}

function handleSortClick(sortHeader, sortSubHeader) { 
    const key = sortHeader?.dataset.sortKey; 
    if (!key) return; 
    const subKey = sortSubHeader?.dataset.subKey || null; 
    const tableBody = sortHeader.closest('table')?.querySelector('tbody'); 
    let tableId = null; 
    if (tableBody?.id === 'daten-table-body') tableId = 'daten'; 
    else if (tableBody?.id === 'auswertung-table-body') tableId = 'auswertung'; 
    if (tableId) handleSort(tableId, key, subKey); 
}

function handleSort(tableId, key, subKey = null) { 
    let sortStateUpdated = false; 
    if(tableId === 'daten') sortStateUpdated = state.updateDatenTableSortDirection(key, subKey); 
    else if (tableId === 'auswertung') sortStateUpdated = state.updateAuswertungTableSortDirection(key, subKey); 
    
    if(sortStateUpdated) { 
        const sortState = (tableId === 'daten') ? state.getDatenTableSort() : state.getAuswertungTableSort(); 
        filterAndPrepareData(); 
        const lang = state.getCurrentPublikationLang() || 'de';
        const localizedTexts = getLocalizedUITexts(lang);
        if (tableId === 'daten' && state.getActiveTabId() === 'daten-tab') {
            viewRenderer.renderDatenTab(currentData, sortState, lang, localizedTexts); 
        } else if (tableId === 'auswertung' && state.getActiveTabId() === 'auswertung-tab') { 
            viewRenderer.renderAuswertungTab(currentData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), sortState, state.getCurrentKollektiv(), bruteForceManager.isWorkerAvailable(), lang, localizedTexts ); 
        } 
    } 
}

function handleT2CheckboxChange(checkbox) { 
    const key = checkbox.value; 
    const isActive = checkbox.checked; 
    if(t2CriteriaManager.toggleCriterionActive(key, isActive)){ 
        ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); 
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); 
    } 
}

function handleT2LogicChange(logicSwitch) { 
    const newLogic = logicSwitch.checked ? 'ODER' : 'UND'; 
    if(t2CriteriaManager.updateLogic(newLogic)) { 
        ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); 
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); 
    } 
}

function handleT2CriteriaButtonClick(button) { 
    const criterionKey = button.dataset.criterion; 
    const value = button.dataset.value; 
    let changed = false; 
    if (!t2CriteriaManager.getCurrentCriteria()[criterionKey]?.active) {
        changed = t2CriteriaManager.toggleCriterionActive(criterionKey, true) || changed; 
    }
    changed = t2CriteriaManager.updateCriterionValue(criterionKey, value) || changed; 
    if (changed) { 
        ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); 
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); 
    } 
}

function handleT2SizeInputChange(value) { 
    const lang = state.getCurrentPublikationLang() || 'de';
    if (t2CriteriaManager.updateCriterionThreshold(value)) { 
        if (!t2CriteriaManager.getCurrentCriteria().size?.active) t2CriteriaManager.toggleCriterionActive('size', true); 
        ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); 
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); 
    } else { 
        const current = t2CriteriaManager.getCurrentCriteria().size?.threshold; 
        const input = document.getElementById('input-size'); 
        if(input && current !== undefined) input.value = formatNumber(current, 1, '', true); 
        const errorMsg = lang === 'de' ? "Ungültiger Wert für Größe." : "Invalid value for size.";
        ui_helpers.showToast(errorMsg, "warning"); 
    } 
}

function handleT2SizeRangeChange(value) { 
    if (t2CriteriaManager.updateCriterionThreshold(value)) { 
        if (!t2CriteriaManager.getCurrentCriteria().size?.active) t2CriteriaManager.toggleCriterionActive('size', true); 
        ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); 
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); 
    } 
}

function handleResetCriteria() { 
    t2CriteriaManager.resetCriteria(); 
    ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); 
    ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); 
    const lang = state.getCurrentPublikationLang() || 'de';
    const msg = lang === 'de' ? 'T2 Kriterien zurückgesetzt (nicht angewendet).' : 'T2 criteria reset (not applied).';
    ui_helpers.showToast(msg, 'info'); 
}

function handleApplyCriteria() { 
    t2CriteriaManager.applyCriteria(); 
    filterAndPrepareData(); 
    ui_helpers.markCriteriaSavedIndicator(false); 
    updateUIState(); 
    handleTabShown(state.getActiveTabId()); 
    const lang = state.getCurrentPublikationLang() || 'de';
    const msg = lang === 'de' ? 'T2-Kriterien angewendet & gespeichert.' : 'T2 criteria applied & saved.';
    ui_helpers.showToast(msg, 'success'); 
}

function handleApplyBestBfCriteria() { 
    const currentKollektiv = state.getCurrentKollektiv(); 
    const bfResultForKollektiv = bruteForceManager.getResultsForKollektiv(currentKollektiv); 
    const lang = state.getCurrentPublikationLang() || 'de';
    if (!bfResultForKollektiv?.bestResult?.criteria) { 
        const msg = lang === 'de' ? 'Keine gültigen Brute-Force-Ergebnisse für dieses Kollektiv zum Anwenden.' : 'No valid brute-force results for this cohort to apply.';
        ui_helpers.showToast(msg, 'warning'); 
        return; 
    } 
    const best = bfResultForKollektiv.bestResult; 
    Object.keys(best.criteria).forEach(key => { 
        if(key === 'logic') return; 
        const criterion = best.criteria[key]; 
        t2CriteriaManager.toggleCriterionActive(key, criterion.active); 
        if(criterion.active) { 
            if(key === 'size') t2CriteriaManager.updateCriterionThreshold(criterion.threshold); 
            else t2CriteriaManager.updateCriterionValue(key, criterion.value); 
        } 
    }); 
    t2CriteriaManager.updateLogic(best.logic); 
    ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); 
    handleApplyCriteria(); 
    const successMsg = lang === 'de' ? 'Beste Brute-Force Kriterien angewendet & gespeichert.' : 'Best brute-force criteria applied & saved.';
    ui_helpers.showToast(successMsg, 'success'); 
}

function handleStatsLayoutToggle(button) { 
    setTimeout(() => { 
        const isPressed = button.classList.contains('active'); 
        const newLayout = isPressed ? 'vergleich' : 'einzel'; 
        if (state.setCurrentStatsLayout(newLayout)) { 
            updateUIState(); 
            if (state.getActiveTabId() === 'statistik-tab') handleTabShown('statistik-tab'); 
        } 
    }, 50); 
}

function handleStatistikChange(event) { 
    const target = event.target; 
    let needsRender = false; 
    if (target.id === 'statistik-kollektiv-select-1') needsRender = state.setCurrentStatsKollektiv1(target.value); 
    else if (target.id === 'statistik-kollektiv-select-2') needsRender = state.setCurrentStatsKollektiv2(target.value); 
    if(needsRender && state.getCurrentStatsLayout() === 'vergleich' && state.getActiveTabId() === 'statistik-tab') handleTabShown('statistik-tab'); 
}

function handlePresentationChangeDelegation(event) { 
    const viewRadio = event.target.closest('input[name="praesentationAnsicht"]'); 
    const studySelect = event.target.closest('#praes-study-select'); 
    if(viewRadio) handlePresentationViewChange(viewRadio.value); 
    else if (studySelect) handlePresentationStudySelectChange(studySelect.value); 
}

function handlePresentationViewChange(view) { 
    if (state.setCurrentPresentationView(view)) { 
        updateUIState(); 
        if (state.getActiveTabId() === 'praesentation-tab') handleTabShown('praesentation-tab'); 
    } 
}

function handlePresentationStudySelectChange(studyId) { 
    if (!studyId || state.getCurrentPresentationStudyId() === studyId) return; 
    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId); 
    let kollektivChanged = false; 
    if (studySet?.applicableKollektiv && state.getCurrentKollektiv() !== studySet.applicableKollektiv && studySet.applicableKollektiv !== 'Gesamt') { 
        kollektivChanged = handleKollektivChange(studySet.applicableKollektiv); 
    } 
    const studyIdChanged = state.setCurrentPresentationStudyId(studyId); 
    if (studyIdChanged || kollektivChanged) { 
        updateUIState(); 
        if (state.getActiveTabId() === 'praesentation-tab') handleTabShown('praesentation-tab'); 
    } 
}

function handlePresentationDownloadClick(button) { 
    const actionId = button.id; 
    const currentKollektiv = state.getCurrentKollektiv(); 
    const lang = state.getCurrentPublikationLang() || 'de';
    const localizedTexts = getLocalizedUITexts(lang);
    let presentationData = null; 
    const filteredData = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv); 
    if (filteredData?.length > 0) { 
        const statsAS = statisticsService.calculateDiagnosticPerformance(filteredData, 'as', 'n'); 
        const statsGesamt = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'Gesamt'), 'as', 'n'); 
        const statsDirektOP = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'direkt OP'), 'as', 'n'); 
        const statsNRCT = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'nRCT'), 'as', 'n'); 
        presentationData = { statsAS, kollektiv: currentKollektiv, patientCount: filteredData.length, statsGesamt, statsDirektOP, statsNRCT, statsCurrentKollektiv: statsAS }; 
        if (state.getCurrentPresentationView() === 'as-vs-t2') { 
            const studyId = state.getCurrentPresentationStudyId(); 
            let studySet = null, evaluatedDataT2 = null; 
            const isApplied = studyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID; 
            const appliedCriteria = t2CriteriaManager.getAppliedCriteria(); 
            const appliedLogic = t2CriteriaManager.getAppliedLogic(); 
            if(isApplied) { 
                const appliedDisplayName = getKollektivDisplayName(APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, lang, localizedTexts);
                studySet = { 
                    criteria: appliedCriteria, logic: appliedLogic, id: studyId, 
                    name: appliedDisplayName, 
                    displayShortName: lang === 'de' ? "Angewandt" : "Applied", 
                    studyInfo: { 
                        reference: lang === 'de' ? "Benutzerdefiniert" : "User-defined", 
                        patientCohort: `${lang === 'de' ? 'Aktuell' : 'Current'}: ${getKollektivDisplayName(currentKollektiv, lang, localizedTexts)} (N=${presentationData.patientCount})`, 
                        investigationType: (localizedTexts.general || {}).notApplicable || "N/A", 
                        focus: lang === 'de' ? "Benutzereinstellung" : "User Setting", 
                        keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic) || (lang === 'de' ? "Keine" : "None") 
                    } 
                }; 
                evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), appliedCriteria, appliedLogic); 
            } else { 
                studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId); 
                if(studySet) evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(filteredData), studySet); 
            } 
            if (studySet && evaluatedDataT2) { 
                presentationData.statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n'); 
                evaluatedDataT2.forEach((p, i) => { if (filteredData[i]) p.as = filteredData[i].as; }); 
                presentationData.vergleich = statisticsService.compareDiagnosticMethods(evaluatedDataT2, 'as', 't2', 'n'); 
                presentationData.comparisonCriteriaSet = studySet; 
                presentationData.t2CriteriaLabelShort = studySet.displayShortName || 'T2';
                const t2BaseName = isApplied ? getKollektivDisplayName(APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, lang, localizedTexts) : (studySet.name || (lang === 'de' ? 'Studie' : 'Study'));
                presentationData.t2CriteriaLabelFull = `${t2BaseName}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic)}`;
            } 
        } 
    } 
    exportService.exportPraesentationData(actionId, presentationData, currentKollektiv); 
}

function handleExportAction(exportType) { 
    filterAndPrepareData(); 
    const dataForExport = currentData; 
    const currentKollektiv = state.getCurrentKollektiv(); 
    const appliedCriteria = t2CriteriaManager.getAppliedCriteria(); 
    const appliedLogic = t2CriteriaManager.getAppliedLogic(); 
    const allBfResults = bruteForceManager.getAllResults(); 
    const currentKollektivBfResult = allBfResults ? allBfResults[currentKollektiv] : null; 
    const canExportDataDep = Array.isArray(dataForExport) && dataForExport.length > 0; 
    const lang = state.getCurrentPublikationLang() || 'de';

    if (!canExportDataDep && !['bruteforce-txt', 'all-zip', 'png-zip', 'svg-zip', 'csv-zip', 'md-zip', 'html'].includes(exportType)) { 
        ui_helpers.showToast(lang === 'de' ? "Keine Daten für diesen Export verfügbar." : "No data available for this export.", "warning"); 
        return; 
    } 
    if (exportType === 'bruteforce-txt' && (!currentKollektivBfResult || !currentKollektivBfResult.results || currentKollektivBfResult.results.length === 0 )) { 
        ui_helpers.showToast(lang === 'de' ? "Keine Brute-Force Ergebnisse für Export dieses Kollektivs." : "No brute-force results for export of this cohort.", "warning"); 
        return; 
    } 
    if (['all-zip', 'csv-zip', 'md-zip'].includes(exportType) && !canExportDataDep && (!allBfResults || Object.keys(allBfResults).length === 0) ) { 
        ui_helpers.showToast(lang === 'de' ? "Keine Daten/Ergebnisse für ZIP-Export." : "No data/results for ZIP export.", "warning"); 
        return; 
    } 
    if (exportType === 'html' && !canExportDataDep) { 
        ui_helpers.showToast(lang === 'de' ? "Keine Daten für HTML-Report." : "No data for HTML report.", "warning"); 
        return; 
    } 
    switch (exportType) { 
        case 'statistik-csv': exportService.exportStatistikCSV(localRawData, currentKollektiv, appliedCriteria, appliedLogic); break; 
        case 'bruteforce-txt': exportService.exportBruteForceReport(currentKollektivBfResult, currentKollektiv); break; 
        case 'deskriptiv-md': { const stats = statisticsService.calculateAllStatsForPublication(localRawData, appliedCriteria, appliedLogic, allBfResults)[currentKollektiv]; exportService.exportTableMarkdown(stats?.deskriptiv, 'deskriptiv', currentKollektiv); break; } 
        case 'daten-md': exportService.exportTableMarkdown(dataForExport, 'daten', currentKollektiv); break; 
        case 'auswertung-md': exportService.exportTableMarkdown(dataForExport, 'auswertung', currentKollektiv, appliedCriteria, appliedLogic); break; 
        case 'filtered-data-csv': exportService.exportFilteredDataCSV(dataForExport, currentKollektiv); break; 
        case 'comprehensive-report-html': exportService.exportComprehensiveReportHTML(localRawData, currentKollektivBfResult, currentKollektiv, appliedCriteria, appliedLogic); break; 
        case 'charts-png': exportService.exportChartsZip('#app-container', 'PNG_ZIP', currentKollektiv, 'png'); break; 
        case 'charts-svg': exportService.exportChartsZip('#app-container', 'SVG_ZIP', currentKollektiv, 'svg'); break; 
        case 'all-zip': case 'csv-zip': case 'md-zip': exportService.exportCategoryZip(exportType, localRawData, allBfResults, currentKollektiv, appliedCriteria, appliedLogic); break; 
        default: 
            console.warn(`Unbekannter Export-Typ: ${exportType}`); 
            const unknownExportMsg = (lang === 'de' ? `Export-Typ '${exportType}' nicht implementiert.` : `Export type '${exportType}' not implemented.`);
            ui_helpers.showToast(unknownExportMsg, 'warning'); 
            break; 
    } 
}

function handleSingleChartDownload(button) { 
    const chartId = button.dataset.chartId; 
    const format = button.dataset.format; 
    const chartName = button.dataset.chartName || chartId.replace(/^chart-/, '').replace(/-container$/, '').replace(/-content$/, '').replace(/-[0-9]+$/, ''); 
    const lang = state.getCurrentPublikationLang() || 'de';
    if (chartId && (format === 'png' || format === 'svg')) {
        exportService.exportSingleChart(chartId, format, state.getCurrentKollektiv(), {chartName: chartName});
    } else {
        ui_helpers.showToast(lang === 'de' ? "Fehler beim Chart-Download." : "Error during chart download.", "warning"); 
    }
}

function handleSingleTableDownload(button) { 
    if (!button) return; 
    const tableId = button.dataset.tableId; 
    const tableName = button.dataset.tableName || 'Tabelle'; 
    const lang = state.getCurrentPublikationLang() || 'de';
    if (tableId && APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT) {
        exportService.exportTablePNG(tableId, state.getCurrentKollektiv(), 'TABLE_PNG_EXPORT', tableName); 
    } else if (!tableId) {
        ui_helpers.showToast((lang === 'de' ? `Fehler: Tabelle '${tableName}' nicht gefunden.` : `Error: Table '${tableName}' not found.`), "danger"); 
    }
}

function handlePublikationChange(event) { 
    const target = event.target; 
    if (target.id === 'publikation-sprache-switch') { 
        if(state.setCurrentPublikationLang(target.checked ? 'en' : 'de')) { 
            updateUIState(); // Update global UI elements like header
            handleTabShown('publikation-tab'); // Re-render publication tab
        } 
    } else if (target.id === 'publikation-bf-metric-select') { 
        if(state.setCurrentPublikationBruteForceMetric(target.value)) { 
            updateUIState(); 
            handleTabShown('publikation-tab'); 
        } 
    } 
}

function handlePublikationSectionChange(sectionId) { 
    if (state.setCurrentPublikationSection(sectionId)) { 
        updateUIState(); 
        handleTabShown('publikation-tab'); 
        const contentArea = document.getElementById('publikation-content-area'); 
        if(contentArea) contentArea.scrollTop = 0; 
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
    const workerAvailable = bruteForceManager.init(bfCallbacks);
    ui_helpers.updateBruteForceUI('idle', {}, workerAvailable, state.getCurrentKollektiv());
}

function handleStartBruteForce() {
    if (bruteForceManager.isRunning() || !bruteForceManager.isWorkerAvailable()) return;
    const lang = state.getCurrentPublikationLang() || 'de';
    const metric = document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
    const currentKollektiv = state.getCurrentKollektiv();
    const dataForWorker = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv).map(p => ({ nr: p.nr, n: p.n, lymphknoten_t2: p.lymphknoten_t2 }));

    if (dataForWorker.length === 0) {
        const noDataMsg = lang === 'de' ? "Keine Daten für Optimierung im aktuellen Kollektiv." : "No data for optimization in the current cohort.";
        ui_helpers.showToast(noDataMsg, "warning");
        ui_helpers.updateBruteForceUI('idle', {}, bruteForceManager.isWorkerAvailable(), currentKollektiv);
        return;
    }
    ui_helpers.updateBruteForceUI('start', { metric: metric, kollektiv: currentKollektiv }, true, currentKollektiv);
    bruteForceManager.startAnalysis(dataForWorker, metric, currentKollektiv);
    updateUIState(); // Reflects the running state in global UI if needed
}

function handleCancelBruteForce() {
    if (!bruteForceManager.isRunning() || !bruteForceManager.isWorkerAvailable()) return;
    bruteForceManager.cancelAnalysis();
}

function handleBruteForceStarted(payload) {
    const currentKollektiv = state.getCurrentKollektiv();
    const lang = state.getCurrentPublikationLang() || 'de';
    const metricValue = document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
    const metricLabel = PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === metricValue)?.[lang === 'de' ? 'label' : 'label'] || metricValue;

    ui_helpers.updateBruteForceUI('started', { ...payload, metric: metricLabel }, true, currentKollektiv);
}

function handleBruteForceProgress(payload) {
    const currentKollektiv = state.getCurrentKollektiv();
    const lang = state.getCurrentPublikationLang() || 'de';
    const metricValue = payload?.metric || document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
    const metricLabel = PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === metricValue)?.[lang === 'de' ? 'label' : 'label'] || metricValue;
    ui_helpers.updateBruteForceUI('progress', {...payload, metric: metricLabel}, true, currentKollektiv);
}

function handleBruteForceResult(payload) {
    const currentKollektiv = state.getCurrentKollektiv();
    const lang = state.getCurrentPublikationLang() || 'de';
    ui_helpers.updateBruteForceUI('result', payload, true, currentKollektiv);
    if (payload?.results?.length > 0) {
        const modalBody = document.querySelector('#brute-force-modal .modal-body');
        if (modalBody) {
            modalBody.innerHTML = uiComponents.createBruteForceModalContent(payload.results, payload.metric, payload.kollektiv, payload.duration, payload.totalTested); // createBruteForceModalContent uses lang from state
            ui_helpers.initializeTooltips(modalBody);
        }
        const successMsg = lang === 'de' ? 'Optimierung abgeschlossen.' : 'Optimization complete.';
        ui_helpers.showToast(successMsg, 'success');
        if (state.getActiveTabId() === 'publikation-tab') {
            // Re-initialize publication data as BF results might have changed
            publikationTabLogic.initializeData(localRawData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), bruteForceManager.getAllResults());
            handleTabShown('publikation-tab'); // Re-render the pub tab with new BF data
        }
    } else {
        const noResultsMsg = lang === 'de' ? 'Optimierung ohne valide Ergebnisse.' : 'Optimization finished with no valid results.';
        ui_helpers.showToast(noResultsMsg, 'warning');
    }
    updateUIState();
}

function handleBruteForceCancelled(payload) {
    const currentKollektiv = state.getCurrentKollektiv();
    const lang = state.getCurrentPublikationLang() || 'de';
    ui_helpers.updateBruteForceUI('cancelled', {}, true, currentKollektiv);
    const cancelledMsg = lang === 'de' ? 'Optimierung abgebrochen.' : 'Optimization cancelled.';
    ui_helpers.showToast(cancelledMsg, 'warning');
    updateUIState();
}

function handleBruteForceError(payload) {
    const currentKollektiv = state.getCurrentKollektiv();
    const lang = state.getCurrentPublikationLang() || 'de';
    const errorMsg = (lang === 'de' ? `Optimierungsfehler: ${payload?.message || 'Unbekannt'}` : `Optimization error: ${payload?.message || 'Unknown'}`);
    ui_helpers.showToast(errorMsg, 'danger');
    ui_helpers.updateBruteForceUI('error', payload, bruteForceManager.isWorkerAvailable(), currentKollektiv);
    updateUIState();
}

document.addEventListener('DOMContentLoaded', initializeApp);
