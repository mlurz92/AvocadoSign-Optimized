const introductionContent = (() => {

    function getIntroductionText(lang, commonData) {
        const lurzSchaeferRef = commonData.references?.LURZ_SCHAEFER_AS_2025 || "Lurz M, Schaefer FK. Eur Radiol. 2025;XXX:XXX-XXX";
        const anzahlGesamt = commonData.nGesamt ? formatNumber(commonData.nGesamt, 0, 'N/A', true) : 'N/A';

        if (lang === 'de') {
            return `
                <h2 id="introduction-title">Einleitung</h2>
                <p>Die adäquate präoperative Stratifizierung des Nodalstatus (N-Status) bei Patienten mit Rektumkarzinom ist ein entscheidender Faktor für die Wahl der optimalen Therapiestrategie und die Abschätzung der Prognose [1,2]. Die Magnetresonanztomographie (MRT) gilt als Goldstandard für das lokale Staging des Rektumkarzinoms. Traditionell basiert die MRT-Beurteilung mesorektaler Lymphknoten primär auf morphologischen Kriterien in T2-gewichteten (T2w) Sequenzen, wie Größe, Form und Randbegrenzung [3]. Metaanalysen haben jedoch gezeigt, dass diese Kriterien eine limitierte diagnostische Genauigkeit aufweisen, was zu einer Über- oder Unterbehandlung von Patienten führen kann [4,5]. Insbesondere im Kontext moderner Therapieansätze wie der totalen neoadjuvanten Therapie (TNT) und organerhaltender Strategien ("Watch-and-Wait") ist eine verbesserte Prädiktion des Lymphknotenbefalls von höchster klinischer Relevanz [6,7].</p>
                <p>In einer vorangegangenen Untersuchung wurde das "Avocado Sign" (AS) als ein neuer MRT-Marker vorgestellt, der auf kontrastmittelverstärkten (KM) T1-gewichteten (T1w) Sequenzen basiert (${lurzSchaeferRef}). Das AS ist definiert als ein umschriebener, zentral oder exzentrisch gelegener hypointenser Kern innerhalb eines ansonsten homogen signalangehobenen (hyperintensen) mesorektalen Lymphknotens, unabhängig von dessen Größe oder Form. In der initialen Studie mit ${anzahlGesamt} Patienten zeigte das AS eine vielversprechende diagnostische Leistung für die Detektion von Lymphknotenmetastasen.</p>
                <p>Ziel dieser Studie war es, die diagnostische Güte des Avocado Signs umfassend zu evaluieren und mit der Performance etablierter, Literatur-basierter T2w-Kriterien sowie mit datengetrieben, für die Studienkohorte optimierten T2w-Kriterienkombinationen zu vergleichen. Es wurde die Hypothese untersucht, dass das Avocado Sign eine mindestens gleichwertige, potenziell überlegene diagnostische Genauigkeit im Vergleich zu T2w-Kriterien aufweist und somit zur Verbesserung des präoperativen Lymphknotenstagings beim Rektumkarzinom beitragen könnte.</p>
            `;
        } else {
            return `
                <h2 id="introduction-title">Introduction</h2>
                <p>Accurate preoperative stratification of nodal status (N-status) in patients with rectal cancer is a critical factor for selecting the optimal therapeutic strategy and estimating prognosis [1,2]. Magnetic resonance imaging (MRI) is considered the gold standard for local staging of rectal cancer. Traditionally, MRI assessment of mesorectal lymph nodes primarily relies on morphological criteria in T2-weighted (T2w) sequences, such as size, shape, and border characteristics [3]. However, meta-analyses have demonstrated that these criteria exhibit limited diagnostic accuracy, which can lead to over- or undertreatment of patients [4,5]. Especially in the context of modern therapeutic approaches, such as total neoadjuvant therapy (TNT) and organ-preserving strategies ("watch-and-wait"), improved prediction of lymph node involvement is of utmost clinical relevance [6,7].</p>
                <p>In a previous investigation, the "Avocado Sign" (AS) was introduced as a novel MRI marker based on contrast-enhanced (CE) T1-weighted (T1w) sequences (${lurzSchaeferRef}). The AS is defined as a clearly demarcated, low-signal-intensity (hypointense) core within an otherwise homogeneously high-signal-intensity (hyperintense) mesorectal lymph node, irrespective of its size or shape. In the initial study involving ${anzahlGesamt} patients, the AS demonstrated promising diagnostic performance for the detection of lymph node metastases.</p>
                <p>The purpose of this study was to comprehensively evaluate the diagnostic performance of the Avocado Sign and compare it with that of established, literature-based T2w criteria, as well as with data-driven T2w criteria combinations optimized for this study cohort. We hypothesized that the Avocado Sign would exhibit at least equivalent, potentially superior, diagnostic accuracy compared to T2w criteria, thereby contributing to the improvement of preoperative lymph node staging in rectal cancer.</p>
            `;
        }
    }

    return Object.freeze({
        getIntroductionText
    });

})();
