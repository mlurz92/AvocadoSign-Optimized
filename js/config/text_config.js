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

const UI_TEXTS_DE = {
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
        spracheSwitchLabel: 'Deutsch',
        sectionLabels: {
            methoden: 'Methoden',
            ergebnisse: 'Ergebnisse',
            diskussion: 'Diskussion',
            einleitung: 'Einleitung',
            abstract: 'Abstract',
            referenzen: 'Referenzen'
        },
        bruteForceMetricSelectLabel: 'Optimierungsmetrik für T2 (BF):',
        textGenerierungsHinweis: 'Die folgenden Texte und Tabellen wurden automatisch generiert und dienen als Entwurf. Bitte überprüfen und adaptieren Sie diese sorgfältig für Ihre Publikation.'
    },
    chartTitles: {
        ageDistribution: 'Altersverteilung',
        genderDistribution: 'Geschlechterverteilung',
        therapyDistribution: 'Therapieverteilung',
        statusN: 'N-Status (Pathologie)',
        statusAS: 'AS-Status (Avocado Sign)',
        statusT2: 'T2-Status (Angewandte Kriterien)',
        comparisonBar: 'Vergleichsdiagramm: AS vs. {T2Name}',
        rocCurve: 'ROC-Kurve für {MethodName}',
        asPerformance: 'Performance: Avocado Sign (Akt. Kollektiv)'
    },
    axisLabels: {
        age: 'Alter (Jahre)',
        patientCount: 'Anzahl Patienten',
        lymphNodeCount: 'Anzahl Lymphknoten',
        metricValue: 'Metrikwert',
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
        tableHeaderSet: "Methode / Kriteriensatz",
        tableHeaderSens: "Sens.",
        tableHeaderSpez: "Spez.",
        tableHeaderPPV: "PPV",
        tableHeaderNPV: "NPV",
        tableHeaderAcc: "Acc.",
        tableHeaderAUC: "AUC/BalAcc",
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
        title: `Kurzanleitung & Wichtige Hinweise (v${APP_CONFIG.APP_VERSION})`,
        content: `
            <p>Willkommen zum <strong>Lymphknoten T2 - Avocado Sign Analyse Tool v${APP_CONFIG.APP_VERSION}</strong>.</p>
            <h6>Allgemeine Bedienung:</h6>
            <ul>
                <li><strong>Kollektiv-Auswahl (Header):</strong> Wählen Sie hier das globale Patientenkollektiv (Gesamt, Direkt OP, nRCT). Diese Auswahl beeinflusst alle Analysen und Darstellungen.</li>
                <li><strong>Tab-Navigation:</strong> Wechseln Sie zwischen den Hauptfunktionen (Daten, Auswertung, Statistik, etc.).</li>
                <li><strong>Tooltips:</strong> Fahren Sie mit der Maus über Elemente für detaillierte Erklärungen.</li>
                <li><strong>Statistische Signifikanz:</strong> p-Werte werden mit Symbolen versehen: * p < 0.05, ** p < 0.01, *** p < 0.001. Das Signifikanzniveau ist &alpha; = ${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,2).replace('.',',')}.</li>
            </ul>
            <h6>Wichtige Tabs:</h6>
            <ul>
                <li><strong>Daten:</strong> Zeigt Patientendaten. Reihen sind für T2-LK-Details aufklappbar.</li>
                <li><strong>Auswertung:</strong>
                    <ul>
                        <li>Definieren Sie hier <strong>T2-Malignitätskriterien</strong> (Größe, Form etc.) und die <strong>Logik</strong> (UND/ODER).</li>
                        <li>Klicken Sie <strong>"Anwenden & Speichern"</strong>, um Ihre T2-Definitionen auf den Datensatz anzuwenden und die Ergebnisse in allen Tabs zu aktualisieren. Ungespeicherte Änderungen werden markiert (siehe Hinweis unten).</li>
                        <li>Starten Sie die <strong>Brute-Force-Optimierung</strong>, um datengetrieben die besten T2-Kriterien für eine Zielmetrik zu finden.</li>
                    </ul>
                </li>
                <li><strong>Statistik:</strong> Detaillierte statistische Analysen. Wählen Sie "Einzelansicht" oder "Vergleich Aktiv" für Kollektivvergleiche. Konfidenzintervalle (CI) sind 95%-CIs. Die Methode zur CI-Berechnung wird in den Tabellen angegeben.</li>
                <li><strong>Präsentation:</strong> Aufbereitete Ergebnisse, ideal für Vorträge.</li>
                <li><strong>Publikation:</strong> Generiert Textvorschläge und Materialien für eine wissenschaftliche Publikation.</li>
                <li><strong>Export:</strong> Lädt Analyseergebnisse und Daten herunter.</li>
            </ul>
            <h6>Hinweise zur T2-Kriterien-Definition (Auswertung-Tab):</h6>
            <ul>
                <li>Nach Änderungen an den T2-Kriterien oder der Logik erscheint ein Hinweis "Ungespeicherte Änderungen". Erst nach Klick auf <strong>"Anwenden & Speichern"</strong> werden diese Änderungen global wirksam und in allen Tabs berücksichtigt.</li>
                <li>Die Statusanzeige im Kriterien-Block informiert Sie, ob die angezeigten Kriterien den aktuell angewandten entsprechen.</li>
            </ul>
            <h6>Hinweise zur Nutzung für Publikationen (insbesondere Tab "Publikation"):</h6>
            <ul>
                <li>Im Tab "Publikation" können Sie die Sprache der generierten Texte (Deutsch/Englisch) und die zugrundeliegende Zielmetrik für die präsentierten Brute-Force-Ergebnisse auswählen.</li>
                <li>Die generierten Methoden- und Ergebnis-Texte sind als fundierte Grundlage für Ihr Manuskript gedacht. Sie integrieren dynamisch die relevanten statistischen Ergebnisse und Konfigurationen.</li>
                <li>Alle Texte sollten sorgfältig überprüft, an den spezifischen Stil Ihrer Zielpublikation (z.B. "Radiology") angepasst und um eine Einleitung, Diskussion und vollständige Literaturverweise ergänzt werden.</li>
                <li>Diagramme und Tabellen können über den "Export"-Tab oder direkt an den Elementen in verschiedenen Formaten (PNG, SVG, CSV, MD) heruntergeladen werden. Für Publikationen wird empfohlen, SVG für Diagramme zu verwenden und die Styles ggf. über die \`journal_style_config.js\` anzupassen oder im Nachgang zu bearbeiten.</li>
            </ul>
            <h6>Referenzstandard:</h6>
            <p class="small">Der pathologische N-Status dient als Referenzstandard für alle diagnostischen Güteberechnungen.</p>
            <p class="small">Diese Anwendung ist ein Forschungswerkzeug und nicht für die klinische Diagnostik vorgesehen.</p>
        `
    }
};

