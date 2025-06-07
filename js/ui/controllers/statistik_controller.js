const statistikController = (() => {

    let mainApp = null;
    let isInitialized = false;
    let paneElement = null; // Reference to the tab pane element

    function _handleLayoutToggle() {
        const currentLayout = stateManager.getStatsLayout();
        const newLayout = currentLayout === 'einzel' ? 'vergleich' : 'einzel';
        stateManager.setStatsLayout(newLayout);
        mainApp.updateAndRender();
    }

    function _handleKollektivSelect(event) {
        const { id, value } = event.target;
        if (id === 'statistik-kollektiv-select-1') {
            stateManager.setStatsKollektiv1(value);
        } else if (id === 'statistik-kollektiv-select-2') {
            stateManager.setStatsKollektiv2(value);
        }
        mainApp.updateAndRender();
    }

    function _populateSelectors() {
        const select1 = document.getElementById('statistik-kollektiv-select-1');
        const select2 = document.getElementById('statistik-kollektiv-select-2');
        if (!select1 || !select2) return;

        const kollektive = dataProcessor.getAvailableKollektive();
        const selectedValue1 = stateManager.getStatsKollektiv1();
        const selectedValue2 = stateManager.getStatsKollektiv2();
        
        const optionsHTML = kollektive.map(k => {
            const displayName = getKollektivDisplayName(k);
            return `<option value="${k}">${displayName}</option>`;
        }).join('');
        
        select1.innerHTML = optionsHTML;
        select2.innerHTML = optionsHTML;
        
        // Ensure selected values are actually set if they exist in the new options
        if (kollektive.includes(selectedValue1)) {
            select1.value = selectedValue1;
        } else {
            select1.value = kollektive[0]; // Default to first available kollektiv
            stateManager.setStatsKollektiv1(kollektive[0]);
        }

        if (kollektive.includes(selectedValue2)) {
            select2.value = selectedValue2;
        } else {
            select2.value = kollektive.length > 1 ? kollektive[1] : kollektive[0]; // Default to second if exists, else first
            stateManager.setStatsKollektiv2(kollektive.length > 1 ? kollektive[1] : kollektive[0]);
        }
    }
    
    function _handleEvents(event) {
        const target = event.target;
        if (target.id === 'statistik-toggle-vergleich') {
            _handleLayoutToggle();
        } else if (target.matches('#statistik-kollektiv-select-1, #statistik-kollektiv-select-2')) {
            _handleKollektivSelect(event);
        }
    }

    function _addEventListeners() {
        if (paneElement) {
            // Remove existing listeners to prevent duplicates
            paneElement.removeEventListener('click', _handleEvents);
            paneElement.removeEventListener('change', _handleEvents);
            // Add new listeners
            paneElement.addEventListener('click', _handleEvents);
            paneElement.addEventListener('change', _handleEvents);
        }
    }
    
    function _removeEventListeners() {
        if (paneElement) {
            paneElement.removeEventListener('click', _handleEvents);
            paneElement.removeEventListener('change', _handleEvents);
        }
    }

    function updateView() {
        const layout = stateManager.getStatsLayout();
        const toggleBtn = document.getElementById('statistik-toggle-vergleich');
        const container1 = document.getElementById('statistik-kollektiv-select-1-container');
        const container2 = document.getElementById('statistik-kollektiv-select-2-container');

        if (toggleBtn) {
            const isVergleich = layout === 'vergleich';
            toggleBtn.classList.toggle('active', isVergleich);
            toggleBtn.setAttribute('aria-pressed', String(isVergleich));
            toggleBtn.innerHTML = isVergleich 
                ? '<i class="fas fa-columns me-1"></i> Vergleich Aktiv' 
                : '<i class="fas fa-user me-1"></i> Einzelansicht Aktiv';
        }

        if (container1) uiHelpers.toggleElementClass(container1.id, 'd-none', layout !== 'vergleich');
        if (container2) uiHelpers.toggleElementClass(container2.id, 'd-none', layout !== 'vergleich');

        _populateSelectors();
    }

    function init(appInterface) {
        if (isInitialized) return;
        mainApp = appInterface;
        paneElement = document.getElementById('statistik-tab-pane'); // Get reference to the pane element
        isInitialized = true;
    }

    function onTabEnter() {
       _addEventListeners();
       updateView(); // Ensure view is updated when tab is entered
    }

    function onTabExit() {
       _removeEventListeners(); // Remove listeners when tab is exited to prevent issues
    }

    return Object.freeze({
        init,
        onTabEnter,
        onTabExit
    });

})();
