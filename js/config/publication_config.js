const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'methoden', // Hauptsektion beim ersten Laden
    defaultSubSection: 'methoden_studienanlage', // Erste Untersektion, die angezeigt wird

    sections: Object.freeze([
        Object.freeze({
            id: 'methoden',
            labelKey: 'methoden', // Für UI_TEXTS
            subSections: Object.freeze([
                Object.freeze({ id: 'methoden_studienanlage', label: 'Studiendesign und Ethik' }),
                Object.freeze({ id: 'methoden_patientenkollektiv', label: 'Patientenkollektiv' }),
                Object.freeze({ id: 'methoden_mrt_protokoll', label: 'MRT-Protokoll und Bildakquise' }),
                Object.freeze({ id: 'methoden_as_definition', label: 'Definition und Bewertung des Avocado Signs' }),
                Object.freeze({ id: 'methoden_t2_definition', label: 'Definition und Bewertung der T2-Kriterien' }),
                Object.freeze({ id: 'methoden_referenzstandard', label: 'Histopathologischer Referenzstandard' }),
                Object.freeze({ id: 'methoden_statistische_analyse', label: 'Statistische Analyse' })
            ])
        }),
        Object.freeze({
            id: 'ergebnisse',
            labelKey: 'ergebnisse', // Für UI_TEXTS
            subSections: Object.freeze([
                Object.freeze({ id: 'ergebnisse_patientencharakteristika', label: 'Patientencharakteristika' }),
                Object.freeze({ id: 'ergebnisse_as_performance', label: 'Diagnostische Güte: Avocado Sign' }),
                Object.freeze({ id: 'ergebnisse_literatur_t2_performance', label: 'Diagnostische Güte: Literatur-basierte T2-Kriterien' }),
                Object.freeze({ id: 'ergebnisse_optimierte_t2_performance', label: 'Diagnostische Güte: Optimierte T2-Kriterien (Brute-Force)' }),
                Object.freeze({ id: 'ergebnisse_vergleich_performance', label: 'Vergleichende Analyse: AS vs. T2-Kriterien' })
            ])
        }),
        Object.freeze({
            id: 'referenzen',
            labelKey: 'referenzen',
            subSections: Object.freeze([
                Object.freeze({ id: 'referenzen_liste', label: 'Literaturverzeichnis' })
            ])
        })
    ]),

    literatureCriteriaSets: Object.freeze([ // Beibehalten von vorheriger Struktur
        Object.freeze({
            id: 'koh_2008_morphology',
            nameKey: 'Koh et al. (2008)', // Wie im study_criteria_manager.js für Konsistenz
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

    bruteForceMetricsForPublication: Object.freeze([ // Beibehalten
        { value: 'Balanced Accuracy', label: 'Balanced Accuracy' },
        { value: 'Accuracy', label: 'Accuracy' },
        { value: 'F1-Score', label: 'F1-Score' },
        { value: 'PPV', label: 'Positiver Prädiktiver Wert (PPV)' },
        { value: 'NPV', label: 'Negativer Prädiktiver Wert (NPV)' }
    ]),
    defaultBruteForceMetricForPublication: 'Balanced Accuracy', // Beibehalten

    publicationElements: Object.freeze({
        methoden: Object.freeze({
            literaturT2KriterienUebersichtTabelle: Object.freeze({
                id: 'pub-table-literatur-t2-kriterien-uebersicht',
                titleDe: 'Übersicht der evaluierten Literatur-basierten T2-Kriteriensets',
                titleEn: 'Overview of Evaluated Literature-Based T2 Criteria Sets',
                number: 1 // Für Referenzierung: Tabelle 1
            })
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: Object.freeze({
                id: 'pub-table-patienten-charakteristika',
                titleDe: 'Basischarakteristika der Studienpopulation (N=106)',
                titleEn: 'Baseline Characteristics of the Study Population (N=106)',
                number: 2 // Tabelle 2
            }),
            asPerformanceTabelle: Object.freeze({
                id: 'pub-table-as-performance',
                titleDe: 'Diagnostische Güte des Avocado Signs für die Vorhersage des N-Status',
                titleEn: 'Diagnostic Performance of the Avocado Sign for N-Status Prediction',
                number: 3 // Tabelle 3
            }),
            literaturT2PerformanceTabelle: Object.freeze({
                id: 'pub-table-literatur-t2-performance',
                titleDe: 'Diagnostische Güte der Literatur-basierten T2-Kriterien für die N-Status Vorhersage',
                titleEn: 'Diagnostic Performance of Literature-Based T2 Criteria for N-Status Prediction',
                number: 4 // Tabelle 4
            }),
            optimierteT2PerformanceTabelle: Object.freeze({
                id: 'pub-table-optimierte-t2-performance',
                titleDe: 'Diagnostische Güte der Brute-Force optimierten T2-Kriterien (Zielmetrik: {BF_METRIC}) für die N-Status Vorhersage',
                titleEn: 'Diagnostic Performance of Brute-Force Optimized T2 Criteria (Target Metric: {BF_METRIC}) for N-Status Prediction',
                number: 5 // Tabelle 5
            }),
            vergleichASvsT2Tabelle: Object.freeze({
                id: 'pub-table-vergleich-as-vs-t2',
                titleDe: 'Statistischer Vergleich der diagnostischen Leistung: Avocado Sign vs. ausgewählte T2-Kriteriensets',
                titleEn: 'Statistical Comparison of Diagnostic Performance: Avocado Sign vs. Selected T2 Criteria Sets',
                number: 6 // Tabelle 6
            }),
            // Abbildungen (Figures)
            patientenCharakteristikaAbbildungen: Object.freeze({ // Wird zu Figure 1A und 1B
                alterVerteilungChart: Object.freeze({
                    id: 'pub-figure-age-distribution-gesamt',
                    titleDe: 'Altersverteilung im Gesamtkollektiv (N=106).',
                    titleEn: 'Age Distribution in the Overall Cohort (N=106).',
                    figureLetter: 'A'
                }),
                geschlechtVerteilungChart: Object.freeze({
                    id: 'pub-figure-gender-distribution-gesamt',
                    titleDe: 'Geschlechterverteilung im Gesamtkollektiv (N=106).',
                    titleEn: 'Gender Distribution in the Overall Cohort (N=106).',
                    figureLetter: 'B'
                }),
                number: 1 // Figure 1
            }),
            rocKurven: Object.freeze({ // Wird zu Figure 2 A, B, C
                as_gesamt: Object.freeze({ id: 'pub-figure-roc-as-gesamt', titleDe: 'ROC-Kurve des Avocado Signs im Gesamtkollektiv.', titleEn: 'ROC Curve of the Avocado Sign in the Overall Cohort.', figureLetter: 'A' }),
                t2bf_gesamt: Object.freeze({ id: 'pub-figure-roc-t2bf-gesamt', titleDe: 'ROC-Kurve der optimierten T2-Kriterien im Gesamtkollektiv.', titleEn: 'ROC Curve of Optimized T2 Criteria in the Overall Cohort.', figureLetter: 'B' }),
                t2lit_gesamt_koh: Object.freeze({ id: 'pub-figure-roc-t2lit-gesamt-koh', titleDe: 'ROC-Kurve der Koh et al. T2-Kriterien im Gesamtkollektiv.', titleEn: 'ROC Curve of Koh et al. T2 Criteria in the Overall Cohort.', figureLetter: 'C' }),
                // Weitere ROC-Kurven für Subgruppen könnten hier folgen und als Figure 2D, 2E etc. oder Figure 3 A,B,C etc. nummeriert werden.
                // Beispiel für nRCT Gruppe
                as_nrct: Object.freeze({ id: 'pub-figure-roc-as-nrct', titleDe: 'ROC-Kurve des Avocado Signs im nRCT-Kollektiv.', titleEn: 'ROC Curve of the Avocado Sign in the nRCT Cohort.'}),
                t2bf_nrct: Object.freeze({ id: 'pub-figure-roc-t2bf-nrct', titleDe: 'ROC-Kurve der optimierten T2-Kriterien im nRCT-Kollektiv.', titleEn: 'ROC Curve of Optimized T2 Criteria in the nRCT Cohort.'}),
                t2lit_nrct_barbaro: Object.freeze({ id: 'pub-figure-roc-t2lit-nrct-barbaro', titleDe: 'ROC-Kurve der Barbaro et al. T2-Kriterien im nRCT-Kollektiv.', titleEn: 'ROC Curve of Barbaro et al. T2 Criteria in the nRCT Cohort.'}),
                 // Beispiel für Direkt OP Gruppe
                as_direktop: Object.freeze({ id: 'pub-figure-roc-as-direktop', titleDe: 'ROC-Kurve des Avocado Signs im Direkt-OP-Kollektiv.', titleEn: 'ROC Curve of the Avocado Sign in the Upfront Surgery Cohort.'}),
                t2bf_direktop: Object.freeze({ id: 'pub-figure-roc-t2bf-direktop', titleDe: 'ROC-Kurve der optimierten T2-Kriterien im Direkt-OP-Kollektiv.', titleEn: 'ROC Curve of Optimized T2 Criteria in the Upfront Surgery Cohort.'}),
                t2lit_direktop_esgar: Object.freeze({ id: 'pub-figure-roc-t2lit-direktop-esgar', titleDe: 'ROC-Kurve der ESGAR 2016 T2-Kriterien im Direkt-OP-Kollektiv.', titleEn: 'ROC Curve of ESGAR 2016 T2 Criteria in the Upfront Surgery Cohort.'}),
                number: 2 // Figure 2 (kann mehrere Teile A, B, C etc. haben)
            }),
            vergleichsBalkendiagramme: Object.freeze({ // Wird zu Figure 3 A, B, C
                gesamt: Object.freeze({ id: 'pub-figure-vergleich-balken-gesamt', titleDe: 'Vergleich der diagnostischen Metriken (AS vs. Optimierte T2) im Gesamtkollektiv.', titleEn: 'Comparison of Diagnostic Metrics (AS vs. Optimized T2) in the Overall Cohort.', figureLetter: 'A' }),
                direktOP: Object.freeze({ id: 'pub-figure-vergleich-balken-direktop', titleDe: 'Vergleich der diagnostischen Metriken (AS vs. Optimierte T2) im Direkt-OP-Kollektiv.', titleEn: 'Comparison of Diagnostic Metrics (AS vs. Optimized T2) in the Upfront Surgery Cohort.', figureLetter: 'B' }),
                nRCT: Object.freeze({ id: 'pub-figure-vergleich-balken-nrct', titleDe: 'Vergleich der diagnostischen Metriken (AS vs. Optimierte T2) im nRCT-Kollektiv.', titleEn: 'Comparison of Diagnostic Metrics (AS vs. Optimized T2) in the nRCT Cohort.', figureLetter: 'C' }),
                number: 3 // Figure 3
            }),
            // Optional: Forest Plots, falls implementiert
            forestPlotsPerformance: Object.freeze({
                 gesamt_sens_spez: Object.freeze({ id: 'pub-figure-forest-sens-spez-gesamt', titleDe: 'Forest Plot: Sensitivität und Spezifität (AS vs. T2-Methoden) im Gesamtkollektiv.', titleEn: 'Forest Plot: Sensitivity and Specificity (AS vs. T2 Methods) in the Overall Cohort.'}),
                 number: 4 // Beispiel für Figure 4
            })
        })
    })
});

if (typeof Object.freeze === 'function') {
    // Tiefes Einfrieren für verschachtelte Strukturen
    const deepFreezeNested = (obj) => {
        Object.keys(obj).forEach(prop => {
            if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                deepFreezeNested(obj[prop]);
            }
        });
        return Object.freeze(obj);
    };
    deepFreezeNested(PUBLICATION_CONFIG.sections);
    deepFreezeNested(PUBLICATION_CONFIG.publicationElements);
}
