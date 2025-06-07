const exportService = (() => {

    function _generateFilename(typeKey, options = {}) {
        const { kollektiv, extension, chartName, tableName, studyId, sectionName } = options;
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(kollektiv).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        let filenameType = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[typeKey] || typeKey || 'Export';

        if (chartName) filenameType = filenameType.replace('{ChartName}', chartName.replace(/[^a-z0-9_-]/gi, '_'));
        if (tableName) filenameType = filenameType.replace('{TableName}', tableName.replace(/[^a-z0-9_-]/gi, '_'));
        if (studyId) filenameType = filenameType.replace('{StudyID}', String(studyId).replace(/[^a-z0-9_-]/gi, '_'));
        if (sectionName) filenameType = filenameType.replace('{SectionName}', String(sectionName).replace(/[^a-z0-9_-]/gi, '_'));
        
        return APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE
            .replace('{TYPE}', filenameType)
            .replace('{KOLLEKTIV}', safeKollektiv)
            .replace('{DATE}', dateStr)
            .replace('{EXT}', extension)
            .replace(/_{2,}/g, '_').replace(/_./, (m) => m.toUpperCase()).replace(/_([a-z])/g, (m, p1) => p1.toUpperCase());
    }

    function _downloadFile(content, filename, mimeType) {
        if (content === null || content === undefined || (typeof content !== 'string' && !(content instanceof Blob))) {
             uiHelpers.showToast(`Export für '${filename}' fehlgeschlagen: Leere oder ungültige Daten.`, 'warning');
             return;
        }
        const blob = (content instanceof Blob) ? content : new Blob([content], { type: mimeType });
        if (blob.size === 0) {
            uiHelpers.showToast(`Export für '${filename}' fehlgeschlagen: Leere Datei generiert.`, 'warning');
            return;
        }
        saveAs(blob, filename);
        uiHelpers.showToast(`Datei '${filename}' erfolgreich heruntergeladen.`, 'success');
    }

    async function _getCommonExportData() {
        const currentKollektiv = stateManager.getCurrentKollektiv();
        const rawFilteredData = dataProcessor.filterDataByKollektiv(dataProcessor.getProcessedData(), currentKollektiv);
        const appliedCriteria = t2CriteriaManager.getCriteria();
        const appliedLogic = t2CriteriaManager.getLogic();
        const evaluatedData = t2CriteriaManager.evaluateDatasetWithCriteria(rawFilteredData, appliedCriteria, appliedLogic);
        const stats = statisticsService.calculateAllStats(evaluatedData, appliedCriteria, appliedLogic);
        const bfResult = bruteForceManager.getResultsForKollektiv(currentKollektiv);

        return { currentKollektiv, rawFilteredData, evaluatedData, stats, bfResult, appliedCriteria, appliedLogic };
    }
    
    function _generateStatistikCsv(stats, kollektiv, criteria, logic) {
        if (!stats) return null;
        const csvData = [];
        const fv = (v, d = 2) => (typeof v === 'number' && isFinite(v)) ? v.toFixed(d).replace('.', ',') : 'N/A';

        csvData.push(['Kategorie', 'Metrik', 'Wert', 'CI Lower', 'CI Upper']);
        Object.entries(stats.avocadoSign).forEach(([key, metric]) => {
            if (typeof metric === 'object' && metric && typeof metric.value === 'number') {
                csvData.push(['Avocado Sign', key, fv(metric.value, 4), fv(metric.ci?.lower, 4), fv(metric.ci?.upper, 4)]);
            }
        });
        Object.entries(stats.t2).forEach(([key, metric]) => {
            if (typeof metric === 'object' && metric && typeof metric.value === 'number') {
                csvData.push(['T2 Angewandt', key, fv(metric.value, 4), fv(metric.ci?.lower, 4), fv(metric.ci?.upper, 4)]);
            }
        });
        return Papa.unparse(csvData, { delimiter: ';' });
    }

    async function exportStatistikCsv() {
        const { stats, currentKollektiv, appliedCriteria, appliedLogic } = await _getCommonExportData();
        const csvString = _generateStatistikCsv(stats, currentKollektiv, appliedCriteria, appliedLogic);
        const filename = _generateFilename('STATS_CSV', { kollektiv: currentKollektiv, extension: 'csv' });
        _downloadFile(csvString, filename, 'text/csv;charset=utf-8');
    }

    async function exportBruteForceReport() {
        const { bfResult, currentKollektiv } = await _getCommonExportData();
        if (!bfResult || !bfResult.bestResult || !bfResult.results) {
            uiHelpers.showToast('Keine Brute-Force-Ergebnisse für das aktuelle Kollektiv vorhanden.', 'warning');
            return;
        }
        let reportString = `Brute-Force Report für Kollektiv: ${getKollektivDisplayName(currentKollektiv)}\n` +
                             `Optimierte Metrik: ${bfResult.metric}\n\n`;
                             
        if (bfResult.bestResult) {
            reportString += `Bestes Ergebnis:\n` +
                            `  Metrikwert: ${formatNumber(bfResult.bestResult.metricValue, 4)}\n` +
                            `  Logik: ${bfResult.bestResult.logic}\n` +
                            `  Kriterien: ${t2CriteriaManager.formatCriteriaForDisplay(bfResult.bestResult.criteria, bfResult.bestResult.logic)}\n\n`;
        }

        if (bfResult.results.length > 0) {
            reportString += `Top ${Math.min(bfResult.results.length, 10)} Ergebnisse:\n`;
            bfResult.results.slice(0, 10).forEach((r, i) => {
                reportString += `  ${i+1}. Wert: ${formatNumber(r.metricValue, 4)} | Logik: ${r.logic} | Kriterien: ${t2CriteriaManager.formatCriteriaForDisplay(r.criteria, r.logic)}\n`;
            });
        }
        
        const filename = _generateFilename('BRUTEFORCE_TXT', { kollektiv: currentKollektiv, extension: 'txt' });
        _downloadFile(reportString, filename, 'text/plain;charset=utf-8');
    }

    async function exportFilteredDataAsCsv() {
        const { rawFilteredData, currentKollektiv } = await _getCommonExportData();
        const csvString = Papa.unparse(rawFilteredData, { header: true, delimiter: ';' });
        const filename = _generateFilename('FILTERED_DATA_CSV', { kollektiv: currentKollektiv, extension: 'csv' });
        _downloadFile(csvString, filename, 'text/csv;charset=utf-8');
    }
    
    async function exportExcelWorkbook() {
        if (typeof XLSX === 'undefined') {
            uiHelpers.showToast('Excel-Export-Bibliothek (SheetJS) nicht geladen.', 'danger');
            return;
        }
        const { currentKollektiv, rawFilteredData, evaluatedData, stats, appliedCriteria, appliedLogic } = await _getCommonExportData();
        
        const wb = XLSX.utils.book_new();

        const configSheet = XLSX.utils.aoa_to_sheet([
            ['Analyse Konfiguration'],
            ['Datum', new Date().toLocaleString('de-DE')],
            ['Kollektiv', getKollektivDisplayName(currentKollektiv)],
            ['Angewandte T2 Logik', appliedLogic],
            ['Angewandte T2 Kriterien', t2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic)]
        ]);
        XLSX.utils.book_append_sheet(wb, configSheet, APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_KONFIG);
        
        const dataSheet = XLSX.utils.json_to_sheet(rawFilteredData);
        XLSX.utils.book_append_sheet(wb, dataSheet, APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_DATEN);
        
        const auswertungSheet = XLSX.utils.json_to_sheet(evaluatedData.map(p => ({
            ...p, lymphknoten_t2: JSON.stringify(p.lymphknoten_t2), lymphknoten_t2_bewertet: JSON.stringify(p.lymphknoten_t2_bewertet)
        })));
        XLSX.utils.book_append_sheet(wb, auswertungSheet, APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_AUSWERTUNG);

        const statsCsv = _generateStatistikCsv(stats, currentKollektiv, appliedCriteria, appliedLogic);
        const statsSheet = XLSX.utils.sheet_add_csv(XLSX.utils.aoa_to_sheet([[]]), statsCsv, {delimiter: ';'});
        XLSX.utils.book_append_sheet(wb, statsSheet, APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_STATISTIK);

        const filename = _generateFilename('XLSX_ZIP', { kollektiv: currentKollektiv, extension: 'xlsx' });
        XLSX.writeFile(wb, filename);
        uiHelpers.showToast(`Excel-Arbeitsmappe '${filename}' erfolgreich generiert.`, 'success');
    }

    async function exportSingleChart(chartId, format) {
        const svgElement = document.querySelector(`#${chartId} svg`);
        if (!svgElement) {
            uiHelpers.showToast(`Chart-Element #${chartId} für Export nicht gefunden.`, 'danger');
            return;
        }
        const { currentKollektiv } = await _getCommonExportData();
        const chartName = svgElement.closest('.card')?.querySelector('.card-header')?.textContent.trim() || chartId;
        
        let blob;
        if (format === 'png') {
            blob = await chartRenderer.convertSvgToPngBlob(svgElement);
        } else if (format === 'svg') {
            blob = await chartRenderer.getSvgBlob(svgElement);
        } else {
            uiHelpers.showToast(`Unbekanntes Bildformat: ${format}`, 'warning');
            return;
        }
        const filename = _generateFilename(format === 'png' ? 'CHART_SINGLE_PNG' : 'CHART_SINGLE_SVG', { kollektiv: currentKollektiv, extension: format, chartName });
        _downloadFile(blob, filename);
    }
    
    async function exportSingleTable(tableId, tableName, format) {
         if (format !== 'png' || typeof html2canvas === 'undefined') {
            uiHelpers.showToast('Tabellen-Export als PNG nicht möglich. Bibliothek fehlt.', 'danger');
            return;
        }
        const tableElement = document.getElementById(tableId);
        if (!tableElement) {
            uiHelpers.showToast(`Tabellen-Element #${tableId} nicht gefunden.`, 'danger');
            return;
        }
        const canvas = await html2canvas(tableElement, { scale: 2, backgroundColor: '#ffffff' });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const { currentKollektiv } = await _getCommonExportData();
        const filename = _generateFilename('TABLE_PNG_EXPORT', { kollektiv: currentKollektiv, extension: 'png', tableName });
        _downloadFile(blob, filename);
    }

    async function exportComprehensiveReport() {
        // This function would typically generate a full HTML report by combining various parts
        // For now, it's a placeholder. The complexity requires a dedicated generation logic
        // similar to publication_generator_service but for a full report structure.
        uiHelpers.showToast('Die Erstellung des umfassenden Berichts ist noch nicht vollständig implementiert.', 'info');
        console.warn("exportComprehensiveReport: Implementierung für umfassenden HTML-Bericht ausstehend.");
        const filename = _generateFilename('COMPREHENSIVE_REPORT_HTML', { kollektiv: stateManager.getCurrentKollektiv(), extension: 'html' });
        _downloadFile("<html><body><h1>Umfassender Bericht (Platzhalter)</h1><p>Dieser Bericht wird noch implementiert.</p></body></html>", filename, 'text/html;charset=utf-8');
    }

    async function exportCategoryZip(category) {
        if (typeof JSZip === 'undefined' || typeof saveAs === 'undefined') {
            uiHelpers.showToast('ZIP-Export-Bibliotheken (JSZip/FileSaver) nicht geladen.', 'danger');
            return;
        }

        const zip = new JSZip();
        const { currentKollektiv, rawFilteredData, evaluatedData, stats, bfResult, appliedCriteria, appliedLogic } = await _getCommonExportData();
        const baseFilenameOptions = { kollektiv: currentKollektiv };

        try {
            switch (category) {
                case 'all-zip':
                    // Add Statistik CSV
                    const statsCsv = _generateStatistikCsv(stats, currentKollektiv, appliedCriteria, appliedLogic);
                    if (statsCsv) zip.file(_generateFilename('STATS_CSV', { ...baseFilenameOptions, extension: 'csv' }), statsCsv);
                    
                    // Add Brute Force TXT
                    if (bfResult && bfResult.bestResult && bfResult.results) {
                        let bfReportString = `Brute-Force Report für Kollektiv: ${getKollektivDisplayName(currentKollektiv)}\n` +
                                             `Optimierte Metrik: ${bfResult.metric}\n\n`;
                        if (bfResult.bestResult) {
                            bfReportString += `Bestes Ergebnis:\n` +
                                            `  Metrikwert: ${formatNumber(bfResult.bestResult.metricValue, 4)}\n` +
                                            `  Logik: ${bfResult.bestResult.logic}\n` +
                                            `  Kriterien: ${t2CriteriaManager.formatCriteriaForDisplay(bfResult.bestResult.criteria, bfResult.bestResult.logic)}\n\n`;
                        }
                        if (bfResult.results.length > 0) {
                            bfReportString += `Top ${Math.min(bfResult.results.length, 10)} Ergebnisse:\n`;
                            bfReportString += bfResult.results.slice(0, 10).map((r, i) =>
                                `  ${i+1}. Wert: ${formatNumber(r.metricValue, 4)} | Logik: ${r.logic} | Kriterien: ${t2CriteriaManager.formatCriteriaForDisplay(r.criteria, r.logic)}`
                            ).join('\n');
                        }
                        zip.file(_generateFilename('BRUTEFORCE_TXT', { ...baseFilenameOptions, extension: 'txt' }), bfReportString);
                    }

                    // Add Filtered Data CSV
                    const filteredDataCsv = Papa.unparse(rawFilteredData, { header: true, delimiter: ';' });
                    zip.file(_generateFilename('FILTERED_DATA_CSV', { ...baseFilenameOptions, extension: 'csv' }), filteredDataCsv);

                    // Add a placeholder for comprehensive report (if implemented later)
                    // zip.file(_generateFilename('COMPREHENSIVE_REPORT_HTML', { ...baseFilenameOptions, extension: 'html' }), "<html><body><h1>Umfassender Bericht (Platzhalter)</h1></body></html>");
                    
                    // Add Markdown exports (example: descriptive, data, auswertung - if implemented)
                    // This assumes corresponding generation functions exist for MD, similar to publication_generator_service
                    // For now, I'll add the publication sections as MD
                    const pubContext = publikationController.getPublicationContext(dataProcessor.getProcessedData());
                    const publicationSections = PUBLICATION_CONFIG.sections;
                    for (const section of publicationSections) {
                        const content = publicationGeneratorService.generateSection(section.id, pubContext, 'md');
                        if (content) {
                            zip.file(_generateFilename(`PUBLIKATION_${section.id.toUpperCase()}_MD`, { ...baseFilenameOptions, extension: 'md', sectionName: section.id }), content);
                        }
                    }
                    
                    break;
                case 'png-zip':
                case 'svg-zip':
                    const format = category === 'png-zip' ? 'png' : 'svg';
                    const chartsToExport = document.querySelectorAll('.chart-container svg');
                    
                    for (const svgElement of Array.from(chartsToExport)) {
                        const chartId = svgElement.closest('.chart-container').id;
                        const chartName = svgElement.closest('.card')?.querySelector('.card-header')?.textContent.trim() || chartId;
                        let blob;
                        if (format === 'png') {
                            blob = await chartRenderer.convertSvgToPngBlob(svgElement);
                        } else {
                            blob = await chartRenderer.getSvgBlob(svgElement);
                        }
                        if (blob) {
                            zip.file(`${chartName.replace(/[^a-zA-Z0-9_-]/gi, '_')}.${format}`, blob);
                        }
                    }
                    // Also export tables as PNG in png-zip
                    if (format === 'png' && APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT) {
                        const tablesToExport = document.querySelectorAll('.data-table, #auswertung-table');
                        for (const tableElement of Array.from(tablesToExport)) {
                            const tableName = tableElement.closest('.card')?.querySelector('.card-header')?.textContent.trim() || tableElement.id;
                            const canvas = await html2canvas(tableElement, { scale: 2, backgroundColor: '#ffffff' });
                            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                            if (blob) {
                                zip.file(`${tableName.replace(/[^a-zA-Z0-9_-]/gi, '_')}.png`, blob);
                            }
                        }
                    }
                    break;
                case 'excel-workbook': // This case is actually handled by exportExcelWorkbook directly, not via this zip function
                    uiHelpers.showToast("Der Excel-Export wird als einzelne Datei generiert, nicht als ZIP-Paket.", 'info');
                    return;
            }

            const zipFilename = _generateFilename(category.toUpperCase(), { kollektiv: currentKollektiv, extension: 'zip' });
            zip.generateAsync({ type: "blob" })
                .then(function(content) {
                    saveAs(content, zipFilename);
                    uiHelpers.showToast(`ZIP-Archiv '${zipFilename}' erfolgreich heruntergeladen.`, 'success');
                })
                .catch(error => {
                    console.error("Fehler beim Erstellen des ZIP-Archivs:", error);
                    uiHelpers.showToast(`Fehler beim Erstellen des ZIP-Archivs für ${category}.`, 'danger');
                });

        } catch (error) {
            console.error(`Fehler beim Exportieren der Kategorie ${category}:`, error);
            uiHelpers.showToast(`Export für '${category}' fehlgeschlagen. Details in der Konsole.`, 'danger');
        }
    }

    async function exportPublicationSection(sectionId, lang) {
        const pubContext = publikationController.getPublicationContext(dataProcessor.getProcessedData());
        const content = publicationGeneratorService.generateSection(sectionId, pubContext, 'md', lang); // Pass lang parameter
        if (content) {
            const filename = _generateFilename(`PUBLIKATION_${sectionId.toUpperCase()}_MD`, { kollektiv: stateManager.getCurrentKollektiv(), extension: 'md', sectionName: sectionId });
            _downloadFile(content, filename, 'text/markdown;charset=utf-8');
        } else {
            uiHelpers.showToast(`Inhalt für Sektion '${sectionId}' konnte nicht generiert werden.`, 'warning');
        }
    }
    
    return Object.freeze({
        exportStatistikCsv,
        exportBruteForceReport,
        exportFilteredDataAsCsv,
        exportExcelWorkbook,
        exportSingleChart,
        exportSingleTable,
        exportComprehensiveReport,
        exportCategoryZip,
        exportPublicationSection
    });

})();
