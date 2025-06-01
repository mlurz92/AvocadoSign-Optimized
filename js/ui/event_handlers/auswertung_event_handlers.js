const auswertungEventHandlers = (() => {
    let _mainAppInterface = null;

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
    }

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

    function handleApplyCriteria(mainAppInterfaceRef) {
        const appInterface = mainAppInterfaceRef || _mainAppInterface;
        if (appInterface && typeof appInterface.notifyDataProcessingChange === 'function' && typeof appInterface.refreshCurrentTab === 'function') {
            t2CriteriaManager.applyCriteria();
            appInterface.notifyDataProcessingChange(); 
            appInterface.refreshCurrentTab(true); 
            ui_helpers.showToast('T2-Kriterien angewendet & gespeichert.', 'success');
        } else {
            console.error("auswertungEventHandlers.handleApplyCriteria: mainAppInterface oder benötigte Methoden nicht definiert.");
            ui_helpers.showToast("Fehler beim Anwenden der Kriterien.", "danger");
        }
    }

    function handleStartBruteForce(mainAppInterfaceRef) {
        const appInterface = mainAppInterfaceRef || _mainAppInterface;
        if (bruteForceManager.getState() === 'running' || !bruteForceManager.isWorkerAvailable()) {
            ui_helpers.showToast(bruteForceManager.getState() === 'running' ? "Optimierung läuft bereits." : "Brute-Force Worker nicht verfügbar.", "warning");
            return;
        }
        const metricSelect = document.getElementById('brute-force-metric');
        const metric = metricSelect ? metricSelect.value : APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
        const currentKollektiv = state.getCurrentKollektiv();

        if (appInterface && typeof appInterface.getGlobalData === 'function') {
            const globalData = appInterface.getGlobalData();
            const dataForWorker = dataProcessor.filterDataByKollektiv(globalData.processedData, currentKollektiv).map(p => ({
                nr: p.nr,
                id_patient: p.id_patient,
                n: p.n,
                lymphknoten_t2: cloneDeep(p.lymphknoten_t2)
            }));

            if (dataForWorker.length === 0) {
                ui_helpers.showToast("Keine Daten für Optimierung im aktuellen Kollektiv.", "warning");
                ui_helpers.updateBruteForceUI('idle', {}, bruteForceManager.isWorkerAvailable(), currentKollektiv);
                return;
            }
            
            const t2SizeRangeSettings = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE;

            ui_helpers.updateBruteForceUI('start', { metric: metric, kollektiv: currentKollektiv }, bruteForceManager.isWorkerAvailable(), currentKollektiv);
            bruteForceManager.startOptimization(dataForWorker, currentKollektiv, metric, t2SizeRangeSettings);

        } else {
             console.error("auswertungEventHandlers.handleStartBruteForce: mainAppInterface.getGlobalData ist nicht definiert.");
             ui_helpers.showToast("Fehler beim Start der Optimierung: Datenquelle nicht verfügbar.", "danger");
        }
    }

    function handleCancelBruteForce() {
        if (bruteForceManager.getState() !== 'running' || !bruteForceManager.isWorkerAvailable()) {
            console.warn("Keine laufende Analyse zum Abbrechen oder Worker nicht verfügbar.");
            return;
        }
        bruteForceManager.cancelOptimization();
    }

    function handleApplyBestBfCriteria(mainAppInterfaceRef) {
        const appInterface = mainAppInterfaceRef || _mainAppInterface;
        const currentKollektiv = state.getCurrentKollektiv();
        const bfResultForKollektiv = bruteForceManager.getBestResultForKollektiv(currentKollektiv);

        if (!bfResultForKollektiv || !bfResultForKollektiv.criteria) {
            ui_helpers.showToast('Keine gültigen Brute-Force-Ergebnisse für dieses Kollektiv zum Anwenden.', 'warning');
            return;
        }
        const best = bfResultForKollektiv;
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

        if (appInterface && typeof appInterface.notifyDataProcessingChange === 'function' && typeof appInterface.refreshCurrentTab === 'function') {
            t2CriteriaManager.applyCriteria();
            appInterface.notifyDataProcessingChange();
            appInterface.refreshCurrentTab(true);
            ui_helpers.showToast('Beste Brute-Force Kriterien angewendet & gespeichert.', 'success');
        } else {
            console.error("auswertungEventHandlers.handleApplyBestBfCriteria: mainAppInterface oder benötigte Methoden nicht definiert.");
            ui_helpers.showToast("Fehler beim Anwenden der besten Brute-Force Kriterien.", "danger");
        }
    }

    function handleBruteForceMetricChange(selectElement) {
        console.log("Brute-Force Zielmetrik Auswahl geändert zu:", selectElement.value);
    }


    return Object.freeze({
        initialize,
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
        handleBruteForceMetricChange
    });
})();
