const publicationTabEventHandlers = (() => {

    let mainAppInterfaceRef = null;

    function handleSectionLinkClick(event) {
        event.preventDefault();
        if (!mainAppInterfaceRef || typeof mainAppInterfaceRef.renderCurrentTabContent !== 'function' || typeof state === 'undefined') {
            console.error("Abhängigkeiten für handleSectionLinkClick nicht initialisiert.");
            return;
        }
        const targetLink = event.target.closest('.publikation-section-link');
        if (targetLink && targetLink.dataset.sectionId) {
            const sectionId = targetLink.dataset.sectionId;
            state.setCurrentPublikationSection(sectionId);
            mainAppInterfaceRef.renderCurrentTabContent();
        }
    }

    function handleLanguageSwitchChange(event) {
        if (!mainAppInterfaceRef || typeof mainAppInterfaceRef.renderCurrentTabContent !== 'function' || typeof state === 'undefined') {
            console.error("Abhängigkeiten für handleLanguageSwitchChange nicht initialisiert.");
            return;
        }
        const newLang = event.target.checked ? 'en' : 'de';
        state.setCurrentPublikationLang(newLang);
        mainAppInterfaceRef.renderCurrentTabContent();
    }

    function handleBfMetricSelectChange(event) {
        if (!mainAppInterfaceRef || typeof mainAppInterfaceRef.renderCurrentTabContent !== 'function' || typeof state === 'undefined') {
            console.error("Abhängigkeiten für handleBfMetricSelectChange nicht initialisiert.");
            return;
        }
        const newMetric = event.target.value;
        state.setCurrentPublikationBruteForceMetric(newMetric);
        mainAppInterfaceRef.renderCurrentTabContent();
    }

    function handleDownloadDocxClick() {
        if (typeof exportService === 'undefined' || typeof exportService.exportPublicationToDocx !== 'function' || typeof state === 'undefined' || typeof publicationTextGenerator === 'undefined' || typeof publicationTabLogic === 'undefined' || typeof publicationTabLogic.allKollektivStats === 'undefined' || !publicationTabLogic.allKollektivStats) {
            console.error("Abhängigkeiten für DOCX-Export nicht verfügbar.");
            if (typeof ui_helpers !== 'undefined' && ui_helpers.showToast) {
                ui_helpers.showToast("Fehler: Exportfunktion nicht bereit.", "danger");
            }
            return;
        }

        const lang = state.getCurrentPublikationLang();
        const currentSectionId = state.getCurrentPublikationSection();
        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === currentSectionId || s.subSections.some(sub => sub.id === currentSectionId));
        const sectionsToExport = mainSectionConfig ? mainSectionConfig.subSections : [];

        if (sectionsToExport.length === 0 && currentSectionId !== 'referenzen_list') {
             const fallbackSection = PUBLICATION_CONFIG.sections.find(s => s.subSections.some(sub => sub.id === currentSectionId));
             if (fallbackSection) sectionsToExport.push(...fallbackSection.subSections.filter(sub => sub.id === currentSectionId));
             else {
                ui_helpers.showToast(`Keine exportierbaren Inhalte für Sektion '${currentSectionId}' gefunden.`, 'warning');
                return;
             }
        } else if (currentSectionId === 'referenzen_list' && !sectionsToExport.some(s => s.id === 'referenzen_list')){
            const refSectionConf = PUBLICATION_CONFIG.sections.find(s => s.id === 'referenzen');
            if (refSectionConf) sectionsToExport.push(...refSectionConf.subSections.filter(sub => sub.id === 'referenzen_list'));
        }


        let markdownContent = "";
        let title = UI_TEXTS.publikationTab.sectionLabels[mainSectionConfig?.labelKey] || currentSectionId;

        if (sectionsToExport.length > 0) {
            title = UI_TEXTS.publikationTab.sectionLabels[mainSectionConfig.labelKey] || mainSectionConfig.labelKey;
            sectionsToExport.forEach(subSection => {
                const subSectionTitle = lang === 'de' ? subSection.titleDe : subSection.titleEn;
                markdownContent += `## ${subSectionTitle}\n\n`;
                markdownContent += publicationTextGenerator.getSectionTextAsMarkdown(subSection.id, lang, publicationTabLogic.allKollektivStats, publicationTabLogic.commonDataForGenerator) + "\n\n";
            });
        } else if (currentSectionId === 'referenzen_list') {
            title = UI_TEXTS.publikationTab.sectionLabels['referenzen'] || 'Referenzen';
            markdownContent += `## ${lang === 'de' ? 'Literaturverzeichnis' : 'References'}\n\n`;
            markdownContent += publicationTextGenerator.getSectionTextAsMarkdown('referenzen_list', lang, publicationTabLogic.allKollektivStats, publicationTabLogic.commonDataForGenerator) + "\n\n";
        }


        if (markdownContent.trim() === "") {
            ui_helpers.showToast("Kein Inhalt zum Exportieren für die aktuelle Sektion gefunden.", "warning");
            return;
        }
        const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
        const kollektiv = state.getCurrentKollektiv();
        exportService.exportPublicationToDocx(markdownContent, safeTitle, lang, kollektiv);
    }


    function initialize(mainAppInterface) {
        if (!mainAppInterface) {
            console.error("publicationTabEventHandlers: mainAppInterface ist nicht initialisiert.");
            return;
        }
        mainAppInterfaceRef = mainAppInterface;

        const sectionNav = document.getElementById('publikation-sections-nav');
        if (sectionNav) {
            sectionNav.removeEventListener('click', handleSectionLinkClick);
            sectionNav.addEventListener('click', handleSectionLinkClick);
        } else {
            console.warn("Publikations-Sektionsnavigation nicht gefunden für Event Listener.");
        }

        const langSwitch = document.getElementById('publikation-sprache-switch');
        if (langSwitch) {
            langSwitch.removeEventListener('change', handleLanguageSwitchChange);
            langSwitch.addEventListener('change', handleLanguageSwitchChange);
        } else {
            console.warn("Publikations-Sprachschalter nicht gefunden für Event Listener.");
        }

        const bfMetricSelect = document.getElementById('publikation-bf-metric-select');
        if (bfMetricSelect) {
            bfMetricSelect.removeEventListener('change', handleBfMetricSelectChange);
            bfMetricSelect.addEventListener('change', handleBfMetricSelectChange);
        } else {
            console.warn("Publikations-BF-Metrik-Auswahl nicht gefunden für Event Listener.");
        }

        const downloadDocxButton = document.getElementById('btn-download-publication-docx');
        if (downloadDocxButton) {
            downloadDocxButton.removeEventListener('click', handleDownloadDocxClick);
            downloadDocxButton.addEventListener('click', handleDownloadDocxClick);
        } else {
            console.warn("Publikations-DOCX-Download-Button nicht gefunden für Event Listener.");
        }
    }

    return Object.freeze({
        initialize
    });

})();
