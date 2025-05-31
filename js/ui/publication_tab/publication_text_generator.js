const publicationTextGenerator = (() => {

    function fCI(metric, digits = 1, isPercent = true, lang = 'de') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return 'N/A';
        const pValuePrecision = (digits === 3 && !isPercent) ? APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_CSV : digits;

        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 'N/A';
            let formattedNum;
            if (isP) {
                formattedNum = formatPercent(val, d, 'N/A');
            } else {
                formattedNum = formatNumber(val, d, 'N/A', true);
            }
            if (lang === 'de' && typeof formattedNum === 'string' && !isP) {
                formattedNum = formattedNum.replace('.', ',');
            }
            return formattedNum;
        };

        const valStr = formatSingleValue(metric.value, pValuePrecision, isPercent);
        if (valStr === 'N/A') return valStr;

        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper) && isFinite(metric.ci.lower) && isFinite(metric.ci.upper)) {
            const lowerStr = formatSingleValue(metric.ci.lower, pValuePrecision, isPercent);
            const upperStr = formatSingleValue(metric.ci.upper, pValuePrecision, isPercent);
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
        const name = getKollektivDisplayName(kollektivId) || kollektivId;
        const nText = `N\u00A0=\u00A0${n}`;
        return `${name} (${nText})`;
    }

    function _getSafeLink(elementId){
        return `#${elementId}`;
    }

    function formatPValueForText(pValue, lang = 'de') {
        return getPValueText(pValue, lang);
    }

    function getReference(refKey, commonData, format = 'short') {
        const refObject = commonData?.references?.[refKey];
        if (!refObject) return `[Referenz ${refKey} nicht gefunden]`;
        if (format === 'full') return refObject.full || refObject.short || refKey;
        if (format === 'citation') return refObject.short || refKey;
        return refObject.short || refKey;
    }


    function getEinleitungHintergrundText(lang, commonData) {
        const refAS = getReference('lurzSchaefer2025', commonData, 'citation');
        const refESGAR = getReference('beetsTan2018ESGAR', commonData, 'citation');
        const refKoh = getReference('koh2008', commonData, 'citation');
        const refBarbaro = getReference('barbaro2024', commonData, 'citation');
        const refRutegard = getReference('rutegard2025', commonData, 'citation');

        if (lang === 'de') {
            return `
                <p>Das Rektumkarzinom stellt eine bedeutende Herausforderung in der onkologischen Bildgebung und Therapieplanung dar. Die exakte prätherapeutische Bestimmung des lokalen Tumorstadiums, insbesondere des Nodalstatus (N-Status), ist entscheidend für die Wahl der optimalen Behandlungsstrategie, die von der alleinigen Operation bis hin zu multimodalen Konzepten mit neoadjuvanter Radio-Chemotherapie (nRCT) reichen kann. Die Magnetresonanztomographie (MRT) gilt als Standardverfahren für das lokale Staging des Rektumkarzinoms. Traditionell basiert die MRT-Beurteilung des N-Status primär auf morphologischen Kriterien der T2-gewichteten Sequenzen, wie Lymphknotengröße, Form, Kontur und Signalhomogenität. Die diagnostische Genauigkeit dieser Kriterien ist jedoch limitiert und variiert in der Literatur erheblich.</p>
                <p>In einer vorangegangenen Arbeit wurde das "Avocado Sign" (AS) als ein neuer MRT-Marker basierend auf dem Kontrastmittelverhalten in T1-gewichteten Sequenzen vorgestellt, der eine hohe diagnostische Güte für die Prädiktion des mesorektalen Lymphknotenbefalls zeigte. Ziel der vorliegenden Analyse ist ein umfassender Vergleich der diagnostischen Leistungsfähigkeit des Avocado Signs mit verschiedenen etablierten und optimierten T2-gewichteten morphologischen Kriterien. Hierfür werden sowohl publizierte T2-Kriteriensets [z.B. ${refKoh}, ${refBarbaro}, ESGAR-Konsensus evaluiert durch ${refRutegard}] als auch datengetrieben mittels eines Brute-Force-Algorithmus optimierte Kriterienkombinationen herangezogen und deren Performance auf dem ursprünglichen Studienkollektiv der Avocado-Sign-Studie evaluiert. Diese Untersuchung soll dazu beitragen, die relative Wertigkeit verschiedener MRT-Marker für das N-Staging des Rektumkarzinoms besser einzuordnen und Potenziale für eine verbesserte Patientenstratifizierung aufzuzeigen.</p>
            `;
        } else {
            return `
                <p>Rectal cancer presents a significant challenge in oncologic imaging and treatment planning. Accurate pretherapeutic determination of the local tumor stage, particularly nodal status (N-status), is crucial for selecting the optimal treatment strategy, which can range from surgery alone to multimodal concepts including neoadjuvant chemoradiotherapy (nCRT). Magnetic resonance imaging (MRI) is considered the standard modality for local staging of rectal cancer. Traditionally, MRI assessment of N-status primarily relies on morphological criteria in T2-weighted sequences, such as lymph node size, shape, border, and signal homogeneity. However, the diagnostic accuracy of these criteria is limited and varies considerably in the literature.</p>
                <p>In a previous study, the "Avocado Sign" (AS) was introduced as a novel MRI marker based on contrast enhancement patterns in T1-weighted sequences, demonstrating high diagnostic performance for predicting mesorectal lymph node involvement. The aim of the present analysis is a comprehensive comparison of the diagnostic performance of the Avocado Sign against various established and optimized T2-weighted morphological criteria. For this purpose, both published T2 criteria sets [e.g., ${refKoh}, ${refBarbaro}, ESGAR consensus evaluated by ${refRutegard}] and data-driven criteria combinations optimized using a brute-force algorithm will be utilized and their performance evaluated on the original study cohort of the Avocado Sign study. This investigation aims to better contextualize the relative value of different MRI markers for N-staging in rectal cancer and to identify potentials for improved patient stratification.</p>
            `;
        }
    }


    function getMethodenStudienanlageText(lang, commonData) {
        const appVersion = commonData.appVersion || APP_CONFIG.APP_VERSION;
        const studyReferenceAS = getReference('lurzSchaefer2025', commonData, 'citation');
        const ethicsVote = getReference('ethicsVote', commonData, 'full');

        if (lang === 'de') {
            return `
                <p>Die vorliegende Analyse wurde als retrospektive Auswertung eines prospektiv geführten, monozentrischen Patientenkollektivs mit histologisch gesichertem Rektumkarzinom konzipiert. Das primäre Studienkollektiv und die zugrundeliegenden Bilddatensätze für die initiale Bewertung des Avocado Signs (AS) sind identisch mit jenen der Originalpublikation zum Avocado Sign (${studyReferenceAS}). Ziel dieser erweiterten Untersuchung ist der detaillierte Vergleich der diagnostischen Güte des AS mit etablierten und optimierten T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status) sowie die Bereitstellung eines explorativen Werkzeugs für weiterführende Analysen.</p>
                <p>Alle hier präsentierten Analysen und Kriterienevaluationen wurden mittels einer interaktiven Webanwendung (AvocadoSign Analyse Tool v${appVersion}, ${APP_CONFIG.APP_NAME}) durchgeführt, die eigens für diese und nachfolgende Studien entwickelt und erweitert wurde. Dieses Tool ermöglicht die flexible Definition und Anwendung von T2-Kriteriensets, eine automatisierte Optimierung von Kriterienkombinationen mittels eines Brute-Force-Algorithmus sowie eine umfassende statistische Auswertung und Visualisierung der Ergebnisse. Die Studie wurde in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki durchgeführt. Das Studienprotokoll wurde von der zuständigen Ethikkommission genehmigt (${ethicsVote}). Aufgrund des retrospektiven Charakters der Analyse auf pseudonymisierten Daten wurde von der Ethikkommission auf ein erneutes Einholen eines schriftlichen Einverständnisses der Patienten für diese spezifische erweiterte Auswertung verzichtet, da ein generelles Einverständnis zur wissenschaftlichen Auswertung im Rahmen der Primärstudie vorlag.</p>
            `;
        } else {
            return `
                <p>The present analysis was designed as a retrospective evaluation of a prospectively maintained, single-center patient cohort with histologically confirmed rectal cancer. The primary study cohort and the underlying imaging datasets for the initial assessment of the Avocado Sign (AS) are identical to those of the original Avocado Sign publication (${studyReferenceAS}). The objective of this extended investigation is a detailed comparison of the diagnostic performance of the AS with established and optimized T2-weighted morphological criteria for predicting mesorectal lymph node status (N-status), as well as providing an exploratory tool for further analyses.</p>
                <p>All analyses and criteria evaluations presented herein were performed using an interactive web application (AvocadoSign Analysis Tool v${appVersion}, ${APP_CONFIG.APP_NAME}), specifically developed and enhanced for this and subsequent studies. This tool allows for the flexible definition and application of T2 criteria sets, automated optimization of criteria combinations using a brute-force algorithm, and comprehensive statistical evaluation and visualization of results. The study was conducted in accordance with the principles of the Declaration of Helsinki. The study protocol was approved by the responsible ethics committee (${ethicsVote}). Given the retrospective nature of this analysis on pseudonymized data, the ethics committee waived the need for re-obtaining written informed consent from patients for this specific extended evaluation, as general consent for scientific evaluation was provided as part of the primary study.</p>
            `;
        }
    }

    function getMethodenPatientenkollektivText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const studienzeitraum = getReference('lurzSchaefer2025StudyPeriod', commonData, 'full');

        const alterMedian = formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', lang === 'en');
        const alterMin = formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', lang === 'en');
        const alterMax = formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', lang === 'en');
        const anzahlPatientenChar = pCharGesamt?.anzahlPatienten || 0;
        const anzahlMaenner = pCharGesamt?.geschlecht?.m || 0;
        const anteilMaennerProzent = formatPercent(anzahlPatientenChar > 0 ? anzahlMaenner / anzahlPatientenChar : NaN, 0);
        const table1Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id;
        const table1Title = lang === 'de' ? PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.titleDe : PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.titleEn;


        if (lang === 'de') {
            return `
                <p>Das Studienkollektiv umfasste ${anzahlGesamt} konsekutive Patienten mit histologisch gesichertem Rektumkarzinom, die zwischen ${studienzeitraum} am Klinikum St. Georg, Leipzig, Deutschland, behandelt und in die initiale Avocado-Sign-Studie eingeschlossen wurden. Von diesen erhielten ${anzahlNRCT} Patienten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während ${anzahlDirektOP} Patienten primär operiert wurden (Direkt-OP-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${alterMedian} Jahre (Range: ${alterMin}\u00A0–\u00A0${alterMax} Jahre), und ${anteilMaennerProzent} (${anzahlMaenner}/${anzahlPatientenChar}) der Patienten waren männlich. Detaillierte Patientencharakteristika, stratifiziert nach Behandlungsgruppen, sind in <a href="${_getSafeLink(table1Id)}">${table1Title}</a> dargestellt.</p>
                <p>Die Einschlusskriterien für die Primärstudie waren ein Alter von mindestens 18 Jahren und ein histologisch bestätigtes Rektumkarzinom. Ausschlusskriterien umfassten nicht resektable Tumoren und Kontraindikationen für eine MRT-Untersuchung. Für die vorliegende erweiterte Analyse wurden alle Patienten der Primärstudie berücksichtigt, für die vollständige Datensätze bezüglich der T1KM- und T2-Lymphknotenmerkmale vorlagen.</p>
            `;
        } else {
            return `
                <p>The study cohort comprised ${anzahlGesamt} consecutive patients with histologically confirmed rectal cancer who were treated at Klinikum St. Georg, Leipzig, Germany, between ${studienzeitraum} and included in the initial Avocado Sign study. Of these, ${anzahlNRCT} patients received neoadjuvant chemoradiotherapy (nRCT group), while ${anzahlDirektOP} patients underwent upfront surgery (upfront surgery group). The median age in the overall cohort was ${alterMedian} years (range: ${alterMin}\u00A0–\u00A0${alterMax} years), and ${anteilMaennerProzent} (${anzahlMaenner}/${anzahlPatientenChar}) were male. Detailed patient characteristics, stratified by treatment group, are presented in <a href="${_getSafeLink(table1Id)}">${table1Title}</a>.</p>
                <p>Inclusion criteria for the primary study were an age of at least 18 years and histologically confirmed rectal cancer. Exclusion criteria included unresectable tumors and contraindications to MRI examination. For the present extended analysis, all patients from the primary study for whom complete datasets regarding T1-weighted contrast-enhanced and T2-weighted lymph node characteristics were available were included.</p>
            `;
        }
    }

    function getMethodenMRTProtokollText(lang, commonData) {
        const mrtSystem = getReference('lurzSchaefer2025MRISystem', commonData, 'full');
        const kontrastmittel = getReference('lurzSchaefer2025ContrastAgent', commonData, 'full');
        const t2SliceThickness = getReference('lurzSchaefer2025T2SliceThickness', commonData, 'full');

         if (lang === 'de') {
            return `
                <p>Alle MRT-Untersuchungen wurden an einem ${mrtSystem} unter Verwendung von Körper- und Wirbelsäulen-Array-Spulen durchgeführt. Das standardisierte Bildgebungsprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Ebene (Schichtdicke ${t2SliceThickness}) sowie eine axiale diffusionsgewichtete Sequenz (DWI). Für die Bewertung des Avocado Signs wurde, wie in der Primärstudie beschrieben, eine kontrastmittelverstärkte axiale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung akquiriert.</p>
                <p>Ein makrozyklisches Gadolinium-basiertes Kontrastmittel (${kontrastmittel}) wurde gewichtsadaptiert (0,2 ml/kg Körpergewicht) intravenös verabreicht. Die kontrastmittelverstärkten Aufnahmen erfolgten unmittelbar nach vollständiger Applikation des Kontrastmittels. Butylscopolamin wurde zur Reduktion von Bewegungsartefakten appliziert. Das Bildgebungsprotokoll war für die primäre Staging-Untersuchung und die Restaging-Untersuchung (bei Patienten der nRCT-Gruppe) identisch.</p>
            `;
        } else {
            return `
                <p>All MRI examinations were performed on a ${mrtSystem} using body and spine array coils. The standardized imaging protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal planes (slice thickness ${t2SliceThickness}), as well as axial diffusion-weighted imaging (DWI). For the assessment of the Avocado Sign, as described in the primary study, a contrast-enhanced axial T1-weighted volumetric interpolated breath-hold examination (VIBE) with Dixon fat suppression was acquired.</p>
                <p>A macrocyclic gadolinium-based contrast agent (${kontrastmittel}) was administered intravenously at a weight-based dose (0.2 mL/kg body weight). Contrast-enhanced images were acquired immediately after the full administration of the contrast agent. Butylscopolamine was administered to reduce motion artifacts. The imaging protocol was identical for baseline staging and restaging examinations (in patients from the nRCT group).</p>
            `;
        }
    }

    function getMethodenASDefinitionText(lang, commonData) {
        const studyReferenceAS = getReference('lurzSchaefer2025', commonData, 'citation');
        const radiologistExperienceArray = commonData?.references?.lurzSchaefer2025RadiologistExperience?.full || ["X", "Y", "Z"];
        const radiologistExperience = lang === 'de' ? 
            `${radiologistExperienceArray[0]} bzw. ${radiologistExperienceArray[1]} Jahre` : 
            `${radiologistExperienceArray[0]} and ${radiologistExperienceArray[1]} years`;
        const thirdRadiologistExperience = radiologistExperienceArray[2];


        if (lang === 'de') {
            return `
                <p>Das Avocado Sign wurde, wie in der Originalstudie (${studyReferenceAS}) definiert, auf den kontrastmittelverstärkten T1-gewichteten Bildern evaluiert. Es ist charakterisiert als ein klar abgrenzbarer, hypointenser Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens, unabhängig von dessen Größe oder Form (siehe Abb. 2 in ${studyReferenceAS}). Die Bewertung erfolgte für alle im T1KM-MRT sichtbaren mesorektalen Lymphknoten. Ein Patient wurde als Avocado-Sign-positiv (AS+) eingestuft, wenn mindestens ein Lymphknoten dieses Zeichen aufwies. Die Bildanalyse wurde von zwei Radiologen (Erfahrung: ${radiologistExperience} in der abdominellen MRT), die bereits die Primärstudie durchführten, unabhängig und verblindet gegenüber den histopathologischen Ergebnissen und den T2-Merkmalen vorgenommen. Diskrepanzen wurden im Konsens mit einem dritten, ebenfalls erfahrenen Radiologen (Erfahrung: ${thirdRadiologistExperience} Jahre) gelöst. Für Patienten der nRCT-Gruppe erfolgte die AS-Bewertung auf den Restaging-MRT-Bildern.</p>
            `;
        } else {
            return `
                <p>The Avocado Sign, as defined in the original study (${studyReferenceAS}), was evaluated on contrast-enhanced T1-weighted images. It is characterized as a clearly demarcated, hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape (see Fig. 2 in ${studyReferenceAS}). Assessment was performed for all mesorectal lymph nodes visible on T1-weighted contrast-enhanced MRI. A patient was classified as Avocado-Sign-positive (AS+) if at least one lymph node exhibited this sign. Image analysis was performed by two radiologists (experience: ${radiologistExperience} in abdominal MRI, respectively), who also conducted the primary study, independently and blinded to histopathological results and T2-weighted features. Discrepancies were resolved by consensus with a third, similarly experienced radiologist (experience: ${thirdRadiologistExperience} years). For patients in the nRCT group, AS assessment was performed on restaging MRI images.</p>
            `;
        }
    }

    function getMethodenT2DefinitionText(lang, commonData, allKollektivStats, options) {
        const appliedCriteria = commonData?.appliedT2CriteriaGlobal || t2CriteriaManager.getAppliedCriteria();
        const appliedLogic = commonData?.appliedT2LogicGlobal || t2CriteriaManager.getAppliedLogic();
        const formattedAppliedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false);
        const bfZielMetric = options?.bruteForceMetric || commonData?.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const table2Id = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id;
        const table2Title = lang === 'de' ? PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.titleDe : PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.titleEn;


        const formatBFDefinition = (kollektivId, displayName) => {
            const bfDef = allKollektivStats?.[kollektivId]?.bruteforce_definition;
            if (bfDef && bfDef.criteria && bfDef.metricName === bfZielMetric) {
                let metricValueStr = formatNumber(bfDef.metricValue, APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_CSV, 'N/A', true);
                 if (lang === 'de') metricValueStr = metricValueStr.replace('.',',');
                const metricNameDisplay = bfDef.metricName;
                const formattedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, false);
                return `<li><strong>${displayName}:</strong> ${formattedCriteria} (${lang === 'de' ? 'erreichte Zielmetrik' : 'achieved target metric'} ${metricNameDisplay}: ${metricValueStr})</li>`;
            }
             const fallbackBfDef = allKollektivStats?.[kollektivId]?.bruteforce_definition;
            if (fallbackBfDef && fallbackBfDef.criteria){
                 let metricValueStr = formatNumber(fallbackBfDef.metricValue, APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_CSV, 'N/A', true);
                 if (lang === 'de') metricValueStr = metricValueStr.replace('.',',');
                 const metricNameDisplay = fallbackBfDef.metricName;
                 const formattedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(fallbackBfDef.criteria, fallbackBfDef.logic, false);
                 return `<li><strong>${displayName}:</strong> ${formattedCriteria} (${lang === 'de' ? 'optimiert für' : 'optimized for'} ${metricNameDisplay}: ${metricValueStr}, ${lang === 'de' ? 'Zielmetrik dieser Analyse jedoch' : 'however, target metric for this analysis is'} ${bfZielMetric})</li>`;
            }
            return `<li><strong>${displayName}:</strong> ${lang === 'de' ? `Keine spezifischen Optimierungsergebnisse für Zielmetrik '${bfZielMetric}' verfügbar oder nicht berechnet.` : `No specific optimization results available or not calculated for target metric '${bfZielMetric}'.`}</li>`;
        };

        let bfCriteriaText = '<ul>';
        bfCriteriaText += formatBFDefinition('Gesamt', lang === 'de' ? 'Gesamtkollektiv' : 'Overall cohort');
        bfCriteriaText += formatBFDefinition('direkt OP', lang === 'de' ? 'Direkt-OP Kollektiv' : 'Upfront surgery cohort');
        bfCriteriaText += formatBFDefinition('nRCT', lang === 'de' ? 'nRCT Kollektiv' : 'nRCT cohort');
        bfCriteriaText += '</ul>';

        const kohSet = studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology');
        const kohDesc = kohSet?.studyInfo?.keyCriteriaSummary || studyT2CriteriaManager.formatCriteriaForDisplay(kohSet?.criteria, kohSet?.logic, false) || (lang === 'de' ? 'Irreguläre Kontur ODER heterogenes Signal' : 'Irregular border OR heterogeneous signal');
        const kohRef = getReference('koh2008', commonData, 'citation');
        const kohApplicable = getKollektivDisplayName(kohSet?.applicableKollektiv || 'Gesamt');

        const barbaroSet = studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging');
        const barbaroDesc = barbaroSet?.studyInfo?.keyCriteriaSummary || studyT2CriteriaManager.formatCriteriaForDisplay(barbaroSet?.criteria, barbaroSet?.logic, false) ||(lang === 'de' ? 'Kurzachse ≥ 2,3mm' : 'Short-axis diameter ≥ 2.3mm');
        const barbaroRef = getReference('barbaro2024', commonData, 'citation');
        const barbaroApplicable = getKollektivDisplayName(barbaroSet?.applicableKollektiv || 'nRCT');

        const esgarSet = studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar');
        const esgarDesc = esgarSet?.studyInfo?.keyCriteriaSummary || studyT2CriteriaManager.formatCriteriaForDisplay(esgarSet?.criteria, esgarSet?.logic, false) || (lang === 'de' ? 'Größe ≥9mm ODER (5-8mm UND ≥2 Kriterien) ODER (<5mm UND 3 Kriterien)' : 'Size ≥9mm OR (5-8mm AND ≥2 criteria) OR (<5mm AND 3 criteria)');
        const esgarRefPrimary = getReference('beetsTan2018ESGAR', commonData, 'citation');
        const esgarRefValidation = getReference('rutegard2025', commonData, 'citation');
        const esgarApplicable = getKollektivDisplayName(esgarSet?.applicableKollektiv || 'direkt OP');


        if (lang === 'de') {
            return `
                <p>Die morphologischen T2-gewichteten Kriterien (Größe [Kurzachse in mm], Form ['rund', 'oval'], Kontur ['scharf', 'irregulär'], Homogenität ['homogen', 'heterogen'] und Signalintensität ['signalarm', 'intermediär', 'signalreich']) wurden für jeden im hochauflösenden T2w-MRT sichtbaren mesorektalen Lymphknoten von denselben zwei Radiologen erfasst, die auch das Avocado Sign bewerteten. Die Bewertung erfolgte konsensbasiert und verblindet gegenüber dem pathologischen N-Status und dem Avocado-Sign-Status.</p>
                <p>Für den Vergleich der diagnostischen Güte wurden folgende T2-Kriteriensets herangezogen:</p>
                <ol>
                    <li><strong>Literatur-basierte T2-Kriteriensets:</strong> Eine Auswahl etablierter Kriterien aus der Fachliteratur wurde implementiert und auf die entsprechenden Subgruppen bzw. das Gesamtkollektiv unseres Datensatzes angewendet (Details siehe <a href="${_getSafeLink(table2Id)}">${table2Title}</a>):
                        <ul>
                            <li>Koh et al. (${kohRef}): Definiert als "${kohDesc}". Dieses Set wurde in unserer Analyse auf das Kollektiv '${kohApplicable}' angewendet.</li>
                            <li>Barbaro et al. (${barbaroRef}): Definiert als "${barbaroDesc}". Dieses Set wurde spezifisch für das Kollektiv '${barbaroApplicable}' (Restaging) evaluiert.</li>
                            <li>ESGAR Konsensus Kriterien (${esgarRefPrimary}), evaluiert durch Rutegård et al. (${esgarRefValidation}): Definiert als "${esgarDesc}". Dieses Set wurde primär auf das Kollektiv '${esgarApplicable}' (Primärstaging) angewendet.</li>
                        </ul>
                    </li>
                    <li><strong>Brute-Force optimierte T2-Kriterien:</strong> Mittels eines im Analyse-Tool implementierten Brute-Force-Algorithmus wurden für jedes der drei Hauptkollektive (Gesamt, Direkt OP, nRCT) diejenigen Kombinationen aus den fünf T2-Merkmalen und einer UND/ODER-Logik identifiziert, welche die primäre Zielmetrik dieser Studie – die <strong>${bfZielMetric}</strong> – maximieren. Die resultierenden, für jedes Kollektiv spezifisch optimierten Kriteriensets waren:
                        ${bfCriteriaText}
                    </li>
                    <li><strong>Im Analyse-Tool aktuell eingestellte T2-Kriterien:</strong> Diese Option dient primär explorativen Zwecken innerhalb der Anwendung. Für die hier dargestellten finalen Analysen sind die unter Punkt 1 und 2 genannten Kriteriensets maßgeblich. Zum Zeitpunkt der finalen Analyse waren die im Tool global angewendeten Kriterien: ${formattedAppliedCriteria}.</li>
                </ol>
                <p>Ein Lymphknoten wurde als T2-positiv für ein gegebenes Kriterienset gewertet, wenn er die spezifischen Bedingungen dieses Sets erfüllte. Ein Patient galt als T2-positiv, wenn mindestens ein Lymphknoten gemäß dem jeweiligen Kriterienset als positiv bewertet wurde.</p>
                 <div id="${table2Id}" class="publication-table-container"></div>
            `;
        } else {
            return `
                <p>The morphological T2-weighted criteria (size [short-axis diameter in mm], shape ['round', 'oval'], border ['smooth', 'irregular'], homogeneity ['homogeneous', 'heterogeneous'], and signal intensity ['low', 'intermediate', 'high']) were assessed for every mesorectal lymph node visible on high-resolution T2w-MRI by the same two radiologists who evaluated the Avocado Sign. The assessment was performed by consensus and blinded to the pathological N-status and the Avocado Sign status.</p>
                <p>For the comparison of diagnostic performance, the following T2 criteria sets were utilized:</p>
                <ol>
                    <li><strong>Literature-based T2 criteria sets:</strong> A selection of established criteria from the literature was implemented and applied to the respective subgroups or the entire cohort of our dataset (details see <a href="${_getSafeLink(table2Id)}">${table2Title}</a>):
                        <ul>
                            <li>Koh et al. (${kohRef}): Defined as "${kohDesc}". In our analysis, this set was applied to the '${kohApplicable}' cohort.</li>
                            <li>Barbaro et al. (${barbaroRef}): Defined as "${barbaroDesc}". This set was specifically evaluated for the '${barbaroApplicable}' cohort (restaging).</li>
                            <li>ESGAR Consensus Criteria (${esgarRefPrimary}), as evaluated by Rutegård et al. (${esgarRefValidation}): Defined as "${esgarDesc}". This set was primarily applied to the '${esgarApplicable}' cohort (primary staging).</li>
                        </ul>
                    </li>
                    <li><strong>Brute-force optimized T2 criteria:</strong> Using a brute-force algorithm implemented in the analysis tool, combinations of the five T2 features and AND/OR logic that maximize the primary endpoint of this study – <strong>${bfZielMetric}</strong> – were identified for each of the three main cohorts (Overall, Upfront Surgery, nRCT). The resulting cohort-specific optimized criteria sets were:
                        ${bfCriteriaText}
                    </li>
                    <li><strong>Currently set T2 criteria in the analysis tool:</strong> This option primarily serves exploratory purposes within the application. For the final analyses presented here, the criteria sets mentioned under points 1 and 2 are authoritative. At the time of final analysis, the globally applied criteria in the tool were: ${formattedAppliedCriteria}.</li>
                </ol>
                <p>A lymph node was considered T2-positive for a given criteria set if it met the specific conditions of that set. A patient was considered T2-positive if at least one lymph node was rated positive according to the respective criteria set.</p>
                <div id="${table2Id}" class="publication-table-container"></div>
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
        const bootstrapN = commonData.bootstrapReplications || APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS || 1000;
        const appName = commonData.appName || "Analyse-Tool";
        const appVersion = commonData.appVersion || "";
        const ciMethodProportion = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION || "Wilson Score";
        const ciMethodEffectSize = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE || "Bootstrap Percentile";


        if (lang === 'de') {
            return `
                <p>Die deskriptive Statistik umfasste die Berechnung von Medianen, Mittelwerten, Standardabweichungen (SD), Minima und Maxima für kontinuierliche Variablen sowie absolute Häufigkeiten und Prozentanteile für kategoriale Daten. Die diagnostische Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) wurde anhand von Sensitivität, Spezifität, positivem prädiktiven Wert (PPV), negativem prädiktiven Wert (NPV), Accuracy (ACC), Balanced Accuracy (BalAcc) und der Fläche unter der Receiver Operating Characteristic-Kurve (AUC) – bei binären Tests äquivalent zur BalAcc – evaluiert. Für diese Metriken wurden zweiseitige 95%-Konfidenzintervalle (KI) berechnet. Für Proportionen (Sensitivität, Spezifität, PPV, NPV, Accuracy) wurde die ${ciMethodProportion}-Methode verwendet. Für BalAcc (AUC) und den F1-Score wurde die ${ciMethodEffectSize}-Methode mit ${formatNumber(bootstrapN,0,undefined,true)} Replikationen angewendet.</p>
                <p>Der statistische Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe (gepaarte Daten) erfolgte mittels des McNemar-Tests für gepaarte nominale Daten bzw. des DeLong-Tests für den Vergleich von AUC-Werten. Der Vergleich von Performance-Metriken zwischen unabhängigen Kollektiven (z.B. Direkt-OP vs. nRCT-Gruppe) erfolgte mittels Fisher's Exact Test für Raten (wie Accuracy) und mittels Z-Test für den Vergleich von AUC-Werten basierend auf deren Bootstrap-Standardfehlern. Odds Ratios (OR) und Risk Differences (RD) wurden zur Quantifizierung von Assoziationen berechnet, ebenfalls mit 95%-KI (OR: Woolf Logit mit Haldane-Anscombe Korrektur, RD: Wald-Methode, Phi-Koeffizient: Bootstrap). Der Phi-Koeffizient (φ) wurde als Maß für die Stärke des Zusammenhangs zwischen binären Merkmalen herangezogen. Für den Vergleich von Verteilungen kontinuierlicher Variablen zwischen zwei unabhängigen Gruppen wurde der Mann-Whitney-U-Test verwendet. Ein p-Wert < ${alphaText} wurde als statistisch signifikant interpretiert. Alle statistischen Analysen wurden mit der oben genannten, speziell entwickelten Webanwendung (${appName} v${appVersion}) durchgeführt, die auf Standardbibliotheken für statistische Berechnungen und JavaScript basiert.</p>
            `;
        } else {
            return `
                <p>Descriptive statistics included the calculation of medians, means, standard deviations (SD), minima, and maxima for continuous variables, as well as absolute frequencies and percentages for categorical data. The diagnostic performance of the Avocado Sign and the various T2 criteria sets (literature-based and brute-force optimized) was evaluated using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy (ACC), balanced accuracy (BalAcc), and the area under the Receiver Operating Characteristic curve (AUC)—equivalent to BalAcc for binary tests. Two-sided 95% confidence intervals (CI) were calculated for these metrics. The ${ciMethodProportion} method was used for proportions (sensitivity, specificity, PPV, NPV, accuracy). For BalAcc (AUC) and F1-score, the ${ciMethodEffectSize} method with ${formatNumber(bootstrapN,0,undefined,true)} replications was applied.</p>
                <p>Statistical comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group (paired data) was performed using McNemar's test for paired nominal data and DeLong's test for AUC comparison. Comparison of performance metrics between independent cohorts (e.g., upfront surgery vs. nRCT group) was conducted using Fisher's exact test for rates (such as accuracy) and a Z-test for AUC comparison based on their bootstrap standard errors. Odds Ratios (OR) and Risk Differences (RD) were calculated to quantify associations, also with 95% CIs (OR: Woolf Logit with Haldane-Anscombe correction, RD: Wald method, Phi coefficient: Bootstrap). The Phi coefficient (φ) was used as a measure of the strength of association between binary features. For comparing distributions of continuous variables between two independent groups, the Mann-Whitney U test was used. A p-value < ${alphaText} was considered statistically significant. All statistical analyses were conducted using the aforementioned custom-developed web application (${appName} v${appVersion}), which is based on standard libraries for statistical computations and JavaScript.</p>
            `;
        }
    }

    function getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const anteilNplusGesamt = formatPercent(pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN, 1, 'N/A');
        const studyReferenceAS = getReference('lurzSchaefer2025', commonData, 'citation');
        const table1Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id;
        const table1Title = lang === 'de' ? PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.titleDe : PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.titleEn;
        const fig1aId = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id;
        const fig1aTitle = lang === 'de' ? PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.titleDe : PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.titleEn;
        const fig1bId = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id;
        const fig1bTitle = lang === 'de' ? PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.titleDe : PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.titleEn;


        if (lang === 'de') {
            return `
                <p>Die Charakteristika der ${anzahlGesamt} in die Studie eingeschlossenen Patienten sind in <a href="${_getSafeLink(table1Id)}">${table1Title}</a> zusammengefasst und entsprechen den Daten der initialen Avocado-Sign-Studie (${studyReferenceAS}). Das Gesamtkollektiv bestand aus ${anzahlDirektOP} Patienten, die primär operiert wurden (Direkt-OP-Gruppe), und ${anzahlNRCT} Patienten, die eine neoadjuvante Radiochemotherapie erhielten (nRCT-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', false)} Jahre (Range ${formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', false)}\u00A0–\u00A0${formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', false)}), und ${formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN,0)} waren männlich. Ein histopathologisch gesicherter positiver Lymphknotenstatus (N+) fand sich bei ${pCharGesamt?.nStatus?.plus || 'N/A'} von ${anzahlGesamt} Patienten (${anteilNplusGesamt}) im Gesamtkollektiv. Die Verteilung von Alter und Geschlecht im Gesamtkollektiv ist in <a href="${_getSafeLink(fig1aId)}">${fig1aTitle}</a> und <a href="${_getSafeLink(fig1bId)}">${fig1bTitle}</a> dargestellt.</p>
                <div id="${table1Id}" class="publication-table-container"></div>
                <div class="row">
                    <div class="col-md-6">
                        <div id="${fig1aId}" class="publication-chart-container"></div>
                    </div>
                    <div class="col-md-6">
                         <div id="${fig1bId}" class="publication-chart-container"></div>
                    </div>
                </div>
            `;
        } else {
            return `
                <p>The characteristics of the ${anzahlGesamt} patients included in the study are summarized in <a href="${_getSafeLink(table1Id)}">${table1Title}</a> and correspond to the data from the initial Avocado Sign study (${studyReferenceAS}). The overall cohort consisted of ${anzahlDirektOP} patients who underwent upfront surgery (upfront surgery group) and ${anzahlNRCT} patients who received neoadjuvant chemoradiotherapy (nRCT group). The median age in the overall cohort was ${formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', true)} years (range ${formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', true)}\u00A0–\u00A0${formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', true)}), and ${formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN,0)} were male. A histopathologically confirmed positive lymph node status (N+) was found in ${pCharGesamt?.nStatus?.plus || 'N/A'} of ${anzahlGesamt} patients (${anteilNplusGesamt}) in the overall cohort. The age and gender distribution in the overall cohort is shown in <a href="${_getSafeLink(fig1aId)}">${fig1aTitle}</a> and <a href="${_getSafeLink(fig1bId)}">${fig1bTitle}</a>.</p>
                <div id="${table1Id}" class="publication-table-container"></div>
                <div class="row">
                    <div class="col-md-6">
                        <div id="${fig1aId}" class="publication-chart-container"></div>
                    </div>
                    <div class="col-md-6">
                         <div id="${fig1bId}" class="publication-chart-container"></div>
                    </div>
                </div>
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
        const table3Title = lang === 'de' ? PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.titleDe : PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.titleEn;


        if (lang === 'de') {
            return `
                <p>Die diagnostische Güte des Avocado Signs (AS) zur Vorhersage des pathologischen N-Status ist für das Gesamtkollektiv und die Subgruppen in <a href="${_getSafeLink(table3Id)}">${table3Title}</a> detailliert aufgeführt. Im Gesamtkollektiv (${getKollektivText('Gesamt', nGesamt, lang)}) erreichte das AS eine Sensitivität von ${fCI(asGesamt?.sens, 1, true, 'de')}, eine Spezifität von ${fCI(asGesamt?.spez, 1, true, 'de')}, einen positiven prädiktiven Wert (PPV) von ${fCI(asGesamt?.ppv, 1, true, 'de')}, einen negativen prädiktiven Wert (NPV) von ${fCI(asGesamt?.npv, 1, true, 'de')} und eine Accuracy von ${fCI(asGesamt?.acc, 1, true, 'de')}. Die AUC (Balanced Accuracy) betrug ${fCI(asGesamt?.auc, 3, false, 'de')}.</p>
                <p>In der Subgruppe der primär operierten Patienten (Direkt-OP-Gruppe, ${getKollektivText('direkt OP', nDirektOP, lang)}) zeigte das AS eine Sensitivität von ${fCI(asDirektOP?.sens, 1, true, 'de')} und eine Spezifität von ${fCI(asDirektOP?.spez, 1, true, 'de')} (AUC: ${fCI(asDirektOP?.auc, 3, false, 'de')}). Bei Patienten nach nRCT (nRCT-Gruppe, ${getKollektivText('nRCT', nNRCT, lang)}) betrug die Sensitivität ${fCI(asNRCT?.sens, 1, true, 'de')} und die Spezifität ${fCI(asNRCT?.spez, 1, true, 'de')} (AUC: ${fCI(asNRCT?.auc, 3, false, 'de')}).</p>
                <div id="${table3Id}" class="publication-table-container"></div>
            `;
        } else {
            return `
                <p>The diagnostic performance of the Avocado Sign (AS) for predicting pathological N-status is detailed in <a href="${_getSafeLink(table3Id)}">${table3Title}</a> for the overall cohort and subgroups. In the overall cohort (${getKollektivText('Gesamt', nGesamt, lang)}), the AS achieved a sensitivity of ${fCI(asGesamt?.sens, 1, true, 'en')}, a specificity of ${fCI(asGesamt?.spez, 1, true, 'en')}, a positive predictive value (PPV) of ${fCI(asGesamt?.ppv, 1, true, 'en')}, a negative predictive value (NPV) of ${fCI(asGesamt?.npv, 1, true, 'en')}, and an accuracy of ${fCI(asGesamt?.acc, 1, true, 'en')}. The AUC (Balanced Accuracy) was ${fCI(asGesamt?.auc, 3, false, 'en')}.</p>
                <p>In the subgroup of patients undergoing upfront surgery (Upfront surgery group, ${getKollektivText('direkt OP', nDirektOP, lang)}), the AS showed a sensitivity of ${fCI(asDirektOP?.sens, 1, true, 'en')} and a specificity of ${fCI(asDirektOP?.spez, 1, true, 'en')} (AUC: ${fCI(asDirektOP?.auc, 3, false, 'en')}). For patients after nRCT (nRCT group, ${getKollektivText('nRCT', nNRCT, lang)}), the sensitivity was ${fCI(asNRCT?.sens, 1, true, 'en')} and the specificity was ${fCI(asNRCT?.spez, 1, true, 'en')} (AUC: ${fCI(asNRCT?.auc, 3, false, 'en')}).</p>
                <div id="${table3Id}" class="publication-table-container"></div>
            `;
        }
    }

    function getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData) {
        const table4Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id;
        const table4Title = lang === 'de' ? PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.titleDe : PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.titleEn;

        let text = `<p>${lang === 'de' ? 'Die diagnostische Güte der evaluierten Literatur-basierten T2-Kriteriensets ist in' : 'The diagnostic performance of the evaluated literature-based T2 criteria sets is summarized in'} <a href="${_getSafeLink(table4Id)}">${table4Title}</a>. `;

        const setsToReport = [
            { id: 'koh_2008_morphology', defaultKollektiv: 'Gesamt', refKey: 'koh2008'},
            { id: 'barbaro_2024_restaging', defaultKollektiv: 'nRCT', refKey: 'barbaro2024'},
            { id: 'rutegard_et_al_esgar', defaultKollektiv: 'direkt OP', refKey: 'rutegard2025', primaryRefKey: 'beetsTan2018ESGAR'}
        ];

        setsToReport.forEach(item => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(item.id);
            const targetKollektivForStudy = studySet?.applicableKollektiv || item.defaultKollektiv;
            const dataForStat = allKollektivStats?.[targetKollektivForStudy]?.gueteT2_literatur?.[item.id];
            const nKollektiv = allKollektivStats?.[targetKollektivForStudy]?.deskriptiv?.anzahlPatienten || 'N/A';
            const refName = getReference(item.refKey, commonData, 'citation');
            let setName = studySet?.name || item.id;
            if(item.primaryRefKey){
                setName = `${getReference(item.primaryRefKey, commonData, 'citation')} (${lang === 'de' ? 'eval. durch' : 'eval. by'} ${refName})`;
            } else {
                setName = refName;
            }

            if (dataForStat) {
                text += lang === 'de' ? `Für das Kriterienset nach ${setName}, angewendet auf das ${getKollektivText(targetKollektivForStudy, nKollektiv, lang)}-Kollektiv, ergab sich eine Sensitivität von ${fCI(dataForStat.sens, 1, true, 'de')} und eine Spezifität von ${fCI(dataForStat.spez, 1, true, 'de')} (AUC ${fCI(dataForStat.auc, 3, false, 'de')}). ` :
                                       `For the criteria set according to ${setName}, applied to the ${getKollektivText(targetKollektivForStudy, nKollektiv, lang)} cohort, a sensitivity of ${fCI(dataForStat.sens, 1, true, 'en')} and a specificity of ${fCI(dataForStat.spez, 1, true, 'en')} (AUC ${fCI(dataForStat.auc, 3, false, 'en')}) were observed. `;
            } else {
                 text += lang === 'de' ? `Für das Kriterienset nach ${setName} konnten keine validen Ergebnisse für das ${getKollektivText(targetKollektivForStudy, nKollektiv, lang)}-Kollektiv berechnet werden. ` :
                                        `For the criteria set according to ${setName}, no valid results could be calculated for the ${getKollektivText(targetKollektivForStudy, nKollektiv, lang)} cohort. `;
            }
        });
        text += `</p><div id="${table4Id}" class="publication-table-container"></div>`;
        return text;
    }

    function getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData, options) {
        const bfZielMetric = options?.bruteForceMetric || commonData?.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const table5Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id;
        const table5TitleDe = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.titleDe.replace('{BF_METRIC}', bfZielMetric);
        const table5TitleEn = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.titleEn.replace('{BF_METRIC}', bfZielMetric);

        let text = '';

        if (lang === 'de') {
            text += `<p>Mittels eines Brute-Force-Algorithmus wurden für jedes der drei Hauptkollektive spezifische T2-Kriteriensets identifiziert, welche die gewählte Zielmetrik – <strong>${bfZielMetric}</strong> – maximieren. Die Definition dieser optimierten Kriteriensets ist im Methodenteil (Abschnitt 2.5) detailliert. Die diagnostische Güte dieser für die Zielmetrik ${bfZielMetric} optimierten Sets ist in <a href="${_getSafeLink(table5Id)}">${table5TitleDe}</a> dargestellt.</p><ul>`;
        } else {
            text += `<p>Using a brute-force algorithm, specific T2 criteria sets maximizing the chosen target metric – <strong>${bfZielMetric}</strong> – were identified for each of the three main cohorts. The definition of these optimized criteria sets is detailed in the Methods section (Section 2.5). The diagnostic performance of these sets optimized for ${bfZielMetric} is presented in <a href="${_getSafeLink(table5Id)}">${table5TitleEn}</a>.</p><ul>`;
        }

        const kollektive = [
            { id: 'Gesamt', nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort', n: commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten },
            { id: 'direkt OP', nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort', n: commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten },
            { id: 'nRCT', nameDe: 'nRCT-Kollektiv', nameEn: 'nRCT cohort', n: commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten }
        ];

        kollektive.forEach(k => {
            const bfStats = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            const nPat = k.n || 'N/A';
            if (bfStats && bfStats.matrix && bfDef && bfDef.metricName === bfZielMetric) {
                text += `<li>Für das ${name} (${getKollektivText(k.id, nPat, lang)}) erreichten die für ${bfZielMetric} optimierten Kriterien eine Sensitivität von ${fCI(bfStats?.sens, 1, true, lang)}, eine Spezifität von ${fCI(bfStats?.spez, 1, true, lang)} und eine AUC von ${fCI(bfStats?.auc, 3, false, lang)}.</li>`;
            } else {
                text += `<li>Für das ${name} (${getKollektivText(k.id, nPat, lang)}) konnten keine validen, spezifisch für die Zielmetrik ${bfZielMetric} optimierten Kriterien ermittelt oder deren Performance berechnet werden.</li>`;
            }
        });
        text += `</ul><div id="${table5Id}" class="publication-table-container"></div>`;
        return text;
    }

    function getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData, options) {
        let text = '';
        const bfZielMetric = options?.bruteForceMetric || commonData?.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const table6Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.id;
        const table6TitleDe = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.titleDe.replace('{BF_METRIC}', bfZielMetric);
        const table6TitleEn = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.titleEn.replace('{BF_METRIC}', bfZielMetric);

        const fig2aId = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.id;
        const fig2aTitle = (lang === 'de' ? PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.titleDe : PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.titleEn).replace('{Kollektiv}', getKollektivDisplayName('Gesamt')).replace('{BF_METRIC}', bfZielMetric).replace(/\[N_GESAMT\]/g, String(commonData.nGesamt || 'N/A'));
        const fig2bId = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartDirektOP.id;
        const fig2bTitle = (lang === 'de' ? PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartDirektOP.titleDe : PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartDirektOP.titleEn).replace('{Kollektiv}', getKollektivDisplayName('direkt OP')).replace('{BF_METRIC}', bfZielMetric).replace(/\[N_DIREKT_OP\]/g, String(commonData.nDirektOP || 'N/A'));
        const fig2cId = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartNRCT.id;
        const fig2cTitle = (lang === 'de' ? PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartNRCT.titleDe : PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartNRCT.titleEn).replace('{Kollektiv}', getKollektivDisplayName('nRCT')).replace('{BF_METRIC}', bfZielMetric).replace(/\[N_NRCT\]/g, String(commonData.nNRCT || 'N/A'));


        if (lang === 'de') {
            text += `<p>Der direkte statistische Vergleich der diagnostischen Güte zwischen dem Avocado Sign (AS) und den ausgewählten T2-Kriteriensets (Literatur-basiert und für ${bfZielMetric} optimiert) ist in <a href="${_getSafeLink(table6Id)}">${table6TitleDe}</a> zusammengefasst. <a href="${_getSafeLink(fig2aId)}">${fig2aTitle}</a>, <a href="${_getSafeLink(fig2bId)}">${fig2bTitle}</a> und <a href="${_getSafeLink(fig2cId)}">${fig2cTitle}</a> visualisieren die Schlüsselmetriken vergleichend für die drei Hauptkollektive.</p>`;
        } else {
            text += `<p>The direct statistical comparison of diagnostic performance between the Avocado Sign (AS) and the selected T2 criteria sets (literature-based and optimized for ${bfZielMetric}) is summarized in <a href="${_getSafeLink(table6Id)}">${table6TitleEn}</a>. <a href="${_getSafeLink(fig2aId)}">${fig2aTitle}</a>, <a href="${_getSafeLink(fig2bId)}">${fig2bTitle}</a>, and <a href="${_getSafeLink(fig2cId)}">${fig2cTitle}</a> provide a comparative visualization of key metrics across the three main cohorts.</p>`;
        }

        const kollektive = [
            { id: 'Gesamt', nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort', litSetId: 'koh_2008_morphology', litRefKey: 'koh2008' },
            { id: 'direkt OP', nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort', litSetId: 'rutegard_et_al_esgar', litRefKey: 'rutegard2025', primaryLitRefKey: 'beetsTan2018ESGAR' },
            { id: 'nRCT', nameDe: 'nRCT-Kollektiv', nameEn: 'nRCT cohort', litSetId: 'barbaro_2024_restaging', litRefKey: 'barbaro2024' }
        ];

        kollektive.forEach(k => {
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            const statsAS = allKollektivStats?.[k.id]?.gueteAS;
            const statsLit = allKollektivStats?.[k.id]?.gueteT2_literatur?.[k.litSetId];
            const statsBF = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;

            let litSetName = getReference(k.litRefKey, commonData, 'citation');
            if(k.primaryLitRefKey) litSetName = `${getReference(k.primaryLitRefKey, commonData, 'citation')} (${lang === 'de' ? 'eval. durch' : 'eval. by'} ${litSetName})`;


            const vergleichASvsLit = allKollektivStats?.[k.id]?.[`vergleichASvsT2_literatur_${k.litSetId}`];
            const vergleichASvsBF = allKollektivStats?.[k.id]?.vergleichASvsT2_bruteforce;

            let diffAucLitStr = formatNumber(vergleichASvsLit?.delong?.diffAUC, 3, 'N/A', true);
            if (lang === 'de' && diffAucLitStr !== 'N/A') diffAucLitStr = diffAucLitStr.replace('.', ',');
            
            let diffAucBfStr = formatNumber(vergleichASvsBF?.delong?.diffAUC, 3, 'N/A', true);
            if (lang === 'de' && diffAucBfStr !== 'N/A') diffAucBfStr = diffAucBfStr.replace('.', ',');
            

            if (lang === 'de') {
                text += `<h4>Vergleich im ${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Im Vergleich des AS (AUC ${fCI(statsAS.auc, 3, false, 'de')}) mit den Kriterien nach ${litSetName} (AUC ${fCI(statsLit.auc, 3, false, 'de')}) zeigte sich für die Accuracy ein p-Wert von ${formatPValueForText(vergleichASvsLit.mcnemar?.pValue, 'de')} (McNemar-Test) und für die AUC ein p-Wert von ${formatPValueForText(vergleichASvsLit.delong?.pValue, 'de')} (DeLong-Test). Der Unterschied in der AUC betrug ${diffAucLitStr}.</p>`;
                } else {
                    text += `<p>Ein Vergleich zwischen AS und den Kriterien nach ${litSetName} konnte nicht vollständig durchgeführt werden oder ist für dieses Kollektiv nicht primär vorgesehen.</p>`;
                }
                if (statsAS && statsBF && vergleichASvsBF && bfDef && bfDef.metricName === bfZielMetric) {
                    text += `<p>Gegenüber den für ${bfZielMetric} optimierten T2-Kriterien (AUC ${fCI(statsBF.auc, 3, false, 'de')}) ergab sich für die Accuracy ein p-Wert von ${formatPValueForText(vergleichASvsBF.mcnemar?.pValue, 'de')} (McNemar-Test) und für die AUC ein p-Wert von ${formatPValueForText(vergleichASvsBF.delong?.pValue, 'de')} (DeLong-Test). Der Unterschied in der AUC betrug ${diffAucBfStr}.</p>`;
                } else {
                    text += `<p>Ein Vergleich zwischen AS und den für ${bfZielMetric} optimierten T2-Kriterien konnte nicht vollständig durchgeführt werden oder es lagen keine spezifischen Optimierungsergebnisse für diese Metrik und dieses Kollektiv vor.</p>`;
                }
            } else { // lang === 'en'
                text += `<h4>Comparison in the ${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Comparing AS (AUC ${fCI(statsAS.auc, 3, false, 'en')}) with the criteria by ${litSetName} (AUC ${fCI(statsLit.auc, 3, false, 'en')}), the p-value for accuracy was ${formatPValueForText(vergleichASvsLit.mcnemar?.pValue, 'en')} (McNemar's test) and for AUC was ${formatPValueForText(vergleichASvsLit.delong?.pValue, 'en')} (DeLong's test). The difference in AUC was ${diffAucLitStr}.</p>`;
                } else {
                    text += `<p>A full comparison between AS and the criteria by ${litSetName} could not be performed or is not primarily intended for this cohort.</p>`;
                }
                if (statsAS && statsBF && vergleichASvsBF && bfDef && bfDef.metricName === bfZielMetric) {
                    text += `<p>Compared to the T2 criteria optimized for ${bfZielMetric} (AUC ${fCI(statsBF.auc, 3, false, 'en')}), the p-value for accuracy was ${formatPValueForText(vergleichASvsBF.mcnemar?.pValue, 'en')} (McNemar's test) and for AUC was ${formatPValueForText(vergleichASvsBF.delong?.pValue, 'en')} (DeLong's test). The difference in AUC was ${diffAucBfStr}.</p>`;
                } else {
                     text += `<p>A full comparison between AS and the T2 criteria optimized for ${bfZielMetric} could not be performed, or no specific optimization results were available for this metric and cohort.</p>`;
                }
            }
        });

        text += `<div id="${table6Id}" class="publication-table-container"></div>`;
        text += `<div class="row">
                    <div class="col-md-12 col-lg-4"><div id="${fig2aId}" class="publication-chart-container"></div></div>
                    <div class="col-md-12 col-lg-4"><div id="${fig2bId}" class="publication-chart-container"></div></div>
                    <div class="col-md-12 col-lg-4"><div id="${fig2cId}" class="publication-chart-container"></div></div>
                 </div>`;
        return text;
    }

    function getDiskussionTexte(lang, commonData, allKollektivStats, options, sectionPart) {
        const refAS = getReference('lurzSchaefer2025', commonData, 'citation');
        const bfZielMetric = options?.bruteForceMetric || commonData?.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        let text = "";

        switch (sectionPart) {
            case 'hauptergebnisse':
                if (lang === 'de') {
                    text = `<p>Die vorliegende Studie verglich die diagnostische Leistungsfähigkeit des Avocado Signs (AS) mit etablierten Literatur-basierten und datengetriebenen Brute-Force (BF) optimierten T2-gewichteten MRT-Kriterien zur Prädiktion des mesorektalen Nodalstatus bei Patienten mit Rektumkarzinom. Das AS zeigte konsistent eine hohe diagnostische Güte über verschiedene Patientenkollektive hinweg, vergleichbar mit oder teilweise überlegen zu den T2-Kriterien. Insbesondere die für die Zielmetrik ${bfZielMetric} optimierten T2-Kriterien erreichten in den jeweiligen Kollektiven ebenfalls eine hohe Performance, was das Potenzial einer individualisierten Kriterienanpassung unterstreicht. Die statistischen Vergleiche zeigten jedoch oft keine signifikanten Unterschiede in der AUC zwischen dem AS und den besten T2-basierten Ansätzen, was auf eine vergleichbare Gesamt-Trennschärfe hindeutet, wobei das AS den Vorteil einer einfacheren, kontrastmittelbasierten Bewertung ohne komplexe morphologische Kriterienkombinationen bietet.</p>`;
                } else {
                    text = `<p>This study compared the diagnostic performance of the Avocado Sign (AS) with established literature-based and data-driven brute-force (BF) optimized T2-weighted MRI criteria for predicting mesorectal nodal status in patients with rectal cancer. The AS consistently demonstrated high diagnostic performance across different patient cohorts, comparable to or, in some aspects, superior to T2 criteria. Notably, T2 criteria optimized for the target metric ${bfZielMetric} also achieved high performance in their respective cohorts, underscoring the potential of individualized criteria adaptation. However, statistical comparisons often showed no significant differences in AUC between AS and the best T2-based approaches, suggesting comparable overall discriminatory power, with AS offering the advantage of a simpler, contrast-based assessment without complex morphological criteria combinations.</p>`;
                }
                break;
            case 'vergleich_literatur':
                 if (lang === 'de') {
                    text = `<p>Im Vergleich zu den etablierten ESGAR-Konsensuskriterien (evaluiert durch ${getReference('rutegard2025', commonData, 'citation')}) zeigte das AS in der Direkt-OP Gruppe tendenziell eine höhere Sensitivität bei vergleichbarer Spezifität. Die Kriterien nach ${getReference('koh2008', commonData, 'citation')}, angewendet auf das Gesamtkollektiv, und nach ${getReference('barbaro2024', commonData, 'citation')}, angewendet auf die nRCT-Gruppe, zeigten eine variable Performance, die in einigen Metriken von der des AS und der BF-optimierten Kriterien abwich. Diese Unterschiede unterstreichen die Heterogenität publizierter T2-Kriterien und die Herausforderung, ein universell optimales T2-Set zu definieren.</p>`;
                } else {
                    text = `<p>Compared to the established ESGAR consensus criteria (evaluated by ${getReference('rutegard2025', commonData, 'citation')}), the AS tended to show higher sensitivity with comparable specificity in the upfront surgery group. The criteria by ${getReference('koh2008', commonData, 'citation')}, applied to the overall cohort, and by ${getReference('barbaro2024', commonData, 'citation')}, applied to the nRCT cohort, exhibited variable performance, differing in some metrics from AS and the BF-optimized criteria. These differences highlight the heterogeneity of published T2 criteria and the challenge of defining a universally optimal T2 set.</p>`;
                }
                break;
            case 'limitationen':
                if (lang === 'de') {
                    text = `<p>Diese Studie weist einige Limitationen auf. Der retrospektive, monozentrische Charakter kann die Generalisierbarkeit der Ergebnisse einschränken. Obwohl die Bewerter verblindet waren, könnte ein systematischer Bias nicht gänzlich ausgeschlossen werden. Die für die BF-Optimierung verwendete Zielmetrik (${bfZielMetric}) beeinflusst die resultierenden Kriterien; andere Metriken könnten zu abweichenden optimalen Sets führen. Eine direkte Verblindung zwischen AS- und T2-Merkmal-Erfassung war aufgrund des Studiendesigns nicht vollständig gegeben, da beide auf denselben MRT-Untersuchungen basieren, wenn auch auf unterschiedlichen Sequenzen. Die Fallzahl, insbesondere in den Subgruppen, ist limitiert, was die statistische Power einiger Vergleiche einschränken und zu breiten Konfidenzintervallen führen kann.</p>`;
                } else {
                    text = `<p>This study has several limitations. Its retrospective, single-center design may limit the generalizability of the findings. Although assessors were blinded, systematic bias cannot be entirely ruled out. The target metric used for BF optimization (${bfZielMetric}) influences the resulting criteria; other metrics might lead to different optimal sets. Direct blinding between AS and T2 feature assessment was not fully achievable due to the study design, as both are based on the same MRI examinations, albeit different sequences. The sample size, particularly in subgroups, is limited, which may affect the statistical power of some comparisons and lead to wide confidence intervals.</p>`;
                }
                break;
            case 'schlussfolgerung':
                 if (lang === 'de') {
                    text = `<p>Das Avocado Sign ist ein vielversprechender, einfach anzuwendender MRT-Marker für die Prädiktion des mesorektalen Lymphknotenstatus bei Rektumkarzinompatienten, dessen diagnostische Güte mit optimierten T2-Kriterien vergleichbar ist. Seine Integration in die Standard-MRT-Protokolle könnte die Genauigkeit des N-Stagings verbessern. Zukünftige prospektive, multizentrische Studien sind erforderlich, um diese Ergebnisse zu validieren und den klinischen Nutzen des Avocado Signs, insbesondere im Kontext moderner, risikoadaptierter Therapiestrategien, weiter zu untersuchen.</p>`;
                } else {
                    text = `<p>The Avocado Sign is a promising, easy-to-apply MRI marker for predicting mesorectal lymph node status in rectal cancer patients, with diagnostic performance comparable to optimized T2 criteria. Its integration into standard MRI protocols could improve the accuracy of N-staging. Future prospective, multicenter studies are needed to validate these findings and further investigate the clinical utility of the Avocado Sign, particularly in the context of modern, risk-adapted treatment strategies.</p>`;
                }
                break;
            default: text = `<p>${lang === 'de' ? 'Inhalt für diesen Diskussionsteil wird noch generiert.' : 'Content for this discussion part is yet to be generated.'}</p>`;
        }
        return text;
    }

    function getReferenzenText(lang, commonData) {
        const refs = commonData.references || {};
        let text = "";
        const referenceOrder = [
            'lurzSchaefer2025', 'koh2008', 'barbaro2024', 'rutegard2025', 'beetsTan2018ESGAR',
            'brown2003', 'horvat2019', 'kaur2012','beetsTan2004', 'barbaro2010', 'lahaye2009',
            'ethicsVote', 'lurzSchaefer2025StudyPeriod', 'lurzSchaefer2025MRISystem', 'lurzSchaefer2025ContrastAgent', 'lurzSchaefer2025T2SliceThickness', 'lurzSchaefer2025RadiologistExperience'
        ];
        const displayedRefs = new Set();
        
        const addRef = (refKey) => {
            const refObj = refs[refKey];
            if (refObj && refObj.full && !displayedRefs.has(refObj.full)) {
                const safeFullRef = String(refObj.full).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                text += `<li>${safeFullRef}</li>`;
                displayedRefs.add(refObj.full);
            }
        };
        
        referenceOrder.forEach(key => addRef(key));
        
        for (const key in refs) {
            if (Object.prototype.hasOwnProperty.call(refs, key) && !referenceOrder.includes(key)) {
                 addRef(key);
            }
        }

        if (displayedRefs.size > 0) {
             return `<ol class="small publication-references">${text}</ol>`;
        }
        return `<p>${lang === 'de' ? 'Keine Referenzen definiert.' : 'No references defined.'}</p>`;
    }


    function getSectionText(sectionId, lang, allKollektivStats, commonData, options = {}) {
        if (!allKollektivStats || !commonData) {
            return `<p class="text-danger">${lang === 'de' ? 'Fehler: Notwendige Daten für die Textgenerierung fehlen.' : 'Error: Necessary data for text generation is missing.'}</p>`;
        }
        const currentOptions = {
            bruteForceMetric: options?.bruteForceMetric || commonData?.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
        };

        switch (sectionId) {
            case 'einleitung_hintergrund': return getEinleitungHintergrundText(lang, commonData);
            case 'methoden_studienanlage': return getMethodenStudienanlageText(lang, commonData);
            case 'methoden_patientenkollektiv': return getMethodenPatientenkollektivText(lang, allKollektivStats, commonData);
            case 'methoden_mrt_protokoll': return getMethodenMRTProtokollText(lang, commonData);
            case 'methoden_as_definition': return getMethodenASDefinitionText(lang, commonData);
            case 'methoden_t2_definition': return getMethodenT2DefinitionText(lang, commonData, allKollektivStats, currentOptions);
            case 'methoden_referenzstandard': return getMethodenReferenzstandardText(lang, commonData);
            case 'methoden_statistische_analyse': return getMethodenStatistischeAnalyseText(lang, commonData);
            case 'ergebnisse_patientencharakteristika': return getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData);
            case 'ergebnisse_as_performance': return getErgebnisseASPerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_literatur_t2_performance': return getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_optimierte_t2_performance': return getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData, currentOptions);
            case 'ergebnisse_vergleich_performance': return getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData, currentOptions);
            case 'diskussion_hauptergebnisse': return getDiskussionTexte(lang, commonData, allKollektivStats, currentOptions, 'hauptergebnisse');
            case 'diskussion_vergleich_literatur': return getDiskussionTexte(lang, commonData, allKollektivStats, currentOptions, 'vergleich_literatur');
            case 'diskussion_limitationen': return getDiskussionTexte(lang, commonData, allKollektivStats, currentOptions, 'limitationen');
            case 'diskussion_schlussfolgerung': return getDiskussionTexte(lang, commonData, allKollektivStats, currentOptions, 'schlussfolgerung');
            case 'referenzen_liste': return getReferenzenText(lang, commonData);
            default: return `<p class="text-warning">Text für Sektion '${sectionId}' (Sprache: ${lang}) noch nicht implementiert.</p>`;
        }
    }

    function getSectionTextAsMarkdown(sectionId, lang, allKollektivStats, commonData, options = {}) {
        const htmlContent = getSectionText(sectionId, lang, allKollektivStats, commonData, options);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        let preProcessedHtml = htmlContent.replace(/\/g, (match, p1RefKey) => {
            const refShort = getReference(p1RefKey, commonData, 'citation');
            const escapedRef = typeof ui_helpers !== 'undefined' && ui_helpers.escapeMarkdown ? ui_helpers.escapeMarkdown(refShort) : refShort.replace(/([*_[\]()#+.!])/g, '\\$1');
            return `(CITE_PLACEHOLDER_${p1RefKey}_${escapedRef})`;
        });
        
        preProcessedHtml = preProcessedHtml.replace(/<a href="#(.*?)">(.*?)<\/a>/g, (match, p1Id, p2LinkText) => {
                const elementConfig = PUBLICATION_CONFIG.publicationElements;
                let referencedElementName = p2LinkText;
                const bfMetricForTitle = options?.bruteForceMetric || commonData?.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

                const findElementDetailsRecursive = (currentConfigLevel, targetId) => {
                    for (const categoryKey in currentConfigLevel) {
                        const categoryElements = currentConfigLevel[categoryKey];
                        for (const elementKey in categoryElements) {
                            const elementDetails = categoryElements[elementKey];
                            if (elementDetails && typeof elementDetails === 'object' && elementDetails.id === targetId) {
                                return elementDetails;
                            }
                        }
                    }
                    return null;
                };
                const elementDetails = findElementDetailsRecursive(elementConfig, p1Id);

                if (elementDetails) {
                    referencedElementName = (lang === 'de' ? elementDetails.titleDe : elementDetails.titleEn) || p2LinkText;
                    referencedElementName = referencedElementName.replace(/{BF_METRIC}/g, bfMetricForTitle)
                                                             .replace(/\[N_GESAMT\]/g, String(commonData?.nGesamt || 'N/A'))
                                                             .replace(/\[N_DIREKT_OP\]/g, String(commonData?.nDirektOP || 'N/A'))
                                                             .replace(/\[N_NRCT\]/g, String(commonData?.nNRCT || 'N/A'));
                }
                const escapedElementName = typeof ui_helpers !== 'undefined' && ui_helpers.escapeMarkdown ? ui_helpers.escapeMarkdown(referencedElementName) : referencedElementName.replace(/([*_[\]()#+.!])/g, '\\$1');
                return `LINK_PLACEHOLDER_START${escapedElementName}LINK_PLACEHOLDER_END`;
            });

        tempDiv.innerHTML = preProcessedHtml;
        tempDiv.querySelectorAll('.publication-table-container, .publication-chart-container, div.row > div[class*="col-md-"], div.row').forEach(el => {
             if(el.innerHTML.trim() === '' || el.querySelectorAll(':scope > div.publication-table-container, :scope > div.publication-chart-container, :scope > div.row > div[class*="col-md-"]').length === el.children.length) {
                 // Nur leere strukturelle divs entfernen
                 if(el.matches('.publication-table-container, .publication-chart-container') || 
                    (el.matches('div.row') && el.innerHTML.trim() === '') || 
                    (el.matches('div[class*="col-md-"]') && el.innerHTML.trim() === '')) {
                     el.remove();
                 }
             }
        });
        
        let markdown = tempDiv.innerHTML;

        markdown = markdown
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
            .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, (match, p1Content) => {
                const levelMatch = match.match(/<h(\d)/);
                const level = levelMatch ? parseInt(levelMatch[1]) : 1;
                const escapedContent = typeof ui_helpers !== 'undefined' && ui_helpers.escapeMarkdown ? ui_helpers.escapeMarkdown(p1Content) : p1Content.replace(/([*_[\]()#+.!])/g, '\\$1');
                return `\n${'#'.repeat(level + 1)} ${escapedContent}\n`;
            })
            .replace(/<hr\s+class="my-3"\s*\/?>/g, '\n---\n')
            .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ')
            .replace(/LINK_PLACEHOLDER_START(.*?)LINK_PLACEHOLDER_END/g, '[$1]')
            .replace(/\(CITE_PLACEHOLDER_(.*?)_(.*?)\)/g, '($2)')
            .replace(/ {2,}/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();

        if (sectionId === 'referenzen_liste' && markdown.includes('\n* ')) {
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
