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

    function fCI(metric, digits = 1, isPercent = true, lang = 'de', placeholderValue = 'N/A') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value) || !isFinite(metric.value)) {
            return placeholderValue;
        }
        const valStr = isPercent ? fPercent(metric.value, digits, placeholderValue) : fValue(metric.value, digits, '', placeholderValue);
        if (valStr === placeholderValue) return valStr;

        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper) && isFinite(metric.ci.lower) && isFinite(metric.ci.upper)) {
            const lowerStr = isPercent ? fPercent(metric.ci.lower, digits, '') : fValue(metric.ci.lower, digits, '', '');
            const upperStr = isPercent ? fPercent(metric.ci.upper, digits, '') : fValue(metric.ci.upper, digits, '', '');
            if (lowerStr === '' || upperStr === '') return valStr;
            const ciText = lang === 'de' ? '95%-KI' : '95% CI';
            return `${valStr} (${ciText} ${lowerStr}–${upperStr})`;
        }
        return valStr;
    }

    function getPValueText(pValue, lang = 'de', includeEqualsSymbol = true, precision = 3) {
        if (pValue === null || pValue === undefined || isNaN(pValue)) return lang === 'de' ? 'p = n.a.' : 'P = N/A';
        if (pValue < 0.001) return lang === 'de' ? 'p < 0,001' : 'P < .001';

        let pFormatted = pValue.toFixed(precision);
        if (lang === 'de') {
            pFormatted = pFormatted.replace('.', ',');
        }
        const equalitySymbol = includeEqualsSymbol ? '= ' : '';
        return `${lang === 'de' ? 'p' : 'P'} ${equalitySymbol}${pFormatted}`;
    }


    function getKollektivText(kollektivId, n, lang = 'de') {
        const name = getKollektivDisplayName(kollektivId) || kollektivId;
        const nText = lang === 'de' ? `(N=${n})` : `(n=${n})`;
        return `${name} ${nText}`;
    }

    function getReference(key, commonData, lang = 'de') {
        const ref = commonData.references[key];
        if (!ref) return "";
        const splitRef = ref.split(" ");
        const yearMatch = ref.match(/\b(19|20)\d{2}\b/g);
        const year = yearMatch ? yearMatch[yearMatch.length-1] : "";
        if (lang === 'de' || lang === 'en') {
            return `${splitRef[0]} et al. (${year})`;
        }
        return `${splitRef[0]} et al. (${year})`;
    }

    function getMethodenStudienanlageText(lang, allKollektivStats, commonData) {
        const appVersion = commonData.appVersion || APP_CONFIG.APP_VERSION;
        const lurzSchaeferRef = getReference('lurzSchaefer2025', commonData, lang);
        const ethicsVote = "Ethikkommission der Landesärztekammer Sachsen (123/20-ek)";
        const clinicName = "Klinikum St. Georg gGmbH, Leipzig, Deutschland";
        const softwareCredit = "Eigenentwicklung (Autoren M.L., A.O.S.)";


        if (lang === 'de') {
            return `
                <p>Die vorliegende Untersuchung wurde als retrospektive Analyse prospektiv und systematisch erhobener Daten eines monozentrischen Patientenkollektivs mit histologisch gesichertem Rektumkarzinom konzipiert. Dieses Kollektiv diente bereits als Grundlage der initialen Studie zum "Avocado Sign" ${lurzSchaeferRef}. Das primäre Ziel dieser weiterführenden Analyse war der Vergleich der diagnostischen Güte des bildmorphologischen Avocado Signs mit etablierten T2-gewichteten Kriterien sowie mit mittels Brute-Force-Algorithmus optimierten T2-Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status).</p>
                <p>Alle Patienten wurden zwischen Januar 2020 und November 2023 am ${clinicName} behandelt. Die Studie wurde in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki (revidierte Fassung 2013) durchgeführt und von der zuständigen Ethikkommission genehmigt (${ethicsVote}). Aufgrund des retrospektiven Charakters der Analyse und der Verwendung anonymisierter Daten wurde auf ein erneutes Einverständnis der Patienten verzichtet; ein generelles Einverständnis zur wissenschaftlichen Nutzung der Daten lag für alle Patienten vor.</p>
                <p>Sämtliche Datenanalysen, statistischen Berechnungen und die Erstellung von Abbildungen erfolgten unter Verwendung einer speziell für diese Untersuchung entwickelten, interaktiven Webanwendung (${softwareCredit}, AvocadoSign Analyse Tool v${appVersion}, basierend auf JavaScript, HTML5 und CSS3). Diese ermöglicht die flexible Definition und Anwendung von T2-Kriteriensets, die automatisierte Optimierung von Kriterienkombinationen sowie die umfassende statistische Auswertung und Visualisierung der Ergebnisse.</p>
            `;
        } else {
            return `
                <p>The present study was designed as a retrospective analysis of prospectively and systematically collected data from a single-center patient cohort with histologically confirmed rectal cancer. This cohort also formed the basis of the initial "Avocado Sign" study ${lurzSchaeferRef}. The primary objective of this advanced analysis was to compare the diagnostic performance of the Avocado Sign imaging marker with established T2-weighted criteria and with T2-criteria optimized by a brute-force algorithm for predicting mesorectal lymph node status (N-status).</p>
                <p>All patients were treated at the ${clinicName} between January 2020 and November 2023. The study was conducted in accordance with the principles of the Declaration of Helsinki (revised 2013 version) and was approved by the responsible ethics committee (${ethicsVote}). Due to the retrospective nature of the analysis and the use of anonymized data, renewed patient consent was waived; general consent for the scientific use of data was available for all patients.</p>
                <p>All data analyses, statistical calculations, and figure generation were performed using a custom-developed interactive web application (${softwareCredit}, AvocadoSign Analysis Tool v${appVersion}, based on JavaScript, HTML5, and CSS3). This tool allows for flexible definition and application of T2 criteria sets, automated optimization of criteria combinations, and comprehensive statistical evaluation and visualization of results.</p>
            `;
        }
    }

    function getMethodenPatientenkollektivText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const nGesamt = commonData.nGesamt || 'N/A';
        const nNRCT = commonData.nNRCT || 'N/A';
        const nDirektOP = commonData.nDirektOP || 'N/A';
        const alterMedian = fValue(pCharGesamt?.alter?.median, 1, '', 'N/A');
        const alterMin = fValue(pCharGesamt?.alter?.min, 0, '', 'N/A');
        const alterMax = fValue(pCharGesamt?.alter?.max, 0, '', 'N/A');
        const prozentMaennlich = fPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN, 0, 'N/A');
        const nMaennlich = pCharGesamt?.geschlecht?.m ?? 0;
        const nPatientenGesamt = pCharGesamt?.anzahlPatienten || 0;
        const clinicName = "Klinikum St. Georg gGmbH, Leipzig, Deutschland";

        if (lang === 'de') {
            return `
                <p>In die Analyse wurde dasselbe monozentrische Kollektiv von ${nGesamt} konsekutiven Patienten mit histologisch gesichertem Rektumkarzinom eingeschlossen, das bereits für die ursprüngliche Avocado-Sign-Studie ${getReference('lurzSchaefer2025', commonData, lang)} herangezogen wurde. Die Patienten wurden zwischen Januar 2020 und November 2023 am ${clinicName} behandelt. Von diesen erhielten ${nNRCT} Patienten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während ${nDirektOP} Patienten einer primären Operation zugeführt wurden (Direkt-OP-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${alterMedian} Jahre (Spannweite ${alterMin}–${alterMax} Jahre). Der Anteil männlicher Patienten lag bei ${prozentMaennlich} (${nMaennlich}/${nPatientenGesamt}). Detaillierte demographische und klinische Charakteristika des Gesamtkollektivs sowie der Subgruppen sind in Tabelle 1 zusammengefasst.</p>
                <p>Die Einschlusskriterien umfassten ein Mindestalter von 18 Jahren und ein durch Biopsie bestätigtes Adenokarzinom des Rektums. Ausschlusskriterien waren das Vorliegen von Fernmetastasen zum Zeitpunkt der Diagnosestellung (M1-Status), nicht-resektable Tumoren, Kontraindikationen für eine MRT-Untersuchung (z.B. nicht-MRT-taugliche Implantate, schwere Klaustrophobie) oder eine vorherige operative oder strahlentherapeutische Behandlung des Beckens aus anderer Ursache.</p>
            `;
        } else {
            return `
                <p>The same single-center cohort of ${nGesamt} consecutive patients with histologically confirmed rectal cancer, previously utilized for the original Avocado Sign study ${getReference('lurzSchaefer2025', commonData, lang)}, was included in this analysis. Patients were treated at the ${clinicName} between January 2020 and November 2023. Of these, ${nNRCT} patients received neoadjuvant chemoradiotherapy (nRCT group), while ${nDirektOP} patients underwent upfront surgery (upfront surgery group). The median age in the overall cohort was ${alterMedian} years (range ${alterMin}–${alterMax} years). The proportion of male patients was ${prozentMaennlich} (${nMaennlich}/${nPatientenGesamt}). Detailed demographic and clinical characteristics of the overall cohort and subgroups are summarized in Table 1.</p>
                <p>Inclusion criteria comprised a minimum age of 18 years and biopsy-proven adenocarcinoma of the rectum. Exclusion criteria were the presence of distant metastases at diagnosis (M1 status), unresectable tumors, contraindications to MRI examination (e.g., non-MRI-compatible implants, severe claustrophobia), or prior pelvic surgery or radiotherapy for other reasons.</p>
            `;
        }
    }

     function getMethodenMRTProtokollText(lang, allKollektivStats, commonData) {
         if (lang === 'de') {
            return `
                <p>Alle MRT-Untersuchungen des Beckens wurden an einem 3,0-Tesla-System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Deutschland) unter Verwendung einer Kombination aus Körper-Phased-Array- und Wirbelsäulen-Array-Spulen durchgeführt. Das standardisierte Bildgebungsprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Orientierung sowie eine axiale diffusionsgewichtete Sequenz (DWI). Für die Beurteilung des Avocado Signs wurde obligat eine kontrastmittelverstärkte, fettgesättigte, T1-gewichtete 3D-Gradientenecho-Sequenz (VIBE – Volumetric Interpolated Breath-hold Examination) in axialer Schichtführung akquiriert. Die genauen Sequenzparameter sind in der Originalpublikation des Avocado Signs detailliert aufgeführt ${getReference('lurzSchaefer2025', commonData, lang)}.</p>
                <p>Als Kontrastmittel wurde Gadoteridol (ProHance®; Bracco Imaging, Mailand, Italien) in einer Standarddosis von 0,1 mmol/kg Körpergewicht intravenös appliziert, gefolgt von einer Spülung mit 20 ml Kochsalzlösung. Die kontrastmittelverstärkten T1-gewichteten Aufnahmen erfolgten unmittelbar nach vollständiger Applikation des Kontrastmittels. Zur Reduktion von Darmperistaltik-bedingten Bewegungsartefakten wurde zu Beginn der Untersuchung sowie bei Bedarf erneut während der Untersuchung Butylscopolamin (20 mg i.v.) verabreicht, sofern keine Kontraindikationen bestanden. Das Bildgebungsprotokoll war für die primäre Staging-Untersuchung und die Restaging-Untersuchung nach neoadjuvanter Therapie identisch.</p>
            `;
        } else {
            return `
                <p>All pelvic MRI examinations were performed on a 3.0-Tesla system (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Germany) using a combination of body phased-array and spine array coils. The standardized imaging protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal orientations, as well as an axial diffusion-weighted imaging (DWI) sequence. For the assessment of the Avocado Sign, a contrast-enhanced, fat-saturated, T1-weighted 3D gradient-echo sequence (VIBE – Volumetric Interpolated Breath-hold Examination) was mandatory and acquired in the axial plane. Detailed sequence parameters are listed in the original Avocado Sign publication ${getReference('lurzSchaefer2025', commonData, lang)}.</p>
                <p>Gadoteridol (ProHance®; Bracco Imaging, Milan, Italy) was administered intravenously as a contrast agent at a standard dose of 0.1 mmol/kg body weight, followed by a 20 mL saline flush. Contrast-enhanced T1-weighted images were acquired immediately after the intravenous contrast agent had been fully administered. To reduce motion artifacts due to bowel peristalsis, butylscopolamine (20 mg i.v.) was administered at the beginning of the examination and again during the examination if needed, provided no contraindications existed. The imaging protocol was identical for primary staging and restaging examinations after neoadjuvant therapy.</p>
            `;
        }
    }

    function getMethodenASDefinitionText(lang, allKollektivStats, commonData) {
        const lurzSchaeferRef = getReference('lurzSchaefer2025', commonData, lang);
        const radiologenErfahrung = lang === 'de' ? "(M.L.: 7 Jahre Erfahrung Abdominalradiologie; A.O.S.: 29 Jahre Erfahrung Abdominalradiologie)" : "(M.L.: 7 years of experience in abdominal radiology; A.O.S.: 29 years of experience in abdominal radiology)";
        if (lang === 'de') {
            return `
                <p>Das Avocado Sign (AS) wurde auf den kontrastmittelverstärkten, fettgesättigten T1-gewichteten Bildern definiert als ein zentraler, signalarmer (hypointenser) Kern innerhalb eines ansonsten homogen signalreichen (hyperintensen), ovalären oder runden Lymphknotens im Mesorektum. Die Bewertung erfolgte unabhängig von der Größe oder der exakten Form des Lymphknotens, solange dieser als distinkte nodale Struktur identifizierbar war. Alle sichtbaren mesorektalen Lymphknoten wurden auf das Vorhandensein des AS beurteilt. Ein Patient wurde als AS-positiv (AS+) klassifiziert, wenn mindestens ein Lymphknoten im Mesorektum das AS zeigte. Fehlte das Zeichen in allen beurteilbaren mesorektalen Lymphknoten, wurde der Patient als AS-negativ (AS-) eingestuft.</p>
                <p>Die Bildanalyse und Bewertung des Avocado Signs erfolgte, wie in der Originalstudie ${lurzSchaeferRef} beschrieben und für die aktuelle Analyse gemeinschaftlich reevaluiert, durch zwei geblindete, erfahrene Radiologen ${radiologenErfahrung} im Konsens. Bei initial diskrepanten Fällen wurde ein Konsensus durch gemeinsame erneute Beurteilung erzielt.</p>
            `;
        } else {
            return `
                <p>The Avocado Sign (AS) was defined on contrast-enhanced, fat-saturated T1-weighted images as a central, low-signal-intensity (hypointense) core within an otherwise homogeneously high-signal-intensity (hyperintense), oval or round lymph node in the mesorectum. The assessment was performed irrespective of the size or exact shape of the lymph node, as long as it was identifiable as a distinct nodal structure. All visible mesorectal lymph nodes were evaluated for the presence of the AS. A patient was classified as AS-positive (AS+) if at least one mesorectal lymph node exhibited the AS. If the sign was absent in all assessable mesorectal lymph nodes, the patient was classified as AS-negative (AS-).</p>
                <p>Image analysis and assessment of the Avocado Sign were performed in consensus by two blinded, experienced radiologists ${radiologenErfahrung}, as described in the original study ${lurzSchaeferRef} and jointly re-evaluated for the current analysis. In initially discrepant cases, consensus was reached through joint re-evaluation.</p>
            `;
        }
    }

    function getMethodenT2DefinitionText(lang, allKollektivStats, commonData) {
        const bfOptimizedMetric = commonData.bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const sizeRange = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE;
        const sizeRangeText = `${fValue(sizeRange.min,1)}–${fValue(sizeRange.max,1)} mm ${lang === 'de' ? 'in' : 'in'} ${fValue(sizeRange.step,1)} mm ${lang === 'de' ? 'Schritten' : 'steps'}`;
        const formValuesText = APP_CONFIG.T2_CRITERIA_SETTINGS.FORM_VALUES.join(lang === 'de' ? ' oder ' : ' or ');
        const konturValuesText = APP_CONFIG.T2_CRITERIA_SETTINGS.KONTUR_VALUES.join(lang === 'de' ? ' oder ' : ' or ');
        const homogenitaetValuesText = APP_CONFIG.T2_CRITERIA_SETTINGS.HOMOGENITAET_VALUES.join(lang === 'de' ? ' oder ' : ' or ');
        const signalValuesText = APP_CONFIG.T2_CRITERIA_SETTINGS.SIGNAL_VALUES.join(lang === 'de' ? ' oder ' : ' or ');

        const getOptimizedCriteriaTextForKollektiv = (kollektivId) => {
            const bfData = allKollektivStats?.[kollektivId]?.bruteforce_definition;
            if (bfData && bfData.criteria && typeof studyT2CriteriaManager !== 'undefined' && typeof studyT2CriteriaManager.formatCriteriaForDisplayStrict === 'function') {
                const criteriaText = studyT2CriteriaManager.formatCriteriaForDisplayStrict(bfData.criteria, bfData.logic, false);
                const metricValFormatted = fValue(bfData.metricValue, (bfData.metricName === 'F1-Score' || bfData.metricName === 'Balanced Accuracy' || bfData.metricName === 'AUC') ? 3 : 1);
                if (bfData.metricName === bfOptimizedMetric) {
                    return `${criteriaText} (${lang === 'de' ? 'erreichte' : 'achieved'} ${bfData.metricName}: ${metricValFormatted})`;
                } else {
                    return lang === 'de' ? `Optimierung für '${bfOptimizedMetric}' nicht primär für diesen Text verwendet (Ergebnis für '${bfData.metricName}' mit Wert ${metricValFormatted} für Kriterien '${criteriaText}' vorhanden)`
                                          : `Optimization for '${bfOptimizedMetric}' not primarily used for this text (result for '${bfData.metricName}' with value ${metricValFormatted} for criteria '${criteriaText}' present)`;
                }
            } else if (bfData && bfData.criteria) {
                 return lang === 'de' ? `Formatierungsfunktion für Kriterien nicht verfügbar.` : `Criteria formatting function not available.`;
            }
            return lang === 'de' ? `Keine validen Optimierungsergebnisse für '${bfOptimizedMetric}' in diesem Kollektiv.` : `No valid optimization results for '${bfOptimizedMetric}' in this cohort.`;
        };

        const kohRef = getReference('koh2008', commonData, lang);
        const barbaroRef = getReference('barbaro2024', commonData, lang);
        const rutegardRef = getReference('rutegard2025', commonData, lang);
        const esgarRef = getReference('beetsTan2018ESGAR', commonData, lang);

        let kohSet = null, barbaroSet = null, esgarSet = null;
        let kohDesc = 'N/A', barbaroDesc = 'N/A', esgarDesc = 'N/A';

        if (typeof studyT2CriteriaManager !== 'undefined') {
            kohSet = studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology');
            barbaroSet = studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging');
            esgarSet = studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar');

            kohDesc = kohSet?.studyInfo?.keyCriteriaSummary || (kohSet ? studyT2CriteriaManager.formatCriteriaForDisplayStrict(kohSet.criteria, kohSet.logic, false) : 'N/A');
            barbaroDesc = barbaroSet?.studyInfo?.keyCriteriaSummary || (barbaroSet ? studyT2CriteriaManager.formatCriteriaForDisplayStrict(barbaroSet.criteria, barbaroSet.logic, false) : 'N/A');
            esgarDesc = esgarSet?.studyInfo?.keyCriteriaSummary || esgarSet?.description || 'N/A';
        }

        const radiologenErfahrung = lang === 'de' ? "(M.L.: 7 Jahre Erfahrung; A.O.S.: 29 Jahre Erfahrung)" : "(M.L.: 7 years of experience; A.O.S.: 29 years of experience)";


        if (lang === 'de') {
            return `
                <p>Die morphologische Beurteilung der mesorektalen Lymphknoten auf Basis der T2-gewichteten MRT-Sequenzen erfolgte unter Anwendung verschiedener Kriteriensets. Für jeden sichtbaren mesorektalen Lymphknoten wurden die folgenden fünf morphologischen T2-Merkmale erfasst: Kurzachsendurchmesser (in mm), Form (${formValuesText}), Kontur (${konturValuesText}), Binnensignalhomogenität (${homogenitaetValuesText}) und Signalintensität relativ zur umgebenden Muskulatur (${signalValuesText}). Die Erfassung dieser Merkmale erfolgte durch die oben genannten Radiologen ${radiologenErfahrung} im Konsens, geblindet gegenüber dem Avocado Sign Befund sowie dem histopathologischen Ergebnis, ausschließlich unter Verwendung der T2-gewichteten Sequenzen in drei Ebenen.</p>
                <p>Folgende Kriteriensets wurden für die Analyse herangezogen:</p>
                <ol>
                    <li><strong>Literatur-basierte T2-Kriteriensets:</strong>
                        <ul>
                            <li><strong>Koh et al. ${kohRef}:</strong> Definiert als ${kohDesc}. Dieses Kriterienset wurde in der vorliegenden Analyse primär auf das Gesamtkollektiv angewendet.</li>
                            <li><strong>Barbaro et al. ${barbaroRef}:</strong> Definiert als ${barbaroDesc}. Dieses Kriterienset, ursprünglich für das Restaging nach nRCT entwickelt, wurde in der vorliegenden Analyse primär auf die nRCT-Subgruppe angewendet.</li>
                            <li><strong>ESGAR Konsensus Kriterien 2016 (evaluiert durch Rutegård et al. ${rutegardRef}, basierend auf ${esgarRef}):</strong> Definiert als ${esgarDesc}. Dieses komplexe, größenabhängige Kriterienset wurde in der vorliegenden Analyse primär auf die Direkt-OP-Subgruppe (Primärstaging) angewendet.</li>
                        </ul>
                        Eine detaillierte Aufschlüsselung dieser Literatur-Kriterien ist in Tabelle 2 dargestellt.
                    </li>
                    <li><strong>Brute-Force optimierte T2-Kriterien:</strong> Für jedes der drei Patientenkollektive (Gesamt, Direkt OP, nRCT) wurden mittels eines integrierten Brute-Force-Algorithmus diejenigen T2-Kriterienkombinationen identifiziert, welche die Zielmetrik "${bfOptimizedMetric}" im Vergleich zum pathologischen N-Status maximieren. In die Optimierung flossen alle fünf erfassten T2-Merkmale (Kurzachsendurchmesser im Bereich ${sizeRangeText}; Form: ${formValuesText}; Kontur: ${konturValuesText}; Homogenität: ${homogenitaetValuesText}; Signalintensität: ${signalValuesText}) sowie beide möglichen logischen Verknüpfungen (UND oder ODER) ein. Die resultierenden, spezifisch für jedes Kollektiv optimierten Kriterien sind:
                        <ul>
                            <li>Gesamtkollektiv: ${getOptimizedCriteriaTextForKollektiv('Gesamt')}</li>
                            <li>Direkt-OP-Gruppe: ${getOptimizedCriteriaTextForKollektiv('direkt OP')}</li>
                            <li>nRCT-Gruppe: ${getOptimizedCriteriaTextForKollektiv('nRCT')}</li>
                        </ul>
                    </li>
                </ol>
                <p>Für alle T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) galt ein Patient als T2-positiv, wenn mindestens ein mesorektaler Lymphknoten die jeweiligen Kriterien für Malignität erfüllte.</p>
            `;
        } else {
            return `
                <p>Morphological assessment of mesorectal lymph nodes based on T2-weighted MRI sequences was performed using various criteria sets. For each visible mesorectal lymph node, the following five morphological T2 features were recorded: short-axis diameter (in mm), shape (${formValuesText}), border (${konturValuesText}), internal signal homogeneity (${homogenitaetValuesText}), and signal intensity relative to surrounding muscle (${signalValuesText}). These features were assessed in consensus by the aforementioned radiologists ${radiologenErfahrung}, blinded to the Avocado Sign findings and histopathological results, using only the T2-weighted sequences in three planes.</p>
                <p>The following criteria sets were used for the analysis:</p>
                <ol>
                    <li><strong>Literature-based T2 criteria sets:</strong>
                        <ul>
                            <li><strong>Koh et al. ${kohRef}:</strong> Defined as ${kohDesc}. In the present analysis, this criteria set was primarily applied to the overall cohort.</li>
                            <li><strong>Barbaro et al. ${barbaroRef}:</strong> Defined as ${barbaroDesc}. This criteria set, originally developed for restaging after nRCT, was primarily applied to the nRCT subgroup in this analysis.</li>
                            <li><strong>ESGAR Consensus Criteria 2016 (evaluated by Rutegård et al. ${rutegardRef}, based on ${esgarRef}):</strong> Defined as ${esgarDesc}. This complex, size-dependent criteria set was primarily applied to the upfront surgery subgroup (primary staging) in this analysis.</li>
                        </ul>
                        A detailed breakdown of these literature-based criteria is presented in Table 2.
                    </li>
                    <li><strong>Brute-force optimized T2 criteria:</strong> For each of the three patient cohorts (Overall, Upfront Surgery, nRCT), T2 criteria combinations that maximize the target metric "${bfOptimizedMetric}" compared to pathological N-status were identified using an integrated brute-force algorithm. The optimization included all five recorded T2 features (short-axis diameter ranging from ${sizeRangeText}; shape: ${formValuesText}; border: ${konturValuesText}; homogeneity: ${homogenitaetValuesText}; signal intensity: ${signalValuesText}) and both logical operators (AND or OR). The resulting criteria, specifically optimized for each cohort, are:
                        <ul>
                            <li>Overall cohort: ${getOptimizedCriteriaTextForKollektiv('Gesamt')}</li>
                            <li>Upfront surgery group: ${getOptimizedCriteriaTextForKollektiv('direkt OP')}</li>
                            <li>nRCT group: ${getOptimizedCriteriaTextForKollektiv('nRCT')}</li>
                        </ul>
                    </li>
                </ol>
                <p>For all T2 criteria sets (literature-based and brute-force optimized), a patient was considered T2-positive if at least one mesorectal lymph node met the respective criteria for malignancy.</p>
            `;
        }
    }

    function getMethodenReferenzstandardText(lang, allKollektivStats, commonData) {
         if (lang === 'de') {
            return `
                <p>Der Referenzstandard für den mesorektalen Lymphknotenstatus wurde durch die histopathologische Untersuchung der Operationspräparate nach totaler mesorektaler Exzision (TME) definiert. Alle im Präparat identifizierten Lymphknoten wurden standardisiert aufgearbeitet und mikroskopisch auf das Vorhandensein von Tumorzellen untersucht. Ein Patient wurde als N-positiv (N+) eingestuft, wenn in mindestens einem Lymphknoten Metastasen nachgewiesen wurden. Lagen in keinem der untersuchten Lymphknoten Metastasen vor, galt der Patient als N-negativ (N0). Die pathologische Aufarbeitung und Befundung erfolgte durch erfahrene Pathologen, die gegenüber den radiologischen Befunden geblindet waren.</p>
            `;
        } else {
            return `
                <p>The reference standard for mesorectal lymph node status was defined by histopathological examination of surgical specimens after total mesorectal excision (TME). All lymph nodes identified in the specimen were processed and microscopically examined for the presence of tumor cells according to standardized protocols. A patient was classified as N-positive (N+) if metastases were detected in at least one lymph node. If no metastases were present in any of the examined lymph nodes, the patient was considered N-negative (N0). Pathological processing and reporting were performed by experienced pathologists blinded to the radiological findings.</p>
            `;
        }
    }

    function getMethodenStatistischeAnalyseText(lang, allKollektivStats, commonData) {
        const alpha = commonData.significanceLevel || 0.05;
        const bootstrapN = commonData.bootstrapReplications || 1000;
        const pValueFormatted = lang === 'de' ? fValue(alpha,2,"").replace('.',',') : fValue(alpha,2,"");
        const softwareName = commonData.appName || "AvocadoSign Analyse Tool";
        const softwareVersion = commonData.appVersion || "";

        if (lang === 'de') {
            return `
                <p>Die deskriptive Statistik umfasste die Berechnung von Medianen, Mittelwerten, Standardabweichungen (SD), Minima und Maxima für kontinuierliche Variablen sowie absoluten und relativen Häufigkeiten für kategoriale Daten. Zur Beurteilung der diagnostischen Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets wurden Sensitivität, Spezifität, der positive (PPV) und negative prädiktive Wert (NPV), die Genauigkeit (Accuracy) und die Fläche unter der Receiver Operating Characteristic-Kurve (AUC) berechnet. Für binäre Tests wie das Avocado Sign oder fest definierte T2-Kriteriensets entspricht die AUC der Balanced Accuracy (Mittelwert aus Sensitivität und Spezifität). Für all diese Metriken wurden 95%-Konfidenzintervalle (KI) ermittelt; für Proportionen (Sensitivität, Spezifität, PPV, NPV, Accuracy) wurde das Wilson-Score-Intervall verwendet, während für AUC/Balanced Accuracy und den F1-Score die Bootstrap-Perzentil-Methode mit ${bootstrapN} Replikationen zur Anwendung kam.</p>
                <p>Der statistische Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe (gepaarte Daten) erfolgte mittels des McNemar-Tests für den Vergleich von Genauigkeiten und des DeLong-Tests für den Vergleich von AUC-Werten. Für Vergleiche der Performance zwischen unabhängigen Kollektiven (z.B. Direkt-OP vs. nRCT-Gruppe) wurden der exakte Test nach Fisher für die Accuracy und ein Z-Test für AUC-Unterschiede basierend auf den Bootstrap-Standardfehlern herangezogen. Assoziationen zwischen einzelnen Merkmalen und dem N-Status wurden mittels Fisher-Test (für kategoriale Merkmale) oder Mann-Whitney-U-Test (für kontinuierliche Merkmale wie Lymphknotengröße) sowie durch Berechnung von Odds Ratios (OR), Risk Differences (RD) und Phi-Koeffizienten (φ) untersucht. Ein p-Wert von < ${pValueFormatted} wurde als statistisch signifikant interpretiert. Alle Analysen wurden mit der oben genannten Webanwendung (${softwareName} v${softwareVersion}) durchgeführt, deren statistische Methoden in der Komponente <code>statisticsService.js</code> implementiert sind.</p>
            `;
        } else {
            return `
                <p>Descriptive statistics included the calculation of medians, means, standard deviations (SD), minima, and maxima for continuous variables, as well as absolute and relative frequencies for categorical data. To assess the diagnostic performance of the Avocado Sign and the various T2 criteria sets, sensitivity, specificity, positive (PPV) and negative predictive values (NPV), accuracy, and the area under the Receiver Operating Characteristic curve (AUC) were calculated. For binary tests such as the Avocado Sign or fixed T2 criteria sets, the AUC is equivalent to the Balanced Accuracy (the mean of sensitivity and specificity). For all these metrics, 95% confidence intervals (CI) were determined; the Wilson score interval was used for proportions (sensitivity, specificity, PPV, NPV, accuracy), while the bootstrap percentile method with ${bootstrapN} replications was applied for AUC/Balanced Accuracy and the F1-score.</p>
                <p>Statistical comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group (paired data) was performed using McNemar's test for comparing accuracies and DeLong's test for comparing AUC values. For comparisons of performance between independent cohorts (e.g., upfront surgery vs. nRCT group), Fisher's exact test was used for accuracy and a Z-test based on bootstrap standard errors was used for AUC differences. Associations between individual features and N-status were examined using Fisher's exact test (for categorical features) or the Mann-Whitney U test (for continuous features like lymph node size), as well as by calculating Odds Ratios (OR), Risk Differences (RD), and Phi coefficients (φ). A P-value < ${pValueFormatted} was considered statistically significant. All analyses were conducted using the aforementioned web application (${softwareName} v${softwareVersion}), with statistical methods implemented in its <code>statisticsService.js</code> component.</p>
            `;
        }
    }

    function getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const gesamtN = commonData.nGesamt || 'N/A';
        const direktOPN = commonData.nDirektOP || 'N/A';
        const nRCTN = commonData.nNRCT || 'N/A';
        const alterMedian = fValue(pCharGesamt?.alter?.median, 1, (lang === 'de' ? ' Jahre' : ' years'), 'N/A');
        const alterRange = `(${fValue(pCharGesamt?.alter?.min, 0, '', 'N/A')}–${fValue(pCharGesamt?.alter?.max, 0, '', 'N/A')})`;
        const maennlichProzent = fPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN, 0, 'N/A');
        const nMaennlich = pCharGesamt?.geschlecht?.m ?? 'N/A';
        const nPatientenGesamt = pCharGesamt?.anzahlPatienten || 'N/A';
        const nPlusProzentGesamt = fPercent(pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN, 0, 'N/A');
        const nPlusAbsolutGesamt = pCharGesamt?.nStatus?.plus ?? 'N/A';
        const currentKollektivForChart = commonData.currentKollektivName || (lang === 'de' ? 'ausgewählten' : 'selected');

        if (lang === 'de') {
            return `
                <p>Das Gesamtkollektiv umfasste ${gesamtN} Patienten, von denen ${direktOPN} primär operiert wurden (Direkt-OP-Gruppe) und ${nRCTN} eine neoadjuvante Radiochemotherapie (nRCT-Gruppe) erhielten. Das mediane Alter im Gesamtkollektiv betrug ${alterMedian} ${alterRange}. ${prozentMaennlich} (${nMaennlich}/${nPatientenGesamt}) der Patienten waren männlich. Ein histopathologisch gesicherter positiver Lymphknotenstatus (N+) lag bei ${nPlusProzentGesamt} (${nPlusAbsolutGesamt}/${nPatientenGesamt}) der Patienten des Gesamtkollektivs vor. Die detaillierten demographischen und klinischen Charakteristika der Patienten, stratifiziert nach Behandlungsgruppen (Gesamt, Direkt OP, nRCT), sind in Tabelle 1 dargestellt. Abbildung 1a und 1b zeigen die Alters- bzw. Geschlechterverteilung für das aktuell in der Anwendung global als [${currentKollektivForChart}] ausgewählte Kollektiv.</p>
            `;
        } else {
            return `
                <p>The overall cohort comprised ${gesamtN} patients, of whom ${direktOPN} underwent upfront surgery (upfront surgery group) and ${nRCTN} received neoadjuvant chemoradiotherapy (nRCT group). The median age in the overall cohort was ${alterMedian} ${alterRange}. ${prozentMaennlich} (${nMaennlich}/${nPatientenGesamt}) of patients were male. A histopathologically confirmed positive lymph node status (N+) was present in ${nPlusProzentGesamt} (${nPlusAbsolutGesamt}/${nPatientenGesamt}) of patients in the overall cohort. Detailed demographic and clinical characteristics, stratified by treatment group (Overall, Upfront Surgery, nRCT), are summarized in Table 1. Figure 1a and 1b show the age and gender distributions, respectively, for the cohort currently globally selected in the application as [${currentKollektivForChart}].</p>
            `;
        }
    }

    function getErgebnisseASPerformanceText(lang, allKollektivStats, commonData) {
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const asDirektOP = allKollektivStats?.['direkt OP']?.gueteAS;
        const asNRCT = allKollektivStats?.nRCT?.gueteAS;
        const nGesamt = allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 'N/A';
        const nDirektOP = allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const nNRCT = allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';


        if (lang === 'de') {
            return `
                <p>Die diagnostische Leistung des Avocado Signs (AS) zur Prädiktion des pathologischen N-Status ist für die verschiedenen Kollektive in Tabelle 3 zusammengefasst. Im Gesamtkollektiv (N=${nGesamt}) erreichte das AS eine Sensitivität von ${fCI(asGesamt?.sens, 1, true, 'de')}, eine Spezifität von ${fCI(asGesamt?.spez, 1, true, 'de')}, einen positiven prädiktiven Wert (PPV) von ${fCI(asGesamt?.ppv, 1, true, 'de')}, einen negativen prädiktiven Wert (NPV) von ${fCI(asGesamt?.npv, 1, true, 'de')} und eine Genauigkeit (Accuracy) von ${fCI(asGesamt?.acc, 1, true, 'de')}. Die Fläche unter der ROC-Kurve (AUC), äquivalent zur Balanced Accuracy, betrug ${fCI(asGesamt?.auc, 3, false, 'de')}.</p>
                <p>In der Subgruppe der primär operierten Patienten (Direkt-OP-Gruppe, N=${nDirektOP}) zeigte das AS eine Sensitivität von ${fCI(asDirektOP?.sens, 1, true, 'de')} und eine Spezifität von ${fCI(asDirektOP?.spez, 1, true, 'de')} (AUC ${fCI(asDirektOP?.auc, 3, false, 'de')}). Bei Patienten nach neoadjuvanter Radiochemotherapie (nRCT-Gruppe, N=${nNRCT}) betrug die Sensitivität ${fCI(asNRCT?.sens, 1, true, 'de')} und die Spezifität ${fCI(asNRCT?.spez, 1, true, 'de')} (AUC ${fCI(asNRCT?.auc, 3, false, 'de')}).</p>
            `;
        } else {
            return `
                <p>The diagnostic performance of the Avocado Sign (AS) for predicting pathological N-status across the different cohorts is summarized in Table 3. In the overall cohort (n=${nGesamt}), the AS achieved a sensitivity of ${fCI(asGesamt?.sens, 1, true, 'en')}, a specificity of ${fCI(asGesamt?.spez, 1, true, 'en')}, a positive predictive value (PPV) of ${fCI(asGesamt?.ppv, 1, true, 'en')}, a negative predictive value (NPV) of ${fCI(asGesamt?.npv, 1, true, 'en')}, and an accuracy of ${fCI(asGesamt?.acc, 1, true, 'en')}. The area under the ROC curve (AUC), equivalent to Balanced Accuracy, was ${fCI(asGesamt?.auc, 3, false, 'en')}.</p>
                <p>In the subgroup of patients undergoing upfront surgery (upfront surgery group, n=${nDirektOP}), the AS demonstrated a sensitivity of ${fCI(asDirektOP?.sens, 1, true, 'en')} and a specificity of ${fCI(asDirektOP?.spez, 1, true, 'en')} (AUC ${fCI(asDirektOP?.auc, 3, false, 'en')}). For patients after neoadjuvant chemoradiotherapy (nRCT group, n=${nNRCT}), the sensitivity was ${fCI(asNRCT?.sens, 1, true, 'en')} and the specificity was ${fCI(asNRCT?.spez, 1, true, 'en')} (AUC ${fCI(asNRCT?.auc, 3, false, 'en')}).</p>
            `;
        }
    }

    function getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData) {
        let text = '';
        const nGesamt = allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 'N/A';
        const nDirektOP = allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const nNRCT = allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';

        const kohDataGesamt = allKollektivStats?.Gesamt?.gueteT2_literatur?.['koh_2008_morphology'];
        const barbaroDataNRCT = allKollektivStats?.nRCT?.gueteT2_literatur?.['barbaro_2024_restaging'];
        const esgarDataDirektOP = allKollektivStats?.['direkt OP']?.gueteT2_literatur?.['rutegard_et_al_esgar'];

        if (lang === 'de') {
            text += `<p>Die diagnostische Leistung der etablierten Literatur-basierten T2-Kriteriensets wurde für die jeweils als primär anwendbar definierten Kollektive evaluiert (Details siehe Tabelle 4). `;
            if (kohDataGesamt) text += `Für das Kriterienset nach Koh et al. ${getReference('koh2008', commonData, 'de')} ergab sich im Gesamtkollektiv (N=${nGesamt}) eine AUC von ${fCI(kohDataGesamt?.auc, 3, false, 'de')}. `; else text += `Für Koh et al. im Gesamtkollektiv konnten keine validen Daten ermittelt werden. `;
            if (barbaroDataNRCT) text += `Die Kriterien nach Barbaro et al. ${getReference('barbaro2024', commonData, 'de')} zeigten im nRCT-Kollektiv (N=${nNRCT}) eine AUC von ${fCI(barbaroDataNRCT?.auc, 3, false, 'de')}. `; else text += `Für Barbaro et al. im nRCT-Kollektiv konnten keine validen Daten ermittelt werden. `;
            if (esgarDataDirektOP) text += `Die ESGAR 2016 Kriterien, evaluiert durch Rutegård et al. ${getReference('rutegard2025', commonData, 'de')}, erreichten im Direkt-OP-Kollektiv (N=${nDirektOP}) eine AUC von ${fCI(esgarDataDirektOP?.auc, 3, false, 'de')}. `; else text += `Für ESGAR/Rutegård et al. im Direkt-OP-Kollektiv konnten keine validen Daten ermittelt werden. `;
            text += `Detaillierte Metriken (Sensitivität, Spezifität etc.) für jedes dieser Sets und ihre primären Zielkollektive sind in Tabelle 4 aufgeführt.</p>`;
        } else {
            text += `<p>The diagnostic performance of established literature-based T2 criteria sets was evaluated for their respective primarily applicable cohorts (details in Table 4). `;
            if (kohDataGesamt) text += `For the criteria set according to Koh et al. ${getReference('koh2008', commonData, 'en')}, an AUC of ${fCI(kohDataGesamt?.auc, 3, false, 'en')} was observed in the overall cohort (n=${nGesamt}). `; else text += `For Koh et al. in the overall cohort, no valid data could be determined. `;
            if (barbaroDataNRCT) text += `The criteria by Barbaro et al. ${getReference('barbaro2024', commonData, 'en')} showed an AUC of ${fCI(barbaroDataNRCT?.auc, 3, false, 'en')} in the nRCT cohort (n=${nNRCT}). `; else text += `For Barbaro et al. in the nRCT cohort, no valid data could be determined. `;
            if (esgarDataDirektOP) text += `The ESGAR 2016 criteria, as evaluated by Rutegård et al. ${getReference('rutegard2025', commonData, 'en')}, achieved an AUC of ${fCI(esgarDataDirektOP?.auc, 3, false, 'en')} in the upfront surgery cohort (n=${nDirektOP}). `; else text += `For ESGAR/Rutegård et al. in the upfront surgery cohort, no valid data could be determined. `;
            text += `Detailed metrics (sensitivity, specificity, etc.) for each of these sets and their primary target cohorts are listed in Table 4.</p>`;
        }
        return text;
    }

    function getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData) {
        const bfOptimizedMetric = commonData.bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const formatBFResultTextForKollektiv = (kollektivId, kollektivDisplayName) => {
            const bfDef = allKollektivStats?.[kollektivId]?.bruteforce_definition;
            const bfStats = allKollektivStats?.[kollektivId]?.gueteT2_bruteforce;
            const nKollektiv = allKollektivStats?.[kollektivId]?.deskriptiv?.anzahlPatienten || 'N/A';

            if (bfDef && bfStats && typeof studyT2CriteriaManager !== 'undefined' && typeof studyT2CriteriaManager.formatCriteriaForDisplayStrict === 'function') {
                const criteriaDisplay = studyT2CriteriaManager.formatCriteriaForDisplayStrict(bfDef.criteria, bfDef.logic, false);
                const aucFormatted = fCI(bfStats.auc, 3, false, lang);
                const optimizedMetricValueFormatted = fValue(bfDef.metricValue, (bfDef.metricName === 'F1-Score' || bfDef.metricName === 'Balanced Accuracy' || bfDef.metricName === 'AUC') ? 3 : 1);

                if (bfDef.metricName === bfOptimizedMetric) {
                    return lang === 'de' ? `Für das ${kollektivDisplayName}-Kollektiv (N=${nKollektiv}) wurden mit den Kriterien "${criteriaDisplay}" eine AUC von ${aucFormatted} (optimierte ${bfDef.metricName}: ${optimizedMetricValueFormatted}) erreicht.`
                                          : `For the ${kollektivDisplayName} cohort (n=${nKollektiv}), the criteria "${criteriaDisplay}" achieved an AUC of ${aucFormatted} (optimized ${bfDef.metricName}: ${optimizedMetricValueFormatted}).`;
                } else {
                     return lang === 'de' ? `Für das ${kollektivDisplayName}-Kollektiv (N=${nKollektiv}) wurde die Optimierung primär für die Metrik '${bfDef.metricName}' (erreicht: ${optimizedMetricValueFormatted} mit Kriterien "${criteriaDisplay}") durchgeführt (Details siehe Tabelle 5), nicht für '${bfOptimizedMetric}'. Die AUC für diese spezifischen Kriterien betrug ${aucFormatted}.`
                                          : `For the ${kollektivDisplayName} cohort (n=${nKollektiv}), optimization was primarily performed for the metric '${bfDef.metricName}' (achieved: ${optimizedMetricValueFormatted} with criteria "${criteriaDisplay}") (see Table 5 for details), not for '${bfOptimizedMetric}'. The AUC for these specific criteria was ${aucFormatted}.`;
                }
            } else if (bfDef && bfDef.criteria) {
                return lang === 'de' ? `Formatierungsfunktion für Kriterien nicht verfügbar für ${kollektivDisplayName}-Kollektiv (N=${nKollektiv}).` : `Criteria formatting function not available for ${kollektivDisplayName} cohort (n=${nKollektiv}).`;
            }
            return lang === 'de' ? `Für das ${kollektivDisplayName}-Kollektiv (N=${nKollektiv}) konnten keine validen Optimierungsergebnisse für die Zielmetrik '${bfOptimizedMetric}' erzielt oder dargestellt werden.`
                                  : `For the ${kollektivDisplayName} cohort (n=${nKollektiv}), no valid optimization results for the target metric '${bfOptimizedMetric}' could be achieved or displayed.`;
        };
        const textGesamt = formatBFResultTextForKollektiv('Gesamt', lang === 'de' ? 'Gesamt' : 'Overall');
        const textDirektOP = formatBFResultTextForKollektiv('direkt OP', lang === 'de' ? 'Direkt-OP' : 'Upfront Surgery');
        const textNRCT = formatBFResultTextForKollektiv('nRCT', 'nRCT');

        if (lang === 'de') {
            return `
                <p>Mittels eines Brute-Force-Optimierungsalgorithmus wurden für jedes Kollektiv spezifische T2-Kriterienkombinationen identifiziert, welche die gewählte Zielmetrik "${bfOptimizedMetric}" maximieren. Die Ergebnisse dieser Optimierungen sind detailliert in Tabelle 5 dargestellt. ${textGesamt} ${textDirektOP} ${textNRCT}</p>
            `;
        } else {
            return `
                <p>Using a brute-force optimization algorithm, specific T2 criteria combinations that maximize the target metric "${bfOptimizedMetric}" were identified for each cohort. The results of these optimizations are detailed in Table 5. ${textGesamt} ${textDirektOP} ${textNRCT}</p>
            `;
        }
    }

    function getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData) {
        const bfOptimizedMetric = commonData.bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        let text = '';

        const generateComparisonSentence = (kollektivId, kollektivDisplayName) => {
            let sentences = [];
            const gueteAS = allKollektivStats?.[kollektivId]?.gueteAS;

            const literaturSetsToCompare = [];
            if (kollektivId === 'Gesamt') {
                literaturSetsToCompare.push({id: 'rutegard_et_al_esgar', name: getReference('rutegard2025', commonData, lang) + ' (ESGAR)'});
                literaturSetsToCompare.push({id: 'koh_2008_morphology', name: getReference('koh2008', commonData, lang)});
                literaturSetsToCompare.push({id: 'barbaro_2024_restaging', name: getReference('barbaro2024', commonData, lang)});
            } else if (kollektivId === 'direkt OP') {
                literaturSetsToCompare.push({id: 'rutegard_et_al_esgar', name: getReference('rutegard2025', commonData, lang) + ' (ESGAR)'});
            } else if (kollektivId === 'nRCT') {
                literaturSetsToCompare.push({id: 'barbaro_2024_restaging', name: getReference('barbaro2024', commonData, lang)});
            }

            literaturSetsToCompare.forEach(litSetConf => {
                const gueteT2_Lit = allKollektivStats?.[kollektivId]?.gueteT2_literatur?.[litSetConf.id];
                if (gueteAS && gueteT2_Lit) {
                    const aucAStext = fCI(gueteAS.auc, 3, false, lang);
                    const aucLitText = fCI(gueteT2_Lit.auc, 3, false, lang);
                    if (lang === 'de') {
                        sentences.push(`Im ${kollektivDisplayName}-Kollektiv betrug die AUC für das Avocado Sign ${aucAStext}, verglichen mit ${aucLitText} für die Kriterien nach ${litSetConf.name}.`);
                    } else {
                        sentences.push(`In the ${kollektivDisplayName} cohort, the AUC for the Avocado Sign was ${aucAStext}, compared to ${aucLitText} for the criteria by ${litSetConf.name}.`);
                    }
                }
            });

            const bfDef = allKollektivStats?.[kollektivId]?.bruteforce_definition;
            const gueteT2_BF = allKollektivStats?.[kollektivId]?.gueteT2_bruteforce;
            const vergleichASvsBF = allKollektivStats?.[kollektivId]?.vergleichASvsT2_bruteforce;

            if (gueteAS && gueteT2_BF && vergleichASvsBF && bfDef && bfDef.metricName === bfOptimizedMetric && typeof studyT2CriteriaManager !== 'undefined' && typeof studyT2CriteriaManager.formatCriteriaForDisplayStrict === 'function') {
                const pMcNemarBF = vergleichASvsBF?.mcnemar?.pValue;
                const pDeLongBF = vergleichASvsBF?.delong?.pValue;
                const bfKriterienDesc = studyT2CriteriaManager.formatCriteriaForDisplayStrict(bfDef.criteria, bfDef.logic, true);
                const aucAStext = fCI(gueteAS.auc, 3, false, lang);
                const aucBFtext = fCI(gueteT2_BF.auc, 3, false, lang);

                if (lang === 'de') {
                    sentences.push(`Der Vergleich des Avocado Signs (AUC ${aucAStext}) mit den für "${bfOptimizedMetric}" optimierten T2-Kriterien (AUC ${aucBFtext}; Kriterien: ${bfKriterienDesc}) im ${kollektivDisplayName}-Kollektiv ergab für die Accuracy einen p-Wert von ${getPValueText(pMcNemarBF, 'de', true)} und für die AUC einen p-Wert von ${getPValueText(pDeLongBF, 'de', true)}.`);
                } else {
                    sentences.push(`Comparing the Avocado Sign (AUC ${aucAStext}) with the T2 criteria optimized for "${bfOptimizedMetric}" (AUC ${aucBFtext}; criteria: ${bfKriterienDesc}) in the ${kollektivDisplayName} cohort, the p-value for accuracy was ${getPValueText(pMcNemarBF, 'en', true)} and for AUC was ${getPValueText(pDeLongBF, 'en', true)}.`);
                }
            }
            return sentences.join(' ');
        };

        const textGesamt = generateComparisonSentence('Gesamt', lang === 'de' ? 'Gesamt' : 'Overall');
        const textDirektOP = generateComparisonSentence('direkt OP', lang === 'de' ? 'Direkt-OP' : 'Upfront Surgery');
        const textNRCT = generateComparisonSentence('nRCT', 'nRCT');

        const tableRef = lang === 'de' ? "Tabelle 6" : "Table 6";
        const figRef = lang === 'de' ? "Abbildung 3" : "Figure 3";


        if (lang === 'de') {
            text = `
                <p>Der direkte statistische Vergleich der diagnostischen Leistung zwischen dem Avocado Sign und den verschiedenen T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) wurde für die drei Hauptkollektive durchgeführt. ${textGesamt} ${textDirektOP} ${textNRCT} Detaillierte Gegenüberstellungen der Performancemetriken und p-Werte finden sich in ${tableRef}. ${figRef} illustriert beispielhaft ausgewählte Performancemetriken für das aktuell in der Anwendung global gewählte Kollektiv (${commonData.currentKollektivName}).</p>
            `;
        } else {
             text = `
                <p>The direct statistical comparison of diagnostic performance between the Avocado Sign and various T2 criteria sets (literature-based and brute-force optimized) was performed for the three main cohorts. ${textGesamt} ${textDirektOP} ${textNRCT} Detailed comparisons of performance metrics and p-values are summarized in ${tableRef}. ${figRef} exemplarily illustrates selected performance metrics for the cohort currently globally selected in the application (${commonData.currentKollektivName}).</p>
            `;
        }
        return text;
    }

    function getSectionText(sectionId, lang, allKollektivStats, commonData) {
        if (!allKollektivStats && (sectionId.startsWith('ergebnisse') || sectionId === 'methoden_t2_definition' || sectionId === 'methoden_patientenkollektiv')) {
             return `<p class="text-danger">${lang === 'de' ? 'Fehler: Statistische Grunddaten nicht verfügbar, um diesen Abschnitt zu generieren.' : 'Error: Basic statistical data not available to generate this section.'}</p>`;
        }
        if (!commonData && sectionId !== 'methoden_referenzstandard') {
             return `<p class="text-danger">${lang === 'de' ? 'Fehler: Allgemeine Konfigurationsdaten nicht verfügbar.' : 'Error: General configuration data not available.'}</p>`;
        }


        switch (sectionId) {
            case 'methoden_studienanlage': return getMethodenStudienanlageText(lang, allKollektivStats, commonData);
            case 'methoden_patientenkollektiv': return getMethodenPatientenkollektivText(lang, allKollektivStats, commonData);
            case 'methoden_mrt_protokoll': return getMethodenMRTProtokollText(lang, allKollektivStats, commonData);
            case 'methoden_as_definition': return getMethodenASDefinitionText(lang, allKollektivStats, commonData);
            case 'methoden_t2_definition': return getMethodenT2DefinitionText(lang, allKollektivStats, commonData);
            case 'methoden_referenzstandard': return getMethodenReferenzstandardText(lang, allKollektivStats, commonData);
            case 'methoden_statistische_analyse': return getMethodenStatistischeAnalyseText(lang, allKollektivStats, commonData);
            case 'ergebnisse_patientencharakteristika': return getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData);
            case 'ergebnisse_as_performance': return getErgebnisseASPerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_literatur_t2_performance': return getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_optimierte_t2_performance': return getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_vergleich_performance': return getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData);
            default: return `<p class="text-warning">Text für Sektion '${sectionId}' (Sprache: ${lang}) noch nicht implementiert.</p>`;
        }
    }

    function getSectionTextAsMarkdown(sectionId, lang, allKollektivStats, commonData) {
        const htmlContent = getSectionText(sectionId, lang, allKollektivStats, commonData);
        let markdown = htmlContent
            .replace(/<p>/g, '')
            .replace(/<\/p>/g, '\n\n')
            .replace(/<strong>/g, '**')
            .replace(/<\/strong>/g, '**')
            .replace(/<em>/g, '*')
            .replace(/<\/em>/g, '*')
            .replace(/<i>/g, '*')
            .replace(/<\/i>/g, '*')
            .replace(/<code>/g, '`')
            .replace(/<\/code>/g, '`')
            .replace(/<ul>/g, '')
            .replace(/<\/ul>/g, '')
            .replace(/<ol>/g, '')
            .replace(/<\/ol>/g, '')
            .replace(/<li>/g, '* ')
            .replace(/<\/li>/g, '\n')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, (match, p1) => {
                const level = parseInt(match.charAt(2));
                return `${'#'.repeat(level)} ${p1}\n\n`;
            })
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/\n\s*\n+/g, '\n\n')
            .trim();
        return markdown;
    }

    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown
    });

})();
