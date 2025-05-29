const referenceManager = (() => {
    let _usedReferenceKeys = [];
    let _referencesData = null;

    function _getReferences() {
        if (!_referencesData) {
            _referencesData = typeof APP_CONFIG !== 'undefined' && APP_CONFIG.REFERENCES_FOR_PUBLICATION
                ? cloneDeep(APP_CONFIG.REFERENCES_FOR_PUBLICATION)
                : {};
        }
        return _referencesData;
    }

    function resetUsedReferences() {
        _usedReferenceKeys = [];
    }

    function getShortCitation(referenceKey) {
        const references = _getReferences();
        if (references && references[referenceKey] && typeof references[referenceKey].shortCitation === 'string') {
            return references[referenceKey].shortCitation;
        }
        return referenceKey || '[Unknown Reference]';
    }

    function cite(referenceKey) {
        const references = _getReferences();
        if (!referenceKey || !references[referenceKey]) {
            console.warn(`ReferenceManager: Schlüssel '${referenceKey}' nicht in APP_CONFIG.REFERENCES_FOR_PUBLICATION gefunden.`);
            return `[REF_NOT_FOUND: ${referenceKey}]`;
        }

        let index = _usedReferenceKeys.indexOf(referenceKey);
        if (index === -1) {
            _usedReferenceKeys.push(referenceKey);
            index = _usedReferenceKeys.length - 1;
        }
        return `[${index + 1}]`;
    }

    function getBibliographyHTML(lang = 'de') {
        const references = _getReferences();
        if (_usedReferenceKeys.length === 0) {
            return `<p><em>${lang === 'de' ? 'Keine Referenzen zitiert.' : 'No references cited.'}</em></p>`;
        }

        let html = '<ol class="publication-references-list">';
        _usedReferenceKeys.forEach((key, index) => {
            const refData = references[key];
            if (refData && typeof refData.fullCitation === 'string') {
                let fullCitation = refData.fullCitation;
                if (key === 'RADIOLOGY_STYLE_GUIDE') {
                    const currentDate = new Date();
                    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getFullYear()}`;
                    fullCitation = fullCitation.replace('[CURRENT_DATE_HERE]', formattedDate);
                    fullCitation = fullCitation.replace('[URL_TO_RADIOLOGY_AUTHOR_INSTRUCTIONS_HERE]', 'https://www.rsna.org/radiology/author-instructions');
                }
                html += `<li>${fullCitation}</li>`;
            } else {
                html += `<li>Referenz für Schlüssel '${key}' nicht vollständig definiert.</li>`;
            }
        });
        html += '</ol>';
        return html;
    }

    function getBibliographyMarkdown(lang = 'de') {
        const references = _getReferences();
        if (_usedReferenceKeys.length === 0) {
            return lang === 'de' ? '*Keine Referenzen zitiert.*\n' : '*No references cited.*\n';
        }

        let markdown = "";
        _usedReferenceKeys.forEach((key, index) => {
            const refData = references[key];
            if (refData && typeof refData.fullCitation === 'string') {
                let fullCitation = refData.fullCitation;
                 if (key === 'RADIOLOGY_STYLE_GUIDE') {
                    const currentDate = new Date();
                    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getFullYear()}`;
                    fullCitation = fullCitation.replace('[CURRENT_DATE_HERE]', formattedDate);
                    fullCitation = fullCitation.replace('[URL_TO_RADIOLOGY_AUTHOR_INSTRUCTIONS_HERE]', 'https://www.rsna.org/radiology/author-instructions');
                }
                markdown += `${index + 1}. ${fullCitation}\n`;
            } else {
                markdown += `${index + 1}. Referenz für Schlüssel '${key}' nicht vollständig definiert.\n`;
            }
        });
        return markdown;
    }


    return Object.freeze({
        cite,
        getBibliographyHTML,
        getBibliographyMarkdown,
        getShortCitation,
        resetUsedReferences
    });
})();
