const t2CriteriaManager = (() => {
    let currentT2Criteria = null;
    let appliedT2Criteria = null;
    let currentT2Logic = APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
    let appliedT2Logic = APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
    let isCriteriaUnsaved = false;

    const LOGIC_AND = 'UND';
    const LOGIC_OR = 'ODER';

    function initializeT2CriteriaState() {
        const savedCriteria = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA);
        const savedLogic = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC);
        const defaultCriteriaObject = getDefaultT2Criteria();

        appliedT2Criteria = deepMerge(cloneDeep(defaultCriteriaObject), savedCriteria || {});
        appliedT2Logic = (savedLogic === LOGIC_AND || savedLogic === LOGIC_OR) ? savedLogic : defaultCriteriaObject.logic;
        if (appliedT2Criteria.logic) { // Ensure logic in criteria object matches separate logic variable
            appliedT2Criteria.logic = appliedT2Logic;
        }


        currentT2Criteria = cloneDeep(appliedT2Criteria);
        currentT2Logic = appliedT2Logic;
        isCriteriaUnsaved = false;
    }

    function getCurrentT2Criteria() {
        return cloneDeep(currentT2Criteria);
    }

    function getAppliedT2Criteria() {
        return cloneDeep(appliedT2Criteria);
    }

    function getCurrentT2Logic() {
        return currentT2Logic;
    }

    function getAppliedT2Logic() {
        return appliedT2Logic;
    }

    function isT2CriteriaUnsaved() {
        return isCriteriaUnsaved;
    }

    function updateCurrentT2CriterionProperty(key, property, value) {
        if (!currentT2Criteria || !currentT2Criteria.hasOwnProperty(key) || typeof currentT2Criteria[key] !== 'object') {
            console.warn(`updateCurrentT2CriterionProperty: Ungültiger Kriterienschlüssel '${key}'`);
            return false;
        }
        if (currentT2Criteria[key][property] !== value) {
            currentT2Criteria[key][property] = value;
            isCriteriaUnsaved = true;
            return true;
        }
        return false;
    }

     function updateCurrentT2CriteriaValue(key, value) {
         if (!currentT2Criteria || !currentT2Criteria.hasOwnProperty(key) || typeof currentT2Criteria[key] !== 'object') {
            console.warn(`updateCurrentT2CriteriaValue: Ungültiger Kriterienschlüssel '${key}'`);
            return false;
         }
         let isValidValue = true;
         const allowedValuesKey = key.toUpperCase() + '_VALUES';
         if (APP_CONFIG.T2_CRITERIA_SETTINGS.hasOwnProperty(allowedValuesKey)) {
            isValidValue = APP_CONFIG.T2_CRITERIA_SETTINGS[allowedValuesKey].includes(value);
         } else {
             isValidValue = false; // Should not happen if config is correct
             console.error(`Konfigurationsfehler: '${allowedValuesKey}' nicht in T2_CRITERIA_SETTINGS gefunden für Kriterium '${key}'.`);
         }

         if (isValidValue && currentT2Criteria[key].value !== value) {
             currentT2Criteria[key].value = value;
             isCriteriaUnsaved = true;
             return true;
         } else if (!isValidValue) {
             console.warn(`updateCurrentT2CriteriaValue: Ungültiger Wert '${value}' für Kriterium '${key}'`);
         }
         return false;
     }

      function updateCurrentT2CriteriaThreshold(value) {
          const numValue = parseFloat(value);
          if (!currentT2Criteria || !currentT2Criteria.size || isNaN(numValue) || !isFinite(numValue)) {
               console.warn(`updateCurrentT2CriteriaThreshold: Ungültiger Schwellenwert '${value}'`);
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

     function toggleCurrentT2CriterionActive(key, isActive) {
          if (!currentT2Criteria || !currentT2Criteria.hasOwnProperty(key) || typeof currentT2Criteria[key] !== 'object') {
            console.warn(`toggleCurrentT2CriterionActive: Ungültiger Kriterienschlüssel '${key}'`);
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

    function updateCurrentT2Logic(logic) {
        if ((logic === LOGIC_AND || logic === LOGIC_OR) && currentT2Logic !== logic) {
            currentT2Logic = logic;
            isCriteriaUnsaved = true;
            return true;
        }
        return false;
    }

    function resetCurrentT2Criteria() {
        const defaultCriteria = getDefaultT2Criteria();
        currentT2Criteria = cloneDeep(defaultCriteria);
        currentT2Logic = defaultCriteria.logic; // Default logic from getDefaultT2Criteria
        isCriteriaUnsaved = true;
    }

    function applyCurrentT2Criteria() {
        appliedT2Criteria = cloneDeep(currentT2Criteria);
        appliedT2Logic = currentT2Logic;
        if(appliedT2Criteria.logic) { // Ensure the logic property within criteria object is also updated
            appliedT2Criteria.logic = appliedT2Logic;
        }

        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA, appliedT2Criteria);
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC, appliedT2Logic);

        isCriteriaUnsaved = false;
    }

    function checkSingleLymphNode(lymphNode, criteria) {
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

    function applyT2CriteriaToPatient(patient, criteria, logic) {
        const defaultReturn = { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        if (!patient || !criteria || (logic !== LOGIC_AND && logic !== LOGIC_OR)) {
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
            const checkResult = checkSingleLymphNode(lk, criteria);
            let lkIsPositive = false;

            if (activeCriteriaKeys.length > 0) {
                if (logic === LOGIC_AND) {
                    lkIsPositive = activeCriteriaKeys.every(key => checkResult[key] === true);
                } else { // LOGIC_OR
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
            console.error("evaluateDataset: Ungültige Eingabedaten, Array erwartet.");
            return [];
        }
        if (!criteria || (logic !== LOGIC_AND && logic !== LOGIC_OR)) {
             console.error("evaluateDataset: Ungültige Kriterien oder Logik.");
             return dataset.map(p => {
                 if (!p) return null;
                 const pCopy = cloneDeep(p);
                 pCopy.t2 = null;
                 pCopy.anzahl_t2_plus_lk = 0;
                 pCopy.lymphknoten_t2_bewertet = (pCopy.lymphknoten_t2 || []).map(lk => {
                    const baseLk = lk || {};
                    return {
                        groesse: baseLk.groesse ?? null,
                        form: baseLk.form ?? null,
                        kontur: baseLk.kontur ?? null,
                        homogenitaet: baseLk.homogenitaet ?? null,
                        signal: baseLk.signal ?? null,
                        isPositive: false,
                        checkResult: { size: null, form: null, kontur: null, homogenitaet: null, signal: null }
                    };
                 });
                 return pCopy;
             }).filter(p => p !== null);
        }

        return dataset.map(patient => {
            if (!patient) return null;
            const patientCopy = cloneDeep(patient);
            const { t2Status, positiveLKCount, bewerteteLK } = applyT2CriteriaToPatient(patientCopy, criteria, logic);
            patientCopy.t2 = t2Status;
            patientCopy.anzahl_t2_plus_lk = positiveLKCount;
            patientCopy.lymphknoten_t2_bewertet = bewerteteLK;
            return patientCopy;
        }).filter(p => p !== null);
    }

    return Object.freeze({
        initialize: initializeT2CriteriaState,
        getCurrentCriteria: getCurrentT2Criteria,
        getAppliedCriteria: getAppliedT2Criteria,
        getCurrentLogic: getCurrentT2Logic,
        getAppliedLogic: getAppliedT2Logic,
        isUnsaved: isT2CriteriaUnsaved,
        updateCriterionProperty: updateCurrentT2CriterionProperty,
        updateCriterionValue: updateCurrentT2CriteriaValue,
        updateCriterionThreshold: updateCurrentT2CriteriaThreshold,
        toggleCriterionActive: toggleCurrentT2CriterionActive,
        updateLogic: updateCurrentT2Logic,
        resetCriteria: resetCurrentT2Criteria,
        applyCriteria: applyCurrentT2Criteria,
        checkSingleNode: checkSingleLymphNode,
        evaluatePatient: applyT2CriteriaToPatient,
        evaluateDataset: evaluateDataset
    });
})();
