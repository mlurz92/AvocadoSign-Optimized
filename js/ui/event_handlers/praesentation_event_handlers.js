const praesentationEventHandlers = (() => {

    function handlePresentationViewChange(view, mainAppInterface) {
        if (!mainAppInterface || typeof mainAppInterface.updateGlobalUIState !== 'function' || typeof mainAppInterface.refreshCurrentTab !== 'function') {
            console.error("praesentationEventHandlers.handlePresentationViewChange: Ungültiges mainAppInterface.");
            return;
        }

        if (stateManager.updateUserSettings({ praesentationView: view })) { // setCurrentPresentationView already handles resetting studyId or setting default
            mainAppInterface.updateGlobalUIState();
            if (stateManager.getActiveTabId() === 'praesentation-tab') {
                mainAppInterface.refreshCurrentTab();
            }
        }
    }

    function handlePresentationStudySelectChange(studyId, mainAppInterface) {
        if (!studyId || !mainAppInterface || typeof mainAppInterface.updateGlobalUIState !== 'function' || typeof mainAppInterface.refreshCurrentTab !== 'function') {
            console.error("praesentationEventHandlers.handlePresentationStudySelectChange: Ungültige Parameter.");
            return;
        }
        if(stateManager.getCurrentPresentationStudyId() === studyId) return;

        const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId);
        let kollektivChanged = false;
        let refreshNeeded = false;

        if (studySet?.applicableKollektiv) {
            const targetKollektiv = studySet.applicableKollektiv;
            if (stateManager.getCurrentKollektiv() !== targetKollektiv && mainAppInterface.handleGlobalKollektivChange) {
                kollektivChanged = mainAppInterface.handleGlobalKollektivChange(targetKollektiv, "auto_praesentation");
                refreshNeeded = kollektivChanged;
            }
        }

        const studyIdChanged = stateManager.updateUserSettings({ praesentationStudyId: studyId });
        if (studyIdChanged && !refreshNeeded) {
            refreshNeeded = true;
        }

        if (refreshNeeded) {
            mainAppInterface.updateGlobalUIState();
            if (stateManager.getActiveTabId() === 'praesentation-tab') {
                mainAppInterface.refreshCurrentTab();
            }
        }
    }

    function handlePresentationDownloadClick(button, mainAppInterface) {
        if (!button || !mainAppInterface || typeof mainAppInterface.getRawData !== 'function' || typeof mainAppInterface.getProcessedData !== 'function') {
            console.error("praesentationEventHandlers.handlePresentationDownloadClick: Ungültige Parameter oder mainAppInterface unvollständig.");
            ui_helpers.showToast("Fehler beim Präsentationsexport: Interne Konfiguration.", "danger");
            return;
        }
        const actionId = button.id;
        const currentGlobalKollektiv = stateManager.getCurrentKollektiv();
        const processedDataFull = mainAppInterface.getProcessedData(); // Annahme: gibt alle prozessierten Daten zurück, nicht nur die aktuell gefilterten
        
        let presentationData = {};
        const globalKollektivDaten = dataProcessor.filterDataByKollektiv(processedDataFull, currentGlobalKollektiv);

        presentationData.kollektiv = currentGlobalKollektiv;
        presentationData.patientCount = globalKollektivDaten?.length ?? 0;

        const currentView = stateManager.getCurrentPresentationView();

        if (currentView === 'as-pur') {
            presentationData.statsGesamt = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'Gesamt'), 'as', 'n');
            presentationData.statsDirektOP = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'direkt OP'), 'as', 'n');
            presentationData.statsNRCT = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'nRCT'), 'as', 'n');
            presentationData.statsCurrentKollektiv = statisticsService.calculateDiagnosticPerformance(globalKollektivDaten, 'as', 'n');
        } else if (currentView === 'as-vs-t2') {
            const selectedStudyId = stateManager.getCurrentPresentationStudyId();
            let comparisonCohortData = globalKollektivDaten;
            let comparisonKollektivName = currentGlobalKollektiv;

            if (selectedStudyId && selectedStudyId !== APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                const studySetForKollektiv = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
                if (studySetForKollektiv?.applicableKollektiv && studySetForKollektiv.applicableKollektiv !== currentGlobalKollektiv) {
                    comparisonKollektivName = studySetForKollektiv.applicableKollektiv;
                    comparisonCohortData = dataProcessor.filterDataByKollektiv(processedDataFull, comparisonKollektivName);
                }
            }
            presentationData.kollektivForComparison = comparisonKollektivName;
            presentationData.patientCountForComparison = comparisonCohortData?.length ?? 0;

            if (comparisonCohortData && comparisonCohortData.length > 0) {
                presentationData.statsAS = statisticsService.calculateDiagnosticPerformance(comparisonCohortData, 'as', 'n');
                let studySet = null;
                let evaluatedDataT2 = null;
                const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
                const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
                const appliedLogic = t2CriteriaManager.getAppliedLogic();

                if(isApplied) {
                    studySet = { criteria: appliedCriteria, logic: appliedLogic, id: selectedStudyId, name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME, displayShortName: "Angewandt", studyInfo: { reference: "Benutzerdefiniert (aktuell im Auswertungstab eingestellt)", patientCohort: `Vergleichskollektiv: ${getKollektivDisplayName(comparisonKollektivName)} (N=${presentationData.patientCountForComparison})`, investigationType: "N/A", focus: "Benutzereinstellung", keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic) || "Keine" } };
                    evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(comparisonCohortData), studySet.criteria, studySet.logic);
                } else if (selectedStudyId) {
                    studySet = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
                    if(studySet) {
                       evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(comparisonCohortData), studySet);
                    }
                }

                if (studySet && evaluatedDataT2 && evaluatedDataT2.length > 0) {
                    presentationData.statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n');
                    let asDataForDirectComparison = cloneDeep(comparisonCohortData); // Verwende die korrekten AS-Daten für den direkten Vergleich
                    evaluatedDataT2.forEach((p, i) => { if (asDataForDirectComparison[i]) p.as = asDataForDirectComparison[i].as; });
                    presentationData.vergleich = statisticsService.compareDiagnosticMethods(evaluatedDataT2, 'as', 't2', 'n');
                    presentationData.comparisonCriteriaSet = studySet;
                    presentationData.t2CriteriaLabelShort = studySet.displayShortName || 'T2';
                    presentationData.t2CriteriaLabelFull = `${isApplied ? 'Aktuell angewandt' : (studySet.name || 'Studie')}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic)}`;
                } else if (studySet) {
                    presentationData.statsT2 = null;
                    presentationData.vergleich = null;
                    presentationData.comparisonCriteriaSet = studySet;
                    presentationData.t2CriteriaLabelShort = studySet.displayShortName || 'T2';
                    presentationData.t2CriteriaLabelFull = `${studySet.name}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic)}`;
                }
            } else {
                 presentationData.statsAS = null;
                 presentationData.statsT2 = null;
                 presentationData.vergleich = null;
                 if(selectedStudyId) presentationData.comparisonCriteriaSet = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId) || {name: selectedStudyId, displayShortName: 'Unbekannt', criteria: {}, logic: 'ODER', studyInfo:{}};
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
