const abstractGenerator = (() => {

    function _generateBackground(aggregatedData, lang) {
        const common = aggregatedData.common;
        if (lang === 'de') {
            return `<p><strong>Hintergrund:</strong> Die prätherapeutische N-Status-Bestimmung beim Rektumkarzinom ist entscheidend, Standard-MRT-Kriterien limitiert.</p>`;
        } else {
            return `<p><strong>Background:</strong> Pretherapeutic N-status determination in rectal cancer is crucial; standard MRI criteria are limited.</p>`;
        }
    }

    function _generatePurpose(aggregatedData, lang) {
        if (lang === 'de') {
            return `<p><strong>Ziel:</strong> Evaluation der diagnostischen Leistung des "Avocado Sign" (AS), eines kontrastmittelverstärkten MRT-Markers, im Vergleich zu optimierten T2-gewichteten (T2w) Kriterien zur Prädiktion des N-Status beim Rektumkarzinom.</p>`;
        } else {
            return `<p><strong>Purpose:</strong> To evaluate the diagnostic performance of the "Avocado Sign" (AS), a contrast-enhanced MRI marker, compared with optimized T2-weighted (T2w) criteria for predicting N-status in rectal cancer.</p>`;
        }
    }

    function _generateMaterialsAndMethods(aggregatedData, lang) {
        const common = aggregatedData.common;
        const studyPeriod = common.references?.STUDY_PERIOD_2020_2023 || (lang === 'de' ? "Januar 2020 und November 2023" : "January 2020 and November 2023");
        const ethicsVote = common.references?.ETHICS_VOTE_LEIPZIG || (lang === 'de' ? "Ethikkommission der Landesärztekammer Sachsen (Ethikvotum Nr. 2023-101)" : "Ethics Committee of the State Medical Association of Saxony (Ethics Vote No. 2023-101)");
        const statSoftware = `R Version 4.3.1 (R Foundation for Statistical Computing) und ${common.appName} ${common.appVersion}`;

        if (lang === 'de') {
            return `<p><strong>Material und Methoden:</strong> In dieser retrospektiven, von der Ethikkommission genehmigten Monozenterstudie (${ethicsVote}) wurden Daten von konsekutiv zwischen ${studyPeriod.replace(" and ", " und ")} eingeschlossenen Patienten mit histologisch gesichertem Rektumkarzinom analysiert. Zwei verblindete Radiologen evaluierten das AS (hypointenser Kern in hyperintensem Lymphknoten auf T1w-KM-Sequenzen) und morphologische T2w-Kriterien. Histopathologie diente als Referenzstandard. Sensitivität, Spezifität, Genauigkeit (ACC) und AUC wurden berechnet und AUCs mittels DeLong-Test verglichen. Die statistische Analyse erfolgte mit ${statSoftware}.</p>`;
        } else {
            return `<p><strong>Materials and Methods:</strong> This retrospective, ethics committee-approved, single-center study (${ethicsVote}) analyzed data from consecutive patients with histologically confirmed rectal cancer enrolled between ${studyPeriod}. Two blinded radiologists evaluated the AS (hypointense core within a hyperintense lymph node on T1w contrast-enhanced sequences) and morphological T2w criteria. Histopathology served as the reference standard. Sensitivity, specificity, accuracy (ACC), and AUC were calculated, and AUCs were compared using the DeLong test. Statistical analysis was performed using ${statSoftware}.</p>`;
        }
    }

    function _generateResults(aggregatedData, lang) {
        const common = aggregatedData.common;
        const statsGesamt = aggregatedData.allKollektivStats.Gesamt;
        const asGesamt = statsGesamt?.gueteAS;
        const bfGesamt = statsGesamt?.gueteT2_bruteforce; // Optimized for the targetBruteForceMetricKey
        const vergleichASvsBFGesamt = statsGesamt?.vergleichASvsT2_bruteforce;
        const demo = common.demographicsGesamt || {};
        const na = '--';

        const numPatients = radiologyFormatter.formatRadiologyNumber(demo.patientCount, 0);
        const meanAge = radiologyFormatter.formatRadiologyNumber(demo.meanAge, 0); // Radiology: mean age ± standard deviation (whole numbers only)
        const sdAge = radiologyFormatter.formatRadiologyNumber(demo.sdAge, 0);
        const numMen = radiologyFormatter.formatRadiologyNumber(demo.countMen, 0);
        const numWomen = radiologyFormatter.formatRadiologyNumber(demo.patientCount - demo.countMen, 0);
        const sexLargerGroup = demo.countMen >= (demo.patientCount - demo.countMen) ? `${numMen} ${lang === 'de' ? 'Männer' : 'men'}` : `${numWomen} ${lang === 'de' ? 'Frauen' : 'women'}`;
        const patientInfo = lang === 'de' ?
            `Es wurden ${numPatients} Patienten (mittleres Alter, ${meanAge} Jahre ± ${sdAge} [Standardabweichung]; ${sexLargerGroup}) ausgewertet.` :
            `${numPatients} patients (mean age, ${meanAge} years ± ${sdAge} [standard deviation]; ${sexLargerGroup}) were evaluated.`;

        let resultsText = `<p><strong>${lang === 'de' ? 'Ergebnisse' : 'Results'}:</strong> ${patientInfo} `;

        if (asGesamt?.sens?.value !== undefined && asGesamt?.spez?.value !== undefined && asGesamt?.acc?.value !== undefined && asGesamt?.auc?.value !== undefined) {
            const sensStr = radiologyFormatter.formatPercentageForRadiology(asGesamt.sens.n_success, asGesamt.sens.n_trials, 0);
            const spezStr = radiologyFormatter.formatPercentageForRadiology(asGesamt.spez.n_success, asGesamt.spez.n_trials, 0);
            const accStr = radiologyFormatter.formatPercentageForRadiology(asGesamt.acc.n_success, asGesamt.acc.n_trials, 0);
            const aucAS = radiologyFormatter.formatRadiologyCI(asGesamt.auc.value, asGesamt.auc.ci.lower, asGesamt.auc.ci.upper, 2, false);

            if (lang === 'de') {
                resultsText += `Das AS zeigte eine Sensitivität von ${sensStr}, Spezifität von ${spezStr}, Genauigkeit von ${accStr} und eine AUC von ${aucAS}. `;
            } else {
                resultsText += `The AS demonstrated a sensitivity of ${sensStr}, specificity of ${spezStr}, accuracy of ${accStr}, and an AUC of ${aucAS}. `;
            }
        } else {
            resultsText += lang === 'de' ? "AS Performancedaten unvollständig. " : "AS performance data incomplete. ";
        }

        if (bfGesamt?.auc?.value !== undefined && vergleichASvsBFGesamt?.delong?.pValue !== undefined) {
            const aucBF = radiologyFormatter.formatRadiologyCI(bfGesamt.auc.value, bfGesamt.auc.ci.lower, bfGesamt.auc.ci.upper, 2, false);
            const pDelong = radiologyFormatter.formatRadiologyPValue(vergleichASvsBFGesamt.delong.pValue);
             if (lang === 'de') {
                resultsText += `Für optimierte T2w-Kriterien betrug die AUC ${aucBF}. Der Unterschied der AUCs war ${pDelong}.</p>`;
            } else {
                resultsText += `For optimized T2w criteria, the AUC was ${aucBF}. The difference in AUCs was ${pDelong}.</p>`;
            }
        } else {
            resultsText += lang === 'de' ? "Vergleichsdaten zu T2 unvollständig.</p>" : "Comparison data for T2 incomplete.</p>";
        }
        return resultsText;
    }

    function _generateConclusion(aggregatedData, lang) {
        const statsGesamt = aggregatedData.allKollektivStats.Gesamt;
        const asGesamt = statsGesamt?.gueteAS;
        const bfGesamt = statsGesamt?.gueteT2_bruteforce;
        const vergleichASvsBFGesamt = statsGesamt?.vergleichASvsT2_bruteforce;
        let conclusionTextDe = "Das Avocado Sign ist ein vielversprechender MRT-Marker zur Prädiktion des Lymphknotenstatus beim Rektumkarzinom und zeigte eine hohe diagnostische Güte.";
        let conclusionTextEn = "The Avocado Sign is a promising MRI marker for predicting lymph node status in rectal cancer, demonstrating high diagnostic performance.";

        if (asGesamt?.auc?.value && bfGesamt?.auc?.value && vergleichASvsBFGesamt?.delong?.pValue !== undefined) {
            const pValue = vergleichASvsBFGesamt.delong.pValue;
            let comparisonDe = "vergleichbar mit";
            let comparisonEn = "comparable to";

            if (pValue < APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL) {
                if (asGesamt.auc.value > bfGesamt.auc.value) {
                    comparisonDe = "signifikant überlegen gegenüber";
                    comparisonEn = "significantly superior to";
                } else if (asGesamt.auc.value < bfGesamt.auc.value) {
                    comparisonDe = "signifikant unterlegen gegenüber";
                    comparisonEn = "significantly inferior to";
                }
            }
            conclusionTextDe = `Das Avocado Sign zeigte eine hohe diagnostische Güte für das N-Staging des Rektumkarzinoms, ${comparisonDe} optimierten T2-Kriterien.`;
            conclusionTextEn = `The Avocado Sign demonstrated high diagnostic performance for N-staging of rectal cancer, ${comparisonEn} optimized T2-weighted criteria.`;
        }


        if (lang === 'de') {
            return `<p><strong>Schlussfolgerung:</strong> ${conclusionTextDe}</p>`;
        } else {
            return `<p><strong>Conclusion:</strong> ${conclusionTextEn}</p>`;
        }
    }

    function generateAbstract(aggregatedData, lang = 'de') {
        if (!aggregatedData) {
            return lang === 'de' ? "<p>Abstract konnte nicht generiert werden: Daten fehlen.</p>" : "<p>Abstract could not be generated: data missing.</p>";
        }

        let html = _generateBackground(aggregatedData, lang);
        html += _generatePurpose(aggregatedData, lang);
        html += _generateMaterialsAndMethods(aggregatedData, lang);
        html += _generateResults(aggregatedData, lang);
        html += _generateConclusion(aggregatedData, lang);
        
        const abbreviations = APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.MANUSCRIPT_TYPE_ORIGINAL_RESEARCH.ABBREVIATION_LIST_MAX_COUNT > 0 ? 
            (lang === 'de' ? ` N-Status, Nodalstatus; MRT, Magnetresonanztomographie; AS, Avocado Sign; T2w, T2-gewichtet; ACC, Accuracy; AUC, Fläche unter der Kurve; KI, Konfidenzintervall; KM, Kontrastmittel.` : ` N-status, Nodal status; MRI, Magnetic Resonance Imaging; AS, Avocado Sign; T2w, T2-weighted; ACC, Accuracy; AUC, Area Under the Curve; CI, Confidence Interval; CE, Contrast-Enhanced.`)
            : "";
        if (abbreviations) {
             html += `<p class="small text-muted mt-2">${lang === 'de' ? 'Abkürzungen:' : 'Abbreviations:'}${abbreviations}</p>`;
        }

        return html;
    }

    return Object.freeze({
        generateAbstract
    });

})();
