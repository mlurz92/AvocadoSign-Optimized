const praesentationEventHandlers = (() => {
    let _mainAppInterface = null;

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
    }

    function handlePresentationViewChange(view, mainAppInterfaceRef) {
        const appInterface = mainAppInterfaceRef || _mainAppInterface;
        if (!appInterface || typeof appInterface.updateGlobalUIState !== 'function' || typeof appInterface.refreshCurrentTab !== 'function') {
            console.error("praesentationEventHandlers.handlePresentationViewChange: Ungültiges mainAppInterface.");
            return;
        }

        if (typeof state !== 'undefined' && typeof state.setCurrentPresentationView === 'function' && typeof state.getActiveTabId === 'function') {
            if (state.setCurrentPresentationView(view)) {
                appInterface.updateGlobalUIState();
                if (state.getActiveTabId() === 'praesentation-tab') {
                    appInterface.refreshCurrentTab();
                }
            }
        } else {
            console.error("praesentationEventHandlers.handlePresentationViewChange: State Modul oder benötigte State-Funktionen nicht verfügbar.");
        }
    }

    function handlePresentationStudySelectChange(studyId, mainAppInterfaceRef) {
        const appInterface = mainAppInterfaceRef || _mainAppInterface;
        if (!studyId || !appInterface || typeof appInterface.updateGlobalUIState !== 'function' || typeof appInterface.refreshCurrentTab !== 'function') {
            console.error("praesentationEventHandlers.handlePresentationStudySelectChange: Ungültige Parameter.");
            return;
        }

        if (typeof state === 'undefined' || typeof studyT2CriteriaManager === 'undefined' ||
            typeof state.getCurrentPresentationStudyId !== 'function' ||
            typeof state.getCurrentKollektiv !== 'function' ||
            typeof state.setCurrentPresentationStudyId !== 'function' ||
            typeof state.getActiveTabId !== 'function' ||
            typeof studyT2CriteriaManager.getStudyCriteriaSetById !== 'function') {
            console.error("praesentationEventHandlers.handlePresentationStudySelectChange: Kritische Module oder Funktionen nicht verfügbar.");
            return;
        }

        if (state.getCurrentPresentationStudyId() === studyId) return;

        const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId);
        let kollektivChanged = false;
        let refreshNeeded = false;

        if (studySet?.applicableKollektiv) {
            const targetKollektiv = studySet.applicableKollektiv;
            if (state.getCurrentKollektiv() !== targetKollektiv && typeof appInterface.handleGlobalKollektivChange === 'function') {
                // handleGlobalKollektivChange ist nicht Teil des mainAppInterface, sondern eine Methode in main.js,
                // die indirekt über appInterface.refreshCurrentTab(true) und die State-Änderung ausgelöst wird.
                // Hier sollten wir den globalen Kollektivwechsel anstoßen, wenn main.js diese Logik bereitstellt.
                // Für diesen Event-Handler ist es sicherer, den State zu setzen und dann einen Refresh anzustoßen.
                // Die Logik für den Kollektivwechsel bei Studienauswahl sollte idealerweise zentraler gesteuert werden.
                // Wir gehen davon aus, dass _handleKollektivChange in main.js aufgerufen wird, wenn der State sich ändert.
                // Daher setzen wir hier nur den Study-State und forcen einen Refresh.
                // Direkter Aufruf von _handleKollektivChange hier wäre problematisch.
            }
        }

        const studyIdChanged = state.setCurrentPresentationStudyId(studyId);
        if (studyIdChanged) {
            refreshNeeded = true;
        }

        if (refreshNeeded) {
            appInterface.updateGlobalUIState();
            if (state.getActiveTabId() === 'praesentation-tab') {
                appInterface.refreshCurrentTab(true); // Force data refresh, da sich die Basis ändern kann
            }
        }
    }

    function handlePresentationDownloadClick(button, mainAppInterfaceRef) {
        const appInterface = mainAppInterfaceRef || _mainAppInterface;
        if (!button || !appInterface || typeof appInterface.getGlobalData !== 'function' ) {
            console.error("praesentationEventHandlers.handlePresentationDownloadClick: Ungültige Parameter oder mainAppInterface unvollständig.");
            ui_helpers.showToast("Fehler beim Präsentationsexport: Interne Konfiguration.", "danger");
            return;
        }
        const actionId = button.id;
        const currentGlobalKollektiv = state.getCurrentKollektiv();
        const globalData = appInterface.getGlobalData();
        const processedDataFull = globalData.processedData;

        let presentationData = {};
        const globalKollektivDaten = dataProcessor.filterDataByKollektiv(processedDataFull, currentGlobalKollektiv);

        presentationData.kollektiv = currentGlobalKollektiv;
        presentationData.patientCount = globalKollektivDaten?.length ?? 0;

        const currentView = state.getCurrentPresentationView();

        if (currentView === 'as-pur') {
            presentationData.statsGesamt = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'Gesamt'), 'as', 'n');
            presentationData.statsDirektOP = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'direkt OP'), 'as', 'n');
            presentationData.statsNRCT = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'nRCT'), 'as', 'n');
            presentationData.statsCurrentKollektiv = statisticsService.calculateDiagnosticPerformance(globalKollektivDaten, 'as', 'n');
        } else if (currentView === 'as-vs-t2') {
            const selectedStudyId = state.getCurrentPresentationStudyId();
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
                    studySet = {
                        criteria: appliedCriteria,
                        logic: appliedLogic,
                        id: selectedStudyId,
                        name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                        displayShortName: "Angewandt",
                        studyInfo: {
                            reference: "Benutzerdefiniert (aktuell im Auswertungstab eingestellt)",
                            patientCohort: `Vergleichskollektiv: ${getKollektivDisplayName(comparisonKollektivName)} (N=${presentationData.patientCountForComparison})`,
                            investigationType: "N/A",
                            focus: "Benutzereinstellung",
                            keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic) || "Keine"
                        }
                    };
                    evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(comparisonCohortData), studySet.criteria, studySet.logic);
                } else if (selectedStudyId) {
                    studySet = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
                    if(studySet) {
                       evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(comparisonCohortData), studySet);
                    }
                }

                if (studySet && evaluatedDataT2 && evaluatedDataT2.length > 0) {
                    presentationData.statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n');
                    let asDataForDirectComparison = cloneDeep(comparisonCohortData);
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
        initialize,
        handlePresentationViewChange,
        handlePresentationStudySelectChange,
        handlePresentationDownloadClick
    });
})();
