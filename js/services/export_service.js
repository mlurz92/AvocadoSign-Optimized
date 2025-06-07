const exportService = (() => {

    function _generateFilename(type, kollektiv, extension, chartName = null, tableName = null) {
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(kollektiv).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        let filename = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeKollektiv).replace('{DATE}', dateStr).replace('{EXT}', extension);

        if (chartName) {
            filename = filename.replace('{ChartName}', chartName.replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_'));
        }
        if (tableName) {
            filename = filename.replace('{TableName}', tableName.replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_'));
        }
        if (APP_CONFIG.EXPORT_SETTINGS.INCLUDE_TIMESTAMP_IN_FILENAME) {
            filename = filename.replace('.{EXT}', `_${Date.now()}.{EXT}`);
        }
        return filename;
    }

    async function exportToCSV(data, filename = 'export.csv') {
        if (!Array.isArray(data) || data.length === 0) {
            ui_helpers.showToast(APP_CONFIG.UI_TEXTS.exportTab.noDataToExport, 'warning');
            return;
        }
        try {
            const csv = Papa.unparse(data, {
                delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER,
                header: true,
                quotes: true
            });
            _downloadFile(csv, filename, 'text/csv');
        } catch (e) {
            ui_helpers.showToast(`${APP_CONFIG.UI_TEXTS.exportTab.exportError}: ${e.message}`, 'danger');
        }
    }

    async function exportToMarkdown(markdownContent, filename = 'export.md') {
        if (!markdownContent || markdownContent.trim() === '') {
            ui_helpers.showToast(APP_CONFIG.UI_TEXTS.exportTab.noDataToExport, 'warning');
            return;
        }
        _downloadFile(markdownContent, filename, 'text/markdown');
    }

    async function exportToText(textContent, filename = 'export.txt') {
        if (!textContent || textContent.trim() === '') {
            ui_helpers.showToast(APP_CONFIG.UI_TEXTS.exportTab.noDataToExport, 'warning');
            return;
        }
        _downloadFile(textContent, filename, 'text/plain');
    }

    async function exportToPNG(elementId, filename = 'export.png', scale = APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE) {
        const element = document.getElementById(elementId);
        if (!element) {
            ui_helpers.showToast(APP_CONFIG.UI_TEXTS.exportTab.elementNotFound.replace('{ID}', elementId), 'warning');
            return;
        }
        try {
            const dpi = 96 * scale; // Adjust DPI for better quality
            const options = {
                scale: scale,
                width: element.offsetWidth,
                height: element.offsetHeight,
                backgroundColor: null, // Transparent background by default
                dpi: dpi,
                useCORS: true, // Allow cross-origin images
                logging: false
            };

            const canvas = await html2canvas(element, options);
            const dataUrl = canvas.toDataURL('image/png');
            _downloadFile(dataUrl, filename, 'image/png');
        } catch (e) {
            ui_helpers.showToast(`${APP_CONFIG.UI_TEXTS.exportTab.imageExportError}: ${e.message}`, 'danger');
            console.error("PNG export error:", e);
        }
    }

    async function exportToSVG(elementId, filename = 'export.svg') {
        const svgElement = document.getElementById(elementId)?.querySelector('svg');
        if (!svgElement) {
            ui_helpers.showToast(APP_CONFIG.UI_TEXTS.exportTab.svgNotFound.replace('{ID}', elementId), 'warning');
            return;
        }
        try {
            const svgString = new XMLSerializer().serializeToString(svgElement);
            // Add XML declaration
            const finalSvgString = `<?xml version="1.0" standalone="no"?>\n${svgString}`;
            _downloadFile(finalSvgString, filename, 'image/svg+xml');
        } catch (e) {
            ui_helpers.showToast(`${APP_CONFIG.UI_TEXTS.exportTab.svgExportError}: ${e.message}`, 'danger');
        }
    }

    function _downloadFile(data, filename, mimeType) {
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function exportComprehensiveReport(processedData, currentKollektiv, bruteForceResults) {
        const currentLang = state.getCurrentPublikationLang();
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
        const appliedLogic = t2CriteriaManager.getAppliedLogic();
        const allStats = statisticsService.calculateAllStatsForPublication(state.getRawData(), appliedCriteria, appliedLogic, bruteForceResults);

        const context = {
            processedData: processedData,
            rawData: state.getRawData(),
            allStats: allStats,
            appliedT2Criteria: appliedCriteria,
            appliedT2Logic: appliedLogic,
            bruteForceResults: bruteForceResults,
            currentLanguage: currentLang,
            currentBruteForceMetric: bruteForceResults?.metric || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC,
            kollektivNames: APP_CONFIG.UI_TEXTS.kollektivDisplayNames,
            specialIds: APP_CONFIG.SPECIAL_IDS
        };

        const reportTitle = APP_CONFIG.REPORT_SETTINGS.REPORT_TITLE;
        const reportAuthor = `${APP_CONFIG.APP_AUTHOR} (${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION})`;
        const generationTimestamp = new Date().toLocaleString(currentLang === 'de' ? 'de-DE' : 'en-US', { dateStyle: 'full', timeStyle: 'medium' });
        
        let reportHTML = `<!DOCTYPE html>
<html lang="${currentLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportTitle}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 20px; }
        .container { max-width: 900px; margin: auto; padding: 20px; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1, h2, h3, h4, h5, h6 { color: #0056b3; margin-top: 20px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .text-end { text-align: right; }
        .text-center { text-align: center; }
        .small { font-size: 0.85em; }
        .alert { padding: 10px; margin-bottom: 15px; border-radius: 5px; }
        .alert-info { background-color: #d1ecf1; border-color: #bee5eb; color: #0c5460; }
        .figure-container { margin-top: 20px; margin-bottom: 20px; text-align: center; }
        .figure-container svg { max-width: 100%; height: auto; }
        .figure-caption { font-size: 0.9em; color: #555; margin-top: 5px; }
        .section-header { border-bottom: 2px solid #0056b3; padding-bottom: 5px; margin-bottom: 15px; }
        .citation { font-size: 0.8em; color: #777; }
        footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 0.8em; color: #777; }
        @media print {
            .container { border: none; box-shadow: none; }
            body { margin: 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="text-center mb-4">
            <h1>${reportTitle}</h1>
            <p class="lead">${reportAuthor}</p>
            <p class="text-muted small">${lang === 'de' ? 'Generiert am' : 'Generated on'}: ${generationTimestamp}</p>
            <hr>
        </header>

        <section class="mb-4">
            <h2 class="section-header">${lang === 'de' ? 'Zusammenfassung der Konfiguration' : 'Configuration Summary'}</h2>
            <p><strong>${lang === 'de' ? 'Aktuell gewähltes Kollektiv' : 'Currently Selected Cohort'}:</strong> ${getKollektivDisplayName(currentKollektiv)}</p>
            <p><strong>${lang === 'de' ? 'Angewandte T2-Kriterien' : 'Applied T2 Criteria'}:</strong> ${t2CriteriaManager.getAppliedLogic().toUpperCase()} - ${studyT2CriteriaManager.formatCriteriaForDisplay(t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), false, lang)}</p>
            ${bruteForceResults?.bestResult ? `
                <p><strong>${lang === 'de' ? 'Beste Brute-Force Kriterien ({BF_METRIC})' : 'Best Brute-Force Criteria ({BF_METRIC})'}:</strong> ${bruteForceResults.bestResult.logic.toUpperCase()} - ${studyT2CriteriaManager.formatCriteriaForDisplay(bruteForceResults.bestResult.criteria, bruteForceResults.bestResult.logic, false, lang)} (${lang === 'de' ? 'Wert' : 'Value'}: ${formatNumber(bruteForceResults.bestResult.metricValue, 4, '--', true, lang)})</p>
            `.replace('{BF_METRIC}', context.currentBruteForceMetric) : ''}
        </section>
        
        <section class="mb-4">
            <h2 class="section-header">${lang === 'de' ? 'Patientencharakteristika' : 'Patient Characteristics'}</h2>
            ${publicationTables.generateResultsPatientCharacteristicsTable(context)}
            <div id="report-age-chart-container" class="figure-container"></div>
            <div id="report-gender-chart-container" class="figure-container"></div>
        </section>

        <section class="mb-4">
            <h2 class="section-header">${lang === 'de' ? 'Diagnostische Güte: Avocado Sign' : 'Diagnostic Performance: Avocado Sign'}</h2>
            ${publicationTables.generateResultsPerformanceTable(context, APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID, 'diagnostischeGueteASTabelle', 'diagnostischeGueteASTabelle', 'diagnostischeGueteASTabelle')}
        </section>

        <section class="mb-4">
            <h2 class="section-header">${lang === 'de' ? 'Diagnostische Güte: Literatur-basierte T2-Kriterien' : 'Diagnostic Performance: Literature-Based T2 Criteria'}</h2>
            ${publicationTables.generateResultsLiteratureT2PerformanceTable(context)}
        </section>

        <section class="mb-4">
            <h2 class="section-header">${lang === 'de' ? 'Diagnostische Güte: Brute-Force optimierte T2-Kriterien' : 'Diagnostic Performance: Brute-Force Optimized T2 Criteria'}</h2>
            ${publicationTables.generateResultsPerformanceTable(context, 'optimized_t2', 'diagnostischeGueteOptimierteT2Tabelle', 'diagnostischeGueteOptimierteT2Tabelle', 'diagnostischeGueteOptimierteT2Tabelle')}
        </section>

        <section class="mb-4">
            <h2 class="section-header">${lang === 'de' ? 'Statistischer Vergleich: AS vs. T2-Kriterien' : 'Statistical Comparison: AS vs. T2 Criteria'}</h2>
            ${publicationTables.generateResultsComparisonTable(context)}
            <div id="report-comparison-chart-gesamt-container" class="figure-container"></div>
            <div id="report-comparison-chart-direkt-op-container" class="figure-container"></div>
            <div id="report-comparison-chart-nrct-container" class="figure-container"></div>
        </section>

        <footer>
            ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION} | ${APP_CONFIG.APP_AUTHOR} | ${APP_CONFIG.APP_CONTACT_EMAIL}
        </footer>
    </div>
</body>
</html>`;

        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.COMPREHENSIVE_REPORT_HTML, currentKollektiv, 'html');
        _downloadFile(reportHTML, filename, 'text/html');

        // Render charts into the generated HTML.
        // This is a bit tricky as charts are SVG. We need to render them first, then get their SVG string.
        // For the purpose of immediate HTML export, we can render the chart and then inject the SVG directly.
        // This requires the chart rendering to happen *after* the HTML structure is in the DOM temporarily.
        // To simplify, for this use case, we will add placeholders and note that SVG export needs separate handling.
        // Alternatively, if the HTML report is always for *viewing*, we can rely on external libraries for rendering.
        // For a self-contained HTML, it would involve embedding SVG or base64 images.
        // Given the request for "Radiology"-perfect, embedding SVG is preferred.

        // To achieve SVG embedding in the HTML report, we'd need to:
        // 1. Create a temporary, hidden div in the main document.
        // 2. Render each chart into this hidden div using chartRenderer.
        // 3. Get the SVG string from the rendered chart.
        // 4. Replace the placeholder div in reportHTML with the actual SVG string.
        // This would make this function quite complex. For now, I will generate the HTML with placeholders
        // and mention that charts would need to be embedded or exported separately for full report.
        // The current method assumes the HTML report is primarily for content viewing, not for editable graphics.

        // Re-checking requirements: "Entwurf hilfreicher, publikationsfähiger Diagramme und Tabellen (inkl. optimaler Formate, Proportionen, Download-Funktionen als SVG/PNG), welche allesamt den vom Journal "Radiology" geforderten Layout und Format entsprechen."
        // "Sicherstellung maximaler Unterstützung bei Datenauswertung für Publikationen/Präsentationen."
        // For a full HTML report, embedding actual SVG or PNG data URLs is the best approach.
        // Let's adjust the logic to create hidden divs, render charts, get SVG, and inject into the HTML report string.

        // Create temporary container for chart rendering
        const tempChartRenderContainer = document.createElement('div');
        tempChartRenderContainer.style.position = 'absolute';
        tempChartRenderContainer.style.left = '-9999px';
        tempChartRenderContainer.style.width = APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH + 'px';
        tempChartRenderContainer.style.height = APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT + 'px';
        document.body.appendChild(tempChartRenderContainer);

        const getChartSVG = (chartId, chartFn, data, options) => {
            const tempId = `temp-chart-${chartId}`;
            tempChartRenderContainer.id = tempId; // Reuse the temp container
            chartFn(data, tempId, options);
            const svgElement = document.getElementById(tempId)?.querySelector('svg');
            if (svgElement) {
                const svgString = new XMLSerializer().serializeToString(svgElement);
                return `<div class="figure-container"><div style="width:100%; max-width:${options.width || APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH}px; margin:auto;">${svgString}</div></div>`;
            }
            return `<p class="text-muted small text-center">${currentLang === 'de' ? 'Diagramm konnte nicht generiert werden.' : 'Chart could not be generated.'}</p>`;
        };

        const chartWidth = APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH + 150;
        const chartHeight = APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT + 50;

        // Age Distribution Chart
        const ageChartHtmlReport = getChartSVG('report-age-chart', chartRenderer.renderAgeDistributionChart, context.allStats.Gesamt.alterData, {
            width: chartWidth,
            height: chartHeight,
            margin: { top: 20, right: 20, bottom: 50, left: 50 }
        });
        reportHTML = reportHTML.replace('<div id="report-age-chart-container" class="figure-container"></div>', ageChartHtmlReport);

        // Gender Distribution Chart
        const genderChartHtmlReport = getChartSVG('report-gender-chart', chartRenderer.renderPieChart, [
            { label: currentLang === 'de' ? APP_CONFIG.UI_TEXTS.legendLabels.male : 'Male', value: context.allStats.Gesamt.geschlecht.m },
            { label: currentLang === 'de' ? APP_CONFIG.UI_TEXTS.legendLabels.female : 'Female', value: context.allStats.Gesamt.geschlecht.f }
        ], {
            width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50,
            height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50,
            margin: { top: 20, right: 20, bottom: 20, left: 20 },
            legendBelow: true,
            outerRadiusFactor: 0.8
        });
        reportHTML = reportHTML.replace('<div id="report-gender-chart-container" class="figure-container"></div>', genderChartHtmlReport);

        const metricsToCompare = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'];
        const getChartDataForReport = (stats, lang) => {
            if (!stats?.gueteAS || !stats?.gueteT2_bruteforce) return [];
            return metricsToCompare.map(metricKey => {
                const asVal = stats.gueteAS?.[metricKey]?.value ?? NaN;
                const t2Val = stats.gueteT2_bruteforce?.[metricKey]?.value ?? NaN;
                let displayName = APP_CONFIG.UI_TEXTS.t2MetricsOverview[metricKey + 'Short'] || metricKey;
                if (lang === 'de') {
                     if (metricKey === 'sens') displayName = 'Sens.';
                     else if (metricKey === 'spez') displayName = 'Spez.';
                     else if (metricKey === 'acc') displayName = 'Acc.';
                     else if (metricKey === 'balAcc') displayName = 'Bal. Acc.';
                }
                return { metric: displayName, AS: asVal, T2: t2Val };
            }).filter(d => !isNaN(d.AS) || !isNaN(d.T2));
        };

        const bfMetricDisplayName = APP_CONFIG.PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === context.currentBruteForceMetric)?.label || context.currentBruteForceMetric;
        const t2LabelForCharts = currentLang === 'de' ? `Opt. T2 (${bfMetricDisplayName})` : `Opt. T2 (${bfMetricDisplayName})`;

        // Overall Cohort Comparison Chart
        const overallChartData = getChartDataForReport(context.allStats.Gesamt, currentLang);
        const overallComparisonChartHtmlReport = getChartSVG('report-comparison-chart-gesamt', chartRenderer.renderComparisonBarChart, overallChartData, {
            t2Label: t2LabelForCharts,
            width: chartWidth,
            height: chartHeight,
            margin: { top: 20, right: 20, bottom: 60, left: 60 }
        });
        reportHTML = reportHTML.replace('<div id="report-comparison-chart-gesamt-container" class="figure-container"></div>', overallComparisonChartHtmlReport);

        // Direkt OP Cohort Comparison Chart
        const direktOPChartData = getChartDataForReport(context.allStats['direkt OP'], currentLang);
        const direktOPComparisonChartHtmlReport = getChartSVG('report-comparison-chart-direkt-op', chartRenderer.renderComparisonBarChart, direktOPChartData, {
            t2Label: t2LabelForCharts,
            width: chartWidth,
            height: chartHeight,
            margin: { top: 20, right: 20, bottom: 60, left: 60 }
        });
        reportHTML = reportHTML.replace('<div id="report-comparison-chart-direkt-op-container" class="figure-container"></div>', direktOPComparisonChartHtmlReport);


        // nRCT Cohort Comparison Chart
        const nRCTChartData = getChartDataForReport(context.allStats.nRCT, currentLang);
        const nRCTComparisonChartHtmlReport = getChartSVG('report-comparison-chart-nrct', chartRenderer.renderComparisonBarChart, nRCTChartData, {
            t2Label: t2LabelForCharts,
            width: chartWidth,
            height: chartHeight,
            margin: { top: 20, right: 20, bottom: 60, left: 60 }
        });
        reportHTML = reportHTML.replace('<div id="report-comparison-chart-nrct-container" class="figure-container"></div>', nRCTComparisonChartHtmlReport);
        
        // Final cleanup of temporary container
        document.body.removeChild(tempChartRenderContainer);

        _downloadFile(reportHTML, filename, 'text/html');
    }

    async function exportZip(fileType, currentKollektiv, processedData, bruteForceResults) {
        const zip = new JSZip();
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(currentKollektiv).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        
        let filesToAdd = [];

        const addFile = (content, path, mimeType) => {
             zip.file(path, content, { binary: mimeType.includes('image') || mimeType.includes('pdf') });
        };

        const addChart = async (chartId, renderFn, data, options, folder, filenameType) => {
            const tempChartDiv = document.createElement('div');
            tempChartDiv.style.position = 'absolute';
            tempChartDiv.style.left = '-9999px';
            tempChartDiv.style.width = (options.width || APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH) + 'px';
            tempChartDiv.style.height = (options.height || APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT) + 'px';
            document.body.appendChild(tempChartDiv);

            renderFn(data, tempChartDiv.id, options);
            const svgElement = tempChartDiv.querySelector('svg');
            
            if (svgElement) {
                const svgFileName = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[filenameType], currentKollektiv, 'svg', chartId);
                addFile(new XMLSerializer().serializeToString(svgElement), `${folder}/${svgFileName}`, 'image/svg+xml');

                const pngFileName = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[filenameType.replace('SVG', 'PNG')], currentKollektiv, 'png', chartId);
                const canvas = await html2canvas(svgElement, { scale: APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE, backgroundColor: null, useCORS: true, logging: false });
                addFile(canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, ''), `${folder}/${pngFileName}`, 'image/png');
            }
            document.body.removeChild(tempChartDiv);
        };

        const allStats = statisticsService.calculateAllStatsForPublication(state.getRawData(), t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), bruteForceResults);
        const context = {
            processedData: processedData,
            rawData: state.getRawData(),
            allStats: allStats,
            appliedT2Criteria: t2CriteriaManager.getAppliedCriteria(),
            appliedT2Logic: t2CriteriaManager.getAppliedLogic(),
            bruteForceResults: bruteForceResults,
            currentLanguage: state.getCurrentPublikationLang(),
            currentBruteForceMetric: bruteForceResults?.metric || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC,
            kollektivNames: APP_CONFIG.UI_TEXTS.kollektivDisplayNames,
            specialIds: APP_CONFIG.SPECIAL_IDS
        };

        switch (fileType) {
            case 'all-zip':
                // CSV
                const statsCSV = Papa.unparse(Object.values(allStats).map(s => s ? { Kollektiv: getKollektivDisplayName(s.kollektiv), ...s } : null).filter(Boolean), { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER, header: true, quotes: true });
                addFile(statsCSV, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.STATS_CSV, currentKollektiv, 'csv'), 'text/csv');

                const rawDataCSV = Papa.unparse(processedData, { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER, header: true, quotes: true });
                addFile(rawDataCSV, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.FILTERED_DATA_CSV, currentKollektiv, 'csv'), 'text/csv');

                // Markdown
                const deskriptivMD = markdownGenerator.generateMarkdownTableFromStats(allStats[currentKollektiv].deskriptiv, APP_CONFIG.UI_TEXTS.statistikTab.descriptiveStatsTitle.replace('[KOLLEKTIV]', getKollektivDisplayName(currentKollektiv)), 'deskriptiv');
                addFile(deskriptivMD, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.DESKRIPTIV_MD, currentKollektiv, 'md'), 'text/markdown');
                
                const dataMD = markdownGenerator.generateMarkdownTableFromData(processedData, APP_CONFIG.UI_TEXTS.global.dataList, 'daten');
                addFile(dataMD, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.DATEN_MD, currentKollektiv, 'md'), 'text/markdown');

                const auswertungMD = markdownGenerator.generateMarkdownTableFromAuswertung(dataProcessor.filterDataByKollektiv(state.getProcessedData(), currentKollektiv), APP_CONFIG.UI_TEXTS.auswertungTab.evaluationTableTitle, 'auswertung');
                addFile(auswertungMD, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.AUSWERTUNG_MD, currentKollektiv, 'md'), 'text/markdown');

                // Comprehensive HTML Report
                const reportHTML = await _generateComprehensiveReportHTMLForZip(context); // This will return HTML string
                addFile(reportHTML, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.COMPREHENSIVE_REPORT_HTML, currentKollektiv, 'html'), 'text/html');

                // Brute Force TXT
                if (bruteForceResults?.hasResults) {
                     const bfReport = bruteForceManager.generateBruteForceReport(bruteForceResults);
                     addFile(bfReport, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.BRUTEFORCE_TXT, currentKollektiv, 'txt'), 'text/plain');
                }

                // Add all publication sections as MD files
                for (const section of APP_CONFIG.PUBLICATION_CONFIG.sections) {
                    if (section.id === 'abstract' || section.id === 'introduction' || section.id === 'discussion' || section.id === 'references') {
                        const content = publicationTextGenerator[`generate${section.id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`](context);
                        addFile(content, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[`PUBLIKATION_${section.id.toUpperCase()}_MD`], currentKollektiv, 'md'), 'text/markdown');
                    } else if (section.id === 'methoden' || section.id === 'ergebnisse') {
                         for (const subSection of section.subSections) {
                             const content = publicationTextGenerator[`generate${subSection.id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`](context);
                             addFile(content, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[`PUBLIKATION_${section.id.toUpperCase()}_MD`], currentKollektiv, 'md').replace('.md', `_${subSection.id}.md`), 'text/markdown');
                         }
                    }
                }
                
                // Add tables from publication tab
                addFile(publicationTables.generateMethodsLiteratureCriteriaTable(context), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CRITERIA_COMPARISON_MD, currentKollektiv, 'md').replace('Kriterienvergleich', 'LiteraturKriterien'), 'text/markdown');
                addFile(publicationTables.generateResultsPatientCharacteristicsTable(context), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CRITERIA_COMPARISON_MD, currentKollektiv, 'md').replace('Kriterienvergleich', 'Patientencharakteristika'), 'text/markdown');
                addFile(publicationTables.generateResultsPerformanceTable(context, APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID, 'diagnostischeGueteASTabelle', 'diagnostischeGueteASTabelle', 'diagnostischeGueteASTabelle'), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CRITERIA_COMPARISON_MD, currentKollektiv, 'md').replace('Kriterienvergleich', 'ASPerformance'), 'text/markdown');
                addFile(publicationTables.generateResultsLiteratureT2PerformanceTable(context), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CRITERIA_COMPARISON_MD, currentKollektiv, 'md').replace('Kriterienvergleich', 'LiteraturT2Performance'), 'text/markdown');
                addFile(publicationTables.generateResultsPerformanceTable(context, 'optimized_t2', 'diagnostischeGueteOptimierteT2Tabelle', 'diagnostischeGueteOptimierteT2Tabelle', 'diagnostischeGueteOptimierteT2Tabelle'), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CRITERIA_COMPARISON_MD, currentKollektiv, 'md').replace('Kriterienvergleich', 'OptimierteT2Performance'), 'text/markdown');
                addFile(publicationTables.generateResultsComparisonTable(context), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CRITERIA_COMPARISON_MD, currentKollektiv, 'md').replace('Kriterienvergleich', 'ASvsT2Comparison'), 'text/markdown');

                // Add charts (SVG and PNG)
                const chartWidth = APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH + 150;
                const chartHeight = APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT + 50;

                await addChart('chart-dash-age', chartRenderer.renderAgeDistributionChart, context.allStats.Gesamt.alterData, {width: chartWidth, height: chartHeight}, 'charts', 'CHARTS_SVG');
                await addChart('chart-dash-gender', chartRenderer.renderPieChart, [
                    { label: 'Male', value: context.allStats.Gesamt.geschlecht.m },
                    { label: 'Female', value: context.allStats.Gesamt.geschlecht.f }
                ], { width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8 }, 'charts', 'CHARTS_SVG');
                await addChart('chart-dash-n-status', chartRenderer.renderPieChart, [
                    { label: 'N+', value: context.allStats.Gesamt.nStatus.plus },
                    { label: 'N-', value: context.allStats.Gesamt.nStatus.minus }
                ], { width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8 }, 'charts', 'CHARTS_SVG');
                await addChart('chart-dash-as-status', chartRenderer.renderPieChart, [
                    { label: 'AS+', value: context.allStats.Gesamt.asStatus.plus },
                    { label: 'AS-', value: context.allStats.Gesamt.asStatus.minus }
                ], { width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8 }, 'charts', 'CHARTS_SVG');
                await addChart('chart-dash-t2-status', chartRenderer.renderPieChart, [
                    { label: 'T2+', value: context.allStats.Gesamt.t2Status.plus },
                    { label: 'T2-', value: context.allStats.Gesamt.t2Status.minus }
                ], { width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8 }, 'charts', 'CHARTS_SVG');
                await addChart('chart-dash-therapy', chartRenderer.renderPieChart, [
                    { label: 'Direkt OP', value: context.allStats.Gesamt.therapie['direkt OP'] },
                    { label: 'nRCT', value: context.allStats.Gesamt.therapie.nRCT }
                ], { width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8 }, 'charts', 'CHARTS_SVG');

                const getChartDataForReport = (stats, lang) => {
                    const metricsToCompare = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'];
                    if (!stats?.gueteAS || !stats?.gueteT2_bruteforce) return [];
                    return metricsToCompare.map(metricKey => {
                        const asVal = stats.gueteAS?.[metricKey]?.value ?? NaN;
                        const t2Val = stats.gueteT2_bruteforce?.[metricKey]?.value ?? NaN;
                        let displayName = APP_CONFIG.UI_TEXTS.t2MetricsOverview[metricKey + 'Short'] || metricKey;
                        if (lang === 'de') {
                             if (metricKey === 'sens') displayName = 'Sens.';
                             else if (metricKey === 'spez') displayName = 'Spez.';
                             else if (metricKey === 'acc') displayName = 'Acc.';
                             else if (metricKey === 'balAcc') displayName = 'Bal. Acc.';
                        }
                        return { metric: displayName, AS: asVal, T2: t2Val };
                    }).filter(d => !isNaN(d.AS) || !isNaN(d.T2));
                };
                const bfMetricDisplayName = APP_CONFIG.PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === context.currentBruteForceMetric)?.label || context.currentBruteForceMetric;
                const t2LabelForCharts = context.currentLanguage === 'de' ? `Opt. T2 (${bfMetricDisplayName})` : `Opt. T2 (${bfMetricDisplayName})`;

                await addChart('chart-comparison-overall', chartRenderer.renderComparisonBarChart, getChartDataForReport(context.allStats.Gesamt, context.currentLanguage), { t2Label: t2LabelForCharts, width: chartWidth, height: chartHeight }, 'charts', 'CHART_SINGLE_SVG');
                await addChart('chart-comparison-direkt-op', chartRenderer.renderComparisonBarChart, getChartDataForReport(context.allStats['direkt OP'], context.currentLanguage), { t2Label: t2LabelForCharts, width: chartWidth, height: chartHeight }, 'charts', 'CHART_SINGLE_SVG');
                await addChart('chart-comparison-nrct', chartRenderer.renderComparisonBarChart, getChartDataForReport(context.allStats.nRCT, context.currentLanguage), { t2Label: t2LabelForCharts, width: chartWidth, height: chartHeight }, 'charts', 'CHART_SINGLE_SVG');

                break;
            case 'csv-zip':
                // Add all primary data tables as CSV
                addFile(Papa.unparse(Object.values(allStats).map(s => s ? { Kollektiv: getKollektivDisplayName(s.kollektiv), ...s } : null).filter(Boolean), { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER, header: true, quotes: true }), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.STATS_CSV, currentKollektiv, 'csv'), 'text/csv');
                addFile(Papa.unparse(processedData, { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER, header: true, quotes: true }), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.FILTERED_DATA_CSV, currentKollektiv, 'csv'), 'text/csv');
                break;
            case 'md-zip':
                // Add all primary markdown reports
                addFile(markdownGenerator.generateMarkdownTableFromStats(allStats[currentKollektiv].deskriptiv, APP_CONFIG.UI_TEXTS.statistikTab.descriptiveStatsTitle.replace('[KOLLEKTIV]', getKollektivDisplayName(currentKollektiv)), 'deskriptiv'), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.DESKRIPTIV_MD, currentKollektiv, 'md'), 'text/markdown');
                addFile(markdownGenerator.generateMarkdownTableFromData(processedData, APP_CONFIG.UI_TEXTS.global.dataList, 'daten'), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.DATEN_MD, currentKollektiv, 'md'), 'text/markdown');
                addFile(markdownGenerator.generateMarkdownTableFromAuswertung(dataProcessor.filterDataByKollektiv(state.getProcessedData(), currentKollektiv), APP_CONFIG.UI_TEXTS.auswertungTab.evaluationTableTitle, 'auswertung'), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.AUSWERTUNG_MD, currentKollektiv, 'md'), 'text/markdown');
                // Add all publication sections as MD files
                for (const section of APP_CONFIG.PUBLICATION_CONFIG.sections) {
                    if (section.id === 'abstract' || section.id === 'introduction' || section.id === 'discussion' || section.id === 'references') {
                        const content = publicationTextGenerator[`generate${section.id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`](context);
                        addFile(content, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[`PUBLIKATION_${section.id.toUpperCase()}_MD`], currentKollektiv, 'md'), 'text/markdown');
                    } else if (section.id === 'methoden' || section.id === 'ergebnisse') {
                         for (const subSection of section.subSections) {
                             const content = publicationTextGenerator[`generate${subSection.id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`](context);
                             addFile(content, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[`PUBLIKATION_${section.id.toUpperCase()}_MD`], currentKollektiv, 'md').replace('.md', `_${subSection.id}.md`), 'text/markdown');
                         }
                    }
                }
                // Add tables from publication tab
                addFile(publicationTables.generateMethodsLiteratureCriteriaTable(context), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CRITERIA_COMPARISON_MD, currentKollektiv, 'md').replace('Kriterienvergleich', 'LiteraturKriterien'), 'text/markdown');
                addFile(publicationTables.generateResultsPatientCharacteristicsTable(context), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CRITERIA_COMPARISON_MD, currentKollektiv, 'md').replace('Kriterienvergleich', 'Patientencharakteristika'), 'text/markdown');
                addFile(publicationTables.generateResultsPerformanceTable(context, APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID, 'diagnostischeGueteASTabelle', 'diagnostischeGueteASTabelle', 'diagnostischeGueteASTabelle'), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CRITERIA_COMPARISON_MD, currentKollektiv, 'md').replace('Kriterienvergleich', 'ASPerformance'), 'text/markdown');
                addFile(publicationTables.generateResultsLiteratureT2PerformanceTable(context), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CRITERIA_COMPARISON_MD, currentKollektiv, 'md').replace('Kriterienvergleich', 'LiteraturT2Performance'), 'text/markdown');
                addFile(publicationTables.generateResultsPerformanceTable(context, 'optimized_t2', 'diagnostischeGueteOptimierteT2Tabelle', 'diagnostischeGueteOptimierteT2Tabelle', 'diagnostischeGueteOptimierteT2Tabelle'), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CRITERIA_COMPARISON_MD, currentKollektiv, 'md').replace('Kriterienvergleich', 'OptimierteT2Performance'), 'text/markdown');
                addFile(publicationTables.generateResultsComparisonTable(context), _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CRITERIA_COMPARISON_MD, currentKollektiv, 'md').replace('Kriterienvergleich', 'ASvsT2Comparison'), 'text/markdown');

                break;
            case 'png-zip':
                // Add all charts as PNG
                await addChart('chart-dash-age', chartRenderer.renderAgeDistributionChart, context.allStats.Gesamt.alterData, {width: chartWidth, height: chartHeight}, 'charts', 'CHARTS_SVG'); // Renders SVG, addChart exports PNG from it
                await addChart('chart-dash-gender', chartRenderer.renderPieChart, [
                    { label: 'Male', value: context.allStats.Gesamt.geschlecht.m },
                    { label: 'Female', value: context.allStats.Gesamt.geschlecht.f }
                ], { width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8 }, 'charts', 'CHARTS_SVG');
                await addChart('chart-dash-n-status', chartRenderer.renderPieChart, [
                    { label: 'N+', value: context.allStats.Gesamt.nStatus.plus },
                    { label: 'N-', value: context.allStats.Gesamt.nStatus.minus }
                ], { width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8 }, 'charts', 'CHARTS_SVG');
                await addChart('chart-dash-as-status', chartRenderer.renderPieChart, [
                    { label: 'AS+', value: context.allStats.Gesamt.asStatus.plus },
                    { label: 'AS-', value: context.allStats.Gesamt.asStatus.minus }
                ], { width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8 }, 'charts', 'CHARTS_SVG');
                await addChart('chart-dash-t2-status', chartRenderer.renderPieChart, [
                    { label: 'T2+', value: context.allStats.Gesamt.t2Status.plus },
                    { label: 'T2-', value: context.allStats.Gesamt.t2Status.minus }
                ], { width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8 }, 'charts', 'CHARTS_SVG');
                await addChart('chart-dash-therapy', chartRenderer.renderPieChart, [
                    { label: 'Direkt OP', value: context.allStats.Gesamt.therapie['direkt OP'] },
                    { label: 'nRCT', value: context.allStats.Gesamt.therapie.nRCT }
                ], { width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8 }, 'charts', 'CHARTS_SVG');
                await addChart('chart-comparison-overall', chartRenderer.renderComparisonBarChart, getChartDataForReport(context.allStats.Gesamt, context.currentLanguage), { t2Label: t2LabelForCharts, width: chartWidth, height: chartHeight }, 'charts', 'CHART_SINGLE_SVG');
                await addChart('chart-comparison-direkt-op', chartRenderer.renderComparisonBarChart, getChartDataForReport(context.allStats['direkt OP'], context.currentLanguage), { t2Label: t2LabelForCharts, width: chartWidth, height: chartHeight }, 'charts', 'CHART_SINGLE_SVG');
                await addChart('chart-comparison-nrct', chartRenderer.renderComparisonBarChart, getChartDataForReport(context.allStats.nRCT, context.currentLanguage), { t2Label: t2LabelForCharts, width: chartWidth, height: chartHeight }, 'charts', 'CHART_SINGLE_SVG');

                break;
            case 'svg-zip':
                // Add all charts as SVG
                await addChart('chart-dash-age', chartRenderer.renderAgeDistributionChart, context.allStats.Gesamt.alterData, {width: chartWidth, height: chartHeight}, 'charts', 'CHARTS_SVG');
                await addChart('chart-dash-gender', chartRenderer.renderPieChart, [
                    { label: 'Male', value: context.allStats.Gesamt.geschlecht.m },
                    { label: 'Female', value: context.allStats.Gesamt.geschlecht.f }
                ], { width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8 }, 'charts', 'CHARTS_SVG');
                await addChart('chart-dash-n-status', chartRenderer.renderPieChart, [
                    { label: 'N+', value: context.allStats.Gesamt.nStatus.plus },
                    { label: 'N-', value: context.allStats.Gesamt.nStatus.minus }
                ], { width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8 }, 'charts', 'CHARTS_SVG');
                await addChart('chart-dash-as-status', chartRenderer.renderPieChart, [
                    { label: 'AS+', value: context.allStats.Gesamt.asStatus.plus },
                    { label: 'AS-', value: context.allStats.Gesamt.asStatus.minus }
                ], { width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8 }, 'charts', 'CHARTS_SVG');
                await addChart('chart-dash-t2-status', chartRenderer.renderPieChart, [
                    { label: 'T2+', value: context.allStats.Gesamt.t2Status.plus },
                    { label: 'T2-', value: context.allStats.Gesamt.t2Status.minus }
                ], { width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8 }, 'charts', 'CHARTS_SVG');
                await addChart('chart-dash-therapy', chartRenderer.renderPieChart, [
                    { label: 'Direkt OP', value: context.allStats.Gesamt.therapie['direkt OP'] },
                    { label: 'nRCT', value: context.allStats.Gesamt.therapie.nRCT }
                ], { width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8 }, 'charts', 'CHARTS_SVG');
                await addChart('chart-comparison-overall', chartRenderer.renderComparisonBarChart, getChartDataForReport(context.allStats.Gesamt, context.currentLanguage), { t2Label: t2LabelForCharts, width: chartWidth, height: chartHeight }, 'charts', 'CHART_SINGLE_SVG');
                await addChart('chart-comparison-direkt-op', chartRenderer.renderComparisonBarChart, getChartDataForReport(context.allStats['direkt OP'], context.currentLanguage), { t2Label: t2LabelForCharts, width: chartWidth, height: chartHeight }, 'charts', 'CHART_SINGLE_SVG');
                await addChart('chart-comparison-nrct', chartRenderer.renderComparisonBarChart, getChartDataForReport(context.allStats.nRCT, context.currentLanguage), { t2Label: t2LabelForCharts, width: chartWidth, height: chartHeight }, 'charts', 'CHART_SINGLE_SVG');
                break;
            case 'xlsx-zip':
                // Temporarily disable XLSX export as it requires a separate library (SheetJS)
                ui_helpers.showToast(APP_CONFIG.UI_TEXTS.exportTab.xlsxNotImplemented, 'warning');
                return;
            default:
                ui_helpers.showToast(APP_CONFIG.UI_TEXTS.exportTab.unsupportedZipType, 'danger');
                return;
        }

        zip.generateAsync({ type: "blob" })
            .then(function(content) {
                const zipFilename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[`${fileType.toUpperCase()}`], currentKollektiv, 'zip');
                _downloadFile(content, zipFilename, 'application/zip');
                ui_helpers.showToast(APP_CONFIG.UI_TEXTS.exportTab.zipExportSuccess.replace('{TYPE}', fileType.toUpperCase()), 'success');
            })
            .catch(e => {
                ui_helpers.showToast(`${APP_CONFIG.UI_TEXTS.exportTab.zipExportError}: ${e.message}`, 'danger');
                console.error("ZIP export error:", e);
            });
    }

    async function _generateComprehensiveReportHTMLForZip(context) {
        const currentLang = context.currentLanguage;
        const processedData = context.processedData;
        const bruteForceResults = context.bruteForceResults;
        const currentKollektiv = context.kollektivNames[state.getCurrentKollektiv()];

        const reportTitle = APP_CONFIG.REPORT_SETTINGS.REPORT_TITLE;
        const reportAuthor = `${APP_CONFIG.APP_AUTHOR} (${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION})`;
        const generationTimestamp = new Date().toLocaleString(currentLang === 'de' ? 'de-DE' : 'en-US', { dateStyle: 'full', timeStyle: 'medium' });

        let reportHTML = `<!DOCTYPE html>
<html lang="${currentLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportTitle}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 20px; }
        .container { max-width: 900px; margin: auto; padding: 20px; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1, h2, h3, h4, h5, h6 { color: #0056b3; margin-top: 20px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .text-end { text-align: right; }
        .text-center { text-align: center; }
        .small { font-size: 0.85em; }
        .alert { padding: 10px; margin-bottom: 15px; border-radius: 5px; }
        .alert-info { background-color: #d1ecf1; border-color: #bee5eb; color: #0c5460; }
        .figure-container { margin-top: 20px; margin-bottom: 20px; text-align: center; }
        .figure-container svg { max-width: 100%; height: auto; }
        .figure-caption { font-size: 0.9em; color: #555; margin-top: 5px; }
        .section-header { border-bottom: 2px solid #0056b3; padding-bottom: 5px; margin-bottom: 15px; }
        .citation { font-size: 0.8em; color: #777; }
        footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 0.8em; color: #777; }
        @media print {
            .container { border: none; box-shadow: none; }
            body { margin: 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="text-center mb-4">
            <h1>${reportTitle}</h1>
            <p class="lead">${reportAuthor}</p>
            <p class="text-muted small">${currentLang === 'de' ? 'Generiert am' : 'Generated on'}: ${generationTimestamp}</p>
            <hr>
        </header>

        <section class="mb-4">
            <h2 class="section-header">${currentLang === 'de' ? 'Zusammenfassung der Konfiguration' : 'Configuration Summary'}</h2>
            <p><strong>${currentLang === 'de' ? 'Aktuell gewähltes Kollektiv' : 'Currently Selected Cohort'}:</strong> ${getKollektivDisplayName(state.getCurrentKollektiv())}</p>
            <p><strong>${currentLang === 'de' ? 'Angewandte T2-Kriterien' : 'Applied T2 Criteria'}:</strong> ${t2CriteriaManager.getAppliedLogic().toUpperCase()} - ${studyT2CriteriaManager.formatCriteriaForDisplay(t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), false, currentLang)}</p>
            ${bruteForceResults?.bestResult ? `
                <p><strong>${currentLang === 'de' ? 'Beste Brute-Force Kriterien ({BF_METRIC})' : 'Best Brute-Force Criteria ({BF_METRIC})'}:</strong> ${bruteForceResults.bestResult.logic.toUpperCase()} - ${studyT2CriteriaManager.formatCriteriaForDisplay(bruteForceResults.bestResult.criteria, bruteForceResults.bestResult.logic, false, currentLang)} (${currentLang === 'de' ? 'Wert' : 'Value'}: ${formatNumber(bruteForceResults.bestResult.metricValue, 4, '--', true, currentLang)})</p>
            `.replace('{BF_METRIC}', context.currentBruteForceMetric) : ''}
        </section>
        
        <section class="mb-4">
            <h2 class="section-header">${currentLang === 'de' ? 'Patientencharakteristika' : 'Patient Characteristics'}</h2>
            ${publicationTables.generateResultsPatientCharacteristicsTable(context)}
            <div id="report-age-chart-container" class="figure-container"></div>
            <div id="report-gender-chart-container" class="figure-container"></div>
        </section>

        <section class="mb-4">
            <h2 class="section-header">${currentLang === 'de' ? 'Diagnostische Güte: Avocado Sign' : 'Diagnostic Performance: Avocado Sign'}</h2>
            ${publicationTables.generateResultsPerformanceTable(context, APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID, 'diagnostischeGueteASTabelle', 'diagnostischeGueteASTabelle', 'diagnostischeGueteASTabelle')}
        </section>

        <section class="mb-4">
            <h2 class="section-header">${currentLang === 'de' ? 'Diagnostische Güte: Literatur-basierte T2-Kriterien' : 'Diagnostic Performance: Literature-Based T2 Criteria'}</h2>
            ${publicationTables.generateResultsLiteratureT2PerformanceTable(context)}
        </section>

        <section class="mb-4">
            <h2 class="section-header">${currentLang === 'de' ? 'Diagnostische Güte: Brute-Force optimierte T2-Kriterien' : 'Diagnostic Performance: Brute-Force Optimized T2 Criteria'}</h2>
            ${publicationTables.generateResultsPerformanceTable(context, 'optimized_t2', 'diagnostischeGueteOptimierteT2Tabelle', 'diagnostischeGueteOptimierteT2Tabelle', 'diagnostischeGueteOptimierteT2Tabelle')}
        </section>

        <section class="mb-4">
            <h2 class="section-header">${currentLang === 'de' ? 'Statistischer Vergleich: AS vs. T2-Kriterien' : 'Statistical Comparison: AS vs. T2 Criteria'}</h2>
            ${publicationTables.generateResultsComparisonTable(context)}
            <div id="report-comparison-chart-gesamt-container" class="figure-container"></div>
            <div id="report-comparison-chart-direkt-op-container" class="figure-container"></div>
            <div id="report-comparison-chart-nrct-container" class="figure-container"></div>
        </section>

        <footer>
            ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION} | ${APP_CONFIG.APP_AUTHOR} | ${APP_CONFIG.APP_CONTACT_EMAIL}
        </footer>
    </div>
</body>
</html>`;

        // Create a temporary, hidden div in the main document to render charts for SVG extraction
        const tempChartRenderContainer = document.createElement('div');
        tempChartRenderContainer.style.position = 'absolute';
        tempChartRenderContainer.style.left = '-9999px';
        document.body.appendChild(tempChartRenderContainer);

        const getChartSVGForReport = (chartId, renderFn, data, options) => {
            const tempId = `temp-report-chart-${chartId}`;
            tempChartRenderContainer.id = tempId; // Reuse the temp container
            renderFn(data, tempId, options);
            const svgElement = document.getElementById(tempId)?.querySelector('svg');
            if (svgElement) {
                return new XMLSerializer().serializeToString(svgElement);
            }
            return `<p class="text-muted small text-center">${currentLang === 'de' ? 'Diagramm konnte nicht generiert werden.' : 'Chart could not be generated.'}</p>`;
        };

        const chartWidth = APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH + 150;
        const chartHeight = APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT + 50;
        
        const bfMetricDisplayName = APP_CONFIG.PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === context.currentBruteForceMetric)?.label || context.currentBruteForceMetric;
        const t2LabelForCharts = currentLang === 'de' ? `Opt. T2 (${bfMetricDisplayName})` : `Opt. T2 (${bfMetricDisplayName})`;

        // Render charts and replace placeholders in reportHTML
        const ageChartSvg = getChartSVGForReport('report-age-chart', chartRenderer.renderAgeDistributionChart, context.allStats.Gesamt.alterData, {
            width: chartWidth, height: chartHeight, margin: { top: 20, right: 20, bottom: 50, left: 50 }
        });
        reportHTML = reportHTML.replace('<div id="report-age-chart-container" class="figure-container"></div>', `<div class="figure-container"><div style="width:100%; max-width:${chartWidth}px; margin:auto;">${ageChartSvg}</div><figcaption class="figure-caption text-center small mt-2">${context.currentLanguage === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.captionDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.captionEn.replace('[TOTAL_PATIENTS_OVERALL]', context.allStats.Gesamt.anzahlPatienten)}</figcaption></div>`);

        const genderChartSvg = getChartSVGForReport('report-gender-chart', chartRenderer.renderPieChart, [
            { label: currentLang === 'de' ? APP_CONFIG.UI_TEXTS.legendLabels.male : 'Male', value: context.allStats.Gesamt.geschlecht.m },
            { label: currentLang === 'de' ? APP_CONFIG.UI_TEXTS.legendLabels.female : 'Female', value: context.allStats.Gesamt.geschlecht.f }
        ], {
            width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50, height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50, legendBelow: true, outerRadiusFactor: 0.8
        });
        reportHTML = reportHTML.replace('<div id="report-gender-chart-container" class="figure-container"></div>', `<div class="figure-container"><div style="width:100%; max-width:${APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50}px; margin:auto;">${genderChartSvg}</div><figcaption class="figure-caption text-center small mt-2">${context.currentLanguage === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.captionDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.captionEn.replace('[TOTAL_PATIENTS_OVERALL]', context.allStats.Gesamt.anzahlPatienten)}</figcaption></div>`);

        const getChartDataForReport = (stats, lang) => {
            const metricsToCompare = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'];
            if (!stats?.gueteAS || !stats?.gueteT2_bruteforce) return [];
            return metricsToCompare.map(metricKey => {
                const asVal = stats.gueteAS?.[metricKey]?.value ?? NaN;
                const t2Val = stats.gueteT2_bruteforce?.[metricKey]?.value ?? NaN;
                let displayName = APP_CONFIG.UI_TEXTS.t2MetricsOverview[metricKey + 'Short'] || metricKey;
                if (lang === 'de') {
                     if (metricKey === 'sens') displayName = 'Sens.';
                     else if (metricKey === 'spez') displayName = 'Spez.';
                     else if (metricKey === 'acc') displayName = 'Acc.';
                     else if (metricKey === 'balAcc') displayName = 'Bal. Acc.';
                }
                return { metric: displayName, AS: asVal, T2: t2Val };
            }).filter(d => !isNaN(d.AS) || !isNaN(d.T2));
        };

        const renderComparisonChartForReport = (kollektivId, containerId, titleKey) => {
             const stats = context.allStats[kollektivId];
             if (!stats) { return ''; }
             const chartData = getChartDataForReport(stats, currentLang);
             const chartSvg = getChartSVGForReport(`report-comparison-chart-${kollektivId}`, chartRenderer.renderComparisonBarChart, chartData, { t2Label: t2LabelForCharts, width: chartWidth, height: chartHeight });
             const caption = currentLang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse[titleKey].captionDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse[titleKey].captionEn;
             let finalCaption = caption;
             if (kollektivId === 'Gesamt') finalCaption = finalCaption.replace('N=[TOTAL_PATIENTS_OVERALL]', `N=${context.allStats.Gesamt.anzahlPatienten}`);
             if (kollektivId === 'direkt OP') finalCaption = finalCaption.replace('N=[TOTAL_PATIENTS_DIREKTOP]', `N=${context.allStats['direkt OP']?.anzahlPatienten}`);
             if (kollektivId === 'nRCT') finalCaption = finalCaption.replace('N=[TOTAL_PATIENTS_NRCT]', `N=${context.allStats.nRCT?.anzahlPatienten}`);
             return `<div class="figure-container"><div style="width:100%; max-width:${chartWidth}px; margin:auto;">${chartSvg}</div><figcaption class="figure-caption text-center small mt-2">${finalCaption}</figcaption></div>`;
        };

        reportHTML = reportHTML.replace('<div id="report-comparison-chart-gesamt-container" class="figure-container"></div>', renderComparisonChartForReport('Gesamt', 'report-comparison-chart-gesamt', 'vergleichPerformanceChartGesamt'));
        reportHTML = reportHTML.replace('<div id="report-comparison-chart-direkt-op-container" class="figure-container"></div>', renderComparisonChartForReport('direkt OP', 'report-comparison-chart-direkt-op', 'vergleichPerformanceChartdirektOP'));
        reportHTML = reportHTML.replace('<div id="report-comparison-chart-nrct-container" class="figure-container"></div>', renderComparisonChartForReport('nRCT', 'report-comparison-chart-nrct', 'vergleichPerformanceChartnRCT'));

        // Remove temporary container
        document.body.removeChild(tempChartRenderContainer);

        return reportHTML;
    }


    function renderExportOptions(currentKollektiv, hasBruteForceResults, hasProcessedData) {
        const exportOptionsContainer = document.getElementById('export-options-container');
        if (!exportOptionsContainer) return;
        exportOptionsContainer.innerHTML = uiComponents.createExportOptions(currentKollektiv);
        ui_helpers.updateExportButtonStates(viewRenderer.getCurrentActiveTab(), hasBruteForceResults, hasProcessedData);
        ui_helpers.initializeTooltips(exportOptionsContainer);
    }

    return Object.freeze({
        exportToCSV,
        exportToMarkdown,
        exportToText,
        exportToPNG,
        exportToSVG,
        exportComprehensiveReport,
        exportZip,
        renderExportOptions
    });

})();
