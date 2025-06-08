const t2CriteriaManager = (() => {
    let currentT2Criteria = null;
    let appliedT2Criteria = null;
    let currentT2Logic = APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
    let appliedT2Logic = APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
    let isCriteriaUnsaved = false;

    function _initializeState() {
        const savedCriteria = utils.loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA);
        const savedLogic = utils.loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC);
        const defaultCriteriaObject = getDefaultT2Criteria();

        appliedT2Criteria = savedCriteria ? { ...defaultCriteriaObject, ...savedCriteria } : utils.cloneDeep(defaultCriteriaObject);
        appliedT2Logic = (savedLogic === 'UND' || savedLogic === 'ODER') ? savedLogic : defaultCriteriaObject.logic;

        currentT2Criteria = utils.cloneDeep(appliedT2Criteria);
        currentT2Logic = appliedT2Logic;
        isCriteriaUnsaved = false;
    }

    function _checkUnsavedState() {
        try {
            const appliedString = JSON.stringify(appliedT2Criteria) + appliedT2Logic;
            const currentString = JSON.stringify(currentT2Criteria) + currentT2Logic;
            isCriteriaUnsaved = appliedString !== currentString;
        } catch (e) {
            isCriteriaUnsaved = true;
        }
    }

    function getAppliedCriteria() {
        return utils.cloneDeep(appliedT2Criteria);
    }

    function getAppliedLogic() {
        return appliedT2Logic;
    }

    function getCurrentCriteria() {
        return utils.cloneDeep(currentT2Criteria);
    }

    function getCurrentLogic() {
        return currentT2Logic;
    }

    function isUnsaved() {
        return isCriteriaUnsaved;
    }

    function updateCriterionValue(key, value) {
        if (!currentT2Criteria || !currentT2Criteria[key] || typeof currentT2Criteria[key] !== 'object') {
            return false;
        }
        const allowedValuesKey = key.toUpperCase() + '_VALUES';
        const allowedValues = APP_CONFIG.T2_CRITERIA_SETTINGS[allowedValuesKey];
        if (allowedValues && !allowedValues.includes(value)) {
            return false;
        }
        if (currentT2Criteria[key].value !== value) {
            currentT2Criteria[key].value = value;
            _checkUnsavedState();
            return true;
        }
        return false;
    }

    function updateCriterionThreshold(value) {
        const numValue = parseFloat(value);
        if (!currentT2Criteria || !currentT2Criteria.size || isNaN(numValue) || !isFinite(numValue)) {
            return false;
        }
        const clampedValue = utils.clampNumber(numValue, APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min, APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max);

        if (currentT2Criteria.size.threshold !== clampedValue) {
            currentT2Criteria.size.threshold = clampedValue;
            _checkUnsavedState();
            return true;
        }
        return false;
    }

    function toggleCriterionActive(key, isActive) {
        if (!currentT2Criteria || !currentT2Criteria[key] || typeof currentT2Criteria[key] !== 'object') {
            return false;
        }
        const isActiveBool = !!isActive;
        if (currentT2Criteria[key].active !== isActiveBool) {
            currentT2Criteria[key].active = isActiveBool;
            _checkUnsavedState();
            return true;
        }
        return false;
    }

    function updateLogic(logic) {
        if ((logic === 'UND' || logic === 'ODER') && currentT2Logic !== logic) {
            currentT2Logic = logic;
            _checkUnsavedState();
            return true;
        }
        return false;
    }

    function resetCriteria() {
        const defaultCriteria = getDefaultT2Criteria();
        currentT2Criteria = utils.cloneDeep(defaultCriteria);
        currentT2Logic = defaultCriteria.logic;
        _checkUnsavedState();
    }

    function applyCriteria() {
        appliedT2Criteria = utils.cloneDeep(currentT2Criteria);
        appliedT2Logic = currentT2Logic;
        utils.saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA, appliedT2Criteria);
        utils.saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC, appliedT2Logic);
        isCriteriaUnsaved = false;
    }

    function _checkSingleLymphNode(lymphNode, criteria) {
        const checkResult = { size: null, form: null, kontur: null, homogenitaet: null, signal: null };
        if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') {
            return checkResult;
        }

        if (criteria.size?.active) {
            const threshold = criteria.size.threshold;
            const nodeSize = lymphNode.groesse;
            const condition = criteria.size.condition || '>=';
            if (typeof nodeSize === 'number' && !isNaN(nodeSize) && typeof threshold === 'number' && !isNaN(threshold)) {
                switch (condition) {
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
            checkResult.form = (lymphNode.form === criteria.form.value);
        }
        if (criteria.kontur?.active) {
            checkResult.kontur = (lymphNode.kontur === criteria.kontur.value);
        }
        if (criteria.homogenitaet?.active) {
            checkResult.homogenitaet = (lymphNode.homogenitaet === criteria.homogenitaet.value);
        }
        if (criteria.signal?.active) {
            checkResult.signal = (lymphNode.signal !== null && lymphNode.signal === criteria.signal.value);
        }
        return checkResult;
    }

    function _evaluatePatient(patient, criteria, logic) {
        const defaultReturn = { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        if (!patient || !criteria || (logic !== 'UND' && logic !== 'ODER')) {
            return defaultReturn;
        }

        const lymphNodes = patient.lymphknoten_t2;
        const activeCriteriaKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);
        if (!Array.isArray(lymphNodes)) {
            return { t2Status: activeCriteriaKeys.length > 0 ? '-' : null, positiveLKCount: 0, bewerteteLK: [] };
        }
        if (lymphNodes.length === 0) {
            return { t2Status: activeCriteriaKeys.length > 0 ? '-' : null, positiveLKCount: 0, bewerteteLK: [] };
        }

        let patientIsPositive = false;
        let positiveLKCount = 0;
        const bewerteteLK = lymphNodes.map(lk => {
            if (!lk) return null;
            const checkResult = _checkSingleLymphNode(lk, criteria);
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
            return { ...lk, isPositive: lkIsPositive, checkResult: checkResult };
        }).filter(lk => lk !== null);

        const finalT2Status = activeCriteriaKeys.length > 0 ? (patientIsPositive ? '+' : '-') : null;

        return {
            t2Status: finalT2Status,
            positiveLKCount: positiveLKCount,
            bewerteteLK: bewerteteLK
        };
    }

    function evaluateDataset(dataset, criteria, logic) {
        if (!Array.isArray(dataset)) return [];
        if (!criteria || (logic !== 'UND' && logic !== 'ODER')) {
            return dataset.map(p => {
                const pCopy = utils.cloneDeep(p);
                pCopy.t2 = null;
                pCopy.anzahl_t2_plus_lk = 0;
                pCopy.lymphknoten_t2_bewertet = (pCopy.lymphknoten_t2 || []).map(lk => ({...lk, isPositive: false, checkResult: {}}));
                return pCopy;
            });
        }
        return dataset.map(patient => {
            if (!patient) return null;
            const patientCopy = utils.cloneDeep(patient);
            const { t2Status, positiveLKCount, bewerteteLK } = _evaluatePatient(patientCopy, criteria, logic);
            patientCopy.t2 = t2Status;
            patientCopy.anzahl_t2_plus_lk = positiveLKCount;
            patientCopy.lymphknoten_t2_bewertet = bewerteteLK;
            return patientCopy;
        }).filter(p => p !== null);
    }

    return Object.freeze({
        initialize: _initializeState,
        getAppliedCriteria,
        getAppliedLogic,
        getCurrentCriteria,
        getCurrentLogic,
        isUnsaved,
        updateCriterionValue,
        updateCriterionThreshold,
        toggleCriterionActive,
        updateLogic,
        resetCriteria,
        applyCriteria,
        checkSingleNode: _checkSingleLymphNode,
        evaluatePatient: _evaluatePatient,
        evaluateDataset
    });
})();
