const statistikController = (() => {

    let mainApp = null;
    let isInitialized = false;

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
        
        select1.value = selectedValue1;
        select2.value = selectedValue2;
    }

    function _addEventListeners() {
        const pane = document.getElementById('statistik-tab-pane');
        if (!pane) return;

        pane.addEventListener('click', (event) => {
            if (event.target.id === 'statistik-toggle-vergleich') {
                _handleLayoutToggle();
            }
        });

        pane.addEventListener('change', (event) => {
            if (event.target.id === 'statistik-kollektiv-select-1' || event.target.id === 'statistik-kollektiv-select-2') {
                _handleKollektivSelect(event);
            }
        });
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
            toggleBtn.innerHTML = isVergleich ? '<i class="fas fa-users-cog me-1"></i> Vergleich Aktiv' : '<i class="fas fa-user-cog me-1"></i> Einzelansicht Aktiv';
        }

        if (container1) uiHelpers.toggleElementClass(container1.id, 'd-none', layout !== 'vergleich');
        if (container2) uiHelpers.toggleElementClass(container2.id, 'd-none', layout !== 'vergleich');

        _populateSelectors();
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
