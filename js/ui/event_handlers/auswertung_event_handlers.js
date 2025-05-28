const auswertungEventHandlers = (() => {

    function handleT2LogicChange(event) {
        const newLogic = event.target.value;
        if (t2CriteriaManager.updateLogic(newLogic)) {
            auswertungTabLogic.updateUnsavedIndicator();
            auswertungTabLogic.updateCumulativeLogicDisplay();
        }
    }

    function handleT2CriterionActiveChange(key, isActive) {
        if (t2CriteriaManager.toggleCriterionActive(key, isActive)) {
            auswertungTabLogic.updateUnsavedIndicator();
            auswertungTabLogic.updateCumulativeLogicDisplay();
        }
    }

    function handleT2CriterionValueChange(key, value) {
        if (t2CriteriaManager.updateCriterionValue(key, value)) {
            auswertungTabLogic.updateUnsavedIndicator();
            auswertungTabLogic.updateCumulativeLogicDisplay();
        }
    }

    function handleT2CriterionThresholdChange(key, value) {
        if (t2CriteriaManager.updateCriterionThreshold(value)) {
            auswertungTabLogic.updateUnsavedIndicator();
            auswertungTabLogic.updateCumulativeLogicDisplay();
        }
    }

    function handleApplyT2Criteria() {
        t2CriteriaManager.applyCriteria();
        auswertungTabLogic.refreshAuswertungTab();
        generalEventHandlers.updateHeaderStats();
        viewRenderer.updateAllViews(state.getActiveTabId());
        ui_helpers.showToast('T2-Kriterien erfolgreich angewendet und gespeichert.', 'success');
        auswertungTabLogic.updateUnsavedIndicator();
        auswertungTabLogic.updateAppliedCriteriaDisplay();
    }

    function handleResetT2Criteria() {
        t2CriteriaManager.resetCriteria();
        auswertungTabLogic.render();
        ui_helpers.showToast('T2-Kriterien auf Standard zurückgesetzt.', 'info');
    }

    function handleLoadStudySet(event) {
        const setId = event.target.value;
        if (!setId) return;

        const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(setId);
        if (studySet && studySet.criteria) {
            t2CriteriaManager.updateLogic(studySet.logic || 'ODER');
            Object.keys(studySet.criteria).forEach(key => {
                const critDef = studySet.criteria[key];
                t2CriteriaManager.toggleCriterionActive(key, critDef.active);
                if (critDef.active) {
                    if (key === 'size' && critDef.threshold !== undefined) {
                        t2CriteriaManager.updateCriterionThreshold(critDef.threshold);
                    } else if (critDef.value !== undefined) {
                        t2CriteriaManager.updateCriterionValue(key, critDef.value);
                    }
                }
            });
            auswertungTabLogic.render();
            ui_helpers.showToast(`Studien-Set '${studySet.name}' geladen. Bitte anwenden & speichern.`, 'info');
        }
        event.target.value = "";
    }

    function handleStartBruteForce() {
        const metricSelect = document.getElementById('bruteforce-metric-select');
        if (!metricSelect) return;
        const targetMetric = metricSelect.value;
        const currentKollektiv = state.getCurrentKollektiv();
        const dataForAnalysis = dataProcessor.filterDataByKollektiv(kollektivStore.getCurrentKollektivRawData(), currentKollektiv);

        if (dataForAnalysis.length === 0) {
            ui_helpers.showToast(`Keine Daten im Kollektiv '${getKollektivDisplayName(currentKollektiv)}' für Brute-Force.`, 'warning');
            return;
        }
        if (!bruteForceManager.isWorkerAvailable()) {
            const initialized = bruteForceManager.init({
                onProgress: auswertungTabLogic.updateBruteForceUI,
                onResult: auswertungTabLogic.updateBruteForceUI,
                onError: (payload) => { ui_helpers.showToast(`Brute-Force Fehler: ${payload.message}`, 'danger'); auswertungTabLogic.updateBruteForceUI(); },
                onCancelled: (payload) => { ui_helpers.showToast(`Brute-Force Optimierung abgebrochen.`, 'info'); auswertungTabLogic.updateBruteForceUI(payload); },
                onStarted: auswertungTabLogic.updateBruteForceUI
            });
            if (!initialized) {
                 ui_helpers.showToast('Brute-Force Worker konnte nicht initialisiert werden.', 'danger');
                 return;
            }
        }

        const success = bruteForceManager.startAnalysis(dataForAnalysis, targetMetric, currentKollektiv);
        if (success) {
            ui_helpers.showToast(`Brute-Force Optimierung für '${targetMetric}' gestartet...`, 'info');
            auswertungTabLogic.updateBruteForceUI({ kollektiv: currentKollektiv });
        }
    }

    function handleCancelBruteForce() {
        if (bruteForceManager.isRunning()) {
            bruteForceManager.cancelAnalysis();
        }
    }

    function handleShowBruteForceDetails() {
        const currentKollektiv = state.getCurrentKollektiv();
        const resultsData = bruteForceManager.getResultsForKollektiv(currentKollektiv);
        const modalElement = document.getElementById('brute-force-modal');
        const modalBody = modalElement?.querySelector('.modal-body');
        const exportTxtButton = document.getElementById('export-bruteforce-modal-txt');
        const exportCsvButton = document.getElementById('export-bruteforce-modal-csv');

        if (!modalElement || !modalBody || !exportTxtButton || !exportCsvButton) return;

        if (resultsData && resultsData.results && resultsData.results.length > 0) {
            const modalContent = uiComponents.createBruteForceResultsModalContent(resultsData);
            modalBody.innerHTML = '';
            modalBody.appendChild(modalContent);
            exportTxtButton.disabled = false;
            exportCsvButton.disabled = false;
        } else {
            modalBody.innerHTML = '<p class="text-muted text-center">Keine detaillierten Brute-Force-Ergebnisse für dieses Kollektiv vorhanden.</p>';
            exportTxtButton.disabled = true;
            exportCsvButton.disabled = true;
        }
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        if(modalInstance) modalInstance.show();
    }

    function handleExportBruteForceModal(exportAll = false) {
        const currentKollektiv = state.getCurrentKollektiv();
        const resultsData = bruteForceManager.getResultsForKollektiv(currentKollektiv);
        if (!resultsData) {
            ui_helpers.showToast('Keine Brute-Force Daten zum Exportieren.', 'warning');
            return;
        }
        let dataToExport = resultsData;
        if (exportAll) {
            const allWorkerResults = bruteForceManager.getAllResults();
            const fullResultsForCurrentKollektiv = allWorkerResults[currentKollektiv];
            if (fullResultsForCurrentKollektiv && fullResultsForCurrentKollektiv.allResults) {
                 dataToExport = { ...fullResultsForCurrentKollektiv, results: fullResultsForCurrentKollektiv.allResults }; // Verwende 'allResults' für den CSV Export
            } else if(resultsData.allResults) {
                dataToExport = resultsData; // Fallback, falls Worker 'allResults' direkt in 'resultsData' packt
            } else {
                ui_helpers.showToast('Keine vollständigen Rohdaten für CSV-Export gefunden.', 'warning');
                return;
            }
        }
        exportService.exportBruteForceReport(dataToExport, exportAll);
    }


    function setupAuswertungTabEventHandlers() {
        const tabPane = document.getElementById('auswertung-tab-pane');
        if (!tabPane) return;

        tabPane.addEventListener('change', (event) => {
            if (event.target.name === 't2LogicRadio') {
                handleT2LogicChange(event);
            } else if (event.target.id && event.target.id.endsWith('-active') && event.target.type === 'checkbox') {
                const key = event.target.id.replace('t2-criterion-', '').replace('-active', '');
                handleT2CriterionActiveChange(key, event.target.checked);
            } else if (event.target.id === 't2-load-study-set-select'){
                 handleLoadStudySet(event);
            }
        });

        tabPane.addEventListener('input', (event) => {
             if (event.target.type === 'range' && event.target.id && event.target.id.startsWith('t2-criterion-size')) {
                const key = event.target.id.replace('t2-criterion-', '').replace('-threshold', '');
                handleT2CriterionThresholdChange(key, parseFloat(event.target.value));
             }
        });

        tabPane.addEventListener('click', (event) => {
            const target = event.target;
            const buttonTarget = target.closest('.t2-criteria-button');
            const actionButton = target.closest('button');

            if (buttonTarget && buttonTarget.dataset.value) {
                const controlWrapper = buttonTarget.closest('.criteria-group');
                if(controlWrapper && controlWrapper.classList.contains('disabled-criterion-control')) return;

                const criterionKey = Array.from(controlWrapper.classList).find(c => c.startsWith('criteria-group-'))?.replace('criteria-group-','') || buttonTarget.id.split('-')[2];

                if (criterionKey) {
                     const value = buttonTarget.dataset.value;
                     handleT2CriterionValueChange(criterionKey, value);
                     Array.from(buttonTarget.parentElement.querySelectorAll('.t2-criteria-button')).forEach(btn => btn.classList.remove('active'));
                     buttonTarget.classList.add('active');
                }
            } else if (actionButton) {
                if (actionButton.id === 'btn-t2-apply') handleApplyT2Criteria();
                else if (actionButton.id === 'btn-t2-reset') handleResetT2Criteria();
                else if (actionButton.id === 'btn-bruteforce-start') handleStartBruteForce();
                else if (actionButton.id === 'btn-bruteforce-cancel') handleCancelBruteForce();
                else if (actionButton.id === 'btn-bruteforce-details') handleShowBruteForceDetails();
            }
        });

        const bruteForceModal = document.getElementById('brute-force-modal');
        if(bruteForceModal) {
            const exportTxtButton = bruteForceModal.querySelector('#export-bruteforce-modal-txt');
            const exportCsvButton = bruteForceModal.querySelector('#export-bruteforce-modal-csv');
            if(exportTxtButton) exportTxtButton.addEventListener('click', () => handleExportBruteForceModal(false));
            if(exportCsvButton) exportCsvButton.addEventListener('click', () => handleExportBruteForceModal(true));
        }
    }

    return Object.freeze({
        setupAuswertungTabEventHandlers,
        handleT2CriterionActiveChange,
        handleT2CriterionValueChange,
        handleT2CriterionThresholdChange,
        handleShowBruteForceDetails
    });

})();
