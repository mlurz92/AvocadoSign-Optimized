const auswertungEventHandlers = (() => {
    let bruteForceManagerInstance = null;
    let currentCriteria = {};
    let currentLogic = APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;


    function _updateLocalCriteriaStateFromUI() {
        currentLogic = document.getElementById('t2-logic-switch')?.checked ? 'ODER' : 'UND';
        const newCriteria = {};
        t2CriteriaManager.criteriaKeys.forEach(key => {
            const checkbox = document.getElementById(`check-${key}`);
            newCriteria[key] = { active: checkbox?.checked || false };
            if (newCriteria[key].active) {
                if (key === 'size') {
                    newCriteria[key].threshold = parseFloat(document.getElementById('input-size')?.value) || getDefaultT2Criteria().size.threshold;
                    newCriteria[key].condition = '>=';
                } else {
                    const activeButton = document.querySelector(`.criteria-options-container button.t2-criteria-button[data-criterion="${key}"].active`);
                    newCriteria[key].value = activeButton?.dataset.value || (getDefaultT2Criteria()[key] ? getDefaultT2Criteria()[key].value : null);
                }
            } else { 
                 if (key === 'size') {
                    newCriteria[key].threshold = getDefaultT2Criteria().size.threshold;
                    newCriteria[key].condition = '>=';
                } else {
                    newCriteria[key].value = (getDefaultT2Criteria()[key] ? getDefaultT2Criteria()[key].value : null);
                }
            }
        });
        currentCriteria = newCriteria;
    }

    function _handleCriteriaInputChange() {
        _updateLocalCriteriaStateFromUI();
        if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.handleT2CriteriaChange === 'function') {
            mainAppInterface.handleT2CriteriaChange(currentCriteria, currentLogic);
        }
         ui_helpers.markCriteriaSavedIndicator(true); 
    }
    
    function _handleT2CriteriaButtonClick(event) {
        const button = event.currentTarget;
        const criterionKey = button.dataset.criterion;
        const value = button.dataset.value;
        const isActive = document.getElementById(`check-${criterionKey}`)?.checked;

        if (isActive && criterionKey && value) {
            document.querySelectorAll(`.t2-criteria-button[data-criterion="${criterionKey}"]`).forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            _handleCriteriaInputChange();
        }
    }


    function register(bfManager) {
        if (bfManager) {
            bruteForceManagerInstance = bfManager;
        } else {
            console.error("AuswertungEventHandlers: BruteForceManager Instanz nicht übergeben.");
        }

        const auswertungTabPane = document.getElementById('auswertung-tab-pane');
        if (!auswertungTabPane) {
            console.warn("AuswertungEventHandlers: Auswertung-Tab-Pane nicht gefunden. Handler nicht vollständig registriert.");
            return;
        }
        
        currentCriteria = t2CriteriaManager.getAppliedCriteria();
        currentLogic = t2CriteriaManager.getAppliedLogic();

        const debouncedCriteriaChange = debounce(_handleCriteriaInputChange, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);

        auswertungTabPane.removeEventListener('change', _handlePaneChange);
        auswertungTabPane.addEventListener('change', _handlePaneChange);
        
        auswertungTabPane.removeEventListener('click', _handlePaneClick);
        auswertungTabPane.addEventListener('click', _handlePaneClick);
        
        const tableHeader = auswertungTabPane.querySelector('#auswertung-table-header');
        if (tableHeader) {
            tableHeader.removeEventListener('click', _handleTableHeaderClick);
            tableHeader.addEventListener('click', _handleTableHeaderClick);
        } else {
            console.warn("AuswertungEventHandlers: Tabellenkopf 'auswertung-table-header' nicht gefunden.");
        }
        
        const tableBody = auswertungTabPane.querySelector('#auswertung-table-body');
        if(tableBody) {
            tableBody.removeEventListener('click', _handleTableBodyClick);
            tableBody.addEventListener('click', _handleTableBodyClick);
        } else {
            console.warn("AuswertungEventHandlers: Tabellenkörper 'auswertung-table-body' nicht gefunden.");
        }

        function _handlePaneChange(event) {
            const target = event.target;
            if (target.matches('.criteria-checkbox') || target.id === 't2-logic-switch') {
                _updateLocalCriteriaStateFromUI(); 
                ui_helpers.updateT2CriteriaControlsUI(currentCriteria, currentLogic);
                _handleCriteriaInputChange(); 
            } else if (target.matches('#range-size, #input-size')) {
                 if (document.getElementById('check-size')?.checked) {
                    const value = parseFloat(target.value);
                    const sizeInput = document.getElementById('input-size');
                    const sizeRange = document.getElementById('range-size');
                    const sizeValueDisplay = document.getElementById('value-size');
                    if (sizeInput && sizeRange && sizeValueDisplay) {
                        const clampedValue = clampNumber(value, parseFloat(sizeRange.min), parseFloat(sizeRange.max));
                        sizeInput.value = formatNumber(clampedValue, 1, '', true);
                        sizeRange.value = formatNumber(clampedValue, 1, '', true);
                        sizeValueDisplay.textContent = formatNumber(clampedValue, 1);
                    }
                    debouncedCriteriaChange();
                 }
            } else if (target.id === 'brute-force-metric') {
                if(typeof stateManager !== 'undefined') stateManager.setBruteForceMetric(target.value);
            }
        }

        function _handlePaneClick(event) {
            const target = event.target.closest('button');
            if (!target) return;

            if (target.matches('.t2-criteria-button')) {
                _handleT2CriteriaButtonClick({currentTarget: target});
            } else if (target.id === 'btn-reset-criteria') {
                if (confirm(UI_TEXTS.general.confirmResetCriteria || "Möchten Sie die T2-Kriterien auf die Standardwerte zurücksetzen? Ungespeicherte Änderungen gehen verloren.")) {
                    t2CriteriaManager.resetToDefaults();
                    _updateLocalCriteriaStateFromUI(); 
                    ui_helpers.updateT2CriteriaControlsUI(currentCriteria, currentLogic);
                    _handleCriteriaInputChange(); 
                    ui_helpers.showToast("T2-Kriterien auf Standard zurückgesetzt.", "info");
                }
            } else if (target.id === 'btn-apply-criteria') {
                t2CriteriaManager.setCriteria(currentCriteria, currentLogic);
                t2CriteriaManager.saveAll();
                ui_helpers.markCriteriaSavedIndicator(false);
                if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshAllTabs === 'function') {
                    mainAppInterface.refreshAllTabs(true);
                }
                ui_helpers.showToast("T2-Kriterien angewendet und gespeichert.", "success");
            } else if (target.id === 'btn-start-brute-force') {
                 if (bruteForceManagerInstance) {
                    const metric = document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
                    const currentKollektiv = stateManager.getCurrentKollektiv();
                    bruteForceManagerInstance.startOptimization(currentKollektiv, metric);
                 }
            } else if (target.id === 'btn-cancel-brute-force') {
                 if (bruteForceManagerInstance) bruteForceManagerInstance.cancelOptimization();
            } else if (target.id === 'btn-apply-best-bf-criteria') {
                const results = bruteForceManagerInstance.getResultsForKollektiv(
                    bruteForceManagerInstance.getCurrentKollektiv() || stateManager.getCurrentKollektiv(),
                    bruteForceManagerInstance.getCurrentTargetMetric() || stateManager.getBruteForceMetric()
                );
                if (results && results.bestResult) {
                    currentCriteria = results.bestResult.criteria;
                    currentLogic = results.bestResult.logic;
                    t2CriteriaManager.setCriteria(currentCriteria, currentLogic);
                    ui_helpers.updateT2CriteriaControlsUI(currentCriteria, currentLogic);
                    _handleCriteriaInputChange(); 
                    ui_helpers.showToast("Beste Brute-Force Kriterien in Definition geladen. Bitte 'Anwenden & Speichern'.", "info");
                    if(bootstrap.Modal.getInstance(document.getElementById('brute-force-modal'))) {
                         bootstrap.Modal.getInstance(document.getElementById('brute-force-modal')).hide();
                    }
                } else {
                    ui_helpers.showToast("Keine Brute-Force Ergebnisse zum Anwenden vorhanden.", "warning");
                }
            }
        }

        function _handleTableHeaderClick(event) {
            const headerCell = event.target.closest('th[data-sort-key]');
            if (headerCell) {
                const sortKey = headerCell.dataset.sortKey;
                let subKey = null;
                if (event.target.closest('.sortable-sub-header')) {
                    subKey = event.target.closest('.sortable-sub-header').dataset.subKey;
                }
                 if (typeof auswertungTabLogic !== 'undefined' && typeof auswertungTabLogic.handleSortChange === 'function') {
                     auswertungTabLogic.handleSortChange(sortKey, subKey);
                } else {
                    console.error("Sortierfunktion in auswertungTabLogic nicht gefunden.");
                }
            }
        }
        
        function _handleTableBodyClick(event) {
            const row = event.target.closest('tr[data-patient-id]');
            if (row && row.dataset.patientId) {
                if (typeof auswertungTabLogic !== 'undefined' && typeof auswertungTabLogic.handleRowClick === 'function') {
                    auswertungTabLogic.handleRowClick(row.dataset.patientId, Array.from(row.parentNode.children).indexOf(row), event);
                }
            }
        }
    }

    return Object.freeze({
        register
    });
})();

window.auswertungEventHandlers = auswertungEventHandlers;
