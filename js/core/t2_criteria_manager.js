const t2CriteriaManager = (() => {
    let appliedCriteria = null;
    let appliedLogic = null;
    let unsavedChanges = false;

    const criteriaKeys = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];

    function initialize(defaultLogic, defaultCriteria) {
        const loadedCriteria = loadCriteria();
        const loadedLogic = loadLogic();

        appliedCriteria = loadedCriteria || cloneDeep(defaultCriteria) || getDefaultT2Criteria();
        appliedLogic = loadedLogic || defaultLogic || APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
        
        if (!loadedCriteria || !loadedLogic) {
            saveCriteria();
            saveLogic();
        }
        unsavedChanges = false; 
    }

    function getAppliedCriteria() {
        return cloneDeep(appliedCriteria);
    }

    function getAppliedLogic() {
        return appliedLogic;
    }

    function setCriteria(newCriteria, newLogic) {
        if (newCriteria && typeof newCriteria === 'object' && newLogic && (newLogic === 'UND' || newLogic === 'ODER')) {
            const oldCriteriaString = JSON.stringify(appliedCriteria);
            const oldLogicString = appliedLogic;

            appliedCriteria = cloneDeep(newCriteria);
            appliedLogic = newLogic;

            if (JSON.stringify(appliedCriteria) !== oldCriteriaString || appliedLogic !== oldLogicString) {
                unsavedChanges = true;
            }
        } else {
            console.error("T2CriteriaManager: Ungültige Kriterien oder Logik beim Setzen.", newCriteria, newLogic);
        }
    }

    function saveCriteria() {
        const storageKey = APP_CONFIG.STORAGE_KEYS.appliedT2Criteria;
        if (typeof storageKey === 'string' && storageKey.length > 0) {
            if (appliedCriteria) {
                saveToLocalStorage(storageKey, appliedCriteria);
                unsavedChanges = false; 
            }
        } else {
            console.warn("T2CriteriaManager: Ungültiger Storage-Schlüssel für appliedT2Criteria. Speichern nicht möglich.");
        }
    }
    
    function saveLogic() {
        const storageKey = APP_CONFIG.STORAGE_KEYS.appliedT2Logic;
        if (typeof storageKey === 'string' && storageKey.length > 0) {
            if (appliedLogic) {
                saveToLocalStorage(storageKey, appliedLogic);
                unsavedChanges = false; 
            }
        } else {
            console.warn("T2CriteriaManager: Ungültiger Storage-Schlüssel für appliedT2Logic. Speichern nicht möglich.");
        }
    }
    
    function saveAll() {
        saveCriteria();
        saveLogic();
         if (typeof stateManager !== 'undefined') {
            stateManager.setAppliedT2Criteria(appliedCriteria);
            stateManager.setAppliedT2Logic(appliedLogic);
        }
        unsavedChanges = false;
    }

    function loadCriteria() {
        const storageKey = APP_CONFIG.STORAGE_KEYS.appliedT2Criteria;
        if (typeof storageKey === 'string' && storageKey.length > 0) {
            return loadFromLocalStorage(storageKey);
        } else {
            console.warn("T2CriteriaManager: Ungültiger Storage-Schlüssel für appliedT2Criteria. Laden nicht möglich.");
            return null;
        }
    }
    
    function loadLogic() {
        const storageKey = APP_CONFIG.STORAGE_KEYS.appliedT2Logic;
        if (typeof storageKey === 'string' && storageKey.length > 0) {
            return loadFromLocalStorage(storageKey);
        } else {
            console.warn("T2CriteriaManager: Ungültiger Storage-Schlüssel für appliedT2Logic. Laden nicht möglich.");
            return null;
        }
    }
    
    function resetToDefaults() {
        appliedCriteria = getDefaultT2Criteria();
        appliedLogic = APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
        unsavedChanges = true; 
    }

    function areCriteriaUnsaved() {
        return unsavedChanges;
    }
    
    function markChangesAsSaved() {
        unsavedChanges = false;
    }

    function evaluateSingleLymphknoten(lymphknoten, criteriaToUse = appliedCriteria, logicToUse = appliedLogic) {
        if (!lymphknoten || !criteriaToUse || !logicToUse) {
            return false;
        }

        let overallMatch = logicToUse === 'ODER' ? false : true;
        let activeCriteriaCount = 0;
        let metAnyActiveCriteria = false;

        for (const key of criteriaKeys) {
            const criterionSetting = criteriaToUse[key];
            if (criterionSetting && criterionSetting.active) {
                activeCriteriaCount++;
                let criterionMetForThisLK = false;

                if (key === 'size') {
                    const lkSize = parseFloat(lymphknoten.groesse);
                    if (!isNaN(lkSize) && lkSize >= criterionSetting.threshold) {
                        criterionMetForThisLK = true;
                    }
                } else {
                    if (lymphknoten[key] !== null && lymphknoten[key] !== undefined && String(lymphknoten[key]).trim() !== "" && String(lymphknoten[key]) === String(criterionSetting.value)) {
                        criterionMetForThisLK = true;
                    }
                }

                if (logicToUse === 'ODER') {
                    if (criterionMetForThisLK) {
                        overallMatch = true;
                        metAnyActiveCriteria = true;
                        break; 
                    }
                } else { // UND Logic
                    if (!criterionMetForThisLK) {
                        overallMatch = false;
                        break; 
                    }
                    if (criterionMetForThisLK) {
                         metAnyActiveCriteria = true;
                    }
                }
            }
        }
        
        if (activeCriteriaCount === 0) return false; // No active criteria means no match
        if (logicToUse === 'UND' && !metAnyActiveCriteria && activeCriteriaCount > 0) return false; // if AND logic and no criteria were met (e.g. all lk values were null)
        
        return overallMatch;
    }

    function evaluatePatient(patient, criteriaToUse = appliedCriteria, logicToUse = appliedLogic) {
        if (!patient || !Array.isArray(patient.lymphknoten_t2) || patient.lymphknoten_t2.length === 0) {
            return 'unbekannt'; 
        }
        for (const lk of patient.lymphknoten_t2) {
            if (evaluateSingleLymphknoten(lk, criteriaToUse, logicToUse)) {
                return '+'; 
            }
        }
        return '-';
    }
    
    function evaluateCriteriaForAllPatients(patientData, criteriaToUse, logicToUse, resultKeySuffix = 't2_status') {
        if (!Array.isArray(patientData) || !criteriaToUse || !logicToUse) {
            console.warn("evaluateCriteriaForAllPatients: Ungültige Eingabedaten.");
            return patientData; 
        }
        return patientData.map(patient => {
            const t2Status = evaluatePatient(patient, criteriaToUse, logicToUse);
            let anzahlPositiveLK = 0;
            if (t2Status === '+') {
                 anzahlPositiveLK = (patient.lymphknoten_t2 || []).filter(lk => evaluateSingleLymphknoten(lk, criteriaToUse, logicToUse)).length;
            }
            const resultKey = `test_${resultKeySuffix}`;

            return {
                ...patient,
                [resultKey]: t2Status,
                [`anzahl_${resultKey}_plus_lk`]: anzahlPositiveLK,
                [`anzahl_${resultKey}_lk`]: (patient.lymphknoten_t2 || []).length
            };
        });
    }


    return Object.freeze({
        initialize,
        getAppliedCriteria,
        getAppliedLogic,
        setCriteria,
        saveCriteria,
        saveLogic,
        saveAll,
        loadCriteria,
        loadLogic,
        resetToDefaults,
        areCriteriaUnsaved,
        markChangesAsSaved,
        evaluateSingleLymphknoten,
        evaluatePatient,
        evaluateCriteriaForAllPatients,
        criteriaKeys
    });
})();

window.t2CriteriaManager = t2CriteriaManager;
