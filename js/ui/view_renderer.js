const viewRenderer = (() => {

    function renderTabContent(tabId, renderFunction, ...args) {
        const containerId = `${tabId}-pane`;
        const container = document.getElementById(containerId);

        if (!container) {
            console.error(`Container #${containerId} nicht gefunden für Tab ${tabId}.`);
            const appContainer = document.getElementById('app-container');
            if (appContainer) {
                 ui_helpers.updateElementHTML(appContainer.id, `<div class="alert alert-danger m-3">Fehler: UI-Container für Tab '${tabId}' nicht gefunden.</div>`);
            }
            return;
        }

        if (typeof ui_helpers === 'undefined' || typeof ui_helpers.updateElementHTML !== 'function' || typeof ui_helpers.initializeTooltips !== 'function') {
            console.error("ui_helpers nicht verfügbar in renderTabContent.");
            container.innerHTML = `<p class="text-danger m-3">Kritischer UI-Fehler beim Laden von Tab ${tabId}.</p>`;
            return;
        }

        ui_helpers.updateElementHTML(containerId, '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade Inhalt...</span></div></div>');

        try {
            if (typeof renderFunction !== 'function') {
                throw new Error(`renderFunction für Tab ${tabId} ist keine Funktion.`);
            }
            const contentHTML = renderFunction(...args);
            ui_helpers.updateElementHTML(containerId, contentHTML || '<p class="text-muted p-3">Kein Inhalt für diesen Tab generiert.</p>');
            ui_helpers.initializeTooltips(container);
        } catch (error) {
            console.error(`Fehler beim Rendern von Tab ${tabId}:`, error);
            const errorMessage = `<div class="alert alert-danger m-3">Fehler beim Laden des Tabs ${tabId}: ${error.message}</div>`;
            ui_helpers.updateElementHTML(containerId, errorMessage);
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showToast === 'function') {
                 ui_helpers.showToast(`Fehler beim Laden des Tabs '${tabId}'. Details siehe Konsole.`, 'danger');
            }
        }
    }

    return Object.freeze({
        renderTabContent
    });
})();
