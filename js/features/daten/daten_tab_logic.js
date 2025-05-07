const datenTabLogic = (() => {

    function render(data, sortState) {
        if (typeof uiViewLogic === 'undefined' || typeof uiViewLogic.createDatenTableHTML !== 'function') {
            console.error("datenTabLogic: uiViewLogic.createDatenTableHTML ist nicht verfügbar.");
            return '<div class="alert alert-danger m-3">Fehler: UI-Logik für Datentabelle konnte nicht geladen werden.</div>';
        }
        if (!data) {
            console.warn("datenTabLogic.render: Keine Daten zum Rendern erhalten.");
             return '<div class="alert alert-warning m-3">Keine Daten für die Anzeige vorhanden.</div>';
        }
        if (!sortState) {
            console.warn("datenTabLogic.render: Kein Sortierungsstatus erhalten.");
        }

        const tableHTML = uiViewLogic.createDatenTableHTML(data, sortState);
        const toggleButtonHTML = `
            <div class="d-flex justify-content-end mb-2">
                <button id="daten-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${TOOLTIP_CONTENT.datenTable.expandAll || 'Alle Details ein-/ausblenden'}">
                    Alle Details <i class="fas fa-chevron-down ms-1"></i>
                </button>
            </div>`;

        return toggleButtonHTML + tableHTML;
    }

    return Object.freeze({
        render
    });

})();