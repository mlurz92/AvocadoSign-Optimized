const publicationTextGenerator = (() => {

    function _getNestedProperty(obj, path) {
        if (!path || typeof path !== 'string' || !obj) return undefined;
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    function _getPlaceholderReplacements(lang, publicationStats, commonData, options) {
        if (!publicationStats || !commonData || !options || typeof UI_TEXTS === 'undefined' || typeof APP_CONFIG === 'undefined' || typeof PUBLICATION_CONFIG === 'undefined') {
            console.warn("publicationTextGenerator: Fehlende Basisdaten für Placeholder-Ersetzung.");
            return {};
        }

        const pVal = (value, pValueLang = lang) => { // pValueLang hinzugefügt
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.getPValueText === 'function') {
                return ui_helpers.getPValueText(value, pValueLang);
            }
            // Fallback, falls ui_helpers nicht verfügbar ist (sollte nicht passieren)
            if (value === null || value === undefined || isNaN(value)) return '--';
            if (value < 0.001) return `<0.001`;
            return formatNumber(value, 3, '--', true, pValueLang);
        };

        const formatNum = (value, digits = 1, naChar = '--', useLang = lang) => formatNumber(value, digits, naChar, true, useLang);
        const formatPct = (value, digits = 0, naChar = '--') => formatPercent(value, digits, naChar);
        const formatCIfn = (value, lower, upper, digits = 1, isRate = true, naChar = '--') => formatCI(value, lower, upper, digits, isRate, naChar);
        const sigSym = (value) => getStatisticalSignificanceSymbol(value);

        const currentBFMetric = options.bruteForceMetric || APP_CONFIG.DEFAULT_SETTINGS.DEFAULT_PUBLIKATION_BF_METRIC;
        const bfResultsGesamt = publicationStats?.Gesamt?.[`bruteforce_definition_metric_${currentBFMetric.replace(/\s+/g, '_')}`];
        const bfGueteGesamt = publicationStats?.Gesamt?.[`gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}`];

        const bfResultsDirektOP = publicationStats?.['direkt OP']?.[`bruteforce_definition_metric_${currentBFMetric.replace(/\s+/g, '_')}`];
        const bfGueteDirektOP = publicationStats?.['direkt OP']?.[`gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}`];

        const bfResultsNRCT = publicationStats?.nRCT?.[`bruteforce_definition_metric_${currentBFMetric.replace(/\s+/g, '_')}`];
        const bfGueteNRCT = publicationStats?.nRCT?.[`gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}`];

        let replacements = {
            LANG_PRAEFIX: lang === 'de' ? 'die' : 'the',
            LANG_POSTFIX_N: lang === 'de' ? 'n' : '',
            APP_NAME: commonData.appName || 'Diese Anwendung',
            APP_VERSION: commonData.appVersion || 'N/A',
            CURRENT_DATE_DE: new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' }),
            CURRENT_DATE_EN: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            ETHICS_APPROVAL_NUMBER: APP_CONFIG.ETHICS_INFO?.APPROVAL_NUMBER || (lang === 'de' ? 'nicht spezifiziert' : 'not specified'),
            STUDY_PERIOD_START: APP_CONFIG.STUDY_PERIOD?.START_DATE || (lang === 'de' ? 'unbekannt' : 'unknown'),
            STUDY_PERIOD_END: APP_CONFIG.STUDY_PERIOD?.END_DATE || (lang === 'de' ? 'unbekannt' : 'unknown'),
            MRT_GERAET_HERSTELLER_MODELL: APP_CONFIG.MRT_PROTOKOLL?.GERAET_HERSTELLER_MODELL || (lang === 'de' ? 'nicht spezifiziert' : 'not specified'),
            MRT_FELDSTAERKE_TESLA: formatNum(APP_CONFIG.MRT_PROTOKOLL?.FELDSTAERKE_TESLA,1) || (lang === 'de' ? 'nicht spezifiziert' : 'not specified'),
            MRT_KONTRASTMITTEL_NAME: APP_CONFIG.MRT_PROTOKOLL?.KONTRASTMITTEL_NAME || (lang === 'de' ? 'nicht spezifiziert' : 'not specified'),
            MRT_KONTRASTMITTEL_DOSIERUNG_MMOL_PER_KG: formatNum(APP_CONFIG.MRT_PROTOKOLL?.KONTRASTMITTEL_DOSIERUNG_MMOL_PER_KG,2) || (lang === 'de' ? 'nicht spezifiziert' : 'not specified'),
            SIGNIFICANCE_LEVEL: formatNum(commonData.significanceLevel,2) || '0.05',
            SIGNIFICANCE_LEVEL_PERCENT: formatNum((commonData.significanceLevel || 0.05) * 100, 0) || '5',
            BOOTSTRAP_REPLICATIONS: formatNum(commonData.bootstrapReplications,0) || '1000',
            AUTHOR_AND_INSTITUTION: `${APP_CONFIG.SOFTWARE_VERSIONS?.APP_AUTHOR || (lang==='de'?'Autoren':'Authors')}, ${APP_CONFIG.SOFTWARE_VERSIONS?.APP_INSTITUTION_LOCATION || (lang==='de'?'Institution':'Institution')}`,
            BRUTE_FORCE_METRIC_NAME: currentBFMetric,
            AS_REF_SHORT: commonData.references?.lurzSchaefer2025?.short || 'Lurz & Schäfer (2025)',
            ESGAR_REF_SHORT: commonData.references?.beetsTan2018ESGAR?.short || 'ESGAR (2018)',
            KOH_REF_SHORT: commonData.references?.koh2008?.short || 'Koh et al. (2008)',
            BARBARO_REF_SHORT: commonData.references?.barbaro2024?.short || 'Barbaro et al. (2024)',
            RUTEGARD_REF_SHORT: commonData.references?.rutegard2025?.short || 'Rutegård et al. (2025)',
            BROWN_REF_SHORT: commonData.references?.brown2003?.short || 'Brown et al. (2003)',
        };

        const statPathsGesamt = {
            N_GESAMT: 'Gesamt.deskriptiv.anzahlPatienten',
            N_GESAMT_M: 'Gesamt.deskriptiv.geschlecht.m',
            N_GESAMT_F: 'Gesamt.deskriptiv.geschlecht.f',
            N_GESAMT_UNBEKANNT: 'Gesamt.deskriptiv.geschlecht.unbekannt',
            ALTER_MEDIAN_GESAMT: 'Gesamt.deskriptiv.alter.median',
            ALTER_Q1_GESAMT: 'Gesamt.deskriptiv.alter.q1',
            ALTER_Q3_GESAMT: 'Gesamt.deskriptiv.alter.q3',
            ALTER_MEAN_GESAMT: 'Gesamt.deskriptiv.alter.mean',
            ALTER_SD_GESAMT: 'Gesamt.deskriptiv.alter.sd',
            ALTER_MIN_GESAMT: 'Gesamt.deskriptiv.alter.min',
            ALTER_MAX_GESAMT: 'Gesamt.deskriptiv.alter.max',
            N_PATHOPOS_GESAMT: 'Gesamt.deskriptiv.nStatus.+',
            N_PATHONEG_GESAMT: 'Gesamt.deskriptiv.nStatus.-',
            AS_POS_GESAMT: 'Gesamt.deskriptiv.asStatus.+',
            AS_NEG_GESAMT: 'Gesamt.deskriptiv.asStatus.-',
            AS_SENS_GESAMT_VAL: 'Gesamt.gueteAS.sens.value', AS_SENS_GESAMT_CI: 'Gesamt.gueteAS.sens.ci',
            AS_SPEZ_GESAMT_VAL: 'Gesamt.gueteAS.spez.value', AS_SPEZ_GESAMT_CI: 'Gesamt.gueteAS.spez.ci',
            AS_PPV_GESAMT_VAL: 'Gesamt.gueteAS.ppv.value', AS_PPV_GESAMT_CI: 'Gesamt.gueteAS.ppv.ci',
            AS_NPV_GESAMT_VAL: 'Gesamt.gueteAS.npv.value', AS_NPV_GESAMT_CI: 'Gesamt.gueteAS.npv.ci',
            AS_ACC_GESAMT_VAL: 'Gesamt.gueteAS.acc.value', AS_ACC_GESAMT_CI: 'Gesamt.gueteAS.acc.ci',
            AS_AUC_GESAMT_VAL: 'Gesamt.gueteAS.auc.value', AS_AUC_GESAMT_CI: 'Gesamt.gueteAS.auc.ci',
            T2BF_SENS_GESAMT_VAL: `Gesamt.gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}.sens.value`, T2BF_SENS_GESAMT_CI: `Gesamt.gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}.sens.ci`,
            T2BF_SPEZ_GESAMT_VAL: `Gesamt.gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}.spez.value`, T2BF_SPEZ_GESAMT_CI: `Gesamt.gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}.spez.ci`,
            T2BF_PPV_GESAMT_VAL: `Gesamt.gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}.ppv.value`, T2BF_PPV_GESAMT_CI: `Gesamt.gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}.ppv.ci`,
            T2BF_NPV_GESAMT_VAL: `Gesamt.gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}.npv.value`, T2BF_NPV_GESAMT_CI: `Gesamt.gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}.npv.ci`,
            T2BF_ACC_GESAMT_VAL: `Gesamt.gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}.acc.value`, T2BF_ACC_GESAMT_CI: `Gesamt.gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}.acc.ci`,
            T2BF_AUC_GESAMT_VAL: `Gesamt.gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}.auc.value`, T2BF_AUC_GESAMT_CI: `Gesamt.gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}.auc.ci`,
            VERGL_AS_VS_T2BF_MCNEMAR_P_GESAMT: `Gesamt.vergleichASvsT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}.mcnemar.pValue`,
            VERGL_AS_VS_T2BF_DELONG_P_GESAMT: `Gesamt.vergleichASvsT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}.delong.pValue`,
        };
        
        Object.keys(statPathsGesamt).forEach(key => {
            const val = _getNestedProperty(publicationStats, statPathsGesamt[key]);
            if (key.endsWith('_CI')) { // Handle CI objects
                replacements[key] = formatCIfn(
                    _getNestedProperty(publicationStats, statPathsGesamt[key.replace('_CI', '_VAL')]),
                    val?.lower,
                    val?.upper,
                    (key.includes('AUC') ? 3 : 1),
                    !key.includes('AUC')
                );
            } else if (key.endsWith('_VAL') && statPathsGesamt[`${key.replace('_VAL', '_CI')}`]) {
                // Value is handled by CI if CI exists
            } else if (key.includes('P_GESAMT')) {
                replacements[key] = pVal(val);
            } else if (key.startsWith('ALTER_')) {
                 replacements[key] = formatNum(val, (key.includes('MEAN') || key.includes('SD')) ? 1 : 0);
            } else if (key.startsWith('AS_') || key.startsWith('T2BF_')) { // Metric values not covered by CI
                replacements[key] = formatPct(val, (key.includes('AUC') ? 3 : 1));
            } else {
                replacements[key] = (val !== undefined && val !== null) ? val : (lang === 'de' ? 'N/A' : 'N/A');
            }
        });
        
        // Add specific cohort data
        const cohorts = { 'DIREKT_OP': 'direkt OP', 'NRCT': 'nRCT' };
        Object.keys(cohorts).forEach(cohortKeyPrefix => {
            const cohortId = cohorts[cohortKeyPrefix];
            replacements[`N_${cohortKeyPrefix}`] = formatNum(_getNestedProperty(publicationStats, `${cohortId}.deskriptiv.anzahlPatienten`),0);
            replacements[`N_PATHOPOS_${cohortKeyPrefix}`] = formatNum(_getNestedProperty(publicationStats, `${cohortId}.deskriptiv.nStatus.+`),0);
            replacements[`N_PATHONEG_${cohortKeyPrefix}`] = formatNum(_getNestedProperty(publicationStats, `${cohortId}.deskriptiv.nStatus.-`),0);
            
            replacements[`AS_SENS_${cohortKeyPrefix}_CI`] = formatCIfn(_getNestedProperty(publicationStats,`${cohortId}.gueteAS.sens.value`), _getNestedProperty(publicationStats,`${cohortId}.gueteAS.sens.ci.lower`), _getNestedProperty(publicationStats,`${cohortId}.gueteAS.sens.ci.upper`));
            replacements[`AS_SPEZ_${cohortKeyPrefix}_CI`] = formatCIfn(_getNestedProperty(publicationStats,`${cohortId}.gueteAS.spez.value`), _getNestedProperty(publicationStats,`${cohortId}.gueteAS.spez.ci.lower`), _getNestedProperty(publicationStats,`${cohortId}.gueteAS.spez.ci.upper`));
            replacements[`AS_AUC_${cohortKeyPrefix}_CI`] = formatCIfn(_getNestedProperty(publicationStats,`${cohortId}.gueteAS.auc.value`), _getNestedProperty(publicationStats,`${cohortId}.gueteAS.auc.ci?.lower`), _getNestedProperty(publicationStats,`${cohortId}.gueteAS.auc.ci?.upper`), 3, false);

            const bfGueteKey = `${cohortId}.gueteT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}`;
            replacements[`T2BF_SENS_${cohortKeyPrefix}_CI`] = formatCIfn(_getNestedProperty(publicationStats,`${bfGueteKey}.sens.value`), _getNestedProperty(publicationStats,`${bfGueteKey}.sens.ci.lower`), _getNestedProperty(publicationStats,`${bfGueteKey}.sens.ci.upper`));
            replacements[`T2BF_SPEZ_${cohortKeyPrefix}_CI`] = formatCIfn(_getNestedProperty(publicationStats,`${bfGueteKey}.spez.value`), _getNestedProperty(publicationStats,`${bfGueteKey}.spez.ci.lower`), _getNestedProperty(publicationStats,`${bfGueteKey}.spez.ci.upper`));
            replacements[`T2BF_AUC_${cohortKeyPrefix}_CI`] = formatCIfn(_getNestedProperty(publicationStats,`${bfGueteKey}.auc.value`), _getNestedProperty(publicationStats,`${bfGueteKey}.auc.ci?.lower`), _getNestedProperty(publicationStats,`${bfGueteKey}.auc.ci?.upper`), 3, false);
            
            const verglKey = `${cohortId}.vergleichASvsT2_bruteforce_metric_${currentBFMetric.replace(/\s+/g, '_')}`;
            replacements[`VERGL_AS_VS_T2BF_MCNEMAR_P_${cohortKeyPrefix}`] = pVal(_getNestedProperty(publicationStats, `${verglKey}.mcnemar.pValue`));
            replacements[`VERGL_AS_VS_T2BF_DELONG_P_${cohortKeyPrefix}`] = pVal(_getNestedProperty(publicationStats, `${verglKey}.delong.pValue`));

        });

        // T2 Kriterien Definitionen (Brute-Force & Angewandt)
        if (bfResultsGesamt && typeof studyT2CriteriaManager !== 'undefined' && typeof studyT2CriteriaManager.formatCriteriaForDisplay === 'function') {
            replacements['T2BF_DEFINITION_GESAMT'] = studyT2CriteriaManager.formatCriteriaForDisplay(bfResultsGesamt.criteria, bfResultsGesamt.logic, lang === 'de', true);
        } else { replacements['T2BF_DEFINITION_GESAMT'] = lang === 'de' ? 'Nicht verfügbar' : 'Not available'; }
        
        if (commonData.appliedT2CriteriaGlobal && typeof studyT2CriteriaManager !== 'undefined' && typeof studyT2CriteriaManager.formatCriteriaForDisplay === 'function') {
            replacements['T2ANGEWANDT_DEFINITION'] = studyT2CriteriaManager.formatCriteriaForDisplay(commonData.appliedT2CriteriaGlobal, commonData.appliedT2LogicGlobal, lang === 'de', true);
        } else { replacements['T2ANGEWANDT_DEFINITION'] = lang === 'de' ? 'Nicht definiert' : 'Not defined'; }

        // Literatur T2 Kriterien
        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(setConf => {
            const key = setConf.id.toUpperCase();
            const studySet = (typeof studyT2CriteriaManager !== 'undefined') ? studyT2CriteriaManager.getStudyCriteriaSetById(setConf.id) : null;
            if (studySet) {
                replacements[`T2LIT_${key}_NAME`] = studySet.name;
                replacements[`T2LIT_${key}_REF_SHORT`] = studySet.studyInfo?.referenceShort || studySet.name;
                replacements[`T2LIT_${key}_DEFINITION`] = studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic || studySet.criteria.logic, lang === 'de', true);
                const targetKollektiv = studySet.applicableKollektiv || 'Gesamt';
                const gueteLit = publicationStats?.[targetKollektiv]?.gueteT2_literatur?.[setConf.id];
                replacements[`T2LIT_${key}_SENS_CI`] = formatCIfn(gueteLit?.sens?.value, gueteLit?.sens?.ci?.lower, gueteLit?.sens?.ci?.upper);
                replacements[`T2LIT_${key}_SPEZ_CI`] = formatCIfn(gueteLit?.spez?.value, gueteLit?.spez?.ci?.lower, gueteLit?.spez?.ci?.upper);
                replacements[`T2LIT_${key}_AUC_CI`] = formatCIfn(gueteLit?.auc?.value, gueteLit?.auc?.ci?.lower, gueteLit?.auc?.ci?.upper, 3, false);
                replacements[`T2LIT_${key}_KOLLEKTIV_N`] = `(${getKollektivDisplayName(targetKollektiv)}, N=${formatNum(publicationStats?.[targetKollektiv]?.deskriptiv?.anzahlPatienten,0)})`;

            } else {
                 replacements[`T2LIT_${key}_NAME`] = setConf.id;
                 replacements[`T2LIT_${key}_REF_SHORT`] = setConf.id;
                 replacements[`T2LIT_${key}_DEFINITION`] = lang === 'de' ? 'Definition nicht geladen' : 'Definition not loaded';
            }
        });
        
        // Generate lists for tables, e.g. Literatur-T2-Kriterien
        replacements['LIST_LIT_T2_PERFORMANCE_GESAMT'] = PUBLICATION_CONFIG.literatureCriteriaSets.map(setConf => {
            const gueteLitGesamt = publicationStats?.Gesamt?.gueteT2_literatur?.[setConf.id];
            if (!gueteLitGesamt) return '';
            return `${studyT2CriteriaManager.getStudyCriteriaSetById(setConf.id)?.name || setConf.id}: Sens ${formatCIfn(gueteLitGesamt.sens?.value, gueteLitGesamt.sens?.ci?.lower, gueteLitGesamt.sens?.ci?.upper)}, Spez ${formatCIfn(gueteLitGesamt.spez?.value, gueteLitGesamt.spez?.ci?.lower, gueteLitGesamt.spez?.ci?.upper)}, AUC ${formatCIfn(gueteLitGesamt.auc?.value, gueteLitGesamt.auc?.ci?.lower, gueteLitGesamt.auc?.ci?.upper, 3, false)}`;
        }).filter(Boolean).join('; ');

        return replacements;
    }

    function _getSectionContent(lang, sectionId, publicationStats, commonData, options) {
        const publicationConfig = commonData.publicationConfig || PUBLICATION_CONFIG;
        let sectionConfig = null;
        for (const mainSec of publicationConfig.sections) {
            if (mainSec.id === sectionId) {
                sectionConfig = mainSec;
                break;
            }
            if (mainSec.subSections) {
                const subSec = mainSec.subSections.find(sub => sub.id === sectionId);
                if (subSec) {
                    sectionConfig = subSec;
                    break;
                }
            }
        }

        if (!sectionConfig) return `Error: Section '${sectionId}' not found in PUBLICATION_CONFIG.`;
        let rawText = lang === 'de' ? sectionConfig.textDe : sectionConfig.textEn;
        if (!rawText) rawText = lang === 'de' ? sectionConfig.textEn : sectionConfig.textDe; // Fallback to other language
        if (!rawText) return `Error: Text for section '${sectionId}' (lang: ${lang}) not found.`;

        const placeholders = _getPlaceholderReplacements(lang, publicationStats, commonData, options);
        
        Object.keys(placeholders).forEach(key => {
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            rawText = rawText.replace(regex, placeholders[key] !== undefined ? placeholders[key] : (lang === 'de' ? `[PLATZHALTER '${key}' NICHT GEFUNDEN]` : `[PLACEHOLDER '${key}' NOT FOUND]`));
        });

        // Handle conditional blocks: {IF condition}content{ENDIF} or {IF condition}content1{ELSE}content2{ENDIF}
        rawText = rawText.replace(/\{IF\s+([^}]+)\}([\s\S]*?)(?:\{ELSE\}([\s\S]*?))?\{ENDIF\}/g, (match, conditionKey, contentIfTrue, contentIfFalse) => {
            const conditionValue = _getNestedProperty(placeholders, conditionKey.trim()) || _getNestedProperty(publicationStats, conditionKey.trim());
            // Evaluate common truthy/falsy scenarios, e.g. for boolean flags or existence of data
            let isConditionMet = false;
            if (typeof conditionValue === 'boolean') {
                isConditionMet = conditionValue;
            } else if (conditionValue !== undefined && conditionValue !== null && String(conditionValue).toLowerCase() !== 'false' && String(conditionValue).toLowerCase() !== '0' && String(conditionValue).trim() !== '' && (!Array.isArray(conditionValue) || conditionValue.length > 0) ) {
                 // More complex conditions (e.g., numeric comparisons) would need a proper expression evaluator.
                 // For now, simple truthy/falsy check or direct boolean.
                 // Check for specific string conditions like "conditionKey === 'someValue'"
                 const conditionParts = conditionKey.trim().split(/\s*===\s*|\s*==\s*|\s*!==\s*|\s*!=\s*/);
                 if (conditionParts.length === 2) {
                     const actualVal = _getNestedProperty(placeholders, conditionParts[0].trim()) || _getNestedProperty(publicationStats, conditionParts[0].trim());
                     const expectedValStr = conditionParts[1].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
                     if (conditionKey.includes('!==') || conditionKey.includes('!=')) {
                        isConditionMet = String(actualVal) !== expectedValStr;
                     } else {
                        isConditionMet = String(actualVal) === expectedValStr;
                     }
                 } else {
                    isConditionMet = !!conditionValue; // General truthy check
                 }
            }

            if (isConditionMet) {
                return contentIfTrue;
            } else {
                return contentIfFalse !== undefined ? contentIfFalse : '';
            }
        });
        
        // Handle list rendering: {LIST itemsSource as itemName}templateString{ENDLIST}
        // Example: {LIST GesammelteDaten.Patienten as patient}Name: {patient.name}, Alter: {patient.alter}{ENDLIST}
        // This is a simplified list renderer. For complex list structures, specific rendering functions in publication_renderer.js are better.
         rawText = rawText.replace(/\{LIST\s+([^\s]+)\s+as\s+([a-zA-Z0-9_]+)\}([\s\S]*?)\{ENDLIST\}/g, (match, itemsSourceKey, itemName, templateString) => {
            const items = _getNestedProperty(placeholders, itemsSourceKey) || _getNestedProperty(publicationStats, itemsSourceKey) || _getNestedProperty(commonData, itemsSourceKey);
            if (Array.isArray(items) && items.length > 0) {
                return items.map(item => {
                    let listItemText = templateString;
                    Object.keys(item).forEach(propKey => {
                        const regex = new RegExp(`\\{${itemName}\\.${propKey}\\}`, 'g');
                        listItemText = listItemText.replace(regex, item[propKey] !== undefined ? item[propKey] : '');
                    });
                    // Also replace general placeholders within the list item template
                     Object.keys(placeholders).forEach(key => {
                        const regex = new RegExp(`\\{${key}\\}`, 'g');
                        listItemText = listItemText.replace(regex, placeholders[key] !== undefined ? placeholders[key] : '');
                    });
                    return listItemText;
                }).join('');
            }
            return ''; // Return empty string if no items or itemsSourceKey is not an array
        });


        return rawText;
    }


    function getSectionText(lang, sectionId, publicationStats, commonData, options) {
        try {
            return _getSectionContent(lang, sectionId, publicationStats, commonData, options);
        } catch (error) {
            console.error(`Error generating text for section ${sectionId} (lang: ${lang}):`, error);
            return lang === 'de' ? `Fehler beim Generieren des Textes für Sektion '${sectionId}'. Details siehe Konsole.` : `Error generating text for section '${sectionId}'. See console for details.`;
        }
    }

    function getTableOfContents(lang, publicationStats) {
        const publicationConfig = (publicationStats && publicationStats.commonData && publicationStats.commonData.publicationConfig) ? publicationStats.commonData.publicationConfig : PUBLICATION_CONFIG;
        if (!publicationConfig || !publicationConfig.sections) return [];
        
        return publicationConfig.sections.map(mainSection => {
            const tocMainSection = {
                id: mainSection.id,
                title: lang === 'de' ? mainSection.titleDe : mainSection.titleEn,
                subSections: []
            };
            if (mainSection.subSections) {
                tocMainSection.subSections = mainSection.subSections.map(subSection => ({
                    id: subSection.id,
                    title: lang === 'de' ? subSection.titleDe : subSection.titleEn
                }));
            }
            return tocMainSection;
        });
    }

    return Object.freeze({
        getSectionText,
        getTableOfContents
    });

})();
