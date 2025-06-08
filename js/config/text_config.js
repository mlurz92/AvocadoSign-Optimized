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
        tableHeaderSet: "Methode / Kriteriensatz",
        tableHeaderSens: "Sens.",
        tableHeaderSpez: "Spez.",
        tableHeaderPPV: "PPV",
        tableHeaderNPV: "NPV",
        tableHeaderAcc: "Acc.",
        tableHeaderAUC: "AUC/BalAcc"
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
            <h4>Willkommen zum <strong>Lymphknoten T2 - Avocado Sign Analyse Tool v${APP_CONFIG.APP_VERSION}</strong>.</h4>
            <p>Diese Anwendung dient der explorativen Analyse und dem wissenschaftlichen Vergleich der diagnostischen Leistung des "Avocado Signs" gegenüber T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status) bei Patienten mit Rektumkarzinom.</p>
            <h6>Allgemeine Bedienung</h6>
            <ul>
                <li><strong>Kollektiv-Auswahl (Header):</strong> Wählen Sie hier das globale Patientenkollektiv (<strong>Gesamt</strong>, <strong>Direkt OP</strong>, <strong>nRCT</strong>). Diese Auswahl beeinflusst alle Analysen in der gesamten Anwendung.</li>
                <li><strong>Tab-Navigation:</strong> Wechseln Sie über die Reiter zwischen den Hauptfunktionsbereichen.</li>
                <li><strong>Tooltips:</strong> Viele Elemente sind mit detaillierten Tooltips versehen, die bei Mausüberfahrung Erklärungen bieten.</li>
            </ul>
            <h6>Funktionen der Tabs</h6>
            <ul>
                <li><strong>Daten:</strong> Zeigt detaillierte, sortierbare Patientendaten an. Reihen können aufgeklappt werden, um T2-Lymphknotenmerkmale zu sehen.</li>
                <li><strong>Auswertung:</strong> Das Kernstück zur interaktiven Definition und Anwendung von T2-Kriterien. Hier finden Sie auch die Brute-Force-Optimierung, um die beste Kriterienkombination für eine gewählte Zielmetrik zu finden. <strong>Änderungen an Kriterien müssen hier immer explizit mit "Anwenden & Speichern" übernommen werden.</strong></li>
                <li><strong>Statistik:</strong> Bietet umfassende statistische Auswertungen (Gütekriterien, Vergleiche, Assoziationen) basierend auf den aktuell angewendeten Kriterien. Erlaubt den Vergleich zweier spezifischer Kollektive.</li>
                <li><strong>Präsentation:</strong> Bereitet Ergebnisse in einem für Präsentationen optimierten Format auf, fokussiert auf den Vergleich des Avocado Signs mit T2-Kriterien.</li>
                <li><strong>Publikation:</strong> Generiert automatisch Textvorschläge und Materialien (Tabellen, Abbildungen) für eine wissenschaftliche Publikation, ausgerichtet auf die Anforderungen des Journals *Radiology*.</li>
                <li><strong>Export:</strong> Ermöglicht den Download von Rohdaten, Analyseergebnissen, Tabellen und Diagrammen in verschiedenen Formaten (CSV, MD, PNG, SVG etc.).</li>
            </ul>
             <h6>Wichtiger Hinweis</h6>
            <p class="small">Diese Anwendung ist ein Forschungswerkzeug und ausdrücklich <strong>nicht</strong> für die klinische Diagnostik oder Therapieentscheidungen im Einzelfall vorgesehen. Alle Ergebnisse sind im Kontext der Studienlimitationen (retrospektiv, monozentrisch) zu interpretieren.</p>
        `
    }
};

const TOOLTIP_CONTENT = deepFreeze({
    kurzanleitungButton: { description: "Zeigt eine Kurzanleitung und wichtige Hinweise zur Bedienung der Anwendung." },
    kollektivButtons: { description: "Wählen Sie das Patientenkollektiv für die Analyse aus: <strong>Gesamt</strong> (alle Patienten), <strong>Direkt OP</strong> (nur primär Operierte ohne Vorbehandlung) oder <strong>nRCT</strong> (nur neoadjuvant Radiochemotherapeutisch Vorbehandelte). Die Auswahl filtert die Datenbasis für alle Tabs." },
    headerStats: {
        kollektiv: "Aktuell betrachtetes Patientenkollektiv.",
        anzahlPatienten: "Gesamtzahl der Patienten im ausgewählten Kollektiv.",
        statusN: "Anteil der Patienten mit positivem (+) vs. negativem (-) histopathologischem Lymphknotenstatus (N-Status, Pathologie-Referenzstandard) im ausgewählten Kollektiv.",
        statusAS: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß Avocado Sign (AS) Vorhersage (basierend auf T1KM-MRT) im ausgewählten Kollektiv.",
        statusT2: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß den aktuell <strong>angewendeten und gespeicherten</strong> T2-Kriterien (siehe Auswertungstab) für das ausgewählte Kollektiv."
    },
    mainTabs: {
        daten: "Zeigt die Liste aller Patientendaten im ausgewählten Kollektiv mit Basisinformationen und Status (N/AS/T2). Ermöglicht das Sortieren und Aufklappen von Details zu T2-Lymphknotenmerkmalen.",
        auswertung: "Zentraler Tab zur Definition von T2-Kriterien, Anzeige eines deskriptiven Dashboards, Durchführung der Brute-Force-Optimierung und detaillierte Auswertungsergebnisse pro Patient basierend auf den angewendeten Kriterien.",
        statistik: "Bietet detaillierte statistische Analysen (Gütekriterien, Vergleiche, Assoziationen) für das global gewählte Kollektiv oder einen Vergleich zweier spezifisch wählbarer Kollektive. Alle Konfidenzintervalle (CI) sind 95%-CIs.",
        praesentation: "Stellt Analyseergebnisse in einem aufbereiteten, präsentationsfreundlichen Format dar, fokussiert auf den Vergleich des Avocado Signs mit T2-basierten Ansätzen (angewandt oder Literatur).",
        publikation: "Generiert Textvorschläge und Materialien für wissenschaftliche Publikationen, spezifisch ausgerichtet auf die Anforderungen des Journals *Radiology*.",
        export: "Bietet umfangreiche Optionen zum Herunterladen von Rohdaten, Analyseergebnissen, Tabellen und Diagrammen in verschiedenen Dateiformaten."
    },
    datenTable: {
        nr: "Fortlaufende Nummer des Patienten.",
        name: "Nachname des Patienten (anonymisiert/kodiert).",
        vorname: "Vorname des Patienten (anonymisiert/kodiert).",
        geschlecht: "Geschlecht des Patienten (m: männlich, w: weiblich, unbekannt).",
        alter: "Alter des Patienten zum Zeitpunkt der MRT-Untersuchung in Jahren.",
        therapie: "Angewandte Therapie vor der Operation (nRCT: neoadjuvante Radiochemotherapie, direkt OP: keine Vorbehandlung).",
        n_as_t2: "Direkter Statusvergleich: N (Pathologie-Referenz), AS (Avocado Sign), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung.",
        bemerkung: "Zusätzliche klinische oder radiologische Bemerkungen zum Patientenfall, falls vorhanden.",
        expandAll: "Öffnet oder schließt die Detailansicht zu den T2-gewichteten Lymphknotenmerkmalen für alle Patienten in der aktuellen Tabellenansicht.",
        expandRow: "Klicken Sie hier oder auf den Pfeil-Button, um Details zu den morphologischen Eigenschaften der T2-gewichteten Lymphknoten dieses Patienten anzuzeigen/auszublenden."
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
    t2Logic: { description: `Logische Verknüpfung der aktiven T2-Kriterien: <strong>UND</strong> (Ein Lymphknoten ist nur positiv, wenn ALLE aktivierten Kriterien erfüllt sind). <strong>ODER</strong> (Ein Lymphknoten ist positiv, wenn MINDESTENS EIN aktiviertes Kriterium erfüllt ist).` },
    t2Size: { description: `Größenkriterium (Kurzachse): Lymphknoten mit einem Durchmesser <strong>größer oder gleich (≥)</strong> dem eingestellten Schwellenwert gelten als suspekt. Einstellbarer Bereich: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} - ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm.` },
    t2Form: { description: "Formkriterium: Wählen Sie, welche Form ('rund' oder 'oval') als suspekt gilt." },
    t2Kontur: { description: "Konturkriterium: Wählen Sie, welche Kontur ('scharf' berandet oder 'irregulär') als suspekt gilt." },
    t2Homogenitaet: { description: "Homogenitätskriterium: Wählen Sie, ob ein 'homogenes' oder 'heterogenes' Binnensignal auf T2w als suspekt gilt." },
    t2Signal: { description: "Signalkriterium: Wählen Sie, welche T2-Signalintensität ('signalarm', 'intermediär' oder 'signalreich') als suspekt gilt." },
    t2Actions: {
        reset: "Setzt die Logik und alle Kriterien auf die definierten Standardeinstellungen zurück. Die Änderungen müssen danach noch angewendet werden.",
        apply: "Wendet die aktuell eingestellten T2-Kriterien und die Logik auf den gesamten Datensatz an und speichert diese für die Sitzung. Dies aktualisiert alle abhängigen Analysen."
    },
    t2CriteriaCard: { unsavedIndicator: "<strong>Achtung:</strong> Es gibt nicht angewendete Änderungen an den T2-Kriterien. Klicken Sie auf 'Anwenden & Speichern', um die Ergebnisse zu aktualisieren." },
    t2MetricsOverview: {
        cardTitle: "Kurzübersicht der diagnostischen Güte (T2 vs. N) für Kollektiv [KOLLEKTIV].",
        sens: "Sensitivität (T2 vs. N): Anteil der N+ Fälle, die von den T2-Kriterien korrekt als positiv erkannt wurden.",
        spez: "Spezifität (T2 vs. N): Anteil der N- Fälle, die von den T2-Kriterien korrekt als negativ erkannt wurden.",
        ppv: "Positiver Prädiktiver Wert (PPV, T2 vs. N): Wahrscheinlichkeit, dass ein T2+ Fall tatsächlich N+ ist.",
        npv: "Negativer Prädiktiver Wert (NPV, T2 vs. N): Wahrscheinlichkeit, dass ein T2- Fall tatsächlich N- ist.",
        acc: "Accuracy (T2 vs. N): Gesamtanteil der korrekt klassifizierten Fälle.",
        balAcc: "Balanced Accuracy (T2 vs. N): Mittelwert aus Sensitivität und Spezifität.",
        f1: "F1-Score (T2 vs. N): Harmonisches Mittel aus PPV und Sensitivität.",
        auc: "AUC (T2 vs. N): Fläche unter der ROC-Kurve (äquivalent zu Balanced Accuracy für binäre Tests)."
     },
    bruteForceMetric: { description: "Wählen Sie die Zielmetrik für die Brute-Force-Optimierung.<br><strong>Balanced Accuracy:</strong> (Sens+Spez)/2; gut bei ungleichen Klassengrößen.<br><strong>F1-Score:</strong> Harmonisches Mittel aus PPV & Sensitivität." },
    bruteForceStart: { description: "Startet die Brute-Force-Suche nach der T2-Kriterienkombination, die die gewählte Zielmetrik im aktuellen Kollektiv maximiert." },
    bruteForceInfo: { description: "Status des Optimierungs-Workers und aktuelles Analysekollektiv: <strong>[KOLLEKTIV_NAME]</strong>." },
    bruteForceProgress: { description: "Fortschritt der laufenden Optimierung: Getestete Kombinationen / Gesamtanzahl ([TOTAL])." },
    bruteForceResult: {
        description: "Bestes Ergebnis der Optimierung für Kollektiv ([N_GESAMT] Pat., N+: [N_PLUS], N-: [N_MINUS]).",
        kollektivStats: "Statistik des für diese Optimierung verwendeten Kollektivs."
    },
    bruteForceDetailsButton: { description: "Öffnet ein Fenster mit den Top 10 Ergebnissen und weiteren Details zur Optimierung." },
    bruteForceModal: { exportButton: "Exportiert den detaillierten Bericht der Brute-Force-Optimierung als Textdatei (.txt)." },
    statistikToggleVergleich: { description: "Schaltet zwischen der Einzelansicht für das global gewählte Kollektiv und der Vergleichsansicht zweier spezifischer Kollektive um." },
    criteriaComparisonTable: {
        cardTitle: "Leistungsvergleich verschiedener Methoden für das globale Kollektiv <strong>[GLOBAL_KOLLEKTIV_NAME]</strong>. Literatur-Sets werden auf ihrem spezifischen Zielkollektiv evaluiert (in Klammern angegeben)."
    },
    praesentation: {
        viewSelect: { description: "Wählen Sie die Ansicht: <strong>Avocado Sign (Performance)</strong> für eine Übersicht der AS-Performance oder <strong>AS vs. T2 (Vergleich)</strong> für einen direkten Vergleich von AS mit einer auswählbaren T2-Kriterienbasis." },
        studySelect: { description: "Wählen Sie eine T2-Kriterienbasis für den Vergleich mit dem Avocado Sign. Das globale Kollektiv passt sich ggf. an das Zielkollektiv der Studie an." },
        t2BasisInfoCard: {
            title: "Informationen zur T2-Vergleichsbasis",
            description: "Zeigt Details zu den aktuell für den Vergleich mit AS ausgewählten T2-Kriterien. Die Performance-Werte beziehen sich auf das angegebene Vergleichskollektiv.",
            reference: "Studienreferenz oder Quelle der Kriterien.",
            patientCohort: "Ursprüngliche Studienkohorte oder aktuelles Vergleichskollektiv.",
            investigationType: "Art der Untersuchung in der Originalstudie.",
            focus: "Hauptfokus der Originalstudie.",
            keyCriteriaSummary: "Zusammenfassung der T2-Kriterien und Logik."
        },
        downloadPerformanceCSV: { description: "Lädt die Tabelle der diagnostischen Güte als CSV-Datei (.csv) herunter." },
        downloadPerformanceMD: { description: "Lädt die Tabelle der diagnostischen Güte als Markdown-Datei (.md) herunter." },
        downloadCompTestsMD: { description: "Lädt die Tabelle der statistischen Vergleichstests als Markdown-Datei (.md) herunter." },
        downloadCompTableMD: { description: "Lädt die Tabelle mit den verglichenen Metrikwerten als Markdown-Datei (.md) herunter." },
        downloadCompChartPNG: { description: "Lädt das Vergleichs-Balkendiagramm als PNG-Datei herunter." },
        downloadCompChartSVG: { description: "Lädt das Vergleichs-Balkendiagramm als SVG-Datei herunter." },
        downloadTablePNG: { description: "Lädt die angezeigte Tabelle als PNG-Bilddatei herunter." },
        downloadCompTablePNG: { description: "Lädt die Vergleichs-Metrik-Tabelle als PNG-Datei herunter." }
    },
    exportTab: {
        singleExports: "Einzelexporte",
        exportPackages: "Export-Pakete (.zip)",
        description: "Exportiert Analyseergebnisse basierend auf dem Kollektiv <strong>[KOLLEKTIV]</strong> und den aktuell angewendeten T2-Kriterien.",
        statsCSV: { description: "Detaillierte Statistik-Metriken als CSV-Datei.", type: 'STATS_CSV', ext: "csv" },
        bruteForceTXT: { description: "Bericht der Brute-Force-Optimierung als Textdatei (.txt).", type: 'BRUTEFORCE_TXT', ext: "txt" },
        deskriptivMD: { description: "Deskriptive Statistik als Markdown (.md).", type: 'DESKRIPTIV_MD', ext: "md" },
        datenMD: { description: "Datenliste (Daten-Tab) als Markdown (.md).", type: 'DATEN_MD', ext: "md" },
        auswertungMD: { description: "Auswertungstabelle als Markdown (.md).", type: 'AUSWERTUNG_MD', ext: "md" },
        filteredDataCSV: { description: "Rohdaten des Kollektivs als CSV-Datei.", type: 'FILTERED_DATA_CSV', ext: "csv" },
        comprehensiveReportHTML: { description: "Umfassender Analysebericht als druckbare HTML-Datei.", type: 'COMPREHENSIVE_REPORT_HTML', ext: "html" },
        pngZIP: { description: "Alle aktuell sichtbaren Diagramme & Tabellen als PNG-Dateien (ZIP-Archiv).", type: 'PNG_ZIP', ext: "zip"},
        svgZIP: { description: "Alle aktuell sichtbaren Diagramme als SVG-Dateien (ZIP-Archiv).", type: 'SVG_ZIP', ext: "zip"},
        chartSinglePNG: { description: "Diagramm '{ChartName}' als PNG-Datei.", type: 'CHART_SINGLE_PNG', ext: "png"},
        chartSingleSVG: { description: "Diagramm '{ChartName}' als SVG-Datei.", type: 'CHART_SINGLE_SVG', ext: "svg"},
        tableSinglePNG: { description: "Tabelle '{TableName}' als PNG-Bilddatei.", type: 'TABLE_PNG_EXPORT', ext: "png"},
        allZIP: { description: "Alle verfügbaren Einzeldateien (CSV, MD, TXT, HTML) in einem ZIP-Archiv.", type: 'ALL_ZIP', ext: "zip"},
        csvZIP: { description: "Alle verfügbaren CSV-Dateien in einem ZIP-Archiv.", type: 'CSV_ZIP', ext: "zip"},
        mdZIP: { description: "Alle verfügbaren Markdown-Dateien in einem ZIP-Archiv.", type: 'MD_ZIP', ext: "md"}
    },
    publikationTabTooltips: {
        spracheSwitch: { description: "Wechselt die Sprache der generierten Texte zwischen Deutsch und Englisch." },
        sectionSelect: { description: "Wählen Sie einen Publikationsabschnitt." },
        bruteForceMetricSelect: { description: "Wählen Sie die Zielmetrik, deren Brute-Force-Ergebnisse im Text referenziert werden sollen." },
        abstract: { description: "Abstract & Key Results" },
        introduction: { description: "Einleitung" },
        methoden: { description: "Material und Methoden" },
        ergebnisse: { description: "Ergebnisse" },
        discussion: { description: "Diskussion" },
        references: { description: "Referenzen" }
    },
    statMetrics: {
        sens: { name: "Sensitivität", description: "Anteil der kranken Personen (N+), die von der Methode [METHODE] korrekt als positiv erkannt wurden.", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der N+ Patienten korrekt (95%-KI: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]."},
        spez: { name: "Spezifität", description: "Anteil der gesunden Personen (N-), die von der Methode [METHODE] korrekt als negativ erkannt wurden.", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der N- Patienten korrekt (95%-KI: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]."},
        ppv: { name: "Pos. Prädiktiver Wert (PPV)", description: "Wahrscheinlichkeit, dass bei einem positiven Testergebnis durch [METHODE] tatsächlich eine Erkrankung (N+) vorliegt.", interpretation: "Bei einem positiven Ergebnis durch [METHODE] lag die Wahrscheinlichkeit für N+ bei <strong>[WERT]</strong> (95%-KI: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]."},
        npv: { name: "Neg. Prädiktiver Wert (NPV)", description: "Wahrscheinlichkeit, dass bei einem negativen Testergebnis durch [METHODE] tatsächlich keine Erkrankung (N-) vorliegt.", interpretation: "Bei einem negativen Ergebnis durch [METHODE] lag die Wahrscheinlichkeit für N- bei <strong>[WERT]</strong> (95%-KI: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]."},
        acc: { name: "Accuracy (Gesamtgenauigkeit)", description: "Anteil aller Fälle, die durch die Methode [METHODE] korrekt klassifiziert wurden.", interpretation: "Die Methode [METHODE] klassifizierte <strong>[WERT]</strong> aller Patienten korrekt (95%-KI: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]."},
        balAcc: { name: "Balanced Accuracy", description: "Mittelwert aus Sensitivität und Spezifität. Sinnvoll bei ungleichen Gruppengrößen.", interpretation: "Die Balanced Accuracy der Methode [METHODE] betrug <strong>[WERT]</strong> (95%-KI: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]."},
        f1: { name: "F1-Score", description: "Harmonisches Mittel aus PPV (Precision) und Sensitivität (Recall).", interpretation: "Der F1-Score für die Methode [METHODE] beträgt <strong>[WERT]</strong> (95%-KI: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]."},
        auc: { name: "Area Under Curve (AUC)", description: "Maß für die generelle Trennschärfe einer Methode. 0.5=Zufall, 1.0=perfekt. Für binäre Tests wie hier äquivalent zur Balanced Accuracy.", interpretation: "Die AUC von <strong>[WERT]</strong> (95%-KI: [LOWER] – [UPPER]) deutet auf eine <strong>[BEWERTUNG]</strong> Trennschärfe der Methode [METHODE] im Kollektiv [KOLLEKTIV] hin."},
        mcnemar: { description: "Prüft auf signifikante Unterschiede in den Fehlklassifizierungen zwischen zwei gepaarten Tests (AS vs. [T2_SHORT_NAME]).", interpretation: "Der McNemar-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Die Fehlklassifizierungsraten von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] unterscheiden sich [SIGNIFIKANZ_TEXT]."},
        delong: { description: "Vergleicht zwei AUC-Werte von gepaarten Daten.", interpretation: "Der DeLong-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Die AUC-Werte von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] unterscheiden sich [SIGNIFIKANZ_TEXT]."},
        phi: { description: "Maß für die Stärke des Zusammenhangs zwischen zwei binären Variablen.", interpretation: "Der Phi-Koeffizient von <strong>[WERT]</strong> deutet auf einen <strong>[STAERKE]</strong> Zusammenhang zwischen '[MERKMAL]' und N-Status im Kollektiv [KOLLEKTIV] hin."},
        rd: { description: "Absolute Differenz im Risiko für N+ zwischen Gruppen mit und ohne das Merkmal '[MERKMAL]'.", interpretation: "Das Risiko für N+ war bei Patienten mit '[MERKMAL]' um <strong>[WERT]%</strong> absolut [HOEHER_NIEDRIGER] (95%-KI: [LOWER]% – [UPPER]%) im Kollektiv [KOLLEKTIV]."},
        or: { description: "Quotient der Odds für N+ bei Vorhandensein vs. Abwesenheit des Merkmals '[MERKMAL]'.", interpretation: "Die Chance (Odds) für N+ war bei Patienten mit '[MERKMAL]' um den Faktor <strong>[WERT]</strong> [FAKTOR_TEXT] (95%-KI: [LOWER] – [UPPER], p=[P_WERT]) im Kollektiv [KOLLEKTIV]."},
        fisher: { description: "Exakter Test auf Zusammenhang zwischen zwei kategorialen Variablen.", interpretation: "Der exakte Test nach Fisher ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>, was auf einen [SIGNIFIKANZ_TEXT] Zusammenhang zwischen '[MERKMAL]' und dem N-Status im Kollektiv [KOLLEKTIV] hindeutet."},
        mannwhitney: { description: "Nichtparametrischer Test zum Vergleich der zentralen Tendenz (Median) einer kontinuierlichen Variablen zwischen zwei Gruppen.", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies zeigt einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Variable '[VARIABLE]' zwischen N+ und N- Patienten im Kollektiv [KOLLEKTIV]."},
        defaultP: { interpretation: `Der berechnete p-Wert beträgt <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Das Ergebnis ist <strong>[SIGNIFIKANZ_TEXT]</strong>.`},
        size_mwu: {name: "LK Größe MWU", description: "Vergleich der medianen Lymphknotengrößen zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test.", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies zeigt einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der LK-Größen zwischen N+ und N- Patienten im Kollektiv [KOLLEKTIV]."}
    }
});
