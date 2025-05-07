const exportTabLogic = (() => {

    function render(currentKollektiv) {
        if (typeof uiComponents === 'undefined' || typeof uiComponents.createExportOptions !== 'function') {
            console.error("exportTabLogic: uiComponents.createExportOptions ist nicht verfügbar.");
            return '<div class="alert alert-danger m-3">Fehler: UI-Komponente für Exportoptionen konnte nicht geladen werden.</div>';
        }
        const exportOptionsHTML = uiComponents.createExportOptions(currentKollektiv);
        return `<div class="container-fluid py-3">${exportOptionsHTML}</div>`;
    }

    return Object.freeze({
        render
    });

})();