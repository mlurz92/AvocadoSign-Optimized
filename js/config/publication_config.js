const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'methoden',
    sections: Object.freeze([
        Object.freeze({
            id: 'methoden',
            labelKey: 'methoden', // Referenziert Schlüssel in UI_TEXTS.publikationTab.sectionLabels
            subSections: Object.freeze([
                Object.freeze({ id: 'methoden_studienanlage', label: 'Studiendesign und Ethik' }), // Labels hier sind Fallback, wenn UI_TEXTS nicht greift
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
            labelKey: 'ergebnisse', // Referenziert Schlüssel in UI_TEXTS.publikationTab.sectionLabels
            subSections: Object.freeze([
                Object.freeze({ id: 'ergebnisse_patientencharakteristika', label: 'Patientencharakteristika' }),
                Object.freeze({ id: 'ergebnisse_as_performance', label: 'Diagnostische Güte: Avocado Sign' }),
                Object.freeze({ id: 'ergebnisse_literatur_t2_performance', label: 'Diagnostische Güte: Literatur-T2-Kriterien' }),
                Object.freeze({ id: 'ergebnisse_optimierte_t2_performance', label: 'Diagnostische Güte: Optimierte T2-Kriterien (Brute-Force)' }),
                Object.freeze({ id: 'ergebnisse_vergleich_performance', label: 'Statistischer Vergleich: AS vs. T2-Kriterien' })
            ])
        })
        // Weitere Hauptsektionen wie 'diskussion', 'einleitung', 'abstract', 'referenzen' könnten hier hinzugefügt werden,
        // sind aber laut Anforderung für die Textgenerierung durch die App aktuell nicht im Fokus.
        // Die Sektion 'Referenzen' wird vom publication_text_generator speziell behandelt.
    ]),
    literatureCriteriaSets: Object.freeze([ // Für Auswahl und Referenzierung in Texten
        Object.freeze({
            id: 'koh_2008_morphology',
            nameKey: 'Koh et al. (2008)', // Wird für UI-Anzeige verwendet
            shortName: 'Koh et al.',
            referenceString: "Koh et al. (2008) [DOI: 10.1016/j.ijrobp.2007.10.016]" // Für Textgenerator
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            nameKey: 'Barbaro et al. (2024)',
            shortName: 'Barbaro et al.',
            referenceString: "Barbaro et al. (2024) [DOI: 10.1016/j.radonc.2024.110124]"
        }),
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            nameKey: 'ESGAR 2016 (eval. Rutegård et al. 2025)',
            shortName: 'ESGAR 2016',
            referenceString: "ESGAR Konsensus Kriterien (Beets-Tan et al. 2018 [DOI: 10.1007/s00330-017-5026-2]), evaluiert durch Rutegård et al. (2025) [DOI: 10.1007/s00330-025-11361-2]"
        })
    ]),
    bruteForceMetricsForPublication: Object.freeze([ // Für Dropdown-Auswahl im Publikation-Tab
        { value: 'Balanced Accuracy', label: 'Balanced Accuracy' },
        { value: 'Accuracy', label: 'Accuracy' },
        { value: 'F1-Score', label: 'F1-Score' },
        { value: 'PPV', label: 'Positiver Prädiktiver Wert (PPV)' },
        { value: 'NPV', label: 'Negativer Prädiktiver Wert (NPV)' }
    ]),
    defaultBruteForceMetricForPublication: 'Balanced Accuracy', // Wichtig für die initiale Darstellung

    publicationElements: Object.freeze({ // IDs und Titel für Tabellen/Abbildungen, die im Text referenziert werden
        methoden: Object.freeze({
            literaturT2KriterienTabelle: { // Tabelle 2 (neu nummeriert für diese Publikation)
                id: 'pub-table-literatur-t2-kriterien',
                titleDe: 'Übersicht der implementierten Literatur-basierten T2-Kriteriensets',
                titleEn: 'Overview of Implemented Literature-Based T2 Criteria Sets',
                referenceLabel: 'Tabelle 2' // Für Textgenerator
            },
            // Platzhalter für Abbildungen, die extern sind, aber im Methodenteil referenziert werden könnten
            abbildungMRTProtokollBeispiel: {
                id: 'ext-fig-mrt-protocol', // Keine Generierung durch App
                titleDe: 'Beispielhafte MRT-Sequenzdarstellung (extern)',
                titleEn: 'Example MRI Sequence Display (external)',
                referenceLabel: 'Abbildung 1' // Beispielhafte Referenz im Text
            },
            abbildungAvocadoSignBeispiel: { // Wie Fig. 2 in Lurz & Schäfer, 2025
                id: 'ext-fig-avocado-sign', // Keine Generierung durch App
                titleDe: 'Illustratives Beispiel des Avocado Signs (vgl. Lurz & Schäfer, 2025, Abb. 2)',
                titleEn: 'Illustrative Example of the Avocado Sign (cf. Lurz & Schäfer, 2025, Fig. 2)',
                referenceLabel: 'Abbildung 2' // Beispielhafte Referenz im Text
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: { // Tabelle 1
                id: 'pub-table-patienten-charakteristika',
                titleDe: 'Patientencharakteristika des Gesamtkollektivs und der Subgruppen',
                titleEn: 'Patient Characteristics of the Overall Cohort and Subgroups',
                referenceLabel: 'Tabelle 1'
            },
            diagnostischeGueteASTabelle: { // Tabelle 3
                id: 'pub-table-diagnostische-guete-as',
                titleDe: 'Diagnostische Güte des Avocado Signs (AS) für den N-Status',
                titleEn: 'Diagnostic Performance of the Avocado Sign (AS) for N-Status Prediction',
                referenceLabel: 'Tabelle 3'
            },
            diagnostischeGueteLiteraturT2Tabelle: { // Tabelle 4
                id: 'pub-table-diagnostische-guete-literatur-t2',
                titleDe: 'Diagnostische Güte der Literatur-basierten T2-Kriterien für den N-Status',
                titleEn: 'Diagnostic Performance of Literature-Based T2 Criteria for N-Status Prediction',
                referenceLabel: 'Tabelle 4'
            },
            diagnostischeGueteOptimierteT2Tabelle: { // Tabelle 5
                id: 'pub-table-diagnostische-guete-optimierte-t2',
                titleDe: 'Diagnostische Güte der Brute-Force (BF) optimierten T2-Kriterien (Ziel: {BF_METRIC}) für den N-Status', // {BF_METRIC} wird dynamisch ersetzt
                titleEn: 'Diagnostic Performance of Brute-Force (BF) Optimized T2 Criteria (Target: {BF_METRIC}) for N-Status Prediction',
                referenceLabel: 'Tabelle 5'
            },
            statistischerVergleichAST2Tabelle: { // Tabelle 6
                id: 'pub-table-statistischer-vergleich-as-t2',
                titleDe: 'Statistischer Vergleich der diagnostischen Güte: Avocado Sign (AS) vs. ausgewählte T2-Kriteriensets',
                titleEn: 'Statistical Comparison of Diagnostic Performance: Avocado Sign (AS) vs. Selected T2 Criteria Sets',
                referenceLabel: 'Tabelle 6'
            },
            konfusionsmatrizenVergleichTabelle: { // NEU, Tabelle 7
                id: 'pub-table-konfusionsmatrizen-vergleich',
                titleDe: 'Exemplarische Konfusionsmatrizen für ausgewählte Methoden im Gesamtkollektiv',
                titleEn: 'Exemplary Confusion Matrices for Selected Methods in the Overall Cohort',
                referenceLabel: 'Tabelle 7'
            },
            alterVerteilungChart: { // Abbildung 3A (neu nummeriert)
                id: 'pub-chart-alter-Gesamt',
                titleDe: 'Altersverteilung im Gesamtkollektiv (N={N_GESAMT})',
                titleEn: 'Age Distribution in the Overall Cohort (N={N_GESAMT})',
                referenceLabel: 'Abbildung 3A'
            },
            geschlechtVerteilungChart: { // Abbildung 3B (neu nummeriert)
                id: 'pub-chart-gender-Gesamt',
                titleDe: 'Geschlechterverteilung im Gesamtkollektiv (N={N_GESAMT})',
                titleEn: 'Gender Distribution in the Overall Cohort (N={N_GESAMT})',
                referenceLabel: 'Abbildung 3B'
            },
            vergleichPerformanceChartGesamt: { // Abbildung 4A (neu nummeriert)
                id: 'pub-chart-vergleich-Gesamt',
                titleDe: 'Performance-Vergleich (AS vs. T2-BF vs. Lit-T2) im Gesamtkollektiv (N={N_GESAMT})',
                titleEn: 'Performance Comparison (AS vs. T2-BF vs. Lit-T2) in Overall Cohort (N={N_GESAMT})',
                referenceLabel: 'Abbildung 4A'
            },
            vergleichPerformanceChartDirektOP: { // Abbildung 4B (neu nummeriert)
                id: 'pub-chart-vergleich-direkt-OP',
                titleDe: 'Performance-Vergleich (AS vs. T2-BF vs. Lit-T2) im Direkt-OP Kollektiv (N={N_DIREKT_OP})',
                titleEn: 'Performance Comparison (AS vs. T2-BF vs. Lit-T2) in Upfront Surgery Cohort (N={N_DIREKT_OP})',
                referenceLabel: 'Abbildung 4B'
            },
            vergleichPerformanceChartNRCT: { // Abbildung 4C (neu nummeriert)
                id: 'pub-chart-vergleich-nRCT',
                titleDe: 'Performance-Vergleich (AS vs. T2-BF vs. Lit-T2) im nRCT Kollektiv (N={N_NRCT})',
                titleEn: 'Performance Comparison (AS vs. T2-BF vs. Lit-T2) in nCRT Cohort (N={N_NRCT})',
                referenceLabel: 'Abbildung 4C'
            },
            // Optional: Eine neue Abbildung für detaillierteren Performance-Vergleich (z.B. Sens/Spez Scatter)
            performanceVergleichDetailChart: { // Abbildung 5 (neu)
                id: 'pub-chart-performance-detail-gesamt',
                titleDe: 'Sensitivität vs. Spezifität für AS, Literatur-T2 und BF-T2 im Gesamtkollektiv',
                titleEn: 'Sensitivity vs. Specificity for AS, Literature-T2, and BF-T2 in the Overall Cohort',
                referenceLabel: 'Abbildung 5'
            }
        })
    })
});

if (typeof Object.freeze === 'function') {
    Object.freeze(PUBLICATION_CONFIG.sections.forEach(s => {
        Object.freeze(s.subSections);
        Object.freeze(s);
    }));
    Object.freeze(PUBLICATION_CONFIG.literatureCriteriaSets);
    Object.freeze(PUBLICATION_CONFIG.bruteForceMetricsForPublication);
    Object.freeze(PUBLICATION_CONFIG.publicationElements.methoden);
    Object.freeze(PUBLICATION_CONFIG.publicationElements.ergebnisse);
    Object.freeze(PUBLICATION_CONFIG.publicationElements);
    Object.freeze(PUBLICATION_CONFIG);
}
