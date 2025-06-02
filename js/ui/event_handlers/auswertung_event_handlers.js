const auswertungEventHandlers = (() => {
    let _mainAppInterface = null;

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
    }

    function _updateT2CriteriaUIFromInputs() {
        if (typeof t2CriteriaManager === 'undefined' || typeof auswertungTabLogic === 'undefined' || typeof ui_helpers === 'undefined') return;

        const criteria = t2CriteriaManager.getCriteriaFromUI();
        const logic = t2CriteriaManager.getLogicFromUI();
        
        t2CriteriaManager.setCriteriaAndLogic(criteria, logic, false); 
        
        if (typeof auswertungTabLogic.updateT2CriteriaUI === 'function') {
            auswertungTabLogic.updateT2CriteriaUI(criteria, logic);
        }
        ui_helpers.markT2CriteriaCardAsUnsaved(true);
    }

    function handleApplyT2Criteria() {
        if (typeof t2CriteriaManager === 'undefined' || typeof state === 'undefined' || typeof ui_helpers === 'undefined' || typeof auswertungTabLogic === 'undefined') return;
        
        const criteria = t2CriteriaManager.getCriteriaFromUI();
        const logic = t2CriteriaManager.getLogicFromUI();

        t2CriteriaManager.setCriteriaAndLogic(criteria, logic, true); 
        t2CriteriaManager.saveToLocalStorage();
        state.setAppliedT2Criteria(criteria, logic); 
        
        ui_helpers.markT2CriteriaCardAsUnsaved(false);
        ui_helpers.showToast('T2-Kriterien erfolgreich angewendet und gespeichert.', 'success');
        
        if (typeof auswertungTabLogic.refreshAuswertungTableAndDashboard === 'function') {
             auswertungTabLogic.refreshAuswertungTableAndDashboard();
        }
    }

    function handleResetT2Criteria() {
        if (typeof t2CriteriaManager === 'undefined' || typeof ui_helpers === 'undefined' || typeof auswertungTabLogic === 'undefined') return;
        
        const defaults = t2CriteriaManager.resetToDefaults(false); 
        if (typeof auswertungTabLogic.updateT2CriteriaUI === 'function') {
            auswertungTabLogic.updateT2CriteriaUI(defaults.criteria, defaults.logic);
        }
        ui_helpers.markT2CriteriaCardAsUnsaved(true);
        ui_helpers.showToast('T2-Kriterien auf Standardwerte zurückgesetzt. Bitte anwenden, um zu speichern.', 'info');
    }

    function handleStartBruteForce() {
        if (typeof bruteForceManager === 'undefined' || typeof state === 'undefined' || typeof ui_helpers === 'undefined') {
            ui_helpers.showToast('Brute-Force-Modul nicht initialisiert.', 'error');
            return;
        }

        if (!bruteForceManager.isWorkerAvailable()) {
            ui_helpers.showToast('Brute-Force Worker ist nicht verfügbar. Überprüfen Sie die Konsolen-Logs.', 'error');
            ui_helpers.updateBruteForceUI('error', 0, 0, '', 'Worker nicht verfügbar');
            return;
        }

        if (bruteForceManager.isOptimizationRunning()) {
            ui_helpers.showToast('Eine Brute-Force-Optimierung läuft bereits.', 'warning');
            return;
        }

        const metricSelect = document.getElementById('brute-force-metric');
        if (!metricSelect) {
             ui_helpers.showToast('Metrik-Auswahl für Brute-Force nicht gefunden.', 'error');
             return;
        }
        const selectedMetric = metricSelect.value;
        const currentKollektiv = state.getCurrentKollektiv();
        const rawData = state.getRawData();

        if (!currentKollektiv || !rawData || rawData.length === 0) {
            ui_helpers.showToast('Kein Kollektiv oder keine Daten für Brute-Force-Optimierung ausgewählt/vorhanden.', 'error');
            return;
        }
        
        ui_helpers.updateBruteForceUI('starting', 0, 0, selectedMetric, null, currentKollektiv);
        bruteForceManager.startOptimization(currentKollektiv, selectedMetric, rawData);
    }

    function handleCancelBruteForce() {
        if (typeof bruteForceManager === 'undefined' || typeof ui_helpers === 'undefined') return;
        bruteForceManager.cancelOptimization();
    }

    function handleBruteForceMetricChange() {
        if (typeof state === 'undefined') return;
        const metricSelect = document.getElementById('brute-force-metric');
        if (metricSelect) {
            state.setCurrentBruteForceMetric(metricSelect.value);
        }
    }
    
    function handleApplyBestBFCriteria() {
        if (typeof state === 'undefined' || typeof t2CriteriaManager === 'undefined' || typeof auswertungTabLogic === 'undefined' || typeof ui_helpers === 'undefined') return;
        const bruteForceState = state.getBruteForceResults();

        if (bruteForceState && bruteForceState.status === 'completed' && bruteForceState.bestResult) {
            const bestResult = bruteForceState.bestResult;
            t2CriteriaManager.setCriteriaAndLogic(cloneDeep(bestResult.criteria), bestResult.logic, false);
            if (typeof auswertungTabLogic.updateT2CriteriaUI === 'function') {
                 auswertungTabLogic.updateT2CriteriaUI(bestResult.criteria, bestResult.logic);
            }
            ui_helpers.markT2CriteriaCardAsUnsaved(true);
            ui_helpers.showToast('Beste Brute-Force Kriterien in Definition übernommen. Bitte anwenden & speichern.', 'info');
        } else {
            ui_helpers.showToast('Kein gültiges Brute-Force Ergebnis zum Anwenden vorhanden.', 'warning');
        }
    }

    function handleShowBruteForceDetails() {
        if (typeof state === 'undefined' || typeof ui_helpers === 'undefined') return;
        const bruteForceState = state.getBruteForceResults();
        const currentKollektiv = state.getCurrentKollektiv();
        if (bruteForceState && (bruteForceState.status === 'completed' || bruteForceState.results?.length > 0)) {
             ui_helpers.populateBruteForceModal(bruteForceState, currentKollektiv);
        } else {
            ui_helpers.populateBruteForceModal({status: 'nodata', results:[], message:'Keine Brute-Force Ergebnisse verfügbar oder Optimierung nicht abgeschlossen.'}, currentKollektiv);
        }
    }

    function handleExportBruteForceModalTxt() {
        if (typeof state === 'undefined' || typeof exportService === 'undefined' || typeof ui_helpers === 'undefined') return;
        const bruteForceState = state.getBruteForceResults();
        const currentKollektiv = state.getCurrentKollektiv();
        if (bruteForceState && bruteForceState.results && bruteForceState.results.length > 0) {
            exportService.exportBruteForceResults(bruteForceState, currentKollektiv, bruteForceState.metric || state.getCurrentBruteForceMetric() || 'Balanced Accuracy');
        } else {
            ui_helpers.showToast('Keine Brute-Force Ergebnisse zum Exportieren vorhanden.', 'warning');
        }
    }

    function attachAuswertungEventListeners(containerId = 'auswertung-tab-pane') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container #${containerId} für Auswertungs-Event-Listener nicht gefunden.`);
            return;
        }

        const btnApplyCriteria = container.querySelector('#btn-apply-criteria');
        if (btnApplyCriteria) {
            btnApplyCriteria.removeEventListener('click', handleApplyT2Criteria);
            btnApplyCriteria.addEventListener('click', handleApplyT2Criteria);
        }

        const btnResetCriteria = container.querySelector('#btn-reset-criteria');
        if (btnResetCriteria) {
            btnResetCriteria.removeEventListener('click', handleResetT2Criteria);
            btnResetCriteria.addEventListener('click', handleResetT2Criteria);
        }

        const btnStartBruteForce = container.querySelector('#btn-start-brute-force');
        if (btnStartBruteForce) {
            btnStartBruteForce.removeEventListener('click', handleStartBruteForce);
            btnStartBruteForce.addEventListener('click', handleStartBruteForce);
        }
        
        const btnCancelBruteForce = container.querySelector('#btn-cancel-brute-force');
        if (btnCancelBruteForce) {
            btnCancelBruteForce.removeEventListener('click', handleCancelBruteForce);
            btnCancelBruteForce.addEventListener('click', handleCancelBruteForce);
        }

        const bruteForceMetricSelect = container.querySelector('#brute-force-metric');
        if (bruteForceMetricSelect) {
            bruteForceMetricSelect.removeEventListener('change', handleBruteForceMetricChange);
            bruteForceMetricSelect.addEventListener('change', handleBruteForceMetricChange);
        }
        
        const btnApplyBestBF = container.querySelector('#btn-apply-best-bf-criteria');
        if(btnApplyBestBF) {
            btnApplyBestBF.removeEventListener('click', handleApplyBestBFCriteria);
            btnApplyBestBF.addEventListener('click', handleApplyBestBFCriteria);
        }

        const btnShowBFDetails = container.querySelector('#btn-show-brute-force-details');
         if(btnShowBFDetails) {
            btnShowBFDetails.removeEventListener('click', handleShowBruteForceDetails);
            btnShowBFDetails.addEventListener('click', handleShowBruteForceDetails);
        }
        
        const modalExportButton = document.getElementById('export-bruteforce-modal-txt');
        if (modalExportButton) {
            modalExportButton.removeEventListener('click', handleExportBruteForceModalTxt);
            modalExportButton.addEventListener('click', handleExportBruteForceModalTxt);
        }


        const t2CriteriaCard = container.querySelector('#t2-criteria-card');
        if (t2CriteriaCard) {
            t2CriteriaCard.removeEventListener('change', _handleT2CriteriaInputChange);
            t2CriteriaCard.addEventListener('change', _handleT2CriteriaInputChange);

            t2CriteriaCard.removeEventListener('click', _handleT2CriteriaButtonClick);
            t2CriteriaCard.addEventListener('click', _handleT2CriteriaButtonClick);
            
            const rangeInputs = t2CriteriaCard.querySelectorAll('input[type="range"].criteria-range');
            rangeInputs.forEach(range => {
                range.removeEventListener('input', _handleT2CriteriaRangeInput);
                range.addEventListener('input', _handleT2CriteriaRangeInput);
            });
        }
    }

    function _handleT2CriteriaInputChange(event) {
        if (!event.target) return;
        
        const target = event.target;
        if (target.classList.contains('criteria-checkbox') || 
            target.classList.contains('criteria-input-manual') ||
            target.id === 't2-logic-switch') {
            _updateT2CriteriaUIFromInputs();
        }
    }
    
    function _handleT2CriteriaButtonClick(event) {
        if (!event.target) return;
        const button = event.target.closest('.t2-criteria-button');
        if (button) {
            const criterion = button.dataset.criterion;
            const value = button.dataset.value;
            const optionsContainer = button.closest('.criteria-options-container');
            if (!optionsContainer) return;

            const criterionCheckbox = optionsContainer.parentElement.querySelector('.criteria-checkbox');
            if (!criterionCheckbox || !criterionCheckbox.checked) {
                 if (typeof ui_helpers !== 'undefined') ui_helpers.showToast('Bitte aktivieren Sie zuerst das Kriterium über die Checkbox.', 'info');
                return;
            }
            
            const allButtonsInGroup = optionsContainer.querySelectorAll(`.t2-criteria-button[data-criterion="${criterion}"]`);
            allButtonsInGroup.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            _updateT2CriteriaUIFromInputs();
        }
    }

    function _handleT2CriteriaRangeInput(event) {
         if (!event.target) return;
        const rangeInput = event.target;
        const valueDisplay = rangeInput.parentElement.querySelector('.criteria-value-display');
        const manualInput = rangeInput.parentElement.querySelector('.criteria-input-manual');
        if (valueDisplay) valueDisplay.textContent = formatNumber(rangeInput.value, 1);
        if (manualInput) manualInput.value = formatNumber(rangeInput.value, 1);
        _updateT2CriteriaUIFromInputs();
    }

    return Object.freeze({
        initialize,
        attachAuswertungEventListeners,
        handleApplyT2Criteria,
        handleResetT2Criteria,
        handleStartBruteForce,
        handleCancelBruteForce,
        handleBruteForceMetricChange,
        handleApplyBestBFCriteria,
        handleShowBruteForceDetails,
        handleExportBruteForceModalTxt
    });
})();
