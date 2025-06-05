const publicationRenderer = (() => {

    function renderFullPublicationSection(htmlContent, targetElementId, sectionId, lang) {
        if (!targetElementId || typeof targetElementId !== 'string') {
            console.error("PublicationRenderer: Target element ID is missing or invalid.");
            return;
        }
        const targetElement = document.getElementById(targetElementId);
        if (!targetElement) {
            console.error(`PublicationRenderer: Target element with ID '${targetElementId}' not found.`);
            const fallbackContainer = document.getElementById('publikation-tab-pane');
            if (fallbackContainer) {
                 ui_helpers.updateElementHTML(fallbackContainer.id, `<p class="text-danger m-3">Interner Fehler: Haupt-Content-Bereich (ID: ${targetElementId}) für Publikations-Tab nicht gefunden.</p>`);
            }
            return;
        }

        if (htmlContent === null || htmlContent === undefined) {
            const errorMsg = (lang === 'de' ? 
                (UI_TEXTS?.publikationTab?.publicationContentNotAvailable?.de || 'Fehler: Kein Inhalt zum Anzeigen für diesen Publikationsabschnitt vorhanden.') : 
                (UI_TEXTS?.publikationTab?.publicationContentNotAvailable?.en || 'Error: No content available to display for this publication section.')
            );
            ui_helpers.updateElementHTML(targetElementId, `<p class="text-warning p-3">${errorMsg}</p>`);
            return;
        }

        ui_helpers.updateElementHTML(targetElementId, String(htmlContent));

        if (typeof publicationTabLogic !== 'undefined' && typeof publicationTabLogic.renderDynamicContentForSection === 'function') {
            try {
                setTimeout(() => {
                    publicationTabLogic.renderDynamicContentForSection(sectionId, lang);
                    if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.initializeTooltips === 'function') {
                        ui_helpers.initializeTooltips(targetElement);
                    }
                }, 50);
            } catch (error) {
                console.error(`PublicationRenderer: Fehler beim Rendern dynamischer Inhalte für Sektion '${sectionId}':`, error);
                const errorToastMsg = lang === 'de' ? `Fehler beim Laden dynamischer Diagramme für Sektion '${sectionId}'.` : `Error loading dynamic charts for section '${sectionId}'.`;
                if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showToast === 'function') {
                    ui_helpers.showToast(errorToastMsg, 'danger');
                }
            }
        } else {
            console.warn("PublicationRenderer: publicationTabLogic.renderDynamicContentForSection ist nicht verfügbar.");
             if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.initializeTooltips === 'function') {
                ui_helpers.initializeTooltips(targetElement);
            }
        }
    }

    return Object.freeze({
        renderFullPublicationSection
    });

})();
