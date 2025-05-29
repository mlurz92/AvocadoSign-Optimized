const statistikTabEventHandlers = (() => {

    function handleLayoutToggleChange(event) {
        if (typeof state === 'undefined' || typeof statistikTabLogic === 'undefined') {
            console.error("Statistik Event Handler: State oder StatistikTabLogic nicht initialisiert.");
            return;
        }
        const button = event.target.closest('#statistik-toggle-vergleich');
        if (!button) return;

        const isChecked = button.classList.contains('active');
        const newLayout = isChecked ? 'einzel' : 'vergleich';

        state.setStatsLayout(newLayout);
        statistikTabLogic.renderTabContent();
    }

    function handleKollektivSelectChange(event) {
        if (typeof state === 'undefined' || typeof statistikTabLogic === 'undefined') {
            console.error("Statistik Event Handler: State oder StatistikTabLogic nicht initialisiert.");
            return;
        }
        const selectElement = event.target;
        if (!selectElement || (selectElement.id !== 'statistik-kollektiv-select-1' && selectElement.id !== 'statistik-kollektiv-select-2')) {
            return;
        }

        const selectedValue = selectElement.value;

        if (selectElement.id === 'statistik-kollektiv-select-1') {
            state.setStatsKollektiv1(selectedValue);
        } else if (selectElement.id === 'statistik-kollektiv-select-2') {
            state.setStatsKollektiv2(selectedValue);
        }
        statistikTabLogic.renderTabContent();
    }

    function initialize() {
        const layoutToggleButton = document.getElementById('statistik-toggle-vergleich');
        if (layoutToggleButton) {
            layoutToggleButton.removeEventListener('click', handleLayoutToggleChange);
            layoutToggleButton.addEventListener('click', handleLayoutToggleChange);
        } else {
            console.warn("Statistik Layout Toggle Button nicht gefunden für Event Listener.");
        }

        const kollektivSelect1 = document.getElementById('statistik-kollektiv-select-1');
        if (kollektivSelect1) {
            kollektivSelect1.removeEventListener('change', handleKollektivSelectChange);
            kollektivSelect1.addEventListener('change', handleKollektivSelectChange);
        } else {
            console.warn("Statistik Kollektiv Auswahl 1 nicht gefunden für Event Listener.");
        }

        const kollektivSelect2 = document.getElementById('statistik-kollektiv-select-2');
        if (kollektivSelect2) {
            kollektivSelect2.removeEventListener('change', handleKollektivSelectChange);
            kollektivSelect2.addEventListener('change', handleKollektivSelectChange);
        } else {
            console.warn("Statistik Kollektiv Auswahl 2 nicht gefunden für Event Listener.");
        }
    }

    return Object.freeze({
        initialize
    });

})();
