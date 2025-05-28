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
                titleDe: 'Übersicht der Literatur-basierten T2-Kriteriensets',
                titleEn: 'Overview of Literature-Based T2 Criteria Sets'
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-patienten-charakteristika',
                titleDe: 'Patientencharakteristika',
                titleEn: 'Patient Characteristics'
            },
            diagnostischeGueteASTabelle: { // Hinzugefügt für Tabelle 3
                id: 'pub-table-diagnostische-guete-as',
                titleDe: 'Diagnostische Güte: Avocado Sign (vs. N-Status)',
                titleEn: 'Diagnostic Performance: Avocado Sign (vs. N-Status)'
            },
            diagnostischeGueteLiteraturT2Tabelle: { // Hinzugefügt für Tabelle 4
                id: 'pub-table-diagnostische-guete-literatur-t2',
                titleDe: 'Diagnostische Güte: Literatur-basierte T2-Kriterien (vs. N-Status)',
                titleEn: 'Diagnostic Performance: Literature-Based T2 Criteria (vs. N-Status)'
            },
            diagnostischeGueteOptimierteT2Tabelle: { // Hinzugefügt für Tabelle 5
                id: 'pub-table-diagnostische-guete-optimierte-t2',
                titleDe: 'Diagnostische Güte: Optimierte T2-Kriterien (Ziel: {BF_METRIC}, vs. N-Status)',
                titleEn: 'Diagnostic Performance: Optimized T2 Criteria (Target: {BF_METRIC}, vs. N-Status)'
            },
            statistischerVergleichAST2Tabelle: { // Hinzugefügt für Tabelle 6
                id: 'pub-table-statistischer-vergleich-as-t2',
                titleDe: 'Statistischer Vergleich: Avocado Sign vs. T2-Kriterien (Literatur und Optimiert)',
                titleEn: 'Statistical Comparison: Avocado Sign vs. T2 Criteria (Literature and Optimized)'
            },
            alterVerteilungChart: { // Hinzugefügt für Abbildung 1a
                id: 'pub-chart-alter-Gesamt',
                titleDe: 'Altersverteilung (Gesamtkollektiv)',
                titleEn: 'Age Distribution (Overall Cohort)'
            },
            geschlechtVerteilungChart: { // Hinzugefügt für Abbildung 1b
                id: 'pub-chart-gender-Gesamt',
                titleDe: 'Geschlechterverteilung (Gesamtkollektiv)',
                titleEn: 'Gender Distribution (Overall Cohort)'
            },
            vergleichPerformanceChartGesamt: { // Hinzugefügt für Abbildung 2a
                id: 'pub-chart-vergleich-Gesamt',
                titleDe: 'Vergleichsmetriken für Gesamtkollektiv',
                titleEn: 'Comparative Metrics for Overall Cohort'
            },
            vergleichPerformanceChartDirektOP: { // Hinzugefügt für Abbildung 2b
                id: 'pub-chart-vergleich-direkt-OP',
                titleDe: 'Vergleichsmetriken für Direkt-OP Kollektiv',
                titleEn: 'Comparative Metrics for Upfront Surgery Cohort'
            },
            vergleichPerformanceChartNRCT: { // Hinzugefügt für Abbildung 2c
                id: 'pub-chart-vergleich-nRCT',
                titleDe: 'Vergleichsmetriken für nRCT Kollektiv',
                titleEn: 'Comparative Metrics for nRCT Cohort'
            }
        })
    })
});

if (typeof Object.freeze === 'function') {
    Object.freeze(PUBLICATION_CONFIG);
}
