let processedData = [];
let currentData = [];
let bruteForceWorker = null;
let isBruteForceRunning = false;
let lastBruteForceResults = null; // Stores results per kollektiv: { kollektivId: payloadFromWorker, ... }
let localRawData = typeof patientDataRaw !== 'undefined' ? patientDataRaw : [];

const debouncedUpdateSizeInput = debounce(handleT2SizeInputChange, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);
const debouncedUpdateSizeRange = debounce(handleT2SizeRangeChange, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);

function initializeApp() {
    const requiredLibs = {
        'bootstrap': typeof bootstrap !== 'undefined' && bootstrap.Toast && bootstrap.Tab && bootstrap.Modal && bootstrap.Collapse,
        'd3': typeof d3 !== 'undefined',
        'tippy': typeof tippy !== 'undefined',
        'Papa': typeof Papa !== 'undefined',
        'JSZip': typeof JSZip !== 'undefined'
    };
    const missingLibs = Object.keys(requiredLibs).filter(lib => !requiredLibs[lib]);
    const langKeyInitial = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';

    if (missingLibs.length > 0) {
        const errorMsg = langKeyInitial === 'de' ? `Fehler: Bibliotheken (${missingLibs.join(', ')}) konnten nicht vollständig geladen werden.` : `Error: Libraries (${missingLibs.join(', ')}) could not be fully loaded.`;
        ui_helpers.updateElementHTML('app-container', `<div class="alert alert-danger m-5">${errorMsg}</div>`);
        return;
    }
     if (!document.getElementById('app-container')) {
         console.error("App container not found. Aborting initialization.");
         return;
     }

    try {
        if (typeof state === 'undefined' || typeof t2CriteriaManager === 'undefined' || typeof dataProcessor === 'undefined' ||
            typeof viewRenderer === 'undefined' || typeof ui_helpers === 'undefined' || typeof exportService === 'undefined' ||
            typeof dataTabLogic === 'undefined' || typeof auswertungTabLogic === 'undefined' ||
            typeof statistikTabLogic === 'undefined' || typeof praesentationTabLogic === 'undefined' ||
            typeof publikationTabLogic === 'undefined' || typeof publicationRenderer === 'undefined' ||
            typeof publicationTextGenerator === 'undefined' || typeof studyT2CriteriaManager === 'undefined' ||
            typeof tableRenderer === 'undefined' || typeof chartRenderer === 'undefined' || typeof uiComponents === 'undefined'
        ) {
             const moduleErrorMsg = langKeyInitial === 'de' ? "Ein oder mehrere Kernmodule sind nicht verfügbar. Überprüfen Sie die Skript-Ladereihenfolge und Dateipfade." : "One or more core modules are not available. Check script loading order and file paths.";
             throw new Error(moduleErrorMsg);
        }

        state.init();
        t2CriteriaManager.initialize();

        processedData = dataProcessor.processPatientData(localRawData);

        if (processedData.length === 0) {
            const noDataWarn = langKeyInitial === 'de' ? "Warnung: Keine validen Patientendaten geladen." : "Warning: No valid patient data loaded.";
            ui_helpers.showToast(noDataWarn, "warning");
        }

        let initialBruteForceResultsForPubTab = null;
        if (lastBruteForceResults) {
            const firstKey = Object.keys(lastBruteForceResults)[0];
            if (lastBruteForceResults.kollektiv && typeof lastBruteForceResults.results === 'object' && typeof lastBruteForceResults.bestResult === 'object') {
                 initialBruteForceResultsForPubTab = { [lastBruteForceResults.kollektiv]: lastBruteForceResults };
            } else if (firstKey && typeof lastBruteForceResults[firstKey] === 'object' && lastBruteForceResults[firstKey].kollektiv) {
                 initialBruteForceResultsForPubTab = lastBruteForceResults;
            }
        }

        publikationTabLogic.initializeData(
            processedData,
            t2CriteriaManager.getAppliedCriteria(),
            t2CriteriaManager.getAppliedLogic(),
            initialBruteForceResultsForPubTab
        );

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

        const initToastMsg = langKeyInitial === 'de' ? 'Anwendung initialisiert.' : 'Application initialized.';
        ui_helpers.showToast(initToastMsg, 'success', 2500);

    } catch (error) {
         const initErrorMsg = langKeyInitial === 'de' ? `Initialisierungsfehler: ${error.message}. Stellen Sie sicher, dass alle Skripte korrekt geladen wurden und die Dateipfade in index.html aktuell sind.` : `Initialization error: ${error.message}. Ensure all scripts are loaded correctly and file paths in index.html are current.`;
         ui_helpers.updateElementHTML('app-container', `<div class="alert alert-danger m-5">${initErrorMsg}</div>`);
         console.error("Initialization Error:", error);
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
         currentData = [];
         const langKey = state.getCurrentPublikationLang() || 'de';
         const errorToastMsg = langKey === 'de' ? "Fehler bei der Datenaufbereitung." : "Error during data preparation.";
         ui_helpers.showToast(errorToastMsg, "danger");
         console.error("Error in filterAndPrepareData:", error);
    }
}

