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
        'Gesamt': {
            de: 'Gesamt',
            en: 'Overall'
        },
        'direkt OP': {
            de: 'Direkt OP',
            en: 'Upfront Surgery'
        },
        'nRCT': {
            de: 'nRCT',
            en: 'nCRT'
        },
        'avocado_sign': {
            de: 'Avocado Sign',
            en: 'Avocado Sign'
        },
        'applied_criteria': {
            de: 'Eingestellte T2 Kriterien',
            en: 'Applied T2 Criteria'
        }
    },
    t2LogicDisplayNames: {
        'UND': {
            de: 'UND',
            en: 'AND'
        },
        'ODER': {
            de: 'ODER',
            en: 'OR'
        },
        'KOMBINIERT': {
            de: 'KOMBINIERT',
            en: 'COMBINED'
        }
    },
    t2CriteriaShortPrefix: {
        size: { de: 'Gr.', en: 'Size' },
        form: { de: 'Fo=', en: 'Shape=' },
        kontur: { de: 'Ko=', en: 'Border=' },
        homogenitaet: { de: 'Ho=', en: 'Signal=' },
        signal: { de: 'Si=', en: 'Intens.=' }
    },
    t2CriteriaLongPrefix: {
        size: { de: 'Größe ', en: 'Size ' },
        form: { de: 'Form=', en: 'Shape=' },
        kontur: { de: 'Kontur=', en: 'Border=' },
        homogenitaet: { de: 'Homog.=', en: 'Homog.=' },
        signal: { de: 'Signal=', en: 'Signal=' }
    },
    t2CriteriaValues: {
        rund: { de: 'rund', en: 'round' },
        oval: { de: 'oval', en: 'oval' },
        scharf: { de: 'scharf', en: 'smooth' },
        irregulär: { de: 'irregulär', en: 'irregular' },
        homogen: { de: 'homogen', en: 'homogeneous' },
        heterogen: { de: 'heterogen', en: 'heterogeneous' },
        signalarm: { de: 'signalarm', en: 'hypointense' },
        intermediär: { de: 'intermediär', en: 'intermediate' },
        signalreich: { de: 'signalreich', en: 'hyperintense' }
    },
    t2CriteriaShortValues: {
        irregulär: { de: 'irr.', en: 'irreg.'},
        scharf: { de: 'scharf', en: 'smooth'},
        heterogen: { de: 'het.', en: 'heter.'},
        homogen: { de: 'hom.', en: 'homog.'},
        signalarm: { de: 'sig.arm', en: 'hypoint.'},
        intermediär: { de: 'sig.int.', en: 'intermed.'},
        signalreich: { de: 'sig.reich', en: 'hyperint.'},
        rund: { de: 'rund', en: 'round'},
        oval: { de: 'oval', en: 'oval'}
    },
    noActiveCriteria: {
        de: "Keine aktiven Kriterien",
        en: "No active criteria"
    },
    publikationTab: {
        spracheSwitchLabel: {
            de: 'Deutsch',
            en: 'English'
        },
        sectionLabels: {
            methoden: { de: 'Methoden', en: 'Methods' },
            ergebnisse: { de: 'Ergebnisse', en: 'Results' },
            diskussion: { de: 'Diskussion', en: 'Discussion' },
            einleitung: { de: 'Einleitung', en: 'Introduction' },
            abstract: { de: 'Abstract', en: 'Abstract' },
            referenzen: { de: 'Referenzen', en: 'References' }
        },
        bruteForceMetricSelectLabel: {
            de: 'Optimierungsmetrik für T2 (BF):',
            en: 'Optimization Metric for T2 (BF):'
        }
    },
    publicationSubSectionLabels: {
        studienanlage: { de: 'Studiendesign und Ethik', en: 'Study Design and Ethics' },
        patientenkollektiv: { de: 'Patientenkollektiv', en: 'Patient Cohort' },
        mrtProtokoll: { de: 'MRT-Protokoll & Kontrastmittelgabe', en: 'MRI Protocol & Contrast Administration' },
        asDefinition: { de: 'Definition & Bewertung Avocado Sign', en: 'Definition & Assessment of Avocado Sign' },
        t2Definition: { de: 'Definition & Bewertung T2-Kriterien', en: 'Definition & Assessment of T2 Criteria' },
        referenzstandard: { de: 'Referenzstandard (Histopathologie)', en: 'Reference Standard (Histopathology)' },
        statistischeAnalyse: { de: 'Statistische Analyse', en: 'Statistical Analysis' },
        patientencharakteristika: { de: 'Patientencharakteristika', en: 'Patient Characteristics' },
        asPerformance: { de: 'Diagnostische Güte: Avocado Sign', en: 'Diagnostic Performance: Avocado Sign' },
        literaturT2Performance: { de: 'Diagnostische Güte: Literatur-T2-Kriterien', en: 'Diagnostic Performance: Literature-Based T2 Criteria' },
        optimierteT2Performance: { de: 'Diagnostische Güte: Optimierte T2-Kriterien (Brute-Force)', en: 'Diagnostic Performance: Optimized T2 Criteria (Brute-Force)' },
        vergleichPerformanceT2: { de: 'Vergleich: AS vs. T2-Kriterien', en: 'Comparison: AS vs. T2 Criteria' }
    },
    chartTitles: {
        ageDistribution: { de: 'Altersverteilung', en: 'Age Distribution' },
        genderDistribution: { de: 'Geschlecht', en: 'Gender' },
        therapyDistribution: { de: 'Therapie', en: 'Therapy' },
        statusN: { de: 'N-Status (Patho)', en: 'N-Status (Patho)' },
        statusAS: { de: 'AS-Status', en: 'AS-Status' },
        statusT2: { de: 'T2-Status', en: 'T2-Status' },
        comparisonBar: { de: 'Vergleich AS vs. {T2Name}', en: 'Comparison AS vs. {T2Name}' },
        rocCurve: { de: 'ROC-Kurve für {Method}', en: 'ROC Curve for {Method}' },
        asPerformance: { de: 'AS Performance (Akt. Kollektiv)', en: 'AS Performance (Current Cohort)' }
    },
    axisLabels: {
        age: { de: 'Alter (Jahre)', en: 'Age (Years)' },
        patientCount: { de: 'Anzahl Patienten', en: 'Number of Patients' },
        lymphNodeCount: { de: 'Anzahl Lymphknoten', en: 'Number of Lymph Nodes' },
        metricValue: { de: 'Wert', en: 'Value' },
        metric: { de: 'Diagnostische Metrik', en: 'Diagnostic Metric' },
        sensitivity: { de: 'Sensitivität (RP Rate)', en: 'Sensitivity (TP Rate)' },
        oneMinusSpecificity: { de: '1 - Spezifität (FP Rate)', en: '1 - Specificity (FP Rate)' },
        probability: { de: 'Wahrscheinlichkeit', en: 'Probability' },
        shortAxisDiameter: { de: 'Kurzachsendurchmesser (mm)', en: 'Short Axis Diameter (mm)' }
    },
    legendLabels: {
        male: { de: 'Männlich', en: 'Male' },
        female: { de: 'Weiblich', en: 'Female' },
        unknownGender: { de: 'Unbekannt', en: 'Unknown' },
        direktOP: { de: 'Direkt OP', en: 'Upfront Surgery' },
        nRCT: { de: 'nRCT', en: 'nCRT' },
        nPositive: { de: 'N+', en: 'N+' },
        nNegative: { de: 'N-', en: 'N-' },
        asPositive: { de: 'AS+', en: 'AS+' },
        asNegative: { de: 'AS-', en: 'AS-' },
        t2Positive: { de: 'T2+', en: 'T2+' },
        t2Negative: { de: 'T2-', en: 'T2-' },
        avocadoSign: { de: 'Avocado Sign (AS)', en: 'Avocado Sign (AS)' },
        currentT2: { de: '{T2ShortName}', en: '{T2ShortName}' },
        benignLN: { de: 'Benigne LK', en: 'Benign LN' },
        malignantLN: { de: 'Maligne LK', en: 'Malignant LN' }
    },
    criteriaComparison: {
        title: { de: "Vergleich diagnostischer Güte verschiedener Methoden", en: "Comparison of Diagnostic Performance of Different Methods"},
        selectLabel: { de: "Kriteriensätze für Vergleich auswählen:", en: "Select criteria sets for comparison:"},
        tableHeaderSet: { de: "Methode / Kriteriensatz", en: "Method / Criteria Set"},
        tableHeaderSens: { de: "Sens.", en: "Sens."},
        tableHeaderSpez: { de: "Spez.", en: "Spec."},
        tableHeaderPPV: { de: "PPV", en: "PPV"},
        tableHeaderNPV: { de: "NPV", en: "NPV"},
        tableHeaderAcc: { de: "Acc.", en: "Acc."},
        tableHeaderAUC: { de: "AUC/BalAcc", en: "AUC/BalAcc"},
        showAppliedLabel: { de: "Aktuell angewandte Kriterien anzeigen", en: "Show currently applied criteria"}
    },
    excelExport: {
        datenLabel: "Datenliste (.xlsx)",
        auswertungLabel: "Auswertungstabelle (.xlsx)",
        statistikLabel: "Statistik Übersicht (.xlsx)",
        filteredDataLabel: "Gefilterte Daten (.xlsx)",
        zipLabel: "Alle Excel-Tabellen (.zip)"
    },
    singleChartDownload: {
        pngLabel: { de: "Als PNG herunterladen", en: "Download as PNG"},
        svgLabel: { de: "Als SVG herunterladen", en: "Download as SVG"}
    },
    publicationTableTitles: {
        asPerformance: {de: 'Tabelle 3: Diagnostische Güte - Avocado Sign (vs. N-Status)', en: 'Table 3: Diagnostic Performance - Avocado Sign (vs. N-Status)'},
        literaturT2Performance: {de: 'Tabelle 4: Diagnostische Güte - Literatur-basierte T2-Kriterien (vs. N-Status)', en: 'Table 4: Diagnostic Performance - Literature-Based T2 Criteria (vs. N-Status)'},
        optimierteT2Performance: {de: 'Tabelle 5: Diagnostische Güte - Optimierte T2-Kriterien (Ziel: [METRIC], vs. N-Status)', en: 'Table 5: Diagnostic Performance - Optimized T2 Criteria (Target: [METRIC], vs. N-Status)'},
        vergleichPerformance: {de: 'Tabelle 6: Paarweiser Vergleich der diagnostischen Güte (vs. N-Status)', en: 'Table 6: Pairwise Comparison of Diagnostic Performance (vs. N-Status)'}
    },
    publicationTableHeaders: {
        characteristic: {de: 'Merkmal', en: 'Characteristic'},
        studySet: {de: 'Studie / Kriterienset', en: 'Study / Criteria Set'},
        targetCohort: {de: 'Primäres Zielkollektiv (Anwendung)', en: 'Primary Target Cohort (Application)'},
        coreCriteria: {de: 'Kernkriterien (Kurzfassung)', en: 'Core Criteria (Summary)'},
        logic: {de: 'Logik', en: 'Logic'},
        method: {de: 'Methode', en: 'Method'},
        cohort: {de: 'Kollektiv', en: 'Cohort'},
        comparison: {de: 'Vergleich', en: 'Comparison'},
        pValueAUC: {de: 'p-Wert (AUC, DeLong)', en: 'p-value (AUC, DeLong)'},
        pValueAcc: {de: 'p-Wert (Acc, McNemar)', en: 'p-value (Acc, McNemar)'},
        sens: { de: 'Sens.', en: 'Sens.'},
        spez: { de: 'Spez.', en: 'Spec.'},
        acc: { de: 'Acc.', en: 'Acc.'},
        auc: { de: 'AUC/BalAcc', en: 'AUC/BalAcc'}
    },
    statMetrics: {
        signifikanzTexte: {
            SIGNIFIKANT: { de: "statistisch signifikant", en: "statistically significant"},
            NICHT_SIGNIFIKANT: { de: "statistisch nicht signifikant", en: "statistically not significant"}
        },
        orFaktorTexte: {
            ERHOEHT: { de: "erhöht", en: "increased"},
            VERRINGERT: { de: "verringert", en: "decreased"},
            UNVERAENDERT: { de: "unverändert", en: "unchanged"}
        },
        rdRichtungTexte: {
            HOEHER: { de: "höher", en: "higher"},
            NIEDRIGER: { de: "niedriger", en: "lower"},
            GLEICH: { de: "gleich", en: "equal"}
        },
        assoziationStaerkeTexte: {
            stark: { de: "stark", en: "strong"},
            moderat: { de: "moderat", en: "moderate"},
            schwach: { de: "schwach", en: "weak"},
            sehr_schwach: { de: "sehr schwach", en: "very weak"},
            nicht_bestimmbar: { de: "nicht bestimmbar", en: "not determinable"}
        }
    }
};

