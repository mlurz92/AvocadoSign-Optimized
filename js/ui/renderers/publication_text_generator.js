const publicationTextGenerator = (() => {

    function fCI(metric, digits = 1, isPercent = true, lang = 'de') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return 'N/A';

        const formatSingleValue = (val, d, isP, useStandard = false) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 'N/A';
            let numStrToFormat = val;
            let formattedNum;
            if (isP) {
                formattedNum = formatPercent(numStrToFormat, d, 'N/A');
            } else {
                formattedNum = formatNumber(numStrToFormat, d, 'N/A', useStandard);
            }
            return formattedNum;
        };

        const valStr = formatSingleValue(metric.value, digits, isPercent, lang === 'en');
        if (valStr === 'N/A') return valStr;

        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper) && isFinite(metric.ci.lower) && isFinite(metric.ci.upper)) {
            const lowerStr = formatSingleValue(metric.ci.lower, digits, isPercent, lang === 'en');
            const upperStr = formatSingleValue(metric.ci.upper, digits, isPercent, lang === 'en');
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
        const nText = lang === 'de' ? `N=${n}` : `n=${n}`;
        return `${name} (${nText})`;
    }

    function _getSafeLink(elementId){
        return `#${elementId}`;
    }

    function _getRefLink(key, commonData, lang) {
        const refText = commonData.references[key] || key;
        if (lang === 'de') return ` (${refText})`;
        return ` (${refText})`;
    }

    function getAbstractText(lang, allKollektivStats, commonData) {
        const overallAS = allKollektivStats?.Gesamt?.gueteAS;
        const bestBfOverall = allKollektivStats?.Gesamt?.gueteT2_bruteforce;
        const bfMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        if (lang === 'de') {
            return `
                <p><strong>Hintergrund:</strong> Die prätherapeutische N-Status-Bestimmung beim Rektumkarzinom ist entscheidend für die Therapieplanung, jedoch mit aktuellen Methoden oft unzureichend. Das Avocado Sign (AS) zeigte in einer initialen Studie vielversprechende Ergebnisse. Ziel dieser Studie war der Vergleich der diagnostischen Güte des AS mit etablierten Literatur-basierten und datengetriebenen optimierten T2-gewichteten (T2w) Kriterien.</p>
                <p><strong>Methoden:</strong> Es wurde eine retrospektive Analyse eines Kollektivs von ${commonData.nGesamt || 'N/A'} Patienten mit Rektumkarzinom (${commonData.nDirektOP || 'N/A'} primär operiert [Direkt-OP], ${commonData.nNRCT || 'N/A'} nach neoadjuvanter Radiochemotherapie [nRCT]) durchgeführt. Die Performance des AS wurde mit T2w-Kriterien nach Koh et al., Barbaro et al., ESGAR 2016 (eval. Rutegård et al.) sowie einem mittels Brute-Force für die ${bfMetric} optimierten T2w-Set verglichen. Als Referenzstandard diente die Histopathologie.</p>
                <p><strong>Ergebnisse:</strong> Im Gesamtkollektiv erreichte das AS eine Sensitivität von ${fCI(overallAS?.sens, 1, true, 'de')} und eine Spezifität von ${fCI(overallAS?.spez, 1, true, 'de')} (AUC: ${fCI(overallAS?.auc, 3, false, 'de')}). Das für die ${bfMetric} optimierte T2w-Set zeigte im Gesamtkollektiv eine Performance von [Sens: ${fCI(bestBfOverall?.sens,1,true,'de')}, Spez: ${fCI(bestBfOverall?.spez,1,true,'de')}, AUC: ${fCI(bestBfOverall?.auc,3,false,'de')}]. Vergleichende Analysen zeigten [Kurze Zusammenfassung des Hauptvergleichs AS vs. bestes T2].</p>
                <p><strong>Schlussfolgerung:</strong> Das Avocado Sign demonstriert eine [Bewertung der AS Performance, z.B. hohe/robuste] diagnostische Güte. Im Vergleich zu [Literatur/optimierten] T2w-Kriterien zeigte sich [Ergebnis des Vergleichs]. Die Integration des AS könnte die MRI-basierte N-Staging-Genauigkeit beim Rektumkarzinom verbessern.</p>
            `;
        } else {
            return `
                <p><strong>Background:</strong> Pretreatment N-status determination in rectal cancer is crucial for treatment planning but often insufficient with current methods. The Avocado Sign (AS) showed promising results in an initial study. This study aimed to compare the diagnostic performance of AS with established literature-based and data-driven optimized T2-weighted (T2w) criteria.</p>
                <p><strong>Methods:</strong> A retrospective analysis of a cohort of ${commonData.nGesamt || 'N/A'} patients with rectal cancer (${commonData.nDirektOP || 'N/A'} upfront surgery [OP-first], ${commonData.nNRCT || 'N/A'} after neoadjuvant chemoradiotherapy [nCRT]) was performed. AS performance was compared with T2w criteria according to Koh et al., Barbaro et al., ESGAR 2016 (eval. Rutegård et al.), and a T2w set optimized for ${bfMetric} using a brute-force algorithm. Histopathology served as the reference standard.</p>
                <p><strong>Results:</strong> In the overall cohort, AS achieved a sensitivity of ${fCI(overallAS?.sens, 1, true, 'en')} and a specificity of ${fCI(overallAS?.spez, 1, true, 'en')} (AUC: ${fCI(overallAS?.auc, 3, false, 'en')}). The T2w set optimized for ${bfMetric} in the overall cohort showed a performance of [Sens: ${fCI(bestBfOverall?.sens,1,true,'en')}, Spec: ${fCI(bestBfOverall?.spez,1,true,'en')}, AUC: ${fCI(bestBfOverall?.auc,3,false,'en')}]. Comparative analyses revealed [Brief summary of the main comparison AS vs. best T2].</p>
                <p><strong>Conclusion:</strong> The Avocado Sign demonstrates [evaluation of AS performance, e.g., high/robust] diagnostic accuracy. Compared to [literature/optimized] T2w criteria, AS showed [outcome of comparison]. Integration of AS may improve MRI-based N-staging accuracy in rectal cancer.</p>
            `;
        }
    }

    function getEinleitungText(lang, commonData) {
         const asOriginalStudy = _getRefLink('lurzSchaefer2025', commonData, lang);
        if (lang === 'de') {
            return `
                <p>Die genaue Bestimmung des mesorektalen Lymphknotenstatus (N-Status) bei Patienten mit Rektumkarzinom ist ein entscheidender Faktor für die Therapieplanung und Prognoseabschätzung [Referenz relevante Leitlinie/Übersichtsartikel]. Während die Magnetresonanztomographie (MRT) als Goldstandard für das lokale Staging des Rektumkarzinoms gilt, ist die Beurteilung des N-Status allein auf Basis morphologischer T2-gewichteter (T2w) Kriterien oft mit Limitationen in Sensitivität und Spezifität behaftet [Referenzen zu Limitationen des T2-Stagings, z.B. Zhuang et al. 2021, Al-Sukhni et al. 2012]. Dies kann zu einer Über- oder Untertherapie führen, insbesondere im Kontext moderner, organschonender Behandlungsstrategien wie "Watch-and-Wait" oder der totalen neoadjuvanten Therapie (TNT).</p>
                <p>Das "Avocado Sign" (AS) wurde kürzlich als ein neuartiger, Kontrastmittel-basierter MRT-Marker vorgestellt, der auf T1-gewichteten, fettgesättigten Sequenzen evaluiert wird und eine hohe diagnostische Genauigkeit für die Prädiktion des N-Status in einer initialen monozentrischen Studie zeigte${asOriginalStudy}. Definiert als ein klar abgrenzbarer, hypointenser Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens, zeigte das AS Potenzial, die N-Staging-Genauigkeit unabhängig von traditionellen morphologischen T2w-Kriterien zu verbessern.</p>
                <p>Ziel der vorliegenden Studie war es, die diagnostische Leistungsfähigkeit des Avocado Signs auf einer erweiterten Datengrundlage detailliert zu untersuchen und sie systematisch mit etablierten T2w-Kriteriensets aus der Literatur sowie mit datengetriebenen, für spezifische Metriken optimierten T2w-Kriterienkombinationen zu vergleichen. Es soll evaluiert werden, ob das AS eine überlegene oder komplementäre Rolle in der N-Status-Prädiktion bei Patienten mit Rektumkarzinom, sowohl primär operiert als auch nach neoadjuvanter Radiochemotherapie, einnehmen kann.</p>
            `;
        } else {
            return `
                <p>Accurate determination of the mesorectal lymph node status (N-status) in patients with rectal cancer is a critical factor for treatment planning and prognosis estimation [Reference relevant guideline/review article]. While magnetic resonance imaging (MRI) is considered the gold standard for local staging of rectal cancer, N-status assessment based solely on morphological T2-weighted (T2w) criteria is often limited in sensitivity and specificity [References on limitations of T2 staging, e.g., Zhuang et al. 2021, Al-Sukhni et al. 2012]. This can lead to over- or undertreatment, especially in the context of modern organ-preserving treatment strategies such as "Watch-and-Wait" or total neoadjuvant therapy (TNT).</p>
                <p>The "Avocado Sign" (AS) was recently introduced as a novel contrast-enhanced MRI marker, evaluated on T1-weighted fat-saturated sequences, which demonstrated high diagnostic accuracy for N-status prediction in an initial single-center study${asOriginalStudy}. Defined as a clearly demarcated, hypointense core within an otherwise homogeneously hyperintense lymph node, the AS showed potential to improve N-staging accuracy independently of traditional morphological T2w criteria.</p>
                <p>The aim of the present study was to further investigate the diagnostic performance of the Avocado Sign on an extended dataset and to systematically compare it with established literature-based T2w criteria sets as well as with data-driven T2w criteria combinations optimized for specific metrics. This study evaluates whether the AS can play a superior or complementary role in N-status prediction in patients with rectal cancer, both those undergoing upfront surgery and those after neoadjuvant chemoradiotherapy.</p>
            `;
        }
    }


    function getMethodenStudienanlageText(lang, commonData) {
        const appName = commonData.appName || APP_CONFIG.APP_NAME;
        const appVersion = commonData.appVersion || APP_CONFIG.APP_VERSION;
        const studyReferenceAS = _getRefLink('lurzSchaefer2025', commonData, lang);
        const ethicsVote = commonData.references?.ethicsVote || (lang === 'de' ? "Ethikvotum Nr. 2023-101, Ethikkommission der Sächsischen Landesärztekammer" : "Ethics vote No. 2023-101, Ethics Committee of the Saxon State Medical Association");

        if (lang === 'de') {
            return `
                <p>Die vorliegende Untersuchung wurde als retrospektive Analyse eines prospektiv geführten, monozentrischen Patientenkollektivs mit histologisch gesichertem Rektumkarzinom durchgeführt. Das primäre Studienkollektiv und die zugrundeliegenden Bilddatensätze für die initiale Bewertung des Avocado Signs (AS) sind identisch mit jenen der Originalpublikation zum Avocado Sign${studyReferenceAS}. Diese erweiterte Untersuchung dient dem detaillierten Vergleich der diagnostischen Güte des AS mit etablierten sowie optimierten T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status).</p>
                <p>Alle hier durchgeführten Analysen und Kriterienevaluationen erfolgten mittels dieser interaktiven Webanwendung (${appName} v${appVersion}). Dieses Werkzeug ermöglicht die flexible Definition und Anwendung von T2-Kriteriensets, eine automatisierte Optimierung von Kriterienkombinationen mittels eines Brute-Force-Algorithmus sowie eine umfassende statistische Auswertung und Visualisierung der Ergebnisse. Die Studie wurde in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki durchgeführt. Das Studienprotokoll wurde von der lokalen Ethikkommission genehmigt (${ethicsVote}). Aufgrund des retrospektiven Charakters der Analyse auf pseudonymisierten Daten und des bereits für die Primärstudie vorliegenden generellen Einverständnisses zur wissenschaftlichen Auswertung wurde von der Ethikkommission auf ein erneutes Einholen eines spezifischen schriftlichen Einverständnisses der Patienten für diese erweiterte Auswertung verzichtet.</p>
            `;
        } else {
            return `
                <p>This study was conducted as a retrospective analysis of a prospectively maintained, single-center patient cohort with histologically confirmed rectal cancer. The primary study cohort and the underlying imaging datasets for the initial assessment of the Avocado Sign (AS) are identical to those of the original Avocado Sign publication${studyReferenceAS}. This extended investigation serves to provide a detailed comparison of the diagnostic performance of the AS with established and optimized T2-weighted morphological criteria for predicting mesorectal lymph node status (N-status).</p>
                <p>All analyses and criteria evaluations presented herein were performed using this interactive web application (${appName} v${appVersion}). This tool allows for the flexible definition and application of T2 criteria sets, automated optimization of criteria combinations using a brute-force algorithm, and comprehensive statistical evaluation and visualization of results. The study was conducted in accordance with the principles of the Declaration of Helsinki. The study protocol was approved by the local ethics committee (${ethicsVote}). Given the retrospective nature of this analysis on pseudonymized data and the general consent for scientific evaluation already provided as part of the primary study, the ethics committee waived the need for re-obtaining specific written informed consent from patients for this extended evaluation.</p>
            `;
        }
    }

    function getMethodenPatientenkollektivText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const studienzeitraum = commonData.references?.lurzSchaefer2025StudyPeriod || (lang === 'de' ? "Januar 2020 und November 2023" : "January 2020 and November 2023");

        const alterMedian = formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', lang === 'en');
        const alterMin = formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', lang === 'en');
        const alterMax = formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', lang === 'en');
        const anzahlPatientenChar = pCharGesamt?.anzahlPatienten || 0;
        const anzahlMaenner = pCharGesamt?.geschlecht?.m || 0;
        const anteilMaennerProzent = formatPercent(anzahlPatientenChar > 0 ? anzahlMaenner / anzahlPatientenChar : NaN, 0);
        const table1Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id;


        if (lang === 'de') {
            return `
                <p>Das Studienkollektiv umfasste ${anzahlGesamt} konsekutive Patienten mit histologisch gesichertem Rektumkarzinom, die zwischen ${studienzeitraum} am Klinikum St. Georg, Leipzig, behandelt und in die initiale Avocado-Sign-Studie eingeschlossen wurden. Davon erhielten ${anzahlNRCT} Patienten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während ${anzahlDirektOP} Patienten primär operiert wurden (Direkt-OP-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${alterMedian} Jahre (Range: ${alterMin}–${alterMax} Jahre), ${anteilMaennerProzent} (${anzahlMaenner}/${anzahlPatientenChar}) der Patienten waren männlich. Detaillierte Patientencharakteristika sind in <a href="${_getSafeLink(table1Id)}">Tabelle 1</a> dargestellt.</p>
                <p>Die Einschlusskriterien für die Primärstudie waren ein Alter von mindestens 18 Jahren und ein histologisch bestätigtes Rektumkarzinom. Ausschlusskriterien umfassten nicht resektable Tumoren und Kontraindikationen für eine MRT-Untersuchung. Für die vorliegende erweiterte Analyse wurden alle Patienten der Primärstudie berücksichtigt, für die vollständige Datensätze bezüglich der T1KM- und T2-Lymphknotenmerkmale vorlagen.</p>
            `;
        } else {
            return `
                <p>The study cohort comprised ${anzahlGesamt} consecutive patients with histologically confirmed rectal cancer treated at St. Georg Hospital, Leipzig, between ${studienzeitraum} and included in the initial Avocado Sign study. Of these, ${anzahlNRCT} patients received neoadjuvant chemoradiotherapy (nCRT group), while ${anzahlDirektOP} patients underwent upfront surgery (upfront surgery group). The median age in the overall cohort was ${alterMedian} years (range: ${alterMin}–${alterMax} years), and ${anteilMaennerProzent} (${anzahlMaenner}/${anzahlPatientenChar}) were male. Detailed patient characteristics are presented in <a href="${_getSafeLink(table1Id)}">Table 1</a>.</p>
                <p>Inclusion criteria for the primary study were an age of at least 18 years and histologically confirmed rectal cancer. Exclusion criteria included unresectable tumors and contraindications to MRI. For the present extended analysis, all patients from the primary study for whom complete datasets regarding T1-weighted contrast-enhanced and T2-weighted lymph node characteristics were available were included.</p>
            `;
        }
    }

    function getMethodenMRTProtokollText(lang, commonData) {
        const mrtSystem = commonData.references?.lurzSchaefer2025MRISystem || (lang === 'de' ? "3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers)" : "3.0-T system (MAGNETOM Prisma Fit; Siemens Healthineers)");
        const kontrastmittel = commonData.references?.lurzSchaefer2025ContrastAgent || "Gadoteridol (ProHance; Bracco)";
        const t2SliceThickness = commonData.references?.lurzSchaefer2025T2SliceThickness || (lang === 'de' ? "2-3 mm" : "2-3 mm");

         if (lang === 'de') {
            return `
                <p>Alle MRT-Untersuchungen wurden an einem ${mrtSystem} unter Verwendung von Körper- und Wirbelsäulen-Array-Spulen durchgeführt. Das standardisierte Bildgebungsprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Ebene (Schichtdicke ${t2SliceThickness}) sowie eine axiale diffusionsgewichtete Sequenz (DWI). Für die Bewertung des Avocado Signs wurde, wie in der Primärstudie beschrieben, eine kontrastmittelverstärkte axiale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung akquiriert (Details zu Sequenzparametern siehe Originalpublikation${_getRefLink('lurzSchaefer2025', commonData, lang)}).</p>
                <p>Ein makrozyklisches Gadolinium-basiertes Kontrastmittel (${kontrastmittel}) wurde gewichtsadaptiert (0,2 ml/kg Körpergewicht) intravenös verabreicht. Die kontrastmittelverstärkten Aufnahmen erfolgten unmittelbar nach vollständiger Applikation des Kontrastmittels. Butylscopolamin wurde zur Reduktion von Bewegungsartefakten appliziert. Das Bildgebungsprotokoll war für die primäre Staging-Untersuchung und die Restaging-Untersuchung (bei Patienten der nRCT-Gruppe) identisch.</p>
            `;
        } else {
            return `
                <p>All MRI examinations were performed on a ${mrtSystem} using body and spine array coils. The standardized imaging protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal planes (slice thickness ${t2SliceThickness}), as well as axial diffusion-weighted imaging (DWI). For the assessment of the Avocado Sign, as described in the primary study, a contrast-enhanced axial T1-weighted volumetric interpolated breath-hold examination (VIBE) with Dixon fat suppression was acquired (for sequence parameter details, see original publication${_getRefLink('lurzSchaefer2025', commonData, lang)}).</p>
                <p>A macrocyclic gadolinium-based contrast agent (${kontrastmittel}) was administered intravenously at a weight-based dose (0.2 mL/kg body weight). Contrast-enhanced images were acquired immediately after the full administration of the contrast agent. Butylscopolamine was administered to reduce motion artifacts. The imaging protocol was identical for baseline staging and restaging examinations (in patients from the nRCT group).</p>
            `;
        }
    }

    function getMethodenASDefinitionText(lang, commonData) {
        const studyReferenceAS = _getRefLink('lurzSchaefer2025', commonData, lang);
        const radiologistExperience = commonData.references?.lurzSchaefer2025RadiologistExperience || ["29", "7", "19"];

        if (lang === 'de') {
            return `
                <p>Das Avocado Sign wurde, wie in der Originalstudie${studyReferenceAS} definiert, auf den kontrastmittelverstärkten T1-gewichteten Bildern evaluiert. Es ist charakterisiert als ein klar abgrenzbarer, hypointenser Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens, unabhängig von dessen Größe oder Form. Die Bewertung erfolgte für alle im T1KM-MRT sichtbaren mesorektalen Lymphknoten. Ein Patient wurde als Avocado-Sign-positiv (AS+) eingestuft, wenn mindestens ein Lymphknoten dieses Zeichen aufwies. Die Bildanalyse wurde von zwei Radiologen (Erfahrung: ${radiologistExperience[0]} bzw. ${radiologistExperience[1]} Jahre in der abdominellen MRT), die bereits die Primärstudie durchführten, unabhängig und verblindet gegenüber den histopathologischen Ergebnissen und den T2-Merkmalen vorgenommen. Diskrepanzen wurden im Konsens mit einem dritten, ebenfalls erfahrenen Radiologen (Erfahrung: ${radiologistExperience[2]} Jahre) gelöst. Für Patienten der nRCT-Gruppe erfolgte die AS-Bewertung auf den Restaging-MRT-Bildern.</p>
            `;
        } else {
            return `
                <p>The Avocado Sign, as defined in the original study${studyReferenceAS}, was evaluated on contrast-enhanced T1-weighted images. It is characterized as a clearly demarcated, hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape. Assessment was performed for all mesorectal lymph nodes visible on T1-weighted contrast-enhanced MRI. A patient was classified as Avocado-Sign-positive (AS+) if at least one lymph node exhibited this sign. Image analysis was performed by two radiologists (experience: ${radiologistExperience[0]} and ${radiologistExperience[1]} years in abdominal MRI, respectively), who also conducted the primary study, independently and blinded to histopathological results and T2-weighted features. Discrepancies were resolved by consensus with a third, similarly experienced radiologist (experience: ${radiologistExperience[2]} years). For patients in the nRCT group, AS assessment was performed on restaging MRI images.</p>
            `;
        }
    }

    function getMethodenT2DefinitionText(lang, commonData, allKollektivStats) {
        const bfZielMetricDisplay = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const tableLiteraturT2Id = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienUebersichtTabelle.id;
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria(); // Nimmt die aktuell im Tool gesetzten Kriterien
        const appliedLogic = t2CriteriaManager.getAppliedLogic();
        const formattedAppliedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false);


        const getBFCriteriaTextForKollektiv = (kollektivId, displayName) => {
            const bfDef = allKollektivStats?.[kollektivId]?.bruteforce_definition;
            if (bfDef && bfDef.criteria) {
                let metricValueStr = formatNumber(bfDef.metricValue, 4, 'N/A', lang === 'en');
                const metricNameActual = bfDef.metricName || bfZielMetricDisplay; // Fallback auf die globale Publikationsmetrik
                const formattedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, false);
                return `<li><strong>${displayName}:</strong> ${formattedCriteria} (${lang === 'de' ? 'Zielmetrik' : 'Target metric'}: ${metricNameActual}, ${lang === 'de' ? 'Wert' : 'Value'}: ${metricValueStr})</li>`;
            }
            return `<li><strong>${displayName}:</strong> ${lang === 'de' ? `Keine spezifischen Optimierungsergebnisse für Zielmetrik '${bfZielMetricDisplay}' verfügbar oder nicht berechnet für diesen Bericht.` : `No specific optimization results available or not calculated for target metric '${bfZielMetricDisplay}' for this report.`}</li>`;
        };

        let bfCriteriaDetailsText = '<ul>';
        bfCriteriaDetailsText += getBFCriteriaTextForKollektiv('Gesamt', lang === 'de' ? 'Gesamtkollektiv' : 'Overall cohort');
        bfCriteriaDetailsText += getBFCriteriaTextForKollektiv('direkt OP', lang === 'de' ? 'Direkt-OP Kollektiv' : 'Upfront surgery cohort');
        bfCriteriaDetailsText += getBFCriteriaTextForKollektiv('nRCT', lang === 'de' ? 'nRCT Kollektiv' : 'nCRT cohort');
        bfCriteriaDetailsText += '</ul>';

        const litCriteriaSetsDetails = PUBLICATION_CONFIG.literatureCriteriaSets.map(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet && studySet.studyInfo) {
                const desc = studySet.studyInfo.keyCriteriaSummary || studySet.description || (lang==='de' ? 'Kriterien nicht spezifiziert' : 'Criteria not specified');
                const ref = _getRefLink(studySet.id.startsWith('rutegard') ? 'rutegard2025' : studySet.id.startsWith('koh') ? 'koh2008' : 'barbaro2024', commonData, lang);
                 const esgarRef = studySet.id.startsWith('rutegard') ? `, basierend auf ESGAR Konsensus${_getRefLink('beetsTan2018ESGAR', commonData, lang)}` : '';
                const applKoll = getKollektivDisplayName(studySet.applicableKollektiv);
                return `<li><strong>${studySet.name}${esgarRef}</strong>${ref}: ${desc} (Original-Zielkollektiv: ${applKoll}, Kontext: ${studySet.context || 'N/A'})</li>`;
            }
            return '';
        }).join('');

        if (lang === 'de') {
            return `
                <p>Die morphologischen T2-gewichteten Kriterien (Größe [Kurzachse in mm], Form ['rund', 'oval'], Kontur ['scharf', 'irregulär'], Homogenität ['homogen', 'heterogen'] und Signalintensität ['signalarm', 'intermediär', 'signalreich']) wurden für jeden im hochauflösenden T2w-MRT sichtbaren mesorektalen Lymphknoten von denselben zwei Radiologen erfasst, die auch das Avocado Sign bewerteten. Die Bewertung erfolgte konsensbasiert und verblindet gegenüber dem pathologischen N-Status und dem Avocado-Sign-Status.</p>
                <p>Für den Vergleich der diagnostischen Güte wurden folgende T2-Kriteriensets herangezogen:</p>
                <ol>
                    <li><strong>Literatur-basierte T2-Kriteriensets:</strong> Eine Auswahl etablierter Kriterien aus der Fachliteratur wurde implementiert und auf die entsprechenden Subgruppen bzw. das Gesamtkollektiv unseres Datensatzes angewendet. Details zu den implementierten Sets sind in <a href="${_getSafeLink(tableLiteraturT2Id)}">Tabelle 2</a> zusammengefasst. Dies umfasste:
                        <ul>${litCriteriaSetsDetails}</ul>
                    </li>
                    <li><strong>Brute-Force optimierte T2-Kriterien:</strong> Mittels eines im Analyse-Tool implementierten Brute-Force-Algorithmus wurden für jedes der drei Hauptkollektive (Gesamt, Direkt OP, nRCT) diejenigen Kombinationen aus den fünf T2-Merkmalen und einer UND/ODER-Logik identifiziert, welche die für diesen Bericht gewählte Zielmetrik – die <strong>${bfZielMetricDisplay}</strong> – maximieren. Die resultierenden, für jedes Kollektiv spezifisch optimierten Kriteriensets waren:
                        ${bfCriteriaDetailsText}
                    </li>
                </ol>
                <p>Zusätzlich wurden für explorative Analysen und als Referenzpunkt die zum Zeitpunkt der finalen Analyse im Tool aktuell global eingestellten T2-Kriterien verwendet: ${formattedAppliedCriteria}. Für die hier berichteten primären Vergleiche sind jedoch die unter Punkt 1 und 2 genannten Kriterien maßgeblich.</p>
                <p>Ein Lymphknoten wurde als T2-positiv für ein gegebenes Kriterienset gewertet, wenn er die spezifischen Bedingungen dieses Sets erfüllte. Ein Patient galt als T2-positiv, wenn mindestens ein Lymphknoten gemäß dem jeweiligen Kriterienset als positiv bewertet wurde.</p>
            `;
        } else {
            return `
                <p>The morphological T2-weighted criteria (size [short-axis diameter in mm], shape ['round', 'oval'], border ['smooth', 'irregular'], homogeneity ['homogeneous', 'heterogeneous'], and signal intensity ['low', 'intermediate', 'high']) were assessed for every mesorectal lymph node visible on high-resolution T2w-MRI by the same two radiologists who evaluated the Avocado Sign. The assessment was performed by consensus and blinded to the pathological N-status and the Avocado Sign status.</p>
                <p>For the comparison of diagnostic performance, the following T2 criteria sets were utilized:</p>
                <ol>
                    <li><strong>Literature-based T2 criteria sets:</strong> A selection of established criteria from the literature was implemented and applied to the respective subgroups or the entire cohort of our dataset. Details of the implemented sets are summarized in <a href="${_getSafeLink(tableLiteraturT2Id)}">Table 2</a>. This included:
                        <ul>${litCriteriaSetsDetails}</ul>
                    </li>
                    <li><strong>Brute-force optimized T2 criteria:</strong> Using a brute-force algorithm implemented in the analysis tool, combinations of the five T2 features and AND/OR logic that maximize the target metric selected for this report – <strong>${bfZielMetricDisplay}</strong> – were identified for each of the three main cohorts (Overall, Upfront Surgery, nCRT). The resulting cohort-specific optimized criteria sets were:
                        ${bfCriteriaDetailsText}
                    </li>
                </ol>
                <p>Additionally, for exploratory analyses and as a reference point, the T2 criteria globally set in the tool at the time of final analysis were used: ${formattedAppliedCriteria}. However, for the primary comparisons reported herein, the criteria mentioned under points 1 and 2 are authoritative.</p>
                <p>A lymph node was considered T2-positive for a given criteria set if it met the specific conditions of that set. A patient was considered T2-positive if at least one lymph node was rated positive according to the respective criteria set.</p>
            `;
        }
    }


    function getMethodenReferenzstandardText(lang, commonData) {
         if (lang === 'de') {
            return `
                <p>Die histopathologische Untersuchung der Operationspräparate nach totaler mesorektaler Exzision (TME) diente als Referenzstandard für den Lymphknotenstatus. Alle mesorektalen Lymphknoten wurden von erfahrenen Pathologen gemäß den etablierten Standardprotokollen aufgearbeitet und mikroskopisch bewertet. Der N-Status eines Patienten wurde als positiv (N+) definiert, wenn mindestens ein Lymphknoten histologisch als metastatisch befallen identifiziert wurde. Andernfalls galt der Patient als N-negativ (N0).</p>
            `;
        } else {
            return `
                <p>Histopathological examination of surgical specimens after total mesorectal excision (TME) served as the reference standard for lymph node status. All mesorectal lymph nodes were processed and microscopically evaluated by experienced pathologists according to established standard protocols. A patient's N-status was defined as positive (N+) if at least one lymph node was histologically identified as metastatic. Otherwise, the patient was considered N-negative (N0).</p>
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
        const ciMethodDifference = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_DIFFERENCE || "Bootstrap Percentile";
        const ciMethodLR = APP_CONFIG.STATISTICAL_CONSTANTS.LIKELIHOOD_RATIO_CI_METHOD || "Bootstrap Percentile";


        if (lang === 'de') {
            return `
                <p>Die deskriptive Statistik umfasste die Berechnung von Medianen, Mittelwerten, Standardabweichungen (SD), Minima und Maxima für kontinuierliche Variablen sowie absolute Häufigkeiten und Prozentanteile für kategoriale Daten. Die diagnostische Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) wurde anhand von Sensitivität, Spezifität, positivem prädiktiven Wert (PPV), negativem prädiktiven Wert (NPV), Accuracy (ACC), Balanced Accuracy (BalAcc), F1-Score, positiver Likelihood Ratio (LR+) und negativer Likelihood Ratio (LR-) evaluiert. Die Fläche unter der Receiver Operating Characteristic-Kurve (AUC) wurde als äquivalent zur BalAcc für diese binären Tests betrachtet. Für diese Metriken wurden zweiseitige 95%-Konfidenzintervalle (KI) berechnet. Für Proportionen (Sensitivität, Spezifität, PPV, NPV, Accuracy) wurde die ${ciMethodProportion}-Methode verwendet. Für BalAcc (AUC), F1-Score, LR+ und LR- wurde die ${ciMethodEffectSize}-Methode mit ${bootstrapN} Replikationen angewendet.</p>
                <p>Der statistische Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe (gepaarte Daten) erfolgte mittels des McNemar-Tests für gepaarte nominale Daten bzw. des DeLong-Tests für den Vergleich von AUC-Werten. Konfidenzintervalle für die Differenz gepaarter Raten (z.B. Sensitivitätsdifferenz) wurden mittels der ${ciMethodDifference}-Methode mit ${bootstrapN} Replikationen bestimmt. Der Vergleich von Performance-Metriken zwischen unabhängigen Kollektiven (z.B. Direkt-OP vs. nRCT-Gruppe) erfolgte mittels Fisher's Exact Test für Raten (wie Accuracy) und mittels Z-Test für den Vergleich von AUC-Werten basierend auf deren Bootstrap-Standardfehlern; CIs für Differenzen von Raten zwischen unabhängigen Gruppen wurden ebenfalls mittels ${ciMethodDifference} berechnet. Odds Ratios (OR) und Risk Differences (RD) wurden zur Quantifizierung von Assoziationen berechnet, ebenfalls mit 95%-KI. Der Phi-Koeffizient (φ) wurde als Maß für die Stärke des Zusammenhangs zwischen binären Merkmalen herangezogen. Für den Vergleich von Verteilungen kontinuierlicher Variablen zwischen zwei unabhängigen Gruppen wurde der Mann-Whitney-U-Test verwendet. Ein p-Wert < ${alphaText} wurde als statistisch signifikant interpretiert. Alle statistischen Analysen wurden mit der oben genannten, speziell entwickelten Webanwendung (${appName} v${appVersion}) durchgeführt, die auf Standardbibliotheken für statistische Berechnungen und JavaScript basiert.</p>
            `;
        } else {
            return `
                <p>Descriptive statistics included the calculation of medians, means, standard deviations (SD), minima, and maxima for continuous variables, as well as absolute frequencies and percentages for categorical data. The diagnostic performance of the Avocado Sign and the various T2 criteria sets (literature-based and brute-force optimized) was evaluated using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy (ACC), balanced accuracy (BalAcc), F1-score, positive likelihood ratio (LR+), and negative likelihood ratio (LR-). The area under the Receiver Operating Characteristic curve (AUC) was considered equivalent to BalAcc for these binary tests. Two-sided 95% confidence intervals (CI) were calculated for these metrics. The ${ciMethodProportion} method was used for proportions (sensitivity, specificity, PPV, NPV, accuracy). For BalAcc (AUC), F1-score, LR+, and LR-, the ${ciMethodEffectSize} method with ${bootstrapN} replications was applied.</p>
                <p>Statistical comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group (paired data) was performed using McNemar's test for paired nominal data and DeLong's test for AUC comparison. Confidence intervals for the difference of paired rates (e.g., sensitivity difference) were determined using the ${ciMethodDifference} method with ${bootstrapN} replications. Comparison of performance metrics between independent cohorts (e.g., upfront surgery vs. nCRT group) was conducted using Fisher's exact test for rates (such as accuracy) and a Z-test for AUC comparison based on their bootstrap standard errors; CIs for differences of rates between independent groups were also calculated using the ${ciMethodDifference} method. Odds Ratios (OR) and Risk Differences (RD) were calculated to quantify associations, also with 95% CIs. The Phi coefficient (φ) was used as a measure of the strength of association between binary features. For comparing distributions of continuous variables between two independent groups, the Mann-Whitney U test was used. A p-value < ${alphaText} was considered statistically significant. All statistical analyses were conducted using the aforementioned custom-developed web application (${appName} v${appVersion}), which is based on standard libraries for statistical computations and JavaScript.</p>
            `;
        }
    }

    function getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const anteilNplusGesamt = formatPercent(pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN, 1, 'N/A');
        const studyReferenceAS = _getRefLink('lurzSchaefer2025', commonData, lang);
        const table1Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id;
        const fig1aId = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id;
        const fig1bId = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id;


        if (lang === 'de') {
            return `
                <p>Die Charakteristika der ${anzahlGesamt} in die Studie eingeschlossenen Patienten sind in <a href="${_getSafeLink(table1Id)}">Tabelle 1</a> zusammengefasst und entsprechen den Daten der initialen Avocado-Sign-Studie${studyReferenceAS}. Das Gesamtkollektiv bestand aus ${anzahlDirektOP} Patienten, die primär operiert wurden (Direkt-OP-Gruppe), und ${anzahlNRCT} Patienten, die eine neoadjuvante Radiochemotherapie erhielten (nRCT-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', false)} Jahre (Range ${formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', false)}–${formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', false)}), und ${formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN,0)} waren männlich. Ein histopathologisch gesicherter positiver Lymphknotenstatus (N+) fand sich bei ${pCharGesamt?.nStatus?.plus || 'N/A'} von ${anzahlGesamt} Patienten (${anteilNplusGesamt}) im Gesamtkollektiv. Die Verteilung von Alter und Geschlecht im Gesamtkollektiv ist in <a href="${_getSafeLink(fig1aId)}">Abbildung 1a</a> und <a href="${_getSafeLink(fig1bId)}">1b</a> dargestellt.</p>
            `;
        } else {
            return `
                <p>The characteristics of the ${anzahlGesamt} patients included in the study are summarized in <a href="${_getSafeLink(table1Id)}">Table 1</a> and correspond to the data from the initial Avocado Sign study${studyReferenceAS}. The overall cohort consisted of ${anzahlDirektOP} patients who underwent upfront surgery (upfront surgery group) and ${anzahlNRCT} patients who received neoadjuvant chemoradiotherapy (nCRT group). The median age in the overall cohort was ${formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', true)} years (range ${formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', true)}–${formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', true)}), and ${formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN,0)} were male. A histopathologically confirmed positive lymph node status (N+) was found in ${pCharGesamt?.nStatus?.plus || 'N/A'} of ${anzahlGesamt} patients (${anteilNplusGesamt}) in the overall cohort. The age and gender distribution in the overall cohort is shown in <a href="${_getSafeLink(fig1aId)}">Figure 1a</a> and <a href="${_getSafeLink(fig1bId)}">1b</a>.</p>
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
        const tablePerformanceASId = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.performanceMetrikenTabelle.idPrefix}-AS-alleKollektive`;


        if (lang === 'de') {
            return `
                <p>Die diagnostische Güte des Avocado Signs (AS) zur Vorhersage des pathologischen N-Status ist für das Gesamtkollektiv und die Subgruppen in <a href="${_getSafeLink(tablePerformanceASId)}">Tabelle 3</a> detailliert aufgeführt. Im Gesamtkollektiv (${getKollektivText('Gesamt', nGesamt, lang)}) erreichte das AS eine Sensitivität von ${fCI(asGesamt?.sens, 1, true, 'de')}, eine Spezifität von ${fCI(asGesamt?.spez, 1, true, 'de')}, einen PPV von ${fCI(asGesamt?.ppv, 1, true, 'de')}, einen NPV von ${fCI(asGesamt?.npv, 1, true, 'de')}, eine Accuracy von ${fCI(asGesamt?.acc, 1, true, 'de')}, eine LR+ von ${fCI(asGesamt?.lrPlus, 2, false, 'de')} und eine LR- von ${fCI(asGesamt?.lrMinus, 2, false, 'de')}. Die AUC (Balanced Accuracy) betrug ${fCI(asGesamt?.auc, 3, false, 'de')}. Diese Werte stimmen mit den in der Originalpublikation zum Avocado Sign berichteten überein.</p>
                <p>In der Subgruppe der primär operierten Patienten (Direkt-OP-Gruppe, ${getKollektivText('direkt OP', nDirektOP, lang)}) zeigte das AS eine Sensitivität von ${fCI(asDirektOP?.sens, 1, true, 'de')} und eine Spezifität von ${fCI(asDirektOP?.spez, 1, true, 'de')} (AUC: ${fCI(asDirektOP?.auc, 3, false, 'de')}; LR+: ${fCI(asDirektOP?.lrPlus, 2, false, 'de')}; LR-: ${fCI(asDirektOP?.lrMinus, 2, false, 'de')}). Bei Patienten nach nRCT (nRCT-Gruppe, ${getKollektivText('nRCT', nNRCT, lang)}) betrug die Sensitivität ${fCI(asNRCT?.sens, 1, true, 'de')} und die Spezifität ${fCI(asNRCT?.spez, 1, true, 'de')} (AUC: ${fCI(asNRCT?.auc, 3, false, 'de')}; LR+: ${fCI(asNRCT?.lrPlus, 2, false, 'de')}; LR-: ${fCI(asNRCT?.lrMinus, 2, false, 'de')}).</p>
            `;
        } else {
            return `
                <p>The diagnostic performance of the Avocado Sign (AS) for predicting pathological N-status is detailed in <a href="${_getSafeLink(tablePerformanceASId)}">Table 3</a> for the overall cohort and subgroups. In the overall cohort (${getKollektivText('Gesamt', nGesamt, lang)}), the AS achieved a sensitivity of ${fCI(asGesamt?.sens, 1, true, 'en')}, a specificity of ${fCI(asGesamt?.spez, 1, true, 'en')}, a PPV of ${fCI(asGesamt?.ppv, 1, true, 'en')}, an NPV of ${fCI(asGesamt?.npv, 1, true, 'en')}, an accuracy of ${fCI(asGesamt?.acc, 1, true, 'en')}, an LR+ of ${fCI(asGesamt?.lrPlus, 2, false, 'en')}, and an LR- of ${fCI(asGesamt?.lrMinus, 2, false, 'en')}. The AUC (Balanced Accuracy) was ${fCI(asGesamt?.auc, 3, false, 'en')}. These values are consistent with those reported in the original Avocado Sign publication.</p>
                <p>In the subgroup of patients undergoing upfront surgery (Upfront surgery group, ${getKollektivText('direkt OP', nDirektOP, lang)}), the AS showed a sensitivity of ${fCI(asDirektOP?.sens, 1, true, 'en')} and a specificity of ${fCI(asDirektOP?.spez, 1, true, 'en')} (AUC: ${fCI(asDirektOP?.auc, 3, false, 'en')}; LR+: ${fCI(asDirektOP?.lrPlus, 2, false, 'en')}; LR-: ${fCI(asDirektOP?.lrMinus, 2, false, 'en')}). For patients after nCRT (nCRT group, ${getKollektivText('nRCT', nNRCT, lang)}), the sensitivity was ${fCI(asNRCT?.sens, 1, true, 'en')} and the specificity was ${fCI(asNRCT?.spez, 1, true, 'en')} (AUC: ${fCI(asNRCT?.auc, 3, false, 'en')}; LR+: ${fCI(asNRCT?.lrPlus, 2, false, 'en')}; LR-: ${fCI(asNRCT?.lrMinus, 2, false, 'en')}).</p>
            `;
        }
    }

    function getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData) {
        let text = '';
        const tablePerformanceLitT2Id = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.performanceMetrikenTabelle.idPrefix}-LiteraturT2-alleSets`;

        if (lang === 'de') {
            text += `<p>Die diagnostische Güte der evaluierten Literatur-basierten T2-Kriteriensets ist in <a href="${_getSafeLink(tablePerformanceLitT2Id)}">Tabelle 4</a> zusammengefasst. `;
        } else {
            text += `<p>The diagnostic performance of the evaluated literature-based T2 criteria sets is summarized in <a href="${_getSafeLink(tablePerformanceLitT2Id)}">Table 4</a>. `;
        }

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const targetKollektiv = studySet.applicableKollektiv || 'Gesamt';
                const stats = allKollektivStats?.[targetKollektiv]?.gueteT2_literatur?.[conf.id];
                const nPat = allKollektivStats?.[targetKollektiv]?.deskriptiv?.anzahlPatienten || 'N/A';
                const refLink = _getRefLink(conf.id.startsWith('rutegard') ? 'rutegard2025' : conf.id.startsWith('koh') ? 'koh2008' : 'barbaro2024', commonData, lang);
                const esgarRef = conf.id.startsWith('rutegard') ? (lang === 'de' ? `, basierend auf ESGAR Konsensus${_getRefLink('beetsTan2018ESGAR', commonData, lang)}` : `, based on ESGAR Consensus${_getRefLink('beetsTan2018ESGAR', commonData, lang)}`) : '';


                if (lang === 'de') {
                    text += `Das Kriterienset nach ${studySet.name}${esgarRef}${refLink}, angewendet auf das ${getKollektivText(targetKollektiv, nPat, lang)}, ergab eine Sensitivität von ${fCI(stats?.sens, 1, true, 'de')}, eine Spezifität von ${fCI(stats?.spez, 1, true, 'de')} (AUC ${fCI(stats?.auc, 3, false, 'de')}; LR+ ${fCI(stats?.lrPlus, 2, false, 'de')}; LR- ${fCI(stats?.lrMinus, 2, false, 'de')}). `;
                } else {
                    text += `The criteria set by ${studySet.name}${esgarRef}${refLink}, applied to the ${getKollektivText(targetKollektiv, nPat, lang)}, showed a sensitivity of ${fCI(stats?.sens, 1, true, 'en')}, a specificity of ${fCI(stats?.spez, 1, true, 'en')} (AUC ${fCI(stats?.auc, 3, false, 'en')}; LR+ ${fCI(stats?.lrPlus, 2, false, 'en')}; LR- ${fCI(stats?.lrMinus, 2, false, 'en')}). `;
                }
            }
        });
        text += `</p>`;
        return text;
    }

    function getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData) {
        const bfZielMetricDisplay = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const tablePerformanceBFT2Id = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.performanceMetrikenTabelle.idPrefix}-OptimierteT2-alleKollektive`;
        let text = '';

        if (lang === 'de') {
            text += `<p>Mittels eines Brute-Force-Algorithmus wurden für jedes der drei Kollektive spezifische T2-Kriteriensets identifiziert, welche die <strong>${bfZielMetricDisplay}</strong> maximieren. Die Definition dieser optimierten Kriteriensets ist im Methodenteil (Abschnitt 2.5) detailliert. Die diagnostische Güte dieser optimierten Sets ist in <a href="${_getSafeLink(tablePerformanceBFT2Id)}">Tabelle 5</a> dargestellt.</p><ul>`;
        } else {
            text += `<p>Using a brute-force algorithm, specific T2 criteria sets maximizing <strong>${bfZielMetricDisplay}</strong> were identified for each of the three cohorts. The definition of these optimized criteria sets is detailed in the Methods section (Section 2.5). The diagnostic performance of these optimized sets is presented in <a href="${_getSafeLink(tablePerformanceBFT2Id)}">Table 5</a>.</p><ul>`;
        }

        const kollektive = [
            { id: 'Gesamt', nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort', n: commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten },
            { id: 'direkt OP', nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort', n: commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten },
            { id: 'nRCT', nameDe: 'nRCT-Kollektiv', nameEn: 'nCRT cohort', n: commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten }
        ];

        kollektive.forEach(k => {
            const bfStats = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            const nPat = k.n || 'N/A';
            if (bfStats && bfStats.matrix) {
                text += `<li>Für das ${name} (${getKollektivText(k.id, nPat, lang)}) erreichten die optimierten Kriterien eine Sensitivität von ${fCI(bfStats?.sens, 1, true, lang)}, eine Spezifität von ${fCI(bfStats?.spez, 1, true, lang)}, eine AUC von ${fCI(bfStats?.auc, 3, false, lang)}, eine LR+ von ${fCI(bfStats?.lrPlus, 2, false, lang)} und eine LR- von ${fCI(bfStats?.lrMinus, 2, false, lang)}.</li>`;
            } else {
                text += `<li>Für das ${name} (${getKollektivText(k.id, nPat, lang)}) konnten keine validen optimierten Kriterien für die Zielmetrik ${bfZielMetricDisplay} ermittelt oder deren Performance berechnet werden.</li>`;
            }
        });
        text += `</ul>`;
        return text;
    }

    function getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData) {
        let text = '';
        const bfZielMetricDisplay = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const tableVergleichIdPrefix = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichTabelle.idPrefix;
        const figVergleichBalkenIdPrefix = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceBalkenChart.idPrefix;
        const figVergleichROCIdPrefix = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichROCChart.idPrefix;


        if (lang === 'de') {
            text += `<p>Der direkte statistische Vergleich der diagnostischen Güte zwischen dem Avocado Sign (AS) und den ausgewählten T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert für ${bfZielMetricDisplay}) ist für jedes Kollektiv in den <a href="${_getSafeLink(tableVergleichIdPrefix + '-Gesamt')}">Tabellen 6a-c</a> zusammengefasst. <a href="${_getSafeLink(figVergleichBalkenIdPrefix + '-Gesamt')}">Abbildung 2a-c</a> visualisiert die Schlüsselmetriken vergleichend, während <a href="${_getSafeLink(figVergleichROCIdPrefix + '-Gesamt')}">Abbildung 3a-c</a> die ROC-Kurven darstellt.</p>`;
        } else {
            text += `<p>The direct statistical comparison of diagnostic performance between the Avocado Sign (AS) and the selected T2 criteria sets (literature-based and brute-force optimized for ${bfZielMetricDisplay}) is summarized for each cohort in <a href="${_getSafeLink(tableVergleichIdPrefix + '-Gesamt')}">Tables 6a-c</a>. <a href="${_getSafeLink(figVergleichBalkenIdPrefix + '-Gesamt')}">Figure 2a-c</a> provides a comparative visualization of key metrics, while <a href="${_getSafeLink(figVergleichROCIdPrefix + '-Gesamt')}">Figure 3a-c</a> displays the ROC curves.</p>`;
        }

        const kollektive = [
            { id: 'Gesamt', nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort'},
            { id: 'direkt OP', nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort'},
            { id: 'nRCT', nameDe: 'nRCT-Kollektiv', nameEn: 'nCRT cohort'}
        ];

        kollektive.forEach(k => {
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            text += `<h4 class="mt-3">${lang === 'de' ? 'Vergleich im ' : 'Comparison in the '}${name}</h4>`;
            const statsAS = allKollektivStats?.[k.id]?.gueteAS;

            // Vergleich AS vs. Literatur Sets
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(litConf => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(litConf.id);
                if (studySet && (studySet.applicableKollektiv === k.id || (studySet.applicableKollektiv === 'Gesamt' && k.id === 'Gesamt'))) {
                    const litSetName = studySet.displayShortName || studySet.name;
                    const statsLit = allKollektivStats?.[k.id]?.gueteT2_literatur?.[litConf.id];
                    const vergleichASvsLit = allKollektivStats?.[k.id]?.[`vergleichASvsT2_literatur_${litConf.id}`];
                    if (statsAS && statsLit && vergleichASvsLit) {
                        const diffSensText = fCI(vergleichASvsLit.diffSens, 1, true, lang);
                        const diffSpezText = fCI(vergleichASvsLit.diffSpez, 1, true, lang);
                        const diffAucText = fCI(vergleichASvsLit.delong, 3, false, lang); // DeLong Objekt enthält diffAUC als 'value'
                        text += `<p><strong>AS vs. ${litSetName}:</strong><br>`;
                        text += `Sensitivität: AS ${fCI(statsAS.sens,1,true,lang)} vs. ${litSetName} ${fCI(statsLit.sens,1,true,lang)} (Diff.: ${diffSensText}).<br>`;
                        text += `Spezifität: AS ${fCI(statsAS.spez,1,true,lang)} vs. ${litSetName} ${fCI(statsLit.spez,1,true,lang)} (Diff.: ${diffSpezText}).<br>`;
                        text += `AUC: AS ${fCI(statsAS.auc,3,false,lang)} vs. ${litSetName} ${fCI(statsLit.auc,3,false,lang)} (Diff.: ${diffAucText}, p=${getPValueText(vergleichASvsLit.delong?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichASvsLit.delong?.pValue)} [DeLong]).<br>`;
                        text += `Accuracy Vergleich (McNemar): p=${getPValueText(vergleichASvsLit.mcnemar?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichASvsLit.mcnemar?.pValue)}.</p>`;
                    }
                }
            });

            // Vergleich AS vs. Brute-Force optimiertes Set
            const statsBF = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;
            const vergleichASvsBF = allKollektivStats?.[k.id]?.vergleichASvsT2_bruteforce;
            if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                const bfSetName = `${lang === 'de' ? 'Optimiertes T2' : 'Optimized T2'} (${bfDef.metricName || bfZielMetricDisplay})`;
                const diffSensText = fCI(vergleichASvsBF.diffSens, 1, true, lang);
                const diffSpezText = fCI(vergleichASvsBF.diffSpez, 1, true, lang);
                const diffAucText = fCI(vergleichASvsBF.delong, 3, false, lang);
                text += `<p><strong>AS vs. ${bfSetName}:</strong><br>`;
                text += `Sensitivität: AS ${fCI(statsAS.sens,1,true,lang)} vs. ${bfSetName} ${fCI(statsBF.sens,1,true,lang)} (Diff.: ${diffSensText}).<br>`;
                text += `Spezifität: AS ${fCI(statsAS.spez,1,true,lang)} vs. ${bfSetName} ${fCI(statsBF.spez,1,true,lang)} (Diff.: ${diffSpezText}).<br>`;
                text += `AUC: AS ${fCI(statsAS.auc,3,false,lang)} vs. ${bfSetName} ${fCI(statsBF.auc,3,false,lang)} (Diff.: ${diffAucText}, p=${getPValueText(vergleichASvsBF.delong?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichASvsBF.delong?.pValue)} [DeLong]).<br>`;
                text += `Accuracy Vergleich (McNemar): p=${getPValueText(vergleichASvsBF.mcnemar?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichASvsBF.mcnemar?.pValue)}.</p>`;
            }
        });
        return text;
    }

    function getDiskussionText(lang, allKollektivStats, commonData) {
         if (lang === 'de') {
            return `
                <p>Die vorliegende Studie verglich die diagnostische Güte des Avocado Signs (AS) mit Literatur-basierten und optimierten T2-gewichteten (T2w) Kriterien zur Prädiktion des Lymphknotenstatus bei Patienten mit Rektumkarzinom. Unsere Ergebnisse bestätigen die hohe diagnostische Leistung des AS, wie in der initialen Studie gezeigt, und liefern detaillierte Vergleichsdaten für verschiedene T2w-Ansätze in unterschiedlichen Patientenkollektiven (Gesamtkohorte, Direkt-OP, nRCT).</p>
                <p>Ein zentrales Ergebnis ist [Hauptergebnis 1, z.B. die Überlegenheit des AS gegenüber Standard-T2-Kriterien im Direkt-OP-Kollektiv]. Dies ist konsistent mit [Referenz X] und unterstreicht das Potenzial des AS, insbesondere in [spezifisches Szenario]. Im nRCT-Kollektiv zeigte sich [Hauptergebnis 2, z.B. vergleichbare Performance von AS und optimiertem T2]. Dies könnte darauf hindeuten, dass [Interpretation].</p>
                <p>Die mittels Brute-Force optimierten T2w-Kriterien erreichten, wie erwartet, in ihren jeweiligen Kollektiven hohe Werte für die Zieldmetrik ${commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication}. Der direkte Vergleich dieser optimierten Sets mit dem AS zeigte [Ergebnis des Vergleichs]. Es ist jedoch zu beachten, dass diese Optimierung datenspezifisch ist und eine externe Validierung erfordert.</p>
                <p>Die implementierten Literatur-Kriterien zeigten eine variable Performance, die teilweise von den Ergebnissen der Originalstudien abwich. Dies kann durch Unterschiede in Patientencharakteristika, MRT-Protokollen oder der Definition und Anwendung der Kriterien bedingt sein. Beispielsweise erreichten die ESGAR-Kriterien in unserem Direkt-OP Kollektiv [Sens/Spez], verglichen mit [Sens/Spez] in der Rutegård-Validierung.</p>
                <p><strong>Stärken dieser Studie</strong> umfassen die Verwendung eines gut charakterisierten Patientenkollektivs, die direkte Vergleichbarkeit verschiedener Ansätze innerhalb derselben Anwendung und die Implementierung eines Optimierungsalgorithmus. Die detaillierte statistische Analyse inklusive Konfidenzintervallen für Differenzen und Likelihood Ratios erhöht die Aussagekraft.</p>
                <p><strong>Limitationen</strong> beinhalten den retrospektiven, monozentrischen Charakter und die relativ kleine Fallzahl in den Subgruppen, was die Generalisierbarkeit einschränkt und zu breiten Konfidenzintervallen führen kann. Die Brute-Force-Optimierung ist anfällig für Overfitting. Des Weiteren wurden nicht alle denkbaren T2w-Kriterienkombinationen oder fortgeschrittene Bildanalyseverfahren (z.B. Radiomics) berücksichtigt.</p>
                <p><strong>Klinische Implikationen und Ausblick:</strong> Unsere Ergebnisse deuten darauf hin, dass das AS ein wertvolles Werkzeug im Armamentarium des Radiologen zur N-Status-Beurteilung beim Rektumkarzinom sein kann. Insbesondere [spezifische Stärke des AS hervorheben]. Zukünftige prospektive, multizentrische Studien sind notwendig, um diese Ergebnisse zu validieren und den klinischen Nutzen des AS im Kontext verschiedener Behandlungsstrategien, einschließlich organschonender Ansätze, weiter zu untersuchen. Die Kombination des AS mit spezifischen T2w-Merkmalen oder quantitativen Parametern könnte die diagnostische Genauigkeit möglicherweise weiter steigern.</p>
            `;
        } else {
            return `
                <p>The present study compared the diagnostic performance of the Avocado Sign (AS) with literature-based and optimized T2-weighted (T2w) criteria for predicting lymph node status in patients with rectal cancer. Our findings confirm the high diagnostic performance of AS, as shown in the initial study, and provide detailed comparative data for various T2w approaches in different patient cohorts (overall, upfront surgery, nCRT).</p>
                <p>A key finding is [Main result 1, e.g., the superiority of AS over standard T2 criteria in the upfront surgery cohort]. This is consistent with [Reference X] and underscores the potential of AS, particularly in [specific scenario]. In the nCRT cohort, [Main result 2, e.g., comparable performance of AS and optimized T2] was observed. This might indicate that [interpretation].</p>
                <p>The brute-force optimized T2w criteria achieved, as expected, high values for the target metric ${commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication} in their respective cohorts. The direct comparison of these optimized sets with AS showed [result of comparison]. However, it should be noted that this optimization is data-specific and requires external validation.</p>
                <p>The implemented literature criteria showed variable performance, sometimes deviating from the results of the original studies. This may be due to differences in patient characteristics, MRI protocols, or the definition and application of criteria. For example, the ESGAR criteria in our upfront surgery cohort achieved [Sens/Spec], compared to [Sens/Spec] in the Rutegård validation.</p>
                <p><strong>Strengths of this study</strong> include the use of a well-characterized patient cohort, the direct comparability of different approaches within the same application, and the implementation of an optimization algorithm. The detailed statistical analysis, including confidence intervals for differences and likelihood ratios, enhances the robustness of the findings.</p>
                <p><strong>Limitations</strong> include the retrospective, single-center design and the relatively small sample size in the subgroups, which limits generalizability and can lead to wide confidence intervals. Brute-force optimization is susceptible to overfitting. Furthermore, not all conceivable T2w criteria combinations or advanced image analysis methods (e.g., radiomics) were considered.</p>
                <p><strong>Clinical Implications and Outlook:</strong> Our results suggest that the AS can be a valuable tool in the radiologist's armamentarium for N-status assessment in rectal cancer. In particular, [highlight specific strength of AS]. Future prospective, multicenter studies are needed to validate these findings and further investigate the clinical utility of AS in the context of various treatment strategies, including organ-preserving approaches. Combining AS with specific T2w features or quantitative parameters might further enhance diagnostic accuracy.</p>
            `;
        }
    }

    function getReferenzenText(lang, commonData) {
        const refs = commonData.references || {};
        let text = ``;
        const referenceOrder = [
            'lurzSchaefer2025', 'koh2008', 'barbaro2024', 'rutegard2025', 'beetsTan2018ESGAR',
            'zhuang2021', 'alSukhni2012', // Beispiel für weitere Referenzen, müssen in commonData.references existieren
            'ethicsVote'
        ];
        const displayedRefs = new Set();

        text += `<ol class="small">`;
        referenceOrder.forEach(key => {
            if (refs[key] && !displayedRefs.has(refs[key])) {
                text += `<li>${refs[key]}</li>`;
                displayedRefs.add(refs[key]);
            }
        });
        for (const key in refs) {
            if (refs.hasOwnProperty(key) && !referenceOrder.includes(key) && !displayedRefs.has(refs[key])) {
                 text += `<li>${refs[key]}</li>`;
                 displayedRefs.add(refs[key]);
            }
        }
        text += `</ol>`;
        return text;
    }


    function getSectionText(sectionId, lang, allKollektivStats, commonData) {
        switch (sectionId) {
            case 'abstract_content': return getAbstractText(lang, allKollektivStats, commonData);
            case 'einleitung_content': return getEinleitungText(lang, commonData);
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
            case 'diskussion_content': return getDiskussionText(lang, allKollektivStats, commonData);
            case 'referenzen_content': return getReferenzenText(lang, commonData);
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
            .replace(/<a href="#(.*?)">(.*?)<\/a>/g, (match, p1, p2) => `[${p2}](#${p1})`)
            .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, (match, p1) => {
                const level = parseInt(match.match(/<h(\d)/)?.[1] || '1');
                return `\n${'#'.repeat(level)} ${p1}\n`;
            })
            .replace(/<cite>(.*?)<\/cite>/g, '[$1]')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/\u00A0/g, ' ')
            .replace(/ {2,}/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();

        if (sectionId === 'referenzen_content' && markdown.includes('\n* ')) {
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
