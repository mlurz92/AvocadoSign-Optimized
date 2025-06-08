const praesentationEventHandlers = (() => {

    function handlePresentationViewChange(view, appController) {
        if (!appController || typeof appController.updateGlobalUIState !== 'function' || typeof appController.refreshCurrentTab !== 'function') {
            return;
        }

        if (state.setCurrentPresentationView(view)) {
            appController.updateGlobalUIState();
            if (state.getActiveTabId() === 'praesentation-tab') {
                appController.refreshCurrentTab();
            }
        }
    }

    function handlePresentationStudySelectChange(studyId, appController) {
        if (!studyId || !appController || typeof appController.updateGlobalUIState !== 'function' || typeof appController.refreshCurrentTab !== 'function') {
            return;
        }
        if (state.getCurrentPresentationStudyId() === studyId) return;

        const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId);
        let refreshNeeded = false;

        if (studySet?.applicableKollektiv) {
            const targetKollektiv = studySet.applicableKollektiv;
            if (state.getCurrentKollektiv() !== targetKollektiv && typeof appController.handleGlobalKollektivChange === 'function') {
                if (appController.handleGlobalKollektivChange(targetKollektiv, "auto_praesentation")) {
                    refreshNeeded = true;
                }
            }
        }

        if (state.setCurrentPresentationStudyId(studyId)) {
            refreshNeeded = true;
        }

        if (refreshNeeded) {
            appController.updateGlobalUIState();
            if (state.getActiveTabId() === 'praesentation-tab') {
                appController.refreshCurrentTab();
            }
        }
    }

    function handlePresentationDownloadClick(button, appController) {
        if (!button || !appController || typeof appController.getRawData !== 'function' || typeof appController.getProcessedData !== 'function') {
            ui_helpers.showToast("Fehler beim Präsentationsexport.", "danger");
            return;
        }
        const actionId = button.id;
        const currentGlobalKollektiv = state.getCurrentKollektiv();
        const processedDataFull = appController.getProcessedData(); 
        
        let presentationData = {};
        const globalKollektivDaten = dataProcessor.filterDataByKollektiv(processedDataFull, currentGlobalKollektiv);
        presentationData.kollektiv = currentGlobalKollektiv;

        const currentView = state.getCurrentPresentationView();
        if (currentView === 'as-pur') {
            presentationData.statsGesamt = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'Gesamt'), 'as', 'n');
            presentationData.statsDirektOP = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'direkt OP'), 'as', 'n');
            presentationData.statsNRCT = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'nRCT'), 'as', 'n');
        } else if (currentView === 'as-vs-t2') {
            const selectedStudyId = state.getCurrentPresentationStudyId();
            let comparisonCohortData = globalKollektivDaten;
            let comparisonKollektivName = currentGlobalKollektiv;

            if (selectedStudyId && selectedStudyId !== APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
                if (studySet?.applicableKollektiv && studySet.applicableKollektiv !== currentGlobalKollektiv) {
                    comparisonKollektivName = studySet.applicableKollektiv;
                    comparisonCohortData = dataProcessor.filterDataByKollektiv(processedDataFull, comparisonKollektivName);
                }
            }
            presentationData.kollektivForComparison = comparisonKollektivName;
            
            if (comparisonCohortData && comparisonCohortData.length > 0) {
                presentationData.statsAS = statisticsService.calculateDiagnosticPerformance(comparisonCohortData, 'as', 'n');
                let studySet = null;
                let evaluatedDataT2 = null;
                const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
                if(isApplied) {
                    const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
                    const appliedLogic = t2CriteriaManager.getAppliedLogic();
                    studySet = { criteria: appliedCriteria, logic: appliedLogic, id: selectedStudyId, name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME };
                    evaluatedDataT2 = t2CriteriaManager.evaluateDataset(utils.cloneDeep(comparisonCohortData), studySet.criteria, studySet.logic);
                } else if (selectedStudyId) {
                    studySet = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
                    if(studySet) {
                       evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(utils.cloneDeep(comparisonCohortData), studySet);
                    }
                }
                if (studySet && evaluatedDataT2) {
                    presentationData.statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n');
                    presentationData.vergleich = statisticsService.compareDiagnosticMethods(evaluatedDataT2, 'as', 't2', 'n');
                    presentationData.comparisonCriteriaSet = studySet;
                }
            }
        }
        exportService.exportPraesentationData(actionId, presentationData, currentGlobalKollektiv);
    }

    return Object.freeze({
        handlePresentationViewChange,
        handlePresentationStudySelectChange,
        handlePresentationDownloadClick
    });
})();
