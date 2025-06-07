const studyT2CriteriaManager = (() => {

    const _studyCriteriaSets = Object.freeze([
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            name: 'Rutegård et al. (2025) / ESGAR 2016',
            displayShortName: 'ESGAR 2016',
            context: 'Primär-Staging (Baseline-MRT)',
            applicableKollektiv: CONSTANTS.KOLEKTIV.DIREKT_OP,
            criteria: Object.freeze({
                size: Object.freeze({ active: true, threshold: 9.0, condition: '>=' }),
                form: Object.freeze({ active: true, value: 'rund' }),
                kontur: Object.freeze({ active: true, value: 'irregulär' }),
                homogenitaet: Object.freeze({ active: true, value: 'heterogen' }),
            }),
            logic: CONSTANTS.LOGIC_OPERATORS.KOMBINIERT,
            description: 'ESGAR 2016 Kriterien: Größe ≥ 9mm ODER (Größe 5-8mm UND ≥2 Merkmale [rund, irregulär, heterogen]) ODER (Größe < 5mm UND ALLE 3 Merkmale).',
             studyInfo: Object.freeze({
                reference: "Rutegård et al., Eur Radiol (2025); Beets-Tan et al., Eur Radiol (2018)",
                patientCohort: "Rutegård: N=46 (27 direkt OP, 19 nCRT). ESGAR: Konsensus.",
                investigationType: "Primärstaging",
                focus: "Validierung der ESGAR 2016 Kriterien.",
                keyCriteriaSummary: "Größenabhängige Kombination morphologischer Merkmale (rund, irregulär, heterogen)."
            })
        }),
        Object.freeze({
            id: 'koh_2008_morphology',
            name: 'Koh et al. (2008)',
            displayShortName: 'Koh et al.',
            context: 'Primär & Restaging',
            applicableKollektiv: CONSTANTS.KOLEKTIV.GESAMT,
            criteria: Object.freeze({
                kontur: Object.freeze({ active: true, value: 'irregulär' }),
                homogenitaet: Object.freeze({ active: true, value: 'heterogen' }),
            }),
            logic: CONSTANTS.LOGIC_OPERATORS.OR,
            description: 'Koh et al. (2008): Irreguläre Kontur ODER heterogenes Binnensignal.',
            studyInfo: Object.freeze({
                reference: "Koh et al., Int J Radiat Oncol Biol Phys (2008)",
                patientCohort: "N=25 (alle nRCT, 'poor-risk')",
                investigationType: "Vor und nach nCRT",
                focus: "Bewertung von LK vor und nach nCRT mittels Morphologie.",
                keyCriteriaSummary: "Irreguläre Kontur ODER heterogenes Signal."
            })
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            name: 'Barbaro et al. (2024)',
            displayShortName: 'Barbaro et al.',
            context: 'Restaging nach nCRT',
            applicableKollektiv: CONSTANTS.KOLEKTIV.NRCT,
            criteria: Object.freeze({
                size: Object.freeze({ active: true, threshold: 2.2, condition: '>=' }),
            }),
            logic: CONSTANTS.LOGIC_OPERATORS.OR,
            description: 'Barbaro et al. (2024): Kurzachse ≥ 2.2mm im Restaging nach nRCT.',
             studyInfo: Object.freeze({
                reference: "Barbaro et al., Radiother Oncol (2024)",
                patientCohort: "N=191 (alle nCRT, LARC)",
                investigationType: "Restaging nach nCRT",
                focus: "MRT-Bewertung N-Status nach nCRT mittels Größe.",
                keyCriteriaSummary: "Kurzachse ≥ 2.2 mm."
            })
        })
    ]);

    function _checkSingleNodeESGAR(lymphNode, criteria) {
        const checkResult = {
             size: null, form: null, kontur: null, homogenitaet: null, signal: null,
             esgarCategory: 'N/A', esgarMorphologyCount: 0, isPositive: false
        };
        if (!isObject(lymphNode) || !isObject(criteria)) return checkResult;

        const nodeSize = lymphNode.groesse;
        if (typeof nodeSize !== 'number' || isNaN(nodeSize)) return checkResult;

        const hasRoundShape = lymphNode.form === criteria.form?.value;
        const hasIrregularBorder = lymphNode.kontur === criteria.kontur?.value;
        const hasHeterogeneousSignal = lymphNode.homogenitaet === criteria.homogenitaet?.value;

        let morphologyCount = 0;
        if (criteria.form?.active && hasRoundShape) morphologyCount++;
        if (criteria.kontur?.active && hasIrregularBorder) morphologyCount++;
        if (criteria.homogenitaet?.active && hasHeterogeneousSignal) morphologyCount++;

        checkResult.form = hasRoundShape;
        checkResult.kontur = hasIrregularBorder;
        checkResult.homogenitaet = hasHeterogeneousSignal;
        checkResult.esgarMorphologyCount = morphologyCount;

        if (nodeSize >= 9.0) {
            checkResult.isPositive = true;
            checkResult.esgarCategory = '≥9mm';
        } else if (nodeSize >= 5.0 && nodeSize < 9.0) {
            checkResult.esgarCategory = '5-8mm';
            if (morphologyCount >= 2) {
                checkResult.isPositive = true;
            }
        } else if (nodeSize < 5.0) {
             checkResult.esgarCategory = '<5mm';
             if (morphologyCount >= 3) {
                 checkResult.isPositive = true;
             }
        }
        
        checkResult.size = checkResult.isPositive;

        return checkResult;
    }

    function _evaluatePatientWithStudyCriteria(patient, studyCriteriaSet) {
        const defaultReturn = { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        if (!patient || !studyCriteriaSet) return defaultReturn;

        const { criteria, logic } = studyCriteriaSet;
        const lymphNodes = patient.lymphknoten_t2;
        if (!Array.isArray(lymphNodes)) return { ...defaultReturn, t2Status: '-' };

        const activeCriteriaKeys = Object.keys(criteria).filter(key => criteria[key]?.active);
        if (activeCriteriaKeys.length === 0 && logic !== CONSTANTS.LOGIC_OPERATORS.KOMBINIERT) return defaultReturn;
        if (lymphNodes.length === 0) return { ...defaultReturn, t2Status: '-' };
        
        let patientIsPositive = false;
        let positiveLKCount = 0;
        const bewerteteLK = lymphNodes.map(lk => {
            if (!lk) return null;
            
            let lkIsPositive = false;
            let checkResult;

            if (logic === CONSTANTS.LOGIC_OPERATORS.KOMBINIERT) {
                checkResult = _checkSingleNodeESGAR(lk, criteria);
                lkIsPositive = checkResult.isPositive;
            } else {
                checkResult = t2CriteriaManager.checkSingleNode(lk, criteria);
                if (logic === CONSTANTS.LOGIC_OPERATORS.AND) {
                    lkIsPositive = activeCriteriaKeys.every(key => checkResult[key] === true);
                } else {
                    lkIsPositive = activeCriteriaKeys.some(key => checkResult[key] === true);
                }
            }

            if (lkIsPositive) {
                patientIsPositive = true;
                positiveLKCount++;
            }
            
            return { ...lk, isPositive: lkIsPositive, checkResult };
        }).filter(Boolean);

        return {
            t2Status: patientIsPositive ? '+' : '-',
            positiveLKCount,
            bewerteteLK
        };
    }

    function applyStudyCriteriaToDataset(dataset, studyId) {
        const studySet = getStudyCriteriaSetById(studyId);
        if (!studySet) return dataset.map(p => ({ ...p, t2: null, anzahl_t2_plus_lk: 0, lymphknoten_t2_bewertet: [] }));

        return dataset.map(patient => {
            if (!patient) return null;
            const patientCopy = cloneDeep(patient);
            const { t2Status, positiveLKCount, bewerteteLK } = _evaluatePatientWithStudyCriteria(patientCopy, studySet);
            patientCopy.t2 = t2Status;
            patientCopy.anzahl_t2_plus_lk = positiveLKCount;
            patientCopy.lymphknoten_t2_bewertet = bewerteteLK;
            return patientCopy;
        }).filter(Boolean);
    }

    function getAllStudyCriteriaSets() {
        return cloneDeep(_studyCriteriaSets);
    }

    function getStudyCriteriaSetById(id) {
        if (typeof id !== 'string') return null;
        const foundSet = _studyCriteriaSets.find(set => set.id === id);
        return foundSet ? cloneDeep(foundSet) : null;
    }

    function formatCriteriaForDisplay(criteria, logic, shortFormat = false) {
        if (!criteria) return 'N/A';
        if (logic === CONSTANTS.LOGIC_OPERATORS.KOMBINIERT) {
            const studySet = _studyCriteriaSets.find(s => s.logic === 'KOMBINIERT');
            if(studySet) {
                return shortFormat ? (studySet.displayShortName || studySet.name) : studySet.description;
            }
            return "Kombinierte Logik";
        }
        
        const activeKeys = Object.keys(criteria).filter(key => criteria[key]?.active);
        if (activeKeys.length === 0) return "Keine aktiven Kriterien";

        const formatValue = (key, criterion) => {
            if (!criterion) return '?';
            const prefix = shortFormat ? `${key.charAt(0).toUpperCase()}=` : `${key.charAt(0).toUpperCase() + key.slice(1)}=`;
            if (key === CONSTANTS.T2_CRITERIA_KEYS.SIZE) {
                return `Gr. ${criterion.condition || '≥'} ${formatNumber(criterion.threshold, 1)}mm`;
            }
            return `${prefix}${criterion.value || '?'}`;
        };

        const parts = activeKeys.map(key => formatValue(key, criteria[key]));
        const separator = ` ${logic} `;
        return parts.join(separator);
    }
    
    return Object.freeze({
        getAllStudyCriteriaSets,
        getStudyCriteriaSetById,
        applyStudyCriteriaToDataset,
        formatCriteriaForDisplay
    });
})();
