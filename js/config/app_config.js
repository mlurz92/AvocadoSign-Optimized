const APP_CONFIG = Object.freeze({
    APP_NAME: "Lymphknoten T2 - Avocado Sign Analyse Tool",
    APP_VERSION: "2.3.1",
    STORAGE_PREFIX: "avocadoSignTool",
    LOG_LEVEL: "info", 

    STORAGE_KEYS_T2: {
        APPLIED_CRITERIA: `avocadoSignTool.t2Manager.appliedCriteria`,
        APPLIED_LOGIC: `avocadoSignTool.t2Manager.appliedLogic`
    },

    DEFAULT_SETTINGS: {
        DEFAULT_KOLLEKTIV: "nRCT", 
        DEFAULT_TAB_ID: "auswertung-tab",
        DEFAULT_T2_CRITERIA: {
            size: { active: true, threshold: 5.0 },
            form: { active: true, value: "rund" },
            kontur: { active: true, value: "irregulär" },
            homogenitaet: { active: true, value: "heterogen" },
            signal: { active: false, value: "signalreich" } 
        },
        DEFAULT_T2_LOGIC: "KOMBINIERT", 
        DEFAULT_STATISTIK_LAYOUT: "einzel",
        DEFAULT_KOLLEKTIV_VERGLEICH1: "direkt OP",
        DEFAULT_KOLLEKTIV_VERGLEICH2: "nRCT",
        DEFAULT_PRAESENTATION_VIEW: "as-vs-t2",
        DEFAULT_PRAESENTATION_STUDY_ID: "beets_tan_2018_esgar", 
        DEFAULT_PUBLIKATION_LANG: "de",
        DEFAULT_PUBLIKATION_SECTION: "methoden_studienanlage",
        DEFAULT_PUBLIKATION_BF_METRIC: "Balanced Accuracy",
        BRUTE_FORCE_METRIC: "Balanced Accuracy" 
    },

    T2_CRITERIA_SETTINGS: {
        SIZE_RANGE: { min: 3.0, max: 15.0, step: 0.1, default: 5.0 },
        FORM_VALUES: ["rund", "oval"],
        KONTUR_VALUES: ["scharf", "irregulär", "spikuliert"],
        HOMOGENITAET_VALUES: ["homogen", "heterogen"],
        SIGNAL_VALUES: ["signalarm", "intermediär", "signalreich", "null"], 
        DEFAULT_LOGIC: "KOMBINIERT"
    },

    STATISTICAL_CONSTANTS: {
        SIGNIFICANCE_LEVEL: 0.05,
        P_VALUE_THRESHOLD_LESS_THAN: 0.001,
        P_VALUE_PRECISION: 3,
        P_VALUE_PRECISION_TEXT: 4,
        BOOTSTRAP_CI_REPLICATIONS: 1000,
        ENABLE_BOOTSTRAP_CI_FOR_DERIVED_METRICS: true,
        MCNEMAR_USE_CONTINUITY_CORRECTION_SMALL_N: true
    },
    
    PERFORMANCE_SETTINGS: {
        DEBOUNCE_DELAY_MS: 250,
        PROGRESS_REPORT_INTERVAL: 100, 
        BRUTE_FORCE_MAX_TOP_RESULTS: 20
    },

    WORKER_PATHS: {
        BRUTE_FORCE: 'workers/brute_force_worker.js' 
    },

    EXPORT_SETTINGS: {
        DATE_FORMAT: "YYYYMMDD_HHmm",
        FILENAME_TEMPLATE: "AvocadoSignAnalyse_{TYPE}_{KOLLEKTIV}_{DATE}.{EXT}",
        FILENAME_TYPES: {
            STATS_CSV: "Statistik_Gesamt",
            BRUTEFORCE_TXT: "BruteForce_Bericht",
            DESKRIPTIV_MD: "Deskriptive_Statistik_MD",
            DATEN_MD: "Datenliste_MD",
            AUSWERTUNG_MD: "Auswertungstabelle_MD",
            FILTERED_DATA_CSV: "Rohdaten_Export",
            COMPREHENSIVE_REPORT_HTML: "Gesamtbericht_HTML",
            PUBLIKATION_GESAMT_MD: "Publikationsentwurf_MD",
            CHART_SINGLE_PNG: "Diagramm",
            CHART_SINGLE_SVG: "Diagramm_Vektor",
            TABLE_PNG_EXPORT: "Tabelle",
            ALL_ZIP: "Gesamtpaket_Alle_Dateien",
            CSV_ZIP: "Paket_CSVs",
            MD_ZIP: "Paket_Markdown",
            PNG_ZIP: "Paket_Diagramme_Tabellen_PNG",
            SVG_ZIP: "Paket_Diagramme_SVG"
        },
        ENABLE_TABLE_PNG_EXPORT: true,
        TABLE_PNG_SCALE_FACTOR: 2,
        TABLE_PNG_BACKGROUND_COLOR: '#FFFFFF'
    },

    CHART_SETTINGS: {
        DEFAULT_WIDTH: 600,
        DEFAULT_HEIGHT: 400,
        DEFAULT_MARGIN: { top: 40, right: 30, bottom: 60, left: 70 },
        COMPACT_PIE_MARGIN: { top: 5, right: 5, bottom: 5, left: 5 },
        PLOT_BACKGROUND_COLOR: '#FFFFFF',
        CHART_LABEL_COLOR: '#333333',
        CHART_AXIS_COLOR: '#444444',
        GRIDLINE_COLOR: '#e0e0e0',
        ENABLE_GRIDLINES: true,
        AS_COLOR: '#8FBC8F', 
        T2_COLOR: '#ADD8E6', 
        NEW_PRIMARY_COLOR_BLUE: '#2E86C1',
        NEW_SECONDARY_COLOR_ORANGE: '#E67E22',
        NEW_TERTIARY_COLOR_GREEN: '#2ECC71',
        NEW_QUATERNARY_COLOR_PURPLE: '#8E44AD',
        NEW_SECONDARY_COLOR_YELLOW_GREEN: '#A2D95E',
        LINE_STROKE_WIDTH: 2.5,
        POINT_RADIUS: 4,
        ERROR_BAR_COLOR: '#555555',
        ERROR_BAR_WIDTH: 1.5,
        ERROR_BAR_CAP_SIZE: 4,
        TOOLTIP_FONT_SIZE: "11px",
        RSNA_CHART_FONT_FAMILY: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        RSNA_CHART_TITLE_FONT_SIZE: "12pt",
        RSNA_CHART_AXIS_LABEL_FONT_SIZE: "10pt",
        RSNA_CHART_TICK_LABEL_FONT_SIZE: "9pt",
        RSNA_CHART_LEGEND_FONT_SIZE: "9pt"
    },
    
    KAPPA_INTERPRETATION_RANGES: {
        poor: "Poor",
        slight: "Slight",
        fair: "Fair",
        moderate: "Moderate",
        substantial: "Substantial",
        almost_perfect: "Almost perfect"
    },
    AUC_INTERPRETATION_RANGES: {
         fail: 0.5, poor: 0.6, fair: 0.7, good: 0.8, excellent: 0.9, outstanding: 1.0
    },
    PHI_INTERPRETATION_RANGES: {
        very_weak: 0.1, weak: 0.2, moderate: 0.3, strong: 0.4, very_strong: 0.5
    },

    SPECIAL_IDS: {
        APPLIED_CRITERIA_STUDY_ID: "__applied_criteria__",
        APPLIED_CRITERIA_DISPLAY_NAME: "Aktuell angewandte Kriterien"
    },

    STUDY_PERIOD: { START_DATE: "2018-01-01", END_DATE: "2023-12-31"},
    ETHICS_INFO: {APPROVAL_NUMBER: "123/24-UA"},
    SOFTWARE_VERSIONS: { R_VERSION: "4.3.2", APP_AUTHOR: "Dr. M. Lurz", APP_INSTITUTION_LOCATION: "Universität Leipzig, Deutschland"},
    MRT_PROTOKOLL: { GERAET_HERSTELLER_MODELL: "Siemens Magnetom Skyra", FELDSTAERKE_TESLA: "3.0", KONTRASTMITTEL_NAME: "Gadovist", KONTRASTMITTEL_DOSIERUNG_MMOL_PER_KG: "0.1"},
    READER_INFO: { RADIOLOGE1_ERFAHRUNG: "10", RADIOLOGE2_ERFAHRUNG: "8", READER1_AS_KEY: "as_status_r1", READER2_AS_KEY: "as_status_r2" },

    LITERATURE_T2_CRITERIA_SETS: [] 
});
