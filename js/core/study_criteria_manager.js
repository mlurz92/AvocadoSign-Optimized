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
                    keyCriteriaSummary: 'Lymphknoten ≥9mm; oder 5-8mm UND ≥2 verdächtige Merkmale; oder <5mm UND 3 verdächtige Merkmale; Muzinöse LK immer suspekt.',
                    referenceFile: APP_CONFIG.REFERENCES_FOR_PUBLICATION?.rutegard2025?.file,
                    primaryReferenceKey: 'beetsTan2018ESGAR' // Für Zitation des ursprünglichen Konsensus
                }),
                criteria: Object.freeze({
                    logic: 'KOMBINIERT', // Spezielle Logik für ESGAR
                    size_9mm: Object.freeze({ active: true, threshold: 9.0, condition: '>=' }), // Gruppe 1: >= 9mm
                    size_5_8mm: Object.freeze({ active: true, threshold_lower: 5.0, threshold_upper: 8.9, condition_lower: '>=', condition_upper: '<=' }), // Gruppe 2: 5-8.9mm
                    size_less_5mm: Object.freeze({ active: true, threshold: 5.0, condition: '<' }), // Gruppe 3: < 5mm
                    suspicious_features_count_for_5_8mm: 2,
                    suspicious_features_count_for_less_5mm: 3,
                    form: Object.freeze({ active: true, value: 'rund', isSuspicious: true }),
                    kontur: Object.freeze({ active: true, value: 'irregulär', isSuspicious: true }),
                    homogenitaet: Object.freeze({ active: true, value: 'heterogen', isSuspicious: true }),
                    signal: Object.freeze({ active: false, value: null, isSuspicious: false }) // Signal wird in ESGAR Primärstaging nicht explizit als eines der 3 Hauptmerkmale gezählt, aber oft implizit bei Heterogenität
                })
            }),
            Object.freeze({
                id: 'koh_2008_morphology',
                name: 'Koh et al. (2008) (Morphologie Post-nRCT)',
                shortName: 'Koh et al. (2008)',
                reference: APP_CONFIG.REFERENCES_FOR_PUBLICATION?.koh2008?.short || 'Koh et al. (2008)',
                applicableKollektiv: 'nRCT', // Primär für Post-nRCT evaluiert, aber Kriterien sind generisch morphologisch
                studyInfo: Object.freeze({
                    investigationType: 'Restaging (Post-nRCT) & Primärstaging',
                    focus: 'Irreguläre Konturen oder heterogene Signalintensität.',
                    keyCriteriaSummary: 'Irreguläre Kontur ODER heterogenes Signal.',
                    referenceFile: APP_CONFIG.REFERENCES_FOR_PUBLICATION?.koh2008?.file
                }),
                criteria: Object.freeze({
                    logic: 'ODER',
                    size: Object.freeze({ active: false, threshold: 5.0, condition: '>=' }),
                    form: Object.freeze({ active: false, value: 'rund' }),
                    kontur: Object.freeze({ active: true, value: 'irregulär' }),
                    homogenitaet: Object.freeze({ active: true, value: 'heterogen' }),
                    signal: Object.freeze({ active: false, value: 'signalreich' })
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
                    logic: 'UND', // Nur ein Kriterium aktiv
                    size: Object.freeze({ active: true, threshold: 2.3, condition: '>=' }),
                    form: Object.freeze({ active: false, value: null }),
                    kontur: Object.freeze({ active: false, value: null }),
                    homogenitaet: Object.freeze({ active: false, value: null }),
                    signal: Object.freeze({ active: false, value: null })
                })
            }),
             Object.freeze({ // ESGAR Kriterien für Restaging als separates Set
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
                    logic: 'UND', // Nur ein Kriterium aktiv
                    size: Object.freeze({ active: true, threshold: 5.0, condition: '>=' }),
                    form: Object.freeze({ active: false, value: null }),
                    kontur: Object.freeze({ active: false, value: null }),
                    homogenitaet: Object.freeze({ active: false, value: null }),
                    signal: Object.freeze({ active: false, value: null })
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
                applicableKollektiv: state.getCurrentKollektiv(), // Nimmt das aktuell globale Kollektiv
                studyInfo: Object.freeze({
                    investigationType: 'Explorer-Modus',
                    focus: 'Benutzerdefinierte Kriterienanalyse.',
                    keyCriteriaSummary: 'Siehe aktuelle Einstellungen im Auswertungstab.',
                    referenceFile: null
                }),
                criteria: t2CriteriaManager.getAppliedCriteria(), // Holt die aktuell gesetzten Kriterien
                isAppliedCriteriaSet: true // Flag zur Unterscheidung
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
            return dataset.map(p => ({...p, t2: 'unbekannt'})); // Gebe Dataset mit unbekanntem T2 zurück
        }
        const criteriaToApply = studyCriteriaSet.criteria;
        const logicToApply = studyCriteriaSet.criteria.logic;

        return dataset.map(patient => {
            const patientCopy = cloneDeep(patient);
            const t2StatusResult = t2CriteriaManager.checkSinglePatientT2Status(patientCopy, criteriaToApply, logicToApply, studyCriteriaSet.id === 'rutegard_et_al_esgar'); // Pass ESGAR flag
            patientCopy.t2 = t2StatusResult.status;
            patientCopy.anzahl_t2_plus_lk = t2StatusResult.positiveLymphNodes;
            patientCopy.anzahl_t2_lk = t2StatusResult.totalEvaluatedLymphNodes;
            return patientCopy;
        });
    }

    function formatCriteriaForDisplay(criteria, logic, useHtml = true) {
        if (!criteria || !logic) return useHtml ? '<i>Nicht definiert</i>' : 'Nicht definiert';
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

        if (activeCriteria.length === 0) {
            return useHtml ? '<i>Keine Kriterien aktiv</i>' : 'Keine Kriterien aktiv';
        }

        const logicSeparator = logic === 'ODER' ? (useHtml ? ` ${boldStart}ODER${boldEnd} ` : ` ODER `) : (useHtml ? ` ${boldStart}UND${boldEnd} ` : ` UND `);
        if (logic === 'KOMBINIERT') { // Spezifisch für ESGAR-Logik
             let esgarDesc = `ESGAR-Logik: ${boldStart}Größe ≥9mm${boldEnd}${br}${logicSeparator} (${boldStart}Größe 5-8.9mm${boldEnd} ${useHtml ? ` ${boldStart}UND${boldEnd} ` : ` UND `} ≥${criteria.suspicious_features_count_for_5_8mm || 2} von (Form: ${criteria.form.value}, Kontur: ${criteria.kontur.value}, Homogenität: ${criteria.homogenitaet.value}))${br}${logicSeparator} (${boldStart}Größe <5mm${boldEnd} ${useHtml ? ` ${boldStart}UND${boldEnd} ` : ` UND `} ≥${criteria.suspicious_features_count_for_less_5mm || 3} von (Form: ${criteria.form.value}, Kontur: ${criteria.kontur.value}, Homogenität: ${criteria.homogenitaet.value}))`;
             return esgarDesc;
        }

        return `${boldStart}Logik: ${logic.toUpperCase()}${boldEnd}${br}${activeCriteria.join(logicSeparator)}`;
    }


    return Object.freeze({
        initialize,
        getAllStudyCriteriaSets,
        getStudyCriteriaSetById,
        applyStudyT2CriteriaToDataset,
        formatCriteriaForDisplay
    });
})();
