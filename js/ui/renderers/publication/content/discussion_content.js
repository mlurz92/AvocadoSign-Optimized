const discussionContent = (() => {

    function getDiscussionText(lang, allKollektivStats, commonData) {
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const bfGesamtStats = allKollektivStats?.Gesamt?.gueteT2_bruteforce;
        const vergleichASvsBFGesamt = allKollektivStats?.Gesamt?.vergleichASvsT2_bruteforce;
        
        const nGesamt = commonData.nGesamt || 0;
        const pValueDiscussion = vergleichASvsBFGesamt?.delong?.pValue !== undefined ? getPValueText(vergleichASvsBFGesamt.delong.pValue).replace('p=','') : 'N/A';

        let vergleichTextDe = "eine vergleichbare Leistung zeigte";
        let vergleichTextEn = "showed comparable performance";
        if (vergleichASvsBFGesamt?.delong?.pValue !== undefined && asGesamt?.auc?.value !== undefined && bfGesamtStats?.auc?.value !== undefined) {
            if (vergleichASvsBFGesamt.delong.pValue < (commonData.significanceLevel || 0.05)) {
                if (asGesamt.auc.value > bfGesamtStats.auc.value) {
                    vergleichTextDe = "eine signifikant überlegene Leistung zeigte";
                    vergleichTextEn = "showed significantly superior performance";
                } else if (asGesamt.auc.value < bfGesamtStats.auc.value) {
                    vergleichTextDe = "eine signifikant unterlegene Leistung zeigte";
                    vergleichTextEn = "showed significantly inferior performance";
                }
            }
        }
        const aucASGesamt = asGesamt?.auc?.value !== undefined ? formatNumber(asGesamt.auc.value, 2, 'N/A', true) : 'N/A';
        const aucBFOptimizedGesamt = bfGesamtStats?.auc?.value !== undefined ? formatNumber(bfGesamtStats.auc.value, 2, 'N/A', true) : 'N/A';


        const asRef = APP_CONFIG.REFERENCES_FOR_PUBLICATION.LURZ_SCHAEFER_AS_2025;
        const beetsTanRef = APP_CONFIG.REFERENCES_FOR_PUBLICATION.BEETS_TAN_2018_ESGAR_CONSENSUS.match(/\[(\d+)\]/)?.[0] || "[X]";
        const alSukhniRef = APP_CONFIG.REFERENCES_FOR_PUBLICATION.AL_SUKHNI_2012_MRI_ACCURACY.match(/\[(\d+)\]/)?.[0] || "[Y]";
        const garciaAguilarRef = APP_CONFIG.REFERENCES_FOR_PUBLICATION.GARCIA_AGUILAR_2022_ORGAN_PRESERVATION.match(/\[(\d+)\]/)?.[0] || "[Z]";
        const schragRef = APP_CONFIG.REFERENCES_FOR_PUBLICATION.SCHRAG_2023_PREOPERATIVE_TREATMENT.match(/\[(\d+)\]/)?.[0] || "[W]";


        if (lang === 'de') {
            return `
                <h2 id="discussion-title">Diskussion</h2>
                <p>In dieser retrospektiven Studie an ${formatNumber(nGesamt,0,true)} Patienten mit Rektumkarzinom wurde die diagnostische Leistung des kontrastmittelbasierten Avocado Signs (AS) für die Prädiktion des mesorektalen Lymphknotenstatus untersucht und mit etablierten sowie datengetriebenen T2-gewichteten (T2w) Kriterien verglichen. Das AS zeigte eine hohe diagnostische Genauigkeit (Fläche unter der Kurve [AUC], ${aucASGesamt} im Gesamtkollektiv), die über verschiedene Behandlungssubgruppen hinweg robust blieb. Im direkten statistischen Vergleich mit den für diese Kohorte optimierten T2w-Kriterien ${vergleichTextDe} (p=${pValueDiscussion} für AUC-Vergleich).</p>
                <p>Die Ergebnisse unterstreichen das Potenzial des AS als wertvollen und möglicherweise einfacher anzuwendenden Marker im Vergleich zu komplexen morphologischen T2w-Kriterien, deren Limitationen in der Literatur bekannt sind [1-3]. Unsere Analyse der Literatur-basierten T2w-Kriterien bestätigte deren variable Performance in unserer Kohorte. Die explorative Optimierung von T2w-Kriterien mittels eines Brute-Force-Algorithmus führte zwar zu einer Maximierung der Zielmetrik für die spezifischen Kollektive dieser Studie, jedoch unterstreicht dies auch die Kohortenspezifität und das Risiko der Überanpassung solcher rein datengetriebenen Ansätze. Die klare Definition des AS könnte hier Vorteile bieten.</p>
                <p>Die in der Primärstudie berichtete hohe Interobserver-Übereinstimmung für das AS (${asRef}) ist ein wichtiger Aspekt für die klinische Anwendbarkeit. Eine verbesserte Genauigkeit des präoperativen N-Stagings durch Integration des AS könnte insbesondere im Kontext individualisierter Therapiekonzepte, wie der Selektion von Patienten für organerhaltende Strategien [${garciaAguilarRef}, ${schragRef}], von Bedeutung sein.</p>
                <p>Unsere Studie weist mehrere Limitationen auf. Erstens handelt es sich um eine retrospektive Analyse an einem einzelnen Zentrum, was die Generalisierbarkeit der Ergebnisse einschränken kann. Zweitens war die Fallzahl, obwohl für eine monozentrische Studie adäquat, möglicherweise nicht ausreichend, um subtile Unterschiede zwischen den diagnostischen Methoden in allen Subgruppen mit hoher statistischer Power nachzuweisen. Drittens wurden die T2w-Kriterien im Konsens gelesen, was die Interobserver-Variabilität möglicherweise unterschätzt. Viertens erfolgte keine systematische Erfassung oder Analyse von Faktoren, die die Bildqualität oder die Interpretation des AS beeinflussen könnten (z.B. Ausmaß der Fettunterdrückung, KM-Timing). Prospektive, multizentrische Studien sind erforderlich, um diese Ergebnisse zu validieren und den klinischen Nutzen des AS, auch im Vergleich zu anderen funktionellen MRT-Parametern (z.B. DWI), weiter zu untersuchen.</p>
                <p>Zusammenfassend ist das Avocado Sign ein vielversprechender und reproduzierbarer MRT-Marker mit hoher diagnostischer Genauigkeit für die Prädiktion des mesorektalen Lymphknotenstatus beim Rektumkarzinom. Es stellt eine wertvolle Ergänzung zu den etablierten Staging-Methoden dar und hat das Potenzial, die Therapieplanung für Patienten mit Rektumkarzinom zu verfeinern und zu personalisieren. Weitere Studien sind notwendig, um seinen Stellenwert im klinischen Algorithmus endgültig zu definieren.</p>
            `;
        } else {
            return `
                <h2 id="discussion-title">Discussion</h2>
                <p>This retrospective study in ${formatNumber(nGesamt,0,true)} patients with rectal cancer evaluated the diagnostic performance of the contrast-enhanced Avocado Sign (AS) for predicting mesorectal lymph node status and compared it with established and data-driven T2-weighted (T2w) criteria. Our findings indicate that the AS demonstrates high diagnostic accuracy (area under the curve [AUC], ${aucASGesamt} in the overall cohort), which remained robust across different treatment subgroups. In direct statistical comparison with T2w criteria optimized for this cohort, the AS ${vergleichTextEn} (p=${pValueDiscussion} for AUC comparison).</p>
                <p>The results underscore the potential of AS as a valuable and possibly more straightforward marker compared to complex morphological T2w criteria, whose limitations are well-documented in the literature [1-3]. Our analysis of literature-based T2w criteria confirmed their variable performance in our cohort. Although exploratory optimization of T2w criteria using a brute-force algorithm maximized the target metric for the specific cohorts of this study, this also highlights the cohort specificity and risk of overfitting with such purely data-driven approaches. The clear definition and simple visual assessability of the Avocado Sign may offer advantages in terms of generalizability and user-friendliness.</p>
                <p>A crucial aspect for the clinical implementation of a new imaging marker is its reproducibility. The high interobserver agreement reported for the Avocado Sign in the primary study (${asRef}) suggests good applicability in daily clinical practice. The results of this extended analysis suggest that the integration of contrast-enhanced T1w sequences and the specific assessment of the Avocado Sign could enhance the diagnostic certainty of MRI staging. This is of potentially high value, particularly in the context of individualized treatment decisions, such as selecting patients for organ-preserving strategies [${garciaAguilarRef}, ${schragRef}] or de-/escalating neoadjuvant therapies.</p>
                <p>Our study has several limitations. First, it is a retrospective, single-center analysis, which may limit the generalizability of the findings. Second, although the sample size was adequate for a single-center study, it may not have been sufficient to detect subtle differences between diagnostic methods in all subgroups with high statistical power. Third, T2w criteria were read by consensus, which might underestimate interobserver variability. Fourth, factors potentially influencing image quality or AS interpretation (e.g., degree of fat suppression, contrast timing) were not systematically recorded or analyzed. Prospective, multicenter studies are necessary to validate these results and to further investigate the clinical utility of the AS, including comparison with other functional MRI parameters (e.g., DWI).</p>
                <p>In conclusion, the Avocado Sign is a promising and reproducible MRI marker with high diagnostic accuracy for predicting mesorectal lymph node status in rectal cancer. It represents a valuable addition to established staging methods and has the potential to refine and personalize treatment planning for patients with rectal cancer. Further studies are needed to definitively establish its role in the clinical algorithm.</p>
            `;
        }
    }

    return Object.freeze({
        getDiscussionText
    });

})();
