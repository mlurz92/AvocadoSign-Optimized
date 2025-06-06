const publikationController = (() => {

    let mainApp = null;
    let isInitialized = false;

    function _handleLanguageSwitch(event) {
        const newLang = event.target.checked ? 'en' : 'de';
        stateManager.setPublikationLang(newLang);
        mainApp.updateAndRender();
    }

    function _handleBfMetricChange(event) {
        const newMetric = event.target.value;
        stateManager.setPublikationBfMetric(newMetric);
        mainApp.updateAndRender();
    }

    function _handleSectionNavClick(event) {
        const link = event.target.closest('[data-section-id]');
        if (!link) return;
        event.preventDefault();
        const newSection = link.dataset.sectionId;
        stateManager.setPublikationSection(newSection);
        mainApp.updateAndRender();
    }

    function _handleDownloadClick(event) {
        const button = event.target.closest('#download-publication-section-md');
        if (!button) return;

        const sectionId = button.dataset.sectionId;
        const lang = button.dataset.lang;
        const bfMetric = stateManager.getPublikationBfMetric();
        const stats = statisticsService.calculateAllStats(dataProcessor.getFilteredData());

        const context = {
            lang: lang,
            kollektiv: stateManager.getCurrentKollektiv(),
            bfMetric: bfMetric,
            stats: stats,
            t2Criteria: t2CriteriaManager.getCriteria(),
            t2Logic: t2CriteriaManager.getLogic(),
            bruteForceResult: bruteForceManager.getBestResult()
        };

        try {
            const markdownContent = publicationGeneratorService.generateSection(sectionId, context, 'md');
            const filename = `Publikation_${sectionId}_${lang.toUpperCase()}`;
            exportService.exportMarkdown(markdownContent, filename);
        } catch (error) {
            console.error(`Fehler beim Generieren des Markdowns für Sektion ${sectionId}:`, error);
            uiHelpers.showToast('Fehler bei der Markdown-Generierung.', 'danger');
        }
    }

    function _addEventListeners() {
        const pane = document.getElementById('publikation-tab-pane');
        if (!pane) return;

        pane.addEventListener('change', (event) => {
            const target = event.target;
            if (target.id === 'publikation-sprache-switch') {
                _handleLanguageSwitch(event);
            } else if (target.id === 'publikation-bf-metric-select') {
                _handleBfMetricChange(event);
            }
        });

        pane.addEventListener('click', (event) => {
            if (event.target.closest('#publikation-sections-nav')) {
                _handleSectionNavClick(event);
            } else if (event.target.closest('#download-publication-section-md')) {
                _handleDownloadClick(event);
            }
        });
    }
    
    function updateView() {
        const lang = stateManager.getPublikationLang();
        const section = stateManager.getPublikationSection();
        const bfMetric = stateManager.getPublikationBfMetric();

        const langSwitch = document.getElementById('publikation-sprache-switch');
        if(langSwitch) langSwitch.checked = lang === 'en';
        
        const langLabel = document.getElementById('publikation-sprache-label');
        if(langLabel) langLabel.textContent = UI_TEXTS.publikationTab.spracheSwitchLabel[lang];

        const bfMetricSelect = document.getElementById('publikation-bf-metric-select');
        if(bfMetricSelect) {
            bfMetricSelect.value = bfMetric;
            const container = document.getElementById('publikation-bf-metric-container');
            if(container) {
                const showContainer = section === 'results' || section === 'tables' || section === 'figures';
                uiHelpers.toggleElementClass(container.id, 'd-none', !showContainer);
            }
        }
        
        document.querySelectorAll('#publikation-sections-nav .nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.sectionId === section);
        });
    }

    function init(appInterface) {
        if (isInitialized) return;
        mainApp = appInterface;
        _addEventListeners();
        isInitialized = true;
    }

    function renderAndGetContent() {
        const lang = stateManager.getPublikationLang();
        const section = stateManager.getPublikationSection();
        const bfMetric = stateManager.getPublikationBfMetric();
        const stats = statisticsService.calculateAllStats(dataProcessor.getFilteredData());

        const context = {
            lang: lang,
            kollektiv: stateManager.getCurrentKollektiv(),
            bfMetric: bfMetric,
            stats: stats,
            t2Criteria: t2CriteriaManager.getCriteria(),
            t2Logic: t2CriteriaManager.getLogic(),
            bruteForceResult: bruteForceManager.getBestResult()
        };

        const generatedContent = publicationGeneratorService.generateSection(section, context, 'html');
        return publicationRenderer.render(lang, section, bfMetric, generatedContent);
    }

    return Object.freeze({
        init,
        updateView,
        renderAndGetContent
    });

})();
