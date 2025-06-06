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
        if (!bfResult) {
            uiHelpers.showToast('Keine Brute-Force-Ergebnisse für das aktuelle Kollektiv vorhanden.', 'warning');
            return;
        }
        const reportString = `Brute-Force Report für Kollektiv: ${getKollektivDisplayName(currentKollektiv)}\n` +
                             `Optimierte Metrik: ${bfResult.metric}\n\n` +
                             payload.results.map((r, i) => `${i+1}. Wert: ${r.metricValue.toFixed(4)} | Logik: ${r.logic} | Kriterien: ${t2CriteriaManager.formatCriteriaForDisplay(r.criteria, r.logic)}`).join('\n');
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
        XLSX.utils.book_append_sheet(wb, configSheet, 'Konfiguration');
        
        const dataSheet = XLSX.utils.json_to_sheet(rawFilteredData);
        XLSX.utils.book_append_sheet(wb, dataSheet, 'Rohdaten');
        
        const auswertungSheet = XLSX.utils.json_to_sheet(evaluatedData.map(p => ({
            ...p, lymphknoten_t2: JSON.stringify(p.lymphknoten_t2), lymphknoten_t2_bewertet: JSON.stringify(p.lymphknoten_t2_bewertet)
        })));
        XLSX.utils.book_append_sheet(wb, auswertungSheet, 'Auswertung');

        const statsCsv = _generateStatistikCsv(stats, currentKollektiv, appliedCriteria, appliedLogic);
        const statsSheet = XLSX.utils.sheet_add_csv(XLSX.utils.aoa_to_sheet([[]]), statsCsv, {delimiter: ';'});
        XLSX.utils.book_append_sheet(wb, statsSheet, 'Statistik');

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
    
    return Object.freeze({
        exportStatistikCsv,
        exportBruteForceReport,
        exportFilteredDataAsCsv,
        exportExcelWorkbook,
        exportSingleChart,
        exportSingleTable
    });

})();
