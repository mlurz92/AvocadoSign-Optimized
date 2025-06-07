const t2CriteriaManager = (() => {
    let criteria = getDefaultT2Criteria();

    function initialize() {
        const savedCriteria = stateManager.loadStateItem(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA);
        const savedLogic = stateManager.loadStateItem(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC);
        
        let loadedCriteria = getDefaultT2Criteria();
        if (savedCriteria) {
            loadedCriteria = deepMerge(loadedCriteria, savedCriteria);
        }
        if (savedLogic) {
            loadedCriteria.logic = savedLogic;
        }
        criteria = loadedCriteria;
    }

    function getCriteria() {
        return cloneDeep(criteria);
    }
    
    function getLogic() {
        return criteria.logic;
    }

    function setCriteria(newCriteria, newLogic) {
        if (newCriteria) {
            criteria = deepMerge(criteria, newCriteria);
        }
        if (newLogic) {
            criteria.logic = newLogic;
        }
        const { logic, ...criteriaToSave } = criteria;
        stateManager.saveStateItem(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA, criteriaToSave);
        stateManager.saveStateItem(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC, logic);
    }

    function resetToDefaults() {
        criteria = getDefaultT2Criteria();
        setCriteria(criteria, criteria.logic); // Apply and save defaults
    }

    function formatCriteriaForDisplay(criteriaObj, logic) {
        if (!criteriaObj || typeof criteriaObj !== 'object') return 'N/A';
        const parts = [];
        const activeKeys = Object.keys(criteriaObj).filter(key => key !== 'logic' && criteriaObj[key]?.active);
        if (activeKeys.length === 0) return 'Keine aktiven Kriterien';

        const effectiveLogic = logic || criteriaObj.logic || 'ODER';
        const separator = (effectiveLogic === 'UND') ? ' UND ' : ' ODER ';

        const formatValue = (key, criterion) => {
            if (!criterion) return '?';
            if (key === 'size') return `${criterion.condition || '>='}${formatNumber(criterion.threshold, 1)}mm`;
            return criterion.value || '?';
        };

        const priorityOrder = ['size', 'kontur', 'homogenitaet', 'form', 'signal'];
        const sortedActiveKeys = [...activeKeys].sort((a, b) => {
            const indexA = priorityOrder.indexOf(a);
            const indexB = priorityOrder.indexOf(b);
            return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
        });

        sortedActiveKeys.forEach(key => {
            const criterion = criteriaObj[key];
            let prefix = '';
            switch(key) {
                case 'size': prefix = 'Größe '; break;
                case 'form': prefix = 'Form='; break;
                case 'kontur': prefix = 'Kontur='; break;
                case 'homogenitaet': prefix = 'Homog.='; break;
                case 'signal': prefix = 'Signal='; break;
                default: prefix = key + '=';
            }
            parts.push(`${prefix}${formatValue(key, criterion)}`);
        });
        return parts.join(separator);
    }
    
    function checkSingleLymphNode(lk, criteriaObj) {
        const checkResult = { size: null, form: null, kontur: null, homogenitaet: null, signal: null };
        if (!lk || typeof lk !== 'object' || !criteriaObj || typeof criteriaObj !== 'object') return checkResult;

        if (criteriaObj.size?.active) {
            const { threshold, condition = '>=' } = criteriaObj.size;
            const nodeSize = lk.groesse;
            if (typeof nodeSize === 'number' && !isNaN(nodeSize) && typeof threshold === 'number' && !isNaN(threshold)) {
                 switch(condition) {
                    case '>=': checkResult.size = nodeSize >= threshold; break;
                    case '>': checkResult.size = nodeSize > threshold; break;
                    case '<=': checkResult.size = nodeSize <= threshold; break;
                    case '<': checkResult.size = nodeSize < threshold; break;
                    case '==': checkResult.size = nodeSize === threshold; break;
                    default: checkResult.size = false;
                 }
            } else { checkResult.size = false; }
        }
        if (criteriaObj.form?.active) checkResult.form = (lk.form === criteriaObj.form.value);
        if (criteriaObj.kontur?.active) checkResult.kontur = (lk.kontur === criteriaObj.kontur.value);
        if (criteriaObj.homogenitaet?.active) checkResult.homogenitaet = (lk.homogenitaet === criteriaObj.homogenitaet.value);
        if (criteriaObj.signal?.active) checkResult.signal = (lk.signal !== null && lk.signal === criteriaObj.signal.value);

        return checkResult;
    }

    function evaluateDatasetWithCriteria(dataset, criteriaObj, logic) {
        if (!Array.isArray(dataset)) return [];
        return dataset.map(patient => {
            if (!patient) return null;
            const evaluatedPatient = cloneDeep(patient);
            let patientT2Positive = false;
            let t2PlusLkCount = 0;
            const lymphNodes = evaluatedPatient.lymphknoten_t2 || [];
            
            evaluatedPatient.lymphknoten_t2_bewertet = lymphNodes.map(lk => {
                if (!lk) return null;
                const checkResult = checkSingleLymphNode(lk, criteriaObj);
                const activeKeys = Object.keys(criteriaObj).filter(key => key !== 'logic' && criteriaObj[key]?.active === true);
                let lkPasses = false;

                if (activeKeys.length > 0) {
                    if (logic === 'UND') {
                        lkPasses = activeKeys.every(key => checkResult[key] === true);
                    } else {
                        lkPasses = activeKeys.some(key => checkResult[key] === true);
                    }
                }
                
                if (lkPasses) {
                    patientT2Positive = true;
                    t2PlusLkCount++;
                }
                return { lk: lk, evaluationDetails: checkResult, passes: lkPasses };
            }).filter(Boolean);
            
            const hasT2Data = lymphNodes.length > 0;
            const hasActiveCriteria = Object.keys(criteriaObj).some(key => key !== 'logic' && criteriaObj[key]?.active);
            
            // The patient's T2 status is only assigned if there are active criteria AND T2 data.
            // If no active criteria, the status is '?', signifying it was not evaluated by criteria.
            // If no T2 data for the patient, but criteria are active, it's '-' (no positive nodes found).
            if (hasActiveCriteria) {
                 evaluatedPatient.t2 = hasT2Data ? (patientT2Positive ? '+' : '-') : '-';
            } else {
                 evaluatedPatient.t2 = '?'; // Not evaluated by criteria
            }
            
            evaluatedPatient.anzahl_t2_lk = lymphNodes.length;
            evaluatedPatient.anzahl_t2_plus_lk = t2PlusLkCount;

            return evaluatedPatient;
        }).filter(Boolean);
    }

    return Object.freeze({
        initialize,
        getCriteria,
        getLogic,
        setCriteria,
        resetToDefaults,
        formatCriteriaForDisplay,
        evaluateDatasetWithCriteria
    });
})();
