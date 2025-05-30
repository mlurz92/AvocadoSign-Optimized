const APP_CONFIG = Object.freeze({
    APP_NAME: "Lymphknoten T2 - Avocado Sign Analyse",
    APP_VERSION: "2.4.0-optimized-fehlerbehebung", // Version aktualisiert

    DEFAULT_SETTINGS: Object.freeze({
        KOLLEKTIV: 'Gesamt',
        T2_LOGIC: 'UND',
        DATEN_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        DATEN_TABLE_PAGE: 1,
        AUSWERTUNG_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        AUSWERTUNG_TABLE_PAGE: 1,
        STATS_LAYOUT: 'einzel',
        STATS_KOLLEKTIV1: 'Gesamt',
        STATS_KOLLEKTIV2: 'nRCT',
        PRESENTATION_VIEW: 'as-pur',
        PRESENTATION_STUDY_ID: null,
        PUBLIKATION_LANG: 'de',
        PUBLIKATION_SECTION: 'methoden_studienanlage', // Default zur ersten Untersektion
        PUBLIKATION_BRUTE_FORCE_METRIC: 'Balanced Accuracy',
        CRITERIA_COMPARISON_SETS: Object.freeze([
            'avocado_sign',
            'applied_criteria',
            'rutegard_et_al_esgar',
            'koh_2008_morphology',
            'barbaro_2024_restaging'
        ]),
        CHART_COLOR_SCHEME: 'default',
        BRUTE_FORCE_METRIC: 'Balanced Accuracy',
        ACTIVE_TAB_ID: 'daten-tab-pane'
    }),

    STORAGE_KEYS: Object.freeze({
        APPLIED_CRITERIA: 'appliedT2Criteria_v4.3_optimized',
        APPLIED_LOGIC: 'appliedT2Logic_v4.3_optimized',
        CURRENT_KOLLEKTIV: 'currentKollektiv_v4.3_optimized',
        DATEN_TABLE_SORT: 'datenTableSort_v4.3_optimized', // HINZUGEFÜGT
        DATEN_TABLE_PAGE: 'datenTablePage_v4.3_optimized', // HINZUGEFÜGT
        AUSWERTUNG_TABLE_SORT: 'auswertungTableSort_v4.3_optimized', // HINZUGEFÜGT
        AUSWERTUNG_TABLE_PAGE: 'auswertungTablePage_v4.3_optimized', // HINZUGEFÜGT
        STATS_LAYOUT: 'currentStatsLayout_v4.3_optimized',
        STATS_KOLLEKTIV1: 'currentStatsKollektiv1_v4.3_optimized',
        STATS_KOLLEKTIV2: 'currentStatsKollektiv2_v4.3_optimized',
        PRESENTATION_VIEW: 'currentPresentationView_v4.3_optimized',
        PRESENTATION_STUDY_ID: 'currentPresentationStudyId_v4.3_optimized',
        PUBLIKATION_LANG: 'currentPublikationLang_v4.3_optimized',
        PUBLIKATION_SECTION: 'currentPublikationSection_v4.3_optimized',
        PUBLIKATION_BRUTE_FORCE_METRIC: 'currentPublikationBfMetric_v4.3_optimized',
        CRITERIA_COMPARISON_SETS: 'criteriaComparisonSets_v4.3_optimized',
        CHART_COLOR_SCHEME: 'chartColorScheme_v4.3_optimized',
        FIRST_APP_START: 'appFirstStart_v2.4_optimized' // Version hier ggf. anpassen
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
        SIGNIFICANCE_SYMBOLS: Object.freeze([
            Object.freeze({ threshold: 0.001, symbol: '***' }),
            Object.freeze({ threshold: 0.01, symbol: '**' }),
            Object.freeze({ threshold: 0.05, symbol: '*' })
        ]),
        DEFAULT_CI_METHOD_PROPORTION: 'Wilson Score',
        DEFAULT_CI_METHOD_EFFECTSIZE: 'Bootstrap Percentile',
        FISHER_EXACT_THRESHOLD: 5,
        CI_WARNING_SAMPLE_SIZE_THRESHOLD: 20,
        P_VALUE_PRECISION: 3,
        METRIC_PERCENT_DECIMALS: 1,
        METRIC_RATE_DECIMALS: 3
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
        LINE_STROKE_WIDTH: 2,
        COLOR_SCHEMES: Object.freeze({ // Hinzugefügt für Konsistenz, falls chart_renderer darauf zugreift
            default: Object.freeze(['#4472C4', '#E0DC2C', '#2ca02c', '#d62728', '#9467bd', '#8c564b'])
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
            PUBLIKATION_SECTION_MD: 'Publikation_{SectionName}_MD',
            PUBLICATION_FULL_MD: 'Publikation_Gesamt_MD'
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
        REPORT_AUTHOR: `Generiert durch Analyse-Tool v${"2.4.0-optimized-fehlerbehebung"}`,
        REPORT_LOGO_ALT_TEXT: 'Institutslogo'
    }),

    SPECIAL_IDS: Object.freeze({
        APPLIED_CRITERIA_STUDY_ID: 'applied_criteria',
        APPLIED_CRITERIA_DISPLAY_NAME: 'Eingestellte T2 Kriterien',
        AVOCADO_SIGN_ID: 'avocado_sign',
        AVOCADO_SIGN_DISPLAY_NAME: 'Avocado Sign'
    }),

    PUBLICATION_DEFAULTS: Object.freeze({
        RADIOLOGY_JOURNAL_NAME: "Radiology",
        DEFAULT_ETHICS_STATEMENT_DE: "Die Studie wurde in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki durchgeführt. Das Studienprotokoll wurde von der lokalen Ethikkommission (Ethikkommission an der TU Dresden, EK 2023-101-StGg) genehmigt. Von allen Patienten wurde eine schriftliche Einverständniserklärung eingeholt.",
        DEFAULT_ETHICS_STATEMENT_EN: "The study was conducted in accordance with the principles of the Declaration of Helsinki. The study protocol was approved by the local institutional review board (Ethics Committee at TU Dresden, No. 2023-101-StGg). Written informed consent was obtained from all patients.",
        SOFTWARE_CITATION_TEXT_DE: (version) => `Alle Analysen wurden mit dem webbasierten "Lymphknoten T2 - Avocado Sign Analyse Tool" (Version ${version}, entwickelt von den Autoren) durchgeführt.`,
        SOFTWARE_CITATION_TEXT_EN: (version) => `All analyses were performed using the web-based "Lymph Node T2 - Avocado Sign Analysis Tool" (Version ${version}, developed by the authors).`,
        REFERENCES: Object.freeze({
            LURZ_SCHAEFER_2025: {
                key: "LurzSchaefer2025",
                full_citation_radiology: "Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Radiology 2025; EPub ahead of print. DOI: 10.1007/s00330-025-11462-y",
                doi: "10.1007/s00330-025-11462-y",
                year: 2025,
                authors_short: "Lurz & Schäfer",
                studyPeriod: "Januar 2020 und November 2023", // Beispiel, sollte aus echter Quelle stammen
                mrtSystem: "3.0-T MRI system (MAGNETOM Prisma Fit, Siemens Healthineers, Erlangen, Germany)",
                contrastAgent: "gadoteridol (ProHance, Bracco Imaging, Milan, Italy)",
                radiologistExperience: ["29", "7", "19"] // Jahre Erfahrung
            },
            RUTEGARD_ET_AL_2025: {
                key: "Rutegard2025",
                full_citation_radiology: "Rutegård MK, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. Eur Radiol 2025; EPub ahead of print. DOI: 10.1007/s00330-025-11361-2",
                doi: "10.1007/s00330-025-11361-2",
                year: 2025,
                authors_short: "Rutegård et al."
            },
            KOH_ET_AL_2008: {
                key: "Koh2008",
                full_citation_radiology: "Koh DM, Chau I, Tait D, Wotherspoon A, Cunningham D, Brown G. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys 2008;71(2):456-461. DOI: 10.1016/j.ijrobp.2007.10.016",
                doi: "10.1016/j.ijrobp.2007.10.016",
                year: 2008,
                authors_short: "Koh et al."
            },
            BARBARO_ET_AL_2024: {
                key: "Barbaro2024",
                full_citation_radiology: "Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience. Radiother Oncol 2024;193:110124. DOI: 10.1016/j.radonc.2024.110124",
                doi: "10.1016/j.radonc.2024.110124",
                year: 2024,
                authors_short: "Barbaro et al."
            },
            BEETS_TAN_ET_AL_2018: {
                key: "BeetsTan2018ESGAR",
                full_citation_radiology: "Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol 2018;28(4):1465-1475. DOI: 10.1007/s00330-017-5026-2",
                doi: "10.1007/s00330-017-5026-2",
                year: 2018,
                authors_short: "Beets-Tan et al. (ESGAR)"
            }
        })
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
