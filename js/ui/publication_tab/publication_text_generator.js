const publicationTextGenerator = (() => {
    const _texts = {
        de: {
            defaultNotFound: "(Text für diese Sektion (Sprache: de) noch nicht implementiert.)",
            tocTitle: "Inhaltsverzeichnis",
            sections: {
                einleitung: "Einleitung",
                methoden: "Methoden",
                ergebnisse: "Ergebnisse",
                diskussion: "Diskussion",
                referenzen: "Referenzen",
                defaultInfo: "Bitte wählen Sie eine Untersektion aus dem Navigationsbereich, um detaillierte Textvorschläge anzuzeigen."
            },
            textbausteine: {
                studienpopulation_basis: "Es wurde eine retrospektive Analyse von Patienten mit histologisch gesichertem Rektumkarzinom durchgeführt, die zwischen {STUDIEN_START_DATUM} und {STUDIEN_ENDE_DATUM} an unserem Zentrum behandelt wurden. Eingeschlossen wurden Patienten, die präoperativ eine leitliniengerechte MRT des Rektums erhielten. Ausschlusskriterien waren eine vorangegangene Rektumresektion, eine andere maligne Erkrankung im kleinen Becken oder eine unzureichende Bildqualität der MRT-Untersuchungen. Die Studie wurde von der zuständigen Ethikkommission genehmigt (Antragsnummer: {ETHIK_ANTRAGSNUMMER}), und aufgrund des retrospektiven Charakters der Studie wurde auf eine individuelle Patienteneinwilligung verzichtet.",
                patientenkollektiv_detail: "Das finale Studienkollektiv umfasste {N_GESAMT_PATIENTEN} Patienten (mittleres Alter {ALTER_MEAN_GESAMT} ± {ALTER_SD_GESAMT} Jahre; {N_MAENNLICH_GESAMT} männlich). Davon erhielten {N_NRCT_PATIENTEN} Patienten eine neoadjuvante Radiochemotherapie (nRCT) und {N_DIREKTOP_PATIENTEN} Patienten wurden primär operiert.",
                t2_kriterien_methodik: "Die T2-gewichteten MRT-Bilder wurden hinsichtlich etablierter morphologischer Lymphknoten-Malignitätskriterien analysiert. Diese umfassten Größe (Kurzachsendurchmesser), Form (rund vs. oval), Kontur (irregulär/spikuliert vs. glatt) und Binnensignalhomogenität (heterogen vs. homogen). Lymphknoten wurden als maligne gewertet, wenn sie die definierten Kriterienkombinationen erfüllten. Für Standard-T2-Kriterien (T2<sub>Std</sub>) wurden Definitionen aus der Literatur herangezogen [REF:Beets-Tan_2018], [REF:Koh_2008]. Zusätzlich wurden optimierte T2-Kriterien (T2<sub>Opt</sub>) mittels einer Brute-Force-Methode auf Basis der aktuellen Kohorte für die Maximierung der {BF_METRIC_NAME} datengetrieben ermittelt. Die optimierten Kriterien lauteten: {T2OPT_KRITERIEN_DEFINITION_GESAMT}.",
                statistische_methoden_basis: "Deskriptive Statistiken wurden als Mittelwert ± Standardabweichung für normalverteilte kontinuierliche Variablen und als Median mit Interquartilsabstand (IQR) für nicht-normalverteilte Variablen angegeben. Kategoriale Variablen wurden als absolute und relative Häufigigkeiten dargestellt. Die diagnostische Güte des Avocado Signs (AS), der Standard-T2-Kriterien (T2<sub>Std</sub>) und der optimierten T2-Kriterien (T2<sub>Opt</sub>) wurde anhand von Sensitivität, Spezifität, positivem prädiktiven Wert (PPV), negativem prädiktiven Wert (NPV) und Genauigkeit (Accuracy) evaluiert. Konfidenzintervalle (95%-CI) für diese Metriken wurden mittels der Clopper-Pearson-Methode oder, wo angegeben, mittels nicht-parametrischem Bootstrapping ({N_BOOTSTRAP_REPLIKATIONEN} Replikationen) berechnet. Die Receiver Operating Characteristic (ROC)-Kurvenanalyse wurde durchgeführt und die Fläche unter der Kurve (AUC) als Maß für die Gesamtdiskriminationsfähigkeit verwendet. Für den Vergleich der diagnostischen Genauigkeit von gepaarten Tests (AS vs. T2<sub>Std</sub>, AS vs. T2<sub>Opt</sub>) wurde der McNemar-Test verwendet. Unterschiede in den AUC-Werten wurden mit dem Test nach DeLong et al. analysiert. Ein p-Wert < {SIGNIFIKANZNIVEAU} wurde als statistisch signifikant angesehen. Alle statistischen Analysen wurden mit der Software R (Version {R_VERSION}, R Foundation for Statistical Computing, Wien, Österreich) und dem 'Avocado Sign Analyse Tool' (Version {APP_VERSION}, {APP_AUTOR}, {APP_STANDORT_INSTITUT}) durchgeführt."
            }
        },
        en: {
            defaultNotFound: "(Text for this section (Language: en) has not been implemented yet.)",
            tocTitle: "Table of Contents",
            sections: {
                einleitung: "Introduction",
                methoden: "Methods",
                ergebnisse: "Results",
                diskussion: "Discussion",
                referenzen: "References",
                defaultInfo: "Please select a subsection from the navigation panel to view detailed text suggestions."
            },
            textbausteine: {
                studienpopulation_basis: "A retrospective analysis of patients with histologically confirmed rectal cancer treated at our institution between {STUDIEN_START_DATUM} and {STUDIEN_ENDE_DATUM} was performed. Patients who underwent guideline-conformant preoperative rectal MRI were included. Exclusion criteria were previous rectal resection, other pelvic malignancies, or insufficient MRI image quality. The study was approved by the institutional review board (IRB approval number: {ETHIK_ANTRAGSNUMMER}), and the requirement for individual patient consent was waived due to the retrospective nature of the study.",
                patientenkollektiv_detail: "The final study cohort comprised {N_GESAMT_PATIENTEN} patients (mean age, {ALTER_MEAN_GESAMT} ± {ALTER_SD_GESAMT} years; {N_MAENNLICH_GESAMT} male). Of these, {N_NRCT_PATIENTEN} patients received neoadjuvant chemoradiotherapy (nCRT), and {N_DIREKTOP_PATIENTEN} patients underwent primary surgery.",
                t2_kriterien_methodik: "T2-weighted MRI scans were analyzed for established morphological lymph node malignancy criteria. These included size (short-axis diameter), shape (round vs. oval), border contour (irregular/spiculated vs. smooth), and internal signal homogeneity (heterogeneous vs. homogeneous). Lymph nodes were considered malignant if they met the defined criteria combinations. For standard T2 criteria (T2<sub>Std</sub>), definitions were adopted from published literature [REF:Beets-Tan_2018], [REF:Koh_2008]. Additionally, optimized T2 criteria (T2<sub>Opt</sub>) were determined data-driven by a brute-force method maximizing the {BF_METRIC_NAME} in the current cohort. The optimized criteria were: {T2OPT_KRITERIEN_DEFINITION_GESAMT_EN}.",
                statistische_methoden_basis: "Descriptive statistics were reported as mean ± standard deviation for normally distributed continuous variables and as median with interquartile range (IQR) for non-normally distributed variables. Categorical variables were presented as absolute and relative frequencies. The diagnostic performance of the Avocado Sign (AS), standard T2 criteria (T2<sub>Std</sub>), and optimized T2 criteria (T2<sub>Opt</sub>) was assessed using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), and accuracy. Confidence intervals (95% CI) for these metrics were calculated using the Clopper-Pearson method or, where specified, using non-parametric bootstrapping ({N_BOOTSTRAP_REPLIKATIONEN} replications). Receiver Operating Characteristic (ROC) curve analysis was performed, and the area under the curve (AUC) was used as a measure of overall discriminatory ability. The McNemar test was used to compare the diagnostic accuracy of paired tests (AS vs. T2<sub>Std</sub>, AS vs. T2<sub>Opt</sub>). Differences in AUC values were analyzed using the DeLong et al. test. A p-value < {SIGNIFIKANZNIVEAU} was considered statistically significant. All statistical analyses were performed using R software (version {R_VERSION}, R Foundation for Statistical Computing, Vienna, Austria) and the 'Avocado Sign Analysis Tool' (version {APP_VERSION}, {APP_AUTOR}, {APP_STANDORT_INSTITUT})."
            }
        }
    };

    const _getPlaceholderReplacements = (allStats, commonData, lang, options) => {
        const {
            references, appVersion, appName, significanceLevel, bootstrapReplications,
            appliedT2CriteriaGlobal, appliedT2LogicGlobal,
            nGesamt, nDirektOP, nNRCT, bruteForceMetricForPublication
        } = commonData;

        const pVal = (value) => formatPValue(value, significanceLevel, lang);
        const valCI = (metricObj, digits = 1, isPercent = true, na = '--') => {
            if (!metricObj || typeof metricObj.value !== 'number') return na;
            return `${formatNumber(metricObj.value, digits, na, isPercent)}${metricObj.ci ? ` (95% CI: ${formatNumber(metricObj.ci.lower, digits, na, isPercent)}–${formatNumber(metricObj.ci.upper, digits, na, isPercent)})` : ''}`;
        };
        const val = (value, digits = 1, isPercent = true, na = '--') => formatNumber(value, digits, na, isPercent);

        const getNestedValue = (obj, path, defaultValue = null) => {
            if (!path) return defaultValue;
            const keys = path.split('.');
            let current = obj;
            for (const key of keys) {
                if (current && typeof current === 'object' && key in current) {
                    current = current[key];
                } else {
                    return defaultValue;
                }
            }
            return current !== undefined ? current : defaultValue;
        };

        const statsGesamt = getNestedValue(allStats, 'Gesamt', {});
        const statsDirektOP = getNestedValue(allStats, 'direkt OP', {});
        const statsNRCT = getNestedValue(allStats, 'nRCT', {});
        
        const getBFDef = (statsKollektiv) => getNestedValue(statsKollektiv, `bruteforce_definition_metric_${bruteForceMetricForPublication.replace(/\s+/g, '_')}`) || getNestedValue(statsKollektiv, 'bruteforce_definition');


        const replacements = {
            STUDIEN_START_DATUM: APP_CONFIG.STUDY_PERIOD.START_DATE || 'YYYY-MM-DD',
            STUDIEN_ENDE_DATUM: APP_CONFIG.STUDY_PERIOD.END_DATE || 'YYYY-MM-DD',
            ETHIK_ANTRAGSNUMMER: APP_CONFIG.ETHICS_INFO.APPROVAL_NUMBER || 'N/A',
            R_VERSION: APP_CONFIG.SOFTWARE_VERSIONS.R_VERSION || 'N/A',
            APP_VERSION: appVersion || 'N/A',
            APP_NAME: appName || 'Avocado Sign Analysis Tool',
            APP_AUTOR: APP_CONFIG.SOFTWARE_VERSIONS.APP_AUTHOR || 'N/A',
            APP_STANDORT_INSTITUT: APP_CONFIG.SOFTWARE_VERSIONS.APP_INSTITUTION_LOCATION || 'N/A',
            SIGNIFIKANZNIVEAU: formatNumber(significanceLevel, 2) || '0.05',
            N_BOOTSTRAP_REPLIKATIONEN: formatNumber(bootstrapReplications,0) || '1000',

            N_GESAMT_PATIENTEN: val(nGesamt, 0, false),
            N_DIREKTOP_PATIENTEN: val(nDirektOP, 0, false),
            N_NRCT_PATIENTEN: val(nNRCT, 0, false),

            ALTER_MEAN_GESAMT: val(getNestedValue(statsGesamt, 'deskriptiv.alter.mean'), 1, false),
            ALTER_SD_GESAMT: val(getNestedValue(statsGesamt, 'deskriptiv.alter.sd'), 1, false),
            ALTER_MEDIAN_GESAMT: val(getNestedValue(statsGesamt, 'deskriptiv.alter.median'), 1, false),
            ALTER_IQR_GESAMT: `(${val(getNestedValue(statsGesamt, 'deskriptiv.alter.q1'), 1, false)}–${val(getNestedValue(statsGesamt, 'deskriptiv.alter.q3'), 1, false)})`,
            N_MAENNLICH_GESAMT: val(getNestedValue(statsGesamt, 'deskriptiv.geschlecht.m'), 0, false),
            N_WEIBLICH_GESAMT: val(getNestedValue(statsGesamt, 'deskriptiv.geschlecht.f'), 0, false),
            N_POSITIV_PATH_GESAMT: val(getNestedValue(statsGesamt, 'deskriptiv.nStatus.pos'), 0, false),
            N_NEGATIV_PATH_GESAMT: val(getNestedValue(statsGesamt, 'deskriptiv.nStatus.neg'), 0, false),
            
            BF_METRIC_NAME: bruteForceMetricForPublication || 'N/A',
            T2OPT_KRITERIEN_DEFINITION_GESAMT: studyT2CriteriaManager.formatCriteriaForDisplay(getNestedValue(getBFDef(statsGesamt), 'criteria'), getNestedValue(getBFDef(statsGesamt), 'logic'), lang === 'de') || 'N/A',
            T2OPT_KRITERIEN_DEFINITION_GESAMT_EN: studyT2CriteriaManager.formatCriteriaForDisplay(getNestedValue(getBFDef(statsGesamt), 'criteria'), getNestedValue(getBFDef(statsGesamt), 'logic'), 'en') || 'N/A',
            T2STD_KRITERIEN_DEFINITION_BEETS_TAN_2018: studyT2CriteriaManager.formatCriteriaForDisplay(getNestedValue(studyT2CriteriaManager.getStudyCriteriaSetById('beets_tan_2018_esgar'), 'criteria'), getNestedValue(studyT2CriteriaManager.getStudyCriteriaSetById('beets_tan_2018_esgar'), 'logic'), lang === 'de') || 'N/A',
            T2STD_KRITERIEN_DEFINITION_BEETS_TAN_2018_EN: studyT2CriteriaManager.formatCriteriaForDisplay(getNestedValue(studyT2CriteriaManager.getStudyCriteriaSetById('beets_tan_2018_esgar'), 'criteria'), getNestedValue(studyT2CriteriaManager.getStudyCriteriaSetById('beets_tan_2018_esgar'), 'logic'), 'en') || 'N/A',


            AS_SENS_GESAMT_VAL_CI: valCI(getNestedValue(statsGesamt, 'gueteAS.sens'),1),
            AS_SPEZ_GESAMT_VAL_CI: valCI(getNestedValue(statsGesamt, 'gueteAS.spez'),1),
            AS_PPV_GESAMT_VAL_CI: valCI(getNestedValue(statsGesamt, 'gueteAS.ppv'),1),
            AS_NPV_GESAMT_VAL_CI: valCI(getNestedValue(statsGesamt, 'gueteAS.npv'),1),
            AS_ACC_GESAMT_VAL_CI: valCI(getNestedValue(statsGesamt, 'gueteAS.acc'),1),
            AS_AUC_GESAMT_VAL_CI: valCI(getNestedValue(statsGesamt, 'gueteAS.auc'),3,false),
            
            AS_SENS_DIREKTOP_VAL_CI: valCI(getNestedValue(statsDirektOP, 'gueteAS.sens'),1),
            AS_SPEZ_DIREKTOP_VAL_CI: valCI(getNestedValue(statsDirektOP, 'gueteAS.spez'),1),
            AS_PPV_DIREKTOP_VAL_CI: valCI(getNestedValue(statsDirektOP, 'gueteAS.ppv'),1),
            AS_NPV_DIREKTOP_VAL_CI: valCI(getNestedValue(statsDirektOP, 'gueteAS.npv'),1),
            AS_ACC_DIREKTOP_VAL_CI: valCI(getNestedValue(statsDirektOP, 'gueteAS.acc'),1),
            AS_AUC_DIREKTOP_VAL_CI: valCI(getNestedValue(statsDirektOP, 'gueteAS.auc'),3,false),

            AS_SENS_NRCT_VAL_CI: valCI(getNestedValue(statsNRCT, 'gueteAS.sens'),1),
            AS_SPEZ_NRCT_VAL_CI: valCI(getNestedValue(statsNRCT, 'gueteAS.spez'),1),
            AS_PPV_NRCT_VAL_CI: valCI(getNestedValue(statsNRCT, 'gueteAS.ppv'),1),
            AS_NPV_NRCT_VAL_CI: valCI(getNestedValue(statsNRCT, 'gueteAS.npv'),1),
            AS_ACC_NRCT_VAL_CI: valCI(getNestedValue(statsNRCT, 'gueteAS.acc'),1),
            AS_AUC_NRCT_VAL_CI: valCI(getNestedValue(statsNRCT, 'gueteAS.auc'),3,false),
        };
        
        const t2StdStudyId = 'beets_tan_2018_esgar'; 
        const t2StdCriteriaSet = studyT2CriteriaManager.getStudyCriteriaSetById(t2StdStudyId);
        replacements.T2STD_NAME = t2StdCriteriaSet?.name || 'T2<sub>Std</sub>';
        
        ['Gesamt', 'direkt OP', 'nRCT'].forEach(koll => {
            const statsKoll = getNestedValue(allStats, koll, {});
            const kollKey = koll.replace(/\s+/g, '_').toUpperCase();
            
            replacements[`N_${kollKey}_PATIENTEN`] = val(getNestedValue(statsKoll, 'deskriptiv.anzahlPatienten'), 0, false);

            const gueteT2Std = getNestedValue(statsKoll, `gueteT2_literatur.${t2StdStudyId}`, {});
            replacements[`T2STD_SENS_${kollKey}_VAL_CI`] = valCI(gueteT2Std.sens, 1);
            replacements[`T2STD_SPEZ_${kollKey}_VAL_CI`] = valCI(gueteT2Std.spez, 1);
            replacements[`T2STD_PPV_${kollKey}_VAL_CI`] = valCI(gueteT2Std.ppv, 1);
            replacements[`T2STD_NPV_${kollKey}_VAL_CI`] = valCI(gueteT2Std.npv, 1);
            replacements[`T2STD_ACC_${kollKey}_VAL_CI`] = valCI(gueteT2Std.acc, 1);
            replacements[`T2STD_AUC_${kollKey}_VAL_CI`] = valCI(gueteT2Std.auc, 3, false);
            
            const gueteT2Opt = getNestedValue(statsKoll, `gueteT2_bruteforce_metric_${bruteForceMetricForPublication.replace(/\s+/g, '_')}`) || getNestedValue(statsKoll, 'gueteT2_bruteforce');
            replacements[`T2OPT_SENS_${kollKey}_VAL_CI_BF_METRIC`] = valCI(getNestedValue(gueteT2Opt,'sens'), 1);
            replacements[`T2OPT_SPEZ_${kollKey}_VAL_CI_BF_METRIC`] = valCI(getNestedValue(gueteT2Opt,'spez'), 1);
            replacements[`T2OPT_PPV_${kollKey}_VAL_CI_BF_METRIC`] = valCI(getNestedValue(gueteT2Opt,'ppv'), 1);
            replacements[`T2OPT_NPV_${kollKey}_VAL_CI_BF_METRIC`] = valCI(getNestedValue(gueteT2Opt,'npv'), 1);
            replacements[`T2OPT_ACC_${kollKey}_VAL_CI_BF_METRIC`] = valCI(getNestedValue(gueteT2Opt,'acc'), 1);
            replacements[`T2OPT_AUC_${kollKey}_VAL_CI_BF_METRIC`] = valCI(getNestedValue(gueteT2Opt,'auc'), 3, false);
            
            const vergleich_AS_vs_T2Std = getNestedValue(statsKoll, `vergleich_AS_vs_T2Std.${t2StdStudyId}`);
            replacements[`P_MCNEMAR_AS_VS_T2STD_${kollKey}`] = pVal(getNestedValue(vergleich_AS_vs_T2Std, 'mcnemar.pValue'));
            replacements[`P_DELONG_AS_VS_T2STD_${kollKey}`] = pVal(getNestedValue(vergleich_AS_vs_T2Std, 'delong.pValue'));

            const vergleich_AS_vs_T2Opt = getNestedValue(statsKoll, `vergleich_AS_vs_T2Opt_metric_${bruteForceMetricForPublication.replace(/\s+/g, '_')}`) || getNestedValue(statsKoll, 'vergleich_AS_vs_T2Opt');
            replacements[`P_MCNEMAR_AS_VS_T2OPT_${kollKey}`] = pVal(getNestedValue(vergleich_AS_vs_T2Opt, 'mcnemar.pValue'));
            replacements[`P_DELONG_AS_VS_T2OPT_${kollKey}`] = pVal(getNestedValue(vergleich_AS_vs_T2Opt, 'delong.pValue'));
        });

        if (references) {
            Object.keys(references).forEach(refKey => {
                const ref = references[refKey];
                const firstAuthor = ref.authors ? ref.authors.split(',')[0] : 'N/A';
                replacements[`REF:${refKey}`] = `${firstAuthor} et al. (${ref.year})`; 
                replacements[`REF_FULL:${refKey}`] = `${ref.authors} (${ref.year}). ${ref.title}. *${ref.journal}*. ${ref.volume ? `${ref.volume}(${ref.issue || ''})` : ''}${ref.pages ? `:${ref.pages}` : ''}. ${ref.doi ? `DOI: ${ref.doi}`: ''}`;
            });
        }

        return replacements;
    };

    const _replacePlaceholders = (text, replacements) => {
        if (!text) return '';
        let replacedText = text;
        for (const placeholder in replacements) {
            const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
            replacedText = replacedText.replace(regex, replacements[placeholder] !== null && replacements[placeholder] !== undefined ? String(replacements[placeholder]) : '');
        }
        return replacedText;
    };

    const _getSectionContent = (sectionId, lang, allStats, commonData, options) => {
        const textsForLang = _texts[lang] || _texts.de;
        const replacements = _getPlaceholderReplacements(allStats, commonData, lang, options);
        let content = '';

        switch (sectionId) {
            case 'einleitung_hintergrund':
                content = (lang === 'de') ? `
### Hintergrund
Das Staging von Lymphknotenmetastasen (N-Stadium) ist ein entscheidender prognostischer Faktor und Therapieindikator beim Rektumkarzinom. Die Magnetresonanztomographie (MRT) ist die primäre bildgebende Modalität für das lokoregionäre Staging. Aktuell basieren etablierte MRT-Kriterien für die Lymphknotenbeurteilung primär auf morphologischen Merkmalen in T2-gewichteten Sequenzen, wie Größe, Form und Binnenstruktur [REF:Beets-Tan_2018]. Diese Kriterien weisen jedoch eine limitierte diagnostische Genauigkeit auf, insbesondere nach neoadjuvanter Radiochemotherapie (nRCT) [REF:Koh_2008].

Das Avocado Sign (AS) ist ein neuartiges MRT-Zeichen, das auf T1-gewichteten, fettgesättigten Sequenzen nach Kontrastmittelgabe evaluiert wird und eine hohe Sensitivität und Spezifität für die Detektion von Lymphknotenmetastasen beim Rektumkarzinom in einer initialen Studie gezeigt hat [REF:Lurz_Schaefer_AvocadoSign_2025]. Das AS basiert auf der charakteristischen Morphologie von Lymphknoten, die einer halbierten Avocado ähneln, mit einem hyperintensen Zentrum (Kern) und einem umgebenden hypointensen Randsaum (Schale).

### Zielsetzung
Ziel dieser Studie war es, die diagnostische Performance des Avocado Signs (AS) für die Vorhersage des N-Status beim Rektumkarzinom im Vergleich zu etablierten Standard-T2-Kriterien (T2<sub>Std</sub>) sowie zu datengetrieben optimierten T2-Kriterien (T2<sub>Opt</sub>) in einem größeren Patientenkollektiv, einschließlich Patienten nach nRCT, zu evaluieren.
                ` : `
### Background
Lymph node metastasis (N-stage) is a critical prognostic factor and therapeutic indicator in rectal cancer. Magnetic resonance imaging (MRI) is the primary imaging modality for locoregional staging. Currently, established MRI criteria for lymph node assessment are primarily based on morphological features in T2-weighted sequences, such as size, shape, and internal structure [REF:Beets-Tan_2018]. However, these criteria have shown limited diagnostic accuracy, particularly after neoadjuvant chemoradiotherapy (nCRT) [REF:Koh_2008].

The Avocado Sign (AS) is a novel MRI sign evaluated on T1-weighted, fat-saturated post-contrast sequences, which demonstrated high sensitivity and specificity for detecting lymph node metastases in rectal cancer in an initial study [REF:Lurz_Schaefer_AvocadoSign_2025]. The AS is based on the characteristic morphology of lymph nodes resembling a halved avocado, with a hyperintense center (pit) and a surrounding hypointense rim (peel).

### Purpose
The purpose of this study was to evaluate the diagnostic performance of the Avocado Sign (AS) for predicting N-status in rectal cancer compared to established standard T2-weighted criteria (T2<sub>Std</sub>) and data-driven optimized T2-weighted criteria (T2<sub>Opt</sub>) in a larger patient cohort, including patients after nCRT.
                `;
                break;

            case 'methoden':
            case 'ergebnisse':
            case 'diskussion':
                content = textsForLang.sections.defaultInfo;
                break;
            
            case 'methoden_studienanlage':
                content = (lang === 'de') ? `
[TEXTBAUSTEIN:studienpopulation_basis]

Diese Studie wurde in Übereinstimmung mit den STARD-Richtlinien (Standards for Reporting of Diagnostic Accuracy Studies) durchgeführt.
                ` : `
[TEXTBAUSTEIN:studienpopulation_basis]

This study was conducted in accordance with the STARD (Standards for Reporting of Diagnostic Accuracy Studies) guidelines.
                `;
                break;
            case 'methoden_patientenkollektiv':
                content = (lang === 'de') ? `
[TEXTBAUSTEIN:patientenkollektiv_detail]

Die detaillierten Patientencharakteristika sind in Tabelle 1 ([GENERIERTE_TABELLE:patientenCharakteristikaTabelle]) dargestellt.
                ` : `
[TEXTBAUSTEIN:patientenkollektiv_detail]

Detailed patient characteristics are presented in Table 1 ([GENERIERTE_TABELLE:patientenCharakteristikaTabelle]).
                `;
                break;
            case 'methoden_mrt_protokoll':
                 content = (lang === 'de') ? `
Alle MRT-Untersuchungen wurden auf einem {MRT_GERAET_HERSTELLER_MODELL} ({MRT_FELDSTAERKE} Tesla) durchgeführt. Das Standardprotokoll für das Rektum-Staging umfasste hochauflösende T2-gewichtete Sequenzen in axialer, sagittaler und koronarer Orientierung zur Tumor- und Lymphknotenbeurteilung. Zusätzlich wurden axiale T1-gewichtete fettgesättigte Sequenzen vor und nach intravenöser Gabe von {KONTRASTMITTEL_NAME} ({KONTRASTMITTEL_DOSIERUNG} mmol/kg Körpergewicht) akquiriert, auf denen das Avocado Sign bewertet wurde. Die genauen Sequenzparameter sind in Anhang A aufgeführt.
                 ` : `
All MRI examinations were performed on a {MRT_GERAET_HERSTELLER_MODELL} ({MRT_FELDSTAERKE} Tesla) system. The standard rectal staging protocol included high-resolution T2-weighted sequences in axial, sagittal, and coronal orientations for tumor and lymph node assessment. Additionally, axial T1-weighted fat-saturated sequences were acquired before and after intravenous administration of {KONTRASTMITTEL_NAME} ({KONTRASTMITTEL_DOSIERUNG} mmol/kg body weight), on which the Avocado Sign was evaluated. Detailed sequence parameters are listed in Appendix A.
                 `;
                 break;
            case 'methoden_as_definition':
                content = (lang === 'de') ? `
Die Bewertung des Avocado Signs erfolgte auf den axialen T1-gewichteten fettgesättigten Sequenzen nach Kontrastmittelgabe durch zwei geblindete, erfahrene Radiologen (R1 mit {RADIOLOGE1_ERFAHRUNG} Jahren Erfahrung, R2 mit {RADIOLOGE2_ERFAHRUNG} Jahren Erfahrung in der abdominellen MRT). Ein Lymphknoten wurde als AS-positiv gewertet, wenn er die charakteristische Morphologie einer halbierten Avocado mit einem zentralen, punktförmigen oder ovalen hyperintensen "Kern" und einem umgebenden, scharf abgrenzbaren hypointensen "Randsaum" aufwies. Diskrepanzen wurden durch Konsensusentscheidung gelöst. Die Interobserver-Reliabilität wurde mittels Cohen's Kappa-Koeffizient bewertet.
                ` : `
The Avocado Sign was assessed on axial T1-weighted fat-saturated post-contrast sequences by two blinded, experienced radiologists (R1 with {RADIOLOGE1_ERFAHRUNG} years of experience, R2 with {RADIOLOGE2_ERFAHRUNG} years of experience in abdominal MRI). A lymph node was rated AS-positive if it exhibited the characteristic morphology of a halved avocado with a central, dot-like or oval hyperintense "pit" and a surrounding, sharply demarcated hypointense "peel". Discrepancies were resolved by consensus. Interobserver reliability was assessed using Cohen's kappa coefficient.
                `;
                break;
            case 'methoden_t2_definition':
                 content = (lang === 'de') ? `
[TEXTBAUSTEIN:t2_kriterien_methodik]

Die Standard-T2-Kriterien (T2<sub>Std</sub>) basierten auf den ESGAR-Konsensusrichtlinien [REF:Beets-Tan_2018], welche folgende Merkmale als suspekt einstufen: Kurzachse ≥9 mm; oder Kurzachse 5–8.9 mm und ≥2 der folgenden Kriterien: irreguläre Kontur, heterogenes Signal; oder Kurzachse <5 mm und alle 3 Kriterien (irreguläre Kontur, heterogenes Signal, runde Form). 
[GENERIERTE_TABELLE:literaturT2KriterienTabelle]
                 ` : `
[TEXTBAUSTEIN:t2_kriterien_methodik]

The standard T2 criteria (T2<sub>Std</sub>) were based on the ESGAR consensus guidelines [REF:Beets-Tan_2018], which classify nodes as suspicious if: short-axis diameter ≥9 mm; or short-axis diameter 5–8.9 mm and ≥2 of the following features: irregular border, heterogeneous signal; or short-axis diameter <5 mm and all 3 features (irregular border, heterogeneous signal, round shape).
[GENERIERTE_TABELLE:literaturT2KriterienTabelle]
                 `;
                 break;
            case 'methoden_referenzstandard':
                content = (lang === 'de') ? `
Der histopathologische Befund der resezierten Lymphknoten nach totaler mesorektaler Exzision (TME) diente als Referenzstandard. Alle Lymphknoten wurden gemäß Standardprotokollen aufgearbeitet und auf das Vorhandensein von Metastasen untersucht. Der N-Status eines Patienten wurde als positiv (N+) definiert, wenn mindestens ein Lymphknoten pathologisch als metastatisch befallen klassifiziert wurde.
                ` : `
The histopathological findings of the resected lymph nodes after total mesorectal excision (TME) served as the reference standard. All lymph nodes were processed according to standard protocols and examined for the presence of metastases. A patient's N-status was defined as positive (N+) if at least one lymph node was pathologically classified as metastatic.
                `;
                break;
            case 'methoden_statistische_analyse':
                content = (lang === 'de') ? `
[TEXTBAUSTEIN:statistische_methoden_basis]
                ` : `
[TEXTBAUSTEIN:statistische_methoden_basis]
                `;
                break;
            case 'ergebnisse_patientencharakteristika':
                content = (lang === 'de') ? `
Das Studienkollektiv bestand aus {N_GESAMT_PATIENTEN} Patienten. Die demographischen und klinischen Charakteristika sind in [GENERIERTE_TABELLE:patientenCharakteristikaTabelle] zusammengefasst. Das mittlere Alter betrug {ALTER_MEAN_GESAMT} ± {ALTER_SD_GESAMT} Jahre. {N_MAENNLICH_GESAMT} ({ANTEIL_MAENNLICH_GESAMT}%) Patienten waren männlich. Eine nRCT erhielten {N_NRCT_PATIENTEN} ({ANTEIL_NRCT_GESAMT}%) Patienten. Der pathologische N-Status war bei {N_POSITIV_PATH_GESAMT} ({ANTEIL_NPLUS_GESAMT}%) Patienten positiv.

[GENERIERTE_ABBILDUNG:alterVerteilungChartPub]
[GENERIERTE_ABBILDUNG:geschlechtVerteilungChartPub]
                ` : `
The study cohort consisted of {N_GESAMT_PATIENTEN} patients. Demographic and clinical characteristics are summarized in [GENERIERTE_TABELLE:patientenCharakteristikaTabelle]. The mean age was {ALTER_MEAN_GESAMT} ± {ALTER_SD_GESAMT} years. {N_MAENNLICH_GESAMT} ({ANTEIL_MAENNLICH_GESAMT}%) patients were male. nCRT was administered to {N_NRCT_PATIENTEN} ({ANTEIL_NRCT_GESAMT}%) patients. Pathological N-status was positive in {N_POSITIV_PATH_GESAMT} ({ANTEIL_NPLUS_GESAMT}%) patients.

[GENERIERTE_ABBILDUNG:alterVerteilungChartPub]
[GENERIERTE_ABBILDUNG:geschlechtVerteilungChartPub]
                `;
                break;
            case 'ergebnisse_as_performance':
                 content = (lang === 'de') ? `
Die diagnostische Güte des Avocado Signs (AS) für die Gesamtgruppe und die Subgruppen (Direkt-OP, nRCT) ist in [GENERIERTE_TABELLE:diagnostischeGueteASTabelle] dargestellt.
Für das Gesamtkollektiv (N={N_GESAMT_PATIENTEN}) zeigte das AS eine Sensitivität von {AS_SENS_GESAMT_VAL_CI}, eine Spezifität von {AS_SPEZ_GESAMT_VAL_CI} und eine AUC von {AS_AUC_GESAMT_VAL_CI}.
Im Direkt-OP Kollektiv (N={N_DIREKTOP_PATIENTEN}) betrug die Sensitivität {AS_SENS_DIREKTOP_VAL_CI}, die Spezifität {AS_SPEZ_DIREKTOP_VAL_CI} und die AUC {AS_AUC_DIREKTOP_VAL_CI}.
Für Patienten nach nRCT (N={N_NRCT_PATIENTEN}) ergab sich eine Sensitivität von {AS_SENS_NRCT_VAL_CI}, eine Spezifität von {AS_SPEZ_NRCT_VAL_CI} und eine AUC von {AS_AUC_NRCT_VAL_CI}.
Die Interobserver-Reliabilität für das AS war {AS_KAPPA_WERT} (Kappa = {AS_KAPPA_STATISTIK}).
                 ` : `
The diagnostic performance of the Avocado Sign (AS) for the overall cohort and subgroups (primary surgery, nCRT) is presented in [GENERIERTE_TABELLE:diagnostischeGueteASTabelle].
For the overall cohort (N={N_GESAMT_PATIENTEN}), AS showed a sensitivity of {AS_SENS_GESAMT_VAL_CI}, a specificity of {AS_SPEZ_GESAMT_VAL_CI}, and an AUC of {AS_AUC_GESAMT_VAL_CI}.
In the primary surgery cohort (N={N_DIREKTOP_PATIENTEN}), sensitivity was {AS_SENS_DIREKTOP_VAL_CI}, specificity was {AS_SPEZ_DIREKTOP_VAL_CI}, and AUC was {AS_AUC_DIREKTOP_VAL_CI}.
For patients after nCRT (N={N_NRCT_PATIENTEN}), sensitivity was {AS_SENS_NRCT_VAL_CI}, specificity was {AS_SPEZ_NRCT_VAL_CI}, and AUC was {AS_AUC_NRCT_VAL_CI}.
Interobserver reliability for AS was {AS_KAPPA_WERT_EN} (kappa = {AS_KAPPA_STATISTIK}).
                 `;
                 break;
            case 'ergebnisse_literatur_t2_performance':
                 content = (lang === 'de') ? `
Die Performance der Standard-T2-Kriterien (T2<sub>Std</sub>), basierend auf {T2STD_NAME}, ist in [GENERIERTE_TABELLE:diagnostischeGueteLiteraturT2Tabelle] für die entsprechenden Kollektive zusammengefasst.
Im Gesamtkollektiv erreichten die T2<sub>Std</sub>-Kriterien eine Sensitivität von {T2STD_SENS_GESAMT_VAL_CI}, Spezifität von {T2STD_SPEZ_GESAMT_VAL_CI} und AUC von {T2STD_AUC_GESAMT_VAL_CI}.
                 ` : `
The performance of standard T2 criteria (T2<sub>Std</sub>), based on {T2STD_NAME}, is summarized in [GENERIERTE_TABELLE:diagnostischeGueteLiteraturT2Tabelle] for the respective cohorts.
In the overall cohort, T2<sub>Std</sub> criteria achieved a sensitivity of {T2STD_SENS_GESAMT_VAL_CI}, specificity of {T2STD_SPEZ_GESAMT_VAL_CI}, and AUC of {T2STD_AUC_GESAMT_VAL_CI}.
                 `;
                 break;
            case 'ergebnisse_optimierte_t2_performance':
                content = (lang === 'de') ? `
Die mittels Brute-Force-Optimierung für die Metrik "{BF_METRIC_NAME}" abgeleiteten T2<sub>Opt</sub>-Kriterien ({T2OPT_KRITERIEN_DEFINITION_GESAMT}) zeigten folgende Performance-Werte (Details siehe [GENERIERTE_TABELLE:diagnostischeGueteOptimierteT2Tabelle]):
Im Gesamtkollektiv betrug die Sensitivität {T2OPT_SENS_GESAMT_VAL_CI_BF_METRIC}, die Spezifität {T2OPT_SPEZ_GESAMT_VAL_CI_BF_METRIC} und die AUC {T2OPT_AUC_GESAMT_VAL_CI_BF_METRIC}.
                ` : `
The T2<sub>Opt</sub> criteria ({T2OPT_KRITERIEN_DEFINITION_GESAMT_EN}), derived by brute-force optimization for the "{BF_METRIC_NAME}" metric, showed the following performance values (details in [GENERIERTE_TABELLE:diagnostischeGueteOptimierteT2Tabelle]):
In the overall cohort, sensitivity was {T2OPT_SENS_GESAMT_VAL_CI_BF_METRIC}, specificity was {T2OPT_SPEZ_GESAMT_VAL_CI_BF_METRIC}, and AUC was {T2OPT_AUC_GESAMT_VAL_CI_BF_METRIC}.
                `;
                break;
            case 'ergebnisse_vergleich_performance':
                content = (lang === 'de') ? `
Der statistische Vergleich der diagnostischen Güte zwischen AS, T2<sub>Std</sub> ({T2STD_NAME}) und T2<sub>Opt</sub> (optimiert für {BF_METRIC_NAME}) ist in [GENERIERTE_TABELLE:statistischerVergleichAST2Tabelle] und [GENERIERTE_ABBILDUNG:vergleichPerformanceChartGesamt] (Gesamtkollektiv), [GENERIERTE_ABBILDUNG:vergleichPerformanceChartDirektOP] (Direkt-OP) sowie [GENERIERTE_ABBILDUNG:vergleichPerformanceChartNRCT] (nRCT) dargestellt.

Im Gesamtkollektiv war die AUC des AS ({AS_AUC_GESAMT_VAL_CI}) signifikant höher als die der T2<sub>Std</sub>-Kriterien ({T2STD_AUC_GESAMT_VAL_CI}; p = {P_DELONG_AS_VS_T2STD_GESAMT}) und vergleichbar mit der der T2<sub>Opt</sub>-Kriterien ({T2OPT_AUC_GESAMT_VAL_CI_BF_METRIC}; p = {P_DELONG_AS_VS_T2OPT_GESAMT}).
Ähnliche Ergebnisse zeigten sich für die Accuracy (AS vs. T2<sub>Std</sub>: p = {P_MCNEMAR_AS_VS_T2STD_GESAMT}; AS vs. T2<sub>Opt</sub>: p = {P_MCNEMAR_AS_VS_T2OPT_GESAMT}).
                ` : `
The statistical comparison of diagnostic performance between AS, T2<sub>Std</sub> ({T2STD_NAME}), and T2<sub>Opt</sub> (optimized for {BF_METRIC_NAME}) is presented in [GENERIERTE_TABELLE:statistischerVergleichAST2Tabelle] and [GENERIERTE_ABBILDUNG:vergleichPerformanceChartGesamt] (overall cohort), [GENERIERTE_ABBILDUNG:vergleichPerformanceChartDirektOP] (primary surgery), and [GENERIERTE_ABBILDUNG:vergleichPerformanceChartNRCT] (nCRT).

In the overall cohort, the AUC of AS ({AS_AUC_GESAMT_VAL_CI}) was significantly higher than that of T2<sub>Std</sub> criteria ({T2STD_AUC_GESAMT_VAL_CI}; p = {P_DELONG_AS_VS_T2STD_GESAMT}) and comparable to that of T2<sub>Opt</sub> criteria ({T2OPT_AUC_GESAMT_VAL_CI_BF_METRIC}; p = {P_DELONG_AS_VS_T2OPT_GESAMT}).
Similar results were observed for accuracy (AS vs. T2<sub>Std</sub>: p = {P_MCNEMAR_AS_VS_T2STD_GESAMT}; AS vs. T2<sub>Opt</sub>: p = {P_MCNEMAR_AS_VS_T2OPT_GESAMT}).
                `;
                break;
            case 'diskussion_hauptergebnisse':
                content = (lang === 'de') ? `
Diese Studie evaluierte die diagnostische Performance des Avocado Signs im Vergleich zu Standard- und optimierten T2-Kriterien für das N-Staging beim Rektumkarzinom. Unsere Ergebnisse deuten darauf hin, dass das AS eine vielversprechende Alternative oder Ergänzung zu den herkömmlichen T2-Kriterien darstellen könnte, insbesondere im Hinblick auf {HAUPTERGEBNIS_ASPEKT_1_DE}. Das AS zeigte eine überlegene Performance gegenüber den T2<sub>Std</sub>-Kriterien und eine vergleichbare Performance zu den datengetriebenen T2<sub>Opt</sub>-Kriterien im Gesamtkollektiv und den Subgruppen.
                ` : `
This study evaluated the diagnostic performance of the Avocado Sign compared to standard and optimized T2 criteria for N-staging in rectal cancer. Our results suggest that AS may represent a promising alternative or adjunct to conventional T2 criteria, particularly regarding {HAUPTERGEBNIS_ASPEKT_1_EN}. AS demonstrated superior performance compared to T2<sub>Std</sub> criteria and comparable performance to data-driven T2<sub>Opt</sub> criteria in the overall cohort and subgroups.
                `;
                break;
             case 'diskussion_vergleich_literatur':
                content = (lang === 'de') ? `
Die hier beobachtete Performance des AS ist konsistent mit der initialen Beschreibung durch [REF:Lurz_Schaefer_AvocadoSign_2025]. Im Vergleich zu Studien, die sich ausschließlich auf T2-Kriterien stützen (z.B. [REF:Koh_2008], [REF:Brown_2003]), zeigt das AS {VERGLEICH_AS_ZU_LITERATUR_DE}. Die Performance der T2<sub>Std</sub>-Kriterien in unserer Kohorte ({T2STD_AUC_GESAMT_VAL_CI}) war vergleichbar mit den in der Literatur berichteten Werten, welche oft eine moderate Genauigkeit aufweisen, speziell nach nRCT.
                ` : `
The performance of AS observed herein is consistent with its initial description by [REF:Lurz_Schaefer_AvocadoSign_2025]. Compared to studies relying solely on T2 criteria (e.g., [REF:Koh_2008], [REF:Brown_2003]), AS showed {VERGLEICH_AS_ZU_LITERATUR_EN}. The performance of T2<sub>Std</sub> criteria in our cohort ({T2STD_AUC_GESAMT_VAL_CI}) was comparable to values reported in the literature, which often indicate moderate accuracy, especially after nCRT.
                `;
                break;
            case 'diskussion_limitationen':
                content = (lang === 'de') ? `
Unsere Studie weist einige Limitationen auf. Erstens handelt es sich um ein retrospektives Design von einem einzelnen Zentrum, was die Generalisierbarkeit der Ergebnisse einschränken könnte. Zweitens, obwohl die Radiologen geblindet waren, könnte ein gewisser Bias nicht vollständig ausgeschlossen werden. Drittens basierte die T2<sub>Opt</sub>-Definition auf demselben Datensatz, auf dem sie evaluiert wurde, was zu einer Überschätzung ihrer Performance führen kann; eine externe Validierung steht noch aus. Viertens ist die visuelle Beurteilung des AS subjektiv und erfordert eine gewisse Lernkurve. Zukünftige Studien sollten prospektiv und multizentrisch angelegt sein und die Entwicklung objektiverer Kriterien für das AS untersuchen.
                ` : `
Our study has several limitations. First, it is a retrospective single-center design, which might limit the generalizability of the findings. Second, although radiologists were blinded, some bias cannot be entirely excluded. Third, the T2<sub>Opt</sub> definition was based on the same dataset used for its evaluation, potentially leading to an overestimation of its performance; external validation is pending. Fourth, visual assessment of AS is subjective and requires a learning curve. Future studies should be prospective, multicenter, and investigate the development of more objective criteria for AS.
                `;
                break;
            case 'diskussion_schlussfolgerung':
                content = (lang === 'de') ? `
Zusammenfassend lässt sich sagen, dass das Avocado Sign eine vielversprechende diagnostische Genauigkeit für die Detektion von Lymphknotenmetastasen beim Rektumkarzinom aufweist, die der von optimierten T2-Kriterien ebenbürtig und der von Standard-T2-Kriterien überlegen ist. Das AS könnte somit einen wertvollen Beitrag zur Verbesserung des präoperativen N-Stagings leisten. Weitere Validierungsstudien sind jedoch erforderlich, um diese Ergebnisse zu bestätigen und das Potenzial des AS für den klinischen Einsatz vollständig zu bewerten.
                ` : `
In conclusion, the Avocado Sign demonstrates promising diagnostic accuracy for detecting lymph node metastases in rectal cancer, comparable to optimized T2 criteria and superior to standard T2 criteria. Thus, AS could make a valuable contribution to improving preoperative N-staging. However, further validation studies are needed to confirm these findings and fully assess the potential of AS for clinical use.
                `;
                break;
            case 'referenzen_liste':
                 content = (lang === 'de') ? `
Nachfolgend sind die in diesem Text zitierten Referenzen aufgeführt. Eine vollständige, dynamisch generierte Literaturliste befindet sich im entsprechenden Modul der Anwendung.
[GENERIERTE_TABELLE:referenzenTabelle]
                 ` : `
The references cited in this text are listed below. A complete, dynamically generated list of references can be found in the application's respective module.
[GENERIERTE_TABELLE:referenzenTabelle]
                 `;
                 break;
            default:
                const sectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId || (s.subSections && s.subSections.some(sub => sub.id === sectionId)));
                if (sectionConfig && sectionConfig.subSections && sectionConfig.subSections.length > 0 && sectionConfig.id === sectionId) {
                    content = textsForLang.sections.defaultInfo;
                } else {
                    content = textsForLang.defaultNotFound;
                }
                break;
        }
        return _replacePlaceholders(content, replacements);
    };
    
    const getTableOfContents = (lang, allStats) => {
        const textsForLang = _texts[lang] || _texts.de;
        const toc = [];
        PUBLICATION_CONFIG.sections.forEach(section => {
            const mainSection = {
                id: section.id,
                label: textsForLang.sections[section.labelKey] || section.labelKey,
                isMain: true,
                subSections: []
            };
            if (section.subSections) {
                section.subSections.forEach(sub => {
                    mainSection.subSections.push({
                        id: sub.id,
                        label: sub.labels[lang] || sub.labels.de,
                        isMain: false
                    });
                });
            }
            toc.push(mainSection);
        });
        return toc;
    };

    function getSectionText(sectionId, lang = 'de', allStats = {}, commonData = {}, options = {}) {
        return _getSectionContent(sectionId, lang, allStats, commonData, options);
    }

    return Object.freeze({
        getSectionText,
        getTableOfContents
    });
})();
