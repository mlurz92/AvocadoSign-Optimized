const t2CriteriaManager = (() => {
    let currentT2Criteria = null;
    let appliedT2Criteria = null;
    let currentT2Logic = APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
    let appliedT2Logic = APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
    let isCriteriaUnsaved = false;

    function initializeT2CriteriaState() {
        const savedCriteria = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA);
        const savedLogic = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC);
        const defaultCriteriaObject = getDefaultT2Criteria();

        appliedT2Criteria = deepMerge(cloneDeep(defaultCriteriaObject), savedCriteria || {});
        appliedT2Logic = (savedLogic === 'UND' || savedLogic === 'ODER') ? savedLogic : defaultCriteriaObject.logic;

        currentT2Criteria = cloneDeep(appliedT2Criteria);
        currentT2Logic = appliedT2Logic;
        isCriteriaUnsaved = false;
    }

    function getCurrentCriteria() {
        return cloneDeep(currentT2Criteria);
    }

    function getAppliedCriteria() {
        return cloneDeep(appliedT2Criteria);
    }

    function getCurrentLogic() {
        return currentT2Logic;
    }

    function getAppliedLogic() {
        return appliedT2Logic;
    }

    function isUnsaved() {
        return isCriteriaUnsaved;
    }

    function updateCriterionProperty(key, property, value) {
        if (!currentT2Criteria || !currentT2Criteria.hasOwnProperty(key) || typeof currentT2Criteria[key] !== 'object') {
            return false;
        }
        if (currentT2Criteria[key][property] !== value) {
            currentT2Criteria[key][property] = value;
            isCriteriaUnsaved = true;
            return true;
        }
        return false;
    }

     function updateCriterionValue(key, value) {
         if (!currentT2Criteria || !currentT2Criteria.hasOwnProperty(key) || typeof currentT2Criteria[key] !== 'object') {
            return false;
         }
         let isValidValue = true;
         const allowedValuesKey = key.toUpperCase() + '_VALUES';
         if (APP_CONFIG.T2_CRITERIA_SETTINGS.hasOwnProperty(allowedValuesKey)) {
            isValidValue = APP_CONFIG.T2_CRITERIA_SETTINGS[allowedValuesKey].includes(value);
         } else {
             isValidValue = false;
         }

         if (isValidValue && currentT2Criteria[key].value !== value) {
             currentT2Criteria[key].value = value;
             isCriteriaUnsaved = true;
             return true;
         }
         return false;
     }

      function updateCriterionThreshold(value) {
          const numValue = parseFloat(value);
          if (!currentT2Criteria || !currentT2Criteria.size || isNaN(numValue) || !isFinite(numValue)) {
              return false;
          }
          const clampedValue = clampNumber(numValue, APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min, APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max);

          if (currentT2Criteria.size.threshold !== clampedValue) {
              currentT2Criteria.size.threshold = clampedValue;
              isCriteriaUnsaved = true;
              return true;
          }
          return false;
      }

     function toggleCriterionActive(key, isActive) {
          if (!currentT2Criteria || !currentT2Criteria.hasOwnProperty(key) || typeof currentT2Criteria[key] !== 'object') {
            return false;
          }
          const isActiveBool = !!isActive;
          if (currentT2Criteria[key].active !== isActiveBool) {
              currentT2Criteria[key].active = isActiveBool;
              isCriteriaUnsaved = true;
              return true;
          }
          return false;
     }

    function updateLogic(logic) {
        if ((logic === 'UND' || logic === 'ODER') && currentT2Logic !== logic) {
            currentT2Logic = logic;
            isCriteriaUnsaved = true;
            return true;
        }
        return false;
    }

    function resetCriteria() {
        const defaultCriteria = getDefaultT2Criteria();
        currentT2Criteria = cloneDeep(defaultCriteria);
        currentT2Logic = defaultCriteria.logic;
        isCriteriaUnsaved = true;
    }

    function applyCriteria() {
        appliedT2Criteria = cloneDeep(currentT2Criteria);
        appliedT2Logic = currentT2Logic;

        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA, appliedT2Criteria);
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC, appliedT2Logic);

        isCriteriaUnsaved = false;
    }

    function checkSingleNode(lymphNode, criteria) {
        const checkResult = {
            size: null,
            form: null,
            kontur: null,
            homogenitaet: null,
            signal: null
        };

        if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') {
            return checkResult;
        }

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

        if (criteria.form?.active) {
            const requiredForm = criteria.form.value;
            const nodeForm = lymphNode.form;
            checkResult.form = (typeof nodeForm === 'string' && nodeForm === requiredForm);
        }

        if (criteria.kontur?.active) {
            const requiredKontur = criteria.kontur.value;
            const nodeKontur = lymphNode.kontur;
            checkResult.kontur = (typeof nodeKontur === 'string' && nodeKontur === requiredKontur);
        }

        if (criteria.homogenitaet?.active) {
            const requiredHomogenitaet = criteria.homogenitaet.value;
            const nodeHomogenitaet = lymphNode.homogenitaet;
            checkResult.homogenitaet = (typeof nodeHomogenitaet === 'string' && nodeHomogenitaet === requiredHomogenitaet);
        }

        if (criteria.signal?.active) {
            const requiredSignal = criteria.signal.value;
            const nodeSignal = lymphNode.signal;
            checkResult.signal = (nodeSignal !== null && typeof nodeSignal === 'string' && nodeSignal === requiredSignal);
        }

        return checkResult;
    }

    function evaluatePatient(patient, criteria, logic) {
        const defaultReturn = { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        if (!patient || !criteria || (logic !== 'UND' && logic !== 'ODER')) {
            return defaultReturn;
        }

        const lymphNodes = patient.lymphknoten_t2;
        if (!Array.isArray(lymphNodes)) {
            const activeCriteriaKeysForEmpty = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);
            return { t2Status: activeCriteriaKeysForEmpty.length > 0 ? '-' : null, positiveLKCount: 0, bewerteteLK: [] };
        }

        let patientIsPositive = false;
        let positiveLKCount = 0;
        const bewerteteLK = [];
        const activeCriteriaKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);

        if (lymphNodes.length === 0 && activeCriteriaKeys.length > 0) {
            return { t2Status: '-', positiveLKCount: 0, bewerteteLK: [] };
        }
        if (lymphNodes.length === 0 && activeCriteriaKeys.length === 0) {
            return { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        }


        lymphNodes.forEach(lk => {
            if (!lk) {
                 bewerteteLK.push(null);
                 return;
            }
            const checkResult = checkSingleNode(lk, criteria);
            let lkIsPositive = false;

            if (activeCriteriaKeys.length > 0) {
                if (logic === 'UND') {
                    lkIsPositive = activeCriteriaKeys.every(key => checkResult[key] === true);
                } else {
                    lkIsPositive = activeCriteriaKeys.some(key => checkResult[key] === true);
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
        if (activeCriteriaKeys.length > 0) {
            finalT2Status = patientIsPositive ? '+' : '-';
        }

        return {
            t2Status: finalT2Status,
            positiveLKCount: positiveLKCount,
            bewerteteLK: bewerteteLK
        };
    }

    function evaluateDataset(dataset, criteria, logic) {
        if (!Array.isArray(dataset)) {
            return [];
        }
        if (!criteria || (logic !== 'UND' && logic !== 'ODER')) {
             return dataset.map(p => {
                 const pCopy = cloneDeep(p);
                 pCopy.t2 = null;
                 pCopy.anzahl_t2_plus_lk = 0;
                 pCopy.lymphknoten_t2_bewertet = (pCopy.lymphknoten_t2 || []).map(lk => ({...lk, isPositive: false, checkResult: {}}));
                 return pCopy;
             });
        }

        return dataset.map(patient => {
            if (!patient) return null;
            const patientCopy = cloneDeep(patient);
            const { t2Status, positiveLKCount, bewerteteLK } = evaluatePatient(patientCopy, criteria, logic);
            patientCopy.t2 = t2Status;
            patientCopy.anzahl_t2_plus_lk = positiveLKCount;
            patientCopy.lymphknoten_t2_bewertet = bewerteteLK;
            return patientCopy;
        }).filter(p => p !== null);
    }

    return Object.freeze({
        initialize: initializeT2CriteriaState,
        getCurrentCriteria: getCurrentCriteria,
        getAppliedCriteria: getAppliedCriteria,
        getCurrentLogic: getCurrentLogic,
        getAppliedLogic: getAppliedLogic,
        isUnsaved: isUnsaved,
        updateCriterionProperty: updateCriterionProperty,
        updateCriterionValue: updateCriterionValue,
        updateCriterionThreshold: updateCriterionThreshold,
        toggleCriterionActive: toggleCriterionActive,
        updateLogic: updateLogic,
        resetCriteria: resetCriteria,
        applyCriteria: applyCriteria,
        checkSingleNode: checkSingleNode,
        evaluatePatient: evaluatePatient,
        evaluateDataset: evaluateDataset
    });
})();
