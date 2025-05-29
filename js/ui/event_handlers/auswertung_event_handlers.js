const auswertungTabEventHandlers = (() => {
    let mainAppInterfaceRef = null;

    function handleT2CriteriaInputChange(event) {
        const target = event.target;
        let criteriaChanged = false;

        if (target.matches('.criteria-checkbox')) {
            const key = target.value;
            criteriaChanged = t2CriteriaManager.toggleCriterionActive(key, target.checked);
        } else if (target.matches('.criteria-range') || target.matches('.criteria-input-manual')) {
            const value = parseFloat(target.value);
            if (target.id === 'range-size' || target.id === 'input-size') {
                criteriaChanged = t2CriteriaManager.updateCriterionThreshold(value);
            }
        } else if (target.matches('.t2-criteria-button')) {
            const key = target.dataset.criterion;
            const value = target.dataset.value;
            if (t2CriteriaManager.getCurrentCriteria()?.[key]?.active) {
                 criteriaChanged = t2CriteriaManager.updateCriterionValue(key, value);
            }
        }

        if (criteriaChanged) {
            ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
            ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
        }
    }

    function handleT2LogicSwitchChange(event) {
        const newLogic = event.target.checked ? 'ODER' : 'UND';
        if (t2CriteriaManager.updateLogic(newLogic)) {
            ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
            ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
            const logicLabel = document.getElementById('t2-logic-label');
            if(logicLabel) logicLabel.textContent = UI_TEXTS.t2LogicDisplayNames[newLogic] || newLogic;
        }
    }

    function handleResetCriteriaClick() {
        t2CriteriaManager.resetCriteria();
        ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
        ui_helpers.showToast("T2-Kriterien auf Standard zurückgesetzt. Bitte 'Anwenden & Speichern', um Änderungen zu übernehmen.", "info");
    }

    function handleApplyCriteriaClick() {
        t2CriteriaManager.applyCriteria();
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
        ui_helpers.showToast("T2-Kriterien angewendet und gespeichert.", "success");
        if (mainAppInterfaceRef && typeof mainAppInterfaceRef.refreshSpecificTabs === 'function') {
            mainAppInterfaceRef.refreshSpecificTabs(['auswertung-tab', 'statistik-tab', 'praesentation-tab', 'publikation-tab', 'export-tab']);
            if(typeof mainAppInterfaceRef.updateHeader === 'function') mainAppInterfaceRef.updateHeader();
        }
    }

    function handleBruteForceMetricChange(event) {
        if (typeof state !== 'undefined') {
            state.setCurrentBruteForceMetric(event.target.value);
        }
    }

    function handleStartBruteForceClick() {
        if (typeof bruteForceManager !== 'undefined' && typeof state !== 'undefined') {
            const targetMetric = state.getCurrentBruteForceMetric();
            const currentKollektiv = state.getCurrentKollektiv();
            bruteForceManager.startBruteForce(targetMetric, currentKollektiv);
        } else {
            ui_helpers.showToast("Brute-Force Manager oder State nicht verfügbar.", "danger");
        }
    }

    function handleCancelBruteForceClick() {
        if (typeof bruteForceManager !== 'undefined') {
            bruteForceManager.cancelBruteForce();
        }
    }

    function handleApplyBestBruteForceCriteria() {
        if (typeof bruteForceManager === 'undefined' || typeof t2CriteriaManager === 'undefined' || typeof mainAppInterfaceRef === 'undefined') {
            ui_helpers.showToast("Funktion zum Anwenden der Brute-Force-Kriterien nicht bereit.", "danger");
            return;
        }
        const currentKollektiv = state.getCurrentKollektiv();
        const bestResultData = bruteForceManager.getResultsForKollektiv(currentKollektiv);

        if (bestResultData && bestResultData.bestResult && bestResultData.bestResult.criteria && bestResultData.bestResult.logic) {
            const { criteria, logic } = bestResultData.bestResult;
            t2CriteriaManager.resetCriteria();
            Object.keys(criteria).forEach(key => {
                t2CriteriaManager.toggleCriterionActive(key, criteria[key].active);
                if (criteria[key].active) {
                    if (key === 'size') {
                        t2CriteriaManager.updateCriterionThreshold(criteria[key].threshold);
                    } else {
                        t2CriteriaManager.updateCriterionValue(key, criteria[key].value);
                    }
                }
            });
            t2CriteriaManager.updateLogic(logic);
            t2CriteriaManager.applyCriteria();

            ui_helpers.updateT2CriteriaControlsUI(t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
            ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
            ui_helpers.showToast("Beste Brute-Force Kriterien wurden angewendet und gespeichert.", "success");

            if (mainAppInterfaceRef && typeof mainAppInterfaceRef.refreshSpecificTabs === 'function') {
                 mainAppInterfaceRef.refreshSpecificTabs(['auswertung-tab', 'statistik-tab', 'praesentation-tab', 'publikation-tab', 'export-tab']);
                 if(typeof mainAppInterfaceRef.updateHeader === 'function') mainAppInterfaceRef.updateHeader();
            }
        } else {
            ui_helpers.showToast("Keine validen Brute-Force-Ergebnisse zum Anwenden vorhanden.", "warning");
        }
    }

    function handleShowBruteForceDetails() {
         if (typeof bruteForceManager === 'undefined' || typeof uiComponents === 'undefined') {
            ui_helpers.showToast("Funktion zum Anzeigen der Brute-Force-Details nicht bereit.", "danger");
            return;
         }
         const currentKollektiv = state.getCurrentKollektiv();
         const resultsData = bruteForceManager.getResultsForKollektiv(currentKollektiv);
         const modalBody = document.getElementById('brute-force-modal-body');
         const modalTitle = document.getElementById('bruteForceModalLabel');

         if (modalBody && modalTitle && resultsData && resultsData.results && resultsData.results.length > 0) {
            modalTitle.textContent = `Top Brute-Force Ergebnisse für Kollektiv '${getKollektivDisplayName(currentKollektiv)}' (Ziel: ${resultsData.metric})`;
            modalBody.innerHTML = uiComponents.createBruteForceModalContent(resultsData);
            ui_helpers.initializeTooltips(modalBody);
         } else if (modalBody && modalTitle) {
            modalTitle.textContent = 'Brute-Force Ergebnisse';
            modalBody.innerHTML = `<p class="text-muted">Keine detaillierten Ergebnisse für das aktuelle Kollektiv ('${getKollektivDisplayName(currentKollektiv)}') oder die letzte Optimierung verfügbar.</p>`;
         }
    }

    function handleExportBruteForceModal() {
        if (typeof exportService === 'undefined' || typeof bruteForceManager === 'undefined' || typeof state === 'undefined') {
            ui_helpers.showToast("Exportfunktion für Brute-Force-Details nicht bereit.", "danger");
            return;
        }
        const currentKollektiv = state.getCurrentKollektiv();
        const bfData = bruteForceManager.getResultsForKollektiv(currentKollektiv);
        if (bfData && bfData.bestResult) {
            exportService.exportBruteForceReport(bfData, currentKollektiv);
        } else {
            ui_helpers.showToast("Keine Brute-Force Daten für Export aus Modal.", "warning");
        }
    }


    function initialize(mainAppInterface) {
        if (!mainAppInterface) {
            console.error("auswertungTabEventHandlers: mainAppInterface ist nicht initialisiert.");
            return;
        }
        mainAppInterfaceRef = mainAppInterface;

        const t2CriteriaContainer = document.getElementById('t2-criteria-definition-container');
        if (t2CriteriaContainer) {
            t2CriteriaContainer.removeEventListener('input', handleT2CriteriaInputChange);
            t2CriteriaContainer.removeEventListener('change', handleT2CriteriaInputChange);
            t2CriteriaContainer.removeEventListener('click', handleT2CriteriaInputChange);
            t2CriteriaContainer.addEventListener('input', handleT2CriteriaInputChange);
            t2CriteriaContainer.addEventListener('change', handleT2CriteriaInputChange);
            t2CriteriaContainer.addEventListener('click', handleT2CriteriaInputChange);
        }

        const t2LogicSwitch = document.getElementById('t2-logic-switch');
        if (t2LogicSwitch) {
            t2LogicSwitch.removeEventListener('change', handleT2LogicSwitchChange);
            t2LogicSwitch.addEventListener('change', handleT2LogicSwitchChange);
        }

        const btnResetCriteria = document.getElementById('btn-reset-criteria');
        if (btnResetCriteria) {
            btnResetCriteria.removeEventListener('click', handleResetCriteriaClick);
            btnResetCriteria.addEventListener('click', handleResetCriteriaClick);
        }

        const btnApplyCriteria = document.getElementById('btn-apply-criteria');
        if (btnApplyCriteria) {
            btnApplyCriteria.removeEventListener('click', handleApplyCriteriaClick);
            btnApplyCriteria.addEventListener('click', handleApplyCriteriaClick);
        }

        const bfMetricSelect = document.getElementById('brute-force-metric');
        if (bfMetricSelect) {
            bfMetricSelect.removeEventListener('change', handleBruteForceMetricChange);
            bfMetricSelect.addEventListener('change', handleBruteForceMetricChange);
        }

        const btnStartBruteForce = document.getElementById('btn-start-brute-force');
        if (btnStartBruteForce) {
            btnStartBruteForce.removeEventListener('click', handleStartBruteForceClick);
            btnStartBruteForce.addEventListener('click', handleStartBruteForceClick);
        }

        const btnCancelBruteForce = document.getElementById('btn-cancel-brute-force');
        if (btnCancelBruteForce) {
            btnCancelBruteForce.removeEventListener('click', handleCancelBruteForceClick);
            btnCancelBruteForce.addEventListener('click', handleCancelBruteForceClick);
        }

        const btnApplyBestBf = document.getElementById('btn-apply-best-bf-criteria');
        if (btnApplyBestBf) {
            btnApplyBestBf.removeEventListener('click', handleApplyBestBruteForceCriteria);
            btnApplyBestBf.addEventListener('click', handleApplyBestBruteForceCriteria);
        }

        const btnShowBfDetails = document.getElementById('btn-show-brute-force-details');
        if (btnShowBfDetails) {
             btnShowBfDetails.removeEventListener('click', handleShowBruteForceDetails);
             btnShowBfDetails.addEventListener('click', handleShowBruteForceDetails);
        }
        const modalExportButton = document.getElementById('export-bruteforce-modal-txt');
        if(modalExportButton) {
            modalExportButton.removeEventListener('click', handleExportBruteForceModal);
            modalExportButton.addEventListener('click', handleExportBruteForceModal);
        }
    }

    return Object.freeze({
        initialize
    });

})();
