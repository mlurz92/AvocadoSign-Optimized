const UI_TEXTS = {
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
            abstract: 'Abstract & Key Results',
            introduction: 'Einleitung',
            methoden: 'Material & Methoden',
            ergebnisse: 'Ergebnisse',
            discussion: 'Diskussion',
            references: 'Referenzen',
            publication_summary_statement: 'Summary Statement',
            publication_abstract_proper: 'Abstract',
            publication_key_results: 'Key Results',
            publication_introduction_content: 'Einleitung Inhalt',
            publication_methods_study_design_ethics: 'Studiendesign & Ethik',
            publication_methods_patient_cohort: 'Patientenkohorte',
            publication_methods_mri_protocol: 'MRT-Protokoll & Akquisition',
            publication_methods_image_analysis_as: 'Bildanalyse: Avocado Sign',
            publication_methods_image_analysis_t2: 'Bildanalyse: T2-Kriterien',
            publication_methods_reference_standard: 'Referenzstandard (Histopathologie)',
            publication_methods_statistical_analysis: 'Statistische Analyse',
            publication_results_patient_characteristics: 'Patientencharakteristika',
            publication_results_as_performance: 'Diagnostische Güte: Avocado Sign',
            publication_results_t2_literature_performance: 'Diagnostische Güte: T2-Kriterien (Literatur)',
            publication_results_t2_optimized_performance: 'Diagnostische Güte: T2-Kriterien (optimiert)',
            publication_results_comparison_as_t2: 'Vergleich: AS vs. T2-Kriterien',
            publication_discussion_content: 'Diskussion Inhalt',
            publication_references_list: 'Literaturverzeichnis'
        },
        bruteForceMetricSelectLabel: {
            de: 'Optimierungsmetrik für T2 (BF):',
            en: 'Optimization Metric for T2 (BF):'
        },
        publicationContentNotAvailable: {
            de: 'Inhalt für diesen Abschnitt (Sprache: Deutsch) wird generiert oder ist nicht verfügbar.',
            en: 'Content for this section (Language: English) is being generated or is not available.'
        },
        SECTIONS_TITLE: { de: 'Abschnitte', en: 'Sections'},
        LANGUAGE_LABEL: { de: 'Sprache Manuskript:', en: 'Manuscript Language:'},
        LANGUAGE_SWITCH_LABEL: { de: 'Deutsch / Englisch', en: 'German / English'},
        EXPORT_SECTION_BTN: { de: 'Akt. Abschnitt als MD exportieren', en: 'Export Current Section as MD'},
        LOADING_CONTENT: { de: 'Lade Inhalt...', en: 'Loading content...'}

    },
    STATISTIK_TAB: {
        TITLE: 'Statistik',
        HEADER_STAT_KOLLEKTIV: 'Kollektiv',
        NO_STATS_DATA: 'Statistische Daten konnten nicht geladen werden.',
        LAYOUT_LABEL: { de: 'Anzeige-Layout:', en: 'Display Layout:' },
        LAYOUT_EINZEL: { de: 'Einzelansicht aktuelles Kollektiv', en: 'Single View Current Cohort' },
        LAYOUT_VERGLEICH: { de: 'Vergleich zweier Kollektive', en: 'Compare Two Cohorts' },
        KOLLEKTIV1_LABEL: { de: 'Kollektiv 1:', en: 'Cohort 1:' },
        KOLLEKTIV2_LABEL: { de: 'Kollektiv 2:', en: 'Cohort 2:' },
        DESCRIPTIVE_STATS_TITLE: { de: 'Deskriptive Statistik', en: 'Descriptive Statistics' },
        PERFORMANCE_AS_TITLE: { de: 'Diagnostische Güte: Avocado Sign', en: 'Diagnostic Performance: Avocado Sign' },
        PERFORMANCE_T2_TITLE: { de: 'Diagnostische Güte: T2-Kriterien (angewandt)', en: 'Diagnostic Performance: T2 Criteria (applied)' },
        COMPARISON_AS_T2_TITLE: { de: 'Vergleich: AS vs. T2-Kriterien (angewandt)', en: 'Comparison: AS vs. T2 Criteria (applied)' },
        ASSOCIATION_TITLE: { de: 'Assoziationsanalysen', en: 'Association Analyses' },
        CRITERIA_COMP_TITLE: { de: 'Leistungsvergleich verschiedener Kriteriensets', en: 'Performance Comparison of Criteria Sets' },
        NO_DATA_FOR_COHORT: { de: 'Keine Daten für dieses Kollektiv.', en: 'No data for this cohort.'}
    },
    DATEN_TAB: {
        TITLE: 'Patientendaten',
        EXPAND_ALL_BTN: 'Alle Details'
    },
    AUSWERTUNG_TAB: {
        TITLE: 'Auswertung & T2-Definition',
        AUSWERTUNG_TABLE_TITLE: 'Patienten-Auswertungstabelle',
        EXPAND_ALL_BTN: 'Alle LK-Details',
        T2_CRITERIA_CARD_TITLE: 'T2-Kriterien Definition',
        T2_LOGIC_LABEL: 'Logische Verknüpfung:',
        T2_SIZE_LABEL: 'Größe (Kurzachse ≥ mm):',
        T2_FORM_LABEL: 'Form:',
        T2_KONTUR_LABEL: 'Kontur:',
        T2_HOMOGENITAET_LABEL: 'Binnensignal Homogenität:',
        T2_SIGNAL_LABEL: 'Binnensignal Intensität (T2w):',
        RESET_BTN: 'Zurücksetzen',
        APPLY_BTN: 'Anwenden & Speichern',
        BRUTE_FORCE_CARD_TITLE: 'Brute-Force Optimierung T2-Kriterien',
        BF_METRIC_LABEL: 'Zielmetrik:',
        BF_START_BTN: 'Optimierung starten',
        BF_STATUS_IDLE: 'Bereit.',
        BF_STATUS_RUNNING: 'Läuft...',
        BF_STATUS_COMPLETED: 'Abgeschlossen.',
        BF_STATUS_ERROR: 'Fehler.',
        BF_PROGRESS_TEXT: {de: 'Fortschritt', en: 'Progress'},
        BF_BEST_RESULT_TITLE: {de: 'Bestes Ergebnis für aktuelles Kollektiv', en: 'Best Result for Current Cohort'},
        BF_SHOW_DETAILS_BTN: {de: 'Details anzeigen (Top 10)', en: 'Show Details (Top 10)'},
        BF_MODAL_TITLE: {de: 'Brute-Force Optimierung: Top Ergebnisse', en: 'Brute-Force Optimization: Top Results'},
        BF_MODAL_EXPORT_BTN: {de: 'Bericht exportieren (.txt)', en: 'Export Report (.txt)'},
        T2_METRICS_OVERVIEW_TITLE: {de: 'Performance T2 (angewandt)', en: 'Performance T2 (applied)'}
    },
    PRAESENTATION_TAB: {
        TITLE: { de: 'Präsentation', en: 'Presentation'},
        VIEW_SELECT_LABEL: { de: 'Ansicht wählen:', en: 'Select View:'},
        VIEW_AS_PUR: { de: 'Avocado Sign (Performance-Übersicht)', en: 'Avocado Sign (Performance Overview)'},
        VIEW_AS_VS_T2: { de: 'AS vs. T2 (Vergleich)', en: 'AS vs. T2 (Comparison)'},
        STUDY_SELECT_LABEL: { de: 'T2-Vergleichsbasis wählen:', en: 'Select T2 Comparison Basis:'},
        NO_DATA_ERROR: { de: 'Daten für Präsentation nicht verfügbar.', en: 'Data for presentation not available.'},
        SELECT_VIEW_PROMPT: { de: 'Bitte wählen Sie eine Ansicht und ggf. eine Vergleichsstudie.', en: 'Please select a view and, if applicable, a comparison study.'},
        DOWNLOAD_DEMOGRAPHICS_MD: { de: 'Demographie als MD', en: 'Demographics as MD'},
        DOWNLOAD_AS_PERF_CSV: { de: 'AS Performance als CSV', en: 'AS Performance as CSV'},
        DOWNLOAD_AS_PERF_MD: { de: 'AS Performance als MD', en: 'AS Performance as MD'},
        DOWNLOAD_COMP_PERF_CSV: { de: 'Vergleich Performance als CSV', en: 'Comparison Performance as CSV'},
        DOWNLOAD_COMP_METRICS_MD: { de: 'Vergleich Metriken als MD', en: 'Comparison Metrics as MD'},
        DOWNLOAD_COMP_TESTS_MD: { de: 'Vergleich Tests als MD', en: 'Comparison Tests as MD'},
        DOWNLOAD_COMP_CHART_PNG: { de: 'Vergleichs-Chart als PNG', en: 'Comparison Chart as PNG'},
        DOWNLOAD_COMP_CHART_SVG: { de: 'Vergleichs-Chart als SVG', en: 'Comparison Chart as SVG'},
        DOWNLOAD_TABLE_PNG: { de: 'Tabelle als PNG', en: 'Table as PNG'}
    },
    EXPORT_TAB: {
        TITLE: 'Datenexport',
        DESCRIPTION_TEXT: 'Exportieren Sie hier Rohdaten, Analyseergebnisse, Tabellen und Diagramme basierend auf dem global gewählten Kollektiv ([KOLLEKTIV]) und den angewendeten T2-Kriterien.',
        SINGLE_EXPORTS_TITLE: 'Einzelexporte',
        PACKAGE_EXPORTS_TITLE: 'Export-Pakete (.zip)',
        EXPORT_STATS_CSV: { de: 'Statistik-Übersicht als CSV', en: 'Statistics Overview as CSV'},
        EXPORT_BRUTEFORCE_TXT: { de: 'Brute-Force Report als TXT', en: 'Brute-Force Report as TXT'},
        EXPORT_DESKRIPTIV_MD: { de: 'Deskriptive Statistik als MD', en: 'Descriptive Statistics as MD'},
        EXPORT_DATEN_MD: { de: 'Patientendaten-Tabelle als MD', en: 'Patient Data Table as MD'},
        EXPORT_AUSWERTUNG_MD: { de: 'Auswertungstabelle als MD', en: 'Evaluation Table as MD'},
        EXPORT_FILTERED_DATA_CSV: { de: 'Akt. Kollektivdaten als CSV', en: 'Current Cohort Data as CSV'},
        EXPORT_COMPREHENSIVE_HTML: { de: 'Umfassender HTML-Report', en: 'Comprehensive HTML Report'},
        EXPORT_PACKAGE_ALL: { de: 'Alle Einzeldateien (ZIP)', en: 'All Single Files (ZIP)'},
        EXPORT_PACKAGE_CSV: { de: 'Alle CSV-Dateien (ZIP)', en: 'All CSV Files (ZIP)'},
        EXPORT_PACKAGE_MD: { de: 'Alle Markdown-Dateien (ZIP)', en: 'All Markdown Files (ZIP)'},
        EXPORT_PACKAGE_XLSX: { de: 'Alle Excel-Dateien (ZIP)', en: 'All Excel Files (ZIP)'},
        EXPORT_PACKAGE_PNG: { de: 'Alle Diagramme/Tabellen als PNG (ZIP)', en: 'All Charts/Tables as PNG (ZIP)'},
        EXPORT_PACKAGE_SVG: { de: 'Alle Diagramme als SVG (ZIP)', en: 'All Charts as SVG (ZIP)'},
        noDataToExport: { de: 'Keine Daten zum Exportieren.', en: 'No data to export.'},
        exportError: { de: 'Export fehlgeschlagen.', en: 'Export failed.'}
    },
    LADEN: {de: 'Lade Daten...', en: 'Loading data...'},
    chartTitles: {
        ageDistribution: {
            de: 'Altersverteilung',
            en: 'Age Distribution'
        },
        genderDistribution: {
            de: 'Geschlechterverteilung',
            en: 'Gender Distribution'
        },
        therapyDistribution: {
            de: 'Therapieverteilung',
            en: 'Therapy Distribution'
        },
        statusN: {
            de: 'N-Status (Patho)',
            en: 'N-Status (Patho)'
        },
        statusAS: {
            de: 'AS-Status',
            en: 'AS-Status'
        },
        statusT2: {
            de: 'T2-Status (angewandt)',
            en: 'T2-Status (applied)'
        },
        comparisonBar: {
            de: 'Vergleich AS vs. {T2Name}',
            en: 'Comparison AS vs. {T2Name}'
        },
        rocCurve: {
            de: 'ROC-Kurve für {Method}',
            en: 'ROC Curve for {Method}'
        },
        asPerformance: {
            de: 'AS Performance (Akt. Kollektiv)',
            en: 'AS Performance (Current Cohort)'
        }
    },
    axisLabels: {
        age: {
            de: 'Alter (Jahre)',
            en: 'Age (Years)'
        },
        patientCount: {
            de: 'Anzahl Patienten',
            en: 'Number of Patients'
        },
        lymphNodeCount: {
            de: 'Anzahl Lymphknoten',
            en: 'Number of Lymph Nodes'
        },
        metricValue: {
            de: 'Wert',
            en: 'Value'
        },
        metric: {
            de: 'Diagnostische Metrik',
            en: 'Diagnostic Metric'
        },
        sensitivity: {
            de: 'Sensitivität (Richtig-Positiv-Rate)',
            en: 'Sensitivity (True Positive Rate)'
        },
        oneMinusSpecificity: {
            de: '1 - Spezifität (Falsch-Positiv-Rate)',
            en: '1 - Specificity (False Positive Rate)'
        },
        probability: {
            de: 'Wahrscheinlichkeit',
            en: 'Probability'
        },
        shortAxisDiameter: {
            de: 'Kurzachsendurchmesser (mm)',
            en: 'Short-Axis Diameter (mm)'
        }
    },
    legendLabels: {
        male: { de: 'Männlich', en: 'Male' },
        female: { de: 'Weiblich', en: 'Female' },
        unknownGender: { de: 'Unbekannt', en: 'Unknown' },
        direktOP: { de: 'Direkt OP', en: 'Upfront Surgery' },
        nRCT: { de: 'nRCT', en: 'nCRT' },
        nPositive: { de: 'N+', en: 'N+' },
        nNegative: { de: 'N-', en: 'N-' },
        asPositive: { de: 'AS+', en: 'AS+' },
        asNegative: { de: 'AS-', en: 'AS-' },
        t2Positive: { de: 'T2+', en: 'T2+' },
        t2Negative: { de: 'T2-', en: 'T2-' },
        avocadoSign: { de: 'Avocado Sign (AS)', en: 'Avocado Sign (AS)' },
        currentT2: { de: '{T2ShortName}', en: '{T2ShortName}' },
        benignLN: { de: 'Benigne LK', en: 'Benign LN' },
        malignantLN: { de: 'Maligne LK', en: 'Malignant LN' }
    },
    criteriaComparison: {
        title: {
            de: "Vergleich diagnostischer Güte verschiedener Methoden",
            en: "Comparison of Diagnostic Performance of Different Methods"
        },
        tableHeaderSet: {
            de: "Methode / Kriteriensatz",
            en: "Method / Criteria Set"
        },
        tableHeaderSens: { de: "Sens.", en: "Sens." },
        tableHeaderSpez: { de: "Spez.", en: "Spec." },
        tableHeaderPPV: { de: "PPV", en: "PPV" },
        tableHeaderNPV: { de: "NPV", en: "NPV" },
        tableHeaderAcc: { de: "Acc.", en: "Acc." },
        tableHeaderAUC: { de: "AUC/BalAcc", en: "AUC/BalAcc" }
    },
    statMetrics: {
        signifikanzTexte: {
            SIGNIFIKANT: { de: "statistisch signifikant", en: "statistically significant" },
            NICHT_SIGNIFIKANT: { de: "statistisch nicht signifikant", en: "not statistically significant" }
        },
        orFaktorTexte: {
            ERHOEHT: { de: "erhöht", en: "increased" },
            VERRINGERT: { de: "verringert", en: "decreased" },
            UNVERAENDERT: { de: "unverändert", en: "unchanged" }
        },
        rdRichtungTexte: {
            HOEHER: { de: "höher", en: "higher" },
            NIEDRIGER: { de: "niedriger", en: "lower" },
            GLEICH: { de: "gleich", en: "equal" }
        },
        assoziationStaerkeTexte: {
            stark: { de: "stark", en: "strong" },
            moderat: { de: "moderat", en: "moderate" },
            schwach: { de: "schwach", en: "weak" },
            sehr_schwach: { de: "sehr schwach", en: "very weak" },
            nicht_bestimmbar: { de: "nicht bestimmbar", en: "not determinable" }
        },
        // Detaillierte Tooltips für statistische Metriken werden jetzt unter TOOLTIP_CONTENT.statMetrics definiert
    },
    kurzanleitung: {
        title: {
            de: "Kurzanleitung & Wichtige Hinweise",
            en: "Quick Guide & Important Notes"
        },
        content: { // Dynamic content injection happens in ui_helpers
            de: `
                <p>Willkommen zum <strong>Lymphknoten T2 - Avocado Sign Analyse Tool v[APP_VERSION]</strong>.</p>
                <p>Diese Anwendung dient der explorativen Analyse und dem wissenschaftlichen Vergleich der diagnostischen Leistung des "Avocado Signs" gegenüber T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status) bei Patienten mit Rektumkarzinom. Sie basiert auf einem Patientenkollektiv von 106 Fällen.</p>
                <h6>Allgemeine Bedienung:</h6>
                <ul>
                    <li><strong>Kollektiv-Auswahl (Header):</strong> Wählen Sie hier das globale Patientenkollektiv (<strong>Gesamt</strong>, <strong>Direkt OP</strong>, <strong>nRCT</strong>). Diese Auswahl beeinflusst alle Analysen und Darstellungen in der gesamten Anwendung. Die Header-Meta-Statistiken (Anzahl Patienten, N+, AS+, T2+) aktualisieren sich entsprechend.</li>
                    <li><strong>Tab-Navigation:</strong> Wechseln Sie über die Reiter zwischen den Hauptfunktionsbereichen der Anwendung.</li>
                    <li><strong>Tooltips:</strong> Viele Bedienelemente und Ausgaben sind mit detaillierten Tooltips versehen, die bei Mausüberfahrung Erklärungen, Definitionen oder Interpretationshilfen bieten.</li>
                    <li><strong>Statistische Signifikanz:</strong> In statistischen Tabellen werden p-Werte mit Symbolen für Signifikanzniveaus versehen: * p &lt; 0.05, ** p &lt; 0.01, *** p &lt; 0.001. Das zugrundeliegende Signifikanzniveau ist &alpha; = [SIGNIFICANCE_LEVEL].</li>
                </ul>
                <h6>Wichtige Tabs und deren Funktionen:</h6>
                <ul>
                    <li><strong>Daten:</strong> Zeigt die detaillierten Patientendaten des aktuell ausgewählten Kollektivs. Sortierbar, mit aufklappbaren T2-LK-Details.</li>
                    <li><strong>Auswertung:</strong> Interaktive Definition von T2-Kriterien, Dashboard, Brute-Force-Optimierung und detaillierte Auswertungsergebnisse pro Patient. <strong>Wichtig:</strong> Änderungen an T2-Kriterien müssen über "Anwenden & Speichern" bestätigt werden.</li>
                    <li><strong>Statistik:</strong> Umfassende statistische Auswertungen (deskriptiv, Güte AS & T2, Vergleiche, Assoziationen). Layout umschaltbar (Einzel-/Vergleichsansicht). Enthält Kriterienvergleichstabelle.</li>
                    <li><strong>Präsentation:</strong> Aufbereitung der Ergebnisse für Präsentationen. Fokus auf AS-Performance oder AS vs. T2 Vergleich (mit Auswahl der T2-Basis).</li>
                    <li><strong>Publikation:</strong> Generiert Textvorschläge, Tabellen und Abbildungen für wissenschaftliche Manuskripte, ausgerichtet auf die Anforderungen des Journals "Radiology".</li>
                    <li><strong>Export:</strong> Download von Rohdaten, Analyseergebnissen, Tabellen und Diagrammen in verschiedenen Formaten.</li>
                </ul>
                 <h6>Referenzstandard und Wichtiger Hinweis:</h6>
                <p class="small">Der histopathologische N-Status aus dem Operationspräparat dient in allen Analysen als Referenzstandard. Diese Anwendung ist ein Forschungswerkzeug und ausdrücklich <strong>nicht</strong> für die klinische Diagnostik oder Therapieentscheidungen im Einzelfall vorgesehen. Alle Ergebnisse sind im Kontext der Studienlimitationen (retrospektiv, monozentrisch, spezifisches Kollektiv) zu interpretieren.</p>
            `,
            en: `
                <p>Welcome to the <strong>Lymph Node T2 - Avocado Sign Analysis Tool v[APP_VERSION]</strong>.</p>
                <p>This application is designed for exploratory analysis and scientific comparison of the diagnostic performance of the "Avocado Sign" versus T2-weighted morphological criteria for predicting mesorectal lymph node status (N-status) in patients with rectal cancer. It is based on a patient cohort of 106 cases.</p>
                <h6>General Operation:</h6>
                <ul>
                    <li><strong>Cohort Selection (Header):</strong> Select the global patient cohort here (<strong>Overall</strong>, <strong>Upfront Surgery</strong>, <strong>nCRT</strong>). This selection affects all analyses and displays throughout the application. Header meta-statistics (Number of Patients, N+, AS+, T2+) update accordingly.</li>
                    <li><strong>Tab Navigation:</strong> Switch between the main functional areas of the application using the tabs.</li>
                    <li><strong>Tooltips:</strong> Many UI elements and outputs are equipped with detailed tooltips that provide explanations, definitions, or interpretation aids on mouseover.</li>
                    <li><strong>Statistical Significance:</strong> In statistical tables, p-values are marked with symbols for significance levels: * p &lt; 0.05, ** p &lt; 0.01, *** p &lt; 0.001. The underlying significance level is &alpha; = [SIGNIFICANCE_LEVEL].</li>
                </ul>
                <h6>Key Tabs and Their Functions:</h6>
                <ul>
                    <li><strong>Data:</strong> Displays detailed patient data of the currently selected cohort. Sortable, with expandable T2-LN details.</li>
                    <li><strong>Evaluation:</strong> Interactive definition of T2 criteria, dashboard, brute-force optimization, and detailed evaluation results per patient. <strong>Important:</strong> Changes to T2 criteria must be confirmed via "Apply & Save".</li>
                    <li><strong>Statistics:</strong> Comprehensive statistical analyses (descriptive, performance of AS & T2, comparisons, associations). Layout switchable (single/comparison view). Includes criteria comparison table.</li>
                    <li><strong>Presentation:</strong> Prepares results in a presentation-friendly format. Focus on AS performance or AS vs. T2 comparison (with selection of T2 basis).</li>
                    <li><strong>Publication:</strong> Generates text suggestions, tables, and figures for scientific manuscripts, aligned with the requirements of the journal "Radiology".</li>
                    <li><strong>Export:</strong> Download raw data, analysis results, tables, and diagrams in various formats.</li>
                </ul>
                <h6>Reference Standard and Important Note:</h6>
                <p class="small">The histopathological N-status from the surgical specimen serves as the reference standard in all analyses. This application is a research tool and is explicitly <strong>not</strong> intended for clinical diagnostics or individual patient treatment decisions. All results must be interpreted in the context of study limitations (retrospective, single-center, specific cohort).</p>
            `
        }
    }
};

