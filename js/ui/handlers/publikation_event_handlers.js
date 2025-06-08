const publikationEventHandlers = (() => {

    function handlePublikationSpracheChange(checkbox, appController) {
        if (!checkbox || !appController || typeof appController.refreshCurrentTab !== 'function') {
            return;
        }
        const newLang = checkbox.checked ? 'en' : 'de';
        if (state.setCurrentPublikationLang(newLang)) {
            appController.refreshCurrentTab();
        }
    }

    function handlePublikationBfMetricChange(selectElement, appController) {
        if (!selectElement || !appController || typeof appController.refreshCurrentTab !== 'function') {
            return;
        }
        const newMetric = selectElement.value;
        if (state.setCurrentPublikationBruteForceMetric(newMetric)) {
            appController.refreshCurrentTab();
        }
    }

    function handlePublikationSectionChange(sectionId, appController) {
        if (!sectionId || !appController || typeof appController.refreshCurrentTab !== 'function') {
            return;
        }
        if (state.setCurrentPublikationSection(sectionId)) {
            appController.refreshCurrentTab();
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
