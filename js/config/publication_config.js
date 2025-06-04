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
                 Object.freeze({ id: 'referenzen', label: 'Referenzliste' })
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
                titleDe: 'Tabelle 2: Übersicht der Literatur-basierten T2-Kriteriensets',
                titleEn: 'Table 2: Overview of Literature-Based T2 Criteria Sets',
                referenceLabel: 'Tabelle 2'
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-patienten-charakteristika',
                titleDe: 'Tabelle 1: Patientencharakteristika',
                titleEn: 'Table 1: Patient Characteristics',
                referenceLabel: 'Tabelle 1'
            },
            diagnostischeGueteASTabelle: {
                id: 'pub-table-diagnostische-guete-as',
                titleDe: 'Tabelle 3: Diagnostische Güte des Avocado Signs (vs. N-Status)',
                titleEn: 'Table 3: Diagnostic Performance of the Avocado Sign (vs. N-Status)',
                referenceLabel: 'Tabelle 3'
            },
            diagnostischeGueteLiteraturT2Tabelle: {
                id: 'pub-table-diagnostische-guete-literatur-t2',
                titleDe: 'Tabelle 4: Diagnostische Güte der Literatur-basierten T2-Kriterien (vs. N-Status)',
                titleEn: 'Table 4: Diagnostic Performance of Literature-Based T2 Criteria (vs. N-Status)',
                referenceLabel: 'Tabelle 4'
            },
            diagnostischeGueteOptimierteT2Tabelle: {
                id: 'pub-table-diagnostische-guete-optimierte-t2',
                titleDe: 'Tabelle 5: Diagnostische Güte der für {BF_METRIC} optimierten T2-Kriterien (vs. N-Status)',
                titleEn: 'Table 5: Diagnostic Performance of T2 Criteria Optimized for {BF_METRIC} (vs. N-Status)',
                referenceLabel: 'Tabelle 5'
            },
            statistischerVergleichAST2Tabelle: {
                id: 'pub-table-statistischer-vergleich-as-t2',
                titleDe: 'Tabelle 6: Statistischer Vergleich der diagnostischen Güte: Avocado Sign vs. T2-Kriteriensets',
                titleEn: 'Table 6: Statistical Comparison of Diagnostic Performance: Avocado Sign vs. T2 Criteria Sets',
                referenceLabel: 'Tabelle 6'
            },
            alterVerteilungChart: {
                id: 'pub-chart-alter-Gesamt',
                titleDe: 'Altersverteilung (Gesamtkollektiv)',
                titleEn: 'Age Distribution (Overall Cohort)',
                referenceLabelDe: 'Abbildung 1a',
                referenceLabelEn: 'Figure 1a'
            },
            geschlechtVerteilungChart: {
                id: 'pub-chart-gender-Gesamt',
                titleDe: 'Geschlechterverteilung (Gesamtkollektiv)',
                titleEn: 'Gender Distribution (Overall Cohort)',
                referenceLabelDe: 'Abbildung 1b',
                referenceLabelEn: 'Figure 1b'
            },
            vergleichPerformanceChartGesamt: {
                id: 'pub-chart-vergleich-Gesamt',
                titleDe: 'Vergleichsmetriken für Gesamtkollektiv (AS vs. optimierte T2-Kriterien)',
                titleEn: 'Comparative Metrics for Overall Cohort (AS vs. Optimized T2 Criteria)',
                referenceLabelDe: 'Abbildung 2a',
                referenceLabelEn: 'Figure 2a'
            },
            vergleichPerformanceChartDirektOP: {
                id: 'pub-chart-vergleich-direkt-OP',
                titleDe: 'Vergleichsmetriken für Direkt-OP Kollektiv (AS vs. optimierte T2-Kriterien)',
                titleEn: 'Comparative Metrics for Upfront Surgery Cohort (AS vs. Optimized T2 Criteria)',
                referenceLabelDe: 'Abbildung 2b',
                referenceLabelEn: 'Figure 2b'
            },
            vergleichPerformanceChartNRCT: {
                id: 'pub-chart-vergleich-nRCT',
                titleDe: 'Vergleichsmetriken für nRCT Kollektiv (AS vs. optimierte T2-Kriterien)',
                titleEn: 'Comparative Metrics for nRCT Cohort (AS vs. Optimized T2 Criteria)',
                referenceLabelDe: 'Abbildung 2c',
                referenceLabelEn: 'Figure 2c'
            }
        })
    })
});

// Exportiere PUBLICATION_CONFIG global
window.PUBLICATION_CONFIG = PUBLICATION_CONFIG;
