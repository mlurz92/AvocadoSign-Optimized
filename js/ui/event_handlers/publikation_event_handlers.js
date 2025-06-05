const publikationEventHandlers = (() => {

    function handleLanguageChange(event) {
        if (!event || !event.target) return;
        const newLang = event.target.checked ? 'en' : 'de';
        stateManager.updateUserSettings({ publikationLang: newLang });
        if (typeof mainAppInterface !== 'undefined' && mainAppInterface.refreshCurrentTab) {
            mainAppInterface.refreshCurrentTab();
        }
    }

    function handleBruteForceMetricChange(event) {
        if (!event || !event.target) return;
        const newMetric = event.target.value;
        stateManager.updateUserSettings({ publikationBruteForceMetric: newMetric });
        if (typeof mainAppInterface !== 'undefined' && mainAppInterface.refreshCurrentTab) {
            mainAppInterface.refreshCurrentTab();
        }
    }

    function handleExportSectionMarkdown() {
        const currentSectionId = राज्य.userSettings.publikationSection;
        const currentLang = राज्य.userSettings.publikationLang;
        const currentKollektiv = राज्य.currentKollektiv;

        if (!publicationTabLogic || !publicationTabLogic.currentAggregatedPublicationData) {
            const errorMsg = currentLang === 'de' ? 
                (UI_TEXTS?.TOOLTIP_CONTENT?.exportTab?.noDataToExport?.de || 'Export nicht möglich: Publikationsdaten nicht geladen.') : 
                (UI_TEXTS?.TOOLTIP_CONTENT?.exportTab?.noDataToExport?.en || 'Export not possible: Publication data not loaded.');
            if (typeof ui_helpers !== 'undefined' && ui_helpers.showToast) ui_helpers.showToast(errorMsg, 'warning');
            return;
        }
        if (!publicationMainController || typeof publicationMainController.getFullPublicationSectionHTML !== 'function' || 
            !ui_helpers || typeof ui_helpers.htmlToMarkdown !== 'function' || 
            !exportService || typeof exportService.exportPublicationSectionMarkdown !== 'function') {
            const errorMsg = currentLang === 'de' ? 'Export nicht möglich: Notwendige Export-Module fehlen oder sind fehlerhaft.' : 'Export not possible: Required export modules missing or faulty.';
            if (typeof ui_helpers !== 'undefined' && ui_helpers.showToast) ui_helpers.showToast(errorMsg, 'danger');
            return;
        }

        const sectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === currentSectionId);
        if (!sectionConfig) {
             const errorMsg = currentLang === 'de' ? `Export nicht möglich: Sektion '${currentSectionId}' ist unbekannt.` : `Export not possible: Section '${currentSectionId}' is unknown.`;
            if (typeof ui_helpers !== 'undefined' && ui_helpers.showToast) ui_helpers.showToast(errorMsg, 'warning');
            return;
        }
        
        const sectionHtmlContent = publicationMainController.getFullPublicationSectionHTML(publicationTabLogic.currentAggregatedPublicationData, currentSectionId, currentLang);
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sectionHtmlContent;
        
        tempDiv.querySelectorAll('.figure-content').forEach(el => {
            const figurePlaceholderContainer = el.querySelector('.figure-placeholder');
            const figurePlaceholderText = figurePlaceholderContainer ? figurePlaceholderContainer.textContent : (currentLang === 'de' ? '[Abbildung an dieser Stelle]' : '[Figure at this position]');
            el.innerHTML = `<p><em>${figurePlaceholderText}</em></p>`;
        });
        tempDiv.querySelectorAll('button, .btn, [data-bs-toggle="tooltip"], .tooltip, style, script, .publication-subsection-title, h1.display-6, h2.publication-subsection-title').forEach(el => el.remove());
        
        // Attempt to clean up excessive newlines from markdown conversion of block elements
        let markdownContent = ui_helpers.htmlToMarkdown(tempDiv.innerHTML);
        markdownContent = markdownContent.replace(/\n{3,}/g, '\n\n'); // Reduce 3+ newlines to 2

        let sectionNameForFile = currentSectionId;
        if (sectionConfig.labelKey && UI_TEXTS.publikationTab && UI_TEXTS.publikationTab.sectionLabels && UI_TEXTS.publikationTab.sectionLabels[sectionConfig.labelKey]) {
            sectionNameForFile = UI_TEXTS.publikationTab.sectionLabels[sectionConfig.labelKey];
        }
        sectionNameForFile = sectionNameForFile.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_').substring(0,30);


        exportService.exportPublicationSectionMarkdown(markdownContent, sectionNameForFile, currentKollektiv, currentLang);
    }

    function handleSectionChangeDelegated(event) {
        const navLink = event.target.closest('.nav-link[data-section-id]');
        if (navLink && navLink.dataset.sectionId) {
            stateManager.updateUserSettings({ publikationSection: navLink.dataset.sectionId });
            if (typeof mainAppInterface !== 'undefined' && mainAppInterface.refreshCurrentTab) {
                mainAppInterface.refreshCurrentTab();
            }
        }
    }

    function init() {
        const langSwitch = document.getElementById('publikation-sprache-switch');
        if (langSwitch) {
            langSwitch.removeEventListener('change', handleLanguageChange);
            langSwitch.addEventListener('change', handleLanguageChange);
        }

        const sectionNavElement = document.getElementById('publikation-section-nav');
        if (sectionNavElement) {
            sectionNavElement.removeEventListener('click', handleSectionChangeDelegated);
            sectionNavElement.addEventListener('click', handleSectionChangeDelegated);
        }
        
        const bfMetricSelect = document.getElementById('publikation-brute-force-metric-select');
        if (bfMetricSelect) {
            bfMetricSelect.removeEventListener('change', handleBruteForceMetricChange);
            bfMetricSelect.addEventListener('change', handleBruteForceMetricChange);
        }

        const exportSectionMdBtn = document.getElementById('export-publikation-section-md-btn');
        if (exportSectionMdBtn) {
            exportSectionMdBtn.removeEventListener('click', handleExportSectionMarkdown);
            exportSectionMdBtn.addEventListener('click', handleExportSectionMarkdown);
        }
    }

    return Object.freeze({
        init
    });
})();
