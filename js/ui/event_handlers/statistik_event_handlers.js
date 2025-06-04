const statistikEventHandlers = (() => {

    function _handleLayoutToggle() {
        const currentLayout = stateManager.getCurrentStatsLayout();
        const newLayout = currentLayout === 'einzel' ? 'vergleich' : 'einzel';
        stateManager.setCurrentStatsLayout(newLayout);
        if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.updateAllUIComponents === 'function') {
            mainAppInterface.updateAllUIComponents();
        } else if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshCurrentTab === 'function') {
            mainAppInterface.refreshCurrentTab();
        }
    }

    function _handleKollektivSelectChange(event) {
        const selectId = event.target.id;
        const newKollektiv = event.target.value;

        if (selectId === 'statistik-kollektiv-select-einzel') {
            stateManager.setCurrentKollektiv(newKollektiv); 
            stateManager.setStatsKollektiv1(newKollektiv);
        } else if (selectId === 'statistik-kollektiv-select-1') {
            stateManager.setStatsKollektiv1(newKollektiv);
            if(stateManager.getCurrentStatsLayout() === 'einzel') {
                stateManager.setCurrentKollektiv(newKollektiv);
            }
        } else if (selectId === 'statistik-kollektiv-select-2') {
            stateManager.setStatsKollektiv2(newKollektiv);
        }
        if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshCurrentTab === 'function') {
             mainAppInterface.refreshCurrentTab(true); 
        }
    }
    
    function _handleFilterMerkmalChange(event) {
        const newMerkmal = event.target.value;
        if (typeof stateManager !== 'undefined' && typeof stateManager.setStatistikFilterMerkmal === 'function') { 
            stateManager.setStatistikFilterMerkmal(newMerkmal);
             if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshCurrentTab === 'function') {
                mainAppInterface.refreshCurrentTab(true);
            }
        } else {
            console.warn("stateManager.setStatistikFilterMerkmal nicht verfügbar.");
        }
    }
    
    function _handleT2VergleichSetChange(event) {
        const newSetId = event.target.value;
         if (typeof stateManager !== 'undefined' && typeof stateManager.setStatistikT2VergleichSet === 'function') { 
            stateManager.setStatistikT2VergleichSet(newSetId);
            if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshCurrentTab === 'function') {
                mainAppInterface.refreshCurrentTab(true);
            }
        } else {
            console.warn("stateManager.setStatistikT2VergleichSet nicht verfügbar.");
        }
    }


    function register() {
        const statistikTabPane = document.getElementById('statistik-tab-pane');
        if (!statistikTabPane) {
            console.warn("StatistikEventHandlers: Statistik-Tab-Pane ('statistik-tab-pane') nicht gefunden. Handler nicht registriert.");
            return;
        }

        const layoutToggleButton = statistikTabPane.querySelector('#statistik-toggle-vergleich');
        if (layoutToggleButton) {
            layoutToggleButton.removeEventListener('click', _handleLayoutToggle);
            layoutToggleButton.addEventListener('click', _handleLayoutToggle);
        } else {
            console.warn("StatistikEventHandlers: Layout-Toggle-Button ('statistik-toggle-vergleich') nicht gefunden.");
        }

        const kollektivSelectEinzel = statistikTabPane.querySelector('#statistik-kollektiv-select-einzel');
        if (kollektivSelectEinzel) {
            kollektivSelectEinzel.removeEventListener('change', _handleKollektivSelectChange);
            kollektivSelectEinzel.addEventListener('change', _handleKollektivSelectChange);
        } else {
            console.warn("StatistikEventHandlers: Kollektiv-Select-Einzel ('statistik-kollektiv-select-einzel') nicht gefunden.");
        }
        
        const kollektivSelect1 = statistikTabPane.querySelector('#statistik-kollektiv-select-1');
        if (kollektivSelect1) {
            kollektivSelect1.removeEventListener('change', _handleKollektivSelectChange);
            kollektivSelect1.addEventListener('change', _handleKollektivSelectChange);
        } else {
            console.warn("StatistikEventHandlers: Kollektiv-Select-1 ('statistik-kollektiv-select-1') nicht gefunden.");
        }

        const kollektivSelect2 = statistikTabPane.querySelector('#statistik-kollektiv-select-2');
        if (kollektivSelect2) {
            kollektivSelect2.removeEventListener('change', _handleKollektivSelectChange);
            kollektivSelect2.addEventListener('change', _handleKollektivSelectChange);
        } else {
            console.warn("StatistikEventHandlers: Kollektiv-Select-2 ('statistik-kollektiv-select-2') nicht gefunden.");
        }
        
        const filterMerkmalSelect = statistikTabPane.querySelector('#statistik-filter-merkmal-select');
        if (filterMerkmalSelect) {
            filterMerkmalSelect.removeEventListener('change', _handleFilterMerkmalChange);
            filterMerkmalSelect.addEventListener('change', _handleFilterMerkmalChange);
        } else {
            
        }
        
        const t2VergleichSelect = statistikTabPane.querySelector('#statistik-t2-vergleich-select');
        if (t2VergleichSelect) {
            t2VergleichSelect.removeEventListener('change', _handleT2VergleichSetChange);
            t2VergleichSelect.addEventListener('change', _handleT2VergleichSetChange);
        } else {
            
        }
    }

    return Object.freeze({
        register
    });
})();

window.statistikEventHandlers = statistikEventHandlers;
