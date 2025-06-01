const APP_CONFIG = Object.freeze({
    APP_NAME: "Lymphknoten T2 - Avocado Sign Analyse",
    APP_VERSION: "2.3.1",

    DEFAULT_SETTINGS: Object.freeze({
        ACTIVE_TAB_ID: 'daten-tab',
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
        CHART_COLOR_SCHEME: 'default',
        BRUTE_FORCE_METRIC: 'Balanced Accuracy'
    }),

    STORAGE_KEYS: Object.freeze({
        ACTIVE_TAB_ID: 'activeTabId_v4.2_detailed',
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
        DATEN_TABLE_SORT: 'datenTableSort_v4.2_detailed',
        AUSWERTUNG_TABLE_SORT: 'auswertungTableSort_v4.2_detailed',
        FIRST_APP_START: 'appFirstStart_v2.3.1'
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
        P_VALUE_PRECISION_TEXT: 3,
        P_VALUE_PRECISION_CSV: 4,
        P_VALUE_THRESHOLD_LESS_THAN: 0.001,
        SIGNIFICANCE_SYMBOLS: Object.freeze([
            { threshold: 0.001, symbol: '***' },
            { threshold: 0.01, symbol: '**' },
            { threshold: 0.05, symbol: '*' }
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
        STICKY_HEADER_OFFSET: '111px',
        RENDER_DELAY_MS: 50
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
        ERROR_BAR_COLOR: '#555555',
        ERROR_BAR_WIDTH: 1.5,
        ERROR_BAR_CAP_SIZE: 4,
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
        RSNA_CHART_FONT_FAMILY: 'Arial, sans-serif',
        RSNA_CHART_TITLE_FONT_SIZE: '12pt',
        RSNA_CHART_AXIS_LABEL_FONT_SIZE: '10pt',
        RSNA_CHART_TICK_LABEL_FONT_SIZE: '9pt',
        RSNA_CHART_LEGEND_FONT_SIZE: '9pt',
        CHART_PNG_TARGET_WIDTH: 1000,
        CHART_AXIS_COLOR: '#333',
        CHART_LABEL_COLOR: '#000'
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
            PRAES_AS_PERF_CSV: 'PraesPerformanceASPUR_CSV',
            PRAES_AS_PERF_MD: 'PraesPerformanceASPUR_MD',
            PRAES_AS_VS_T2_PERF_CSV: 'PraesPerformanceASvsT2_{StudyID}_CSV',
            PRAES_AS_VS_T2_COMP_MD: 'PraesMetricsASvsT2_{StudyID}_MD',
            PRAES_AS_VS_T2_TESTS_MD: 'PraesTestsASvsT2_{StudyID}_MD',
            TABLE_PNG_EXPORT: '{TableName}_PNG',
            CRITERIA_COMPARISON_MD: 'KriterienvergleichMD',
            PUBLIKATION_METHODEN_MD: 'Publikation_{SectionName}_MD',
            PUBLIKATION_ERGEBNISSE_MD: 'Publikation_{SectionName}_MD',
            PUBLIKATION_GESAMT_MD: 'Publikation_Gesamtentwurf_MD'
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
        REPORT_AUTHOR: `Generiert durch AvocadoSign Analyse-Tool v${"2.3.1"}`,
        REPORT_LOGO_ALT_TEXT: 'Institutslogo'
    }),

    SPECIAL_IDS: Object.freeze({
        APPLIED_CRITERIA_STUDY_ID: 'applied_criteria',
        APPLIED_CRITERIA_DISPLAY_NAME: 'Eingestellte T2 Kriterien',
        AVOCADO_SIGN_ID: 'avocado_sign',
        AVOCADO_SIGN_DISPLAY_NAME: 'Avocado Sign'
    }),
    REFERENCES_FOR_PUBLICATION: Object.freeze({
        lurzSchaefer2025: { short: "Lurz & Schäfer (2025)", full: "Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025. DOI: 10.1007/s00330-025-11462-y", file: "docs/Lurz_Schaefer_AvocadoSign_2025.pdf"},
        koh2008: { short: "Koh et al. (2008)", full: "Koh DM, Chau I, Tait D, Wotherspoon A, Cunningham D, Brown G. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys. 2008;71(2):456-461.", file: "docs/Koh_2008.pdf"},
        barbaro2024: { short: "Barbaro et al. (2024)", full: "Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience. Radiother Oncol. 2024;193:110124.", file: "docs/Barbaro_2024.pdf"},
        rutegard2025: { short: "Rutegård et al. (2025)", full: "Rutegård MK, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. Eur Radiol. 2025. DOI: 10.1007/s00330-025-11361-2", file: "docs/Rutegard_2025.pdf"},
        beetsTan2018ESGAR: { short: "Beets-Tan et al. (2018, ESGAR Consensus)", full: "Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol. 2018;28(4):1465-1475.", file: "docs/Beets-Tan_2018.pdf"},
        ethicsVote: {short: "Ethikvotum Nr. 2023-101", full: "Ethikvotum Nr. 2023-101, Ethikkommission der Sächsischen Landesärztekammer"},
        lurzSchaefer2025StudyPeriod: {short: "Studienzeitraum", full: "Januar 2020 bis November 2023"},
        lurzSchaefer2025MRISystem: {short: "MRT-System", full: "3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Deutschland)"},
        lurzSchaefer2025ContrastAgent: {short: "Kontrastmittel", full: "Gadoteridol (ProHance; Bracco Imaging, Mailand, Italien)"},
        lurzSchaefer2025T2SliceThickness: {short: "T2-Schichtdicke", full: "2-3 mm"},
        lurzSchaefer2025RadiologistExperience: {short: "Radiologen-Erfahrung", full: ["29", "7", "19"]},
        brown2003: {short: "Brown et al. (2003)", full: "Brown G, Richards CJ, Bourne MW, et al. Morphologic predictors of lymph node status in rectal cancer with use of high-spatial-resolution MR imaging with histopathologic comparison. Radiology. 2003;227(2):371-377.", file: "docs/Other/Brown_2003.pdf"},
        horvat2019: {short: "Horvat et al. (2019)", full: "Horvat N, Tavares Rocha CC, Clemente Oliveira B, Petkovska I, Gollub MJ. MRI of Rectal Cancer: Tumor Staging, Imaging Techniques, and Management. RadioGraphics. 2019;39(2):367-387.", file: "docs/Other/Horvart_2019.pdf"},
        kaur2012: {short: "Kaur et al. (2012)", full: "Kaur H, Choi H, You YN, et al. MR Imaging for Preoperative Evaluation of Primary Rectal Cancer: Practical Considerations. RadioGraphics. 2012;32(2):389-409.", file: "docs/Other/Kaur_2012.pdf"},
        beetsTan2004: {short: "Vliegen et al. (2005)", full: "Vliegen RFA, Beets GL, von Meyenfeldt MF, et al. Rectal Cancer: MR Imaging in Local Staging-Is Gadolinium-based Contrast Material Helpful?. Radiology. 2005;234(1):179-188.", file: "docs/Other/Beets-Tan 2004.pdf"},
        barbaro2010: {short: "Barbaro et al. (2010)", full: "Barbaro B, Vitale R, Leccisotti L, et al. Restaging Locally Advanced Rectal Cancer with MR Imaging after Chemoradiation Therapy. RadioGraphics. 2010;30(3):699-721.", file: "docs/Other/Barbaro_2010.pdf"},
        lahaye2009: {short: "Lahaye et al. (2009)", full: "Lahaye MJ, Beets GL, Engelen SME, et al. Locally Advanced Rectal Cancer: MR Imaging for Restaging after Neoadjuvant Radiation Therapy with Concomitant Chemotherapy Part II. What Are the Criteria to Predict Involved Lymph Nodes?. Radiology. 2009;252(1):81-91.", file: "docs/Other/Beets-Tan_2009.pdf"}
    }),

    TAB_CONTENT_AREAS: Object.freeze({
        'daten-tab': 'daten-content-area',
        'auswertung-tab': 'auswertung-content-area',
        'statistik-tab': 'statistik-content-area',
        'praesentation-tab': 'praesentation-content-area',
        'publikation-tab': 'publikation-content-area',
        'export-tab': 'export-content-area'
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
