const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'methoden',
    defaultBruteForceMetricForPublication: 'Balanced Accuracy',

    sections: Object.freeze([
        Object.freeze({
            id: 'abstract',
            labelKey: 'abstract', // Key for UI_TEXTS.publikationTab.sectionLabels
            subSections: Object.freeze([
                Object.freeze({ id: 'abstract_purpose', label: 'Purpose' }),
                Object.freeze({ id: 'abstract_materials_methods', label: 'Materials and Methods' }),
                Object.freeze({ id: 'abstract_results', label: 'Results' }),
                Object.freeze({ id: 'abstract_conclusion', label: 'Conclusion' }),
            ])
        }),
        Object.freeze({
            id: 'introduction',
            labelKey: 'einleitung',
            subSections: Object.freeze([
                Object.freeze({ id: 'introduction_background', label: 'Background' }),
                Object.freeze({ id: 'introduction_rationale_objective', label: 'Rationale and Objective' })
            ])
        }),
        Object.freeze({
            id: 'methoden',
            labelKey: 'methoden',
            subSections: Object.freeze([
                Object.freeze({ id: 'methoden_studienanlage', label: 'Study Design and Ethical Approval' }),
                Object.freeze({ id: 'methoden_patientenkollektiv', label: 'Patient Cohort' }),
                Object.freeze({ id: 'methoden_mrt_protokoll', label: 'MR Imaging Protocol' }),
                Object.freeze({ id: 'methoden_as_definition', label: 'Image Analysis: Avocado Sign' }),
                Object.freeze({ id: 'methoden_t2_definition_literatur', label: 'Image Analysis: T2-weighted Criteria (Literature-based)' }),
                Object.freeze({ id: 'methoden_t2_definition_bruteforce', label: 'Image Analysis: T2-weighted Criteria (Brute-Force Optimized)' }),
                Object.freeze({ id: 'methoden_referenzstandard', label: 'Reference Standard' }),
                Object.freeze({ id: 'methoden_statistische_analyse', label: 'Statistical Analysis' })
            ])
        }),
        Object.freeze({
            id: 'ergebnisse',
            labelKey: 'ergebnisse',
            subSections: Object.freeze([
                Object.freeze({ id: 'ergebnisse_patientencharakteristika', label: 'Patient Characteristics' }),
                Object.freeze({ id: 'ergebnisse_as_performance', label: 'Diagnostic Performance: Avocado Sign' }),
                Object.freeze({ id: 'ergebnisse_literatur_t2_performance', label: 'Diagnostic Performance: Literature-based T2 Criteria' }),
                Object.freeze({ id: 'ergebnisse_optimierte_t2_performance', label: 'Diagnostic Performance: Brute-Force Optimized T2 Criteria' }),
                Object.freeze({ id: 'ergebnisse_vergleich_as_vs_literatur_t2', label: 'Comparison: AS vs. Literature-based T2 Criteria' }),
                Object.freeze({ id: 'ergebnisse_vergleich_as_vs_optimierte_t2', label: 'Comparison: AS vs. Brute-Force Optimized T2 Criteria' })
            ])
        }),
        Object.freeze({
            id: 'diskussion',
            labelKey: 'diskussion',
            subSections: Object.freeze([
                Object.freeze({ id: 'diskussion_hauptbefunde', label: 'Principal Findings' }),
                Object.freeze({ id: 'diskussion_vergleich_literatur', label: 'Comparison with Existing Literature' }),
                Object.freeze({ id: 'diskussion_staerken', label: 'Strengths of the Study' }),
                Object.freeze({ id: 'diskussion_limitationen', label: 'Limitations' }),
                Object.freeze({ id: 'diskussion_implikationen_ausblick', label: 'Clinical Implications and Future Directions' })
            ])
        }),
        Object.freeze({
            id: 'schlussfolgerung',
            labelKey: 'schlussfolgerung',
            subSections: Object.freeze([
                Object.freeze({ id: 'schlussfolgerung_summary', label: 'Conclusion Summary' })
            ])
        }),
        Object.freeze({
            id: 'referenzen',
            labelKey: 'referenzen',
            subSections: Object.freeze([
                Object.freeze({ id: 'referenzen_list', label: 'Reference List' })
            ])
        })
    ]),

    literatureCriteriaSets: Object.freeze([
        Object.freeze({
            id: 'koh_2008_morphology',
            nameKey: 'Koh et al. (2008)',
            shortName: 'Koh et al.'
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            nameKey: 'Barbaro et al. (2024)',
            shortName: 'Barbaro et al.'
        }),
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            nameKey: 'Rutegård et al. (2025) / ESGAR 2016',
            shortName: 'ESGAR 2016'
        })
    ]),

    bruteForceMetricsForPublication: Object.freeze([
        { value: 'Balanced Accuracy', label: 'Balanced Accuracy' },
        { value: 'Accuracy', label: 'Accuracy' },
        { value: 'F1-Score', label: 'F1-Score' },
        { value: 'PPV', label: 'Positiver Prädiktiver Wert (PPV)' },
        { value: 'NPV', label: 'Negativer Prädiktiver Wert (NPV)' }
    ]),

    publicationElements: Object.freeze({
        // TABLES
        TABLE_PATIENT_CHARS: Object.freeze({
            id: 'pub-table-patient-characteristics',
            referenceFormat: { de: 'Tabelle 1', en: 'Table 1' },
            titleDe: 'Patientencharakteristika der Studienkohorte (N={{PATIENT_COUNT_GESAMT}})',
            titleEn: 'Patient Characteristics of the Study Cohort (N={{PATIENT_COUNT_GESAMT}})',
            dataFunction: 'getPatientCharacteristicsTableData' // Placeholder for function in text_generator
        }),
        TABLE_LITERATURE_T2_CRITERIA: Object.freeze({
            id: 'pub-table-literature-t2-criteria',
            referenceFormat: { de: 'Tabelle 2', en: 'Table 2' },
            titleDe: 'Übersicht der evaluierten Literatur-basierten T2-Kriteriensets',
            titleEn: 'Overview of Evaluated Literature-Based T2 Criteria Sets',
            dataFunction: 'getLiteratureT2CriteriaTableData'
        }),
        TABLE_PERFORMANCE_AS: Object.freeze({
            id: 'pub-table-performance-as',
            referenceFormat: { de: 'Tabelle 3', en: 'Table 3' },
            titleDe: 'Diagnostische Güte des Avocado Signs für die N-Status-Prädiktion',
            titleEn: 'Diagnostic Performance of the Avocado Sign for N-Status Prediction',
            dataFunction: 'getPerformanceASTableData'
        }),
        TABLE_PERFORMANCE_LIT_T2: Object.freeze({
            id: 'pub-table-performance-lit-t2',
            referenceFormat: { de: 'Tabelle 4', en: 'Table 4' },
            titleDe: 'Diagnostische Güte der Literatur-basierten T2-Kriteriensets',
            titleEn: 'Diagnostic Performance of Literature-Based T2 Criteria Sets',
            dataFunction: 'getPerformanceLitT2TableData'
        }),
        TABLE_PERFORMANCE_BF_T2: Object.freeze({
            id: 'pub-table-performance-bf-t2',
            referenceFormat: { de: 'Tabelle 5', en: 'Table 5' },
            titleDe: 'Diagnostische Güte der Brute-Force-optimierten T2-Kriteriensets (Zielmetrik: {{PUBLICATION_BF_METRIC_NAME}})',
            titleEn: 'Diagnostic Performance of Brute-Force Optimized T2 Criteria Sets (Target Metric: {{PUBLICATION_BF_METRIC_NAME}})',
            dataFunction: 'getPerformanceBFT2TableData'
        }),
        TABLE_COMPARISON_AS_VS_LIT_T2: Object.freeze({
            id: 'pub-table-comparison-as-vs-lit-t2',
            referenceFormat: { de: 'Tabelle 6', en: 'Table 6' },
            titleDe: 'Statistischer Vergleich: Avocado Sign vs. Literatur-basierte T2-Kriteriensets',
            titleEn: 'Statistical Comparison: Avocado Sign vs. Literature-Based T2 Criteria Sets',
            dataFunction: 'getComparisonASvsLitT2TableData'
        }),
        TABLE_COMPARISON_AS_VS_BF_T2: Object.freeze({
            id: 'pub-table-comparison-as-vs-bf-t2',
            referenceFormat: { de: 'Tabelle 7', en: 'Table 7' },
            titleDe: 'Statistischer Vergleich: Avocado Sign vs. Brute-Force-optimierte T2-Kriteriensets (Zielmetrik: {{PUBLICATION_BF_METRIC_NAME}})',
            titleEn: 'Statistical Comparison: Avocado Sign vs. Brute-Force Optimized T2 Criteria Sets (Target Metric: {{PUBLICATION_BF_METRIC_NAME}})',
            dataFunction: 'getComparisonASvsBFT2TableData'
        }),

        // FIGURES
        FIGURE_PATIENT_FLOWCHART: Object.freeze({ // Conceptual placeholder, image would be manually created.
            id: 'pub-fig-patient-flowchart',
            referenceFormat: { de: 'Abbildung 1', en: 'Figure 1' },
            titleDe: 'Flussdiagramm der Patienteneinschlusses.',
            titleEn: 'Patient Enrollment Flowchart.',
            legendDe: 'Flussdiagramm der in die Studie eingeschlossenen Patienten.',
            legendEn: 'Flowchart of patients included in the study.',
            placeholder: true // Indicates that the chart needs external creation
        }),
        FIGURE_DEMOGRAPHICS_AGE: Object.freeze({
            id: 'pub-chart-alter-Gesamt', // Matches existing chart ID for age in publication_tab_logic
            referenceFormat: { de: 'Abbildung 2A', en: 'Figure 2A' },
            titleDe: 'Altersverteilung der Studienkohorte (N={{PATIENT_COUNT_GESAMT}})',
            titleEn: 'Age Distribution of the Study Cohort (N={{PATIENT_COUNT_GESAMT}})',
            legendDe: 'Histogramm der Altersverteilung im Gesamtkollektiv.',
            legendEn: 'Histogram of age distribution in the overall cohort.',
            chartFunction: 'renderAgeDistributionChart', // Function in chart_renderer.js
            dataKey: 'Gesamt.deskriptiv.alterData' // Key in allKollektivStats
        }),
        FIGURE_DEMOGRAPHICS_GENDER: Object.freeze({
            id: 'pub-chart-gender-Gesamt', // Matches existing chart ID for gender
            referenceFormat: { de: 'Abbildung 2B', en: 'Figure 2B' },
            titleDe: 'Geschlechterverteilung der Studienkohorte (N={{PATIENT_COUNT_GESAMT}})',
            titleEn: 'Gender Distribution of the Study Cohort (N={{PATIENT_COUNT_GESAMT}})',
            legendDe: 'Tortendiagramm der Geschlechterverteilung im Gesamtkollektiv (Männlich: {{PATIENT_MALE_COUNT_GESAMT}} ({{PATIENT_MALE_PERCENT_GESAMT}}), Weiblich: {{PATIENT_FEMALE_COUNT_GESAMT}} ({{PATIENT_FEMALE_PERCENT_GESAMT}})).',
            legendEn: 'Pie chart of gender distribution in the overall cohort (Male: {{PATIENT_MALE_COUNT_GESAMT}} ({{PATIENT_MALE_PERCENT_GESAMT}}), Female: {{PATIENT_FEMALE_COUNT_GESAMT}} ({{PATIENT_FEMALE_PERCENT_GESAMT}})).',
            chartFunction: 'renderPieChart',
            dataKey: 'Gesamt.deskriptiv.geschlecht'
        }),
        FIGURE_PERFORMANCE_COMPARISON_GESAMT: Object.freeze({
            id: 'pub-chart-vergleich-Gesamt', // Matches existing
            referenceFormat: { de: 'Abbildung 3A', en: 'Figure 3A' },
            titleDe: 'Vergleich der diagnostischen Gütemetriken: Avocado Sign vs. optimierte T2-Kriterien (Gesamtkollektiv)',
            titleEn: 'Comparison of Diagnostic Performance Metrics: Avocado Sign vs. Optimized T2 Criteria (Overall Cohort)',
            legendDe: 'Balkendiagramm zum Vergleich von Sensitivität, Spezifität, PPV, NPV, Accuracy und AUC zwischen dem Avocado Sign und den für die {{PUBLICATION_BF_METRIC_NAME_NORMALIZED}} optimierten T2-Kriterien im Gesamtkollektiv (N={{PATIENT_COUNT_GESAMT}}).',
            legendEn: 'Bar chart comparing sensitivity, specificity, PPV, NPV, accuracy, and AUC between the Avocado Sign and T2 criteria optimized for {{PUBLICATION_BF_METRIC_NAME_NORMALIZED}} in the overall cohort (N={{PATIENT_COUNT_GESAMT}}).',
            chartFunction: 'renderComparisonBarChart',
            dataKey: 'Gesamt.vergleichsChartDaten' // Needs new data structure in stats service
        }),
        FIGURE_PERFORMANCE_COMPARISON_DIREKT_OP: Object.freeze({
            id: 'pub-chart-vergleich-direkt-OP', // Matches existing
            referenceFormat: { de: 'Abbildung 3B', en: 'Figure 3B' },
            titleDe: 'Vergleich der diagnostischen Gütemetriken: Avocado Sign vs. optimierte T2-Kriterien (Direkt-OP-Kollektiv)',
            titleEn: 'Comparison of Diagnostic Performance Metrics: Avocado Sign vs. Optimized T2 Criteria (Upfront Surgery Cohort)',
            legendDe: 'Balkendiagramm zum Vergleich von Sensitivität, Spezifität, PPV, NPV, Accuracy und AUC zwischen dem Avocado Sign und den für die {{PUBLICATION_BF_METRIC_NAME_NORMALIZED}} optimierten T2-Kriterien im Direkt-OP-Kollektiv (N={{PATIENT_COUNT_DIREKT_OP}}).',
            legendEn: 'Bar chart comparing sensitivity, specificity, PPV, NPV, accuracy, and AUC between the Avocado Sign and T2 criteria optimized for {{PUBLICATION_BF_METRIC_NAME_NORMALIZED}} in the upfront surgery cohort (N={{PATIENT_COUNT_DIREKT_OP}}).',
            chartFunction: 'renderComparisonBarChart',
            dataKey: 'direkt OP.vergleichsChartDaten'
        }),
        FIGURE_PERFORMANCE_COMPARISON_NRCT: Object.freeze({
            id: 'pub-chart-vergleich-nRCT', // Matches existing
            referenceFormat: { de: 'Abbildung 3C', en: 'Figure 3C' },
            titleDe: 'Vergleich der diagnostischen Gütemetriken: Avocado Sign vs. optimierte T2-Kriterien (nRCT-Kollektiv)',
            titleEn: 'Comparison of Diagnostic Performance Metrics: Avocado Sign vs. Optimized T2 Criteria (nRCT Cohort)',
            legendDe: 'Balkendiagramm zum Vergleich von Sensitivität, Spezifität, PPV, NPV, Accuracy und AUC zwischen dem Avocado Sign und den für die {{PUBLICATION_BF_METRIC_NAME_NORMALIZED}} optimierten T2-Kriterien im nRCT-Kollektiv (N={{PATIENT_COUNT_NRCT}}).',
            legendEn: 'Bar chart comparing sensitivity, specificity, PPV, NPV, accuracy, and AUC between the Avocado Sign and T2 criteria optimized for {{PUBLICATION_BF_METRIC_NAME_NORMALIZED}} in the nRCT cohort (N={{PATIENT_COUNT_NRCT}}).',
            chartFunction: 'renderComparisonBarChart',
            dataKey: 'nRCT.vergleichsChartDaten'
        }),
        FIGURE_AVOCADO_SIGN_EXAMPLES: Object.freeze({ // Conceptual placeholder
            id: 'pub-fig-avocado-examples',
            referenceFormat: { de: 'Abbildung 4', en: 'Figure 4' },
            titleDe: 'Beispiele für das Avocado Sign.',
            titleEn: 'Examples of the Avocado Sign.',
            legendDe: 'Kontrastverstärkte T1-gewichtete MRT-Bilder. (A) Mesorektaler Lymphknoten ohne Avocado Sign (histopathologisch N0). (B) Mesorektaler Lymphknoten mit typischem Avocado Sign (hypointenser Kern, Pfeil) (histopathologisch N+).',
            legendEn: 'Contrast-enhanced T1-weighted MR images. (A) Mesorectal lymph node without the Avocado Sign (histopathologically N0). (B) Mesorectal lymph node with a typical Avocado Sign (hypointense core, arrow) (histopathologically N+).',
            placeholder: true
        }),
    }),

    journalSpecifics: Object.freeze({
        radiology: Object.freeze({
            abstractWordLimit: 250, // Beispielwert, muss geprüft werden
            manuscriptWordLimit: 4000, // Beispielwert
            referencesStyle: 'vancouver', // oder AMA etc.
            figureResolutionDPI: 300, // für TIFF/EPS
            keywordsMax: 5
        })
    }),

    // TextContentTemplates would be a very large object mapping section IDs to DE/EN text templates
    // Example structure:
    // textContentTemplates: {
    //      abstract_purpose: {
    //          de: "Ziel dieser Studie war es, die diagnostische Wertigkeit des Avocado Signs (AS) ... {{DYNAMIC_VALUE}} ... zu evaluieren.",
    //          en: "The purpose of this study was to evaluate the diagnostic performance of the Avocado Sign (AS) ... {{DYNAMIC_VALUE}}."
    //      },
    //      // ... more templates for all subSections
    // }
    // This will be implemented in publication_text_generator.js directly for brevity here,
    // but this config file would be the conceptual place to store such templates if they were static strings.
    // For a dynamic generation, functions in publication_text_generator.js will build these texts.

});

if (typeof Object.freeze === 'function') {
    Object.freeze(PUBLICATION_CONFIG);
}
