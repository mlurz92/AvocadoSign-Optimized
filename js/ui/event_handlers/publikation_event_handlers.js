const publikationEventHandlers = (() => {

    function _handleSectionLinkClick(event) {
        event.preventDefault();
        const sectionId = event.currentTarget.dataset.sectionId;
        if (sectionId && typeof stateManager !== 'undefined' && typeof stateManager.setCurrentPublikationSection === 'function') {
            stateManager.setCurrentPublikationSection(sectionId);
            // Das UI-Update (aktiver Link und Inhaltsänderung) wird durch das 'stateChanged'-Event
            // in main.js ausgelöst, welches mainAppInterface.updateAllUIComponents/handlePublikationSettingsChange aufruft.
            if (mainAppInterface && typeof mainAppInterface.handlePublikationSettingsChange === 'function') {
                mainAppInterface.handlePublikationSettingsChange();
            }
        } else {
            console.error("Fehler beim Wechseln des Publikationsabschnitts.", sectionId);
        }
    }

    function _handleSpracheSwitchChange(event) {
        const newLang = event.target.checked ? 'en' : 'de';
        if (typeof stateManager !== 'undefined' && typeof stateManager.setCurrentPublikationLang === 'function') {
            stateManager.setCurrentPublikationLang(newLang);
            if (mainAppInterface && typeof mainAppInterface.handlePublikationSettingsChange === 'function') {
                mainAppInterface.handlePublikationSettingsChange();
            }
        } else {
            console.error("stateManager.setCurrentPublikationLang ist nicht verfügbar.");
        }
    }

    function _handleBfMetricChange(event) {
        const newMetric = event.target.value;
        if (typeof stateManager !== 'undefined' && typeof stateManager.setCurrentPublikationBruteForceMetric === 'function') {
            stateManager.setCurrentPublikationBruteForceMetric(newMetric);
            if (mainAppInterface && typeof mainAppInterface.handlePublikationSettingsChange === 'function') {
                mainAppInterface.handlePublikationSettingsChange(); 
            }
        } else {
            console.error("stateManager.setCurrentPublikationBruteForceMetric ist nicht verfügbar.");
        }
    }
    
    function _handlePublicationActionClick(event) {
        const button = event.target.closest('button[data-action]');
        if (!button || !mainAppInterface || typeof mainAppInterface.handleExportRequest !== 'function') return;

        const action = button.dataset.action;
        const sectionName = button.dataset.sectionName; // z.B. methoden_studienanlage
        const tableKey = button.dataset.tableKey; // z.B. patientenCharakteristikaTabelle
        
        let exportType = '';
        let options = {};

        if (action === 'export-md' && sectionName) {
            const mainSectionType = sectionName.split('_')[0]; // 'methoden' oder 'ergebnisse' oder 'referenzen'
            if (mainSectionType === 'methoden') exportType = 'publikationMethodenMD';
            else if (mainSectionType === 'ergebnisse') exportType = 'publikationErgebnisseMD';
            else if (mainSectionType === 'referenzen' && sectionName === 'referenzen_liste') exportType = 'publikationReferenzenMD';
            options.sectionName = sectionName;
        } else if (action === 'export-tsv' && tableKey) {
            exportType = 'publicationTableTSV';
            options.tableKey = tableKey;
        } else if (action === 'export-bibtex') {
            exportType = 'referencesBibTeX';
        }

        if (exportType) {
            mainAppInterface.handleExportRequest(exportType, options);
        } else {
            console.warn("Unbekannte Publikations-Aktion oder fehlende Daten-Attribute:", action, button.dataset);
        }
    }


    function register() {
        const publikationTabPane = document.getElementById('publikation-tab-pane');
        if (!publikationTabPane) {
            console.warn("PublikationEventHandlers: Publikation-Tab-Pane ('publikation-tab-pane') nicht gefunden. Handler nicht registriert.");
            return;
        }

        const sectionNav = publikationTabPane.querySelector('#publikation-sections-nav');
        if (sectionNav) {
            sectionNav.removeEventListener('click', _handleSectionLinkDelegated); // Ensure no double listeners
            sectionNav.addEventListener('click', _handleSectionLinkDelegated);
        } else {
            console.warn("PublikationEventHandlers: Sektionsnavigation ('#publikation-sections-nav') nicht gefunden.");
        }

        const spracheSwitch = publikationTabPane.querySelector('#publikation-sprache-switch');
        if (spracheSwitch) {
            spracheSwitch.removeEventListener('change', _handleSpracheSwitchChange);
            spracheSwitch.addEventListener('change', _handleSpracheSwitchChange);
        } else {
            console.warn("PublikationEventHandlers: Sprachumschalter ('#publikation-sprache-switch') nicht gefunden.");
        }

        const bfMetricSelect = publikationTabPane.querySelector('#publikation-bf-metric-select');
        if (bfMetricSelect) {
            bfMetricSelect.removeEventListener('change', _handleBfMetricChange);
            bfMetricSelect.addEventListener('change', _handleBfMetricChange);
        } else {
            console.warn("PublikationEventHandlers: Brute-Force Metrik Select ('#publikation-bf-metric-select') nicht gefunden.");
        }
        
        const contentArea = publikationTabPane.querySelector('#publikation-content-area');
        if(contentArea) {
            contentArea.removeEventListener('click', _handlePublicationActionDelegated);
            contentArea.addEventListener('click', _handlePublicationActionDelegated);
        } else {
            console.warn("PublikationEventHandlers: Inhaltsbereich ('#publikation-content-area') für delegierte Export-Handler nicht gefunden.");
        }
    }
    
    function _handleSectionLinkDelegated(event) {
        const link = event.target.closest('.publikation-section-link');
        if (link && link.dataset.sectionId) {
            _handleSectionLinkClick({ currentTarget: link, preventDefault: () => event.preventDefault() });
        }
    }
    
    function _handlePublicationActionDelegated(event) {
        const button = event.target.closest('button[data-action]');
        if (button) {
            _handlePublicationActionClick({target: button});
        }
    }

    return Object.freeze({
        register
    });
})();
