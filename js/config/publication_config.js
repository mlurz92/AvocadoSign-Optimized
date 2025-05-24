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
            literaturT2KriterienTabelle: Object.freeze({
                id: 'pub-table-literatur-t2-kriterien',
                titleDe: 'Tabelle 2: Übersicht der Literatur-basierten T2-Kriteriensets',
                titleEn: 'Table 2: Overview of Literature-Based T2 Criteria Sets'
            })
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: Object.freeze({
                id: 'pub-table-patienten-charakteristika',
                titleDe: 'Tabelle 1: Patientencharakteristika',
                titleEn: 'Table 1: Patient Characteristics'
            }),
            diagnostischeGueteASTabelle: Object.freeze({
                id: 'pub-table-diagnostische-guete-as',
                titleDe: 'Tabelle 3: Diagnostische Güte - Avocado Sign (vs. N-Status)',
                titleEn: 'Table 3: Diagnostic Performance - Avocado Sign (vs. N-Status)'
            }),
            diagnostischeGueteLiteraturT2Tabelle: Object.freeze({
                id: 'pub-table-diagnostische-guete-literatur-t2',
                titleDe: 'Tabelle 4: Diagnostische Güte - Literatur-basierte T2-Kriterien (vs. N-Status)',
                titleEn: 'Table 4: Diagnostic Performance - Literature-Based T2 Criteria (vs. N-Status)'
            }),
            diagnostischeGueteBFT2Tabelle: Object.freeze({
                id: 'pub-table-diagnostische-guete-bf-t2',
                titleDe: 'Tabelle 5: Diagnostische Güte - Optimierte T2-Kriterien (Ziel: {BFMetric}, vs. N-Status)',
                titleEn: 'Table 5: Diagnostic Performance - Optimized T2 Criteria (Target: {BFMetric}, vs. N-Status)'
            }),
            vergleichsTabelleASvsT2: Object.freeze({
                id: 'pub-table-vergleich-as-vs-t2',
                titleDe: 'Tabelle 6: Vergleich Diagnostische Güte (AS vs. T2-Varianten, vs. N-Status)',
                titleEn: 'Table 6: Comparison of Diagnostic Performance (AS vs. T2 Variants, vs. N-Status)'
            }),
            chartAlter: Object.freeze({
                idPrefix: 'pub-chart-alter-', // Suffix wird Kollektiv-ID sein
                titleKey: 'publicationAgeDistribution' // aus UI_TEXTS.chartTitles
            }),
            chartGeschlecht: Object.freeze({
                idPrefix: 'pub-chart-gender-', // Suffix wird Kollektiv-ID sein
                titleKey: 'publicationGenderDistribution' // aus UI_TEXTS.chartTitles
            }),
            chartASPerformanceAllKollektive: Object.freeze({
                id: 'pub-chart-as-perf-all',
                titleKey: 'publicationASPerformanceAllKollektive'
            }),
            chartLiteraturT2Performance: Object.freeze({
                id: 'pub-chart-lit-t2-perf',
                titleKey: 'publicationLitT2Performance'
            }),
            chartBFT2Performance: Object.freeze({
                id: 'pub-chart-bf-t2-perf',
                titleKey: 'publicationBFT2Performance'
            }),
            chartVergleichASvsT2Bar: Object.freeze({
                id: 'pub-chart-bar-vergleich-performance', // id aus publication_renderer beibehalten für Konsistenz
                titleKey: 'publicationPerfBarAsVsT2'
            }),
            chartVergleichASvsT2ROC: Object.freeze({
                id: 'pub-chart-roc-vergleich-performance', // id aus publication_renderer beibehalten für Konsistenz
                titleKey: 'publicationROCasVsT2'
            })
        })
    })
});

if (typeof Object.freeze === 'function') {
    Object.freeze(PUBLICATION_CONFIG);
}
