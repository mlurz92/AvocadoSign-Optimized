const summaryStatementGenerator = (() => {

    function generateSummaryStatement(aggregatedData, lang = 'de') {
        if (!aggregatedData || !aggregatedData.allKollektivStats || !aggregatedData.common) {
            return lang === 'de' ? "Zusammenfassende Aussage nicht verfügbar aufgrund fehlender Daten." : "Summary statement not available due to missing data.";
        }

        const statsGesamt = aggregatedData.allKollektivStats.Gesamt;
        const asGesamt = statsGesamt?.gueteAS;
        const bfGesamt = statsGesamt?.gueteT2_bruteforce;
        const vergleichASvsBF = statsGesamt?.vergleichASvsT2_bruteforce;

        let statementDe = "Das Avocado Sign zeigte eine hohe diagnostische Genauigkeit für das N-Staging beim Rektumkarzinom, vergleichbar mit optimierten T2-Kriterien.";
        let statementEn = "The Avocado Sign demonstrated high diagnostic accuracy for N-staging in rectal cancer, comparable to optimized T2-weighted criteria.";

        // Attempt to make it more specific based on data, while staying within 30 words.
        // This is a high-level summary.
        // Example: If AS AUC is notably high and comparison is central.

        if (asGesamt?.auc?.value && bfGesamt?.auc?.value) {
            const aucAS = radiologyFormatter.formatRadiologyNumber(asGesamt.auc.value, 2);
            const aucBF = radiologyFormatter.formatRadiologyNumber(bfGesamt.auc.value, 2);
            let pValueVergleich = "";
            if (vergleichASvsBF?.delong?.pValue !== undefined && vergleichASvsBF?.delong?.pValue !== null) {
                // Get simplified P for brevity
                if (vergleichASvsBF.delong.pValue < 0.001) {
                    pValueVergleich = "P < .001";
                } else if (vergleichASvsBF.delong.pValue < 0.05) {
                    pValueVergleich = "P < .05";
                } else {
                     pValueVergleich = `P = ${radiologyFormatter.formatRadiologyNumber(vergleichASvsBF.delong.pValue, 2, true)}`;
                }
            }

            const tempStatementDe = `Avocado Sign (MRT) erreicht hohe Genauigkeit (AUC ${aucAS}) beim N-Staging des Rektumkarzinoms, vergleichbar mit optimierten T2-Kriterien (AUC ${aucBF}${pValueVergleich ? ", " + pValueVergleich : ""}).`;
            const tempStatementEn = `Avocado Sign (MRI) achieves high accuracy (AUC ${aucAS}) in rectal cancer N-staging, comparable to optimized T2-weighted criteria (AUC ${aucBF}${pValueVergleich ? ", " + pValueVergleich : ""}).`;
            
            // Crude word count for example (splitting by space)
            if (tempStatementDe.split(' ').length <= 30 && tempStatementEn.split(' ').length <= 30) {
                statementDe = tempStatementDe;
                statementEn = tempStatementEn;
            }
        }


        return lang === 'de' ? statementDe : statementEn;
    }

    return Object.freeze({
        generateSummaryStatement
    });

})();
