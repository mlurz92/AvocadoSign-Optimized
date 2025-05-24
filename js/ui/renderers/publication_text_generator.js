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

    function fCI(metric, digits = 1, isPercent = true, lang = 'de', placeholderValue = 'N/A', placeholderCI = 'N/A') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return placeholderValue;
        const valStr = isPercent ? fPercent(metric.value, digits, placeholderValue) : fValue(metric.value, digits, '', placeholderValue);
        if (valStr === placeholderValue) return valStr; // If value itself is placeholder, don't add CI

        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper) && isFinite(metric.ci.lower) && isFinite(metric.ci.upper)) {
            const lowerStr = isPercent ? fPercent(metric.ci.lower, digits, '') : fValue(metric.ci.lower, digits, '', '');
            const upperStr = isPercent ? fPercent(metric.ci.upper, digits, '') : fValue(metric.ci.upper, digits, '', '');
            if (lowerStr === '' || upperStr === '') return valStr; // If CI parts are empty, just return value
            const ciText = lang === 'de' ? '95% KI' : '95% CI';
            return `${valStr} (${ciText}: ${lowerStr}–${upperStr})`;
        }
        return valStr;
    }

    function getPValueText(pValue, lang = 'de', includeEquals = true) {
        if (pValue === null || pValue === undefined || isNaN(pValue)) return lang === 'de' ? 'p = n.a.' : 'P = N/A';
        if (pValue < 0.001) return lang === 'de' ? 'p < 0,001' : 'P < .001';
        const pString = fValue(pValue, 3, '', 'n.a.');
        if (pString === 'n.a.') return lang === 'de' ? 'p = n.a.' : 'P = N/A';
        return `${lang === 'de' ? 'p' : 'P'} ${includeEquals ? '= ' : ''}${pString.replace('.', lang === 'de' ? ',' : '.')}`;
    }

    function getKollektivText(kollektivId, n, lang = 'de') {
        const name = getKollektivDisplayName(kollektivId);
        const nText = lang === 'de' ? `(N=${n})` : `(n=${n})`;
        return `${name} ${nText}`;
    }

    function getReference(key, commonData, lang = 'de') {
        const ref = commonData.references[key];
        if (!ref) return "";
        // Simple approach, actual citation management would be more complex
        const splitRef = ref.split(" ");
        const yearMatch = ref.match(/\b(19|20)\d{2}\b/);
        const year = yearMatch ? yearMatch[0] : "";
        if (lang === 'de') {
            return `${splitRef[0]} et al. (${year})`;
        } else {
            return `${splitRef[0]} et al. (${year})`;
        }
    }

    function getMethodenStudienanlageText(lang, publicationData, commonData) {
        const appVersion = commonData.appVersion || APP_CONFIG.APP_VERSION;
        const lurzSchaeferRef = getReference('lurzSchaefer2025', commonData, lang);
        const ethicsVote = "123/20-ek"; // Placeholder, as this is not in commonData
        const clinicName = "Klinikum St. Georg, Leipzig"; // Placeholder

        if (lang === 'de') {
            return `
                <p>Die vorliegende Untersuchung wurde als retrospektive Analyse prospektiv und systematisch erhobener Daten eines monozentrischen Patientenkollektivs mit histologisch gesichertem Rektumkarzinom konzipiert, welches bereits Grundlage der initialen "Avocado Sign" Studie war ${lurzSchaeferRef}. Primäres Ziel war der Vergleich der diagnostischen Güte des bildmorphologischen Avocado Signs mit etablierten sowie mittels Brute-Force-Algorithmus optimierten T2-gewichteten Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status).</p>
                <p>Alle Patienten wurden zwischen Januar 2020 und November 2023 am ${clinicName} behandelt. Die Studie wurde in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki (revidierte Fassung 2013) durchgeführt und von der lokalen Ethikkommission genehmigt (Ethikvotum Nr. ${ethicsVote}). Aufgrund des retrospektiven Charakters der Analyse und der Verwendung anonymisierter Daten wurde auf ein erneutes Einverständnis der Patienten verzichtet; ein generelles Einverständnis zur wissenschaftlichen Nutzung der Daten lag für alle Patienten vor.</p>
                <p>Sämtliche Datenanalysen, statistischen Berechnungen und die Erstellung von Abbildungen erfolgten unter Verwendung einer speziell für diese Untersuchung entwickelten, interaktiven Webanwendung (AvocadoSign Analyse Tool v${appVersion}, Eigenentwicklung auf Basis von JavaScript, HTML5 und CSS3). Diese ermöglicht die flexible Definition und Anwendung von T2-Kriteriensets, die automatisierte Optimierung von Kriterienkombinationen sowie die umfassende statistische Auswertung und Visualisierung der Ergebnisse.</p>
            `;
        } else {
            return `
                <p>The present study was designed as a retrospective analysis of prospectively and systematically collected data from a single-center patient cohort with histologically confirmed rectal cancer, which also formed the basis of the initial "Avocado Sign" study ${lurzSchaeferRef}. The primary objective was to compare the diagnostic performance of the Avocado Sign imaging marker with established and brute-force algorithm-optimized T2-weighted criteria for predicting mesorectal lymph node status (N-status).</p>
                <p>All patients were treated at the ${clinicName} between January 2020 and November 2023. The study was conducted in accordance with the principles of the Declaration of Helsinki (revised 2013 version) and was approved by the local ethics committee (Ethics Vote No. ${ethicsVote}). Due to the retrospective nature of the analysis and the use of anonymized data, renewed patient consent was waived; general consent for the scientific use of data was available for all patients.</p>
                <p>All data analyses, statistical calculations, and figure generation were performed using a custom-developed interactive web application (AvocadoSign Analysis Tool v${appVersion}, in-house development based on JavaScript, HTML5, and CSS3). This tool allows for flexible definition and application of T2 criteria sets, automated optimization of criteria combinations, and comprehensive statistical evaluation and visualization of results.</p>
            `;
        }
    }

    function getMethodenPatientenkollektivText(lang, publicationData, commonData) {
        const pCharGesamt = publicationData?.Gesamt?.deskriptiv;
        const nGesamt = commonData.nGesamt || 'N/A';
        const nNRCT = commonData.nNRCT || 'N/A';
        const nDirektOP = commonData.nDirektOP || 'N/A';
        const alterMedian = fValue(pCharGesamt?.alter?.median, 1, '', 'N/A');
        const alterMin = fValue(pCharGesamt?.alter?.min, 0, '', 'N/A');
        const alterMax = fValue(pCharGesamt?.alter?.max, 0, '', 'N/A');
        const prozentMaennlich = fPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN, 0, 'N/A');
        const nMaennlich = pCharGesamt?.geschlecht?.m || 0;
        const nPatientenGesamt = pCharGesamt?.anzahlPatienten || 0;
        const clinicName = "Klinikum St. Georg, Leipzig"; // Placeholder

        if (lang === 'de') {
            return `
                <p>In die Analyse wurde dasselbe monozentrische Kollektiv von ${nGesamt} konsekutiven Patienten mit histologisch gesichertem Rektumkarzinom eingeschlossen, das bereits für die ursprüngliche Avocado-Sign-Studie herangezogen wurde. Die Patienten wurden zwischen Januar 2020 und November 2023 am ${clinicName} behandelt. Von diesen erhielten ${nNRCT} Patienten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während ${nDirektOP} Patienten einer primären Operation zugeführt wurden (Direkt-OP-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${alterMedian} Jahre (Spannweite: ${alterMin}–${alterMax} Jahre). Der Anteil männlicher Patienten lag bei ${prozentMaennlich} (${nMaennlich}/${nPatientenGesamt}). Detaillierte demographische und klinische Charakteristika des Gesamtkollektivs sowie der Subgruppen sind in Tabelle 1 zusammengefasst.</p>
                <p>Die Einschlusskriterien umfassten ein Mindestalter von 18 Jahren und ein durch Biopsie bestätigtes Adenokarzinom des Rektums. Ausschlusskriterien waren das Vorliegen Fernmetastasen zum Zeitpunkt der Diagnosestellung (M1-Status), nicht-resektable Tumoren, Kontraindikationen für eine MRT-Untersuchung (z.B. nicht-MRT-taugliche Implantate, schwere Klaustrophobie) oder eine vorherige operative oder strahlentherapeutische Behandlung des Beckens aus anderer Ursache.</p>
            `;
        } else {
            return `
                <p>The same single-center cohort of ${nGesamt} consecutive patients with histologically confirmed rectal cancer, previously utilized for the original Avocado Sign study, was included in this analysis. Patients were treated at the ${clinicName} between January 2020 and November 2023. Of these, ${nNRCT} patients received neoadjuvant chemoradiotherapy (nRCT group), while ${nDirektOP} patients underwent primary surgery (upfront surgery group). The median age in the overall cohort was ${alterMedian} years (range: ${alterMin}–${alterMax} years). The proportion of male patients was ${prozentMaennlich} (${nMaennlich}/${nPatientenGesamt}). Detailed demographic and clinical characteristics of the overall cohort and subgroups are summarized in Table 1.</p>
                <p>Inclusion criteria comprised a minimum age of 18 years and biopsy-proven adenocarcinoma of the rectum. Exclusion criteria were the presence of distant metastases at diagnosis (M1 status), unresectable tumors, contraindications to MRI examination (e.g., non-MRI-compatible implants, severe claustrophobia), or prior pelvic surgery or radiotherapy for other reasons.</p>
            `;
        }
    }

    function getMethodenMRTProtokollText(lang, commonData) {
         if (lang === 'de') {
            return `
                <p>Alle MRT-Untersuchungen des Beckens wurden an einem 3,0-Tesla-System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Deutschland) unter Verwendung einer Kombination aus Körper-Phased-Array- und Wirbelsäulen-Array-Spulen durchgeführt. Das standardisierte Bildgebungsprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Orientierung sowie eine axiale diffusionsgewichtete Sequenz (DWI) mit b-Werten von 50, 400 und 800 s/mm². Für die Beurteilung des Avocado Signs wurde obligat eine kontrastmittelverstärkte, fettgesättigte, T1-gewichtete 3D-Gradientenecho-Sequenz (z.B. VIBE – Volumetric Interpolated Breath-hold Examination, oder vergleichbar) in axialer Schichtführung akquiriert. Die genauen Sequenzparameter sind in der Originalpublikation des Avocado Signs detailliert aufgeführt ${getReference('lurzSchaefer2025', commonData, lang)}.</p>
                <p>Als Kontrastmittel wurde Gadoteridol (ProHance®; Bracco Imaging, Mailand, Italien) in einer Standarddosis von 0,1 mmol/kg Körpergewicht intravenös appliziert, gefolgt von einer Spülung mit 20 ml Kochsalzlösung. Die kontrastmittelverstärkten T1-gewichteten Aufnahmen erfolgten in der portalvenösen Phase, typischerweise ca. 70–90 Sekunden nach Beginn der Kontrastmittelinjektion. Zur Reduktion von Darmperistaltik-bedingten Bewegungsartefakten wurde zu Beginn der Untersuchung sowie bei Bedarf erneut während der Untersuchung Butylscopolamin (20 mg i.v.) verabreicht, sofern keine Kontraindikationen bestanden. Das Bildgebungsprotokoll war für die primäre Staging-Untersuchung und die Restaging-Untersuchung nach neoadjuvanter Therapie identisch.</p>
            `;
        } else {
            return `
                <p>All pelvic MRI examinations were performed on a 3.0-Tesla system (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Germany) using a combination of body phased-array and spine array coils. The standardized imaging protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal orientations, as well as an axial diffusion-weighted imaging (DWI) sequence with b-values of 50, 400, and 800 s/mm². For the assessment of the Avocado Sign, a contrast-enhanced, fat-saturated, T1-weighted 3D gradient-echo sequence (e.g., VIBE – Volumetric Interpolated Breath-hold Examination, or equivalent) was mandatory and acquired in the axial plane. Detailed sequence parameters are listed in the original Avocado Sign publication ${getReference('lurzSchaefer2025', commonData, lang)}.</p>
                <p>Gadoteridol (ProHance®; Bracco Imaging, Milan, Italy) was administered intravenously as a contrast agent at a standard dose of 0.1 mmol/kg body weight, followed by a 20 mL saline flush. Contrast-enhanced T1-weighted images were acquired in the portal venous phase, typically approximately 70–90 seconds after the start of contrast injection. To reduce motion artifacts due to bowel peristalsis, butylscopolamine (20 mg i.v.) was administered at the beginning of the examination and again during the examination if needed, provided no contraindications existed. The imaging protocol was identical for primary staging and restaging examinations after neoadjuvant therapy.</p>
            `;
        }
    }

    function getMethodenASDefinitionText(lang, commonData) {
        const lurzSchaeferRef = getReference('lurzSchaefer2025', commonData, lang);
        if (lang === 'de') {
            return `
                <p>Das Avocado Sign (AS) wurde auf den kontrastmittelverstärkten, fettgesättigten T1-gewichteten Bildern definiert als ein zentraler, signalarmer (hypointenser) Kern innerhalb eines ansonsten homogen signalreichen (hyperintensen), ovalären oder runden Lymphknotens im Mesorektum. Die Bewertung erfolgte unabhängig von der Größe oder der exakten Form des Lymphknotens, solange dieser als distinkte nodale Struktur identifizierbar war. Alle sichtbaren mesorektalen Lymphknoten wurden auf das Vorhandensein des AS beurteilt. Ein Patient wurde als AS-positiv (AS+) klassifiziert, wenn mindestens ein Lymphknoten im Mesorektum das AS zeigte. Fehlte das Zeichen in allen beurteilbaren mesorektalen Lymphknoten, wurde der Patient als AS-negativ (AS-) eingestuft.</p>
                <p>Die Bildanalyse und Bewertung des Avocado Signs erfolgte, wie in der Originalstudie ${lurzSchaeferRef} beschrieben, durch zwei geblindete, erfahrene Radiologen (ML: 7 Jahre Erfahrung Abdominalradiologie; AOS: 29 Jahre Erfahrung Abdominalradiologie) im Konsens. Bei initial diskrepanten Fällen wurde ein Konsensus durch gemeinsame erneute Beurteilung erzielt.</p>
            `;
        } else {
            return `
                <p>The Avocado Sign (AS) was defined on contrast-enhanced, fat-saturated T1-weighted images as a central, low-signal-intensity (hypointense) core within an otherwise homogeneously high-signal-intensity (hyperintense), oval or round lymph node in the mesorectum. The assessment was performed irrespective of the size or exact shape of the lymph node, as long as it was identifiable as a distinct nodal structure. All visible mesorectal lymph nodes were evaluated for the presence of the AS. A patient was classified as AS-positive (AS+) if at least one mesorectal lymph node exhibited the AS. If the sign was absent in all assessable mesorectal lymph nodes, the patient was classified as AS-negative (AS-).</p>
                <p>Image analysis and assessment of the Avocado Sign were performed in consensus by two blinded, experienced radiologists (ML: 7 years of experience in abdominal radiology; AOS: 29 years of experience in abdominal radiology), as described in the original study ${lurzSchaeferRef}. In initially discrepant cases, consensus was reached through joint re-evaluation.</p>
            `;
        }
    }

    function getMethodenT2DefinitionText(lang, commonData, publicationData, allKollektivStats) {
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria ? t2CriteriaManager.getAppliedCriteria() : getDefaultT2Criteria();
        const appliedLogic = t2CriteriaManager.getAppliedLogic ? t2CriteriaManager.getAppliedLogic() : APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
        const formattedAppliedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false);
        const bfOptimizedMetric = commonData.bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const getOptimizedCriteriaText = (kollektivId) => {
            const bfData = allKollektivStats?.[kollektivId]?.bruteforce_definition;
            if (bfData && bfData.criteria && bfData.metricName === bfOptimizedMetric) {
                const criteriaText = studyT2CriteriaManager.formatCriteriaForDisplay(bfData.criteria, bfData.logic, false);
                return `${criteriaText} (erreichte ${bfData.metricName}: ${fValue(bfData.metricValue, 4)})`;
            } else if (bfData && bfData.criteria && bfData.metricName !== bfOptimizedMetric) {
                 return lang === 'de' ? `Optimierung für '${bfOptimizedMetric}' nicht verfügbar (Ergebnis für '${bfData.metricName}' vorhanden)` : `Optimization for '${bfOptimizedMetric}' not available (result for '${bfData.metricName}' present)`;
            }
            return lang === 'de' ? `Keine validen Optimierungsergebnisse für '${bfOptimizedMetric}' in diesem Kollektiv.` : `No valid optimization results for '${bfOptimizedMetric}' in this cohort.`;
        };

        const kohRef = getReference('koh2008', commonData, lang);
        const barbaroRef = getReference('barbaro2024', commonData, lang);
        const rutegardRef = getReference('rutegard2025', commonData, lang);
        const esgarRef = getReference('beetsTan2018ESGAR', commonData, lang);

        const kohCriteriaSet = studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology');
        const barbaroCriteriaSet = studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging');
        const esgarCriteriaSet = studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar');

        const kohDesc = kohCriteriaSet ? studyT2CriteriaManager.formatCriteriaForDisplay(kohCriteriaSet.criteria, kohCriteriaSet.logic, false) : 'N/A';
        const barbaroDesc = barbaroCriteriaSet ? studyT2CriteriaManager.formatCriteriaForDisplay(barbaroCriteriaSet.criteria, barbaroCriteriaSet.logic, false) : 'N/A';
        const esgarDesc = esgarCriteriaSet ? esgarCriteriaSet.description : 'N/A';


        if (lang === 'de') {
            return `
                <p>Die morphologische Beurteilung der mesorektalen Lymphknoten auf Basis der T2-gewichteten MRT-Sequenzen erfolgte unter Anwendung verschiedener Kriteriensets:</p>
                <ol>
                    <li><strong>Benutzerdefinierte T2-Kriterien (im Tool angewandt):</strong> Dieses Set entspricht den aktuell in der Analyseanwendung konfigurierten und für die Hauptauswertungen verwendeten T2-Kriterien. Die derzeitige Einstellung umfasst: ${formattedAppliedCriteria}. Diese Kriterien wurden auf alle drei Kollektive (Gesamt, Direkt OP, nRCT) angewendet.</li>
                    <li><strong>Literatur-basierte T2-Kriteriensets:</strong>
                        <ul>
                            <li><strong>Koh et al. ${kohRef}:</strong> Definiert als ${kohDesc}. Dieses Kriterienset wurde in der vorliegenden Analyse primär auf das Gesamtkollektiv angewendet.</li>
                            <li><strong>Barbaro et al. ${barbaroRef}:</strong> Definiert als ${barbaroDesc}. Dieses Kriterienset, ursprünglich für das Restaging nach nRCT entwickelt, wurde in der vorliegenden Analyse primär auf die nRCT-Subgruppe angewendet.</li>
                            <li><strong>ESGAR Konsensus Kriterien 2016 (evaluiert durch Rutegård et al. ${rutegardRef}, basierend auf ${esgarRef}):</strong> Definiert als ${esgarDesc}. Dieses komplexe, größenabhängige Kriterienset wurde in der vorliegenden Analyse primär auf die Direkt-OP-Subgruppe (Primärstaging) angewendet.</li>
                        </ul>
                        Eine detaillierte Aufschlüsselung dieser Literatur-Kriterien ist in Tabelle 2 dargestellt.
                    </li>
                    <li><strong>Brute-Force optimierte T2-Kriterien:</strong> Für jedes der drei Patientenkollektive (Gesamt, Direkt OP, nRCT) wurden mittels eines integrierten Brute-Force-Algorithmus diejenigen T2-Kriterienkombinationen (aus Kurzachsendurchmesser, Form, Kontur, Homogenität und Signalintensität, verknüpft durch UND- oder ODER-Logik) identifiziert, welche die Zielmetrik "${bfOptimizedMetric}" im Vergleich zum pathologischen N-Status maximieren. Die resultierenden, spezifisch für jedes Kollektiv optimierten Kriterien sind:
                        <ul>
                            <li>Gesamtkollektiv: ${getOptimizedCriteriaText('Gesamt')}</li>
                            <li>Direkt-OP-Gruppe: ${getOptimizedCriteriaText('direkt OP')}</li>
                            <li>nRCT-Gruppe: ${getOptimizedCriteriaText('nRCT')}</li>
                        </ul>
                    </li>
                </ol>
                <p>Für alle T2-Kriteriensets galt ein Patient als T2-positiv, wenn mindestens ein mesorektaler Lymphknoten die jeweiligen Kriterien für Malignität erfüllte. Die Bildbeurteilung der T2-Merkmale erfolgte ebenfalls durch die oben genannten Radiologen im Konsens und geblindet gegenüber dem Avocado Sign Befund sowie dem histopathologischen Ergebnis.</p>
            `;
        } else {
            return `
                <p>Morphological assessment of mesorectal lymph nodes based on T2-weighted MRI sequences was performed using various criteria sets:</p>
                <ol>
                    <li><strong>User-defined T2 criteria (applied in-tool):</strong> This set corresponds to the T2 criteria currently configured in the analysis application and used for the main evaluations. The current setting includes: ${formattedAppliedCriteria}. These criteria were applied to all three cohorts (Overall, Upfront Surgery, nRCT).</li>
                    <li><strong>Literature-based T2 criteria sets:</strong>
                        <ul>
                            <li><strong>Koh et al. ${kohRef}:</strong> Defined as ${kohDesc}. In the present analysis, this criteria set was primarily applied to the overall cohort.</li>
                            <li><strong>Barbaro et al. ${barbaroRef}:</strong> Defined as ${barbaroDesc}. This criteria set, originally developed for restaging after nRCT, was primarily applied to the nRCT subgroup in this analysis.</li>
                            <li><strong>ESGAR Consensus Criteria 2016 (evaluated by Rutegård et al. ${rutegardRef}, based on ${esgarRef}):</strong> Defined as ${esgarDesc}. This complex, size-dependent criteria set was primarily applied to the upfront surgery subgroup (primary staging) in this analysis.</li>
                        </ul>
                        A detailed breakdown of these literature-based criteria is presented in Table 2.
                    </li>
                    <li><strong>Brute-force optimized T2 criteria:</strong> For each of the three patient cohorts (Overall, Upfront Surgery, nRCT), T2 criteria combinations (from short-axis diameter, shape, border, homogeneity, and signal intensity, linked by AND or OR logic) that maximize the target metric "${bfOptimizedMetric}" compared to pathological N-status were identified using an integrated brute-force algorithm. The resulting criteria, specifically optimized for each cohort, are:
                        <ul>
                            <li>Overall cohort: ${getOptimizedCriteriaText('Gesamt')}</li>
                            <li>Upfront surgery group: ${getOptimizedCriteriaText('direkt OP')}</li>
                            <li>nRCT group: ${getOptimizedCriteriaText('nRCT')}</li>
                        </ul>
                    </li>
                </ol>
                <p>For all T2 criteria sets, a patient was considered T2-positive if at least one mesorectal lymph node met the respective criteria for malignancy. Image assessment of T2 features was also performed in consensus by the aforementioned radiologists, blinded to the Avocado Sign findings and histopathological results.</p>
            `;
        }
    }

    function getMethodenReferenzstandardText(lang, commonData) {
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

    function getMethodenStatistischeAnalyseText(lang, commonData) {
        const alpha = commonData.significanceLevel || 0.05;
        const bootstrapN = commonData.bootstrapReplications || 1000;
        if (lang === 'de') {
            return `
                <p>Die deskriptive Statistik umfasste die Berechnung von Medianen, Mittelwerten, Standardabweichungen (SD), Minima und Maxima für kontinuierliche Variablen sowie absoluten und relativen Häufigkeiten für kategoriale Daten. Zur Beurteilung der diagnostischen Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets wurden Sensitivität, Spezifität, der positive (PPV) und negative prädiktive Wert (NPV), die Genauigkeit (Accuracy) und die Fläche unter der Receiver Operating Characteristic-Kurve (AUC) berechnet. Für binäre Tests wie das Avocado Sign oder fest definierte T2-Kriteriensets entspricht die AUC der Balanced Accuracy (Mittelwert aus Sensitivität und Spezifität). Für all diese Metriken wurden 95%-Konfidenzintervalle (KI) ermittelt; für Proportionen (Sensitivität, Spezifität, PPV, NPV, Accuracy) wurde das Wilson-Score-Intervall verwendet, während für AUC/Balanced Accuracy und den F1-Score die Bootstrap-Perzentil-Methode mit ${bootstrapN} Replikationen zur Anwendung kam.</p>
                <p>Der statistische Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe (gepaarte Daten) erfolgte mittels des McNemar-Tests für den Vergleich von Genauigkeiten und des DeLong-Tests für den Vergleich von AUC-Werten. Für Vergleiche der Performance zwischen unabhängigen Kollektiven (z.B. Direkt-OP vs. nRCT-Gruppe) wurden der exakte Test nach Fisher für die Accuracy und ein Z-Test für AUC-Unterschiede basierend auf den Bootstrap-Standardfehlern herangezogen. Assoziationen zwischen einzelnen Merkmalen und dem N-Status wurden mittels Fisher-Test (für kategoriale Merkmale) oder Mann-Whitney-U-Test (für kontinuierliche Merkmale wie Lymphknotengröße) sowie durch Berechnung von Odds Ratios (OR), Risk Differences (RD) und Phi-Koeffizienten (φ) untersucht. Ein p-Wert von < ${fValue(alpha,2,"").replace('.',',')} wurde als statistisch signifikant interpretiert. Alle Analysen wurden mit der oben genannten Webanwendung (AvocadoSign Analyse Tool v${commonData.appVersion}) durchgeführt.</p>
            `;
        } else {
            return `
                <p>Descriptive statistics included the calculation of medians, means, standard deviations (SD), minima, and maxima for continuous variables, as well as absolute and relative frequencies for categorical data. To assess the diagnostic performance of the Avocado Sign and the various T2 criteria sets, sensitivity, specificity, positive (PPV) and negative predictive values (NPV), accuracy, and the area under the Receiver Operating Characteristic curve (AUC) were calculated. For binary tests such as the Avocado Sign or fixed T2 criteria sets, the AUC is equivalent to the Balanced Accuracy (the mean of sensitivity and specificity). For all these metrics, 95% confidence intervals (CI) were determined; the Wilson score interval was used for proportions (sensitivity, specificity, PPV, NPV, accuracy), while the bootstrap percentile method with ${bootstrapN} replications was applied for AUC/Balanced Accuracy and the F1-score.</p>
                <p>Statistical comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group (paired data) was performed using McNemar's test for comparing accuracies and DeLong's test for comparing AUC values. For comparisons of performance between independent cohorts (e.g., upfront surgery vs. nRCT group), Fisher's exact test was used for accuracy and a Z-test based on bootstrap standard errors was used for AUC differences. Associations between individual features and N-status were examined using Fisher's exact test (for categorical features) or the Mann-Whitney U test (for continuous features like lymph node size), as well as by calculating Odds Ratios (OR), Risk Differences (RD), and Phi coefficients (φ). A P-value < ${fValue(alpha,2,"")} was considered statistically significant. All analyses were conducted using the aforementioned web application (AvocadoSign Analysis Tool v${commonData.appVersion}).</p>
            `;
        }
    }

    function getErgebnissePatientencharakteristikaText(lang, publicationData, commonData) {
        const pCharGesamt = publicationData?.Gesamt?.deskriptiv;
        const gesamtN = commonData.nGesamt || 'N/A';
        const direktOPN = commonData.nDirektOP || 'N/A';
        const nRCTN = commonData.nNRCT || 'N/A';
        const alterMedian = fValue(pCharGesamt?.alter?.median, 1, ' Jahre', 'N/A');
        const alterRange = `(${fValue(pCharGesamt?.alter?.min, 0, '', 'N/A')}–${fValue(pCharGesamt?.alter?.max, 0, '', 'N/A')})`;
        const maennlichProzent = fPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN, 0, 'N/A');
        const nPlusProzentGesamt = fPercent(pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN, 0, 'N/A');

        if (lang === 'de') {
            return `
                <p>Das Gesamtkollektiv umfasste ${gesamtN} Patienten, von denen ${direktOPN} primär operiert wurden (Direkt-OP-Gruppe) und ${nRCTN} eine neoadjuvante Radiochemotherapie (nRCT-Gruppe) erhielten. Das mediane Alter im Gesamtkollektiv betrug ${alterMedian} ${alterRange}. ${maennlichProzent} der Patienten waren männlich. Ein histopathologisch gesicherter positiver Lymphknotenstatus (N+) lag bei ${nPlusProzentGesamt} der Patienten des Gesamtkollektivs vor. Die detaillierten demographischen und klinischen Charakteristika der Patienten, stratifiziert nach Behandlungsgruppen (Gesamt, Direkt OP, nRCT), sind in Tabelle 1 dargestellt. Abbildung 1a und 1b zeigen die Alters- bzw. Geschlechterverteilung für das aktuell im Header ausgewählte Kollektiv (${commonData.currentKollektivName}).</p>
            `;
        } else {
            return `
                <p>The overall cohort comprised ${gesamtN} patients, of whom ${direktOPN} underwent upfront surgery (upfront surgery group) and ${nRCTN} received neoadjuvant chemoradiotherapy (nRCT group). The median age in the overall cohort was ${alterMedian} ${alterRange}. ${maennlichProzent} of patients were male. A histopathologically confirmed positive lymph node status (N+) was present in ${nPlusProzentGesamt} of patients in the overall cohort. Detailed demographic and clinical characteristics, stratified by treatment group (Overall, Upfront Surgery, nRCT), are summarized in Table 1. Figure 1a and 1b show the age and gender distributions, respectively, for the cohort currently selected in the application header (${commonData.currentKollektivName}).</p>
            `;
        }
    }

    function getErgebnisseASPerformanceText(lang, publicationData, commonData) {
        const asGesamt = publicationData?.Gesamt?.gueteAS;
        const asDirektOP = publicationData?.['direkt OP']?.gueteAS;
        const asNRCT = publicationData?.nRCT?.gueteAS;

        if (lang === 'de') {
            return `
                <p>Die diagnostische Leistung des Avocado Signs (AS) zur Prädiktion des pathologischen N-Status ist für die verschiedenen Kollektive in Tabelle 3 zusammengefasst. Im Gesamtkollektiv (N=${commonData.nGesamt || 'N/A'}) erreichte das AS eine Sensitivität von ${fCI(asGesamt?.sens, 1, true, 'de')}, eine Spezifität von ${fCI(asGesamt?.spez, 1, true, 'de')}, einen positiven prädiktiven Wert (PPV) von ${fCI(asGesamt?.ppv, 1, true, 'de')}, einen negativen prädiktiven Wert (NPV) von ${fCI(asGesamt?.npv, 1, true, 'de')} und eine Genauigkeit (Accuracy) von ${fCI(asGesamt?.acc, 1, true, 'de')}. Die Fläche unter der ROC-Kurve (AUC), äquivalent zur Balanced Accuracy, betrug ${fCI(asGesamt?.auc, 3, false, 'de')}.</p>
                <p>In der Subgruppe der primär operierten Patienten (Direkt-OP-Gruppe, N=${commonData.nDirektOP || 'N/A'}) zeigte das AS eine Sensitivität von ${fCI(asDirektOP?.sens, 1, true, 'de')} und eine Spezifität von ${fCI(asDirektOP?.spez, 1, true, 'de')} (AUC: ${fCI(asDirektOP?.auc, 3, false, 'de')}). Bei Patienten nach neoadjuvanter Radiochemotherapie (nRCT-Gruppe, N=${commonData.nNRCT || 'N/A'}) betrug die Sensitivität ${fCI(asNRCT?.sens, 1, true, 'de')} und die Spezifität ${fCI(asNRCT?.spez, 1, true, 'de')} (AUC: ${fCI(asNRCT?.auc, 3, false, 'de')}).</p>
            `;
        } else {
            return `
                <p>The diagnostic performance of the Avocado Sign (AS) for predicting pathological N-status across the different cohorts is summarized in Table 3. In the overall cohort (n=${commonData.nGesamt || 'N/A'}), the AS achieved a sensitivity of ${fCI(asGesamt?.sens, 1, true, 'en')}, a specificity of ${fCI(asGesamt?.spez, 1, true, 'en')}, a positive predictive value (PPV) of ${fCI(asGesamt?.ppv, 1, true, 'en')}, a negative predictive value (NPV) of ${fCI(asGesamt?.npv, 1, true, 'en')}, and an accuracy of ${fCI(asGesamt?.acc, 1, true, 'en')}. The area under the ROC curve (AUC), equivalent to Balanced Accuracy, was ${fCI(asGesamt?.auc, 3, false, 'en')}.</p>
                <p>In the subgroup of patients undergoing upfront surgery (upfront surgery group, n=${commonData.nDirektOP || 'N/A'}), the AS demonstrated a sensitivity of ${fCI(asDirektOP?.sens, 1, true, 'en')} and a specificity of ${fCI(asDirektOP?.spez, 1, true, 'en')} (AUC: ${fCI(asDirektOP?.auc, 3, false, 'en')}). For patients after neoadjuvant chemoradiotherapy (nRCT group, n=${commonData.nNRCT || 'N/A'}), the sensitivity was ${fCI(asNRCT?.sens, 1, true, 'en')} and the specificity was ${fCI(asNRCT?.spez, 1, true, 'en')} (AUC: ${fCI(asNRCT?.auc, 3, false, 'en')}).</p>
            `;
        }
    }

    function getErgebnisseLiteraturT2PerformanceText(lang, publicationData, commonData) {
        let text = '';
        const kohData = publicationData?.Gesamt?.gueteT2_literatur?.['koh_2008_morphology'];
        const barbaroData = publicationData?.nRCT?.gueteT2_literatur?.['barbaro_2024_restaging'];
        const esgarData = publicationData?.['direkt OP']?.gueteT2_literatur?.['rutegard_et_al_esgar'];

        if (lang === 'de') {
            text += `<p>Die diagnostische Leistung der etablierten Literatur-basierten T2-Kriteriensets wurde für die jeweils als primär anwendbar definierten Kollektive evaluiert (Details siehe Tabelle 4). `;
            text += `Für das Kriterienset nach Koh et al. ${getReference('koh2008', commonData, 'de')} ergab sich im Gesamtkollektiv (N=${commonData.nGesamt || 'N/A'}) eine AUC von ${fCI(kohData?.auc, 3, false, 'de')}. `;
            text += `Die Kriterien nach Barbaro et al. ${getReference('barbaro2024', commonData, 'de')} zeigten im nRCT-Kollektiv (N=${commonData.nNRCT || 'N/A'}) eine AUC von ${fCI(barbaroData?.auc, 3, false, 'de')}. `;
            text += `Die ESGAR 2016 Kriterien, evaluiert durch Rutegård et al. ${getReference('rutegard2025', commonData, 'de')}, erreichten im Direkt-OP-Kollektiv (N=${commonData.nDirektOP || 'N/A'}) eine AUC von ${fCI(esgarData?.auc, 3, false, 'de')}. Detaillierte Metriken (Sensitivität, Spezifität etc.) für jedes dieser Sets und ihre primären Zielkollektive sowie explorativ auch für die anderen Kollektive sind in Tabelle 4 aufgeführt.</p>`;
        } else {
            text += `<p>The diagnostic performance of established literature-based T2 criteria sets was evaluated for their respective primarily applicable cohorts (details in Table 4). `;
            text += `For the criteria set according to Koh et al. ${getReference('koh2008', commonData, 'en')}, an AUC of ${fCI(kohData?.auc, 3, false, 'en')} was observed in the overall cohort (n=${commonData.nGesamt || 'N/A'}). `;
            text += `The criteria by Barbaro et al. ${getReference('barbaro2024', commonData, 'en')} showed an AUC of ${fCI(barbaroData?.auc, 3, false, 'en')} in the nRCT cohort (n=${commonData.nNRCT || 'N/A'}). `;
            text += `The ESGAR 2016 criteria, as evaluated by Rutegård et al. ${getReference('rutegard2025', commonData, 'en')}, achieved an AUC of ${fCI(esgarData?.auc, 3, false, 'en')} in the upfront surgery cohort (n=${commonData.nDirektOP || 'N/A'}). Detailed metrics (sensitivity, specificity, etc.) for each of these sets and their primary target cohorts, as well as exploratively for other cohorts, are listed in Table 4.</p>`;
        }
        return text;
    }

    function getErgebnisseOptimierteT2PerformanceText(lang, publicationData, commonData) {
        const bfOptimizedMetric = commonData.bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const bfGesamtDef = publicationData?.Gesamt?.bruteforce_definition;
        const bfGesamtStats = publicationData?.Gesamt?.gueteT2_bruteforce;
        const bfDirektOPDef = publicationData?.['direkt OP']?.bruteforce_definition;
        const bfDirektOPStats = publicationData?.['direkt OP']?.gueteT2_bruteforce;
        const bfNRCTDef = publicationData?.nRCT?.bruteforce_definition;
        const bfNRCTStats = publicationData?.nRCT?.gueteT2_bruteforce;

        const formatBFResultText = (def, stats, kollektivName) => {
            if (def && stats && def.metricName === bfOptimizedMetric) {
                return lang === 'de' ? `Für das ${kollektivName}-Kollektiv (N=${commonData[kollektivIdToNKey(kollektivName)] || 'N/A'}) wurden mit den Kriterien "${studyT2CriteriaManager.formatCriteriaForDisplay(def.criteria, def.logic, false)}" eine AUC von ${fCI(stats.auc, 3, false, 'de')} (optimierte ${def.metricName}: ${fValue(def.metricValue,4)}) erreicht.`
                                      : `For the ${kollektivName} cohort (n=${commonData[kollektivIdToNKey(kollektivName)] || 'N/A'}), the criteria "${studyT2CriteriaManager.formatCriteriaForDisplay(def.criteria, def.logic, false)}" achieved an AUC of ${fCI(stats.auc, 3, false, 'en')} (optimized ${def.metricName}: ${fValue(def.metricValue,4)}).`;
            } else if (def && stats && def.metricName !== bfOptimizedMetric) {
                return lang === 'de' ? `Für das ${kollektivName}-Kollektiv wurde die Optimierung für die Metrik '${def.metricName}' durchgeführt (Ergebnis siehe Tabelle 5), nicht für '${bfOptimizedMetric}'.`
                                      : `For the ${kollektivName} cohort, optimization was performed for the metric '${def.metricName}' (see Table 5 for results), not for '${bfOptimizedMetric}'.`;
            }
            return lang === 'de' ? `Für das ${kollektivName}-Kollektiv konnten keine validen Optimierungsergebnisse für die Zielmetrik '${bfOptimizedMetric}' erzielt oder dargestellt werden.`
                                  : `For the ${kollektivName} cohort, no valid optimization results for the target metric '${bfOptimizedMetric}' could be achieved or displayed.`;
        };
        const kollektivIdToNKey = (id) => {
            if (id === 'Gesamt') return 'nGesamt';
            if (id === 'direkt OP') return 'nDirektOP';
            if (id === 'nRCT') return 'nNRCT';
            return 'N/A';
        };

        if (lang === 'de') {
            return `
                <p>Mittels eines Brute-Force-Optimierungsalgorithmus wurden für jedes Kollektiv spezifische T2-Kriterienkombinationen identifiziert, welche die Zielmetrik "${bfOptimizedMetric}" maximieren. Die Ergebnisse dieser Optimierungen sind detailliert in Tabelle 5 dargestellt. ${formatBFResultText(bfGesamtDef, bfGesamtStats, 'Gesamt')} ${formatBFResultText(bfDirektOPDef, bfDirektOPStats, 'Direkt OP')} ${formatBFResultText(bfNRCTDef, bfNRCTStats, 'nRCT')}</p>
            `;
        } else {
            return `
                <p>Using a brute-force optimization algorithm, specific T2 criteria combinations that maximize the target metric "${bfOptimizedMetric}" were identified for each cohort. The results of these optimizations are detailed in Table 5. ${formatBFResultText(bfGesamtDef, bfGesamtStats, 'Overall')} ${formatBFResultText(bfDirektOPDef, bfDirektOPStats, 'Upfront Surgery')} ${formatBFResultText(bfNRCTDef, bfNRCTStats, 'nRCT')}</p>
            `;
        }
    }

    function getErgebnisseVergleichPerformanceText(lang, publicationData, commonData) {
        const vergleichAngewandtGesamt = publicationData?.Gesamt?.vergleichASvsT2_angewandt;
        const pMcNemar = vergleichAngewandtGesamt?.mcnemar?.pValue;
        const pDeLong = vergleichAngewandtGesamt?.delong?.pValue;

        if (lang === 'de') {
            return `
                <p>Der direkte statistische Vergleich der diagnostischen Leistung zwischen dem Avocado Sign und den aktuell im Analyse-Tool global angewandten T2-Kriterien wurde für das Gesamtkollektiv durchgeführt (Tabelle 6). Hinsichtlich der Genauigkeit (Accuracy) ergab der McNemar-Test einen p-Wert von ${getPValueText(pMcNemar, 'de')} ${pMcNemar !== null && !isNaN(pMcNemar) ? `(${getStatisticalSignificanceText(pMcNemar, commonData.significanceLevel)})` : ''}. Der DeLong-Test für den Vergleich der AUC-Werte (Balanced Accuracy) resultierte in einem p-Wert von ${getPValueText(pDeLong, 'de')} ${pDeLong !== null && !isNaN(pDeLong) ? `(${getStatisticalSignificanceText(pDeLong, commonData.significanceLevel)})` : ''}.</p>
                <p>Diese Ergebnisse deuten darauf hin, ob [je nach Signifikanz einfügen: "ein statistisch signifikanter Unterschied" oder "kein statistisch signifikanter Unterschied"] in der Gesamtperformance zwischen dem Avocado Sign und den angewandten T2-Kriterien im untersuchten Gesamtkollektiv besteht. Abbildung 3 illustriert vergleichend ausgewählte Performancemetriken für das aktuell im Header gewählte Kollektiv (${commonData.currentKollektivName}). Ausführliche Vergleiche, auch mit den Literatur-basierten und den Brute-Force-optimierten T2-Kriterien für alle drei Kollektive, sind ebenfalls in Tabelle 6 aufgeführt.</p>
            `;
        } else {
             return `
                <p>The direct statistical comparison of diagnostic performance between the Avocado Sign and the T2 criteria currently applied globally in the analysis tool was performed for the overall cohort (Table 6). Regarding accuracy, McNemar's test yielded a P-value of ${getPValueText(pMcNemar, 'en')} ${pMcNemar !== null && !isNaN(pMcNemar) ? `(${getStatisticalSignificanceText(pMcNemar, commonData.significanceLevel)})` : ''}. DeLong's test for comparing AUC values (Balanced Accuracy) resulted in a P-value of ${getPValueText(pDeLong, 'en')} ${pDeLong !== null && !isNaN(pDeLong) ? `(${getStatisticalSignificanceText(pDeLong, commonData.significanceLevel)})` : ''}.</p>
                <p>These findings suggest whether there is [insert based on significance: "a statistically significant difference" or "no statistically significant difference"] in the overall performance between the Avocado Sign and the applied T2 criteria in the investigated overall cohort. Figure 3 comparatively illustrates selected performance metrics for the cohort currently selected in the application header (${commonData.currentKollektivName}). Detailed comparisons, including those with literature-based and brute-force optimized T2 criteria for all three cohorts, are also presented in Table 6.</p>
            `;
        }
    }


    function getSectionText(sectionId, lang, publicationData, kollektiveData, commonData) {
        switch (sectionId) {
            case 'methoden_studienanlage': return getMethodenStudienanlageText(lang, publicationData, commonData);
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
            .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, (match, p1) => {
                const level = parseInt(match.charAt(2));
                return `\n${'#'.repeat(level)} ${p1}\n`;
            })
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
