const publicationTextGenerator = (() => {

    function _formatSingleStat(statObj, lang = 'de', noCI = false, valueDigits = 1, ciDigits = null, isPercent = true, includeMethod = false) {
        if (!statObj || typeof statObj.value !== 'number' || isNaN(statObj.value)) return lang === 'de' ? 'N/A' : 'N/A';
        ciDigits = ciDigits === null ? valueDigits : ciDigits;
        const valStr = isPercent ? formatPercent(statObj.value, valueDigits) : formatNumber(statObj.value, valueDigits);
        if (noCI || !statObj.ci || typeof statObj.ci.lower !== 'number' || typeof statObj.ci.upper !== 'number' || isNaN(statObj.ci.lower) || isNaN(statObj.ci.upper)) {
            return valStr;
        }
        const ciStr = `${isPercent ? formatPercent(statObj.ci.lower, ciDigits, '--', false) : formatNumber(statObj.ci.lower, ciDigits, '--', true)} - ${isPercent ? formatPercent(statObj.ci.upper, ciDigits, '--', false) : formatNumber(statObj.ci.upper, ciDigits, '--', true)}`;
        let text = `${valStr} (95% CI ${ciStr}${isPercent ? '' : ''})`;
        if(includeMethod && statObj.method) text += ` [${statObj.method}]`;
        return text;
    }

    function _formatOR_RD(statObj, lang = 'de', type = 'OR') {
        if (!statObj || typeof statObj.value !== 'number' || isNaN(statObj.value) || !statObj.ci || typeof statObj.ci.lower !== 'number' || typeof statObj.ci.upper !== 'number' || isNaN(statObj.ci.lower) || isNaN(statObj.ci.upper)) {
            return lang === 'de' ? 'N/A' : 'N/A';
        }
        const digits = type === 'OR' ? 2 : (type === 'RD' ? 1 : 2);
        const valueStr = formatNumber(statObj.value * (type === 'RD' ? 100 : 1), digits);
        const lowerStr = formatNumber(statObj.ci.lower * (type === 'RD' ? 100 : 1), digits);
        const upperStr = formatNumber(statObj.ci.upper * (type === 'RD' ? 100 : 1), digits);
        let text = `${valueStr} (95% CI ${lowerStr} - ${upperStr})`;
        if (type === 'RD') text += '%';
        return text;
    }

    function _formatPValueForText(pValue, lang = 'de') {
        if (pValue === null || typeof pValue !== 'number' || isNaN(pValue)) return lang === 'de' ? 'p = N/A' : 'P = N/A';
        const pText = getPValueText(pValue, lang);
        return pText.startsWith('p <') || pText.startsWith('P <') ? pText : pText.replace('=', lang === 'de' ? '\u2248' : '\u2248'); // ca. statt exakt
    }

    function _getKollektivStats(allStats, kollektivId) {
        return allStats?.[kollektivId] || null;
    }

    function _getLiteratureSetName(setId, lang, commonData) {
        const ref = commonData.references?.[setId];
        return ref?.short || setId;
    }

    function _getBruteForceResultsForDisplay(allStats, kollektivId, bfMetricName) {
        const kollektivStats = _getKollektivStats(allStats, kollektivId);
        if (kollektivStats?.bruteforce_definition && kollektivStats?.bruteforce_definition?.metricName === bfMetricName) {
            return {
                definition: kollektivStats.bruteforce_definition,
                performance: kollektivStats.gueteT2_bruteforce
            };
        }
        return null;
    }

    function _getFormattedCriteriaString(criteria, logic, lang = 'de') {
        const formatFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => (lang === 'de' ? 'Kriterien nicht darstellbar' : 'Criteria not displayable');
        return formatFunc(criteria, logic, lang);
    }

    function _generateMethodenStudienanlageText(lang, allStats, commonData) {
        const refAS = commonData.references?.lurzSchaefer2025?.short || (lang === 'de' ? 'Lurz & Schäfer (2025)' : 'Lurz & Schäfer (2025)');
        const ethicsVote = commonData.references?.ethicsVote?.full || (lang === 'de' ? 'Ethikvotum Nr. 2023-101, Landesärztekammer Sachsen' : 'Ethics vote no. 2023-101, State Medical Association of Saxony');
        const appNameVersion = `${commonData.appName} v${commonData.appVersion}`;

        if (lang === 'de') {
            return `
### Studienanlage und Ethik
Diese Studie wurde als retrospektive Datenanalyse konzipiert und durchgeführt. Sie basiert auf den Daten, die ursprünglich für die Validierung des Avocado Signs (${refAS}) erhoben wurden.
Die zugrundeliegende Datenerhebung und -analyse wurde von der zuständigen Ethikkommission genehmigt (${ethicsVote}). Alle Patientenidentifikatoren wurden vor der Analyse pseudonymisiert. Die Notwendigkeit einer erneuten informierten Zustimmung für diese spezifische Sekundäranalyse wurde aufgrund des retrospektiven Designs und der vollständigen Anonymisierung der Daten als nicht erforderlich erachtet.

### Datenanalyse-Tool
Die in dieser Arbeit präsentierten statistischen Auswertungen und Vergleiche wurden unter Verwendung des spezialisierten Web-basierten Analyse-Tools "${appNameVersion}" durchgeführt. Dieses Tool wurde eigens für die detaillierte Analyse und den Vergleich diagnostischer Kriterien bei Rektumkarzinom-Lymphknoten entwickelt und ermöglicht reproduzierbare Auswertungen sowie die flexible Definition und Anwendung von T2-gewichteten MRT-Kriterien.
`;
        } else {
            return `
### Study Design and Ethics
This study was designed and conducted as a retrospective data analysis. It is based on data originally collected for the validation of the Avocado Sign (${refAS}).
The underlying data collection and analysis were approved by the responsible ethics committee (${ethicsVote}). All patient identifiers were pseudonymized prior to analysis. The need for re-obtaining informed consent for this specific secondary analysis was deemed unnecessary due to the retrospective design and complete anonymization of the data.

### Data Analysis Tool
The statistical evaluations and comparisons presented in this work were performed using the specialized web-based analysis tool "${appNameVersion}". This tool was specifically developed for the detailed analysis and comparison of diagnostic criteria in rectal cancer lymph nodes and allows for reproducible evaluations as well as flexible definition and application of T2-weighted MRI criteria.
`;
        }
    }

    function _generateMethodenPatientenkohorteText(lang, allStats, commonData) {
        const gesamtN = commonData.nGesamtGlobal || 0;
        const direktOP_N = commonData.nDirektOPGlobal || 0;
        const nRCT_N = commonData.nNRCTGlobal || 0;
        const studyPeriod = commonData.references?.lurzSchaefer2025StudyPeriod || (lang === 'de' ? 'Januar 2020 und November 2023' : 'January 2020 and November 2023');
        const refAS = commonData.references?.lurzSchaefer2025?.short || (lang === 'de' ? 'Lurz & Schäfer (2025)' : 'Lurz & Schäfer (2025)');

        if (lang === 'de') {
            return `
### Patientenkollektiv und Datengrundlage
Die Analyse basiert auf einem Kollektiv von **${gesamtN} Patienten** mit histologisch gesichertem Rektumkarzinom, die zwischen ${studyPeriod} in unserer Einrichtung behandelt wurden. Die detaillierten Ein- und Ausschlusskriterien für die ursprüngliche Kohorte sind in der Primärpublikation zum Avocado Sign (${refAS}) beschrieben.
Für die vorliegende Untersuchung wurden die Patienten in drei Hauptgruppen analysiert:
1.  **Gesamtkollektiv (N=${gesamtN}):** Umfasst alle Patienten der ursprünglichen Kohorte.
2.  **Direkt-OP-Kollektiv (N=${direktOP_N}):** Patienten, die primär operiert wurden, ohne neoadjuvante Radiochemotherapie (nRCT).
3.  **nRCT-Kollektiv (N=${nRCT_N}):** Patienten, die eine nRCT vor der Operation erhalten haben.

Die Zuordnung zu den Kollektiven erfolgte basierend auf der dokumentierten Behandlungsstrategie. Alle Patienten erhielten präoperativ eine standardisierte MRT-Untersuchung des Beckens. Der Referenzstandard für den Lymphknotenstatus war die histopathologische Aufarbeitung des Resektats.

{Table:Patientencharakteristika_Gesamt}
{Table:Patientencharakteristika_DirektOP}
{Table:Patientencharakteristika_nRCT}
`;
        } else {
            return `
### Patient Cohort and Data Basis
The analysis is based on a cohort of **${gesamtN} patients** with histologically confirmed rectal cancer who were treated at our institution between ${studyPeriod}. Detailed inclusion and exclusion criteria for the original cohort are described in the primary publication on the Avocado Sign (${refAS}).
For the present study, patients were analyzed in three main groups:
1.  **Overall Cohort (N=${gesamtN}):** Includes all patients from the original cohort.
2.  **Primary Surgery Cohort (N=${direktOP_N}):** Patients who underwent primary surgery without neoadjuvant chemoradiotherapy (nCRT).
3.  **nCRT Cohort (N=${nRCT_N}):** Patients who received nCRT prior to surgery.

Assignment to cohorts was based on the documented treatment strategy. All patients underwent standardized preoperative MRI of the pelvis. The reference standard for lymph node status was histopathological examination of the resected specimen.

{Table:Patientencharakteristika_Gesamt}
{Table:Patientencharakteristika_DirektOP}
{Table:Patientencharakteristika_nRCT}
`;
        }
    }

    function _generateMethodenMRTProtokollText(lang, allStats, commonData) {
        const mriSystem = commonData.references?.lurzSchaefer2025MRISystem || (lang==='de' ? '3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Deutschland)' : '3.0-T system (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Germany)');
        const kontrastmittel = commonData.references?.lurzSchaefer2025ContrastAgent || (lang==='de' ? 'Gadoteridol (ProHance; Bracco Imaging, Konstanz, Deutschland)' : 'gadoteridol (ProHance; Bracco Imaging, Konstanz, Germany)');
        const t2SliceThickness = commonData.references?.lurzSchaefer2025T2SliceThickness || (lang==='de' ? '2-3 mm' : '2-3 mm');
        const radiologistExp = commonData.references?.lurzSchaefer2025RadiologistExperience?.join(', ') || (lang==='de' ? '29, 7 und 19' : '29, 7, and 19');

        if (lang === 'de') {
            return `
### MRT-Protokoll und Bildakquisition
Alle MRT-Untersuchungen wurden an einem ${mriSystem} durchgeführt. Das Standardprotokoll umfasste hochauflösende T2-gewichtete Sequenzen (z.B. Turbo-Spin-Echo) in axialer, sagittaler und koronaler Orientierung zur mesorektalen Faszie mit einer Schichtdicke von ${t2SliceThickness}. Für die Bewertung des Avocado Signs wurden zusätzlich T1-gewichtete Sequenzen vor und nach intravenöser Gabe eines Gadolinium-basierten Kontrastmittels (${kontrastmittel}) akquiriert, typischerweise als dynamische, kontrastverstärkte Sequenz (DCE-MRT) oder als T1-gewichtete volumeninterpolierte Gradientenechosequenz (z.B. VIBE, LAVA).

### Bildauswertung
Die Bildauswertung erfolgte durch drei Radiologen mit ${radiologistExp} Jahren Erfahrung in der Befundung von Rektumkarzinom-MRT, geblindet gegenüber dem histopathologischen Ergebnis. Für jeden Patienten wurden alle sichtbaren mesorektalen Lymphknoten auf den T2-gewichteten Bildern und den T1-gewichteten kontrastverstärkten Bildern systematisch erfasst und bewertet.
`;
        } else {
            return `
### MRI Protocol and Image Acquisition
All MRI examinations were performed on a ${mriSystem}. The standard protocol included high-resolution T2-weighted sequences (e.g., Turbo Spin Echo) in axial, sagittal, and coronal orientations to the mesorectal fascia, with a slice thickness of ${t2SliceThickness}. For the assessment of the Avocado Sign, T1-weighted sequences were additionally acquired before and after intravenous administration of a gadolinium-based contrast agent (${kontrastmittel}), typically as a dynamic contrast-enhanced sequence (DCE-MRI) or as a T1-weighted volume-interpolated gradient echo sequence (e.g., VIBE, LAVA).

### Image Evaluation
Image evaluation was performed by three radiologists with ${radiologistExp} years of experience in interpreting rectal cancer MRI, blinded to the histopathological results. For each patient, all visible mesorectal lymph nodes on T2-weighted images and T1-weighted contrast-enhanced images were systematically recorded and evaluated.
`;
        }
    }

     function _generateMethodenASDefinitionText(lang, allStats, commonData) {
        const refAS = commonData.references?.lurzSchaefer2025?.short || (lang === 'de' ? 'Lurz & Schäfer (2025)' : 'Lurz & Schäfer (2025)');
        if (lang === 'de') {
            return `
### Definition und Bewertung des Avocado Signs (AS)
Das Avocado Sign wurde gemäß der ursprünglichen Definition (${refAS}) bewertet. Ein Lymphknoten wurde als AS-positiv gewertet, wenn er auf T1-gewichteten, kontrastmittelverstärkten MRT-Bildern eine periphere, ringförmige Kontrastmittelanreicherung mit einem zentral avaskulären (dunklen) Bereich aufwies, ähnlich dem Erscheinungsbild einer aufgeschnittenen Avocado. Die Morphologie und Signalintensität auf den T2-gewichteten Bildern wurde für die AS-Bewertung nicht primär herangezogen, diente aber der Identifikation und Lokalisation der Lymphknoten. Ein Patient wurde als AS-positiv klassifiziert, wenn mindestens ein Lymphknoten die Kriterien für ein positives Avocado Sign erfüllte.
`;
        } else {
            return `
### Definition and Assessment of the Avocado Sign (AS)
The Avocado Sign was assessed according to its original definition (${refAS}). A lymph node was considered AS-positive if it exhibited peripheral, ring-like contrast enhancement with a central avascular (dark) area on T1-weighted, contrast-enhanced MRI images, similar in appearance to a sliced avocado. Morphology and signal intensity on T2-weighted images were not primarily used for AS assessment but served for identification and localization of lymph nodes. A patient was classified as AS-positive if at least one lymph node met the criteria for a positive Avocado Sign.
`;
        }
    }

    function _generateMethodenT2DefinitionText(lang, allStats, commonData) {
        const appliedT2Criteria = commonData.appliedT2Criteria;
        const appliedT2Logic = commonData.appliedT2Logic;
        const formattedAppliedCriteria = _getFormattedCriteriaString(appliedT2Criteria, appliedT2Logic, lang);
        const bfMetric = commonData.bruteForceMetricForPublication;

        let litSetsTextDe = [];
        let litSetsTextEn = [];

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(setConf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(setConf.id);
            if (studySet) {
                const ref = commonData.references?.[setConf.citationKey]?.short || setConf.id;
                const criteriaStr = _getFormattedCriteriaString(studySet.criteria, studySet.logic, lang);
                litSetsTextDe.push(`- **${studySet.name} (${ref}):** ${criteriaStr}`);
                litSetsTextEn.push(`- **${studySet.name} (${ref}):** ${criteriaStr}`);
            }
        });

        const bfKollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        let bfKriterienTextDe = bfKollektive.map(kId => {
            const bfRes = _getBruteForceResultsForDisplay(allStats, kId, bfMetric);
            if (bfRes) {
                return `- Für Kollektiv **${getKollektivDisplayName(kId)}** (optimiert auf ${bfMetric}): ${_getFormattedCriteriaString(bfRes.definition.criteria, bfRes.definition.logic, 'de')}`;
            } return null;
        }).filter(Boolean).join('\n');
         let bfKriterienTextEn = bfKollektive.map(kId => {
            const bfRes = _getBruteForceResultsForDisplay(allStats, kId, bfMetric);
            if (bfRes) {
                return `- For cohort **${getKollektivDisplayName(kId)}** (optimized for ${bfMetric}): ${_getFormattedCriteriaString(bfRes.definition.criteria, bfRes.definition.logic, 'en')}`;
            } return null;
        }).filter(Boolean).join('\n');


        if (lang === 'de') {
            return `
### Definition und Bewertung von T2-Kriterien
Parallel zur AS-Bewertung wurden etablierte morphologische Kriterien auf T2-gewichteten MRT-Bildern evaluiert. Für den Vergleich wurden verschiedene Sätze von T2-Kriterien herangezogen:

1.  **Literatur-basierte Kriteriensets:**
    Folgende in der Literatur beschriebene und in der klinischen Praxis relevante Kriteriensets wurden implementiert und analysiert:
    ${litSetsTextDe.join('\n    ')}

2.  **Datengetrieben optimierte T2-Kriteriensets (Brute-Force):**
    Zusätzlich wurden mittels einer Brute-Force-Methode T2-Kriteriensets identifiziert, die spezifische diagnostische Metriken (z.B. Balanced Accuracy, Accuracy, F1-Score) für die unterschiedlichen Patientenkollektive maximieren. Für die primären Ergebnisdarstellungen wurde die Optimierung auf **${bfMetric}** fokussiert. Die resultierenden besten Kriterienkombinationen für die jeweiligen Kollektive waren:
    ${bfKriterienTextDe || '    - Keine Brute-Force-Ergebnisse für die ausgewählte Metrik verfügbar oder berechnet.'}

Ein Patient wurde als T2-positiv klassifiziert, wenn mindestens ein Lymphknoten die Bedingungen des jeweils aktiven T2-Kriteriensets erfüllte.
`;
        } else {
            return `
### Definition and Assessment of T2 Criteria
In parallel with the AS assessment, established morphological criteria on T2-weighted MRI images were evaluated. For comparison, various sets of T2 criteria were used:

1.  **Literature-based Criteria Sets:**
    The following criteria sets described in the literature and relevant in clinical practice were implemented and analyzed:
    ${litSetsTextEn.join('\n    ')}

2.  **Data-driven Optimized T2 Criteria Sets (Brute-Force):**
    Additionally, T2 criteria sets that maximize specific diagnostic metrics (e.g., Balanced Accuracy, Accuracy, F1-Score) for the different patient cohorts were identified using a brute-force method. For the primary results presentation, optimization was focused on **${bfMetric}**. The resulting best criteria combinations for the respective cohorts were:
    ${bfKriterienTextEn || '    - No brute-force results available or calculated for the selected metric.'}

A patient was classified as T2-positive if at least one lymph node met the conditions of the respective active T2 criteria set.
`;
        }
    }

    function _generateMethodenReferenzstandardText(lang, allStats, commonData) {
        if (lang === 'de') {
            return `
### Referenzstandard
Der Referenzstandard für die Bestimmung des Lymphknotenstatus (N-Status) war die histopathologische Untersuchung des Operationspräparats. Alle mesorektalen Lymphknoten wurden von erfahrenen Pathologen gemäß den aktuellen Leitlinien aufgearbeitet und klassifiziert. Ein Patient wurde als N-positiv (N+) gewertet, wenn mindestens ein Lymphknoten histologisch Metastasen aufwies. Andernfalls wurde der Patient als N-negativ (N-) klassifiziert.
`;
        } else {
            return `
### Reference Standard
The reference standard for determining lymph node status (N-status) was the histopathological examination of the surgical specimen. All mesorectal lymph nodes were processed and classified by experienced pathologists according to current guidelines. A patient was considered N-positive (N+) if at least one lymph node showed histological metastases. Otherwise, the patient was classified as N-negative (N-).
`;
        }
    }

    function _generateMethodenStatistischeAnalyseText(lang, allStats, commonData) {
        const sigLevel = formatNumber(commonData.significanceLevel * 100, 0) + '%';
        const ciMethodProp = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION;
        const ciMethodEffect = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE;
        const bootstrapN = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS;

        if (lang === 'de') {
            return `
### Statistische Analyse
Die statistische Auswertung erfolgte mit dem Ziel, die diagnostische Güte des Avocado Signs im Vergleich zu verschiedenen T2-Kriteriensets zu bewerten.
Deskriptive Statistiken wurden verwendet, um die Patientencharakteristika zusammenzufassen. Kategoriale Variablen werden als absolute und relative Häufigkeiten dargestellt, kontinuierliche Variablen als Median mit Bereich (Minimum-Maximum) sowie als Mittelwert ± Standardabweichung (SD).

Für jede diagnostische Methode (Avocado Sign, spezifische T2-Kriteriensets) wurden Sensitivität, Spezifität, positiver prädiktiver Wert (PPV), negativer prädiktiver Wert (NPV), Accuracy (Gesamtgenauigkeit), Balanced Accuracy ((Sensitivität + Spezifität) / 2), F1-Score und die Fläche unter der Receiver Operating Characteristic Kurve (AUC) berechnet. Für diese Metriken wurden 95%-Konfidenzintervalle (95%-CI) bestimmt; für Proportionen (Sens, Spez, PPV, NPV, Acc) mittels der ${ciMethodProp}-Methode und für AUC/Balanced Accuracy und F1-Score mittels ${ciMethodEffect} mit ${bootstrapN} Replikationen. Zusätzlich wurden der positive Likelihood Ratio (LR+) und der negative Likelihood Ratio (LR-) mit 95%-CIs nach der Log-Methode (mit Haldane-Anscombe Korrektur) berechnet.

Der statistische Vergleich der diagnostischen Genauigkeit (Accuracy) zwischen dem Avocado Sign und den T2-Kriteriensets innerhalb desselben Patientenkollektivs erfolgte mittels des McNemar-Tests. Unterschiede in der AUC wurden mittels des DeLong-Tests für gepaarte ROC-Kurven analysiert.
Für den Vergleich von Metriken (Accuracy, AUC, Sensitivität, Spezifität) zwischen unabhängigen Kollektiven (z.B. Direkt-OP vs. nRCT) wurden der exakte Test nach Fisher für Proportionen oder ein Z-Test für AUC-Unterschiede verwendet.

Die Assoziation einzelner bildgebender Merkmale (AS-Status, Erfüllung spezifischer T2-Kriterien) mit dem pathologischen N-Status wurde mittels Odds Ratios (OR) und Risk Differences (RD) mit 95%-CIs sowie dem Phi-Koeffizienten (φ) quantifiziert. Die Signifikanz dieser Assoziationen wurde mit dem exakten Test nach Fisher geprüft. Unterschiede in der Lymphknotengröße zwischen N+ und N- Patienten wurden mit dem Mann-Whitney-U-Test untersucht.

Ein p-Wert < ${commonData.significanceLevel} wurde als statistisch signifikant betrachtet. Alle Analysen wurden mit der oben genannten Software (${commonData.appName} v${commonData.appVersion}) durchgeführt.
`;
        } else {
            return `
### Statistical Analysis
Statistical analysis was performed to evaluate the diagnostic performance of the Avocado Sign compared to various T2 criteria sets.
Descriptive statistics were used to summarize patient characteristics. Categorical variables are presented as absolute and relative frequencies; continuous variables as median with range (minimum-maximum) and as mean ± standard deviation (SD).

For each diagnostic method (Avocado Sign, specific T2 criteria sets), sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy, balanced accuracy ((sensitivity + specificity) / 2), F1-score, and the area under the receiver operating characteristic curve (AUC) were calculated. For these metrics, 95% confidence intervals (95% CI) were determined; for proportions (Sens, Spec, PPV, NPV, Acc) using the ${ciMethodProp} method, and for AUC/Balanced Accuracy and F1-score using ${ciMethodEffect} with ${bootstrapN} replications. Additionally, the positive likelihood ratio (LR+) and negative likelihood ratio (LR-) with 95% CIs were calculated using the log method (with Haldane-Anscombe correction).

The statistical comparison of diagnostic accuracy between the Avocado Sign and T2 criteria sets within the same patient cohort was performed using McNemar's test. Differences in AUC were analyzed using DeLong's test for paired ROC curves.
For comparing metrics (accuracy, AUC, sensitivity, specificity) between independent cohorts (e.g., primary surgery vs. nCRT), Fisher's exact test for proportions or a Z-test for AUC differences were used.

The association of individual imaging features (AS status, fulfillment of specific T2 criteria) with pathological N-status was quantified using odds ratios (OR) and risk differences (RD) with 95% CIs, and the phi coefficient (φ). The significance of these associations was tested using Fisher's exact test. Differences in lymph node size between N+ and N- patients were examined using the Mann-Whitney U test.

A P-value < ${commonData.significanceLevel} was considered statistically significant. All analyses were performed using the aforementioned software (${commonData.appName} v${commonData.appVersion}).
`;
        }
    }

    function _generateErgebnissePatientencharakteristikaText(lang, allStats, commonData) {
        const gesamtN = commonData.nGesamtGlobal || 0;
        const direktOP_N = commonData.nDirektOPGlobal || 0;
        const nRCT_N = commonData.nNRCTGlobal || 0;
        const statsGesamt = _getKollektivStats(allStats, 'Gesamt')?.deskriptiv;

        if (lang === 'de') {
            return `
### Patientencharakteristika
Insgesamt wurden ${gesamtN} Patienten in die Analyse eingeschlossen. Davon wurden ${direktOP_N} Patienten primär operiert (Direkt-OP-Gruppe) und ${nRCT_N} Patienten erhielten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe) vor der Operation.
Die detaillierten demographischen und klinischen Charakteristika für das Gesamtkollektiv sowie für die Subgruppen sind in Tabelle {Table:Patientencharakteristika_Gesamt}, Tabelle {Table:Patientencharakteristika_DirektOP} und Tabelle {Table:Patientencharakteristika_nRCT} zusammengefasst.
Im Gesamtkollektiv betrug das mediane Alter ${formatNumber(statsGesamt?.alter?.median, 1)} Jahre (Bereich: ${formatNumber(statsGesamt?.alter?.min, 0)}-${formatNumber(statsGesamt?.alter?.max, 0)} Jahre). Es gab ${statsGesamt?.geschlecht?.m || 0} (${formatPercent((statsGesamt?.geschlecht?.m || 0) / gesamtN, 1)}) männliche und ${statsGesamt?.geschlecht?.f || 0} (${formatPercent((statsGesamt?.geschlecht?.f || 0) / gesamtN, 1)}) weibliche Patienten.
Der pathologische N-Status war bei ${statsGesamt?.nStatus?.plus || 0} (${formatPercent((statsGesamt?.nStatus?.plus || 0) / gesamtN, 1)}) Patienten positiv (N+) und bei ${statsGesamt?.nStatus?.minus || 0} (${formatPercent((statsGesamt?.nStatus?.minus || 0) / gesamtN, 1)}) Patienten negativ (N-).

{Figure:Altersverteilung_Gesamt}
{Figure:Geschlechterverteilung_Gesamt}
`;
        } else {
            return `
### Patient Characteristics
A total of ${gesamtN} patients were included in the analysis. Of these, ${direktOP_N} patients underwent primary surgery (Primary Surgery group) and ${nRCT_N} patients received neoadjuvant chemoradiotherapy (nCRT group) before surgery.
Detailed demographic and clinical characteristics for the overall cohort and for the subgroups are summarized in Table {Table:Patientencharakteristika_Gesamt}, Table {Table:Patientencharakteristika_DirektOP}, and Table {Table:Patientencharakteristika_nRCT}.
In the overall cohort, the median age was ${formatNumber(statsGesamt?.alter?.median, 1)} years (range: ${formatNumber(statsGesamt?.alter?.min, 0)}-${formatNumber(statsGesamt?.alter?.max, 0)} years). There were ${statsGesamt?.geschlecht?.m || 0} (${formatPercent((statsGesamt?.geschlecht?.m || 0) / gesamtN, 1)}) male and ${statsGesamt?.geschlecht?.f || 0} (${formatPercent((statsGesamt?.geschlecht?.f || 0) / gesamtN, 1)}) female patients.
Pathological N-status was positive (N+) in ${statsGesamt?.nStatus?.plus || 0} (${formatPercent((statsGesamt?.nStatus?.plus || 0) / gesamtN, 1)}) patients and negative (N-) in ${statsGesamt?.nStatus?.minus || 0} (${formatPercent((statsGesamt?.nStatus?.minus || 0) / gesamtN, 1)}) patients.

{Figure:Altersverteilung_Gesamt}
{Figure:Geschlechterverteilung_Gesamt}
`;
        }
    }

    function _generateErgebnisseASPerformanceText(lang, allStats, commonData) {
        const perfGesamt = _getKollektivStats(allStats, 'Gesamt')?.gueteAS;
        const perfDirektOP = _getKollektivStats(allStats, 'direkt OP')?.gueteAS;
        const perfNRCT = _getKollektivStats(allStats, 'nRCT')?.gueteAS;

        if (lang === 'de') {
            return `
### Diagnostische Güte des Avocado Signs (AS)
Die diagnostische Performance des Avocado Signs für die Vorhersage des N-Status ist in Tabelle {Table:Performance_AS_AlleKollektive} für die verschiedenen Kollektive detailliert dargestellt.

Im **Gesamtkollektiv** zeigte das AS eine Sensitivität von ${_formatSingleStat(perfGesamt?.sens, lang)}, eine Spezifität von ${_formatSingleStat(perfGesamt?.spez, lang)}, einen PPV von ${_formatSingleStat(perfGesamt?.ppv, lang)}, einen NPV von ${_formatSingleStat(perfGesamt?.npv, lang)}, eine Accuracy von ${_formatSingleStat(perfGesamt?.acc, lang)} und eine AUC von ${_formatSingleStat(perfGesamt?.auc, lang, false, 3, 3, false)}. Der positive Likelihood Ratio (LR+) betrug ${_formatSingleStat(perfGesamt?.lrPlus, lang, false, 2, 2, false)} und der negative Likelihood Ratio (LR-) ${_formatSingleStat(perfGesamt?.lrMinus, lang, false, 2, 2, false)}.

Für das **Direkt-OP-Kollektiv** waren die entsprechenden Werte: Sensitivität ${_formatSingleStat(perfDirektOP?.sens, lang)}, Spezifität ${_formatSingleStat(perfDirektOP?.spez, lang)}, PPV ${_formatSingleStat(perfDirektOP?.ppv, lang)}, NPV ${_formatSingleStat(perfDirektOP?.npv, lang)}, Accuracy ${_formatSingleStat(perfDirektOP?.acc, lang)} und AUC ${_formatSingleStat(perfDirektOP?.auc, lang, false, 3, 3, false)}. (LR+ ${_formatSingleStat(perfDirektOP?.lrPlus, lang, false, 2, 2, false)}, LR- ${_formatSingleStat(perfDirektOP?.lrMinus, lang, false, 2, 2, false)})

Im **nRCT-Kollektiv** erreichte das AS eine Sensitivität von ${_formatSingleStat(perfNRCT?.sens, lang)}, eine Spezifität von ${_formatSingleStat(perfNRCT?.spez, lang)}, einen PPV von ${_formatSingleStat(perfNRCT?.ppv, lang)}, einen NPV von ${_formatSingleStat(perfNRCT?.npv, lang)}, eine Accuracy von ${_formatSingleStat(perfNRCT?.acc, lang)} und eine AUC von ${_formatSingleStat(perfNRCT?.auc, lang, false, 3, 3, false)}. (LR+ ${_formatSingleStat(perfNRCT?.lrPlus, lang, false, 2, 2, false)}, LR- ${_formatSingleStat(perfNRCT?.lrMinus, lang, false, 2, 2, false)})

{Figure:ROC_AS_Gesamt}
{Figure:ROC_AS_DirektOP}
{Figure:ROC_AS_nRCT}
`;
        } else {
            return `
### Diagnostic Performance of the Avocado Sign (AS)
The diagnostic performance of the Avocado Sign for predicting N-status is detailed in Table {Table:Performance_AS_AlleKollektive} for the different cohorts.

In the **Overall Cohort**, AS showed a sensitivity of ${_formatSingleStat(perfGesamt?.sens, lang)}, a specificity of ${_formatSingleStat(perfGesamt?.spez, lang)}, a PPV of ${_formatSingleStat(perfGesamt?.ppv, lang)}, an NPV of ${_formatSingleStat(perfGesamt?.npv, lang)}, an accuracy of ${_formatSingleStat(perfGesamt?.acc, lang)}, and an AUC of ${_formatSingleStat(perfGesamt?.auc, lang, false, 3, 3, false)}. The positive likelihood ratio (LR+) was ${_formatSingleStat(perfGesamt?.lrPlus, lang, false, 2, 2, false)} and the negative likelihood ratio (LR-) was ${_formatSingleStat(perfGesamt?.lrMinus, lang, false, 2, 2, false)}.

For the **Primary Surgery Cohort**, the corresponding values were: sensitivity ${_formatSingleStat(perfDirektOP?.sens, lang)}, specificity ${_formatSingleStat(perfDirektOP?.spez, lang)}, PPV ${_formatSingleStat(perfDirektOP?.ppv, lang)}, NPV ${_formatSingleStat(perfDirektOP?.npv, lang)}, accuracy ${_formatSingleStat(perfDirektOP?.acc, lang)}, and AUC ${_formatSingleStat(perfDirektOP?.auc, lang, false, 3, 3, false)}. (LR+ ${_formatSingleStat(perfDirektOP?.lrPlus, lang, false, 2, 2, false)}, LR- ${_formatSingleStat(perfDirektOP?.lrMinus, lang, false, 2, 2, false)})

In the **nCRT Cohort**, AS achieved a sensitivity of ${_formatSingleStat(perfNRCT?.sens, lang)}, a specificity of ${_formatSingleStat(perfNRCT?.spez, lang)}, a PPV of ${_formatSingleStat(perfNRCT?.ppv, lang)}, an NPV of ${_formatSingleStat(perfNRCT?.npv, lang)}, an accuracy of ${_formatSingleStat(perfNRCT?.acc, lang)}, and an AUC of ${_formatSingleStat(perfNRCT?.auc, lang, false, 3, 3, false)}. (LR+ ${_formatSingleStat(perfNRCT?.lrPlus, lang, false, 2, 2, false)}, LR- ${_formatSingleStat(perfNRCT?.lrMinus, lang, false, 2, 2, false)})

{Figure:ROC_AS_Gesamt}
{Figure:ROC_AS_DirektOP}
{Figure:ROC_AS_nRCT}
`;
        }
    }

    function _generateErgebnisseLiteraturT2PerformanceText(lang, allStats, commonData) {
        let textDe = '### Diagnostische Güte Literatur-basierter T2-Kriteriensets\n';
        let textEn = '### Diagnostic Performance of Literature-based T2 Criteria Sets\n';
        let tablePlaceholderText = '';

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(setConf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(setConf.id);
            if (studySet) {
                const refShort = commonData.references?.[setConf.citationKey]?.short || setConf.id;
                const setName = studySet.name || setConf.id;
                const evalKollektivId = studySet.applicableKollektiv || 'Gesamt';
                const perfData = _getKollektivStats(allStats, evalKollektivId)?.gueteT2_literatur?.[setConf.id];

                if (perfData) {
                    tablePlaceholderText += `{Table:Performance_LitT2_${setConf.id}_${evalKollektivId.replace(/\s/g, '')}}\n`;
                    textDe += `Das Kriterienset nach **${setName} (${refShort})**, evaluiert auf dem ${getKollektivDisplayName(evalKollektivId)}-Kollektiv, erreichte eine Sensitivität von ${_formatSingleStat(perfData.sens, 'de')}, eine Spezifität von ${_formatSingleStat(perfData.spez, 'de')} und eine AUC von ${_formatSingleStat(perfData.auc, 'de', false, 3, 3, false)}. (LR+ ${_formatSingleStat(perfData.lrPlus, 'de', false, 2,2,false)}, LR- ${_formatSingleStat(perfData.lrMinus, 'de', false,2,2,false)}) Details siehe Tabelle {Table:Performance_LitT2_${setConf.id}_${evalKollektivId.replace(/\s/g, '')}}.\n\n`;
                    textEn += `The criteria set by **${setName} (${refShort})**, evaluated on the ${getKollektivDisplayName(evalKollektivId)} cohort, achieved a sensitivity of ${_formatSingleStat(perfData.sens, 'en')}, a specificity of ${_formatSingleStat(perfData.spez, 'en')}, and an AUC of ${_formatSingleStat(perfData.auc, 'en', false, 3, 3, false)}. (LR+ ${_formatSingleStat(perfData.lrPlus, 'en', false, 2,2,false)}, LR- ${_formatSingleStat(perfData.lrMinus, 'en', false,2,2,false)}) See Table {Table:Performance_LitT2_${setConf.id}_${evalKollektivId.replace(/\s/g, '')}} for details.\n\n`;
                } else {
                    textDe += `Für das Kriterienset nach **${setName} (${refShort})** konnten im ${getKollektivDisplayName(evalKollektivId)}-Kollektiv keine validen Performancedaten berechnet werden.\n\n`;
                    textEn += `For the criteria set by **${setName} (${refShort})**, no valid performance data could be calculated in the ${getKollektivDisplayName(evalKollektivId)} cohort.\n\n`;
                }
            }
        });
        if (PUBLICATION_CONFIG.literatureCriteriaSets.length === 0) {
            textDe += "Keine Literatur-basierten T2-Kriteriensets wurden für einen detaillierten Vergleich in dieser Analyse konfiguriert.\n";
            textEn += "No literature-based T2 criteria sets were configured for detailed comparison in this analysis.\n";
        }

        return (lang === 'de' ? textDe : textEn) + '\n' + tablePlaceholderText;
    }

    function _generateErgebnisseOptimierteT2PerformanceText(lang, allStats, commonData) {
        const bfMetric = commonData.bruteForceMetricForPublication;
        let textDe = `### Diagnostische Güte Daten-getrieben optimierter T2-Kriteriensets (Brute-Force)\nOptimiert auf **${bfMetric}**.\n`;
        let textEn = `### Diagnostic Performance of Data-driven Optimized T2 Criteria Sets (Brute-Force)\nOptimized for **${bfMetric}**.\n`;
        let tablePlaceholderText = '';

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        kollektive.forEach(kId => {
            const bfDisplayData = _getBruteForceResultsForDisplay(allStats, kId, bfMetric);
            if (bfDisplayData && bfDisplayData.performance) {
                const perfData = bfDisplayData.performance;
                const criteriaStr = _getFormattedCriteriaString(bfDisplayData.definition.criteria, bfDisplayData.definition.logic, lang);
                tablePlaceholderText += `{Table:Performance_OptT2_${kId.replace(/\s/g, '')}}\n`;

                textDe += `Für das **${getKollektivDisplayName(kId)}-Kollektiv** erreichte das optimierte Set (${criteriaStr}) eine Sensitivität von ${_formatSingleStat(perfData.sens, 'de')}, Spezifität von ${_formatSingleStat(perfData.spez, 'de')} und eine AUC von ${_formatSingleStat(perfData.auc, 'de', false, 3, 3, false)}. (LR+ ${_formatSingleStat(perfData.lrPlus, 'de', false,2,2,false)}, LR- ${_formatSingleStat(perfData.lrMinus, 'de', false,2,2,false)}) Details siehe Tabelle {Table:Performance_OptT2_${kId.replace(/\s/g, '')}}.\n\n`;
                textEn += `For the **${getKollektivDisplayName(kId)} cohort**, the optimized set (${criteriaStr}) achieved a sensitivity of ${_formatSingleStat(perfData.sens, 'en')}, specificity of ${_formatSingleStat(perfData.spez, 'en')}, and an AUC of ${_formatSingleStat(perfData.auc, 'en', false, 3, 3, false)}. (LR+ ${_formatSingleStat(perfData.lrPlus, 'en', false,2,2,false)}, LR- ${_formatSingleStat(perfData.lrMinus, 'en', false,2,2,false)}) See Table {Table:Performance_OptT2_${kId.replace(/\s/g, '')}} for details.\n\n`;
            } else {
                textDe += `Für das **${getKollektivDisplayName(kId)}-Kollektiv** konnten keine optimierten Kriterien für die Metrik '${bfMetric}' gefunden oder deren Performance berechnet werden.\n\n`;
                textEn += `For the **${getKollektivDisplayName(kId)} cohort**, no optimized criteria for the metric '${bfMetric}' could be found or their performance calculated.\n\n`;
            }
        });

        return (lang === 'de' ? textDe : textEn) + '\n' + tablePlaceholderText;
    }

    function _generateErgebnisseVergleichPerformanceText(lang, allStats, commonData) {
        const bfMetric = commonData.bruteForceMetricForPublication;
        let textDe = `### Vergleichende Analyse der diagnostischen Güte\n`;
        let textEn = `### Comparative Analysis of Diagnostic Performance\n`;
        let tablePlaceholderText = '';

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        kollektive.forEach(kId => {
            const statsK = _getKollektivStats(allStats, kId);
            if (statsK) {
                const vergleichASvsT2angewandt = statsK.vergleichASvsT2_angewandt;
                const vergleichASvsT2optimiert = statsK.vergleichASvsT2_bruteforce;

                textDe += `\n**Im ${getKollektivDisplayName(kId)}-Kollektiv:**\n`;
                textEn += `\n**In the ${getKollektivDisplayName(kId)} cohort:**\n`;
                tablePlaceholderText += `{Table:Vergleich_Performance_AS_vs_T2angewandt_${kId.replace(/\s/g, '')}}\n`;
                tablePlaceholderText += `{Table:Vergleich_Performance_AS_vs_T2optimiert_${kId.replace(/\s/g, '')}}\n`;


                if (vergleichASvsT2angewandt) {
                    const pAcc = _formatPValueForText(vergleichASvsT2angewandt.mcnemar?.pValue, lang);
                    const pAUC = _formatPValueForText(vergleichASvsT2angewandt.delong?.pValue, lang);
                    textDe += `- AS vs. angewandte T2-Kriterien: Unterschied in Accuracy ${pAcc}, Unterschied in AUC ${pAUC}. (Details: Tabelle {Table:Vergleich_Performance_AS_vs_T2angewandt_${kId.replace(/\s/g, '')}})\n`;
                    textEn += `- AS vs. applied T2 criteria: Difference in Accuracy ${pAcc}, Difference in AUC ${pAUC}. (Details: Table {Table:Vergleich_Performance_AS_vs_T2angewandt_${kId.replace(/\s/g, '')}})\n`;
                }
                if (vergleichASvsT2optimiert) {
                    const pAccOpt = _formatPValueForText(vergleichASvsT2optimiert.mcnemar?.pValue, lang);
                    const pAUCOpt = _formatPValueForText(vergleichASvsT2optimiert.delong?.pValue, lang);
                    textDe += `- AS vs. für ${bfMetric} optimierte T2-Kriterien: Unterschied in Accuracy ${pAccOpt}, Unterschied in AUC ${pAUCOpt}. (Details: Tabelle {Table:Vergleich_Performance_AS_vs_T2optimiert_${kId.replace(/\s/g, '')}})\n`;
                    textEn += `- AS vs. T2 criteria optimized for ${bfMetric}: Difference in Accuracy ${pAccOpt}, Difference in AUC ${pAUCOpt}. (Details: Table {Table:Vergleich_Performance_AS_vs_T2optimiert_${kId.replace(/\s/g, '')}})\n`;
                }
                 // Vergleich AS vs. Literatur-Sets
                 if (statsK.gueteT2_literatur) {
                    PUBLICATION_CONFIG.literatureCriteriaSets.forEach(setConf => {
                        const vergleichKey = `vergleichASvsT2_literatur_${setConf.id}`;
                        const vergleichASvsLit = statsK[vergleichKey];
                        if (vergleichASvsLit) {
                            const litSetName = _getLiteratureSetName(setConf.id, lang, commonData);
                             const pAccLit = _formatPValueForText(vergleichASvsLit.mcnemar?.pValue, lang);
                             const pAUCLit = _formatPValueForText(vergleichASvsLit.delong?.pValue, lang);
                             tablePlaceholderText += `{Table:Vergleich_Performance_AS_vs_LitT2_${setConf.id}_${kId.replace(/\s/g, '')}}\n`;
                             textDe += `- AS vs. ${litSetName}: Unterschied in Accuracy ${pAccLit}, Unterschied in AUC ${pAUCLit}. (Details: Tabelle {Table:Vergleich_Performance_AS_vs_LitT2_${setConf.id}_${kId.replace(/\s/g, '')}})\n`;
                             textEn += `- AS vs. ${litSetName}: Difference in Accuracy ${pAccLit}, Difference in AUC ${pAUCLit}. (Details: Table {Table:Vergleich_Performance_AS_vs_LitT2_${setConf.id}_${kId.replace(/\s/g, '')}})\n`;
                        }
                    });
                }
            }
        });
        textDe += "\nEine zusammenfassende grafische Darstellung der Performance-Metriken für die verschiedenen Methoden und Kollektive ist in {Figure:Vergleich_Performance_Alle_Methoden_Gesamt}, {Figure:Vergleich_Performance_Alle_Methoden_DirektOP} und {Figure:Vergleich_Performance_Alle_Methoden_nRCT} dargestellt.\n";
        textEn += "\nA summary graphical representation of performance metrics for the different methods and cohorts is shown in {Figure:Vergleich_Performance_Alle_Methoden_Gesamt}, {Figure:Vergleich_Performance_Alle_Methoden_DirektOP}, and {Figure:Vergleich_Performance_Alle_Methoden_nRCT}.\n";

        return (lang === 'de' ? textDe : textEn) + '\n' + tablePlaceholderText;
    }


    function getSectionTextAsMarkdown(sectionId, lang, allStats, commonData) {
        switch (sectionId) {
            case 'methoden_studienanlage': return _generateMethodenStudienanlageText(lang, allStats, commonData);
            case 'methoden_patientenkohorte': return _generateMethodenPatientenkohorteText(lang, allStats, commonData);
            case 'methoden_mrt_protokoll': return _generateMethodenMRTProtokollText(lang, allStats, commonData);
            case 'methoden_as_definition': return _generateMethodenASDefinitionText(lang, allStats, commonData);
            case 'methoden_t2_definition': return _generateMethodenT2DefinitionText(lang, allStats, commonData);
            case 'methoden_referenzstandard': return _generateMethodenReferenzstandardText(lang, allStats, commonData);
            case 'methoden_statistische_analyse': return _generateMethodenStatistischeAnalyseText(lang, allStats, commonData);
            case 'ergebnisse_patientencharakteristika': return _generateErgebnissePatientencharakteristikaText(lang, allStats, commonData);
            case 'ergebnisse_as_performance': return _generateErgebnisseASPerformanceText(lang, allStats, commonData);
            case 'ergebnisse_literatur_t2_performance': return _generateErgebnisseLiteraturT2PerformanceText(lang, allStats, commonData);
            case 'ergebnisse_optimierte_t2_performance': return _generateErgebnisseOptimierteT2PerformanceText(lang, allStats, commonData);
            case 'ergebnisse_vergleich_performance': return _generateErgebnisseVergleichPerformanceText(lang, allStats, commonData);
            default:
                const sectionConfig = PUBLICATION_CONFIG.sections.flatMap(s => s.subSections).find(ss => ss.id === sectionId);
                const title = sectionConfig ? (sectionConfig.title[lang] || sectionConfig.title.de) : sectionId;
                return lang === 'de' ? `## ${title}\n\nInhalt für diese Sektion wird noch generiert.` : `## ${title}\n\nContent for this section is pending generation.`;
        }
    }

    return Object.freeze({
        getSectionTextAsMarkdown
    });

})();
