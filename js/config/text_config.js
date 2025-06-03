const UI_TEXTS = Object.freeze({
    appName: "Lymphknoten T2 & Avocado Sign Analyse",
    general: {
        loading: "Lade Daten...",
        error: "Ein Fehler ist aufgetreten.",
        noData: "Keine Daten verfügbar.",
        confirm: "Bestätigen",
        cancel: "Abbrechen",
        close: "Schließen",
        save: "Speichern",
        reset: "Zurücksetzen",
        apply: "Anwenden",
        settings: "Einstellungen",
        details: "Details",
        value: "Wert",
        kollektiv: "Kollektiv",
        yes: "Ja",
        no: "Nein",
        all: "Alle",
        total: "Gesamt",
        and: "UND",
        or: "ODER",
        filter: "Filter",
        show: "Anzeigen",
        hide: "Verbergen",
        download: "Download",
        export: "Exportieren",
        unknown: "Unbekannt"
    },
    kollektivDisplayNames: {
        'Gesamt': 'Gesamtkollektiv',
        'direkt OP': 'Direkt-OP Gruppe',
        'nRCT': 'nRCT Gruppe'
    },
    t2LogicDisplayNames: {
        'UND': 'UND',
        'ODER': 'ODER'
    },
    dataTab: {
        title: "Datentabelle",
        toggleDetails: "Alle Details Ein-/Ausblenden",
        filterPlaceholder: "Patienten filtern (ID, Name...)"
    },
    auswertungTab: {
        title: "Auswertung & Kriterien",
        t2CriteriaCardTitle: "T2 Malignitäts-Kriterien Definieren",
        bruteForceCardTitle: "Kriterien-Optimierung (Brute-Force)",
        metricsOverviewCardTitle: "Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)"
    },
    statistikTab: {
        title: "Statistik",
        layoutSwitchLabel: {
            einzel: '<i class="fas fa-user-cog me-1"></i> Einzelansicht Aktiv',
            vergleich: '<i class="fas fa-users-cog me-1"></i> Vergleich Aktiv'
        },
        deskriptivCardTitle: "Deskriptive Statistik",
        gueteASCardTitle: "Diagnostische Güte: Avocado Sign",
        gueteT2AngewandtCardTitle: "Diagnostische Güte: T2 (angewandte Kriterien)",
        gueteT2LiteraturCardTitle: "Diagnostische Güte: T2 (Literatur-Kriterien)",
        gueteT2BruteForceCardTitle: "Diagnostische Güte: T2 (Brute-Force optimiert für [METRIC_NAME])",
        vergleichASvsT2CardTitle: "Vergleich: Avocado Sign vs. T2 Kriterien",
        assoziationMerkmalCardTitle: "Assoziation: [MERKMAL] vs. N-Status",
        filterMerkmalLabel: "Merkmal für Assoziationsanalyse:",
        t2KriterienSetLabel: "Vergleichs-T2-Set:"
    },
    praesentationTab: {
        title: "Präsentation",
        viewSelectLabel: "Ansicht wählen:",
        viewOptions: {
            asPur: "Avocado Sign (AS) Performance",
            asVsT2: "AS vs. T2 (Literatur-Kriterium)"
        },
        studySelectLabel: "T2-Literatur-Kriterium wählen:",
        performanceCardTitle: "Performance: [METHOD_NAME]",
        comparisonCardTitle: "Vergleich: AS vs. [T2_NAME]",
        testResultsCardTitle: "Statistische Tests: AS vs. [T2_NAME]"
    },
    publikationTab: {
        title: "Publikation",
        sectionLabels: {
            methoden: "Methoden",
            methoden_studienanlage: "Studiendesign und Ethik",
            methoden_patientenkollektiv: "Patientenkollektiv",
            methoden_mrt_protokoll: "MRT-Protokoll & Kontrastmittelgabe",
            methoden_as_definition: "Definition & Bewertung Avocado Sign",
            methoden_t2_definition: "Definition & Bewertung T2-Kriterien",
            methoden_referenzstandard: "Referenzstandard (Histopathologie)",
            methoden_statistische_analyse: "Statistische Analyse",
            ergebnisse: "Ergebnisse",
            ergebnisse_patientencharakteristika: "Patientencharakteristika",
            ergebnisse_as_performance: "Diagnostische Güte: Avocado Sign",
            ergebnisse_literatur_t2_performance: "Diagnostische Güte: Literatur-T2-Kriterien",
            ergebnisse_optimierte_t2_performance: "Diagnostische Güte: Optimierte T2-Kriterien",
            ergebnisse_vergleich_performance: "Vergleich: AS vs. T2-Kriterien",
            referenzen: "Referenzen",
            referenzen_liste: "Referenzliste"
        },
        spracheSwitchLabel: {
            de: "Deutsch",
            en: "English"
        },
        bruteForceMetricSelectLabel: "Optimierungs-Zielmetrik (für Anzeige BF-optimierter Kriterien):"
    },
    exportTab: {
        title: "Export"
    },
    legendLabels: {
        male: "Männlich",
        female: "Weiblich",
        unknownGender: "Unbekannt",
        asPositive: "AS Positiv",
        asNegative: "AS Negativ",
        t2Positive: "T2 Positiv",
        t2Negative: "T2 Negativ",
        pathoNPositive: "N-Status Positiv",
        pathoNNegative: "N-Status Negativ"
    },
    statMetrics: {
        assoziationStaerkeTexte: {
            nicht_bestimmbar: "Nicht bestimmbar",
            exzellent: "Exzellent",
            gut: "Gut",
            moderat: "Moderat",
            schwach: "Schwach",
            sehr_schwach: "Sehr schwach / Nicht informativ",
            nicht_informativ: "Nicht informativ"
        },
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
        }
    },
    kurzanleitung: {
        title: "Kurzanleitung & Wichtige Hinweise",
        content: `
            <h5>Willkommen zum Analyse-Tool!</h5>
            <p>Diese Anwendung dient der explorativen Analyse und dem Vergleich des Avocado Signs mit T2-Kriterien für das Lymphknoten-Staging beim Rektumkarzinom.</p>
            <h6>Tabs:</h6>
            <ul>
                <li><strong>Daten:</strong> Ansicht und Filterung der Rohdaten. Klicken auf eine Zeile zeigt alle Lymphknoten des Patienten.</li>
                <li><strong>Auswertung:</strong> Definition von T2-Kriterien und Start der Brute-Force Optimierung. Die hier eingestellten Kriterien sind die "angewandten T2-Kriterien" für andere Tabs. Eine Übersicht der Performance der angewandten Kriterien für das aktuelle Kollektiv wird unten angezeigt.</li>
                <li><strong>Statistik:</strong> Detaillierte statistische Auswertung. Wählen Sie ein Kollektiv oder vergleichen Sie zwei.</li>
                <li><strong>Präsentation:</strong> Visualisierung der Performance-Metriken und Vergleiche.</li>
                <li><strong>Publikation:</strong> Generierung von Textbausteinen, Tabellen und Diagrammen für eine wissenschaftliche Publikation.</li>
                <li><strong>Export:</strong> Download verschiedener Daten und Ergebnisse.</li>
            </ul>
            <h6>Wichtige Hinweise:</h6>
            <ul>
                <li><strong>Kollektiv-Auswahl:</strong> Die globale Kollektiv-Auswahl (oben rechts) beeinflusst die angezeigten Daten und Berechnungen in den meisten Tabs.</li>
                <li><strong>T2-Kriterien:</strong> Die im Tab "Auswertung" definierten und angewendeten Kriterien werden für alle T2-basierten Berechnungen (außer Literatur- und Brute-Force-spezifischen) verwendet. Änderungen hier wirken sich global aus. Speichern nicht vergessen!</li>
                <li><strong>Brute-Force:</strong> Die Optimierung kann je nach System einige Zeit in Anspruch nehmen. Ergebnisse werden pro Kollektiv und Zielmetrik zwischengespeichert (Local Storage).</li>
                <li><strong>Statistische Validität:</strong> Dieses Tool dient der explorativen Analyse. Für definitive wissenschaftliche Aussagen sollten kritische Berechnungen ggf. mit etablierter Statistiksoftware validiert werden. Insbesondere Konfidenzintervalle und p-Werte bei kleinen Fallzahlen (siehe Tooltips) sind mit Vorsicht zu interpretieren.</li>
                <li><strong>Speicherung:</strong> Alle Einstellungen (T2-Kriterien, Sortierungen, Tab-Auswahl etc.) und Brute-Force-Ergebnisse werden automatisch im Local Storage Ihres Browsers gespeichert.</li>
            </ul>
            <p class="mt-3">Viel Erfolg bei der Analyse!</p>
        `
    }
});

