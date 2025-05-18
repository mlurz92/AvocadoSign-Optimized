const APP_CONFIG = Object.freeze({
    APP_NAME: "Lymphknoten T2 - Avocado Sign Analyse",
    APP_VERSION: "2.1.0",

    DEFAULT_SETTINGS: Object.freeze({
        ACTIVE_TAB: 'daten-tab',
        KOLLEKTIV: 'Gesamt',
        T2_LOGIC: 'UND',
        DATEN_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        AUSWERTUNG_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        PUBLIKATION_LANG: 'de',
        PUBLIKATION_SECTION: 'methoden',
        STATS_LAYOUT: 'einzel',
        STATS_KOLLEKTIV1: 'Gesamt',
        STATS_KOLLEKTIV2: 'nRCT',
        PRESENTATION_VIEW: 'as-pur',
        PRESENTATION_STUDY_ID: null,
        CRITERIA_COMPARISON_SETS: Object.freeze([
            'avocado_sign',
            'applied_criteria',
            'rutegard_et_al_esgar',
            'koh_2008_morphology',
            'barbaro_2024_restaging'
        ]),
        CHART_COLOR_SCHEME: 'default',
        BRUTE_FORCE_METRIC: 'Balanced Accuracy'
    }),

    STORAGE_KEYS: Object.freeze({
        APPLIED_CRITERIA: 'avocadoSign_appliedT2Criteria_v2.1',
        APPLIED_LOGIC: 'avocadoSign_appliedT2Logic_v2.1',
        CURRENT_KOLLEKTIV: 'avocadoSign_currentKollektiv_v2.1',
        DATEN_TABLE_SORT: 'avocadoSign_datenTableSort_v2.1',
        AUSWERTUNG_TABLE_SORT: 'avocadoSign_auswertungTableSort_v2.1',
        PUBLIKATION_LANG: 'avocadoSign_currentPublikationLang_v2.1',
        PUBLIKATION_SECTION: 'avocadoSign_currentPublikationSection_v2.1',
        STATS_LAYOUT: 'avocadoSign_currentStatsLayout_v2.1',
        STATS_KOLLEKTIV1: 'avocadoSign_currentStatsKollektiv1_v2.1',
        STATS_KOLLEKTIV2: 'avocadoSign_currentStatsKollektiv2_v2.1',
        PRESENTATION_VIEW: 'avocadoSign_currentPresentationView_v2.1',
        PRESENTATION_STUDY_ID: 'avocadoSign_currentPresentationStudyId_v2.1',
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
        ICON_SIZE: 18,
        ICON_STROKE_WIDTH: 1.5,
        ICON_COLOR: 'var(--icon-color)',
        ICON_COLOR_INACTIVE: 'var(--icon-color-inactive)',
        DEFAULT_TABLE_ROWS_PER_PAGE: 50,
        TOOLTIP_DELAY: Object.freeze([300, 100]),
        TOAST_DURATION_MS: 4000,
        TRANSITION_DURATION_MS: 250,
        MODAL_BACKDROP_OPACITY: 0.5,
        SPINNER_DELAY_MS: 200,
        PUBLIKATION_SECTIONS: Object.freeze([
            { id: 'methoden', label_de: 'Methoden', label_en: 'Methods', icon: 'fas fa-cogs' },
            { id: 'ergebnisse', label_de: 'Ergebnisse', label_en: 'Results', icon: 'fas fa-chart-pie' }
        ])
    }),

    CHART_SETTINGS: Object.freeze({
        DEFAULT_WIDTH: 450,
        DEFAULT_HEIGHT: 350,
        DEFAULT_MARGIN: Object.freeze({ top: 30, right: 30, bottom: 60, left: 60 }),
        COMPACT_PIE_MARGIN: Object.freeze({ top: 10, right: 10, bottom: 40, left: 10 }),
        COLOR_SCHEMES: Object.freeze({
            default: Object.freeze(['#4472C4', '#E0DC2C', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#ff7f0e', '#1f77b4', '#aec7e8', '#ffbb78']),
            avocadoT2: Object.freeze(['var(--primary-color)', 'var(--accent-color)']),
        }),
        AS_COLOR: 'var(--primary-color)',
        T2_COLOR: 'var(--accent-color)',
        NEW_PRIMARY_COLOR_BLUE: '#4472C4',
        NEW_SECONDARY_COLOR_YELLOW_GREEN: '#E0DC2C',
        TERTIARY_COLOR_GREEN: '#2ca02c',
        ANIMATION_DURATION_MS: 600,
        AXIS_LABEL_FONT_SIZE: '11px',
        TICK_LABEL_FONT_SIZE: '10px',
        LEGEND_FONT_SIZE: '10px',
        TOOLTIP_FONT_SIZE: '11px',
        PLOT_BACKGROUND_COLOR: 'var(--bg-white)',
        GRIDLINE_COLOR: 'var(--chart-grid-color)',
        ENABLE_GRIDLINES: true,
        POINT_RADIUS: 3.5,
        LINE_STROKE_WIDTH: 2
    }),

    EXPORT_SETTINGS: Object.freeze({
        DATE_FORMAT: 'YYYYMMDD',
        FILENAME_TEMPLATE: 'AvocadoSignT2_{TYPE}_{KOLLEKTIV}_{DATE}.{EXT}',
        TABLE_PNG_EXPORT_SCALE: 1.5,
        TABLE_PNG_DEFAULT_BASE_WIDTH: 700,
        ENABLE_TABLE_PNG_EXPORT: true,
        CSV_DELIMITER: ';',
        COMPREHENSIVE_REPORT_LOGO_URL: '',
        INCLUDE_TIMESTAMP_IN_FILENAME: false,
        FILENAME_TYPES: Object.freeze({
            STATS_CSV: 'Statistik_Gesamt',
            BRUTEFORCE_TXT: 'BruteForce_Bericht',
            DESKRIPTIV_MD: 'Deskriptive_Statistik_MD',
            PATIENTEN_MD: 'Patientenliste_MD',
            AUSWERTUNG_MD: 'Auswertungstabelle_MD',
            FILTERED_DATA_CSV: 'Rohdaten_Export',
            COMPREHENSIVE_REPORT_HTML: 'Analysebericht_Komplett',
            CHART_SINGLE_PNG: '{ChartName}_Einzel_PNG',
            CHART_SINGLE_SVG: '{ChartName}_Einzel_SVG',
            TABLE_PNG_EXPORT: '{TableName}_Tabelle_PNG',
            PRAES_AS_PERF_CSV: 'Praes_AS_Performance_CSV',
            PRAES_AS_PERF_MD: 'Praes_AS_Performance_MD',
            PRAES_AS_VS_T2_PERF_CSV: 'Praes_AS_vs_T2_Perf_{StudyID}_CSV',
            PRAES_AS_VS_T2_PERF_MD: 'Praes_AS_vs_T2_Perf_{StudyID}_MD',
            PRAES_AS_VS_T2_TESTS_MD: 'Praes_AS_vs_T2_Tests_{StudyID}_MD',
            PRAES_AS_VS_T2_CHART_PNG: 'Praes_AS_vs_T2_Chart_{StudyID}_PNG',
            PRAES_AS_VS_T2_CHART_SVG: 'Praes_AS_vs_T2_Chart_{StudyID}_SVG',
            CRITERIA_COMPARISON_MD: 'Kriterienvergleich_Statistik_MD',
            ALL_ZIP: 'Gesamtpaket_Alle_Dateien_ZIP',
            CSV_ZIP: 'Paket_Alle_CSVs_ZIP',
            MD_ZIP: 'Paket_Alle_MDs_ZIP',
            PNG_ZIP: 'Paket_Alle_PNGs_ZIP',
            SVG_ZIP: 'Paket_Alle_SVGs_ZIP'
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
        INCLUDE_AS_VS_T2_COMPARISON_CHART: false,
        INCLUDE_ASSOCIATIONS_TABLE: true,
        INCLUDE_BRUTEFORCE_BEST_RESULT: true,
        REPORT_TITLE: 'Analysebericht: Avocado Sign vs. T2-Kriterien bei Rektumkarzinom',
        REPORT_AUTHOR: `Generiert durch ${"Lymphknoten T2 - Avocado Sign Analyse"} v${"2.1.0"}`,
        REPORT_LOGO_ALT_TEXT: 'Institutslogo (falls vorhanden)'
    }),

    SPECIAL_IDS: Object.freeze({
        APPLIED_CRITERIA_STUDY_ID: 'applied_criteria',
        APPLIED_CRITERIA_DISPLAY_NAME: 'Aktuell eingestellte T2 Kriterien',
        AVOCADO_SIGN_ID: 'avocado_sign',
        AVOCADO_SIGN_DISPLAY_NAME: 'Avocado Sign'
    })
});

function getDefaultT2Criteria() {
    return Object.freeze({
        logic: APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC,
        size: Object.freeze({ active: true, threshold: 5.0, condition: '>=' }),
        form: Object.freeze({ active: false, value: 'rund' }),
        kontur: Object.freeze({ active: false, value: 'irregulär' }),
        homogenitaet: Object.freeze({ active: false, value: 'heterogen' }),
        signal: Object.freeze({ active: false, value: 'signalreich' })
    });
}