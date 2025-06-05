const referencesContent = (() => {

    function getReferencesText(lang, commonData) {
        const refs = commonData.references || {};
        let text = `<h2 id="references-title">${lang === 'de' ? 'Literaturverzeichnis' : 'References'}</h2><ol class="small">`;
        
        // Define the desired order of references based on the Radiology style guide and provided prompt.
        // References from APP_CONFIG.REFERENCES_FOR_PUBLICATION are listed first.
        // Other numbered references are from the Radiology style guide example.
        const allPossibleReferences = [
            refs.LURZ_SCHAEFER_AS_2025, // Our study, should be [1]
            refs.SIEGEL_2023_CANCER_STATS, // [1] from user-provided text, should be [2] etc
            refs.SAUER_2004_CHEMORADIOTHERAPY, // [2] from user-provided text
            refs.BEETS_TAN_2018_ESGAR_CONSENSUS, // [3] from user-provided text
            refs.AL_SUKHNI_2012_MRI_ACCURACY, // [4] from user-provided text
            refs.TAYLOR_2011_MRI_PREDICTIVE_VALUE, // [5] from user-provided text
            refs.GARCIA_AGUILAR_2022_ORGAN_PRESERVATION, // [6] from user-provided text
            refs.SCHRAG_2023_PREOPERATIVE_TREATMENT, // [7] from user-provided text
            refs.KOH_2008_MORPHOLOGY, 
            refs.BARBARO_2024_RESTAGING, 
            refs.RUTEGARD_2025_ESGAR_VALIDATION,
            refs.BROWN_2003_MORPHOLOGY,
            refs.KAUR_2012_MRI_PRACTICAL,
            refs.HORVAT_2019_MRI_RECTAL_CANCER,
            refs.BEETS_TAN_2009_USPIO_RESTAGING,
            refs.BEETS_TAN_2004_GADOLINIUM,
            refs.BARBARO_2010_RESTAGING
        ].filter(ref => ref); // Filter out any null or undefined references

        let displayedRefs = new Set();
        let currentRefNumber = 1;

        // Manually assign reference numbers for consistency and ensure correct order
        text += allPossibleReferences.map(refString => {
            if (!displayedRefs.has(refString)) {
                displayedRefs.add(refString);
                let cleanRefText = refString;
                // Remove existing [NUMBER] if present to re-number
                const match = refString.match(/^\[\d+\]\s*(.*)/);
                if (match) {
                    cleanRefText = match[1];
                }
                return `<li>[${currentRefNumber++}] ${cleanRefText}</li>`;
            }
            return '';
        }).filter(item => item).join(''); // Filter out empty strings from duplicates

        text += `</ol>`;
        return text;
    }

    return Object.freeze({
        getReferencesText
    });

})();