function updateUIState() {
    try {
        const currentKollektiv = state.getCurrentKollektiv();
        const headerStats = dataProcessor.calculateHeaderStats(currentData, currentKollektiv);
        const currentLang = state.getCurrentPublikationLang();

        ui_helpers.updateHeaderStatsUI(headerStats);
        ui_helpers.updateKollektivButtonsUI(currentKollektiv);
        ui_helpers.updateGlobalLanguageSwitcherUI(currentLang);
        ui_helpers.updateStatistikSelectorsUI(state.getCurrentStatsLayout(), state.getCurrentStatsKollektiv1(), state.getCurrentStatsKollektiv2());
        ui_helpers.updatePresentationViewSelectorUI(state.getCurrentPresentationView());

        if (state.getActiveTabId() === 'publikation-tab') {
            ui_helpers.updatePublikationUI(currentLang, state.getCurrentPublikationSection(), state.getCurrentPublikationBruteForceMetric());
        }
        ui_helpers.updateExportButtonStates(state.getActiveTabId(), !!lastBruteForceResults, processedData && processedData.length > 0);
    } catch (error) {
        console.error("Fehler in updateUIState:", error);
        const langKey = state.getCurrentPublikationLang() || 'de';
        ui_helpers.showToast(langKey === 'de' ? 'Fehler bei der UI-Aktualisierung.' : 'Error during UI update.', 'danger');
    }
}

function setupEventListeners() {
    document.body.addEventListener('click', handleBodyClickDelegation);

    const mainTabEl = document.getElementById('mainTab');
    if (mainTabEl) { mainTabEl.addEventListener('shown.bs.tab', handleTabShownEvent); }

    const globalLangSwitch = document.getElementById('global-sprache-switch');
    if (globalLangSwitch) {
        globalLangSwitch.addEventListener('change', handleGlobalLanguageChange);
    }

    document.body.addEventListener('input', (event) => {
        if (event.target.id === 'range-size' && event.target.closest('#auswertung-tab-pane')) {
            debouncedUpdateSizeRange(event.target.value);
        }
    });

    document.body.addEventListener('change', (event) => {
        const target = event.target;
        if (target.id === 'global-sprache-switch') return;

        if (target.closest('#auswertung-tab-pane')) {
             if (target.id === 'input-size') { debouncedUpdateSizeInput(target.value); }
             else if (target.matches('.criteria-checkbox')) { handleT2CheckboxChange(target); }
             else if (target.id === 't2-logic-switch') { handleT2LogicChange(target); }
             else if (target.id === 'brute-force-metric') { /* No immediate action, used on start */ }
        } else if (target.closest('#statistik-tab-pane')) { handleStatistikChange(event); }
        else if (target.closest('#praesentation-tab-pane')) { handlePresentationChangeDelegation(event); }
        else if (target.closest('#publikation-tab-pane')) { handlePublikationTabSpecificChange(event); }
    });
}

function handleGlobalLanguageChange(event) {
    const newLang = event.target.checked ? 'en' : 'de';
    if (state.setCurrentPublikationLang(newLang)) {
        updateUIState();
        handleTabShown(state.getActiveTabId());
        const langKey = newLang;
        const toastMsg = langKey === 'de' ? 'Sprache auf Deutsch umgestellt.' : 'Language switched to English.';
        ui_helpers.showToast(toastMsg, 'info');
    }
}

