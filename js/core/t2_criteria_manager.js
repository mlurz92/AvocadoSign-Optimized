const t2CriteriaManager = (() => {
    let _currentCriteria = null;
    let _appliedCriteria = null;
    let _currentLogic = CONSTANTS.LOGIC_OPERATORS.AND;
    let _appliedLogic = CONSTANTS.LOGIC_OPERATORS.AND;
    let _isUnsaved = false;

    function initialize(initialCriteria, initialLogic) {
        const defaultCriteria = APP_CONFIG.T2_CRITERIA_DEFAULTS;
        _appliedCriteria = deepMerge(cloneDeep(defaultCriteria), initialCriteria || {});
        _appliedLogic = [CONSTANTS.LOGIC_OPERATORS.AND, CONSTANTS.LOGIC_OPERATORS.OR].includes(initialLogic) ? initialLogic : defaultCriteria.logic;
        
        _currentCriteria = cloneDeep(_appliedCriteria);
        _currentLogic = _appliedLogic;
        _isUnsaved = false;
    }

    function getCurrentCriteria() { return cloneDeep(_currentCriteria); }
    function getAppliedCriteria() { return cloneDeep(_appliedCriteria); }
    function getCurrentLogic() { return _currentLogic; }
    function getAppliedLogic() { return _appliedLogic; }
    function isUnsaved() { return _isUnsaved; }

    function updateCriterionProperty(key, property, value) {
        if (!_currentCriteria?.[key] || _currentCriteria[key][property] === value) {
            return false;
        }
        _currentCriteria[key][property] = value;
        _isUnsaved = true;
        return true;
    }

    function updateCriterionValue(key, value) {
        if (!_currentCriteria?.[key] || _currentCriteria[key].value === value) {
            return false;
        }
        const settingsKey = key.toUpperCase() + '_VALUES';
        if (APP_CONFIG.T2_CRITERIA_SETTINGS[settingsKey] && !APP_CONFIG.T2_CRITERIA_SETTINGS[settingsKey].includes(value)) {
            return false;
        }
        _currentCriteria[key].value = value;
        _isUnsaved = true;
        return true;
    }

    function updateCriterionThreshold(value) {
        const numValue = parseFloat(value);
        if (!_currentCriteria?.size || isNaN(numValue) || !isFinite(numValue)) {
            return false;
        }
        const clampedValue = clampNumber(numValue, APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min, APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max);
        if (_currentCriteria.size.threshold !== clampedValue) {
            _currentCriteria.size.threshold = clampedValue;
            _isUnsaved = true;
            return true;
        }
        return false;
    }

    function toggleCriterionActive(key, isActive) {
        if (!_currentCriteria?.[key] || _currentCriteria[key].active === !!isActive) {
            return false;
        }
        _currentCriteria[key].active = !!isActive;
        _isUnsaved = true;
        return true;
    }

    function updateLogic(logic) {
        if ([CONSTANTS.LOGIC_OPERATORS.AND, CONSTANTS.LOGIC_OPERATORS.OR].includes(logic) && _currentLogic !== logic) {
            _currentLogic = logic;
            _isUnsaved = true;
            return true;
        }
        return false;
    }

    function resetCriteria() {
        const defaultCriteria = APP_CONFIG.T2_CRITERIA_DEFAULTS;
        _currentCriteria = cloneDeep(defaultCriteria);
        _currentLogic = defaultCriteria.logic;
        _isUnsaved = true;
    }

    function applyCriteria() {
        _appliedCriteria = cloneDeep(_currentCriteria);
        _appliedLogic = _currentLogic;
        _isUnsaved = false;
        return { criteria: _appliedCriteria, logic: _appliedLogic };
    }

    function checkSingleNode(lymphNode, criteria) {
        const checkResult = { size: null, form: null, kontur: null, homogenitaet: null, signal: null };
        if (!isObject(lymphNode) || !isObject(criteria)) {
            return checkResult;
        }

        const keys = CONSTANTS.T2_CRITERIA_KEYS;

        if (criteria[keys.SIZE]?.active) {
            const { threshold, condition = '>=' } = criteria[keys.SIZE];
            const nodeSize = lymphNode.groesse;
            if (typeof nodeSize === 'number' && !isNaN(nodeSize) && typeof threshold === 'number') {
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

        const checkEnum = (key) => {
            if (criteria[key]?.active) {
                checkResult[key] = lymphNode[key] !== null && lymphNode[key] === criteria[key].value;
            }
        };

        checkEnum(keys.FORM);
        checkEnum(keys.KONTUR);
        checkEnum(keys.HOMOGENITAET);
        checkEnum(keys.SIGNAL);

        return checkResult;
    }

    function evaluatePatient(patient, criteria, logic) {
        const defaultReturn = { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        if (!patient || !criteria || ![CONSTANTS.LOGIC_OPERATORS.AND, CONSTANTS.LOGIC_OPERATORS.OR].includes(logic)) {
            return defaultReturn;
        }

        const lymphNodes = patient.lymphknoten_t2;
        if (!Array.isArray(lymphNodes)) {
            return { ...defaultReturn, t2Status: '-' };
        }

        const activeCriteriaKeys = Object.keys(criteria).filter(key => criteria[key]?.active);
        if (activeCriteriaKeys.length === 0) {
            return defaultReturn;
        }
        if (lymphNodes.length === 0) {
            return { ...defaultReturn, t2Status: '-' };
        }

        let patientIsPositive = false;
        let positiveLKCount = 0;
        const bewerteteLK = lymphNodes.map(lk => {
            if (!lk) return null;
            const checkResult = checkSingleNode(lk, criteria);
            let lkIsPositive = false;

            if (logic === CONSTANTS.LOGIC_OPERATORS.AND) {
                lkIsPositive = activeCriteriaKeys.every(key => checkResult[key] === true);
            } else {
                lkIsPositive = activeCriteriaKeys.some(key => checkResult[key] === true);
            }

            if (lkIsPositive) {
                patientIsPositive = true;
                positiveLKCount++;
            }

            return { ...lk, isPositive: lkIsPositive, checkResult };
        }).filter(Boolean);

        const finalT2Status = patientIsPositive ? '+' : '-';

        return {
            t2Status: finalT2Status,
            positiveLKCount: positiveLKCount,
            bewerteteLK: bewerteteLK
        };
    }

    function evaluateDataset(dataset, criteria, logic) {
        if (!Array.isArray(dataset)) return [];
        return dataset.map(patient => {
            if (!patient) return null;
            const patientCopy = cloneDeep(patient);
            const { t2Status, positiveLKCount, bewerteteLK } = evaluatePatient(patientCopy, criteria, logic);
            patientCopy.t2 = t2Status;
            patientCopy.anzahl_t2_plus_lk = positiveLKCount;
            patientCopy.lymphknoten_t2_bewertet = bewerteteLK;
            return patientCopy;
        }).filter(Boolean);
    }

    return Object.freeze({
        initialize,
        getCurrentCriteria,
        getAppliedCriteria,
        getCurrentLogic,
        getAppliedLogic,
        isUnsaved,
        updateCriterionProperty,
        updateCriterionValue,
        updateCriterionThreshold,
        toggleCriterionActive,
        updateLogic,
        resetCriteria,
        applyCriteria,
        evaluateDataset
    });
})();
