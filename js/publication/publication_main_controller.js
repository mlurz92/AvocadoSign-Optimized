const publicationMainController = (() => {

    function _getSubSectionTitle(subSectionConfig, lang) {
        if (subSectionConfig && UI_TEXTS.publikationTab?.sectionLabels?.[subSectionConfig.labelKey]) {
            return UI_TEXTS.publikationTab.sectionLabels[subSectionConfig.labelKey];
        }
        const fallbackTitle = subSectionConfig.id.replace(/^(abstract_|methoden_|ergebnisse_|discussion_|references_)/, '').replace(/_/g, ' ');
        return fallbackTitle.charAt(0).toUpperCase() + fallbackTitle.slice(1);
    }

    function getFullPublicationSectionHTML(aggregatedData, currentSectionId, currentLang) {
        if (!aggregatedData || !currentSectionId || !currentLang) {
            return `<p class="text-danger">Error: Missing data or configuration for rendering publication section.</p>`;
        }

        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === currentSectionId);
        if (!mainSectionConfig) {
            return `<p class="text-danger">Error: Configuration for section ID '${currentSectionId}' not found.</p>`;
        }

        let html = `<div class="publication-main-section" id="pub-main-content-${currentSectionId}">`;
        const mainSectionTitle = UI_TEXTS.publikationTab.sectionLabels[mainSectionConfig.labelKey] || currentSectionId;
        html += `<h1 class="mb-4 display-6">${mainSectionTitle}</h1>`;

        if (!mainSectionConfig.subSections || mainSectionConfig.subSections.length === 0) {
            html += `<p>${UI_TEXTS.publikationTab.publicationContentNotAvailable[currentLang]}</p>`;
        } else {
            mainSectionConfig.subSections.forEach(subSection => {
                const subSectionId = subSection.id;
                const subSectionTitle = _getSubSectionTitle(subSection, currentLang);
                
                html += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSectionId}">`;
                if (subSectionId !== 'summary_statement_main' && subSectionId !== 'key_results_main' && subSectionId !== 'abstract_main' && mainSectionConfig.id !== 'abstract_key_results_summary') {
                     html += `<h2 class="publication-subsection-title">${subSectionTitle}</h2>`; // H2 for subsections, H3 for sub-subsections within templates
                }


                switch (subSectionId) {
                    case 'summary_statement_main':
                        html += summaryStatementGenerator.generateSummaryStatement(aggregatedData, currentLang);
                        break;
                    case 'abstract_main':
                        html += abstractGenerator.generateAbstract(aggregatedData, currentLang);
                        break;
                    case 'key_results_main':
                        const keyResultsArray = keyResultsGenerator.generateKeyResults(aggregatedData, currentLang);
                        html += '<ul>';
                        keyResultsArray.forEach(item => { html += `<li>${item}</li>`;});
                        html += '</ul>';
                        break;
                    case 'introduction_main':
                        html += introductionGenerator.generateIntroduction(aggregatedData, currentLang);
                        break;
                    case 'methoden_studienanlage_ethik':
                        html += methodsGenerator.generateStudyDesignEthicsText(aggregatedData, currentLang);
                        break;
                    case 'methoden_patientenkohorte':
                        html += methodsGenerator.generatePatientCohortText(aggregatedData, currentLang);
                        html += publicationFigures.renderFlowDiagram(aggregatedData, currentLang);
                        break;
                    case 'methoden_mrt_protokoll_akquisition':
                        html += methodsGenerator.generateMriProtocolText(aggregatedData, currentLang);
                        break;
                    case 'methoden_bildanalyse_avocado_sign':
                        html += methodsGenerator.generateImageAnalysisASText(aggregatedData, currentLang);
                        break;
                    case 'methoden_bildanalyse_t2_kriterien':
                        html += methodsGenerator.generateImageAnalysisT2Text(aggregatedData, currentLang);
                        html += publicationTables.renderLiteraturT2KriterienTabelle(aggregatedData, currentLang);
                        break;
                    case 'methoden_referenzstandard_histopathologie':
                        html += methodsGenerator.generateReferenceStandardText(aggregatedData, currentLang);
                        break;
                    case 'methoden_statistische_analyse_methoden':
                        html += methodsGenerator.generateStatisticalAnalysisText(aggregatedData, currentLang);
                        break;
                    case 'ergebnisse_patientencharakteristika':
                        html += resultsGenerator.generatePatientCharacteristicsText(aggregatedData, currentLang);
                        html += publicationTables.renderPatientenCharakteristikaTabelle(aggregatedData, currentLang);
                        html += publicationFigures.renderAgeDistributionChart(aggregatedData, currentLang);
                        html += publicationFigures.renderGenderDistributionChart(aggregatedData, currentLang);
                        break;
                    case 'ergebnisse_as_diagnostische_guete':
                        html += resultsGenerator.generateASPerformanceText(aggregatedData, currentLang);
                        html += publicationTables.renderDiagnostischeGueteASTabelle(aggregatedData, currentLang);
                        break;
                    case 'ergebnisse_t2_literatur_diagnostische_guete':
                        html += resultsGenerator.generateT2LiteraturePerformanceText(aggregatedData, currentLang);
                        html += publicationTables.renderDiagnostischeGueteLiteraturT2Tabelle(aggregatedData, currentLang);
                        break;
                    case 'ergebnisse_t2_optimiert_diagnostische_guete':
                        html += resultsGenerator.generateT2OptimizedPerformanceText(aggregatedData, currentLang);
                        html += publicationTables.renderDiagnostischeGueteOptimierteT2Tabelle(aggregatedData, currentLang);
                        break;
                    case 'ergebnisse_vergleich_as_vs_t2':
                        html += resultsGenerator.generateComparisonASvsT2Text(aggregatedData, currentLang);
                        html += publicationTables.renderStatistischerVergleichAST2Tabelle(aggregatedData, currentLang);
                        html += publicationFigures.renderComparisonPerformanceChart('Gesamt', aggregatedData, currentLang);
                        html += publicationFigures.renderComparisonPerformanceChart('direkt OP', aggregatedData, currentLang);
                        html += publicationFigures.renderComparisonPerformanceChart('nRCT', aggregatedData, currentLang);
                        break;
                    case 'discussion_main':
                        html += discussionGenerator.generateDiscussion(aggregatedData, currentLang);
                        break;
                    case 'references_main':
                        html += referencesGenerator.generateReferences(aggregatedData, currentLang);
                        break;
                    default:
                        html += `<p>${UI_TEXTS.publikationTab.publicationContentNotAvailable[currentLang]}</p>`;
                }
                html += `</div>`;
            });
        }
        html += `</div>`;
        return html;
    }

    return Object.freeze({
        getFullPublicationSectionHTML
    });

})();