function handlePublikationTabSpecificChange(event) {
    const target = event.target;
    if (target.id === 'publikation-bf-metric-select') {
        if(state.setCurrentPublikationBruteForceMetric(target.value)) {
            updateUIState(); // Update metric display if any
            // Re-initialize publication data with the new metric context if needed
            // This ensures that texts or tables depending on a specific BF result for THIS metric are updated
            publikationTabLogic.initializeData(processedData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), lastBruteForceResults);
            handleTabShown('publikation-tab'); // Re-render the publication tab
        }
    }
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
    const publikationNavLink = target.closest('#publikation-sections-nav .publikation-section-link:not(.disabled)');

    const clickableRowParent = target.closest('tr.clickable-row[data-bs-target]');
    if (clickableRowParent && target.closest('a, button, input, select, .btn-close, [data-bs-toggle="modal"], .table-download-png-btn, .chart-download-btn')) {
        event.stopPropagation(); // Prevent row collapse if a button within the row is clicked
        return;
    }

    if (kollektivButton && kollektivButton.dataset.kollektiv) { handleKollektivChange(kollektivButton.dataset.kollektiv); return; }
    if (closestHeader) { handleSortClick(closestHeader, closestSubHeader); return; }
    if (chartDownloadButton) { handleSingleChartDownload(chartDownloadButton); return; }
    if (tableDownloadButton) { handleSingleTableDownload(tableDownloadButton); return; }
    if (toggleAllDatenBtn) { ui_helpers.toggleAllDetails('daten-table-body', 'daten-toggle-details'); return; }
    if (toggleAllAuswBtn) { ui_helpers.toggleAllDetails('auswertung-table-body', 'auswertung-toggle-details'); return; }
    if (modalExportBtn && !modalExportBtn.disabled) {
        const langKey = state.getCurrentPublikationLang() || 'de';
        const currentKollektivForModalExport = state.getCurrentKollektiv();
        const relevantBFResults = lastBruteForceResults?.[currentKollektivForModalExport];
        if(relevantBFResults && relevantBFResults.results && relevantBFResults.results.length > 0) {
            exportService.exportBruteForceReport(relevantBFResults, currentKollektivForModalExport);
        } else {
             const noResultsToast = langKey === 'de' ? 'Keine Brute-Force Ergebnisse für aktuelles Kollektiv zum Export.' : 'No Brute-Force results for current cohort to export.';
             ui_helpers.showToast(noResultsToast, 'warning');
        }
        return;
    }
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
    const langKey = state.getCurrentPublikationLang() || 'de';
    if (typeof viewRenderer === 'undefined') {
        const errorMsg = langKey === 'de' ? `Fehler: UI Renderer nicht bereit für Tab '${tabId}'.` : `Error: UI Renderer not ready for tab '${tabId}'.`;
        ui_helpers.showToast(errorMsg, 'danger');
        const paneId = tabId.replace('-tab', '-tab-pane');
        const errorHTML = langKey === 'de' ? 'Interner Fehler: UI Renderer konnte nicht geladen werden.' : 'Internal Error: UI Renderer could not be loaded.';
        ui_helpers.updateElementHTML(paneId, `<div class="alert alert-danger m-3">${errorHTML}</div>`);
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
        case 'publikation-tab':
            let bfResultsForPubTab = null;
            if (lastBruteForceResults) {
                const firstKey = Object.keys(lastBruteForceResults)[0];
                if (lastBruteForceResults.kollektiv && typeof lastBruteForceResults.results === 'object') {
                     bfResultsForPubTab = { [lastBruteForceResults.kollektiv]: lastBruteForceResults };
                } else if (firstKey && typeof lastBruteForceResults[firstKey] === 'object' && lastBruteForceResults[firstKey].kollektiv) {
                    bfResultsForPubTab = lastBruteForceResults;
                }
            }
            publikationTabLogic.initializeData(
                processedData,
                appliedCriteria,
                appliedLogic,
                bfResultsForPubTab
            );
            viewRenderer.renderPublikationTab(state.getCurrentPublikationLang(), state.getCurrentPublikationSection(), currentKollektiv, processedData, bfResultsForPubTab);
            break;
        case 'export-tab': viewRenderer.renderExportTab(currentKollektiv); break;
        default:
            const paneId = tabId.replace('-tab', '-tab-pane');
            const notImplMsg = langKey === 'de' ? "Inhalt für Tab" : "Content for tab";
            const notImplMsg2 = langKey === 'de' ? "nicht implementiert." : "not implemented.";
            ui_helpers.updateElementHTML(paneId, `<div class="alert alert-warning m-3">${notImplMsg} '${tabId}' ${notImplMsg2}</div>`);
    }
    updateUIState();
}

