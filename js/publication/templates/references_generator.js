const referencesGenerator = (() => {

    function generateReferences(aggregatedData, lang = 'de') {
        if (!aggregatedData || !aggregatedData.common || !aggregatedData.common.references) {
            return lang === 'de' ? "<p>Literaturverzeichnis konnte nicht generiert werden: Referenzdaten fehlen.</p>" : "<p>References could not be generated: reference data missing.</p>";
        }

        const referencesObject = aggregatedData.common.references;
        const referenceLimit = aggregatedData.common.appConfig?.PUBLICATION_JOURNAL_REQUIREMENTS?.MANUSCRIPT_TYPE_ORIGINAL_RESEARCH?.REFERENCE_LIMIT || 35;
        
        const referenceKeysInOrder = [
            "LURZ_SCHAEFER_2025_AS",
            "SIEGEL_2023_CANCER_STATS", // Placeholder key for [1]
            "SAUER_2004_PREOP_VS_POSTOP_CRT", // Placeholder key for [2]
            "BEETS_TAN_2018_ESGAR_CONSENSUS", // Placeholder key for [3]
            "AL_SUKHNI_2012_MRI_META_ANALYSIS", // Placeholder key for [4]
            "TAYLOR_2011_MRI_PROGNOSIS", // Placeholder key for [5]
            "GARCIA_AGUILAR_2022_ORGAN_PRESERVATION", // Placeholder key for [6]
            "SCHRAG_2023_PROSPECT_TRIAL", // Placeholder key for [7]
            "KOH_2008_MORPHOLOGY",
            "BARBARO_2024_RESTAGING",
            "RUTEGARD_2025_ESGAR_VALIDATION",
            "BROWN_2003_MORPHOLOGY",
            "KAUR_2012_MRI_PRACTICAL",
            "HORVAT_2019_MRI_RECTAL_CANCER",
            "BEETS_TAN_2009_USPIO_RESTAGING",
            "BEETS_TAN_2004_GADOLINIUM",
            "BARBARO_2010_RESTAGING_MRI",
            "RADIOLOGY_STROBE_EXAMPLE",
            "RADIOLOGY_STARD_EXAMPLE"
            // Add other keys from APP_CONFIG.REFERENCES_FOR_PUBLICATION in desired citation order
            // This order should ideally be determined by the main publication controller based on actual citations.
            // For now, this predefined order is used as a placeholder for all defined references.
        ];

        const allDefinedReferenceKeys = Object.keys(referencesObject);
        const referencesToDisplay = [];
        
        // First, add references in the predefined order if they exist
        referenceKeysInOrder.forEach(key => {
            if (referencesObject[key] && !referencesToDisplay.includes(referencesObject[key])) {
                referencesToDisplay.push(referencesObject[key]);
            }
        });

        // Then, add any remaining defined references that weren't in the predefined order
        // (to ensure all available config references are shown, respecting the limit)
        allDefinedReferenceKeys.forEach(key => {
            if (referencesObject[key] && !referencesToDisplay.includes(referencesObject[key])) {
                referencesToDisplay.push(referencesObject[key]);
            }
        });


        if (referencesToDisplay.length === 0) {
            return lang === 'de' ? "<p>Keine Referenzen definiert.</p>" : "<p>No references defined.</p>";
        }

        let html = `<h2 id="references-title">${lang === 'de' ? UI_TEXTS.publikationTab.sectionLabels.references : 'References'}</h2>`;
        html += '<ol class="small">';

        const limitExceeded = referencesToDisplay.length > referenceLimit;
        const itemsToList = limitExceeded ? referenceLimit : referencesToDisplay.length;

        for (let i = 0; i < itemsToList; i++) {
            html += `<li>${referencesToDisplay[i]}</li>`;
        }
        html += '</ol>';

        if (limitExceeded) {
            const warningTextDe = `Hinweis: Es wurden ${referencesToDisplay.length} Referenzen gefunden. Gemäß "Radiology Style Guide" für Originalarbeiten beträgt das Limit ${referenceLimit}. Die Liste wurde auf ${referenceLimit} Einträge gekürzt. Die definitive Auswahl und Reihenfolge muss auf Basis der Zitationen im Text erfolgen.`;
            const warningTextEn = `Note: ${referencesToDisplay.length} references were found. According to "Radiology Style Guide" for Original Research, the limit is ${referenceLimit}. The list has been truncated to ${referenceLimit} entries. The final selection and order must be based on citations in the text.`;
            html += `<p class="small text-danger mt-2"><em>${lang === 'de' ? warningTextDe : warningTextEn}</em></p>`;
        }
        
        const citationOrderNoteDe = `Die obenstehende Liste enthält die in der Anwendungskonfiguration definierten Referenzen. Die finale Reihenfolge im Manuskript muss der Reihenfolge der erstmaligen Nennung im Text entsprechen. Referenzen, die nicht im Text zitiert werden, sind zu entfernen.`;
        const citationOrderNoteEn = `The list above includes references defined in the application configuration. The final order in the manuscript must correspond to the order of their first appearance in the text. References not cited in the text should be removed.`;
        html += `<p class="small text-muted mt-2"><em>${lang === 'de' ? citationOrderNoteDe : citationOrderNoteEn}</em></p>`;


        return html;
    }

    return Object.freeze({
        generateReferences
    });

})();
