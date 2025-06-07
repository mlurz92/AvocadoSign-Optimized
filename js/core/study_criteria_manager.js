const studyCriteriaManager = (() => {

    const studyT2CriteriaSets = Object.freeze([
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            name: 'Rutegård et al. (2025) / ESGAR 2016',
            displayShortName: 'ESGAR 2016',
            context: 'Primär-Staging (Baseline-MRT)',
            applicableKollektiv: 'direkt OP',
            criteria: Object.freeze({
                size: Object.freeze({ active: true, threshold: 9.0, condition: '>=' }),
                form: Object.freeze({ active: true, value: 'rund' }),
                kontur: Object.freeze({ active: true, value: 'irregulär' }),
                homogenitaet: Object.freeze({ active: true, value: 'heterogen' }),
                signal: Object.freeze({ active: false, value: null })
            }),
            logic: 'KOMBINIERT',
            description: 'ESGAR 2016 Kriterien für Primär-Staging: Größe ≥ 9mm ODER (Größe 5-8mm UND ≥2 Merkmale [rund, irregulär, heterogen]) ODER (Größe < 5mm UND ALLE 3 Merkmale [rund, irregulär, heterogen]).',
             studyInfo: Object.freeze({
                reference: "Rutegård et al., Eur Radiol (2025); Beets-Tan et al., Eur Radiol (2018) [ESGAR Consensus]",
                patientCohort: "Rutegård: N=46 (27 direkt OP, 19 nCRT) - Analyse auf Baseline-MRT. ESGAR: Konsensus.",
                investigationType: "Primärstaging",
                focus: "Validierung ESGAR 2016 Kriterien (Rutegård) bzw. Konsensus-Empfehlung (ESGAR).",
                keyCriteriaSummary: "Größe ≥ 9mm ODER (5-8mm UND ≥2 von [rund, irregulär, heterogen]) ODER (<5mm UND 3 von [rund, irregulär, heterogen])."
            })
        }),
        Object.freeze({
            id: 'koh_2008_morphology',
            name: 'Koh et al. (2008)',
            displayShortName: 'Koh et al.',
            context: 'Primär & Restaging (Urspr. Studie fokussiert auf Post-nCRT)',
            applicableKollektiv: 'Gesamt',
            criteria: Object.freeze({
                size: Object.freeze({ active: false, threshold: null, condition: null }),
                form: Object.freeze({ active: false, value: null }),
                kontur: Object.freeze({ active: true, value: 'irregulär' }),
                homogenitaet: Object.freeze({ active: true, value: 'heterogen' }),
                signal: Object.freeze({ active: false, value: null })
            }),
            logic: 'ODER',
            description: 'Koh et al. (2008): Morphologische Kriterien - Irreguläre Kontur ODER heterogenes Binnensignal. In dieser Anwendung für das Gesamtkollektiv evaluiert.',
            studyInfo: Object.freeze({
                reference: "Koh et al., Int J Radiat Oncol Biol Phys (2008)",
                patientCohort: "Ursprüngliche Studie: N=25 (alle nCRT, 'poor-risk'). Anwendung in diesem Tool: Gesamtkollektiv.",
                investigationType: "Vor und nach nCRT (Ursprüngliche Genauigkeitsanalyse post-nCRT)",
                focus: "Ursprünglich: Bewertung von LK vor und nach nCRT mittels Morphologie. In diesem Tool: Vergleichbarkeit mit Avocado Sign im Gesamtkollektiv.",
                keyCriteriaSummary: "Irreguläre Kontur ODER heterogenes Signal."
            })
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            name: 'Barbaro et al. (2024)',
            displayShortName: 'Barbaro et al.',
            context: 'Restaging nach nCRT',
            applicableKollektiv: 'nRCT',
            criteria: Object.freeze({
                size: Object.freeze({ active: true, threshold: 2.3, condition: '>=' }),
                form: Object.freeze({ active: false, value: null }),
                kontur: Object.freeze({ active: false, value: null }),
                homogenitaet: Object.freeze({ active: false, value: null }),
                signal: Object.freeze({ active: false, value: null })
            }),
            logic: 'ODER',
            description: 'Barbaro et al. (2024): Optimaler Cut-off für Kurzachse im Restaging nach nRCT: ≥ 2.3mm (Original 2.2mm).',
             studyInfo: Object.freeze({
                reference: "Barbaro et al., Radiother Oncol (2024)",
                patientCohort: "N=191 (alle nCRT, LARC)",
                investigationType: "Restaging nach nCRT",
                focus: "MRI-Bewertung N-Status nach nCRT mittels Größe (optimaler Cut-off).",
                keyCriteriaSummary: "Kurzachse ≥ 2.3 mm (basierend auf Studie: 2.2mm)."
            })
        })
    ]);

    function formatCriteriaForDisplay(criteriaObj, logic = null, shortFormat = false) {
        if (!criteriaObj || typeof criteriaObj !== 'object') return 'N/A';

        const parts = [];
        const activeKeys = Object.keys(criteriaObj).filter(key => key !== 'logic' && criteriaObj[key]?.active === true);

        if (activeKeys.length === 0) return 'Keine aktiven Kriterien';

        const formatValue = (key, criterion, isShort) => {
            if (!criterion) return '?';
            if (key === 'size') {
                const formattedThreshold = formatNumber(criterion.threshold, 1, '?');
                const prefix = isShort ? 'Gr.' : 'Größe';
                return `${prefix} ${criterion.condition || '>='} ${formattedThreshold}mm`;
            }
            let value = criterion.value || '?';
            if (isShort) {
                switch (value) {
                    case 'irregulär': value = 'irr.'; break;
                    case 'scharf': value = 'scharf'; break;
                    case 'heterogen': value = 'het.'; break;
                    case 'homogen': value = 'hom.'; break;
                    case 'signalarm': value = 'sig.arm'; break;
                    case 'intermediär': value = 'sig.int.'; break;
                    case 'signalreich': value = 'sig.reich'; break;
                    case 'rund': value = 'rund'; break;
                    case 'oval': value = 'oval'; break;
                }
            }
            let prefix = '';
             switch(key) {
                case 'form': prefix = isShort ? 'Fo=' : 'Form='; break;
                case 'kontur': prefix = isShort ? 'Ko=' : 'Kontur='; break;
                case 'homogenitaet': prefix = isShort ? 'Ho=' : 'Homog.='; break;
                case 'signal': prefix = isShort ? 'Si=' : 'Signal='; break;
                default: prefix = key + '=';
            }
            return `${prefix}${value}`;
        };

        const priorityOrder = ['size', 'kontur', 'homogenitaet', 'form', 'signal'];
        const sortedActiveKeys = [...activeKeys].sort((a, b) => {
            const indexA = priorityOrder.indexOf(a);
            const indexB = priorityOrder.indexOf(b);
            // Handle keys not in priorityOrder gracefully by placing them at the end or sorting alphabetically
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1; // b comes before a
            if (indexB === -1) return -1; // a comes before b
            return indexA - indexB;
        });

        sortedActiveKeys.forEach(key => {
             parts.push(formatValue(key, criteriaObj[key], shortFormat));
        });

        const effectiveLogic = logic || criteriaObj.logic || 'ODER';

        if (effectiveLogic === 'KOMBINIERT') {
             // This logic block implies that 'KOMBINIERT' logic is handled by a specific studySet.
             // If criteriaObj matches a known KOMBINIERT set, use its description.
             const studySet = studyT2CriteriaSets.find(s => s.logic === 'KOMBINIERT' && JSON.stringify(s.criteria) === JSON.stringify(criteriaObj));
             if (studySet?.description) {
                 return shortFormat ? (studySet.displayShortName || studySet.name) : studySet.description;
             }
             // Fallback for a KOMBINIERT set that is not explicitly defined in studyT2CriteriaSets
             // or if only specific parts are active
             if (parts.length > 0) {
                 return `Kombinierte Logik: ${parts.join(' ')}`; // Just join with space, as "UND/ODER" might not apply
             }
             return criteriaObj.note || 'Kombinierte Logik';
        }
        const separator = (effectiveLogic === 'UND') ? ' UND ' : ' ODER ';

        if (shortFormat && parts.length > 2) {
             return parts.slice(0, 2).join(separator) + ' ...';
        }

        return parts.join(separator);
    }

    function getAllStudyCriteriaSets() {
        return cloneDeep(studyT2CriteriaSets);
    }

    function getAllStudyCriteriaSetsSorted() {
        const sortedSets = [...studyT2CriteriaSets].sort((a, b) => {
            const nameA = a.name || a.id;
            const nameB = b.name || b.id;
            return nameA.localeCompare(nameB);
        });
        return cloneDeep(sortedSets);
    }

    function getStudyCriteriaSetById(id) {
        if (typeof id !== 'string') return null;
        const foundSet = studyT2CriteriaSets.find(set => set.id === id);
        return foundSet ? cloneDeep(foundSet) : null;
    }

    function _checkSingleNodeESGAR(lymphNode, criteria) {
        const checkResult = {
             size: null, form: null, kontur: null, homogenitaet: null, signal: null,
             esgarCategory: 'N/A', esgarMorphologyCount: 0, isPositive: false
        };
        if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') return checkResult;

        const nodeSize = (typeof lymphNode.groesse === 'number' && !isNaN(lymphNode.groesse)) ? lymphNode.groesse : -1;
        
        // Ensure criteria exist and are active for evaluation
        const hasRoundShape = (criteria.form?.active && lymphNode.form === criteria.form?.value);
        const hasIrregularBorder = (criteria.kontur?.active && lymphNode.kontur === criteria.kontur?.value);
        const hasHeterogeneousSignal = (criteria.homogenitaet?.active && lymphNode.homogenitaet === criteria.homogenitaet?.value);

        let morphologyCount = 0;
        if (hasRoundShape) morphologyCount++;
        if (hasIrregularBorder) morphologyCount++;
        if (hasHeterogeneousSignal) morphologyCount++;

        // Store the boolean result of each individual check in checkResult
        checkResult.size = (criteria.size?.active && nodeSize >= (criteria.size.threshold || 9.0)); // Default threshold 9.0 if not defined
        checkResult.form = hasRoundShape;
        checkResult.kontur = hasIrregularBorder;
        checkResult.homogenitaet = hasHeterogeneousSignal;
        checkResult.signal = (criteria.signal?.active && lymphNode.signal === criteria.signal?.value); // ESGAR doesn't use signal, but keeping for consistency if criteria includes it


        // ESGAR specific categories and positivity logic
        if (nodeSize >= 9.0) {
            checkResult.isPositive = true;
            checkResult.esgarCategory = '≥9mm';
        } else if (nodeSize >= 5.0 && nodeSize < 9.0) {
            checkResult.esgarCategory = '5-8mm';
            if (morphologyCount >= 2) { // 2 out of 3 morphological features (round, irregular, heterogeneous)
                checkResult.isPositive = true;
            }
        } else if (nodeSize >= 0 && nodeSize < 5.0) {
             checkResult.esgarCategory = '<5mm';
             if (morphologyCount >= 3) { // ALL 3 morphological features
                 checkResult.isPositive = true;
             }
        } else {
            checkResult.esgarCategory = 'N/A (Größe ungültig)';
        }

        checkResult.esgarMorphologyCount = morphologyCount;
        return checkResult;
    }

     function _checkSingleNodeSimple(lymphNode, criteria) {
        const checkResult = { size: null, form: null, kontur: null, homogenitaet: null, signal: null };
        if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') return checkResult;

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
        if (criteria.form?.active) checkResult.form = (lymphNode.form === criteria.form.value);
        if (criteria.kontur?.active) checkResult.kontur = (lymphNode.kontur === criteria.kontur.value);
        if (criteria.homogenitaet?.active) checkResult.homogenitaet = (lymphNode.homogenitaet === criteria.homogenitaet.value);
        if (criteria.signal?.active) checkResult.signal = (lymphNode.signal !== null && lymphNode.signal === criteria.signal.value);

        return checkResult;
    }

    function applyStudyT2CriteriaToPatient(patient, studyCriteriaSet) {
        const defaultReturn = { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        if (!patient || typeof patient !== 'object' || !studyCriteriaSet || typeof studyCriteriaSet !== 'object' || !studyCriteriaSet.criteria) {
            return defaultReturn;
        }

        const lymphNodes = patient.lymphknoten_t2;
        if (!Array.isArray(lymphNodes)) {
            const activeCriteriaKeysForEmpty = Object.keys(studyCriteriaSet.criteria).filter(key => key !== 'logic' && studyCriteriaSet.criteria[key]?.active === true);
             return { t2Status: activeCriteriaKeysForEmpty.length > 0 ? '-' : null, positiveLKCount: 0, bewerteteLK: [] };
        }

        let patientIsPositive = false;
        let positiveLKCount = 0;
        const bewerteteLK = [];
        const criteria = studyCriteriaSet.criteria;
        const logic = studyCriteriaSet.logic;
        const activeCriteriaKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);


        // If no lymph nodes but active criteria, implies negative if criteria set is applicable (e.g., for patient-level evaluation)
        if (lymphNodes.length === 0 && activeCriteriaKeys.length > 0) {
            return { t2Status: '-', positiveLKCount: 0, bewerteteLK: [] };
        }
        // If no lymph nodes and no active criteria (and not a combined logic which implies "active"), status is null/unknown
        if (lymphNodes.length === 0 && activeCriteriaKeys.length === 0 && logic !== 'KOMBINIERT') {
            return { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        }
        // If no lymph nodes but a "KOMBINIERT" logic (like ESGAR), which implies a complex rule, generally assume negative if no nodes.
        if (lymphNodes.length === 0 && logic === 'KOMBINIERT') {
            return { t2Status: '-', positiveLKCount: 0, bewerteteLK: [] };
        }


        lymphNodes.forEach(lk => {
            if (!lk || typeof lk !== 'object') {
                 bewerteteLK.push(null);
                 return;
            }

            let lkIsPositive = false;
            let checkResult = null; // Will store detailed boolean results for each criterion

            if (logic === 'KOMBINIERT' && studyCriteriaSet.id === 'rutegard_et_al_esgar') {
                checkResult = _checkSingleNodeESGAR(lk, criteria);
                lkIsPositive = checkResult.isPositive; // ESGAR returns overall node positivity directly
            } else {
                checkResult = _checkSingleNodeSimple(lk, criteria); // Simple check returns boolean for each criterion
                if (activeCriteriaKeys.length > 0) {
                   if (logic === 'UND') {
                       lkIsPositive = activeCriteriaKeys.every(key => checkResult[key] === true);
                   } else {
                       lkIsPositive = activeCriteriaKeys.some(key => checkResult[key] === true);
                   }
                }
            }

            if (lkIsPositive) {
                patientIsPositive = true;
                positiveLKCount++;
            }
             const bewerteterLK = {
                lk: cloneDeep(lk), // Clone the original lymph node data
                evaluationDetails: checkResult, // Store the detailed check results
                passes: lkIsPositive // Overall positivity of this specific lymph node
            };
            bewerteteLK.push(bewerteterLK);
        });

        let finalT2Status = null;
        // If there were active criteria (or a combined logic) and there were lymph nodes to evaluate,
        // then assign '+' or '-' status. Otherwise, it might be '?' (unknown) if no criteria were active or no nodes.
        if (logic === 'KOMBINIERT' || activeCriteriaKeys.length > 0) {
            finalT2Status = patientIsPositive ? '+' : '-';
        }

        return {
            t2Status: finalT2Status,
            positiveLKCount: positiveLKCount,
            bewerteteLK: bewerteteLK
        };
    }

    function applyStudyT2CriteriaToDataset(dataset, studyCriteriaSet) {
         if (!studyCriteriaSet || typeof studyCriteriaSet !== 'object' || !studyCriteriaSet.criteria) {
            console.error("applyStudyT2CriteriaToDataset: Ungültiges oder fehlendes Kriterienset.");
            // Return dataset with 't2' status set to null or '?', and empty bewerteteLK
            return (dataset || []).map(p => {
                const pCopy = cloneDeep(p);
                pCopy.t2 = null; // Or '?' if that's desired for "not evaluated by criteria"
                pCopy.anzahl_t2_plus_lk = 0;
                // Ensure lymphknoten_t2_bewertet structure is consistent even if not evaluated
                pCopy.lymphknoten_t2_bewertet = (pCopy.lymphknoten_t2 || []).map(lk => ({lk: cloneDeep(lk), isPositive: false, evaluationDetails: {}}));
                return pCopy;
            });
         }
         if (!Array.isArray(dataset)) {
             console.error("applyStudyT2CriteriaToDataset: Ungültige Eingabedaten, Array erwartet.");
             return [];
         }

         return dataset.map(patient => {
             if (!patient) return null;
             const patientCopy = cloneDeep(patient);
             const { t2Status, positiveLKCount, bewerteteLK } = applyStudyT2CriteriaToPatient(patientCopy, studyCriteriaSet);
             patientCopy.t2 = t2Status;
             patientCopy.anzahl_t2_plus_lk = positiveLKCount;
             patientCopy.lymphknoten_t2_bewertet = bewerteteLK;
             return patientCopy;
         }).filter(p => p !== null);
    }
    
    function getStudyListForPresentation() {
        const sets = getAllStudyCriteriaSetsSorted();
        return sets.map(s => ({ id: s.id, name: s.name, displayShortName: s.displayShortName, applicableKollektiv: s.applicableKollektiv }));
    }

    function formatStudyCriteriaForDisplay(studyCriteriaSet) {
        if (!studyCriteriaSet) return 'N/A';
        const criteria = studyCriteriaSet.criteria;
        const logic = studyCriteriaSet.logic;

        if (logic === 'KOMBINIERT' && studyCriteriaSet.description) {
             return studyCriteriaSet.description;
        }
        if (!criteria) return `${studyCriteriaSet.name || studyCriteriaSet.id} (Keine Kriterien definiert)`;

        // Use the general formatCriteriaForDisplay for standard logic
        const formattedCriteria = formatCriteriaForDisplay(criteria, logic);
        return `(${studyCriteriaSet.name || studyCriteriaSet.id}): ${formattedCriteria}`;
    }

    return Object.freeze({
        getAllStudyCriteriaSets,
        getAllStudyCriteriaSetsSorted,
        getStudyCriteriaSetById,
        applyStudyT2CriteriaToPatient,
        applyStudyT2CriteriaToDataset,
        formatStudyCriteriaForDisplay,
        formatCriteriaForDisplay, // Make formatCriteriaForDisplay public as it's used by other modules
        getStudyListForPresentation
    });

})();
