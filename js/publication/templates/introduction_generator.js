const introductionGenerator = (() => {

    function generateIntroduction(aggregatedData, lang = 'de') {
        if (!aggregatedData || !aggregatedData.common || !aggregatedData.allKollektivStats) {
            return lang === 'de' ? "<p>Einleitung konnte nicht generiert werden: Daten fehlen.</p>" : "<p>Introduction could not be generated: data missing.</p>";
        }

        const common = aggregatedData.common;
        const anzahlGesamt = common.nGesamt ? radiologyFormatter.formatRadiologyNumber(common.nGesamt, 0) : 'N/A';
        const lurzSchaeferRefShort = common.references?.LURZ_SCHAEFER_2025_AS ? 
                                    (lang === 'de' ? 'einer vorangegangenen Untersuchung (Lurz & Schäfer, 2025)' : 'a previous investigation (Lurz & Schäfer, 2025)')
                                    : (lang === 'de' ? 'einer vorangegangenen Untersuchung' : 'a previous investigation');
        const lurzSchaeferRefFull = common.references?.LURZ_SCHAEFER_2025_AS || "[Referenz einfügen]";


        const introductionDe = `
            <p>Die präoperative Stratifizierung des Nodalstatus (N-Status) bei Patienten mit Rektumkarzinom ist ein entscheidender Faktor für die Therapieplanung und Prognoseabschätzung [1,2]. Die Magnetresonanztomographie (MRT) ist der Goldstandard für das lokale Staging. Traditionell basiert die MRT-Beurteilung mesorektaler Lymphknoten primär auf morphologischen Kriterien in T2-gewichteten (T2w) Sequenzen, wie Größe und Form [3]. Metaanalysen zeigten jedoch Limitationen dieser Kriterien hinsichtlich der diagnostischen Genauigkeit, insbesondere eine variable Sensitivität und suboptimale Spezifität, was zu Über- oder Unterbehandlung führen kann [4,5]. Im Kontext moderner Therapieansätze wie der totalen neoadjuvanten Therapie und organerhaltender Strategien ist eine verbesserte Prädiktion des Lymphknotenbefalls von hoher klinischer Relevanz [6,7].</p>
            <p>In ${lurzSchaeferRefShort} wurde das "Avocado Sign" (AS) als neuer MRT-Marker auf kontrastmittelverstärkten (KM) T1-gewichteten Sequenzen vorgestellt. Das AS ist definiert als ein signalarmer Kern innerhalb eines hyperintensen Lymphknotens. Die initiale Studie mit ${anzahlGesamt} Patienten zeigte eine vielversprechende diagnostische Leistung des AS für die Detektion von Lymphknotenmetastasen [${lurzSchaeferRefFull}]. Die Beobachtung, dass dieser Marker eine hohe diagnostische Güte aufweisen könnte, wurde bisher in der Literatur noch nicht umfassend etabliert im direkten Vergleich zu etablierten und optimierten T2w-Kriterien.</p>
            <p>Ziel dieser Studie war es, die diagnostische Leistung des Avocado Signs umfassend zu evaluieren und systematisch mit der Performance etablierter, Literatur-basierter T2w-Kriterien sowie mit datengetrieben, für die aktuelle Studienkohorte optimierten T2w-Kriterienkombinationen zu vergleichen. Es wurde untersucht, ob das Avocado Sign eine mindestens gleichwertige oder potenziell überlegene diagnostische Genauigkeit im Vergleich zu rein T2w-basierten Ansätzen für das präoperative Lymphknotenstaging beim Rektumkarzinom aufweist.</p>
        `;

        const introductionEn = `
            <p>Accurate preoperative stratification of nodal status (N-status) in patients with rectal cancer is a critical factor for treatment planning and prognosis estimation [1,2]. Magnetic resonance imaging (MRI) is the gold standard for local staging. Traditionally, MRI assessment of mesorectal lymph nodes primarily relies on morphologic criteria in T2-weighted (T2w) sequences, such as size and shape [3]. However, meta-analyses have demonstrated limitations of these criteria regarding diagnostic accuracy, particularly variable sensitivity and suboptimal specificity, potentially leading to over- or undertreatment [4,5]. In the context of modern therapeutic approaches, such as total neoadjuvant therapy and organ-preserving strategies, improved prediction of lymph node involvement is of high clinical relevance [6,7].</p>
            <p>The "Avocado Sign" (AS) was introduced in ${lurzSchaeferRefShort} as a novel MRI marker based on contrast-enhanced (CE) T1-weighted sequences. The AS is defined as a hypointense core within a hyperintense lymph node. The initial study involving ${anzahlGesamt} patients demonstrated promising diagnostic performance of the AS for detecting lymph node metastases [${lurzSchaeferRefFull}]. The finding that this marker might exhibit high diagnostic accuracy has not previously been well established in the literature in direct comparison to established and optimized T2w criteria.</p>
            <p>The purpose of this study was to comprehensively evaluate the diagnostic performance of the Avocado Sign and systematically compare it with the performance of established, literature-based T2w criteria, as well as with data-driven T2w criteria combinations optimized for the current study cohort. We investigated whether the Avocado Sign shows at least equivalent or potentially superior diagnostic accuracy compared with purely T2w-based approaches for preoperative lymph node staging in rectal cancer.</p>
        `;

        return lang === 'de' ? introductionDe : introductionEn;
    }

    return Object.freeze({
        generateIntroduction
    });

})();
