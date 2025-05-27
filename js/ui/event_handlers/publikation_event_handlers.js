const publikationEventHandlers = (() => {

    function handlePublikationSpracheChange(checkbox, mainAppInterface) {
        if (!checkbox || !mainAppInterface || typeof mainAppInterface.updateGlobalUIState !== 'function' || typeof mainAppInterface.refreshCurrentTab !== 'function') {
            console.error("publikationEventHandlers.handlePublikationSpracheChange: Ungültige Parameter.");
            return;
        }
        const newLang = checkbox.checked ? 'en' : 'de';
        if (state.setCurrentPublikationLang(newLang)) {
            mainAppInterface.updateGlobalUIState();
            if (state.getActiveTabId() === 'publikation-tab') {
                mainAppInterface.refreshCurrentTab();
            }
        }
    }

    function handlePublikationBfMetricChange(selectElement, mainAppInterface) {
        if (!selectElement || !mainAppInterface || typeof mainAppInterface.updateGlobalUIState !== 'function' || typeof mainAppInterface.refreshCurrentTab !== 'function') {
            console.error("publikationEventHandlers.handlePublikationBfMetricChange: Ungültige Parameter.");
            return;
        }
        const newMetric = selectElement.value;
        if (state.setCurrentPublikationBruteForceMetric(newMetric)) {
            mainAppInterface.updateGlobalUIState();
            if (state.getActiveTabId() === 'publikation-tab') {
                mainAppInterface.refreshCurrentTab();
            }
        }
    }

    function handlePublikationSectionChange(sectionId, mainAppInterface) {
        if (!sectionId || !mainAppInterface || typeof mainAppInterface.updateGlobalUIState !== 'function' || typeof mainAppInterface.refreshCurrentTab !== 'function') {
            console.error("publikationEventHandlers.handlePublikationSectionChange: Ungültige Parameter.");
            return;
        }
        if (state.setCurrentPublikationSection(sectionId)) {
            mainAppInterface.updateGlobalUIState();
            if (state.getActiveTabId() === 'publikation-tab') {
                mainAppInterface.refreshCurrentTab();
            }
            const contentArea = document.getElementById('publikation-content-area');
            if (contentArea) {
                contentArea.scrollTop = 0;
            }
        }
    }

    return Object.freeze({
        handlePublikationSpracheChange,
        handlePublikationBfMetricChange,
        handlePublikationSectionChange
    });
})();
