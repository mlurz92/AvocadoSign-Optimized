const publicationTabComponents = ((existingComponents) => {

    const formatters = {};

    function getFormattedCitationMarker(citationKey, lang = 'de') {
        if (!citationKey || typeof citationKey !== 'string') {
            return '[?]';
        }
        if (typeof PUBLICATION_CONFIG === 'undefined' || !PUBLICATION_CONFIG.referenceManagement || !Array.isArray(PUBLICATION_CONFIG.referenceManagement.references)) {
            console.warn("publication_formatters: PUBLICATION_CONFIG.referenceManagement.references nicht verfügbar.");
            return `[${citationKey.replace(/\s+/g, '')}]`;
        }

        const refIndex = PUBLICATION_CONFIG.referenceManagement.references.findIndex(ref => ref.key === citationKey);

        if (refIndex !== -1) {
            return `[${refIndex + 1}]`;
        }
        console.warn(`publication_formatters: Zitationsschlüssel '${citationKey}' nicht in Referenzliste gefunden.`);
        return `[${citationKey.replace(/\s+/g, '')}?]`;
    }

    function generateFormattedReferenceListHTML(lang = 'de') {
        if (typeof PUBLICATION_CONFIG === 'undefined' || !PUBLICATION_CONFIG.referenceManagement || !Array.isArray(PUBLICATION_CONFIG.referenceManagement.references)) {
            console.warn("publication_formatters: PUBLICATION_CONFIG.referenceManagement.references nicht verfügbar.");
            return `<p class="text-danger">${lang === 'de' ? 'Fehler: Referenzliste konnte nicht geladen werden.' : 'Error: Reference list could not be loaded.'}</p>`;
        }

        const references = PUBLICATION_CONFIG.referenceManagement.references;
        const citationStyle = PUBLICATION_CONFIG.referenceManagement.citationStyle || 'vancouver';

        if (references.length === 0) {
            return `<p class="text-muted">${lang === 'de' ? 'Keine Referenzen vorhanden.' : 'No references available.'}</p>`;
        }

        let listHTML = '';

        if (citationStyle === 'vancouver') {
            listHTML += '<ol class="publication-reference-list vancouver-style">';
            references.forEach((ref, index) => {
                if (ref && typeof ref.text === 'string') {
                    const formattedText = ref.text
                        .replace(/\. (DOI: .*)/, '. $1')
                        .replace(/(\d{4});(\d{1,3}\([0-9 Suppl]+\))?:/, '$1;<strong>$2</strong>:') // Journal Vol(Issue):
                        .replace(/(\d{4}\.\s*(?:Published online|DOI).*)/, '<span class="text-muted">$1</span>');


                    listHTML += `<li id="ref-${ref.key || index + 1}">${formattedText}</li>`;
                }
            });
            listHTML += '</ol>';
        } else {
            listHTML += `<p class="text-warning">${lang === 'de' ? `Zitationsstil '${citationStyle}' wird derzeit nicht vollständig unterstützt. Anzeige als einfache Liste.` : `Citation style '${citationStyle}' is not fully supported. Displaying as a simple list.`}</p>`;
            listHTML += '<ul class="publication-reference-list basic-style">';
            references.forEach((ref, index) => {
                if (ref && typeof ref.text === 'string') {
                     listHTML += `<li id="ref-${ref.key || index + 1}"><strong>[${ref.key || index + 1}]</strong> ${ref.text}</li>`;
                }
            });
            listHTML += '</ul>';
        }
        return listHTML;
    }

    formatters.getFormattedCitationMarker = getFormattedCitationMarker;
    formatters.generateFormattedReferenceListHTML = generateFormattedReferenceListHTML;

    existingComponents = {
        ...(existingComponents || {}),
        formatters: Object.freeze(formatters)
    };

    return existingComponents;

})(window.publicationTabComponents || {});
