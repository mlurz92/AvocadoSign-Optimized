const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'methoden',
    sections: Object.freeze([
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
            id: 'referenzen',
            labelKey: 'referenzen',
            subSections: Object.freeze([
                Object.freeze({ id: 'referenzen_liste', label: 'Literaturverzeichnis (Basis)' })
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
                titleDe: 'Tabelle 2: Übersicht der Literatur-basierten T2-Kriteriensets und deren Definitionen',
                titleEn: 'Table 2: Overview of Literature-Based T2 Criteria Sets and Their Definitions'
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-patienten-charakteristika',
                titleDe: 'Tabelle 1: Patientencharakteristika des Gesamtkollektivs und der Subgruppen',
                titleEn: 'Table 1: Patient Characteristics of the Overall Cohort and Subgroups'
            },
            diagnostischeGueteASTabelle: {
                id: 'pub-table-diagnostische-guete-as',
                titleDe: 'Tabelle 3: Diagnostische Güte des Avocado Signs (vs. N-Status)',
                titleEn: 'Table 3: Diagnostic Performance of the Avocado Sign (vs. N-Status)'
            },
            diagnostischeGueteLiteraturT2Tabelle: {
                id: 'pub-table-diagnostische-guete-literatur-t2',
                titleDe: 'Tabelle 4: Diagnostische Güte der Literatur-basierten T2-Kriterien (vs. N-Status)',
                titleEn: 'Table 4: Diagnostic Performance of Literature-Based T2 Criteria (vs. N-Status)'
            },
            diagnostischeGueteOptimierteT2Tabelle: {
                id: 'pub-table-diagnostische-guete-optimierte-t2',
                titleDe: 'Tabelle 5: Diagnostische Güte der für {BF_METRIC} optimierten T2-Kriterien (vs. N-Status)',
                titleEn: 'Table 5: Diagnostic Performance of T2 Criteria Optimized for {BF_METRIC} (vs. N-Status)'
            },
            statistischerVergleichAST2Tabelle: {
                id: 'pub-table-statistischer-vergleich-as-t2',
                titleDe: 'Tabelle 6: Statistischer Vergleich der diagnostischen Leistung: Avocado Sign vs. T2-Kriterien (Literatur und Optimiert)',
                titleEn: 'Table 6: Statistical Comparison of Diagnostic Performance: Avocado Sign vs. T2 Criteria (Literature and Optimized)'
            },
            alterVerteilungChart: {
                id: 'pub-chart-alter-Gesamt',
                titleDe: 'Abbildung 1a: Altersverteilung im Gesamtkollektiv',
                titleEn: 'Figure 1a: Age Distribution in the Overall Cohort'
            },
            geschlechtVerteilungChart: {
                id: 'pub-chart-gender-Gesamt',
                titleDe: 'Abbildung 1b: Geschlechterverteilung im Gesamtkollektiv',
                titleEn: 'Figure 1b: Gender Distribution in the Overall Cohort'
            },
            vergleichPerformanceChartGesamt: {
                id: 'pub-chart-vergleich-Gesamt',
                titleDe: 'Abbildung 2a: Vergleichsmetriken für das Gesamtkollektiv (AS vs. Optimiertes T2)',
                titleEn: 'Figure 2a: Comparative Metrics for the Overall Cohort (AS vs. Optimized T2)'
            },
            vergleichPerformanceChartDirektOP: {
                id: 'pub-chart-vergleich-direkt-OP',
                titleDe: 'Abbildung 2b: Vergleichsmetriken für das Direkt-OP Kollektiv (AS vs. Optimiertes T2)',
                titleEn: 'Figure 2b: Comparative Metrics for the Upfront Surgery Cohort (AS vs. Optimized T2)'
            },
            vergleichPerformanceChartNRCT: {
                id: 'pub-chart-vergleich-nRCT',
                titleDe: 'Abbildung 2c: Vergleichsmetriken für das nRCT Kollektiv (AS vs. Optimiertes T2)',
                titleEn: 'Figure 2c: Comparative Metrics for the nRCT Cohort (AS vs. Optimized T2)'
            }
        })
    })
});

if (typeof Object.freeze === 'function') {
    Object.freeze(PUBLICATION_CONFIG);
}
