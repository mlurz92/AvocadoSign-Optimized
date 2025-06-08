const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'abstract',
    defaultBruteForceMetricForPublication: 'Balanced Accuracy',

    sections: Object.freeze([
        Object.freeze({
            id: 'abstract',
            labelKey: 'abstract',
            subSections: Object.freeze([
                Object.freeze({ id: 'abstract_main', label: 'Abstract & Key Results' })
            ])
        }),
        Object.freeze({
            id: 'introduction',
            labelKey: 'introduction',
            subSections: Object.freeze([
                Object.freeze({ id: 'introduction_main', label: 'Einleitung' })
            ])
        }),
        Object.freeze({
            id: 'methoden',
            labelKey: 'methoden',
            subSections: Object.freeze([
                Object.freeze({ id: 'methoden_studienanlage_ethik', label: 'Studiendesign und Ethikvotum' }),
                Object.freeze({ id: 'methoden_patientenkohorte', label: 'Patientenkohorte und Einschlusskriterien' }),
                Object.freeze({ id: 'methoden_mrt_protokoll_akquisition', label: 'MRT-Protokoll und Bildakquisition' }),
                Object.freeze({ id: 'methoden_bildanalyse_avocado_sign', label: 'Bildanalyse: Avocado Sign' }),
                Object.freeze({ id: 'methoden_bildanalyse_t2_kriterien', label: 'Bildanalyse: T2-gewichtete Kriterien' }),
                Object.freeze({ id: 'methoden_referenzstandard_histopathologie', label: 'Referenzstandard: Histopathologie' }),
                Object.freeze({ id: 'methoden_statistische_analyse_methoden', label: 'Statistische Analyse' })
            ])
        }),
        Object.freeze({
            id: 'ergebnisse',
            labelKey: 'ergebnisse',
            subSections: Object.freeze([
                Object.freeze({ id: 'ergebnisse_patientencharakteristika', label: 'Patientencharakteristika und Datenfluss' }),
                Object.freeze({ id: 'ergebnisse_as_diagnostische_guete', label: 'Diagnostische Güte: Avocado Sign' }),
                Object.freeze({ id: 'ergebnisse_t2_literatur_diagnostische_guete', label: 'Diagnostische Güte: T2-Kriterien (Literatur)' }),
                Object.freeze({ id: 'ergebnisse_t2_optimiert_diagnostische_guete', label: 'Diagnostische Güte: T2-Kriterien (Brute-Force optimiert)' }),
                Object.freeze({ id: 'ergebnisse_vergleich_as_vs_t2', label: 'Vergleichsanalysen: Avocado Sign vs. T2-Kriterien' })
            ])
        }),
        Object.freeze({
            id: 'discussion',
            labelKey: 'discussion',
            subSections: Object.freeze([
                Object.freeze({ id: 'discussion_main', label: 'Diskussion der Ergebnisse und Limitationen' })
            ])
        }),
        Object.freeze({
            id: 'references',
            labelKey: 'references',
            subSections: Object.freeze([
                Object.freeze({ id: 'references_main', label: 'Literaturverzeichnis' })
            ])
        })
    ]),

    literatureCriteriaSets: Object.freeze([
        Object.freeze({
            id: 'koh_2008_morphology',
            labelKey: 'Koh et al. (2008)'
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            labelKey: 'Barbaro et al. (2024)'
        }),
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            labelKey: 'Rutegård et al. (2025) / ESGAR 2016'
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
        methoden: Object.freeze({
            literaturT2KriterienTabelle: {
                id: 'pub-table-methods-1-literatur-kriterien',
                titleDe: 'Übersicht der evaluierten Literatur-basierten T2-Kriteriensets',
                titleEn: 'Overview of Evaluated Literature-Based T2 Criteria Sets'
            },
            flowDiagram: {
                id: 'pub-figure-methods-1-flow-diagram',
                titleDe: 'Flussdiagramm der Patientenrekrutierung und -analyse',
                titleEn: 'Patient Recruitment and Analysis Flowchart'
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-results-1-patienten-charakteristika',
                titleDe: 'Baseline Patientencharakteristika und klinische Daten',
                titleEn: 'Baseline Patient Characteristics and Clinical Data'
            },
            diagnostischeGueteASTabelle: {
                id: 'pub-table-results-2-guete-as',
                titleDe: 'Diagnostische Güte des Avocado Signs für die Prädiktion des N-Status',
                titleEn: 'Diagnostic Performance of the Avocado Sign for N-Status Prediction'
            },
            diagnostischeGueteLiteraturT2Tabelle: {
                id: 'pub-table-results-3-guete-literatur-t2',
                titleDe: 'Diagnostische Güte der Literatur-basierten T2-Kriterien für die Prädiktion des N-Status',
                titleEn: 'Diagnostic Performance of Literature-Based T2 Criteria for N-Status Prediction'
            },
            diagnostischeGueteOptimierteT2Tabelle: {
                id: 'pub-table-results-4-guete-optimiert-t2',
                titleDe: 'Diagnostische Güte der datengetriebenen T2-Kriterien (optimiert für {BF_METRIC}) für die Prädiktion des N-Status',
                titleEn: 'Diagnostic Performance of Data-Driven T2 Criteria (Optimized for {BF_METRIC}) for N-Status Prediction'
            },
            statistischerVergleichAST2Tabelle: {
                id: 'pub-table-results-5-vergleich-as-vs-t2',
                titleDe: 'Statistischer Vergleich der diagnostischen Leistung: Avocado Sign vs. T2-Kriterien',
                titleEn: 'Statistical Comparison of Diagnostic Performance: Avocado Sign vs. T2 Criteria'
            },
            alterVerteilungChart: {
                id: 'pub-figure-results-1a-alter-verteilung',
                titleDe: 'Altersverteilung im Gesamtkollektiv',
                titleEn: 'Age Distribution in the Overall Cohort'
            },
            geschlechtVerteilungChart: {
                id: 'pub-figure-results-1b-geschlecht-verteilung',
                titleDe: 'Geschlechterverteilung im Gesamtkollektiv',
                titleEn: 'Gender Distribution in the Overall Cohort'
            },
            vergleichPerformanceChartGesamt: {
                id: 'pub-figure-results-2a-vergleich-gesamt',
                titleDe: 'Vergleichsmetriken: Gesamtkollektiv',
                titleEn: 'Comparative Metrics: Overall Cohort'
            },
            vergleichPerformanceChartdirektOP: {
                id: 'pub-figure-results-2b-vergleich-direkt-op',
                titleDe: 'Vergleichsmetriken: Direkt-OP-Kollektiv',
                titleEn: 'Comparative Metrics: Upfront Surgery Cohort'
            },
            vergleichPerformanceChartnRCT: {
                id: 'pub-figure-results-2c-vergleich-nrct',
                titleDe: 'Vergleichsmetriken: nRCT-Kollektiv',
                titleEn: 'Comparative Metrics: nRCT Cohort'
            }
        })
    })
});
