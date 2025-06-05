const methodsContent = (() => {

    function _getSafeLink(elementId){
        if (!elementId) return '#';
        return `#${elementId}`;
    }

    function getMethodenStudienanlageEthikText(lang, commonData) {
        const studyReferenceAS = APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025;
        const ethicsVote = APP_CONFIG.REFERENCES_FOR_PUBLICATION.ETHICS_VOTE_LEIPZIG;

        if (lang === 'de') {
            return `
                <h3 id="methoden-studienanlage-ethik-title">Studiendesign und Ethikvotum</h3>
                <p>Diese retrospektive Analyse wurde auf der Basis eines prospektiv geführten, monozentrischen Registers von Patienten mit histologisch gesichertem Rektumkarzinom durchgeführt. Das Studienkollektiv und die zugrundeliegenden MRT-Datensätze sind identisch mit jenen der Originalpublikation zum Avocado Sign (${studyReferenceAS}). Die vorliegende Untersuchung dient dem detaillierten Vergleich der diagnostischen Leistung des AS mit verschiedenen T2-gewichteten morphologischen Kriterien. Die Studie wurde in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki und deren späteren Änderungen oder vergleichbaren ethischen Standards durchgeführt. Das Studienprotokoll wurde von der zuständigen lokalen Ethikkommission genehmigt (${ethicsVote}). Aufgrund des retrospektiven Charakters der Analyse auf vollständig pseudonymisierten Daten wurde von der Ethikkommission auf ein erneutes Einholen eines schriftlichen Einverständnisses der Patienten für diese spezifische erweiterte Auswertung verzichtet, da ein generelles Einverständnis zur wissenschaftlichen Auswertung im Rahmen der Primärstudie vorlag. Die Autoren hatten während der gesamten Studie vollen Zugriff auf alle Daten.</p>
            `;
        } else {
            return `
                <h3 id="methoden-studienanlage-ethik-title">Study Design and Ethical Approval</h3>
                <p>This retrospective analysis was performed based on a prospectively maintained, single-center registry of patients with histologically confirmed rectal cancer. The study cohort and the underlying MRI datasets are identical to those of the original Avocado Sign publication (${studyReferenceAS}). The present investigation serves for a detailed comparison of the diagnostic performance of the AS with various T2-weighted morphological criteria. The study was conducted in accordance with the ethical principles of the Declaration of Helsinki and its later amendments or comparable ethical standards. The study protocol was approved by the responsible local ethics committee (${ethicsVote}). Given the retrospective nature of this analysis on fully pseudonymized data, the ethics committee waived the need for re-obtaining written informed consent from patients for this specific extended evaluation, as general consent for scientific evaluation was provided as part of the primary study. The authors had full access to all data in the study.</p>
            `;
        }
    }

    function getMethodenPatientenkohorteText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 0;
        const studienzeitraum = commonData.references?.STUDY_PERIOD_2020_2023 || "January 2020 to November 2023";
        const formattedStudienzeitraum = lang === 'de' ? studienzeitraum.replace("January", "Januar").replace("November", "November").replace(" and ", " und ") : studienzeitraum;

        const table1Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id;
        const flowDiagramId = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.id;

        const anzahlNRCT = allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 0;
        const anzahlDirektOP = allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 0;

        if (lang === 'de') {
            return `
                <h3 id="methoden-patientenkohorte-title">Patientenkohorte und Einschlusskriterien</h3>
                <p>Es wurden konsekutiv Patienten in die Studie eingeschlossen, bei denen zwischen ${formattedStudienzeitraum} ein histologisch gesichertes Adenokarzinom des Rektums diagnostiziert wurde und die eine primäre Staging-MRT-Untersuchung sowie die anschließende Therapie und Operation am Klinikum St. Georg, Leipzig, Deutschland, erhielten. Einschlusskriterien waren ein Alter von mindestens 18 Jahren und die Fähigkeit, eine informierte Einwilligung zu erteilen. Ausschlusskriterien umfassten Kontraindikationen gegen eine MRT-Untersuchung oder die Gabe von Gadolinium-basiertem Kontrastmittel, das Vorliegen von Fernmetastasen zum Zeitpunkt der Diagnose (M1-Stadium), oder eine bereits extern erfolgte Vorbehandlung, welche die standardisierte Bildgebung und Therapieplanung im eigenen Zentrum unmöglich machte. Alle Patienten gaben ihr schriftliches Einverständnis zur Teilnahme an der Primärstudie und zur wissenschaftlichen Auswertung ihrer pseudonymisierten Daten. Das Flussdiagramm der Patientenrekrutierung ist in <a href="${_getSafeLink(flowDiagramId)}">Abbildung Methoden 1</a> dargestellt. Die demographischen und klinischen Charakteristika der Studienpopulation sind in <a href="${_getSafeLink(table1Id)}">Tabelle Ergebnisse 1</a> zusammengefasst.</p>
            `;
        } else {
            return `
                <h3 id="methoden-patientenkohorte-title">Patient Cohort and Inclusion Criteria</h3>
                <p>Consecutive patients diagnosed with histologically confirmed rectal adenocarcinoma between ${formattedStudienzeitraum} who underwent primary staging MRI, subsequent therapy, and surgery at Klinikum St. Georg, Leipzig, Germany, were included in this study. Inclusion criteria were an age of at least 18 years and the ability to provide informed consent. Exclusion criteria comprised contraindications to MRI examination or administration of gadolinium-based contrast material, presence of distant metastases at diagnosis (M1 stage), or prior treatment performed externally that precluded standardized imaging and treatment planning at our institution. All patients provided written informed consent for participation in the primary study and for the scientific evaluation of their pseudonymized data. The patient recruitment flowchart is depicted in <a href="${_getSafeLink(flowDiagramId)}">Methods Figure 1</a>. Demographic and clinical characteristics of the study population are summarized in <a href="${_getSafeLink(table1Id)}">Results Table 1</a>.</p>
            `;
        }
    }
     function getMethodenMRTProtokollAkquisitionText(lang, commonData) {
        const mrtSystem = commonData.references?.MRI_SYSTEM_SIEMENS_3T || "3.0-T Magnetom Prisma Fit (Siemens Healthineers, Erlangen, Germany)";
        const kontrastmittel = commonData.references?.CONTRAST_AGENT_PROHANCE || "Gadoteridol (ProHance, Bracco Imaging, Konstanz, Germany)";
        const t2SliceThickness = "2–3 mm";
        const t1VibeSliceThickness = "1.5 mm"; // Consistent with previous (Lurz_Schaefer_AvocadoSign_2025.pdf)
        const studyReferenceAS = APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025;


        if (lang === 'de') {
            return `
                <h3 id="methoden-mrt-protokoll-akquisition-title">MRT-Protokoll und Bildakquisition</h3>
                <p>Alle MRT-Untersuchungen wurden an einem ${mrtSystem} durchgeführt. Es kamen dedizierte Körper- und Wirbelsäulen-Array-Spulen zur Anwendung. Das standardisierte Untersuchungsprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, transversaler und koronarer Orientierung mit einer Schichtdicke von ${t2SliceThickness} (Repetitionszeit [TR]/Echozeit [TE], typischerweise 3800–4500/80–100 ms; Field of View [FOV], 200–240 mm; Matrix, 320×256 bis 384×307). Zusätzlich wurde eine axiale diffusionsgewichtete Sequenz (DWI) mit b-Werten von 0, 500 und 1000 s/mm² akquiriert (TR/TE, ca. 5000/60 ms; FOV, 240 mm; Matrix, 128×128; Schichtdicke, 4 mm). Für die Beurteilung des Avocado Signs wurde eine kontrastmittelverstärkte, transversale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung akquiriert (TR/TE, ca. 4.5/2.0 ms; Flipwinkel, 9°; Schichtdicke, ${t1VibeSliceThickness}; FOV, 220-260 mm; Matrix, rekonstruiert auf ca. 256×256). Die genauen Sequenzparameter sind der Originalpublikation zum Avocado Sign (${studyReferenceAS}) zu entnehmen.</p>
                <p>Als Kontrastmittel diente ${kontrastmittel}, ein makrozyklisches Gadolinium-Chelat, das gewichtsadaptiert (0,1 mmol/kg Körpergewicht, entsprechend 0,2 ml/kg) intravenös mit einer Flussrate von 2 ml/s, gefolgt von einem 20-ml-NaCl-Bolus, appliziert wurde. Die KM-verstärkten Sequenzen wurden unmittelbar nach Abschluss der Kontrastmittelinjektion gestartet (typischerweise arterielle Phase ca. 20-30 s, portalvenöse Phase ca. 60-70 s, Spätphase ca. 180 s post injectionem; für das AS wurde die portalvenöse Phase primär bewertet). Zur Reduktion von Darmperistaltik-Artefakten wurde Butylscopolamin (20 mg Buscopan®, Sanofi-Aventis Deutschland GmbH, Frankfurt am Main, Deutschland) intravenös zu Beginn der Untersuchung verabreicht, sofern keine Kontraindikationen bestanden. Das MRT-Protokoll war für die primäre Staging-Untersuchung sowie für das Restaging nach nRCT identisch.</p>
            `;
        } else {
            return `
                <h3 id="methoden-mrt-protokoll-akquisition-title">MRI Protocol and Image Acquisition</h3>
                <p>All MRI examinations were performed on a ${mrtSystem}. Dedicated body and spine array coils were used. The standardized examination protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, transverse, and coronal orientations with a slice thickness of ${t2SliceThickness} (repetition time [TR]/echo time [TE], typically 3800–4500/80–100 ms; field of view [FOV], 200–240 mm; matrix, 320×256 to 384×307). Additionally, an axial diffusion-weighted imaging (DWI) sequence with b-values of 0, 500, and 1000 s/mm² was acquired (TR/TE, approx. 5000/60 ms; FOV, 240 mm; matrix, 128×128; slice thickness, 4 mm). For the assessment of the Avocado Sign, a contrast-enhanced transverse T1-weighted volumetric interpolated breath-hold examination (VIBE) sequence with Dixon fat suppression was acquired (TR/TE, approx. 4.5/2.0 ms; flip angle, 9°; slice thickness, ${t1VibeSliceThickness}; FOV, 220-260 mm; matrix, reconstructed to approx. 256×256). Detailed sequence parameters can be found in the original Avocado Sign publication (${studyReferenceAS}).</p>
                <p>The contrast agent used was ${kontrastmittel}, a macrocyclic gadolinium chelate, administered intravenously at a weight-adapted dose (0.1 mmol/kg body weight, corresponding to 0.2 mL/kg) at a flow rate of 2 mL/s, followed by a 20-mL saline flush. Contrast-enhanced sequences were initiated immediately after completion of the contrast agent injection (typically arterial phase approx. 20-30 s, portal venous phase approx. 60-70 s, late phase approx. 180 s post injection; the portal venous phase was primarily evaluated for AS). To reduce bowel peristalsis artifacts, butylscopolamine (20 mg Buscopan®, Sanofi-Aventis Deutschland GmbH, Frankfurt am Main, Germany) was administered intravenously at the beginning of the examination, unless contraindicated. The MRI protocol was identical for primary staging and for restaging after nRCT.</p>
            `;
        }
    }

    function getMethodenBildanalyseAvocadoSignText(lang, commonData) {
        const studyReferenceAS = APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025;
        const radiologistExperience = commonData.references?.RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER || ["XX", "YY", "ZZ"]; 
        const fig2LinkText = lang === 'de' ? 'Abbildung 2 der Originalpublikation' : 'Figure 2 of the original publication';


        if (lang === 'de') {
            return `
                <h3 id="methoden-bildanalyse-avocado-sign-title">Bildanalyse: Avocado Sign</h3>
                <p>Die Auswertung der kontrastmittelverstärkten T1-gewichteten VIBE-Sequenzen hinsichtlich des Avocado Signs (AS) erfolgte durch zwei unabhängige Radiologen (M.L., F.K.S.; mit ${radiologistExperience[0]} bzw. ${radiologistExperience[1]} Jahren Erfahrung in der abdominellen MRT), die gegenüber den histopathologischen Befunden und den Ergebnissen der T2w-Lymphknotenanalyse verblindet waren. Das AS wurde als ein umschriebener, zentral oder exzentrisch gelegener hypointenser Kern innerhalb eines ansonsten homogen signalangehobenen (hyperintensen) mesorektalen Lymphknotens definiert, unabhängig von dessen Größe oder Form (Beispiele siehe ${studyReferenceAS}, ${fig2LinkText}). Ein Patient wurde als AS-positiv klassifiziert, wenn mindestens ein mesorektaler Lymphknoten das Avocado Sign zeigte. Bei diskordanten Befunden erfolgte eine Konsensusfindung unter Hinzunahme eines dritten, ebenfalls erfahrenen Radiologen (S.H.; mit ${radiologistExperience[2]} Jahren Erfahrung).</p>
                <p>Die Bildbeurteilung erfolgte auf einer Standard-PACS-Workstation (Picture Archiving and Communication System; Sectra AB, Linköping, Schweden). Für Patienten, die eine neoadjuvante Radiochemotherapie (nRCT) erhielten, wurden die Restaging-MRT-Aufnahmen für die AS-Beurteilung herangezogen, um eine direkte Korrelation mit dem posttherapeutischen histopathologischen Befund zu ermöglichen. Eine minimale Größenschwelle für die zu bewertenden Lymphknoten wurde nicht definiert. Extramesorektale Lymphknoten und Tumordepots waren nicht Gegenstand dieser spezifischen AS-Evaluation.</p>
            `;
        } else {
            return `
                <h3 id="methoden-bildanalyse-avocado-sign-title">Image Analysis: Avocado Sign</h3>
                <p>The contrast-enhanced T1-weighted VIBE sequences were evaluated for the Avocado Sign (AS) by two independent radiologists (M.L., F.K.S.; with ${radiologistExperience[0]} and ${radiologistExperience[1]} years of experience in abdominal MRI, respectively), blinded to histopathological findings and T2w lymph node analysis results. The AS was defined as a circumscribed, centrally or eccentrically located hypointense core within an otherwise homogeneously signal-enhanced (hyperintense) mesorectal lymph node, irrespective of its size or shape (see ${studyReferenceAS}, ${fig2LinkText} for examples). A patient was classified as AS-positive if at least one mesorectal lymph node exhibited the Avocado Sign. In cases of discordant findings, consensus was reached with a third, equally experienced radiologist (S.H.; with ${radiologistExperience[2]} years of experience).</p>
                <p>Image assessment was performed on a standard PACS (Picture Archiving and Communication System; Sectra AB, Linköping, Sweden) workstation. For patients who received neoadjuvant chemoradiotherapy (nRCT), restaging MRI scans were used for AS assessment to ensure direct correlation with post-therapeutic histopathological findings. No minimum size threshold was applied for lymph node evaluation. Extramesorectal lymph nodes and tumor deposits were not included in this specific AS evaluation.</p>
            `;
        }
    }

    function getMethodenBildanalyseT2KriterienText(lang, commonData, allKollektivStats) {
        const radiologistExperience = commonData.references?.RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER || ["XX", "YY"];
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const tableLiterarturKriterienId = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id;
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l, s) => 'N/A';

        let bfCriteriaText = '';
        const kollektiveBF = ['Gesamt', 'direkt OP', 'nRCT'];
        kollektiveBF.forEach(kolId => {
            const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;
            if (bfDef && bfDef.criteria) {
                const displayName = getKollektivDisplayName(kolId);
                const formattedCriteria = formatCriteriaFunc(bfDef.criteria, bfDef.logic, false);
                const metricValueStr = formatNumber(bfDef.metricValue, 4, 'N/A', true);
                const metricNameDisplay = bfDef.metricName || bfZielMetric;
                bfCriteriaText += `<li><strong>${displayName}</strong> (${lang === 'de' ? 'optimiert für' : 'optimized for'} ${metricNameDisplay}, ${lang === 'de' ? 'erreichter Wert' : 'achieved value'}: ${metricValueStr}): ${formattedCriteria}.</li>`;
            }
        });

        if (bfCriteriaText) {
            bfCriteriaText = `<p>${lang === 'de' ? 'Die Kriterien, die für jedes Kollektiv spezifisch optimiert wurden, um die ' + bfZielMetric + ' zu maximieren, waren:' : 'The criteria specifically optimized for each cohort to maximize ' + bfZielMetric + ' were:'}</p><ul>${bfCriteriaText}</ul>`;
        } else {
            bfCriteriaText = lang === 'de' ? `<p>Für die gewählte Zielmetrik "${bfZielMetric}" konnten keine spezifischen Brute-Force-Optimierungsergebnisse für die Darstellung der Kriterien generiert werden oder die Ergebnisse waren nicht für alle Kollektive verfügbar.</p>` : `<p>For the selected target metric "${bfZielMetric}", no specific brute-force optimization results for criteria display could be generated, or results were not available for all cohorts.</p>`;
        }

        const kohRef = APP_CONFIG.REFERENCES_FOR_PUBLICATION.KOH_2008_MORPHOLOGY.match(/\[(\d+)\]/)?.[0] || "[X]"; // Assuming references are numbered
        const barbaroRef = APP_CONFIG.REFERENCES_FOR_PUBLICATION.BARBARO_2024_RESTAGING.match(/\[(\d+)\]/)?.[0] || "[Y]";
        const beetsTanRef = APP_CONFIG.REFERENCES_FOR_PUBLICATION.BEETS_TAN_2018_ESGAR_CONSENSUS.match(/\[(\d+)\]/)?.[0] || "[Z]";
        const rutegardRef = APP_CONFIG.REFERENCES_FOR_PUBLICATION.RUTEGARD_2025_ESGAR_VALIDATION.match(/\[(\d+)\]/)?.[0] || "[W]";


        if (lang === 'de') {
            return `
                <h3 id="methoden-bildanalyse-t2-kriterien-title">Bildanalyse: T2-gewichtete Kriterien</h3>
                <p>Die morphologischen Charakteristika der mesorektalen Lymphknoten (Kurzachsendurchmesser [mm], Form ['rund', 'oval'], Kontur ['scharf', 'irregulär'], Binnensignalhomogenität ['homogen', 'heterogen'] und Signalintensität ['signalarm', 'intermediär', 'signalreich']) wurden auf den hochauflösenden T2w-Sequenzen durch dieselben zwei Radiologen (M.L., F.K.S.) im Konsens erfasst. Diese Erfassung erfolgte verblindet gegenüber dem pathologischen N-Status und dem AS-Status.</p>
                <p>Zur vergleichenden Analyse der diagnostischen Güte wurden folgende Sätze von T2w-Kriterien herangezogen:</p>
                <ol>
                    <li><strong>Literatur-basierte Kriteriensets:</strong> Eine Auswahl etablierter Kriterien aus der Fachliteratur (${kohRef}; ${barbaroRef}; ${beetsTanRef}, ${rutegardRef}) wurde implementiert. Die spezifischen Definitionen und ihre Anwendung auf die entsprechenden Subgruppen unserer Studienpopulation sind in <a href="${_getSafeLink(tableLiterarturKriterienId)}">Tabelle Methoden 1</a> detailliert beschrieben.</li>
                    <li><strong>Datengetriebene optimierte T2-Kriteriensets (explorativ):</strong> Für jedes Hauptkollektiv (Gesamt, Direkt OP, nRCT) wurde mittels eines Algorithmus diejenige Kombination aus den fünf T2-Merkmalen und einer logischen Verknüpfung (UND/ODER) identifiziert, welche die Zielmetrik "${bfZielMetric}" maximierte.
                        ${bfCriteriaText}
                        <p class="small text-muted">Diese datengetrieben optimierten Kriterien sind spezifisch für die jeweilige Kohorte und die gewählte Zielmetrik dieser explorativen Analyse. Sie dienen primär dem bestmöglichen Vergleich der diagnostischen Aussagekraft verschiedener Ansätze innerhalb dieser spezifischen Untersuchung und stellen keine allgemeingültige Empfehlung für die klinische Praxis dar, da das Risiko einer Überanpassung an den Datensatz besteht.</p>
                    </li>
                </ol>
                <p>Ein Lymphknoten wurde als T2-positiv gewertet, wenn er die Bedingungen des jeweiligen Kriteriensets erfüllte. Ein Patient galt als T2-positiv, wenn mindestens ein Lymphknoten als T2-positiv eingestuft wurde.</p>
            `;
        } else {
            return `
                <h3 id="methoden-bildanalyse-t2-kriterien-title">Image Analysis: T2-weighted Criteria</h3>
                <p>The morphological characteristics of mesorectal lymph nodes (short-axis diameter [mm], shape ['round', 'oval'], border ['smooth', 'irregular'], internal signal homogeneity ['homogeneous', 'heterogeneous'], and signal intensity ['low', 'intermediate', 'high']) were assessed on high-resolution T2w sequences by the same two radiologists (M.L., F.K.S.) by consensus. This assessment was performed blinded to the pathological N-status and AS status.</p>
                <p>For the comparative analysis of diagnostic performance, the following sets of T2w criteria were utilized:</p>
                <ol>
                    <li><strong>Literature-based criteria sets:</strong> A selection of established criteria from the literature (${kohRef}; ${barbaroRef}; ${beetsTanRef}, ${rutegardRef}) was implemented. The specific definitions and their application to the respective subgroups of our study population are detailed in <a href="${_getSafeLink(tableLiterarturKriterienId)}">Methods Table 1</a>.</li>
                    <li><strong>Data-driven optimized T2 criteria sets (exploratory):</strong> For each main cohort (Overall, Upfront Surgery, nRCT), an algorithm was used to identify the combination of the five T2 features and a logical operator (AND/OR) that maximized the target metric "${bfZielMetric}".
                        ${bfCriteriaText}
                        <p class="small text-muted">These data-driven optimized criteria are specific to the respective cohort and the chosen target metric of this exploratory analysis. They primarily serve for the best possible comparison of the diagnostic performance of different approaches within this specific investigation and do not represent a general recommendation for clinical practice due to the risk of overfitting to the dataset.</p>
                    </li>
                </ol>
                <p>A lymph node was considered T2-positive if it fulfilled the conditions of the respective criteria set. A patient was considered T2-positive if at least one lymph node was classified as T2-positive.</p>
            `;
        }
    }

    function getMethodenReferenzstandardHistopathologieText(lang) {
        if (lang === 'de') {
            return `
                <h3 id="methoden-referenzstandard-histopathologie-title">Referenzstandard: Histopathologie</h3>
                <p>Die definitive Bestimmung des Lymphknotenstatus erfolgte durch die histopathologische Untersuchung der Operationspräparate nach totaler mesorektaler Exzision (TME). Alle Präparate wurden standardisiert aufgearbeitet. Erfahrene Pathologen untersuchten sämtliche im Mesorektum identifizierten Lymphknoten mikroskopisch auf das Vorhandensein von Tumorzellen. Ein Patient wurde als N-positiv (N+) klassifiziert, wenn mindestens ein Lymphknoten Metastasen aufwies; andernfalls als N-negativ (N0). Die Anzahl der befallenen und der insgesamt untersuchten Lymphknoten wurde dokumentiert.</p>
            `;
        } else {
            return `
                <h3 id="methoden-referenzstandard-histopathologie-title">Reference Standard: Histopathology</h3>
                <p>The definitive determination of lymph node status was based on the histopathological examination of surgical specimens after total mesorectal excision (TME). All specimens were processed according to standardized protocols. Experienced pathologists microscopically examined all lymph nodes identified within the mesorectum for the presence of tumor cells. A patient was classified as N-positive (N+) if at least one lymph node contained metastases; otherwise, as N-negative (N0). The number of involved and total examined lymph nodes was documented.</p>
            `;
        }
    }
    function getMethodenStatistischeAnalyseMethodenText(lang, commonData) {
        const alphaLevel = commonData.significanceLevel || 0.05;
        const alphaText = formatNumber(alphaLevel, 2, '0.05', true).replace('.', lang === 'de' ? ',' : '.');
        const bootstrapN = commonData.bootstrapReplications || 1000;
        const appNameAndVersion = `${commonData.appName} v${commonData.appVersion}`;
        const softwareUsed = `R Version 4.3.1 (R Foundation for Statistical Computing, Vienna, Austria) und die anwendungsspezifische Software ${appNameAndVersion}`;
        const ciMethodProportion = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION || "Wilson Score";
        const ciMethodEffectSize = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE || "Bootstrap Percentile";


        if (lang === 'de') {
            return `
                <h3 id="methoden-statistische-analyse-methoden-title">Statistische Analyse</h3>
                <p>Kontinuierliche Variablen wurden als Median mit Interquartilsabstand (IQR) dargestellt, kategoriale Variablen als absolute und relative Häufigkeiten. Die diagnostische Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets wurde mittels Sensitivität, Spezifität, positivem prädiktiven Wert (PPV), negativem prädiktiven Wert (NPV), Genauigkeit (Accuracy, ACC), Balanced Accuracy (BalAcc) und der Fläche unter der Receiver Operating Characteristic-Kurve (AUC) evaluiert. Für diese Metriken wurden zweiseitige 95%-Konfidenzintervalle (KI) berechnet; für Proportionen (Sensitivität, Spezifität, PPV, NPV, ACC) wurde die ${ciMethodProportion}-Methode verwendet, für AUC/Balanced Accuracy und den F1-Score die ${ciMethodEffectSize}-Methode (${formatNumber(bootstrapN,0,true)} Replikationen).</p>
                <p>Der statistische Vergleich der diagnostischen Leistung (ACC, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe (gepaarte Daten) erfolgte mittels des McNemar-Tests für gepaarte nominale Daten bzw. des DeLong-Tests für den Vergleich von AUC-Werten. Unterschiede in der diagnostischen Güte zwischen unabhängigen Subgruppen (z.B. Direkt-OP vs. nRCT) wurden mittels Fisher's Exact Test (für Raten) oder Z-Test (für AUCs, basierend auf Bootstrap-Standardfehlern) untersucht. Ein P-Wert &lt; ${alphaText} (zweiseitig) wurde als statistisch signifikant erachtet. Alle statistischen Analysen wurden mit ${softwareUsed} durchgeführt. Initialen des Statistikers (falls zutreffend und Autor): [Initialen].</p>
            `;
        } else {
            return `
                <h3 id="methoden-statistische-analyse-methoden-title">Statistical Analysis</h3>
                <p>Continuous variables were presented as median and interquartile range (IQR), and categorical variables as absolute and relative frequencies. Diagnostic performance of the Avocado Sign and the various T2 criteria sets was evaluated using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy (ACC), balanced accuracy (BalAcc), and area under the receiver operating characteristic curve (AUC). For these metrics, two-sided 95% confidence intervals (CI) were calculated; the ${ciMethodProportion} method was used for proportions (sensitivity, specificity, PPV, NPV, ACC), and the ${ciMethodEffectSize} method (${formatNumber(bootstrapN,0,true)} replications) for AUC/balanced accuracy and F1-score.</p>
                <p>Statistical comparison of diagnostic performance (ACC, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group (paired data) was performed using McNemar's test for paired nominal data and DeLong's test for AUC comparison. Differences in diagnostic performance between independent subgroups (e.g., upfront surgery vs. nRCT) were assessed using Fisher's exact test (for rates) or a Z-test (for AUCs, based on bootstrap standard errors). A two-sided P value &lt; ${alphaText} was considered statistically significant. All statistical analyses were performed using ${softwareUsed}. Initials of statistician (if applicable and an author): [Initials].</p>
            `;
        }
    }

    return Object.freeze({
        getMethodenStudienanlageEthikText,
        getMethodenPatientenkohorteText,
        getMethodenMRTProtokollAkquisitionText,
        getMethodenBildanalyseAvocadoSignText,
        getMethodenBildanalyseT2KriterienText,
        getMethodenReferenzstandardHistopathologieText,
        getMethodenStatistischeAnalyseMethodenText
    });

})();
