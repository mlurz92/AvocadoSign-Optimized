const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'methoden',
    sections: Object.freeze([
        Object.freeze({
            id: 'methoden',
            labelKey: 'methoden', // Verweist auf UI_TEXTS.publikationTab.sectionLabels.methoden
            subSections: Object.freeze([
                Object.freeze({ id: 'methoden_studienanlage', labelKey: 'studienanlage' }), // Muss in UI_TEXTS_DE/EN.publikationTab.subSectionLabels hinzugefügt werden
                Object.freeze({ id: 'methoden_patientenkollektiv', labelKey: 'patientenkollektiv' }),
                Object.freeze({ id: 'methoden_mrt_protokoll', labelKey: 'mrtProtokoll' }),
                Object.freeze({ id: 'methoden_as_definition', labelKey: 'asDefinition' }),
                Object.freeze({ id: 'methoden_t2_definition', labelKey: 't2Definition' }),
                Object.freeze({ id: 'methoden_referenzstandard', labelKey: 'referenzstandard' }),
                Object.freeze({ id: 'methoden_statistische_analyse', labelKey: 'statistischeAnalyse' })
            ])
        }),
        Object.freeze({
            id: 'ergebnisse',
            labelKey: 'ergebnisse', // Verweist auf UI_TEXTS.publikationTab.sectionLabels.ergebnisse
            subSections: Object.freeze([
                Object.freeze({ id: 'ergebnisse_patientencharakteristika', labelKey: 'patientencharakteristika' }), // Muss in UI_TEXTS_DE/EN.publikationTab.subSectionLabels hinzugefügt werden
                Object.freeze({ id: 'ergebnisse_as_performance', labelKey: 'asPerformance' }),
                Object.freeze({ id: 'ergebnisse_literatur_t2_performance', labelKey: 'literaturT2Performance' }),
                Object.freeze({ id: 'ergebnisse_optimierte_t2_performance', labelKey: 'optimierteT2Performance' }),
                Object.freeze({ id: 'ergebnisse_vergleich_performance', labelKey: 'vergleichPerformance' })
            ])
        })
    ]),
    literatureCriteriaSets: Object.freeze([
        Object.freeze({
            id: 'koh_2008_morphology',
            nameKey: 'koh_2008_morphology_name', // Verweist auf UI_TEXTS.studyNames
            shortNameKey: 'koh_2008_morphology_short' // Verweist auf UI_TEXTS.studyShortNames
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            nameKey: 'barbaro_2024_restaging_name',
            shortNameKey: 'barbaro_2024_restaging_short'
        }),
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            nameKey: 'rutegard_et_al_esgar_name',
            shortNameKey: 'rutegard_et_al_esgar_short'
        })
    ]),
    bruteForceMetricsForPublication: Object.freeze([ // Labels werden nun über UI_TEXTS geholt
        { value: 'Balanced Accuracy', labelKey: 'balancedAccuracy' },
        { value: 'Accuracy', labelKey: 'accuracy' },
        { value: 'F1-Score', labelKey: 'f1Score' },
        { value: 'PPV', labelKey: 'ppv' },
        { value: 'NPV', labelKey: 'npv' }
    ]),
    defaultBruteForceMetricForPublication: 'Balanced Accuracy',
    publicationElements: Object.freeze({
        methoden: Object.freeze({
            literaturT2KriterienTabelle: {
                id: 'pub-table-literatur-t2-kriterien',
                titleKey: 'literaturT2Kriterien' // Verweist auf UI_TEXTS.publikationTab.publicationTableTitles.literaturT2Kriterien
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-patienten-charakteristika',
                titleKey: 'patientenCharakteristika' // Verweist auf UI_TEXTS.publikationTab.publicationTableTitles.patientenCharakteristika
            },
            diagnostischeGueteASTabelle: { // Eigene ID für AS-Tabelle
                id: 'pub-table-diagnostische-guete-as',
                titleKey: 'asPerformance' // Verweist auf UI_TEXTS.publikationTab.publicationTableTitles.asPerformance
            },
            diagnostischeGueteLiteraturT2Tabelle: { // Eigene ID für Literatur-T2-Tabelle
                id: 'pub-table-diagnostische-guete-literatur-t2',
                titleKey: 'literaturT2Performance'
            },
            diagnostischeGueteOptimierteT2Tabelle: { // Eigene ID für Optimierte-T2-Tabelle
                id: 'pub-table-diagnostische-guete-optimiert-t2',
                titleKey: 'optimierteT2Performance' // Platzhalter {METRIC} wird in publication_renderer.js ersetzt
            },
            statVergleichAST2Tabelle: { // Eigene ID für Vergleichstabelle
                id: 'pub-table-stat-vergleich-as-t2',
                titleKey: 'vergleichPerformance'
            },
            // Chart IDs bleiben als Referenz für das Styling und die Logik,
            // die Titel werden dynamisch in publication_renderer.js über UI_TEXTS gesetzt.
            patientenCharakteristikaAlterChart: {
                id: 'pub-chart-alter-Gesamt', // Wird für Kollektiv "Gesamt" verwendet
                titleKey: 'patientenCharakteristikaAlter' // Verweist auf UI_TEXTS.publikationTab.publicationFigureCaptions
            },
            patientenCharakteristikaGeschlechtChart: {
                id: 'pub-chart-gender-Gesamt', // Wird für Kollektiv "Gesamt" verwendet
                titleKey: 'patientenCharakteristikaGeschlecht'
            },
            vergleichPerformanceChartGesamt: {
                id: 'pub-chart-vergleich-Gesamt',
                titleKey: 'vergleichPerformanceChart', // Platzhalter {LETTER} und {KOLLEKTIV} werden in publication_renderer.js ersetzt
                letter: 'a'
            },
            vergleichPerformanceChartDirektOP: {
                id: 'pub-chart-vergleich-direkt-OP',
                titleKey: 'vergleichPerformanceChart',
                letter: 'b'
            },
            vergleichPerformanceChartNRCT: {
                id: 'pub-chart-vergleich-nRCT',
                titleKey: 'vergleichPerformanceChart',
                letter: 'c'
            }
        })
    })
});

if (typeof Object.freeze === 'function') {
    Object.freeze(PUBLICATION_CONFIG);
}
