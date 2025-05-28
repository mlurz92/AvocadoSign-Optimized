
const publicationStatsService = (() => {

    function findBestBruteForceCombinationForTargetMetric(bfRunResults, targetMetricName) {
        if (!bfRunResults || !Array.isArray(bfRunResults.results) || bfRunResults.results.length === 0 || !targetMetricName) {
            return null;
        }

        let bestCombination = null;
        let bestMetricValue = -Infinity;

        bfRunResults.results.forEach(comboResult => {
            if (comboResult && comboResult.metrics && comboResult.metrics[targetMetricName] !== undefined) {
                const currentComboMetricValue = comboResult.metrics[targetMetricName];
                if (isFinite(currentComboMetricValue) && currentComboMetricValue > bestMetricValue) {
                    bestMetricValue = currentComboMetricValue;
                    bestCombination = comboResult;
                }
            } else if (comboResult && comboResult.metrics && targetMetricName === bfRunResults.metric && comboResult.metrics.targetMetricValue !== undefined) {
                 // Fallback, falls targetMetricName die ursprüngliche Metrik des Laufs war
                const currentComboMetricValue = comboResult.metrics.targetMetricValue;
                if (isFinite(currentComboMetricValue) && currentComboMetricValue > bestMetricValue) {
                    bestMetricValue = currentComboMetricValue;
                    bestCombination = comboResult;
                }
            }
        });
        return bestCombination;
    }

    function calculateAllStatsForPublicationTab(fullRawData, appliedT2CriteriaSystem, appliedT2LogicSystem, bruteForceResultsPerKollektiv, publicationBfTargetMetric) {
        const publicationResults = {
            Gesamt: {},
            'direkt OP': {},
            nRCT: {}
        };
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const baseDependenciesValid = dataProcessor && t2CriteriaManager && studyT2CriteriaManager && statistics_service && PUBLICATION_CONFIG;

        if (!baseDependenciesValid) {
            console.error("PublicationStatsService: Kritische Abhängigkeiten nicht verfügbar.");
            return publicationResults; // Return empty structure
        }

        kollektive.forEach(kollektivId => {
            const currentKollektivData = dataProcessor.filterDataByKollektiv(fullRawData, kollektivId);
            const kollektivEntry = {
                deskriptiv: null,
                gueteAS: null,
                gueteT2_literatur: {},
                bruteforce_definition_publication: null,
                gueteT2_bruteforce_publication: null,
                vergleichASvsT2_bruteforce_publication: null
            };

            if (currentKollektivData.length === 0) {
                publicationResults[kollektivId] = kollektivEntry; // Store null/empty structure
                return;
            }

            const evaluatedDataForDescriptivesAndAS = t2CriteriaManager.evaluateDataset(cloneDeep(currentKollektivData), appliedT2CriteriaSystem, appliedT2LogicSystem);
            kollektivEntry.deskriptiv = statistics_service.calculateDescriptiveStats(evaluatedDataForDescriptivesAndAS);
            kollektivEntry.gueteAS = statistics_service.calculateDiagnosticPerformance(evaluatedDataForDescriptivesAndAS, 'as', 'n');

            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(studySetConf => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studySetConf.id);
                if (studySet) {
                    let isApplicableToCurrentKollektiv = true;
                    if (studySet.applicableKollektiv && studySet.applicableKollektiv !== 'Gesamt' && studySet.applicableKollektiv !== kollektivId) {
                        isApplicableToCurrentKollektiv = false;
                    }

                    if (isApplicableToCurrentKollektiv) {
                        const evaluatedDataStudy = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(currentKollektivData), studySet);
                        kollektivEntry.gueteT2_literatur[studySetConf.id] = statistics_service.calculateDiagnosticPerformance(evaluatedDataStudy, 't2', 'n');
                        kollektivEntry[`vergleichASvsT2_literatur_${studySetConf.id}`] = statistics_service.compareDiagnosticMethods(evaluatedDataStudy, 'as', 't2', 'n');
                    } else {
                        kollektivEntry.gueteT2_literatur[studySetConf.id] = statistics_service.calculateDiagnosticPerformance([], 't2', 'n'); // Return structure with NaNs
                        kollektivEntry[`vergleichASvsT2_literatur_${studySetConf.id}`] = { mcnemar: null, delong: null };
                    }
                }
            });

            const singleKollektivBfRunResults = bruteForceResultsPerKollektiv ? bruteForceResultsPerKollektiv[kollektivId] : null;
            let bestBfComboForPubMetric = null;

            if (singleKollektivBfRunResults && Array.isArray(singleKollektivBfRunResults.results) && singleKollektivBfRunResults.results.length > 0) {
                bestBfComboForPubMetric = findBestBruteForceCombinationForTargetMetric(singleKollektivBfRunResults, publicationBfTargetMetric);
            }

            if (bestBfComboForPubMetric && bestBfComboForPubMetric.criteria && bestBfComboForPubMetric.logic) {
                const bfCriteria = bestBfComboForPubMetric.criteria;
                const bfLogic = bestBfComboForPubMetric.logic;
                let metricValueForDefinition = bestBfComboForPubMetric.metrics[publicationBfTargetMetric];
                if(metricValueForDefinition === undefined || isNaN(metricValueForDefinition)){ //Fallback if specific metric key not found
                    metricValueForDefinition = bestBfComboForPubMetric.metrics.targetMetricValue;
                }


                kollektivEntry.bruteforce_definition_publication = {
                    criteria: bfCriteria,
                    logic: bfLogic,
                    metricName: publicationBfTargetMetric,
                    metricValue: metricValueForDefinition
                };

                const evaluatedDataForBF_CI = t2CriteriaManager.evaluateDataset(cloneDeep(currentKollektivData), bfCriteria, bfLogic);
                kollektivEntry.gueteT2_bruteforce_publication = statistics_service.calculateDiagnosticPerformance(evaluatedDataForBF_CI, 't2', 'n');
                kollektivEntry.vergleichASvsT2_bruteforce_publication = statistics_service.compareDiagnosticMethods(evaluatedDataForBF_CI, 'as', 't2', 'n');
            } else {
                kollektivEntry.bruteforce_definition_publication = null;
                kollektivEntry.gueteT2_bruteforce_publication = statistics_service.calculateDiagnosticPerformance([], 't2', 'n');
                kollektivEntry.vergleichASvsT2_bruteforce_publication = { mcnemar: null, delong: null };
            }
            publicationResults[kollektivId] = kollektivEntry;
        });
        return publicationResults;
    }

    return Object.freeze({
        calculateAllStatsForPublicationTab
    });
})();
