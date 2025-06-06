const publicationFigureGeneratorRadiology = (() => {

    function _getSafeLink(elementId, text, lang = 'de') {
        const config = PUBLICATION_CONFIG.publicationElements;
        let refText = text;

        for (const sectionKey in config) {
            for (const elKey in config[sectionKey]) {
                if (config[sectionKey][elKey].id === elementId) {
                    refText = lang === 'de' ? config[sectionKey][elKey].referenceInTextDe : config[sectionKey][elKey].referenceInTextEn;
                    break;
                }
            }
        }
        if (!elementId) return refText || text || '';
        return `<a href="#${elementId}">${refText || text || elementId}</a>`;
    }

    function _findConfigById(id) {
        if (!id || typeof id !== 'string') return null;
        for (const sectionKey in PUBLICATION_CONFIG.publicationElements) {
            if (PUBLICATION_CONFIG.publicationElements.hasOwnProperty(sectionKey)) {
                const section = PUBLICATION_CONFIG.publicationElements[sectionKey];
                for (const elementKey in section) {
                    if (section.hasOwnProperty(elementKey) && section[elementKey] && section[elementKey].id === id) {
                        return section[elementKey];
                    }
                }
            }
        }
        return null;
    }

    function _renderFlowDiagramRadiology(allKollektivStats, lang) {
        const gesamtData = allKollektivStats?.Gesamt?.deskriptiv;
        const direktOPData = allKollektivStats?.['direkt OP']?.deskriptiv;
        const nRCTData = allKollektivStats?.nRCT?.deskriptiv;

        const totalPatients = gesamtData?.anzahlPatienten || 0;
        const direktOPPatients = direktOPData?.anzahlPatienten || 0;
        const nRCTPatients = nRCTData?.anzahlPatienten || 0;
        const ausgeschlossenBaseline = (typeof patientDataRaw !== 'undefined' ? patientDataRaw.length : totalPatients) - totalPatients; 


        const figureConfig = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram;
        const title = lang === 'de' ? figureConfig.titleDe : figureConfig.titleEn;
        const figRefText = lang === 'de' ? figureConfig.referenceInTextDe : figureConfig.referenceInTextEn;
        const id = figureConfig.id;

        const anzahlPatientenUrsprünglich = typeof patientDataRaw !== 'undefined' ? patientDataRaw.length : 'N/A';
        const anzahlAusgeschlossenInitial = (typeof patientDataRaw !== 'undefined' && gesamtData) ? patientDataRaw.length - gesamtData.anzahlPatienten : 0;

        let flowHtml = `<div class="publication-figure my-4" id="${id}">`;
        flowHtml += `<h6 class="figure-title text-center small">${figRefText}</h6>`;
        flowHtml += `<div class="flow-diagram-container" style="max-width: 700px; margin: auto; padding: 10px; border: 1px solid #dee2e6; border-radius: var(--border-radius-sm); background-color: #fff; text-align: center;">
                <svg width="100%" viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" style="display: block; font-family: Arial, sans-serif;">
                    <style>
                        .node { fill: #f0f8ff; stroke: #4682b4; stroke-width: 1.5px; }
                        .node-main { fill: #e6f3ff; stroke: #2a628a; stroke-width: 2px; }
                        .arrow { stroke: #333; stroke-width: 1.5px; fill: none; marker-end: url(#arrowhead); }
                        .label { font-size: 13px; fill: #333; text-anchor: middle; dominant-baseline: central; }
                        .label-count { font-size: 12px; fill: #111; font-weight: bold;}
                        .label-small { font-size: 11px; fill: #555; }
                    </style>
                    <defs>
                        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto-start-reverse">
                            <polygon points="0 0, 8 3, 0 6" fill="#333" />
                        </marker>
                    </defs>

                    <rect class="node-main" x="150" y="20" width="300" height="60" rx="5" ry="5"/>
                    <text class="label" x="300" y="40">${lang === 'de' ? 'Potenziell geeignete Patienten mit Rektumkarzinom' : 'Potentially Eligible Patients with Rectal Cancer'}</text>
                    <text class="label-count" x="300" y="60">n = ${anzahlPatientenUrsprünglich}</text>

                    <line class="arrow" x1="300" y1="80" x2="300" y2="120"/>
                    <text class="label-small" x="360" y="100">${anzahlAusgeschlossenInitial > 0 ? (lang === 'de' ? `${anzahlAusgeschlossenInitial} ausgeschlossen` : `${anzahlAusgeschlossenInitial} excluded`) : ''}</text>
                    ${anzahlAusgeschlossenInitial > 0 ? '<text class="label-small" x="360" y="112">${lang === "de" ? "(z.B. keine OP, M1)" : "(e.g. no surgery, M1)"}</text>' : ''}


                    <rect class="node" x="150" y="120" width="300" height="60" rx="5" ry="5"/>
                    <text class="label" x="300" y="140">${lang === 'de' ? 'In Studie eingeschlossene Patienten' : 'Patients Enrolled in Study'}</text>
                    <text class="label-count" x="300" y="160">n = ${totalPatients}</text>

                    <line class="arrow" x1="300" y1="180" x2="175" y2="220"/>
                    <line class="arrow" x1="300" y1="180" x2="425" y2="220"/>

                    <rect class="node-main" x="50" y="220" width="250" height="60" rx="5" ry="5"/>
                    <text class="label" x="175" y="240">${lang === 'de' ? 'Primärchirurgie (Direkt-OP Gruppe)' : 'Upfront Surgery (Upfront OP Group)'}</text>
                    <text class="label-count" x="175" y="260">n = ${direktOPPatients}</text>

                    <rect class="node-main" x="325" y="220" width="250" height="60" rx="5" ry="5"/>
                    <text class="label" x="450" y="240">${lang === 'de' ? 'Neoadjuvante Radiochemotherapie (nRCT Gruppe)' : 'Neoadjuvant Chemoradiotherapy (nRCT Group)'}</text>
                    <text class="label-count" x="450" y="260">n = ${nRCTPatients}</text>

                    <line class="arrow" x1="450" y1="280" x2="450" y2="320"/>

                    <rect class="node" x="325" y="320" width="250" height="60" rx="5" ry="5"/>
                    <text class="label" x="450" y="340">${lang === 'de' ? 'Restaging-MRT nach nRCT' : 'Restaging MRI after nRCT'}</text>
                    <text class="label-count" x="450" y="360">n = ${nRCTPatients}</text>
                    <text class="label-small" x="450" y="385" dy="0.3em">${lang === 'de' ? '(Avocado Sign auf Restaging-MRT bewertet)' : '(Avocado Sign assessed on Restaging MRI)'}</text>

                    <line class="arrow" x1="175" y1="280" x2="300" y2="420"/>
                    <line class="arrow" x1="450" y1="380" x2="300" y2="420"/>

                    <rect class="node-main" x="150" y="420" width="300" height="60" rx="5" ry="5"/>
                    <text class="label" x="300" y="440">${lang === 'de' ? 'Patienten in finaler Analyse' : 'Patients in Final Analysis'}</text>
                    <text class="label-count" x="300" y="460">n = ${totalPatients}</text>
                </svg>
            </div>
            <p class="small text-muted mt-2 text-center">
                <strong>${figRefText}.</strong> ${lang === 'de' ? `Flussdiagramm der Patientenrekrutierung und -analyse. Die Zahlen basieren auf dem in der Anwendung verwendeten Datensatz (Gesamtzahl ursprünglich evaluiert n=${anzahlPatientenUrsprünglich}, in Analyse eingeschlossen n=${totalPatients}).` : `Patient recruitment and analysis flowchart. Numbers are based on the dataset used in the application (total initially evaluated n=${anzahlPatientenUrsprünglich}, included in analysis n=${totalPatients}).`} ${lang === 'de' ? 'OP = Operation, nRCT = neoadjuvante Radiochemotherapie, MRT = Magnetresonanztomographie.' : 'OP = surgery, nRCT = neoadjuvant chemoradiotherapy, MRI = magnetic resonance imaging.'}
            </p>
        </div>`;
        return flowHtml;
    }

    function _renderAgeDistributionChartRadiology(ageData, targetElementId, options = {}, lang = 'de') {
        const figureConfig = _findConfigById(targetElementId);
        const chartTitle = figureConfig ? (lang === 'de' ? figureConfig.titleDe : figureConfig.titleEn) : (lang === 'de' ? 'Altersverteilung' : 'Age Distribution');
        const figRefText = figureConfig ? (lang === 'de' ? figureConfig.referenceInTextDe : figureConfig.referenceInTextEn) : '';
        const kollektivName = getKollektivDisplayName("Gesamt");

        const chartHtml = `
            <div class="chart-container border rounded p-2 publication-figure" id="${targetElementId}">
                <div id="${targetElementId}-chart-area" style="min-height: ${options.height || 220}px;">
                    <p class="text-center text-muted small p-3">${lang === 'de' ? 'Lade Altersverteilungsdiagramm...' : 'Loading age distribution chart...'}</p>
                </div>
                <p class="small text-muted mt-2 text-center">
                    <strong>${figRefText}.</strong> ${chartTitle}. ${lang === 'de' ? `Histogramm der Altersverteilung der ${_formatTableCell(ageData?.length || 0,0,lang,{isCount:true})} Patienten im Gesamtkollektiv. Medianes Alter: ${_formatTableCell(statisticsService.calculateDescriptiveStats(ageData.map(age => ({alter:age}))).alter?.median,0,lang)} Jahre (IQR: ${_formatTableCell(statisticsService.calculateDescriptiveStats(ageData.map(age => ({alter:age}))).alter?.q1,0,lang)}–${_formatTableCell(statisticsService.calculateDescriptiveStats(ageData.map(age => ({alter:age}))).alter?.q3,0,lang)} Jahre).` : `Histogram of age distribution for the ${_formatTableCell(ageData?.length || 0,0,lang,{isCount:true})} patients in the overall cohort. Median age: ${_formatTableCell(statisticsService.calculateDescriptiveStats(ageData.map(age => ({alter:age}))).alter?.median,0,lang)} years (IQR: ${_formatTableCell(statisticsService.calculateDescriptiveStats(ageData.map(age => ({alter:age}))).alter?.q1,0,lang)}–${_formatTableCell(statisticsService.calculateDescriptiveStats(ageData.map(age => ({alter:age}))).alter?.q3,0,lang)} years).`} ${lang === 'de' ? 'IQR = Interquartilsabstand.' : 'IQR = interquartile range.'}
                </p>
            </div>
        `;
        return chartHtml;
    }

    function _renderGenderDistributionChartRadiology(genderStats, targetElementId, options = {}, lang = 'de') {
        const figureConfig = _findConfigById(targetElementId);
        const chartTitle = figureConfig ? (lang === 'de' ? figureConfig.titleDe : figureConfig.titleEn) : (lang === 'de' ? 'Geschlechterverteilung' : 'Gender Distribution');
        const figRefText = figureConfig ? (lang === 'de' ? figureConfig.referenceInTextDe : figureConfig.referenceInTextEn) : '';
        const totalPatients = (genderStats?.m || 0) + (genderStats?.f || 0) + (genderStats?.unbekannt || 0);

        const chartHtml = `
            <div class="chart-container border rounded p-2 publication-figure" id="${targetElementId}">
                 <div id="${targetElementId}-chart-area" style="min-height: ${options.height || 220}px;">
                    <p class="text-center text-muted small p-3">${lang === 'de' ? 'Lade Geschlechterverteilungsdiagramm...' : 'Loading gender distribution chart...'}</p>
                 </div>
                 <p class="small text-muted mt-2 text-center">
                    <strong>${figRefText}.</strong> ${chartTitle}. ${lang === 'de' ? `Verteilung der ${_formatTableCell(totalPatients,0,lang,{isCount:true})} Patienten im Gesamtkollektiv nach Geschlecht: ${_formatTableCell(genderStats?.m || 0,0,lang,{isCount:true})} männlich (${_formatPercentForPub(genderStats?.m, totalPatients, 0, lang)}), ${_formatTableCell(genderStats?.f || 0,0,lang,{isCount:true})} weiblich (${_formatPercentForPub(genderStats?.f, totalPatients, 0, lang)})${genderStats?.unbekannt > 0 ? `, ${_formatTableCell(genderStats?.unbekannt,0,lang,{isCount:true})} unbekannt (${_formatPercentForPub(genderStats?.unbekannt, totalPatients, 0, lang)})` : ''}.` : `Distribution of the ${_formatTableCell(totalPatients,0,lang,{isCount:true})} patients in the overall cohort by sex: ${_formatTableCell(genderStats?.m || 0,0,lang,{isCount:true})} male (${_formatPercentForPub(genderStats?.m, totalPatients, 0, lang)}), ${_formatTableCell(genderStats?.f || 0,0,lang,{isCount:true})} female (${_formatPercentForPub(genderStats?.f, totalPatients, 0, lang)})${genderStats?.unbekannt > 0 ? `, ${_formatTableCell(genderStats?.unbekannt,0,lang,{isCount:true})} unknown (${_formatPercentForPub(genderStats?.unbekannt, totalPatients, 0, lang)})` : ''}.`}
                 </p>
            </div>
        `;
        return chartHtml;
    }

    function _renderComparisonPerformanceChartRadiology(kolId, chartDataComp, targetElementId, options = {}, t2Label = 'T2', lang = 'de') {
        const figureConfig = _findConfigById(targetElementId);
        const displayNameKollektiv = getKollektivDisplayName(kolId);
        let chartTitle = figureConfig ? (lang === 'de' ? figureConfig.titleDe : figureConfig.titleEn) : (lang === 'de' ? `Vergleichsmetriken für ${displayNameKollektiv}` : `Comparative Metrics for ${displayNameKollektiv}`);
        chartTitle = chartTitle.replace('{BF_METRIC}', options.bfMetricName || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication);

        const chartLetterMap = { 'Gesamt': 'a', 'direkt OP': 'b', 'nRCT': 'c' };
        const chartLetter = chartLetterMap[kolId] || '';
        const figRefText = lang === 'de' ? `Abbildung Ergebnisse 2${chartLetter}` : `Results Figure 2${chartLetter}`;
        const nPatForKollektiv = options.nPat || 'N/A';

        const chartHtml = `
            <div class="chart-container border rounded p-2 publication-figure" id="${targetElementId}">
                 <div id="${targetElementId}-chart-area" style="min-height: ${options.height || 250}px;">
                     <p class="text-center text-muted small p-3">${lang === 'de' ? `Lade Vergleichsdiagramm für ${displayNameKollektiv}...` : `Loading comparison chart for ${displayNameKollektiv}...`}</p>
                 </div>
                 <p class="small text-muted mt-2 text-center">
                    <strong>${figRefText}.</strong> ${chartTitle}. ${lang === 'de' ? `Balkendiagramm zum Vergleich der diagnostischen Gütekriterien zwischen Avocado Sign (AS) und optimierten T2-Kriterien (für ${options.bfMetricName || 'Balanced Accuracy'}) im Kollektiv ${displayNameKollektiv} (n=${_formatTableCell(nPatForKollektiv,0,lang,{isCount:true})}). Sens = Sensitivität, Spez = Spezifität, PPV = Positiver Prädiktiver Wert, NPV = Negativer Prädiktiver Wert, Acc = Accuracy, AUC = Fläche unter der Kurve.` : `Bar chart comparing diagnostic performance metrics between Avocado Sign (AS) and optimized T2 criteria (for ${options.bfMetricName || 'Balanced Accuracy'}) in the ${displayNameKollektiv} cohort (n=${_formatTableCell(nPatForKollektiv,0,lang,{isCount:true})}). Sens = sensitivity, Spez = specificity, PPV = positive predictive value, NPV = negative predictive value, Acc = accuracy, AUC = area under the curve.`}
                 </p>
            </div>
        `;
        return chartHtml;
    }

    return Object.freeze({
        renderFlowDiagramRadiology: _renderFlowDiagramRadiology,
        renderAgeDistributionChartRadiology: _renderAgeDistributionChartRadiology,
        renderGenderDistributionChartRadiology: _renderGenderDistributionChartRadiology,
        renderComparisonPerformanceChartRadiology: _renderComparisonPerformanceChartRadiology
    });

})();
