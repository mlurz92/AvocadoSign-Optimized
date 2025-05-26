const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'methoden',
    sections: Object.freeze([
        Object.freeze({
            id: 'methoden',
            labelKey: 'methoden', // Verweist auf UI_TEXTS.publikationTab.sectionLabels.methoden
            subSections: Object.freeze([
                Object.freeze({ id: 'methoden_studienanlage', labelKey: 'methoden_studienanlage' }), // Verweist auf UI_TEXTS.publikationTab.subSectionLabels.methoden_studienanlage
                Object.freeze({ id: 'methoden_patientenkollektiv', labelKey: 'methoden_patientenkollektiv' }),
                Object.freeze({ id: 'methoden_mrt_protokoll', labelKey: 'methoden_mrt_protokoll' }),
                Object.freeze({ id: 'methoden_as_definition', labelKey: 'methoden_as_definition' }),
                Object.freeze({ id: 'methoden_t2_definition', labelKey: 'methoden_t2_definition' }),
                Object.freeze({ id: 'methoden_referenzstandard', labelKey: 'methoden_referenzstandard' }),
                Object.freeze({ id: 'methoden_statistische_analyse', labelKey: 'methoden_statistische_analyse' })
            ])
        }),
        Object.freeze({
            id: 'ergebnisse',
            labelKey: 'ergebnisse', // Verweist auf UI_TEXTS.publikationTab.sectionLabels.ergebnisse
            subSections: Object.freeze([
                Object.freeze({ id: 'ergebnisse_patientencharakteristika', labelKey: 'ergebnisse_patientencharakteristika' }),
                Object.freeze({ id: 'ergebnisse_as_performance', labelKey: 'ergebnisse_as_performance' }),
                Object.freeze({ id: 'ergebnisse_literatur_t2_performance', labelKey: 'ergebnisse_literatur_t2_performance' }),
                Object.freeze({ id: 'ergebnisse_optimierte_t2_performance', labelKey: 'ergebnisse_optimierte_t2_performance' }),
                Object.freeze({ id: 'ergebnisse_vergleich_performance', labelKey: 'ergebnisse_vergleich_performance' })
            ])
        })
        // Weitere Hauptsektionen wie 'diskussion', 'einleitung', 'abstract', 'referenzen' könnten hier bei Bedarf hinzugefügt werden.
        // Beispiel:
        // Object.freeze({
        //     id: 'diskussion',
        //     labelKey: 'diskussion',
        //     subSections: Object.freeze([
        //         Object.freeze({ id: 'diskussion_hauptergebnisse', labelKey: 'diskussion_hauptergebnisse' }),
        //         Object.freeze({ id: 'diskussion_limitationen', labelKey: 'diskussion_limitationen' }),
        //         Object.freeze({ id: 'diskussion_schlussfolgerung', labelKey: 'diskussion_schlussfolgerung' })
        //     ])
        // })
    ]),
    literatureCriteriaSets: Object.freeze([ // Beibehaltung der IDs für interne Referenzen, Namen werden via UI_TEXTS und getKollektivDisplayName sprachabhängig.
        Object.freeze({
            id: 'koh_2008_morphology',
            nameKey: 'Koh et al. (2008)', // Dieser Schlüssel könnte in Zukunft für eine direkte, sprachunabhängige Referenzierung im Code nützlich sein
            shortNameKey: 'Koh et al.'
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            nameKey: 'Barbaro et al. (2024)',
            shortNameKey: 'Barbaro et al.'
        }),
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            nameKey: 'Rutegård et al. (2025) / ESGAR 2016',
            shortNameKey: 'ESGAR 2016'
        })
    ]),
    bruteForceMetricsForPublication: Object.freeze([ // Die 'label' Felder werden durch sprachabhängige UI_TEXTS Einträge ersetzt, falls nötig
        { value: 'Balanced Accuracy', labelKey: 'Balanced Accuracy' }, // Annahme: Metriknamen sind oft international verständlich oder als Eigennamen zu behandeln
        { value: 'Accuracy', labelKey: 'Accuracy' },
        { value: 'F1-Score', labelKey: 'F1-Score' },
        { value: 'PPV', labelKey: 'PPV' },
        { value: 'NPV', labelKey: 'NPV' }
    ]),
    defaultBruteForceMetricForPublication: 'Balanced Accuracy', // Dieser Wert muss einem 'value' aus bruteForceMetricsForPublication entsprechen
    publicationElements: Object.freeze({ // IDs bleiben sprachunabhängig, Titel werden über labelKeys in UI_TEXTS verwaltet
        methoden: Object.freeze({
            literaturT2KriterienTabelle: {
                id: 'pub-table-literatur-t2-kriterien',
                labelKey: 'literaturT2Kriterien' // Verweist auf UI_TEXTS.publikationTab.publicationTableTitles.literaturT2Kriterien
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-patienten-charakteristika',
                labelKey: 'patientenCharakteristika' // Verweist auf UI_TEXTS.publikationTab.publicationTableTitles.patientenCharakteristika
            },
            diagnostischeGueteASTabelle: { // Spezifischer ID und Key für AS-Tabelle
                id: 'pub-table-diagnostische-guete-as',
                labelKey: 'diagnostischeGueteAS'
            },
            diagnostischeGueteLiteraturTabelle: { // Spezifischer ID und Key
                id: 'pub-table-diagnostische-guete-literatur',
                labelKey: 'diagnostischeGueteLiteratur'
            },
            diagnostischeGueteBFTabelle: { // Spezifischer ID und Key
                id: 'pub-table-diagnostische-guete-bf',
                labelKey: 'diagnostischeGueteBF'
            },
            statistischerVergleichTabelle: { // Spezifischer ID und Key
                id: 'pub-table-statistischer-vergleich',
                labelKey: 'statistischerVergleich'
            },
            // IDs für Diagramme bleiben bestehen, Titel werden sprachabhängig über UI_TEXTS geholt
            alterVerteilungGesamtChart: {
                id: 'pub-chart-alter-Gesamt', // ID für das HTML-Element
                labelKey: 'alterGesamt' // Verweist auf UI_TEXTS.publikationTab.publicationChartTitles.alterGesamt
            },
            genderVerteilungGesamtChart: {
                id: 'pub-chart-gender-Gesamt',
                labelKey: 'genderGesamt'
            },
            vergleichMetrikenGesamtChart: {
                id: 'pub-chart-vergleich-Gesamt',
                labelKey: 'vergleichMetriken' // Generischer Key, Kollektiv wird im Renderer ersetzt
            },
            vergleichMetrikenDirektOPChart: {
                id: 'pub-chart-vergleich-direkt-OP',
                labelKey: 'vergleichMetriken'
            },
            vergleichMetrikenNRCTChart: {
                id: 'pub-chart-vergleich-nRCT',
                labelKey: 'vergleichMetriken'
            }
        })
    })
});

if (typeof Object.freeze === 'function') {
    Object.freeze(PUBLICATION_CONFIG);
}
