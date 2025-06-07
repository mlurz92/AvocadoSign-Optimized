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
        'koh_2008_morphology': 'Koh et al. (2008)',
        'barbaro_2024_restaging': 'Barbaro et al. (2024)',
        'rutegard_et_al_esgar': 'Rutegård et al. (ESGAR)',
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
            references: 'Referenzen',
            sidebarTitle: 'Manuskript-Navigation'
        },
        bruteForceMetricSelectLabel: 'Optimierungsmetrik für T2 (BF):'
    },
    statistikTab: {
        sectionTitles: {
            deskriptiveStatistik: 'Deskriptive Statistik',
            diagnostischeGueteAS: 'Diagnostische Güte: Avocado Sign',
            diagnostischeGueteT2: 'Diagnostische Güte: T2-Kriterien (angewandt)',
            statistischerVergleichASvsT2: 'Statistischer Vergleich: AS vs. T2 (angewandt)',
            assoziationEinzelkriterien: 'Assoziation: Einzelmerkmale vs. N-Status',
            vergleichKollektive: 'Vergleich gewählter Kollektive',
            kriterienVergleichstabelle: 'Performance-Vergleich: AS vs. T2-Sets'
        },
        layoutToggleEinzel: 'Einzelansicht Aktivieren',
        layoutToggleVergleich: 'Vergleich Aktivieren',
        kollektiv1SelectLabel: 'Kollektiv 1:',
        kollektiv2SelectLabel: 'Kollektiv 2:'
    },
    praesentationTab: {
        viewSelect: {
            label: 'Ansicht wählen',
            asPurLabel: 'Avocado Sign (Performance)',
            asVsT2Label: 'AS vs. T2 (Vergleich)'
        },
        studySelect: {
            label: 'T2-Vergleichsbasis wählen'
        },
        t2BasisInfoCard: {
            title: "Informationen zur T2-Vergleichsbasis"
        },
        demographicsCard: {
            title: "Demographische Basisdaten (Avocado Sign Kollektiv)"
        },
        asPerformanceCard: {
            title: "Performance Avocado Sign (vs. N-Status)"
        },
        asVsT2PerformanceCard: {
            title: "Vergleich Performance: AS vs. T2-Basis"
        },
        asVsT2TestsCard: {
            title: "Statistische Tests: AS vs. T2-Basis"
        },
        asVsT2ChartCard: {
            title: "Diagramm: AS vs. T2-Basis"
        }
    },
    exportTab: {
        singleExports: 'Einzelexporte',
        exportPackages: 'Export-Pakete (.zip)'
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
    generalMessages: {
        noDataAvailable: "Keine Daten verfügbar.",
        loading: "Lade...",
        errorOccurred: "Ein Fehler ist aufgetreten."
    },
    kurzanleitung: {
        title: "Kurzanleitung & Wichtige Hinweise",
        content: `
            <p>Willkommen zum <strong>Lymphknoten T2 - Avocado Sign Analyse Tool v${APP_CONFIG.APP_VERSION}</strong>.</p>
            <p>Diese Anwendung dient der explorativen Analyse und dem wissenschaftlichen Vergleich der diagnostischen Leistung des "Avocado Signs" gegenüber T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status) bei Patienten mit Rektumkarzinom. Sie basiert auf einem Patientenkollektiv von 106 Fällen.</p>
            <h6>Allgemeine Bedienung:</h6>
            <ul>
                <li><strong>Kollektiv-Auswahl (Header):</strong> Wählen Sie hier das globale Patientenkollektiv (<strong>Gesamt</strong>, <strong>Direkt OP</strong>, <strong>nRCT</strong>). Diese Auswahl beeinflusst alle Analysen und Darstellungen in der gesamten Anwendung. Die Header-Meta-Statistiken (Anzahl Patienten, N+, AS+, T2+) aktualisieren sich entsprechend.</li>
                <li><strong>Tab-Navigation:</strong> Wechseln Sie über die Reiter zwischen den Hauptfunktionsbereichen der Anwendung.</li>
                <li><strong>Tooltips:</strong> Viele Bedienelemente und Ausgaben sind mit detaillierten Tooltips versehen, die bei Mausüberfahrung Erklärungen, Definitionen oder Interpretationshilfen bieten.</li>
                <li><strong>Statistische Signifikanz:</strong> In statistischen Tabellen werden p-Werte mit Symbolen für Signifikanzniveaus versehen: * p &lt; 0.05, ** p &lt; 0.01, *** p &lt; 0.001. Das zugrundeliegende Signifikanzniveau ist &alpha; = ${utils.formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, 2).replace('.', ',')}.</li>
            </ul>
        `
    },
    TOOLTIP_CONTENT: {
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
            statistik: "Bietet detaillierte statistische Analysen (Gütekriterien, Vergleiche, Assoziationen) für das global gewählte Kollektiv oder einen Vergleich zweier spezifisch wählbarer Kollektive. Alle Konfidenzintervalle (CI) sind 95%-CIs.",
            praesentation: "Stellt Analyseergebnisse in einem aufbereiteten, präsentationsfreundlichen Format dar, fokussiert auf den Vergleich des Avocado Signs mit T2-basierten Ansätzen (angewandt oder Literatur).",
            publikation: "Generiert Textvorschläge und Materialien für wissenschaftliche Publikationen, orientiert an den Vorgaben des Journals <strong>Radiology</strong>.",
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
            expandAll: { description: "Öffnet oder schließt die Detailansicht zu den T2-gewichteten Lymphknotenmerkmalen für alle Patienten in der aktuellen Tabellenansicht. Zeigt Größe, Form, Kontur, Homogenität und Signal für jeden LK." },
            collapseAll: { description: "Schließt die Detailansichten für alle Patienten." },
            expandRow: { description: "Klicken Sie hier oder auf den Pfeil-Button, um Details zu den morphologischen Eigenschaften der T2-gewichteten Lymphknoten dieses Patienten anzuzeigen/auszublenden. Nur verfügbar, wenn T2-LK-Daten vorhanden sind." }
        },
        auswertungTable: {
            nr: "Fortlaufende Nummer des Patienten.",
            name: "Nachname des Patienten (anonymisiert/kodiert).",
            therapie: "Angewandte Therapie vor der Operation.",
            n_as_t2: "Direkter Statusvergleich: N (Pathologie-Referenz), AS (Avocado Sign), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung.",
            n_counts: "Anzahl pathologisch positiver (N+) Lymphknoten / Gesamtzahl histopathologisch untersuchter Lymphknoten für diesen Patienten.",
            as_counts: "Anzahl als positiv bewerteter Avocado Sign (AS+) Lymphknoten / Gesamtzahl im T1KM-MRT sichtbarer Lymphknoten für diesen Patienten.",
            t2_counts: "Anzahl als positiv bewerteter T2-Lymphknoten (gemäß aktuell angewendeter Kriterien) / Gesamtzahl im T2-MRT sichtbarer Lymphknoten für diesen Patienten.",
            expandAll: { description: "Öffnet oder schließt die Detailansicht der bewerteten T2-gewichteten Lymphknoten und der erfüllten Kriterien für alle Patienten in der aktuellen Tabellenansicht." },
            collapseAll: { description: "Schließt die Detailansichten für alle Patienten." },
            expandRow: { description: "Klicken Sie hier oder auf den Pfeil-Button, um die detaillierte Bewertung der einzelnen T2-gewichteten Lymphknoten dieses Patienten gemäß der aktuell angewendeten Kriterien anzuzeigen/auszublenden. Erfüllte Positiv-Kriterien werden hervorgehoben." }
        },
        t2Logic: { description: `Logische Verknüpfung der aktiven T2-Kriterien: <strong>UND</strong> (Ein Lymphknoten ist nur positiv, wenn ALLE aktivierten Kriterien erfüllt sind). <strong>ODER</strong> (Ein Lymphknoten ist positiv, wenn MINDESTENS EIN aktiviertes Kriterium erfüllt ist). Die Wahl beeinflusst die Berechnung des T2-Status.` },
        t2Size: { description: `Größenkriterium (Kurzachse): Lymphknoten mit einem Durchmesser <strong>größer oder gleich (≥)</strong> dem eingestellten Schwellenwert gelten als suspekt. Einstellbarer Bereich: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} - ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm (Schritt: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step} mm). Aktivieren/Deaktivieren mit Checkbox.` },
        t2Form: { description: "Formkriterium: Wählen Sie, welche Form ('rund' oder 'oval') als suspekt gilt. Aktivieren/Deaktivieren mit Checkbox." },
        t2Kontur: { description: "Konturkriterium: Wählen Sie, welche Kontur ('scharf' berandet oder 'irregulär') als suspekt gilt. Aktivieren/Deaktivieren mit Checkbox." },
        t2Homogenitaet: { description: "Homogenitätskriterium: Wählen Sie, ob ein 'homogenes' oder 'heterogenes' Binnensignal auf T2w als suspekt gilt. Aktivieren/Deaktivieren mit Checkbox." },
        t2Signal: { description: "Signalkriterium: Wählen Sie, welche T2-Signalintensität ('signalarm', 'intermediär' oder 'signalreich') relativ zur umgebenden Muskulatur als suspekt gilt. Lymphknoten mit nicht beurteilbarem Signal (Wert 'null') erfüllen dieses Kriterium nie. Aktivieren/Deaktivieren mit Checkbox." },
        t2MetricsOverview: {
            cardTitle: "Kurzübersicht der diagnostischen Güte für die aktuell angewendeten und gespeicherten T2-Kriterien im Vergleich zum histopathologischen N-Status für das gewählte Kollektiv: <strong>[KOLLEKTIV]</strong>. Alle Konfidenzintervalle (CI) sind 95%-CIs."
        },
        bruteForceMetric: { description: "Wählen Sie die Zielmetrik, die die Brute-Force-Analyse maximieren soll. 'Balanced Accuracy' ist oft eine gute Wahl bei ungleichen Gruppengrößen." },
        bruteForceStart: { description: "Startet die Brute-Force-Analyse. Der Prozess testet tausende Kriterienkombinationen im Hintergrund und kann je nach System einige Zeit dauern." },
        statMetrics: {
            sens: { name: "Sensitivität", description: "Sensitivität ([METHODE] vs. N): Anteil der tatsächlich positiven Fälle (N+), die durch die Methode [METHODE] korrekt als positiv erkannt wurden.<br><i>Formel: RP / (RP + FN)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT_MIT_CI]</strong> der tatsächlich N+ Patienten korrekt im Kollektiv [KOLLEKTIV]."},
            spez: { name: "Spezifität", description: "Spezifität ([METHODE] vs. N): Anteil der tatsächlich negativen Fälle (N-), die durch die Methode [METHODE] korrekt als negativ erkannt wurden.<br><i>Formel: RN / (RN + FP)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT_MIT_CI]</strong> der tatsächlich N- Patienten korrekt im Kollektiv [KOLLEKTIV]."},
            ppv: { name: "Pos. Prädiktiver Wert (PPV)", description: "PPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem positiven Testergebnis durch Methode [METHODE] tatsächlich krank (N+) ist.<br><i>Formel: RP / (RP + FP)</i>", interpretation: "Wenn die Methode [METHODE] ein positives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N+ Status bei <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig."},
            npv: { name: "Neg. Prädiktiver Wert (NPV)", description: "NPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem negativen Testergebnis durch Methode [METHODE] tatsächlich gesund (N-) ist.<br><i>Formel: RN / (RN + FN)</i>", interpretation: "Wenn die Methode [METHODE] ein negatives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N- Status bei <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig."},
            acc: { name: "Accuracy (Gesamtgenauigkeit)", description: "Accuracy ([METHODE] vs. N): Anteil aller Fälle, die durch die Methode [METHODE] korrekt klassifiziert wurden.<br><i>Formel: (RP + RN) / Gesamtanzahl</i>", interpretation: "Die Methode [METHODE] klassifizierte insgesamt <strong>[WERT_MIT_CI]</strong> aller Patienten korrekt im Kollektiv [KOLLEKTIV]."},
            balAcc: { name: "Balanced Accuracy", description: "Balanced Accuracy ([METHODE] vs. N): Der Mittelwert aus Sensitivität und Spezifität. Sinnvoll bei ungleichen Gruppengrößen (Prävalenz).<br><i>Formel: (Sensitivität + Spezifität) / 2</i>", interpretation: "Die Balanced Accuracy der Methode [METHODE], die Sensitivität und Spezifität gleich gewichtet, betrug <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]."},
            f1: { name: "F1-Score", description: "F1-Score ([METHODE] vs. N): Das harmonische Mittel aus PPV (Precision) und Sensitivität (Recall). Ein Wert von 1 ist optimal.<br><i>Formel: 2 * (PPV * Sensitivität) / (PPV + Sensitivität)</i>", interpretation: "Der F1-Score für die Methode [METHODE], der Präzision und Sensitivität kombiniert, beträgt <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]."},
            auc: { name: "Area Under Curve (AUC)", description: "AUC ([METHODE] vs. N): Fläche unter der Receiver Operating Characteristic (ROC)-Kurve. Repräsentiert die Fähigkeit einer Methode, zwischen positiven und negativen Fällen zu unterscheiden. 0.5 entspricht Zufall, 1.0 perfekter Trennung.<br><i>Für binäre Tests (wie AS oder eine feste T2-Regel) ist AUC = Balanced Accuracy.</i>", interpretation: "Die AUC von <strong>[WERT_MIT_CI]</strong> deutet auf eine <strong>[BEWERTUNG]</strong> generelle Trennschärfe der Methode [METHODE] zwischen N+ und N- Fällen im Kollektiv [KOLLEKTIV] hin."},
            mcnemar: { name: "McNemar-Test", description: "Prüft auf einen signifikanten Unterschied in den diskordanten Paaren (Fälle, bei denen [METHODE1] und [METHODE2] unterschiedliche Ergebnisse liefern) bei gepaarten Daten.<br><i>Nullhypothese (H0): Keine systematische Differenz in den Fehlklassifikationen.</i>", interpretation: "Der McNemar-Test ergab einen p-Wert von [P_WERT]. Dies deutet darauf hin, dass sich die Fehlklassifizierungsraten von [METHODE1] und [METHODE2] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
            delong: { name: "DeLong-Test", description: "Vergleicht zwei AUC-Werte von ROC-Kurven, die auf denselben (gepaarten) Daten basieren.<br><i>Nullhypothese (H0): AUC([METHODE1]) = AUC([METHODE2]).</i>", interpretation: "Der DeLong-Test ergab einen p-Wert von [P_WERT]. Dies deutet darauf hin, dass sich die AUC-Werte von [METHODE1] und [METHODE2] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
            phi: { name: "Phi-Koeffizient (φ)", description: "Maß für die Stärke des Zusammenhangs zwischen zwei binären Variablen (z.B. Merkmal '[MERKMAL]' und N-Status).", interpretation: "Der Phi-Koeffizient von <strong>[WERT]</strong> deutet auf einen <strong>[BEWERTUNG]</strong> Zusammenhang zwischen '[MERKMAL]' und dem N-Status hin."},
            size_mwu: {name: "LK Größe MWU", description: "Vergleich der medianen Lymphknotengrößen zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test.", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von [P_WERT], was auf einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Lymphknotengrößen zwischen N+ und N- Patienten hindeutet."}
        },
        statistikTabTooltips: {
            deskriptiveStatistikCard: "Grundlegende demographische und klinische Charakteristika des ausgewählten Kollektivs <strong>[KOLLEKTIV]</strong>.",
            diagnostischeGueteASCard: "Detaillierte diagnostische Gütekriterien des Avocado Signs im Vergleich zum pathologischen N-Status für das Kollektiv <strong>[KOLLEKTIV]</strong>.",
            diagnostischeGueteT2Card: "Detaillierte diagnostische Gütekriterien der aktuell angewendeten T2-Kriterien im Vergleich zum pathologischen N-Status für das Kollektiv <strong>[KOLLEKTIV]</strong>.",
            statistischerVergleichASvsT2Card: "Statistische Tests zum direkten Vergleich der diagnostischen Leistung von Avocado Sign und den angewendeten T2-Kriterien im Kollektiv <strong>[KOLLEKTIV]</strong>.",
            assoziationEinzelkriterienCard: "Analyse des statistischen Zusammenhangs einzelner T2-Merkmale mit dem pathologischen N-Status im Kollektiv <strong>[KOLLEKTIV]</strong>.",
            kriterienVergleichstabelleCard: "Visueller Performance-Vergleich des Avocado Signs gegen verschiedene etablierte T2-Kriteriensets aus der Literatur für das Kollektiv <strong>[KOLLEKTIV]</strong>.",
            statistikToggleVergleich: "Schaltet zwischen der detaillierten Einzelansicht für das global gewählte Kollektiv und einer Vergleichsansicht zweier frei wählbarer Kollektive um."
        },
        praesentation: {
            downloadDemographicsMD: "Demographische Daten als Markdown-Tabelle herunterladen.",
            downloadPerformanceCSV: "Performance-Metriken als CSV-Datei herunterladen.",
            downloadPerformanceMD: "Performance-Metriken als Markdown-Tabelle herunterladen.",
            downloadCompChartPNG: "Diagramm als PNG-Bild herunterladen.",
            downloadCompChartSVG: "Diagramm als SVG-Vektorgrafik herunterladen.",
            'download-praes-t2-info-md': "Informationen zur T2-Basis als Markdown herunterladen.",
            downloadCompTableMD: "Vergleichstabelle als Markdown herunterladen.",
            downloadCompTestsMD: "Statistische Testergebnisse als Markdown herunterladen.",
            t2BasisInfoCard: "Zusammenfassung der für den Vergleich herangezogenen T2-Kriterien (Studien-Set, Beschreibung, angewandte Regeln).",
            demographicsCard: "Demographische Daten des für das Avocado Sign relevanten Kollektivs: <strong>[CURRENT_KOLLEKTIV_PRAES]</strong>.",
            asPerformanceCard: "Performance-Metriken für das Avocado Sign allein.",
            asVsT2PerformanceCard: "Gegenüberstellung der Performance-Metriken von Avocado Sign und der ausgewählten T2-Vergleichsbasis.",
            asVsT2TestsCard: "Statistische Signifikanztests für den Vergleich zwischen Avocado Sign und der T2-Basis.",
            asVsT2ChartCard: "Visueller Vergleich der wichtigsten Performance-Metriken (Sensitivität, Spezifität, AUC etc.) als Balkendiagramm."
        },
        publikationTabTooltips: {
            spracheSwitch: { description: "Schaltet die Sprache des generierten Manuskript-Textes zwischen Deutsch und Englisch um. Aktuell aktiv: <strong>[SPRACHE]</strong>." },
        },
        exportTab: {
            STATS_CSV: { description: "Exportiert die Haupt-Performance-Metriken (Sens, Spez, PPV, NPV, Acc, AUC etc.) für Avocado Sign und die angewandten T2-Kriterien als CSV-Tabelle für das Kollektiv <strong>[KOLLEKTIV]</strong>." },
            BRUTEFORCE_TXT: { description: "Exportiert die Top-Ergebnisse des letzten Brute-Force-Laufs für das Kollektiv <strong>[KOLLEKTIV]</strong> als Textdatei. Nur aktiv, wenn Ergebnisse vorliegen." },
            FILTERED_DATA_CSV: { description: "Exportiert die vollständigen Patientendaten (inklusive aller Lymphknoten-Details) des aktuell ausgewählten Kollektivs <strong>[KOLLEKTIV]</strong> als CSV-Datei." },
            COMPREHENSIVE_REPORT_HTML: { description: "Generiert einen druckbaren HTML-Bericht mit allen Tabellen, Diagrammen und Konfigurationen der aktuellen Analyse für das Kollektiv <strong>[KOLLEKTIV]</strong>." },
            ALL_ZIP: { description: "Erstellt ein ZIP-Archiv mit allen relevanten Einzelexporten (Statistik-CSV, Brute-Force-TXT, Rohdaten-CSV, Markdown-Tabellen etc.) für das Kollektiv <strong>[KOLLEKTIV]</strong>." },
            PNG_ZIP: { description: "Erstellt ein ZIP-Archiv mit allen aktuell sichtbaren Diagrammen als hochauflösende PNG-Bilder." },
            SVG_ZIP: { description: "Erstellt ein ZIP-Archiv mit allen aktuell sichtbaren Diagrammen als skalierbare SVG-Vektorgrafiken." },
            XLSX_ZIP: { description: "Exportiert eine einzelne Excel-Arbeitsmappe (.xlsx) mit mehreren Blättern: Konfiguration, Rohdaten, Auswertungsdaten und Statistik-Übersicht für das Kollektiv <strong>[KOLLEKTIV]</strong>." }
        },
        assoziationStaerkeTexte: {
            nicht_bestimmbar: "nicht bestimmbar",
            exzellent: "exzellent",
            gut: "gut",
            moderat: "moderat",
            schwach: "schwach",
            sehr_schwach: "sehr schwach",
            stark: "stark",
            nicht_informativ: "nicht informativ"
        },
        signifikanzTexte: {
            SIGNIFIKANT: "statistisch signifikant",
            NICHT_SIGNIFIKANT: "statistisch nicht signifikant"
        }
    }
};

deepFreeze(UI_TEXTS);
const TOOLTIP_CONTENT = UI_TEXTS.TOOLTIP_CONTENT;
