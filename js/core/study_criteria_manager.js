const studyT2CriteriaManager = (() => {
    let _studyCriteriaSets = [];
    let _isInitialized = false;

    function initialize() {
        if (_isInitialized) return;

        _studyCriteriaSets = Object.freeze([
            Object.freeze({
                id: 'rutegard_et_al_esgar',
                name: 'Rutegård et al. (2025) / ESGAR 2016 (Primärstaging)',
                shortName: 'ESGAR 2016 (Primär)',
                reference: APP_CONFIG.REFERENCES_FOR_PUBLICATION?.rutegard2025?.short || 'Rutegård et al. (2025)',
                applicableKollektiv: 'direkt OP',
                studyInfo: Object.freeze({
                    investigationType: 'Primärstaging',
                    focus: 'Allgemeine T2-Morphologie gemäß ESGAR-Konsensus 2016.',
                    keyCriteriaSummary: 'Lymphknoten ≥9mm; oder 5-8.9mm UND ≥2 verdächtige Merkmale; oder <5mm UND 3 verdächtige Merkmale. Muzinöse LK immer suspekt.',
                    referenceFile: APP_CONFIG.REFERENCES_FOR_PUBLICATION?.rutegard2025?.file,
                    primaryReferenceKey: 'beetsTan2018ESGAR'
                }),
                criteria: Object.freeze({
                    logic: 'KOMBINIERT',
                    size_9mm: Object.freeze({ active: true, threshold: 9.0, condition: '>=' }),
                    size_5_8mm: Object.freeze({ active: true, threshold_lower: 5.0, threshold_upper: 8.9, condition_lower: '>=', condition_upper: '<=' }),
                    size_less_5mm: Object.freeze({ active: true, threshold: 5.0, condition: '<' }),
                    suspicious_features_count_for_5_8mm: 2,
                    suspicious_features_count_for_less_5mm: 3,
                    form: Object.freeze({ active: true, value: 'rund', isSuspicious: true }),
                    kontur: Object.freeze({ active: true, value: 'irregulär', isSuspicious: true }),
                    homogenitaet: Object.freeze({ active: true, value: 'heterogen', isSuspicious: true }),
                    signal: Object.freeze({ active: false, value: null, isSuspicious: false })
                })
            }),
            Object.freeze({
                id: 'koh_2008_morphology',
                name: 'Koh et al. (2008) (Morphologie Post-nRCT)',
                shortName: 'Koh et al. (2008)',
                reference: APP_CONFIG.REFERENCES_FOR_PUBLICATION?.koh2008?.short || 'Koh et al. (2008)',
                applicableKollektiv: 'nRCT',
                studyInfo: Object.freeze({
                    investigationType: 'Restaging (Post-nRCT) & Primärstaging',
                    focus: 'Irreguläre Konturen oder heterogene Signalintensität.',
                    keyCriteriaSummary: 'Irreguläre Kontur ODER heterogenes Signal.',
                    referenceFile: APP_CONFIG.REFERENCES_FOR_PUBLICATION?.koh2008?.file
                }),
                criteria: Object.freeze({
                    logic: 'ODER',
                    size: Object.freeze({ active: false, threshold: 5.0, condition: '>=' }),
                    form: Object.freeze({ active: false, value: 'rund', isSuspicious: false }),
                    kontur: Object.freeze({ active: true, value: 'irregulär', isSuspicious: true }),
                    homogenitaet: Object.freeze({ active: true, value: 'heterogen', isSuspicious: true }),
                    signal: Object.freeze({ active: false, value: 'signalreich', isSuspicious: false })
                })
            }),
            Object.freeze({
                id: 'barbaro_2024_restaging',
                name: 'Barbaro et al. (2024) (Restaging Post-nRCT)',
                shortName: 'Barbaro et al. (2024)',
                reference: APP_CONFIG.REFERENCES_FOR_PUBLICATION?.barbaro2024?.short || 'Barbaro et al. (2024)',
                applicableKollektiv: 'nRCT',
                studyInfo: Object.freeze({
                    investigationType: 'Restaging (Post-nRCT)',
                    focus: 'Vorhersage ypN0, Cut-off für Kurzachse.',
                    keyCriteriaSummary: 'Kurzachse ≥ 2.3mm (basierend auf AUC für ypN0).',
                    referenceFile: APP_CONFIG.REFERENCES_FOR_PUBLICATION?.barbaro2024?.file
                }),
                criteria: Object.freeze({
                    logic: 'ODER', // In der Barbaro-Publikation ist es ein einzelnes Größenkriterium. "ODER" mit nur einem aktiven Kriterium ist funktional gleichwertig zu "UND".
                    size: Object.freeze({ active: true, threshold: 2.3, condition: '>=' }),
                    form: Object.freeze({ active: false, value: null, isSuspicious: false }),
                    kontur: Object.freeze({ active: false, value: null, isSuspicious: false }),
                    homogenitaet: Object.freeze({ active: false, value: null, isSuspicious: false }),
                    signal: Object.freeze({ active: false, value: null, isSuspicious: false })
                })
            }),
             Object.freeze({
                id: 'esgar_2016_restaging',
                name: 'ESGAR 2016 (Restaging Post-nRCT)',
                shortName: 'ESGAR 2016 (Restaging)',
                reference: APP_CONFIG.REFERENCES_FOR_PUBLICATION?.beetsTan2018ESGAR?.short || 'Beets-Tan et al. (2018)',
                applicableKollektiv: 'nRCT',
                studyInfo: Object.freeze({
                    investigationType: 'Restaging (Post-nRCT)',
                    focus: 'Vereinfachte Größenregel für Restaging.',
                    keyCriteriaSummary: 'Lymphknoten mit Kurzachse ≥5mm gelten als maligne.',
                    referenceFile: APP_CONFIG.REFERENCES_FOR_PUBLICATION?.beetsTan2018ESGAR?.file
                }),
                criteria: Object.freeze({
                    logic: 'ODER', // Nur ein Kriterium aktiv
                    size: Object.freeze({ active: true, threshold: 5.0, condition: '>=' }),
                    form: Object.freeze({ active: false, value: null, isSuspicious: false }),
                    kontur: Object.freeze({ active: false, value: null, isSuspicious: false }),
                    homogenitaet: Object.freeze({ active: false, value: null, isSuspicious: false }),
                    signal: Object.freeze({ active: false, value: null, isSuspicious: false })
                })
            })
        ]);
        _isInitialized = true;
    }

    function getAllStudyCriteriaSets(addAppliedCriteriaOption = false) {
        if (!_isInitialized) initialize();
        let sets = cloneDeep(_studyCriteriaSets);
        if (addAppliedCriteriaOption) {
            sets.unshift(Object.freeze({
                id: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID,
                name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                shortName: 'Angewandt',
                reference: 'Aktuelle Einstellungen',
                applicableKollektiv: state.getCurrentKollektiv(),
                studyInfo: Object.freeze({
                    investigationType: 'Explorer-Modus',
                    focus: 'Benutzerdefinierte Kriterienanalyse.',
                    keyCriteriaSummary: 'Siehe aktuelle Einstellungen im Auswertungstab.',
                    referenceFile: null
                }),
                criteria: t2CriteriaManager.getAppliedCriteria(),
                logic: t2CriteriaManager.getAppliedLogic(), // Hinzugefügt, um die Logik mit zu speichern
                isAppliedCriteriaSet: true
            }));
        }
        return sets;
    }

    function getStudyCriteriaSetById(id) {
        if (!_isInitialized) initialize();
        if (id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
            return getAllStudyCriteriaSets(true).find(set => set.id === id);
        }
        return cloneDeep(_studyCriteriaSets.find(set => set.id === id) || null);
    }

    function applyStudyT2CriteriaToDataset(dataset, studyCriteriaSet) {
        if (!dataset || !Array.isArray(dataset) || !studyCriteriaSet || !studyCriteriaSet.criteria) {
            console.warn("applyStudyT2CriteriaToDataset: Ungültige Eingabedaten.");
            return dataset.map(p => {
                const pCopy = cloneDeep(p);
                pCopy.t2 = null; // Setze auf null statt 'unbekannt' für Konsistenz mit t2CriteriaManager
                pCopy.anzahl_t2_plus_lk = 0;
                pCopy.lymphknoten_t2_bewertet = (pCopy.lymphknoten_t2 || []).map(lk => ({...cloneDeep(lk), isPositive: false, checkResult: {}}));
                return pCopy;
            });
        }
        const criteriaToApply = studyCriteriaSet.criteria;
        // Die Logik wird nun aus studyCriteriaSet.criteria.logic oder studyCriteriaSet.logic bezogen
        const logicToApply = studyCriteriaSet.criteria.logic || studyCriteriaSet.logic || 'ODER';


        return dataset.map(patient => {
            if (!patient) return null;
            const patientCopy = cloneDeep(patient);
            const evaluationResult = t2CriteriaManager.evaluatePatient(patientCopy, criteriaToApply, logicToApply);
            patientCopy.t2 = evaluationResult.t2Status;
            patientCopy.anzahl_t2_plus_lk = evaluationResult.positiveLKCount;
            patientCopy.lymphknoten_t2_bewertet = evaluationResult.bewerteteLK;
            // anzahl_t2_lk ist die Gesamtzahl der T2-LKs des Patienten, die für die Bewertung herangezogen wurden.
            // Dies sollte der Länge von patientCopy.lymphknoten_t2 entsprechen, wenn alle gültig sind.
            // evaluatePatient gibt bewerteteLK zurück, deren Länge der Anzahl der bewerteten LK entspricht.
            patientCopy.anzahl_t2_lk = Array.isArray(patientCopy.lymphknoten_t2) ? patientCopy.lymphknoten_t2.length : 0;
            return patientCopy;
        }).filter(p => p !== null);
    }

    function formatCriteriaForDisplay(criteria, logic, useHtml = true) {
        if (!criteria) return useHtml ? '<i>Kriterien nicht definiert</i>' : 'Kriterien nicht definiert';

        const effectiveLogic = logic || criteria.logic || 'ODER'; // Fallback, falls Logik nicht explizit übergeben
        const activeCriteria = [];
        const br = useHtml ? '<br>' : '\n';
        const boldStart = useHtml ? '<strong>' : '**';
        const boldEnd = useHtml ? '</strong>' : '**';

        if (criteria.size && criteria.size.active && criteria.size.threshold !== null && criteria.size.threshold !== undefined) {
            const cond = criteria.size.condition || '>=';
            activeCriteria.push(`${boldStart}Größe${boldEnd} ${cond} ${formatNumber(criteria.size.threshold, 1, 'N/A', !useHtml)}mm`);
        }
        if (criteria.form && criteria.form.active && criteria.form.value) {
            activeCriteria.push(`${boldStart}Form${boldEnd}: ${criteria.form.value}`);
        }
        if (criteria.kontur && criteria.kontur.active && criteria.kontur.value) {
            activeCriteria.push(`${boldStart}Kontur${boldEnd}: ${criteria.kontur.value}`);
        }
        if (criteria.homogenitaet && criteria.homogenitaet.active && criteria.homogenitaet.value) {
            activeCriteria.push(`${boldStart}Homogenität${boldEnd}: ${criteria.homogenitaet.value}`);
        }
        if (criteria.signal && criteria.signal.active && criteria.signal.value) {
            activeCriteria.push(`${boldStart}Signal${boldEnd}: ${criteria.signal.value}`);
        }

        if (effectiveLogic === 'KOMBINIERT') {
             let esgarDesc = `ESGAR-Logik: ${br}`;
             esgarDesc += `1. ${boldStart}Größe ≥${formatNumber(criteria.size_9mm?.threshold, 1, '9.0', !useHtml)}mm${boldEnd}${br}`;
             esgarDesc += `${useHtml ? ` ${boldStart}ODER${boldEnd} ` : ` ODER `}2. (${boldStart}Größe ${formatNumber(criteria.size_5_8mm?.threshold_lower,1,'5.0',!useHtml)}-${formatNumber(criteria.size_5_8mm?.threshold_upper,1,'8.9',!useHtml)}mm${boldEnd} ${useHtml ? ` ${boldStart}UND${boldEnd} ` : ` UND `} ≥${criteria.suspicious_features_count_for_5_8mm || 2} von (Form: ${criteria.form?.value || 'N/A'}, Kontur: ${criteria.kontur?.value || 'N/A'}, Homogenität: ${criteria.homogenitaet?.value || 'N/A'}))${br}`;
             esgarDesc += `${useHtml ? ` ${boldStart}ODER${boldEnd} ` : ` ODER `}3. (${boldStart}Größe <${formatNumber(criteria.size_less_5mm?.threshold,1,'5.0',!useHtml)}mm${boldEnd} ${useHtml ? ` ${boldStart}UND${boldEnd} ` : ` UND `} ≥${criteria.suspicious_features_count_for_less_5mm || 3} von (Form: ${criteria.form?.value || 'N/A'}, Kontur: ${criteria.kontur?.value || 'N/A'}, Homogenität: ${criteria.homogenitaet?.value || 'N/A'}))`;
             return esgarDesc;
        }

        if (activeCriteria.length === 0) {
            return useHtml ? '<i>Keine Kriterien aktiv</i>' : 'Keine Kriterien aktiv';
        }

        const logicSeparator = effectiveLogic === 'ODER' ? (useHtml ? ` ${boldStart}ODER${boldEnd} ` : ` ODER `) : (useHtml ? ` ${boldStart}UND${boldEnd} ` : ` UND `);
        return `${boldStart}Logik: ${effectiveLogic.toUpperCase()}${boldEnd}${br}${activeCriteria.join(logicSeparator)}`;
    }


    return Object.freeze({
        initialize,
        getAllStudyCriteriaSets,
        getStudyCriteriaSetById,
        applyStudyT2CriteriaToDataset,
        formatCriteriaForDisplay
    });
})();
