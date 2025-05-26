const APP_CONFIG = Object.freeze({
    APP_NAME: "Lymphknoten T2 - Avocado Sign Analyse",
    APP_VERSION: "2.2.0",

    DEFAULT_SETTINGS: Object.freeze({
        KOLLEKTIV: 'Gesamt',
        T2_LOGIC: 'UND',
        DATEN_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        AUSWERTUNG_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        STATS_LAYOUT: 'einzel',
        STATS_KOLLEKTIV1: 'Gesamt',
        STATS_KOLLEKTIV2: 'nRCT',
        PRESENTATION_VIEW: 'as-pur',
        PRESENTATION_STUDY_ID: null, // Explizit null als Standard, wird ggf. in state.js gesetzt
        PUBLIKATION_LANG: 'de', // Standard-Sprache für Publikations-Tab
        PUBLIKATION_SECTION: 'methoden', // Standard-Sektion für Publikations-Tab
        PUBLIKATION_BRUTE_FORCE_METRIC: 'Balanced Accuracy', // Standard-Metrik für Publikations-Tab BF-Teil
        CRITERIA_COMPARISON_SETS: Object.freeze([
            'avocado_sign',
            'applied_criteria',
            'rutegard_et_al_esgar',
            'koh_2008_morphology',
            'barbaro_2024_restaging'
        ]),
        CHART_COLOR_SCHEME: 'default', // Beibehalten, falls Farbschemata implementiert werden
        BRUTE_FORCE_METRIC: 'Balanced Accuracy' // Standard für den Auswertung-Tab
    }),

    STORAGE_KEYS: Object.freeze({
        APPLIED_CRITERIA: 'appliedT2Criteria_v4.2_detailed',
        APPLIED_LOGIC: 'appliedT2Logic_v4.2_detailed',
        CURRENT_KOLLEKTIV: 'currentKollektiv_v4.2_detailed',
        PUBLIKATION_LANG: 'currentPublikationLang_v4.2_detailed',
        PUBLIKATION_SECTION: 'currentPublikationSection_v4.2_detailed',
        PUBLIKATION_BRUTE_FORCE_METRIC: 'currentPublikationBfMetric_v4.2_detailed',
        STATS_LAYOUT: 'currentStatsLayout_v4.2_detailed',
        STATS_KOLLEKTIV1: 'currentStatsKollektiv1_v4.2_detailed',
        STATS_KOLLEKTIV2: 'currentStatsKollektiv2_v4.2_detailed',
        PRESENTATION_VIEW: 'currentPresentationView_v4.2_detailed',
        PRESENTATION_STUDY_ID: 'currentPresentationStudyId_v4.2_detailed',
        CRITERIA_COMPARISON_SETS: 'criteriaComparisonSets_v4.2_detailed', // Nicht mehr direkt im Code, aber Key bleibt relevant
        CHART_COLOR_SCHEME: 'chartColorScheme_v4.2_detailed' // Nicht mehr direkt im Code, aber Key bleibt relevant
    }),

    PATHS: Object.freeze({
        BRUTE_FORCE_WORKER: 'workers/brute_force_worker.js'
    }),

    PERFORMANCE_SETTINGS: Object.freeze({
        DEBOUNCE_DELAY_MS: 250,
        ENABLE_GPU_ACCELERATION_CSS: true, // Bisher nicht aktiv genutzt, aber gute Option
        CHART_ANIMATION_THRESHOLD: 50 // Für zukünftige Performance-Optimierungen in Charts
    }),

    STATISTICAL_CONSTANTS: Object.freeze({
        BOOTSTRAP_CI_REPLICATIONS: 1000,
        BOOTSTRAP_CI_ALPHA: 0.05,
        SIGNIFICANCE_LEVEL: 0.05,
        DEFAULT_CI_METHOD_PROPORTION: 'Wilson Score',
        DEFAULT_CI_METHOD_EFFECTSIZE: 'Bootstrap Percentile',
        FISHER_EXACT_THRESHOLD: 5 // Grenzwert für Zellenhäufigkeit in Kontingenztabellen
    }),

    T2_CRITERIA_SETTINGS: Object.freeze({
        SIZE_RANGE: Object.freeze({ min: 0.1, max: 25.0, step: 0.1 }),
        FORM_VALUES: Object.freeze(['rund', 'oval']),
        KONTUR_VALUES: Object.freeze(['scharf', 'irregulär']),
        HOMOGENITAET_VALUES: Object.freeze(['homogen', 'heterogen']),
        SIGNAL_VALUES: Object.freeze(['signalarm', 'intermediär', 'signalreich'])
    }),

    UI_SETTINGS: Object.freeze({
        ICON_SIZE: 20, // px
        ICON_STROKE_WIDTH: 1.5, // px
        ICON_COLOR: 'var(--text-dark)',
        ICON_COLOR_INACTIVE: 'var(--text-medium)',
        DEFAULT_TABLE_ROWS_PER_PAGE: 50, // Für zukünftige Paginierung
        TOOLTIP_DELAY: Object.freeze([200, 100]), // [show, hide] in ms
        TOAST_DURATION_MS: 4500,
        TRANSITION_DURATION_MS: 350, // Für CSS-Übergänge
        MODAL_BACKDROP_OPACITY: 0.6,
        SPINNER_DELAY_MS: 300 // Verzögerung bevor Ladespinner angezeigt wird
    }),

    CHART_SETTINGS: Object.freeze({
        DEFAULT_WIDTH: 450,
        DEFAULT_HEIGHT: 350,
        DEFAULT_MARGIN: Object.freeze({ top: 30, right: 40, bottom: 70, left: 70 }),
        COMPACT_PIE_MARGIN: Object.freeze({ top: 15, right: 15, bottom: 50, left: 15 }),
        NEW_PRIMARY_COLOR_BLUE: '#4472C4',
        NEW_SECONDARY_COLOR_YELLOW_GREEN: '#E0DC2C',
        TERTIARY_COLOR_GREEN: '#2ca02c',
        AS_COLOR: '#4472C4', // Farbe für Avocado Sign in Diagrammen
        T2_COLOR: '#E0DC2C', // Standardfarbe für T2-Kriterien in Diagrammen
        ANIMATION_DURATION_MS: 750,
        AXIS_LABEL_FONT_SIZE: '11px',
        TICK_LABEL_FONT_SIZE: '10px',
        LEGEND_FONT_SIZE: '10px',
        TOOLTIP_FONT_SIZE: '11px',
        PLOT_BACKGROUND_COLOR: '#ffffff',
        GRIDLINE_COLOR: '#e9ecef',
        ENABLE_GRIDLINES: true,
        POINT_RADIUS: 4,
        LINE_STROKE_WIDTH: 2,
        COLOR_SCHEMES: Object.freeze({ // Für zukünftige Erweiterung, falls Farbschemata wählbar sein sollen
            default: ['#4472C4', '#E0DC2C', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']
        })
    }),

    EXPORT_SETTINGS: Object.freeze({
        DATE_FORMAT: 'YYYYMMDD',
        FILENAME_TEMPLATE: 'AvocadoSignT2_{TYPE}_{KOLLEKTIV}_{DATE}.{EXT}',
        TABLE_PNG_EXPORT_SCALE: 2, // Skalierungsfaktor für PNG-Export von Tabellen
        ENABLE_TABLE_PNG_EXPORT: true,
        CSV_DELIMITER: ';',
        COMPREHENSIVE_REPORT_LOGO_URL: '', // Pfad zu einem Logo für den HTML-Report
        INCLUDE_TIMESTAMP_IN_FILENAME: false, // Ob Zeitstempel in Dateinamen soll
        FILENAME_TYPES: Object.freeze({
            STATS_CSV: 'StatistikCSV',
            BRUTEFORCE_TXT: 'BruteForceTXT',
            DESKRIPTIV_MD: 'DeskriptiveStatistikMD',
            DATEN_MD: 'DatenlisteMD',
            AUSWERTUNG_MD: 'AuswertungTabelleMD',
            CHARTS_PNG: 'ChartsPNG', // Veraltet, wird durch spezifischere ersetzt oder als Sammelbegriff für ZIPs genutzt
            CHARTS_SVG: 'ChartsSVG', // Veraltet, s.o.
            ALL_ZIP: 'GesamtPaketZIP',
            CSV_ZIP: 'CSVPaketZIP',
            MD_ZIP: 'MDPaketZIP',
            PNG_ZIP: 'BildPaketPNG', // Umbenannt für Klarheit (enthält Charts & Tabellen-PNGs)
            SVG_ZIP: 'DiagrammPaketSVG',
            XLSX_ZIP: 'ExcelPaketXLSX',
            FILTERED_DATA_CSV: 'GefilterteDatenCSV',
            FILTERED_DATA_XLSX: 'GefilterteDatenXLSX',
            COMPREHENSIVE_REPORT_HTML: 'AnalyseberichtHTML',
            AUSWERTUNG_XLSX: 'AuswertungTabelleXLSX', // Für zukünftige Excel-Exporte
            DATEN_XLSX: 'DatenlisteXLSX',
            STATISTIK_XLSX: 'StatistikUebersichtXLSX',
            CHART_SINGLE_PNG: '{ChartName}_PNG',
            CHART_SINGLE_SVG: '{ChartName}_SVG',
            TABLE_PNG_EXPORT: '{TableName}_PNG',
            PRAES_DEMOGRAPHICS_MD: 'PraesDemographicsASPUR_MD',
            PRAES_AS_PERF_CSV: 'PraesPerformanceASPUR_CSV',
            PRAES_AS_PERF_MD: 'PraesPerformanceASPUR_MD',
            PRAES_AS_VS_T2_PERF_CSV: 'PraesPerformanceASvsT2_{StudyID}_CSV',
            PRAES_AS_VS_T2_PERF_MD: 'PraesPerformanceASvsT2_{StudyID}_MD',
            PRAES_AS_VS_T2_TESTS_MD: 'PraesTestsASvsT2_{StudyID}_MD',
            PRAES_AS_VS_T2_CHART_PNG: 'PraesChartASvsT2_{StudyID}_PNG', // Für den Fall, dass spezifische Präsentationscharts exportiert werden
            PRAES_AS_VS_T2_CHART_SVG: 'PraesChartASvsT2_{StudyID}_SVG',
            CRITERIA_COMPARISON_MD: 'KriterienvergleichMD',
            PUBLIKATION_METHODEN_MD: 'Publikation_{SectionName}_MD', // Dynamischer für Sektionen
            PUBLIKATION_ERGEBNISSE_MD: 'Publikation_{SectionName}_MD'
        }),
        EXCEL_SHEET_NAME_DATEN: 'Datenliste', // Für zukünftige Excel-Exporte
        EXCEL_SHEET_NAME_AUSWERTUNG: 'Auswertung',
        EXCEL_SHEET_NAME_STATISTIK: 'Statistik Uebersicht',
        EXCEL_SHEET_NAME_FILTERED: 'Gefilterte Daten',
        EXCEL_SHEET_NAME_KONFIG: 'Konfiguration'
    }),

    REPORT_SETTINGS: Object.freeze({ // Einstellungen für den umfassenden HTML-Report
        INCLUDE_APP_VERSION: true,
        INCLUDE_GENERATION_TIMESTAMP: true,
        INCLUDE_KOLLEKTIV_INFO: true,
        INCLUDE_T2_CRITERIA: true,
        INCLUDE_DESCRIPTIVES_TABLE: true,
        INCLUDE_DESCRIPTIVES_CHARTS: true,
        INCLUDE_AS_PERFORMANCE_TABLE: true,
        INCLUDE_T2_PERFORMANCE_TABLE: true,
        INCLUDE_AS_VS_T2_COMPARISON_TABLE: true,
        INCLUDE_AS_VS_T2_COMPARISON_CHART: true,
        INCLUDE_ASSOCIATIONS_TABLE: true,
        INCLUDE_BRUTEFORCE_BEST_RESULT: true,
        REPORT_TITLE: 'Analysebericht: Avocado Sign vs. T2-Kriterien bei Rektumkarzinom', // Titel für HTML Report
        REPORT_AUTHOR: `Generiert durch ${"Lymphknoten T2 - Avocado Sign Analyse"} v${"2.2.0"}`, // Dynamisch aus APP_NAME und APP_VERSION
        REPORT_LOGO_ALT_TEXT: 'Institutslogo' // Alt-Text für ein optionales Logo im Report
    }),

    SPECIAL_IDS: Object.freeze({ // IDs für spezielle, nicht-Literatur-basierte Kriteriensets
        APPLIED_CRITERIA_STUDY_ID: 'applied_criteria',
        APPLIED_CRITERIA_DISPLAY_NAME: 'Eingestellte T2 Kriterien', // Wird in UI_TEXTS sprachabhängig
        AVOCADO_SIGN_ID: 'avocado_sign',
        AVOCADO_SIGN_DISPLAY_NAME: 'Avocado Sign' // Wird in UI_TEXTS sprachabhängig
    })
});

function getDefaultT2Criteria() { // Funktion bleibt erhalten, da sie von t2CriteriaManager verwendet wird
    return Object.freeze({
        logic: APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC,
        size: { active: true, threshold: 5.0, condition: '>=' },
        form: { active: false, value: 'rund' },
        kontur: { active: false, value: 'irregulär' },
        homogenitaet: { active: false, value: 'heterogen' },
        signal: { active: false, value: 'signalreich' }
    });
}
