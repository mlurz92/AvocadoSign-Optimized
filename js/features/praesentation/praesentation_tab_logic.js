const praesentationTabLogic = (() => {

    function _getPresentationData(currentGlobalKollektiv, processedData, appliedCriteria, appliedLogic, selectedStudyId = null) {
        const dataForCurrentKollektiv = dataProcessor.filterDataByKollektiv(processedData, currentGlobalKollektiv);
        if (!dataForCurrentKollektiv || dataForCurrentKollektiv.length === 0) {
            return { kollektiv: currentGlobalKollektiv, patientCount: 0 };
        }

        const presentationData = {
            kollektiv: currentGlobalKollektiv,
            patientCount: dataForCurrentKollektiv.length,
            statsAS: statisticsService.calculateDiagnosticPerformance(dataForCurrentKollektiv, 'as', 'n'),
            statsGesamt: statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'Gesamt'), 'as', 'n'),
            statsDirektOP: statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'direkt OP'), 'as', 'n'),
            statsNRCT: statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedData, 'nRCT'), 'as', 'n')
        };

        if (selectedStudyId) {
            let studySetToCompare;
            let evaluatedDataForT2;
            const isAppliedCriteria = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;

            if (isAppliedCriteria) {
                studySetToCompare = {
                    id: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID,
                    name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                    displayShortName: 'Angewandt',
                    criteria: appliedCriteria,
                    logic: appliedLogic,
                    studyInfo: {
                        reference: "Benutzerdefiniert (aktuell in App eingestellt)",
                        patientCohort: `Aktuell gewähltes Kollektiv: ${getKollektivDisplayName(currentGlobalKollektiv)} (N=${presentationData.patientCount})`,
                        investigationType: "N/A",
                        focus: "Benutzereinstellungen in der App",
                        keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false) || "Keine aktiven Kriterien"
                    }
                };
                evaluatedDataForT2 = t2CriteriaManager.evaluateDataset(cloneDeep(dataForCurrentKollektiv), appliedCriteria, appliedLogic);
            } else {
                studySetToCompare = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
                if (studySetToCompare) {
                    evaluatedDataForT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataForCurrentKollektiv), studySetToCompare);
                }
            }

            if (studySetToCompare && evaluatedDataForT2) {
                presentationData.statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataForT2, 't2', 'n');
                const dataForComparisonTests = cloneDeep(evaluatedDataForT2);
                 dataForComparisonTests.forEach((p, i) => {
                    if (dataForCurrentKollektiv[i]) {
                         p.as = dataForCurrentKollektiv[i].as;
                    }
                });
                presentationData.vergleich = statisticsService.compareDiagnosticMethods(dataForComparisonTests, 'as', 't2', 'n');
                presentationData.comparisonCriteriaSet = studySetToCompare;
                presentationData.t2CriteriaLabelShort = studySetToCompare.displayShortName || (isAppliedCriteria ? 'Angewandt' : 'T2');
                presentationData.t2CriteriaLabelFull = isAppliedCriteria ?
                    `${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME}: ${studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false)}`
                    : `${studySetToCompare.name || 'Studien-Set'}: ${studyT2CriteriaManager.formatStudyCriteriaForDisplay(studySetToCompare) || "Details nicht verfügbar"}`;
            } else {
                 presentationData.statsT2 = null;
                 presentationData.vergleich = null;
                 presentationData.comparisonCriteriaSet = null;
                 presentationData.t2CriteriaLabelShort = 'T2 (Fehler)';
                 presentationData.t2CriteriaLabelFull = 'Fehler beim Laden der Vergleichs-T2-Kriterien.';
            }
        }
        return presentationData;
    }


    function render(view, selectedStudyId, currentGlobalKollektiv, processedData, appliedCriteria, appliedLogic) {
        const presentationData = _getPresentationData(currentGlobalKollektiv, processedData, appliedCriteria, appliedLogic, selectedStudyId);
        let contentHTML = '';

        if (typeof uiViewLogic !== 'undefined' && typeof uiViewLogic.createPresentationTabContent === 'function') {
            contentHTML = uiViewLogic.createPresentationTabContent(view, presentationData, selectedStudyId, currentGlobalKollektiv);
        } else {
            console.error("praesentationTabLogic: uiViewLogic.createPresentationTabContent ist nicht verfügbar.");
            return '<div class="alert alert-danger m-3">Fehler: UI-Logik für Präsentationstab konnte nicht geladen werden.</div>';
        }

        setTimeout(() => {
            if (view === 'as-pur' && presentationData.statsAS && presentationData.patientCount > 0 && document.getElementById('praes-as-pur-perf-chart')) {
                chartRenderer.renderASPerformanceChart('praes-as-pur-perf-chart', presentationData, { margin: { bottom: 60 } }, getKollektivDisplayName(currentGlobalKollektiv));
            } else if (view === 'as-vs-t2' && presentationData.statsAS && presentationData.statsT2 && presentationData.patientCount > 0 && document.getElementById('praes-comp-chart-container')) {
                const chartData = [
                    { metric: 'Sens', AS: presentationData.statsAS.sens?.value ?? 0, T2: presentationData.statsT2.sens?.value ?? 0 },
                    { metric: 'Spez', AS: presentationData.statsAS.spez?.value ?? 0, T2: presentationData.statsT2.spez?.value ?? 0 },
                    { metric: 'PPV', AS: presentationData.statsAS.ppv?.value ?? 0, T2: presentationData.statsT2.ppv?.value ?? 0 },
                    { metric: 'NPV', AS: presentationData.statsAS.npv?.value ?? 0, T2: presentationData.statsT2.npv?.value ?? 0 },
                    { metric: 'Acc', AS: presentationData.statsAS.acc?.value ?? 0, T2: presentationData.statsT2.acc?.value ?? 0 },
                    { metric: 'AUC', AS: presentationData.statsAS.auc?.value ?? 0, T2: presentationData.statsT2.auc?.value ?? 0 }
                ];
                chartRenderer.renderComparisonBarChart(chartData, 'praes-comp-chart-container', { margin: {bottom: 60, left: 50} }, presentationData.t2CriteriaLabelShort || 'T2');
            }
            if (document.getElementById('praesentation-tab-pane')) {
                ui_helpers.initializeTooltips(document.getElementById('praesentation-tab-pane'));
            }
        }, 0);

        return contentHTML;
    }

    return Object.freeze({
        render
    });

})();