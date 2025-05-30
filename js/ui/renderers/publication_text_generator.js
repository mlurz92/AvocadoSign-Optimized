const publicationTextGenerator = (() => {

    function _getCommonDataForContext(allKollektivStats, commonDataFromLogic, options) {
        const appName = commonDataFromLogic.appName || APP_CONFIG.APP_NAME;
        const appVersion = commonDataFromLogic.appVersion || APP_CONFIG.APP_VERSION;
        const currentKollektivId = options.currentKollektiv || 'Gesamt';
        const currentKollektivName = getKollektivDisplayName(currentKollektivId);
        const bruteForceMetricForPublication = options.bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const nGesamt = allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || commonDataFromLogic.nGesamt || 0;
        const nDirektOP = allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || commonDataFromLogic.nDirektOP || 0;
        const nNRCT = allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || commonDataFromLogic.nNRCT || 0;

        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const pCharDirektOP = allKollektivStats?.['direkt OP']?.deskriptiv;
        const pCharNRCT = allKollektivStats?.nRCT?.deskriptiv;

        const references = APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES;

        return {
            appName,
            appVersion,
            currentKollektivId,
            currentKollektivName,
            bruteForceMetricForPublication,
            nGesamt,
            nDirektOP,
            nNRCT,
            pCharGesamt,
            pCharDirektOP,
            pCharNRCT,
            references,
            significanceLevelAlpha: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            studyPeriod: commonDataFromLogic.references?.lurzSchaefer2025StudyPeriod || "January 2020 and November 2023", // Example, should come from config
            mrtSystem: commonDataFromLogic.references?.lurzSchaefer2025MRISystem || "3.0-T MRI system (MAGNETOM Prisma Fit, Siemens Healthineers, Erlangen, Germany)",
            contrastAgent: commonDataFromLogic.references?.lurzSchaefer2025ContrastAgent || "gadoteridol (ProHance, Bracco Imaging, Milan, Italy)",
            ethicsVoteDe: APP_CONFIG.PUBLICATION_DEFAULTS.DEFAULT_ETHICS_STATEMENT_DE.replace('EK XXX/YYYY', 'EK 2023-101-StGg'), // Example, specific number
            ethicsVoteEn: APP_CONFIG.PUBLICATION_DEFAULTS.DEFAULT_ETHICS_STATEMENT_EN.replace('No. XXX/YYYY', 'No. 2023-101-StGg')
        };
    }

    function _formatStat(metricObject, isPercent = true, decimals = null) {
        if (!metricObject || typeof metricObject.value !== 'number' || isNaN(metricObject.value)) {
            return radiologyFormatter.formatNumber(NaN, decimals || (isPercent ? APP_CONFIG.STATISTICAL_CONSTANTS.METRIC_PERCENT_DECIMALS : APP_CONFIG.STATISTICAL_CONSTANTS.METRIC_RATE_DECIMALS));
        }
        return radiologyFormatter.formatStatistic(
            metricObject.value,
            metricObject.ci?.lower,
            metricObject.ci?.upper,
            {
                decimals: decimals,
                isPercent: isPercent
            }
        );
    }

    function _getTableRef(tableNumber, lang) {
        return lang === 'de' ? `Tabelle ${tableNumber}` : `Table ${tableNumber}`;
    }

    function _getFigureRef(figureNumber, figureLetter = '', lang) {
        const figStr = lang === 'de' ? `Abbildung` : `Figure`;
        return `${figStr} ${figureNumber}${figureLetter}`;
    }


    function _generateMethodenStudienanlageText(lang, context) {
        const citationAS = citationManager.cite(context.references.LURZ_SCHAEFER_2025.key);
        const softwareText = lang === 'de' ? APP_CONFIG.PUBLICATION_DEFAULTS.SOFTWARE_CITATION_TEXT_DE(context.appVersion) : APP_CONFIG.PUBLICATION_DEFAULTS.SOFTWARE_CITATION_TEXT_EN(context.appVersion);
        const ethicsText = lang === 'de' ? context.ethicsVoteDe : context.ethicsVoteEn;

        if (lang === 'de') {
            return `
                <p>Diese Studie wurde als retrospektive Analyse einer prospektiv geführten, monozentrischen Kohorte von Patienten mit histologisch gesichertem Rektumkarzinom konzipiert. Das primäre Studienkollektiv und die zugrundeliegenden Bilddatensätze für die ursprüngliche Bewertung des Avocado Signs (AS) sind identisch mit denen der Originalpublikation ${citationAS}. Ziel dieser erweiterten Untersuchung ist der detaillierte Vergleich der diagnostischen Güte des AS mit etablierten und optimierten T2-gewichteten morphologischen Kriterien zur Prädiktion des mesorektalen Lymphknotenstatus (N-Status).</p>
                <p>${ethicsText} Alle Prozeduren standen im Einklang mit der Deklaration von Helsinki. ${softwareText}</p>
            `;
        } else {
            return `
                <p>This study was designed as a retrospective analysis of a prospectively maintained, single-center cohort of patients with histologically confirmed rectal cancer. The primary study cohort and the underlying imaging data sets for the initial evaluation of the Avocado Sign (AS) are identical to those of the original publication ${citationAS}. The aim of this extended investigation is a detailed comparison of the diagnostic performance of AS with established and optimized T2-weighted morphological criteria for predicting mesorectal lymph node (N) status.</p>
                <p>${ethicsText} All procedures were in accordance with the Declaration of Helsinki. ${softwareText}</p>
            `;
        }
    }

    function _generateMethodenPatientenkollektivText(lang, context) {
        const table1Ref = _getTableRef(PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.number, lang);
        const nGesamtStr = radiologyFormatter.formatN(context.nGesamt, {prefix: ""});
        const nDirektOPStr = radiologyFormatter.formatN(context.nDirektOP, {prefix: ""});
        const nNRCTStr = radiologyFormatter.formatN(context.nNRCT, {prefix: ""});
        const citationAS = citationManager.cite(context.references.LURZ_SCHAEFER_2025.key);

        if (lang === 'de') {
            return `
                <p>In diese Studie wurden konsekutiv ${nGesamtStr} Patienten mit histologisch gesichertem Rektumkarzinom eingeschlossen, die zwischen ${context.studyPeriod} am Klinikum St. Georg, Leipzig, behandelt und in die initiale Avocado-Sign-Studie ${citationAS} aufgenommen wurden. Von diesen erhielten ${nNRCTStr} Patienten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während ${nDirektOPStr} Patienten einer primären Operation zugeführt wurden (Direkt-OP-Gruppe). Detaillierte Patientencharakteristika sind in ${table1Ref} dargestellt.</p>
                <p>Die Einschlusskriterien umfassten ein Alter von mindestens 18 Jahren und ein histologisch bestätigtes Rektumkarzinom. Ausschlusskriterien waren nicht-resektable Tumoren sowie Kontraindikationen für eine MRT-Untersuchung. Für die vorliegende erweiterte Analyse wurden alle Patienten der Primärstudie berücksichtigt, für die vollständige Datensätze bezüglich der T1KM- und T2-Lymphknotenmerkmale vorlagen.</p>
            `;
        } else {
            return `
                <p>This study consecutively enrolled ${nGesamtStr} patients with histologically confirmed rectal cancer treated at St. Georg Hospital, Leipzig, Germany, between ${context.studyPeriod}, who were included in the initial Avocado Sign study ${citationAS}. Of these, ${nNRCTStr} patients received neoadjuvant chemoradiotherapy (nRCT group), while ${nDirektOPStr} patients underwent upfront surgery (upfront surgery group). Detailed patient characteristics are presented in ${table1Ref}.</p>
                <p>Inclusion criteria were age 18 years or older and histologically confirmed rectal cancer. Exclusion criteria were unresectable tumors and contraindications to MRI. For the present extended analysis, all patients from the primary study with complete datasets regarding T1-weighted contrast-enhanced and T2-weighted lymph node characteristics were included.</p>
            `;
        }
    }

    function _generateMethodenMRTProtokollText(lang, context) {
         const t2SliceThickness = "2–3 mm"; // Example, may vary slightly
         if (lang === 'de') {
            return `
                <p>Alle MRT-Untersuchungen wurden an einem ${context.mrtSystem} unter Verwendung von Körper- und Wirbelsäulen-Array-Spulen durchgeführt. Das standardisierte Bildgebungsprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, axialer und koronarer Ebene (Schichtdicke ${t2SliceThickness}) sowie eine axiale diffusionsgewichtete Sequenz (DWI). Für die Bewertung des Avocado Signs wurde, wie in der Primärstudie beschrieben, eine kontrastmittelverstärkte axiale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung akquiriert.</p>
                <p>Ein makrozyklisches Gadolinium-basiertes Kontrastmittel (${context.contrastAgent}) wurde gewichtsadaptiert (0,2 ml/kg Körpergewicht) intravenös verabreicht. Die kontrastmittelverstärkten Aufnahmen erfolgten unmittelbar nach vollständiger Applikation des Kontrastmittels. Butylscopolamin wurde zur Reduktion von Bewegungsartefakten appliziert. Das Bildgebungsprotokoll war für die primäre Staging-Untersuchung und die Restaging-Untersuchung (bei Patienten der nRCT-Gruppe) identisch.</p>
            `;
        } else {
            return `
                <p>All MRI examinations were performed on a ${context.mrtSystem} using body and spine array coils. The standardized imaging protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, axial, and coronal planes (slice thickness ${t2SliceThickness}), and axial diffusion-weighted imaging (DWI). For the assessment of the Avocado Sign, as described in the primary study, a contrast-enhanced axial T1-weighted volumetric interpolated breath-hold examination (VIBE) with Dixon fat suppression was acquired.</p>
                <p>A macrocyclic gadolinium-based contrast agent (${context.contrastAgent}) was administered intravenously at a weight-based dose (0.2 mL/kg body weight). Contrast-enhanced images were acquired immediately after full administration of the contrast agent. Butylscopolamine was administered to reduce motion artifacts. The imaging protocol was identical for baseline staging and restaging examinations (in patients from the nRCT group).</p>
            `;
        }
    }

    function _generateMethodenASDefinitionText(lang, context) {
        const citationAS = citationManager.cite(context.references.LURZ_SCHAEFER_2025.key);
        const radiologistExperience = context.references.LURZ_SCHAEFER_2025.radiologistExperience || ["29", "7", "19"];

        if (lang === 'de') {
            return `
                <p>Das Avocado Sign wurde, wie in der Originalstudie ${citationAS} definiert, auf den kontrastmittelverstärkten T1-gewichteten Bildern mit Fettsättigung evaluiert. Es ist charakterisiert als ein klar abgrenzbarer, hypointenser Kern innerhalb eines ansonsten homogen hyperintensen Lymphknotens, unabhängig von dessen Größe oder Form. Die Bewertung erfolgte für alle im T1KM-MRT sichtbaren mesorektalen Lymphknoten. Ein Patient wurde als Avocado-Sign-positiv (AS+) eingestuft, wenn mindestens ein Lymphknoten dieses Zeichen aufwies. Die Bildanalyse wurde von zwei Radiologen (Erfahrung: ${radiologistExperience[0]} bzw. ${radiologistExperience[1]} Jahre in der abdominellen MRT), die bereits die Primärstudie durchführten, unabhängig und verblindet gegenüber den histopathologischen Ergebnissen und den T2-Merkmalen vorgenommen. Diskrepanzen wurden im Konsens mit einem dritten, ebenfalls erfahrenen Radiologen (Erfahrung: ${radiologistExperience[2]} Jahre) gelöst. Für Patienten der nRCT-Gruppe erfolgte die AS-Bewertung auf den Restaging-MRT-Bildern.</p>
            `;
        } else {
            return `
                <p>The Avocado Sign, as defined in the original study ${citationAS}, was evaluated on contrast-enhanced T1-weighted fat-saturated images. It is characterized as a clearly demarcated, hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape. Assessment was performed for all mesorectal lymph nodes visible on T1-weighted contrast-enhanced MRI. A patient was classified as Avocado-Sign-positive (AS+) if at least one lymph node exhibited this sign. Image analysis was performed by two radiologists (experience: ${radiologistExperience[0]} and ${radiologistExperience[1]} years in abdominal MRI, respectively), who also conducted the primary study, independently and blinded to histopathological results and T2-weighted features. Discrepancies were resolved by consensus with a third, similarly experienced radiologist (experience: ${radiologistExperience[2]} years). For patients in the nRCT group, AS assessment was performed on restaging MRI images.</p>
            `;
        }
    }

    function _generateMethodenT2DefinitionText(lang, context, allKollektivStats) {
        const tableLitKriterienRef = _getTableRef(PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienUebersichtTabelle.number, lang);
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria(); // Aktuell im Tool EINGESTELLTE, nicht zwingend die für Publikation relevanten.
        const appliedLogic = t2CriteriaManager.getAppliedLogic();
        const formattedAppliedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false);

        let bfKriterienTexte = [];
        const kollektiveBF = [
            { id: 'Gesamt', nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort' },
            { id: 'direkt OP', nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort' },
            { id: 'nRCT', nameDe: 'nRCT-Kollektiv', nameEn: 'nRCT cohort' }
        ];
        kollektiveBF.forEach(k => {
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;
            if (bfDef && bfDef.criteria) {
                const metricValStr = radiologyFormatter.formatNumber(bfDef.metricValue, RADIOLOGY_FORMAT_CONFIG.text.p_value_rules.find(r => r.default_decimals)?.default_decimals || 3);
                const critStr = studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, false);
                const displayName = lang === 'de' ? k.nameDe : k.nameEn;
                bfKriterienTexte.push(`<li><strong>${displayName}:</strong> ${critStr} (${lang === 'de' ? 'Zielmetrik' : 'Target metric'}: ${bfDef.metricName}, ${lang === 'de' ? 'Wert' : 'Value'}: ${metricValStr})</li>`);
            } else {
                const displayName = lang === 'de' ? k.nameDe : k.nameEn;
                bfKriterienTexte.push(`<li><strong>${displayName}:</strong> ${lang === 'de' ? `Keine Optimierungsergebnisse für Zielmetrik '${context.bruteForceMetricForPublication}' verfügbar.` : `No optimization results available for target metric '${context.bruteForceMetricForPublication}'.`}</li>`);
            }
        });

        const litSets = [
            { key: context.references.KOH_ET_AL_2008.key, name: context.references.KOH_ET_AL_2008.authors_short, year: context.references.KOH_ET_AL_2008.year, applicableKollektiv: 'Gesamt', studySetId: 'koh_2008_morphology' },
            { key: context.references.BARBARO_ET_AL_2024.key, name: context.references.BARBARO_ET_AL_2024.authors_short, year: context.references.BARBARO_ET_AL_2024.year, applicableKollektiv: 'nRCT', studySetId: 'barbaro_2024_restaging' },
            { key: context.references.RUTEGARD_ET_AL_2025.key, name: `${context.references.RUTEGARD_ET_AL_2025.authors_short} (ESGAR 2016 via ${context.references.BEETS_TAN_ET_AL_2018.authors_short})`, year: context.references.RUTEGARD_ET_AL_2025.year, applicableKollektiv: 'direkt OP', studySetId: 'rutegard_et_al_esgar' }
        ];

        let litKriterienTexte = litSets.map(set => {
            const studyData = studyT2CriteriaManager.getStudyCriteriaSetById(set.studySetId);
            const desc = studyData?.studyInfo?.keyCriteriaSummary || studyT2CriteriaManager.formatCriteriaForDisplay(studyData?.criteria, studyData?.logic, false) || (lang === 'de' ? 'Kriterien nicht spezifiziert' : 'Criteria not specified');
            const applicableKollektivName = getKollektivDisplayName(studyData?.applicableKollektiv || set.applicableKollektiv);
            return `<li>${set.name} ${citationManager.cite(set.key)}: Definiert als "${desc}". Dieses Set wurde in unserer Analyse auf das Kollektiv '${applicableKollektivName}' angewendet.</li>`;
        }).join('');


        if (lang === 'de') {
            return `
                <p>Die morphologischen T2-gewichteten Kriterien (Größe [Kurzachse in mm], Form ['rund', 'oval'], Kontur ['scharf', 'irregulär'], Homogenität ['homogen', 'heterogen'] und Signalintensität ['signalarm', 'intermediär', 'signalreich']) wurden für jeden im hochauflösenden T2w-MRT sichtbaren mesorektalen Lymphknoten von denselben zwei Radiologen erfasst, die auch das Avocado Sign bewerteten. Die Bewertung erfolgte konsensbasiert und verblindet gegenüber dem pathologischen N-Status und dem Avocado-Sign-Status.</p>
                <p>Für den Vergleich der diagnostischen Güte wurden folgende T2-Kriteriensets herangezogen:</p>
                <ol>
                    <li><strong>Literatur-basierte T2-Kriteriensets:</strong> Eine Auswahl etablierter Kriterien aus der Fachliteratur wurde implementiert und auf die entsprechenden Subgruppen bzw. das Gesamtkollektiv unseres Datensatzes angewendet (Details siehe ${tableLitKriterienRef}):
                        <ul>${litKriterienTexte}</ul>
                    </li>
                    <li><strong>Brute-Force optimierte T2-Kriterien:</strong> Mittels eines im Analyse-Tool implementierten Brute-Force-Algorithmus wurden für jedes der drei Hauptkollektive (Gesamt, Direkt OP, nRCT) diejenigen Kombinationen aus den fünf T2-Merkmalen und einer UND/ODER-Logik identifiziert, welche die primäre Zielmetrik dieser Studie – die <strong>${context.bruteForceMetricForPublication}</strong> – maximieren. Die resultierenden, für jedes Kollektiv spezifisch optimierten Kriteriensets waren:
                        <ul>${bfKriterienTexte.join('')}</ul>
                    </li>
                </ol>
                <p>Ein Lymphknoten wurde als T2-positiv für ein gegebenes Kriterienset gewertet, wenn er die spezifischen Bedingungen dieses Sets erfüllte. Ein Patient galt als T2-positiv, wenn mindestens ein Lymphknoten gemäß dem jeweiligen Kriterienset als positiv bewertet wurde.</p>
            `;
        } else {
             return `
                <p>Morphological T2-weighted criteria (size [short-axis diameter in mm], shape ['round', 'oval'], border ['smooth', 'irregular'], homogeneity ['homogeneous', 'heterogeneous'], and signal intensity ['low', 'intermediate', 'high']) were assessed for every mesorectal lymph node visible on high-resolution T2w-MRI by the same two radiologists who evaluated the Avocado Sign. Assessment was performed by consensus and blinded to the pathological N-status and the Avocado Sign status.</p>
                <p>For comparison of diagnostic performance, the following T2 criteria sets were used:</p>
                <ol>
                    <li><strong>Literature-based T2 criteria sets:</strong> A selection of established criteria from the literature was implemented and applied to the respective subgroups or the entire cohort of our dataset (details see ${tableLitKriterienRef}):
                        <ul>${litKriterienTexte.replace( /Dieses Set wurde in unserer Analyse auf das Kollektiv '(.*?)' angewendet./g, "This set was applied to the '$1' cohort in our analysis.")}</ul>
                    </li>
                    <li><strong>Brute-force optimized T2 criteria:</strong> Using a brute-force algorithm implemented in the analysis tool, combinations of the five T2 features and AND/OR logic that maximize the primary target metric of this study – <strong>${context.bruteForceMetricForPublication}</strong> – were identified for each of the three main cohorts (Overall, Upfront Surgery, nRCT). The resulting cohort-specific optimized criteria sets were:
                        <ul>${bfKriterienTexte.join('')}</ul>
                    </li>
                </ol>
                <p>A lymph node was considered T2-positive for a given criteria set if it met the specific conditions of that set. A patient was considered T2-positive if at least one lymph node was rated positive according to the respective criteria set.</p>
            `;
        }
    }

    function _generateMethodenReferenzstandardText(lang, context) {
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

    function _generateMethodenStatistischeAnalyseText(lang, context) {
        const alphaText = radiologyFormatter.formatNumber(context.significanceLevelAlpha, 2);
        const softwareText = lang === 'de' ? APP_CONFIG.PUBLICATION_DEFAULTS.SOFTWARE_CITATION_TEXT_DE(context.appVersion) : APP_CONFIG.PUBLICATION_DEFAULTS.SOFTWARE_CITATION_TEXT_EN(context.appVersion);
        const ciMethodProp = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION;
        const ciMethodEffect = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE;

        if (lang === 'de') {
            return `
                <p>Die deskriptive Statistik umfasste die Berechnung von Medianen, Mittelwerten, Standardabweichungen (SD), Minima und Maxima für kontinuierliche Variablen sowie absolute Häufigkeiten und Prozentanteile für kategoriale Daten. Die diagnostische Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) wurde anhand von Sensitivität, Spezifität, positivem prädiktiven Wert (PPV), negativem prädiktiven Wert (NPV), Accuracy (ACC), Balanced Accuracy (BalAcc), F1-Score, positiver Likelihood Ratio (LR+), negativer Likelihood Ratio (LR-) und Youden's Index (J) evaluiert. Für diese Metriken wurden zweiseitige 95%-Konfidenzintervalle (KI) berechnet. Für Proportionen (Sensitivität, Spezifität, PPV, NPV, Accuracy) wurde die ${ciMethodProp}-Methode verwendet. Für BalAcc (AUC), F1-Score und Youden's Index wurde die ${ciMethodEffect}-Methode mit ${context.bootstrapReplications} Replikationen angewendet (für LR+ und LR- wurden keine KIs berechnet).</p>
                <p>Der statistische Vergleich der diagnostischen Leistung (Accuracy, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe (gepaarte Daten) erfolgte mittels des McNemar-Tests für gepaarte nominale Daten bzw. des DeLong-Tests für den Vergleich von AUC-Werten. Der Vergleich von Performance-Metriken zwischen unabhängigen Kollektiven (z.B. Direkt-OP vs. nRCT-Gruppe) erfolgte mittels Fisher's Exact Test für Raten (wie Accuracy) und mittels Z-Test für den Vergleich von AUC-Werten basierend auf deren Bootstrap-Standardfehlern. Odds Ratios (OR) und Risk Differences (RD) wurden zur Quantifizierung von Assoziationen berechnet, ebenfalls mit 95%-KI. Der Phi-Koeffizient (φ) wurde als Maß für die Stärke des Zusammenhangs zwischen binären Merkmalen herangezogen. Für den Vergleich von Verteilungen kontinuierlicher Variablen zwischen zwei unabhängigen Gruppen wurde der Mann-Whitney-U-Test verwendet. Ein p-Wert < ${alphaText} wurde als statistisch signifikant interpretiert. Alle statistischen Analysen wurden mit der oben genannten, speziell entwickelten Webanwendung (${context.appName} v${context.appVersion}) durchgeführt, die auf Standardbibliotheken für statistische Berechnungen (basierend auf JavaScript) basiert.</p>
            `;
        } else {
            return `
                <p>Descriptive statistics included medians, means, standard deviations (SD), minima, and maxima for continuous variables, and absolute frequencies and percentages for categorical data. Diagnostic performance of the Avocado Sign and various T2 criteria sets (literature-based and brute-force optimized) was evaluated using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy (ACC), balanced accuracy (BalAcc), F1-score, positive likelihood ratio (LR+), negative likelihood ratio (LR-), and Youden's index (J). Two-sided 95% confidence intervals (CIs) were calculated. For proportions (sensitivity, specificity, PPV, NPV, accuracy), the ${ciMethodProp} method was used. For BalAcc (AUC), F1-score, and Youden's index, the ${ciMethodEffect} method with ${context.bootstrapReplications} replications was applied (CIs were not calculated for LR+ and LR-).</p>
                <p>Statistical comparison of diagnostic performance (accuracy, AUC) between the Avocado Sign and respective T2 criteria sets within the same patient group (paired data) was performed using McNemar's test for paired nominal data and DeLong's test for AUC comparison. Comparison of performance metrics between independent cohorts (eg, upfront surgery vs nRCT group) was conducted using Fisher's exact test for rates (such as accuracy) and a Z-test for AUC comparison based on their bootstrap standard errors. Odds ratios (ORs) and risk differences (RDs) were calculated to quantify associations, also with 95% CIs. The phi coefficient (φ) was used as a measure of association strength between binary features. The Mann-Whitney U test was used to compare distributions of continuous variables between two independent groups. A P value < ${alphaText} was considered statistically significant. All statistical analyses were conducted using the aforementioned custom-developed web application (${context.appName} v${context.appVersion}), based on standard JavaScript libraries for statistical computations.</p>
            `;
        }
    }


    function _generateErgebnissePatientencharakteristikaText(lang, context) {
        const table1Ref = _getTableRef(PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.number, lang);
        const fig1Ref = _getFigureRef(PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaAbbildungen.number, '', lang);
        const fig1ARef = _getFigureRef(PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaAbbildungen.number, PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaAbbildungen.alterVerteilungChart.figureLetter, lang);
        const fig1BRef = _getFigureRef(PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaAbbildungen.number, PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaAbbildungen.geschlechtVerteilungChart.figureLetter, lang);
        const citationAS = citationManager.cite(context.references.LURZ_SCHAEFER_2025.key);
        const pCharGesamt = context.pCharGesamt;

        if (lang === 'de') {
            return `
                <p>Die Charakteristika der ${radiologyFormatter.formatN(context.nGesamt, {prefix:""})} in die Studie eingeschlossenen Patienten sind in ${table1Ref} zusammengefasst und entsprechen den Daten der initialen Avocado-Sign-Studie ${citationAS}. Das Gesamtkollektiv bestand aus ${radiologyFormatter.formatN(context.nDirektOP, {prefix:""})} Patienten, die primär operiert wurden (Direkt-OP-Gruppe), und ${radiologyFormatter.formatN(context.nNRCT, {prefix:""})} Patienten, die eine neoadjuvante Radiochemotherapie erhielten (nRCT-Gruppe). Das mediane Alter im Gesamtkollektiv betrug ${radiologyFormatter.formatNumber(pCharGesamt?.alter?.median, 1)} Jahre (Range ${radiologyFormatter.formatRange(pCharGesamt?.alter?.min, pCharGesamt?.alter?.max, 0)}), und ${radiologyFormatter.formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN, 0)} waren männlich. Ein histopathologisch gesicherter positiver Lymphknotenstatus (N+) fand sich bei ${radiologyFormatter.formatNumber(pCharGesamt?.nStatus?.plus, 0)} von ${radiologyFormatter.formatN(context.nGesamt, {prefix:""})} Patienten (${radiologyFormatter.formatPercent(pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN, 1)}) im Gesamtkollektiv. Die Verteilung von Alter und Geschlecht im Gesamtkollektiv ist in ${fig1Ref} (${fig1ARef} und ${fig1BRef}) dargestellt.</p>
            `;
        } else {
            return `
                <p>The characteristics of the ${radiologyFormatter.formatN(context.nGesamt, {prefix:""})} patients included in the study are summarized in ${table1Ref} and correspond to the data from the initial Avocado Sign study ${citationAS}. The overall cohort consisted of ${radiologyFormatter.formatN(context.nDirektOP, {prefix:""})} patients who underwent upfront surgery (upfront surgery group) and ${radiologyFormatter.formatN(context.nNRCT, {prefix:""})} patients who received neoadjuvant chemoradiotherapy (nRCT group). The median age in the overall cohort was ${radiologyFormatter.formatNumber(pCharGesamt?.alter?.median, 1)} years (range, ${radiologyFormatter.formatRange(pCharGesamt?.alter?.min, pCharGesamt?.alter?.max, 0)}), and ${radiologyFormatter.formatPercent(pCharGesamt?.geschlecht?.m && pCharGesamt?.anzahlPatienten ? pCharGesamt.geschlecht.m / pCharGesamt.anzahlPatienten : NaN, 0)} were male. A histopathologically confirmed positive lymph node status (N+) was found in ${radiologyFormatter.formatNumber(pCharGesamt?.nStatus?.plus, 0)} of ${radiologyFormatter.formatN(context.nGesamt, {prefix:""})} patients (${radiologyFormatter.formatPercent(pCharGesamt?.nStatus?.plus && pCharGesamt?.anzahlPatienten ? pCharGesamt.nStatus.plus / pCharGesamt.anzahlPatienten : NaN, 1)}) in the overall cohort. The age and gender distribution in the overall cohort is shown in ${fig1Ref} (${fig1ARef} and ${fig1BRef}).</p>
            `;
        }
    }

    function _generateErgebnisseASPerformanceText(lang, context, allKollektivStats) {
        const table3Ref = _getTableRef(PUBLICATION_CONFIG.publicationElements.ergebnisse.asPerformanceTabelle.number, lang);
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const asDirektOP = allKollektivStats?.['direkt OP']?.gueteAS;
        const asNRCT = allKollektivStats?.nRCT?.gueteAS;
        const citationASOrigin = citationManager.cite(context.references.LURZ_SCHAEFER_2025.key);


        if (lang === 'de') {
            return `
                <p>Die diagnostische Güte des Avocado Signs (AS) zur Vorhersage des pathologischen N-Status ist für das Gesamtkollektiv und die Subgruppen in ${table3Ref} detailliert aufgeführt. Im Gesamtkollektiv (N=${context.nGesamt}) erreichte das AS eine Sensitivität von ${_formatStat(asGesamt?.sens)}, eine Spezifität von ${_formatStat(asGesamt?.spez)}, einen positiven prädiktiven Wert (PPV) von ${_formatStat(asGesamt?.ppv)}, einen negativen prädiktiven Wert (NPV) von ${_formatStat(asGesamt?.npv)} und eine Accuracy von ${_formatStat(asGesamt?.acc)}. Die AUC (Balanced Accuracy) betrug ${_formatStat(asGesamt?.auc, false)}. Diese Werte stimmen mit den in der Originalpublikation zum Avocado Sign ${citationASOrigin} berichteten überein.</p>
                <p>In der Subgruppe der primär operierten Patienten (Direkt-OP-Gruppe, N=${context.nDirektOP}) zeigte das AS eine Sensitivität von ${_formatStat(asDirektOP?.sens)} und eine Spezifität von ${_formatStat(asDirektOP?.spez)} (AUC: ${_formatStat(asDirektOP?.auc, false)}). Bei Patienten nach nRCT (nRCT-Gruppe, N=${context.nNRCT}) betrug die Sensitivität ${_formatStat(asNRCT?.sens)} und die Spezifität ${_formatStat(asNRCT?.spez)} (AUC: ${_formatStat(asNRCT?.auc, false)}).</p>
                <p>Die positive Likelihood Ratio (LR+) für AS im Gesamtkollektiv war ${_formatStat(asGesamt?.lr_pos, false, 2)}, die negative Likelihood Ratio (LR-) ${_formatStat(asGesamt?.lr_neg, false, 2)}, und der Youden's Index ${_formatStat(asGesamt?.youden, false, 3)}.</p>
            `;
        } else {
            return `
                <p>The diagnostic performance of the Avocado Sign (AS) for predicting pathological N-status is detailed in ${table3Ref} for the overall cohort and subgroups. In the overall cohort (N=${context.nGesamt}), AS achieved a sensitivity of ${_formatStat(asGesamt?.sens)}, a specificity of ${_formatStat(asGesamt?.spez)}, a positive predictive value (PPV) of ${_formatStat(asGesamt?.ppv)}, a negative predictive value (NPV) of ${_formatStat(asGesamt?.npv)}, and an accuracy of ${_formatStat(asGesamt?.acc)}. The AUC (balanced accuracy) was ${_formatStat(asGesamt?.auc, false)}. These values are consistent with those reported in the original Avocado Sign publication ${citationASOrigin}.</p>
                <p>In the upfront surgery subgroup (N=${context.nDirektOP}), AS showed a sensitivity of ${_formatStat(asDirektOP?.sens)} and a specificity of ${_formatStat(asDirektOP?.spez)} (AUC: ${_formatStat(asDirektOP?.auc, false)}). For patients after nRCT (nRCT group, N=${context.nNRCT}), sensitivity was ${_formatStat(asNRCT?.sens)} and specificity was ${_formatStat(asNRCT?.spez)} (AUC: ${_formatStat(asNRCT?.auc, false)}).</p>
                <p>The positive likelihood ratio (LR+) for AS in the overall cohort was ${_formatStat(asGesamt?.lr_pos, false, 2)}, the negative likelihood ratio (LR-) was ${_formatStat(asGesamt?.lr_neg, false, 2)}, and Youden's index was ${_formatStat(asGesamt?.youden, false, 3)}.</p>
            `;
        }
    }

    function _generateErgebnisseLiteraturT2PerformanceText(lang, context, allKollektivStats) {
        const table4Ref = _getTableRef(PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.number, lang);
        let text = '';

        const litSetPerformances = [
            { data: allKollektivStats?.Gesamt?.gueteT2_literatur?.['koh_2008_morphology'], kollektivId: 'Gesamt', n: context.nGesamt, citationKey: context.references.KOH_ET_AL_2008.key, name: context.references.KOH_ET_AL_2008.authors_short },
            { data: allKollektivStats?.nRCT?.gueteT2_literatur?.['barbaro_2024_restaging'], kollektivId: 'nRCT', n: context.nNRCT, citationKey: context.references.BARBARO_ET_AL_2024.key, name: context.references.BARBARO_ET_AL_2024.authors_short },
            { data: allKollektivStats?.['direkt OP']?.gueteT2_literatur?.['rutegard_et_al_esgar'], kollektivId: 'direkt OP', n: context.nDirektOP, citationKey: context.references.RUTEGARD_ET_AL_2025.key, name: `${context.references.RUTEGARD_ET_AL_2025.authors_short} (ESGAR 2016)` }
        ];

        if (lang === 'de') {
            text += `<p>Die diagnostische Güte der evaluierten Literatur-basierten T2-Kriteriensets ist in ${table4Ref} zusammengefasst. `;
            litSetPerformances.forEach(item => {
                if (item.data) {
                    text += `Für das Kriterienset nach ${item.name} ${citationManager.cite(item.citationKey)}, angewendet auf das ${getKollektivDisplayName(item.kollektivId)}-Kollektiv (N=${item.n}), ergab sich eine Sensitivität von ${_formatStat(item.data.sens)}, eine Spezifität von ${_formatStat(item.data.spez)} und eine AUC von ${_formatStat(item.data.auc, false)}. `;
                }
            });
            text += `</p>`;
        } else {
            text += `<p>The diagnostic performance of the evaluated literature-based T2 criteria sets is summarized in ${table4Ref}. `;
             litSetPerformances.forEach(item => {
                if (item.data) {
                    text += `For the criteria set by ${item.name} ${citationManager.cite(item.citationKey)}, applied to the ${getKollektivDisplayName(item.kollektivId)} cohort (N=${item.n}), a sensitivity of ${_formatStat(item.data.sens)}, a specificity of ${_formatStat(item.data.spez)}, and an AUC of ${_formatStat(item.data.auc, false)} were observed. `;
                }
            });
            text += `</p>`;
        }
        return text;
    }

    function _generateErgebnisseOptimierteT2PerformanceText(lang, context, allKollektivStats) {
        const table5Ref = _getTableRef(PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.number, lang);
        const tableLitKriterienRef = _getTableRef(PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienUebersichtTabelle.number, lang);
        let text = '';
        const bfZielMetric = context.bruteForceMetricForPublication;

        if (lang === 'de') {
            text += `<p>Mittels eines Brute-Force-Algorithmus wurden für jedes der drei Kollektive spezifische T2-Kriteriensets identifiziert, welche die ${bfZielMetric} maximieren. Die Definition dieser optimierten Kriteriensets ist im Methodenteil (Abschnitt <a href="#pub-content-methoden_t2_definition">Definition & Bewertung T2-Kriterien</a>) dargelegt. Die diagnostische Güte dieser optimierten Sets ist in ${table5Ref} dargestellt.</p><ul>`;
        } else {
            text += `<p>Using a brute-force algorithm, specific T2 criteria sets maximizing ${bfZielMetric} were identified for each of the three cohorts. The definition of these optimized criteria sets is detailed in the Methods section (Section <a href="#pub-content-methoden_t2_definition">Definition and Assessment of T2 Criteria</a>). The diagnostic performance of these optimized sets is presented in ${table5Ref}.</p><ul>`;
        }

        const kollektive = [
            { id: 'Gesamt', nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort', n: context.nGesamt },
            { id: 'direkt OP', nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort', n: context.nDirektOP },
            { id: 'nRCT', nameDe: 'nRCT-Kollektiv', nameEn: 'nRCT cohort', n: context.nNRCT }
        ];

        kollektive.forEach(k => {
            const bfStats = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            const nPat = radiologyFormatter.formatN(k.n, {prefix: ""});
            if (bfStats && bfStats.matrix && bfDef) {
                const criteriaText = studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, false);
                text += `<li>Für das ${name} (N=${nPat}) erreichten die optimierten Kriterien <i>(${criteriaText})</i> eine Sensitivität von ${_formatStat(bfStats?.sens)}, eine Spezifität von ${_formatStat(bfStats?.spez)} und eine AUC von ${_formatStat(bfStats?.auc, false)}.</li>`;
            } else {
                text += `<li>Für das ${name} (N=${nPat}) konnten keine validen optimierten Kriterien für die Zielmetrik ${bfZielMetric} ermittelt oder deren Performance berechnet werden.</li>`;
            }
        });
        text += `</ul>`;
        return text;
    }

    function _generateErgebnisseVergleichPerformanceText(lang, context, allKollektivStats) {
        const table6Ref = _getTableRef(PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.number, lang);
        const figROCBaseNum = PUBLICATION_CONFIG.publicationElements.ergebnisse.rocKurven.number;
        const figBarBaseNum = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichsBalkendiagramme.number;

        let text = '';
        if (lang === 'de') {
            text += `<p>Der direkte statistische Vergleich der diagnostischen Güte zwischen dem Avocado Sign (AS) und den ausgewählten T2-Kriteriensets (Literatur-basiert und Brute-Force-optimiert) ist in ${table6Ref} zusammengefasst. Die ROC-Kurven sind in ${_getFigureRef(figROCBaseNum, '', lang)} dargestellt, vergleichende Balkendiagramme der Schlüsselmetriken in ${_getFigureRef(figBarBaseNum, '', lang)}.</p>`;
        } else {
            text += `<p>The direct statistical comparison of diagnostic performance between the Avocado Sign (AS) and the selected T2 criteria sets (literature-based and brute-force optimized) is summarized in ${table6Ref}. ROC curves are shown in ${_getFigureRef(figROCBaseNum, '', lang)}, and comparative bar charts of key metrics are presented in ${_getFigureRef(figBarBaseNum, '', lang)}.</p>`;
        }

        const kollektive = [
            { id: 'Gesamt', nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort', litSetId: 'koh_2008_morphology', litRefKey: context.references.KOH_ET_AL_2008.key },
            { id: 'direkt OP', nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort', litSetId: 'rutegard_et_al_esgar', litRefKey: context.references.RUTEGARD_ET_AL_2025.key },
            { id: 'nRCT', nameDe: 'nRCT-Kollektiv', nameEn: 'nRCT cohort', litSetId: 'barbaro_2024_restaging', litRefKey: context.references.BARBARO_ET_AL_2024.key }
        ];

        kollektive.forEach(k => {
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            const statsAS = allKollektivStats?.[k.id]?.gueteAS;
            const statsLit = allKollektivStats?.[k.id]?.gueteT2_literatur?.[k.litSetId];
            const statsBF = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;
            const litStudyName = studyT2CriteriaManager.getStudyCriteriaSetById(k.litSetId)?.name || k.litSetId;


            const vergleichASvsLit = allKollektivStats?.[k.id]?.[`vergleichASvsT2_literatur_${k.litSetId}`];
            const vergleichASvsBF = allKollektivStats?.[k.id]?.vergleichASvsT2_bruteforce;

            const pMcNemarLit = radiologyFormatter.formatPValue(vergleichASvsLit?.mcnemar?.pValue, {lang});
            const pDeLongLit = radiologyFormatter.formatPValue(vergleichASvsLit?.delong?.pValue, {lang});
            const diffAUCLit = radiologyFormatter.formatNumber(vergleichASvsLit?.delong?.diffAUC, RADIOLOGY_FORMAT_CONFIG.text.p_value_rules.find(r => r.default_decimals)?.default_decimals || 3);

            const pMcNemarBF = radiologyFormatter.formatPValue(vergleichASvsBF?.mcnemar?.pValue, {lang});
            const pDeLongBF = radiologyFormatter.formatPValue(vergleichASvsBF?.delong?.pValue, {lang});
            const diffAUCBF = radiologyFormatter.formatNumber(vergleichASvsBF?.delong?.diffAUC, RADIOLOGY_FORMAT_CONFIG.text.p_value_rules.find(r => r.default_decimals)?.default_decimals || 3);


            if (lang === 'de') {
                text += `<h4>Vergleich im ${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Im Vergleich des AS (AUC ${_formatStat(statsAS.auc, false)}) mit den Kriterien nach ${litStudyName} ${citationManager.cite(k.litRefKey)} (AUC ${_formatStat(statsLit.auc, false)}) zeigte sich für die Accuracy ein ${pMcNemarLit} (McNemar) und für die AUC ein ${pDeLongLit} (DeLong). Der Unterschied in der AUC betrug ${diffAUCLit}.</p>`;
                }
                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Gegenüber den für die ${bfDef.metricName} optimierten T2-Kriterien (AUC ${_formatStat(statsBF.auc, false)}) ergab sich für die Accuracy ein ${pMcNemarBF} (McNemar) und für die AUC ein ${pDeLongBF} (DeLong). Der Unterschied in der AUC betrug ${diffAUCBF}.</p>`;
                }
            } else {
                 text += `<h4>Comparison in the ${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Comparing AS (AUC ${_formatStat(statsAS.auc, false)}) with the criteria by ${litStudyName} ${citationManager.cite(k.litRefKey)} (AUC ${_formatStat(statsLit.auc, false)}), the P value for accuracy was ${pMcNemarLit} (McNemar test) and for AUC was ${pDeLongLit} (DeLong test). The difference in AUC was ${diffAUCLit}.</p>`;
                }
                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Compared to the T2 criteria optimized for ${bfDef.metricName} (AUC ${_formatStat(statsBF.auc, false)}), the P value for accuracy was ${pMcNemarBF} (McNemar test) and for AUC was ${pDeLongBF} (DeLong test). The difference in AUC was ${diffAUCBF}.</p>`;
                }
            }
        });
        return text;
    }


    function _generateReferenzenText(lang, context) {
        return citationManager.getFormattedReferenceList({ format: 'html' });
    }


    function getSectionText(sectionId, lang, allKollektivStats, commonDataFromLogic, options) {
        const context = _getCommonDataForContext(allKollektivStats, commonDataFromLogic, options);
        switch (sectionId) {
            case 'methoden_studienanlage': return _generateMethodenStudienanlageText(lang, context);
            case 'methoden_patientenkollektiv': return _generateMethodenPatientenkollektivText(lang, context);
            case 'methoden_mrt_protokoll': return _generateMethodenMRTProtokollText(lang, context);
            case 'methoden_as_definition': return _generateMethodenASDefinitionText(lang, context);
            case 'methoden_t2_definition': return _generateMethodenT2DefinitionText(lang, context, allKollektivStats);
            case 'methoden_referenzstandard': return _generateMethodenReferenzstandardText(lang, context);
            case 'methoden_statistische_analyse': return _generateMethodenStatistischeAnalyseText(lang, context);
            case 'ergebnisse_patientencharakteristika': return _generateErgebnissePatientencharakteristikaText(lang, context);
            case 'ergebnisse_as_performance': return _generateErgebnisseASPerformanceText(lang, context, allKollektivStats);
            case 'ergebnisse_literatur_t2_performance': return _generateErgebnisseLiteraturT2PerformanceText(lang, context, allKollektivStats);
            case 'ergebnisse_optimierte_t2_performance': return _generateErgebnisseOptimierteT2PerformanceText(lang, context, allKollektivStats);
            case 'ergebnisse_vergleich_performance': return _generateErgebnisseVergleichPerformanceText(lang, context, allKollektivStats);
            case 'referenzen_liste': return _generateReferenzenText(lang, context);
            default: return `<p class="text-warning">Text für Sektion '${sectionId}' (Sprache: ${lang}) noch nicht implementiert oder ID unbekannt.</p>`;
        }
    }

    function getSectionTextAsMarkdown(sectionId, lang, allKollektivStats, commonDataFromLogic, options) {
        const htmlContent = getSectionText(sectionId, lang, allKollektivStats, commonDataFromLogic, options);

        // Basic HTML to Markdown conversion
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
            .replace(/<br\s*\/?>/g, '\n\n') // Ensure line breaks are paragraphs
            .replace(/<a href="#pub-content-(.*?)">(.*?)<\/a>/g, (match, p1, p2) => { // Internal links to sections
                const sectionConfig = PUBLICATION_CONFIG.sections.flatMap(s => s.subSections).find(ss => ss.id === p1);
                return sectionConfig ? `[${p2}](#${sectionConfig.label.replace(/\s+/g, '-').toLowerCase()})` : `[${p2}](${p1})`;
            })
            .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, (match, p1) => {
                const level = parseInt(match.match(/<h(\d)/)?.[1] || '1');
                return `\n${'#'.repeat(level)} ${p1}\n`;
            })
            .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ') // Non-breaking space
            .replace(/ {2,}/g, ' ')
            .replace(/\n\s*\n+/g, '\n\n') // Normalize multiple newlines
            .trim();
        
        if (sectionId === 'referenzen_liste') {
            let counter = 1;
            markdown = markdown.replace(/^\* /gm, () => `${counter++}. `);
        }

        return markdown;
    }


    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown
    });

})();
