const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'abstract', // Initialer Abschnitt, der beim Öffnen des Tabs angezeigt wird
    sections: Object.freeze([
        Object.freeze({
            id: 'abstract',
            labelKey: 'abstract', // Label für den Hauptabschnitt
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
                Object.freeze({ id: 'discussion_main', label: 'Diskussion' })
            ])
        }),
        Object.freeze({
            id: 'references',
            labelKey: 'references',
            subSections: Object.freeze([
                Object.freeze({ id: 'references_main', label: 'Referenzen' })
            ])
        })
    ]),
    // Liste der Literatur-Kriteriensets, die in der Publikation erwähnt/verglichen werden
    literatureCriteriaSets: Object.freeze([
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            labelKey: 'Rutegård et al. (2025) / ESGAR 2016' // Name, der im Publikationstext/Tabellen verwendet wird
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
    // Verfügbare Brute-Force-Metriken für die Auswahl im Publikationstab
    bruteForceMetricsForPublication: Object.freeze([
        { value: 'Balanced Accuracy', label: 'Balanced Accuracy' },
        { value: 'Accuracy', label: 'Accuracy' },
        { value: 'F1-Score', label: 'F1-Score' },
        { value: 'PPV', label: 'Positiver Prädiktiver Wert (PPV)' },
        { value: 'NPV', label: 'Negativer Prädiktiver Wert (NPV)' }
    ]),
    defaultBruteForceMetricForPublication: 'Balanced Accuracy', // Standard-Metrik für die Publikationstexte

    // IDs und Titel von Elementen (Tabellen, Figuren), die im Publikationstab referenziert werden
    publicationElements: Object.freeze({
        methoden: Object.freeze({
            literaturT2KriterienTabelle: {
                id: 'pub-table-literatur-t2-kriterien',
                titleDe: 'Übersicht der evaluierten Literatur-basierten T2-Kriteriensets',
                titleEn: 'Overview of Evaluated Literature-Based T2 Criteria Sets'
            },
            flowDiagram: {
                id: 'pub-figure-flow-diagram',
                titleDe: 'Flussdiagramm der Patientenrekrutierung und -analyse',
                titleEn: 'Patient Recruitment and Analysis Flowchart'
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-patienten-charakteristika',
                titleDe: 'Baseline Patientencharakteristika und klinische Daten',
                titleEn: 'Baseline Patient Characteristics and Clinical Data'
            },
            diagnostischeGueteASTabelle: {
                id: 'pub-table-diagnostische-guete-as',
                titleDe: 'Diagnostische Güte des Avocado Signs für die Prädiktion des N-Status',
                titleEn: 'Diagnostic Performance of the Avocado Sign for N-Status Prediction'
            },
            diagnostischeGueteLiteraturT2Tabelle: {
                id: 'pub-table-diagnostische-guete-literatur-t2',
                titleDe: 'Diagnostische Güte der Literatur-basierten T2-Kriterien für die Prädiktion des N-Status',
                titleEn: 'Diagnostic Performance of Literature-Based T2 Criteria for N-Status Prediction'
            },
            diagnostischeGueteOptimierteT2Tabelle: {
                id: 'pub-table-diagnostische-guete-optimierte-t2',
                titleDe: 'Diagnostische Güte der Brute-Force optimierten T2-Kriterien (Ziel: {BF_METRIC}) für die Prädiktion des N-Status',
                titleEn: 'Diagnostic Performance of Brute-Force Optimized T2 Criteria (Target: {BF_METRIC}) for N-Status Prediction'
            },
            statistischerVergleichAST2Tabelle: {
                id: 'pub-table-statistischer-vergleich-as-t2',
                titleDe: 'Statistischer Vergleich der diagnostischen Güte: Avocado Sign vs. T2-Kriterien (Literatur und Optimiert)',
                titleEn: 'Statistical Comparison of Diagnostic Performance: Avocado Sign vs. T2 Criteria (Literature and Optimized)'
            },
            alterVerteilungChart: {
                id: 'pub-chart-alter-Gesamt', // Eindeutige ID für Chart-Container
                titleDe: 'Altersverteilung im Gesamtkollektiv',
                titleEn: 'Age Distribution in the Overall Cohort'
            },
            geschlechtVerteilungChart: {
                id: 'pub-chart-gender-Gesamt', // Eindeutige ID für Chart-Container
                titleDe: 'Geschlechterverteilung im Gesamtkollektiv',
                titleEn: 'Gender Distribution in the Overall Cohort'
            },
            vergleichPerformanceChartGesamt: {
                id: 'pub-chart-vergleich-Gesamt',
                titleDe: 'Vergleichsmetriken für das Gesamtkollektiv: AS vs. optimierte T2-Kriterien',
                titleEn: 'Comparative Metrics for the Overall Cohort: AS vs. Optimized T2 Criteria'
            },
            vergleichPerformanceChartdirektOP: {
                id: 'pub-chart-vergleich-direkt-OP',
                titleDe: 'Vergleichsmetriken für das Direkt-OP Kollektiv: AS vs. optimierte T2-Kriterien',
                titleEn: 'Comparative Metrics for the Upfront Surgery Cohort: AS vs. Optimized T2 Criteria'
            },
            vergleichPerformanceChartnRCT: {
                id: 'pub-chart-vergleich-nRCT',
                titleDe: 'Vergleichsmetriken für das nRCT Kollektiv: AS vs. optimierte T2-Kriterien',
                titleEn: 'Comparative Metrics for the nRCT Cohort: AS vs. Optimized T2 Criteria'
            }
        })
    })
});

// Die getDefaultT2Criteria Funktion wird nicht in dieser Datei definiert,
// da sie in app_config.js liegt und global verfügbar ist.
