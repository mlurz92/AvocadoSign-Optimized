const publikationEventHandlers = (() => {

    function handleExportAllMarkdown() {
        if (!exportService || !kollektivStore || !t2CriteriaManager || !bruteForceManager || !state) {
            ui_helpers.showToast("Exportfunktion oder benötigte Datenmodule nicht verfügbar.", "danger");
            return;
        }
        ui_helpers.showToast("Export aller Publikationssektionen als Markdown ZIP wird vorbereitet...", "info");
        try {
            const rawData = kollektivStore.getCurrentKollektivRawData();
            const appliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
            const appliedT2Logic = t2CriteriaManager.getAppliedLogic();
            const allBruteForceResults = bruteForceManager.getAllResults();
            const currentKollektiv = state.getCurrentKollektiv();

            exportService.exportCategoryZip('md-zip', rawData, allBruteForceResults, currentKollektiv, appliedT2Criteria, appliedT2Logic);
        } catch (error) {
            ui_helpers.showToast("Fehler beim Export der Publikationssektionen.", "danger");
            console.error("Fehler beim Export aller Publikationssektionen:", error);
        }
    }


    function setupPublicationTabEventHandlers() {
        const tabPane = document.getElementById('publikation-tab-pane');
        if (!tabPane) return;

        tabPane.addEventListener('change', (event) => {
            if (event.target.id === 'publication-language-switch' && typeof publikationTabLogic !== 'undefined') {
                publikationTabLogic.handleLanguageChange(event.target.value);
            } else if (event.target.id === 'publication-bf-metric-select' && typeof publikationTabLogic !== 'undefined') {
                publikationTabLogic.handleBruteForceMetricChange(event.target.value);
            }
        });

        tabPane.addEventListener('click', (event) => {
            const navLink = event.target.closest('#publication-sections-nav .list-group-item-action');
            if (navLink && navLink.dataset.sectionId && typeof publikationTabLogic !== 'undefined') {
                event.preventDefault();
                if (!navLink.classList.contains('disabled') && !navLink.classList.contains('active')) {
                    publikationTabLogic.handleSectionChange(navLink.dataset.sectionId);
                }
            }

            const exportAllButton = event.target.closest('#btn-export-publication-md-all');
            if (exportAllButton) {
                handleExportAllMarkdown();
            }
        });

        document.addEventListener('kollektivChanged', handleDataOrCriteriaChangeForPublication);
        document.addEventListener('t2CriteriaApplied', handleDataOrCriteriaChangeForPublication);

        const observer = new MutationObserver((mutationsList, observerInstance) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActiveNow = tabPane.classList.contains('active') && tabPane.classList.contains('show');
                    const wasActivePreviously = mutation.oldValue?.includes('active show');
                     if (isActiveNow && !wasActivePreviously) {
                        if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.refresh === 'function') {
                           publikationTabLogic.refresh();
                        }
                    }
                }
            }
        });
        observer.observe(tabPane, { attributes: true, attributeOldValue: true });
    }

    function handleDataOrCriteriaChangeForPublication() {
        const publikationTabPane = document.getElementById('publikation-tab-pane');
         if (publikationTabPane && publikationTabPane.classList.contains('active') && publikationTabPane.classList.contains('show')) {
            if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.refresh === 'function') {
                publikationTabLogic.refresh();
            }
        } else if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.handleGlobalDataChange === 'function') {
            const moduleConfig = viewRenderer.tabModulesConfig ? viewRenderer.tabModulesConfig['publikation-tab-pane'] : null;
            if(moduleConfig && moduleConfig.initialized){
               publikationTabLogic.handleGlobalDataChange();
            }
        }
    }

    return Object.freeze({
        setupPublicationTabEventHandlers
    });

})();
