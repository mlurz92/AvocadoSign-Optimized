const statistikEventHandlers = (() => {

    function handleStatsLayoutToggle(button, appController) {
        if (!button || !appController || typeof appController.updateGlobalUIState !== 'function' || typeof appController.refreshCurrentTab !== 'function') {
            return;
        }
        
        setTimeout(() => {
            const isPressed = button.classList.contains('active');
            const newLayout = isPressed ? 'vergleich' : 'einzel';
            if (state.setCurrentStatsLayout(newLayout)) {
                appController.updateGlobalUIState();
                if (state.getActiveTabId() === 'statistik-tab') {
                    appController.refreshCurrentTab();
                }
            }
        }, 50);
    }

    function handleStatistikKollektivChange(selectElement, appController) {
        if (!selectElement || !appController || typeof appController.refreshCurrentTab !== 'function') {
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
            appController.refreshCurrentTab();
        }
    }

    return Object.freeze({
        handleStatsLayoutToggle,
        handleStatistikKollektivChange
    });
})();
