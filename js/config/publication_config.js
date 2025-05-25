const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de', // This is used by state.js as a fallback if no language is in localStorage
    defaultSection: 'methoden', // Default section to show when publication tab is opened
    sections: Object.freeze([
        Object.freeze({
            id: 'methoden',
            labelKey: 'methoden', // Key to look up in UI_TEXTS.lang[lang].publikationTab.sectionLabels
            subSections: Object.freeze([
                Object.freeze({ id: 'methoden_studienanlage', labelKey: 'methoden_studienanlage' }), // Key for UI_TEXTS.lang[lang].publikationTab.subSectionLabels
                Object.freeze({ id: 'methoden_patientenkollektiv', labelKey: 'methoden_patientenkollektiv' }),
                Object.freeze({ id: 'methoden_mrt_protokoll', labelKey: 'methoden_mrt_protokoll' }),
                Object.freeze({ id: 'methoden_as_definition', labelKey: 'methoden_as_definition' }),
                Object.freeze({ id: 'methoden_t2_definition', labelKey: 'methoden_t2_definition' }),
                Object.freeze({ id: 'methoden_referenzstandard', labelKey: 'methoden_referenzstandard' }),
                Object.freeze({ id: 'methoden_statistische_analyse', labelKey: 'methoden_statistische_analyse' })
            ])
        }),
        Object.freeze({
            id: 'ergebnisse',
            labelKey: 'ergebnisse',
            subSections: Object.freeze([
                Object.freeze({ id: 'ergebnisse_patientencharakteristika', labelKey: 'ergebnisse_patientencharakteristika' }),
                Object.freeze({ id: 'ergebnisse_as_performance', labelKey: 'ergebnisse_as_performance' }),
                Object.freeze({ id: 'ergebnisse_literatur_t2_performance', labelKey: 'ergebnisse_literatur_t2_performance' }),
                Object.freeze({ id: 'ergebnisse_optimierte_t2_performance', labelKey: 'ergebnisse_optimierte_t2_performance' }),
                Object.freeze({ id: 'ergebnisse_vergleich_performance', labelKey: 'ergebnisse_vergleich_performance' })
            ])
        }),
        // Additional main sections can be added here if needed, e.g., Diskussion, Einleitung
        // For now, keeping it to Methoden and Ergebnisse as per current implementation focus
         Object.freeze({
            id: 'diskussion',
            labelKey: 'diskussion',
            subSections: [] // Placeholder, actual subsections would be defined here
        }),
        Object.freeze({
            id: 'einleitung',
            labelKey: 'einleitung',
            subSections: [] // Placeholder
        }),
        Object.freeze({
            id: 'abstract',
            labelKey: 'abstract',
            subSections: [] // Placeholder
        }),
        Object.freeze({
            id: 'referenzen',
            labelKey: 'referenzen',
            subSections: [] // Placeholder
        })
    ]),
    literatureCriteriaSets: Object.freeze([ // These IDs are used to fetch sets from study_criteria_manager
        Object.freeze({
            id: 'koh_2008_morphology',
            // nameKey and shortName are used by publication_renderer if directly accessed,
            // but study_criteria_manager.getStudyCriteriaSetById(id).name is preferred
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
        }),
        Object.freeze({
            id: 'rutegard_et_al_esgar',
        })
    ]),
    bruteForceMetricsForPublication: Object.freeze([ // Used for the dropdown in publication tab header
        // The 'label' here should be a key for UI_TEXTS if full localization of these labels is desired,
        // or they are treated as universal. Current implementation in ui_components uses the label directly.
        // For full localization, each object would need e.g. labelKey: 'bfMetricBalancedAccuracy'
        { value: 'Balanced Accuracy', label: 'Balanced Accuracy' }, // Assuming these are recognized terms
        { value: 'Accuracy', label: 'Accuracy' },
        { value: 'F1-Score', label: 'F1-Score' },
        { value: 'PPV', label: 'PPV' }, // Or "Positiver Prädiktiver Wert (PPV)" if more descriptive
        { value: 'NPV', label: 'NPV' }  // Or "Negativer Prädiktiver Wert (NPV)"
    ]),
    defaultBruteForceMetricForPublication: 'Balanced Accuracy', // Value from the list above

    publicationElements: Object.freeze({ // IDs for specific tables/charts generated in publication tab
        methoden: Object.freeze({
            literaturT2KriterienTabelle: {
                id: 'pub-table-literatur-t2-kriterien',
                // titleDe and titleEn were here, now this will be handled by UI_TEXTS.lang[lang].publikationTab.tableTitles.literaturT2Kriterien
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-patienten-charakteristika',
            },
            diagnostischeGueteGesamtTabelle: { // This ID seems to be a base for multiple tables (AS, Lit, BF, Vergleich)
                id: 'pub-table-diagnostische-guete',
            },
            // Specific chart IDs that might be referenced for styling or direct manipulation (if any)
            // Actual rendering logic for these is in publikation_tab_logic.js -> publication_renderer.js -> chart_renderer.js
            // Example IDs that would be dynamically generated:
            // alterHistogrammGesamt: 'pub-chart-alter-Gesamt',
            // geschlechtPieGesamt: 'pub-chart-gender-Gesamt',
            // vergleichPerformanceGesamt: 'pub-chart-vergleich-Gesamt',
            // vergleichPerformanceDirektOP: 'pub-chart-vergleich-direkt-OP',
            // vergleichPerformanceNRCT: 'pub-chart-vergleich-nRCT'
        })
    })
});

if (typeof Object.freeze === 'function') {
    // Object.freeze(PUBLICATION_CONFIG) is already applied to the main object
    // The nested Object.freeze calls handle the inner structures.
}
