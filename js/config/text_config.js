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
            references: 'Referenzen'
        },
        bruteForceMetricSelectLabel: {
            de: 'Optimierungsmetrik für T2 (BF):',
            en: 'Optimization Metric for T2 (BF):'
        },
        publicationContentNotAvailable: {
            de: 'Inhalt für diesen Abschnitt (Sprache: Deutsch) wird generiert oder ist nicht verfügbar.',
            en: 'Content for this section (Language: English) is being generated or is not available.'
        }
    },
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
        }
    },
    kurzanleitung: {
        title: {
            de: "Kurzanleitung & Wichtige Hinweise",
            en: "Quick Guide & Important Notes"
        },
        content: {
            de: `
                <p>Willkommen zum <strong>Lymphknoten T2 - Avocado Sign Analyse Tool v${APP_CONFIG.APP_VERSION}</strong>.</p>
                <p>Diese Anwendung dient der explorativen Analyse und dem wissenschaftlichen Vergleich der diagnostischen Leistung des "Avocado Signs" gegenüber T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status) bei Patienten mit Rektumkarzinom. Sie basiert auf einem Patientenkollektiv von 106 Fällen.</p>
                <h6>Allgemeine Bedienung:</h6>
                <ul>
                    <li><strong>Kollektiv-Auswahl (Header):</strong> Wählen Sie hier das globale Patientenkollektiv (<strong>Gesamt</strong>, <strong>Direkt OP</strong>, <strong>nRCT</strong>). Diese Auswahl beeinflusst alle Analysen und Darstellungen in der gesamten Anwendung. Die Header-Meta-Statistiken (Anzahl Patienten, N+, AS+, T2+) aktualisieren sich entsprechend.</li>
                    <li><strong>Tab-Navigation:</strong> Wechseln Sie über die Reiter zwischen den Hauptfunktionsbereichen der Anwendung.</li>
                    <li><strong>Tooltips:</strong> Viele Bedienelemente und Ausgaben sind mit detaillierten Tooltips versehen, die bei Mausüberfahrung Erklärungen, Definitionen oder Interpretationshilfen bieten.</li>
                    <li><strong>Statistische Signifikanz:</strong> In statistischen Tabellen werden p-Werte mit Symbolen für Signifikanzniveaus versehen: * p &lt; 0.05, ** p &lt; 0.01, *** p &lt; 0.001. Das zugrundeliegende Signifikanzniveau ist &alpha; = ${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,2).replace('.',',')}.</li>
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
                <p>Welcome to the <strong>Lymph Node T2 - Avocado Sign Analysis Tool v${APP_CONFIG.APP_VERSION}</strong>.</p>
                <p>This application is designed for exploratory analysis and scientific comparison of the diagnostic performance of the "Avocado Sign" versus T2-weighted morphological criteria for predicting mesorectal lymph node status (N-status) in patients with rectal cancer. It is based on a patient cohort of 106 cases.</p>
                <h6>General Operation:</h6>
                <ul>
                    <li><strong>Cohort Selection (Header):</strong> Select the global patient cohort here (<strong>Overall</strong>, <strong>Upfront Surgery</strong>, <strong>nCRT</strong>). This selection affects all analyses and displays throughout the application. Header meta-statistics (Number of Patients, N+, AS+, T2+) update accordingly.</li>
                    <li><strong>Tab Navigation:</strong> Switch between the main functional areas of the application using the tabs.</li>
                    <li><strong>Tooltips:</strong> Many UI elements and outputs are equipped with detailed tooltips that provide explanations, definitions, or interpretation aids on mouseover.</li>
                    <li><strong>Statistical Significance:</strong> In statistical tables, p-values are marked with symbols for significance levels: * p &lt; 0.05, ** p &lt; 0.01, *** p &lt; 0.001. The underlying significance level is &alpha; = ${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,2)}.</li>
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
        kollektiv: { de: "Aktuell betrachtetes Patientenkollektiv.", en: "Currently selected patient cohort." },
        anzahlPatienten: { de: "Gesamtzahl der Patienten im ausgewählten Kollektiv.", en: "Total number of patients in the selected cohort." },
        statusN: { de: "Anteil der Patienten mit positivem (+) vs. negativem (-) histopathologischem Lymphknotenstatus (N-Status, Pathologie-Referenzstandard) im ausgewählten Kollektiv.", en: "Proportion of patients with positive (+) vs. negative (-) histopathological lymph node status (N-status, pathology reference standard) in the selected cohort." },
        statusAS: { de: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß Avocado Sign (AS) Vorhersage (basierend auf T1KM-MRT) im ausgewählten Kollektiv.", en: "Proportion of patients with positive (+) vs. negative (-) lymph node status according to Avocado Sign (AS) prediction (based on T1CE-MRI) in the selected cohort." },
        statusT2: { de: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß den aktuell <strong>angewendeten und gespeicherten</strong> T2-Kriterien (siehe Auswertungstab) für das ausgewählte Kollektiv.", en: "Proportion of patients with positive (+) vs. negative (-) lymph node status according to the currently <strong>applied and saved</strong> T2 criteria (see Evaluation tab) for the selected cohort." }
    },
    mainTabs: {
        daten: { de: "Patientendaten anzeigen.", en: "Display patient data." },
        auswertung: { de: "T2-Kriterien definieren und Ergebnisse auswerten.", en: "Define T2 criteria and evaluate results." },
        statistik: { de: "Detaillierte statistische Analysen durchführen.", en: "Perform detailed statistical analyses." },
        praesentation: { de: "Ergebnisse präsentationsfreundlich darstellen.", en: "Display results in a presentation-friendly format." },
        publikation: { de: "Textvorschläge und Materialien für Publikationen generieren.", en: "Generate text suggestions and materials for publications." },
        export: { de: "Daten und Analyseergebnisse exportieren.", en: "Export data and analysis results." }
    },
    datenTable: {
        nr: { de: "Fortlaufende Nummer des Patienten.", en: "Patient's serial number." },
        name: { de: "Nachname des Patienten (anonymisiert/kodiert).", en: "Patient's last name (anonymized/coded)." },
        vorname: { de: "Vorname des Patienten (anonymisiert/kodiert).", en: "Patient's first name (anonymized/coded)." },
        geschlecht: { de: "Geschlecht des Patienten (m: männlich, f: weiblich, unbekannt).", en: "Patient's sex (m: male, f: female, unknown)." },
        alter: { de: "Alter des Patienten zum Zeitpunkt der MRT-Untersuchung in Jahren.", en: "Patient's age at the time of MRI examination in years." },
        therapie: { de: "Angewandte Therapie vor der Operation (nRCT: neoadjuvante Radiochemotherapie, direkt OP: keine Vorbehandlung). Beeinflusst die Kollektivauswahl.", en: "Therapy applied before surgery (nCRT: neoadjuvant chemoradiotherapy, upfront surgery: no prior treatment). Affects cohort selection." },
        n_as_t2: { de: "Direkter Statusvergleich: N (Pathologie-Referenz), AS (Avocado Sign), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung.", en: "Direct status comparison: N (Pathology reference), AS (Avocado Sign), T2 (current criteria). Click on N, AS, or T2 in the column header for sub-sorting." },
        bemerkung: { de: "Zusätzliche klinische oder radiologische Bemerkungen zum Patientenfall, falls vorhanden.", en: "Additional clinical or radiological remarks on the patient case, if available." },
        expandAll: { de: "Öffnet oder schließt die Detailansicht zu den T2-gewichteten Lymphknotenmerkmalen für alle Patienten in der aktuellen Tabellenansicht. Zeigt Größe, Form, Kontur, Homogenität und Signal für jeden LK.", en: "Expands or collapses the detail view of T2-weighted lymph node characteristics for all patients in the current table view. Shows size, shape, border, homogeneity, and signal for each LN." },
        expandRow: { de: "Klicken Sie hier oder auf den Pfeil-Button, um Details zu den morphologischen Eigenschaften der T2-gewichteten Lymphknoten dieses Patienten anzuzeigen/auszublenden. Nur verfügbar, wenn T2-LK-Daten vorhanden sind.", en: "Click here or the arrow button to show/hide details of the morphological characteristics of this patient's T2-weighted lymph nodes. Only available if T2-LN data exists." }
    },
    auswertungTable: {
        nr: { de: "Fortlaufende Nummer des Patienten.", en: "Patient's serial number." },
        name: { de: "Nachname des Patienten (anonymisiert/kodiert).", en: "Patient's last name (anonymized/coded)." },
        therapie: { de: "Angewandte Therapie vor der Operation.", en: "Therapy applied before surgery." },
        n_as_t2: { de: "Direkter Statusvergleich: N (Pathologie-Referenz), AS (Avocado Sign), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung.", en: "Direct status comparison: N (Pathology reference), AS (Avocado Sign), T2 (current criteria). Click on N, AS, or T2 in the column header for sub-sorting." },
        n_counts: { de: "Anzahl pathologisch positiver (N+) Lymphknoten / Gesamtzahl histopathologisch untersuchter Lymphknoten für diesen Patienten.", en: "Number of pathologically positive (N+) lymph nodes / Total number of histopathologically examined lymph nodes for this patient." },
        as_counts: { de: "Anzahl als positiv bewerteter Avocado Sign (AS+) Lymphknoten / Gesamtzahl im T1KM-MRT sichtbarer Lymphknoten für diesen Patienten.", en: "Number of Avocado Sign positive (AS+) lymph nodes / Total number of lymph nodes visible on T1CE-MRI for this patient." },
        t2_counts: { de: "Anzahl als positiv bewerteter T2-Lymphknoten (gemäß aktuell angewendeter Kriterien) / Gesamtzahl im T2-MRT sichtbarer Lymphknoten für diesen Patienten.", en: "Number of T2-positive lymph nodes (according to currently applied criteria) / Total number of lymph nodes visible on T2-MRI for this patient." },
        expandAll: { de: "Öffnet oder schließt die Detailansicht der bewerteten T2-gewichteten Lymphknoten und der erfüllten Kriterien für alle Patienten in der aktuellen Tabellenansicht.", en: "Expands or collapses the detail view of the evaluated T2-weighted lymph nodes and fulfilled criteria for all patients in the current table view." },
        expandRow: { de: "Klicken Sie hier oder auf den Pfeil-Button, um die detaillierte Bewertung der einzelnen T2-gewichteten Lymphknoten dieses Patienten gemäß der aktuell angewendeten Kriterien anzuzeigen/auszublenden. Erfüllte Positiv-Kriterien werden hervorgehoben.", en: "Click here or the arrow button to show/hide the detailed evaluation of this patient's individual T2-weighted lymph nodes according to the currently applied criteria. Fulfilled positive criteria are highlighted." }
    },
    t2Logic: {
        de: { description: `Logische Verknüpfung der aktiven T2-Kriterien: <strong>UND</strong> (Ein Lymphknoten ist nur positiv, wenn ALLE aktivierten Kriterien erfüllt sind). <strong>ODER</strong> (Ein Lymphknoten ist positiv, wenn MINDESTENS EIN aktiviertes Kriterium erfüllt ist). Die Wahl beeinflusst die Berechnung des T2-Status.` },
        en: { description: `Logical operator for active T2 criteria: <strong>AND</strong> (A lymph node is positive only if ALL activated criteria are met). <strong>OR</strong> (A lymph node is positive if AT LEAST ONE activated criterion is met). The choice affects the T2 status calculation.` }
    },
    t2Size: {
        de: { description: `Größenkriterium (Kurzachse): Lymphknoten mit einem Durchmesser <strong>größer oder gleich (≥)</strong> dem eingestellten Schwellenwert gelten als suspekt. Einstellbarer Bereich: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} - ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm (Schritt: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step} mm). Aktivieren/Deaktivieren mit Checkbox.` },
        en: { description: `Size criterion (short axis): Lymph nodes with a diameter <strong>greater than or equal to (≥)</strong> the set threshold are considered suspicious. Adjustable range: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} - ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm (step: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step} mm). Activate/deactivate with checkbox.` }
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
            de: "Setzt die Logik und alle Kriterien auf die definierten Standardeinstellungen zurück. Die Änderungen sind danach noch nicht angewendet.",
            en: "Resets the logic and all criteria to the defined default settings. Changes are not yet applied."
        },
        apply: {
            de: "Wendet die aktuell eingestellten T2-Kriterien und die Logik auf den gesamten Datensatz an. Dies aktualisiert die T2-Spalten in den Tabellen, alle statistischen Auswertungen und Diagramme. Die Einstellung wird zudem für zukünftige Sitzungen gespeichert.",
            en: "Applies the currently set T2 criteria and logic to the entire dataset. This updates the T2 columns in tables, all statistical evaluations, and diagrams. The setting is also saved for future sessions."
        }
    },
    t2CriteriaCard: {
        unsavedIndicator: {
            de: "<strong>Achtung:</strong> Es gibt nicht angewendete Änderungen an den T2-Kriterien oder der Logik. Klicken Sie auf 'Anwenden & Speichern', um die Ergebnisse zu aktualisieren und die Einstellung zu speichern.",
            en: "<strong>Attention:</strong> There are unapplied changes to the T2 criteria or logic. Click 'Apply & Save' to update the results and save the settings."
        }
    },
    t2MetricsOverview: {
        cardTitle: {
            de: "Kurzübersicht der diagnostischen Güte für die aktuell angewendeten und gespeicherten T2-Kriterien im Vergleich zum histopathologischen N-Status für das gewählte Kollektiv: <strong>[KOLLEKTIV]</strong>. Alle Konfidenzintervalle (CI) sind 95%-CIs.",
            en: "Summary of diagnostic performance for the currently applied and saved T2 criteria versus histopathological N-status for the selected cohort: <strong>[KOLLEKTIV]</strong>. All confidence intervals (CI) are 95% CIs."
        },
        sens: { de: "Sensitivität (T2 vs. N)", en: "Sensitivity (T2 vs. N)" },
        spez: { de: "Spezifität (T2 vs. N)", en: "Specificity (T2 vs. N)" },
        ppv: { de: "Positiver Prädiktiver Wert (PPV, T2 vs. N)", en: "Positive Predictive Value (PPV, T2 vs. N)" },
        npv: { de: "Negativer Prädiktiver Wert (NPV, T2 vs. N)", en: "Negative Predictive Value (NPV, T2 vs. N)" },
        acc: { de: "Accuracy (T2 vs. N)", en: "Accuracy (T2 vs. N)" },
        balAcc: { de: "Balanced Accuracy (T2 vs. N)", en: "Balanced Accuracy (T2 vs. N)" },
        f1: { de: "F1-Score (T2 vs. N)", en: "F1-Score (T2 vs. N)" },
        auc: { de: "AUC (T2 vs. N)", en: "AUC (T2 vs. N)" }
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
            de: "Statistik des für diese Optimierung verwendeten Kollektivs: N (Gesamtanzahl), N+ (Anzahl N-positiv), N- (Anzahl N-negativ).",
            en: "Statistics of the cohort used for this optimization: N (total count), N+ (number N-positive), N- (number N-negative)."
        }
    },
    bruteForceDetailsButton: {
        de: { description: "Öffnet ein Fenster mit den Top 10 Ergebnissen und weiteren Details zur abgeschlossenen Optimierung." },
        en: { description: "Opens a window with the top 10 results and further details on the completed optimization." }
    },
    bruteForceModal: {
        exportButton: {
            de: "Exportiert den detaillierten Bericht der Brute-Force-Optimierung (Top 10 Ergebnisse, Kollektiv-Statistik, Konfiguration) als formatierte Textdatei (.txt).",
            en: "Exports the detailed report of the brute-force optimization (Top 10 results, cohort statistics, configuration) as a formatted text file (.txt)."
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
        cardTitle: { de: "Demographie, klinische Daten und Lymphknoten-Basiszahlen des Kollektivs <strong>[KOLLEKTIV]</strong>.", en: "Demographics, clinical data, and baseline lymph node counts of cohort <strong>[KOLLEKTIV]</strong>." },
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
        cardTitle: { de: "Tabellarischer Leistungsvergleich: Avocado Sign, angewandte T2-Kriterien und Literatur-Sets für das global gewählte Kollektiv <strong>[GLOBAL_KOLLEKTIV_NAME]</strong>. Literatur-Sets werden auf ihrem spezifischen Zielkollektiv evaluiert, falls abweichend (in Klammern angegeben). Alle Werte ohne CIs.", en: "Tabular performance comparison: Avocado Sign, applied T2 criteria, and literature sets for the globally selected cohort <strong>[GLOBAL_KOLLEKTIV_NAME]</strong>. Literature sets are evaluated on their specific target cohort if different (indicated in parentheses). All values without CIs." },
        tableHeaderSet: { de: "Methode / Kriteriensatz (Eval. auf Kollektiv N)", en: "Method / Criteria Set (Eval. on Cohort N)" },
        tableHeaderSens: { de: "Sensitivität", en: "Sensitivity" },
        tableHeaderSpez: { de: "Spezifität", en: "Specificity" },
        tableHeaderPPV: { de: "PPV", en: "PPV" },
        tableHeaderNPV: { de: "NPV", en: "NPV" },
        tableHeaderAcc: { de: "Accuracy", en: "Accuracy" },
        tableHeaderAUC: { de: "AUC / Bal. Accuracy", en: "AUC / Bal. Accuracy" }
    },
    praesentation: {
        viewSelect: { de: { description: "Wählen Sie die Ansicht: <strong>Avocado Sign (Performance)</strong> für eine Übersicht der AS-Performance oder <strong>AS vs. T2 (Vergleich)</strong> für einen direkten Vergleich von AS mit einer auswählbaren T2-Kriterienbasis." }, en: { description: "Select view: <strong>Avocado Sign (Performance)</strong> for an overview of AS performance or <strong>AS vs. T2 (Comparison)</strong> for a direct comparison of AS with a selectable T2 criteria basis." } },
        studySelect: { de: { description: "Wählen Sie eine T2-Kriterienbasis für den Vergleich mit dem Avocado Sign. Optionen: aktuell in der App eingestellte Kriterien oder vordefinierte Sets aus publizierten Studien. Die Auswahl aktualisiert die untenstehenden Vergleiche. Das globale Kollektiv passt sich ggf. an das Zielkollektiv der Studie an." }, en: { description: "Select a T2 criteria basis for comparison with the Avocado Sign. Options: currently set criteria in the app or predefined sets from published studies. The selection updates the comparisons below. The global cohort may adapt to the study's target cohort." } },
        t2BasisInfoCard: {
            title: { de: "Informationen zur T2-Vergleichsbasis", en: "Information on T2 Comparison Basis" },
            description: { de: "Zeigt Details zu den aktuell für den Vergleich mit AS ausgewählten T2-Kriterien. Die Performance-Werte beziehen sich auf das angegebene Vergleichskollektiv.", en: "Shows details of the T2 criteria currently selected for comparison with AS. Performance values refer to the specified comparison cohort." },
            reference: { de: "Studienreferenz oder Quelle der Kriterien.", en: "Study reference or source of criteria." },
            patientCohort: { de: "Ursprüngliche Studienkohorte oder aktuelles Vergleichskollektiv (mit Patientenzahl).", en: "Original study cohort or current comparison cohort (with patient count)." },
            investigationType: { de: "Art der Untersuchung in der Originalstudie (z.B. Primärstaging, Restaging).", en: "Type of investigation in the original study (e.g., primary staging, restaging)." },
            focus: { de: "Hauptfokus der Originalstudie bezüglich dieser Kriterien.", en: "Main focus of the original study regarding these criteria." },
            keyCriteriaSummary: { de: "Zusammenfassung der angewendeten T2-Kriterien und Logik.", en: "Summary of the applied T2 criteria and logic." }
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
            kollektiv: { de: "Patientenkollektiv (N = Anzahl Patienten).", en: "Patient cohort (N = number of patients)." },
            sens: { de: "Sensitivität des Avocado Signs (vs. N) in diesem Kollektiv.", en: "Sensitivity of the Avocado Sign (vs. N) in this cohort." },
            spez: { de: "Spezifität des Avocado Signs (vs. N) in diesem Kollektiv.", en: "Specificity of the Avocado Sign (vs. N) in this cohort." },
            ppv: { de: "PPV des Avocado Signs (vs. N) in diesem Kollektiv.", en: "PPV of the Avocado Sign (vs. N) in this cohort." },
            npv: { de: "NPV des Avocado Signs (vs. N) in diesem Kollektiv.", en: "NPV of the Avocado Sign (vs. N) in this cohort." },
            acc: { de: "Accuracy des Avocado Signs (vs. N) in diesem Kollektiv.", en: "Accuracy of the Avocado Sign (vs. N) in this cohort." },
            auc: { de: "AUC / Balanced Accuracy des Avocado Signs (vs. N) in diesem Kollektiv.", en: "AUC / Balanced Accuracy of the Avocado Sign (vs. N) in this cohort." }
        },
        asVsT2PerfTable: {
            metric: { de: "Diagnostische Metrik.", en: "Diagnostic metric." },
            asValue: { de: "Wert der Metrik für Avocado Sign (AS) (vs. N) im Kollektiv <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>, inkl. 95% CI.", en: "Value of the metric for Avocado Sign (AS) (vs. N) in cohort <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>, incl. 95% CI." },
            t2Value: { de: "Wert der Metrik für die T2-Basis <strong>[T2_SHORT_NAME]</strong> (vs. N) im Kollektiv <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>, inkl. 95% CI.", en: "Value of the metric for the T2 basis <strong>[T2_SHORT_NAME]</strong> (vs. N) in cohort <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>, incl. 95% CI." }
        },
        asVsT2TestTable: {
            test: { de: "Statistischer Test zum Vergleich von AS vs. <strong>[T2_SHORT_NAME]</strong>.", en: "Statistical test for comparing AS vs. <strong>[T2_SHORT_NAME]</strong>." },
            statistic: { de: "Wert der Teststatistik.", en: "Value of the test statistic." },
            pValue: { de: "p-Wert des Tests. p < 0.05 bedeutet einen statistisch signifikanten Unterschied zwischen AS und <strong>[T2_SHORT_NAME]</strong> in Bezug auf die getestete Metrik (Accuracy oder AUC) im Kollektiv <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>.", en: "p-value of the test. p < 0.05 indicates a statistically significant difference between AS and <strong>[T2_SHORT_NAME]</strong> regarding the tested metric (Accuracy or AUC) in cohort <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>." },
            method: { de: "Name des verwendeten statistischen Tests.", en: "Name of the statistical test used." }
        }
    },
    exportTab: {
        singleExports: { de: "Einzelexporte", en: "Single Exports" },
        exportPackages: { de: "Export-Pakete (.zip)", en: "Export Packages (.zip)" },
        description: { de: "Ermöglicht den Export von Analyseergebnissen, Tabellen und Diagrammen basierend auf dem aktuell gewählten globalen Kollektiv (<strong>[KOLLEKTIV]</strong>) und den aktuell angewendeten T2-Kriterien.", en: "Allows exporting analysis results, tables, and diagrams based on the currently selected global cohort (<strong>[KOLLEKTIV]</strong>) and the currently applied T2 criteria." },
        statsCSV: { de: { description: "Detaillierte Tabelle aller berechneten statistischen Metriken (deskriptiv, Güte AS & T2, Vergleiche, Assoziationen) aus dem Statistik-Tab als CSV-Datei.", ext: "csv" }, en: { description: "Detailed table of all calculated statistical metrics (descriptive, AS & T2 performance, comparisons, associations) from the Statistics tab as a CSV file.", ext: "csv" }, type: 'STATS_CSV' },
        bruteForceTXT: { de: { description: "Detaillierter Bericht der letzten Brute-Force-Optimierung für das aktuelle Kollektiv (Top 10 Ergebnisse, Konfiguration) als Textdatei (.txt), falls durchgeführt.", ext: "txt" }, en: { description: "Detailed report of the last brute-force optimization for the current cohort (Top 10 results, configuration) as a text file (.txt), if performed.", ext: "txt" }, type: 'BRUTEFORCE_TXT' },
        deskriptivMD: { de: { description: "Tabelle der deskriptiven Statistik (Statistik-Tab) als Markdown (.md).", ext: "md" }, en: { description: "Table of descriptive statistics (Statistics tab) as Markdown (.md).", ext: "md" }, type: 'DESKRIPTIV_MD' },
        datenMD: { de: { description: "Aktuelle Datenliste (Daten-Tab) als Markdown-Tabelle (.md).", ext: "md" }, en: { description: "Current data list (Data tab) as a Markdown table (.md).", ext: "md" }, type: 'DATEN_MD' },
        auswertungMD: { de: { description: "Aktuelle Auswertungstabelle (Auswertung-Tab, inkl. T2-Ergebnisse) als Markdown (.md).", ext: "md" }, en: { description: "Current evaluation table (Evaluation tab, incl. T2 results) as Markdown (.md).", ext: "md" }, type: 'AUSWERTUNG_MD' },
        filteredDataCSV: { de: { description: "Rohdaten des aktuell ausgewählten Kollektivs (inkl. T2-Bewertung) als CSV-Datei (.csv).", ext: "csv" }, en: { description: "Raw data of the currently selected cohort (incl. T2 evaluation) as a CSV file (.csv).", ext: "csv" }, type: 'FILTERED_DATA_CSV' },
        comprehensiveReportHTML: { de: { description: "Umfassender Analysebericht als HTML-Datei (Statistiken, Konfigurationen, Diagramme), druckbar.", ext: "html" }, en: { description: "Comprehensive analysis report as an HTML file (statistics, configurations, diagrams), printable.", ext: "html" }, type: 'COMPREHENSIVE_REPORT_HTML' },
        chartsPNG: { de: { description: "Alle aktuell sichtbaren Diagramme (Statistik, Auswertung, Präsentation) und ausgewählte Tabellen als einzelne PNG-Dateien (ZIP-Archiv).", ext: "zip" }, en: { description: "All currently visible diagrams (Statistics, Evaluation, Presentation) and selected tables as individual PNG files (ZIP archive).", ext: "zip" }, type: 'PNG_ZIP' },
        chartsSVG: { de: { description: "Alle aktuell sichtbaren Diagramme (Statistik, Auswertung, Präsentation) als einzelne SVG-Dateien (ZIP-Archiv).", ext: "zip" }, en: { description: "All currently visible diagrams (Statistics, Evaluation, Presentation) as individual SVG files (ZIP archive).", ext: "zip" }, type: 'SVG_ZIP' },
        chartSinglePNG: { de: { description: "Ausgewähltes Diagramm '{ChartName}' als PNG-Datei.", ext: "png"}, en: { description: "Selected chart '{ChartName}' as a PNG file.", ext: "png"}, type: 'CHART_SINGLE_PNG'},
        chartSingleSVG: { de: { description: "Ausgewähltes Diagramm '{ChartName}' als SVG-Datei (Vektorformat).", ext: "svg"}, en: { description: "Selected chart '{ChartName}' as an SVG file (vector format).", ext: "svg"}, type: 'CHART_SINGLE_SVG'},
        tableSinglePNG: { de: { description: "Ausgewählte Tabelle '{TableName}' als PNG-Bilddatei.", ext: "png"}, en: { description: "Selected table '{TableName}' as a PNG image file.", ext: "png"}, type: 'TABLE_PNG_EXPORT'},
        allZIP: { de: { description: "Alle verfügbaren Einzeldateien (Statistik-CSV, BruteForce-TXT, alle MDs, Rohdaten-CSV, HTML-Report) in einem ZIP-Archiv.", ext: "zip"}, en: { description: "All available single files (Statistics CSV, BruteForce TXT, all MDs, Raw Data CSV, HTML Report) in one ZIP archive.", ext: "zip"}, type: 'ALL_ZIP'},
        csvZIP: { de: { description: "Alle verfügbaren CSV-Dateien (Statistik, Rohdaten) in einem ZIP-Archiv.", ext: "zip"}, en: { description: "All available CSV files (Statistics, Raw Data) in one ZIP archive.", ext: "zip"}, type: 'CSV_ZIP'},
        mdZIP: { de: { description: "Alle verfügbaren Markdown-Dateien (Deskriptiv, Daten, Auswertung, Publikationstexte) in einem ZIP-Archiv.", ext: "zip"}, en: { description: "All available Markdown files (Descriptive, Data, Evaluation, Publication Texts) in one ZIP archive.", ext: "zip"}, type: 'MD_ZIP'},
        xlsxZIP: { de: { description: "Alle verfügbaren Excel-Dateien in einem ZIP-Archiv.", ext: "xlsx"}, en: { description: "All available Excel files in one ZIP archive.", ext: "xlsx"}, type: 'XLSX_ZIP'}
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
    statMetrics: UI_TEXTS.statMetrics // Keep existing detailed tooltips for metrics
};

deepFreeze(UI_TEXTS);
const TOOLTIP_CONTENT = UI_TEXTS.TOOLTIP_CONTENT; // Behält die bisherige Struktur für einfachen Zugriff
