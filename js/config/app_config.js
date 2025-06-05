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
        PUBLIKATION_SECTION: 'abstract',
        PUBLIKATION_BRUTE_FORCE_METRIC: 'Balanced Accuracy',
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
        FIRST_APP_START: 'appFirstStart_v2.3'
    }),

    PATHS: Object.freeze({
        BRUTE_FORCE_WORKER: 'workers/brute_force_worker.js',
        // Pfade für neue Publikationsmodule werden hier nicht zwingend benötigt,
        // da sie per script-Tag in index.html geladen werden.
        // Bei dynamischem Laden könnten sie hier ergänzt werden.
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
        TRANSITION_DURATION_MS: 350,
        MODAL_BACKDROP_OPACITY: 0.6,
        SPINNER_DELAY_MS: 300,
        STICKY_HEADER_OFFSET: '111px'
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
            AUSWERTUNG_XLSX: 'AuswertungTabelleXLSX',
            DATEN_XLSX: 'DatenlisteXLSX',
            STATISTIK_XLSX: 'StatistikUebersichtXLSX',
            CHART_SINGLE_PNG: '{ChartName}_PNG',
            CHART_SINGLE_SVG: '{ChartName}_SVG',
            PRAES_DEMOGRAPHICS_MD: 'PraesDemographicsASPUR_MD',
            PRAES_AS_PERF_CSV: 'PraesPerformanceASPUR_CSV',
            PRAES_AS_PERF_MD: 'PraesPerformanceASPUR_MD',
            PRAES_AS_VS_T2_PERF_CSV: 'PraesPerformanceASvsT2_{StudyID}_CSV',
            PRAES_AS_VS_T2_COMP_MD: 'PraesMetricsASvsT2_{StudyID}_MD',
            PRAES_AS_VS_T2_TESTS_MD: 'PraesTestsASvsT2_{StudyID}_MD',
            PRAES_AS_VS_T2_CHART_PNG: 'PraesChartASvsT2_{StudyID}_PNG',
            PRAES_AS_VS_T2_CHART_SVG: 'PraesChartASvsT2_{StudyID}_SVG',
            TABLE_PNG_EXPORT: '{TableName}_PNG',
            CRITERIA_COMPARISON_MD: 'KriterienvergleichMD',
            PUBLIKATION_MAIN_MD: 'Publikation_Gesamt_MD',
            PUBLIKATION_SECTION_MD: 'Publikation_{SectionName}_MD'
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
        REPORT_AUTHOR: `Generiert durch Analyse-Tool v${"2.3.0"}`,
        REPORT_LOGO_ALT_TEXT: 'Institutslogo',
        INCLUDE_KEY_RESULTS: true,
        INCLUDE_SUMMARY_STATEMENT: true
    }),

    PUBLICATION_JOURNAL_REQUIREMENTS: Object.freeze({
        JOURNAL_NAME: "Radiology",
        MANUSCRIPT_TYPE_ORIGINAL_RESEARCH: Object.freeze({
            WORD_LIMIT_MAIN_TEXT: 3000,
            WORD_LIMIT_TITLE: 15,
            ABBREVIATION_LIST_MAX_COUNT: 10,
            ABBREVIATION_MIN_USAGE_FOR_LIST: 10,
            SUMMARY_STATEMENT_WORD_LIMIT: 30,
            KEY_RESULTS_WORD_LIMIT: 75,
            KEY_RESULTS_MAX_POINTS: 3,
            ABSTRACT_WORD_LIMIT: 300,
            INTRODUCTION_WORD_LIMIT: 400,
            MATERIALS_METHODS_WORD_LIMIT: 800,
            RESULTS_WORD_LIMIT: 1000,
            DISCUSSION_WORD_LIMIT: 800,
            REFERENCE_LIMIT: 35,
            FIGURE_LIMIT: 6,
            TABLE_LIMIT: 4
        }),
        MANUSCRIPT_TYPE_TECHNICAL_DEVELOPMENT: Object.freeze({
            WORD_LIMIT_MAIN_TEXT: 2000
        }),
        P_VALUE_FORMAT_RULES: Object.freeze({
            DEFAULT_DIGITS: 2,
            SMALL_P_DIGITS: 3,
            SMALL_P_THRESHOLD: 0.01,
            REPORT_EXACT_THRESHOLD: 0.001,
            MAX_P_VALUE_DISPLAY: 0.99,
            MIN_P_VALUE_DISPLAY_PREFIX: "<",
            NO_LEADING_ZERO: true
        }),
        NUMBER_FORMAT_RULES: Object.freeze({
            AUC: { digits: 2 },
            ICC: { digits: 2 },
            KAPPA: { digits: 2 },
            ADC: { digits: 3, max_digits: 3 },
            ODDS_RATIO: { digits: 2 },
            HAZARD_RATIO: { digits: 2 },
            RISK_RATIO: { digits: 2 },
            PERCENTAGES: { general_digits: 0, min_digits: 0 },
            CORRELATION_COEFFICIENT_RULES: Object.freeze({
                SMALL_SAMPLE_DIGITS: 2,
                LARGE_SAMPLE_DIGITS: 3,
                SAMPLE_THRESHOLD_FOR_DIGITS: 100
            })
        })
    }),

    REFERENCES_FOR_PUBLICATION: Object.freeze({
        LURZ_SCHAEFER_2025_AS: "Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025;XXX:XXX-XXX. DOI: 10.1007/s00330-025-11462-y",
        BARBARO_2024_RESTAGING: "Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience. Radiother Oncol. 2024;193:110124. DOI: 10.1016/j.radonc.2024.110124",
        BEETS_TAN_2018_ESGAR_CONSENSUS: "Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: Updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol. 2018;28(4):1465-1475. DOI: 10.1007/s00330-017-5026-2",
        KOH_2008_MORPHOLOGY: "Koh DM, Chau I, Tait D, Wotherspoon A, Cunningham D, Brown G. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys. 2008;71(2):456-461. DOI: 10.1016/j.ijrobp.2007.10.016",
        RUTEGARD_2025_ESGAR_VALIDATION: "Rutegård MK, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. Eur Radiol. 2025. DOI: 10.1007/s00330-025-11361-2",
        BROWN_2003_MORPHOLOGY: "Brown G, Richards CJ, Bourne MW, et al. Morphologic predictors of lymph node status in rectal cancer with use of high-spatial-resolution MR imaging with histopathologic comparison. Radiology. 2003;227(2):371-377. DOI: 10.1148/radiol.2272011747",
        KAUR_2012_MRI_PRACTICAL: "Kaur H, Choi H, You YN, et al. MR Imaging for Preoperative Evaluation of Primary Rectal Cancer: Practical Considerations. RadioGraphics. 2012;32(2):389-409. DOI: 10.1148/rg.322115122",
        HORVAT_2019_MRI_RECTAL_CANCER: "Horvat N, Carlos Tavares Rocha C, Clemente Oliveira B, Petkovska I, Gollub MJ. MRI of Rectal Cancer: Tumor Staging, Imaging Techniques, and Management. RadioGraphics. 2019;39(2):e1-e24. DOI: 10.1148/rg.2019180114",
        BEETS_TAN_2004_GADOLINIUM: "Vliegen RFA, Beets GL, von Meyenfeldt MF, et al. Rectal Cancer: MR Imaging in Local Staging—Is Gadolinium-based Contrast Material Helpful?. Radiology. 2005;234(1):179-188. DOI: 10.1148/radiol.2341031403",
        BEETS_TAN_2009_USPIO_RESTAGING: "Lahaye MJ, Beets GL, Engelen SME, et al. Locally Advanced Rectal Cancer: MR Imaging for Restaging after Neoadjuvant Radiation Therapy with Concomitant Chemotherapy Part II. What Are the Criteria to Predict Involved Lymph Nodes?. Radiology. 2009;252(1):81-91. DOI: 10.1148/radiol.2521081364",
        BARBARO_2010_RESTAGING_MRI: "Barbaro B, Vitale R, Leccisotti L, et al. Restaging Locally Advanced Rectal Cancer with MR Imaging after Chemoradiation Therapy. RadioGraphics. 2010;30(3):699-721. DOI: 10.1148/rg.303095085",
        RADIOLOGY_STROBE_EXAMPLE: "http://pubs.rsna.org/doi/pdf/10.1148/radiol.2017161218",
        RADIOLOGY_STARD_EXAMPLE: "http://pubs.rsna.org/doi/pdf/10.1148/radiol.2015151516",
        ETHICS_VOTE_LEIPZIG: "Ethikvotum Nr. 2023-101, Ethikkommission der Landesärztekammer Sachsen",
        STUDY_PERIOD_2020_2023: "Januar 2020 und November 2023",
        MRI_SYSTEM_SIEMENS_3T: "3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Deutschland)",
        CONTRAST_AGENT_PROHANCE: "Gadoteridol (ProHance; Bracco Imaging Deutschland GmbH, Konstanz, Deutschland)",
        RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER: Object.freeze(["29", "7", "19"])
    }),

    SPECIAL_IDS: Object.freeze({
        APPLIED_CRITERIA_STUDY_ID: 'applied_criteria',
        APPLIED_CRITERIA_DISPLAY_NAME: 'Eingestellte T2 Kriterien',
        AVOCADO_SIGN_ID: 'avocado_sign',
        AVOCADO_SIGN_DISPLAY_NAME: 'Avocado Sign'
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
