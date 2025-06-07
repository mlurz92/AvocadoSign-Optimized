const publikationTabLogic = (() => {

    let currentLanguage = APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG;
    let currentSection = APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION;
    let currentBruteForceMetric = APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC;

    function init() {
        _attachEventListeners();
        ui_helpers.updatePublikationUI(currentLanguage, currentSection, currentBruteForceMetric);
        ui_helpers.initializeTooltips(document.getElementById('publikation-tab-pane'));
    }

    function _attachEventListeners() {
        document.getElementById('publikation-sprache-switch')?.addEventListener('change', (event) => {
            currentLanguage = event.target.checked ? 'en' : 'de';
            state.setPublikationLang(currentLanguage);
            ui_helpers.updatePublikationUI(currentLanguage, currentSection, currentBruteForceMetric);
            render(state.getProcessedData(), state.getBruteForceResults());
        });

        document.querySelectorAll('.publikation-section-link').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const newSection = event.currentTarget.dataset.sectionId;
                if (newSection !== currentSection) {
                    currentSection = newSection;
                    state.setPublikationSection(currentSection);
                    ui_helpers.updatePublikationUI(currentLanguage, currentSection, currentBruteForceMetric);
                    render(state.getProcessedData(), state.getBruteForceResults());
                }
            });
        });

        document.getElementById('publikation-bf-metric-select')?.addEventListener('change', (event) => {
            currentBruteForceMetric = event.target.value;
            state.setPublikationBruteForceMetric(currentBruteForceMetric);
            render(state.getProcessedData(), state.getBruteForceResults());
        });
    }

    function render(processedData, bruteForceResults) {
        const publikationContentArea = document.getElementById('publikation-content-area');
        if (!publikationContentArea) return;

        const allStats = statisticsService.calculateAllStatsForPublication(
            state.getRawData(),
            t2CriteriaManager.getAppliedCriteria(),
            t2CriteriaManager.getAppliedLogic(),
            bruteForceResults
        );

        const context = {
            processedData: processedData,
            rawData: state.getRawData(),
            allStats: allStats,
            appliedT2Criteria: t2CriteriaManager.getAppliedCriteria(),
            appliedT2Logic: t2CriteriaManager.getAppliedLogic(),
            bruteForceResults: bruteForceResults,
            currentLanguage: currentLanguage,
            currentBruteForceMetric: currentBruteForceMetric,
            kollektivNames: APP_CONFIG.UI_TEXTS.kollektivDisplayNames,
            specialIds: APP_CONFIG.SPECIAL_IDS
        };

        let contentHTML = '';
        switch (currentSection) {
            case 'abstract_main':
                contentHTML = publicationTextGenerator.generateAbstract(context);
                break;
            case 'introduction_main':
                contentHTML = publicationTextGenerator.generateIntroduction(context);
                break;
            case 'methoden_studienanlage_ethik':
                contentHTML = publicationTextGenerator.generateMethodsStudyDesign(context);
                break;
            case 'methoden_patientenkohorte':
                contentHTML = publicationTextGenerator.generateMethodsPatientCohort(context);
                break;
            case 'methoden_mrt_protokoll_akquisition':
                contentHTML = publicationTextGenerator.generateMethodsMRIProtocol(context);
                break;
            case 'methoden_bildanalyse_avocado_sign':
                contentHTML = publicationTextGenerator.generateMethodsAvocadoSign(context);
                break;
            case 'methoden_bildanalyse_t2_kriterien':
                contentHTML = publicationTextGenerator.generateMethodsT2Criteria(context);
                break;
            case 'methoden_referenzstandard_histopathologie':
                contentHTML = publicationTextGenerator.generateMethodsReferenceStandard(context);
                break;
            case 'methoden_statistische_analyse_methoden':
                contentHTML = publicationTextGenerator.generateMethodsStatisticalAnalysis(context);
                break;
            case 'ergebnisse_patientencharakteristika':
                contentHTML = publicationTextGenerator.generateResultsPatientCharacteristics(context);
                break;
            case 'ergebnisse_as_diagnostische_guete':
                contentHTML = publicationTextGenerator.generateResultsASPerformance(context);
                break;
            case 'ergebnisse_t2_literatur_diagnostische_guete':
                contentHTML = publicationTextGenerator.generateResultsLiteratureT2Performance(context);
                break;
            case 'ergebnisse_t2_optimiert_diagnostische_guete':
                contentHTML = publicationTextGenerator.generateResultsOptimizedT2Performance(context);
                break;
            case 'ergebnisse_vergleich_as_vs_t2':
                contentHTML = publicationTextGenerator.generateResultsComparison(context);
                break;
            case 'discussion_main':
                contentHTML = publicationTextGenerator.generateDiscussion(context);
                break;
            case 'references_main':
                contentHTML = publicationTextGenerator.generateReferences(context);
                break;
            default:
                contentHTML = `<p class="text-muted text-center">${APP_CONFIG.UI_TEXTS.publikationTab.selectSectionPrompt}</p>`;
                break;
        }

        publikationContentArea.innerHTML = contentHTML;
        ui_helpers.initializeTooltips(publikationContentArea); // Re-initialize tooltips for new content

        // After rendering the content, render charts and tables if they exist in the current section
        publicationRenderer.renderFigures(currentSection, context);
        publicationRenderer.renderTables(currentSection, context);

        ui_helpers.updatePublikationUI(currentLanguage, currentSection, currentBruteForceMetric);
    }

    return Object.freeze({
        init,
        render
    });

})();
