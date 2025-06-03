const publicationTextGenerator = (() => {

    function fCI(metric, digits = 1, isPercent = true, lang = 'de') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return 'N/A';

        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 'N/A';
            let numStrToFormat = val;
            let formattedNum;
            if (isP) {
                formattedNum = formatPercent(numStrToFormat, d, 'N/A');
            } else {
                formattedNum = formatNumber(numStrToFormat, d, 'N/A', lang === 'en');
            }
            return formattedNum;
        };

        const valStr = formatSingleValue(metric.value, digits, isPercent);
        if (valStr === 'N/A') return valStr;

        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper) && isFinite(metric.ci.lower) && isFinite(metric.ci.upper)) {
            const lowerStr = formatSingleValue(metric.ci.lower, digits, isPercent);
            const upperStr = formatSingleValue(metric.ci.upper, digits, isPercent);
            if (lowerStr === 'N/A' || upperStr === 'N/A') return valStr;
            
            const ciLabelKey = lang === 'de' ? 'KI' : 'CI';
            const ciText = `95%-${ciLabelKey}`;

            let mainValForDisplay = valStr;
            let lowerValForDisplay = lowerStr;
            let upperValForDisplay = upperStr;

            if(isPercent){
                mainValForDisplay = String(mainValForDisplay).replace('%','');
                lowerValForDisplay = String(lowerValForDisplay).replace('%','');
                upperValForDisplay = String(upperValForDisplay).replace('%','');
                return `${mainValForDisplay} (${ciText}: ${lowerValForDisplay}\u00A0–\u00A0${upperValForDisplay})%`;
            } else {
                 return `${mainValForDisplay} (${ciText}: ${lowerValForDisplay}\u00A0–\u00A0${upperValForDisplay})`;
            }
        }
        return valStr;
    }

    function _getPubElementReferenceLabel(elementKey, lang, elementType = 'table') {
        const elements = PUBLICATION_CONFIG.publicationElements;
        let path = elementKey.split('.');
        let current = elements;
        for (let i = 0; i < path.length; i++) {
            if (current && current[path[i]]) {
                current = current[path[i]];
            } else {
                return `Element [${elementKey}]`;
            }
        }
        if (current && current.referenceLabel) return current.referenceLabel;
        if (current && lang === 'de' && current.referenceLabelDe) return current.referenceLabelDe;
        if (current && lang === 'en' && current.referenceLabelEn) return current.referenceLabelEn;
        if (current && current.titleDe && lang === 'de') return current.titleDe.split(':')[0]; // Fallback: "Tabelle 1"
        if (current && current.titleEn && lang === 'en') return current.titleEn.split(':')[0]; // Fallback: "Table 1"
        
        return `${elementType === 'table' ? (lang === 'de' ? 'Tabelle' : 'Table') : (lang === 'de' ? 'Abbildung' : 'Figure')} [${elementKey}]`;
    }

    function _getSafeLink(elementKey) {
         const elements = PUBLICATION_CONFIG.publicationElements;
         let path = elementKey.split('.');
         let current = elements;
         for (let i = 0; i < path.length; i++) {
             if (current && current[path[i]]) {
                 current = current[path[i]];
             } else {
                 return '#unknown-element';
             }
         }
         return current && current.id ? `#${current.id}` : '#unknown-element-id';
    }


    function getSectionText(sectionId, lang, allKollektivStats, commonData, options = {}) {
        if (!PUBLICATION_CONTENT_TEMPLATES) {
            console.error("PUBLICATION_CONTENT_TEMPLATES nicht geladen.");
            return `<p class="text-danger">Fehler: Textvorlagen nicht verfügbar.</p>`;
        }

        const templateFunction = PUBLICATION_CONTENT_TEMPLATES.getTemplate(lang, sectionId);

        if (typeof templateFunction === 'function') {
            try {
                const enrichedCommonData = {
                    ...commonData,
                    references: { // Ensure all expected references are available
                        ...(APP_CONFIG.REFERENCES_FOR_PUBLICATION || {}),
                        ...(commonData.references || {})
                    },
                    getPubElementReferenceLabel: (elementKey, elementType) => _getPubElementReferenceLabel(elementKey, lang, elementType),
                    getSafeLink: _getSafeLink,
                    fCI: (metric, digits, isPercent) => fCI(metric, digits, isPercent, lang),
                    formatNumber: (num, digits, placeholder, useStd) => formatNumber(num, digits, placeholder, lang === 'en' || useStd),
                    formatPercent: (num, digits, placeholder) => formatPercent(num, digits, placeholder),
                    getPValueText: (pValue) => getPValueText(pValue, lang),
                    getKollektivDisplayName: getKollektivDisplayName,
                    getStatisticalSignificanceSymbol: getStatisticalSignificanceSymbol
                };
                const currentAppliedCriteria = options.appliedCriteria || (typeof t2CriteriaManager !== 'undefined' ? t2CriteriaManager.getAppliedCriteria() : getDefaultT2Criteria());
                const currentAppliedLogic = options.appliedLogic || (typeof t2CriteriaManager !== 'undefined' ? t2CriteriaManager.getAppliedLogic() : APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC);

                const templateOptions = {
                    ...options,
                    appliedCriteria: currentAppliedCriteria,
                    appliedLogic: currentAppliedLogic
                };

                return templateFunction(enrichedCommonData, allKollektivStats, templateOptions);
            } catch (error) {
                console.error(`Fehler bei der Ausführung der Template-Funktion für Sektion '${sectionId}' (Sprache: ${lang}):`, error);
                return `<p class="text-danger">Fehler bei der Textgenerierung für Sektion '${sectionId}'. Details siehe Konsole.</p>`;
            }
        } else {
            return `<p class="text-warning">Text für Sektion '${sectionId}' (Sprache: ${lang}) nicht implementiert oder Template nicht gefunden.</p>`;
        }
    }

    function getSectionTextAsMarkdown(sectionId, lang, allKollektivStats, commonData, options = {}) {
        const htmlContent = getSectionText(sectionId, lang, allKollektivStats, commonData, options);

        if (htmlContent.includes('<p class="text-danger">') || htmlContent.includes('<p class="text-warning">')) {
            return htmlContent.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, ''); // Return error message as is
        }

        let markdown = htmlContent
            .replace(/<p>(.*?)<\/p>/gs, '$1\n\n')
            .replace(/<h3>(.*?)<\/h3>/gs, (match, p1) => `### ${p1.replace(/<a.*?>(.*?)<\/a>/gs, '$1')}\n`) // Remove links from h3 for MD
            .replace(/<h4>(.*?)<\/h4>/gs, (match, p1) => `#### ${p1.replace(/<a.*?>(.*?)<\/a>/gs, '$1')}\n`) // Remove links from h4 for MD
            .replace(/<strong>(.*?)<\/strong>/gs, '**$1**')
            .replace(/<em>(.*?)<\/em>/gs, '*$1*')
            .replace(/<i>(.*?)<\/i>/gs, '*$1*')
            .replace(/<ul>/gs, '')
            .replace(/<\/ul>/gs, '')
            .replace(/<ol.*?>/gs, '')
            .replace(/<\/ol>/gs, '')
            .replace(/<li>/gs, '\n* ')
            .replace(/<\/li>/gs, '')
            .replace(/<br\s*\/?>/gs, '\n')
            .replace(/<a href="(#.*?)"[^>]*>(.*?)<\/a>/gs, '[$2]($1)')
            .replace(/<a href="([^#][^"]*)" target="_blank"[^>]*>(.*?)<\/a>/gs, '[$2]($1)')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/\u00A0/g, ' ')
            .replace(/ {2,}/g, ' ')
            .replace(/\n\s*\n\s*\n+/g, '\n\n')
            .trim();

        if (sectionId === 'referenzen') {
            let counter = 1;
            markdown = markdown.replace(/\n\* /g, () => `\n${counter++}. `);
        }
        
        markdown = markdown.replace(/Tabelle (\d+)/g, 'Table $1')
                           .replace(/Abbildung (\d+[a-c]?)/g, 'Figure $1');


        return markdown;
    }

    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown,
        fCI
    });

})();
