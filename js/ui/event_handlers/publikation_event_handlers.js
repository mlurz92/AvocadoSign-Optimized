const publikationEventHandlers = (() => {
    let _mainAppInterface = null;

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
    }

    function handlePublikationSpracheChange(checkbox, mainAppInterfaceRef) {
        const appInterface = mainAppInterfaceRef || _mainAppInterface;
        if (!checkbox || !appInterface || typeof appInterface.updateGlobalUIState !== 'function' || typeof appInterface.refreshCurrentTab !== 'function') {
            console.error("publikationEventHandlers.handlePublikationSpracheChange: Ungültige Parameter.");
            return;
        }

        const newLang = checkbox.checked ? 'en' : 'de';
        if (typeof state !== 'undefined' && typeof state.setCurrentPublikationLang === 'function' && typeof state.getActiveTabId === 'function') {
            if (state.setCurrentPublikationLang(newLang)) {
                appInterface.updateGlobalUIState();
                if (state.getActiveTabId() === 'publikation-tab') {
                    appInterface.refreshCurrentTab();
                }
            }
        } else {
            console.error("publikationEventHandlers.handlePublikationSpracheChange: State Modul oder benötigte State-Funktionen nicht verfügbar.");
        }
    }

    function handlePublikationBfMetricChange(selectElement, mainAppInterfaceRef) {
        const appInterface = mainAppInterfaceRef || _mainAppInterface;
        if (!selectElement || !appInterface || typeof appInterface.updateGlobalUIState !== 'function' || typeof appInterface.refreshCurrentTab !== 'function') {
            console.error("publikationEventHandlers.handlePublikationBfMetricChange: Ungültige Parameter.");
            return;
        }
        const newMetric = selectElement.value;
        if (typeof state !== 'undefined' && typeof state.setCurrentPublikationBruteForceMetric === 'function' && typeof state.getActiveTabId === 'function') {
            if (state.setCurrentPublikationBruteForceMetric(newMetric)) {
                if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.setDataStale === 'function') {
                    publikationTabLogic.setDataStale();
                }
                appInterface.updateGlobalUIState();
                if (state.getActiveTabId() === 'publikation-tab') {
                    appInterface.refreshCurrentTab();
                }
            }
        } else {
            console.error("publikationEventHandlers.handlePublikationBfMetricChange: State Modul oder benötigte State-Funktionen nicht verfügbar.");
        }
    }

    function handlePublikationSectionChange(sectionId, mainAppInterfaceRef) {
        const appInterface = mainAppInterfaceRef || _mainAppInterface;
        if (!sectionId || !appInterface || typeof appInterface.updateGlobalUIState !== 'function' || typeof appInterface.refreshCurrentTab !== 'function') {
            console.error("publikationEventHandlers.handlePublikationSectionChange: Ungültige Parameter.");
            return;
        }

        if (typeof state !== 'undefined' && typeof state.setCurrentPublikationSection === 'function' && typeof state.getActiveTabId === 'function') {
            if (state.setCurrentPublikationSection(sectionId)) {
                appInterface.updateGlobalUIState();
                if (state.getActiveTabId() === 'publikation-tab') {
                    appInterface.refreshCurrentTab();
                }
                const contentArea = document.getElementById('publikation-content-area');
                if (contentArea) {
                    contentArea.scrollTop = 0;
                }
            }
        } else {
             console.error("publikationEventHandlers.handlePublikationSectionChange: State Modul oder benötigte State-Funktionen nicht verfügbar.");
        }
    }

    return Object.freeze({
        initialize,
        handlePublikationSpracheChange,
        handlePublikationBfMetricChange,
        handlePublikationSectionChange
    });
})();
