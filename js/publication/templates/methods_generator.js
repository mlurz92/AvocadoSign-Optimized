const methodsGenerator = (() => {

    function _getSectionTitle(sectionId, lang) {
        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === 'materials_methods');
        const subSectionConfig = mainSectionConfig?.subSections.find(ss => ss.id === sectionId);
        if (subSectionConfig && UI_TEXTS.publikationTab?.sectionLabels?.[subSectionConfig.labelKey]) {
            return UI_TEXTS.publikationTab.sectionLabels[subSectionConfig.labelKey];
        }
        const fallbackTitle = sectionId.replace('methoden_', '').replace(/_/g, ' ');
        return fallbackTitle.charAt(0).toUpperCase() + fallbackTitle.slice(1);
    }

    function _generateStudyDesignEthics(aggregatedData, lang) {
        const common = aggregatedData.common;
        const ethicsVote = common.references?.ETHICS_VOTE_LEIPZIG || (lang === 'de' ? "Ethikvotum Nr. XYZ, Ethikkommission Musterstadt" : "Ethics Vote No. XYZ, Ethics Committee Model City");
        const lurzSchaeferRefShort = common.references?.LURZ_SCHAEFER_2025_AS ? (lang === 'de' ? '(Lurz & Schäfer, 2025)' : '(Lurz & Schäfer, 2025)') : '';
        const title = _getSectionTitle('methoden_studienanlage_ethik', lang);

        if (lang === 'de') {
            return `
                <h3 id="methoden_studienanlage_ethik-title">${title}</h3>
                <p>Diese retrospektive, monozentrische Studie wurde von der zuständigen lokalen Ethikkommission genehmigt (${ethicsVote}). Aufgrund des retrospektiven Charakters der Analyse auf vollständig pseudonymisierten Daten und da für die Primärstudie ${lurzSchaeferRefShort} ein generelles Einverständnis zur wissenschaftlichen Auswertung vorlag, wurde von der Ethikkommission auf ein erneutes Einholen eines schriftlichen Einverständnisses der Patienten für diese spezifische erweiterte Auswertung verzichtet. Die Studie wurde in Übereinstimmung mit den Grundsätzen der Deklaration von Helsinki und deren späteren Änderungen oder vergleichbaren ethischen Standards durchgeführt. Die Autoren hatten während der gesamten Studie vollen Zugriff auf alle Daten.</p>
            `;
        } else {
            return `
                <h3 id="methoden_studienanlage_ethik-title">${title}</h3>
                <p>This retrospective, single-center study was approved by the local institutional review board (${ethicsVote}). Given the retrospective nature of this analysis on fully pseudonymized data, and as general consent for scientific evaluation was provided as part of the primary study ${lurzSchaeferRefShort}, the ethics committee waived the need for re-obtaining written informed consent from patients for this specific extended evaluation. The study was conducted in accordance with the ethical principles of the Declaration of Helsinki and its later amendments or comparable ethical standards. The authors had full access to all data in the study.</p>
            `;
        }
    }

    function _generatePatientCohort(aggregatedData, lang) {
        const common = aggregatedData.common;
        const studyPeriod = common.references?.STUDY_PERIOD_2020_2023 || (lang === 'de' ? "Januar 2020 und November 2023" : "January 2020 and November 2023");
        const flowDiagramId = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.id;
        const flowDiagramLabel = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.radiologyLabel;
        const title = _getSectionTitle('methoden_patientenkohorte', lang);

        if (lang === 'de') {
            return `
                <h3 id="methoden_patientenkohorte-title">${title}</h3>
                <p>In diese Studie wurden konsekutiv Patienten eingeschlossen, bei denen zwischen ${studyPeriod.replace(" and ", " und ")} ein histologisch gesichertes Adenokarzinom des Rektums diagnostiziert wurde und die eine primäre Staging-MRT-Untersuchung sowie die anschließende Therapie und Operation am Klinikum St. Georg, Leipzig, Deutschland, erhielten. Einschlusskriterien waren ein Alter von mindestens 18 Jahren und die Fähigkeit, eine informierte Einwilligung zu erteilen. Ausschlusskriterien umfassten Kontraindikationen gegen eine MRT-Untersuchung oder die Gabe von Gadolinium-basiertem Kontrastmittel, das Vorliegen von Fernmetastasen zum Zeitpunkt der Diagnose (M1-Stadium) oder eine bereits extern erfolgte Vorbehandlung, welche die standardisierte Bildgebung und Therapieplanung im eigenen Zentrum unmöglich machte. Die Patientenrekrutierung ist in <a href="#${flowDiagramId}">${flowDiagramLabel}</a> dargestellt.</p>
            `;
        } else {
            return `
                <h3 id="methoden_patientenkohorte-title">${title}</h3>
                <p>Consecutive patients diagnosed with histologically confirmed adenocarcinoma of the rectum between ${studyPeriod} who underwent primary staging MRI, subsequent therapy, and surgery at Klinikum St. Georg, Leipzig, Germany, were included in this study. Inclusion criteria were an age of at least 18 years and the ability to provide informed consent. Exclusion criteria comprised contraindications to MRI examination or administration of gadolinium-based contrast material, presence of distant metastases at diagnosis (M1 stage), or prior treatment performed externally that precluded standardized imaging and treatment planning at our institution. Patient recruitment is shown in <a href="#${flowDiagramId}">${flowDiagramLabel}</a>.</p>
            `;
        }
    }

    function _generateMriProtocol(aggregatedData, lang) {
        const common = aggregatedData.common;
        const mrtSystem = common.references?.MRI_SYSTEM_SIEMENS_3T || (lang === 'de' ? "3.0-T System (Hersteller, Stadt, Land)" : "3.0-T system (Manufacturer, City, Country)");
        const kontrastmittel = common.references?.CONTRAST_AGENT_PROHANCE || (lang === 'de' ? "Gadoteridol (Markenname; Hersteller)" : "Gadoteridol (Brand Name; Manufacturer)");
        const t2SliceThickness = "2–3 mm";
        const t1VibeSliceThickness = common.references?.LURZ_SCHAEFER_2025_AS ? "1.5 mm" : (lang === 'de' ? "1.5 mm (gemäß Primärstudie)" : "1.5 mm (as per primary study)");
        const title = _getSectionTitle('methoden_mrt_protokoll_akquisition', lang);

        if (lang === 'de') {
            return `
                <h3 id="methoden_mrt_protokoll_akquisition-title">${title}</h3>
                <p>Alle MRT-Untersuchungen wurden an einem ${mrtSystem} mit dedizierten Körper- und Wirbelsäulen-Array-Spulen durchgeführt. Das Protokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen (sagittal, transversal, koronal; Schichtdicke, ${t2SliceThickness}; Repetitionszeit [TR]/Echozeit [TE], typ. 3800–4500/80–100 ms; Field of View [FOV], 200–240 mm; Matrix, ca. 320×256–384×307) und eine axiale diffusionsgewichtete Sequenz (DWI; b-Werte 0, 500, 1000 s/mm²). Für das Avocado Sign wurde eine kontrastmittelverstärkte, transversale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung akquiriert (TR/TE, ca. 4.5/2.0 ms; Flipwinkel, 9°; Schichtdicke, ${t1VibeSliceThickness}). Details sind der Originalpublikation zum Avocado Sign [${common.references?.LURZ_SCHAEFER_2025_AS || "Ref"}] zu entnehmen.</p>
                <p>Als Kontrastmittel diente ${kontrastmittel}, gewichtsadaptiert (0,1 mmol/kg KG) appliziert. Die KM-verstärkten Sequenzen wurden in der portalvenösen Phase (ca. 60–70 s post injectionem) akquiriert. Butylscopolamin (20 mg Buscopan®; Sanofi-Aventis) wurde zur Peristaltikreduktion verabreicht. Das Protokoll war für Staging und Restaging identisch.</p>
            `;
        } else {
            return `
                <h3 id="methoden_mrt_protokoll_akquisition-title">${title}</h3>
                <p>All MRI examinations were performed on a ${mrtSystem} using dedicated body and spine array coils. The protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences (sagittal, axial, coronal; slice thickness, ${t2SliceThickness}; repetition time [TR]/echo time [TE], typ. 3800–4500/80–100 ms; field of view [FOV], 200–240 mm; matrix, approx. 320×256–384×307) and an axial diffusion-weighted imaging (DWI; b-values 0, 500, 1000 s/mm²). For the Avocado Sign, a contrast-enhanced transverse T1-weighted volumetric interpolated breath-hold examination (VIBE) sequence with Dixon fat suppression was acquired (TR/TE, approx. 4.5/2.0 ms; flip angle, 9°; slice thickness, ${t1VibeSliceThickness}). Details are available in the original Avocado Sign publication [${common.references?.LURZ_SCHAEFER_2025_AS || "Ref"}].</p>
                <p>The contrast agent used was ${kontrastmittel}, administered weight-adapted (0.1 mmol/kg body weight). Contrast-enhanced sequences were acquired in the portal venous phase (approx. 60–70 s post injection). Butylscopolamine (20 mg Buscopan®; Sanofi-Aventis) was administered for peristalsis reduction. The protocol was identical for staging and restaging.</p>
            `;
        }
    }

    function _generateImageAnalysisAS(aggregatedData, lang) {
        const common = aggregatedData.common;
        const radiologistExperience = common.references?.RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER || ["XX", "YY", "ZZ"];
        const title = _getSectionTitle('methoden_bildanalyse_avocado_sign', lang);
        const autorML = "M.L."; 
        const autorFKS = "F.K.S.";
        const autorSH = "S.H.";


        if (lang === 'de') {
            return `
                <h3 id="methoden_bildanalyse_avocado_sign-title">${title}</h3>
                <p>Die Auswertung der KM-T1w-VIBE-Sequenzen hinsichtlich des Avocado Signs (AS) erfolgte durch zwei unabhängige Radiologen (${autorML}, ${autorFKS}; mit ${radiologistExperience[0]} bzw. ${radiologistExperience[1]} Jahren Erfahrung in abdomineller MRT), verblindet gegenüber Histopathologie und T2w-Analyse. Das AS wurde als umschriebener, zentral/exzentrisch gelegener hypointenser Kern innerhalb eines sonst homogen hyperintensen mesorektalen Lymphknotens definiert, unabhängig von Größe/Form. Ein Patient galt als AS-positiv bei mindestens einem AS-positiven Lymphknoten. Bei Diskordanz erfolgte Konsensusfindung mit einem dritten erfahrenen Radiologen (${autorSH}; ${radiologistExperience[2]} Jahre Erfahrung). Die Bildbeurteilung erfolgte auf einer Standard-PACS-Workstation (Sectra AB, Linköping, Schweden). Bei nRCT-Patienten wurden Restaging-MRTs bewertet.</p>
            `;
        } else {
            return `
                <h3 id="methoden_bildanalyse_avocado_sign-title">${title}</h3>
                <p>Evaluation of CE-T1w VIBE sequences for the Avocado Sign (AS) was performed by two independent radiologists (${autorML}, ${autorFKS}; with ${radiologistExperience[0]} and ${radiologistExperience[1]} years of experience in abdominal MRI, respectively), blinded to histopathology and T2w analysis. AS was defined as a circumscribed, central/eccentric hypointense core within an otherwise homogeneously hyperintense mesorectal lymph node, irrespective of size/shape. A patient was AS-positive if at least one lymph node showed AS. Discrepancies were resolved by consensus with a third experienced radiologist (${autorSH}; ${radiologistExperience[2]} years of experience). Image assessment used a standard PACS workstation (Sectra AB, Linköping, Sweden). For nCRT patients, restaging MRIs were assessed.</p>
            `;
        }
    }

    function _generateImageAnalysisT2(aggregatedData, lang) {
        const common = aggregatedData.common;
        const radiologistExperience = common.references?.RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER || ["XX", "YY"];
        const bfZielMetricKey = common.targetBruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        let bfZielMetricDisplay = bfZielMetricKey;
         const metricOption = PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === bfZielMetricKey);
        if (metricOption) {
            bfZielMetricDisplay = lang === 'de' ? metricOption.labelDe : metricOption.labelEn;
        }

        const tableLiteraturId = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id;
        const tableLiteraturLabel = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.radiologyLabel;
        const title = _getSectionTitle('methoden_bildanalyse_t2_kriterien', lang);
        const autorML = "M.L."; 
        const autorFKS = "F.K.S.";

        let bfCriteriaText = '';
        const kollektiveBF = ['Gesamt', 'direkt OP', 'nRCT'];
        kollektiveBF.forEach(kolId => {
            const bfDef = aggregatedData.allKollektivStats?.[kolId]?.bruteforce_definition;
            if (bfDef && bfDef.criteria) {
                const displayName = getKollektivDisplayName(kolId);
                const formattedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, false);
                const metricValueStr = radiologyFormatter.formatRadiologyNumber(bfDef.metricValue, 3, true);
                const metricNameDisplay = bfDef.metricName || bfZielMetricDisplay;
                
                if (lang === 'de') {
                    bfCriteriaText += `<li><strong>${displayName}</strong> (optimiert für ${metricNameDisplay}, erreichter Wert: ${metricValueStr}): ${formattedCriteria}.</li>`;
                } else {
                    bfCriteriaText += `<li><strong>${displayName}</strong> (optimized for ${metricNameDisplay}, achieved value: ${metricValueStr}): ${formattedCriteria}.</li>`;
                }
            }
        });
        if (!bfCriteriaText) {
            bfCriteriaText = lang === 'de' ? `<li>Für die gewählte Zielmetrik "${bfZielMetricDisplay}" konnten keine spezifischen Brute-Force-Optimierungsergebnisse für die Kriteriendarstellung generiert werden.</li>` : `<li>For the selected target metric "${bfZielMetricDisplay}", no specific brute-force optimization results for criteria display could be generated.</li>`;
        }


        if (lang === 'de') {
            return `
                <h3 id="methoden_bildanalyse_t2_kriterien-title">${title}</h3>
                <p>Morphologische Lymphknotencharakteristika (Kurzachsendurchmesser, Form, Kontur, Binnensignalhomogenität, Signalintensität) wurden auf T2w-Sequenzen durch dieselben zwei Radiologen (${autorML}, ${autorFKS}) im Konsens erfasst, verblindet gegenüber N-Status und AS-Status. Verwendete T2w-Kriteriensets:</p>
                <ol>
                    <li><strong>Literatur-basierte Kriteriensets:</strong> Eine Auswahl etablierter Kriterien [${common.references?.KOH_2008_MORPHOLOGY || "Ref Koh"}, ${common.references?.BARBARO_2024_RESTAGING || "Ref Barbaro"}, ${common.references?.BEETS_TAN_2018_ESGAR_CONSENSUS || "Ref ESGAR"}/${common.references?.RUTEGARD_2025_ESGAR_VALIDATION || "Ref Rutegard"}] wurde implementiert (Details siehe <a href="#${tableLiteraturId}">${tableLiteraturLabel}</a>).</li>
                    <li><strong>Datengetriebene optimierte T2-Kriteriensets (explorativ):</strong> Für jedes Hauptkollektiv (Gesamt, Direkt OP, nRCT) wurde mittels Brute-Force-Algorithmus die Kombination aus T2-Merkmalen und Logik (UND/ODER) identifiziert, welche die Zielmetrik "${bfZielMetricDisplay}" maximierte:<ul>${bfCriteriaText}</ul><p class="small text-muted">Diese optimierten Kriterien sind spezifisch für Kohorte und Zielmetrik dieser explorativen Analyse und keine allgemeingültige Empfehlung.</p></li>
                </ol>
                <p>Ein Patient galt als T2-positiv, wenn mindestens ein Lymphknoten als T2-positiv gemäß dem jeweiligen Set eingestuft wurde.</p>
            `;
        } else {
            return `
                <h3 id="methoden_bildanalyse_t2_kriterien-title">${title}</h3>
                <p>Morphologic lymph node characteristics (short-axis diameter, shape, border, internal signal homogeneity, signal intensity) were assessed on T2w sequences by the same two radiologists (${autorML}, ${autorFKS}) by consensus, blinded to N-status and AS status. Utilized T2w criteria sets:</p>
                <ol>
                    <li><strong>Literature-based criteria sets:</strong> A selection of established criteria [${common.references?.KOH_2008_MORPHOLOGY || "Ref Koh"}, ${common.references?.BARBARO_2024_RESTAGING || "Ref Barbaro"}, ${common.references?.BEETS_TAN_2018_ESGAR_CONSENSUS || "Ref ESGAR"}/${common.references?.RUTEGARD_2025_ESGAR_VALIDATION || "Ref Rutegard"}] was implemented (details see <a href="#${tableLiteraturId}">${tableLiteraturLabel}</a>).</li>
                    <li><strong>Data-driven optimized T2 criteria sets (exploratory):</strong> For each main cohort (Overall, Upfront Surgery, nCRT), a brute-force algorithm identified the combination of T2 features and logical operator (AND/OR) that maximized the target metric "${bfZielMetricDisplay}":<ul>${bfCriteriaText}</ul><p class="small text-muted">These optimized criteria are specific to the cohort and target metric of this exploratory analysis and not a general recommendation for clinical practice.</p></li>
                </ol>
                <p>A patient was considered T2-positive if at least one lymph node was classified as T2-positive according to the respective set.</p>
            `;
        }
    }

    function _generateReferenceStandard(aggregatedData, lang) {
        const title = _getSectionTitle('methoden_referenzstandard_histopathologie', lang);
        if (lang === 'de') {
            return `
                <h3 id="methoden_referenzstandard_histopathologie-title">${title}</h3>
                <p>Die definitive Bestimmung des Lymphknotenstatus erfolgte durch histopathologische Untersuchung der Operationspräparate nach totaler mesorektaler Exzision. Erfahrene Pathologen untersuchten alle identifizierten Lymphknoten mikroskopisch auf Tumorzellen. Ein Patient wurde als N-positiv (N+) bei mindestens einer Lymphknotenmetastase klassifiziert, andernfalls als N-negativ (N0).</p>
            `;
        } else {
            return `
                <h3 id="methoden_referenzstandard_histopathologie-title">${title}</h3>
                <p>Definitive lymph node status was determined by histopathological examination of surgical specimens after total mesorectal excision. Experienced pathologists microscopically examined all identified lymph nodes for tumor cells. A patient was classified as N-positive (N+) if at least one lymph node contained metastases; otherwise, as N-negative (N0).</p>
            `;
        }
    }

    function _generateStatisticalAnalysis(aggregatedData, lang) {
        const common = aggregatedData.common;
        const alphaLevel = common.appConfig.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL || 0.05;
        const alphaText = radiologyFormatter.formatRadiologyNumber(alphaLevel, 2, true); // ".05"
        const bootstrapN = common.appConfig.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS || 1000;
        const formattedBootstrapN = radiologyFormatter.formatRadiologyNumber(bootstrapN, 0);
        const appNameAndVersion = `${common.appName} ${common.appVersion}`;
        const softwareUsed = `R Version 4.3.1 (R Foundation for Statistical Computing, Vienna, Austria) ${lang === 'de' ? 'und die anwendungsspezifische Software' : 'and the application-specific software'} ${appNameAndVersion}`;
        const ciMethodProportion = common.appConfig.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION || "Wilson Score";
        const ciMethodEffectSize = common.appConfig.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE || "Bootstrap Percentile";
        const title = _getSectionTitle('methoden_statistische_analyse_methoden', lang);

        if (lang === 'de') {
            return `
                <h3 id="methoden_statistische_analyse_methoden-title">${title}</h3>
                <p>Kontinuierliche Variablen wurden als Median mit Interquartilsabstand (IQR) oder Mittelwert ± Standardabweichung (SD) dargestellt, kategoriale als absolute und relative Häufigkeiten. Diagnostische Güte (Sensitivität, Spezifität, positiver [PPV] und negativer prädiktiver Wert [NPV], Genauigkeit [ACC], Balanced ACC, Fläche unter der ROC-Kurve [AUC]) wurde evaluiert. Zweiseitige 95%-Konfidenzintervalle (KI) wurden für Proportionen mittels ${ciMethodProportion}-Methode, für AUC/Balanced ACC und F1-Score mittels ${ciMethodEffectSize}-Methode (${formattedBootstrapN} Replikationen) berechnet. Der McNemar-Test (für ACC) und DeLong-Test (für AUCs) verglichen gepaarte Daten. Ein P-Wert < ${alphaText} (zweiseitig) galt als statistisch signifikant. Analysen erfolgten mit ${softwareUsed}.</p>
            `;
        } else {
            return `
                <h3 id="methoden_statistische_analyse_methoden-title">${title}</h3>
                <p>Continuous variables were presented as median and interquartile range (IQR) or mean ± standard deviation (SD), and categorical variables as absolute and relative frequencies. Diagnostic performance (sensitivity, specificity, positive [PPV] and negative predictive value [NPV], accuracy [ACC], balanced ACC, area under the ROC curve [AUC]) was evaluated. Two-sided 95% confidence intervals (CI) were calculated using the ${ciMethodProportion} method for proportions, and the ${ciMethodEffectSize} method (${formattedBootstrapN} replications) for AUC/balanced ACC and F1-score. McNemar test (for ACC) and DeLong test (for AUCs) compared paired data. A two-sided P value < ${alphaText} was considered statistically significant. Analyses were performed using ${softwareUsed}.</p>
            `;
        }
    }


    function generateMethodsSection(aggregatedData, lang = 'de') {
        if (!aggregatedData || !aggregatedData.common || !aggregatedData.allKollektivStats) {
            return lang === 'de' ? "<h3>Material und Methoden</h3><p>Sektion konnte nicht generiert werden: Daten fehlen.</p>" : "<h3>Materials and Methods</h3><p>Section could not be generated: data missing.</p>";
        }
        
        let html = `<h2 id="materials_methods-title">${UI_TEXTS.publikationTab.sectionLabels.methoden}</h2>`;
        html += _generateStudyDesignEthics(aggregatedData, lang);
        html += _generatePatientCohort(aggregatedData, lang);
        html += _generateMriProtocol(aggregatedData, lang);
        html += _generateImageAnalysisAS(aggregatedData, lang);
        html += _generateImageAnalysisT2(aggregatedData, lang);
        html += _generateReferenceStandard(aggregatedData, lang);
        html += _generateStatisticalAnalysis(aggregatedData, lang);

        return html;
    }

    return Object.freeze({
        generateMethodsSection,
        generateStudyDesignEthicsText: _generateStudyDesignEthics,
        generatePatientCohortText: _generatePatientCohort,
        generateMriProtocolText: _generateMriProtocol,
        generateImageAnalysisASText: _generateImageAnalysisAS,
        generateImageAnalysisT2Text: _generateImageAnalysisT2,
        generateReferenceStandardText: _generateReferenceStandard,
        generateStatisticalAnalysisText: _generateStatisticalAnalysis
    });

})();
