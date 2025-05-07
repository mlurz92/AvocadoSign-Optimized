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
    publikationTab: {
        spracheSwitchLabel: {
            de: 'Deutsch',
            en: 'English'
        },
        sectionNames: {
            methoden: "Methoden",
            ergebnisse: "Ergebnisse",
            einleitung: "Einleitung",
            diskussion: "Diskussion",
            abstract: "Abstract",
            tabellen: "Tabellen",
            abbildungen: "Abbildungen"
        },
        methodenSection: {
            studienanlage: {
                title: {
                    de: "Studienanlage und Patientenkollektiv",
                    en: "Study Design and Patient Cohort"
                },
                textVorschlag: {
                    de: `Diese retrospektive Analyse wurde an einem monozentrischen Kollektiv von [N_GESAMT] konsekutiven Patienten mit histologisch gesichertem Rektumkarzinom durchgeführt, die zwischen Januar 2020 und November 2023 am Klinikum St. Georg, Leipzig, Deutschland, untersucht wurden. Die Studie wurde vom lokalen Ethikkomitee genehmigt (Ethikvotum: [PLATZHALTER_ETHIKVOTUM_NUMMER]), und von allen Patienten wurde eine schriftliche Einverständniserklärung eingeholt. Das Patientenkollektiv ist identisch mit dem der initialen Avocado-Sign-Studie (Lurz & Schäfer, Eur Radiol 2025).
Von den [N_GESAMT] Patienten erhielten [N_NRCT] Patienten ([N_NRCT_PERCENT]%) eine neoadjuvante Radiochemotherapie (nRCT) gemäß den aktuellen Leitlinien, gefolgt von einer Restaging-MRT und anschließender Operation. [N_DIREKT_OP] Patienten ([N_DIREKT_OP_PERCENT]%) wurden primär operiert (Direkt-OP-Gruppe). Die Indikationsstellung zur nRCT erfolgte interdisziplinär im Rahmen eines Tumorboards. Ausschlusskriterien waren irresektable Tumoren und Kontraindikationen für eine MRT-Untersuchung.`,
                    en: `This retrospective analysis was performed on a single-center cohort of [N_GESAMT] consecutive patients with histologically confirmed rectal cancer, examined between January 2020 and November 2023 at Klinikum St. Georg, Leipzig, Germany. The study was approved by the local ethics committee (Ethics vote: [PLACEHOLDER_ETHICS_VOTE_NUMBER]), and written informed consent was obtained from all patients. The patient cohort is identical to that of the initial Avocado Sign study (Lurz & Schäfer, Eur Radiol 2025).
Of the [N_GESAMT] patients, [N_NRCT] patients ([N_NRCT_PERCENT]%) received neoadjuvant chemoradiotherapy (nCRT) according to current guidelines, followed by restaging MRI and subsequent surgery. [N_DIREKT_OP] patients ([N_DIREKT_OP_PERCENT]%) underwent primary surgery (upfront surgery group). The indication for nCRT was determined interdisciplinarily by a tumor board. Exclusion criteria were unresectable tumors and contraindications to MRI examination.`
                }
            },
            mrtProtokoll: {
                title: {
                    de: "MRT-Protokoll",
                    en: "MRI Protocol"
                },
                textVorschlag: {
                    de: `Alle MRT-Untersuchungen wurden an einem 3.0-Tesla-System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Deutschland) unter Verwendung von Körper- und Wirbelsäulen-Array-Spulen durchgeführt. Das standardisierte Untersuchungsprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Orientierung, eine axiale diffusionsgewichtete Sequenz (DWI) sowie kontrastmittelverstärkte axiale T1-gewichtete Sequenzen (Volumetric Interpolated Breath-hold Examination, VIBE) mit Dixon-Fettunterdrückung. Die genauen Sequenzparameter sind in Tabelle 1 der Originalpublikation (Lurz & Schäfer, Eur Radiol 2025) detailliert. Ein makrozyklisches Gadolinium-basiertes Kontrastmittel (Gadoteridol; ProHance; Bracco Imaging Deutschland GmbH, Konstanz, Deutschland) wurde gewichtsadaptiert (0,2 ml/kg Körpergewicht) intravenös appliziert. Zur Reduktion von Bewegungsartefakten wurde zu Beginn und zur Mitte jeder Untersuchung Butylscopolamin verabreicht. Das Bildgebungsprotokoll war für das Staging und Restaging identisch.`,
                    en: `All MRI examinations were performed on a 3.0-Tesla system (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Germany) using body and spine array coils. The standardized examination protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal orientations, an axial diffusion-weighted imaging (DWI) sequence, and contrast-enhanced axial T1-weighted sequences (Volumetric Interpolated Breath-hold Examination, VIBE) with Dixon fat suppression. Detailed sequence parameters are provided in Table 1 of the original publication (Lurz & Schäfer, Eur Radiol 2025). A macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco Imaging Deutschland GmbH, Konstanz, Germany) was administered intravenously adapted to body weight (0.2 mL/kg). Butylscopolamine was administered at the beginning and midpoint of each examination to reduce motion artifacts. The imaging protocol was identical for staging and restaging.`
                }
            },
            bildanalyse: {
                title: {
                    de: "Bildanalyse",
                    en: "Image Analysis"
                },
                textVorschlag: {
                    de: `<h4>Avocado Sign (AS)</h4>
<p>Die Bewertung des Avocado Signs erfolgte auf den kontrastmittelverstärkten T1-gewichteten Sequenzen durch zwei Radiologen (M.L., 7 Jahre Erfahrung; A.S., 29 Jahre Erfahrung in der abdominellen MRT) in Unkenntnis der histopathologischen Ergebnisse, wie in der Originalpublikation beschrieben. Das Avocado Sign wurde als hypointenser Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens definiert, unabhängig von Größe oder Form des Lymphknotens. Alle sichtbaren mesorektalen Lymphknoten wurden bewertet. Ein Fall wurde als AS-positiv gewertet, wenn mindestens ein Lymphknoten das Avocado Sign zeigte.</p>
<h4>T2-gewichtete Kriterien</h4>
<p>Für jeden im hochauflösenden T2-gewichteten MRT sichtbaren mesorektalen Lymphknoten wurden folgende morphologische Parameter erfasst: Kurzachsendurchmesser (mm), Form (rund/oval), Kontur (scharf/irregulär), Binnenstruktur/Homogenität (homogen/heterogen) und Signalintensität (signalarm/intermediär/signalreich relativ zur umgebenden Muskulatur). Diese Parameter dienten als Grundlage für die Anwendung der T2-Kriteriensets aus der Literatur:</p>
<ul>
    <li><strong>Koh et al. (2008):</strong> Ein Lymphknoten wurde als maligne gewertet, wenn er eine irreguläre Kontur ODER ein heterogenes Binnensignal aufwies. Diese Kriterien wurden auf das Gesamtkollektiv angewendet. (Originalstudie: N=[KOH_N], nCRT-Gruppe)</li>
    <li><strong>Barbaro et al. (2024):</strong> Ein Lymphknoten wurde als maligne gewertet, wenn sein Kurzachsendurchmesser ≥ 2,3 mm betrug. Diese Kriterien wurden auf die nRCT-Subgruppe angewendet. (Originalstudie: N=[BARBARO_N], nCRT-Gruppe)</li>
    <li><strong>Rutegård et al. (2025) / ESGAR 2016:</strong> Ein Lymphknoten wurde als maligne gewertet bei: Größe ≥ 9mm ODER (Größe 5-8mm UND ≥2 der Merkmale [rund, irregulär, heterogen]) ODER (Größe < 5mm UND alle 3 Merkmale [rund, irregulär, heterogen]). Diese Kriterien wurden auf die Direkt-OP-Subgruppe angewendet (Primärstaging). (Originalstudie Rutegård et al.: N=[RUTEGARD_N])</li>
</ul>
<p>Ein Fall wurde als T2-positiv für ein bestimmtes Kriterienset gewertet, wenn mindestens ein Lymphknoten die entsprechenden Kriterien erfüllte.</p>
<h4>Interobserver-Reliabilität</h4>
<p>Die Interobserver-Reliabilität für das Avocado Sign wurde in der Originalstudie bestimmt (Cohens Kappa = 0,92). Für die T2-gewichteten morphologischen Kriterien wurde in dieser Studie eine erneute Bewertung der Interobserver-Reliabilität durchgeführt [PLATZHALTER_INTEROBSERVER_T2_DETAILS].</p>`,
                    en: `<h4>Avocado Sign (AS)</h4>
<p>The Avocado Sign was assessed on contrast-enhanced T1-weighted sequences by two radiologists (M.L., 7 years of experience; A.S., 29 years of experience in abdominal MRI) blinded to the histopathological results, as described in the original publication. The Avocado Sign was defined as a hypointense core within an otherwise homogeneously hyperintense lymph node, regardless of node size or shape. All visible mesorectal lymph nodes were evaluated. A case was considered AS-positive if at least one lymph node exhibited the Avocado Sign.</p>
<h4>T2-weighted Criteria</h4>
<p>For each mesorectal lymph node visible on high-resolution T2-weighted MRI, the following morphological parameters were recorded: short-axis diameter (mm), shape (round/oval), border (sharp/irregular), internal structure/homogeneity (homogeneous/heterogeneous), and signal intensity (signal-poor/intermediate/signal-rich relative to surrounding muscle). These parameters served as the basis for applying T2 criteria sets from the literature:</p>
<ul>
    <li><strong>Koh et al. (2008):</strong> A lymph node was considered malignant if it had an irregular border OR heterogeneous internal signal. These criteria were applied to the entire cohort. (Original study: N=[KOH_N], nCRT group)</li>
    <li><strong>Barbaro et al. (2024):</strong> A lymph node was considered malignant if its short-axis diameter was ≥ 2.3 mm. These criteria were applied to the nCRT subgroup. (Original study: N=[BARBARO_N], nCRT group)</li>
    <li><strong>Rutegård et al. (2025) / ESGAR 2016:</strong> A lymph node was considered malignant if: size ≥ 9mm OR (size 5-8mm AND ≥2 features [round, irregular, heterogeneous]) OR (size < 5mm AND all 3 features [round, irregular, heterogeneous]). These criteria were applied to the upfront surgery subgroup (primary staging). (Original study Rutegård et al.: N=[RUTEGARD_N])</li>
</ul>
<p>A case was considered T2-positive for a specific criteria set if at least one lymph node met the respective criteria.</p>
<h4>Interobserver Reliability</h4>
<p>Interobserver reliability for the Avocado Sign was determined in the original study (Cohen's Kappa = 0.92). For the T2-weighted morphological criteria, interobserver reliability was reassessed in this study [PLACEHOLDER_INTEROBSERVER_T2_DETAILS].</p>`
                }
            },
            histopathologie: {
                title: {
                    de: "Histopathologische Analyse",
                    en: "Histopathological Analysis"
                },
                textVorschlag: {
                    de: `<p>Die Operationspräparate wurden standardisiert aufgearbeitet. Alle mesorektalen Lymphknoten wurden identifiziert, gezählt und histopathologisch auf das Vorhandensein von Metastasen untersucht. Der pathologische N-Status (pN+ oder pN0) diente als Referenzstandard.</p>`,
                    en: `<p>Surgical specimens were processed according to standard procedures. All mesorectal lymph nodes were identified, counted, and histopathologically examined for the presence of metastases. The pathological N-status (pN+ or pN0) served as the reference standard.</p>`
                }
            },
            statistik: {
                title: {
                    de: "Statistische Analyse",
                    en: "Statistical Analysis"
                },
                textVorschlag: {
                    de: `<p>Die statistische Auswertung erfolgte mit der hier verwendeten Webanwendung (Version ${APP_CONFIG.APP_VERSION}). Für das Avocado Sign und jedes T2-Kriterienset wurden Sensitivität, Spezifität, positiver prädiktiver Wert (PPV), negativer prädiktiver Wert (NPV), Accuracy und die Area Under the Curve (AUC) der Receiver Operating Characteristic (ROC)-Kurve (entsprechend der Balanced Accuracy für binäre Tests) mit 95%-Konfidenzintervallen (CI) berechnet. CIs für Proportionen wurden mittels Wilson-Score-Intervall, CIs für AUC/Balanced Accuracy und F1-Score mittels Bootstrap-Percentile-Methode (${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} Replikationen) bestimmt. Die diagnostische Leistung von AS wurde mit der jedes T2-Kriteriensets mittels McNemar-Test (für Accuracy) und DeLong-Test (für AUC) verglichen. Assoziationen einzelner morphologischer T2-Merkmale mit dem N-Status wurden mittels Odds Ratios (OR), Risk Differences (RD) und Phi-Koeffizienten untersucht; p-Werte wurden mittels Fisher's Exact Test (für kategoriale Merkmale) oder Mann-Whitney-U-Test (für Lymphknotengröße) berechnet. Ein p-Wert < ${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL} wurde als statistisch signifikant gewertet. Zusätzlich wurde eine explorative Brute-Force-Optimierung durchgeführt, um die Kombination von T2-Merkmalen zu identifizieren, die eine ausgewählte Zielmetrik (z.B. Balanced Accuracy) maximiert.</p>`,
                    en: `<p>Statistical analysis was performed using the web application described herein (version ${APP_CONFIG.APP_VERSION}). For the Avocado Sign and each T2 criteria set, sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy, and the area under the receiver operating characteristic (ROC) curve (AUC, equivalent to balanced accuracy for binary tests) were calculated with 95% confidence intervals (CI). CIs for proportions were determined using the Wilson score interval method; CIs for AUC/balanced accuracy and F1-score were estimated using the bootstrap percentile method (${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} replications). The diagnostic performance of AS was compared with that of each T2 criteria set using McNemar's test (for accuracy) and DeLong's test (for AUC). Associations of individual morphological T2 features with N-status were assessed using odds ratios (OR), risk differences (RD), and phi coefficients; p-values were calculated using Fisher's exact test (for categorical features) or the Mann-Whitney U test (for lymph node size). A p-value < ${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL} was considered statistically significant. Additionally, an exploratory brute-force optimization was performed to identify the combination of T2 features that maximized a selected target metric (e.g., balanced accuracy).</p>`
                }
            }
        },
        ergebnisseSection: {
            patientenCharakteristika: {
                title: {
                    de: "Patientencharakteristika",
                    en: "Patient Characteristics"
                },
                textVorschlag: {
                    de: `Insgesamt wurden [N_GESAMT] Patienten in die Studie eingeschlossen. Das mediane Alter betrug [MEDIAN_ALTER] Jahre (Interquartilbereich [IQR_ALTER_Q1]–[IQR_ALTER_Q3] Jahre). [N_MAENNLICH] ([N_MAENNLICH_PERCENT]%) Patienten waren männlich. [N_DIREKT_OP] ([N_DIREKT_OP_PERCENT]%) Patienten unterzogen sich einer primären Operation, während [N_NRCT] ([N_NRCT_PERCENT]%) Patienten eine neoadjuvante Radiochemotherapie erhielten. Der pathologische Lymphknotenstatus war bei [N_N_PLUS] von [N_GESAMT] Patienten ([N_N_PLUS_PERCENT]%) positiv (N+). Die detaillierten Patientencharakteristika sind in Tabelle 1 dargestellt.`,
                    en: `A total of [N_GESAMT] patients were included in the study. The median age was [MEDIAN_ALTER] years (interquartile range [IQR_ALTER_Q1]–[IQR_ALTER_Q3] years). [N_MAENNLICH] ([N_MAENNLICH_PERCENT]%) patients were male. [N_DIREKT_OP] ([N_DIREKT_OP_PERCENT]%) patients underwent upfront surgery, while [N_NRCT] ([N_NRCT_PERCENT]%) patients received neoadjuvant chemoradiotherapy. Pathological lymph node status was positive (N+) in [N_N_PLUS] of [N_GESAMT] patients ([N_N_PLUS_PERCENT]%). Detailed patient characteristics are presented in Table 1.`
                },
                tableTitle: {
                    de: "Tabelle 1: Patientencharakteristika des Gesamtkollektivs",
                    en: "Table 1: Patient Characteristics of the Overall Cohort"
                }
            },
            performanceASGesamt: {
                title: {
                    de: "Diagnostische Leistung des Avocado Signs (Gesamtkollektiv)",
                    en: "Diagnostic Performance of the Avocado Sign (Overall Cohort)"
                },
                textVorschlag: {
                    de: `Im Gesamtkollektiv (N=[N_GESAMT]) zeigte das Avocado Sign eine Sensitivität von [AS_SENS_GESAMT]% (95% CI: [AS_SENS_CI_L_GESAMT]%–[AS_SENS_CI_U_GESAMT]%), eine Spezifität von [AS_SPEZ_GESAMT]% (95% CI: [AS_SPEZ_CI_L_GESAMT]%–[AS_SPEZ_CI_U_GESAMT]%) und eine AUC von [AS_AUC_GESAMT] (95% CI: [AS_AUC_CI_L_GESAMT]–[AS_AUC_CI_U_GESAMT]). Die weiteren Gütekriterien sind in Tabelle 2 zusammengefasst.`,
                    en: `In the overall cohort (N=[N_GESAMT]), the Avocado Sign demonstrated a sensitivity of [AS_SENS_GESAMT]% (95% CI: [AS_SENS_CI_L_GESAMT]%–[AS_SENS_CI_U_GESAMT]%), a specificity of [AS_SPEZ_GESAMT]% (95% CI: [AS_SPEZ_CI_L_GESAMT]%–[AS_SPEZ_CI_U_GESAMT]%), and an AUC of [AS_AUC_GESAMT] (95% CI: [AS_AUC_CI_L_GESAMT]–[AS_AUC_CI_U_GESAMT]). Further performance metrics are summarized in Table 2.`
                },
                tableTitle: {
                    de: "Tabelle 2: Diagnostische Leistung des Avocado Signs im Gesamtkollektiv",
                    en: "Table 2: Diagnostic Performance of the Avocado Sign in the Overall Cohort"
                }
            },
            vergleichAST2Literatur: {
                title: {
                    de: "Vergleich AS vs. Literatur-T2-Kriterien",
                    en: "Comparison AS vs. Literature T2 Criteria"
                },
                textVorschlag: {
                    de: `Der direkte Vergleich der diagnostischen Leistung des Avocado Signs mit den etablierten T2-Kriteriensets aus der Literatur für das jeweilige Zielkollektiv ist in Tabelle 3 dargestellt.
Für die Kriterien nach Koh et al. (Gesamtkollektiv, N=[N_GESAMT_KOH_VERGLEICH]) zeigte das Avocado Sign eine signifikant höhere AUC ([AS_AUC_KOH_VERGLEICH] vs. [KOH_AUC_KOH_VERGLEICH]; p=[P_DELONG_AS_VS_KOH]). Die Accuracy unterschied sich [SIGNIFIKANZ_ACC_AS_VS_KOH] ([AS_ACC_KOH_VERGLEICH]% vs. [KOH_ACC_KOH_VERGLEICH]%; p=[P_MCNEMAR_AS_VS_KOH]).
In der nRCT-Subgruppe (N=[N_NRCT_BARBARO_VERGLEICH]) war die AUC des Avocado Signs ([AS_AUC_BARBARO_VERGLEICH]) [VERGLEICH_AUC_AS_VS_BARBARO] als die der Barbaro et al. Kriterien ([BARBARO_AUC_BARBARO_VERGLEICH]; p=[P_DELONG_AS_VS_BARBARO]). Die Accuracy war [VERGLEICH_ACC_AS_VS_BARBARO] ([AS_ACC_BARBARO_VERGLEICH]% vs. [BARBARO_ACC_BARBARO_VERGLEICH]%; p=[P_MCNEMAR_AS_VS_BARBARO]).
Für die Direkt-OP-Subgruppe (N=[N_DIREKTOP_RUTEGARD_VERGLEICH]) zeigte das Avocado Sign eine [VERGLEICH_AUC_AS_VS_RUTEGARD] AUC ([AS_AUC_RUTEGARD_VERGLEICH]) im Vergleich zu den Rutegård et al./ESGAR Kriterien ([RUTEGARD_AUC_RUTEGARD_VERGLEICH]; p=[P_DELONG_AS_VS_RUTEGARD]). Die Accuracy war [VERGLEICH_ACC_AS_VS_RUTEGARD] ([AS_ACC_RUTEGARD_VERGLEICH]% vs. [RUTEGARD_ACC_RUTEGARD_VERGLEICH]%; p=[P_MCNEMAR_AS_VS_RUTEGARD]).`,
                    en: `The direct comparison of the diagnostic performance of the Avocado Sign with established T2 criteria sets from the literature for the respective target cohort is shown in Table 3.
For the criteria by Koh et al. (overall cohort, N=[N_GESAMT_KOH_VERGLEICH]), the Avocado Sign showed a significantly higher AUC ([AS_AUC_KOH_VERGLEICH] vs. [KOH_AUC_KOH_VERGLEICH]; p=[P_DELONG_AS_VS_KOH]). The accuracy differed [SIGNIFICANCE_ACC_AS_VS_KOH_EN] ([AS_ACC_KOH_VERGLEICH]% vs. [KOH_ACC_KOH_VERGLEICH]%; p=[P_MCNEMAR_AS_VS_KOH]).
In the nCRT subgroup (N=[N_NRCT_BARBARO_VERGLEICH]), the AUC of the Avocado Sign ([AS_AUC_BARBARO_VERGLEICH]) was [COMPARISON_AUC_AS_VS_BARBARO_EN] than that of the Barbaro et al. criteria ([BARBARO_AUC_BARBARO_VERGLEICH]; p=[P_DELONG_AS_VS_BARBARO]). The accuracy was [COMPARISON_ACC_AS_VS_BARBARO_EN] ([AS_ACC_BARBARO_VERGLEICH]% vs. [BARBARO_ACC_BARBARO_VERGLEICH]%; p=[P_MCNEMAR_AS_VS_BARBARO]).
For the upfront surgery subgroup (N=[N_DIREKTOP_RUTEGARD_VERGLEICH]), the Avocado Sign showed a [COMPARISON_AUC_AS_VS_RUTEGARD_EN] AUC ([AS_AUC_RUTEGARD_VERGLEICH]) compared to the Rutegård et al./ESGAR criteria ([RUTEGARD_AUC_RUTEGARD_VERGLEICH]; p=[P_DELONG_AS_VS_RUTEGARD]). The accuracy was [COMPARISON_ACC_AS_VS_RUTEGARD_EN] ([AS_ACC_RUTEGARD_VERGLEICH]% vs. [RUTEGARD_ACC_RUTEGARD_VERGLEICH]%; p=[P_MCNEMAR_AS_VS_RUTEGARD]).`
                },
                tableTitle: {
                    de: "Tabelle 3: Vergleich der diagnostischen Leistung von Avocado Sign vs. Literatur-T2-Kriterien",
                    en: "Table 3: Comparison of Diagnostic Performance of Avocado Sign vs. Literature T2 Criteria"
                },
                 subgroupTableTitle: {
                    de: "Tabelle 3.{SUB_INDEX}: Vergleich AS vs. {T2_SET_NAME} für {SUBGROUP_NAME} (N={SUBGROUP_N})",
                    en: "Table 3.{SUB_INDEX}: Comparison AS vs. {T2_SET_NAME} for {SUBGROUP_NAME} (N={SUBGROUP_N})"
                }
            },
            optimierteT2Kriterien: {
                title: {
                    de: "Optimierte T2-Kriterien (Brute-Force)",
                    en: "Optimized T2 Criteria (Brute-Force)"
                },
                textVorschlag: {
                    de: `Mittels Brute-Force-Optimierung wurde für das Gesamtkollektiv (N=[N_GESAMT]) das T2-Kriterienset identifiziert, das die Balanced Accuracy maximiert. Das optimale Set ([OPTIMAL_T2_KRITERIEN_GESAMT_TEXT]) erreichte eine Balanced Accuracy von [OPTIMAL_T2_BALACC_GESAMT] (Sensitivität: [OPTIMAL_T2_SENS_GESAMT]%, Spezifität: [OPTIMAL_T2_SPEZ_GESAMT]%).
Für die Direkt-OP-Subgruppe (N=[N_DIREKT_OP]) war das beste Set [OPTIMAL_T2_KRITERIEN_DIREKTOP_TEXT] mit einer Balanced Accuracy von [OPTIMAL_T2_BALACC_DIREKTOP] (Sens.: [OPTIMAL_T2_SENS_DIREKTOP]%, Spez.: [OPTIMAL_T2_SPEZ_DIREKTOP]%).
Für die nRCT-Subgruppe (N=[N_NRCT]) ergab sich [OPTIMAL_T2_KRITERIEN_NRCT_TEXT] als optimales Set mit einer Balanced Accuracy von [OPTIMAL_T2_BALACC_NRCT] (Sens.: [OPTIMAL_T2_SENS_NRCT]%, Spez.: [OPTIMAL_T2_SPEZ_NRCT]%).
Der Vergleich dieser optimierten T2-Kriterien mit dem Avocado Sign ist in Tabelle 4 dargestellt.`,
                    en: `Using brute-force optimization, the T2 criteria set maximizing balanced accuracy was identified for the overall cohort (N=[N_GESAMT]). The optimal set ([OPTIMAL_T2_CRITERIA_OVERALL_TEXT_EN]) achieved a balanced accuracy of [OPTIMAL_T2_BALACC_GESAMT] (sensitivity: [OPTIMAL_T2_SENS_GESAMT]%, specificity: [OPTIMAL_T2_SPEZ_GESAMT]%).
For the upfront surgery subgroup (N=[N_DIREKT_OP]), the best set was [OPTIMAL_T2_CRITERIA_UPFRONT_TEXT_EN] with a balanced accuracy of [OPTIMAL_T2_BALACC_DIREKTOP] (sens.: [OPTIMAL_T2_SENS_DIREKTOP]%, spec.: [OPTIMAL_T2_SPEZ_DIREKTOP]%).
For the nCRT subgroup (N=[N_NRCT]), [OPTIMAL_T2_CRITERIA_NCRT_TEXT_EN] emerged as the optimal set with a balanced accuracy of [OPTIMAL_T2_BALACC_NRCT] (sens.: [OPTIMAL_T2_SENS_NRCT]%, spec.: [OPTIMAL_T2_SPEZ_NRCT]%).
The comparison of these optimized T2 criteria with the Avocado Sign is presented in Table 4.`
                },
                tableTitle: {
                    de: "Tabelle 4: Vergleich AS vs. optimierte T2-Kriterien (Balanced Accuracy)",
                    en: "Table 4: Comparison AS vs. Optimized T2 Criteria (Balanced Accuracy)"
                }
            },
            einzelmerkmaleT2: {
                title: {
                    de: "Assoziation einzelner T2-Merkmale mit N-Status",
                    en: "Association of Individual T2 Features with N-Status"
                },
                textVorschlag: {
                    de: `Die Assoziation einzelner morphologischer T2-Merkmale mit dem pathologischen N-Status im Gesamtkollektiv (N=[N_GESAMT]) ist in Tabelle 5 zusammengefasst. Signifikante Assoziationen zeigten sich für [LISTE_SIGNIFIKANTE_MERKMALE_DE]. Keine signifikante Assoziation wurde für [LISTE_NICHT_SIGNIFIKANTE_MERKMALE_DE] gefunden.`,
                    en: `The association of individual morphological T2 features with pathological N-status in the overall cohort (N=[N_GESAMT]) is summarized in Table 5. Significant associations were found for [LIST_SIGNIFICANT_FEATURES_EN]. No significant association was found for [LIST_NON_SIGNIFICANT_FEATURES_EN].`
                },
                tableTitle: {
                    de: "Tabelle 5: Assoziation einzelner T2-Merkmale mit dem N-Status (Gesamtkollektiv)",
                    en: "Table 5: Association of Individual T2 Features with N-Status (Overall Cohort)"
                }
            }
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
        patientCount: 'Anzahl Fälle',
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
    }
};

