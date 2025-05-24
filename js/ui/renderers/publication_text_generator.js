const publicationTextGenerator = (() => {

    function fValue(value, digits = 1, unit = '') {
        const num = parseFloat(value);
        if (isNaN(num) || !isFinite(num)) return 'N/A';
        return `${num.toFixed(digits)}${unit}`;
    }

    function fPercent(value, digits = 1) {
        const num = parseFloat(value);
        if (isNaN(num) || !isFinite(num)) return 'N/A';
        return `${(num * 100).toFixed(digits)}%`;
    }

    function fCI(metric, digits = 1, isPercent = true, lang = 'de') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return 'N/A';
        const valStr = isPercent ? fPercent(metric.value, digits) : fValue(metric.value, digits);
        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper)) {
            const lowerStr = isPercent ? fPercent(metric.ci.lower, digits) : fValue(metric.ci.lower, digits);
            const upperStr = isPercent ? fPercent(metric.ci.upper, digits) : fValue(metric.ci.upper, digits);
            const ciText = lang === 'de' ? '95% KI' : '95% CI';
            return `${valStr} (${ciText}: ${lowerStr} – ${upperStr})`;
        }
        return valStr;
    }

    function getPValueText(pValue, lang = 'de') {
        if (pValue === null || pValue === undefined || isNaN(pValue)) return 'N/A';
        if (pValue < 0.001) return lang === 'de' ? 'p < 0.001' : 'P < .001';
        return `p = ${fValue(pValue, 3)}`;
    }

    function getKollektivText(kollektivId, n, lang = 'de') {
        const name = getKollektivDisplayName(kollektivId);
        const nText = lang === 'de' ? `(N=${n})` : `(n=${n})`;
        return `${name} ${nText}`;
    }

    function getMethodenStudienanlageText(lang, commonData) {
        const appVersion = commonData.appVersion || APP_CONFIG.APP_VERSION;
        if (lang === 'de') {
            return `
                <p>Diese Studie wurde als retrospektive Analyse prospektiv erhobener Daten eines monozentrischen Patientenkollektivs mit histologisch gesichertem Rektumkarzinom konzipiert. Das Kollektiv und die zugrundeliegenden Bilddaten sind identisch mit der initialen "Avocado Sign" Studie (Lurz & Schäfer, 2025). Ziel der vorliegenden Untersuchung war der Vergleich der diagnostischen Güte des Avocado Signs mit etablierten und optimierten T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus.</p>
                <p>Alle Analysen wurden mittels einer speziell für diese Untersuchung weiterentwickelten, interaktiven Webanwendung (AvocadoSign Analyse Tool v${appVersion}) durchgeführt. Diese ermöglicht die flexible Definition und Anwendung von T2-Kriteriensets, die automatisierte Optimierung von Kriterien mittels Brute-Force-Verfahren sowie die umfassende statistische Auswertung und Visualisierung der Ergebnisse. Die Studie wurde in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki durchgeführt und von der lokalen Ethikkommission genehmigt (Ethikvotum Nr. XYZ/2020, Klinikum St. Georg, Leipzig). Ein schriftliches Einverständnis aller Patienten lag vor.</p>
            `;
        } else {
            return `
                <p>This study was designed as a retrospective analysis of prospectively collected data from a single-center patient cohort with histologically confirmed rectal cancer. The cohort and underlying imaging data are identical to the initial "Avocado Sign" study (Lurz & Schäfer, 2025). The objective of the present investigation was to compare the diagnostic performance of the Avocado Sign with established and optimized T2-weighted morphological criteria for predicting mesorectal lymph node status.</p>
                <p>All analyses were performed using a custom-developed interactive web application (AvocadoSign Analysis Tool v${appVersion}), specifically enhanced for this investigation. This tool allows for flexible definition and application of T2 criteria sets, automated optimization of criteria using a brute-force algorithm, and comprehensive statistical evaluation and visualization of results. The study was conducted in accordance with the principles of the Declaration of Helsinki and was approved by the local ethics committee (Ethics Vote No. XYZ/2020, Klinikum St. Georg, Leipzig). Written informed consent was obtained from all patients.</p>
            `;
        }
    }

    function getMethodenPatientenkollektivText(lang, publicationData, commonData) {
        const pChar = publicationData?.Gesamt?.deskriptiv;
        if (lang === 'de') {
            return `
                <p>Das Studienkollektiv umfasste ${commonData.nGesamt || 'N/A'} konsekutive Patienten mit histologisch gesichertem Rektumkarzinom, die zwischen Januar 2020 und November 2023 am Klinikum St. Georg, Leipzig, behandelt wurden. Davon erhielten ${commonData.nNRCT || 'N/A'} Patienten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während ${commonData.nDirektOP || 'N/A'} Patienten primär operiert wurden (Direkt-OP-Gruppe). Die mediane Alter betrug ${fValue(pChar?.alter?.median, 1)} Jahre (Range: ${fValue(pChar?.alter?.min, 0)}–${fValue(pChar?.alter?.max, 0)} Jahre), und ${fPercent(pChar?.geschlecht?.m && pChar?.anzahlPatienten ? pChar.geschlecht.m / pChar.anzahlPatienten : NaN, 0)} (${pChar?.geschlecht?.m || 0}/${pChar?.anzahlPatienten || 0}) waren männlich. Detaillierte Patientencharakteristika sind in Tabelle 1 dargestellt.</p>
                <p>Einschlusskriterien waren ein Alter von mindestens 18 Jahren und ein histologisch bestätigtes Rektumkarzinom. Ausschlusskriterien umfassten nicht resektable Tumoren und Kontraindikationen für eine MRT-Untersuchung.</p>
            `;
        } else {
            return `
                <p>The study cohort comprised ${commonData.nGesamt || 'N/A'} consecutive patients with histologically confirmed rectal cancer treated at Klinikum St. Georg, Leipzig, between January 2020 and November 2023. Of these, ${commonData.nNRCT || 'N/A'} patients received neoadjuvant chemoradiotherapy (nRCT group), while ${commonData.nDirektOP || 'N/A'} patients underwent primary surgery (upfront surgery group). The median age was ${fValue(pChar?.alter?.median, 1)} years (range: ${fValue(pChar?.alter?.min, 0)}–${fValue(pChar?.alter?.max, 0)} years), and ${fPercent(pChar?.geschlecht?.m && pChar?.anzahlPatienten ? pChar.geschlecht.m / pChar.anzahlPatienten : NaN, 0)} (${pChar?.geschlecht?.m || 0}/${pChar?.anzahlPatienten || 0}) were male. Detailed patient characteristics are presented in Table 1.</p>
                <p>Inclusion criteria were an age of at least 18 years and histologically confirmed rectal cancer. Exclusion criteria included unresectable tumors and contraindications to MRI examination.</p>
            `;
        }
    }

    function getMethodenMRTProtokollText(lang, commonData) {
         if (lang === 'de') {
            return `
                <p>Alle MRT-Untersuchungen wurden an einem 3.0-Tesla-System (MAGNETOM Prisma Fit; Siemens Healthineers) unter Verwendung von Körper- und Wirbelsäulen-Array-Spulen durchgeführt. Das Bildgebungsprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Ebene sowie eine axiale diffusionsgewichtete Sequenz (DWI). Für die Bewertung des Avocado Signs wurde eine kontrastmittelverstärkte axiale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung akquiriert.</p>
                <p>Ein makrozyklisches Gadolinium-basiertes Kontrastmittel (Gadoteridol; ProHance; Bracco) wurde gewichtsadaptiert (0,2 ml/kg Körpergewicht) intravenös verabreicht. Die kontrastmittelverstärkten Aufnahmen erfolgten unmittelbar nach vollständiger Applikation des Kontrastmittels. Butylscopolamin wurde zu Beginn und in der Mitte jeder Untersuchung zur Reduktion von Bewegungsartefakten appliziert. Das Bildgebungsprotokoll war für die primäre Staging-Untersuchung und die Restaging-Untersuchung identisch.</p>
            `;
        } else {
            return `
                <p>All MRI examinations were performed on a 3.0-Tesla system (MAGNETOM Prisma Fit; Siemens Healthineers) using body and spine array coils. The imaging protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal planes, as well as axial diffusion-weighted imaging (DWI). For the assessment of the Avocado Sign, a contrast-enhanced axial T1-weighted volumetric interpolated breath-hold examination (VIBE) with Dixon fat suppression was acquired.</p>
                <p>A macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco) was administered intravenously at a weight-based dose (0.2 mL/kg body weight). Contrast-enhanced images were acquired immediately after the full administration of the contrast agent. Butylscopolamine was administered at the beginning and midpoint of each examination to reduce motion artifacts. The imaging protocol was identical for baseline staging and restaging examinations.</p>
            `;
        }
    }

    function getMethodenASDefinitionText(lang, commonData) {
        if (lang === 'de') {
            return `
                <p>Das Avocado Sign wurde auf den kontrastmittelverstärkten T1-gewichteten Bildern evaluiert und als ein hypointenser Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens definiert, unabhängig von Größe oder Form des Lymphknotens. Die Bewertung erfolgte für alle sichtbaren mesorektalen Lymphknoten. Ein Patient wurde als Avocado-Sign-positiv (AS+) eingestuft, wenn mindestens ein Lymphknoten dieses Zeichen aufwies. Die Bildanalyse wurde von zwei erfahrenen Radiologen (ML, Radiologe mit 7 Jahren Erfahrung in der abdominellen MRT; AOS, Radiologe mit 29 Jahren Erfahrung in der abdominellen MRT) unabhängig und verblindet gegenüber den histopathologischen Ergebnissen durchgeführt. Diskrepanzen wurden im Konsens mit einem dritten, ebenfalls erfahrenen Radiologen gelöst.</p>
            `;
        } else {
            return `
                <p>The Avocado Sign was evaluated on contrast-enhanced T1-weighted images and defined as a hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape. Assessment was performed for all visible mesorectal lymph nodes. A patient was classified as Avocado-Sign-positive (AS+) if at least one lymph node exhibited this sign. Image analysis was performed independently by two experienced radiologists (ML, radiologist with 7 years of experience in abdominal MRI; AOS, radiologist with 29 years of experience in abdominal MRI), blinded to the histopathological results. Discrepancies were resolved by consensus with a third experienced radiologist.</p>
            `;
        }
    }

    function getMethodenT2DefinitionText(lang, commonData, publicationData, kollektiveData) {
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
        const appliedLogic = t2CriteriaManager.getAppliedLogic();
        const formattedAppliedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false);

        const bfMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const bfGesamt = kollektiveData?.Gesamt?.bruteforce_definition;
        const bfDirektOP = kollektiveData?.['direkt OP']?.bruteforce_definition;
        const bfNRCT = kollektiveData?.nRCT?.bruteforce_definition;

        const formatBF = (bfData, kollektivName) => {
            if (bfData && bfData.criteria) {
                return `<li><strong>${kollektivName}:</strong> ${studyT2CriteriaManager.formatCriteriaForDisplay(bfData.criteria, bfData.logic)} (Ziel: ${bfData.metricName}, Wert: ${fValue(bfData.metricValue,4)})</li>`;
            }
            return `<li><strong>${kollektivName}:</strong> Keine Optimierungsergebnisse für Zielmetrik ${bfMetric} verfügbar.</li>`;
        };

        let bfCriteriaTextDe = '<ul>';
        bfCriteriaTextDe += formatBF(bfGesamt, 'Gesamtkollektiv');
        bfCriteriaTextDe += formatBF(bfDirektOP, 'Direkt-OP Kollektiv');
        bfCriteriaTextDe += formatBF(bfNRCT, 'nRCT Kollektiv');
        bfCriteriaTextDe += '</ul>';

        let bfCriteriaTextEn = '<ul>';
        bfCriteriaTextEn += formatBF(bfGesamt, 'Overall cohort');
        bfCriteriaTextEn += formatBF(bfDirektOP, 'Upfront surgery cohort');
        bfCriteriaTextEn += formatBF(bfNRCT, 'nRCT cohort');
        bfCriteriaTextEn += '</ul>';


        if (lang === 'de') {
            return `
                <p>Die morphologischen T2-Kriterien wurden auf hochauflösenden T2-gewichteten Sequenzen evaluiert. Für den Vergleich wurden folgende Kriteriensets herangezogen:</p>
                <ol>
                    <li><strong>Benutzerdefiniert angewandte T2-Kriterien:</strong> Die über die Benutzeroberfläche der Analyseanwendung aktuell konfigurierten und angewendeten Kriterien. Aktuelle Einstellung: ${formattedAppliedCriteria}.</li>
                    <li><strong>Literatur-basierte T2-Kriteriensets:</strong>
                        <ul>
                            <li>Koh et al. (2008): "${studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology')?.description || 'Irreguläre Kontur ODER heterogenes Signal'}". Evaluiert für das Gesamtkollektiv in dieser Anwendung.</li>
                            <li>Barbaro et al. (2024): "${studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging')?.description || 'Kurzachse ≥ 2.3mm'}". Angewendet auf die nRCT-Kohorte für Restaging.</li>
                            <li>ESGAR Konsensus Kriterien (2016), evaluiert durch Rutegård et al. (2025): "${studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar')?.description || 'Komplexe größenabhängige morphologische Regeln'}". Primär angewendet auf die Direkt-OP-Kohorte für Primärstaging.</li>
                        </ul>
                        Eine detaillierte Übersicht dieser Literatur-Kriterien findet sich in Tabelle 2.
                    </li>
                    <li><strong>Brute-Force optimierte T2-Kriterien:</strong> Für jedes Patientenkollektiv (Gesamt, Direkt OP, nRCT) wurden mittels eines Brute-Force-Algorithmus diejenigen T2-Kriterien (Kombination aus Größe, Form, Kontur, Homogenität, Signal und UND/ODER-Logik) identifiziert, welche die ${bfMetric} maximieren. Die resultierenden optimierten Kriterien waren:
                        ${bfCriteriaTextDe}
                    </li>
                </ol>
                <p>Ein Lymphknoten wurde als T2-positiv gewertet, wenn er die Bedingungen des jeweiligen Kriteriensets erfüllte. Ein Patient galt als T2-positiv, wenn mindestens ein Lymphknoten T2-positiv war.</p>
            `;
        } else {
            return `
                <p>Morphological T2 criteria were evaluated on high-resolution T2-weighted sequences. The following criteria sets were used for comparison:</p>
                <ol>
                    <li><strong>User-defined applied T2 criteria:</strong> The criteria currently configured and applied via the analysis application's user interface. Current setting: ${formattedAppliedCriteria}.</li>
                    <li><strong>Literature-based T2 criteria sets:</strong>
                        <ul>
                            <li>Koh et al. (2008): "${studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology')?.description || 'Irregular border OR heterogeneous internal signal'}". Evaluated for the overall cohort in this application.</li>
                            <li>Barbaro et al. (2024): "${studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging')?.description || 'Short-axis diameter ≥ 2.3mm'}". Applied to the nRCT cohort for restaging.</li>
                            <li>ESGAR Consensus Criteria (2016), as evaluated by Rutegård et al. (2025): "${studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar')?.description || 'Complex size-dependent morphological rules'}". Primarily applied to the upfront surgery cohort for primary staging.</li>
                        </ul>
                        A detailed overview of these literature-based criteria is provided in Table 2.
                    </li>
                    <li><strong>Brute-force optimized T2 criteria:</strong> For each patient cohort (Overall, Upfront Surgery, nRCT), T2 criteria (combination of size, shape, border, homogeneity, signal, and AND/OR logic) that maximize ${bfMetric} were identified using a brute-force algorithm. The resulting optimized criteria were:
                        ${bfCriteriaTextEn}
                    </li>
                </ol>
                <p>A lymph node was considered T2-positive if it met the conditions of the respective criteria set. A patient was considered T2-positive if at least one lymph node was T2-positive.</p>
            `;
        }
    }

    function getMethodenReferenzstandardText(lang, commonData) {
         if (lang === 'de') {
            return `
                <p>Die histopathologische Untersuchung der Operationspräparate diente als Referenzstandard. Alle mesorektalen Lymphknoten wurden gemäß den Standardprotokollen aufgearbeitet und bewertet. Der N-Status eines Patienten wurde als positiv (N+) definiert, wenn mindestens ein Lymphknoten histologisch als metastatisch befallen identifiziert wurde. Andernfalls galt der Patient als N-negativ (N0).</p>
            `;
        } else {
            return `
                <p>Histopathological examination of the surgical specimens served as the reference standard. All mesorectal lymph nodes were processed and evaluated according to standard protocols. A patient's N-status was defined as positive (N+) if at least one lymph node was histologically identified as metastatic. Otherwise, the patient was considered N-negative (N0).</p>
            `;
        }
    }

    function getMethodenStatistischeAnalyseText(lang, commonData) {
        const alpha = (commonData.significanceLevel * 100) || 5;
        const bootstrapN = commonData.bootstrapReplications || 1000;
        if (lang === 'de') {
            return `
                <p>Die deskriptive Statistik umfasste die Berechnung von Medianen, Mittelwerten, Standardabweichungen (SD), Minima und Maxima für kontinuierliche Variablen sowie Häufigkeiten und Prozentanteile für kategoriale Daten. Die diagnostische Güte des Avocado Signs und der verschiedenen T2-Kriteriensets wurde anhand von Sensitivität, Spezifität, positivem prädiktiven Wert (PPV), negativem prädiktiven Wert (NPV), Accuracy (ACC) und der Fläche unter der Receiver Operating Characteristic-Kurve (AUC) – äquivalent zur Balanced Accuracy (BalAcc) für binäre Tests – evaluiert. Für diese Metriken wurden 95%-Konfidenzintervalle (KI) berechnet, wobei für Proportionen das Wilson-Score-Intervall und für AUC/BalAcc sowie den F1-Score die Bootstrap-Perzentil-Methode (mit ${bootstrapN} Replikationen) verwendet wurde.</p>
                <p>Der statistische Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe erfolgte mittels des McNemar-Tests für gepaarte nominale Daten bzw. des DeLong-Tests für den Vergleich von AUC-Werten. Ein p-Wert < ${fValue(commonData.significanceLevel,2)} wurde als statistisch signifikant interpretiert. Alle statistischen Analysen wurden mit der oben genannten Webanwendung (AvocadoSign Analyse Tool v${commonData.appVersion}) durchgeführt.</p>
            `;
        } else {
            return `
                <p>Descriptive statistics included the calculation of medians, means, standard deviations (SD), minima, and maxima for continuous variables, as well as frequencies and percentages for categorical data. The diagnostic performance of the Avocado Sign and the various T2 criteria sets was evaluated using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy (ACC), and the area under the Receiver Operating Characteristic curve (AUC)—equivalent to Balanced Accuracy (BalAcc) for binary tests. 95% confidence intervals (CI) were calculated for these metrics, using the Wilson score interval for proportions and the bootstrap percentile method (with ${bootstrapN} replications) for AUC/BalAcc and F1-score.</p>
                <p>Statistical comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group was performed using McNemar's test for paired nominal data and DeLong's test for AUC comparison. A p-value < ${fValue(commonData.significanceLevel,2)} was considered statistically significant. All statistical analyses were conducted using the aforementioned web application (AvocadoSign Analysis Tool v${commonData.appVersion}).</p>
            `;
        }
    }

    function getErgebnissePatientencharakteristikaText(lang, publicationData, commonData) {
        const pCharGesamt = publicationData?.Gesamt?.deskriptiv;
        const pCharDirektOP = publicationData?.['direkt OP']?.deskriptiv;
        const pCharNRCT = publicationData?.nRCT?.deskriptiv;

        if (lang === 'de') {
            return `
                <p>Insgesamt wurden ${commonData.nGesamt || 'N/A'} Patienten in die Studie eingeschlossen. Davon wurden ${commonData.nDirektOP || 'N/A'} Patienten primär operiert (Direkt-OP-Gruppe) und ${commonData.nNRCT || 'N/A'} Patienten erhielten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${fValue(pCharGesamt?.alter?.median, 1)} Jahre (Range ${fValue(pCharGesamt?.alter?.min, 0)}–${fValue(pCharGesamt?.alter?.max, 0)}), ${fPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN,0)} waren männlich. Ein positiver N-Status (N+) fand sich bei ${fPercent(pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN,0)} der Patienten im Gesamtkollektiv. Die detaillierten Charakteristika der Patienten, aufgeschlüsselt nach Behandlungsgruppen, sind in Tabelle 1 zusammengefasst.</p>
                <p>Die Diagramme zur Alters- und Geschlechterverteilung für das aktuell im Header ausgewählte Kollektiv (${commonData.currentKollektivName}) sind in Abbildung 1a und 1b dargestellt.</p>
            `;
        } else {
            return `
                <p>A total of ${commonData.nGesamt || 'N/A'} patients were included in the study. Of these, ${commonData.nDirektOP || 'N/A'} patients underwent upfront surgery (upfront surgery group) and ${commonData.nNRCT || 'N/A'} patients received neoadjuvant chemoradiotherapy (nRCT group). The median age in the overall cohort was ${fValue(pCharGesamt?.alter?.median, 1)} years (range ${fValue(pCharGesamt?.alter?.min, 0)}–${fValue(pCharGesamt?.alter?.max, 0)}), and ${fPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN,0)} were male. A positive N-status (N+) was found in ${fPercent(pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN,0)} of patients in the overall cohort. Detailed patient characteristics, stratified by treatment group, are summarized in Table 1.</p>
                <p>The age and gender distribution charts for the currently selected cohort in the application header (${commonData.currentKollektivName}) are shown in Figure 1a and 1b.</p>
            `;
        }
    }

    function getErgebnisseASPerformanceText(lang, publicationData, commonData) {
        const asGesamt = publicationData?.Gesamt?.gueteAS;
        const asDirektOP = publicationData?.['direkt OP']?.gueteAS;
        const asNRCT = publicationData?.nRCT?.gueteAS;

        if (lang === 'de') {
            return `
                <p>Die diagnostische Güte des Avocado Signs zur Vorhersage des pathologischen N-Status ist in Tabelle 3 zusammengefasst. Im Gesamtkollektiv (N=${commonData.nGesamt}) erreichte das Avocado Sign eine Sensitivität von ${fCI(asGesamt?.sens)}, eine Spezifität von ${fCI(asGesamt?.spez)}, einen PPV von ${fCI(asGesamt?.ppv)}, einen NPV von ${fCI(asGesamt?.npv)} und eine Accuracy von ${fCI(asGesamt?.acc)}. Die AUC betrug ${fCI(asGesamt?.auc, 3, false)}.</p>
                <p>In der Subgruppe der primär operierten Patienten (N=${commonData.nDirektOP}) zeigte das Avocado Sign eine Sensitivität von ${fCI(asDirektOP?.sens)} und eine Spezifität von ${fCI(asDirektOP?.spez)} (AUC: ${fCI(asDirektOP?.auc, 3, false)}). Bei Patienten nach nRCT (N=${commonData.nNRCT}) betrug die Sensitivität ${fCI(asNRCT?.sens)} und die Spezifität ${fCI(asNRCT?.spez)} (AUC: ${fCI(asNRCT?.auc, 3, false)}).</p>
                <p>Die ROC-Kurve für das Avocado Sign im aktuell ausgewählten Kollektiv (${commonData.currentKollektivName}) ist in Abbildung 2a dargestellt.</p>
            `;
        } else {
            return `
                <p>The diagnostic performance of the Avocado Sign for predicting pathological N-status is summarized in Table 3. In the overall cohort (n=${commonData.nGesamt}), the Avocado Sign achieved a sensitivity of ${fCI(asGesamt?.sens, 1, true, 'en')}, a specificity of ${fCI(asGesamt?.spez, 1, true, 'en')}, a PPV of ${fCI(asGesamt?.ppv, 1, true, 'en')}, an NPV of ${fCI(asGesamt?.npv, 1, true, 'en')}, and an accuracy of ${fCI(asGesamt?.acc, 1, true, 'en')}. The AUC was ${fCI(asGesamt?.auc, 3, false, 'en')}.</p>
                <p>In the subgroup of patients undergoing upfront surgery (n=${commonData.nDirektOP}), the Avocado Sign showed a sensitivity of ${fCI(asDirektOP?.sens, 1, true, 'en')} and a specificity of ${fCI(asDirektOP?.spez, 1, true, 'en')} (AUC: ${fCI(asDirektOP?.auc, 3, false, 'en')}). For patients after nRCT (n=${commonData.nNRCT}), the sensitivity was ${fCI(asNRCT?.sens, 1, true, 'en')} and the specificity was ${fCI(asNRCT?.spez, 1, true, 'en')} (AUC: ${fCI(asNRCT?.auc, 3, false, 'en')}).</p>
                <p>The ROC curve for the Avocado Sign in the currently selected cohort (${commonData.currentKollektivName}) is presented in Figure 2a.</p>
            `;
        }
    }

    function getErgebnisseLiteraturT2PerformanceText(lang, publicationData, commonData) {
        let text = '';
        if (lang === 'de') {
            text += `<p>Die diagnostische Güte der etablierten Literatur-basierten T2-Kriteriensets wurde für die jeweils relevanten Kollektive evaluiert (Tabelle 4). `;
            text += `Für das Kriterienset nach Koh et al. (2008) ergab sich im Gesamtkollektiv (N=${commonData.nGesamt}) eine AUC von ${fCI(publicationData?.Gesamt?.gueteT2_literatur?.['koh_2008_morphology']?.auc, 3, false)}. `;
            text += `Die Kriterien nach Barbaro et al. (2024) zeigten im nRCT-Kollektiv (N=${commonData.nNRCT}) eine AUC von ${fCI(publicationData?.nRCT?.gueteT2_literatur?.['barbaro_2024_restaging']?.auc, 3, false)}. `;
            text += `Die ESGAR 2016 Kriterien (evaluiert durch Rutegård et al., 2025) erreichten im Direkt-OP-Kollektiv (N=${commonData.nDirektOP}) eine AUC von ${fCI(publicationData?.['direkt OP']?.gueteT2_literatur?.['rutegard_et_al_esgar']?.auc, 3, false)}. Detaillierte Metriken (Sensitivität, Spezifität etc.) für jedes Set und Kollektiv sind in Tabelle 4 aufgeführt.</p>`;
        } else {
            text += `<p>The diagnostic performance of established literature-based T2 criteria sets was evaluated for the respective relevant cohorts (Table 4). `;
            text += `For the criteria set according to Koh et al. (2008), an AUC of ${fCI(publicationData?.Gesamt?.gueteT2_literatur?.['koh_2008_morphology']?.auc, 3, false, 'en')} was observed in the overall cohort (n=${commonData.nGesamt}). `;
            text += `The criteria by Barbaro et al. (2024) showed an AUC of ${fCI(publicationData?.nRCT?.gueteT2_literatur?.['barbaro_2024_restaging']?.auc, 3, false, 'en')} in the nRCT cohort (n=${commonData.nNRCT}). `;
            text += `The ESGAR 2016 criteria (evaluated by Rutegård et al., 2025) achieved an AUC of ${fCI(publicationData?.['direkt OP']?.gueteT2_literatur?.['rutegard_et_al_esgar']?.auc, 3, false, 'en')} in the upfront surgery cohort (n=${commonData.nDirektOP}). Detailed metrics (sensitivity, specificity, etc.) for each set and cohort are listed in Table 4.</p>`;
        }
        return text;
    }

    function getErgebnisseOptimierteT2PerformanceText(lang, publicationData, commonData) {
        const bfMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const bfGesamtDef = publicationData?.Gesamt?.bruteforce_definition;
        const bfGesamtStats = publicationData?.Gesamt?.gueteT2_bruteforce;

        if (lang === 'de') {
            return `
                <p>Mittels Brute-Force-Optimierung wurden für jedes Kollektiv T2-Kriterien identifiziert, die die ${bfMetric} maximieren (Tabelle 5). Für das Gesamtkollektiv (N=${commonData.nGesamt}) wurde mit den Kriterien "${bfGesamtDef ? studyT2CriteriaManager.formatCriteriaForDisplay(bfGesamtDef.criteria, bfGesamtDef.logic) : 'N/A'}" eine AUC von ${fCI(bfGesamtStats?.auc, 3, false)} erreicht. Die spezifischen optimierten Kriterien und deren Performance für die Subgruppen sind ebenfalls in Tabelle 5 dargestellt.</p>
            `;
        } else {
            return `
                <p>Using brute-force optimization, T2 criteria that maximize ${bfMetric} were identified for each cohort (Table 5). For the overall cohort (n=${commonData.nGesamt}), the criteria "${bfGesamtDef ? studyT2CriteriaManager.formatCriteriaForDisplay(bfGesamtDef.criteria, bfGesamtDef.logic) : 'N/A'}" achieved an AUC of ${fCI(bfGesamtStats?.auc, 3, false, 'en')}. The specific optimized criteria and their performance for the subgroups are also presented in Table 5.</p>
            `;
        }
    }

    function getErgebnisseVergleichPerformanceText(lang, publicationData, commonData) {
        const asGesamt = publicationData?.Gesamt?.gueteAS;
        const t2AngewandtGesamt = publicationData?.Gesamt?.gueteT2_angewandt;
        const vergleichAngewandtGesamt = publicationData?.Gesamt?.vergleichASvsT2_angewandt;

        if (lang === 'de') {
            return `
                <p>Der direkte statistische Vergleich zwischen dem Avocado Sign und den aktuell im Tool angewandten T2-Kriterien im Gesamtkollektiv zeigte für die Accuracy einen p-Wert von ${getPValueText(vergleichAngewandtGesamt?.mcnemar?.pValue)} (McNemar-Test) und für die AUC einen p-Wert von ${getPValueText(vergleichAngewandtGesamt?.delong?.pValue)} (DeLong-Test). Dies deutet auf einen ${getStatisticalSignificanceText(vergleichAngewandtGesamt?.delong?.pValue) || 'N/A'} Unterschied in der Gesamtperformance hin. Abbildung 3 zeigt einen vergleichenden Überblick ausgewählter Metriken. Weitere Vergleiche, auch mit den Literatur- und optimierten Kriterien, sind in Tabelle 6 zusammengefasst.</p>
            `;
        } else {
             return `
                <p>The direct statistical comparison between the Avocado Sign and the currently applied T2 criteria in the overall cohort revealed a p-value of ${getPValueText(vergleichAngewandtGesamt?.mcnemar?.pValue, 'en')} for accuracy (McNemar's test) and a p-value of ${getPValueText(vergleichAngewandtGesamt?.delong?.pValue, 'en')} for AUC (DeLong's test). This indicates a ${getStatisticalSignificanceText(vergleichAngewandtGesamt?.delong?.pValue) || 'N/A'} difference in overall performance. Figure 3 provides a comparative overview of selected metrics. Further comparisons, including those with literature-based and optimized criteria, are summarized in Table 6.</p>
            `;
        }
    }


    function getSectionText(sectionId, lang, publicationData, kollektiveData, commonData) {
        switch (sectionId) {
            case 'methoden_studienanlage': return getMethodenStudienanlageText(lang, commonData);
            case 'methoden_patientenkollektiv': return getMethodenPatientenkollektivText(lang, publicationData, commonData);
            case 'methoden_mrt_protokoll': return getMethodenMRTProtokollText(lang, commonData);
            case 'methoden_as_definition': return getMethodenASDefinitionText(lang, commonData);
            case 'methoden_t2_definition': return getMethodenT2DefinitionText(lang, commonData, publicationData, kollektiveData);
            case 'methoden_referenzstandard': return getMethodenReferenzstandardText(lang, commonData);
            case 'methoden_statistische_analyse': return getMethodenStatistischeAnalyseText(lang, commonData);
            case 'ergebnisse_patientencharakteristika': return getErgebnissePatientencharakteristikaText(lang, publicationData, commonData);
            case 'ergebnisse_as_performance': return getErgebnisseASPerformanceText(lang, publicationData, commonData);
            case 'ergebnisse_literatur_t2_performance': return getErgebnisseLiteraturT2PerformanceText(lang, publicationData, commonData);
            case 'ergebnisse_optimierte_t2_performance': return getErgebnisseOptimierteT2PerformanceText(lang, publicationData, commonData);
            case 'ergebnisse_vergleich_performance': return getErgebnisseVergleichPerformanceText(lang, publicationData, commonData);
            default: return `<p class="text-warning">Text für Sektion '${sectionId}' (Sprache: ${lang}) noch nicht implementiert.</p>`;
        }
    }

    function getSectionTextAsMarkdown(sectionId, lang, publicationData, kollektiveData, commonData) {
        const htmlContent = getSectionText(sectionId, lang, publicationData, kollektiveData, commonData);
        let markdown = htmlContent
            .replace(/<p>/g, '\n')
            .replace(/<\/p>/g, '\n')
            .replace(/<strong>/g, '**')
            .replace(/<\/strong>/g, '**')
            .replace(/<em>/g, '*')
            .replace(/<\/em>/g, '*')
            .replace(/<i>/g, '*')
            .replace(/<\/i>/g, '*')
            .replace(/<ul>/g, '')
            .replace(/<\/ul>/g, '')
            .replace(/<ol>/g, '')
            .replace(/<\/ol>/g, '')
            .replace(/<li>/g, '\n* ')
            .replace(/<\/li>/g, '')
            .replace(/<br>/g, '\n')
            .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, (match, p1) => `\n${'#'.repeat(parseInt(match[2]))} ${p1}\n`)
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
        return markdown;
    }


    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown
    });

})();