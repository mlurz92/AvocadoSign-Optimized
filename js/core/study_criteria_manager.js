const studyT2CriteriaManager = (() => {

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
            description: 'ESGAR 2016 Kriterien für Primär-Staging: Größe ≥ 9mm ODER (Größe 5-8mm UND ≥2 der morphologischen Merkmale [rund, irregulär, heterogen]) ODER (Größe < 5mm UND ALLE 3 morphologischen Merkmale [rund, irregulär, heterogen]).',
            studyInfo: Object.freeze({
                reference: "Rutegård MK, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. Eur Radiol. 2025. DOI: 10.1007/s00330-025-11361-2. (Validierung der ESGAR-Kriterien); Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol. 2018;28(4):1465-1475. (ESGAR Konsensus).",
                patientCohort: "Rutegård et al. (2025): N=46 (27 direkt OP, 19 nCRT); Analyse der Baseline-MRT Daten. ESGAR: Konsensus-Panel.",
                investigationType: "Primärstaging von Rektumkarzinomen.",
                focus: "Validierung der ESGAR 2016 Konsensus-Kriterien zur Lymphknotenbeurteilung (Rutegård et al.); Erstellung von Konsensus-Empfehlungen (ESGAR).",
                keyCriteriaSummary: "Kombination aus Größe und morphologischen Kriterien (Form: rund, Kontur: irregulär, Signal: heterogen). Spezifische Regeln: LK ≥9mm = positiv. LK 5-8mm = positiv wenn ≥2 morph. Kriterien erfüllt. LK <5mm = positiv wenn alle 3 morph. Kriterien erfüllt."
            }),
            citationKey: 'Rutegard2025ESGAR'
        }),
        Object.freeze({
            id: 'koh_2008_morphology',
            name: 'Koh et al. (2008)',
            displayShortName: 'Koh et al.',
            context: 'Primär- & Restaging (Fokus der Originalstudie: Post-nCRT)',
            applicableKollektiv: 'Gesamt',
            criteria: Object.freeze({
                size: Object.freeze({ active: false, threshold: null, condition: null }),
                form: Object.freeze({ active: false, value: null }),
                kontur: Object.freeze({ active: true, value: 'irregulär' }),
                homogenitaet: Object.freeze({ active: true, value: 'heterogen' }),
                signal: Object.freeze({ active: false, value: null })
            }),
            logic: 'ODER',
            description: 'Koh et al. (2008): Morphologische Kriterien - Irreguläre Kontur ODER heterogenes Binnensignal. In dieser Anwendung auf das Gesamtkollektiv evaluiert.',
            studyInfo: Object.freeze({
                reference: "Koh DM, Chau I, Tait D, Wotherspoon A, Cunningham D, Brown G. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys. 2008;71(2):456-461.",
                patientCohort: "Originalstudie: N=25 (alle nCRT, 'poor-risk'). In dieser Anwendung evaluiert auf dem Gesamtkollektiv (N=106), sowie den Subgruppen Direkt OP (N=29) und nRCT (N=77).",
                investigationType: "Beurteilung von mesorektalen Lymphknoten vor und nach neoadjuvanter Chemoradiotherapie.",
                focus: "Evaluierung der Veränderungen von Anzahl, Größe, Verteilung und Morphologie von Lymphknoten unter Therapie.",
                keyCriteriaSummary: "Ein Lymphknoten wurde als maligne betrachtet, wenn er eine irreguläre Kontur ODER ein heterogenes Signal aufwies."
            }),
            citationKey: 'Koh2008'
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
            description: 'Barbaro et al. (2024): Optimaler Cut-off für Kurzachse im Restaging nach nCRT: ≥ 2.3mm (Originalstudie: 2.2mm).',
            studyInfo: Object.freeze({
                reference: "Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience. Radiother Oncol. 2024;193:110124.",
                patientCohort: "N=191 (alle LARC Patienten nach nCRT).",
                investigationType: "Restaging von LARC nach nCRT.",
                focus: "Evaluierung der MRT-Genauigkeit zur Identifizierung eines negativen N-Status (ypN0) nach nCRT, insbesondere Untersuchung von Grössenkriterien (Kurzachse).",
                keyCriteriaSummary: "Ein Kurzachsendurchmesser von ≤2.2 mm wurde als optimaler Cut-off zur Vorhersage des ypN0-Status identifiziert. Für diese Anwendung wird ≥2.3 mm als positives Kriterium verwendet."
            }),
            citationKey: 'Barbaro2024'
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
                const sCriteriaKeys = Object.keys(s.criteria).filter(k => k !== 'logic');
                if (sCriteriaKeys.length !== activeKeys.length) return false;
                return sCriteriaKeys.every(k => activeKeys.includes(k) &&
                    s.criteria[k].active === criteria[k].active &&
                    (k === 'size' ? (s.criteria[k].threshold === criteria[k].threshold && s.criteria[k].condition === criteria[k].condition)
                                  : s.criteria[k].value === criteria[k].value)
                );
            });
             if (studySet?.description) {
                 return shortFormat ? (studySet.studyInfo?.keyCriteriaSummary || studySet.displayShortName || studySet.name) : studySet.description;
             }
             return criteria.note || 'Kombinierte Logik (Details siehe Originalpublikation)';
        }
        const separator = (effectiveLogic === 'UND') ? (shortFormat ? '&' : ' UND ') : (shortFormat ? '|' : ' ODER ');

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

    function _checkSingleNodeESGAR(lymphNode, criteriaConfig) {
        const checkResult = {
             size_val: null, form_val: null, kontur_val: null, homogenitaet_val: null, signal_val: null,
             size_met: false, form_met: false, kontur_met: false, homogenitaet_met: false,
             esgarCategory: 'N/A', esgarMorphologyCount: 0, isPositive: false
        };
        if (!lymphNode || typeof lymphNode !== 'object' || !criteriaConfig || typeof criteriaConfig !== 'object') return checkResult;

        const nodeSize = (typeof lymphNode.groesse === 'number' && !isNaN(lymphNode.groesse) && isFinite(lymphNode.groesse)) ? lymphNode.groesse : -1;
        checkResult.size_val = nodeSize >= 0 ? nodeSize : null;
        checkResult.form_val = lymphNode.form;
        checkResult.kontur_val = lymphNode.kontur;
        checkResult.homogenitaet_val = lymphNode.homogenitaet;
        checkResult.signal_val = lymphNode.signal;

        let morphologyCount = 0;
        if (criteriaConfig.form?.active && lymphNode.form === criteriaConfig.form.value) {
            checkResult.form_met = true;
            morphologyCount++;
        }
        if (criteriaConfig.kontur?.active && lymphNode.kontur === criteriaConfig.kontur.value) {
            checkResult.kontur_met = true;
            morphologyCount++;
        }
        if (criteriaConfig.homogenitaet?.active && lymphNode.homogenitaet === criteriaConfig.homogenitaet.value) {
            checkResult.homogenitaet_met = true;
            morphologyCount++;
        }
        checkResult.esgarMorphologyCount = morphologyCount;

        if (nodeSize >= 9.0) {
            checkResult.isPositive = true;
            checkResult.esgarCategory = '≥9mm';
            checkResult.size_met = true;
        } else if (nodeSize >= 5.0 && nodeSize < 9.0) {
            checkResult.esgarCategory = '5-8mm';
            if (morphologyCount >= 2) {
                checkResult.isPositive = true;
            }
        } else if (nodeSize >= 0 && nodeSize < 5.0) {
             checkResult.esgarCategory = '<5mm';
             if (morphologyCount >= 3) {
                 checkResult.isPositive = true;
             }
        } else {
            checkResult.esgarCategory = 'N/A (Größe ungültig)';
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
            if (typeof nodeSize === 'number' && !isNaN(nodeSize) && isFinite(nodeSize) && typeof threshold === 'number' && !isNaN(threshold) && isFinite(threshold)) {
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
        const criteria = studyCriteriaSet.criteria;
        const logic = studyCriteriaSet.logic;

        if (!Array.isArray(lymphNodes)) {
            const activeCriteriaKeysForEmpty = Object.keys(criteria || {}).filter(key => key !== 'logic' && criteria[key]?.active === true);
             return { t2Status: activeCriteriaKeysForEmpty.length > 0 ? '-' : null, positiveLKCount: 0, bewerteteLK: [] };
        }

        let patientIsPositive = false;
        let positiveLKCount = 0;
        const bewerteteLK = [];
        const activeCriteriaKeys = Object.keys(criteria || {}).filter(key => key !== 'logic' && criteria[key]?.active === true);

        if (lymphNodes.length === 0) {
            if (logic === 'KOMBINIERT' || activeCriteriaKeys.length > 0) {
                 return { t2Status: '-', positiveLKCount: 0, bewerteteLK: [] };
            }
            return { t2Status: null, positiveLKCount: 0, bewerteteLK: [] };
        }

        lymphNodes.forEach(lk => {
            if (!lk || typeof lk !== 'object') {
                 bewerteteLK.push(null);
                 return;
            }

            let lkIsPositive = false;
            let checkResultFull = null;

            if (logic === 'KOMBINIERT' && studyCriteriaSet.id === 'rutegard_et_al_esgar') {
                checkResultFull = _checkSingleNodeESGAR(lk, criteria);
                lkIsPositive = checkResultFull.isPositive;
            } else {
                const simpleCheckResult = _checkSingleNodeSimple(lk, criteria);
                checkResultFull = { ...simpleCheckResult, size_val: lk.groesse, form_val: lk.form, kontur_val: lk.kontur, homogenitaet_val: lk.homogenitaet, signal_val: lk.signal };
                if (activeCriteriaKeys.length > 0) {
                   if (logic === 'UND') {
                       lkIsPositive = activeCriteriaKeys.every(key => simpleCheckResult[key] === true);
                   } else {
                       lkIsPositive = activeCriteriaKeys.some(key => simpleCheckResult[key] === true);
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
                checkResult: checkResultFull
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
         if (!studyCriteriaSet || typeof studyCriteriaSet !== 'object' || !studyCriteriaSet.criteria || !studyCriteriaSet.logic) {
            console.error("applyStudyT2CriteriaToDataset: Ungültiges oder fehlendes Kriterienset oder dessen interne Struktur.");
            return (dataset || []).map(p => {
                const pCopy = cloneDeep(p || {});
                pCopy.t2 = null;
                pCopy.anzahl_t2_plus_lk = 0;
                pCopy.lymphknoten_t2_bewertet = (pCopy.lymphknoten_t2 || []).map(lk => ({...(lk || {}), isPositive: false, checkResult: {}}));
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

        if (logic === 'KOMBINIERT' && studyCriteriaSet.studyInfo?.keyCriteriaSummary) {
             return studyCriteriaSet.studyInfo.keyCriteriaSummary;
        }
        if (logic === 'KOMBINIERT' && studyCriteriaSet.description) {
             return studyCriteriaSet.description;
        }
        if (!criteria) return `${studyCriteriaSet.name || studyCriteriaSet.id} (Keine Kriterien definiert)`;

        const formattedCriteria = formatCriteriaForDisplay(criteria, logic);
        return `${formattedCriteria}`;
    }

    return Object.freeze({
        getAllStudyCriteriaSets,
        getStudyCriteriaSetById,
        applyStudyT2CriteriaToPatient,
        applyStudyT2CriteriaToDataset,
        formatStudyCriteriaForDisplay,
        formatCriteriaForDisplay
    });

})();
