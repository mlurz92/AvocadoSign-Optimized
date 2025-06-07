const viewRenderer = (() => {
    let currentActiveTab = null;
    let mainContentWrapper = null;
    let spinnerElement = null;
    let spinnerTimeout = null;

    function init() {
        mainContentWrapper = document.getElementById('main-content-wrapper');
        spinnerElement = document.getElementById('loading-spinner');
        if (!mainContentWrapper || !spinnerElement) {
            console.error('Main content wrapper or spinner not found!');
            return;
        }
    }

    function showSpinner() {
        clearTimeout(spinnerTimeout);
        spinnerTimeout = setTimeout(() => {
            if (spinnerElement) {
                spinnerElement.classList.remove('d-none');
            }
        }, APP_CONFIG.UI_SETTINGS.SPINNER_DELAY_MS);
    }

    function hideSpinner() {
        clearTimeout(spinnerTimeout);
        if (spinnerElement) {
            spinnerElement.classList.add('d-none');
        }
    }

    function renderTab(tabId, processedData, bruteForceResults = null) {
        if (!mainContentWrapper) {
            console.error('Main content wrapper is not initialized.');
            return;
        }

        if (currentActiveTab === tabId && tabId !== 'publikation-tab') {
            // No need to re-render if it's the same tab and not the publication tab (which can change content dynamically within the tab)
            return;
        }

        showSpinner();
        
        // Hide all tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('show', 'active');
        });

        // Deactivate all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const targetPane = document.getElementById(`${tabId}-pane`);
        const targetLink = document.querySelector(`.nav-link[data-bs-target="#${tabId}-pane"]`);

        if (targetPane && targetLink) {
            // Activate the selected tab pane and link
            targetPane.classList.add('show', 'active');
            targetLink.classList.add('active');

            currentActiveTab = tabId; // Update current active tab

            // Render content for the specific tab
            try {
                switch (tabId) {
                    case 'data-tab':
                        dataTabLogic.render(processedData);
                        break;
                    case 'auswertung-tab':
                        auswertungTabLogic.render(processedData);
                        break;
                    case 'statistik-tab':
                        statistikTabLogic.render(processedData);
                        break;
                    case 'praesentation-tab':
                        praesentationTabLogic.render(processedData);
                        break;
                    case 'publikation-tab':
                        publikationTabLogic.render(processedData, bruteForceResults);
                        break;
                    case 'export-tab':
                        exportService.renderExportOptions(state.getCurrentKollektiv(), bruteForceResults?.hasResults || false, processedData && processedData.length > 0);
                        break;
                    default:
                        mainContentWrapper.innerHTML = `<div class="alert alert-warning">${APP_CONFIG.UI_TEXTS.global.tabNotFound}: ${tabId}</div>`;
                        break;
                }
            } catch (error) {
                console.error(`Error rendering tab ${tabId}:`, error);
                mainContentWrapper.innerHTML = `<div class="alert alert-danger">${APP_CONFIG.UI_TEXTS.global.tabRenderError}: ${error.message}</div>`;
                ui_helpers.showToast(`${APP_CONFIG.UI_TEXTS.global.tabRenderErrorShort}: ${error.message}`, 'danger');
            }
        } else {
            console.error(`Tab pane or link not found for ID: ${tabId}`);
            mainContentWrapper.innerHTML = `<div class="alert alert-warning">${APP_CONFIG.UI_TEXTS.global.tabNotFound}: ${tabId}</div>`;
            ui_helpers.showToast(`${APP_CONFIG.UI_TEXTS.global.tabNotFoundShort}: ${tabId}`, 'warning');
        }
        ui_helpers.initializeTooltips(document.body);
        hideSpinner();
    }

    function getCurrentActiveTab() {
        return currentActiveTab;
    }

    return Object.freeze({
        init,
        renderTab,
        getCurrentActiveTab
    });

})();
