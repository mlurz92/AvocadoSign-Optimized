const statistikEventHandlers = (() => {

    function handleDataOrCriteriaChange() {
        const statistikTabPane = document.getElementById('statistik-tab-pane');
        if (statistikTabPane && statistikTabPane.classList.contains('active') && statistikTabPane.classList.contains('show')) {
            if (typeof statistikTabLogic !== 'undefined' && typeof statistikTabLogic.refresh === 'function') {
                statistikTabLogic.refresh();
            }
        } else if (typeof statistikTabLogic !== 'undefined' && typeof statistikTabLogic.handleGlobalDataChange === 'function') {
            const moduleConfig = viewRenderer.tabModulesConfig ? viewRenderer.tabModulesConfig['statistik-tab-pane'] : null;
            if(moduleConfig && moduleConfig.initialized){
                 statistikTabLogic.handleGlobalDataChange();
            }
        }
    }

    function setupStatistikTabEventHandlers() {
        document.addEventListener('kollektivChanged', handleDataOrCriteriaChange);
        document.addEventListener('t2CriteriaApplied', handleDataOrCriteriaChange);

        const tabPane = document.getElementById('statistik-tab-pane');
        if (tabPane) {
            const observer = new MutationObserver((mutationsList, observerInstance) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const isActiveNow = tabPane.classList.contains('active') && tabPane.classList.contains('show');
                        const wasActivePreviously = mutation.oldValue?.includes('active show');
                        if (isActiveNow && !wasActivePreviously) {
                            if (typeof statistikTabLogic !== 'undefined' && typeof statistikTabLogic.refresh === 'function') {
                                statistikTabLogic.refresh();
                            }
                        }
                    }
                }
            });
            observer.observe(tabPane, { attributes: true, attributeOldValue: true });
        }
    }

    return Object.freeze({
        setupStatistikTabEventHandlers
    });

})();
