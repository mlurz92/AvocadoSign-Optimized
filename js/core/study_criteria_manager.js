const studyT2CriteriaManager = (() => {

    function formatCriteriaForDisplay(criteria, logic = null, shortFormat = false, lang = 'de') {
        if (!criteria || typeof criteria !== 'object') return APP_CONFIG.UI_TEXTS.global.notApplicableShort || 'N/A';

        const parts = [];
        const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);

        if (activeKeys.length === 0) {
            return shortFormat ? APP_CONFIG.UI_TEXTS.global.noActiveCriteriaShort : APP_CONFIG.UI_TEXTS.global.noActiveCriteria;
        }

        const formatValue = (key, criterion, isShort) => {
            if (!criterion) return '?';
            if (key === 'size') {
                const formattedThreshold = formatNumber(criterion.threshold, 1, '?', false, lang);
                const prefix = isShort ? APP_CONFIG.UI_TEXTS.criteriaDisplay.sizeShort : APP_CONFIG.UI_TEXTS.criteriaDisplay.size;
                return `${prefix} ${criterion.condition || '>='} ${formattedThreshold}mm`;
            }
            let value = criterion.value || '?';
            if (isShort) {
                switch (value) {
                    case 'irregulär': value = APP_CONFIG.UI_TEXTS.criteriaDisplay.irregularShort; break;
                    case 'scharf': value = APP_CONFIG.UI_TEXTS.criteriaDisplay.sharpShort; break;
                    case 'heterogen': value = APP_CONFIG.UI_TEXTS.criteriaDisplay.heterogeneousShort; break;
                    case 'homogen': value = APP_CONFIG.UI_TEXTS.criteriaDisplay.homogeneousShort; break;
                    case 'signalarm': value = APP_CONFIG.UI_TEXTS.criteriaDisplay.lowSignalShort; break;
                    case 'intermediär': value = APP_CONFIG.UI_TEXTS.criteriaDisplay.intermediateSignalShort; break;
                    case 'signalreich': value = APP_CONFIG.UI_TEXTS.criteriaDisplay.highSignalShort; break;
                    case 'rund': value = APP_CONFIG.UI_TEXTS.criteriaDisplay.roundShort; break;
                    case 'oval': value = APP_CONFIG.UI_TEXTS.criteriaDisplay.ovalShort; break;
                }
            }
            let prefix = '';
            switch(key) {
                case 'form': prefix = isShort ? APP_CONFIG.UI_TEXTS.criteriaDisplay.formShort : APP_CONFIG.UI_TEXTS.criteriaDisplay.form; break;
                case 'kontur': prefix = isShort ? APP_CONFIG.UI_TEXTS.criteriaDisplay.contourShort : APP_CONFIG.UI_TEXTS.criteriaDisplay.contour; break;
                case 'homogenitaet': prefix = isShort ? APP_CONFIG.UI_TEXTS.criteriaDisplay.homogeneityShort : APP_CONFIG.UI_TEXTS.criteriaDisplay.homogeneity; break;
                case 'signal': prefix = isShort ? APP_CONFIG.UI_TEXTS.criteriaDisplay.signalShort : APP_CONFIG.UI_TEXTS.criteriaDisplay.signal; break;
                default: prefix = key + '=';
            }
            return `${prefix}${value}`;
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

        if (effectiveLogic === 'KOMBINIERT') {
            const studySet = APP_CONFIG.PUBLICATION_CONFIG.literatureCriteriaSets.find(s => s.id === 'rutegard_et_al_esgar');
            if (studySet?.studyInfo?.keyCriteriaSummary) {
                return shortFormat ? (studySet.displayShortName || studySet.name) : studySet.studyInfo.keyCriteriaSummary;
            }
            return APP_CONFIG.UI_TEXTS.criteriaDisplay.combinedESGARLogic || 'Kombinierte ESGAR Logik (Details siehe Originalpublikation)';
        }
        const separator = (effectiveLogic === 'UND') ? ` ${APP_CONFIG.UI_TEXTS.t2LogicDisplayNames.UND} ` : ` ${APP_CONFIG.UI_TEXTS.t2LogicDisplayNames.ODER} `;

        if (shortFormat && parts.length > 2) {
             return parts.slice(0, 2).join(separator) + ' ...';
        }

        return parts.join(separator);
    }

    function getAllStudyCriteriaSets() {
        return cloneDeep(APP_CONFIG.PUBLICATION_CONFIG.literatureCriteriaSets);
    }

    function getStudyCriteriaSetById(id) {
        if (typeof id !== 'string') return null;
        const foundSet = APP_CONFIG.PUBLICATION_CONFIG.literatureCriteriaSets.find(set => set.id === id);
        return foundSet ? cloneDeep(foundSet) : null;
    }

    function _checkSingleNodeESGAR(lymphNode, studyCriteriaSet) {
        const checkResult = {
             size: null, form: null, kontur: null, homogenitaet: null, signal: null,
             esgarCategory: APP_CONFIG.UI_TEXTS.global.notApplicableShort, esgarMorphologyCount: 0, isPositive: false
        };
        const criteria = studyCriteriaSet.criteria;
        if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') return checkResult;

        const nodeSize = (typeof lymphNode.groesse === 'number' && !isNaN(lymphNode.groesse)) ? lymphNode.groesse : -1;
        const hasRoundShape = criteria.form?.active && lymphNode.form === criteria.form.value;
        const hasIrregularBorder = criteria.kontur?.active && lymphNode.kontur === criteria.kontur.value;
        const hasHeterogeneousSignal = criteria.homogenitaet?.active && lymphNode.homogenitaet === criteria.homogenitaet.value;

        let morphologyCount = 0;
        if (hasRoundShape) morphologyCount++;
        if (hasIrregularBorder) morphologyCount++;
        if (hasHeterogeneousSignal) morphologyCount++;

        checkResult.size_val = nodeSize >=0 ? nodeSize : null;
        checkResult.form_val = lymphNode.form;
        checkResult.kontur_val = lymphNode.kontur;
        checkResult.homogenitaet_val = lymphNode.homogenitaet;
        checkResult.signal_val = lymphNode.signal;

        checkResult.size = (criteria.size?.active && nodeSize >= (criteria.size.threshold || 9.0));
        checkResult.form = hasRoundShape;
        checkResult.kontur = hasIrregularBorder;
        checkResult.homogenitaet = hasHeterogeneousSignal;
        checkResult.esgarMorphologyCount = morphologyCount;

        // ESGAR 2016 logic as per source: Rutegard_2025.pdf page 1, ESGAR consensus criteria
        // and APP_CONFIG.PUBLICATION_CONFIG.literatureCriteriaSets.rutegard_et_al_esgar.studyInfo.criteriaDetails
        const esgarRules = studyCriteriaSet.studyInfo?.criteriaDetails?.rules;
        if (!esgarRules) {
            return checkResult; // Fallback if rules are not defined in config
        }

        let isPositiveByRule = false;
        esgarRules.forEach(rule => {
            if (rule.logicBranch === 'OR') { // Each rule is an OR branch
                let ruleSatisfied = false;
                if (rule.key === 'size') {
                    if (rule.condition === '>=' && nodeSize >= rule.threshold) {
                        ruleSatisfied = true;
                    } else if (rule.condition === 'range' && nodeSize >= rule.lower && nodeSize < rule.upper) {
                        let currentMorphologyCount = 0;
                        if (hasRoundShape) currentMorphologyCount++;
                        if (hasIrregularBorder) currentMorphologyCount++;
                        if (hasHeterogeneousSignal) currentMorphologyCount++;
                        if (currentMorphologyCount >= rule.minCount) {
                            ruleSatisfied = true;
                        }
                    } else if (rule.condition === '<' && nodeSize < rule.threshold) {
                        let currentMorphologyCount = 0;
                        if (hasRoundShape) currentMorphologyCount++;
                        if (hasIrregularBorder) currentMorphologyCount++;
                        if (hasHeterogeneousSignal) currentMorphologyCount++;
                        if (currentMorphologyCount >= rule.minCount) {
                            ruleSatisfied = true;
                        }
                    }
                }
                if (ruleSatisfied) {
                    isPositiveByRule = true;
                    checkResult.esgarCategory = rule.esgarCategoryName || `Size ${rule.condition === 'range' ? rule.lower + '-' + rule.upper : rule.condition + rule.threshold}mm`;
                }
            }
        });
        checkResult.isPositive = isPositiveByRule;

        if (nodeSize >= 9.0) {
            checkResult.esgarCategory = '≥9mm';
        } else if (nodeSize >= 5.0 && nodeSize < 9.0) {
            checkResult.esgarCategory = '5-8mm';
        } else if (nodeSize >= 0 && nodeSize < 5.0) {
             checkResult.esgarCategory = '<5mm';
        } else {
            checkResult.esgarCategory = 'N/A (Größe ungültig)';
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
        if (criteria.form?.active) checkResult.form = (lymphNode.form === criteria.form.value);
        if (criteria.kontur?.active) checkResult.kontur = (lymphNode.kontur === criteria.kontur.value);
        if (criteria.homogenitaet?.active) checkResult.homogenitaet = (lymphNode.homogenitaet === criteria.homogenitaet.value);
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
            const activeCriteriaKeysForEmpty = Object.keys(studyCriteriaSet.criteria).filter(key => key !== 'logic' && studyCriteriaSet.criteria[key]?.active === true);
             return { t2Status: activeCriteriaKeysForEmpty.length > 0 ? '-' : null, positiveLKCount: 0, bewerteteLK: [] };
        }

        let patientIsPositive = false;
        let positiveLKCount = 0;
        const bewerteteLK = [];
        const criteria = studyCriteriaSet.criteria;
        const logic = studyCriteriaSet.logic;
        const activeCriteriaKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);


        if (lymphNodes.length === 0 && activeCriteriaKeys.length > 0) {
            return { t2Status: '-', positiveLKCount: 0, bewerteteLK: [] };
        }
        if (lymphNodes.length === 0 && activeCriteriaKeys.length === 0 && logic !== 'KOMBINIERT') {
            return { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        }
         if (lymphNodes.length === 0 && logic === 'KOMBINIERT') {
            return { t2Status: '-', positiveLKCount: 0, bewerteteLK: [] };
        }


        lymphNodes.forEach(lk => {
            if (!lk || typeof lk !== 'object') {
                 bewerteteLK.push(null);
                 return;
            }

            let lkIsPositive = false;
            let checkResult = null;

            if (logic === 'KOMBINIERT' && studyCriteriaSet.id === 'rutegard_et_al_esgar') {
                checkResult = _checkSingleNodeESGAR(lk, studyCriteriaSet);
                lkIsPositive = checkResult.isPositive;
            } else {
                checkResult = _checkSingleNodeSimple(lk, criteria);
                if (activeCriteriaKeys.length > 0) {
                   if (logic === 'UND') {
                       lkIsPositive = activeCriteriaKeys.every(key => checkResult[key] === true);
                   } else {
                       lkIsPositive = activeCriteriaKeys.some(key => checkResult[key] === true);
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
                checkResult: checkResult
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
         if (!studyCriteriaSet || typeof studyCriteriaSet !== 'object') {
            return (dataset || []).map(p => {
                const pCopy = cloneDeep(p);
                pCopy.t2 = null;
                pCopy.anzahl_t2_plus_lk = 0;
                pCopy.lymphknoten_t2_bewertet = (pCopy.lymphknoten_t2 || []).map(lk => ({...lk, isPositive: false, checkResult: {}}));
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

    function formatStudyCriteriaForDisplay(studyCriteriaSet) {
        if (!studyCriteriaSet) return APP_CONFIG.UI_TEXTS.global.notApplicableShort;
        const criteria = studyCriteriaSet.criteria;
        const logic = studyCriteriaSet.logic;

        if (logic === 'KOMBINIERT' && studyCriteriaSet.description) {
             return studyCriteriaSet.description;
        }
        if (!criteria) return `${studyCriteriaSet.name || studyCriteriaSet.id} (${APP_CONFIG.UI_TEXTS.global.noCriteriaDefined})`;

        const formattedCriteria = formatCriteriaForDisplay(criteria, logic);
        return `(${studyCriteriaSet.name || studyCriteriaSet.id}): ${formattedCriteria}`;
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
