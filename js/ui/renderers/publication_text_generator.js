const publicationTextGenerator = (() => {

    function fCI(metric, digits = 1, isPercent = true, lang = 'de') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return 'N/A';

        const formatSingleValue = (val, d, isP) => {
            if (isP) {
                return formatPercent(val, d);
            } else {
                let numStr = formatNumber(val, d, 'N/A', true);
                if (lang === 'de' && numStr !== 'N/A' && typeof numStr === 'string') {
                    numStr = numStr.replace('.', ',');
                }
                return numStr;
            }
        };

        const valStr = formatSingleValue(metric.value, digits, isPercent);

        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper)) {
            const lowerStr = formatSingleValue(metric.ci.lower, digits, isPercent);
            const upperStr = formatSingleValue(metric.ci.upper, digits, isPercent);
            const ciText = lang === 'de' ? '95% KI' : '95% CI';
            return `${valStr} (${ciText}: ${lowerStr} – ${upperStr})`;
        }
        return valStr;
    }

    function getKollektivText(kollektivId, n, lang = 'de') {
        const name = getKollektivDisplayName(kollektivId);
        const nText = lang === 'de' ? `(N=${n})` : `(n=${n})`;
        return `${name} ${nText}`;
    }

    function getMethodenStudienanlageText(lang, commonData) {
        const appVersion = commonData.appVersion || APP_CONFIG.APP_VERSION;
        const studyReference = commonData.references?.lurzSchaefer2025 || "Lurz & Schäfer (2025)";
        const ethicsVote = "Ethikvotum Nr. XYZ/2020, Klinikum St. Georg, Leipzig";


        if (lang === 'de') {
            return `
                <p>Diese Studie wurde als retrospektive Analyse prospektiv erhobener Daten eines monozentrischen Patientenkollektivs mit histologisch gesichertem Rektumkarzinom konzipiert. Das Studienkollektiv und die zugrundeliegenden Bilddatensätze sind identisch mit jenen der initialen "Avocado Sign" Studie (${studyReference}). Primäres Ziel der vorliegenden Untersuchung war der Vergleich der diagnostischen Güte des Avocado Signs mit etablierten und optimierten T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status).</p>
                <p>Alle Analysen wurden mittels einer speziell für diese und zukünftige Studien entwickelten, interaktiven Webanwendung (AvocadoSign Analyse Tool v${appVersion}, ${APP_CONFIG.APP_NAME}) durchgeführt. Dieses Werkzeug ermöglicht die flexible Definition und Anwendung von T2-Kriteriensets, eine automatisierte Optimierung von Kriterienkombinationen mittels eines Brute-Force-Algorithmus sowie eine umfassende statistische Auswertung und Visualisierung der Ergebnisse. Die Studie wurde in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki durchgeführt. Das Studienprotokoll wurde von der lokalen Ethikkommission genehmigt (${ethicsVote}). Aufgrund des retrospektiven Charakters der Analyse auf anonymisierten Daten wurde von der Ethikkommission auf ein erneutes Einholen eines schriftlichen Einverständnisses der Patienten für diese spezifische Analyse verzichtet, da dieses bereits im Rahmen der Primärstudie erteilt wurde.</p>
            `;
        } else {
            return `
                <p>This study was designed as a retrospective analysis of prospectively collected data from a single-center patient cohort with histologically confirmed rectal cancer. The study cohort and the underlying imaging datasets are identical to those used in the initial "Avocado Sign" study (${studyReference}). The primary objective of the present investigation was to compare the diagnostic performance of the Avocado Sign with established and optimized T2-weighted morphological criteria for predicting mesorectal lymph node status (N-status).</p>
                <p>All analyses were performed using a custom-developed interactive web application (AvocadoSign Analysis Tool v${appVersion}, ${APP_CONFIG.APP_NAME}), specifically enhanced for this and future studies. This tool allows for the flexible definition and application of T2 criteria sets, automated optimization of criteria combinations using a brute-force algorithm, and comprehensive statistical evaluation and visualization of results. The study was conducted in accordance with the principles of the Declaration of Helsinki. The study protocol was approved by the local ethics committee (${ethicsVote}). Given the retrospective nature of this analysis on anonymized data, the ethics committee waived the need for re-obtaining written informed consent from patients for this specific analysis, as consent had already been provided as part of the primary study.</p>
            `;
        }
    }

    function getMethodenPatientenkollektivText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';

        const alterMedian = formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', lang === 'en');
        const alterMin = formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', lang === 'en');
        const alterMax = formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', lang === 'en');
        const anteilMaennerProzent = formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN, 0);
        const anzahlMaenner = pCharGesamt?.geschlecht?.m || 0;
        const anzahlPatientenChar = pCharGesamt?.anzahlPatienten || 0;

        if (lang === 'de') {
            return `
                <p>Das Studienkollektiv umfasste ${anzahlGesamt} konsekutive Patienten mit histologisch gesichertem Rektumkarzinom, die zwischen Januar 2020 und November 2023 am Klinikum St. Georg, Leipzig, behandelt und in die initiale Avocado-Sign-Studie eingeschlossen wurden. Davon erhielten ${anzahlNRCT} Patienten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während ${anzahlDirektOP} Patienten primär operiert wurden (Direkt-OP-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${alterMedian} Jahre (Range: ${alterMin}–${alterMax} Jahre), und ${anteilMaennerProzent} (${anzahlMaenner}/${anzahlPatientenChar}) der Patienten waren männlich. Detaillierte Patientencharakteristika, stratifiziert nach Behandlungsgruppen, sind in Tabelle 1 dargestellt.</p>
                <p>Die Einschlusskriterien für die Primärstudie waren ein Alter von mindestens 18 Jahren und ein histologisch bestätigtes Rektumkarzinom. Ausschlusskriterien umfassten nicht resektable Tumoren und Kontraindikationen für eine MRT-Untersuchung. Für die vorliegende Analyse wurden alle Patienten der Primärstudie berücksichtigt, für die vollständige Datensätze bezüglich der T2-Lymphknotenmerkmale vorlagen.</p>
            `;
        } else {
            return `
                <p>The study cohort comprised ${anzahlGesamt} consecutive patients with histologically confirmed rectal cancer who were treated at Klinikum St. Georg, Leipzig, between January 2020 and November 2023 and included in the initial Avocado Sign study. Of these, ${anzahlNRCT} patients received neoadjuvant chemoradiotherapy (nRCT group), while ${anzahlDirektOP} patients underwent upfront surgery (upfront surgery group). The median age in the overall cohort was ${alterMedian} years (range: ${alterMin}–${alterMax} years), and ${anteilMaennerProzent} (${anzahlMaenner}/${anzahlPatientenChar}) were male. Detailed patient characteristics, stratified by treatment group, are presented in Table 1.</p>
                <p>Inclusion criteria for the primary study were an age of at least 18 years and histologically confirmed rectal cancer. Exclusion criteria included unresectable tumors and contraindications to MRI examination. For the present analysis, all patients from the primary study for whom complete datasets regarding T2-weighted lymph node characteristics were available were included.</p>
            `;
        }
    }

    function getMethodenMRTProtokollText(lang, commonData) {
         if (lang === 'de') {
            return `
                <p>Alle MRT-Untersuchungen wurden an einem 3.0-Tesla-System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Deutschland) unter Verwendung von Körper- und Wirbelsäulen-Array-Spulen durchgeführt. Das standardisierte Bildgebungsprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Ebene (Schichtdicke 2-3 mm) sowie eine axiale diffusionsgewichtete Sequenz (DWI). Für die Bewertung des Avocado Signs wurde, wie in der Primärstudie beschrieben, eine kontrastmittelverstärkte axiale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung akquiriert.</p>
                <p>Ein makrozyklisches Gadolinium-basiertes Kontrastmittel (Gadoteridol; ProHance; Bracco, Mailand, Italien) wurde gewichtsadaptiert (0,2 ml/kg Körpergewicht) intravenös verabreicht. Die kontrastmittelverstärkten Aufnahmen erfolgten unmittelbar nach vollständiger Applikation des Kontrastmittels. Butylscopolamin (Buscopan®; Sanofi, Paris, Frankreich) wurde zu Beginn und bei Bedarf im Verlauf jeder Untersuchung zur Reduktion von Bewegungsartefakten appliziert. Das Bildgebungsprotokoll war für die primäre Staging-Untersuchung und die Restaging-Untersuchung (bei Patienten der nRCT-Gruppe) identisch.</p>
            `;
        } else {
            return `
                <p>All MRI examinations were performed on a 3.0-Tesla system (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Germany) using body and spine array coils. The standardized imaging protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal planes (slice thickness 2-3 mm), as well as axial diffusion-weighted imaging (DWI). For the assessment of the Avocado Sign, as described in the primary study, a contrast-enhanced axial T1-weighted volumetric interpolated breath-hold examination (VIBE) with Dixon fat suppression was acquired.</p>
                <p>A macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco, Milan, Italy) was administered intravenously at a weight-based dose (0.2 mL/kg body weight). Contrast-enhanced images were acquired immediately after the full administration of the contrast agent. Butylscopolamine (Buscopan®; Sanofi, Paris, France) was administered at the beginning and, if necessary, during each examination to reduce motion artifacts. The imaging protocol was identical for baseline staging and restaging examinations (in patients from the nRCT group).</p>
            `;
        }
    }

    function getMethodenASDefinitionText(lang, commonData) {
        if (lang === 'de') {
            return `
                <p>Das Avocado Sign wurde, wie in der Originalstudie (${commonData.references?.lurzSchaefer2025 || "Lurz & Schäfer, 2025"}) definiert, auf den kontrastmittelverstärkten T1-gewichteten Bildern evaluiert. Es ist charakterisiert als ein klar abgrenzbarer, hypointenser Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens, unabhängig von dessen Größe oder Form. Die Bewertung erfolgte für alle im T1KM-MRT sichtbaren mesorektalen Lymphknoten. Ein Patient wurde als Avocado-Sign-positiv (AS+) eingestuft, wenn mindestens ein Lymphknoten dieses Zeichen aufwies. Die Bildanalyse wurde von denselben zwei Radiologen (ML, Radiologe mit 7 Jahren Erfahrung in der abdominellen MRT; AOS, Radiologe mit 29 Jahren Erfahrung in der abdominellen MRT), die bereits die Primärstudie durchführten, unabhängig und verblindet gegenüber den histopathologischen Ergebnissen und den T2-Merkmalen vorgenommen. Diskrepanzen wurden im Konsens mit einem dritten, ebenfalls erfahrenen Radiologen gelöst.</p>
            `;
        } else {
            return `
                <p>The Avocado Sign, as defined in the original study (${commonData.references?.lurzSchaefer2025 || "Lurz & Schäfer, 2025"}), was evaluated on contrast-enhanced T1-weighted images. It is characterized as a clearly demarcated, hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape. Assessment was performed for all mesorectal lymph nodes visible on T1-weighted contrast-enhanced MRI. A patient was classified as Avocado-Sign-positive (AS+) if at least one lymph node exhibited this sign. Image analysis was performed by the same two radiologists (ML, radiologist with 7 years of experience in abdominal MRI; AOS, radiologist with 29 years of experience in abdominal MRI) who conducted the primary study, independently and blinded to histopathological results and T2-weighted features. Discrepancies were resolved by consensus with a third, similarly experienced radiologist.</p>
            `;
        }
    }

    function getMethodenT2DefinitionText(lang, commonData, allKollektivStats) {
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
        const appliedLogic = t2CriteriaManager.getAppliedLogic();
        const formattedAppliedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false);
        const bfZielMetric = PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const formatBFDefinition = (kollektivId, displayName) => {
            const bfDef = allKollektivStats?.[kollektivId]?.bruteforce_definition;
            if (bfDef && bfDef.criteria) {
                let metricValueStr = formatNumber(bfDef.metricValue, 4, 'N/A', true);
                if (lang === 'de' && metricValueStr !== 'N/A' && typeof metricValueStr === 'string') {
                    metricValueStr = metricValueStr.replace('.', ',');
                }
                return `<li><strong>${displayName}:</strong> ${studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, false)} (Zielmetrik: ${bfDef.metricName}, Erreichter Wert: ${metricValueStr})</li>`;
            }
            return `<li><strong>${displayName}:</strong> Keine Optimierungsergebnisse für Zielmetrik '${bfZielMetric}' verfügbar oder nicht berechnet.</li>`;
        };

        let bfCriteriaTextDe = '<ul>';
        bfCriteriaTextDe += formatBFDefinition('Gesamt', 'Gesamtkollektiv');
        bfCriteriaTextDe += formatBFDefinition('direkt OP', 'Direkt-OP Kollektiv');
        bfCriteriaTextDe += formatBFDefinition('nRCT', 'nRCT Kollektiv');
        bfCriteriaTextDe += '</ul>';

        let bfCriteriaTextEn = '<ul>';
        bfCriteriaTextEn += formatBFDefinition('Gesamt', 'Overall cohort');
        bfCriteriaTextEn += formatBFDefinition('direkt OP', 'Upfront surgery cohort');
        bfCriteriaTextEn += formatBFDefinition('nRCT', 'nRCT cohort');
        bfCriteriaTextEn += '</ul>';

        const kohDesc = studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008_morphology')?.description || 'Irreguläre Kontur ODER heterogenes Signal';
        const kohRef = commonData.references?.koh2008 || "Koh et al. (2008)";
        const barbaroDesc = studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024_restaging')?.description || 'Kurzachse ≥ 2,3mm';
        const barbaroRef = commonData.references?.barbaro2024 || "Barbaro et al. (2024)";
        const esgarDesc = studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar')?.description || 'Komplexe größenabhängige morphologische Regeln';
        const esgarRef = commonData.references?.rutegard2025 ? `${commonData.references.rutegard2025} / ${commonData.references.beetsTan2018ESGAR}` : "Rutegård et al. (2025) / ESGAR 2016";


        if (lang === 'de') {
            return `
                <p>Die morphologischen T2-gewichteten Kriterien (Größe [Kurzachse in mm], Form ['rund', 'oval'], Kontur ['scharf', 'irregulär'], Homogenität ['homogen', 'heterogen'] und Signalintensität ['signalarm', 'intermediär', 'signalreich']) wurden für jeden im hochauflösenden T2w-MRT sichtbaren mesorektalen Lymphknoten von denselben zwei Radiologen (ML, AOS) erfasst, die auch das Avocado Sign bewerteten. Die Bewertung erfolgte konsensbasiert und verblindet gegenüber dem pathologischen N-Status und dem Avocado-Sign-Status.</p>
                <p>Für den Vergleich der diagnostischen Güte wurden folgende T2-Kriteriensets herangezogen:</p>
                <ol>
                    <li><strong>Literatur-basierte T2-Kriteriensets:</strong> Eine Auswahl etablierter Kriterien aus der Fachliteratur wurde implementiert und auf die entsprechenden Subgruppen bzw. das Gesamtkollektiv unseres Datensatzes angewendet (Details siehe Tabelle 2):
                        <ul>
                            <li>Koh et al. (${kohRef}): "${kohDesc}". Dieses Set wurde in unserer Analyse auf das Gesamtkollektiv angewendet.</li>
                            <li>Barbaro et al. (${barbaroRef}): "${barbaroDesc}". Dieses Set wurde spezifisch für das nRCT-Kollektiv (Restaging) evaluiert.</li>
                            <li>ESGAR Konsensus Kriterien (2016), evaluiert durch Rutegård et al. (${esgarRef}): "${esgarDesc}". Dieses Set wurde primär auf das Direkt-OP-Kollektiv (Primärstaging) angewendet.</li>
                        </ul>
                    </li>
                    <li><strong>Brute-Force optimierte T2-Kriterien:</strong> Mittels eines im Analyse-Tool implementierten Brute-Force-Algorithmus wurden für jedes der drei Hauptkollektive (Gesamt, Direkt OP, nRCT) diejenigen Kombinationen aus den fünf T2-Merkmalen und einer UND/ODER-Logik identifiziert, welche die primäre Zielmetrik dieser Studie – die <strong>${bfZielMetric}</strong> – maximieren. Die resultierenden, für jedes Kollektiv spezifisch optimierten Kriteriensets waren:
                        ${bfCriteriaTextDe}
                    </li>
                    <li><strong>Im Analyse-Tool aktuell eingestellte T2-Kriterien:</strong> Für explorative Zwecke und zur Demonstration der Flexibilität des Analyse-Tools können benutzerdefinierte Kriterien konfiguriert werden. Für die vorliegende Publikation sind die unter Punkt 1 und 2 genannten Kriterien maßgeblich. Die aktuell im Tool eingestellten Kriterien zum Zeitpunkt der finalen Analyse waren: ${formattedAppliedCriteria}.</li>
                </ol>
                <p>Ein Lymphknoten wurde als T2-positiv für ein gegebenes Kriterienset gewertet, wenn er die spezifischen Bedingungen dieses Sets erfüllte. Ein Patient galt als T2-positiv, wenn mindestens ein Lymphknoten gemäß dem jeweiligen Kriterienset als positiv bewertet wurde.</p>
            `;
        } else {
            return `
                <p>The morphological T2-weighted criteria (size [short-axis diameter in mm], shape ['round', 'oval'], border ['smooth', 'irregular'], homogeneity ['homogeneous', 'heterogeneous'], and signal intensity ['low', 'intermediate', 'high']) were assessed for every mesorectal lymph node visible on high-resolution T2w-MRI by the same two radiologists (ML, AOS) who evaluated the Avocado Sign. The assessment was performed by consensus and blinded to the pathological N-status and the Avocado Sign status.</p>
                <p>For the comparison of diagnostic performance, the following T2 criteria sets were utilized:</p>
                <ol>
                    <li><strong>Literature-based T2 criteria sets:</strong> A selection of established criteria from the literature was implemented and applied to the respective subgroups or the entire cohort of our dataset (details see Table 2):
                        <ul>
                            <li>Koh et al. (${kohRef}): "${kohDesc}". In our analysis, this set was applied to the overall cohort.</li>
                            <li>Barbaro et al. (${barbaroRef}): "${barbaroDesc}". This set was specifically evaluated for the nRCT cohort (restaging).</li>
                            <li>ESGAR Consensus Criteria (2016), as evaluated by Rutegård et al. (${esgarRef}): "${esgarDesc}". This set was primarily applied to the upfront surgery cohort (primary staging).</li>
                        </ul>
                    </li>
                    <li><strong>Brute-force optimized T2 criteria:</strong> Using a brute-force algorithm implemented in the analysis tool, combinations of the five T2 features and AND/OR logic that maximize the primary endpoint of this study – <strong>${bfZielMetric}</strong> – were identified for each of the three main cohorts (Overall, Upfront Surgery, nRCT). The resulting cohort-specific optimized criteria sets were:
                        ${bfCriteriaTextEn}
                    </li>
                    <li><strong>Currently set T2 criteria in the analysis tool:</strong> For exploratory purposes and to demonstrate the flexibility of the analysis tool, user-defined criteria can be configured. For the present publication, the criteria mentioned under points 1 and 2 are authoritative. The criteria currently set in the tool at the time of final analysis were: ${formattedAppliedCriteria}.</li>
                </ol>
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

        if (lang === 'de') {
            return `
                <p>Die deskriptive Statistik umfasste die Berechnung von Medianen, Mittelwerten, Standardabweichungen (SD), Minima und Maxima für kontinuierliche Variablen sowie absolute Häufigkeiten und Prozentanteile für kategoriale Daten. Die diagnostische Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) wurde anhand von Sensitivität, Spezifität, positivem prädiktiven Wert (PPV), negativem prädiktiven Wert (NPV), Accuracy (ACC), Balanced Accuracy (BalAcc) und der Fläche unter der Receiver Operating Characteristic-Kurve (AUC) – bei binären Tests äquivalent zur BalAcc – evaluiert. Für diese Metriken wurden zweiseitige 95%-Konfidenzintervalle (KI) berechnet. Für Proportionen (Sensitivität, Spezifität, PPV, NPV, Accuracy) wurde das Wilson-Score-Intervall verwendet. Für BalAcc (AUC) und den F1-Score wurde die Bootstrap-Perzentil-Methode mit ${bootstrapN} Replikationen angewendet.</p>
                <p>Der statistische Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe (gepaarte Daten) erfolgte mittels des McNemar-Tests für gepaarte nominale Daten bzw. des DeLong-Tests für den Vergleich von AUC-Werten. Der Vergleich von Performance-Metriken zwischen unabhängigen Kollektiven (z.B. Direkt-OP vs. nRCT-Gruppe) erfolgte mittels Fisher's Exact Test für Raten (wie Accuracy) und mittels Z-Test für den Vergleich von AUC-Werten basierend auf deren Bootstrap-Standardfehlern. Ein p-Wert < ${alphaText} wurde als statistisch signifikant interpretiert. Alle statistischen Analysen wurden mit der oben genannten, speziell entwickelten Webanwendung (${appName} v${appVersion}) durchgeführt, die auf Standardbibliotheken für statistische Berechnungen und JavaScript basiert.</p>
            `;
        } else {
            return `
                <p>Descriptive statistics included the calculation of medians, means, standard deviations (SD), minima, and maxima for continuous variables, as well as absolute frequencies and percentages for categorical data. The diagnostic performance of the Avocado Sign and the various T2 criteria sets (literature-based and brute-force optimized) was evaluated using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy (ACC), balanced accuracy (BalAcc), and the area under the Receiver Operating Characteristic curve (AUC)—equivalent to BalAcc for binary tests. Two-sided 95% confidence intervals (CI) were calculated for these metrics. The Wilson score interval was used for proportions (sensitivity, specificity, PPV, NPV, accuracy). For BalAcc (AUC) and F1-score, the bootstrap percentile method with ${bootstrapN} replications was applied.</p>
                <p>Statistical comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group (paired data) was performed using McNemar's test for paired nominal data and DeLong's test for AUC comparison. Comparison of performance metrics between independent cohorts (e.g., upfront surgery vs. nRCT group) was conducted using Fisher's exact test for rates (such as accuracy) and a Z-test for AUC comparison based on their bootstrap standard errors. A p-value < ${alphaText} was considered statistically significant. All statistical analyses were conducted using the aforementioned custom-developed web application (${appName} v${appVersion}), which is based on standard libraries for statistical computations and JavaScript.</p>
            `;
        }
    }

    function getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const anteilNplusGesamt = formatPercent(pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN, 1);

        if (lang === 'de') {
            return `
                <p>Die Charakteristika der ${anzahlGesamt} in die Studie eingeschlossenen Patienten sind in Tabelle 1 zusammengefasst. Das Gesamtkollektiv bestand aus ${anzahlDirektOP} Patienten, die primär operiert wurden (Direkt-OP-Gruppe), und ${anzahlNRCT} Patienten, die eine neoadjuvante Radiochemotherapie erhielten (nRCT-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', false)} Jahre (Range ${formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', false)}–${formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', false)}), und ${formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN,0)} waren männlich. Ein histopathologisch gesicherter positiver Lymphknotenstatus (N+) fand sich bei ${pCharGesamt?.nStatus?.plus || 'N/A'} von ${anzahlGesamt} Patienten (${anteilNplusGesamt}) im Gesamtkollektiv. Die Verteilung von Alter und Geschlecht im Gesamtkollektiv ist in Abbildung 1a und 1b dargestellt.</p>
            `;
        } else {
            return `
                <p>The characteristics of the ${anzahlGesamt} patients included in the study are summarized in Table 1. The overall cohort consisted of ${anzahlDirektOP} patients who underwent upfront surgery (upfront surgery group) and ${anzahlNRCT} patients who received neoadjuvant chemoradiotherapy (nRCT group). The median age in the overall cohort was ${formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', true)} years (range ${formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', true)}–${formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', true)}), and ${formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN,0)} were male. A histopathologically confirmed positive lymph node status (N+) was found in ${pCharGesamt?.nStatus?.plus || 'N/A'} of ${anzahlGesamt} patients (${anteilNplusGesamt}) in the overall cohort. The age and gender distribution in the overall cohort is shown in Figure 1a and 1b.</p>
            `;
        }
    }

    function getErgebnisseASPerformanceText(lang, allKollektivStats, commonData) {
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const asDirektOP = allKollektivStats?.['direkt OP']?.gueteAS;
        const asNRCT = allKollektivStats?.nRCT?.gueteAS;

        const nGesamt = commonData.nGesamt || 'N/A';
        const nDirektOP = commonData.nDirektOP || 'N/A';
        const nNRCT = commonData.nNRCT || 'N/A';

        if (lang === 'de') {
            return `
                <p>Die diagnostische Güte des Avocado Signs (AS) zur Vorhersage des pathologischen N-Status ist für das Gesamtkollektiv und die Subgruppen in Tabelle 3 detailliert aufgeführt. Im Gesamtkollektiv (N=${nGesamt}) erreichte das AS eine Sensitivität von ${fCI(asGesamt?.sens, 1, true, 'de')}, eine Spezifität von ${fCI(asGesamt?.spez, 1, true, 'de')}, einen positiven prädiktiven Wert (PPV) von ${fCI(asGesamt?.ppv, 1, true, 'de')}, einen negativen prädiktiven Wert (NPV) von ${fCI(asGesamt?.npv, 1, true, 'de')} und eine Accuracy von ${fCI(asGesamt?.acc, 1, true, 'de')}. Die AUC (Balanced Accuracy) betrug ${fCI(asGesamt?.auc, 3, false, 'de')}.</p>
                <p>In der Subgruppe der primär operierten Patienten (Direkt-OP-Gruppe, N=${nDirektOP}) zeigte das AS eine Sensitivität von ${fCI(asDirektOP?.sens, 1, true, 'de')} und eine Spezifität von ${fCI(asDirektOP?.spez, 1, true, 'de')} (AUC: ${fCI(asDirektOP?.auc, 3, false, 'de')}). Bei Patienten nach nRCT (nRCT-Gruppe, N=${nNRCT}) betrug die Sensitivität ${fCI(asNRCT?.sens, 1, true, 'de')} und die Spezifität ${fCI(asNRCT?.spez, 1, true, 'de')} (AUC: ${fCI(asNRCT?.auc, 3, false, 'de')}).</p>
            `;
        } else {
            return `
                <p>The diagnostic performance of the Avocado Sign (AS) for predicting pathological N-status is detailed in Table 3 for the overall cohort and subgroups. In the overall cohort (n=${nGesamt}), the AS achieved a sensitivity of ${fCI(asGesamt?.sens, 1, true, 'en')}, a specificity of ${fCI(asGesamt?.spez, 1, true, 'en')}, a positive predictive value (PPV) of ${fCI(asGesamt?.ppv, 1, true, 'en')}, a negative predictive value (NPV) of ${fCI(asGesamt?.npv, 1, true, 'en')}, and an accuracy of ${fCI(asGesamt?.acc, 1, true, 'en')}. The AUC (Balanced Accuracy) was ${fCI(asGesamt?.auc, 3, false, 'en')}.</p>
                <p>In the subgroup of patients undergoing upfront surgery (Direct OP group, n=${nDirektOP}), the AS showed a sensitivity of ${fCI(asDirektOP?.sens, 1, true, 'en')} and a specificity of ${fCI(asDirektOP?.spez, 1, true, 'en')} (AUC: ${fCI(asDirektOP?.auc, 3, false, 'en')}). For patients after nRCT (nRCT group, n=${nNRCT}), the sensitivity was ${fCI(asNRCT?.sens, 1, true, 'en')} and the specificity was ${fCI(asNRCT?.spez, 1, true, 'en')} (AUC: ${fCI(asNRCT?.auc, 3, false, 'en')}).</p>
            `;
        }
    }

    function getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData) {
        const kohData = allKollektivStats?.Gesamt?.gueteT2_literatur?.['koh_2008_morphology'];
        const barbaroData = allKollektivStats?.nRCT?.gueteT2_literatur?.['barbaro_2024_restaging'];
        const esgarData = allKollektivStats?.['direkt OP']?.gueteT2_literatur?.['rutegard_et_al_esgar'];

        const nGesamt = commonData.nGesamt || 'N/A';
        const nNRCT = commonData.nNRCT || 'N/A';
        const nDirektOP = commonData.nDirektOP || 'N/A';

        if (lang === 'de') {
            let text = `<p>Die diagnostische Güte der evaluierten Literatur-basierten T2-Kriteriensets ist in Tabelle 4 zusammengefasst. `;
            text += `Für das Kriterienset nach Koh et al. (2008), angewendet auf das Gesamtkollektiv (N=${nGesamt}), ergab sich eine Sensitivität von ${fCI(kohData?.sens, 1, true, 'de')} und eine Spezifität von ${fCI(kohData?.spez, 1, true, 'de')} (AUC ${fCI(kohData?.auc, 3, false, 'de')}). `;
            text += `Die Kriterien nach Barbaro et al. (2024), angewendet auf das nRCT-Kollektiv (N=${nNRCT}), zeigten eine Sensitivität von ${fCI(barbaroData?.sens, 1, true, 'de')} und eine Spezifität von ${fCI(barbaroData?.spez, 1, true, 'de')} (AUC ${fCI(barbaroData?.auc, 3, false, 'de')}). `;
            text += `Die ESGAR 2016 Kriterien (evaluiert durch Rutegård et al., 2025), angewendet auf das Direkt-OP-Kollektiv (N=${nDirektOP}), erreichten eine Sensitivität von ${fCI(esgarData?.sens, 1, true, 'de')} und eine Spezifität von ${fCI(esgarData?.spez, 1, true, 'de')} (AUC ${fCI(esgarData?.auc, 3, false, 'de')}).</p>`;
            return text;
        } else {
            let text = `<p>The diagnostic performance of the evaluated literature-based T2 criteria sets is summarized in Table 4. `;
            text += `For the criteria set according to Koh et al. (2008), applied to the overall cohort (n=${nGesamt}), a sensitivity of ${fCI(kohData?.sens, 1, true, 'en')} and a specificity of ${fCI(kohData?.spez, 1, true, 'en')} (AUC ${fCI(kohData?.auc, 3, false, 'en')}) were observed. `;
            text += `The criteria by Barbaro et al. (2024), applied to the nRCT cohort (n=${nNRCT}), showed a sensitivity of ${fCI(barbaroData?.sens, 1, true, 'en')} and a specificity of ${fCI(barbaroData?.spez, 1, true, 'en')} (AUC ${fCI(barbaroData?.auc, 3, false, 'en')}). `;
            text += `The ESGAR 2016 criteria (evaluated by Rutegård et al., 2025), applied to the upfront surgery cohort (n=${nDirektOP}), achieved a sensitivity of ${fCI(esgarData?.sens, 1, true, 'en')} and a specificity of ${fCI(esgarData?.spez, 1, true, 'en')} (AUC ${fCI(esgarData?.auc, 3, false, 'en')}).</p>`;
            return text;
        }
    }

    function getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData) {
        const bfZielMetric = PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        let text = '';

        if (lang === 'de') {
            text += `<p>Mittels eines Brute-Force-Algorithmus wurden für jedes der drei Kollektive spezifische T2-Kriteriensets identifiziert, welche die ${bfZielMetric} maximieren. Die Definition dieser optimierten Kriteriensets ist im Methodenteil (Abschnitt 2.5) und Tabelle 2 aufgeführt. Die diagnostische Güte dieser optimierten Sets ist in Tabelle 5 dargestellt.</p><ul>`;
        } else {
            text += `<p>Using a brute-force algorithm, specific T2 criteria sets maximizing ${bfZielMetric} were identified for each of the three cohorts. The definition of these optimized criteria sets is detailed in the Methods section (Section 2.5) and Table 2. The diagnostic performance of these optimized sets is presented in Table 5.</p><ul>`;
        }

        const kollektive = [
            { id: 'Gesamt', nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort', n: commonData.nGesamt },
            { id: 'direkt OP', nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort', n: commonData.nDirektOP },
            { id: 'nRCT', nameDe: 'nRCT-Kollektiv', nameEn: 'nRCT cohort', n: commonData.nNRCT }
        ];

        kollektive.forEach(k => {
            const bfStats = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            const nPat = k.n || 'N/A';
            if (bfStats && bfStats.matrix) {
                text += `<li>Für das ${name} (N=${nPat}) erreichten die optimierten Kriterien eine Sensitivität von ${fCI(bfStats?.sens, 1, true, lang)}, eine Spezifität von ${fCI(bfStats?.spez, 1, true, lang)} und eine AUC von ${fCI(bfStats?.auc, 3, false, lang)}.</li>`;
            } else {
                text += `<li>Für das ${name} (N=${nPat}) konnten keine validen optimierten Kriterien für die Zielmetrik ${bfZielMetric} ermittelt oder deren Performance berechnet werden.</li>`;
            }
        });
        text += `</ul>`;
        return text;
    }

    function getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData) {
        let text = '';
        const bfZielMetric = PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        if (lang === 'de') {
            text += `<p>Der direkte statistische Vergleich der diagnostischen Güte zwischen dem Avocado Sign (AS) und den ausgewählten T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) ist in Tabelle 6 zusammengefasst. Abbildung 2 visualisiert die Schlüsselmetriken vergleichend für die drei Kollektive.</p>`;
        } else {
            text += `<p>The direct statistical comparison of diagnostic performance between the Avocado Sign (AS) and the selected T2 criteria sets (literature-based and brute-force optimized) is summarized in Table 6. Figure 2 provides a comparative visualization of key metrics across the three cohorts.</p>`;
        }

        const kollektive = [
            { id: 'Gesamt', nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort', litSetId: 'koh_2008_morphology', litSetName: 'Koh et al.' },
            { id: 'direkt OP', nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort', litSetId: 'rutegard_et_al_esgar', litSetName: 'ESGAR 2016 (Rutegård et al.)' },
            { id: 'nRCT', nameDe: 'nRCT-Kollektiv', nameEn: 'nRCT cohort', litSetId: 'barbaro_2024_restaging', litSetName: 'Barbaro et al.' }
        ];

        kollektive.forEach(k => {
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            const statsAS = allKollektivStats?.[k.id]?.gueteAS;
            const statsLit = allKollektivStats?.[k.id]?.gueteT2_literatur?.[k.litSetId];
            const statsBF = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;

            const vergleichASvsLit = allKollektivStats?.[k.id]?.[`vergleichASvsT2_literatur_${k.litSetId}`];
            const vergleichASvsBF = allKollektivStats?.[k.id]?.vergleichASvsT2_bruteforce;

            let diffAucLitStr = formatNumber(vergleichASvsLit?.delong?.diffAUC, 3, 'N/A', true);
            if (lang === 'de' && diffAucLitStr !== 'N/A' && typeof diffAucLitStr === 'string') {
                diffAucLitStr = diffAucLitStr.replace('.', ',');
            }

            let diffAucBfStr = formatNumber(vergleichASvsBF?.delong?.diffAUC, 3, 'N/A', true);
            if (lang === 'de' && diffAucBfStr !== 'N/A' && typeof diffAucBfStr === 'string') {
                diffAucBfStr = diffAucBfStr.replace('.', ',');
            }


            if (lang === 'de') {
                text += `<h4>Vergleich im ${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Im Vergleich des AS (AUC ${fCI(statsAS.auc, 3, false, 'de')}) mit den Kriterien nach ${k.litSetName} (AUC ${fCI(statsLit.auc, 3, false, 'de')}) zeigte sich für die Accuracy ein p-Wert von ${getPValueText(vergleichASvsLit.mcnemar?.pValue, 'de')} (McNemar) und für die AUC ein p-Wert von ${getPValueText(vergleichASvsLit.delong?.pValue, 'de')} (DeLong). Der Unterschied in der AUC betrug ${diffAucLitStr}.</p>`;
                } else {
                    text += `<p>Ein Vergleich zwischen AS und den Kriterien nach ${k.litSetName} konnte nicht vollständig durchgeführt werden (fehlende Daten).</p>`;
                }
                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Gegenüber den für die ${bfDef.metricName} optimierten T2-Kriterien (AUC ${fCI(statsBF.auc, 3, false, 'de')}) ergab sich für die Accuracy ein p-Wert von ${getPValueText(vergleichASvsBF.mcnemar?.pValue, 'de')} (McNemar) und für die AUC ein p-Wert von ${getPValueText(vergleichASvsBF.delong?.pValue, 'de')} (DeLong). Der Unterschied in der AUC betrug ${diffAucBfStr}.</p>`;
                } else {
                    text += `<p>Ein Vergleich zwischen AS und den Brute-Force-optimierten Kriterien konnte nicht vollständig durchgeführt werden (fehlende Daten oder keine BF-Optimierung für dieses Kollektiv für die Zielmetrik ${bfZielMetric}).</p>`;
                }
            } else { // lang === 'en'
                text += `<h4>Comparison in the ${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Comparing AS (AUC ${fCI(statsAS.auc, 3, false, 'en')}) with the criteria by ${k.litSetName} (AUC ${fCI(statsLit.auc, 3, false, 'en')}), the p-value for accuracy was ${getPValueText(vergleichASvsLit.mcnemar?.pValue, 'en')} (McNemar) and for AUC was ${getPValueText(vergleichASvsLit.delong?.pValue, 'en')} (DeLong). The difference in AUC was ${diffAucLitStr}.</p>`;
                } else {
                    text += `<p>A full comparison between AS and the criteria by ${k.litSetName} could not be performed (missing data).</p>`;
                }
                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Compared to the T2 criteria optimized for ${bfDef.metricName} (AUC ${fCI(statsBF.auc, 3, false, 'en')}), the p-value for accuracy was ${getPValueText(vergleichASvsBF.mcnemar?.pValue, 'en')} (McNemar) and for AUC was ${getPValueText(vergleichASvsBF.delong?.pValue, 'en')} (DeLong). The difference in AUC was ${diffAucBfStr}.</p>`;
                } else {
                    text += `<p>A full comparison between AS and the brute-force optimized criteria could not be performed (missing data or no BF optimization for this cohort for the target metric ${bfZielMetric}).</p>`;
                }
            }
        });
        return text;
    }


    function getSectionText(sectionId, lang, publicationData, kollektiveData, commonData) {
        switch (sectionId) {
            case 'methoden_studienanlage': return getMethodenStudienanlageText(lang, commonData);
            case 'methoden_patientenkollektiv': return getMethodenPatientenkollektivText(lang, publicationData, commonData);
            case 'methoden_mrt_protokoll': return getMethodenMRTProtokollText(lang, commonData);
            case 'methoden_as_definition': return getMethodenASDefinitionText(lang, commonData);
            case 'methoden_t2_definition': return getMethodenT2DefinitionText(lang, commonData, kollektiveData);
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
            .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, (match, p1) => `\n${'#'.repeat(parseInt(match[2] || (match[0].match(/<h(\d)/)?.[1] || 1) ))} ${p1}\n`)
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
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
