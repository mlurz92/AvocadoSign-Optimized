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
        'KOMBINIERT': 'KOMBINIERT'
    },
    publikationTab: {
        spracheSwitchLabel: 'Deutsch',
        spracheSwitchLabelOpposite: 'English',
        sectionLabels: {
            methoden: 'Methoden',
            ergebnisse: 'Ergebnisse',
            diskussion: 'Diskussion',
            einleitung: 'Einleitung',
            abstract: 'Abstract',
            referenzen: 'Referenzen'
        },
        bruteForceMetricSelectLabel: 'Optimierungsmetrik für T2 (BF):',
        publicationTableTitles: {
            literaturT2Kriterien: 'Tabelle 2: Übersicht der Literatur-basierten T2-Kriteriensets',
            patientenCharakteristika: 'Tabelle 1: Patientencharakteristika',
            asPerformance: 'Tabelle 3: Diagnostische Güte - Avocado Sign (vs. N-Status)',
            literaturT2Performance: 'Tabelle 4: Diagnostische Güte - Literatur-basierte T2-Kriterien (vs. N-Status)',
            optimierteT2Performance: 'Tabelle 5: Diagnostische Güte - Optimierte T2-Kriterien (Ziel: {METRIC}, vs. N-Status)',
            vergleichPerformance: 'Tabelle 6: Statistischer Vergleich - Avocado Sign vs. T2-Kriterien (Literatur und Optimiert)'
        },
        publicationFigureCaptions: {
            patientenCharakteristikaAlter: 'Abb. 1a: Altersverteilung ({KOLLEKTIV})',
            patientenCharakteristikaGeschlecht: 'Abb. 1b: Geschlechterverteilung ({KOLLEKTIV})',
            vergleichPerformanceChart: 'Abb. 2{LETTER}: Vergleichsmetriken für {KOLLEKTIV}'
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
    excelExport: { // Keep Excel export texts as they might be for file names or internal tags, not UI
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
    publicationTableHeaders: {
        method: "Methode",
        cohort: "Kollektiv",
        sensitivityCI: "Sens. (95% CI)",
        specificityCI: "Spez. (95% CI)",
        ppvCI: "PPV (95% CI)",
        npvCI: "NPV (95% CI)",
        accuracyCI: "Acc. (95% CI)",
        aucCI: "AUC (95% CI)",
        studySet: "Studie / Kriteriensatz",
        primaryTargetCohort: "Primäres Zielkollektiv (Orig.)",
        coreCriteria: "Kernkriterien (Kurzfassung)",
        logic: "Logik",
        characteristic: "Merkmal",
        overall: "Gesamt (N={N_GESAMT})",
        surgeryAlone: "Direkt OP (N={N_SURGERY})",
        nRCT: "nRCT (N={N_NRCT})",
        pathNStatusPositive: "Pathologischer N-Status, positiv [n (%)]",
        ageMedian: "Alter, Median (Min–Max) [Jahre]",
        sexMale: "Geschlecht, männlich [n (%)]",
        criteriaSet: "Kriteriensatz",
        appliedCohort: "Angew. Kollektiv",
        comparison: "Vergleich",
        method1AUC: "Methode 1 (AUC)",
        method2AUC: "Methode 2 (AUC)",
        aucDiffM1M2: "Diff. AUC (M1-M2)",
        delongPValueAUC: "DeLong p-Wert (AUC)",
        mcNemarPValueAcc: "McNemar p-Wert (Acc.)",
        optimizationTarget: "Optimierungs-Ziel"
    }
};

const UI_TEXTS_EN = {
    kollektivDisplayNames: {
        'Gesamt': 'Overall Cohort',
        'direkt OP': 'Surgery Alone',
        'nRCT': 'Neoadjuvant Therapy Group',
        'avocado_sign': 'Avocado Sign',
        'applied_criteria': 'Applied T2 Criteria'
    },
    t2LogicDisplayNames: {
        'UND': 'AND',
        'ODER': 'OR',
        'KOMBINIERT': 'COMBINED'
    },
    publikationTab: {
        spracheSwitchLabel: 'English',
        spracheSwitchLabelOpposite: 'Deutsch',
        sectionLabels: {
            methoden: 'Methods',
            ergebnisse: 'Results',
            diskussion: 'Discussion',
            einleitung: 'Introduction',
            abstract: 'Abstract',
            referenzen: 'References'
        },
        bruteForceMetricSelectLabel: 'Optimization Metric for T2 (BF):',
        publicationTableTitles: {
            literaturT2Kriterien: 'Table 2: Overview of Literature-Based T2 Criteria Sets',
            patientenCharakteristika: 'Table 1: Patient Characteristics',
            asPerformance: 'Table 3: Diagnostic Performance - Avocado Sign (vs. N-Status)',
            literaturT2Performance: 'Table 4: Diagnostic Performance - Literature-Based T2 Criteria (vs. N-Status)',
            optimierteT2Performance: 'Table 5: Diagnostic Performance - Optimized T2 Criteria (Target: {METRIC}, vs. N-Status)',
            vergleichPerformance: 'Table 6: Statistical Comparison - Avocado Sign vs. T2 Criteria (Literature and Optimized)'
        },
        publicationFigureCaptions: {
            patientenCharakteristikaAlter: 'Fig. 1a: Age Distribution ({KOLLEKTIV})',
            patientenCharakteristikaGeschlecht: 'Fig. 1b: Gender Distribution ({KOLLEKTIV})',
            vergleichPerformanceChart: 'Fig. 2{LETTER}: Comparative Metrics for {KOLLEKTIV}'
        }
    },
    chartTitles: {
        ageDistribution: 'Age Distribution',
        genderDistribution: 'Gender',
        therapyDistribution: 'Therapy',
        statusN: 'N-Status (Pathology)',
        statusAS: 'AS-Status',
        statusT2: 'T2-Status',
        comparisonBar: 'Comparison AS vs. {T2Name}',
        rocCurve: 'ROC Curve for {Method}',
        asPerformance: 'AS Performance (Current Cohort)'
    },
    axisLabels: {
        age: 'Age (Years)',
        patientCount: 'Number of Patients',
        lymphNodeCount: 'Number of Lymph Nodes',
        metricValue: 'Value',
        metric: 'Diagnostic Metric',
        sensitivity: 'Sensitivity (TPR)',
        oneMinusSpecificity: '1 - Specificity (FPR)',
        probability: 'Probability',
        shortAxisDiameter: 'Short Axis Diameter (mm)'
    },
    legendLabels: {
        male: 'Male',
        female: 'Female',
        unknownGender: 'Unknown',
        direktOP: 'Surgery Alone',
        nRCT: 'Neoadjuvant Therapy',
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
        selectLabel: "Select criteria sets for comparison:",
        tableHeaderSet: "Method / Criteria Set",
        tableHeaderSens: "Sens.",
        tableHeaderSpez: "Spec.",
        tableHeaderPPV: "PPV",
        tableHeaderNPV: "NPV",
        tableHeaderAcc: "Acc.",
        tableHeaderAUC: "AUC/BalAcc",
        showAppliedLabel: "Show currently applied criteria"
    },
    excelExport: { // Keep Excel export texts as they might be for file names or internal tags, not UI
        datenLabel: "Datenliste (.xlsx)",
        auswertungLabel: "Auswertungstabelle (.xlsx)",
        statistikLabel: "Statistik Übersicht (.xlsx)",
        filteredDataLabel: "Gefilterte Daten (.xlsx)",
        zipLabel: "Alle Excel-Tabellen (.zip)"
    },
    singleChartDownload: {
        pngLabel: "Download as PNG",
        svgLabel: "Download as SVG"
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
    publicationTableHeaders: {
        method: "Method",
        cohort: "Cohort",
        sensitivityCI: "Sens. (95% CI)",
        specificityCI: "Spec. (95% CI)",
        ppvCI: "PPV (95% CI)",
        npvCI: "NPV (95% CI)",
        accuracyCI: "Acc. (95% CI)",
        aucCI: "AUC (95% CI)",
        studySet: "Study / Criteria Set",
        primaryTargetCohort: "Primary Target Cohort (Orig.)",
        coreCriteria: "Core Criteria (Summary)",
        logic: "Logic",
        characteristic: "Characteristic",
        overall: "Overall (n={N_GESAMT})",
        surgeryAlone: "Surgery Alone (n={N_SURGERY})",
        nRCT: "nRCT (n={N_NRCT})",
        pathNStatusPositive: "Pathological N-Status, positive [n (%)]",
        ageMedian: "Age, Median (Min–Max) [Years]",
        sexMale: "Sex, male [n (%)]",
        criteriaSet: "Criteria Set",
        appliedCohort: "Applied Cohort",
        comparison: "Comparison",
        method1AUC: "Method 1 (AUC)",
        method2AUC: "Method 2 (AUC)",
        aucDiffM1M2: "AUC Diff. (M1-M2)",
        delongPValueAUC: "DeLong p-value (AUC)",
        mcNemarPValueAcc: "McNemar p-value (Acc.)",
        optimizationTarget: "Optimization Target"
    }
};

// Function to get the correct language object
function getUiTexts(lang = null) {
    const currentLang = lang || (typeof state !== 'undefined' && state.getCurrentPublikationLang ? state.getCurrentPublikationLang() : PUBLICATION_CONFIG.defaultLanguage);
    return currentLang === 'en' ? UI_TEXTS_EN : UI_TEXTS_DE;
}

// Make UI_TEXTS dynamic based on language
const UI_TEXTS = new Proxy({}, {
    get: function(target, prop) {
        const langTexts = getUiTexts();
        return langTexts[prop];
    }
});


const TOOLTIP_CONTENT_DE = {
    kollektivButtons: { description: "Wählen Sie das Patientenkollektiv für die Analyse aus: Gesamt, nur primär Operierte (direkt OP) oder nur neoadjuvant Vorbehandelte (nRCT). Die Auswahl filtert die Datenbasis für alle Tabs." },
    headerStats: {
        kollektiv: "Aktuell betrachtetes Patientenkollektiv.",
        anzahlPatienten: "Gesamtzahl der Patienten im ausgewählten Kollektiv.",
        statusN: "Anteil der Patienten mit positivem (+) vs. negativem (-) histopathologischem Lymphknotenstatus (Referenzstandard) im ausgewählten Kollektiv.",
        statusAS: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß Avocado Sign (AS) Vorhersage im ausgewählten Kollektiv.",
        statusT2: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß den aktuell **angewendeten und gespeicherten** T2-Kriterien (siehe Auswertungstab) für das ausgewählte Kollektiv."
    },
    datenTable: {
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
        datenMD: { description: "Exportiert die aktuelle Datenliste (aus dem Daten-Tab) als Markdown-Tabelle (.md).", type: 'DATEN_MD', ext: "md" },
        datenXLSX: { description: "Exportiert die aktuelle Datenliste (aus dem Daten-Tab) als Excel-Datei (.xlsx).", type: 'DATEN_XLSX', ext: "xlsx" },
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
        mdZIP: { description: "Bündelt alle verfügbaren Markdown-Dateien (Deskriptiv, Daten, Auswertung) in einem ZIP-Archiv.", type: 'MD_ZIP', ext: "md"},
        pngZIP: { description: "Identisch zum 'Alle Diagramme & Tabellen (PNG)' Einzel-Export.", type: 'PNG_ZIP', ext: "zip"},
        svgZIP: { description: "Identisch zum 'Alle Diagramme (SVG)' Einzel-Export.", type: 'SVG_ZIP', ext: "zip"},
        xlsxZIP: { description: "Bündelt alle verfügbaren Excel-Dateien in einem ZIP-Archiv.", type: 'XLSX_ZIP', ext: "zip"}
    },
    publikationTabTooltips: {
        spracheSwitch: { description: "Wechselt die Sprache der Texte im Publikation-Tab zwischen Deutsch und Englisch." },
        sectionSelect: { description: "Wählen Sie den Abschnitt der wissenschaftlichen Publikation aus, für den Textvorschläge und relevante Daten/Grafiken angezeigt werden sollen." },
        bruteForceMetricSelect: { description: "Wählen Sie die Zielmetrik, für deren Optimierungsergebnisse (via Brute-Force) die entsprechenden Statistiken im 'Ergebnisse'-Abschnitt des Publikation-Tabs dargestellt werden sollen." },
        methoden: {
            studienanlage: "Textvorschlag und relevante Informationen zum Studiendesign, der Ethik und der verwendeten Software.",
            patientenkohorte: "Textvorschlag und relevante Informationen zum Patientenkollektiv und der Datenbasis.",
            mrtProtokoll: "Textvorschlag und relevante Informationen zum MRT-Protokoll und zur Kontrastmittelgabe.",
            asDefinition: "Textvorschlag und relevante Informationen zur Definition und Bewertung des Avocado Signs.",
            t2Definition: "Textvorschlag und relevante Informationen zur Definition und Bewertung der T2-Kriterien (benutzerdefiniert, Literatur, Brute-Force optimiert).",
            referenzstandard: "Textvorschlag und relevante Informationen zum Referenzstandard (Histopathologie).",
            statistischeAnalyse: "Textvorschlag und relevante Informationen zu den statistischen Analysemethoden."
        },
        ergebnisse: {
            patientencharakteristika: "Textvorschlag und relevante Tabellen/Diagramme zu den Patientencharakteristika.",
            asPerformance: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte des Avocado Signs.",
            literaturT2Performance: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte der Literatur-basierten T2-Kriterien.",
            optimierteT2Performance: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte der Brute-Force optimierten T2-Kriterien.",
            vergleichPerformance: "Textvorschlag und relevante Tabellen/Diagramme zum statistischen Vergleich der diagnostischen Güte zwischen Avocado Sign und den verschiedenen T2-Kriteriensets."
        }
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
        defaultP: { interpretation: `Der berechnete p-Wert beträgt <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Bei einem Signifikanzniveau von ${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL} ist das Ergebnis <strong>[SIGNIFIKANZ_TEXT]</strong>.` }
    }
};

const TOOLTIP_CONTENT_EN = {
    kollektivButtons: { description: "Select the patient cohort for analysis: Overall, only primary surgery (Surgery Alone), or only neoadjuvant treated (Neoadjuvant Therapy Group). This selection filters the data for all tabs." },
    headerStats: {
        kollektiv: "Currently selected patient cohort.",
        anzahlPatienten: "Total number of patients in the selected cohort.",
        statusN: "Proportion of patients with positive (+) vs. negative (-) histopathological lymph node status (reference standard) in the selected cohort.",
        statusAS: "Proportion of patients with positive (+) vs. negative (-) lymph node status according to Avocado Sign (AS) prediction in the selected cohort.",
        statusT2: "Proportion of patients with positive (+) vs. negative (-) lymph node status according to the currently **applied and saved** T2 criteria (see Evaluation tab) for the selected cohort."
    },
    datenTable: {
        nr: "Consecutive patient number.",
        name: "Patient's last name (anonymized/coded).",
        vorname: "Patient's first name (anonymized/coded).",
        geschlecht: "Patient's sex (m/f).",
        alter: "Patient's age in years at the time of MRI examination.",
        therapie: "Applied therapy before surgery (nRCT: neoadjuvant chemoradiotherapy, direkt OP: no prior treatment).",
        n_as_t2: "Direct comparison of lymph node status: N (pathology reference), AS (Avocado Sign prediction), T2 (prediction based on currently applied criteria). Click on N, AS, or T2 header to sort by that specific status.",
        bemerkung: "Additional clinical or radiological remarks on the patient case, if any.",
        expandAll: "Expands or collapses the detail view for T2-weighted lymph node characteristics for all patients in the current table view.",
        expandRow: "Click this row to show or hide details about the morphological characteristics of this specific patient's T2-weighted lymph nodes."
    },
    auswertungTable: {
        nr: "Consecutive patient number.",
        name: "Patient's last name (anonymized/coded).",
        therapie: "Applied therapy before surgery.",
        n_as_t2: "Direct comparison of lymph node status: N (pathology reference), AS (Avocado Sign prediction), T2 (prediction based on currently applied criteria). Click on N, AS, or T2 header to sort by that specific status.",
        n_counts: "Number of pathologically positive (N+) lymph nodes / total number of histopathologically examined lymph nodes for this patient.",
        as_counts: "Number of Avocado Sign positive (AS+) lymph nodes / total number of lymph nodes visible on T1-weighted contrast-enhanced MRI for this patient.",
        t2_counts: "Number of T2 positive lymph nodes (according to currently applied criteria) / total number of lymph nodes visible on T2-weighted MRI for this patient.",
        expandAll: "Expands or collapses the detail view of evaluated T2-weighted lymph nodes and fulfilled criteria for all patients in the current table view.",
        expandRow: "Click this row to show or hide the detailed evaluation of this patient's individual T2-weighted lymph nodes according to the currently applied criteria. Fulfilled positive criteria are highlighted."
    },
    t2Logic: { description: `Logical operator for active T2 criteria: <strong>AND</strong> (A lymph node is positive only if ALL activated criteria are met). <strong>OR</strong> (A lymph node is positive if AT LEAST ONE activated criterion is met).` },
    t2Size: { description: `Size criterion: Lymph nodes with a short-axis diameter <strong>greater than or equal to</strong> the set threshold are considered suspicious. Adjustable range: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} - ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm. Activate/deactivate the criterion using the checkbox.` },
    t2Form: { description: "Shape criterion: Select which shape ('round' or 'oval') is considered suspicious. A lymph node is considered 'round' if the ratio of short axis to long axis is close to 1. Activate/deactivate the criterion using the checkbox." },
    t2Kontur: { description: "Border criterion: Select which border ('smooth' or 'irregular') is considered suspicious. Activate/deactivate the criterion using the checkbox." },
    t2Homogenitaet: { description: "Homogeneity criterion: Select whether a 'homogeneous' or 'heterogeneous' internal signal on T2w is considered suspicious. Activate/deactivate the criterion using the checkbox." },
    t2Signal: { description: "Signal criterion: Select which T2 signal intensity ('low', 'intermediate', or 'high') relative to surrounding muscle is considered suspicious. Lymph nodes with non-assessable signal (signal='null') never meet this criterion. Activate/deactivate the criterion using the checkbox." },
    t2Actions: {
        reset: "Resets the logic and all criteria to their default settings (see configuration). These changes are not yet applied.",
        apply: "Applies the currently set T2 criteria and logic to the entire dataset. This updates the T2 columns in tables, all statistical evaluations, and charts. The settings are also saved for future sessions."
    },
    t2CriteriaCard: { unsavedIndicator: "Warning: There are unsaved changes to the T2 criteria or logic. Click 'Apply' to update results and save the settings." },
    t2MetricsOverview: {
        cardTitle: "Brief overview of diagnostic performance for the currently applied and saved T2 criteria compared to the histopathological N-status for the selected cohort: [KOLLEKTIV].",
        sens: "Sensitivity (T2 vs. N)",
        spez: "Specificity (T2 vs. N)",
        ppv: "PPV (T2 vs. N)",
        npv: "NPV (T2 vs. N)",
        acc: "Accuracy (T2 vs. N)",
        balAcc: "Balanced Accuracy (T2 vs. N)",
        f1: "F1-Score (T2 vs. N)",
        auc: "AUC (T2 vs. N)"
     },
    bruteForceMetric: { description: "Select the target metric to be maximized by the brute-force search. Comparison is always against N-status.<br><strong>Accuracy:</strong> Overall correctness.<br><strong>Balanced Accuracy:</strong> Average of sensitivity and specificity (useful for imbalanced classes).<br><strong>F1-Score:</strong> Harmonic mean of PPV and sensitivity.<br><strong>PPV:</strong> Positive Predictive Value.<br><strong>NPV:</strong> Negative Predictive Value." },
    bruteForceStart: { description: "Starts the exhaustive (brute-force) search for the optimal combination of T2 criteria (active criteria, values, logic) that maximizes the selected target metric. This tests all meaningful combinations and may take several minutes depending on cohort size. The process runs in the background." },
    bruteForceInfo: { description: "Shows the status of the optimization worker and the currently selected patient cohort for analysis." },
    bruteForceProgress: { description: "Shows the progress of the ongoing optimization: number of combinations already tested out of a total of [TOTAL] to be tested, as well as the best metric found so far with the corresponding criteria and logic." },
    bruteForceResult: { description: "Displays the result of the completed optimization: the best found criteria combination (logic, active criteria, values) and the achieved value of the target metric for the analyzed cohort." },
    bruteForceDetailsButton: { description: "Opens a separate window (modal) showing a sorted list of the top 10 found criteria combinations (including those with identical metric values) and other details about the optimization." },
    bruteForceModal: { exportButton: "Exports the detailed brute-force optimization report, including the top 10 results and configuration, as a formatted text file (.txt)." },
    statistikLayout: { description: "Select the display mode for statistical results: 'Single View' shows detailed statistics for the patient group globally selected in the header. 'Comparison Active' allows selecting two cohorts and displays their statistics side-by-side, along with additional statistical tests to compare performance between the groups." },
    statistikKollektiv1: { description: "Select the first cohort for statistical evaluation or comparison (only active with 'Comparison Active' layout)." },
    statistikKollektiv2: { description: "Select the second cohort for comparison (only active with 'Comparison Active' layout)." },
    statistikToggleVergleich: { description: "Toggles between the view for a single, globally selected cohort and the comparison view of two specifically selectable cohorts." },
    deskriptiveStatistik: {
        cardTitle: "Overview of demographic data (age, sex), therapy type, and distribution of N, AS, and T2 statuses, as well as lymph node counts in the selected cohort ([KOLLEKTIV]).",
        alterMedian: { description: "Median age: The central value dividing patients by age into two equal halves. Shown with minimum-maximum and [mean ± standard deviation]." },
        geschlecht: { description: "Absolute number and percentage distribution of sexes (male/female) in the cohort." },
        nStatus: { description: "Absolute number and percentage of patients with positive (+) vs. negative (-) histopathological N-status in the cohort." },
        asStatus: { description: "Absolute number and percentage of patients with positive (+) vs. negative (-) predicted AS-status in the cohort." },
        t2Status: { description: "Absolute number and percentage of patients with positive (+) vs. negative (-) predicted T2-status (based on currently applied criteria) in the cohort." },
        lkAnzahlPatho: { description: "Median (minimum-maximum) [mean ± standard deviation] of the total number of histopathologically examined lymph nodes per patient in the cohort." },
        lkAnzahlPathoPlus: { description: "Median (minimum-maximum) [mean ± standard deviation] of the number of pathologically positive (N+) lymph nodes per patient, *only* for patients who were actually N+." },
        lkAnzahlAS: { description: "Median (minimum-maximum) [mean ± standard deviation] of the total number of Avocado Sign lymph nodes (AS total) detected on T1-weighted contrast-enhanced MRI per patient." },
        lkAnzahlASPlus: { description: "Median (minimum-maximum) [mean ± standard deviation] of the number of Avocado Sign positive lymph nodes (AS+) per patient, *only* for patients who were AS+." },
        lkAnzahlT2: { description: "Median (minimum-maximum) [mean ± standard deviation] of the total number of lymph nodes detected on T2-weighted MRI per patient." },
        lkAnzahlT2Plus: { description: "Median (minimum-maximum) [mean ± standard deviation] of the number of T2 positive lymph nodes (T2+, according to applied criteria) per patient, *only* for patients who were T2+." },
        chartAge: { description: "Histogram of age distribution of patients in cohort [KOLLEKTIV]." },
        chartGender: { description: "Pie chart of gender distribution (m/f) in cohort [KOLLEKTIV]." }
    },
    diagnostischeGueteAS: { cardTitle: "Diagnostic performance metrics for the Avocado Sign (AS) compared to histopathology (N) as the reference standard for cohort [KOLLEKTIV]. All values include 95% confidence intervals." },
    diagnostischeGueteT2: { cardTitle: "Diagnostic performance metrics for the currently applied T2 criteria compared to histopathology (N) as the reference standard for cohort [KOLLEKTIV]. All values include 95% confidence intervals." },
    statistischerVergleichASvsT2: { cardTitle: "Direct statistical comparison of the diagnostic performance of AS vs. T2 (currently applied criteria) within the same cohort ([KOLLEKTIV]) using paired tests." },
    assoziationEinzelkriterien: { cardTitle: "Analysis of the association between AS status or individual T2 features (regardless of activation) and the histopathological N-status (+/-) in cohort [KOLLEKTIV]. Odds Ratio (OR), Risk Difference (RD), Phi coefficient, and p-values from appropriate tests are shown." },
    vergleichKollektive: { cardTitle: "Statistical comparison of diagnostic performance (Accuracy, AUC for AS and T2) between cohort [KOLLEKTIV1] and cohort [KOLLEKTIV2] using tests for independent samples." },
    criteriaComparisonTable: {
        cardTitle: "Tabular comparison of diagnostic performance of different methods/criteria sets (AS, currently applied T2, studies) for the selected cohort [KOLLEKTIV].",
        tableHeaderSet: "Method / Criteria Set",
        tableHeaderSens: "Sensitivity: Proportion of correctly identified positive N+ cases.",
        tableHeaderSpez: "Specificity: Proportion of correctly identified negative N- cases.",
        tableHeaderPPV: "Positive Predictive Value: Probability of N+ if test result is positive.",
        tableHeaderNPV: "Negative Predictive Value: Probability of N- if test result is negative.",
        tableHeaderAcc: "Accuracy: Overall proportion of correctly classified cases.",
        tableHeaderAUC: "Area Under Curve / Balanced Accuracy: Measure of overall discriminative power (0.5=random, 1=perfect)."
    },
    logisticRegressionCard: { cardTitle: "Results of logistic regression modeling the probability of N+ based on selected predictors (e.g., T2 features, age) for cohort [KOLLEKTIV]. (Experimental)" },
    rocCurveCard: { cardTitle: "Receiver Operating Characteristic (ROC) curve for distinguishing between N+ and N- based on {Variable} for cohort [KOLLEKTIV]. Shows sensitivity vs. 1-specificity across different thresholds." },
    praesentation: {
        viewSelect: { description: "Select the data view for the Presentation tab: 'Avocado Sign (Data)' shows dynamically calculated key results for AS in the current cohort. 'AS vs. T2 (Comparison)' allows a dynamic comparison of AS with T2 criteria for the currently globally selected cohort." },
        studySelect: { description: "Select a source for the T2 criteria to be compared with the Avocado Sign: Either the criteria currently set in the app ('Applied T2 Criteria') or predefined criteria sets from relevant published studies. The selection updates the info card and comparison chart. The comparison is always based on the patient cohort currently selected in the header." },
        t2BasisInfoCard: {
            title: "Details on T2 Comparison Basis",
            description: "Shows details about the T2 criteria currently selected for comparison.",
            reference: "Source / publication of the criteria.",
            patientCohort: "Original cohort and study type of the study.",
            investigationType: "Investigation type of the original study (baseline or restaging).",
            focus: "Main focus or research question of the study regarding these criteria.",
            keyCriteriaSummary: "Summary of the applied T2 criteria."
        },
        comparisonTableCard: { description: "Shows the numerical values of diagnostic performance metrics for the comparison of Avocado Sign vs. selected T2 basis for the current cohort."},
        downloadDemographicsMD: { description: "Downloads the table of basic demographic data (Avocado Sign view only) as a Markdown file (.md)."},
        downloadPerformanceCSV: { description: "Downloads the diagnostic performance table (AS or AS vs. selected T2 basis, depending on view) as a CSV file (.csv)." },
        downloadPerformanceMD: { description: "Downloads the diagnostic performance table (AS or AS vs. selected T2 basis, depending on view) as a Markdown file (.md)." },
        downloadCompTestsMD: { description: "Downloads the table of statistical comparison tests (p-values for McNemar and DeLong for AS vs. selected T2 basis) as a Markdown file (.md)." },
        downloadCompChartPNG: { description: "Downloads the comparison bar chart (AS vs. selected T2 basis) as a PNG file." },
        downloadCompChartSVG: { description: "Downloads the comparison bar chart (AS vs. selected T2 basis) as a vector SVG file." },
        downloadTablePNG: { description: "Downloads the displayed table as a PNG image file." },
        downloadCompTablePNG: { description: "Downloads the comparison metrics table (AS vs. T2) as a PNG file." },
        asPurPerfTable: {
            kollektiv: "Patient cohort (Overall, Surgery Alone, Neoadjuvant Therapy). N = number of patients in the group.",
            sens: "Sensitivity for AS (vs. N) in this cohort.",
            spez: "Specificity for AS (vs. N) in this cohort.",
            ppv: "Positive Predictive Value for AS (vs. N) in this cohort.",
            npv: "Negative Predictive Value for AS (vs. N) in this cohort.",
            acc: "Accuracy for AS (vs. N) in this cohort.",
            auc: "AUC / Balanced Accuracy for AS (vs. N) in this cohort."
        },
        asVsT2PerfTable: {
            metric: "Diagnostic metric.",
            asValue: "Value of the metric for Avocado Sign (AS) (vs. N) in cohort [KOLLEKTIV], incl. 95% CI.",
            t2Value: "Value of the metric for the selected T2 basis ([T2_SHORT_NAME]) (vs. N) in cohort [KOLLEKTIV], incl. 95% CI."
        },
        asVsT2TestTable: {
            test: "Statistical test for comparing AS vs. [T2_SHORT_NAME].",
            statistic: "Value of the test statistic.",
            pValue: "p-value of the test. p < 0.05 indicates a statistically significant difference between AS and [T2_SHORT_NAME] regarding the tested metric (Accuracy or AUC) in cohort [KOLLEKTIV].",
            method: "Name of the statistical test used."
        }
    },
    exportTab: {
        singleExports: "Single Exports",
        exportPackages: "Export Packages (.zip)",
        description: "Allows exporting analysis results, tables, and charts based on the currently selected cohort ([KOLLEKTIV]) and the currently applied T2 criteria.",
        statsCSV: { description: "Exports a detailed table of all calculated statistical metrics, confidence intervals, and test results from the Statistics tab as a comma-separated values file (.csv).", type: 'STATS_CSV', ext: "csv" },
        statsXLSX: { description: "Exports the detailed table of all calculated statistical metrics, confidence intervals, and test results from the Statistics tab as an Excel file (.xlsx).", type: 'STATISTIK_XLSX', ext: "xlsx" },
        bruteForceTXT: { description: "Exports the detailed report of the last brute-force optimization (top 10 results, configuration, runtime) as a plain text file (.txt), if an optimization was performed.", type: 'BRUTEFORCE_TXT', ext: "txt" },
        deskriptivMD: { description: "Exports the descriptive statistics table (from the Statistics tab) in Markdown format (.md), suitable for reports.", type: 'DESKRIPTIV_MD', ext: "md" },
        datenMD: { description: "Exports the current data list (from the Data tab) as a Markdown table (.md).", type: 'DATEN_MD', ext: "md" },
        datenXLSX: { description: "Exports the current data list (from the Data tab) as an Excel file (.xlsx).", type: 'DATEN_XLSX', ext: "xlsx" },
        auswertungMD: { description: "Exports the current evaluation table (from the Evaluation tab) with applied T2 results as a Markdown table (.md).", type: 'AUSWERTUNG_MD', ext: "md" },
        auswertungXLSX: { description: "Exports the current evaluation table (from the Evaluation tab) with applied T2 results as an Excel file (.xlsx).", type: 'AUSWERTUNG_XLSX', ext: "xlsx" },
        filteredDataCSV: { description: "Exports the underlying raw data of the currently selected and analyzed cohort, including calculated T2 results, as a CSV file (.csv).", type: 'FILTERED_DATA_CSV', ext: "csv" },
        filteredDataXLSX: { description: "Exports the underlying raw data of the currently selected and analyzed cohort, including calculated T2 results, as an Excel file (.xlsx).", type: 'FILTERED_DATA_XLSX', ext: "xlsx" },
        comprehensiveReportHTML: { description: "Generates a comprehensive analysis report as an HTML file, summarizing all important statistics, configurations, and charts. Can be opened in a browser and printed.", type: 'COMPREHENSIVE_REPORT_HTML', ext: "html" },
        chartsPNG: { description: "Exports all currently visible charts from the Statistics, Evaluation, and Presentation tabs, as well as selected tables, as individual high-resolution PNG image files, bundled in a ZIP archive.", type: 'PNG_ZIP', ext: "zip" },
        chartsSVG: { description: "Exports all currently visible charts from the Statistics, Evaluation, and Presentation tabs as individual scalable vector graphics files (SVG), bundled in a ZIP archive.", type: 'SVG_ZIP', ext: "zip" },
        chartSinglePNG: { description: "Exports the selected chart as a single PNG file.", type: 'CHART_SINGLE_PNG', ext: "png"},
        chartSingleSVG: { description: "Exports the selected chart as a single SVG file.", type: 'CHART_SINGLE_SVG', ext: "svg"},
        tableSinglePNG: { description: "Exports the selected table as a single PNG file.", type: 'TABLE_PNG_EXPORT', ext: "png"},
        allZIP: { description: "Exports all available single files (Statistics CSV, BruteForce TXT, all MDs, Filtered Data CSV, HTML Report) in a single ZIP archive.", type: 'ALL_ZIP', ext: "zip"},
        csvZIP: { description: "Bundles all available CSV files (Statistics, Filtered Data) into a ZIP archive.", type: 'CSV_ZIP', ext: "zip"},
        mdZIP: { description: "Bundles all available Markdown files (Descriptive, Data, Evaluation) into a ZIP archive.", type: 'MD_ZIP', ext: "md"},
        pngZIP: { description: "Identical to the 'All Charts & Tables (PNG)' single export.", type: 'PNG_ZIP', ext: "zip"},
        svgZIP: { description: "Identical to the 'All Charts (SVG)' single export.", type: 'SVG_ZIP', ext: "zip"},
        xlsxZIP: { description: "Bundles all available Excel files into a ZIP archive.", type: 'XLSX_ZIP', ext: "zip"}
    },
    publikationTabTooltips: {
        spracheSwitch: { description: "Switches the language of the texts in the Publication tab between German and English." },
        sectionSelect: { description: "Select the section of the scientific publication for which text suggestions and relevant data/graphics should be displayed." },
        bruteForceMetricSelect: { description: "Select the target metric for whose optimization results (via brute-force) the corresponding statistics will be displayed in the 'Results' section of the Publication tab." },
        methoden: {
            studienanlage: "Text suggestion and relevant information on study design, ethics, and software used.",
            patientenkohorte: "Text suggestion and relevant information on the patient cohort and data basis.",
            mrtProtokoll: "Text suggestion and relevant information on the MRI protocol and contrast agent administration.",
            asDefinition: "Text suggestion and relevant information on the definition and assessment of the Avocado Sign.",
            t2Definition: "Text suggestion and relevant information on the definition and assessment of T2 criteria (user-defined, literature-based, brute-force optimized).",
            referenzstandard: "Text suggestion and relevant information on the reference standard (histopathology).",
            statistischeAnalyse: "Text suggestion and relevant information on statistical analysis methods."
        },
        ergebnisse: {
            patientencharakteristika: "Text suggestion and relevant tables/charts on patient characteristics.",
            asPerformance: "Text suggestion and relevant tables/charts on the diagnostic performance of the Avocado Sign.",
            literaturT2Performance: "Text suggestion and relevant tables/charts on the diagnostic performance of literature-based T2 criteria.",
            optimierteT2Performance: "Text suggestion and relevant tables/charts on the diagnostic performance of brute-force optimized T2 criteria.",
            vergleichPerformance: "Text suggestion and relevant tables/charts on the statistical comparison of diagnostic performance between Avocado Sign and various T2 criteria sets."
        }
    },
     statMetrics: {
        sens: { name: "Sensitivity", description: "Sensitivity ([METHOD] vs. N): Proportion of actually positive cases (N+) correctly identified as positive by method [METHOD].<br><i>Formula: TP / (TP + FN)</i>", interpretation: "Method [METHOD] correctly identified <strong>[WERT]</strong> of actually N+ patients (95% CI by [METHOD_CI]: [LOWER] - [UPPER]) in cohort [KOLLEKTIV]."},
        spez: { name: "Specificity", description: "Specificity ([METHOD] vs. N): Proportion of actually negative cases (N-) correctly identified as negative by method [METHOD].<br><i>Formula: TN / (TN + FP)</i>", interpretation: "Method [METHOD] correctly identified <strong>[WERT]</strong> of actually N- patients (95% CI by [METHOD_CI]: [LOWER] - [UPPER]) in cohort [KOLLEKTIV]."},
        ppv: { name: "Positive Predictive Value (PPV)", description: "PPV ([METHOD] vs. N): Probability that a patient with a positive test result from method [METHOD] is actually diseased (N+).<br><i>Formula: TP / (TP + FP)</i>", interpretation: "If method [METHOD] yielded a positive result, the probability of an actual N+ status was <strong>[WERT]</strong> (95% CI by [METHOD_CI]: [LOWER] - [UPPER]) in cohort [KOLLEKTIV]."},
        npv: { name: "Negative Predictive Value (NPV)", description: "NPV ([METHOD] vs. N): Probability that a patient with a negative test result from method [METHOD] is actually healthy (N-).<br><i>Formula: TN / (TN + FN)</i>", interpretation: "If method [METHOD] yielded a negative result, the probability of an actual N- status was <strong>[WERT]</strong> (95% CI by [METHOD_CI]: [LOWER] - [UPPER]) in cohort [KOLLEKTIV]."},
        acc: { name: "Accuracy", description: "Accuracy ([METHOD] vs. N): Proportion of all cases correctly classified by method [METHOD] (both positive and negative).<br><i>Formula: (TP + TN) / Total number</i>", interpretation: "Method [METHOD] correctly classified a total of <strong>[WERT]</strong> of all patients (95% CI by [METHOD_CI]: [LOWER] - [UPPER]) in cohort [KOLLEKTIV]."},
        balAcc: { name: "Balanced Accuracy", description: "Balanced Accuracy ([METHOD] vs. N): The average of sensitivity and specificity.<br><i>Formula: (Sensitivity + Specificity) / 2</i>", interpretation: "The Balanced Accuracy of method [METHOD], which equally weights sensitivity and specificity, was <strong>[WERT]</strong> (95% CI by [METHOD_CI]: [LOWER] - [UPPER]) in cohort [KOLLEKTIV]."},
        f1: { name: "F1-Score", description: "F1-Score ([METHOD] vs. N): The harmonic mean of PPV (Precision) and Sensitivity (Recall).<br><i>Formula: 2 * (PPV * Sensitivity) / (PPV + Sensitivity)</i>", interpretation: "The F1-Score for method [METHOD], combining precision and sensitivity, is <strong>[WERT]</strong> (95% CI by [METHOD_CI]: [LOWER] - [UPPER]) in cohort [KOLLEKTIV]."},
        auc: { name: "Area Under Curve (AUC)", description: "AUC ([METHOD] vs. N): Area under the Receiver Operating Characteristic (ROC) curve. Represents the ability of method [METHOD] to correctly rank randomly selected N+ and N- patients. 0.5 corresponds to chance, 1.0 to perfect separation.<br><i>For binary tests (like AS or a fixed T2 rule), AUC = Balanced Accuracy.</i>", interpretation: "The AUC of <strong>[WERT]</strong> (95% CI by [METHOD_CI]: [LOWER] - [UPPER]) indicates <strong>[BEWERTUNG]</strong> overall discriminatory power of method [METHOD] between N+ and N- cases in cohort [KOLLEKTIV]."},
        mcnemar: { name: "McNemar's Test", description: "Tests for a significant difference in discordant pairs (cases where AS and [T2_SHORT_NAME] yield different results) in paired data.<br><i>Null hypothesis: Number(AS+/[T2_SHORT_NAME]-) = Number(AS-/[T2_SHORT_NAME]+)</i>", interpretation: "McNemar's test yielded a p-value of <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. This suggests that the misclassification rates of AS and [T2_SHORT_NAME] in cohort [KOLLEKTIV] are [SIGNIFIKANZ_TEXT] different."},
        delong: { name: "DeLong's Test", description: "Compares two AUC values from ROC curves based on the same (paired) data, considering covariance.<br><i>Null hypothesis: AUC(AS) = AUC([T2_SHORT_NAME])</i>", interpretation: "DeLong's test yielded a p-value of <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. This suggests that the AUC values (or Balanced Accuracies) of AS and [T2_SHORT_NAME] in cohort [KOLLEKTIV] are [SIGNIFIKANZ_TEXT] different."},
        phi: { name: "Phi Coefficient (φ)", description: "Measure of the strength and direction of association between two binary variables (e.g., presence of feature [MERKMAL] and N-status). Ranges from -1 to +1.", interpretation: "The Phi coefficient of <strong>[WERT]</strong> indicates a <strong>[STAERKE]</strong> association between feature [MERKMAL] and N-status in cohort [KOLLEKTIV]."},
        rd: { name: "Risk Difference (RD)", description: "Absolute difference in the probability (risk) of N+ between patients with and without feature [MERKMAL].<br><i>Formula: P(N+|Feature+) - P(N+|Feature-)</i>", interpretation: "The risk of N+ was <strong>[WERT]%</strong> absolutely [HOEHER_NIEDRIGER] in patients with feature [MERKMAL] compared to patients without this feature (95% CI by [METHOD_CI]: [LOWER]% - [UPPER]%) in cohort [KOLLEKTIV]."},
        or: { name: "Odds Ratio (OR)", description: "Ratio of the odds of N+ in the presence vs. absence of feature [MERKMAL].<br><i>Formula: Odds(N+|Feature+)/Odds(N+|Feature-)</i><br>OR > 1 means increased odds, OR < 1 decreased odds.", interpretation: "The odds of N+ status were [FAKTOR_TEXT] by a factor of <strong>[WERT]</strong> in patients with feature [MERKMAL] compared to patients without this feature (95% CI by [METHOD_CI]: [LOWER] - [UPPER], p=[P_WERT], [SIGNIFIKANZ]) in cohort [KOLLEKTIV]."},
        fisher: { name: "Fisher's Exact Test", description: "Exact test to check for a significant association between two categorical variables (e.g., feature [MERKMAL] vs. N-status).", interpretation: "Fisher's exact test yielded a p-value of <strong>[P_WERT] ([SIGNIFIKANZ])</strong>, indicating a [SIGNIFIKANZ_TEXT] association between feature [MERKMAL] and N-status in cohort [KOLLEKTIV]."},
        mannwhitney: { name: "Mann-Whitney U Test", description: "Non-parametric test to compare the central tendency (median) of a variable (e.g., '[VARIABLE]') between two independent groups (e.g., N+ vs. N-).", interpretation: "The Mann-Whitney U test yielded a p-value of <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. This shows a [SIGNIFIKANZ_TEXT] difference in the distribution of variable '[VARIABLE]' between N+ and N- patients in cohort [KOLLEKTIV]."},
        ci95: { name: "95% Confidence Interval (CI)", description: "The range of values that covers the true (unknown) population value of the calculated metric with 95% probability.<br><i>Method: [METHOD_CI]</i>", interpretation: "Based on the data, the true value of the metric lies between [LOWER] and [UPPER] with 95% confidence."},
        konfusionsmatrix: { description: "Contingency table comparing the classification results of method [METHODE] with the actual N-status: True Positives (TP), False Positives (FP), False Negatives (FN), True Negatives (TN)." },
        accComp: { name: "Accuracy Comparison", description: "Compares the accuracy of method [METHODE] between two independent cohorts ([KOLLEKTIV1] vs. [KOLLEKTIV2]) using Fisher's Exact Test.", interpretation: "The difference in accuracy of method [METHODE] between cohorts [KOLLEKTIV1] and [KOLLEKTIV2] is <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
        aucComp: { name: "AUC Comparison", description: "Compares the AUC of method [METHODE] between two independent cohorts ([KOLLEKTIV1] vs. [KOLLEKTIV2]) using a Z-test.", interpretation: "The difference in AUC of method [METHODE] between cohorts [KOLLEKTIV1] and [KOLLEKTIV2] is <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
        logisticRegressionFit: { name: "Model Fit (Log. Regression)", description: "Goodness of fit of the logistic regression model to the data.", interpretation: "The model shows a [BEWERTUNG_FIT] fit to the data."},
        logisticRegressionCoef: { name: "Coefficient (Log. Regression)", description: "Estimated coefficient for predictor [PREDICTOR]. Indicates the change in log-odds of N+ per unit change in the predictor.", interpretation: "The coefficient for [PREDICTOR] is <strong>[COEF_VALUE]</strong> (p=[P_WERT], [SIGNIFIKANZ]), indicating a [SIGNIFIKANZ_TEXT] effect on the probability of N+."},
        rocCurvePlot: { description: "Shows the ROC curve for {Variable}. The diagonal line represents random classification (AUC=0.5). A curve closer to the top-left corner indicates better performance."},
        defaultP: { interpretation: `The calculated p-value is <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. At a significance level of ${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL}, the result is <strong>[SIGNIFIKANZ_TEXT]</strong>.` }
    }
};

function getTooltipContent(lang = null) {
    const currentLang = lang || (typeof state !== 'undefined' && state.getCurrentPublikationLang ? state.getCurrentPublikationLang() : PUBLICATION_CONFIG.defaultLanguage);
    return currentLang === 'en' ? TOOLTIP_CONTENT_EN : TOOLTIP_CONTENT_DE;
}

const TOOLTIP_CONTENT = new Proxy({}, {
    get: function(target, prop) {
        const langTooltips = getTooltipContent();
        return langTooltips[prop];
    }
});


deepFreeze(UI_TEXTS_DE);
deepFreeze(UI_TEXTS_EN);
deepFreeze(TOOLTIP_CONTENT_DE);
deepFreeze(TOOLTIP_CONTENT_EN);
