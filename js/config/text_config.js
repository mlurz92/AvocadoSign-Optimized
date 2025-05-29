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
            methoden: 'Methoden',
            ergebnisse: 'Ergebnisse',
            diskussion: 'Diskussion (Platzhalter)',
            einleitung: 'Einleitung (Platzhalter)',
            abstract: 'Abstract (Platzhalter)',
            referenzen: 'Referenzen'
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
        asPerformance: 'AS Performance (Akt. Kollektiv)',
        consortDiagram: 'Patientenflussdiagramm (CONSORT-Stil)'
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
        bruteForceLabel: "Brute-Force Ergebnisse (.xlsx)",
        zipLabel: "Alle Excel-Tabellen (.zip)"
    },
    singleChartDownload: {
        pngLabel: "Als PNG herunterladen",
        svgLabel: "Als SVG herunterladen",
        tiffLabel: "Als TIFF herunterladen (optional)"
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
            sehr_schwach: "sehr schwach oder keine",
            nicht_bestimmbar: "nicht bestimmbar"
        }
    },
    kurzanleitung: {
        title: "Kurzanleitung & Wichtige Hinweise",
        content: `
            <p>Willkommen zum <strong>Lymphknoten T2 - Avocado Sign Analyse Tool v${APP_CONFIG.APP_VERSION}</strong>.</p>
            <h6>Allgemeine Bedienung:</h6>
            <ul>
                <li><strong>Kollektiv-Auswahl (Header):</strong> Wählen Sie hier das globale Patientenkollektiv (Gesamt, Direkt OP, nRCT). Diese Auswahl beeinflusst alle Analysen und Darstellungen.</li>
                <li><strong>Tab-Navigation:</strong> Wechseln Sie zwischen den Hauptfunktionen (Daten, Auswertung, Statistik, etc.).</li>
                <li><strong>Tooltips:</strong> Fahren Sie mit der Maus über Elemente für detaillierte Erklärungen.</li>
                <li><strong>Statistische Signifikanz:</strong> p-Werte werden mit Symbolen versehen: * p < 0.05, ** p < 0.01, *** p < 0.001. Das Signifikanzniveau ist &alpha; = ${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,2)}. Für Konfidenzintervalle werden ${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} Bootstrap-Replikationen verwendet, um eine höhere Stabilität zu gewährleisten.</li>
            </ul>
            <h6>Wichtige Tabs:</h6>
            <ul>
                <li><strong>Daten:</strong> Zeigt Patientendaten. Reihen sind für T2-LK-Details aufklappbar.</li>
                <li><strong>Auswertung:</strong>
                    <ul>
                        <li>Definieren Sie hier <strong>T2-Malignitätskriterien</strong> und die <strong>Logik</strong> (UND/ODER).</li>
                        <li>Klicken Sie <strong>"Anwenden & Speichern"</strong>, um Ihre Definitionen auf den Datensatz anzuwenden. Ungespeicherte Änderungen werden markiert.</li>
                        <li>Starten Sie die <strong>Brute-Force-Optimierung</strong> zur datengetriebenen Identifikation optimaler T2-Kriterien.</li>
                    </ul>
                </li>
                <li><strong>Statistik:</strong> Detaillierte statistische Analysen. "Einzelansicht" oder "Vergleich Aktiv". 95%-Konfidenzintervalle (CI) werden standardmäßig berechnet.</li>
                <li><strong>Präsentation:</strong> Aufbereitete Ergebnisse, ideal für Vorträge und schnelle Vergleiche.</li>
                <li><strong>Publikation:</strong> Generiert Textvorschläge, Tabellen und Diagramme für eine wissenschaftliche Publikation im Stil von "Radiology". Fokus auf Methoden und Ergebnisse.</li>
                <li><strong>Export:</strong> Lädt Analyseergebnisse und Daten in verschiedenen Formaten (CSV, MD, XLSX, HTML, PNG, SVG, optional TIFF) herunter.</li>
            </ul>
             <h6>T2-Kriterien Anwendung:</h6>
            <p class="small">Der Status 'T2', T2-bezogene Statistiken und Diagramme basieren <strong>immer</strong> auf den zuletzt im 'Auswertung'-Tab <strong>definierten UND angewendeten</strong> Kriterien, außer bei expliziter Auswahl einer Literaturstudie (z.B. im Präsentation- oder Publikation-Tab).</p>
            <h6>Referenzstandard:</h6>
            <p class="small">Der pathologische N-Status dient als Referenzstandard für alle diagnostischen Güteberechnungen.</p>
            <p class="small">Diese Anwendung ist ein Forschungswerkzeug und nicht für die klinische Diagnostik vorgesehen. Ergebnisse sollten kritisch geprüft und ggf. mit Spezialsoftware validiert werden.</p>
        `
    }
};

