const publicationTextGeneratorRadiology = (() => {

    function _getSafeLink(elementId, text, lang = 'de') {
        const config = PUBLICATION_CONFIG.publicationElements;
        let refText = text;

        for (const sectionKey in config) {
            for (const elKey in config[sectionKey]) {
                if (config[sectionKey][elKey].id === elementId) {
                    refText = lang === 'de' ? config[sectionKey][elKey].referenceInTextDe : config[sectionKey][elKey].referenceInTextEn;
                    break;
                }
            }
        }
        if (!elementId) return refText || text || '';
        return `<a href="#${elementId}">${refText || text || elementId}</a>`;
    }

    function _formatNumberForPub(value, digits, lang = 'de', forceSign = false) {
        if (value === null || value === undefined || isNaN(value) || !isFinite(value)) return 'N/A';
        const num = parseFloat(value);
        let formatted = num.toFixed(digits);
        if (lang === 'de') {
            formatted = formatted.replace('.', ',');
        }
        if (forceSign && num > 0) {
            formatted = '+' + formatted;
        }
        return formatted;
    }

    function _formatPercentForPub(value, total, digits, lang = 'de') {
        if (total === 0 || value === null || value === undefined || isNaN(value) || !isFinite(value)) return 'N/A (%)';
        const percentage = (value / total) * 100;
        return `${_formatNumberForPub(percentage, digits, lang)}%`;
    }

    function _getPValueTextForPub(pValue, lang = 'de') {
        if (pValue === null || pValue === undefined || isNaN(pValue) || !isFinite(pValue)) return 'P = N/A';
        if (pValue < 0.001) return 'P < .001';
        if (pValue > 0.99) return 'P > .99';

        let pFormatted;
        if (pValue < 0.01) {
            pFormatted = pValue.toFixed(3);
        } else if (Math.abs(pValue - 0.05) < 0.005 && pValue !== 0.05) {
             pFormatted = pValue.toFixed(3);
        }
        else {
            pFormatted = pValue.toFixed(2);
        }
        
        pFormatted = pFormatted.replace(/^0\./, '.');

        return `P = ${pFormatted}`;
    }

    function _fCIForPub(metric, digits = 1, isPercent = true, lang = 'de') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return 'N/A';
        const valueStr = isPercent ? _formatPercentForPub(metric.value, 1, digits, lang).replace('%', '') : _formatNumberForPub(metric.value, digits, lang);

        if (valueStr === 'N/A') return valueStr;

        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper) && isFinite(metric.ci.lower) && isFinite(metric.ci.upper)) {
            const lowerStr = isPercent ? _formatPercentForPub(metric.ci.lower, 1, digits, lang).replace('%', '') : _formatNumberForPub(metric.ci.lower, digits, lang);
            const upperStr = isPercent ? _formatPercentForPub(metric.ci.upper, 1, digits, lang).replace('%', '') : _formatNumberForPub(metric.ci.upper, digits, lang);
            if (lowerStr === 'N/A' || upperStr === 'N/A') return `${valueStr}${isPercent ? '%' : ''}`;
            const ciText = '95% CI:';
            return `${valueStr} (${ciText} ${lowerStr}, ${upperStr})${isPercent ? '%' : ''}`;
        }
        return `${valueStr}${isPercent ? '%' : ''}`;
    }

    function _getKollektivTextForPub(kollektivId, n, lang = 'de') {
        const name = getKollektivDisplayName(kollektivId);
        const nText = `n=${formatNumber(n, 0, 'N/A', lang === 'en')}`;
        return `${name} (${nText})`;
    }

    function _getAbstractText(lang, allKollektivStats, commonData) {
        const gesamtStats = allKollektivStats?.Gesamt;
        const asGesamt = gesamtStats?.gueteAS;
        const bfGesamtStats = gesamtStats?.gueteT2_bruteforce;
        const vergleichASvsBFGesamt = gesamtStats?.vergleichASvsT2_bruteforce;

        const nGesamt = commonData.nGesamt || 0;
        const medianAge = gesamtStats?.deskriptiv?.alter?.median !== undefined ? _formatNumberForPub(gesamtStats.deskriptiv.alter.median, 0, lang) : 'N/A';
        const iqrAgeLower = gesamtStats?.deskriptiv?.alter?.q1 !== undefined ? _formatNumberForPub(gesamtStats.deskriptiv.alter.q1, 0, lang) : 'N/A';
        const iqrAgeUpper = gesamtStats?.deskriptiv?.alter?.q3 !== undefined ? _formatNumberForPub(gesamtStats.deskriptiv.alter.q3, 0, lang) : 'N/A';
        const ageRangeText = (medianAge !== 'N/A' && iqrAgeLower !== 'N/A' && iqrAgeUpper !== 'N/A') ?
                             (lang === 'de' ? `${medianAge} Jahre (IQR: ${iqrAgeLower}–${iqrAgeUpper})` : `${medianAge} years (IQR: ${iqrAgeLower}–${iqrAgeUpper})`)
                             : (lang === 'de' ? 'nicht verfügbar' : 'not available');

        const anzahlMaenner = gesamtStats?.deskriptiv?.geschlecht?.m || 0;
        const anzahlFrauen = gesamtStats?.deskriptiv?.geschlecht?.f || 0;
        const sexText = lang === 'de' ? `${anzahlMaenner} Männer und ${anzahlFrauen} Frauen` : `${anzahlMaenner} men and ${anzahlFrauen} women`;
        const patientText = lang === 'de' ? `${_formatNumberForPub(nGesamt,0,lang)} Patienten (mittleres Alter, ${ageRangeText}; ${anzahlMaenner} Männer)` : `${_formatNumberForPub(nGesamt,0,lang)} patients (mean age, ${ageRangeText}; ${anzahlMaenner} men)`;


        const sensASGesamtValue = asGesamt?.sens?.value;
        const spezASGesamtValue = asGesamt?.spez?.value;
        const accASGesamtValue = asGesamt?.acc?.value;
        const aucASGesamtValue = asGesamt?.auc?.value;

        const sensASGesamtText = _fCIForPub(asGesamt?.sens, 1, true, lang);
        const spezASGesamtText = _fCIForPub(asGesamt?.spez, 1, true, lang);
        const accASGesamtText = _fCIForPub(asGesamt?.acc, 1, true, lang);
        const aucASGesamtText = _fCIForPub(asGesamt?.auc, 2, false, lang);


        const aucT2OptimiertGesamtValue = bfGesamtStats?.auc?.value;
        const aucT2OptimiertGesamtText = _fCIForPub(bfGesamtStats?.auc, 2, false, lang);
        const pWertVergleichDelong = _getPValueTextForPub(vergleichASvsBFGesamt?.delong?.pValue, lang);
        const studyPeriod = commonData.references?.STUDY_PERIOD_2020_2023;
        const formattedStudyPeriod = studyPeriod?.fullCitation ? (lang === 'de' ? studyPeriod.fullCitation.replace(" und ", " und ") : studyPeriod.fullCitation.replace(" und ", " and ")) : (lang === 'de' ? "Januar 2020 und November 2023" : "January 2020 and November 2023");
        const ethicsVoteText = commonData.references?.ETHICS_VOTE_LEIPZIG?.fullCitation || (lang === 'de' ? "Ethikkommission der Sächsischen Landesärztekammer (Aktenzeichen EK-Allg-2023-101)" : "ethics committee of the Saxon State Medical Association (file number EK-Allg-2023-101)");


        const abstractDe = `
            <p><strong>Hintergrund:</strong> Eine präzise prätherapeutische Bestimmung des mesorektalen Lymphknotenstatus (N-Status) ist entscheidend für Therapieentscheidungen beim Rektumkarzinom. Standard-MRT-Kriterien zeigen Limitierungen.</p>
            <p><strong>Ziel:</strong> Evaluation der diagnostischen Leistung des "Avocado Sign" (AS), eines neuartigen kontrastmittelverstärkten (KM) MRT-Markers, im Vergleich zu etablierten T2-gewichteten (T2w) Kriterien zur Prädiktion des N-Status.</p>
            <p><strong>Material und Methoden:</strong> Diese retrospektive, von der ${ethicsVoteText} genehmigte Monozenterstudie schloss Patienten mit histologisch gesichertem Rektumkarzinom ein, die zwischen ${formattedStudyPeriod} eine Staging-MRT erhielten. Zwei verblindete Radiologen evaluierten das AS (hypointenser Kern in hyperintensem Lymphknoten auf T1w-KM-Sequenzen) und morphologische T2w-Kriterien. Der Referenzstandard war die histopathologische Untersuchung. Sensitivität, Spezifität, Genauigkeit (ACC) und die Fläche unter der Receiver-Operating-Characteristic-Kurve (AUC) wurden berechnet; AUC-Werte wurden mittels DeLong-Test verglichen.</p>
            <p><strong>Ergebnisse:</strong> ${patientText} wurden analysiert. Das AS zeigte eine Sensitivität von ${sensASGesamtText.split(' (')[0]} (n=${_formatNumberForPub(asGesamt?.matrix?.rp,0)}/${_formatNumberForPub(asGesamt?.matrix?.rp + asGesamt?.matrix?.fn,0)}; ${sensASGesamtText.split(' (')[1]}), eine Spezifität von ${spezASGesamtText.split(' (')[0]} (n=${_formatNumberForPub(asGesamt?.matrix?.rn,0)}/${_formatNumberForPub(asGesamt?.matrix?.fp + asGesamt?.matrix?.rn,0)}; ${spezASGesamtText.split(' (')[1]}), eine ACC von ${accASGesamtText.split(' (')[0]} (n=${_formatNumberForPub(asGesamt?.matrix?.rp + asGesamt?.matrix?.rn,0)}/${_formatNumberForPub(nGesamt,0)}; ${accASGesamtText.split(' (')[1]}) und eine AUC von ${aucASGesamtText}. Für die optimierten T2w-Kriterien betrug die AUC ${aucT2OptimiertGesamtText}. Der Unterschied der AUC zwischen AS und optimierten T2w-Kriterien war nicht statistisch signifikant (${pWertVergleichDelong}).</p>
            <p><strong>Fazit:</strong> Das Avocado Sign ist ein vielversprechender MRT-Marker zur Prädiktion des Lymphknotenstatus beim Rektumkarzinom und zeigt eine hohe diagnostische Güte.</p>
        `;
        const abstractEn = `
            <p><strong>Background:</strong> Accurate pretherapeutic determination of mesorectal lymph node status (N-status) is crucial for treatment decisions in rectal cancer. Standard MRI criteria have limitations.</p>
            <p><strong>Purpose:</strong> To evaluate the diagnostic performance of the "Avocado Sign" (AS), a novel contrast-enhanced (CE) MRI marker, compared to established T2-weighted (T2w) criteria for predicting N-status.</p>
            <p><strong>Materials and Methods:</strong> This retrospective, ${ethicsVoteText.replace("ethics committee of the Saxon State Medical Association (file number EK-Allg-2023-101)","institutional review board")}-approved, single-center study included patients with histologically confirmed rectal cancer who underwent staging MRI between ${formattedStudyPeriod}. Two blinded radiologists evaluated the AS (hypointense core within a hyperintense lymph node on T1w CE sequences) and morphological T2w criteria. Histopathological examination was the reference standard. Sensitivity, specificity, accuracy (ACC), and area under the receiver operating characteristic curve (AUC) were calculated; AUCs were compared using the DeLong test.</p>
            <p><strong>Results:</strong> ${patientText.replace("patients (mean age,","patients (median age,")} were analyzed. The AS showed a sensitivity of ${sensASGesamtText.split(' (')[0]} (n=${_formatNumberForPub(asGesamt?.matrix?.rp,0)}/${_formatNumberForPub(asGesamt?.matrix?.rp + asGesamt?.matrix?.fn,0)}; ${sensASGesamtText.split(' (')[1]}), specificity of ${spezASGesamtText.split(' (')[0]} (n=${_formatNumberForPub(asGesamt?.matrix?.rn,0)}/${_formatNumberForPub(asGesamt?.matrix?.fp + asGesamt?.matrix?.rn,0)}; ${spezASGesamtText.split(' (')[1]}), ACC of ${accASGesamtText.split(' (')[0]} (n=${_formatNumberForPub(asGesamt?.matrix?.rp + asGesamt?.matrix?.rn,0)}/${_formatNumberForPub(nGesamt,0)}; ${accASGesamtText.split(' (')[1]}), and AUC of ${aucASGesamtText}. For optimized T2w criteria, the AUC was ${aucT2OptimiertGesamtText}. The difference in AUC between AS and optimized T2w criteria was not statistically significant (${pWertVergleichDelong}).</p>
            <p><strong>Conclusion:</strong> The Avocado Sign is a promising MRI marker for predicting lymph node status in rectal cancer, demonstrating high diagnostic performance.</p>
        `;

        const keyResultsDe = `
            <li>In dieser retrospektiven Studie mit ${_formatNumberForPub(nGesamt,0,lang)} Patienten mit Rektumkarzinom zeigte das Avocado Sign (AS) eine Sensitivität von ${_formatNumberForPub(sensASGesamtValue,1,lang)}% und eine Spezifität von ${_formatNumberForPub(spezASGesamtValue,1,lang)}% zur Prädiktion des Lymphknotenbefalls.</li>
            <li>Die AUC für das AS betrug ${_formatNumberForPub(aucASGesamtValue,2,lang)}, während für die kohortenspezifisch optimierten T2w-Kriterien eine AUC von ${_formatNumberForPub(aucT2OptimiertGesamtValue,2,lang)} erreicht wurde.</li>
            <li>Der Unterschied in der AUC zwischen dem AS und den optimierten T2w-Kriterien war statistisch nicht signifikant (${pWertVergleichDelong}).</li>
        `;
        const keyResultsEn = `
            <li>In this retrospective study of ${_formatNumberForPub(nGesamt,0,lang)} patients with rectal cancer, the Avocado Sign (AS) demonstrated a sensitivity of ${_formatNumberForPub(sensASGesamtValue,1,lang)}% and a specificity of ${_formatNumberForPub(spezASGesamtValue,1,lang)}% for predicting lymph node involvement.</li>
            <li>The AUC for AS was ${_formatNumberForPub(aucASGesamtValue,2,lang)}, while an AUC of ${_formatNumberForPub(aucT2OptimiertGesamtValue,2,lang)} was achieved for cohort-specifically optimized T2w criteria.</li>
            <li>The difference in AUC between AS and optimized T2w criteria was not statistically significant (${pWertVergleichDelong}).</li>
        `;

        const summaryStatement = lang === 'de' ?
            `Das Avocado Sign, ein MRT-Marker basierend auf Kontrastmittel-Enhancement, zeigte eine hohe diagnostische Genauigkeit für die Prädiktion des Lymphknotenstatus bei Rektumkarzinompatienten.` :
            `The Avocado Sign, an MRI marker based on contrast enhancement, demonstrated high diagnostic accuracy for predicting lymph node status in patients with rectal cancer.`;


        return `
            <div class="publication-abstract-section">
                <p><strong>${lang === 'de' ? 'Zusammenfassende Aussage' : 'Summary Statement'}</strong></p>
                <p><strong>${summaryStatement}</strong></p>
                <hr>
                <p><strong>${lang === 'de' ? 'Schlüsselergebnisse' : 'Key Results'}</strong></p>
                <ul>${lang === 'de' ? keyResultsDe : keyResultsEn}</ul>
                <hr>
                <h2 id="abstract-title">${lang === 'de' ? 'Abstract' : 'Abstract'}</h2>
                <div class="abstract-content">${lang === 'de' ? abstractDe : abstractEn}</div>
                <p class="small text-muted mt-2"><strong>${lang === 'de' ? 'Abkürzungen:' : 'Abbreviations:'}</strong> ACC = ${lang === 'de' ? 'Genauigkeit' : 'Accuracy'}, AS = Avocado Sign, AUC = ${lang === 'de' ? 'Fläche unter der Kurve' : 'Area Under the Curve'}, CI = ${lang === 'de' ? 'Konfidenzintervall' : 'Confidence Interval'}, KM = ${lang === 'de' ? 'Kontrastmittel' : 'Contrast Medium'}, CE = ${lang === 'de' ? 'Kontrastmittel-verstärkt' : 'Contrast-Enhanced'}, IQR = ${lang === 'de' ? 'Interquartilsabstand' : 'Interquartile Range'}, MRT = ${lang === 'de' ? 'Magnetresonanztomographie' : 'Magnetic Resonance Imaging'}, N-Status = ${lang === 'de' ? 'Nodalstatus' : 'Nodal status'}, T2w = ${lang === 'de' ? 'T2-gewichtet' : 'T2-weighted'}.</p>
            </div>
        `;
    }

    function _getIntroductionText(lang, commonData) {
        const lurzSchaeferRefText = commonData.references?.LURZ_SCHAEFER_AS_2025 ? _getSafeLink(commonData.references.LURZ_SCHAEFER_AS_2025.id, `(${commonData.references.LURZ_SCHAEFER_AS_2025.numberInList || 'X'})`, lang) : '(Lurz M, Schaefer FK. Radiology. 2025;XXX:XXX-XXX)';
        const anzahlGesamt = commonData.nGesamt ? _formatNumberForPub(commonData.nGesamt, 0, lang) : 'N/A';
        const siegelRef = commonData.references?.SIEGEL_2023_CANCER_STATS ? _getSafeLink(commonData.references.SIEGEL_2023_CANCER_STATS.id, `(${commonData.references.SIEGEL_2023_CANCER_STATS.numberInList || '1'})`, lang) : '(1)';
        const sauerRef = commonData.references?.SAUER_2004_NEOADJUVANT ? _getSafeLink(commonData.references.SAUER_2004_NEOADJUVANT.id, `(${commonData.references.SAUER_2004_NEOADJUVANT.numberInList || '2'})`, lang) : '(2)';
        const beetsTanESGARRef = commonData.references?.BEETS_TAN_2018_ESGAR_CONSENSUS ? _getSafeLink(commonData.references.BEETS_TAN_2018_ESGAR_CONSENSUS.id, `(${commonData.references.BEETS_TAN_2018_ESGAR_CONSENSUS.numberInList || '3'})`, lang) : '(3)';
        const alSukhniRef = commonData.references?.AL_SUKHNI_2012_MRI_ACCURACY ? _getSafeLink(commonData.references.AL_SUKHNI_2012_MRI_ACCURACY.id, `(${commonData.references.AL_SUKHNI_2012_MRI_ACCURACY.numberInList || '4'})`, lang) : '(4)';
        const taylorRef = commonData.references?.TAYLOR_2011_PREOP_MRI ? _getSafeLink(commonData.references.TAYLOR_2011_PREOP_MRI.id, `(${commonData.references.TAYLOR_2011_PREOP_MRI.numberInList || '5'})`, lang) : '(5)';
        const garciaAguilarRef = commonData.references?.GARCIA_AGUILAR_2022_ORGAN_PRESERVATION ? _getSafeLink(commonData.references.GARCIA_AGUILAR_2022_ORGAN_PRESERVATION.id, `(${commonData.references.GARCIA_AGUILAR_2022_ORGAN_PRESERVATION.numberInList || '6'})`, lang) : '(6)';
        const schragRef = commonData.references?.SCHRAG_2023_PREOP_TREATMENT ? _getSafeLink(commonData.references.SCHRAG_2023_PREOP_TREATMENT.id, `(${commonData.references.SCHRAG_2023_PREOP_TREATMENT.numberInList || '7'})`, lang) : '(7)';


        if (lang === 'de') {
            return `
                <h2 id="introduction-title">Einleitung</h2>
                <p>Die adäquate präoperative Stratifizierung des Nodalstatus (N-Status) bei Patienten mit Rektumkarzinom ist ein entscheidender Faktor für die Wahl der optimalen Therapiestrategie und die Abschätzung der Prognose ${siegelRef}${sauerRef}. Die Magnetresonanztomographie (MRT) gilt als Goldstandard für das lokale Staging des Rektumkarzinoms. Traditionell basiert die MRT-Beurteilung mesorektaler Lymphknoten primär auf morphologischen Kriterien in T2-gewichteten (T2w) Sequenzen, wie Größe, Form und Randbegrenzung ${beetsTanESGARRef}. Metaanalysen haben jedoch gezeigt, dass diese Kriterien eine limitierte diagnostische Genauigkeit aufweisen ${alSukhniRef}${taylorRef}. Insbesondere im Kontext moderner Therapieansätze wie der totalen neoadjuvanten Therapie (TNT) und organerhaltender Strategien ("Watch-and-Wait") ist eine verbesserte Prädiktion des Lymphknotenbefalls von höchster klinischer Relevanz ${garciaAguilarRef}${schragRef}.</p>
                <p>In einer vorangegangenen Untersuchung wurde das "Avocado Sign" (AS) als ein neuer MRT-Marker vorgestellt, der auf kontrastmittelverstärkten (KM) T1-gewichteten (T1w) Sequenzen basiert ${lurzSchaeferRefText}. Das AS ist definiert als ein klar abgrenzbarer, signalarmer (hypointenser) Kern innerhalb eines ansonsten homogen signalangehobenen (hyperintensen) Lymphknotens. In der initialen Studie mit ${anzahlGesamt} Patienten zeigte das AS eine vielversprechende diagnostische Leistung für die Detektion von Lymphknotenmetastasen ${lurzSchaeferRefText}.</p>
                <p>Die Feststellung, dass das Avocado Sign eine hohe diagnostische Genauigkeit aufweist, ist bisher in der Literatur nicht gut etabliert. Große Studien zur Untersuchung der diagnostischen Leistung kontrastmittelbasierter MRT-Marker im Vergleich zu etablierten T2w-Kriterien für das Lymphknotenstaging beim Rektumkarzinom wurden bisher nicht durchgeführt.</p>
                <p>Ziel dieser Studie war es, die diagnostische Güte des Avocado Signs umfassend zu evaluieren und mit der Performance etablierter, Literatur-basierter T2w-Kriterien sowie mit datengetrieben, für die Studienkohorte optimierten T2w-Kriterienkombinationen zu vergleichen.</p>
            `;
        } else {
            return `
                <h2 id="introduction-title">Introduction</h2>
                <p>Accurate preoperative stratification of nodal status (N-status) in patients with rectal cancer is a critical factor for selecting the optimal therapeutic strategy and estimating prognosis ${siegelRef}${sauerRef}. Magnetic resonance imaging (MRI) is considered the gold standard for local staging of rectal cancer. Traditionally, MRI assessment of mesorectal lymph nodes primarily relies on morphological criteria in T2-weighted (T2w) sequences, such as size, shape, and border characteristics ${beetsTanESGARRef}. However, meta-analyses have demonstrated that these criteria exhibit limited diagnostic accuracy ${alSukhniRef}${taylorRef}. Especially in the context of modern therapeutic approaches, such as total neoadjuvant therapy (TNT) and organ-preserving strategies ("watch-and-wait"), improved prediction of lymph node involvement is of utmost clinical relevance ${garciaAguilarRef}${schragRef}.</p>
                <p>In a previous investigation, the "Avocado Sign" (AS) was introduced as a novel MRI marker based on contrast-enhanced (CE) T1-weighted (T1w) sequences ${lurzSchaeferRefText}. The AS is defined as a clearly demarcated, low-signal-intensity (hypointense) core within an otherwise homogeneously high-signal-intensity (hyperintense) lymph node. In the initial study involving ${anzahlGesamt} patients, the AS demonstrated promising diagnostic performance for the detection of lymph node metastases ${lurzSchaeferRefText}.</p>
                <p>The finding that the Avocado Sign demonstrates high diagnostic accuracy has not previously been well established in the literature. Large studies investigating the diagnostic performance of contrast-enhanced MRI markers compared to established T2w criteria for lymph node staging in rectal cancer have not yet been performed.</p>
                <p>The purpose of this study was to comprehensively evaluate the diagnostic performance of the Avocado Sign and compare it with that of established, literature-based T2w criteria, as well as with data-driven T2w criteria combinations optimized for this study cohort.</p>
            `;
        }
    }

    function _getMethodenStudienanlageEthikText(lang, commonData) {
        const studyReferenceAS = commonData.references?.LURZ_SCHAEFER_AS_2025 ? _getSafeLink(commonData.references.LURZ_SCHAEFER_AS_2025.id, `(${commonData.references.LURZ_SCHAEFER_AS_2025.numberInList || 'X'})`, lang) : '(Lurz & Schäfer 2025)';
        const ethicsVote = commonData.references?.ETHICS_VOTE_LEIPZIG?.fullCitation || (lang === 'de' ? "Ethikkommission der Sächsischen Landesärztekammer (Aktenzeichen EK-Allg-2023-101)" : "ethics committee of the Saxon State Medical Association (file number EK-Allg-2023-101)");
        const appNameAndVersion = `${commonData.appName || "AvocadoSign Analysis Tool"} v${commonData.appVersion || APP_CONFIG.APP_VERSION}`;


        if (lang === 'de') {
            return `
                <h3 id="methoden-studienanlage-ethik-title">Studiendesign und Ethikvotum</h3>
                <p>Diese retrospektive Analyse wurde auf der Basis eines prospektiv geführten, monozentrischen Registers von Patienten mit histologisch gesichertem Rektumkarzinom durchgeführt. Das Studienkollektiv und die zugrundeliegenden MRT-Datensätze sind identisch mit jenen der Originalpublikation zum Avocado Sign ${studyReferenceAS}. Die vorliegende Untersuchung diente dem detaillierten Vergleich der diagnostischen Leistung des AS mit verschiedenen T2-gewichteten morphologischen Kriterien. Die Studie wurde von der ${ethicsVote} genehmigt. Aufgrund des retrospektiven Charakters wurde auf ein erneutes Einholen eines schriftlichen Einverständnisses für diese spezifische erweiterte Auswertung verzichtet, da ein generelles Einverständnis zur wissenschaftlichen Auswertung im Rahmen der Primärstudie vorlag. Die Autoren hatten während der gesamten Studie Zugriff auf alle Daten. Die statistische Auswertung erfolgte mit ${appNameAndVersion} und R Version 4.3.1 (R Foundation for Statistical Computing, Wien, Österreich).</p>
            `;
        } else {
            return `
                <h3 id="methoden-studienanlage-ethik-title">Study Design and Ethical Approval</h3>
                <p>This retrospective analysis was performed based on a prospectively maintained, single-center registry of patients with histologically confirmed rectal cancer. The study cohort and the underlying MRI datasets are identical to those of the original Avocado Sign publication ${studyReferenceAS}. The present investigation served for a detailed comparison of the diagnostic performance of the AS with various T2-weighted morphological criteria. The study was approved by the ${ethicsVote.replace("ethics committee of the Saxon State Medical Association (file number EK-Allg-2023-101)","institutional review board")}. Given the retrospective nature of this analysis, the ethics committee waived the need for re-obtaining written informed consent for this specific extended evaluation, as general consent for scientific evaluation was provided as part of the primary study. The authors had access to all data in the study. Statistical analysis was performed using ${appNameAndVersion} and R version 4.3.1 (R Foundation for Statistical Computing, Vienna, Austria).</p>
            `;
        }
    }

    function _getMethodenPatientenkohorteText(lang, allKollektivStats, commonData) {
        const anzahlGesamt = commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 0;
        const studienzeitraum = commonData.references?.STUDY_PERIOD_2020_2023?.fullCitation || "January 2020 to November 2023";
        const formattedStudienzeitraum = lang === 'de' ? studienzeitraum.replace("and", "und") : studienzeitraum;
        const table1Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id;
        const fig1Id = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.id;

        if (lang === 'de') {
            return `
                <h3 id="methoden-patientenkohorte-title">Patientenkohorte und Einschlusskriterien</h3>
                <p>Es wurden konsekutiv Patienten eingeschlossen, bei denen zwischen ${formattedStudienzeitraum} ein histologisch gesichertes Adenokarzinom des Rektums diagnostiziert wurde und die eine primäre Staging-MRT-Untersuchung sowie die anschließende Therapie und Operation am Klinikum St. Georg, Leipzig, Deutschland, erhielten. Einschlusskriterien waren ein Alter von mindestens 18 Jahren. Ausschlusskriterien umfassten Kontraindikationen gegen eine MRT-Untersuchung oder die Gabe von Gadolinium-basiertem Kontrastmittel, das Vorliegen von Fernmetastasen zum Zeitpunkt der Diagnose (M1-Stadium) oder eine bereits extern erfolgte Vorbehandlung. Alle Patienten gaben ihr schriftliches Einverständnis zur Teilnahme an der Primärstudie. Das Flussdiagramm der Patientenrekrutierung ist in ${_getSafeLink(fig1Id, null, lang)} dargestellt. Die demographischen und klinischen Charakteristika der Studienpopulation sind in ${_getSafeLink(table1Id, null, lang)} zusammengefasst.</p>
            `;
        } else {
            return `
                <h3 id="methoden-patientenkohorte-title">Patient Cohort and Inclusion Criteria</h3>
                <p>Consecutive patients diagnosed with histologically confirmed adenocarcinoma of the rectum between ${formattedStudienzeitraum} who underwent primary staging MRI, subsequent therapy, and surgery at Klinikum St. Georg, Leipzig, Germany, were included in this study. Inclusion criteria were an age of at least 18 years. Exclusion criteria comprised contraindications to MRI examination or administration of gadolinium-based contrast material, presence of distant metastases at diagnosis (M1 stage), or prior treatment performed externally. All patients provided written informed consent for participation in the primary study. The patient recruitment flowchart is depicted in ${_getSafeLink(fig1Id, null, lang)}. Demographic and clinical characteristics of the study population are summarized in ${_getSafeLink(table1Id, null, lang)}.</p>
            `;
        }
    }

    function _getMethodenMRTProtokollAkquisitionText(lang, commonData) {
        const mrtSystem = commonData.references?.MRI_SYSTEM_SIEMENS_3T?.fullCitation || (lang === 'de' ? "3,0-T Magnetom Prisma Fit (Siemens Healthineers, Erlangen, Deutschland)" : "3.0-T Magnetom Prisma Fit (Siemens Healthineers, Erlangen, Germany)");
        const kontrastmittel = commonData.references?.CONTRAST_AGENT_PROHANCE?.fullCitation || (lang === 'de' ? "Gadoteridol (ProHance, Bracco Imaging, Konstanz, Deutschland)" : "Gadoteridol (ProHance, Bracco Imaging, Konstanz, Germany)");
        const t2SliceThickness = "2–3 mm";
        const t1VibeSliceThickness = commonData.references?.LURZ_SCHAEFER_AS_2025_DETAILS?.t1VibeSliceThickness || "1.5 mm";
        const asPubRef = commonData.references?.LURZ_SCHAEFER_AS_2025 ? _getSafeLink(commonData.references.LURZ_SCHAEFER_AS_2025.id, `(${commonData.references.LURZ_SCHAEFER_AS_2025.numberInList || 'X'})`, lang) : '(Originalpublikation zum Avocado Sign)';

        if (lang === 'de') {
            return `
                <h3 id="methoden-mrt-protokoll-akquisition-title">MRT-Protokoll und Bildakquisition</h3>
                <p>Alle MRT-Untersuchungen wurden an einem ${mrtSystem} durchgeführt. Das Standardprotokoll umfasste hochauflösende T2-gewichtete Turbo-Spin-Echo (TSE)-Sequenzen (sagittal, transversal, koronal; Schichtdicke, ${t2SliceThickness}) und eine axiale diffusionsgewichtete Sequenz (DWI). Für das Avocado Sign wurde eine kontrastmittelverstärkte, transversale T1-gewichtete volumetrische interpolierte Breath-Hold-Sequenz (VIBE) mit Dixon-Fettunterdrückung (Schichtdicke, ${t1VibeSliceThickness}) akquiriert. Detaillierte Sequenzparameter sind in der Originalpublikation zum Avocado Sign ${asPubRef} und der Tabelle Methoden 1 dieser Arbeit (falls eine Tabelle mit MRT-Parametern hier eingefügt wird, sonst den Verweis anpassen) zu entnehmen.</p>
                <p>${kontrastmittel} wurde gewichtsadaptiert (0,1 mmol/kg) intravenös appliziert. Butylscopolamin (20 mg) wurde zur Reduktion von Peristaltikartefakten verabreicht. Das MRT-Protokoll war für Staging und Restaging identisch.</p>
            `;
        } else {
            return `
                <h3 id="methoden-mrt-protokoll-akquisition-title">MRI Protocol and Image Acquisition</h3>
                <p>All MRI examinations were performed on a ${mrtSystem}. The standard protocol included high-resolution T2-weighted turbo spin-echo (TSE) sequences (sagittal, transverse, coronal; slice thickness, ${t2SliceThickness}) and an axial diffusion-weighted imaging (DWI) sequence. For the Avocado Sign, a contrast-enhanced transverse T1-weighted volumetric interpolated breath-hold examination (VIBE) sequence with Dixon fat suppression (slice thickness, ${t1VibeSliceThickness}) was acquired. Detailed sequence parameters are provided in the original Avocado Sign publication ${asPubRef} and Methods Table 1 of this paper (if a table with MRI parameters is included here, otherwise adjust reference).</p>
                <p>${kontrastmittel} was administered intravenously at a weight-adapted dose (0.1 mmol/kg). Butylscopolamine (20 mg) was administered to reduce peristalsis artifacts. The MRI protocol was identical for staging and restaging.</p>
            `;
        }
    }

    function _getMethodenBildanalyseAvocadoSignText(lang, commonData) {
        const studyReferenceAS = commonData.references?.LURZ_SCHAEFER_AS_2025 ? _getSafeLink(commonData.references.LURZ_SCHAEFER_AS_2025.id, `(${commonData.references.LURZ_SCHAEFER_AS_2025.numberInList || 'X'})`, lang) : '(Originalpublikation zum Avocado Sign)';
        const radiologistExperience = commonData.references?.RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER?.fullCitation || ["XX", "YY", "ZZ"];
        const figASExampleRef = lang === 'de' ? 'Abbildung 2 der Originalpublikation' : 'Figure 2 of the original publication';


        if (lang === 'de') {
            return `
                <h3 id="methoden-bildanalyse-avocado-sign-title">Bildanalyse: Avocado Sign</h3>
                <p>Zwei unabhängige Radiologen (M.L., A.O.S.; mit ${radiologistExperience[0]} bzw. ${radiologistExperience[1]} Jahren Erfahrung) evaluierten die KM-T1w-VIBE-Sequenzen. Das AS wurde als umschriebener, zentral oder exzentrisch gelegener hypointenser Kern innerhalb eines ansonsten homogen hyperintensen mesorektalen Lymphknotens definiert (Beispiele siehe ${studyReferenceAS}, ${figASExampleRef}). Die Bewerter waren gegenüber den histopathologischen Befunden und den T2w-Ergebnissen verblindet. Ein Patient galt als AS-positiv, wenn mindestens ein Lymphknoten das AS zeigte. Diskordante Befunde wurden im Konsens mit einem dritten Radiologen (S.H.; ${radiologistExperience[2]} Jahre Erfahrung) gelöst. Für nRCT-Patienten wurde das Restaging-MRT bewertet.</p>
            `;
        } else {
            return `
                <h3 id="methoden-bildanalyse-avocado-sign-title">Image Analysis: Avocado Sign</h3>
                <p>Two independent radiologists (M.L., A.O.S.; with ${radiologistExperience[0]} and ${radiologistExperience[1]} years of experience, respectively) evaluated the CE T1w VIBE sequences. The AS was defined as a circumscribed, centrally or eccentrically located hypointense core within an otherwise homogeneously hyperintense mesorectal lymph node (see ${studyReferenceAS}, ${figASExampleRef} for examples). Reviewers were blinded to histopathological findings and T2w results. A patient was classified as AS-positive if at least one mesorectal lymph node exhibited the AS. Discrepancies were resolved by consensus with a third radiologist (S.H.; ${radiologistExperience[2]} years of experience). For nRCT patients, restaging MRI was evaluated.</p>
            `;
        }
    }

    function _getMethodenBildanalyseT2KriterienText(lang, commonData, allKollektivStats) {
        const radiologistExperience = commonData.references?.RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER?.fullCitation || ["XX", "YY"];
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const tableLiteraturKriterienId = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id;
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l, s) => 'N/A';

        let bfCriteriaText = '';
        const kollektiveBF = ['Gesamt', 'direkt OP', 'nRCT'];
        kollektiveBF.forEach(kolId => {
            const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;
            if (bfDef && bfDef.criteria) {
                const displayName = getKollektivDisplayName(kolId);
                const formattedCriteria = formatCriteriaFunc(bfDef.criteria, bfDef.logic, false);
                const metricValueStr = _formatNumberForPub(bfDef.metricValue, 3, lang);
                const metricNameDisplay = bfDef.metricName || bfZielMetric;
                const liText = lang === 'de' ?
                    `<strong>${displayName}</strong> (${metricNameDisplay}, Wert: ${metricValueStr}): ${formattedCriteria}` :
                    `<strong>${displayName}</strong> (${metricNameDisplay}, value: ${metricValueStr}): ${formattedCriteria}`;
                bfCriteriaText += `<li>${liText}.</li>`;
            }
        });
         if (bfCriteriaText) {
            bfCriteriaText = `<p>${lang === 'de' ? 'Die für das jeweilige Kollektiv spezifisch optimierten Kriterien (maximale ' + bfZielMetric + ') waren:' : 'The criteria specifically optimized for each cohort (maximizing ' + bfZielMetric + ') were:'}</p><ul>${bfCriteriaText}</ul>`;
        } else {
            bfCriteriaText = lang === 'de' ? `<p>Für die Zielmetrik "${bfZielMetric}" konnten keine spezifischen Brute-Force-Optimierungsergebnisse für die Darstellung der Kriterien generiert werden.</p>` : `<p>For the target metric "${bfZielMetric}", no specific brute-force optimization results for criteria display could be generated.</p>`;
        }


        const kohRef = commonData.references?.KOH_2008_MORPHOLOGY ? _getSafeLink(commonData.references.KOH_2008_MORPHOLOGY.id, `(${commonData.references.KOH_2008_MORPHOLOGY.numberInList || 'X'})`, lang) : '(Koh et al.)';
        const barbaroRef = commonData.references?.BARBARO_2024_RESTAGING ? _getSafeLink(commonData.references.BARBARO_2024_RESTAGING.id, `(${commonData.references.BARBARO_2024_RESTAGING.numberInList || 'X'})`, lang) : '(Barbaro et al.)';
        const rutegardRef = commonData.references?.RUTEGARD_2025_ESGAR_VALIDATION ? _getSafeLink(commonData.references.RUTEGARD_2025_ESGAR_VALIDATION.id, `(${commonData.references.RUTEGARD_2025_ESGAR_VALIDATION.numberInList || 'X'})`, lang) : '(Rutegård et al.)';
        const esgarRef = commonData.references?.BEETS_TAN_2018_ESGAR_CONSENSUS ? _getSafeLink(commonData.references.BEETS_TAN_2018_ESGAR_CONSENSUS.id, `(${commonData.references.BEETS_TAN_2018_ESGAR_CONSENSUS.numberInList || 'X'})`, lang) : '(ESGAR Consensus)';


        if (lang === 'de') {
            return `
                <h3 id="methoden-bildanalyse-t2-kriterien-title">Bildanalyse: T2-gewichtete Kriterien</h3>
                <p>Morphologische Charakteristika (Kurzachsendurchmesser, Form, Kontur, Binnensignalhomogenität, Signalintensität) wurden auf T2w-Sequenzen durch dieselben zwei Radiologen (M.L., A.O.S.) im Konsens erfasst, verblindet gegenüber Pathologie und AS-Status.</p>
                <p>Folgende T2w-Kriteriensets wurden verglichen:</p>
                <ol>
                    <li><strong>Literatur-basierte Sets:</strong> Kriterien nach Koh et al. ${kohRef}, Barbaro et al. ${barbaroRef} und Rutegård et al./ESGAR ${rutegardRef} ${esgarRef} (Details siehe ${_getSafeLink(tableLiteraturKriterienId, null, lang)}).</li>
                    <li><strong>Datengetriebene optimierte Sets (explorativ):</strong> Für jedes Hauptkollektiv wurde die Kombination aus T2-Merkmalen und Logik (UND/ODER) identifiziert, welche die Zielmetrik "${bfZielMetric}" maximierte.
                        ${bfCriteriaText}
                    </li>
                </ol>
                <p>Ein Patient galt als T2-positiv, wenn mindestens ein Lymphknoten die Kriterien des jeweiligen Sets erfüllte.</p>
            `;
        } else {
            return `
                <h3 id="methoden-bildanalyse-t2-kriterien-title">Image Analysis: T2-weighted Criteria</h3>
                <p>Morphological characteristics (short-axis diameter, shape, border, internal signal homogeneity, signal intensity) were assessed on T2w sequences by the same two radiologists (M.L., A.O.S.) by consensus, blinded to pathology and AS status.</p>
                <p>The following T2w criteria sets were compared:</p>
                <ol>
                    <li><strong>Literature-based sets:</strong> Criteria according to Koh et al. ${kohRef}, Barbaro et al. ${barbaroRef}, and Rutegård et al./ESGAR ${rutegardRef} ${esgarRef} (details in ${_getSafeLink(tableLiteraturKriterienId, null, lang)}).</li>
                    <li><strong>Data-driven optimized sets (exploratory):</strong> For each main cohort, the combination of T2 features and logic (AND/OR) maximizing the target metric "${bfZielMetric}" was identified.
                        ${bfCriteriaText}
                    </li>
                </ol>
                <p>A patient was considered T2-positive if at least one lymph node met the criteria of the respective set.</p>
            `;
        }
    }

    function _getMethodenReferenzstandardHistopathologieText(lang, commonData) {
        if (lang === 'de') {
            return `
                <h3 id="methoden-referenzstandard-histopathologie-title">Referenzstandard: Histopathologie</h3>
                <p>Die definitive Bestimmung des Lymphknotenstatus erfolgte durch histopathologische Untersuchung der Operationspräparate nach totaler mesorektaler Exzision. Erfahrene Pathologen untersuchten alle identifizierten mesorektalen Lymphknoten. Ein Patient wurde als N-positiv (N+) klassifiziert, wenn mindestens ein Lymphknoten Metastasen aufwies.</p>
            `;
        } else {
            return `
                <h3 id="methoden-referenzstandard-histopathologie-title">Reference Standard: Histopathology</h3>
                <p>Definitive lymph node status was determined by histopathological examination of surgical specimens after total mesorectal excision. Experienced pathologists examined all identified mesorectal lymph nodes. A patient was classified as N-positive (N+) if at least one lymph node contained metastases.</p>
            `;
        }
    }

    function _getMethodenStatistischeAnalyseMethodenText(lang, commonData) {
        const alphaLevel = commonData.significanceLevel || 0.05;
        const alphaText = _formatNumberForPub(alphaLevel, 2, lang).replace(/^0\./, '.');
        const bootstrapN = commonData.bootstrapReplications || 1000;
        const appNameAndVersion = `${commonData.appName || "AvocadoSign Analysis Tool"} v${commonData.appVersion || APP_CONFIG.APP_VERSION}`;
        const softwareUsed = lang === 'de' ?
            `R Version 4.3.1 (R Foundation for Statistical Computing, Wien, Österreich) und die anwendungsspezifische Software ${appNameAndVersion}` :
            `R version 4.3.1 (R Foundation for Statistical Computing, Vienna, Austria) and the application-specific software ${appNameAndVersion}`;
        const ciMethodProportion = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION || "Wilson Score";
        const ciMethodEffectSize = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE || "Bootstrap Percentile";

        if (lang === 'de') {
            return `
                <h3 id="methoden-statistische-analyse-methoden-title">Statistische Analyse</h3>
                <p>Deskriptive Statistiken wurden verwendet. Die diagnostische Güte (Sensitivität, Spezifität, PPV, NPV, ACC, AUC) wurde mit 95%-Konfidenzintervallen (KI) berechnet (Proportionen: ${ciMethodProportion}; AUC: ${ciMethodEffectSize}, ${_formatNumberForPub(bootstrapN,0,lang)} Replikationen). Der McNemar-Test und der DeLong-Test wurden für gepaarte Vergleiche verwendet. Ein P-Wert < ${alphaText} (zweiseitig) galt als statistisch signifikant. Analysen erfolgten mit ${softwareUsed}. Die Autoren M.L. und A.O.S. hatten Zugriff auf die Studiendaten und übernehmen die Verantwortung für deren Integrität und die Genauigkeit der Datenanalyse.</p>
            `;
        } else {
            return `
                <h3 id="methoden-statistische-analyse-methoden-title">Statistical Analysis</h3>
                <p>Descriptive statistics were used. Diagnostic performance (sensitivity, specificity, PPV, NPV, ACC, AUC) was calculated with 95% confidence intervals (CIs) (proportions: ${ciMethodProportion}; AUC: ${ciMethodEffectSize}, ${_formatNumberForPub(bootstrapN,0,lang)} replications). McNemar test and DeLong test were used for paired comparisons. A two-sided P value < ${alphaText} was considered statistically significant. Analyses were performed using ${softwareUsed}. Authors M.L. and A.O.S. had access to the study data and take responsibility for its integrity and the data analysis accuracy.</p>
            `;
        }
    }

    function _getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 0;
        const anzahlDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 0;
        const anzahlNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 0;

        const table1Ref = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id, null, lang);
        const fig1Ref = _getSafeLink(PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.id, null, lang);
        const fig1aRef = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id, null, lang);
        const fig1bRef = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id, null, lang);

        const medianAge = pCharGesamt?.alter?.median !== undefined ? _formatNumberForPub(pCharGesamt.alter.median, 0, lang) : 'N/A';
        const iqrAgeLower = pCharGesamt?.alter?.q1 !== undefined ? _formatNumberForPub(pCharGesamt.alter.q1, 0, lang) : 'N/A';
        const iqrAgeUpper = pCharGesamt?.alter?.q3 !== undefined ? _formatNumberForPub(pCharGesamt.alter.q3, 0, lang) : 'N/A';
        const ageRangeText = (medianAge !== 'N/A' && iqrAgeLower !== 'N/A' && iqrAgeUpper !== 'N/A') ?
                             (lang === 'de' ? `${medianAge} (IQR: ${iqrAgeLower}–${iqrAgeUpper})` : `${medianAge} (IQR: ${iqrAgeLower}–${iqrAgeUpper})`)
                             : (lang === 'de' ? 'nicht verfügbar' : 'not available');
        const anzahlMaenner = pCharGesamt?.geschlecht?.m || 0;
        const prozentMaenner = _formatPercentForPub(anzahlMaenner, anzahlGesamt, 0, lang);
        const nPlusAnzahl = pCharGesamt?.nStatus?.plus || 0;
        const nPlusProzent = _formatPercentForPub(nPlusAnzahl, anzahlGesamt, 1, lang);


        if (lang === 'de') {
            return `
                <h3 id="ergebnisse-patientencharakteristika-title">Patientencharakteristika</h3>
                <p>Insgesamt wurden ${_formatNumberForPub(anzahlGesamt,0,lang)} Patienten (medianes Alter ${ageRangeText} Jahre; ${_formatNumberForPub(anzahlMaenner,0,lang)} [${prozentMaenner}] Männer) eingeschlossen (Flussdiagramm: ${fig1Ref}). Davon erhielten ${_formatNumberForPub(anzahlNRCT,0,lang)} (${_formatPercentForPub(anzahlNRCT,anzahlGesamt,0,lang)}) eine neoadjuvante Radiochemotherapie (nRCT), ${_formatNumberForPub(anzahlDirektOP,0,lang)} (${_formatPercentForPub(anzahlDirektOP,anzahlGesamt,0,lang)}) wurden primär operiert. Ein histopathologisch gesicherter Lymphknotenbefall (N+) lag bei ${nPlusAnzahl} (${nPlusProzent}) Patienten vor. Details siehe ${table1Ref}. Alters- und Geschlechtsverteilung sind in ${fig1aRef} und ${fig1bRef} dargestellt.</p>
            `;
        } else {
            return `
                <h3 id="ergebnisse-patientencharakteristika-title">Participant Characteristics</h3>
                <p>A total of ${_formatNumberForPub(anzahlGesamt,0,lang)} patients (median age, ${ageRangeText} years; ${_formatNumberForPub(anzahlMaenner,0,lang)} [${prozentMaenner}] men) were included (flowchart: ${fig1Ref}). Of these, ${_formatNumberForPub(anzahlNRCT,0,lang)} (${_formatPercentForPub(anzahlNRCT,anzahlGesamt,0,lang)}) patients received neoadjuvant chemoradiotherapy (nRCT), and ${_formatNumberForPub(anzahlDirektOP,0,lang)} (${_formatPercentForPub(anzahlDirektOP,anzahlGesamt,0,lang)}) underwent upfront surgery. Histopathologically confirmed lymph node involvement (N+) was present in ${nPlusAnzahl} (${nPlusProzent}) patients. Details are provided in ${table1Ref}. Age and sex distributions are shown in ${fig1aRef} and ${fig1bRef}.</p>
            `;
        }
    }

    function _getErgebnisseASPerformanceText(lang, allKollektivStats, commonData) {
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const asDirektOP = allKollektivStats?.['direkt OP']?.gueteAS;
        const asNRCT = allKollektivStats?.nRCT?.gueteAS;

        const nGesamt = commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 0;
        const nDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 0;
        const nNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 0;
        const tableRef = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.id, null, lang);

        if (lang === 'de') {
            return `
                <h3 id="ergebnisse-as-diagnostische-guete-title">Diagnostische Güte des Avocado Signs</h3>
                <p>Die diagnostische Leistung des Avocado Signs (AS) ist in ${tableRef} für das Gesamtkollektiv sowie Subgruppen dargestellt. Im Gesamtkollektiv (${_getKollektivTextForPub('Gesamt', nGesamt, lang)}) wies das AS eine Sensitivität von ${_fCIForPub(asGesamt?.sens, 1, true, 'de')}, eine Spezifität von ${_fCIForPub(asGesamt?.spez, 1, true, 'de')} und eine AUC von ${_fCIForPub(asGesamt?.auc, 2, false, 'de')} auf.</p>
                <p>Bei Direkt-OP-Patienten (${_getKollektivTextForPub('direkt OP', nDirektOP, lang)}) erreichte das AS eine Sensitivität von ${_fCIForPub(asDirektOP?.sens, 1, true, 'de')}, Spezifität von ${_fCIForPub(asDirektOP?.spez, 1, true, 'de')} (AUC ${_fCIForPub(asDirektOP?.auc, 2, false, 'de')}). In der nRCT-Gruppe (${_getKollektivTextForPub('nRCT', nNRCT, lang)}) betrug die Sensitivität ${_fCIForPub(asNRCT?.sens, 1, true, 'de')}, Spezifität ${_fCIForPub(asNRCT?.spez, 1, true, 'de')} (AUC ${_fCIForPub(asNRCT?.auc, 2, false, 'de')}).</p>
            `;
        } else {
            return `
                <h3 id="ergebnisse-as-diagnostische-guete-title">Diagnostic Performance of the Avocado Sign</h3>
                <p>The diagnostic performance of the Avocado Sign (AS) is detailed in ${tableRef} for the overall cohort and subgroups. In the overall cohort (${_getKollektivTextForPub('Gesamt', nGesamt, lang)}), AS achieved a sensitivity of ${_fCIForPub(asGesamt?.sens, 1, true, 'en')}, a specificity of ${_fCIForPub(asGesamt?.spez, 1, true, 'en')}, and an AUC of ${_fCIForPub(asGesamt?.auc, 2, false, 'en')}.</p>
                <p>In patients undergoing upfront surgery (${_getKollektivTextForPub('direkt OP', nDirektOP, lang)}), AS demonstrated a sensitivity of ${_fCIForPub(asDirektOP?.sens, 1, true, 'en')} and specificity of ${_fCIForPub(asDirektOP?.spez, 1, true, 'en')} (AUC ${_fCIForPub(asDirektOP?.auc, 2, false, 'en')}). In the nRCT group (${_getKollektivTextForPub('nRCT', nNRCT, lang)}), sensitivity was ${_fCIForPub(asNRCT?.sens, 1, true, 'en')} and specificity was ${_fCIForPub(asNRCT?.spez, 1, true, 'en')} (AUC ${_fCIForPub(asNRCT?.auc, 2, false, 'en')}).</p>
            `;
        }
    }

    function _getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData) {
        const tableRef = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id, null, lang);
        let text = '';
        if (lang === 'de') {
            text = `<h3 id="ergebnisse-t2-literatur-diagnostische-guete-title">Diagnostische Güte der Literatur-basierten T2-Kriterien</h3><p>Die Performance der etablierten T2-Kriteriensets aus der Literatur, angewendet auf die entsprechenden (Sub-)Kollektive unserer Studienpopulation, ist in ${tableRef} dargestellt. Die Ergebnisse variierten.</p><ul>`;
        } else {
            text = `<h3 id="ergebnisse-t2-literatur-diagnostische-guete-title">Diagnostic Performance of Literature-Based T2 Criteria</h3><p>The performance of established T2 criteria sets from the literature, applied to the respective (sub-)cohorts of our study population, is presented in ${tableRef}. Results varied.</p><ul>`;
        }

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const targetKollektivForStudy = studySet.applicableKollektiv || 'Gesamt';
                const stats = allKollektivStats?.[targetKollektivForStudy]?.gueteT2_literatur?.[conf.id];
                const nPat = allKollektivStats?.[targetKollektivForStudy]?.deskriptiv?.anzahlPatienten || 'N/A';
                const setName = UI_TEXTS.kollektivDisplayNames[conf.id] || studySet.name || conf.labelKey;

                if (stats && stats.matrix) {
                    text += `<li>Die Kriterien nach ${setName}, angewendet auf das ${_getKollektivTextForPub(targetKollektivForStudy, nPat, lang)}, erreichten eine AUC von ${_fCIForPub(stats.auc, 2, false, lang)}.</li>`;
                } else {
                     text += `<li>Für ${setName} (${_getKollektivTextForPub(targetKollektivForStudy, nPat, lang)}) keine validen Daten.</li>`;
                }
            }
        });
        text += `</ul>`;
        return text;
    }

    function _getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData) {
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const tableRef = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id, null, lang);
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l, s) => 'N/A';
        let text = '';

        if (lang === 'de') {
            text += `<h3 id="ergebnisse-t2-optimiert-diagnostische-guete-title">Diagnostische Güte der datengetriebenen optimierten T2-Kriterien</h3><p>Mittels Brute-Force-Algorithmus wurden T2-Kriteriensets zur Maximierung der <strong>${bfZielMetric}</strong> identifiziert (Details im Methodenteil). Die Güte ist in ${tableRef} dargestellt.</p><p>Die optimierten Kriterien waren:</p><ul>`;
        } else {
            text += `<h3 id="ergebnisse-t2-optimiert-diagnostische-guete-title">Diagnostic Performance of Data-Driven Optimized T2 Criteria</h3><p>Using a brute-force algorithm, T2 criteria sets maximizing <strong>${bfZielMetric}</strong> were identified (details in Methods). Performance is presented in ${tableRef}.</p><p>The optimized criteria were:</p><ul>`;
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
                 text += `<li><strong>${getKollektivDisplayName(k.id)}</strong> (${_getKollektivTextForPub(k.id, nPat, lang).split('(')[1]} ${lang === 'de' ? 'Ziel' : 'Target'}: ${bfDef.metricName || bfZielMetric}, ${lang === 'de' ? 'Wert' : 'Value'}: ${_formatNumberForPub(bfDef.metricValue, 3, lang)}): <em>${criteriaDesc}</em>. AUC: ${_fCIForPub(bfStats.auc, 2, false, lang)}.</li>`;
            } else {
                text += `<li>${_getKollektivTextForPub(k.id, nPat, lang)}: Keine validen optimierten Kriterien für '${bfZielMetric}'.</li>`;
            }
        });
        text += `</ul>`;
        return text;
    }

    function _getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData) {
        let text = '';
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const tableRef = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.id, null, lang);
        const fig2aRef = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.id, null, lang);
        const fig2bRef = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartdirektOP.id, null, lang);
        const fig2cRef = _getSafeLink(PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartnRCT.id, null, lang);


        if (lang === 'de') {
            text += `<h3 id="ergebnisse-vergleich-as-vs-t2-title">Vergleichsanalysen: Avocado Sign vs. T2-Kriterien</h3><p>Statistische Vergleiche zwischen AS und T2-Kriteriensets (Literatur und optimiert für ${bfZielMetric}) sind in ${tableRef} dargestellt. Visuelle Vergleiche sind in ${fig2aRef}, ${fig2bRef} und ${fig2cRef} zu sehen.</p>`;
        } else {
            text += `<h3 id="ergebnisse-vergleich-as-vs-t2-title">Comparative Analyses: Avocado Sign vs. T2 Criteria</h3><p>Statistical comparisons between AS and T2 criteria sets (literature-based and optimized for ${bfZielMetric}) are detailed in ${tableRef}. Visual comparisons are presented in ${fig2aRef}, ${fig2bRef}, and ${fig2cRef}.</p>`;
        }

        const kollektive = [
            { id: 'Gesamt', nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort', litSetId: 'koh_2008_morphology' },
            { id: 'direkt OP', nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort', litSetId: 'rutegard_et_al_esgar'},
            { id: 'nRCT', nameDe: 'nRCT-Kollektiv', nameEn: 'nRCT cohort', litSetId: 'barbaro_2024_restaging'}
        ];

        kollektive.forEach(k => {
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            const statsAS = allKollektivStats?.[k.id]?.gueteAS;
            const litStudySet = studyT2CriteriaManager.getStudyCriteriaSetById(k.litSetId);
            const litSetName = litStudySet ? (UI_TEXTS.kollektivDisplayNames[litStudySet.id] || litStudySet.name) : k.litSetId;
            const statsLit = allKollektivStats?.[k.id]?.gueteT2_literatur?.[k.litSetId];
            const statsBF = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;

            const vergleichASvsLit = allKollektivStats?.[k.id]?.[`vergleichASvsT2_literatur_${k.litSetId}`];
            const vergleichASvsBF = allKollektivStats?.[k.id]?.vergleichASvsT2_bruteforce;

            const pDeLongASvsLit = _getPValueTextForPub(vergleichASvsLit?.delong?.pValue, lang);
            const pDeLongASvsBF = _getPValueTextForPub(vergleichASvsBF?.delong?.pValue, lang);


            if (lang === 'de') {
                text += `<h4>${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Vergleich AS (AUC ${_fCIForPub(statsAS.auc, 2, false, 'de')}) vs. ${litSetName} (AUC ${_fCIForPub(statsLit.auc, 2, false, 'de')}): ${pDeLongASvsLit}.</p>`;
                }
                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Vergleich AS vs. optimierte T2-Kriterien (für ${bfDef.metricName || bfZielMetric}, AUC ${_fCIForPub(statsBF.auc, 2, false, 'de')}): ${pDeLongASvsBF}.</p>`;
                }
            } else {
                text += `<h4>${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit) {
                    text += `<p>Comparison of AS (AUC ${_fCIForPub(statsAS.auc, 2, false, 'en')}) vs ${litSetName} (AUC ${_fCIForPub(statsLit.auc, 2, false, 'en')}): ${pDeLongASvsLit}.</p>`;
                }
                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Comparison of AS vs data-optimized T2 criteria (for ${bfDef.metricName || bfZielMetric}, AUC ${_fCIForPub(statsBF.auc, 2, false, 'en')}): ${pDeLongASvsBF}.</p>`;
                }
            }
        });
        return text;
    }

    function _getDiscussionText(lang, allKollektivStats, commonData) {
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const bfGesamtStats = allKollektivStats?.Gesamt?.gueteT2_bruteforce;
        const vergleichASvsBFGesamt = allKollektivStats?.Gesamt?.vergleichASvsT2_bruteforce;
        const pWertDiskussion = _getPValueTextForPub(vergleichASvsBFGesamt?.delong?.pValue, lang);
        const aucASGesamt = _fCIForPub(asGesamt?.auc, 2, false, lang);
        const nGesamt = _formatNumberForPub(commonData.nGesamt, 0, lang);
        const asPubRef = commonData.references?.LURZ_SCHAEFER_AS_2025 ? _getSafeLink(commonData.references.LURZ_SCHAEFER_AS_2025.id, `(${commonData.references.LURZ_SCHAEFER_AS_2025.numberInList || 'X'})`, lang) : '(Lurz & Schäfer)';
        const kohRefShort = commonData.references?.KOH_2008_MORPHOLOGY ? _getSafeLink(commonData.references.KOH_2008_MORPHOLOGY.id, `(${commonData.references.KOH_2008_MORPHOLOGY.numberInList || 'X'})`, lang) : '(Koh et al)';
        const alSukhniRefShort = commonData.references?.AL_SUKHNI_2012_MRI_ACCURACY ? _getSafeLink(commonData.references.AL_SUKHNI_2012_MRI_ACCURACY.id, `(${commonData.references.AL_SUKHNI_2012_MRI_ACCURACY.numberInList || 'X'})`, lang) : '(Al-Sukhni et al)';


        if (lang === 'de') {
            return `
                <h2 id="discussion-title">Diskussion</h2>
                <p>Diese Studie evaluierte das Avocado Sign (AS) an ${nGesamt} Patienten und verglich es mit T2-Kriterien. Das AS zeigte eine hohe diagnostische Genauigkeit (AUC ${aucASGesamt}). Im Vergleich mit optimierten T2-Kriterien war die Leistung nicht signifikant unterschiedlich (${pWertDiskussion}).</p>
                <p>Die Ergebnisse unterstreichen das Potenzial des AS. Standard-T2-Kriterien haben bekannte Limitationen ${kohRefShort}${alSukhniRefShort}. Die hohe Interobserver-Übereinstimmung des AS ${asPubRef} ist klinisch relevant. Eine verbesserte N-Staging-Genauigkeit ist für individualisierte Therapiekonzepte wichtig.</p>
                <p>Limitationen dieser Studie umfassen den retrospektiven, monozentrischen Charakter und die Fallzahl, die möglicherweise subtile Unterschiede nicht aufdeckt. Prospektive, multizentrische Studien sind zur Validierung erforderlich.</p>
                <p>Zusammenfassend ist das AS ein vielversprechender MRT-Marker. Es könnte die Therapieplanung beim Rektumkarzinom verfeinern.</p>
            `;
        } else {
            return `
                <h2 id="discussion-title">Discussion</h2>
                <p>This study evaluated the Avocado Sign (AS) in ${nGesamt} patients and compared it with T2-weighted criteria. The AS demonstrated high diagnostic accuracy (AUC ${aucASGesamt}). Performance was not significantly different compared with optimized T2-weighted criteria (${pWertDiskussion}).</p>
                <p>Our findings highlight the potential of AS. Standard T2-weighted criteria have known limitations ${kohRefShort}${alSukhniRefShort}. The high interobserver agreement for AS ${asPubRef} is clinically relevant. Improved N-staging accuracy is important for individualized treatment concepts.</p>
                <p>Limitations of this study include its retrospective, single-center design and the sample size, which may not detect subtle differences. Prospective, multicenter studies are needed for validation.</p>
                <p>In conclusion, the AS is a promising MRI marker. It may refine treatment planning in rectal cancer.</p>
            `;
        }
    }

    function _getReferencesText(lang, commonData) {
        const refs = commonData.references || {};
        let text = `<h2 id="references-title">${lang === 'de' ? 'Literaturverzeichnis' : 'References'}</h2><ol class="small">`;

        const refOrder = [
            refs.SIEGEL_2023_CANCER_STATS,
            refs.SAUER_2004_NEOADJUVANT,
            refs.BEETS_TAN_2018_ESGAR_CONSENSUS,
            refs.AL_SUKHNI_2012_MRI_ACCURACY,
            refs.TAYLOR_2011_PREOP_MRI,
            refs.GARCIA_AGUILAR_2022_ORGAN_PRESERVATION,
            refs.SCHRAG_2023_PREOP_TREATMENT,
            refs.LURZ_SCHAEFER_AS_2025,
            refs.KOH_2008_MORPHOLOGY,
            refs.BARBARO_2024_RESTAGING,
            refs.RUTEGARD_2025_ESGAR_VALIDATION,
            refs.STELZNER_2022_OCUM_MRI,
            refs.LAMBREGTS_2013_GADOFOSVESET,
            refs.BARBARO_2010_RESTAGING_RADIOGRAPHICS,
            refs.HORVAT_2019_MRI_RECTAL_CANCER_RADIOGRAPHICS,
            refs.HAO_2025_DWI_RADIOMICS,
            refs.KIM_2019_FDG_PET_ACCURACY,
            refs.ZHOU_2021_LYMPHATIC_METASTASIS
        ].filter(ref => ref && ref.fullCitation).sort((a,b) => (a.numberInList || Infinity) - (b.numberInList || Infinity));


        refOrder.forEach((ref, index) => {
            text += `<li>${ref.fullCitation}</li>`;
        });

        text += `</ol>`;
        return text;
    }

    function getSectionText(sectionId, lang, allKollektivStats, commonData) {
        switch (sectionId) {
            case 'abstract_main': return _getAbstractText(lang, allKollektivStats, commonData);
            case 'introduction_main': return _getIntroductionText(lang, commonData);
            case 'methoden_studienanlage_ethik': return _getMethodenStudienanlageEthikText(lang, commonData);
            case 'methoden_patientenkohorte': return _getMethodenPatientenkohorteText(lang, allKollektivStats, commonData);
            case 'methoden_mrt_protokoll_akquisition': return _getMethodenMRTProtokollAkquisitionText(lang, commonData);
            case 'methoden_bildanalyse_avocado_sign': return _getMethodenBildanalyseAvocadoSignText(lang, commonData);
            case 'methoden_bildanalyse_t2_kriterien': return _getMethodenBildanalyseT2KriterienText(lang, commonData, allKollektivStats);
            case 'methoden_referenzstandard_histopathologie': return _getMethodenReferenzstandardHistopathologieText(lang, commonData);
            case 'methoden_statistische_analyse_methoden': return _getMethodenStatistischeAnalyseMethodenText(lang, commonData);
            case 'ergebnisse_patientencharakteristika': return _getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData);
            case 'ergebnisse_as_diagnostische_guete': return _getErgebnisseASPerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_t2_literatur_diagnostische_guete': return _getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_t2_optimiert_diagnostische_guete': return _getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData);
            case 'ergebnisse_vergleich_as_vs_t2': return _getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData);
            case 'discussion_main': return _getDiscussionText(lang, allKollektivStats, commonData);
            case 'references_main': return _getReferencesText(lang, commonData);
            default: return `<p class="text-warning">Text für Sektion '${sectionId}' (Sprache: ${lang}) noch nicht implementiert.</p>`;
        }
    }

    function getSectionTextAsMarkdown(sectionId, lang, allKollektivStats, commonData) {
        const htmlContent = getSectionText(sectionId, lang, allKollektivStats, commonData);
        let markdown = htmlContent
            .replace(/<p><strong>(.*?)<\/strong><\/p>/g, (match, p1) => `\n**${p1.trim()}**\n`)
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
            .replace(/<a href="#(.*?)">(.*?)<\/a>/g, (match, p1, p2) => {
                const linkText = p2.replace(/<\/?strong>/g, '').replace(/<\/?em>/g, '');
                return `[${linkText}](#${p1})`;
            })
            .replace(/<h1[^>]*>(.*?)<\/h1>/g, (match, p1) => `\n# ${p1.trim()}\n`)
            .replace(/<h2[^>]*>(.*?)<\/h2>/g, (match, p1) => `\n## ${p1.trim()}\n`)
            .replace(/<h3[^>]*>(.*?)<\/h3>/g, (match, p1) => `\n### ${p1.trim()}\n`)
            .replace(/<h4[^>]*>(.*?)<\/h4>/g, (match, p1) => `\n#### ${p1.trim()}\n`)
            .replace(/<hr>/g, '\n---\n')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/\u00A0/g, ' ')
            .replace(/ {2,}/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();

        if (sectionId === 'references_main' && markdown.includes('\n* ')) {
             markdown = markdown.split('\n').map(line => {
                if (line.startsWith('* ')) {
                    const content = line.substring(2);
                     const match = content.match(/^(\d+)\.\s*/);
                     if (match) {
                         return `${match[1]}. ${content.substring(match[0].length).trim()}`;
                     }
                    return `1. ${content.trim()}`;
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
