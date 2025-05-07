const viewRenderer = (() => {

    function _renderTabContent(tabId, renderFunction) {
        const containerId = `${tabId}-pane`;
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container #${containerId} nicht gefunden für Tab ${tabId}.`);
            return;
        }
        ui_helpers.updateElementHTML(containerId, '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade Inhalt...</span></div></div>');
        try {
            const contentHTML = renderFunction();
            ui_helpers.updateElementHTML(containerId, contentHTML || '<p class="text-muted p-3">Kein Inhalt generiert.</p>');
            ui_helpers.initializeTooltips(container);
            if(tabId === 'daten-tab' && document.getElementById('daten-table-body')) {
                ui_helpers.attachRowCollapseListeners(document.getElementById('daten-table-body'));
            } else if (tabId === 'auswertung-tab' && document.getElementById('auswertung-table-body')) {
                ui_helpers.attachRowCollapseListeners(document.getElementById('auswertung-table-body'));
            }
        } catch (error) {
            console.error(`Fehler beim Rendern von Tab ${tabId}:`, error);
            let shortErrorMessage = `Fehler beim Laden des Tabs '${tabId}'.`;
            if (error && typeof error.message === 'string' && error.message.length > 0) {
                 shortErrorMessage += ` (Details in Konsole)`;
            }
            const displayErrorMessage = `<div class="alert alert-danger m-3">Fehler beim Laden des Tabs: ${error.message}</div>`;
            ui_helpers.updateElementHTML(containerId, displayErrorMessage);
            ui_helpers.showToast(shortErrorMessage, 'danger');
        }
    }

    function renderDatenTab(data, sortState) {
        _renderTabContent('daten-tab', () => {
             if (!data) throw new Error("Daten für Daten-Tabelle nicht verfügbar.");
             if (typeof datenTabLogic === 'undefined' || typeof datenTabLogic.render !== 'function') {
                throw new Error("datenTabLogic.render ist nicht verfügbar.");
             }
             return datenTabLogic.render(data, sortState);
        });
    }

    function renderAuswertungTab(data, currentCriteria, currentLogic, sortState, currentKollektiv, bfWorkerAvailable, lastBruteForceResults) {
         _renderTabContent('auswertung-tab', () => {
             if (!data || !currentCriteria || !currentLogic) throw new Error("Daten oder Kriterien für Auswertungstab nicht verfügbar.");
              if (typeof auswertungTabLogic === 'undefined' || typeof auswertungTabLogic.render !== 'function') {
                throw new Error("auswertungTabLogic.render ist nicht verfügbar.");
             }
             return auswertungTabLogic.render(data, currentCriteria, currentLogic, sortState, currentKollektiv, bfWorkerAvailable, lastBruteForceResults);
        });
    }

    function renderStatistikTab(processedData, appliedCriteria, appliedLogic, layout, kollektiv1, kollektiv2, currentGlobalKollektiv) {
        _renderTabContent('statistik-tab', () => {
             if (!processedData) throw new Error("Statistik-Daten nicht verfügbar.");
             if (typeof statistikTabLogic === 'undefined' || typeof statistikTabLogic.render !== 'function') {
                throw new Error("statistikTabLogic.render ist nicht verfügbar.");
             }
             return statistikTabLogic.render(processedData, appliedCriteria, appliedLogic, layout, kollektiv1, kollektiv2, currentGlobalKollektiv);
        });
    }

    function renderPublikationTab(activeSection, lang, currentGlobalKollektiv, processedDataWithT2, allProcessedDataFull, appliedCriteria, appliedLogic, lastBruteForceResults) {
        _renderTabContent('publikation-tab', () => {
            if (!allProcessedDataFull) throw new Error("Publikations-Basisdaten (allProcessedDataFull) nicht verfügbar.");
            if (!processedDataWithT2) throw new Error("Publikations-Daten (processedDataWithT2) nicht verfügbar.");
            if (typeof publikationTabLogic === 'undefined' || typeof publikationTabLogic.render !== 'function') {
                throw new Error("publikationTabLogic.render ist nicht verfügbar.");
            }
            return publikationTabLogic.render(activeSection, lang, processedDataWithT2, appliedCriteria, appliedLogic, currentGlobalKollektiv, allProcessedDataFull, lastBruteForceResults);
        });
    }

    function renderPresentationTab(view, selectedStudyId, currentGlobalKollektiv, processedData, appliedCriteria, appliedLogic) {
        _renderTabContent('praesentation-tab', () => {
            if (!processedData) throw new Error("Präsentations-Daten nicht verfügbar.");
            if (typeof praesentationTabLogic === 'undefined' || typeof praesentationTabLogic.render !== 'function') {
                throw new Error("praesentationTabLogic.render ist nicht verfügbar.");
            }
            return praesentationTabLogic.render(view, selectedStudyId, currentGlobalKollektiv, processedData, appliedCriteria, appliedLogic);
        });
    }

    function renderExportTab(currentKollektiv) {
        _renderTabContent('export-tab', () => {
            if (typeof exportTabLogic === 'undefined' || typeof exportTabLogic.render !== 'function') {
                throw new Error("exportTabLogic.render ist nicht verfügbar.");
            }
            return exportTabLogic.render(currentKollektiv);
        });
    }

    return Object.freeze({
        renderDatenTab,
        renderAuswertungTab,
        renderStatistikTab,
        renderPublikationTab,
        renderPresentationTab,
        renderExportTab
    });
})();