const TOOLTIP_CONTENT = {
    kurzanleitungButton: { description: "Zeigt eine Kurzanleitung und wichtige Hinweise zur Bedienung der Anwendung." },
    kollektivButtons: { description: "Wählen Sie das Patientenkollektiv für die Analyse aus: <strong>Gesamt</strong> (alle Patienten), <strong>Direkt OP</strong> (nur primär Operierte ohne Vorbehandlung) oder <strong>nRCT</strong> (nur neoadjuvant Radiochemotherapeutisch Vorbehandelte). Die Auswahl filtert die Datenbasis für alle Tabs und Analysen." },
    headerStats: {
        kollektiv: "Aktuell betrachtetes globales Patientenkollektiv.",
        anzahlPatienten: "Gesamtzahl der Patienten im ausgewählten globalen Kollektiv.",
        statusN: "Anteil der Patienten mit positivem (+) vs. negativem (-) histopathologischem Lymphknotenstatus (N-Status, Pathologie-Referenzstandard) im ausgewählten globalen Kollektiv.",
        statusAS: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß Avocado Sign (AS) Vorhersage (basierend auf T1KM-MRT) im ausgewählten globalen Kollektiv.",
        statusT2: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß den aktuell **angewendeten und gespeicherten** T2-Kriterien (siehe Auswertungstab) für das ausgewählte globale Kollektiv."
    },
    mainTabs: {
        daten: "Zeigt die detaillierte Liste aller Patientendaten im aktuell ausgewählten globalen Kollektiv mit Basisinformationen und Status (N/AS/T2). Ermöglicht das Sortieren und Aufklappen von Details zu T2-Lymphknotenmerkmalen.",
        auswertung: "Zentraler Tab zur Definition von T2-Kriterien, Anzeige eines deskriptiven Dashboards für das globale Kollektiv, Durchführung der Brute-Force-Optimierung und detaillierte Auswertungsergebnisse pro Patient basierend auf den hier definierten und dann angewendeten Kriterien.",
        statistik: "Bietet detaillierte statistische Analysen (Gütekriterien, Vergleiche, Assoziationen) für das global gewählte Kollektiv oder einen benutzerdefinierten Vergleich zweier spezifisch wählbarer Kollektive. Alle Konfidenzintervalle (CI) sind 95%-CIs, berechnet mit robusten Methoden.",
        praesentation: "Stellt Analyseergebnisse in einem aufbereiteten, präsentationsfreundlichen Format dar. Fokussiert auf den Vergleich des Avocado Signs mit T2-basierten Ansätzen (aktuell angewandt oder spezifische Literaturstudien). Das globale Kollektiv kann hier temporär für Vergleiche angepasst werden.",
        publikation: "Generiert Textvorschläge, Tabellen und Diagramme im Stil von \"Radiology\" für eine wissenschaftliche Publikation. Fokussiert auf die detaillierte Darstellung der Methoden und Ergebnisse zum Vergleich von Avocado Sign mit verschiedenen T2-Kriterien.",
        export: "Bietet umfangreiche Optionen zum Herunterladen von Rohdaten, Analyseergebnissen, Tabellen und Diagrammen in verschiedenen Dateiformaten (CSV, MD, XLSX, HTML, PNG, SVG, etc.).",
        moreTabsDropdown: "Weitere Tabs anzeigen (z.B. Export)."
    },
    datenTable: {
        nr: "Fortlaufende Nummer des Patienten.",
        name: "Nachname des Patienten (anonymisiert/kodiert).",
        vorname: "Vorname des Patienten (anonymisiert/kodiert).",
        geschlecht: "Geschlecht des Patienten (m: männlich, w: weiblich, unbekannt).",
        alter: "Alter des Patienten zum Zeitpunkt der MRT-Untersuchung in Jahren.",
        therapie: "Angewandte Therapie vor der Operation (nRCT: neoadjuvante Radiochemotherapie, direkt OP: keine Vorbehandlung). Beeinflusst die globale Kollektivauswahl.",
        n_as_t2: "Direkter Statusvergleich: N (Pathologie-Referenz), AS (Avocado Sign), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung.",
        bemerkung: "Zusätzliche klinische oder radiologische Bemerkungen zum Patientenfall, falls vorhanden.",
        expandAll: "Öffnet oder schließt die Detailansicht zu den T2-gewichteten Lymphknotenmerkmalen für alle Patienten in der aktuellen Tabellenansicht. Zeigt Größe, Form, Kontur, Homogenität und Signal für jeden Lymphknoten.",
        expandRow: "Klicken Sie hier oder auf den Pfeil-Button, um Details zu den morphologischen Eigenschaften der T2-gewichteten Lymphknoten dieses Patienten anzuzeigen/auszublenden. Nur verfügbar, wenn T2-Lymphknoten-Daten für diesen Patienten erfasst wurden."
    },
    auswertungTable: {
        nr: "Fortlaufende Nummer des Patienten.",
        name: "Nachname des Patienten (anonymisiert/kodiert).",
        therapie: "Angewandte Therapie vor der Operation.",
        n_as_t2: "Direkter Statusvergleich: N (Pathologie-Referenz), AS (Avocado Sign), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung.",
        n_counts: "Anzahl pathologisch positiver (N+) Lymphknoten / Gesamtzahl histopathologisch untersuchter Lymphknoten für diesen Patienten.",
        as_counts: "Anzahl als positiv bewerteter Avocado Sign (AS+) Lymphknoten / Gesamtzahl im T1KM-MRT sichtbarer und bewerteter Lymphknoten für diesen Patienten.",
        t2_counts: "Anzahl als positiv bewerteter T2-Lymphknoten (gemäß aktuell angewendeter Kriterien) / Gesamtzahl im T2-MRT sichtbarer und für die Kriterienbewertung herangezogener Lymphknoten für diesen Patienten.",
        expandAll: "Öffnet oder schließt die Detailansicht der bewerteten T2-gewichteten Lymphknoten und der erfüllten Kriterien für alle Patienten in der aktuellen Tabellenansicht. Zeigt, welche Kriterien zur Positiv- oder Negativ-Bewertung des jeweiligen Lymphknotens geführt haben.",
        expandRow: "Klicken Sie hier oder auf den Pfeil-Button, um die detaillierte Bewertung der einzelnen T2-gewichteten Lymphknoten dieses Patienten gemäß der aktuell angewendeten Kriterien anzuzeigen/auszublenden. Erfüllte Kriterien, die zur Positiv-Bewertung eines Lymphknotens beitragen, werden hervorgehoben."
    },
    t2Logic: { description: `Logische Verknüpfung der aktiven T2-Kriterien: <strong>UND</strong> (Ein Lymphknoten ist nur positiv, wenn ALLE aktivierten Kriterien erfüllt sind). <strong>ODER</strong> (Ein Lymphknoten ist positiv, wenn MINDESTENS EIN aktiviertes Kriterium erfüllt ist). Die Wahl beeinflusst die Berechnung des T2-Status.` },
    t2Size: { description: `Größenkriterium (Kurzachse): Lymphknoten mit einem Durchmesser <strong>größer oder gleich (≥)</strong> dem eingestellten Schwellenwert gelten als suspekt. Einstellbarer Bereich: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} - ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm (Schritt: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step} mm). Aktivieren/Deaktivieren mit Checkbox.` },
    t2Form: { description: "Formkriterium: Wählen Sie, welche Form ('rund' oder 'oval') als suspekt gilt. Aktivieren/Deaktivieren mit Checkbox." },
    t2Kontur: { description: "Konturkriterium: Wählen Sie, welche Kontur ('scharf' berandet oder 'irregulär') als suspekt gilt. Aktivieren/Deaktivieren mit Checkbox." },
    t2Homogenitaet: { description: "Homogenitätskriterium: Wählen Sie, ob ein 'homogenes' oder 'heterogenes' Binnensignal auf T2w als suspekt gilt. Aktivieren/Deaktivieren mit Checkbox." },
    t2Signal: { description: "Signalkriterium: Wählen Sie, welche T2-Signalintensität ('signalarm', 'intermediär' oder 'signalreich') relativ zur umgebenden Muskulatur als suspekt gilt. Lymphknoten mit nicht beurteilbarem Signal (Wert 'null') erfüllen dieses Kriterium nie. Aktivieren/Deaktivieren mit Checkbox." },
    t2Actions: {
        reset: "Setzt die Logik und alle Kriterien auf die definierten Standardeinstellungen zurück. Die Änderungen sind danach noch nicht angewendet. Klicken Sie 'Anwenden & Speichern', um diese Standardeinstellungen zu übernehmen.",
        apply: "Wendet die aktuell eingestellten T2-Kriterien und die Logik auf den gesamten Datensatz an. Dies aktualisiert die T2-Spalten in den Tabellen, alle statistischen Auswertungen und Diagramme. Die Einstellung wird zudem für zukünftige Sitzungen im Browser gespeichert."
    },
    t2CriteriaCard: { unsavedIndicator: "<strong>Achtung:</strong> Es gibt nicht angewendete Änderungen an den T2-Kriterien oder der Logik. Klicken Sie auf 'Anwenden & Speichern', um die Ergebnisse zu aktualisieren und die Einstellung zu speichern." },
    t2MetricsOverview: {
        cardTitle: "Kurzübersicht der diagnostischen Güte für die aktuell angewendeten und gespeicherten T2-Kriterien im Vergleich zum histopathologischen N-Status für das gewählte Kollektiv: <strong>[KOLLEKTIV]</strong>. Alle Konfidenzintervalle (CI) sind 95%-CIs.",
        sens: "Sensitivität (T2 vs. N): Anteil der N+ Fälle, die von den T2-Kriterien korrekt als positiv erkannt wurden.",
        spez: "Spezifität (T2 vs. N): Anteil der N- Fälle, die von den T2-Kriterien korrekt als negativ erkannt wurden.",
        ppv: "Positiver Prädiktiver Wert (PPV, T2 vs. N): Wahrscheinlichkeit, dass ein T2+ Fall tatsächlich N+ ist.",
        npv: "Negativer Prädiktiver Wert (NPV, T2 vs. N): Wahrscheinlichkeit, dass ein T2- Fall tatsächlich N- ist.",
        acc: "Accuracy (T2 vs. N): Gesamtanteil der korrekt klassifizierten Fälle.",
        balAcc: "Balanced Accuracy (T2 vs. N): Mittelwert aus Sensitivität und Spezifität. Gilt als guter Gesamtindikator, besonders bei ungleichen Klassengrößen.",
        f1: "F1-Score (T2 vs. N): Harmonisches Mittel aus PPV und Sensitivität. Berücksichtigt sowohl falsch positive als auch falsch negative Ergebnisse.",
        auc: "AUC (T2 vs. N): Fläche unter der ROC-Kurve; für binäre Tests wie hier äquivalent zur Balanced Accuracy. Ein Maß für die generelle Unterscheidungsfähigkeit des Tests."
     },
    bruteForceMetric: { description: "Wählen Sie die Zielmetrik für die Brute-Force-Optimierung.<br><strong>Accuracy:</strong> Anteil korrekt klassifizierter Fälle.<br><strong>Balanced Accuracy:</strong> (Sens+Spez)/2; gut bei ungleichen Klassengrößen.<br><strong>F1-Score:</strong> Harmonisches Mittel aus PPV & Sensitivität.<br><strong>PPV:</strong> Präzision bei positiver Vorhersage.<br><strong>NPV:</strong> Präzision bei negativer Vorhersage." },
    bruteForceStart: { description: "Startet die Brute-Force-Suche nach der T2-Kriterienkombination, die die gewählte Zielmetrik im aktuellen Kollektiv maximiert. Dies kann einige Zeit in Anspruch nehmen und läuft im Hintergrund in einem Web Worker." },
    bruteForceInfo: { description: "Zeigt den Status des Brute-Force Optimierungs-Workers und das aktuell für die Optimierung verwendete Patientenkollektiv: <strong>[KOLLEKTIV_NAME]</strong>." },
    bruteForceProgress: { description: "Fortschritt der laufenden Optimierung: Getestete Kombinationen / Gesamtanzahl ([TOTAL]). Angezeigt werden die aktuelle beste Metrik und die zugehörigen Kriterien." },
    bruteForceResult: {
        description: "Bestes Ergebnis der abgeschlossenen Brute-Force-Optimierung für das gewählte Kollektiv ([N_GESAMT] Patienten, davon [N_PLUS] N+ und [N_MINUS] N-) und die Zielmetrik. Enthält den erreichten Wert, die Logik und die spezifische Kriterienkombination.",
        kollektivStats: "Statistik des für diese Optimierung verwendeten Kollektivs: N (Gesamtanzahl), N+ (Anzahl N-positiv), N- (Anzahl N-negativ)."
    },
    bruteForceDetailsButton: { description: "Öffnet ein Fenster mit den Top 10 Ergebnissen der Optimierung (inklusive identischer Scores) und weiteren Details wie individuelle Metriken (Sens, Spez etc.) für jede Top-Kombination." },
    bruteForceModal: { exportButton: "Exportiert den detaillierten Bericht der Brute-Force-Optimierung (Top 10 Ergebnisse, Kollektiv-Statistik, Konfiguration) als formatierte Textdatei (.txt)." },
    statistikLayout: { description: "Wählen Sie die Anzeigeart: <strong>Einzelansicht</strong> für eine detaillierte Analyse des global gewählten Kollektivs oder <strong>Vergleich Aktiv</strong> zur Auswahl und Gegenüberstellung zweier spezifischer Kollektive (z.B. Direkt OP vs. nRCT)." },
    statistikKollektiv1: { description: "Wählen Sie das erste Patientenkollektiv für die statistische Auswertung oder den Vergleich (nur aktiv und relevant bei Layout 'Vergleich Aktiv')." },
    statistikKollektiv2: { description: "Wählen Sie das zweite Patientenkollektiv für den statistischen Vergleich (nur aktiv und relevant bei Layout 'Vergleich Aktiv')." },
    statistikToggleVergleich: { description: "Schaltet zwischen der detaillierten Einzelansicht für das global gewählte Kollektiv und der Vergleichsansicht zweier spezifisch wählbarer Kollektive um. Die Auswahl hier beeinflusst die dargestellten Statistik-Karten." },
    deskriptiveStatistik: {
        cardTitle: "Demographie, klinische Basisdaten und Lymphknoten-Anzahlen des Kollektivs <strong>[KOLLEKTIV]</strong>.",
        alterMedian: { description: "Median des Alters mit Bereich (Minimum–Maximum) und [Mittelwert ± Standardabweichung].", name: "Alter", unit: "Jahre" },
        geschlecht: { description: "Absolute und prozentuale Geschlechterverteilung (männlich/weiblich).", name: "Geschlecht" },
        nStatus: { description: "Verteilung des pathologischen N-Status (+/-) im Kollektiv.", name: "N-Status (Patho)"},
        asStatus: { description: "Verteilung des Avocado Sign Status (+/-) im Kollektiv.", name: "AS-Status" },
        t2Status: { description: "Verteilung des T2-Status (+/-) basierend auf den aktuell angewendeten und gespeicherten Kriterien im Kollektiv.", name: "T2-Status (angewandt)" },
        lkAnzahlPatho: { description: "Anzahl histopathologisch untersuchter Lymphknoten pro Patient (Median (Min-Max) [Mean ± SD]).", name: "LK N gesamt" },
        lkAnzahlPathoPlus: { description: "Anzahl pathologisch positiver (N+) Lymphknoten pro Patient, nur bei Patienten mit N+ Status (Median (Min-Max) [Mean ± SD]).", name: "LK N+" },
        lkAnzahlAS: { description: "Gesamtzahl im T1KM-MRT sichtbarer und bewerteter Lymphknoten pro Patient (Median (Min-Max) [Mean ± SD]).", name: "LK AS gesamt" },
        lkAnzahlASPlus: { description: "Anzahl Avocado Sign positiver (AS+) Lymphknoten pro Patient, nur bei Patienten mit AS+ Status (Median (Min-Max) [Mean ± SD]).", name: "LK AS+" },
        lkAnzahlT2: { description: "Gesamtzahl im T2-MRT sichtbarer und für die Kriterienbewertung herangezogener Lymphknoten pro Patient (Median (Min-Max) [Mean ± SD]).", name: "LK T2 gesamt" },
        lkAnzahlT2Plus: { description: "Anzahl T2-positiver Lymphknoten (gemäß aktueller Kriterien) pro Patient, nur bei Patienten mit T2+ Status (Median (Min-Max) [Mean ± SD]).", name: "LK T2+" },
        chartAge: { description: "Histogramm der Altersverteilung im Kollektiv <strong>[KOLLEKTIV]</strong>. Zeigt die Häufigkeit von Patienten in verschiedenen Altersklassen." },
        chartGender: { description: "Tortendiagramm der Geschlechterverteilung im Kollektiv <strong>[KOLLEKTIV]</strong>. Zeigt den Anteil männlicher und weiblicher Patienten." },
        age: { name: "Alter", description: "Alter des Patienten in Jahren." },
        gender: { name: "Geschlecht", description: "Geschlecht des Patienten." }
    },
    diagnostischeGueteAS: { cardTitle: "Diagnostische Güte des Avocado Signs (AS) im Vergleich zur Histopathologie (N-Status) für das Kollektiv <strong>[KOLLEKTIV]</strong>. Alle Konfidenzintervalle (CI) sind 95%-CIs." },
    diagnostischeGueteT2: { cardTitle: "Diagnostische Güte der aktuell angewendeten und gespeicherten T2-Kriterien im Vergleich zur Histopathologie (N-Status) für das Kollektiv <strong>[KOLLEKTIV]</strong>. Alle CIs sind 95%-CIs." },
    statistischerVergleichASvsT2: { cardTitle: "Statistischer Vergleich der diagnostischen Leistung von Avocado Sign (AS) vs. aktuell angewendeten und gespeicherten T2-Kriterien (gepaarte Tests) im Kollektiv <strong>[KOLLEKTIV]</strong>. Untersucht, ob sich die Methoden signifikant in ihrer Genauigkeit (McNemar) oder ihrer AUC (DeLong) unterscheiden." },
    assoziationEinzelkriterien: { cardTitle: "Assoziation zwischen dem AS-Status bzw. einzelnen T2-Merkmalen (basierend auf aktuell angewandten Werten) und dem N-Status (+/-) im Kollektiv <strong>[KOLLEKTIV]</strong>. Angegeben sind Odds Ratio (OR), Risk Difference (RD) und der Phi-Koeffizient (φ) mit zugehörigen p-Werten (Fisher's Exact Test oder Mann-Whitney U für Größe). Alle CIs sind 95%-CIs." },
    vergleichKollektive: { cardTitle: "Statistischer Vergleich der Accuracy und AUC (für AS und aktuell angewandte T2-Kriterien) zwischen den beiden ausgewählten Kollektiven <strong>[KOLLEKTIV1]</strong> und <strong>[KOLLEKTIV2]</strong> (ungepaarte Tests). Prüft, ob sich die diagnostische Leistung der Methoden zwischen den Kollektiven signifikant unterscheidet." },
    criteriaComparisonTable: {
        cardTitle: "Tabellarischer Leistungsvergleich: Avocado Sign, aktuell angewandte T2-Kriterien und ausgewählte Literatur-Kriteriensets im Vergleich zum N-Status für das global gewählte Kollektiv <strong>[GLOBAL_KOLLEKTIV_NAME]</strong>. Literatur-Sets werden auf ihrem spezifischen Zielkollektiv evaluiert, falls dieses vom globalen Kollektiv abweicht (in Klammern und mit Patientenzahl N angegeben). Alle Werte sind Punkt-Schätzer ohne Konfidenzintervalle.",
        tableHeaderSet: "Methode / Kriteriensatz (Eval. auf Kollektiv, N)",
        tableHeaderSens: "Sensitivität",
        tableHeaderSpez: "Spezifität",
        tableHeaderPPV: "Positiver Prädiktiver Wert",
        tableHeaderNPV: "Negativer Prädiktiver Wert",
        tableHeaderAcc: "Accuracy",
        tableHeaderAUC: "AUC / Balanced Accuracy"
    },
    praesentation: {
        viewSelect: { description: "Wählen Sie die Ansicht: <strong>Avocado Sign (Performance)</strong> für eine Übersicht der AS-Performance in verschiedenen Kollektiven oder <strong>AS vs. T2 (Vergleich)</strong> für einen direkten Vergleich von AS mit einer spezifisch auswählbaren T2-Kriterienbasis." },
        studySelect: { description: "Wählen Sie eine T2-Kriterienbasis für den direkten Vergleich mit dem Avocado Sign. Optionen umfassen die aktuell in der App eingestellten Kriterien oder vordefinierte Sets aus publizierten Studien. Die Auswahl aktualisiert die untenstehenden Vergleichsanalysen und Diagramme. Das für den Vergleich herangezogene Patientenkollektiv passt sich ggf. automatisch an das Zielkollektiv der gewählten Studie an (wird angezeigt)." },
        t2BasisInfoCard: {
            title: "Informationen zur T2-Vergleichsbasis",
            description: "Zeigt Details zu den aktuell für den Vergleich mit AS ausgewählten T2-Kriterien. Die angezeigten Performance-Werte beziehen sich auf das angegebene Vergleichskollektiv.",
            reference: "Studienreferenz oder Quelle der Kriterien.",
            patientCohort: "Ursprüngliche Studienkohorte laut Publikation bzw. das aktuell für den Vergleich herangezogene Kollektiv (mit Patientenzahl N).",
            investigationType: "Art der Untersuchung in der Originalstudie (z.B. Primärstaging, Restaging nach nCRT).",
            focus: "Hauptfokus der Originalstudie bezüglich dieser Kriterien (z.B. Optimierung eines Größencutoffs).",
            keyCriteriaSummary: "Zusammenfassung der angewendeten T2-Kriterien und deren logische Verknüpfung."
        },
        comparisonTableCard: { description: "Numerische Gegenüberstellung der diagnostischen Gütekriterien (Sens, Spez, etc.) für AS vs. die ausgewählte T2-Basis, bezogen auf das aktuelle (Vergleichs-)Kollektiv."},
        downloadDemographicsMD: { description: "Lädt die Tabelle der demographischen Basisdaten (nur für Avocado-Sign-Performance-Ansicht) als Markdown-Datei (.md) herunter."},
        downloadPerformanceCSV: { description: "Lädt die Tabelle der diagnostischen Güte (je nach Ansicht: AS-Performance oder AS vs. T2-Basis Performance) als CSV-Datei (.csv) herunter." },
        downloadPerformanceMD: { description: "Lädt die Tabelle der diagnostischen Güte (je nach Ansicht: AS-Performance oder AS vs. T2-Basis Performance) als Markdown-Datei (.md) herunter." },
        downloadCompTestsMD: { description: "Lädt die Tabelle der statistischen Vergleichstests (McNemar für Accuracy, DeLong für AUC; AS vs. T2-Basis) als Markdown-Datei (.md) herunter." },
        downloadCompTableMD: { description: "Lädt die Tabelle mit den verglichenen Metrikwerten (AS vs. T2-Basis) als Markdown-Datei (.md) herunter."},
        downloadCompChartPNG: { description: "Lädt das Vergleichs-Balkendiagramm (AS vs. T2-Basis) als PNG-Datei herunter." },
        downloadCompChartSVG: { description: "Lädt das Vergleichs-Balkendiagramm (AS vs. T2-Basis) als Vektor-SVG-Datei herunter." },
        downloadTablePNG: { description: "Lädt die angezeigte Tabelle als PNG-Bilddatei herunter." },
        downloadCompTablePNG: { description: "Lädt die Vergleichs-Metrik-Tabelle (AS vs. T2) als PNG-Datei herunter." },
        asPurPerfTable: {
            kollektiv: "Patientenkollektiv und dessen Größe (N).",
            sens: "Sensitivität des Avocado Signs (vs. N) in diesem Kollektiv, inkl. 95% CI.",
            spez: "Spezifität des Avocado Signs (vs. N) in diesem Kollektiv, inkl. 95% CI.",
            ppv: "PPV des Avocado Signs (vs. N) in diesem Kollektiv, inkl. 95% CI.",
            npv: "NPV des Avocado Signs (vs. N) in diesem Kollektiv, inkl. 95% CI.",
            acc: "Accuracy des Avocado Signs (vs. N) in diesem Kollektiv, inkl. 95% CI.",
            auc: "AUC / Balanced Accuracy des Avocado Signs (vs. N) in diesem Kollektiv, inkl. 95% CI."
        },
        asVsT2PerfTable: {
            metric: "Diagnostische Metrik.",
            asValue: "Wert der Metrik für Avocado Sign (AS) (vs. N) im Kollektiv <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>, inkl. 95% CI.",
            t2Value: "Wert der Metrik für die T2-Basis <strong>[T2_SHORT_NAME]</strong> (vs. N) im Kollektiv <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong>, inkl. 95% CI."
        },
        asVsT2TestTable: {
            test: "Statistischer Test zum Vergleich von AS vs. <strong>[T2_SHORT_NAME]</strong>.",
            statistic: "Wert der Teststatistik (z.B. McNemar Chi-Quadrat, DeLong Z-Wert).",
            pValue: "p-Wert des Tests. Ein p-Wert < 0.05 deutet auf einen statistisch signifikanten Unterschied zwischen AS und <strong>[T2_SHORT_NAME]</strong> in Bezug auf die getestete Metrik (Accuracy oder AUC) im Kollektiv <strong>[KOLLEKTIV_NAME_VERGLEICH]</strong> hin.",
            method: "Name des verwendeten statistischen Tests und ggf. spezifische Annahmen."
        }
    },
    exportTab: {
        singleExports: "Einzelexporte",
        exportPackages: "Export-Pakete (.zip)",
        description: "Ermöglicht den Export von Analyseergebnissen, Tabellen und Diagrammen basierend auf dem aktuell gewählten globalen Kollektiv (<strong>[KOLLEKTIV]</strong>) und den aktuell angewendeten T2-Kriterien. Bitte beachten Sie, dass Diagramm- und Tabellen-PNG-Exporte im ZIP-Format nur Elemente aus dem Statistik- und Auswertungstab erfassen, die zum Zeitpunkt des Exports sichtbar/gerendert sind.",
        statsCSV: { description: "Detaillierte Tabelle aller berechneten statistischen Metriken (deskriptiv, Güte AS & T2, Vergleiche, Assoziationen) aus dem Statistik-Tab als CSV-Datei.", type: 'STATS_CSV', ext: "csv" },
        statsXLSX: { description: "Exportiert die detaillierte Tabelle aller berechneten statistischen Metriken (wie CSV-Export) als Excel-Datei (.xlsx).", type: 'STATISTIK_XLSX', ext: "xlsx" },
        bruteForceTXT: { description: "Detaillierter Bericht der letzten Brute-Force-Optimierung für das aktuelle Kollektiv (Top 10 Ergebnisse, Konfiguration) als Textdatei (.txt), falls durchgeführt.", type: 'BRUTEFORCE_TXT', ext: "txt" },
        bruteForceXLSX: { description: "Exportiert die Top-Ergebnisse der Brute-Force-Optimierung (inkl. individueller Metriken) als Excel-Datei (.xlsx).", type: 'BRUTEFORCE_XLSX', ext: "xlsx"},
        deskriptivMD: { description: "Tabelle der deskriptiven Statistik (Statistik-Tab) als Markdown (.md).", type: 'DESKRIPTIV_MD', ext: "md" },
        datenMD: { description: "Aktuelle Datenliste (Daten-Tab) als Markdown-Tabelle (.md).", type: 'DATEN_MD', ext: "md" },
        datenXLSX: { description: "Aktuelle Datenliste (Daten-Tab) als Excel-Datei (.xlsx).", type: 'DATEN_XLSX', ext: "xlsx" },
        auswertungMD: { description: "Aktuelle Auswertungstabelle (Auswertung-Tab, inkl. T2-Ergebnisse) als Markdown (.md).", type: 'AUSWERTUNG_MD', ext: "md" },
        auswertungXLSX: { description: "Aktuelle Auswertungstabelle (Auswertung-Tab, inkl. T2-Ergebnisse) als Excel-Datei (.xlsx).", type: 'AUSWERTUNG_XLSX', ext: "xlsx" },
        filteredDataCSV: { description: "Rohdaten des aktuell ausgewählten Kollektivs (inkl. T2-Bewertung) als CSV-Datei (.csv).", type: 'FILTERED_DATA_CSV', ext: "csv" },
        filteredDataXLSX: { description: "Rohdaten des aktuell ausgewählten Kollektivs (inkl. T2-Bewertung) als Excel-Datei (.xlsx).", type: 'FILTERED_DATA_XLSX', ext: "xlsx" },
        comprehensiveReportHTML: { description: "Umfassender Analysebericht als HTML-Datei (Statistiken, Konfigurationen, Diagramme), druckbar und für die interne Dokumentation geeignet.", type: 'COMPREHENSIVE_REPORT_HTML', ext: "html" },
        chartsPNG: { description: "Alle aktuell sichtbaren Diagramme (Statistik, Auswertung, Präsentation) und ausgewählte Tabellen als einzelne PNG-Dateien (ZIP-Archiv).", type: 'PNG_ZIP', ext: "zip" },
        chartsSVG: { description: "Alle aktuell sichtbaren Diagramme (Statistik, Auswertung, Präsentation) als einzelne SVG-Dateien (ZIP-Archiv).", type: 'SVG_ZIP', ext: "zip" },
        chartSinglePNG: { description: "Ausgewähltes Diagramm '{ChartName}' als PNG-Datei.", type: 'CHART_SINGLE_PNG', ext: "png"},
        chartSingleSVG: { description: "Ausgewähltes Diagramm '{ChartName}' als SVG-Datei (Vektorformat, ideal für Publikationen).", type: 'CHART_SINGLE_SVG', ext: "svg"},
        chartSingleTIFF: { description: "Ausgewähltes Diagramm '{ChartName}' als TIFF-Datei (optional, falls vom Browser unterstützt oder als Hinweis zur manuellen Konvertierung).", type: 'CHART_SINGLE_TIFF', ext: "tiff"},
        tableSinglePNG: { description: "Ausgewählte Tabelle '{TableName}' als PNG-Bilddatei.", type: 'TABLE_PNG_EXPORT', ext: "png"},
        allZIP: { description: "Alle verfügbaren Einzeldateien (Statistik-CSV/XLSX, BruteForce-TXT/XLSX, alle MDs, Rohdaten-CSV/XLSX, HTML-Report) in einem ZIP-Archiv.", type: 'ALL_ZIP', ext: "zip"},
        csvZIP: { description: "Alle verfügbaren CSV-Dateien (Statistik, Rohdaten) in einem ZIP-Archiv.", type: 'CSV_ZIP', ext: "zip"},
        xlsxZIP: { description: "Alle verfügbaren Excel-Dateien (Statistik, Daten, Auswertung, Rohdaten, BruteForce) in einem ZIP-Archiv.", type: 'XLSX_ZIP', ext: "xlsx"},
        mdZIP: { description: "Alle verfügbaren Markdown-Dateien (Deskriptiv, Daten, Auswertung, Publikationstexte) in einem ZIP-Archiv.", type: 'MD_ZIP', ext: "md"},
        pngZIP: { description: "Identisch zum 'Diagramme & Tabellen (PNG)' Einzel-Export.", type: 'PNG_ZIP', ext: "zip"},
        svgZIP: { description: "Identisch zum 'Diagramme (SVG)' Einzel-Export.", type: 'SVG_ZIP', ext: "zip"},
        publicationDOCX: { description: "Exportiert die generierten Texte des Publikation-Tabs (Methoden & Ergebnisse) als Word-Datei (.docx).", type: 'PUBLIKATION_DOCX', ext: "docx" }
    },
    publikationTabTooltips: {
        spracheSwitch: { description: "Wechselt die Sprache der generierten Texte und einiger Beschriftungen im Publikation-Tab zwischen Deutsch und Englisch." },
        sectionSelect: { description: "Wählen Sie den Abschnitt der wissenschaftlichen Publikation (Methoden oder Ergebnisse mit Unterpunkten), für den Textvorschläge und relevante Daten/Grafiken im Stil des Journals 'Radiology' angezeigt werden sollen." },
        bruteForceMetricSelect: { description: "Wählen Sie die Zielmetrik, deren Brute-Force-Optimierungsergebnisse im Ergebnisteil spezifisch hervorgehoben und verglichen werden sollen. Standardtexte beziehen sich meist auf die Default-Optimierungsmetrik (Balanced Accuracy)." },
        consortDiagram: { description: "Zeigt ein Flussdiagramm im CONSORT-Stil zur Darstellung der Patientenselektion der zugrundeliegenden Studie." },
        referenceList: { description: "Automatisch generierte Liste der im Text zitierten Referenzen im Vancouver-Stil (Beispiel)." },
        downloadPublicationDOCX: { description: "Exportiert die aktuell im Publikation-Tab generierten Textabschnitte (Methoden & Ergebnisse) als formatierte Word-Datei (.docx)." },
        methoden: {
            studienanlage: "Textvorschlag und Informationen zu Studiendesign, Ethik und verwendeter Analysesoftware, konform mit 'Radiology'-Anforderungen.",
            patientenkohorte: "Textvorschlag und Informationen zum Patientenkollektiv, Ein-/Ausschlusskriterien und Datenbasis, inklusive Verweis auf ein CONSORT-ähnliches Diagramm.",
            mrtProtokoll: "Textvorschlag und Informationen zum MRT-Protokoll (Geräte, Spulen, Sequenzparameter, Kontrastmittelgabe), detailliert für 'Radiology'.",
            asDefinition: "Textvorschlag und Informationen zur Definition und Bewertung des Avocado Signs, inklusive Reader-Setup und Interobserver-Agreement.",
            t2Definition: "Textvorschlag und Informationen zur Definition und Bewertung der verschiedenen T2-Kriteriensets (Literatur-basiert und Brute-Force optimiert), inklusive genauer Kriterienbeschreibung.",
            referenzstandard: "Textvorschlag und Informationen zum Referenzstandard (Histopathologie der Operationspräparate).",
            statistischeAnalyse: "Detaillierter Textvorschlag zu den statistischen Analysemethoden, inklusive Software, Tests, CI-Berechnung und Signifikanzniveau, passend für 'Radiology'."
        },
        ergebnisse: {
            patientencharakteristika: "Textvorschlag und relevante Tabellen/Diagramme zu den Patientencharakteristika, aufbereitet für 'Radiology'.",
            asPerformance: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte des Avocado Signs, mit CIs und exakten p-Werten.",
            literaturT2Performance: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte der Literatur-basierten T2-Kriterien.",
            optimierteT2Performance: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte der Brute-Force optimierten T2-Kriterien, inklusive Beschreibung der Optimierungszielmetrik.",
            vergleichPerformance: "Textvorschlag und relevante Tabellen/Diagramme zum statistischen Vergleich der diagnostischen Güte zwischen Avocado Sign und den verschiedenen T2-Kriteriensets (gepaarte Tests, Effektstärken)."
        }
    },
    statMetrics: {
        sens: { name: "Sensitivität", description: "Sensitivität ([METHODE] vs. N): Anteil der tatsächlich positiven Fälle (N+), die durch die Methode [METHODE] korrekt als positiv erkannt wurden.<br><i>Formel: RP / (RP + FN)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der tatsächlich N+ Patienten korrekt (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].<hr><i>Hinweis: Bei kleinen Fallzahlen für Richtig Positive (RP) oder Falsch Negative (FN) kann das Konfidenzintervall sehr breit und die Schätzung unsicher sein.</i>"},
        spez: { name: "Spezifität", description: "Spezifität ([METHODE] vs. N): Anteil der tatsächlich negativen Fälle (N-), die durch die Methode [METHODE] korrekt als negativ erkannt wurden.<br><i>Formel: RN / (RN + FP)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der tatsächlich N- Patienten korrekt (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].<hr><i>Hinweis: Bei kleinen Fallzahlen für Richtig Negative (RN) oder Falsch Positive (FP) kann das Konfidenzintervall sehr breit und die Schätzung unsicher sein.</i>"},
        ppv: { name: "Pos. Prädiktiver Wert (PPV)", description: "PPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem positiven Testergebnis durch Methode [METHODE] tatsächlich krank (N+) ist.<br><i>Formel: RP / (RP + FP)</i>", interpretation: "Wenn die Methode [METHODE] ein positives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N+ Status bei <strong>[WERT]</strong> (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig.<hr><i>Hinweis: Bei kleinen Fallzahlen für RP oder FP ist das CI ggf. sehr breit.</i>"},
        npv: { name: "Neg. Prädiktiver Wert (NPV)", description: "NPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem negativen Testergebnis durch Methode [METHODE] tatsächlich gesund (N-) ist.<br><i>Formel: RN / (RN + FN)</i>", interpretation: "Wenn die Methode [METHODE] ein negatives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N- Status bei <strong>[WERT]</strong> (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig.<hr><i>Hinweis: Bei kleinen Fallzahlen für RN oder FN ist das CI ggf. sehr breit.</i>"},
        acc: { name: "Accuracy (Gesamtgenauigkeit)", description: "Accuracy ([METHODE] vs. N): Anteil aller Fälle, die durch die Methode [METHODE] korrekt klassifiziert wurden.<br><i>Formel: (RP + RN) / Gesamtanzahl</i>", interpretation: "Die Methode [METHODE] klassifizierte insgesamt <strong>[WERT]</strong> aller Patienten korrekt (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].<hr><i>Hinweis: Bei unausgeglichenen Gruppen (stark unterschiedliche Prävalenz von N+ und N-) kann die Accuracy irreführend sein. Die Balanced Accuracy ist hier oft aussagekräftiger.</i>"},
        balAcc: { name: "Balanced Accuracy", description: "Balanced Accuracy ([METHODE] vs. N): Der Mittelwert aus Sensitivität und Spezifität. Ein robusteres Maß als Accuracy bei ungleichen Klassengrößen (Prävalenz).<br><i>Formel: (Sensitivität + Spezifität) / 2</i>", interpretation: "Die Balanced Accuracy der Methode [METHODE], die Sensitivität und Spezifität gleich gewichtet, betrug <strong>[WERT]</strong> (95%-KI nach [METHOD_CI] mit ${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} Replikationen: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]."},
        f1: { name: "F1-Score", description: "F1-Score ([METHODE] vs. N): Das harmonische Mittel aus PPV (Precision) und Sensitivität (Recall). Ein Wert von 1 ist optimal, 0 ist minimal. Berücksichtigt sowohl falsch positive als auch falsch negative Ergebnisse.<br><i>Formel: 2 * (PPV * Sensitivität) / (PPV + Sensitivität)</i>", interpretation: "Der F1-Score für die Methode [METHODE], der Präzision und Sensitivität kombiniert, beträgt <strong>[WERT]</strong> (95%-KI nach [METHOD_CI] mit ${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} Replikationen: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]."},
        auc: { name: "Area Under Curve (AUC)", description: "AUC ([METHODE] vs. N): Fläche unter der Receiver Operating Characteristic (ROC)-Kurve. Repräsentiert die Fähigkeit einer Methode, zwischen positiven und negativen Fällen zu unterscheiden. Ein Wert von 0.5 entspricht einer zufälligen Zuordnung, 1.0 einer perfekten Trennung.<br><i>Für binäre Tests (wie AS oder eine feste T2-Regel mit fixem Schwellenwert) ist AUC = Balanced Accuracy.</i>", interpretation: "Die AUC von <strong>[WERT]</strong> (95%-KI nach [METHOD_CI] mit ${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} Replikationen: [LOWER] – [UPPER]) deutet auf eine <strong>[BEWERTUNG]</strong> generelle Trennschärfe der Methode [METHODE] zwischen N+ und N- Fällen im Kollektiv [KOLLEKTIV] hin."},
        mcnemar: { name: "McNemar-Test", description: "Prüft auf einen signifikanten Unterschied in den diskordanten Paaren (Fälle, bei denen Methode AS und Methode [T2_SHORT_NAME] unterschiedliche Vorhersagen treffen) bei gepaarten Daten (d.h. beide Tests werden an denselben Patienten evaluiert).<br><i>Nullhypothese (H0): Die Anzahl der Fälle (AS+ / [T2_SHORT_NAME]-) ist gleich der Anzahl der Fälle (AS- / [T2_SHORT_NAME]+). Ein kleiner p-Wert spricht gegen H0 und deutet auf einen systematischen Unterschied in den Fehlklassifikationen hin.</i>", interpretation: "Der McNemar-Test zum Vergleich der Klassifikationsgenauigkeit von AS und [T2_SHORT_NAME] ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die Fehlklassifizierungsraten (diskordante Paare) der beiden Methoden im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
        delong: { name: "DeLong-Test", description: "Vergleicht zwei AUC-Werte von ROC-Kurven, die auf denselben (gepaarten) Daten basieren. Dieser Test berücksichtigt die Kovarianz zwischen den AUC-Schätzern.<br><i>Nullhypothese (H0): AUC(AS) = AUC([T2_SHORT_NAME]). Ein kleiner p-Wert spricht gegen H0 und für einen Unterschied in der Trennschärfe.</i>", interpretation: "Der DeLong-Test zum Vergleich der AUC-Werte ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die AUC-Werte (bzw. Balanced Accuracies bei binären Tests) von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
        phi: { name: "Phi-Koeffizient (φ)", description: "Maß für die Stärke und Richtung des Zusammenhangs zwischen zwei binären Variablen (z.B. Vorhandensein von Merkmal '[MERKMAL]' und N-Status). Wertebereich von -1 bis +1. Ein Wert von 0 bedeutet keinen Zusammenhang, ±1 einen perfekten Zusammenhang.", interpretation: "Der Phi-Koeffizient von <strong>[WERT]</strong> deutet auf einen <strong>[BEWERTUNG]</strong> Zusammenhang zwischen dem Merkmal '[MERKMAL]' und dem N-Status im Kollektiv [KOLLEKTIV] hin."},
        rd: { name: "Risk Difference (RD)", description: "Absolute Differenz in der Wahrscheinlichkeit (Risiko) für einen positiven N-Status zwischen Patienten mit und ohne das Merkmal '[MERKMAL]'. Berechnet als: P(N+|Merkmal+) - P(N+|Merkmal-). Ein RD von 0 bedeutet keinen Unterschied im Risiko.", interpretation: "Das Risiko für einen N+ Status war bei Patienten mit dem Merkmal '[MERKMAL]' um <strong>[WERT]%</strong> absolut [HOEHER_NIEDRIGER] als bei Patienten ohne dieses Merkmal (95%-KI nach [METHOD_CI]: [LOWER]% – [UPPER]%) im Kollektiv [KOLLEKTIV]."},
        or: { name: "Odds Ratio (OR)", description: "Quotient der Odds (Chance) für einen positiven N-Status bei Vorhandensein des Merkmals '[MERKMAL]' im Vergleich zur Abwesenheit des Merkmals. OR = Odds(N+|Merkmal+) / Odds(N+|Merkmal-).<br>OR > 1: Erhöhte Odds für N+ bei Vorhandensein des Merkmals.<br>OR < 1: Verringerte Odds.<br>OR = 1: Keine Assoziation.", interpretation: "Die Chance (Odds) für einen N+ Status war bei Patienten mit dem Merkmal '[MERKMAL]' um den Faktor <strong>[WERT]</strong> [FAKTOR_TEXT] im Vergleich zu Patienten ohne dieses Merkmal (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER], p=[P_WERT], [SIGNIFIKANZ]) im Kollektiv [KOLLEKTIV]."},
        fisher: { name: "Fisher's Exact Test", description: "Exakter Test zur Prüfung auf einen signifikanten Zusammenhang zwischen zwei kategorialen Variablen (z.B. Vorhandensein des Merkmals '[MERKMAL]' vs. N-Status). Geeignet auch für kleine Stichproben oder wenn erwartete Häufigkeiten in Zellen der Kontingenztafel gering sind.<br><i>Nullhypothese (H0): Es besteht kein Zusammenhang zwischen den beiden Variablen.</i>", interpretation: "Der exakte Test nach Fisher ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet auf einen [SIGNIFIKANZ_TEXT] Zusammenhang zwischen dem Merkmal '[MERKMAL]' und dem N-Status im Kollektiv [KOLLEKTIV] hin."},
        mannwhitney: { name: "Mann-Whitney-U-Test", description: "Nichtparametrischer Test zum Vergleich der zentralen Tendenz (Median) einer kontinuierlichen Variablen (z.B. '[VARIABLE]') zwischen zwei unabhängigen Gruppen (z.B. N+ vs. N- Patienten).<br><i>Nullhypothese (H0): Die Verteilungen der Variablen '[VARIABLE]' in den beiden Gruppen sind identisch.</i>", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies zeigt einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Variable '[VARIABLE]' zwischen N+ und N- Patienten im Kollektiv [KOLLEKTIV]."},
        ci95: { name: "95% Konfidenzintervall (CI)", description: "Der Wertebereich, der den wahren (unbekannten) Populationsparameter der Metrik mit 95%iger Wahrscheinlichkeit überdeckt, basierend auf den vorliegenden Stichprobendaten.<br><i>Berechnungsmethode: [METHOD_CI]</i>", interpretation: "Basierend auf den Daten liegt der wahre Wert der Metrik mit 95%iger Sicherheit zwischen [LOWER] und [UPPER]."},
        konfusionsmatrix: { description: "Die Konfusionsmatrix (auch Wahrheitsmatrix genannt) stellt die Klassifikationsergebnisse der Methode [METHODE] dem tatsächlichen N-Status gegenüber. Sie zeigt: Richtig Positive (RP), Falsch Positive (FP), Falsch Negative (FN) und Richtig Negative (RN)." },
        accComp: { name: "Accuracy Vergleich (ungepaart)", description: "Vergleicht die Accuracy der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels Fisher's Exact Test.<br><i>Nullhypothese (H0): Die Accuracy der Methode [METHODE] ist in Kollektiv1 und Kollektiv2 gleich.</i>", interpretation: "Der Unterschied in der Accuracy der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
        aucComp: { name: "AUC Vergleich (ungepaart)", description: "Vergleicht die AUC der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels eines Z-Tests, basierend auf den Standardfehlern der AUCs (typischerweise aus Bootstrap-Verfahren).<br><i>Nullhypothese (H0): Die AUC der Methode [METHODE] ist in Kollektiv1 und Kollektiv2 gleich.</i>", interpretation: "Der Unterschied in der AUC der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
        defaultP: { interpretation: `Der berechnete p-Wert beträgt <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Bei einem Signifikanzniveau von &alpha; = ${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,2).replace('.',',')} ist dieses Ergebnis <strong>[SIGNIFIKANZ_TEXT]</strong>.` },
        size_mwu: {name: "LK Größe MWU", description: "Vergleich der medianen Lymphknotengrößen (Kurzachse) zwischen den Lymphknoten von N+ Patienten und den Lymphknoten von N- Patienten mittels Mann-Whitney-U-Test. Diese Analyse erfolgt auf Lymphknoten-Ebene, nicht auf Patienten-Ebene.", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies zeigt einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Lymphknotengrößen zwischen den Lymphknoten von N+ und N- Patienten im Kollektiv [KOLLEKTIV]."}
    }
};

deepFreeze(UI_TEXTS);
deepFreeze(TOOLTIP_CONTENT);
