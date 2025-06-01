const statistikEventHandlers = (() => {
    let _mainAppInterface = null;

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
    }

    function handleStatsLayoutToggle(button, mainAppInterfaceRef) {
        const appInterface = mainAppInterfaceRef || _mainAppInterface;
        if (!button || !appInterface || typeof appInterface.refreshCurrentTab !== 'function' || typeof appInterface.updateGlobalUIState !== 'function') {
            console.error("statistikEventHandlers.handleStatsLayoutToggle: Ungültige Parameter.");
            return;
        }

        setTimeout(() => {
            const isPressed = button.classList.contains('active');
            const newLayout = isPressed ? 'vergleich' : 'einzel';

            if (typeof state !== 'undefined' && typeof state.setCurrentStatsLayout === 'function') {
                if (state.setCurrentStatsLayout(newLayout)) {
                    appInterface.updateGlobalUIState();
                    if (state.getActiveTabId() === 'statistik-tab') {
                        appInterface.refreshCurrentTab();
                    }
                }
            } else {
                 console.error("statistikEventHandlers.handleStatsLayoutToggle: State Modul oder state.setCurrentStatsLayout nicht verfügbar.");
            }
        }, 50);
    }

    function handleStatistikKollektivChange(selectElement, mainAppInterfaceRef) {
        const appInterface = mainAppInterfaceRef || _mainAppInterface;
        if (!selectElement || !appInterface || typeof appInterface.refreshCurrentTab !== 'function') {
             console.error("statistikEventHandlers.handleStatistikKollektivChange: Ungültige Parameter.");
            return;
        }

        let needsRender = false;
        const newValue = selectElement.value;

        if (typeof state !== 'undefined' && typeof state.setCurrentStatsKollektiv1 === 'function' && typeof state.setCurrentStatsKollektiv2 === 'function' && typeof state.getCurrentStatsLayout === 'function' && typeof state.getActiveTabId === 'function') {
            if (selectElement.id === 'statistik-kollektiv-select-1') {
                if (state.setCurrentStatsKollektiv1(newValue)) {
                    needsRender = true;
                }
            } else if (selectElement.id === 'statistik-kollektiv-select-2') {
                if (state.setCurrentStatsKollektiv2(newValue)) {
                    needsRender = true;
                }
            }

            if (needsRender && state.getCurrentStatsLayout() === 'vergleich' && state.getActiveTabId() === 'statistik-tab') {
                appInterface.refreshCurrentTab();
            }
        } else {
            console.error("statistikEventHandlers.handleStatistikKollektivChange: State Modul oder benötigte State-Funktionen nicht verfügbar.");
        }
    }

    return Object.freeze({
        initialize,
        handleStatsLayoutToggle,
        handleStatistikKollektivChange
    });
})();