const TOOLTIP_CONTENT = Object.freeze({
    header: {
        appName: UI_TEXTS.appName,
        kollektivSelect: "Globales Patientenkollektiv für die Analyse auswählen.",
        patientCount: "Anzahl der Patienten im aktuellen Kollektiv.",
        nStatusInfo: "Pathologischer N-Status im aktuellen Kollektiv (N+/N-Gesamt).",
        asStatusInfo: "Avocado Sign Status im aktuellen Kollektiv (AS+/AS-Gesamt).",
        t2StatusInfo: "T2-basierter Status (gemäß aktuell angewandten Kriterien) im aktuellen Kollektiv (T2+/T2-Gesamt)."
    },
    navigation: {
        datenTab: "Patientenrohdaten anzeigen und filtern.",
        auswertungTab: "T2-Kriterien definieren, Brute-Force-Optimierung starten und Performance der angewandten Kriterien einsehen.",
        statistikTab: "Detaillierte statistische Kennzahlen und Vergleiche anzeigen.",
        praesentationTab: "Diagramme und Übersichten zur Ergebnispräsentation.",
        publikationTab: "Textbausteine, Tabellen und Diagramme für eine wissenschaftliche Publikation generieren.",
        exportTab: "Daten und Ergebnisse in verschiedenen Formaten exportieren."
    },
    datenTable: {
        filterInput: "Patientenliste nach ID, Name oder anderen Merkmalen filtern.",
        expandAll: "Alle Patientendetails (Lymphknoten) ein-/ausblenden.",
        patNr: "Patienten-ID.",
        patName: "Pseudonymisierter Patientenname.",
        geburtsdatum: "Geburtsdatum des Patienten.",
        alter: "Alter des Patienten zum Untersuchungszeitpunkt.",
        geschlecht: "Geschlecht des Patienten.",
        therapie: "Art der Therapie (Direkt-OP oder nRCT).",
        untersuchungsdatum: "Datum der MRT-Untersuchung.",
        asStatus: "Avocado Sign Status des Patienten (+: positiv, -: negativ).",
        anzahlAS: "Anzahl der Avocado Sign positiven Lymphknoten beim Patienten.",
        t2Status: "T2-basierter Status des Patienten gemäß aktuell angewandten Kriterien (+: positiv, -: negativ).",
        anzahlT2: "Anzahl der T2-positiven Lymphknoten beim Patienten gemäß aktuell angewandten Kriterien.",
        nStatus: "Pathologischer N-Status des Patienten (+: Lymphknotenmetastasen vorhanden, -: keine Lymphknotenmetastasen).",
        anzahlPathoNplus: "Anzahl der histopathologisch positiven Lymphknoten.",
        anzahlPathoLymphknoten: "Gesamtzahl der untersuchten Lymphknoten (histopathologisch)."
    },
    auswertungTable: { /* Analog zu datenTable, wenn benötigt */
        expandAll: "Alle Patientendetails (Lymphknoten) ein-/ausblenden.",
    },
    t2CriteriaCard: {
        unsavedIndicator: "Ungespeicherte Änderungen an den T2-Kriterien vorhanden. Klicken Sie auf 'Anwenden & Speichern'.",
        appliedDisplay: "Aktuell auf den Datensatz angewendete und im Local Storage gespeicherte T2-Kriterien und Logik. Diese Einstellungen beeinflussen alle Tabellen und Statistiken."
    },
    t2Logic: {
        description: "Logische Verknüpfung der aktiven T2-Kriterien.<br><strong>UND:</strong> Alle aktiven Kriterien müssen für einen Lymphknoten erfüllt sein.<br><strong>ODER:</strong> Mindestens eines der aktiven Kriterien muss für einen Lymphknoten erfüllt sein."
    },
    t2Size: {
        description: "Größenkriterium (Kurzachsendurchmesser). Lymphknoten gilt als positiv, wenn Größe ≥ Schwellenwert.",
        rangeSlider: "Schwellenwert für Kurzachsendurchmesser (in mm) einstellen. Nur aktiv, wenn Checkbox 'Größe' aktiviert ist.",
        manualInput: "Schwellenwert für Kurzachsendurchmesser (in mm) manuell eingeben. Nur aktiv, wenn Checkbox 'Größe' aktiviert ist."
    },
    t2Form: {
        description: "Formkriterium. Aktivieren und gewünschte Form(en) auswählen, die als positiv gelten.",
        optionTooltips: {
            rund: "Lymphknoten mit runder Form als suspekt werten.",
            oval: "Lymphknoten mit ovaler Form als suspekt werten."
        }
    },
    t2Kontur: {
        description: "Konturkriterium. Aktivieren und gewünschte Kontur(en) auswählen, die als positiv gelten.",
        optionTooltips: {
            scharf: "Lymphknoten mit scharfer Kontur als suspekt werten.",
            irregulär: "Lymphknoten mit irregulärer Kontur als suspekt werten."
        }
    },
    t2Homogenitaet: {
        description: "Homogenitätskriterium. Aktivieren und gewünschte(n) Binnenstruktur/Textur auswählen, die als positiv gilt/gelten.",
        optionTooltips: {
            homogen: "Lymphknoten mit homogener Binnenstruktur als suspekt werten.",
            heterogen: "Lymphknoten mit heterogener Binnenstruktur als suspekt werten."
        }
    },
    t2Signal: {
        description: "Signalkriterium (T2-Signalintensität). Aktivieren und gewünschte(s) Signalverhalten auswählen, das als positiv gilt/gelten.",
        note: "Hinweis: Lymphknoten mit Signal 'null' (d.h. nicht beurteilbar/nicht vorhanden) erfüllen das Signal-Kriterium nie.",
        optionTooltips: {
            signalarm: "Lymphknoten mit signalarmer T2-Intensität als suspekt werten.",
            intermediär: "Lymphknoten mit intermediärer T2-Intensität als suspekt werten.",
            signalreich: "Lymphknoten mit signalreicher T2-Intensität als suspekt werten."
        }
    },
    t2Actions: {
        reset: "Setzt alle T2-Kriterien auf die Standardwerte zurück. Änderungen werden nicht automatisch gespeichert.",
        apply: "Wendet die aktuellen Einstellungen der T2-Kriterien auf den Datensatz an und speichert sie im Browser (Local Storage). Alle Statistiken und Auswertungen werden neu berechnet."
    },
    bruteForceCard: {
        description: "Findet automatisch die Kombination von T2-Kriterien und Logik (UND/ODER), die eine gewählte diagnostische Metrik für das aktuelle Kollektiv maximiert."
    },
    bruteForceMetric: {
        description: "Zielmetrik, die durch die Brute-Force-Optimierung maximiert werden soll."
    },
    bruteForceStart: {
        description: "Startet den Brute-Force-Optimierungsprozess. Dies kann je nach Datenmenge und Systemleistung einige Zeit in Anspruch nehmen."
    },
    bruteForceInfo: {
        description: "Status des Optimierungs-Workers für das Kollektiv [KOLLEKTIV_NAME]."
    },
    bruteForceProgress: {
        description: "Fortschritt der laufenden Optimierung. Zeigt an, wie viele von [TOTAL] Kombinationen bereits getestet wurden.",
        bestMetricValue: "Bester bisher gefundener Wert für die Zielmetrik.",
        bestCriteria: "Kriterienkombination und Logik für den besten bisherigen Metrikwert."
    },
    bruteForceCancel: {
        description: "Bricht die laufende Brute-Force-Optimierung ab."
    },
    bruteForceResult: {
        description: "Bestes Ergebnis der abgeschlossenen Optimierung. Kollektiv N=[N_GESAMT] (N+=[N_PLUS], N-=[N_MINUS]).",
        kollektivStats: "Statistik des für diese Optimierung verwendeten Kollektivs."
    },
    bruteForceApply: {
        description: "Wendet die beste gefundene Kriterienkombination auf den Datensatz an und speichert sie als aktuelle T2-Kriterien. Dies überschreibt die manuell eingestellten Kriterien."
    },
    bruteForceDetailsButton: {
        description: "Zeigt ein Modal mit den Top 10 Ergebnissen der Brute-Force-Optimierung und weiteren Details zu den jeweiligen Kriterienkombinationen an."
    },
    bruteForceModal: {
        title: "Top Ergebnisse der Brute-Force Optimierung",
        exportButton: "Exportiert die angezeigten Top-Ergebnisse als Textdatei (.txt)."
    },
    t2MetricsOverview: {
        cardTitle: "Kurzübersicht der diagnostischen Güte der aktuell angewandten T2-Kriterien im Vergleich zum pathologischen N-Status für Kollektiv [KOLLEKTIV].",
        sens: "Sensitivität (Richtig-Positiv-Rate) der angewandten T2-Kriterien.",
        spez: "Spezifität (Richtig-Negativ-Rate) der angewandten T2-Kriterien.",
        ppv: "Positiver Prädiktiver Wert der angewandten T2-Kriterien.",
        npv: "Negativer Prädiktiver Wert der angewandten T2-Kriterien.",
        acc: "Genauigkeit (Accuracy) der angewandten T2-Kriterien.",
        balAcc: "Balanced Accuracy der angewandten T2-Kriterien.",
        f1: "F1-Score der angewandten T2-Kriterien.",
        auc: "Area Under Curve (ROC) der angewandten T2-Kriterien (entspricht Balanced Accuracy bei binären Tests)."
    },
    statistikLayoutSwitch: {
        einzel: "Zeigt Statistiken für ein einzelnes, unten ausgewähltes Kollektiv.",
        vergleich: "Aktiviert den Vergleichsmodus zwischen zwei unten ausgewählten Kollektiven."
    },
    statistikKollektivSelect: {
        kollektiv1: "Erstes Kollektiv für den Vergleichsmodus auswählen.",
        kollektiv2: "Zweites Kollektiv für den Vergleichsmodus auswählen.",
        einzel: "Kollektiv für die Einzelansicht der Statistiken auswählen."
    },
    statistikFilterMerkmal: {
        description: "Wählen Sie ein binäres Merkmal aus den Patientendaten aus, dessen Assoziation mit dem pathologischen N-Status untersucht werden soll (z.B. Geschlecht, spezifische T2-Merkmale einzelner Lymphknoten, falls verfügbar)."
    },
    statistikT2VergleichsSet: {
        description: "Wählen Sie ein T2-Kriterienset (angewandt, Literatur oder Brute-Force optimiert), dessen Performance mit der des Avocado Signs statistisch verglichen werden soll."
    },
    deskriptiveStatistik: {
        cardTitle: "Deskriptive Statistik für Kollektiv [KOLLEKTIV].",
        chartAge: "Altersverteilung im Kollektiv [KOLLEKTIV].",
        chartGender: "Geschlechterverteilung im Kollektiv [KOLLEKTIV].",
        nStatus: "Verteilung des pathologischen N-Status im Kollektiv [KOLLEKTIV].",
        asStatus: "Verteilung des Avocado Sign Status im Kollektiv [KOLLEKTIV].",
        t2Status: "Verteilung des T2-basierten Status (angewandte Kriterien) im Kollektiv [KOLLEKTIV]."
    },
    diagnostischeGuete: {
        cardTitleAS: "Diagnostische Güte des Avocado Signs für Kollektiv [KOLLEKTIV].",
        cardTitleT2Angewandt: "Diagnostische Güte der aktuell angewandten T2-Kriterien für Kollektiv [KOLLEKTIV].",
        cardTitleT2Literatur: "Diagnostische Güte der Literatur-basierten T2-Kriteriensets für Kollektiv [KOLLEKTIV] (sofern anwendbar).",
        cardTitleT2BruteForce: "Diagnostische Güte der für [METRIC_NAME] Brute-Force-optimierten T2-Kriterien für Kollektiv [KOLLEKTIV]."
    },
    vergleichASvsT2: {
        cardTitle: "Statistischer Vergleich der diagnostischen Güte zwischen Avocado Sign und ausgewählten T2-Kriteriensets für Kollektiv [KOLLEKTIV].",
        chartTitle: "Performance-Vergleich AS vs. T2 ([T2_SET_NAME]) für Kollektiv [KOLLEKTIV]."
    },
    assoziationMerkmal: {
        cardTitle: "Analyse der Assoziation zwischen dem Merkmal '[MERKMAL]' und dem pathologischen N-Status für Kollektiv [KOLLEKTIV]."
    },
    praesentationTabTooltips: {
        viewSelect: "Wählen Sie die Art der Präsentationsansicht.",
        studySelect: "Wählen Sie ein Literatur-basiertes T2-Kriterienset für den Vergleich mit dem Avocado Sign."
    },
    publikationTabTooltips: {
        sectionSelect: "Wählen Sie einen Abschnitt der Publikation zur Ansicht und Bearbeitung aus.",
        spracheSwitch: {
            description: "Schaltet die Sprache der generierten Publikationstexte zwischen Deutsch und Englisch um."
        },
        bruteForceMetricSelect: {
            description: "Wählen Sie die Zielmetrik, für welche die Ergebnisse der Brute-Force-Optimierung in den Texten und Tabellen dieses Publikation-Tabs dargestellt werden sollen."
        },
        methoden: { description: "Navigiert zum Methodenteil der Publikation." },
        ergebnisse: { description: "Navigiert zum Ergebnisteil der Publikation." },
        referenzen: { description: "Navigiert zur Referenzliste der Publikation." }
    },
    exportTab: {
        description: "Exportiert Daten und Ergebnisse für das Kollektiv [KOLLEKTIV]. Bitte beachten Sie, dass alle Exporte auf den zuletzt **angewendeten** T2-Kriterien basieren. Exporte für Diagramme/Tabellen-Bilder (PNG/SVG-ZIPs) erfassen nur Elemente, die im jeweiligen Tab gerade sichtbar/gerendert sind.",
        singleExports: "Einzelexporte",
        exportPackages: "Export-Pakete (ZIP)",
        statsCSV: { description: "Exportiert detaillierte statistische Ergebnisse (Performance-Metriken, Vergleichstests, Assoziationen) als CSV-Datei. Enthält exakte numerische p-Werte.", type: "STATS_CSV", ext: "csv" },
        bruteForceTXT: { description: "Exportiert einen detaillierten Bericht der Brute-Force-Optimierungsergebnisse (bestes Ergebnis und Top-Liste) als Textdatei.", type: "BRUTEFORCE_TXT", ext: "txt" },
        deskriptivMD: { description: "Exportiert die deskriptive Statistik des aktuellen Kollektivs als Markdown-formatierte Tabelle.", type: "DESKRIPTIV_MD", ext: "md" },
        datenMD: { description: "Exportiert die (gefilterte) Patienten-Rohdatenliste als Markdown-Tabelle.", type: "DATEN_MD", ext: "md" },
        auswertungMD: { description: "Exportiert die Auswertungstabelle (Patienten mit AS/T2-Status) als Markdown-Tabelle.", type: "AUSWERTUNG_MD", ext: "md" },
        filteredDataCSV: { description: "Exportiert die aktuell im 'Daten'-Tab angezeigten (gefilterten) Rohdaten als CSV-Datei.", type: "FILTERED_DATA_CSV", ext: "csv" },
        comprehensiveReportHTML: { description: "Generiert einen umfassenden HTML-Bericht mit allen wichtigen Ergebnissen, Tabellen und Diagrammen.", type: "COMPREHENSIVE_REPORT_HTML", ext: "html" },
        pngZIP: { description: "Exportiert alle aktuell im Statistik-, Auswertungs- und Publikationstab sichtbaren Diagramme und Tabellen als PNG-Bilder in einem ZIP-Archiv.", type: "PNG_ZIP", ext: "zip" },
        svgZIP: { description: "Exportiert alle aktuell im Statistik-, Auswertungs- und Publikationstab sichtbaren Diagramme als SVG-Dateien (Vektorgrafik) in einem ZIP-Archiv.", type: "SVG_ZIP", ext: "zip" },
        allZIP: { description: "Exportiert alle verfügbaren Einzeldateien (Statistik-CSV, Brute-Force-TXT, alle Markdown-Dateien inkl. Publikationstexten, gefilterte Rohdaten-CSV, HTML-Bericht, Publikations-Tabellen als TSV) in einem ZIP-Archiv.", type: "ALL_ZIP", ext: "zip" },
        csvZIP: { description: "Exportiert alle relevanten CSV-Dateien (Statistik, gefilterte Rohdaten) in einem ZIP-Archiv.", type: "CSV_ZIP", ext: "zip" },
        mdZIP: { description: "Exportiert alle Markdown-Dateien (Deskriptive Statistik, Datenliste, Auswertungstabelle, Publikationsabschnitte) in einem ZIP-Archiv.", type: "MD_ZIP", ext: "zip" },
        chartSinglePNG: { description: "Diagramm '{ChartName}' als PNG-Bild herunterladen.", type: "CHART_SINGLE_PNG", ext: "png" },
        chartSingleSVG: { description: "Diagramm '{ChartName}' als SVG-Vektorgrafik herunterladen.", type: "CHART_SINGLE_SVG", ext: "svg" },
        tableSinglePNG: { description: "Tabelle '{TableName}' als PNG-Bild herunterladen.", type: "TABLE_PNG_EXPORT", ext: "png"},
        publicationMethodenMD: { description: "Exportiert den aktuellen Methodenabschnitt '{SectionName}' als Markdown-Datei.", type: "PUBLIKATION_METHODEN_MD", ext: "md" },
        publicationErgebnisseMD: { description: "Exportiert den aktuellen Ergebnisabschnitt '{SectionName}' als Markdown-Datei.", type: "PUBLIKATION_ERGEBNISSE_MD", ext: "md" },
        publicationReferenzenMD: { description: "Exportiert die Referenzliste als Markdown-Datei.", type: "PUBLIKATION_REFERENZEN_MD", ext: "md" },
        publicationTableTSV: { description: "Exportiert die Tabelle '{TableName}' aus dem Publikation-Tab als TSV-Datei (Tab-separated values), ideal für Import in Excel oder Word.", type: "PUBLIKATION_TABLE_TSV", ext: "tsv" },
        referencesBibTeX: { description: "Exportiert alle in der Anwendung hinterlegten Literaturreferenzen im BibTeX-Format.", type: "REFERENCES_BIBTEX", ext: "bib" }
    },
    statMetrics: {
        sens: {
            description: "Sensitivität (Richtig-Positiv-Rate): Anteil der korrekt als positiv identifizierten Fälle unter allen tatsächlich positiven Fällen. Berechnet als RP / (RP + FN).",
            interpretation: "Für Methode [METHODE] im Kollektiv [KOLLEKTIV] beträgt die Sensitivität [WERT] (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]). Das bedeutet, dass [WERT] der tatsächlich positiven Fälle korrekt erkannt wurden."
        },
        spez: {
            description: "Spezifität (Richtig-Negativ-Rate): Anteil der korrekt als negativ identifizierten Fälle unter allen tatsächlich negativen Fällen. Berechnet als RN / (RN + FP).",
            interpretation: "Für Methode [METHODE] im Kollektiv [KOLLEKTIV] beträgt die Spezifität [WERT] (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]). Das bedeutet, dass [WERT] der tatsächlich negativen Fälle korrekt erkannt wurden."
        },
        ppv: {
            description: "Positiver Prädiktiver Wert (PPV): Wahrscheinlichkeit, dass ein Fall tatsächlich positiv ist, gegeben einem positiven Testergebnis. Berechnet als RP / (RP + FP).",
            interpretation: "Für Methode [METHODE] im Kollektiv [KOLLEKTIV] beträgt der PPV [WERT] (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]). Das bedeutet, bei einem positiven Testergebnis ist die Wahrscheinlichkeit [WERT], dass der Fall tatsächlich positiv ist."
        },
        npv: {
            description: "Negativer Prädiktiver Wert (NPV): Wahrscheinlichkeit, dass ein Fall tatsächlich negativ ist, gegeben einem negativen Testergebnis. Berechnet als RN / (RN + FN).",
            interpretation: "Für Methode [METHODE] im Kollektiv [KOLLEKTIV] beträgt der NPV [WERT] (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]). Das bedeutet, bei einem negativen Testergebnis ist die Wahrscheinlichkeit [WERT], dass der Fall tatsächlich negativ ist."
        },
        acc: {
            description: "Genauigkeit (Accuracy): Anteil der korrekt klassifizierten Fälle (sowohl positiv als auch negativ) an allen Fällen. Berechnet als (RP + RN) / Gesamt.",
            interpretation: "Für Methode [METHODE] im Kollektiv [KOLLEKTIV] beträgt die Genauigkeit [WERT] (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]). Das bedeutet, [WERT] aller Fälle wurden korrekt klassifiziert."
        },
        balAcc: {
            description: "Balanced Accuracy: Mittelwert aus Sensitivität und Spezifität. Ein Maß für die Genauigkeit, das ungleiche Klassengrößen besser berücksichtigt. Berechnet als (Sensitivität + Spezifität) / 2.",
            interpretation: "Für Methode [METHODE] im Kollektiv [KOLLEKTIV] beträgt die Balanced Accuracy [WERT] (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER])."
        },
        auc: {
            description: "Area Under the ROC Curve (AUC): Maß für die Gesamtperformance eines diagnostischen Tests über alle Schwellenwerte. Ein Wert von 1.0 bedeutet perfekte Klassifikation, 0.5 entspricht Zufall. Bei binären Tests (wie hier meist angewandt) oft äquivalent zur Balanced Accuracy.",
            interpretation: "Für Methode [METHODE] im Kollektiv [KOLLEKTIV] beträgt die AUC [WERT] (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]). Die AUC wird als [BEWERTUNG] bewertet."
        },
        f1: {
            description: "F1-Score: Harmonisches Mittel aus PPV und Sensitivität. Nützlich, wenn ein Gleichgewicht zwischen PPV und Sensitivität gesucht wird, besonders bei ungleichen Klassengrößen. Berechnet als 2 * (PPV * Sensitivität) / (PPV + Sensitivität).",
            interpretation: "Für Methode [METHODE] im Kollektiv [KOLLEKTIV] beträgt der F1-Score [WERT] (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER])."
        },
        mcc: {
            description: "Matthews Correlation Coefficient (MCC): Maß für die Qualität einer binären Klassifikation. Berücksichtigt alle vier Werte der Konfusionsmatrix. Werte reichen von -1 (perfekte Fehlklassifikation) über 0 (Zufall) bis +1 (perfekte Klassifikation).",
            interpretation: "Für Methode [METHODE] im Kollektiv [KOLLEKTIV] beträgt der MCC [WERT]. Werte nahe +1 deuten auf eine sehr gute Übereinstimmung hin."
        },
        or: {
            description: "Odds Ratio (OR): Verhältnis der Odds für ein positives Ergebnis in einer Gruppe (z.B. Merkmal vorhanden) zu den Odds für ein positives Ergebnis in einer anderen Gruppe (z.B. Merkmal nicht vorhanden). Ein OR > 1 bedeutet höhere Odds in der ersten Gruppe, OR < 1 niedrigere Odds.",
            interpretation: "Das Vorhandensein von [MERKMAL] [FAKTOR_TEXT] die Odds für einen positiven N-Status um den Faktor [WERT] (95%-KI nach [METHOD_CI]: [LOWER] – [UPPER]), p=[P_WERT], [SIGNIFIKANZ]."
        },
        rd: {
            description: "Risikodifferenz (RD): Absolute Differenz der Risiken für ein positives Ergebnis zwischen zwei Gruppen. Gibt an, um wie viel Prozentpunkte das Risiko in einer Gruppe höher oder niedriger ist als in der anderen.",
            interpretation: "Das Risiko für einen positiven N-Status ist bei Vorhandensein von [MERKMAL] um [WERT] Prozentpunkte [HOEHER_NIEDRIGER] als ohne dieses Merkmal (95%-KI nach [METHOD_CI]: [LOWER]% – [UPPER]%)."
        },
        phi: {
            description: "Phi-Koeffizient (φ): Maß für die Assoziation zwischen zwei binären Variablen. Äquivalent zum Pearson-Korrelationskoeffizienten für binäre Daten. Werte reichen von -1 bis +1.",
            interpretation: "Der Phi-Koeffizient zwischen [MERKMAL] und dem N-Status beträgt [WERT]. Dies deutet auf einen [STAERKE] Zusammenhang hin."
        },
        mcnemar: {
            description: "McNemar-Test: Statistischer Test zum Vergleich zweier gepaarter binärer Klassifikationen (z.B. Avocado Sign vs. T2-Kriterien bei denselben Patienten) hinsichtlich ihrer Genauigkeit (Accuracy) bzw. der diskordanten Paare.",
            interpretation: "Der McNemar-Test zum Vergleich der Genauigkeiten von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] ergab einen p-Wert von [P_WERT] ([TEST_STATISTIK], df=[FREIHEITSGRADE]). Dies ist [SIGNIFIKANZ_TEXT]."
        },
        delong: {
            description: "DeLong-Test: Statistischer Test zum Vergleich zweier AUC-Werte von ROC-Kurven, die auf denselben Daten basieren (gepaarte Daten).",
            interpretation: "Der DeLong-Test zum Vergleich der AUC-Werte von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] ergab einen p-Wert von [P_WERT] (Z=[Z_WERT]). Die Differenz der AUCs (AS - T2) betrug [DIFF_AUC]. Dies ist [SIGNIFIKANZ_TEXT]."
        },
        fisher: {
            description: "Fisher's Exact Test: Statistischer Test zur Prüfung der Unabhängigkeit zweier kategorialer Variablen in einer Kontingenztafel. Wird oft bei kleinen Stichproben verwendet, wenn die Voraussetzungen für den Chi-Quadrat-Test nicht erfüllt sind.",
            interpretation: "Der Fisher's Exact Test für die Assoziation von [MERKMAL] und dem N-Status im Kollektiv [KOLLEKTIV] ergab einen p-Wert von [P_WERT]. Dies ist [SIGNIFIKANZ_TEXT]."
        },
        mannwhitney: { /* Alias size_mwu */
            description: "Mann-Whitney-U-Test (auch Wilcoxon-Rangsummentest): Nichtparametrischer Test zum Vergleich der Verteilungen zweier unabhängiger Stichproben. Prüft, ob die Werte in einer Gruppe tendenziell höher oder niedriger sind als in der anderen.",
            interpretation: "Der Mann-Whitney-U-Test zum Vergleich von [VARIABLE] zwischen den Gruppen (N+ vs. N0) im Kollektiv [KOLLEKTIV] ergab einen p-Wert von [P_WERT] (U=[U_WERT], Z=[Z_WERT]). Dies ist [SIGNIFIKANZ_TEXT]."
        },
        size_mwu: {
            description: "Mann-Whitney-U-Test zum Vergleich der Lymphknoten-Größenverteilungen zwischen Patienten mit positivem und negativem N-Status.",
            interpretation: "Der Mann-Whitney-U-Test zum Vergleich der Lymphknoten-Größenverteilungen (basierend auf [VARIABLE]) zwischen Patienten mit N+ und N0 Status im Kollektiv [KOLLEKTIV] ergab einen p-Wert von [P_WERT] (U=[U_WERT], Z=[Z_WERT]). Dies ist [SIGNIFIKANZ_TEXT]."
        },
        defaultP: {
             description: "P-Wert eines statistischen Tests.",
             interpretation: "Der Test für [MERKMAL] im Kollektiv [KOLLEKTIV] ergab einen p-Wert von [P_WERT]. Dies ist [SIGNIFIKANZ_TEXT]."
        }
    }
});
