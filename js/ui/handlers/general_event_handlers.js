const generalEventHandlers = (() => {

    function init() {
        _attachTabEventListeners();
        _attachKollektivEventListeners();
        _attachKurzanleitungEventListener();
    }

    function _attachTabEventListeners() {
        const tabButtons = document.querySelectorAll('.nav-link[data-bs-toggle="tab"]');
        tabButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const targetTabId = event.target.getAttribute('data-bs-target').replace('#', '').replace('-pane', '');
                if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.renderTab === 'function') {
                    mainAppInterface.renderTab(targetTabId, mainAppInterface.getProcessedData(), state.getBruteForceResults());
                } else {
                }
            });
        });
    }

    function _attachKollektivEventListeners() {
        const kollektivButtons = document.querySelectorAll('#kollektiv-selection .btn');
        kollektivButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const newKollektiv = event.target.dataset.kollektiv;
                if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.setKollektiv === 'function' && typeof mainAppInterface.refreshCurrentTab === 'function') {
                    mainAppInterface.setKollektiv(newKollektiv);
                    mainAppInterface.refreshCurrentTab();
                    ui_helpers.updateKollektivButtonsUI(newKollektiv);
                } else {
                }
            });
        });
        ui_helpers.initializeTooltips(document.getElementById('kollektiv-selection'));
    }

    function _attachKurzanleitungEventListener() {
        const kurzanleitungButton = document.getElementById('btn-kurzanleitung');
        if (kurzanleitungButton) {
            kurzanleitungButton.addEventListener('click', () => {
                if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.showKurzanleitung === 'function') {
                    mainAppInterface.showKurzanleitung();
                }
            });
        }
    }

    return Object.freeze({
        init
    });

})();
