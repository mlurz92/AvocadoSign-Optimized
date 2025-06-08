const manuscriptHealthCheck = (() => {

    const rules = {
        WORD_COUNT_ABSTRACT_MAX: 300,
        WORD_COUNT_KEY_RESULTS_MAX: 75,
        REFERENCE_LIMIT: 35,
        FORBIDDEN_TERMS: ['novel', 'new', 'unique', 'ground-breaking', 'significant', 'significantly', 'cases']
    };

    function _countWords(text) {
        if (!text || typeof text !== 'string') return 0;
        return text.trim().split(/\s+/).length;
    }

    function _checkWordCount(text, limit, sectionName) {
        const wordCount = _countWords(text);
        if (wordCount > limit) {
            return {
                type: 'warning',
                section: sectionName,
                message: `Wortanzahl überschritten. Limit: ${limit}, Aktuell: ${wordCount} (+${wordCount - limit}).`
            };
        }
        return null;
    }

    function _checkForbiddenTerms(text, sectionName) {
        const foundTerms = new Set();
        const regex = new RegExp(`\\b(${rules.FORBIDDEN_TERMS.join('|')})\\b`, 'gi');
        let match;
        while ((match = regex.exec(text)) !== null) {
            foundTerms.add(match[0].toLowerCase());
        }

        if (foundTerms.size > 0) {
            return {
                type: 'info',
                section: sectionName,
                message: `Überprüfen Sie die Verwendung folgender Begriffe: <strong>${[...foundTerms].join(', ')}</strong>. ('significant' nur im statistischen Sinne mit p-Wert verwenden, 'cases' durch spezifischere Begriffe wie 'patients' oder 'participants' ersetzen).`
            };
        }
        return null;
    }

    function _checkReferenceCount(text) {
        const refCount = (text.match(/<li>/g) || []).length;
        if (refCount > rules.REFERENCE_LIMIT) {
            return {
                type: 'warning',
                section: 'Referenzen',
                message: `Anzahl der Referenzen überschritten. Limit: ${rules.REFERENCE_LIMIT}, Aktuell: ${refCount}.`
            };
        }
        return null;
    }

    function performCheck(sectionId, lang, allKollektivStats, commonData) {
        const issues = [];
        let textContent = '';
        
        if (sectionId === 'abstract') {
            textContent = publicationTextGenerator.getSectionText('abstract_main', lang, allKollektivStats, commonData);
            const abstractText = textContent.match(/<div class="abstract-content">(.*?)<\/div>/s)?.[1] || '';
            const keyResultsText = textContent.match(/<ul class="key-results-list">(.*?)<\/ul>/s)?.[1] || '';
            
            issues.push(_checkWordCount(abstractText.replace(/<[^>]*>?/gm, ' '), rules.WORD_COUNT_ABSTRACT_MAX, 'Abstract'));
            issues.push(_checkWordCount(keyResultsText.replace(/<[^>]*>?/gm, ' '), rules.WORD_COUNT_KEY_RESULTS_MAX, 'Key Results'));
        } else if (sectionId === 'references') {
             textContent = publicationTextGenerator.getSectionText('references_main', lang, allKollektivStats, commonData);
             issues.push(_checkReferenceCount(textContent));
        }
        
        if(textContent) {
            issues.push(_checkForbiddenTerms(textContent.toLowerCase(), UI_TEXTS.publikationTab.sectionLabels[sectionId]));
        }

        return issues.filter(issue => issue !== null);
    }
    
    function renderHealthCheckResults(issues) {
        if (!issues || issues.length === 0) {
            return `<div class="alert alert-success p-2 small"><i class="fas fa-check-circle me-2"></i>Keine formalen Probleme gemäß Style Guide gefunden.</div>`;
        }

        let html = '<div class="manuscript-health-issues">';
        issues.forEach(issue => {
            const iconMap = { warning: 'fa-exclamation-triangle text-warning', info: 'fa-info-circle text-info', error: 'fa-times-circle text-danger' };
            html += `<div class="alert alert-${issue.type === 'info' ? 'primary' : issue.type} p-2 small mb-2">
                        <i class="fas ${iconMap[issue.type]} me-2"></i>
                        <strong>${issue.section}:</strong> ${issue.message}
                     </div>`;
        });
        html += '</div>';
        return html;
    }

    return Object.freeze({
        performCheck,
        renderHealthCheckResults
    });

})();
