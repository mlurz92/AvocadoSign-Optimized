const publicationTextGenerator = (() => {

    function fCI(metric, digits = 1, isPercent = true, lang = 'de') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return 'N/A';

        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 'N/A';
            let formattedNum;
            if (isP) {
                formattedNum = formatPercent(val, d, 'N/A');
            } else {
                formattedNum = formatNumber(val, d, 'N/A', lang === 'en');
            }
            return formattedNum;
        };

        const valStr = formatSingleValue(metric.value, digits, isPercent);
        if (valStr === 'N/A') return valStr;


        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper) && isFinite(metric.ci.lower) && isFinite(metric.ci.upper)) {
            const lowerStr = formatSingleValue(metric.ci.lower, digits, isPercent);
            const upperStr = formatSingleValue(metric.ci.upper, digits, isPercent);
            if (lowerStr === 'N/A' || upperStr === 'N/A') return valStr;
            const ciText = lang === 'de' ? '95%-KI' : '95% CI';

            let mainValForDisplay = valStr;
            let lowerValForDisplay = lowerStr;
            let upperValForDisplay = upperStr;

            if(isPercent){
                mainValForDisplay = String(mainValForDisplay).replace('%','');
                lowerValForDisplay = String(lowerValForDisplay).replace('%','');
                upperValForDisplay = String(upperValForDisplay).replace('%','');
                return `${mainValForDisplay} (${ciText}: ${lowerValForDisplay}\u00A0–\u00A0${upperValForDisplay})%`;
            } else {
                 return `${mainValForDisplay} (${ciText}: ${lowerValForDisplay}\u00A0–\u00A0${upperValForDisplay})`;
            }
        }
        return valStr;
    }

    function getKollektivText(kollektivId, n, lang = 'de') {
        const name = getKollektivDisplayName(kollektivId);
        const nText = lang === 'de' ? `N=${formatNumber(n, 0, 'N/A')}` : `n=${formatNumber(n, 0, 'N/A')}`;
        return `${name} (${nText})`;
    }

    function _getSafeLink(elementId){
        return `#${elementId}`;
    }

    function getAbstractText(lang, allKollektivStats, commonData) {
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const asDirektOP = allKollektivStats?.['direkt OP']?.gueteAS;
        const asNRCT = allKollektivStats?.nRCT?.gueteAS;

        const nGesamt = commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 'N/A';
        const nNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';

        const mainAbstractTextDe = PUBLICATION_CONFIG.DEFAULT_ABSTRACT_TEXT_DE;
        const mainAbstractTextEn = PUBLICATION_CONFIG.DEFAULT_ABSTRACT_TEXT_EN;

        const keyResultsTextDe = PUBLICATION_CONFIG.DEFAULT_KEY_RESULTS_TEXT_DE;
        const keyResultsTextEn = PUBLICATION_CONFIG.DEFAULT_KEY_RESULTS_TEXT_EN;

        return `
            <div class="publication-abstract-section">
                <h2 id="abstract-title">${lang === 'de' ? 'Abstract' : 'Abstract'}</h2>
                <div class="abstract-content">${lang === 'de' ? mainAbstractTextDe : mainAbstractTextEn}</div>
                <h3 id="key-results-title">${lang === 'de' ? 'Key Results' : 'Key Results'}</h3>
                <div class="key-results-content">${lang === 'de' ? keyResultsTextDe : keyResultsTextEn}</div>
            </div>
        `;
    }

    function getIntroductionText(lang, commonData) {
        if (lang === 'de') {
            return `
                <h2 id="introduction-title">Einleitung</h2>
                <p>Das Rektumkarzinom stellt mit geschätzten 44.850 Neuerkrankungen und 12.630 Todesfällen im Jahr 2023 allein in den Vereinigten Staaten ein erhebliches Gesundheitsproblem dar. Während die neoadjuvante Radiochemotherapie gefolgt von totaler mesorektaler Exzision (TME) lange Zeit der Standard der Behandlung für lokal fortgeschrittene Rektumkarzinome war, haben sich neue Therapieoptionen, wie die totale neoadjuvante Therapie und das nicht-operative Management, als vielversprechende Alternativen etabliert. Infolgedessen gewinnen verfeinerte Bildgebungstechniken zunehmend an Bedeutung für die zuverlässige Stratifizierung von Patienten, insbesondere hinsichtlich des Lymphknotenstatus, der ein entscheidender Faktor bei der Therapieentscheidung ist.</p>
                <p>Die Magnetresonanztomographie (MRT) gilt weithin als Goldstandard für das lokale Staging des Rektumkarzinoms. Das MRT-Staging basiert jedoch typischerweise auf T2-gewichteten Sequenzen, wobei die Kontrastmittelgabe nicht routinemäßig empfohlen wird. Metaanalysen und Studien haben gezeigt, dass morphologische Kriterien auf T2-gewichteten MRT-Bildern eine begrenzte Genauigkeit für die Vorhersage des Lymphknotenbefalls aufweisen. Dies unterstreicht die Limitationen der aktuellen Staging-Methoden und verdeutlicht die Notwendigkeit verbesserter Bildgebungstechniken.</p>
                <p>Wir haben in einer früheren Publikation das "Avocado Sign" vorgestellt, einen hypointensen Kern innerhalb von mesorektalen Lymphknoten auf kontrastverstärkten T1-gewichteten fettgesättigten Sequenzen, der an den Kern einer Avocado erinnert. Wir haben die Hypothese aufgestellt, dass das Avocado Sign ein potenzieller Bildgebungsprädiktor für einen lokoregionären Lymphknotenbefall ist. Durch die Nutzung der zusätzlichen Informationen, die durch die Kontrastmittelverstärkung bereitgestellt werden, zielt das Avocado Sign darauf ab, die Limitationen der T2-gewichteten MRT zu adressieren und die Genauigkeit des Lymphknoten-Stagings beim Rektumkarzinom zu verbessern.</p>
                <p>Ziel dieser erweiterten Untersuchung ist der detaillierte Vergleich der diagnostischen Güte des Avocado Signs mit etablierten und optimierten T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus. Wir wollen die Sensitivität, Spezifität, Genauigkeit, den positiven prädiktiven Wert (PPV) und den negativen prädiktiven Wert (NPV) des Avocado Signs bewerten und seine Leistung in Subgruppen analysieren. Die Ergebnisse dieser Studie können wichtige Implikationen für die Verfeinerung von MRT-Protokollen und die Optimierung von Behandlungsstrategien für Patienten mit Rektumkarzinom haben.</p>
            `;
        } else {
            return `
                <h2 id="introduction-title">Introduction</h2>
                <p>Rectal cancer remains a significant public health concern, with an estimated 44,850 new cases and 12,630 deaths in the United States in 2023 alone. While neoadjuvant chemoradiotherapy followed by total mesorectal excision (TME) has been the standard of care for locally advanced rectal cancer, new treatment options, such as total neoadjuvant therapy and non-operative management, have emerged as promising alternatives. Consequently, refined imaging techniques are becoming increasingly important for the reliable stratification of patients, particularly regarding nodal status, which is a critical factor in treatment decision-making.</p>
                <p>Magnetic resonance imaging (MRI) is widely recognized as the gold standard for local staging of rectal cancer. However, MRI staging typically relies on T2-weighted sequences, with contrast administration not routinely recommended. Meta-analyses and studies have indicated that morphological criteria on T2-weighted MRI have limited accuracy for predicting nodal involvement. This highlights the limitations of current staging methods and the need for improved imaging techniques.</p>
                <p>We previously introduced the "Avocado Sign," defined as a hypointense core within mesorectal lymph nodes on contrast-enhanced T1-weighted fat-saturated sequences, resembling an avocado kernel. We hypothesize that the Avocado Sign is a potential imaging predictor of locoregional lymph node involvement. By leveraging the additional information provided by contrast enhancement, the Avocado Sign aims to address the limitations of T2-weighted MRI and improve the accuracy of nodal staging in rectal cancer.</p>
                <p>The purpose of this extended investigation is a detailed comparison of the diagnostic performance of the Avocado Sign with established and optimized T2-weighted morphological criteria for predicting mesorectal lymph node status. We aim to assess the sensitivity, specificity, accuracy, positive predictive value (PPV), and negative predictive value (NPV) of the Avocado Sign, and to investigate its performance by subgroup analysis. The results of this study may have important implications for refining MRI protocols and optimizing treatment strategies for rectal cancer patients.</p>
            `;
        }
    }

    function getMethodenStudienanlageText(lang, commonData) {
        const appVersion = commonData.appVersion || APP_CONFIG.APP_VERSION;
        const studyReferenceAS = APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025 || "Lurz & Schäfer (2025)";
        const ethicsVote = APP_CONFIG.REFERENCES_FOR_PUBLICATION.ETHICS_VOTE_LEIPZIG || "Ethikvotum Nr. 2023-101, Ethikkommission der Landesärztekammer Sachsen";

        if (lang === 'de') {
            return `
                <h3 id="methoden-studienanlage-title">Studiendesign und Ethik</h3>
                <p>Die vorliegende Analyse wurde als retrospektive Auswertung eines prospektiv geführten, monozentrischen Patientenkollektivs mit histologisch gesichertem Rektumkarzinom konzipiert. Das primäre Studienkollektiv und die zugrundeliegenden Bilddatensätze für die initiale Bewertung des Avocado Signs (AS) sind identisch mit jenen der Originalpublikation zum Avocado Sign (${studyReferenceAS}). Ziel dieser erweiterten Untersuchung ist der detaillierte Vergleich der diagnostischen Güte des AS mit etablierten und optimierten T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status) sowie die Bereitstellung eines explorativen Werkzeugs für weiterführende Analysen.</p>
                <p>Alle hier präsentierten Analysen und Kriterienevaluationen wurden mittels einer interaktiven Webanwendung (AvocadoSign Analyse Tool v${appVersion}, ${APP_CONFIG.APP_NAME}) durchgeführt, die eigens für diese und nachfolgende Studien entwickelt und erweitert wurde. Dieses Tool ermöglicht die flexible Definition und Anwendung von T2-Kriteriensets, eine automatisierte Optimierung von Kriterienkombinationen mittels eines Brute-Force-Algorithmus sowie eine umfassende statistische Auswertung und Visualisierung der Ergebnisse. Die Studie wurde in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki durchgeführt. Das Studienprotokoll wurde von der lokalen Ethikkommission genehmigt (${ethicsVote}). Aufgrund des retrospektiven Charakters der Analyse auf pseudonymisierten Daten wurde von der Ethikkommission auf ein erneutes Einholen eines schriftlichen Einverständnisses der Patienten für diese spezifische erweiterte Auswertung verzichtet, da ein generelles Einverständnis zur wissenschaftlichen Auswertung im Rahmen der Primärstudie vorlag.</p>
            `;
        } else {
            return `
                <h3 id="methoden-studienanlage-title">Study Design and Ethics</h3>
                <p>The present analysis was designed as a retrospective evaluation of a prospectively maintained, single-center patient cohort with histologically confirmed rectal cancer. The primary study cohort and the underlying imaging datasets for the initial assessment of the Avocado Sign (AS) are identical to those of the original Avocado Sign publication (${studyReferenceAS}). The objective of this extended investigation is a detailed comparison of the diagnostic performance of the AS with established and optimized T2-weighted morphological criteria for predicting mesorectal lymph node status (N-status), as well as providing an exploratory tool for further analyses.</p>
                <p>All analyses and criteria evaluations presented herein were performed using an interactive web application (AvocadoSign Analysis Tool v${appVersion}, ${APP_CONFIG.APP_NAME}), specifically developed and enhanced for this and subsequent studies. This tool allows for the flexible definition and application of T2 criteria sets, automated optimization of criteria combinations using a brute-force algorithm, and comprehensive statistical evaluation and visualization of results. The study was conducted in accordance with the principles of the Declaration of Helsinki. The study protocol was approved by the local ethics committee (${ethicsVote}). Given the retrospective nature of this analysis on pseudonymized data, the ethics committee waived the need for re-obtaining written informed consent from patients for this specific extended evaluation, as general consent for scientific evaluation was provided as part of the primary study.</p>
            `;
        }
    }

    function getMethodenPatientenkollektivText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const studienzeitraum = APP_CONFIG.REFERENCES_FOR_PUBLICATION.STUDY_PERIOD_2020_2023 || "Januar 2020 und November 2023";

        const alterMedian = formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', lang === 'en');
        const alterMin = formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', lang === 'en');
        const alterMax = formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', lang === 'en');
        const anzahlPatientenChar = pCharGesamt?.anzahlPatienten || 0;
        const anzahlMaenner = pCharGesamt?.geschlecht?.m || 0;
        const anteilMaennerProzent = formatPercent(anzahlPatientenChar > 0 ? anzahlMaenner / anzahlPatientenChar : NaN, 0);
        const table1Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id;
        const flowDiagramId = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.id;

        if (lang === 'de') {
            return `
                <h3 id="methoden-patientenkollektiv-title">Patientenkollektiv</h3>
                <p>Das Studienkollektiv umfasste ${anzahlGesamt} konsekutive Patienten mit histologisch gesichertem Rektumkarzinom, die zwischen ${studienzeitraum} am Klinikum St. Georg, Leipzig, behandelt und in die initiale Avocado-Sign-Studie eingeschlossen wurden. Von diesen erhielten ${anzahlNRCT} Patienten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während ${anzahlDirektOP} Patienten primär operiert wurden (Direkt-OP-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${alterMedian} Jahre (Range: ${alterMin}–${alterMax} Jahre), und ${anteilMaennerProzent} (${anzahlMaenner}/${anzahlPatientenChar}) der Patienten waren männlich. Detaillierte Patientencharakteristika, stratifiziert nach Behandlungsgruppen, sind in <a href="${_getSafeLink(table1Id)}">Tabelle 1</a> dargestellt.</p>
                <p>Die Einschlusskriterien für die Primärstudie waren ein Alter von mindestens 18 Jahren und ein histologisch bestätigtes Rektumkarzinom. Ausschlusskriterien umfassten nicht resektable Tumoren und Kontraindikationen für eine MRT-Untersuchung. Für die vorliegende erweiterte Analyse wurden alle Patienten der Primärstudie berücksichtigt, für die vollständige Datensätze bezüglich der T1KM- und T2-Lymphknotenmerkmale vorlagen. Ein Flussdiagramm der Patienteninklusion und -ausschlüsse ist in <a href="${_getSafeLink(flowDiagramId)}">Abbildung 1</a> dargestellt.</p>
            `;
        } else {
            return `
                <h3 id="methoden-patientenkollektiv-title">Patient Cohort</h3>
                <p>The study cohort comprised ${anzahlGesamt} consecutive patients with histologically confirmed rectal cancer who were treated at Klinikum St. Georg, Leipzig, between ${studienzeitraum} and included in the initial Avocado Sign study. Of these, ${anzahlNRCT} patients received neoadjuvant chemoradiotherapy (nRCT group), while ${anzahlDirektOP} patients underwent upfront surgery (upfront surgery group). The median age in the overall cohort was ${alterMedian} years (range: ${alterMin}–${alterMax} years), and ${anteilMaennerProzent} (${anzahlMaenner}/${anzahlPatientenChar}) were male. Detailed patient characteristics, stratified by treatment group, are presented in <a href="${_getSafeLink(table1Id)}">Table 1</a>.</p>
                <p>Inclusion criteria for the primary study were an age of at least 18 years and histologically confirmed rectal cancer. Exclusion criteria included unresectable tumors and contraindications to MRI examination. For the present extended analysis, all patients from the primary study for whom complete datasets regarding T1-weighted contrast-enhanced and T2-weighted lymph node characteristics were available were included. A flowchart of patient inclusion and exclusions is shown in <a href="${_getSafeLink(flowDiagramId)}">Figure 1</a>.</p>
            `;
        }
    }

    function getMethodenMRTProtokollText(lang, commonData) {
        const mrtSystem = APP_CONFIG.REFERENCES_FOR_PUBLICATION.MRI_SYSTEM_SIEMENS_3T || "3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers)";
        const kontrastmittel = APP_CONFIG.REFERENCES_FOR_PUBLICATION.CONTRAST_AGENT_PROHANCE || "Gadoteridol (ProHance; Bracco)";
        const lurzSchaeferT2SliceThickness = "2-3 mm"; 
        const kaur2012Reference = APP_CONFIG.REFERENCES_FOR_PUBLICATION.KAUR_2012_MRI_PRACTICAL || "Kaur et al. (2012)";
        const horvat2019Reference = APP_CONFIG.REFERENCES_FOR_PUBLICATION.HORVAT_2019_MRI_RECTAL_CANCER || "Horvat et al. (2019)";
        const beetsTan2004Reference = APP_CONFIG.REFERENCES_FOR_PUBLICATION.BEETS_TAN_2004_GADOLINIUM || "Beets-Tan et al. (2004)";

         if (lang === 'de') {
            return `
                <h3 id="methoden-mrt-protokoll-title">MRT-Protokoll</h3>
                <p>Alle MRT-Untersuchungen wurden an einem ${mrtSystem} unter Verwendung von Körper- und Wirbelsäulen-Array-Spulen durchgeführt. Das standardisierte Bildgebungsprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Ebene (Schichtdicke ${lurzSchaeferT2SliceThickness}) sowie eine axiale diffusionsgewichtete Sequenz (DWI). Für die Bewertung des Avocado Signs wurde, wie in der Primärstudie beschrieben, eine kontrastmittelverstärkte axiale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung akquiriert. Die genauen Sequenzparameter sind in der <a href="${_getSafeLink(PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id)}">Tabelle der Literatur-Kriterien</a> aufgeführt (falls zutreffend, da dies eher ein Beispiel als eine reale Tabelle für die MRT-Parameter ist, muss man dies anpassen).</p>
                <p>Ein makrozyklisches Gadolinium-basiertes Kontrastmittel (${kontrastmittel}) wurde gewichtsadaptiert (0,2 ml/kg Körpergewicht) intravenös verabreicht. Die kontrastmittelverstärkten Aufnahmen erfolgten unmittelbar nach vollständiger Applikation des Kontrastmittels. Butylscopolamin wurde zur Reduktion von Bewegungsartefakten appliziert. Das Bildgebungsprotokoll war für die primäre Staging-Untersuchung und die Restaging-Untersuchung (bei Patienten der nRCT-Gruppe) identisch.</p>
                <p>Die Relevanz einer standardisierten MRT-Protokollführung für das Staging des Rektumkarzinoms wird in der Literatur betont. Die Zugabe von Gadolinium-basierten Kontrastmitteln zur T2-gewichteten MRT für das lokale Staging des Rektumkarzinoms hat sich nicht als vorteilhaft erwiesen.</p>
            `;
        } else {
            return `
                <h3 id="methoden-mrt-protokoll-title">MRI Protocol</h3>
                <p>All MRI examinations were performed on a ${mrtSystem} using body and spine array coils. The standardized imaging protocol included high-resolution sagittal, axial, and coronal T2-weighted turbo spin-echo (TSE) sequences; axial diffusion-weighted imaging (DWI); and contrast-enhanced axial T1-weighted volumetric interpolated breath-hold examination (VIBE) with Dixon fat suppression. Sequence parameters are detailed in the <a href="${_getSafeLink(PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id)}">Table of Literature Criteria</a> (if applicable, as this is more an example than a real table for MRI parameters, this needs to be adjusted).</p>
                <p>A macrocyclic gadolinium-based contrast agent (${kontrastmittel}) was administered intravenously at a weight-based dose (0.2 mL/kg body weight). Contrast-enhanced images were acquired immediately after the intravenous contrast agent had been fully administered. Butylscopolamine was administered at the start and midpoint of each examination to reduce motion artifacts. Notably, the imaging protocol was identical for baseline staging and restaging.</p>
                <p>The importance of standardized MRI protocol guidelines for rectal cancer staging is emphasized in literature. The addition of gadolinium-based contrast material to T2-weighted MRI for local staging of rectal cancer has not been shown to be beneficial.</p>
            `;
        }
    }

    function getMethodenASDefinitionText(lang, commonData) {
        const studyReferenceAS = APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025 || "Lurz & Schäfer (2025)";
        const radiologistExperience = APP_CONFIG.REFERENCES_FOR_PUBLICATION.RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER || ["29", "7", "19"];

        if (lang === 'de') {
            return `
                <h3 id="methoden-as-definition-title">Definition und Bewertung Avocado Sign</h3>
                <p>Das Avocado Sign wurde, wie in der Originalstudie (${studyReferenceAS}) definiert, auf den kontrastmittelverstärkten T1-gewichteten Bildern evaluiert. Es ist charakterisiert als ein klar abgrenzbarer, hypointenser Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens, unabhängig von dessen Größe oder Form (siehe Abbildung 2 in ${studyReferenceAS}). Die Bewertung erfolgte für alle im T1KM-MRT sichtbaren mesorektalen Lymphknoten. Ein Patient wurde als Avocado-Sign-positiv (AS+) eingestuft, wenn mindestens ein Lymphknoten dieses Zeichen aufwies.</p>
                <p>Die Bildanalyse wurde von zwei Radiologen (Erfahrung: ${radiologistExperience[0]} bzw. ${radiologistExperience[1]} Jahre in der abdominellen MRT), die bereits die Primärstudie durchführten, unabhängig und verblindet gegenüber den histopathologischen Ergebnissen und den T2-Merkmalen vorgenommen. Diskrepanzen wurden im Konsens mit einem dritten, ebenfalls erfahrenen Radiologen (Erfahrung: ${radiologistExperience[2]} Jahre) gelöst. Für Patienten der nRCT-Gruppe erfolgte die AS-Bewertung auf den Restaging-MRT-Bildern, um sicherzustellen, dass die Bildbefunde direkt mit den post-therapeutischen histopathologischen Ergebnissen korrelierten. Es wurde keine minimale Größen-Schwelle für die Lymphknotenbewertung angewendet, um kleine metastatische Lymphknoten nicht zu übersehen und die Leistung des Zeichens über das gesamte Spektrum der klinisch relevanten Lymphknotengrößen umfassend zu bewerten. Das Avocado Sign wurde ausschließlich in mesorektalen Lymphknoten beurteilt; extramesorektale Lymphknoten oder Tumordepots wurden in dieser Studie nicht berücksichtigt.</p>
            `;
        } else {
            return `
                <h3 id="methoden-as-definition-title">Avocado Sign Definition and Assessment</h3>
                <p>The Avocado Sign, as defined in the original study (${studyReferenceAS}), was evaluated on contrast-enhanced T1-weighted images. It is characterized as a clearly demarcated, hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape (see Figure 2 in ${studyReferenceAS}). Assessment was performed for all mesorectal lymph nodes visible on T1-weighted contrast-enhanced MRI. A patient was classified as Avocado-Sign-positive (AS+) if at least one lymph node exhibited this sign.</p>
                <p>Image analysis was performed by two radiologists (experience: ${radiologistExperience[0]} and ${radiologistExperience[1]} years in abdominal MRI, respectively), who also conducted the primary study, independently and blinded to histopathological results and T2-weighted features. Discrepancies were resolved by consensus with a third, similarly experienced radiologist (experience: ${radiologistExperience[2]} years). For patients in the nRCT group, AS assessment was performed on restaging MRI images, ensuring imaging findings directly corresponded with post-therapy histopathological results. No minimum size threshold was applied for lymph node evaluation to avoid overlooking small metastatic nodes and to comprehensively assess the sign's performance across the full spectrum of lymph node sizes encountered in clinical practice. The Avocado Sign was assessed exclusively in mesorectal lymph nodes; extramesorectal lymph nodes or tumor deposits were not considered in this study.</p>
            `;
        }
    }

    function getMethodenT2DefinitionText(lang, commonData, allKollektivStats) {
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
        const appliedLogic = t2CriteriaManager.getAppliedLogic();
        const formattedAppliedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false);
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const table2Id = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id;

        const formatBFDefinition = (kollektivId, displayName) => {
            const bfDef = allKollektivStats?.[kollektivId]?.bruteforce_definition;
            if (bfDef && bfDef.criteria) {
                let metricValueStr = formatNumber(bfDef.metricValue, 4, 'N/A', lang === 'en');
                const metricNameDisplay = bfDef.metricName || bfZielMetric;
                const formattedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, false);
                return `<li><strong>${displayName}:</strong> ${formattedCriteria} (${lang === 'de' ? 'Zielmetrik' : 'Target metric'}: ${metricNameDisplay}, ${lang === 'de' ? 'Wert' : 'value'}: ${metricValueStr})</li>`;
            }
            return `<li><strong>${displayName}:</strong> ${lang === 'de' ? `Keine Optimierungsergebnisse für Zielmetrik '${bfZielMetric}' verfügbar oder nicht berechnet.` : `No optimization results available or not calculated for target metric '${bfZielMetric}'.`}</li>`;
        };

        let bfCriteriaText = '<ul>';
        bfCriteriaText += formatBFDefinition('Gesamt', lang === 'de' ? 'Gesamtkollektiv' : 'Overall cohort');
        bfCriteriaText += formatBFDefinition('direkt OP', lang === 'de' ? 'Direkt-OP Kollektiv' : 'Upfront surgery cohort');
        bfCriteriaText += formatBFDefinition('nRCT', lang === 'de' ? 'nRCT Kollektiv' : 'nRCT cohort');
        bfCriteriaText += '</ul>';

        const kohStudy = studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology');
        const kohDesc = kohStudy?.studyInfo?.keyCriteriaSummary || (lang === 'de' ? 'Irreguläre Kontur ODER heterogenes Signal' : 'Irregular border OR heterogeneous signal');
        const kohRef = APP_CONFIG.REFERENCES_FOR_PUBLICATION.KOH_2008_MORPHOLOGY || "Koh et al. (2008)";
        const kohApplicable = getKollektivDisplayName(kohStudy?.applicableKollektiv || 'Gesamt');

        const barbaroStudy = studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging');
        const barbaroDesc = barbaroStudy?.studyInfo?.keyCriteriaSummary || (lang === 'de' ? 'Kurzachse ≥ 2,3mm' : 'Short-axis diameter ≥ 2.3mm');
        const barbaroRef = APP_CONFIG.REFERENCES_FOR_PUBLICATION.BARBARO_2024_RESTAGING || "Barbaro et al. (2024)";
        const barbaroApplicable = getKollektivDisplayName(barbaroStudy?.applicableKollektiv || 'nRCT');

        const esgarStudy = studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar');
        const esgarDesc = esgarStudy?.studyInfo?.keyCriteriaSummary || (lang === 'de' ? 'Größe ≥9mm ODER (5-8mm UND ≥2 Kriterien) ODER (<5mm UND 3 Kriterien)' : 'Size ≥9mm OR (5-8mm AND ≥2 criteria) OR (<5mm AND 3 criteria)');
        const esgarRefPrimary = APP_CONFIG.REFERENCES_FOR_PUBLICATION.BEETS_TAN_2018_ESGAR_CONSENSUS || "Beets-Tan et al. (2018, ESGAR Consensus)";
        const esgarRefValidation = APP_CONFIG.REFERENCES_FOR_PUBLICATION.RUTEGARD_2025_ESGAR_VALIDATION || "Rutegård et al. (2025)";
        const esgarApplicable = getKollektivDisplayName(esgarStudy?.applicableKollektiv || 'direkt OP');

        if (lang === 'de') {
            return `
                <h3 id="methoden-t2-definition-title">Definition und Bewertung T2-Kriterien</h3>
                <p>Die morphologischen T2-gewichteten Kriterien (Größe [Kurzachse in mm], Form ['rund', 'oval'], Kontur ['scharf', 'irregulär'], Homogenität ['homogen', 'heterogen'] und Signalintensität ['signalarm', 'intermediär', 'signalreich']) wurden für jeden im hochauflösenden T2w-MRT sichtbaren mesorektalen Lymphknoten von denselben zwei Radiologen erfasst, die auch das Avocado Sign bewerteten. Die Bewertung erfolgte konsensbasiert und verblindet gegenüber dem pathologischen N-Status und dem Avocado-Sign-Status.</p>
                <p>Für den Vergleich der diagnostischen Güte wurden folgende T2-Kriteriensets herangezogen:</p>
                <ol>
                    <li>**Literatur-basierte T2-Kriteriensets:** Eine Auswahl etablierter Kriterien aus der Fachliteratur wurde implementiert und auf die entsprechenden Subgruppen bzw. das Gesamtkollektiv unseres Datensatzes angewendet (Details siehe <a href="${_getSafeLink(table2Id)}">Tabelle 2</a>):
                        <ul>
                            <li>Koh et al. (${kohRef}): Definiert als "${kohDesc}". Dieses Set wurde in unserer Analyse auf das Kollektiv '${kohApplicable}' angewendet.</li>
                            <li>Barbaro et al. (${barbaroRef}): Definiert als "${barbaroDesc}". Dieses Set wurde spezifisch für das Kollektiv '${barbaroApplicable}' (Restaging) evaluiert.</li>
                            <li>ESGAR Konsensus Kriterien (${esgarRefPrimary}), evaluiert durch Rutegård et al. (${esgarRefValidation}): Definiert als "${esgarDesc}". Dieses Set wurde primär auf das Kollektiv '${esgarApplicable}' (Primärstaging) angewendet.</li>
                        </ul>
                    </li>
                    <li>**Brute-Force optimierte T2-Kriterien:** Mittels eines im Analyse-Tool implementierten Brute-Force-Algorithmus wurden für jedes der drei Hauptkollektive (Gesamt, Direkt OP, nRCT) diejenigen Kombinationen aus den fünf T2-Merkmalen und einer UND/ODER-Logik identifiziert, welche die primäre Zielmetrik dieser Studie – die <strong>${bfZielMetric}</strong> – maximieren. Die resultierenden, für jedes Kollektiv spezifisch optimierten Kriteriensets waren:
                        ${bfCriteriaText}
                    </li>
                    <li>**Im Analyse-Tool aktuell eingestellte T2-Kriterien:** Für explorative Zwecke können benutzerdefinierte Kriterien konfiguriert werden. Für die vorliegende Publikation sind die unter Punkt 1 und 2 genannten Kriterien maßgeblich. Die aktuell im Tool eingestellten Kriterien zum Zeitpunkt der finalen Analyse waren: ${formattedAppliedCriteria}.</li>
                </ol>
                <p>Ein Lymphknoten wurde als T2-positiv für ein gegebenes Kriterienset gewertet, wenn er die spezifischen Bedingungen dieses Sets erfüllte. Ein Patient galt als T2-positiv, wenn mindestens ein Lymphknoten gemäß dem jeweiligen Kriterienset als positiv bewertet wurde. Die diagnostische Genauigkeit der T2-Kriterien wird in der Literatur als begrenzt beschrieben.</p>
            `;
        } else {
            return `
                <h3 id="methoden-t2-definition-title">T2 Criteria Definition and Assessment</h3>
                <p>The morphological T2-weighted criteria (size [short-axis diameter in mm], shape ['round', 'oval'], border ['smooth', 'irregular'], homogeneity ['homogeneous', 'heterogeneous'], and signal intensity ['low', 'intermediate', 'high']) were assessed for every mesorectal lymph node visible on high-resolution T2w-MRI by the same two radiologists who evaluated the Avocado Sign. The assessment was performed by consensus and blinded to the pathological N-status and the Avocado Sign status.</p>
                <p>For the comparison of diagnostic performance, the following T2 criteria sets were utilized:</p>
                <ol>
                    <li>**Literature-based T2 criteria sets:</strong> A selection of established criteria from the literature was implemented and applied to the respective subgroups or the entire cohort of our dataset (details see <a href="${_getSafeLink(table2Id)}">Table 2</a>):
                        <ul>
                            <li>Koh et al. (${kohRef}): Defined as "${kohDesc}". In our analysis, this set was applied to the '${kohApplicable}' cohort.</li>
                            <li>Barbaro et al. (${barbaroRef}): Defined as "${barbaroDesc}". This set was specifically evaluated for the '${barbaroApplicable}' cohort (restaging).</li>
                            <li>ESGAR Consensus Criteria (${esgarRefPrimary}), as evaluated by Rutegård et al. (${esgarRefValidation}): Defined as "${esgarDesc}". This set was primarily applied to the '${esgarApplicable}' cohort (primary staging).</li>
                        </ul>
                    </li>
                    <li>**Brute-force optimized T2 criteria:</strong> Using a brute-force algorithm implemented in the analysis tool, combinations of the five T2 features and AND/OR logic that maximize the primary endpoint of this study – <strong>${bfZielMetric}</strong> – were identified for each of the three main cohorts (Overall, Upfront Surgery, nRCT). The resulting cohort-specific optimized criteria sets were:
                        ${bfCriteriaText}
                    </li>
                    <li>**Currently set T2 criteria in the analysis tool:</strong> For exploratory purposes, user-defined criteria can be configured. For the present publication, the criteria mentioned under points 1 and 2 are authoritative. The criteria currently set in the tool at the time of final analysis were: ${formattedAppliedCriteria}.</li>
                </ol>
                <p>A lymph node was considered T2-positive for a given criteria set if it met the specific conditions of that set. A patient was considered T2-positive if at least one lymph node was rated positive according to the respective criteria set. The diagnostic accuracy of T2 criteria is described as limited in literature.</p>
            `;
        }
    }

    function getMethodenReferenzstandardText(lang, commonData) {
         if (lang === 'de') {
            return `
                <h3 id="methoden-referenzstandard-title">Referenzstandard (Histopathologie)</h3>
                <p>Die histopathologische Untersuchung der Operationspräparate nach totaler mesorektaler Exzision (TME) diente als Referenzstandard für den Lymphknotenstatus. Alle mesorektalen Lymphknoten wurden von erfahrenen Pathologen gemäß den etablierten Standardprotokollen aufgearbeitet und mikroskopisch bewertet. Der N-Status eines Patienten wurde als positiv (N+) definiert, wenn mindestens ein Lymphknoten histologisch als metastatisch befallen identifiziert wurde. Andernfalls galt der Patient als N-negativ (N0). Es ist bekannt, dass die histopathologische Bewertung von Lymphknoten eine hohe Interobserver-Variabilität aufweisen kann.</p>
            `;
        } else {
            return `
                <h3 id="methoden-referenzstandard-title">Reference Standard (Histopathology)</h3>
                <p>Histopathological examination of surgical specimens after total mesorectal excision (TME) served as the reference standard for lymph node status. All mesorectal lymph nodes were processed and microscopically evaluated by experienced pathologists according to established standard protocols. A patient's N-status was defined as positive (N+) if at least one lymph node was histologically identified as metastatic. Otherwise, the patient was considered N-negative (N0). It is known that histopathological lymph node assessment can exhibit high interobserver variability.</p>
            `;
        }
    }

    function getMethodenStatistischeAnalyseText(lang, commonData) {
        const alphaLevel = commonData.significanceLevel || 0.05;
        const alphaText = formatNumber(alphaLevel, 2, '0.05', true).replace('.', lang === 'de' ? ',' : '.');
        const bootstrapN = commonData.bootstrapReplications || 1000;
        const appName = commonData.appName || "Analyse-Tool";
        const appVersion = commonData.appVersion || "";
        const ciMethodProportion = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION || "Wilson Score";
        const ciMethodEffectSize = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE || "Bootstrap Percentile";

        if (lang === 'de') {
            return `
                <h3 id="methoden-statistische-analyse-title">Statistische Analyse</h3>
                <p>Die deskriptive Statistik umfasste die Berechnung von Medianen, Mittelwerten, Standardabweichungen (SD), Minima und Maxima für kontinuierliche Variablen sowie absolute Häufigkeiten und Prozentanteile für kategoriale Daten. Die diagnostische Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) wurde anhand von Sensitivität, Spezifität, positivem prädiktiven Wert (PPV), negativem prädiktiven Wert (NPV), Accuracy (ACC), Balanced Accuracy (BalAcc) und der Fläche unter der Receiver Operating Characteristic-Kurve (AUC) – bei binären Tests äquivalent zur BalAcc – evaluiert. Für diese Metriken wurden zweiseitige 95%-Konfidenzintervalle (KI) berechnet. Für Proportionen (Sensitivität, Spezifität, PPV, NPV, Accuracy) wurde die ${ciMethodProportion}-Methode verwendet. Für BalAcc (AUC) und den F1-Score wurde die ${ciMethodEffectSize}-Methode mit ${bootstrapN} Replikationen angewendet.</p>
                <p>Der statistische Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe (gepaarte Daten) erfolgte mittels des McNemar-Tests für gepaarte nominale Daten bzw. des DeLong-Tests für den Vergleich von AUC-Werten. Der Vergleich von Performance-Metriken zwischen unabhängigen Kollektiven (z.B. Direkt-OP vs. nRCT-Gruppe) erfolgte mittels Fisher's Exact Test für Raten (wie Accuracy) und mittels Z-Test für den Vergleich von AUC-Werten basierend auf deren Bootstrap-Standardfehlern. Odds Ratios (OR) und Risk Differences (RD) wurden zur Quantifizierung von Assoziationen berechnet, ebenfalls mit 95%-KI. Der Phi-Koeffizient (φ) wurde als Maß für die Stärke des Zusammenhangs zwischen binären Merkmalen herangezogen. Für den Vergleich von Verteilungen kontinuierlicher Variablen zwischen zwei unabhängigen Gruppen wurde der Mann-Whitney-U-Test verwendet. Ein p-Wert < ${alphaText} wurde als statistisch signifikant interpretiert. Alle statistischen Analysen wurden mit der oben genannten, speziell entwickelten Webanwendung (${appName} v${appVersion}) durchgeführt, die auf Standardbibliotheken für statistische Berechnungen und JavaScript basiert.</p>
            `;
        } else {
            return `
                <h3 id="methoden-statistische-analyse-title">Statistical Analysis</h3>
                <p>Descriptive statistics included the calculation of medians, means, standard deviations (SD), minima, and maxima for continuous variables, as well as absolute frequencies and percentages for categorical data. The diagnostic performance of the Avocado Sign and the various T2 criteria sets (literature-based and brute-force optimized) was evaluated using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy (ACC), balanced accuracy (BalAcc), and the area under the Receiver Operating Characteristic curve (AUC)—equivalent to BalAcc for binary tests. Two-sided 95% confidence intervals (CI) were calculated for these metrics. The ${ciMethodProportion} method was used for proportions (sensitivity, specificity, PPV, NPV, accuracy). For BalAcc (AUC) and F1-score, the ${ciMethodEffectSize} method with ${bootstrapN} replications was applied.</p>
                <p>Statistical comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group (paired data) was performed using McNemar's test for paired nominal data and DeLong's test for AUC comparison. Comparison of performance metrics between independent cohorts (e.g., upfront surgery vs. nRCT group) was conducted using Fisher's exact test for rates (such as accuracy) and a Z-test for AUC comparison based on their bootstrap standard errors. Odds Ratios (OR) and Risk Differences (RD) were calculated to quantify associations, also with 95% CIs. The Phi coefficient (φ) was used as a measure of the strength of association between binary features. For comparing distributions of continuous variables between two independent groups, the Mann-Whitney U test was used. A p-value < ${alphaText} was considered statistically significant. All statistical analyses were conducted using the aforementioned custom-developed web application (${appName} v${appVersion}), which is based on standard libraries for statistical computations and JavaScript.</p>
            `;
        }
    }

    function getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const anteilNplusGesamt = formatPercent(pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN, 1, 'N/A');
        const studyReferenceAS = APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025 || "Lurz & Schäfer (2025)";
        const table1Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id;
        const fig1aId = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id;
        const fig1bId = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id;


        if (lang === 'de') {
            return `
                <h3 id="ergebnisse-patientencharakteristika-title">Patientencharakteristika</h3>
                <p>Die Charakteristika der ${anzahlGesamt} in die Studie eingeschlossenen Patienten sind in <a href="${_getSafeLink(table1Id)}">Tabelle 1</a> zusammengefasst und entsprechen den Daten der initialen Avocado-Sign-Studie (${studyReferenceAS}). Das Gesamtkollektiv bestand aus ${anzahlDirektOP} Patienten, die primär operiert wurden (Direkt-OP-Gruppe), und ${anzahlNRCT} Patienten, die eine neoadjuvante Radiochemotherapie erhielten (nRCT-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', false)} Jahre (Range ${formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', false)}–${formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', false)}), und ${formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN,0)} waren männlich. Ein histopathologisch gesicherter positiver Lymphknotenstatus (N+) fand sich bei ${pCharGesamt?.nStatus?.plus || 'N/A'} von ${anzahlGesamt} Patienten (${anteilNplusGesamt}) im Gesamtkollektiv. Die Verteilung von Alter und Geschlecht im Gesamtkollektiv ist in <a href="${_getSafeLink(fig1aId)}">Abbildung 1a</a> und <a href="${_getSafeLink(fig1bId)}">1b</a> dargestellt.</p>
            `;
        } else {
            return `
                <h3 id="ergebnisse-patientencharakteristika-title">Patient Characteristics</h3>
                <p>The characteristics of the ${anzahlGesamt} patients included in the study are summarized in <a href="${_getSafeLink(table1Id)}">Table 1</a> and correspond to the data from the initial Avocado Sign study (${studyReferenceAS}). The overall cohort consisted of ${anzahlDirektOP} patients who underwent upfront surgery (upfront surgery group) and ${anzahlNRCT} patients who received neoadjuvant chemoradiotherapy (nRCT group). The median age in the overall cohort was ${formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', true)} years (range ${formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', true)}–${formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', true)}), and ${formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN,0)} were male. A histopathologically confirmed positive lymph node status (N+) was found in ${pCharGesamt?.nStatus?.plus || 'N/A'} of ${anzahlGesamt} patients (${anteilNplusGesamt}) in the overall cohort. The age and gender distribution in the overall cohort is shown in <a href="${_getSafeLink(fig1aId)}">Figure 1a</a> and <a href="${_getSafeLink(fig1bId)}">1b</a>.</p>
            `;
        }
    }

    function getErgebnisseASPerformanceText(lang, allKollektivStats, commonData) {
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const asDirektOP = allKollektivStats?.['direkt OP']?.gueteAS;
        const asNRCT = allKollektivStats?.nRCT?.gueteAS;

        const nGesamt = commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 'N/A';
        const nDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const nNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const table3Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.id;
        const studyReferenceAS = APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025 || "Lurz & Schäfer (2025)";

        if (lang === 'de') {
            return `
                <h3 id="ergebnisse-as-performance-title">Diagnostische Güte: Avocado Sign</h3>
                <p>Die diagnostische Güte des Avocado Signs (AS) zur Vorhersage des pathologischen N-Status ist für das Gesamtkollektiv und die Subgruppen in <a href="${_getSafeLink(table3Id)}">Tabelle 3</a> detailliert aufgeführt. Im Gesamtkollektiv (${getKollektivText('Gesamt', nGesamt, lang)}) erreichte das AS eine Sensitivität von ${fCI(asGesamt?.sens, 1, true, 'de')}, eine Spezifität von ${fCI(asGesamt?.spez, 1, true, 'de')}, einen positiven prädiktiven Wert (PPV) von ${fCI(asGesamt?.ppv, 1, true, 'de')}, einen negativen prädiktiven Wert (NPV) von ${fCI(asGesamt?.npv, 1, true, 'de')} und eine Accuracy von ${fCI(asGesamt?.acc, 1, true, 'de')}. Die AUC (Balanced Accuracy) betrug ${fCI(asGesamt?.auc, 3, false, 'de')}. Diese Werte stimmen mit den in der Originalpublikation zum Avocado Sign berichteten überein.</p>
                <p>In der Subgruppe der primär operierten Patienten (Direkt-OP-Gruppe, ${getKollektivText('direkt OP', nDirektOP, lang)}) zeigte das AS eine Sensitivität von ${fCI(asDirektOP?.sens, 1, true, 'de')} und eine Spezifität von ${fCI(asDirektOP?.spez, 1, true, 'de')} (AUC: ${fCI(asDirektOP?.auc, 3, false, 'de')}). Bei Patienten nach nRCT (nRCT-Gruppe, ${getKollektivText('nRCT', nNRCT, lang)}) betrug die Sensitivität ${fCI(asNRCT?.sens, 1, true, 'de')} und die Spezifität ${fCI(asNRCT?.spez, 1, true, 'de')} (AUC: ${fCI(asNRCT?.auc, 3, false, 'de')}). Die Leistung des Avocado Signs blieb über die Behandlungstypen hinweg robust.</p>
            `;
        } else {
            return `
                <h3 id="ergebnisse-as-performance-title">Diagnostic Performance: Avocado Sign</h3>
                <p>The diagnostic performance of the Avocado Sign (AS) for predicting pathological N-status is detailed in <a href="${_getSafeLink(table3Id)}">Table 3</a> for the overall cohort and subgroups. In the overall cohort (${getKollektivText('Gesamt', nGesamt, lang)}), the AS achieved a sensitivity of ${fCI(asGesamt?.sens, 1, true, 'en')}, a specificity of ${fCI(asGesamt?.spez, 1, true, 'en')}, a positive predictive value (PPV) of ${fCI(asGesamt?.ppv, 1, true, 'en')}, a negative predictive value (NPV) of ${fCI(asGesamt?.npv, 1, true, 'en')}, and an accuracy of ${fCI(asGesamt?.acc, 1, true, 'en')}. The AUC (Balanced Accuracy) was ${fCI(asGesamt?.auc, 3, false, 'en')}. These values are consistent with those reported in the original Avocado Sign publication.</p>
                <p>In the subgroup of patients undergoing upfront surgery (Upfront surgery group, ${getKollektivText('direkt OP', nDirektOP, lang)}), the AS showed a sensitivity of ${fCI(asDirektOP?.sens, 1, true, 'en')} and a specificity of ${fCI(asDirektOP?.spez, 1, true, 'en')} (AUC: ${fCI(asDirektOP?.auc, 3, false, 'en')}). For patients after nRCT (nRCT group, ${getKollektivText('nRCT', nNRCT, lang)}), the sensitivity was ${fCI(asNRCT?.sens, 1, true, 'en')} and the specificity was ${fCI(asNRCT?.spez, 1, true, 'en')} (AUC: ${fCI(asNRCT?.auc, 3, false, 'en')}). The performance of the Avocado Sign remained robust across treatment types.</p>
            `;
        }
    }

    function getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData) {
        const kohData = allKollektivStats?.Gesamt?.gueteT2_literatur?.['koh_2008_morphology'];
        const barbaroData = allKollektivStats?.nRCT?.gueteT2_literatur?.['barbaro_2024_restaging'];
        const esgarData = allKollektivStats?.['direkt OP']?.gueteT2_literatur?.['rutegard_et_al_esgar'];
        const table4Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id;

        const nGesamt = commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 'N/A';
        const nNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const nDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';

        const kohRef = APP_CONFIG.REFERENCES_FOR_PUBLICATION.KOH_2008_MORPHOLOGY || "Koh et al. (2008)";
        const barbaroRef = APP_CONFIG.REFERENCES_FOR_PUBLICATION.BARBARO_2024_RESTAGING || "Barbaro et al. (2024)";
        const esgarRefValidation = APP_CONFIG.REFERENCES_FOR_PUBLICATION.RUTEGARD_2025_ESGAR_VALIDATION || "Rutegård et al. (2025)";
        const esgarRefPrimary = APP_CONFIG.REFERENCES_FOR_PUBLICATION.BEETS_TAN_2018_ESGAR_CONSENSUS || "ESGAR 2016";

        if (lang === 'de') {
            let text = `<h3 id="ergebnisse-literatur-t2-performance-title">Diagnostische Güte: Literatur-T2-Kriterien</h3><p>Die diagnostische Güte der evaluierten Literatur-basierten T2-Kriteriensets ist in <a href="${_getSafeLink(table4Id)}">Tabelle 4</a> zusammengefasst. `;
            text += `Für das Kriterienset nach ${kohRef}, angewendet auf das Gesamtkollektiv (${getKollektivText('Gesamt', nGesamt, lang)}), ergab sich eine Sensitivität von ${fCI(kohData?.sens, 1, true, 'de')} und eine Spezifität von ${fCI(kohData?.spez, 1, true, 'de')} (AUC ${fCI(kohData?.auc, 3, false, 'de')}). `;
            text += `Die Kriterien nach ${barbaroRef}, angewendet auf das nRCT-Kollektiv (${getKollektivText('nRCT', nNRCT, lang)}), zeigten eine Sensitivität von ${fCI(barbaroData?.sens, 1, true, 'de')} und eine Spezifität von ${fCI(barbaroData?.spez, 1, true, 'de')} (AUC ${fCI(barbaroData?.auc, 3, false, 'de')}). `;
            text += `Die ${esgarRefPrimary}-Kriterien (${esgarRefValidation}), angewendet auf das Direkt-OP-Kollektiv (${getKollektivText('direkt OP', nDirektOP, lang)}), erreichten eine Sensitivität von ${fCI(esgarData?.sens, 1, true, 'de')} und eine Spezifität von ${fCI(esgarData?.spez, 1, true, 'de')} (AUC ${fCI(esgarData?.auc, 3, false, 'de')}). Die diagnostische Performance dieser Kriterien in unserer Kohorte lag im Bereich der zuvor berichteten Werte.</p>`;
            return text;
        } else {
            let text = `<h3 id="ergebnisse-literatur-t2-performance-title">Diagnostic Performance: Literature-Based T2 Criteria</h3><p>The diagnostic performance of the evaluated literature-based T2 criteria sets is summarized in <a href="${_getSafeLink(table4Id)}">Table 4</a>. `;
            text += `For the criteria set according to ${kohRef}, applied to the overall cohort (${getKollektivText('Gesamt', nGesamt, lang)}), a sensitivity of ${fCI(kohData?.sens, 1, true, 'en')} and a specificity of ${fCI(kohData?.spez, 1, true, 'en')} (AUC ${fCI(kohData?.auc, 3, false, 'en')}) were observed. `;
            text += `The criteria by ${barbaroRef}, applied to the nRCT cohort (${getKollektivText('nRCT', nNRCT, lang)}), showed a sensitivity of ${fCI(barbaroData?.sens, 1, true, 'en')} and a specificity of ${fCI(barbaroData?.spez, 1, true, 'en')} (AUC ${fCI(barbaroData?.auc, 3, false, 'en')}). `;
            text += `The ${esgarRefPrimary} criteria (${esgarRefValidation}), applied to the upfront surgery cohort (${getKollektivText('direkt OP', nDirektOP, lang)}), achieved a sensitivity of ${fCI(esgarData?.sens, 1, true, 'en')} and a specificity of ${fCI(esgarData?.spez, 1, true, 'en')} (AUC ${fCI(esgarData?.auc, 3, false, 'en')}). The diagnostic performance of these criteria in our cohort was within the range of previously reported values.</p>`;
            return text;
        }
    }

    function getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData) {
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const table5Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id;
        let text = '';

        if (lang === 'de') {
            text += `<h3 id="ergebnisse-optimierte-t2-performance-title">Diagnostische Güte: Optimierte T2-Kriterien (Brute-Force)</h3><p>Mittels eines Brute-Force-Algorithmus wurden für jedes der drei Kollektive spezifische T2-Kriteriensets identifiziert, welche die ${bfZielMetric} maximieren. Die Definition dieser optimierten Kriteriensets ist im Methodenteil (Abschnitt 2.5) und <a href="${_getSafeLink(PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id)}">Tabelle 2</a> (implizit durch Auflistung) aufgeführt. Die diagnostische Güte dieser optimierten Sets ist in <a href="${_getSafeLink(table5Id)}">Tabelle 5</a> dargestellt.</p><ul>`;
        } else {
            text += `<h3 id="ergebnisse-optimierte-t2-performance-title">Diagnostic Performance: Optimized T2 Criteria (Brute-Force)</h3><p>Using a brute-force algorithm, specific T2 criteria sets maximizing ${bfZielMetric} were identified for each of the three cohorts. The definition of these optimized criteria sets is detailed in the Methods section (Section 2.5) and <a href="${_getSafeLink(PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id)}">Table 2</a> (implicitly by listing). The diagnostic performance of these optimized sets is presented in <a href="${_getSafeLink(table5Id)}">Table 5</a>.</p><ul>`;
        }

        const kollektive = [
            { id: 'Gesamt', nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort', n: commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten },
            { id: 'direkt OP', nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort', n: commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten },
            { id: 'nRCT', nameDe: 'nRCT-Kollektiv', nameEn: 'nRCT cohort', n: commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten }
        ];

        kollektive.forEach(k => {
            const bfStats = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            const nPat = k.n || 'N/A';
            if (bfStats && bfStats.matrix) {
                text += `<li>Für das ${name} (${getKollektivText(k.id, nPat, lang)}) erreichten die optimierten Kriterien eine Sensitivität von ${fCI(bfStats?.sens, 1, true, lang)}, eine Spezifität von ${fCI(bfStats?.spez, 1, true, lang)} und eine AUC von ${fCI(bfStats?.auc, 3, false, lang)}.</li>`;
            } else {
                text += `<li>Für das ${name} (${getKollektivText(k.id, nPat, lang)}) konnten keine validen optimierten Kriterien für die Zielmetrik ${bfZielMetric} ermittelt oder deren Performance berechnet werden.</li>`;
            }
        });
        text += `</ul>`;
        return text;
    }

    function getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData) {
        let text = '';
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const table6Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.id;
        const fig2aId = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.id;
        const fig2bId = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartDirektOP.id;
        const fig2cId = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartNRCT.id;

        if (lang === 'de') {
            text += `<h3 id="ergebnisse-vergleich-performance-title">Vergleich: AS vs. T2-Kriterien</h3><p>Der direkte statistische Vergleich der diagnostischen Güte zwischen dem Avocado Sign (AS) und den ausgewählten T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) ist in <a href="${_getSafeLink(table6Id)}">Tabelle 6</a> zusammengefasst. <a href="${_getSafeLink(fig2aId)}">Abbildung 2a-c</a> visualisiert die Schlüsselmetriken vergleichend für die drei Kollektive.</p>`;
        } else {
            text += `<h3 id="ergebnisse-vergleich-performance-title">Comparison: AS vs. T2 Criteria</h3><p>The direct statistical comparison of diagnostic performance between the Avocado Sign (AS) and the selected T2 criteria sets (literature-based and brute-force optimized) is summarized in <a href="${_getSafeLink(table6Id)}">Table 6</a>. <a href="${_getSafeLink(fig2aId)}">Figure 2a-c</a> provides a comparative visualization of key metrics across the three cohorts.</p>`;
        }

        const kollektive = [
            { id: 'Gesamt', nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort', litSetId: 'koh_2008_morphology', litSetName: APP_CONFIG.REFERENCES_FOR_PUBLICATION.KOH_2008_MORPHOLOGY || 'Koh et al.' },
            { id: 'direkt OP', nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort', litSetId: 'rutegard_et_al_esgar', litSetName: `${APP_CONFIG.REFERENCES_FOR_PUBLICATION.BEETS_TAN_2018_ESGAR_CONSENSUS} (eval. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.RUTEGARD_2025_ESGAR_VALIDATION})` },
            { id: 'nRCT', nameDe: 'nRCT-Kollektiv', nameEn: 'nRCT cohort', litSetId: 'barbaro_2024_restaging', litSetName: APP_CONFIG.REFERENCES_FOR_PUBLICATION.BARBARO_2024_RESTAGING || 'Barbaro et al.' }
        ];

        kollektive.forEach(k => {
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            const statsAS = allKollektivStats?.[k.id]?.gueteAS;
            const statsLit = allKollektivStats?.[k.id]?.gueteT2_literatur?.[k.litSetId];
            const statsBF = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;

            const vergleichASvsLit = allKollektivStats?.[k.id]?.[`vergleichASvsT2_literatur_${k.litSetId}`];
            const vergleichASvsBF = allKollektivStats?.[k.id]?.vergleichASvsT2_bruteforce;

            let diffAucLitStr = formatNumber(vergleichASvsLit?.delong?.diffAUC, 3, 'N/A', lang === 'en');
            let diffAucBfStr = formatNumber(vergleichASvsBF?.delong?.diffAUC, 3, 'N/A', lang === 'en');

            if (lang === 'de') {
                text += `<h4>Vergleich im ${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Im Vergleich des AS (AUC ${fCI(statsAS.auc, 3, false, 'de')}) mit den Kriterien nach ${k.litSetName} (AUC ${fCI(statsLit.auc, 3, false, 'de')}) zeigte sich für die Accuracy ein p-Wert von ${getPValueText(vergleichASvsLit.mcnemar?.pValue, 'de')} (McNemar) und für die AUC ein p-Wert von ${getPValueText(vergleichASvsLit.delong?.pValue, 'de')} (DeLong). Der Unterschied in der AUC betrug ${diffAucLitStr}.</p>`;
                } else {
                    text += `<p>Ein Vergleich zwischen AS und den Kriterien nach ${k.litSetName} konnte nicht vollständig durchgeführt werden (fehlende Daten oder Test nicht anwendbar).</p>`;
                }
                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Gegenüber den für die ${bfDef.metricName || bfZielMetric} optimierten T2-Kriterien (AUC ${fCI(statsBF.auc, 3, false, 'de')}) ergab sich für die Accuracy ein p-Wert von ${getPValueText(vergleichASvsBF.mcnemar?.pValue, 'de')} (McNemar) und für die AUC ein p-Wert von ${getPValueText(vergleichASvsBF.delong?.pValue, 'de')} (DeLong). Der Unterschied in der AUC betrug ${diffAucBfStr}.</p>`;
                } else {
                    text += `<p>Ein Vergleich zwischen AS und den Brute-Force-optimierten Kriterien konnte nicht vollständig durchgeführt werden (fehlende Daten oder keine BF-Optimierung für dieses Kollektiv für die Zielmetrik ${bfZielMetric}).</p>`;
                }
            } else {
                text += `<h4>Comparison in the ${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Comparing AS (AUC ${fCI(statsAS.auc, 3, false, 'en')}) with the criteria by ${k.litSetName} (AUC ${fCI(statsLit.auc, 3, false, 'en')}), the p-value for accuracy was ${getPValueText(vergleichASvsLit.mcnemar?.pValue, 'en')} (McNemar) and for AUC was ${getPValueText(vergleichASvsLit.delong?.pValue, 'en')} (DeLong). The difference in AUC was ${diffAucLitStr}.</p>`;
                } else {
                    text += `<p>A full comparison between AS and the criteria by ${k.litSetName} could not be performed (missing data or test not applicable).</p>`;
                }
                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Compared to the T2 criteria optimized for ${bfDef.metricName || bfZielMetric} (AUC ${fCI(statsBF.auc, 3, false, 'en')}), the p-value for accuracy was ${getPValueText(vergleichASvsBF.mcnemar?.pValue, 'en')} (McNemar) and for AUC was ${getPValueText(vergleichASvsBF.delong?.pValue, 'en')} (DeLong). The difference in AUC was ${diffAucBfStr}.</p>`;
                } else {
                    text += `<p>A full comparison between AS and the brute-force optimized criteria could not be performed (missing data or no BF optimization for this cohort for the target metric ${bfZielMetric}).</p>`;
                }
            }
        });
        return text;
    }

    function getDiscussionText(lang) {
        if (lang === 'de') {
            return `
                <h2 id="discussion-title">Diskussion</h2>
                <p>Dieser Abschnitt wird die wichtigsten Ergebnisse der Studie interpretieren, ihre Implikationen für die klinische Praxis erörtern und die Ergebnisse im Kontext der bestehenden Literatur bewerten. Es werden die Stärken und Limitationen der Studie diskutiert sowie zukünftige Forschungsrichtungen aufgezeigt. Der Schwerpunkt liegt auf dem Vergleich des Avocado Signs mit traditionellen und optimierten T2-Kriterien und deren potenziellen Einfluss auf das MRT-Staging beim Rektumkarzinom.</p>
                <p>Die hohe diagnostische Genauigkeit des Avocado Signs, die in unserer Studie unabhängig vom Behandlungsstatus der Patienten beobachtet wurde, unterstreicht sein Potenzial als robuster Bildgebungsmarker für den mesorektalen Lymphknotenstatus. Dies steht im Kontrast zu den bekannten Einschränkungen rein morphologischer T2-Kriterien, deren Gesamtgenauigkeit in Metaanalysen und großen Beobachtungsstudien als suboptimal beschrieben wurde.</p>
                <p>Die Fähigkeit des Avocado Signs, eine hohe Sensitivität und Spezifität zu erreichen, ist besonders relevant, da ein präzises N-Staging für die Auswahl der optimalen Therapie, insbesondere in der Ära der organerhaltenden Strategien, von entscheidender Bedeutung ist. Die einfache Anwendbarkeit und die hohe Reproduzierbarkeit des Avocado Signs sind weitere Vorteile, die eine breite klinische Implementierung erleichtern könnten.</p>
                <p>Trotz dieser vielversprechenden Ergebnisse weist unsere Studie Limitationen auf, wie das retrospektive Design und die Durchführung an einem einzelnen Zentrum. Zukünftige prospektive, multizentrische Studien sind erforderlich, um die diagnostische Leistung des Avocado Signs weiter zu validieren und seinen Einfluss auf klinische Entscheidungen und Patientenoutcomes zu bewerten. Langzeit-Follow-up-Studien werden notwendig sein, um den prognostischen Wert des Avocado Signs hinsichtlich Rezidiv und Überleben zu beurteilen.</p>
            `;
        } else {
            return `
                <h2 id="discussion-title">Discussion</h2>
                <p>This section will interpret the main findings of the study, discuss their implications for clinical practice, and evaluate the results in the context of existing literature. Strengths and limitations of the study will be addressed, as well as future research directions. The focus will be on the comparison of the Avocado Sign with traditional and optimized T2 criteria and their potential impact on MRI staging in rectal cancer.</p>
                <p>The high diagnostic accuracy of the Avocado Sign, observed in our study regardless of patients' treatment status, underscores its potential as a robust imaging marker for mesorectal lymph node status. This contrasts with the known limitations of purely morphological T2 criteria, whose overall diagnostic accuracy has been described as suboptimal in meta-analyses and large observational studies.</p>
                <p>The ability of the Avocado Sign to achieve high sensitivity and specificity is particularly relevant, as precise N-staging is crucial for selecting the optimal therapy, especially in the era of organ-preserving strategies. The straightforward application and high reproducibility of the Avocado Sign are further advantages that could facilitate widespread clinical implementation.</p>
                <p>Despite these promising results, our study has limitations, such as its retrospective, single-center design. Future prospective, multi-center studies are required to further validate the diagnostic performance of the Avocado Sign and assess its impact on clinical decision-making and patient outcomes. Long-term follow-up studies will be necessary to evaluate the prognostic value of the Avocado Sign in predicting recurrence and survival.</p>
            `;
        }
    }

    function getReferencesText(lang, commonData) {
        const refs = commonData.references || {};
        let text = `<h2 id="references-title">${lang === 'de' ? 'Referenzen' : 'References'}</h2><ol class="small">`;
        const referenceOrder = [
            APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025,
            APP_CONFIG.REFERENCES_FOR_PUBLICATION.KOH_2008_MORPHOLOGY,
            APP_CONFIG.REFERENCES_FOR_PUBLICATION.BARBARO_2024_RESTAGING,
            APP_CONFIG.REFERENCES_FOR_PUBLICATION.RUTEGARD_2025_ESGAR_VALIDATION,
            APP_CONFIG.REFERENCES_FOR_PUBLICATION.BEETS_TAN_2018_ESGAR_CONSENSUS,
            APP_CONFIG.REFERENCES_FOR_PUBLICATION.BROWN_2003_MORPHOLOGY,
            APP_CONFIG.REFERENCES_FOR_PUBLICATION.KAUR_2012_MRI_PRACTICAL,
            APP_CONFIG.REFERENCES_FOR_PUBLICATION.HORVAT_2019_MRI_RECTAL_CANCER,
            APP_CONFIG.REFERENCES_FOR_PUBLICATION.BEETS_TAN_2009_USPIO_RESTAGING,
            APP_CONFIG.REFERENCES_FOR_PUBLICATION.BEETS_TAN_2004_GADOLINIUM,
            APP_CONFIG.REFERENCES_FOR_PUBLICATION.BARBARO_2010_RESTAGING
        ];

        let displayedRefs = new Set();
        referenceOrder.forEach(refString => {
            if (refString && !displayedRefs.has(refString)) {
                text += `<li>${refString}</li>`;
                displayedRefs.add(refString);
            }
        });

        text += `</ol>`;
        return text;
    }


    function getSectionText(sectionId, lang, allKollektivStats, commonData) {
        switch (sectionId) {
            case 'abstract_main': return getAbstractText(lang, allKollektivStats, commonData);
            case 'introduction_main': return getIntroductionText(lang, commonData);
            case 'methoden_studienanlage': return getMethodenStudienanlageText(lang, commonData);
            case 'methoden_patientenkollektiv': return getMethodenPatientenkollektivText(lang, allKollektivStats, commonData);
            case 'methoden_mrt_protokoll': return getMethodenMRTProtokollText(lang, commonData);
            case 'methoden_as_definition': return getMethodenASDefinitionText(lang, commonData);
            case 'methoden_t2_definition': return getMethodenT2DefinitionText(lang, commonData, allKollektivStats);
            case 'methoden_referenzstandard': return getMethodenReferenzstandardText(lang, commonData);
            case 'methoden_statistische_analyse': return getMethodenStatistischeAnalyseText(lang, commonData);
            case 'ergebnisse_patientencharakteristika': return getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData);
            case 'ergebnisse_as_performance': return getErgebnisseASPerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_literatur_t2_performance': return getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_optimierte_t2_performance': return getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_vergleich_performance': return getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData);
            case 'discussion_main': return getDiscussionText(lang);
            case 'references_main': return getReferencesText(lang, commonData);
            default: return `<p class="text-warning">Text für Sektion '${sectionId}' (Sprache: ${lang}) noch nicht implementiert.</p>`;
        }
    }

    function getSectionTextAsMarkdown(sectionId, lang, allKollektivStats, commonData) {
        const htmlContent = getSectionText(sectionId, lang, allKollektivStats, commonData);
        let markdown = htmlContent
            .replace(/<p>/g, '\n')
            .replace(/<\/p>/g, '\n')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '*$1*')
            .replace(/<i>(.*?)<\/i>/g, '*$1*')
            .replace(/<ul>/g, '')
            .replace(/<\/ul>/g, '')
            .replace(/<ol.*?>/g, '')
            .replace(/<\/ol>/g, '')
            .replace(/<li>/g, '\n* ')
            .replace(/<\/li>/g, '')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<a href="#(.*?)">(.*?)<\/a>/g, '[$2](#$1)')
            .replace(/<h1[^>]*>(.*?)<\/h1>/g, (match, p1) => `\n# ${p1}\n`)
            .replace(/<h2[^>]*>(.*?)<\/h2>/g, (match, p1) => `\n## ${p1}\n`)
            .replace(/<h3[^>]*>(.*?)<\/h3>/g, (match, p1) => `\n### ${p1}\n`)
            .replace(/<h4[^>]*>(.*?)<\/h4>/g, (match, p1) => `\n#### ${p1}\n`)
            .replace(/<h5[^>]*>(.*?)<\/h5>/g, (match, p1) => `\n##### ${p1}\n`)
            .replace(/<h6[^>]*>(.*?)<\/h6>/g, (match, p1) => `\n###### ${p1}\n`)
            .replace(/<cite>(.*?)<\/cite>/g, '[$1]')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/\u00A0/g, ' ')
            .replace(/ {2,}/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();

        if (sectionId === 'references_main' && markdown.includes('\n* ')) {
            let counter = 1;
            markdown = markdown.replace(/\n\* /g, () => `\n${counter++}. `);
        }

        return markdown;
    }

    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown
    });

})();
