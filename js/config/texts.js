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
        'KOMBINIERT': 'KOMBINIERT'
    },
    methodenTab: {
        spracheSwitchLabel: {
            de: 'Deutsch',
            en: 'English'
        }
    },
    chartTitles: {
        ageDistribution: 'Altersverteilung',
        genderDistribution: 'Geschlecht',
        therapyDistribution: 'Therapie',
        statusN: 'N-Status (Patho)',
        statusAS: 'AS-Status',
        statusT2: 'T2-Status',
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
        sensitivity: 'Sensitivität (RP Rate)',
        oneMinusSpecificity: '1 - Spezifität (FP Rate)',
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
    kollektivButtons: { description: "Wählen Sie das Patientenkollektiv für die Analyse aus: Gesamt, nur primär Operierte (direkt OP) oder nur neoadjuvant Vorbehandelte (nRCT). Die Auswahl filtert die Daten für alle Tabs." },
    headerStats: {
        kollektiv: "Aktuell betrachtetes Patientenkollektiv.",
        anzahlPatienten: "Gesamtzahl der Patienten im ausgewählten Kollektiv.",
        statusN: "Anteil der Patienten mit positivem (+) vs. negativem (-) histopathologischem Lymphknotenstatus (Referenzstandard) im ausgewählten Kollektiv.",
        statusAS: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß Avocado Sign (AS) Vorhersage im ausgewählten Kollektiv.",
        statusT2: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß den aktuell **angewendeten und gespeicherten** T2-Kriterien (siehe Auswertungstab) für das ausgewählte Kollektiv."
    },
    patientTable: {
        nr: "Fortlaufende Nummer des Patienten.",
        name: "Nachname des Patienten (anonymisiert/kodiert).",
        vorname: "Vorname des Patienten (anonymisiert/kodiert).",
        geschlecht: "Geschlecht des Patienten (m/w).",
        alter: "Alter des Patienten zum Zeitpunkt der MRT-Untersuchung in Jahren.",
        therapie: "Angewandte Therapie vor der Operation (nRCT: neoadjuvante Radiochemotherapie, direkt OP: keine Vorbehandlung).",
        n_as_t2: "Direkter Vergleich des Lymphknotenstatus: N (Pathologie-Referenz), AS (Avocado Sign Vorhersage), T2 (Vorhersage basierend auf aktuell angewendeten Kriterien). Klicken Sie auf N, AS oder T2, um nach diesem spezifischen Status zu sortieren.",
        bemerkung: "Zusätzliche klinische oder radiologische Bemerkungen zum Patientenfall, falls vorhanden.",
        expandAll: "Öffnet oder schließt die Detailansicht zu den T2-gewichteten Lymphknotenmerkmalen für alle Patienten in der aktuellen Tabellenansicht.",
        expandRow: "Klicken Sie auf diese Zeile, um Details zu den morphologischen Eigenschaften der T2-gewichteten Lymphknoten dieses spezifischen Patienten anzuzeigen oder auszublenden."
    },
    auswertungTable: {
        nr: "Fortlaufende Nummer des Patienten.",
        name: "Nachname des Patienten (anonymisiert/kodiert).",
        therapie: "Angewandte Therapie vor der Operation.",
        n_as_t2: "Direkter Vergleich des Lymphknotenstatus: N (Pathologie-Referenz), AS (Avocado Sign Vorhersage), T2 (Vorhersage basierend auf aktuell angewendeten Kriterien). Klicken Sie auf N, AS oder T2, um nach diesem spezifischen Status zu sortieren.",
        n_counts: "Anzahl pathologisch positiver (N+) Lymphknoten / Gesamtzahl histopathologisch untersuchter Lymphknoten für diesen Patienten.",
        as_counts: "Anzahl als positiv bewerteter Avocado Sign (AS+) Lymphknoten / Gesamtzahl im T1KM-MRT sichtbarer Lymphknoten für diesen Patienten.",
        t2_counts: "Anzahl als positiv bewerteter T2-Lymphknoten (gemäß aktuell angewendeter Kriterien) / Gesamtzahl im T2-MRT sichtbarer Lymphknoten für diesen Patienten.",
        expandAll: "Öffnet oder schließt die Detailansicht der bewerteten T2-gewichteten Lymphknoten und der erfüllten Kriterien für alle Patienten in der aktuellen Tabellenansicht.",
        expandRow: "Klicken Sie auf diese Zeile, um die detaillierte Bewertung der einzelnen T2-gewichteten Lymphknoten dieses Patienten gemäß der aktuell angewendeten Kriterien anzuzeigen oder auszublenden. Erfüllte Positiv-Kriterien werden hervorgehoben."
    },
    t2Logic: { description: `Logische Verknüpfung der aktiven T2-Kriterien: <strong>UND</strong> (Ein Lymphknoten ist nur positiv, wenn ALLE aktivierten Kriterien erfüllt sind). <strong>ODER</strong> (Ein Lymphknoten ist positiv, wenn MINDESTENS EIN aktiviertes Kriterium erfüllt ist).` },
    t2Size: { description: `Größenkriterium: Lymphknoten mit einem Kurzachsendurchmesser <strong>größer oder gleich</strong> dem eingestellten Schwellenwert gelten als suspekt. Einstellbarer Bereich: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} - ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm. Aktivieren/Deaktivieren Sie das Kriterium mit der Checkbox.` },
    t2Form: { description: "Formkriterium: Wählen Sie, welche Form ('rund' oder 'oval') als suspekt gilt. Ein Lymphknoten gilt als 'rund', wenn das Verhältnis Kurzachse zu Langachse nahe 1 ist. Aktivieren/Deaktivieren Sie das Kriterium mit der Checkbox." },
    t2Kontur: { description: "Konturkriterium: Wählen Sie, welche Kontur ('scharf' oder 'irregulär') als suspekt gilt. Aktivieren/Deaktivieren Sie das Kriterium mit der Checkbox." },
    t2Homogenitaet: { description: "Homogenitätskriterium: Wählen Sie, ob ein 'homogenes' oder 'heterogenes' Binnensignal auf T2w als suspekt gilt. Aktivieren/Deaktivieren Sie das Kriterium mit der Checkbox." },
    t2Signal: { description: "Signalkriterium: Wählen Sie, welche T2-Signalintensität ('signalarm', 'intermediär' oder 'signalreich') relativ zur umgebenden Muskulatur als suspekt gilt. Lymphknoten ohne eindeutig zuweisbares Signal (Signal='null') erfüllen dieses Kriterium nie. Aktivieren/Deaktivieren Sie das Kriterium mit der Checkbox." },
    t2Actions: {
        reset: "Setzt die Logik und alle Kriterien auf die Standardeinstellungen zurück (siehe Konfiguration). Die Änderungen sind danach noch nicht angewendet.",
        apply: "Wendet die aktuell eingestellten T2-Kriterien und die Logik auf den gesamten Datensatz an. Dies aktualisiert die T2-Spalten in den Tabellen, alle statistischen Auswertungen und Diagramme. Die Einstellung wird zudem für zukünftige Sitzungen gespeichert."
    },
    t2CriteriaCard: { unsavedIndicator: "Achtung: Es gibt nicht angewendete Änderungen an den T2-Kriterien oder der Logik. Klicken Sie auf 'Anwenden', um die Ergebnisse zu aktualisieren und die Einstellung zu speichern." },
    t2MetricsOverview: {
        cardTitle: "Kurzübersicht der diagnostischen Güte für die aktuell angewendeten und gespeicherten T2-Kriterien im Vergleich zum histopathologischen N-Status für das gewählte Kollektiv: [KOLLEKTIV].",
        sens: "Sensitivität (T2 vs. N)",
        spez: "Spezifität (T2 vs. N)",
        ppv: "PPV (T2 vs. N)",
        npv: "NPV (T2 vs. N)",
        acc: "Accuracy (T2 vs. N)",
        balAcc: "Balanced Accuracy (T2 vs. N)",
        f1: "F1-Score (T2 vs. N)",
        auc: "AUC (T2 vs. N)"
     },
    bruteForceMetric: { description: "Wählen Sie die Zielmetrik, die durch die Brute-Force-Suche maximiert werden soll. Der Vergleich erfolgt immer gegen den N-Status.<br><strong>Accuracy:</strong> Gesamtgenauigkeit.<br><strong>Balanced Accuracy:</strong> Mittelwert aus Sensitivität und Spezifität (sinnvoll bei unbalancierten Klassen).<br><strong>F1-Score:</strong> Harmonisches Mittel aus PPV und Sensitivität.<br><strong>PPV:</strong> Positiver Prädiktiver Wert.<br><strong>NPV:</strong> Negativer Prädiktiver Wert." },
    bruteForceStart: { description: "Startet die exhaustive Suche (Brute-Force) nach der optimalen Kombination von T2-Kriterien (aktive Kriterien, Werte, Logik), die die gewählte Zielmetrik maximiert. Dies testet alle sinnvollen Kombinationen und kann je nach Kollektivgröße einige Minuten dauern. Der Prozess läuft im Hintergrund." },
    bruteForceInfo: { description: "Zeigt den Status des Optimierungs-Workers und das aktuell für die Analyse ausgewählte Patientenkollektiv an." },
    bruteForceProgress: { description: "Zeigt den Fortschritt der laufenden Optimierung an: Anzahl bereits getesteter Kombinationen von insgesamt zu testenden [TOTAL], sowie die bisher beste gefundene Metrik mit den zugehörigen Kriterien und der Logik." },
    bruteForceResult: { description: "Zeigt das Ergebnis der abgeschlossenen Optimierung an: die beste gefundene Kriterienkombination (Logik, aktive Kriterien, Werte) und den damit erreichten Wert der Zielmetrik für das analysierte Kollektiv." },
    bruteForceDetailsButton: { description: "Öffnet ein separates Fenster (Modal), das eine sortierte Liste der Top 10 gefundenen Kriterienkombinationen (inklusive solcher mit gleichem Metrikwert) und weitere Details zur Optimierung anzeigt." },
    bruteForceModal: { exportButton: "Exportiert den detaillierten Bericht der Brute-Force-Optimierung, inklusive der Top 10 Ergebnisse und der Konfiguration, als formatierte Textdatei (.txt)." },
    statistikLayout: { description: "Wählen Sie die Anzeigeart für die statistischen Ergebnisse: 'Einzelansicht' zeigt die detaillierte Statistik für die global im Header ausgewählte Patientengruppe. 'Vergleich Aktiv' ermöglicht die Auswahl von zwei Kollektiven und zeigt deren Statistiken nebeneinander sowie zusätzliche statistische Tests zum Vergleich der Performanz zwischen den Gruppen an." },
    statistikKollektiv1: { description: "Wählen Sie das erste Kollektiv für die statistische Auswertung bzw. den Vergleich (nur aktiv bei Layout 'Vergleich Aktiv')." },
    statistikKollektiv2: { description: "Wählen Sie das zweite Kollektiv für den Vergleich (nur aktiv bei Layout 'Vergleich Aktiv')." },
    statistikToggleVergleich: { description: "Schaltet zwischen der Ansicht für ein einzelnes, global gewähltes Kollektiv und der Vergleichsansicht zweier spezifisch wählbarer Kollektive um." },
    deskriptiveStatistik: {
        cardTitle: "Überblick über die demographischen Daten (Alter, Geschlecht), Therapieart und Verteilung der N-, AS- und T2-Status sowie Lymphknotenanzahlen im ausgewählten Kollektiv ([KOLLEKTIV]).",
        alterMedian: { description: "Median des Alters: Der zentrale Wert, der die Patienten nach Alter in zwei gleich große Hälften teilt. Angegeben mit Minimum-Maximum und [Mittelwert ± Standardabweichung]." },
        geschlecht: { description: "Absolute Anzahl und prozentuale Verteilung der Geschlechter (männlich/weiblich) im Kollektiv." },
        nStatus: { description: "Absolute Anzahl und prozentualer Anteil der Patienten mit positivem (+) bzw. negativem (-) histopathologischem N-Status im Kollektiv." },
        asStatus: { description: "Absolute Anzahl und prozentualer Anteil der Patienten mit positivem (+) bzw. negativem (-) vorhergesagtem AS-Status im Kollektiv." },
        t2Status: { description: "Absolute Anzahl und prozentualer Anteil der Patienten mit positivem (+) bzw. negativem (-) vorhergesagtem T2-Status (basierend auf aktuell angewendeten Kriterien) im Kollektiv." },
        lkAnzahlPatho: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Gesamtzahl histopathologisch untersuchter Lymphknoten pro Patient im Kollektiv." },
        lkAnzahlPathoPlus: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Anzahl pathologisch positiver (N+) Lymphknoten pro Patient, *nur* bezogen auf die Patienten, die tatsächlich N+ waren." },
        lkAnzahlAS: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Gesamtzahl im T1KM-MRT detektierter Avocado Sign Lymphknoten (AS gesamt) pro Patient." },
        lkAnzahlASPlus: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Anzahl als positiv bewerteter Avocado Sign Lymphknoten (AS+) pro Patient, *nur* bezogen auf die Patienten, die AS+ waren." },
        lkAnzahlT2: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Gesamtzahl im T2-MRT detektierter Lymphknoten pro Patient." },
        lkAnzahlT2Plus: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Anzahl als positiv bewerteter T2-Lymphknoten (T2+, gemäß angewendeter Kriterien) pro Patient, *nur* bezogen auf die Patienten, die T2+ waren." },
        chartAge: { description: "Histogramm der Altersverteilung der Patienten im Kollektiv [KOLLEKTIV]." },
        chartGender: { description: "Tortendiagramm der Geschlechterverteilung (m/w) im Kollektiv [KOLLEKTIV]." }
    },
    diagnostischeGueteAS: { cardTitle: "Diagnostische Gütekriterien für das Avocado Sign (AS) im Vergleich zur Histopathologie (N) als Referenzstandard für das Kollektiv [KOLLEKTIV]. Alle Werte inkl. 95% Konfidenzintervall." },
    diagnostischeGueteT2: { cardTitle: "Diagnostische Gütekriterien für die aktuell angewendeten T2-Kriterien im Vergleich zur Histopathologie (N) als Referenzstandard für das Kollektiv [KOLLEKTIV]. Alle Werte inkl. 95% Konfidenzintervall." },
    statistischerVergleichASvsT2: { cardTitle: "Direkter statistischer Vergleich der diagnostischen Leistung von AS vs. T2 (aktuell angewendete Kriterien) innerhalb desselben Kollektivs ([KOLLEKTIV]) mittels gepaarter Tests." },
    assoziationEinzelkriterien: { cardTitle: "Analyse der Assoziation zwischen dem AS-Status bzw. einzelnen T2-Merkmalen (unabhängig von Aktivierung) und dem histopathologischen N-Status (+/-) im Kollektiv [KOLLEKTIV]. Angegeben sind Odds Ratio (OR), Risk Difference (RD), Phi-Koeffizient und p-Werte aus geeigneten Tests." },
    vergleichKollektive: { cardTitle: "Statistischer Vergleich der diagnostischen Leistung (Accuracy, AUC für AS und T2) zwischen Kollektiv [KOLLEKTIV1] und Kollektiv [KOLLEKTIV2] mittels Tests für unabhängige Stichproben." },
    criteriaComparisonTable: {
        cardTitle: "Tabellarischer Vergleich der diagnostischen Güte verschiedener Methoden/Kriteriensätze (AS, aktuell angewandte T2, Studien) für das ausgewählte Kollektiv [KOLLEKTIV].",
        tableHeaderSet: "Methode / Kriteriensatz",
        tableHeaderSens: "Sensitivität: Anteil der korrekt als positiv erkannten N+ Fälle.",
        tableHeaderSpez: "Spezifität: Anteil der korrekt als negativ erkannten N- Fälle.",
        tableHeaderPPV: "Positiver Prädiktiver Wert: Wahrscheinlichkeit für N+, wenn Testergebnis positiv.",
        tableHeaderNPV: "Negativer Prädiktiver Wert: Wahrscheinlichkeit für N-, wenn Testergebnis negativ.",
        tableHeaderAcc: "Accuracy: Gesamtanteil korrekt klassifizierter Fälle.",
        tableHeaderAUC: "Area Under Curve / Balanced Accuracy: Maß für die Gesamt-Trennschärfe (0.5=Zufall, 1=perfekt)."
    },
    logisticRegressionCard: { cardTitle: "Ergebnisse der logistischen Regression zur Modellierung der N+ Wahrscheinlichkeit basierend auf ausgewählten Prädiktoren (z.B. T2-Merkmale, Alter) für das Kollektiv [KOLLEKTIV]. (Experimentell)" },
    rocCurveCard: { cardTitle: "Receiver Operating Characteristic (ROC) Kurve für die Unterscheidung zwischen N+ und N- basierend auf {Variable} für das Kollektiv [KOLLEKTIV]. Zeigt Sensitivität vs. 1-Spezifität über verschiedene Schwellenwerte." },
    praesentation: {
        viewSelect: { description: "Wählen Sie die Datenansicht für den Präsentations-Tab: 'Avocado Sign (Daten)' zeigt die dynamisch berechneten Kernergebnisse für AS im aktuellen Kollektiv. 'AS vs. T2 (Vergleich)' ermöglicht einen dynamischen Vergleich von AS mit T2-Kriterien für das aktuell global gewählte Kollektiv." },
        studySelect: { description: "Wählen Sie eine Quelle für die T2-Kriterien, die mit dem Avocado Sign verglichen werden sollen: Entweder die aktuell in der App eingestellten ('Eingestellte T2 Kriterien') oder vordefinierte Kriteriensätze aus relevanten publizierten Studien. Die Auswahl aktualisiert die Info-Karte und den Vergleichs-Chart. Der Vergleich basiert immer auf dem aktuell im Header ausgewählten Patientenkollektiv." },
        t2BasisInfoCard: {
            title: "Details zur T2-Vergleichsbasis",
            description: "Zeigt Details zu den aktuell für den Vergleich ausgewählten T2-Kriterien.",
            reference: "Quelle / Publikation der Kriterien.",
            patientCohort: "Ursprüngliche Kohorte und Untersuchungstyp der Studie.",
            investigationType: "Untersuchungstyp der Originalstudie (Baseline oder Restaging)",
            focus: "Hauptfokus oder Fragestellung der Studie bezüglich dieser Kriterien.",
            keyCriteriaSummary: "Zusammenfassung der angewendeten T2-Kriterien."
        },
        comparisonTableCard: { description: "Zeigt die numerischen Werte der diagnostischen Gütekriterien für den Vergleich von Avocado Sign vs. ausgewählter T2-Basis für das aktuelle Kollektiv."},
        downloadDemographicsMD: { description: "Lädt die Tabelle der demographischen Basisdaten (nur für Avocado-Sign-Ansicht) als Markdown-Datei (.md) herunter."},
        downloadPerformanceCSV: { description: "Lädt die Tabelle der diagnostischen Güte (je nach Ansicht: AS oder AS vs. ausgewählte T2-Basis) als CSV-Datei (.csv) herunter." },
        downloadPerformanceMD: { description: "Lädt die Tabelle der diagnostischen Güte (je nach Ansicht: AS oder AS vs. ausgewählte T2-Basis) als Markdown-Datei (.md) herunter." },
        downloadCompTestsMD: { description: "Lädt die Tabelle der statistischen Vergleichstests (p-Werte für McNemar und DeLong für AS vs. ausgewählte T2-Basis) als Markdown-Datei (.md) herunter." },
        downloadCompChartPNG: { description: "Lädt das Vergleichs-Balkendiagramm (AS vs. ausgewählte T2-Basis) als PNG-Datei herunter." },
        downloadCompChartSVG: { description: "Lädt das Vergleichs-Balkendiagramm (AS vs. ausgewählte T2-Basis) als Vektor-SVG-Datei herunter." },
        downloadTablePNG: { description: "Lädt die angezeigte Tabelle als PNG-Bilddatei herunter." },
        downloadCompTablePNG: { description: "Lädt die Vergleichs-Metrik-Tabelle (AS vs. T2) als PNG-Datei herunter." },
        asPurPerfTable: {
            kollektiv: "Patientenkollektiv (Gesamt, Direkt OP, nRCT). N = Anzahl Patienten in der Gruppe.",
            sens: "Sensitivität für AS (vs. N) in diesem Kollektiv.",
            spez: "Spezifität für AS (vs. N) in diesem Kollektiv.",
            ppv: "Positiver Prädiktiver Wert für AS (vs. N) in diesem Kollektiv.",
            npv: "Negativer Prädiktiver Wert für AS (vs. N) in diesem Kollektiv.",
            acc: "Accuracy für AS (vs. N) in diesem Kollektiv.",
            auc: "AUC / Balanced Accuracy für AS (vs. N) in diesem Kollektiv."
        },
        asVsT2PerfTable: {
            metric: "Diagnostische Metrik.",
            asValue: "Wert der Metrik für Avocado Sign (AS) (vs. N) im Kollektiv [KOLLEKTIV], inkl. 95% CI.",
            t2Value: "Wert der Metrik für die ausgewählte T2-Basis ([T2_SHORT_NAME]) (vs. N) im Kollektiv [KOLLEKTIV], inkl. 95% CI."
        },
        asVsT2TestTable: {
            test: "Statistischer Test zum Vergleich von AS vs. [T2_SHORT_NAME].",
            statistic: "Wert der Teststatistik.",
            pValue: "p-Wert des Tests. p < 0.05 bedeutet einen statistisch signifikanten Unterschied zwischen AS und [T2_SHORT_NAME] in Bezug auf die getestete Metrik (Accuracy oder AUC) im Kollektiv [KOLLEKTIV].",
            method: "Name des verwendeten statistischen Tests."
        }
    },
    exportTab: {
        singleExports: "Einzelexporte",
        exportPackages: "Export-Pakete (.zip)",
        description: "Ermöglicht den Export von Analyseergebnissen, Tabellen und Diagrammen basierend auf dem aktuell gewählten Kollektiv ([KOLLEKTIV]) und den aktuell angewendeten T2-Kriterien.",
        statsCSV: { description: "Exportiert eine detaillierte Tabelle aller berechneten statistischen Metriken, Konfidenzintervalle und Testergebnisse aus dem Statistik-Tab als kommaseparierte Datei (.csv).", type: 'STATS_CSV', ext: "csv" },
        statsXLSX: { description: "Exportiert die detaillierte Tabelle aller berechneten statistischen Metriken, Konfidenzintervalle und Testergebnisse aus dem Statistik-Tab als Excel-Datei (.xlsx).", type: 'STATISTIK_XLSX', ext: "xlsx" },
        bruteForceTXT: { description: "Exportiert den detaillierten Bericht der letzten Brute-Force-Optimierung (Top 10 Ergebnisse, Konfiguration, Laufzeit) als reine Textdatei (.txt), falls eine Optimierung durchgeführt wurde.", type: 'BRUTEFORCE_TXT', ext: "txt" },
        deskriptivMD: { description: "Exportiert die Tabelle der deskriptiven Statistik (aus dem Statistik-Tab) in einem Markdown-Format (.md), geeignet für Berichte.", type: 'DESKRIPTIV_MD', ext: "md" },
        patientenMD: { description: "Exportiert die aktuelle Patientenliste (aus dem Patienten-Tab) als Markdown-Tabelle (.md).", type: 'PATIENTEN_MD', ext: "md" },
        patientenXLSX: { description: "Exportiert die aktuelle Patientenliste (aus dem Patienten-Tab) als Excel-Datei (.xlsx).", type: 'PATIENTEN_XLSX', ext: "xlsx" },
        auswertungMD: { description: "Exportiert die aktuelle Auswertungstabelle (aus dem Auswertung-Tab) mit den angewendeten T2-Ergebnissen als Markdown-Tabelle (.md).", type: 'AUSWERTUNG_MD', ext: "md" },
        auswertungXLSX: { description: "Exportiert die aktuelle Auswertungstabelle (aus dem Auswertung-Tab) mit den angewendeten T2-Ergebnissen als Excel-Datei (.xlsx).", type: 'AUSWERTUNG_XLSX', ext: "xlsx" },
        filteredDataCSV: { description: "Exportiert die zugrundeliegenden Rohdaten des aktuell ausgewählten und analysierten Kollektivs, inklusive der berechneten T2-Ergebnisse, als CSV-Datei (.csv).", type: 'FILTERED_DATA_CSV', ext: "csv" },
        filteredDataXLSX: { description: "Exportiert die zugrundeliegenden Rohdaten des aktuell ausgewählten und analysierten Kollektivs, inklusive der berechneten T2-Ergebnisse, als Excel-Datei (.xlsx).", type: 'FILTERED_DATA_XLSX', ext: "xlsx" },
        comprehensiveReportHTML: { description: "Generiert einen umfassenden Analysebericht als HTML-Datei, die alle wichtigen Statistiken, Konfigurationen und Diagramme zusammenfasst. Kann im Browser geöffnet und gedruckt werden.", type: 'COMPREHENSIVE_REPORT_HTML', ext: "html" },
        chartsPNG: { description: "Exportiert alle aktuell sichtbaren Diagramme aus dem Statistik-, Auswertung- und Präsentationstab sowie ausgewählte Tabellen als einzelne, hochauflösende PNG-Bilddateien, gebündelt in einem ZIP-Archiv.", type: 'PNG_ZIP', ext: "zip" },
        chartsSVG: { description: "Exportiert alle aktuell sichtbaren Diagramme aus dem Statistik-, Auswertung- und Präsentationstab als einzelne, skalierbare Vektorgrafik-Dateien (SVG), gebündelt in einem ZIP-Archiv.", type: 'SVG_ZIP', ext: "zip" },
        chartSinglePNG: { description: "Exportiert das ausgewählte Diagramm als einzelne PNG-Datei.", type: 'CHART_SINGLE_PNG', ext: "png"},
        chartSingleSVG: { description: "Exportiert das ausgewählte Diagramm als einzelne SVG-Datei.", type: 'CHART_SINGLE_SVG', ext: "svg"},
        tableSinglePNG: { description: "Exportiert die ausgewählte Tabelle als einzelne PNG-Datei.", type: 'TABLE_PNG_EXPORT', ext: "png"},
        allZIP: { description: "Exportiert alle verfügbaren Einzeldateien (Statistik-CSV, BruteForce-TXT, alle MDs, Gefilterte-Daten-CSV, HTML-Report) in einem einzigen ZIP-Archiv.", type: 'ALL_ZIP', ext: "zip"},
        csvZIP: { description: "Bündelt alle verfügbaren CSV-Dateien (Statistik, Gefilterte Daten) in einem ZIP-Archiv.", type: 'CSV_ZIP', ext: "zip"},
        mdZIP: { description: "Bündelt alle verfügbaren Markdown-Dateien (Deskriptiv, Patienten, Auswertung) in einem ZIP-Archiv.", type: 'MD_ZIP', ext: "md"},
        pngZIP: { description: "Identisch zum 'Alle Diagramme & Tabellen (PNG)' Einzel-Export.", type: 'PNG_ZIP', ext: "zip"},
        svgZIP: { description: "Identisch zum 'Alle Diagramme (SVG)' Einzel-Export.", type: 'SVG_ZIP', ext: "zip"},
        xlsxZIP: { description: "Bündelt alle verfügbaren Excel-Dateien in einem ZIP-Archiv.", type: 'XLSX_ZIP', ext: "zip"}
    },
    methodenTab: {
        spracheSwitch: { description: "Wechselt die Sprache der Methodenbeschreibung zwischen Deutsch und Englisch."}
    },
    statMetrics: {
        sens: { name: "Sensitivität", description: "Sensitivität ([METHODE] vs. N): Anteil der tatsächlich positiven Fälle (N+), die durch die Methode [METHODE] korrekt als positiv erkannt wurden.<br><i>Formel: RP / (RP + FN)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der tatsächlich N+ Patienten korrekt (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) im Kollektiv [KOLLEKTIV]."},
        spez: { name: "Spezifität", description: "Spezifität ([METHODE] vs. N): Anteil der tatsächlich negativen Fälle (N-), die durch die Methode [METHODE] korrekt als negativ erkannt wurden.<br><i>Formel: RN / (RN + FP)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der tatsächlich N- Patienten korrekt (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) im Kollektiv [KOLLEKTIV]."},
        ppv: { name: "Pos. Prädiktiver Wert (PPV)", description: "PPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem positiven Testergebnis durch Methode [METHODE] tatsächlich krank (N+) ist.<br><i>Formel: RP / (RP + FP)</i>", interpretation: "Wenn die Methode [METHODE] ein positives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N+ Status bei <strong>[WERT]</strong> (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) im Kollektiv [KOLLEKTIV]."},
        npv: { name: "Neg. Prädiktiver Wert (NPV)", description: "NPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem negativen Testergebnis durch Methode [METHODE] tatsächlich gesund (N-) ist.<br><i>Formel: RN / (RN + FN)</i>", interpretation: "Wenn die Methode [METHODE] ein negatives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N- Status bei <strong>[WERT]</strong> (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) im Kollektiv [KOLLEKTIV]."},
        acc: { name: "Accuracy (Gesamtgenauigkeit)", description: "Accuracy ([METHODE] vs. N): Anteil aller Fälle, die durch die Methode [METHODE] korrekt klassifiziert wurden (sowohl positive als auch negative).<br><i>Formel: (RP + RN) / Gesamtanzahl</i>", interpretation: "Die Methode [METHODE] klassifizierte insgesamt <strong>[WERT]</strong> aller Patienten korrekt (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) im Kollektiv [KOLLEKTIV]."},
        balAcc: { name: "Balanced Accuracy", description: "Balanced Accuracy ([METHODE] vs. N): Der Mittelwert aus Sensitivität und Spezifität.<br><i>Formel: (Sensitivität + Spezifität) / 2</i>", interpretation: "Die Balanced Accuracy der Methode [METHODE], die Sensitivität und Spezifität gleich gewichtet, betrug <strong>[WERT]</strong> (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) im Kollektiv [KOLLEKTIV]."},
        f1: { name: "F1-Score", description: "F1-Score ([METHODE] vs. N): Das harmonische Mittel aus PPV (Precision) und Sensitivität (Recall).<br><i>Formel: 2 * (PPV * Sensitivität) / (PPV + Sensitivität)</i>", interpretation: "Der F1-Score für die Methode [METHODE], der Präzision und Sensitivität kombiniert, beträgt <strong>[WERT]</strong> (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) im Kollektiv [KOLLEKTIV]."},
        auc: { name: "Area Under Curve (AUC)", description: "AUC ([METHODE] vs. N): Fläche unter der Receiver Operating Characteristic (ROC)-Kurve. Repräsentiert die Fähigkeit der Methode [METHODE], zufällig ausgewählte N+ und N- Patienten korrekt zu rangreihen. 0.5 entspricht Zufall, 1.0 perfekter Trennung.<br><i>Für binäre Tests (wie AS oder eine feste T2-Regel) ist AUC = Balanced Accuracy.</i>", interpretation: "Die AUC von <strong>[WERT]</strong> (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) deutet auf eine <strong>[BEWERTUNG]</strong> generelle Trennschärfe der Methode [METHODE] zwischen N+ und N- Fällen im Kollektiv [KOLLEKTIV] hin."},
        mcnemar: { name: "McNemar-Test", description: "Prüft auf einen signifikanten Unterschied in den diskordanten Paaren (Fälle, bei denen AS und [T2_SHORT_NAME] unterschiedliche Ergebnisse liefern) bei gepaarten Daten.<br><i>Nullhypothese: Anzahl(AS+/[T2_SHORT_NAME]-) = Anzahl(AS-/[T2_SHORT_NAME]+)</i>", interpretation: "Der McNemar-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die Fehlklassifizierungsraten von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
        delong: { name: "DeLong-Test", description: "Vergleicht zwei AUC-Werte von ROC-Kurven, die auf denselben (gepaarten) Daten basieren, unter Berücksichtigung der Kovarianz.<br><i>Nullhypothese: AUC(AS) = AUC([T2_SHORT_NAME])</i>", interpretation: "Der DeLong-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die AUC-Werte (bzw. Balanced Accuracies) von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
        phi: { name: "Phi-Koeffizient (φ)", description: "Maß für die Stärke und Richtung des Zusammenhangs zwischen zwei binären Variablen (z.B. Vorhandensein von Merkmal [MERKMAL] und N-Status). Wertebereich von -1 bis +1.", interpretation: "Der Phi-Koeffizient von <strong>[WERT]</strong> deutet auf einen <strong>[STAERKE]</strong> Zusammenhang zwischen dem Merkmal [MERKMAL] und dem N-Status im Kollektiv [KOLLEKTIV] hin."},
        rd: { name: "Risk Difference (RD)", description: "Absolute Differenz in der Wahrscheinlichkeit (Risiko) für N+ zwischen Patienten mit und ohne das Merkmal [MERKMAL].<br><i>Formel: P(N+|Merkmal+) - P(N+|Merkmal-)</i>", interpretation: "Das Risiko für N+ war um <strong>[WERT]%</strong> absolut [HOEHER_NIEDRIGER] bei Patienten mit dem Merkmal [MERKMAL] verglichen mit Patienten ohne dieses Merkmal (95% CI nach [METHOD_CI]: [LOWER]% - [UPPER]%) im Kollektiv [KOLLEKTIV]."},
        or: { name: "Odds Ratio (OR)", description: "Quotient der Odds für N+ bei Vorhandensein vs. Abwesenheit des Merkmals [MERKMAL].<br><i>Formel: Odds(N+|Merkmal+)/Odds(N+|Merkmal-)</i><br>OR > 1 bedeutet erhöhte Odds, OR < 1 verringerte Odds.", interpretation: "Die Chance (Odds) für einen N+ Status war bei Patienten mit dem Merkmal [MERKMAL] um den Faktor <strong>[WERT]</strong> [FAKTOR_TEXT] im Vergleich zu Patienten ohne dieses Merkmal (95% CI nach [METHOD_CI]: [LOWER] - [UPPER], p=[P_WERT], [SIGNIFIKANZ]) im Kollektiv [KOLLEKTIV]."},
        fisher: { name: "Fisher's Exact Test", description: "Exakter Test zur Prüfung auf einen signifikanten Zusammenhang zwischen zwei kategorialen Variablen (z.B. Merkmal [MERKMAL] vs. N-Status).", interpretation: "Der exakte Test nach Fisher ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>, was auf einen [SIGNIFIKANZ_TEXT] Zusammenhang zwischen dem Merkmal [MERKMAL] und dem N-Status im Kollektiv [KOLLEKTIV] hindeutet."},
        mannwhitney: { name: "Mann-Whitney-U-Test", description: "Nichtparametrischer Test zum Vergleich der zentralen Tendenz (Median) einer Variable (z.B. '[VARIABLE]') zwischen zwei unabhängigen Gruppen (z.B. N+ vs. N-).", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies zeigt [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Variable '[VARIABLE]' zwischen N+ und N- Patienten im Kollektiv [KOLLEKTIV]."},
        ci95: { name: "95% Konfidenzintervall (CI)", description: "Der Wertebereich, der den wahren (unbekannten) Wert der Population für die berechnete Metrik mit einer Wahrscheinlichkeit von 95% überdeckt.<br><i>Methode: [METHOD_CI]</i>", interpretation: "Basierend auf den Daten liegt der wahre Wert der Metrik mit 95%iger Sicherheit zwischen [LOWER] und [UPPER]."},
        konfusionsmatrix: { description: "Kreuztabelle, die die Klassifikationsergebnisse der Methode [METHODE] mit dem tatsächlichen N-Status vergleicht: Richtig Positive (RP), Falsch Positive (FP), Falsch Negative (FN), Richtig Negative (RN)." },
        accComp: { name: "Accuracy Vergleich", description: "Vergleicht die Accuracy der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels Fisher's Exact Test.", interpretation: "Der Unterschied in der Accuracy der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
        aucComp: { name: "AUC Vergleich", description: "Vergleicht die AUC der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels eines Z-Tests.", interpretation: "Der Unterschied in der AUC der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
        logisticRegressionFit: { name: "Modellanpassung (Log. Regression)", description: "Güte der Anpassung des logistischen Regressionsmodells an die Daten.", interpretation: "Das Modell zeigt eine [BEWERTUNG_FIT] Anpassung an die Daten."},
        logisticRegressionCoef: { name: "Koeffizient (Log. Regression)", description: "Geschätzter Koeffizient für den Prädiktor [PREDICTOR]. Gibt die Veränderung der Log-Odds für N+ pro Einheitsänderung des Prädiktors an.", interpretation: "Der Koeffizient für [PREDICTOR] beträgt <strong>[COEF_VALUE]</strong> (p=[P_WERT], [SIGNIFIKANZ]), was auf einen [SIGNIFIKANZ_TEXT] Einfluss auf die N+ Wahrscheinlichkeit hindeutet."},
        rocCurvePlot: { description: "Zeigt die ROC-Kurve für {Variable}. Die Diagonale repräsentiert zufällige Klassifikation (AUC=0.5). Eine Kurve näher an der oberen linken Ecke bedeutet bessere Leistung."},
        defaultP: { interpretation: `Der berechnete p-Wert beträgt <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Bei einem Signifikanzniveau von ${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL} ist das Ergebnis <strong>[SIGNIFIKANZ_TEXT]</strong>.` },
        signifikanzTexte: { SIGNIFIKANT: "statistisch signifikant", NICHT_SIGNIFIKANT: "statistisch nicht signifikant" },
        orFaktorTexte: { ERHOEHT: "erhöht", VERRINGERT: "verringert", UNVERAENDERT: "unverändert" }, // Added 'unverändert'
        rdRichtungTexte: { HOEHER: "höher", NIEDRIGER: "niedriger", GLEICH: "gleich" }, // Added 'gleich'
        assoziationStaerkeTexte: { stark: "stark", moderat: "moderat", schwach: "schwach", sehr_schwach: "sehr schwach", nicht_bestimmbar: "nicht bestimmbar" }
    }
};

deepFreeze(UI_TEXTS);
deepFreeze(TOOLTIP_CONTENT);
