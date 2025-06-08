const APP_CONFIG = Object.freeze({
    APP_NAME: "Avocado Sign vs. T2 Kriterien Analyse",
    APP_VERSION: "2.5.0",
    APP_LOGO_PATH: "img/avocado_sign_logo.png",

    T2_CRITERIA_DEFAULTS: Object.freeze({
        logic: CONSTANTS.LOGIC_OPERATORS.UND,
        [CONSTANTS.T2_CRITERIA_KEYS.SIZE]: { active: true, threshold: 5.0, condition: '>=' },
        [CONSTANTS.T2_CRITERIA_KEYS.FORM]: { active: false, value: 'rund' },
        [CONSTANTS.T2_CRITERIA_KEYS.KONTUR]: { active: false, value: 'irregulär' },
        [CONSTANTS.T2_CRITERIA_KEYS.HOMOGENITAET]: { active: false, value: 'heterogen' },
        [CONSTANTS.T2_CRITERIA_KEYS.SIGNAL]: { active: false, value: 'signalreich' }
    }),

    T2_CRITERIA_SETTINGS: Object.freeze({
        SIZE_RANGE: Object.freeze({ min: 0.1, max: 25.0, step: 0.1 }),
        FORM_VALUES: Object.freeze(['rund', 'oval']),
        KONTUR_VALUES: Object.freeze(['scharf', 'irregulär']),
        HOMOGENITAET_VALUES: Object.freeze(['homogen', 'heterogen']),
        SIGNAL_VALUES: Object.freeze(['signalarm', 'intermediär', 'signalreich'])
    }),

    PATHS: Object.freeze({
        BRUTE_FORCE_WORKER: 'workers/brute_force_worker.js'
    }),

    PERFORMANCE_SETTINGS: Object.freeze({
        DEBOUNCE_DELAY_MS: 250,
        CHART_ANIMATION_THRESHOLD: 50
    }),

    STATISTICAL_CONSTANTS: Object.freeze({
        BOOTSTRAP_CI_REPLICATIONS: 1000,
        BOOTSTRAP_CI_ALPHA: 0.05,
        SIGNIFICANCE_LEVEL: 0.05,
        CI_WARNING_SAMPLE_SIZE_THRESHOLD: 10,
        SIGNIFICANCE_SYMBOLS: Object.freeze([
            { threshold: 0.001, symbol: '***' },
            { threshold: 0.01, symbol: '**' },
            { threshold: 0.05, symbol: '*' }
        ]),
        DEFAULT_CI_METHOD_PROPORTION: 'Wilson Score',
        DEFAULT_CI_METHOD_EFFECTSIZE: 'Bootstrap Percentile',
        FISHER_EXACT_THRESHOLD: 5
    }),

    UI_SETTINGS: Object.freeze({
        TOOLTIP_DELAY: Object.freeze([300, 100]),
        TOAST_DURATION_MS: 4000,
        STICKY_HEADER_OFFSET: '111px'
    }),

    CHART_SETTINGS: Object.freeze({
        AS_COLOR: '#4472C4',
        T2_COLOR: '#E0DC2C',
        DEFAULT_COLOR_SCHEME: ['#4472C4', '#E0DC2C', '#2ca02c', '#d62728', '#9467bd', '#8c564b'],
        PLOT_BACKGROUND_COLOR: '#ffffff',
        ANIMATION_DURATION_MS: 750,
    }),

    EXPORT: Object.freeze({
        DATE_FORMAT: 'YYYYMMDD',
        FILENAME_TEMPLATE: 'AvocadoSign_v2_5_{TYPE}_{KOLLEKTIV}_{DATE}.{EXT}',
        CSV_DELIMITER: ';',
        TABLE_PNG_SCALE: 2,
        FILENAME_TYPES: Object.freeze({
            STATS_CSV: 'Statistik_Uebersicht',
            BRUTEFORCE_TXT: 'BruteForce_Bericht',
            DESKRIPTIV_MD: 'DeskriptiveStatistik',
            DATEN_MD: 'Patientenliste_Daten',
            AUSWERTUNG_MD: 'Patientenliste_Auswertung',
            FILTERED_DATA_CSV: 'Rohdaten_gefiltert',
            COMPREHENSIVE_REPORT_HTML: 'Analysebericht_Komplett',
            PRAES_AS_PERF_CSV: 'Praes_AS_Performance',
            PRAES_AS_PERF_MD: 'Praes_AS_Performance',
            PRAES_AS_VS_T2_PERF_CSV: 'Praes_AS_vs_T2_Performance_{StudyID}',
            PRAES_AS_VS_T2_COMP_MD: 'Praes_AS_vs_T2_Metriken_{StudyID}',
            PRAES_AS_VS_T2_TESTS_MD: 'Praes_AS_vs_T2_Tests_{StudyID}',
            PUBLICATION_FULL_MD: 'Publikation_Manuskript',
            CHART_PNG: 'Chart_{ChartName}',
            CHART_SVG: 'Chart_{ChartName}',
            TABLE_PNG: 'Tabelle_{TableName}',
            ZIP_ALL: 'Gesamtpaket',
            ZIP_CSV: 'CSV_Paket',
            ZIP_MD: 'Markdown_Paket',
            ZIP_PNG: 'Bilder_PNG_Paket',
            ZIP_SVG: 'Vektorgrafiken_SVG_Paket'
        })
    }),

    PUBLICATION_JOURNAL_REQUIREMENTS: Object.freeze({
        WORD_COUNT_MAIN_TEXT_MAX: 3000,
        WORD_COUNT_ABSTRACT_MAX: 300,
        REFERENCE_LIMIT: 35,
        FIGURE_LIMIT: 6,
        TABLE_LIMIT: 4,
        KEY_RESULTS_WORD_LIMIT: 75,
        SUMMARY_STATEMENT_WORD_LIMIT: 30
    })
});
