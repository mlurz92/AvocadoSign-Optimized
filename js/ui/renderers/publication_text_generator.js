const publicationTextGenerator = (() => {

    function fValue(value, digits = 1, unit = '', placeholder = 'N/A') {
        const num = parseFloat(value);
        if (value === null || value === undefined || isNaN(num) || !isFinite(num)) return placeholder;
        return `${num.toFixed(digits)}${unit}`;
    }

    function fPercent(value, digits = 1, placeholder = 'N/A') {
        const num = parseFloat(value);
        if (value === null || value === undefined || isNaN(num) || !isFinite(num)) return placeholder;
        return `${(num * 100).toFixed(digits)}%`;
    }

    function fCI(metric, digits = 1, isPercent = true, lang = 'de', placeholder = 'N/A') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return placeholder;
        const valStr = isPercent ? fPercent(metric.value, digits, placeholder) : fValue(metric.value, digits, '', placeholder);
        if (valStr === placeholder) return placeholder;

        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper)) {
            const lowerStr = isPercent ? fPercent(metric.ci.lower, digits, '') : fValue(metric.ci.lower, digits, '', '');
            const upperStr = isPercent ? fPercent(metric.ci.upper, digits, '') : fValue(metric.ci.upper, digits, '', '');
            if (lowerStr === '' || upperStr === '') return valStr;
            const ciText = lang === 'de' ? '95% KI' : '95% CI';
            return `${valStr} (${ciText}: ${lowerStr} – ${upperStr})`;
        }
        return valStr;
    }

    function getPValueText(pValue, lang = 'de', placeholder = 'N/A') {
        if (pValue === null || pValue === undefined || isNaN(pValue)) return placeholder;
        if (pValue < 0.001) return lang === 'de' ? 'p < 0,001' : 'P < .001';
        // Ensure formatNumber is available or use fValue. Assuming fValue for self-containment or if formatNumber isn't passed/global.
        const pFormatted = fValue(pValue, 3, '', placeholder);
        return `p = ${pFormatted.replace('.', lang === 'de' ? ',' : '.')}`;
    }

    function getKollektivText(kollektivId, n, lang = 'de') {
        const name = getKollektivDisplayName(kollektivId, lang); // Assuming getKollektivDisplayName is globally available or passed
        const nText = lang === 'de' ? `(N=${n})` : `(n=${n})`;
        return `${name} ${nText}`;
    }

    function getMethodenStudienanlageText(lang, commonData) {
        const appVersion = commonData.appVersion || APP_CONFIG.APP_VERSION;
        const ethikPlaceholder = lang === 'de' ? "XYZ/2020, Ethikkommission der Sächsischen Landesärztekammer" : "XYZ/2020, Ethics Committee of the Saxon State Medical Association";
        const originalStudyAuthors = commonData.references?.lurzSchaefer2025 || "Lurz & Schäfer (2025)";

        if (lang === 'de') {
            return `
                <p>Diese Studie wurde als retrospektive Analyse prospektiv erhobener Daten eines monozentrischen Patientenkollektivs mit histologisch gesichertem Rektumkarzinom konzipiert. Das Patientenkollektiv und die zugrundeliegenden Bilddaten sind identisch mit jenen der initialen "Avocado Sign" Studie (${originalStudyAuthors}). Ziel der vorliegenden Untersuchung war ein umfassender Vergleich der diagnostischen Güte des Avocado Signs mit etablierten und optimierten T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status).</p>
                <p>Alle Analysen wurden mittels einer speziell für diese und vorhergehende Untersuchungen entwickelten, interaktiven Webanwendung (AvocadoSign Analyse Tool v${appVersion}, Leipzig, Deutschland) durchgeführt. Diese ermöglicht die flexible Definition und Anwendung von T2-Kriteriensets, die automatisierte Optimierung von Kriterien mittels eines Brute-Force-Algorithmus sowie die umfassende statistische Auswertung und Visualisierung der Ergebnisse. Die ursprüngliche Datenerhebung und diese weiterführende Analyse erfolgten in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki und wurden von der lokalen Ethikkommission genehmigt (Ethikvotum Nr. ${ethikPlaceholder}). Ein schriftliches Einverständnis aller Patienten für die ursprüngliche Datenerhebung und deren wissenschaftliche Auswertung lag vor.</p>
            `;
        } else {
            return `
                <p>This study was designed as a retrospective analysis of prospectively collected data from a single-center patient cohort with histologically confirmed rectal cancer. The patient cohort and underlying imaging data are identical to those of the initial "Avocado Sign" study (${originalStudyAuthors}). The objective of the present investigation was a comprehensive comparison of the diagnostic performance of the Avocado Sign with established and optimized T2-weighted morphological criteria for predicting mesorectal lymph node status (N-status).</p>
                <p>All analyses were performed using a custom-developed interactive web application (AvocadoSign Analysis Tool v${appVersion}, Leipzig, Germany), specifically enhanced for this and previous investigations. This tool allows for flexible definition and application of T2 criteria sets, automated optimization of criteria using a brute-force algorithm, and comprehensive statistical evaluation and visualization of results. The original data collection and this subsequent analysis were conducted in accordance with the principles of the Declaration of Helsinki and were approved by the local ethics committee (Ethics Vote No. ${ethikPlaceholder}). Written informed consent was obtained from all patients for the original data collection and its scientific evaluation.</p>
            `;
        }
    }

    function getMethodenPatientenkollektivText(lang, publicationData, commonData) {
        const pCharGesamt = publicationData?.Gesamt?.deskriptiv;
        const nGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const nNRCT = commonData.nNRCT || 'N/A';
        const nDirektOP = commonData.nDirektOP || 'N/A';
        const malePercent = pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten > 0 ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN;
        const nPlusPercentGesamt = pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten > 0 ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN;

        if (lang === 'de') {
            return `
                <p>Das Studienkollektiv umfasste ${nGesamt} konsekutive Patienten mit histologisch gesichertem Rektumkarzinom, die zwischen Januar 2020 und November 2023 am Klinikum St. Georg, Leipzig, behandelt wurden und in die Originalstudie zum Avocado Sign eingeschlossen waren. Von diesen erhielten ${nNRCT} Patienten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während ${nDirektOP} Patienten primär operiert wurden (Direkt-OP-Gruppe). Das mediane Alter betrug ${fValue(pCharGesamt?.alter?.median, 1)} Jahre (Range: ${fValue(pCharGesamt?.alter?.min, 0)}–${fValue(pCharGesamt?.alter?.max, 0)} Jahre), ${fPercent(malePercent, 0)} (${pCharGesamt?.geschlecht?.m || 0}/${pCharGesamt?.anzahlPatienten || 0}) waren männlich. Ein positiver N-Status (N+) fand sich bei ${fPercent(nPlusPercentGesamt, 0)} (${pCharGesamt?.nStatus?.plus || 0}/${pCharGesamt?.anzahlPatienten || 0}) der Patienten im Gesamtkollektiv. Detaillierte Patientencharakteristika sind in Tabelle 1 dargestellt.</p>
                <p>Die Ein- und Ausschlusskriterien entsprachen denen der ursprünglichen Avocado-Sign-Studie: Einschlusskriterien waren ein Alter von mindestens 18 Jahren und ein histologisch bestätigtes Rektumkarzinom. Ausschlusskriterien umfassten nicht resektable Tumoren und Kontraindikationen für eine MRT-Untersuchung.</p>
            `;
        } else {
            return `
                <p>The study cohort comprised ${nGesamt} consecutive patients with histologically confirmed rectal cancer treated at Klinikum St. Georg, Leipzig, between January 2020 and November 2023, who were included in the original Avocado Sign study. Of these, ${nNRCT} patients received neoadjuvant chemoradiotherapy (nCRT group), while ${nDirektOP} patients underwent primary surgery (upfront surgery group). The median age was ${fValue(pCharGesamt?.alter?.median, 1)} years (range: ${fValue(pCharGesamt?.alter?.min, 0)}–${fValue(pCharGesamt?.alter?.max, 0)} years), and ${fPercent(malePercent, 0)} (${pCharGesamt?.geschlecht?.m || 0}/${pCharGesamt?.anzahlPatienten || 0}) were male. A positive N-status (N+) was found in ${fPercent(nPlusPercentGesamt, 0)} (${pCharGesamt?.nStatus?.plus || 0}/${pCharGesamt?.anzahlPatienten || 0}) of patients in the overall cohort. Detailed patient characteristics are presented in Table 1.</p>
                <p>Inclusion and exclusion criteria were identical to those of the original Avocado Sign study: Inclusion criteria were an age of at least 18 years and histologically confirmed rectal cancer. Exclusion criteria included unresectable tumors and contraindications to MRI examination.</p>
            `;
        }
    }

    function getMethodenMRTProtokollText(lang, commonData) {
        const originalStudyAuthors = commonData.references?.lurzSchaefer2025 || "Lurz & Schäfer (2025)";
         if (lang === 'de') {
            return `
                <p>Alle MRT-Untersuchungen wurden an einem 3.0-Tesla-System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Deutschland) unter Verwendung von Körper- und Wirbelsäulen-Array-Spulen durchgeführt. Das Bildgebungsprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Ebene sowie eine axiale diffusionsgewichtete Sequenz (DWI). Für die Bewertung des Avocado Signs wurde, wie in der Originalstudie (${originalStudyAuthors}) beschrieben, eine kontrastmittelverstärkte axiale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung akquiriert. Die genauen Sequenzparameter sind in der Originalpublikation zum Avocado Sign detailliert.</p>
                <p>Ein makrozyklisches Gadolinium-basiertes Kontrastmittel (Gadoteridol; ProHance; Bracco, Mailand, Italien) wurde gewichtsadaptiert (0,2 ml/kg Körpergewicht) intravenös verabreicht. Die kontrastmittelverstärkten Aufnahmen erfolgten unmittelbar nach vollständiger Applikation des Kontrastmittels. Butylscopolamin wurde zu Beginn und in der Mitte jeder Untersuchung zur Reduktion von Bewegungsartefakten appliziert. Das Bildgebungsprotokoll war für die primäre Staging-Untersuchung und die Restaging-Untersuchung (bei nRCT-Patienten) identisch.</p>
            `;
        } else {
            return `
                <p>All MRI examinations were performed on a 3.0-Tesla system (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Germany) using body and spine array coils. The imaging protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal planes, as well as axial diffusion-weighted imaging (DWI). For the assessment of the Avocado Sign, as described in the original study (${originalStudyAuthors}), a contrast-enhanced axial T1-weighted volumetric interpolated breath-hold examination (VIBE) with Dixon fat suppression was acquired. Detailed sequence parameters are provided in the original Avocado Sign publication.</p>
                <p>A macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco, Milan, Italy) was administered intravenously at a weight-based dose (0.2 mL/kg body weight). Contrast-enhanced images were acquired immediately after the full administration of the contrast agent. Butylscopolamine was administered at the beginning and midpoint of each examination to reduce motion artifacts. The imaging protocol was identical for baseline staging and restaging examinations (in nCRT patients).</p>
            `;
        }
    }

    function getMethodenASDefinitionText(lang, commonData) {
        const radiologist1Exp = 7;
        const radiologist2Exp = 29;
        const originalStudyAuthors = commonData.references?.lurzSchaefer2025 || "Lurz & Schäfer (2025)";
        if (lang === 'de') {
            return `
                <p>Das Avocado Sign wurde, wie in der Originalstudie (${originalStudyAuthors}) definiert, auf den kontrastmittelverstärkten T1-gewichteten Bildern evaluiert. Es wurde als ein hypointenser Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens definiert, unabhängig von Größe oder Form des Lymphknotens. Die Bewertung erfolgte für alle sichtbaren mesorektalen Lymphknoten. Ein Patient wurde als Avocado-Sign-positiv (AS+) eingestuft, wenn mindestens ein Lymphknoten dieses Zeichen aufwies. Die Bildanalyse wurde von zwei erfahrenen Radiologen (ML, Radiologe mit ${radiologist1Exp} Jahren Erfahrung in der abdominellen MRT; AOS, Radiologe mit ${radiologist2Exp} Jahren Erfahrung in der abdominellen MRT) unabhängig und verblindet gegenüber den histopathologischen Ergebnissen sowie den Ergebnissen der T2-Kriterien-Analyse durchgeführt. Diskrepanzen wurden im Konsens mit einem dritten, ebenfalls erfahrenen Radiologen gelöst.</p>
            `;
        } else {
            return `
                <p>The Avocado Sign was evaluated on contrast-enhanced T1-weighted images as defined in the original study (${originalStudyAuthors}). It was defined as a hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape. Assessment was performed for all visible mesorectal lymph nodes. A patient was classified as Avocado-Sign-positive (AS+) if at least one lymph node exhibited this sign. Image analysis was performed independently by two experienced radiologists (ML, radiologist with ${radiologist1Exp} years of experience in abdominal MRI; AOS, radiologist with ${radiologist2Exp} years of experience in abdominal MRI), blinded to the histopathological results and the results of the T2 criteria analysis. Discrepancies were resolved by consensus with a third experienced radiologist.</p>
            `;
        }
    }

    function getMethodenT2DefinitionText(lang, commonData, publicationData, kollektiveData) {
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
        const appliedLogic = t2CriteriaManager.getAppliedLogic();
        const formattedAppliedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false, lang);
        const appName = commonData.appName || "AvocadoSign Analyse Tool";
        const appVersion = commonData.appVersion || APP_CONFIG.APP_VERSION;
        const langKey = lang === 'en' ? 'en' : 'de';

        const bfMetricForPub = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const getBFDescription = (kollektivId, langParam) => {
            const bfData = kollektiveData?.[kollektivId]?.bruteforce_definition;
            if (bfData && bfData.criteria && bfData.metricName === bfMetricForPub) {
                const criteriaText = studyT2CriteriaManager.formatCriteriaForDisplay(bfData.criteria, bfData.logic, false, langParam);
                const metricValText = fValue(bfData.metricValue, 4);
                const kollektivDisplayName = getKollektivDisplayName(kollektivId, langParam);
                if (langParam === 'de') return `<li><strong>${kollektivDisplayName}:</strong> ${criteriaText} (Ziel: ${bfData.metricName}, Wert: ${metricValText})</li>`;
                return `<li><strong>${kollektivDisplayName}:</strong> ${criteriaText} (Target: ${bfData.metricName}, Value: ${metricValText})</li>`;
            }
            const fallbackText = langParam === 'de' ? `Keine Optimierungsergebnisse für Zielmetrik ${bfMetricForPub} verfügbar.` : `No optimization results available for target metric ${bfMetricForPub}.`;
            return `<li><strong>${getKollektivDisplayName(kollektivId, langParam)}:</strong> ${fallbackText}</li>`;
        };

        let bfCriteriaTextList = '<ul>';
        bfCriteriaTextList += getBFDescription('Gesamt', langKey);
        bfCriteriaTextList += getBFDescription('direkt OP', langKey);
        bfCriteriaTextList += getBFDescription('nRCT', langKey);
        bfCriteriaTextList += '</ul>';

        const kohDesc = studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology');
        const kohDisplayText = kohDesc ? studyT2CriteriaManager.formatStudyCriteriaForDisplay(kohDesc, langKey) : (langKey === 'de' ? 'Koh et al. (2008): Irreguläre Kontur ODER heterogenes Signal' : 'Koh et al. (2008): Irregular border OR heterogeneous internal signal');

        const barbaroDesc = studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging');
        const barbaroDisplayText = barbaroDesc ? studyT2CriteriaManager.formatStudyCriteriaForDisplay(barbaroDesc, langKey) : (langKey === 'de' ? 'Barbaro et al. (2024): Kurzachse ≥ 2,3mm' : 'Barbaro et al. (2024): Short-axis diameter ≥ 2.3mm');

        const esgarDesc = studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar');
        const esgarDisplayText = esgarDesc ? (langKey === 'de' ? esgarDesc.description : "ESGAR 2016 criteria for primary staging: Size ≥ 9mm OR (Size 5-8mm AND ≥2 features [round, irregular, heterogeneous]) OR (Size < 5mm AND ALL 3 features [round, irregular, heterogeneous]).") : (langKey === 'de' ? 'ESGAR Konsensus Kriterien (2016), evaluiert durch Rutegård et al. (2025): Komplexe größenabhängige morphologische Regeln' : 'ESGAR Consensus Criteria (2016), evaluated by Rutegård et al. (2025): Complex size-dependent morphological rules');


        if (lang === 'de') {
            return `
                <p>Die morphologischen T2-Kriterien wurden auf hochauflösenden T2-gewichteten Sequenzen für jeden im T2-MRT sichtbaren mesorektalen Lymphknoten evaluiert. Die Bewertung der einzelnen T2-Merkmale (Größe, Form, Kontur, Homogenität, Signalintensität) erfolgte durch denselben erfahrenen Radiologen (ML), der auch die Avocado-Sign-Bewertung durchführte, verblindet gegenüber dem AS-Status und den histopathologischen Ergebnissen. Für den Vergleich der diagnostischen Güte wurden folgende Kriteriensets herangezogen:</p>
                <ol>
                    <li><strong>Benutzerdefiniert angewandte T2-Kriterien:</strong> Die über die Benutzeroberfläche der Analyseanwendung (${appName} v${appVersion}) zum Zeitpunkt der finalen Auswertung global konfigurierten und auf alle Kollektive angewendeten Kriterien. Diese Einstellung war: ${formattedAppliedCriteria}. Diese werden im Folgenden als "Angewandte T2-Kriterien" bezeichnet.</li>
                    <li><strong>Literatur-basierte T2-Kriteriensets:</strong>
                        <ul>
                            <li>Koh et al. (2008) [${commonData.references.koh2008.split('(')[1].split(')')[0]}]: "${kohDesc?.description || UI_TEXTS.t2CriteriaValues.irregulär[langKey] + ' ' + UI_TEXTS.t2LogicDisplayNames.ODER[langKey] + ' ' + UI_TEXTS.t2CriteriaValues.heterogen[langKey] + 'es Signal'}". Diese Kriterien wurden für die vorliegende Analyse auf das Gesamtkollektiv angewendet.</li>
                            <li>Barbaro et al. (2024) [${commonData.references.barbaro2024.split('(')[1].split(')')[0]}]: "${barbaroDesc?.description || UI_TEXTS.t2CriteriaLongPrefix.size[langKey] + '≥ 2,3mm'}". Diese Kriterien wurden auf die nRCT-Kohorte für das Restaging angewendet.</li>
                            <li>ESGAR Konsensus Kriterien (Beets-Tan et al., 2018 [${commonData.references.beetsTan2018ESGAR.split('(')[1].split(')')[0]}]), evaluiert durch Rutegård et al. (2025 [${commonData.references.rutegard2025.split('(')[1].split(')')[0]}]): "${esgarDesc?.description || 'Komplexe größenabhängige morphologische Regeln'}". Diese Kriterien wurden primär auf die Direkt-OP-Kohorte für das Primärstaging angewendet.</li>
                        </ul>
                        Eine detaillierte Übersicht dieser Literatur-Kriterien und ihrer spezifischen Anwendungskontexte findet sich in Tabelle 2.
                    </li>
                    <li><strong>Brute-Force optimierte T2-Kriterien:</strong> Für jedes Patientenkollektiv (Gesamt, Direkt OP, nRCT) wurden mittels eines integrierten Brute-Force-Algorithmus der Analyseanwendung diejenigen T2-Kriterien (Kombination aus Größe [Bereich ${fValue(commonData.t2SizeMin,1)}-${fValue(commonData.t2SizeMax,1)}mm, Schritt ${fValue(commonData.t2SizeStep,1)}mm], Form, Kontur, Homogenität, Signal und UND/ODER-Logik) identifiziert, welche die Zielmetrik '${bfMetricForPub}' maximieren. Die resultierenden optimierten Kriterien für die jeweilige Kohorte waren:
                        ${bfCriteriaTextList}
                         Diese werden im Folgenden als "Optimierte T2-Kriterien ([Kollektiv])" bezeichnet.
                    </li>
                </ol>
                <p>Ein Lymphknoten wurde als T2-positiv gewertet, wenn er die Bedingungen des jeweiligen Kriteriensets erfüllte. Ein Patient galt als T2-positiv für ein bestimmtes Kriterienset, wenn mindestens ein Lymphknoten dieses Patienten gemäß diesem Set als positiv bewertet wurde.</p>
            `;
        } else {
            return `
                <p>Morphological T2 criteria were evaluated on high-resolution T2-weighted sequences for each visible mesorectal lymph node on T2-weighted MRI. The assessment of individual T2 features (size, shape, border, homogeneity, signal intensity) was performed by the same experienced radiologist (ML) who also performed the Avocado Sign assessment, blinded to the AS status and histopathological results. The following criteria sets were used for diagnostic performance comparison:</p>
                <ol>
                    <li><strong>User-defined applied T2 criteria:</strong> The criteria globally configured via the user interface of the analysis application (${appName} v${appVersion}) at the time of final analysis and applied to all cohorts. This setting was: ${formattedAppliedCriteria}. These are referred to as "Applied T2 Criteria" hereafter.</li>
                    <li><strong>Literature-based T2 criteria sets:</strong>
                        <ul>
                            <li>Koh et al. (2008) [${commonData.references.koh2008.split('(')[1].split(')')[0]}]: "${kohDesc?.studyInfo?.keyCriteriaSummary || UI_TEXTS.t2CriteriaValues.irregulär[langKey] + ' ' + UI_TEXTS.t2LogicDisplayNames.ODER[langKey] + ' ' + UI_TEXTS.t2CriteriaValues.heterogen[langKey] + ' signal'}". These criteria were applied to the overall cohort for the present analysis.</li>
                            <li>Barbaro et al. (2024) [${commonData.references.barbaro2024.split('(')[1].split(')')[0]}]: "${barbaroDesc?.studyInfo?.keyCriteriaSummary || UI_TEXTS.t2CriteriaLongPrefix.size[langKey] + '≥ 2.3mm'}". These criteria were applied to the nCRT cohort for restaging.</li>
                            <li>ESGAR Consensus Criteria (Beets-Tan et al., 2018 [${commonData.references.beetsTan2018ESGAR.split('(')[1].split(')')[0]}]), as evaluated by Rutegård et al. (2025 [${commonData.references.rutegard2025.split('(')[1].split(')')[0]}]): "${esgarDesc?.studyInfo?.keyCriteriaSummary || 'Complex size-dependent morphological rules'}". These criteria were primarily applied to the upfront surgery cohort for primary staging.</li>
                        </ul>
                        A detailed overview of these literature-based criteria and their specific application contexts is provided in Table 2.
                    </li>
                    <li><strong>Brute-force optimized T2 criteria:</strong> For each patient cohort (Overall, Upfront Surgery, nCRT), T2 criteria (combination of size [range ${fValue(commonData.t2SizeMin,1)}-${fValue(commonData.t2SizeMax,1)}mm, step ${fValue(commonData.t2SizeStep,1)}mm], shape, border, homogeneity, signal, and AND/OR logic) that maximize the target metric '${bfMetricForPub}' were identified using an integrated brute-force algorithm of the analysis application. The resulting optimized criteria for each cohort were:
                        ${bfCriteriaTextList}
                        These are referred to as "Optimized T2 Criteria ([Cohort])" hereafter.
                    </li>
                </ol>
                <p>A lymph node was considered T2-positive if it met the conditions of the respective criteria set. A patient was considered T2-positive for a specific criteria set if at least one lymph node of that patient was rated positive according to that set.</p>
            `;
        }
    }

    function getMethodenReferenzstandardText(lang, commonData) {
         if (lang === 'de') {
            return `
                <p>Die histopathologische Untersuchung der Operationspräparate diente als Referenzstandard für den N-Status. Alle mesorektalen Lymphknoten wurden gemäß den Standardprotokollen aufgearbeitet und durch erfahrene Pathologen bewertet. Der N-Status eines Patienten wurde als positiv (N+) definiert, wenn mindestens ein Lymphknoten histologisch als metastatisch befallen identifiziert wurde. Andernfalls galt der Patient als N-negativ (N0).</p>
            `;
        } else {
            return `
                <p>Histopathological examination of the surgical specimens served as the reference standard for N-status. All mesorectal lymph nodes were processed and evaluated by experienced pathologists according to standard protocols. A patient's N-status was defined as positive (N+) if at least one lymph node was histologically identified as metastatic. Otherwise, the patient was considered N-negative (N0).</p>
            `;
        }
    }

    function getMethodenStatistischeAnalyseText(lang, commonData) {
        const alpha = (commonData.significanceLevel * 100) || 5;
        const bootstrapN = commonData.bootstrapReplications || 1000;
        const appName = commonData.appName || "AvocadoSign Analyse Tool";
        const appVersion = commonData.appVersion || APP_CONFIG.APP_VERSION;

        if (lang === 'de') {
            return `
                <p>Die deskriptive Statistik umfasste die Berechnung von Medianen, Mittelwerten, Standardabweichungen (SD), Minima und Maxima für kontinuierliche Variablen sowie Häufigkeiten und Prozentanteile für kategoriale Daten. Die diagnostische Güte des Avocado Signs und der verschiedenen T2-Kriteriensets wurde anhand von Sensitivität, Spezifität, positivem prädiktiven Wert (PPV), negativem prädiktiven Wert (NPV), Accuracy (ACC) und der Fläche unter der Receiver Operating Characteristic-Kurve (AUC) – äquivalent zur Balanced Accuracy (BalAcc) für binäre Tests – evaluiert. Für diese Metriken wurden 95%-Konfidenzintervalle (KI) berechnet, wobei für Proportionen das Wilson-Score-Intervall und für AUC/BalAcc sowie den F1-Score die Bootstrap-Perzentil-Methode (mit ${bootstrapN} Replikationen) verwendet wurde.</p>
                <p>Der statistische Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe erfolgte mittels des McNemar-Tests für gepaarte nominale Daten bzw. des DeLong-Tests für den Vergleich von AUC-Werten. Assoziationen zwischen kategorialen Merkmalen und dem N-Status wurden mittels Fisher's Exact Test untersucht; für kontinuierliche Merkmale (Lymphknotengröße) wurde der Mann-Whitney-U-Test herangezogen. Odds Ratios (OR) und Risk Differences (RD) wurden mit 95% KIs berechnet. Ein p-Wert < ${fValue(commonData.significanceLevel,2).replace('.',',')} wurde als statistisch signifikant interpretiert. Alle statistischen Analysen wurden mit der oben genannten Webanwendung (${appName} v${appVersion}) durchgeführt.</p>
            `;
        } else {
            return `
                <p>Descriptive statistics included the calculation of medians, means, standard deviations (SD), minima, and maxima for continuous variables, as well as frequencies and percentages for categorical data. The diagnostic performance of the Avocado Sign and the various T2 criteria sets was evaluated using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy (ACC), and the area under the Receiver Operating Characteristic curve (AUC)—equivalent to Balanced Accuracy (BalAcc) for binary tests. 95% confidence intervals (CI) were calculated for these metrics, using the Wilson score interval for proportions and the bootstrap percentile method (with ${bootstrapN} replications) for AUC/BalAcc and F1-score.</p>
                <p>Statistical comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group was performed using McNemar's test for paired nominal data and DeLong's test for AUC comparison. Associations between categorical features and N-status were examined using Fisher's Exact Test; for continuous features (lymph node size), the Mann-Whitney U test was used. Odds Ratios (OR) and Risk Differences (RD) were calculated with 95% CIs. A p-value < ${fValue(commonData.significanceLevel,2)} was considered statistically significant. All statistical analyses were conducted using the aforementioned web application (${appName} v${appVersion}).</p>
            `;
        }
    }

    function getErgebnissePatientencharakteristikaText(lang, publicationData, commonData) {
        const pCharGesamt = publicationData?.Gesamt?.deskriptiv;
        const nGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const nNRCT = commonData.nNRCT || 'N/A';
        const nDirektOP = commonData.nDirektOP || 'N/A';
        const malePercent = pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten > 0 ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN;
        const nPlusPercentGesamt = pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten > 0 ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN;
        const langKey = lang === 'en' ? 'en' : 'de';

        if (lang === 'de') {
            return `
                <p>Die Charakteristika der ${nGesamt} in die Analyse eingeschlossenen Patienten sind in Tabelle 1 zusammengefasst. Das mediane Alter im Gesamtkollektiv betrug ${fValue(pCharGesamt?.alter?.median, 1)} Jahre (Range ${fValue(pCharGesamt?.alter?.min, 0)}–${fValue(pCharGesamt?.alter?.max, 0)}), ${fPercent(malePercent,0)} waren männlich. Ein pathologisch positiver N-Status (N+) wurde bei ${fPercent(nPlusPercentGesamt,0)} der Patienten im Gesamtkollektiv festgestellt. Die Direkt-OP-Gruppe umfasste ${nDirektOP} Patienten, die nRCT-Gruppe ${nNRCT} Patienten. Die Abbildungen 1a und 1b zeigen die Alters- und Geschlechterverteilung für das ${getKollektivDisplayName(commonData.currentKollektivName, langKey)}.</p>
            `;
        } else {
            return `
                <p>The characteristics of the ${nGesamt} patients included in the analysis are summarized in Table 1. The median age in the overall cohort was ${fValue(pCharGesamt?.alter?.median, 1)} years (range ${fValue(pCharGesamt?.alter?.min, 0)}–${fValue(pCharGesamt?.alter?.max, 0)}), and ${fPercent(malePercent,0)} were male. A pathologically positive N-status (N+) was found in ${fPercent(nPlusPercentGesamt,0)} of patients in the overall cohort. The upfront surgery group comprised ${nDirektOP} patients, and the nCRT group ${nNRCT} patients. Figures 1a and 1b show the age and gender distribution for the ${getKollektivDisplayName(commonData.currentKollektivName, langKey)}.</p>
            `;
        }
    }

    function getErgebnisseASPerformanceText(lang, publicationData, commonData) {
        const asGesamt = publicationData?.Gesamt?.gueteAS;
        const asDirektOP = publicationData?.['direkt OP']?.gueteAS;
        const asNRCT = publicationData?.nRCT?.gueteAS;
        const langKey = lang === 'en' ? 'en' : 'de';

        if (lang === 'de') {
            return `
                <p>Die diagnostische Güte des Avocado Signs zur Vorhersage des pathologischen N-Status ist für die verschiedenen Kollektive in Tabelle 3 detailliert aufgeführt. Im Gesamtkollektiv (N=${commonData.nGesamt}) erreichte das Avocado Sign eine Sensitivität von ${fCI(asGesamt?.sens, 1, true, langKey)}, eine Spezifität von ${fCI(asGesamt?.spez, 1, true, langKey)}, einen PPV von ${fCI(asGesamt?.ppv, 1, true, langKey)}, einen NPV von ${fCI(asGesamt?.npv, 1, true, langKey)} und eine Accuracy von ${fCI(asGesamt?.acc, 1, true, langKey)}. Die AUC betrug ${fCI(asGesamt?.auc, 3, false, langKey)}.</p>
                <p>In der Subgruppe der primär operierten Patienten (Direkt-OP, N=${commonData.nDirektOP}) zeigte das Avocado Sign eine Sensitivität von ${fCI(asDirektOP?.sens, 1, true, langKey)} und eine Spezifität von ${fCI(asDirektOP?.spez, 1, true, langKey)} (AUC: ${fCI(asDirektOP?.auc, 3, false, langKey)}). Bei Patienten nach nRCT (nRCT-Gruppe, N=${commonData.nNRCT}) betrug die Sensitivität ${fCI(asNRCT?.sens, 1, true, langKey)} und die Spezifität ${fCI(asNRCT?.spez, 1, true, langKey)} (AUC: ${fCI(asNRCT?.auc, 3, false, langKey)}).</p>
                <p>Die Abbildungen 2a und 2b visualisieren die diagnostische Leistung des Avocado Signs im Vergleich zu den angewandten T2-Kriterien für das ${getKollektivDisplayName(commonData.currentKollektivName, langKey)} mittels ROC-Analyse und Balkendiagramm.</p>
            `;
        } else {
            return `
                <p>The diagnostic performance of the Avocado Sign for predicting pathological N-status is detailed for the different cohorts in Table 3. In the overall cohort (n=${commonData.nGesamt}), the Avocado Sign achieved a sensitivity of ${fCI(asGesamt?.sens, 1, true, langKey)}, a specificity of ${fCI(asGesamt?.spez, 1, true, langKey)}, a PPV of ${fCI(asGesamt?.ppv, 1, true, langKey)}, an NPV of ${fCI(asGesamt?.npv, 1, true, langKey)}, and an accuracy of ${fCI(asGesamt?.acc, 1, true, langKey)}. The AUC was ${fCI(asGesamt?.auc, 3, false, langKey)}.</p>
                <p>In the subgroup of patients undergoing upfront surgery (Upfront Surgery, n=${commonData.nDirektOP}), the Avocado Sign showed a sensitivity of ${fCI(asDirektOP?.sens, 1, true, langKey)} and a specificity of ${fCI(asDirektOP?.spez, 1, true, langKey)} (AUC: ${fCI(asDirektOP?.auc, 3, false, langKey)}). For patients after nCRT (nCRT group, n=${commonData.nNRCT}), the sensitivity was ${fCI(asNRCT?.sens, 1, true, langKey)} and the specificity was ${fCI(asNRCT?.spez, 1, true, langKey)} (AUC: ${fCI(asNRCT?.auc, 3, false, langKey)}).</p>
                <p>Figures 2a and 2b visualize the diagnostic performance of the Avocado Sign compared to the applied T2 criteria for the ${getKollektivDisplayName(commonData.currentKollektivName, langKey)} using ROC analysis and bar chart, respectively.</p>
            `;
        }
    }

    function getErgebnisseLiteraturT2PerformanceText(lang, publicationData, commonData) {
        let text = '';
        const langKey = lang === 'en' ? 'en' : 'de';
        const kohData = publicationData?.Gesamt?.gueteT2_literatur?.['koh_2008_morphology'];
        const barbaroData = publicationData?.nRCT?.gueteT2_literatur?.['barbaro_2024_restaging'];
        const esgarData = publicationData?.['direkt OP']?.gueteT2_literatur?.['rutegard_et_al_esgar'];

        if (lang === 'de') {
            text += `<p>Die diagnostische Güte der etablierten Literatur-basierten T2-Kriteriensets wurde für die jeweils relevanten Kollektive evaluiert (detailliert in Tabelle 4). `;
            text += `Für das Kriterienset nach Koh et al. (2008) [${commonData.references.koh2008.split('(')[1].split(')')[0]}], angewendet auf das Gesamtkollektiv (N=${commonData.nGesamt}), ergab sich eine Sensitivität von ${fCI(kohData?.sens, 1, true, langKey)}, eine Spezifität von ${fCI(kohData?.spez, 1, true, langKey)} und eine AUC von ${fCI(kohData?.auc, 3, false, langKey)}. `;
            text += `Die Kriterien nach Barbaro et al. (2024) [${commonData.references.barbaro2024.split('(')[1].split(')')[0]}], angewendet auf die nRCT-Kohorte (N=${commonData.nNRCT}), zeigten eine Sensitivität von ${fCI(barbaroData?.sens, 1, true, langKey)}, eine Spezifität von ${fCI(barbaroData?.spez, 1, true, langKey)} und eine AUC von ${fCI(barbaroData?.auc, 3, false, langKey)}. `;
            text += `Die ESGAR 2016 Kriterien (evaluiert durch Rutegård et al., 2025 [${commonData.references.rutegard2025.split('(')[1].split(')')[0]}]), angewendet auf die Direkt-OP-Kohorte (N=${commonData.nDirektOP}), erreichten eine Sensitivität von ${fCI(esgarData?.sens, 1, true, langKey)}, eine Spezifität von ${fCI(esgarData?.spez, 1, true, langKey)} und eine AUC von ${fCI(esgarData?.auc, 3, false, langKey)}.</p>`;
        } else {
            text += `<p>The diagnostic performance of established literature-based T2 criteria sets was evaluated for the respective relevant cohorts (detailed in Table 4). `;
            text += `For the criteria set according to Koh et al. (2008) [${commonData.references.koh2008.split('(')[1].split(')')[0]}], applied to the overall cohort (n=${commonData.nGesamt}), a sensitivity of ${fCI(kohData?.sens, 1, true, langKey)}, a specificity of ${fCI(kohData?.spez, 1, true, langKey)}, and an AUC of ${fCI(kohData?.auc, 3, false, langKey)} were observed. `;
            text += `The criteria by Barbaro et al. (2024) [${commonData.references.barbaro2024.split('(')[1].split(')')[0]}], applied to the nCRT cohort (n=${commonData.nNRCT}), showed a sensitivity of ${fCI(barbaroData?.sens, 1, true, langKey)}, a specificity of ${fCI(barbaroData?.spez, 1, true, langKey)}, and an AUC of ${fCI(barbaroData?.auc, 3, false, langKey)}. `;
            text += `The ESGAR 2016 criteria (evaluated by Rutegård et al., 2025 [${commonData.references.rutegard2025.split('(')[1].split(')')[0]}]), applied to the upfront surgery cohort (n=${commonData.nDirektOP}), achieved a sensitivity of ${fCI(esgarData?.sens, 1, true, langKey)}, a specificity of ${fCI(esgarData?.spez, 1, true, langKey)}, and an AUC of ${fCI(esgarData?.auc, 3, false, langKey)}.</p>`;
        }
        return text;
    }

    function getErgebnisseOptimierteT2PerformanceText(lang, publicationData, commonData) {
        const bfMetricForPub = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const langKey = lang === 'en' ? 'en' : 'de';

        const bfGesamtDef = publicationData?.Gesamt?.bruteforce_definition;
        const bfGesamtStats = publicationData?.Gesamt?.gueteT2_bruteforce;
        const bfDirektOPDef = publicationData?.['direkt OP']?.bruteforce_definition;
        const bfDirektOPStats = publicationData?.['direkt OP']?.gueteT2_bruteforce;
        const bfNRCTDef = publicationData?.nRCT?.bruteforce_definition;
        const bfNRCTStats = publicationData?.nRCT?.gueteT2_bruteforce;

        const formatBFDefText = (def) => def ? studyT2CriteriaManager.formatCriteriaForDisplay(def.criteria, def.logic, false, langKey) : 'N/A';

        if (lang === 'de') {
            return `
                <p>Mittels Brute-Force-Optimierung wurden für jedes Kollektiv T2-Kriteriensets identifiziert, die die Zielmetrik '${bfMetricForPub}' maximieren (detailliert in Tabelle 5). Für das Gesamtkollektiv (N=${commonData.nGesamt}) wurde mit den optimierten Kriterien "${formatBFDefText(bfGesamtDef)}" eine Sensitivität von ${fCI(bfGesamtStats?.sens, 1, true, langKey)}, eine Spezifität von ${fCI(bfGesamtStats?.spez, 1, true, langKey)} und eine AUC von ${fCI(bfGesamtStats?.auc, 3, false, langKey)} erreicht (Zielmetrik '${bfMetricForPub}': ${fValue(bfGesamtDef?.metricValue,4)}). Für die Direkt-OP-Gruppe (N=${commonData.nDirektOP}) lauteten die optimierten Kriterien "${formatBFDefText(bfDirektOPDef)}" und erzielten eine AUC von ${fCI(bfDirektOPStats?.auc, 3, false, langKey)} (Zielmetrik '${bfMetricForPub}': ${fValue(bfDirektOPDef?.metricValue,4)}). In der nRCT-Gruppe (N=${commonData.nNRCT}) waren die optimierten Kriterien "${formatBFDefText(bfNRCTDef)}" mit einer AUC von ${fCI(bfNRCTStats?.auc, 3, false, langKey)} (Zielmetrik '${bfMetricForPub}': ${fValue(bfNRCTDef?.metricValue,4)}).</p>
            `;
        } else {
            return `
                <p>Using brute-force optimization, T2 criteria sets that maximize the target metric '${bfMetricForPub}' were identified for each cohort (detailed in Table 5). For the overall cohort (n=${commonData.nGesamt}), the optimized criteria "${formatBFDefText(bfGesamtDef)}" achieved a sensitivity of ${fCI(bfGesamtStats?.sens, 1, true, langKey)}, a specificity of ${fCI(bfGesamtStats?.spez, 1, true, langKey)}, and an AUC of ${fCI(bfGesamtStats?.auc, 3, false, langKey)} (Target metric '${bfMetricForPub}': ${fValue(bfGesamtDef?.metricValue,4)}). For the upfront surgery group (n=${commonData.nDirektOP}), the optimized criteria were "${formatBFDefText(bfDirektOPDef)}", achieving an AUC of ${fCI(bfDirektOPStats?.auc, 3, false, langKey)} (Target metric '${bfMetricForPub}': ${fValue(bfDirektOPDef?.metricValue,4)}). In the nCRT group (n=${commonData.nNRCT}), the optimized criteria were "${formatBFDefText(bfNRCTDef)}" with an AUC of ${fCI(bfNRCTStats?.auc, 3, false, langKey)} (Target metric '${bfMetricForPub}': ${fValue(bfNRCTDef?.metricValue,4)}).</p>
            `;
        }
    }

    function getErgebnisseVergleichPerformanceText(lang, publicationData, commonData) {
        const langKey = lang === 'en' ? 'en' : 'de';
        const vergleichAngewandtGesamt = publicationData?.Gesamt?.vergleichASvsT2_angewandt;
        const pMcNemarGesamt = vergleichAngewandtGesamt?.mcnemar?.pValue;
        const pDeLongGesamt = vergleichAngewandtGesamt?.delong?.pValue;
        const sigLevel = commonData.significanceLevel;

        if (lang === 'de') {
            return `
                <p>Im direkten statistischen Vergleich zwischen dem Avocado Sign und den global angewandten T2-Kriterien im Gesamtkollektiv (N=${commonData.nGesamt}) zeigte sich für die Accuracy ein ${pMcNemarGesamt !== null && !isNaN(pMcNemarGesamt) ? ( getStatisticalSignificanceText(pMcNemarGesamt, sigLevel, langKey) + " Unterschied (McNemar-Test: " + getPValueText(pMcNemarGesamt, langKey) + ")") : "nicht evaluierbarer Unterschied (McNemar-Test: N/A)"}. Für die AUC betrug der Unterschied ${pDeLongGesamt !== null && !isNaN(pDeLongGesamt) ? (getStatisticalSignificanceText(pDeLongGesamt, sigLevel, langKey) + " (DeLong-Test: " + getPValueText(pDeLongGesamt, langKey) + ")") : "nicht evaluierbar (DeLong-Test: N/A)"}. Die Abbildungen 2a und 2b visualisieren exemplarisch die ROC-Analyse bzw. einen Metrikvergleich für das ${getKollektivDisplayName(commonData.currentKollektivName, langKey)}. Ausführliche paarweise Vergleiche der diagnostischen Güte zwischen dem Avocado Sign und den verschiedenen T2-Kriteriensets (angewandt, Literatur-basiert, optimiert) für alle drei Kollektive (Gesamt, Direkt OP, nRCT) sind in Tabelle 6 dargestellt.</p>
            `;
        } else {
             return `
                <p>In the direct statistical comparison between the Avocado Sign and the globally applied T2 criteria in the overall cohort (n=${commonData.nGesamt}), the difference in accuracy was ${pMcNemarGesamt !== null && !isNaN(pMcNemarGesamt) ? (getStatisticalSignificanceText(pMcNemarGesamt, sigLevel, langKey) + " (McNemar's test: " + getPValueText(pMcNemarGesamt, langKey) + ")") : "not evaluable (McNemar's test: N/A)"}. For the AUC, the difference was ${pDeLongGesamt !== null && !isNaN(pDeLongGesamt) ? (getStatisticalSignificanceText(pDeLongGesamt, sigLevel, langKey) + " (DeLong's test: " + getPValueText(pDeLongGesamt, langKey) + ")") : "not evaluable (DeLong's test: N/A)"}. Figures 2a and 2b exemplarily visualize the ROC analysis and a metric comparison, respectively, for the ${getKollektivDisplayName(commonData.currentKollektivName, langKey)}. Detailed pairwise comparisons of diagnostic performance between the Avocado Sign and the various T2 criteria sets (applied, literature-based, optimized) for all three cohorts (Overall, Upfront Surgery, nCRT) are presented in Table 6.</p>
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
            default:
                const langKey = lang === 'en' ? 'en' : 'de';
                const fallbackText = langKey === 'de' ? "Text für Sektion nicht implementiert." : "Text for section not implemented.";
                return `<p class="text-warning">${fallbackText.replace('[SECTION_ID]', sectionId).replace('[LANG]', lang)}</p>`;
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
            .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, (match, p1) => {
                const level = parseInt(match.match(/<h([1-6])/)[1]);
                return `\n${'#'.repeat(level)} ${p1}\n`;
            })
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
        return markdown;
    }


    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown
    });

})();
