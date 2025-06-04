const studyT2CriteriaManager = (() => {
    let _studyCriteriaSets = [];

    function initialize() {
        _studyCriteriaSets = [
            Object.freeze({
                id: 'koh_2008_morphology',
                name: 'Koh et al. (2008) - Morphologie',
                displayShortName: 'Koh et al.',
                reference: 'Koh DM, et al. Int J Radiat Oncol Biol Phys. 2008;71(2):456-461.',
                applicableKollektiv: 'Gesamt', 
                logic: 'ODER',
                criteria: Object.freeze({
                    size: { active: false }, 
                    form: { active: false },
                    kontur: { active: true, value: 'irregulär' },
                    homogenitaet: { active: true, value: 'heterogen' },
                    signal: { active: false }
                }),
                studyInfo: {
                    year: 2008,
                    type: 'Primärstaging & Restaging (gemischt in Studie, hier als generisch betrachtet)',
                    keyCriteriaSummary: 'Irreguläre Kontur ODER heterogenes Signal'
                }
            }),
            Object.freeze({
                id: 'barbaro_2024_restaging',
                name: 'Barbaro et al. (2024) - Restaging Größe',
                displayShortName: 'Barbaro et al. (Größe)',
                reference: 'Barbaro B, et al. Radiother Oncol. 2024;193:110124.',
                applicableKollektiv: 'nRCT', 
                logic: 'UND',
                criteria: Object.freeze({
                    size: { active: true, threshold: 2.3, condition: '>=' },
                    form: { active: false },
                    kontur: { active: false },
                    homogenitaet: { active: false },
                    signal: { active: false }
                }),
                studyInfo: {
                    year: 2024,
                    type: 'Restaging nach nRCT',
                    keyCriteriaSummary: 'Kurzachse ≥ 2,3mm'
                }
            }),
            Object.freeze({
                id: 'rutegard_et_al_esgar',
                name: 'ESGAR 2016 / Rutegård et al. (2025)',
                displayShortName: 'ESGAR 2016',
                reference: 'Beets-Tan RGH, et al. Eur Radiol. 2018;28(4):1465-1475. (Validierung Rutegård MK, et al. Eur Radiol. 2025)',
                applicableKollektiv: 'direkt OP', 
                logic: 'ODER', 
                criteria: Object.freeze({ 
                    size_ge_9: { active: true, type: 'size', threshold: 9.0, condition: '>='},
                    size_5_8_and_2plus_morph: { 
                        active: true, type: 'size_morph_combo', 
                        size_min: 5.0, size_max: 8.9, 
                        min_morph_criteria: 2,
                        morph_keys: ['form_round', 'kontur_irrgular', 'homogenitaet_heterogen'] 
                    },
                    size_lt_5_and_3morph: {
                        active: true, type: 'size_morph_combo',
                        size_max_lt: 5.0, 
                        min_morph_criteria: 3,
                        morph_keys: ['form_round', 'kontur_irrgular', 'homogenitaet_heterogen']
                    },
                    size: { active: false }, 
                    form: { active: false },
                    kontur: { active: false },
                    homogenitaet: { active: false },
                    signal: { active: false }
                }),
                isESGAR2016: true, 
                studyInfo: {
                    year: 2016,
                    type: 'Primärstaging (ESGAR Konsensus)',
                    keyCriteriaSummary: 'Größe ≥9mm; ODER 5-8mm UND ≥2 Morphologiekriterien (rund, irregulär, heterogen); ODER <5mm UND 3 Morphologiekriterien. Muzinöse LK gelten als maligne (hier nicht separat implementiert).'
                }
            })
        ];
    }
    
    function evaluatePatientForESGAR(patient, esgarCriteriaSet) {
        if (!patient || !Array.isArray(patient.lymphknoten_t2) || patient.lymphknoten_t2.length === 0) {
            return 'unbekannt';
        }

        for (const lk of patient.lymphknoten_t2) {
            const lkSize = parseFloat(lk.groesse);
            if (isNaN(lkSize)) continue;

            if (lkSize >= (esgarCriteriaSet.criteria.size_ge_9.threshold || 9.0) ) return '+';

            let morphCriteriaCount = 0;
            if (lk.form === 'rund') morphCriteriaCount++;
            if (lk.kontur === 'irregulär') morphCriteriaCount++;
            if (lk.homogenitaet === 'heterogen') morphCriteriaCount++;
            
            const size_5_8_config = esgarCriteriaSet.criteria.size_5_8_and_2plus_morph;
            if (lkSize >= (size_5_8_config.size_min || 5.0) && lkSize < (size_5_8_config.size_max || 9.0) ) { 
                if (morphCriteriaCount >= (size_5_8_config.min_morph_criteria || 2) ) return '+';
            }
            
            const size_lt_5_config = esgarCriteriaSet.criteria.size_lt_5_and_3morph;
            if (lkSize < (size_lt_5_config.size_max_lt || 5.0) ) {
                if (morphCriteriaCount >= (size_lt_5_config.min_morph_criteria || 3) ) return '+';
            }
        }
        return '-';
    }


    function getAllStudyCriteriaSets() {
        return cloneDeep(_studyCriteriaSets);
    }

    function getStudyCriteriaSetById(id) {
        const foundSet = _studyCriteriaSets.find(set => set.id === id);
        return foundSet ? cloneDeep(foundSet) : null;
    }

    function formatCriteriaForDisplay(criteria, logic, useIcons = true) {
        if (!criteria || !logic) return "N/A";
        let parts = [];
        const criteriaKeys = t2CriteriaManager ? t2CriteriaManager.criteriaKeys : ['size', 'form', 'kontur', 'homogenitaet', 'signal'];


        for (const key of criteriaKeys) {
            const crit = criteria[key];
            if (crit && crit.active) {
                let partStr = "";
                const label = UI_TEXTS?.statistikTab?.filterMerkmalLabelMapping?.[key] || key.charAt(0).toUpperCase() + key.slice(1);
                 if (key === 'size') {
                    partStr = `${label} ${crit.condition || '>='} ${formatNumber(crit.threshold, 1)}mm`;
                } else {
                    const iconHtml = useIcons && typeof ui_helpers !== 'undefined' && typeof ui_helpers.getT2IconSVG === 'function' ? ui_helpers.getT2IconSVG(key, crit.value) : '';
                    partStr = `${iconHtml}${label}: ${crit.value}`;
                }
                parts.push(partStr);
            }
        }
        
        if (criteria.isESGAR2016 || (criteria.size_ge_9 && criteria.size_ge_9.active && criteria.size_5_8_and_2plus_morph && criteria.size_5_8_and_2plus_morph.active && criteria.size_lt_5_and_3morph && criteria.size_lt_5_and_3morph.active)) { 
            return "ESGAR 2016 Kriterien (komplex, siehe Beschreibung)";
        }


        if (parts.length === 0) return "Keine aktiven Kriterien";
        return parts.join(` <span class="text-primary fw-bold">${UI_TEXTS.t2LogicDisplayNames[logic] || logic}</span> `);
    }
    
    function getApplicableStudySetsForKollektiv(kollektivId) {
        return cloneDeep(_studyCriteriaSets.filter(set => 
            !set.applicableKollektiv || set.applicableKollektiv === 'Gesamt' || set.applicableKollektiv === kollektivId
        ));
    }


    return Object.freeze({
        initialize,
        getAllStudyCriteriaSets,
        getStudyCriteriaSetById,
        formatCriteriaForDisplay,
        evaluatePatientForESGAR,
        getApplicableStudySetsForKollektiv
    });
})();

window.studyT2CriteriaManager = studyT2CriteriaManager;
