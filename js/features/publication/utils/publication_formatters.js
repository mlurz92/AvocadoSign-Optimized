window.publicationTabComponents = ((ns) => {
    if (!ns) {
        ns = {};
    }

    const formatters = {};

    function getFormattedCitationMarker(citationKey, lang = 'de') {
        if (!citationKey || typeof citationKey !== 'string') {
            console.warn("publication_formatters.getFormattedCitationMarker: Ungültiger Zitationsschlüssel.", citationKey);
            return '[?]';
        }
        if (typeof PUBLICATION_CONFIG === 'undefined' || !PUBLICATION_CONFIG.referenceManagement || !Array.isArray(PUBLICATION_CONFIG.referenceManagement.references)) {
            console.warn("publication_formatters.getFormattedCitationMarker: PUBLICATION_CONFIG.referenceManagement.references nicht verfügbar.");
            return `[${citationKey.replace(/\s+/g, '')}]`;
        }

        const refIndex = PUBLICATION_CONFIG.referenceManagement.references.findIndex(ref => ref.key === citationKey);

        if (refIndex !== -1) {
            return `[${refIndex + 1}]`;
        }
        console.warn(`publication_formatters.getFormattedCitationMarker: Zitationsschlüssel '${citationKey}' nicht in Referenzliste gefunden.`);
        return `[${citationKey.replace(/\s+/g, '')}?]`;
    }

    function generateFormattedReferenceListHTML(lang = 'de') {
        if (typeof PUBLICATION_CONFIG === 'undefined' || !PUBLICATION_CONFIG.referenceManagement || !Array.isArray(PUBLICATION_CONFIG.referenceManagement.references)) {
            console.warn("publication_formatters.generateFormattedReferenceListHTML: PUBLICATION_CONFIG.referenceManagement.references nicht verfügbar.");
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
                    let formattedText = ref.text;
                    // Hebe Journal-Informationen hervor (Beispiel, muss ggf. verfeinert werden)
                    // Versucht, Teile wie "Eur Radiol. 2025;..." oder "Int J Radiat Oncol Biol Phys. 2008;71(2):..." zu finden
                    formattedText = formattedText.replace(
                        /([A-Za-z\s.&]+[A-Za-z])\.?\s*(\d{4});?(\s*\d{1,4}\([\dA-Za-z\s-]+\))?[:;]?\s*(\d+-\d+|\d+)/,
                        (match, journal, year, volumeIssue, pages) => {
                            let journalPart = `<em>${journal.trim()}</em>.`;
                            let yearPart = year;
                            let volIssPart = volumeIssue ? ` <strong>${volumeIssue.trim()}</strong>` : '';
                            let pagesPart = pages ? `:${pages}` : '';
                            return `${journalPart} ${yearPart}${volIssPart}${pagesPart}`;
                        }
                    );
                     // Hebe DOI hervor
                    formattedText = formattedText.replace(
                        /(DOI:\s*)(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)/i,
                        '$1<a href="https://doi.org/$2" target="_blank" rel="noopener noreferrer">$2</a>'
                    );


                    listHTML += `<li id="ref-${ref.key || index + 1}">${formattedText}</li>`;
                } else {
                    listHTML += `<li id="ref-${ref.key || index + 1}">${lang === 'de' ? 'Ungültiger Referenzeintrag.' : 'Invalid reference entry.'}</li>`;
                }
            });
            listHTML += '</ol>';
        } else {
            listHTML += `<p class="text-warning">${lang === 'de' ? `Zitationsstil '${citationStyle}' wird derzeit nicht vollständig unterstützt. Anzeige als einfache Liste.` : `Citation style '${citationStyle}' is not fully supported. Displaying as a simple list.`}</p>`;
            listHTML += '<ul class="publication-reference-list basic-style">';
            references.forEach((ref, index) => {
                if (ref && typeof ref.text === 'string') {
                     listHTML += `<li id="ref-${ref.key || index + 1}"><strong>${getFormattedCitationMarker(ref.key, lang)}</strong> ${ref.text}</li>`;
                } else {
                    listHTML += `<li id="ref-${ref.key || index + 1}">${lang === 'de' ? 'Ungültiger Referenzeintrag.' : 'Invalid reference entry.'}</li>`;
                }
            });
            listHTML += '</ul>';
        }
        return listHTML;
    }

    formatters.getFormattedCitationMarker = getFormattedCitationMarker;
    formatters.generateFormattedReferenceListHTML = generateFormattedReferenceListHTML;

    ns.formatters = Object.freeze(formatters);

    return ns;

})(window.publicationTabComponents || {});
