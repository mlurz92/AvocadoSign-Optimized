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
            changed = t2CriteriaManager.toggleCriterionActive(criterionKey, true) || changed;
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
                inputElement.value = formatNumber(currentThreshold, 1, '', true);
            }
            ui_helpers.showToast("Ungültiger Wert für Größe. Bitte geben Sie eine Zahl ein.", "warning");
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
        ui_helpers.showToast('T2 Kriterien auf Standard zurückgesetzt (Änderungen noch nicht angewendet).', 'info');
    }

    function handleApplyCriteria(mainAppInterface) {
        if (typeof mainAppInterface.applyAndRefreshAll === 'function') {
            t2CriteriaManager.applyCriteria(); // Save criteria
            mainAppInterface.applyAndRefreshAll(true); // Re-process all data and refresh UI
            ui_helpers.showToast('T2-Kriterien angewendet & gespeichert.', 'success');
        } else {
            console.error("auswertungEventHandlers.handleApplyCriteria: mainAppInterface.applyAndRefreshAll ist nicht definiert.");
        }
    }

    function handleStartBruteForce(mainAppInterface) {
        if (bruteForceManager.isRunning() || !bruteForceManager.isWorkerAvailable()) {
            ui_helpers.showToast(bruteForceManager.isRunning() ? "Optimierung läuft bereits." : "Brute-Force Worker nicht verfügbar.", "warning");
            return;
        }
        const metric = document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
        const currentKollektiv = stateManager.getCurrentKollektiv();
        
        if (mainAppInterface && typeof mainAppInterface.getProcessedData === 'function') {
            const dataForWorker = dataProcessor.filterDataByKollektiv(mainAppInterface.getRawData(), currentKollektiv).map(p => ({
                nr: p.nr,
                n: p.n,
                lymphknoten_t2: cloneDeep(p.lymphknoten_t2)
            }));

            if (dataForWorker.length === 0) {
                ui_helpers.showToast("Keine Daten für Optimierung im aktuellen Kollektiv.", "warning");
                ui_helpers.updateBruteForceUI('idle', {}, bruteForceManager.isWorkerAvailable(), currentKollektiv);
                return;
            }
            ui_helpers.updateBruteForceUI('start', { metric: metric, kollektiv: currentKollektiv }, true, currentKollektiv);
            bruteForceManager.startAnalysis(dataForWorker, metric, currentKollektiv);
            if (mainAppInterface && typeof mainAppInterface.updateGlobalUIState === 'function') {
                mainAppInterface.updateGlobalUIState();
            }
        } else {
             console.error("auswertungEventHandlers.handleStartBruteForce: mainAppInterface.getProcessedData ist nicht definiert.");
             ui_helpers.showToast("Fehler beim Start der Optimierung: Datenquelle nicht verfügbar.", "danger");
        }
    }

    function handleCancelBruteForce() {
        if (!bruteForceManager.isRunning() || !bruteForceManager.isWorkerAvailable()) {
            console.warn("Keine laufende Analyse zum Abbrechen oder Worker nicht verfügbar.");
            return;
        }
        bruteForceManager.cancelAnalysis();
    }

    function handleApplyBestBfCriteria(mainAppInterface) {
        const currentKollektiv = stateManager.getCurrentKollektiv();
        const bfResultForKollektiv = bruteForceManager.getResultsForKollektiv(currentKollektiv);

        if (!bfResultForKollektiv?.bestResult?.criteria) {
            ui_helpers.showToast('Keine gültigen Brute-Force-Ergebnisse für dieses Kollektiv zum Anwenden.', 'warning');
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
        ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
        
        if (typeof mainAppInterface.applyAndRefreshAll === 'function') {
            t2CriteriaManager.applyCriteria(); // Save criteria
            mainAppInterface.applyAndRefreshAll(true); // Re-process all data and refresh UI
            ui_helpers.showToast('Beste Brute-Force Kriterien angewendet & gespeichert.', 'success');
        } else {
            console.error("auswertungEventHandlers.handleApplyBestBfCriteria: mainAppInterface.applyAndRefreshAll ist nicht definiert.");
        }
    }

    function handleBruteForceMetricChange(selectElement) {
        // Currently, no direct action needed on change, metric is read on start.
        // Could be used to save preference to state if desired in future.
        console.log("Brute-Force Zielmetrik Auswahl geändert zu:", selectElement.value);
    }

    function init() {
        // Not used, but kept for consistency if later needed for module-level init
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
        handleApplyBestBfCriteria,
        handleBruteForceMetricChange,
        init // Export init function
    });
})();
