const PUBLICATION_CONTENT = {
    methoden: {
        de: {
            title: "Methoden",
            sections: [
                {
                    id: "studiendesign_patienten",
                    title: "Studiendesign und Patientenkollektiv",
                    content_paragraphs: [
                        "Diese retrospektive, monozentrische Studie wurde nach Zustimmung der lokalen Ethikkommission (Klinikum St. Georg Leipzig, Deutschland, Aktenzeichen: {{ETHIK_VOTUM_NUMMER}}) und unter Verzicht auf eine erneute individuelle Patienteneinwilligung für diese spezifische Analyse durchgeführt, da ausschließlich anonymisierte Daten aus einer bereits genehmigten Forschungsdatenbank verwendet wurden. Die Studie wurde in Übereinstimmung mit der Deklaration von Helsinki durchgeführt.",
                        "Es wurden die Daten von {{PATIENT_COUNT_GESAMT}} konsekutiven Patienten mit histologisch gesichertem Rektumkarzinom analysiert, die zwischen Januar 2020 und November 2023 an unserem Institut einer standardisierten MRT-Untersuchung des Beckens unterzogen wurden. Dieses Kollektiv ist identisch mit dem der ursprünglichen Avocado-Sign-Studie (Lurz & Schäfer, 2025 Eur Radiol [DOI: 10.1007/s00330-025-11462-y]).",
                        "Von diesen Patienten erhielten {{PATIENT_COUNT_NRCT}} eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), definiert als Strahlentherapie mit konkomitanter Chemotherapie vor der Operation. {{PATIENT_COUNT_DIREKT_OP}} Patienten wurden primär operiert, ohne neoadjuvante Behandlung (Direkt-OP-Gruppe).",
                        "Die Einschlusskriterien für die ursprüngliche Datenerhebung umfassten volljährige Patienten mit histologisch bestätigtem Adenokarzinom des Rektums und eine durchgeführte Staging-MRT-Untersuchung inklusive kontrastmittelverstärkter T1-gewichteter Sequenzen. Ausschlusskriterien waren nicht-resektable Tumoren sowie Kontraindikationen gegen eine MRT-Untersuchung oder die Gabe von Gadolinium-basiertem Kontrastmittel. Für die aktuelle Analyse wurden alle Patienten des ursprünglichen Kollektivs berücksichtigt, bei denen eine vollständige Datenerfassung sowohl für das Avocado Sign als auch für die morphologischen T2-Kriterien aller detektierten mesorektalen Lymphknoten vorlag."
                    ]
                },
                {
                    id: "mrt_protokoll",
                    title: "MRT-Protokoll und Bildakquisition",
                    content_paragraphs: [
                        "Alle MRT-Untersuchungen wurden an einem 3.0-Tesla-System (MAGNETOM Prisma Fit; Siemens Healthineers) mit entsprechenden Körper- und Wirbelsäulen-Array-Spulen durchgeführt. Das detaillierte MRT-Protokoll, inklusive Sequenzparameter für T2-gewichtete und kontrastmittelverstärkte T1-gewichtete Sequenzen, entsprach dem in der initialen Avocado-Sign Studie beschriebenen Protokoll (Lurz & Schäfer, 2025 Eur Radiol). Kurz gesagt, umfasste es hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Orientierung sowie axiale diffusionsgewichtete Bildgebung (DWI). Nach intravenöser Gabe eines gewichtsadaptierten makrozyklischen Gadolinium-basierten Kontrastmittels (Gadoteridol; ProHance; Bracco) wurden axiale T1-gewichtete volumetrische Sequenzen mit Fettsättigung (z.B. VIBE Dixon) akquiriert. Die Bildakquisition war für das primäre Staging und das Restaging (nach nRCT) identisch."
                    ]
                },
                {
                    id: "bildanalyse",
                    title: "Bildanalyse",
                    sub_sections: [
                        {
                            id: "bildanalyse_as",
                            title: "Avocado Sign (AS) Bewertung",
                            content_paragraphs: [
                                "Die Bewertung des Avocado Signs erfolgte auf den kontrastmittelverstärkten T1-gewichteten Bildern mit Fettsättigung, wie in der Originalstudie definiert (Lurz & Schäfer, 2025 Eur Radiol). Das Avocado Sign wurde als positiv (+) gewertet, wenn ein Lymphknoten einen zentralen, hypointensen Kern aufwies, der von einem ansonsten homogen hyperintensen Lymphknotenparenchym umgeben war. Alle anderen Erscheinungsbilder wurden als negativ (-) für das Avocado Sign gewertet. Die Bewertung erfolgte für jeden sichtbaren mesorektalen Lymphknoten. Für die Patientenklassifikation galt ein Patient als AS-positiv, wenn mindestens ein Lymphknoten das Avocado Sign zeigte."
                            ]
                        },
                        {
                            id: "bildanalyse_t2_morphologie",
                            title: "T2-gewichtete morphologische Kriterienbewertung",
                            content_paragraphs: [
                                "Alle im hochauflösenden T2-gewichteten MRT sichtbaren mesorektalen Lymphknoten wurden systematisch erfasst und hinsichtlich folgender morphologischer Kriterien bewertet: Größe (Kurzachsendurchmesser in mm), Form ('rund' oder 'oval'), Kontur ('scharf' oder 'irregulär'), Binnensignal-Homogenität ('homogen' oder 'heterogen') und Signalintensität relativ zur umgebenden Muskulatur ('signalarm', 'intermediär', 'signalreich'). Diese Erfassung erfolgte prospektiv im Rahmen der ursprünglichen Datenerhebung und bildet die Basis für die Anwendung verschiedener T2-Kriteriensets in dieser Studie."
                            ]
                        },
                        {
                            id: "bildanalyse_t2_literatur",
                            title: "Literatur-basierte T2-Kriteriensets",
                            content_paragraphs: [
                                "Für den Vergleich mit dem Avocado Sign wurden drei etablierte T2-Kriteriensets aus der Literatur herangezogen und auf das Studienkollektiv angewendet:",
                                "1. Koh et al. (2008, Int J Radiat Oncol Biol Phys): Definiert einen Lymphknoten als suspekt, wenn eine irreguläre Kontur ODER ein heterogenes Binnensignal vorliegt. Dieses Kriterienset wurde in der Originalstudie primär im Kontext des Restagings nach nRCT evaluiert.",
                                "2. Barbaro et al. (2024, Radiother Oncol): Identifizierte einen optimalen Kurzachsendurchmesser-Cut-off von $\\geq 2.3\\,\\text{mm}$ als suspekt für maligne Lymphknoten im Restaging nach nRCT.",
                                "3. Rutegård et al. (2025, Eur Radiol) / ESGAR 2016 Kriterien: Diese evaluierten die Konsensus-Kriterien der European Society of Gastrointestinal and Abdominal Radiology (ESGAR) von 2016 (Beets-Tan et al., 2018 Eur Radiol) für das Primärstaging. Ein Lymphknoten gilt hier als suspekt bei: Kurzachse $\\geq 9\\,\\text{mm}$; ODER Kurzachse $5-8\\,\\text{mm}$ UND $\\geq 2$ der folgenden Merkmale: runde Form, irreguläre Kontur, heterogenes Signal; ODER Kurzachse $< 5\\,\\text{mm}$ UND ALLE 3 der genannten morphologischen Merkmale.",
                                "Die Anwendung dieser Kriteriensets erfolgte jeweils unter Berücksichtigung des am besten passenden Patientenkollektivs (siehe Ergebnisse)."
                            ]
                        },
                        {
                            id: "bildanalyse_t2_optimiert",
                            title: "Brute-Force-Optimierung von T2-Kriterien",
                            content_paragraphs: [
                                "Um die potenziell beste diagnostische Leistung T2-basierter Kriterien zu ermitteln, wurde ein Brute-Force-Optimierungsalgorithmus implementiert. Dieser testete systematisch alle sinnvollen Kombinationen der erfassten morphologischen T2-Merkmale (Größe als Schwellenwert von {{T2_SIZE_MIN_BF}} mm bis {{T2_SIZE_MAX_BF}} mm in {{T2_SIZE_STEP_BF}} mm Schritten; Form 'rund'/'oval'; Kontur 'scharf'/'irregulär'; Homogenität 'homogen'/'heterogen'; Signal 'signalarm'/'intermediär'/'signalreich') und der logischen Verknüpfungen ('UND' oder 'ODER'). Als Zielmetrik für die Maximierung wurde primär die Balanced Accuracy (alternativ AUC) gewählt. Diese Optimierung wurde für die Gesamtkohorte sowie für die Subgruppen 'Direkt OP' und 'nRCT' durchgeführt."
                            ]
                        },
                        {
                            id: "bildanalyse_referenzstandard",
                            title: "Referenzstandard",
                            content_paragraphs: [
                                "Als Referenzstandard für den Lymphknotenstatus diente in allen Fällen die histopathologische Untersuchung des Operationspräparats nach totaler mesorektaler Exzision. Ein Patient wurde als N-positiv (N+) klassifiziert, wenn mindestens ein Lymphknoten histopathologisch Metastasen aufwies; andernfalls als N-negativ (N-)."
                            ]
                        }
                    ]
                },
                {
                    id: "statistische_analyse",
                    title: "Statistische Analyse",
                    content_paragraphs: [
                        "Die deskriptive Statistik umfasste die Berechnung von Medianen, Mittelwerten, Standardabweichungen (SD), Minima und Maxima für kontinuierliche Variablen sowie Häufigkeiten und Prozentanteile für kategoriale Daten. Die diagnostische Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets wurde anhand von Sensitivität, Spezifität, positivem prädiktivem Wert (PPV), negativem prädiktivem Wert (NPV), Accuracy und der Fläche unter der Receiver Operating Characteristic Kurve (AUC) bewertet. Für binäre Tests wurde die Balanced Accuracy als Äquivalent zur AUC herangezogen. 95%-Konfidenzintervalle (CI) wurden für alle Gütekriterien berechnet (Wilson Score Intervall für Proportionen; Bootstrap Percentile Methode mit {{BOOTSTRAP_REPLICATIONS}} Replikationen für AUC/Balanced Accuracy und F1-Score).",
                        "Der Vergleich der diagnostischen Performance (Accuracy) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets erfolgte mittels McNemar-Test für gepaarte Daten. AUC-Werte wurden mit dem DeLong-Test verglichen. Alle statistischen Analysen wurden mit der hier beschriebenen, speziell entwickelten Webanwendung (Version {{APP_VERSION}}, basierend auf JavaScript ES6+) durchgeführt. Ein p-Wert von < {{SIGNIFICANCE_LEVEL}} wurde als statistisch signifikant interpretiert."
                    ]
                }
            ]
        },
        en: {
            title: "Methods",
            sections: [
                {
                    id: "studiendesign_patienten",
                    title: "Study Design and Patient Cohort",
                    content_paragraphs: [
                        "This retrospective, single-center study was conducted following approval by the local ethics committee (Klinikum St. Georg Leipzig, Germany, reference number: {{ETHIK_VOTUM_NUMMER}}), with a waiver for individual patient consent for this specific analysis due to the use of anonymized data from a previously approved research database. The study was performed in accordance with the Declaration of Helsinki.",
                        "Data from {{PATIENT_COUNT_GESAMT}} consecutive patients with histologically confirmed rectal cancer, who underwent standardized pelvic MRI examinations at our institution between January 2020 and November 2023, were analyzed. This cohort is identical to that of the original Avocado Sign study (Lurz & Schäfer, 2025 Eur Radiol [DOI: 10.1007/s00330-025-11462-y]).",
                        "Of these patients, {{PATIENT_COUNT_NRCT}} received neoadjuvant chemoradiotherapy (nRCT group), defined as radiotherapy with concomitant chemotherapy before surgery. {{PATIENT_COUNT_DIREKT_OP}} patients underwent primary surgery without neoadjuvant treatment (upfront surgery group).",
                        "Inclusion criteria for the original data collection comprised adult patients with histologically confirmed rectal adenocarcinoma and an MRI staging examination including contrast-enhanced T1-weighted sequences. Exclusion criteria were unresectable tumors and contraindications to MRI or the administration of gadolinium-based contrast agents. For the current analysis, all patients from the original cohort were included for whom complete data acquisition was available for both the Avocado Sign and the morphological T2 criteria of all detected mesorectal lymph nodes."
                    ]
                },
                {
                    id: "mrt_protokoll",
                    title: "MRI Protocol and Image Acquisition",
                    content_paragraphs: [
                        "All MRI examinations were performed on a 3.0-Tesla system (MAGNETOM Prisma Fit; Siemens Healthineers) using appropriate body and spine array coils. The detailed MRI protocol, including sequence parameters for T2-weighted and contrast-enhanced T1-weighted sequences, was identical to that described in the initial Avocado Sign study (Lurz & Schäfer, 2025 Eur Radiol). Briefly, it included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal orientations, and axial diffusion-weighted imaging (DWI). Following intravenous administration of a weight-adapted macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco), axial T1-weighted volumetric sequences with fat saturation (e.g., VIBE Dixon) were acquired. The imaging protocol was identical for primary staging and restaging (after nRCT)."
                    ]
                },
                {
                    id: "bildanalyse",
                    title: "Image Analysis",
                    sub_sections: [
                        {
                            id: "bildanalyse_as",
                            title: "Avocado Sign (AS) Assessment",
                            content_paragraphs: [
                                "The Avocado Sign was assessed on contrast-enhanced T1-weighted images with fat saturation, as defined in the original study (Lurz & Schäfer, 2025 Eur Radiol). The Avocado Sign was rated positive (+) if a lymph node exhibited a central, hypointense core surrounded by otherwise homogeneously hyperintense lymph node parenchyma. All other appearances were rated negative (-) for the Avocado Sign. Assessment was performed for every visible mesorectal lymph node. For patient classification, a patient was considered AS-positive if at least one lymph node showed the Avocado Sign."
                            ]
                        },
                        {
                            id: "bildanalyse_t2_morphologie",
                            title: "T2-Weighted Morphological Criteria Assessment",
                            content_paragraphs: [
                                "All mesorectal lymph nodes visible on high-resolution T2-weighted MRI were systematically recorded and assessed for the following morphological criteria: size (short-axis diameter in mm), shape ('round' or 'oval'), border ('sharp' or 'irregular'), internal signal homogeneity ('homogeneous' or 'heterogeneous'), and signal intensity relative to surrounding muscle ('signal-poor', 'intermediate', 'signal-rich'). This assessment was performed prospectively during the original data collection and forms the basis for applying various T2 criteria sets in this study."
                            ]
                        },
                        {
                            id: "bildanalyse_t2_literatur",
                            title: "Literature-Based T2 Criteria Sets",
                            content_paragraphs: [
                                "For comparison with the Avocado Sign, three established T2 criteria sets from the literature were applied to the study cohort:",
                                "1. Koh et al. (2008, Int J Radiat Oncol Biol Phys): Defines a lymph node as suspicious if it has an irregular border OR heterogeneous internal signal. This set was primarily evaluated in the context of restaging after nRCT in the original study.",
                                "2. Barbaro et al. (2024, Radiother Oncol): Identified an optimal short-axis diameter cut-off of $\\geq 2.3\\,\\text{mm}$ as suspicious for malignant lymph nodes in restaging after nRCT.",
                                "3. Rutegård et al. (2025, Eur Radiol) / ESGAR 2016 Criteria: These authors evaluated the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus criteria (Beets-Tan et al., 2018 Eur Radiol) for primary staging. A lymph node is considered suspicious if: short-axis $\\geq 9\\,\\text{mm}$; OR short-axis $5-8\\,\\text{mm}$ AND $\\geq 2$ of the following features: round shape, irregular border, heterogeneous signal; OR short-axis $< 5\\,\\text{mm}$ AND ALL 3 of the mentioned morphological features.",
                                "These criteria sets were applied considering the most appropriate patient cohort for each (see Results)."
                            ]
                        },
                        {
                            id: "bildanalyse_t2_optimiert",
                            title: "Brute-Force Optimization of T2 Criteria",
                            content_paragraphs: [
                                "To determine the potentially best diagnostic performance of T2-based criteria, a brute-force optimization algorithm was implemented. This algorithm systematically tested all meaningful combinations of the recorded morphological T2 features (size as a threshold from {{T2_SIZE_MIN_BF}} mm to {{T2_SIZE_MAX_BF}} mm in {{T2_SIZE_STEP_BF}} mm increments; shape 'round'/'oval'; border 'sharp'/'irregular'; homogeneity 'homogeneous'/'heterogeneous'; signal 'signal-poor'/'intermediate'/'signal-rich') and logical operators ('AND' or 'OR'). The primary target metric for maximization was Balanced Accuracy (alternatively AUC). This optimization was performed for the total cohort and for the 'upfront surgery' and 'nRCT' subgroups."
                            ]
                        },
                        {
                            id: "bildanalyse_referenzstandard",
                            title: "Reference Standard",
                            content_paragraphs: [
                                "Histopathological examination of the surgical specimen after total mesorectal excision served as the reference standard for lymph node status in all cases. A patient was classified as N-positive (N+) if at least one lymph node showed metastases on histopathology; otherwise, as N-negative (N-)."
                            ]
                        }
                    ]
                },
                {
                    id: "statistische_analyse",
                    title: "Statistical Analysis",
                    content_paragraphs: [
                        "Descriptive statistics included the calculation of medians, means, standard deviations (SD), minima, and maxima for continuous variables, and frequencies and percentages for categorical data. The diagnostic performance of the Avocado Sign and the various T2 criteria sets was assessed using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy, and the area under the Receiver Operating Characteristic (ROC) curve (AUC). For binary tests, balanced accuracy was used as an equivalent to AUC. 95% confidence intervals (CI) were calculated for all performance metrics (Wilson score interval for proportions; bootstrap percentile method with {{BOOTSTRAP_REPLICATIONS}} replications for AUC/balanced accuracy and F1-score).",
                        "The comparison of diagnostic performance (accuracy) between the Avocado Sign and the respective T2 criteria sets was performed using McNemar's test for paired data. AUC values were compared using DeLong's test. All statistical analyses were performed using the custom-developed web application described herein (version {{APP_VERSION}}, based on JavaScript ES6+). A p-value < {{SIGNIFICANCE_LEVEL}} was considered statistically significant."
                    ]
                }
            ]
        },
    },
    ergebnisse: {
        de: {
            title: "Ergebnisse",
            sections: [
                {
                    id: "patientenkohorte",
                    title: "Patientenkohorte",
                    content_paragraphs: [
                        "Die Analyse umfasste insgesamt {{PATIENT_COUNT_GESAMT}} Patienten. Das mediane Alter betrug {{MEDIAN_ALTER_GESAMT}} Jahre (Bereich: {{MIN_ALTER_GESAMT}}–{{MAX_ALTER_GESAMT}} Jahre), und {{ANZAHL_MAENNLICH_GESAMT}} ({{PROZENT_MAENNLICH_GESAMT}}%) waren männlich. {{PATIENT_COUNT_DIREKT_OP}} Patienten ({{PROZENT_DIREKT_OP}}%) wurden primär operiert (Direkt-OP-Gruppe), während {{PATIENT_COUNT_NRCT}} Patienten ({{PROZENT_NRCT}}%) eine neoadjuvante Radiochemotherapie erhielten (nRCT-Gruppe).",
                        "Histopathologisch bestätigte Lymphknotenmetastasen (N+) lagen bei {{ANZAHL_NPLUS_GESAMT}} von {{PATIENT_COUNT_GESAMT}} Patienten ({{PROZENT_NPLUS_GESAMT}}%) in der Gesamtkohorte vor. In der Direkt-OP-Gruppe waren dies {{ANZAHL_NPLUS_DIREKT_OP}} von {{PATIENT_COUNT_DIREKT_OP}} Patienten ({{PROZENT_NPLUS_DIREKT_OP}}%) und in der nRCT-Gruppe {{ANZAHL_NPLUS_NRCT}} von {{PATIENT_COUNT_NRCT}} Patienten ({{PROZENT_NPLUS_NRCT}}%). Die detaillierten Patientencharakteristika sind in Tabelle {{TABLE_REF_PAT_CHARS}} zusammengefasst."
                    ]
                },
                {
                    id: "performance_as",
                    title: "Diagnostische Güte des Avocado Signs",
                    content_paragraphs: [
                        "In der Gesamtkohorte (N={{PATIENT_COUNT_GESAMT}}) erreichte das Avocado Sign zur Vorhersage des N-Status eine AUC von {{AS_AUC_GESAMT}} (95% CI {{AS_AUC_CI_GESAMT_LOWER}} – {{AS_AUC_CI_GESAMT_UPPER}}), eine Accuracy von {{AS_ACC_GESAMT}} (95% CI {{AS_ACC_CI_GESAMT_LOWER}} – {{AS_ACC_CI_GESAMT_UPPER}}), eine Sensitivität von {{AS_SENS_GESAMT}} (95% CI {{AS_SENS_CI_GESAMT_LOWER}} – {{AS_SENS_CI_GESAMT_UPPER}}) und eine Spezifität von {{AS_SPEZ_GESAMT}} (95% CI {{AS_SPEZ_CI_GESAMT_LOWER}} – {{AS_SPEZ_CI_GESAMT_UPPER}}). Der PPV betrug {{AS_PPV_GESAMT}} (95% CI {{AS_PPV_CI_GESAMT_LOWER}} – {{AS_PPV_CI_GESAMT_UPPER}}) und der NPV {{AS_NPV_GESAMT}} (95% CI {{AS_NPV_CI_GESAMT_LOWER}} – {{AS_NPV_CI_GESAMT_UPPER}}).",
                        "Für die Subgruppe der primär operierten Patienten (Direkt-OP, N={{PATIENT_COUNT_DIREKT_OP}}) ergab sich eine AUC von {{AS_AUC_DIREKT_OP}} (95% CI {{AS_AUC_CI_DIREKT_OP_LOWER}} – {{AS_AUC_CI_DIREKT_OP_UPPER}}), eine Accuracy von {{AS_ACC_DIREKT_OP}} (95% CI ...), eine Sensitivität von {{AS_SENS_DIREKT_OP}} (95% CI ...) und eine Spezifität von {{AS_SPEZ_DIREKT_OP}} (95% CI ...).",
                        "In der nRCT-Gruppe (N={{PATIENT_COUNT_NRCT}}) zeigte das Avocado Sign eine AUC von {{AS_AUC_NRCT}} (95% CI {{AS_AUC_CI_NRCT_LOWER}} – {{AS_AUC_CI_NRCT_UPPER}}), eine Accuracy von {{AS_ACC_NRCT}} (95% CI ...), eine Sensitivität von {{AS_SENS_NRCT}} (95% CI ...) und eine Spezifität von {{AS_SPEZ_NRCT}} (95% CI ...). Die detaillierten Performance-Metriken für das Avocado Sign in den jeweiligen Kollektiven sind in Tabelle {{TABLE_REF_AS_PERFORMANCE}} aufgeführt."
                    ]
                },
                {
                    id: "performance_t2_literatur",
                    title: "Diagnostische Güte der Literatur-basierten T2-Kriterien",
                    content_paragraphs: [
                        "Die Kriterien nach Koh et al. (2008), angewendet auf die {{KOH_APPLICABLE_KOLLEKTIV_NAME}} (N={{KOH_PATIENT_COUNT}}), zeigten eine AUC von {{KOH_AUC}} (95% CI {{KOH_AUC_CI_LOWER}} – {{KOH_AUC_CI_UPPER}}), eine Accuracy von {{KOH_ACC}} (95% CI ...), eine Sensitivität von {{KOH_SENS}} (95% CI ...) und eine Spezifität von {{KOH_SPEZ}} (95% CI ...).",
                        "Die Kriterien nach Barbaro et al. (2024) (Cut-off $\\geq 2.3\\,\\text{mm}$), angewendet auf die {{BARBARO_APPLICABLE_KOLLEKTIV_NAME}} (N={{BARBARO_PATIENT_COUNT}}), erreichten eine AUC von {{BARBARO_AUC}} (95% CI {{BARBARO_AUC_CI_LOWER}} – {{BARBARO_AUC_CI_UPPER}}), eine Accuracy von {{BARBARO_ACC}} (95% CI ...), eine Sensitivität von {{BARBARO_SENS}} (95% CI ...) und eine Spezifität von {{BARBARO_SPEZ}} (95% CI ...).",
                        "Die ESGAR 2016 Kriterien (evaluiert durch Rutegård et al., 2025), angewendet auf die {{RUTEGARD_APPLICABLE_KOLLEKTIV_NAME}} (N={{RUTEGARD_PATIENT_COUNT}}), resultierten in einer AUC von {{RUTEGARD_AUC}} (95% CI {{RUTEGARD_AUC_CI_LOWER}} – {{RUTEGARD_AUC_CI_UPPER}}), einer Accuracy von {{RUTEGARD_ACC}} (95% CI ...), einer Sensitivität von {{RUTEGARD_SENS}} (95% CI ...) und einer Spezifität von {{RUTEGARD_SPEZ}} (95% CI ...). Detaillierte Werte finden sich in Tabelle {{TABLE_REF_LIT_T2_PERFORMANCE}}."
                    ]
                },
                {
                    id: "vergleich_as_vs_t2_literatur",
                    title: "Vergleich: Avocado Sign vs. Literatur-T2-Kriterien",
                    content_paragraphs: [
                        "Im direkten Vergleich auf dem Kollektiv der {{KOH_APPLICABLE_KOLLEKTIV_NAME}} war die AUC des Avocado Signs ({{AS_AUC_FOR_KOH_KOLLEKTIV}}) numerisch {{AS_VS_KOH_AUC_DIRECTION}} als die der Koh-Kriterien ({{KOH_AUC}}) (DeLong-Test: p={{AS_VS_KOH_P_DELONG}}). Die Accuracy des AS ({{AS_ACC_FOR_KOH_KOLLEKTIV}}) war {{AS_VS_KOH_ACC_DIRECTION}} als die der Koh-Kriterien ({{KOH_ACC}}) (McNemar-Test: p={{AS_VS_KOH_P_MCNEMAR}}).",
                        "Auf dem Kollektiv der {{BARBARO_APPLICABLE_KOLLEKTIV_NAME}} zeigte das Avocado Sign (AUC {{AS_AUC_FOR_BARBARO_KOLLEKTIV}}) eine {{AS_VS_BARBARO_AUC_DIRECTION}} AUC im Vergleich zu den Barbaro-Kriterien ({{BARBARO_AUC}}) (DeLong-Test: p={{AS_VS_BARBARO_P_DELONG}}). Die Accuracy war {{AS_VS_BARBARO_ACC_DIRECTION}} (AS {{AS_ACC_FOR_BARBARO_KOLLEKTIV}} vs. Barbaro {{BARBARO_ACC}}; McNemar: p={{AS_VS_BARBARO_P_MCNEMAR}}).",
                        "Im Vergleich mit den ESGAR 2016 Kriterien auf dem Kollektiv der {{RUTEGARD_APPLICABLE_KOLLEKTIV_NAME}} war die AUC des AS ({{AS_AUC_FOR_RUTEGARD_KOLLEKTIV}}) {{AS_VS_RUTEGARD_AUC_DIRECTION}} (ESGAR {{RUTEGARD_AUC}}; DeLong: p={{AS_VS_RUTEGARD_P_DELONG}}), und die Accuracy war {{AS_VS_RUTEGARD_ACC_DIRECTION}} (AS {{AS_ACC_FOR_RUTEGARD_KOLLEKTIV}} vs. ESGAR {{RUTEGARD_ACC}}; McNemar: p={{AS_VS_RUTEGARD_P_MCNEMAR}}). Siehe Tabelle {{TABLE_REF_AS_VS_LIT_T2_COMPARISON}} für Details."
                    ]
                },
                {
                    id: "performance_t2_optimiert",
                    title: "Diagnostische Güte der Brute-Force-optimierten T2-Kriterien",
                    content_paragraphs: [
                        "Die mittels Brute-Force-Optimierung (Zielmetrik: Balanced Accuracy) identifizierten T2-Kriterien für die **Gesamtkohorte** ({{BF_GESAMT_LOGIC_OPERATOR}}: {{BF_GESAMT_KRITERIEN_TEXT}}) erreichten eine AUC von {{BF_AUC_GESAMT}} (95% CI {{BF_AUC_CI_GESAMT_LOWER}} – {{BF_AUC_CI_GESAMT_UPPER}}), eine Accuracy von {{BF_ACC_GESAMT}} (95% CI ...), eine Sensitivität von {{BF_SENS_GESAMT}} (95% CI ...) und eine Spezifität von {{BF_SPEZ_GESAMT}} (95% CI ...).",
                        "Für die **Direkt-OP-Gruppe** lauteten die optimierten Kriterien {{BF_DIREKT_OP_LOGIC_OPERATOR}}: {{BF_DIREKT_OP_KRITERIEN_TEXT}}. Damit wurde eine AUC von {{BF_AUC_DIREKT_OP}} (95% CI ...) erzielt (Accuracy {{BF_ACC_DIREKT_OP}}, Sens. {{BF_SENS_DIREKT_OP}}, Spez. {{BF_SPEZ_DIREKT_OP}}).",
                        "In der **nRCT-Gruppe** wurden als beste Kriterien {{BF_NRCT_LOGIC_OPERATOR}}: {{BF_NRCT_KRITERIEN_TEXT}} identifiziert, mit einer AUC von {{BF_AUC_NRCT}} (95% CI ...) (Accuracy {{BF_ACC_NRCT}}, Sens. {{BF_SENS_NRCT}}, Spez. {{BF_SPEZ_NRCT}}). Detaillierte Ergebnisse sind in Tabelle {{TABLE_REF_BF_T2_PERFORMANCE}} dargestellt."
                    ]
                },
                {
                    id: "vergleich_as_vs_t2_optimiert",
                    title: "Vergleich: Avocado Sign vs. Brute-Force-optimierte T2-Kriterien",
                    content_paragraphs: [
                        "Im Vergleich zu den Brute-Force-optimierten T2-Kriterien zeigte das Avocado Sign in der **Gesamtkohorte** eine {{AS_VS_BF_AUC_DIRECTION_GESAMT}} AUC (AS {{AS_AUC_GESAMT}} vs. BF-T2 {{BF_AUC_GESAMT}}; DeLong-Test: p={{AS_VS_BF_P_DELONG_GESAMT}}) und eine {{AS_VS_BF_ACC_DIRECTION_GESAMT}} Accuracy (AS {{AS_ACC_GESAMT}} vs. BF-T2 {{BF_ACC_GESAMT}}; McNemar-Test: p={{AS_VS_BF_P_MCNEMAR_GESAMT}}).",
                        "In der **Direkt-OP-Gruppe** war die AUC des AS {{AS_VS_BF_AUC_DIRECTION_DIREKT_OP}} (AS {{AS_AUC_DIREKT_OP}} vs. BF-T2 {{BF_AUC_DIREKT_OP}}; DeLong: p={{AS_VS_BF_P_DELONG_DIREKT_OP}}), die Accuracy {{AS_VS_BF_ACC_DIRECTION_DIREKT_OP}} (AS {{AS_ACC_DIREKT_OP}} vs. BF-T2 {{BF_ACC_DIREKT_OP}}; McNemar: p={{AS_VS_BF_P_MCNEMAR_DIREKT_OP}}).",
                        "Für die **nRCT-Gruppe** zeigte sich eine {{AS_VS_BF_AUC_DIRECTION_NRCT}} AUC für das AS ({{AS_AUC_NRCT}}) im Vergleich zu den optimierten T2-Kriterien ({{BF_AUC_NRCT}}; DeLong: p={{AS_VS_BF_P_DELONG_NRCT}}). Die Accuracy war {{AS_VS_BF_ACC_DIRECTION_NRCT}} (AS {{AS_ACC_NRCT}} vs. BF-T2 {{BF_ACC_NRCT}}; McNemar: p={{AS_VS_BF_P_MCNEMAR_NRCT}}). Details siehe Tabelle {{TABLE_REF_AS_VS_BF_T2_COMPARISON}}."
                    ]
                }
            ]
        },
        en: {
            title: "Results",
            sections: [
                {
                    id: "patientenkohorte",
                    title: "Patient Cohort",
                    content_paragraphs: [
                        "A total of {{PATIENT_COUNT_GESAMT}} patients were included in this analysis. The median age was {{MEDIAN_ALTER_GESAMT}} years (range: {{MIN_ALTER_GESAMT}}–{{MAX_ALTER_GESAMT}} years), and {{ANZAHL_MAENNLICH_GESAMT}} ({{PROZENT_MAENNLICH_GESAMT}}%) were male. {{PATIENT_COUNT_DIREKT_OP}} patients ({{PROZENT_DIREKT_OP}}%) underwent upfront surgery (upfront surgery group), while {{PATIENT_COUNT_NRCT}} patients ({{PROZENT_NRCT}}%) received neoadjuvant chemoradiotherapy (nRCT group).",
                        "Histopathologically confirmed lymph node metastases (N+) were present in {{ANZAHL_NPLUS_GESAMT}} of {{PATIENT_COUNT_GESAMT}} patients ({{PROZENT_NPLUS_GESAMT}}%) in the overall cohort. In the upfront surgery group, {{ANZAHL_NPLUS_DIREKT_OP}} of {{PATIENT_COUNT_DIREKT_OP}} patients ({{PROZENT_NPLUS_DIREKT_OP}}%) were N+, and in the nRCT group, {{ANZAHL_NPLUS_NRCT}} of {{PATIENT_COUNT_NRCT}} patients ({{PROZENT_NPLUS_NRCT}}%) were N+. Detailed patient characteristics are summarized in Table {{TABLE_REF_PAT_CHARS}}."
                    ]
                },
                {
                    id: "performance_as",
                    title: "Diagnostic Performance of the Avocado Sign",
                    content_paragraphs: [
                        "In the overall cohort (N={{PATIENT_COUNT_GESAMT}}), the Avocado Sign achieved an AUC of {{AS_AUC_GESAMT}} (95% CI {{AS_AUC_CI_GESAMT_LOWER}} – {{AS_AUC_CI_GESAMT_UPPER}}) for predicting N-status, with an accuracy of {{AS_ACC_GESAMT}} (95% CI {{AS_ACC_CI_GESAMT_LOWER}} – {{AS_ACC_CI_GESAMT_UPPER}}), sensitivity of {{AS_SENS_GESAMT}} (95% CI {{AS_SENS_CI_GESAMT_LOWER}} – {{AS_SENS_CI_GESAMT_UPPER}}%), and specificity of {{AS_SPEZ_GESAMT}} (95% CI {{AS_SPEZ_CI_GESAMT_LOWER}} – {{AS_SPEZ_CI_GESAMT_UPPER}}). The PPV was {{AS_PPV_GESAMT}} (95% CI {{AS_PPV_CI_GESAMT_LOWER}} – {{AS_PPV_CI_GESAMT_UPPER}}), and the NPV was {{AS_NPV_GESAMT}} (95% CI {{AS_NPV_CI_GESAMT_LOWER}} – {{AS_NPV_CI_GESAMT_UPPER}}).",
                        "For the upfront surgery subgroup (N={{PATIENT_COUNT_DIREKT_OP}}), the AUC was {{AS_AUC_DIREKT_OP}} (95% CI {{AS_AUC_CI_DIREKT_OP_LOWER}} – {{AS_AUC_CI_DIREKT_OP_UPPER}}), accuracy {{AS_ACC_DIREKT_OP}} (95% CI ...), sensitivity {{AS_SENS_DIREKT_OP}} (95% CI ...), and specificity {{AS_SPEZ_DIREKT_OP}} (95% CI ...).",
                        "In the nRCT group (N={{PATIENT_COUNT_NRCT}}), the Avocado Sign showed an AUC of {{AS_AUC_NRCT}} (95% CI {{AS_AUC_CI_NRCT_LOWER}} – {{AS_AUC_CI_NRCT_UPPER}}), accuracy of {{AS_ACC_NRCT}} (95% CI ...), sensitivity of {{AS_SENS_NRCT}} (95% CI ...), and specificity of {{AS_SPEZ_NRCT}} (95% CI ...). Detailed performance metrics for the Avocado Sign in the respective cohorts are presented in Table {{TABLE_REF_AS_PERFORMANCE}}."
                    ]
                },
                {
                    id: "performance_t2_literatur",
                    title: "Diagnostic Performance of Literature-Based T2 Criteria",
                    content_paragraphs: [
                        "The criteria by Koh et al. (2008), applied to the {{KOH_APPLICABLE_KOLLEKTIV_NAME}} (N={{KOH_PATIENT_COUNT}}), yielded an AUC of {{KOH_AUC}} (95% CI {{KOH_AUC_CI_LOWER}} – {{KOH_AUC_CI_UPPER}}), an accuracy of {{KOH_ACC}} (95% CI ...), a sensitivity of {{KOH_SENS}} (95% CI ...), and a specificity of {{KOH_SPEZ}} (95% CI ...).",
                        "The criteria by Barbaro et al. (2024) (cut-off $\\geq 2.3\\,\\text{mm}$), applied to the {{BARBARO_APPLICABLE_KOLLEKTIV_NAME}} (N={{BARBARO_PATIENT_COUNT}}), achieved an AUC of {{BARBARO_AUC}} (95% CI {{BARBARO_AUC_CI_LOWER}} – {{BARBARO_AUC_CI_UPPER}}), an accuracy of {{BARBARO_ACC}} (95% CI ...), a sensitivity of {{BARBARO_SENS}} (95% CI ...), and a specificity of {{BARBARO_SPEZ}} (95% CI ...).",
                        "The ESGAR 2016 criteria (evaluated by Rutegård et al., 2025), applied to the {{RUTEGARD_APPLICABLE_KOLLEKTIV_NAME}} (N={{RUTEGARD_PATIENT_COUNT}}), resulted in an AUC of {{RUTEGARD_AUC}} (95% CI {{RUTEGARD_AUC_CI_LOWER}} – {{RUTEGARD_AUC_CI_UPPER}}), an accuracy of {{RUTEGARD_ACC}} (95% CI ...), a sensitivity of {{RUTEGARD_SENS}} (95% CI ...), and a specificity of {{RUTEGARD_SPEZ}} (95% CI ...). Detailed values can be found in Table {{TABLE_REF_LIT_T2_PERFORMANCE}}."
                    ]
                },
                {
                    id: "vergleich_as_vs_t2_literatur",
                    title: "Comparison: Avocado Sign vs. Literature-Based T2 Criteria",
                    content_paragraphs: [
                        "In a direct comparison within the {{KOH_APPLICABLE_KOLLEKTIV_NAME}} cohort, the AUC of the Avocado Sign ({{AS_AUC_FOR_KOH_KOLLEKTIV}}) was numerically {{AS_VS_KOH_AUC_DIRECTION}} than that of the Koh criteria ({{KOH_AUC}}) (DeLong's test: p={{AS_VS_KOH_P_DELONG}}). The accuracy of AS ({{AS_ACC_FOR_KOH_KOLLEKTIV}}) was {{AS_VS_KOH_ACC_DIRECTION}} than that of the Koh criteria ({{KOH_ACC}}) (McNemar's test: p={{AS_VS_KOH_P_MCNEMAR}}).",
                        "Within the {{BARBARO_APPLICABLE_KOLLEKTIV_NAME}} cohort, the Avocado Sign (AUC {{AS_AUC_FOR_BARBARO_KOLLEKTIV}}) showed a {{AS_VS_BARBARO_AUC_DIRECTION}} AUC compared to the Barbaro criteria ({{BARBARO_AUC}}) (DeLong's test: p={{AS_VS_BARBARO_P_DELONG}}). Its accuracy was {{AS_VS_BARBARO_ACC_DIRECTION}} (AS {{AS_ACC_FOR_BARBARO_KOLLEKTIV}} vs. Barbaro {{BARBARO_ACC}}; McNemar: p={{AS_VS_BARBARO_P_MCNEMAR}}).",
                        "Compared to the ESGAR 2016 criteria in the {{RUTEGARD_APPLICABLE_KOLLEKTIV_NAME}} cohort, the AUC of AS ({{AS_AUC_FOR_RUTEGARD_KOLLEKTIV}}) was {{AS_VS_RUTEGARD_AUC_DIRECTION}} (ESGAR {{RUTEGARD_AUC}}; DeLong: p={{AS_VS_RUTEGARD_P_DELONG}}), and the accuracy was {{AS_VS_RUTEGARD_ACC_DIRECTION}} (AS {{AS_ACC_FOR_RUTEGARD_KOLLEKTIV}} vs. ESGAR {{RUTEGARD_ACC}}; McNemar: p={{AS_VS_RUTEGARD_P_MCNEMAR}}). See Table {{TABLE_REF_AS_VS_LIT_T2_COMPARISON}} for details."
                    ]
                },
                {
                    id: "performance_t2_optimiert",
                    title: "Diagnostic Performance of Brute-Force Optimized T2 Criteria",
                    content_paragraphs: [
                        "The T2 criteria identified by brute-force optimization (target metric: Balanced Accuracy) for the **overall cohort** ({{BF_GESAMT_LOGIC_OPERATOR}}: {{BF_GESAMT_KRITERIEN_TEXT}}) achieved an AUC of {{BF_AUC_GESAMT}} (95% CI {{BF_AUC_CI_GESAMT_LOWER}} – {{BF_AUC_CI_GESAMT_UPPER}}), an accuracy of {{BF_ACC_GESAMT}} (95% CI ...), a sensitivity of {{BF_SENS_GESAMT}} (95% CI ...), and a specificity of {{BF_SPEZ_GESAMT}} (95% CI ...).",
                        "For the **upfront surgery group**, the optimized criteria were {{BF_DIREKT_OP_LOGIC_OPERATOR}}: {{BF_DIREKT_OP_KRITERIEN_TEXT}}. This resulted in an AUC of {{BF_AUC_DIREKT_OP}} (95% CI ...) (accuracy {{BF_ACC_DIREKT_OP}}, sens. {{BF_SENS_DIREKT_OP}}, spec. {{BF_SPEZ_DIREKT_OP}}).",
                        "In the **nRCT group**, the best criteria identified were {{BF_NRCT_LOGIC_OPERATOR}}: {{BF_NRCT_KRITERIEN_TEXT}}, yielding an AUC of {{BF_AUC_NRCT}} (95% CI ...) (accuracy {{BF_ACC_NRCT}}, sens. {{BF_SENS_NRCT}}, spec. {{BF_SPEZ_NRCT}}). Detailed results are presented in Table {{TABLE_REF_BF_T2_PERFORMANCE}}."
                    ]
                },
                {
                    id: "vergleich_as_vs_t2_optimiert",
                    title: "Comparison: Avocado Sign vs. Brute-Force Optimized T2 Criteria",
                    content_paragraphs: [
                        "Compared to the brute-force optimized T2 criteria, the Avocado Sign showed a {{AS_VS_BF_AUC_DIRECTION_GESAMT}} AUC in the **overall cohort** (AS {{AS_AUC_GESAMT}} vs. BF-T2 {{BF_AUC_GESAMT}}; DeLong's test: p={{AS_VS_BF_P_DELONG_GESAMT}}) and a {{AS_VS_BF_ACC_DIRECTION_GESAMT}} accuracy (AS {{AS_ACC_GESAMT}} vs. BF-T2 {{BF_ACC_GESAMT}}; McNemar's test: p={{AS_VS_BF_P_MCNEMAR_GESAMT}}).",
                        "In the **upfront surgery group**, the AUC of AS was {{AS_VS_BF_AUC_DIRECTION_DIREKT_OP}} (AS {{AS_AUC_DIREKT_OP}} vs. BF-T2 {{BF_AUC_DIREKT_OP}}; DeLong: p={{AS_VS_BF_P_DELONG_DIREKT_OP}}), and accuracy was {{AS_VS_BF_ACC_DIRECTION_DIREKT_OP}} (AS {{AS_ACC_DIREKT_OP}} vs. BF-T2 {{BF_ACC_DIREKT_OP}}; McNemar: p={{AS_VS_BF_P_MCNEMAR_DIREKT_OP}}).",
                        "For the **nRCT group**, the Avocado Sign demonstrated a {{AS_VS_BF_AUC_DIRECTION_NRCT}} AUC ({{AS_AUC_NRCT}}) compared to the optimized T2 criteria ({{BF_AUC_NRCT}}; DeLong: p={{AS_VS_BF_P_DELONG_NRCT}}). The accuracy was {{AS_VS_BF_ACC_DIRECTION_NRCT}} (AS {{AS_ACC_NRCT}} vs. BF-T2 {{BF_ACC_NRCT}}; McNemar: p={{AS_VS_BF_P_MCNEMAR_NRCT}}). Details are provided in Table {{TABLE_REF_AS_VS_BF_T2_COMPARISON}}."
                    ]
                }
            ]
        }
    }
};

deepFreeze(PUBLICATION_CONTENT);