const TOOLTIP_CONTENT = {
    kollektivButtons: { description: {de: "Wählen Sie das Patientenkollektiv für die Analyse aus: Gesamt, nur primär Operierte (direkt OP) oder nur neoadjuvant Vorbehandelte (nRCT). Die Auswahl filtert die Datenbasis für alle Tabs.", en: "Select the patient cohort for analysis: Overall, only primary surgery (Upfront Surgery), or only neoadjuvant treated (nCRT). The selection filters the database for all tabs."} },
    headerStats: {
        kollektiv: {de: "Aktuell betrachtetes Patientenkollektiv.", en: "Currently selected patient cohort."},
        anzahlPatienten: {de: "Gesamtzahl der Patienten im ausgewählten Kollektiv.", en: "Total number of patients in the selected cohort."},
        statusN: {de: "Anteil der Patienten mit positivem (+) vs. negativem (-) histopathologischem Lymphknotenstatus (Referenzstandard) im ausgewählten Kollektiv.", en: "Proportion of patients with positive (+) vs. negative (-) histopathological lymph node status (reference standard) in the selected cohort."},
        statusAS: {de: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß Avocado Sign (AS) Vorhersage im ausgewählten Kollektiv.", en: "Proportion of patients with positive (+) vs. negative (-) lymph node status according to Avocado Sign (AS) prediction in the selected cohort."},
        statusT2: {de: "Anteil der Patienten mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß den aktuell **angewendeten und gespeicherten** T2-Kriterien (siehe Auswertungstab) für das ausgewählte Kollektiv.", en: "Proportion of patients with positive (+) vs. negative (-) lymph node status according to the currently **applied and saved** T2 criteria (see Evaluation tab) for the selected cohort."}
    },
    datenTable: {
        nr: { de: "Fortlaufende Nummer des Patienten.", en: "Patient identification number."},
        name: { de: "Nachname des Patienten (anonymisiert/kodiert).", en: "Patient's last name (anonymized/coded)."},
        vorname: { de: "Vorname des Patienten (anonymisiert/kodiert).", en: "Patient's first name (anonymized/coded)."},
        geschlecht: { de: "Geschlecht des Patienten (m/w).", en: "Patient's gender (m/f)."},
        alter: { de: "Alter des Patienten zum Zeitpunkt der MRT-Untersuchung in Jahren.", en: "Patient's age in years at the time of MRI examination."},
        therapie: { de: "Angewandte Therapie vor der Operation (nRCT: neoadjuvante Radiochemotherapie, direkt OP: keine Vorbehandlung).", en: "Applied therapy before surgery (nCRT: neoadjuvant chemoradiotherapy, Upfront Surgery: no pretreatment)."},
        n_as_t2: { de: "Direkter Vergleich des Lymphknotenstatus: N (Pathologie-Referenz), AS (Avocado Sign Vorhersage), T2 (Vorhersage basierend auf aktuell angewendeten Kriterien). Klicken Sie auf N, AS oder T2, um nach diesem spezifischen Status zu sortieren.", en: "Direct comparison of lymph node status: N (Pathology reference), AS (Avocado Sign prediction), T2 (Prediction based on currently applied criteria). Click on N, AS, or T2 to sort by this specific status."},
        bemerkung: { de: "Zusätzliche klinische oder radiologische Bemerkungen zum Patientenfall, falls vorhanden.", en: "Additional clinical or radiological remarks on the patient case, if available."},
        expandAll: { de: "Öffnet oder schließt die Detailansicht zu den T2-gewichteten Lymphknotenmerkmalen für alle Patienten in der aktuellen Tabellenansicht.", en: "Expands or collapses the detail view for T2-weighted lymph node characteristics for all patients in the current table view."},
        expandRow: { de: "Klicken Sie auf diese Zeile, um Details zu den morphologischen Eigenschaften der T2-gewichteten Lymphknoten dieses spezifischen Patienten anzuzeigen oder auszublenden.", en: "Click this row to show or hide details about the morphological properties of this specific patient's T2-weighted lymph nodes."}
    },
    auswertungTable: {
        nr: {de: "Fortlaufende Nummer des Patienten.", en: "Patient identification number."},
        name: {de: "Nachname des Patienten (anonymisiert/kodiert).", en: "Patient's last name (anonymized/coded)."},
        therapie: {de: "Angewandte Therapie vor der Operation.", en: "Applied therapy before surgery."},
        n_as_t2: {de: "Direkter Vergleich des Lymphknotenstatus: N (Pathologie-Referenz), AS (Avocado Sign Vorhersage), T2 (Vorhersage basierend auf aktuell angewendeten Kriterien). Klicken Sie auf N, AS oder T2, um nach diesem spezifischen Status zu sortieren.", en: "Direct comparison of lymph node status: N (Pathology reference), AS (Avocado Sign prediction), T2 (Prediction based on currently applied criteria). Click on N, AS, or T2 to sort by this specific status."},
        n_counts: {de: "Anzahl pathologisch positiver (N+) Lymphknoten / Gesamtzahl histopathologisch untersuchter Lymphknoten für diesen Patienten.", en: "Number of pathologically positive (N+) lymph nodes / Total number of histopathologically examined lymph nodes for this patient."},
        as_counts: {de: "Anzahl als positiv bewerteter Avocado Sign (AS+) Lymphknoten / Gesamtzahl im T1KM-MRT sichtbarer Lymphknoten für diesen Patienten.", en: "Number of Avocado Sign positive (AS+) lymph nodes / Total number of lymph nodes visible on T1c-MRI for this patient."},
        t2_counts: {de: "Anzahl als positiv bewerteter T2-Lymphknoten (gemäß aktuell angewendeter Kriterien) / Gesamtzahl im T2-MRT sichtbarer Lymphknoten für diesen Patienten.", en: "Number of T2-positive lymph nodes (according to currently applied criteria) / Total number of lymph nodes visible on T2-MRI for this patient."},
        expandAll: {de: "Öffnet oder schließt die Detailansicht der bewerteten T2-gewichteten Lymphknoten und der erfüllten Kriterien für alle Patienten in der aktuellen Tabellenansicht.", en: "Expands or collapses the detail view of the evaluated T2-weighted lymph nodes and the fulfilled criteria for all patients in the current table view."},
        expandRow: {de: "Klicken Sie auf diese Zeile, um die detaillierte Bewertung der einzelnen T2-gewichteten Lymphknoten dieses Patienten gemäß der aktuell angewendeten Kriterien anzuzeigen oder auszublenden. Erfüllte Positiv-Kriterien werden hervorgehoben.", en: "Click this row to show or hide the detailed evaluation of this patient's individual T2-weighted lymph nodes according to the currently applied criteria. Fulfilled positive criteria are highlighted."}
    },
    t2Logic: { description: {de: `Logische Verknüpfung der aktiven T2-Kriterien: <strong>UND</strong> (Ein Lymphknoten ist nur positiv, wenn ALLE aktivierten Kriterien erfüllt sind). <strong>ODER</strong> (Ein Lymphknoten ist positiv, wenn MINDESTENS EIN aktiviertes Kriterium erfüllt ist).`, en: `Logical operator for active T2 criteria: <strong>AND</strong> (A lymph node is positive only if ALL activated criteria are met). <strong>OR</strong> (A lymph node is positive if AT LEAST ONE activated criterion is met).`} },
    t2Size: { description: {de: `Größenkriterium: Lymphknoten mit einem Kurzachsendurchmesser <strong>größer oder gleich</strong> dem eingestellten Schwellenwert gelten als suspekt. Einstellbarer Bereich: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} - ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm. Aktivieren/Deaktivieren Sie das Kriterium mit der Checkbox.`, en: `Size criterion: Lymph nodes with a short axis diameter <strong>greater than or equal to</strong> the set threshold are considered suspicious. Adjustable range: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} - ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm. Activate/deactivate the criterion using the checkbox.`} },
    t2Form: { description: {de: "Formkriterium: Wählen Sie, welche Form ('rund' oder 'oval') als suspekt gilt. Ein Lymphknoten gilt als 'rund', wenn das Verhältnis Kurzachse zu Langachse nahe 1 ist. Aktivieren/Deaktivieren Sie das Kriterium mit der Checkbox.", en: "Shape criterion: Select which shape ('round' or 'oval') is considered suspicious. A lymph node is considered 'round' if the ratio of short axis to long axis is close to 1. Activate/deactivate the criterion using the checkbox."} },
    t2Kontur: { description: {de: "Konturkriterium: Wählen Sie, welche Kontur ('scharf' oder 'irregulär') als suspekt gilt. Aktivieren/Deaktivieren Sie das Kriterium mit der Checkbox.", en: "Border criterion: Select which border ('smooth' or 'irregular') is considered suspicious. Activate/deactivate the criterion using the checkbox."} },
    t2Homogenitaet: { description: {de: "Homogenitätskriterium: Wählen Sie, ob ein 'homogenes' oder 'heterogenes' Binnensignal auf T2w als suspekt gilt. Aktivieren/Deaktivieren Sie das Kriterium mit der Checkbox.", en: "Homogeneity criterion: Select whether a 'homogeneous' or 'heterogeneous' internal signal on T2w is considered suspicious. Activate/deactivate the criterion using the checkbox."} },
    t2Signal: { description: {de: "Signalkriterium: Wählen Sie, welche T2-Signalintensität ('signalarm', 'intermediär' oder 'signalreich') relativ zur umgebenden Muskulatur als suspekt gilt. Lymphknoten ohne eindeutig zuweisbares Signal (Signal='null') erfüllen dieses Kriterium nie. Aktivieren/Deaktivieren Sie das Kriterium mit der Checkbox.", en: "Signal criterion: Select which T2 signal intensity ('hypointense', 'intermediate', or 'hyperintense') relative to the surrounding muscle is considered suspicious. Lymph nodes with no clearly assignable signal (Signal='null') never meet this criterion. Activate/deactivate the criterion using the checkbox."} },
    t2Actions: {
        reset: {de: "Setzt die Logik und alle Kriterien auf die Standardeinstellungen zurück (siehe Konfiguration). Die Änderungen sind danach noch nicht angewendet.", en: "Resets the logic and all criteria to default settings (see configuration). Changes are not yet applied."},
        apply: {de: "Wendet die aktuell eingestellten T2-Kriterien und die Logik auf den gesamten Datensatz an. Dies aktualisiert die T2-Spalten in den Tabellen, alle statistischen Auswertungen und Diagramme. Die Einstellung wird zudem für zukünftige Sitzungen gespeichert.", en: "Applies the currently set T2 criteria and logic to the entire dataset. This updates the T2 columns in tables, all statistical evaluations, and charts. The setting is also saved for future sessions."}
    },
    t2CriteriaCard: { unsavedIndicator: {de: "Achtung: Es gibt nicht angewendete Änderungen an den T2-Kriterien oder der Logik. Klicken Sie auf 'Anwenden', um die Ergebnisse zu aktualisieren und die Einstellung zu speichern.", en: "Caution: There are unapplied changes to the T2 criteria or logic. Click 'Apply' to update the results and save the settings."} },
    t2MetricsOverview: {
        cardTitle: {de: "Kurzübersicht der diagnostischen Güte für die aktuell angewendeten und gespeicherten T2-Kriterien im Vergleich zum histopathologischen N-Status für das gewählte Kollektiv: [KOLLEKTIV].", en: "Brief overview of diagnostic performance for the currently applied and saved T2 criteria compared to the histopathological N-status for the selected cohort: [KOLLEKTIV]."},
        sens: {de: "Sensitivität (T2 vs. N)", en: "Sensitivity (T2 vs. N)"},
        spez: {de: "Spezifität (T2 vs. N)", en: "Specificity (T2 vs. N)"},
        ppv: {de: "PPV (T2 vs. N)", en: "PPV (T2 vs. N)"},
        npv: {de: "NPV (T2 vs. N)", en: "NPV (T2 vs. N)"},
        acc: {de: "Accuracy (T2 vs. N)", en: "Accuracy (T2 vs. N)"},
        balAcc: {de: "Balanced Accuracy (T2 vs. N)", en: "Balanced Accuracy (T2 vs. N)"},
        f1: {de: "F1-Score (T2 vs. N)", en: "F1-Score (T2 vs. N)"},
        auc: {de: "AUC (T2 vs. N)", en: "AUC (T2 vs. N)"}
     },
    bruteForceMetric: { description: {de: "Wählen Sie die Zielmetrik, die durch die Brute-Force-Suche maximiert werden soll. Der Vergleich erfolgt immer gegen den N-Status.<br><strong>Accuracy:</strong> Gesamtgenauigkeit.<br><strong>Balanced Accuracy:</strong> Mittelwert aus Sensitivität und Spezifität (sinnvoll bei unbalancierten Klassen).<br><strong>F1-Score:</strong> Harmonisches Mittel aus PPV und Sensitivität.<br><strong>PPV:</strong> Positiver Prädiktiver Wert.<br><strong>NPV:</strong> Negativer Prädiktiver Wert.", en: "Select the target metric to be maximized by the brute-force search. Comparison is always against N-status.<br><strong>Accuracy:</strong> Overall accuracy.<br><strong>Balanced Accuracy:</strong> Average of sensitivity and specificity (useful for imbalanced classes).<br><strong>F1-Score:</strong> Harmonic mean of PPV and sensitivity.<br><strong>PPV:</strong> Positive Predictive Value.<br><strong>NPV:</strong> Negative Predictive Value."} },
    bruteForceStart: { description: {de: "Startet die exhaustive Suche (Brute-Force) nach der optimalen Kombination von T2-Kriterien (aktive Kriterien, Werte, Logik), die die gewählte Zielmetrik maximiert. Dies testet alle sinnvollen Kombinationen und kann je nach Kollektivgröße einige Minuten dauern. Der Prozess läuft im Hintergrund.", en: "Starts the exhaustive search (brute-force) for the optimal combination of T2 criteria (active criteria, values, logic) that maximizes the selected target metric. This tests all meaningful combinations and may take several minutes depending on cohort size. The process runs in the background."} },
    bruteForceInfo: { description: {de: "Zeigt den Status des Optimierungs-Workers und das aktuell für die Analyse ausgewählte Patientenkollektiv an.", en: "Shows the status of the optimization worker and the currently selected patient cohort for analysis."} },
    bruteForceProgress: { description: {de: "Zeigt den Fortschritt der laufenden Optimierung an: Anzahl bereits getesteter Kombinationen von insgesamt zu testenden [TOTAL], sowie die bisher beste gefundene Metrik mit den zugehörigen Kriterien und der Logik.", en: "Shows the progress of the ongoing optimization: number of combinations already tested out of a total of [TOTAL] to be tested, as well as the best metric found so far with the associated criteria and logic."} },
    bruteForceResult: { description: {de: "Zeigt das Ergebnis der abgeschlossenen Optimierung an: die beste gefundene Kriterienkombination (Logik, aktive Kriterien, Werte) und den damit erreichten Wert der Zielmetrik für das analysierte Kollektiv.", en: "Shows the result of the completed optimization: the best found criteria combination (logic, active criteria, values) and the achieved value of the target metric for the analyzed cohort."} },
    bruteForceDetailsButton: { description: {de: "Öffnet ein separates Fenster (Modal), das eine sortierte Liste der Top 10 gefundenen Kriterienkombinationen (inklusive solcher mit gleichem Metrikwert) und weitere Details zur Optimierung anzeigt.", en: "Opens a separate window (modal) showing a sorted list of the top 10 found criteria combinations (including those with the same metric value) and further details about the optimization."} },
    bruteForceModal: { exportButton: {de: "Exportiert den detaillierten Bericht der Brute-Force-Optimierung, inklusive der Top 10 Ergebnisse und der Konfiguration, als formatierte Textdatei (.txt).", en: "Exports the detailed report of the brute-force optimization, including the top 10 results and configuration, as a formatted text file (.txt)."} },
    statistikLayout: { description: {de: "Wählen Sie die Anzeigeart für die statistischen Ergebnisse: 'Einzelansicht' zeigt die detaillierte Statistik für die global im Header ausgewählte Patientengruppe. 'Vergleich Aktiv' ermöglicht die Auswahl von zwei Kollektiven und zeigt deren Statistiken nebeneinander sowie zusätzliche statistische Tests zum Vergleich der Performanz zwischen den Gruppen an.", en: "Select the display mode for statistical results: 'Single View' shows detailed statistics for the patient group globally selected in the header. 'Comparison Active' allows selecting two cohorts and shows their statistics side-by-side, plus additional statistical tests to compare performance between groups."} },
    statistikKollektiv1: { description: {de: "Wählen Sie das erste Kollektiv für die statistische Auswertung bzw. den Vergleich (nur aktiv bei Layout 'Vergleich Aktiv').", en: "Select the first cohort for statistical evaluation or comparison (only active in 'Comparison Active' layout)."} },
    statistikKollektiv2: { description: {de: "Wählen Sie das zweite Kollektiv für den Vergleich (nur aktiv bei Layout 'Vergleich Aktiv').", en: "Select the second cohort for comparison (only active in 'Comparison Active' layout)."} },
    statistikToggleVergleich: { description: {de: "Schaltet zwischen der Ansicht für ein einzelnes, global gewähltes Kollektiv und der Vergleichsansicht zweier spezifisch wählbarer Kollektive um.", en: "Switches between the view for a single, globally selected cohort and the comparison view of two specifically selectable cohorts."} },
    deskriptiveStatistik: {
        cardTitle: { de: "Überblick über die demographischen Daten (Alter, Geschlecht), Therapieart und Verteilung der N-, AS- und T2-Status sowie Lymphknotenanzahlen im ausgewählten Kollektiv ([KOLLEKTIV]).", en: "Overview of demographic data (age, gender), therapy type, and distribution of N, AS, and T2 statuses, as well as lymph node counts in the selected cohort ([KOLLEKTIV])."},
        alterMedian: { description: {de: "Median des Alters: Der zentrale Wert, der die Patienten nach Alter in zwei gleich große Hälften teilt. Angegeben mit Minimum-Maximum und [Mittelwert ± Standardabweichung].", en: "Median age: The central value dividing patients by age into two equal halves. Given with Minimum-Maximum and [Mean ± Standard Deviation]."} },
        geschlecht: { description: {de: "Absolute Anzahl und prozentuale Verteilung der Geschlechter (männlich/weiblich) im Kollektiv.", en: "Absolute number and percentage distribution of genders (male/female) in the cohort."} },
        nStatus: { description: {de: "Absolute Anzahl und prozentualer Anteil der Patienten mit positivem (+) bzw. negativem (-) histopathologischem N-Status im Kollektiv.", en: "Absolute number and percentage of patients with positive (+) or negative (-) histopathological N-status in the cohort."} },
        asStatus: { description: {de: "Absolute Anzahl und prozentualer Anteil der Patienten mit positivem (+) bzw. negativem (-) vorhergesagtem AS-Status im Kollektiv.", en: "Absolute number and percentage of patients with positive (+) or negative (-) predicted AS-status in the cohort."} },
        t2Status: { description: {de: "Absolute Anzahl und prozentualer Anteil der Patienten mit positivem (+) bzw. negativem (-) vorhergesagtem T2-Status (basierend auf aktuell angewendeten Kriterien) im Kollektiv.", en: "Absolute number and percentage of patients with positive (+) or negative (-) predicted T2-status (based on currently applied criteria) in the cohort."} },
        lkAnzahlPatho: { description: {de: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Gesamtzahl histopathologisch untersuchter Lymphknoten pro Patient im Kollektiv.", en: "Median (Minimum-Maximum) [Mean ± Standard Deviation] of the total number of histopathologically examined lymph nodes per patient in the cohort."} },
        lkAnzahlPathoPlus: { description: {de: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Anzahl pathologisch positiver (N+) Lymphknoten pro Patient, *nur* bezogen auf die Patienten, die tatsächlich N+ waren.", en: "Median (Minimum-Maximum) [Mean ± Standard Deviation] of the number of pathologically positive (N+) lymph nodes per patient, *only* for patients who were actually N+."} },
        lkAnzahlAS: { description: {de: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Gesamtzahl im T1KM-MRT detektierter Avocado Sign Lymphknoten (AS gesamt) pro Patient.", en: "Median (Minimum-Maximum) [Mean ± Standard Deviation] of the total number of Avocado Sign lymph nodes (AS total) detected on T1c-MRI per patient."} },
        lkAnzahlASPlus: { description: {de: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Anzahl als positiv bewerteter Avocado Sign Lymphknoten (AS+) pro Patient, *nur* bezogen auf die Patienten, die AS+ waren.", en: "Median (Minimum-Maximum) [Mean ± Standard Deviation] of the number of Avocado Sign positive (AS+) lymph nodes per patient, *only* for patients who were AS+."} },
        lkAnzahlT2: { description: {de: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Gesamtzahl im T2-MRT detektierter Lymphknoten pro Patient.", en: "Median (Minimum-Maximum) [Mean ± Standard Deviation] of the total number of lymph nodes detected on T2-MRI per patient."} },
        lkAnzahlT2Plus: { description: {de: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Anzahl als positiv bewerteter T2-Lymphknoten (T2+, gemäß angewendeter Kriterien) pro Patient, *nur* bezogen auf die Patienten, die T2+ waren.", en: "Median (Minimum-Maximum) [Mean ± Standard Deviation] of the number of T2-positive lymph nodes (T2+, according to applied criteria) per patient, *only* for patients who were T2+."} },
        chartAge: { description: {de: "Histogramm der Altersverteilung der Patienten im Kollektiv [KOLLEKTIV].", en: "Histogram of age distribution of patients in cohort [KOLLEKTIV]."} },
        chartGender: { description: {de: "Tortendiagramm der Geschlechterverteilung (m/w) im Kollektiv [KOLLEKTIV].", en: "Pie chart of gender distribution (m/f) in cohort [KOLLEKTIV]."} }
    },
    diagnostischeGueteAS: { cardTitle: {de: "Diagnostische Gütekriterien für das Avocado Sign (AS) im Vergleich zur Histopathologie (N) als Referenzstandard für das Kollektiv [KOLLEKTIV]. Alle Werte inkl. 95% Konfidenzintervall.", en: "Diagnostic performance criteria for Avocado Sign (AS) compared to histopathology (N) as reference standard for cohort [KOLLEKTIV]. All values include 95% confidence interval."} },
    diagnostischeGueteT2: { cardTitle: {de: "Diagnostische Gütekriterien für die aktuell angewendeten T2-Kriterien im Vergleich zur Histopathologie (N) als Referenzstandard für das Kollektiv [KOLLEKTIV]. Alle Werte inkl. 95% Konfidenzintervall.", en: "Diagnostic performance criteria for the currently applied T2 criteria compared to histopathology (N) as reference standard for cohort [KOLLEKTIV]. All values include 95% confidence interval."} },
    statistischerVergleichASvsT2: { cardTitle: {de: "Direkter statistischer Vergleich der diagnostischen Leistung von AS vs. T2 (aktuell angewendete Kriterien) innerhalb desselben Kollektivs ([KOLLEKTIV]) mittels gepaarter Tests.", en: "Direct statistical comparison of diagnostic performance of AS vs. T2 (currently applied criteria) within the same cohort ([KOLLEKTIV]) using paired tests."} },
    assoziationEinzelkriterien: { cardTitle: {de: "Analyse der Assoziation zwischen dem AS-Status bzw. einzelnen T2-Merkmalen (unabhängig von Aktivierung) und dem histopathologischen N-Status (+/-) im Kollektiv [KOLLEKTIV]. Angegeben sind Odds Ratio (OR), Risk Difference (RD), Phi-Koeffizient und p-Werte aus geeigneten Tests.", en: "Analysis of the association between AS status or individual T2 features (regardless of activation) and the histopathological N status (+/-) in cohort [KOLLEKTIV]. Odds Ratio (OR), Risk Difference (RD), Phi coefficient, and p-values from appropriate tests are provided."} },
    vergleichKollektive: { cardTitle: {de: "Statistischer Vergleich der diagnostischen Leistung (Accuracy, AUC für AS und T2) zwischen Kollektiv [KOLLEKTIV1] und Kollektiv [KOLLEKTIV2] mittels Tests für unabhängige Stichproben.", en: "Statistical comparison of diagnostic performance (Accuracy, AUC for AS and T2) between cohort [KOLLEKTIV1] and cohort [KOLLEKTIV2] using tests for independent samples."} },
    criteriaComparisonTable: {
        cardTitle: { de: "Tabellarischer Vergleich der diagnostischen Güte verschiedener Methoden/Kriteriensätze (AS, aktuell angewandte T2, Studien) für das ausgewählte Kollektiv [KOLLEKTIV].", en: "Tabular comparison of diagnostic performance of different methods/criteria sets (AS, currently applied T2, studies) for the selected cohort [KOLLEKTIV]."},
        tableHeaderSet: { de: "Methode / Kriteriensatz", en: "Method / Criteria Set"},
        tableHeaderSens: { de: "Sensitivität: Anteil der korrekt als positiv erkannten N+ Fälle.", en: "Sensitivity: Proportion of correctly identified N+ cases."},
        tableHeaderSpez: { de: "Spezifität: Anteil der korrekt als negativ erkannten N- Fälle.", en: "Specificity: Proportion of correctly identified N- cases."},
        tableHeaderPPV: { de: "Positiver Prädiktiver Wert: Wahrscheinlichkeit für N+, wenn Testergebnis positiv.", en: "Positive Predictive Value: Probability of N+ if test result is positive."},
        tableHeaderNPV: { de: "Negativer Prädiktiver Wert: Wahrscheinlichkeit für N-, wenn Testergebnis negativ.", en: "Negative Predictive Value: Probability of N- if test result is negative."},
        tableHeaderAcc: { de: "Accuracy: Gesamtanteil korrekt klassifizierter Fälle.", en: "Accuracy: Overall proportion of correctly classified cases."},
        tableHeaderAUC: { de: "Area Under Curve / Balanced Accuracy: Maß für die Gesamt-Trennschärfe (0.5=Zufall, 1=perfekt).", en: "Area Under Curve / Balanced Accuracy: Measure of overall discriminative power (0.5=random, 1=perfect)."}
    },
    logisticRegressionCard: { cardTitle: {de: "Ergebnisse der logistischen Regression zur Modellierung der N+ Wahrscheinlichkeit basierend auf ausgewählten Prädiktoren (z.B. T2-Merkmale, Alter) für das Kollektiv [KOLLEKTIV]. (Experimentell)", en: "Results of logistic regression for modeling N+ probability based on selected predictors (e.g., T2 features, age) for cohort [KOLLEKTIV]. (Experimental)"} },
    rocCurveCard: { cardTitle: {de: "Receiver Operating Characteristic (ROC) Kurve für die Unterscheidung zwischen N+ und N- basierend auf {Variable} für das Kollektiv [KOLLEKTIV]. Zeigt Sensitivität vs. 1-Spezifität über verschiedene Schwellenwerte.", en: "Receiver Operating Characteristic (ROC) curve for discriminating between N+ and N- based on {Variable} for cohort [KOLLEKTIV]. Shows sensitivity vs. 1-specificity across various thresholds."} },
    praesentation: {
        viewSelect: { description: {de: "Wählen Sie die Datenansicht für den Präsentations-Tab: 'Avocado Sign (Daten)' zeigt die dynamisch berechneten Kernergebnisse für AS im aktuellen Kollektiv. 'AS vs. T2 (Vergleich)' ermöglicht einen dynamischen Vergleich von AS mit T2-Kriterien für das aktuell global gewählte Kollektiv.", en: "Select the data view for the Presentation tab: 'Avocado Sign (Data)' shows dynamically calculated key results for AS in the current cohort. 'AS vs. T2 (Comparison)' allows a dynamic comparison of AS with T2 criteria for the currently globally selected cohort."} },
        studySelect: { description: {de: "Wählen Sie eine Quelle für die T2-Kriterien, die mit dem Avocado Sign verglichen werden sollen: Entweder die aktuell in der App eingestellten ('Eingestellte T2 Kriterien') oder vordefinierte Kriteriensätze aus relevanten publizierten Studien. Die Auswahl aktualisiert die Info-Karte und den Vergleichs-Chart. Der Vergleich basiert immer auf dem aktuell im Header ausgewählten Patientenkollektiv.", en: "Select a source for the T2 criteria to be compared with the Avocado Sign: Either the currently set criteria in the app ('Applied T2 Criteria') or predefined criteria sets from relevant published studies. The selection updates the info card and the comparison chart. The comparison is always based on the currently selected patient cohort in the header."} },
        t2BasisInfoCard: {
            title: {de: "Details zur T2-Vergleichsbasis", en: "Details of T2 Comparison Basis"},
            description: {de: "Zeigt Details zu den aktuell für den Vergleich ausgewählten T2-Kriterien.", en: "Shows details of the T2 criteria currently selected for comparison."},
            reference: {de: "Quelle / Publikation der Kriterien.", en: "Source / Publication of the criteria."},
            patientCohort: {de: "Ursprüngliche Kohorte und Untersuchungstyp der Studie.", en: "Original cohort and study type."},
            investigationType: {de: "Untersuchungstyp der Originalstudie (Baseline oder Restaging)", en: "Investigation type of the original study (Baseline or Restaging)"},
            focus: {de: "Hauptfokus oder Fragestellung der Studie bezüglich dieser Kriterien.", en: "Main focus or research question of the study regarding these criteria."},
            keyCriteriaSummary: {de: "Zusammenfassung der angewendeten T2-Kriterien.", en: "Summary of the applied T2 criteria."}
        },
        comparisonTableCard: { description: {de: "Zeigt die numerischen Werte der diagnostischen Gütekriterien für den Vergleich von Avocado Sign vs. ausgewählter T2-Basis für das aktuelle Kollektiv.", en: "Shows the numerical values of the diagnostic performance criteria for the comparison of Avocado Sign vs. selected T2 basis for the current cohort."}},
        downloadDemographicsMD: { description: {de: "Lädt die Tabelle der demographischen Basisdaten (nur für Avocado-Sign-Ansicht) als Markdown-Datei (.md) herunter.", en: "Downloads the table of demographic baseline data (Avocado Sign view only) as a Markdown file (.md)."} },
        downloadPerformanceCSV: { description: {de: "Lädt die Tabelle der diagnostischen Güte (je nach Ansicht: AS oder AS vs. ausgewählte T2-Basis) als CSV-Datei (.csv) herunter.", en: "Downloads the diagnostic performance table (depending on view: AS or AS vs. selected T2 basis) as a CSV file (.csv)."} },
        downloadPerformanceMD: { description: {de: "Lädt die Tabelle der diagnostischen Güte (je nach Ansicht: AS oder AS vs. ausgewählte T2-Basis) als Markdown-Datei (.md) herunter.", en: "Downloads the diagnostic performance table (depending on view: AS or AS vs. selected T2 basis) as a Markdown file (.md)."} },
        downloadCompTestsMD: { description: {de: "Lädt die Tabelle der statistischen Vergleichstests (p-Werte für McNemar und DeLong für AS vs. ausgewählte T2-Basis) als Markdown-Datei (.md) herunter.", en: "Downloads the table of statistical comparison tests (p-values for McNemar and DeLong for AS vs. selected T2 basis) as a Markdown file (.md)."} },
        downloadCompChartPNG: { description: {de: "Lädt das Vergleichs-Balkendiagramm (AS vs. ausgewählte T2-Basis) als PNG-Datei herunter.", en: "Downloads the comparison bar chart (AS vs. selected T2 basis) as a PNG file."} },
        downloadCompChartSVG: { description: {de: "Lädt das Vergleichs-Balkendiagramm (AS vs. ausgewählte T2-Basis) als Vektor-SVG-Datei herunter.", en: "Downloads the comparison bar chart (AS vs. selected T2 basis) as a vector SVG file."} },
        downloadTablePNG: { description: {de: "Lädt die angezeigte Tabelle als PNG-Bilddatei herunter.", en: "Downloads the displayed table as a PNG image file."} },
        downloadCompTablePNG: { description: {de: "Lädt die Vergleichs-Metrik-Tabelle (AS vs. T2) als PNG-Datei herunter.", en: "Downloads the comparison metrics table (AS vs. T2) as a PNG file."} },
        asPurPerfTable: {
            kollektiv: {de: "Patientenkollektiv (Gesamt, Direkt OP, nRCT). N = Anzahl Patienten in der Gruppe.", en: "Patient cohort (Overall, Upfront Surgery, nCRT). N = Number of patients in the group."},
            sens: {de: "Sensitivität für AS (vs. N) in diesem Kollektiv.", en: "Sensitivity for AS (vs. N) in this cohort."},
            spez: {de: "Spezifität für AS (vs. N) in diesem Kollektiv.", en: "Specificity for AS (vs. N) in this cohort."},
            ppv: {de: "Positiver Prädiktiver Wert für AS (vs. N) in diesem Kollektiv.", en: "Positive Predictive Value for AS (vs. N) in this cohort."},
            npv: {de: "Negativer Prädiktiver Wert für AS (vs. N) in diesem Kollektiv.", en: "Negative Predictive Value for AS (vs. N) in this cohort."},
            acc: {de: "Accuracy für AS (vs. N) in diesem Kollektiv.", en: "Accuracy for AS (vs. N) in this cohort."},
            auc: {de: "AUC / Balanced Accuracy für AS (vs. N) in diesem Kollektiv.", en: "AUC / Balanced Accuracy for AS (vs. N) in this cohort."}
        },
        asVsT2PerfTable: {
            metric: {de: "Diagnostische Metrik.", en: "Diagnostic Metric."},
            asValue: {de: "Wert der Metrik für Avocado Sign (AS) (vs. N) im Kollektiv [KOLLEKTIV], inkl. 95% CI.", en: "Value of the metric for Avocado Sign (AS) (vs. N) in cohort [KOLLEKTIV], incl. 95% CI."},
            t2Value: {de: "Wert der Metrik für die ausgewählte T2-Basis ([T2_SHORT_NAME]) (vs. N) im Kollektiv [KOLLEKTIV], inkl. 95% CI.", en: "Value of the metric for the selected T2 basis ([T2_SHORT_NAME]) (vs. N) in cohort [KOLLEKTIV], incl. 95% CI."}
        },
        asVsT2TestTable: {
            test: {de: "Statistischer Test zum Vergleich von AS vs. [T2_SHORT_NAME].", en: "Statistical test for comparing AS vs. [T2_SHORT_NAME]."},
            statistic: {de: "Wert der Teststatistik.", en: "Value of the test statistic."},
            pValue: {de: "p-Wert des Tests. p < 0.05 bedeutet einen statistisch signifikanten Unterschied zwischen AS und [T2_SHORT_NAME] in Bezug auf die getestete Metrik (Accuracy oder AUC) im Kollektiv [KOLLEKTIV].", en: "p-value of the test. p < 0.05 indicates a statistically significant difference between AS and [T2_SHORT_NAME] regarding the tested metric (Accuracy or AUC) in cohort [KOLLEKTIV]."},
            method: {de: "Name des verwendeten statistischen Tests.", en: "Name of the statistical test used."}
        }
    },
    exportTab: {
        singleExports: {de: "Einzelexporte", en: "Single Exports"},
        exportPackages: {de: "Export-Pakete (.zip)", en: "Export Packages (.zip)"},
        description: {de: "Ermöglicht den Export von Analyseergebnissen, Tabellen und Diagrammen basierend auf dem aktuell gewählten Kollektiv ([KOLLEKTIV]) und den aktuell angewendeten T2-Kriterien.", en: "Allows exporting analysis results, tables, and charts based on the currently selected cohort ([KOLLEKTIV]) and the currently applied T2 criteria."},
        statsCSV: { description: {de: "Exportiert eine detaillierte Tabelle aller berechneten statistischen Metriken, Konfidenzintervalle und Testergebnisse aus dem Statistik-Tab als kommaseparierte Datei (.csv).", en: "Exports a detailed table of all calculated statistical metrics, confidence intervals, and test results from the Statistics tab as a comma-separated values file (.csv)."}, type: 'STATS_CSV', ext: "csv" },
        statsXLSX: { description: {de: "Exportiert die detaillierte Tabelle aller berechneten statistischen Metriken, Konfidenzintervalle und Testergebnisse aus dem Statistik-Tab als Excel-Datei (.xlsx).", en: "Exports the detailed table of all calculated statistical metrics, confidence intervals, and test results from the Statistics tab as an Excel file (.xlsx)."}, type: 'STATISTIK_XLSX', ext: "xlsx" },
        bruteForceTXT: { description: {de: "Exportiert den detaillierten Bericht der letzten Brute-Force-Optimierung (Top 10 Ergebnisse, Konfiguration, Laufzeit) als reine Textdatei (.txt), falls eine Optimierung durchgeführt wurde.", en: "Exports the detailed report of the last brute-force optimization (Top 10 results, configuration, runtime) as a plain text file (.txt), if an optimization was performed."}, type: 'BRUTEFORCE_TXT', ext: "txt" },
        deskriptivMD: { description: {de: "Exportiert die Tabelle der deskriptiven Statistik (aus dem Statistik-Tab) in einem Markdown-Format (.md), geeignet für Berichte.", en: "Exports the descriptive statistics table (from the Statistics tab) in Markdown format (.md), suitable for reports."}, type: 'DESKRIPTIV_MD', ext: "md" },
        datenMD: { description: {de: "Exportiert die aktuelle Datenliste (aus dem Daten-Tab) als Markdown-Tabelle (.md).", en: "Exports the current data list (from the Data tab) as a Markdown table (.md)."}, type: 'DATEN_MD', ext: "md" },
        datenXLSX: { description: {de: "Exportiert die aktuelle Datenliste (aus dem Daten-Tab) als Excel-Datei (.xlsx).", en: "Exports the current data list (from the Data tab) as an Excel file (.xlsx)."}, type: 'DATEN_XLSX', ext: "xlsx" },
        auswertungMD: { description: {de: "Exportiert die aktuelle Auswertungstabelle (aus dem Auswertung-Tab) mit den angewendeten T2-Ergebnissen als Markdown-Tabelle (.md).", en: "Exports the current evaluation table (from the Evaluation tab) with the applied T2 results as a Markdown table (.md)."}, type: 'AUSWERTUNG_MD', ext: "md" },
        auswertungXLSX: { description: {de: "Exportiert die aktuelle Auswertungstabelle (aus dem Auswertung-Tab) mit den angewendeten T2-Ergebnissen als Excel-Datei (.xlsx).", en: "Exports the current evaluation table (from the Evaluation tab) with the applied T2 results as an Excel file (.xlsx)."}, type: 'AUSWERTUNG_XLSX', ext: "xlsx" },
        filteredDataCSV: { description: {de: "Exportiert die zugrundeliegenden Rohdaten des aktuell ausgewählten und analysierten Kollektivs, inklusive der berechneten T2-Ergebnisse, als CSV-Datei (.csv).", en: "Exports the underlying raw data of the currently selected and analyzed cohort, including calculated T2 results, as a CSV file (.csv)."}, type: 'FILTERED_DATA_CSV', ext: "csv" },
        filteredDataXLSX: { description: {de: "Exportiert die zugrundeliegenden Rohdaten des aktuell ausgewählten und analysierten Kollektivs, inklusive der berechneten T2-Ergebnisse, als Excel-Datei (.xlsx).", en: "Exports the underlying raw data of the currently selected and analyzed cohort, including calculated T2 results, as an Excel file (.xlsx)."}, type: 'FILTERED_DATA_XLSX', ext: "xlsx" },
        comprehensiveReportHTML: { description: {de: "Generiert einen umfassenden Analysebericht als HTML-Datei, die alle wichtigen Statistiken, Konfigurationen und Diagramme zusammenfasst. Kann im Browser geöffnet und gedruckt werden.", en: "Generates a comprehensive analysis report as an HTML file, summarizing all important statistics, configurations, and charts. Can be opened and printed in a browser."}, type: 'COMPREHENSIVE_REPORT_HTML', ext: "html" },
        chartsPNG: { description: {de: "Exportiert alle aktuell sichtbaren Diagramme aus dem Statistik-, Auswertung- und Präsentationstab sowie ausgewählte Tabellen als einzelne, hochauflösende PNG-Bilddateien, gebündelt in einem ZIP-Archiv.", en: "Exports all currently visible charts from the Statistics, Evaluation, and Presentation tabs, as well as selected tables, as individual high-resolution PNG image files, bundled in a ZIP archive."}, type: 'PNG_ZIP', ext: "zip" },
        chartsSVG: { description: {de: "Exportiert alle aktuell sichtbaren Diagramme aus dem Statistik-, Auswertung- und Präsentationstab als einzelne, skalierbare Vektorgrafik-Dateien (SVG), gebündelt in einem ZIP-Archiv.", en: "Exports all currently visible charts from the Statistics, Evaluation, and Presentation tabs as individual scalable vector graphics files (SVG), bundled in a ZIP archive."}, type: 'SVG_ZIP', ext: "zip" },
        chartSinglePNG: { description: {de: "Exportiert das ausgewählte Diagramm als einzelne PNG-Datei.", en: "Exports the selected chart as a single PNG file."}, type: 'CHART_SINGLE_PNG', ext: "png"},
        chartSingleSVG: { description: {de: "Exportiert das ausgewählte Diagramm als einzelne SVG-Datei.", en: "Exports the selected chart as a single SVG file."}, type: 'CHART_SINGLE_SVG', ext: "svg"},
        tableSinglePNG: { description: {de: "Exportiert die ausgewählte Tabelle als einzelne PNG-Datei.", en: "Exports the selected table as a single PNG file."}, type: 'TABLE_PNG_EXPORT', ext: "png"},
        allZIP: { description: {de: "Exportiert alle verfügbaren Einzeldateien (Statistik-CSV, BruteForce-TXT, alle MDs, Gefilterte-Daten-CSV, HTML-Report) in einem einzigen ZIP-Archiv.", en: "Exports all available single files (Statistics CSV, BruteForce TXT, all MDs, Filtered Data CSV, HTML Report) in a single ZIP archive."}, type: 'ALL_ZIP', ext: "zip"},
        csvZIP: { description: {de: "Bündelt alle verfügbaren CSV-Dateien (Statistik, Gefilterte Daten) in einem ZIP-Archiv.", en: "Bundles all available CSV files (Statistics, Filtered Data) into a ZIP archive."}, type: 'CSV_ZIP', ext: "zip"},
        mdZIP: { description: {de: "Bündelt alle verfügbaren Markdown-Dateien (Deskriptiv, Daten, Auswertung, Publikations-Abschnitte) in einem ZIP-Archiv.", en: "Bundles all available Markdown files (Descriptive, Data, Evaluation, Publication Sections) into a ZIP archive."}, type: 'MD_ZIP', ext: "md"},
        pngZIP: { description: {de: "Identisch zum 'Alle Diagramme & Tabellen (PNG)' Einzel-Export.", en: "Identical to the 'All Charts & Tables (PNG)' single export."}, type: 'PNG_ZIP', ext: "zip"},
        svgZIP: { description: {de: "Identisch zum 'Alle Diagramme (SVG)' Einzel-Export.", en: "Identical to the 'All Charts (SVG)' single export."}, type: 'SVG_ZIP', ext: "zip"},
        xlsxZIP: { description: {de: "Bündelt alle verfügbaren Excel-Dateien in einem ZIP-Archiv.", en: "Bundles all available Excel files into a ZIP archive."}, type: 'XLSX_ZIP', ext: "zip"}
    },
    publikationTabTooltips: {
        spracheSwitch: { description: {de: "Wechselt die Sprache der Texte im Publikation-Tab zwischen Deutsch und Englisch.", en: "Switches the language of texts in the Publication tab between German and English."} },
        sectionSelect: { description: {de: "Wählen Sie den Abschnitt der wissenschaftlichen Publikation aus, für den Textvorschläge und relevante Daten/Grafiken angezeigt werden sollen.", en: "Select the section of the scientific publication for which text suggestions and relevant data/graphics should be displayed."} },
        bruteForceMetricSelect: { description: {de: "Wählen Sie die Zielmetrik, für deren Optimierungsergebnisse (via Brute-Force) die entsprechenden Statistiken im 'Ergebnisse'-Abschnitt des Publikation-Tabs dargestellt werden sollen.", en: "Select the target metric for which the optimization results (via brute-force) will be used to display corresponding statistics in the 'Results' section of the Publication tab."} },
        methoden: {
            studienanlage: {de: "Textvorschlag und relevante Informationen zum Studiendesign, der Ethik und der verwendeten Software.", en: "Text suggestion and relevant information on study design, ethics, and software used."},
            patientenkohorte: {de: "Textvorschlag und relevante Informationen zum Patientenkollektiv und der Datenbasis.", en: "Text suggestion and relevant information on the patient cohort and database."},
            mrtProtokoll: {de: "Textvorschlag und relevante Informationen zum MRT-Protokoll und zur Kontrastmittelgabe.", en: "Text suggestion and relevant information on the MRI protocol and contrast agent administration."},
            asDefinition: {de: "Textvorschlag und relevante Informationen zur Definition und Bewertung des Avocado Signs.", en: "Text suggestion and relevant information on the definition and assessment of the Avocado Sign."},
            t2Definition: {de: "Textvorschlag und relevante Informationen zur Definition und Bewertung der T2-Kriterien (benutzerdefiniert, Literatur, Brute-Force optimiert).", en: "Text suggestion and relevant information on the definition and assessment of T2 criteria (user-defined, literature-based, brute-force optimized)."},
            referenzstandard: {de: "Textvorschlag und relevante Informationen zum Referenzstandard (Histopathologie).", en: "Text suggestion and relevant information on the reference standard (histopathology)."},
            statistischeAnalyse: {de: "Textvorschlag und relevante Informationen zu den statistischen Analysemethoden.", en: "Text suggestion and relevant information on the statistical analysis methods."}
        },
        ergebnisse: {
            patientencharakteristika: {de: "Textvorschlag und relevante Tabellen/Diagramme zu den Patientencharakteristika.", en: "Text suggestion and relevant tables/charts on patient characteristics."},
            asPerformance: {de: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte des Avocado Signs.", en: "Text suggestion and relevant tables/charts on the diagnostic performance of the Avocado Sign."},
            literaturT2Performance: {de: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte der Literatur-basierten T2-Kriterien.", en: "Text suggestion and relevant tables/charts on the diagnostic performance of literature-based T2 criteria."},
            optimierteT2Performance: {de: "Textvorschlag und relevante Tabellen/Diagramme zur diagnostischen Güte der Brute-Force optimierten T2-Kriterien.", en: "Text suggestion and relevant tables/charts on the diagnostic performance of brute-force optimized T2 criteria."},
            vergleichPerformance: {de: "Textvorschlag und relevante Tabellen/Diagramme zum statistischen Vergleich der diagnostischen Güte zwischen Avocado Sign und den verschiedenen T2-Kriteriensets.", en: "Text suggestion and relevant tables/charts for the statistical comparison of diagnostic performance between the Avocado Sign and various T2 criteria sets."}
        }
    },
    statMetrics: {
        sens: { name: {de: "Sensitivität", en: "Sensitivity"}, description: {de: "Sensitivität ([METHODE] vs. N): Anteil der tatsächlich positiven Fälle (N+), die durch die Methode [METHODE] korrekt als positiv erkannt wurden.<br><i>Formel: RP / (RP + FN)</i>", en: "Sensitivity ([METHODE] vs. N): Proportion of actual positive cases (N+) correctly identified as positive by method [METHODE].<br><i>Formula: TP / (TP + FN)</i>"}, interpretation: {de: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der tatsächlich N+ Patienten korrekt (95% KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].", en: "Method [METHODE] correctly identified <strong>[WERT]</strong> of actual N+ patients (95% CI by [METHOD_CI]: [LOWER] – [UPPER]) in cohort [KOLLEKTIV]."} },
        spez: { name: {de: "Spezifität", en: "Specificity"}, description: {de: "Spezifität ([METHODE] vs. N): Anteil der tatsächlich negativen Fälle (N-), die durch die Methode [METHODE] korrekt als negativ erkannt wurden.<br><i>Formel: RN / (RN + FP)</i>", en: "Specificity ([METHODE] vs. N): Proportion of actual negative cases (N-) correctly identified as negative by method [METHODE].<br><i>Formula: TN / (TN + FP)</i>"}, interpretation: {de: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der tatsächlich N- Patienten korrekt (95% KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].", en: "Method [METHODE] correctly identified <strong>[WERT]</strong> of actual N- patients (95% CI by [METHOD_CI]: [LOWER] – [UPPER]) in cohort [KOLLEKTIV]."} },
        ppv: { name: {de: "Pos. Prädiktiver Wert (PPV)", en: "Positive Predictive Value (PPV)"}, description: {de: "PPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem positiven Testergebnis durch Methode [METHODE] tatsächlich krank (N+) ist.<br><i>Formel: RP / (RP + FP)</i>", en: "PPV ([METHODE] vs. N): Probability that a patient with a positive test result from method [METHODE] is actually diseased (N+).<br><i>Formula: TP / (TP + FP)</i>"}, interpretation: {de: "Wenn die Methode [METHODE] ein positives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N+ Status bei <strong>[WERT]</strong> (95% KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].", en: "If method [METHODE] yielded a positive result, the probability of an actual N+ status was <strong>[WERT]</strong> (95% CI by [METHOD_CI]: [LOWER] – [UPPER]) in cohort [KOLLEKTIV]."} },
        npv: { name: {de: "Neg. Prädiktiver Wert (NPV)", en: "Negative Predictive Value (NPV)"}, description: {de: "NPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Patient mit einem negativen Testergebnis durch Methode [METHODE] tatsächlich gesund (N-) ist.<br><i>Formel: RN / (RN + FN)</i>", en: "NPV ([METHODE] vs. N): Probability that a patient with a negative test result from method [METHODE] is actually healthy (N-).<br><i>Formula: TN / (TN + FN)</i>"}, interpretation: {de: "Wenn die Methode [METHODE] ein negatives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N- Status bei <strong>[WERT]</strong> (95% KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].", en: "If method [METHODE] yielded a negative result, the probability of an actual N- status was <strong>[WERT]</strong> (95% CI by [METHOD_CI]: [LOWER] – [UPPER]) in cohort [KOLLEKTIV]."} },
        acc: { name: {de: "Accuracy (Gesamtgenauigkeit)", en: "Accuracy"}, description: {de: "Accuracy ([METHODE] vs. N): Anteil aller Fälle, die durch die Methode [METHODE] korrekt klassifiziert wurden (sowohl positive als auch negative).<br><i>Formel: (RP + RN) / Gesamtanzahl</i>", en: "Accuracy ([METHODE] vs. N): Proportion of all cases correctly classified by method [METHODE] (both positive and negative).<br><i>Formula: (TP + TN) / Total Number</i>"}, interpretation: {de: "Die Methode [METHODE] klassifizierte insgesamt <strong>[WERT]</strong> aller Patienten korrekt (95% KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].", en: "Method [METHODE] correctly classified a total of <strong>[WERT]</strong> of all patients (95% CI by [METHOD_CI]: [LOWER] – [UPPER]) in cohort [KOLLEKTIV]."} },
        balacc: { name: {de: "Balanced Accuracy", en: "Balanced Accuracy"}, description: {de: "Balanced Accuracy ([METHODE] vs. N): Der Mittelwert aus Sensitivität und Spezifität.<br><i>Formel: (Sensitivität + Spezifität) / 2</i>", en: "Balanced Accuracy ([METHODE] vs. N): The average of sensitivity and specificity.<br><i>Formula: (Sensitivity + Specificity) / 2</i>"}, interpretation: {de: "Die Balanced Accuracy der Methode [METHODE], die Sensitivität und Spezifität gleich gewichtet, betrug <strong>[WERT]</strong> (95% KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].", en: "The Balanced Accuracy of method [METHODE], which equally weights sensitivity and specificity, was <strong>[WERT]</strong> (95% CI by [METHOD_CI]: [LOWER] – [UPPER]) in cohort [KOLLEKTIV]."} },
        f1: { name: {de: "F1-Score", en: "F1-Score"}, description: {de: "F1-Score ([METHODE] vs. N): Das harmonische Mittel aus PPV (Precision) und Sensitivität (Recall).<br><i>Formel: 2 * (PPV * Sensitivität) / (PPV + Sensitivität)</i>", en: "F1-Score ([METHODE] vs. N): The harmonic mean of PPV (Precision) and Sensitivity (Recall).<br><i>Formula: 2 * (PPV * Sensitivity) / (PPV + Sensitivity)</i>"}, interpretation: {de: "Der F1-Score für die Methode [METHODE], der Präzision und Sensitivität kombiniert, beträgt <strong>[WERT]</strong> (95% KI nach [METHOD_CI]: [LOWER] – [UPPER]) im Kollektiv [KOLLEKTIV].", en: "The F1-Score for method [METHODE], combining precision and sensitivity, is <strong>[WERT]</strong> (95% CI by [METHOD_CI]: [LOWER] – [UPPER]) in cohort [KOLLEKTIV]."} },
        auc: { name: {de: "Area Under Curve (AUC)", en: "Area Under Curve (AUC)"}, description: {de: "AUC ([METHODE] vs. N): Fläche unter der Receiver Operating Characteristic (ROC)-Kurve. Repräsentiert die Fähigkeit der Methode [METHODE], zufällig ausgewählte N+ und N- Patienten korrekt zu rangreihen. 0.5 entspricht Zufall, 1.0 perfekter Trennung.<br><i>Für binäre Tests (wie AS oder eine feste T2-Regel) ist AUC = Balanced Accuracy.</i>", en: "AUC ([METHODE] vs. N): Area under the Receiver Operating Characteristic (ROC) curve. Represents the ability of method [METHODE] to correctly rank randomly selected N+ and N- patients. 0.5 corresponds to random chance, 1.0 to perfect separation.<br><i>For binary tests (like AS or a fixed T2 rule), AUC = Balanced Accuracy.</i>"}, interpretation: {de: "Die AUC von <strong>[WERT]</strong> (95% KI nach [METHOD_CI]: [LOWER] – [UPPER]) deutet auf eine <strong>[BEWERTUNG]</strong> generelle Trennschärfe der Methode [METHODE] zwischen N+ und N- Fällen im Kollektiv [KOLLEKTIV] hin.", en: "An AUC of <strong>[WERT]</strong> (95% CI by [METHOD_CI]: [LOWER] – [UPPER]) indicates a <strong>[BEWERTUNG]</strong> overall discriminative power of method [METHODE] between N+ and N- cases in cohort [KOLLEKTIV]."} },
        mcnemar: { name: {de: "McNemar-Test", en: "McNemar's Test"}, description: {de: "Prüft auf einen signifikanten Unterschied in den diskordanten Paaren (Fälle, bei denen AS und [T2_SHORT_NAME] unterschiedliche Ergebnisse liefern) bei gepaarten Daten.<br><i>Nullhypothese: Anzahl(AS+/[T2_SHORT_NAME]-) = Anzahl(AS-/[T2_SHORT_NAME]+)</i>", en: "Tests for a significant difference in discordant pairs (cases where AS and [T2_SHORT_NAME] yield different results) in paired data.<br><i>Null hypothesis: Count(AS+/[T2_SHORT_NAME]-) = Count(AS-/[T2_SHORT_NAME]+)</i>"}, interpretation: {de: "Der McNemar-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die Fehlklassifizierungsraten von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden.", en: "McNemar's test yielded a p-value of <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. This suggests that the misclassification rates of AS and [T2_SHORT_NAME] in cohort [KOLLEKTIV] differ [SIGNIFIKANZ_TEXT]."} },
        delong: { name: {de: "DeLong-Test", en: "DeLong's Test"}, description: {de: "Vergleicht zwei AUC-Werte von ROC-Kurven, die auf denselben (gepaarten) Daten basieren, unter Berücksichtigung der Kovarianz.<br><i>Nullhypothese: AUC(AS) = AUC([T2_SHORT_NAME])</i>", en: "Compares two AUC values from ROC curves based on the same (paired) data, considering covariance.<br><i>Null hypothesis: AUC(AS) = AUC([T2_SHORT_NAME])</i>"}, interpretation: {de: "Der DeLong-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die AUC-Werte (bzw. Balanced Accuracies) von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden.", en: "DeLong's test yielded a p-value of <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. This suggests that the AUC values (or Balanced Accuracies) of AS and [T2_SHORT_NAME] in cohort [KOLLEKTIV] differ [SIGNIFIKANZ_TEXT]."} },
        phi: { name: {de: "Phi-Koeffizient (φ)", en: "Phi Coefficient (φ)"}, description: {de: "Maß für die Stärke und Richtung des Zusammenhangs zwischen zwei binären Variablen (z.B. Vorhandensein von Merkmal [MERKMAL] und N-Status). Wertebereich von -1 bis +1.", en: "Measure of the strength and direction of association between two binary variables (e.g., presence of feature [MERKMAL] and N-status). Range from -1 to +1."}, interpretation: {de: "Der Phi-Koeffizient von <strong>[WERT]</strong> deutet auf einen <strong>[STAERKE]</strong> Zusammenhang zwischen dem Merkmal [MERKMAL] und dem N-Status im Kollektiv [KOLLEKTIV] hin.", en: "The Phi coefficient of <strong>[WERT]</strong> indicates a <strong>[STAERKE]</strong> association between feature [MERKMAL] and N-status in cohort [KOLLEKTIV]."} },
        rd: { name: {de: "Risk Difference (RD)", en: "Risk Difference (RD)"}, description: {de: "Absolute Differenz in der Wahrscheinlichkeit (Risiko) für N+ zwischen Patienten mit und ohne das Merkmal [MERKMAL].<br><i>Formel: P(N+|Merkmal+) - P(N+|Merkmal-)</i>", en: "Absolute difference in the probability (risk) of N+ between patients with and without feature [MERKMAL].<br><i>Formula: P(N+|Feature+) - P(N+|Feature-)</i>"}, interpretation: {de: "Das Risiko für N+ war um <strong>[WERT]%</strong> absolut [HOEHER_NIEDRIGER] bei Patienten mit dem Merkmal [MERKMAL] verglichen mit Patienten ohne dieses Merkmal (95% KI nach [METHOD_CI]: [LOWER]% – [UPPER]%) im Kollektiv [KOLLEKTIV].", en: "The risk of N+ was <strong>[WERT]%</strong> absolutely [HOEHER_NIEDRIGER] in patients with feature [MERKMAL] compared to patients without this feature (95% CI by [METHOD_CI]: [LOWER]% – [UPPER]%) in cohort [KOLLEKTIV]."} },
        or: { name: {de: "Odds Ratio (OR)", en: "Odds Ratio (OR)"}, description: {de: "Quotient der Odds für N+ bei Vorhandensein vs. Abwesenheit des Merkmals [MERKMAL].<br><i>Formel: Odds(N+|Merkmal+)/Odds(N+|Merkmal-)</i><br>OR > 1 bedeutet erhöhte Odds, OR < 1 verringerte Odds.", en: "Ratio of the odds of N+ in the presence vs. absence of feature [MERKMAL].<br><i>Formula: Odds(N+|Feature+)/Odds(N+|Feature-)</i><br>OR > 1 means increased odds, OR < 1 means decreased odds."}, interpretation: {de: "Die Chance (Odds) für einen N+ Status war bei Patienten mit dem Merkmal [MERKMAL] um den Faktor <strong>[WERT]</strong> [FAKTOR_TEXT] im Vergleich zu Patienten ohne dieses Merkmal (95% KI nach [METHOD_CI]: [LOWER] – [UPPER], p=[P_WERT], [SIGNIFIKANZ]) im Kollektiv [KOLLEKTIV].", en: "The odds of N+ status in patients with feature [MERKMAL] were <strong>[WERT]</strong> times [FAKTOR_TEXT] compared to patients without this feature (95% CI by [METHOD_CI]: [LOWER] – [UPPER], p=[P_WERT], [SIGNIFIKANZ]) in cohort [KOLLEKTIV]."} },
        fisher: { name: {de: "Fisher's Exact Test", en: "Fisher's Exact Test"}, description: {de: "Exakter Test zur Prüfung auf einen signifikanten Zusammenhang zwischen zwei kategorialen Variablen (z.B. Merkmal [MERKMAL] vs. N-Status).", en: "Exact test to examine the association between two categorical variables (e.g., feature [MERKMAL] vs. N-status)."}, interpretation: {de: "Der exakte Test nach Fisher ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>, was auf einen [SIGNIFIKANZ_TEXT] Zusammenhang zwischen dem Merkmal [MERKMAL] und dem N-Status im Kollektiv [KOLLEKTIV] hindeutet.", en: "Fisher's exact test yielded a p-value of <strong>[P_WERT] ([SIGNIFIKANZ])</strong>, indicating a [SIGNIFIKANZ_TEXT] association between feature [MERKMAL] and N-status in cohort [KOLLEKTIV]."} },
        mannwhitney: { name: {de: "Mann-Whitney-U-Test", en: "Mann-Whitney U Test"}, description: {de: "Nichtparametrischer Test zum Vergleich der zentralen Tendenz (Median) einer Variable (z.B. '[VARIABLE]') zwischen zwei unabhängigen Gruppen (z.B. N+ vs. N-).", en: "Non-parametric test to compare the central tendency (median) of a variable (e.g., '[VARIABLE]') between two independent groups (e.g., N+ vs. N-)."}, interpretation: {de: "Der Mann-Whitney-U-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies zeigt [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Variable '[VARIABLE]' zwischen N+ und N- Patienten im Kollektiv [KOLLEKTIV].", en: "The Mann-Whitney U test yielded a p-value of <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. This indicates a [SIGNIFIKANZ_TEXT] difference in the distribution of variable '[VARIABLE]' between N+ and N- patients in cohort [KOLLEKTIV]."} },
        ci95: { name: {de: "95% Konfidenzintervall (CI)", en: "95% Confidence Interval (CI)"}, description: {de: "Der Wertebereich, der den wahren (unbekannten) Wert der Population für die berechnete Metrik mit einer Wahrscheinlichkeit von 95% überdeckt.<br><i>Methode: [METHOD_CI]</i>", en: "The range of values that, with 95% probability, contains the true (unknown) population value for the calculated metric.<br><i>Method: [METHOD_CI]</i>"}, interpretation: {de: "Basierend auf den Daten liegt der wahre Wert der Metrik mit 95%iger Sicherheit zwischen [LOWER] und [UPPER].", en: "Based on the data, the true value of the metric is between [LOWER] and [UPPER] with 95% confidence."} },
        konfusionsmatrix: { description: {de: "Kreuztabelle, die die Klassifikationsergebnisse der Methode [METHODE] mit dem tatsächlichen N-Status vergleicht: Richtig Positive (RP), Falsch Positive (FP), Falsch Negative (FN), Richtig Negative (RN).", en: "Cross-tabulation comparing the classification results of method [METHODE] with the actual N-status: True Positives (TP), False Positives (FP), False Negatives (FN), True Negatives (TN)."} },
        accComp: { name: {de: "Accuracy Vergleich", en: "Accuracy Comparison"}, description: {de: "Vergleicht die Accuracy der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels Fisher's Exact Test.", en: "Compares the accuracy of method [METHODE] between two independent cohorts ([KOLLEKTIV1] vs. [KOLLEKTIV2]) using Fisher's Exact Test."}, interpretation: {de: "Der Unterschied in der Accuracy der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT]).", en: "The difference in accuracy of method [METHODE] between cohorts [KOLLEKTIV1] and [KOLLEKTIV2] is <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])."} },
        aucComp: { name: {de: "AUC Vergleich", en: "AUC Comparison"}, description: {de: "Vergleicht die AUC der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels eines Z-Tests.", en: "Compares the AUC of method [METHODE] between two independent cohorts ([KOLLEKTIV1] vs. [KOLLEKTIV2]) using a Z-test."}, interpretation: {de: "Der Unterschied in der AUC der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT]).", en: "The difference in AUC of method [METHODE] between cohorts [KOLLEKTIV1] and [KOLLEKTIV2] is <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])."} },
        logisticRegressionFit: { name: {de: "Modellanpassung (Log. Regression)", en: "Model Fit (Log. Regression)"}, description: {de: "Güte der Anpassung des logistischen Regressionsmodells an die Daten.", en: "Goodness of fit of the logistic regression model to the data."}, interpretation: {de: "Das Modell zeigt eine [BEWERTUNG_FIT] Anpassung an die Daten.", en: "The model shows a [BEWERTUNG_FIT] fit to the data."}},
        logisticRegressionCoef: { name: {de: "Koeffizient (Log. Regression)", en: "Coefficient (Log. Regression)"}, description: {de: "Geschätzter Koeffizient für den Prädiktor [PREDICTOR]. Gibt die Veränderung der Log-Odds für N+ pro Einheitsänderung des Prädiktors an.", en: "Estimated coefficient for predictor [PREDICTOR]. Indicates the change in log-odds of N+ per unit change in the predictor."}, interpretation: {de: "Der Koeffizient für [PREDICTOR] beträgt <strong>[COEF_VALUE]</strong> (p=[P_WERT], [SIGNIFIKANZ]), was auf einen [SIGNIFIKANZ_TEXT] Einfluss auf die N+ Wahrscheinlichkeit hindeutet.", en: "The coefficient for [PREDICTOR] is <strong>[COEF_VALUE]</strong> (p=[P_WERT], [SIGNIFIKANZ]), indicating a [SIGNIFIKANZ_TEXT] influence on N+ probability."}},
        rocCurvePlot: { description: {de: "Zeigt die ROC-Kurve für {Variable}. Die Diagonale repräsentiert zufällige Klassifikation (AUC=0.5). Eine Kurve näher an der oberen linken Ecke bedeutet bessere Leistung.", en: "Shows the ROC curve for {Variable}. The diagonal represents random classification (AUC=0.5). A curve closer to the upper left corner indicates better performance."}},
        defaultP: { interpretation: { de: `Der berechnete p-Wert beträgt <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Bei einem Signifikanzniveau von ${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL} ist das Ergebnis <strong>[SIGNIFIKANZ_TEXT]</strong>.`, en: `The calculated p-value is <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. At a significance level of ${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL}, the result is <strong>[SIGNIFIKANZ_TEXT]</strong>.`} }
    }
};

deepFreeze(UI_TEXTS);
deepFreeze(TOOLTIP_CONTENT);
