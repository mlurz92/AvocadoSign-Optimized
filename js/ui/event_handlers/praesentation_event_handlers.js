const praesentationEventHandlers = (() => {

    function setupPraesentationTabEventHandlers() {
        const tabPane = document.getElementById('praesentation-tab-pane');
        if (!tabPane) return;

        tabPane.addEventListener('change', (event) => {
            if (event.target.name === 'praesViewSelect' && typeof praesentationTabLogic !== 'undefined') {
                praesentationTabLogic.handleViewChange(event.target.value);
            } else if (event.target.id === 'praes-study-select' && typeof praesentationTabLogic !== 'undefined') {
                praesentationTabLogic.handleStudyChange(event.target.value);
            }
        });

        tabPane.addEventListener('click', (event) => {
            const targetButton = event.target.closest('button[data-export-action]');
            if (targetButton && typeof praesentationTabLogic !== 'undefined') {
                const actionId = targetButton.dataset.exportAction;
                praesentationTabLogic.handleExportAction(actionId);
            }

            const chartExportButton = event.target.closest('.chart-download-btn');
            if (chartExportButton && chartExportButton.parentElement.classList.contains('praes-chart-export-buttons')) {
                const chartContainer = chartExportButton.closest('.praes-chart-container-wrapper');
                const chartContainerId = chartContainer?.querySelector('[id^="praes-chart-"]')?.id;
                const format = chartExportButton.getAttribute('aria-label')?.includes('PNG') ? 'png' : 'svg';
                const kollektiv = state.getCurrentPresentationView() === 'as-pur' ? state.getCurrentKollektiv() : praesentationTabLogic.getCurrentComparisonKollektiv();
                const chartName = chartContainer?.dataset.chartName || chartContainerId?.replace(/^praes-chart-/, '') || 'PraesentationChart';

                if (chartContainerId && format && kollektiv && chartManager) {
                    if (format === 'png') {
                        chartManager.exportChartAsPNG(chartContainerId, kollektiv, chartName);
                    } else {
                        chartManager.exportChartAsSVG(chartContainerId, kollektiv, chartName);
                    }
                }
            }
        });

        document.addEventListener('kollektivChanged', handleDataOrCriteriaChangeForPraesentation);
        document.addEventListener('t2CriteriaApplied', handleDataOrCriteriaChangeForPraesentation);

        const observer = new MutationObserver((mutationsList, observerInstance) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActiveNow = tabPane.classList.contains('active') && tabPane.classList.contains('show');
                    const wasActivePreviously = mutation.oldValue?.includes('active show');
                    if (isActiveNow && !wasActivePreviously) {
                        if (typeof praesentationTabLogic !== 'undefined' && typeof praesentationTabLogic.refresh === 'function') {
                            praesentationTabLogic.refresh();
                        }
                    }
                }
            }
        });
        observer.observe(tabPane, { attributes: true, attributeOldValue: true });
    }

    function handleDataOrCriteriaChangeForPraesentation() {
        const praesentationTabPane = document.getElementById('praesentation-tab-pane');
        if (praesentationTabPane && praesentationTabPane.classList.contains('active') && praesentationTabPane.classList.contains('show')) {
            if (typeof praesentationTabLogic !== 'undefined' && typeof praesentationTabLogic.refresh === 'function') {
                praesentationTabLogic.refresh();
            }
        } else if (typeof praesentationTabLogic !== 'undefined' && typeof praesentationTabLogic.handleGlobalDataChange === 'function') {
             const moduleConfig = viewRenderer.tabModulesConfig ? viewRenderer.tabModulesConfig['praesentation-tab-pane'] : null;
             if(moduleConfig && moduleConfig.initialized){
                praesentationTabLogic.handleGlobalDataChange();
             }
        }
    }

    return Object.freeze({
        setupPraesentationTabEventHandlers
    });
})();
