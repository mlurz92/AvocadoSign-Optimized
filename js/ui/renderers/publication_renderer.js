const publicationRenderer = (() => {

    function renderSectionContent(sectionId, lang, allKollektivStats, commonDataFromLogic, options = {}) {
        if (!sectionId || !lang || !allKollektivStats || !commonDataFromLogic || !options) {
            console.error("publicationRenderer.renderSectionContent: Fehlende oder ungültige Parameter.");
            const contentAreaError = document.getElementById('publikation-content-area');
            if (contentAreaError) {
                contentAreaError.innerHTML = '<p class="text-danger">Fehler: Notwendige Daten für die Sektionsanzeige fehlen oder sind ungültig.</p>';
            }
            return;
        }

        if (typeof publicationTextGenerator === 'undefined' || typeof publicationTextGenerator.getSectionText !== 'function') {
            console.error("publicationRenderer.renderSectionContent: publicationTextGenerator ist nicht verfügbar.");
            const contentAreaError = document.getElementById('publikation-content-area');
            if (contentAreaError) {
                contentAreaError.innerHTML = '<p class="text-danger">Interner Fehler: Text-Generierungsmodul nicht geladen.</p>';
            }
            return;
        }

        let completeSectionHtml = '<p class="text-warning">Inhalt konnte nicht generiert werden.</p>';
        try {
            completeSectionHtml = publicationTextGenerator.getSectionText(sectionId, lang, allKollektivStats, commonDataFromLogic, options);
        } catch (error) {
            console.error(`Fehler beim Generieren des Sektionsinhalts für '${sectionId}' (Sprache: ${lang}):`, error);
            completeSectionHtml = `<p class="text-danger">Fehler bei der Textgenerierung für Sektion '${sectionId}'. Details siehe Konsole.</p>`;
        }

        const contentArea = document.getElementById('publikation-content-area');
        if (contentArea) {
            contentArea.innerHTML = completeSectionHtml;
        } else {
            console.error("publicationRenderer.renderSectionContent: Container 'publikation-content-area' nicht im DOM gefunden.");
        }
    }

    return Object.freeze({
        renderSectionContent
    });

})();
