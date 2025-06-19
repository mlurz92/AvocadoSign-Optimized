window.publicationService = (() => {

    const contentGenerators = {
        'title_main': window.titlePageGenerator.generateTitlePageHTML,
        'abstract_main': window.abstractGenerator.generateAbstractHTML,
        'introduction_main': window.introductionGenerator.generateIntroductionHTML,
        'methoden_studienanlage_ethik': window.methodsGenerator.generateStudyDesignHTML,
        'methoden_mrt_protokoll_akquisition': window.methodsGenerator.generateMriProtocolAndImageAnalysisHTML,
        'methoden_vergleichskriterien_t2': window.methodsGenerator.generateComparativeCriteriaHTML,
        'methoden_referenzstandard_histopathologie': window.methodsGenerator.generateReferenceStandardHTML,
        'methoden_statistische_analyse_methoden': window.methodsGenerator.generateStatisticalAnalysisHTML,
        'ergebnisse_patientencharakteristika': window.resultsGenerator.generatePatientCharacteristicsHTML,
        'ergebnisse_vergleich_as_vs_t2': window.resultsGenerator.generateComparisonHTML,
        'discussion_main': window.discussionGenerator.generateDiscussionHTML,
        'stard_checklist': window.stardGenerator.renderStardChecklist
    };

    function generateSectionHTML(sectionId, stats, commonData) {
        const generator = contentGenerators[sectionId];
        if (typeof generator === 'function') {
            try {
                return generator(stats, commonData);
            } catch (error) {
                console.error(`Error in generator for section '${sectionId}':`, error);
                return `<div class="alert alert-danger">An error occurred while generating content for section '${sectionId}'. Check console for details.</div>`;
            }
        }
        
        const mainSection = window.PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (mainSection && Array.isArray(mainSection.subSections) && mainSection.subSections.length > 0) {
            let combinedHTML = '';
            mainSection.subSections.forEach(sub => {
                const subGenerator = contentGenerators[sub.id];
                if (typeof subGenerator === 'function') {
                    try {
                        combinedHTML += subGenerator(stats, commonData);
                    } catch (error) {
                        console.error(`Error in sub-generator for section '${sub.id}' (part of '${sectionId}'):`, error);
                        combinedHTML += `<div class="alert alert-danger">An error occurred while generating content for sub-section '${sub.label}'. Check console for details.</div>`;
                    }
                }
            });
            return combinedHTML;
        }
        
        if (sectionId === 'references_main') {
            return '';
        }

        return `<div class="alert alert-warning">Content generator for section ID '${sectionId}' not found.</div>`;
    }
    
    function generateFullPublicationHTML(allCohortStats, commonData) {
        if (!allCohortStats || !commonData) {
            return '<div class="alert alert-warning">Statistical data or common configuration is missing for publication generation.</div>';
        }

        let rawContentHTML = generateSectionHTML('title_main', allCohortStats, commonData);

        window.PUBLICATION_CONFIG.sections.forEach(section => {
            if (section.id === 'references_main' || section.id === 'title_main' || section.id === 'stard_checklist') {
                return;
            }

            const sectionLabel = window.APP_CONFIG.UI_TEXTS.publicationTab.sectionLabels[section.labelKey] || section.labelKey;
            
            rawContentHTML += `<section id="${section.id}">`;
            rawContentHTML += `<h2>${sectionLabel}</h2>`;
            rawContentHTML += generateSectionHTML(section.id, allCohortStats, commonData);
            rawContentHTML += `</section>`;
        });
        
        const allReferences = commonData?.references || {};
        const { processedHtml, referencesHtml } = window.referencesGenerator.processAndNumberReferences(rawContentHTML, allReferences);
        
        return processedHtml + referencesHtml;
    }

    return Object.freeze({
        generateFullPublicationHTML,
        generateSectionHTML
    });

})();