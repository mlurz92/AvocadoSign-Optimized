const publicationTextGenerator = (() => {

    function _formatNumberForText(value, digits = 1, lang = 'de', useStandardFormatForNumber = false) {
        if (value === null || value === undefined || isNaN(value) || !isFinite(value)) return 'N/A';
        return formatNumber(value, digits, 'N/A', useStandardFormatForNumber);
    }

    function _formatPercentForText(value, digits = 1, lang = 'de') {
        if (value === null || value === undefined || isNaN(value) || !isFinite(value)) return 'N/A';
        return formatPercent(value, digits, 'N/A%');
    }

    function _formatMetricWithCIForText(metric, digits = 1, isPercent = true, lang = 'de') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return 'N/A';

        const useStandard = lang === 'en' && !isPercent;
        const valStr = isPercent ? _formatPercentForText(metric.value, digits, lang) : _formatNumberForText(metric.value, digits, lang, useStandard);
        if (valStr === 'N/A' || valStr === 'N/A%') return valStr;

        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper) && isFinite(metric.ci.lower) && isFinite(metric.ci.upper)) {
            const lowerStr = isPercent ? _formatPercentForText(metric.ci.lower, digits, lang) : _formatNumberForText(metric.ci.lower, digits, lang, useStandard);
            const upperStr = isPercent ? _formatPercentForText(metric.ci.upper, digits, lang) : _formatNumberForText(metric.ci.upper, digits, lang, useStandard);

            if (lowerStr === 'N/A' || lowerStr === 'N/A%' || upperStr === 'N/A' || upperStr === 'N/A%') return valStr;

            const ciText = lang === 'de' ? '95%-KI' : '95% CI';
            return `${valStr} (${ciText}: ${lowerStr} \u2013 ${upperStr})`;
        }
        return valStr;
    }

    function _getPValueTextForPublication(pValue, lang = 'de') {
        if (pValue === null || pValue === undefined || isNaN(pValue) || !isFinite(pValue)) return 'N/A';
        return getPValueText(pValue, lang);
    }

    function _getSafeLink(elementId, linkText) {
        return `<a href="#${elementId}">${linkText}</a>`;
    }

    function _getKollektivTextForPublication(kollektivId, n, lang = 'de') {
        const name = getKollektivDisplayName(kollektivId);
        const nText = `N=${_formatNumberForText(n, 0, lang, true)}`;
        return `${name} (${nText})`;
    }

    function _preparePlaceholderData(sectionId, lang, allKollektivStats, commonData) {
        const placeholderData = { ...commonData };
        placeholderData.LANG = lang;

        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        placeholderData.N_GESAMT = _formatNumberForText(commonData.nGesamt, 0, lang, true);
        placeholderData.N_NRCT = _formatNumberForText(commonData.nNRCT, 0, lang, true);
        placeholderData.N_DIREKT_OP = _formatNumberForText(commonData.nDirektOP, 0, lang, true);

        if (pCharGesamt) {
            placeholderData.MEDIAN_AGE_GESAMT = _formatNumberForText(pCharGesamt.alter?.median, 1, lang, lang === 'en');
            placeholderData.MEDIAN_AGE_GESAMT_EN = _formatNumberForText(pCharGesamt.alter?.median, 1, 'en', true);
            placeholderData.MIN_AGE_GESAMT = _formatNumberForText(pCharGesamt.alter?.min, 0, lang, lang === 'en');
            placeholderData.MAX_AGE_GESAMT = _formatNumberForText(pCharGesamt.alter?.max, 0, lang, lang === 'en');
            placeholderData.MIN_AGE_GESAMT_EN = _formatNumberForText(pCharGesamt.alter?.min, 0, 'en', true);
            placeholderData.MAX_AGE_GESAMT_EN = _formatNumberForText(pCharGesamt.alter?.max, 0, 'en', true);
            placeholderData.N_MALE_GESAMT = _formatNumberForText(pCharGesamt.geschlecht?.m, 0, lang, true);
            placeholderData.PERCENT_MALE_GESAMT = _formatPercentForText(pCharGesamt.anzahlPatienten > 0 ? (pCharGesamt.geschlecht?.m || 0) / pCharGesamt.anzahlPatienten : NaN, 0, lang);
            placeholderData.N_PLUS_GESAMT = _formatNumberForText(pCharGesamt.nStatus?.plus, 0, lang, true);
            placeholderData.PERCENT_N_PLUS_GESAMT = _formatPercentForText(pCharGesamt.nStatus?.plus && pCharGesamt.anzahlPatienten > 0 ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN, 1, lang);
        }

        placeholderData.ETHICS_VOTE_NUMBER = commonData.references?.ethicsVoteNumber || '2023-101-Evokationsnummer';
        placeholderData.STUDY_PERIOD = commonData.references?.lurzSchaefer2025StudyPeriod || (lang === 'de' ? 'Januar 2020 und November 2023' : 'January 2020 and November 2023');
        placeholderData.MRT_SYSTEM = commonData.references?.lurzSchaefer2025MRISystem || (lang === 'de' ? '3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers)' : '3.0-T system (MAGNETOM Prisma Fit; Siemens Healthineers)');
        placeholderData.CONTRAST_AGENT_AS = commonData.references?.lurzSchaefer2025ContrastAgent || (lang === 'de' ? 'Gadoteridol (ProHance; Bracco)' : 'Gadoteridol (ProHance; Bracco)');
        placeholderData.T2_SLICE_THICKNESS = commonData.references?.lurzSchaefer2025T2SliceThickness || (lang === 'de' ? '2-3 mm' : '2-3 mm');
        const exp = commonData.references?.lurzSchaefer2025RadiologistExperience || ["29", "7", "19"];
        placeholderData.RADIOLOGIST_EXPERIENCE_1 = exp[0];
        placeholderData.RADIOLOGIST_EXPERIENCE_2 = exp[1];
        placeholderData.RADIOLOGIST_EXPERIENCE_3 = exp[2];

        placeholderData.STUDY_REF_AVOCADO_SIGN = commonData.references?.lurzSchaefer2025 || 'Lurz & Schäfer (2025)';
        placeholderData.STUDY_REF_KOH_2008 = commonData.references?.koh2008 || 'Koh et al. (2008)';
        placeholderData.STUDY_REF_KOH_2008_EN = commonData.references?.koh2008 || 'Koh et al. (2008)';
        placeholderData.STUDY_REF_BARBARO_2024 = commonData.references?.barbaro2024 || 'Barbaro et al. (2024)';
        placeholderData.STUDY_REF_BARBARO_2024_EN = commonData.references?.barbaro2024 || 'Barbaro et al. (2024)';
        placeholderData.STUDY_REF_ESGAR_2018 = commonData.references?.beetsTan2018ESGAR || 'Beets-Tan et al. (2018)';
        placeholderData.STUDY_REF_ESGAR_2018_EN = commonData.references?.beetsTan2018ESGAR || 'Beets-Tan et al. (2018)';
        placeholderData.STUDY_REF_RUTEGARD_2025 = commonData.references?.rutegard2025 || 'Rutegård et al. (2025)';
        placeholderData.STUDY_REF_RUTEGARD_2025_EN = commonData.references?.rutegard2025 || 'Rutegård et al. (2025)';

        placeholderData.TABLE_PATIENT_CHARACTERISTICS_REF_LINK = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id, lang === 'de' ? 'Tabelle 1' : 'Table 1');
        placeholderData.FIG_AGE_DISTRIBUTION_REF_LINK = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id, lang === 'de' ? 'Abbildung 1a' : 'Figure 1a');
        placeholderData.FIG_GENDER_DISTRIBUTION_REF_LINK = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id, lang === 'de' ? 'Abbildung 1b' : 'Figure 1b');
        placeholderData.TABLE_LITERATURE_T2_CRITERIA_REF_LINK = _getSafeLink(PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id, lang === 'de' ? 'Tabelle 2' : 'Table 2');
        placeholderData.TABLE_AS_PERFORMANCE_REF_LINK = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.id, lang === 'de' ? 'Tabelle 3' : 'Table 3');
        placeholderData.TABLE_LITERATURE_T2_PERFORMANCE_REF_LINK = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id, lang === 'de' ? 'Tabelle 4' : 'Table 4');
        placeholderData.TABLE_OPTIMIZED_T2_PERFORMANCE_REF_LINK = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id, lang === 'de' ? 'Tabelle 5' : 'Table 5');
        placeholderData.TABLE_COMPARISON_AS_VS_T2_REF_LINK = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.id, lang === 'de' ? 'Tabelle 6' : 'Table 6');
        placeholderData.FIG_COMPARISON_PERFORMANCE_GESAMT_REF_LINK = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.id, lang === 'de' ? 'Abbildung 2a' : 'Figure 2a');
        placeholderData.FIG_COMPARISON_PERFORMANCE_DIREKT_OP_REF_LINK = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartDirektOP.id, lang === 'de' ? 'Abbildung 2b' : 'Figure 2b');
        placeholderData.FIG_COMPARISON_PERFORMANCE_NRCT_REF_LINK = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartNRCT.id, lang === 'de' ? 'Abbildung 2c' : 'Figure 2c');

        placeholderData.KOH_2008_DEFINITION = studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology')?.studyInfo?.keyCriteriaSummary || (lang === 'de' ? 'Irreguläre Kontur ODER heterogenes Signal' : 'Irregular border OR heterogeneous signal');
        placeholderData.KOH_2008_DEFINITION_EN = studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology')?.studyInfo?.keyCriteriaSummary || 'Irregular border OR heterogeneous signal';
        placeholderData.KOH_2008_APPLICABLE_KOLLEKTIV = getKollektivDisplayName(studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology')?.applicableKollektiv || 'Gesamt');
        placeholderData.KOH_2008_APPLICABLE_KOLLEKTIV_EN = getKollektivDisplayName(studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology')?.applicableKollektiv || 'Gesamt');

        placeholderData.BARBARO_2024_DEFINITION = studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging')?.studyInfo?.keyCriteriaSummary || (lang === 'de' ? 'Kurzachse ≥ 2,3mm' : 'Short-axis diameter ≥ 2.3mm');
        placeholderData.BARBARO_2024_DEFINITION_EN = studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging')?.studyInfo?.keyCriteriaSummary || 'Short-axis diameter ≥ 2.3mm';
        placeholderData.BARBARO_2024_APPLICABLE_KOLLEKTIV = getKollektivDisplayName(studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging')?.applicableKollektiv || 'nRCT');
        placeholderData.BARBARO_2024_APPLICABLE_KOLLEKTIV_EN = getKollektivDisplayName(studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging')?.applicableKollektiv || 'nRCT');

        placeholderData.ESGAR_2016_RUTEGARD_2025_DEFINITION = studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar')?.studyInfo?.keyCriteriaSummary || (lang === 'de' ? 'Größe ≥9mm ODER (5-8mm UND ≥2 Merkmale) ODER (<5mm UND 3 Merkmale)' : 'Size ≥9mm OR (5-8mm AND ≥2 features) OR (<5mm AND 3 features)');
        placeholderData.ESGAR_2016_RUTEGARD_2025_DEFINITION_EN = studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar')?.studyInfo?.keyCriteriaSummary || 'Size ≥9mm OR (5-8mm AND ≥2 features) OR (<5mm AND 3 features)';
        placeholderData.ESGAR_2016_RUTEGARD_2025_APPLICABLE_KOLLEKTIV = getKollektivDisplayName(studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar')?.applicableKollektiv || 'direkt OP');
        placeholderData.ESGAR_2016_RUTEGARD_2025_APPLICABLE_KOLLEKTIV_EN = getKollektivDisplayName(studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar')?.applicableKollektiv || 'direkt OP');
        
        placeholderData.BF_TARGET_METRIC_NAME = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const formatBFDef = (kolId, currentLang) => {
            const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;
            if (bfDef && bfDef.criteria && bfDef.metricName === placeholderData.BF_TARGET_METRIC_NAME) {
                return studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, false);
            }
            return currentLang === 'de' ? 'Nicht für diese Metrik optimiert oder Ergebnis nicht verfügbar' : 'Not optimized for this metric or result not available';
        };
        const formatBFVal = (kolId, currentLang) => {
            const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;
             if (bfDef && bfDef.criteria && bfDef.metricName === placeholderData.BF_TARGET_METRIC_NAME) {
                return _formatNumberForText(bfDef.metricValue, 4, currentLang, currentLang === 'en');
            }
            return 'N/A';
        };

        placeholderData.BF_OPTIMIZED_GESAMT_DEFINITION = formatBFDef('Gesamt', lang);
        placeholderData.BF_OPTIMIZED_GESAMT_VALUE = formatBFVal('Gesamt', lang);
        placeholderData.BF_OPTIMIZED_DIREKT_OP_DEFINITION = formatBFDef('direkt OP', lang);
        placeholderData.BF_OPTIMIZED_DIREKT_OP_VALUE = formatBFVal('direkt OP', lang);
        placeholderData.BF_OPTIMIZED_NRCT_DEFINITION = formatBFDef('nRCT', lang);
        placeholderData.BF_OPTIMIZED_NRCT_VALUE = formatBFVal('nRCT', lang);

        placeholderData.BF_OPTIMIZED_GESAMT_DEFINITION_EN = formatBFDef('Gesamt', 'en');
        placeholderData.BF_OPTIMIZED_DIREKT_OP_DEFINITION_EN = formatBFDef('direkt OP', 'en');
        placeholderData.BF_OPTIMIZED_NRCT_DEFINITION_EN = formatBFDef('nRCT', 'en');


        placeholderData.APPLIED_T2_CRITERIA_STRING = studyT2CriteriaManager.formatCriteriaForDisplay(allKollektivStats?.Gesamt?.applied_criteria_definition?.criteria, allKollektivStats?.Gesamt?.applied_criteria_definition?.logic, false) || 'Keine Details';
        placeholderData.APPLIED_T2_CRITERIA_STRING_EN = studyT2CriteriaManager.formatCriteriaForDisplay(allKollektivStats?.Gesamt?.applied_criteria_definition?.criteria, allKollektivStats?.Gesamt?.applied_criteria_definition?.logic, false) || 'No details';


        placeholderData.ALPHA_LEVEL_TEXT = _formatNumberForText(commonData.significanceLevel, 2, lang, true);
        placeholderData.BOOTSTRAP_REPLICATIONS = _formatNumberForText(commonData.bootstrapReplications, 0, lang, true);
        placeholderData.CI_METHOD_PROPORTION = commonData.ciMethodProportion || APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION;
        placeholderData.CI_METHOD_EFFECTSIZE = commonData.ciMethodEffectSize || APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE;

        const nGesamtRaw = commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 0;
        const nDirektOpRaw = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 0;
        const nNrctRaw = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 0;

        placeholderData.KOLLEKTIV_TEXT_GESAMT = _getKollektivTextForPublication('Gesamt', nGesamtRaw, lang);
        placeholderData.KOLLEKTIV_TEXT_DIREKT_OP = _getKollektivTextForPublication('direkt OP', nDirektOpRaw, lang);
        placeholderData.KOLLEKTIV_TEXT_NRCT = _getKollektivTextForPublication('nRCT', nNrctRaw, lang);
        placeholderData.KOLLEKTIV_TEXT_GESAMT_EN = _getKollektivTextForPublication('Gesamt', nGesamtRaw, 'en');
        placeholderData.KOLLEKTIV_TEXT_DIREKT_OP_EN = _getKollektivTextForPublication('direkt OP', nDirektOpRaw, 'en');
        placeholderData.KOLLEKTIV_TEXT_NRCT_EN = _getKollektivTextForPublication('nRCT', nNrctRaw, 'en');

        const kohApplicableKoll = studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology')?.applicableKollektiv || 'Gesamt';
        const kohN = allKollektivStats?.[kohApplicableKoll]?.deskriptiv?.anzahlPatienten || 0;
        placeholderData.KOLLEKTIV_TEXT_KOH_APPLICABLE = _getKollektivTextForPublication(kohApplicableKoll, kohN, lang);
        placeholderData.KOLLEKTIV_TEXT_KOH_APPLICABLE_EN = _getKollektivTextForPublication(kohApplicableKoll, kohN, 'en');

        const barbaroApplicableKoll = studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging')?.applicableKollektiv || 'nRCT';
        const barbaroN = allKollektivStats?.[barbaroApplicableKoll]?.deskriptiv?.anzahlPatienten || 0;
        placeholderData.KOLLEKTIV_TEXT_BARBARO_APPLICABLE = _getKollektivTextForPublication(barbaroApplicableKoll, barbaroN, lang);
        placeholderData.KOLLEKTIV_TEXT_BARBARO_APPLICABLE_EN = _getKollektivTextForPublication(barbaroApplicableKoll, barbaroN, 'en');

        const esgarApplicableKoll = studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar')?.applicableKollektiv || 'direkt OP';
        const esgarN = allKollektivStats?.[esgarApplicableKoll]?.deskriptiv?.anzahlPatienten || 0;
        placeholderData.KOLLEKTIV_TEXT_ESGAR_APPLICABLE = _getKollektivTextForPublication(esgarApplicableKoll, esgarN, lang);
        placeholderData.KOLLEKTIV_TEXT_ESGAR_APPLICABLE_EN = _getKollektivTextForPublication(esgarApplicableKoll, esgarN, 'en');


        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const asDirektOp = allKollektivStats?.['direkt OP']?.gueteAS;
        const asNrct = allKollektivStats?.nRCT?.gueteAS;

        placeholderData.AS_SENS_GESAMT_CI = _formatMetricWithCIForText(asGesamt?.sens, 1, true, lang);
        placeholderData.AS_SPEZ_GESAMT_CI = _formatMetricWithCIForText(asGesamt?.spez, 1, true, lang);
        placeholderData.AS_PPV_GESAMT_CI = _formatMetricWithCIForText(asGesamt?.ppv, 1, true, lang);
        placeholderData.AS_NPV_GESAMT_CI = _formatMetricWithCIForText(asGesamt?.npv, 1, true, lang);
        placeholderData.AS_ACC_GESAMT_CI = _formatMetricWithCIForText(asGesamt?.acc, 1, true, lang);
        placeholderData.AS_AUC_GESAMT_CI = _formatMetricWithCIForText(asGesamt?.auc, 3, false, lang);
        placeholderData.AS_AUC_GESAMT = _formatNumberForText(asGesamt?.auc?.value, 3, lang, lang==='en');


        placeholderData.AS_SENS_DIREKT_OP_CI = _formatMetricWithCIForText(asDirektOp?.sens, 1, true, lang);
        placeholderData.AS_SPEZ_DIREKT_OP_CI = _formatMetricWithCIForText(asDirektOp?.spez, 1, true, lang);
        placeholderData.AS_AUC_DIREKT_OP_CI = _formatMetricWithCIForText(asDirektOp?.auc, 3, false, lang);
        placeholderData.AS_AUC_DIREKT_OP = _formatNumberForText(asDirektOp?.auc?.value, 3, lang, lang==='en');

        placeholderData.AS_SENS_NRCT_CI = _formatMetricWithCIForText(asNrct?.sens, 1, true, lang);
        placeholderData.AS_SPEZ_NRCT_CI = _formatMetricWithCIForText(asNrct?.spez, 1, true, lang);
        placeholderData.AS_AUC_NRCT_CI = _formatMetricWithCIForText(asNrct?.auc, 3, false, lang);
        placeholderData.AS_AUC_NRCT = _formatNumberForText(asNrct?.auc?.value, 3, lang, lang==='en');
        
        placeholderData.AS_SENS_GESAMT_CI_EN = _formatMetricWithCIForText(asGesamt?.sens, 1, true, 'en');
        placeholderData.AS_SPEZ_GESAMT_CI_EN = _formatMetricWithCIForText(asGesamt?.spez, 1, true, 'en');
        placeholderData.AS_PPV_GESAMT_CI_EN = _formatMetricWithCIForText(asGesamt?.ppv, 1, true, 'en');
        placeholderData.AS_NPV_GESAMT_CI_EN = _formatMetricWithCIForText(asGesamt?.npv, 1, true, 'en');
        placeholderData.AS_ACC_GESAMT_CI_EN = _formatMetricWithCIForText(asGesamt?.acc, 1, true, 'en');
        placeholderData.AS_AUC_GESAMT_CI_EN = _formatMetricWithCIForText(asGesamt?.auc, 3, false, 'en');
        placeholderData.AS_AUC_GESAMT_EN = _formatNumberForText(asGesamt?.auc?.value, 3, 'en', true);

        placeholderData.AS_SENS_DIREKT_OP_CI_EN = _formatMetricWithCIForText(asDirektOp?.sens, 1, true, 'en');
        placeholderData.AS_SPEZ_DIREKT_OP_CI_EN = _formatMetricWithCIForText(asDirektOp?.spez, 1, true, 'en');
        placeholderData.AS_AUC_DIREKT_OP_CI_EN = _formatMetricWithCIForText(asDirektOp?.auc, 3, false, 'en');
        placeholderData.AS_AUC_DIREKT_OP_EN = _formatNumberForText(asDirektOp?.auc?.value, 3, 'en', true);

        placeholderData.AS_SENS_NRCT_CI_EN = _formatMetricWithCIForText(asNrct?.sens, 1, true, 'en');
        placeholderData.AS_SPEZ_NRCT_CI_EN = _formatMetricWithCIForText(asNrct?.spez, 1, true, 'en');
        placeholderData.AS_AUC_NRCT_CI_EN = _formatMetricWithCIForText(asNrct?.auc, 3, false, 'en');
        placeholderData.AS_AUC_NRCT_EN = _formatNumberForText(asNrct?.auc?.value, 3, 'en', true);


        const kohStats = allKollektivStats?.[kohApplicableKoll]?.gueteT2_literatur?.['koh_2008_morphology'];
        placeholderData.KOH_SENS_CI = _formatMetricWithCIForText(kohStats?.sens, 1, true, lang);
        placeholderData.KOH_SPEZ_CI = _formatMetricWithCIForText(kohStats?.spez, 1, true, lang);
        placeholderData.KOH_AUC_CI = _formatMetricWithCIForText(kohStats?.auc, 3, false, lang);
        placeholderData.KOH_AUC_GESAMT = _formatNumberForText(kohStats?.auc?.value, 3, lang, lang==='en');
        placeholderData.KOH_SENS_CI_EN = _formatMetricWithCIForText(kohStats?.sens, 1, true, 'en');
        placeholderData.KOH_SPEZ_CI_EN = _formatMetricWithCIForText(kohStats?.spez, 1, true, 'en');
        placeholderData.KOH_AUC_CI_EN = _formatMetricWithCIForText(kohStats?.auc, 3, false, 'en');
        placeholderData.KOH_AUC_GESAMT_EN = _formatNumberForText(kohStats?.auc?.value, 3, 'en', true);


        const barbaroStats = allKollektivStats?.[barbaroApplicableKoll]?.gueteT2_literatur?.['barbaro_2024_restaging'];
        placeholderData.BARBARO_SENS_CI = _formatMetricWithCIForText(barbaroStats?.sens, 1, true, lang);
        placeholderData.BARBARO_SPEZ_CI = _formatMetricWithCIForText(barbaroStats?.spez, 1, true, lang);
        placeholderData.BARBARO_AUC_CI = _formatMetricWithCIForText(barbaroStats?.auc, 3, false, lang);
        placeholderData.BARBARO_AUC_NRCT = _formatNumberForText(barbaroStats?.auc?.value, 3, lang, lang==='en');
        placeholderData.BARBARO_SENS_CI_EN = _formatMetricWithCIForText(barbaroStats?.sens, 1, true, 'en');
        placeholderData.BARBARO_SPEZ_CI_EN = _formatMetricWithCIForText(barbaroStats?.spez, 1, true, 'en');
        placeholderData.BARBARO_AUC_CI_EN = _formatMetricWithCIForText(barbaroStats?.auc, 3, false, 'en');
        placeholderData.BARBARO_AUC_NRCT_EN = _formatNumberForText(barbaroStats?.auc?.value, 3, 'en', true);


        const esgarStats = allKollektivStats?.[esgarApplicableKoll]?.gueteT2_literatur?.['rutegard_et_al_esgar'];
        placeholderData.ESGAR_SENS_CI = _formatMetricWithCIForText(esgarStats?.sens, 1, true, lang);
        placeholderData.ESGAR_SPEZ_CI = _formatMetricWithCIForText(esgarStats?.spez, 1, true, lang);
        placeholderData.ESGAR_AUC_CI = _formatMetricWithCIForText(esgarStats?.auc, 3, false, lang);
        placeholderData.ESGAR_AUC_DIREKT_OP = _formatNumberForText(esgarStats?.auc?.value, 3, lang, lang==='en');
        placeholderData.ESGAR_SENS_CI_EN = _formatMetricWithCIForText(esgarStats?.sens, 1, true, 'en');
        placeholderData.ESGAR_SPEZ_CI_EN = _formatMetricWithCIForText(esgarStats?.spez, 1, true, 'en');
        placeholderData.ESGAR_AUC_CI_EN = _formatMetricWithCIForText(esgarStats?.auc, 3, false, 'en');
        placeholderData.ESGAR_AUC_DIREKT_OP_EN = _formatNumberForText(esgarStats?.auc?.value, 3, 'en', true);


        const bfGesamt = allKollektivStats?.Gesamt?.gueteT2_bruteforce;
        placeholderData.BF_SENS_GESAMT_CI = _formatMetricWithCIForText(bfGesamt?.sens, 1, true, lang);
        placeholderData.BF_SPEZ_GESAMT_CI = _formatMetricWithCIForText(bfGesamt?.spez, 1, true, lang);
        placeholderData.BF_AUC_GESAMT_CI = _formatMetricWithCIForText(bfGesamt?.auc, 3, false, lang);
        placeholderData.BF_AUC_GESAMT = _formatNumberForText(bfGesamt?.auc?.value, 3, lang, lang==='en');
        placeholderData.BF_SENS_GESAMT_CI_EN = _formatMetricWithCIForText(bfGesamt?.sens, 1, true, 'en');
        placeholderData.BF_SPEZ_GESAMT_CI_EN = _formatMetricWithCIForText(bfGesamt?.spez, 1, true, 'en');
        placeholderData.BF_AUC_GESAMT_CI_EN = _formatMetricWithCIForText(bfGesamt?.auc, 3, false, 'en');
        placeholderData.BF_AUC_GESAMT_EN = _formatNumberForText(bfGesamt?.auc?.value, 3, 'en', true);

        const bfDirektOp = allKollektivStats?.['direkt OP']?.gueteT2_bruteforce;
        placeholderData.BF_SENS_DIREKT_OP_CI = _formatMetricWithCIForText(bfDirektOp?.sens, 1, true, lang);
        placeholderData.BF_SPEZ_DIREKT_OP_CI = _formatMetricWithCIForText(bfDirektOp?.spez, 1, true, lang);
        placeholderData.BF_AUC_DIREKT_OP_CI = _formatMetricWithCIForText(bfDirektOp?.auc, 3, false, lang);
        placeholderData.BF_AUC_DIREKT_OP = _formatNumberForText(bfDirektOp?.auc?.value, 3, lang, lang==='en');
        placeholderData.BF_SENS_DIREKT_OP_CI_EN = _formatMetricWithCIForText(bfDirektOp?.sens, 1, true, 'en');
        placeholderData.BF_SPEZ_DIREKT_OP_CI_EN = _formatMetricWithCIForText(bfDirektOp?.spez, 1, true, 'en');
        placeholderData.BF_AUC_DIREKT_OP_CI_EN = _formatMetricWithCIForText(bfDirektOp?.auc, 3, false, 'en');
        placeholderData.BF_AUC_DIREKT_OP_EN = _formatNumberForText(bfDirektOp?.auc?.value, 3, 'en', true);

        const bfNrct = allKollektivStats?.nRCT?.gueteT2_bruteforce;
        placeholderData.BF_SENS_NRCT_CI = _formatMetricWithCIForText(bfNrct?.sens, 1, true, lang);
        placeholderData.BF_SPEZ_NRCT_CI = _formatMetricWithCIForText(bfNrct?.spez, 1, true, lang);
        placeholderData.BF_AUC_NRCT_CI = _formatMetricWithCIForText(bfNrct?.auc, 3, false, lang);
        placeholderData.BF_AUC_NRCT = _formatNumberForText(bfNrct?.auc?.value, 3, lang, lang==='en');
        placeholderData.BF_SENS_NRCT_CI_EN = _formatMetricWithCIForText(bfNrct?.sens, 1, true, 'en');
        placeholderData.BF_SPEZ_NRCT_CI_EN = _formatMetricWithCIForText(bfNrct?.spez, 1, true, 'en');
        placeholderData.BF_AUC_NRCT_CI_EN = _formatMetricWithCIForText(bfNrct?.auc, 3, false, 'en');
        placeholderData.BF_AUC_NRCT_EN = _formatNumberForText(bfNrct?.auc?.value, 3, 'en', true);

        const compASvsKohGesamt = allKollektivStats?.Gesamt?.[`vergleichASvsT2_literatur_koh_2008_morphology`];
        placeholderData.P_VALUE_MCNEMAR_AS_VS_KOH_GESAMT = _getPValueTextForPublication(compASvsKohGesamt?.mcnemar?.pValue, lang);
        placeholderData.P_VALUE_DELONG_AS_VS_KOH_GESAMT = _getPValueTextForPublication(compASvsKohGesamt?.delong?.pValue, lang);
        placeholderData.DIFF_AUC_AS_VS_KOH_GESAMT = _formatNumberForText(compASvsKohGesamt?.delong?.diffAUC, 3, lang, lang === 'en');
        placeholderData.P_VALUE_MCNEMAR_AS_VS_KOH_GESAMT_EN = _getPValueTextForPublication(compASvsKohGesamt?.mcnemar?.pValue, 'en');
        placeholderData.P_VALUE_DELONG_AS_VS_KOH_GESAMT_EN = _getPValueTextForPublication(compASvsKohGesamt?.delong?.pValue, 'en');
        placeholderData.DIFF_AUC_AS_VS_KOH_GESAMT_EN = _formatNumberForText(compASvsKohGesamt?.delong?.diffAUC, 3, 'en', true);


        const compASvsBFGesamt = allKollektivStats?.Gesamt?.vergleichASvsT2_bruteforce;
        placeholderData.P_VALUE_MCNEMAR_AS_VS_BF_GESAMT = _getPValueTextForPublication(compASvsBFGesamt?.mcnemar?.pValue, lang);
        placeholderData.P_VALUE_DELONG_AS_VS_BF_GESAMT = _getPValueTextForPublication(compASvsBFGesamt?.delong?.pValue, lang);
        placeholderData.DIFF_AUC_AS_VS_BF_GESAMT = _formatNumberForText(compASvsBFGesamt?.delong?.diffAUC, 3, lang, lang === 'en');
        placeholderData.P_VALUE_MCNEMAR_AS_VS_BF_GESAMT_EN = _getPValueTextForPublication(compASvsBFGesamt?.mcnemar?.pValue, 'en');
        placeholderData.P_VALUE_DELONG_AS_VS_BF_GESAMT_EN = _getPValueTextForPublication(compASvsBFGesamt?.delong?.pValue, 'en');
        placeholderData.DIFF_AUC_AS_VS_BF_GESAMT_EN = _formatNumberForText(compASvsBFGesamt?.delong?.diffAUC, 3, 'en', true);

        const compASvsEsgarDirektOp = allKollektivStats?.['direkt OP']?.[`vergleichASvsT2_literatur_rutegard_et_al_esgar`];
        placeholderData.P_VALUE_MCNEMAR_AS_VS_ESGAR_DIREKT_OP = _getPValueTextForPublication(compASvsEsgarDirektOp?.mcnemar?.pValue, lang);
        placeholderData.P_VALUE_DELONG_AS_VS_ESGAR_DIREKT_OP = _getPValueTextForPublication(compASvsEsgarDirektOp?.delong?.pValue, lang);
        placeholderData.DIFF_AUC_AS_VS_ESGAR_DIREKT_OP = _formatNumberForText(compASvsEsgarDirektOp?.delong?.diffAUC, 3, lang, lang === 'en');
        placeholderData.P_VALUE_MCNEMAR_AS_VS_ESGAR_DIREKT_OP_EN = _getPValueTextForPublication(compASvsEsgarDirektOp?.mcnemar?.pValue, 'en');
        placeholderData.P_VALUE_DELONG_AS_VS_ESGAR_DIREKT_OP_EN = _getPValueTextForPublication(compASvsEsgarDirektOp?.delong?.pValue, 'en');
        placeholderData.DIFF_AUC_AS_VS_ESGAR_DIREKT_OP_EN = _formatNumberForText(compASvsEsgarDirektOp?.delong?.diffAUC, 3, 'en', true);

        const compASvsBFDirektOp = allKollektivStats?.['direkt OP']?.vergleichASvsT2_bruteforce;
        placeholderData.P_VALUE_MCNEMAR_AS_VS_BF_DIREKT_OP = _getPValueTextForPublication(compASvsBFDirektOp?.mcnemar?.pValue, lang);
        placeholderData.P_VALUE_DELONG_AS_VS_BF_DIREKT_OP = _getPValueTextForPublication(compASvsBFDirektOp?.delong?.pValue, lang);
        placeholderData.DIFF_AUC_AS_VS_BF_DIREKT_OP = _formatNumberForText(compASvsBFDirektOp?.delong?.diffAUC, 3, lang, lang === 'en');
        placeholderData.P_VALUE_MCNEMAR_AS_VS_BF_DIREKT_OP_EN = _getPValueTextForPublication(compASvsBFDirektOp?.mcnemar?.pValue, 'en');
        placeholderData.P_VALUE_DELONG_AS_VS_BF_DIREKT_OP_EN = _getPValueTextForPublication(compASvsBFDirektOp?.delong?.pValue, 'en');
        placeholderData.DIFF_AUC_AS_VS_BF_DIREKT_OP_EN = _formatNumberForText(compASvsBFDirektOp?.delong?.diffAUC, 3, 'en', true);

        const compASvsBarbaroNrct = allKollektivStats?.nRCT?.[`vergleichASvsT2_literatur_barbaro_2024_restaging`];
        placeholderData.P_VALUE_MCNEMAR_AS_VS_BARBARO_NRCT = _getPValueTextForPublication(compASvsBarbaroNrct?.mcnemar?.pValue, lang);
        placeholderData.P_VALUE_DELONG_AS_VS_BARBARO_NRCT = _getPValueTextForPublication(compASvsBarbaroNrct?.delong?.pValue, lang);
        placeholderData.DIFF_AUC_AS_VS_BARBARO_NRCT = _formatNumberForText(compASvsBarbaroNrct?.delong?.diffAUC, 3, lang, lang === 'en');
        placeholderData.P_VALUE_MCNEMAR_AS_VS_BARBARO_NRCT_EN = _getPValueTextForPublication(compASvsBarbaroNrct?.mcnemar?.pValue, 'en');
        placeholderData.P_VALUE_DELONG_AS_VS_BARBARO_NRCT_EN = _getPValueTextForPublication(compASvsBarbaroNrct?.delong?.pValue, 'en');
        placeholderData.DIFF_AUC_AS_VS_BARBARO_NRCT_EN = _formatNumberForText(compASvsBarbaroNrct?.delong?.diffAUC, 3, 'en', true);

        const compASvsBFNrct = allKollektivStats?.nRCT?.vergleichASvsT2_bruteforce;
        placeholderData.P_VALUE_MCNEMAR_AS_VS_BF_NRCT = _getPValueTextForPublication(compASvsBFNrct?.mcnemar?.pValue, lang);
        placeholderData.P_VALUE_DELONG_AS_VS_BF_NRCT = _getPValueTextForPublication(compASvsBFNrct?.delong?.pValue, lang);
        placeholderData.DIFF_AUC_AS_VS_BF_NRCT = _formatNumberForText(compASvsBFNrct?.delong?.diffAUC, 3, lang, lang === 'en');
        placeholderData.P_VALUE_MCNEMAR_AS_VS_BF_NRCT_EN = _getPValueTextForPublication(compASvsBFNrct?.mcnemar?.pValue, 'en');
        placeholderData.P_VALUE_DELONG_AS_VS_BF_NRCT_EN = _getPValueTextForPublication(compASvsBFNrct?.delong?.pValue, 'en');
        placeholderData.DIFF_AUC_AS_VS_BF_NRCT_EN = _formatNumberForText(compASvsBFNrct?.delong?.diffAUC, 3, 'en', true);

        return placeholderData;
    }

    function _replacePlaceholders(template, data) {
        if (typeof template !== 'string') return '';
        let result = template;
        for (const key in data) {
            const placeholder = `{${key.toUpperCase()}}`;
            const value = data[key] !== null && data[key] !== undefined ? data[key] : (key.includes('_CI') ? 'N/A (95%-KI: N/A \u2013 N/A)' : 'N/A');
            result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
        }
        result = result.replace(/{[A-Z0-9_]+}/g, match => `<span style="background-color:yellow; color:red; font-weight:bold;" title="Unersetzter Platzhalter">${match}</span>`);
        return result;
    }

    function getSectionText(sectionId, lang, allKollektivStats, commonData) {
        const mainSectionKey = PUBLICATION_CONFIG.sections.find(s => s.subSections.some(sub => sub.id === sectionId))?.id;
        if (!mainSectionKey) {
            return `<p class="text-danger">Hauptsektion für '${sectionId}' nicht gefunden.</p>`;
        }

        const template = PUBLICATION_TEXT_TEMPLATES[lang]?.[mainSectionKey]?.[sectionId];
        if (!template) {
            return `<p class="text-warning">Text-Template für Sektion '${sectionId}' (Sprache: ${lang}) nicht implementiert oder nicht gefunden.</p>`;
        }

        const placeholderData = _preparePlaceholderData(sectionId, lang, allKollektivStats, commonData);
        return _replacePlaceholders(template, placeholderData);
    }

    function getSectionTextAsMarkdown(sectionId, lang, allKollektivStats, commonData) {
        const htmlContent = getSectionText(sectionId, lang, allKollektivStats, commonData);
        if (htmlContent.includes('<p class="text-danger">') || htmlContent.includes('<p class="text-warning">')) {
            return htmlContent.replace(/<p class="text-(danger|warning)">/g, "### ").replace(/<\/p>/g, "");
        }

        let markdown = htmlContent
            .replace(/<p>/g, '\n')
            .replace(/<\/p>/g, '\n')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '*$1*')
            .replace(/<i>(.*?)<\/i>/g, '*$1*')
            .replace(/<ul>/g, '')
            .replace(/<\/ul>/g, '')
            .replace(/<ol.*?>/g, '')
            .replace(/<\/ol>/g, '')
            .replace(/<li>/g, (match) => {
                const isInsideOl = /<ol[^>]*>([\s\S]*?)<li>/g.test(htmlContent);
                return isInsideOl ? '\n1. ' : '\n* ';
            })
            .replace(/<\/li>/g, '')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<a href="#(.*?)">(.*?)<\/a>/g, (match, p1, p2) => {
                const refText = p2.replace(/\s+/g, ' ').trim();
                return `[${refText}](#${p1})`;
            })
            .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, (match, p1) => {
                const level = parseInt(match.match(/<h(\d)/)?.[1] || '1');
                return `\n${'#'.repeat(level)} ${p1.trim()}\n`;
            })
            .replace(/<cite>(.*?)<\/cite>/g, '[$1]')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/\u2013/g, '-')
            .replace(/ {2,}/g, ' ')
            .replace(/\n\s*\n+/g, '\n\n')
            .trim();

        markdown = markdown.split('\n').map(line => line.trimEnd()).join('\n');

        if (sectionId === 'referenzen' && markdown.includes('\n* ')) {
            let counter = 1;
            markdown = markdown.replace(/\n\* /g, () => `\n${counter++}. `);
        }
        
        markdown = markdown.replace(/<span style="background-color:yellow; color:red; font-weight:bold;" title="Unersetzter Platzhalter">({.*?})<\/span>/g, '$1');


        return markdown;
    }

    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown
    });

})();
