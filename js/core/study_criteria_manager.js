const studyT2CriteriaManager = (() => {

    const studyT2CriteriaSets = Object.freeze([
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            name: 'Rutegård et al. (2025) / ESGAR 2016',
            displayShortName: 'ESGAR 2016 (Rutegård)',
            context: 'Primär-Staging (Baseline-MRT)',
            applicableKollektiv: 'direkt OP',
            criteria: Object.freeze({
                size: Object.freeze({ active: true, threshold: 9.0, condition: '>=', note: 'oder 5-8mm mit >=2 Merkmalen oder <5mm mit 3 Merkmalen' }),
                form: Object.freeze({ active: true, value: 'rund', note: 'als eines der morph. Merkmale' }),
                kontur: Object.freeze({ active: true, value: 'irregulär', note: 'als eines der morph. Merkmale' }),
                homogenitaet: Object.freeze({ active: true, value: 'heterogen', note: 'als eines der morph. Merkmale' }),
                signal: Object.freeze({ active: false, value: null })
            }),
            logic: 'KOMBINIERT',
            description: 'ESGAR 2016 Kriterien für Primär-Staging: Größe ≥ 9mm; ODER (Größe 5-8mm UND ≥2 der morphologischen Merkmale [rund, irregulär, heterogen]); ODER (Größe < 5mm UND ALLE 3 der morphologischen Merkmale [rund, irregulär, heterogen]).',
            studyInfo: Object.freeze({
                reference: "Rutegård MK, et al. Eur Radiol. 2025; Beets-Tan RGH, et al. Eur Radiol. 2018",
                patientCohort: "Original Rutegård: N=46 (27 Primär-OP, 19 nRCT), Analyse auf Baseline-MRT. ESGAR: Expertenkonsensus.",
                investigationType: "Primärstaging",
                focus: "Validierung der ESGAR 2016 Konsensus-Kriterien für die N-Stadieneinteilung mittels präzisem anatomischen Matching von Lymphknoten zwischen MRT und Histopathologie.",
                keyCriteriaSummary: "≥9mm; ODER (5-8mm & ≥2 von [rund, irregulär, heterogen]); ODER (<5mm & 3 von [rund, irregulär, heterogen])."
            })
        }),
        Object.freeze({
            id: 'koh_2008_morphology',
            name: 'Koh et al. (2008)',
            displayShortName: 'Koh et al. (2008)',
            context: 'Primär & Restaging (Originalanalyse Post-nCRT)',
            applicableKollektiv: 'Gesamt',
            criteria: Object.freeze({
                size: Object.freeze({ active: false, threshold: null, condition: null }),
                form: Object.freeze({ active: false, value: null }),
                kontur: Object.freeze({ active: true, value: 'irregulär' }),
                homogenitaet: Object.freeze({ active: true, value: 'heterogen' }),
                signal: Object.freeze({ active: false, value: null })
            }),
            logic: 'ODER',
            description: 'Koh et al. (2008) Kriterien: Ein Lymphknoten gilt als maligne, wenn er eine irreguläre Kontur ODER ein heterogenes Binnensignal aufweist.',
            studyInfo: Object.freeze({
                reference: "Koh DM, et al. Int J Radiat Oncol Biol Phys. 2008;71(2):456-461.",
                patientCohort: "Originalstudie: N=25 Patienten mit 'poor-risk' Rektumkarzinom, alle erhielten nCRT.",
                investigationType: "Evaluation von LK vor und nach nCRT; diagnostische Genauigkeit basierend auf Post-nCRT MRTs.",
                focus: "Beurteilung der Lymphknotenmorphologie (irreguläre Kontur, heterogenes Signal) zur Differenzierung maligner vs. benigner Lymphknoten nach nCRT.",
                keyCriteriaSummary: "Irreguläre Kontur ODER heterogenes Signal."
            })
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            name: 'Barbaro et al. (2024)',
            displayShortName: 'Barbaro et al. (2024)',
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
            description: 'Barbaro et al. (2024) Kriterien für Restaging nach nCRT: Lymphknoten-Kurzachse ≥ 2.3mm gilt als suspekt. (Original: ≤2.2mm für ypN0).',
             studyInfo: Object.freeze({
                reference: "Barbaro B, et al. Radiother Oncol. 2024;193:110124.",
                patientCohort: "Originalstudie: N=191 Patienten mit lokal fortgeschrittenem Rektumkarzinom (LARC), alle erhielten nCRT.",
                investigationType: "Restaging nach nCRT (6-8 Wochen nach nCRT).",
                focus: "MRT-basierte Identifizierung von ypN0-Status nach nCRT mittels Kurzachsendurchmesser und Größenänderung der Lymphknoten.",
                keyCriteriaSummary: "Kurzachsendurchmesser ≥ 2.3 mm."
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
            if (key === 'size') {
                const formattedThreshold = formatNumber(criterion.threshold, 1, '?');
                const prefix = isShort ? 'Gr.' : 'Größe';
                return `${prefix} ${criterion.condition || '>='}${formattedThreshold}mm`;
            }
            let value = criterion.value || '?';
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
        const sortedActiveKeys = [...activeKeys].sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b));

        sortedActiveKeys.forEach(key => {
             parts.push(formatValue(key, criteria[key], shortFormat));
        });

        const effectiveLogic = logic || criteria.logic || 'ODER';

        if (effectiveLogic === 'KOMBINIERT') {
             const studySet = studyT2CriteriaSets.find(set => JSON.stringify(set.criteria) === JSON.stringify(criteria) && set.logic === 'KOMBINIERT');
             if (studySet && studySet.description) {
                return shortFormat ? (studySet.displayShortName || studySet.name) : studySet.description;
             }
             return 'Kombinierte ESGAR Kriterien (Details siehe Definition)';
        }
        const separator = (effectiveLogic === 'UND') ? (shortFormat ? ' & ' : ' UND ') : (shortFormat ? ' / ' : ' ODER ');

        if (shortFormat && parts.length > (shortFormat ? 1 : 2) && parts.join(separator).length > (shortFormat ? 25 : 35) ) {
             return parts.slice(0, shortFormat ? 1 : 2).join(separator) + ' ...';
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

    function _checkSingleNodeESGAR(lymphNode, criteriaDefinition) {
        const checkResult = {
             sizeMet: null, formMet: null, konturMet: null, homogenitaetMet: null,
             esgarCategory: 'N/A', morphologyCount: 0, isPositive: false
        };
        if (!lymphNode || typeof lymphNode !== 'object' || !criteriaDefinition || typeof criteriaDefinition !== 'object') return checkResult;

        const nodeSize = (typeof lymphNode.groesse === 'number' && !isNaN(lymphNode.groesse)) ? lymphNode.groesse : -1;
        let morphologyCount = 0;

        if (criteriaDefinition.form?.active && lymphNode.form === criteriaDefinition.form.value) {
            checkResult.formMet = true;
            morphologyCount++;
        } else if (criteriaDefinition.form?.active) {
            checkResult.formMet = false;
        }

        if (criteriaDefinition.kontur?.active && lymphNode.kontur === criteriaDefinition.kontur.value) {
            checkResult.konturMet = true;
            morphologyCount++;
        } else if (criteriaDefinition.kontur?.active) {
            checkResult.konturMet = false;
        }

        if (criteriaDefinition.homogenitaet?.active && lymphNode.homogenitaet === criteriaDefinition.homogenitaet.value) {
            checkResult.homogenitaetMet = true;
            morphologyCount++;
        } else if (criteriaDefinition.homogenitaet?.active) {
            checkResult.homogenitaetMet = false;
        }
        checkResult.morphologyCount = morphologyCount;

        if (nodeSize >= 0) { // Ensure size is valid before categorization
            if (criteriaDefinition.size?.active && nodeSize >= criteriaDefinition.size.threshold) { // >= 9mm case
                checkResult.isPositive = true;
                checkResult.esgarCategory = '≥9mm';
                checkResult.sizeMet = true;
            } else if (nodeSize >= 5.0 && nodeSize < 9.0) {
                checkResult.esgarCategory = '5-8mm';
                if (morphologyCount >= 2) {
                    checkResult.isPositive = true;
                }
                checkResult.sizeMet = (nodeSize >= 5.0);
            } else if (nodeSize < 5.0) {
                 checkResult.esgarCategory = '<5mm';
                 if (morphologyCount >= 3) {
                     checkResult.isPositive = true;
                 }
                 checkResult.sizeMet = (nodeSize < 5.0 && nodeSize >= 0); // Valid size range
            } else {
                checkResult.esgarCategory = 'N/A (Größe außerhalb definierter ESGAR-Bereiche, aber >=0)';
                checkResult.sizeMet = false; // Not falling into specific positive categories based on size alone
            }
        } else {
            checkResult.esgarCategory = 'N/A (Größe ungültig)';
            checkResult.sizeMet = false;
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
        if (!patient || typeof patient !== 'object' || !studyCriteriaSet || typeof studyCriteriaSet !== 'object' || !studyCriteriaSet.criteria || !studyCriteriaSet.logic) {
            return defaultReturn;
        }

        const lymphNodes = patient.lymphknoten_t2;
        if (!Array.isArray(lymphNodes)) {
            return defaultReturn;
        }

        let patientIsPositive = false;
        let positiveLKCount = 0;
        const bewerteteLK = [];
        const criteria = studyCriteriaSet.criteria;
        const logic = studyCriteriaSet.logic;

        if (lymphNodes.length === 0) {
             return { t2Status: '-', positiveLKCount: 0, bewerteteLK: [] };
        }

        lymphNodes.forEach(lk => {
            if (!lk || typeof lk !== 'object') {
                 bewerteteLK.push({
                    groesse: null, form: null, kontur: null, homogenitaet: null, signal: null,
                    isPositive: false, checkResult: null
                 });
                 return;
            }

            let lkIsPositive = false;
            let detailedCheckResult = null;

            if (logic === 'KOMBINIERT' && studyCriteriaSet.id === 'rutegard_et_al_esgar') {
                detailedCheckResult = _checkSingleNodeESGAR(lk, criteria);
                lkIsPositive = detailedCheckResult.isPositive;
            } else {
                const activeCriteriaKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);
                detailedCheckResult = _checkSingleNodeSimple(lk, criteria);

                if (activeCriteriaKeys.length > 0) {
                   if (logic === 'UND') {
                       lkIsPositive = activeCriteriaKeys.every(key => detailedCheckResult[key] === true);
                   } else {
                       lkIsPositive = activeCriteriaKeys.some(key => detailedCheckResult[key] === true);
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
                checkResult: detailedCheckResult
            };
            bewerteteLK.push(bewerteterLK);
        });

        return {
            t2Status: patientIsPositive ? '+' : '-',
            positiveLKCount: positiveLKCount,
            bewerteteLK: bewerteteLK
        };
    }

    function applyStudyT2CriteriaToDataset(dataset, studyCriteriaSet) {
         if (!studyCriteriaSet || typeof studyCriteriaSet !== 'object' || !studyCriteriaSet.criteria || !studyCriteriaSet.logic) {
            console.error("applyStudyT2CriteriaToDataset: Ungültiges oder fehlendes Kriterienset.");
            return cloneDeep(dataset || []);
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
             patientCopy.anzahl_t2_lk = Array.isArray(patientCopy.lymphknoten_t2) ? patientCopy.lymphknoten_t2.length : 0;

             return patientCopy;
         }).filter(p => p !== null);
    }

    return Object.freeze({
        getAllStudyCriteriaSets,
        getStudyCriteriaSetById,
        applyStudyT2CriteriaToPatient,
        applyStudyT2CriteriaToDataset,
        formatCriteriaForDisplay
    });

})();