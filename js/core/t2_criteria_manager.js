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
        appliedT2Logic = (savedLogic === 'UND' || savedLogic === 'ODER' || savedLogic === 'KOMBINIERT') ? savedLogic : defaultCriteriaObject.logic;
        if (typeof appliedT2Criteria.logic === 'undefined' && (appliedT2Logic === 'UND' || appliedT2Logic === 'ODER' || appliedT2Logic === 'KOMBINIERT')) {
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
         } else if (key !== 'size'){ // Size hat keine 'VALUES', sondern 'RANGE'
             isValidValue = false;
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
        if ((logic === 'UND' || logic === 'ODER' || logic === 'KOMBINIERT') && currentT2Logic !== logic) {
            currentT2Logic = logic;
            isCriteriaUnsaved = true;
            return true;
        }
        return false;
    }

    function resetCurrentT2Criteria() {
        const defaultCriteria = getDefaultT2Criteria();
        currentT2Criteria = cloneDeep(defaultCriteria);
        currentT2Logic = defaultCriteria.logic; // Auch die Logik zurücksetzen
        isCriteriaUnsaved = true; // Als ungespeichert markieren, da zurückgesetzt
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
            signal: null,
            suspiciousFeaturesCount: 0
        };

        if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') {
            return checkResult;
        }

        let suspiciousCount = 0;

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
            // Für ESGAR-Logik (KOMBINIERT): 'size' selbst zählt nicht als 'suspicious feature'
        }

        if (criteria.form?.active) {
            const requiredForm = criteria.form.value;
            const nodeForm = lymphNode.form;
            checkResult.form = (typeof nodeForm === 'string' && nodeForm === requiredForm);
            if (checkResult.form && criteria.form.isSuspicious) suspiciousCount++;
        }

        if (criteria.kontur?.active) {
            const requiredKontur = criteria.kontur.value;
            const nodeKontur = lymphNode.kontur;
            checkResult.kontur = (typeof nodeKontur === 'string' && nodeKontur === requiredKontur);
            if (checkResult.kontur && criteria.kontur.isSuspicious) suspiciousCount++;
        }

        if (criteria.homogenitaet?.active) {
            const requiredHomogenitaet = criteria.homogenitaet.value;
            const nodeHomogenitaet = lymphNode.homogenitaet;
            checkResult.homogenitaet = (typeof nodeHomogenitaet === 'string' && nodeHomogenitaet === requiredHomogenitaet);
            if (checkResult.homogenitaet && criteria.homogenitaet.isSuspicious) suspiciousCount++;
        }

        if (criteria.signal?.active) {
            const requiredSignal = criteria.signal.value;
            const nodeSignal = lymphNode.signal;
            checkResult.signal = (nodeSignal !== null && typeof nodeSignal === 'string' && nodeSignal === requiredSignal);
             if (checkResult.signal && criteria.signal.isSuspicious) suspiciousCount++;
        }
        checkResult.suspiciousFeaturesCount = suspiciousCount;
        return checkResult;
    }

    function applyT2CriteriaToPatient(patient, criteria, logic) {
        const defaultReturn = { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        if (!patient || !criteria || (logic !== 'UND' && logic !== 'ODER' && logic !== 'KOMBINIERT')) {
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
        const activeCriteriaKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true && key !== 'size_9mm' && key !== 'size_5_8mm' && key !== 'size_less_5mm'); // ESGAR size keys sind special

        if (lymphNodes.length === 0 && logic !== 'KOMBINIERT' && activeCriteriaKeys.length > 0) {
            return { t2Status: '-', positiveLKCount: 0, bewerteteLK: [] };
        }
         if (lymphNodes.length === 0 && logic === 'KOMBINIERT' && (criteria.size_9mm?.active || criteria.size_5_8mm?.active || criteria.size_less_5mm?.active)) {
            return { t2Status: '-', positiveLKCount: 0, bewerteteLK: [] };
        }
        if (lymphNodes.length === 0 && activeCriteriaKeys.length === 0 && logic !== 'KOMBINIERT' ) {
            return { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        }
        if (lymphNodes.length === 0 && logic === 'KOMBINIERT' && !criteria.size_9mm?.active && !criteria.size_5_8mm?.active && !criteria.size_less_5mm?.active) {
            return { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        }


        lymphNodes.forEach(lk => {
            if (!lk) {
                 bewerteteLK.push(null);
                 return;
            }
            const checkResult = checkSingleLymphNode(lk, criteria);
            let lkIsPositive = false;

            if (logic === 'KOMBINIERT') { // Spezielle ESGAR Logik
                const nodeSize = lk.groesse;
                if (typeof nodeSize === 'number' && !isNaN(nodeSize)) {
                    if (nodeSize >= (criteria.size_9mm?.threshold || 9.0)) {
                        lkIsPositive = true;
                    } else if (nodeSize >= (criteria.size_5_8mm?.threshold_lower || 5.0) && nodeSize <= (criteria.size_5_8mm?.threshold_upper || 8.9)) {
                        if (checkResult.suspiciousFeaturesCount >= (criteria.suspicious_features_count_for_5_8mm || 2)) {
                            lkIsPositive = true;
                        }
                    } else if (nodeSize < (criteria.size_less_5mm?.threshold || 5.0)) {
                        if (checkResult.suspiciousFeaturesCount >= (criteria.suspicious_features_count_for_less_5mm || 3)) {
                            lkIsPositive = true;
                        }
                    }
                }
                // Muzinöse LK werden in Rutegard et al. 2025 (ESGAR Validierung) als "immer suspekt" behandelt.
                // Dies ist hier nicht direkt als Kriterium in den `criteria` abgebildet, die `checkSingleLymphNode` erwartet.
                // Für eine exakte ESGAR-Abbildung müsste dies hier oder in `checkSingleLymphNode` berücksichtigt werden,
                // z.B. durch ein Flag `lk.istMuzinoes` und eine Prüfung darauf. Aktuell fehlt diese Information.
                // Die bereitgestellte ESGAR-Definition in study_criteria_manager.js hat `signal: active: false`.

            } else if (activeCriteriaKeys.length > 0) { // Standard UND/ODER Logik
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
                checkResult: checkResult
            };
            bewerteteLK.push(bewerteterLK);
        });

        let finalT2Status = null;
        if (logic === 'KOMBINIERT' && (criteria.size_9mm?.active || criteria.size_5_8mm?.active || criteria.size_less_5mm?.active)) {
             finalT2Status = patientIsPositive ? '+' : '-';
        } else if (activeCriteriaKeys.length > 0) {
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
        if (!criteria || (logic !== 'UND' && logic !== 'ODER' && logic !== 'KOMBINIERT')) {
             console.warn(`evaluateDataset: Ungültige Kriterien oder Logik. Kriterien: ${JSON.stringify(criteria)}, Logik: ${logic}`);
             return dataset.map(p => {
                 const pCopy = cloneDeep(p);
                 pCopy.t2 = null;
                 pCopy.anzahl_t2_plus_lk = 0;
                 pCopy.lymphknoten_t2_bewertet = (pCopy.lymphknoten_t2 || []).map(lk => ({...cloneDeep(lk), isPositive: false, checkResult: {}}));
                 return pCopy;
             });
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
        checkSingleNode: checkSingleLymphNode, // Beibehalten für externe Nutzung, falls benötigt
        evaluatePatient: applyT2CriteriaToPatient, // Umbenannt von checkSinglePatientT2Status, da es den ganzen Patienten evaluiert
        evaluateDataset: evaluateDataset
    });
})();
