const t2CriteriaManager = (() => {
    let appliedCriteria = getDefaultT2Criteria();
    let currentCriteria = cloneDeep(appliedCriteria);
    let isUnsaved = false;

    function initialize() {
        const savedCriteria = stateManager.loadStateItem(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA);
        const savedLogic = stateManager.loadStateItem(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC);

        if (savedCriteria) {
            appliedCriteria = deepMerge(getDefaultT2Criteria(), savedCriteria);
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

    function updateCurrentCriteria(newCriteria, newLogic) {
        if (newCriteria) {
            currentCriteria = deepMerge(currentCriteria, newCriteria);
        }
        if (newLogic) {
            currentCriteria.logic = newLogic;
        }
        isUnsaved = true;
    }
    
    function hasUnsavedChanges() {
        return JSON.stringify(currentCriteria) !== JSON.stringify(appliedCriteria);
    }

    function applyCurrentCriteria() {
        appliedCriteria = cloneDeep(currentCriteria);
        const { logic, ...criteriaToSave } = appliedCriteria;
        stateManager.saveStateItem(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA, criteriaToSave);
        stateManager.saveStateItem(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC, logic);
        isUnsaved = false;
        uiHelpers.showToast('Neue T2-Kriterien erfolgreich angewendet und gespeichert.', 'success');
        return true;
    }
    
    function resetCurrentCriteria() {
        currentCriteria = cloneDeep(appliedCriteria);
        isUnsaved = false;
    }
    
    function resetToDefaults() {
        currentCriteria = getDefaultT2Criteria();
        isUnsaved = true;
    }

    function formatCriteriaForDisplay(criteria, logic) {
        if (!criteria || typeof criteria !== 'object') return 'N/A';
        const parts = [];
        const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active);
        if (activeKeys.length === 0) return 'Keine aktiven Kriterien';

        const effectiveLogic = logic || criteria.logic || 'ODER';
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
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        sortedActiveKeys.forEach(key => {
            const criterion = criteria[key];
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
    
    function checkSingleLymphNode(lk, criteria) {
        const checkResult = { size: null, form: null, kontur: null, homogenitaet: null, signal: null };
        if (!lk || typeof lk !== 'object' || !criteria || typeof criteria !== 'object') return checkResult;

        if (criteria.size?.active) {
            const threshold = criteria.size.threshold;
            const nodeSize = lk.groesse;
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
            } else { checkResult.size = false; }
        }
        if (criteria.form?.active) checkResult.form = (lk.form === criteria.form.value);
        if (criteria.kontur?.active) checkResult.kontur = (lk.kontur === criteria.kontur.value);
        if (criteria.homogenitaet?.active) checkResult.homogenitaet = (lk.homogenitaet === criteria.homogenitaet.value);
        if (criteria.signal?.active) checkResult.signal = (lk.signal !== null && lk.signal === criteria.signal.value);

        return checkResult;
    }

    function evaluateDatasetWithCriteria(dataset, criteria, logic) {
        if (!Array.isArray(dataset)) return [];
        return dataset.map(patient => {
            const evaluatedPatient = cloneDeep(patient);
            let patientT2Positive = false;
            let t2PlusLkCount = 0;
            const lymphNodes = evaluatedPatient.lymphknoten_t2 || [];

            evaluatedPatient.lymphknoten_t2_bewertet = lymphNodes.map(lk => {
                const checkResult = checkSingleLymphNode(lk, criteria);
                const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active);
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

                return { lk, evaluationDetails: checkResult, passes: lkPasses };
            });
            
            evaluatedPatient.t2 = lymphNodes.length > 0 ? (patientT2Positive ? '+' : '-') : '?';
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
        updateCurrentCriteria,
        hasUnsavedChanges,
        applyCurrentCriteria,
        resetCurrentCriteria,
        resetToDefaults,
        formatCriteriaForDisplay,
        evaluateDatasetWithCriteria
    });
})();
