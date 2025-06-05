const publicationDataAggregator = (() => {

    function getAggregatedPublicationData(globalRawData, appliedT2Criteria, appliedT2Logic, allBruteForceResults, targetBruteForceMetricKey = PUBLICATION_CONFIG.defaultBruteForceMetricForPublication) {
        if (!globalRawData || !Array.isArray(globalRawData) || !appliedT2Criteria || !appliedT2Logic) {
            console.error("PublicationDataAggregator: Fehlende Eingabedaten.");
            return null;
        }

        let aggregatedStats;
        try {
            aggregatedStats = statisticsService.calculateAllStatsForPublication(
                globalRawData,
                appliedT2Criteria,
                appliedT2Logic,
                allBruteForceResults,
                targetBruteForceMetricKey
            );
        } catch (error) {
            console.error("PublicationDataAggregator: Fehler bei der Berechnung der Gesamtstatistiken:", error);
            return null;
        }

        if (!aggregatedStats) {
            console.error("PublicationDataAggregator: Gesamtstatistiken konnten nicht berechnet werden.");
            return null;
        }
        
        const gesamtDesc = aggregatedStats.Gesamt?.deskriptiv || {};
        const direktOpDesc = aggregatedStats['direkt OP']?.deskriptiv || {};
        const nrctDesc = aggregatedStats.nRCT?.deskriptiv || {};

        const commonData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            currentDate: getCurrentDateString('DD.MM.YYYY'),
            nGesamt: gesamtDesc.anzahlPatienten || 0,
            nDirektOP: direktOpDesc.anzahlPatienten || 0,
            nNRCT: nrctDesc.anzahlPatienten || 0,
            
            demographicsGesamt: {
                patientCount: gesamtDesc.anzahlPatienten || 0,
                meanAge: gesamtDesc.alter?.mean,
                sdAge: gesamtDesc.alter?.sd,
                medianAge: gesamtDesc.alter?.median,
                iqrAge: gesamtDesc.alter ? [gesamtDesc.alter.q1, gesamtDesc.alter.q3] : [null, null],
                minAge: gesamtDesc.alter?.min,
                maxAge: gesamtDesc.alter?.max,
                countMen: gesamtDesc.geschlecht?.m || 0,
                countWomen: gesamtDesc.geschlecht?.f || 0,
                percentMen: gesamtDesc.anzahlPatienten > 0 ? (gesamtDesc.geschlecht?.m || 0) / gesamtDesc.anzahlPatienten : null,
                countNRCT: gesamtDesc.therapie?.nRCT || 0,
                countDirektOP: gesamtDesc.therapie?.['direkt OP'] || 0,
                countNPlus: gesamtDesc.nStatus?.plus || 0
            },
            
            appliedT2CriteriaDefinition: {
                criteria: appliedT2Criteria,
                logic: appliedT2Logic,
                description: studyT2CriteriaManager.formatCriteriaForDisplay(appliedT2Criteria, appliedT2Logic, false),
                descriptionShort: studyT2CriteriaManager.formatCriteriaForDisplay(appliedT2Criteria, appliedT2Logic, true)
            },
            
            targetBruteForceMetric: targetBruteForceMetricKey,
            // Placeholder for specific values needed by Radiology style (will be formatted by radiologyFormatter)
            // Example: Key Results might need specific pre-calculated strings or data points
            // For now, the text templates will extract directly from aggregatedStats and use radiologyFormatter

            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION,
            publicationConfig: PUBLICATION_CONFIG, // Pass the whole config for structural info
            appConfig: APP_CONFIG // Pass general app config for constants
        };

        return {
            allKollektivStats: aggregatedStats, // This contains the detailed stats per cohort
            common: commonData,
            rawData: globalRawData // Pass raw data if needed by any template for very specific things
        };
    }

    return Object.freeze({
        getAggregatedPublicationData
    });
})();
