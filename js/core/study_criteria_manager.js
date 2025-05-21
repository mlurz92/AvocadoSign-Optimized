const studyT2CriteriaManager = (() => {

    const studyT2CriteriaSets = Object.freeze([
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            name: 'Rutegård et al. (2025) / ESGAR 2016',
            displayShortName: 'ESGAR 2016',
            context: 'Primär-Staging (Baseline-MRT)',
            applicableKollektiv: 'direkt OP',
            criteria: Object.freeze({
                size: Object.freeze({ active: true, threshold: 9.0, condition: '>=' }),
                form: Object.freeze({ active: true, value: 'rund' }),
                kontur: Object.freeze({ active: true, value: 'irregulär' }),
                homogenitaet: Object.freeze({ active: true, value: 'heterogen' }),
                signal: Object.freeze({ active: false, value: null })
            }),
            logic: 'KOMBINIERT',
            description: 'ESGAR 2016 Kriterien für Primär-Staging: Größe ≥ 9mm ODER (Größe 5-8mm UND ≥2 Merkmale [rund, irregulär, heterogen]) ODER (Größe < 5mm UND ALLE 3 Merkmale [rund, irregulär, heterogen]).',
             studyInfo: Object.freeze({
                reference: "Rutegård et al., Eur Radiol (2025); Beets-Tan et al., Eur Radiol (2018) [ESGAR Consensus]",
                patientCohort: "Rutegård: N=46 (27 direkt OP, 19 nCRT) - Analyse auf Baseline-MRT. ESGAR: Konsensus.",
                investigationType: "Primärstaging",
                focus: "Validierung ESGAR 2016 Kriterien (Rutegård) bzw. Konsensus-Empfehlung (ESGAR).",
                keyCriteriaSummary: "Größe ≥ 9mm ODER (5-8mm UND ≥2 von [rund, irregulär, heterogen]) ODER (<5mm UND 3 von [rund, irregulär, heterogen])."
            })
        }),
        Object.freeze({
            id: 'koh_2008_morphology',
            name: 'Koh et al. (2008)',
            displayShortName: 'Koh et al.',
            context: 'Primär & Restaging (Urspr. Studie fokussiert auf Post-nCRT)',
            applicableKollektiv: 'Gesamt',
            criteria: Object.freeze({
                size: Object.freeze({ active: false, threshold: null, condition: null }),
                form: Object.freeze({ active: false, value: null }),
                kontur: Object.freeze({ active: true, value: 'irregulär' }),
                homogenitaet: Object.freeze({ active: true, value: 'heterogen' }),
                signal: Object.freeze({ active: false, value: null })
            }),
            logic: 'ODER',
            description: 'Koh et al. (2008): Morphologische Kriterien - Irreguläre Kontur ODER heterogenes Binnensignal. In dieser Anwendung für das Gesamtkollektiv evaluiert.',
            studyInfo: Object.freeze({
                reference: "Koh et al., Int J Radiat Oncol Biol Phys (2008)",
                patientCohort: "Ursprüngliche Studie: N=25 (alle nCRT, 'poor-risk'). Anwendung in diesem Tool: Gesamtkollektiv.",
                investigationType: "Vor und nach nCRT (Ursprüngliche Genauigkeitsanalyse post-nCRT)",
                focus: "Ursprünglich: Bewertung von LK vor und nach nCRT mittels Morphologie. In diesem Tool: Vergleichbarkeit mit Avocado Sign im Gesamtkollektiv.",
                keyCriteriaSummary: "Irreguläre Kontur ODER heterogenes Signal." // Deutsch, da es die Original-Logik beschreibt
            })
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            name: 'Barbaro et al. (2024)',
            displayShortName: 'Barbaro et al.',
            context: 'Restaging nach nCRT',
            applicableKollektiv: 'nRCT',
            criteria: Object.freeze({
                size: Object.freeze({ active: true, threshold: 2.3, condition: '>=' }),
                form: Object.freeze({ active: false, value: null }),
                kontur: Object.freeze({ active: false, value: null }),
                homogenitaet: Object.freeze({ active: false, value: null }),
                signal: Object.freeze({ active: false, value: null })
            }),
            logic: 'ODER',
            description: 'Barbaro et al. (2024): Optimaler Cut-off für Kurzachse im Restaging nach nRCT: ≥ 2.3mm (Originalstudie verwendete 2.2mm).',
             studyInfo: Object.freeze({
                reference: "Barbaro et al., Radiother Oncol (2024)",
                patientCohort: "N=191 (alle nCRT, LARC)",
                investigationType: "Restaging nach nCRT",
                focus: "MRI-Bewertung N-Status nach nCRT mittels Größe (optimaler Cut-off).",
                keyCriteriaSummary: "Kurzachse ≥ 2.3 mm (basierend auf Studie: 2.2mm)." // Deutsch
            })
        })
    ]);

    function formatCriteriaForDisplay(criteria, logic = null, shortFormat = false, lang = 'de') {
        if (!criteria || typeof criteria !== 'object') return 'N/A';
        const langKey = lang === 'en' ? 'en' : 'de';

        const parts = [];
        const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);

        if (activeKeys.length === 0) {
            return UI_TEXTS.noActiveCriteria[langKey] || UI_TEXTS.noActiveCriteria.de;
        }

        const formatValue = (key, criterion, isShort) => {
            if (!criterion) return '?';
            const currentPrefixes = isShort ? UI_TEXTS.t2CriteriaShortPrefix : UI_TEXTS.t2CriteriaLongPrefix;
            const valueTranslations = isShort ? UI_TEXTS.t2CriteriaShortValues : UI_TEXTS.t2CriteriaValues;

            if (key === 'size') {
                const formattedThreshold = formatNumber(criterion.threshold, 1, '?', false, lang); // useStandardFormat = false, use lang for locale
                const prefix = currentPrefixes.size[langKey] || currentPrefixes.size.de;
                return `${prefix}${criterion.condition || '>='}${formattedThreshold}mm`;
            }
            let valueToDisplay = criterion.value || '?';
            if (valueTranslations[valueToDisplay] && valueTranslations[valueToDisplay][langKey]) {
                valueToDisplay = valueTranslations[valueToDisplay][langKey];
            } else if (valueTranslations[valueToDisplay] && valueTranslations[valueToDisplay].de) { // Fallback to German if langKey not found
                valueToDisplay = valueTranslations[valueToDisplay].de;
            }


            let prefix = currentPrefixes[key]?.[langKey] || currentPrefixes[key]?.['de'] || (key + '=');
            return `${prefix}${valueToDisplay}`;
        };

        const priorityOrder = ['size', 'kontur', 'homogenitaet', 'form', 'signal'];
        const sortedActiveKeys = [...activeKeys].sort((a, b) => {
            const indexA = priorityOrder.indexOf(a);
            const indexB = priorityOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });


        sortedActiveKeys.forEach(key => {
             parts.push(formatValue(key, criteria[key], shortFormat));
        });

        const effectiveLogic = logic || criteria.logic || 'ODER';
        const logicDisplay = UI_TEXTS.t2LogicDisplayNames[effectiveLogic]?.[langKey] || UI_TEXTS.t2LogicDisplayNames[effectiveLogic]?.['de'] || effectiveLogic;


        if (effectiveLogic === 'KOMBINIERT') {
             const studySet = studyT2CriteriaSets.find(s => {
                if (s.logic !== 'KOMBINIERT') return false;
                const criteriaKeys = Object.keys(s.criteria).filter(k => k !== 'logic');
                const inputCriteriaKeys = Object.keys(criteria).filter(k => k !== 'logic');
                if (criteriaKeys.length !== inputCriteriaKeys.length) return false;
                return criteriaKeys.every(k =>
                    s.criteria[k]?.active === criteria[k]?.active &&
                    (s.criteria[k]?.active === false || (
                        (s.criteria[k]?.threshold === undefined || s.criteria[k]?.threshold === criteria[k]?.threshold) &&
                        (s.criteria[k]?.condition === undefined || s.criteria[k]?.condition === criteria[k]?.condition) &&
                        (s.criteria[k]?.value === undefined || s.criteria[k]?.value === criteria[k]?.value)
                    ))
                );
            });
             if (studySet) { // For ESGAR, use the predefined description as it's complex
                 return shortFormat ? (studySet.studyInfo?.keyCriteriaSummary || studySet.name) : studySet.description; // These are in German in studyT2CriteriaSets
             }
             return criteria.note || (langKey === 'de' ? 'Kombinierte Logik' : 'Combined Logic');
        }
        const separator = effectiveLogic === 'UND' ? ` ${logicDisplay} ` : ` ${logicDisplay} `;


        if (shortFormat && parts.length > 2) {
             return parts.slice(0, 2).join(separator) + ' ...';
        }

        return parts.join(separator);
    }

    function getAllStudyCriteriaSets() {
        return cloneDeep(studyT2CriteriaSets);
    }

    function getStudyCriteriaSetById(id) {
        if (typeof id !== 'string') return null;
        const foundSet = studyT2CriteriaSets.find(set => set.id === id);
        return foundSet ? cloneDeep(foundSet) : null;
    }

    function _checkSingleNodeESGAR(lymphNode, criteria) {
        const checkResult = {
             size_val: null, form_val: null, kontur_val: null, homogenitaet_val: null, signal_val: null,
             size_crit_met: null, form_crit_met: null, kontur_crit_met: null, homogenitaet_crit_met: null,
             esgarCategory: 'N/A', esgarMorphologyCount: 0, isPositive: false
        };
        if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') return checkResult;

        const nodeSize = (typeof lymphNode.groesse === 'number' && !isNaN(lymphNode.groesse) && lymphNode.groesse >= 0) ? lymphNode.groesse : -1;

        checkResult.size_val = nodeSize >= 0 ? nodeSize : null;
        checkResult.form_val = lymphNode.form || null;
        checkResult.kontur_val = lymphNode.kontur || null;
        checkResult.homogenitaet_val = lymphNode.homogenitaet || null;
        checkResult.signal_val = lymphNode.signal || null;

        let morphologyCount = 0;
        if (criteria.form?.active && lymphNode.form === criteria.form.value) {
            morphologyCount++;
            checkResult.form_crit_met = true;
        } else if (criteria.form?.active) {
            checkResult.form_crit_met = false;
        }

        if (criteria.kontur?.active && lymphNode.kontur === criteria.kontur.value) {
            morphologyCount++;
            checkResult.kontur_crit_met = true;
        } else if (criteria.kontur?.active) {
            checkResult.kontur_crit_met = false;
        }

        if (criteria.homogenitaet?.active && lymphNode.homogenitaet === criteria.homogenitaet.value) {
            morphologyCount++;
            checkResult.homogenitaet_crit_met = true;
        } else if (criteria.homogenitaet?.active) {
            checkResult.homogenitaet_crit_met = false;
        }
        checkResult.esgarMorphologyCount = morphologyCount;


        if (nodeSize === -1) {
             checkResult.esgarCategory = 'N/A (Größe ungültig)';
             checkResult.isPositive = false;
             checkResult.size_crit_met = false;
             return checkResult;
        }

        if (nodeSize >= 9.0) {
            checkResult.isPositive = true;
            checkResult.esgarCategory = '≥9mm';
            checkResult.size_crit_met = true;
        } else if (nodeSize >= 5.0 && nodeSize < 9.0) {
            checkResult.esgarCategory = '5-8mm';
            if (morphologyCount >= 2) {
                checkResult.isPositive = true;
            }
            checkResult.size_crit_met = (morphologyCount >=2);
        } else if (nodeSize < 5.0) {
             checkResult.esgarCategory = '<5mm';
             if (morphologyCount >= 3) {
                 checkResult.isPositive = true;
             }
             checkResult.size_crit_met = (morphologyCount >=3);
        }

        return checkResult;
    }

     function _checkSingleNodeSimple(lymphNode, criteria) {
        const checkResult = { size: null, form: null, kontur: null, homogenitaet: null, signal: null };
        if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') return checkResult;

        if (criteria.size?.active) {
            const threshold = criteria.size.threshold;
            const nodeSize = lymphNode.groesse;
            const condition = criteria.size.condition || '>=';
            if (typeof nodeSize === 'number' && !isNaN(nodeSize) && typeof threshold === 'number' && !isNaN(threshold)) {
                 switch(condition) {
                    case '>=': checkResult.size = nodeSize >= threshold; break;
                    case '>': checkResult.size = nodeSize > threshold; break;
                    case '<=': checkResult.size = nodeSize <= threshold; break;
                    case '<': checkResult.size = nodeSize < threshold; break;
                    case '==': checkResult.size = nodeSize === threshold; break;
                    default: checkResult.size = false;
                 }
            } else {
                 checkResult.size = false;
            }
        }
        if (criteria.form?.active) checkResult.form = (lymphNode.form !== null && lymphNode.form === criteria.form.value);
        if (criteria.kontur?.active) checkResult.kontur = (lymphNode.kontur !== null && lymphNode.kontur === criteria.kontur.value);
        if (criteria.homogenitaet?.active) checkResult.homogenitaet = (lymphNode.homogenitaet !== null && lymphNode.homogenitaet === criteria.homogenitaet.value);
        if (criteria.signal?.active) checkResult.signal = (lymphNode.signal !== null && lymphNode.signal === criteria.signal.value);

        return checkResult;
    }

    function applyStudyT2CriteriaToPatient(patient, studyCriteriaSet) {
        const defaultReturn = { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        if (!patient || typeof patient !== 'object' || !studyCriteriaSet || typeof studyCriteriaSet !== 'object') {
            return defaultReturn;
        }

        const lymphNodes = patient.lymphknoten_t2;
        if (!Array.isArray(lymphNodes)) {
            const activeCriteriaKeysForEmpty = Object.keys(studyCriteriaSet.criteria || {}).filter(key => key !== 'logic' && studyCriteriaSet.criteria[key]?.active === true);
             return { t2Status: activeCriteriaKeysForEmpty.length > 0 ? '-' : null, positiveLKCount: 0, bewerteteLK: [] };
        }

        let patientIsPositive = false;
        let positiveLKCount = 0;
        const bewerteteLK = [];
        const criteria = studyCriteriaSet.criteria;
        const logic = studyCriteriaSet.logic;
        const activeCriteriaKeys = Object.keys(criteria || {}).filter(key => key !== 'logic' && criteria[key]?.active === true);


        if (lymphNodes.length === 0 && activeCriteriaKeys.length > 0 && logic !== 'KOMBINIERT') {
            return { t2Status: '-', positiveLKCount: 0, bewerteteLK: [] };
        }
        if (lymphNodes.length === 0 && activeCriteriaKeys.length === 0 && logic !== 'KOMBINIERT') {
            return { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        }
         if (lymphNodes.length === 0 && logic === 'KOMBINIERT' && studyCriteriaSet.id === 'rutegard_et_al_esgar') {
            return { t2Status: '-', positiveLKCount: 0, bewerteteLK: [] };
        }


        lymphNodes.forEach(lk => {
            if (!lk || typeof lk !== 'object') {
                 bewerteteLK.push(null);
                 return;
            }

            let lkIsPositive = false;
            let checkResultFull = null;

            if (logic === 'KOMBINIERT' && studyCriteriaSet.id === 'rutegard_et_al_esgar') {
                checkResultFull = _checkSingleNodeESGAR(lk, criteria);
                lkIsPositive = checkResultFull.isPositive;
            } else {
                checkResultFull = _checkSingleNodeSimple(lk, criteria);
                if (activeCriteriaKeys.length > 0) {
                   if (logic === 'UND') {
                       lkIsPositive = activeCriteriaKeys.every(key => checkResultFull[key] === true);
                   } else {
                       lkIsPositive = activeCriteriaKeys.some(key => checkResultFull[key] === true);
                   }
                }
            }

            if (lkIsPositive) {
                patientIsPositive = true;
                positiveLKCount++;
            }
             const bewerteterLK = {
                groesse: lk.groesse ?? null,
                form: lk.form ?? null,
                kontur: lk.kontur ?? null,
                homogenitaet: lk.homogenitaet ?? null,
                signal: lk.signal ?? null,
                isPositive: lkIsPositive,
                checkResult: checkResultFull
            };
            bewerteteLK.push(bewerteterLK);
        });

        let finalT2Status = null;
        if (logic === 'KOMBINIERT' || activeCriteriaKeys.length > 0) {
            finalT2Status = patientIsPositive ? '+' : '-';
        }

        return {
            t2Status: finalT2Status,
            positiveLKCount: positiveLKCount,
            bewerteteLK: bewerteteLK
        };
    }

    function applyStudyT2CriteriaToDataset(dataset, studyCriteriaSet) {
         if (!studyCriteriaSet || typeof studyCriteriaSet !== 'object' || !studyCriteriaSet.criteria || !studyCriteriaSet.logic) {
            return (dataset || []).map(p => {
                const pCopy = cloneDeep(p || {});
                pCopy.t2 = null;
                pCopy.anzahl_t2_plus_lk = 0;
                pCopy.lymphknoten_t2_bewertet = ((pCopy.lymphknoten_t2 || [])).map(lk => ({...(lk || {}), isPositive: false, checkResult: {}}));
                return pCopy;
            });
         }
         if (!Array.isArray(dataset)) {
             return [];
         }

         return dataset.map(patient => {
             if (!patient) return null;
             const patientCopy = cloneDeep(patient);
             const { t2Status, positiveLKCount, bewerteteLK } = applyStudyT2CriteriaToPatient(patientCopy, studyCriteriaSet);
             patientCopy.t2 = t2Status;
             patientCopy.anzahl_t2_plus_lk = positiveLKCount;
             patientCopy.lymphknoten_t2_bewertet = bewerteteLK;
             return patientCopy;
         }).filter(p => p !== null);
    }

    function formatStudyCriteriaForDisplay(studyCriteriaSet, lang = 'de') {
        if (!studyCriteriaSet) return 'N/A';
        const criteria = studyCriteriaSet.criteria;
        const logic = studyCriteriaSet.logic;
        const langKey = lang === 'en' ? 'en' : 'de';

        // For ESGAR, the description is complex and pre-defined (currently only in German in studyT2CriteriaSets)
        if (logic === 'KOMBINIERT' && studyCriteriaSet.id === 'rutegard_et_al_esgar') {
             return studyCriteriaSet.studyInfo?.keyCriteriaSummary || studyCriteriaSet.description; // These are German
        }
        // For other literature sets, try to use their specific description if available,
        // otherwise format based on their criteria object
        if (studyCriteriaSet.description && (studyCriteriaSet.id === 'koh_2008_morphology' || studyCriteriaSet.id === 'barbaro_2024_restaging')) {
            // Attempt to provide a simple translation or use a key from UI_TEXTS if available
            // This part would require adding these specific descriptions to UI_TEXTS for full i18n
            if (langKey === 'en') {
                if (studyCriteriaSet.id === 'koh_2008_morphology') return "Koh et al. (2008): Irregular border OR heterogeneous internal signal. Applied to overall cohort.";
                if (studyCriteriaSet.id === 'barbaro_2024_restaging') return "Barbaro et al. (2024): Short-axis ≥ 2.3mm for restaging after nCRT (original 2.2mm).";
            }
            return studyCriteriaSet.description; // Fallback to German description
        }

        if (!criteria) return `${getKollektivDisplayName(studyCriteriaSet.name, langKey) || studyCriteriaSet.id} (${langKey==='de' ? 'Keine Kriterien definiert' : 'No criteria defined'})`;

        const formattedCriteria = formatCriteriaForDisplay(criteria, logic, false, lang);
        return `(${getKollektivDisplayName(studyCriteriaSet.name, langKey) || studyCriteriaSet.id}): ${formattedCriteria}`;
    }

    return Object.freeze({
        getAllStudyCriteriaSets,
        getStudyCriteriaSetById,
        applyStudyT2CriteriaToPatient,
        applyStudyT2CriteriaToDataset,
        formatStudyCriteriaForDisplay,
        formatCriteriaForDisplay
    });

})();
