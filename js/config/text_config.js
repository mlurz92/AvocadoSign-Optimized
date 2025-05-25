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
            referenzen: 'Referenzen',
            sectionsNavTitle: 'Abschnitte'
        },
        subSectionLabels: {
            studienanlage: 'Studiendesign und Ethik',
            patientenkollektiv: 'Patientenkollektiv',
            mrtProtokoll: 'MRT-Protokoll & Kontrastmittelgabe',
            asDefinition: 'Definition & Bewertung Avocado Sign',
            t2Definition: 'Definition & Bewertung T2-Kriterien',
            referenzstandard: 'Referenzstandard (Histopathologie)',
            statistischeAnalyse: 'Statistische Analyse',
            patientencharakteristika: 'Patientencharakteristika',
            asPerformance: 'Diagnostische Güte: Avocado Sign',
            literaturT2Performance: 'Diagnostische Güte: Literatur-T2-Kriterien',
            optimierteT2Performance: 'Diagnostische Güte: Optimierte T2-Kriterien (Brute-Force)',
            vergleichPerformance: 'Vergleich: AS vs. T2-Kriterien'
        },
        bruteForceMetricSelectLabel: 'Optimierungsmetrik für T2 (BF):',
        bruteForceMetricLabels: {
            balancedAccuracy: 'Balanced Accuracy',
            accuracy: 'Accuracy',
            f1Score: 'F1-Score',
            ppv: 'Positiver Prädiktiver Wert (PPV)',
            npv: 'Negativer Prädiktiver Wert (NPV)'
        },
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
        },
        noPatientDataForTable: 'Keine ausreichenden Patientendaten für Tabelle verfügbar.',
        noPerformanceData: 'Keine Gütedaten für diese Sektion verfügbar.',
        noValidData: 'Keine validen Daten',
        noValidDataOrNotApplicable: 'Keine validen Daten oder nicht anwendbar',
        noSubsectionsDefined: 'Keine Unterabschnitte für Hauptabschnitt \'{SECTION_ID}\' definiert.',
        contentGenerationPending: 'Inhalt für diesen Unterabschnitt (ID: {SUB_SECTION_ID}, Sprache: {LANG}) wird noch generiert.',
        noSectionSelected: 'Bitte wählen Sie einen Abschnitt aus der Navigation.',
        bfShortLabelForChart: 'BF-T2 ({METRIC_NAME_SHORT}.)'
    },
    publicationTextGeneratorSnippets: { // Behält Struktur aus vorherigem Schritt bei
        methodenStudienanlage: {
            p1: "Diese Studie wurde als retrospektive Analyse prospektiv erhobener Daten eines monozentrischen Patientenkollektivs mit histologisch gesichertem Rektumkarzinom konzipiert. Das Studienkollektiv und die zugrundeliegenden Bilddatensätze sind identisch mit jenen der initialen \"Avocado Sign\" Studie ({STUDY_REFERENCE}). Primäres Ziel der vorliegenden Untersuchung war der Vergleich der diagnostischen Güte des Avocado Signs mit etablierten und optimierten T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status).",
            p2: "Alle Analysen wurden mittels einer speziell für diese und zukünftige Studien entwickelten, interaktiven Webanwendung ({APP_NAME} v{APP_VERSION}) durchgeführt. Dieses Werkzeug ermöglicht die flexible Definition und Anwendung von T2-Kriteriensets, eine automatisierte Optimierung von Kriterienkombinationen mittels eines Brute-Force-Algorithmus sowie eine umfassende statistische Auswertung und Visualisierung der Ergebnisse. Die Studie wurde in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki durchgeführt. Das Studienprotokoll wurde von der lokalen Ethikkommission genehmigt ({ETHICS_VOTE}). Aufgrund des retrospektiven Charakters der Analyse auf anonymisierten Daten wurde von der Ethikkommission auf ein erneutes Einholen eines schriftlichen Einverständnisses der Patienten für diese spezifische Analyse verzichtet, da dieses bereits im Rahmen der Primärstudie erteilt wurde."
        },
        methodenPatientenkollektiv: {
            p1: "Das Studienkollektiv umfasste {ANZAHL_GESAMT} konsekutive Patienten mit histologisch gesichertem Rektumkarzinom, die zwischen Januar {JAHR_START} und November {JAHR_ENDE} am {STUDIENORT} behandelt und in die initiale Avocado-Sign-Studie eingeschlossen wurden. Davon erhielten {ANZAHL_NRCT} Patienten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während {ANZAHL_DIREKT_OP} Patienten primär operiert wurden (Direkt-OP-Gruppe). Das mediane Alter im Gesamtkollektiv betrug {ALTER_MEDIAN} {JAHRE_LABEL} ({ALTER_RANGE_TEXT}), und {ANTEIL_MAENNER_PROZENT} ({ANZAHL_MAENNER}/{ANZAHL_PATIENTEN_CHAR}) der Patienten waren männlich. Detaillierte Patientencharakteristika, stratifiziert nach Behandlungsgruppen, sind in {TABELLE_1_REF} dargestellt.",
            p2: "Die Einschlusskriterien für die Primärstudie waren ein Alter von mindestens 18 Jahren und ein histologisch bestätigtes Rektumkarzinom. Ausschlusskriterien umfassten nicht resektable Tumoren und Kontraindikationen für eine MRT-Untersuchung. Für die vorliegende Analyse wurden alle Patienten der Primärstudie berücksichtigt, für die vollständige Datensätze bezüglich der T2-Lymphknotenmerkmale vorlagen.",
            alterRangeText: "Range: {ALTER_MIN}–{ALTER_MAX}",
            jahreLabel: "Jahre",
            tabelle1Ref: "Tabelle 1"
        },
        methodenMRTProtokoll: {
            p1: "Alle MRT-Untersuchungen wurden an einem {MRT_SYSTEM} unter Verwendung von {SPULEN_INFO} durchgeführt. Das standardisierte Bildgebungsprotokoll umfasste {T2_SEQUENZ_DETAILS} sowie {DWI_INFO}. Für die Bewertung des Avocado Signs wurde, wie in der Primärstudie beschrieben, {T1KM_SEQUENZ_DETAILS} akquiriert.",
            p2: "Ein {KONTRASTMITTEL_INFO} wurde gewichtsadaptiert ({KONTRASTMITTEL_DOSIERUNG}) intravenös verabreicht. Die kontrastmittelverstärkten Aufnahmen erfolgten unmittelbar nach vollständiger Applikation des Kontrastmittels. {BUSCOPAN_INFO} wurde zu Beginn und bei Bedarf im Verlauf jeder Untersuchung zur Reduktion von Bewegungsartefakten appliziert. Das Bildgebungsprotokoll war für die primäre Staging-Untersuchung und die Restaging-Untersuchung (bei Patienten der nRCT-Gruppe) identisch."
        },
        methodenASDefinition: {
            p1: "Das Avocado Sign wurde, wie in der Originalstudie ({AS_REFERENCE}) definiert, auf den kontrastmittelverstärkten T1-gewichteten Bildern evaluiert. Es ist charakterisiert als ein klar abgrenzbarer, hypointenser Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens, unabhängig von dessen Größe oder Form. Die Bewertung erfolgte für alle im T1KM-MRT sichtbaren mesorektalen Lymphknoten. Ein Patient wurde als Avocado-Sign-positiv (AS+) eingestuft, wenn mindestens ein Lymphknoten dieses Zeichen aufwies. Die Bildanalyse wurde von {RADIOLOGEN_INFO_AS}, die bereits die Primärstudie durchführten, unabhängig und verblindet gegenüber den histopathologischen Ergebnissen und den T2-Merkmalen vorgenommen. Diskrepanzen wurden im Konsens mit einem dritten, ebenfalls erfahrenen Radiologen gelöst."
        },
        methodenT2Definition: {
            p1: "Die morphologischen T2-gewichteten Kriterien (Größe [Kurzachse in mm], Form ['rund', 'oval'], Kontur ['scharf', 'irregulär'], Homogenität ['homogen', 'heterogen'] und Signalintensität ['signalarm', 'intermediär', 'signalreich']) wurden für jeden im hochauflösenden T2w-MRT sichtbaren mesorektalen Lymphknoten von {RADIOLOGEN_INFO_T2} erfasst, die auch das Avocado Sign bewerteten. Die Bewertung erfolgte konsensbasiert und verblindet gegenüber dem pathologischen N-Status und dem Avocado-Sign-Status.",
            p2: "Für den Vergleich der diagnostischen Güte wurden folgende T2-Kriteriensets herangezogen:",
            p3: "Ein Lymphknoten wurde als T2-positiv für ein gegebenes Kriterienset gewertet, wenn er die spezifischen Bedingungen dieses Sets erfüllte. Ein Patient galt als T2-positiv, wenn mindestens ein Lymphknoten gemäß dem jeweiligen Kriterienset als positiv bewertet wurde.",
            literaturBasiertHeading: "Literatur-basierte T2-Kriteriensets",
            literaturBasiertIntro: "Eine Auswahl etablierter Kriterien aus der Fachliteratur wurde implementiert und auf die entsprechenden Subgruppen bzw. das Gesamtkollektiv unseres Datensatzes angewendet (Details siehe Tabelle 2):",
            kohAnwendung: "Dieses Set wurde in unserer Analyse auf das Gesamtkollektiv angewendet.",
            barbaroAnwendung: "Dieses Set wurde spezifisch für das nRCT-Kollektiv (Restaging) evaluiert.",
            esgarAnwendung: "Dieses Set wurde primär auf das Direkt-OP-Kollektiv (Primärstaging) angewendet.",
            kohDescFallback: "Irreguläre Kontur ODER heterogenes Signal",
            barbaroDescFallback: "Kurzachse ≥ 2,3mm",
            esgarDescFallback: "Komplexe größenabhängige morphologische Regeln",
            bfOptimiertHeading: "Brute-Force optimierte T2-Kriterien",
            bfOptimiertIntro: "Mittels eines im Analyse-Tool implementierten Brute-Force-Algorithmus wurden für jedes der drei Hauptkollektive (Gesamt, Direkt OP, nRCT) diejenigen Kombinationen aus den fünf T2-Merkmalen und einer UND/ODER-Logik identifiziert, welche die primäre Zielmetrik dieser Studie – die <strong>{BF_ZIEL_METRIC_LABEL}</strong> – maximieren. Die resultierenden, für jedes Kollektiv spezifisch optimierten Kriteriensets waren:",
            targetMetricLabel: "Zielmetrik",
            achievedValueLabel: "Erreichter Wert",
            noBFOptResults: "Keine Optimierungsergebnisse für Zielmetrik '{BF_ZIEL_METRIC_LABEL}' verfügbar oder nicht berechnet.",
            aktuellEingestelltHeading: "Im Analyse-Tool aktuell eingestellte T2-Kriterien",
            aktuellEingestelltIntro: "Für explorative Zwecke und zur Demonstration der Flexibilität des Analyse-Tools können benutzerdefinierte Kriterien konfiguriert werden. Für die vorliegende Publikation sind die unter Punkt 1 und 2 genannten Kriterien maßgeblich. Die aktuell im Tool eingestellten Kriterien zum Zeitpunkt der finalen Analyse waren:"
        },
        methodenReferenzstandard: {
            p1: "Die histopathologische Untersuchung der Operationspräparate nach totaler mesorektaler Exzision (TME) diente als Referenzstandard für den Lymphknotenstatus. Alle mesorektalen Lymphknoten wurden von erfahrenen Pathologen gemäß den etablierten Standardprotokollen aufgearbeitet und mikroskopisch bewertet. Der N-Status eines Patienten wurde als positiv (N+) definiert, wenn mindestens ein Lymphknoten histologisch als metastatisch befallen identifiziert wurde. Andernfalls galt der Patient als N-negativ (N0)."
        },
        methodenStatistischeAnalyse: {
            p1: "Die deskriptive Statistik umfasste die Berechnung von Medianen, Mittelwerten, Standardabweichungen (SD), Minima und Maxima für kontinuierliche Variablen sowie absolute Häufigkeiten und Prozentanteile für kategoriale Daten. Die diagnostische Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) wurde anhand von Sensitivität, Spezifität, positivem prädiktiven Wert (PPV), negativem prädiktiven Wert (NPV), Accuracy (ACC), Balanced Accuracy (BalAcc) und der Fläche unter der Receiver Operating Characteristic-Kurve (AUC) – bei binären Tests äquivalent zur BalAcc – evaluiert. Für diese Metriken wurden zweiseitige 95%-Konfidenzintervalle (KI) berechnet. Für Proportionen (Sensitivität, Spezifität, PPV, NPV, Accuracy) wurde das {WILSON_SCORE_METHOD_NAME} verwendet. Für BalAcc (AUC) und den F1-Score wurde die Bootstrap-Perzentil-Methode mit {BOOTSTRAP_N} Replikationen angewendet.",
            p2: "Der statistische Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe (gepaarte Daten) erfolgte mittels des McNemar-Tests für gepaarte nominale Daten bzw. des DeLong-Tests für den Vergleich von AUC-Werten. Der Vergleich von Performance-Metriken zwischen unabhängigen Kollektiven (z.B. Direkt-OP vs. nRCT-Gruppe) erfolgte mittels Fisher's Exact Test für Raten (wie Accuracy) und mittels Z-Test für den Vergleich von AUC-Werten basierend auf deren Bootstrap-Standardfehlern. {P_WERT_BEDINGUNG} wurde als statistisch signifikant interpretiert. Alle statistischen Analysen wurden mit der oben genannten, speziell entwickelten Webanwendung ({APP_NAME} v{APP_VERSION}) durchgeführt, die auf Standardbibliotheken für statistische Berechnungen und JavaScript basiert.",
            pWertBedingung: "Ein p-Wert < {ALPHA_TEXT}"
        },
        ergebnissePatientencharakteristika: {
            p1: "Die Charakteristika der {ANZAHL_GESAMT} in die Studie eingeschlossenen Patienten sind in {TABELLE_1_REF} zusammengefasst. Das Gesamtkollektiv bestand aus {ANZAHL_DIREKT_OP} Patienten, die primär operiert wurden (Direkt-OP-Gruppe), und {ANZAHL_NRCT} Patienten, die eine neoadjuvante Radiochemotherapie erhielten (nRCT-Gruppe). Das mediane Alter im Gesamtkollektiv betrug {ALTER_MEDIAN} {JAHRE_LABEL} ({ALTER_RANGE_TEXT}), und {ANTEIL_MAENNER} waren männlich. Ein histopathologisch gesicherter positiver Lymphknotenstatus (N+) fand sich bei {N_PLUS_ANZAHL} von {ANZAHL_GESAMT} Patienten ({ANTEIL_N_PLUS_GESAMT}) im Gesamtkollektiv. Die Verteilung von Alter und Geschlecht im Gesamtkollektiv ist in {ABB_1A_REF} und {ABB_1B_REF} dargestellt.",
            alterRangeText: "Range: {ALTER_MIN}–{ALTER_MAX}",
            jahreLabel: "Jahre",
            abb1aRef: "Abbildung 1a",
            abb1bRef: "Abbildung 1b",
            tabelle1Ref: "Tabelle 1"
        },
        ergebnisseASPerformance: {
            p1: "Die diagnostische Güte des Avocado Signs (AS) zur Vorhersage des pathologischen N-Status ist für das Gesamtkollektiv und die Subgruppen in {TABELLE_3_REF} detailliert aufgeführt. Im Gesamtkollektiv (N={N_GESAMT}) erreichte das AS eine Sensitivität von {SENS_AS_GESAMT}, eine Spezifität von {SPEZ_AS_GESAMT}, einen positiven prädiktiven Wert (PPV) von {PPV_AS_GESAMT}, einen negativen prädiktiven Wert (NPV) von {NPV_AS_GESAMT} und eine Accuracy von {ACC_AS_GESAMT}. Die AUC (Balanced Accuracy) betrug {AUC_AS_GESAMT}.",
            p2: "In der Subgruppe der primär operierten Patienten (Direkt-OP-Gruppe, N={N_DIREKT_OP}) zeigte das AS eine Sensitivität von {SENS_AS_DIREKT_OP} und eine Spezifität von {SPEZ_AS_DIREKT_OP} (AUC: {AUC_AS_DIREKT_OP}). Bei Patienten nach nRCT (nRCT-Gruppe, N={N_NRCT}) betrug die Sensitivität {SENS_AS_NRCT} und die Spezifität {SPEZ_AS_NRCT} (AUC: {AUC_AS_NRCT}).",
            tabelle3Ref: "Tabelle 3"
        },
        ergebnisseLiteraturT2Performance: {
            intro: "Die diagnostische Güte der evaluierten Literatur-basierten T2-Kriteriensets ist in {TABELLE_4_REF} zusammengefasst.",
            kohPerformance: "Für das Kriterienset nach {KOH_NAME}, angewendet auf das Gesamtkollektiv (N={N_GESAMT}), ergab sich eine Sensitivität von {SENS_KOH} und eine Spezifität von {SPEZ_KOH} (AUC {AUC_KOH}).",
            barbaroPerformance: "Die Kriterien nach {BARBARO_NAME}, angewendet auf das nRCT-Kollektiv (N={N_NRCT}), zeigten eine Sensitivität von {SENS_BARBARO} und eine Spezifität von {SPEZ_BARBARO} (AUC {AUC_BARBARO}).",
            esgarPerformance: "Die {ESGAR_NAME} Kriterien, angewendet auf das Direkt-OP-Kollektiv (N={N_DIREKT_OP}), erreichten eine Sensitivität von {SENS_ESGAR} und eine Spezifität von {SPEZ_ESGAR} (AUC {AUC_ESGAR}).",
            tabelle4Ref: "Tabelle 4"
        },
        ergebnisseOptimierteT2Performance: {
            intro: "Mittels eines Brute-Force-Algorithmus wurden für jedes der drei Kollektive spezifische T2-Kriteriensets identifiziert, welche die {BF_ZIEL_METRIC_LABEL} maximieren. Die Definition dieser optimierten Kriteriensets ist im {METHODEN_ABSCHNITT_REF} und {TABELLE_2_REF} aufgeführt. Die diagnostische Güte dieser optimierten Sets ist in {TABELLE_5_REF} dargestellt.",
            listItemValid: "Für das {KOLLEKTIV_NAME} (N={N_PAT}) erreichten die optimierten Kriterien eine Sensitivität von {SENS_BF}, eine Spezifität von {SPEZ_BF} und eine AUC von {AUC_BF}.",
            listItemInvalid: "Für das {KOLLEKTIV_NAME} (N={N_PAT}) konnten keine validen optimierten Kriterien für die Zielmetrik {BF_ZIEL_METRIC_LABEL} ermittelt oder deren Performance berechnet werden.",
            tabelle5Ref: "Tabelle 5",
            methodenAbschnittRef: "Methodenteil (Abschnitt 2.5)",
            tabelle2Ref: "Tabelle 2"
        },
        ergebnisseVergleichPerformance: {
            intro: "Der direkte statistische Vergleich der diagnostischen Güte zwischen dem Avocado Sign (AS) und den ausgewählten T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) ist in {TABELLE_6_REF} zusammengefasst. {ABBILDUNG_2_REF} visualisiert die Schlüsselmetriken vergleichend für die drei Kollektive.",
            kollektivVergleichHeading: "Vergleich im {KOLLEKTIV_NAME}",
            asVsLit: "Im Vergleich des AS (AUC {AUC_AS}) mit den Kriterien nach {LIT_SET_NAME} (AUC {AUC_LIT}) zeigte sich für die Accuracy ein p-Wert von {P_WERT_MCNEMAR} (McNemar) und für die AUC ein p-Wert von {P_WERT_DELONG} (DeLong). Der Unterschied in der AUC betrug {DIFF_AUC_LIT}.",
            asVsLitMissing: "Ein Vergleich zwischen AS und den Kriterien nach {LIT_SET_NAME} konnte nicht vollständig durchgeführt werden (fehlende Daten).",
            asVsBf: "Gegenüber den für die {BF_ZIEL_METRIC_LABEL} optimierten T2-Kriterien (AUC {AUC_BF}) ergab sich für die Accuracy ein p-Wert von {P_WERT_MCNEMAR_BF} (McNemar) und für die AUC ein p-Wert von {P_WERT_DELONG_BF} (DeLong). Der Unterschied in der AUC betrug {DIFF_AUC_BF}.",
            asVsBfMissing: "Ein Vergleich zwischen AS und den Brute-Force-optimierten Kriterien konnte nicht vollständig durchgeführt werden (fehlende Daten oder keine BF-Optimierung für dieses Kollektiv für die Zielmetrik {BF_ZIEL_METRIC_LABEL}).",
            tabelle6Ref: "Tabelle 6",
            abbildung2Ref: "Abbildung 2"
        },
        fallback: { // Fallback-Texte, falls spezifische Sektionen nicht gefunden werden
            text: "Text für Sektion '{SECTION_ID}' (Sprache: {LANG}) noch nicht implementiert."
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
        asPerformance: 'AS Performance (Akt. Kollektiv)',
        comparisonBarPublikation: 'Vergleichsmetriken für {KOLLEKTIV}'
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
    },
    studyNames: {
        'koh_2008_morphology_name': 'Koh et al. (2008)',
        'barbaro_2024_restaging_name': 'Barbaro et al. (2024)',
        'rutegard_et_al_esgar_name': 'Rutegård et al. (2025) / ESGAR 2016'
    },
    studyShortNames: {
        'koh_2008_morphology_short': 'Koh et al.',
        'barbaro_2024_restaging_short': 'Barbaro et al.',
        'rutegard_et_al_esgar_short': 'ESGAR 2016'
    },
    publicationTableContent: {
        optimizedFor: "Optimiert für {METRIC}",
        optimizedShort: "Opt."
    },
    misc: {
        notAvailable: "N/V", // Nicht Verfügbar
        ciLabel: "95% KI",
        noInterpretation: "Keine Interpretation verfügbar.",
        noDataForInterpretation: "Keine Daten für Interpretation verfügbar.",
        noCIData: "(Keine CI-Daten)"
    },
    buttons: {
        expandAllLabel: "Alle Details Einblenden",
        collapseAllLabel: "Alle Details Ausblenden",
        comparisonActive: '<i class="fas fa-users-cog me-1"></i> Vergleich Aktiv',
        singleViewActive: '<i class="fas fa-user-cog me-1"></i> Einzelansicht Aktiv'
    },
    t2CriteriaControls: {
        loadError: 'Fehler: Initialkriterien konnten nicht geladen werden.',
        cardTitle: 'T2 Malignitäts-Kriterien Definieren',
        logicLabelPrefix: 'Logik:',
        inactiveCriterionTooltipSuffix: '(Kriterium ist derzeit inaktiv)',
        sizeManualInputLabel: 'Größe manuell eingeben',
        signalNote: 'Hinweis: Lymphknoten mit Signal \'null\' (d.h. nicht beurteilbar/nicht vorhanden) erfüllen das Signal-Kriterium nie.',
        resetButton: 'Zurücksetzen (Standard)',
        applyButton: 'Anwenden & Speichern',
        criterionLabels: {
            size: 'Größe',
            form: 'Form',
            kontur: 'Kontur',
            homogenitaet: 'Homogenität',
            signal: 'Signal'
        }
    },
    bruteForceCard: {
        cardTitle: 'Kriterien-Optimierung (Brute-Force)',
        description: 'Findet automatisch die Kombination von T2-Kriterien (Größe, Form, Kontur, Homogenität, Signal) und Logik (UND/ODER), die eine gewählte diagnostische Metrik im Vergleich zum N-Status maximiert.',
        metricSelectLabel: 'Zielmetrik:',
        startButton: 'Optimierung starten',
        startButtonWorkerMissing: 'Worker nicht verfügbar',
        statusLabel: 'Status:',
        kollektivLabel: 'Kollektiv:',
        statusReady: 'Bereit.',
        statusWorkerMissing: 'Worker konnte nicht initialisiert werden.',
        statusInitializing: 'Initialisiere...',
        statusTesting: 'Teste...',
        statusTestingTotal: 'Teste {TOTAL} Kombinationen...',
        statusRunning: 'Läuft...',
        progressLabel: 'Fortschritt:',
        calculating: 'berechne...',
        currentBestMetricLabel: 'Beste',
        currentBestMetricSuffix: 'bisher:',
        currentBestCriteriaLabel: 'Beste Kriterien:',
        currentBestCriteriaPrefix: 'Beste:',
        cancelButton: 'Abbrechen',
        optimizationCompleteTitle: 'Optimierung Abgeschlossen',
        bestResultForLabel: 'Beste Kombi für',
        valueLabel: 'Wert:',
        logicLabel: 'Logik:',
        criteriaLabel: 'Kriterien:',
        durationLabel: 'Dauer:',
        totalTestedLabel: 'Getestet:',
        applyButton: 'Anwenden',
        top10Button: 'Top 10',
        statusFinished: 'Fertig.',
        statusFinishedNoResults: 'Fertig (kein valides Ergebnis).',
        statusCancelled: 'Abgebrochen.',
        statusErrorPrefix: 'Fehler:',
        statusErrorUnknown: 'Unbekannt.'
    },
    bruteForceMetricOptions: [
        { value: "Accuracy", label: "Accuracy" },
        { value: "Balanced Accuracy", label: "Balanced Accuracy" },
        { value: "F1-Score", label: "F1-Score" },
        { value: "PPV", label: "Positiver Prädiktiver Wert (PPV)" },
        { value: "NPV", label: "Negativer Prädiktiver Wert (NPV)" }
    ],
    exportTab: {
        singleExportsTitle: "Einzelexporte",
        exportPackagesTitle: "Export-Pakete (.zip)",
        exportNotesTitle: "Hinweise zum Export",
        reportsAndStatsHeading: "Berichte & Statistiken",
        tablesAndRawDataHeading: "Tabellen & Rohdaten",
        chartsAndTablesImageHeading: "Diagramme & Tabellen (als Bilder)",
        fileLabel: "Datei",
        experimentalBadge: "Experimentell",
        statsCSVText: "Statistik Ergebnisse",
        bruteForceTXTText: "Brute-Force Bericht",
        deskriptivMDText: "Deskriptive Statistik",
        comprehensiveReportHTMLText: "Umfassender Bericht",
        datenMDText: "Datenliste",
        auswertungMDText: "Auswertungstabelle",
        filteredDataCSVText: "Gefilterte Rohdaten",
        chartsPNGText: "Diagramme & Tabellen (PNG)",
        chartsSVGText: "Diagramme (SVG)",
        allZIPText: "Gesamtpaket (Alle Dateien)",
        csvZIPText: "Nur CSVs",
        mdZIPText: "Nur Markdown",
        pngZIPText: "Nur Diagramm/Tabellen-PNGs",
        svgZIPText: "Nur Diagramm-SVGs",
        exportPackagesDescription: "Bündelt mehrere thematisch zusammengehörige Exportdateien in einem ZIP-Archiv für das Kollektiv <strong>{KOLLEKTIV}</strong>.",
        exportNotesList: [
            { icon: "fas fa-info-circle fa-fw me-1 text-primary", text: "Alle Exporte basieren auf dem aktuell gewählten Kollektiv und den zuletzt **angewendeten** T2-Kriterien." },
            { icon: "fas fa-table fa-fw me-1 text-primary", text: "**CSV:** Für Statistiksoftware; Trennzeichen: Semikolon (;)." },
            { icon: "fab fa-markdown fa-fw me-1 text-primary", text: "**MD:** Für Dokumentation." },
            { icon: "fas fa-file-alt fa-fw me-1 text-primary", text: "**TXT:** Brute-Force-Bericht." },
            { icon: "fas fa-file-invoice fa-fw me-1 text-primary", text: "**HTML Bericht:** Umfassend, druckbar." },
            { icon: "fas fa-images fa-fw me-1 text-primary", text: "**PNG:** Pixelbasiert (Diagramme/Tabellen)." },
            { icon: "fas fa-file-code fa-fw me-1 text-primary", text: "**SVG:** Vektorbasiert (Diagramme), skalierbar." },
            { icon: "fas fa-exclamation-triangle fa-fw me-1 text-warning", text: "ZIP-Exporte für Diagramme/Tabellen erfassen nur aktuell im Statistik- oder Auswertungstab sichtbare/gerenderte Elemente. Einzel-Downloads sind direkt am Element möglich (z.B. auch im Präsentationstab)." }
        ]
    },
     t2MetricsOverview: {
        cardTitle: "Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)",
        cardTitleNoData: "Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)",
        noDataMessage: "Metriken für T2 nicht verfügbar.",
        metricDisplayNames: { sens: 'Sens', spez: 'Spez', ppv: 'PPV', npv: 'NPV', acc: 'Acc', balAcc: 'BalAcc', f1: 'F1', auc: 'AUC' }
    },
    bruteForceModal: {
        modalTitle: "Brute-Force Optimierungsergebnisse",
        resultsLoading: "Ergebnisse werden geladen...",
        bestResultForLabel: "Beste Kombi für '{METRIC}' (Koll.: '{KOLLEKTIV}'):",
        valueLabel: "Wert:",
        logicLabel: "Logik:",
        criteriaLabel: "Kriterien:",
        durationLabel: "Dauer:",
        totalTestedLabel: "Getestet:",
        top10Title: "Top 10 Ergebnisse (inkl. identischer Werte):",
        rankHeader: "Rang",
        metricHeader: "{METRIC_NAME}",
        logicHeader: "Logik",
        criteriaHeader: "Kriterien",
        exportReportButton: "Bericht exportieren (.txt)",
        closeButton: "Schließen"
    },
    error: {
        general: "Fehler: Notwendige Daten für die Anzeige fehlen.",
        publicationDataLoadFailed: "Statistische Grunddaten für Publikations-Tab konnten nicht geladen werden. Bitte führen Sie ggf. Analysen durch oder laden Sie die Seite neu."
    },
    praesentationTab: {
        appliedCriteriaShortName: "Angewandt",
        userDefinedReference: "Benutzerdefiniert",
        currentCohortLabel: "Aktuell:",
        userSettingsFocus: "Benutzereinstellung",
        noCriteria: "Keine",
        currentlyApplied: "Aktuell angewandt"
    }
};

