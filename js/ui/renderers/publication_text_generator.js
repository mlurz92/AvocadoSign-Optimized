const publicationTextGenerator = (() => {

    let currentLang = 'de';
    let currentAllStats = null;
    let currentCommonData = null;
    let currentOptions = null;

    function _initialize(lang, allKollektivStats, commonData, options) {
        currentLang = lang || 'de';
        currentAllStats = allKollektivStats;
        currentCommonData = commonData;
        currentOptions = options || {};
    }

    function _fCI(metricData, digits = 1, isPercent = true) {
        const langToUse = currentLang; // Use the module-scoped language
        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value)) return 'N/A';
        const placeholder = 'N/A';

        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return placeholder;
            return isP ? formatPercent(val, d, placeholder) : formatNumber(val, d, placeholder, langToUse === 'en');
        };

        const valStr = formatSingleValue(metricData.value, digits, isPercent);
        if (valStr === placeholder) return valStr;

        if (metricData.ci && metricData.ci.lower !== null && metricData.ci.upper !== null && !isNaN(metricData.ci.lower) && !isNaN(metricData.ci.upper) && isFinite(metricData.ci.lower) && isFinite(metricData.ci.upper)) {
            const lowerStr = formatSingleValue(metricData.ci.lower, digits, isPercent);
            const upperStr = formatSingleValue(metricData.ci.upper, digits, isPercent);
            if (lowerStr === placeholder || upperStr === placeholder) return valStr;

            const ciText = langToUse === 'de' ? '95%-KI' : '95% CI';
            let mainValDisp = valStr, lowerDisp = lowerStr, upperDisp = upperStr;
            if (isPercent) {
                mainValDisp = String(mainValDisp).replace('%', '');
                lowerDisp = String(lowerDisp).replace('%', '');
                upperDisp = String(upperDisp).replace('%', '');
                return `${mainValDisp} (${ciText}: ${lowerDisp}–${upperDisp})%`;
            } else {
                return `${mainValDisp} (${ciText}: ${lowerDisp}–${upperDisp})`;
            }
        }
        return valStr;
    }

    function _formatPValueForText(pValue) {
        if (pValue === null || pValue === undefined || isNaN(pValue)) return 'N/A';
        const pText = getPValueText(pValue, currentLang);
        const sigSymbol = getStatisticalSignificanceSymbol(pValue);
        return `${pText}${sigSymbol ? '&nbsp;' + sigSymbol : ''}`; // Use &nbsp; for HTML
    }

    function _getKollektivText(kollektivId, n) {
        const name = getKollektivDisplayName(kollektivId);
        const nText = currentLang === 'de' ? `N=${n}` : `n=${n}`;
        return `${name} (${nText})`;
    }

    function _getTableRef(tableKey) {
        const element = PUBLICATION_CONFIG.publicationElements[tableKey];
        return element ? (currentLang === 'de' ? element.referenceFormat.de : element.referenceFormat.en) : `[${tableKey}]`;
    }

    function _getFigureRef(figureKey) {
        const element = PUBLICATION_CONFIG.publicationElements[figureKey];
        return element ? (currentLang === 'de' ? element.referenceFormat.de : element.referenceFormat.en) : `[${figureKey}]`;
    }

    function _getPlaceholderTextForSection(sectionLabelKey) {
        const label = UI_TEXTS.publikationTab.sectionLabels[sectionLabelKey] || sectionLabelKey;
        if (currentLang === 'de') {
            return `<p><em>[Detaillierter Text für Abschnitt "${label}" ist manuell zu erstellen. Dieser Generator fokussiert auf Methoden und Ergebnisse.]</em></p>`;
        } else {
            return `<p><em>[Detailed text for section "${label}" to be created manually. This generator focuses on Methods and Results.]</em></p>`;
        }
    }

    function _getAbstractPurposeText() { return _getPlaceholderTextForSection('abstract');}
    function _getAbstractMethodsText() { return '';} // Part of general placeholder
    function _getAbstractResultsText() { return '';} // Part of general placeholder
    function _getAbstractConclusionText() { return '';} // Part of general placeholder
    function _getIntroductionBackgroundText() { return _getPlaceholderTextForSection('einleitung');}
    function _getIntroductionRationaleObjectiveText() { return '';} // Part of general placeholder


    function _getMethodsStudienanlageText() {
        const appName = currentCommonData.appName || APP_CONFIG.APP_NAME;
        const appVersion = currentCommonData.appVersion || APP_CONFIG.APP_VERSION;
        const lurzSchaeferShort = referenceManager.getShortCitation('LURZ_SCHAEFER_2025');
        const ethicsVote = currentCommonData.references?.ETHICS_VOTE_SAXONY?.shortCitation || "Ethikvotum Nr. 2023-101, Ethikkommission der Sächsischen Landesärztekammer";


        if (currentLang === 'de') {
            return `<p>Diese Studie wurde als retrospektive Analyse einer prospektiv geführten, monozentrischen Kohorte von Patienten mit histologisch gesichertem Rektumkarzinom konzipiert. Das primäre Studienkollektiv und die zugrundeliegenden Bilddatensätze für die initiale Bewertung des Avocado Signs (AS) sind identisch mit jenen der Originalpublikation zum Avocado Sign (${lurzSchaeferShort} ${referenceManager.cite('LURZ_SCHAEFER_2025')}). Ziel dieser erweiterten Untersuchung ist der detaillierte Vergleich der diagnostischen Güte des AS mit etablierten und optimierten T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status).</p><p>Die Studie wurde in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki durchgeführt. Das Studienprotokoll wurde von der lokalen Ethikkommission genehmigt (${ethicsVote}). Aufgrund des retrospektiven Charakters der Analyse auf pseudonymisierten Daten wurde von der Ethikkommission auf ein erneutes Einholen eines schriftlichen Einverständnisses der Patienten für diese spezifische erweiterte Auswertung verzichtet, da ein generelles Einverständnis zur wissenschaftlichen Auswertung im Rahmen der Primärstudie vorlag. Alle hier präsentierten Analysen und Kriterienevaluationen wurden mittels einer interaktiven Webanwendung ("${appName}", Version ${appVersion}) durchgeführt, die eigens für diese und nachfolgende Studien entwickelt und erweitert wurde.</p>`;
        } else {
            return `<p>This study was designed as a retrospective analysis of a prospectively maintained, single-center cohort of patients with histologically confirmed rectal cancer. The primary study cohort and the underlying imaging datasets for the initial assessment of the Avocado Sign (AS) are identical to those of the original Avocado Sign publication (${lurzSchaeferShort} ${referenceManager.cite('LURZ_SCHAEFER_2025')}). The objective of this extended investigation is a detailed comparison of the diagnostic performance of the AS with established and optimized T2-weighted morphological criteria for predicting mesorectal lymph node status (N-status).</p><p>The study was conducted in accordance with the principles of the Declaration of Helsinki. The study protocol was approved by the local ethics committee (${ethicsVote}). Given the retrospective nature of this analysis on pseudonymized data, the ethics committee waived the need for re-obtaining written informed consent from patients for this specific extended evaluation, as general consent for scientific evaluation was provided as part of the primary study. All analyses and criteria evaluations presented herein were performed using an interactive web application ("${appName}", Version ${appVersion}), specifically developed and enhanced for this and subsequent studies.</p>`;
        }
    }

    function _getMethodsPatientenkollektivText() {
        const nGesamt = currentCommonData.nGesamt || 'N/A';
        const nDirektOP = currentCommonData.nDirektOP || 'N/A';
        const nRCT = currentCommonData.nNRCT || 'N/A';
        const studyPeriod = currentCommonData.references?.LURZ_SCHAEFER_2025_ADDITIONAL?.studyPeriod || (currentLang === 'de' ? "Januar 2020 und November 2023" : "January 2020 and November 2023");
        const table1Ref = _getTableRef('TABLE_PATIENT_CHARS');

        if (currentLang === 'de') {
            return `<p>Es wurden konsekutiv ${nGesamt} Patienten mit histologisch gesichertem Rektumkarzinom eingeschlossen, die zwischen ${studyPeriod} am Klinikum St. Georg, Leipzig, Deutschland, behandelt und in die initiale Avocado-Sign-Studie ${referenceManager.cite('LURZ_SCHAEFER_2025')} aufgenommen wurden. Von diesen erhielten ${nRCT} Patienten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während ${nDirektOP} Patienten primär operiert wurden (Direkt-OP-Gruppe). Einschlusskriterien für die Primärstudie waren ein Alter von mindestens 18 Jahren und ein histologisch bestätigtes Rektumkarzinom. Ausschlusskriterien umfassten nicht resektable Tumoren und Kontraindikationen für eine MRT-Untersuchung. Für die vorliegende erweiterte Analyse wurden alle Patienten der Primärstudie berücksichtigt, für die vollständige Datensätze bezüglich der T1KM- und T2-Lymphknotenmerkmale vorlagen. Detaillierte Patientencharakteristika sind in ${table1Ref} dargestellt.</p>`;
        } else {
            return `<p>A total of ${nGesamt} consecutive patients with histologically confirmed rectal cancer, treated at St. Georg Hospital, Leipzig, Germany, between ${studyPeriod} and included in the initial Avocado Sign study ${referenceManager.cite('LURZ_SCHAEFER_2025')}, were enrolled. Of these, ${nRCT} patients received neoadjuvant chemoradiotherapy (nCRT group), while ${nDirektOP} patients underwent upfront surgery (upfront surgery group). Inclusion criteria for the primary study were an age of at least 18 years and histologically confirmed rectal cancer. Exclusion criteria included unresectable tumors and contraindications to MRI. For the present extended analysis, all patients from the primary study for whom complete datasets regarding T1-weighted contrast-enhanced and T2-weighted lymph node characteristics were available were included. Detailed patient characteristics are presented in ${table1Ref}.</p>`;
        }
    }
    
    function _getMethodsMRTProtokollText() {
         const mrtSystem = currentCommonData.references?.LURZ_SCHAEFER_2025_ADDITIONAL?.mriSystem || "einem 3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Deutschland)";
         const kontrastmittel = currentCommonData.references?.LURZ_SCHAEFER_2025_ADDITIONAL?.contrastAgent || "Gadoteridol (ProHance; Bracco Imaging, Konstanz, Deutschland)";
         const t2SliceThickness = currentCommonData.references?.LURZ_SCHAEFER_2025_ADDITIONAL?.t2SliceThickness || "2–3 mm";

        if (currentLang === 'de') {
            return `<p>Alle MRT-Untersuchungen wurden an ${mrtSystem} unter Verwendung von Körper- und Wirbelsäulen-Array-Spulen durchgeführt. Das standardisierte Bildgebungsprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Ebene (Schichtdicke ${t2SliceThickness}) sowie eine axiale diffusionsgewichtete Sequenz (DWI). Für die Bewertung des Avocado Signs wurde, wie in der Primärstudie ${referenceManager.cite('LURZ_SCHAEFER_2025')} beschrieben, eine kontrastmittelverstärkte axiale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung akquiriert.</p><p>Ein makrozyklisches Gadolinium-basiertes Kontrastmittel (${kontrastmittel}) wurde gewichtsadaptiert (0,2 ml/kg Körpergewicht) intravenös verabreicht. Die kontrastmittelverstärkten Aufnahmen erfolgten unmittelbar nach vollständiger Applikation des Kontrastmittels. Butylscopolamin wurde zur Reduktion von Bewegungsartefakten appliziert. Das Bildgebungsprotokoll war für die primäre Staging-Untersuchung und die Restaging-Untersuchung (bei Patienten der nRCT-Gruppe) identisch.</p>`;
        } else {
            return `<p>All MRI examinations were performed on ${mrtSystem.replace('einem ', 'a ').replace('Deutschland', 'Germany')} using body and spine array coils. The standardized imaging protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal planes (slice thickness ${t2SliceThickness}), as well as axial diffusion-weighted imaging (DWI). For the assessment of the Avocado Sign, as described in the primary study ${referenceManager.cite('LURZ_SCHAEFER_2025')}, a contrast-enhanced axial T1-weighted volumetric interpolated breath-hold examination (VIBE) with Dixon fat suppression was acquired.</p><p>A macrocyclic gadolinium-based contrast agent (${kontrastmittel.replace('Konstanz, Deutschland', 'Konstanz, Germany')}) was administered intravenously at a weight-based dose (0.2 mL/kg body weight). Contrast-enhanced images were acquired immediately after the full administration of the contrast agent. Butylscopolamine was administered to reduce motion artifacts. The imaging protocol was identical for baseline staging and restaging examinations (in patients from the nCRT group).</p>`;
        }
    }

    function _getMethodsASDefinitionText() {
        const radExperience = currentCommonData.references?.LURZ_SCHAEFER_2025_ADDITIONAL?.radiologistExperience || ["29", "7", "19"];
        const figAvocadoExamplesRef = _getFigureRef('FIGURE_AVOCADO_SIGN_EXAMPLES');
         if (currentLang === 'de') {
            return `<p>Das Avocado Sign (AS) wurde, wie in der Originalstudie (${referenceManager.cite('LURZ_SCHAEFER_2025')}) definiert, auf den kontrastmittelverstärkten T1-gewichteten Bildern evaluiert. Es ist charakterisiert als ein klar abgrenzbarer, hypointenser Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens, unabhängig von dessen Größe oder Form (siehe ${figAvocadoExamplesRef}). Die Bewertung erfolgte für alle im T1KM-MRT sichtbaren mesorektalen Lymphknoten. Ein Patient wurde als AS-positiv (AS+) eingestuft, wenn mindestens ein Lymphknoten dieses Zeichen aufwies. Die Bildanalyse wurde von zwei Radiologen (Erfahrung: ${radExperience[0]} bzw. ${radExperience[1]} Jahre in der abdominellen MRT), die bereits die Primärstudie durchführten, unabhängig und verblindet gegenüber den histopathologischen Ergebnissen und den T2-Merkmalen vorgenommen. Diskrepanzen wurden im Konsens mit einem dritten, ebenfalls erfahrenen Radiologen (Erfahrung: ${radExperience[2]} Jahre) gelöst. Für Patienten der nRCT-Gruppe erfolgte die AS-Bewertung auf den Restaging-MRT-Bildern.</p>`;
        } else {
            return `<p>The Avocado Sign (AS), as defined in the original study (${referenceManager.cite('LURZ_SCHAEFER_2025')}), was evaluated on contrast-enhanced T1-weighted images. It is characterized as a clearly demarcated, hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape (see ${figAvocadoExamplesRef}). Assessment was performed for all mesorectal lymph nodes visible on T1-weighted contrast-enhanced MRI. A patient was classified as AS-positive (AS+) if at least one lymph node exhibited this sign. Image analysis was performed by two radiologists (experience: ${radExperience[0]} and ${radExperience[1]} years in abdominal MRI, respectively), who also conducted the primary study, independently and blinded to histopathological results and T2-weighted features. Discrepancies were resolved by consensus with a third, similarly experienced radiologist (experience: ${radExperience[2]} years). For patients in the nCRT group, AS assessment was performed on restaging MRI images.</p>`;
        }
    }
    
    function _getMethodsT2DefinitionLiteraturText() {
        const table2Ref = _getTableRef('TABLE_LITERATURE_T2_CRITERIA');
        const kohSet = studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology');
        const barbaroSet = studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging');
        const esgarSet = studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar');

        const kohDesc = kohSet?.studyInfo?.keyCriteriaSummary || 'N/A';
        const kohApplicable = getKollektivDisplayName(kohSet?.applicableKollektiv || 'Gesamt');
        const barbaroDesc = barbaroSet?.studyInfo?.keyCriteriaSummary || 'N/A';
        const barbaroApplicable = getKollektivDisplayName(barbaroSet?.applicableKollektiv || 'nRCT');
        const esgarDesc = esgarSet?.studyInfo?.keyCriteriaSummary || 'N/A';
        const esgarApplicable = getKollektivDisplayName(esgarSet?.applicableKollektiv || 'direkt OP');

        if (currentLang === 'de') {
            return `<p>Die morphologischen T2-gewichteten Kriterien (Größe [Kurzachse in mm], Form, Kontur, Homogenität und Signalintensität) wurden für jeden im hochauflösenden T2w-MRT sichtbaren mesorektalen Lymphknoten von denselben zwei Radiologen erfasst, die auch das Avocado Sign bewerteten. Die Bewertung erfolgte konsensbasiert und verblindet gegenüber dem pathologischen N-Status und dem Avocado-Sign-Status.</p><p>Für den Vergleich der diagnostischen Güte wurden folgende Literatur-basierte T2-Kriteriensets herangezogen (Details siehe ${table2Ref}):</p><ul><li>Koh et al. ${referenceManager.cite('KOH_2008')}: Definiert als "${kohDesc}". Dieses Set wurde in unserer Analyse auf das Kollektiv '${kohApplicable}' angewendet.</li><li>Barbaro et al. ${referenceManager.cite('BARBARO_2024')}: Definiert als "${barbaroDesc}". Dieses Set wurde spezifisch für das Kollektiv '${barbaroApplicable}' (Restaging) evaluiert.</li><li>ESGAR 2016 Konsensus Kriterien ${referenceManager.cite('BEETS_TAN_2018_ESGAR')} (evaluiert durch Rutegård et al. ${referenceManager.cite('RUTEGARD_2025')}): Definiert als "${esgarDesc}". Dieses Set wurde primär auf das Kollektiv '${esgarApplicable}' (Primärstaging) angewendet.</li></ul><p>Ein Lymphknoten wurde als T2-positiv für ein gegebenes Kriterienset gewertet, wenn er die spezifischen Bedingungen dieses Sets erfüllte. Ein Patient galt als T2-positiv, wenn mindestens ein Lymphknoten gemäß dem jeweiligen Kriterienset als positiv bewertet wurde.</p>`;
        } else {
            return `<p>Morphological T2-weighted criteria (size [short-axis diameter in mm], shape, border, homogeneity, and signal intensity) were assessed for every mesorectal lymph node visible on high-resolution T2w-MRI by the same two radiologists who evaluated the Avocado Sign. The assessment was performed by consensus and blinded to the pathological N-status and the Avocado Sign status.</p><p>For the comparison of diagnostic performance, the following literature-based T2 criteria sets were utilized (details see ${table2Ref}):</p><ul><li>Koh et al. ${referenceManager.cite('KOH_2008')}: Defined as "${kohDesc}". In our analysis, this set was applied to the '${kohApplicable}' cohort.</li><li>Barbaro et al. ${referenceManager.cite('BARBARO_2024')}: Defined as "${barbaroDesc}". This set was specifically evaluated for the '${barbaroApplicable}' cohort (restaging).</li><li>ESGAR 2016 Consensus Criteria ${referenceManager.cite('BEETS_TAN_2018_ESGAR')} (as evaluated by Rutegård et al. ${referenceManager.cite('RUTEGARD_2025')}): Defined as "${esgarDesc}". This set was primarily applied to the '${esgarApplicable}' cohort (primary staging).</li></ul><p>A lymph node was considered T2-positive for a given criteria set if it met the specific conditions of that set. A patient was considered T2-positive if at least one lymph node was rated positive according to the respective criteria set.</p>`;
        }
    }

    function _getMethodsT2DefinitionBruteforceText() {
        const bfZielMetric = currentOptions.publicationBfMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const t2SizeMin = formatNumber(APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min, 1, false);
        const t2SizeMax = formatNumber(APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max, 1, false);
        const t2SizeStep = formatNumber(APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step, 1, false);
        let bfCriteriaTextList = '<ul>';

        ['Gesamt', 'direkt OP', 'nRCT'].forEach(kolId => {
            const bfDef = currentAllStats?.[kolId]?.bruteforce_definition;
            const displayName = getKollektivDisplayName(kolId);
            if (bfDef && bfDef.criteria && bfDef.metricName === bfZielMetric) {
                let metricValueStr = formatNumber(bfDef.metricValue, 4, 'N/A', currentLang === 'en');
                const formattedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, false);
                 bfCriteriaTextList += `<li><strong>${displayName}:</strong> ${formattedCriteria} (${currentLang === 'de' ? 'Zielmetrik' : 'Target metric'}: ${bfDef.metricName}, ${currentLang === 'de' ? 'Wert' : 'value'}: ${metricValueStr})</li>`;
            } else if (bfDef && bfDef.metricName !== bfZielMetric) {
                 bfCriteriaTextList += `<li><strong>${displayName}:</strong> (${currentLang === 'de' ? `Optimierungsergebnis für abweichende Metrik '${bfDef.metricName}' verwendet; spezifisches Ergebnis für '${bfZielMetric}' nicht primär optimiert oder verfügbar.` : `Optimization result for differing metric '${bfDef.metricName}' used; specific result for '${bfZielMetric}' not primarily optimized or available.`})</li>`;
            }
             else {
                bfCriteriaTextList += `<li><strong>${displayName}:</strong> ${currentLang === 'de' ? `Keine validen Optimierungsergebnisse für Zielmetrik '${bfZielMetric}' verfügbar.` : `No valid optimization results available for target metric '${bfZielMetric}'.`}</li>`;
            }
        });
        bfCriteriaTextList += '</ul>';


        if (currentLang === 'de') {
            return `<p>Zusätzlich wurde ein im Analyse-Tool implementierter Brute-Force-Algorithmus verwendet, um für jedes der drei Hauptkollektive (Gesamt, Direkt OP, nRCT) diejenigen Kombinationen aus den fünf T2-Merkmalen (Größe [variiert von ${t2SizeMin}mm bis ${t2SizeMax}mm in ${t2SizeStep}mm Schritten], Form, Kontur, Homogenität, Signal) und einer UND/ODER-Logik zu identifizieren, welche die für diese Publikation definierte Zielmetrik – die <strong>${bfZielMetric}</strong> – maximieren. Die resultierenden, für jedes Kollektiv spezifisch optimierten Kriteriensets (oder die besten verfügbaren Ergebnisse, falls die primäre Optimierung auf einer anderen Metrik basierte) waren:</p>${bfCriteriaTextList}<p>Ein Lymphknoten wurde als T2-positiv für ein gegebenes optimiertes Kriterienset gewertet, wenn er die spezifischen Bedingungen dieses Sets erfüllte. Ein Patient galt als T2-positiv, wenn mindestens ein Lymphknoten gemäß dem jeweiligen optimierten Kriterienset als positiv bewertet wurde.</p>`;
        } else {
            return `<p>Additionally, a brute-force algorithm implemented in the analysis tool was used to identify, for each of the three main cohorts (Overall, Upfront Surgery, nCRT), those combinations of the five T2 features (size [varying from ${t2SizeMin}mm to ${t2SizeMax}mm in ${t2SizeStep}mm steps], shape, border, homogeneity, signal) and an AND/OR logic that maximize the target metric defined for this publication – <strong>${bfZielMetric}</strong>. The resulting cohort-specific optimized criteria sets (or the best available results if primary optimization was based on a different metric) were:</p>${bfCriteriaTextList}<p>A lymph node was considered T2-positive for a given optimized criteria set if it met the specific conditions of that set. A patient was considered T2-positive if at least one lymph node was rated positive according to the respective optimized criteria set.</p>`;
        }
    }
    
    function _getMethodsReferenzstandardText() {
        if (currentLang === 'de') {
            return `<p>Die histopathologische Untersuchung der Operationspräparate nach totaler mesorektaler Exzision (TME) diente als Referenzstandard für den Lymphknotenstatus. Alle mesorektalen Lymphknoten wurden von erfahrenen Pathologen gemäß den etablierten Standardprotokollen aufgearbeitet und mikroskopisch bewertet. Der N-Status eines Patienten wurde als positiv (N+) definiert, wenn mindestens ein Lymphknoten histologisch als metastatisch befallen identifiziert wurde. Andernfalls galt der Patient als N-negativ (N0).</p>`;
        } else {
            return `<p>Histopathological examination of surgical specimens after total mesorectal excision (TME) served as the reference standard for lymph node status. All mesorectal lymph nodes were processed and microscopically evaluated by experienced pathologists according to established standard protocols. A patient's N-status was defined as positive (N+) if at least one lymph node was histologically identified as metastatic. Otherwise, the patient was considered N-negative (N0).</p>`;
        }
    }

    function _getMethodsStatistischeAnalyseText() {
        const alphaLevel = formatNumber(currentCommonData.significanceLevel || 0.05, 2, '0.05', currentLang === 'en');
        const bootstrapN = currentCommonData.bootstrapReplications || 1000;
        const appName = currentCommonData.appName;
        const appVersion = currentCommonData.appVersion;
        const ciProp = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION;
        const ciEffect = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE;

        if (currentLang === 'de') {
            return `<p>Deskriptive Statistiken umfassten Mediane mit Interquartilsabständen (IQR) oder Min-Max-Bereichen für kontinuierliche Variablen sowie absolute und relative Häufigkeiten für kategoriale Daten. Die diagnostische Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) wurde anhand von Sensitivität, Spezifität, positivem prädiktiven Wert (PPV), negativem prädiktiven Wert (NPV), Positive Likelihood Ratio (LR+), Negative Likelihood Ratio (LR-), Accuracy (ACC), Balanced Accuracy (BalAcc) und der Fläche unter der Receiver Operating Characteristic-Kurve (AUC) – bei binären Tests äquivalent zur BalAcc – evaluiert. Für diese Metriken wurden zweiseitige 95%-Konfidenzintervalle (KI) berechnet. Für Proportionen (Sensitivität, Spezifität, PPV, NPV, Accuracy) wurde die ${ciProp}-Methode verwendet. Für BalAcc (AUC), F1-Score und Likelihood Ratios wurde die ${ciEffect}-Methode mit ${formatNumber(bootstrapN,0)} Replikationen angewendet.</p><p>Der statistische Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe (gepaarte Daten) erfolgte mittels des McNemar-Tests für gepaarte nominale Daten bzw. des DeLong-Tests für den Vergleich von AUC-Werten. Der Vergleich von Performance-Metriken zwischen unabhängigen Kollektiven (z.B. Direkt-OP vs. nRCT-Gruppe) erfolgte mittels Fisher's Exact Test für Raten (wie Accuracy) und mittels Z-Test für den Vergleich von AUC-Werten basierend auf deren Bootstrap-Standardfehlern. Odds Ratios (OR) und Risk Differences (RD) wurden zur Quantifizierung von Assoziationen berechnet, ebenfalls mit 95%-KI. Der Phi-Koeffizient (φ) wurde als Maß für die Stärke des Zusammenhangs zwischen binären Merkmalen herangezogen. Für den Vergleich von Verteilungen kontinuierlicher Variablen zwischen zwei unabhängigen Gruppen wurde der Mann-Whitney-U-Test verwendet. Ein p-Wert < ${alphaLevel} wurde als statistisch signifikant interpretiert. Alle statistischen Analysen wurden mit der oben genannten, speziell entwickelten Webanwendung ("${appName}", Version ${appVersion}) durchgeführt, die auf Standardbibliotheken für statistische Berechnungen (JavaScript) basiert.</p>`;
        } else {
            return `<p>Descriptive statistics included medians with interquartile ranges (IQR) or min-max ranges for continuous variables, and absolute and relative frequencies for categorical data. Diagnostic performance of the Avocado Sign and the various T2 criteria sets (literature-based and brute-force optimized) was evaluated using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), positive likelihood ratio (LR+), negative likelihood ratio (LR-), accuracy (ACC), balanced accuracy (BalAcc), and the area under the Receiver Operating Characteristic curve (AUC)—equivalent to BalAcc for binary tests. Two-sided 95% confidence intervals (CI) were calculated for these metrics. The ${ciProp} method was used for proportions (sensitivity, specificity, PPV, NPV, accuracy). For BalAcc (AUC), F1-score, and likelihood ratios, the ${ciEffect} method with ${formatNumber(bootstrapN,0)} replications was applied.</p><p>Statistical comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group (paired data) was performed using McNemar's test for paired nominal data and DeLong's test for AUC comparison. Comparison of performance metrics between independent cohorts (e.g., upfront surgery vs. nCRT group) was conducted using Fisher's exact test for rates (such as accuracy) and a Z-test for AUC comparison based on their bootstrap standard errors. Odds Ratios (OR) and Risk Differences (RD) were calculated to quantify associations, also with 95% CIs. The Phi coefficient (φ) was used as a measure of the strength of association between binary features. For comparing distributions of continuous variables between two independent groups, the Mann-Whitney U test was used. A p-value < ${alphaLevel} was considered statistically significant. All statistical analyses were conducted using the aforementioned custom-developed web application ("${appName}", Version ${appVersion}), which is based on standard libraries for statistical computations (JavaScript).</p>`;
        }
    }
    
    function _getResultsPatientencharakteristikaText() {
        const nGesamt = currentCommonData.nGesamt || 'N/A';
        const pCharGesamt = currentAllStats?.Gesamt?.deskriptiv;
        const alterMedian = formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', currentLang === 'en');
        const alterRange = `(${formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', currentLang === 'en')}–${formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', currentLang === 'en')})`;
        const anzahlMaenner = pCharGesamt?.geschlecht?.m || 0;
        const anteilMaennerProzent = formatPercent(pCharGesamt?.anzahlPatienten > 0 ? anzahlMaenner / pCharGesamt.anzahlPatienten : NaN, 0);
        const nPosCount = pCharGesamt?.nStatus?.plus || 'N/A';
        const nPosPercent = formatPercent(pCharGesamt?.anzahlPatienten > 0 ? nPosCount / pCharGesamt.anzahlPatienten : NaN, 1);
        const table1Ref = _getTableRef('TABLE_PATIENT_CHARS');
        const fig2ARef = _getFigureRef('FIGURE_DEMOGRAPHICS_AGE');
        const fig2BRef = _getFigureRef('FIGURE_DEMOGRAPHICS_GENDER');

        if (currentLang === 'de') {
            return `<p>Die Charakteristika der ${nGesamt} in die Studie eingeschlossenen Patienten sind in ${table1Ref} zusammengefasst und entsprechen den Daten der initialen Avocado-Sign-Studie ${referenceManager.cite('LURZ_SCHAEFER_2025')}. Das Gesamtkollektiv bestand aus ${currentCommonData.nDirektOP || 'N/A'} Patienten, die primär operiert wurden (Direkt-OP-Gruppe), und ${currentCommonData.nNRCT || 'N/A'} Patienten, die eine neoadjuvante Radiochemotherapie erhielten (nRCT-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${alterMedian} Jahre ${alterRange}, und ${anteilMaennerProzent} (${anzahlMaenner}/${nGesamt}) waren männlich. Ein histopathologisch gesicherter positiver Lymphknotenstatus (N+) fand sich bei ${nPosCount} (${nPosPercent}) von ${nGesamt} Patienten im Gesamtkollektiv. Die Verteilung von Alter und Geschlecht im Gesamtkollektiv ist in ${fig2ARef} und ${fig2BRef} dargestellt.</p>`;
        } else {
            return `<p>The characteristics of the ${nGesamt} patients included in the study are summarized in ${table1Ref} and correspond to the data from the initial Avocado Sign study ${referenceManager.cite('LURZ_SCHAEFER_2025')}. The overall cohort consisted of ${currentCommonData.nDirektOP || 'N/A'} patients who underwent upfront surgery (upfront surgery group) and ${currentCommonData.nNRCT || 'N/A'} patients who received neoadjuvant chemoradiotherapy (nCRT group). The median age in the overall cohort was ${alterMedian} years ${alterRange}, and ${anteilMaennerProzent} (${anzahlMaenner}/${nGesamt}) were male. A histopathologically confirmed positive lymph node status (N+) was found in ${nPosCount} (${nPosPercent}) of ${nGesamt} patients in the overall cohort. The age and gender distribution in the overall cohort is shown in ${fig2ARef} and ${fig2BRef}, respectively.</p>`;
        }
    }

    function _getResultsASPerformanceText() {
        const table3Ref = _getTableRef('TABLE_PERFORMANCE_AS');
        const perfGesamt = currentAllStats?.Gesamt?.gueteAS;
        const perfDirektOP = currentAllStats?.['direkt OP']?.gueteAS;
        const perfNRCT = currentAllStats?.nRCT?.gueteAS;

        if (currentLang === 'de') {
            return `<p>Die diagnostische Güte des Avocado Signs (AS) zur Vorhersage des pathologischen N-Status ist für das Gesamtkollektiv und die Subgruppen in ${table3Ref} detailliert aufgeführt. Im Gesamtkollektiv (${_getKollektivText('Gesamt', currentCommonData.nGesamt || 0, 'de')}) erreichte das AS eine Sensitivität von ${_fCI(perfGesamt?.sens)}, eine Spezifität von ${_fCI(perfGesamt?.spez)}, einen positiven prädiktiven Wert (PPV) von ${_fCI(perfGesamt?.ppv)}, einen negativen prädiktiven Wert (NPV) von ${_fCI(perfGesamt?.npv)} und eine Accuracy von ${_fCI(perfGesamt?.acc)}. Die AUC (Balanced Accuracy) betrug ${_fCI(perfGesamt?.auc, 3, false)}. Diese Werte stimmen mit den in der Originalpublikation zum Avocado Sign ${referenceManager.cite('LURZ_SCHAEFER_2025')} berichteten überein.</p><p>In der Subgruppe der primär operierten Patienten (Direkt-OP-Gruppe, ${_getKollektivText('direkt OP', currentCommonData.nDirektOP || 0, 'de')}) zeigte das AS eine Sensitivität von ${_fCI(perfDirektOP?.sens)} und eine Spezifität von ${_fCI(perfDirektOP?.spez)} (AUC: ${_fCI(perfDirektOP?.auc, 3, false)}). Bei Patienten nach nRCT (nRCT-Gruppe, ${_getKollektivText('nRCT', currentCommonData.nNRCT || 0, 'de')}) betrug die Sensitivität ${_fCI(perfNRCT?.sens)} und die Spezifität ${_fCI(perfNRCT?.spez)} (AUC: ${_fCI(perfNRCT?.auc, 3, false)}).</p>`;
        } else {
            return `<p>The diagnostic performance of the Avocado Sign (AS) for predicting pathological N-status is detailed in ${table3Ref} for the overall cohort and subgroups. In the overall cohort (${_getKollektivText('Gesamt', currentCommonData.nGesamt || 0, 'en')}), the AS achieved a sensitivity of ${_fCI(perfGesamt?.sens)}, a specificity of ${_fCI(perfGesamt?.spez)}, a positive predictive value (PPV) of ${_fCI(perfGesamt?.ppv)}, a negative predictive value (NPV) of ${_fCI(perfGesamt?.npv)}, and an accuracy of ${_fCI(perfGesamt?.acc)}. The AUC (Balanced Accuracy) was ${_fCI(perfGesamt?.auc, 3, false)}. These values are consistent with those reported in the original Avocado Sign publication ${referenceManager.cite('LURZ_SCHAEFER_2025')}.</p><p>In the subgroup of patients undergoing upfront surgery (Upfront surgery group, ${_getKollektivText('direkt OP', currentCommonData.nDirektOP || 0, 'en')}), the AS showed a sensitivity of ${_fCI(perfDirektOP?.sens)} and a specificity of ${_fCI(perfDirektOP?.spez)} (AUC: ${_fCI(perfDirektOP?.auc, 3, false)}). For patients after nCRT (nCRT group, ${_getKollektivText('nRCT', currentCommonData.nNRCT || 0, 'en')}), the sensitivity was ${_fCI(perfNRCT?.sens)} and the specificity was ${_fCI(perfNRCT?.spez)} (AUC: ${_fCI(perfNRCT?.auc, 3, false)}).</p>`;
        }
    }
    
    function _getResultsLitT2PerformanceText() {
        const table4Ref = _getTableRef('TABLE_PERFORMANCE_LIT_T2');
        const kohData = currentAllStats?.Gesamt?.gueteT2_literatur?.['koh_2008_morphology'];
        const barbaroData = currentAllStats?.nRCT?.gueteT2_literatur?.['barbaro_2024_restaging'];
        const esgarData = currentAllStats?.['direkt OP']?.gueteT2_literatur?.['rutegard_et_al_esgar'];
        const kohShort = referenceManager.getShortCitation('KOH_2008');
        const barbaroShort = referenceManager.getShortCitation('BARBARO_2024');
        const esgarShort = referenceManager.getShortCitation('BEETS_TAN_2018_ESGAR') + " / " + referenceManager.getShortCitation('RUTEGARD_2025');

        if (currentLang === 'de') {
            let text = `<p>Die diagnostische Güte der evaluierten Literatur-basierten T2-Kriteriensets ist in ${table4Ref} zusammengefasst. `;
            text += `Für das Kriterienset nach ${kohShort} ${referenceManager.cite('KOH_2008')}, angewendet auf das Gesamtkollektiv (${_getKollektivText('Gesamt', currentCommonData.nGesamt || 0, 'de')}), ergab sich eine Sensitivität von ${_fCI(kohData?.sens)} und eine Spezifität von ${_fCI(kohData?.spez)} (AUC ${_fCI(kohData?.auc, 3, false)}). `;
            text += `Die Kriterien nach ${barbaroShort} ${referenceManager.cite('BARBARO_2024')}, angewendet auf das nRCT-Kollektiv (${_getKollektivText('nRCT', currentCommonData.nNRCT || 0, 'de')}), zeigten eine Sensitivität von ${_fCI(barbaroData?.sens)} und eine Spezifität von ${_fCI(barbaroData?.spez)} (AUC ${_fCI(barbaroData?.auc, 3, false)}). `;
            text += `Die ESGAR 2016 Kriterien (evaluiert durch ${esgarShort} ${referenceManager.cite('RUTEGARD_2025')}, ${referenceManager.cite('BEETS_TAN_2018_ESGAR')}), angewendet auf das Direkt-OP-Kollektiv (${_getKollektivText('direkt OP', currentCommonData.nDirektOP || 0, 'de')}), erreichten eine Sensitivität von ${_fCI(esgarData?.sens)} und eine Spezifität von ${_fCI(esgarData?.spez)} (AUC ${_fCI(esgarData?.auc, 3, false)}).</p>`;
            return text;
        } else {
            let text = `<p>The diagnostic performance of the evaluated literature-based T2 criteria sets is summarized in ${table4Ref}. `;
            text += `For the criteria set according to ${kohShort} ${referenceManager.cite('KOH_2008')}, applied to the overall cohort (${_getKollektivText('Gesamt', currentCommonData.nGesamt || 0, 'en')}), a sensitivity of ${_fCI(kohData?.sens)} and a specificity of ${_fCI(kohData?.spez)} (AUC ${_fCI(kohData?.auc, 3, false)}) were observed. `;
            text += `The criteria by ${barbaroShort} ${referenceManager.cite('BARBARO_2024')}, applied to the nCRT cohort (${_getKollektivText('nRCT', currentCommonData.nNRCT || 0, 'en')}), showed a sensitivity of ${_fCI(barbaroData?.sens)} and a specificity of ${_fCI(barbaroData?.spez)} (AUC ${_fCI(barbaroData?.auc, 3, false)}). `;
            text += `The ESGAR 2016 criteria (evaluated by ${esgarShort} ${referenceManager.cite('RUTEGARD_2025')}, ${referenceManager.cite('BEETS_TAN_2018_ESGAR')}), applied to the upfront surgery cohort (${_getKollektivText('direkt OP', currentCommonData.nDirektOP || 0, 'en')}), achieved a sensitivity of ${_fCI(esgarData?.sens)} and a specificity of ${_fCI(esgarData?.spez)} (AUC ${_fCI(esgarData?.auc, 3, false)}).</p>`;
            return text;
        }
    }

    function _getResultsOptimierteT2PerformanceText() {
        const table5Ref = _getTableRef('TABLE_PERFORMANCE_BF_T2');
        const bfMetricName = currentOptions.publicationBfMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        
        let textList = '<ul>';
        ['Gesamt', 'direkt OP', 'nRCT'].forEach(kolId => {
            const bfStats = currentAllStats?.[kolId]?.gueteT2_bruteforce;
            const bfDef = currentAllStats?.[kolId]?.bruteforce_definition;
            const displayName = getKollektivDisplayName(kolId);
            const nPat = currentCommonData[kolId === 'Gesamt' ? 'nGesamt' : (kolId === 'direkt OP' ? 'nDirektOP' : 'nNRCT')] || 0;
            const kolText = _getKollektivText(kolId, nPat);

            if (bfStats && bfStats.matrix && bfDef && bfDef.criteria && bfDef.metricName === bfMetricName) {
                textList += `<li>${currentLang === 'de' ? 'Für das' : 'For the'} ${kolText}: Sens. ${_fCI(bfStats?.sens)}, Spez. ${_fCI(bfStats?.spez)}, AUC ${_fCI(bfStats?.auc, 3, false)}. (${currentLang === 'de' ? 'Optimierte Kriterien' : 'Optimized criteria'}: ${studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, true)})</li>`;
            } else {
                textList += `<li>${currentLang === 'de' ? 'Für das' : 'For the'} ${kolText}: ${currentLang === 'de' ? `Keine validen optimierten Kriterien für Zielmetrik "${bfMetricName}" ermittelt oder Performance nicht berechenbar.` : `No valid optimized criteria determined or performance not computable for target metric "${bfMetricName}".`}</li>`;
            }
        });
        textList += '</ul>';

        if (currentLang === 'de') {
            return `<p>Die mittels Brute-Force-Algorithmus für die Zielmetrik "${bfMetricName}" optimierten T2-Kriteriensets zeigten folgende Leistung (Details in ${table5Ref}):</p>${textList}`;
        } else {
            return `<p>The T2 criteria sets optimized using a brute-force algorithm for the target metric "${bfMetricName}" showed the following performance (details in ${table5Ref}):</p>${textList}`;
        }
    }
    
    function _getResultsComparisonASvsLitT2Text() {
        const table6Ref = _getTableRef('TABLE_COMPARISON_AS_VS_LIT_T2');
        let text = currentLang === 'de' ? `<p>Die statistischen Vergleiche der diagnostischen Güte zwischen dem Avocado Sign (AS) und den Literatur-basierten T2-Kriteriensets sind in ${table6Ref} zusammengefasst. Die Ergebnisse der DeLong-Tests für AUCs und McNemar-Tests für Accuracies waren wie folgt:</p><ul>` : `<p>Statistical comparisons of diagnostic performance between the Avocado Sign (AS) and literature-based T2 criteria sets are summarized in ${table6Ref}. The results of DeLong tests for AUCs and McNemar tests for accuracies were as follows:</p><ul>`;
        
        const comparisons = [
            { kolId: 'Gesamt', litSetId: 'koh_2008_morphology', litSetName: referenceManager.getShortCitation('KOH_2008') + " " + referenceManager.cite('KOH_2008')},
            { kolId: 'direkt OP', litSetId: 'rutegard_et_al_esgar', litSetName: referenceManager.getShortCitation('BEETS_TAN_2018_ESGAR') + " / " + referenceManager.getShortCitation('RUTEGARD_2025') + " " + referenceManager.cite('RUTEGARD_2025') + ", " + referenceManager.cite('BEETS_TAN_2018_ESGAR')},
            { kolId: 'nRCT', litSetId: 'barbaro_2024_restaging', litSetName: referenceManager.getShortCitation('BARBARO_2024') + " " + referenceManager.cite('BARBARO_2024')}
        ];

        comparisons.forEach(comp => {
            const vglData = currentAllStats?.[comp.kolId]?.[`vergleichASvsT2_literatur_${comp.litSetId}`];
            if (vglData) {
                text += `<li>${currentLang === 'de' ? 'Im' : 'In the'} ${getKollektivDisplayName(comp.kolId)}-${currentLang === 'de' ? 'Kollektiv' : 'cohort'}, AS vs. ${comp.litSetName}: AUC (DeLong) p=${_formatPValueForText(vglData.delong?.pValue)}; Acc (McNemar) p=${_formatPValueForText(vglData.mcnemar?.pValue)}.</li>`;
            }
        });
        text += `</ul>`;
        return text;
    }

    function _getResultsComparisonASvsOptimierteT2Text() {
        const table7Ref = _getTableRef('TABLE_COMPARISON_AS_VS_BF_T2');
        const fig3ARef = _getFigureRef('FIGURE_PERFORMANCE_COMPARISON_GESAMT');
        const fig3BRef = _getFigureRef('FIGURE_PERFORMANCE_COMPARISON_DIREKT_OP');
        const fig3CRef = _getFigureRef('FIGURE_PERFORMANCE_COMPARISON_NRCT');
        const bfMetricName = currentOptions.publicationBfMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        let text = currentLang === 'de' ? `<p>Die Vergleiche zwischen dem Avocado Sign (AS) und den für "${bfMetricName}" optimierten T2-Kriteriensets sind in ${table7Ref} und ${fig3ARef}-${fig3CRef} dargestellt. Die Ergebnisse der DeLong-Tests für AUCs und McNemar-Tests für Accuracies waren:</p><ul>` : `<p>Comparisons between the Avocado Sign (AS) and T2 criteria sets optimized for "${bfMetricName}" are presented in ${table7Ref} and ${fig3ARef}-${fig3CRef}. The results of DeLong tests for AUCs and McNemar tests for accuracies were:</p><ul>`;

        ['Gesamt', 'direkt OP', 'nRCT'].forEach(kolId => {
            const vglData = currentAllStats?.[kolId]?.vergleichASvsT2_bruteforce;
            if (vglData) {
                 text += `<li>${currentLang === 'de' ? 'Im' : 'In the'} ${getKollektivDisplayName(kolId)}-${currentLang === 'de' ? 'Kollektiv' : 'cohort'}: AS vs. optimierte T2: AUC (DeLong) p=${_formatPValueForText(vglData.delong?.pValue)}; Acc (McNemar) p=${_formatPValueForText(vglData.mcnemar?.pValue)}.</li>`;
            }
        });
        text += `</ul>`;
        return text;
    }
    
    function _getDiscussionTextPlaceholder(subSectionId) {
         const sectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === 'diskussion')?.subSections.find(sub => sub.id === subSectionId);
         const label = sectionConfig ? sectionConfig.label : subSectionId.replace('diskussion_', '').replace(/_/g, ' ');
        if (currentLang === 'de') {
            return `<p><em>[Die detaillierte Diskussion zum Abschnitt "${label}" ist manuell zu verfassen und sollte die Ergebnisse im Kontext der Literatur bewerten, Stärken und Limitationen der Studie erörtern sowie klinische Implikationen und zukünftige Forschungsrichtungen aufzeigen.]</em></p>`;
        } else {
            return `<p><em>[The detailed discussion for the "${label}" section should be written manually, evaluating the results in the context of existing literature, discussing the strengths and limitations of the study, and outlining clinical implications and future research directions.]</em></p>`;
        }
    }
    
    function _getConclusionSummaryText() {
        if (currentLang === 'de') {
            return `<p><em>[Eine prägnante Zusammenfassung der Studie und ihrer Kernaussage bezüglich des Avocado Signs im Vergleich zu T2-Kriterien ist hier manuell zu formulieren.]</em></p>`;
        } else {
            return `<p><em>[A concise summary of the study and its main conclusion regarding the Avocado Sign compared to T2 criteria should be formulated manually here.]</em></p>`;
        }
    }

    function getSectionText(sectionId, lang, allKollektivStats, commonData, options) {
        _initialize(lang, allKollektivStats, commonData, options);
        if (sectionId !== 'referenzen_list') { // Reset for all sections except the reference list itself
            referenceManager.resetUsedReferences();
        }
        
        let content = '';
        const mainSectionKey = sectionId.split('_')[0];

        if (mainSectionKey === 'methoden') {
            switch (sectionId) {
                case 'methoden_studienanlage': content = _getMethodsStudienanlageText(); break;
                case 'methoden_patientenkollektiv': content = _getMethodsPatientenkollektivText(); break;
                case 'methoden_mrt_protokoll': content = _getMethodsMRTProtokollText(); break;
                case 'methoden_as_definition': content = _getMethodsASDefinitionText(); break;
                case 'methoden_t2_definition_literatur': content = _getMethodsT2DefinitionLiteraturText(); break;
                case 'methoden_t2_definition_bruteforce': content = _getMethodsT2DefinitionBruteforceText(); break;
                case 'methoden_referenzstandard': content = _getMethodsReferenzstandardText(); break;
                case 'methoden_statistische_analyse': content = _getMethodsStatistischeAnalyseText(); break;
                default: content = _getPlaceholderTextForSection(sectionId);
            }
        } else if (mainSectionKey === 'ergebnisse') {
            switch (sectionId) {
                case 'ergebnisse_patientencharakteristika': content = _getResultsPatientencharakteristikaText(); break;
                case 'ergebnisse_as_performance': content = _getResultsASPerformanceText(); break;
                case 'ergebnisse_literatur_t2_performance': content = _getResultsLitT2PerformanceText(); break;
                case 'ergebnisse_optimierte_t2_performance': content = _getResultsOptimierteT2PerformanceText(); break;
                case 'ergebnisse_vergleich_as_vs_literatur_t2': content = _getResultsComparisonASvsLitT2Text(); break;
                case 'ergebnisse_vergleich_as_vs_optimierte_t2': content = _getResultsComparisonASvsOptimierteT2Text(); break;
                default: content = _getPlaceholderTextForSection(sectionId);
            }
        } else if (mainSectionKey === 'abstract') {
             if (sectionId === 'abstract_purpose') content = _getAbstractPurposeText();
             else if (sectionId === 'abstract_materials_methods') content = _getAbstractMethodsText();
             else if (sectionId === 'abstract_results') content = _getAbstractResultsText();
             else if (sectionId === 'abstract_conclusion') content = _getAbstractConclusionText();
             else content = _getPlaceholderTextForSection(sectionId);
        } else if (mainSectionKey === 'einleitung') {
            if (sectionId === 'introduction_background') content = _getIntroductionBackgroundText();
            else if (sectionId === 'introduction_rationale_objective') content = _getIntroductionRationaleObjectiveText();
            else content = _getPlaceholderTextForSection(sectionId);
        } else if (mainSectionKey === 'diskussion') {
            content = _getDiscussionTextPlaceholder(sectionId); // Generic placeholder for all discussion subsections
        } else if (mainSectionKey === 'schlussfolgerung') {
            if (sectionId === 'schlussfolgerung_summary') content = _getConclusionSummaryText();
            else content = _getPlaceholderTextForSection(sectionId);
        } else if (sectionId === 'referenzen_list') {
            content = referenceManager.getBibliographyHTML(currentLang);
        } else {
            console.warn(`publicationTextGenerator: Unbekannte Sektions-ID '${sectionId}'`);
            content = _getPlaceholderTextForSection(sectionId.replace(/^(abstract_|introduction_|methoden_|ergebnisse_|diskussion_|schlussfolgerung_)/, ''));
        }
        return content;
    }

    function getSectionTextAsMarkdown(sectionId, lang, allKollektivStats, commonData, options) {
        const htmlContent = getSectionText(sectionId, lang, allKollektivStats, commonData, options);
        if (!htmlContent) return '';

        let markdown = String(htmlContent);
        markdown = markdown.replace(/<p>/g, '\n').replace(/<\/p>/g, '\n');
        markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
        markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
        markdown = markdown.replace(/<i>(.*?)<\/i>/g, '*$1*');
        markdown = markdown.replace(/<ul>/g, '').replace(/<\/ul>/g, '');
        markdown = markdown.replace(/<ol class="publication-references-list">/g, '\n').replace(/<\/ol>/g, '');
        markdown = markdown.replace(/<li>/g, (match) => {
            if (sectionId === 'referenzen_list') return ''; 
            return '\n* ';
        }).replace(/<\/li>/g, '');
        markdown = markdown.replace(/<br\s*\/?>/g, '\n');

        markdown = markdown.replace(/<a href="#(pub-table-[a-zA-Z0-9-]+)">(.*?)<\/a>/g, (match, p1, p2) => {
            const tableKey = Object.keys(PUBLICATION_CONFIG.publicationElements).find(key => PUBLICATION_CONFIG.publicationElements[key].id === p1);
            return tableKey ? _getTableRef(tableKey, lang) : p2;
        });
        markdown = markdown.replace(/<a href="#(pub-fig-[a-zA-Z0-9-]+)">(.*?)<\/a>/g, (match, p1, p2) => {
            const figKey = Object.keys(PUBLICATION_CONFIG.publicationElements).find(key => PUBLICATION_CONFIG.publicationElements[key].id === p1);
            return figKey ? _getFigureRef(figKey, lang) : p2;
        });
         markdown = markdown.replace(/<a href="#(pub-chart-[a-zA-Z0-9-]+)">(.*?)<\/a>/g, (match, p1, p2) => {
            const figKey = Object.keys(PUBLICATION_CONFIG.publicationElements).find(key => PUBLICATION_CONFIG.publicationElements[key].id === p1);
            return figKey ? _getFigureRef(figKey, lang) : p2;
        });


        markdown = markdown.replace(/&auml;/g, 'ä').replace(/&ouml;/g, 'ö').replace(/&uuml;/g, 'ü');
        markdown = markdown.replace(/&Auml;/g, 'Ä').replace(/&Ouml;/g, 'Ö').replace(/&Uuml;/g, 'Ü');
        markdown = markdown.replace(/&szlig;/g, 'ß');
        markdown = markdown.replace(/&ndash;/g, '–');
        markdown = markdown.replace(/&mdash;/g, '—');
        markdown = markdown.replace(/&rsquo;/g, "'");
        markdown = markdown.replace(/&lsquo;/g, "'");
        markdown = markdown.replace(/&rdquo;/g, '"');
        markdown = markdown.replace(/&ldquo;/g, '"');
        markdown = markdown.replace(/&copy;/g, '(C)');
        markdown = markdown.replace(/&reg;/g, '(R)');
        markdown = markdown.replace(/&trade;/g, '(TM)');
        markdown = markdown.replace(/&nbsp;/g, ' ');
        markdown = markdown.replace(/&alpha;/g, 'α');
        markdown = markdown.replace(/&ge;/g, '≥');
        markdown = markdown.replace(/&le;/g, '≤');
        markdown = markdown.replace(/ {2,}/g, ' ');
        markdown = markdown.replace(/\n\s*\n/g, '\n\n').trim();

        return markdown;
    }


    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown
    });

})();
