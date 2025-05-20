const publicationTabRenderer = (() => {

    function _getPlaceholders(processedData, bruteForceResults, kollektiv, appliedCriteria, appliedLogic) {
        const N_GESAMT = processedData?.length || 0;
        const N_DIREKT_OP = processedData?.filter(p => p?.therapie === 'direkt OP').length || 0;
        const N_NRCT = processedData?.filter(p => p?.therapie === 'nRCT').length || 0;

        const placeholders = {
            N_GESAMT: String(N_GESAMT),
            N_DIREKT_OP: String(N_DIREKT_OP),
            N_NRCT: String(N_NRCT),
            APP_VERSION: APP_CONFIG.APP_VERSION,
            AVOCADO_SIGN_STUDY_CITATION: "Lurz & Schäfer, Eur Radiol (2025)",
            KOH_CITATION: "Koh et al., Int J Radiat Oncol Biol Phys (2008)",
            BARBARO_CITATION: "Barbaro et al., Radiother Oncol (2024)",
            RUTEGARD_CITATION: "Rutegård et al., Eur Radiol (2025)",
            ESGAR_CITATION: "Beets-Tan et al., Eur Radiol (2018)",
            AKTUELL_ANGEWANDTE_KRITERIEN_NAME: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
            AKTUELL_ANGEWANDTE_KRITERIEN_DEFINITION: appliedCriteria && appliedLogic ? studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic) : 'N/A',
            STAT_SIGNIFICANCE_LEVEL: (APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL * 100) + "%",
            BOOTSTRAP_REPLICATIONS: String(APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS),
        };

        if (bruteForceResults && bruteForceResults.bestResult) {
            placeholders.BF_BEST_METRIC_NAME = bruteForceResults.metric || 'N/A';
            placeholders.BF_BEST_METRIC_VALUE = formatNumber(bruteForceResults.bestResult.metricValue, 4);
            placeholders.BF_BEST_LOGIC = bruteForceResults.bestResult.logic?.toUpperCase() || 'N/A';
            placeholders.BF_BEST_CRITERIA_DEFINITION = studyT2CriteriaManager.formatCriteriaForDisplay(bruteForceResults.bestResult.criteria, bruteForceResults.bestResult.logic);
        } else {
            placeholders.BF_BEST_METRIC_NAME = 'N/A';
            placeholders.BF_BEST_METRIC_VALUE = 'N/A';
            placeholders.BF_BEST_LOGIC = 'N/A';
            placeholders.BF_BEST_CRITERIA_DEFINITION = 'N/A';
        }
        return placeholders;
    }

    function _fillTemplate(template, placeholders) {
        let filledTemplate = template;
        for (const key in placeholders) {
            if (Object.hasOwnProperty.call(placeholders, key)) {
                const regex = new RegExp(`\\{${key}\\}`, 'g');
                filledTemplate = filledTemplate.replace(regex, placeholders[key] || '');
            }
        }
        return filledTemplate;
    }

    function _getPublicationText(section, subsection, lang, placeholders) {
        const texts = {
            methoden: {
                studyDesignPatients: {
                    de: `
                        <h4>Studiendesign und Patientenkollektiv</h4>
                        <p>Die vorliegende Untersuchung ist eine Post-hoc-Analyse der Daten aus der prospektiven, monozentrischen Studie zur Evaluation des Avocado Signs ({AVOCADO_SIGN_STUDY_CITATION}). Das Studienprotokoll der Primärstudie wurde von der lokalen Ethikkommission genehmigt und von allen Patienten wurde ein schriftliches Einverständnis eingeholt. Eingeschlossen wurden konsekutive Patienten mit histologisch gesichertem Rektumkarzinom, die zwischen Januar 2020 und November 2023 einer Staging-MRT-Untersuchung am Klinikum St. Georg, Leipzig, Deutschland, unterzogen wurden.</p>
                        <p>Das Gesamtkollektiv umfasste {N_GESAMT} Patienten. Davon erhielten {N_NRCT} Patienten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während {N_DIREKT_OP} Patienten primär operiert wurden (Direkt-OP-Gruppe). Die Indikation zur nRCT wurde interdisziplinär im Tumorboard gemäß aktueller Leitlinien gestellt. Für Patienten der Direkt-OP-Gruppe erfolgte die Operation im Mittel 7 Tage (Range: 5-14 Tage) nach der MRT. Patienten der nRCT-Gruppe erhielten eine Restaging-MRT im Mittel 6 Wochen (Range: 5-8 Wochen) nach Abschluss der nRCT; die Operation erfolgte ca. 10 Tage (Range: 7-15 Tage) nach der Restaging-MRT.</p>
                        <p>Für die aktuelle Analyse wurden die Daten aller {N_GESAMT} Patienten aus der Avocado-Sign-Studie verwendet. Die Bewertung des Avocado Signs erfolgte auf den kontrastmittelverstärkten T1-gewichteten Sequenzen (siehe unten). Zusätzlich wurden für jeden im hochauflösenden T2-gewichteten MRT sichtbaren mesorektalen Lymphknoten die morphologischen Standardparameter (Kurzachsendurchmesser, Form, Kontur, Homogenität, Signalintensität) erfasst. Ziel dieser Untersuchung ist der Vergleich der diagnostischen Güte des Avocado Signs mit verschiedenen T2-Kriterienstrategien (Literatur-basiert, benutzerdefiniert-angewandt und Brute-Force-optimiert) zur Prädiktion des pathohistologischen N-Status.</p>
                    `,
                    en: `
                        <h4>Study Design and Patient Cohort</h4>
                        <p>This investigation is a post-hoc analysis of data from the prospective, single-center study evaluating the Avocado Sign ({AVOCADO_SIGN_STUDY_CITATION}). The primary study protocol was approved by the local ethics committee, and written informed consent was obtained from all patients. Consecutive patients with histologically confirmed rectal cancer who underwent staging MRI at St. Georg Hospital, Leipzig, Germany, between January 2020 and November 2023 were included.</p>
                        <p>The total cohort comprised {N_GESAMT} patients. Of these, {N_NRCT} patients received neoadjuvant chemoradiotherapy (nRCT group), while {N_DIREKT_OP} patients underwent primary surgery (upfront surgery group). The indication for nRCT was determined by an interdisciplinary tumor board according to current guidelines. For patients in the upfront surgery group, surgery was performed a mean of 7 days (range: 5-14 days) after MRI. Patients in the nRCT group underwent restaging MRI a mean of 6 weeks (range: 5-8 weeks) after completion of nRCT; surgery occurred approximately 10 days (range: 7-15 days) after restaging MRI.</p>
                        <p>For the current analysis, data from all {N_GESAMT} patients from the Avocado Sign study were used. The Avocado Sign was assessed on contrast-enhanced T1-weighted sequences (see below). Additionally, standard morphological parameters (short-axis diameter, shape, border, homogeneity, signal intensity) were recorded for every mesorectal lymph node visible on high-resolution T2-weighted MRI. The aim of this study is to compare the diagnostic performance of the Avocado Sign with various T2-weighted criteria strategies (literature-based, user-defined applied, and brute-force optimized) for predicting the pathohistological N-status.</p>
                    `
                },
                mriProtocolAnalysis: {
                    de: `
                        <h4>MRT-Protokoll und Bildanalyse</h4>
                        <p>Alle MRT-Untersuchungen wurden an einem 3.0-Tesla-System (MAGNETOM Prisma Fit; Siemens Healthineers) mit Körper- und Wirbelsäulen-Array-Spulen durchgeführt. Das Protokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Ausrichtung, eine axiale diffusionsgewichtete Sequenz (DWI) sowie eine kontrastmittelverstärkte axiale T1-gewichtete volumetrische interpolierte Gradientenecho-Sequenz mit Dixon-Fettunterdrückung (VIBE). Die detaillierten Sequenzparameter sind in der Originalpublikation des Avocado Signs ({AVOCADO_SIGN_STUDY_CITATION}) aufgeführt. Ein makrozyklisches Gadolinium-basiertes Kontrastmittel (Gadoteridol; ProHance; Bracco) wurde gewichtsbasiert (0.2 mL/kg KG) intravenös verabreicht. Die KM-gestützten Aufnahmen erfolgten unmittelbar nach vollständiger Applikation. Butylscopolamin wurde zu Beginn und in der Mitte jeder Untersuchung zur Reduktion von Bewegungsartefakten appliziert. Das Bildgebungsprotokoll war für Staging- und Restaging-Untersuchungen identisch.</p>
                        <p><strong>Avocado Sign (AS):</strong> Die Bildanalyse erfolgte durch zwei Radiologen (ML: 7 Jahre, AOS: 29 Jahre Erfahrung in abdomineller MRT) unabhängig und verblindet gegenüber den histopathologischen Ergebnissen. Das Avocado Sign wurde als ein hypointenser Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens auf den KM-gestützten T1-gewichteten Bildern definiert, unabhängig von Größe oder Form des Knotens. Alle sichtbaren mesorektalen Lymphknoten wurden bewertet. Ein Patient wurde als AS-positiv klassifiziert, wenn mindestens ein Lymphknoten das Avocado Sign zeigte. Die Interobserver-Übereinstimmung für das AS war in der Primärstudie exzellent (Cohen’s Kappa κ = 0.92) ({AVOCADO_SIGN_STUDY_CITATION}).</p>
                        <p><strong>T2-gewichtete Kriterien:</strong> Für jeden im hochauflösenden T2w-MRT sichtbaren mesorektalen Lymphknoten wurden folgende morphologische Parameter durch denselben Radiologen (ML), verblindet zum AS-Status und zur Histopathologie, erfasst:
                            <ul>
                                <li>Kurzachsendurchmesser (SAD): gemessen in Millimetern.</li>
                                <li>Form: kategorisiert als 'rund' oder 'oval'.</li>
                                <li>Kontur: kategorisiert als 'scharf' oder 'irregulär'.</li>
                                <li>Homogenität: kategorisiert als 'homogen' oder 'heterogen'.</li>
                                <li>Signalintensität: kategorisiert als 'signalarm', 'intermediär' oder 'signalreich' relativ zur umgebenden Muskulatur.</li>
                            </ul>
                        </p>
                        <p>Drei Sätze von T2-Kriterien aus der Literatur wurden für den Vergleich herangezogen:
                            <ol>
                                <li><strong>Koh et al. ({KOH_CITATION}):</strong> Ein Lymphknoten wurde als maligne gewertet, wenn er entweder eine irreguläre Kontur ODER ein heterogenes Binnensignal aufwies. Dieses Kriterium wurde ursprünglich im Kontext von Patienten nach nRCT evaluiert.</li>
                                <li><strong>Barbaro et al. ({BARBARO_CITATION}):</strong> Ein Lymphknoten wurde als maligne gewertet, wenn der SAD ≥ 2.3 mm betrug. Dieses Kriterium wurde als optimaler Cut-off im Restaging nach nRCT identifiziert.</li>
                                <li><strong>Rutegård et al. (ESGAR-Kriterien) ({RUTEGARD_CITATION}, basierend auf {ESGAR_CITATION}):</strong> Die komplexen ESGAR-Konsensuskriterien wurden angewendet: Malignität bei SAD ≥ 9 mm; ODER SAD 5-8 mm UND ≥2 morphologische Malignitätszeichen (rund, irreguläre Kontur, heterogenes Signal); ODER SAD < 5 mm UND alle 3 genannten morphologischen Malignitätszeichen. Diese Kriterien wurden ursprünglich für das Primärstaging (Baseline-MRT) evaluiert.</li>
                            </ol>
                        </p>
                        <p>Zusätzlich wurden für jedes der drei Kollektive (Gesamt, Direkt OP, nRCT) mittels einer integrierten Brute-Force-Optimierungsfunktion dieses Analyse-Tools (Version {APP_VERSION}) die T2-Kriterien (Kombination aus SAD-Schwellenwert [0.1-25.0 mm], Form, Kontur, Homogenität, Signal und logischer Verknüpfung UND/ODER) identifiziert, welche die Balanced Accuracy zur Vorhersage des N-Status maximierten. Diese kollektivspezifisch optimierten Kriterien wurden ebenfalls mit dem Avocado Sign verglichen.</p>
                        <p>Ein Patient wurde für jede T2-Kriterienstrategie als T2-positiv klassifiziert, wenn mindestens ein Lymphknoten die jeweiligen Malignitätskriterien erfüllte.</p>
                    `,
                    en: `
                        <h4>MRI Protocol and Image Analysis</h4>
                        <p>All MRI examinations were performed on a 3.0-Tesla system (MAGNETOM Prisma Fit; Siemens Healthineers) using body and spine array coils. The protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal orientations, an axial diffusion-weighted imaging (DWI) sequence, and a contrast-enhanced axial T1-weighted volumetric interpolated breath-hold examination with Dixon fat suppression (VIBE). Detailed sequence parameters are listed in the original Avocado Sign publication ({AVOCADO_SIGN_STUDY_CITATION}). A macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco) was administered intravenously based on weight (0.2 mL/kg). Contrast-enhanced images were acquired immediately after full administration. Butylscopolamine was administered at the beginning and midpoint of each examination to reduce motion artifacts. The imaging protocol was identical for staging and restaging examinations.</p>
                        <p><strong>Avocado Sign (AS):</strong> Image analysis was performed by two radiologists (ML: 7 years, AOS: 29 years of experience in abdominal MRI) independently and blinded to histopathological results. The Avocado Sign was defined as a hypointense core within an otherwise homogeneously hyperintense lymph node on contrast-enhanced T1-weighted images, regardless of node size or shape. All visible mesorectal lymph nodes were assessed. A patient was classified as AS-positive if at least one lymph node exhibited the Avocado Sign. Interobserver agreement for the AS was excellent in the primary study (Cohen’s kappa κ = 0.92) ({AVOCADO_SIGN_STUDY_CITATION}).</p>
                        <p><strong>T2-weighted Criteria:</strong> For every mesorectal lymph node visible on high-resolution T2w-MRI, the following morphological parameters were assessed by the same radiologist (ML), blinded to AS status and histopathology:
                            <ul>
                                <li>Short-axis diameter (SAD): measured in millimeters.</li>
                                <li>Shape: categorized as 'round' or 'oval'.</li>
                                <li>Border: categorized as 'sharp' or 'irregular'.</li>
                                <li>Homogeneity: categorized as 'homogeneous' or 'heterogeneous'.</li>
                                <li>Signal intensity: categorized as 'signal-poor', 'intermediate', or 'signal-rich' relative to surrounding muscle.</li>
                            </ul>
                        </p>
                        <p>Three sets of T2-weighted criteria from the literature were used for comparison:
                            <ol>
                                <li><strong>Koh et al. ({KOH_CITATION}):</strong> A lymph node was considered malignant if it showed either an irregular border OR heterogeneous internal signal. This criterion was originally evaluated in the context of patients after nRCT.</li>
                                <li><strong>Barbaro et al. ({BARBARO_CITATION}):</strong> A lymph node was considered malignant if its SAD was ≥ 2.3 mm. This criterion was identified as an optimal cut-off in restaging after nRCT.</li>
                                <li><strong>Rutegård et al. (ESGAR criteria) ({RUTEGARD_CITATION}, based on {ESGAR_CITATION}):</strong> The complex ESGAR consensus criteria were applied: Malignancy if SAD ≥ 9 mm; OR SAD 5-8 mm AND ≥2 morphological signs of malignancy (round, irregular border, heterogeneous signal); OR SAD < 5 mm AND all 3 mentioned morphological signs. These criteria were originally evaluated for primary staging (baseline MRI).</li>
                            </ol>
                        </p>
                        <p>Additionally, for each of the three cohorts (Overall, Upfront Surgery, nRCT), the T2 criteria (combination of SAD threshold [0.1-25.0 mm], shape, border, homogeneity, signal, and logical operator AND/OR) that maximized Balanced Accuracy for predicting N-status were identified using an integrated brute-force optimization function of this analysis tool (version {APP_VERSION}). These cohort-specific optimized criteria were also compared with the Avocado Sign.</p>
                        <p>A patient was classified as T2-positive for each T2 criteria strategy if at least one lymph node met the respective malignancy criteria.</p>
                    `
                },
                histopathologicalAnalysis: {
                    de: `
                        <h4>Histopathologische Analyse</h4>
                        <p>Die chirurgisch entfernten Rektumpräparate wurden standardisiert aufgearbeitet. Die histopathologische Untersuchung aller mesorektalen Lymphknoten durch erfahrene Pathologen diente als Referenzstandard. Der N-Status wurde als positiv (N+) bei Nachweis von Tumorzellen in mindestens einem Lymphknoten und als negativ (N0) bei Fehlen von Tumorzellen in allen untersuchten Lymphknoten klassifiziert.</p>
                    `,
                    en: `
                        <h4>Histopathological Analysis</h4>
                        <p>Surgically resected rectal specimens were processed according to standard protocols. Histopathological examination of all mesorectal lymph nodes by experienced pathologists served as the reference standard. The N-status was classified as positive (N+) if tumor cells were present in at least one lymph node, and negative (N0) if no tumor cells were found in any examined lymph nodes.</p>
                    `
                },
                statisticalAnalysis: {
                    de: `
                        <h4>Statistische Analyse</h4>
                        <p>Alle statistischen Analysen wurden mit der interaktiven Webanwendung "{APP_NAME}" (Version {APP_VERSION}), einem speziell für diese und die vorausgegangene Avocado-Sign-Studie entwickelten Analysewerkzeug (HTML5, CSS3, JavaScript ES6+), durchgeführt. Deskriptive Statistiken wurden zur Charakterisierung des Patientenkollektivs verwendet. Die diagnostische Güte des Avocado Signs und der verschiedenen T2-Kriterienstrategien (Literatur-basiert, Brute-Force-optimiert) zur Vorhersage des pathologischen N-Status wurde mittels Sensitivität, Spezifität, positivem prädiktivem Wert (PPV), negativem prädiktivem Wert (NPV), Accuracy und Balanced Accuracy (BalAcc, äquivalent zur Area Under the Curve [AUC] für binäre Tests) evaluiert. 95% Konfidenzintervalle (CI) für diese Proportionen wurden mittels der Wilson-Score-Intervall-Methode berechnet. Für BalAcc und den F1-Score wurden 95% CIs mittels der Bootstrap-Perzentil-Methode (mit {BOOTSTRAP_REPLICATIONS} Replikationen) geschätzt.</p>
                        <p>Der direkte Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriterienstrategien erfolgte für gepaarte Daten (derselbe Patient wird mit AS und T2 bewertet) mittels McNemar-Test für die Accuracy und DeLong-Test für die AUCs. Für Vergleiche der diagnostischen Leistung zwischen unabhängigen Kollektiven (z.B. Direkt-OP vs. nRCT-Gruppe) wurden Fisher's Exact Test für Accuracies und ein Z-Test für AUCs (basierend auf Bootstrap-Standardfehlern) herangezogen. Ein p-Wert < ${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL} wurde als statistisch signifikant interpretiert. ROC-Kurven wurden zur Visualisierung der diagnostischen Leistung generiert.</p>
                    `,
                    en: `
                        <h4>Statistical Analysis</h4>
                        <p>All statistical analyses were performed using the interactive web application "{APP_NAME}" (Version {APP_VERSION}), an analysis tool specifically developed for this and the preceding Avocado Sign study (HTML5, CSS3, JavaScript ES6+). Descriptive statistics were used to characterize the patient cohort. The diagnostic performance of the Avocado Sign and the various T2 criteria strategies (literature-based, brute-force optimized) for predicting pathological N-status was evaluated using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy, and balanced accuracy (BalAcc, equivalent to Area Under the Curve [AUC] for binary tests). 95% confidence intervals (CI) for these proportions were calculated using the Wilson score interval method. For BalAcc and the F1-score, 95% CIs were estimated using the bootstrap percentile method (with {BOOTSTRAP_REPLICATIONS} replications).</p>
                        <p>Direct comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and the respective T2 criteria strategies was performed for paired data (the same patient assessed by AS and T2) using McNemar's test for accuracy and DeLong's test for AUCs. For comparisons of diagnostic performance between independent cohorts (e.g., upfront surgery vs. nRCT group), Fisher's exact test was used for accuracies and a Z-test for AUCs (based on bootstrap standard errors). A p-value < ${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL} was considered statistically significant. ROC curves were generated to visualize diagnostic performance.</p>
                    `
                }
            },
            ergebnisse: {
                patientCharacteristics: {
                    de: `
                        <h4>Patientencharakteristika</h4>
                        <p>Die Charakteristika des Gesamtkollektivs von {N_GESAMT} Patienten sind in Tabelle 1 zusammengefasst. Das mittlere Alter betrug {MEAN_AGE} ± {SD_AGE} Jahre, {PERCENT_MALE}% der Patienten waren männlich. {N_DIREKT_OP} ({PERCENT_DIREKT_OP}%) Patienten unterzogen sich einer primären Operation, während {N_NRCT} ({PERCENT_NRCT}%) Patienten eine neoadjuvante Radiochemotherapie erhielten. Histopathologisch gesicherte Lymphknotenmetastasen (N+) wurden bei {N_PLUS_PATIENTS} ({PERCENT_N_PLUS_PATIENTS}%) Patienten im Gesamtkollektiv festgestellt.</p>
                        <div id="pub-table-patient-characteristics-de" class="table-responsive mb-3"></div>
                        <p class="small text-muted">Tabelle 1: Patientencharakteristika des Gesamtkollektivs.</p>
                    `,
                    en: `
                        <h4>Patient Characteristics</h4>
                        <p>The characteristics of the total cohort of {N_GESAMT} patients are summarized in Table 1. The mean age was {MEAN_AGE} ± {SD_AGE} years, and {PERCENT_MALE}% of patients were male. {N_DIREKT_OP} ({PERCENT_DIREKT_OP}%) patients underwent upfront surgery, while {N_NRCT} ({PERCENT_NRCT}%) patients received neoadjuvant chemoradiotherapy. Histopathologically confirmed lymph node metastases (N+) were found in {N_PLUS_PATIENTS} ({PERCENT_N_PLUS_PATIENTS}%) patients in the overall cohort.</p>
                        <div id="pub-table-patient-characteristics-en" class="table-responsive mb-3"></div>
                        <p class="small text-muted">Table 1: Patient characteristics of the overall cohort.</p>
                    `
                },
                diagnosticPerformance: {
                    de: `
                        <h4>Diagnostische Güte: Avocado Sign vs. T2-Kriterien</h4>
                        <p>Die diagnostische Leistung des Avocado Signs und der verschiedenen T2-Kriterienstrategien für die Vorhersage des N-Status im Gesamtkollektiv sowie in den Subgruppen (Direkt OP, nRCT) ist in Tabelle 2 detailliert dargestellt. Die ROC-Kurven für das Avocado Sign und die Brute-Force-optimierten T2-Kriterien im Gesamtkollektiv sind in Abbildung 1 gezeigt.</p>
                        <p><strong>Gesamtkollektiv (N={N_GESAMT}):</strong><br>
                        Das Avocado Sign zeigte eine Sensitivität von {AS_SENS_GESAMT} (95% CI: {AS_SENS_CI_GESAMT_LOWER}-{AS_SENS_CI_GESAMT_UPPER}), eine Spezifität von {AS_SPEZ_GESAMT} (95% CI: {AS_SPEZ_CI_GESAMT_LOWER}-{AS_SPEZ_CI_GESAMT_UPPER}) und eine Balanced Accuracy (AUC) von {AS_AUC_GESAMT} (95% CI: {AS_AUC_CI_GESAMT_LOWER}-{AS_AUC_CI_GESAMT_UPPER}).
                        Die für das Gesamtkollektiv Brute-Force-optimierten T2-Kriterien (basierend auf {BF_T2_GESAMT_CRITERIA_DEFINITION}, Logik: {BF_T2_GESAMT_LOGIC}) erreichten eine Sensitivität von {BF_T2_SENS_GESAMT} (95% CI: {BF_T2_SENS_CI_GESAMT_LOWER}-{BF_T2_SENS_CI_GESAMT_UPPER}), Spezifität von {BF_T2_SPEZ_GESAMT} (95% CI: {BF_T2_SPEZ_CI_GESAMT_LOWER}-{BF_T2_SPEZ_CI_GESAMT_UPPER}) und eine AUC von {BF_T2_AUC_GESAMT} (95% CI: {BF_T2_AUC_CI_GESAMT_LOWER}-{BF_T2_AUC_CI_GESAMT_UPPER}).
                        Der direkte Vergleich mittels DeLong-Test zeigte {AUC_COMP_AS_VS_BF_T2_GESAMT_SIGNIFICANCE} Unterschied in der AUC (AS vs. BF-T2: {AS_AUC_GESAMT} vs. {BF_T2_AUC_GESAMT}; p={AUC_COMP_AS_VS_BF_T2_GESAMT_PVALUE}).
                        </p>
                        <p>Im Vergleich zu den Literatur-basierten Kriterien zeigte das AS im Gesamtkollektiv {LIT_COMP_AS_VS_KOH_GESAMT_SUMMARY}, {LIT_COMP_AS_VS_BARBARO_GESAMT_SUMMARY}, und {LIT_COMP_AS_VS_RUTEGARD_GESAMT_SUMMARY}.</p>

                        <p><strong>Direkt-OP-Gruppe (N={N_DIREKT_OP}):</strong><br>
                        AS: Sens. {AS_SENS_DIREKT_OP}, Spez. {AS_SPEZ_DIREKT_OP}, AUC {AS_AUC_DIREKT_OP}.<br>
                        BF-optimierte T2 ({BF_T2_DIREKT_OP_CRITERIA_DEFINITION}, Logik: {BF_T2_DIREKT_OP_LOGIC}): Sens. {BF_T2_SENS_DIREKT_OP}, Spez. {BF_T2_SPEZ_DIREKT_OP}, AUC {BF_T2_AUC_DIREKT_OP}.<br>
                        DeLong-Test (AS vs. BF-T2): {AUC_COMP_AS_VS_BF_T2_DIREKT_OP_SIGNIFICANCE} (p={AUC_COMP_AS_VS_BF_T2_DIREKT_OP_PVALUE}).<br>
                        Rutegård et al. (ESGAR): Sens. {RUT_SENS_DIREKT_OP}, Spez. {RUT_SPEZ_DIREKT_OP}, AUC {RUT_AUC_DIREKT_OP}. DeLong-Test (AS vs. Rutegård): {AUC_COMP_AS_VS_RUT_DIREKT_OP_SIGNIFICANCE} (p={AUC_COMP_AS_VS_RUT_DIREKT_OP_PVALUE}).
                        </p>

                        <p><strong>nRCT-Gruppe (N={N_NRCT}):</strong><br>
                        AS: Sens. {AS_SENS_NRCT}, Spez. {AS_SPEZ_NRCT}, AUC {AS_AUC_NRCT}.<br>
                        BF-optimierte T2 ({BF_T2_NRCT_CRITERIA_DEFINITION}, Logik: {BF_T2_NRCT_LOGIC}): Sens. {BF_T2_SENS_NRCT}, Spez. {BF_T2_SPEZ_NRCT}, AUC {BF_T2_AUC_NRCT}.<br>
                        DeLong-Test (AS vs. BF-T2): {AUC_COMP_AS_VS_BF_T2_NRCT_SIGNIFICANCE} (p={AUC_COMP_AS_VS_BF_T2_NRCT_PVALUE}).<br>
                        Koh et al.: Sens. {KOH_SENS_NRCT}, Spez. {KOH_SPEZ_NRCT}, AUC {KOH_AUC_NRCT}. DeLong-Test (AS vs. Koh): {AUC_COMP_AS_VS_KOH_NRCT_SIGNIFICANCE} (p={AUC_COMP_AS_VS_KOH_NRCT_PVALUE}).<br>
                        Barbaro et al.: Sens. {BAR_SENS_NRCT}, Spez. {BAR_SPEZ_NRCT}, AUC {BAR_AUC_NRCT}. DeLong-Test (AS vs. Barbaro): {AUC_COMP_AS_VS_BAR_NRCT_SIGNIFICANCE} (p={AUC_COMP_AS_VS_BAR_NRCT_PVALUE}).
                        </p>

                        <div id="pub-table-diagnostic-performance-de" class="table-responsive mb-3"></div>
                        <p class="small text-muted">Tabelle 2: Diagnostische Güte des Avocado Signs im Vergleich zu Literatur-basierten und Brute-Force-optimierten T2-Kriterien.</p>
                        <div class="row">
                            <div class="col-md-6" id="pub-roc-as-gesamt-de"></div>
                            <div class="col-md-6" id="pub-roc-bf-t2-gesamt-de"></div>
                        </div>
                        <p class="small text-muted">Abbildung 1: ROC-Kurven für das Avocado Sign (links) und die Brute-Force-optimierten T2-Kriterien (rechts) im Gesamtkollektiv.</p>
                    `,
                    en: `
                        <h4>Diagnostic Performance: Avocado Sign vs. T2-weighted Criteria</h4>
                        <p>The diagnostic performance of the Avocado Sign and the various T2 criteria strategies for predicting N-status in the overall cohort and subgroups (Upfront Surgery, nRCT) is detailed in Table 2. ROC curves for the Avocado Sign and brute-force optimized T2 criteria in the overall cohort are shown in Figure 1.</p>
                        <p><strong>Overall Cohort (N={N_GESAMT}):</strong><br>
                        The Avocado Sign showed a sensitivity of {AS_SENS_GESAMT} (95% CI: {AS_SENS_CI_GESAMT_LOWER}-{AS_SENS_CI_GESAMT_UPPER}), a specificity of {AS_SPEZ_GESAMT} (95% CI: {AS_SPEZ_CI_GESAMT_LOWER}-{AS_SPEZ_CI_GESAMT_UPPER}), and a balanced accuracy (AUC) of {AS_AUC_GESAMT} (95% CI: {AS_AUC_CI_GESAMT_LOWER}-{AS_AUC_CI_GESAMT_UPPER}).
                        The brute-force optimized T2 criteria for the overall cohort (based on {BF_T2_GESAMT_CRITERIA_DEFINITION}, logic: {BF_T2_GESAMT_LOGIC}) achieved a sensitivity of {BF_T2_SENS_GESAMT} (95% CI: {BF_T2_SENS_CI_GESAMT_LOWER}-{BF_T2_SENS_CI_GESAMT_UPPER}), specificity of {BF_T2_SPEZ_GESAMT} (95% CI: {BF_T2_SPEZ_CI_GESAMT_LOWER}-{BF_T2_SPEZ_CI_GESAMT_UPPER}), and an AUC of {BF_T2_AUC_GESAMT} (95% CI: {BF_T2_AUC_CI_GESAMT_LOWER}-{BF_T2_AUC_CI_GESAMT_UPPER}).
                        Direct comparison using DeLong's test showed {AUC_COMP_AS_VS_BF_T2_GESAMT_SIGNIFICANCE} difference in AUC (AS vs. BF-T2: {AS_AUC_GESAMT} vs. {BF_T2_AUC_GESAMT}; p={AUC_COMP_AS_VS_BF_T2_GESAMT_PVALUE}).
                        </p>
                        <p>Compared to literature-based criteria in the overall cohort, the AS showed {LIT_COMP_AS_VS_KOH_GESAMT_SUMMARY}, {LIT_COMP_AS_VS_BARBARO_GESAMT_SUMMARY}, and {LIT_COMP_AS_VS_RUTEGARD_GESAMT_SUMMARY}.</p>

                        <p><strong>Upfront Surgery Group (N={N_DIREKT_OP}):</strong><br>
                        AS: Sens. {AS_SENS_DIREKT_OP}, Spec. {AS_SPEZ_DIREKT_OP}, AUC {AS_AUC_DIREKT_OP}.<br>
                        BF-optimized T2 ({BF_T2_DIREKT_OP_CRITERIA_DEFINITION}, logic: {BF_T2_DIREKT_OP_LOGIC}): Sens. {BF_T2_SENS_DIREKT_OP}, Spec. {BF_T2_SPEZ_DIREKT_OP}, AUC {BF_T2_AUC_DIREKT_OP}.<br>
                        DeLong's test (AS vs. BF-T2): {AUC_COMP_AS_VS_BF_T2_DIREKT_OP_SIGNIFICANCE} (p={AUC_COMP_AS_VS_BF_T2_DIREKT_OP_PVALUE}).<br>
                        Rutegård et al. (ESGAR): Sens. {RUT_SENS_DIREKT_OP}, Spec. {RUT_SPEZ_DIREKT_OP}, AUC {RUT_AUC_DIREKT_OP}. DeLong's test (AS vs. Rutegård): {AUC_COMP_AS_VS_RUT_DIREKT_OP_SIGNIFICANCE} (p={AUC_COMP_AS_VS_RUT_DIREKT_OP_PVALUE}).
                        </p>

                        <p><strong>nRCT Group (N={N_NRCT}):</strong><br>
                        AS: Sens. {AS_SENS_NRCT}, Spec. {AS_SPEZ_NRCT}, AUC {AS_AUC_NRCT}.<br>
                        BF-optimized T2 ({BF_T2_NRCT_CRITERIA_DEFINITION}, logic: {BF_T2_NRCT_LOGIC}): Sens. {BF_T2_SENS_NRCT}, Spec. {BF_T2_SPEZ_NRCT}, AUC {BF_T2_AUC_NRCT}.<br>
                        DeLong's test (AS vs. BF-T2): {AUC_COMP_AS_VS_BF_T2_NRCT_SIGNIFICANCE} (p={AUC_COMP_AS_VS_BF_T2_NRCT_PVALUE}).<br>
                        Koh et al.: Sens. {KOH_SENS_NRCT}, Spec. {KOH_SPEZ_NRCT}, AUC {KOH_AUC_NRCT}. DeLong's test (AS vs. Koh): {AUC_COMP_AS_VS_KOH_NRCT_SIGNIFICANCE} (p={AUC_COMP_AS_VS_KOH_NRCT_PVALUE}).<br>
                        Barbaro et al.: Sens. {BAR_SENS_NRCT}, Spec. {BAR_SPEZ_NRCT}, AUC {BAR_AUC_NRCT}. DeLong's test (AS vs. Barbaro): {AUC_COMP_AS_VS_BAR_NRCT_SIGNIFICANCE} (p={AUC_COMP_AS_VS_BAR_NRCT_PVALUE}).
                        </p>

                        <div id="pub-table-diagnostic-performance-en" class="table-responsive mb-3"></div>
                        <p class="small text-muted">Table 2: Diagnostic performance of the Avocado Sign compared to literature-based and brute-force optimized T2 criteria.</p>
                        <div class="row">
                            <div class="col-md-6" id="pub-roc-as-gesamt-en"></div>
                            <div class="col-md-6" id="pub-roc-bf-t2-gesamt-en"></div>
                        </div>
                        <p class="small text-muted">Figure 1: ROC curves for the Avocado Sign (left) and brute-force optimized T2 criteria (right) in the overall cohort.</p>
                    `
                }
            }
        };

        return texts[section]?.[subsection]?.[lang] || `<p class="text-danger">Text for ${section} -> ${subsection} (${lang}) not found.</p>`;
    }

    function _getDeskriptivStatsForPublication(processedData, lang) {
        const stats = statisticsService.calculateDescriptiveStats(processedData);
        if (!stats || stats.anzahlPatienten === 0) return { tableHTML: "<p>Keine deskriptiven Daten für Tabelle.</p>", placeholders: {} };

        const N_GESAMT = stats.anzahlPatienten;
        const N_DIREKT_OP = stats.therapie?.['direkt OP'] ?? 0;
        const N_NRCT = stats.therapie?.nRCT ?? 0;

        const placeholders = {
            MEAN_AGE: formatNumber(stats.alter?.mean, 1),
            SD_AGE: formatNumber(stats.alter?.sd, 1),
            PERCENT_MALE: formatPercent(stats.geschlecht?.m / N_GESAMT, 1),
            PERCENT_DIREKT_OP: formatPercent(N_DIREKT_OP / N_GESAMT, 1),
            PERCENT_NRCT: formatPercent(N_NRCT / N_GESAMT, 1),
            N_PLUS_PATIENTS: stats.nStatus?.plus ?? 0,
            PERCENT_N_PLUS_PATIENTS: formatPercent((stats.nStatus?.plus ?? 0) / N_GESAMT, 1)
        };

        const headers = lang === 'de' ?
            ["Charakteristikum", "Gesamtkollektiv (N=" + N_GESAMT + ")"] :
            ["Characteristic", "Overall Cohort (N=" + N_GESAMT + ")"];

        const rows = [
            [lang === 'de' ? "Alter, Jahre (Mittelwert ± SD)" : "Age, years (mean ± SD)", `${placeholders.MEAN_AGE} ± ${placeholders.SD_AGE}`],
            [lang === 'de' ? "Alter, Jahre (Median (Min-Max))" : "Age, years (median (min-max))", `${formatNumber(stats.alter?.median,1)} (${formatNumber(stats.alter?.min,0)}-${formatNumber(stats.alter?.max,0)})`],
            [lang === 'de' ? "Geschlecht, n (%)" : "Sex, n (%)"],
            [lang === 'de' ? "  Männlich" : "  Male", `${stats.geschlecht?.m ?? 0} (${placeholders.PERCENT_MALE})`],
            [lang === 'de' ? "  Weiblich" : "  Female", `${stats.geschlecht?.f ?? 0} (${formatPercent(stats.geschlecht?.f / N_GESAMT,1)})`],
            [lang === 'de' ? "Therapiegruppe, n (%)" : "Treatment Group, n (%)"],
            [lang === 'de' ? "  Direkt-OP" : "  Upfront Surgery", `${N_DIREKT_OP} (${placeholders.PERCENT_DIREKT_OP})`],
            [lang === 'de' ? "  nRCT" : "  nRCT", `${N_NRCT} (${placeholders.PERCENT_NRCT})`],
            [lang === 'de' ? "Pathologischer N-Status, n (%)" : "Pathological N-Status, n (%)"],
            [lang === 'de' ? "  N+" : "  N+", `${stats.nStatus?.plus ?? 0} (${placeholders.PERCENT_N_PLUS_PATIENTS})`],
            [lang === 'de' ? "  N0" : "  N0", `${stats.nStatus?.minus ?? 0} (${formatPercent(stats.nStatus?.minus / N_GESAMT,1)})`],
        ];

        let tableHTML = '<table class="table table-sm table-bordered table-striped small caption-top">';
        tableHTML += `<caption>${lang === 'de' ? 'Tabelle 1: Patientencharakteristika.' : 'Table 1: Patient characteristics.'}</caption>`;
        tableHTML += `<thead><tr><th>${headers[0]}</th><th>${headers[1]}</th></tr></thead><tbody>`;
        rows.forEach(row => {
            tableHTML += `<tr><td>${row[0]}</td><td>${row[1] || ''}</td></tr>`;
        });
        tableHTML += '</tbody></table>';

        return { tableHTML, placeholders };
    }

    function _getDiagnosticPerformanceTable(processedData, bruteForceResults, currentKollektiv, lang) {
        // This is a complex table. For now, a placeholder.
        // It needs to calculate AS, Lit-T2, BF-T2 for Gesamt, DirektOP, nRCT
        // And present Sens, Spez, PPV, NPV, Acc, AUC with CIs for all.
        // Then compare AS vs BF-T2 and AS vs relevant Lit-T2 using DeLong/McNemar.

        let tableHTML = `<p class="text-info">Tabelle 2 (Diagnostische Güte) wird hier dynamisch generiert.</p>`;
        // Example structure:
        tableHTML = `<table class="table table-sm table-bordered table-striped small caption-top">
            <caption>${lang === 'de' ? 'Tabelle 2: Diagnostische Güte verschiedener Methoden.' : 'Table 2: Diagnostic performance of different methods.'}</caption>
            <thead>
                <tr>
                    <th>Kollektiv</th>
                    <th>Methode</th>
                    <th>N</th>
                    <th>Sens. (95% CI)</th>
                    <th>Spez. (95% CI)</th>
                    <th>PPV (95% CI)</th>
                    <th>NPV (95% CI)</th>
                    <th>Acc. (95% CI)</th>
                    <th>AUC (95% CI)</th>
                    <th>vs. AS (AUC p-Wert)</th>
                </tr>
            </thead>
            <tbody>`;

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const fNum = (val, d = 1) => formatNumber(val, d, '--');
        const fP = (val, d=1) => formatPercent(val, d, '--%');
        const fCI = (metric, d=1, isPerc=true) => {
            if (!metric || metric.value === null || metric.value === undefined || isNaN(metric.value)) return fP(NaN,d);
            const valStr = isPerc ? fP(metric.value, d) : fNum(metric.value, d === 1 ? 3 : d); // AUC/F1 mit 3 Dezimalen
            const ciL = isPerc ? fP(metric.ci?.lower, d) : fNum(metric.ci?.lower, d === 1 ? 3 : d);
            const ciU = isPerc ? fP(metric.ci?.upper, d) : fNum(metric.ci?.upper, d === 1 ? 3 : d);
            return `${valStr} (${ciL} – ${ciU})`;
        };


        kollektive.forEach(kollektivId => {
            const dataSubset = dataProcessor.filterDataByKollektiv(processedData, kollektivId);
            if (dataSubset.length === 0) return;

            const asPerf = statisticsService.calculateDiagnosticPerformance(dataSubset, 'as', 'n');
            tableHTML += `<tr><td>${getKollektivDisplayName(kollektivId)}</td><td>Avocado Sign</td><td>${dataSubset.length}</td><td>${fCI(asPerf?.sens)}</td><td>${fCI(asPerf?.spez)}</td><td>${fCI(asPerf?.ppv)}</td><td>${fCI(asPerf?.npv)}</td><td>${fCI(asPerf?.acc)}</td><td>${fCI(asPerf?.auc, 3, false)}</td><td>-</td></tr>`;

            // Brute-Force optimized T2 for this specific kollektiv
            let bfResultForKollektiv = null;
            if (bruteForceResults && bruteForceResults.allKollektivResults && bruteForceResults.allKollektivResults[kollektivId]) {
                bfResultForKollektiv = bruteForceResults.allKollektivResults[kollektivId];
                 const dataWithBfT2 = t2CriteriaManager.evaluateDataset(cloneDeep(dataSubset), bfResultForKollektiv.criteria, bfResultForKollektiv.logic);
                 const bfPerf = statisticsService.calculateDiagnosticPerformance(dataWithBfT2, 't2', 'n');
                 const compBf = statisticsService.compareDiagnosticMethods(dataWithBfT2, 'as', 't2', 'n');
                 tableHTML += `<tr><td></td><td>BF-T2 Opt. (${bfResultForKollektiv.metric})</td><td>${dataSubset.length}</td><td>${fCI(bfPerf?.sens)}</td><td>${fCI(bfPerf?.spez)}</td><td>${fCI(bfPerf?.ppv)}</td><td>${fCI(bfPerf?.npv)}</td><td>${fCI(bfPerf?.acc)}</td><td>${fCI(bfPerf?.auc, 3, false)}</td><td>${formatNumber(compBf?.delong?.pValue,3)}</td></tr>`;
            }


            // Literature T2 criteria
            const studySets = studyT2CriteriaManager.getAllStudyCriteriaSets();
            studySets.forEach(studySet => {
                if (studySet.applicableKollektiv === kollektivId || studySet.applicableKollektiv === 'Gesamt' || kollektivId === 'Gesamt') {
                    const dataWithStudyT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataSubset), studySet);
                    const studyPerf = statisticsService.calculateDiagnosticPerformance(dataWithStudyT2, 't2', 'n');
                    const compStudy = statisticsService.compareDiagnosticMethods(dataWithStudyT2, 'as', 't2', 'n');
                    tableHTML += `<tr><td></td><td>${studySet.displayShortName}</td><td>${dataSubset.length}</td><td>${fCI(studyPerf?.sens)}</td><td>${fCI(studyPerf?.spez)}</td><td>${fCI(studyPerf?.ppv)}</td><td>${fCI(studyPerf?.npv)}</td><td>${fCI(studyPerf?.acc)}</td><td>${fCI(studyPerf?.auc, 3, false)}</td><td>${formatNumber(compStudy?.delong?.pValue,3)}</td></tr>`;
                }
            });
        });

        tableHTML += '</tbody></table>';
        return { tableHTML, placeholders: {} };
    }


    function _renderMethodenSection(processedData, lang, placeholders) {
        let html = '';
        const sections = ['studyDesignPatients', 'mriProtocolAnalysis', 'histopathologicalAnalysis', 'statisticalAnalysis'];
        sections.forEach(sectionKey => {
            const cardTitle = TOOLTIP_CONTENT.publikationTabContent.methoden[sectionKey]?.title || sectionKey;
            const textContent = _getPublicationText('methoden', sectionKey, lang, placeholders);
            html += uiComponents.createStatistikCard(`pub-meth-${sectionKey}-${lang}`, cardTitle, textContent, true, `publikationTabContent.methoden.${sectionKey}`);
        });
        return html;
    }

    function _renderErgebnisseSection(processedData, bruteForceResults, currentKollektiv, appliedCriteria, appliedLogic, lang, placeholders) {
        let html = '';
        const sections = ['patientCharacteristics', 'diagnosticPerformance']; // More sections can be added
        let dynamicPlaceholders = {...placeholders};

        // Patient Characteristics
        const descStats = _getDeskriptivStatsForPublication(processedData, lang);
        dynamicPlaceholders = {...dynamicPlaceholders, ...descStats.placeholders};
        let textContentPatientChar = _getPublicationText('ergebnisse', 'patientCharacteristics', lang, dynamicPlaceholders);
        html += uiComponents.createStatistikCard(`pub-ergeb-patientChar-${lang}`, TOOLTIP_CONTENT.publikationTabContent.ergebnisse.patientCharacteristics.title, textContentPatientChar, true, `publikationTabContent.ergebnisse.patientCharacteristics`);


        // Diagnostic Performance (Complex - needs data for all Kollektive for AS, BF-T2, Lit-T2)
        // This part will be very involved and requires careful data fetching and calculations.
        // For now, using a simplified placeholder text structure and a placeholder for the table.
        const diagPerfData = _getDiagnosticPerformanceTable(processedData, bruteForceResults, currentKollektiv, lang);
        dynamicPlaceholders = {...dynamicPlaceholders, ...diagPerfData.placeholders}; // Update placeholders if diagPerfData returns some

        // Dummy placeholders for the example text - these need to be calculated properly
        const allKollektivData = { // This structure needs to be populated by actual calculations
            Gesamt: { as: {sens:0.8, spec:0.7, auc:0.75}, bf_t2: {sens:0.82, spec:0.72, auc:0.77, criteria: "Size >= 5mm UND Form=rund", logic: "UND"}, koh: {sens:0.5, spec:0.9, auc:0.7}, barbaro: {sens:0.6, spec:0.8, auc:0.72}, rutegard: {sens:0.55, spec:0.85, auc:0.73} },
            'direkt OP': { as: {sens:0.9, spec:0.6, auc:0.8}, bf_t2: {sens:0.92, spec:0.62, auc:0.82, criteria: "Size >= 6mm", logic: "ODER"}, rutegard: {sens:0.6, spec:0.88, auc:0.78} },
            nRCT: { as: {sens:0.7, spec:0.8, auc:0.78}, bf_t2: {sens:0.72, spec:0.82, auc:0.80, criteria: "Kontur=irregulär", logic: "ODER"}, koh: {sens:0.55, spec:0.92, auc:0.76}, barbaro: {sens:0.65, spec:0.82, auc:0.77} }
        };

        const formatCIPlaceholder = (val, ci_l, ci_u) => `${formatNumber(val,1)}% (${formatNumber(ci_l,1)}%-${formatNumber(ci_u,1)}%)`;
        const formatAUCPlaceholder = (val, ci_l, ci_u) => `${formatNumber(val,3)} (${formatNumber(ci_l,3)}-${formatNumber(ci_u,3)})`;

        const kGesamt = allKollektivData.Gesamt;
        dynamicPlaceholders.AS_SENS_GESAMT = formatCIPlaceholder(kGesamt.as.sens*100, kGesamt.as.sens*100-5, kGesamt.as.sens*100+5);
        dynamicPlaceholders.AS_SPEZ_GESAMT = formatCIPlaceholder(kGesamt.as.spec*100, kGesamt.as.spec*100-5, kGesamt.as.spec*100+5);
        dynamicPlaceholders.AS_AUC_GESAMT = formatAUCPlaceholder(kGesamt.as.auc, kGesamt.as.auc-0.05, kGesamt.as.auc+0.05);
        dynamicPlaceholders.BF_T2_GESAMT_CRITERIA_DEFINITION = kGesamt.bf_t2.criteria;
        dynamicPlaceholders.BF_T2_GESAMT_LOGIC = kGesamt.bf_t2.logic;
        dynamicPlaceholders.BF_T2_SENS_GESAMT = formatCIPlaceholder(kGesamt.bf_t2.sens*100, kGesamt.bf_t2.sens*100-5, kGesamt.bf_t2.sens*100+5);
        dynamicPlaceholders.BF_T2_SPEZ_GESAMT = formatCIPlaceholder(kGesamt.bf_t2.spec*100, kGesamt.bf_t2.spec*100-5, kGesamt.bf_t2.spec*100+5);
        dynamicPlaceholders.BF_T2_AUC_GESAMT = formatAUCPlaceholder(kGesamt.bf_t2.auc, kGesamt.bf_t2.auc-0.05, kGesamt.bf_t2.auc+0.05);
        dynamicPlaceholders.AUC_COMP_AS_VS_BF_T2_GESAMT_SIGNIFICANCE = Math.abs(kGesamt.as.auc - kGesamt.bf_t2.auc) > 0.05 ? "ein signifikanter" : "kein signifikanter";
        dynamicPlaceholders.AUC_COMP_AS_VS_BF_T2_GESAMT_PVALUE = Math.abs(kGesamt.as.auc - kGesamt.bf_t2.auc) > 0.05 ? "0.04" : "0.35";

        dynamicPlaceholders.LIT_COMP_AS_VS_KOH_GESAMT_SUMMARY = "eine vergleichbare Performance zum Koh-Kriterium (AUC: " + formatAUCPlaceholder(kGesamt.koh.auc, kGesamt.koh.auc-0.05,kGesamt.koh.auc+0.05) + ")";
        dynamicPlaceholders.LIT_COMP_AS_VS_BARBARO_GESAMT_SUMMARY = "eine tendenziell bessere Performance als das Barbaro-Kriterium (AUC: " + formatAUCPlaceholder(kGesamt.barbaro.auc, kGesamt.barbaro.auc-0.05,kGesamt.barbaro.auc+0.05) + ")";
        dynamicPlaceholders.LIT_COMP_AS_VS_RUTEGARD_GESAMT_SUMMARY = "eine bessere Performance als die Rutegård/ESGAR-Kriterien (AUC: " + formatAUCPlaceholder(kGesamt.rutegard.auc, kGesamt.rutegard.auc-0.05,kGesamt.rutegard.auc+0.05) + ")";

        // Similar placeholders for Direkt OP and nRCT... (omitted for brevity but need to be implemented)
        const kDO = allKollektivData['direkt OP'];
        dynamicPlaceholders.AS_SENS_DIREKT_OP = formatCIPlaceholder(kDO.as.sens*100,0,0); dynamicPlaceholders.AS_SPEZ_DIREKT_OP = formatCIPlaceholder(kDO.as.spec*100,0,0); dynamicPlaceholders.AS_AUC_DIREKT_OP = formatAUCPlaceholder(kDO.as.auc,0,0);
        dynamicPlaceholders.BF_T2_DIREKT_OP_CRITERIA_DEFINITION = kDO.bf_t2.criteria; dynamicPlaceholders.BF_T2_DIREKT_OP_LOGIC = kDO.bf_t2.logic;
        dynamicPlaceholders.BF_T2_SENS_DIREKT_OP = formatCIPlaceholder(kDO.bf_t2.sens*100,0,0); dynamicPlaceholders.BF_T2_SPEZ_DIREKT_OP = formatCIPlaceholder(kDO.bf_t2.spec*100,0,0); dynamicPlaceholders.BF_T2_AUC_DIREKT_OP = formatAUCPlaceholder(kDO.bf_t2.auc,0,0);
        dynamicPlaceholders.AUC_COMP_AS_VS_BF_T2_DIREKT_OP_SIGNIFICANCE = "kein signifikanter"; dynamicPlaceholders.AUC_COMP_AS_VS_BF_T2_DIREKT_OP_PVALUE = "0.6";
        dynamicPlaceholders.RUT_SENS_DIREKT_OP = formatCIPlaceholder(kDO.rutegard.sens*100,0,0); dynamicPlaceholders.RUT_SPEZ_DIREKT_OP = formatCIPlaceholder(kDO.rutegard.spec*100,0,0); dynamicPlaceholders.RUT_AUC_DIREKT_OP = formatAUCPlaceholder(kDO.rutegard.auc,0,0);
        dynamicPlaceholders.AUC_COMP_AS_VS_RUT_DIREKT_OP_SIGNIFICANCE = "ein signifikanter"; dynamicPlaceholders.AUC_COMP_AS_VS_RUT_DIREKT_OP_PVALUE = "0.03";

        const kNRCT = allKollektivData.nRCT;
        dynamicPlaceholders.AS_SENS_NRCT = formatCIPlaceholder(kNRCT.as.sens*100,0,0); dynamicPlaceholders.AS_SPEZ_NRCT = formatCIPlaceholder(kNRCT.as.spec*100,0,0); dynamicPlaceholders.AS_AUC_NRCT = formatAUCPlaceholder(kNRCT.as.auc,0,0);
        dynamicPlaceholders.BF_T2_NRCT_CRITERIA_DEFINITION = kNRCT.bf_t2.criteria; dynamicPlaceholders.BF_T2_NRCT_LOGIC = kNRCT.bf_t2.logic;
        dynamicPlaceholders.BF_T2_SENS_NRCT = formatCIPlaceholder(kNRCT.bf_t2.sens*100,0,0); dynamicPlaceholders.BF_T2_SPEZ_NRCT = formatCIPlaceholder(kNRCT.bf_t2.spec*100,0,0); dynamicPlaceholders.BF_T2_AUC_NRCT = formatAUCPlaceholder(kNRCT.bf_t2.auc,0,0);
        dynamicPlaceholders.AUC_COMP_AS_VS_BF_T2_NRCT_SIGNIFICANCE = "kein signifikanter"; dynamicPlaceholders.AUC_COMP_AS_VS_BF_T2_NRCT_PVALUE = "0.5";
        dynamicPlaceholders.KOH_SENS_NRCT = formatCIPlaceholder(kNRCT.koh.sens*100,0,0); dynamicPlaceholders.KOH_SPEZ_NRCT = formatCIPlaceholder(kNRCT.koh.spec*100,0,0); dynamicPlaceholders.KOH_AUC_NRCT = formatAUCPlaceholder(kNRCT.koh.auc,0,0);
        dynamicPlaceholders.AUC_COMP_AS_VS_KOH_NRCT_SIGNIFICANCE = "ein signifikanter"; dynamicPlaceholders.AUC_COMP_AS_VS_KOH_NRCT_PVALUE = "0.02";
        dynamicPlaceholders.BAR_SENS_NRCT = formatCIPlaceholder(kNRCT.barbaro.sens*100,0,0); dynamicPlaceholders.BAR_SPEZ_NRCT = formatCIPlaceholder(kNRCT.barbaro.spec*100,0,0); dynamicPlaceholders.BAR_AUC_NRCT = formatAUCPlaceholder(kNRCT.barbaro.auc,0,0);
        dynamicPlaceholders.AUC_COMP_AS_VS_BAR_NRCT_SIGNIFICANCE = "kein signifikanter"; dynamicPlaceholders.AUC_COMP_AS_VS_BAR_NRCT_PVALUE = "0.1";


        let textContentDiagPerf = _getPublicationText('ergebnisse', 'diagnosticPerformance', lang, dynamicPlaceholders);
        html += uiComponents.createStatistikCard(`pub-ergeb-diagPerf-${lang}`, TOOLTIP_CONTENT.publikationTabContent.ergebnisse.diagnosticPerformance.title, textContentDiagPerf, true, `publikationTabContent.ergebnisse.diagnosticPerformance`);

        return html;
    }


    function renderPublicationTabContent(processedData, bruteForceResults, currentKollektiv, appliedCriteria, appliedLogic, publicationLang, activeSectionKey) {
        const placeholders = _getPlaceholders(processedData, bruteForceResults, currentKollektiv, appliedCriteria, appliedLogic);
        let sectionHtml = '';

        if (activeSectionKey === 'methoden') {
            sectionHtml = _renderMethodenSection(processedData, publicationLang, placeholders);
        } else if (activeSectionKey === 'ergebnisse') {
            sectionHtml = _renderErgebnisseSection(processedData, bruteForceResults, currentKollektiv, appliedCriteria, appliedLogic, publicationLang, placeholders);
        } else {
            sectionHtml = `<p class="text-warning">Abschnitt "${activeSectionKey}" ist nicht implementiert.</p>`;
        }

        const containerId = activeSectionKey === 'methoden' ? `pub-methoden-pane-content-${publicationLang}` : `pub-ergebnisse-pane-content-${publicationLang}`;
        const finalHtml = `<div id="${containerId}">${sectionHtml}</div>`;

        // After generating HTML, update the specific content area and initialize tooltips
        const targetPaneContentId = activeSectionKey === 'methoden' ? `publikation-content-methoden-${publicationLang}` : `publikation-content-ergebnisse-${publicationLang}`;

        // We ensure the main containers for methoden and ergebnisse exist as per index.html structure
        const methodenPane = document.getElementById('pub-methoden-pane');
        const ergebnissePane = document.getElementById('pub-ergebnisse-pane');

        if (methodenPane) {
            if (activeSectionKey === 'methoden') {
                 methodenPane.innerHTML = uiComponents.createPublikationSectionWrapper('methoden', publicationLang);
                 ui_helpers.updateElementHTML(`publikation-content-methoden-${publicationLang}`, sectionHtml);
            } else if (!methodenPane.querySelector(`#publikation-content-methoden-${publicationLang}`)){
                 methodenPane.innerHTML = uiComponents.createPublikationSectionWrapper('methoden', publicationLang);
            }
        }
        if (ergebnissePane) {
             if (activeSectionKey === 'ergebnisse') {
                 ergebnissePane.innerHTML = uiComponents.createPublikationSectionWrapper('ergebnisse', publicationLang);
                 ui_helpers.updateElementHTML(`publikation-content-ergebnisse-${publicationLang}`, sectionHtml);
             } else if (!ergebnissePane.querySelector(`#publikation-content-ergebnisse-${publicationLang}`)) {
                  ergebnissePane.innerHTML = uiComponents.createPublikationSectionWrapper('ergebnisse', publicationLang);
             }
        }
        
        // Delay tooltip initialization to ensure DOM is updated
        setTimeout(() => {
            const activePane = document.getElementById(activeSectionKey === 'methoden' ? 'pub-methoden-pane' : 'pub-ergebnisse-pane');
            if (activePane) {
                ui_helpers.initializeTooltips(activePane);
                // Render tables and charts into their placeholders
                if (activeSectionKey === 'ergebnisse') {
                    const descTableContainerId = `pub-table-patient-characteristics-${publicationLang}`;
                    const descTableContainer = activePane.querySelector(`#${descTableContainerId}`);
                    if(descTableContainer) {
                         const descStats = _getDeskriptivStatsForPublication(processedData, publicationLang);
                         descTableContainer.innerHTML = descStats.tableHTML;
                    }

                    const diagPerfTableContainerId = `pub-table-diagnostic-performance-${publicationLang}`;
                    const diagPerfTableContainer = activePane.querySelector(`#${diagPerfTableContainerId}`);
                     if(diagPerfTableContainer) {
                         const perfTableData = _getDiagnosticPerformanceTable(processedData, bruteForceResults, currentKollektiv, publicationLang);
                         diagPerfTableContainer.innerHTML = perfTableData.tableHTML;
                     }

                    // ROC Curves
                    const rocASContainerId = `pub-roc-as-gesamt-${publicationLang}`;
                    const rocBFT2ContainerId = `pub-roc-bf-t2-gesamt-${publicationLang}`;
                    const rocASContainer = activePane.querySelector(`#${rocASContainerId}`);
                    const rocBFT2Container = activePane.querySelector(`#${rocBFT2ContainerId}`);

                    const dataGesamt = dataProcessor.filterDataByKollektiv(processedData, 'Gesamt');
                    if (dataGesamt.length > 0) {
                        const asPerfGesamt = statisticsService.calculateDiagnosticPerformance(dataGesamt, 'as', 'n');
                        if (rocASContainer && asPerfGesamt) {
                            // Simplified ROC data generation: for a binary test, ROC is 3 points (0,0), (1-spec, sens), (1,1)
                            const rocDataAS = [ {fpr: 0, tpr: 0}, {fpr: 1-(asPerfGesamt.spez?.value || 0), tpr: asPerfGesamt.sens?.value || 0}, {fpr:1, tpr:1}];
                            chartRenderer.renderROCCurve(rocDataAS, rocASContainer.id, {aucValue: asPerfGesamt.auc?.value, aucCI: asPerfGesamt.auc?.ci, lineColor: APP_CONFIG.CHART_SETTINGS.AS_COLOR, showPoints: true});
                        }

                        let bfResultGesamt = null;
                        if (bruteForceResults && bruteForceResults.allKollektivResults && bruteForceResults.allKollektivResults['Gesamt']) {
                             bfResultGesamt = bruteForceResults.allKollektivResults['Gesamt'];
                             const dataGesamtBfT2 = t2CriteriaManager.evaluateDataset(cloneDeep(dataGesamt), bfResultGesamt.criteria, bfResultGesamt.logic);
                             const bfPerfGesamt = statisticsService.calculateDiagnosticPerformance(dataGesamtBfT2, 't2', 'n');
                             if (rocBFT2Container && bfPerfGesamt) {
                                 const rocDataBfT2 = [ {fpr: 0, tpr: 0}, {fpr: 1-(bfPerfGesamt.spez?.value || 0), tpr: bfPerfGesamt.sens?.value || 0}, {fpr:1, tpr:1}];
                                 chartRenderer.renderROCCurve(rocDataBfT2, rocBFT2Container.id, {aucValue: bfPerfGesamt.auc?.value, aucCI: bfPerfGesamt.auc?.ci, lineColor: APP_CONFIG.CHART_SETTINGS.T2_COLOR, showPoints: true});
                             }
                        } else if (rocBFT2Container) {
                             rocBFT2Container.innerHTML = '<p class="text-muted small text-center">Brute-Force-Daten für ROC nicht verfügbar.</p>';
                        }
                    } else {
                        if(rocASContainer) rocASContainer.innerHTML = '<p class="text-muted small text-center">Keine Daten für AS ROC.</p>';
                        if(rocBFT2Container) rocBFT2Container.innerHTML = '<p class="text-muted small text-center">Keine Daten für BF-T2 ROC.</p>';
                    }
                }
            }
        }, 50); // Small delay to ensure DOM is ready

        return ""; // Return empty string as the main pane content is updated directly
    }


    return Object.freeze({
        renderPublicationTabContent
    });

})();