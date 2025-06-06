const publikationEventHandlers = (() => {

    function handlePublikationSpracheChange(checkboxElement) {
        if (!checkboxElement || typeof publicationController === 'undefined' || typeof publicationController.handleLanguageChange !== 'function') {
            console.error("publikationEventHandlers.handlePublikationSpracheChange: Ungültige Parameter oder publicationController nicht verfügbar.");
            return;
        }
        const newLang = checkboxElement.checked ? 'en' : 'de';
        publicationController.handleLanguageChange(newLang);
    }

    function handlePublikationBfMetricChange(selectElement) {
        if (!selectElement || typeof publicationController === 'undefined' || typeof publicationController.handleBfMetricChange !== 'function') {
            console.error("publikationEventHandlers.handlePublikationBfMetricChange: Ungültige Parameter oder publicationController nicht verfügbar.");
            return;
        }
        const newMetric = selectElement.value;
        publicationController.handleBfMetricChange(newMetric);
    }

    function handlePublikationSectionChange(sectionId) {
        if (!sectionId || typeof publicationController === 'undefined' || typeof publicationController.handleSectionChange !== 'function') {
            console.error("publikationEventHandlers.handlePublikationSectionChange: Ungültige Parameter oder publicationController nicht verfügbar.");
            return;
        }
        publicationController.handleSectionChange(sectionId);
    }

    return Object.freeze({
        handlePublikationSpracheChange,
        handlePublikationBfMetricChange,
        handlePublikationSectionChange
    });

})();
