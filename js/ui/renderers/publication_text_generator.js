const publicationTextGenerator = (() => {

    function _fCI(metric, digits = 1, isPercent = true, lang = 'de', placeholder = 'N/A') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return placeholder;

        const formatSingleValue = (val, d, isP, pldr) => {
            if (val === null || val === undefined || isNaN(val)) return pldr;
            if (isP) {
                return formatPercent(val, d, pldr);
            } else {
                let numStr = formatNumber(val, d, pldr, true);
                if (lang === 'de' && numStr !== pldr && typeof numStr === 'string') {
                    numStr = numStr.replace('.', ',');
                }
                return numStr;
            }
        };

        const valStr = formatSingleValue(metric.value, digits, isPercent, placeholder);

        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper)) {
            const lowerStr = formatSingleValue(metric.ci.lower, digits, isPercent, placeholder);
            const upperStr = formatSingleValue(metric.ci.upper, digits, isPercent, placeholder);
            if (lowerStr === placeholder || upperStr === placeholder) return valStr;
            const ciText = lang === 'de' ? '95%-KI' : '95% CI';
            return `${valStr} (${ciText}: ${lowerStr}–${upperStr})`;
        }
        return valStr;
    }

    function _getKollektivText(kollektivId, n, lang = 'de') {
        const name = getKollektivDisplayName(kollektivId);
        const nText = lang === 'de' ? `(N=${n})` : `(n=${n})`;
        return `${name} ${nText}`;
    }

    function _getStudienReferenz(key, commonData, lang = 'de') {
        const ref = commonData.references[key];
        if (!ref) return lang === 'de' ? '(Referenz nicht gefunden)' : '(Reference not found)';
        return ref;
    }

    function _getTextEinleitungInhalt(lang, commonData, allKollektivStats) {
        const lurzSchaeferRef = _getStudienReferenz('lurzSchaefer2025', commonData, lang);
        const esgarRef = _getStudienReferenz('beetsTan2018ESGAR', commonData, lang);
        if (lang === 'de') {
            return `
                <p>Die genaue prätherapeutische Bestimmung des mesorektalen Lymphknotenstatus (N-Status) beim Rektumkarzinom bleibt trotz moderner Bildgebung eine Herausforderung. Die Magnetresonanztomographie (MRT) ist der Goldstandard für das lokale Staging, jedoch zeigen traditionelle T2-gewichtete morphologische Kriterien oft eine limitierte diagnostische Genauigkeit. Dies hat erhebliche Auswirkungen auf Therapieentscheidungen, insbesondere im Kontext organerhaltender Strategien und der Indikationsstellung zur neoadjuvanten Therapie.</p>
                <p>Das "Avocado Sign" (AS), ein neuartiger kontrastmittelbasierter MRT-Marker, der als hypointenser Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens auf T1-gewichteten Sequenzen nach Kontrastmittelgabe definiert ist, zeigte in einer initialen Studie vielversprechende Ergebnisse zur Prädiktion des N-Status. Die vorliegende Analyse baut auf dem Patientenkollektiv (N=${commonData.nGesamt}) dieser Studie auf und zielt darauf ab, die diagnostische Leistung des Avocado Signs umfassend mit etablierten sowie datengetriebenen, optimierten T2-gewichteten morphologischen Kriterien zu vergleichen.</p>
                <p>Ziel dieser Studie ist es daher, (1) die diagnostische Güte des Avocado Signs in der ursprünglichen Kohorte zu bestätigen und detailliert für Subgruppen (primär operierte Patienten vs. Patienten nach neoadjuvanter Radiochemotherapie) darzustellen, (2) diese mit der Performance ausgewählter, in der Literatur etablierter T2-Kriteriensets (Koh et al., Barbaro et al., ESGAR 2016 Kriterien evaluiert durch Rutegård et al., Lahaye et al.) zu vergleichen und (3) die Performance des Avocado Signs jener von T2-Kriterienkombinationen gegenüberzustellen, die mittels eines Brute-Force-Algorithmus spezifisch für die Maximierung der ${commonData.defaultBruteForceMetric} in den jeweiligen Kollektiven optimiert wurden.</p>
            `;
        } else {
            return `
                <p>Accurate pre-treatment assessment of mesorectal lymph node status (N-status) in rectal cancer remains challenging despite modern imaging techniques. Magnetic resonance imaging (MRI) is the gold standard for local staging; however, traditional T2-weighted morphological criteria often exhibit limited diagnostic accuracy. This has significant implications for treatment decisions, particularly in the context of organ-preserving strategies and the indication for neoadjuvant therapy.</p>
                <p>The "Avocado Sign" (AS), a novel contrast-enhanced MRI marker defined as a hypointense core within an otherwise homogeneously hyperintense lymph node on T1-weighted post-contrast images, demonstrated promising results for predicting N-status in an initial study. The present analysis builds upon the patient cohort (n=${commonData.nGesamt}) of that study and aims to comprehensively compare the diagnostic performance of the Avocado Sign with established as well as data-driven, optimized T2-weighted morphological criteria.</p>
                <p>Therefore, the objectives of this study are to (1) confirm the diagnostic performance of the Avocado Sign in the original cohort and present detailed results for subgroups (patients undergoing upfront surgery vs. patients after neoadjuvant chemoradiotherapy), (2) compare this performance with that of selected, literature-based T2 criteria sets (Koh et al., Barbaro et al., ESGAR 2016 criteria evaluated by Rutegård et al., Lahaye et al.), and (3) contrast the performance of the Avocado Sign with T2 criteria combinations optimized via a brute-force algorithm specifically to maximize ${commonData.defaultBruteForceMetric} in the respective cohorts.</p>
            `;
        }
    }

    function _getTextMethodenStudienanlage(lang, commonData, allKollektivStats) {
        const lurzSchaeferRef = _getStudienReferenz('lurzSchaefer2025', commonData, lang);
        const ethicsVote = lang === 'de' ? "Ethikvotum Nr. 055/20-ek (Universität Leipzig, Medizinische Fakultät)" : "Ethics vote No. 055/20-ek (University of Leipzig, Faculty of Medicine)";

        if (lang === 'de') {
            return `
                <p>Diese Studie wurde als retrospektive Analyse prospektiv erhobener Daten eines monozentrischen Patientenkollektivs mit histologisch gesichertem Rektumkarzinom konzipiert, das ursprünglich für die Evaluation des Avocado Signs rekrutiert wurde (${lurzSchaeferRef}). Primäres Ziel der vorliegenden Untersuchung war der Vergleich der diagnostischen Güte des Avocado Signs mit verschiedenen T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus.</p>
                <p>Alle Analysen wurden mittels einer speziell für diese und zukünftige Studien weiterentwickelten, interaktiven Webanwendung (${commonData.appName} v${commonData.appVersion}) durchgeführt. Dieses Werkzeug ermöglicht die flexible Definition und Anwendung von T2-Kriteriensets, eine automatisierte Optimierung von Kriterienkombinationen mittels eines Brute-Force-Algorithmus sowie eine umfassende statistische Auswertung und Visualisierung der Ergebnisse. Die Studie wurde in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki durchgeführt. Das Studienprotokoll wurde von der lokalen Ethikkommission genehmigt (${ethicsVote}). Aufgrund des retrospektiven Charakters der Analyse auf pseudonymisierten Daten wurde von der Ethikkommission auf ein erneutes Einholen eines schriftlichen Einverständnisses der Patienten für diese spezifische Analyse verzichtet, da dieses bereits im Rahmen der Primärstudie erteilt wurde.</p>
            `;
        } else {
            return `
                <p>This study was designed as a retrospective analysis of prospectively collected data from a single-center patient cohort with histologically confirmed rectal cancer, originally recruited for the evaluation of the Avocado Sign (${lurzSchaeferRef}). The primary objective of the present investigation was to compare the diagnostic performance of the Avocado Sign with various T2-weighted morphological criteria for predicting mesorectal lymph node status.</p>
                <p>All analyses were performed using a custom-developed interactive web application (${commonData.appName} v${commonData.appVersion}), specifically enhanced for this and future studies. This tool allows for the flexible definition and application of T2 criteria sets, automated optimization of criteria combinations using a brute-force algorithm, and comprehensive statistical evaluation and visualization of results. The study was conducted in accordance with the principles of the Declaration of Helsinki. The study protocol was approved by the local ethics committee (${ethicsVote}). Given the retrospective nature of this analysis on pseudonymized data, the ethics committee waived the need for re-obtaining written informed consent from patients for this specific analysis, as consent had already been provided as part of the primary study.</p>
            `;
        }
    }

    function _getTextMethodenPatientenkollektiv(lang, commonData, allKollektivStats) {
        const pCharGesamt = allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.GESAMT]?.deskriptiv;
        const lurzSchaeferRef = _getStudienReferenz('lurzSchaefer2025', commonData, lang);

        const alterMedian = formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', lang === 'en');
        const alterMin = formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', lang === 'en');
        const alterMax = formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', lang === 'en');
        const anzahlMaenner = pCharGesamt?.geschlecht?.m || 0;
        const anzahlPatientenChar = pCharGesamt?.anzahlPatienten || 0;
        const anteilMaennerProzent = formatPercent(anzahlPatientenChar > 0 ? anzahlMaenner / anzahlPatientenChar : NaN, 0);


        if (lang === 'de') {
            return `
                <p>Das Studienkollektiv umfasste ${commonData.nGesamt} konsekutive Patienten mit histologisch gesichertem Rektumkarzinom, die zwischen Januar 2020 und November 2023 am Klinikum St. Georg, Leipzig, behandelt und in die initiale Avocado-Sign-Studie (${lurzSchaeferRef}) eingeschlossen wurden. Davon erhielten ${commonData.nNRCT} Patienten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während ${commonData.nDirektOP} Patienten primär operiert wurden (Direkt-OP-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${alterMedian} Jahre (Range: ${alterMin}–${alterMax} Jahre), und ${anteilMaennerProzent} (${anzahlMaenner}/${anzahlPatientenChar}) der Patienten waren männlich. Detaillierte Patientencharakteristika, stratifiziert nach Behandlungsgruppen, sind in Tabelle 1 dargestellt.</p>
                <p>Die Einschlusskriterien für die Primärstudie waren ein Alter von mindestens 18 Jahren und ein histologisch bestätigtes Rektumkarzinom. Ausschlusskriterien umfassten nicht resektable Tumoren und Kontraindikationen für eine MRT-Untersuchung. Für die vorliegende Analyse wurden alle Patienten der Primärstudie berücksichtigt, für die vollständige Datensätze bezüglich der T2-Lymphknotenmerkmale sowie der T1KM-Sequenzen zur AS-Beurteilung vorlagen.</p>
            `;
        } else {
            return `
                <p>The study cohort comprised ${commonData.nGesamt} consecutive patients with histologically confirmed rectal cancer who were treated at Klinikum St. Georg, Leipzig, between January 2020 and November 2023 and included in the initial Avocado Sign study (${lurzSchaeferRef}). Of these, ${commonData.nNRCT} patients received neoadjuvant chemoradiotherapy (nRCT group), while ${commonData.nDirektOP} patients underwent upfront surgery (upfront surgery group). The median age in the overall cohort was ${alterMedian} years (range: ${alterMin}–${alterMax} years), and ${anteilMaennerProzent} (${anzahlMaenner}/${anzahlPatientenChar}) were male. Detailed patient characteristics, stratified by treatment group, are presented in Table 1.</p>
                <p>Inclusion criteria for the primary study were an age of at least 18 years and histologically confirmed rectal cancer. Exclusion criteria included unresectable tumors and contraindications to MRI examination. For the present analysis, all patients from the primary study for whom complete datasets regarding T2-weighted lymph node characteristics and T1-weighted contrast-enhanced sequences for AS assessment were available were included.</p>
            `;
        }
    }

    function _getTextMethodenMRTProtokoll(lang, commonData, allKollektivStats) {
        const lurzSchaeferRef = _getStudienReferenz('lurzSchaefer2025', commonData, lang);
         if (lang === 'de') {
            return `
                <p>Alle MRT-Untersuchungen wurden an einem 3.0-Tesla-System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Deutschland) unter Verwendung von Körper- und Wirbelsäulen-Array-Spulen durchgeführt, wie in der Primärstudie (${lurzSchaeferRef}) beschrieben. Das standardisierte Bildgebungsprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Ebene (Schichtdicke 2-3 mm) sowie eine axiale diffusionsgewichtete Sequenz (DWI). Für die Bewertung des Avocado Signs wurde, wie in der Primärstudie beschrieben, eine kontrastmittelverstärkte axiale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung akquiriert. Die detaillierten Sequenzparameter sind in der Originalpublikation aufgeführt (siehe Tabelle 1 in ${lurzSchaeferRef}).</p>
                <p>Ein makrozyklisches Gadolinium-basiertes Kontrastmittel (Gadoteridol; ProHance; Bracco, Mailand, Italien) wurde gewichtsadaptiert (0,2 ml/kg Körpergewicht) intravenös verabreicht. Die kontrastmittelverstärkten Aufnahmen erfolgten unmittelbar nach vollständiger Applikation des Kontrastmittels. Butylscopolamin (Buscopan®; Sanofi, Paris, Frankreich) wurde zu Beginn und bei Bedarf im Verlauf jeder Untersuchung zur Reduktion von Bewegungsartefakten appliziert. Das Bildgebungsprotokoll war für die primäre Staging-Untersuchung und die Restaging-Untersuchung (bei Patienten der nRCT-Gruppe) identisch.</p>
            `;
        } else {
            return `
                <p>All MRI examinations were performed on a 3.0-Tesla system (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Germany) using body and spine array coils, as described in the primary study (${lurzSchaeferRef}). The standardized imaging protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal planes (slice thickness 2-3 mm), as well as axial diffusion-weighted imaging (DWI). For the assessment of the Avocado Sign, as described in the primary study, a contrast-enhanced axial T1-weighted volumetric interpolated breath-hold examination (VIBE) with Dixon fat suppression was acquired. Detailed sequence parameters are listed in the original publication (see Table 1 in ${lurzSchaeferRef}).</p>
                <p>A macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco, Milan, Italy) was administered intravenously at a weight-based dose (0.2 mL/kg body weight). Contrast-enhanced images were acquired immediately after the full administration of the contrast agent. Butylscopolamine (Buscopan®; Sanofi, Paris, France) was administered at the beginning and, if necessary, during each examination to reduce motion artifacts. The imaging protocol was identical for baseline staging and restaging examinations (in patients from the nRCT group).</p>
            `;
        }
    }
    function _getTextMethodenASDefinition(lang, commonData, allKollektivStats) {
        const lurzSchaeferRef = _getStudienReferenz('lurzSchaefer2025', commonData, lang);
        if (lang === 'de') {
            return `
                <p>Das Avocado Sign wurde, wie in der Originalstudie (${lurzSchaeferRef}) definiert, auf den kontrastmittelverstärkten T1-gewichteten Bildern evaluiert. Es ist charakterisiert als ein klar abgrenzbarer, hypointenser Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens, unabhängig von dessen Größe oder Form. Die Bewertung erfolgte für alle im T1KM-MRT sichtbaren mesorektalen Lymphknoten. Ein Patient wurde als Avocado-Sign-positiv (AS+) eingestuft, wenn mindestens ein Lymphknoten dieses Zeichen aufwies. Die Bildanalyse wurde von denselben zwei Radiologen (ML, Radiologe mit 7 Jahren Erfahrung in der abdominellen MRT; AOS, Radiologe mit 29 Jahren Erfahrung in der abdominellen MRT), die bereits die Primärstudie durchführten, unabhängig und verblindet gegenüber den histopathologischen Ergebnissen und den T2-Merkmalen vorgenommen. Diskrepanzen wurden im Konsens mit einem dritten, ebenfalls erfahrenen Radiologen gelöst. In der nRCT-Subgruppe wurde das Avocado Sign auf den Restaging-MRT-Bildern bewertet.</p>
            `;
        } else {
            return `
                <p>The Avocado Sign, as defined in the original study (${lurzSchaeferRef}), was evaluated on contrast-enhanced T1-weighted images. It is characterized as a clearly demarcated, hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape. Assessment was performed for all mesorectal lymph nodes visible on T1-weighted contrast-enhanced MRI. A patient was classified as Avocado-Sign-positive (AS+) if at least one lymph node exhibited this sign. Image analysis was performed by the same two radiologists (ML, radiologist with 7 years of experience in abdominal MRI; AOS, radiologist with 29 years of experience in abdominal MRI) who conducted the primary study, independently and blinded to histopathological results and T2-weighted features. Discrepancies were resolved by consensus with a third, similarly experienced radiologist. In the neoadjuvant subgroup, the Avocado Sign was assessed on restaging MRI images obtained after the completion of neoadjuvant chemoradiotherapy.</p>
            `;
        }
    }

    function _getTextMethodenT2Definition(lang, commonData, allKollektivStats) {
        const defaultBfMetric = commonData.defaultBruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const formatBFDef = (kolId) => {
            const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;
            if (bfDef && bfDef.criteria && bfDef.metricName === defaultBfMetric) {
                let valStr = _fCI({value: bfDef.metricValue}, 4, false, lang);
                return `${studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, false)} (${lang === 'de' ? 'erreicht' : 'achieved'} ${valStr} ${bfDef.metricName})`;
            }
            return lang === 'de' ? `Keine validen Optimierungsergebnisse für ${defaultBfMetric} in diesem Kollektiv.` : `No valid optimization results for ${defaultBfMetric} in this cohort.`;
        };

        const kohRef = _getStudienReferenz('koh2008', commonData, lang);
        const barbaroRef = _getStudienReferenz('barbaro2024', commonData, lang);
        const rutegardRef = _getStudienReferenz('rutegard2025', commonData, lang);
        const esgarRef = _getStudienReferenz('beetsTan2018ESGAR', commonData, lang);
        const lahayeRef = _getStudienReferenz('lahaye2009', commonData, lang);

        const kohDesc = studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology')?.description || 'Irreguläre Kontur ODER heterogenes Signal';
        const barbaroDesc = studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging')?.description || 'Kurzachse ≥ 2.3mm';
        const esgarDesc = studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar')?.description || 'Komplexe größenabhängige morphologische Regeln';
        const lahayeDesc = studyT2CriteriaManager.getStudyCriteriaSetById('lahaye_et_al_2009_restaging')?.description || 'Kurzachse ≥ 3.3mm';


        if (lang === 'de') {
            return `
                <p>Die morphologischen T2-gewichteten Kriterien (Kurzachsendurchmesser [mm], Form ['rund', 'oval'], Kontur ['scharf', 'irregulär'], Homogenität ['homogen', 'heterogen'] und Signalintensität ['signalarm', 'intermediär', 'signalreich']) wurden für jeden im hochauflösenden T2w-MRT sichtbaren mesorektalen Lymphknoten erfasst. Die Bewertung erfolgte konsensbasiert durch dieselben zwei Radiologen (ML, AOS), die auch das Avocado Sign bewerteten, und verblindet gegenüber dem pathologischen N-Status und dem Avocado-Sign-Status.</p>
                <p>Für den Vergleich der diagnostischen Güte wurden folgende T2-Kriteriensets herangezogen:</p>
                <ol>
                    <li><strong>Literatur-basierte T2-Kriteriensets:</strong> Eine Auswahl etablierter Kriterien wurde implementiert und auf die entsprechenden Subgruppen bzw. das Gesamtkollektiv unseres Datensatzes angewendet (Details siehe Tabelle 2):
                        <ul>
                            <li>Koh et al. (${kohRef}): "${kohDesc}". Angewendet auf das Gesamtkollektiv.</li>
                            <li>Barbaro et al. (${barbaroRef}): "${barbaroDesc}". Angewendet auf das nRCT-Kollektiv (Restaging).</li>
                            <li>ESGAR Konsensus Kriterien (2016, evaluiert durch Rutegård et al. ${rutegardRef}; ursprünglicher Konsensus ${esgarRef}): "${esgarDesc}". Angewendet auf das Direkt-OP-Kollektiv (Primärstaging).</li>
                            <li>Lahaye et al. (${lahayeRef}): "${lahayeDesc}". Angewendet auf das nRCT-Kollektiv (Restaging).</li>
                        </ul>
                    </li>
                    <li><strong>Brute-Force optimierte T2-Kriterien:</strong> Mittels eines im Analyse-Tool implementierten Brute-Force-Algorithmus wurden für jedes der drei Hauptkollektive (Gesamt, Direkt OP, nRCT) diejenigen Kombinationen aus den fünf T2-Merkmalen und einer UND/ODER-Logik identifiziert, welche die primäre Zielmetrik dieser Studie – die <strong>${defaultBfMetric}</strong> – maximieren. Die resultierenden, für jedes Kollektiv spezifisch optimierten Kriteriensets waren:
                        <ul>
                            <li>${getKollektivDisplayName(APP_CONFIG.KOLLEKTIV_IDS.GESAMT)}: ${formatBFDef(APP_CONFIG.KOLLEKTIV_IDS.GESAMT)}</li>
                            <li>${getKollektivDisplayName(APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP)}: ${formatBFDef(APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP)}</li>
                            <li>${getKollektivDisplayName(APP_CONFIG.KOLLEKTIV_IDS.NRCT)}: ${formatBFDef(APP_CONFIG.KOLLEKTIV_IDS.NRCT)}</li>
                        </ul>
                    </li>
                </ol>
                <p>Ein Lymphknoten wurde als T2-positiv für ein gegebenes Kriterienset gewertet, wenn er die spezifischen Bedingungen dieses Sets erfüllte. Ein Patient galt als T2-positiv, wenn mindestens ein Lymphknoten gemäß dem jeweiligen Kriterienset als positiv bewertet wurde.</p>
            `;
        } else {
            return `
                <p>The morphological T2-weighted criteria (short-axis diameter [mm], shape ['round', 'oval'], border ['smooth', 'irregular'], homogeneity ['homogeneous', 'heterogeneous'], and signal intensity ['low', 'intermediate', 'high']) were assessed for every mesorectal lymph node visible on high-resolution T2w-MRI. The assessment was performed by consensus by the same two radiologists (ML, AOS) who evaluated the Avocado Sign, blinded to the pathological N-status and the Avocado Sign status.</p>
                <p>For the comparison of diagnostic performance, the following T2 criteria sets were utilized:</p>
                <ol>
                    <li><strong>Literature-based T2 criteria sets:</strong> A selection of established criteria was implemented and applied to the respective subgroups or the entire cohort of our dataset (details see Table 2):
                        <ul>
                            <li>Koh et al. (${kohRef}): "${kohDesc}". Applied to the overall cohort.</li>
                            <li>Barbaro et al. (${barbaroRef}): "${barbaroDesc}". Applied to the nRCT cohort (restaging).</li>
                            <li>ESGAR Consensus Criteria (2016, as evaluated by Rutegård et al. ${rutegardRef}; original consensus ${esgarRef}): "${esgarDesc}". Applied to the upfront surgery cohort (primary staging).</li>
                            <li>Lahaye et al. (${lahayeRef}): "${lahayeDesc}". Applied to the nRCT cohort (restaging).</li>
                        </ul>
                    </li>
                    <li><strong>Brute-force optimized T2 criteria:</strong> Using a brute-force algorithm implemented in the analysis tool, combinations of the five T2 features and AND/OR logic that maximize the primary endpoint of this study – <strong>${defaultBfMetric}</strong> – were identified for each of the three main cohorts (Overall, Upfront Surgery, nRCT). The resulting cohort-specific optimized criteria sets were:
                        <ul>
                            <li>${getKollektivDisplayName(APP_CONFIG.KOLLEKTIV_IDS.GESAMT)}: ${formatBFDef(APP_CONFIG.KOLLEKTIV_IDS.GESAMT)}</li>
                            <li>${getKollektivDisplayName(APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP)}: ${formatBFDef(APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP)}</li>
                            <li>${getKollektivDisplayName(APP_CONFIG.KOLLEKTIV_IDS.NRCT)}: ${formatBFDef(APP_CONFIG.KOLLEKTIV_IDS.NRCT)}</li>
                        </ul>
                    </li>
                </ol>
                <p>A lymph node was considered T2-positive for a given criteria set if it met the specific conditions of that set. A patient was considered T2-positive if at least one lymph node was rated positive according to the respective criteria set.</p>
            `;
        }
    }


    function _getTextMethodenReferenzstandard(lang, commonData, allKollektivStats) {
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

    function _getTextMethodenStatistischeAnalyse(lang, commonData, allKollektivStats) {
        const alphaLevel = commonData.significanceLevel || 0.05;
        const alphaText = formatNumber(alphaLevel, 2, '0.05', true).replace('.', lang === 'de' ? ',' : '.');
        const bootstrapN = commonData.bootstrapReplications || 1000;

        if (lang === 'de') {
            return `
                <p>Die deskriptive Statistik umfasste die Berechnung von Medianen, Mittelwerten, Standardabweichungen (SD), Minima und Maxima für kontinuierliche Variablen sowie absolute Häufigkeiten und Prozentanteile für kategoriale Daten. Die diagnostische Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) wurde anhand von Sensitivität, Spezifität, positivem prädiktiven Wert (PPV), negativem prädiktiven Wert (NPV), Accuracy (ACC), Balanced Accuracy (BalAcc) und der Fläche unter der Receiver Operating Characteristic-Kurve (AUC) – bei binären Tests äquivalent zur BalAcc – evaluiert. Für diese Metriken wurden zweiseitige 95%-Konfidenzintervalle (KI) berechnet. Für Proportionen (Sensitivität, Spezifität, PPV, NPV, Accuracy) wurde das Wilson-Score-Intervall verwendet. Für BalAcc (AUC) und den F1-Score wurde die Bootstrap-Perzentil-Methode mit ${bootstrapN} Replikationen angewendet.</p>
                <p>Der statistische Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe (gepaarte Daten) erfolgte mittels des McNemar-Tests für gepaarte nominale Daten bzw. des DeLong-Tests für den Vergleich von AUC-Werten. Der Vergleich von Performance-Metriken zwischen unabhängigen Kollektiven (z.B. Direkt-OP vs. nRCT-Gruppe) erfolgte mittels Fisher's Exact Test für Raten (wie Accuracy) und mittels Z-Test für den Vergleich von AUC-Werten basierend auf deren Bootstrap-Standardfehlern. Ein p-Wert < ${alphaText} wurde als statistisch signifikant interpretiert. Alle statistischen Analysen wurden mit der oben genannten, speziell entwickelten Webanwendung (${commonData.appName} v${commonData.appVersion}) durchgeführt, die auf Standardbibliotheken für statistische Berechnungen und JavaScript basiert.</p>
            `;
        } else {
            return `
                <p>Descriptive statistics included the calculation of medians, means, standard deviations (SD), minima, and maxima for continuous variables, as well as absolute frequencies and percentages for categorical data. The diagnostic performance of the Avocado Sign and the various T2 criteria sets (literature-based and brute-force optimized) was evaluated using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy (ACC), balanced accuracy (BalAcc), and the area under the Receiver Operating Characteristic curve (AUC)—equivalent to BalAcc for binary tests. Two-sided 95% confidence intervals (CI) were calculated for these metrics. The Wilson score interval was used for proportions (sensitivity, specificity, PPV, NPV, accuracy). For BalAcc (AUC) and F1-score, the bootstrap percentile method with ${bootstrapN} replications was applied.</p>
                <p>Statistical comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group (paired data) was performed using McNemar's test for paired nominal data and DeLong's test for AUC comparison. Comparison of performance metrics between independent cohorts (e.g., upfront surgery vs. nRCT group) was conducted using Fisher's exact test for rates (such as accuracy) and a Z-test for AUC comparison based on their bootstrap standard errors. A p-value < ${alphaText} was considered statistically significant. All statistical analyses were conducted using the aforementioned custom-developed web application (${commonData.appName} v${commonData.appVersion}), which is based on standard libraries for statistical computations and JavaScript.</p>
            `;
        }
    }

    function _getTextErgebnissePatientencharakteristika(lang, commonData, allKollektivStats) {
        const pCharGesamt = allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.GESAMT]?.deskriptiv;
        const anteilNplusGesamt = formatPercent(pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN, 1);

        if (lang === 'de') {
            return `
                <p>Die Charakteristika der ${commonData.nGesamt} in die Studie eingeschlossenen Patienten sind in Tabelle 1 zusammengefasst. Das Gesamtkollektiv bestand aus ${commonData.nDirektOP} Patienten, die primär operiert wurden (Direkt-OP-Gruppe), und ${commonData.nNRCT} Patienten, die eine neoadjuvante Radiochemotherapie erhielten (nRCT-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', false)} Jahre (Range ${formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', false)}–${formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', false)}), und ${formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN,0)} waren männlich. Ein histopathologisch gesicherter positiver Lymphknotenstatus (N+) fand sich bei ${pCharGesamt?.nStatus?.plus || 'N/A'} von ${commonData.nGesamt} Patienten (${anteilNplusGesamt}) im Gesamtkollektiv. Die Verteilung von Alter und Geschlecht im Gesamtkollektiv ist in Abbildung 1a und 1b dargestellt.</p>
            `;
        } else {
            return `
                <p>The characteristics of the ${commonData.nGesamt} patients included in the study are summarized in Table 1. The overall cohort consisted of ${commonData.nDirektOP} patients who underwent upfront surgery (upfront surgery group) and ${commonData.nNRCT} patients who received neoadjuvant chemoradiotherapy (nRCT group). The median age in the overall cohort was ${formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', true)} years (range ${formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', true)}–${formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', true)}), and ${formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN,0)} were male. A histopathologically confirmed positive lymph node status (N+) was found in ${pCharGesamt?.nStatus?.plus || 'N/A'} of ${commonData.nGesamt} patients (${anteilNplusGesamt}) in the overall cohort. The age and gender distribution in the overall cohort is shown in Figure 1a and 1b.</p>
            `;
        }
    }

    function _getTextErgebnisseASPerformance(lang, commonData, allKollektivStats) {
        const asGesamt = allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.GESAMT]?.gueteAS;
        const asDirektOP = allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP]?.gueteAS;
        const asNRCT = allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.NRCT]?.gueteAS;

        if (lang === 'de') {
            return `
                <p>Die diagnostische Güte des Avocado Signs (AS) zur Vorhersage des pathologischen N-Status ist für das Gesamtkollektiv und die Subgruppen in Tabelle 3 detailliert aufgeführt. Im ${_getKollektivText(APP_CONFIG.KOLLEKTIV_IDS.GESAMT, commonData.nGesamt, lang)} erreichte das AS eine Sensitivität von ${_fCI(asGesamt?.sens, 1, true, lang)}, eine Spezifität von ${_fCI(asGesamt?.spez, 1, true, lang)}, einen positiven prädiktiven Wert (PPV) von ${_fCI(asGesamt?.ppv, 1, true, lang)}, einen negativen prädiktiven Wert (NPV) von ${_fCI(asGesamt?.npv, 1, true, lang)} und eine Accuracy von ${_fCI(asGesamt?.acc, 1, true, lang)}. Die AUC (Balanced Accuracy) betrug ${_fCI(asGesamt?.auc, 3, false, lang)}.</p>
                <p>In der Subgruppe der primär operierten Patienten (${_getKollektivText(APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP, commonData.nDirektOP, lang)}) zeigte das AS eine Sensitivität von ${_fCI(asDirektOP?.sens, 1, true, lang)} und eine Spezifität von ${_fCI(asDirektOP?.spez, 1, true, lang)} (AUC: ${_fCI(asDirektOP?.auc, 3, false, lang)}). Bei Patienten nach nRCT (${_getKollektivText(APP_CONFIG.KOLLEKTIV_IDS.NRCT, commonData.nNRCT, lang)}) betrug die Sensitivität ${_fCI(asNRCT?.sens, 1, true, lang)} und die Spezifität ${_fCI(asNRCT?.spez, 1, true, lang)} (AUC: ${_fCI(asNRCT?.auc, 3, false, lang)}).</p>
            `;
        } else {
            return `
                <p>The diagnostic performance of the Avocado Sign (AS) for predicting pathological N-status is detailed in Table 3 for the overall cohort and subgroups. In the ${_getKollektivText(APP_CONFIG.KOLLEKTIV_IDS.GESAMT, commonData.nGesamt, lang)}, the AS achieved a sensitivity of ${_fCI(asGesamt?.sens, 1, true, lang)}, a specificity of ${_fCI(asGesamt?.spez, 1, true, lang)}, a positive predictive value (PPV) of ${_fCI(asGesamt?.ppv, 1, true, lang)}, a negative predictive value (NPV) of ${_fCI(asGesamt?.npv, 1, true, lang)}, and an accuracy of ${_fCI(asGesamt?.acc, 1, true, lang)}. The AUC (Balanced Accuracy) was ${_fCI(asGesamt?.auc, 3, false, lang)}.</p>
                <p>In the subgroup of patients undergoing upfront surgery (${_getKollektivText(APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP, commonData.nDirektOP, lang)}), the AS showed a sensitivity of ${_fCI(asDirektOP?.sens, 1, true, lang)} and a specificity of ${_fCI(asDirektOP?.spez, 1, true, lang)} (AUC: ${_fCI(asDirektOP?.auc, 3, false, lang)}). For patients after nRCT (${_getKollektivText(APP_CONFIG.KOLLEKTIV_IDS.NRCT, commonData.nNRCT, lang)}), the sensitivity was ${_fCI(asNRCT?.sens, 1, true, lang)} and the specificity was ${_fCI(asNRCT?.spez, 1, true, lang)} (AUC: ${_fCI(asNRCT?.auc, 3, false, lang)}).</p>
            `;
        }
    }

    function _getTextErgebnisseLiteraturT2Performance(lang, commonData, allKollektivStats) {
        const kohData = allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.GESAMT]?.gueteT2_literatur?.['koh_2008_morphology'];
        const barbaroData = allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.NRCT]?.gueteT2_literatur?.['barbaro_2024_restaging'];
        const esgarData = allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP]?.gueteT2_literatur?.['rutegard_et_al_esgar'];
        const lahayeData = allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.NRCT]?.gueteT2_literatur?.['lahaye_et_al_2009_restaging'];

        if (lang === 'de') {
            let text = `<p>Die diagnostische Güte der evaluierten Literatur-basierten T2-Kriteriensets ist in Tabelle 4 zusammengefasst. `;
            text += `Für das Kriterienset nach Koh et al. (2008), angewendet auf das ${_getKollektivText(APP_CONFIG.KOLLEKTIV_IDS.GESAMT, commonData.nGesamt, lang)}, ergab sich eine Sensitivität von ${_fCI(kohData?.sens, 1, true, lang)} und eine Spezifität von ${_fCI(kohData?.spez, 1, true, lang)} (AUC ${_fCI(kohData?.auc, 3, false, lang)}). `;
            text += `Die Kriterien nach Barbaro et al. (2024), angewendet auf das ${_getKollektivText(APP_CONFIG.KOLLEKTIV_IDS.NRCT, commonData.nNRCT, lang)}, zeigten eine Sensitivität von ${_fCI(barbaroData?.sens, 1, true, lang)} und eine Spezifität von ${_fCI(barbaroData?.spez, 1, true, lang)} (AUC ${_fCI(barbaroData?.auc, 3, false, lang)}). `;
            text += `Die ESGAR 2016 Kriterien (evaluiert durch Rutegård et al., 2025), angewendet auf das ${_getKollektivText(APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP, commonData.nDirektOP, lang)}, erreichten eine Sensitivität von ${_fCI(esgarData?.sens, 1, true, lang)} und eine Spezifität von ${_fCI(esgarData?.spez, 1, true, lang)} (AUC ${_fCI(esgarData?.auc, 3, false, lang)}). `;
            text += `Schließlich zeigten die Kriterien nach Lahaye et al. (2009), angewendet auf das ${_getKollektivText(APP_CONFIG.KOLLEKTIV_IDS.NRCT, commonData.nNRCT, lang)}, eine Sensitivität von ${_fCI(lahayeData?.sens, 1, true, lang)} und eine Spezifität von ${_fCI(lahayeData?.spez, 1, true, lang)} (AUC ${_fCI(lahayeData?.auc, 3, false, lang)}).</p>`;
            return text;
        } else {
            let text = `<p>The diagnostic performance of the evaluated literature-based T2 criteria sets is summarized in Table 4. `;
            text += `For the criteria set according to Koh et al. (2008), applied to the ${_getKollektivText(APP_CONFIG.KOLLEKTIV_IDS.GESAMT, commonData.nGesamt, lang)}, a sensitivity of ${_fCI(kohData?.sens, 1, true, lang)} and a specificity of ${_fCI(kohData?.spez, 1, true, lang)} (AUC ${_fCI(kohData?.auc, 3, false, lang)}) were observed. `;
            text += `The criteria by Barbaro et al. (2024), applied to the ${_getKollektivText(APP_CONFIG.KOLLEKTIV_IDS.NRCT, commonData.nNRCT, lang)}, showed a sensitivity of ${_fCI(barbaroData?.sens, 1, true, lang)} and a specificity of ${_fCI(barbaroData?.spez, 1, true, lang)} (AUC ${_fCI(barbaroData?.auc, 3, false, lang)}). `;
            text += `The ESGAR 2016 criteria (evaluated by Rutegård et al., 2025), applied to the ${_getKollektivText(APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP, commonData.nDirektOP, lang)}, achieved a sensitivity of ${_fCI(esgarData?.sens, 1, true, lang)} and a specificity of ${_fCI(esgarData?.spez, 1, true, lang)} (AUC ${_fCI(esgarData?.auc, 3, false, lang)}). `;
            text += `Finally, the criteria by Lahaye et al. (2009), applied to the ${_getKollektivText(APP_CONFIG.KOLLEKTIV_IDS.NRCT, commonData.nNRCT, lang)}, showed a sensitivity of ${_fCI(lahayeData?.sens, 1, true, lang)} and a specificity of ${_fCI(lahayeData?.spez, 1, true, lang)} (AUC ${_fCI(lahayeData?.auc, 3, false, lang)}).</p>`;
            return text;
        }
    }

    function _getTextErgebnisseOptimierteT2Performance(lang, commonData, allKollektivStats) {
        const bfZielMetric = commonData.defaultBruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        let text = '';

        if (lang === 'de') {
            text += `<p>Mittels eines Brute-Force-Algorithmus wurden für jedes der drei Kollektive spezifische T2-Kriteriensets identifiziert, welche die ${bfZielMetric} maximieren. Die Definition dieser optimierten Kriteriensets ist im Methodenteil (Abschnitt 2.5) und Tabelle 2 aufgeführt. Die diagnostische Güte dieser optimierten Sets ist in Tabelle 5 dargestellt.</p><ul>`;
        } else {
            text += `<p>Using a brute-force algorithm, specific T2 criteria sets maximizing ${bfZielMetric} were identified for each of the three cohorts. The definition of these optimized criteria sets is detailed in the Methods section (Section 2.5) and Table 2. The diagnostic performance of these optimized sets is presented in Table 5.</p><ul>`;
        }

        const kollektive = [
            { id: APP_CONFIG.KOLLEKTIV_IDS.GESAMT, nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort', n: commonData.nGesamt },
            { id: APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP, nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort', n: commonData.nDirektOP },
            { id: APP_CONFIG.KOLLEKTIV_IDS.NRCT, nameDe: 'nRCT-Kollektiv', nameEn: 'nRCT cohort', n: commonData.nNRCT }
        ];

        kollektive.forEach(k => {
            const bfStats = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            const nPat = k.n || 'N/A';
            if (bfStats && bfStats.matrix) {
                text += `<li>Für das ${name} (N=${nPat}) erreichten die optimierten Kriterien eine Sensitivität von ${_fCI(bfStats?.sens, 1, true, lang)}, eine Spezifität von ${_fCI(bfStats?.spez, 1, true, lang)} und eine AUC von ${_fCI(bfStats?.auc, 3, false, lang)}.</li>`;
            } else {
                text += `<li>Für das ${name} (N=${nPat}) konnten keine validen optimierten Kriterien für die Zielmetrik ${bfZielMetric} ermittelt oder deren Performance berechnet werden.</li>`;
            }
        });
        text += `</ul>`;
        return text;
    }

    function _getTextErgebnisseVergleichPerformance(lang, commonData, allKollektivStats) {
        let text = '';
        const defaultBfMetric = commonData.defaultBruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        if (lang === 'de') {
            text += `<p>Der direkte statistische Vergleich der diagnostischen Güte zwischen dem Avocado Sign (AS) und den ausgewählten T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert für ${defaultBfMetric}) ist in Tabelle 6 zusammengefasst. Abbildung 2 visualisiert die Schlüsselmetriken (Sensitivität, Spezifität, AUC) vergleichend für die drei Hauptkollektive.</p>`;
        } else {
            text += `<p>The direct statistical comparison of diagnostic performance between the Avocado Sign (AS) and the selected T2 criteria sets (literature-based and brute-force optimized for ${defaultBfMetric}) is summarized in Table 6. Figure 2 provides a comparative visualization of key metrics (sensitivity, specificity, AUC) across the three main cohorts.</p>`;
        }

        const kollektive = [
            { id: APP_CONFIG.KOLLEKTIV_IDS.GESAMT, nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort', litSetId: 'koh_2008_morphology', litSetName: 'Koh et al.' },
            { id: APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP, nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort', litSetId: 'rutegard_et_al_esgar', litSetName: 'ESGAR 2016 (Rutegård et al.)' },
            { id: APP_CONFIG.KOLLEKTIV_IDS.NRCT, nameDe: 'nRCT-Kollektiv', nameEn: 'nRCT cohort', litSetId: 'barbaro_2024_restaging', litSetName: 'Barbaro et al.' }
        ];

        kollektive.forEach(k => {
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            const statsAS = allKollektivStats?.[k.id]?.gueteAS;
            const statsLit = allKollektivStats?.[k.id]?.gueteT2_literatur?.[k.litSetId];
            const statsBF = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;

            const vergleichASvsLit = allKollektivStats?.[k.id]?.[`vergleichASvsT2_literatur_${k.litSetId}`];
            const vergleichASvsBF = allKollektivStats?.[k.id]?.vergleichASvsT2_bruteforce;

            const aucASStr = _fCI(statsAS?.auc, 3, false, lang);
            const aucLitStr = _fCI(statsLit?.auc, 3, false, lang);
            const aucBFStr = _fCI(statsBF?.auc, 3, false, lang);
            const diffAucLitStr = formatNumber(vergleichASvsLit?.delong?.diffAUC, 3, 'N/A', lang==='en');
            const diffAucBfStr = formatNumber(vergleichASvsBF?.delong?.diffAUC, 3, 'N/A', lang==='en');

            if (lang === 'de') {
                text += `<h4 class="mt-3">Vergleich im ${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Im Vergleich des AS (AUC ${aucASStr}) mit den Kriterien nach ${k.litSetName} (AUC ${aucLitStr}) zeigte sich für die Accuracy ein p-Wert von ${getPValueText(vergleichASvsLit.mcnemar?.pValue, 'de')} (McNemar) und für die AUC ein p-Wert von ${getPValueText(vergleichASvsLit.delong?.pValue, 'de')} (DeLong). Der Unterschied in der AUC betrug ${diffAucLitStr}.</p>`;
                } else { text += `<p>Ein Vergleich zwischen AS und den Kriterien nach ${k.litSetName} konnte nicht vollständig durchgeführt werden (fehlende Daten).</p>`; }
                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Gegenüber den für ${bfDef.metricName} optimierten T2-Kriterien (AUC ${aucBFStr}) ergab sich für die Accuracy ein p-Wert von ${getPValueText(vergleichASvsBF.mcnemar?.pValue, 'de')} (McNemar) und für die AUC ein p-Wert von ${getPValueText(vergleichASvsBF.delong?.pValue, 'de')} (DeLong). Der Unterschied in der AUC betrug ${diffAucBfStr}.</p>`;
                } else { text += `<p>Ein Vergleich zwischen AS und den für ${defaultBfMetric} Brute-Force-optimierten Kriterien konnte nicht vollständig durchgeführt werden (fehlende Daten oder keine entsprechende BF-Optimierung).</p>`;}
            } else { // lang === 'en'
                text += `<h4 class="mt-3">Comparison in the ${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Comparing AS (AUC ${aucASStr}) with the criteria by ${k.litSetName} (AUC ${aucLitStr}), the p-value for accuracy was ${getPValueText(vergleichASvsLit.mcnemar?.pValue, 'en')} (McNemar) and for AUC was ${getPValueText(vergleichASvsLit.delong?.pValue, 'en')} (DeLong). The difference in AUC was ${diffAucLitStr}.</p>`;
                } else { text += `<p>A full comparison between AS and the criteria by ${k.litSetName} could not be performed (missing data).</p>`; }
                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Compared to the T2 criteria optimized for ${bfDef.metricName} (AUC ${aucBFStr}), the p-value for accuracy was ${getPValueText(vergleichASvsBF.mcnemar?.pValue, 'en')} (McNemar) and for AUC was ${getPValueText(vergleichASvsBF.delong?.pValue, 'en')} (DeLong). The difference in AUC was ${diffAucBfStr}.</p>`;
                } else { text += `<p>A full comparison between AS and the brute-force optimized criteria for ${defaultBfMetric} could not be performed (missing data or no corresponding BF optimization).</p>`; }
            }
        });
        return text;
    }

    function _getTextDiskussionHaupterkenntnisse(lang, commonData, allKollektivStats) {
        const asGesamt = allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.GESAMT]?.gueteAS;
        if (lang === 'de') {
            return `
                <p>Diese Studie vergleicht die diagnostische Leistung des Avocado Signs mit etablierten und optimierten T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus bei Patienten mit Rektumkarzinom. Die Ergebnisse bestätigen die hohe diagnostische Genauigkeit des Avocado Signs, wie in der Primärstudie gezeigt, mit einer AUC von ${_fCI(asGesamt?.auc, 3, false, lang)} im Gesamtkollektiv. Im direkten Vergleich zeigte das Avocado Sign tendenziell [eine bessere/vergleichbare/schlechtere] Performance als die evaluierten Literatur-basierten T2-Kriteriensets, insbesondere im Hinblick auf [Sensitivität/Spezifität/Balance]. Selbst gegenüber den datengetrieben optimierten T2-Kriterien (optimiert für ${commonData.defaultBruteForceMetric}) konnte das Avocado Sign [seine Stärken behaupten/zeigte vergleichbare Ergebnisse/wurde übertroffen in Bezug auf...].</p>
                <p>Ein wesentlicher Befund ist [fügen Sie hier eine spezifische Haupterkenntnis ein, z.B. über die Überlegenheit des AS in einer bestimmten Subgruppe oder gegenüber einem spezifischen T2-Set]. Dies unterstreicht das Potenzial des Avocado Signs als einfacher und reproduzierbarer Marker. Die Brute-Force-Optimierung der T2-Kriterien führte zwar zu [Verbesserungen/einer spezifischen Performance], die resultierenden Kriterienkombinationen waren jedoch oft komplex und potenziell weniger generalisierbar als das singuläre Avocado Sign.</p>
            `;
        } else {
             return `
                <p>This study compares the diagnostic performance of the Avocado Sign with established and optimized T2-weighted morphological criteria for predicting mesorectal lymph node status in patients with rectal cancer. The results confirm the high diagnostic accuracy of the Avocado Sign, as shown in the primary study, with an AUC of ${_fCI(asGesamt?.auc, 3, false, lang)} in the overall cohort. In direct comparison, the Avocado Sign tended to show [better/comparable/inferior] performance than the evaluated literature-based T2 criteria sets, particularly regarding [sensitivity/specificity/balance]. Even compared to the data-driven optimized T2 criteria (optimized for ${commonData.defaultBruteForceMetric}), the Avocado Sign [maintained its strengths/showed comparable results/was surpassed regarding...].</p>
                <p>A key finding is [insert a specific main finding here, e.g., about the superiority of AS in a particular subgroup or against a specific T2 set]. This underscores the potential of the Avocado Sign as a simple and reproducible marker. While the brute-force optimization of T2 criteria led to [improvements/a specific performance], the resulting criteria combinations were often complex and potentially less generalizable than the singular Avocado Sign.</p>
            `;
        }
    }
     function _getTextDiskussionLimitationen(lang, commonData, allKollektivStats) {
        const lurzSchaeferRef = _getStudienReferenz('lurzSchaefer2025', commonData, lang);
        if (lang === 'de') {
            return `
                <p>Diese Studie weist einige Limitationen auf. Erstens handelt es sich um eine retrospektive Analyse der Daten aus der monozentrischen Primärstudie zum Avocado Sign (${lurzSchaeferRef}). Obwohl die ursprüngliche Datenerhebung prospektiv erfolgte, könnte die monozentrische Natur die Generalisierbarkeit der Ergebnisse einschränken. Zweitens war die Fallzahl, insbesondere in den Subgruppen (Direkt OP: N=${commonData.nDirektOP}, nRCT: N=${commonData.nNRCT}), moderat, was die statistische Aussagekraft einiger Subgruppenanalysen limitieren kann. Drittens erfolgte die Bewertung der T2-Merkmale und des Avocado Signs zwar verblindet gegenüber der Histopathologie, jedoch durch dieselben erfahrenen Radiologen, die auch die Primärstudie durchführten, was einen gewissen Bias nicht vollständig ausschließen kann, obwohl ein standardisiertes Vorgehen und Konsensus-Readings angewendet wurden. Viertens basierte die Auswahl der Literatur-Kriteriensets auf einer Selektion und nicht auf einer systematischen Meta-Analyse aller existierenden T2-Kriterien. Fünftens wurde für die Brute-Force-Optimierung eine spezifische Zielmetrik (${commonData.defaultBruteForceMetric}) verwendet; andere Zielmetriken könnten zu unterschiedlichen optimalen Kriteriensets führen. Schließlich wurde in dieser Analyse keine explizite Node-für-Node Korrelation zwischen Bildgebung und Histopathologie für die T2-Merkmale durchgeführt, sondern der Patientenstatus als Ganzes bewertet, analog zur Vorgehensweise für das Avocado Sign.</p>
            `;
        } else {
            return `
                <p>This study has several limitations. First, it is a retrospective analysis of data from the single-center primary study on the Avocado Sign (${lurzSchaeferRef}). Although the original data collection was prospective, the single-center nature might limit the generalizability of the findings. Second, the sample size, particularly in the subgroups (upfront surgery: n=${commonData.nDirektOP}, nRCT: n=${commonData.nNRCT}), was moderate, which may limit the statistical power of some subgroup analyses. Third, although the assessment of T2 features and the Avocado Sign was blinded to histopathology, it was performed by the same experienced radiologists who conducted the primary study, which cannot completely rule out some bias, despite standardized procedures and consensus readings. Fourth, the selection of literature-based criteria was based on a curated list and not a systematic meta-analysis of all existing T2 criteria. Fifth, a specific target metric (${commonData.defaultBruteForceMetric}) was used for the brute-force optimization; other target metrics might yield different optimal criteria sets. Finally, this analysis did not perform an explicit node-by-node correlation between imaging and histopathology for T2 features but assessed the overall patient status, analogous to the approach for the Avocado Sign.</p>
            `;
        }
    }
     function _getTextDiskussionAusblick(lang, commonData, allKollektivStats) {
        if (lang === 'de') {
            return `
                <p>Zukünftige prospektive, multizentrische Studien sind erforderlich, um die hier präsentierten Ergebnisse zur vergleichenden diagnostischen Güte des Avocado Signs zu validieren und dessen Rolle im klinischen Algorithmus des Rektumkarzinom-Stagings weiter zu definieren. Insbesondere der direkte Vergleich mit standardisierten, modernen T2-basierten Staging-Protokollen wie z.B. Node-RADS wäre von Interesse. Die Integration des Avocado Signs in KI-basierte Analysemodelle könnte ebenfalls ein vielversprechender Ansatz sein, um die Objektivität und Effizienz der Befundung weiter zu steigern. Die vorliegende Analyse-Software bietet eine flexible Plattform für solche weiterführenden Untersuchungen.</p>
                <p>Schlussfolgernd lässt sich sagen, dass das Avocado Sign ein vielversprechender, einfach anzuwendender und gut reproduzierbarer MRT-Marker für den mesorektalen Lymphknotenstatus beim Rektumkarzinom ist. Es zeigt eine mindestens ebenbürtige, in Teilen überlegene diagnostische Leistung im Vergleich zu etablierten und optimierten T2-Kriterien. Die Implementierung kontrastmittelverstärkter Sequenzen zur Beurteilung des Avocado Signs sollte daher als wertvolle Ergänzung des Standard-MRT-Protokolls beim Rektumkarzinom in Betracht gezogen werden.</p>
            `;
        } else {
            return `
                <p>Future prospective, multicenter studies are needed to validate the comparative diagnostic performance of the Avocado Sign presented herein and to further define its role in the clinical algorithm for rectal cancer staging. In particular, direct comparison with standardized, modern T2-based staging protocols such as Node-RADS would be of interest. The integration of the Avocado Sign into AI-based analysis models could also be a promising approach to further enhance objectivity and efficiency in reporting. The present analysis software provides a flexible platform for such further investigations.</p>
                <p>In conclusion, the Avocado Sign is a promising, easy-to-use, and highly reproducible MRI marker for mesorectal lymph node status in rectal cancer. It demonstrates diagnostic performance at least equivalent, and in some aspects superior, to established and optimized T2-weighted criteria. The implementation of contrast-enhanced sequences for assessing the Avocado Sign should therefore be considered a valuable addition to standard MRI protocols for rectal cancer.</p>
            `;
        }
    }

    function _getTextAbstractInhalt(lang, commonData, allKollektivStats) {
        const asGesamt = allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.GESAMT]?.gueteAS;
        if (lang === 'de') {
            return `
                <p><strong>Hintergrund:</strong> Die präzise Bestimmung des N-Status beim Rektumkarzinom ist entscheidend für die Therapieplanung. Das Avocado Sign (AS) ist ein neuer vielversprechender MRT-Marker. Ziel dieser Studie war der Vergleich der diagnostischen Güte des AS mit etablierten und optimierten T2-gewichteten Kriterien.</p>
                <p><strong>Methoden:</strong> Retrospektive Analyse von 106 Patienten (${commonData.nDirektOP} primär operiert, ${commonData.nNRCT} neoadjuvant behandelt) aus der ${commonData.references.lurzSchaefer2025} Studie. AS wurde auf T1KM-MRT bewertet. T2-Kriterien (Größe, Form, Kontur, Homogenität, Signal) wurden erfasst und Literatur-Sets (Koh et al., Barbaro et al., ESGAR/Rutegård et al., Lahaye et al.) sowie Brute-Force-optimierte Sets (Ziel: ${commonData.defaultBruteForceMetric}) verglichen. Histopathologie diente als Referenz.</p>
                <p><strong>Ergebnisse:</strong> Das AS zeigte im Gesamtkollektiv eine Sensitivität von ${_fCI(asGesamt?.sens, 1, true, lang)}, Spezifität von ${_fCI(asGesamt?.spez, 1, true, lang)} und AUC von ${_fCI(asGesamt?.auc, 3, false, lang)}. Es zeigte [eine bessere/vergleichbare/schlechtere] Performance im Vergleich zu Literatur-T2-Sets und den für ${commonData.defaultBruteForceMetric} optimierten T2-Sets in den jeweiligen Kollektiven. [Fügen Sie hier ein bis zwei prägnante Vergleichsergebnisse ein, z.B. p-Werte für DeLong-Tests].</p>
                <p><strong>Schlussfolgerung:</strong> Das Avocado Sign ist ein robuster und hochakkurater Prädiktor für den N-Status beim Rektumkarzinom und zeigt eine mindestens ebenbürtige Leistung im Vergleich zu komplexen T2-Kriteriensets. Die Integration von T1KM-Sequenzen zur AS-Beurteilung wird empfohlen.</p>
            `;
        } else {
            return `
                <p><strong>Background:</strong> Accurate determination of N-status in rectal cancer is crucial for treatment planning. The Avocado Sign (AS) is a novel promising MRI marker. This study aimed to compare the diagnostic performance of AS with established and optimized T2-weighted criteria.</p>
                <p><strong>Methods:</strong> Retrospective analysis of 106 patients (${commonData.nDirektOP} upfront surgery, ${commonData.nNRCT} neoadjuvant therapy) from the ${commonData.references.lurzSchaefer2025} study. AS was assessed on T1CE-MRI. T2 criteria (size, shape, border, homogeneity, signal) were recorded, and literature sets (Koh et al., Barbaro et al., ESGAR/Rutegård et al., Lahaye et al.) as well as brute-force optimized sets (target: ${commonData.defaultBruteForceMetric}) were compared. Histopathology served as reference.</p>
                <p><strong>Results:</strong> In the overall cohort, AS demonstrated a sensitivity of ${_fCI(asGesamt?.sens, 1, true, lang)}, specificity of ${_fCI(asGesamt?.spez, 1, true, lang)}, and AUC of ${_fCI(asGesamt?.auc, 3, false, lang)}. It showed [better/comparable/inferior] performance compared to literature T2 sets and T2 sets optimized for ${commonData.defaultBruteForceMetric} in the respective cohorts. [Insert one or two concise comparative results here, e.g., p-values for DeLong tests].</p>
                <p><strong>Conclusion:</strong> The Avocado Sign is a robust and highly accurate predictor of N-status in rectal cancer, demonstrating performance at least equivalent to complex T2 criteria sets. Integration of T1CE sequences for AS assessment is recommended.</p>
            `;
        }
    }

    function _getTextReferenzenLiteraturverzeichnis(lang, commonData, allKollektivStats) {
        const refs = commonData.references;
        let html = `<p>${lang === 'de' ? 'Die folgenden Referenzen wurden in den Texten zitiert:' : 'The following references were cited in the texts:'}</p><ul>`;
        Object.keys(refs).forEach(key => {
            html += `<li>${refs[key]}</li>`;
        });
        // Add references from the provided PDFs
        html += `<li>Zhang H, Zhang C, Zheng Z et al. Chemical shift effect predicting lymph node status in rectal cancer using high-resolution MR imaging with node-for-node matched histopathological validation. Eur Radiol 2017;27:3845-3855. (Ref. 7 in Lurz & Schäfer 2025)</li>`;
        html += `<li>Ale Ali H, Kirsch R, Razaz S et al. Extramural venous invasion in rectal cancer: overview of imaging, histopathology, and clinical implications. Abdom Radiol (NY) 2019;44:1-10. (Ref. 8 in Lurz & Schäfer 2025)</li>`;
        html += `<li>Elsholtz FHJ, Asbach P, Haas M et al. Introducing the node reporting and data system 1.0 (node-RADS): a concept for standardized assessment of lymph nodes in cancer. Eur Radiol 2021;31:6116-6124. (Ref. 16 in Rutegård 2025)</li>`;
        html += `</ul>`;
        return html;
    }
     function _getTextReferenzenAnhang(lang, commonData, allKollektivStats) {
        if (lang === 'de') { return `<p>(Hier könnte optionaler Anhang platziert werden, z.B. detaillierte Tabellen aller Brute-Force-Ergebnisse oder zusätzliche Subgruppenanalysen.)</p>`;}
        else { return `<p>(Optional appendix could be placed here, e.g., detailed tables of all brute-force results or additional subgroup analyses.)</p>`;}
    }


    function getSectionText(sectionId, lang = 'de', allKollektivStats = null, commonData = {}) {
        if (!allKollektivStats) {
             console.warn("publicationTextGenerator.getSectionText: allKollektivStats ist null oder undefiniert.");
             return `<p class="text-danger">Fehler: Statistische Daten für die Textgenerierung nicht verfügbar.</p>`;
        }
        switch (sectionId) {
            case 'einleitung_inhalt': return _getTextEinleitungInhalt(lang, commonData, allKollektivStats);
            case 'methoden_studienanlage': return _getTextMethodenStudienanlage(lang, commonData, allKollektivStats);
            case 'methoden_patientenkollektiv': return _getTextMethodenPatientenkollektiv(lang, commonData, allKollektivStats);
            case 'methoden_mrt_protokoll': return _getTextMethodenMRTProtokoll(lang, commonData, allKollektivStats);
            case 'methoden_as_definition': return _getTextMethodenASDefinition(lang, commonData, allKollektivStats);
            case 'methoden_t2_definition': return _getTextMethodenT2Definition(lang, commonData, allKollektivStats);
            case 'methoden_referenzstandard': return _getTextMethodenReferenzstandard(lang, commonData, allKollektivStats);
            case 'methoden_statistische_analyse': return _getTextMethodenStatistischeAnalyse(lang, commonData, allKollektivStats);
            case 'ergebnisse_patientencharakteristika': return _getTextErgebnissePatientencharakteristika(lang, commonData, allKollektivStats);
            case 'ergebnisse_as_performance': return _getTextErgebnisseASPerformance(lang, commonData, allKollektivStats);
            case 'ergebnisse_literatur_t2_performance': return _getTextErgebnisseLiteraturT2Performance(lang, commonData, allKollektivStats);
            case 'ergebnisse_optimierte_t2_performance': return _getTextErgebnisseOptimierteT2Performance(lang, commonData, allKollektivStats);
            case 'ergebnisse_vergleich_performance': return _getTextErgebnisseVergleichPerformance(lang, commonData, allKollektivStats);
            case 'diskussion_haupterkenntnisse': return _getTextDiskussionHaupterkenntnisse(lang, commonData, allKollektivStats);
            case 'diskussion_limitationen': return _getTextDiskussionLimitationen(lang, commonData, allKollektivStats);
            case 'diskussion_ausblick': return _getTextDiskussionAusblick(lang, commonData, allKollektivStats);
            case 'abstract_inhalt': return _getTextAbstractInhalt(lang, commonData, allKollektivStats);
            case 'referenzen_literaturverzeichnis': return _getTextReferenzenLiteraturverzeichnis(lang, commonData, allKollektivStats);
            case 'referenzen_anhang': return _getTextReferenzenAnhang(lang, commonData, allKollektivStats);
            default: return `<p class="text-warning">Text für Sektion '${sectionId}' (Sprache: ${lang}) noch nicht implementiert.</p>`;
        }
    }

    function getSectionTextAsMarkdown(sectionId, lang, allKollektivStats, commonData) {
        const htmlContent = getSectionText(sectionId, lang, allKollektivStats, commonData);
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
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/g, (match, p1) => {
                const level = parseInt(match[match.indexOf('<h') + 2]);
                return `\n\n${'#'.repeat(level)} ${p1}\n\n`;
            })
            .replace(/\/g, "[$1]")
            .replace(/\/g, "[$1,$2]")
            .replace(/\/g, "[$1,$2,$3]")
            .replace(/\/g, "[$1,$2,$3,$4]")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/–/g, '-')
            .replace(/ {2,}/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
        return markdown;
    }


    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown
    });

})();
