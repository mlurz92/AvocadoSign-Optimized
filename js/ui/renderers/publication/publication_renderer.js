const publicationRenderer = (() => {

    function renderTables(sectionId, context) {
        const tableContainerMap = {
            'methoden_literatur_kriterien': 'methoden_literatur_kriterien_tabelle_container',
            'ergebnisse_patientencharakteristika': 'results_patient_characteristics_table_container',
            'ergebnisse_as_diagnostische_guete': 'results_as_performance_table_container',
            'ergebnisse_t2_literatur_diagnostische_guete': 'results_literature_t2_performance_table_container',
            'ergebnisse_t2_optimiert_diagnostische_guete': 'results_optimized_t2_performance_table_container',
            'ergebnisse_vergleich_as_vs_t2': 'results_comparison_as_t2_table_container'
        };

        const targetContainerId = tableContainerMap[sectionId];
        if (!targetContainerId) return;

        const tableContainer = document.getElementById(targetContainerId);
        if (!tableContainer) return;

        let tableHTML = '';
        switch (sectionId) {
            case 'methoden_literatur_kriterien':
                tableHTML = publicationTables.generateMethodsLiteratureCriteriaTable(context);
                break;
            case 'ergebnisse_patientencharakteristika':
                tableHTML = publicationTables.generateResultsPatientCharacteristicsTable(context);
                break;
            case 'ergebnisse_as_diagnostische_guete':
                tableHTML = publicationTables.generateResultsPerformanceTable(context, APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID, 'diagnostischeGueteASTabelle', 'diagnostischeGueteASTabelle', 'diagnostischeGueteASTabelle');
                break;
            case 'ergebnisse_t2_literatur_diagnostische_guete':
                tableHTML = publicationTables.generateResultsLiteratureT2PerformanceTable(context);
                break;
            case 'ergebnisse_t2_optimiert_diagnostische_guete':
                tableHTML = publicationTables.generateResultsPerformanceTable(context, 'optimized_t2', 'diagnostischeGueteOptimierteT2Tabelle', 'diagnostischeGueteOptimierteT2Tabelle', 'diagnostischeGueteOptimierteT2Tabelle');
                break;
            case 'ergebnisse_vergleich_as_vs_t2':
                tableHTML = publicationTables.generateResultsComparisonTable(context);
                break;
        }

        tableContainer.innerHTML = tableHTML;
        ui_helpers.initializeTooltips(tableContainer);
    }

    function renderFigures(sectionId, context) {
        switch (sectionId) {
            case 'methoden_patientenkohorte':
                publicationFigures.renderMethodsFlowchart(context);
                break;
            case 'ergebnisse_patientencharakteristika':
                publicationFigures.renderPatientCharacteristicsFigures(context);
                break;
            case 'ergebnisse_vergleich_as_vs_t2':
                publicationFigures.renderComparisonCharts(context);
                break;
        }
        // Ensure tooltips are initialized after rendering figures within their new DOM structure
        ui_helpers.initializeTooltips(document.getElementById('publikation-content-area'));
    }

    return Object.freeze({
        renderTables,
        renderFigures
    });

})();
