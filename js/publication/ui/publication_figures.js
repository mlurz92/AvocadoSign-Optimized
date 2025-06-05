const publicationFigures = (() => {

    function _findConfigById(id) {
        if (!id || typeof id !== 'string') return null;
        for (const sectionKey in PUBLICATION_CONFIG.publicationElements) {
            if (Object.prototype.hasOwnProperty.call(PUBLICATION_CONFIG.publicationElements, sectionKey)) {
                for (const elementKey in PUBLICATION_CONFIG.publicationElements[sectionKey]) {
                    if (Object.prototype.hasOwnProperty.call(PUBLICATION_CONFIG.publicationElements[sectionKey], elementKey) &&
                        PUBLICATION_CONFIG.publicationElements[sectionKey][elementKey].id === id) {
                        return PUBLICATION_CONFIG.publicationElements[sectionKey][elementKey];
                    }
                }
            }
        }
        return null;
    }

    function _generateFigureShell(figureConfig, lang, specificFigureData = null) {
        if (!figureConfig || !figureConfig.id || !figureConfig.radiologyLabel) {
            return `<p class="text-danger">${lang === 'de' ? 'Abbildungskonfiguration unvollständig.' : 'Figure configuration incomplete.'}</p>`;
        }

        const title = lang === 'de' ? (figureConfig.titleDe || figureConfig.titleEn) : (figureConfig.titleEn || figureConfig.titleDe);
        let legend = lang === 'de' ? (figureConfig.legendDe || figureConfig.legendEn) : (figureConfig.legendEn || figureConfig.legendDe);
        
        if (specificFigureData && legend) {
            if (specificFigureData.kollektivName && legend.includes('{KOLLEKTIV_NAME}')) {
                legend = legend.replace(/{KOLLEKTIV_NAME}/g, getKollektivDisplayName(specificFigureData.kollektivName));
            }
            if (specificFigureData.bfMetricName && legend.includes('{BF_METRIC_NAME}')) {
                 legend = legend.replace(/{BF_METRIC_NAME}/g, specificFigureData.bfMetricName);
            }
            if (specificFigureData.nPat && legend.includes('{N_PAT}')) {
                legend = legend.replace(/{N_PAT}/g, radiologyFormatter.formatRadiologyNumber(specificFigureData.nPat, 0));
            }
        }
        
        const fullCaption = radiologyFormatter.formatRadiologyFigureLegend(figureConfig, lang, legend);

        let html = `<div class="publication-figure-container mt-4 mb-5" id="${figureConfig.id}-container">`;
        html += `<div class="figure-content border rounded p-2" id="${figureConfig.id}-chart-area" style="min-height: 250px; display: flex; align-items: center; justify-content: center; background-color: #f8f9fa;">`;
        html += `<p class="text-muted small figure-placeholder">${lang === 'de' ? `Platzhalter für ${figureConfig.radiologyLabel}` : `Placeholder for ${figureConfig.radiologyLabel}`}</p>`;
        html += `</div>`;
        html += `<p class="publication-figure-legend small mt-1"><em>${fullCaption}</em></p>`;
        html += `</div>`;
        return html;
    }


    function renderFlowDiagram(aggregatedData, lang = 'de') {
        const figureConfig = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram;
        const title = lang === 'de' ? figureConfig.titleDe : figureConfig.titleEn;
        const legend = lang === 'de' ? figureConfig.legendDe : figureConfig.legendEn;
        const fullCaption = radiologyFormatter.formatRadiologyFigureLegend(figureConfig, lang, legend);
        const nGesamt = aggregatedData?.common?.nGesamt || 0;
        const nDirektOP = aggregatedData?.common?.nDirektOP || 0;
        const nNRCT = aggregatedData?.common?.nNRCT || 0;
        
        // Simplified SVG for placeholder - actual complex SVG should be a separate component or file
        const svgFlowchart = `
            <svg width="100%" viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" style="display: block; max-width: 500px; margin: auto;">
                <style>
                    .node { fill: #f0f8ff; stroke: #4682b4; stroke-width: 1px; }
                    .node-main { fill: #e0f0ff; stroke: #2a628a; stroke-width: 1.5px; }
                    .arrow { stroke: #333; stroke-width: 1.5px; fill: none; marker-end: url(#arrowhead-${figureConfig.id}); }
                    .label { font-family: sans-serif; font-size: 12px; fill: #333; text-anchor: middle; }
                    .label-small { font-size: 10px; fill: #555; text-anchor: middle; }
                </style>
                <defs>
                    <marker id="arrowhead-${figureConfig.id}" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto" markerUnits="strokeWidth">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
                    </marker>
                </defs>
                <rect class="node-main" x="150" y="20" width="200" height="40" rx="5" ry="5"/>
                <text class="label" x="250" y="45">${lang === 'de' ? 'Patienten rekrutiert' : 'Patients Recruited'} (N=${radiologyFormatter.formatRadiologyNumber(nGesamt,0)})</text>
                <line class="arrow" x1="250" y1="60" x2="250" y2="100"/>
                <rect class="node" x="150" y="100" width="200" height="40" rx="5" ry="5"/>
                <text class="label" x="250" y="125">${lang === 'de' ? 'Baseline MRT' : 'Baseline MRI'} (N=${radiologyFormatter.formatRadiologyNumber(nGesamt,0)})</text>
                <line class="arrow" x1="250" y1="140" x2="150" y2="180"/>
                <line class="arrow" x1="250" y1="140" x2="350" y2="180"/>
                <rect class="node" x="50" y="180" width="200" height="40" rx="5" ry="5"/>
                <text class="label" x="150" y="205">${lang === 'de' ? 'Primäre Operation' : 'Upfront Surgery'} (N=${radiologyFormatter.formatRadiologyNumber(nDirektOP,0)})</text>
                <rect class="node" x="250" y="180" width="200" height="40" rx="5" ry="5"/>
                <text class="label" x="350" y="205">${lang === 'de' ? 'Neoadjuvante Therapie' : 'Neoadjuvant Therapy'} (N=${radiologyFormatter.formatRadiologyNumber(nNRCT,0)})</text>
                <line class="arrow" x1="350" y1="220" x2="350" y2="260"/>
                <rect class="node" x="250" y="260" width="200" height="40" rx="5" ry="5"/>
                <text class="label" x="350" y="285">${lang === 'de' ? 'Restaging MRT & OP' : 'Restaging MRI & Surgery'}</text>
                <line class="arrow" x1="150" y1="220" x2="250" y2="330"/>
                <line class="arrow" x1="350" y1="300" x2="250" y2="330"/>
                <rect class="node-main" x="150" y="330" width="200" height="40" rx="5" ry="5"/>
                <text class="label" x="250" y="355">${lang === 'de' ? 'Finale Analyse' : 'Final Analysis'} (N=${radiologyFormatter.formatRadiologyNumber(nGesamt,0)})</text>
            </svg>
        `;

        let html = `<div class="publication-figure-container mt-4 mb-5" id="${figureConfig.id}-container">`;
        html += `<div class="figure-content border rounded p-2" id="${figureConfig.id}-chart-area" style="background-color: #f8f9fa;">${svgFlowchart}</div>`;
        html += `<p class="publication-figure-legend small mt-1"><em>${fullCaption}</em></p>`;
        html += `</div>`;
        return html;
    }

    function renderAgeDistributionChart(aggregatedData, lang = 'de') {
        const figureConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart;
        const specificData = {
            nPat: aggregatedData?.common?.demographicsGesamt?.patientCount
        };
        return _generateFigureShell(figureConfig, lang, specificData);
    }

    function renderGenderDistributionChart(aggregatedData, lang = 'de') {
        const figureConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart;
         const specificData = {
            nPat: aggregatedData?.common?.demographicsGesamt?.patientCount
        };
        return _generateFigureShell(figureConfig, lang, specificData);
    }

    function renderComparisonPerformanceChart(kollektivId, aggregatedData, lang = 'de') {
        const common = aggregatedData.common;
        const bfZielMetricKey = common.targetBruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        let bfZielMetricDisplay = bfZielMetricKey;
        const metricOption = PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === bfZielMetricKey);
        if (metricOption) {
            bfZielMetricDisplay = lang === 'de' ? metricOption.labelDe : metricOption.labelEn;
        }
        
        let figureConfigKey;
        if (kollektivId === 'Gesamt') figureConfigKey = 'vergleichPerformanceChartGesamt';
        else if (kollektivId === 'direkt OP') figureConfigKey = 'vergleichPerformanceChartdirektOP';
        else if (kollektivId === 'nRCT') figureConfigKey = 'vergleichPerformanceChartnRCT';
        else return `<p class="text-danger">Unbekannter Kollektiv-ID für Vergleichschart: ${kollektivId}</p>`;

        const figureConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse[figureConfigKey];
        const nPat = aggregatedData.allKollektivStats[kollektivId]?.deskriptiv?.anzahlPatienten;

        const specificData = {
            kollektivName: kollektivId,
            bfMetricName: bfZielMetricDisplay,
            nPat: nPat
        };
        return _generateFigureShell(figureConfig, lang, specificData);
    }


    return Object.freeze({
        renderFlowDiagram,
        renderAgeDistributionChart,
        renderGenderDistributionChart,
        renderComparisonPerformanceChart
    });

})();
