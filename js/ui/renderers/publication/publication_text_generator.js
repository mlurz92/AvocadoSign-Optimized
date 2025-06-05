const publicationTextGenerator = (() => {

    // Importieren der modularen Textinhalte
    const abstractContent = typeof abstractContent !== 'undefined' ? abstractContent : { getAbstractText: () => '', getKeyResultsText: () => '' };
    const introductionContent = typeof introductionContent !== 'undefined' ? introductionContent : { getIntroductionText: () => '' };
    const methodsContent = typeof methodsContent !== 'undefined' ? methodsContent : {
        getMethodenStudienanlageEthikText: () => '',
        getMethodenPatientenkohorteText: () => '',
        getMethodenMRTProtokollAkquisitionText: () => '',
        getMethodenBildanalyseAvocadoSignText: () => '',
        getMethodenBildanalyseT2KriterienText: () => '',
        getMethodenReferenzstandardHistopathologieText: () => '',
        getMethodenStatistischeAnalyseMethodenText: () => ''
    };
    const resultsContent = typeof resultsContent !== 'undefined' ? resultsContent : {
        getErgebnissePatientencharakteristikaText: () => '',
        getErgebnisseASPerformanceText: () => '',
        getErgebnisseLiteraturT2PerformanceText: () => '',
        getErgebnisseOptimierteT2PerformanceText: () => '',
        getErgebnisseVergleichPerformanceText: () => ''
    };
    const discussionContent = typeof discussionContent !== 'undefined' ? discussionContent : { getDiscussionText: () => '' };
    const referencesContent = typeof referencesContent !== 'undefined' ? referencesContent : { getReferencesText: () => '' };


    function getSectionText(sectionId, lang, allKollektivStats, commonData) {
        switch (sectionId) {
            case 'abstract_main': return abstractContent.getAbstractText(lang, allKollektivStats, commonData) + abstractContent.getKeyResultsText(lang, allKollektivStats, commonData);
            case 'introduction_main': return introductionContent.getIntroductionText(lang, commonData);
            case 'methoden_studienanlage_ethik': return methodsContent.getMethodenStudienanlageEthikText(lang, commonData);
            case 'methoden_patientenkohorte': return methodsContent.getMethodenPatientenkohorteText(lang, allKollektivStats, commonData);
            case 'methoden_mrt_protokoll_akquisition': return methodsContent.getMethodenMRTProtokollAkquisitionText(lang, commonData);
            case 'methoden_bildanalyse_avocado_sign': return methodsContent.getMethodenBildanalyseAvocadoSignText(lang, commonData);
            case 'methoden_bildanalyse_t2_kriterien': return methodsContent.getMethodenBildanalyseT2KriterienText(lang, commonData, allKollektivStats);
            case 'methoden_referenzstandard_histopathologie': return methodsContent.getMethodenReferenzstandardHistopathologieText(lang);
            case 'methoden_statistische_analyse_methoden': return methodsContent.getMethodenStatistischeAnalyseMethodenText(lang, commonData);
            case 'ergebnisse_patientencharakteristika': return resultsContent.getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData);
            case 'ergebnisse_as_diagnostische_guete': return resultsContent.getErgebnisseASPerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_t2_literatur_diagnostische_guete': return resultsContent.getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_t2_optimiert_diagnostische_guete': return resultsContent.getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_vergleich_as_vs_t2': return resultsContent.getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData);
            case 'discussion_main': return discussionContent.getDiscussionText(lang, allKollektivStats, commonData);
            case 'references_main': return referencesContent.getReferencesText(lang, commonData);
            default: return `<p class="text-warning">Text für Sektion '${sectionId}' (Sprache: ${lang}) noch nicht implementiert.</p>`;
        }
    }

    function getSectionTextAsMarkdown(sectionId, lang, allKollektivStats, commonData) {
        const htmlContent = getSectionText(sectionId, lang, allKollektivStats, commonData);
        let markdown = htmlContent
            .replace(/<p>(.*?)<\/p>/g, '\n$1\n') // Paragraphs to double newline
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**') // Bold
            .replace(/<em>(.*?)<\/em>/g, '*$1*') // Italic
            .replace(/<i>(.*?)<\/i>/g, '*$1*') // Italic
            .replace(/<br\s*\/?>/g, '\n') // Line breaks
            .replace(/<h1[^>]*>(.*?)<\/h1>/g, (match, p1) => `\n# ${p1}\n`) // H1
            .replace(/<h2[^>]*>(.*?)<\/h2>/g, (match, p1) => `\n## ${p1}\n`) // H2
            .replace(/<h3[^>]*>(.*?)<\/h3>/g, (match, p1) => `\n### ${p1}\n`) // H3
            .replace(/<h4[^>]*>(.*?)<\/h4>/g, (match, p1) => `\n#### ${p1}\n`) // H4
            .replace(/<h5[^>]*>(.*?)<\/h5>/g, (match, p1) => `\n##### ${p1}\n`) // H5
            .replace(/<h6[^>]*>(.*?)<\/h6>/g, (match, p1) => `\n###### ${p1}\n`) // H6
            .replace(/<ul>/g, '\n') // Unordered list start
            .replace(/<\/ul>/g, '\n') // Unordered list end
            .replace(/<ol>/g, '\n') // Ordered list start
            .replace(/<\/ol>/g, '\n') // Ordered list end
            .replace(/<li>(.*?)<\/li>/g, '* $1\n') // List items
            .replace(/<dl[^>]*>([\s\S]*?)<\/dl>/g, (match, dlContent) => { // Definition list
                return dlContent.replace(/<dt[^>]*>(.*?)<\/dt>/g, '\n**$1**\n')
                                .replace(/<dd[^>]*>(.*?)<\/dd>/g, ': $1\n');
            })
            .replace(/<a href="#(.*?)">(.*?)<\/a>/g, '[$2](#$1)') // Links
            .replace(/&lt;/g, '<') // HTML entities
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/\u00A0/g, ' ') // Non-breaking space
            .replace(/ {2,}/g, ' ') // Multiple spaces
            .replace(/\n\s*\n/g, '\n\n') // Multiple newlines
            .trim();

        // Specific formatting for p-values and special characters for Radiology style
        markdown = markdown.replace(/p=(\.\d{2,3})|p=&lt;\.001|p=&gt;\.99/g, match => {
            return `p=${match.replace('p=','').replace('&lt;','<').replace('&gt;','>')}`;
        });
        
        // Remove LaTeX math delimiters if present for typical markdown output (Radiology often uses normal text for p-values)
        markdown = markdown.replace(/\$(.*?)\$/g, '$1'); 

        // Adjust ordered list numbering (Radiology uses [1], [2]... for references)
        if (sectionId === 'references_main' && markdown.includes('* ')) {
            let tempLines = markdown.split('\n');
            let currentNumber = 1;
            markdown = tempLines.map(line => {
                if (line.startsWith('* ')) {
                    // Try to extract existing number, otherwise assign new one
                    const content = line.substring(2).trim();
                    const match = content.match(/^\[(\d+)\]\s*(.*)/);
                    if (match) {
                        return `${match[1]}. ${match[2]}`;
                    }
                    return `${currentNumber++}. ${content}`;
                }
                return line;
            }).join('\n');
        }
        
        // Final pass for any lingering extra spaces or newlines
        markdown = markdown.replace(/\n\s*\n/g, '\n\n').trim();

        return markdown;
    }

    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown
    });

})();
