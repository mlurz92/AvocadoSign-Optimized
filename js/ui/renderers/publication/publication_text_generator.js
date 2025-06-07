const publicationTextGenerator = (() => {

    // Helper to format numbers for publication
    const formatPubNumber = (num, digits = 0, lang = 'en', prefix = '', suffix = '') => {
        if (num === null || num === undefined || isNaN(num) || !isFinite(num)) return '--';
        let formatted = formatNumber(num, digits, '--', true, lang); // Always use standard for initial formatting, then adjust decimal separator
        if (lang === 'de') {
            formatted = formatted.replace('.', ',');
        }
        return `${prefix}${formatted}${suffix}`;
    };

    // Helper to format p-values for publication
    const formatPubPValue = (pValue, lang = 'en', forPub = true) => {
        return getPValueText(pValue, lang, forPub);
    };

    // Helper to format CI for publication
    const formatPubCI = (value, ciLower, ciUpper, digits = 1, isPercent = false, lang = 'en', placeholder = '--') => {
        if (value === null || value === undefined || isNaN(value) || !isFinite(value)) return placeholder;
        const formattedValue = formatPubNumber(value, digits, lang);
        if (ciLower === null || ciLower === undefined || isNaN(ciLower) || !isFinite(ciLower) ||
            ciUpper === null || ciUpper === undefined || isNaN(ciUpper) || !isFinite(ciUpper)) {
            return `${formattedValue}${isPercent ? '%' : ''}`;
        }
        const formattedLower = formatPubNumber(ciLower, digits, lang);
        const formattedUpper = formatPubNumber(ciUpper, digits, lang);
        return `${formattedValue} (${formattedLower}, ${formattedUpper})${isPercent ? '%' : ''}`;
    };
    
    const formatPubMetricValue = (metricData, digits, isPercent, lang = 'en') => {
        if (!metricData || isNaN(metricData.value)) {
            return '--';
        }
        const value = isPercent ? metricData.value * 100 : metricData.value;
        const ciLower = isPercent ? metricData.ci?.lower * 100 : metricData.ci?.lower;
        const ciUpper = isPercent ? metricData.ci?.upper * 100 : metricData.ci?.upper;

        return formatPubCI(value, ciLower, ciUpper, digits, isPercent, lang);
    };

    // Helper to get abbreviated terms for Radiology style
    const getAbbreviation = (term, lang = 'en') => {
        const abbreviations = {
            'accuracy': { de: 'Genauigkeit', en: 'Accuracy' },
            'balanced accuracy': { de: 'Balancierte Genauigkeit', en: 'Balanced Accuracy' },
            'f1-score': { de: 'F1-Score', en: 'F1-Score' },
            'ppv': { de: 'Positiver Prädiktiver Wert', en: 'Positive Predictive Value' },
            'npv': { de: 'Negativer Prädiktiver Wert', en: 'Negative Predictive Value' },
            'sensitivity': { de: 'Sensitivität', en: 'Sensitivity' },
            'specificity': { de: 'Spezifität', en: 'Specificity' },
            'auc': { de: 'Fläche unter der ROC-Kurve', en: 'Area Under the Receiver Operating Characteristic Curve' },
            'ci': { de: 'Konfidenzintervall', en: 'Confidence Interval' },
            'sd': { de: 'Standardabweichung', en: 'Standard Deviation' },
            'or': { de: 'Odds Ratio', en: 'Odds Ratio' },
            'rd': { de: 'Risikodifferenz', en: 'Risk Difference' },
            'n_status_positive': {de: 'N-positiv', en: 'N-positive'},
            'n_status_negative': {de: 'N-negativ', en: 'N-negative'},
            'avocado_sign': {de: 'Avocado Sign', en: 'Avocado Sign'},
            'brute_force_optimized': {de: 'Brute-Force optimiert', en: 'Brute-Force optimized'},
            'literature_based': {de: 'Literatur-basiert', en: 'Literature-based'},
            't2_weighted': {de: 'T2-gewichtet', en: 'T2-weighted'},
            'mesorectal': {de: 'mesorektal', en: 'mesorectal'},
            'lymph_node': {de: 'Lymphknoten', en: 'lymph node'},
            'magnetic_resonance_imaging': {de: 'Magnetresonanztomographie', en: 'magnetic resonance imaging'},
            'neoadjuvant_radiochemotherapy': {de: 'neoadjuvante Radiochemotherapie', en: 'neoadjuvant radiochemotherapy'},
            'upfront_surgery': {de: 'direkte Operation', en: 'upfront surgery'},
            'total_mesorectal_excision': {de: 'totale mesorektale Exzision', en: 'total mesorectal excision'},
            'rectal_cancer': {de: 'Rektumkarzinom', en: 'rectal cancer'},
            'histopathology': {de: 'Histopathologie', en: 'histopathology'},
            'short_axis_diameter': {de: 'Kurzachsendurchmesser', en: 'short-axis diameter'},
            'mean': {de: 'Mittelwert', en: 'mean'},
            'median': {de: 'Median', en: 'median'},
            'min': {de: 'Minimum', en: 'minimum'},
            'max': {de: 'Maximum', en: 'maximum'},
            'range': {de: 'Bereich', en: 'range'},
            'percent': {de: 'Prozent', en: 'percent'},
            'patients': {de: 'Patienten', en: 'patients'}
        };
        const termLower = term.toLowerCase().replace(/_|\s/g, '_');
        return abbreviations[termLower]?.[lang] || term;
    };

    const _getMetricDescription = (metricKey, lang = 'en') => {
        const baseKey = metricKey.replace('Short', '');
        const metricDescriptions = {
            'sens': {de: 'Sensitivität', en: 'sensitivity'},
            'spez': {de: 'Spezifität', en: 'specificity'},
            'ppv': {de: 'positiver prädiktiver Wert', en: 'positive predictive value'},
            'npv': {de: 'negativer prädiktiver Wert', en: 'negative predictive value'},
            'acc': {de: 'Genauigkeit', en: 'accuracy'},
            'balAcc': {de: 'balancierte Genauigkeit', en: 'balanced accuracy'},
            'f1': {de: 'F1-Score', en: 'F1-score'},
            'auc': {de: 'Fläche unter der ROC-Kurve (AUC)', en: 'area under the receiver operating characteristic curve (AUC)'}
        };
        return metricDescriptions[baseKey]?.[lang] || metricKey;
    };


    function generateAbstract(context) {
        const lang = context.currentLanguage;
        const totalPatients = context.rawData.length;
        const nPlusPatientsTotal = context.allStats.Gesamt.deskriptiv.nStatus.plus;
        const nMinusPatientsTotal = context.allStats.Gesamt.deskriptiv.nStatus.minus;
        const asPerformance = context.allStats.Gesamt.gueteAS;
        const bfResult = context.bruteForceResults.Gesamt?.bestResult;
        const appliedT2Performance = context.allStats.Gesamt.gueteT2_angewandt;

        let bestT2PerformanceSummary = 'not available';
        let bestT2Name = '';
        let bestT2LogicDisplay = '';
        if (bfResult && bfResult.criteria) {
            bestT2PerformanceSummary = formatPubMetricValue(context.allStats.Gesamt.gueteT2_bruteforce?.[bfResult.metric.toLowerCase().replace(' ', '')], 3, false, lang);
            bestT2Name = (lang === 'de' ? 'Brute-Force optimierte T2-Kriterien' : 'Brute-Force optimized T2 criteria');
            bestT2LogicDisplay = bfResult.logic;
        } else if (appliedT2Performance && !isNaN(appliedT2Performance.auc?.value)) {
             bestT2PerformanceSummary = formatPubMetricValue(appliedT2Performance.auc, 3, false, lang);
             bestT2Name = (lang === 'de' ? 'aktuell angewandte T2-Kriterien' : 'currently applied T2 criteria');
             bestT2LogicDisplay = t2CriteriaManager.getAppliedLogic();
        }

        const abstractText = {
            de: `
<p><strong>Hintergrund:</strong> Die präoperative Bestimmung des Lymphknotenstatus beim Rektumkarzinom ist entscheidend für das Staging und die Therapieplanung. Die MRT-basierte Lymphknotenbeurteilung ist etabliert, weist jedoch Limitationen auf. Das kürzlich beschriebene Avocado Sign (AS) wurde als vielversprechender neuer MRT-Marker für maligne mesorektale Lymphknoten vorgeschlagen. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025}</p>
<p><strong>Ziel:</strong> Ziel dieser Studie war es, die diagnostische Leistung des Avocado Signs mit etablierten und datengetriebenen T2-gewichteten (T2w) morphologischen Kriterien im präoperativen und post-neoadjuvanten Setting zu vergleichen.</p>
<p><strong>Material und Methoden:</strong> Diese retrospektive, monozentrische Studie schloss ${totalPatients} Patienten mit histopathologisch bestätigtem Rektumkarzinom ein, die zwischen ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.STUDY_PERIOD_2020_2023} einem ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.MRI_SYSTEM_SIEMENS_3T} MRT unterzogen wurden. Alle Patienten erhielten eine totale mesorektale Exzision (TME). Der Referenzstandard war der histopathologisch bestimmte N-Status. Die MRT-Bilder wurden von zwei erfahrenen Radiologen nach dem Vorhandensein des AS und morphologischen T2w-Kriterien (Größe, Form, Kontur, Homogenität, Signalintensität) retrospektiv ausgewertet. Die diagnostische Leistung (Sensitivität, Spezifität, Genauigkeit, balancierte Genauigkeit, positiver und negativer prädiktiver Wert, F1-Score, AUC) wurde berechnet und verglichen. Eine Brute-Force-Optimierung wurde durchgeführt, um die optimale Kombination der T2w-Kriterien zu identifizieren.</p>
<p><strong>Ergebnisse:</strong> Von ${totalPatients} Patienten waren ${nPlusPatientsTotal} (${formatPubNumber(nPlusPatientsTotal / totalPatients * 100, 1, lang, '', '%')}) N-positiv und ${nMinusPatientsTotal} (${formatPubNumber(nMinusPatientsTotal / totalPatients * 100, 1, lang, '', '%')}) N-negativ. Das Avocado Sign zeigte eine ${getAbbreviation('sensitivity', lang)} von ${formatPubMetricValue(asPerformance.sens, 1, true, lang)}, eine ${getAbbreviation('specificity', lang)} von ${formatPubMetricValue(asPerformance.spez, 1, true, lang)}, eine ${getAbbreviation('accuracy', lang)} von ${formatPubMetricValue(asPerformance.acc, 1, true, lang)} und eine ${getAbbreviation('auc', lang)} von ${formatPubMetricValue(asPerformance.auc, 3, false, lang)}. Im Vergleich dazu erreichten die Brute-Force optimierten T2-Kriterien für die Maximierung der ${getAbbreviation(context.currentBruteForceMetric, lang)} (Logic: ${bestT2LogicDisplay}) eine ${getAbbreviation('auc', lang)} von ${bestT2PerformanceSummary}. Statistische Vergleiche zeigten signifikante Unterschiede in der diagnostischen Leistung zwischen AS und einigen T2-Kriterienkombinationen.</p>
<p><strong>Fazit:</strong> Das Avocado Sign ist ein vielversprechender MRT-Marker für mesorektale Lymphknotenmetastasen. Es zeigte eine vergleichbare oder überlegene diagnostische Leistung im Vergleich zu etablierten T2-Kriterien und datengetriebenen T2-Kriterien. Das AS könnte die präoperative N-Staging-Genauigkeit verbessern und eine potenzielle Ergänzung zu den derzeitigen Bildgebungsrichtlinien darstellen.</p>
            `,
            en: `
<p><strong>Background:</strong> Preoperative determination of lymph node status in rectal cancer is crucial for staging and treatment planning. MRI-based lymph node assessment is established but has limitations. The recently described Avocado Sign (AS) has been proposed as a promising new MRI marker for malignant mesorectal lymph nodes. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025}</p>
<p><strong>Purpose:</strong> The aim of this study was to compare the diagnostic performance of the Avocado Sign with established and data-driven T2-weighted (T2w) morphological criteria in preoperative and post-neoadjuvant settings.</p>
<p><strong>Materials and Methods:</strong> This retrospective, single-center study included ${totalPatients} patients with histopathologically confirmed rectal cancer who underwent ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.MRI_SYSTEM_SIEMENS_3T} MRI between ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.STUDY_PERIOD_2020_2023}. All patients underwent total mesorectal excision (TME). The reference standard was histopathologically determined N-status. MRI images were retrospectively evaluated by two experienced radiologists for the presence of AS and morphological T2w criteria (size, shape, contour, homogeneity, signal intensity). Diagnostic performance (sensitivity, specificity, accuracy, balanced accuracy, positive and negative predictive value, F1-score, AUC) was calculated and compared. A brute-force optimization was performed to identify the optimal combination of T2w criteria.</p>
<p><strong>Results:</strong> Of ${totalPatients} patients, ${nPlusPatientsTotal} (${formatPubNumber(nPlusPatientsTotal / totalPatients * 100, 1, lang, '', '%')}) were N-positive and ${nMinusPatientsTotal} (${formatPubNumber(nMinusPatientsTotal / totalPatients * 100, 1, lang, '', '%')}) were N-negative. The Avocado Sign showed a ${getAbbreviation('sensitivity', lang)} of ${formatPubMetricValue(asPerformance.sens, 1, true, lang)}, a ${getAbbreviation('specificity', lang)} of ${formatPubMetricValue(asPerformance.spez, 1, true, lang)}, an ${getAbbreviation('accuracy', lang)} of ${formatPubMetricValue(asPerformance.acc, 1, true, lang)}, and an ${getAbbreviation('auc', lang)} of ${formatPubMetricValue(asPerformance.auc, 3, false, lang)}. In comparison, the Brute-Force optimized T2 criteria for maximizing ${getAbbreviation(context.currentBruteForceMetric, lang)} (Logic: ${bestT2LogicDisplay}) achieved an ${getAbbreviation('auc', lang)} of ${bestT2PerformanceSummary}. Statistical comparisons revealed significant differences in diagnostic performance between AS and some T2 criteria combinations.</p>
<p><strong>Conclusion:</strong> The Avocado Sign is a promising MRI marker for mesorectal lymph node metastases. It demonstrated comparable or superior diagnostic performance compared to established and data-driven T2 criteria. AS could improve preoperative N-staging accuracy and represents a potential adjunct to current imaging guidelines.</p>
            `
        };

        const keyResults = {
            de: `
<p><strong>Schlüsselergebnisse:</strong></p>
<ul>
    <li>Das Avocado Sign zeigte eine hohe ${getAbbreviation('sensitivity', lang)} (${formatPubMetricValue(asPerformance.sens, 1, true, lang)}) und ${getAbbreviation('specificity', lang)} (${formatPubMetricValue(asPerformance.spez, 1, true, lang)}) für die Prädiktion von ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('metastases', lang)}.</li>
    <li>Die diagnostische Leistung des Avocado Signs war vergleichbar oder überlegen gegenüber den meisten etablierten ${getAbbreviation('t2_weighted', lang)} ${getAbbreviation('morphological', lang)} ${getAbbreviation('criteria', lang)}.</li>
    <li>Datengetriebene ${getAbbreviation('t2_weighted', lang)} ${getAbbreviation('criteria', lang)}, optimiert mittels Brute-Force, zeigten die höchste ${getAbbreviation(context.currentBruteForceMetric, lang)} von ${bestT2PerformanceSummary}.</li>
    <li>Das Avocado Sign ist ein robuster und einfach anzuwendender ${getAbbreviation('mri', lang)}-basierter ${getAbbreviation('biomarker', lang)}, der das ${getAbbreviation('n_status_positive', lang)} ${getAbbreviation('staging', lang)} des ${getAbbreviation('rectal_cancer', lang)} verbessern könnte.</li>
</ul>
            `,
            en: `
<p><strong>Key Results:</strong></p>
<ul>
    <li>The Avocado Sign demonstrated high ${getAbbreviation('sensitivity', lang)} (${formatPubMetricValue(asPerformance.sens, 1, true, lang)}) and ${getAbbreviation('specificity', lang)} (${formatPubMetricValue(asPerformance.spez, 1, true, lang)}) for predicting ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('metastases', lang)}.</li>
    <li>Diagnostic performance of the Avocado Sign was comparable or superior to most established ${getAbbreviation('t2_weighted', lang)} ${getAbbreviation('morphological', lang)} ${getAbbreviation('criteria', lang)}.</li>
    <li>Data-driven ${getAbbreviation('t2_weighted', lang)} ${getAbbreviation('criteria', lang)}, optimized by brute-force, achieved the highest ${getAbbreviation(context.currentBruteForceMetric, lang)} of ${bestT2PerformanceSummary}.</li>
    <li>The Avocado Sign is a robust and easily applicable ${getAbbreviation('mri', lang)}-based ${getAbbreviation('biomarker', lang)} that could improve ${getAbbreviation('n_status_positive', lang)} ${getAbbreviation('staging', lang)} of ${getAbbreviation('rectal_cancer', lang)}.</li>
</ul>
            `
        };

        const abstract = abstractText[lang] || abstractText.en;
        const keyResultsContent = keyResults[lang] || keyResults.en;
        
        let abstractTitle = lang === 'de' ? "Abstract" : "Abstract"; // Radiology typically uses "Abstract"
        let keyResultsTitle = lang === 'de' ? "Schlüsselergebnisse" : "Key Results";

        // Check word limits for abstract and key results
        const abstractWordCount = abstract.split(/\s+/).filter(word => word.length > 0).length;
        const keyResultsWordCount = keyResultsContent.split(/\s+/).filter(word => word.length > 0).length;

        let wordCountWarning = '';
        if (abstractWordCount > APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.WORD_COUNT_ABSTRACT_MAX) {
            wordCountWarning += `<p class="alert alert-warning small"><i class="fas fa-exclamation-triangle me-1"></i> ${lang === 'de' ? 'Der Abstract überschreitet die empfohlene Wortzahl von' : 'Abstract exceeds recommended word count of'} ${APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.WORD_COUNT_ABSTRACT_MAX} ${lang === 'de' ? 'Wörtern.' : 'words.'} (Aktuell: ${abstractWordCount} ${lang === 'de' ? 'Wörter' : 'words'})</p>`;
        }
         if (keyResultsWordCount > APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.KEY_RESULTS_WORD_LIMIT) {
            wordCountWarning += `<p class="alert alert-warning small"><i class="fas fa-exclamation-triangle me-1"></i> ${lang === 'de' ? 'Die Schlüsselergebnisse überschreiten die empfohlene Wortzahl von' : 'Key Results exceed recommended word count of'} ${APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.KEY_RESULTS_WORD_LIMIT} ${lang === 'de' ? 'Wörtern.' : 'words.'} (Aktuell: ${keyResultsWordCount} ${lang === 'de' ? 'Wörter' : 'words'})</p>`;
        }

        return `
            <div class="publikation-section" id="abstract_main_section">
                <h4>${abstractTitle}</h4>
                ${wordCountWarning}
                ${abstract}
                <hr>
                <h4>${keyResultsTitle}</h4>
                ${keyResultsContent}
            </div>
        `;
    }

    function generateIntroduction(context) {
        const lang = context.currentLanguage;
        const introText = {
            de: `
<p>Das ${getAbbreviation('rectal_cancer', lang)} stellt eine bedeutende globale Gesundheitsherausforderung dar, mit schätzungsweise über 1,9 Millionen neuen Fällen im Jahr 2023. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.SIEGEL_MILLER_2023} Die Inzidenz variiert geografisch, bleibt aber eine der häufigsten Krebserkrankungen weltweit. Die präoperative Beurteilung des Tumorstadiums, insbesondere des Lymphknotenstatus, ist von entscheidender Bedeutung für die Therapieplanung und die Prognose. Patienten mit ${getAbbreviation('lymph_node', lang)}metastasen (N+) haben im Allgemeinen eine schlechtere Prognose, was die Notwendigkeit einer akkuraten ${getAbbreviation('staging', lang)} unerlässlich macht.</p>
<p>Die neoadjuvante Radiochemotherapie (${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}) hat sich als Eckpfeiler in der Behandlung des lokal fortgeschrittenen ${getAbbreviation('rectal_cancer', lang)} etabliert, indem sie die lokale Rezidivrate senkt und die Downstaging-Raten erhöht. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.SAUER_BECKER_2004} Für die initiale Staging und die Beurteilung des Ansprechens nach ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} spielt die ${getAbbreviation('magnetic_resonance_imaging', lang)} (MRT) eine zentrale Rolle. Die hochauflösende T2-gewichtete (T2w) MRT ist aufgrund ihrer exzellenten Weichteilkontraste und der Fähigkeit, die ${getAbbreviation('mesorectal', lang)} Faszie darzustellen, die bevorzugte Modalität für das lokale Staging des ${getAbbreviation('rectal_cancer', lang)}.</p>
<p>Trotz der Fortschritte in der MRT-Technologie bleibt die genaue Beurteilung des ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('status', lang)} eine Herausforderung. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.AL_SUKHNI_2012} Traditionell werden morphologische Kriterien wie Größe, Form, Kontur und Signalintensität auf T2w-MRT-Bildern zur Identifizierung maligner Lymphknoten herangezogen. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.BROWN_2003_MORPHOLOGY}, ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.KOH_2008_MORPHOLOGY} Es gibt jedoch keine allgemein akzeptierten Standardkriterien, und die diagnostische Leistung dieser morphologischen Merkmale ist variabel. Die Größe alleine ist oft ein unzuverlässiger Prädiktor, insbesondere nach ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}, wo eine Schrumpfung der Lymphknoten ohne vollständige Auslöschung maligner Zellen auftreten kann. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.BEETS_TAN_2009_USPIO_RESTAGING}, ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.BARBARO_2010_RESTAGING}</p>
<p>In den letzten Jahren wurden neue MRT-Marker und Ansätze zur Verbesserung des ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('staging', lang)} untersucht. Dazu gehören der Einsatz von diffusiongewichteten Sequenzen und die Entwicklung von radiomischen Signaturen. Kürzlich wurde das "Avocado Sign" (AS) als ein potenzieller neuer, einfach zu erkennender MRT-Marker für maligne ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('metastases', lang)} vorgeschlagen. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025} Das AS basiert auf einer spezifischen Kombination von morphologischen Merkmalen und einer charakteristischen Signalintensität, die es von benignen Lymphknoten unterscheidet.</p>
<p>Die vorliegende Studie zielt darauf ab, die diagnostische Leistung dieses neuartigen Avocado Signs im Vergleich zu etablierten T2w-morphologischen Kriterien und datengetriebenen T2w-Kriterien zu bewerten. Unser Hauptziel ist es, die inkrementelle Wertigkeit des AS im präoperativen ${getAbbreviation('n_status_positive', lang)} ${getAbbreviation('staging', lang)} zu bestimmen und zu untersuchen, ob es eine Verbesserung gegenüber den derzeitigen Standards darstellt. Die Ergebnisse sollen dazu beitragen, die Genauigkeit der präoperativen Beurteilung des ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('status', lang)} zu verbessern und somit die klinische Entscheidungsfindung und die Patientenergebnisse zu optimieren.</p>
            `,
            en: `
<p>${getAbbreviation('rectal_cancer', lang)} represents a significant global health challenge, with an estimated over 1.9 million new cases in 2023. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.SIEGEL_MILLER_2023} Its incidence varies geographically but remains one of the most common cancers worldwide. Preoperative assessment of tumor stage, particularly ${getAbbreviation('lymph_node', lang)} status, is crucial for treatment planning and prognosis. Patients with ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('metastases', lang)} (N+) generally have a worse prognosis, making accurate ${getAbbreviation('staging', lang)} essential.</p>
<p>${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} (${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}) has become a cornerstone in the treatment of locally advanced ${getAbbreviation('rectal_cancer', lang)}, reducing local recurrence rates and increasing downstaging rates. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.SAUER_BECKER_2004} For initial staging and response assessment after ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}, ${getAbbreviation('magnetic_resonance_imaging', lang)} (MRI) plays a central role. High-resolution T2-weighted (T2w) MRI is the preferred modality for local staging of ${getAbbreviation('rectal_cancer', lang)} due to its excellent soft tissue contrast and ability to depict the ${getAbbreviation('mesorectal', lang)} fascia.</p>
<p>Despite advances in MRI technology, accurate assessment of ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} status remains challenging. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.AL_SUKHNI_2012} Traditionally, morphological criteria such as size, shape, contour, and signal intensity on T2w MRI images have been used to identify malignant lymph nodes. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.BROWN_2003_MORPHOLOGY}, ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.KOH_2008_MORPHOLOGY} However, there are no universally accepted standard criteria, and the diagnostic performance of these morphological features is variable. Size alone is often an unreliable predictor, especially after ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}, where lymph node shrinkage may occur without complete eradication of malignant cells. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.BEETS_TAN_2009_USPIO_RESTAGING}, ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.BARBARO_2010_RESTAGING}</p>
<p>In recent years, new MRI markers and approaches have been investigated to improve ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('staging', lang)}. These include the use of diffusion-weighted sequences and the development of radiomic signatures. Recently, the "Avocado Sign" (AS) has been proposed as a potential new, easily recognizable MRI marker for malignant ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('metastases', lang)}. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025} The AS is based on a specific combination of morphological features and characteristic signal intensity that distinguishes it from benign lymph nodes.</p>
<p>The present study aims to evaluate the diagnostic performance of this novel Avocado Sign compared to established T2w morphological criteria and data-driven T2w criteria. Our primary objective is to determine the incremental value of AS in preoperative ${getAbbreviation('n_status_positive', lang)} ${getAbbreviation('staging', lang)} and to investigate whether it represents an improvement over current standards. The results are intended to contribute to improving the accuracy of preoperative assessment of ${getAbbreviation('lymph_node', lang)} status, thereby optimizing clinical decision-making and patient outcomes.</p>
            `
        };
        return introText[lang] || introText.en;
    }

    function generateMethodsStudyDesign(context) {
        const lang = context.currentLanguage;
        const numPatients = context.rawData.length;
        const methodsText = {
            de: `
<p><strong>Studiendesign und Patienten:</strong> Diese retrospektive, monozentrische Studie wurde an einem tertiären Referenzzentrum durchgeführt. Die Studie wurde von der lokalen Ethikkommission (${APP_CONFIG.REFERENCES_FOR_PUBLICATION.ETHICS_VOTE_LEIPZIG}) genehmigt, und die Anforderung einer informierten Einwilligung wurde aufgehoben. Die Studie wurde in Übereinstimmung mit der Deklaration von Helsinki durchgeführt. Die Daten von ${numPatients} Patienten mit histopathologisch bestätigtem ${getAbbreviation('rectal_cancer', lang)} (Adenokarzinom) wurden retrospektiv analysiert. Alle Patienten unterzogen sich einer ${getAbbreviation('total_mesorectal_excision', lang)} (TME) zwischen ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.STUDY_PERIOD_2020_2023}. Patienten, die vor der ${getAbbreviation('mri', lang)}-Untersuchung und TME keine ${getAbbreviation('rectal_cancer', lang)} Diagnose erhalten hatten oder unvollständige klinische/radiologische Daten aufwiesen, wurden ausgeschlossen.</p>
<p><strong>Bildakquisition:</strong> Alle Patienten unterzogen sich einer standardisierten präoperativen ${getAbbreviation('pelvic', lang)} ${getAbbreviation('magnetic_resonance_imaging', lang)} (${getAbbreviation('magnetic_resonance_imaging', lang)}) am ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.MRI_SYSTEM_SIEMENS_3T}. ${getAbbreviation('contrast_agent', lang)} wurde in allen Fällen verabreicht. Spezifische ${getAbbreviation('mri', lang)} ${getAbbreviation('sequences', lang)} umfassten hochauflösende T2-gewichtete Sequenzen (axial, sagittal, koronal), diffusionsgewichtete Sequenzen und T1-gewichtete Sequenzen vor und nach ${getAbbreviation('contrast_agent', lang)} (${APP_CONFIG.REFERENCES_FOR_PUBLICATION.CONTRAST_AGENT_PROHANCE}).</p>
            `,
            en: `
<p><strong>Study Design and Patients:</strong> This retrospective, single-center study was conducted at a tertiary referral center. The study was approved by the local ethics committee (${APP_CONFIG.REFERENCES_FOR_PUBLICATION.ETHICS_VOTE_LEIPZIG}), and the requirement for informed consent was waived. The study was conducted in accordance with the Declaration of Helsinki. Data from ${numPatients} patients with histopathologically confirmed ${getAbbreviation('rectal_cancer', lang)} (adenocarcinoma) were retrospectively analyzed. All patients underwent ${getAbbreviation('total_mesorectal_excision', lang)} (TME) between ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.STUDY_PERIOD_2020_2023}. Patients who had not received a ${getAbbreviation('rectal_cancer', lang)} diagnosis before ${getAbbreviation('magnetic_resonance_imaging', lang)} and TME or who had incomplete clinical/radiological data were excluded.</p>
<p><strong>Image Acquisition:</strong> All patients underwent standardized preoperative ${getAbbreviation('pelvic', lang)} ${getAbbreviation('magnetic_resonance_imaging', lang)} (${getAbbreviation('magnetic_resonance_imaging', lang)}) on a ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.MRI_SYSTEM_SIEMENS_3T}. ${getAbbreviation('contrast_agent', lang)} was administered in all cases. Specific ${getAbbreviation('magnetic_resonance_imaging', lang)} ${getAbbreviation('sequences', lang)} included high-resolution T2-weighted sequences (axial, sagittal, coronal), diffusion-weighted sequences, and T1-weighted sequences before and after ${getAbbreviation('contrast_agent', lang)} (${APP_CONFIG.REFERENCES_FOR_PUBLICATION.CONTRAST_AGENT_PROHANCE}).</p>
            `
        };
        return methodsText[lang] || methodsText.en;
    }

    function generateMethodsPatientCohort(context) {
        const lang = context.currentLanguage;
        const totalPatients = context.rawData.length;
        const direktOPPatients = context.allStats.Gesamt.therapie['direkt OP'];
        const nRCTPatients = context.allStats.Gesamt.therapie.nRCT;
        const ageMedian = formatPubNumber(context.allStats.Gesamt.alter.median, 0, lang);
        const ageRange = `${formatPubNumber(context.allStats.Gesamt.alter.min, 0, lang)}–${formatPubNumber(context.allStats.Gesamt.alter.max, 0, lang)}`;
        const ageMean = formatPubNumber(context.allStats.Gesamt.alter.mean, 1, lang);
        const ageSD = formatPubNumber(context.allStats.Gesamt.alter.sd, 1, lang);
        const malePatients = context.allStats.Gesamt.geschlecht.m;
        const femalePatients = context.allStats.Gesamt.geschlecht.f;
        const nPlusTotal = context.allStats.Gesamt.deskriptiv.nStatus.plus;
        const nMinusTotal = context.allStats.Gesamt.deskriptiv.nStatus.minus;

        const methodsText = {
            de: `
<p>Insgesamt wurden ${totalPatients} Patienten in die Studie eingeschlossen. Davon erhielten ${direktOPPatients} (${formatPubNumber(direktOPPatients / totalPatients * 100, 1, lang, '', '%')}) eine ${getAbbreviation('upfront_surgery', lang)} und ${nRCTPatients} (${formatPubNumber(nRCTPatients / totalPatients * 100, 1, lang, '', '%')}) eine ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} (${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}) vor der Operation. Das mediane Alter der Patienten betrug ${ageMedian} Jahre (${ageRange}) [${ageMean} ± ${ageSD}]. Es wurden ${malePatients} männliche (${formatPubNumber(malePatients / totalPatients * 100, 1, lang, '', '%')}) und ${femalePatients} weibliche (${formatPubNumber(femalePatients / totalPatients * 100, 1, lang, '', '%')}) Patienten eingeschlossen. Histopathologisch waren ${nPlusTotal} (${formatPubNumber(nPlusTotal / totalPatients * 100, 1, lang, '', '%')}) Patienten N-positiv und ${nMinusTotal} (${formatPubNumber(nMinusTotal / totalPatients * 100, 1, lang, '', '%')}) Patienten N-negativ. Ein detailliertes Flussdiagramm zur Patientenkohorte ist in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.captionDe.split(':')[0]} dargestellt.</p>
<div id="methoden_patienten_flow_chart_container" class="figure-container"></div>
            `,
            en: `
<p>A total of ${totalPatients} patients were included in the study. Of these, ${direktOPPatients} (${formatPubNumber(direktOPPatients / totalPatients * 100, 1, lang, '', '%')}) received ${getAbbreviation('upfront_surgery', lang)} and ${nRCTPatients} (${formatPubNumber(nRCTPatients / totalPatients * 100, 1, lang, '', '%')}) underwent ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} (${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}) before surgery. The median age of patients was ${ageMedian} years (range: ${ageRange}) [${ageMean} ± ${ageSD}]. The cohort comprised ${malePatients} male (${formatPubNumber(malePatients / totalPatients * 100, 1, lang, '', '%')}) and ${femalePatients} female (${formatPubNumber(femalePatients / totalPatients * 100, 1, lang, '', '%')}) patients. Histopathologically, ${nPlusTotal} (${formatPubNumber(nPlusTotal / totalPatients * 100, 1, lang, '', '%')}) patients were N-positive and ${nMinusTotal} (${formatPubNumber(nMinusTotal / totalPatients * 100, 1, lang, '', '%')}) patients were N-negative. A detailed patient cohort flowchart is presented in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.captionEn.split(':')[0]}.</p>
<div id="methoden_patienten_flow_chart_container" class="figure-container"></div>
            `
        };
        return methodsText[lang] || methodsText.en;
    }

    function generateMethodsMRIProtocol(context) {
        const lang = context.currentLanguage;
        const methodsText = {
            de: `
<p>Alle ${getAbbreviation('magnetic_resonance_imaging', lang)}-Untersuchungen wurden auf einem ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.MRI_SYSTEM_SIEMENS_3T} durchgeführt. Standardisierte ${getAbbreviation('mri', lang)}-Protokolle für das ${getAbbreviation('rectal_cancer', lang)} ${getAbbreviation('staging', lang)} wurden verwendet, einschließlich hochauflösender T2-gewichteter (T2w) Sequenzen in axialen, sagittalen und koronaren Ebenen, einer diffusionsgewichteten Bildgebung (DWI) und prä- sowie post-kontrast T1-gewichteter Sequenzen. ${getAbbreviation('contrast_agent', lang)} (${APP_CONFIG.REFERENCES_FOR_PUBLICATION.CONTRAST_AGENT_PROHANCE}) wurde intravenös verabreicht. Die genauen Bildgebungsparameter entsprachen den klinischen Standardprotokollen und ähnelten denen, die in den ESGAR-Empfehlungen beschrieben sind. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.BEETS_TAN_2018_ESGAR_CONSENSUS}</p>
            `,
            en: `
<p>All ${getAbbreviation('magnetic_resonance_imaging', lang)} examinations were performed on a ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.MRI_SYSTEM_SIEMENS_3T}. Standardized ${getAbbreviation('magnetic_resonance_imaging', lang)} protocols for ${getAbbreviation('rectal_cancer', lang)} ${getAbbreviation('staging', lang)} were used, including high-resolution T2-weighted (T2w) sequences in axial, sagittal, and coronal planes, diffusion-weighted imaging (DWI), and pre- and post-contrast T1-weighted sequences. ${getAbbreviation('contrast_agent', lang)} (${APP_CONFIG.REFERENCES_FOR_PUBLICATION.CONTRAST_AGENT_PROHANCE}) was administered intravenously. The exact imaging parameters adhered to clinical standard protocols and were similar to those described in ESGAR recommendations. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.BEETS_TAN_2018_ESGAR_CONSENSUS}</p>
            `
        };
        return methodsText[lang] || methodsText.en;
    }

    function generateMethodsAvocadoSign(context) {
        const lang = context.currentLanguage;
        const methodsText = {
            de: `
<p>Das Avocado Sign (AS) wurde als neues radiologisches Zeichen für ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('metastases', lang)} in einer separaten Publikation detailliert beschrieben. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025} Kurz gesagt, das AS wird als positiv definiert, wenn ein ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} eine "avocado"-ähnliche Morphologie aufweist, gekennzeichnet durch eine ovale oder runde Form, eine glatte oder leicht unregelmäßige Kontur und eine inhomogene Signalintensität mit zentraler Signalminderung auf T2w-Bildern. Die Beurteilung des AS wurde von zwei erfahrenen Radiologen (${APP_CONFIG.REFERENCES_FOR_PUBLICATION.RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER[0]} und ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER[1]} Jahre Erfahrung in der ${getAbbreviation('abdominal', lang)} ${getAbbreviation('radiology', lang)}) unabhängig vorgenommen, die für diese Studie verblindet waren bezüglich des histopathologischen ${getAbbreviation('n_status_positive', lang)}.</p>
            `,
            en: `
<p>The Avocado Sign (AS) has been described in detail as a new radiological sign for ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('metastases', lang)} in a separate publication. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025} Briefly, the AS is defined as positive when a ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} exhibits an "avocado"-like morphology, characterized by an oval or round shape, a smooth or slightly irregular contour, and inhomogeneous signal intensity with central signal void on T2w images. The assessment of the AS was independently performed by two experienced radiologists (${APP_CONFIG.REFERENCES_FOR_PUBLICATION.RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER[0]} and ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER[1]} years of experience in ${getAbbreviation('abdominal', lang)} ${getAbbreviation('radiology', lang)}), who were blinded to the histopathological ${getAbbreviation('n_status_positive', lang)}.</p>
            `
        };
        return methodsText[lang] || methodsText.en;
    }

    function generateMethodsT2Criteria(context) {
        const lang = context.currentLanguage;
        const literatureSets = APP_CONFIG.PUBLICATION_CONFIG.literatureCriteriaSets;
        const appliedCriteria = context.appliedT2Criteria;
        const appliedLogic = context.appliedT2Logic;
        const bfMetricName = context.currentBruteForceMetric;
        const bfResultOverall = context.bruteForceResults.Gesamt?.bestResult;
        const bfCriteriaOverall = bfResultOverall?.criteria;
        const bfLogicOverall = bfResultOverall?.logic;

        const methodsText = {
            de: `
<p>Neben dem Avocado Sign wurden etablierte und datengetriebene T2-gewichtete (T2w) morphologische Kriterien für die Beurteilung des ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('status', lang)} evaluiert. Die morphologischen Kriterien umfassten: Kurzachsendurchmesser (${getAbbreviation('short_axis_diameter', lang)}), Form (rund/oval), Kontur (scharf/irregulär), Homogenität (homogen/heterogen) und Signalintensität (signalarm/intermediär/signalreich). Die Beurteilung dieser Kriterien erfolgte ebenfalls durch die beiden oben genannten Radiologen.</p>
<p>Drei spezifische, Literatur-basierte T2w-Kriteriensets wurden in dieser Studie reproduziert und auf die entsprechende Patientenkohorte (primär operiert oder neoadjuvant behandelt) angewendet und ihre Leistung evaluiert. Eine detaillierte Übersicht dieser Kriteriensets ist in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.captionDe.split(':')[0]} zu finden. Diese umfassen:</p>
<div id="methoden_literatur_kriterien_tabelle_container" class="table-container"></div>
<ul>
    ${literatureSets.map(set => `<li>${set.name} (${set.applicableKollektiv === 'Gesamt' ? 'Gesamtkollektiv' : (set.applicableKollektiv === 'direkt OP' ? 'Direkt OP' : 'nRCT')}): Definiert als "${studyT2CriteriaManager.formatStudyCriteriaForDisplay(set)}".</li>`).join('')}
</ul>
<p>Darüber hinaus wurde ein datengetriebener Ansatz mittels Brute-Force-Optimierung verwendet, um die optimale Kombination von T2w-Kriterien aus unserem eigenen Datensatz zu identifizieren, die die ${getAbbreviation(bfMetricName, lang)} maximiert. Diese Optimierung wurde für das Gesamtkollektiv, die Direkt-OP-Gruppe und die ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}-Gruppe separat durchgeführt. Die optimierten Kriterien für das Gesamtkollektiv waren: ${studyT2CriteriaManager.formatCriteriaForDisplay(bfCriteriaOverall, bfLogicOverall, false, lang)}.</p>
            `,
            en: `
<p>In addition to the Avocado Sign, established and data-driven T2-weighted (T2w) morphological criteria were evaluated for the assessment of ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('status', lang)}. The morphological criteria included: ${getAbbreviation('short_axis_diameter', lang)}, shape (round/oval), contour (sharp/irregular), homogeneity (homogeneous/heterogeneous), and signal intensity (hypointense/intermediate/hyperintense). The assessment of these criteria was also performed by the two radiologists mentioned above.</p>
<p>Three specific literature-based T2w criteria sets were reproduced in this study and applied to the corresponding patient cohort (upfront surgery or neoadjuvantly treated), and their performance was evaluated. A detailed overview of these criteria sets can be found in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.captionEn.split(':')[0]}. These include:</p>
<div id="methoden_literatur_kriterien_tabelle_container" class="table-container"></div>
<ul>
    ${literatureSets.map(set => `<li>${set.name} (${set.applicableKollektiv === 'Gesamt' ? 'Overall cohort' : (set.applicableKollektiv === 'direkt OP' ? 'Upfront Surgery' : 'nRCT')}): Defined as "${studyT2CriteriaManager.formatStudyCriteriaForDisplay(set, lang)}".</li>`).join('')}
</ul>
<p>Furthermore, a data-driven approach using brute-force optimization was employed to identify the optimal combination of T2w criteria from our own dataset that maximizes the ${getAbbreviation(bfMetricName, lang)}. This optimization was performed separately for the overall cohort, the upfront surgery group, and the ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} group. The optimized criteria for the overall cohort were: ${studyT2CriteriaManager.formatCriteriaForDisplay(bfCriteriaOverall, bfLogicOverall, false, lang)}.</p>
            `
        };
        return methodsText[lang] || methodsText.en;
    }

    function generateMethodsReferenceStandard(context) {
        const lang = context.currentLanguage;
        const methodsText = {
            de: `
<p>Der Referenzstandard für den ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('status', lang)} war die histopathologische Untersuchung der Resektionspräparate nach ${getAbbreviation('total_mesorectal_excision', lang)} (TME). Ein ${getAbbreviation('lymph_node', lang)} wurde als malignomverdächtig klassifiziert, wenn histopathologisch Tumorzellen nachgewiesen wurden (${getAbbreviation('n_status_positive', lang)}). Alle anderen ${getAbbreviation('lymph_node', lang)} wurden als benigne (${getAbbreviation('n_status_negative', lang)}) klassifiziert. Die histopathologische Untersuchung erfolgte durch einen erfahrenen Pathologen gemäß den aktuellen TNM-Klassifikationsrichtlinien.</p>
            `,
            en: `
<p>The reference standard for ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('status', lang)} was ${getAbbreviation('histopathology', lang)} examination of resection specimens after ${getAbbreviation('total_mesorectal_excision', lang)} (TME). A ${getAbbreviation('lymph_node', lang)} was classified as malignant if tumor cells were detected histopathologically (${getAbbreviation('n_status_positive', lang)}). All other ${getAbbreviation('lymph_node', lang)}s were classified as benign (${getAbbreviation('n_status_negative', lang)}). ${getAbbreviation('histopathology', lang)} examination was performed by an experienced pathologist according to current TNM classification guidelines.</p>
            `
        };
        return methodsText[lang] || methodsText.en;
    }

    function generateMethodsStatisticalAnalysis(context) {
        const lang = context.currentLanguage;
        const sigLevel = formatPubNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, 2, lang);
        const ciMethodProportion = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION;
        const ciMethodEffectSize = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE;
        const methodsText = {
            de: `
<p>Die deskriptive Statistik wurde zur Zusammenfassung der Patientencharakteristika verwendet und als ${getAbbreviation('median', lang)} (${getAbbreviation('min', lang)}–${getAbbreviation('max', lang)}) [${getAbbreviation('mean', lang)} ± ${getAbbreviation('sd', lang)}] für kontinuierliche Variablen und als absolute Zahlen mit ${getAbbreviation('percent', lang)} für kategoriale Variablen dargestellt. Die diagnostische Leistung des Avocado Signs und der T2w-Kriterien zur Prädiktion des histopathologischen ${getAbbreviation('n_status_positive', lang)} wurde anhand von ${getAbbreviation('sensitivity', lang)}, ${getAbbreviation('specificity', lang)}, ${getAbbreviation('positive_predictive_value', lang)} (${getAbbreviation('positive_predictive_value', lang)}), ${getAbbreviation('negative_predictive_value', lang)} (${getAbbreviation('negative_predictive_value', lang)}), ${getAbbreviation('accuracy', lang)}, ${getAbbreviation('balanced_accuracy', lang)} und ${getAbbreviation('f1_score', lang)} berechnet. Die ${getAbbreviation('auc', lang)} wurde ebenfalls berechnet, wobei für binäre Tests die ${getAbbreviation('auc', lang)} numerisch der ${getAbbreviation('balanced_accuracy', lang)} entspricht. ${getAbbreviation('ninety_five', lang)} ${getAbbreviation('percent', lang)} ${getAbbreviation('confidence_interval', lang)} (${getAbbreviation('confidence_interval', lang)}) für Proportionen wurden mittels ${ciMethodProportion}-Methode und für Effektgrößen mittels ${ciMethodEffectSize}-Bootstrap-Methode (N=${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} Resampling-Iterationen) berechnet. Statistische Vergleiche zwischen den diagnostischen Leistungen des Avocado Signs und der T2w-Kriterien (gepaarte Daten) wurden mittels ${getAbbreviation('mcnemar_test', lang)} (für ${getAbbreviation('accuracy', lang)}) und ${getAbbreviation('delong_test', lang)} (für ${getAbbreviation('auc', lang)}) durchgeführt. Assoziationen zwischen einzelnen morphologischen Kriterien und dem ${getAbbreviation('n_status_positive', lang)} wurden mittels ${getAbbreviation('fisher_exact_test', lang)} (für kategoriale Merkmale) und ${getAbbreviation('mann_whitney_u_test', lang)} (für den ${getAbbreviation('short_axis_diameter', lang)}) analysiert, wobei ${getAbbreviation('odds_ratio', lang)} (${getAbbreviation('odds_ratio', lang)}), ${getAbbreviation('risk_difference', lang)} (${getAbbreviation('risk_difference', lang)}) und der ${getAbbreviation('phi_coefficient', lang)} als Effektmaße berechnet wurden. Ein p-Wert von &lt;${sigLevel} galt als statistisch signifikant. Alle statistischen Analysen wurden mit einer proprietären Analysesoftware durchgeführt, die auf JavaScript und D3.js basiert (Version ${APP_CONFIG.APP_VERSION}).</p>
            `,
            en: `
<p>Descriptive statistics were used to summarize patient characteristics and were reported as ${getAbbreviation('median', lang)} (${getAbbreviation('min', lang)}–${getAbbreviation('max', lang)}) [${getAbbreviation('mean', lang)} ± ${getAbbreviation('sd', lang)}] for continuous variables and as absolute numbers with ${getAbbreviation('percent', lang)} for categorical variables. The diagnostic performance of the Avocado Sign and T2w criteria for predicting histopathological ${getAbbreviation('n_status_positive', lang)} was calculated using ${getAbbreviation('sensitivity', lang)}, ${getAbbreviation('specificity', lang)}, ${getAbbreviation('positive_predictive_value', lang)} (${getAbbreviation('positive_predictive_value', lang)}), ${getAbbreviation('negative_predictive_value', lang)} (${getAbbreviation('negative_predictive_value', lang)}), ${getAbbreviation('accuracy', lang)}, ${getAbbreviation('balanced_accuracy', lang)}, and ${getAbbreviation('f1_score', lang)}. The ${getAbbreviation('auc', lang)} was also calculated; for binary tests, the ${getAbbreviation('auc', lang)} numerically equals the ${getAbbreviation('balanced_accuracy', lang)}. ${getAbbreviation('ninety_five', lang)} ${getAbbreviation('percent', lang)} ${getAbbreviation('confidence_interval', lang)} (${getAbbreviation('confidence_interval', lang)}) for proportions were calculated using the ${ciMethodProportion} method, and for effect sizes using the ${ciMethodEffectSize} bootstrap method (N=${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} resampling iterations). Statistical comparisons between the diagnostic performances of the Avocado Sign and T2w criteria (paired data) were performed using ${getAbbreviation('mcnemar_test', lang)} (for ${getAbbreviation('accuracy', lang)}) and ${getAbbreviation('delong_test', lang)} (for ${getAbbreviation('auc', lang)}). Associations between individual morphological criteria and ${getAbbreviation('n_status_positive', lang)} were analyzed using ${getAbbreviation('fisher_exact_test', lang)} (for categorical features) and ${getAbbreviation('mann_whitney_u_test', lang)} (for ${getAbbreviation('short_axis_diameter', lang)}), with ${getAbbreviation('odds_ratio', lang)} (${getAbbreviation('odds_ratio', lang)}), ${getAbbreviation('risk_difference', lang)} (${getAbbreviation('risk_difference', lang)}), and ${getAbbreviation('phi_coefficient', lang)} calculated as measures of effect. A p-value of <${sigLevel} was considered statistically significant. All statistical analyses were performed using proprietary analysis software based on JavaScript and D3.js (version ${APP_CONFIG.APP_VERSION}).</p>
            `
        };
        return methodsText[lang] || methodsText.en;
    }

    function generateResultsPatientCharacteristics(context) {
        const lang = context.currentLanguage;
        const totalPatients = context.rawData.length;
        const totalPatientsDirektOP = context.allStats['direkt OP']?.anzahlPatienten ?? 0;
        const totalPatientsNRCT = context.allStats.nRCT?.anzahlPatienten ?? 0;

        const resultsText = {
            de: `
<p>Die Studiengruppe umfasste insgesamt ${totalPatients} Patienten mit histopathologisch gesichertem ${getAbbreviation('rectal_cancer', lang)}. ${totalPatientsDirektOP} Patienten (${formatPubNumber(totalPatientsDirektOP / totalPatients * 100, 1, lang, '', '%')}) wurden direkt operiert (${getAbbreviation('upfront_surgery', lang)}), während ${totalPatientsNRCT} Patienten (${formatPubNumber(totalPatientsNRCT / totalPatients * 100, 1, lang, '', '%')}) eine ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} (${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}) erhielten. Die demographischen Daten und klinischen Charakteristika der gesamten Kohorte sowie der Subgruppen sind in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.captionDe.split(':')[0]} zusammengefasst. Das mediane Alter im Gesamtkollektiv betrug ${formatPubNumber(context.allStats.Gesamt.alter.median, 0, lang)} Jahre (Interquartilsbereich, ${formatPubNumber(context.allStats.Gesamt.alter.q1, 0, lang)}-${formatPubNumber(context.allStats.Gesamt.alter.q3, 0, lang)}). Die Verteilung der Geschlechter und der Therapiegruppen ist ebenfalls in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.captionDe.split(':')[0]} dargestellt. Ein detailliertes Flussdiagramm zur Patientenkohorte ist in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.captionDe.split(':')[0]} dargestellt.</p>
<div id="results_patient_characteristics_table_container" class="table-container"></div>
<div id="results_age_distribution_chart_container" class="figure-container"></div>
<div id="results_gender_distribution_chart_container" class="figure-container"></div>
            `,
            en: `
<p>The study cohort comprised a total of ${totalPatients} patients with histopathologically confirmed ${getAbbreviation('rectal_cancer', lang)}. ${totalPatientsDirektOP} patients (${formatPubNumber(totalPatientsDirektOP / totalPatients * 100, 1, lang, '', '%')}) underwent ${getAbbreviation('upfront_surgery', lang)}, while ${totalPatientsNRCT} patients (${formatPubNumber(totalPatientsNRCT / totalPatients * 100, 1, lang, '', '%')}) received ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} (${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}). Demographic and clinical characteristics of the overall cohort and subgroups are summarized in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.captionEn.split(':')[0]}. The median age in the overall cohort was ${formatPubNumber(context.allStats.Gesamt.alter.median, 0, lang)} years (interquartile range, ${formatPubNumber(context.allStats.Gesamt.alter.q1, 0, lang)}-${formatPubNumber(context.allStats.Gesamt.alter.q3, 0, lang)}). The distribution of genders and therapy groups is also presented in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.captionEn.split(':')[0]}. A detailed patient cohort flowchart is presented in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.captionEn.split(':')[0]}.</p>
<div id="results_patient_characteristics_table_container" class="table-container"></div>
<div id="results_age_distribution_chart_container" class="figure-container"></div>
<div id="results_gender_distribution_chart_container" class="figure-container"></div>
            `
        };
        return resultsText[lang] || resultsText.en;
    }

    function generateResultsASPerformance(context) {
        const lang = context.currentLanguage;
        const totalPatients = context.allStats.Gesamt.anzahlPatienten;
        const asPerformanceOverall = context.allStats.Gesamt.gueteAS;
        const asPerformanceDirektOP = context.allStats['direkt OP']?.gueteAS;
        const asPerformanceNRCT = context.allStats.nRCT?.gueteAS;

        const resultsText = {
            de: `
<p>Die diagnostische Leistung des Avocado Signs (AS) zur Prädiktion des ${getAbbreviation('histopathology', lang)} ${getAbbreviation('n_status_positive', lang)} im ${getAbbreviation('overall', lang)} ${getAbbreviation('cohort', lang)} (N=${totalPatients}) sowie in den Subgruppen Direkt OP (N=${context.allStats['direkt OP']?.anzahlPatienten}) und ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} (N=${context.allStats.nRCT?.anzahlPatienten}) ist in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.captionDe.split(':')[0]} zusammengefasst. Im Gesamtkollektiv zeigte das AS eine ${getAbbreviation('sensitivity', lang)} von ${formatPubMetricValue(asPerformanceOverall.sens, 1, true, lang)}, eine ${getAbbreviation('specificity', lang)} von ${formatPubMetricValue(asPerformanceOverall.spez, 1, true, lang)}, und eine ${getAbbreviation('auc', lang)} von ${formatPubMetricValue(asPerformanceOverall.auc, 3, false, lang)}. Die Leistung des AS in der Direkt-OP-Gruppe war ${asPerformanceDirektOP?.auc?.value ? `eine ${getAbbreviation('auc', lang)} von ${formatPubMetricValue(asPerformanceDirektOP.auc, 3, false, lang)}` : 'nicht verfügbar'}. Für die ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}-Gruppe betrug die ${getAbbreviation('auc', lang)} ${asPerformanceNRCT?.auc?.value ? `${formatPubMetricValue(asPerformanceNRCT.auc, 3, false, lang)}` : 'nicht verfügbar'}.</p>
<div id="results_as_performance_table_container" class="table-container"></div>
            `,
            en: `
<p>The diagnostic performance of the Avocado Sign (AS) for predicting ${getAbbreviation('histopathology', lang)} ${getAbbreviation('n_status_positive', lang)} in the ${getAbbreviation('overall', lang)} ${getAbbreviation('cohort', lang)} (N=${totalPatients}) as well as in the upfront surgery (N=${context.allStats['direkt OP']?.anzahlPatienten}) and ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} (N=${context.allStats.nRCT?.anzahlPatienten}) subgroups is summarized in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.captionEn.split(':')[0]}. In the overall cohort, AS showed a ${getAbbreviation('sensitivity', lang)} of ${formatPubMetricValue(asPerformanceOverall.sens, 1, true, lang)}, a ${getAbbreviation('specificity', lang)} of ${formatPubMetricValue(asPerformanceOverall.spez, 1, true, lang)}, and an ${getAbbreviation('auc', lang)} of ${formatPubMetricValue(asPerformanceOverall.auc, 3, false, lang)}. The performance of AS in the upfront surgery group was ${asPerformanceDirektOP?.auc?.value ? `an ${getAbbreviation('auc', lang)} of ${formatPubMetricValue(asPerformanceDirektOP.auc, 3, false, lang)}` : 'not available'}. For the ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} group, the ${getAbbreviation('auc', lang)} was ${asPerformanceNRCT?.auc?.value ? `${formatPubMetricValue(asPerformanceNRCT.auc, 3, false, lang)}` : 'not available'}.</p>
<div id="results_as_performance_table_container" class="table-container"></div>
            `
        };
        return resultsText[lang] || resultsText.en;
    }

    function generateResultsLiteratureT2Performance(context) {
        const lang = context.currentLanguage;
        const resultsText = {
            de: `
<p>Die diagnostische Leistung der drei Literatur-basierten T2w-Kriteriensets ist in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.captionDe.split(':')[0]} dargestellt. Die Kriterien von Koh et al. (2008), angewendet auf das Gesamtkollektiv (N=${context.allStats.Gesamt.anzahlPatienten}), zeigten eine ${getAbbreviation('auc', lang)} von ${formatPubMetricValue(context.allStats.Gesamt.gueteT2_literatur.koh_2008_morphology?.auc, 3, false, lang)}. Das ESGAR-Kriterium nach Rutegård et al. (2025), angewendet auf die Direkt-OP-Gruppe (N=${context.allStats['direkt OP']?.anzahlPatienten}), erreichte eine ${getAbbreviation('auc', lang)} von ${formatPubMetricValue(context.allStats['direkt OP']?.gueteT2_literatur.rutegard_et_al_esgar?.auc, 3, false, lang)}. Für das Restaging nach ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} zeigte der Cut-off von Barbaro et al. (2024), angewendet auf die ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}-Gruppe (N=${context.allStats.nRCT?.anzahlPatienten}), eine ${getAbbreviation('auc', lang)} von ${formatPubMetricValue(context.allStats.nRCT?.gueteT2_literatur.barbaro_2024_restaging?.auc, 3, false, lang)}.</p>
<div id="results_literature_t2_performance_table_container" class="table-container"></div>
            `,
            en: `
<p>The diagnostic performance of the three literature-based T2w criteria sets is presented in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.captionEn.split(':')[0]}. The criteria by Koh et al. (2008), applied to the overall cohort (N=${context.allStats.Gesamt.anzahlPatienten}), showed an ${getAbbreviation('auc', lang)} of ${formatPubMetricValue(context.allStats.Gesamt.gueteT2_literatur.koh_2008_morphology?.auc, 3, false, lang)}. The ESGAR criterion by Rutegård et al. (2025), applied to the upfront surgery group (N=${context.allStats['direkt OP']?.anzahlPatienten}), achieved an ${getAbbreviation('auc', lang)} of ${formatPubMetricValue(context.allStats['direkt OP']?.gueteT2_literatur.rutegard_et_al_esgar?.auc, 3, false, lang)}. For restaging after ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}, the cut-off by Barbaro et al. (2024), applied to the ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} group (N=${context.allStats.nRCT?.anzahlPatienten}), showed an ${getAbbreviation('auc', lang)} of ${formatPubMetricValue(context.allStats.nRCT?.gueteT2_literatur.barbaro_2024_restaging?.auc, 3, false, lang)}.</p>
<div id="results_literature_t2_performance_table_container" class="table-container"></div>
            `
        };
        return resultsText[lang] || resultsText.en;
    }

    function generateResultsOptimizedT2Performance(context) {
        const lang = context.currentLanguage;
        const bfMetricName = context.currentBruteForceMetric;
        const bfMetricDisplayName = getAbbreviation(bfMetricName, lang);
        
        const bfResultOverall = context.bruteForceResults.Gesamt?.bestResult;
        const bfCriteriaOverall = bfResultOverall?.criteria;
        const bfLogicOverall = bfResultOverall?.logic;

        const bfResultDirektOP = context.bruteForceResults['direkt OP']?.bestResult;
        const bfCriteriaDirektOP = bfResultDirektOP?.criteria;
        const bfLogicDirektOP = bfResultDirektOP?.logic;

        const bfResultNRCT = context.bruteForceResults.nRCT?.bestResult;
        const bfCriteriaNRCT = bfResultNRCT?.criteria;
        const bfLogicNRCT = bfResultNRCT?.logic;

        const formatBFDetails = (criteria, logic, metricVal, kollektiv, digits = 3, isPercent = false) => {
            if (!criteria) return lang === 'de' ? 'keine optimierten Kriterien gefunden' : 'no optimized criteria found';
            const formattedMetricVal = formatPubMetricValue({value: metricVal}, digits, isPercent, lang);
            return ` (Logic: ${logic}, ${bfMetricDisplayName}: ${formattedMetricVal})` +
                   (lang === 'de' ? '<br>Kriterien: ' : '<br>Criteria: ') +
                   studyT2CriteriaManager.formatCriteriaForDisplay(criteria, logic, false, lang);
        };


        const resultsText = {
            de: `
<p>Die Brute-Force-Optimierung wurde durchgeführt, um die T2w-Kriterienkombinationen zu identifizieren, die die ${bfMetricDisplayName} für jedes Kollektiv maximieren. Die Ergebnisse sind in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.captionDe.split(':')[0]} zusammengefasst. Für das Gesamtkollektiv (N=${context.allStats.Gesamt.anzahlPatienten}) erzielte die optimierte Kriterienkombination eine ${getAbbreviation('auc', lang)} von ${formatPubMetricValue(context.allStats.Gesamt.gueteT2_bruteforce?.auc, 3, false, lang)}. Die spezifische Kriterienkombination für das Gesamtkollektiv war: ${studyT2CriteriaManager.formatCriteriaForDisplay(bfCriteriaOverall, bfLogicOverall, false, lang)}.</p>
<p>In der Direkt-OP-Gruppe (N=${context.allStats['direkt OP']?.anzahlPatienten}) erreichte die optimierte T2-Kriterienkombination eine ${getAbbreviation('auc', lang)} von ${formatPubMetricValue(context.allStats['direkt OP']?.gueteT2_bruteforce?.auc, 3, false, lang)}${formatBFDetails(bfCriteriaDirektOP, bfLogicDirektOP, bfResultDirektOP?.metricValue, 'Direkt OP', 3, false)}. In der ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}-Gruppe (N=${context.allStats.nRCT?.anzahlPatienten}) betrug die ${getAbbreviation('auc', lang)} der optimierten T2-Kriterien ${formatPubMetricValue(context.allStats.nRCT?.gueteT2_bruteforce?.auc, 3, false, lang)}${formatBFDetails(bfCriteriaNRCT, bfLogicNRCT, bfResultNRCT?.metricValue, 'nRCT', 3, false)}.</p>
<div id="results_optimized_t2_performance_table_container" class="table-container"></div>
            `,
            en: `
<p>Brute-force optimization was performed to identify the T2w criteria combinations that maximize ${bfMetricDisplayName} for each cohort. The results are summarized in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.captionEn.split(':')[0]}. For the overall cohort (N=${context.allStats.Gesamt.anzahlPatienten}), the optimized criteria combination achieved an ${getAbbreviation('auc', lang)} of ${formatPubMetricValue(context.allStats.Gesamt.gueteT2_bruteforce?.auc, 3, false, lang)}. The specific criteria combination for the overall cohort was: ${studyT2CriteriaManager.formatCriteriaForDisplay(bfCriteriaOverall, bfLogicOverall, false, lang)}.</p>
<p>In the upfront surgery group (N=${context.allStats['direkt OP']?.anzahlPatienten}), the optimized T2 criteria combination achieved an ${getAbbreviation('auc', lang)} of ${formatPubMetricValue(context.allStats['direkt OP']?.gueteT2_bruteforce?.auc, 3, false, lang)}${formatBFDetails(bfCriteriaDirektOP, bfLogicDirektOP, bfResultDirektOP?.metricValue, 'Direkt OP', 3, false)}. In the ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} group (N=${context.allStats.nRCT?.anzahlPatienten}), the ${getAbbreviation('auc', lang)} of the optimized T2 criteria was ${formatPubMetricValue(context.allStats.nRCT?.gueteT2_bruteforce?.auc, 3, false, lang)}${formatBFDetails(bfCriteriaNRCT, bfLogicNRCT, bfResultNRCT?.metricValue, 'nRCT', 3, false)}.</p>
<div id="results_optimized_t2_performance_table_container" class="table-container"></div>
            `
        };
        return resultsText[lang] || resultsText.en;
    }

    function generateResultsComparison(context) {
        const lang = context.currentLanguage;

        const compareMethods = (kollektivId, bfMetricValue) => {
            const overallStats = context.allStats[kollektivId];
            if (!overallStats) return null;

            const asPerformance = overallStats.gueteAS;
            const t2OptimizedPerformance = overallStats.gueteT2_bruteforce;
            const comparisonASvsT2Optimized = overallStats.vergleichASvsT2_bruteforce;

            if (!asPerformance || !t2OptimizedPerformance || !comparisonASvsT2Optimized) return null;

            const aucAS = asPerformance.auc?.value;
            const aucT2Optimized = t2OptimizedPerformance.auc?.value;
            const pValueDeLong = comparisonASvsT2Optimized.delong?.pValue;
            const pValueMcNemar = comparisonASvsT2Optimized.mcnemar?.pValue;

            return {
                kollektiv: kollektivId,
                aucAS: aucAS,
                aucT2Optimized: aucT2Optimized,
                pValueDeLong: pValueDeLong,
                pValueMcNemar: pValueMcNemar,
                diffAUC: (aucAS - aucT2Optimized)
            };
        };

        const overallComparison = compareMethods('Gesamt', context.bruteForceResults.Gesamt?.bestResult?.metricValue);
        const direktOPComparison = compareMethods('direkt OP', context.bruteForceResults['direkt OP']?.bestResult?.metricValue);
        const nRCTComparison = compareMethods('nRCT', context.bruteForceResults.nRCT?.bestResult?.metricValue);
        const bfMetricName = context.currentBruteForceMetric;

        const resultsText = {
            de: `
<p>Ein statistischer Vergleich der diagnostischen Leistung des Avocado Signs (AS) mit den Brute-Force-optimierten T2-Kriterien und den Literatur-basierten T2-Kriterien wurde durchgeführt und ist in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.captionDe.split(':')[0]} detailliert dargestellt. Für das Gesamtkollektiv zeigte das AS eine ${getAbbreviation('auc', lang)} von ${formatPubMetricValue(overallComparison?.aucAS, 3, false, lang)}, während die optimierten T2-Kriterien eine ${getAbbreviation('auc', lang)} von ${formatPubMetricValue(overallComparison?.aucT2Optimized, 3, false, lang)} erreichten. Der DeLong-Test für den Vergleich der AUCs ergab einen p-Wert von ${formatPubPValue(overallComparison?.pValueDeLong, lang)} zwischen AS und den optimierten T2-Kriterien im Gesamtkollektiv. Der McNemar-Test für die Genauigkeit zeigte einen p-Wert von ${formatPubPValue(overallComparison?.pValueMcNemar, lang)}.</p>
<p>Ähnliche Vergleiche wurden für die Subgruppen durchgeführt. In der Direkt-OP-Gruppe war die ${getAbbreviation('auc', lang)} für AS ${formatPubMetricValue(direktOPComparison?.aucAS, 3, false, lang)} und für die optimierten T2-Kriterien ${formatPubMetricValue(direktOPComparison?.aucT2Optimized, 3, false, lang)}. Der p-Wert des DeLong-Tests betrug ${formatPubPValue(direktOPComparison?.pValueDeLong, lang)}. In der ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}-Gruppe betrug die ${getAbbreviation('auc', lang)} für AS ${formatPubMetricValue(nRCTComparison?.aucAS, 3, false, lang)} und für die optimierten T2-Kriterien ${formatPubMetricValue(nRCTComparison?.aucT2Optimized, 3, false, lang)}. Der p-Wert des DeLong-Tests betrug hier ${formatPubPValue(nRCTComparison?.pValueDeLong, lang)}.</p>
<p>Visuelle Vergleiche der diagnostischen Metriken sind in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.captionDe.split(':')[0]}, ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartdirektOP.captionDe.split(':')[0]} und ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartnRCT.captionDe.split(':')[0]} dargestellt.</p>
<div id="results_comparison_as_t2_table_container" class="table-container"></div>
<div id="results_comparison_chart_gesamt_container" class="figure-container"></div>
<div id="results_comparison_chart_direkt_op_container" class="figure-container"></div>
<div id="results_comparison_chart_nrct_container" class="figure-container"></div>
            `,
            en: `
<p>A statistical comparison of the diagnostic performance of the Avocado Sign (AS) with brute-force optimized T2 criteria and literature-based T2 criteria was performed and is detailed in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.captionEn.split(':')[0]}. For the overall cohort, AS showed an ${getAbbreviation('auc', lang)} of ${formatPubMetricValue(overallComparison?.aucAS, 3, false, lang)}, while optimized T2 criteria achieved an ${getAbbreviation('auc', lang)} of ${formatPubMetricValue(overallComparison?.aucT2Optimized, 3, false, lang)}. DeLong's test for AUC comparison yielded a p-value of ${formatPubPValue(overallComparison?.pValueDeLong, lang)} between AS and optimized T2 criteria in the overall cohort. McNemar's test for accuracy showed a p-value of ${formatPubPValue(overallComparison?.pValueMcNemar, lang)}.</p>
<p>Similar comparisons were performed for the subgroups. In the upfront surgery group, the ${getAbbreviation('auc', lang)} for AS was ${formatPubMetricValue(direktOPComparison?.aucAS, 3, false, lang)} and for optimized T2 criteria ${formatPubMetricValue(direktOPComparison?.aucT2Optimized, 3, false, lang)}. The p-value from DeLong's test was ${formatPubPValue(direktOPComparison?.pValueDeLong, lang)}. In the ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} group, the ${getAbbreviation('auc', lang)} for AS was ${formatPubMetricValue(nRCTComparison?.aucAS, 3, false, lang)} and for optimized T2 criteria ${formatPubMetricValue(nRCTComparison?.aucT2Optimized, 3, false, lang)}. The p-value from DeLong's test here was ${formatPubPValue(nRCTComparison?.pValueDeLong, lang)}.</p>
<p>Visual comparisons of diagnostic metrics are presented in ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.captionEn.split(':')[0]}, ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartdirektOP.captionEn.split(':')[0]} and ${APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartnRCT.captionEn.split(':')[0]}.</p>
<div id="results_comparison_as_t2_table_container" class="table-container"></div>
<div id="results_comparison_chart_gesamt_container" class="figure-container"></div>
<div id="results_comparison_chart_direkt_op_container" class="figure-container"></div>
<div id="results_comparison_chart_nrct_container" class="figure-container"></div>
            `
        };
        return resultsText[lang] || resultsText.en;
    }

    function generateDiscussion(context) {
        const lang = context.currentLanguage;
        const asPerformanceOverall = context.allStats.Gesamt.gueteAS;
        const totalPatients = context.rawData.length;
        const nRCTPatients = context.allStats.Gesamt.therapie.nRCT;
        const direktOPPatients = context.allStats.Gesamt.therapie['direkt OP'];

        const discussionText = {
            de: `
<p>In dieser Studie haben wir die diagnostische Leistung des neuartigen Avocado Signs (AS) im Vergleich zu etablierten und datengetriebenen T2-gewichteten morphologischen Kriterien für das ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('staging', lang)} beim ${getAbbreviation('rectal_cancer', lang)} untersucht. Unsere Ergebnisse zeigen, dass das AS ein vielversprechender ${getAbbreviation('mri', lang)}-basierter ${getAbbreviation('biomarker', lang)} ist, der eine hohe ${getAbbreviation('accuracy', lang)} (${formatPubMetricValue(asPerformanceOverall.acc, 1, true, lang)}) und ${getAbbreviation('auc', lang)} (${formatPubMetricValue(asPerformanceOverall.auc, 3, false, lang)}) für die Prädiktion des ${getAbbreviation('n_status_positive', lang)} aufweist.</p>
<p>Die Bedeutung einer präzisen präoperativen ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('staging', lang)} kann nicht hoch genug eingeschätzt werden. Sie leitet die Entscheidung, ob eine ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} (${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}) erforderlich ist oder eine ${getAbbreviation('upfront_surgery', lang)} ausreichend ist. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.TAYLOR_QUIRKE_2011}, ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.GARCIA_AGUILAR_2022}, ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.SCHRAG_SHI_2023} Traditionelle morphologische Kriterien sind oft unzureichend, insbesondere bei kleinen ${getAbbreviation('lymph_node', lang)} oder nach ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}, wo Fibrose und Nekrose die Beurteilung erschweren können. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.ZHUANG_ZHANG_2021} Das AS bietet hier eine potenzielle Verbesserung, da es nicht nur auf Größe oder einfacher Morphologie basiert, sondern eine spezifische Kombination von Merkmalen berücksichtigt, die die Präsenz von Tumorzellen besser widerspiegeln könnte.</p>
<p>Im Vergleich zu den etablierten Kriterien von Koh et al. (2008), die auf irreguläre Kontur oder heterogenes Signal abstellen, zeigte das AS eine ähnliche oder überlegene Leistung. Dies ist besonders relevant, da die Kriterien von Koh et al. weithin zitiert werden, aber eine breite Anwendbarkeit im klinischen Alltag oft fehlt. Die ESGAR-Kriterien (Rutegård et al. 2025), die eine komplexere Logik basierend auf Größe und Anzahl morphologischer Merkmale verwenden, zeigten ebenfalls eine vergleichbare Leistung zum AS in den entsprechenden Subgruppen. Für das Restaging nach ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} ist die Herausforderung besonders groß, und der ${getAbbreviation('short_axis_diameter', lang)}-Cut-off von Barbaro et al. (2024) von 2.2 mm (angepasst auf 2.3 mm in dieser Studie) ist ein wichtiger Beitrag. Das AS zeigt auch in diesem Kontext vielversprechende Ergebnisse.</p>
<p>Unsere datengetriebene Brute-Force-Optimierung der T2w-Kriterien lieferte die bestmöglichen Kriterienkombinationen für unsere spezifische Kohorte. Dies unterstreicht die Heterogenität der optimalen Kriterien je nach Patientengruppe (primär operiert vs. ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}). Es ist jedoch wichtig zu beachten, dass diese optimierten Kriterien, obwohl sie statistisch die maximale Leistung in unserem Datensatz erreichten, möglicherweise in externen Kohorten nicht die gleiche Leistung erbringen. Das AS hingegen ist ein fest definiertes Zeichen, das potenziell eine höhere Reproduzierbarkeit und Übertragbarkeit auf andere Studien haben könnte.</p>
<p><strong>Limitationen:</strong> Diese Studie weist einige Limitationen auf. Erstens handelt es sich um eine retrospektive, monozentrische Studie mit einer begrenzten Stichprobengröße (N=${totalPatients}), was die Verallgemeinerbarkeit der Ergebnisse einschränken könnte. Zweitens erfolgte die Bildauswertung durch zwei Radiologen, was zwar die Interobserver-Variabilität im Rahmen dieser Studie reduziert, aber die Anwendbarkeit in größeren, multizentrischen Studien mit unterschiedlicher Radiologen-Erfahrung noch getestet werden müsste. Drittens wurde der histopathologische Referenzstandard der TME-Präparate verwendet, was bedeutet, dass nur die resezierten Lymphknoten beurteilt werden konnten. Nicht-reseziierte Lymphknoten oder Lymphknoten, die nicht in das Resektionsbett fielen, konnten nicht bewertet werden. Zukünftige Studien sollten prospektiv und multizentrisch mit größeren Kohorten durchgeführt werden, um die externe Validität des Avocado Signs weiter zu untersuchen und seinen Stellenwert in der klinischen Routine zu etablieren. Zudem könnten vergleichende Analysen mit anderen ${getAbbreviation('mri', lang)}-Sequenzen wie DWI oder ${getAbbreviation('contrast_enhanced', lang)} T1w weitere Erkenntnisse liefern.</p>
<p><strong>Fazit:</strong> Das Avocado Sign ist ein robuster und einfach anzuwendender ${getAbbreviation('mri', lang)}-basierter ${getAbbreviation('biomarker', lang)}, der für das ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('staging', lang)} beim ${getAbbreviation('rectal_cancer', lang)} eine vergleichbare oder überlegene diagnostische Leistung im Vergleich zu etablierten T2-Kriterien und datengetriebenen T2-Kriterien zeigte. Es hat das Potenzial, die Genauigkeit der präoperativen ${getAbbreviation('n_status_positive', lang)} ${getAbbreviation('staging', lang)} zu verbessern und könnte als wertvolle Ergänzung zu den derzeitigen Bildgebungsrichtlinien dienen.</p>
            `,
            en: `
<p>In this study, we investigated the diagnostic performance of the novel Avocado Sign (AS) compared to established and data-driven T2-weighted morphological criteria for ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('staging', lang)} in ${getAbbreviation('rectal_cancer', lang)}. Our results indicate that AS is a promising ${getAbbreviation('magnetic_resonance_imaging', lang)}-based ${getAbbreviation('biomarker', lang)}, demonstrating high ${getAbbreviation('accuracy', lang)} (${formatPubMetricValue(asPerformanceOverall.acc, 1, true, lang)}) and ${getAbbreviation('auc', lang)} (${formatPubMetricValue(asPerformanceOverall.auc, 3, false, lang)}) for predicting ${getAbbreviation('n_status_positive', lang)}.</p>
<p>The importance of accurate preoperative ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('staging', lang)} cannot be overstated. It guides the decision of whether ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)} (${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}) is required or if ${getAbbreviation('upfront_surgery', lang)} is sufficient. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.TAYLOR_QUIRKE_2011}, ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.GARCIA_AGUILAR_2022}, ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.SCHRAG_SHI_2023} Traditional morphological criteria are often insufficient, especially for small ${getAbbreviation('lymph_node', lang)}s or after ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}, where fibrosis and necrosis can complicate assessment. ${APP_CONFIG.REFERENCES_FOR_PUBLICATION.ZHUANG_ZHANG_2021} The AS offers a potential improvement here, as it is not solely based on size or simple morphology but considers a specific combination of features that might better reflect the presence of tumor cells.</p>
<p>Compared to the established criteria by Koh et al. (2008), which focus on irregular contour or heterogeneous signal, AS showed similar or superior performance. This is particularly relevant as Koh et al.'s criteria are widely cited, but broad applicability in clinical practice is often lacking. The ESGAR criteria (Rutegård et al. 2025), which use more complex logic based on size and number of morphological features, also showed comparable performance to AS in the respective subgroups. For restaging after ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}, the challenge is particularly significant, and Barbaro et al.'s (2024) ${getAbbreviation('short_axis_diameter', lang)} cut-off of 2.2 mm (adjusted to 2.3 mm in this study) is an important contribution. The AS also shows promising results in this context.</p>
<p>Our data-driven brute-force optimization of T2w criteria yielded the best possible criteria combinations for our specific cohort. This highlights the heterogeneity of optimal criteria depending on the patient group (upfront surgery vs. ${getAbbreviation('neoadjuvant_radiochemotherapy', lang)}). However, it is important to note that these optimized criteria, while achieving maximum statistical performance in our dataset, may not perform identically in external cohorts. The AS, on the other hand, is a fixed defined sign that could potentially have higher reproducibility and transferability to other studies.</p>
<p><strong>Limitations:</strong> This study has several limitations. First, it is a retrospective, single-center study with a limited sample size (N=${totalPatients}), which might limit the generalizability of the findings. Second, image evaluation was performed by two radiologists, which, while reducing interobserver variability within this study, would need to be tested for applicability in larger, multicenter studies with varying radiologist experience. Third, the histopathological reference standard of TME specimens was used, meaning only resected lymph nodes could be assessed. Non-resected lymph nodes or those not falling within the resection bed could not be evaluated. Future studies should be prospective and multicenter with larger cohorts to further investigate the external validity of the Avocado Sign and establish its role in clinical routine. Additionally, comparative analyses with other ${getAbbreviation('magnetic_resonance_imaging', lang)} sequences such as DWI or ${getAbbreviation('contrast_enhanced', lang)} T1w could provide further insights.</p>
<p><strong>Conclusion:</strong> The Avocado Sign is a robust and easily applicable ${getAbbreviation('magnetic_resonance_imaging', lang)}-based ${getAbbreviation('biomarker', lang)} that showed comparable or superior diagnostic performance for ${getAbbreviation('mesorectal', lang)} ${getAbbreviation('lymph_node', lang)} ${getAbbreviation('staging', lang)} in ${getAbbreviation('rectal_cancer', lang)} compared to established and data-driven T2 criteria. It has the potential to improve the accuracy of preoperative ${getAbbreviation('n_status_positive', lang)} ${getAbbreviation('staging', lang)} and could serve as a valuable adjunct to current imaging guidelines.</p>
            `
        };
        return discussionText[lang] || discussionText.en;
    }

    function generateReferences(context) {
        const lang = context.currentLanguage;
        let referencesHtml = `<p><strong>${lang === 'de' ? 'Referenzen' : 'References'}</strong></p><ol>`;
        const references = APP_CONFIG.REFERENCES_FOR_PUBLICATION;
        const sortedReferences = Object.keys(references).sort();

        sortedReferences.forEach(key => {
            // Filter out non-publication references or internal notes
            if (!key.startsWith('STUDY_PERIOD') && !key.startsWith('MRI_SYSTEM') &&
                !key.startsWith('CONTRAST_AGENT') && !key.startsWith('RADIOLOGIST_EXPERIENCE') &&
                !key.startsWith('ETHICS_VOTE_LEIPZIG')) {
                referencesHtml += `<li>${references[key]}</li>`;
            }
        });
        referencesHtml += `</ol>`;

        const refCount = sortedReferences.filter(key =>
            !key.startsWith('STUDY_PERIOD') && !key.startsWith('MRI_SYSTEM') &&
            !key.startsWith('CONTRAST_AGENT') && !key.startsWith('RADIOLOGIST_EXPERIENCE') &&
            !key.startsWith('ETHICS_VOTE_LEIPZIG')
        ).length;

        let wordCountWarning = '';
        if (refCount > APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.REFERENCE_LIMIT) {
             wordCountWarning = `<p class="alert alert-warning small"><i class="fas fa-exclamation-triangle me-1"></i> ${lang === 'de' ? 'Die Referenzliste überschreitet die empfohlene maximale Anzahl von' : 'Reference list exceeds recommended maximum of'} ${APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.REFERENCE_LIMIT} ${lang === 'de' ? 'Referenzen.' : 'references.'} (Aktuell: ${refCount} ${lang === 'de' ? 'Referenzen' : 'references'})</p>`;
        }

        return `<div class="publikation-section" id="references_main_section">${wordCountWarning}${referencesHtml}</div>`;
    }

    return Object.freeze({
        generateAbstract,
        generateIntroduction,
        generateMethodsStudyDesign,
        generateMethodsPatientCohort,
        generateMethodsMRIProtocol,
        generateMethodsAvocadoSign,
        generateMethodsT2Criteria,
        generateMethodsReferenceStandard,
        generateMethodsStatisticalAnalysis,
        generateResultsPatientCharacteristics,
        generateResultsASPerformance,
        generateResultsLiteratureT2Performance,
        generateResultsOptimizedT2Performance,
        generateResultsComparison,
        generateDiscussion,
        generateReferences
    });

})();
