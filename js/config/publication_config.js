const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'abstract',
    sections: Object.freeze([
        Object.freeze({
            id: 'abstract',
            labelKey: 'abstract',
            subSections: Object.freeze([
                Object.freeze({ id: 'abstract_content', label: 'Abstrakt / Summary' })
            ])
        }),
        Object.freeze({
            id: 'einleitung',
            labelKey: 'einleitung',
            subSections: Object.freeze([
                Object.freeze({ id: 'einleitung_content', label: 'Einführung und Zielsetzung' })
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
                Object.freeze({ id: 'diskussion_content', label: 'Diskussion der Ergebnisse' })
            ])
        }),
        Object.freeze({
            id: 'referenzen',
            labelKey: 'referenzen',
            subSections: Object.freeze([
                Object.freeze({ id: 'referenzen_content', label: 'Literaturverzeichnis' })
            ])
        })
    ]),
    literatureCriteriaSets: Object.freeze([
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            nameKey: 'Rutegård et al. (2025) / ESGAR 2016',
            shortName: 'ESGAR 2016'
        }),
        Object.freeze({
            id: 'koh_2008_morphology',
            nameKey: 'Koh et al. (2008)',
            shortName: 'Koh et al.'
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            nameKey: 'Barbaro et al. (2024)',
            shortName: 'Barbaro et al.'
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
            literaturT2KriterienUebersichtTabelle: { // War literaturT2KriterienTabelle, präziser benannt
                id: 'pub-table-literatur-t2-kriterien-uebersicht',
                titleDe: 'Übersicht der implementierten Literatur-basierten T2-Kriteriensets',
                titleEn: 'Overview of Implemented Literature-Based T2 Criteria Sets'
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-patienten-charakteristika', // Beibehaltung der ID für Konsistenz mit bestehendem Code
                titleDe: 'Patientencharakteristika',
                titleEn: 'Patient Characteristics'
            },
            alterVerteilungChart: {
                id: 'pub-chart-alter-Gesamt', // Wird für Gesamtkollektiv verwendet
                titleDe: 'Altersverteilung ({Kollektiv})',
                titleEn: 'Age Distribution ({Kollektiv})'
            },
            geschlechtVerteilungChart: {
                id: 'pub-chart-gender-Gesamt', // Wird für Gesamtkollektiv verwendet
                titleDe: 'Geschlechterverteilung ({Kollektiv})',
                titleEn: 'Gender Distribution ({Kollektiv})'
            },
            performanceMetrikenTabelle: { // Neue generische Tabelle für Performance-Metriken
                idPrefix: 'pub-table-perf-metrics', // z.B. pub-table-perf-metrics-AS-Gesamt
                titleDe: 'Diagnostische Güte: {Methode} (vs. N) im Kollektiv {Kollektiv}',
                titleEn: 'Diagnostic Performance: {Methode} (vs. N) in {Kollektiv} Cohort'
            },
            statistischerVergleichTabelle: { // Neue generische Tabelle für Vergleiche
                idPrefix: 'pub-table-stat-vergleich', // z.B. pub-table-stat-vergleich-AS-vs-Koh-Gesamt
                titleDe: 'Statistischer Vergleich: {Methode1} vs. {Methode2} im Kollektiv {Kollektiv}',
                titleEn: 'Statistical Comparison: {Methode1} vs. {Methode2} in {Kollektiv} Cohort'
            },
            vergleichPerformanceBalkenChart: { // ID-Prefix für Balken-Charts, die Methoden vergleichen
                idPrefix: 'pub-chart-vergleich-perf', // z.B. pub-chart-vergleich-perf-Gesamt
                titleDe: 'Vergleichsmetriken für Kollektiv {Kollektiv} (AS vs. Optimiertes T2 vs. Ausgew. Literatur)',
                titleEn: 'Comparative Metrics for {Kollektiv} Cohort (AS vs. Optimized T2 vs. Selected Literature)'
            },
            vergleichROCChart: { // ID-Prefix für ROC-Vergleichs-Charts
                idPrefix: 'pub-chart-vergleich-roc', // z.B. pub-chart-vergleich-roc-Gesamt
                titleDe: 'Vergleich ROC-Kurven für Kollektiv {Kollektiv}',
                titleEn: 'Comparative ROC Curves for {Kollektiv} Cohort'
            }
        })
    })
});

if (typeof Object.freeze === 'function') {
    Object.freeze(PUBLICATION_CONFIG);
}
