const auswertungEventHandlers = (() => {

    function handleT2CheckboxChange(checkbox) {
        const key = checkbox.value;
        const isActive = checkbox.checked;
        if (t2CriteriaManager.toggleCriterionActive(key, isActive)) {
            ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
            ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
        }
    }

    function handleT2LogicChange(logicSwitch) {
        const newLogic = logicSwitch.checked ? 'ODER' : 'UND';
        if (t2CriteriaManager.updateLogic(newLogic)) {
            ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
            ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
        }
    }

    function handleT2CriteriaButtonClick(button) {
        const criterionKey = button.dataset.criterion;
        const value = button.dataset.value;
        let changed = false;
        if (!t2CriteriaManager.getCurrentCriteria()[criterionKey]?.active) {
            changed = t2CriteriaManager.toggleCriterionActive(criterionKey, true);
        }
        changed = t2CriteriaManager.updateCriterionValue(criterionKey, value) || changed;
        if (changed) {
            ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
            ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
        }
    }

    function handleT2SizeInputChange(value) {
        if (t2CriteriaManager.updateCriterionThreshold(value)) {
            if (!t2CriteriaManager.getCurrentCriteria().size?.active) {
                t2CriteriaManager.toggleCriterionActive('size', true);
            }
            ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
            ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
        } else {
            const currentThreshold = t2CriteriaManager.getCurrentCriteria().size?.threshold;
            const inputElement = document.getElementById('input-size');
            if (inputElement && currentThreshold !== undefined) {
                inputElement.value = utils.formatNumber(currentThreshold, 1, '', true);
            }
        }
    }

    function handleT2SizeRangeChange(value) {
         if (t2CriteriaManager.updateCriterionThreshold(value)) {
            if (!t2CriteriaManager.getCurrentCriteria().size?.active) {
                t2CriteriaManager.toggleCriterionActive('size', true);
            }
            ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
            ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
        }
    }

    function handleResetCriteria() {
        t2CriteriaManager.resetCriteria();
        ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
        ui_helpers.showToast('T2 Kriterien zurückgesetzt (Änderungen noch nicht angewendet).', 'info');
    }

    function handleApplyCriteria(appController) {
        if (typeof appController.applyAndRefreshAll === 'function') {
            appController.applyAndRefreshAll();
            ui_helpers.showToast('T2-Kriterien angewendet & gespeichert.', 'success');
        }
    }

    function handleStartBruteForce(appController) {
        if (bruteForceManager.isRunning() || !bruteForceManager.isWorkerAvailable()) {
            ui_helpers.showToast(bruteForceManager.isRunning() ? "Optimierung läuft bereits." : "Brute-Force Worker nicht verfügbar.", "warning");
            return;
        }
        const metric = document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
        
        if (appController && typeof appController.startBruteForceAnalysis === 'function') {
            appController.startBruteForceAnalysis(metric);
        }
    }

    function handleCancelBruteForce() {
        if (!bruteForceManager.isRunning()) return;
        bruteForceManager.cancelAnalysis();
    }

    function handleApplyBestBfCriteria(appController) {
        const currentKollektiv = state.getCurrentKollektiv();
        const bfResultForKollektiv = bruteForceManager.getResultsForKollektiv(currentKollektiv);

        if (!bfResultForKollektiv?.bestResult?.criteria) {
            ui_helpers.showToast('Keine gültigen Brute-Force-Ergebnisse zum Anwenden.', 'warning');
            return;
        }
        const best = bfResultForKollektiv.bestResult;
        Object.keys(best.criteria).forEach(key => {
            if (key === 'logic') return;
            const criterion = best.criteria[key];
            t2CriteriaManager.toggleCriterionActive(key, criterion.active);
            if (criterion.active) {
                if (key === 'size') {
                    t2CriteriaManager.updateCriterionThreshold(criterion.threshold);
                } else {
                    t2CriteriaManager.updateCriterionValue(key, criterion.value);
                }
            }
        });
        t2CriteriaManager.updateLogic(best.logic);
        
        if (typeof appController.applyAndRefreshAll === 'function') {
            appController.applyAndRefreshAll();
            ui_helpers.showToast('Beste Brute-Force Kriterien angewendet & gespeichert.', 'success');
        }
    }

    return Object.freeze({
        handleT2CheckboxChange,
        handleT2LogicChange,
        handleT2CriteriaButtonClick,
        handleT2SizeInputChange,
        handleT2SizeRangeChange,
        handleResetCriteria,
        handleApplyCriteria,
        handleStartBruteForce,
        handleCancelBruteForce,
        handleApplyBestBfCriteria
    });
})();
