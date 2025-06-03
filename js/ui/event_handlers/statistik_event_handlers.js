const statistikEventHandlers = (() => {

    function handleStatsLayoutToggle(button, mainAppInterface) {
        if (!button || !mainAppInterface || typeof mainAppInterface.refreshCurrentTab !== 'function' || typeof mainAppInterface.updateGlobalUIState !== 'function') {
            console.error("statistikEventHandlers.handleStatsLayoutToggle: Ungültige Parameter.");
            return;
        }
        
        setTimeout(() => {
            const isPressed = button.classList.contains('active');
            const newLayout = isPressed ? 'vergleich' : 'einzel';
            if (state.setCurrentStatsLayout(newLayout)) {
                mainAppInterface.updateGlobalUIState();
                if (state.getActiveTabId() === 'statistik-tab') {
                    mainAppInterface.refreshCurrentTab();
                }
            }
        }, 50);
    }

    function handleStatistikKollektivChange(selectElement, mainAppInterface) {
        if (!selectElement || !mainAppInterface || typeof mainAppInterface.refreshCurrentTab !== 'function') {
             console.error("statistikEventHandlers.handleStatistikKollektivChange: Ungültige Parameter.");
            return;
        }

        let needsRender = false;
        const newValue = selectElement.value;

        if (selectElement.id === 'statistik-kollektiv-select-1') {
            needsRender = state.setCurrentStatsKollektiv1(newValue);
        } else if (selectElement.id === 'statistik-kollektiv-select-2') {
            needsRender = state.setCurrentStatsKollektiv2(newValue);
        }

        if (needsRender && state.getCurrentStatsLayout() === 'vergleich' && state.getActiveTabId() === 'statistik-tab') {
            mainAppInterface.refreshCurrentTab();
        }
    }

    return Object.freeze({
        handleStatsLayoutToggle,
        handleStatistikKollektivChange
    });
})();
