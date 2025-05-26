const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'methoden',
    sections: Object.freeze([
        Object.freeze({
            id: 'einleitung',
            labelKey: 'einleitung',
            subSections: Object.freeze([
                Object.freeze({ id: 'einleitung_inhalt', label: 'Einleitung und Hintergrund' })
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
                Object.freeze({ id: 'diskussion_haupterkenntnisse', label: 'Haupterkenntnisse und Einordnung' }),
                Object.freeze({ id: 'diskussion_limitationen', label: 'Limitationen der Studie' }),
                Object.freeze({ id: 'diskussion_ausblick', label: 'Ausblick und zukünftige Forschung' })
            ])
        }),
        Object.freeze({
            id: 'abstract',
            labelKey: 'abstract',
            subSections: Object.freeze([
                Object.freeze({ id: 'abstract_inhalt', label: 'Zusammenfassung und Fazit' })
            ])
        }),
        Object.freeze({
            id: 'referenzen',
            labelKey: 'referenzen',
            subSections: Object.freeze([
                Object.freeze({ id: 'referenzen_literaturverzeichnis', label: 'Literaturverzeichnis' }),
                Object.freeze({ id: 'referenzen_anhang', label: 'Anhang (falls zutreffend)' })
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
        }),
        Object.freeze({
            id: 'lahaye_et_al_2009_restaging',
            nameKey: 'Lahaye et al. (2009) - Restaging',
            shortName: 'Lahaye et al.'
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
                titleDe: 'Tabelle 2: Übersicht der Literatur-basierten T2-Kriteriensets und deren Anwendung im Studienkollektiv',
                titleEn: 'Table 2: Overview of Literature-Based T2 Criteria Sets and their Application in the Study Cohort'
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-patienten-charakteristika',
                titleDe: 'Tabelle 1: Patientencharakteristika',
                titleEn: 'Table 1: Patient Characteristics'
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
                titleDe: 'Tabelle 5: Diagnostische Güte der Brute-Force optimierten T2-Kriterien (Ziel: Balanced Accuracy, vs. N-Status)',
                titleEn: 'Table 5: Diagnostic Performance of Brute-Force Optimized T2 Criteria (Target: Balanced Accuracy, vs. N-Status)'
            },
            statistischeVergleicheAST2Tabelle: {
                id: 'pub-table-statistische-vergleiche-as-t2',
                titleDe: 'Tabelle 6: Statistischer Vergleich der diagnostischen Güte – Avocado Sign vs. T2-Kriteriensets (Literatur-basiert und optimiert)',
                titleEn: 'Table 6: Statistical Comparison of Diagnostic Performance – Avocado Sign vs. T2 Criteria Sets (Literature-Based and Optimized)'
            },
            chartAlterGesamt: {
                id: 'pub-chart-alter-gesamt',
                titleDe: 'Abbildung 1a: Altersverteilung im Gesamtkollektiv (N=[N_GESAMT])',
                titleEn: 'Figure 1a: Age Distribution in the Overall Cohort (N=[N_GESAMT])'
            },
            chartGenderGesamt: {
                id: 'pub-chart-gender-gesamt',
                titleDe: 'Abbildung 1b: Geschlechterverteilung im Gesamtkollektiv (N=[N_GESAMT])',
                titleEn: 'Figure 1b: Gender Distribution in the Overall Cohort (N=[N_GESAMT])'
            },
            vergleichsChartGesamt: {
                id: 'pub-chart-vergleich-gesamt',
                titleDe: 'Abbildung 2a: Vergleichsmetriken für Gesamtkollektiv (N=[N_GESAMT])',
                titleEn: 'Figure 2a: Comparative Metrics for Overall Cohort (N=[N_GESAMT])'
            },
            vergleichsChartDirektOP: {
                id: 'pub-chart-vergleich-direkt-op',
                titleDe: 'Abbildung 2b: Vergleichsmetriken für Direkt-OP Kollektiv (N=[N_DIREKT_OP])',
                titleEn: 'Figure 2b: Comparative Metrics for Upfront Surgery Cohort (N=[N_DIREKT_OP])'
            },
            vergleichsChartNRCT: {
                id: 'pub-chart-vergleich-nrct',
                titleDe: 'Abbildung 2c: Vergleichsmetriken für nRCT Kollektiv (N=[N_NRCT])',
                titleEn: 'Figure 2c: Comparative Metrics for nRCT Cohort (N=[N_NRCT])'
            }
        })
    })
});

if (typeof Object.freeze === 'function') {
    Object.freeze(PUBLICATION_CONFIG);
}
