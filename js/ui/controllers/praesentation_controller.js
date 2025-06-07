const praesentationController = (() => {

    let mainApp = null;
    let isInitialized = false;

    function _handleViewChange(event) {
        const newView = event.target.value;
        stateManager.setPresentationView(newView);
        mainApp.updateAndRender();
    }

    function _handleStudySelect(event) {
        const newStudyId = event.target.value;
        stateManager.setPresentationStudyId(newStudyId);
        mainApp.updateAndRender();
    }
    
    function _addEventListeners() {
        const pane = document.getElementById('praesentation-tab-pane');
        if (!pane) return;

        pane.addEventListener('change', (event) => {
            const target = event.target;
            if (target.name === 'praesentationAnsicht') {
                _handleViewChange(event);
            } else if (target.id === 'praes-study-select') {
                _handleStudySelect(event);
            }
        });
    }

    function updateView() {
        const currentView = stateManager.getPresentationView();
        const studySelectGroup = document.getElementById('praes-study-select-group');
        if (studySelectGroup) {
            uiHelpers.toggleElementClass(studySelectGroup.id, 'd-none', currentView !== 'as-vs-t2');
        }
    }

    function getPresentationData(allProcessedData) {
        const currentGlobalKollektiv = stateManager.getCurrentKollektiv();
        const appliedT2Criteria = t2CriteriaManager.getCriteria();
        const appliedT2Logic = t2CriteriaManager.getLogic();

        const asPurFilteredData = dataProcessor.filterDataByKollektiv(allProcessedData, currentGlobalKollektiv);
        const asPurEvaluatedData = t2CriteriaManager.evaluateDatasetWithCriteria(asPurFilteredData, appliedT2Criteria, appliedT2Logic);
        const asPurStats = statisticsService.calculateAllStats(asPurEvaluatedData, appliedT2Criteria, appliedT2Logic);

        const selectedStudyId = stateManager.getPresentationStudyId() || APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
        const selectedStudy = studyCriteriaManager.getStudyCriteriaSetById(selectedStudyId);
        
        let asVsT2Stats = null;
        let comparisonKollektiv = currentGlobalKollektiv;
        let evaluatedDataForComparison;

        if (selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
            evaluatedDataForComparison = asPurEvaluatedData;
        } else if (selectedStudy) {
            comparisonKollektiv = selectedStudy.applicableKollektiv || currentGlobalKollektiv;
            const filteredDataForStudy = dataProcessor.filterDataByKollektiv(allProcessedData, comparisonKollektiv);
            evaluatedDataForComparison = studyCriteriaManager.applyStudyT2CriteriaToDataset(filteredDataForStudy, selectedStudy);
        }

        if (evaluatedDataForComparison) {
            asVsT2Stats = statisticsService.calculateAllStats(
                evaluatedDataForComparison,
                selectedStudy ? selectedStudy.criteria : appliedT2Criteria,
                selectedStudy ? selectedStudy.logic : appliedT2Logic
            );
        }
        
        return {
            asPur: asPurStats,
            asVsT2: asVsT2Stats
        };
    }

    function init(appInterface) {
        if (isInitialized) return;
        mainApp = appInterface;
        _addEventListeners();
        isInitialized = true;
    }

    function onTabEnter() {
        updateView();
    }

    function onTabExit() {
    }

    return Object.freeze({
        init,
        onTabEnter,
        onTabExit,
        getPresentationData
    });

})();
