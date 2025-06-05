const publicationTextGenerator = (() => {

    function fCI(metric, digits = 1, isPercent = true, lang = 'de') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return 'N/A';

        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 'N/A';
            let formattedNum;
            if (isP) {
                formattedNum = formatPercent(val, d, 'N/A');
            } else {
                formattedNum = formatNumber(val, d, 'N/A', lang === 'en');
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
        const nText = lang === 'de' ? `N=${formatNumber(n, 0, 'N/A')}` : `n=${formatNumber(n, 0, 'N/A')}`;
        return `${name} (${nText})`;
    }

    function _getSafeLink(elementId){
        if (!elementId) return '#';
        return `#${elementId}`;
    }

    function getAbstractText(lang, allKollektivStats, commonData) {
        const gesamtStats = allKollektivStats?.Gesamt;
        const asGesamt = gesamtStats?.gueteAS;
        const bfGesamtStats = gesamtStats?.gueteT2_bruteforce;
        const vergleichASvsBFGesamt = gesamtStats?.vergleichASvsT2_bruteforce;
        
        const nGesamt = commonData.nGesamt || 0;
        const medianAge = gesamtStats?.deskriptiv?.alter?.median !== undefined ? formatNumber(gesamtStats.deskriptiv.alter.median, 0) : 'N/A';
        const iqrAgeLower = gesamtStats?.deskriptiv?.alter?.q1 !== undefined ? formatNumber(gesamtStats.deskriptiv.alter.q1, 0) : 'N/A';
        const iqrAgeUpper = gesamtStats?.deskriptiv?.alter?.q3 !== undefined ? formatNumber(gesamtStats.deskriptiv.alter.q3, 0) : 'N/A';
        const ageRangeText = (medianAge !== 'N/A' && iqrAgeLower !== 'N/A' && iqrAgeUpper !== 'N/A') ? 
                             (lang === 'de' ? `${medianAge} Jahre (IQR: ${iqrAgeLower}–${iqrAgeUpper} Jahre)` : `${medianAge} years (IQR: ${iqrAgeLower}–${iqrAgeUpper} years)`)
                             : (lang === 'de' ? 'nicht verfügbar' : 'not available');
        
        const anzahlMaenner = gesamtStats?.deskriptiv?.geschlecht?.m || 0;
        const anzahlFrauen = gesamtStats?.deskriptiv?.geschlecht?.f || 0;
        const sexText = lang === 'de' ? `${anzahlMaenner} Männer, ${anzahlFrauen} Frauen` : `${anzahlMaenner} men, ${anzahlFrauen} women`;

        let aucASGesamt = asGesamt?.auc?.value !== undefined ? formatNumber(asGesamt.auc.value, 2, 'N/A', lang === 'en') : 'N/A';
        let sensASGesamt = asGesamt?.sens?.value !== undefined ? formatPercent(asGesamt.sens.value, 1, 'N/A') : 'N/A';
        let spezASGesamt = asGesamt?.spez?.value !== undefined ? formatPercent(asGesamt.spez.value, 1, 'N/A') : 'N/A';
        let accASGesamt = asGesamt?.acc?.value !== undefined ? formatPercent(asGesamt.acc.value, 1, 'N/A') : 'N/A';
        
        let sensCI = asGesamt?.sens?.ci ? `${formatPercent(asGesamt.sens.ci.lower,1)}–${formatPercent(asGesamt.sens.ci.upper,1)}` : 'N/A';
        let spezCI = asGesamt?.spez?.ci ? `${formatPercent(asGesamt.spez.ci.lower,1)}–${formatPercent(asGesamt.spez.ci.upper,1)}` : 'N/A';
        let aucCI = asGesamt?.auc?.ci ? `${formatNumber(asGesamt.auc.ci.lower,2,undefined,lang==='en')}–${formatNumber(asGesamt.auc.ci.upper,2,undefined,lang==='en')}` : 'N/A';


        let aucT2OptimiertGesamt = bfGesamtStats?.auc?.value !== undefined ? formatNumber(bfGesamtStats.auc.value, 2, 'N/A', lang === 'en') : 'N/A';
        let pWertVergleich = vergleichASvsBFGesamt?.delong?.pValue !== undefined ? getPValueText(vergleichASvsBFGesamt.delong.pValue, lang, true) : 'N/A';
        const studyPeriod = commonData.references?.STUDY_PERIOD_2020_2023 || (lang === 'de' ? "Januar 2020 und November 2023" : "January 2020 and November 2023");

        const abstractDe = `
            <p><strong>Hintergrund:</strong> Eine genaue prätherapeutische Bestimmung des mesorektalen Lymphknotenstatus (N-Status) ist entscheidend für die Therapieentscheidung beim Rektumkarzinom. Standard-MRT-Kriterien (Magnetresonanztomographie) zeigen hierbei Limitierungen.</p>
            <p><strong>Ziel:</strong> Evaluation der diagnostischen Leistung des "Avocado Sign" (AS), eines neuartigen kontrastmittelverstärkten (KM) MRT-Markers, im Vergleich zu Literatur-basierten und für die Studienkohorte optimierten T2-gewichteten (T2w) Kriterien zur Prädiktion des N-Status.</p>
            <p><strong>Material und Methoden:</strong> Diese retrospektive, von der Ethikkommission genehmigte Monozenterstudie analysierte Daten von Patienten mit histologisch gesichertem Rektumkarzinom, die zwischen ${studyPeriod.replace(" and ", " und ")} konsekutiv eingeschlossen wurden. Zwei verblindete Radiologen evaluierten das AS (hypointenser Kern in hyperintensem Lymphknoten auf T1w-KM-Sequenzen) und morphologische T2w-Kriterien. Die histopathologische Untersuchung der Operationspräparate diente als Referenzstandard. Sensitivität, Spezifität, Genauigkeit (Accuracy, ACC) und die Fläche unter der Receiver-Operating-Characteristic-Kurve (AUC) wurden mit 95%-Konfidenzintervallen (KI) berechnet und die AUC-Werte mittels DeLong-Test verglichen.</p>
            <p><strong>Ergebnisse:</strong> Es wurden ${formatNumber(nGesamt,0)} Patienten (medianes Alter, ${ageRangeText}; ${sexText}) analysiert. Das AS zeigte eine Sensitivität von ${sensASGesamt} (95%-KI: ${sensCI}), eine Spezifität von ${spezASGesamt} (95%-KI: ${spezCI}), eine ACC von ${accASGesamt} und eine AUC von ${aucASGesamt} (95%-KI: ${aucCI}). Für die optimierten T2w-Kriterien betrug die AUC ${aucT2OptimiertGesamt}. Der Unterschied der AUC zwischen AS und optimierten T2w-Kriterien war statistisch nicht signifikant (P = ${pWertVergleich}).</p>
            <p><strong>Fazit:</strong> Das Avocado Sign ist ein vielversprechender MRT-Marker zur Prädiktion des Lymphknotenstatus beim Rektumkarzinom mit hoher diagnostischer Güte, vergleichbar mit kohortenspezifisch optimierten T2w-Kriterien, und besitzt das Potenzial, das präoperative Staging zu verbessern.</p>
            <p class="small text-muted mt-2">${lang === 'de' ? 'Abkürzungen: ACC = Accuracy, AS = Avocado Sign, AUC = Fläche unter der Kurve, KI = Konfidenzintervall, KM = Kontrastmittel, MRT = Magnetresonanztomographie, N-Status = Nodalstatus, T2w = T2-gewichtet.' : 'Abbreviations: ACC = Accuracy, AS = Avocado Sign, AUC = Area Under the Curve, CE = Contrast-Enhanced, CI = Confidence Interval, MRI = Magnetic Resonance Imaging, N-status = Nodal status, T2w = T2-weighted.'}</p>
        `;
         const abstractEn = `
            <p><strong>Background:</strong> Accurate pretherapeutic determination of mesorectal lymph node status (N-status) is crucial for treatment decisions in rectal cancer. Standard magnetic resonance imaging (MRI) criteria have limitations.</p>
            <p><strong>Purpose:</strong> To evaluate the diagnostic performance of the "Avocado Sign" (AS), a novel contrast-enhanced (CE) MRI marker, compared to literature-based and cohort-optimized T2-weighted (T2w) criteria for predicting N-status.</p>
            <p><strong>Materials and Methods:</strong> This retrospective, ethics committee-approved, single-center study analyzed data from consecutive patients with histologically confirmed rectal cancer enrolled between ${studyPeriod}. Two blinded radiologists evaluated the AS (hypointense core within a hyperintense lymph node on T1w CE sequences) and morphological T2w criteria. Histopathological examination of surgical specimens served as the reference standard. Sensitivity, specificity, accuracy (ACC), and area under the receiver operating characteristic curve (AUC), with 95% confidence intervals (CIs), were calculated, and AUCs were compared using the DeLong test.</p>
            <p><strong>Results:</strong> A total of ${formatNumber(nGesamt,0)} patients (median age, ${ageRangeText}; ${sexText}) were analyzed. The AS showed a sensitivity of ${sensASGesamt} (95% CI: ${sensCI}), specificity of ${spezASGesamt} (95% CI: ${spezCI}), ACC of ${accASGesamt}, and AUC of ${aucASGesamt} (95% CI: ${aucCI}). For optimized T2w criteria, the AUC was ${aucT2OptimiertGesamt}. The difference in AUC between AS and optimized T2w criteria was not statistically significant (P = ${pWertVergleich}).</p>
            <p><strong>Conclusion:</strong> The Avocado Sign is a promising MRI marker for predicting lymph node status in rectal cancer, demonstrating high diagnostic performance comparable to cohort-optimized T2w criteria, with potential to improve preoperative staging.</p>
             <p class="small text-muted mt-2">Abbreviations: ACC = Accuracy, AS = Avocado Sign, AUC = Area Under the Curve, CE = Contrast-Enhanced, CI = Confidence Interval, MRI = Magnetic Resonance Imaging, N-status = Nodal status, T2w = T2-weighted.</p>
        `;
        
        let vergleichPerformanceTextDe = "eine vergleichbare";
        let vergleichPerformanceTextEn = "comparable";
        if (vergleichASvsBFGesamt?.delong?.pValue !== undefined && asGesamt?.auc?.value !== undefined && bfGesamtStats?.auc?.value !== undefined) {
            if (vergleichASvsBFGesamt.delong.pValue < (commonData.significanceLevel || 0.05)) {
                if (asGesamt.auc.value > bfGesamtStats.auc.value) {
                    vergleichPerformanceTextDe = "eine signifikant überlegene";
                    vergleichPerformanceTextEn = "significantly superior";
                } else if (asGesamt.auc.value < bfGesamtStats.auc.value) {
                    vergleichPerformanceTextDe = "eine signifikant unterlegene";
                    vergleichPerformanceTextEn = "significantly inferior";
                }
            }
        }

        const keyResultsDe = `
            <li>In dieser retrospektiven Studie mit ${formatNumber(nGesamt,0)} Patienten mit Rektumkarzinom zeigte das Avocado Sign (AS) eine Sensitivität von ${sensASGesamt} und eine Spezifität von ${spezASGesamt} zur Prädiktion des Lymphknotenbefalls.</li>
            <li>Die AUC für das AS betrug ${aucASGesamt}, während für die kohortenspezifisch optimierten T2w-Kriterien eine AUC von ${aucT2OptimiertGesamt} erreicht wurde.</li>
            <li>Der Unterschied in der AUC zwischen dem AS und den optimierten T2w-Kriterien war statistisch nicht signifikant (P = ${pWertVergleich}).</li>
        `;
         const keyResultsEn = `
            <li>In this retrospective study of ${formatNumber(nGesamt,0)} patients with rectal cancer, the Avocado Sign (AS) demonstrated a sensitivity of ${sensASGesamt} and a specificity of ${spezASGesamt} for predicting lymph node involvement.</li>
            <li>The AUC for AS was ${aucASGesamt}, while an AUC of ${aucT2OptimiertGesamt} was achieved for cohort-specifically optimized T2w criteria.</li>
            <li>The difference in AUC between AS and optimized T2w criteria was not statistically significant (P = ${pWertVergleich}).</li>
        `;


        return `
            <div class="publication-abstract-section">
                <h2 id="abstract-title">${lang === 'de' ? 'Abstract' : 'Abstract'}</h2>
                <div class="abstract-content">${lang === 'de' ? abstractDe : abstractEn}</div>
                <h3 id="key-results-title">${lang === 'de' ? 'Key Results' : 'Key Results'}</h3>
                <ul class="key-results-list">${lang === 'de' ? keyResultsDe : keyResultsEn}</ul>
            </div>
        `;
    }

    function getIntroductionText(lang, commonData) {
        const lurzSchaeferRef = commonData.references?.LURZ_SCHAEFER_AS_2025 || "Lurz M, Schaefer FK. Radiology. 2025;XXX:XXX-XXX";
        const anzahlGesamt = commonData.nGesamt ? formatNumber(commonData.nGesamt, 0) : 'N/A';

        if (lang === 'de') {
            return `
                <h2 id="introduction-title">Einleitung</h2>
                <p>Die adäquate präoperative Stratifizierung des Nodalstatus (N-Status) bei Patienten mit Rektumkarzinom ist ein entscheidender Faktor für die Wahl der optimalen Therapiestrategie und die Abschätzung der Prognose [1,2]. Die Magnetresonanztomographie (MRT) gilt als Goldstandard für das lokale Staging des Rektumkarzinoms. Traditionell basiert die MRT-Beurteilung mesorektaler Lymphknoten primär auf morphologischen Kriterien in T2-gewichteten (T2w) Sequenzen, wie Größe, Form und Randbegrenzung [3]. Metaanalysen haben jedoch gezeigt, dass diese Kriterien eine limitierte diagnostische Genauigkeit, insbesondere eine variable Sensitivität und suboptimale Spezifität, aufweisen, was zu einer Über- oder Unterbehandlung von Patienten führen kann [4,5]. Insbesondere im Kontext moderner Therapieansätze wie der totalen neoadjuvanten Therapie (TNT) und organerhaltender Strategien ("Watch-and-Wait") ist eine verbesserte Prädiktion des Lymphknotenbefalls von höchster klinischer Relevanz [6,7].</p>
                <p>In einer vorangegangenen Untersuchung wurde das "Avocado Sign" (AS) als ein neuer MRT-Marker vorgestellt, der auf kontrastmittelverstärkten (KM) T1-gewichteten (T1w) Sequenzen basiert (${lurzSchaeferRef}). Das AS ist definiert als ein klar abgrenzbarer, signalarmer (hypointenser) Kern innerhalb eines ansonsten homogen signalangehobenen (hyperintensen) Lymphknotens, was an den Kern einer Avocado erinnert. In der initialen Studie mit ${anzahlGesamt} Patienten zeigte das AS eine vielversprechende diagnostische Leistung für die Detektion von Lymphknotenmetastasen (${lurzSchaeferRef}).</p>
                <p>Ziel dieser Studie war es, die diagnostische Güte des Avocado Signs umfassend zu evaluieren und mit der Performance etablierter, Literatur-basierter T2w-Kriterien sowie mit datengetrieben, für die Studienkohorte optimierten T2w-Kriterienkombinationen zu vergleichen. Es wurde die Hypothese untersucht, dass das Avocado Sign eine mindestens gleichwertige, potenziell überlegene diagnostische Genauigkeit im Vergleich zu T2w-Kriterien aufweist und somit zur Verbesserung des präoperativen Lymphknotenstagings beim Rektumkarzinom beitragen könnte.</p>
            `;
        } else {
            return `
                <h2 id="introduction-title">Introduction</h2>
                <p>Accurate preoperative stratification of nodal status (N-status) in patients with rectal cancer is a critical factor for selecting the optimal therapeutic strategy and estimating prognosis [1,2]. Magnetic resonance imaging (MRI) is considered the gold standard for local staging of rectal cancer. Traditionally, MRI assessment of mesorectal lymph nodes primarily relies on morphological criteria in T2-weighted (T2w) sequences, such as size, shape, and border characteristics [3]. However, meta-analyses have demonstrated that these criteria exhibit limited diagnostic accuracy, particularly variable sensitivity and suboptimal specificity, which can lead to over- or undertreatment of patients [4,5]. Especially in the context of modern therapeutic approaches, such as total neoadjuvant therapy (TNT) and organ-preserving strategies ("watch-and-wait"), improved prediction of lymph node involvement is of utmost clinical relevance [6,7].</p>
                <p>In a previous investigation, the "Avocado Sign" (AS) was introduced as a novel MRI marker based on contrast-enhanced (CE) T1-weighted (T1w) sequences (${lurzSchaeferRef}). The AS is defined as a clearly demarcated, low-signal-intensity (hypointense) core within an otherwise homogeneously high-signal-intensity (hyperintense) lymph node, resembling an avocado kernel. In the initial study involving ${anzahlGesamt} patients, the AS demonstrated promising diagnostic performance for the detection of lymph node metastases (${lurzSchaeferRef}).</p>
                <p>The purpose of this study was to comprehensively evaluate the diagnostic performance of the Avocado Sign and compare it with that of established, literature-based T2w criteria, as well as with data-driven T2w criteria combinations optimized for this study cohort. We hypothesized that the Avocado Sign would exhibit at least equivalent, potentially superior, diagnostic accuracy compared to T2w criteria, thereby contributing to the improvement of preoperative lymph node staging in rectal cancer.</p>
            `;
        }
    }

    function getMethodenStudienanlageEthikText(lang, commonData) {
        const appVersion = commonData.appVersion || APP_CONFIG.APP_VERSION;
        const studyReferenceAS = commonData.references?.LURZ_SCHAEFER_AS_2025 || "Lurz & Schäfer (2025)";
        const ethicsVote = commonData.references?.ETHICS_VOTE_LEIPZIG || "Ethikvotum Nr. 2023-101, Ethikkommission der Medizinischen Fakultät der Universität Leipzig";

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
        const formattedStudienzeitraum = lang === 'de' ? studienzeitraum.replace("and", "und") : studienzeitraum;

        const table1Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id;
        const flowDiagramId = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.id;

        if (lang === 'de') {
            return `
                <h3 id="methoden-patientenkohorte-title">Patientenkohorte und Einschlusskriterien</h3>
                <p>Es wurden konsekutiv Patienten in die Studie eingeschlossen, bei denen zwischen ${formattedStudienzeitraum} ein histologisch gesichertes Adenokarzinom des Rektums diagnostiziert wurde und die eine primäre Staging-MRT-Untersuchung sowie die anschließende Therapie und Operation am Klinikum St. Georg, Leipzig, Deutschland, erhielten. Einschlusskriterien waren ein Alter von mindestens 18 Jahren und die Fähigkeit, eine informierte Einwilligung zu erteilen. Ausschlusskriterien umfassten Kontraindikationen gegen eine MRT-Untersuchung oder die Gabe von Gadolinium-basiertem Kontrastmittel, das Vorliegen von Fernmetastasen zum Zeitpunkt der Diagnose (M1-Stadium), oder eine bereits extern erfolgte Vorbehandlung, welche die standardisierte Bildgebung und Therapieplanung im eigenen Zentrum unmöglich machte. Alle Patienten gaben ihr schriftliches Einverständnis zur Teilnahme an der Primärstudie und zur wissenschaftlichen Auswertung ihrer pseudonymisierten Daten. Das Flussdiagramm der Patientenrekrutierung ist in <a href="${_getSafeLink(flowDiagramId)}">Abbildung Methoden 1</a> dargestellt. Die demographischen und klinischen Charakteristika der Studienpopulation sind in <a href="${_getSafeLink(table1Id)}">Tabelle Ergebnisse 1</a> zusammengefasst.</p>
            `;
        } else {
            return `
                <h3 id="methoden-patientenkohorte-title">Patient Cohort and Inclusion Criteria</h3>
                <p>Consecutive patients diagnosed with histologically confirmed adenocarcinoma of the rectum between ${formattedStudienzeitraum} who underwent primary staging MRI, subsequent therapy, and surgery at Klinikum St. Georg, Leipzig, Germany, were included in this study. Inclusion criteria were an age of at least 18 years and the ability to provide informed consent. Exclusion criteria comprised contraindications to MRI examination or administration of gadolinium-based contrast material, presence of distant metastases at diagnosis (M1 stage), or prior treatment performed externally that precluded standardized imaging and treatment planning at our institution. All patients provided written informed consent for participation in the primary study and for the scientific evaluation of their pseudonymized data. The patient recruitment flowchart is depicted in <a href="${_getSafeLink(flowDiagramId)}">Methods Figure 1</a>. Demographic and clinical characteristics of the study population are summarized in <a href="${_getSafeLink(table1Id)}">Results Table 1</a>.</p>
            `;
        }
    }
     function getMethodenMRTProtokollAkquisitionText(lang, commonData) {
        const mrtSystem = commonData.references?.MRI_SYSTEM_SIEMENS_3T || "3.0-T Magnetom Prisma Fit (Siemens Healthineers, Erlangen, Germany)";
        const kontrastmittel = commonData.references?.CONTRAST_AGENT_PROHANCE || "Gadoteridol (ProHance, Bracco Imaging, Konstanz, Germany)";
        const t2SliceThickness = "2-3 mm";
        const t1VibeSliceThickness = commonData.references?.LURZ_SCHAEFER_AS_2025 ? "1.5 mm" : "1.5 mm (gemäß Protokoll der Primärstudie)";


        if (lang === 'de') {
            return `
                <h3 id="methoden-mrt-protokoll-akquisition-title">MRT-Protokoll und Bildakquisition</h3>
                <p>Alle MRT-Untersuchungen wurden an einem ${mrtSystem} durchgeführt. Es kamen dedizierte Körper- und Wirbelsäulen-Array-Spulen zur Anwendung. Das standardisierte Untersuchungsprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen in sagittaler, transversaler und koronarer Orientierung mit einer Schichtdicke von ${t2SliceThickness} (Repetitionszeit [TR]/Echozeit [TE], typischerweise 3800–4500/80–100 ms; Field of View [FOV], 200–240 mm; Matrix, 320×256 bis 384×307). Zusätzlich wurde eine axiale diffusionsgewichtete Sequenz (DWI) mit b-Werten von 0, 500 und 1000 s/mm² akquiriert (TR/TE, ca. 5000/60 ms; FOV, 240 mm; Matrix, 128×128; Schichtdicke, 4 mm). Für die Beurteilung des Avocado Signs wurde eine kontrastmittelverstärkte, transversale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung akquiriert (TR/TE, ca. 4.5/2.0 ms; Flipwinkel, 9°; Schichtdicke, ${t1VibeSliceThickness}; FOV, 220-260 mm; Matrix, rekonstruiert auf ca. 256×256). Die genauen Sequenzparameter sind der Originalpublikation zum Avocado Sign (${commonData.references?.LURZ_SCHAEFER_AS_2025 || "Lurz & Schäfer (2025)"}) zu entnehmen.</p>
                <p>Als Kontrastmittel diente ${kontrastmittel}, ein makrozyklisches Gadolinium-Chelat, das gewichtsadaptiert (0,1 mmol/kg Körpergewicht, entsprechend 0,2 ml/kg) intravenös mit einer Flussrate von 2 ml/s, gefolgt von einem 20-ml-NaCl-Bolus, appliziert wurde. Die KM-verstärkten Sequenzen wurden unmittelbar nach Abschluss der Kontrastmittelinjektion gestartet (typischerweise arterielle Phase ca. 20-30 s, portalvenöse Phase ca. 60-70 s, Spätphase ca. 180 s post injectionem; für das AS wurde die portalvenöse Phase primär bewertet). Zur Reduktion von Darmperistaltik-Artefakten wurde Butylscopolamin (20 mg Buscopan®, Sanofi-Aventis Deutschland GmbH, Frankfurt am Main, Deutschland) intravenös zu Beginn der Untersuchung verabreicht, sofern keine Kontraindikationen bestanden. Das MRT-Protokoll war für die primäre Staging-Untersuchung sowie für das Restaging nach nRCT identisch.</p>
            `;
        } else {
            return `
                <h3 id="methoden-mrt-protokoll-akquisition-title">MRI Protocol and Image Acquisition</h3>
                <p>All MRI examinations were performed on a ${mrtSystem}. Dedicated body and spine array coils were used. The standardized examination protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences in sagittal, transverse, and coronal orientations with a slice thickness of ${t2SliceThickness} (repetition time [TR]/echo time [TE], typically 3800–4500/80–100 ms; field of view [FOV], 200–240 mm; matrix, 320×256 to 384×307). Additionally, an axial diffusion-weighted imaging (DWI) sequence with b-values of 0, 500, and 1000 s/mm² was acquired (TR/TE, approx. 5000/60 ms; FOV, 240 mm; matrix, 128×128; slice thickness, 4 mm). For the assessment of the Avocado Sign, a contrast-enhanced transverse T1-weighted volumetric interpolated breath-hold examination (VIBE) sequence with Dixon fat suppression was acquired (TR/TE, approx. 4.5/2.0 ms; flip angle, 9°; slice thickness, ${t1VibeSliceThickness}; FOV, 220-260 mm; matrix, reconstructed to approx. 256×256). Detailed sequence parameters can be found in the original Avocado Sign publication (${commonData.references?.LURZ_SCHAEFER_AS_2025 || "Lurz & Schäfer (2025)"}).</p>
                <p>The contrast agent used was ${kontrastmittel}, a macrocyclic gadolinium chelate, administered intravenously at a weight-adapted dose (0.1 mmol/kg body weight, corresponding to 0.2 mL/kg) at a flow rate of 2 mL/s, followed by a 20-mL saline flush. Contrast-enhanced sequences were initiated immediately after completion of the contrast agent injection (typically arterial phase approx. 20-30 s, portal venous phase approx. 60-70 s, late phase approx. 180 s post injection; the portal venous phase was primarily evaluated for AS). To reduce bowel peristalsis artifacts, butylscopolamine (20 mg Buscopan®, Sanofi-Aventis Deutschland GmbH, Frankfurt am Main, Germany) was administered intravenously at the beginning of the examination, unless contraindicated. The MRI protocol was identical for primary staging and for restaging after nRCT.</p>
            `;
        }
    }

    function getMethodenBildanalyseAvocadoSignText(lang, commonData) {
        const studyReferenceAS = commonData.references?.LURZ_SCHAEFER_AS_2025 || "Lurz & Schäfer (2025)";
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
                const metricValueStr = formatNumber(bfDef.metricValue, 4, 'N/A', lang === 'en');
                const metricNameDisplay = bfDef.metricName || bfZielMetric;
                bfCriteriaText += `<li><strong>${displayName}</strong> (${lang === 'de' ? 'optimiert für' : 'optimized for'} ${metricNameDisplay}, ${lang === 'de' ? 'erreichter Wert' : 'achieved value'}: ${metricValueStr}): ${formattedCriteria}.</li>`;
            }
        });

        if (bfCriteriaText) {
            bfCriteriaText = `<p>${lang === 'de' ? 'Die Kriterien, die für jedes Kollektiv spezifisch optimiert wurden, um die ' + bfZielMetric + ' zu maximieren, waren:' : 'The criteria specifically optimized for each cohort to maximize ' + bfZielMetric + ' were:'}</p><ul>${bfCriteriaText}</ul>`;
        } else {
            bfCriteriaText = lang === 'de' ? `<p>Für die gewählte Zielmetrik "${bfZielMetric}" konnten keine spezifischen Brute-Force-Optimierungsergebnisse für die Darstellung der Kriterien generiert werden oder die Ergebnisse waren nicht für alle Kollektive verfügbar.</p>` : `<p>For the selected target metric "${bfZielMetric}", no specific brute-force optimization results for criteria display could be generated, or results were not available for all cohorts.</p>`;
        }

        const kohRef = commonData.references?.KOH_2008_MORPHOLOGY || "Koh et al. [8]";
        const barbaroRef = commonData.references?.BARBARO_2024_RESTAGING || "Barbaro et al. [9]";
        const esgarRef = `${commonData.references?.BEETS_TAN_2018_ESGAR_CONSENSUS || "ESGAR Consensus [3]"} / ${commonData.references?.RUTEGARD_2025_ESGAR_VALIDATION || "Rutegård et al. [10]"}`;

        if (lang === 'de') {
            return `
                <h3 id="methoden-bildanalyse-t2-kriterien-title">Bildanalyse: T2-gewichtete Kriterien</h3>
                <p>Die morphologischen Charakteristika der mesorektalen Lymphknoten (Kurzachsendurchmesser [mm], Form ['rund', 'oval'], Kontur ['scharf', 'irregulär'], Binnensignalhomogenität ['homogen', 'heterogen'] und Signalintensität ['signalarm', 'intermediär', 'signalreich']) wurden auf den hochauflösenden T2w-Sequenzen durch dieselben zwei Radiologen (M.L., F.K.S.) im Konsens erfasst. Diese Erfassung erfolgte verblindet gegenüber dem pathologischen N-Status und dem AS-Status.</p>
                <p>Zur vergleichenden Analyse der diagnostischen Güte wurden folgende Sätze von T2w-Kriterien herangezogen:</p>
                <ol>
                    <li><strong>Literatur-basierte Kriteriensets:</strong> Eine Auswahl etablierter Kriterien aus der Fachliteratur (${kohRef}; ${barbaroRef}; ${esgarRef}) wurde implementiert. Die spezifischen Definitionen und ihre Anwendung auf die entsprechenden Subgruppen unserer Studienpopulation sind in <a href="${_getSafeLink(tableLiterarturKriterienId)}">Tabelle Methoden 1</a> detailliert beschrieben.</li>
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
                    <li><strong>Literature-based criteria sets:</strong> A selection of established criteria from the literature (${kohRef}; ${barbaroRef}; ${esgarRef}) was implemented. The specific definitions and their application to the respective subgroups of our study population are detailed in <a href="${_getSafeLink(tableLiterarturKriterienId)}">Methods Table 1</a>.</li>
                    <li><strong>Data-driven optimized T2 criteria sets (exploratory):</strong> For each main cohort (Overall, Upfront Surgery, nRCT), an algorithm was used to identify the combination of the five T2 features and a logical operator (AND/OR) that maximized the target metric "${bfZielMetric}".
                        ${bfCriteriaText}
                        <p class="small text-muted">These data-driven optimized criteria are specific to the respective cohort and the chosen target metric of this exploratory analysis. They primarily serve for the best possible comparison of the diagnostic performance of different approaches within this specific investigation and do not represent a general recommendation for clinical practice due to the risk of overfitting to the dataset.</p>
                    </li>
                </ol>
                <p>A lymph node was considered T2-positive if it fulfilled the conditions of the respective criteria set. A patient was considered T2-positive if at least one lymph node was classified as T2-positive.</p>
            `;
        }
    }

    function getMethodenReferenzstandardHistopathologieText(lang, commonData) {
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
        const appNameAndVersion = `${commonData.appName || "AvocadoSign Analysis Tool"} ${commonData.appVersion || APP_CONFIG.APP_VERSION}`;
        const softwareUsed = `R Version 4.3.1 (R Foundation for Statistical Computing, Vienna, Austria) und die anwendungsspezifische Software ${appNameAndVersion}`;
        const ciMethodProportion = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION || "Wilson Score";
        const ciMethodEffectSize = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE || "Bootstrap Percentile";


        if (lang === 'de') {
            return `
                <h3 id="methoden-statistische-analyse-methoden-title">Statistische Analyse</h3>
                <p>Kontinuierliche Variablen wurden als Median mit Interquartilsabstand (IQR) dargestellt, kategoriale Variablen als absolute und relative Häufigkeiten. Die diagnostische Güte des Avocado Signs sowie der verschiedenen T2-Kriteriensets wurde mittels Sensitivität, Spezifität, positivem prädiktiven Wert (PPV), negativem prädiktiven Wert (NPV), Genauigkeit (Accuracy, ACC), Balanced Accuracy (BalAcc) und der Fläche unter der Receiver Operating Characteristic-Kurve (AUC) evaluiert. Für diese Metriken wurden zweiseitige 95%-Konfidenzintervalle (KI) berechnet; für Proportionen (Sensitivität, Spezifität, PPV, NPV, ACC) wurde die ${ciMethodProportion}-Methode verwendet, für AUC/Balanced Accuracy und den F1-Score die ${ciMethodEffectSize}-Methode (${formatNumber(bootstrapN,0)} Replikationen).</p>
                <p>Der statistische Vergleich der diagnostischen Leistung (ACC, AUC) zwischen dem Avocado Sign und den jeweiligen T2-Kriteriensets innerhalb derselben Patientengruppe (gepaarte Daten) erfolgte mittels des McNemar-Tests für gepaarte nominale Daten bzw. des DeLong-Tests für den Vergleich von AUC-Werten. Unterschiede in der diagnostischen Güte zwischen unabhängigen Subgruppen (z.B. Direkt-OP vs. nRCT) wurden mittels Fisher's Exact Test (für Raten) oder Z-Test (für AUCs, basierend auf Bootstrap-Standardfehlern) untersucht. Ein P-Wert < ${alphaText} (zweiseitig) wurde als statistisch signifikant erachtet. Alle statistischen Analysen wurden mit ${softwareUsed} durchgeführt. Initialen des Statistikers (falls zutreffend und Autor): [Initialen].</p>
            `;
        } else {
            return `
                <h3 id="methoden-statistische-analyse-methoden-title">Statistical Analysis</h3>
                <p>Continuous variables were presented as median and interquartile range (IQR), and categorical variables as absolute and relative frequencies. Diagnostic performance of the Avocado Sign and the various T2 criteria sets was evaluated using sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy (ACC), balanced accuracy (BalAcc), and area under the receiver operating characteristic curve (AUC). For these metrics, two-sided 95% confidence intervals (CI) were calculated; the ${ciMethodProportion} method was used for proportions (sensitivity, specificity, PPV, NPV, ACC), and the ${ciMethodEffectSize} method (${formatNumber(bootstrapN,0)} replications) for AUC/balanced accuracy and F1-score.</p>
                <p>Statistical comparison of diagnostic performance (ACC, AUC) between the Avocado Sign and the respective T2 criteria sets within the same patient group (paired data) was performed using McNemar's test for paired nominal data and DeLong's test for AUC comparison. Differences in diagnostic performance between independent subgroups (e.g., upfront surgery vs. nRCT) were assessed using Fisher's exact test (for rates) or a Z-test (for AUCs, based on bootstrap standard errors). A two-sided P value < ${alphaText} was considered statistically significant. All statistical analyses were performed using ${softwareUsed}. Initials of statistician (if applicable and an author): [Initials].</p>
            `;
        }
    }

    function getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 0;
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 0;
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 0;
        
        const table1Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id;
        const fig1aId = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id;
        const fig1bId = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id;
        const flowDiagramId = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.id;

        const medianAge = pCharGesamt?.alter?.median !== undefined ? formatNumber(pCharGesamt.alter.median, 0) : 'N/A';
        const iqrAgeLower = pCharGesamt?.alter?.q1 !== undefined ? formatNumber(pCharGesamt.alter.q1, 0) : 'N/A';
        const iqrAgeUpper = pCharGesamt?.alter?.q3 !== undefined ? formatNumber(pCharGesamt.alter.q3, 0) : 'N/A';
        const ageRangeText = (medianAge !== 'N/A' && iqrAgeLower !== 'N/A' && iqrAgeUpper !== 'N/A') ? 
                             (lang === 'de' ? `${medianAge} (IQR: ${iqrAgeLower}–${iqrAgeUpper})` : `${medianAge} (IQR: ${iqrAgeLower}–${iqrAgeUpper})`)
                             : (lang === 'de' ? 'nicht verfügbar' : 'not available');
        const anzahlMaenner = pCharGesamt?.geschlecht?.m || 0;
        const nPlusAnzahl = pCharGesamt?.nStatus?.plus || 0;
        const nPlusProzent = formatPercent(nPlusAnzahl / anzahlGesamt, 1);


        if (lang === 'de') {
            return `
                <h3 id="ergebnisse-patientencharakteristika-title">Patientencharakteristika und Datenfluss</h3>
                <p>Insgesamt wurden ${formatNumber(anzahlGesamt,0)} Patienten (medianes Alter ${ageRangeText} Jahre; ${formatNumber(anzahlMaenner,0)} [${formatPercent(anzahlMaenner/anzahlGesamt, 0)}] Männer) in die finale Analyse eingeschlossen. Das Patientenflussdiagramm ist in <a href="${_getSafeLink(flowDiagramId)}">Abbildung Methoden 1</a> dargestellt. Davon erhielten ${formatNumber(anzahlNRCT,0)} (${formatPercent(anzahlNRCT/anzahlGesamt,0)}) eine neoadjuvante Radiochemotherapie (nRCT), während ${formatNumber(anzahlDirektOP,0)} (${formatPercent(anzahlDirektOP/anzahlGesamt,0)}) primär operiert wurden. Ein histopathologisch gesicherter Lymphknotenbefall (N+) lag bei ${nPlusAnzahl} (${nPlusProzent}) Patienten vor. Detaillierte Patientencharakteristika sind in <a href="${_getSafeLink(table1Id)}">Tabelle Ergebnisse 1</a> zusammengefasst. Die Alters- und Geschlechtsverteilung der Studienkohorte ist in <a href="${_getSafeLink(fig1aId)}">Abbildung Ergebnisse 1a</a> und <a href="${_getSafeLink(fig1bId)}">1b</a> dargestellt.</p>
            `;
        } else {
            return `
                <h3 id="ergebnisse-patientencharakteristika-title">Patient Characteristics and Data Flow</h3>
                <p>A total of ${formatNumber(anzahlGesamt,0)} patients (median age, ${ageRangeText} years; ${formatNumber(anzahlMaenner,0)} [${formatPercent(anzahlMaenner/anzahlGesamt, 0)}] men) were included in the final analysis. The patient flowchart is shown in <a href="${_getSafeLink(flowDiagramId)}">Methods Figure 1</a>. Of these, ${formatNumber(anzahlNRCT,0)} (${formatPercent(anzahlNRCT/anzahlGesamt,0)}) patients received neoadjuvant chemoradiotherapy (nRCT), while ${formatNumber(anzahlDirektOP,0)} (${formatPercent(anzahlDirektOP/anzahlGesamt,0)}) underwent upfront surgery. Histopathologically confirmed lymph node involvement (N+) was present in ${nPlusAnzahl} (${nPlusProzent}) patients. Detailed patient characteristics are summarized in <a href="${_getSafeLink(table1Id)}">Results Table 1</a>. The age and gender distribution of the study cohort is illustrated in <a href="${_getSafeLink(fig1aId)}">Results Figure 1a</a> and <a href="${_getSafeLink(fig1bId)}">1b</a>.</p>
            `;
        }
    }

    function getErgebnisseASPerformanceText(lang, allKollektivStats, commonData) {
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const asDirektOP = allKollektivStats?.['direkt OP']?.gueteAS;
        const asNRCT = allKollektivStats?.nRCT?.gueteAS;

        const nGesamt = commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 0;
        const nDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 0;
        const nNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 0;
        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.id;

        if (lang === 'de') {
            return `
                <h3 id="ergebnisse-as-diagnostische-guete-title">Diagnostische Güte des Avocado Signs</h3>
                <p>Die diagnostische Leistung des Avocado Signs (AS) zur Prädiktion des pathologischen N-Status ist in <a href="${_getSafeLink(tableId)}">Tabelle Ergebnisse 1</a> für das Gesamtkollektiv sowie für die Subgruppen mit primärer Operation und nach nRCT detailliert dargestellt. Im Gesamtkollektiv (${getKollektivText('Gesamt', nGesamt, lang)}) wies das AS eine Sensitivität von ${fCI(asGesamt?.sens, 1, true, 'de')}, eine Spezifität von ${fCI(asGesamt?.spez, 1, true, 'de')} und eine AUC von ${fCI(asGesamt?.auc, 2, false, 'de')} auf.</p>
                <p>Bei Patienten der Direkt-OP-Gruppe (${getKollektivText('direkt OP', nDirektOP, lang)}) erreichte das AS eine Sensitivität von ${fCI(asDirektOP?.sens, 1, true, 'de')} bei einer Spezifität von ${fCI(asDirektOP?.spez, 1, true, 'de')} (AUC ${fCI(asDirektOP?.auc, 2, false, 'de')}). In der nRCT-Gruppe (${getKollektivText('nRCT', nNRCT, lang)}) betrug die Sensitivität ${fCI(asNRCT?.sens, 1, true, 'de')} und die Spezifität ${fCI(asNRCT?.spez, 1, true, 'de')} (AUC ${fCI(asNRCT?.auc, 2, false, 'de')}).</p>
            `;
        } else {
            return `
                <h3 id="ergebnisse-as-diagnostische-guete-title">Diagnostic Performance of the Avocado Sign</h3>
                <p>The diagnostic performance of the Avocado Sign (AS) for predicting pathological N-status is detailed in <a href="${_getSafeLink(tableId)}">Results Table 1</a> for the overall cohort and for subgroups undergoing upfront surgery and after nRCT. In the overall cohort (${getKollektivText('Gesamt', nGesamt, lang)}), the AS achieved a sensitivity of ${fCI(asGesamt?.sens, 1, true, 'en')}, a specificity of ${fCI(asGesamt?.spez, 1, true, 'en')}, and an AUC of ${fCI(asGesamt?.auc, 2, false, 'en')}.</p>
                <p>In patients undergoing upfront surgery (${getKollektivText('direkt OP', nDirektOP, lang)}), the AS demonstrated a sensitivity of ${fCI(asDirektOP?.sens, 1, true, 'en')} and a specificity of ${fCI(asDirektOP?.spez, 1, true, 'en')} (AUC ${fCI(asDirektOP?.auc, 2, false, 'en')}). In the nRCT group (${getKollektivText('nRCT', nNRCT, lang)}), sensitivity was ${fCI(asNRCT?.sens, 1, true, 'en')} and specificity was ${fCI(asNRCT?.spez, 1, true, 'en')} (AUC ${fCI(asNRCT?.auc, 2, false, 'en')}).</p>
            `;
        }
    }

    function getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData) {
        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id;
        let text = '';
        if (lang === 'de') {
            text = `<h3 id="ergebnisse-t2-literatur-diagnostische-guete-title">Diagnostische Güte der Literatur-basierten T2-Kriterien</h3><p>Die Performance der etablierten T2-Kriteriensets aus der Literatur, angewendet auf die entsprechenden (Sub-)Kollektive unserer Studienpopulation, ist in <a href="${_getSafeLink(tableId)}">Tabelle Ergebnisse 2</a> dargestellt. Die Ergebnisse variierten je nach Kriterienset und zugrundeliegender Patientengruppe.</p><ul>`;
        } else {
            text = `<h3 id="ergebnisse-t2-literatur-diagnostische-guete-title">Diagnostic Performance of Literature-Based T2 Criteria</h3><p>The performance of established T2 criteria sets from the literature, applied to the respective (sub-)cohorts of our study population, is presented in <a href="${_getSafeLink(tableId)}">Results Table 2</a>. Results varied depending on the specific criteria set and the patient subgroup.</p><ul>`;
        }

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const targetKollektivForStudy = studySet.applicableKollektiv || 'Gesamt';
                const stats = allKollektivStats?.[targetKollektivForStudy]?.gueteT2_literatur?.[conf.id];
                const nPat = allKollektivStats?.[targetKollektivForStudy]?.deskriptiv?.anzahlPatienten || 'N/A';
                const setName = studySet.name || studySet.labelKey;

                if (stats && stats.matrix) {
                    text += `<li>Die Kriterien nach ${setName}, angewendet auf das ${getKollektivText(targetKollektivForStudy, nPat, lang)}, erreichten eine Sensitivität von ${fCI(stats.sens, 1, true, lang)}, eine Spezifität von ${fCI(stats.spez, 1, true, lang)} und eine AUC von ${fCI(stats.auc, 2, false, lang)}.</li>`;
                } else {
                    text += `<li>Für die Kriterien nach ${setName} (Kollektiv: ${getKollektivText(targetKollektivForStudy, nPat, lang)}) konnten keine validen Performancedaten berechnet werden.</li>`;
                }
            }
        });
        text += `</ul>`;
        return text;
    }

    function getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData) {
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id;
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l, s) => 'N/A';
        let text = '';

        if (lang === 'de') {
            text += `<h3 id="ergebnisse-t2-optimiert-diagnostische-guete-title">Diagnostische Güte der datengetriebenen optimierten T2-Kriterien</h3><p>Mittels eines explorativen Brute-Force-Algorithmus wurden für jedes der drei Studienkollektive spezifische T2-Kriteriensets identifiziert, welche die <strong>${bfZielMetric}</strong> maximieren. Die Definition dieser optimierten Kriteriensets ist im Methodenteil (Abschnitt Methoden > Bildanalyse: T2-gewichtete Kriterien) detaillierter beschrieben. Die diagnostische Güte dieser für unsere Kohorte optimierten Sets ist in <a href="${_getSafeLink(tableId)}">Tabelle Ergebnisse 3</a> dargestellt.</p><p>Die für die jeweilige Kohorte spezifisch optimierten Kriterien waren:</p><ul>`;
        } else {
            text += `<h3 id="ergebnisse-t2-optimiert-diagnostische-guete-title">Diagnostic Performance of Data-Driven Optimized T2 Criteria</h3><p>Using an exploratory brute-force algorithm, specific T2 criteria sets maximizing <strong>${bfZielMetric}</strong> were identified for each of the three study cohorts. The definition of these optimized criteria sets is detailed in the Methods section (Section Methods > Image Analysis: T2-weighted Criteria). The diagnostic performance of these sets, optimized for our cohort, is presented in <a href="${_getSafeLink(tableId)}">Results Table 3</a>.</p><p>The criteria specifically optimized for each cohort were:</p><ul>`;
        }

        const kollektive = [
            { id: 'Gesamt', n: commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten },
            { id: 'direkt OP', n: commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten },
            { id: 'nRCT', n: commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten }
        ];

        kollektive.forEach(k => {
            const bfStats = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const nPat = k.n || 'N/A';
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;
            const criteriaDesc = bfDef ? formatCriteriaFunc(bfDef.criteria, bfDef.logic, false) : (lang === 'de' ? 'nicht verfügbar' : 'unavailable');

            if (bfStats && bfStats.matrix && bfDef) {
                 text += `<li><strong>${getKollektivDisplayName(k.id)}</strong> (${getKollektivText(k.id, nPat, lang).split('(')[1]}: Die Optimierung (Zielmetrik: ${bfDef.metricName || bfZielMetric}, erreicht: ${formatNumber(bfDef.metricValue, 3, 'N/A', lang === 'en')}) ergab folgende Kriterien: <em>${criteriaDesc}</em>. Dies führte zu einer Sensitivität von ${fCI(bfStats.sens, 1, true, lang)}, Spezifität von ${fCI(bfStats.spez, 1, true, lang)} und AUC von ${fCI(bfStats.auc, 2, false, lang)}.</li>`;
            } else {
                text += `<li>Für das ${getKollektivText(k.id, nPat, lang)} konnten keine validen optimierten Kriterien für die Zielmetrik '${bfZielMetric}' ermittelt oder deren Performance nicht berechnet werden.</li>`;
            }
        });
        text += `</ul><p class="small text-muted">${lang === 'de' ? 'Es ist zu beachten, dass diese datengetriebenen optimierten Kriterien spezifisch für die jeweilige Studienkohorte und die gewählte Zielmetrik sind. Sie stellen keine allgemeingültige Empfehlung für die klinische Praxis dar, sondern dienen primär dem bestmöglichen Vergleich der diagnostischen Aussagekraft verschiedener Ansätze innerhalb dieser spezifischen Untersuchung.' : 'It should be noted that these data-driven optimized criteria are specific to the respective study cohort and the chosen target metric. They do not represent a general recommendation for clinical practice but primarily serve for the best possible comparison of the diagnostic performance of different approaches within this specific investigation.'}</p>`;
        return text;
    }

    function getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData) {
        let text = '';
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.id;
        const fig2aId = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.id;
        const fig2bId = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartdirektOP.id; 
        const fig2cId = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartnRCT.id;

        if (lang === 'de') {
            text += `<h3 id="ergebnisse-vergleich-as-vs-t2-title">Vergleichsanalysen: Avocado Sign vs. T2-Kriterien</h3><p>Die statistischen Vergleiche der diagnostischen Leistung zwischen dem Avocado Sign (AS) und den T2-Kriteriensets (sowohl Literatur-basiert als auch datengetrieben optimiert für die Zielmetrik ${bfZielMetric}) sind detailliert in <a href="${_getSafeLink(tableId)}">Tabelle Ergebnisse 4</a> aufgeführt. Visuelle Vergleiche der Schlüsselmetriken für das Gesamtkollektiv, die Direkt-OP-Gruppe und die nRCT-Gruppe sind in <a href="${_getSafeLink(fig2aId)}">Abbildung Ergebnisse 2a</a>, <a href="${_getSafeLink(fig2bId)}">Abbildung Ergebnisse 2b</a> und <a href="${_getSafeLink(fig2cId)}">Abbildung Ergebnisse 2c</a> dargestellt.</p>`;
        } else {
            text += `<h3 id="ergebnisse-vergleich-as-vs-t2-title">Comparative Analyses: Avocado Sign vs. T2 Criteria</h3><p>Statistical comparisons of the diagnostic performance between the Avocado Sign (AS) and the T2 criteria sets (both literature-based and data-driven optimized for the target metric ${bfZielMetric}) are detailed in <a href="${_getSafeLink(tableId)}">Results Table 4</a>. Visual comparisons of key metrics for the overall cohort, upfront surgery group, and nRCT group are presented in <a href="${_getSafeLink(fig2aId)}">Results Figure 2a</a>, <a href="${_getSafeLink(fig2bId)}">Results Figure 2b</a>, and <a href="${_getSafeLink(fig2cId)}">Results Figure 2c</a>, respectively.</p>`;
        }

        const kollektive = [
            { id: 'Gesamt', nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort', litSetId: 'koh_2008_morphology', litSetName: commonData.references?.KOH_2008_MORPHOLOGY || 'Koh et al. (2008)' },
            { id: 'direkt OP', nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort', litSetId: 'rutegard_et_al_esgar', litSetName: `${commonData.references?.BEETS_TAN_2018_ESGAR_CONSENSUS || "ESGAR Consensus (2018)"} (eval. ${commonData.references?.RUTEGARD_2025_ESGAR_VALIDATION || "Rutegård et al. (2025)"})` },
            { id: 'nRCT', nameDe: 'nRCT-Kollektiv', nameEn: 'nRCT cohort', litSetId: 'barbaro_2024_restaging', litSetName: commonData.references?.BARBARO_2024_RESTAGING || 'Barbaro et al. (2024)' }
        ];

        kollektive.forEach(k => {
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            const statsAS = allKollektivStats?.[k.id]?.gueteAS;
            const statsLit = allKollektivStats?.[k.id]?.gueteT2_literatur?.[k.litSetId];
            const statsBF = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;

            const vergleichASvsLit = allKollektivStats?.[k.id]?.[`vergleichASvsT2_literatur_${k.litSetId}`];
            const vergleichASvsBF = allKollektivStats?.[k.id]?.vergleichASvsT2_bruteforce;

            let diffAucLitStr = vergleichASvsLit?.delong?.diffAUC !== undefined ? formatNumber(vergleichASvsLit.delong.diffAUC, 2, 'N/A', lang === 'en') : 'N/A';
            let diffAucBfStr = vergleichASvsBF?.delong?.diffAUC !== undefined ? formatNumber(vergleichASvsBF.delong.diffAUC, 2, 'N/A', lang === 'en') : 'N/A';
            let pDeLongASvsLit = vergleichASvsLit?.delong?.pValue !== undefined ? getPValueText(vergleichASvsLit.delong.pValue, lang, true) : 'N/A';
            let pMcNemarASvsLit = vergleichASvsLit?.mcnemar?.pValue !== undefined ? getPValueText(vergleichASvsLit.mcnemar.pValue, lang, true) : 'N/A';
            let pDeLongASvsBF = vergleichASvsBF?.delong?.pValue !== undefined ? getPValueText(vergleichASvsBF.delong.pValue, lang, true) : 'N/A';
            let pMcNemarASvsBF = vergleichASvsBF?.mcnemar?.pValue !== undefined ? getPValueText(vergleichASvsBF.mcnemar.pValue, lang, true) : 'N/A';


            if (lang === 'de') {
                text += `<h4>${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Vergleich AS (AUC ${fCI(statsAS.auc, 2, false, 'de')}) versus ${k.litSetName} (AUC ${fCI(statsLit.auc, 2, false, 'de')}): Der McNemar-Test für Accuracy ergab P = ${pMcNemarASvsLit}. Der DeLong-Test für AUC ergab P = ${pDeLongASvsLit} (AUC-Differenz ${diffAucLitStr}).</p>`;
                }
                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Vergleich AS versus datenoptimierte T2-Kriterien (optimiert für ${bfDef.metricName || bfZielMetric}, AUC ${fCI(statsBF.auc, 2, false, 'de')}): Der McNemar-Test für Accuracy ergab P = ${pMcNemarASvsBF}. Der DeLong-Test für AUC ergab P = ${pDeLongASvsBF} (AUC-Differenz ${diffAucBfStr}).</p>`;
                }
            } else {
                text += `<h4>${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Comparison of AS (AUC ${fCI(statsAS.auc, 2, false, 'en')}) versus ${k.litSetName} (AUC ${fCI(statsLit.auc, 2, false, 'en')}): McNemar test for accuracy yielded P = ${pMcNemarASvsLit}. DeLong test for AUC yielded P = ${pDeLongASvsLit} (AUC difference ${diffAucLitStr}).</p>`;
                }
                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Comparison of AS versus data-optimized T2 criteria (optimized for ${bfDef.metricName || bfZielMetric}, AUC ${fCI(statsBF.auc, 2, false, 'en')}): McNemar test for accuracy yielded P = ${pMcNemarASvsBF}. DeLong test for AUC yielded P = ${pDeLongASvsBF} (AUC difference ${diffAucBfStr}).</p>`;
                }
            }
        });
        return text;
    }

    function getDiscussionText(lang, allKollektivStats, commonData) {
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const bfGesamtStats = allKollektivStats?.Gesamt?.gueteT2_bruteforce;
        const vergleichASvsBFGesamt = allKollektivStats?.Gesamt?.vergleichASvsT2_bruteforce;
        let vergleichTextDe = "eine vergleichbare Leistung zeigte";
        let vergleichTextEn = "showed comparable performance";
        let pWertDiskussion = vergleichASvsBFGesamt?.delong?.pValue !== undefined ? getPValueText(vergleichASvsBFGesamt.delong.pValue, lang, true) : 'N/A';


        if (vergleichASvsBFGesamt?.delong?.pValue !== undefined && asGesamt?.auc?.value !== undefined && bfGesamtStats?.auc?.value !== undefined) {
            if (vergleichASvsBFGesamt.delong.pValue < (commonData.significanceLevel || 0.05)) {
                if (asGesamt.auc.value > bfGesamtStats.auc.value) {
                    vergleichTextDe = "eine signifikant überlegene Leistung zeigte";
                    vergleichTextEn = "showed significantly superior performance";
                } else if (asGesamt.auc.value < bfGesamtStats.auc.value) {
                    vergleichTextDe = "eine signifikant unterlegene Leistung zeigte";
                    vergleichTextEn = "showed significantly inferior performance";
                }
            }
        }
        const aucASGesamt = asGesamt?.auc?.value !== undefined ? formatNumber(asGesamt.auc.value, 2, 'N/A', lang === 'en') : 'N/A';
        const nGesamt = commonData.nGesamt || 'N/A';

        if (lang === 'de') {
            return `
                <h2 id="discussion-title">Diskussion</h2>
                <p>In dieser retrospektiven Studie an ${nGesamt} Patienten mit Rektumkarzinom wurde die diagnostische Leistung des kontrastmittelbasierten Avocado Signs (AS) für die Prädiktion des mesorektalen Lymphknotenstatus untersucht und mit etablierten sowie datengetriebenen T2-gewichteten (T2w) Kriterien verglichen. Das AS zeigte eine hohe diagnostische Genauigkeit (Fläche unter der Kurve [AUC], ${aucASGesamt} im Gesamtkollektiv), die über verschiedene Behandlungssubgruppen hinweg robust blieb. Im direkten statistischen Vergleich mit den für diese Kohorte optimierten T2w-Kriterien ${vergleichTextDe} (P = ${pWertDiskussion} für AUC-Vergleich).</p>
                <p>Die Ergebnisse unterstreichen das Potenzial des AS als wertvollen und möglicherweise einfacher anzuwendenden Marker im Vergleich zu komplexen morphologischen T2w-Kriterien, deren Limitationen in der Literatur bekannt sind [1-3]. Unsere Analyse der Literatur-basierten T2w-Kriterien bestätigte deren variable Performance in unserer Kohorte. Die explorative Optimierung von T2w-Kriterien mittels eines Brute-Force-Algorithmus führte zwar zu einer Maximierung der Zielmetrik für die spezifischen Kollektive dieser Studie, jedoch unterstreicht dies auch die Kohortenspezifität und das Risiko der Überanpassung solcher rein datengetriebenen Ansätze. Die klare Definition des AS könnte hier Vorteile bieten.</p>
                <p>Die in der Primärstudie berichtete hohe Interobserver-Übereinstimmung für das AS (${commonData.references?.LURZ_SCHAEFER_AS_2025 || "Lurz & Schäfer (2025)"}) ist ein wichtiger Aspekt für die klinische Anwendbarkeit. Eine verbesserte Genauigkeit des präoperativen N-Stagings durch Integration des AS könnte insbesondere im Kontext individualisierter Therapiekonzepte, wie der Selektion von Patienten für organerhaltende Strategien [6,7], von Bedeutung sein.</p>
                <p>Unsere Studie weist mehrere Limitationen auf. Erstens handelt es sich um eine retrospektive Analyse an einem einzelnen Zentrum, was die Generalisierbarkeit der Ergebnisse einschränken kann. Zweitens war die Fallzahl, obwohl für eine monozentrische Studie adäquat, möglicherweise nicht ausreichend, um subtile Unterschiede zwischen den diagnostischen Methoden in allen Subgruppen mit hoher statistischer Power nachzuweisen. Drittens wurden die T2w-Kriterien im Konsens gelesen, was die Interobserver-Variabilität möglicherweise unterschätzt. Viertens erfolgte keine systematische Erfassung oder Analyse von Faktoren, die die Bildqualität oder die Interpretation des AS beeinflussen könnten (z.B. Ausmaß der Fettunterdrückung, KM-Timing). Prospektive, multizentrische Studien sind erforderlich, um diese Ergebnisse zu validieren und den klinischen Nutzen des AS, auch im Vergleich zu anderen funktionellen MRT-Parametern (z.B. DWI), weiter zu untersuchen.</p>
                <p>Zusammenfassend ist das Avocado Sign ein vielversprechender und reproduzierbarer MRT-Marker mit hoher diagnostischer Genauigkeit für die Prädiktion des mesorektalen Lymphknotenstatus beim Rektumkarzinom. Es stellt eine wertvolle Ergänzung zu den etablierten Staging-Methoden dar und hat das Potenzial, die Therapieplanung für Patienten mit Rektumkarzinom zu verfeinern und zu personalisieren. Weitere Studien sind notwendig, um seinen Stellenwert im klinischen Algorithmus endgültig zu definieren.</p>
            `;
        } else {
            return `
                <h2 id="discussion-title">Discussion</h2>
                <p>This retrospective study in ${nGesamt} patients with rectal cancer evaluated the diagnostic performance of the contrast-enhanced Avocado Sign (AS) for predicting mesorectal lymph node status and compared it with established and data-driven T2-weighted (T2w) criteria. Our findings indicate that the AS demonstrates high diagnostic accuracy (area under the curve [AUC], ${aucASGesamt} in the overall cohort), which remained robust across different treatment subgroups. In direct statistical comparison with T2w criteria optimized for this cohort, the AS ${vergleichTextEn} (P = ${pWertDiskussion} for AUC comparison).</p>
                <p>The results underscore the potential of AS as a valuable and possibly more straightforward marker compared to complex morphological T2w criteria, whose limitations are well-documented in the literature [1-3]. Our analysis of literature-based T2w criteria confirmed their variable performance in our cohort. Although exploratory optimization of T2w criteria using a brute-force algorithm maximized the target metric for the specific cohorts of this study, this also highlights the cohort specificity and risk of overfitting with such purely data-driven approaches. The clear definition and simple visual assessability of the Avocado Sign may offer advantages in terms of generalizability and user-friendliness.</p>
                <p>A crucial aspect for the clinical implementation of a new imaging marker is its reproducibility. The high interobserver agreement reported for the Avocado Sign in the primary study (${commonData.references?.LURZ_SCHAEFER_AS_2025 || "Lurz & Schäfer (2025)"}) suggests good applicability in daily clinical practice. The results of this extended analysis suggest that the integration of contrast-enhanced T1w sequences and the specific assessment of the Avocado Sign could enhance the diagnostic certainty of MRI staging. This is of potentially high value, particularly in the context of individualized treatment decisions, such as selecting patients for organ-preserving strategies [4,5] or de-/escalating neoadjuvant therapies.</p>
                <p>Our study has several limitations. First, it is a retrospective, single-center analysis, which may limit the generalizability of the findings. Second, although the sample size was adequate for a single-center study, it may not have been sufficient to detect subtle differences between diagnostic methods in all subgroups with high statistical power. Third, T2w criteria were read by consensus, which might underestimate interobserver variability. Fourth, factors potentially influencing image quality or AS interpretation (e.g., degree of fat suppression, contrast timing) were not systematically recorded or analyzed. Prospective, multicenter studies are necessary to validate these results and to further investigate the clinical utility of the AS, including comparison with other functional MRI parameters (e.g., DWI).</p>
                <p>In conclusion, the Avocado Sign is a promising and reproducible MRI marker with high diagnostic accuracy for predicting mesorectal lymph node status in rectal cancer. It represents a valuable addition to established staging methods and has the potential to refine and personalize treatment planning for patients with rectal cancer. Further studies are needed to definitively establish its role in the clinical algorithm.</p>
            `;
        }
    }

    function getReferencesText(lang, commonData) {
        const refs = commonData.references || {};
        let text = `<h2 id="references-title">${lang === 'de' ? 'Literaturverzeichnis' : 'References'}</h2><ol class="small">`;
        const referenceOrder = [
            refs.LURZ_SCHAEFER_AS_2025,
            "[1] Siegel RL, Miller KD, Wagle NS, Jemal A. Cancer statistics, 2023. CA Cancer J Clin. 2023;73(1):17-48. doi:10.3322/caac.21763",
            "[2] Sauer R, Becker H, Hohenberger W, et al. Preoperative versus postoperative chemoradiotherapy for rectal cancer. N Engl J Med. 2004;351(17):1731-1740. doi:10.1056/NEJMoa040694",
            "[3] Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for local rectal cancer staging: a consensus statement by the ESGAR rectal cancer MR staging group. Eur Radiol. 2018;28(5):2281-2292. doi:10.1007/s00330-017-5224-4",
            "[4] Al-Sukhni E, Milot L, Fruitman M, et al. Diagnostic accuracy of MRI for assessment of T category, lymph node metastases, and circumferential resection margin involvement in patients with rectal cancer: a systematic review and meta-analysis. Ann Surg Oncol. 2012;19(7):2212-2223. doi:10.1245/s10434-011-2183-1",
            "[5] Taylor FG, Quirke P, Heald RJ, et al. Preoperative high-resolution magnetic resonance imaging can identify good prognosis stage I, II, and III rectal cancer best managed by surgery alone: a prospective, multicenter, European study. Ann Surg. 2011;253(4):711-719. doi:10.1097/SLA.0b013e31820b8d52",
            "[6] Garcia-Aguilar J, Patil S, Gollub MJ, et al. Organ Preservation in Patients With Rectal Adenocarcinoma Treated With Total Neoadjuvant Therapy. J Clin Oncol. 2022;40(23):2546-2556. doi:10.1200/JCO.21.02621",
            "[7] Schrag D, Shi Q, Weiser MR, et al. Preoperative Treatment of Locally Advanced Rectal Cancer. N Engl J Med. 2023;389(4):322-334. doi:10.1056/NEJMoa2303269",
            refs.KOH_2008_MORPHOLOGY, 
            refs.BARBARO_2024_RESTAGING, 
            refs.RUTEGARD_2025_ESGAR_VALIDATION,
            refs.BROWN_2003_MORPHOLOGY,
            refs.KAUR_2012_MRI_PRACTICAL,
            refs.HORVAT_2019_MRI_RECTAL_CANCER,
            refs.BEETS_TAN_2009_USPIO_RESTAGING,
            refs.BEETS_TAN_2004_GADOLINIUM,
            refs.BARBARO_2010_RESTAGING
        ].filter(ref => ref);

        let displayedRefs = new Set();
        let autoCounter = 1;
        const usedNumberedRefs = new Set();

        const getRefNumberAndClean = (currentRefString) => { // Parameter umbenannt
            const match = currentRefString.match(/^\[(\d+)\]\s*/);
            if (match) {
                usedNumberedRefs.add(parseInt(match[1]));
                return { num: parseInt(match[1]), text: currentRefString.substring(match[0].length) };
            }
            return { num: null, text: currentRefString }; // currentRefString statt refString
        };
        
        const getNextAutoCounter = () => {
            while(usedNumberedRefs.has(autoCounter)){
                autoCounter++;
            }
            usedNumberedRefs.add(autoCounter);
            const current = autoCounter;
            autoCounter++;
            return current;
        };

        text += referenceOrder.map(currentRefString => { // Parameter umbenannt
            if (currentRefString && !displayedRefs.has(currentRefString)) {
                displayedRefs.add(currentRefString);
                const { num, text: cleanRefText } = getRefNumberAndClean(currentRefString); // Korrekter Aufruf
                const displayNum = num !== null ? num : getNextAutoCounter();
                return `<li>[${displayNum}] ${cleanRefText}</li>`;
            }
            return '';
        }).filter(item => item).join('');

        text += `</ol>`;
        return text;
    }


    function getSectionText(sectionId, lang, allKollektivStats, commonData) {
        switch (sectionId) {
            case 'abstract_main': return getAbstractText(lang, allKollektivStats, commonData);
            case 'introduction_main': return getIntroductionText(lang, commonData);
            case 'methoden_studienanlage_ethik': return getMethodenStudienanlageEthikText(lang, commonData);
            case 'methoden_patientenkohorte': return getMethodenPatientenkohorteText(lang, allKollektivStats, commonData);
            case 'methoden_mrt_protokoll_akquisition': return getMethodenMRTProtokollAkquisitionText(lang, commonData);
            case 'methoden_bildanalyse_avocado_sign': return getMethodenBildanalyseAvocadoSignText(lang, commonData);
            case 'methoden_bildanalyse_t2_kriterien': return getMethodenBildanalyseT2KriterienText(lang, commonData, allKollektivStats);
            case 'methoden_referenzstandard_histopathologie': return getMethodenReferenzstandardHistopathologieText(lang, commonData);
            case 'methoden_statistische_analyse_methoden': return getMethodenStatistischeAnalyseMethodenText(lang, commonData);
            case 'ergebnisse_patientencharakteristika': return getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData);
            case 'ergebnisse_as_diagnostische_guete': return getErgebnisseASPerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_t2_literatur_diagnostische_guete': return getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_t2_optimiert_diagnostische_guete': return getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_vergleich_as_vs_t2': return getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData);
            case 'discussion_main': return getDiscussionText(lang, allKollektivStats, commonData);
            case 'references_main': return getReferencesText(lang, commonData);
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
            .replace(/<a href="#(.*?)">(.*?)<\/a>/g, '[$2](#$1)')
            .replace(/<h1[^>]*>(.*?)<\/h1>/g, (match, p1) => `\n# ${p1}\n`)
            .replace(/<h2[^>]*>(.*?)<\/h2>/g, (match, p1) => `\n## ${p1}\n`)
            .replace(/<h3[^>]*>(.*?)<\/h3>/g, (match, p1) => `\n### ${p1}\n`)
            .replace(/<h4[^>]*>(.*?)<\/h4>/g, (match, p1) => `\n#### ${p1}\n`)
            .replace(/<h5[^>]*>(.*?)<\/h5>/g, (match, p1) => `\n##### ${p1}\n`)
            .replace(/<h6[^>]*>(.*?)<\/h6>/g, (match, p1) => `\n###### ${p1}\n`)
            .replace(/<cite>(.*?)<\/cite>/g, '[$1]')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/\u00A0/g, ' ') 
            .replace(/ {2,}/g, ' ') 
            .replace(/\n\s*\n/g, '\n\n') 
            .trim();

        markdown = markdown.replace(/\$\s*(&\w+;)\s*\$/g, (match, entity) => {
            const symbols = { '&ge;': '≥', '&le;': '≤', '&lt;': '<', '&gt;': '>' };
            return symbols[entity] || match;
        });
        markdown = markdown.replace(/\$([^$]+)\$/g, '$1'); 


        if (sectionId === 'references_main' && markdown.includes('\n* ')) {
            let autoCounterMd = 1;
            const usedNumberedRefsMd = new Set();
            const getNextAutoCounterMd = () => {
                while(usedNumberedRefsMd.has(autoCounterMd)){ autoCounterMd++; }
                usedNumberedRefsMd.add(autoCounterMd);
                return autoCounterMd++;
            };

            markdown = markdown.split('\n').map(line => {
                if (line.startsWith('* ')) {
                    const content = line.substring(2);
                    const match = content.match(/^\[(\d+)\]/);
                    if (match) {
                        usedNumberedRefsMd.add(parseInt(match[1]));
                        return `${match[1]}. ${content.substring(match[0].length).trim()}`;
                    }
                    return `${getNextAutoCounterMd()}. ${content.trim()}`;
                }
                return line;
            }).join('\n');
        }
        return markdown;
    }

    return Object.freeze({
        getSectionText,
        getSectionTextAsMarkdown
    });

})();
