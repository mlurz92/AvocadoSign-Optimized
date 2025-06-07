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
                <li><strong>Statistische Signifikanz:</strong> In statistischen Tabellen werden p-Werte mit Symbolen für Signifikanzniveaus versehen: * p &lt; 0.05, ** p &lt; 0.01, *** p &lt; 0.001. Das zugrundeliegende Signifikanzniveau ist &alpha; = ${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,2).replace('.',',')}.</li>
            </ul>

            <h6>Wichtige Tabs und deren Funktionen:</h6>
            <ul>
                <li><strong>Daten:</strong>
                    <ul>
                        <li>Zeigt die detaillierten Patientendaten des aktuell ausgewählten Kollektivs in tabellarischer Form.</li>
                        <li>Spalten können durch Klick auf die Überschrift sortiert werden. Die Spalte "N | AS | T2" erlaubt eine Sub-Sortierung nach den Einzelkomponenten N, AS oder T2.</li>
                        <li>Für Patienten mit erfassten T2-Lymphknoten können Detailzeilen aufgeklappt werden, die die morphologischen Eigenschaften jedes einzelnen T2-Lymphknotens (Größe, Form, Kontur, Homogenität, Signal) visualisieren.</li>
                        <li>Ein Button "Alle Details Anzeigen/Ausblenden" erlaubt das globale Steuern dieser Detailansichten.</li>
                    </ul>
                </li>
                <li><strong>Auswertung:</strong>
                    <ul>
                        <li><strong>Dashboard:</strong> Bietet eine schnelle visuelle Übersicht über die demographische Verteilung (Alter, Geschlecht, Therapie, Status) des aktuellen Kollektivs in Form von Tortendiagrammen.</li>
                        <li><strong>T2-Kriterien Definition:</strong> Das Kernstück dieses Tabs.
                            <ul>
                                <li>Aktivieren/Deaktivieren Sie einzelne Kriterien (Größe, Form, Kontur, Homogenität, Signal) per Checkbox.</li>
                                <li>Stellen Sie den Schwellenwert für das Größenkriterium (Kurzachse, &ge;) per Slider oder Direkteingabe ein.</li>
                                <li>Wählen Sie für Form, Kontur, Homogenität und Signal den als suspekt geltenden Wert über Optionsbuttons.</li>
                                <li>Definieren Sie die logische Verknüpfung (UND/ODER) der aktiven Kriterien.</li>
                                <li><strong>Wichtig:</strong> Änderungen werden erst wirksam und in allen Tabs berücksichtigt, nachdem Sie auf <strong>"Anwenden & Speichern"</strong> geklickt haben. Ein Indikator am Kartenrand weist auf ungespeicherte Änderungen hin. Mit "Zurücksetzen" können die Kriterien auf den Default-Wert zurückgesetzt werden (Änderung muss ebenfalls angewendet werden).</li>
                            </ul>
                        </li>
                        <li><strong>T2 Metrik-Übersicht:</strong> Eine kompakte Leiste, die live die wichtigsten diagnostischen Gütekriterien (Sensitivität, Spezifität, PPV, NPV, etc. mit 95% CIs) für die **aktuell angewendeten** T2-Kriterien anzeigt.</li>
                        <li><strong>Brute-Force-Optimierung:</strong>
                            <ul>
                                <li>Ermöglicht die automatische Suche nach der T2-Kriterienkombination (inkl. Logik), die eine vom Nutzer gewählte Zielmetrik (z.B. Balanced Accuracy, F1-Score) maximiert.</li>
                                <li>Die Analyse läuft im Hintergrund (Web Worker) und zeigt Fortschritt sowie das aktuell beste Ergebnis an.</li>
                                <li>Nach Abschluss können die besten Kriterien direkt übernommen und angewendet werden. Ein Klick auf "Top 10" öffnet ein Modal mit den besten Ergebnissen und einer Exportoption für den Bericht.</li>
                            </ul>
                        </li>
                        <li><strong>Auswertungstabelle:</strong> Listet Patienten mit ihrem N-, AS- und (gemäß aktuell angewendeten Kriterien berechneten) T2-Status sowie den jeweiligen Lymphknotenzahlen auf. Detailzeilen zeigen die Bewertung jedes T2-Lymphknotens anhand der aktuellen Kriteriendefinition, wobei erfüllte, zur Positiv-Bewertung beitragende Merkmale hervorgehoben werden.</li>
                    </ul>
                </li>
                <li><strong>Statistik:</strong>
                    <ul>
                        <li>Bietet umfassende statistische Auswertungen, immer basierend auf den aktuell *angewendeten* T2-Kriterien.</li>
                        <li>Über den Button "Vergleich Aktiv" kann zwischen einer Einzelansicht (für das global gewählte Kollektiv) und einer Vergleichsansicht zweier spezifisch wählbarer Kollektive umgeschaltet werden.</li>
                        <li>Angezeigt werden deskriptive Statistiken, detaillierte diagnostische Gütekriterien (für AS vs. N und T2 vs. N) inklusive Konfidenzintervallen, statistische Vergleichstests (AS vs. T2; ggf. Kollektiv A vs. B) und Assoziationsanalysen.</li>
                        <li>Eine **Kriterienvergleichstabelle** am Ende des Tabs vergleicht die Performance von AS, den angewandten T2-Kriterien und definierten Literatur-Sets für das global gewählte Kollektiv.</li>
                    </ul>
                </li>
                <li><strong>Präsentation:</strong>
                    <ul>
                        <li>Bereitet Ergebnisse in einem für Präsentationen optimierten Format auf.</li>
                        <li>Zwei Ansichten wählbar: Fokus rein auf "Avocado Sign (Performance)" oder "AS vs. T2 (Vergleich)".</li>
                        <li>Im Vergleichsmodus kann eine T2-Basis aus den angewandten Kriterien oder Literatur-Sets gewählt werden. Das globale Kollektiv passt sich ggf. dem Zielkollektiv der Studie an.</li>
                        <li>Enthält Info-Karten, Vergleichstabellen, statistische Tests und Diagramme.</li>
                    </ul>
                </li>
                <li><strong>Publikation:</strong>
                    <ul>
                        <li>Generiert automatisch Textvorschläge in Deutsch oder Englisch für verschiedene Abschnitte einer wissenschaftlichen Publikation (Abstract, Einleitung, Methoden, Ergebnisse, Diskussion, Tabellen, Abbildungen, Referenzen).</li>
                        <li>Integriert dynamisch aktuelle Daten, Statistiken (basierend auf angewandten T2-Kriterien und ausgewählter BF-Zielmetrik für Teile der Ergebnisdarstellung) und Konfigurationen.</li>
                        <li>Enthält ebenfalls direkt im Text eingebettete Tabellen und Diagramme. Die Formatierung orientiert sich an den Vorgaben des Journals <strong>Radiology</strong>.</li>
                    </ul>
                </li>
                <li><strong>Export:</strong>
                    <ul>
                        <li>Ermöglicht den Download von Rohdaten, Analyseergebnissen, Tabellen und Diagrammen.</li>
                        <li>Formate: CSV, Markdown (MD), Text (TXT), HTML, PNG, SVG.</li>
                        <li>Bietet Einzelexporte sowie thematisch gebündelte ZIP-Pakete.</li>
                        <li>Alle Exporte basieren auf dem global gewählten Kollektiv und den zuletzt *angewendeten* T2-Kriterien.</li>
                    </ul>
                </li>
            </ul>
             <h6>Referenzstandard und Wichtiger Hinweis:</h6>
            <p class="small">Der histopathologische N-Status aus dem Operationspräparat dient in allen Analysen als Referenzstandard. Diese Anwendung ist ein Forschungswerkzeug und ausdrücklich <strong>nicht</strong> für die klinische Diagnostik oder Therapieentscheidungen im Einzelfall vorgesehen. Alle Ergebnisse sind im Kontext der Studienlimitationen (retrospektiv, monozentrisch, spezifisches Kollektiv) zu interpretieren.</p>
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
        t2CriteriaCard: { unsavedIndicator: "<strong>Achtung:</strong> Es gibt nicht angewendete Änderungen an den T2-Kriterien oder der Logik. Klicken Sie auf 'Anwenden & Speichern', um die Ergebnisse zu aktualisieren und die Einstellung zu speichern." },
        t2MetricsOverview: {
            cardTitle: "Kurzübersicht der diagnostischen Güte für die aktuell angewendeten und gespeicherten T2-Kriterien im Vergleich zum histopathologischen N-Status für das gewählte Kollektiv: <strong>[KOLLEKTIV]</strong>. Alle Konfidenzintervalle (CI) sind 95%-CIs.",
            sens: "Sensitivität (T2 vs. N): Anteil der N+ Fälle, die von den T2-Kriterien korrekt als positiv erkannt wurden.<br><i>Formel: RP / (RP + FN)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT_MIT_CI]</strong> der tatsächlich N+ Patienten korrekt im Kollektiv [KOLLEKTIV]."},
            spez: "Spezifität (T2 vs. N): Anteil der N- Fälle, die von den T2-Kriterien korrekt als negativ erkannt wurden.<br><i>Formel: RN / (RN + FP)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT_MIT_CI]</strong> der tatsächlich N- Patienten korrekt im Kollektiv [KOLLEKTIV]."},
            ppv: "Positiver Prädiktiver Wert (PPV, T2 vs. N): Wahrscheinlichkeit, dass ein T2+ Fall tatsächlich N+ ist.<br><i>Formel: RP / (RP + FP)</i>", interpretation: "Wenn die Methode [METHODE] ein positives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N+ Status bei <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig."},
            npv: "Negativer Prädiktiver Wert (NPV, T2 vs. N): Wahrscheinlichkeit, dass ein T2- Fall tatsächlich N- ist.<br><i>Formel: RN / (RN + FN)</i>", interpretation: "Wenn die Methode [METHODE] ein negatives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N- Status bei <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig."},
            acc: "Accuracy (Gesamtgenauigkeit)", description: "Accuracy ([METHODE] vs. N): Anteil aller Fälle, die durch die Methode [METHODE] korrekt klassifiziert wurden.<br><i>Formel: (RP + RN) / Gesamtanzahl</i>", interpretation: "Die Methode [METHODE] klassifizierte insgesamt <strong>[WERT_MIT_CI]</strong> aller Patienten korrekt im Kollektiv [KOLLEKTIV]."},
            balAcc: { name: "Balanced Accuracy", description: "Balanced Accuracy ([METHODE] vs. N): Der Mittelwert aus Sensitivität und Spezifität. Sinnvoll bei ungleichen Gruppengrößen (Prävalenz).<br><i>Formel: (Sensitivität + Spezifität) / 2</i>", interpretation: "Die Balanced Accuracy der Methode [METHODE], die Sensitivität und Spezifität gleich gewichtet, betrug <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]."},
            f1: { name: "F1-Score", description: "F1-Score ([METHODE] vs. N): Das harmonische Mittel aus PPV (Precision) und Sensitivität (Recall). Ein Wert von 1 ist optimal.<br><i>Formel: 2 * (PPV * Sensitivität) / (PPV + Sensitivität)</i>", interpretation: "Der F1-Score für die Methode [METHODE], der Präzision und Sensitivität kombiniert, beträgt <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]."},
            auc: { name: "Area Under Curve (AUC)", description: "AUC ([METHODE] vs. N): Fläche unter der Receiver Operating Characteristic (ROC)-Kurve. Repräsentiert die Fähigkeit einer Methode, zwischen positiven und negativen Fällen zu unterscheiden. 0.5 entspricht Zufall, 1.0 perfekter Trennung.<br><i>Für binäre Tests (wie AS oder eine feste T2-Regel) ist AUC = Balanced Accuracy.</i>", interpretation: "Die AUC von <strong>[WERT_MIT_CI]</strong> deutet auf eine <strong>[BEWERTUNG]</strong> generelle Trennschärfe der Methode [METHODE] zwischen N+ und N- Fällen im Kollektiv [KOLLEKTIV] hin."},
            mcnemar: { name: "McNemar-Test", description: "Prüft auf einen signifikanten Unterschied in den diskordanten Paaren (Fälle, bei denen AS und [METHODE2] unterschiedliche Ergebnisse liefern) bei gepaarten Daten (d.h. beide Tests am selben Patienten).<br><i>Nullhypothese (H0): Anzahl(AS+ / [METHODE2]-) = Anzahl(AS- / [METHODE2]+). Ein kleiner p-Wert spricht gegen H0.</i>", interpretation: "Der McNemar-Test ergab einen p-Wert von [P_WERT] [SIGNIFIKANZ_TEXT]. Dies deutet darauf hin, dass sich die Fehlklassifizierungsraten (diskordante Paare) von AS und [METHODE2] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
            delong: { name: "DeLong-Test", description: "Vergleicht zwei AUC-Werte von ROC-Kurven, die auf denselben (gepaarten) Daten basieren, unter Berücksichtigung der Kovarianz.<br><i>Nullhypothese (H0): AUC(AS) = AUC([METHODE2]). Ein kleiner p-Wert spricht gegen H0.</i>", interpretation: "Der DeLong-Test ergab einen p-Wert von [P_WERT] [SIGNIFIKANZ_TEXT]. Dies deutet darauf hin, dass sich die AUC-Werte (bzw. Balanced Accuracies) von AS und [METHODE2] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
            phi: { name: "Phi-Koeffizient (φ)", description: "Maß für die Stärke und Richtung des Zusammenhangs zwischen zwei binären Variablen (z.B. Vorhandensein von Merkmal '[MERKMAL]' und N-Status). Wertebereich von -1 bis +1. 0 bedeutet kein Zusammenhang.", interpretation: "Der Phi-Koeffizient von <strong>[WERT]</strong> deutet auf einen <strong>[BEWERTUNG]</strong> Zusammenhang zwischen dem Merkmal '[MERKMAL]' und dem N-Status im Kollektiv [KOLLEKTIV] hin."},
            rd: { name: "Risk Difference (RD)", description: "Absolute Differenz in der Wahrscheinlichkeit (Risiko) für N+ zwischen Patienten mit und ohne das Merkmal '[MERKMAL]'. RD = P(N+|Merkmal+) - P(N+|Merkmal-). Ein RD von 0 bedeutet kein Unterschied.", interpretation: "Das Risiko für einen N+ Status war bei Patienten mit dem Merkmal '[MERKMAL]' um <strong>[WERT]%</strong> absolut [HOEHER_NIEDRIGER] als bei Patienten ohne dieses Merkmal im Kollektiv [KOLLEKTIV]."},
            or: { name: "Odds Ratio (OR)", description: "Quotient der Odds für N+ bei Vorhandensein vs. Abwesenheit des Merkmals '[MERKMAL]'. OR = Odds(N+|Merkmal+) / Odds(N+|Merkmal-).<br>OR > 1: Erhöhte Odds für N+ bei Vorhandensein des Merkmals.<br>OR < 1: Verringerte Odds.<br>OR = 1: Keine Assoziation.", interpretation: "Die Chance (Odds) für einen N+ Status war bei Patienten mit dem Merkmal '[MERKMAL]' um den Faktor <strong>[WERT]</strong> [FAKTOR_TEXT] im Vergleich zu Patienten ohne dieses Merkmal (p=[P_WERT], [SIGNIFIKANZ]) im Kollektiv [KOLLEKTIV]."},
            fisher: { name: "Fisher's Exact Test", description: "Exakter Test zur Prüfung auf einen signifikanten Zusammenhang zwischen zwei kategorialen Variablen (z.B. Merkmal '[MERKMAL]' vs. N-Status). Geeignet auch für kleine Stichproben/geringe erwartete Häufigkeiten.<br><i>Nullhypothese (H0): Kein Zusammenhang.</i>", interpretation: "Der exakte Test nach Fisher ergab einen p-Wert von [P_WERT] [SIGNIFIKANZ_TEXT], was auf einen [SIGNIFIKANZ_TEXT] Zusammenhang zwischen dem Merkmal '[MERKMAL]' und dem N-Status im Kollektiv [KOLLEKTIV] hindeutet."},
            mannwhitney: { name: "Mann-Whitney-U-Test", description: "Nichtparametrischer Test zum Vergleich der zentralen Tendenz (Median) einer kontinuierlichen Variablen (z.B. '[VARIABLE]') zwischen zwei unabhängigen Gruppen (z.B. N+ vs. N-).<br><i>Nullhypothese (H0): Kein Unterschied in den Medianen/Verteilungen.</i>", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von [P_WERT] [SIGNIFIKANZ_TEXT]. Dies zeigt einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Variable '[VARIABLE]' zwischen N+ und N- Patienten im Kollektiv [KOLLEKTIV]."},
            ci95: { name: "95% Konfidenzintervall (CI)", description: "Der Wertebereich, der den wahren (unbekannten) Populationsparameter der Metrik mit 95%iger Wahrscheinlichkeit überdeckt.<br><i>Methode: [METHOD_CI]</i>", interpretation: "Basierend auf den Daten liegt der wahre Wert der Metrik mit 95%iger Sicherheit zwischen [LOWER] und [UPPER]."},
            konfusionsmatrix: { description: "Kreuztabelle, die die Klassifikationsergebnisse der Methode [METHODE] mit dem tatsächlichen N-Status vergleicht: Richtig Positive (RP), Falsch Positive (FP), Falsch Negative (FN), Richtig Negative (RN)." },
            accComp: { name: "Accuracy Vergleich (ungepaart)", description: "Vergleicht die Accuracy der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels Fisher's Exact Test.<br><i>Nullhypothese (H0): Accuracy in Kollektiv1 = Accuracy in Kollektiv2.</i>", interpretation: "Der Unterschied in der Accuracy der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
            aucComp: { name: "AUC Vergleich (ungepaart)", description: "Vergleicht die AUC der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels eines Z-Tests basierend auf den Standardfehlern der AUCs.<br><i>Nullhypothese (H0): AUC in Kollektiv1 = AUC in Kollektiv2.</i>", interpretation: "Der Unterschied in der AUC der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
            defaultP: { interpretation: `Der berechnete p-Wert beträgt <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Bei einem Signifikanzniveau von ${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,2).replace('.',',')} ist das Ergebnis <strong>[SIGNIFIKANZ_TEXT]</strong>.` },
            size_mwu: {name: "LK Größe MWU", description: "Vergleich der medianen Lymphknotengrößen zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test. Hier werden alle Lymphknoten der Patienten berücksichtigt, nicht Patienten-Level-Status.", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von [P_WERT] [SIGNIFIKANZ_TEXT]. Dies zeigt einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Lymphknotengrößen zwischen den Lymphknoten von N+ und N- Patienten im Kollektiv [KOLLEKTIV]."}
        },
        statMetrics: {
            // Updated interpretation for all basic metrics to include [WERT_MIT_CI] placeholder explicitly
            sens: { name: "Sensitivität", description: "Sensitivität ([METHODE] vs. N): Anteil der tatsächlich positiven Fälle (N+), die durch die Methode [METHODE] korrekt als positiv erkannt wurden.<br><i>Formel: RP / (RP + FN)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT_MIT_CI]</strong> der tatsächlich N+ Patienten korrekt im Kollektiv [KOLLEKTIV]."},
            spez: { name: "Spezifität", description: "Spezifität ([METHODE] vs. N): Anteil der tatsächlich negativen Fälle (N-), die durch die Methode [METHODE] korrekt als negativ erkannt wurden.<br><i>Formel: RN / (RN + FP)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT_MIT_CI]</strong> der tatsächlich N- Patienten korrekt im Kollektiv [KOLLEKTIV]."},
            ppv: { name: "Pos. Prädiktiver Wert (PPV)", description: "PPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem positiven Testergebnis durch Methode [METHODE] tatsächlich krank (N+) ist.<br><i>Formel: RP / (RP + FP)</i>", interpretation: "Wenn die Methode [METHODE] ein positives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N+ Status bei <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig."},
            npv: { name: "Neg. Prädiktiver Wert (NPV)", description: "NPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem negativen Testergebnis durch Methode [METHODE] tatsächlich gesund (N-) ist.<br><i>Formel: RN / (RN + FN)</i>", interpretation: "Wenn die Methode [METHODE] ein negatives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N- Status bei <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig."},
            acc: { name: "Accuracy (Gesamtgenauigkeit)", description: "Accuracy ([METHODE] vs. N): Anteil aller Fälle, die durch die Methode [METHODE] korrekt klassifiziert wurden.<br><i>Formel: (RP + RN) / Gesamtanzahl</i>", interpretation: "Die Methode [METHODE] klassifizierte insgesamt <strong>[WERT_MIT_CI]</strong> aller Patienten korrekt im Kollektiv [KOLLEKTIV]."},
            balAcc: { name: "Balanced Accuracy", description: "Balanced Accuracy ([METHODE] vs. N): Der Mittelwert aus Sensitivität und Spezifität. Sinnvoll bei ungleichen Gruppengrößen (Prävalenz).<br><i>Formel: (Sensitivität + Spezifität) / 2</i>", interpretation: "Die Balanced Accuracy der Methode [METHODE], die Sensitivität und Spezifität gleich gewichtet, betrug <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]."},
            f1: { name: "F1-Score", description: "F1-Score ([METHODE] vs. N): Das harmonische Mittel aus PPV (Precision) und Sensitivität (Recall). Ein Wert von 1 ist optimal.<br><i>Formel: 2 * (PPV * Sensitivität) / (PPV + Sensitivität)</i>", interpretation: "Der F1-Score für die Methode [METHODE], der Präzision und Sensitivität kombiniert, beträgt <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]."},
            auc: { name: "Area Under Curve (AUC)", description: "AUC ([METHODE] vs. N): Fläche unter der Receiver Operating Characteristic (ROC)-Kurve. Repräsentiert die Fähigkeit einer Methode, zwischen positiven und negativen Fällen zu unterscheiden. 0.5 entspricht Zufall, 1.0 perfekter Trennung.<br><i>Für binäre Tests (wie AS oder eine feste T2-Regel) ist AUC = Balanced Accuracy.</i>", interpretation: "Die AUC von <strong>[WERT_MIT_CI]</strong> deutet auf eine <strong>[BEWERTUNG]</strong> generelle Trennschärfe der Methode [METHODE] zwischen N+ und N- Fällen im Kollektiv [KOLLEKTIV] hin."},

            // Comparison Tests
            mcnemar: { name: "McNemar-Test", description: "Prüft auf einen signifikanten Unterschied in den diskordanten Paaren (Fälle, bei denen AS und [METHODE2] unterschiedliche Ergebnisse liefern) bei gepaarten Daten (d.h. beide Tests am selben Patienten).<br><i>Nullhypothese (H0): Anzahl(AS+ / [METHODE2]-) = Anzahl(AS- / [METHODE2]+). Ein kleiner p-Wert spricht gegen H0.</i>", interpretation: "Der McNemar-Test ergab einen p-Wert von [P_WERT] [SIGNIFIKANZ_TEXT]. Dies deutet darauf hin, dass sich die Fehlklassifizierungsraten (diskordante Paare) von AS und [METHODE2] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
            delong: { name: "DeLong-Test", description: "Vergleicht zwei AUC-Werte von ROC-Kurven, die auf denselben (gepaarten) Daten basieren, unter Berücksichtigung der Kovarianz.<br><i>Nullhypothese (H0): AUC(AS) = AUC([METHODE2]). Ein kleiner p-Wert spricht gegen H0.</i>", interpretation: "Der DeLong-Test ergab einen p-Wert von [P_WERT] [SIGNIFIKANZ_TEXT]. Dies deutet darauf hin, dass sich die AUC-Werte (bzw. Balanced Accuracies) von AS und [METHODE2] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
            
            // Association Metrics
            phi: { name: "Phi-Koeffizient (φ)", description: "Maß für die Stärke und Richtung des Zusammenhangs zwischen zwei binären Variablen (z.B. Vorhandensein von Merkmal '[MERKMAL]' und N-Status). Wertebereich von -1 bis +1. 0 bedeutet kein Zusammenhang.", interpretation: "Der Phi-Koeffizient von <strong>[WERT]</strong> deutet auf einen <strong>[BEWERTUNG]</strong> Zusammenhang zwischen dem Merkmal '[MERKMAL]' und dem N-Status im Kollektiv [KOLLEKTIV] hin."},
            rd: { name: "Risk Difference (RD)", description: "Absolute Differenz in der Wahrscheinlichkeit (Risiko) für N+ zwischen Patienten mit und ohne das Merkmal '[MERKMAL]'. RD = P(N+|Merkmal+) - P(N+|Merkmal-). Ein RD von 0 bedeutet kein Unterschied.", interpretation: "Das Risiko für einen N+ Status war bei Patienten mit dem Merkmal '[MERKMAL]' um <strong>[WERT]%</strong> absolut [HOEHER_NIEDRIGER] als bei Patienten ohne dieses Merkmal im Kollektiv [KOLLEKTIV]."},
            or: { name: "Odds Ratio (OR)", description: "Quotient der Odds für N+ bei Vorhandensein vs. Abwesenheit des Merkmals '[MERKMAL]'. OR = Odds(N+|Merkmal+) / Odds(N+|Merkmal-).<br>OR > 1: Erhöhte Odds für N+ bei Vorhandensein des Merkmals.<br>OR < 1: Verringerte Odds.<br>OR = 1: Keine Assoziation.", interpretation: "Die Chance (Odds) für einen N+ Status war bei Patienten mit dem Merkmal '[MERKMAL]' um den Faktor <strong>[WERT]</strong> [FAKTOR_TEXT] im Vergleich zu Patienten ohne dieses Merkmal (p=[P_WERT], [SIGNIFIKANZ]) im Kollektiv [KOLLEKTIV]."},
            fisher: { name: "Fisher's Exact Test", description: "Exakter Test zur Prüfung auf einen signifikanten Zusammenhang zwischen zwei kategorialen Variablen (z.B. Merkmal '[MERKMAL]' vs. N-Status). Geeignet auch für kleine Stichproben/geringe erwartete Häufigkeiten.<br><i>Nullhypothese (H0): Kein Zusammenhang.</i>", interpretation: "Der exakte Test nach Fisher ergab einen p-Wert von [P_WERT] [SIGNIFIKANZ_TEXT], was auf einen [SIGNIFIKANZ_TEXT] Zusammenhang zwischen dem Merkmal '[MERKMAL]' und dem N-Status im Kollektiv [KOLLEKTIV] hindeutet."},
            mannwhitney: { name: "Mann-Whitney-U-Test", description: "Nichtparametrischer Test zum Vergleich der zentralen Tendenz (Median) einer kontinuierlichen Variablen (z.B. '[VARIABLE]') zwischen zwei unabhängigen Gruppen (z.B. N+ vs. N-).<br><i>Nullhypothese (H0): Kein Unterschied in den Medianen/Verteilungen.</i>", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von [P_WERT] [SIGNIFIKANZ_TEXT]. Dies zeigt einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Variable '[VARIABLE]' zwischen N+ und N- Patienten im Kollektiv [KOLLEKTIV]."},
            
            // General
            ci95: { name: "95% Konfidenzintervall (CI)", description: "Der Wertebereich, der den wahren (unbekannten) Populationsparameter der Metrik mit 95%iger Wahrscheinlichkeit überdeckt.<br><i>Methode: [METHOD_CI]</i>", interpretation: "Basierend auf den Daten liegt der wahre Wert der Metrik mit 95%iger Sicherheit zwischen [LOWER] und [UPPER]."},
            konfusionsmatrix: { description: "Kreuztabelle, die die Klassifikationsergebnisse der Methode [METHODE] mit dem tatsächlichen N-Status vergleicht: Richtig Positive (RP), Falsch Positive (FP), Falsch Negative (FN), Richtig Negative (RN)." },
            accComp: { name: "Accuracy Vergleich (ungepaart)", description: "Vergleicht die Accuracy der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels Fisher's Exact Test.<br><i>Nullhypothese (H0): Accuracy in Kollektiv1 = Accuracy in Kollektiv2.</i>", interpretation: "Der Unterschied in der Accuracy der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
            aucComp: { name: "AUC Vergleich (ungepaart)", description: "Vergleicht die AUC der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels eines Z-Tests basierend auf den Standardfehlern der AUCs.<br><i>Nullhypothese (H0): AUC in Kollektiv1 = AUC in Kollektiv2.</i>", interpretation: "Der Unterschied in der AUC der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
            defaultP: { interpretation: `Der berechnete p-Wert beträgt <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Bei einem Signifikanzniveau von ${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,2).replace('.',',')} ist das Ergebnis <strong>[SIGNIFIKANZ_TEXT]</strong>.` },
            size_mwu: {name: "LK Größe MWU", description: "Vergleich der medianen Lymphknotengrößen zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test. Hier werden alle Lymphknoten der Patienten berücksichtigt, nicht Patienten-Level-Status.", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von [P_WERT] [SIGNIFIKANZ_TEXT]. Dies zeigt einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Lymphknotengrößen zwischen den Lymphknoten von N+ und N- Patienten im Kollektiv [KOLLEKTIV]."}
        },
        statMetrics: { // Hier werden die neuen Texte und Interpretationen hinzugefügt oder bestehende angepasst
            sens: { name: "Sensitivität", description: "Sensitivität ([METHODE] vs. N): Anteil der tatsächlich positiven Fälle (N+), die durch die Methode [METHODE] korrekt als positiv erkannt wurden.<br><i>Formel: RP / (RP + FN)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT_MIT_CI]</strong> der tatsächlich N+ Patienten korrekt im Kollektiv [KOLLEKTIV]."},
            spez: { name: "Spezifität", description: "Spezifität ([METHODE] vs. N): Anteil der tatsächlich negativen Fälle (N-), die durch die Methode [METHODE] korrekt als negativ erkannt wurden.<br><i>Formel: RN / (RN + FP)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT_MIT_CI]</strong> der tatsächlich N- Patienten korrekt im Kollektiv [KOLLEKTIV]."},
            ppv: { name: "Pos. Prädiktiver Wert (PPV)", description: "PPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem positiven Testergebnis durch Methode [METHODE] tatsächlich krank (N+) ist.<br><i>Formel: RP / (RP + FP)</i>", interpretation: "Wenn die Methode [METHODE] ein positives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N+ Status bei <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig."},
            npv: { name: "Neg. Prädiktiver Wert (NPV)", description: "NPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem negativen Testergebnis durch Methode [METHODE] tatsächlich gesund (N-) ist.<br><i>Formel: RN / (RN + FN)</i>", interpretation: "Wenn die Methode [METHODE] ein negatives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N- Status bei <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]. Dieser Wert ist stark prävalenzabhängig."},
            acc: { name: "Accuracy (Gesamtgenauigkeit)", description: "Accuracy ([METHODE] vs. N): Anteil aller Fälle, die durch die Methode [METHODE] korrekt klassifiziert wurden.<br><i>Formel: (RP + RN) / Gesamtanzahl</i>", interpretation: "Die Methode [METHODE] klassifizierte insgesamt <strong>[WERT_MIT_CI]</strong> aller Patienten korrekt im Kollektiv [KOLLEKTIV]."},
            balAcc: { name: "Balanced Accuracy", description: "Balanced Accuracy ([METHODE] vs. N): Der Mittelwert aus Sensitivität und Spezifität. Sinnvoll bei ungleichen Gruppengrößen (Prävalenz).<br><i>Formel: (Sensitivität + Spezifität) / 2</i>", interpretation: "Die Balanced Accuracy der Methode [METHODE], die Sensitivität und Spezifität gleich gewichtet, betrug <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]."},
            f1: { name: "F1-Score", description: "F1-Score ([METHODE] vs. N): Das harmonische Mittel aus PPV (Precision) und Sensitivität (Recall). Ein Wert von 1 ist optimal.<br><i>Formel: 2 * (PPV * Sensitivität) / (PPV + Sensitivität)</i>", interpretation: "Der F1-Score für die Methode [METHODE], der Präzision und Sensitivität kombiniert, beträgt <strong>[WERT_MIT_CI]</strong> im Kollektiv [KOLLEKTIV]."},
            auc: { name: "Area Under Curve (AUC)", description: "AUC ([METHODE] vs. N): Fläche unter der Receiver Operating Characteristic (ROC)-Kurve. Repräsentiert die Fähigkeit einer Methode, zwischen positiven und negativen Fällen zu unterscheiden. 0.5 entspricht Zufall, 1.0 perfekter Trennung.<br><i>Für binäre Tests (wie AS oder eine feste T2-Regel) ist AUC = Balanced Accuracy.</i>", interpretation: "Die AUC von <strong>[WERT_MIT_CI]</strong> deutet auf eine <strong>[BEWERTUNG]</strong> generelle Trennschärfe der Methode [METHODE] zwischen N+ und N- Fällen im Kollektiv [KOLLEKTIV] hin."},

            // Comparison Tests
            mcnemar: { name: "McNemar-Test", description: "Prüft auf einen signifikanten Unterschied in den diskordanten Paaren (Fälle, bei denen AS und [METHODE2] unterschiedliche Ergebnisse liefern) bei gepaarten Daten (d.h. beide Tests am selben Patienten).<br><i>Nullhypothese (H0): Anzahl(AS+ / [METHODE2]-) = Anzahl(AS- / [METHODE2]+). Ein kleiner p-Wert spricht gegen H0.</i>", interpretation: "Der McNemar-Test ergab einen p-Wert von [P_WERT] [SIGNIFIKANZ_TEXT]. Dies deutet darauf hin, dass sich die Fehlklassifizierungsraten (diskordante Paare) von AS und [METHODE2] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
            delong: { name: "DeLong-Test", description: "Vergleicht zwei AUC-Werte von ROC-Kurven, die auf denselben (gepaarten) Daten basieren, unter Berücksichtigung der Kovarianz.<br><i>Nullhypothese (H0): AUC(AS) = AUC([METHODE2]). Ein kleiner p-Wert spricht gegen H0.</i>", interpretation: "Der DeLong-Test ergab einen p-Wert von [P_WERT] [SIGNIFIKANZ_TEXT]. Dies deutet darauf hin, dass sich die AUC-Werte (bzw. Balanced Accuracies) von AS und [METHODE2] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
            
            // Association Metrics
            phi: { name: "Phi-Koeffizient (φ)", description: "Maß für die Stärke und Richtung des Zusammenhangs zwischen zwei binären Variablen (z.B. Vorhandensein von Merkmal '[MERKMAL]' und N-Status). Wertebereich von -1 bis +1. 0 bedeutet kein Zusammenhang.", interpretation: "Der Phi-Koeffizient von <strong>[WERT]</strong> deutet auf einen <strong>[BEWERTUNG]</strong> Zusammenhang zwischen dem Merkmal '[MERKMAL]' und dem N-Status im Kollektiv [KOLLEKTIV] hin."},
            rd: { name: "Risk Difference (RD)", description: "Absolute Differenz in der Wahrscheinlichkeit (Risiko) für N+ zwischen Patienten mit und ohne das Merkmal '[MERKMAL]'. RD = P(N+|Merkmal+) - P(N+|Merkmal-). Ein RD von 0 bedeutet kein Unterschied.", interpretation: "Das Risiko für einen N+ Status war bei Patienten mit dem Merkmal '[MERKMAL]' um <strong>[WERT]%</strong> absolut [HOEHER_NIEDRIGER] als bei Patienten ohne dieses Merkmal im Kollektiv [KOLLEKTIV]."},
            or: { name: "Odds Ratio (OR)", description: "Quotient der Odds für N+ bei Vorhandensein vs. Abwesenheit des Merkmals '[MERKMAL]'. OR = Odds(N+|Merkmal+) / Odds(N+|Merkmal-).<br>OR > 1: Erhöhte Odds für N+ bei Vorhandensein des Merkmals.<br>OR < 1: Verringerte Odds.<br>OR = 1: Keine Assoziation.", interpretation: "Die Chance (Odds) für einen N+ Status war bei Patienten mit dem Merkmal '[MERKMAL]' um den Faktor <strong>[WERT]</strong> [FAKTOR_TEXT] im Vergleich zu Patienten ohne dieses Merkmal (p=[P_WERT], [SIGNIFIKANZ]) im Kollektiv [KOLLEKTIV]."},
            fisher: { name: "Fisher's Exact Test", description: "Exakter Test zur Prüfung auf einen signifikanten Zusammenhang zwischen zwei kategorialen Variablen (z.B. Merkmal '[MERKMAL]' vs. N-Status). Geeignet auch für kleine Stichproben/geringe erwartete Häufigkeiten.<br><i>Nullhypothese (H0): Kein Zusammenhang.</i>", interpretation: "Der exakte Test nach Fisher ergab einen p-Wert von [P_WERT] [SIGNIFIKANZ_TEXT], was auf einen [SIGNIFIKANZ_TEXT] Zusammenhang zwischen dem Merkmal '[MERKMAL]' und dem N-Status im Kollektiv [KOLLEKTIV] hindeutet."},
            mannwhitney: { name: "Mann-Whitney-U-Test", description: "Nichtparametrischer Test zum Vergleich der zentralen Tendenz (Median) einer kontinuierlichen Variablen (z.B. '[VARIABLE]') zwischen zwei unabhängigen Gruppen (z.B. N+ vs. N-).<br><i>Nullhypothese (H0): Kein Unterschied in den Medianen/Verteilungen.</i>", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von [P_WERT] [SIGNIFIKANZ_TEXT]. Dies zeigt einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Variable '[VARIABLE]' zwischen N+ und N- Patienten im Kollektiv [KOLLEKTIV]."},
            
            // General
            ci95: { name: "95% Konfidenzintervall (CI)", description: "Der Wertebereich, der den wahren (unbekannten) Populationsparameter der Metrik mit 95%iger Wahrscheinlichkeit überdeckt.<br><i>Methode: [METHOD_CI]</i>", interpretation: "Basierend auf den Daten liegt der wahre Wert der Metrik mit 95%iger Sicherheit zwischen [LOWER] und [UPPER]."},
            konfusionsmatrix: { description: "Kreuztabelle, die die Klassifikationsergebnisse der Methode [METHODE] mit dem tatsächlichen N-Status vergleicht: Richtig Positive (RP), Falsch Positive (FP), Falsch Negative (FN), Richtig Negative (RN)." },
            accComp: { name: "Accuracy Vergleich (ungepaart)", description: "Vergleicht die Accuracy der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels Fisher's Exact Test.<br><i>Nullhypothese (H0): Accuracy in Kollektiv1 = Accuracy in Kollektiv2.</i>", interpretation: "Der Unterschied in der Accuracy der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
            aucComp: { name: "AUC Vergleich (ungepaart)", description: "Vergleicht die AUC der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels eines Z-Tests basierend auf den Standardfehlern der AUCs.<br><i>Nullhypothese (H0): AUC in Kollektiv1 = AUC in Kollektiv2.</i>", interpretation: "Der Unterschied in der AUC der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
            defaultP: { interpretation: `Der berechnete p-Wert beträgt <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Bei einem Signifikanzniveau von ${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,2).replace('.',',')} ist das Ergebnis <strong>[SIGNIFIKANZ_TEXT]</strong>.` },
            size_mwu: {name: "LK Größe MWU", description: "Vergleich der medianen Lymphknotengrößen zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test. Hier werden alle Lymphknoten der Patienten berücksichtigt, nicht Patienten-Level-Status.", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von [P_WERT] [SIGNIFIKANZ_TEXT]. Dies zeigt einen [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Lymphknotengrößen zwischen den Lymphknoten von N+ und N- Patienten im Kollektiv [KOLLEKTIV]."}
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
