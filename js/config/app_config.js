const APP_CONFIG = Object.freeze({
    APP_NAME: "Lymphknoten T2 - Avocado Sign Analyse",
    APP_VERSION: "2.3.0",

    DEFAULT_SETTINGS: Object.freeze({
        KOLLEKTIV: 'Gesamt',
        T2_LOGIC: 'UND',
        DATEN_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        AUSWERTUNG_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        STATS_LAYOUT: 'einzel',
        STATS_KOLLEKTIV1: 'Gesamt',
        STATS_KOLLEKTIV2: 'nRCT',
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
            'barbaro_2024_restaging'
        ]),
        BRUTE_FORCE_METRIC: 'Balanced Accuracy'
    }),

    STORAGE_KEYS: Object.freeze({
        APPLIED_CRITERIA: `appliedT2Criteria_v${"2.3.0".replace(/\./g, '_')}`,
        APPLIED_LOGIC: `appliedT2Logic_v${"2.3.0".replace(/\./g, '_')}`,
        CURRENT_KOLLEKTIV: `currentKollektiv_v${"2.3.0".replace(/\./g, '_')}`,
        PUBLIKATION_LANG: `currentPublikationLang_v${"2.3.0".replace(/\./g, '_')}`,
        PUBLIKATION_SECTION: `currentPublikationSection_v${"2.3.0".replace(/\./g, '_')}`,
        PUBLIKATION_BRUTE_FORCE_METRIC: `currentPublikationBfMetric_v${"2.3.0".replace(/\./g, '_')}`,
        STATS_LAYOUT: `currentStatsLayout_v${"2.3.0".replace(/\./g, '_')}`,
        STATS_KOLLEKTIV1: `currentStatsKollektiv1_v${"2.3.0".replace(/\./g, '_')}`,
        STATS_KOLLEKTIV2: `currentStatsKollektiv2_v${"2.3.0".replace(/\./g, '_')}`,
        PRESENTATION_VIEW: `currentPresentationView_v${"2.3.0".replace(/\./g, '_')}`,
        PRESENTATION_STUDY_ID: `currentPresentationStudyId_v${"2.3.0".replace(/\./g, '_')}`,
        CRITERIA_COMPARISON_SETS: `criteriaComparisonSets_v${"2.3.0".replace(/\./g, '_')}`,
        CHART_COLOR_SCHEME: `chartColorScheme_v${"2.3.0".replace(/\./g, '_')}`,
        FIRST_APP_START: `appFirstStart_v${"2.3.0".replace(/\./g, '_')}`
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
        BOOTSTRAP_CI_REPLICATIONS: 5000,
        BOOTSTRAP_CI_ALPHA: 0.05,
        SIGNIFICANCE_LEVEL: 0.05,
        SIGNIFICANCE_SYMBOLS: Object.freeze([
            Object.freeze({ threshold: 0.001, symbol: '***' }),
            Object.freeze({ threshold: 0.01, symbol: '**' }),
            Object.freeze({ threshold: 0.05, symbol: '*' })
        ]),
        DEFAULT_CI_METHOD_PROPORTION: 'Wilson Score',
        DEFAULT_CI_METHOD_EFFECTSIZE: 'Bootstrap Percentile',
        FISHER_EXACT_THRESHOLD: 5,
        CI_WARNING_SAMPLE_SIZE_THRESHOLD: 10
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
        TRANSITION_DURATION_MS: 250,
        MODAL_BACKDROP_OPACITY: 0.6,
        SPINNER_DELAY_MS: 300,
        STICKY_HEADER_OFFSET: '111px'
    }),

    CHART_SETTINGS: Object.freeze({
        STANDARD_MARGIN: Object.freeze({ top: 30, right: 40, bottom: 70, left: 70 }),
        COMPACT_PIE_MARGIN: Object.freeze({ top: 15, right: 15, bottom: 50, left: 15 }),
        DEFAULT_WIDTH: 450,
        DEFAULT_HEIGHT: 350,
        COLOR_SCHEMES: Object.freeze({
            default: Object.freeze(['#4472C4', '#E0DC2C', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#ff7f0e', '#1f77b4']),
            colorblindFriendly: Object.freeze(['#0072B2', '#D55E00', '#009E73', '#CC79A7', '#F0E442', '#56B4E9', '#E69F00', '#000000'])
        }),
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
        LINE_STROKE_WIDTH: 2
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
            ALL_ZIP: 'GesamtPaketZIP',
            AUSWERTUNG_MD: 'AuswertungTabelleMD',
            AUSWERTUNG_XLSX: 'AuswertungTabelleXLSX',
            BRUTEFORCE_TXT: 'BruteForceTXT',
            CHART_SINGLE_PNG: '{ChartName}_PNG',
            CHART_SINGLE_SVG: '{ChartName}_SVG',
            CHARTS_PNG: 'ChartsPNG',
            CHARTS_SVG: 'ChartsSVG',
            COMPREHENSIVE_REPORT_HTML: 'AnalyseberichtHTML',
            CRITERIA_COMPARISON_MD: 'KriterienvergleichMD',
            CSV_ZIP: 'CSVPaketZIP',
            DATEN_MD: 'DatenlisteMD',
            DATEN_XLSX: 'DatenlisteXLSX',
            DESKRIPTIV_MD: 'DeskriptiveStatistikMD',
            FILTERED_DATA_CSV: 'GefilterteRohdatenCSV',
            FILTERED_DATA_XLSX: 'GefilterteRohdatenXLSX',
            MD_ZIP: 'MDPaketZIP',
            PNG_ZIP: 'PNGPaketZIP',
            PRAES_AS_PERF_CSV: 'PraesPerformanceASPUR_CSV',
            PRAES_AS_PERF_MD: 'PraesPerformanceASPUR_MD',
            PRAES_AS_VS_T2_COMP_MD: 'PraesMetricsASvsT2_{StudyID}_MD',
            PRAES_AS_VS_T2_PERF_CSV: 'PraesPerformanceASvsT2_{StudyID}_CSV',
            PRAES_AS_VS_T2_TESTS_MD: 'PraesTestsASvsT2_{StudyID}_MD',
            PUBLIKATION_ERGEBNISSE_MD: 'Publikation_{SectionName}_MD',
            PUBLIKATION_METHODEN_MD: 'Publikation_{SectionName}_MD',
            STATISTIK_XLSX: 'StatistikUebersichtXLSX',
            STATS_CSV: 'StatistikCSV',
            SVG_ZIP: 'SVGPaketZIP',
            TABLE_PNG_EXPORT: '{TableName}_PNG',
            XLSX_ZIP: 'XLSXPaketZIP'
        }),
        EXCEL_SHEET_NAMES: Object.freeze({
            DATEN: 'Datenliste',
            AUSWERTUNG: 'Auswertung',
            STATISTIK: 'Statistik_Uebersicht',
            FILTERED_DATA: 'Gefilterte_Rohdaten',
            KONFIGURATION: 'Analyse_Konfiguration',
            BRUTE_FORCE_RESULTS: 'Brute_Force_Ergebnisse'
        })
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
        REPORT_AUTHOR: `Generiert durch Analyse-Tool v${"2.3.0"}`,
        REPORT_LOGO_ALT_TEXT: 'Instituts- oder Studienlogo'
    }),

    SPECIAL_IDS: Object.freeze({
        APPLIED_CRITERIA_STUDY_ID: 'applied_criteria',
        APPLIED_CRITERIA_DISPLAY_NAME: 'Eingestellte T2 Kriterien',
        AVOCADO_SIGN_ID: 'avocado_sign',
        AVOCADO_SIGN_DISPLAY_NAME: 'Avocado Sign'
    }),

    REFERENCES_FOR_PUBLICATION: Object.freeze({
    })
});

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
