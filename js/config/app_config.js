function getDefaultT2Criteria() {
    return Object.freeze({
        logic: 'UND',
        size: { active: true, threshold: 5.0, condition: '>=' },
        form: { active: false, value: 'rund' },
        kontur: { active: false, value: 'irregulär' },
        homogenitaet: { active: false, value: 'heterogen' },
        signal: { active: false, value: 'signalreich' }
    });
}

const APP_CONFIG = Object.freeze({
    APP_NAME: "Lymphknoten T2 - Avocado Sign Analyse",
    APP_VERSION: "2.3.0",

    DEFAULT_SETTINGS: Object.freeze({
        KOLLEKTIV: 'Gesamt',
        T2_LOGIC: 'UND',
        DATEN_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        AUSWERTUNG_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        activeTabId: 'daten-tab-pane', // Sicherstellen, dass dies auf '-pane' endet
        STATS_LAYOUT: 'einzel',
        STATS_KOLLEKTIV1: 'Gesamt',
        STATS_KOLLEKTIV2: 'nRCT',
        PRESENTATION_VIEW: 'as-pur',
        PRESENTATION_STUDY_ID: null,
        PUBLIKATION_LANG: 'de',
        PUBLIKATION_SECTION: 'methoden_studienanlage', // Standard-Sektion auf eine gültige Untersektion setzen
        PUBLIKATION_BRUTE_FORCE_METRIC: 'Balanced Accuracy',
        BRUTE_FORCE_METRIC: 'Balanced Accuracy',
        CRITERIA_COMPARISON_SETS: Object.freeze([
            'avocado_sign',
            'applied_criteria',
            'rutegard_et_al_esgar',
            'koh_2008_morphology',
            'barbaro_2024_restaging'
        ]),
        CHART_COLOR_SCHEME: 'default',
        APPLIED_CRITERIA: getDefaultT2Criteria()
    }),

    STORAGE_KEYS: Object.freeze({
        currentKollektiv: 'currentKollektiv_v4.2_detailed',
        appliedT2Criteria: 'appliedT2Criteria_v4.2_detailed',
        appliedT2Logic: 'appliedT2Logic_v4.2_detailed',
        datenTableSort: 'datenTableSort_v4.2_detailed',
        auswertungTableSort: 'auswertungTableSort_v4.2_detailed',
        activeTabId: 'activeTabId_v4.2_detailed',
        statistikLayout: 'currentStatsLayout_v4.2_detailed',
        statistikKollektiv1: 'currentStatsKollektiv1_v4.2_detailed',
        statistikKollektiv2: 'currentStatsKollektiv2_v4.2_detailed',
        presentationView: 'currentPresentationView_v4.2_detailed',
        presentationStudyId: 'currentPresentationStudyId_v4.2_detailed',
        publikationLang: 'currentPublikationLang_v4.2_detailed',
        publikationSection: 'currentPublikationSection_v4.2_detailed',
        publikationBruteForceMetric: 'currentPublikationBfMetric_v4.2_detailed',
        bruteForceMetric: 'bruteForceMetric_v4.2_detailed',
        criteriaComparisonSets: 'criteriaComparisonSets_v4.2_detailed',
        chartColorScheme: 'chartColorScheme_v4.2_detailed',
        isFirstAppStart: 'appFirstStart_v2.3'
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
        ICON_SIZE: 18,
        ICON_STROKE_WIDTH: 1.25,
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
            TABLE_PNG_EXPORT: '{TableName}_PNG',
            CRITERIA_COMPARISON_MD: 'KriterienvergleichMD',
            PUBLIKATION_METHODEN_MD: 'Publikation_Methoden_Abschnitt_{SectionName}_MD',
            PUBLIKATION_ERGEBNISSE_MD: 'Publikation_Ergebnisse_Abschnitt_{SectionName}_MD',
            PUBLIKATION_REFERENZEN_MD: 'Publikation_Referenzen_MD',
            PUBLIKATION_TABLE_TSV: 'Publikation_Tabelle_{TableName}_TSV',
            REFERENCES_BIBTEX: 'Referenzen_BibTeX'
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
        REPORT_AUTHOR: `Generiert durch ${"Lymphknoten T2 - Avocado Sign Analyse"} v${"2.3.0"}`,
        REPORT_LOGO_ALT_TEXT: 'Institutslogo'
    }),

    SPECIAL_IDS: Object.freeze({
        APPLIED_CRITERIA_STUDY_ID: 'applied_criteria',
        APPLIED_CRITERIA_DISPLAY_NAME: 'Eingestellte T2 Kriterien',
        AVOCADO_SIGN_ID: 'avocado_sign',
        AVOCADO_SIGN_DISPLAY_NAME: 'Avocado Sign'
    }),

    REFERENCES_FOR_PUBLICATION: Object.freeze({
        lurzSchaefer2025: {
            fullCitation: "Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025.",
            short: "Lurz & Schäfer (2025)",
            doi: "10.1007/s00330-025-11462-y",
            studyPeriod: "Januar 2020 und November 2023",
            mriSystem: "3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers)",
            contrastAgent: "Gadoteridol (ProHance; Bracco)",
            t2SliceThickness: "2-3 mm",
            radiologistExperience: ["29", "7", "19"],
            ethicsVote: "Ethikvotum Nr. 2023-101, Ethikkommission der Landesärztekammer Sachsen"
        },
        koh2008: {
            fullCitation: "Koh DM, Chau I, Tait D, Wotherspoon A, Cunningham D, Brown G. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys. 2008;71(2):456-461.",
            short: "Koh et al. (2008)",
            doi: "10.1016/j.ijrobp.2007.10.016"
        },
        barbaro2024: {
            fullCitation: "Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience. Radiother Oncol. 2024;193:110124.",
            short: "Barbaro et al. (2024)",
            doi: "10.1016/j.radonc.2024.110124"
        },
        rutegard2025: {
            fullCitation: "Rutegård MK, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. Eur Radiol. 2025.",
            short: "Rutegård et al. (2025)",
            doi: "10.1007/s00330-025-11361-2"
        },
        beetsTan2018ESGAR: {
            fullCitation: "Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol. 2018;28(4):1465-1475.",
            short: "Beets-Tan et al. (2018, ESGAR Consensus)",
            doi: "10.1007/s00330-017-5026-2"
        },
        brown2003: {
            fullCitation: "Brown G, Richards CJ, Bourne MW, et al. Morphologic predictors of lymph node status in rectal cancer with use of high-spatial-resolution MR imaging with histopathologic comparison. Radiology. 2003;227(2):371-377.",
            short: "Brown et al. (2003)",
            doi: "10.1148/radiol.2272011747"
        },
        horvat2019: {
            fullCitation: "Horvat N, Rocha CCT, Oliveira BC, Petkovska I, Gollub MJ. MRI of Rectal Cancer: Tumor Staging, Imaging Techniques, and Management. RadioGraphics. 2019;39(2):367-387.",
            short: "Horvat et al. (2019)",
            doi: "10.1148/rg.2019180114"
        },
        kaur2012: {
            fullCitation: "Kaur H, Choi H, You YN, et al. MR Imaging for Preoperative Evaluation of Primary Rectal Cancer: Practical Considerations. RadioGraphics. 2012;32(2):389-409.",
            short: "Kaur et al. (2012)",
            doi: "10.1148/rg.322115122"
        },
        lahaye2009: {
            fullCitation: "Lahaye MJ, Beets GL, Engelen SME, et al. Locally Advanced Rectal Cancer: MR Imaging for Restaging after Neoadjuvant Radiation Therapy with Concomitant Chemotherapy. Part II. What Are the Criteria to Predict Involved Lymph Nodes? Radiology. 2009;252(1):81-91.",
            short: "Lahaye et al. (2009)",
            doi: "10.1148/radiol.2521081364"
        },
        vliegen2005BeetsTan: {
            fullCitation: "Vliegen RFA, Beets GL, von Meyenfeldt MF, et al. Rectal Cancer: MR Imaging in Local Staging—Is Gadolinium-based Contrast Material Helpful? Radiology. 2005;234(1):179-188.",
            short: "Vliegen et al. (2005)",
            doi: "10.1148/radiol.2341031403"
        },
         barbaro2010: {
            fullCitation: "Barbaro B, Vitale R, Leccisotti L, Vecchio FM, Santoro L, Valentini V, et al. Restaging Locally Advanced Rectal Cancer with MR Imaging after Chemoradiation Therapy. RadioGraphics. 2010;30(3):699-721.",
            short: "Barbaro et al. (2010)",
            doi: "10.1148/rg.303095085"
        }
    })
});

window.APP_CONFIG = APP_CONFIG;
window.getDefaultT2Criteria = getDefaultT2Criteria;

