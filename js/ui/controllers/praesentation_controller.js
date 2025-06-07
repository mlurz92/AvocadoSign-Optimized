const praesentationController = (() => {

    let mainApp = null;
    let isInitialized = false;

    function _handleViewChange(event) {
        const newView = event.target.value;
        if (stateManager.setPresentationView(newView)) {
            mainApp.updateAndRender();
        }
    }

    function _handleStudySelect(event) {
        const newStudyId = event.target.value;
        if (stateManager.setPresentationStudyId(newStudyId)) {
            mainApp.updateAndRender();
        }
    }

    function getPresentationData(allProcessedData) {
        const currentGlobalKollektiv = stateManager.getCurrentKollektiv();
        const appliedT2Criteria = t2CriteriaManager.getCriteria();
        const appliedT2Logic = t2CriteriaManager.getLogic();

        // Data for "AS Pur" view always uses the current global kollektiv and applied criteria
        const asPurFilteredData = dataProcessor.filterDataByKollektiv(allProcessedData, currentGlobalKollektiv);
        const asPurEvaluatedData = t2CriteriaManager.evaluateDatasetWithCriteria(asPurFilteredData, appliedT2Criteria, appliedT2Logic);
        const asPurStats = statisticsService.calculateAllStats(asPurEvaluatedData, appliedT2Criteria, appliedT2Logic);

        // Data for "AS vs. T2" view
        const selectedStudyId = stateManager.getPresentationStudyId();
        let selectedStudy = null;
        if (selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
            // If "Applied Criteria" is selected, use the currently applied criteria
            selectedStudy = {
                id: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID,
                name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                displayShortName: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                context: 'Aktuell angewandte Kriterien',
                applicableKollektiv: currentGlobalKollektiv, // Apply to current global kollektiv
                criteria: appliedT2Criteria,
                logic: appliedT2Logic,
                description: 'Die aktuell in der Anwendung eingestellten T2-Kriterien.'
            };
        } else if (selectedStudyId) {
            // Otherwise, try to load a predefined study criteria set
            selectedStudy = studyCriteriaManager.getStudyCriteriaSetById(selectedStudyId);
        }

        let asVsT2Stats = null;
        let evaluatedDataForComparison = [];
        let comparisonKollektiv = currentGlobalKollektiv; // Default to global kollektiv

        if (selectedStudy) {
            // If the study defines an applicableKollektiv, use it; otherwise, use the current global kollektiv
            comparisonKollektiv = selectedStudy.applicableKollektiv || currentGlobalKollektiv;
            const filteredDataForStudy = dataProcessor.filterDataByKollektiv(allProcessedData, comparisonKollektiv);
            
            if (selectedStudy.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                // If it's the "applied criteria" option, and the filtered data (which is based on comparisonKollektiv)
                // has already been evaluated with *applied* criteria (asPurEvaluatedData), reuse that.
                // Otherwise, evaluate with current applied criteria.
                evaluatedDataForComparison = t2CriteriaManager.evaluateDatasetWithCriteria(filteredDataForStudy, selectedStudy.criteria, selectedStudy.logic);
            } else {
                // For predefined study criteria sets, apply their specific criteria
                evaluatedDataForComparison = studyCriteriaManager.applyStudyT2CriteriaToDataset(filteredDataForStudy, selectedStudy);
            }

            if (evaluatedDataForComparison) {
                asVsT2Stats = statisticsService.calculateAllStats(
                    evaluatedDataForComparison,
                    selectedStudy.criteria, // Use the study's specific criteria
                    selectedStudy.logic     // Use the study's specific logic
                );
            }
        }
        
        return {
            asPur: asPurStats,
            asVsT2: asVsT2Stats
        };
    }
    
    function _addEventListeners() {
        const pane = document.getElementById('praesentation-tab-pane');
        if (!pane) return;

        // Remove existing listeners to prevent duplicates
        pane.removeEventListener('change', _handleViewChangeAndStudySelect);
        
        // Add single event listener for both view change and study select
        pane.addEventListener('change', _handleViewChangeAndStudySelect);
    }

    function _handleViewChangeAndStudySelect(event) {
        const target = event.target;
        if (target.name === 'praesentationAnsicht') {
            _handleViewChange(event);
        } else if (target.id === 'praes-study-select') {
            _handleStudySelect(event);
        }
    }

    function updateView() {
        const currentView = stateManager.getPresentationView();
        const studySelectGroup = document.getElementById('praes-study-select-group');
        if (studySelectGroup) {
            uiHelpers.toggleElementClass('praes-study-select-group', 'd-none', currentView !== 'as-vs-t2');
        }
    }

    function init(appInterface) {
        if (isInitialized) return;
        mainApp = appInterface;
        _addEventListeners(); // Attach event listeners once during init
        isInitialized = true;
    }
    
    function onTabEnter() {
        // When entering the tab, ensure the view is updated to reflect current state
        updateView();
        // The event listeners are already attached in init, no need to re-attach here.
        // If they were removed in onTabExit, they would need to be re-attached here.
    }
    
    function onTabExit() {
        // No specific cleanup needed here for event listeners, as they are managed by init.
        // If event listeners were attached in onTabEnter, they would be removed here.
    }

    return Object.freeze({
        init,
        onTabEnter,
        onTabExit,
        updateView,
        getPresentationData
    });

})();
