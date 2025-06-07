function deepFreeze(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    Object.getOwnPropertyNames(obj).forEach(function (prop) {
        const propValue = obj[prop];
        if (typeof propValue === 'object' && propValue !== null) {
            deepFreeze(propValue);
        }
    });

    return Object.freeze(obj);
}

let APP_CONFIG_MUTABLE = {
    APP_NAME: "Lymphknoten T2 - Avocado Sign Analyse",
    APP_VERSION: "2.3.0",
    APP_AUTHOR: "Markus Lurz & Arnd-Oliver Schäfer",
    APP_CONTACT_EMAIL: "markus.lurz@sanktgeorg.de",

    DEFAULT_SETTINGS: {
        KOLLEKTIV: 'Gesamt',
        T2_LOGIC: 'UND',
        DATEN_TABLE_SORT: { key: 'nr', direction: 'asc', subKey: null },
        AUSWERTUNG_TABLE_SORT: { key: 'nr', direction: 'asc', subKey: null },
        STATS_LAYOUT: 'einzel',
        STATS_KOLLEKTIV1: 'Gesamt',
        STATS_KOLLEKTIV2: 'nRCT',
        PRESENTATION_VIEW: 'as-pur',
        PRESENTATION_STUDY_ID: null,
        PUBLIKATION_LANG: 'de',
        PUBLIKATION_SECTION: 'abstract',
        PUBLIKATION_BRUTE_FORCE_METRIC: 'Balanced Accuracy',
        CRITERIA_COMPARISON_SETS: [
            'avocado_sign',
            'applied_criteria',
            'rutegard_et_al_esgar',
            'koh_2008_morphology',
            'barbaro_2024_restaging'
        ],
        CHART_COLOR_SCHEME: 'default',
        BRUTE_FORCE_METRIC: 'Balanced Accuracy'
    },

    STORAGE_KEYS: {
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
    },

    PATHS: {
        BRUTE_FORCE_WORKER: 'workers/brute_force_worker.js'
    },

    PERFORMANCE_SETTINGS: {
        DEBOUNCE_DELAY_MS: 250,
        ENABLE_GPU_ACCELERATION_CSS: true,
        CHART_ANIMATION_THRESHOLD: 50
    },

    STATISTICAL_CONSTANTS: {
        BOOTSTRAP_CI_REPLICATIONS: 1000,
        BOOTSTRAP_CI_ALPHA: 0.05,
        SIGNIFICANCE_LEVEL: 0.05,
        SIGNIFICANCE_SYMBOLS: [
            { threshold: 0.001, symbol: '***' },
            { threshold: 0.01, symbol: '**' },
            { threshold: 0.05, symbol: '*' }
        ],
        DEFAULT_CI_METHOD_PROPORTION: 'Wilson Score',
        DEFAULT_CI_METHOD_EFFECTSIZE: 'Bootstrap Percentile',
        FISHER_EXACT_THRESHOLD: 5,
        CI_WARNING_SAMPLE_SIZE_THRESHOLD: 10
    },

    T2_CRITERIA_SETTINGS: {
        SIZE_RANGE: { min: 0.1, max: 25.0, step: 0.1 },
        FORM_VALUES: ['rund', 'oval'],
        KONTUR_VALUES: ['scharf', 'irregulär'],
        HOMOGENITAET_VALUES: ['homogen', 'heterogen'],
        SIGNAL_VALUES: ['signalarm', 'intermediär', 'signalreich'],
        DEFAULT_CRITERIA: {
            logic: 'UND',
            size: { active: true, threshold: 5.0, condition: '>=' },
            form: { active: false, value: 'rund' },
            kontur: { active: false, value: 'irregulär' },
            homogenitaet: { active: false, value: 'heterogen' },
            signal: { active: false, value: 'signalreich' }
        }
    },

    UI_SETTINGS: {
        ICON_SIZE: 20,
        ICON_STROKE_WIDTH: 1.5,
        ICON_COLOR: 'var(--text-dark)',
        ICON_COLOR_INACTIVE: 'var(--text-medium)',
        DEFAULT_TABLE_ROWS_PER_PAGE: 50,
        TOOLTIP_DELAY: [200, 100],
        TOAST_DURATION_MS: 4500,
        TRANSITION_DURATION_MS: 350,
        MODAL_BACKDROP_OPACITY: 0.6,
        SPINNER_DELAY_MS: 300,
        STICKY_HEADER_OFFSET: '111px'
    },

    CHART_SETTINGS: {
        DEFAULT_WIDTH: 450,
        DEFAULT_HEIGHT: 350,
        DEFAULT_MARGIN: { top: 30, right: 40, bottom: 70, left: 70 },
        COMPACT_PIE_MARGIN: { top: 15, right: 15, bottom: 50, left: 15 },
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
        FONT_FAMILY_CHART: 'sans-serif'
    },

    EXPORT_SETTINGS: {
        DATE_FORMAT: 'YYYYMMDD',
        FILENAME_TEMPLATE: 'AvocadoSignT2_{TYPE}_{KOLLEKTIV}_{DATE}.{EXT}',
        TABLE_PNG_EXPORT_SCALE: 2,
        ENABLE_TABLE_PNG_EXPORT: true,
        CSV_DELIMITER: ';',
        COMPREHENSIVE_REPORT_LOGO_URL: '',
        INCLUDE_TIMESTAMP_IN_FILENAME: false,
        FILENAME_TYPES: {
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
            PUBLIKATION_METHODEN_MD: 'Publikation_{SectionName}_MD',
            PUBLIKATION_ERGEBNISSE_MD: 'Publikation_{SectionName}_MD',
            PUBLIKATION_ABSTRACT_MD: 'Publikation_Abstract_MD',
            PUBLIKATION_INTRODUCTION_MD: 'Publikation_Introduction_MD',
            PUBLIKATION_DISCUSSION_MD: 'Publikation_Discussion_MD',
            PUBLIKATION_REFERENCES_MD: 'Publikation_References_MD'
        },
        EXCEL_SHEET_NAME_DATEN: 'Datenliste',
        EXCEL_SHEET_NAME_AUSWERTUNG: 'Auswertung',
        EXCEL_SHEET_NAME_STATISTIK: 'Statistik Uebersicht',
        EXCEL_SHEET_NAME_FILTERED: 'Gefilterte Daten',
        EXCEL_SHEET_NAME_KONFIG: 'Konfiguration'
    },

    REPORT_SETTINGS: {
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
        REPORT_AUTHOR: 'Generiert durch Analyse-Tool',
        REPORT_LOGO_ALT_TEXT: 'Institutslogo',
        INCLUDE_KEY_RESULTS: true,
        INCLUDE_SUMMARY_STATEMENT: true
    },

    PUBLICATION_JOURNAL_REQUIREMENTS: {
        WORD_COUNT_MAIN_TEXT_MAX: 3000,
        WORD_COUNT_ABSTRACT_MAX: 300,
        REFERENCE_LIMIT: 35,
        FIGURE_LIMIT: 6,
        TABLE_LIMIT: 4,
        KEY_RESULTS_WORD_LIMIT: 75,
        SUMMARY_STATEMENT_WORD_LIMIT: 30
    },

    REFERENCES_FOR_PUBLICATION: {
        LURZ_SCHAEFER_AS_2025: "Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025. DOI: 10.1007/s00330-025-11462-y",
        KOH_2008_MORPHOLOGY: "Koh DM, Chau I, Tait D, Wotherspoon A, Cunningham D, Brown G. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys. 2008;71(2):456-461.",
        BARBARO_2024_RESTAGING: "Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience. Radiother Oncol. 2024;193:110124.",
        RUTEGARD_2025_ESGAR_VALIDATION: "Rutegård MK, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. Eur Radiol. 2025. DOI: 10.1007/s00330-025-11361-2",
        BEETS_TAN_2018_ESGAR_CONSENSUS: "Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: Updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol. 2018;28(4):1465-1475.",
        BROWN_2003_MORPHOLOGY: "Brown G, Richards CJ, Bourne MW, et al. Morphologic predictors of lymph node status in rectal cancer with use of high-spatial-resolution MR imaging with histopathologic comparison. Radiology. 2003;227(2):371-377.",
        KAUR_2012_MRI_PRACTICAL: "Kaur H, Choi H, You NY, et al. MR Imaging for Preoperative Evaluation of Primary Rectal Cancer: Practical Considerations. RadioGraphics. 2012;32(2):389-409.",
        HORVAT_2019_MRI_RECTAL_CANCER: "Horvat N, Carlos Tavares Rocha C, Clemente Oliveira B, Petkovska I, Gollub MJ. MRI of Rectal Cancer: Tumor Staging, Imaging Techniques, and Management. RadioGraphics. 2019;39(2):e1-e24.",
        BEETS_TAN_2009_USPIO_RESTAGING: "Lahaye MJ, Beets GL, Engelen SME, et al. Locally Advanced Rectal Cancer: MR Imaging for Restaging after Neoadjuvant Radiation Therapy with Concomitant Chemotherapy Part II. What Are the Criteria to Predict Involved Lymph Nodes?. Radiology. 2009;252(1):81-91.",
        BEETS_TAN_2004_GADOLINIUM: "Vliegen RFA, Beets GL, von Meyenfeldt MF, et al. Rectal Cancer: MR Imaging in Local Staging—Is Gadolinium-based Contrast Material Helpful?. Radiology. 2005;234(1):179-188.",
        BARBARO_2010_RESTAGING: "Barbaro B, Vitale R, Leccisotti L, et al. Restaging Locally Advanced Rectal Cancer with MR Imaging after Chemoradiation Therapy. Radiographics. 2010;30(3):699-721.",
        ETHICS_VOTE_LEIPZIG: "Ethikvotum Nr. 2023-101, Ethikkommission der Landesärztekammer Sachsen",
        STUDY_PERIOD_2020_2023: "Januar 2020 und November 2023",
        MRI_SYSTEM_SIEMENS_3T: "3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers)",
        CONTRAST_AGENT_PROHANCE: "Gadoteridol (ProHance; Bracco)",
        RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER: ["29", "7", "19"],
        SIEGEL_MILLER_2023: "Siegel RL, Miller KD, Wagle NS, Jemal A. Cancer statistics, 2023. CA Cancer J Clin. 2023;73(1):17-48. DOI:10.3322/caac.21763",
        SAUER_BECKER_2004: "Sauer R, Becker H, Hohenberger W, et al. Preoperative versus postoperative chemoradiotherapy for rectal cancer. N Engl J Med. 2004;351(17):1731-1740. DOI:10.1056/NEJMoa040694",
        AL_SUKHNI_2012: "Al-Sukhni E, Milot L, Fruitman M, et al. Diagnostic accuracy of MRI for assessment of T category, lymph node metastases, and circumferential resection margin involvement in patients with rectal cancer: a systematic review and meta-analysis. Ann Surg Oncol. 2012;19(7):2212-2223. DOI:10.1245/s10434-011-2183-1",
        TAYLOR_QUIRKE_2011: "Taylor FG, Quirke P, Heald RJ, et al. Preoperative high-resolution magnetic resonance imaging can identify good prognosis stage I, II, and III rectal cancer best managed by surgery alone: a prospective, multicenter, European study. Ann Surg. 2011;253(4):711-719. DOI:10.1097/SLA.0b013e31820b8d52",
        GARCIA_AGUILAR_2022: "Garcia-Aguilar J, Patil S, Gollub MJ, et al. Organ Preservation in Patients With Rectal Adenocarcinoma Treated With Total Neoadjuvant Therapy. J Clin Oncol. 2022;40(23):2546-2556. DOI:10.1200/JCO.21.02621",
        SCHRAG_SHI_2023: "Schrag D, Shi Q, Weiser MR, et al. Preoperative Treatment of Locally Advanced Rectal Cancer. N Engl J Med. 2023;389(4):322-334. DOI:10.1056/NEJMoa2303269",
        ZHUANG_ZHANG_2021: "Zhuang Z, Zhang Y, Wei M, et al. Magnetic resonance imaging evaluation of the accuracy of various lymph node staging criteria in rectal cancer: a systematic review and meta-analysis. Front Oncol. 2021;11:709070. DOI:10.3389/fonc.2021.709070"
    },

    SPECIAL_IDS: {
        APPLIED_CRITERIA_STUDY_ID: 'applied_criteria',
        APPLIED_CRITERIA_DISPLAY_NAME: 'Eingestellte T2 Kriterien',
        AVOCADO_SIGN_ID: 'avocado_sign',
        AVOCADO_SIGN_DISPLAY_NAME: 'Avocado Sign'
    },

    UI_TEXTS: {
        kollektivDisplayNames: {
            'Gesamt': 'Gesamt',
            'direkt OP': 'Direkt OP',
            'nRCT': 'nRCT',
            'avocado_sign': 'Avocado Sign',
            'applied_criteria': 'Eingestellte T2 Kriterien'
        },
        t2LogicDisplayNames: {
            'UND': 'UND',
            'ODER': 'ODER',
            'KOMBINIERT': 'KOMBINIERT (ESGAR-Logik)'
        },
        publikationTab: {
            spracheSwitchLabel: {
                de: 'Deutsch',
                en: 'English'
            },
            sectionLabels: {
                abstract: 'Abstract',
                introduction: 'Einleitung',
                methoden: 'Methoden',
                ergebnisse: 'Ergebnisse',
                discussion: 'Diskussion',
                references: 'Referenzen'
            },
            bruteForceMetricSelectLabel: 'Optimierungsmetrik für T2 (BF):'
        },
        chartTitles: {
            ageDistribution: 'Altersverteilung',
            genderDistribution: 'Geschlecht',
            therapyDistribution: 'Therapie',
            statusN: 'N-Status (Patho)',
            statusAS: 'AS-Status',
            statusT2: 'T2-Status (angewandt)',
            comparisonBar: 'Vergleich AS vs. {T2Name}',
            rocCurve: 'ROC-Kurve für {Method}',
            asPerformance: 'AS Performance (Akt. Kollektiv)'
        },
        axisLabels: {
            age: 'Alter (Jahre)',
            patientCount: 'Anzahl Patienten',
            lymphNodeCount: 'Anzahl Lymphknoten',
            metricValue: 'Wert',
            metric: 'Diagnostische Metrik',
            sensitivity: 'Sensitivität (Richtig-Positiv-Rate)',
            oneMinusSpecificity: '1 - Spezifität (Falsch-Positiv-Rate)',
            probability: 'Wahrscheinlichkeit',
            shortAxisDiameter: 'Kurzachsendurchmesser (mm)'
        },
        legendLabels: {
            male: 'Männlich',
            female: 'Weiblich',
            unknownGender: 'Unbekannt',
            direktOP: 'Direkt OP',
            nRCT: 'nRCT',
            nPositive: 'N+',
            nNegative: 'N-',
            asPositive: 'AS+',
            asNegative: 'AS-',
            t2Positive: 'T2+',
            t2Negative: 'T2-',
            avocadoSign: 'Avocado Sign (AS)',
            currentT2: '{T2ShortName}',
            benignLN: 'Benigne LK',
            malignantLN: 'Maligne LK'
        },
        criteriaComparison: {
            title: "Vergleich diagnostischer Güte verschiedener Methoden",
            selectLabel: "Kriteriensätze für Vergleich auswählen:",
            tableHeaderSet: "Methode / Kriteriensatz",
            tableHeaderSens: "Sens.",
            tableHeaderSpez: "Spez.",
            tableHeaderPPV: "PPV",
            tableHeaderNPV: "NPV",
            tableHeaderAcc: "Acc.",
            tableHeaderAUC: "AUC/BalAcc",
            showAppliedLabel: "Aktuell angewandte Kriterien anzeigen"
        },
        excelExport: {
            datenLabel: "Datenliste (.xlsx)",
            auswertungLabel: "Auswertungstabelle (.xlsx)",
            statistikLabel: "Statistik Übersicht (.xlsx)",
            filteredDataLabel: "Gefilterte Daten (.xlsx)",
            zipLabel: "Alle Excel-Tabellen (.zip)"
        },
        singleChartDownload: {
            pngLabel: "Als PNG herunterladen",
            svgLabel: "Als SVG herunterladen"
        },
        statMetrics: {
            signifikanzTexte: {
                SIGNIFIKANT: "statistisch signifikant",
                NICHT_SIGNIFIKANT: "statistisch nicht signifikant"
            },
            orFaktorTexte: {
                ERHOEHT: "erhöht",
                VERRINGERT: "verringert",
                UNVERAENDERT: "unverändert"
            },
            rdRichtungTexte: {
                HOEHER: "höher",
                NIEDRIGER: "niedriger",
                GLEICH: "gleich"
            },
            assoziationStaerkeTexte: {
                stark: "stark",
                moderat: "moderat",
                schwach: "schwach",
                sehr_schwach: "sehr schwach",
                nicht_bestimmbar: "nicht bestimmbar"
            }
        },
        kurzanleitung: {
            title: "Kurzanleitung & Wichtige Hinweise",
            content: `
                <p>Willkommen zum **Lymphknoten T2 - Avocado Sign Analyse Tool v[APP_VERSION]**.</p>
                <p>Diese Anwendung dient der explorativen Analyse und dem wissenschaftlichen Vergleich der diagnostischen Leistung verschiedener MRT-basierter Kriterien zur Beurteilung des mesorektalen Lymphknotenstatus (N-Status) bei Patienten mit Rektumkarzinom. Sie basiert auf einem Patientenkollektiv von 106 Fällen.</p>
                <h6>Allgemeine Bedienung:</h6>
                <ul>
                    <li>**Kollektiv-Auswahl (Header):** Wählen Sie hier das globale Patientenkollektiv (**Gesamt**, **Direkt OP**, **nRCT**). Diese Auswahl beeinflusst alle Analysen und Darstellungen in der gesamten Anwendung. Die Header-Meta-Statistiken (Anzahl Patienten, N+, AS+, T2+) aktualisieren sich entsprechend.</li>
                    <li>**Tab-Navigation:** Wechseln Sie über die Reiter zwischen den Hauptfunktionsbereichen der Anwendung.</li>
                    <li>**Tooltips:** Viele Bedienelemente und Ausgaben sind mit detaillierten Tooltips versehen, die bei Mausüberfahrung Erklärungen, Definitionen oder Interpretationshilfen bieten.</li>
                    <li>**Statistische Signifikanz:** In statistischen Tabellen werden p-Werte mit Symbolen für Signifikanzniveaus versehen: * p &lt; 0.05, ** p &lt; 0.01, *** p &lt; 0.001. Das zugrundeliegende Signifikanzniveau ist &alpha; = [SIGNIFICANCE_LEVEL_FORMATTED].</li>
                </ul>
                <h6>Wichtige Tabs und deren Funktionen:</h6>
                <ul>
                    <li>**Daten:**<ul><li>Zeigt die detaillierten Patientendaten des aktuell ausgewählten Kollektivs in tabellarischer Form.</li><li>Spalten können durch Klick auf die Überschrift sortiert werden. Die Spalte "N/AS/T2" erlaubt eine Sub-Sortierung nach den Einzelkomponenten N, AS oder T2.</li><li>Für Patienten mit erfassten T2-Lymphknoten können Detailzeilen aufgeklappt werden, die die morphologischen Eigenschaften jedes einzelnen T2-Lymphknotens (Größe, Form, Kontur, Homogenität, Signal) visualisieren.</li><li>Ein Button "Alle Details Anzeigen/Ausblenden" erlaubt das globale Steuern dieser Detailansichten.</li></ul></li>
                    <li>**Auswertung:**<ul><li>**Dashboard:** Bietet eine schnelle visuelle Übersicht (kleine Diagramme für Alter, Geschlecht, Therapie, N/AS/T2-Status) für das aktuelle Kollektiv.</li><li>**T2-Kriterien-Definition:** Ermöglicht die interaktive Definition von T2-basierten Malignitätskriterien.<ul><li>Aktivieren/Deaktivieren Sie einzelne Kriterien (Größe, Form, Kontur, Homogenität, Signal) per Checkbox.</li><li>Stellen Sie den Schwellenwert für das Größenkriterium (Kurzachse, &ge;) per Slider oder Direkteingabe ein.</li><li>Wählen Sie für Form, Kontur, Homogenität und Signal den als suspekt geltenden Wert über Optionsbuttons.</li><li>Definieren Sie die logische Verknüpfung (UND/ODER) der aktiven Kriterien.</li><li>**Wichtig:** Änderungen werden erst wirksam und in allen Tabs berücksichtigt, nachdem Sie auf **"Anwenden & Speichern"** geklickt haben. Ein Indikator am Kartenrand weist auf ungespeicherte Änderungen hin. Mit "Zurücksetzen" können die Kriterien auf den Default-Wert zurückgesetzt werden (Änderung muss ebenfalls angewendet werden).</li></ul></li><li>**T2 Metrik-Übersicht:** Zeigt die wichtigsten diagnostischen Gütekriterien (Sens, Spez, PPV, NPV, etc. mit 95% CIs) für die aktuell *angewendeten und gespeicherten* T2-Kriterien im Vergleich zum N-Status für das globale Kollektiv.</li><li>**Brute-Force-Optimierung:**<ul><li>Ermöglicht die automatische Suche nach der T2-Kriterienkombination, die eine vom Nutzer gewählte Zielmetrik (z.B. Balanced Accuracy, F1-Score) maximiert.</li><li>Die Analyse läuft im Hintergrund (Web Worker) und zeigt Fortschritt sowie das aktuell beste Ergebnis an.</li><li>Nach Abschluss können die besten Kriterien direkt übernommen und angewendet werden. Ein Klick auf "Top 10" öffnet ein Modal mit den besten Ergebnissen und einer Exportoption für den Bericht.</li></ul></li><li>**Auswertungstabelle (untere Tabelle):** Listet Patienten mit ihrem N-, AS- und (gemäß aktuell angewendeten Kriterien berechneten) T2-Status sowie den jeweiligen Lymphknotenzahlen auf. Detailzeilen zeigen die Bewertung jedes T2-Lymphknotens anhand der aktuellen Kriteriendefinition, wobei erfüllte Positiv-Kriterien hervorgehoben werden.</li></ul></li>
                    <li>**Statistik:**<ul><li>Bietet umfassende statistische Auswertungen, immer basierend auf den aktuell *angewendeten* T2-Kriterien.</li><li>Über den Button "Vergleich Aktiv" kann zwischen einer Einzelansicht (für das global gewählte Kollektiv) und einer Vergleichsansicht zweier spezifisch wählbarer Kollektive umgeschaltet werden.</li><li>Angezeigt werden deskriptive Statistiken, detaillierte diagnostische Gütekriterien (für AS vs. N und T2 vs. N) inklusive Konfidenzintervallen, statistische Vergleichstests (AS vs. T2; ggf. Kollektiv A vs. B) und Assoziationsanalysen.</li><li>Eine **Kriterienvergleichstabelle** am Ende des Tabs vergleicht die Performance von AS, den angewandten T2-Kriterien und definierten Literatur-Sets für das global gewählte Kollektiv.</li></ul></li>
                    <li>**Präsentation:**<ul><li>Bereitet Ergebnisse in einem für Präsentationen optimierten Format auf.</li><li>Zwei Ansichten wählbar: Fokus rein auf "Avocado Sign (Performance)" oder "AS vs. T2 (Vergleich)".</li><li>Im Vergleichsmodus kann eine T2-Basis aus den angewandten Kriterien oder Literatur-Sets gewählt werden. Das globale Kollektiv passt sich ggf. dem Zielkollektiv der Studie an.</li><li>Enthält Info-Karten, Vergleichstabellen, statistische Tests und Diagramme.</li></ul></li>
                    <li>**Publikation:**<ul><li>Generiert automatisch Textvorschläge in Deutsch oder Englisch für verschiedene Abschnitte einer wissenschaftlichen Publikation (Abstract, Einleitung, Methoden, Ergebnisse, Diskussion, Referenzen).</li><li>Integriert dynamisch aktuelle Daten, Statistiken (basierend auf angewandten T2-Kriterien und ausgewählter BF-Zielmetrik für Teile der Ergebnisdarstellung) und Konfigurationen.</li><li>Enthält ebenfalls direkt im Text eingebettete Tabellen und Diagramme.</li></ul></li>
                    <li>**Export:**<ul><li>Ermöglicht den Download von Rohdaten, Analyseergebnissen, Tabellen und Diagrammen.</li><li>Formate: CSV, Markdown (MD), Text (TXT), HTML, PNG, SVG.</li><li>Bietet Einzelexporte sowie thematisch gebündelte ZIP-Pakete.</li><li>Alle Exporte basieren auf dem global gewählten Kollektiv und den zuletzt *angewendeten* T2-Kriterien.</li></ul></li>
                </ul>
                <h6>Referenzstandard und Wichtiger Hinweis:</h6>
                <p class="small">Der histopathologische N-Status aus dem Operationspräparat dient in allen Analysen als Referenzstandard. Diese Anwendung ist ein Forschungswerkzeug und ausdrücklich **nicht** für die klinische Diagnostik oder Therapieentscheidungen im Einzelfall vorgesehen. Alle Ergebnisse sind im Kontext der Studienlimitationen (retrospektiv, monozentrisch, spezifisches Kollektiv) zu interpretieren.</p>
            `
        },
        TOOLTIP_CONTENT: {
            kurzanleitungButton: { description: "Zeigt eine Kurzanleitung und wichtige Hinweise zur Bedienung der Anwendung." },
            kollektivButtons: { description: "Wählen Sie das Patientenkollektiv für die Analyse aus: **Gesamt** (alle Patienten), **Direkt OP** (nur primär Operierte ohne Vorbehandlung) oder **nRCT** (nur neoadjuvant Radiochemotherapeutisch Vorbehandelte). Die Auswahl filtert die Datenbasis für alle Tabs." },
            headerStats: {
                kollektiv: "Aktuell betrachtetes Patientenkollektiv.",
                anzahlPatienten: "Gesamtzahl der Patienten im ausgewählten Kollektiv.",
                statusN: "Anteil der Patienten mit positivem (+) vs. negativem (-) histopathologischem Lymphknotenstatus (N-Status, Pathologie-Referenzstandard) im ausgewählten Kollektiv.",
                statusAS: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß Avocado Sign (AS) Vorhersage (basierend auf T1KM-MRT) im ausgewählten Kollektiv.",
                statusT2: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß den aktuell **angewendeten und gespeicherten** T2-Kriterien (siehe Auswertungstab) für das ausgewählte Kollektiv."
            },
            mainTabs: {
                daten: "Zeigt die Liste aller Patientendaten im ausgewählten Kollektiv mit Basisinformationen und Status (N/AS/T2). Ermöglicht das Sortieren und Aufklappen von Details zu T2-Lymphknotenmerkmalen.",
                auswertung: "Zentraler Tab zur Definition von T2-Kriterien, Anzeige eines deskriptiven Dashboards, Durchführung der Brute-Force-Optimierung und detaillierte Auswertungsergebnisse pro Patient basierend auf den angewendeten Kriterien.",
                statistik: "Bietet detaillierte statistische Analysen (Gütekriterien, Vergleiche, Assoziationen) für das global gewählte Kollektiv oder einen Vergleich zweier spezifisch wählbarer Kollektive. Alle Konfidenzintervalle (CI) sind 95%-CIs.",
                praesentation: "Stellt Analyseergebnisse in einem aufbereiteten, präsentationsfreundlichen Format dar, fokussiert auf den Vergleich des Avocado Signs mit T2-basierten Ansätzen (angewandt oder Literatur).",
                publikation: "Textvorschläge und Materialien für Publikationen generieren.",
                export: "Bietet umfangreiche Optionen zum Herunterladen von Rohdaten, Analyseergebnissen, Tabellen und Diagrammen in verschiedenen Dateiformaten.",
                moreTabsDropdown: "Weitere Tabs anzeigen."
            },
            datenTable: {
                nr: "Fortlaufende Nummer des Patienten.",
                name: "Nachname des Patienten (anonymisiert/kodiert).",
                vorname: "Vorname des Patienten (anonymisiert/kodiert).",
                geschlecht: "Geschlecht des Patienten (m: männlich, w: weiblich, unbekannt).",
                alter: "Alter des Patienten zum Zeitpunkt der MRT-Untersuchung in Jahren.",
                therapie: "Angewandte Therapie vor der Operation (nRCT: neoadjuvante Radiochemotherapie, direkt OP: keine Vorbehandlung). Beeinflusst die Kollektivauswahl.",
                n_as_t2: "Direkter Statusvergleich: N (Pathologie-Referenz), AS (Avocado Sign), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung.",
                bemerkung: "Zusätzliche klinische oder radiologische Bemerkungen zum Patientenfall, falls vorhanden.",
                expandAll: "Öffnet oder schließt die Detailansicht zu den T2-gewichteten Lymphknotenmerkmalen für alle Patienten in der aktuellen Tabellenansicht. Zeigt Größe, Form, Kontur, Homogenität und Signal für jeden LK.",
                expandRow: "Klicken Sie hier oder auf den Pfeil-Button, um Details zu den morphologischen Eigenschaften der T2-gewichteten Lymphknoten dieses Patienten anzuzeigen/auszublenden. Nur verfügbar, wenn T2-LK-Daten vorhanden sind."
            },
            auswertungTable: {
                nr: "Fortlaufende Nummer des Patienten.",
                name: "Nachname des Patienten (anonymisiert/kodiert).",
                therapie: "Angewandte Therapie vor der Operation.",
                n_as_t2: "Direkter Statusvergleich: N (Pathologie-Referenz), AS (Avocado Sign), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung.",
                n_counts: "Anzahl pathologisch positiver (N+) Lymphknoten / Gesamtzahl histopathologisch untersuchter Lymphknoten für diesen Patienten.",
                as_counts: "Anzahl als positiv bewerteter Avocado Sign (AS+) Lymphknoten / Gesamtzahl im T1KM-MRT sichtbarer Lymphknoten für diesen Patienten.",
                t2_counts: "Anzahl als positiv bewerteter T2-Lymphknoten (gemäß aktuell angewendeter Kriterien) / Gesamtzahl im T2-MRT sichtbarer Lymphknoten für diesen Patienten.",
                expandAll: "Öffnet oder schließt die Detailansicht der bewerteten T2-gewichteten Lymphknoten und der erfüllten Kriterien für alle Patienten in der aktuellen Tabellenansicht.",
                expandRow: "Klicken Sie hier oder auf den Pfeil-Button, um die detaillierte Bewertung der einzelnen T2-gewichteten Lymphknoten dieses Patienten gemäß der aktuell angewendeten Kriterien anzuzeigen/auszublenden. Erfüllte Positiv-Kriterien werden hervorgehoben."
            },
            t2Logic: { description: `Logische Verknüpfung der aktiven T2-Kriterien: **UND** (Ein Lymphknoten ist nur positiv, wenn ALLE aktivierten Kriterien erfüllt sind). **ODER** (Ein Lymphknoten ist positiv, wenn MINDESTENS EIN aktiviertes Kriterium erfüllt ist). Die Wahl beeinflusst die Berechnung des T2-Status.` },
            t2Size: { description: "Größenkriterium (Kurzachse): Lymphknoten mit einem Durchmesser **größer oder gleich (≥)** dem eingestellten Schwellenwert gelten als suspekt. Einstellbarer Bereich: 5.0 - 25.0 mm (Schritt: 0.1 mm). Aktivieren/Deaktivieren mit Checkbox." },
            t2Form: { description: "Formkriterium: Wählen Sie, welche Form ('rund' oder 'oval') als suspekt gilt. Aktivieren/Deaktivieren mit Checkbox." },
            t2Kontur: { description: "Konturkriterium: Wählen Sie, welche Kontur ('scharf' berandet oder 'irregulär') als suspekt gilt. Aktivieren/Deaktivieren mit Checkbox." },
            t2Homogenitaet: { description: "Homogenitätskriterium: Wählen Sie, ob ein 'homogenes' oder 'heterogenes' Binnensignal auf T2w als suspekt gilt. Aktivieren/Deaktivieren mit Checkbox." },
            t2Signal: { description: "Signalkriterium: Wählen Sie, welche T2-Signalintensität ('signalarm', 'intermediär' oder 'signalreich') relativ zur umgebenden Muskulatur als suspekt gilt. Lymphknoten mit nicht beurteilbarem Signal (Wert 'null') erfüllen dieses Kriterium nie. Aktivieren/Deaktivieren mit Checkbox." },
            t2Actions: {
                reset: "Setzt die Logik und alle Kriterien auf die definierten Standardeinstellungen zurück. Die Änderungen sind danach noch nicht angewendet.",
                apply: "Wendet die aktuell eingestellten T2-Kriterien und die Logik auf den gesamten Datensatz an. Dies aktualisiert die T2-Spalten in den Tabellen, alle statistischen Auswertungen und Diagramme. Die Einstellung wird zudem für zukünftige Sitzungen gespeichert."
            },
            t2CriteriaCard: { unsavedIndicator: "**Achtung:** Es gibt nicht angewendete Änderungen an den T2-Kriterien oder der Logik. Klicken Sie auf 'Anwenden & Speichern', um die Ergebnisse zu aktualisieren und die Einstellung zu speichern." },
            t2MetricsOverview: {
                cardTitle: "Kurzübersicht der diagnostischen Güte für die aktuell angewendeten und gespeicherten T2-Kriterien im Vergleich zum histopathologischen N-Status für das gewählte Kollektiv: **[KOLLEKTIV]**. Alle Konfidenzintervalle (CI) sind 95%-CIs.",
                sensShort: 'Sens.',
                spezShort: 'Spez.',
                ppvShort: 'PPV',
                npvShort: 'NPV',
                accShort: 'Acc.',
                balAccShort: 'Bal. Acc.',
                f1Short: 'F1',
                aucShort: 'AUC',
            },
            bruteForceMetric: { description: "Wählen Sie die Zielmetrik für die Brute-Force-Optimierung.<br>**Accuracy:** Anteil korrekt klassifizierter Fälle.<br>**Balanced Accuracy:** (Sens+Spez)/2; gut bei ungleichen Klassengrößen.<br>**F1-Score:** Harmonisches Mittel aus PPV & Sensitivität.<br>**PPV:** Präzision bei positiver Vorhersage.<br>**NPV:** Präzision bei negativer Vorhersage." },
            bruteForceStart: { description: "Startet die Brute-Force-Suche nach der T2-Kriterienkombination, die die gewählte Zielmetrik im aktuellen Kollektiv maximiert. Dies kann einige Zeit in Anspruch nehmen und läuft im Hintergrund.",
                optimizeButton: 'Optimierung starten',
                running: 'Läuft...',
                workerMissing: 'Worker nicht verfügbar',
                cancelButton: "Abbrechen",
                cancelTooltip: "Bricht die laufende Optimierungsanalyse ab."
            },
            bruteForceInfo: {
                description: "Zeigt den Status des Brute-Force Optimierungs-Workers und das aktuell analysierte Patientenkollektiv: **[KOLLEKTIV_NAME]**.",
                statusLabel: "Status",
                kollektivLabel: "Kollektiv",
                ready: "Bereit.",
                workerNotAvailable: "Worker nicht verfügbar.",
                cancelled: "Analyse abgebrochen.",
                error: "Fehler",
                initializing: "Initialisiere...",
                testing: "Teste Kombinationen...",
                testingCombinations: "Teste [TOTAL_COMBINATIONS] Kombinationen...",
                running: "Läuft...",
                finished: "Fertig.",
                finishedNoResult: "Fertig (kein Ergebnis).",
                finishedNoValidResult: "Fertig (kein valides Ergebnis).",
                bestMetricSoFar: "Beste gefundene Metrik",
                best: "Beste",
                bestCriteriaLabel: "Beste Kriterien",
                bestCriteriaInitial: "Beste Kriterien: --",
                noDataWorker: "Keine Daten im Worker für Brute-Force.",
                noCombinationsGenerated: "Keine Kriterienkombinationen generiert. Überprüfen Sie die t2SizeRange Konfiguration.",
                invalidMessage: "Ungültige Nachricht vom Hauptthread empfangen.",
                workerAlreadyRunning: "Worker läuft bereits.",
                incompleteStartData: "Unvollständige Startdaten für Brute-Force. Benötigt: data, metric, kollektiv, t2SizeRange.",
                invalidSizeRange: "Ungültige t2SizeRange Konfiguration: min, max, step müssen Zahlen sein und step > 0.",
                emptyDataSet: "Leeres Datenset für Brute-Force erhalten.",
                initializationError: "Initialisierungsfehler im Worker",
                unknownAction: "Unbekannte Aktion vom Hauptthread",
                globalWorkerError: "Globaler Worker Fehler",
                currentStatus: "Aktueller Status"
            },
            bruteForceProgress: {
                description: "Fortschritt der Optimierung: Getestete Kombinationen / Gesamtanzahl ([TOTAL]). Angezeigt werden die aktuelle beste Metrik und die zugehörigen Kriterien.",
                progressLabel: "Fortschritt"
            },
            bruteForceResult: {
                description: "Bestes Ergebnis der abgeschlossenen Brute-Force-Optimierung für das gewählte Kollektiv ([N_GESAMT] Patienten, davon [N_PLUS] N+ und [N_MINUS] N-) und die Zielmetrik.",
                optimizationComplete: "Optimierung Abgeschlossen!",
                bestCombinationFor: "Beste gefundene Kombination für '{METRIC_DISPLAY_NAME}' im Kollektiv '{KOLLEKTIV_NAME}'",
                noResultsFound: "Keine validen Ergebnisse gefunden.",
                valueLabel: "Wert",
                logicLabel: "Logik",
                criteriaLabel: "Kriterien",
                durationLabel: "Dauer",
                testedLabel: "Getestete Kombinationen",
                kollektivNLabel: "Kollektiv (N)",
                applyBestButton: "Beste Kriterien anwenden",
                applyBestTooltip: "Übernimmt die beste gefundene Kriterienkombination in die T2-Kriterien-Auswahl und wendet sie global an.",
                kollektivStats: "Statistik des für diese Optimierung verwendeten Kollektivs: N (Gesamtanzahl), N+ (Anzahl N-positiv), N- (Anzahl N-negativ)."
            },
            bruteForceDetailsButton: {
                label: "Details (Top 10)",
                description: "Öffnet ein Fenster mit den Top 10 Ergebnissen und weiteren Details zur abgeschlossenen Optimierung.",
                topResultsLabel: "Top Ergebnisse",
                rankLabel: "Rang",
                rankTooltip: "Rang des Ergebnisses basierend auf dem Wert der Zielmetrik.",
                metricValueTooltip: "Wert der Zielmetrik ({METRIC_DISPLAY_NAME}) für diese Kriterienkombination.",
                sensTooltip: "Sensitivität für diese Kombination.",
                spezTooltip: "Spezifität für diese Kombination.",
                ppvTooltip: "Positiver Prädiktiver Wert für diese Kombination.",
                npvTooltip: "Negativer Prädiktiver Wert für diese Kombination.",
                logicTooltip: "Logische Verknüpfung der Kriterien.",
                criteriaTooltip: "Die spezifische Kombination von T2-Kriterien."
            },
            statistikLayout: { description: "Wählen Sie die Anzeigeart: **Einzelansicht** für das global gewählte Kollektiv oder **Vergleich Aktiv** zur Auswahl und Gegenüberstellung zweier spezifischer Kollektive." },
            statistikKollektiv1: { description: "Wählen Sie das erste Kollektiv für die statistische Auswertung oder den Vergleich (nur aktiv bei Layout 'Vergleich Aktiv')." },
            statistikKollektiv2: { description: "Wählen Sie das zweite Kollektiv für den Vergleich (nur aktiv bei Layout 'Vergleich Aktiv')." },
            statistikToggleVergleich: { description: "Schaltet zwischen der detaillierten Einzelansicht für das global gewählte Kollektiv und der Vergleichsansicht zweier spezifisch wählbarer Kollektive um." },
            deskriptiveStatistik: {
                cardTitle: "Demographie, klinische Daten und Lymphknoten-Basiszahlen des Kollektivs **[KOLLEKTIV]**.",
                alterMedian: { description: "Median des Alters (Jahre) mit Bereich (Min-Max) und [Mittelwert ± Standardabweichung].", name: "Alter", unit: "Jahre" },
                geschlecht: { description: "Absolute und prozentuale Geschlechterverteilung.", name: "Geschlecht" },
                nStatus: { description: "Verteilung des pathologischen N-Status (+/-).", name: "N-Status (Patho)"},
                asStatus: { description: "Verteilung des Avocado Sign Status (+/-).", name: "AS-Status" },
                t2Status: { description: "Verteilung des T2-Status (+/-) basierend auf den aktuell angewendeten Kriterien.", name: "T2-Status (angewandt)" },
                lkAnzahlPatho: { description: "Anzahl histopathologisch untersuchter Lymphknoten pro Patient.", name: "LK N gesamt" },
                lkAnzahlPathoPlus: { description: "Anzahl pathologisch positiver (N+) Lymphknoten bei N+ Patienten.", name: "LK N+" },
                lkAnzahlAS: { description: "Gesamtzahl im T1KM-MRT sichtbarer Lymphknoten.", name: "LK AS gesamt" },
                lkAnzahlASPlus: { description: "Anzahl Avocado Sign positiver (AS+) Lymphknoten bei AS+ Patienten.", name: "LK AS+" },
                lkAnzahlT2: { description: "Gesamtzahl im T2-MRT sichtbarer Lymphknoten.", name: "LK T2 gesamt" },
                lkAnzahlT2Plus: { description: "Anzahl T2-positiver Lymphknoten (gemäß aktueller Kriterien) bei T2+ Patienten.", name: "LK T2+" },
                chartAge: { description: "Histogramm der Altersverteilung im Kollektiv **[KOLLEKTIV]**." },
                chartGender: { description: "Tortendiagramm der Geschlechterverteilung im Kollektiv **[KOLLEKTIV]**." },
                age: { name: "Alter", description: "Alter des Patienten in Jahren." },
                gender: { name: "Geschlecht", description: "Geschlecht des Patienten." },
                therapy: { name: "Therapie", description: "Therapiegruppe des Patienten." }
            },
            diagnostischeGueteAS: { cardTitle: "Diagnostische Güte des Avocado Signs (AS) vs. Histopathologie (N) für Kollektiv **[KOLLEKTIV]**. Alle Konfidenzintervalle (CI) sind 95%-CIs." },
            diagnostischeGueteT2: { cardTitle: "Diagnostische Güte der aktuell angewendeten T2-Kriterien vs. Histopathologie (N) für Kollektiv **[KOLLEKTIV]**. Alle CIs sind 95%-CIs." },
            statistischerVergleichASvsT2: { cardTitle: "Statistischer Vergleich der diagnostischen Leistung von AS vs. aktuell angewandten T2-Kriterien (gepaarte Tests) im Kollektiv **[KOLLEKTIV]**." },
            assoziationEinzelkriterien: { cardTitle: "Assoziation zwischen AS-Status bzw. einzelnen T2-Merkmalen und dem N-Status (+/-) im Kollektiv **[KOLLEKTIV]**. OR: Odds Ratio, RD: Risk Difference, φ: Phi-Koeffizient. Alle CIs sind 95%-CIs." },
            vergleichKollektive: { cardTitle: "Statistischer Vergleich der Accuracy und AUC (für AS und T2) zwischen **[KOLLEKTIV1]** und **[KOLLEKTIV2]** (ungepaarte Tests)." },
            criteriaComparisonTable: {
                cardTitle: "Tabellarischer Leistungsvergleich: Avocado Sign, angewandte T2-Kriterien und Literatur-Sets für das global gewählte Kollektiv **[GLOBAL_KOLLEKTIV_NAME]**. Literatur-Sets werden auf ihrem spezifischen Zielkollektiv evaluiert, falls abweichend (in Klammern angegeben). Alle Werte ohne CIs.",
                tableHeaderSet: "Methode / Kriteriensatz (Eval. auf Kollektiv N)",
                tableHeaderSens: "Sensitivität",
                tableHeaderSpez: "Spezifität",
                tableHeaderPPV: "PPV",
                tableHeaderNPV: "NPV",
                tableHeaderAcc: "Accuracy",
                tableHeaderAUC: "AUC / Bal. Accuracy"
            },
            praesentation: {
                viewSelect: { description: "Wählen Sie die Ansicht: **Avocado Sign (Performance)** für eine Übersicht der AS-Performance oder **AS vs. T2 (Vergleich)** für einen direkten Vergleich von AS mit einer auswählbaren T2-Kriterienbasis." },
                studySelect: { description: "Wählen Sie eine T2-Kriterienbasis für den Vergleich mit dem Avocado Sign. Optionen: aktuell in der App eingestellte Kriterien oder vordefinierte Sets aus publizierten Studien. Die Auswahl aktualisiert die untenstehenden Vergleiche. Das globale Kollektiv passt sich ggf. dem Zielkollektiv der Studie an." },
                t2BasisInfoCard: {
                    title: "Informationen zur T2-Vergleichsbasis",
                    description: "Zeigt Details zu den aktuell für den Vergleich mit AS ausgewählten T2-Kriterien. Die Performance-Werte beziehen sich auf das angegebene Vergleichskollektiv.",
                    reference: "Studienreferenz oder Quelle der Kriterien.",
                    patientCohort: "Ursprüngliche Studienkohorte oder aktuelles Vergleichskollektiv (mit Patientenzahl).",
                    investigationType: "Art der Untersuchung in der Originalstudie (z.B. Primärstaging, Restaging).",
                    focus: "Hauptfokus der Originalstudie bezüglich dieser Kriterien.",
                    keyCriteriaSummary: "Zusammenfassung der angewendeten T2-Kriterien und Logik."
                },
                comparisonTableCard: { description: "Numerische Gegenüberstellung der diagnostischen Gütekriterien für AS vs. die ausgewählte T2-Basis, bezogen auf das aktuelle (Vergleichs-)Kollektiv."},
                downloadDemographicsMD: { description: "Lädt die Tabelle der demographischen Basisdaten (nur für Avocado-Sign-Ansicht) als Markdown-Datei (.md) herunter."},
                downloadPerformanceCSV: { description: "Lädt die Tabelle der diagnostischen Güte (je nach Ansicht: AS oder AS vs. T2-Basis) als CSV-Datei (.csv) herunter." },
                downloadPerformanceMD: { description: "Lädt die Tabelle der diagnostischen Güte (je nach Ansicht: AS oder AS vs. T2-Basis) als Markdown-Datei (.md) herunter." },
                downloadCompTestsMD: { description: "Lädt die Tabelle der statistischen Vergleichstests (McNemar, DeLong für AS vs. T2-Basis) als Markdown-Datei (.md) herunter." },
                downloadCompTableMD: { description: "Lädt die Tabelle mit den verglichenen Metrikwerten (AS vs. T2-Basis) als Markdown-Datei (.md) herunter."},
                downloadCompChartPNG: { description: "Lädt das Vergleichs-Balkendiagramm (AS vs. T2-Basis) als PNG-Datei herunter." },
                downloadCompChartSVG: { description: "Lädt das Vergleichs-Balkendiagramm (AS vs. T2-Basis) als Vektor-SVG-Datei herunter." },
                downloadTablePNG: { description: "Lädt die angezeigte Tabelle als PNG-Bilddatei herunter." },
                downloadCompTablePNG: { description: "Lädt die Vergleichs-Metrik-Tabelle (AS vs. T2) als PNG-Datei herunter." },
                asPurPerfTable: {
                    kollektiv: "Patientenkollektiv (N = Anzahl Patienten).",
                    sens: "Sensitivität des Avocado Signs (vs. N) in diesem Kollektiv.",
                    spez: "Spezifität des Avocado Signs (vs. N) in diesem Kollektiv.",
                    ppv: "PPV des Avocado Signs (vs. N) in diesem Kollektiv.",
                    npv: "NPV des Avocado Signs (vs. N) in diesem Kollektiv.",
                    acc: "Accuracy des Avocado Signs (vs. N) in diesem Kollektiv.",
                    auc: "AUC / Balanced Accuracy des Avocado Signs (vs. N) in diesem Kollektiv."
                },
                asVsT2PerfTable: {
                    metric: "Diagnostische Metrik.",
                    asValue: "Wert der Metrik für Avocado Sign (AS) (vs. N) im Kollektiv **[KOLLEKTIV_NAME_VERGLEICH]**, inkl. 95% CI.",
                    t2Value: "Wert der Metrik für die T2-Basis **[T2_SHORT_NAME]** (vs. N) im Kollektiv **[KOLLEKTIV_NAME_VERGLEICH]**, inkl. 95% CI."
                },
                asVsT2TestTable: {
                    test: "Statistischer Test zum Vergleich von AS vs. **[T2_SHORT_NAME]**.",
                    statistic: "Wert der Teststatistik.",
                    pValue: "p-Wert des Tests. p < 0.05 bedeutet einen statistisch signifikanten Unterschied zwischen AS und **[T2_SHORT_NAME]** in Bezug auf die getestete Metrik (Accuracy oder AUC) im Kollektiv **[KOLLEKTIV_NAME_VERGLEICH]**.",
                    method: "Name des verwendeten statistischen Tests."
                }
            },
            exportTab: {
                singleExports: "Einzelexporte",
                exportPackages: "Export-Pakete (.zip)",
                description: "Ermöglicht den Export von Analyseergebnissen, Tabellen und Diagrammen basierend auf dem aktuell gewählten globalen Kollektiv (**[KOLLEKTIV]**) und den aktuell angewendeten T2-Kriterien.",
                statsCSV: { description: "Detaillierte Tabelle aller berechneten statistischen Metriken (deskriptiv, Güte AS & T2, Vergleiche, Assoziationen) aus dem Statistik-Tab als CSV-Datei.", type: 'STATS_CSV', ext: "csv" },
                statsXLSX: { description: "Exportiert die detaillierte Tabelle aller berechneten statistischen Metriken (wie CSV-Export) als Excel-Datei (.xlsx).", type: 'STATISTIK_XLSX', ext: "xlsx" },
                bruteForceTXT: { description: "Detaillierter Bericht der letzten Brute-Force-Optimierung für das aktuelle Kollektiv (Top 10 Ergebnisse, Konfiguration) als Textdatei (.txt), falls durchgeführt.", type: 'BRUTEFORCE_TXT', ext: "txt" },
                deskriptivMD: { description: "Tabelle der deskriptiven Statistik (Statistik-Tab) als Markdown (.md).", type: 'DESKRIPTIV_MD', ext: "md" },
                datenMD: { description: "Aktuelle Datenliste (Daten-Tab) als Markdown-Tabelle (.md).", type: 'DATEN_MD', ext: "md" },
                datenXLSX: { description: "Aktuelle Datenliste (Daten-Tab) als Excel-Datei (.xlsx).", type: 'DATEN_XLSX', ext: "xlsx" },
                auswertungMD: { description: "Aktuelle Auswertungstabelle (Auswertung-Tab, inkl. T2-Ergebnisse) als Markdown (.md).", type: 'AUSWERTUNG_MD', ext: "md" },
                auswertungXLSX: { description: "Aktuelle Auswertungstabelle (Auswertung-Tab, inkl. T2-Ergebnisse) als Excel-Datei (.xlsx).", type: 'AUSWERTUNG_XLSX', ext: "xlsx" },
                filteredDataCSV: { description: "Rohdaten des aktuell ausgewählten Kollektivs (inkl. T2-Bewertung) als CSV-Datei (.csv).", type: 'FILTERED_DATA_CSV', ext: "csv" },
                filteredDataXLSX: { description: "Rohdaten des aktuell ausgewählten Kollektivs (inkl. T2-Bewertung) als Excel-Datei (.xlsx).", type: 'FILTERED_DATA_XLSX', ext: "xlsx" },
                comprehensiveReportHTML: { description: "Umfassender Analysebericht als HTML-Datei (Statistiken, Konfigurationen, Diagramme), druckbar.", type: 'COMPREHENSIVE_REPORT_HTML', ext: "html" },
                chartsPNG: { description: "Alle aktuell sichtbaren Diagramme (Statistik, Auswertung, Präsentation) und ausgewählte Tabellen als einzelne PNG-Dateien (ZIP-Archiv).", type: 'PNG_ZIP', ext: "zip" },
                chartsSVG: { description: "Alle aktuell sichtbaren Diagramme (Statistik, Auswertung, Präsentation) als einzelne SVG-Dateien (ZIP-Archiv).", type: 'SVG_ZIP', ext: "zip" },
                chartSinglePNG: { description: "Ausgewähltes Diagramm '{ChartName}' als PNG-Datei.", type: 'CHART_SINGLE_PNG', ext: "png"},
                chartSingleSVG: { description: "Ausgewähltes Diagramm '{ChartName}' als SVG-Datei (Vektorformat).", type: 'CHART_SINGLE_SVG', ext: "svg"},
                tableSinglePNG: { description: "Ausgewählte Tabelle '{TableName}' als PNG-Bilddatei.", type: 'TABLE_PNG_EXPORT', ext: "png"},
                allZIP: { description: "Alle verfügbaren Einzeldateien (Statistik-CSV, BruteForce-TXT, alle MDs, Rohdaten-CSV, HTML-Report) in einem ZIP-Archiv.", type: 'ALL_ZIP', ext: "zip"},
                csvZIP: { description: "Alle verfügbaren CSV-Dateien (Statistik, Rohdaten) in einem ZIP-Archiv.", type: 'CSV_ZIP', ext: "zip"},
                mdZIP: { description: "Alle verfügbaren Markdown-Dateien (Deskriptiv, Daten, Auswertung, Publikationstexte) in einem ZIP-Archiv.", type: 'MD_ZIP', ext: "zip"},
                pngZIP: { description: "Identisch zum 'Diagramme & Tabellen (PNG)' Einzel-Export.", type: 'PNG_ZIP', ext: "zip"},
                svgZIP: { description: "Identisch zum 'Diagramme (SVG)' Einzel-Export.", type: 'SVG_ZIP', ext: "zip"},
                xlsxZIP: { description: "Alle verfügbaren Excel-Dateien in einem ZIP-Archiv.", type: 'XLSX_ZIP', ext: "xlsx"}
            },
            publikationTabTooltips: {
                spracheSwitch: { description: "Wechselt die Sprache der generierten Texte und einiger Beschriftungen im Publikation-Tab zwischen Deutsch und Englisch." },
                sectionSelect: { description: "Wählen Sie den Abschnitt der wissenschaftlichen Publikation, für den Textvorschläge und relevante Daten/Grafiken angezeigt werden sollen." },
                bruteForceMetricSelect: { description: "Wählen Sie die Zielmetrik, deren Brute-Force-Optimierungsergebnisse im Ergebnisteil angezeigt werden sollen. Standardtexte beziehen sich meist auf die Default-Optimierungsmetrik (Balanced Accuracy)." },
                abstract: {
                    main: { description: "Inhalt für den Abstract und die Key Results gemäß Journal-Vorgaben." }
                },
                introduction: {
                    main: { description: "Textvorschlag für die Einleitung der Publikation." }
                },
                methoden: {
                    studienanlage: { description: "Textvorschlag und Informationen zu Studiendesign, Ethik und Software (gemäß Radiology-Anforderungen)." },
                    patientenkollektiv: { description: "Textvorschlag und Informationen zum Patientenkollektiv und der Datenbasis (gemäß Radiology-Anforderungen)." },
                    mrtProtokoll: { description: "Textvorschlag und Informationen zum MRT-Protokoll und Kontrastmittelgabe (gemäß Radiology-Anforderungen)." },
                    asDefinition: { description: "Textvorschlag und Informationen zur Definition und Bewertung des Avocado Signs (gemäß Radiology-Anforderungen)." },
                    t2Definition: { description: "Textvorschlag und Informationen zur Definition und Bewertung der T2-Kriterien (Literatur, Brute-Force optimiert) (gemäß Radiology-Anforderungen)." },
                    referenzstandard: { description: "Textvorschlag und Informationen zum Referenzstandard (Histopathologie) (gemäß Radiology-Anforderungen)." },
                    statistischeAnalyse: { description: "Textvorschlag und Informationen zu den statistischen Analysemethoden (gemäß Radiology-Anforderungen)." }
                },
                ergebnisse: {
                    patientencharakteristika: { description: "Textvorschlag und relevante Tabellen/Diagramme zu den Patientencharakteristika (gemäß Radiology-Anforderungen)." },
                    asPerformance: { description: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte des Avocado Signs (gemäß Radiology-Anforderungen)." },
                    literaturT2Performance: { description: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte der Literatur-basierten T2-Kriterien (gemäß Radiology-Anforderungen)." },
                    optimierteT2Performance: { description: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte der Brute-Force optimierten T2-Kriterien (gemäß Radiology-Anforderungen)." },
                    vergleichPerformance: { description: "Textvorschlag und relevante Tabellen/Diagramme zum statistischen Vergleich der diagnostischen Güte zwischen Avocado Sign und den T2-Kriteriensets (gemäß Radiology-Anforderungen)." }
                },
                discussion: {
                    main: { description: "Textvorschlag für die Diskussion der Publikation." }
                },
                references: {
                    main: { description: "Referenzliste der Publikation." }
                }
            },
            statMetrics: {
                sens: { name: "Sensitivität", description: "Sensitivität ([METHODE] vs. N): Anteil der tatsächlich positiven Fälle (N+), die durch die Methode [METHODE] korrekt als positiv erkannt wurden.<br>*Formel: RP / (RP + FN)*", interpretation: "Die Methode [METHODE] erkannte **[WERT]** der tatsächlich N+ Patienten korrekt (95%-KI nach [METHOD_CI]: **[LOWER]** – **[UPPER]**) im Kollektiv [KOLLEKTIV]."},
                spez: { name: "Spezifität", description: "Spezifität ([METHODE] vs. N): Anteil der tatsächlich negativen Fälle (N-), die durch die Methode [METHODE] korrekt als negativ erkannt wurden.<br>*Formel: RN / (RN + FP)*", interpretation: "Die Methode [METHODE] erkannte **[WERT]** der tatsächlich N- Patienten korrekt (95%-KI nach [METHOD_CI]: **[LOWER]** – **[UPPER]**) im Kollektiv [KOLLEKTIV]."},
                ppv: { name: "Pos. Prädiktiver Wert (PPV)", description: "PPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem positiven Testergebnis durch Methode [METHODE] tatsächlich krank (N+) ist.<br>*Formel: RP / (RP + FP)*", interpretation: "Wenn die Methode [METHODE] ein positives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N+ Status bei **[WERT]** (95%-KI nach [METHOD_CI]: **[LOWER]** – **[UPPER]**) im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig."},
                npv: { name: "Neg. Prädiktiver Wert (NPV)", description: "NPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem negativen Testergebnis durch Methode [METHODE] tatsächlich gesund (N-) ist.<br>*Formel: RN / (RN + FN)*", interpretation: "Wenn die Methode [METHODE] ein negatives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N- Status bei **[WERT]** (95%-KI nach [METHOD_CI]: **[LOWER]** – **[UPPER]**) im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig."},
                acc: { name: "Accuracy (Gesamtgenauigkeit)", description: "Accuracy ([METHODE] vs. N): Anteil aller Fälle, die durch die Methode [METHODE] korrekt klassifiziert wurden.<br>*Formel: (RP + RN) / Gesamtanzahl*", interpretation: "Die Methode [METHODE] klassifizierte insgesamt **[WERT]** aller Patienten korrekt (95%-KI nach [METHOD_CI]: **[LOWER]** – **[UPPER]**) im Kollektiv [KOLLEKTIV]."},
                balAcc: { name: "Balanced Accuracy", description: "Balanced Accuracy ([METHODE] vs. N): Der Mittelwert aus Sensitivität und Spezifität. Sinnvoll bei ungleichen Gruppengrößen (Prävalenz).<br>*Formel: (Sensitivität + Spezifität) / 2*", interpretation: "Die Balanced Accuracy der Methode [METHODE], die Sensitivität und Spezifität gleich gewichtet, betrug **[WERT]** (95%-KI nach [METHOD_CI]: **[LOWER]** – **[UPPER]**) im Kollektiv [KOLLEKTIV]."},
                f1: { name: "F1-Score", description: "F1-Score ([METHODE] vs. N): Das harmonische Mittel aus PPV (Precision) und Sensitivität (Recall). Ein Wert von 1 ist optimal.<br>*Formel: 2 * (PPV * Sensitivität) / (PPV + Sensitivität)*", interpretation: "Der F1-Score für die Methode [METHODE], der Präzision und Sensitivität kombiniert, beträgt **[WERT]** (95%-KI nach [METHOD_CI]: **[LOWER]** – **[UPPER]**) im Kollektiv [KOLLEKTIV]."},
                auc: { name: "Area Under Curve (AUC)", description: "AUC ([METHODE] vs. N): Fläche unter der Receiver Operating Characteristic (ROC)-Kurve. Repräsentiert die Fähigkeit einer Methode, zwischen positiven und negativen Fällen zu unterscheiden. 0.5 entspricht Zufall, 1.0 perfekter Trennung.<br>*Für binäre Tests (wie AS oder eine feste T2-Regel) ist AUC = Balanced Accuracy.*", interpretation: "Die AUC von **[WERT]** (95%-KI nach [METHOD_CI]: **[LOWER]** – **[UPPER]**) deutet auf eine **[BEWERTUNG]** generelle Trennschärfe der Methode [METHODE] zwischen N+ und N- Fällen im Kollektiv [KOLLEKTIV] hin."},
                mcnemar: { name: "McNemar-Test", description: "Prüft auf einen signifikanten Unterschied in den diskordanten Paaren (Fälle, bei denen AS und [T2_SHORT_NAME] unterschiedliche Ergebnisse liefern) bei gepaarten Daten (d.h. beide Tests am selben Patienten).<br>*Nullhypothese (H0): Anzahl(AS+ / [T2_SHORT_NAME]-) = Anzahl(AS- / [T2_SHORT_NAME]+). Ein kleiner p-Wert spricht gegen H0.*", interpretation: "Der McNemar-Test ergab einen p-Wert von **[P_WERT] ([SIGNIFIKANZ])**. Dies deutet darauf hin, dass sich die Fehlklassifizierungsraten (diskordante Paare) von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] **[SIGNIFIKANZ_TEXT]** unterscheiden."},
                delong: { name: "DeLong-Test", description: "Vergleicht zwei AUC-Werte von ROC-Kurven, die auf denselben (gepaarten) Daten basieren, unter Berücksichtigung der Kovarianz.<br>*Nullhypothese (H0): AUC(AS) = AUC([T2_SHORT_NAME]). Ein kleiner p-Wert spricht gegen H0.*", interpretation: "Der DeLong-Test ergab einen p-Wert von **[P_WERT] ([SIGNIFIKANZ])**. Dies deutet darauf hin, dass sich die AUC-Werte (bzw. Balanced Accuracies) von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] **[SIGNIFIKANZ_TEXT]** unterscheiden."},
                phi: { name: "Phi-Koeffizient (φ)", description: "Maß für die Stärke und Richtung des Zusammenhangs zwischen zwei binären Variablen (z.B. Vorhandensein von Merkmal '[MERKMAL]' und N-Status). Wertebereich von -1 bis +1. 0 bedeutet kein Zusammenhang.", interpretation: "Der Phi-Koeffizient von **[WERT]** deutet auf einen **[STAERKE]** Zusammenhang zwischen dem Merkmal '[MERKMAL]' und dem N-Status im Kollektiv [KOLLEKTIV] hin."},
                rd: { name: "Risk Difference (RD)", description: "Absolute Differenz in der Wahrscheinlichkeit (Risiko) für N+ zwischen Patienten mit und ohne das Merkmal '[MERKMAL]'. RD = P(N+|Merkmal+) - P(N+|Merkmal-). Ein RD von 0 bedeutet kein Unterschied.", interpretation: "Das Risiko für einen N+ Status war bei Patienten mit dem Merkmal '[MERKMAL]' um **[WERT]%** absolut **[HOEHER_NIEDRIGER]** als bei Patienten ohne dieses Merkmal (95%-KI nach [METHOD_CI]: **[LOWER]**% – **[UPPER]**%) im Kollektiv [KOLLEKTIV]."},
                or: { name: "Odds Ratio (OR)", description: "Quotient der Odds für N+ bei Vorhandensein vs. Abwesenheit des Merkmals '[MERKMAL]'. OR = Odds(N+|Merkmal+) / Odds(N+|Merkmal-).<br>OR > 1: Erhöhte Odds für N+ bei Vorhandensein des Merkmals.<br>OR < 1: Verringerte Odds.<br>OR = 1: Keine Assoziation.", interpretation: "Die Chance (Odds) für einen N+ Status war bei Patienten mit dem Merkmal '[MERKMAL]' um den Faktor **[WERT]** **[FAKTOR_TEXT]** im Vergleich zu Patienten ohne dieses Merkmal (95%-KI nach [METHOD_CI]: **[LOWER]** – **[UPPER]**, p=**[P_WERT]**, [SIGNIFIKANZ]) im Kollektiv [KOLLEKTIV]."},
                fisher: { name: "Fisher's Exact Test", description: "Exakter Test zur Prüfung auf einen signifikanten Zusammenhang zwischen zwei kategorialen Variablen (z.B. Merkmal '[MERKMAL]' vs. N-Status). Geeignet auch für kleine Stichproben/geringe erwartete Häufigkeiten.<br>*Nullhypothese (H0): Kein Zusammenhang.*", interpretation: "Der exakte Test nach Fisher ergab einen p-Wert von **[P_WERT] ([SIGNIFIKANZ])**, was auf einen **[SIGNIFIKANZ_TEXT]** Zusammenhang zwischen dem Merkmal '[MERKMAL]' und dem N-Status im Kollektiv [KOLLEKTIV] hindeutet."},
                mannwhitney: { name: "Mann-Whitney-U-Test", description: "Nichtparametrischer Test zum Vergleich der zentralen Tendenz (Median) einer kontinuierlichen Variablen (z.B. '[VARIABLE]') zwischen zwei unabhängigen Gruppen (z.B. N+ vs. N-).<br>*Nullhypothese (H0): Kein Unterschied in den Medianen/Verteilungen.*", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von **[P_WERT] ([SIGNIFIKANZ])**. Dies zeigt einen **[SIGNIFIKANZ_TEXT]** Unterschied in der Verteilung der Variable '[VARIABLE]' zwischen N+ und N- Patienten im Kollektiv [KOLLEKTIV]."},
                ci95: { name: "95% Konfidenzintervall (CI)", description: "Der Wertebereich, der den wahren (unbekannten) Populationsparameter der Metrik mit 95%iger Wahrscheinlichkeit überdeckt.<br>*Methode: [METHOD_CI]*", interpretation: "Basierend auf den Daten liegt der wahre Wert der Metrik mit 95%iger Sicherheit zwischen **[LOWER]** und **[UPPER]**."},
                konfusionsmatrix: { description: "Kreuztabelle, die die Klassifikationsergebnisse der Methode [METHODE] mit dem tatsächlichen N-Status vergleicht: Richtig Positive (RP), Falsch Positive (FP), Falsch Negative (FN), Richtig Negative (RN)." },
                accComp: { name: "Accuracy Vergleich (ungepaart)", description: "Vergleicht die Accuracy der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels Fisher's Exact Test.<br>*Nullhypothese (H0): Accuracy in Kollektiv1 = Accuracy in Kollektiv2.*", interpretation: "Der Unterschied in der Accuracy der Methode [METHODE] zwischen den Kollektiven **[KOLLEKTIV1]** und **[KOLLEKTIV2]** ist **[SIGNIFIKANZ_TEXT]** (p=**[P_WERT]**)." },
                aucComp: { name: "AUC Vergleich (ungepaart)", description: "Vergleicht die AUC der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels eines Z-Tests basierend auf den Standardfehlern der AUCs.<br>*Nullhypothese (H0): AUC in Kollektiv1 = AUC in Kollektiv2.*", interpretation: "Der Unterschied in der AUC der Methode [METHODE] zwischen den Kollektiven **[KOLLEKTIV1]** und **[KOLLEKTIV2]** ist **[SIGNIFIKANZ_TEXT]** (p=**[P_WERT]**)." },
                defaultP: { interpretation: `Der berechnete p-Wert beträgt **[P_WERT] ([SIGNIFIKANZ])**. Bei einem Signifikanzniveau von ${String(0.05).replace('.',',')} ist das Ergebnis **[SIGNIFIKANZ_TEXT]**.` },
                size_mwu: {name: "LK Größe MWU", description: "Vergleich der medianen Lymphknotengrößen zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test. Hier werden alle Lymphknoten der Patienten berücksichtigt, nicht Patienten-Level-Status.", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von **[P_WERT] ([SIGNIFIKANZ])**. Dies zeigt einen **[SIGNIFIKANZ_TEXT]** Unterschied in der Verteilung der Lymphknotengrößen zwischen den Lymphknoten von N+ und N- Patienten im Kollektiv [KOLLEKTIV]."}
            }
        }
    },
    PUBLICATION_CONFIG: {
        defaultLanguage: 'de',
        defaultSection: 'abstract',
        defaultBruteForceMetricForPublication: 'Balanced Accuracy',
        sections: [
            {
                id: 'abstract',
                labelKey: 'abstract',
                subSections: [
                    { id: 'abstract_main', label: 'Abstract & Key Results', isTopLevel: true }
                ]
            },
            {
                id: 'introduction',
                labelKey: 'introduction',
                subSections: [
                    { id: 'introduction_main', label: 'Einleitung', isTopLevel: true }
                ]
            },
            {
                id: 'methoden',
                labelKey: 'methoden',
                subSections: [
                    { id: 'methoden_studienanlage_ethik', label: 'Studiendesign und Ethikvotum' },
                    { id: 'methoden_patientenkohorte', label: 'Patientenkohorte und Einschlusskriterien' },
                    { id: 'methoden_mrt_protokoll_akquisition', label: 'MRT-Protokoll und Bildakquisition' },
                    { id: 'methoden_bildanalyse_avocado_sign', label: 'Bildanalyse: Avocado Sign' },
                    { id: 'methoden_bildanalyse_t2_kriterien', label: 'Bildanalyse: T2-gewichtete Kriterien' },
                    { id: 'methoden_referenzstandard_histopathologie', label: 'Referenzstandard: Histopathologie' },
                    { id: 'methoden_statistische_analyse_methoden', label: 'Statistische Analyse' }
                ]
            },
            {
                id: 'ergebnisse',
                labelKey: 'ergebnisse',
                subSections: [
                    { id: 'ergebnisse_patientencharakteristika', label: 'Patientencharakteristika und Datenfluss' },
                    { id: 'ergebnisse_as_diagnostische_guete', label: 'Diagnostische Güte: Avocado Sign' },
                    { id: 'ergebnisse_t2_literatur_diagnostische_guete', label: 'Diagnostische Güte: T2-Kriterien (Literatur)' },
                    { id: 'ergebnisse_t2_optimiert_diagnostische_guete', label: 'Diagnostische Güte: T2-Kriterien (Brute-Force optimiert)' },
                    { id: 'ergebnisse_vergleich_as_vs_t2', label: 'Vergleichsanalysen: Avocado Sign vs. T2-Kriterien' }
                ]
            },
            {
                id: 'discussion',
                labelKey: 'discussion',
                subSections: [
                    { id: 'discussion_main', label: 'Diskussion der Ergebnisse und Limitationen', isTopLevel: true }
                ]
            },
            {
                id: 'references',
                labelKey: 'references',
                subSections: [
                    { id: 'references_main', label: 'Literaturverzeichnis', isTopLevel: true }
                ]
            }
        ],
        literatureCriteriaSets: [
            {
                id: 'rutegard_et_al_esgar',
                name: 'Rutegård et al. (2025) / ESGAR 2016',
                displayShortName: 'ESGAR 2016',
                context: 'Primär-Staging (Baseline-MRT)',
                applicableKollektiv: 'direkt OP',
                criteria: {
                    size: { active: true, threshold: 9.0, condition: '>=' },
                    form: { active: true, value: 'rund' },
                    kontur: { active: true, value: 'irregulär' },
                    homogenitaet: { active: true, value: 'heterogen' },
                    signal: { active: false, value: null }
                },
                logic: 'KOMBINIERT',
                description: 'ESGAR 2016 Kriterien für Primär-Staging: Größe ≥ 9mm ODER (Größe 5-8mm UND ≥2 Merkmale [rund, irregulär, heterogen]) ODER (Größe < 5mm UND ALLE 3 Merkmale [rund, irregulär, heterogen]).',
                studyInfo: {
                    reference: "Rutegård MK, Båtsman M, Blomqvist L, et al. Eur Radiol. 2025; Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Eur Radiol. 2018.",
                    patientCohort: "Rutegård: N=46 (mean age, 67.7 years ± 1.5 [SD], 27 men), 19 received neoadjuvant treatment. ESGAR: Consensus.",
                    investigationType: "Primärstaging",
                    focus: "Validierung ESGAR 2016 Kriterien (Rutegård) bzw. Konsensus-Empfehlung (ESGAR).",
                    keyCriteriaSummary: "Größe ≥ 9mm ODER (5-8mm UND ≥2 von [rund, irregulär, heterogen]) ODER (<5mm UND 3 von [rund, irregulär, heterogen]).",
                    criteriaDetails: {
                        logic: 'KOMBINIERT',
                        rules: [
                            { key: 'size', condition: '>=', threshold: 9.0, logicBranch: 'OR' },
                            { key: 'size', condition: 'range', lower: 5.0, upper: 8.0, combinedWith: ['form', 'kontur', 'homogenitaet'], minCount: 2, logicBranch: 'OR' },
                            { key: 'size', condition: '<', threshold: 5.0, combinedWith: ['form', 'kontur', 'homogenitaet'], minCount: 3, logicBranch: 'OR' }
                        ]
                    }
                }
            },
            {
                id: 'koh_2008_morphology',
                name: 'Koh et al. (2008)',
                displayShortName: 'Koh et al.',
                context: 'Primär & Restaging (Urspr. Studie fokussiert auf Post-nCRT)',
                applicableKollektiv: 'Gesamt',
                criteria: {
                    size: { active: false, threshold: null, condition: null },
                    form: { active: false, value: null },
                    kontur: { active: true, value: 'irregulär' },
                    homogenitaet: { active: true, value: 'heterogen' },
                    signal: { active: false, value: null }
                },
                logic: 'ODER',
                description: 'Koh et al. (2008): Morphologische Kriterien - Irreguläre Kontur ODER heterogenes Binnensignal. In dieser Anwendung für das Gesamtkollektiv evaluiert.',
                studyInfo: {
                    reference: "Koh DM, Chau I, Tait D, et al. Int J Radiat Oncol Biol Phys. 2008.",
                    patientCohort: "Ursprüngliche Studie: N=25 (alle nCRT, 'poor-risk'). Anwendung in diesem Tool: Gesamtkollektiv (N=106).",
                    investigationType: "Vor und nach nCRT (Ursprüngliche Genauigkeitsanalyse post-nCRT)",
                    focus: "Ursprünglich: Bewertung von LK vor und nach nCRT mittels Morphologie. In diesem Tool: Vergleichbarkeit mit Avocado Sign im Gesamtkollektiv.",
                    keyCriteriaSummary: "Irreguläre Kontur ODER heterogenes Signal."
                }
            },
            {
                id: 'barbaro_2024_restaging',
                name: 'Barbaro et al. (2024)',
                displayShortName: 'Barbaro et al.',
                context: 'Restaging nach nCRT',
                applicableKollektiv: 'nRCT',
                criteria: {
                    size: { active: true, threshold: 2.3, condition: '>=' },
                    form: { active: false, value: null },
                    kontur: { active: false, value: null },
                    homogenitaet: { active: false, value: null },
                    signal: { active: false, value: null }
                },
                logic: 'ODER',
                description: 'Barbaro et al. (2024): Optimaler Cut-off für Kurzachse im Restaging nach nRCT: ≥ 2.3mm (Original 2.2mm).',
                studyInfo: {
                    reference: "Barbaro B, Carafa MRP, Minordi LM, et al. Radiother Oncol. 2024.",
                    patientCohort: "N=191 (alle nCRT, LARC)",
                    investigationType: "Restaging nach nCRT",
                    focus: "MRI-Bewertung N-Status nach nCRT mittels Größe (optimaler Cut-off).",
                    keyCriteriaSummary: "Kurzachse ≥ 2.3 mm (basierend auf Studie: 2.2mm)."
                }
            }
        ],
        bruteForceMetricsForPublication: [
            { value: 'Balanced Accuracy', label: 'Balanced Accuracy' },
            { value: 'Accuracy', label: 'Accuracy' },
            { value: 'F1-Score', label: 'F1-Score' },
            { value: 'PPV', label: 'Positiver Prädiktiver Wert (PPV)' },
            { value: 'NPV', label: 'Negativer Prädiktiver Wert (NPV)' }
        ],
        defaultBruteForceMetricForPublication: 'Balanced Accuracy',
        publicationElements: {
            methoden: {
                literaturT2KriterienTabelle: {
                    id: 'pub-table-literatur-t2-kriterien',
                    titleDe: 'Übersicht der evaluierten Literatur-basierten T2-Kriteriensets',
                    titleEn: 'Overview of Evaluated Literature-Based T2 Criteria Sets',
                    captionDe: 'Tabelle Methoden 1: Übersicht der in dieser Studie evaluierten Literatur-basierten T2-Kriteriensets und deren Anwendungslogik. Originalpublikationen, Patientenkohorten und Studienfokus werden zur Kontextualisierung angegeben.',
                    captionEn: 'Methods Table 1: Overview of evaluated literature-based T2 criteria sets and their application logic in this study. Original publications, patient cohorts, and study focus are provided for contextualization.'
                },
                flowDiagram: {
                    id: 'pub-figure-flow-diagram',
                    titleDe: 'Flussdiagramm der Patientenrekrutierung und -analyse',
                    titleEn: 'Patient Recruitment and Analysis Flowchart',
                    captionDe: 'Abbildung Methoden 1: Flussdiagramm der Patientenrekrutierung und -analyse. Die Zahlen basieren auf dem in der Anwendung verwendeten Datensatz (N=[TOTAL_PATIENTS_ALL_COLLECTIVE]).',
                    captionEn: 'Methods Figure 1: Patient recruitment and analysis flowchart. Numbers are based on the dataset used in the application (n=[TOTAL_PATIENTS_ALL_COLLECTIVE]).'
                }
            },
            ergebnisse: {
                patientenCharakteristikaTabelle: {
                    id: 'pub-table-patienten-charakteristika',
                    titleDe: 'Baseline Patientencharakteristika und klinische Daten',
                    titleEn: 'Baseline Patient Characteristics and Clinical Data',
                    captionDe: 'Tabelle Ergebnisse 1: Baseline Patientencharakteristika und klinische Daten für das Gesamtkollektiv und die primären Behandlungsgruppen (Direkt OP und nRCT). Werte werden als Median (Min–Max) [Mean ± SD] oder n (%) angegeben.',
                    captionEn: 'Results Table 1: Baseline patient characteristics and clinical data for the overall cohort and primary treatment groups (upfront surgery and nRCT). Values are presented as median (Min–Max) [Mean ± SD] or n (%).'
                },
                diagnostischeGueteASTabelle: {
                    id: 'pub-table-diagnostische-guete-as',
                    titleDe: 'Diagnostische Güte des Avocado Signs für die Prädiktion des N-Status',
                    titleEn: 'Diagnostic Performance of the Avocado Sign for N-Status Prediction',
                    captionDe: 'Tabelle Ergebnisse 2: Diagnostische Güte des Avocado Signs (AS) zur Prädiktion des histopathologischen N-Status im Gesamtkollektiv sowie in den Subgruppen Direkt OP und nRCT. Werte sind als Metrik (95%-KI) angegeben.',
                    captionEn: 'Results Table 2: Diagnostic performance of the Avocado Sign (AS) for predicting histopathological N-status in the overall cohort and in the upfront surgery and nRCT subgroups. Values are presented as metric (95% CI).'
                },
                diagnostischeGueteLiteraturT2Tabelle: {
                    id: 'pub-table-diagnostische-guete-literatur-t2',
                    titleDe: 'Diagnostische Güte der Literatur-basierten T2-Kriterien für die Prädiktion des N-Status',
                    titleEn: 'Diagnostic Performance of Literature-Based T2 Criteria for N-Status Prediction',
                    captionDe: 'Tabelle Ergebnisse 3: Diagnostische Güte der Literatur-basierten T2-Kriteriensets zur Prädiktion des N-Status, angewendet auf das jeweils relevante Kollektiv. Werte sind als Metrik (95%-KI) angegeben.',
                    captionEn: 'Results Table 3: Diagnostic performance of literature-based T2 criteria sets for predicting N-status, applied to the respective relevant cohort. Values are presented as metric (95% CI).'
                },
                diagnostischeGueteOptimierteT2Tabelle: {
                    id: 'pub-table-diagnostische-guete-optimierte-t2',
                    titleDe: 'Diagnostische Güte der Brute-Force optimierten T2-Kriterien (Ziel: {BF_METRIC}) für die Prädiktion des N-Status',
                    titleEn: 'Diagnostic Performance of Brute-Force Optimized T2 Criteria (Target: {BF_METRIC}) for N-Status Prediction',
                    captionDe: 'Tabelle Ergebnisse 4: Diagnostische Güte der datengetrieben optimierten T2-Kriterien zur Prädiktion des N-Status. Die Optimierung erfolgte spezifisch für jedes Kollektiv mit dem Ziel, die {BF_METRIC} zu maximieren. Werte sind als Metrik (95%-KI) angegeben.',
                    captionEn: 'Results Table 4: Diagnostic performance of data-driven optimized T2 criteria for predicting N-status. Optimization was performed specifically for each cohort aiming to maximize {BF_METRIC}. Values are presented as metric (95% CI).'
                },
                statistischerVergleichAST2Tabelle: {
                    id: 'pub-table-statistischer-vergleich-as-t2',
                    titleDe: 'Statistischer Vergleich der diagnostischen Güte: Avocado Sign vs. T2-Kriterien (Literatur und Optimiert)',
                    titleEn: 'Statistical Comparison of Diagnostic Performance: Avocado Sign vs. T2 Criteria (Literature and Optimized)',
                    captionDe: 'Tabelle Ergebnisse 5: Statistischer Vergleich der diagnostischen Leistung (Accuracy und AUC) zwischen dem Avocado Sign (AS) und den T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) in den verschiedenen Kollektiven. Angegeben sind die AUC-Werte beider Methoden, die Differenz der AUCs und die p-Werte des DeLong-Tests (für AUC) und des McNemar-Tests (für Accuracy).',
                    captionEn: 'Results Table 5: Statistical comparison of diagnostic performance (Accuracy and AUC) between the Avocado Sign (AS) and T2 criteria sets (literature-based and brute-force optimized) across different cohorts. Reported are the AUC values for both methods, the difference in AUCs, and the p-values from DeLong\'s test (for AUC) and McNemar\'s test (for Accuracy).'
                },
                alterVerteilungChart: {
                    id: 'pub-chart-alter-Gesamt',
                    titleDe: 'Altersverteilung im Gesamtkollektiv',
                    titleEn: 'Age Distribution in the Overall Cohort',
                    captionDe: 'Abbildung Ergebnisse 1a: Altersverteilung der Patienten im Gesamtkollektiv (N=[TOTAL_PATIENTS_OVERALL]). Dargestellt ist die Häufigkeit der Patienten in Alterskohorten.',
                    captionEn: 'Results Figure 1a: Age distribution of patients in the overall cohort (n=[TOTAL_PATIENTS_OVERALL]). Shows the frequency of patients in age cohorts.'
                },
                geschlechtVerteilungChart: {
                    id: 'pub-chart-gender-Gesamt',
                    titleDe: 'Geschlechterverteilung im Gesamtkollektiv',
                    titleEn: 'Gender Distribution in the Overall Cohort',
                    captionDe: 'Abbildung Ergebnisse 1b: Geschlechterverteilung der Patienten im Gesamtkollektiv (N=[TOTAL_PATIENTS_OVERALL]). Dargestellt ist der prozentuale Anteil von männlichen (M) und weiblichen (W) Patienten.',
                    captionEn: 'Results Figure 1b: Gender distribution of patients in the overall cohort (n=[TOTAL_PATIENTS_OVERALL]). Shows the percentage of male (M) and female (F) patients.'
                },
                vergleichPerformanceChartGesamt: {
                    id: 'pub-chart-vergleich-Gesamt',
                    titleDe: 'Vergleichsmetriken für das Gesamtkollektiv: AS vs. optimierte T2-Kriterien',
                    titleEn: 'Comparative Metrics for the Overall Cohort: AS vs. Optimized T2 Criteria',
                    captionDe: 'Abbildung Ergebnisse 2a: Vergleich der diagnostischen Gütekriterien (Sensitivität, Spezifität, PPV, NPV, Accuracy, AUC) zwischen Avocado Sign (AS) und den für das Gesamtkollektiv optimierten T2-Kriterien (BF-T2) (N=[TOTAL_PATIENTS_OVERALL]).',
                    captionEn: 'Results Figure 2a: Comparison of diagnostic performance metrics (Sensitivity, Specificity, PPV, NPV, Accuracy, AUC) between Avocado Sign (AS) and T2 criteria optimized for the overall cohort (BF-T2) (n=[TOTAL_PATIENTS_OVERALL]).'
                },
                vergleichPerformanceChartdirektOP: {
                    id: 'pub-chart-vergleich-direkt-OP',
                    titleDe: 'Vergleichsmetriken für das Direkt-OP Kollektiv: AS vs. optimierte T2-Kriterien',
                    titleEn: 'Comparative Metrics for the Upfront Surgery Cohort: AS vs. Optimized T2 Criteria',
                    captionDe: 'Abbildung Ergebnisse 2b: Vergleich der diagnostischen Gütekriterien (Sensitivität, Spezifität, PPV, NPV, Accuracy, AUC) zwischen Avocado Sign (AS) und den für das Direkt-OP Kollektiv optimierten T2-Kriterien (BF-T2) (N=[TOTAL_PATIENTS_DIREKTOP]).',
                    captionEn: 'Results Figure 2b: Comparison of diagnostic performance metrics (Sensitivity, Specificity, PPV, NPV, Accuracy, AUC) between Avocado Sign (AS) and T2 criteria optimized for the upfront surgery cohort (BF-T2) (n=[TOTAL_PATIENTS_DIREKTOP]).'
                },
                vergleichPerformanceChartnRCT: {
                    id: 'pub-chart-vergleich-nRCT',
                    titleDe: 'Vergleichsmetriken für das nRCT Kollektiv: AS vs. optimierte T2-Kriterien',
                    titleEn: 'Comparative Metrics for the nRCT Cohort: AS vs. Optimized T2 Criteria',
                    captionDe: 'Abbildung Ergebnisse 2c: Vergleich der diagnostischen Gütekriterien (Sensitivität, Spezifität, PPV, NPV, Accuracy, AUC) zwischen Avocado Sign (AS) und den für das nRCT Kollektiv optimierten T2-Kriterien (BF-T2) (N=[TOTAL_PATIENTS_NRCT]).',
                    captionEn: 'Results Figure 2c: Comparison of diagnostic performance metrics (Sensitivity, Specificity, PPV, NPV, Accuracy, AUC) between Avocado Sign (AS) and T2 criteria optimized for the nRCT cohort (BF-T2) (n=[TOTAL_PATIENTS_NRCT]).'
                }
            }
        }
    }
};

APP_CONFIG_MUTABLE.UI_TEXTS.kurzanleitung.content = APP_CONFIG_MUTABLE.UI_TEXTS.kurzanleitung.content
    .replace('[APP_VERSION]', APP_CONFIG_MUTABLE.APP_VERSION)
    .replace('[SIGNIFICANCE_LEVEL_FORMATTED]', String(APP_CONFIG_MUTABLE.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL).replace('.', ','));

APP_CONFIG_MUTABLE.UI_TEXTS.TOOLTIP_CONTENT.t2Size.description = APP_CONFIG_MUTABLE.UI_TEXTS.TOOLTIP_CONTENT.t2Size.description
    .replace('${5.0}', APP_CONFIG_MUTABLE.T2_CRITERIA_SETTINGS.SIZE_RANGE.min)
    .replace('${25.0}', APP_CONFIG_MUTABLE.T2_CRITERIA_SETTINGS.SIZE_RANGE.max)
    .replace('${0.1}', APP_CONFIG_MUTABLE.T2_CRITERIA_SETTINGS.SIZE_RANGE.step);
    
APP_CONFIG_MUTABLE.UI_TEXTS.TOOLTIP_CONTENT.statMetrics.defaultP.interpretation = APP_CONFIG_MUTABLE.UI_TEXTS.TOOLTIP_CONTENT.statMetrics.defaultP.interpretation
    .replace('${formatNumber(0.05,2).replace(\'.\',\',\')}', String(APP_CONFIG_MUTABLE.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL).replace('.', ','));

const APP_CONFIG = deepFreeze(APP_CONFIG_MUTABLE);