function handleKollektivChange(newKollektiv) { if (state.setCurrentKollektiv(newKollektiv)) { filterAndPrepareData(); updateUIState(); handleTabShown(state.getActiveTabId()); const langKey = state.getCurrentPublikationLang() || 'de'; ui_helpers.showToast(`${langKey === 'de' ? "Kollektiv" : "Cohort"} '${getKollektivDisplayName(newKollektiv, langKey)}' ${langKey === 'de' ? "ausgewählt." : "selected."}`, 'info'); return true; } return false; }
function handleSortClick(sortHeader, sortSubHeader) { const key = sortHeader?.dataset.sortKey; if (!key) return; const subKey = sortSubHeader?.dataset.subKey || null; const tableBody = sortHeader.closest('table')?.querySelector('tbody'); let tableId = null; if (tableBody?.id === 'daten-table-body') tableId = 'daten'; else if (tableBody?.id === 'auswertung-table-body') tableId = 'auswertung'; if (tableId) handleSort(tableId, key, subKey); }
function handleSort(tableId, key, subKey = null) { let sortStateUpdated = false; if(tableId === 'daten') sortStateUpdated = state.updateDatenTableSortDirection(key, subKey); else if (tableId === 'auswertung') sortStateUpdated = state.updateAuswertungTableSortDirection(key, subKey); if(sortStateUpdated) { const sortState = (tableId === 'daten') ? state.getDatenTableSort() : state.getAuswertungTableSort(); filterAndPrepareData(); if (tableId === 'daten' && state.getActiveTabId() === 'daten-tab') viewRenderer.renderDatenTab(currentData, sortState); else if (tableId === 'auswertung' && state.getActiveTabId() === 'auswertung-tab') { viewRenderer.renderAuswertungTab(currentData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), sortState, state.getCurrentKollektiv(), !!bruteForceWorker ); } } }
function handleT2CheckboxChange(checkbox) { const key = checkbox.value; const isActive = checkbox.checked; if(t2CriteriaManager.toggleCriterionActive(key, isActive)){ ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleT2LogicChange(logicSwitch) { const newLogic = logicSwitch.checked ? 'ODER' : 'UND'; if(t2CriteriaManager.updateLogic(newLogic)) { ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleT2CriteriaButtonClick(button) { const criterionKey = button.dataset.criterion; const value = button.dataset.value; let changed = false; if (!t2CriteriaManager.getCurrentCriteria()[criterionKey]?.active) changed = t2CriteriaManager.toggleCriterionActive(criterionKey, true) || changed; changed = t2CriteriaManager.updateCriterionValue(criterionKey, value) || changed; if (changed) { ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleT2SizeInputChange(value) { const langKey = state.getCurrentPublikationLang() || 'de'; if (t2CriteriaManager.updateCriterionThreshold(value)) { if (!t2CriteriaManager.getCurrentCriteria().size?.active) t2CriteriaManager.toggleCriterionActive('size', true); ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } else { const current = t2CriteriaManager.getCurrentCriteria().size?.threshold; const input = document.getElementById('input-size'); if(input && current !== undefined) input.value = formatNumber(current, 1, '', true, langKey); ui_helpers.showToast(langKey === 'de' ? "Ungültiger Wert für Größe." : "Invalid value for size.", "warning"); } }
function handleT2SizeRangeChange(value) { if (t2CriteriaManager.updateCriterionThreshold(value)) { if (!t2CriteriaManager.getCurrentCriteria().size?.active) t2CriteriaManager.toggleCriterionActive('size', true); ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); } }
function handleResetCriteria() { t2CriteriaManager.resetCriteria(); ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic()); ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved()); const langKey = state.getCurrentPublikationLang() || 'de'; ui_helpers.showToast(langKey === 'de' ? 'T2 Kriterien zurückgesetzt (nicht angewendet).' : 'T2 criteria reset (not applied).', 'info'); }
function handleApplyCriteria() { t2CriteriaManager.applyCriteria(); filterAndPrepareData(); ui_helpers.markCriteriaSavedIndicator(false); updateUIState(); handleTabShown(state.getActiveTabId()); publikationTabLogic.initializeData(processedData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), lastBruteForceResults); const langKey = state.getCurrentPublikationLang() || 'de'; ui_helpers.showToast(langKey === 'de' ? 'T2-Kriterien angewendet & gespeichert.' : 'T2 criteria applied & saved.', 'success'); }

function handleApplyBestBfCriteria() {
    const langKey = state.getCurrentPublikationLang() || 'de';
    const currentActiveKollektiv = state.getCurrentKollektiv();
    const relevantBFPayload = lastBruteForceResults?.[currentActiveKollektiv];

    if (!relevantBFPayload?.bestResult?.criteria) {
        ui_helpers.showToast(langKey==='de'?'Keine gültigen Brute-Force-Ergebnisse für das aktuelle Kollektiv zum Anwenden.':'No valid brute-force results for the current cohort to apply.', 'warning');
        return;
    }
    const best = relevantBFPayload.bestResult;
    Object.keys(best.criteria).forEach(key => {
        if(key === 'logic') return; // Logic is handled separately
        const criterion = best.criteria[key];
        t2CriteriaManager.toggleCriterionActive(key, criterion.active);
        if(criterion.active) {
            if(key === 'size') {
                if (criterion.threshold !== undefined) {
                    t2CriteriaManager.updateCriterionThreshold(criterion.threshold);
                }
            } else {
                if (criterion.value !== undefined) {
                    t2CriteriaManager.updateCriterionValue(key, criterion.value);
                }
            }
        }
    });
    if (best.logic) {
      t2CriteriaManager.updateLogic(best.logic);
    }
    ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
    handleApplyCriteria();
    ui_helpers.showToast(`${langKey === 'de' ? "Beste Brute-Force Kriterien für Kollektiv" : "Best brute-force criteria for cohort"} "${getKollektivDisplayName(currentActiveKollektiv, langKey)}" ${langKey === 'de' ? "angewendet & gespeichert." : "applied & saved."}`, 'success');
}

function handleStatsLayoutToggle(button) { setTimeout(() => { const isPressed = button.classList.contains('active'); const newLayout = isPressed ? 'vergleich' : 'einzel'; if (state.setCurrentStatsLayout(newLayout)) { updateUIState(); if (state.getActiveTabId() === 'statistik-tab') handleTabShown('statistik-tab'); } }, 50); }
function handleStatistikChange(event) { const target = event.target; let needsRender = false; if (target.id === 'statistik-kollektiv-select-1') needsRender = state.setCurrentStatsKollektiv1(target.value); else if (target.id === 'statistik-kollektiv-select-2') needsRender = state.setCurrentStatsKollektiv2(target.value); if(needsRender && state.getCurrentStatsLayout() === 'vergleich' && state.getActiveTabId() === 'statistik-tab') handleTabShown('statistik-tab'); }
function handlePresentationChangeDelegation(event) { const viewRadio = event.target.closest('input[name="praesentationAnsicht"]'); const studySelect = event.target.closest('#praes-study-select'); if(viewRadio) handlePresentationViewChange(viewRadio.value); else if (studySelect) handlePresentationStudySelectChange(studySelect.value); }
function handlePresentationViewChange(view) { if (state.setCurrentPresentationView(view)) { updateUIState(); if (state.getActiveTabId() === 'praesentation-tab') handleTabShown('praesentation-tab'); } }
function handlePresentationStudySelectChange(studyId) { if (studyId === "" || state.getCurrentPresentationStudyId() === studyId) return; const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId); let kollektivChanged = false; if (studySet?.applicableKollektiv && state.getCurrentKollektiv() !== studySet.applicableKollektiv && studySet.applicableKollektiv !== 'Gesamt') { kollektivChanged = handleKollektivChange(studySet.applicableKollektiv); } const studyIdChanged = state.setCurrentPresentationStudyId(studyId); if (studyIdChanged || kollektivChanged) { updateUIState(); if (state.getActiveTabId() === 'praesentation-tab') handleTabShown('praesentation-tab'); } }
function handlePresentationDownloadClick(button) { const actionId = button.id; const currentKollektiv = state.getCurrentKollektiv(); let presentationData = null; const filteredData = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv); const langKey = state.getCurrentPublikationLang() || 'de'; if (filteredData?.length > 0) { const statsAS = statisticsService.calculateDiagnosticPerformance(filteredData, 'as', 'n'); const allStatsForPub = statisticsService.calculateAllStatsForPublication(processedData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), lastBruteForceResults); const statsGesamt = allStatsForPub?.Gesamt?.gueteAS; const statsDirektOP = allStatsForPub?.['direkt OP']?.gueteAS; const statsNRCT = allStatsForPub?.nRCT?.gueteAS; presentationData = { statsAS, kollektiv: currentKollektiv, patientCount: filteredData.length, statsGesamt, statsDirektOP, statsNRCT, statsCurrentKollektiv: statsAS }; if (state.getCurrentPresentationView() === 'as-vs-t2') { const studyId = state.getCurrentPresentationStudyId(); let studySet = null, evaluatedDataT2 = null; const isApplied = studyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID; const appliedCriteria = t2CriteriaManager.getAppliedCriteria(); const appliedLogic = t2CriteriaManager.getAppliedLogic(); const appliedCriteriaDisplayNameBase = UI_TEXTS.kollektivDisplayNames.applied_criteria; const appliedCriteriaDisplayName = (typeof appliedCriteriaDisplayNameBase === 'object' ? appliedCriteriaDisplayNameBase[langKey] : appliedCriteriaDisplayNameBase?.[langKey]) || appliedCriteriaDisplayNameBase?.['de'] || APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME; const appliedCriteriaShortName = langKey === 'de' ? 'Angewandt' : 'Applied'; if(isApplied) { studySet = { criteria: appliedCriteria, logic: appliedLogic, id: studyId, name: appliedCriteriaDisplayName, displayShortName: appliedCriteriaShortName, studyInfo: { reference: (langKey === 'de' ? "Benutzerdefiniert" : "User-defined"), patientCohort: `${langKey === 'de' ? "Aktuell:" : "Current:"} ${getKollektivDisplayName(currentKollektiv, langKey)} (N=${presentationData.patientCount})`, investigationType: "N/A", focus: (langKey === 'de' ? "Benutzereinstellung" : "User Setting"), keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false, langKey) || (langKey === 'de' ? "Keine" : "None") } }; evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), appliedCriteria, appliedLogic); } else { studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId); if(studySet) evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(filteredData), studySet); } if (studySet && evaluatedDataT2) { presentationData.statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n'); const dataForComparison = cloneDeep(evaluatedDataT2); dataForComparison.forEach((p, i) => { if (filteredData[i]) p.as = filteredData[i].as; }); presentationData.vergleich = statisticsService.compareDiagnosticMethods(dataForComparison, 'as', 't2', 'n'); presentationData.comparisonCriteriaSet = studySet; const studySetNameBase = UI_TEXTS.literatureSetNames?.[studySet.id]; const studySetName = (typeof studySetNameBase === 'object' ? studySetNameBase[langKey] : studySetNameBase?.[langKey]) || studySetNameBase?.['de'] || studySet.name; presentationData.t2CriteriaLabelShort = studySet.displayShortName || (langKey==='de'?'T2 Lit.':'T2 Lit.'); presentationData.t2CriteriaLabelFull = `${studySetName}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, false, langKey)}`; } } } exportService.exportPraesentationData(actionId, presentationData, currentKollektiv); }
function handleExportAction(exportType) { filterAndPrepareData(); const dataForExport = currentData; const currentKollektiv = state.getCurrentKollektiv(); const appliedCriteria = t2CriteriaManager.getAppliedCriteria(); const appliedLogic = t2CriteriaManager.getAppliedLogic(); const canExport = Array.isArray(processedData) && processedData.length > 0; const langKey = state.getCurrentPublikationLang() || 'de'; if (!canExport && !['bruteforce-txt', 'all-zip', 'png-zip', 'svg-zip', 'csv-zip', 'md-zip', 'xlsx-zip'].includes(exportType) && exportType !== 'comprehensive-report-html') { ui_helpers.showToast(langKey==='de'?"Keine Daten für diesen Export verfügbar.":"No data available for this export.", "warning"); return; } if (exportType === 'bruteforce-txt' && (!lastBruteForceResults || !lastBruteForceResults[currentKollektiv])) { ui_helpers.showToast(langKey==='de'?"Keine Brute-Force Ergebnisse für das aktuelle Kollektiv für Export.":"No brute-force results for the current cohort to export.", "warning"); return; } if (['all-zip', 'png-zip', 'svg-zip', 'csv-zip', 'md-zip', 'xlsx-zip'].includes(exportType) && !canExport && !lastBruteForceResults && exportType !== 'md-zip' ) { ui_helpers.showToast(langKey==='de'?"Keine Daten/Ergebnisse für ZIP-Export.":"No data/results for ZIP export.", "warning"); return; } if (exportType === 'comprehensive-report-html' && !canExport) { ui_helpers.showToast(langKey==='de'?"Keine Daten für HTML-Report.":"No data for HTML report.", "warning"); return; } const relevantBfResults = lastBruteForceResults ? lastBruteForceResults[currentKollektiv] : null; switch (exportType) { case 'statistik-csv': exportService.exportStatistikCSV(processedData, currentKollektiv, appliedCriteria, appliedLogic); break; case 'bruteforce-txt': exportService.exportBruteForceReport(relevantBfResults, currentKollektiv); break; case 'deskriptiv-md': { const stats = statisticsService.calculateAllStatsForPublication(processedData, appliedCriteria, appliedLogic, lastBruteForceResults)[currentKollektiv]; exportService.exportTableMarkdown(stats?.deskriptiv, 'deskriptiv', currentKollektiv); break; } case 'daten-md': exportService.exportTableMarkdown(dataForExport, 'daten', currentKollektiv); break; case 'auswertung-md': exportService.exportTableMarkdown(dataForExport, 'auswertung', currentKollektiv, appliedCriteria, appliedLogic); break; case 'filtered-data-csv': exportService.exportFilteredDataCSV(dataForExport, currentKollektiv); break; case 'comprehensive-report-html': exportService.exportComprehensiveReportHTML(processedData, relevantBfResults, currentKollektiv, appliedCriteria, appliedLogic); break; case 'charts-png': exportService.exportChartsZip('#app-container', 'PNG_ZIP', currentKollektiv, 'png'); break; case 'charts-svg': exportService.exportChartsZip('#app-container', 'SVG_ZIP', currentKollektiv, 'svg'); break; case 'all-zip': case 'csv-zip': case 'md-zip': case 'xlsx-zip': exportService.exportCategoryZip(exportType, processedData, lastBruteForceResults, currentKollektiv, appliedCriteria, appliedLogic); break; default: ui_helpers.showToast(`${langKey==='de'?"Export-Typ":"Export type"} '${exportType}' ${langKey==='de'?"nicht implementiert.":"not implemented."}`, 'warning'); break; } }
function handleSingleChartDownload(button) { const chartId = button.dataset.chartId; const format = button.dataset.format; const chartName = button.dataset.chartName || chartId.replace(/^chart-/, '').replace(/-container$/, '').replace(/-content$/, '').replace(/-[0-9]+$/, ''); const langKey = state.getCurrentPublikationLang() || 'de'; if (chartId && (format === 'png' || format === 'svg')) exportService.exportSingleChart(chartId, format, state.getCurrentKollektiv(), {chartName: chartName}); else ui_helpers.showToast(langKey==='de'?"Fehler beim Chart-Download.":"Error during chart download.", "warning"); }
function handleSingleTableDownload(button) { if (!button) return; const tableId = button.dataset.tableId; const tableName = button.dataset.tableName || 'Tabelle'; const langKey = state.getCurrentPublikationLang() || 'de'; if (tableId && APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT) exportService.exportTablePNG(tableId, state.getCurrentKollektiv(), 'TABLE_PNG_EXPORT', tableName); else if (!tableId) ui_helpers.showToast(`${langKey==='de'?"Fehler: Tabelle":"Error: Table"} '${tableName}' ${langKey==='de'?"nicht gefunden.":"not found."}`, "danger"); }
function handlePublikationSectionChange(sectionId) { if (state.setCurrentPublikationSection(sectionId)) { updateUIState(); handleTabShown('publikation-tab'); const contentArea = document.getElementById('publikation-content-area'); if(contentArea) contentArea.scrollTop = 0; } }
function initializeBruteForceWorker() { const langKey = state.getCurrentPublikationLang() || 'de'; if (!window.Worker) { ui_helpers.showToast(langKey==='de'?"Web Worker nicht unterstützt.":"Web Worker not supported.", "danger"); ui_helpers.updateBruteForceUI('error', {message: langKey==='de'?'Web Worker nicht unterstützt':'Web Worker not supported'}, false, state.getCurrentKollektiv()); return; } try { if(bruteForceWorker) bruteForceWorker.terminate(); bruteForceWorker = new Worker(APP_CONFIG.PATHS.BRUTE_FORCE_WORKER); bruteForceWorker.onmessage = handleBruteForceMessage; bruteForceWorker.onerror = handleBruteForceError; bruteForceWorker.onmessageerror = (e) => { console.error("Brute force worker onmessageerror:", e);}; ui_helpers.updateBruteForceUI('idle', {}, true, state.getCurrentKollektiv()); } catch (e) { console.error("Brute force worker initialization error:", e); bruteForceWorker = null; ui_helpers.updateBruteForceUI('error', {message: langKey==='de'?'Worker init fehlgeschlagen':'Worker init failed'}, false, state.getCurrentKollektiv()); } }
function handleStartBruteForce() { const langKey = state.getCurrentPublikationLang() || 'de'; if (isBruteForceRunning || !bruteForceWorker) return; isBruteForceRunning = true; const metric = document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC; const currentKollektiv = state.getCurrentKollektiv(); if (lastBruteForceResults && lastBruteForceResults[currentKollektiv] && lastBruteForceResults[currentKollektiv].metric === metric && lastBruteForceResults[currentKollektiv].bestResult) {  } const dataForWorker = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv).map(p => ({ nr: p.nr, n: p.n, lymphknoten_t2: p.lymphknoten_t2 })); if (dataForWorker.length === 0) { ui_helpers.showToast(langKey==='de'?"Keine Daten für Optimierung.":"No data for optimization.", "warning"); isBruteForceRunning = false; ui_helpers.updateBruteForceUI('idle', {}, !!bruteForceWorker, currentKollektiv); return; } ui_helpers.updateBruteForceUI('start', { metric: metric, kollektiv: currentKollektiv }, true, currentKollektiv); bruteForceWorker.postMessage({ action: 'start', payload: { data: dataForWorker, metric: metric, kollektiv: currentKollektiv, t2SizeRange: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE } }); updateUIState(); }
function handleCancelBruteForce() { const langKey = state.getCurrentPublikationLang() || 'de'; if (!isBruteForceRunning || !bruteForceWorker) return; bruteForceWorker.postMessage({ action: 'cancel' }); isBruteForceRunning = false; ui_helpers.updateBruteForceUI('cancelled', {}, true, state.getCurrentKollektiv()); ui_helpers.showToast(langKey==='de'?'Optimierung abgebrochen.':'Optimization cancelled.', 'warning'); updateUIState(); }
function handleBruteForceMessage(event) { if (!event || !event.data) return; const { type, payload } = event.data; if (!isBruteForceRunning && type !== 'cancelled' && type !== 'error' && type !== 'result') return; const currentKollektivForUIMessage = payload?.kollektiv || state.getCurrentKollektiv(); const currentMetricForUIMessage = payload?.metric || (type === 'progress' ? payload?.currentBest?.metric : null) || document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC; const langKey = state.getCurrentPublikationLang() || 'de'; switch (type) { case 'started': ui_helpers.updateBruteForceUI('started', { ...payload, metric: currentMetricForUIMessage }, true, currentKollektivForUIMessage); break; case 'progress': ui_helpers.updateBruteForceUI('progress', { ...payload, metric: currentMetricForUIMessage }, true, currentKollektivForUIMessage); break; case 'result': isBruteForceRunning = false; if (!lastBruteForceResults) lastBruteForceResults = {}; lastBruteForceResults[payload.kollektiv] = payload; ui_helpers.updateBruteForceUI('result', payload, true, payload.kollektiv); if(payload?.results?.length > 0){ const modalBody = document.querySelector('#brute-force-modal .modal-body'); if (modalBody) { modalBody.innerHTML = uiComponents.createBruteForceModalContent(payload.results, payload.metric, payload.kollektiv, payload.duration, payload.totalTested); ui_helpers.initializeTooltips(modalBody); } ui_helpers.showToast(langKey==='de'?'Optimierung abgeschlossen.':'Optimization completed.', 'success'); if (state.getActiveTabId() === 'publikation-tab' || state.getActiveTabId() === 'auswertung-tab' || state.getActiveTabId() === 'statistik-tab' || state.getActiveTabId() === 'praesentation-tab' ) { publikationTabLogic.initializeData(processedData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), lastBruteForceResults); if(state.getActiveTabId() === 'publikation-tab') handleTabShown('publikation-tab'); } } else { ui_helpers.showToast(langKey==='de'?'Optimierung ohne valide Ergebnisse.':'Optimization with no valid results.', 'warning'); } updateUIState(); break; case 'cancelled': isBruteForceRunning = false; ui_helpers.updateBruteForceUI('cancelled', {}, true, currentKollektivForUIMessage); updateUIState(); break; case 'error': isBruteForceRunning = false; ui_helpers.showToast(`${langKey==='de'?'Optimierungsfehler:':'Optimization error:'} ${payload?.message || (langKey==='de'?'Unbekannt':'Unknown')}`, 'danger'); ui_helpers.updateBruteForceUI('error', payload, true, currentKollektivForUIMessage); updateUIState(); break; default: console.warn("Unbekannte Nachricht vom BruteForceWorker:", event.data); } }
function handleBruteForceError(error) { const langKey = state.getCurrentPublikationLang() || 'de'; isBruteForceRunning = false; ui_helpers.showToast(langKey==='de'?"Fehler: Hintergrundverarbeitung gestoppt.":"Error: Background processing stopped.", "danger"); ui_helpers.updateBruteForceUI('error', { message: error.message || (langKey==='de'?'Worker Fehler':'Worker Error') }, false, state.getCurrentKollektiv()); bruteForceWorker = null; updateUIState(); }

document.addEventListener('DOMContentLoaded', initializeApp);
