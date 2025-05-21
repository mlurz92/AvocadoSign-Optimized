const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'methoden', // Geändert auf Hauptsektions-ID
    sections: Object.freeze([
        Object.freeze({
            id: 'methoden', // ID für den Hauptbereich "Methoden"
            labelKey: 'methoden', // Schlüssel für UI_TEXTS.publikationTab.sectionLabels
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
            id: 'ergebnisse', // ID für den Hauptbereich "Ergebnisse"
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
            diagnostischeGueteGesamtTabelle: {
                id: 'pub-table-diagnostische-guete',
                titleDe: 'Diagnostische Güte: Avocado Sign und T2-Kriterien',
                titleEn: 'Diagnostic Performance: Avocado Sign and T2 Criteria'
            },
            rocChartAsVsT2: {
                id: 'pub-chart-roc-as-vs-t2',
                titleDe: 'ROC-Kurven: Avocado Sign vs. Beste T2-Kriterien (pro Kollektiv)',
                titleEn: 'ROC Curves: Avocado Sign vs. Best T2 Criteria (per Cohort)'
            },
            sensSpezBarChart: {
                id: 'pub-chart-sens-spez-bar',
                titleDe: 'Sensitivität & Spezifität: AS vs. T2-Kriterien (pro Kollektiv)',
                titleEn: 'Sensitivity & Specificity: AS vs. T2 Criteria (per Cohort)'
            }
        })
    })
});

if (typeof Object.freeze === 'function') {
    Object.freeze(PUBLICATION_CONFIG);
}
