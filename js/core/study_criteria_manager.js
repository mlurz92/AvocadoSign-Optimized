const studyT2CriteriaManager = (() => {

    const studyT2CriteriaSets = Object.freeze([
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            name: 'Rutegård et al. (2025) / ESGAR 2016',
            displayShortName: 'ESGAR 2016',
            context: 'Primär-Staging (Baseline-MRT)',
            applicableKollektiv: 'direkt OP',
            criteria: Object.freeze({
                size: Object.freeze({ active: true, threshold: 9.0, condition: '>=' }), // Placeholder, actual logic in _checkSingleNodeESGAR
                form: Object.freeze({ active: true, value: 'rund' }),
                kontur: Object.freeze({ active: true, value: 'irregulär' }),
                homogenitaet: Object.freeze({ active: true, value: 'heterogen' }),
                signal: Object.freeze({ active: false, value: null }) // Signal not part of ESGAR morphology criteria
            }),
            logic: 'KOMBINIERT',
            description: 'ESGAR 2016 Kriterien für Primär-Staging: Größe ≥ 9mm ODER (Größe 5-8mm UND ≥2 morphologische Merkmale [rund, irregulär, heterogen]) ODER (Größe < 5mm UND ALLE 3 morphologischen Merkmale [rund, irregulär, heterogen]).',
             studyInfo: Object.freeze({
                reference: "Rutegård et al., Eur Radiol (2025); Beets-Tan et al., Eur Radiol (2018) [ESGAR Consensus]",
                patientCohort: "Rutegård et al. (2025): N=46 (27 primär operiert, 19 neoadjuvant behandelt) - Analyse auf Baseline-MRT. ESGAR: Konsensus-Empfehlung.",
                investigationType: "Primärstaging",
                focus: "Validierung der ESGAR 2016 Konsensus Kriterien (Rutegård et al.) bzw. Konsensus-Empfehlung (ESGAR).",
                keyCriteriaSummary: "Größe ≥9mm ODER (5-8mm UND ≥2 von [rund, irregulär, heterogen]) ODER (<5mm UND 3 von [rund, irregulär, heterogen])."
            })
        }),
        Object.freeze({
            id: 'koh_2008_morphology',
            name: 'Koh et al. (2008)',
            displayShortName: 'Koh et al.',
            context: 'Primär & Restaging (Originalstudie mit Fokus auf Post-nCRT)',
            applicableKollektiv: 'Gesamt',
            criteria: Object.freeze({
                size: Object.freeze({ active: false, threshold: null, condition: null }),
                form: Object.freeze({ active: false, value: null }),
                kontur: Object.freeze({ active: true, value: 'irregulär' }),
                homogenitaet: Object.freeze({ active: true, value: 'heterogen' }),
                signal: Object.freeze({ active: false, value: null })
            }),
            logic: 'ODER',
            description: 'Koh et al. (2008): Morphologische Kriterien - Irreguläre Kontur ODER heterogenes Binnensignal. Für diese Anwendung auf das Gesamtkollektiv evaluiert.',
            studyInfo: Object.freeze({
                reference: "Koh DM, Chau I, Tait D, et al. Int J Radiat Oncol Biol Phys. 2008;71(2):456-461.",
                patientCohort: "Originalstudie: N=25 (alle neoadjuvant behandelt, 'poor-risk'). Anwendung in diesem Tool: Gesamtkollektiv.",
                investigationType: "Vor und nach neoadjuvanter Therapie (Originale Genauigkeitsanalyse post-nCRT).",
                focus: "Ursprünglich: Bewertung von Lymphknoten vor und nach nCRT mittels Morphologie. In diesem Tool: Vergleichbarkeit mit Avocado Sign im Gesamtkollektiv.",
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
                size: Object.freeze({ active: true, threshold: 2.2, condition: '>=' }), // Korrigiert auf 2.2mm gemäß Paper
                form: Object.freeze({ active: false, value: null }),
                kontur: Object.freeze({ active: false, value: null }),
                homogenitaet: Object.freeze({ active: false, value: null }),
                signal: Object.freeze({ active: false, value: null })
            }),
            logic: 'ODER', // Da nur ein Kriterium aktiv ist, ist die Logik technisch irrelevant, ODER ist ein sicherer Default.
            description: 'Barbaro et al. (2024): Optimaler Cut-off für Kurzachse im Restaging nach nCRT: ≥ 2.2mm.',
             studyInfo: Object.freeze({
                reference: "Barbaro B, Carafa MRP, Minordi LM, et al. Radiother Oncol. 2024;193:110124.",
                patientCohort: "N=191 (alle neoadjuvant behandelt, LARC).",
                investigationType: "Restaging nach nCRT.",
                focus: "MRT-Bewertung des N-Status nach nCRT mittels Lymphknotengröße (optimaler Cut-off).",
                keyCriteriaSummary: "Kurzachsendurchmesser ≥ 2.2 mm." // Korrigiert
            })
        })
    ]);

    function formatCriteriaForDisplay(criteria, logic = null, shortFormat = false) {
        if (!criteria || typeof criteria !== 'object') return 'N/A';

        const parts = [];
        const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);

        if (activeKeys.length === 0) return UI_TEXTS.criteriaComparison.noActiveCriteria || 'Keine aktiven Kriterien';

        const formatValue = (key, criterion, isShort) => {
            if (!criterion) return '?';
            const placeholder = isShort ? '?' : '--';
            if (key === 'size') {
                const formattedThreshold = formatNumber(criterion.threshold, 1, placeholder);
                const condition = criterion.condition || '>=';
                const prefix = isShort ? 'Gr.' : 'Größe';
                return `${prefix} ${condition} ${formattedThreshold}mm`;
            }
            let value = criterion.value || placeholder;
            if (isShort) {
                switch (value) {
                    case 'irregulär': value = 'irr.'; break;
                    case 'heterogen': value = 'het.'; break;
                    case 'signalarm': value = 'sig.arm'; break;
                    case 'intermediär': value = 'sig.int.'; break;
                    case 'signalreich': value = 'sig.reich'; break;
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
             if (indexA === -1 && indexB === -1) return a.localeCompare(b); // Fallback für unbekannte Keys
             if (indexA === -1) return 1; // Unbekannte Keys ans Ende
             if (indexB === -1) return -1; // Unbekannte Keys ans Ende
             return indexA - indexB;
         });


        sortedActiveKeys.forEach(key => {
             parts.push(formatValue(key, criteria[key], shortFormat));
        });

        const effectiveLogic = logic || criteria.logic || APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;

        if (effectiveLogic === 'KOMBINIERT') {
             const studySet = studyT2CriteriaSets.find(s => s.logic === 'KOMBINIERT' && s.criteria.size.threshold === criteria.size.threshold); // Simple check for ESGAR
             if (studySet?.description) {
                 return shortFormat ? (studySet.displayShortName || studySet.name) : studySet.description;
             }
             return criteria.note || (UI_TEXTS.t2LogicDisplayNames?.['KOMBINIERT'] || 'Kombinierte Logik');
        }
        const separator = (effectiveLogic === 'UND') ? ` ${UI_TEXTS.t2LogicDisplayNames?.['UND'] || 'UND'} ` : ` ${UI_TEXTS.t2LogicDisplayNames?.['ODER'] || 'ODER'} `;

        if (shortFormat && parts.length > 2 && parts.join(separator).length > 35) { // Limit length for very short display
             return parts.slice(0, 1).join(separator) + ' u.a.';
        }
        if (shortFormat && parts.length > 3) {
            return parts.slice(0,2).join(separator) + '...';
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
             size_val: null, form_val: null, kontur_val: null, homogenitaet_val: null,
             size_met: null, form_met: null, kontur_met: null, homogenitaet_met: null,
             esgarCategory: 'N/A', esgarMorphologyCount: 0, isPositive: false
        };
        if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') return checkResult;

        const nodeSize = (typeof lymphNode.groesse === 'number' && !isNaN(lymphNode.groesse)) ? lymphNode.groesse : -1;
        checkResult.size_val = nodeSize >=0 ? nodeSize : null;
        checkResult.form_val = lymphNode.form;
        checkResult.kontur_val = lymphNode.kontur;
        checkResult.homogenitaet_val = lymphNode.homogenitaet;

        const hasRoundShape = criteria.form?.active && lymphNode.form === criteria.form.value;
        const hasIrregularBorder = criteria.kontur?.active && lymphNode.kontur === criteria.kontur.value;
        const hasHeterogeneousSignal = criteria.homogenitaet?.active && lymphNode.homogenitaet === criteria.homogenitaet.value;

        if(hasRoundShape) checkResult.form_met = true;
        if(hasIrregularBorder) checkResult.kontur_met = true;
        if(hasHeterogeneousSignal) checkResult.homogenitaet_met = true;

        let morphologyCount = 0;
        if (hasRoundShape) morphologyCount++;
        if (hasIrregularBorder) morphologyCount++;
        if (hasHeterogeneousSignal) morphologyCount++;
        checkResult.esgarMorphologyCount = morphologyCount;

        if (nodeSize >= 9.0) {
            checkResult.isPositive = true;
            checkResult.size_met = true;
            checkResult.esgarCategory = '≥9mm';
        } else if (nodeSize >= 5.0 && nodeSize < 9.0) {
            checkResult.esgarCategory = '5-8mm';
            checkResult.size_met = true; // Meets the 5-8mm condition part
            if (morphologyCount >= 2) {
                checkResult.isPositive = true;
            }
        } else if (nodeSize >= 0 && nodeSize < 5.0) {
             checkResult.esgarCategory = '<5mm';
             checkResult.size_met = true; // Meets the <5mm condition part
             if (morphologyCount >= 3) { // ESGAR: 3 Merkmale
                 checkResult.isPositive = true;
             }
        } else {
            checkResult.esgarCategory = 'N/A (Größe ungültig)';
            checkResult.size_met = false;
        }
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
        if (!patient || typeof patient !== 'object' || !studyCriteriaSet || typeof studyCriteriaSet !== 'object') {
            return defaultReturn;
        }

        const lymphNodes = patient.lymphknoten_t2;
        if (!Array.isArray(lymphNodes)) {
            const activeCriteriaKeysForEmpty = Object.keys(studyCriteriaSet.criteria || {}).filter(key => key !== 'logic' && studyCriteriaSet.criteria[key]?.active === true);
             return { t2Status: activeCriteriaKeysForEmpty.length > 0 ? '-' : null, positiveLKCount: 0, bewerteteLK: [] };
        }

        let patientIsPositive = false;
        let positiveLKCount = 0;
        const bewerteteLK = [];
        const criteria = studyCriteriaSet.criteria;
        const logic = studyCriteriaSet.logic;
        const activeCriteriaKeys = Object.keys(criteria || {}).filter(key => key !== 'logic' && criteria[key]?.active === true);


        if (lymphNodes.length === 0 && activeCriteriaKeys.length > 0) {
            return { t2Status: '-', positiveLKCount: 0, bewerteteLK: [] };
        }
        if (lymphNodes.length === 0 && activeCriteriaKeys.length === 0 && logic !== 'KOMBINIERT') {
            return { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        }
         if (lymphNodes.length === 0 && logic === 'KOMBINIERT') { // ESGAR has implicit criteria even if a specific one isn't "active" in the simple sense
            return { t2Status: '-', positiveLKCount: 0, bewerteteLK: [] };
        }


        lymphNodes.forEach(lk => {
            if (!lk || typeof lk !== 'object') {
                 bewerteteLK.push(null); // or a default structure for an invalid LK
                 return;
            }

            let lkIsPositive = false;
            let checkResultFull = null;

            if (logic === 'KOMBINIERT' && studyCriteriaSet.id === 'rutegard_et_al_esgar') {
                checkResultFull = _checkSingleNodeESGAR(lk, criteria);
                lkIsPositive = checkResultFull.isPositive;
            } else {
                checkResultFull = _checkSingleNodeSimple(lk, criteria);
                if (activeCriteriaKeys.length > 0) {
                   if (logic === 'UND') {
                       lkIsPositive = activeCriteriaKeys.every(key => checkResultFull[key] === true);
                   } else { // ODER or if only one criterion active
                       lkIsPositive = activeCriteriaKeys.some(key => checkResultFull[key] === true);
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
                checkResult: checkResultFull // Store the full check result object
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
         if (!studyCriteriaSet || typeof studyCriteriaSet !== 'object') {
            console.error("applyStudyT2CriteriaToDataset: Ungültiges oder fehlendes Kriterienset.");
            return (dataset || []).map(p => {
                const pCopy = cloneDeep(p); // Ensure utils.js or global cloneDeep is available
                pCopy.t2 = null;
                pCopy.anzahl_t2_plus_lk = 0;
                pCopy.lymphknoten_t2_bewertet = (pCopy.lymphknoten_t2 || []).map(lk => ({...lk, isPositive: false, checkResult: {}}));
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

    function formatStudyCriteriaForDisplay(studyCriteriaSet) {
        if (!studyCriteriaSet) return 'N/A';
        const criteria = studyCriteriaSet.criteria;
        const logic = studyCriteriaSet.logic;
        const name = studyCriteriaSet.name || studyCriteriaSet.id || 'Unbekanntes Set';

        if (logic === 'KOMBINIERT' && studyCriteriaSet.studyInfo?.keyCriteriaSummary) {
             return studyCriteriaSet.studyInfo.keyCriteriaSummary;
        }
        if (!criteria) return `${name} (Keine Kriterien definiert)`;

        const formattedCriteria = formatCriteriaForDisplay(criteria, logic);
        return `${formattedCriteria}`;
    }

    return Object.freeze({
        getAllStudyCriteriaSets,
        getStudyCriteriaSetById,
        applyStudyT2CriteriaToPatient,
        applyStudyT2CriteriaToDataset,
        formatStudyCriteriaForDisplay, // Exposing the general formatter as well
        _checkSingleNodeESGAR, // Exporting for potential direct use or testing, though internal
        _checkSingleNodeSimple // Exporting for potential direct use or testing
    });

})();
