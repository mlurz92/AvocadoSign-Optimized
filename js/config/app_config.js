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
        DEFAULT_PRAESENTATION_STUDY_ID: "rutegard_et_al_esgar",
        DEFAULT_PUBLIKATION_LANG: "de",
        DEFAULT_PUBLIKATION_SECTION: "methoden_studienanlage",
        DEFAULT_PUBLIKATION_BF_METRIC: "Balanced Accuracy",
        BRUTE_FORCE_METRIC: "Balanced Accuracy"
    },

    // NEU: Definition der Haupt-Content-Bereiche für jeden Tab
    TAB_CONTENT_AREAS: Object.freeze({
        'daten-tab': 'daten-table-container',
        'auswertung-tab': 'auswertung-content-area',
        'statistik-tab': 'statistik-content-area',
        'praesentation-tab': 'praesentation-content-area', // Beinhaltet Controls und Content
        'publikation-tab': 'publikation-main-content-container', // Der Bereich, der Text und generierte Elemente enthält
        'export-tab': 'export-content-area'
    }),

    UI_SETTINGS: Object.freeze({
        TOOLTIP_DELAY: [200, 50], // [show, hide]
        TOAST_DURATION_MS: 4000,
        STICKY_FIRST_COL_DATEN: true,
        STICKY_FIRST_COL_AUSWERTUNG: true,
        RENDER_DELAY_MS: 20, // Kurze Verzögerung, um dem DOM Zeit zum Aktualisieren zu geben
        ICON_SIZE: 18,
        ICON_STROKE_WIDTH: 1.2,
        ICON_COLOR: '#495057' // Bootstrap secondary color
    }),

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
        P_VALUE_PRECISION: 3, // Für exakte Werte in Tooltips etc.
        P_VALUE_PRECISION_TEXT: 3, // Für Textdarstellung (z.B. "p = 0.023")
        P_VALUE_PRECISION_CSV: 4, // Für CSV-Exporte, wo höhere Präzision gewünscht sein könnte
        BOOTSTRAP_CI_REPLICATIONS: 1000,
        ENABLE_BOOTSTRAP_CI_FOR_DERIVED_METRICS: true,
        MCNEMAR_USE_CONTINUITY_CORRECTION_SMALL_N: true,
        SIGNIFICANCE_SYMBOLS: Object.freeze([ // Muss absteigend nach Threshold sortiert sein
            { threshold: 0.001, symbol: '***' },
            { threshold: 0.01, symbol: '**' },
            { threshold: 0.05, symbol: '*' }
        ]),
        DEFAULT_CI_METHOD_PROPORTION: 'wilson', // 'wilson' or 'agresti_coull'
        DEFAULT_CI_METHOD_EFFECTSIZE: 'bootstrap', // 'bootstrap' or 'wald_approx' (für OR, RD, Phi)
        FISHER_EXACT_THRESHOLD: 5 // Zellhäufigkeitsschwelle, unter der Fisher's Exact statt Chi² für 2x2 Tabellen verwendet wird
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
            DESKRIPTIV_MD: "Deskriptive_Statistik",
            DATEN_MD: "Datenliste",
            AUSWERTUNG_MD: "Auswertungstabelle",
            FILTERED_DATA_CSV: "Rohdaten_Export",
            COMPREHENSIVE_REPORT_HTML: "Gesamtbericht_HTML",
            PUBLIKATION_GESAMT_MD: "Publikationsentwurf",
            CHART_SINGLE_PNG: "Diagramm",
            CHART_SINGLE_SVG: "Diagramm_Vektor",
            TABLE_PNG_EXPORT: "Tabelle_Bild",
            PRAES_AS_PUR_CSV: "Praes_AS_Performance",
            PRAES_AS_PUR_MD: "Praes_AS_Performance_MD",
            PRAES_AS_VS_T2_CSV: "Praes_AS_vs_T2_Vergleich",
            PRAES_AS_VS_T2_MD: "Praes_AS_vs_T2_Vergleich_MD",
            PRAES_COMP_TESTS_MD: "Praes_Statistische_Tests_MD",
            ALL_ZIP: "Gesamtpaket_Alle_Dateien",
            CSV_ZIP: "Paket_CSVs",
            MD_ZIP: "Paket_Markdown",
            PNG_ZIP: "Paket_Diagramme_Tabellen_PNG",
            SVG_ZIP: "Paket_Diagramme_SVG",
            XLSX_ZIP: "Paket_Excel" // Beispiel, falls Excel Export implementiert würde
        },
        ENABLE_TABLE_PNG_EXPORT: true,
        TABLE_PNG_SCALE_FACTOR: 1.5, // Reduziert für bessere Performance, kann erhöht werden
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
        AS_COLOR: '#8FBC8F', // DarkSeaGreen
        T2_COLOR: '#ADD8E6', // LightBlue
        NEW_PRIMARY_COLOR_BLUE: '#2E86C1', // Stärkeres Blau
        NEW_SECONDARY_COLOR_ORANGE: '#E67E22', // Orange
        NEW_TERTIARY_COLOR_GREEN: '#2ECC71', // Grün
        NEW_QUATERNARY_COLOR_PURPLE: '#8E44AD', // Lila
        NEW_SECONDARY_COLOR_YELLOW_GREEN: '#A2D95E', // Hellgrün
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

    KAPPA_INTERPRETATION_RANGES: Object.freeze({
        poor: "Poor",
        slight: "Slight",
        fair: "Fair",
        moderate: "Moderate",
        substantial: "Substantial",
        almost_perfect: "Almost perfect"
    }),
    AUC_INTERPRETATION_RANGES: Object.freeze({
         fail: 0.5, poor: 0.6, fair: 0.7, good: 0.8, excellent: 0.9, outstanding: 1.0
    }),
    PHI_INTERPRETATION_RANGES: Object.freeze({
        very_weak: 0.1, weak: 0.2, moderate: 0.3, strong: 0.4, very_strong: 0.5
    }),

    SPECIAL_IDS: Object.freeze({
        AVOCADO_SIGN_ID: "__avocado_sign__",
        AVOCADO_SIGN_DISPLAY_NAME: "Avocado Sign",
        APPLIED_CRITERIA_STUDY_ID: "__applied_criteria__",
        APPLIED_CRITERIA_DISPLAY_NAME: "Aktuell angewandt"
    }),

    // Beispiel für Metadaten, die in der Publikation verwendet werden könnten
    STUDY_PERIOD: Object.freeze({ START_DATE: "2015-01-01", END_DATE: "2023-12-31" }),
    ETHICS_INFO: Object.freeze({ APPROVAL_NUMBER: "EK-123/24-ML" }),
    SOFTWARE_VERSIONS: Object.freeze({
        R_VERSION: "4.3.2", // Beispiel
        APP_AUTHOR: "Dr. M. Lurz, Prof. Dr. A.O. Schäfer",
        APP_INSTITUTION_LOCATION: "Klinikum St. Georg & Universität Leipzig, Deutschland"
    }),
    MRT_PROTOKOLL: Object.freeze({
        GERAET_HERSTELLER_MODELL: "Siemens (Skyra/Vida)", FELDSTAERKE_TESLA: "3.0",
        KONTRASTMITTEL_NAME: "Gadovist (Gadobutrol)", KONTRASTMITTEL_DOSIERUNG_MMOL_PER_KG: "0.1"
    }),
    READER_INFO: Object.freeze({ // Falls Interobserver-Analysen für AS geplant sind
        RADIOLOGE1_ERFAHRUNG_JAHRE: "10", // Beispiel
        RADIOLOGE2_ERFAHRUNG_JAHRE: "8",  // Beispiel
        READER1_AS_KEY: "as_status_r1", // Schlüssel in Patientendaten, falls vorhanden
        READER2_AS_KEY: "as_status_r2"
    }),

    REFERENCES_FOR_PUBLICATION: Object.freeze({
        lurzSchaefer2025: {
            key: "LurzSchaefer2025",
            authors: "Lurz M, Schäfer AO", year: 2025,
            title: "The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer",
            journal: "Eur Radiol", doi: "10.1007/s00330-025-11462-y",
            file: "Lurz_Schaefer_AvocadoSign_2025.pdf",
            short: "Lurz & Schäfer (2025)"
        },
        koh2008: {
            key: "Koh2008",
            authors: "Koh DM, Chau I, Tait D, et al", year: 2008,
            title: "Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging",
            journal: "Int J Radiat Oncol Biol Phys", volume: 71, issue: 2, pages: "456-461",
            doi: "10.1016/j.ijrobp.2007.10.016",
            file: "Koh_2008.pdf",
            short: "Koh et al. (2008)"
        },
        barbaro2024: {
            key: "Barbaro2024",
            authors: "Barbaro B, Carafa MRP, Minordi LM, et al", year: 2024,
            title: "Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience",
            journal: "Radiother Oncol", volume: 193, pages: "110124",
            doi: "10.1016/j.radonc.2024.110124",
            file: "Barbaro_2024.pdf",
            short: "Barbaro et al. (2024)"
        },
        rutegard2025: {
            key: "Rutegard2025",
            authors: "Rutegård MK, Båtsman M, Blomqvist L, et al", year: 2025,
            title: "Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer",
            journal: "Eur Radiol", doi: "10.1007/s00330-025-11361-2",
            file: "Rutegard_2025.pdf",
            short: "Rutegård et al. (2025)"
        },
        beetsTan2018ESGAR: {
            key: "BeetsTan2018ESGAR",
            authors: "Beets-Tan RGH, Lambregts DMJ, Maas M, et al", year: 2018,
            title: "Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting",
            journal: "Eur Radiol", volume: 28, issue: 4, pages: "1465-1475",
            doi: "10.1007/s00330-017-5026-2",
            file: "Beets-Tan_2018.pdf",
            short: "Beets-Tan et al. / ESGAR (2018)"
        },
         brown2003: { // Hinzugefügt aus Literaturverzeichnis README
            key: "Brown2003",
            authors: "Brown G, Richards CJ, Bourne MW, et al", year: 2003,
            title: "Morphologic predictors of lymph node status in rectal cancer with use of high-spatial-resolution MR imaging with histopathologic comparison",
            journal: "Radiology", volume: 227, issue: 2, pages: "371-377",
            doi: "10.1148/radiol.2272011747",
            file: "Brown_2003.pdf",
            short: "Brown et al. (2003)"
        },
        horvat2019: { // Beispiel, falls benötigt
            key: "Horvat2019",
            authors: "Horvat N, Rocha CCT, Oliveira BC, Petkovska I, Gollub MJ", year: 2019,
            title: "MRI of Rectal Cancer: Tumor Staging, Imaging Techniques, and Management",
            journal: "RadioGraphics", volume: 39, issue: 2, pages: "367-387", // Beispielhafte Paginierung
            doi: "10.1148/rg.2019180114",
            file: "Horvart_2019.pdf", // Korrigierter Dateiname
            short: "Horvat et al. (2019)"
        },
        kaur2012: { // Beispiel, falls benötigt
            key: "Kaur2012",
            authors: "Kaur H, Choi H, You YN, et al", year: 2012,
            title: "MR Imaging for Preoperative Evaluation of Primary Rectal Cancer: Practical Considerations",
            journal: "RadioGraphics", volume: 32, issue: 2, pages: "389-409",
            doi: "10.1148/rg.322115122",
            file: "Kaur_2012.pdf",
            short: "Kaur et al. (2012)"
        }
    }),

    LITERATURE_T2_CRITERIA_SETS: [] // Wird dynamisch von study_criteria_manager gefüllt
});

// Sicherstellen, dass tief verschachtelte Objekte auch eingefroren sind (optional, aber gute Praxis)
function deepFreezeAppConfig(obj) {
    Object.keys(obj).forEach(prop => {
        if (typeof obj[prop] === 'object' && obj[prop] !== null && !Object.isFrozen(obj[prop])) {
            deepFreezeAppConfig(obj[prop]);
        }
    });
    return Object.freeze(obj);
}

// deepFreezeAppConfig(APP_CONFIG); // Deaktiviert, da Object.freeze bereits auf Hauptebene ausreicht und Fehler verursachen kann, wenn Werte später modifiziert werden sollen (was hier nicht der Fall sein sollte, aber Vorsicht ist besser).
// Die Konfigurationen in DEFAULT_SETTINGS.DEFAULT_T2_CRITERIA sind Objekte und könnten Probleme verursachen, wenn sie direkt modifiziert werden.
// Besser ist es, cloneDeep zu verwenden, wenn man mit diesen Standardwerten arbeitet.
