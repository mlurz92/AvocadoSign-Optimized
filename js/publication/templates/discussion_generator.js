const discussionGenerator = (() => {

    function generateDiscussion(aggregatedData, lang = 'de') {
        if (!aggregatedData || !aggregatedData.allKollektivStats || !aggregatedData.common) {
            return lang === 'de' ? "<p>Diskussion konnte nicht generiert werden: Daten fehlen.</p>" : "<p>Discussion could not be generated: data missing.</p>";
        }

        const common = aggregatedData.common;
        const statsGesamt = aggregatedData.allKollektivStats.Gesamt;
        const asGesamt = statsGesamt?.gueteAS;
        const bfGesamt = statsGesamt?.gueteT2_bruteforce;
        const vergleichASvsBFGesamt = statsGesamt?.vergleichASvsT2_bruteforce;
        const nGesamt = common.nGesamt ? radiologyFormatter.formatRadiologyNumber(common.nGesamt, 0) : 'N/A';
        const lurzSchaeferRefShort = common.references?.LURZ_SCHAEFER_2025_AS ? (lang === 'de' ? ' (Lurz & Schäfer, 2025)' : ' (Lurz & Schäfer, 2025)') : '';
        const lurzSchaeferRefFull = common.references?.LURZ_SCHAEFER_2025_AS || "[Ref Original AS Studie]";

        const aucASGesamtStr = asGesamt?.auc?.value !== undefined ? radiologyFormatter.formatRadiologyNumber(asGesamt.auc.value, 2, true) : 'N/A';
        const aucBFGesamtStr = bfGesamt?.auc?.value !== undefined ? radiologyFormatter.formatRadiologyNumber(bfGesamt.auc.value, 2, true) : 'N/A';
        const pDelongStr = vergleichASvsBFGesamt?.delong?.pValue !== undefined ? radiologyFormatter.formatRadiologyPValue(vergleichASvsBFGesamt.delong.pValue) : 'N/A';
        
        let vergleichPerformanceTextDe = "eine vergleichbare Leistung zeigte";
        let vergleichPerformanceTextEn = "showed comparable performance";
        if (vergleichASvsBFGesamt?.delong?.pValue !== undefined && asGesamt?.auc?.value !== undefined && bfGesamt?.auc?.value !== undefined) {
            const pValue = vergleichASvsBFGesamt.delong.pValue;
            if (pValue < (common.appConfig?.STATISTICAL_CONSTANTS?.SIGNIFICANCE_LEVEL || 0.05)) {
                if (asGesamt.auc.value > bfGesamt.auc.value) {
                    vergleichPerformanceTextDe = "eine signifikant überlegene Leistung zeigte";
                    vergleichPerformanceTextEn = "showed significantly superior performance";
                } else if (asGesamt.auc.value < bfGesamt.auc.value) {
                    vergleichPerformanceTextDe = "eine signifikant unterlegene Leistung zeigte";
                    vergleichPerformanceTextEn = "showed significantly inferior performance";
                }
            }
        }

        if (lang === 'de') {
            return `
                <p>In dieser retrospektiven Studie mit ${nGesamt} Patienten mit Rektumkarzinom wurde die diagnostische Leistung des kontrastmittelbasierten Avocado Signs (AS) für die Prädiktion des mesorektalen Lymphknotenstatus untersucht und mit etablierten sowie datengetriebenen T2-gewichteten (T2w) Kriterien verglichen. Unsere Ergebnisse zeigen, dass das AS eine hohe diagnostische Genauigkeit aufweist (Fläche unter der Kurve [AUC], ${aucASGesamtStr} im Gesamtkollektiv) und diese über verschiedene Behandlungssubgruppen (primäre Operation und nach neoadjuvanter Radiochemotherapie [nRCT]) robust blieb. Im direkten statistischen Vergleich mit den für diese Kohorte mittels Brute-Force-Algorithmus optimierten T2w-Kriterien ${vergleichPerformanceTextDe} (AUC für optimierte T2-Kriterien ${aucBFGesamtStr}; ${pDelongStr} für AUC-Vergleich).</p>
                <p>Die Notwendigkeit einer verbesserten präoperativen N-Status-Beurteilung ist bekannt, da traditionelle morphologische T2w-Kriterien oft eine limitierte Genauigkeit aufweisen [1-3]. Unsere Analyse der Literatur-basierten T2w-Kriterien bestätigte deren variable Performance in unserer Studienkohorte. Die explorative Optimierung von T2w-Kriterien mittels eines Brute-Force-Algorithmus führte zwar zu einer Maximierung der gewählten Zielmetrik für die spezifischen Kollektive dieser Studie, jedoch ist dieser Ansatz anfällig für eine Überanpassung an den Datensatz und die Ergebnisse sind möglicherweise nicht ohne Weiteres generalisierbar. Das Avocado Sign, mit seiner klaren visuellen Definition, könnte hier Vorteile in Bezug auf Anwendbarkeit und Reproduzierbarkeit bieten. Die in der Primärstudie zum Avocado Sign berichtete hohe Interobserver-Übereinstimmung ${lurzSchaeferRefShort} [${lurzSchaeferRefFull}] unterstützt diesen Aspekt.</p>
                <p>Eine verbesserte Genauigkeit des präoperativen N-Stagings durch Integration des AS könnte insbesondere im Kontext individualisierter Therapiekonzepte von Bedeutung sein. Dazu zählen die Selektion von Patienten für organerhaltende Strategien (z.B. "Watch-and-Wait"-Ansatz) oder die Entscheidung über Intensität und Art der neoadjuvanten Therapie [4,5]. Die Möglichkeit, den Lymphknotenstatus zuverlässiger vorherzusagen, könnte dazu beitragen, sowohl Über- als auch Unterbehandlungen zu reduzieren.</p>
                <p>Unsere Studie weist mehrere Limitationen auf. Erstens handelt es sich um eine retrospektive Analyse an einem einzelnen Zentrum, was die Generalisierbarkeit der Ergebnisse einschränken kann. Zweitens war die Fallzahl, obwohl für eine monozentrische Studie adäquat, möglicherweise nicht ausreichend, um subtile Unterschiede zwischen den diagnostischen Methoden in allen Subgruppen mit hoher statistischer Power nachzuweisen. Drittens wurden die T2w-Kriterien im Konsens durch zwei erfahrene Radiologen bewertet, was die Interobserver-Variabilität im Vergleich zu einer unabhängigen Doppelbefundung potenziell unterschätzt. Viertens erfolgte keine systematische Erfassung oder Analyse von Faktoren, die die Bildqualität oder die Interpretation des AS beeinflussen könnten, wie z.B. das genaue Timing der Kontrastmittelapplikation relativ zur Akquisition der T1w-Sequenz oder das Ausmaß der Fettunterdrückung. Fünftens fand kein direkter geblindeter Vergleich der Lesezeit oder des subjektiven Vertrauens der Bewerter zwischen dem AS und den komplexen T2w-Kriteriensets statt.</p>
                <p>Zusammenfassend ist das Avocado Sign ein vielversprechender und reproduzierbarer MRT-Marker mit hoher diagnostischer Genauigkeit für die Prädiktion des mesorektalen Lymphknotenstatus beim Rektumkarzinom. Es stellt potenziell eine wertvolle Ergänzung zu den etablierten Staging-Methoden dar und könnte die Therapieplanung für Patienten mit Rektumkarzinom verfeinern und personalisieren. Prospektive, multizentrische Studien sind erforderlich, um diese Ergebnisse zu validieren, die optimale Integration des AS in bestehende Scoring-Systeme zu untersuchen und seinen klinischen Nutzen im Vergleich zu oder in Kombination mit anderen funktionellen MRT-Parametern (z.B. DWI) endgültig zu definieren.</p>
            `;
        } else {
            return `
                <p>In this retrospective study of ${nGesamt} patients with rectal cancer, the diagnostic performance of the contrast-enhanced Avocado Sign (AS) for predicting mesorectal lymph node status was evaluated and compared with established and data-driven T2-weighted (T2w) criteria. Our findings indicate that the AS demonstrates high diagnostic accuracy (area under the curve [AUC], ${aucASGesamtStr} in the overall cohort), which remained robust across different treatment subgroups (upfront surgery and after neoadjuvant chemoradiotherapy [nCRT]). In direct statistical comparison with T2w criteria optimized for this cohort using a brute-force algorithm, the AS ${vergleichPerformanceTextEn} (AUC for optimized T2w criteria ${aucBFGesamtStr}; ${pDelongStr} for AUC comparison).</p>
                <p>The need for improved preoperative N-status assessment is well recognized, as traditional morphologic T2w criteria often exhibit limited accuracy [1-3]. Our analysis of literature-based T2w criteria confirmed their variable performance in our study cohort. Although exploratory optimization of T2w criteria using a brute-force algorithm maximized the chosen target metric for the specific cohorts of this study, this approach is susceptible to overfitting to the dataset, and its results may not be readily generalizable. The Avocado Sign, with its clear visual definition, may offer advantages in terms of applicability and reproducibility. The high interobserver agreement reported in the primary Avocado Sign study ${lurzSchaeferRefShort} [${lurzSchaeferRefFull}] supports this aspect.</p>
                <p>Improved accuracy of preoperative lymph node (N)-staging through integration of the AS could be particularly relevant in the context of individualized treatment concepts. These include the selection of patients for organ-preserving strategies (e.g., "watch-and-wait" approach) or decisions regarding the intensity and type of neoadjuvant therapy [4,5]. The ability to more reliably predict N-status could help reduce both overtreatment and undertreatment.</p>
                <p>Our study has several limitations. First, it is a retrospective, single-center analysis, which may limit the generalizability of the findings. Second, although the sample size was adequate for a single-center study, it may not have been sufficient to detect subtle differences between diagnostic methods in all subgroups with high statistical power. Third, T2w criteria were read by consensus by two experienced radiologists, which might underestimate interobserver variability compared with independent double readings. Fourth, factors potentially influencing image quality or AS interpretation, such as the precise timing of contrast agent administration relative to T1w sequence acquisition or the degree of fat suppression, were not systematically recorded or analyzed. Fifth, no direct blinded comparison of reading time or radiologists' subjective confidence was performed between the AS and complex T2w criteria sets.</p>
                <p>In conclusion, the Avocado Sign is a promising and reproducible MRI marker with high diagnostic accuracy for predicting mesorectal lymph node status in rectal cancer. It potentially represents a valuable addition to established staging methods and could refine and personalize treatment planning for patients with rectal cancer. Prospective, multicenter studies are required to validate these findings, investigate the optimal integration of the AS into existing scoring systems, and definitively establish its clinical utility compared with or in combination with other functional MRI parameters (e.g., DWI) endogenously.</p>
            `;
        }
    }

    return Object.freeze({
        generateDiscussion
    });

})();