// TOOLTIP_CONTENT is now a top-level constant.
const TOOLTIP_CONTENT = {
    kurzanleitungButton: {
        de: { description: "Zeigt eine Kurzanleitung und wichtige Hinweise zur Bedienung der Anwendung." },
        en: { description: "Shows a quick guide and important notes on how to use the application." }
    },
    kollektivButtons: {
        de: { description: "Wählen Sie das Patientenkollektiv für die Analyse aus: <strong>Gesamt</strong> (alle Patienten), <strong>Direkt OP</strong> (nur primär Operierte ohne Vorbehandlung) oder <strong>nRCT</strong> (nur neoadjuvant Radiochemotherapeutisch Vorbehandelte). Die Auswahl filtert die Datenbasis für alle Tabs." },
        en: { description: "Select the patient cohort for analysis: <strong>Overall</strong> (all patients), <strong>Upfront Surgery</strong> (only primary operated without prior treatment), or <strong>nCRT</strong> (only neoadjuvant chemoradiotherapy treated). This selection filters the data for all tabs." }
    },
    headerStats: {
        kollektiv: { de: { description: "Aktuell betrachtetes Patientenkollektiv." }, en: { description: "Currently selected patient cohort." } },
        anzahlPatienten: { de: { description: "Gesamtzahl der Patienten im ausgewählten Kollektiv." }, en: { description: "Total number of patients in the selected cohort." } },
        statusN: { de: { description: "Anteil der Patienten mit positivem (+) vs. negativem (-) histopathologischem Lymphknotenstatus (N-Status, Pathologie-Referenzstandard) im ausgewählten Kollektiv." }, en: { description: "Proportion of patients with positive (+) vs. negative (-) histopathological lymph node status (N-status, pathology reference standard) in the selected cohort." } },
        statusAS: { de: { description: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß Avocado Sign (AS) Vorhersage (basierend auf T1KM-MRT) im ausgewählten Kollektiv." }, en: { description: "Proportion of patients with positive (+) vs. negative (-) lymph node status according to Avocado Sign (AS) prediction (based on T1CE-MRI) in the selected cohort." } },
        statusT2: { de: { description: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß den aktuell <strong>angewendeten und gespeicherten</strong> T2-Kriterien (siehe Auswertungstab) für das ausgewählte Kollektiv." }, en: { description: "Proportion of patients with positive (+) vs. negative (-) lymph node status according to the currently <strong>applied and saved</strong> T2 criteria (see Evaluation tab) for the selected cohort." } }
    },
    mainTabs: {
        daten: { de: { description: "Patientendaten anzeigen." }, en: { description: "Display patient data." } },
        auswertung: { de: { description: "T2-Kriterien definieren und Ergebnisse auswerten." }, en: { description: "Define T2 criteria and evaluate results." } },
        statistik: { de: { description: "Detaillierte statistische Analysen durchführen." }, en: { description: "Perform detailed statistical analyses." } },
        praesentation: { de: { description: "Ergebnisse präsentationsfreundlich darstellen." }, en: { description: "Display results in a presentation-friendly format." } },
        publikation: { de: { description: "Textvorschläge und Materialien für Publikationen generieren." }, en: { description: "Generate text suggestions and materials for publications." } },
        export: { de: { description: "Daten und Analyseergebnisse exportieren." }, en: { description: "Export data and analysis results." } }
    },
    datenTable: { // Assuming these are keys used in getTooltipHTML, structure them for dynamic content if needed.
        nr: { de: { description: "Fortlaufende Nummer des Patienten." }, en: { description: "Patient's serial number." } },
        name: { de: { description: "Nachname des Patienten (anonymisiert/kodiert)." }, en: { description: "Patient's last name (anonymized/coded)." } },
        vorname: { de: { description: "Vorname des Patienten (anonymisiert/kodiert)." }, en: { description: "Patient's first name (anonymized/coded)." } },
        geschlecht: { de: { description: "Geschlecht des Patienten (m: männlich, f: weiblich, unbekannt)." }, en: { description: "Patient's sex (m: male, f: female, unknown)." } },
        alter: { de: { description: "Alter des Patienten zum Zeitpunkt der MRT-Untersuchung in Jahren." }, en: { description: "Patient's age at the time of MRI examination in years." } },
        therapie: { de: { description: "Angewandte Therapie vor der Operation (nRCT: neoadjuvante Radiochemotherapie, direkt OP: keine Vorbehandlung). Beeinflusst die Kollektivauswahl." }, en: { description: "Therapy applied before surgery (nCRT: neoadjuvant chemoradiotherapy, upfront surgery: no prior treatment). Affects cohort selection." } },
        n_as_t2: { de: { description: "Direkter Statusvergleich: N (Pathologie-Referenz), AS (Avocado Sign), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung." }, en: { description: "Direct status comparison: N (Pathology reference), AS (Avocado Sign), T2 (current criteria). Click on N, AS, or T2 in the column header for sub-sorting." } },
        bemerkung: { de: { description: "Zusätzliche klinische oder radiologische Bemerkungen zum Patientenfall, falls vorhanden." }, en: { description: "Additional clinical or radiological remarks on the patient case, if available." } },
        expandAll: { de: { description: "Öffnet oder schließt die Detailansicht zu den T2-gewichteten Lymphknotenmerkmalen für alle Patienten in der aktuellen Tabellenansicht. Zeigt Größe, Form, Kontur, Homogenität und Signal für jeden LK." }, en: { description: "Expands or collapses the detail view of T2-weighted lymph node characteristics for all patients in the current table view. Shows size, shape, border, homogeneity, and signal for each LN." } },
        expandRow: { de: { description: "Klicken Sie hier oder auf den Pfeil-Button, um Details zu den morphologischen Eigenschaften der T2-gewichteten Lymphknoten dieses Patienten anzuzeigen/auszublenden. Nur verfügbar, wenn T2-LK-Daten vorhanden sind." }, en: { description: "Click here or the arrow button to show/hide details of the morphological characteristics of this patient's T2-weighted lymph nodes. Only available if T2-LN data exists." } }
    },
    auswertungTable: {
        nr: { de: { description: "Fortlaufende Nummer des Patienten." }, en: { description: "Patient's serial number." } },
        name: { de: { description: "Nachname des Patienten (anonymisiert/kodiert)." }, en: { description: "Patient's last name (anonymized/coded)." } },
        therapie: { de: { description: "Angewandte Therapie vor der Operation." }, en: { description: "Therapy applied before surgery." } },
        n_as_t2: { de: { description: "Direkter Statusvergleich: N (Pathologie-Referenz), AS (Avocado Sign), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung." }, en: { description: "Direct status comparison: N (Pathology reference), AS (Avocado Sign), T2 (current criteria). Click on N, AS, or T2 in the column header for sub-sorting." } },
        n_counts: { de: { description: "Anzahl pathologisch positiver (N+) Lymphknoten / Gesamtzahl histopathologisch untersuchter Lymphknoten für diesen Patienten." }, en: { description: "Number of pathologically positive (N+) lymph nodes / Total number of histopathologically examined lymph nodes for this patient." } },
        as_counts: { de: { description: "Anzahl als positiv bewerteter Avocado Sign (AS+) Lymphknoten / Gesamtzahl im T1KM-MRT sichtbarer Lymphknoten für diesen Patienten." }, en: { description: "Number of Avocado Sign positive (AS+) lymph nodes / Total number of lymph nodes visible on T1CE-MRI for this patient." } },
        t2_counts: { de: { description: "Anzahl als positiv bewerteter T2-Lymphknoten (gemäß aktuell angewendeter Kriterien) / Gesamtzahl im T2-MRT sichtbarer Lymphknoten für diesen Patienten." }, en: { description: "Number of T2-positive lymph nodes (according to currently applied criteria) / Total number of lymph nodes visible on T2-MRI for this patient." } },
        expandAll: { de: { description: "Öffnet oder schließt die Detailansicht der bewerteten T2-gewichteten Lymphknoten und der erfüllten Kriterien für alle Patienten in der aktuellen Tabellenansicht." }, en: { description: "Expands or collapses the detail view of the evaluated T2-weighted lymph nodes and fulfilled criteria for all patients in the current table view." } },
        expandRow: { de: { description: "Klicken Sie hier oder auf den Pfeil-Button, um die detaillierte Bewertung der einzelnen T2-gewichteten Lymphknoten dieses Patienten gemäß der aktuell angewendeten Kriterien anzuzeigen/auszublenden. Erfüllte Positiv-Kriterien werden hervorgehoben." }, en: { description: "Click here or the arrow button to show/hide the detailed evaluation of this patient's individual T2-weighted lymph nodes according to the currently applied criteria. Fulfilled positive criteria are highlighted." } }
    },
    t2Logic: {
        de: { description: `Logische Verknüpfung der aktiven T2-Kriterien: <strong>UND</strong> (Ein Lymphknoten ist nur positiv, wenn ALLE aktivierten Kriterien erfüllt sind). <strong>ODER</strong> (Ein Lymphknoten ist positiv, wenn MINDESTENS EIN aktiviertes Kriterium erfüllt ist). Die Wahl beeinflusst die Berechnung des T2-Status.` },
        en: { description: `Logical operator for active T2 criteria: <strong>AND</strong> (A lymph node is positive only if ALL activated criteria are met). <strong>OR</strong> (A lymph node is positive if AT LEAST ONE activated criterion is met). The choice affects the T2 status calculation.` }
    },
    t2Size: {
        de: { description: `Größenkriterium (Kurzachse): Lymphknoten mit einem Durchmesser <strong>größer oder gleich (≥)</strong> dem eingestellten Schwellenwert gelten als suspekt. Einstellbarer Bereich: [SIZE_MIN] - [SIZE_MAX] mm (Schritt: [SIZE_STEP] mm). Aktivieren/Deaktivieren mit Checkbox.` },
        en: { description: `Size criterion (short axis): Lymph nodes with a diameter <strong>greater than or equal to (≥)</strong> the set threshold are considered suspicious. Adjustable range: [SIZE_MIN] - [SIZE_MAX] mm (step: [SIZE_STEP] mm). Activate/deactivate with checkbox.` }
    },
    t2Form: {
        de: { description: "Formkriterium: Wählen Sie, welche Form ('rund' oder 'oval') als suspekt gilt. Aktivieren/Deaktivieren mit Checkbox." },
        en: { description: "Shape criterion: Select which shape ('round' or 'oval') is considered suspicious. Activate/deactivate with checkbox." }
    },
    t2Kontur: {
        de: { description: "Konturkriterium: Wählen Sie, welche Kontur ('scharf' berandet oder 'irregulär') als suspekt gilt. Aktivieren/Deaktivieren mit Checkbox." },
        en: { description: "Border criterion: Select which border ('smooth' or 'irregular') is considered suspicious. Activate/deactivate with checkbox." }
    },
    t2Homogenitaet: {
        de: { description: "Homogenitätskriterium: Wählen Sie, ob ein 'homogenes' oder 'heterogenes' Binnensignal auf T2w als suspekt gilt. Aktivieren/Deaktivieren mit Checkbox." },
        en: { description: "Homogeneity criterion: Select whether 'homogeneous' or 'heterogeneous' internal signal on T2w is considered suspicious. Activate/deactivate with checkbox." }
    },
    t2Signal: {
        de: { description: "Signalkriterium: Wählen Sie, welche T2-Signalintensität ('signalarm', 'intermediär' oder 'signalreich') relativ zur umgebenden Muskulatur als suspekt gilt. Lymphknoten mit nicht beurteilbarem Signal (Wert 'null') erfüllen dieses Kriterium nie. Aktivieren/Deaktivieren mit Checkbox." },
        en: { description: "Signal criterion: Select which T2 signal intensity ('low signal', 'intermediate signal', or 'high signal') relative to surrounding muscle is considered suspicious. Lymph nodes with non-assessable signal (value 'null') never meet this criterion. Activate/deactivate with checkbox." }
    },
    t2Actions: {
        reset: {
            de: { description: "Setzt die Logik und alle Kriterien auf die definierten Standardeinstellungen zurück. Die Änderungen sind danach noch nicht angewendet." },
            en: { description: "Resets the logic and all criteria to the defined default settings. Changes are not yet applied." }
        },
        apply: {
            de: { description: "Wendet die aktuell eingestellten T2-Kriterien und die Logik auf den gesamten Datensatz an. Dies aktualisiert die T2-Spalten in den Tabellen, alle statistischen Auswertungen und Diagramme. Die Einstellung wird zudem für zukünftige Sitzungen gespeichert." },
            en: { description: "Applies the currently set T2 criteria and logic to the entire dataset. This updates the T2 columns in tables, all statistical evaluations, and diagrams. The setting is also saved for future sessions." }
        }
    },
    t2CriteriaCard: {
        unsavedIndicator: {
            de: { description: "<strong>Achtung:</strong> Es gibt nicht angewendete Änderungen an den T2-Kriterien oder der Logik. Klicken Sie auf 'Anwenden & Speichern', um die Ergebnisse zu aktualisieren und die Einstellung zu speichern." },
            en: { description: "<strong>Attention:</strong> There are unapplied changes to the T2 criteria or logic. Click 'Apply & Save' to update the results and save the settings." }
        }
    },
    t2MetricsOverview: {
        cardTitle: { de: { description: "Kurzübersicht der diagnostischen Güte für die aktuell angewendeten und gespeicherten T2-Kriterien im Vergleich zum histopathologischen N-Status für das gewählte Kollektiv: <strong>[KOLLEKTIV]</strong>. Alle Konfidenzintervalle (CI) sind 95%-CIs." }, en: { description: "Summary of diagnostic performance for the currently applied and saved T2 criteria versus histopathological N-status for the selected cohort: <strong>[KOLLEKTIV]</strong>. All confidence intervals (CI) are 95% CIs." } },
        sens: { de: { name: "Sensitivität", description: "Sensitivität (T2 vs. N)", formula: "RP / (RP + FN)" }, en: { name: "Sensitivity", description: "Sensitivity (T2 vs. N)", formula: "TP / (TP + FN)" } },
        spez: { de: { name: "Spezifität", description: "Spezifität (T2 vs. N)", formula: "RN / (RN + FP)" }, en: { name: "Specificity", description: "Specificity (T2 vs. N)", formula: "TN / (TN + FP)" } },
        ppv: { de: { name: "PPV", description: "Positiver Prädiktiver Wert (PPV, T2 vs. N)", formula: "RP / (RP + FP)" }, en: { name: "PPV", description: "Positive Predictive Value (PPV, T2 vs. N)", formula: "TP / (TP + FP)" } },
        npv: { de: { name: "NPV", description: "Negativer Prädiktiver Wert (NPV, T2 vs. N)", formula: "RN / (RN + FN)" }, en: { name: "NPV", description: "Negative Predictive Value (NPV, T2 vs. N)", formula: "TN / (TN + FN)" } },
        acc: { de: { name: "Accuracy", description: "Accuracy (T2 vs. N)", formula: "(RP + RN) / (RP + RN + FP + FN)" }, en: { name: "Accuracy", description: "Accuracy (T2 vs. N)", formula: "(TP + TN) / (TP + TN + FP + FN)" } },
        balAcc: { de: { name: "Balanced Acc.", description: "Balanced Accuracy (T2 vs. N)", formula: "(Sensitivität + Spezifität) / 2" }, en: { name: "Balanced Acc.", description: "Balanced Accuracy (T2 vs. N)", formula: "(Sensitivity + Specificity) / 2" } },
        f1: { de: { name: "F1-Score", description: "F1-Score (T2 vs. N)", formula: "2 * (PPV * Sensitivität) / (PPV + Sensitivität)" }, en: { name: "F1-Score", description: "F1-Score (T2 vs. N)", formula: "2 * (PPV * Sensitivity) / (PPV + Sensitivity)" } },
        auc: { de: { name: "AUC", description: "Fläche unter der ROC-Kurve (T2 vs. N)" }, en: { name: "AUC", description: "Area Under the ROC Curve (T2 vs. N)" } }
    },
     bruteForceMetric: {
        de: { description: "Wählen Sie die Zielmetrik für die Brute-Force-Optimierung.<br><strong>Accuracy:</strong> Anteil korrekt klassifizierter Fälle.<br><strong>Balanced Accuracy:</strong> (Sens+Spez)/2; gut bei ungleichen Klassengrößen.<br><strong>F1-Score:</strong> Harmonisches Mittel aus PPV & Sensitivität.<br><strong>PPV:</strong> Präzision bei positiver Vorhersage.<br><strong>NPV:</strong> Präzision bei negativer Vorhersage." },
        en: { description: "Select the target metric for brute-force optimization.<br><strong>Accuracy:</strong> Proportion of correctly classified cases.<br><strong>Balanced Accuracy:</strong> (Sens+Spec)/2; good for imbalanced classes.<br><strong>F1-Score:</strong> Harmonic mean of PPV & Sensitivity.<br><strong>PPV:</strong> Precision in positive prediction.<br><strong>NPV:</strong> Precision in negative prediction." }
    },
    bruteForceStart: {
        de: { description: "Startet die Brute-Force-Suche nach der T2-Kriterienkombination, die die gewählte Zielmetrik im aktuellen Kollektiv maximiert. Dies kann einige Zeit in Anspruch nehmen und läuft im Hintergrund." },
        en: { description: "Starts the brute-force search for the T2 criteria combination that maximizes the selected target metric in the current cohort. This may take some time and runs in the background." }
    },
    bruteForceInfo: {
        de: { description: "Zeigt den Status des Brute-Force Optimierungs-Workers und das aktuell analysierte Patientenkollektiv: <strong>[KOLLEKTIV_NAME]</strong>." },
        en: { description: "Shows the status of the Brute-Force optimization worker and the currently analyzed patient cohort: <strong>[KOLLEKTIV_NAME]</strong>." }
    },
    bruteForceProgress: {
        de: { description: "Fortschritt der Optimierung: Getestete Kombinationen / Gesamtanzahl ([TOTAL]). Angezeigt werden die aktuelle beste Metrik und die zugehörigen Kriterien." },
        en: { description: "Optimization progress: Tested combinations / Total count ([TOTAL]). Displays the current best metric and associated criteria." }
    },
    bruteForceResult: {
        de: { description: "Bestes Ergebnis der abgeschlossenen Brute-Force-Optimierung für das gewählte Kollektiv ([N_GESAMT] Patienten, davon [N_PLUS] N+ und [N_MINUS] N-) und die Zielmetrik." },
        en: { description: "Best result of the completed brute-force optimization for the selected cohort ([N_GESAMT] patients, thereof [N_PLUS] N+ and [N_MINUS] N-) and the target metric." },
        kollektivStats: {
            de: { description: "Statistik des für diese Optimierung verwendeten Kollektivs: N (Gesamtanzahl), N+ (Anzahl N-positiv), N- (Anzahl N-negativ)." },
            en: { description: "Statistics of the cohort used for this optimization: N (total count), N+ (number N-positive), N- (number N-negative)." }
        }
    },
    bruteForceDetailsButton: {
        de: { description: "Öffnet ein Fenster mit den Top 10 Ergebnissen und weiteren Details zur abgeschlossenen Optimierung." },
        en: { description: "Opens a window with the top 10 results and further details on the completed optimization." }
    },
    bruteForceModal: {
        exportButton: {
            de: { description: "Exportiert den detaillierten Bericht der Brute-Force-Optimierung (Top 10 Ergebnisse, Kollektiv-Statistik, Konfiguration) als formatierte Textdatei (.txt)." },
            en: { description: "Exports the detailed report of the brute-force optimization (Top 10 results, cohort statistics, configuration) as a formatted text file (.txt)." }
        }
    },
    statistikLayout: {
        de: { description: "Wählen Sie die Anzeigeart: <strong>Einzelansicht</strong> für das global gewählte Kollektiv oder <strong>Vergleich Aktiv</strong> zur Auswahl und Gegenüberstellung zweier spezifischer Kollektive." },
        en: { description: "Select display mode: <strong>Single View</strong> for the globally selected cohort or <strong>Comparison Active</strong> to select and compare two specific cohorts." }
    },
    statistikKollektiv1: {
        de: { description: "Wählen Sie das erste Kollektiv für die statistische Auswertung oder den Vergleich (nur aktiv bei Layout 'Vergleich Aktiv')." },
        en: { description: "Select the first cohort for statistical evaluation or comparison (only active in 'Comparison Active' layout)." }
    },
    statistikKollektiv2: {
        de: { description: "Wählen Sie das zweite Kollektiv für den Vergleich (nur aktiv bei Layout 'Vergleich Aktiv')." },
        en: { description: "Select the second cohort for comparison (only active in 'Comparison Active' layout)." }
    },
    statistikToggleVergleich: {
        de: { description: "Schaltet zwischen der detaillierten Einzelansicht für das global gewählte Kollektiv und der Vergleichsansicht zweier spezifisch wählbarer Kollektive um." },
        en: { description: "Switches between the detailed single view for the globally selected cohort and the comparison view of two specifically selectable cohorts." }
    },
    deskriptiveStatistik: {
        cardTitle: { de: { description: "Demographie, klinische Daten und Lymphknoten-Basiszahlen des Kollektivs <strong>[KOLLEKTIV]</strong>." }, en: { description: "Demographics, clinical data, and baseline lymph node counts of cohort <strong>[KOLLEKTIV]</strong>." } },
        alterMedian: { de: { name: "Alter", description: "Median des Alters (Jahre) mit Bereich (Min-Max) und [Mittelwert ± Standardabweichung].", unit: "Jahre" }, en: { name: "Age", description: "Median age (years) with range (Min-Max) and [Mean ± Standard Deviation].", unit: "Years" } },
        geschlecht: { de: { name: "Geschlecht", description: "Absolute und prozentuale Geschlechterverteilung." }, en: { name: "Sex", description: "Absolute and percentage gender distribution." } },
        nStatus: { de: { name: "N-Status (Patho)", description: "Verteilung des pathologischen N-Status (+/-)." }, en: { name: "N-Status (Patho)", description: "Distribution of pathological N-status (+/-)." } },
        asStatus: { de: { name: "AS-Status", description: "Verteilung des Avocado Sign Status (+/-)." }, en: { name: "AS-Status", description: "Distribution of Avocado Sign status (+/-)." } },
        t2Status: { de: { name: "T2-Status (angewandt)", description: "Verteilung des T2-Status (+/-) basierend auf den aktuell angewendeten Kriterien." }, en: { name: "T2-Status (applied)", description: "Distribution of T2-status (+/-) based on currently applied criteria." } },
        lkAnzahlPatho: { de: { name: "LK N gesamt", description: "Anzahl histopathologisch untersuchter Lymphknoten pro Patient." }, en: { name: "Total Patho LN", description: "Number of histopathologically examined lymph nodes per patient." } },
        lkAnzahlPathoPlus: { de: { name: "LK N+", description: "Anzahl pathologisch positiver (N+) Lymphknoten bei N+ Patienten." }, en: { name: "Patho N+ LN", description: "Number of pathologically positive (N+) lymph nodes in N+ patients." } },
        lkAnzahlAS: { de: { name: "LK AS gesamt", description: "Gesamtzahl im T1KM-MRT sichtbarer Lymphknoten." }, en: { name: "Total AS LN", description: "Total number of lymph nodes visible on T1CE-MRI." } },
        lkAnzahlASPlus: { de: { name: "LK AS+", description: "Anzahl Avocado Sign positiver (AS+) Lymphknoten bei AS+ Patienten." }, en: { name: "AS+ LN", description: "Number of Avocado Sign positive (AS+) lymph nodes in AS+ patients." } },
        lkAnzahlT2: { de: { name: "LK T2 gesamt", description: "Gesamtzahl im T2-MRT sichtbarer Lymphknoten." }, en: { name: "Total T2 LN", description: "Total number of lymph nodes visible on T2-MRI." } },
        lkAnzahlT2Plus: { de: { name: "LK T2+", description: "Anzahl T2-positiver Lymphknoten (gemäß aktueller Kriterien) bei T2+ Patienten." }, en: { name: "T2+ LN", description: "Number of T2-positive lymph nodes (according to current criteria) in T2+ patients." } },
        chartAge: { de: { description: "Histogramm der Altersverteilung im Kollektiv <strong>[KOLLEKTIV]</strong>." }, en: { description: "Histogram of age distribution in cohort <strong>[KOLLEKTIV]</strong>." } },
        chartGender: { de: { description: "Tortendiagramm der Geschlechterverteilung im Kollektiv <strong>[KOLLEKTIV]</strong>." }, en: { description: "Pie chart of gender distribution in cohort <strong>[KOLLEKTIV]</strong>." } }
    },
    diagnostischeGueteAS: { de: { cardTitle: "Diagnostische Güte des Avocado Signs (AS) vs. Histopathologie (N) für Kollektiv <strong>[KOLLEKTIV]</strong>. Alle Konfidenzintervalle (CI) sind 95%-CIs." }, en: { cardTitle: "Diagnostic performance of Avocado Sign (AS) vs. Histopathology (N) for cohort <strong>[KOLLEKTIV]</strong>. All confidence intervals (CI) are 95% CIs." } },
    diagnostischeGueteT2: { de: { cardTitle: "Diagnostische Güte der aktuell angewendeten T2-Kriterien vs. Histopathologie (N) für Kollektiv <strong>[KOLLEKTIV]</strong>. Alle CIs sind 95%-CIs." }, en: { cardTitle: "Diagnostic performance of currently applied T2 criteria vs. Histopathology (N) for cohort <strong>[KOLLEKTIV]</strong>. All CIs are 95% CIs." } },
    statistischerVergleichASvsT2: { de: { cardTitle: "Statistischer Vergleich der diagnostischen Leistung von AS vs. aktuell angewandten T2-Kriterien (gepaarte Tests) im Kollektiv <strong>[KOLLEKTIV]</strong>." }, en: { cardTitle: "Statistical comparison of diagnostic performance of AS vs. currently applied T2 criteria (paired tests) in cohort <strong>[KOLLEKTIV]</strong>." } },
    assoziationEinzelkriterien: { de: { cardTitle: "Assoziation zwischen AS-Status bzw. einzelnen T2-Merkmalen und dem N-Status (+/-) im Kollektiv <strong>[KOLLEKTIV]</strong>. OR: Odds Ratio, RD: Risk Difference, φ: Phi-Koeffizient. Alle CIs sind 95%-CIs." }, en: { cardTitle: "Association between AS status or individual T2 features and N-status (+/-) in cohort <strong>[KOLLEKTIV]</strong>. OR: Odds Ratio, RD: Risk Difference, φ: Phi coefficient. All CIs are 95% CIs." } },
    vergleichKollektive: { de: { cardTitle: "Statistischer Vergleich der Accuracy und AUC (für AS und T2) zwischen <strong>[KOLLEKTIV1]</strong> und <strong>[KOLLEKTIV2]</strong> (ungepaarte Tests)." }, en: { cardTitle: "Statistical comparison of Accuracy and AUC (for AS and T2) between <strong>[KOLLEKTIV1]</strong> and <strong>[KOLLEKTIV2]</strong> (unpaired tests)." } },
    criteriaComparisonTable: {
        cardTitle: { de: { description: "Tabellarischer Leistungsvergleich: Avocado Sign, angewandte T2-Kriterien und Literatur-Sets für das global gewählte Kollektiv <strong>[GLOBAL_KOLLEKTIV_NAME]</strong>. Literatur-Sets werden auf ihrem spezifischen Zielkollektiv evaluiert, falls abweichend (in Klammern angegeben). Alle Werte ohne CIs." }, en: { description: "Tabular performance comparison: Avocado Sign, applied T2 criteria, and literature sets for the globally selected cohort <strong>[GLOBAL_KOLLEKTIV_NAME]</strong>. Literature sets are evaluated on their specific target cohort if different (indicated in parentheses). All values without CIs." } },
        tableHeaderSet: { de: { description: "Methode / Kriteriensatz (Eval. auf Kollektiv N)" }, en: { description: "Method / Criteria Set (Eval. on Cohort N)" } },
        tableHeaderSens: { de: { description: "Sensitivität" }, en: { description: "Sensitivity" } },
        tableHeaderSpez: { de: { description: "Spezifität" }, en: { description: "Specificity" } },
        tableHeaderPPV: { de: { description: "PPV" }, en: { description: "PPV" } },
        tableHeaderNPV: { de: { description: "NPV" }, en: { description: "NPV" } },
        tableHeaderAcc: { de: { description: "Accuracy" }, en: { description: "Accuracy" } },
        tableHeaderAUC: { de: { description: "AUC / Bal. Accuracy" }, en: { description: "AUC / Bal. Accuracy" } }
    },
    praesentation: {
        viewSelect: { de: { description: "Wählen Sie die Ansicht: <strong>Avocado Sign (Performance)</strong> für eine Übersicht der AS-Performance oder <strong>AS vs. T2 (Vergleich)</strong> für einen direkten Vergleich von AS mit einer auswählbaren T2-Kriterienbasis." }, en: { description: "Select view: <strong>Avocado Sign (Performance)</strong> for an overview of AS performance or <strong>AS vs. T2 (Comparison)</strong> for a direct comparison of AS with a selectable T2 criteria basis." } },
        studySelect: { de: { description: "Wählen Sie eine T2-Kriterienbasis für den Vergleich mit dem Avocado Sign. Optionen: aktuell in der App eingestellte Kriterien oder vordefinierte Sets aus publizierten Studien. Die Auswahl aktualisiert die untenstehenden Vergleiche. Das globale Kollektiv passt sich ggf. an das Zielkollektiv der Studie an." }, en: { description: "Select a T2 criteria basis for comparison with the Avocado Sign. Options: currently set criteria in the app or predefined sets from published studies. The selection updates the comparisons below. The global cohort may adapt to the study's target cohort." } },
        t2BasisInfoCard: {
            title: { de: { description: "Informationen zur T2-Vergleichsbasis" }, en: { description: "Information on T2 Comparison Basis" } },
            description: { de: { description: "Zeigt Details zu den aktuell für den Vergleich mit AS ausgewählten T2-Kriterien. Die Performance-Werte beziehen sich auf das angegebene Vergleichskollektiv." }, en: { description: "Shows details of the T2 criteria currently selected for comparison with AS. Performance values refer to the specified comparison cohort." } },
            reference: { de: { description: "Studienreferenz oder Quelle der Kriterien." }, en: { description: "Study reference or source of criteria." } },
            patientCohort: { de: { description: "Ursprüngliche Studienkohorte oder aktuelles Vergleichskollektiv (mit Patientenzahl)." }, en: { description: "Original study cohort or current comparison cohort (with patient count)." } },
            investigationType: { de: { description: "Art der Untersuchung in der Originalstudie (z.B. Primärstaging, Restaging)." }, en: { description: "Type of investigation in the original study (e.g., primary staging, restaging)." } },
            focus: { de: { description: "Hauptfokus der Originalstudie bezüglich dieser Kriterien." }, en: { description: "Main focus of the original study regarding these criteria." } },
            keyCriteriaSummary: { de: { description: "Zusammenfassung der angewendeten T2-Kriterien und Logik." }, en: { description: "Summary of the applied T2 criteria and logic." } }
        },
        comparisonTableCard: { de: { description: "Numerische Gegenüberstellung der diagnostischen Gütekriterien für AS vs. die ausgewählte T2-Basis, bezogen auf das aktuelle (Vergleichs-)Kollektiv."}, en: { description: "Numerical comparison of diagnostic performance metrics for AS vs. the selected T2 basis, relative to the current (comparison) cohort."} },
        downloadPerformanceCSV: { de: { description: "Lädt die Tabelle der diagnostischen Güte (je nach Ansicht: AS oder AS vs. T2-Basis) als CSV-Datei (.csv) herunter." }, en: { description: "Downloads the diagnostic performance table (depending on view: AS or AS vs. T2 basis) as a CSV file (.csv)." } },
        downloadPerformanceMD: { de: { description: "Lädt die Tabelle der diagnostischen Güte (je nach Ansicht: AS oder AS vs. T2-Basis) als Markdown-Datei (.md) herunter." }, en: { description: "Downloads the diagnostic performance table (depending on view: AS or AS vs. T2 basis) as a Markdown file (.md)." } },
        downloadCompTestsMD: { de: { description: "Lädt die Tabelle der statistischen Vergleichstests (McNemar, DeLong für AS vs. T2-Basis) als Markdown-Datei (.md) herunter." }, en: { description: "Downloads the statistical comparison tests table (McNemar, DeLong for AS vs. T2 basis) as a Markdown file (.md)." } },
        downloadCompTableMD: { de: { description: "Lädt die Tabelle mit den verglichenen Metrikwerten (AS vs. T2-Basis) als Markdown-Datei (.md) herunter."}, en: { description: "Downloads the table with compared metric values (AS vs. T2 basis) as a Markdown file (.md)."} },
        downloadCompChartPNG: { de: { description: "Lädt das Vergleichs-Balkendiagramm (AS vs. T2-Basis) als PNG-Datei herunter." }, en: { description: "Downloads the comparison bar chart (AS vs. T2 basis) as a PNG file." } },
        downloadCompChartSVG: { de: { description: "Lädt das Vergleichs-Balkendiagramm (AS vs. T2-Basis) als Vektor-SVG-Datei herunter." }, en: { description: "Downloads the comparison bar chart (AS vs. T2 basis) as a vector SVG file." } },
        downloadTablePNG: { de: { description: "Lädt die angezeigte Tabelle als PNG-Bilddatei herunter." }, en: { description: "Downloads the displayed table as a PNG image file." } },
        downloadCompTablePNG: { de: { description: "Lädt die Vergleichs-Metrik-Tabelle (AS vs. T2) als PNG-Datei herunter." }, en: { description: "Downloads the comparison metric table (AS vs. T2) as a PNG file." } },
        asPurPerfTable: {
            kollektiv: { de: { description: "Patientenkollektiv (N = Anzahl Patienten)." }, en: { description: "Patient cohort (N = number of patients)." } },
            sens: { de: { description: "Sensitivität des Avocado Signs (vs. N) in diesem Kollektiv." }, en: { description: "Sensitivity of the Avocado Sign (vs. N) in this cohort." } },
            spez: { de: { description: "Spezifität des Avocado Signs (vs. N) in diesem Kollektiv." }, en: { description: "Specificity of the Avocado Sign (vs. N) in this cohort." } },
            ppv: { de: { description: "PPV des Avocado Signs (vs. N) in diesem Kollektiv." }, en: { description: "PPV of the Avocado Sign (vs. N) in this cohort." } },
            npv: { de: { description: "NPV des Avocado Signs (vs. N) in diesem Kollektiv." }, en: { description: "NPV of the Avocado Sign (vs. N) in this cohort." } },
            acc: { de: { description: "Accuracy des Avocado Signs (vs. N) in diesem Kollektiv." }, en: { description: "Accuracy of the Avocado Sign (vs. N) in this cohort." } },
            auc: { de: { description: "AUC / Balanced Accuracy des Avocado Signs (vs. N) in diesem Kollektiv." }, en: { description: "AUC / Balanced Accuracy of the Avocado Sign (vs. N) in this cohort." } }
        },
        asVsT2PerfTable: {
            metric: { de: { description: "Diagnostische Metrik." }, en: { description: "Diagnostic metric." } },
            asValue: { de: { description: "Wert der Metrik für Avocado Sign (AS) (vs. N) im Kollektiv <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>, inkl. 95% CI." }, en: { description: "Value of the metric for Avocado Sign (AS) (vs. N) in cohort <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>, incl. 95% CI." } },
            t2Value: { de: { description: "Wert der Metrik für die T2-Basis <strong>[T2_SHORT_NAME]</strong> (vs. N) im Kollektiv <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>, inkl. 95% CI." }, en: { description: "Value of the metric for the T2 basis <strong>[T2_SHORT_NAME]</strong> (vs. N) in cohort <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>, incl. 95% CI." } }
        },
        asVsT2TestTable: {
            test: { de: { description: "Statistischer Test zum Vergleich von AS vs. <strong>[T2_SHORT_NAME]</strong>." }, en: { description: "Statistical test for comparing AS vs. <strong>[T2_SHORT_NAME]</strong>." } },
            statistic: { de: { description: "Wert der Teststatistik." }, en: { description: "Value of the test statistic." } },
            pValue: { de: { description: "p-Wert des Tests. p < 0.05 bedeutet einen statistisch signifikanten Unterschied zwischen AS und <strong>[T2_SHORT_NAME]</strong> in Bezug auf die getestete Metrik (Accuracy oder AUC) im Kollektiv <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>." }, en: { description: "p-value of the test. p < 0.05 indicates a statistically significant difference between AS and <strong>[T2_SHORT_NAME]</strong> regarding the tested metric (Accuracy or AUC) in cohort <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>." } },
            method: { de: { description: "Name des verwendeten statistischen Tests." }, en: { description: "Name of the statistical test used." } }
        }
    },
    exportTab: {
        singleExports: { de: { description: "Einzelexporte" }, en: { description: "Single Exports" } },
        exportPackages: { de: { description: "Export-Pakete (.zip)" }, en: { description: "Export Packages (.zip)" } },
        description: { de: { description: "Ermöglicht den Export von Analyseergebnissen, Tabellen und Diagrammen basierend auf dem aktuell gewählten globalen Kollektiv (<strong>[KOLLEKTIV]</strong>) und den aktuell angewendeten T2-Kriterien." }, en: { description: "Allows exporting analysis results, tables, and diagrams based on the currently selected global cohort (<strong>[KOLLEKTIV]</strong>) and the currently applied T2 criteria." } },
        statsCSV: { de: { description: "Detaillierte Tabelle aller berechneten statistischen Metriken (deskriptiv, Güte AS & T2, Vergleiche, Assoziationen) aus dem Statistik-Tab als CSV-Datei." }, en: { description: "Detailed table of all calculated statistical metrics (descriptive, AS & T2 performance, comparisons, associations) from the Statistics tab as a CSV file." } },
        bruteForceTXT: { de: { description: "Detaillierter Bericht der letzten Brute-Force-Optimierung für das aktuelle Kollektiv (Top 10 Ergebnisse, Konfiguration) als Textdatei (.txt), falls durchgeführt." }, en: { description: "Detailed report of the last brute-force optimization for the current cohort (Top 10 results, configuration) as a text file (.txt), if performed." } },
        deskriptivMD: { de: { description: "Tabelle der deskriptiven Statistik (Statistik-Tab) als Markdown (.md)." }, en: { description: "Table of descriptive statistics (Statistics tab) as Markdown (.md)." } },
        datenMD: { de: { description: "Aktuelle Datenliste (Daten-Tab) als Markdown-Tabelle (.md)." }, en: { description: "Current data list (Data tab) as a Markdown table (.md)." } },
        auswertungMD: { de: { description: "Aktuelle Auswertungstabelle (Auswertung-Tab, inkl. T2-Ergebnisse) als Markdown (.md)." }, en: { description: "Current evaluation table (Evaluation tab, incl. T2 results) as Markdown (.md)." } },
        filteredDataCSV: { de: { description: "Rohdaten des aktuell ausgewählten Kollektivs (inkl. T2-Bewertung) als CSV-Datei (.csv)." }, en: { description: "Raw data of the currently selected cohort (incl. T2 evaluation) as a CSV file (.csv)." } },
        comprehensiveReportHTML: { de: { description: "Umfassender Analysebericht als HTML-Datei (Statistiken, Konfigurationen, Diagramme), druckbar." }, en: { description: "Comprehensive analysis report as an HTML file (statistics, configurations, diagrams), printable." } },
        chartsPNG: { de: { description: "Alle aktuell sichtbaren Diagramme (Statistik, Auswertung, Präsentation) und ausgewählte Tabellen als einzelne PNG-Dateien (ZIP-Archiv)." }, en: { description: "All currently visible diagrams (Statistics, Evaluation, Presentation) and selected tables as individual PNG files (ZIP archive)." } },
        chartsSVG: { de: { description: "Alle aktuell sichtbaren Diagramme (Statistik, Auswertung, Präsentation) als einzelne SVG-Dateien (ZIP-Archiv)." }, en: { description: "All currently visible diagrams (Statistics, Evaluation, Presentation) as individual SVG files (ZIP archive)." } },
        chartSinglePNG: { de: { description: "Ausgewähltes Diagramm '{ChartName}' als PNG-Datei." }, en: { description: "Selected chart '{ChartName}' as a PNG file." } },
        chartSingleSVG: { de: { description: "Ausgewähltes Diagramm '{ChartName}' als SVG-Datei (Vektorformat)." }, en: { description: "Selected chart '{ChartName}' as an SVG file (vector format)." } },
        tableSinglePNG: { de: { description: "Ausgewählte Tabelle '{TableName}' als PNG-Bilddatei." }, en: { description: "Selected table '{TableName}' as a PNG image file." } },
        allZIP: { de: { description: "Alle verfügbaren Einzeldateien (Statistik-CSV, BruteForce-TXT, alle MDs, Rohdaten-CSV, HTML-Report) in einem ZIP-Archiv." }, en: { description: "All available single files (Statistics CSV, BruteForce TXT, all MDs, Raw Data CSV, HTML Report) in one ZIP archive." } },
        csvZIP: { de: { description: "Alle verfügbaren CSV-Dateien (Statistik, Rohdaten) in einem ZIP-Archiv." }, en: { description: "All available CSV files (Statistics, Raw Data) in one ZIP archive." } },
        mdZIP: { de: { description: "Alle verfügbaren Markdown-Dateien (Deskriptiv, Daten, Auswertung, Publikationstexte) in einem ZIP-Archiv." }, en: { description: "All available Markdown files (Descriptive, Data, Evaluation, Publication Texts) in one ZIP archive." } },
        xlsxZIP: { de: { description: "Alle verfügbaren Excel-Dateien in einem ZIP-Archiv." }, en: { description: "All available Excel files in one ZIP archive." } },
        noDataToExport: { de: { description: "Keine Daten zum Exportieren."}, en: { description: "No data to export."}}, // Duplikat von UI_TEXTS.EXPORT_TAB.noDataToExport
        exportError: { de: { description: "Export fehlgeschlagen."}, en: { description: "Export failed."}} // Duplikat von UI_TEXTS.EXPORT_TAB.exportError
    },
    publikationTabTooltips: {
        spracheSwitch: { de: { description: "Wechselt die Sprache der generierten Texte und einiger Beschriftungen im Publikation-Tab zwischen Deutsch und Englisch." }, en: { description: "Switches the language of the generated texts and some labels in the Publication tab between German and English." } },
        sectionSelect: { de: { description: "Wählen Sie den Abschnitt der wissenschaftlichen Publikation, für den Textvorschläge und relevante Daten/Grafiken angezeigt werden sollen." }, en: { description: "Select the section of the scientific publication for which text suggestions and relevant data/graphics should be displayed." } },
        bruteForceMetricSelect: { de: { description: "Wählen Sie die Zielmetrik, deren Brute-Force-Optimierungsergebnisse im Ergebnisteil der generierten Publikationstexte verwendet werden sollen. Standardtexte beziehen sich meist auf die Default-Optimierungsmetrik (Balanced Accuracy)." }, en: { description: "Select the target metric whose brute-force optimization results should be used in the results section of the generated publication texts. Default texts usually refer to the default optimization metric (Balanced Accuracy)." } },
        abstract_main: { de: { description: "Generiert den Abstract inklusive Key Results und Summary Statement gemäß den Vorgaben des Radiology Style Guides." }, en: { description: "Generates the Abstract including Key Results and Summary Statement according to the Radiology Style Guide specifications." } },
        introduction_main: { de: { description: "Generiert einen Textvorschlag für die Einleitung der Publikation." }, en: { description: "Generates a text suggestion for the Introduction section of the publication." } },
        methoden_studienanlage_ethik: { de: { description: "Textvorschlag zu Studiendesign und Ethikvotum." }, en: { description: "Text suggestion for Study Design and Ethical Approval." } },
        methoden_patientenkohorte: { de: { description: "Textvorschlag zum Patientenkollektiv und den Einschlusskriterien, inkl. Verweis auf Flussdiagramm." }, en: { description: "Text suggestion for Patient Cohort and Inclusion Criteria, incl. reference to flowchart." } },
        methoden_mrt_protokoll_akquisition: { de: { description: "Textvorschlag zum MRT-Protokoll und der Bildakquisition." }, en: { description: "Text suggestion for MRI Protocol and Image Acquisition." } },
        methoden_bildanalyse_avocado_sign: { de: { description: "Textvorschlag zur Bildanalyse des Avocado Signs." }, en: { description: "Text suggestion for Image Analysis of the Avocado Sign." } },
        methoden_bildanalyse_t2_kriterien: { de: { description: "Textvorschlag zur Bildanalyse der T2-gewichteten Kriterien (Literatur & optimiert)." }, en: { description: "Text suggestion for Image Analysis of T2-weighted Criteria (literature & optimized)." } },
        methoden_referenzstandard_histopathologie: { de: { description: "Textvorschlag zum Referenzstandard (Histopathologie)." }, en: { description: "Text suggestion for Reference Standard (Histopathology)." } },
        methoden_statistische_analyse_methoden: { de: { description: "Textvorschlag zu den statistischen Analysemethoden." }, en: { description: "Text suggestion for Statistical Analysis Methods." } },
        ergebnisse_patientencharakteristika: { de: { description: "Textvorschlag und Darstellung der Patientencharakteristika (mit Tab. 1 und Abb. 1)." }, en: { description: "Text suggestion and presentation of Patient Characteristics (with Table 1 and Fig. 1)." } },
        ergebnisse_as_diagnostische_guete: { de: { description: "Textvorschlag und Tabelle zur diagnostischen Güte des Avocado Signs." }, en: { description: "Text suggestion and table for diagnostic performance of the Avocado Sign." } },
        ergebnisse_t2_literatur_diagnostische_guete: { de: { description: "Textvorschlag und Tabelle zur diagnostischen Güte der Literatur-basierten T2-Kriterien." }, en: { description: "Text suggestion and table for diagnostic performance of literature-based T2 criteria." } },
        ergebnisse_t2_optimiert_diagnostische_guete: { de: { description: "Textvorschlag und Tabelle zur diagnostischen Güte der optimierten T2-Kriterien." }, en: { description: "Text suggestion and table for diagnostic performance of optimized T2 criteria." } },
        ergebnisse_vergleich_as_vs_t2: { de: { description: "Textvorschlag, Tabelle und Abbildungen zum Vergleich der Performance von AS vs. T2-Kriterien." }, en: { description: "Text suggestion, table, and figures for comparing performance of AS vs. T2 criteria." } },
        discussion_main: { de: { description: "Generiert einen Textvorschlag für die Diskussion der Ergebnisse und Limitationen." }, en: { description: "Generates a text suggestion for the Discussion of results and limitations." } },
        references_main: { de: { description: "Generiert das Literaturverzeichnis." }, en: { description: "Generates the list of References." } }
    },
    statMetrics: { // Detaillierte Definitionen für jede Metrik
        sens: { 
            name: {de: "Sensitivität", en: "Sensitivity"}, 
            description: {de: "Anteil der korrekt als positiv klassifizierten Patienten unter allen tatsächlich positiven Patienten.", en: "Proportion of correctly classified positive patients among all actual positive patients."},
            formula: "RP / (RP + FN)",
            interpretation: {de: "Ein hoher Wert bedeutet, dass die Methode viele der tatsächlich positiven Fälle erkennt.", en: "A high value means the method detects many of the actual positive cases."},
            range: {de: "0 bis 1 (oder 0% bis 100%)", en: "0 to 1 (or 0% to 100%)"}
        },
        spez: { 
            name: {de: "Spezifität", en: "Specificity"},
            description: {de: "Anteil der korrekt als negativ klassifizierten Patienten unter allen tatsächlich negativen Patienten.", en: "Proportion of correctly classified negative patients among all actual negative patients."},
            formula: "RN / (RN + FP)",
            interpretation: {de: "Ein hoher Wert bedeutet, dass die Methode viele der tatsächlich negativen Fälle korrekt als negativ identifiziert.", en: "A high value means the method correctly identifies many of the actual negative cases as negative."},
            range: {de: "0 bis 1 (oder 0% bis 100%)", en: "0 to 1 (or 0% to 100%)"}
        },
        ppv: { 
            name: {de: "Positiver Prädiktiver Wert (PPV)", en: "Positive Predictive Value (PPV)"},
            description: {de: "Wahrscheinlichkeit, dass ein Patient mit einem positiven Testergebnis tatsächlich positiv ist.", en: "Probability that a patient with a positive test result is actually positive."},
            formula: "RP / (RP + FP)",
            interpretation: {de: "Hängt von der Prävalenz ab. Ein hoher Wert bedeutet eine hohe Zuverlässigkeit eines positiven Tests.", en: "Depends on prevalence. A high value means high reliability of a positive test."},
            range: {de: "0 bis 1 (oder 0% bis 100%)", en: "0 to 1 (or 0% to 100%)"}
        },
        npv: { 
            name: {de: "Negativer Prädiktiver Wert (NPV)", en: "Negative Predictive Value (NPV)"},
            description: {de: "Wahrscheinlichkeit, dass ein Patient mit einem negativen Testergebnis tatsächlich negativ ist.", en: "Probability that a patient with a negative test result is actually negative."},
            formula: "RN / (RN + FN)",
            interpretation: {de: "Hängt von der Prävalenz ab. Ein hoher Wert bedeutet eine hohe Zuverlässigkeit eines negativen Tests.", en: "Depends on prevalence. A high value means high reliability of a negative test."},
            range: {de: "0 bis 1 (oder 0% bis 100%)", en: "0 to 1 (or 0% to 100%)"}
        },
        acc: { 
            name: {de: "Genauigkeit (Accuracy)", en: "Accuracy"},
            description: {de: "Anteil aller korrekt klassifizierten Patienten.", en: "Proportion of all correctly classified patients."},
            formula: "(RP + RN) / (RP + RN + FP + FN)",
            interpretation: {de: "Kann bei unausgewogenen Klassen irreführend sein.", en: "Can be misleading in imbalanced classes."},
            range: {de: "0 bis 1 (oder 0% bis 100%)", en: "0 to 1 (or 0% to 100%)"}
        },
        balAcc: { 
            name: {de: "Balanced Accuracy", en: "Balanced Accuracy"},
            description: {de: "Mittelwert aus Sensitivität und Spezifität. Robuster bei unausgewogenen Klassen.", en: "Mean of sensitivity and specificity. More robust in imbalanced classes."},
            formula: "(Sensitivität + Spezifität) / 2",
            interpretation: {de: "Ein Wert nahe 1 zeigt eine gute Performance auch bei ungleichen Klassengrößen.", en: "A value close to 1 indicates good performance even with imbalanced class sizes."},
            range: {de: "0 bis 1 (oder 0% bis 100%)", en: "0 to 1 (or 0% to 100%)"}
        },
        f1: { 
            name: {de: "F1-Score", en: "F1-Score"},
            description: {de: "Harmonisches Mittel aus PPV und Sensitivität.", en: "Harmonic mean of PPV and sensitivity."},
            formula: "2 * (PPV * Sensitivität) / (PPV + Sensitivität)",
            interpretation: {de: "Nützlich, wenn sowohl falsch Positive als auch falsch Negative vermieden werden sollen.", en: "Useful when both false positives and false negatives are to be avoided."},
            range: {de: "0 bis 1", en: "0 to 1"}
        },
        auc: { 
            name: {de: "Fläche unter der ROC-Kurve (AUC)", en: "Area Under the ROC Curve (AUC)"},
            description: {de: "Maß für die Fähigkeit eines Tests, zwischen positiven und negativen Fällen zu unterscheiden über alle Schwellenwerte hinweg.", en: "Measure of a test's ability to discriminate between positive and negative cases across all thresholds."},
            interpretation: {de: "0.5 = keine Diskrimination, 1.0 = perfekte Diskrimination. Radiology: >0.7 'fair', >0.8 'good', >0.9 'excellent'.", en: "0.5 = no discrimination, 1.0 = perfect discrimination. Radiology: >0.7 'fair', >0.8 'good', >0.9 'excellent'."},
            range: {de: "0 bis 1", en: "0 to 1"}
        },
        phi: { 
            name: {de: "Phi-Koeffizient (φ)", en: "Phi Coefficient (φ)"},
            description: {de: "Maß für die Assoziation zwischen zwei binären Variablen.", en: "Measure of association between two binary variables."},
            formula: "(RP*RN - FP*FN) / sqrt((RP+FP)*(RP+FN)*(RN+FP)*(RN+FN))",
            interpretation: {de: "Werte nahe ±1 zeigen eine starke Assoziation, nahe 0 keine.", en: "Values near ±1 indicate a strong association, near 0 no association."},
            range: {de: "-1 bis +1", en: "-1 to +1"}
        },
        or: { 
            name: {de: "Odds Ratio (OR)", en: "Odds Ratio (OR)"},
            description: {de: "Quotient der Odds, dass ein Ereignis in einer Gruppe im Vergleich zu einer anderen auftritt.", en: "Ratio of the odds of an event occurring in one group compared to another."},
            formula: "(RP/FP) / (FN/RN) = (RP*RN) / (FP*FN)",
            interpretation: {de: "OR > 1: Erhöhte Odds. OR < 1: Verringerte Odds. OR = 1: Kein Unterschied.", en: "OR > 1: Increased odds. OR < 1: Decreased odds. OR = 1: No difference."},
            range: {de: "0 bis ∞", en: "0 to ∞"}
        },
        rd: { 
            name: {de: "Risikodifferenz (RD)", en: "Risk Difference (RD)"},
            description: {de: "Absolute Differenz der Risiken (Wahrscheinlichkeiten) eines Ereignisses zwischen zwei Gruppen.", en: "Absolute difference in the risks (probabilities) of an event between two groups."},
            formula: "P(Ereignis|Gruppe1) - P(Ereignis|Gruppe2) = (RP/(RP+FP)) - (FN/(FN+RN))",
            interpretation: {de: "Positiver Wert: Höheres Risiko in Gruppe 1. Negativer Wert: Niedrigeres Risiko in Gruppe 1.", en: "Positive value: Higher risk in group 1. Negative value: Lower risk in group 1."},
            range: {de: "-1 bis +1", en: "-1 to +1"}
        }
    },
    publicationFootnotes: {
        literaturT2Kriterien: {
            de: { description: "Zusammenfassung der in dieser Studie implementierten und verglichenen Literatur-basierten T2-Kriteriensets für die N-Status-Beurteilung beim Rektumkarzinom. Die Kriterien wurden jeweils auf das in der Originalpublikation beschriebene oder das am besten passende Subkollektiv dieser Studie angewendet. Abkürzungen: ESGAR, European Society of Gastrointestinal and Abdominal Radiology; nRCT, neoadjuvante Radiochemotherapie." },
            en: { description: "Summary of literature-based T2 criteria sets implemented and compared in this study for N-status assessment in rectal cancer. Criteria were applied to the subcohort described in the original publication or the best matching subcohort of this study. Abbreviations: ESGAR, European Society of Gastrointestinal and Abdominal Radiology; nCRT, neoadjuvant chemoradiotherapy." }
        },
        patientenCharakteristika: {
            de: { description: "Daten sind als Median (Interquartilsabstand), Mittelwert ± Standardabweichung (SD) oder absolute Anzahl n (Prozent %) dargestellt. Abkürzungen: IQR, Interquartilsabstand; SD, Standardabweichung; N, Anzahl Patienten; nRCT, neoadjuvante Radiochemotherapie. Die Kategorie 'Andere/Nicht Spezifiziert' für Geschlecht wurde in dieser Tabelle nicht aufgeführt." },
            en: { description: "Data are presented as median (interquartile range), mean ± standard deviation (SD), or absolute number n (percentage %). Abbreviations: IQR, interquartile range; SD, standard deviation; N, number of patients; nCRT, neoadjuvant chemoradiotherapy. The category 'Other/Unspecified' for sex was not listed in this table." }
        },
        diagnostischeGuete: {
            de: { description: "Diagnostische Gütekriterien für die angegebene Methode und das Patientenkollektiv. Alle Konfidenzintervalle (KI) sind 95%-Konfidenzintervalle. Die Werte für Sensitivität, Spezifität, PPV, NPV und Accuracy sind als Prozent (%) mit der Anzahl der Erfolge und der Gesamtzahl der Fälle in Klammern dargestellt. Abkürzungen: PPV, positiver prädiktiver Wert; NPV, negativer prädiktiver Wert; AUC, Fläche unter der ROC-Kurve (Receiver Operating Characteristic)." },
            en: { description: "Diagnostic performance metrics for the specified method and patient cohort. All confidence intervals (CI) are 95% confidence intervals. Values for sensitivity, specificity, PPV, NPV, and accuracy are presented as percentages (%) with the number of successes and total cases in parentheses. Abbreviations: PPV, positive predictive value; NPV, negative predictive value; AUC, area under the ROC (receiver operating characteristic) curve." }
        },
        statistischerVergleich: {
            de: { description: "Statistischer Vergleich der diagnostischen Leistung zwischen Avocado Sign (AS) und optimierten T2-Kriterien. Die T2-Kriterien wurden für jedes Kollektiv separat für die Zielmetrik '[BF_METRIC_NAME]' optimiert. P-Werte vom DeLong-Test für den Vergleich von AUCs und vom McNemar-Test für den Vergleich von Accuracy. Ein P-Wert < 0.05 wurde als statistisch signifikant betrachtet. Abkürzungen: AUC, Fläche unter der ROC-Kurve; Acc., Accuracy." },
            en: { description: "Statistical comparison of diagnostic performance between Avocado Sign (AS) and optimized T2 criteria. T2 criteria were optimized for each cohort separately for the target metric '[BF_METRIC_NAME]'. P values from DeLong test for AUC comparison and McNemar test for accuracy comparison. A P value < .05 was considered statistically significant. Abbreviations: AUC, area under the ROC curve; Acc., Accuracy." }
        }
    }
};

// Ensure UI_TEXTS and TOOLTIP_CONTENT are globally available if other modules expect them directly.
// This structure assumes that TOOLTIP_CONTENT is a distinct global object, 
// and UI_TEXTS contains other text elements.
// The error "Identifier 'TOOLTIP_CONTENT' has already been declared" suggests
// that TOOLTIP_CONTENT was defined twice. This structure ensures it's defined once.

// To be absolutely safe and ensure compatibility with ui_helpers_js_v2's expectation of a global TOOLTIP_CONTENT,
// while also resolving the "already declared" error, we should make sure that TOOLTIP_CONTENT is the *only*
// top-level declaration for tooltip data.
// However, the provided `ui_helpers_js_v2` actually accesses `TOOLTIP_CONTENT.statMetrics`, implying `TOOLTIP_CONTENT`
// is an object containing `statMetrics`.
// The most robust way to fix the "already declared" is to remove any prior or duplicate `const TOOLTIP_CONTENT = ...`
// and ensure only one definition exists. The current structure above *should* work if this file is the sole source for these constants.
// The error at "text_config.js:507" must be a line *in the user's version* of text_config.js.
// My generated text_config.js files do not reach 507 lines typically.
// The fix is to ensure TOOLTIP_CONTENT is declared only once.

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
deepFreeze(UI_TEXTS);
deepFreeze(TOOLTIP_CONTENT);

