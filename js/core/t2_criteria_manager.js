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
             isValidValue = false; // Should not happen if APP_CONFIG is correct
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
        if ((logic === 'UND' || logic === 'ODER') && currentT2Logic !== logic) {
            currentT2Logic = logic;
            isCriteriaUnsaved = true;
            return true;
        }
        return false;
    }

    function resetCurrentT2Criteria() {
        const defaultCriteria = getDefaultT2Criteria();
        currentT2Criteria = cloneDeep(defaultCriteria);
        currentT2Logic = defaultCriteria.logic; // Ensure logic is also reset from default object
        isCriteriaUnsaved = true;
    }

    function applyCurrentT2Criteria() {
        appliedT2Criteria = cloneDeep(currentT2Criteria);
        appliedT2Logic = currentT2Logic;

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
            const condition = criteria.size.condition || '>='; // Default to >= if not specified
            if (typeof nodeSize === 'number' && !isNaN(nodeSize) && typeof threshold === 'number' && !isNaN(threshold)) {
                 switch(condition) {
                    case '>=': checkResult.size = nodeSize >= threshold; break;
                    case '>': checkResult.size = nodeSize > threshold; break;
                    case '<=': checkResult.size = nodeSize <= threshold; break;
                    case '<': checkResult.size = nodeSize < threshold; break;
                    case '==': checkResult.size = nodeSize === threshold; break;
                    default: checkResult.size = false; // Should not happen with proper config
                 }
            } else {
                 checkResult.size = false; // Mark as failed if data is invalid
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
            // Ensure nodeSignal is not null before comparison, as 'null' is a valid value for the *absence* of a specific signal type, not a signal type itself.
            checkResult.signal = (nodeSignal !== null && typeof nodeSignal === 'string' && nodeSignal === requiredSignal);
        }

        return checkResult;
    }

    function applyT2CriteriaToPatient(patient, criteria, logic) {
        const defaultReturn = { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        if (!patient || !criteria || (logic !== 'UND' && logic !== 'ODER')) {
            return defaultReturn;
        }

        const lymphNodes = patient.lymphknoten_t2;
        if (!Array.isArray(lymphNodes)) {
             // Return '-',0 for patients without any T2 LNs documented, if there are active criteria
             // If no active criteria, they should be T2 null.
            const activeCriteriaKeysForEmpty = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);
            return { t2Status: activeCriteriaKeysForEmpty.length > 0 ? '-' : null, positiveLKCount: 0, bewerteteLK: [] };
        }

        let patientIsPositive = false;
        let positiveLKCount = 0;
        const bewerteteLK = [];
        const activeCriteriaKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);

        if (lymphNodes.length === 0 && activeCriteriaKeys.length > 0) {
            // If there are active criteria but no nodes, patient is T2 negative.
            return { t2Status: '-', positiveLKCount: 0, bewerteteLK: [] };
        }
        if (lymphNodes.length === 0 && activeCriteriaKeys.length === 0) {
            // No active criteria, no nodes, T2 status is null (cannot be determined as + or -)
            return { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        }


        lymphNodes.forEach(lk => {
            if (!lk) { // Should not happen if data_processor cleans data properly
                 bewerteteLK.push(null); // Or some indicator of invalid LK data
                 return;
            }
            const checkResult = checkSingleLymphNode(lk, criteria);
            let lkIsPositive = false;

            if (activeCriteriaKeys.length > 0) {
                if (logic === 'UND') {
                    lkIsPositive = activeCriteriaKeys.every(key => checkResult[key] === true);
                } else { // ODER
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
                checkResult: checkResult // Store the individual check results
            };
            bewerteteLK.push(bewerteterLK);
        });

        // Determine final T2 status: If no criteria are active, T2 status is null.
        // Otherwise, it's '+' if any LK was positive, and '-' if all LKs were negative (or no LKs and active criteria).
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
            return []; // Return empty array for consistency
        }
        if (!criteria || (logic !== 'UND' && logic !== 'ODER')) {
             console.error("evaluateDataset: Ungültige Kriterien oder Logik.");
             // Return a deep clone so original data isn't modified if it's to be reused.
             // Or, if criteria/logic are invalid, perhaps T2 should be null for all.
             return dataset.map(p => {
                 const pCopy = cloneDeep(p);
                 pCopy.t2 = null;
                 pCopy.anzahl_t2_plus_lk = 0;
                 pCopy.lymphknoten_t2_bewertet = (pCopy.lymphknoten_t2 || []).map(lk => ({...lk, isPositive: false, checkResult: {}}));
                 return pCopy;
             });
        }

        return dataset.map(patient => {
            if (!patient) return null; // Should be filtered by data_processor
            const patientCopy = cloneDeep(patient); // Ensure original patient object in processedData isn't modified
            const { t2Status, positiveLKCount, bewerteteLK } = applyT2CriteriaToPatient(patientCopy, criteria, logic);
            patientCopy.t2 = t2Status;
            patientCopy.anzahl_t2_plus_lk = positiveLKCount;
            patientCopy.lymphknoten_t2_bewertet = bewerteteLK;
            // anzahl_t2_lk is already set by data_processor correctly
            return patientCopy;
        }).filter(p => p !== null); // Filter out any null patients if they somehow slipped through
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
        checkSingleNode: checkSingleLymphNode, // Exposing for potential reuse if needed
        evaluatePatient: applyT2CriteriaToPatient, // Exposing for potential reuse
        evaluateDataset: evaluateDataset
    });
})();