const TOOLTIP_CONTENT = {
    kollektivButtons: { description: "Wählen Sie das Analysekollektiv aus: Gesamt, nur primär Operierte (direkt OP) oder nur neoadjuvant Vorbehandelte (nRCT). Die Auswahl filtert die Daten für alle Tabs." },
    headerStats: {
        kollektiv: "Aktuell betrachtetes Analysekollektiv.",
        anzahlPatienten: "Gesamtzahl der Fälle im ausgewählten Kollektiv.",
        statusN: "Anteil der Fälle mit positivem (+) vs. negativem (-) histopathologischem Lymphknotenstatus (Referenzstandard) im ausgewählten Kollektiv.",
        statusAS: "Anteil der Fälle mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß Avocado Sign (AS) Vorhersage im ausgewählten Kollektiv.",
        statusT2: "Anteil der Fälle mit positivem (+) vs. negativem (-) Lymphknotenstatus gemäß den aktuell **angewendeten und gespeicherten** T2-Kriterien (siehe Auswertungstab) für das ausgewählte Kollektiv."
    },
    datenTable: {
        nr: "Fortlaufende Nummer des Datensatzes.",
        name: "Nachname des Falles (anonymisiert/kodiert).",
        vorname: "Vorname des Falles (anonymisiert/kodiert).",
        geschlecht: "Geschlecht des Falles (m/w).",
        alter: "Alter des Falles zum Zeitpunkt der MRT-Untersuchung in Jahren.",
        therapie: "Angewandte Therapie vor der Operation (nRCT: neoadjuvante Radiochemotherapie, direkt OP: keine Vorbehandlung).",
        n_as_t2: "Direkter Vergleich des Lymphknotenstatus: N (Pathologie-Referenz), AS (Avocado Sign Vorhersage), T2 (Vorhersage basierend auf aktuell angewendeten Kriterien). Klicken Sie auf N, AS oder T2, um nach diesem spezifischen Status zu sortieren.",
        bemerkung: "Zusätzliche klinische oder radiologische Bemerkungen zum Fall, falls vorhanden.",
        expandAll: "Öffnet oder schließt die Detailansicht zu den T2-gewichteten Lymphknotenmerkmalen für alle Fälle in der aktuellen Tabellenansicht.",
        expandRow: "Klicken Sie auf diese Zeile, um Details zu den morphologischen Eigenschaften der T2-gewichteten Lymphknoten dieses spezifischen Falles anzuzeigen oder auszublenden."
    },
    auswertungTable: {
        nr: "Fortlaufende Nummer des Falles.",
        name: "Nachname des Falles (anonymisiert/kodiert).",
        therapie: "Angewandte Therapie vor der Operation.",
        n_as_t2: "Direkter Vergleich des Lymphknotenstatus: N (Pathologie-Referenz), AS (Avocado Sign Vorhersage), T2 (Vorhersage basierend auf aktuell angewendeten Kriterien). Klicken Sie auf N, AS oder T2, um nach diesem spezifischen Status zu sortieren.",
        n_counts: "Anzahl pathologisch positiver (N+) Lymphknoten / Gesamtzahl histopathologisch untersuchter Lymphknoten für diesen Fall.",
        as_counts: "Anzahl als positiv bewerteter Avocado Sign (AS+) Lymphknoten / Gesamtzahl im T1KM-MRT sichtbarer Lymphknoten für diesen Fall.",
        t2_counts: "Anzahl als positiv bewerteter T2-Lymphknoten (gemäß aktuell angewendeter Kriterien) / Gesamtzahl im T2-MRT sichtbarer Lymphknoten für diesen Fall.",
        expandAll: "Öffnet oder schließt die Detailansicht der bewerteten T2-gewichteten Lymphknoten und der erfüllten Kriterien für alle Fälle in der aktuellen Tabellenansicht.",
        expandRow: "Klicken Sie auf diese Zeile, um die detaillierte Bewertung der einzelnen T2-gewichteten Lymphknoten dieses Falles gemäß der aktuell angewendeten Kriterien anzuzeigen oder auszublenden. Erfüllte Positiv-Kriterien werden hervorgehoben."
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
    bruteForceInfo: { description: "Zeigt den Status des Optimierungs-Workers und das aktuell für die Analyse ausgewählte Kollektiv an." },
    bruteForceProgress: { description: "Zeigt den Fortschritt der laufenden Optimierung an: Anzahl bereits getesteter Kombinationen von insgesamt zu testenden [TOTAL], sowie die bisher beste gefundene Metrik mit den zugehörigen Kriterien und der Logik." },
    bruteForceResult: { description: "Zeigt das Ergebnis der abgeschlossenen Optimierung an: die beste gefundene Kriterienkombination (Logik, aktive Kriterien, Werte) und den damit erreichten Wert der Zielmetrik für das analysierte Kollektiv." },
    bruteForceDetailsButton: { description: "Öffnet ein separates Fenster (Modal), das eine sortierte Liste der Top 10 gefundenen Kriterienkombinationen (inklusive solcher mit gleichem Metrikwert) und weitere Details zur Optimierung anzeigt." },
    bruteForceModal: { exportButton: "Exportiert den detaillierten Bericht der Brute-Force-Optimierung, inklusive der Top 10 Ergebnisse und der Konfiguration, als formatierte Textdatei (.txt)." },
    statistikLayout: { description: "Wählen Sie die Anzeigeart für die statistischen Ergebnisse: 'Einzelansicht' zeigt die detaillierte Statistik für die global im Header ausgewählte Gruppe. 'Vergleich Aktiv' ermöglicht die Auswahl von zwei Kollektiven und zeigt deren Statistiken nebeneinander sowie zusätzliche statistische Tests zum Vergleich der Performanz zwischen den Gruppen an." },
    statistikKollektiv1: { description: "Wählen Sie das erste Kollektiv für die statistische Auswertung bzw. den Vergleich (nur aktiv bei Layout 'Vergleich Aktiv')." },
    statistikKollektiv2: { description: "Wählen Sie das zweite Kollektiv für den Vergleich (nur aktiv bei Layout 'Vergleich Aktiv')." },
    statistikToggleVergleich: { description: "Schaltet zwischen der Ansicht für ein einzelnes, global gewähltes Kollektiv und der Vergleichsansicht zweier spezifisch wählbarer Kollektive um." },
    deskriptiveStatistik: {
        cardTitle: "Überblick über die demographischen Daten (Alter, Geschlecht), Therapieart und Verteilung der N-, AS- und T2-Status sowie Lymphknotenanzahlen im ausgewählten Kollektiv ([KOLLEKTIV]).",
        alterMedian: { description: "Alter: Der zentrale Wert (Median), der die Fälle nach Alter in zwei gleich große Hälften teilt. Angegeben mit Minimum-Maximum und [Mittelwert ± Standardabweichung]." },
        geschlecht: { description: "Absolute Anzahl und prozentuale Verteilung der Geschlechter (männlich/weiblich) im Kollektiv." },
        nStatus: { description: "Absolute Anzahl und prozentualer Anteil der Fälle mit positivem (+) bzw. negativem (-) histopathologischem N-Status im Kollektiv." },
        asStatus: { description: "Absolute Anzahl und prozentualer Anteil der Fälle mit positivem (+) bzw. negativem (-) vorhergesagtem AS-Status im Kollektiv." },
        t2Status: { description: "Absolute Anzahl und prozentualer Anteil der Fälle mit positivem (+) bzw. negativem (-) vorhergesagtem T2-Status (basierend auf aktuell angewendeten Kriterien) im Kollektiv." },
        lkAnzahlPatho: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Gesamtzahl histopathologisch untersuchter Lymphknoten pro Fall im Kollektiv." },
        lkAnzahlPathoPlus: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Anzahl pathologisch positiver (N+) Lymphknoten pro Fall, *nur* bezogen auf die Fälle, die tatsächlich N+ waren." },
        lkAnzahlAS: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Gesamtzahl im T1KM-MRT detektierter Avocado Sign Lymphknoten (AS gesamt) pro Fall." },
        lkAnzahlASPlus: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Anzahl als positiv bewerteter Avocado Sign Lymphknoten (AS+) pro Fall, *nur* bezogen auf die Fälle, die AS+ waren." },
        lkAnzahlT2: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Gesamtzahl im T2-MRT detektierter Lymphknoten pro Fall." },
        lkAnzahlT2Plus: { description: "Median (Minimum-Maximum) [Mittelwert ± Standardabweichung] der Anzahl als positiv bewerteter T2-Lymphknoten (T2+, gemäß angewendeter Kriterien) pro Fall, *nur* bezogen auf die Fälle, die T2+ waren." },
        chartAge: { description: "Histogramm der Altersverteilung der Fälle im Kollektiv [KOLLEKTIV]." },
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
    praesentation: {
        viewSelect: { description: "Wählen Sie die Datenansicht für den Präsentations-Tab: 'Avocado Sign (Daten)' zeigt die dynamisch berechneten Kernergebnisse für AS im aktuellen Kollektiv. 'AS vs. T2 (Vergleich)' ermöglicht einen dynamischen Vergleich von AS mit T2-Kriterien für das aktuell global gewählte Kollektiv." },
        studySelect: { description: "Wählen Sie eine Quelle für die T2-Kriterien, die mit dem Avocado Sign verglichen werden sollen: Entweder die aktuell in der App eingestellten ('Eingestellte T2 Kriterien') oder vordefinierte Kriteriensätze aus relevanten publizierten Studien. Die Auswahl aktualisiert die Info-Karte und den Vergleichs-Chart. Der Vergleich basiert immer auf dem aktuell im Header ausgewählten Kollektiv." },
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
            kollektiv: "Kollektiv (Gesamt, Direkt OP, nRCT). N = Anzahl Fälle in der Gruppe.",
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
        xlsxZIP: { description: "Bündelt alle verfügbaren Excel-Dateien in einem ZIP-Archiv.", type: 'XLSX_ZIP', ext: "xlsx"}
    },
    publikationTabTooltips: {
        tabDescription: "Bietet Hilfestellungen, Textbausteine, Tabellen und Diagramme für die wissenschaftliche Publikation zum Vergleich des Avocado Signs mit etablierten T2-Kriterien.",
        sectionSelection: "Wählen Sie den gewünschten Abschnitt der Publikation (z.B. Methoden, Ergebnisse) zur Ansicht und Bearbeitung der Inhalte.",
        languageSwitch: "Wechselt die Sprache der Textvorschläge und Inhalte im Publikations-Tab zwischen Deutsch und Englisch.",
        methodenSection: "Methodenteil der Publikation.",
        ergebnisseSection: "Ergebnisteil der Publikation.",
        textvorschlagCard: "Formulierungsvorschlag für den Abschnitt '[SECTION_NAME]' der Publikation.",
        unterstützendeTabelleCard: "Unterstützende Tabelle für den Abschnitt '[SECTION_NAME]'.",
        unterstützendesDiagrammCard: "Unterstützendes Diagramm für den Abschnitt '[SECTION_NAME]'.",
        methoden: {
            studienanlage: {
                cardTitle: {
                    de: "Publikationstext: Studienanlage und Patientenkollektiv",
                    en: "Publication Text: Study Design and Patient Cohort"
                },
                description: {
                    de: "Dieser Abschnitt beschreibt das Design der Studie, die Rekrutierung der Patienten und die Zusammensetzung des Studienkollektivs.",
                    en: "This section describes the study design, patient recruitment, and composition of the study cohort."
                }
            },
            mrtProtokoll: {
                cardTitle: {
                    de: "Publikationstext: MRT-Protokoll",
                    en: "Publication Text: MRI Protocol"
                },
                description: {
                    de: "Detaillierte Beschreibung des verwendeten MRT-Protokolls, einschließlich Sequenzparameter und Kontrastmittelapplikation.",
                    en: "Detailed description of the MRI protocol used, including sequence parameters and contrast agent administration."
                }
            },
            bildanalyse: {
                cardTitle: {
                    de: "Publikationstext: Bildanalyse",
                    en: "Publication Text: Image Analysis"
                },
                description: {
                    de: "Erläuterung der Methodik zur Bewertung des Avocado Signs und der T2-gewichteten Kriterien, inklusive der Definitionen der Literatur-Kriteriensets und der Interobserver-Reliabilität.",
                    en: "Explanation of the methodology for assessing the Avocado Sign and T2-weighted criteria, including definitions of literature criteria sets and interobserver reliability."
                }
            },
            histopathologie: {
                cardTitle: {
                    de: "Publikationstext: Histopathologische Analyse",
                    en: "Publication Text: Histopathological Analysis"
                },
                description: {
                    de: "Beschreibung der Aufarbeitung der Operationspräparate und der histopathologischen Untersuchung der Lymphknoten als Referenzstandard.",
                    en: "Description of the processing of surgical specimens and histopathological examination of lymph nodes as the reference standard."
                }
            },
            statistik: {
                cardTitle: {
                    de: "Publikationstext: Statistische Analyse",
                    en: "Publication Text: Statistical Analysis"
                },
                description: {
                    de: "Übersicht der angewandten statistischen Methoden zur Berechnung der diagnostischen Gütekriterien, für Vergleiche und Assoziationsanalysen.",
                    en: "Overview of the statistical methods applied for calculating diagnostic performance metrics, for comparisons, and association analyses."
                }
            }
        },
        ergebnisse: {
            patientenCharakteristika: {
                cardTitle: {
                    de: "Publikationstext: Patientencharakteristika",
                    en: "Publication Text: Patient Characteristics"
                },
                description: {
                    de: "Zusammenfassung der demographischen und klinischen Charakteristika des Studienkollektivs.",
                    en: "Summary of the demographic and clinical characteristics of the study cohort."
                },
                tableTitle: {
                    de: "Tabelle 1: Patientencharakteristika des Gesamtkollektivs",
                    en: "Table 1: Patient Characteristics of the Overall Cohort"
                }
            },
            performanceASGesamt: {
                cardTitle: {
                    de: "Publikationstext: Diagnostische Leistung AS (Gesamtkollektiv)",
                    en: "Publication Text: Diagnostic Performance AS (Overall Cohort)"
                },
                description: {
                    de: "Darstellung der diagnostischen Güte des Avocado Signs für die Vorhersage des N-Status im Gesamtkollektiv.",
                    en: "Presentation of the diagnostic performance of the Avocado Sign for predicting N-status in the overall cohort."
                },
                tableTitle: {
                    de: "Tabelle 2: Diagnostische Leistung des Avocado Signs im Gesamtkollektiv",
                    en: "Table 2: Diagnostic Performance of the Avocado Sign in the Overall Cohort"
                }
            },
            vergleichAST2Literatur: {
                cardTitle: {
                    de: "Publikationstext: Vergleich AS vs. Literatur-T2-Kriterien",
                    en: "Publication Text: Comparison AS vs. Literature T2 Criteria"
                },
                description: {
                    de: "Direkter statistischer Vergleich der diagnostischen Leistung des Avocado Signs mit etablierten T2-Kriteriensets aus der Literatur für die jeweils relevanten Kollektive.",
                    en: "Direct statistical comparison of the diagnostic performance of the Avocado Sign with established T2 criteria sets from the literature for the respective relevant cohorts."
                },
                tableTitle: {
                    de: "Tabelle 3: Vergleich der diagnostischen Leistung von Avocado Sign vs. Literatur-T2-Kriterien",
                    en: "Table 3: Comparison of Diagnostic Performance of Avocado Sign vs. Literature T2 Criteria"
                },
                subgroupTableTitle: {
                    de: "Tabelle 3.{SUB_INDEX}: Vergleich AS vs. {T2_SET_NAME} für {SUBGROUP_NAME} (N={SUBGROUP_N})",
                    en: "Table 3.{SUB_INDEX}: Comparison AS vs. {T2_SET_NAME} for {SUBGROUP_NAME} (N={SUBGROUP_N})"
                }
            },
            optimierteT2Kriterien: {
                cardTitle: {
                    de: "Publikationstext: Optimierte T2-Kriterien",
                    en: "Publication Text: Optimized T2 Criteria"
                },
                description: {
                    de: "Ergebnisse der Brute-Force-Optimierung zur Identifikation des T2-Kriteriensets, das eine gewählte Zielmetrik (z.B. Balanced Accuracy) maximiert, und dessen Vergleich mit dem Avocado Sign.",
                    en: "Results of the brute-force optimization to identify the T2 criteria set that maximizes a selected target metric (e.g., Balanced Accuracy), and its comparison with the Avocado Sign."
                },
                tableTitle: {
                    de: "Tabelle 4: Vergleich AS vs. optimierte T2-Kriterien (Balanced Accuracy)",
                    en: "Table 4: Comparison AS vs. Optimized T2 Criteria (Balanced Accuracy)"
                }
            },
            einzelmerkmaleT2: {
                cardTitle: {
                    de: "Publikationstext: Assoziation einzelner T2-Merkmale",
                    en: "Publication Text: Association of Individual T2 Features"
                },
                description: {
                    de: "Analyse der Assoziation einzelner morphologischer T2-Merkmale (Größe, Form, Kontur etc.) mit dem pathologischen N-Status.",
                    en: "Analysis of the association of individual morphological T2 features (size, shape, border, etc.) with pathological N-status."
                },
                tableTitle: {
                    de: "Tabelle 5: Assoziation einzelner T2-Merkmale mit dem N-Status (Gesamtkollektiv)",
                    en: "Table 5: Association of Individual T2 Features with N-Status (Overall Cohort)"
                }
            },
             subgruppenanalysen: {
                cardTitle: {
                    de: "Publikationstext: Subgruppenanalysen",
                    en: "Publication Text: Subgroup Analyses"
                },
                description: {
                    de: "Detaillierte Ergebnisse der diagnostischen Leistung des Avocado Signs und ausgewählter T2-Kriteriensets in den Subgruppen 'Direkt OP' und 'nRCT'.",
                    en: "Detailed results of the diagnostic performance of the Avocado Sign and selected T2 criteria sets in the 'Upfront Surgery' and 'nCRT' subgroups."
                },
                tableTitleDirektOP: {
                    de: "Tabelle X: Diagnostische Leistung in der Direkt-OP-Subgruppe",
                    en: "Table X: Diagnostic Performance in the Upfront Surgery Subgroup"
                },
                tableTitleNRCT: {
                    de: "Tabelle Y: Diagnostische Leistung in der nRCT-Subgruppe",
                    en: "Table Y: Diagnostic Performance in the nCRT Subgroup"
                }
            }
        }
    },
    statMetrics: {
        sens: { name: "Sensitivität", description: "Sensitivität ([METHODE] vs. N): Anteil der tatsächlich positiven Fälle (N+), die durch die Methode [METHODE] korrekt als positiv erkannt wurden.<br><i>Formel: RP / (RP + FN)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der tatsächlich N+ Fälle korrekt (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) im Kollektiv [KOLLEKTIV]."},
        spez: { name: "Spezifität", description: "Spezifität ([METHODE] vs. N): Anteil der tatsächlich negativen Fälle (N-), die durch die Methode [METHODE] korrekt als negativ erkannt wurden.<br><i>Formel: RN / (RN + FP)</i>", interpretation: "Die Methode [METHODE] erkannte <strong>[WERT]</strong> der tatsächlich N- Fälle korrekt (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) im Kollektiv [KOLLEKTIV]."},
        ppv: { name: "Pos. Prädiktiver Wert (PPV)", description: "PPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Fall mit einem positiven Testergebnis durch Methode [METHODE] tatsächlich krank (N+) ist.<br><i>Formel: RP / (RP + FP)</i>", interpretation: "Wenn die Methode [METHODE] ein positives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N+ Status bei <strong>[WERT]</strong> (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) im Kollektiv [KOLLEKTIV]."},
        npv: { name: "Neg. Prädiktiver Wert (NPV)", description: "NPV ([METHODE] vs. N): Wahrscheinlichkeit, dass ein Fall mit einem negativen Testergebnis durch Methode [METHODE] tatsächlich gesund (N-) ist.<br><i>Formel: RN / (RN + FN)</i>", interpretation: "Wenn die Methode [METHODE] ein negatives Ergebnis lieferte, lag die Wahrscheinlichkeit für einen tatsächlichen N- Status bei <strong>[WERT]</strong> (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) im Kollektiv [KOLLEKTIV]."},
        acc: { name: "Accuracy (Gesamtgenauigkeit)", description: "Accuracy ([METHODE] vs. N): Anteil aller Fälle, die durch die Methode [METHODE] korrekt klassifiziert wurden (sowohl positive als auch negative).<br><i>Formel: (RP + RN) / Gesamtanzahl</i>", interpretation: "Die Methode [METHODE] klassifizierte insgesamt <strong>[WERT]</strong> aller Fälle korrekt (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) im Kollektiv [KOLLEKTIV]."},
        balAcc: { name: "Balanced Accuracy", description: "Balanced Accuracy ([METHODE] vs. N): Der Mittelwert aus Sensitivität und Spezifität.<br><i>Formel: (Sensitivität + Spezifität) / 2</i>", interpretation: "Die Balanced Accuracy der Methode [METHODE], die Sensitivität und Spezifität gleich gewichtet, betrug <strong>[WERT]</strong> (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) im Kollektiv [KOLLEKTIV]."},
        f1: { name: "F1-Score", description: "F1-Score ([METHODE] vs. N): Das harmonische Mittel aus PPV (Precision) und Sensitivität (Recall).<br><i>Formel: 2 * (PPV * Sensitivität) / (PPV + Sensitivität)</i>", interpretation: "Der F1-Score für die Methode [METHODE], der Präzision und Sensitivität kombiniert, beträgt <strong>[WERT]</strong> (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) im Kollektiv [KOLLEKTIV]."},
        auc: { name: "Area Under Curve (AUC)", description: "AUC ([METHODE] vs. N): Fläche unter der Receiver Operating Characteristic (ROC)-Kurve. Repräsentiert die Fähigkeit der Methode [METHODE], zufällig ausgewählte N+ und N- Fälle korrekt zu rangreihen. 0.5 entspricht Zufall, 1.0 perfekter Trennung.<br><i>Für binäre Tests (wie AS oder eine feste T2-Regel) ist AUC = Balanced Accuracy.</i>", interpretation: "Die AUC von <strong>[WERT]</strong> (95% CI nach [METHOD_CI]: [LOWER] - [UPPER]) deutet auf eine <strong>[BEWERTUNG]</strong> generelle Trennschärfe der Methode [METHODE] zwischen N+ und N- Fällen im Kollektiv [KOLLEKTIV] hin."},
        mcnemar: { name: "McNemar-Test", description: "Prüft auf einen signifikanten Unterschied in den diskordanten Paaren (Fälle, bei denen AS und [T2_SHORT_NAME] unterschiedliche Ergebnisse liefern) bei gepaarten Daten.<br><i>Nullhypothese: Anzahl(AS+/[T2_SHORT_NAME]-) = Anzahl(AS-/[T2_SHORT_NAME]+)</i>", interpretation: "Der McNemar-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die Fehlklassifizierungsraten von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
        delong: { name: "DeLong-Test", description: "Vergleicht zwei AUC-Werte von ROC-Kurven, die auf denselben (gepaarten) Daten basieren, unter Berücksichtigung der Kovarianz.<br><i>Nullhypothese: AUC(AS) = AUC([T2_SHORT_NAME])</i>", interpretation: "Der DeLong-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies deutet darauf hin, dass sich die AUC-Werte (bzw. Balanced Accuracies) von AS und [T2_SHORT_NAME] im Kollektiv [KOLLEKTIV] [SIGNIFIKANZ_TEXT] unterscheiden."},
        phi: { name: "Phi-Koeffizient (φ)", description: "Maß für die Stärke und Richtung des Zusammenhangs zwischen zwei binären Variablen (z.B. Vorhandensein von Merkmal [MERKMAL] und N-Status). Wertebereich von -1 bis +1.", interpretation: "Der Phi-Koeffizient von <strong>[WERT]</strong> deutet auf einen <strong>[STAERKE]</strong> Zusammenhang zwischen dem Merkmal [MERKMAL] und dem N-Status im Kollektiv [KOLLEKTIV] hin."},
        rd: { name: "Risk Difference (RD)", description: "Absolute Differenz in der Wahrscheinlichkeit (Risiko) für N+ zwischen Fällen mit und ohne das Merkmal [MERKMAL].<br><i>Formel: P(N+|Merkmal+) - P(N+|Merkmal-)</i>", interpretation: "Das Risiko für N+ war um <strong>[WERT]%</strong> absolut [HOEHER_NIEDRIGER] bei Fällen mit dem Merkmal [MERKMAL] verglichen mit Fällen ohne dieses Merkmal (95% CI nach [METHOD_CI]: [LOWER]% - [UPPER]%) im Kollektiv [KOLLEKTIV]."},
        or: { name: "Odds Ratio (OR)", description: "Quotient der Odds für N+ bei Vorhandensein vs. Abwesenheit des Merkmals [MERKMAL].<br><i>Formel: Odds(N+|Merkmal+)/Odds(N+|Merkmal-)</i><br>OR > 1 bedeutet erhöhte Odds, OR < 1 verringerte Odds.", interpretation: "Die Chance (Odds) für einen N+ Status war bei Fällen mit dem Merkmal [MERKMAL] um den Faktor <strong>[WERT]</strong> [FAKTOR_TEXT] im Vergleich zu Fällen ohne dieses Merkmal (95% CI nach [METHOD_CI]: [LOWER] - [UPPER], p=[P_WERT], [SIGNIFIKANZ]) im Kollektiv [KOLLEKTIV]."},
        fisher: { name: "Fisher's Exact Test", description: "Exakter Test zur Prüfung auf einen signifikanten Zusammenhang zwischen zwei kategorialen Variablen (z.B. Merkmal [MERKMAL] vs. N-Status).", interpretation: "Der exakte Test nach Fisher ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>, was auf einen [SIGNIFIKANZ_TEXT] Zusammenhang zwischen dem Merkmal [MERKMAL] und dem N-Status im Kollektiv [KOLLEKTIV] hindeutet."},
        mannwhitney: { name: "Mann-Whitney-U-Test", description: "Nichtparametrischer Test zum Vergleich der zentralen Tendenz (Median) einer Variable (z.B. '[VARIABLE]') zwischen zwei unabhängigen Gruppen (z.B. N+ vs. N-).", interpretation: "Der Mann-Whitney-U-Test ergab einen p-Wert von <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Dies zeigt [SIGNIFIKANZ_TEXT] Unterschied in der Verteilung der Variable '[VARIABLE]' zwischen N+ und N- Fällen im Kollektiv [KOLLEKTIV]."},
        ci95: { name: "95% Konfidenzintervall (CI)", description: "Der Wertebereich, der den wahren (unbekannten) Wert der Population für die berechnete Metrik mit einer Wahrscheinlichkeit von 95% überdeckt.<br><i>Methode: [METHOD_CI]</i>", interpretation: "Basierend auf den Daten liegt der wahre Wert der Metrik mit 95%iger Sicherheit zwischen [LOWER] und [UPPER]."},
        konfusionsmatrix: { description: "Kreuztabelle, die die Klassifikationsergebnisse der Methode [METHODE] mit dem tatsächlichen N-Status vergleicht: Richtig Positive (RP), Falsch Positive (FP), Falsch Negative (FN), Richtig Negative (RN)." },
        accComp: { name: "Accuracy Vergleich", description: "Vergleicht die Accuracy der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels Fisher's Exact Test.", interpretation: "Der Unterschied in der Accuracy der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
        aucComp: { name: "AUC Vergleich", description: "Vergleicht die AUC der Methode [METHODE] zwischen zwei unabhängigen Kollektiven ([KOLLEKTIV1] vs. [KOLLEKTIV2]) mittels eines Z-Tests.", interpretation: "Der Unterschied in der AUC der Methode [METHODE] zwischen den Kollektiven [KOLLEKTIV1] und [KOLLEKTIV2] ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT])." },
        logisticRegressionFit: { name: "Modellanpassung (Log. Regression)", description: "Güte der Anpassung des logistischen Regressionsmodells an die Daten.", interpretation: "Das Modell zeigt eine [BEWERTUNG_FIT] Anpassung an die Daten."},
        logisticRegressionCoef: { name: "Koeffizient (Log. Regression)", description: "Geschätzter Koeffizient für den Prädiktor [PREDICTOR]. Gibt die Veränderung der Log-Odds für N+ pro Einheitsänderung des Prädiktors an.", interpretation: "Der Koeffizient für [PREDICTOR] beträgt <strong>[COEF_VALUE]</strong> (p=[P_WERT], [SIGNIFIKANZ]), was auf einen [SIGNIFIKANZ_TEXT] Einfluss auf die N+ Wahrscheinlichkeit hindeutet."},
        rocCurvePlot: { description: "Zeigt die ROC-Kurve für {Variable}. Die Diagonale repräsentiert zufällige Klassifikation (AUC=0.5). Eine Kurve näher an der oberen linken Ecke bedeutet bessere Leistung."},
        defaultP: { interpretation: `Der berechnete p-Wert beträgt <strong>[P_WERT] ([SIGNIFIKANZ])</strong>. Bei einem Signifikanzniveau von ${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL} ist das Ergebnis <strong>[SIGNIFIKANZ_TEXT]</strong>.` },
        signifikanzTexte: { SIGNIFIKANT: "statistisch signifikant", NICHT_SIGNIFIKANT: "statistisch nicht signifikant" },
        orFaktorTexte: { ERHOEHT: "erhöht", VERRINGERT: "verringert", UNVERAENDERT: "unverändert" },
        rdRichtungTexte: { HOEHER: "höher", NIEDRIGER: "niedriger", GLEICH: "gleich" },
        assoziationStaerkeTexte: { stark: "stark", moderat: "moderat", schwach: "schwach", sehr_schwach: "sehr schwach", nicht_bestimmbar: "nicht bestimmbar" }
    }
};

deepFreeze(UI_TEXTS);
deepFreeze(TOOLTIP_CONTENT);
