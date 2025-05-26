const APP_CONFIG = Object.freeze({
    APP_NAME: "Lymphknoten T2 - Avocado Sign Analyse",
    APP_VERSION: "2.2.0",

    KOLLEKTIV_IDS: Object.freeze({
        GESAMT: 'Gesamt',
        DIREKT_OP: 'direkt OP',
        NRCT: 'nRCT'
    }),

    DEFAULT_SETTINGS: Object.freeze({
        KOLLEKTIV: 'Gesamt', // Wird später durch APP_CONFIG.KOLLEKTIV_IDS.GESAMT ersetzt
        T2_LOGIC: 'UND',
        DATEN_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        AUSWERTUNG_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        STATS_LAYOUT: 'einzel',
        STATS_KOLLEKTIV1: 'Gesamt', // Wird später durch Konstante ersetzt
        STATS_KOLLEKTIV2: 'nRCT',   // Wird später durch Konstante ersetzt
        PRESENTATION_VIEW: 'as-pur',
        PRESENTATION_STUDY_ID: null,
        PUBLIKATION_LANG: 'de',
        PUBLIKATION_SECTION: 'methoden',
        PUBLIKATION_BRUTE_FORCE_METRIC: 'Balanced Accuracy',
        CRITERIA_COMPARISON_SETS: Object.freeze([
            'avocado_sign',
            'applied_criteria',
            'rutegard_et_al_esgar',
            'koh_2008_morphology',
            'barbaro_2024_restaging',
            'lahaye_et_al_2009_restaging'
        ]),
        CHART_COLOR_SCHEME: 'default',
        BRUTE_FORCE_METRIC: 'Balanced Accuracy',
        DATEN_TABLE_DETAILS_EXPANDED: false,
        AUSWERTUNG_TABLE_DETAILS_EXPANDED: false
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
        CRITERIA_COMPARISON_SETS: 'criteriaComparisonSets_v4.2_detailed',
        CHART_COLOR_SCHEME: 'chartColorScheme_v4.2_detailed',
        STATE_DATEN_TABLE_DETAILS_EXPANDED: 'stateDatenTableDetailsExpanded_v2.2_opt',
        STATE_AUSWERTUNG_TABLE_DETAILS_EXPANDED: 'stateAuswertungTableDetailsExpanded_v2.2_opt',
        // STATE_GLOBAL_BF_INDICATOR_VISIBLE: 'stateGlobalBfIndicatorVisible_v2.2_opt' // Zukünftige Erweiterung
    }),

    PATHS: Object.freeze({
        BRUTE_FORCE_WORKER: 'workers/brute_force_worker.js'
    }),

    PERFORMANCE_SETTINGS: Object.freeze({
        DEBOUNCE_DELAY_MS: 250,
        ENABLE_GPU_ACCELERATION_CSS: true,
        CHART_ANIMATION_THRESHOLD: 50
    }),

    STATISTICAL_CONSTANTS: Object.freeze({
        BOOTSTRAP_CI_REPLICATIONS: 1000,
        BOOTSTRAP_CI_ALPHA: 0.05,
        SIGNIFICANCE_LEVEL: 0.05,
        DEFAULT_CI_METHOD_PROPORTION: 'Wilson Score',
        DEFAULT_CI_METHOD_EFFECTSIZE: 'Bootstrap Percentile',
        FISHER_EXACT_THRESHOLD: 5
    }),

    T2_CRITERIA_SETTINGS: Object.freeze({
        SIZE_RANGE: Object.freeze({ min: 0.1, max: 25.0, step: 0.1 }),
        FORM_VALUES: Object.freeze(['rund', 'oval']),
        KONTUR_VALUES: Object.freeze(['scharf', 'irregulär']),
        HOMOGENITAET_VALUES: Object.freeze(['homogen', 'heterogen']),
        SIGNAL_VALUES: Object.freeze(['signalarm', 'intermediär', 'signalreich'])
    }),

    UI_SETTINGS: Object.freeze({
        ICON_SIZE: 20,
        ICON_STROKE_WIDTH: 1.5,
        ICON_COLOR: 'var(--text-dark)',
        ICON_COLOR_INACTIVE: 'var(--text-medium)',
        DEFAULT_TABLE_ROWS_PER_PAGE: 50,
        TOOLTIP_DELAY: Object.freeze([200, 100]),
        TOAST_DURATION_MS: 4500,
        TRANSITION_DURATION_MS: 350,
        MODAL_BACKDROP_OPACITY: 0.6,
        SPINNER_DELAY_MS: 300,
        GLOBAL_BF_INDICATOR_SELECTOR: '#bf-global-processing-indicator' // Platzhalter für einen globalen Spinner/Indikator
    }),

    CHART_SETTINGS: Object.freeze({
        DEFAULT_WIDTH: 450,
        DEFAULT_HEIGHT: 350,
        DEFAULT_MARGIN: Object.freeze({ top: 30, right: 40, bottom: 70, left: 70 }),
        COMPACT_PIE_MARGIN: Object.freeze({ top: 15, right: 15, bottom: 50, left: 15 }),
        NEW_PRIMARY_COLOR_BLUE: '#4472C4',
        NEW_SECONDARY_COLOR_YELLOW_GREEN: '#E0DC2C',
        TERTIARY_COLOR_GREEN: '#2ca02c',
        AS_COLOR: '#4472C4',
        T2_COLOR: '#E0DC2C',
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
        ROC_CURVE_SETTINGS: Object.freeze({
            showPoints: true,
            pointRadius: 3.5,
            defaultColors: Object.freeze(['#4472C4', '#E0DC2C', '#2ca02c', '#d62728', '#9467bd', '#8c564b']),
            lineWidth: 2.5
        })
    }),

    EXPORT_SETTINGS: Object.freeze({
        DATE_FORMAT: 'YYYYMMDD',
        FILENAME_TEMPLATE: 'AvocadoSignT2_{TYPE}_{KOLLEKTIV}_{DATE}.{EXT}',
        TABLE_PNG_EXPORT_SCALE: 2,
        ENABLE_TABLE_PNG_EXPORT: true,
        CSV_DELIMITER: ';',
        COMPREHENSIVE_REPORT_LOGO_URL: '',
        INCLUDE_TIMESTAMP_IN_FILENAME: false,
        FILENAME_TYPES: Object.freeze({
            STATS_CSV: 'StatistikCSV',
            BRUTEFORCE_TXT: 'BruteForceTXT',
            DESKRIPTIV_MD: 'DeskriptiveStatistikMD',
            DATEN_MD: 'DatenlisteMD',
            AUSWERTUNG_MD: 'AuswertungTabelleMD',
            CHARTS_PNG: 'ChartsPNG',
            CHARTS_SVG: 'ChartsSVG',
            ALL_ZIP: 'GesamtPaketZIP',
            CSV_ZIP: 'CSVPaketZIP',
            MD_ZIP: 'MDPaketZIP',
            PNG_ZIP: 'PNGPaketZIP',
            SVG_ZIP: 'SVGPaketZIP',
            XLSX_ZIP: 'XLSXPaketZIP',
            FILTERED_DATA_CSV: 'GefilterteDatenCSV',
            FILTERED_DATA_XLSX: 'GefilterteDatenXLSX',
            COMPREHENSIVE_REPORT_HTML: 'AnalyseberichtHTML',
            PUBLIKATION_ZIP: 'PublikationsmaterialZIP',
            AUSWERTUNG_XLSX: 'AuswertungTabelleXLSX',
            DATEN_XLSX: 'DatenlisteXLSX',
            STATISTIK_XLSX: 'StatistikUebersichtXLSX',
            CHART_SINGLE_PNG: '{ChartName}_PNG',
            CHART_SINGLE_SVG: '{ChartName}_SVG',
            PRAES_DEMOGRAPHICS_MD: 'PraesDemographicsASPUR_MD',
            PRAES_AS_PERF_CSV: 'PraesPerformanceASPUR_CSV',
            PRAES_AS_PERF_MD: 'PraesPerformanceASPUR_MD',
            PRAES_AS_VS_T2_PERF_CSV: 'PraesPerformanceASvsT2_{StudyID}_CSV',
            PRAES_AS_VS_T2_PERF_MD: 'PraesPerformanceASvsT2_{StudyID}_MD',
            PRAES_AS_VS_T2_TESTS_MD: 'PraesTestsASvsT2_{StudyID}_MD',
            PRAES_AS_VS_T2_CHART_PNG: 'PraesChartASvsT2_{StudyID}_PNG',
            PRAES_AS_VS_T2_CHART_SVG: 'PraesChartASvsT2_{StudyID}_SVG',
            TABLE_PNG_EXPORT: '{TableName}_PNG',
            CRITERIA_COMPARISON_MD: 'KriterienvergleichMD',
            PUBLIKATION_METHODEN_MD: 'Publikation_{SectionName}_MD',
            PUBLIKATION_ERGEBNISSE_MD: 'Publikation_{SectionName}_MD',
            PUBLIKATION_MAIN_SECTION_MD: 'Publikation_{SectionName}_Gesamt_MD'
        }),
        EXCEL_SHEET_NAME_DATEN: 'Datenliste',
        EXCEL_SHEET_NAME_AUSWERTUNG: 'Auswertung',
        EXCEL_SHEET_NAME_STATISTIK: 'Statistik Uebersicht',
        EXCEL_SHEET_NAME_FILTERED: 'Gefilterte Daten',
        EXCEL_SHEET_NAME_KONFIG: 'Konfiguration'
    }),

    REPORT_SETTINGS: Object.freeze({
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
        REPORT_TITLE: 'Analysebericht: Avocado Sign vs. T2-Kriterien bei Rektumkarzinom',
        REPORT_AUTHOR: `Generiert durch Analyse-Tool v${"2.2.0"}`, // APP_CONFIG.APP_VERSION wird hier direkt verwendet, da es oben definiert ist.
        REPORT_LOGO_ALT_TEXT: 'Institutslogo'
    }),

    SPECIAL_IDS: Object.freeze({
        APPLIED_CRITERIA_STUDY_ID: 'applied_criteria',
        APPLIED_CRITERIA_DISPLAY_NAME: 'Eingestellte T2 Kriterien',
        AVOCADO_SIGN_ID: 'avocado_sign',
        AVOCADO_SIGN_DISPLAY_NAME: 'Avocado Sign'
    })
});

(function() {
    APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV = APP_CONFIG.KOLLEKTIV_IDS.GESAMT;
    APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1 = APP_CONFIG.KOLLEKTIV_IDS.GESAMT;
    APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2 = APP_CONFIG.KOLLEKTIV_IDS.NRCT;
    if (APP_CONFIG.REPORT_SETTINGS.REPORT_AUTHOR.includes("${")) {
        APP_CONFIG.REPORT_SETTINGS.REPORT_AUTHOR = `Generiert durch Analyse-Tool v${APP_CONFIG.APP_VERSION}`;
    }
})();

function getDefaultT2Criteria() {
    return Object.freeze({
        logic: APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC,
        size: { active: true, threshold: 5.0, condition: '>=' },
        form: { active: false, value: 'rund' },
        kontur: { active: false, value: 'irregulär' },
        homogenitaet: { active: false, value: 'heterogen' },
        signal: { active: false, value: 'signalreich' }
    });
}
