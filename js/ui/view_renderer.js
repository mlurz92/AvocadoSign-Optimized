const viewRenderer = (() => {

    function _renderTab(tabId, renderFunction, ...args) {
        const containerId = `${tabId}-pane`;
        const container = document.getElementById(containerId);
        if (!container) {
            return;
        }
        ui_helpers.updateElementHTML(containerId, '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade...</span></div></div>');
        
        try {
            const contentHTML = renderFunction(...args);
            ui_helpers.updateElementHTML(containerId, contentHTML || '<p class="text-muted p-3">Kein Inhalt verfügbar.</p>');
            ui_helpers.initializeTooltips(container);
        } catch (error) {
            const errorMessage = `<div class="alert alert-danger m-3">Fehler beim Laden des Tabs: ${error.message}</div>`;
            ui_helpers.updateElementHTML(containerId, errorMessage);
        }
    }

    function renderDatenTab(data, sortState) {
        _renderTab('daten-tab', () => {
             const toggleButtonHTML = `<div class="d-flex justify-content-end mb-3"><button id="daten-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${TOOLTIP_CONTENT.datenTable.expandAll}">Alle Details anzeigen <i class="fas fa-chevron-down ms-1"></i></button></div>`;
            const tableHTML = dataTabLogic.createDatenTableHTML(data, sortState);
            return toggleButtonHTML + `<div class="table-responsive">${tableHTML}</div>`;
        });
    }

    function renderAuswertungTab(data, currentCriteria, currentLogic, sortState, currentKollektiv, workerAvailable) {
        _renderTab('auswertung-tab', () => {
            const dashboardHTML = uiComponents.createDashboardCard('Altersverteilung', '', 'chart-dash-age') + uiComponents.createDashboardCard('Geschlecht', '', 'chart-dash-gender');
            const criteriaControlsHTML = uiComponents.createT2CriteriaControls(currentCriteria, currentLogic);
            const bruteForceCardHTML = uiComponents.createBruteForceCard(currentKollektiv, workerAvailable);
            const auswertungTableCardHTML = auswertungTabLogic.createAuswertungTableCardHTML(data, sortState, currentCriteria, currentLogic);
            
            return `<div class="row g-2 mb-3" id="auswertung-dashboard">${dashboardHTML}</div>
                    <div class="row g-4">
                        <div class="col-12">${criteriaControlsHTML}</div>
                        <div class="col-12" id="t2-metrics-overview"></div>
                        <div class="col-12">${bruteForceCardHTML}</div>
                        <div class="col-12">${auswertungTableCardHTML}</div>
                    </div>`;
        });
    }

    function renderStatistikTab(processedData, appliedCriteria, appliedLogic, layout, kollektiv1, kollektiv2, currentGlobalKollektiv) {
         _renderTab('statistik-tab', () => {
            return statistikTabLogic.createStatistikTabHTML(processedData, appliedCriteria, appliedLogic, layout, kollektiv1, kollektiv2, currentGlobalKollektiv);
         });
    }

    function renderPresentationTab(view, selectedStudyId, currentGlobalKollektiv, processedData, appliedCriteria, appliedLogic) {
        _renderTab('praesentation-tab', () => {
            const presentationData = praesentationTabLogic.preparePresentationData(view, selectedStudyId, currentGlobalKollektiv, processedData, appliedCriteria, appliedLogic);
            return praesentationTabLogic.createPresentationTabContent(view, presentationData, selectedStudyId, currentGlobalKollektiv);
        });
    }

    function renderPublikationTab() {
        publicationController.renderPublicationTab();
    }

    function renderExportTab(currentKollektiv) {
        _renderTab('export-tab', () => {
             return uiComponents.createExportOptions(currentKollektiv);
        });
    }

    return Object.freeze({
        renderDatenTab,
        renderAuswertungTab,
        renderStatistikTab,
        renderPresentationTab,
        renderPublikationTab,
        renderExportTab
    });
})();
