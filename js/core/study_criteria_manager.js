const studyT2CriteriaManager = (() => {

    const studyT2CriteriaSets = Object.freeze([
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            name: 'Rutegård et al. (2025) / ESGAR 2016',
            displayShortName: 'ESGAR 2016',
            context: 'Primär-Staging (Baseline-MRT)',
            applicableKollektiv: 'direkt OP',
            criteria: Object.freeze({
                size: Object.freeze({ active: true, threshold: 9.0, condition: '>=' }), // Basis für die direkte Malignität bei >9mm
                form: Object.freeze({ active: true, value: 'rund' }),
                kontur: Object.freeze({ active: true, value: 'irregulär' }),
                homogenitaet: Object.freeze({ active: true, value: 'heterogen' }),
                signal: Object.freeze({ active: false, value: null })
            }),
            logic: 'KOMBINIERT',
            description: 'ESGAR 2016 Kriterien für Primär-Staging: Größe ≥9mm ODER (Größe 5-8mm UND ≥2 Merkmale [rund, irregulär, heterogen]) ODER (Größe <5mm UND ALLE 3 Merkmale [rund, irregulär, heterogen]).',
             studyInfo: Object.freeze({
                reference: "Rutegård et al., Eur Radiol (2025); Beets-Tan et al., Eur Radiol (2018) [ESGAR Consensus]",
                patientCohort: "Rutegård: N=46 (27 direkt OP, 19 nCRT) - Analyse auf Baseline-MRT. ESGAR: Konsensus.",
                investigationType: "Primärstaging",
                focus: "Validierung ESGAR 2016 Kriterien (Rutegård) bzw. Konsensus-Empfehlung (ESGAR).",
                keyCriteriaSummary: "Größe ≥9mm; ODER 5-8mm UND ≥2 von (rund, irregulär, heterogen); ODER <5mm UND 3 von (rund, irregulär, heterogen)."
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
            description: 'Barbaro et al. (2024): Optimaler Cut-off für Kurzachse im Restaging nach nRCT: ≥2.3mm (Originalstudie 2.2mm, hier angepasst an 0.1mm Schrittweite).',
             studyInfo: Object.freeze({
                reference: "Barbaro et al., Radiother Oncol (2024)",
                patientCohort: "N=191 (alle nCRT, LARC)",
                investigationType: "Restaging nach nCRT",
                focus: "MRI-Bewertung N-Status nach nCRT mittels Größe (optimaler Cut-off).",
                keyCriteriaSummary: "Kurzachse ≥ 2.3 mm (basierend auf Studie: 2.2mm)."
            })
        })
    ]);

    function formatCriteriaForDisplay(criteria, logic = null, shortFormat = false) {
        if (!criteria || typeof criteria !== 'object') return 'N/A';

        const parts = [];
        const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);

        if (activeKeys.length === 0) return 'Keine aktiven Kriterien';

        const formatValue = (key, criterion, isShort) => {
            if (!criterion) return '?';
            let prefix = '';
            let valueText = '';

            if (key === 'size') {
                const formattedThreshold = formatNumber(criterion.threshold, 1, '?');
                prefix = isShort ? 'Gr.' : 'Größe';
                valueText = `${criterion.condition || '>='}${formattedThreshold}mm`;
            } else {
                let val = criterion.value || '?';
                if (isShort) {
                    switch (val) {
                        case 'irregulär': val = 'irr.'; break;
                        case 'scharf': val = 'scharf'; break;
                        case 'heterogen': val = 'het.'; break;
                        case 'homogen': val = 'hom.'; break;
                        case 'signalarm': val = 'sig.arm'; break;
                        case 'intermediär': val = 'sig.int.'; break;
                        case 'signalreich': val = 'sig.reich'; break;
                        case 'rund': val = 'rund'; break;
                        case 'oval': val = 'oval'; break;
                    }
                }
                valueText = val;
                 switch(key) {
                    case 'form': prefix = isShort ? 'Fo=' : 'Form='; break;
                    case 'kontur': prefix = isShort ? 'Ko=' : 'Kontur='; break;
                    case 'homogenitaet': prefix = isShort ? 'Ho=' : 'Homog.='; break;
                    case 'signal': prefix = isShort ? 'Si=' : 'Signal='; break;
                    default: prefix = key + '=';
                }
            }
            return `${prefix}${valueText}`;
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
             parts.push(formatValue(key, criteria[key], shortFormat));
        });

        const effectiveLogic = logic || criteria.logic || 'ODER';

        if (effectiveLogic === 'KOMBINIERT') {
             const studySet = studyT2CriteriaSets.find(s => {
                if (s.logic !== 'KOMBINIERT') return false;
                const critKeys = Object.keys(s.criteria);
                if (critKeys.length !== Object.keys(criteria).length) return false;
                return critKeys.every(k => {
                    if (k === 'logic') return true;
                    return criteria[k] && s.criteria[k] &&
                           criteria[k].active === s.criteria[k].active &&
                           (k === 'size' ? criteria[k].threshold === s.criteria[k].threshold : criteria[k].value === s.criteria[k].value);
                });
             });
             if (studySet?.studyInfo?.keyCriteriaSummary) {
                 return shortFormat ? (studySet.displayShortName || studySet.name) : studySet.studyInfo.keyCriteriaSummary;
             }
             return criteria.note || 'Kombinierte Logik (Details nicht darstellbar)';
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

    function getStudyCriteriaSetById(id) {
        if (typeof id !== 'string') return null;
        const foundSet = studyT2CriteriaSets.find(set => set.id === id);
        return foundSet ? cloneDeep(foundSet) : null;
    }

    function _checkSingleNodeESGAR(lymphNode, criteria) {
        const checkResult = {
             size_val: null, form_val: null, kontur_val: null, homogenitaet_val: null, signal_val: null,
             size: null, form: null, kontur: null, homogenitaet: null, signal: null, // criteria met flags
             esgarCategory: 'N/A', esgarMorphologyCount: 0, isPositive: false
        };
        if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') return checkResult;

        const nodeSize = (typeof lymphNode.groesse === 'number' && !isNaN(lymphNode.groesse) && lymphNode.groesse >= 0) ? lymphNode.groesse : -1;
        checkResult.size_val = nodeSize >= 0 ? nodeSize : null;
        checkResult.form_val = lymphNode.form || null;
        checkResult.kontur_val = lymphNode.kontur || null;
        checkResult.homogenitaet_val = lymphNode.homogenitaet || null;
        checkResult.signal_val = lymphNode.signal || null;


        const hasRoundShape = criteria.form?.active && lymphNode.form === criteria.form.value;
        const hasIrregularBorder = criteria.kontur?.active && lymphNode.kontur === criteria.kontur.value;
        const hasHeterogeneousSignal = criteria.homogenitaet?.active && lymphNode.homogenitaet === criteria.homogenitaet.value;

        let morphologyCount = 0;
        if (hasRoundShape) morphologyCount++;
        if (hasIrregularBorder) morphologyCount++;
        if (hasHeterogeneousSignal) morphologyCount++;

        checkResult.esgarMorphologyCount = morphologyCount;
        checkResult.form = hasRoundShape;
        checkResult.kontur = hasIrregularBorder;
        checkResult.homogenitaet = hasHeterogeneousSignal;


        if (nodeSize >= 9.0) {
            checkResult.isPositive = true;
            checkResult.esgarCategory = '≥9mm';
            checkResult.size = true; // erfüllt das >9mm Kriterium
        } else if (nodeSize >= 5.0 && nodeSize < 9.0) {
            checkResult.esgarCategory = '5-8mm';
            checkResult.size = false; // erfüllt nicht das >9mm, aber das 5-8mm Kriterium
            if (morphologyCount >= 2) {
                checkResult.isPositive = true;
            }
        } else if (nodeSize >= 0 && nodeSize < 5.0) {
             checkResult.esgarCategory = '<5mm';
             checkResult.size = false; // erfüllt <5mm
             if (morphologyCount >= 3) {
                 checkResult.isPositive = true;
             }
        } else {
            checkResult.esgarCategory = 'N/A (Größe ungültig/fehlt)';
            checkResult.size = false;
        }
        return checkResult;
    }

     function _checkSingleNodeSimple(lymphNode, criteria) {
        const checkResult = { size: null, form: null, kontur: null, homogenitaet: null, signal: null };
        if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') return checkResult;

        checkResult.size_val = (typeof lymphNode.groesse === 'number' && !isNaN(lymphNode.groesse)) ? lymphNode.groesse : null;
        checkResult.form_val = lymphNode.form || null;
        checkResult.kontur_val = lymphNode.kontur || null;
        checkResult.homogenitaet_val = lymphNode.homogenitaet || null;
        checkResult.signal_val = lymphNode.signal || null;

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
        if (criteria.form?.active) checkResult.form = (lymphNode.form !== null && lymphNode.form === criteria.form.value);
        if (criteria.kontur?.active) checkResult.kontur = (lymphNode.kontur !== null && lymphNode.kontur === criteria.kontur.value);
        if (criteria.homogenitaet?.active) checkResult.homogenitaet = (lymphNode.homogenitaet !== null && lymphNode.homogenitaet === criteria.homogenitaet.value);
        if (criteria.signal?.active) checkResult.signal = (lymphNode.signal !== null && lymphNode.signal === criteria.signal.value);

        return checkResult;
    }

    function applyStudyT2CriteriaToPatient(patient, studyCriteriaSet) {
        const defaultReturn = { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        if (!patient || typeof patient !== 'object' || !studyCriteriaSet || typeof studyCriteriaSet !== 'object' || !studyCriteriaSet.criteria) {
            return defaultReturn;
        }

        const lymphNodes = patient.lymphknoten_t2;
        const criteria = studyCriteriaSet.criteria;
        const logic = studyCriteriaSet.logic;
        const activeCriteriaKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);

        if (!Array.isArray(lymphNodes) || lymphNodes.length === 0) {
             const noLNsStatus = (logic === 'KOMBINIERT' || activeCriteriaKeys.length > 0) ? '-' : null;
             return {
                t2Status: noLNsStatus,
                positiveLKCount: 0,
                bewerteteLK: (Array.isArray(lymphNodes) && lymphNodes.length === 0) ? [] : (patient.lymphknoten_t2 || []).map(lk_orig => ({
                    ...(lk_orig || {}),
                    isPositive: false,
                    checkResult: { size: null, form: null, kontur: null, homogenitaet: null, signal: null }
                }))
             };
        }

        let patientIsPositive = false;
        let positiveLKCount = 0;
        const bewerteteLK = [];


        lymphNodes.forEach(lk => {
            if (!lk || typeof lk !== 'object') {
                 bewerteteLK.push({
                    groesse: null, form: null, kontur: null, homogenitaet: null, signal: null,
                    isPositive: false,
                    checkResult: { size: null, form: null, kontur: null, homogenitaet: null, signal: null, size_val: null, form_val: null, kontur_val: null, homogenitaet_val: null, signal_val: null, esgarCategory: 'N/A', esgarMorphologyCount: 0 }
                 });
                 return;
            }

            let lkIsPositive = false;
            let checkResult = null;

            if (logic === 'KOMBINIERT' && studyCriteriaSet.id === 'rutegard_et_al_esgar') {
                checkResult = _checkSingleNodeESGAR(lk, criteria);
                lkIsPositive = checkResult.isPositive;
            } else {
                checkResult = _checkSingleNodeSimple(lk, criteria);
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
                groesse: lk.groesse ?? null,
                form: lk.form ?? null,
                kontur: lk.kontur ?? null,
                homogenitaet: lk.homogenitaet ?? null,
                signal: lk.signal ?? null,
                isPositive: lkIsPositive,
                checkResult: checkResult // Enthält jetzt auch _val und ESGAR-spezifische Felder
            };
            bewerteteLK.push(bewerteterLK);
        });

        let finalT2Status = null;
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
            return (dataset || []).map(p => {
                if (!p) return null;
                const pCopy = cloneDeep(p);
                pCopy.t2 = null;
                pCopy.anzahl_t2_plus_lk = 0;
                pCopy.lymphknoten_t2_bewertet = (pCopy.lymphknoten_t2 || []).map(lk_orig => ({
                    ...(lk_orig || {}),
                    isPositive: false,
                    checkResult: { size: null, form: null, kontur: null, homogenitaet: null, signal: null, size_val: null, form_val: null, kontur_val: null, homogenitaet_val: null, signal_val: null, esgarCategory: 'N/A', esgarMorphologyCount: 0 }
                }));
                return pCopy;
            }).filter(p => p !== null);
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

    function formatStudyCriteriaForDisplay(studyCriteriaSet) {
        if (!studyCriteriaSet) return 'N/A';
        const criteria = studyCriteriaSet.criteria;
        const logic = studyCriteriaSet.logic;

        if (logic === 'KOMBINIERT' && studyCriteriaSet.studyInfo?.keyCriteriaSummary) {
             return `(${studyCriteriaSet.name || studyCriteriaSet.id}): ${studyCriteriaSet.studyInfo.keyCriteriaSummary}`;
        }
        if (!criteria) return `${studyCriteriaSet.name || studyCriteriaSet.id} (Keine Kriterien definiert)`;

        const formattedCriteria = formatCriteriaForDisplay(criteria, logic);
        return `(${studyCriteriaSet.name || studyCriteriaSet.id}): ${formattedCriteria}`;
    }

    return Object.freeze({
        getAllStudyCriteriaSets,
        getStudyCriteriaSetById,
        applyStudyT2CriteriaToPatient,
        applyStudyT2CriteriaToDataset,
        formatStudyCriteriaForDisplay, // Exposing the general formatter as well
        formatStudyCriteriaForDisplayStrict: formatStudyCriteriaForDisplay // Alias für Klarheit, wenn nur Kriterien+Logik formatiert werden
    });

})();
