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
        'applied_criteria': 'Aktuell gewählte T2 Kriterien'
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
            methoden: 'Methoden',
            ergebnisse: 'Ergebnisse',
            diskussion: 'Diskussion (Platzhalter)',
            einleitung: 'Einleitung (Platzhalter)',
            abstract: 'Abstract (Platzhalter)',
            referenzen: 'Referenzen (Basis)'
        },
        bruteForceMetricSelectLabel: 'Optimierungsmetrik für T2 (BF):'
    },
    chartTitles: {
        ageDistribution: 'Altersverteilung',
        genderDistribution: 'Geschlechterverteilung',
        therapyDistribution: 'Therapieverfahren',
        statusN: 'N-Status (Pathologie)',
        statusAS: 'AS-Status (Avocado Sign)',
        statusT2: 'T2-Status (Aktuelle Kriterien)',
        comparisonBar: 'Vergleich: AS vs. {T2Name}',
        rocCurve: 'ROC-Kurve: {Method}',
        asPerformance: 'AS Performance (Aktuelles Kollektiv)',
        lkSizeDistribution: 'Lymphknotengrößen-Verteilung (T2)',
        forestPlotAssociations: 'Assoziationen mit N-Status (Forest Plot)'
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
        shortAxisDiameter: 'Kurzachsendurchmesser (mm)',
        oddsRatio: 'Odds Ratio (95% CI)',
        riskDifference: 'Risikodifferenz (%, 95% CI)'
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
        malignantLN: 'Maligne LK',
        lkPathoPos: 'Patho. N+ Lymphknoten',
        lkPathoNeg: 'Patho. N- Lymphknoten'
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
        showAppliedLabel: "Aktuell gewählte Kriterien anzeigen"
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
        svgLabel: "Als SVG herunterladen",
        dpiSelectLabel: "Auflösung (PNG):"
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
                <li><strong>Tooltips:</strong> Fahren Sie mit der Maus über Elemente für detaillierte Erklärungen. Die meisten statistischen Werte bieten Interpretationshilfen bei Mouseover.</li>
                <li><strong>Statistische Signifikanz:</strong> p-Werte werden mit Symbolen versehen: * p < 0.05, ** p < 0.01, *** p < 0.001. Das Signifikanzniveau ist α = ${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, 2).replace('.', ',')}.</li>
            </ul>
            <h6>Wichtige Tabs:</h6>
            <ul>
                <li><strong>Daten:</strong> Zeigt Patientendaten. Reihen sind für T2-LK-Details aufklappbar.</li>
                <li><strong>Auswertung:</strong>
                    <ul>
                        <li>Definieren Sie hier <strong>T2-Malignitätskriterien</strong> (Größe, Form etc.) und die <strong>Logik</strong> (UND/ODER). Eine Vorschau der aktiven Kriterienkombination wird angezeigt.</li>
                        <li>Klicken Sie <strong>"Anwenden & Speichern"</strong>, um Ihre T2-Definitionen auf den Datensatz anzuwenden und die Ergebnisse in allen Tabs zu aktualisieren. Ungespeicherte Änderungen werden markiert.</li>
                        <li>Starten Sie die <strong>Brute-Force-Optimierung</strong>, um datengetrieben die besten T2-Kriterien für eine Zielmetrik zu finden. Detaillierte Ergebnisse (Top 10 mit TP/FP/FN/TN) sind im Modal einsehbar.</li>
                    </ul>
                </li>
                <li><strong>Statistik:</strong> Detaillierte statistische Analysen. Wählen Sie "Einzelansicht" oder "Vergleich Aktiv" für Kollektivvergleiche. Enthält jetzt auch Likelihood Ratios und erweiterte Vergleichstests. Konfidenzintervalle (CI) sind 95%-CIs. Eine explorative Analyse auf Lymphknoten-Ebene ist ebenfalls verfügbar.</li>
                <li><strong>Präsentation:</strong> Aufbereitete Ergebnisse, ideal für Vorträge.</li>
                <li><strong>Publikation:</strong> Generiert Textvorschläge und Materialien für eine wissenschaftliche Publikation (Methoden & Ergebnisse). Orientiert sich an den bereitgestellten Originalarbeiten.</li>
                <li><strong>Export:</strong> Lädt Analyseergebnisse und Daten herunter. Bietet ein "One-Click" Publikations-Chart-Paket und verbesserte Diagramm-Exportoptionen (DPI-Auswahl für PNG).</li>
            </ul>
             <h6>T2-Kriterien Anwendung:</h6>
            <p class="small">Der Status 'T2' in den Tabellen, die T2-bezogenen Statistiken und Diagramme (außer bei expliziter Auswahl einer Literaturstudie im Präsentationstab) basieren <strong>immer</strong> auf den zuletzt im 'Auswertung'-Tab <strong>definierten UND angewendeten</strong> Kriterien.</p>
            <h6>Referenzstandard:</h6>
            <p class="small">Der pathologische N-Status dient als Referenzstandard für alle diagnostischen Güteberechnungen.</p>
            <p class="small">Diese Anwendung ist ein Forschungswerkzeug und nicht für die klinische Diagnostik vorgesehen.</p>
        `
    }
};

const TOOLTIP_CONTENT = {
    kurzanleitungButton: { description: "Zeigt eine Kurzanleitung und wichtige Hinweise zur Bedienung der Anwendung (Version " + APP_CONFIG.APP_VERSION + ")." },
    kollektivButtons: { description: "Wählen Sie das Patientenkollektiv für die Analyse aus: <strong>Gesamt</strong> (alle Patienten), <strong>Direkt OP</strong> (nur primär Operierte ohne Vorbehandlung) oder <strong>nRCT</strong> (nur neoadjuvant Radiochemotherapeutisch Vorbehandelte). Die Auswahl filtert die Datenbasis für alle Tabs und wird für zukünftige Sitzungen gespeichert." },
    headerStats: {
        kollektiv: "Aktuell betrachtetes Patientenkollektiv.",
        anzahlPatienten: "Gesamtzahl der Patienten im ausgewählten Kollektiv.",
        statusN: "Anteil der Patienten mit positivem (+) histopathologischem Lymphknotenstatus (N-Status, Pathologie-Referenzstandard) im ausgewählten Kollektiv.",
        statusAS: "Anteil der Patienten mit positivem (+) Lymphknotenstatus gemäß Avocado Sign (AS) Vorhersage (basierend auf T1KM-MRT) im ausgewählten Kollektiv.",
        statusT2: "Anteil der Patienten mit positivem (+) Lymphknotenstatus gemäß den aktuell **angewendeten und gespeicherten** T2-Kriterien (siehe Auswertungstab) für das ausgewählte Kollektiv."
    },
    mainTabs: {
        daten: "Zeigt die Liste aller Patientendaten im ausgewählten Kollektiv mit Basisinformationen und Status (N/AS/T2). Ermöglicht das Sortieren und Aufklappen von Details zu T2-Lymphknotenmerkmalen. Inklusive Filter- und Spaltenauswahlfunktionen.",
        auswertung: "Zentraler Tab zur Definition von T2-Kriterien, Anzeige eines deskriptiven Dashboards, Durchführung der Brute-Force-Optimierung und detaillierte Auswertungsergebnisse pro Patient basierend auf den angewendeten Kriterien. Überarbeitete T2-Kriterien-Definition und detailliertere BF-Ergebnisse.",
        statistik: "Bietet detaillierte statistische Analysen (Gütekriterien inkl. Likelihood Ratios, erweiterte Vergleiche, Assoziationen, explorative LK-Level Analyse) für das global gewählte Kollektiv oder einen Vergleich zweier spezifisch wählbarer Kollektive. Alle Konfidenzintervalle (CI) sind 95%-CIs.",
        praesentation: "Stellt Analyseergebnisse in einem aufbereiteten, präsentationsfreundlichen Format dar, fokussiert auf den Vergleich des Avocado Signs mit T2-basierten Ansätzen (angewandt oder Literatur).",
        publikation: "Generiert stark erweiterte Textvorschläge (Methoden & Ergebnisse) und Materialien für eine wissenschaftliche Publikation zum Vergleich von Avocado Sign mit verschiedenen T2-Kriteriensets, orientiert an den Originalarbeiten.",
        export: "Bietet umfangreiche Optionen zum Herunterladen von Rohdaten, Analyseergebnissen, Tabellen und Diagrammen in verschiedenen Dateiformaten, inkl. 'One-Click' Publikations-Chart-Paket und verbesserter Diagramm-Exporte.",
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
    t2Logic: { description: `Logische Verknüpfung der aktiven T2-Kriterien: <strong>UND</strong> (Ein Lymphknoten ist nur positiv, wenn ALLE aktivierten Kriterien erfüllt sind). <strong>ODER</strong> (Ein Lymphknoten ist positiv, wenn MINDESTENS EIN aktiviertes Kriterium erfüllt ist). Die Wahl beeinflusst die Berechnung des T2-Status. Die aktuell resultierende Logik wird über den Kriterien angezeigt.` },
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
        cumulativeLogicDisplay: "Aktuell wirksame Kriterienkombination basierend auf Ihren Einstellungen."
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
    bruteForceStart: { description: "Startet die Brute-Force-Suche nach der T2-Kriterienkombination, die die gewählte Zielmetrik im aktuellen Kollektiv maximiert. Dies kann einige Zeit in Anspruch nehmen und läuft im Hintergrund. Der Fortschritt wird angezeigt." },
    bruteForceInfo: { description: "Zeigt den Status des Brute-Force Optimierungs-Workers und das aktuell analysierte Patientenkollektiv: <strong>[KOLLEKTIV_NAME]</strong>." },
    bruteForceProgress: { description: "Fortschritt der Optimierung: Getestete Kombinationen / Gesamtanzahl ([TOTAL]). Angezeigt werden die aktuelle beste Metrik und die zugehörigen Kriterien." },
    bruteForceResult: {
        description: "Bestes Ergebnis der abgeschlossenen Brute-Force-Optimierung für das gewählte Kollektiv ([N_GESAMT] Patienten, davon [N_PLUS] N+ und [N_MINUS] N-) und die Zielmetrik. Die angezeigten Werte (Sens, Spez etc.) beziehen sich auf die beste Kombination für die gewählte Zielmetrik.",
        kollektivStats: "Statistik des für diese Optimierung verwendeten Kollektivs: N (Gesamtanzahl), N+ (Anzahl N-positiv), N- (Anzahl N-negativ)."
    },
    bruteForceDetailsButton: { description: "Öffnet ein Fenster mit den Top-Ergebnissen (inkl. aller Gütekriterien und Konfusionsmatrix-Daten: TP, FP, FN, TN) und weiteren Details zur abgeschlossenen Optimierung." },
    bruteForceModal: {
        exportButton: "Exportiert den detaillierten Bericht der Brute-Force-Optimierung (Top-Ergebnisse, Kollektiv-Statistik, Konfiguration) als formatierte Textdatei (.txt) oder als CSV-Datei mit allen getesteten Kombinationen und deren Metriken.",
        tableHeaderRank: "Rang",
        tableHeaderMetric: "Zielmetrik ([METRIC_NAME])",
        tableHeaderSens: "Sens.",
        tableHeaderSpez: "Spez.",
        tableHeaderPPV: "PPV",
        tableHeaderNPV: "NPV",
        tableHeaderAcc: "Acc.",
        tableHeaderBalAcc: "Bal. Acc.",
        tableHeaderF1: "F1",
        tableHeaderTP: "TP (RP)",
        tableHeaderFP: "FP",
        tableHeaderFN: "FN",
        tableHeaderRN: "RN",
        tableHeaderLogic: "Logik",
        tableHeaderCriteria: "Kriterien"
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
    diagnostischeGueteAS: { cardTitle: "Diagnostische Güte des Avocado Signs (AS) vs. Histopathologie (N) für Kollektiv <strong>[KOLLEKTIV]</strong>. Alle Konfidenzintervalle (CI) sind 95%-CIs." },
    diagnostischeGueteT2: { cardTitle: "Diagnostische Güte der aktuell angewendeten T2-Kriterien vs. Histopathologie (N) für Kollektiv <strong>[KOLLEKTIV]</strong>. Alle CIs sind 95%-CIs." },
    statistischerVergleichASvsT2: { cardTitle: "Statistischer Vergleich der diagnostischen Leistung von AS vs. aktuell angewandten T2-Kriterien (gepaarte Tests) im Kollektiv <strong>[KOLLEKTIV]</strong>. Enthält Tests für Sensitivität, Spezifität, Accuracy und AUC." },
    assoziationEinzelkriterien: { cardTitle: "Assoziation zwischen AS-Status bzw. einzelnen T2-Merkmalen und dem N-Status (+/-) im Kollektiv <strong>[KOLLEKTIV]</strong>. OR: Odds Ratio, RD: Risk Difference, φ: Phi-Koeffizient. Alle CIs sind 95%-CIs." },
    vergleichKollektive: { cardTitle: "Statistischer Vergleich der Accuracy und AUC (für AS und T2) zwischen <strong>[KOLLEKTIV1]</strong> und <strong>[KOLLEKTIV2]</strong> (ungepaarte Tests)." },
    explorativeLkAnalyse: {
        cardTitle: "Explorative Analyse auf Lymphknoten-Ebene für Kollektiv <strong>[KOLLEKTIV]</strong>.",
        beschreibung: "Diese Analyse betrachtet individuelle Lymphknoten (LK) anstatt des Patientenstatus. Vergleicht Merkmale von pathologisch positiven (N+) vs. negativen (N-) Lymphknoten, die im T2-MRT sichtbar waren.",
        sizeDistributionChart: "Verteilung der Kurzachsendurchmesser (mm) von T2-sichtbaren Lymphknoten, getrennt nach deren pathologischem N-Status.",
        featureDistributionTable: "Häufigkeitsverteilung der T2-Merkmale (Form, Kontur, Homogenität, Signal) für N+ und N- Lymphknoten."
    },
    criteriaComparisonTable: {
        cardTitle: "Tabellarischer Leistungsvergleich: Avocado Sign, aktuell gewählte T2-Kriterien und Literatur-Sets für das global gewählte Kollektiv <strong>[GLOBAL_KOLLEKTIV_NAME]</strong>. Literatur-Sets werden auf ihrem spezifischen Zielkollektiv evaluiert, falls abweichend (in Klammern angegeben und mit Patientenzahl N des jeweiligen evaluierten Kollektivs). Alle Werte ohne CIs.",
        tableHeaderSet: "Methode / Kriteriensatz (Eval. auf Kollektiv, N)",
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
        downloadDemographicsMD: { description: "Lädt die Tabelle der demographischen Basisdaten (nur für Avocado-Sign-Ansicht) als Markdown-Datei (.md) herunter."},
        downloadPerformanceCSV: { description: "Lädt die Tabelle der diagnostischen Güte (je nach Ansicht: AS oder AS vs. T2-Basis) als CSV-Datei (.csv) herunter." },
        downloadPerformanceMD: { description: "Lädt die Tabelle der diagnostischen Güte (je nach Ansicht: AS oder AS vs. T2-Basis) als Markdown-Datei (.md) herunter." },
        downloadCompTestsMD: { description: "Lädt die Tabelle der statistischen Vergleichstests (McNemar, DeLong für AS vs. T2-Basis) als Markdown-Datei (.md) herunter." },
        downloadCompTableMD: { description: "Lädt die Tabelle mit den verglichenen Metrikwerten (AS vs. T2-Basis) als Markdown-Datei (.md) herunter."},
        downloadCompChartPNG: { description: "Lädt das Vergleichs-Balkendiagramm (AS vs. T2-Basis) als PNG-Datei herunter. Auflösung wählbar." },
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
        description: "Ermöglicht den Export von Analyseergebnissen, Tabellen und Diagrammen basierend auf dem aktuell gewählten globalen Kollektiv (<strong>[KOLLEKTIV]</strong>) und den aktuell angewendeten T2-Kriterien.",
        statsCSV: { description: "Detaillierte Tabelle aller berechneten statistischen Metriken (deskriptiv, Güte AS & T2, Vergleiche, Assoziationen) aus dem Statistik-Tab als CSV-Datei.", type: 'STATS_CSV', ext: "csv" },
        bruteForceTXT: { description: "Detaillierter Bericht der letzten Brute-Force-Optimierung für das aktuelle Kollektiv (Top-Ergebnisse, Konfiguration) als Textdatei (.txt), falls durchgeführt.", type: 'BRUTEFORCE_TXT', ext: "txt" },
        bruteForceDetailedCSV: { description: "Exportiert alle getesteten Kombinationen der letzten Brute-Force-Optimierung mit ihren jeweiligen Metrikwerten als CSV-Datei.", type: 'BRUTEFORCE_DETAILED_CSV', ext: "csv" },
        deskriptivMD: { description: "Tabelle der deskriptiven Statistik (Statistik-Tab) als Markdown (.md).", type: 'DESKRIPTIV_MD', ext: "md" },
        datenMD: { description: "Aktuelle Datenliste (Daten-Tab) als Markdown-Tabelle (.md).", type: 'DATEN_MD', ext: "md" },
        auswertungMD: { description: "Aktuelle Auswertungstabelle (Auswertung-Tab, inkl. T2-Ergebnisse) als Markdown (.md).", type: 'AUSWERTUNG_MD', ext: "md" },
        filteredDataCSV: { description: "Rohdaten des aktuell ausgewählten Kollektivs (inkl. T2-Bewertung) als CSV-Datei (.csv).", type: 'FILTERED_DATA_CSV', ext: "csv" },
        comprehensiveReportHTML: { description: "Umfassender Analysebericht als HTML-Datei (Statistiken, Konfigurationen, Diagramme), druckbar.", type: 'COMPREHENSIVE_REPORT_HTML', ext: "html" },
        chartsPNGZIP: { description: "Alle aktuell sichtbaren Diagramme (Statistik, Auswertung, Präsentation) und ausgewählte Tabellen als einzelne PNG-Dateien (ZIP-Archiv). Auflösung wählbar.", type: 'CHARTS_PNG_ZIP', ext: "zip" },
        chartsSVGZIP: { description: "Alle aktuell sichtbaren Diagramme (Statistik, Auswertung, Präsentation) als einzelne SVG-Dateien (ZIP-Archiv).", type: 'CHARTS_SVG_ZIP', ext: "zip" },
        publicationChartsZIP: { description: "Alle im 'Publikation'-Tab generierten oder referenzierten Diagramme als PNG und SVG in einem ZIP-Archiv. Auflösung wählbar.", type: 'PUBLICATION_CHARTS_ZIP', ext: "zip" },
        chartSinglePNG: { description: "Ausgewähltes Diagramm '{ChartName}' als PNG-Datei. Auflösung wählbar.", type: 'CHART_SINGLE_PNG', ext: "png"},
        chartSingleSVG: { description: "Ausgewähltes Diagramm '{ChartName}' als SVG-Datei (Vektorformat).", type: 'CHART_SINGLE_SVG', ext: "svg"},
        tableSinglePNG: { description: "Ausgewählte Tabelle '{TableName}' als PNG-Bilddatei.", type: 'TABLE_PNG_EXPORT', ext: "png"},
        allZIP: { description: "Alle verfügbaren Einzeldateien (Statistik-CSV, BruteForce-Berichte, alle MDs, Rohdaten-CSV, HTML-Report) in einem ZIP-Archiv.", type: 'ALL_ZIP', ext: "zip"},
        csvZIP: { description: "Alle verfügbaren CSV-Dateien (Statistik, Rohdaten, Brute-Force Detailliert) in einem ZIP-Archiv.", type: 'CSV_ZIP', ext: "zip"},
        mdZIP: { description: "Alle verfügbaren Markdown-Dateien (Deskriptiv, Daten, Auswertung, Publikationstexte) in einem ZIP-Archiv.", type: 'MD_ZIP', ext: "md"},
        publicationMDZIP: { description: "Alle generierten Textabschnitte (Methoden, Ergebnisse) des 'Publikation'-Tabs als einzelne Markdown-Dateien in einem ZIP-Archiv.", type: 'PUBLIKATION_COMPLETE_MD', ext: "zip"},
        pngZIP: { description: "Identisch zum 'Alle Diagramme & Tabellen (PNG)' ZIP-Export.", type: 'PNG_ZIP', ext: "zip"},
        svgZIP: { description: "Identisch zum 'Alle Diagramme (SVG)' ZIP-Export.", type: 'SVG_ZIP', ext: "zip"}
    },
    publikationTabTooltips: {
        spracheSwitch: { description: "Wechselt die Sprache der generierten Texte und einiger Beschriftungen im Publikation-Tab zwischen Deutsch und Englisch." },
        sectionSelect: { description: "Wählen Sie den Abschnitt der wissenschaftlichen Publikation, für den Textvorschläge und relevante Daten/Grafiken angezeigt werden sollen (aktuell Methoden & Ergebnisse)." },
        bruteForceMetricSelect: { description: "Wählen Sie die Zielmetrik, deren Brute-Force-Optimierungsergebnisse im Ergebnisteil und in den generierten Texten als 'optimierte T2-Kriterien' referenziert werden. Standardtexte beziehen sich meist auf die Default-Optimierungsmetrik (Balanced Accuracy)." },
        methoden: {
            studienanlage: "Textvorschlag und Informationen zu Studiendesign, Ethik und der verwendeten Analyse-Software.",
            patientenkollektiv: "Textvorschlag und Informationen zum Patientenkollektiv, dessen Zusammensetzung und der Datenbasis.",
            mrtProtokoll: "Textvorschlag und Informationen zum MRT-Protokoll, Gerät und Kontrastmittelgabe.",
            asDefinition: "Textvorschlag und Informationen zur Definition, Bewertung und Reproduzierbarkeit des Avocado Signs.",
            t2Definition: "Textvorschlag und Informationen zur Definition und Bewertung der T2-Kriterien (Literatur-basiert und Brute-Force optimiert, inklusive der jeweiligen Logik).",
            referenzstandard: "Textvorschlag und Informationen zum Referenzstandard (Histopathologie) für den N-Status.",
            statistischeAnalyse: "Textvorschlag und Informationen zu den verwendeten statistischen Analysemethoden, inklusive Berechnung der Gütekriterien, Konfidenzintervalle und Vergleichstests."
        },
        ergebnisse: {
            patientencharakteristika: "Textvorschlag und relevante Tabellen/Diagramme zu den Patientencharakteristika des Gesamtkollektivs und der Subgruppen.",
            asPerformance: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte des Avocado Signs für alle Kollektive.",
            literaturT2Performance: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte der Literatur-basierten T2-Kriteriensets auf den jeweiligen Zielkollektiven.",
            optimierteT2Performance: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte der Brute-Force optimierten T2-Kriteriensets für die gewählte Optimierungsmetrik auf den jeweiligen Kollektiven.",
            vergleichPerformance: "Textvorschlag und relevante Tabellen/Diagramme zum statistischen Vergleich der diagnostischen Güte zwischen Avocado Sign und den verschiedenen T2-Kriteriensets (Literatur und optimiert) für jedes Kollektiv."
        }
    },
    statMetrics: {
        sens: { name: "Sensitivität", description: "Sensitivität ([METHODE] vs. N): Anteil der tatsächlich positiven Fälle (N+), die durch die Methode [METHODE] korrekt als positiv erkannt wurden.<br><i>Formel: RP / (RP + FN)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der tatsächlich N+ Patienten korrekt (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].<hr><i>RP=[RP_VAL], FN=[FN_VAL]. Bei kleinen Fallzahlen für RP oder FN ist das CI ggf. sehr breit.</i>"},
        spez: { name: "Spezifität", description: "Spezifität ([METHODE] vs. N): Anteil der tatsächlich negativen Fälle (N-), die durch die Methode [METHODE] korrekt als negativ erkannt wurden.<br><i>Formel: RN / (RN + FP)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der tatsächlich N- Patienten korrekt (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].<hr><i>RN=[RN_VAL], FP=[FP_VAL]. Bei kleinen Fallzahlen für RN oder FP ist das CI ggf. sehr breit.</i>"},
        ppv: { name: "Pos. Prädiktiver Wert (PPV)", description: "PPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem positiven Testergebnis durch Methode [METHODE] tatsächlich krank (N+) ist.<br><i>Formel: RP / (RP + FP)</i>", interpretation: "Wenn die Methode [METHODE] ein positives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N+ Status bei <strong>[WERT]</strong> (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig.<hr><i>RP=[RP_VAL], FP=[FP_VAL]. Bei kleinen Fallzahlen für RP oder FP ist das CI ggf. sehr breit.</i>"},
        npv: { name: "Neg. Prädiktiver Wert (NPV)", description: "NPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem negativen Testergebnis durch Methode [METHODE] tatsächlich gesund (N-) ist.<br><i>Formel: RN / (RN + FN)</i>", interpretation: "Wenn die Methode [METHODE] ein negatives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N- Status bei <strong>[WERT]</strong> (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig.<hr><i>RN=[RN_VAL], FN=[FN_VAL]. Bei kleinen Fallzahlen für RN oder FN ist das CI ggf. sehr breit.</i>"},
        acc: { name: "Accuracy (Gesamtgenauigkeit)", description: "Accuracy ([METHODE] vs. N): Anteil aller Fälle, die durch die Methode [METHODE] korrekt klassifiziert wurden.<br><i>Formel: (RP + RN) / Gesamtanzahl</i>", interpretation: "Die Methode [METHODE] klassifizierte insgesamt <strong>[WERT]</strong> aller Patienten korrekt (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].<hr><i>(RP+RN)=[RP_RN_VAL], Gesamt=[TOTAL_VAL]. Bei unausgeglichenen Gruppen (ungleiche Prävalenz von N+ und N-) kann die Accuracy irreführend sein.</i>"},
        balAcc: { name: "Balanced Accuracy", description: "Balanced Accuracy ([METHODE] vs. N): Der Mittelwert aus Sensitivität und Spezifität. Sinnvoll bei ungleichen Gruppengrößen (Prävalenz).<br><i>Formel: (Sensitivität + Spezifität) / 2</i>", interpretation: "Die Balanced Accuracy der Methode [METHODE], die Sensitivität und Spezifität gleich gewichtet, betrug <strong>[WERT]</strong> (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]."},
        f1: { name: "F1-Score", description: "F1-Score ([METHODE] vs. N): Das harmonische Mittel aus PPV (Precision) und Sensitivität (Recall). Ein Wert von 1 ist optimal.<br><i>Formel: 2 * (PPV * Sensitivität) / (PPV + Sensitivität)</i>", interpretation: "Der F1-Score für die Methode [METHODE], der Präzision und Sensitivität kombiniert, beträgt <strong>[WERT]</strong> (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]."},
        auc: { name: "Area Under Curve (AUC)", description: "AUC ([METHODE] vs. N): Fläche unter der Receiver Operating Characteristic (ROC)-Kurve. Repräsentiert die Fähigkeit einer Methode, zwischen positiven und negativen Fällen zu unterscheiden. 0.5 entspricht Zufall, 1.0 perfekter Trennung.<br><i>Für binäre Tests (wie AS oder eine feste T2-Regel) ist AUC = Balanced Accuracy.</i>", interpretation: "Die AUC von <strong>[WERT]</strong> (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) deutet auf eine <strong>[BEWERTUNG]</strong> generelle Trennschärfe der Methode [METHODE] zwischen N+ und N- Fällen im Kollektiv [KOLLEKTIV] hin."},
        lrPlus: { name: "Positiver Likelihood Ratio (LR+)", description: "LR+ ([METHODE] vs. N): Gibt an, um wie viel wahrscheinlicher ein positives Testergebnis bei tatsächlich kranken (N+) Personen im Vergleich zu gesunden (N-) Personen ist.<br><i>Formel: Sensitivität / (1 - Spezifität)</i><br>Werte >1 erhöhen die Nachtestwahrscheinlichkeit. LR+ >10 gilt als starker Hinweis.", interpretation: "Ein positives Ergebnis mit Methode [METHODE] ist <strong>[WERT]</strong>-mal wahrscheinlicher bei einem N+ Patienten als bei einem N- Patienten (95%-KI: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]."},
        lrNeg: { name: "Negativer Likelihood Ratio (LR-)", description: "LR- ([METHODE] vs. N): Gibt an, um wie viel wahrscheinlicher ein negatives Testergebnis bei tatsächlich kranken (N+) Personen im Vergleich zu gesunden (N-) Personen ist.<br><i>Formel: (1 - Sensitivität) / Spezifität</i><br>Werte <1 senken die Nachtestwahrscheinlichkeit. LR- <0.1 gilt als starker Hinweis.", interpretation: "Ein negatives Ergebnis mit Methode [METHODE] ist <strong>[WERT]</strong>-mal wahrscheinlicher bei einem N+ Patienten als bei einem N- Patienten (95%-KI: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]."},
        sensComp: { name: "Sensitivitätsvergleich (gepaart)", description: "Vergleicht die Sensitivität von AS vs. [T2_SHORT_NAME] für gepaarte Daten. Verwendet Methoden basierend auf McNemar oder Bootstrap.<br><i>Nullhypothese (H0): Sens(AS) = Sens([T2_SHORT_NAME]).</i>", interpretation: "Der Test auf Unterschied in der Sensitivität zwischen AS und [T2_SHORT_NAME] ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die Sensitivitäten im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
        spezComp: { name: "Spezifitätsvergleich (gepaart)", description: "Vergleicht die Spezifität von AS vs. [T2_SHORT_NAME] für gepaarte Daten. Verwendet Methoden basierend auf McNemar oder Bootstrap.<br><i>Nullhypothese (H0): Spez(AS) = Spez([T2_SHORT_NAME]).</i>", interpretation: "Der Test auf Unterschied in der Spezifität zwischen AS und [T2_SHORT_NAME] ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die Spezifitäten im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
        mcnemar: { name: "McNemar-Test", description: "Prüft auf einen signifikanten Unterschied in den diskordanten Paaren (Fälle, bei denen AS und [T2_SHORT_NAME] unterschiedliche Ergebnisse liefern) bei gepaarten Daten (d.h. beide Tests am selben Patienten).<br><i>Nullhypothese (H0): Anzahl(AS+ / [T2_SHORT_NAME]-) = Anzahl(AS- / [T2_SHORT_NAME]+). Ein kleiner p-Wert spricht gegen H0. Wird hier für die Accuracy verwendet.</i>", interpretation: "Der McNemar-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die Fehlklassifizierungsraten (diskordante Paare) von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
        delong: { name: "DeLong-Test", description: "Vergleicht zwei AUC-Werte von ROC-Kurven, die auf denselben (gepaarten) Daten basieren, unter Berücksichtigung der Kovarianz.<br><i>Nullhypothese (H0): AUC(AS) = AUC([T2_SHORT_NAME]). Ein kleiner p-Wert spricht gegen H0.</i>", interpretation: "Der DeLong-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die AUC-Werte (bzw. Balanced Accuracies) von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
        phi: { name: "Phi-Koeffizient (φ)", description: "Maß für die Stärke und Richtung des Zusammenhangs zwischen zwei binären Variablen (z.B. Vorhandensein von Merkmal '[MERKMAL]' und N-Status). Wertebereich von -1 bis +1. 0 bedeutet kein Zusammenhang.", interpretation: "Der Phi-Koeffizient von <strong>[WERT]</strong> deutet auf einen <strong>[BEWERTUNG]</strong> Zusammenhang zwischen dem Merkmal '[MERKMAL]' und dem N-Status im Kollektiv [KOLLEKTIV] hin."},
        rd: { name: "Risk Difference (RD)", description: "Absolute Differenz in der Wahrscheinlichkeit (Risiko) für N+ zwischen Patienten mit und ohne das Merkmal '[MERKMAL]'. RD = P(N+|Merkmal+) - P(N+|Merkmal-). Ein RD von 0 bedeutet kein Unterschied.", interpretation: "Das Risiko für einen N+ Status war bei Patienten mit dem Merkmal '[MERKMAL]' um <strong>[WERT]%</strong> absolut [HOEHER_NIEDRIGER] als bei Patienten ohne dieses Merkmal (95%-KI nach [METHOD_CI]: [LOWER]% – [UPPER]%) im Kollektiv [KOLLEKTIV]."},
        or: { name: "Odds Ratio (OR)", description: "Quotient der Odds für N+ bei Vorhandensein vs. Abwesenheit des Merkmals '[MERKMAL]'. OR = Odds(N+|Merkmal+) / Odds(N+|Merkmal-).<br>OR > 1: Erhöhte Odds für N+ bei Vorhandensein des Merkmals.<br>OR < 1: Verringerte Odds.<br>OR = 1: Keine Assoziation.", interpretation: "Die Chance (Odds) für einen N+ Status war bei Patienten mit dem Merkmal '[MERKMAL]' um den Faktor <strong>[WERT]</strong> [FAKTOR_TEXT] im Vergleich zu Patienten ohne dieses Merkmal (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER], p=[P_WERT], [SIGNIFIKANZ]) im Kollektiv [KOLLEKTIV]."},
        fisher: { name: "Fisher's Exact Test", description: "Exakter Test zur Prüfung auf einen signifikanten Zusammenhang zwischen zwei kategorialen Variablen (z.B. Merkmal '[MERKMAL]' vs. N-Status). Geeignet auch für kleine Stichproben/geringe erwartete Häufigkeiten.<br><i>Nullhypothese (H0): Kein Zusammenhang.</i>", interpretation: "Der exakte Test nach Fisher ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>, was auf einen [SIGNIFIKANZ_TEXT] Zusammenhang zwischen dem Merkmal '[MERKMAL]' und dem N-Status im Kollektiv [KOLLEKTIV] hindeutet."},
        mannwhitney: { name: "Mann-Whitney-U-Test", description: "Nichtparametrischer Test zum Vergleich der zentralen Tendenz (Median) einer kontinuierlichen Variablen (z.B. '[VARIABLE]') zwischen zwei unabhängigen Gruppen (z.B. N+ vs. N-).<br><i>Nullhypothese (H0): Kein Unterschied in den Medianen/Verteilungen.</i>", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies zeigt einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Variable '[VARIABLE]' zwischen N+ und N- Patienten im Kollektiv [KOLLEKTIV]."},
        ci95: { name: "95% Konfidenzintervall (CI)", description: "Der Wertebereich, der den wahren (unbekannten) Populationsparameter der Metrik mit 95%iger Wahrscheinlichkeit überdeckt.<br><i>Methode: [METHOD_CI]</i>", interpretation: "Basierend auf den Daten liegt der wahre Wert der Metrik mit 95%iger Sicherheit zwischen [LOWER] und [UPPER]."},
        konfusionsmatrix: { description: "Kreuztabelle, die die Klassifikationsergebnisse der Methode [METHODE] mit dem tatsächlichen N-Status vergleicht: Richtig Positive (RP), Falsch Positive (FP), Falsch Negative (FN), Richtig Negative (RN)." },
        accComp: { name: "Accuracy Vergleich (ungepaart)", description: "Vergleicht die Accuracy der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels Fisher's Exact Test.<br><i>Nullhypothese (H0): Accuracy in Kollektiv1 = Accuracy in Kollektiv2.</i>", interpretation: "Der Unterschied in der Accuracy der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
        aucComp: { name: "AUC Vergleich (ungepaart)", description: "Vergleicht die AUC der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels eines Z-Tests basierend auf den Standardfehlern der AUCs.<br><i>Nullhypothese (H0): AUC in Kollektiv1 = AUC in Kollektiv2.</i>", interpretation: "Der Unterschied in der AUC der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
        defaultP: { interpretation: `Der berechnete p-Wert beträgt <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Bei einem Signifikanzniveau von ${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,2).replace('.',',')} ist das Ergebnis <strong>[SIGNIFIKANZ_TEXT]</strong>.` },
        size_mwu: {name: "LK Größe MWU", description: "Vergleich der medianen Lymphknotengrößen zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test. Hier werden alle Lymphknoten der Patienten berücksichtigt, nicht Patienten-Level-Status.", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies zeigt einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Lymphknotengrößen zwischen den Lymphknoten von N+ und N- Patienten im Kollektiv [KOLLEKTIV]."}
    }
};

deepFreeze(UI_TEXTS);
deepFreeze(TOOLTIP_CONTENT);
