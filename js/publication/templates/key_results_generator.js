const keyResultsGenerator = (() => {

    function generateKeyResults(aggregatedData, lang = 'de') {
        if (!aggregatedData || !aggregatedData.allKollektivStats || !aggregatedData.common) {
            const errorMsg = lang === 'de' ? "Key Results nicht verfügbar aufgrund fehlender Daten." : "Key Results not available due to missing data.";
            return [`<p class="text-danger">${errorMsg}</p>`];
        }

        const common = aggregatedData.common;
        const statsGesamt = aggregatedData.allKollektivStats.Gesamt;
        const statsDirektOP = aggregatedData.allKollektivStats['direkt OP'];
        const statsNRCT = aggregatedData.allKollektivStats.nRCT;

        const asGesamt = statsGesamt?.gueteAS;
        const bfGesamt = statsGesamt?.gueteT2_bruteforce; // Using the one optimized for the targetBruteForceMetricKey
        const vergleichASvsBFGesamt = statsGesamt?.vergleichASvsT2_bruteforce;

        const asDirektOP = statsDirektOP?.gueteAS;
        const asNRCT = statsNRCT?.gueteAS;

        const keyResults = [];
        const na = '--';

        // Key Result 1: AS Performance Overall
        if (common?.nGesamt && asGesamt?.sens?.value !== undefined && asGesamt?.spez?.value !== undefined) {
            const nPat = radiologyFormatter.formatRadiologyNumber(common.nGesamt, 0);
            const sensASVal = asGesamt.sens.value;
            const spezASVal = asGesamt.spez.value;
            const sensASStr = radiologyFormatter.formatRadiologyNumber(sensASVal * 100, 0) + "%";
            const spezASStr = radiologyFormatter.formatRadiologyNumber(spezASVal * 100, 0) + "%";

            if (lang === 'de') {
                keyResults.push(`In dieser retrospektiven Studie mit ${nPat} Patienten mit Rektumkarzinom zeigte das Avocado Sign (AS) im MRT eine Sensitivität von ${sensASStr} und eine Spezifität von ${spezASStr} zur Prädiktion von Lymphknotenmetastasen.`);
            } else {
                keyResults.push(`In this retrospective study of ${nPat} patients with rectal cancer, the Avocado Sign (AS) on MRI demonstrated a sensitivity of ${sensASStr} and a specificity of ${spezASStr} for predicting lymph node metastasis.`);
            }
        } else {
            if (lang === 'de') { keyResults.push("Die Gesamtperformance des Avocado Signs konnte nicht vollständig ermittelt werden.");}
            else { keyResults.push("Overall Avocado Sign performance could not be fully determined.");}
        }

        // Key Result 2: AS AUC vs Optimized T2 AUC
        if (asGesamt?.auc?.value !== undefined && bfGesamt?.auc?.value !== undefined && vergleichASvsBFGesamt?.delong?.pValue !== undefined) {
            const aucAS = radiologyFormatter.formatRadiologyNumber(asGesamt.auc.value, 2, true); // removeLeadingZero = true for .XX format
            const aucBF = radiologyFormatter.formatRadiologyNumber(bfGesamt.auc.value, 2, true);
            const pDelong = radiologyFormatter.formatRadiologyPValue(vergleichASvsBFGesamt.delong.pValue);

            if (lang === 'de') {
                keyResults.push(`Die Fläche unter der Kurve (AUC) für AS betrug ${aucAS}, für optimierte T2-Kriterien ${aucBF} (${pDelong}).`);
            } else {
                keyResults.push(`The area under the curve (AUC) for AS was ${aucAS}, while for optimized T2-weighted criteria it was ${aucBF} (${pDelong}).`);
            }
        } else {
             if (lang === 'de') { keyResults.push("Der AUC-Vergleich zwischen Avocado Sign und optimierten T2-Kriterien konnte nicht vollständig ermittelt werden.");}
             else { keyResults.push("AUC comparison between Avocado Sign and optimized T2 criteria could not be fully determined.");}
        }

        // Key Result 3: AS Performance in Subgroups
        if (asDirektOP?.auc?.value !== undefined && asNRCT?.auc?.value !== undefined) {
            const aucASDirektOP = radiologyFormatter.formatRadiologyNumber(asDirektOP.auc.value, 2, true);
            const aucASnRCT = radiologyFormatter.formatRadiologyNumber(asNRCT.auc.value, 2, true);

            if (lang === 'de') {
                keyResults.push(`Die AUC des Avocado Signs betrug ${aucASDirektOP} bei primär operierten Patienten und ${aucASnRCT} nach neoadjuvanter Radiochemotherapie.`);
            } else {
                keyResults.push(`The Avocado Sign AUC was ${aucASDirektOP} in patients undergoing upfront surgery and ${aucASnRCT} after neoadjuvant chemoradiotherapy.`);
            }
        } else {
            if (lang === 'de') { keyResults.push("Die Performance des Avocado Signs in den Subgruppen konnte nicht vollständig ermittelt werden.");}
            else { keyResults.push("Avocado Sign performance in subgroups could not be fully determined.");}
        }
        
        // Ensure max 3 key results
        return keyResults.slice(0, APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.MANUSCRIPT_TYPE_ORIGINAL_RESEARCH.KEY_RESULTS_MAX_POINTS);
    }

    return Object.freeze({
        generateKeyResults
    });

})();
