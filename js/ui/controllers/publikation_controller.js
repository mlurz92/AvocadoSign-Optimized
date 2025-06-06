const publikationController = (() => {

    let mainApp = null;
    let isInitialized = false;
    let paneElement = null;

    function _handleLanguageSwitch(event) {
        const newLang = event.target.checked ? 'en' : 'de';
        if (stateManager.setPublikationLang(newLang)) {
            mainApp.updateAndRender();
        }
    }

    function _handleBfMetricChange(event) {
        const newMetric = event.target.value;
        if (stateManager.setPublikationBfMetric(newMetric)) {
            mainApp.updateAndRender();
        }
    }

    function _handleSectionNavClick(event) {
        const link = event.target.closest('a[data-section-id]');
        if (!link) return;
        event.preventDefault();

        const newSection = link.dataset.sectionId;
        if (stateManager.setPublikationSection(newSection)) {
            mainApp.updateAndRender();
        }
    }

    function _handleDownloadClick(event) {
        const button = event.target.closest('#download-publication-section-md');
        if (!button) return;

        const { sectionId, lang } = button.dataset;
        exportService.exportPublicationSection(sectionId, lang);
    }
    
    function _handleEvents(event) {
        const target = event.target;

        if (target.id === 'publikation-sprache-switch') {
            _handleLanguageSwitch(event);
        } else if (target.id === 'publication-bf-metric-select') {
            _handleBfMetricChange(event);
        } else if (target.closest('#publikation-sections-nav')) {
            _handleSectionNavClick(event);
        } else if (target.closest('#download-publication-section-md')) {
            _handleDownloadClick(event);
        }
    }

    function _addEventListeners() {
        if(paneElement) {
            paneElement.addEventListener('change', _handleEvents);
            paneElement.addEventListener('click', _handleEvents);
        }
    }
    
    function _removeEventListeners() {
        if(paneElement) {
            paneElement.removeEventListener('change', _handleEvents);
            paneElement.removeEventListener('click', _handleEvents);
        }
    }
    
    function updateView() {
        const section = stateManager.getPublikationSection();
        const container = document.getElementById('publication-bf-metric-container');
        if (container) {
            const showContainer = section.startsWith('ergebnisse') || section.startsWith('abstract');
            container.classList.toggle('d-none', !showContainer);
        }
        
        const contentArea = document.getElementById('publication-content-area');
        if (contentArea) {
            contentArea.scrollTop = 0;
        }
    }

    function init(app) {
        if (isInitialized) return;
        mainApp = app;
        paneElement = document.getElementById('publikation-tab-pane');
        isInitialized = true;
    }
    
    function onTabEnter() {
        _addEventListeners();
        updateView();
    }
    
    function onTabExit() {
        _removeEventListeners();
    }

    return Object.freeze({
        init,
        onTabEnter,
        onTabExit,
        updateView
    });

})();