const UI_TEXTS_EN = {
    kollektivDisplayNames: {
        'Gesamt': 'Overall',
        'direkt OP': 'Upfront Surgery',
        'nRCT': 'nCRT',
        'avocado_sign': 'Avocado Sign',
        'applied_criteria': 'Applied T2 Criteria'
    },
    t2LogicDisplayNames: {
        'UND': 'AND',
        'ODER': 'OR',
        'KOMBINIERT': 'COMBINED (ESGAR Logic)'
    },
    publikationTab: {
        spracheSwitchLabel: 'English',
        sectionLabels: {
            methoden: 'Methods',
            ergebnisse: 'Results',
            diskussion: 'Discussion',
            einleitung: 'Introduction',
            abstract: 'Abstract',
            referenzen: 'References'
        },
        bruteForceMetricSelectLabel: 'Optimization Metric for T2 (BF):',
        textGenerierungsHinweis: 'The following texts and tables were automatically generated and serve as a draft. Please review and adapt them carefully for your publication.'
    },
    chartTitles: {
        ageDistribution: 'Age Distribution',
        genderDistribution: 'Gender Distribution',
        therapyDistribution: 'Therapy Distribution',
        statusN: 'N-Status (Pathology)',
        statusAS: 'AS-Status (Avocado Sign)',
        statusT2: 'T2-Status (Applied Criteria)',
        comparisonBar: 'Comparison Chart: AS vs. {T2Name}',
        rocCurve: 'ROC Curve for {MethodName}',
        asPerformance: 'Performance: Avocado Sign (Current Cohort)'
    },
    axisLabels: {
        age: 'Age (Years)',
        patientCount: 'Number of Patients',
        lymphNodeCount: 'Number of Lymph Nodes',
        metricValue: 'Metric Value',
        metric: 'Diagnostic Metric',
        sensitivity: 'Sensitivity (True Positive Rate)',
        oneMinusSpecificity: '1 - Specificity (False Positive Rate)',
        probability: 'Probability',
        shortAxisDiameter: 'Short Axis Diameter (mm)'
    },
    legendLabels: {
        male: 'Male',
        female: 'Female',
        unknownGender: 'Unknown',
        direktOP: 'Upfront Surgery',
        nRCT: 'nCRT',
        nPositive: 'N+',
        nNegative: 'N-',
        asPositive: 'AS+',
        asNegative: 'AS-',
        t2Positive: 'T2+',
        t2Negative: 'T2-',
        avocadoSign: 'Avocado Sign (AS)',
        currentT2: '{T2ShortName}',
        benignLN: 'Benign LNs',
        malignantLN: 'Malignant LNs'
    },
    criteriaComparison: {
        title: "Comparison of Diagnostic Performance of Different Methods",
        tableHeaderSet: "Method / Criteria Set",
        tableHeaderSens: "Sens.",
        tableHeaderSpez: "Spec.",
        tableHeaderPPV: "PPV",
        tableHeaderNPV: "NPV",
        tableHeaderAcc: "Acc.",
        tableHeaderAUC: "AUC/BalAcc",
    },
     statMetrics: {
        signifikanzTexte: {
            SIGNIFIKANT: "statistically significant",
            NICHT_SIGNIFIKANT: "statistically not significant"
        },
        orFaktorTexte: {
            ERHOEHT: "increased",
            VERRINGERT: "decreased",
            UNVERAENDERT: "unchanged"
        },
        rdRichtungTexte: {
            HOEHER: "higher",
            NIEDRIGER: "lower",
            GLEICH: "equal"
        },
        assoziationStaerkeTexte: {
            stark: "strong",
            moderat: "moderate",
            schwach: "weak",
            sehr_schwach: "very weak",
            nicht_bestimmbar: "not determinable"
        }
    },
    kurzanleitung: {
        title: `Quick Start Guide & Important Notes (v${APP_CONFIG.APP_VERSION})`,
        content: `
            <p>Welcome to the <strong>Lymph Node T2 - Avocado Sign Analysis Tool v${APP_CONFIG.APP_VERSION}</strong>.</p>
            <h6>General Usage:</h6>
            <ul>
                <li><strong>Cohort Selection (Header):</strong> Select the global patient cohort (Overall, Upfront Surgery, nCRT). This selection affects all analyses and displays.</li>
                <li><strong>Tab Navigation:</strong> Switch between main functions (Data, Evaluation, Statistics, etc.).</li>
                <li><strong>Tooltips:</strong> Hover over elements for detailed explanations.</li>
                <li><strong>Statistical Significance:</strong> p-values are marked with symbols: * p < 0.05, ** p < 0.01, *** p < 0.001. The significance level is &alpha; = ${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL}.</li>
            </ul>
            <h6>Key Tabs:</h6>
            <ul>
                <li><strong>Data:</strong> Displays patient data. Rows can be expanded for T2 LN details.</li>
                <li><strong>Evaluation:</strong>
                    <ul>
                        <li>Define <strong>T2 malignancy criteria</strong> (size, shape, etc.) and <strong>logic</strong> (AND/OR) here.</li>
                        <li>Click <strong>"Apply & Save"</strong> to apply your T2 definitions to the dataset and update results across all tabs. Unsaved changes are indicated (see note below).</li>
                        <li>Start <strong>Brute-Force Optimization</strong> to find the best T2 criteria for a target metric in a data-driven manner.</li>
                    </ul>
                </li>
                <li><strong>Statistics:</strong> Detailed statistical analyses. Choose "Single View" or "Comparison Active" for cohort comparisons. Confidence intervals (CI) are 95%-CIs. The CI calculation method is stated in the tables.</li>
                <li><strong>Presentation:</strong> Results formatted for presentations.</li>
                <li><strong>Publication:</strong> Generates text suggestions and materials for scientific publications.</li>
                <li><strong>Export:</strong> Download analysis results and data.</li>
            </ul>
            <h6>Notes on T2 Criteria Definition (Evaluation Tab):</h6>
            <ul>
                <li>After changing T2 criteria or logic, an "Unsaved Changes" indicator appears. Changes become globally effective and are reflected in all tabs only after clicking <strong>"Apply & Save"</strong>.</li>
                <li>The status display in the criteria block informs you if the displayed criteria match the currently applied ones.</li>
            </ul>
            <h6>Notes on Using for Publications (especially "Publication" Tab):</h6>
            <ul>
                <li>In the "Publication" tab, you can select the language for generated texts (German/English) and the underlying target metric for presented Brute-Force results.</li>
                <li>The generated Methods and Results texts are intended as a solid foundation for your manuscript. They dynamically integrate relevant statistical results and configurations.</li>
                <li>All texts should be carefully reviewed, adapted to the specific style of your target journal (e.g., "Radiology"), and supplemented with an introduction, discussion, and complete references.</li>
                <li>Diagrams and tables can be downloaded via the "Export" tab or directly from the elements in various formats (PNG, SVG, CSV, MD). For publications, using SVG for diagrams is recommended, with styles potentially adjusted via \`journal_style_config.js\` or post-hoc.</li>
            </ul>
            <h6>Reference Standard:</h6>
            <p class="small">The pathological N-status serves as the reference standard for all diagnostic performance calculations.</p>
            <p class="small">This application is a research tool and not intended for clinical diagnostic use.</p>
        `
    }
};

const UI_TEXTS = (() => {
    const lang = state && typeof state.getCurrentPublikationLang === 'function' ? state.getCurrentPublikationLang() : APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG;
    if (lang === 'en') {
        return UI_TEXTS_EN;
    }
    return UI_TEXTS_DE;
})();


