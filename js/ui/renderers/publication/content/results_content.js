const resultsContent = (() => {

    function _getSafeLink(elementId){
        if (!elementId) return '#';
        return `#${elementId}`;
    }

    function _formatMetricForText(metricData, isPercent = true, digits = 0, lang = 'de') {
        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value) || !isFinite(metricData.value)) return 'N/A';
        
        let valueStr;
        if (isPercent) {
            valueStr = formatPercent(metricData.value, digits).replace('%', ''); // remove % for CI concatenation
        } else {
            valueStr = formatNumber(metricData.value, digits, 'N/A', true);
        }

        if (metricData.ci && metricData.ci.lower !== null && metricData.ci.upper !== null && isFinite(metricData.ci.lower) && isFinite(metricData.ci.upper) && !isNaN(metricData.ci.lower) && !isNaN(metricData.ci.upper)) {
            let lowerStr, upperStr;
            if (isPercent) {
                lowerStr = formatPercent(metricData.ci.lower, digits).replace('%', '');
                upperStr = formatPercent(metricData.ci.upper, digits).replace('%', '');
            } else {
                lowerStr = formatNumber(metricData.ci.lower, digits, 'N/A', true);
                upperStr = formatNumber(metricData.ci.upper, digits, 'N/A', true);
            }
            return `${valueStr}% (95% CI: ${lowerStr}–${upperStr}%)`;
        }
        return `${valueStr}%`;
    }

    function getErgebnissePatientencharakteristikaText(lang, allKollektivStats, commonData) {
        const pCharGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const anzahlGesamt = commonData.nGesamt || pCharGesamt?.anzahlPatienten || 0;
        
        const table1Id = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id;
        const fig1aId = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id;
        const fig1bId = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id;
        const flowDiagramId = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.id;

        const medianAge = pCharGesamt?.alter?.median !== undefined ? formatNumber(pCharGesamt.alter.median, 0, 'N/A', true) : 'N/A';
        const iqrAgeLower = pCharGesamt?.alter?.q1 !== undefined ? formatNumber(pCharGesamt.alter.q1, 0, 'N/A', true) : 'N/A';
        const iqrAgeUpper = pCharGesamt?.alter?.q3 !== undefined ? formatNumber(pCharGesamt.alter.q3, 0, 'N/A', true) : 'N/A';
        const ageRangeText = (medianAge !== 'N/A' && iqrAgeLower !== 'N/A' && iqrAgeUpper !== 'N/A') ? 
                             (lang === 'de' ? `${medianAge} (IQR: ${iqrAgeLower}–${iqrAgeUpper})` : `${medianAge} (IQR: ${iqrAgeLower}–${iqrAgeUpper})`)
                             : (lang === 'de' ? 'nicht verfügbar' : 'not available');
        const anzahlMaenner = pCharGesamt?.geschlecht?.m || 0;
        const anzahlMaennerProzent = pCharGesamt?.anzahlPatienten > 0 ? formatPercent(anzahlMaenner / pCharGesamt.anzahlPatienten, 0).replace('%','') : 'N/A';
        const nPlusAnzahl = pCharGesamt?.nStatus?.plus || 0;
        const nPlusProzent = pCharGesamt?.anzahlPatienten > 0 ? formatPercent(nPlusAnzahl / pCharGesamt.anzahlPatienten, 0).replace('%','') : 'N/A';
        const anzahlNRCT = pCharGesamt?.therapie?.nRCT || 0;
        const anzahlNRCTProzent = pCharGesamt?.anzahlPatienten > 0 ? formatPercent(anzahlNRCT / pCharGesamt.anzahlPatienten, 0).replace('%','') : 'N/A';
        const anzahlDirektOP = pCharGesamt?.therapie?.['direkt OP'] || 0;
        const anzahlDirektOPProzent = pCharGesamt?.anzahlPatienten > 0 ? formatPercent(anzahlDirektOP / pCharGesamt.anzahlPatienten, 0).replace('%','') : 'N/A';


        if (lang === 'de') {
            return `
                <h3 id="ergebnisse-patientencharakteristika-title">Patientencharakteristika und Datenfluss</h3>
                <p>Insgesamt wurden ${formatNumber(anzahlGesamt,0,true)} Patienten (medianes Alter ${ageRangeText} Jahre; ${formatNumber(anzahlMaenner,0,true)} [${anzahlMaennerProzent}%] Männer) in die finale Analyse eingeschlossen. Das Patientenflussdiagramm ist in <a href="${_getSafeLink(flowDiagramId)}">Abbildung Methoden 1</a> dargestellt. Davon erhielten ${formatNumber(anzahlNRCT,0,true)} (${anzahlNRCTProzent}%) eine neoadjuvante Radiochemotherapie (nRCT), während ${formatNumber(anzahlDirektOP,0,true)} (${anzahlDirektOPProzent}%) primär operiert wurden. Ein histopathologisch gesicherter Lymphknotenbefall (N+) lag bei ${nPlusAnzahl} (${nPlusProzent}%) Patienten vor. Detaillierte Patientencharakteristika sind in <a href="${_getSafeLink(table1Id)}">Tabelle Ergebnisse 1</a> zusammengefasst. Die Alters- und Geschlechtsverteilung der Studienkohorte ist in <a href="${_getSafeLink(fig1aId)}">Abbildung Ergebnisse 1a</a> und <a href="${_getSafeLink(fig1bId)}">1b</a> dargestellt.</p>
            `;
        } else {
            return `
                <h3 id="ergebnisse-patientencharakteristika-title">Patient Characteristics and Data Flow</h3>
                <p>A total of ${formatNumber(anzahlGesamt,0,true)} patients (median age, ${ageRangeText} years; ${formatNumber(anzahlMaenner,0,true)} [${anzahlMaennerProzent}%] men) were included in the final analysis. The patient flowchart is shown in <a href="${_getSafeLink(flowDiagramId)}">Methods Figure 1</a>. Of these, ${formatNumber(anzahlNRCT,0,true)} (${anzahlNRCTProzent}%) patients received neoadjuvant chemoradiotherapy (nRCT), while ${formatNumber(anzahlDirektOP,0,true)} (${anzahlDirektOPProzent}%) underwent upfront surgery. Histopathologically confirmed lymph node involvement (N+) was present in ${nPlusAnzahl} (${nPlusProzent}%) patients. Detailed patient characteristics are summarized in <a href="${_getSafeLink(table1Id)}">Results Table 1</a>. The age and gender distribution of the study cohort is illustrated in <a href="${_getSafeLink(fig1aId)}">Results Figure 1a</a> and <a href="${_getSafeLink(fig1bId)}">1b</a>.</p>
            `;
        }
    }

    function getErgebnisseASPerformanceText(lang, allKollektivStats, commonData) {
        const asGesamt = allKollektivStats?.Gesamt?.gueteAS;
        const asDirektOP = allKollektivStats?.['direkt OP']?.gueteAS;
        const asNRCT = allKollektivStats?.nRCT?.gueteAS;

        const nGesamt = commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 0;
        const nDirektOP = commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 0;
        const nNRCT = commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 0;
        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.id;

        if (lang === 'de') {
            return `
                <h3 id="ergebnisse-as-diagnostische-guete-title">Diagnostische Güte des Avocado Signs</h3>
                <p>Die diagnostische Leistung des Avocado Signs (AS) zur Prädiktion des pathologischen N-Status ist in <a href="${_getSafeLink(tableId)}">Tabelle Ergebnisse 2</a> für das Gesamtkollektiv sowie für die Subgruppen mit primärer Operation und nach nRCT detailliert dargestellt. Im Gesamtkollektiv (N=${formatNumber(nGesamt,0,true)}) wies das AS eine Sensitivität von ${_formatMetricForText(asGesamt?.sens, true, 0, 'de')}, eine Spezifität von ${_formatMetricForText(asGesamt?.spez, true, 0, 'de')} und eine AUC von ${_formatMetricForText(asGesamt?.auc, false, 2, 'de')} auf.</p>
                <p>Bei Patienten der Direkt-OP-Gruppe (N=${formatNumber(nDirektOP,0,true)}) erreichte das AS eine Sensitivität von ${_formatMetricForText(asDirektOP?.sens, true, 0, 'de')} bei einer Spezifität von ${_formatMetricForText(asDirektOP?.spez, true, 0, 'de')} (AUC ${_formatMetricForText(asDirektOP?.auc, false, 2, 'de')}). In der nRCT-Gruppe (N=${formatNumber(nNRCT,0,true)}) betrug die Sensitivität ${_formatMetricForText(asNRCT?.sens, true, 0, 'de')} und die Spezifität ${_formatMetricForText(asNRCT?.spez, true, 0, 'de')} (AUC ${_formatMetricForText(asNRCT?.auc, false, 2, 'de')}).</p>
            `;
        } else {
            return `
                <h3 id="ergebnisse-as-diagnostische-guete-title">Diagnostic Performance of the Avocado Sign</h3>
                <p>The diagnostic performance of the Avocado Sign (AS) for predicting pathological N-status is detailed in <a href="${_getSafeLink(tableId)}">Results Table 2</a> for the overall cohort and for subgroups undergoing upfront surgery and after nRCT. In the overall cohort (n=${formatNumber(nGesamt,0,true)}), the AS achieved a sensitivity of ${_formatMetricForText(asGesamt?.sens, true, 0, 'en')}, a specificity of ${_formatMetricForText(asGesamt?.spez, true, 0, 'en')}, and an AUC of ${_formatMetricForText(asGesamt?.auc, false, 2, 'en')}.</p>
                <p>In patients undergoing upfront surgery (n=${formatNumber(nDirektOP,0,true)}), the AS demonstrated a sensitivity of ${_formatMetricForTable(asDirektOP?.sens, true, 0, 'en')}, and a specificity of ${_formatMetricForTable(asDirektOP?.spez, true, 0, 'en')} (AUC ${_formatMetricForTable(asDirektOP?.auc, false, 2, 'en')}). In the nRCT group (n=${formatNumber(nNRCT,0,true)}), sensitivity was ${_formatMetricForTable(asNRCT?.sens, true, 0, 'en')} and specificity was ${_formatMetricForTable(asNRCT?.spez, true, 0, 'en')} (AUC ${_formatMetricForTable(asNRCT?.auc, false, 2, 'en')}).</p>
            `;
        }
    }

    function getErgebnisseLiteraturT2PerformanceText(lang, allKollektivStats, commonData) {
        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id;
        let text = '';
        if (lang === 'de') {
            text = `<h3 id="ergebnisse-t2-literatur-diagnostische-guete-title">Diagnostische Güte der Literatur-basierten T2-Kriterien</h3><p>Die Performance der etablierten T2-Kriteriensets aus der Literatur, angewendet auf die entsprechenden (Sub-)Kollektive unserer Studienpopulation, ist in <a href="${_getSafeLink(tableId)}">Tabelle Ergebnisse 3</a> dargestellt. Die Ergebnisse variierten je nach Kriterienset und zugrundeliegender Patientengruppe.</p><ul>`;
        } else {
            text = `<h3 id="ergebnisse-t2-literatur-diagnostische-guete-title">Diagnostic Performance of Literature-Based T2 Criteria</h3><p>The performance of established T2 criteria sets from the literature, applied to the respective (sub-)cohorts of our study population, is presented in <a href="${_getSafeLink(tableId)}">Results Table 3</a>. Results varied depending on the specific criteria set and the patient subgroup.</p><ul>`;
        }

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                // Ensure to pick the correct stats which might be null if applicableKollektiv does not match kolId
                const stats = allKollektivStats?.[studySet.applicableKollektiv || 'Gesamt']?.gueteT2_literatur?.[conf.id];
                const nPat = allKollektivStats?.[studySet.applicableKollektiv || 'Gesamt']?.deskriptiv?.anzahlPatienten || 0;
                const setName = studySet.name || studySet.labelKey;

                if (stats && stats.matrix && (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn > 0)) {
                    text += `<li>Die Kriterien nach ${setName}, angewendet auf das ${getKollektivDisplayName(studySet.applicableKollektiv || 'Gesamt')} (N=${formatNumber(nPat,0,true)}), erreichten eine Sensitivität von ${_formatMetricForText(stats.sens, true, 0, lang)}, eine Spezifität von ${_formatMetricForText(stats.spez, true, 0, lang)} und eine AUC von ${_formatMetricForText(stats.auc, false, 2, lang)}.</li>`;
                } else {
                    text += `<li>Für die Kriterien nach ${setName} (Kollektiv: ${getKollektivDisplayName(studySet.applicableKollektiv || 'Gesamt')} N=${formatNumber(nPat,0,true)}) konnten keine validen Performancedaten berechnet werden.</li>`;
                }
            }
        });
        text += `</ul>`;
        return text;
    }

    function getErgebnisseOptimierteT2PerformanceText(lang, allKollektivStats, commonData) {
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id;
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l, s) => 'N/A';
        let text = '';

        if (lang === 'de') {
            text += `<h3 id="ergebnisse-t2-optimiert-diagnostische-guete-title">Diagnostische Güte der datengetriebenen optimierten T2-Kriterien</h3><p>Mittels eines explorativen Brute-Force-Algorithmus wurden für jedes der drei Studienkollektive spezifische T2-Kriteriensets identifiziert, welche die <strong>${bfZielMetric}</strong> maximieren. Die Definition dieser optimierten Kriteriensets ist im Methodenteil detaillierter beschrieben. Die diagnostische Güte dieser für unsere Kohorte optimierten Sets ist in <a href="${_getSafeLink(tableId)}">Tabelle Ergebnisse 4</a> dargestellt.</p><p>Die für die jeweilige Kohorte spezifisch optimierten Kriterien waren:</p><ul>`;
        } else {
            text += `<h3 id="ergebnisse-t2-optimiert-diagnostische-guete-title">Diagnostic Performance of Data-Driven Optimized T2 Criteria</h3><p>Using an exploratory brute-force algorithm, specific T2 criteria sets maximizing <strong>${bfZielMetric}</strong> were identified for each of the three study cohorts. The definition of these optimized criteria sets is detailed in the Methods section. The diagnostic performance of these sets, optimized for our cohort, is presented in <a href="${_getSafeLink(tableId)}">Results Table 4</a>.</p><p>The criteria specifically optimized for each cohort were:</p><ul>`;
        }

        const kollektive = [
            { id: 'Gesamt', n: commonData.nGesamt || allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten },
            { id: 'direkt OP', n: commonData.nDirektOP || allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten },
            { id: 'nRCT', n: commonData.nNRCT || allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten }
        ];

        kollektive.forEach(k => {
            const bfStats = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const nPat = k.n || 0;
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;
            const criteriaDesc = bfDef ? formatCriteriaFunc(bfDef.criteria, bfDef.logic, false) : (lang === 'de' ? 'nicht verfügbar' : 'unavailable');

            if (bfStats && bfStats.matrix && (bfStats.matrix.rp + bfStats.matrix.fp + bfStats.matrix.fn + bfStats.matrix.rn > 0) && bfDef) {
                 text += `<li><strong>${getKollektivDisplayName(k.id)}</strong> (N=${formatNumber(nPat,0,true)}): Die Optimierung (Zielmetrik: ${bfDef.metricName || bfZielMetric}, erreicht: ${formatNumber(bfDef.metricValue, 4, 'N/A', true)}) ergab folgende Kriterien: <em>${criteriaDesc}</em>. Dies führte zu einer Sensitivität von ${_formatMetricForText(bfStats.sens, true, 0, lang)}, Spezifität von ${_formatMetricForText(bfStats.spez, true, 0, lang)} und AUC von ${_formatMetricForText(bfStats.auc, false, 2, lang)}.</li>`;
            } else {
                text += `<li>Für das ${getKollektivDisplayName(k.id)} (N=${formatNumber(nPat,0,true)}) konnten keine validen optimierten Kriterien für die Zielmetrik '${bfZielMetric}' ermittelt oder deren Performance nicht berechnet werden.</li>`;
            }
        });
        text += `</ul><p class="small text-muted">${lang === 'de' ? 'Es ist zu beachten, dass diese datengetriebenen optimierten Kriterien spezifisch für die jeweilige Studienkohorte und die gewählte Zielmetrik sind. Sie stellen keine allgemeingültige Empfehlung für die klinische Praxis dar, sondern dienen primär dem bestmöglichen Vergleich der diagnostischen Aussagekraft verschiedener Ansätze innerhalb dieser spezifischen Untersuchung.' : 'It should be noted that these data-driven optimized criteria are specific to the respective study cohort and the chosen target metric. They do not represent a general recommendation for clinical practice but primarily serve for the best possible comparison of the diagnostic performance of different approaches within this specific investigation.'}</p>`;
        return text;
    }

    function getErgebnisseVergleichPerformanceText(lang, allKollektivStats, commonData) {
        let text = '';
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.id;
        const fig2aId = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.id;
        const fig2bId = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartdirektOP.id; 
        const fig2cId = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartnRCT.id;

        if (lang === 'de') {
            text += `<h3 id="ergebnisse-vergleich-as-vs-t2-title">Vergleichsanalysen: Avocado Sign vs. T2-Kriterien</h3><p>Die statistischen Vergleiche der diagnostischen Leistung zwischen dem Avocado Sign (AS) und den T2-Kriteriensets (sowohl Literatur-basiert als auch datengetrieben optimiert für die Zielmetrik ${bfZielMetric}) sind detailliert in <a href="${_getSafeLink(tableId)}">Tabelle Ergebnisse 5</a> aufgeführt. Visuelle Vergleiche der Schlüsselmetriken für das Gesamtkollektiv, die Direkt-OP-Gruppe und die nRCT-Gruppe sind in <a href="${_getSafeLink(fig2aId)}">Abbildung Ergebnisse 2a</a>, <a href="${_getSafeLink(fig2bId)}">Abbildung Ergebnisse 2b</a> und <a href="${_getSafeLink(fig2cId)}">Abbildung Ergebnisse 2c</a> dargestellt.</p>`;
        } else {
            text += `<h3 id="ergebnisse-vergleich-as-vs-t2-title">Comparative Analyses: Avocado Sign vs. T2 Criteria</h3><p>Statistical comparisons of the diagnostic performance between the Avocado Sign (AS) and the T2 criteria sets (both literature-based and data-driven optimized for the target metric ${bfZielMetric}) are detailed in <a href="${_getSafeLink(tableId)}">Results Table 5</a>. Visual comparisons of key metrics for the overall cohort, upfront surgery group, and nRCT group are presented in <a href="${_getSafeLink(fig2aId)}">Results Figure 2a</a>, <a href="${_getSafeLink(fig2bId)}">Results Figure 2b</a>, and <a href="${_getSafeLink(fig2cId)}">Results Figure 2c</a>, respectively.</p>`;
        }

        const kollektive = [
            { id: 'Gesamt', nameDe: 'Gesamtkollektiv', nameEn: 'Overall cohort' },
            { id: 'direkt OP', nameDe: 'Direkt-OP-Kollektiv', nameEn: 'Upfront surgery cohort' },
            { id: 'nRCT', nameDe: 'nRCT-Kollektiv', nameEn: 'nRCT cohort' }
        ];

        kollektive.forEach(k => {
            const name = lang === 'de' ? k.nameDe : k.nameEn;
            const statsAS = allKollektivStats?.[k.id]?.gueteAS;
            
            // Finde das relevante Literatur-Set für dieses Kollektiv (erstes zutreffendes)
            const litSetConf = PUBLICATION_CONFIG.literatureCriteriaSets.find(lc => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(lc.id);
                return studySet && (studySet.applicableKollektiv === k.id || studySet.applicableKollektiv === 'Gesamt');
            });
            const litSetName = litSetConf ? (studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id)?.displayShortName || litSetConf.labelKey || litSetConf.id) : null;
            const statsLit = litSetConf ? allKollektivStats?.[k.id]?.gueteT2_literatur?.[litSetConf.id] : null;
            const vergleichASvsLit = litSetConf ? allKollektivStats?.[k.id]?.[`vergleichASvsT2_literatur_${litSetConf.id}`] : null;

            const statsBF = allKollektivStats?.[k.id]?.gueteT2_bruteforce;
            const bfDef = allKollektivStats?.[k.id]?.bruteforce_definition;
            const vergleichASvsBF = allKollektivStats?.[k.id]?.vergleichASvsT2_bruteforce;

            // Format AUC values (2 digits) and p-values (Radiology style)
            const formatAucVal = (val) => formatNumber(val, 2, 'N/A', true);
            const formatPVal = (pVal) => getPValueText(pVal).replace('p=', ''); // Remove 'p=' for table display

            if (lang === 'de') {
                text += `<h4>${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit && litSetName) {
                    text += `<p>Vergleich AS (AUC ${formatAucVal(statsAS.auc?.value)}) versus ${litSetName} (AUC ${formatAucVal(statsLit.auc?.value)}): Der McNemar-Test für Accuracy ergab p=${formatPVal(vergleichASvsLit.mcnemar?.pValue)}. Der DeLong-Test für AUC ergab p=${formatPVal(vergleichASvsLit.delong?.pValue)} (AUC-Differenz ${formatAucVal(vergleichASvsLit.delong?.diffAUC)}).</p>`;
                } else if (litSetConf) { // Text, wenn Literaturdaten fehlen
                    text += `<p>Für den Vergleich AS vs. ${litSetName} im ${name} sind keine oder unzureichende Daten vorhanden.</p>`;
                }
                
                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Vergleich AS versus datenoptimierte T2-Kriterien (optimiert für ${bfDef.metricName || bfZielMetric}, AUC ${formatAucVal(statsBF.auc?.value)}): Der McNemar-Test für Accuracy ergab p=${formatPVal(vergleichASvsBF.mcnemar?.pValue)}. Der DeLong-Test für AUC ergab p=${formatPVal(vergleichASvsBF.delong?.pValue)} (AUC-Differenz ${formatAucVal(vergleichASvsBF.delong?.diffAUC)}).</p>`;
                } else if (bfDef) { // Text, wenn BF-Daten fehlen
                    text += `<p>Für den Vergleich AS vs. Brute-Force optimierte Kriterien im ${name} sind keine oder unzureichende Daten vorhanden.</p>`;
                }
            } else { // English
                text += `<h4>${name}</h4>`;
                if (statsAS && statsLit && vergleichASvsLit && litSetName) {
                    text += `<p>Comparison of AS (AUC ${formatAucVal(statsAS.auc?.value)}) versus ${litSetName} (AUC ${formatAucVal(statsLit.auc?.value)}): McNemar test for accuracy yielded p=${formatPVal(vergleichASvsLit.mcnemar?.pValue)}. DeLong test for AUC yielded p=${formatPVal(vergleichASvsLit.delong?.pValue)} (AUC difference ${formatAucVal(vergleichASvsLit.delong?.diffAUC)}).</p>`;
                } else if (litSetConf) {
                    text += `<p>No or insufficient data available for comparison of AS vs. ${litSetName} in the ${name.toLowerCase()}.</p>`;
                }

                if (statsAS && statsBF && vergleichASvsBF && bfDef) {
                    text += `<p>Comparison of AS versus data-optimized T2 criteria (optimized for ${bfDef.metricName || bfZielMetric}, AUC ${formatAucVal(statsBF.auc?.value)}): McNemar test for accuracy yielded p=${formatPVal(vergleichASvsBF.mcnemar?.pValue)}. DeLong test for AUC yielded p=${formatPVal(vergleichASvsBF.delong?.pValue)} (AUC difference ${formatAucVal(vergleichASvsBF.delong?.diffAUC)}).</p>`;
                } else if (bfDef) {
                    text += `<p>No or insufficient data available for comparison of AS vs. Brute-Force optimized criteria in the ${name.toLowerCase()}.</p>`;
                }
            }
        });
        return text;
    }

    return Object.freeze({
        getErgebnissePatientencharakteristikaText,
        getErgebnisseASPerformanceText,
        getErgebnisseLiteraturT2PerformanceText,
        getErgebnisseOptimierteT2PerformanceText,
        getErgebnisseVergleichPerformanceText
    });

})();
