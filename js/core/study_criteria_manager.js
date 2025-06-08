const studyT2CriteriaManager = (() => {

    const studyT2CriteriaSets = PUBLICATION_CONFIG.literatureCriteriaSets.map(set => ({
        ...set,
        ...studyT2CriteriaManager._getSetDetailsById(set.id)
    }));

    function _getSetDetailsById(id) {
        const sets = {
            'rutegard_et_al_esgar': {
                name: 'Rutegård et al. (2025) / ESGAR 2016',
                displayShortName: 'ESGAR 2016',
                context: 'Primär-Staging (Baseline-MRT)',
                applicableKollektiv: 'direkt OP',
                criteria: {
                    size: { active: true, threshold: 9.0, condition: '>=' },
                    form: { active: true, value: 'rund' },
                    kontur: { active: true, value: 'irregulär' },
                    homogenitaet: { active: true, value: 'heterogen' },
                    signal: { active: false, value: null }
                },
                logic: 'KOMBINIERT',
                description: 'ESGAR 2016 Kriterien: Größe ≥9mm ODER (5-8mm UND ≥2 suspekte Merkmale) ODER (<5mm UND 3 suspekte Merkmale).',
                studyInfo: {
                    reference: "Rutegård et al., Eur Radiol (2025); Beets-Tan et al., Eur Radiol (2018)",
                    patientCohort: "Rutegård: N=46. Anwendung auf Baseline-MRT bei Direkt-OP-Patienten.",
                    investigationType: "Primärstaging",
                    focus: "Validierung ESGAR 2016 Kriterien.",
                    keyCriteriaSummary: "Größe ≥9mm ODER (5-8mm UND ≥2 von [rund, irregulär, heterogen]) ODER (<5mm UND 3 von [rund, irregulär, heterogen])."
                }
            },
            'koh_2008_morphology': {
                name: 'Koh et al. (2008)',
                displayShortName: 'Koh et al.',
                context: 'Primär & Restaging',
                applicableKollektiv: 'Gesamt',
                criteria: {
                    size: { active: false, threshold: null, condition: null },
                    form: { active: false, value: null },
                    kontur: { active: true, value: 'irregulär' },
                    homogenitaet: { active: true, value: 'heterogen' },
                    signal: { active: false, value: null }
                },
                logic: 'ODER',
                description: 'Irreguläre Kontur ODER heterogenes Binnensignal.',
                studyInfo: {
                    reference: "Koh et al., Int J Radiat Oncol Biol Phys (2008)",
                    patientCohort: "N=25 (alle nCRT, 'poor-risk'). Anwendung hier: Gesamtkollektiv.",
                    investigationType: "Vor und nach nCRT",
                    focus: "Morphologische Bewertung vor und nach nCRT.",
                    keyCriteriaSummary: "Irreguläre Kontur ODER heterogenes Signal."
                }
            },
            'barbaro_2024_restaging': {
                name: 'Barbaro et al. (2024)',
                displayShortName: 'Barbaro et al.',
                context: 'Restaging nach nCRT',
                applicableKollektiv: 'nRCT',
                criteria: {
                    size: { active: true, threshold: 2.3, condition: '>=' },
                    form: { active: false, value: null },
                    kontur: { active: false, value: null },
                    homogenitaet: { active: false, value: null },
                    signal: { active: false, value: null }
                },
                logic: 'ODER',
                description: 'Optimaler Cut-off für Kurzachse im Restaging nach nCRT: ≥2.3mm.',
                 studyInfo: {
                    reference: "Barbaro et al., Radiother Oncol (2024)",
                    patientCohort: "N=191 (alle nCRT, LARC)",
                    investigationType: "Restaging nach nCRT",
                    focus: "Größenbasierter Cut-off zur Vorhersage des ypN-Status.",
                    keyCriteriaSummary: "Kurzachse ≥ 2.3 mm."
                }
            }
        };
        return sets[id] || null;
    }

    function formatCriteriaForDisplay(criteria, logic = null, shortFormat = false) {
        if (!criteria || typeof criteria !== 'object') return 'N/A';
        const parts = [];
        const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);
        if (activeKeys.length === 0) return 'Keine aktiven Kriterien';

        const formatValue = (key, criterion, isShort) => {
            if (!criterion) return '?';
            if (key === 'size') {
                const prefix = isShort ? 'Gr.' : 'Größe';
                return `${prefix} ${criterion.condition || '>='}${utils.formatNumber(criterion.threshold, 1, '?')}mm`;
            }
            let value = criterion.value || '?';
            if (isShort) {
                const shortMap = { 'irregulär': 'irr.', 'heterogen': 'het.', 'signalarm': 'sig.arm', 'intermediär': 'sig.int.', 'signalreich': 'sig.reich' };
                value = shortMap[value] || value;
            }
            const prefixMap = { form: 'Fo=', kontur: 'Ko=', homogenitaet: 'Ho=', signal: 'Si=' };
            const prefix = prefixMap[key] || `${key}=`;
            return `${prefix}${value}`;
        };
        const priorityOrder = ['size', 'kontur', 'homogenitaet', 'form', 'signal'];
        const sortedActiveKeys = [...activeKeys].sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b));

        sortedActiveKeys.forEach(key => parts.push(formatValue(key, criteria[key], shortFormat)));
        const effectiveLogic = logic || criteria.logic || 'ODER';

        if (effectiveLogic === 'KOMBINIERT') {
             const studySet = studyT2CriteriaSets.find(s => s.logic === 'KOMBINIERT' && s.criteria.size.threshold === criteria.size.threshold);
             if (studySet) return shortFormat ? (studySet.displayShortName || studySet.name) : studySet.description;
             return 'Kombinierte ESGAR-Logik';
        }
        const separator = (effectiveLogic === 'UND') ? ' UND ' : ' ODER ';
        if (shortFormat && parts.length > 2) return `${parts.slice(0, 2).join(separator)} ...`;
        return parts.join(separator);
    }

    function getAllStudyCriteriaSets() {
        return utils.cloneDeep(studyT2CriteriaSets);
    }

    function getStudyCriteriaSetById(id) {
        if (typeof id !== 'string') return null;
        const foundSet = studyT2CriteriaSets.find(set => set.id === id);
        return foundSet ? utils.cloneDeep(foundSet) : null;
    }

    function _checkSingleNodeESGAR(lymphNode, criteria) {
        const checkResult = { size: null, form: null, kontur: null, homogenitaet: null, signal: null, esgarCategory: 'N/A', esgarMorphologyCount: 0, isPositive: false };
        if (!lymphNode || typeof lymphNode !== 'object' || !criteria) return checkResult;

        const nodeSize = (typeof lymphNode.groesse === 'number' && !isNaN(lymphNode.groesse)) ? lymphNode.groesse : -1;
        if (nodeSize < 0) return checkResult;

        const hasRoundShape = lymphNode.form === criteria.form?.value;
        const hasIrregularBorder = lymphNode.kontur === criteria.kontur?.value;
        const hasHeterogeneousSignal = lymphNode.homogenitaet === criteria.homogenitaet?.value;

        let morphologyCount = 0;
        if (criteria.form?.active && hasRoundShape) morphologyCount++;
        if (criteria.kontur?.active && hasIrregularBorder) morphologyCount++;
        if (criteria.homogenitaet?.active && hasHeterogeneousSignal) morphologyCount++;

        checkResult.esgarMorphologyCount = morphologyCount;

        if (nodeSize >= 9.0) {
            checkResult.isPositive = true;
            checkResult.esgarCategory = '≥9mm';
        } else if (nodeSize >= 5.0) {
            checkResult.esgarCategory = '5-8mm';
            if (morphologyCount >= 2) checkResult.isPositive = true;
        } else {
             checkResult.esgarCategory = '<5mm';
             if (morphologyCount >= 3) checkResult.isPositive = true;
        }
        return checkResult;
    }

    function _applyStudyT2CriteriaToPatient(patient, studyCriteriaSet) {
        const defaultReturn = { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        if (!patient || !studyCriteriaSet) return defaultReturn;

        const lymphNodes = patient.lymphknoten_t2;
        const criteria = studyCriteriaSet.criteria;
        const logic = studyCriteriaSet.logic;

        if (!Array.isArray(lymphNodes) || lymphNodes.length === 0) {
            return { t2Status: '-', positiveLKCount: 0, bewerteteLK: [] };
        }

        let patientIsPositive = false;
        let positiveLKCount = 0;
        const bewerteteLK = lymphNodes.map(lk => {
            if (!lk) return null;
            let lkIsPositive = false;
            let checkResult;

            if (logic === 'KOMBINIERT') {
                checkResult = _checkSingleNodeESGAR(lk, criteria);
                lkIsPositive = checkResult.isPositive;
            } else {
                checkResult = t2CriteriaManager.checkSingleNode(lk, criteria);
                const activeKeys = Object.keys(criteria).filter(k => k !== 'logic' && criteria[k]?.active);
                if (activeKeys.length > 0) {
                   if (logic === 'UND') lkIsPositive = activeKeys.every(key => checkResult[key] === true);
                   else lkIsPositive = activeKeys.some(key => checkResult[key] === true);
                }
            }

            if (lkIsPositive) {
                patientIsPositive = true;
                positiveLKCount++;
            }
            return { ...lk, isPositive: lkIsPositive, checkResult: checkResult };
        }).filter(lk => lk !== null);

        return {
            t2Status: patientIsPositive ? '+' : '-',
            positiveLKCount: positiveLKCount,
            bewerteteLK: bewerteteLK
        };
    }

    function applyStudyT2CriteriaToDataset(dataset, studyCriteriaSet) {
         if (!studyCriteriaSet) return (dataset || []).map(p => ({...p, t2: null, anzahl_t2_plus_lk: 0, lymphknoten_t2_bewertet: []}));
         if (!Array.isArray(dataset)) return [];
         return dataset.map(patient => {
             if (!patient) return null;
             const patientCopy = utils.cloneDeep(patient);
             const { t2Status, positiveLKCount, bewerteteLK } = _applyStudyT2CriteriaToPatient(patientCopy, studyCriteriaSet);
             patientCopy.t2 = t2Status;
             patientCopy.anzahl_t2_plus_lk = positiveLKCount;
             patientCopy.lymphknoten_t2_bewertet = bewerteteLK;
             return patientCopy;
         }).filter(p => p !== null);
    }

    _initializeState();
    function _initializeState() {
        studyT2CriteriaSets.forEach(Object.freeze);
        Object.freeze(studyT2CriteriaSets);
    }


    return Object.freeze({
        getAllStudyCriteriaSets,
        getStudyCriteriaSetById,
        applyStudyT2CriteriaToDataset,
        formatCriteriaForDisplay
    });

})();
