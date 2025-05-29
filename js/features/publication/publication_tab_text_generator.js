const publicationTextGenerator = (() => {

    function fCI(metric, digits = 1, isPercent = true, lang = 'de') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value) || !isFinite(metric.value)) return 'N/A';

        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 'N/A';
            let numStrToFormat = val;
            let formattedNum;
            if (isP) {
                formattedNum = formatPercent(numStrToFormat, d, 'N/A');
            } else {
                formattedNum = formatNumber(numStrToFormat, d, 'N/A', lang === 'en');
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

            if(isPercent && typeof valStr === 'string' && typeof lowerStr === 'string' && typeof upperStr === 'string'){
                mainValForDisplay = valStr.replace('%','');
                lowerValForDisplay = lowerStr.replace('%','');
                upperValForDisplay = upperStr.replace('%','');
                return `${mainValForDisplay} (${ciText}: ${lowerValForDisplay}\u00A0\u2013\u00A0${upperValForDisplay})%`;
            } else {
                 return `${mainValForDisplay} (${ciText}: ${lowerValForDisplay}\u00A0\u2013\u00A0${upperValForDisplay})`;
            }
        }
        return valStr;
    }

    function getKollektivText(kollektivId, nPat, lang = 'de') {
        const name = getKollektivDisplayName(kollektivId);
        const nText = lang === 'de' ? `N=\u2009${nPat}` : `n=\u2009${nPat}`;
        return `${name} (${nText})`;
    }

    function _getSafeLink(elementId){
        return `#${elementId}`;
    }

    function _formatPValueForText(pValue, lang = 'de') {
        if (pValue === null || pValue === undefined || isNaN(pValue) || !isFinite(pValue)) return 'N/A';
        if (pValue < 0.001) return lang === 'de' ? "p\u00A0<\u00A00,001" : "P\u00A0<\u00A0.001";
        return `${lang === 'de' ? 'p' : 'P'}\u00A0=\u00A0${formatNumber(pValue, 3, 'N/A', lang === 'en')}`;
    }

    function _getStatTestName(testResult, lang = 'de') {
        if (!testResult || !testResult.method) return lang === 'de' ? 'Testmethode nicht spezifiziert' : 'Test method not specified';
        return testResult.method;
    }

    function _getFullCitation(key, lang = 'de') {
        const ref = PUBLICATION_CONFIG.referenceManagement.references.find(r => r.key === key);
        return ref ? ref.text : `[Referenz ${key} nicht gefunden]`;
    }

    function getMethodenStudienanlageEthikText(lang, commonData, allKollektivStats) {
        const appName = commonData.appName || APP_CONFIG.APP_NAME;
        const appVersion = commonData.appVersion || APP_CONFIG.APP_VERSION;
        const ethicsVote = commonData.references?.ethicsVote || "Ethikvotum Nr. XYZ/2023, Ethikkommission Musterstadt";
        const lurzSchaefer2025Ref = `[${PUBLICATION_CONFIG.referenceManagement.references.find(r=>r.key === 'Lurz2025')?.text.split('.')[0]}]`;


        if (lang === 'de') {
            return `
                <p>Diese Studie wurde als retrospektive Analyse eines prospektiv dokumentierten, monozentrischen Kollektivs von Patienten mit histologisch gesichertem Rektumkarzinom konzipiert. Das primäre Studienkollektiv und die zugrundeliegenden Bilddatensätze sind identisch mit jenen der Originalpublikation zum Avocado Sign ${lurzSchaefer2025Ref}. Ziel der vorliegenden Untersuchung ist ein detaillierter Vergleich der diagnostischen Güte des Avocado Signs mit verschiedenen T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status).</p>
                <p>Alle Analysen wurden mittels einer interaktiven Webanwendung (${appName}, Version ${appVersion}) durchgeführt. Dieses Werkzeug ermöglicht die flexible Definition und Anwendung von T2-Kriteriensets, eine automatisierte Optimierung von Kriterienkombinationen mittels eines Brute-Force-Algorithmus sowie eine umfassende statistische Auswertung. Die Studie wurde in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki (revidierte Fassung) durchgeführt. Das Studienprotokoll wurde von der zuständigen Ethikkommission genehmigt (${ethicsVote}). Aufgrund des retrospektiven Charakters der Analyse und der Verwendung pseudonymisierter Daten wurde auf ein erneutes Einholen eines schriftlichen Einverständnisses der Patienten für diese spezifische Auswertung verzichtet, da ein generelles Einverständnis zur wissenschaftlichen Auswertung im Rahmen der Primärstudie vorlag.</p>
            `;
        } else {
            return `
                <p>This study was designed as a retrospective analysis of a prospectively documented, single-center cohort of patients with histologically confirmed rectal cancer. The primary study cohort and the underlying imaging datasets are identical to those of the original publication on the Avocado Sign ${lurzSchaefer2025Ref}. The objective of the present investigation is a detailed comparison of the diagnostic performance of the Avocado Sign with various T2-weighted morphological criteria for predicting mesorectal lymph node status (N-status).</p>
                <p>All analyses were performed using an interactive web application (${appName}, version ${appVersion}). This tool allows for the flexible definition and application of T2 criteria sets, automated optimization of criteria combinations using a brute-force algorithm, and comprehensive statistical evaluation. The study was conducted in accordance with the principles of the Declaration of Helsinki (revised version). The study protocol was approved by the responsible ethics committee (${ethicsVote}). Given the retrospective nature of this analysis and the use of pseudonymized data, the need for re-obtaining written informed consent from patients for this specific evaluation was waived by the ethics committee, as general consent for scientific evaluation was provided as part of the primary study.</p>
            `;
        }
    }

    function getMethodenPatientenkohorteText(lang, commonData, allKollektivStats) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const studienzeitraum = commonData.references?.lurzSchaefer2025StudyPeriod || "Januar 2020 und November 2023";
        const alterMedian = formatNumber(pCharGesamt?.alter?.median, 1, 'N/A', lang === 'en');
        const alterMin = formatNumber(pCharGesamt?.alter?.min, 0, 'N/A', lang === 'en');
        const alterMax = formatNumber(pCharGesamt?.alter?.max, 0, 'N/A', lang === 'en');
        const anzahlPatientenChar = pCharGesamt?.anzahlPatienten || 0;
        const anzahlMaenner = pCharGesamt?.geschlecht?.m || 0;
        const anteilMaennerProzent = formatPercent(anzahlPatientenChar > 0 ? anzahlMaenner / anzahlPatientenChar : NaN, 0);
        const table1Id = PUBLICATION_CONFIG.publicationElements.tables.patientCharacteristics.id;
        const fig1Id = PUBLICATION_CONFIG.publicationElements.figures.consortDiagram.id;
        const lurzSchaefer2025Ref = `[${PUBLICATION_CONFIG.referenceManagement.references.find(r=>r.key === 'Lurz2025')?.text.split('.')[0]}]`;


        if (lang === 'de') {
            return `
                <p>Das Studienkollektiv umfasste ${anzahlGesamt} konsekutive Patienten mit histologisch gesichertem Rektumkarzinom, die zwischen ${studienzeitraum} an der Referenzinstitution behandelt und in die initiale Avocado-Sign-Studie ${lurzSchaefer2025Ref} eingeschlossen wurden. Detaillierte Einschluss- und Ausschlusskriterien sind der Originalpublikation zu entnehmen. Von diesen Patienten erhielten ${anzahlNRCT} eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während ${anzahlDirektOP} Patienten primär operiert wurden (Direkt-OP-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${alterMedian} Jahre (Spannweite: ${alterMin}\u2009\u2013\u2009${alterMax} Jahre), und ${anteilMaennerProzent} (${anzahlMaenner}/${anzahlPatientenChar}) der Patienten waren männlich. Ein Flussdiagramm der Patientenselektion ist in <a href="${_getSafeLink(fig1Id)}">Abbildung 1</a> dargestellt. Detaillierte Patientencharakteristika, stratifiziert nach Behandlungsgruppen, sind in <a href="${_getSafeLink(table1Id)}">Tabelle 1</a> aufgeführt.</p>
            `;
        } else {
            return `
                <p>The study cohort comprised ${anzahlGesamt} consecutive patients with histologically confirmed rectal cancer who were treated at the reference institution between ${studienzeitraum} and included in the initial Avocado Sign study ${lurzSchaefer2025Ref}. Detailed inclusion and exclusion criteria can be found in the original publication. Of these patients, ${anzahlNRCT} received neoadjuvant chemoradiotherapy (nRCT group), while ${anzahlDirektOP} patients underwent upfront surgery (upfront surgery group). The median age in the overall cohort was ${alterMedian} years (range: ${alterMin}\u2009\u2013\u00A0${alterMax} years), and ${anteilMaennerProzent} (${anzahlMaenner}/${anzahlPatientenChar}) were male. A flowchart of patient selection is presented in <a href="${_getSafeLink(fig1Id)}">Figure 1</a>. Detailed patient characteristics, stratified by treatment group, are presented in <a href="${_getSafeLink(table1Id)}">Table 1</a>.</p>
            `;
        }
    }

    function getMethodenBildakquisitionText(lang, commonData, allKollektivStats) {
        const mrtSystem = commonData.references?.lurzSchaefer2025MRISystem || "einem 3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers)";
        const kontrastmittel = commonData.references?.lurzSchaefer2025ContrastAgent || "Gadoteridol (ProHance; Bracco)";
        const t2SliceThickness = commonData.references?.lurzSchaefer2025T2SliceThickness || "2-3 mm";
        const tableMrtId = PUBLICATION_CONFIG.publicationElements.tables.mrtSequences.id;

         if (lang === 'de') {
            return `
                <p>Alle MRT-Untersuchungen wurden an ${mrtSystem} unter Verwendung von Körper- und Wirbelsäulen-Array-Spulen durchgeführt. Das standardisierte Bildgebungsprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Ebene (Schichtdicke ${t2SliceThickness}), eine axiale diffusionsgewichtete Sequenz (DWI) sowie eine kontrastmittelverstärkte axiale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung für die Bewertung des Avocado Signs. Detaillierte Sequenzparameter sind in <a href="${_getSafeLink(tableMrtId)}">Tabelle 2</a> zusammengefasst.</p>
                <p>Ein makrozyklisches Gadolinium-basiertes Kontrastmittel (${kontrastmittel}) wurde gewichtsadaptiert (0,2 ml/kg Körpergewicht) intravenös verabreicht. Die kontrastmittelverstärkten Aufnahmen erfolgten unmittelbar nach vollständiger Applikation des Kontrastmittels. Butylscopolamin wurde zur Reduktion von Bewegungsartefakten appliziert. Das Bildgebungsprotokoll war für die primäre Staging-Untersuchung und die Restaging-Untersuchung (bei Patienten der nRCT-Gruppe) identisch.</p>
            `;
        } else {
            return `
                <p>All MRI examinations were performed on ${mrtSystem} using body and spine array coils. The standardized imaging protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal planes (slice thickness ${t2SliceThickness}), axial diffusion-weighted imaging (DWI), and contrast-enhanced axial T1-weighted volumetric interpolated breath-hold examination (VIBE) with Dixon fat suppression for Avocado Sign assessment. Detailed sequence parameters are summarized in <a href="${_getSafeLink(tableMrtId)}">Table 2</a>.</p>
                <p>A macrocyclic gadolinium-based contrast agent (${kontrastmittel}) was administered intravenously at a weight-based dose (0.2 mL/kg body weight). Contrast-enhanced images were acquired immediately after the full administration of the contrast agent. Butylscopolamine was administered to reduce motion artifacts. The imaging protocol was identical for baseline staging and restaging examinations (in patients from the nRCT group).</p>
            `;
        }
    }
    function getMethodenBildanalyseText(lang, commonData, allKollektivStats) {
        const lurzSchaefer2025Ref = `[${PUBLICATION_CONFIG.referenceManagement.references.find(r=>r.key === 'Lurz2025')?.text.split('.')[0]}]`;
        const radiologistExperience = commonData.references?.lurzSchaefer2025RadiologistExperience || ["29", "7", "19"];
        const figAvocadoExamplesId = PUBLICATION_CONFIG.publicationElements.figures.avocadoSignExamples.id;
        const tableLiteraturT2Id = PUBLICATION_CONFIG.publicationElements.tables.literatureT2CriteriaOverview.id;
        const bfOptimizedMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        let bfCriteriaTextList = '';
        const kollektiveBF = ['Gesamt', 'direkt OP', 'nRCT'];
        kollektiveBF.forEach(kolId => {
            const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;
            const displayName = getKollektivDisplayName(kolId);
            if (bfDef && bfDef.criteria) {
                const metricValueStr = formatNumber(bfDef.metricValue, 4, 'N/A', lang === 'en');
                const metricNameDisplay = bfDef.metricName || bfOptimizedMetric;
                const formattedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, false);
                bfCriteriaTextList += `<li><strong>${displayName}:</strong> ${formattedCriteria} (${lang === 'de' ? 'optimiert für' : 'optimized for'} ${metricNameDisplay}, ${lang === 'de' ? 'Wert' : 'value'}: ${metricValueStr})</li>`;
            } else {
                bfCriteriaTextList += `<li><strong>${displayName}:</strong> ${lang === 'de' ? `Keine Optimierungsergebnisse für Zielmetrik '${bfOptimizedMetric}' verfügbar.` : `No optimization results available for target metric '${bfOptimizedMetric}'.`}</li>`;
            }
        });


        if (lang === 'de') {
            return `
                <p><strong>Avocado Sign (AS):</strong> Das AS wurde, wie in der Originalstudie ${lurzSchaefer2025Ref} definiert, auf den kontrastmittelverstärkten T1-gewichteten Bildern evaluiert. Es ist charakterisiert als ein klar abgrenzbarer, hypointenser Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens, unabhängig von dessen Größe oder Form (siehe <a href="${_getSafeLink(figAvocadoExamplesId)}">Abbildung 2</a>). Die Bewertung erfolgte für alle im T1KM-MRT sichtbaren mesorektalen Lymphknoten. Ein Patient wurde als AS-positiv (AS+) eingestuft, wenn mindestens ein Lymphknoten dieses Zeichen aufwies. Die Bildanalyse wurde von zwei Radiologen (Erfahrung: ${radiologistExperience[0]} bzw. ${radiologistExperience[1]} Jahre in der abdominellen MRT) unabhängig und verblindet gegenüber den histopathologischen Ergebnissen und den T2-Merkmalen vorgenommen. Diskrepanzen wurden im Konsens mit einem dritten Radiologen (Erfahrung: ${radiologistExperience[2]} Jahre) gelöst. Für Patienten der nRCT-Gruppe erfolgte die AS-Bewertung auf den Restaging-MRT-Bildern.</p>
                <p><strong>T2-gewichtete Kriterien:</strong> Die morphologischen T2-Kriterien (Größe [Kurzachse in mm], Form ['rund', 'oval'], Kontur ['scharf', 'irregulär'], Homogenität ['homogen', 'heterogen'] und Signalintensität ['signalarm', 'intermediär', 'signalreich']) wurden für jeden im hochauflösenden T2w-MRT sichtbaren mesorektalen Lymphknoten von denselben zwei Radiologen erfasst. Die Bewertung erfolgte konsensbasiert und verblindet gegenüber dem pathologischen N-Status und dem AS-Status. Für den Vergleich wurden folgende T2-Kriteriensets herangezogen:</p>
                <ol>
                    <li><strong>Literatur-basierte T2-Kriteriensets:</strong> Eine Auswahl etablierter Kriterien aus der Fachliteratur (<a href="${_getSafeLink(tableLiteraturT2Id)}">Tabelle 3</a>) wurde implementiert und auf die entsprechenden Subgruppen bzw. das Gesamtkollektiv unseres Datensatzes angewendet. Dies umfasste Kriterien nach Koh et al. [${PUBLICATION_CONFIG.literatureCriteriaSets.find(s=>s.id==='koh_2008_morphology').citationKey}], Barbaro et al. [${PUBLICATION_CONFIG.literatureCriteriaSets.find(s=>s.id==='barbaro_2024_restaging').citationKey}] und die ESGAR 2016 Konsensus Kriterien, evaluiert durch Rutegård et al. [${PUBLICATION_CONFIG.literatureCriteriaSets.find(s=>s.id==='rutegard_et_al_esgar').citationKey}].</li>
                    <li><strong>Brute-Force optimierte T2-Kriteriensets:</strong> Mittels eines Algorithmus wurden für jedes der drei Hauptkollektive (Gesamt, Direkt OP, nRCT) diejenigen Kombinationen aus den fünf T2-Merkmalen und einer UND/ODER-Logik identifiziert, welche die Zielmetrik '${bfOptimizedMetric}' maximieren. Die resultierenden Kriteriensets waren:<ul>${bfCriteriaTextList}</ul></li>
                </ol>
                <p>Ein Lymphknoten wurde als T2-positiv für ein gegebenes Kriterienset gewertet, wenn er die spezifischen Bedingungen dieses Sets erfüllte. Ein Patient galt als T2-positiv, wenn mindestens ein Lymphknoten gemäß dem jeweiligen Kriterienset als positiv bewertet wurde.</p>
            `;
        } else {
            return `
                <p><strong>Avocado Sign (AS):</strong> The AS was evaluated on contrast-enhanced T1-weighted images as defined in the original study ${lurzSchaefer2025Ref}. It is characterized by a distinct, hypointense core within an otherwise homogeneously hyperintense lymph node, regardless of its size or shape (see <a href="${_getSafeLink(figAvocadoExamplesId)}">Figure 2</a>). Assessment was performed for all visible mesorectal lymph nodes on T1-weighted contrast-enhanced MRI. A patient was classified as AS-positive (AS+) if at least one lymph node exhibited this sign. Image analysis was performed by two radiologists (experience: ${radiologistExperience[0]} and ${radiologistExperience[1]} years in abdominal MRI, respectively) independently and blinded to histopathological results and T2-weighted features. Discrepancies were resolved by consensus with a third radiologist (experience: ${radiologistExperience[2]} years). For patients in the nRCT group, AS assessment was performed on restaging MRI images.</p>
                <p><strong>T2-weighted Criteria:</strong> The morphological T2-weighted criteria (size [short-axis diameter in mm], shape ['round', 'oval'], border ['smooth/sharp', 'irregular'], homogeneity ['homogeneous', 'heterogeneous'], and signal intensity ['low', 'intermediate', 'high']) were assessed for every mesorectal lymph node visible on high-resolution T2w-MRI by the same two radiologists. Assessment was by consensus and blinded to pathological N-status and AS status. The following T2 criteria sets were used for comparison:</p>
                <ol>
                    <li><strong>Literature-based T2 criteria sets:</strong> A selection of established criteria from the literature (<a href="${_getSafeLink(tableLiteraturT2Id)}">Table 3</a>) was implemented and applied to the respective subgroups or the entire cohort of our dataset. This included criteria according to Koh et al. [${PUBLICATION_CONFIG.literatureCriteriaSets.find(s=>s.id==='koh_2008_morphology').citationKey}], Barbaro et al. [${PUBLICATION_CONFIG.literatureCriteriaSets.find(s=>s.id==='barbaro_2024_restaging').citationKey}], and the ESGAR 2016 Consensus Criteria as evaluated by Rutegård et al. [${PUBLICATION_CONFIG.literatureCriteriaSets.find(s=>s.id==='rutegard_et_al_esgar').citationKey}].</li>
                    <li><strong>Brute-force optimized T2 criteria sets:</strong> Using an algorithm, combinations of the five T2 features and AND/OR logic that maximize the target metric '${bfOptimizedMetric}' were identified for each of the three main cohorts (Overall, Upfront Surgery, nRCT). The resulting criteria sets were:<ul>${bfCriteriaTextList}</ul></li>
                </ol>
                <p>A lymph node was considered T2-positive for a given criteria set if it met the specific conditions of that set. A patient was considered T2-positive if at least one lymph node was rated positive according to the respective criteria set.</p>
            `;
        }
    }

    function getMethodenReferenzstandardText(lang, commonData, allKollektivStats) {
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

    function getMethodenStatistischeAnalyseText(lang, commonData, allKollektivStats) {
        const alphaLevel = commonData.significanceLevel || 0.05;
        const alphaText = formatNumber(alphaLevel, 2, '0.05', true).replace('.', lang === 'de' ? ',' : '.');
        const bootstrapN = commonData.bootstrapReplications || APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS;
        const appName = commonData.appName || APP_CONFIG.APP_NAME;
        const appVersion = commonData.appVersion || APP_CONFIG.APP_VERSION;
        const ciMethodProportion = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION;
        const ciMethodEffectSize = `${APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE} (${bootstrapN} ${lang === 'de' ? 'Replikationen' : 'replications'})`;

        if (lang === 'de') {
            return `
                <p>Die deskriptive Statistik umfasste die Berechnung von Medianen, Mittelwerten, Standardabweichungen (SD), Minima und Maxima für kontinuierliche Variablen sowie absolute Häufigkeiten und Prozentanteile für kategoriale Daten. Die diagnostische Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) wurde anhand von Sensitivität, Spezifität, positivem prädiktiven Wert (PPV), negativem prädiktiven Wert (NPV), Accuracy (ACC), Balanced Accuracy (BalAcc) und der Fläche unter der Receiver Operating Characteristic-Kurve (AUC) – bei binären Tests äquivalent zur BalAcc – evaluiert. Für diese Metriken wurden zweiseitige 95%-Konfidenzintervalle (KI) berechnet. Für Proportionen (Sensitivität, Spezifität, PPV, NPV, Accuracy) wurde die ${ciMethodProportion}-Methode verwendet. Für BalAcc (AUC) und den F1-Score wurde die ${ciMethodEffectSize} angewendet.</p>
                <p>Der statistische Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe (gepaarte Daten) erfolgte mittels des McNemar-Tests für gepaarte nominale Daten bzw. des DeLong-Tests für den Vergleich von AUC-Werten. Der Vergleich von Performance-Metriken zwischen unabhängigen Kollektiven (z.B. Direkt-OP vs. nRCT-Gruppe) erfolgte mittels Fisher's Exact Test für Raten (wie Accuracy) und mittels Z-Test für den Vergleich von AUC-Werten basierend auf deren Bootstrap-Standardfehlern. Odds Ratios (OR) und Risk Differences (RD) wurden zur Quantifizierung von Assoziationen berechnet, ebenfalls mit 95%-KI. Der Phi-Koeffizient (φ) wurde als Maß für die Stärke des Zusammenhangs zwischen binären Merkmalen herangezogen. Für den Vergleich von Verteilungen kontinuierlicher Variablen zwischen zwei unabhängigen Gruppen wurde der Mann-Whitney-U-Test verwendet. Ein p-Wert\u00A0<\u00A0${alphaText} wurde als statistisch signifikant interpretiert. Alle statistischen Analysen wurden mit der oben genannten, speziell entwickelten Webanwendung (${appName} v${appVersion}) durchgeführt.</p>
            `;
        } else {
            return `
                <p>Descriptive statistics included the calculation of medians, means, standard deviations (SD), minima, and maxima for continuous variables, as well as absolute frequencies and percentages for categorical data. The diagnostic performance of the Avocado Sign and the various T2 criteria sets (literature-based and brute-force optimized) was evaluated using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy (ACC), balanced accuracy (BalAcc), and the area under the Receiver Operating Characteristic curve (AUC)—equivalent to BalAcc for binary tests. Two-sided 95% confidence intervals (CI) were calculated for these metrics. The ${ciMethodProportion} method was used for proportions (sensitivity, specificity, PPV, NPV, accuracy). For BalAcc (AUC) and F1-score, the ${ciMethodEffectSize} was applied.</p>
                <p>Statistical comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group (paired data) was performed using McNemar's test for paired nominal data and DeLong's test for AUC comparison. Comparison of performance metrics between independent cohorts (e.g., upfront surgery vs. nRCT group) was conducted using Fisher's exact test for rates (such as accuracy) and a Z-test for AUC comparison based on their bootstrap standard errors. Odds Ratios (OR) and Risk Differences (RD) were calculated to quantify associations, also with 95% CIs. The Phi coefficient (φ) was used as a measure of the strength of association between binary features. For comparing distributions of continuous variables between two independent groups, the Mann-Whitney U test was used. A P\u00A0value\u00A0<\u00A0${alphaText} was considered statistically significant. All statistical analyses were conducted using the aforementioned custom-developed web application (${appName} v${appVersion}).</p>
            `;
        }
    }

    function getErgebnissePatientencharakteristikaText(lang, commonData, allKollektivStats) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 'N/A';
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 'N/A';
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 'N/A';
        const anteilNplusGesamt = formatPercent(pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN, 1, 'N/A');
        const lurzSchaefer2025Ref = `[${PUBLICATION_CONFIG.referenceManagement.references.find(r=>r.key === 'Lurz2025')?.text.split('.')[0]}]`;
        const table1Id = PUBLICATION_CONFIG.publicationElements.tables.patientCharacteristics.id;
        const fig1Id = PUBLICATION_CONFIG.publicationElements.figures.consortDiagram.id;
        const figAvocadoId = PUBLICATION_CONFIG.publicationElements.figures.avocadoSignExamples.id;

        if (lang === 'de') {
            return `
                <p>Die Charakteristika der ${anzahlGesamt} in die Studie eingeschlossenen Patienten sind in <a href="${_getSafeLink(table1Id)}">Tabelle 1</a> zusammengefasst und entsprechen den Daten der initialen Avocado-Sign-Studie ${lurzSchaefer2025Ref}. Das Gesamtkollektiv bestand aus ${anzahlDirektOP} Patienten, die primär operiert wurden (Direkt-OP-Gruppe), und ${anzahlNRCT} Patienten, die eine neoadjuvante Radiochemotherapie erhielten (nRCT-Gruppe). Ein Flussdiagramm der Patientenselektion ist in <a href="${_getSafeLink(fig1Id)}">Abbildung 1</a> dargestellt. Ein histopathologisch gesicherter positiver Lymphknotenstatus (N+) fand sich bei ${pCharGesamt?.nStatus?.plus || 'N/A'} von ${anzahlGesamt} Patienten (${anteilNplusGesamt}) im Gesamtkollektiv. Repräsentative Beispiele für das Avocado Sign sind in <a href="${_getSafeLink(figAvocadoId)}">Abbildung 2</a> gezeigt.</p>
            `;
        } else {
            return `
                <p>The characteristics of the ${anzahlGesamt} patients included in the study are summarized in <a href="${_getSafeLink(table1Id)}">Table 1</a> and correspond to the data from the initial Avocado Sign study ${lurzSchaefer2025Ref}. The overall cohort consisted of ${anzahlDirektOP} patients who underwent upfront surgery (upfront surgery group) and ${anzahlNRCT} patients who received neoadjuvant chemoradiotherapy (nRCT group). A flowchart of patient selection is presented in <a href="${_getSafeLink(fig1Id)}">Figure 1</a>. A histopathologically confirmed positive lymph node status (N+) was found in ${pCharGesamt?.nStatus?.plus || 'N/A'} of ${anzahlGesamt} patients (${anteilNplusGesamt}) in the overall cohort. Representative examples of the Avocado Sign are shown in <a href="${_getSafeLink(figAvocadoId)}">Figure 2</a>.</p>
            `;
        }
    }

    function getErgebnisseASPerformanceText(lang, commonData, allKollektivStats) {
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const asDirektOP = allKollektivStats?.['direkt OP']?.gueteAS;
        const asNRCT = allKollektivStats?.nRCT?.gueteAS;
        const tablePerfASId = PUBLICATION_CONFIG.publicationElements.tables.performanceAS.id;

        if (lang === 'de') {
            return `
                <p>Die diagnostische Güte des Avocado Signs (AS) zur Vorhersage des pathologischen N-Status ist für das Gesamtkollektiv und die Subgruppen in <a href="${_getSafeLink(tablePerfASId)}">Tabelle 4</a> detailliert aufgeführt. Im Gesamtkollektiv (${getKollektivText('Gesamt', commonData.nGesamt, lang)}) erreichte das AS eine Sensitivität von ${fCI(asGesamt?.sens, 1, true, 'de')}, eine Spezifität von ${fCI(asGesamt?.spez, 1, true, 'de')} und eine AUC (Balanced Accuracy) von ${fCI(asGesamt?.auc, 3, false, 'de')}.</p>
                <p>In der Subgruppe der primär operierten Patienten (Direkt-OP-Gruppe, ${getKollektivText('direkt OP', commonData.nDirektOP, lang)}) zeigte das AS eine Sensitivität von ${fCI(asDirektOP?.sens, 1, true, 'de')} und eine Spezifität von ${fCI(asDirektOP?.spez, 1, true, 'de')} (AUC: ${fCI(asDirektOP?.auc, 3, false, 'de')}). Bei Patienten nach nRCT (nRCT-Gruppe, ${getKollektivText('nRCT', commonData.nNRCT, lang)}) betrug die Sensitivität ${fCI(asNRCT?.sens, 1, true, 'de')} und die Spezifität ${fCI(asNRCT?.spez, 1, true, 'de')} (AUC: ${fCI(asNRCT?.auc, 3, false, 'de')}).</p>
            `;
        } else {
            return `
                <p>The diagnostic performance of the Avocado Sign (AS) for predicting pathological N-status is detailed in <a href="${_getSafeLink(tablePerfASId)}">Table 4</a> for the overall cohort and subgroups. In the overall cohort (${getKollektivText('Gesamt', commonData.nGesamt, lang)}), the AS achieved a sensitivity of ${fCI(asGesamt?.sens, 1, true, 'en')}, a specificity of ${fCI(asGesamt?.spez, 1, true, 'en')}, and an AUC (Balanced Accuracy) of ${fCI(asGesamt?.auc, 3, false, 'en')}.</p>
                <p>In the subgroup of patients undergoing upfront surgery (upfront surgery group, ${getKollektivText('direkt OP', commonData.nDirektOP, lang)}), the AS showed a sensitivity of ${fCI(asDirektOP?.sens, 1, true, 'en')} and a specificity of ${fCI(asDirektOP?.spez, 1, true, 'en')} (AUC: ${fCI(asDirektOP?.auc, 3, false, 'en')}). For patients after nRCT (nRCT group, ${getKollektivText('nRCT', commonData.nNRCT, lang)}), the sensitivity was ${fCI(asNRCT?.sens, 1, true, 'en')} and the specificity was ${fCI(asNRCT?.spez, 1, true, 'en')} (AUC: ${fCI(asNRCT?.auc, 3, false, 'en')}).</p>
            `;
        }
    }

    function getErgebnisseLiteraturT2PerformanceText(lang, commonData, allKollektivStats) {
        const tablePerfLitT2Id = PUBLICATION_CONFIG.publicationElements.tables.performanceLiteratureT2.id;
        let text = `<p>${lang === 'de' ? 'Die diagnostische Güte der evaluierten Literatur-basierten T2-Kriteriensets ist in' : 'The diagnostic performance of the evaluated literature-based T2 criteria sets is summarized in'} <a href="${_getSafeLink(tablePerfLitT2Id)}">Tabelle 5</a>.</p><ul>`;

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const targetKollektivForStudy = studySet.applicableKollektiv || 'Gesamt';
                const dataForThisKollektiv = allKollektivStats?.[targetKollektivForStudy];
                const stats = dataForThisKollektiv?.gueteT2_literatur?.[conf.id];
                const nPat = dataForThisKollektiv?.deskriptiv?.anzahlPatienten || 'N/A';
                const citation = `[${conf.citationKey}]`;

                if (lang === 'de') {
                    text += `<li>Für das Kriterienset nach ${studySet.name} ${citation}, angewendet auf das ${getKollektivText(targetKollektivForStudy, nPat, lang)}-Kollektiv, ergab sich eine Sensitivität von ${fCI(stats?.sens, 1, true, 'de')} und eine Spezifität von ${fCI(stats?.spez, 1, true, 'de')} (AUC ${fCI(stats?.auc, 3, false, 'de')}).</li>`;
                } else {
                    text += `<li>For the criteria set according to ${studySet.name} ${citation}, applied to the ${getKollektivText(targetKollektivForStudy, nPat, lang)} cohort, a sensitivity of ${fCI(stats?.sens, 1, true, 'en')} and a specificity of ${fCI(stats?.spez, 1, true, 'en')} (AUC ${fCI(stats?.auc, 3, false, 'en')}) were observed.</li>`;
                }
            }
        });
        text += `</ul>`;
        return text;
    }

    function getErgebnisseOptimierteT2PerformanceText(lang, commonData, allKollektivStats) {
        const bfOptimizedMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const tablePerfOptT2Id = PUBLICATION_CONFIG.publicationElements.tables.performanceOptimizedT2.id;
        let text = '';

        if (lang === 'de') {
            text += `<p>Mittels eines Brute-Force-Algorithmus wurden für jedes der drei Hauptkollektive (Gesamt, Direkt OP, nRCT) spezifische T2-Kriteriensets identifiziert, welche die ${bfOptimizedMetric} maximieren. Die Definitionen dieser optimierten Kriteriensets sind im Methodenteil aufgeführt. Die diagnostische Güte dieser optimierten Sets ist in <a href="${_getSafeLink(tablePerfOptT2Id)}">Tabelle 6</a> dargestellt.</p><ul>`;
        } else {
            text += `<p>Using a brute-force algorithm, specific T2 criteria sets maximizing ${bfOptimizedMetric} were identified for each of the three main cohorts (Overall, Upfront Surgery, nRCT). The definitions of these optimized criteria sets are detailed in the Methods section. The diagnostic performance of these optimized sets is presented in <a href="${_getSafeLink(tablePerfOptT2Id)}">Table 6</a>.</p><ul>`;
        }

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        kollektive.forEach(kolId => {
            const bfStats = allKollektivStats?.[kolId]?.gueteT2_bruteforce;
            const nPat = allKollektivStats?.[kolId]?.deskriptiv?.anzahlPatienten || 'N/A';
            const kollektivText = getKollektivText(kolId, nPat, lang);
            if (bfStats && bfStats.matrix) {
                text += `<li>${lang === 'de' ? 'Für das' : 'For the'} ${kollektivText}${lang === 'de' ? ' erreichten die optimierten Kriterien eine Sensitivität von' : ', the optimized criteria achieved a sensitivity of'} ${fCI(bfStats?.sens, 1, true, lang)}, ${lang === 'de' ? 'eine Spezifität von' : 'a specificity of'} ${fCI(bfStats?.spez, 1, true, lang)} ${lang === 'de' ? 'und eine AUC von' : 'and an AUC of'} ${fCI(bfStats?.auc, 3, false, lang)}.</li>`;
            } else {
                text += `<li>${lang === 'de' ? 'Für das' : 'For the'} ${kollektivText}${lang === 'de' ? ` konnten keine validen optimierten Kriterien für die Zielmetrik ${bfOptimizedMetric} ermittelt oder deren Performance berechnet werden.` : ` no valid optimized criteria could be determined for the target metric ${bfOptimizedMetric}, or their performance could not be calculated.`}</li>`;
            }
        });
        text += `</ul>`;
        return text;
    }

    function getErgebnisseVergleichASvsT2Text(lang, commonData, allKollektivStats) {
        const tableCompId = PUBLICATION_CONFIG.publicationElements.tables.comparisonASvsT2.id;
        const fig4aId = PUBLICATION_CONFIG.publicationElements.figures.performanceComparisonOverall.id;
        const fig4bId = PUBLICATION_CONFIG.publicationElements.figures.performanceComparisonDirektOP.id;
        const fig4cId = PUBLICATION_CONFIG.publicationElements.figures.performanceComparisonNRCT.id;
        const bfOptimizedMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        let text = '';

        if (lang === 'de') {
            text += `<p>Der direkte statistische Vergleich der diagnostischen Güte zwischen dem Avocado Sign (AS) und den T2-Kriteriensets (bestes Literatur-Set für das jeweilige Kollektiv und Brute-Force-optimiertes Set) ist in <a href="${_getSafeLink(tableCompId)}">Tabelle 7</a> zusammengefasst. <a href="${_getSafeLink(fig4aId)}">Abbildung 4a</a>, <a href="${_getSafeLink(fig4bId)}">4b</a> und <a href="${_getSafeLink(fig4cId)}">4c</a> visualisieren die Schlüsselmetriken Sensitivität und Spezifität vergleichend für die drei Kollektive.</p>`;
        } else {
            text += `<p>The direct statistical comparison of diagnostic performance between the Avocado Sign (AS) and T2 criteria sets (best literature set for the respective cohort and brute-force optimized set) is summarized in <a href="${_getSafeLink(tableCompId)}">Table 7</a>. <a href="${_getSafeLink(fig4aId)}">Figure 4a</a>, <a href="${_getSafeLink(fig4bId)}">4b</a>, and <a href="${_getSafeLink(fig4cId)}">4c</a> provide a comparative visualization of the key metrics, sensitivity, and specificity, across the three cohorts.</p>`;
        }

        const kollektive = [
            { id: 'Gesamt', litSetId: 'koh_2008_morphology', litSetKey: 'Koh2008' },
            { id: 'direkt OP', litSetId: 'rutegard_et_al_esgar', litSetKey: 'Rutegard2025ESGAR' },
            { id: 'nRCT', litSetId: 'barbaro_2024_restaging', litSetKey: 'Barbaro2024' }
        ];

        kollektive.forEach(k => {
            const kollektivText = getKollektivText(k.id, allKollektivStats?.[k.id]?.deskriptiv?.anzahlPatienten || 'N/A', lang);
            const statsAS = allKollektivStats?.[k.id]?.gueteAS;
            const statsLit = allKollektivStats?.[k.id]?.gueteT2_literatur?.[k.litSetId];
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;
            const statsBF = bfDef ? allKollektivStats?.[k.id]?.gueteT2_bruteforce : null;
            const vergleichASvsLit = allKollektivStats?.[k.id]?.[`vergleichASvsT2_literatur_${k.litSetId}`];
            const vergleichASvsBF = bfDef ? allKollektivStats?.[k.id]?.vergleichASvsT2_bruteforce : null;
            const litSetName = studyT2CriteriaManager.getStudyCriteriaSetById(k.litSetId)?.name || k.litSetId;

            text += lang === 'de' ? `<h4>Vergleich im ${kollektivText}</h4>` : `<h4>Comparison in the ${kollektivText}</h4>`;

            if (statsAS && statsLit && vergleichASvsLit) {
                const diffAucLitStr = formatNumber(vergleichASvsLit.delong?.diffAUC, 3, 'N/A', lang === 'en');
                text += `<p>${lang === 'de' ? 'Im Vergleich des AS' : 'Comparing AS'} (AUC ${fCI(statsAS.auc, 3, false, lang)}) ${lang === 'de' ? 'mit den Kriterien nach' : 'with criteria by'} ${litSetName} [${k.litSetKey}] (AUC ${fCI(statsLit.auc, 3, false, lang)}), ${lang === 'de' ? 'zeigte sich für die Accuracy ein p-Wert von' : 'the P value for accuracy was'} ${_formatPValueForText(vergleichASvsLit.mcnemar?.pValue, lang)} (${_getStatTestName(vergleichASvsLit.mcnemar, lang)})${lang === 'de' ? ' und für die AUC ein p-Wert von' : ' and for AUC was'} ${_formatPValueForText(vergleichASvsLit.delong?.pValue, lang)} (${_getStatTestName(vergleichASvsLit.delong, lang)}). ${lang === 'de' ? 'Der Unterschied in der AUC betrug' : 'The difference in AUC was'} ${diffAucLitStr}.</p>`;
            } else {
                text += `<p>${lang === 'de' ? `Ein Vergleich zwischen AS und den Kriterien nach ${litSetName} [${k.litSetKey}] konnte nicht vollständig durchgeführt werden (fehlende Daten oder Test nicht anwendbar).` : `A full comparison between AS and criteria by ${litSetName} [${k.litSetKey}] could not be performed (missing data or test not applicable).`}</p>`;
            }
            if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                const diffAucBfStr = formatNumber(vergleichASvsBF.delong?.diffAUC, 3, 'N/A', lang === 'en');
                text += `<p>${lang === 'de' ? 'Gegenüber den für die' : 'Compared to T2 criteria optimized for'} ${bfDef.metricName || bfOptimizedMetric} (AUC ${fCI(statsBF.auc, 3, false, lang)}), ${lang === 'de' ? 'ergab sich für die Accuracy ein p-Wert von' : 'the P value for accuracy was'} ${_formatPValueForText(vergleichASvsBF.mcnemar?.pValue, lang)} (${_getStatTestName(vergleichASvsBF.mcnemar, lang)})${lang === 'de' ? ' und für die AUC ein p-Wert von' : ' and for AUC was'} ${_formatPValueForText(vergleichASvsBF.delong?.pValue, lang)} (${_getStatTestName(vergleichASvsBF.delong, lang)}). ${lang === 'de' ? 'Der Unterschied in der AUC betrug' : 'The difference in AUC was'} ${diffAucBfStr}.</p>`;
            } else {
                text += `<p>${lang === 'de' ? `Ein Vergleich zwischen AS und den Brute-Force-optimierten Kriterien (Ziel: ${bfOptimizedMetric}) konnte nicht vollständig durchgeführt werden.` : `A full comparison between AS and the brute-force optimized criteria (target: ${bfOptimizedMetric}) could not be performed.`}</p>`;
            }
        });
        return text;
    }

    function getReferenzenListText(lang, commonData) {
        const refs = PUBLICATION_CONFIG.referenceManagement.references;
        if (!refs || refs.length === 0) return `<p>${lang === 'de' ? 'Keine Referenzen konfiguriert.' : 'No references configured.'}</p>`;

        let text = `<ol>`;
        refs.forEach((ref, index) => {
            text += `<li>${ref.text}</li>`;
        });
        text += `</ol>`;
        return text;
    }


    function getSectionText(sectionId, lang, allKollektivStats, commonData) {
        switch (sectionId) {
            case 'methoden_studienanlage_ethik': return getMethodenStudienanlageEthikText(lang, commonData, allKollektivStats);
            case 'methoden_patientenkohorte': return getMethodenPatientenkohorteText(lang, commonData, allKollektivStats);
            case 'methoden_bildakquisition': return getMethodenBildakquisitionText(lang, commonData, allKollektivStats);
            case 'methoden_bildanalyse': return getMethodenBildanalyseText(lang, commonData, allKollektivStats);
            case 'methoden_referenzstandard': return getMethodenReferenzstandardText(lang, commonData, allKollektivStats);
            case 'methoden_statistische_analyse': return getMethodenStatistischeAnalyseText(lang, commonData, allKollektivStats);
            case 'ergebnisse_patientencharakteristika': return getErgebnissePatientencharakteristikaText(lang, commonData, allKollektivStats);
            case 'ergebnisse_as_performance': return getErgebnisseASPerformanceText(lang, commonData, allKollektivStats);
            case 'ergebnisse_literatur_t2_performance': return getErgebnisseLiteraturT2PerformanceText(lang, commonData, allKollektivStats);
            case 'ergebnisse_optimierte_t2_performance': return getErgebnisseOptimierteT2PerformanceText(lang, commonData, allKollektivStats);
            case 'ergebnisse_vergleich_as_vs_t2': return getErgebnisseVergleichASvsT2Text(lang, commonData, allKollektivStats);
            case 'referenzen_list': return getReferenzenListText(lang, commonData);
            default: return `<p class="text-warning">Text für Sektion '${sectionId}' (Sprache: ${lang}) noch nicht implementiert oder Sektion nicht definiert.</p>`;
        }
    }

    function getSectionTextAsMarkdown(sectionId, lang, allKollektivStats, commonData) {
        const htmlContent = getSectionText(sectionId, lang, allKollektivStats, commonData);
        let markdown = String(htmlContent)
            .replace(/<p>/g, '\n')
            .replace(/<\/p>/g, '\n')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '*$1*')
            .replace(/<i>(.*?)<\/i>/g, '*$1*')
            .replace(/<u>(.*?)<\/u>/g, '$1')
            .replace(/<ul>/g, '')
            .replace(/<\/ul>/g, '')
            .replace(/<ol.*?>/g, '')
            .replace(/<\/ol>/g, '')
            .replace(/<li>/g, (match) => {
                if (sectionId === 'referenzen_list') return '\n1. '; // For numbered list in references
                return '\n* '; // For unordered lists
            })
            .replace(/<\/li>/g, '')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<a href="#(.*?)">(.*?)<\/a>/g, (match, p1, p2) => {
                const elementConfig = Object.values(PUBLICATION_CONFIG.publicationElements.tables).find(t => t.id === p1) || Object.values(PUBLICATION_CONFIG.publicationElements.figures).find(f => f.id === p1);
                if (elementConfig && elementConfig.numberPlaceholder) {
                    return `${elementConfig.numberPlaceholder.replace('Fig', 'Figure')}`;
                }
                return p2;
            })
            .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, (match, p1) => {
                const level = parseInt(match.match(/<h(\d)/)?.[1] || '1');
                return `\n${'#'.repeat(level +1)} ${p1}\n`;
            })
            .replace(/<cite>(.*?)<\/cite>/g, '[$1]')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/\u00A0/g, ' ')
            .replace(/\u2009/g, ' ')
            .replace(/\u2013/g, '-')
            .replace(/ {2,}/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();

        if (sectionId === 'referenzen_list') {
            let counter = 1;
            markdown = markdown.replace(/^\d+\. /gm, () => `${counter++}. `);
        }

        return markdown;
    }


    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown
    });

})();
