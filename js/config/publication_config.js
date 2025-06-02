const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'methoden',
    sections: Object.freeze([
        Object.freeze({
            id: 'einleitung',
            labelKey: 'einleitung',
            subSections: Object.freeze([
                Object.freeze({ id: 'einleitung_hintergrund', label: 'Hintergrund und Problemstellung' }),
                Object.freeze({ id: 'einleitung_zielsetzung', label: 'Zielsetzung der Studie' })
            ])
        }),
        Object.freeze({
            id: 'methoden',
            labelKey: 'methoden',
            subSections: Object.freeze([
                Object.freeze({ id: 'methoden_studienanlage', label: 'Studiendesign und Ethik' }),
                Object.freeze({ id: 'methoden_patientenkollektiv', label: 'Patientenkollektiv' }),
                Object.freeze({ id: 'methoden_mrt_protokoll', label: 'MRT-Protokoll & Kontrastmittelgabe' }),
                Object.freeze({ id: 'methoden_as_definition', label: 'Definition & Bewertung Avocado Sign' }),
                Object.freeze({ id: 'methoden_t2_definition', label: 'Definition & Bewertung T2-Kriterien' }),
                Object.freeze({ id: 'methoden_referenzstandard', label: 'Referenzstandard (Histopathologie)' }),
                Object.freeze({ id: 'methoden_statistische_analyse', label: 'Statistische Analyse' })
            ])
        }),
        Object.freeze({
            id: 'ergebnisse',
            labelKey: 'ergebnisse',
            subSections: Object.freeze([
                Object.freeze({ id: 'ergebnisse_patientencharakteristika', label: 'Patientencharakteristika' }),
                Object.freeze({ id: 'ergebnisse_as_performance', label: 'Diagnostische Güte: Avocado Sign' }),
                Object.freeze({ id: 'ergebnisse_literatur_t2_performance', label: 'Diagnostische Güte: Literatur-T2-Kriterien' }),
                Object.freeze({ id: 'ergebnisse_optimierte_t2_performance', label: 'Diagnostische Güte: Optimierte T2-Kriterien (Brute-Force)' }),
                Object.freeze({ id: 'ergebnisse_vergleich_performance', label: 'Vergleich: AS vs. T2-Kriterien' })
            ])
        }),
        Object.freeze({
            id: 'diskussion',
            labelKey: 'diskussion',
            subSections: Object.freeze([
                Object.freeze({ id: 'diskussion_hauptergebnisse', label: 'Diskussion der Hauptergebnisse' }),
                Object.freeze({ id: 'diskussion_as_vs_t2', label: 'Vergleich AS vs. T2-Kriterien im Kontext' }),
                Object.freeze({ id: 'diskussion_limitationen', label: 'Limitationen der Studie' }),
                Object.freeze({ id: 'diskussion_ausblick', label: 'Ausblick und zukünftige Forschung' }),
                Object.freeze({ id: 'diskussion_schlussfolgerung', label: 'Schlussfolgerung' })
            ])
        }),
        Object.freeze({
            id: 'abstract',
            labelKey: 'abstract',
            subSections: Object.freeze([
                Object.freeze({ id: 'abstract_text', label: 'Abstract' })
            ])
        }),
        Object.freeze({
            id: 'referenzen',
            labelKey: 'referenzen',
            subSections: Object.freeze([
                Object.freeze({ id: 'referenzen_liste', label: 'Referenzliste' })
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
    defaultBruteForceMetricForPublication: 'Balanced Accuracy',
    publicationElements: Object.freeze({
        methoden: Object.freeze({
            literaturT2KriterienTabelle: {
                id: 'pub-table-literatur-t2-kriterien',
                titleDe: 'Übersicht der Literatur-basierten T2-Kriteriensets (Tabelle 2)',
                titleEn: 'Overview of Literature-Based T2 Criteria Sets (Table 2)'
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-patienten-charakteristika',
                titleDe: 'Patientencharakteristika (Tabelle 1)',
                titleEn: 'Patient Characteristics (Table 1)'
            },
            diagnostischeGueteASTabelle: {
                id: 'pub-table-diagnostische-guete-as',
                titleDe: 'Diagnostische Güte: Avocado Sign vs. N-Status (Tabelle 3)',
                titleEn: 'Diagnostic Performance: Avocado Sign vs. N-Status (Table 3)'
            },
            diagnostischeGueteLiteraturT2Tabelle: {
                id: 'pub-table-diagnostische-guete-literatur-t2',
                titleDe: 'Diagnostische Güte: Literatur-basierte T2-Kriterien vs. N-Status (Tabelle 4)',
                titleEn: 'Diagnostic Performance: Literature-Based T2 Criteria vs. N-Status (Table 4)'
            },
            diagnostischeGueteOptimierteT2Tabelle: {
                id: 'pub-table-diagnostische-guete-optimierte-t2',
                titleDe: 'Diagnostische Güte: Optimierte T2-Kriterien (Ziel: {BF_METRIC}) vs. N-Status (Tabelle 5)',
                titleEn: 'Diagnostic Performance: Optimized T2 Criteria (Target: {BF_METRIC}) vs. N-Status (Table 5)'
            },
            statistischerVergleichAST2Tabelle: {
                id: 'pub-table-statistischer-vergleich-as-t2',
                titleDe: 'Statistischer Vergleich: Avocado Sign vs. T2-Kriterien (Literatur und Optimiert) (Tabelle 6)',
                titleEn: 'Statistical Comparison: Avocado Sign vs. T2 Criteria (Literature and Optimized) (Table 6)'
            },
            alterVerteilungChart: {
                id: 'pub-chart-alter-Gesamt',
                titleDe: 'Altersverteilung (Gesamtkollektiv) (Abbildung 1a)',
                titleEn: 'Age Distribution (Overall Cohort) (Figure 1a)'
            },
            geschlechtVerteilungChart: {
                id: 'pub-chart-gender-Gesamt',
                titleDe: 'Geschlechterverteilung (Gesamtkollektiv) (Abbildung 1b)',
                titleEn: 'Gender Distribution (Overall Cohort) (Figure 1b)'
            },
            vergleichPerformanceChartGesamt: {
                id: 'pub-chart-vergleich-Gesamt',
                titleDe: 'Vergleichsmetriken für Gesamtkollektiv (Abbildung 2a)',
                titleEn: 'Comparative Metrics for Overall Cohort (Figure 2a)'
            },
            vergleichPerformanceChartDirektOP: {
                id: 'pub-chart-vergleich-direkt-OP',
                titleDe: 'Vergleichsmetriken für Direkt-OP Kollektiv (Abbildung 2b)',
                titleEn: 'Comparative Metrics for Upfront Surgery Cohort (Figure 2b)'
            },
            vergleichPerformanceChartNRCT: {
                id: 'pub-chart-vergleich-nRCT',
                titleDe: 'Vergleichsmetriken für nRCT Kollektiv (Abbildung 2c)',
                titleEn: 'Comparative Metrics for nRCT Cohort (Figure 2c)'
            },
            rocCurveVergleichGesamtChart: {
                id: 'pub-chart-roc-vergleich-Gesamt',
                titleDe: 'ROC-Kurven Vergleich (Gesamtkollektiv) (Abbildung 3a)',
                titleEn: 'ROC Curve Comparison (Overall Cohort) (Figure 3a)'
            },
            rocCurveVergleichDirektOPChart: {
                id: 'pub-chart-roc-vergleich-direkt-OP',
                titleDe: 'ROC-Kurven Vergleich (Direkt-OP) (Abbildung 3b)',
                titleEn: 'ROC Curve Comparison (Upfront Surgery) (Figure 3b)'
            },
            rocCurveVergleichNRCTChart: {
                id: 'pub-chart-roc-vergleich-nRCT',
                titleDe: 'ROC-Kurven Vergleich (nRCT) (Abbildung 3c)',
                titleEn: 'ROC Curve Comparison (nRCT) (Figure 3c)'
            }
        })
    })
});

if (typeof Object.freeze === 'function') {
    Object.freeze(PUBLICATION_CONFIG);
}
