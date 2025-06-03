const praesentationEventHandlers = (() => {

    function _handleViewChange(event) {
        const newView = event.target.value;
        if (typeof stateManager !== 'undefined' && typeof stateManager.setCurrentPresentationView === 'function') {
            stateManager.setCurrentPresentationView(newView);
            // Das UI-Update (Ein-/Ausblenden des Study-Selectors und Neurendern des Inhalts)
            // wird durch das 'stateChanged'-Event in main.js ausgelöst, welches updateAllUIComponents/refreshCurrentTab aufruft.
            // Alternativ könnte man es hier direkt auslösen, falls mainAppInterface verfügbar ist.
            if (mainAppInterface && typeof mainAppInterface.refreshCurrentTab === 'function') {
                 mainAppInterface.refreshCurrentTab(true); // true to force stat recalculation as view change implies different data needs
            }
        } else {
            console.error("stateManager.setCurrentPresentationView ist nicht verfügbar.");
        }
    }

    function _handleStudySelectChange(event) {
        const newStudyId = event.target.value;
        if (typeof stateManager !== 'undefined' && typeof stateManager.setCurrentPresentationStudyId === 'function') {
            stateManager.setCurrentPresentationStudyId(newStudyId);
             if (mainAppInterface && typeof mainAppInterface.refreshCurrentTab === 'function') {
                 mainAppInterface.refreshCurrentTab(true); // true to force stat recalculation
            }
        } else {
            console.error("stateManager.setCurrentPresentationStudyId ist nicht verfügbar.");
        }
    }
    
    function _handleCriteriaComparisonSetChange(event) {
        const checkbox = event.target;
        const setId = checkbox.value;
        const isChecked = checkbox.checked;
        
        if (typeof stateManager !== 'undefined' && typeof stateManager.getCriteriaComparisonSets === 'function' && typeof stateManager.setCriteriaComparisonSets === 'function') {
            let currentSets = stateManager.getCriteriaComparisonSets();
            if (isChecked) {
                if (!currentSets.includes(setId)) {
                    currentSets.push(setId);
                }
            } else {
                currentSets = currentSets.filter(id => id !== setId);
            }
            stateManager.setCriteriaComparisonSets(currentSets);
             if (mainAppInterface && typeof mainAppInterface.refreshCurrentTab === 'function') {
                 mainAppInterface.refreshCurrentTab(true);
            }
        } else {
             console.error("stateManager für CriteriaComparisonSets nicht verfügbar.");
        }
    }


    function register() {
        const praesentationTabPane = document.getElementById('praesentation-tab-pane');
        if (!praesentationTabPane) {
            console.warn("PraesentationEventHandlers: Praesentation-Tab-Pane ('praesentation-tab-pane') nicht gefunden. Handler nicht registriert.");
            return;
        }

        // Event Listener für Radio-Buttons der Ansichtsauswahl
        const viewRadios = praesentationTabPane.querySelectorAll('input[name="praesentationAnsicht"]');
        if (viewRadios && viewRadios.length > 0) {
            viewRadios.forEach(radio => {
                radio.removeEventListener('change', _handleViewChange);
                radio.addEventListener('change', _handleViewChange);
            });
        } else {
            console.warn("PraesentationEventHandlers: Ansicht-Radio-Buttons ('praesentationAnsicht') nicht gefunden.");
        }

        // Event Listener für Dropdown der Studienauswahl
        const studySelect = praesentationTabPane.querySelector('#praes-study-select');
        if (studySelect) {
            studySelect.removeEventListener('change', _handleStudySelectChange);
            studySelect.addEventListener('change', _handleStudySelectChange);
        } else {
            console.warn("PraesentationEventHandlers: Studien-Select ('praes-study-select') nicht gefunden.");
        }
        
        // Event Listener für Checkboxen der Kriterienvergleichs-Sets (falls implementiert)
        const criteriaComparisonCheckboxes = praesentationTabPane.querySelectorAll('.criteria-comparison-set-checkbox');
        if (criteriaComparisonCheckboxes && criteriaComparisonCheckboxes.length > 0) {
            criteriaComparisonCheckboxes.forEach(checkbox => {
                checkbox.removeEventListener('change', _handleCriteriaComparisonSetChange);
                checkbox.addEventListener('change', _handleCriteriaComparisonSetChange);
            });
        } else {
            // Optional, da diese UI-Elemente noch nicht explizit definiert wurden
            // console.warn("PraesentationEventHandlers: Kriterienvergleich-Checkboxes ('.criteria-comparison-set-checkbox') nicht gefunden.");
        }
    }

    return Object.freeze({
        register
    });
})();
