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
                q1: gesamtDesc.alter?.q1, // Add Q1
                q3: gesamtDesc.alter?.q3, // Add Q3
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

            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION,
            publicationConfig: PUBLICATION_CONFIG,
            appConfig: APP_CONFIG
        };

        return {
            allKollektivStats: aggregatedStats,
            common: commonData,
            rawData: globalRawData
        };
    }

    function getCommonData(globalRawData, appliedT2Criteria, appliedT2Logic, allBruteForceResults, targetBruteForceMetricKey = PUBLICATION_CONFIG.defaultBruteForceMetricForPublication) {
        // This function is for direct access to common data without re-calculating all stats.
        // Useful for text generators that only need common demographics/app info.
        const processedData = dataProcessor.processPatientData(globalRawData);
        const gesamtDesc = statisticsService.calculateDescriptiveStats(processedData);

        return {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            currentDate: getCurrentDateString('DD.MM.YYYY'),
            nGesamt: gesamtDesc.anzahlPatienten || 0,
            nDirektOP: gesamtDesc.therapie?.['direkt OP'] || 0,
            nNRCT: gesamtDesc.therapie?.nRCT || 0,
            
            demographicsGesamt: {
                patientCount: gesamtDesc.anzahlPatienten || 0,
                meanAge: gesamtDesc.alter?.mean,
                sdAge: gesamtDesc.alter?.sd,
                medianAge: gesamtDesc.alter?.median,
                q1: gesamtDesc.alter?.q1,
                q3: gesamtDesc.alter?.q3,
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

            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION,
            publicationConfig: PUBLICATION_CONFIG,
            appConfig: APP_CONFIG
        };
    }

    return Object.freeze({
        getAggregatedPublicationData,
        getCommonData // Export for direct access to common data
    });
})();
