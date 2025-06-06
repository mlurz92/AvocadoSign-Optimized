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
        Object.freeze({ value: 'Balanced Accuracy', label: 'Balanced Accuracy' }),
        Object.freeze({ value: 'Accuracy', label: 'Accuracy' }),
        Object.freeze({ value: 'F1-Score', label: 'F1-Score' }),
        Object.freeze({ value: 'PPV', label: 'Positiver Prädiktiver Wert (PPV)' }),
        Object.freeze({ value: 'NPV', label: 'Negativer Prädiktiver Wert (NPV)' })
    ]),

    publicationElements: Object.freeze({
        methoden: Object.freeze({
            literaturT2KriterienTabelle: Object.freeze({
                id: 'pub-table-literatur-t2-kriterien',
                titleDe: 'Tabelle Methoden 1: Übersicht der evaluierten Literatur-basierten T2-Kriteriensets',
                titleEn: 'Methods Table 1: Overview of Evaluated Literature-Based T2 Criteria Sets',
                referenceInTextDe: 'Tabelle Methoden 1',
                referenceInTextEn: 'Methods Table 1'
            }),
            flowDiagram: Object.freeze({
                id: 'pub-figure-flow-diagram',
                titleDe: 'Abbildung Methoden 1: Flussdiagramm der Patientenrekrutierung und -analyse',
                titleEn: 'Methods Figure 1: Patient Recruitment and Analysis Flowchart',
                referenceInTextDe: 'Abbildung Methoden 1',
                referenceInTextEn: 'Methods Figure 1'
            })
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: Object.freeze({
                id: 'pub-table-patienten-charakteristika',
                titleDe: 'Tabelle Ergebnisse 1: Baseline Patientencharakteristika und klinische Daten',
                titleEn: 'Results Table 1: Baseline Patient Characteristics and Clinical Data',
                referenceInTextDe: 'Tabelle Ergebnisse 1',
                referenceInTextEn: 'Results Table 1'
            }),
            diagnostischeGueteASTabelle: Object.freeze({
                id: 'pub-table-diagnostische-guete-as',
                titleDe: 'Tabelle Ergebnisse 2: Diagnostische Güte des Avocado Signs für die Prädiktion des N-Status',
                titleEn: 'Results Table 2: Diagnostic Performance of the Avocado Sign for N-Status Prediction',
                referenceInTextDe: 'Tabelle Ergebnisse 2',
                referenceInTextEn: 'Results Table 2'
            }),
            diagnostischeGueteLiteraturT2Tabelle: Object.freeze({
                id: 'pub-table-diagnostische-guete-literatur-t2',
                titleDe: 'Tabelle Ergebnisse 3: Diagnostische Güte der Literatur-basierten T2-Kriterien für die Prädiktion des N-Status',
                titleEn: 'Results Table 3: Diagnostic Performance of Literature-Based T2 Criteria for N-Status Prediction',
                referenceInTextDe: 'Tabelle Ergebnisse 3',
                referenceInTextEn: 'Results Table 3'
            }),
            diagnostischeGueteOptimierteT2Tabelle: Object.freeze({
                id: 'pub-table-diagnostische-guete-optimierte-t2',
                titleDe: 'Tabelle Ergebnisse 4: Diagnostische Güte der Brute-Force optimierten T2-Kriterien (Ziel: {BF_METRIC}) für die Prädiktion des N-Status',
                titleEn: 'Results Table 4: Diagnostic Performance of Brute-Force Optimized T2 Criteria (Target: {BF_METRIC}) for N-Status Prediction',
                referenceInTextDe: 'Tabelle Ergebnisse 4',
                referenceInTextEn: 'Results Table 4'
            }),
            statistischerVergleichAST2Tabelle: Object.freeze({
                id: 'pub-table-statistischer-vergleich-as-t2',
                titleDe: 'Tabelle Ergebnisse 5: Statistischer Vergleich der diagnostischen Güte: Avocado Sign vs. T2-Kriterien (Literatur und Optimiert)',
                titleEn: 'Results Table 5: Statistical Comparison of Diagnostic Performance: Avocado Sign vs. T2 Criteria (Literature and Optimized)',
                referenceInTextDe: 'Tabelle Ergebnisse 5',
                referenceInTextEn: 'Results Table 5'
            }),
            alterVerteilungChart: Object.freeze({
                id: 'pub-chart-alter-Gesamt',
                titleDe: 'Abbildung Ergebnisse 1a: Altersverteilung im Gesamtkollektiv',
                titleEn: 'Results Figure 1a: Age Distribution in the Overall Cohort',
                referenceInTextDe: 'Abbildung Ergebnisse 1a',
                referenceInTextEn: 'Results Figure 1a'
            }),
            geschlechtVerteilungChart: Object.freeze({
                id: 'pub-chart-gender-Gesamt',
                titleDe: 'Abbildung Ergebnisse 1b: Geschlechterverteilung im Gesamtkollektiv',
                titleEn: 'Results Figure 1b: Gender Distribution in the Overall Cohort',
                referenceInTextDe: 'Abbildung Ergebnisse 1b',
                referenceInTextEn: 'Results Figure 1b'
            }),
            vergleichPerformanceChartGesamt: Object.freeze({
                id: 'pub-chart-vergleich-Gesamt',
                titleDe: 'Abbildung Ergebnisse 2a: Vergleichsmetriken für das Gesamtkollektiv: AS vs. optimierte T2-Kriterien',
                titleEn: 'Results Figure 2a: Comparative Metrics for the Overall Cohort: AS vs. Optimized T2 Criteria',
                referenceInTextDe: 'Abbildung Ergebnisse 2a',
                referenceInTextEn: 'Results Figure 2a'
            }),
            vergleichPerformanceChartdirektOP: Object.freeze({
                id: 'pub-chart-vergleich-direkt-OP',
                titleDe: 'Abbildung Ergebnisse 2b: Vergleichsmetriken für das Direkt-OP Kollektiv: AS vs. optimierte T2-Kriterien',
                titleEn: 'Results Figure 2b: Comparative Metrics for the Upfront Surgery Cohort: AS vs. Optimized T2 Criteria',
                referenceInTextDe: 'Abbildung Ergebnisse 2b',
                referenceInTextEn: 'Results Figure 2b'
            }),
            vergleichPerformanceChartnRCT: Object.freeze({
                id: 'pub-chart-vergleich-nRCT',
                titleDe: 'Abbildung Ergebnisse 2c: Vergleichsmetriken für das nRCT Kollektiv: AS vs. optimierte T2-Kriterien',
                titleEn: 'Results Figure 2c: Comparative Metrics for the nRCT Cohort: AS vs. Optimized T2 Criteria',
                referenceInTextDe: 'Abbildung Ergebnisse 2c',
                referenceInTextEn: 'Results Figure 2c'
            })
        })
    })
});