const UI_TEXTS_EN = { // Englische Texte hier einfügen
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
            referenzen: 'References',
            sectionsNavTitle: 'Sections'
        },
        subSectionLabels: { // Detaillierte Übersetzungen für Unterabschnitte
            studienanlage: 'Study Design and Ethics',
            patientenkollektiv: 'Patient Cohort',
            mrtProtokoll: 'MRI Protocol & Contrast Agent',
            asDefinition: 'Definition & Assessment of Avocado Sign',
            t2Definition: 'Definition & Assessment of T2 Criteria',
            referenzstandard: 'Reference Standard (Histopathology)',
            statistischeAnalyse: 'Statistical Analysis',
            patientencharakteristika: 'Patient Characteristics',
            asPerformance: 'Diagnostic Performance: Avocado Sign',
            literaturT2Performance: 'Diagnostic Performance: Literature-Based T2 Criteria',
            optimierteT2Performance: 'Diagnostic Performance: Optimized T2 Criteria (Brute-Force)',
            vergleichPerformance: 'Comparison: AS vs. T2 Criteria'
        },
        bruteForceMetricSelectLabel: 'Optimization Metric for T2 (BF):',
        bruteForceMetricLabels: {
            balancedAccuracy: 'Balanced Accuracy',
            accuracy: 'Accuracy',
            f1Score: 'F1 Score',
            ppv: 'Positive Predictive Value (PPV)',
            npv: 'Negative Predictive Value (NPV)'
        },
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
        },
        noPatientDataForTable: 'Insufficient patient data available for table.',
        noPerformanceData: 'No performance data available for this section.',
        noValidData: 'No valid data',
        noValidDataOrNotApplicable: 'No valid data or not applicable',
        noSubsectionsDefined: 'No subsections defined for main section \'{SECTION_ID}\'.',
        contentGenerationPending: 'Content for this subsection (ID: {SUB_SECTION_ID}, Language: {LANG}) is still being generated.',
        noSectionSelected: 'Please select a section from the navigation.',
        bfShortLabelForChart: 'BF-T2 ({METRIC_NAME_SHORT}.)'
    },
    publicationTextGeneratorSnippets: { // Englische Snippets
        methodenStudienanlage: {
            p1: "This study was designed as a retrospective analysis of prospectively collected data from a single-center patient cohort with histologically confirmed rectal cancer. The study cohort and the underlying imaging datasets are identical to those used in the initial \"Avocado Sign\" study ({STUDY_REFERENCE}). The primary objective of the present investigation was to compare the diagnostic performance of the Avocado Sign with established and optimized T2-weighted morphological criteria for predicting mesorectal lymph node status (N-status).",
            p2: "All analyses were performed using a custom-developed interactive web application ({APP_NAME} v{APP_VERSION}), specifically enhanced for this and future studies. This tool allows for the flexible definition and application of T2 criteria sets, automated optimization of criteria combinations using a brute-force algorithm, and comprehensive statistical evaluation and visualization of results. The study was conducted in accordance with the principles of the Declaration of Helsinki. The study protocol was approved by the local ethics committee ({ETHICS_VOTE}). Given the retrospective nature of this analysis on anonymized data, the ethics committee waived the need for re-obtaining written informed consent from patients for this specific analysis, as consent had already been provided as part of the primary study."
        },
        methodenPatientenkollektiv: {
            p1: "The study cohort comprised {ANZAHL_GESAMT} consecutive patients with histologically confirmed rectal cancer who were treated at {STUDIENORT} between January {JAHR_START} and November {JAHR_ENDE} and included in the initial Avocado Sign study. Of these, {ANZAHL_NRCT} patients received neoadjuvant chemoradiotherapy (nRCT group), while {ANZAHL_DIREKT_OP} patients underwent upfront surgery (surgery alone group). The median age in the overall cohort was {ALTER_MEDIAN} {JAHRE_LABEL} ({ALTER_RANGE_TEXT}), and {ANTEIL_MAENNER_PROZENT} ({ANZAHL_MAENNER}/{ANZAHL_PATIENTEN_CHAR}) were male. Detailed patient characteristics, stratified by treatment group, are presented in {TABELLE_1_REF}.",
            p2: "Inclusion criteria for the primary study were an age of at least 18 years and histologically confirmed rectal cancer. Exclusion criteria included unresectable tumors and contraindications to MRI examination. For the present analysis, all patients from the primary study for whom complete datasets regarding T2-weighted lymph node characteristics were available were included.",
            alterRangeText: "range: {ALTER_MIN}–{ALTER_MAX}",
            jahreLabel: "years",
            tabelle1Ref: "Table 1"
        },
        methodenMRTProtokoll: {
            p1: "All MRI examinations were performed on a {MRT_SYSTEM} using {SPULEN_INFO}. The standardized imaging protocol included {T2_SEQUENZ_DETAILS}, as well as {DWI_INFO}. For the assessment of the Avocado Sign, as described in the primary study, {T1KM_SEQUENZ_DETAILS} was acquired.",
            p2: "A {KONTRASTMITTEL_INFO} was administered intravenously at a weight-based dose ({KONTRASTMITTEL_DOSIERUNG}). Contrast-enhanced images were acquired immediately after the full administration of the contrast agent. {BUSCOPAN_INFO} was administered at the beginning and, if necessary, during each examination to reduce motion artifacts. The imaging protocol was identical for baseline staging and restaging examinations (in patients from the nRCT group)."
        },
        methodenASDefinition: {
            p1: "The Avocado Sign, as defined in the original study ({AS_REFERENCE}), was evaluated on contrast-enhanced T1-weighted images. It is characterized as a clearly demarcated, hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape. Assessment was performed for all mesorectal lymph nodes visible on T1-weighted contrast-enhanced MRI. A patient was classified as Avocado-Sign-positive (AS+) if at least one lymph node exhibited this sign. Image analysis was performed by {RADIOLOGEN_INFO_AS} who conducted the primary study, independently and blinded to histopathological results and T2-weighted features. Discrepancies were resolved by consensus with a third, similarly experienced radiologist."
        },
        methodenT2Definition: {
            p1: "The morphological T2-weighted criteria (size [short-axis diameter in mm], shape ['round', 'oval'], border ['smooth', 'irregular'], homogeneity ['homogeneous', 'heterogeneous'], and signal intensity ['low', 'intermediate', 'high']) were assessed for every mesorectal lymph node visible on high-resolution T2w-MRI by {RADIOLOGEN_INFO_T2} who also evaluated the Avocado Sign. The assessment was performed by consensus and blinded to the pathological N-status and the Avocado Sign status.",
            p2: "For the comparison of diagnostic performance, the following T2 criteria sets were utilized:",
            p3: "A lymph node was considered T2-positive for a given criteria set if it met the specific conditions of that set. A patient was considered T2-positive if at least one lymph node was rated positive according to the respective criteria set.",
            literaturBasiertHeading: "Literature-based T2 criteria sets",
            literaturBasiertIntro: "A selection of established criteria from the literature was implemented and applied to the respective subgroups or the entire cohort of our dataset (details see Table 2):",
            kohAnwendung: "In our analysis, this set was applied to the overall cohort.",
            barbaroAnwendung: "This set was specifically evaluated for the nRCT cohort (restaging).",
            esgarAnwendung: "This set was primarily applied to the surgery alone cohort (primary staging).",
            kohDescFallback: "Irregular border OR heterogeneous signal",
            barbaroDescFallback: "Short-axis diameter ≥ 2.3mm",
            esgarDescFallback: "Complex size-dependent morphological rules",
            bfOptimiertHeading: "Brute-force optimized T2 criteria",
            bfOptimiertIntro: "Using a brute-force algorithm implemented in the analysis tool, combinations of the five T2 features and AND/OR logic that maximize the primary endpoint of this study – <strong>{BF_ZIEL_METRIC_LABEL}</strong> – were identified for each of the three main cohorts (Overall, Surgery Alone, nRCT). The resulting cohort-specific optimized criteria sets were:",
            targetMetricLabel: "Target Metric",
            achievedValueLabel: "Achieved Value",
            noBFOptResults: "No optimization results available or not calculated for target metric '{BF_ZIEL_METRIC_LABEL}'.",
            aktuellEingestelltHeading: "Currently set T2 criteria in the analysis tool",
            aktuellEingestelltIntro: "For exploratory purposes and to demonstrate the flexibility of the analysis tool, user-defined criteria can be configured. For the present publication, the criteria mentioned under points 1 and 2 are authoritative. The criteria currently set in the tool at the time of final analysis were:"
        },
        methodenReferenzstandard: {
            p1: "Histopathological examination of surgical specimens after total mesorectal excision (TME) served as the reference standard for lymph node status. All mesorectal lymph nodes were processed and microscopically evaluated by experienced pathologists according to established standard protocols. A patient's N-status was defined as positive (N+) if at least one lymph node was histologically identified as metastatic. Otherwise, the patient was considered N-negative (N0)."
        },
        methodenStatistischeAnalyse: {
            p1: "Descriptive statistics included the calculation of medians, means, standard deviations (SD), minima, and maxima for continuous variables, as well as absolute frequencies and percentages for categorical data. The diagnostic performance of the Avocado Sign and the various T2 criteria sets (literature-based and brute-force optimized) was evaluated using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy (ACC), balanced accuracy (BalAcc), and the area under the Receiver Operating Characteristic curve (AUC)—equivalent to BalAcc for binary tests. Two-sided 95% confidence intervals (CI) were calculated for these metrics. The {WILSON_SCORE_METHOD_NAME} was used for proportions (sensitivity, specificity, PPV, NPV, accuracy). For BalAcc (AUC) and F1-score, the {BOOTSTRAP_METHOD_NAME} with {BOOTSTRAP_N} replications was applied.",
            p2: "Statistical comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group (paired data) was performed using McNemar's test for paired nominal data and DeLong's test for AUC comparison. Comparison of performance metrics between independent cohorts (e.g., surgery alone vs. nRCT group) was conducted using Fisher's exact test for rates (such as accuracy) and a Z-test for AUC comparison based on their bootstrap standard errors. {P_WERT_BEDINGUNG} was considered statistically significant. All statistical analyses were conducted using the aforementioned custom-developed web application ({APP_NAME} v{APP_VERSION}), which is based on standard libraries for statistical computations and JavaScript.",
            pWertBedingung: "A p-value < {ALPHA_TEXT}"
        },
        ergebnissePatientencharakteristika: {
            p1: "The characteristics of the {ANZAHL_GESAMT} patients included in the study are summarized in {TABELLE_1_REF}. The overall cohort consisted of {ANZAHL_DIREKT_OP} patients who underwent upfront surgery (surgery alone group) and {ANZAHL_NRCT} patients who received neoadjuvant chemoradiotherapy (nRCT group). The median age in the overall cohort was {ALTER_MEDIAN} {JAHRE_LABEL} ({ALTER_RANGE_TEXT}), and {ANTEIL_MAENNER} were male. A histopathologically confirmed positive lymph node status (N+) was found in {N_PLUS_ANZAHL} of {ANZAHL_GESAMT} patients ({ANTEIL_N_PLUS_GESAMT}) in the overall cohort. The age and gender distribution in the overall cohort is shown in {ABB_1A_REF} and {ABB_1B_REF}.",
            alterRangeText: "range: {ALTER_MIN}–{ALTER_MAX}",
            jahreLabel: "years",
            abb1aRef: "Figure 1a",
            abb1bRef: "Figure 1b",
            tabelle1Ref: "Table 1"
        },
        ergebnisseASPerformance: {
            p1: "The diagnostic performance of the Avocado Sign (AS) for predicting pathological N-status is detailed in {TABELLE_3_REF} for the overall cohort and subgroups. In the overall cohort (n={N_GESAMT}), the AS achieved a sensitivity of {SENS_AS_GESAMT}, a specificity of {SPEZ_AS_GESAMT}, a positive predictive value (PPV) of {PPV_AS_GESAMT}, a negative predictive value (NPV) of {NPV_AS_GESAMT}, and an accuracy of {ACC_AS_GESAMT}. The AUC (Balanced Accuracy) was {AUC_AS_GESAMT}.",
            p2: "In the subgroup of patients undergoing surgery alone (surgery alone group, n={N_DIREKT_OP}), the AS showed a sensitivity of {SENS_AS_DIREKT_OP} and a specificity of {SPEZ_AS_DIREKT_OP} (AUC: {AUC_AS_DIREKT_OP}). For patients after nRCT (nRCT group, n={N_NRCT}), the sensitivity was {SENS_AS_NRCT} and the specificity was {SPEZ_AS_NRCT} (AUC: {AUC_AS_NRCT}).",
            tabelle3Ref: "Table 3"
        },
        ergebnisseLiteraturT2Performance: {
            intro: "The diagnostic performance of the evaluated literature-based T2 criteria sets is summarized in {TABELLE_4_REF}.",
            kohPerformance: "For the criteria set according to {KOH_NAME}, applied to the overall cohort (n={N_GESAMT}), a sensitivity of {SENS_KOH} and a specificity of {SPEZ_KOH} (AUC {AUC_KOH}) were observed.",
            barbaroPerformance: "The criteria by {BARBARO_NAME}, applied to the nRCT cohort (n={N_NRCT}), showed a sensitivity of {SENS_BARBARO} and a specificity of {SPEZ_BARBARO} (AUC {AUC_BARBARO}).",
            esgarPerformance: "The {ESGAR_NAME} criteria, applied to the surgery alone cohort (n={N_DIREKT_OP}), achieved a sensitivity of {SENS_ESGAR} and a specificity of {SPEZ_ESGAR} (AUC {AUC_ESGAR}).",
            tabelle4Ref: "Table 4"
        },
        ergebnisseOptimierteT2Performance: {
            intro: "Using a brute-force algorithm, specific T2 criteria sets maximizing {BF_ZIEL_METRIC_LABEL} were identified for each of the three cohorts. The definition of these optimized criteria sets is detailed in the {METHODEN_ABSCHNITT_REF} and {TABELLE_2_REF}. The diagnostic performance of these optimized sets is presented in {TABELLE_5_REF}.",
            listItemValid: "For the {KOLLEKTIV_NAME} (n={N_PAT}), the optimized criteria achieved a sensitivity of {SENS_BF}, a specificity of {SPEZ_BF}, and an AUC of {AUC_BF}.",
            listItemInvalid: "For the {KOLLEKTIV_NAME} (n={N_PAT}), no valid optimized criteria could be determined for the target metric {BF_ZIEL_METRIC_LABEL}, or their performance could not be calculated.",
            tabelle5Ref: "Table 5",
            methodenAbschnittRef: "Methods section (Section 2.5)",
            tabelle2Ref: "Table 2"
        },
        ergebnisseVergleichPerformance: {
            intro: "The direct statistical comparison of diagnostic performance between the Avocado Sign (AS) and the selected T2 criteria sets (literature-based and brute-force optimized) is summarized in {TABELLE_6_REF}. {ABBILDUNG_2_REF} provides a comparative visualization of key metrics across the three cohorts.",
            kollektivVergleichHeading: "Comparison in the {KOLLEKTIV_NAME}",
            asVsLit: "Comparing AS (AUC {AUC_AS}) with the criteria by {LIT_SET_NAME} (AUC {AUC_LIT}), the p-value for accuracy was {P_WERT_MCNEMAR} (McNemar) and for AUC was {P_WERT_DELONG} (DeLong). The difference in AUC was {DIFF_AUC_LIT}.",
            asVsLitMissing: "A full comparison between AS and the criteria by {LIT_SET_NAME} could not be performed (missing data).",
            asVsBf: "Compared to the T2 criteria optimized for {BF_ZIEL_METRIC_LABEL} (AUC {AUC_BF}), the p-value for accuracy was {P_WERT_MCNEMAR_BF} (McNemar) and for AUC was {P_WERT_DELONG_BF} (DeLong). The difference in AUC was {DIFF_AUC_BF}.",
            asVsBfMissing: "A full comparison between AS and the brute-force optimized criteria could not be performed (missing data or no BF optimization for this cohort for the target metric {BF_ZIEL_METRIC_LABEL}).",
            tabelle6Ref: "Table 6",
            abbildung2Ref: "Figure 2"
        },
        fallback: {
            text: "Text for section '{SECTION_ID}' (Language: {LANG}) not yet implemented."
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
        asPerformance: 'AS Performance (Current Cohort)',
        comparisonBarPublikation: 'Comparative Metrics for {KOLLEKTIV}'
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
    excelExport: {
        datenLabel: "DataList (.xlsx)",
        auswertungLabel: "EvaluationTable (.xlsx)",
        statistikLabel: "StatisticsOverview (.xlsx)",
        filteredDataLabel: "FilteredData (.xlsx)",
        zipLabel: "All Excel Tables (.zip)"
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
    },
    studyNames: {
        'koh_2008_morphology_name': 'Koh et al. (2008)',
        'barbaro_2024_restaging_name': 'Barbaro et al. (2024)',
        'rutegard_et_al_esgar_name': 'Rutegård et al. (2025) / ESGAR 2016'
    },
    studyShortNames: {
        'koh_2008_morphology_short': 'Koh et al.',
        'barbaro_2024_restaging_short': 'Barbaro et al.',
        'rutegard_et_al_esgar_short': 'ESGAR 2016'
    },
    publicationTableContent: {
        optimizedFor: "Optimized for {METRIC}",
        optimizedShort: "Opt."
    },
    misc: {
        notAvailable: "N/A",
        ciLabel: "95% CI",
        noInterpretation: "No interpretation available.",
        noDataForInterpretation: "No data available for interpretation.",
        noCIData: "(No CI data)"
    },
    buttons: {
        expandAllLabel: "Expand All Details",
        collapseAllLabel: "Collapse All Details",
        comparisonActive: '<i class="fas fa-users-cog me-1"></i> Comparison Active',
        singleViewActive: '<i class="fas fa-user-cog me-1"></i> Single View Active'
    },
    t2CriteriaControls: {
        loadError: 'Error: Initial criteria could not be loaded.',
        cardTitle: 'Define T2 Malignancy Criteria',
        logicLabelPrefix: 'Logic:',
        inactiveCriterionTooltipSuffix: '(Criterion is currently inactive)',
        sizeManualInputLabel: 'Enter size manually',
        signalNote: 'Note: Lymph nodes with signal \'null\' (i.e., non-assessable/not present) never meet the signal criterion.',
        resetButton: 'Reset (Default)',
        applyButton: 'Apply & Save',
        criterionLabels: {
            size: 'Size',
            form: 'Shape',
            kontur: 'Border',
            homogenitaet: 'Homogeneity',
            signal: 'Signal'
        }
    },
    bruteForceCard: {
        cardTitle: 'Criteria Optimization (Brute-Force)',
        description: 'Automatically finds the combination of T2 criteria (size, shape, border, homogeneity, signal) and logic (AND/OR) that maximizes a selected diagnostic metric compared to N-status.',
        metricSelectLabel: 'Target Metric:',
        startButton: 'Start Optimization',
        startButtonWorkerMissing: 'Worker unavailable',
        statusLabel: 'Status:',
        kollektivLabel: 'Cohort:',
        statusReady: 'Ready.',
        statusWorkerMissing: 'Worker could not be initialized.',
        statusInitializing: 'Initializing...',
        statusTesting: 'Testing...',
        statusTestingTotal: 'Testing {TOTAL} combinations...',
        statusRunning: 'Running...',
        progressLabel: 'Progress:',
        calculating: 'calculating...',
        currentBestMetricLabel: 'Best',
        currentBestMetricSuffix: 'so far:',
        currentBestCriteriaLabel: 'Best Criteria:',
        currentBestCriteriaPrefix: 'Best:',
        cancelButton: 'Cancel',
        optimizationCompleteTitle: 'Optimization Complete',
        bestResultForLabel: 'Best combo for',
        valueLabel: 'Value:',
        logicLabel: 'Logic:',
        criteriaLabel: 'Criteria:',
        durationLabel: 'Duration:',
        totalTestedLabel: 'Tested:',
        applyButton: 'Apply',
        top10Button: 'Top 10',
        statusFinished: 'Finished.',
        statusFinishedNoResults: 'Finished (no valid result).',
        statusCancelled: 'Cancelled.',
        statusErrorPrefix: 'Error:',
        statusErrorUnknown: 'Unknown.'
    },
    bruteForceMetricOptions: [
        { value: "Accuracy", label: "Accuracy" },
        { value: "Balanced Accuracy", label: "Balanced Accuracy" },
        { value: "F1-Score", label: "F1 Score" },
        { value: "PPV", label: "Positive Predictive Value (PPV)" },
        { value: "NPV", label: "Negative Predictive Value (NPV)" }
    ],
    exportTab: {
        singleExportsTitle: "Single Exports",
        exportPackagesTitle: "Export Packages (.zip)",
        exportNotesTitle: "Export Notes",
        reportsAndStatsHeading: "Reports & Statistics",
        tablesAndRawDataHeading: "Tables & Raw Data",
        chartsAndTablesImageHeading: "Charts & Tables (as Images)",
        fileLabel: "File",
        experimentalBadge: "Experimental",
        statsCSVText: "Statistics Results",
        bruteForceTXTText: "Brute-Force Report",
        deskriptivMDText: "Descriptive Statistics",
        comprehensiveReportHTMLText: "Comprehensive Report",
        datenMDText: "Data List",
        auswertungMDText: "Evaluation Table",
        filteredDataCSVText: "Filtered Raw Data",
        chartsPNGText: "Charts & Tables (PNG)",
        chartsSVGText: "Charts (SVG)",
        allZIPText: "Complete Package (All Files)",
        csvZIPText: "CSVs Only",
        mdZIPText: "Markdown Only",
        pngZIPText: "Chart/Table PNGs Only",
        svgZIPText: "Chart SVGs Only",
        exportPackagesDescription: "Bundles several thematically related export files into a ZIP archive for cohort <strong>{KOLLEKTIV}</strong>.",
        exportNotesList: [
            { icon: "fas fa-info-circle fa-fw me-1 text-primary", text: "All exports are based on the currently selected cohort and the **last applied** T2 criteria." },
            { icon: "fas fa-table fa-fw me-1 text-primary", text: "**CSV:** For statistical software; delimiter: semicolon (;)." },
            { icon: "fab fa-markdown fa-fw me-1 text-primary", text: "**MD:** For documentation." },
            { icon: "fas fa-file-alt fa-fw me-1 text-primary", text: "**TXT:** Brute-force report." },
            { icon: "fas fa-file-invoice fa-fw me-1 text-primary", text: "**HTML Report:** Comprehensive, printable." },
            { icon: "fas fa-images fa-fw me-1 text-primary", text: "**PNG:** Pixel-based (charts/tables)." },
            { icon: "fas fa-file-code fa-fw me-1 text-primary", text: "**SVG:** Vector-based (charts), scalable." },
            { icon: "fas fa-exclamation-triangle fa-fw me-1 text-warning", text: "ZIP exports for charts/tables only capture elements currently visible/rendered in the Statistics or Evaluation tab. Single downloads are available directly on the element (e.g., also in Presentation tab)." }
        ]
    },
    t2MetricsOverview: {
        cardTitle: "Brief Overview of Diagnostic Performance (T2 vs. N - applied criteria)",
        cardTitleNoData: "Brief Overview of Diagnostic Performance (T2 vs. N - applied criteria)",
        noDataMessage: "Metrics for T2 not available.",
        metricDisplayNames: { sens: 'Sens', spez: 'Spec', ppv: 'PPV', npv: 'NPV', acc: 'Acc', balAcc: 'BalAcc', f1: 'F1', auc: 'AUC' }
    },
    bruteForceModal: {
        modalTitle: "Brute-Force Optimization Results",
        resultsLoading: "Loading results...",
        bestResultForLabel: "Best combo for '{METRIC}' (Cohort: '{KOLLEKTIV}'):",
        valueLabel: "Value:",
        logicLabel: "Logic:",
        criteriaLabel: "Criteria:",
        durationLabel: "Duration:",
        totalTestedLabel: "Tested:",
        top10Title: "Top 10 Results (including identical values):",
        rankHeader: "Rank",
        metricHeader: "{METRIC_NAME}",
        logicHeader: "Logic",
        criteriaHeader: "Criteria",
        exportReportButton: "Export Report (.txt)",
        closeButton: "Close"
    },
    error: {
        general: "Error: Necessary data for display is missing.",
        publicationDataLoadFailed: "Basic statistical data for the Publication tab could not be loaded. Please perform analyses or reload the page if necessary."
    },
    praesentationTab: {
        appliedCriteriaShortName: "Applied",
        userDefinedReference: "User-defined",
        currentCohortLabel: "Current:",
        userSettingsFocus: "User Setting",
        noCriteria: "None",
        currentlyApplied: "Currently Applied"
    }
};


function getUiTexts(lang = null) {
    const currentLang = lang || (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function' ? state.getCurrentPublikationLang() : PUBLICATION_CONFIG.defaultLanguage);
    return currentLang === 'en' ? UI_TEXTS_EN : UI_TEXTS_DE;
}

// Make UI_TEXTS dynamic based on language
const UI_TEXTS = new Proxy({}, {
    get: function(target, prop) {
        const langTexts = getUiTexts(); // This will use state or default
        if (langTexts && typeof langTexts === 'object' && prop in langTexts) {
            return langTexts[prop];
        }
        // Fallback to German if property not found in current language's texts (or if langTexts is undefined)
        // This handles cases where a new key might be added to DE but not yet to EN.
        const fallbackLangTexts = UI_TEXTS_DE;
        if (fallbackLangTexts && typeof fallbackLangTexts === 'object' && prop in fallbackLangTexts) {
             console.warn(`UI_TEXTS: Property '${prop}' not found for current language, using German fallback.`);
            return fallbackLangTexts[prop];
        }
        console.warn(`UI_TEXTS: Property '${prop}' not found in any language texts.`);
        return undefined; // Or some default string like `Missing text: ${String(prop)}`
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
    t2Size: {
        description: `Größenkriterium: Lymphknoten mit einem Kurzachsendurchmesser <strong>größer oder gleich</strong> dem eingestellten Schwellenwert gelten als suspekt. Einstellbarer Bereich: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} - ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm. Aktivieren/Deaktivieren Sie das Kriterium mit der Checkbox.`,
        sliderTooltip: "Schwellenwert für Kurzachsendurchmesser (≥) einstellen.",
        inputTooltip: "Schwellenwert manuell eingeben oder anpassen.",
        buttonTooltip: "Größenkriterium auf '{VALUE}' setzen."
    },
    t2Form: { description: "Formkriterium: Wählen Sie, welche Form ('rund' oder 'oval') als suspekt gilt. Ein Lymphknoten gilt als 'rund', wenn das Verhältnis Kurzachse zu Langachse nahe 1 ist. Aktivieren/Deaktivieren Sie das Kriterium mit der Checkbox.", buttonTooltip: "Formkriterium auf '{VALUE}' setzen." },
    t2Kontur: { description: "Konturkriterium: Wählen Sie, welche Kontur ('scharf' oder 'irregulär') als suspekt gilt. Aktivieren/Deaktivieren Sie das Kriterium mit der Checkbox.", buttonTooltip: "Konturkriterium auf '{VALUE}' setzen." },
    t2Homogenitaet: { description: "Homogenitätskriterium: Wählen Sie, ob ein 'homogenes' oder 'heterogenes' Binnensignal auf T2w als suspekt gilt. Aktivieren/Deaktivieren Sie das Kriterium mit der Checkbox.", buttonTooltip: "Homogenitätskriterium auf '{VALUE}' setzen." },
    t2Signal: { description: "Signalkriterium: Wählen Sie, welche T2-Signalintensität ('signalarm', 'intermediär' oder 'signalreich') relativ zur umgebenden Muskulatur als suspekt gilt. Lymphknoten ohne eindeutig zuweisbares Signal (Signal='null') erfüllen dieses Kriterium nie. Aktivieren/Deaktivieren Sie das Kriterium mit der Checkbox.", buttonTooltip: "Signalkriterium auf '{VALUE}' setzen." },
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
    bruteForceCancel: { description: "Bricht die laufende Brute-Force-Optimierung ab." },
    bruteForceInfo: { description: "Zeigt den Status des Optimierungs-Workers und das aktuell für die Analyse ausgewählte Patientenkollektiv an." },
    bruteForceProgress: { description: "Zeigt den Fortschritt der laufenden Optimierung an: Anzahl bereits getesteter Kombinationen von insgesamt zu testenden [TOTAL], sowie die bisher beste gefundene Metrik mit den zugehörigen Kriterien und der Logik." },
    bruteForceBestMetric: { description: "Bester Wert für '{METRIC_NAME}'." },
    bruteForceBestCriteria: { description: "Kriterien für besten Wert." },
    bruteForceResult: { description: "Zeigt das Ergebnis der abgeschlossenen Optimierung an: die beste gefundene Kriterienkombination (Logik, aktive Kriterien, Werte) und den damit erreichten Wert der Zielmetrik für das analysierte Kollektiv." },
    bruteForceApply: { description: "Wendet die beste gefundene Kriterienkombination an und speichert sie." },
    bruteForceDetailsButton: { description: "Öffnet ein separates Fenster (Modal), das eine sortierte Liste der Top 10 gefundenen Kriterienkombinationen (inklusive solcher mit gleichem Metrikwert) und weitere Details zur Optimierung anzeigt." },
    bruteForceModal: {
        exportButton: "Exportiert den detaillierten Bericht der Brute-Force-Optimierung, inklusive der Top 10 Ergebnisse und der Konfiguration, als formatierte Textdatei (.txt).",
        rankHeaderTooltip: "Rang",
        metricHeaderTooltip: "Wert der Zielmetrik ({METRIC_NAME})",
        logicHeaderTooltip: "Logik",
        criteriaHeaderTooltip: "Kriterienkombination"
    },
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
    exportTab: UI_TEXTS_DE.exportTab, // Verweist auf die deutschen Texte als Basis
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
    statMetrics: TOOLTIP_CONTENT_DE.statMetrics // Verweist auf die deutschen Tooltips als Basis
};

const TOOLTIP_CONTENT_EN = { // Englische Tooltips hier einfügen
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
        therapie: "Applied therapy before surgery (nRCT: neoadjuvant chemoradiotherapy, Surgery Alone: no prior treatment).",
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
    t2Size: {
        description: `Size criterion: Lymph nodes with a short-axis diameter <strong>greater than or equal to</strong> the set threshold are considered suspicious. Adjustable range: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} - ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm. Activate/deactivate the criterion using the checkbox.`,
        sliderTooltip: "Adjust short-axis diameter threshold (≥).",
        inputTooltip: "Manually enter or adjust threshold.",
        buttonTooltip: "Set size criterion to '{VALUE}'."
    },
    t2Form: { description: "Shape criterion: Select which shape ('round' or 'oval') is considered suspicious. A lymph node is considered 'round' if the ratio of short axis to long axis is close to 1. Activate/deactivate the criterion using the checkbox.", buttonTooltip: "Set shape criterion to '{VALUE}'." },
    t2Kontur: { description: "Border criterion: Select which border ('smooth' or 'irregular') is considered suspicious. Activate/deactivate the criterion using the checkbox.", buttonTooltip: "Set border criterion to '{VALUE}'." },
    t2Homogenitaet: { description: "Homogeneity criterion: Select whether a 'homogeneous' or 'heterogeneous' internal signal on T2w is considered suspicious. Activate/deactivate the criterion using the checkbox.", buttonTooltip: "Set homogeneity criterion to '{VALUE}'." },
    t2Signal: { description: "Signal criterion: Select which T2 signal intensity ('low', 'intermediate', or 'high') relative to surrounding muscle is considered suspicious. Lymph nodes with non-assessable signal (signal='null') never meet this criterion. Activate/deactivate the criterion using the checkbox.", buttonTooltip: "Set signal criterion to '{VALUE}'." },
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
    bruteForceCancel: { description: "Cancels the ongoing brute-force optimization." },
    bruteForceInfo: { description: "Shows the status of the optimization worker and the currently selected patient cohort for analysis." },
    bruteForceProgress: { description: "Shows the progress of the ongoing optimization: number of combinations already tested out of a total of [TOTAL] to be tested, as well as the best metric found so far with the corresponding criteria and logic." },
    bruteForceBestMetric: { description: "Best value for '{METRIC_NAME}'." },
    bruteForceBestCriteria: { description: "Criteria for best value." },
    bruteForceResult: { description: "Displays the result of the completed optimization: the best found criteria combination (logic, active criteria, values) and the achieved value of the target metric for the analyzed cohort." },
    bruteForceApply: { description: "Applies the best found criteria combination and saves it." },
    bruteForceDetailsButton: { description: "Opens a separate window (modal) showing a sorted list of the top 10 found criteria combinations (including those with identical metric values) and other details about the optimization." },
    bruteForceModal: {
        exportButton: "Exports the detailed brute-force optimization report, including the top 10 results and configuration, as a formatted text file (.txt).",
        rankHeaderTooltip: "Rank",
        metricHeaderTooltip: "Value of the target metric ({METRIC_NAME})",
        logicHeaderTooltip: "Logic",
        criteriaHeaderTooltip: "Criteria combination"
    },
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
    exportTab: UI_TEXTS_EN.exportTab, // Verweist auf die englischen Texte
    publikationTabTooltips: { // Englische Tooltips
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
    statMetrics: TOOLTIP_CONTENT_EN.statMetrics // Verweist auf die englischen Tooltips (müssen noch gefüllt werden)
};


function getTooltipContent(lang = null) {
    const currentLang = lang || (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function' ? state.getCurrentPublikationLang() : PUBLICATION_CONFIG.defaultLanguage);
    return currentLang === 'en' ? TOOLTIP_CONTENT_EN : TOOLTIP_CONTENT_DE;
}

const TOOLTIP_CONTENT = new Proxy({}, {
    get: function(target, prop) {
        const langTooltips = getTooltipContent();
        if (langTooltips && typeof langTooltips === 'object' && prop in langTooltips) {
            return langTooltips[prop];
        }
        const fallbackLangTooltips = TOOLTIP_CONTENT_DE; // Fallback auf Deutsch
        if (fallbackLangTooltips && typeof fallbackLangTooltips === 'object' && prop in fallbackLangTooltips) {
            console.warn(`TOOLTIP_CONTENT: Property '${prop}' not found for current language, using German fallback.`);
            return fallbackLangTooltips[prop];
        }
        console.warn(`TOOLTIP_CONTENT: Property '${prop}' not found in any language tooltips.`);
        return undefined;
    }
});


deepFreeze(UI_TEXTS_DE);
deepFreeze(UI_TEXTS_EN);
// TOOLTIP_CONTENT wird nicht mehr separat ge-deepFreezed, da es jetzt ein Proxy ist.
// Die zugrundeliegenden Objekte TOOLTIP_CONTENT_DE und TOOLTIP_CONTENT_EN müssen separat behandelt werden,
// aber da sie Teil der größeren UI_TEXTS_DE/EN Struktur sein könnten, oder wie hier separat,
// ist es wichtig, dass sie *vor* dem Proxy-Setup ge-deepFreezed werden, falls sie eigenständig sind.
// Für die aktuelle Struktur sind TOOLTIP_CONTENT_DE und TOOLTIP_CONTENT_EN eigenständig.
deepFreeze(TOOLTIP_CONTENT_DE);
deepFreeze(TOOLTIP_CONTENT_EN);
