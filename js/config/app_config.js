const APP_CONFIG = Object.freeze({
    APP_NAME: "Lymphknoten T2 - Avocado Sign Analyse",
    APP_VERSION: "2.6.0",

    DEFAULT_SETTINGS: Object.freeze({
        KOLLEKTIV: 'Gesamt',
        T2_LOGIC: 'ODER',
        DATEN_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        AUSWERTUNG_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        STATS_LAYOUT: 'einzel',
        STATS_KOLLEKTIV1: 'Gesamt',
        STATS_KOLLEKTIV2: 'nRCT',
        PRESENTATION_VIEW: 'as-vs-t2',
        PRESENTATION_STUDY_ID: 'applied_criteria',
        PUBLIKATION_LANG: 'de',
        PUBLIKATION_SECTION: 'abstract',
        PUBLIKATION_BRUTE_FORCE_METRIC: 'Balanced Accuracy',
        BRUTE_FORCE_METRIC: 'Balanced Accuracy'
    }),

    STORAGE_KEYS: Object.freeze({
        APPLIED_CRITERIA: 'avocadoSign.appliedT2Criteria_v2.6',
        APPLIED_LOGIC: 'avocadoSign.appliedT2Logic_v2.6',
        CURRENT_KOLLEKTIV: 'avocadoSign.currentKollektiv_v2.6',
        PUBLIKATION_LANG: 'avocadoSign.currentPublikationLang_v2.6',
        PUBLIKATION_SECTION: 'avocadoSign.currentPublikationSection_v2.6',
        PUBLIKATION_BRUTE_FORCE_METRIC: 'avocadoSign.currentPublikationBfMetric_v2.6',
        STATS_LAYOUT: 'avocadoSign.currentStatsLayout_v2.6',
        STATS_KOLLEKTIV1: 'avocadoSign.currentStatsKollektiv1_v2.6',
        STATS_KOLLEKTIV2: 'avocadoSign.currentStatsKollektiv2_v2.6',
        PRESENTATION_VIEW: 'avocadoSign.currentPresentationView_v2.6',
        PRESENTATION_STUDY_ID: 'avocadoSign.currentPresentationStudyId_v2.6',
        FIRST_APP_START: 'avocadoSign.appFirstStart_v2.6'
    }),

    PATHS: Object.freeze({
        BRUTE_FORCE_WORKER: 'workers/brute_force_worker.js'
    }),

    PERFORMANCE_SETTINGS: Object.freeze({
        DEBOUNCE_DELAY_MS: 250,
        CHART_ANIMATION_THRESHOLD: 50
    }),

    STATISTICAL_CONSTANTS: Object.freeze({
        BOOTSTRAP_CI_REPLICATIONS: 2000,
        BOOTSTRAP_CI_ALPHA: 0.05,
        SIGNIFICANCE_LEVEL: 0.05,
        SIGNIFICANCE_SYMBOLS: Object.freeze([
            { threshold: 0.001, symbol: '***' },
            { threshold: 0.01, symbol: '**' },
            { threshold: 0.05, symbol: '*' }
        ]),
        DEFAULT_CI_METHOD_PROPORTION: 'Wilson Score',
        DEFAULT_CI_METHOD_EFFECTSIZE: 'Bootstrap Percentile',
        FISHER_EXACT_THRESHOLD: 5,
        CI_WARNING_SAMPLE_SIZE_THRESHOLD: 15
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
        ICON_COLOR: 'var(--text-dark)',
        TOOLTIP_DELAY: Object.freeze([250, 50]),
        TOAST_DURATION_MS: 4000,
        TRANSITION_DURATION_MS: 300,
        STICKY_HEADER_OFFSET: '111px'
    }),

    CHART_SETTINGS: Object.freeze({
        DEFAULT_WIDTH: 450,
        DEFAULT_HEIGHT: 350,
        DEFAULT_MARGIN: Object.freeze({ top: 30, right: 30, bottom: 50, left: 60 }),
        COMPACT_PIE_MARGIN: Object.freeze({ top: 15, right: 15, bottom: 50, left: 15 }),
        AS_COLOR: '#4472C4',
        T2_COLOR: '#E0DC2C',
        ANIMATION_DURATION_MS: 750,
        AXIS_LABEL_FONT_SIZE: '12px',
        TICK_LABEL_FONT_SIZE: '11px',
        LEGEND_FONT_SIZE: '11px',
        TOOLTIP_FONT_SIZE: '12px',
        PLOT_BACKGROUND_COLOR: '#ffffff',
        GRIDLINE_COLOR: '#e9ecef',
        ENABLE_GRIDLINES: true,
        POINT_RADIUS: 4,
        LINE_STROKE_WIDTH: 2.5
    }),

    EXPORT_SETTINGS: Object.freeze({
        DATE_FORMAT: 'YYYYMMDD',
        FILENAME_TEMPLATE: 'AvocadoSignT2_{TYPE}_{KOLLEKTIV}_{DATE}.{EXT}',
        TABLE_PNG_EXPORT_SCALE: 2.5,
        ENABLE_TABLE_PNG_EXPORT: true,
        CSV_DELIMITER: ';',
        FILENAME_TYPES: Object.freeze({
            STATS_CSV: 'Statistik_Uebersicht',
            BRUTEFORCE_TXT: 'BruteForce_Bericht',
            DESKRIPTIV_MD: 'Deskriptive_Statistik',
            DATEN_MD: 'Datenliste',
            AUSWERTUNG_MD: 'Auswertungstabelle',
            COMPREHENSIVE_REPORT_HTML: 'Analysebericht',
            FILTERED_DATA_CSV: 'Rohdaten_gefiltert',
            CHART_SINGLE_PNG: '{ChartName}',
            CHART_SINGLE_SVG: '{ChartName}',
            TABLE_PNG_EXPORT: '{TableName}',
            PUBLIKATION_SECTION_MD: 'Publikation_{SectionName}',
            ALL_ZIP: 'Gesamtpaket',
            CSV_ZIP: 'CSV_Paket',
            MD_ZIP: 'Markdown_Paket',
            PNG_ZIP: 'PNG_Paket',
            SVG_ZIP: 'SVG_Paket'
        })
    }),

    SPECIAL_IDS: Object.freeze({
        APPLIED_CRITERIA_STUDY_ID: 'applied_criteria',
        APPLIED_CRITERIA_DISPLAY_NAME: 'Aktuell eingestellte T2 Kriterien',
        AVOCADO_SIGN_ID: 'avocado_sign',
        AVOCADO_SIGN_DISPLAY_NAME: 'Avocado Sign'
    }),

    REFERENCES_FOR_PUBLICATION: Object.freeze({
        LURZ_SCHAEFER_AS_2025: "Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025. DOI: 10.1007/s00330-025-11462-y",
        KOH_2008_MORPHOLOGY: "Koh DM, Chau I, Tait D, et al. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys. 2008;71(2):456-461.",
        BARBARO_2024_RESTAGING: "Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience. Radiother Oncol. 2024;193:110124.",
        RUTEGARD_2025_ESGAR_VALIDATION: "Rutegård MK, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. Eur Radiol. 2025. DOI: 10.1007/s00330-025-11361-2",
        BEETS_TAN_2018_ESGAR_CONSENSUS: "Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: Updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol. 2018;28(4):1465-1475.",
        ETHICS_VOTE_LEIPZIG: "Ethikvotum Nr. 2023-101, Ethikkommission der Landesärztekammer Sachsen",
        STUDY_PERIOD_2020_2023: "Januar 2020 und November 2023",
        MRI_SYSTEM_SIEMENS_3T: "3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers)",
        CONTRAST_AGENT_PROHANCE: "Gadoteridol (ProHance; Bracco)",
        RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER: ["29", "7", "19"]
    })
});

function getDefaultT2Criteria() {
    return Object.freeze({
        logic: APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC,
        size: { active: true, threshold: 5.0, condition: '>=' },
        form: { active: false, value: 'rund' },
        kontur: { active: true, value: 'irregulär' },
        homogenitaet: { active: true, value: 'heterogen' },
        signal: { active: false, value: 'signalreich' }
    });
}
