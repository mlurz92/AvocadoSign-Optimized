const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'abstract_key_results_summary',
    defaultBruteForceMetricForPublication: 'Balanced Accuracy',

    sections: Object.freeze([
        Object.freeze({
            id: 'abstract_key_results_summary',
            labelKey: 'abstract', // Uses 'abstract' label from UI_TEXTS
            wordLimit: APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.MANUSCRIPT_TYPE_ORIGINAL_RESEARCH.ABSTRACT_WORD_LIMIT, // Combined, individual parts have their own
            subSections: Object.freeze([
                Object.freeze({ id: 'summary_statement_main', labelKey: 'publication_summary_statement', wordLimit: APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.MANUSCRIPT_TYPE_ORIGINAL_RESEARCH.SUMMARY_STATEMENT_WORD_LIMIT }),
                Object.freeze({ id: 'abstract_main', labelKey: 'publication_abstract_proper', wordLimit: APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.MANUSCRIPT_TYPE_ORIGINAL_RESEARCH.ABSTRACT_WORD_LIMIT }),
                Object.freeze({ id: 'key_results_main', labelKey: 'publication_key_results', wordLimit: APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.MANUSCRIPT_TYPE_ORIGINAL_RESEARCH.KEY_RESULTS_WORD_LIMIT })
            ])
        }),
        Object.freeze({
            id: 'introduction',
            labelKey: 'introduction',
            wordLimit: APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.MANUSCRIPT_TYPE_ORIGINAL_RESEARCH.INTRODUCTION_WORD_LIMIT,
            subSections: Object.freeze([
                Object.freeze({ id: 'introduction_main', labelKey: 'publication_introduction_content' })
            ])
        }),
        Object.freeze({
            id: 'materials_methods',
            labelKey: 'methoden', // Maps to "Material & Methoden"
            wordLimit: APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.MANUSCRIPT_TYPE_ORIGINAL_RESEARCH.MATERIALS_METHODS_WORD_LIMIT,
            subSections: Object.freeze([
                Object.freeze({ id: 'methoden_studienanlage_ethik', labelKey: 'publication_methods_study_design_ethics' }),
                Object.freeze({ id: 'methoden_patientenkohorte', labelKey: 'publication_methods_patient_cohort' }),
                Object.freeze({ id: 'methoden_mrt_protokoll_akquisition', labelKey: 'publication_methods_mri_protocol' }),
                Object.freeze({ id: 'methoden_bildanalyse_avocado_sign', labelKey: 'publication_methods_image_analysis_as' }),
                Object.freeze({ id: 'methoden_bildanalyse_t2_kriterien', labelKey: 'publication_methods_image_analysis_t2' }),
                Object.freeze({ id: 'methoden_referenzstandard_histopathologie', labelKey: 'publication_methods_reference_standard' }),
                Object.freeze({ id: 'methoden_statistische_analyse_methoden', labelKey: 'publication_methods_statistical_analysis' })
            ])
        }),
        Object.freeze({
            id: 'results',
            labelKey: 'ergebnisse',
            wordLimit: APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.MANUSCRIPT_TYPE_ORIGINAL_RESEARCH.RESULTS_WORD_LIMIT,
            subSections: Object.freeze([
                Object.freeze({ id: 'ergebnisse_patientencharakteristika', labelKey: 'publication_results_patient_characteristics' }),
                Object.freeze({ id: 'ergebnisse_as_diagnostische_guete', labelKey: 'publication_results_as_performance' }),
                Object.freeze({ id: 'ergebnisse_t2_literatur_diagnostische_guete', labelKey: 'publication_results_t2_literature_performance' }),
                Object.freeze({ id: 'ergebnisse_t2_optimiert_diagnostische_guete', labelKey: 'publication_results_t2_optimized_performance' }),
                Object.freeze({ id: 'ergebnisse_vergleich_as_vs_t2', labelKey: 'publication_results_comparison_as_t2' })
            ])
        }),
        Object.freeze({
            id: 'discussion',
            labelKey: 'discussion',
            wordLimit: APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.MANUSCRIPT_TYPE_ORIGINAL_RESEARCH.DISCUSSION_WORD_LIMIT,
            subSections: Object.freeze([
                Object.freeze({ id: 'discussion_main', labelKey: 'publication_discussion_content' })
            ])
        }),
        Object.freeze({
            id: 'references',
            labelKey: 'references',
            wordLimit: null, // No specific word limit, but a count limit
            referenceLimit: APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.MANUSCRIPT_TYPE_ORIGINAL_RESEARCH.REFERENCE_LIMIT,
            subSections: Object.freeze([
                Object.freeze({ id: 'references_main', labelKey: 'publication_references_list' })
            ])
        })
    ]),

    literatureCriteriaSets: Object.freeze([ // Used for results display and potentially methods description
        Object.freeze({
            id: 'rutegard_et_al_esgar', // Matches study_criteria_manager.js
            labelKey: 'Rutegård et al. (2025) / ESGAR 2016' // For display in UI if needed
        }),
        Object.freeze({
            id: 'koh_2008_morphology',
            labelKey: 'Koh et al. (2008)'
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            labelKey: 'Barbaro et al. (2024)'
        })
    ]),

    bruteForceMetricsForPublication: Object.freeze([ // Options for the dropdown in publication tab
        Object.freeze({ value: 'Balanced Accuracy', labelDe: 'Balanced Accuracy', labelEn: 'Balanced Accuracy' }),
        Object.freeze({ value: 'Accuracy', labelDe: 'Accuracy', labelEn: 'Accuracy' }),
        Object.freeze({ value: 'F1-Score', labelDe: 'F1-Score', labelEn: 'F1-Score' }),
        Object.freeze({ value: 'PPV', labelDe: 'Positiver Prädiktiver Wert (PPV)', labelEn: 'Positive Predictive Value (PPV)' }),
        Object.freeze({ value: 'NPV', labelDe: 'Negativer Prädiktiver Wert (NPV)', labelEn: 'Negative Predictive Value (NPV)' })
    ]),

    publicationElements: Object.freeze({ // IDs and titles for tables/figures to be generated/referenced
        methoden: Object.freeze({
            flowDiagram: Object.freeze({ // Radiology Figure 1: Flow Diagram
                id: 'pub-fig-flow-diagram',
                radiologyLabel: 'Figure 1',
                titleDe: 'Flussdiagramm der Patientenrekrutierung und -analyse',
                titleEn: 'Patient Recruitment and Analysis Flowchart',
                legendDe: 'Flussdiagramm der Patientenrekrutierung, das die Anzahl der initial eingeschlossenen Teilnehmer und der aus verschiedenen Gründen ausgeschlossenen Patienten zeigt, bis hin zur finalen Studienpopulation.',
                legendEn: 'Patient recruitment flowchart showing the number of participants initially enrolled and those excluded for various reasons, leading to the final study population.'
            }),
            literaturT2KriterienTabelle: Object.freeze({
                id: 'pub-table-literatur-t2-kriterien',
                radiologyLabel: 'Methods Table 1', // Example, adjust as needed
                titleDe: 'Übersicht der evaluierten Literatur-basierten T2-Kriteriensets',
                titleEn: 'Overview of Evaluated Literature-Based T2 Criteria Sets',
                footnoteDe: 'Abkürzungen: ESGAR, European Society of Gastrointestinal and Abdominal Radiology.',
                footnoteEn: 'Abbreviations: ESGAR, European Society of Gastrointestinal and Abdominal Radiology.'
            })
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: Object.freeze({ // Radiology Table 1: Demographics
                id: 'pub-table-patienten-charakteristika',
                radiologyLabel: 'Table 1',
                titleDe: 'Baseline Patientencharakteristika und klinische Daten',
                titleEn: 'Baseline Patient Characteristics and Clinical Data',
                footnoteDe: 'Daten sind als Median (Interquartilsabstand) oder n (%) dargestellt. Abkürzungen: nCRT, neoadjuvante Radiochemotherapie; AS, Avocado Sign.',
                footnoteEn: 'Data are presented as median (interquartile range) or n (%). Abbreviations: nCRT, neoadjuvant chemoradiotherapy; AS, Avocado Sign.'
            }),
            diagnostischeGueteASTabelle: Object.freeze({
                id: 'pub-table-diagnostische-guete-as',
                radiologyLabel: 'Table 2', // Example
                titleDe: 'Diagnostische Güte des Avocado Signs für die Prädiktion des N-Status',
                titleEn: 'Diagnostic Performance of the Avocado Sign for N-Status Prediction',
                footnoteDe: 'Alle Konfidenzintervalle (KI) sind 95%-KIs. Abkürzungen: PPV, positiver prädiktiver Wert; NPV, negativer prädiktiver Wert; AUC, Fläche unter der ROC-Kurve.',
                footnoteEn: 'All confidence intervals (CI) are 95% CIs. Abbreviations: PPV, positive predictive value; NPV, negative predictive value; AUC, area under the ROC curve.'
            }),
            diagnostischeGueteLiteraturT2Tabelle: Object.freeze({
                id: 'pub-table-diagnostische-guete-literatur-t2',
                radiologyLabel: 'Table 3', // Example
                titleDe: 'Diagnostische Güte der Literatur-basierten T2-Kriterien für die Prädiktion des N-Status',
                titleEn: 'Diagnostic Performance of Literature-Based T2 Criteria for N-Status Prediction',
                footnoteDe: 'Die Kriterien wurden jeweils auf das in der Originalliteratur definierte oder das am besten passende Subkollektiv angewendet. Alle KI sind 95%-KIs.',
                footnoteEn: 'Criteria were applied to the subgroup defined in the original literature or the best matching subcohort. All CIs are 95% CIs.'
            }),
            diagnostischeGueteOptimierteT2Tabelle: Object.freeze({
                id: 'pub-table-diagnostische-guete-optimierte-t2',
                radiologyLabel: 'Table 4', // Example
                titleDe: 'Diagnostische Güte der für die Zielmetrik {BF_METRIC_NAME} optimierten T2-Kriterien',
                titleEn: 'Diagnostic Performance of T2 Criteria Optimized for the Target Metric {BF_METRIC_NAME}',
                footnoteDe: 'Optimierung erfolgte spezifisch für jedes gelistete Kollektiv. Alle KI sind 95%-KIs.',
                footnoteEn: 'Optimization was performed specifically for each listed cohort. All CIs are 95% CIs.'
            }),
            statistischerVergleichAST2Tabelle: Object.freeze({ // This might be a new table, or results integrated into other tables/text
                id: 'pub-table-statistischer-vergleich-as-t2',
                radiologyLabel: 'Table X', // Needs final numbering
                titleDe: 'Statistischer Vergleich der diagnostischen Güte: Avocado Sign vs. T2-Kriterien (Literatur und Optimiert)',
                titleEn: 'Statistical Comparison of Diagnostic Performance: Avocado Sign vs. T2 Criteria (Literature and Optimized)',
                footnoteDe: 'P-Werte vom DeLong-Test für AUCs und McNemar-Test für Accuracy. Signifikanzniveau P < .05.',
                footnoteEn: 'P-values from DeLong test for AUCs and McNemar test for accuracy. Significance level P < .05.'
            }),
            alterVerteilungChart: Object.freeze({ // Radiology Figure (e.g., Figure 2A or part of composite Figure 2)
                id: 'pub-chart-alter-verteilung',
                radiologyLabel: 'Figure 2A',
                titleDe: 'Altersverteilung im Gesamtkollektiv',
                titleEn: 'Age Distribution in the Overall Cohort',
                legendDe: 'Histogramm der Altersverteilung der 106 Patienten. Die Y-Achse zeigt die Anzahl der Patienten, die X-Achse das Alter in Jahren.',
                legendEn: 'Histogram of age distribution of the 106 patients. Y-axis shows number of patients, X-axis shows age in years.'
            }),
            geschlechtVerteilungChart: Object.freeze({ // Radiology Figure (e.g., Figure 2B)
                id: 'pub-chart-geschlecht-verteilung',
                radiologyLabel: 'Figure 2B',
                titleDe: 'Geschlechterverteilung im Gesamtkollektiv',
                titleEn: 'Gender Distribution in the Overall Cohort',
                legendDe: 'Tortendiagramm der Geschlechterverteilung der 106 Patienten.',
                legendEn: 'Pie chart of gender distribution of the 106 patients.'
            }),
            vergleichPerformanceChartGesamt: Object.freeze({ // Radiology Figure (e.g., Figure 3A)
                id: 'pub-chart-vergleich-gesamt',
                radiologyLabel: 'Figure 3A',
                titleDe: 'Vergleichsmetriken (Gesamtkollektiv): AS vs. optimierte T2 ({BF_METRIC_NAME})',
                titleEn: 'Comparative Metrics (Overall Cohort): AS vs. Optimized T2 ({BF_METRIC_NAME})',
                legendDe: 'Balkendiagramm der Sensitivität, Spezifität, PPV, NPV, Accuracy und AUC für Avocado Sign (AS) und für die Zielmetrik {BF_METRIC_NAME} optimierte T2-Kriterien im Gesamtkollektiv (N=106).',
                legendEn: 'Bar chart of sensitivity, specificity, PPV, NPV, accuracy, and AUC for Avocado Sign (AS) and T2 criteria optimized for the target metric {BF_METRIC_NAME} in the overall cohort (N=106).'
            }),
            vergleichPerformanceChartdirektOP: Object.freeze({ // Radiology Figure (e.g., Figure 3B)
                id: 'pub-chart-vergleich-direkt-op',
                radiologyLabel: 'Figure 3B',
                titleDe: 'Vergleichsmetriken (Direkt OP): AS vs. optimierte T2 ({BF_METRIC_NAME})',
                titleEn: 'Comparative Metrics (Upfront Surgery): AS vs. Optimized T2 ({BF_METRIC_NAME})',
                legendDe: 'Balkendiagramm der Sensitivität, Spezifität, PPV, NPV, Accuracy und AUC für Avocado Sign (AS) und für die Zielmetrik {BF_METRIC_NAME} optimierte T2-Kriterien im Direkt-OP-Kollektiv.',
                legendEn: 'Bar chart of sensitivity, specificity, PPV, NPV, accuracy, and AUC for Avocado Sign (AS) and T2 criteria optimized for the target metric {BF_METRIC_NAME} in the upfront surgery cohort.'
            }),
            vergleichPerformanceChartnRCT: Object.freeze({ // Radiology Figure (e.g., Figure 3C)
                id: 'pub-chart-vergleich-nrct',
                radiologyLabel: 'Figure 3C',
                titleDe: 'Vergleichsmetriken (nRCT): AS vs. optimierte T2 ({BF_METRIC_NAME})',
                titleEn: 'Comparative Metrics (nCRT): AS vs. Optimized T2 ({BF_METRIC_NAME})',
                legendDe: 'Balkendiagramm der Sensitivität, Spezifität, PPV, NPV, Accuracy und AUC für Avocado Sign (AS) und für die Zielmetrik {BF_METRIC_NAME} optimierte T2-Kriterien im nRCT-Kollektiv.',
                legendEn: 'Bar chart of sensitivity, specificity, PPV, NPV, accuracy, and AUC for Avocado Sign (AS) and T2 criteria optimized for the target metric {BF_METRIC_NAME} in the nCRT cohort.'
            })
        })
    }),
    // Used by radiology_formatter.js and text generators to manage abbreviations.
    // The list itself will be dynamically populated based on usage in the text.
    // Max 10 abbreviations, each used at least 10 times in main text.
    // Common imaging modalities (CT, MRI, US, PET, SPECT) are not abbreviated in the list.
    managedAbbreviations: Object.freeze({
        // Example: 'AS': { fullText: 'Avocado Sign', abstractDefined: false, mainTextDefined: false, count: 0 }
        // This will be populated dynamically.
    })
});

