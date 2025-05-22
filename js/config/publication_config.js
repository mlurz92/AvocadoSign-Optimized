const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'methoden_studienanlage',
    sections: Object.freeze([
        Object.freeze({
            id: 'methoden',
            labelKey: 'methoden',
            subSections: Object.freeze([
                Object.freeze({ id: 'methoden_studienanlage', label: 'Studiendesign und Ethik', labelKey: 'studienanlage' }),
                Object.freeze({ id: 'methoden_patientenkollektiv', label: 'Patientenkollektiv', labelKey: 'patientenkollektiv' }),
                Object.freeze({ id: 'methoden_mrt_protokoll', label: 'MRT-Protokoll & Kontrastmittelgabe', labelKey: 'mrtProtokoll' }),
                Object.freeze({ id: 'methoden_as_definition', label: 'Definition & Bewertung Avocado Sign', labelKey: 'asDefinition' }),
                Object.freeze({ id: 'methoden_t2_definition', label: 'Definition & Bewertung T2-Kriterien', labelKey: 't2Definition' }),
                Object.freeze({ id: 'methoden_referenzstandard', label: 'Referenzstandard (Histopathologie)', labelKey: 'referenzstandard' }),
                Object.freeze({ id: 'methoden_statistische_analyse', label: 'Statistische Analyse', labelKey: 'statistischeAnalyse' })
            ])
        }),
        Object.freeze({
            id: 'ergebnisse',
            labelKey: 'ergebnisse',
            subSections: Object.freeze([
                Object.freeze({ id: 'ergebnisse_patientencharakteristika', label: 'Patientencharakteristika', labelKey: 'patientencharakteristika' }),
                Object.freeze({ id: 'ergebnisse_as_performance', label: 'Diagnostische Güte: Avocado Sign', labelKey: 'asPerformance' }),
                Object.freeze({ id: 'ergebnisse_literatur_t2_performance', label: 'Diagnostische Güte: Literatur-T2-Kriterien', labelKey: 'literaturT2Performance' }),
                Object.freeze({ id: 'ergebnisse_optimierte_t2_performance', label: 'Diagnostische Güte: Optimierte T2-Kriterien (Brute-Force)', labelKey: 'optimierteT2Performance' }),
                Object.freeze({ id: 'ergebnisse_vergleich_performance', label: 'Vergleich: AS vs. T2-Kriterien', labelKey: 'vergleichPerformanceT2' })
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
            literaturT2KriterienTabelle: Object.freeze({
                id: 'pub-table-literatur-t2-kriterien',
                titleDe: 'Übersicht der Literatur-basierten T2-Kriteriensets',
                titleEn: 'Overview of Literature-Based T2 Criteria Sets'
            })
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: Object.freeze({
                id: 'pub-table-patienten-charakteristika',
                titleDe: 'Tabelle 1: Patientencharakteristika',
                titleEn: 'Table 1: Patient Characteristics'
            }),
            alterChartContainerIdPrefix: 'pub-chart-alter-',
            genderChartContainerIdPrefix: 'pub-chart-gender-',
            diagnostischeGueteGesamtTabelle: Object.freeze({
                idPrefix: 'pub-table-diagnostische-guete-',
                titleDePrefix: 'Diagnostische Güte: ',
                titleEnPrefix: 'Diagnostic Performance: '
            }),
            rocChartContainerIdPrefix: 'pub-chart-roc-',
            vergleichBarChartContainerIdPrefix: 'pub-chart-bar-'
        })
    })
});

if (typeof Object.freeze === 'function') {
    Object.freeze(PUBLICATION_CONFIG);
}
