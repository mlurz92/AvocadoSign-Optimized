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
        const selectedStudyId = stateManager.getPresentationStudyId();

        const radioAsPur = document.getElementById('praes-ansicht-as-pur');
        const radioAsVsT2 = document.getElementById('praes-ansicht-as-vs-t2');
        if (radioAsPur) radioAsPur.checked = currentView === 'as-pur';
        if (radioAsVsT2) radioAsVsT2.checked = currentView === 'as-vs-t2';
        
        const studySelectGroup = document.getElementById('praes-study-select-group');
        if (studySelectGroup) {
            uiHelpers.toggleElementClass(studySelectGroup.id, 'd-none', currentView !== 'as-vs-t2');
        }

        const studySelect = document.getElementById('praes-study-select');
        if (studySelect) {
            studySelect.value = selectedStudyId;
        }
    }

    function init(appInterface) {
        if (isInitialized) return;
        mainApp = appInterface;
        _addEventListeners();
        isInitialized = true;
    }

    return Object.freeze({
        init,
        updateView
    });

})();
