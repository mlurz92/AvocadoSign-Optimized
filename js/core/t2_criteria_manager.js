const t2CriteriaManager = (() => {
    let appliedCriteria = getDefaultT2Criteria();
    let currentCriteria = cloneDeep(appliedCriteria);
    let isUnsaved = false;

    function initialize() {
        const savedCriteria = stateManager.load(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA);
        const savedLogic = stateManager.load(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC);

        if (savedCriteria) {
            appliedCriteria = { ...appliedCriteria, ...savedCriteria };
        }
        if (savedLogic) {
            appliedCriteria.logic = savedLogic;
        }

        currentCriteria = cloneDeep(appliedCriteria);
        isUnsaved = false;
    }

    function getAppliedCriteria() {
        return cloneDeep(appliedCriteria);
    }
    function getAppliedLogic() {
        return appliedCriteria.logic;
    }

    function getCurrentCriteria() {
        return cloneDeep(currentCriteria);
    }
    function getCurrentLogic() {
        return currentCriteria.logic;
    }

    function updateCurrentCriteria(newCriteria) {
        currentCriteria = { ...currentCriteria, ...newCriteria };
        isUnsaved = true;
    }

    function updateCurrentLogic(newLogic) {
        currentCriteria.logic = newLogic;
        isUnsaved = true;
    }

    function applyCriteria() {
        appliedCriteria = cloneDeep(currentCriteria);
        stateManager.save(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA, appliedCriteria);
        stateManager.save(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC, appliedCriteria.logic);
        isUnsaved = false;
    }
    
    function resetCurrentCriteria() {
        currentCriteria = getDefaultT2Criteria();
        isUnsaved = true;
    }
    
    function getIsUnsaved() {
        return isUnsaved;
    }

    function getCriteriaDisplayValues(criteria) {
        const safeCriteria = criteria || {};
        const result = {};

        Object.keys(safeCriteria).forEach(key => {
            if (key === 'logic' || key === 'size') return;
            result[key] = {
                active: safeCriteria[key]?.active ?? false,
                value: safeCriteria[key]?.value || null
            };
        });
        
        result.size = {
            active: safeCriteria.size?.active ?? false,
            threshold: safeCriteria.size?.threshold ?? APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
            condition: safeCriteria.size?.condition || '>='
        };
        
        result.logic = safeCriteria.logic || 'UND';

        return result;
    }

    function evaluateLymphknoten(lk, criteria, logic) {
        const results = {};
        let passes = false;
        let activeCriteriaCount = 0;
        let metCriteriaCount = 0;

        for (const key in criteria) {
            if (key === 'logic' || !criteria[key] || !criteria[key].active) {
                results[key] = { active: false, met: false };
                continue;
            }
            activeCriteriaCount++;
            let metCriterion = false;
            
            if (key === 'size') {
                const { threshold, condition } = criteria.size;
                if (lk.groesse !== null) {
                    switch (condition) {
                        case '>=': metCriterion = lk.groesse >= threshold; break;
                        case '>': metCriterion = lk.groesse > threshold; break;
                        case '==': metCriterion = lk.groesse === threshold; break;
                    }
                }
            } else {
                 if(lk[key] !== null) {
                    metCriterion = lk[key] === criteria[key].value;
                }
            }
            
            results[key] = { active: true, met: metCriterion, value: lk[key], criterionValue: criteria[key].value };
            if (metCriterion) {
                metCriteriaCount++;
            }
        }
        
        if (activeCriteriaCount > 0) {
            if (logic === 'UND') {
                passes = metCriteriaCount === activeCriteriaCount;
            } else {
                passes = metCriteriaCount > 0;
            }
        }

        return {
            passes: passes,
            evaluationDetails: results,
            lk: lk
        };
    }

    function evaluateDataset(dataset, criteria, logic) {
        return dataset.map(patient => {
            const evaluatedPatient = cloneDeep(patient);
            let patientT2Positive = false;
            let t2PlusLkCount = 0;
            
            evaluatedPatient.lymphknoten_t2_bewertet = evaluatedPatient.lymphknoten_t2.map(lk => {
                const bewertung = evaluateLymphknoten(lk, criteria, logic);
                if (bewertung.passes) {
                    patientT2Positive = true;
                    t2PlusLkCount++;
                }
                return bewertung;
            });
            
            evaluatedPatient.t2 = patientT2Positive ? '+' : '-';
            evaluatedPatient.anzahl_t2_plus_lk = t2PlusLkCount;
            return evaluatedPatient;
        });
    }

    return Object.freeze({
        initialize,
        getAppliedCriteria,
        getAppliedLogic,
        getCurrentCriteria,
        getCurrentLogic,
        getCriteriaDisplayValues,
        updateCurrentCriteria,
        updateCurrentLogic,
        applyCriteria,
        resetCurrentCriteria,
        isUnsaved: getIsUnsaved,
        evaluateLymphknoten,
        evaluateDataset
    });
})();
