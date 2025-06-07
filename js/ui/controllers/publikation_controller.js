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
            // Scroll to the top of the content area after render
            setTimeout(() => {
                const contentArea = document.getElementById('publication-content-area');
                if (contentArea) contentArea.parentElement.scrollTop = 0;
            }, 100);
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
        if (target.id === 'publication-sprache-switch') {
            _handleLanguageSwitch(event);
        } else if (target.id === 'publication-bf-metric-select') {
            _handleBfMetricChange(event);
        } else if (target.closest('#publication-sections-nav')) {
            _handleSectionNavClick(event);
        } else if (target.closest('#download-publication-section-md')) {
            _handleDownloadClick(event);
        }
    }

    function _getPublicationContext(globallyEvaluatedData) {
        const lang = stateManager.getCurrentPublikationLang();
        const bfMetric = stateManager.getPublikationBfMetric();
        const appliedT2Criteria = t2CriteriaManager.getCriteria();
        const appliedT2Logic = t2CriteriaManager.getLogic();

        const stats = {};
        const kollektive = dataProcessor.getAvailableKollektive();
        kollektive.forEach(k => {
            const filteredData = dataProcessor.filterDataByKollektiv(globallyEvaluatedData, k);
            stats[k] = statisticsService.calculateAllStats(filteredData, appliedT2Criteria, appliedT2Logic);
        });

        const bfResult = bruteForceManager.getResultsForKollektiv('Gesamt');
        let bfStats = null;
        if (bfResult && bfResult.bestResult) {
            const gesamtData = dataProcessor.filterDataByKollektiv(globallyEvaluatedData, 'Gesamt');
            const bfEvaluated = t2CriteriaManager.evaluateDatasetWithCriteria(gesamtData, bfResult.bestResult.criteria, bfResult.bestResult.logic);
            bfStats = statisticsService.calculateDiagnosticPerformance(bfEvaluated, 't2', 'n');
        }
        
        if (stats.Gesamt) {
            stats.Gesamt.bruteforce = bfStats;
            if (bfResult && bfResult.bestResult) {
                const gesamtData = dataProcessor.filterDataByKollektiv(globallyEvaluatedData, 'Gesamt');
                const evaluatedForComparison = t2CriteriaManager.evaluateDatasetWithCriteria(gesamtData, bfResult.bestResult.criteria, bfResult.bestResult.logic);
                stats.Gesamt.comparison_as_vs_bf = statisticsService.compareDiagnosticMethods(evaluatedForComparison, 'as', 't2', 'n');
            }
        }

        return {
            lang,
            stats,
            bruteForceResult: bfResult,
            bfMetric,
            appliedT2Criteria,
            appliedT2Logic
        };
    }

    function renderContent(globallyEvaluatedData) {
        const lang = stateManager.getCurrentPublikationLang();
        const sectionId = stateManager.getCurrentPublikationSection();
        const bfMetric = stateManager.getPublikationBfMetric();

        const context = _getPublicationContext(globallyEvaluatedData);
        const sectionContent = publicationGeneratorService.generateSection(sectionId, context);
        
        return publicationRenderer.render(lang, sectionId, bfMetric, sectionContent);
    }
    
    function _addEventListeners() {
        if(paneElement) {
            paneElement.removeEventListener('change', _handleEvents);
            paneElement.removeEventListener('click', _handleEvents);
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
        const section = stateManager.getCurrentPublikationSection();
        const container = document.getElementById('publication-bf-metric-container');
        if (container) {
            const showContainer = section.startsWith('results') || section.startsWith('abstract') || section.startsWith('discussion');
            uiHelpers.toggleElementClass(container.id, 'd-none', !showContainer);
        }
        
        const contentAreaWrapper = document.getElementById('publication-content-area')?.parentElement;
        if (contentAreaWrapper) {
            contentAreaWrapper.scrollTop = 0;
        }

        const navLinks = document.querySelectorAll('#publication-sections-nav .nav-link');
        navLinks.forEach(link => {
            if (link.dataset.sectionId) {
                link.classList.toggle('active', link.dataset.sectionId === section);
            }
        });
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
        renderContent
    });

})();
