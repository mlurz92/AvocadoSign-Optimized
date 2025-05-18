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
        'applied_criteria': 'Eingestellte T2 Kriterien',
        'unbekannt': 'Unbekannt'
    },
    t2LogicDisplayNames: {
        'UND': 'UND',
        'ODER': 'ODER',
        'KOMBINIERT': 'KOMBINIERT'
    },
    publikationTab: {
        spracheSwitchLabel: {
            de: 'Deutsch',
            en: 'English'
        },
        sectionLabels: {
            methoden: 'Methoden',
            ergebnisse: 'Ergebnisse'
        },
        methodenCardTitle: {
            de: 'Methodenteil (Vorschlag)',
            en: 'Methods Section (Suggestion)'
        },
        ergebnisseCardTitle: {
            de: 'Ergebnisteil (Vorschlag)',
            en: 'Results Section (Suggestion)'
        },
        publicationDataCardTitle: {
            de: 'Unterstützende Daten & Visualisierungen',
            en: 'Supporting Data & Visualizations'
        }
    },
    chartTitles: {
        ageDistribution: 'Altersverteilung',
        genderDistribution: 'Geschlechterverteilung',
        therapyDistribution: 'Therapiegruppen',
        statusN: 'N-Status (Pathologie)',
        statusAS: 'Avocado Sign Status',
        statusT2: 'T2-Status (angewandt)',
        comparisonBar: 'Vergleich AS vs. {T2Name}',
        rocCurve: 'ROC-Kurve für {Method}',
        asPerformance: 'Avocado Sign Performance',
        publicationROCComparison: 'Abb. 1: ROC-Kurven Vergleich (Gesamtkollektiv)',
        publicationMetricComparisonBar: 'Abb. 2: Vergleich {METRIC_NAME} (AS vs. Literatur vs. Brute-Force T2)'
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
        currentT2: 'T2 Kriterien (angewandt)',
        benignLN: 'Benigne LK',
        malignantLN: 'Maligne LK'
    },
    criteriaComparison: {
        title: "Vergleich diagnostischer Güte",
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
        patientenLabel: "Patientenliste (.xlsx)",
        auswertungLabel: "Auswertungstabelle (.xlsx)",
        statistikLabel: "Statistik Übersicht (.xlsx)",
        filteredDataLabel: "Gefilterte Daten (.xlsx)",
        zipLabel: "Alle Excel-Tabellen (.zip)"
    },
    singleChartDownload: {
        pngLabel: "Als PNG herunterladen",
        svgLabel: "Als SVG herunterladen"
    }
};

