const publicationLogic = (() => {

    const NA_TEXT_DE = 'N/A';
    const NA_TEXT_EN = 'N/A';
    const ZIELMETRIK_BRUTE_FORCE_PUBLIKATION = APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC || 'Balanced Accuracy';

    function _getLocalizedText(section, part, lang, subPart = null) {
        const textObject = PUBLICATION_TEXTS[section]?.[lang];
        if (!textObject) return `FEHLT: ${section}.${lang}`;
        const key = subPart ? `${part}_${subPart}` : part;
        const text = textObject[key];
        if (text === undefined) return `FEHLT: ${section}.${lang}.${key}`;
        return text;
    }

    function _formatPublicationValue(value, digits = 1, isPercent = false, lang = 'de') {
        const naPlaceholder = lang === 'de' ? NA_TEXT_DE : NA_TEXT_EN;
        if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
            return naPlaceholder;
        }
        return isPercent ? formatPercent(value, digits, naPlaceholder) : formatNumber(value, digits, naPlaceholder);
    }

    function _formatCIValue(valueObj, digits = 1, isPercent = false, lang = 'de') {
        const naPlaceholder = lang === 'de' ? NA_TEXT_DE : NA_TEXT_EN;
        if (!valueObj || typeof valueObj !== 'object' || valueObj.value === null || valueObj.value === undefined || isNaN(valueObj.value)) return naPlaceholder;
        return formatCI(valueObj.value, valueObj.ci?.lower, valueObj.ci?.upper, digits, isPercent, naPlaceholder);
    }

    function _formatPValueForText(pValue, lang = 'de') {
        const naPlaceholder = lang === 'de' ? NA_TEXT_DE : NA_TEXT_EN;
        if (pValue === null || pValue === undefined || isNaN(pValue)) return naPlaceholder;
        if (pValue < 0.001) return "&lt;0.001";
        return formatNumber(pValue, 3, naPlaceholder);
    }

    function _runSingleBruteForceOptimization(dataForKollektiv, targetMetric) {
        if (!dataForKollektiv || dataForKollektiv.length === 0) {
            return { bestCriteria: null, bestLogic: null, bestMetricValue: -Infinity, targetMetric: targetMetric, criteriaText: NA_TEXT_DE };
        }
        const combinations = brute_force_worker_utils.generateCriteriaCombinationsForExternal(APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE);
        let bestOverallResult = { metricValue: -Infinity, criteria: null, logic: null };

        combinations.forEach(combo => {
            const metricValue = statisticsService.calculateMetricForWorker(dataForKollektiv, combo.criteria, combo.logic, targetMetric);
            if (metricValue > bestOverallResult.metricValue && isFinite(metricValue)) {
                bestOverallResult = { metricValue: metricValue, criteria: combo.criteria, logic: combo.logic };
            }
        });

        if (bestOverallResult.criteria) {
            return {
                bestCriteria: bestOverallResult.criteria,
                bestLogic: bestOverallResult.logic,
                bestMetricValue: bestOverallResult.metricValue,
                targetMetric: targetMetric,
                criteriaText: studyT2CriteriaManager.formatCriteriaForDisplay(bestOverallResult.criteria, bestOverallResult.logic, false) || NA_TEXT_DE
            };
        }
        return { bestCriteria: null, bestLogic: null, bestMetricValue: -Infinity, targetMetric: targetMetric, criteriaText: NA_TEXT_DE };
    }


    function _getPlaceholderData(allProcessedData, lang) {
        const placeholderData = {};
        const na = lang === 'de' ? NA_TEXT_DE : NA_TEXT_EN;
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];

        placeholderData['ETHIK_VOTUM_NUMMER'] = APP_CONFIG.PUBLICATION_REFERENCES?.ETHICS_VOTE_NUMBER || '225/20-ek';
        placeholderData['T2_SCHICHTDICKE_MM'] = APP_CONFIG.PUBLICATION_REFERENCES?.T2_SLICE_THICKNESS_MM || '2-3';
        placeholderData['BOOTSTRAP_REPLICATIONS'] = formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS, 0);
        placeholderData['APP_VERSION'] = APP_CONFIG.APP_VERSION;
        placeholderData['SIGNIFICANCE_LEVEL'] = formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, 2).replace('.', ',');

        const descStats = {};
        kollektive.forEach(k => {
            descStats[k] = statisticsService.calculateDescriptiveStats(dataProcessor.filterDataByKollektiv(allProcessedData, k));
        });

        placeholderData['PATIENT_COUNT_GESAMT'] = descStats['Gesamt'].anzahlPatienten;
        placeholderData['PATIENT_COUNT_NRCT'] = descStats['nRCT'].anzahlPatienten;
        placeholderData['PATIENT_COUNT_DIREKT_OP'] = descStats['direkt OP'].anzahlPatienten;
        placeholderData['ANZAHL_MAENNLICH_GESAMT'] = descStats['Gesamt'].geschlecht?.m ?? 0;
        placeholderData['PROZENT_MAENNLICH_GESAMT'] = _formatPublicationValue(descStats['Gesamt'].anzahlPatienten > 0 ? (descStats['Gesamt'].geschlecht?.m ?? 0) / descStats['Gesamt'].anzahlPatienten : NaN, 0, true, lang).replace('%', '');
        placeholderData['ANZAHL_WEIBLICH_GESAMT'] = descStats['Gesamt'].geschlecht?.f ?? 0;
        placeholderData['PROZENT_WEIBLICH_GESAMT'] = _formatPublicationValue(descStats['Gesamt'].anzahlPatienten > 0 ? (descStats['Gesamt'].geschlecht?.f ?? 0) / descStats['Gesamt'].anzahlPatienten : NaN, 0, true, lang).replace('%', '');
        placeholderData['ALTER_MEDIAN_GESAMT'] = _formatPublicationValue(descStats['Gesamt'].alter?.median, 1, false, lang);
        placeholderData['ALTER_MIN_GESAMT'] = _formatPublicationValue(descStats['Gesamt'].alter?.min, 0, false, lang);
        placeholderData['ALTER_MAX_GESAMT'] = _formatPublicationValue(descStats['Gesamt'].alter?.max, 0, false, lang);
        placeholderData['PROZENT_DIREKT_OP_ANTEIL'] = _formatPublicationValue(descStats['Gesamt'].anzahlPatienten > 0 ? descStats['direkt OP'].anzahlPatienten / descStats['Gesamt'].anzahlPatienten : NaN, 0, true, lang).replace('%', '');
        placeholderData['PROZENT_NRCT_ANTEIL'] = _formatPublicationValue(descStats['Gesamt'].anzahlPatienten > 0 ? descStats['nRCT'].anzahlPatienten / descStats['Gesamt'].anzahlPatienten : NaN, 0, true, lang).replace('%', '');
        placeholderData['ANZAHL_NPLUS_GESAMT'] = descStats['Gesamt'].nStatus?.plus ?? 0;
        placeholderData['PROZENT_NPLUS_GESAMT'] = _formatPublicationValue(descStats['Gesamt'].anzahlPatienten > 0 ? (descStats['Gesamt'].nStatus?.plus ?? 0) / descStats['Gesamt'].anzahlPatienten : NaN, 0, true, lang).replace('%', '');
        placeholderData['ANZAHL_NPLUS_DIREKT_OP'] = descStats['direkt OP'].nStatus?.plus ?? 0;
        placeholderData['PROZENT_NPLUS_DIREKT_OP'] = _formatPublicationValue(descStats['direkt OP'].anzahlPatienten > 0 ? (descStats['direkt OP'].nStatus?.plus ?? 0) / descStats['direkt OP'].anzahlPatienten : NaN, 0, true, lang).replace('%', '');
        placeholderData['ANZAHL_NPLUS_NRCT'] = descStats['nRCT'].nStatus?.plus ?? 0;
        placeholderData['PROZENT_NPLUS_NRCT'] = _formatPublicationValue(descStats['nRCT'].anzahlPatienten > 0 ? (descStats['nRCT'].nStatus?.plus ?? 0) / descStats['nRCT'].anzahlPatienten : NaN, 0, true, lang).replace('%', '');

        placeholderData['TABLE_REF_PAT_CHARS'] = lang === 'de' ? 'Tabelle 1' : 'Table 1';
        placeholderData['TABLE_REF_LIT_T2_DEFINITIONS'] = lang === 'de' ? 'Tabelle 2' : 'Table 2';
        placeholderData['TABLE_REF_AS_PERFORMANCE'] = lang === 'de' ? 'Tabelle 3' : 'Table 3';
        placeholderData['TABLE_REF_LIT_T2_PERFORMANCE'] = lang === 'de' ? 'Tabelle 4' : 'Table 4';
        placeholderData['TABLE_REF_BF_T2_PERFORMANCE'] = lang === 'de' ? 'Tabelle 5' : 'Table 5';
        placeholderData['TABLE_REF_AS_VS_LIT_T2_COMPARISON'] = lang === 'de' ? 'Tabelle 6A' : 'Table 6A'; // Angepasst
        placeholderData['TABLE_REF_AS_VS_BF_T2_COMPARISON'] = lang === 'de' ? 'Tabelle 6B' : 'Table 6B'; // Angepasst
        placeholderData['FIG_REF_ROC_COMPARISON'] = lang === 'de' ? 'Abbildung 1' : 'Figure 1';
        placeholderData['FIG_REF_AS_PERFORMANCE_BARPLOT'] = lang === 'de' ? 'Abbildung 2A' : 'Figure 2A'; // Angepasst
        placeholderData['FIG_REF_METRIC_COMPARISON_BARCHART'] = lang === 'de' ? 'Abbildung 2B' : 'Figure 2B'; // Angepasst

        placeholderData['T2_SIZE_MIN_BF'] = _formatPublicationValue(APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min, 1, false, lang);
        placeholderData['T2_SIZE_MAX_BF'] = _formatPublicationValue(APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max, 1, false, lang);
        placeholderData['T2_SIZE_STEP_BF'] = _formatPublicationValue(APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step, 1, false, lang);
        placeholderData['ZIELMETRIK_BRUTE_FORCE_PUBLIKATION'] = ZIELMETRIK_BRUTE_FORCE_PUBLIKATION;


        kollektive.forEach(k_id => {
            const suffix = k_id === 'Gesamt' ? '_GESAMT' : (k_id === 'direkt OP' ? '_DIREKT_OP' : '_NRCT');
            const data = dataProcessor.filterDataByKollektiv(allProcessedData, k_id);
            const perfAS = statisticsService.calculateDiagnosticPerformance(data, 'as', 'n');
            placeholderData[`AS_SENS${suffix}`] = _formatCIValue(perfAS?.sens, 1, true, lang);
            placeholderData[`AS_SPEZ${suffix}`] = _formatCIValue(perfAS?.spez, 1, true, lang);
            placeholderData[`AS_PPV${suffix}`] = _formatCIValue(perfAS?.ppv, 1, true, lang);
            placeholderData[`AS_NPV${suffix}`] = _formatCIValue(perfAS?.npv, 1, true, lang);
            placeholderData[`AS_ACC${suffix}`] = _formatCIValue(perfAS?.acc, 1, true, lang);
            placeholderData[`AS_AUC${suffix}`] = _formatCIValue(perfAS?.auc, 3, false, lang);
        });

        const literatureSets = [
            { id: 'koh_2008_morphology', keyPrefix: 'KOH', applicableKollektiv: 'Gesamt' },
            { id: 'barbaro_2024_restaging', keyPrefix: 'BARBARO', applicableKollektiv: 'nRCT' },
            { id: 'rutegard_et_al_esgar', keyPrefix: 'RUTEGARD', applicableKollektiv: 'direkt OP' }
        ];

        literatureSets.forEach(litSet => {
            const studyCriteria = studyT2CriteriaManager.getStudyCriteriaSetById(litSet.id);
            const data = dataProcessor.filterDataByKollektiv(allProcessedData, litSet.applicableKollektiv);
            const evaluatedData = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(data, studyCriteria);
            const perfT2 = statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n');
            const perfAS_on_lit_kollektiv = statisticsService.calculateDiagnosticPerformance(data, 'as', 'n'); // AS on the same cohort

            placeholderData[`${litSet.keyPrefix}_APPLICABLE_KOLLEKTIV_NAME`] = getKollektivDisplayName(litSet.applicableKollektiv);
            placeholderData[`${litSet.keyPrefix}_PATIENT_COUNT`] = data.length;
            placeholderData[`${litSet.keyPrefix}_AUC`] = _formatCIValue(perfT2?.auc, 3, false, lang);
            placeholderData[`${litSet.keyPrefix}_SENS`] = _formatCIValue(perfT2?.sens, 1, true, lang);
            placeholderData[`${litSet.keyPrefix}_SPEZ`] = _formatCIValue(perfT2?.spez, 1, true, lang);
            placeholderData[`${litSet.keyPrefix}_ACC`] = _formatCIValue(perfT2?.acc, 1, true, lang);

            placeholderData[`AS_AUC_FOR_${litSet.keyPrefix}_KOLLEKTIV`] = _formatCIValue(perfAS_on_lit_kollektiv?.auc, 3, false, lang);
            placeholderData[`AS_ACC_FOR_${litSet.keyPrefix}_KOLLEKTIV`] = _formatCIValue(perfAS_on_lit_kollektiv?.acc, 1, true, lang);

            const comparison = statisticsService.compareDiagnosticMethods(evaluatedData.map((p, i) => ({ ...p, as: data[i]?.as })), 'as', 't2', 'n');
            placeholderData[`AS_VS_${litSet.keyPrefix}_P_DELONG`] = _formatPValueForText(comparison?.delong?.pValue, lang);
            placeholderData[`AS_VS_${litSet.keyPrefix}_P_MCNEMAR`] = _formatPValueForText(comparison?.mcnemar?.pValue, lang);
            const aucDiffDirection = comparison?.delong?.diffAUC > 1e-4 ? (lang === 'de' ? 'numerisch höher' : 'numerically higher') : (comparison?.delong?.diffAUC < -1e-4 ? (lang === 'de' ? 'numerisch niedriger' : 'numerically lower') : (lang === 'de' ? 'vergleichbar' : 'comparable'));
            placeholderData[`AS_VS_${litSet.keyPrefix}_AUC_DIRECTION`] = aucDiffDirection;
        });

        let bfDataAvailableForAll = true;
        kollektive.forEach(k_id => {
            const suffix = k_id === 'Gesamt' ? '_GESAMT' : (k_id === 'direkt OP' ? '_DIREKT_OP' : '_NRCT');
            const dataForKollektiv = dataProcessor.filterDataByKollektiv(allProcessedData, k_id);
            const bfResult = _runSingleBruteForceOptimization(dataForKollektiv, ZIELMETRIK_BRUTE_FORCE_PUBLIKATION);

            placeholderData[`BF${suffix}_N`] = dataForKollektiv.length;
            if (bfResult && bfResult.bestCriteria) {
                const bfEvalData = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataForKollektiv), { criteria: bfResult.bestCriteria, logic: bfResult.bestLogic, id: `bf_temp_${k_id}` });
                const perfBF = statisticsService.calculateDiagnosticPerformance(bfEvalData, 't2', 'n');

                placeholderData[`BF${suffix}_LOGIC_OPERATOR`] = bfResult.bestLogic;
                placeholderData[`BF${suffix}_KRITERIEN_TEXT`] = bfResult.criteriaText;
                placeholderData[`BF_METRIC${suffix}_WERT`] = _formatPublicationValue(perfBF?.balAcc?.value, 3, false, lang);
                placeholderData[`BF_SENS${suffix}`] = _formatCIValue(perfBF?.sens, 1, true, lang);
                placeholderData[`BF_SPEZ${suffix}`] = _formatCIValue(perfBF?.spez, 1, true, lang);
                placeholderData[`BF_ACC${suffix}`] = _formatCIValue(perfBF?.acc, 1, true, lang);
                placeholderData[`BF_AUC${suffix}`] = _formatCIValue(perfBF?.auc, 3, false, lang);

                const perfAS_on_bf_kollektiv = statisticsService.calculateDiagnosticPerformance(dataForKollektiv, 'as', 'n');
                const comparisonBF = statisticsService.compareDiagnosticMethods(bfEvalData.map((p, i) => ({ ...p, as: dataForKollektiv[i]?.as })), 'as', 't2', 'n');
                placeholderData[`AS_VS_BF_P_DELONG${suffix}`] = _formatPValueForText(comparisonBF?.delong?.pValue, lang);
                placeholderData[`AS_VS_BF_P_MCNEMAR${suffix}`] = _formatPValueForText(comparisonBF?.mcnemar?.pValue, lang);
                const aucDiffBfDirection = comparisonBF?.delong?.diffAUC > 1e-4 ? (lang === 'de' ? 'numerisch höher' : 'numerically higher') : (comparisonBF?.delong?.diffAUC < -1e-4 ? (lang === 'de' ? 'numerisch niedriger' : 'numerically lower') : (lang === 'de' ? 'vergleichbar' : 'comparable'));
                 placeholderData[`AS_VS_BF_AUC_DIRECTION${suffix}`] = aucDiffBfDirection;

            } else {
                bfDataAvailableForAll = false;
                ['LOGIC_OPERATOR', 'KRITERIEN_TEXT', 'METRIC_WERT', 'SENS', 'SPEZ', 'ACC', 'AUC', 'P_DELONG', 'P_MCNEMAR', 'AUC_DIRECTION'].forEach(metricPart => {
                    placeholderData[`BF${suffix}_${metricPart}`] = na;
                    if(metricPart.startsWith('P_') || metricPart.endsWith('DIRECTION')) placeholderData[`AS_VS_BF_${metricPart}${suffix}`] = na;
                });
            }
        });
        placeholderData['FALLS_BF_NICHT_VERFUEGBAR_TEXT'] = bfDataAvailableForAll ? "" : (lang === 'de' ? ` (Hinweis: Für mindestens ein Kollektiv konnten keine optimalen Brute-Force-Kriterien für die Zielmetrik '${ZIELMETRIK_BRUTE_FORCE_PUBLIKATION}' ermittelt werden.)` : ` (Note: Optimized brute-force criteria for the target metric '${ZIELMETRIK_BRUTE_FORCE_PUBLIKATION}' could not be determined for at least one cohort.)`);

        return placeholderData;
    }

    function _replacePlaceholders(templateString, dataObject) {
        if (typeof templateString !== 'string') return '';
        return templateString.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const value = dataObject[key];
            return (value !== undefined && value !== null) ? String(value) : match;
        });
    }

    function _generatePublicationSectionHTML(sectionId, lang, placeholderData) {
        const sectionTemplates = PUBLICATION_TEXTS[sectionId]?.[lang];
        if (!sectionTemplates) return `<p>Error: Template for section '${sectionId}' in language '${lang}' not found.</p>`;

        let html = '';
        if (sectionTemplates.introduction_title && sectionTemplates.introduction_content && sectionId === 'methoden') {
             html += `<h3>${_replacePlaceholders(sectionTemplates.introduction_title, placeholderData)}</h3>`;
             html += `<p>${_replacePlaceholders(sectionTemplates.introduction_content, placeholderData)}</p>`;
        }

        html += `<h3>${_replacePlaceholders(sectionTemplates.studyPopulation_title, placeholderData)}</h3>`;
        html += `<p>${_replacePlaceholders(sectionTemplates.studyPopulation_content, placeholderData)}</p>`;
        html += `<h3>${_replacePlaceholders(sectionTemplates.mriProtocol_title, placeholderData)}</h3>`;
        html += `<p>${_replacePlaceholders(sectionTemplates.mriProtocol_content, placeholderData)}</p>`;
        html += `<h3>${_replacePlaceholders(sectionTemplates.imageAnalysis_title, placeholderData)}</h3>`;
        html += `<h4>${_replacePlaceholders(sectionTemplates.imageAnalysis_avocadoSign_title || (lang === 'de' ? 'Avocado Sign Bewertung' : 'Avocado Sign Assessment'), placeholderData)}</h4>`;
        html += `<p>${_replacePlaceholders(sectionTemplates.imageAnalysis_avocadoSign_content, placeholderData)}</p>`;
        html += `<h4>${_replacePlaceholders(sectionTemplates.imageAnalysis_t2Criteria_title || (lang === 'de' ? 'T2-gewichtete Kriterienbewertung' : 'T2-weighted Criteria Assessment'), placeholderData)}</h4>`;
        html += `<p>${_replacePlaceholders(sectionTemplates.imageAnalysis_t2Criteria_content, placeholderData)}</p>`;

        if (sectionTemplates.imageAnalysis_literatureT2Criteria_title) {
             html += `<h5>${_replacePlaceholders(sectionTemplates.imageAnalysis_literatureT2Criteria_title, placeholderData)}</h5>`;
             html += `<p>${_replacePlaceholders(sectionTemplates.imageAnalysis_literatureT2Criteria_content, placeholderData)}</p>`;
        }
        if (sectionTemplates.imageAnalysis_bruteForceT2Criteria_title) {
             html += `<h5>${_replacePlaceholders(sectionTemplates.imageAnalysis_bruteForceT2Criteria_title, placeholderData)}</h5>`;
             html += `<p>${_replacePlaceholders(sectionTemplates.imageAnalysis_bruteForceT2Criteria_content, placeholderData)}</p>`;
        }

        html += `<h4>${_replacePlaceholders(sectionTemplates.referenceStandard_title, placeholderData)}</h4>`;
        html += `<p>${_replacePlaceholders(sectionTemplates.referenceStandard_content, placeholderData)}</p>`;
        html += `<h4>${_replacePlaceholders(sectionTemplates.statisticalAnalysis_title, placeholderData)}</h4>`;
        html += `<p>${_replacePlaceholders(sectionTemplates.statisticalAnalysis_content, placeholderData)}</p>`;

        return html;
    }


    function _generateErgebnisseSectionHTML(lang, placeholderData) {
        const sectionTemplates = PUBLICATION_TEXTS.ergebnisse?.[lang];
        if (!sectionTemplates) return `<p>Error: Template for section 'ergebnisse' in language '${lang}' not found.</p>`;
        let html = '';

        html += `<h3>${_replacePlaceholders(sectionTemplates.cohortCharacteristics_title, placeholderData)}</h3>`;
        html += `<p>${_replacePlaceholders(sectionTemplates.cohortCharacteristics_content, placeholderData)}</p>`;
        html += `<div class="publication-table-placeholder" data-table-ref="${placeholderData['TABLE_REF_PAT_CHARS']}"></div>`;

        html += `<h3>${_replacePlaceholders(sectionTemplates.avocadoSignPerformance_title, placeholderData)}</h3>`;
        html += `<p>${_replacePlaceholders(sectionTemplates.avocadoSignPerformance_content, placeholderData)}</p>`;
        html += `<div class="publication-table-placeholder" data-table-ref="${placeholderData['TABLE_REF_AS_PERFORMANCE']}"></div>`;
        html += `<div class="publication-chart-placeholder" data-chart-ref="${placeholderData['FIG_REF_AS_PERFORMANCE_BARPLOT']}" style="max-width: 700px; margin: 1em auto;"></div>`;


        html += `<h3>${_replacePlaceholders(sectionTemplates.t2CriteriaPerformance_title, placeholderData)}</h3>`;
        if(sectionTemplates.t2CriteriaPerformance_intro_content) html += `<p>${_replacePlaceholders(sectionTemplates.t2CriteriaPerformance_intro_content, placeholderData)}</p>`;
        html += `<p>${_replacePlaceholders(sectionTemplates.t2CriteriaPerformance_koh_content, placeholderData)}</p>`;
        html += `<p>${_replacePlaceholders(sectionTemplates.t2CriteriaPerformance_barbaro_content, placeholderData)}</p>`;
        html += `<p>${_replacePlaceholders(sectionTemplates.t2CriteriaPerformance_rutegard_content, placeholderData)}</p>`;
        html += `<div class="publication-table-placeholder" data-table-ref="${placeholderData['TABLE_REF_LIT_T2_PERFORMANCE']}"></div>`;


        html += `<h3>${_replacePlaceholders(sectionTemplates.bruteForceOptimalT2_title, placeholderData)}</h3>`;
        html += `<p>${_replacePlaceholders(sectionTemplates.bruteForceOptimalT2_content, placeholderData)}</p>`;
        html += `<div class="publication-table-placeholder" data-table-ref="${placeholderData['TABLE_REF_BF_T2_PERFORMANCE']}"></div>`;

        html += `<h3>${_replacePlaceholders(sectionTemplates.comparisonAsVsT2_title, placeholderData)}</h3>`;
        html += `<p>${_replacePlaceholders(sectionTemplates.comparisonAsVsT2_content, placeholderData)}</p>`;
        html += `<div class="publication-table-placeholder" data-table-ref="${placeholderData['TABLE_REF_AS_VS_LIT_T2_COMPARISON']}"></div>`;
        html += `<div class="publication-table-placeholder" data-table-ref="${placeholderData['TABLE_REF_AS_VS_BF_T2_COMPARISON']}"></div>`;
        html += `<div class="publication-chart-placeholder" data-chart-ref="${placeholderData['FIG_REF_ROC_COMPARISON']}" style="max-width: 550px; margin: 1em auto;"></div>`;
        html += `<div class="publication-chart-placeholder" data-chart-ref="${placeholderData['FIG_REF_METRIC_COMPARISON_BARCHART']}" style="max-width: 700px; margin: 1em auto;"></div>`;

        return html;
    }


    function getTableDataForPublication(tableReferenceKey, placeholderData, lang, allProcessedData) {
        const na = lang === 'de' ? NA_TEXT_DE : NA_TEXT_EN;
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const formatPerfRowForTable = (perfData, digits = 1, isPercent = true) => _formatCIValue(perfData, digits, isPercent, lang);

        if (tableReferenceKey === placeholderData['TABLE_REF_PAT_CHARS']) {
            const headers = [lang === 'de' ? 'Merkmal' : 'Characteristic', `${getKollektivDisplayName('Gesamt')} (N=${placeholderData['PATIENT_COUNT_GESAMT']})`, `${getKollektivDisplayName('direkt OP')} (N=${placeholderData['PATIENT_COUNT_DIREKT_OP']})`, `${getKollektivDisplayName('nRCT')} (N=${placeholderData['PATIENT_COUNT_NRCT']})`];
            const rows = [
                [lang === 'de' ? 'Alter, Median (Bereich) [Jahre]' : 'Age, Median (Range) [Years]', `${placeholderData['ALTER_MEDIAN_GESAMT']} (${placeholderData['MIN_ALTER_GESAMT']}–${placeholderData['MAX_ALTER_GESAMT']})`, `${_formatPublicationValue(statisticsService.calculateDescriptiveStats(dataProcessor.filterDataByKollektiv(allProcessedData, 'direkt OP'))?.alter?.median,1,false,lang)} (${_formatPublicationValue(statisticsService.calculateDescriptiveStats(dataProcessor.filterDataByKollektiv(allProcessedData, 'direkt OP'))?.alter?.min,0,false,lang)}–${_formatPublicationValue(statisticsService.calculateDescriptiveStats(dataProcessor.filterDataByKollektiv(allProcessedData, 'direkt OP'))?.alter?.max,0,false,lang)})`, `${_formatPublicationValue(statisticsService.calculateDescriptiveStats(dataProcessor.filterDataByKollektiv(allProcessedData, 'nRCT'))?.alter?.median,1,false,lang)} (${_formatPublicationValue(statisticsService.calculateDescriptiveStats(dataProcessor.filterDataByKollektiv(allProcessedData, 'nRCT'))?.alter?.min,0,false,lang)}–${_formatPublicationValue(statisticsService.calculateDescriptiveStats(dataProcessor.filterDataByKollektiv(allProcessedData, 'nRCT'))?.alter?.max,0,false,lang)})`],
                [lang === 'de' ? 'Männlich, n (%)' : 'Male, n (%)', `${placeholderData['ANZAHL_MAENNLICH_GESAMT']} (${placeholderData['PROZENT_MAENNLICH_GESAMT']}%)`, `${statisticsService.calculateDescriptiveStats(dataProcessor.filterDataByKollektiv(allProcessedData, 'direkt OP'))?.geschlecht?.m ?? 0} (${_formatPublicationValue( (statisticsService.calculateDescriptiveStats(dataProcessor.filterDataByKollektiv(allProcessedData, 'direkt OP'))?.geschlecht?.m ?? 0) / placeholderData['PATIENT_COUNT_DIREKT_OP'], 0, true, lang )})`, `${statisticsService.calculateDescriptiveStats(dataProcessor.filterDataByKollektiv(allProcessedData, 'nRCT'))?.geschlecht?.m ?? 0} (${_formatPublicationValue( (statisticsService.calculateDescriptiveStats(dataProcessor.filterDataByKollektiv(allProcessedData, 'nRCT'))?.geschlecht?.m ?? 0) / placeholderData['PATIENT_COUNT_NRCT'], 0, true, lang )})`],
                [lang === 'de' ? 'Pathologisch N+, n (%)' : 'Pathologically N+, n (%)', `${placeholderData['ANZAHL_NPLUS_GESAMT']} (${placeholderData['PROZENT_NPLUS_GESAMT']}%)`, `${placeholderData['ANZAHL_NPLUS_DIREKT_OP']} (${placeholderData['PROZENT_NPLUS_DIREKT_OP']}%)`, `${placeholderData['ANZAHL_NPLUS_NRCT']} (${placeholderData['PROZENT_NPLUS_NRCT']}%)`]
            ];
            return { id: 'pub-table-pat-chars', title: _replacePlaceholders(_getLocalizedText('ergebnisse', 'cohortCharacteristics_title', lang), placeholderData) + ` (${lang === 'de' ? 'Tabelle' : 'Table'} 1)`, headers: headers, rows: rows };
        }

        if (tableReferenceKey === placeholderData['TABLE_REF_LIT_T2_DEFINITIONS']) {
            const headers = [{text: lang === 'de' ? 'Kriterienset' : 'Criteria Set'}, {text: lang === 'de' ? 'Prim. Anwendg.-Koll.' : 'Prim. Appl. Cohort'}, {text: lang === 'de' ? 'Kernkriterien (Zusammenfassung)' : 'Key Criteria (Summary)'}, {text: lang === 'de' ? 'Referenz & Details (Originalstudie)' : 'Reference & Details (Original Study)'}];
            const rows = [];
            const litSets = ['koh_2008_morphology', 'barbaro_2024_restaging', 'rutegard_et_al_esgar'];
            litSets.forEach(setId => { const set = studyT2CriteriaManager.getStudyCriteriaSetById(setId); if(set) rows.push([set.name, getKollektivDisplayName(set.applicableKollektiv), set.studyInfo.keyCriteriaSummary, `${set.studyInfo.reference}<br><small><em>${lang === 'de' ? 'Fokus' : 'Focus'}:</em> ${set.studyInfo.focus}</small><br><small><em>${lang === 'de' ? 'Orig.-Koll.' : 'Orig. Cohort'}:</em> ${set.studyInfo.patientCohort}</small>`]); });
            return { id: 'pub-table-lit-t2-defs', title: `${lang === 'de' ? 'Tabelle' : 'Table'} 2: ${_getLocalizedText('methoden', 'imageAnalysis_literatureT2Criteria_title', lang)}`, headers: headers.map(h=>h.text), rows: rows };
        }

        const metricKeys = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'];
        const metricLabels = { sens: 'Sensitivität', spez: 'Spezifität', ppv: 'PPV', npv: 'NPV', acc: 'Accuracy', auc: 'AUC'};
        const metricLabelsEn = { sens: 'Sensitivity', spez: 'Specificity', ppv: 'PPV', npv: 'NPV', acc: 'Accuracy', auc: 'AUC'};
        const currentMetricLabels = lang === 'de' ? metricLabels : metricLabelsEn;

        if (tableReferenceKey === placeholderData['TABLE_REF_AS_PERFORMANCE']) {
            const headers = [{text: lang === 'de' ? 'Metrik' : 'Metric'}];
            kollektive.forEach(k_id => headers.push({text: `${getKollektivDisplayName(k_id)} (N=${placeholderData[`PATIENT_COUNT_${k_id.toUpperCase().replace(' ','_')}`]})`}));
            const rows = metricKeys.map(metricKey => {
                const row = [currentMetricLabels[metricKey]];
                kollektive.forEach(k_id => {
                    const suffix = k_id === 'Gesamt' ? '_GESAMT' : (k_id === 'direkt OP' ? '_DIREKT_OP' : '_NRCT');
                    row.push(placeholderData[`AS_${metricKey.toUpperCase()}${suffix}`]);
                });
                return row;
            });
            return { id: 'pub-table-as-perf', title: `${lang === 'de' ? 'Tabelle' : 'Table'} 3: ${_getLocalizedText('ergebnisse', 'avocadoSignPerformance_title', lang)}`, headers: headers.map(h=>h.text), rows: rows, notes: (lang === 'de' ? 'Werte in % (95% CI), außer AUC.' : 'Values in % (95% CI), except AUC.') };
        }

        if (tableReferenceKey === placeholderData['TABLE_REF_LIT_T2_PERFORMANCE']) {
            const headers = [{text: lang === 'de' ? 'Kriterienset' : 'Criteria Set'}, {text: lang==='de' ? 'Anwend.-Koll. (N)' : 'Appl. Cohort (N)'}, ...metricKeys.map(k => currentMetricLabels[k])];
            const rows = [];
            literatureSets.forEach(litSetInfo => {
                const row = [studyT2CriteriaManager.getStudyCriteriaSetById(litSetInfo.id)?.name, `${placeholderData[`${litSetInfo.keyPrefix}_APPLICABLE_KOLLEKTIV_NAME`]} (N=${placeholderData[`${litSetInfo.keyPrefix}_PATIENT_COUNT`]})`];
                metricKeys.forEach(mk => row.push(placeholderData[`${litSetInfo.keyPrefix}_${mk.toUpperCase()}`]));
                rows.push(row);
            });
            return { id: 'pub-table-lit-perf', title: `${lang === 'de' ? 'Tabelle' : 'Table'} 4: ${_getLocalizedText('ergebnisse', 't2CriteriaPerformance_title', lang)}`, headers: headers.map(h=>h.text), rows: rows, notes: (lang === 'de' ? 'Werte in % (95% CI), außer AUC.' : 'Values in % (95% CI), except AUC.') };
        }

        if (tableReferenceKey === placeholderData['TABLE_REF_BF_T2_PERFORMANCE']) {
             const headers = [{text: lang === 'de' ? 'Kollektiv (N)' : 'Cohort (N)'}, {text: lang==='de' ? 'Optimierte T2 Kriterien (Logik)' : 'Optimized T2 Criteria (Logic)'}, {text: `${lang==='de'?'Erreichte':'Achieved'} ${ZIELMETRIK_BRUTE_FORCE_PUBLIKATION}`}, ...metricKeys.map(k => currentMetricLabels[k])];
             const rows = [];
             kollektive.forEach(k_id => {
                const suffix = k_id === 'Gesamt' ? '_GESAMT' : (k_id === 'direkt OP' ? '_DIREKT_OP' : '_NRCT');
                const row = [
                    `${getKollektivDisplayName(k_id)} (N=${placeholderData[`BF${suffix}_N`]})`,
                    placeholderData[`BF${suffix}_LOGIC_OPERATOR`] !== na ? `${placeholderData[`BF${suffix}_KRITERIEN_TEXT`]} (${placeholderData[`BF${suffix}_LOGIC_OPERATOR`]})` : na,
                    placeholderData[`BF_METRIC${suffix}_WERT`]
                ];
                metricKeys.forEach(mk => row.push(placeholderData[`BF_${mk.toUpperCase()}${suffix}`]));
                rows.push(row);
             });
             return { id: 'pub-table-bf-perf', title: `${lang === 'de' ? 'Tabelle' : 'Table'} 5: ${_getLocalizedText('ergebnisse', 'bruteForceOptimalT2_title', lang)}`, headers: headers.map(h=>h.text), rows: rows, notes: (lang === 'de' ? `Optimierung basierend auf Maximierung der ${ZIELMETRIK_BRUTE_FORCE_PUBLIKATION}. Werte in % (95% CI), außer AUC und Erreichte Zielmetrik.` : `Optimization based on maximizing ${ZIELMETRIK_BRUTE_FORCE_PUBLIKATION}. Values in % (95% CI), except AUC and Achieved Target Metric.`) };
        }

         if (tableReferenceKey === placeholderData['TABLE_REF_AS_VS_LIT_T2_COMPARISON'] || tableReferenceKey === placeholderData['TABLE_REF_AS_VS_BF_T2_COMPARISON']) {
            const isLit = tableReferenceKey === placeholderData['TABLE_REF_AS_VS_LIT_T2_COMPARISON'];
            const headers = [lang === 'de' ? 'Vergleich AS vs.' : 'Comparison AS vs.', lang === 'de' ? 'Kollektiv' : 'Cohort', 'Accuracy (p McNemar)', 'AUC (p DeLong)'];
            const rows = [];
            const setsToCompare = isLit ? literatureSets : kollektive.map(k_id => ({
                keyPrefix: `BF_${k_id.toUpperCase().replace(' ','_')}`,
                applicableKollektiv: k_id,
                name: `${lang==='de'?'Opt. T2':'Opt. T2'} (${getKollektivDisplayName(k_id)})`
            }));

            setsToCompare.forEach(setInfo => {
                const displayName = isLit ? studyT2CriteriaManager.getStudyCriteriaSetById(setInfo.id)?.displayShortName : setInfo.name;
                rows.push([
                    displayName,
                    getKollektivDisplayName(setInfo.applicableKollektiv),
                    `${placeholderData[`AS_VS_${setInfo.keyPrefix}_P_MCNEMAR`]}`,
                    `${placeholderData[`AS_VS_${setInfo.keyPrefix}_P_DELONG`]}`,
                ]);
            });
            const tableIdSuffix = isLit ? 'lit' : 'bf';
            const tableTitle = `${lang === 'de' ? 'Tabelle' : 'Table'} 6${isLit ? 'A' : 'B'}: Statistische Vergleiche AS vs. ${isLit ? 'Literatur-T2' : 'Brute-Force T2'}`;
            return { id: `pub-table-stat-comp-${tableIdSuffix}`, title: tableTitle, headers: headers, rows: rows, notes: lang==='de'?'Vergleich der Accuracy mittels McNemar-Test und der AUC mittels DeLong-Test. Signifikanzniveau p < 0.05.':'Comparison of accuracy using McNemar test and AUC using DeLong test. Significance level p < 0.05.' };
        }


        return null;
    }

    function getChartDataForPublication(chartReferenceKey, placeholderData, lang, allProcessedData) {
        const na = lang === 'de' ? NA_TEXT_DE : NA_TEXT_EN;
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];

        if (chartReferenceKey === placeholderData['FIG_REF_AS_PERFORMANCE_BARPLOT']) {
            const chartData = [];
            const metricsForBarChart = ['sens', 'spez', 'acc', 'auc'];
            const metricLabels = { sens: 'Sens.', spez: 'Spez.', acc: 'Acc.', auc: 'AUC'};

            metricsForBarChart.forEach(metricKey => {
                const entry = { metric: metricLabels[metricKey] };
                 kollektive.forEach(k_id => {
                    const suffix = k_id === 'Gesamt' ? '_GESAMT' : (k_id === 'direkt OP' ? '_DIREKT_OP' : '_NRCT');
                    const perfValue = parseFloat(String(placeholderData[`AS_${metricKey.toUpperCase()}${suffix}`]).split(' ')[0].replace(',','.'));
                    entry[getKollektivDisplayName(k_id)] = isNaN(perfValue) ? 0 : perfValue / (metricKey !== 'auc' ? 100 : 1);
                });
                chartData.push(entry);
            });

            return {
                type: 'groupedBar',
                data: chartData,
                options: {
                    title: lang === 'de' ? `Abb. 2A: Avocado Sign Performance über Kollektive` : `Fig. 2A: Avocado Sign Performance Across Cohorts`,
                    xLabel: lang === 'de' ? 'Diagnostische Metrik' : 'Diagnostic Metric',
                    yLabel: lang === 'de' ? 'Wert' : 'Value',
                    subgroups: kollektive.map(k => getKollektivDisplayName(k)),
                    barColors: [APP_CONFIG.CHART_SETTINGS.AS_COLOR, '#6E96C2', '#A2C4E0'],
                    yAxisMax: 1.0, yAxisTickFormat: '.0%', height: 350, legendBelow: true
                }
            };
        }

        if (chartReferenceKey === placeholderData['FIG_REF_ROC_COMPARISON']) {
            const rocDataSets = [];
            const dataGesamt = dataProcessor.filterDataByKollektiv(allProcessedData, 'Gesamt');

            const asRocData = dataProcessor.calculateROCLikeData(dataGesamt, 'as', 'n');
            if(asRocData && asRocData.rocPoints && asRocData.rocPoints.length > 1) {
                 rocDataSets.push({
                    name: `${UI_TEXTS.legendLabels.avocadoSign} (AUC: ${placeholderData['AS_AUC_GESAMT'].split(' (')[0]})`,
                    data: asRocData.rocPoints,
                    color: APP_CONFIG.CHART_SETTINGS.AS_COLOR,
                    auc: {value: parseFloat(placeholderData['AS_AUC_GESAMT'].split(' (')[0].replace(',','.')) }
                });
            }

            const rutegardSet = studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar');
            if (rutegardSet) {
                const evalRutegard = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataGesamt), rutegardSet);
                const rutegardRocData = dataProcessor.calculateROCLikeData(evalRutegard, 't2', 'n');
                 if(rutegardRocData && rutegardRocData.rocPoints && rutegardRocData.rocPoints.length > 1) {
                    rocDataSets.push({
                        name: `${rutegardSet.displayShortName} (AUC: ${placeholderData[`RUTEGARD_AUC`].split(' (')[0]})`,
                        data: rutegardRocData.rocPoints,
                        color: APP_CONFIG.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN,
                        auc: {value: parseFloat(placeholderData[`RUTEGARD_AUC`].split(' (')[0].replace(',','.')) }
                    });
                }
            }

            const bfResultGesamt = _runSingleBruteForceOptimization(dataGesamt, ZIELMETRIK_BRUTE_FORCE_PUBLIKATION);
            if(bfResultGesamt && bfResultGesamt.bestCriteria) {
                const bfDataGesamt = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataGesamt), {criteria: bfResultGesamt.bestCriteria, logic: bfResultGesamt.bestLogic, id:'bf_temp_roc_pub'});
                const bfRocDataPoints = dataProcessor.calculateROCLikeData(bfDataGesamt, 't2', 'n');
                if(bfRocDataPoints && bfRocDataPoints.rocPoints && bfRocDataPoints.rocPoints.length > 1) {
                    rocDataSets.push({
                        name: `${lang === 'de' ? 'Opt. T2' : 'Opt. T2'} (AUC: ${placeholderData[`BF_AUC_GESAMT`].split(' (')[0]})`,
                        data: bfRocDataPoints.rocPoints,
                        color: APP_CONFIG.CHART_SETTINGS.TERTIARY_COLOR_GREEN,
                        auc: {value: parseFloat(placeholderData[`BF_AUC_GESAMT`].split(' (')[0].replace(',','.')) }
                    });
                }
            }

            return {
                type: 'roc',
                data: rocDataSets,
                options: {
                    title: lang === 'de' ? `Abb. 1: ROC-Kurven (Gesamtkollektiv)` : `Fig. 1: ROC Curves (Overall Cohort)`,
                    showPoints: false, height: 380, legendBelow: true, legendItemCount: rocDataSets.length
                }
            };
        }
         if (chartReferenceKey === placeholderData['FIG_REF_METRIC_COMPARISON_BARCHART']) {
            const chartData = [];
            const metricToPlot = 'auc';
            const metricDisplayName = lang==='de' ? 'AUC' : 'AUC';

            kollektive.forEach(k_id => {
                const suffix = k_id === 'Gesamt' ? '_GESAMT' : (k_id === 'direkt OP' ? '_DIREKT_OP' : '_NRCT');
                const entry = { Kollektiv: getKollektivDisplayName(k_id) };
                entry[UI_TEXTS.legendLabels.avocadoSign] = parseFloat(String(placeholderData[`AS_${metricToPlot.toUpperCase()}${suffix}`]).split(' ')[0].replace(',','.'));

                const rutegardSet = studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar');
                let rutegardPerfOnKollektiv = NaN;
                if(rutegardSet && (k_id === 'Gesamt' || k_id === rutegardSet.applicableKollektiv)){
                     const dataForEval = dataProcessor.filterDataByKollektiv(allProcessedData, k_id);
                     const evalRutegard = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataForEval), rutegardSet);
                     rutegardPerfOnKollektiv = statisticsService.calculateDiagnosticPerformance(evalRutegard, 't2', 'n')?.[metricToPlot]?.value;
                }
                entry[rutegardSet.displayShortName] = rutegardPerfOnKollektiv;


                const bfResultKollektiv = _runSingleBruteForceOptimization(dataProcessor.filterDataByKollektiv(allProcessedData, k_id), ZIELMETRIK_BRUTE_FORCE_PUBLIKATION);
                let bfPerfOnKollektiv = NaN;
                if(bfResultKollektiv && bfResultKollektiv.bestCriteria) {
                    const dataForEval = dataProcessor.filterDataByKollektiv(allProcessedData, k_id);
                    const bfEvalData = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataForEval), {criteria: bfResultKollektiv.bestCriteria, logic: bfResultKollektiv.bestLogic, id:`bf_temp_bar_${k_id}`});
                    bfPerfOnKollektiv = statisticsService.calculateDiagnosticPerformance(bfEvalData, 't2', 'n')?.[metricToPlot]?.value;
                }
                entry[lang === 'de' ? 'Opt. T2' : 'Opt. T2'] = bfPerfOnKollektiv;
                chartData.push(entry);
            });

             return {
                type: 'groupedBar',
                data: chartData.map(d => { const newD = {metric: d.Kollektiv}; delete d.Kollektiv; Object.assign(newD, d); return newD; }),
                options: {
                    title: lang === 'de' ? `Abb. 2B: ${metricDisplayName}-Vergleich über Kollektive` : `Fig. 2B: ${metricDisplayName} Comparison Across Cohorts`,
                    xLabel: lang === 'de' ? 'Patientenkollektiv' : 'Patient Cohort',
                    yLabel: metricDisplayName,
                    subgroups: [UI_TEXTS.legendLabels.avocadoSign, studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar').displayShortName, (lang === 'de' ? 'Opt. T2' : 'Opt. T2')],
                    barColors: [APP_CONFIG.CHART_SETTINGS.AS_COLOR, APP_CONFIG.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN, APP_CONFIG.CHART_SETTINGS.TERTIARY_COLOR_GREEN],
                    yAxisMax: 1.0, yAxisTickFormat: '.2f', height: 380, legendBelow: true, x0PaddingInner: 0.2, x1Padding: 0.1
                }
            };
        }


        return null;
    }


    function getPublicationSectionContent(sectionId, lang, allProcessedData) {
        let title = '', mainTextHTML = '', supportingData = { tables: [], charts: [] };
        const naPub = lang === 'de' ? NA_TEXT_DE : NA_TEXT_EN;

        try {
            const placeholderData = _getPlaceholderData(allProcessedData, lang);
            if (sectionId === 'methoden') {
                title = _getLocalizedText('methoden', 'title', lang);
                mainTextHTML = _generatePublicationSectionHTML('methoden', lang, placeholderData);
                const tableM1Data = getTableDataForPublication(placeholderData['TABLE_REF_LIT_T2_DEFINITIONS'], placeholderData, lang, allProcessedData);
                if(tableM1Data) supportingData.tables.push(tableM1Data);

            } else if (sectionId === 'ergebnisse') {
                title = _getLocalizedText('ergebnisse', 'title', lang);
                mainTextHTML = _generateErgebnisseSectionHTML(lang, placeholderData);
                const tableRefsErgebnisse = [
                    placeholderData['TABLE_REF_PAT_CHARS'],
                    placeholderData['TABLE_REF_AS_PERFORMANCE'],
                    placeholderData['TABLE_REF_LIT_T2_PERFORMANCE'],
                    placeholderData['TABLE_REF_BF_T2_PERFORMANCE'],
                    placeholderData['TABLE_REF_AS_VS_LIT_T2_COMPARISON'],
                    placeholderData['TABLE_REF_AS_VS_BF_T2_COMPARISON']
                ];
                tableRefsErgebnisse.forEach(ref => {
                    const tableData = getTableDataForPublication(ref, placeholderData, lang, allProcessedData);
                    if(tableData) supportingData.tables.push(tableData);
                });

                const chartRefsErgebnisse = [
                    placeholderData['FIG_REF_AS_PERFORMANCE_BARPLOT'],
                    placeholderData['FIG_REF_ROC_COMPARISON'],
                    placeholderData['FIG_REF_METRIC_COMPARISON_BARCHART']
                ];
                 chartRefsErgebnisse.forEach(ref => {
                    const chartData = getChartDataForPublication(ref, placeholderData, lang, allProcessedData);
                    if(chartData) supportingData.charts.push(chartData);
                });


            } else {
                title = lang === 'de' ? 'Unbekannter Abschnitt' : 'Unknown Section';
                mainTextHTML = `<p>${lang === 'de' ? 'Inhalt für diesen Abschnitt nicht verfügbar.' : 'Content for this section is not available.'}</p>`;
            }
        } catch (error) {
            console.error(`Fehler beim Generieren des Inhalts für Publikationsabschnitt '${sectionId}' (${lang}):`, error);
            mainTextHTML = `<p class="text-danger">${lang === 'de' ? 'Ein Fehler ist beim Generieren dieses Abschnitts aufgetreten: ' : 'An error occurred while generating this section: '}${error.message}</p>`;
            supportingData.tables = [];
            supportingData.charts = [];
        }
        return { title, mainTextHTML, supportingData };
    }

    return Object.freeze({
        getPublicationSectionContent,
        getTableDataForPublication,
        getChartDataForPublication
    });

})();