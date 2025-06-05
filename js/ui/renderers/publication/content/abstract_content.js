const abstractContent = (() => {

    function getAbstractText(lang, allKollektivStats, commonData) {
        const gesamtStats = allKollektivStats?.Gesamt;
        const asGesamt = gesamtStats?.gueteAS;
        const bfGesamtStats = gesamtStats?.gueteT2_bruteforce;
        const vergleichASvsBFGesamt = gesamtStats?.vergleichASvsT2_bruteforce;
        
        const nGesamt = commonData.nGesamt || 0;
        const medianAge = gesamtStats?.deskriptiv?.alter?.median !== undefined ? formatNumber(gesamtStats.deskriptiv.alter.median, 0, 'N/A', true) : 'N/A';
        const iqrAgeLower = gesamtStats?.deskriptiv?.alter?.q1 !== undefined ? formatNumber(gesamtStats.deskriptiv.alter.q1, 0, 'N/A', true) : 'N/A';
        const iqrAgeUpper = gesamtStats?.deskriptiv?.alter?.q3 !== undefined ? formatNumber(gesamtStats.deskriptiv.alter.q3, 0, 'N/A', true) : 'N/A';
        
        const ageText = (medianAge !== 'N/A' && iqrAgeLower !== 'N/A' && iqrAgeUpper !== 'N/A') ? 
                             (lang === 'de' ? `${medianAge} Jahre (IQR: ${iqrAgeLower}–${iqrAgeUpper} Jahre)` : `${medianAge} years (IQR: ${iqrAgeLower}–${iqrAgeUpper} years)`)
                             : (lang === 'de' ? 'nicht verfügbar' : 'not available');
        
        const anzahlMaenner = gesamtStats?.deskriptiv?.geschlecht?.m || 0;
        const anzahlFrauen = gesamtStats?.deskriptiv?.geschlecht?.f || 0;
        const sexText = lang === 'de' ? `${anzahlMaenner} Männer, ${anzahlFrauen} Frauen` : `${anzahlMaenner} men, ${anzahlFrauen} women`;

        const studyPeriod = commonData.references?.STUDY_PERIOD_2020_2023 || (lang === 'de' ? "Januar 2020 und November 2023" : "January 2020 and November 2023");
        const asRef = APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025;

        // AS Metrics
        const sensAS = asGesamt?.sens?.value !== undefined ? formatPercent(asGesamt.sens.value, 1, 'N/A').replace('%','') : 'N/A';
        const spezAS = asGesamt?.spez?.value !== undefined ? formatPercent(asGesamt.spez.value, 1, 'N/A').replace('%','') : 'N/A';
        const accAS = asGesamt?.acc?.value !== undefined ? formatPercent(asGesamt.acc.value, 1, 'N/A').replace('%','') : 'N/A';
        const aucAS = asGesamt?.auc?.value !== undefined ? formatNumber(asGesamt.auc.value, 2, 'N/A', true) : 'N/A';

        const sensASCI = asGesamt?.sens?.ci ? `${formatPercent(asGesamt.sens.ci.lower,1).replace('%','')}–${formatPercent(asGesamt.sens.ci.upper,1).replace('%','')}` : 'N/A';
        const spezASCI = asGesamt?.spez?.ci ? `${formatPercent(asGesamt.spez.ci.lower,1).replace('%','')}–${formatPercent(asGesamt.spez.ci.upper,1).replace('%','')}` : 'N/A';
        const accASCI = asGesamt?.acc?.ci ? `${formatPercent(asGesamt.acc.ci.lower,1).replace('%','')}–${formatPercent(asGesamt.acc.ci.upper,1).replace('%','')}` : 'N/A';
        const aucASCI = asGesamt?.auc?.ci ? `${formatNumber(asGesamt.auc.ci.lower,2,undefined,true)}–${formatNumber(asGesamt.auc.ci.upper,2,undefined,true)}` : 'N/A';

        // Optimized T2 Metrics
        const aucBFOptimized = bfGesamtStats?.auc?.value !== undefined ? formatNumber(bfGesamtStats.auc.value, 2, 'N/A', true) : 'N/A';
        const pValueComparison = vergleichASvsBFGesamt?.delong?.pValue !== undefined ? getPValueText(vergleichASvsBFGesamt.delong.pValue).replace('p=','') : 'N/A';

        const abstractDe = `
            <p><strong>Hintergrund:</strong> Eine genaue prätherapeutische Bestimmung des mesorektalen Lymphknotenstatus (N-Status) ist entscheidend für die Therapieentscheidung beim Rektumkarzinom.</p>
            <p><strong>Ziel:</strong> Evaluation der diagnostischen Leistung des "Avocado Sign" (AS), eines neuartigen kontrastmittelverstärkten (KM) MRT-Markers, im Vergleich zu Literatur-basierten und für die Studienkohorte optimierten T2-gewichteten (T2w) Kriterien zur Prädiktion des N-Status.</p>
            <p><strong>Material und Methoden:</strong> Diese retrospektive Studie umfasste ${formatNumber(nGesamt,0,true)} Patienten mit histologisch gesichertem Rektumkarzinom, die zwischen ${studyPeriod.replace(" and ", " und ")} eingeschlossen wurden. Das AS (hypointenser Kern in hyperintensem Lymphknoten auf T1w-KM-Sequenzen) und morphologische T2w-Kriterien wurden beurteilt. Die Histopathologie diente als Referenzstandard. Sensitivität, Spezifität, Genauigkeit (Accuracy) und die Fläche unter der Receiver-Operating-Characteristic-Kurve (AUC) wurden mit 95%-Konfidenzintervallen berechnet und die AUC-Werte mittels DeLong-Test verglichen.</p>
            <p><strong>Ergebnisse:</strong> ${formatNumber(nGesamt,0,true)} Patienten (medianes Alter, ${ageText}; ${sexText}) wurden analysiert. Das AS zeigte eine Sensitivität von ${sensAS}% (95% CI: ${sensASCI}%), eine Spezifität von ${spezAS}% (95% CI: ${spezASCI}%), eine Accuracy von ${accAS}% (95% CI: ${accASCI}%), und eine AUC von ${aucAS} (95% CI: ${aucASCI}). Für die optimierten T2w-Kriterien betrug die AUC ${aucBFOptimized}. Der Unterschied der AUC zwischen AS und optimierten T2w-Kriterien war p=${pValueComparison}.</p>
            <p><strong>Fazit:</strong> Das Avocado Sign ist ein vielversprechender MRT-Marker zur Prädiktion des Lymphknotenstatus beim Rektumkarzinom mit hoher diagnostischer Güte, vergleichbar mit kohortenspezifisch optimierten T2w-Kriterien, und besitzt das Potenzial, das präoperative Staging zu verbessern.</p>
            <p class="small text-muted mt-2">Abkürzungen: ACC = Accuracy, AS = Avocado Sign, AUC = Area Under the Curve, CI = Konfidenzintervall, IQR = Interquartilsabstand, KM = Kontrastmittel, MRT = Magnetresonanztomographie, N-Status = Nodalstatus, T1w = T1-gewichtet, T2w = T2-gewichtet.</p>
        `;
         const abstractEn = `
            <p><strong>Background:</strong> Accurate pretherapeutic determination of mesorectal lymph node status (N-status) is crucial for treatment decisions in rectal cancer.</p>
            <p><strong>Purpose:</strong> To evaluate the diagnostic performance of the "Avocado Sign" (AS), a novel contrast-enhanced (CE) MRI marker, compared to literature-based and cohort-optimized T2-weighted (T2w) criteria for predicting N-status.</p>
            <p><strong>Materials and Methods:</strong> This retrospective study included ${formatNumber(nGesamt,0,true)} patients with histologically confirmed rectal cancer enrolled between ${studyPeriod}. Two blinded radiologists evaluated the AS (hypointense core within a hyperintense lymph node on T1w CE sequences) and morphological T2w criteria. Histopathological examination of surgical specimens served as the reference standard. Sensitivity, specificity, accuracy (ACC), and area under the receiver operating characteristic curve (AUC), with 95% confidence intervals (CIs), were calculated, and AUCs were compared using the DeLong test.</p>
            <p><strong>Results:</strong> A total of ${formatNumber(nGesamt,0,true)} patients (median age, ${ageText}; ${sexText}) were analyzed. The AS showed a sensitivity of ${sensAS}% (95% CI: ${sensASCI}%), specificity of ${spezAS}% (95% CI: ${spezASCI}%), ACC of ${accAS}% (95% CI: ${accASCI}%), and AUC of ${aucAS} (95% CI: ${aucASCI}). For optimized T2w criteria, the AUC was ${aucBFOptimized}. The difference in AUC between AS and optimized T2w criteria was p=${pValueComparison}.</p>
            <p><strong>Conclusion:</strong> The Avocado Sign is a promising MRI marker for predicting lymph node status in rectal cancer, demonstrating high diagnostic performance comparable to cohort-optimized T2w criteria, with potential to improve preoperative staging.</p>
             <p class="small text-muted mt-2">Abbreviations: ACC = Accuracy, AS = Avocado Sign, AUC = Area Under the Curve, CE = Contrast-Enhanced, CI = Confidence Interval, IQR = Interquartile Range, MRI = Magnetic Resonance Imaging, N-status = Nodal status, T1w = T1-weighted, T2w = T2-weighted.</p>
        `;
        return lang === 'de' ? abstractDe : abstractEn;
    }

    function getKeyResultsText(lang, allKollektivStats, commonData) {
        const gesamtStats = allKollektivStats?.Gesamt;
        const asGesamt = gesamtStats?.gueteAS;
        const bfGesamtStats = gesamtStats?.gueteT2_bruteforce;
        const vergleichASvsBFGesamt = gesamtStats?.vergleichASvsT2_bruteforce;
        
        const nGesamt = commonData.nGesamt || 0;
        const pValueComparison = vergleichASvsBFGesamt?.delong?.pValue !== undefined ? getPValueText(vergleichASvsBFGesamt.delong.pValue).replace('p=','') : 'N/A';

        let vergleichPerformanceTextDe = "eine vergleichbare";
        let vergleichPerformanceTextEn = "comparable";
        if (vergleichASvsBFGesamt?.delong?.pValue !== undefined && asGesamt?.auc?.value !== undefined && bfGesamtStats?.auc?.value !== undefined) {
            if (vergleichASvsBFGesamt.delong.pValue < (commonData.significanceLevel || 0.05)) {
                if (asGesamt.auc.value > bfGesamtStats.auc.value) {
                    vergleichPerformanceTextDe = "eine überlegene";
                    vergleichPerformanceTextEn = "superior";
                } else if (asGesamt.auc.value < bfGesamtStats.auc.value) {
                    vergleichPerformanceTextDe = "eine unterlegene";
                    vergleichPerformanceTextEn = "inferior";
                }
            }
        }

        const sensAS = asGesamt?.sens?.value !== undefined ? formatPercent(asGesamt.sens.value, 1, 'N/A').replace('%','') : 'N/A';
        const spezAS = asGesamt?.spez?.value !== undefined ? formatPercent(asGesamt.spez.value, 1, 'N/A').replace('%','') : 'N/A';
        const aucAS = asGesamt?.auc?.value !== undefined ? formatNumber(asGesamt.auc.value, 2, 'N/A', true) : 'N/A';
        const aucBFOptimized = bfGesamtStats?.auc?.value !== undefined ? formatNumber(bfGesamtStats.auc.value, 2, 'N/A', true) : 'N/A';

        const keyResultsDe = `
            <li>In dieser retrospektiven Studie mit ${formatNumber(nGesamt,0,true)} Patienten mit Rektumkarzinom zeigte das Avocado Sign (AS) eine Sensitivität von ${sensAS}% und eine Spezifität von ${spezAS}% zur Prädiktion des Lymphknotenbefalls.</li>
            <li>Die AUC für das AS betrug ${aucAS}, während für die kohortenspezifisch optimierten T2w-Kriterien eine AUC von ${aucBFOptimized} erreicht wurde.</li>
            <li>Der Unterschied in der AUC zwischen dem AS und den optimierten T2w-Kriterien war p=${pValueComparison}, was auf eine ${vergleichPerformanceTextDe} Leistung des AS hindeutet.</li>
        `;
         const keyResultsEn = `
            <li>In this retrospective study of ${formatNumber(nGesamt,0,true)} patients with rectal cancer, the Avocado Sign (AS) demonstrated a sensitivity of ${sensAS}% and a specificity of ${spezAS}% for predicting lymph node involvement.</li>
            <li>The AUC for AS was ${aucAS}, while an AUC of ${aucBFOptimized} was achieved for cohort-specifically optimized T2w criteria.</li>
            <li>The difference in AUC between AS and optimized T2w criteria was p=${pValueComparison}, indicating ${vergleichPerformanceTextEn} performance of AS.</li>
        `;

        return `
            <h2 id="key-results-title">${lang === 'de' ? 'Key Results' : 'Key Results'}</h2>
            <ul class="key-results-list">${lang === 'de' ? keyResultsDe : keyResultsEn}</ul>
        `;
    }

    return Object.freeze({
        getAbstractText,
        getKeyResultsText
    });

})();