const TOOLTIP_CONTENT = {
    kollektivButtons: { description: "Wählen Sie das Patientenkollektiv für alle Analysen aus: <strong>Gesamt</strong> (alle Patienten), <strong>Direkt OP</strong> (nur primär operierte Patienten ohne neoadjuvante Therapie) oder <strong>nRCT</strong> (nur Patienten nach neoadjuvanter Radiochemotherapie). Die Auswahl filtert die Datenbasis für alle Tabs." },
    headerStats: {
        kollektiv: "Aktuell für die Analyse und Darstellung ausgewähltes Patientenkollektiv.",
        anzahlPatienten: "Gesamtzahl der Patienten im aktuell ausgewählten Kollektiv.",
        statusN: "Prozentualer Anteil der Patienten mit positivem (+) histopathologischem Lymphknotenstatus (N+) im ausgewählten Kollektiv. Dies dient als Referenzstandard (Goldstandard).",
        statusAS: "Prozentualer Anteil der Patienten mit positivem (+) Lymphknotenstatus gemäß der Vorhersage durch das Avocado Sign (AS) im ausgewählten Kollektiv.",
        statusT2: "Prozentualer Anteil der Patienten mit positivem (+) Lymphknotenstatus gemäß der Vorhersage durch die aktuell im Reiter 'Auswertung' **angewendeten und gespeicherten** T2-gewichteten Kriterien für das ausgewählte Kollektiv."
    },
    datenTable: {
        nr: "Eindeutige, fortlaufende interne Identifikationsnummer des Patienten.",
        name: "Nachname des Patienten (anonymisiert/kodiert).",
        vorname: "Vorname des Patienten (anonymisiert/kodiert).",
        geschlecht: "Biologisches Geschlecht des Patienten (m: männlich, w: weiblich, ?: unbekannt).",
        alter: "Alter des Patienten zum Zeitpunkt der MRT-Untersuchung in Jahren.",
        therapie: "Angewandte Therapie vor der Operation (nRCT: neoadjuvante Radiochemotherapie, Direkt OP: keine Vorbehandlung/primäre Operation, Unbekannt: keine Angabe).",
        n_as_t2: "Kombinierte Statusanzeige für diesen Patienten:<br><strong>N:</strong> Histopathologischer N-Status (+ oder -).<br><strong>AS:</strong> Avocado Sign Status (+ oder -).<br><strong>T2:</strong> Status basierend auf aktuell angewendeten T2-Kriterien (+ oder -).<br>Klicken Sie auf N, AS oder T2, um nach dem jeweiligen Status zu sortieren.",
        bemerkung: "Zusätzliche klinische oder radiologische Anmerkungen zum Patientenfall oder zur Bildqualität, falls vorhanden.",
        expandAll: "Öffnet oder schließt die Detailansicht zu den T2-gewichteten Lymphknotenmerkmalen für alle Patienten in der aktuellen Tabellenansicht.",
        expandRow: "Zeigt/verbirgt die detaillierten morphologischen Eigenschaften (Größe, Form, Kontur, Homogenität, Signalintensität) jedes einzelnen im T2w-MRT erfassten Lymphknotens dieses Patienten."
    },
    auswertungTable: {
        nr: "Eindeutige, fortlaufende interne Identifikationsnummer des Patienten.",
        name: "Nachname des Patienten (anonymisiert/kodiert).",
        therapie: "Angewandte Therapie vor der Operation.",
        n_as_t2: "Kombinierte Statusanzeige für diesen Patienten:<br><strong>N:</strong> Histopathologischer N-Status (+ oder -).<br><strong>AS:</strong> Avocado Sign Status (+ oder -).<br><strong>T2:</strong> Status basierend auf aktuell angewendeten T2-Kriterien (+ oder -).<br>Klicken Sie auf N, AS oder T2, um nach dem jeweiligen Status zu sortieren.",
        n_counts: "Anzahl pathologisch positiver (N+) Lymphknoten / Gesamtzahl histopathologisch untersuchter Lymphknoten für diesen Patienten.",
        as_counts: "Anzahl als positiv bewerteter Avocado Sign (AS+) Lymphknoten / Gesamtzahl im T1KM-MRT sichtbarer und bewerteter Lymphknoten für diesen Patienten.",
        t2_counts: "Anzahl als positiv bewerteter T2-Lymphknoten (gemäß aktuell angewendeter Kriterien) / Gesamtzahl im T2-MRT sichtbarer Lymphknoten für diesen Patienten.",
        expandAll: "Öffnet oder schließt die Detailansicht der bewerteten T2-gewichteten Lymphknoten und der erfüllten Kriterien für alle Einträge in der aktuellen Tabellenansicht.",
        expandRow: "Zeigt/verbirgt die detaillierte Bewertung der einzelnen T2-gewichteten Lymphknoten dieses Patienten gemäß der aktuell angewendeten T2-Kriterien. Merkmale, die zur Positiv-Bewertung eines Lymphknotens beigetragen haben (abhängig von UND/ODER-Logik), werden visuell hervorgehoben."
    },
    t2Logic: { description: `Legt die logische Verknüpfung der aktiven T2-Kriterien fest:<br><strong>UND:</strong> Ein Lymphknoten wird nur dann als positiv bewertet, wenn ALLE aktivierten Kriterien erfüllt sind.<br><strong>ODER:</strong> Ein Lymphknoten wird als positiv bewertet, wenn MINDESTENS EIN aktiviertes Kriterium erfüllt ist.` },
    t2Size: { description: `Größenkriterium für T2-Lymphknoten.<br>Lymphknoten mit einem Kurzachsendurchmesser <strong>größer oder gleich (≥)</strong> dem hier eingestellten Schwellenwert gelten als suspekt für dieses Kriterium.<br>Einstellbarer Bereich: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} mm bis ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm.<br>Aktivieren/Deaktivieren Sie dieses Kriterium mit der Checkbox links.` },
    t2Form: { description: `Formkriterium für T2-Lymphknoten.<br>Wählen Sie, welche Form ('rund' oder 'oval') als suspekt für Malignität gilt. Ein Lymphknoten wird als 'rund' klassifiziert, wenn das Verhältnis von Kurzachse zu Langachse nahe 1 ist.<br>Aktivieren/Deaktivieren Sie dieses Kriterium mit der Checkbox links.` },
    t2Kontur: { description: `Konturkriterium für T2-Lymphknoten.<br>Wählen Sie, welche Kontur ('scharf' oder 'irregulär') als suspekt für Malignität gilt. 'Irregulär' umfasst auch unscharfe oder spikulierte Ränder.<br>Aktivieren/Deaktivieren Sie dieses Kriterium mit der Checkbox links.` },
    t2Homogenitaet: { description: `Homogenitätskriterium für T2-Lymphknoten.<br>Wählen Sie, ob eine 'homogene' (gleichmäßige) oder 'heterogene' (ungleichmäßige) Binnenstruktur im T2w-Signal als suspekt für Malignität gilt.<br>Aktivieren/Deaktivieren Sie dieses Kriterium mit der Checkbox links.` },
    t2Signal: { description: `Signalkriterium für T2-Lymphknoten.<br>Wählen Sie, welche T2-Signalintensität ('signalarm', 'intermediär' oder 'signalreich') relativ zur umgebenden Gesäßmuskulatur als suspekt für Malignität gilt. Lymphknoten, bei denen das Signal nicht eindeutig beurteilbar war (in den Daten als 'null' kodiert), erfüllen dieses Kriterium definitionsgemäß nie.<br>Aktivieren/Deaktivieren Sie dieses Kriterium mit der Checkbox links.` },
    t2Actions: {
        reset: "Setzt die Logik und alle T2-Kriterien auf die vordefinierten Standardwerte zurück (siehe Konfigurationsdatei `config.js`). Die Änderungen sind danach noch nicht aktiv und müssen erst mit 'Anwenden & Speichern' übernommen werden.",
        apply: "Übernimmt die aktuell eingestellten T2-Kriterien und die gewählte Verknüpfungslogik für alle Analysen in der Anwendung. Dies aktualisiert die T2-Spalten in den Tabellen, alle statistischen Auswertungen, Diagramme sowie die Header-Statistiken. Die gewählte Konfiguration wird zudem im Local Storage des Browsers für zukünftige Sitzungen gespeichert."
    },
    t2CriteriaCard: { unsavedIndicator: "<strong>Achtung: Ungespeicherte Änderungen!</strong><br>Sie haben Änderungen an den T2-Kriterien oder der Logik vorgenommen, die noch nicht angewendet wurden. Klicken Sie auf 'Anwenden & Speichern', um die Ergebnisse in der gesamten Anwendung zu aktualisieren und Ihre Einstellungen zu sichern." },
    t2MetricsOverview: {
        cardTitle: "Kurzübersicht der diagnostischen Güte für die aktuell im Reiter 'Auswertung' **angewendeten und gespeicherten** T2-Kriterien im Vergleich zum histopathologischen N-Status für das aktuell ausgewählte Kollektiv: [KOLLEKTIV].",
        sens: "Sensitivität der aktuellen T2-Kriterien (vs. N).",
        spez: "Spezifität der aktuellen T2-Kriterien (vs. N).",
        ppv: "Positiver Prädiktiver Wert (PPV) der aktuellen T2-Kriterien (vs. N).",
        npv: "Negativer Prädiktiver Wert (NPV) der aktuellen T2-Kriterien (vs. N).",
        acc: "Accuracy (Gesamtgenauigkeit) der aktuellen T2-Kriterien (vs. N).",
        balAcc: "Balanced Accuracy der aktuellen T2-Kriterien (vs. N).",
        f1: "F1-Score der aktuellen T2-Kriterien (vs. N).",
        auc: "AUC (Area Under Curve) der aktuellen T2-Kriterien (vs. N), hier äquivalent zur Balanced Accuracy."
     },
    bruteForceMetric: { description: "Wählen Sie die diagnostische Metrik aus, die durch die Brute-Force-Suche maximiert werden soll. Der Vergleich erfolgt immer gegen den pathologischen N-Status als Referenz.<br><strong>Accuracy:</strong> Anteil korrekt klassifizierter Fälle.<br><strong>Balanced Accuracy:</strong> Mittelwert aus Sensitivität und Spezifität; gut geeignet bei unbalancierten Stichprobengrößen (N+ vs. N-). Entspricht der AUC für binäre Klassifikatoren.<br><strong>F1-Score:</strong> Harmonisches Mittel aus PPV und Sensitivität; nützlich, wenn sowohl falsch positive als auch falsch negative Ergebnisse minimiert werden sollen.<br><strong>Positiver Prädiktiver Wert (PPV):</strong> Wahrscheinlichkeit, dass ein positiver Test korrekt ist.<br><strong>Negativer Prädiktiver Wert (NPV):</strong> Wahrscheinlichkeit, dass ein negativer Test korrekt ist." },
    bruteForceStart: { description: "Startet die exhaustive Brute-Force-Suche. Der Algorithmus testet systematisch alle sinnvollen Kombinationen von aktiven T2-Kriterien, deren Werten und der logischen Verknüpfung (UND/ODER), um die Einstellung zu finden, welche die oben ausgewählte Zielmetrik maximiert. Dies kann je nach Kollektivgröße und Komplexität einige Zeit in Anspruch nehmen. Der Prozess läuft im Hintergrund und blockiert die UI nicht." },
    bruteForceInfo: { description: "Zeigt den aktuellen Status des Brute-Force-Optimierungs-Workers (Hintergrundprozess) und das Patientenkollektiv an, auf das die Optimierung angewendet wird." },
    bruteForceProgress: { description: "Zeigt den Fortschritt der laufenden Optimierung an: Anzahl bereits getesteter Kriterienkombinationen von insgesamt zu testenden [TOTAL] möglichen Kombinationen, sowie die bisher beste gefundene Metrik mit den zugehörigen Kriterien und der Logik." },
    bruteForceResult: { description: "Zeigt das Ergebnis der abgeschlossenen Optimierung: die beste gefundene Kriterienkombination (Logik, aktive Kriterien, Werte) und den damit erreichten Wert der Zielmetrik für das analysierte Kollektiv, sowie die Dauer der Berechnung und die Gesamtzahl der getesteten Kombinationen." },
    bruteForceDetailsButton: { description: "Öffnet ein separates Fenster (Modal), das eine sortierte Liste der Top 10 gefundenen Kriterienkombinationen (einschließlich solcher mit identischem bestem Metrikwert) und weitere Details zur durchgeführten Optimierung anzeigt. Von dort kann auch ein Textbericht exportiert werden." },
    bruteForceModal: { exportButton: "Exportiert den detaillierten Bericht der Brute-Force-Optimierung, inklusive der Top 10 Ergebnisse und der Konfiguration (Zielmetrik, Kollektiv, Dauer, Anzahl Tests), als formatierte Textdatei (.txt)." },
    statistikLayout: { description: "Wählen Sie die Anzeigeart für die statistischen Ergebnisse:<br><strong>Einzelansicht Aktiv:</strong> Zeigt die detaillierte Statistik für die global im Header ausgewählte Patientengruppe.<br><strong>Vergleich Aktiv:</strong> Ermöglicht die Auswahl von zwei spezifischen Kollektiven (z.B. 'Direkt OP' vs. 'nRCT') und zeigt deren Statistiken nebeneinander sowie zusätzliche statistische Tests zum direkten Vergleich der Performance-Metriken zwischen den beiden Gruppen an." },
    statistikKollektiv1: { description: "Wählen Sie das erste Patientenkollektiv für die statistische Auswertung bzw. den Vergleich (nur aktiv und relevant, wenn die Layout-Option 'Vergleich Aktiv' ausgewählt ist)." },
    statistikKollektiv2: { description: "Wählen Sie das zweite Patientenkollektiv für den statistischen Vergleich (nur aktiv und relevant, wenn die Layout-Option 'Vergleich Aktiv' ausgewählt ist)." },
    statistikToggleVergleich: { description: "Schaltet die Ansicht des Statistik-Tabs um. Entweder detaillierte Analyse für ein global gewähltes Kollektiv ('Einzelansicht Aktiv') oder vergleichende Analyse zweier spezifisch wählbarer Kollektive ('Vergleich Aktiv')." },
    deskriptiveStatistik: {
        cardTitle: "Überblick über die demographischen Daten (Alter, Geschlecht), Therapieart und Verteilung der N-, AS- und T2-Status sowie Lymphknotenanzahlen im ausgewählten Kollektiv ([KOLLEKTIV]).",
        alterMedian: { description: "Median des Alters der Patienten im Kollektiv [KOLLEKTIV]. Der Median ist der zentrale Wert, der die Patienten nach Alter in zwei gleich große Hälften teilt. Angegeben mit Minimum-Maximum und in eckigen Klammern [Mittelwert ± Standardabweichung]." },
        geschlecht: { description: "Absolute Anzahl (n) und prozentuale Verteilung (%) der Geschlechter (männlich/weiblich) im Kollektiv [KOLLEKTIV]." },
        nStatus: { description: "Absolute Anzahl (n) und prozentualer Anteil (%) der Patienten mit positivem (+) bzw. negativem (-) histopathologischem N-Status (Referenzstandard) im Kollektiv [KOLLEKTIV]." },
        asStatus: { description: "Absolute Anzahl (n) und prozentualer Anteil (%) der Patienten mit positivem (+) bzw. negativem (-) vorhergesagtem Avocado Sign (AS)-Status im Kollektiv [KOLLEKTIV]." },
        t2Status: { description: "Absolute Anzahl (n) und prozentualer Anteil (%) der Patienten mit positivem (+) bzw. negativem (-) vorhergesagtem T2-Status (basierend auf aktuell angewendeten Kriterien) im Kollektiv [KOLLEKTIV]." },
        lkAnzahlPatho: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Gesamtzahl histopathologisch untersuchter Lymphknoten (LK N gesamt) pro Patient im Kollektiv [KOLLEKTIV]." },
        lkAnzahlPathoPlus: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Anzahl pathologisch positiver (N+) Lymphknoten (LK N+) pro Patient, *nur* bezogen auf die Patienten im Kollektiv [KOLLEKTIV], die tatsächlich N+ waren." },
        lkAnzahlAS: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Gesamtzahl im T1KM-MRT detektierter und für das Avocado Sign bewerteter Lymphknoten (LK AS gesamt) pro Patient im Kollektiv [KOLLEKTIV]." },
        lkAnzahlASPlus: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Anzahl als positiv bewerteter Avocado Sign Lymphknoten (LK AS+) pro Patient, *nur* bezogen auf die Patienten im Kollektiv [KOLLEKTIV], die AS+ waren." },
        lkAnzahlT2: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Gesamtzahl im T2-MRT detektierter Lymphknoten (LK T2 gesamt) pro Patient im Kollektiv [KOLLEKTIV]." },
        lkAnzahlT2Plus: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Anzahl als positiv bewerteter T2-Lymphknoten (LK T2+, gemäß aktuell angewendeter Kriterien) pro Patient, *nur* bezogen auf die Patienten im Kollektiv [KOLLEKTIV], die T2+ waren." },
        chartAge: { description: "Histogramm der Altersverteilung der Patienten im Kollektiv [KOLLEKTIV]. Die x-Achse zeigt Altersgruppen, die y-Achse die Anzahl der Patienten." },
        chartGender: { description: "Tortendiagramm der Geschlechterverteilung (männlich/weiblich) im Kollektiv [KOLLEKTIV]." }
    },
    diagnostischeGueteAS: { cardTitle: "Detaillierte diagnostische Gütekriterien für das Avocado Sign (AS) im Vergleich zur Histopathologie (N) als Referenzstandard für das ausgewählte Kollektiv ([KOLLEKTIV]). Alle Werte inklusive 95% Konfidenzintervall (CI) und der verwendeten CI-Methode." },
    diagnostischeGueteT2: { cardTitle: "Detaillierte diagnostische Gütekriterien für die aktuell im Reiter 'Auswertung' **angewendeten und gespeicherten** T2-Kriterien im Vergleich zur Histopathologie (N) als Referenzstandard für das ausgewählte Kollektiv ([KOLLEKTIV]). Alle Werte inklusive 95% Konfidenzintervall (CI) und der verwendeten CI-Methode." },
    statistischerVergleichASvsT2: { cardTitle: "Direkter statistischer Vergleich der diagnostischen Leistung des Avocado Signs (AS) versus der aktuell angewendeten T2-Kriterien innerhalb desselben Patientenkollektivs ([KOLLEKTIV]) mittels gepaarter statistischer Tests. Untersucht werden Unterschiede in der Accuracy (McNemar-Test) und der AUC (DeLong-Test)." },
    assoziationEinzelkriterien: { cardTitle: "Analyse der Assoziation zwischen dem Avocado Sign-Status bzw. einzelnen T2-Merkmalen (unabhängig von deren Aktivierung in den benutzerdefinierten Kriterien) und dem histopathologischen N-Status (+/-) im ausgewählten Kollektiv ([KOLLEKTIV]). Angegeben sind Odds Ratio (OR), Risk Difference (RD), der Phi-Koeffizient (φ) sowie p-Werte aus geeigneten statistischen Tests (Fisher's Exact Test für kategoriale Merkmale, Mann-Whitney-U-Test für Lymphknotengrößenvergleich zwischen N+ und N-)." },
    vergleichKollektive: { cardTitle: "Statistischer Vergleich der diagnostischen Leistung (Accuracy, AUC für AS und für aktuell angewandte T2-Kriterien) zwischen den beiden ausgewählten Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels Tests für unabhängige Stichproben. Dient der Untersuchung, ob sich die Performanz einer Methode signifikant zwischen den Gruppen unterscheidet." },
    criteriaComparisonTable: {
        cardTitle: "Tabellarischer Vergleich der wichtigsten diagnostischen Gütekriterien verschiedener Methoden/Kriteriensätze (Avocado Sign, aktuell angewandte T2-Kriterien, publizierte Literatur-Kriteriensets) für das ausgewählte Kollektiv ([KOLLEKTIV]).",
        tableHeaderSet: "Verglichene Methode oder das angewendete T2-Kriterienset.",
        tableHeaderSens: "Sensitivität: Anteil der korrekt als positiv erkannten N+ Fälle durch die jeweilige Methode.",
        tableHeaderSpez: "Spezifität: Anteil der korrekt als negativ erkannten N- Fälle durch die jeweilige Methode.",
        tableHeaderPPV: "Positiver Prädiktiver Wert (PPV): Wahrscheinlichkeit, dass ein Patient mit einem positiven Testergebnis der Methode tatsächlich N+ ist.",
        tableHeaderNPV: "Negativer Prädiktiver Wert (NPV): Wahrscheinlichkeit, dass ein Patient mit einem negativen Testergebnis der Methode tatsächlich N- ist.",
        tableHeaderAcc: "Accuracy (Gesamtgenauigkeit): Anteil aller Fälle, die durch die jeweilige Methode korrekt klassifiziert wurden.",
        tableHeaderAUC: "Area Under Curve (AUC) bzw. Balanced Accuracy: Ein Maß für die Gesamt-Trennschärfe der Methode zwischen N+ und N- Fällen (0.5 = zufällige Klassifikation, 1.0 = perfekte Klassifikation)."
    },
    logisticRegressionCard: { cardTitle: "Ergebnisse der logistischen Regression zur Modellierung der Wahrscheinlichkeit für einen positiven N-Status (N+) basierend auf ausgewählten Prädiktoren (z.B. T2-Merkmale, Alter) für das Kollektiv [KOLLEKTIV]. (Diese Funktion ist experimentell und dient der explorativen Datenanalyse.)" },
    rocCurveCard: { cardTitle: "Receiver Operating Characteristic (ROC) Kurve für die Unterscheidung zwischen N+ und N- Fällen basierend auf der Methode '{Variable}' für das Kollektiv [KOLLEKTIV]. Die Kurve zeigt die Sensitivität (Richtig-Positiv-Rate) gegen 1-Spezifität (Falsch-Positiv-Rate) über verschiedene Schwellenwerte. Die Diagonale (gestrichelt) repräsentiert eine zufällige Klassifikation (AUC=0.5). Eine Kurve, die näher an der oberen linken Ecke liegt, deutet auf eine bessere diagnostische Leistung hin." },
    publikationTab: {
        languageSwitch: "Wechselt die Sprache der generierten Textvorschläge und UI-Elemente innerhalb des 'Publikation'-Tabs zwischen Deutsch und Englisch. Die Auswahl wird gespeichert.",
        sectionButtonMethoden: "Zeigt den generierten Textvorschlag und zugehörige Tabellen/Diagramme für den Methoden-Abschnitt der wissenschaftlichen Publikation an.",
        sectionButtonErgebnisse: "Zeigt den generierten Textvorschlag und zugehörige Tabellen/Diagramme für den Ergebnisse-Abschnitt der wissenschaftlichen Publikation an.",
        methodenSectionCard: "Vollständig ausformulierter Textvorschlag für den Methodenabschnitt Ihrer Publikation, basierend auf den Studiendaten, den Referenzpublikationen und den durchgeführten Analysen.",
        ergebnisseSectionCard: "Vollständig ausformulierter Textvorschlag für den Ergebnisabschnitt Ihrer Publikation, der die Performance des Avocado Signs im Vergleich zu Literatur-basierten und mittels Brute-Force optimierten T2-Kriterien detailliert darstellt, inklusive statistischer Vergleiche.",
        publicationDataCardTitle: "Unterstützende Daten und Visualisierungen für den aktuellen Publikationsabschnitt. Enthält Tabellen und Platzhalter für Diagramme, die dynamisch mit den Ergebnissen der Analysen gefüllt werden.",
        publicationTablePlaceholder: "Platzhalter für eine Tabelle, die hier dynamisch basierend auf den Ergebnissen und der Sprachauswahl generiert wird.",
        publicationChartPlaceholder: "Platzhalter für ein Diagramm, das hier dynamisch basierend auf den Ergebnissen und der Sprachauswahl generiert wird."
    },
    praesentation: {
        viewSelect: { description: "Wählen Sie die Datenansicht für den Präsentations-Tab:<br><strong>Avocado Sign (Daten):</strong> Zeigt die dynamisch berechneten Kernergebnisse für die Performance des Avocado Signs im aktuell ausgewählten globalen Kollektiv sowie vergleichend für alle drei Subgruppen (Gesamt, Direkt OP, nRCT).<br><strong>AS vs. T2 (Vergleich):</strong> Ermöglicht einen dynamischen Vergleich des Avocado Signs mit einem ausgewählten T2-Kriterienset (entweder die aktuell im 'Auswertung'-Tab eingestellten oder vordefinierte Literatur-Kriteriensets) für das aktuell global ausgewählte Patientenkollektiv." },
        studySelect: { description: "Wählen Sie eine Quelle für die T2-Kriterien, die mit dem Avocado Sign verglichen werden sollen:<br>- 'Eingestellte T2 Kriterien': Verwendet die aktuell im Reiter 'Auswertung' definierten und angewendeten Kriterien.<br>- Publizierte Studien: Verwendet die T2-Kriterien wie in der jeweiligen Studie beschrieben (z.B. Koh et al. 2008, Barbaro et al. 2024, Rutegård et al. 2025/ESGAR 2016).<br>Die Auswahl aktualisiert die Info-Karte und den Vergleichs-Chart. Der Vergleich basiert immer auf dem aktuell im Header ausgewählten globalen Patientenkollektiv; dieses wird ggf. automatisch an das Anwendbarkeitskollektiv des gewählten Literaturkriteriums angepasst (z.B. nRCT für Barbaro)." },
        t2BasisInfoCard: {
            title: "Details zur T2-Vergleichsbasis",
            description: "Zeigt detaillierte Informationen zu den aktuell für den Vergleich ausgewählten T2-Kriterien.",
            reference: "Quellpublikation oder Herkunft der aktuell für den Vergleich herangezogenen T2-Kriterien.",
            patientCohort: "Ursprüngliche Patientenkohorte und Art der Untersuchung (z.B. Primärstaging, Restaging) in der Studie, aus der die Kriterien stammen, oder Angabe zum aktuell gewählten Kollektiv bei benutzerdefinierten Kriterien.",
            investigationType: "Art der Untersuchung in der Originalstudie (z.B. Primärstaging oder Restaging nach nRCT), für die die T2-Kriterien ursprünglich beschrieben wurden.",
            focus: "Hauptfokus oder primäre Fragestellung der Studie, aus der die T2-Kriterien entnommen wurden, bzw. aktueller Fokus bei benutzerdefinierten Kriterien.",
            keyCriteriaSummary: "Kurze Zusammenfassung der spezifischen T2-Malignitätskriterien, die für den aktuellen Vergleich herangezogen werden (z.B. Schwellenwerte, morphologische Merkmale, logische Verknüpfung)."
        },
        comparisonTableCard: { description: "Zeigt die numerischen Werte der diagnostischen Gütekriterien für den direkten Vergleich von Avocado Sign versus der ausgewählten T2-Vergleichsbasis für das aktuell global ausgewählte Patientenkollektiv."},
        downloadDemographicsMD: { description: "Lädt die Tabelle der demographischen Basisdaten und Statusverteilungen für das Avocado Sign (nur für die Ansicht 'Avocado Sign (Daten)') als Markdown-Datei (.md) herunter." },
        downloadPerformanceCSV: { description: "Lädt die angezeigte Tabelle der diagnostischen Gütekriterien (je nach aktueller Ansicht: Avocado Sign Performance für alle Kollektive ODER Vergleich AS vs. ausgewählte T2-Basis für das aktuelle Kollektiv) als CSV-Datei (.csv) herunter." },
        downloadPerformanceMD: { description: "Lädt die angezeigte Tabelle der diagnostischen Gütekriterien (je nach aktueller Ansicht: AS Performance ODER AS vs. T2-Basis) als Markdown-Datei (.md) herunter." },
        downloadCompTestsMD: { description: "Lädt die Tabelle der statistischen Vergleichstests (p-Werte für McNemar-Test bezüglich Accuracy und DeLong-Test bezüglich AUC für den Vergleich AS vs. ausgewählte T2-Basis) als Markdown-Datei (.md) herunter." },
        downloadCompChartPNG: { description: "Lädt das angezeigte Vergleichs-Balkendiagramm (AS vs. ausgewählte T2-Basis für verschiedene Metriken) als PNG-Bilddatei herunter." },
        downloadCompChartSVG: { description: "Lädt das angezeigte Vergleichs-Balkendiagramm (AS vs. ausgewählte T2-Basis) als skalierbare Vektorgrafik-Datei (SVG) herunter." },
        downloadTablePNG: { description: "Lädt die aktuell angezeigte Tabelle als PNG-Bilddatei herunter." },
        downloadCompTablePNG: { description: "Lädt die Vergleichs-Metrik-Tabelle (Avocado Sign vs. ausgewählte T2-Basis) als PNG-Bilddatei herunter." },
        asPurPerfTable: {
            kollektiv: "Patientenkollektiv (Gesamt, Direkt OP, nRCT). N = Anzahl der Patienten in der jeweiligen Gruppe.",
            sens: "Sensitivität des Avocado Signs (AS) bezüglich des pathologischen N-Status für das jeweilige Kollektiv.",
            spez: "Spezifität des Avocado Signs (AS) bezüglich des pathologischen N-Status für das jeweilige Kollektiv.",
            ppv: "Positiver Prädiktiver Wert (PPV) des Avocado Signs (AS) für das jeweilige Kollektiv.",
            npv: "Negativer Prädiktiver Wert (NPV) des Avocado Signs (AS) für das jeweilige Kollektiv.",
            acc: "Accuracy (Gesamtgenauigkeit) des Avocado Signs (AS) für das jeweilige Kollektiv.",
            auc: "Fläche unter der ROC-Kurve (AUC) / Balanced Accuracy des Avocado Signs (AS) für das jeweilige Kollektiv. Ein Wert von 0.5 entspricht Zufall, 1.0 perfekter Unterscheidung."
        },
        asVsT2PerfTable: {
            metric: "Die jeweilige diagnostische Gütekennzahl.",
            asValue: "Wert der Metrik für das Avocado Sign (AS) im Vergleich zum pathologischen N-Status für das aktuell global gewählte Kollektiv ([KOLLEKTIV]), inklusive 95% Konfidenzintervall.",
            t2Value: "Wert der Metrik für die aktuell ausgewählte T2-Vergleichsbasis ([T2_SHORT_NAME]) im Vergleich zum pathologischen N-Status für das aktuell global gewählte Kollektiv ([KOLLEKTIV]), inklusive 95% Konfidenzintervall."
        },
        asVsT2TestTable: {
            test: "Durchgeführter statistischer Test zum direkten Vergleich der diagnostischen Leistung von Avocado Sign (AS) vs. der ausgewählten T2-Vergleichsbasis ([T2_SHORT_NAME]) innerhalb des aktuellen globalen Kollektivs ([KOLLEKTIV]).",
            statistic: "Wert der berechneten Teststatistik (z.B. Chi-Quadrat für McNemar, Z-Wert für DeLong). 'df' steht für Freiheitsgrade.",
            pValue: "Der p-Wert des statistischen Tests. Ein p-Wert < 0.05 (Signifikanzniveau) deutet auf einen statistisch signifikanten Unterschied in der diagnostischen Leistung zwischen AS und [T2_SHORT_NAME] für die getestete Metrik (Accuracy oder AUC) im Kollektiv [KOLLEKTIV] hin.",
            method: "Name des verwendeten statistischen Testverfahrens."
        }
    },
    exportTab: {
        description: "Ermöglicht den Export von Analyseergebnissen, Tabellen und Diagrammen basierend auf dem aktuell gewählten globalen Patientenkollektiv ([KOLLEKTIV]) und den aktuell im Reiter 'Auswertung' **angewendeten und gespeicherten** T2-Kriterien.",
        singleExports: "Einzel-Exporte",
        exportPackages: "Export-Pakete (.zip)",
        statsCSV: { description: "Exportiert eine detaillierte Tabelle aller berechneten statistischen Metriken, Konfidenzintervalle und Testergebnisse aus dem Statistik-Tab als kommaseparierte Datei (.csv). Geeignet für die Weiterverarbeitung in Statistiksoftware.", type: 'STATS_CSV', ext: "csv" },
        bruteForceTXT: { description: "Exportiert den detaillierten Bericht der letzten durchgeführten Brute-Force-Optimierung (inkl. Top 10 Ergebnisse, Konfiguration, Laufzeit etc.) als reine Textdatei (.txt), falls eine Optimierung im aktuellen Sitzungsverlauf durchgeführt wurde.", type: 'BRUTEFORCE_TXT', ext: "txt" },
        deskriptivMD: { description: "Exportiert die Tabelle der deskriptiven Statistik (aus dem Statistik-Tab) für das aktuelle Kollektiv in einem Markdown-Format (.md), geeignet für Berichte oder Dokumentationen.", type: 'DESKRIPTIV_MD', ext: "md" },
        patientenMD: { description: "Exportiert die aktuelle gefilterte Patientenliste (aus dem Daten-Tab) als Markdown-Tabelle (.md).", type: 'PATIENTEN_MD', ext: "md" },
        auswertungMD: { description: "Exportiert die aktuelle Auswertungstabelle (aus dem Auswertung-Tab) mit den Ergebnissen der angewendeten T2-Kriterien als Markdown-Tabelle (.md).", type: 'AUSWERTUNG_MD', ext: "md" },
        filteredDataCSV: { description: "Exportiert die zugrundeliegenden Rohdaten des aktuell ausgewählten und analysierten Patientenkollektivs, inklusive aller berechneten T2-Ergebnisse und Lymphknotendetails, als CSV-Datei (.csv).", type: 'FILTERED_DATA_CSV', ext: "csv" },
        comprehensiveReportHTML: { description: "Generiert einen umfassenden Analysebericht als einzelne HTML-Datei. Dieser Bericht fasst alle wichtigen deskriptiven Statistiken, Konfigurationen der T2-Kriterien, diagnostische Gütemaße und relevante Diagramme zusammen. Kann direkt im Browser geöffnet und gedruckt werden.", type: 'COMPREHENSIVE_REPORT_HTML', ext: "html" },
        chartsPNG: { description: "Exportiert alle aktuell im Anwendungsfenster sichtbaren Diagramme (aus Statistik-, Auswertung- und Präsentationstab) sowie ausgewählte Tabellen als einzelne, hochauflösende PNG-Bilddateien, gebündelt in einem ZIP-Archiv.", type: 'PNG_ZIP', ext: "zip" },
        chartsSVG: { description: "Exportiert alle aktuell im Anwendungsfenster sichtbaren Diagramme (aus Statistik-, Auswertung- und Präsentationstab) als einzelne, skalierbare Vektorgrafik-Dateien (SVG), gebündelt in einem ZIP-Archiv. Ideal für hochwertige Publikationen.", type: 'SVG_ZIP', ext: "zip" },
        chartSinglePNG: { description: "Exportiert das ausgewählte Diagramm als einzelne PNG-Datei.", type: 'CHART_SINGLE_PNG', ext: "png"},
        chartSingleSVG: { description: "Exportiert das ausgewählte Diagramm als einzelne SVG-Datei.", type: 'CHART_SINGLE_SVG', ext: "svg"},
        tableSinglePNG: { description: "Exportiert die ausgewählte Tabelle als einzelne PNG-Datei.", type: 'TABLE_PNG_EXPORT', ext: "png"},
        allZIP: { description: "Bündelt alle verfügbaren Einzel-Exportdateien (Statistik-CSV, BruteForce-TXT, alle Markdown-Tabellen, Gefilterte-Rohdaten-CSV, Umfassender HTML-Report) in einem einzigen ZIP-Archiv.", type: 'ALL_ZIP', ext: "zip"},
        csvZIP: { description: "Bündelt alle relevanten CSV-Dateien (Statistik-Übersicht, Gefilterte Rohdaten) in einem ZIP-Archiv.", type: 'CSV_ZIP', ext: "zip"},
        mdZIP: { description: "Bündelt alle verfügbaren Markdown-Dateien (Deskriptive Statistik, Patientenliste, Auswertungstabelle) in einem ZIP-Archiv.", type: 'MD_ZIP', ext: "zip"},
        pngZIP: { description: "Identisch zum 'Alle Diagramme & Tabellen (PNG)' Einzel-Export. Enthält alle aktuell sichtbaren Diagramme und ausgewählte Tabellen als PNGs.", type: 'PNG_ZIP', ext: "zip"},
        svgZIP: { description: "Identisch zum 'Alle Diagramme (SVG)' Einzel-Export. Enthält alle aktuell sichtbaren Diagramme als SVGs.", type: 'SVG_ZIP', ext: "zip"}
    },
    statMetrics: {
        sens: { name: "Sensitivität", description: "Sensitivität ([METHODE] vs. N): Anteil der tatsächlich positiven Fälle (N+), die durch die Methode [METHODE] korrekt als positiv erkannt wurden.<br><i>Formel: RP / (RP + FN)</i><br>RP: Richtig Positive, FN: Falsch Negative.", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der tatsächlich N+ Patienten im Kollektiv [KOLLEKTIV] korrekt (95% CI nach [METHOD_CI]: [LOWER] – [UPPER])."},
        spez: { name: "Spezifität", description: "Spezifität ([METHODE] vs. N): Anteil der tatsächlich negativen Fälle (N-), die durch die Methode [METHODE] korrekt als negativ erkannt wurden.<br><i>Formel: RN / (RN + FP)</i><br>RN: Richtig Negative, FP: Falsch Positive.", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der tatsächlich N- Patienten im Kollektiv [KOLLEKTIV] korrekt (95% CI nach [METHOD_CI]: [LOWER] – [UPPER])."},
        ppv: { name: "Pos. Prädiktiver Wert (PPV)", description: "PPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem positiven Testergebnis durch Methode [METHODE] tatsächlich N+ ist.<br><i>Formel: RP / (RP + FP)</i><br>Abhängig von der Prävalenz von N+ im untersuchten Kollektiv.", interpretation: "Wenn die Methode [METHODE] ein positives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N+ Status im Kollektiv [KOLLEKTIV] bei <strong>[WERT]</strong> (95% CI nach [METHOD_CI]: [LOWER] – [UPPER])."},
        npv: { name: "Neg. Prädiktiver Wert (NPV)", description: "NPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem negativen Testergebnis durch Methode [METHODE] tatsächlich N- ist.<br><i>Formel: RN / (RN + FN)</i><br>Abhängig von der Prävalenz von N+ im untersuchten Kollektiv.", interpretation: "Wenn die Methode [METHODE] ein negatives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N- Status im Kollektiv [KOLLEKTIV] bei <strong>[WERT]</strong> (95% CI nach [METHOD_CI]: [LOWER] – [UPPER])."},
        acc: { name: "Accuracy (Gesamtgenauigkeit)", description: "Accuracy ([METHODE] vs. N): Anteil aller Fälle, die durch die Methode [METHODE] korrekt klassifiziert wurden (sowohl positive als auch negative).<br><i>Formel: (RP + RN) / Gesamtanzahl</i>", interpretation: "Die Methode [METHODE] klassifizierte insgesamt <strong>[WERT]</strong> aller Patienten im Kollektiv [KOLLEKTIV] korrekt (95% CI nach [METHOD_CI]: [LOWER] – [UPPER])."},
        balAcc: { name: "Balanced Accuracy", description: "Balanced Accuracy ([METHODE] vs. N): Der Mittelwert aus Sensitivität und Spezifität. Ein robustes Maß bei ungleichen Gruppengrößen (N+ vs. N-). Entspricht der AUC für binäre Klassifikatoren.<br><i>Formel: (Sensitivität + Spezifität) / 2</i>", interpretation: "Die Balanced Accuracy der Methode [METHODE], die Sensitivität und Spezifität gleich gewichtet, betrug <strong>[WERT]</strong> (95% CI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]. Ein Wert von 0.5 entspricht Zufall, 1.0 perfekter Unterscheidung."},
        f1: { name: "F1-Score", description: "F1-Score ([METHODE] vs. N): Das harmonische Mittel aus PPV (Precision/Genauigkeit) und Sensitivität (Recall/Trefferquote). Nützlich, wenn ein Gleichgewicht zwischen beiden gesucht wird.<br><i>Formel: 2 * (PPV * Sensitivität) / (PPV + Sensitivität)</i>", interpretation: "Der F1-Score für die Methode [METHODE], der Präzision und Sensitivität kombiniert, beträgt <strong>[WERT]</strong> (95% CI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV]. Ein höherer Wert (max. 1.0) bedeutet eine bessere Balance."},
        auc: { name: "Area Under Curve (AUC)", description: "AUC ([METHODE] vs. N): Fläche unter der Receiver Operating Characteristic (ROC)-Kurve. Repräsentiert die Fähigkeit der Methode [METHODE], zufällig ausgewählte N+ und N- Patienten korrekt zu rangreihen/klassifizieren. 0.5 entspricht Zufall, 1.0 perfekter Trennung.<br><i>Für binäre Tests (wie AS oder eine feste T2-Regel) ist AUC = Balanced Accuracy.</i>", interpretation: "Die AUC von <strong>[WERT]</strong> (95% CI nach [METHOD_CI]: [LOWER] – [UPPER]) deutet auf eine <strong>[BEWERTUNG]</strong> generelle Trennschärfe der Methode [METHODE] zwischen N+ und N- Fällen im Kollektiv [KOLLEKTIV] hin."},
        mcnemar: { name: "McNemar-Test", description: "Prüft auf einen signifikanten Unterschied in den diskordanten Paaren (Fälle, bei denen AS und [T2_SHORT_NAME] unterschiedliche Ergebnisse liefern) bei gepaarten Daten (d.h. beide Methoden am selben Patientenkollektiv angewendet).<br><i>Nullhypothese: Die Anzahl der Fälle, in denen AS positiv und [T2_SHORT_NAME] negativ ist, ist gleich der Anzahl der Fälle, in denen AS negativ und [T2_SHORT_NAME] positiv ist (d.h. keine systematische Über- oder Unterlegenheit einer Methode in der Fehlklassifikation).</i>", interpretation: "Der McNemar-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die Fehlklassifizierungsraten von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] voneinander unterscheiden."},
        delong: { name: "DeLong-Test", description: "Vergleicht zwei AUC-Werte (bzw. Balanced Accuracies für binäre Tests) von ROC-Kurven, die auf denselben (gepaarten) Daten basieren. Berücksichtigt die Kovarianz zwischen den AUC-Schätzern.<br><i>Nullhypothese: AUC(AS) = AUC([T2_SHORT_NAME])</i>", interpretation: "Der DeLong-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die AUC-Werte (bzw. Balanced Accuracies) von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] voneinander unterscheiden."},
        phi: { name: "Phi-Koeffizient (φ)", description: "Maß für die Stärke und Richtung des Zusammenhangs zwischen zwei binären Variablen (z.B. Vorhandensein von Merkmal [MERKMAL] und N-Status). Wertebereich von -1 (perfekter negativer Zusammenhang) bis +1 (perfekter positiver Zusammenhang), 0 bedeutet kein Zusammenhang.", interpretation: "Der Phi-Koeffizient von <strong>[WERT]</strong> deutet auf einen <strong>[STAERKE]</strong> Zusammenhang zwischen dem Merkmal [MERKMAL] und dem N-Status im Kollektiv [KOLLEKTIV] hin."},
        rd: { name: "Risk Difference (RD)", description: "Absolute Differenz in der Wahrscheinlichkeit (Risiko) für einen positiven N-Status (N+) zwischen Patienten mit und ohne das spezifische Merkmal [MERKMAL].<br><i>Formel: P(N+|Merkmal vorhanden) - P(N+|Merkmal nicht vorhanden)</i>", interpretation: "Das Risiko für einen N+ Status war um <strong>[WERT]%</strong> absolut [HOEHER_NIEDRIGER] bei Patienten mit dem Merkmal [MERKMAL] verglichen mit Patienten ohne dieses Merkmal (95% CI nach [METHOD_CI]: [LOWER]% – [UPPER]%) im Kollektiv [KOLLEKTIV]."},
        or: { name: "Odds Ratio (OR)", description: "Quotient der Odds (Chance) für einen positiven N-Status (N+) bei Vorhandensein des Merkmals [MERKMAL] im Vergleich zur Abwesenheit des Merkmals.<br><i>Formel: Odds(N+|Merkmal vorhanden) / Odds(N+|Merkmal nicht vorhanden)</i><br>Ein OR > 1 bedeutet, dass das Merkmal mit erhöhten Odds für N+ assoziiert ist; OR < 1 bedeutet verringerte Odds; OR = 1 bedeutet keinen Unterschied in den Odds.", interpretation: "Die Chance (Odds) für einen N+ Status war bei Patienten mit dem Merkmal [MERKMAL] um den Faktor <strong>[WERT]</strong> [FAKTOR_TEXT] im Vergleich zu Patienten ohne dieses Merkmal (95% CI nach [METHOD_CI]: [LOWER] – [UPPER], p=[P_WERT], [SIGNIFIKANZ]) im Kollektiv [KOLLEKTIV]."},
        fisher: { name: "Fisher's Exakter Test", description: "Exakter Test zur Prüfung auf einen signifikanten Zusammenhang zwischen zwei kategorialen Variablen (z.B. Vorhandensein/Abwesenheit des Merkmals [MERKMAL] vs. N-Status positiv/negativ). Geeignet auch für kleine Stichprobengrößen.", interpretation: "Der exakte Test nach Fisher ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>, was auf einen [SIGNIFIKANZ_TEXT] Zusammenhang zwischen dem Merkmal [MERKMAL] und dem N-Status im Kollektiv [KOLLEKTIV] hindeutet."},
        mannwhitney: { name: "Mann-Whitney-U-Test", description: "Nichtparametrischer Test zum Vergleich der zentralen Tendenz (Median) einer kontinuierlichen oder ordinalen Variable (z.B. '[VARIABLE]') zwischen zwei unabhängigen Gruppen (hier: N+ vs. N- Patienten).<br><i>Prüft, ob die Verteilungen der Variable sich zwischen den Gruppen unterscheiden.</i>", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies zeigt einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Variable '[VARIABLE]' zwischen N+ und N- Patienten im Kollektiv [KOLLEKTIV]."},
        ci95: { name: "95% Konfidenzintervall (CI)", description: "Das 95%-Konfidenzintervall (CI) gibt den Bereich an, der den wahren (unbekannten) Wert der Population für die berechnete Metrik mit einer Wahrscheinlichkeit von 95% überdeckt.<br><i>Verwendete Methode zur Berechnung: [METHOD_CI]</i>", interpretation: "Basierend auf den vorliegenden Daten liegt der wahre Wert der Metrik mit 95%iger Sicherheit zwischen [LOWER] und [UPPER]."},
        konfusionsmatrix: { description: "Die Konfusionsmatrix (auch Wahrheitsmatrix genannt) ist eine Kreuztabelle, die die Klassifikationsergebnisse der Methode [METHODE] (Vorhersage) mit dem tatsächlichen N-Status (Referenzstandard) vergleicht. Sie zeigt die Anzahl der Richtig Positiven (RP), Falsch Positiven (FP), Falsch Negativen (FN) und Richtig Negativen (RN) Klassifikationen." },
        accComp: { name: "Accuracy Vergleich (Ungepaart)", description: "Vergleicht die Accuracy (Gesamtgenauigkeit) der Methode [METHODE] zwischen zwei unabhängigen Patientenkollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels Fisher's Exaktem Test.", interpretation: "Der Unterschied in der Accuracy der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (Fisher's Exact Test, p=[P_WERT])." },
        aucComp: { name: "AUC Vergleich (Ungepaart)", description: "Vergleicht die AUC (Area Under Curve) der Methode [METHODE] zwischen zwei unabhängigen Patientenkollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels eines Z-Tests, basierend auf den Standardfehlern der AUCs.", interpretation: "Der Unterschied in der AUC der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (Z-Test, p=[P_WERT])." },
        logisticRegressionFit: { name: "Modellanpassung (Log. Regression)", description: "Güte der Anpassung des logistischen Regressionsmodells an die Daten, typischerweise beurteilt durch Kennzahlen wie Hosmer-Lemeshow-Test, Pseudo-R-Quadrat oder AIC/BIC. (Hier nicht detailliert implementiert).", interpretation: "Das Modell zeigt eine [BEWERTUNG_FIT] Anpassung an die Daten."},
        logisticRegressionCoef: { name: "Koeffizient (Log. Regression)", description: "Geschätzter Koeffizient für den Prädiktor [PREDICTOR] im logistischen Regressionsmodell. Gibt die Veränderung der Log-Odds für N+ pro Einheitsänderung des Prädiktors an, adjustiert für andere Prädiktoren im Modell.", interpretation: "Der Koeffizient für den Prädiktor '[PREDICTOR]' beträgt <strong>[COEF_VALUE]</strong> (Standardfehler: [SE], p=[P_WERT], [SIGNIFIKANZ]). Ein [SIGNIFIKANZ_TEXT] Koeffizient deutet auf einen Einfluss dieses Prädiktors auf die Wahrscheinlichkeit eines positiven N-Status hin."},
        rocCurvePlot: { description: "Zeigt die Receiver Operating Characteristic (ROC) Kurve für die Methode '{Variable}' im Kollektiv [KOLLEKTIV]. Die Kurve stellt die Sensitivität (Richtig-Positiv-Rate) gegen 1-Spezifität (Falsch-Positiv-Rate) für verschiedene Schwellenwerte der Methode dar. Die Diagonale (gestrichelt) repräsentiert eine zufällige Klassifikation (AUC=0.5). Eine Kurve, die näher an der oberen linken Ecke liegt, deutet auf eine bessere diagnostische Gesamtleistung hin." },
        defaultP: { interpretation: `Der berechnete p-Wert beträgt <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Bei einem Signifikanzniveau von ${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL} ist das Ergebnis <strong>[SIGNIFIKANZ_TEXT]</strong>.` },
        signifikanzTexte: { SIGNIFIKANT: "statistisch signifikant", NICHT_SIGNIFIKANT: "statistisch nicht signifikant" },
        orFaktorTexte: { ERHOEHT: "erhöht", VERRINGERT: "verringert", UNVERAENDERT: "nahezu unverändert" },
        rdRichtungTexte: { HOEHER: "höher", NIEDRIGER: "niedriger", GLEICH: "nahezu gleich" },
        assoziationStaerkeTexte: { stark: "stark", moderat: "moderat", schwach: "schwach", sehr_schwach: "sehr schwach oder kein", nicht_bestimmbar: "nicht bestimmbar" }
    }
};

deepFreeze(UI_TEXTS);
deepFreeze(TOOLTIP_CONTENT);