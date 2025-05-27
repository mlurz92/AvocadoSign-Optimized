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

    function handleGeneratePublikationStats(mainAppInterface) {
        if (!mainAppInterface || typeof mainAppInterface.refreshCurrentTab !== 'function') {
            console.error("publikationEventHandlers.handleGeneratePublikationStats: Ungültiges mainAppInterface.");
            ui_helpers.showToast("Interner Fehler: Schnittstelle zur Hauptanwendung nicht verfügbar.", "danger");
            return;
        }
        if (typeof publikationTabLogic === 'undefined' || typeof publikationTabLogic.ensureStatsAreCalculated !== 'function') {
            console.error("publikationEventHandlers.handleGeneratePublikationStats: publikationTabLogic.ensureStatsAreCalculated nicht verfügbar.");
            ui_helpers.showToast("Interner Fehler: Statistikmodul nicht bereit.", "danger");
            return;
        }

        ui_helpers.showToast("Starte Berechnung der Publikationsstatistiken...", "info");
        
        publikationTabLogic.ensureStatsAreCalculated(mainAppInterface, (success, errorMsg) => {
            if (success) {
                ui_helpers.showToast("Statistiken für Publikation erfolgreich generiert.", "success");
            } else {
                ui_helpers.showToast(`Fehler bei der Generierung der Publikationsstatistiken: ${errorMsg || 'Unbekannter Fehler'}`, "danger");
            }
            // Das Neurendern des Tabs wird bereits durch ensureStatsAreCalculated -> triggerStatsCalculation -> refreshCurrentTab gehandhabt.
        });
    }

    return Object.freeze({
        handlePublikationSpracheChange,
        handlePublikationBfMetricChange,
        handlePublikationSectionChange,
        handleGeneratePublikationStats
    });
})();
