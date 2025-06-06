const APP_CONFIG = Object.freeze({
    APP_NAME: "Lymphknoten T2 - Avocado Sign Analyse",
    APP_VERSION: "2.5.0",

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
        APPLIED_CRITERIA: 'appliedT2Criteria_v2.5_app',
        APPLIED_LOGIC: 'appliedT2Logic_v2.5_app',
        CURRENT_KOLLEKTIV: 'currentKollektiv_v2.5_app',
        PUBLIKATION_LANG: 'currentPublikationLang_v2.5_app',
        PUBLIKATION_SECTION: 'currentPublikationSection_v2.5_app',
        PUBLIKATION_BRUTE_FORCE_METRIC: 'currentPublikationBfMetric_v2.5_app',
        STATS_LAYOUT: 'currentStatsLayout_v2.5_app',
        STATS_KOLLEKTIV1: 'currentStatsKollektiv1_v2.5_app',
        STATS_KOLLEKTIV2: 'currentStatsKollektiv2_v2.5_app',
        PRESENTATION_VIEW: 'currentPresentationView_v2.5_app',
        PRESENTATION_STUDY_ID: 'currentPresentationStudyId_v2.5_app',
        CRITERIA_COMPARISON_SETS: 'criteriaComparisonSets_v2.5_app',
        CHART_COLOR_SCHEME: 'chartColorScheme_v2.5_app',
        FIRST_APP_START: 'appFirstStart_v2.5'
    }),

    PATHS: Object.freeze({
        BRUTE_FORCE_WORKER: 'workers/brute_force_worker.js',
        PUBLICATION_CONTROLLER: 'js/ui/publication/publication_controller.js',
        PUBLICATION_VIEW_RENDERER: 'js/ui/publication/publication_view_renderer.js',
        PUBLICATION_CONTENT_GENERATOR: 'js/ui/publication/publication_content_generator.js',
        PUBLICATION_TEXT_GENERATOR_RADIOLOGY: 'js/ui/publication/publication_text_generator_radiology.js',
        PUBLICATION_TABLE_GENERATOR_RADIOLOGY: 'js/ui/publication/publication_table_generator_radiology.js',
        PUBLICATION_FIGURE_GENERATOR_RADIOLOGY: 'js/ui/publication/publication_figure_generator_radiology.js'
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
        ICON_SIZE: 16,
        ICON_STROKE_WIDTH: 1.2,
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
        COLOR_SCHEMES: Object.freeze({
            default: Object.freeze(['#4472C4', '#E0DC2C', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#ff7f0e', '#1f77b4'])
        }),
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
            FILTERED_DATA_CSV: 'GefilterteRohdatenCSV',
            FILTERED_DATA_XLSX: 'GefilterteRohdatenXLSX',
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
            PUBLIKATION_METHODEN_MD: 'Publikation_{SectionName}_MD',
            PUBLIKATION_ERGEBNISSE_MD: 'Publikation_{SectionName}_MD',
            PUBLIKATION_ABSTRACT_MD: 'Publikation_Abstract_MD',
            PUBLIKATION_INTRODUCTION_MD: 'Publikation_Introduction_MD',
            PUBLIKATION_DISCUSSION_MD: 'Publikation_Discussion_MD',
            PUBLIKATION_REFERENCES_MD: 'Publikation_References_MD'
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
        REPORT_AUTHOR: `Generiert durch Analyse-Tool v${"2.5.0"}`,
        REPORT_LOGO_ALT_TEXT: 'Institutslogo',
        INCLUDE_KEY_RESULTS: true,
        INCLUDE_SUMMARY_STATEMENT: true
    }),

    PUBLICATION_JOURNAL_REQUIREMENTS: Object.freeze({
        WORD_COUNT_MAIN_TEXT_MAX: 3000,
        WORD_COUNT_ABSTRACT_MAX: 300,
        REFERENCE_LIMIT: 35,
        FIGURE_LIMIT: 6,
        TABLE_LIMIT: 4,
        KEY_RESULTS_WORD_LIMIT: 75,
        SUMMARY_STATEMENT_WORD_LIMIT: 30
    }),

    REFERENCES_FOR_PUBLICATION: Object.freeze({
        SIEGEL_2023_CANCER_STATS: Object.freeze({ id: 'ref-siegel-2023', numberInList: 1, fullCitation: 'Siegel RL, Miller KD, Wagle NS, Jemal A. Cancer statistics, 2023. CA Cancer J Clin. 2023;73(1):17-48. doi:10.3322/caac.21763' }),
        SAUER_2004_NEOADJUVANT: Object.freeze({ id: 'ref-sauer-2004', numberInList: 2, fullCitation: 'Sauer R, Becker H, Hohenberger W, et al. Preoperative versus postoperative chemoradiotherapy for rectal cancer. N Engl J Med. 2004;351(17):1731-1740. doi:10.1056/NEJMoa040694' }),
        BEETS_TAN_2018_ESGAR_CONSENSUS: Object.freeze({ id: 'ref-beets-tan-2018', numberInList: 3, fullCitation: 'Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: Updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol. 2018;28(4):1465-1475. doi:10.1007/s00330-017-5026-2' }),
        AL_SUKHNI_2012_MRI_ACCURACY: Object.freeze({ id: 'ref-al-sukhni-2012', numberInList: 4, fullCitation: 'Al-Sukhni E, Milot L, Fruitman M, et al. Diagnostic accuracy of MRI for assessment of T category, lymph node metastases, and circumferential resection margin involvement in patients with rectal cancer: a systematic review and meta-analysis. Ann Surg Oncol. 2012;19(7):2212-2223. doi:10.1245/s10434-011-2183-1' }),
        TAYLOR_2011_PREOP_MRI: Object.freeze({ id: 'ref-taylor-2011', numberInList: 5, fullCitation: 'Taylor FG, Quirke P, Heald RJ, et al. Preoperative high-resolution magnetic resonance imaging can identify good prognosis stage I, II, and III rectal cancer best managed by surgery alone: a prospective, multicenter, European study. Ann Surg. 2011;253(4):711-719. doi:10.1097/SLA.0b013e31820b8d52' }),
        GARCIA_AGUILAR_2022_ORGAN_PRESERVATION: Object.freeze({ id: 'ref-garcia-aguilar-2022', numberInList: 6, fullCitation: 'Garcia-Aguilar J, Patil S, Gollub MJ, et al. Organ Preservation in Patients With Rectal Adenocarcinoma Treated With Total Neoadjuvant Therapy. J Clin Oncol. 2022;40(23):2546-2556. doi:10.1200/JCO.21.02621' }),
        SCHRAG_2023_PREOP_TREATMENT: Object.freeze({ id: 'ref-schrag-2023', numberInList: 7, fullCitation: 'Schrag D, Shi Q, Weiser MR, et al. Preoperative Treatment of Locally Advanced Rectal Cancer. N Engl J Med. 2023;389(4):322-334. doi:10.1056/NEJMoa2303269' }),
        LURZ_SCHAEFER_AS_2025: Object.freeze({ id: 'ref-lurz-schaefer-2025', numberInList: 8, fullCitation: 'Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025;XXX:XXX-XXX. doi:10.1007/s00330-025-11462-y (Beispiel-DOI)', LURZ_SCHAEFER_AS_2025_DETAILS: {t1VibeSliceThickness: "1.5 mm"} }),
        KOH_2008_MORPHOLOGY: Object.freeze({ id: 'ref-koh-2008', numberInList: 9, fullCitation: 'Koh DM, Chau I, Tait D, Wotherspoon A, Cunningham D, Brown G. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys. 2008;71(2):456-461. doi:10.1016/j.ijrobp.2007.10.016' }),
        BARBARO_2024_RESTAGING: Object.freeze({ id: 'ref-barbaro-2024', numberInList: 10, fullCitation: 'Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience. Radiother Oncol. 2024;193:110124. doi:10.1016/j.radonc.2024.110124' }),
        RUTEGARD_2025_ESGAR_VALIDATION: Object.freeze({ id: 'ref-rutegard-2025', numberInList: 11, fullCitation: 'Rutegård MK, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. Eur Radiol. 2025;XXX:XXX-XXX. doi:10.1007/s00330-025-11361-2 (Beispiel-DOI)' }),
        STELZNER_2022_OCUM_MRI: Object.freeze({ id: 'ref-stelzner-2022', numberInList: 12, fullCitation: 'Stelzner S, Ruppert R, Kube R, et al. Selection of patients with rectal cancer for neoadjuvant therapy using pre-therapeutic MRI-results from OCUM trial. Eur J Radiol. 2022;147:110113. doi:10.1016/j.ejrad.2021.110113' }),
        LAMBREGTS_2013_GADOFOSVESET: Object.freeze({ id: 'ref-lambregts-2013', numberInList: 13, fullCitation: 'Lambregts DMJ, Heijnen LA, Maas M, et al. Gadofosveset-enhanced MRI for the assessment of rectal cancer lymph nodes: predictive criteria. Abdom Imaging. 2013;38(4):720-727. doi:10.1007/s00261-012-9957-4' }),
        BARBARO_2010_RESTAGING_RADIOGRAPHICS: Object.freeze({ id: 'ref-barbaro-2010', numberInList: 14, fullCitation: 'Barbaro B, Vitale R, Leccisotti L, et al. Restaging Locally Advanced Rectal Cancer with MR Imaging after Chemoradiation Therapy. Radiographics. 2010;30(3):699-721. doi:10.1148/rg.303095085' }),
        HORVAT_2019_MRI_RECTAL_CANCER_RADIOGRAPHICS: Object.freeze({ id: 'ref-horvat-2019', numberInList: 15, fullCitation: 'Horvat N, Carlos Tavares Rocha C, Clemente Oliveira B, Petkovska I, Gollub MJ. MRI of Rectal Cancer: Tumor Staging, Imaging Techniques, and Management. RadioGraphics. 2019;39(2):367-387. doi:10.1148/rg.2019180114' }),
        HAO_2025_DWI_RADIOMICS: Object.freeze({ id: 'ref-hao-2025', numberInList: 16, fullCitation: 'Hao Y, Zheng J, Li W et al. Ultra-high b-value DWI in rectal cancer: image quality assessment and regional lymph node prediction based on radiomics. Eur Radiol. 2025;35:49-60. doi:10.1007/s00330-024-10958-3 (Beispiel-DOI)' }),
        KIM_2019_FDG_PET_ACCURACY: Object.freeze({ id: 'ref-kim-2019', numberInList: 17, fullCitation: 'Kim SH, Song BI, Kim BW et al. Predictive value of [18F]FDG PET/CT for lymph node metastasis in rectal cancer. Sci Rep. 2019;9:4979. doi:10.1038/s41598-019-41422-8' }),
        ZHOU_2021_LYMPHATIC_METASTASIS: Object.freeze({ id: 'ref-zhou-2021', numberInList: 18, fullCitation: 'Zhou H, Lei PJ, Padera TP. Progression of metastasis through lymphatic system. Cells. 2021;10(3):627. doi:10.3390/cells10030627' }),
        ETHICS_VOTE_LEIPZIG: Object.freeze({id: 'ref-ethics-leipzig', numberInList: 19, fullCitation: 'Ethikkommission der Sächsischen Landesärztekammer (Aktenzeichen EK-Allg-2023-101)'}),
        STUDY_PERIOD_2020_2023: Object.freeze({id: 'ref-study-period', numberInList: 20, fullCitation: 'Januar 2020 und November 2023'}),
        MRI_SYSTEM_SIEMENS_3T: Object.freeze({id: 'ref-mri-system', numberInList: 21, fullCitation: '3,0-T System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Deutschland)'}),
        CONTRAST_AGENT_PROHANCE: Object.freeze({id: 'ref-contrast-agent', numberInList: 22, fullCitation: 'Gadoteridol (ProHance; Bracco Imaging, Konstanz, Deutschland)'}),
        RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER: Object.freeze({id: 'ref-radiologist-experience', numberInList: 23, fullCitation: ['29', '7', '19']})
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
