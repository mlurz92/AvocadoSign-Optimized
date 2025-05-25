const PUBLICATION_CONFIG = Object.freeze({
    defaultLanguage: 'de',
    defaultSection: 'methoden',
    sections: Object.freeze([
        Object.freeze({
            id: 'methoden',
            labelKey: 'methoden', // Schlüssel für UI_TEXTS.publikationTab.sectionLabels.methoden
            subSections: Object.freeze([
                Object.freeze({ id: 'methoden_studienanlage', labelKey: 'methoden_studienanlage' }), // UI_TEXTS.publikationTab.sectionLabels.methoden_studienanlage
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
            labelKey: 'ergebnisse', // Schlüssel für UI_TEXTS.publikationTab.sectionLabels.ergebnisse
            subSections: Object.freeze([
                Object.freeze({ id: 'ergebnisse_patientencharakteristika', labelKey: 'ergebnisse_patientencharakteristika' }),
                Object.freeze({ id: 'ergebnisse_as_performance', labelKey: 'ergebnisse_as_performance' }),
                Object.freeze({ id: 'ergebnisse_literatur_t2_performance', labelKey: 'ergebnisse_literatur_t2_performance' }),
                Object.freeze({ id: 'ergebnisse_optimierte_t2_performance', labelKey: 'ergebnisse_optimierte_t2_performance' }),
                Object.freeze({ id: 'ergebnisse_vergleich_performance', labelKey: 'ergebnisse_vergleich_performance' })
            ])
        })
    ]),
    literatureCriteriaSets: Object.freeze([
        Object.freeze({
            id: 'koh_2008_morphology',
            nameKey: 'koh2008', // Verweist auf UI_TEXTS.publikationTab.literatureCriteria.koh2008.name
            shortNameKey: 'koh2008_short' // Verweist auf UI_TEXTS.publikationTab.literatureCriteria.koh2008.shortName
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            nameKey: 'barbaro2024', // Verweist auf UI_TEXTS.publikationTab.literatureCriteria.barbaro2024.name
            shortNameKey: 'barbaro2024_short' // Verweist auf UI_TEXTS.publikationTab.literatureCriteria.barbaro2024.shortName
        }),
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            nameKey: 'rutegardESGAR', // Verweist auf UI_TEXTS.publikationTab.literatureCriteria.rutegardESGAR.name
            shortNameKey: 'rutegardESGAR_short' // Verweist auf UI_TEXTS.publikationTab.literatureCriteria.rutegardESGAR.shortName
        })
    ]),
    bruteForceMetricsForPublication: Object.freeze([
        // Die 'labelKey' verweist auf UI_TEXTS.publicationTab.bfMetrics.<value>
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
                titleKey: 'table2LiteratureT2Criteria' // Verweist auf UI_TEXTS.publikationTab.tableTitles.table2LiteratureT2Criteria
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-patienten-charakteristika',
                titleKey: 'table1PatientCharacteristics' // Verweist auf UI_TEXTS.publikationTab.tableTitles.table1PatientCharacteristics
            },
            diagnostischeGueteASTabelle: { // Früher diagnostischeGueteGesamtTabelle, spezifischer benannt
                id: 'pub-table-diagnostische-guete-as',
                titleKey: 'table3ASPerformance' // Verweist auf UI_TEXTS.publikationTab.tableTitles.table3ASPerformance
            },
            diagnostischeGueteLiteraturT2Tabelle: {
                id: 'pub-table-diagnostische-guete-literatur',
                titleKey: 'table4LiteratureT2Performance'
            },
            diagnostischeGueteOptimierteT2Tabelle: {
                id: 'pub-table-diagnostische-guete-optimiert',
                titleKey: 'table5OptimizedT2Performance' // Platzhalter [METRIC] wird später ersetzt
            },
            vergleichPerformanceTabelle: {
                id: 'pub-table-vergleich-performance',
                titleKey: 'table6ComparisonPerformance'
            },
            // Chart-Titel werden dynamisch aus UI_TEXTS.publikationTab.figureCaptions bezogen
            alterVerteilungChart: {
                id: 'pub-chart-alter-Gesamt',
                captionKey: 'figure1aAgeDistribution'
            },
            geschlechtVerteilungChart: {
                id: 'pub-chart-gender-Gesamt',
                captionKey: 'figure1bGenderDistribution'
            },
            vergleichChartGesamt: {
                id: 'pub-chart-vergleich-Gesamt',
                captionKey: 'figure2aComparisonGesamt'
            },
            vergleichChartDirektOP: {
                id: 'pub-chart-vergleich-direkt-OP',
                captionKey: 'figure2bComparisonDirektOP'
            },
            vergleichChartNRCT: {
                id: 'pub-chart-vergleich-nRCT',
                captionKey: 'figure2cComparisonNRCT'
            }
        })
    })
});

if (typeof Object.freeze === 'function') {
    Object.freeze(PUBLICATION_CONFIG);
}