const TOOLTIP_CONTENT_DE = {
    kurzanleitungButton: { description: "Zeigt eine Kurzanleitung und wichtige Hinweise zur Bedienung der Anwendung." },
    kollektivButtons: { description: "Wählen Sie das Patientenkollektiv für die Analyse aus: <strong>Gesamt</strong> (alle Patienten), <strong>Direkt OP</strong> (nur primär Operierte ohne Vorbehandlung) oder <strong>nRCT</strong> (nur neoadjuvant Radiochemotherapeutisch Vorbehandelte). Die Auswahl filtert die Datenbasis für alle Tabs." },
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
        statistik: "Bietet detaillierte statistische Analysen (Gütekriterien, Vergleiche, Assoziationen) für das global gewählte Kollektiv oder einen Vergleich zweier spezifisch wählbarer Kollektive. Alle Konfidenzintervalle (CI) sind 95%-CIs. Die Methode zur CI-Berechnung wird in den Tabellen explizit genannt.",
        praesentation: "Stellt Analyseergebnisse in einem aufbereiteten, präsentationsfreundlichen Format dar, fokussiert auf den Vergleich des Avocado Signs mit T2-basierten Ansätzen (angewandt oder Literatur).",
        publikation: "Generiert Textvorschläge und Materialien für wissenschaftliche Publikationen zum Vergleich von Avocado Sign mit verschiedenen T2-Kriteriensets (Methoden & Ergebnisse).",
        export: "Bietet umfangreiche Optionen zum Herunterladen von Rohdaten, Analyseergebnissen, Tabellen und Diagrammen in verschiedenen Dateiformaten (inkl. Optionen für englischsprachige Diagramme für Publikationen)."
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
        t2_counts: "Anzahl als positiv bewerteter T2-Lymphknoten (gemäß aktuell angewandter Kriterien) / Gesamtzahl im T2-MRT sichtbarer Lymphknoten für diesen Patienten.",
        expandAll: "Öffnet oder schließt die Detailansicht der bewerteten T2-gewichteten Lymphknoten und der erfüllten Kriterien für alle Patienten in der aktuellen Tabellenansicht.",
        expandRow: "Klicken Sie hier oder auf den Pfeil-Button, um die detaillierte Bewertung der einzelnen T2-gewichteten Lymphknoten dieses Patienten gemäß der aktuell angewendeten Kriterien anzuzeigen/auszublenden. Erfüllte Positiv-Kriterien werden hervorgehoben."
    },
    t2Logic: { description: `Logische Verknüpfung der aktiven T2-Kriterien: <strong>UND</strong> (Ein Lymphknoten ist nur positiv, wenn ALLE aktivierten Kriterien erfüllt sind). <strong>ODER</strong> (Ein Lymphknoten ist positiv, wenn MINDESTENS EIN aktiviertes Kriterium erfüllt ist). Die Wahl beeinflusst die Berechnung des T2-Status.` },
    t2Size: { description: `Größenkriterium (Kurzachse): Lymphknoten mit einem Durchmesser <strong>größer oder gleich (≥)</strong> dem eingestellten Schwellenwert gelten als suspekt. Einstellbarer Bereich: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} - ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm (Schritt: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step} mm). Aktivieren/Deaktivieren mit Checkbox.` },
    t2Form: { description: "Formkriterium: Wählen Sie, welche Form ('rund' oder 'oval') als suspekt gilt. Aktivieren/Deaktivieren mit Checkbox." },
    t2Kontur: { description: "Konturkriterium: Wählen Sie, welche Kontur ('scharf' berandet oder 'irregulär') als suspekt gilt. Aktivieren/Deaktivieren mit Checkbox." },
    t2Homogenitaet: { description: "Homogenitätskriterium: Wählen Sie, ob ein 'homogenes' oder 'heterogenes' Binnensignal auf T2w als suspekt gilt. Aktivieren/Deaktivieren mit Checkbox." },
    t2Signal: { description: "Signalkriterium: Wählen Sie, welche T2-Signalintensität ('signalarm', 'intermediär' oder 'signalreich') relativ zur umgebenden Muskulatur als suspekt gilt. Lymphknoten mit nicht beurteilbarem Signal (Wert 'null') erfüllen dieses Kriterium nie. Aktivieren/Deaktivieren mit Checkbox." },
    t2Actions: {
        reset: "Setzt die Logik und alle Kriterien auf die definierten Standardeinstellungen zurück. Die Änderungen sind danach noch nicht angewendet.",
        apply: "Wendet die aktuell eingestellten T2-Kriterien und die Logik auf den gesamten Datensatz an. Dies aktualisiert die T2-Spalten in den Tabellen, alle statistischen Auswertungen und Diagramme. Die Einstellung wird zudem für zukünftige Sitzungen gespeichert."
    },
    t2CriteriaCard: {
        unsavedIndicator: "<strong>Achtung:</strong> Es gibt nicht angewendete Änderungen an den T2-Kriterien oder der Logik. Klicken Sie auf 'Anwenden & Speichern', um die Ergebnisse zu aktualisieren und die Einstellung zu speichern.",
        statusApplied: "Status: Aktuell definierte Kriterien sind angewandt.",
        statusNotApplied: "Status: Angezeigte Kriterien sind NICHT angewandt. Klicken Sie 'Anwenden & Speichern'."
    },
    t2MetricsOverview: {
        cardTitle: "Kurzübersicht der diagnostischen Güte für die aktuell angewendeten und gespeicherten T2-Kriterien im Vergleich zum histopathologischen N-Status für das gewählte Kollektiv: <strong>[KOLLEKTIV]</strong>. Alle Konfidenzintervalle (CI) sind 95%-CIs.",
        sens: "Sensitivität (T2 vs. N): Anteil der N+ Fälle, die von den T2-Kriterien korrekt als positiv erkannt wurden.",
        spez: "Spezifität (T2 vs. N): Anteil der N- Fälle, die von den T2-Kriterien korrekt als negativ erkannt wurden.",
        ppv: "Positiver Prädiktiver Wert (PPV, T2 vs. N): Wahrscheinlichkeit, dass ein T2+ Fall tatsächlich N+ ist.",
        npv: "Negativer Prädiktiver Wert (NPV, T2 vs. N): Wahrscheinlichkeit, dass ein T2- Fall tatsächlich N- ist.",
        acc: "Accuracy (T2 vs. N): Gesamtanteil der korrekt klassifizierten Fälle.",
        balAcc: "Balanced Accuracy (T2 vs. N): Mittelwert aus Sensitivität und Spezifität.",
        f1: "F1-Score (T2 vs. N): Harmonisches Mittel aus PPV und Sensitivität.",
        auc: "AUC (T2 vs. N): Fläche unter der ROC-Kurve; für binäre Tests wie hier äquivalent zur Balanced Accuracy."
     },
    bruteForceMetric: { description: "Wählen Sie die Zielmetrik für die Brute-Force-Optimierung.<br><strong>Accuracy:</strong> Anteil korrekt klassifizierter Fälle.<br><strong>Balanced Accuracy:</strong> (Sens+Spez)/2; gut bei ungleichen Klassengrößen.<br><strong>F1-Score:</strong> Harmonisches Mittel aus PPV & Sensitivität.<br><strong>PPV:</strong> Präzision bei positiver Vorhersage.<br><strong>NPV:</strong> Präzision bei negativer Vorhersage." },
    bruteForceStart: { description: "Startet die Brute-Force-Suche nach der T2-Kriterienkombination, die die gewählte Zielmetrik im aktuellen Kollektiv maximiert. Dies kann einige Zeit in Anspruch nehmen und läuft im Hintergrund." },
    bruteForceInfo: { description: "Zeigt den Status des Brute-Force Optimierungs-Workers und das aktuell analysierte Patientenkollektiv: <strong>[KOLLEKTIV_NAME]</strong>." },
    bruteForceProgress: { description: "Fortschritt der laufenden Optimierung: Getestete Kombinationen / Gesamtanzahl ([TOTAL]). Angezeigt werden die aktuelle beste Metrik und die zugehörigen Kriterien." },
    bruteForceResult: {
        description: "Bestes Ergebnis der abgeschlossenen Brute-Force-Optimierung für das gewählte Kollektiv ([N_GESAMT] Patienten, davon [N_PLUS] N+ und [N_MINUS] N-) und die Zielmetrik.",
        kollektivStats: "Statistik des für diese Optimierung verwendeten Kollektivs: N (Gesamtanzahl), N+ (Anzahl N-positiv), N- (Anzahl N-negativ)."
    },
    bruteForceDetailsButton: { description: "Öffnet ein Fenster mit den Top Ergebnissen und weiteren Details zur abgeschlossenen Optimierung." },
    bruteForceModal: {
        exportButton: "Exportiert den detaillierten Bericht der Brute-Force-Optimierung (Top Ergebnisse, Kollektiv-Statistik, Konfiguration) als formatierte Textdatei (.txt).",
        sensCol: "Sensitivität dieser Kriterienkombination.",
        spezCol: "Spezifität dieser Kriterienkombination.",
        ppvCol: "Positiver Prädiktiver Wert dieser Kriterienkombination.",
        npvCol: "Negativer Prädiktiver Wert dieser Kriterienkombination."
    },
    statistikLayout: { description: "Wählen Sie die Anzeigeart: <strong>Einzelansicht</strong> für das global gewählte Kollektiv oder <strong>Vergleich Aktiv</strong> zur Auswahl und Gegenüberstellung zweier spezifischer Kollektive." },
    statistikKollektiv1: { description: "Wählen Sie das erste Kollektiv für die statistische Auswertung oder den Vergleich (nur aktiv bei Layout 'Vergleich Aktiv')." },
    statistikKollektiv2: { description: "Wählen Sie das zweite Kollektiv für den Vergleich (nur aktiv bei Layout 'Vergleich Aktiv')." },
    statistikToggleVergleich: { description: "Schaltet zwischen der detaillierten Einzelansicht für das global gewählte Kollektiv und der Vergleichsansicht zweier spezifisch wählbarer Kollektive um." },
    deskriptiveStatistik: {
        cardTitle: "Demographie, klinische Daten und Lymphknoten-Basiszahlen des Kollektivs <strong>[KOLLEKTIV]</strong>.",
        alterMedian: { description: "Median des Alters mit Bereich (Min-Max) und [Mittelwert ± Standardabweichung].", name: "Alter", unit: "Jahre" },
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
        chartAge: { description: "Histogramm der Altersverteilung im Kollektiv <strong>[KOLLEKTIV]</strong>." },
        chartGender: { description: "Tortendiagramm der Geschlechterverteilung im Kollektiv <strong>[KOLLEKTIV]</strong>." },
        age: { name: "Alter", description: "Alter des Patienten in Jahren." },
        gender: { name: "Geschlecht", description: "Geschlecht des Patienten." }
    },
    diagnostischeGueteAS: { cardTitle: "Diagnostische Güte des Avocado Signs (AS) vs. Histopathologie (N) für Kollektiv <strong>[KOLLEKTIV]</strong>. Alle Konfidenzintervalle (CI) sind 95%-CIs. Die Methode zur CI-Berechnung wird in der Tabelle explizit genannt." },
    diagnostischeGueteT2: { cardTitle: "Diagnostische Güte der aktuell angewendeten T2-Kriterien vs. Histopathologie (N) für Kollektiv <strong>[KOLLEKTIV]</strong>. Alle CIs sind 95%-CIs. Die Methode zur CI-Berechnung wird in der Tabelle explizit genannt." },
    statistischerVergleichASvsT2: { cardTitle: "Statistischer Vergleich der diagnostischen Leistung von AS vs. aktuell angewandten T2-Kriterien (gepaarte Tests) im Kollektiv <strong>[KOLLEKTIV]</strong>." },
    assoziationEinzelkriterien: { cardTitle: "Assoziation zwischen AS-Status bzw. einzelnen T2-Merkmalen und dem N-Status (+/-) im Kollektiv <strong>[KOLLEKTIV]</strong>. OR: Odds Ratio, RD: Risk Difference, φ: Phi-Koeffizient. Alle CIs sind 95%-CIs." },
    vergleichKollektive: { cardTitle: "Statistischer Vergleich der Accuracy und AUC (für AS und T2) zwischen <strong>[KOLLEKTIV1]</strong> und <strong>[KOLLEKTIV2]</strong> (ungepaarte Tests)." },
    criteriaComparisonTable: {
        cardTitle: "Tabellarischer Leistungsvergleich: Avocado Sign, angewandte T2-Kriterien und Literatur-Sets für das global gewählte Kollektiv <strong>[GLOBAL_KOLLEKTIV_NAME]</strong>. Literatur-Sets werden auf ihrem spezifischen Zielkollektiv evaluiert, falls abweichend (in Klammern angegeben). Alle Werte ohne CIs.",
        tableHeaderSet: "Methode / Kriteriensatz (Eval. auf Kollektiv N)",
        tableHeaderSens: "Sensitivität",
        tableHeaderSpez: "Spezifität",
        tableHeaderPPV: "PPV",
        tableHeaderNPV: "NPV",
        tableHeaderAcc: "Accuracy",
        tableHeaderAUC: "AUC / Bal. Accuracy"
    },
    praesentation: {
        viewSelect: { description: "Wählen Sie die Ansicht: <strong>Avocado Sign (Performance)</strong> für eine Übersicht der AS-Performance oder <strong>AS vs. T2 (Vergleich)</strong> für einen direkten Vergleich von AS mit einer auswählbaren T2-Kriterienbasis." },
        studySelect: { description: "Wählen Sie eine T2-Kriterienbasis für den Vergleich mit dem Avocado Sign. Optionen: aktuell in der App eingestellte Kriterien oder vordefinierte Sets aus publizierten Studien. Die Auswahl aktualisiert die untenstehenden Vergleiche. Das globale Kollektiv passt sich ggf. an das Zielkollektiv der Studie an." },
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
        downloadPerformanceCSV: { description: "Lädt die Tabelle der diagnostischen Güte (je nach Ansicht: AS oder AS vs. T2-Basis) als CSV-Datei (.csv) herunter." },
        downloadPerformanceMD: { description: "Lädt die Tabelle der diagnostischen Güte (je nach Ansicht: AS oder AS vs. T2-Basis) als Markdown-Datei (.md) herunter." },
        downloadCompTestsMD: { description: "Lädt die Tabelle der statistischen Vergleichstests (McNemar, DeLong für AS vs. T2-Basis) als Markdown-Datei (.md) herunter." },
        downloadCompTableMD: { description: "Lädt die Tabelle mit den verglichenen Metrikwerten (AS vs. T2-Basis) als Markdown-Datei (.md) herunter."},
        downloadCompChartPNG: { description: "Lädt das Vergleichs-Balkendiagramm (AS vs. {T2ShortName}) als PNG-Datei herunter." },
        downloadCompChartSVG: { description: "Lädt das Vergleichs-Balkendiagramm (AS vs. {T2ShortName}) als Vektor-SVG-Datei herunter." },
        downloadTablePNG: { description: "Lädt die angezeigte Tabelle als PNG-Bilddatei herunter." },
        downloadCompTablePNG: { description: "Lädt die Vergleichs-Metrik-Tabelle (AS vs. {T2ShortName}) als PNG-Datei herunter." },
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
            asValue: "Wert der Metrik für Avocado Sign (AS) (vs. N) im Kollektiv <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>, inkl. 95% CI.",
            t2Value: "Wert der Metrik für die T2-Basis <strong>[T2_SHORT_NAME]</strong> (vs. N) im Kollektiv <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>, inkl. 95% CI."
        },
        asVsT2TestTable: {
            test: "Statistischer Test zum Vergleich von AS vs. <strong>[T2_SHORT_NAME]</strong>.",
            statistic: "Wert der Teststatistik.",
            pValue: "p-Wert des Tests. p < 0.05 bedeutet einen statistisch signifikanten Unterschied zwischen AS und <strong>[T2_SHORT_NAME]</strong> in Bezug auf die getestete Metrik (Accuracy oder AUC) im Kollektiv <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>.",
            method: "Name des verwendeten statistischen Tests."
        }
    },
    exportTab: {
        singleExports: "Einzelexporte",
        exportPackages: "Export-Pakete (.zip)",
        description: "Ermöglicht den Export von Analyseergebnissen, Tabellen und Diagrammen basierend auf dem aktuell gewählten globalen Kollektiv (<strong>[KOLLEKTIV]</strong>) und den aktuell angewendeten T2-Kriterien. Diagramme können für Publikationen auch direkt in Englisch exportiert werden.",
        statsCSV: { description: "Detaillierte Tabelle aller berechneten statistischen Metriken (deskriptiv, Güte AS & T2, Vergleiche, Assoziationen) aus dem Statistik-Tab als CSV-Datei.", type: 'STATS_CSV', ext: "csv" },
        bruteForceTXT: { description: "Detaillierter Bericht der letzten Brute-Force-Optimierung für das aktuelle Kollektiv (Top Ergebnisse, Konfiguration) als Textdatei (.txt), falls durchgeführt.", type: 'BRUTEFORCE_TXT', ext: "txt" },
        deskriptivMD: { description: "Tabelle der deskriptiven Statistik (Statistik-Tab) als Markdown (.md).", type: 'DESKRIPTIV_MD', ext: "md" },
        datenMD: { description: "Aktuelle Datenliste (Daten-Tab) als Markdown-Tabelle (.md).", type: 'DATEN_MD', ext: "md" },
        auswertungMD: { description: "Aktuelle Auswertungstabelle (Auswertung-Tab, inkl. T2-Ergebnisse) als Markdown (.md).", type: 'AUSWERTUNG_MD', ext: "md" },
        filteredDataCSV: { description: "Rohdaten des aktuell ausgewählten Kollektivs (inkl. T2-Bewertung) als CSV-Datei (.csv).", type: 'FILTERED_DATA_CSV', ext: "csv" },
        comprehensiveReportHTML: { description: "Umfassender Analysebericht als HTML-Datei (Statistiken, Konfigurationen, Diagramme), druckbar.", type: 'COMPREHENSIVE_REPORT_HTML', ext: "html" },
        chartsPNG: { description: "Alle aktuell sichtbaren Diagramme (Statistik, Auswertung, Präsentation) und ausgewählte Tabellen als einzelne PNG-Dateien (ZIP-Archiv). Diagramme werden gemäß den Einstellungen im 'journal_style_config.js' und in englischer Sprache für den Export vorbereitet.", type: 'PNG_ZIP', ext: "zip" },
        chartsSVG: { description: "Alle aktuell sichtbaren Diagramme (Statistik, Auswertung, Präsentation) als einzelne SVG-Dateien (ZIP-Archiv). Diagramme werden gemäß den Einstellungen im 'journal_style_config.js' und in englischer Sprache für den Export vorbereitet.", type: 'SVG_ZIP', ext: "zip" },
        chartSinglePNG: { description: "Ausgewähltes Diagramm '{ChartName}' als PNG-Datei (publikationsoptimiert, englisch).", type: 'CHART_SINGLE_PNG', ext: "png"},
        chartSingleSVG: { description: "Ausgewähltes Diagramm '{ChartName}' als SVG-Datei (Vektorformat, publikationsoptimiert, englisch).", type: 'CHART_SINGLE_SVG', ext: "svg"},
        tableSinglePNG: { description: "Ausgewählte Tabelle '{TableName}' als PNG-Bilddatei.", type: 'TABLE_PNG_EXPORT', ext: "png"},
        allZIP: { description: "Alle verfügbaren Einzeldateien (Statistik-CSV, BruteForce-TXT, alle MDs, Rohdaten-CSV, HTML-Report) in einem ZIP-Archiv.", type: 'ALL_ZIP', ext: "zip"},
        csvZIP: { description: "Alle verfügbaren CSV-Dateien (Statistik, Rohdaten) in einem ZIP-Archiv.", type: 'CSV_ZIP', ext: "zip"},
        mdZIP: { description: "Alle verfügbaren Markdown-Dateien (Deskriptiv, Daten, Auswertung, Publikationstexte) in einem ZIP-Archiv.", type: 'MD_ZIP', ext: "md"},
        pngZIP: { description: "Identisch zum 'Diagramme & Tabellen (PNG)' Einzel-Export. Diagramme werden publikationsoptimiert und in Englisch exportiert.", type: 'PNG_ZIP', ext: "zip"},
        svgZIP: { description: "Identisch zum 'Diagramme (SVG)' Einzel-Export. Diagramme werden publikationsoptimiert und in Englisch exportiert.", type: 'SVG_ZIP', ext: "zip"}
    },
    publikationTabTooltips: {
        spracheSwitch: { description: "Wechselt die Sprache der generierten Texte und einiger Beschriftungen im Publikation-Tab zwischen Deutsch und Englisch." },
        sectionSelect: { description: "Wählen Sie den Abschnitt der wissenschaftlichen Publikation (Methoden oder Ergebnisse), für den Textvorschläge und relevante Daten/Grafiken angezeigt werden sollen." },
        bruteForceMetricSelect: { description: "Wählen Sie die Zielmetrik, deren Brute-Force-Optimierungsergebnisse im Ergebnisteil und den zugehörigen Vergleichen verwendet und dargestellt werden sollen. Standardtexte beziehen sich meist auf die Default-Optimierungsmetrik (Balanced Accuracy)." },
        methoden_studienanlage: { description: "Textvorschlag und Informationen zu Studiendesign, Ethik und der verwendeten Analyse-Software." },
        methoden_patientenkollektiv: { description: "Textvorschlag und Informationen zum Patientenkollektiv, dessen Charakteristika und der Datenbasis." },
        methoden_mrt_protokoll: { description: "Textvorschlag und Informationen zum verwendeten MRT-Protokoll und der Kontrastmittelgabe." },
        methoden_as_definition: { description: "Textvorschlag und Informationen zur Definition und Bewertung des Avocado Signs." },
        methoden_t2_definition: { description: "Textvorschlag und Informationen zur Definition und Bewertung der T2-Kriterien (Literatur-basiert und Brute-Force optimiert)." },
        methoden_referenzstandard: { description: "Textvorschlag und Informationen zum Referenzstandard (Histopathologie)." },
        methoden_statistische_analyse: { description: "Textvorschlag und Informationen zu den statistischen Analysemethoden, inklusive der Tests für diagnostische Güte und Vergleiche." },
        ergebnisse_patientencharakteristika: { description: "Textvorschlag und relevante Tabellen/Diagramme zu den Patientencharakteristika der Studienkohorte." },
        ergebnisse_as_performance: { description: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte des Avocado Signs für die verschiedenen Kollektive." },
        ergebnisse_literatur_t2_performance: { description: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte der implementierten Literatur-basierten T2-Kriteriensets." },
        ergebnisse_optimierte_t2_performance: { description: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte der Brute-Force optimierten T2-Kriteriensets (basierend auf der ausgewählten Zielmetrik)." },
        ergebnisse_vergleich_performance: { description: "Textvorschlag und relevante Tabellen/Diagramme zum statistischen Vergleich der diagnostischen Güte zwischen Avocado Sign und den verschiedenen T2-Kriteriensets." },
        referenzen: {description: "Automatisch generierte Liste der primären Literaturreferenzen, die in der Anwendung und den Texten verwendet werden."}
    },
    statMetrics: {
        sens: { name: {de: "Sensitivität", en: "Sensitivity"}, description: {de: "Sensitivität ([METHODE] vs. N): Anteil der tatsächlich positiven Fälle (N+), die durch die Methode [METHODE] korrekt als positiv erkannt wurden.<br><i>Formel: RP / (RP + FN)</i>", en: "Sensitivity ([METHOD] vs. N): Proportion of true positive cases (N+) correctly identified as positive by method [METHOD].<br><i>Formula: TP / (TP + FN)</i>"}, interpretation: {de: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der tatsächlich N+ Patienten korrekt (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].<hr><i>Bei kleinen Fallzahlen für RP oder FN ist das CI ggf. sehr breit.</i>", en: "Method [METHOD] correctly identified <strong>[VALUE]</strong> of actual N+ patients (95% CI per [METHOD_CI]: [LOWER] – [UPPER]) in cohort [KOLLEKTIV].<hr><i>If TP or FN counts are small, CI might be very wide.</i>"}},
        spez: { name: {de: "Spezifität", en: "Specificity"}, description: {de: "Spezifität ([METHODE] vs. N): Anteil der tatsächlich negativen Fälle (N-), die durch die Methode [METHODE] korrekt als negativ erkannt wurden.<br><i>Formel: RN / (RN + FP)</i>", en: "Specificity ([METHOD] vs. N): Proportion of true negative cases (N-) correctly identified as negative by method [METHOD].<br><i>Formula: TN / (TN + FP)</i>"}, interpretation: {de: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der tatsächlich N- Patienten korrekt (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].<hr><i>Bei kleinen Fallzahlen für RN oder FP ist das CI ggf. sehr breit.</i>", en: "Method [METHOD] correctly identified <strong>[VALUE]</strong> of actual N- patients (95% CI per [METHOD_CI]: [LOWER] – [UPPER]) in cohort [KOLLEKTIV].<hr><i>If TN or FP counts are small, CI might be very wide.</i>"}},
        ppv: { name: {de: "Pos. Prädiktiver Wert (PPV)", en: "Positive Predictive Value (PPV)"}, description: {de: "PPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem positiven Testergebnis durch Methode [METHODE] tatsächlich krank (N+) ist.<br><i>Formel: RP / (RP + FP)</i>", en: "PPV ([METHOD] vs. N): Probability that a patient with a positive test result by method [METHOD] is actually diseased (N+).<br><i>Formula: TP / (TP + FP)</i>"}, interpretation: {de: "Wenn die Methode [METHODE] ein positives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N+ Status bei <strong>[WERT]</strong> (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig.<hr><i>Bei kleinen Fallzahlen für RP oder FP ist das CI ggf. sehr breit.</i>", en: "If method [METHOD] yielded a positive result, the probability of an actual N+ status was <strong>[VALUE]</strong> (95% CI per [METHOD_CI]: [LOWER] – [UPPER]) in cohort [KOLLEKTIV]. This value is highly prevalence-dependent.<hr><i>If TP or FP counts are small, CI might be very wide.</i>"}},
        npv: { name: {de: "Neg. Prädiktiver Wert (NPV)", en: "Negative Predictive Value (NPV)"}, description: {de: "NPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem negativen Testergebnis durch Methode [METHODE] tatsächlich gesund (N-) ist.<br><i>Formel: RN / (RN + FN)</i>", en: "NPV ([METHOD] vs. N): Probability that a patient with a negative test result by method [METHOD] is actually healthy (N-).<br><i>Formula: TN / (TN + FN)</i>"}, interpretation: {de: "Wenn die Methode [METHODE] ein negatives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N- Status bei <strong>[WERT]</strong> (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig.<hr><i>Bei kleinen Fallzahlen für RN oder FN ist das CI ggf. sehr breit.</i>", en: "If method [METHOD] yielded a negative result, the probability of an actual N- status was <strong>[VALUE]</strong> (95% CI per [METHOD_CI]: [LOWER] – [UPPER]) in cohort [KOLLEKTIV]. This value is highly prevalence-dependent.<hr><i>If TN or FN counts are small, CI might be very wide.</i>"}},
        acc: { name: {de: "Accuracy (Gesamtgenauigkeit)", en: "Accuracy"}, description: {de: "Accuracy ([METHODE] vs. N): Anteil aller Fälle, die durch die Methode [METHODE] korrekt klassifiziert wurden.<br><i>Formel: (RP + RN) / Gesamtanzahl</i>", en: "Accuracy ([METHOD] vs. N): Proportion of all cases correctly classified by method [METHOD].<br><i>Formula: (TP + TN) / Total Number</i>"}, interpretation: {de: "Die Methode [METHODE] klassifizierte insgesamt <strong>[WERT]</strong> aller Patienten korrekt (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].<hr><i>Bei unausgeglichenen Gruppen (ungleiche Prävalenz von N+ und N-) kann die Accuracy irreführend sein.</i>", en: "Method [METHOD] correctly classified a total of <strong>[VALUE]</strong> of all patients (95% CI per [METHOD_CI]: [LOWER] – [UPPER]) in cohort [KOLLEKTIV].<hr><i>Accuracy can be misleading in imbalanced groups (unequal prevalence of N+ and N-).</i>"}},
        balAcc: { name: {de: "Balanced Accuracy", en: "Balanced Accuracy"}, description: {de: "Balanced Accuracy ([METHODE] vs. N): Der Mittelwert aus Sensitivität und Spezifität. Sinnvoll bei ungleichen Gruppengrößen (Prävalenz).<br><i>Formel: (Sensitivität + Spezifität) / 2</i>", en: "Balanced Accuracy ([METHOD] vs. N): The mean of sensitivity and specificity. Useful for imbalanced group sizes (prevalence).<br><i>Formula: (Sensitivity + Specificity) / 2</i>"}, interpretation: {de: "Die Balanced Accuracy der Methode [METHODE], die Sensitivität und Spezifität gleich gewichtet, betrug <strong>[WERT]</strong> (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].", en: "The Balanced Accuracy of method [METHOD], which equally weights sensitivity and specificity, was <strong>[VALUE]</strong> (95% CI per [METHOD_CI]: [LOWER] – [UPPER]) in cohort [KOLLEKTIV]."}},
        f1: { name: {de: "F1-Score", en: "F1-Score"}, description: {de: "F1-Score ([METHODE] vs. N): Das harmonische Mittel aus PPV (Precision) und Sensitivität (Recall). Ein Wert von 1 ist optimal.<br><i>Formel: 2 * (PPV * Sensitivität) / (PPV + Sensitivität)</i>", en: "F1-Score ([METHOD] vs. N): The harmonic mean of PPV (Precision) and Sensitivity (Recall). A value of 1 is optimal.<br><i>Formula: 2 * (PPV * Sensitivity) / (PPV + Sensitivity)</i>"}, interpretation: {de: "Der F1-Score für die Methode [METHODE], der Präzision und Sensitivität kombiniert, beträgt <strong>[WERT]</strong> (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].", en: "The F1-Score for method [METHOD], combining precision and sensitivity, is <strong>[VALUE]</strong> (95% CI per [METHOD_CI]: [LOWER] – [UPPER]) in cohort [KOLLEKTIV]."}},
        auc: { name: {de: "Area Under Curve (AUC)", en: "Area Under Curve (AUC)"}, description: {de: "AUC ([METHODE] vs. N): Fläche unter der Receiver Operating Characteristic (ROC)-Kurve. Repräsentiert die Fähigkeit einer Methode, zwischen positiven und negativen Fällen zu unterscheiden. 0.5 entspricht Zufall, 1.0 perfekter Trennung.<br><i>Für binäre Tests (wie AS oder eine feste T2-Regel) ist AUC = Balanced Accuracy.</i>", en: "AUC ([METHOD] vs. N): Area under the Receiver Operating Characteristic (ROC) curve. Represents a method's ability to discriminate between positive and negative cases. 0.5 corresponds to chance, 1.0 to perfect discrimination.<br><i>For binary tests (like AS or a fixed T2 rule), AUC = Balanced Accuracy.</i>"}, interpretation: {de: "Die AUC von <strong>[WERT]</strong> (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) deutet auf eine <strong>[BEWERTUNG]</strong> generelle Trennschärfe der Methode [METHODE] zwischen N+ und N- Fällen im Kollektiv [KOLLEKTIV] hin.", en: "An AUC of <strong>[VALUE]</strong> (95% CI per [METHOD_CI]: [LOWER] – [UPPER]) indicates a <strong>[EVALUATION]</strong> overall discriminative ability of method [METHOD] between N+ and N- cases in cohort [KOLLEKTIV]."}},
        mcnemar: { name: {de: "McNemar-Test", en: "McNemar's Test"}, description: {de: "Prüft auf einen signifikanten Unterschied in den diskordanten Paaren (Fälle, bei denen AS und [T2_SHORT_NAME] unterschiedliche Ergebnisse liefern) bei gepaarten Daten (d.h. beide Tests am selben Patienten).<br><i>Nullhypothese (H0): Anzahl(AS+ / [T2_SHORT_NAME]-) = Anzahl(AS- / [T2_SHORT_NAME]+). Ein kleiner p-Wert spricht gegen H0.</i>", en: "Tests for a significant difference in discordant pairs (cases where AS and [T2_SHORT_NAME] yield different results) in paired data (i.e., both tests on the same patient).<br><i>Null hypothesis (H0): Count(AS+ / [T2_SHORT_NAME]-) = Count(AS- / [T2_SHORT_NAME]+). A small p-value argues against H0.</i>"}, interpretation: {de: "Der McNemar-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die Fehlklassifizierungsraten (diskordante Paare) von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden.", en: "McNemar's test yielded a p-value of <strong>[P_VALUE] ([SIGNIFICANCE])</strong>. This suggests that the misclassification rates (discordant pairs) of AS and [T2_SHORT_NAME] in cohort [KOLLEKTIV] differ [SIGNIFICANCE_TEXT]."}},
        delong: { name: {de: "DeLong-Test", en: "DeLong's Test"}, description: {de: "Vergleicht zwei AUC-Werte von ROC-Kurven, die auf denselben (gepaarten) Daten basieren, unter Berücksichtigung der Kovarianz.<br><i>Nullhypothese (H0): AUC(AS) = AUC([T2_SHORT_NAME]). Ein kleiner p-Wert spricht gegen H0.</i>", en: "Compares two AUC values from ROC curves based on the same (paired) data, accounting for covariance.<br><i>Null hypothesis (H0): AUC(AS) = AUC([T2_SHORT_NAME]). A small p-value argues against H0.</i>"}, interpretation: {de: "Der DeLong-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die AUC-Werte (bzw. Balanced Accuracies) von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden.", en: "DeLong's test yielded a p-value of <strong>[P_VALUE] ([SIGNIFICANCE])</strong>. This suggests that the AUC values (or Balanced Accuracies) of AS and [T2_SHORT_NAME] in cohort [KOLLEKTIV] differ [SIGNIFICANCE_TEXT]."}},
        phi: { name: {de: "Phi-Koeffizient (φ)", en: "Phi Coefficient (φ)"}, description: {de: "Maß für die Stärke und Richtung des Zusammenhangs zwischen zwei binären Variablen (z.B. Vorhandensein von Merkmal '[MERKMAL]' und N-Status). Wertebereich von -1 bis +1. 0 bedeutet kein Zusammenhang.", en: "Measure of the strength and direction of association between two binary variables (e.g., presence of feature '[FEATURE]' and N-status). Ranges from -1 to +1. 0 means no association."}, interpretation: {de: "Der Phi-Koeffizient von <strong>[WERT]</strong> deutet auf einen <strong>[BEWERTUNG]</strong> Zusammenhang zwischen dem Merkmal '[MERKMAL]' und dem N-Status im Kollektiv [KOLLEKTIV] hin.", en: "The Phi coefficient of <strong>[VALUE]</strong> indicates a <strong>[EVALUATION]</strong> association between feature '[FEATURE]' and N-status in cohort [KOLLEKTIV]."}},
        rd: { name: {de: "Risk Difference (RD)", en: "Risk Difference (RD)"}, description: {de: "Absolute Differenz in der Wahrscheinlichkeit (Risiko) für N+ zwischen Patienten mit und ohne das Merkmal '[MERKMAL]'. RD = P(N+|Merkmal+) - P(N+|Merkmal-). Ein RD von 0 bedeutet kein Unterschied.", en: "Absolute difference in the probability (risk) of N+ between patients with and without feature '[FEATURE]'. RD = P(N+|Feature+) - P(N+|Feature-). An RD of 0 means no difference."}, interpretation: {de: "Das Risiko für einen N+ Status war bei Patienten mit dem Merkmal '[MERKMAL]' um <strong>[WERT]%</strong> absolut [HOEHER_NIEDRIGER] als bei Patienten ohne dieses Merkmal (95%-KI nach [METHOD_CI]: [LOWER]% – [UPPER]%) im Kollektiv [KOLLEKTIV].", en: "The risk of N+ status for patients with feature '[FEATURE]' was <strong>[VALUE]%</strong> absolutely [HIGHER_LOWER] than for patients without this feature (95% CI per [METHOD_CI]: [LOWER]% – [UPPER]%) in cohort [KOLLEKTIV]."}},
        or: { name: {de: "Odds Ratio (OR)", en: "Odds Ratio (OR)"}, description: {de: "Quotient der Odds für N+ bei Vorhandensein vs. Abwesenheit des Merkmals '[MERKMAL]'. OR = Odds(N+|Merkmal+) / Odds(N+|Merkmal-).<br>OR > 1: Erhöhte Odds für N+ bei Vorhandensein des Merkmals.<br>OR < 1: Verringerte Odds.<br>OR = 1: Keine Assoziation.", en: "Ratio of the odds of N+ given presence vs. absence of feature '[FEATURE]'. OR = Odds(N+|Feature+) / Odds(N+|Feature-).<br>OR > 1: Increased odds for N+ if feature is present.<br>OR < 1: Decreased odds.<br>OR = 1: No association."}, interpretation: {de: "Die Chance (Odds) für einen N+ Status war bei Patienten mit dem Merkmal '[MERKMAL]' um den Faktor <strong>[WERT]</strong> [FAKTOR_TEXT] im Vergleich zu Patienten ohne dieses Merkmal (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER], p=[P_WERT], [SIGNIFIKANZ]) im Kollektiv [KOLLEKTIV].", en: "The odds of N+ status for patients with feature '[FEATURE]' were <strong>[VALUE]</strong> times [FACTOR_TEXT] compared to patients without this feature (95% CI per [METHOD_CI]: [LOWER] – [UPPER], p=[P_VALUE], [SIGNIFICANCE]) in cohort [KOLLEKTIV]."}},
        fisher: { name: {de: "Fisher's Exact Test", en: "Fisher's Exact Test"}, description: {de: "Exakter Test zur Prüfung auf einen signifikanten Zusammenhang zwischen zwei kategorialen Variablen (z.B. Merkmal '[MERKMAL]' vs. N-Status). Geeignet auch für kleine Stichproben/geringe erwartete Häufigkeiten.<br><i>Nullhypothese (H0): Kein Zusammenhang.</i>", en: "Exact test to check for a significant association between two categorical variables (e.g., feature '[FEATURE]' vs. N-status). Suitable also for small samples/low expected frequencies.<br><i>Null hypothesis (H0): No association.</i>"}, interpretation: {de: "Der exakte Test nach Fisher ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>, was auf einen [SIGNIFIKANZ_TEXT] Zusammenhang zwischen dem Merkmal '[MERKMAL]' und dem N-Status im Kollektiv [KOLLEKTIV] hindeutet.", en: "Fisher's exact test yielded a p-value of <strong>[P_VALUE] ([SIGNIFICANCE])</strong>, suggesting a [SIGNIFICANCE_TEXT] association between feature '[FEATURE]' and N-status in cohort [KOLLEKTIV]."}},
        mannwhitney: { name: {de: "Mann-Whitney-U-Test", en: "Mann-Whitney U Test"}, description: {de: "Nichtparametrischer Test zum Vergleich der zentralen Tendenz (Median) einer kontinuierlichen Variablen (z.B. '[VARIABLE]') zwischen zwei unabhängigen Gruppen (z.B. N+ vs. N-).<br><i>Nullhypothese (H0): Kein Unterschied in den Medianen/Verteilungen.</i>", en: "Nonparametric test to compare the central tendency (median) of a continuous variable (e.g., '[VARIABLE]') between two independent groups (e.g., N+ vs. N-).<br><i>Null hypothesis (H0): No difference in medians/distributions.</i>"}, interpretation: {de: "Der Mann-Whitney-U-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies zeigt einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Variable '[VARIABLE]' zwischen N+ und N- Patienten im Kollektiv [KOLLEKTIV].", en: "The Mann-Whitney U test yielded a p-value of <strong>[P_VALUE] ([SIGNIFICANCE])</strong>. This indicates a [SIGNIFICANCE_TEXT] difference in the distribution of variable '[VARIABLE]' between N+ and N- patients in cohort [KOLLEKTIV]."}},
        ci95: { name: {de: "95% Konfidenzintervall (CI)", en: "95% Confidence Interval (CI)"}, description: {de: "Der Wertebereich, der den wahren (unbekannten) Populationsparameter der Metrik mit 95%iger Wahrscheinlichkeit überdeckt.<br><i>Methode: [METHOD_CI]</i>", en: "The range of values that covers the true (unknown) population parameter of the metric with 95% probability.<br><i>Method: [METHOD_CI]</i>"}, interpretation: {de: "Basierend auf den Daten liegt der wahre Wert der Metrik mit 95%iger Sicherheit zwischen [LOWER] und [UPPER].", en: "Based on the data, the true value of the metric lies between [LOWER] and [UPPER] with 95% confidence."}},
        konfusionsmatrix: { name: {de: "Konfusionsmatrix", en: "Confusion Matrix"}, description: {de: "Kreuztabelle, die die Klassifikationsergebnisse der Methode [METHODE] mit dem tatsächlichen N-Status vergleicht: Richtig Positive (RP), Falsch Positive (FP), Falsch Negative (FN), Richtig Negative (RN).", en: "Cross-tabulation comparing the classification results of method [METHOD] with the actual N-status: True Positives (TP), False Positives (FP), False Negatives (FN), True Negatives (TN)."} },
        accComp: { name: {de: "Accuracy Vergleich (ungepaart)", en: "Accuracy Comparison (unpaired)"}, description: {de: "Vergleicht die Accuracy der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels Fisher's Exact Test.<br><i>Nullhypothese (H0): Accuracy in Kollektiv1 = Accuracy in Kollektiv2.</i>", en: "Compares the accuracy of method [METHOD] between two independent cohorts ([KOLLEKTIV1] vs. [KOLLEKTIV2]) using Fisher's Exact Test.<br><i>Null hypothesis (H0): Accuracy in Cohort1 = Accuracy in Cohort2.</i>"}, interpretation: {de: "Der Unterschied in der Accuracy der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT]).", en: "The difference in accuracy of method [METHOD] between cohorts [KOLLEKTIV1] and [KOLLEKTIV2] is <strong>[SIGNIFICANCE_TEXT]</strong> (p=[P_VALUE])." } },
        aucComp: { name: {de: "AUC Vergleich (ungepaart)", en: "AUC Comparison (unpaired)"}, description: {de: "Vergleicht die AUC der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels eines Z-Tests basierend auf den Standardfehlern der AUCs.<br><i>Nullhypothese (H0): AUC in Kollektiv1 = AUC in Kollektiv2.</i>", en: "Compares the AUC of method [METHOD] between two independent cohorts ([KOLLEKTIV1] vs. [KOLLEKTIV2]) using a Z-test based on the standard errors of the AUCs.<br><i>Null hypothesis (H0): AUC in Cohort1 = AUC in Cohort2.</i>"}, interpretation: {de: "Der Unterschied in der AUC der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT]).", en: "The difference in AUC of method [METHOD] between cohorts [KOLLEKTIV1] and [KOLLEKTIV2] is <strong>[SIGNIFICANCE_TEXT]</strong> (p=[P_VALUE])." } },
        defaultP: { interpretation: {de: `Der berechnete p-Wert beträgt <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Bei einem Signifikanzniveau von ${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,2).replace('.',',')} ist das Ergebnis <strong>[SIGNIFIKANZ_TEXT]</strong>.`, en: `The calculated p-value is <strong>[P_VALUE] ([SIGNIFICANCE_SYMBOL])</strong>. At a significance level of ${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL}, the result is <strong>[SIGNIFICANCE_TEXT]</strong>.`} },
        size_mwu: {name: {de: "LK Größe MWU", en: "LN Size MWU"}, description: {de: "Vergleich der medianen Lymphknotengrößen zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test. Hier werden alle Lymphknoten der Patienten berücksichtigt, nicht Patienten-Level-Status.", en: "Comparison of median lymph node sizes between N+ and N- patients using Mann-Whitney U test. All lymph nodes from patients are considered here, not patient-level status."}, interpretation: {de: "Der Mann-Whitney-U-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies zeigt einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Lymphknotengrößen zwischen den Lymphknoten von N+ und N- Patienten im Kollektiv [KOLLEKTIV].", en: "The Mann-Whitney U test yielded a p-value of <strong>[P_VALUE] ([SIGNIFICANCE])</strong>. This indicates a [SIGNIFICANCE_TEXT] difference in the distribution of lymph node sizes between lymph nodes of N+ and N- patients in cohort [KOLLEKTIV]."}}}
};

const TOOLTIP_CONTENT = (() => {
    const lang = state && typeof state.getCurrentPublikationLang === 'function' ? state.getCurrentPublikationLang() : APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG;
    if (lang === 'en') {
        let mergedTooltips = JSON.parse(JSON.stringify(TOOLTIP_CONTENT_DE));
        for (const key in TOOLTIP_CONTENT_EN) {
            if (TOOLTIP_CONTENT_EN.hasOwnProperty(key)) {
                if (typeof TOOLTIP_CONTENT_EN[key] === 'object' && mergedTooltips[key] && typeof mergedTooltips[key] === 'object') {
                    for (const subKey in TOOLTIP_CONTENT_EN[key]) {
                         if (TOOLTIP_CONTENT_EN[key].hasOwnProperty(subKey)) {
                            if (typeof TOOLTIP_CONTENT_EN[key][subKey] === 'object' && mergedTooltips[key][subKey] && typeof mergedTooltips[key][subKey] === 'object') {
                                mergedTooltips[key][subKey] = { ...mergedTooltips[key][subKey], ...TOOLTIP_CONTENT_EN[key][subKey] };
                            } else {
                                mergedTooltips[key][subKey] = TOOLTIP_CONTENT_EN[key][subKey];
                            }
                         }
                    }
                } else {
                     mergedTooltips[key] = TOOLTIP_CONTENT_EN[key];
                }
            }
        }
        return mergedTooltips;
    }
    return TOOLTIP_CONTENT_DE;
})();


function getUITexts() {
    const lang = state && typeof state.getCurrentPublikationLang === 'function' ? state.getCurrentPublikationLang() : APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG;
    if (lang === 'en') {
        return UI_TEXTS_EN;
    }
    return UI_TEXTS_DE;
}

deepFreeze(UI_TEXTS_DE);
deepFreeze(UI_TEXTS_EN);
deepFreeze(TOOLTIP_CONTENT_DE);
deepFreeze(TOOLTIP_CONTENT_EN);
deepFreeze(TOOLTIP_CONTENT);
