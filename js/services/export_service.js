const exportService = (() => {

    let mainApp = null;

    function init(appInterface) {
        mainApp = appInterface;
    }

    function _generateFilename(typeKey, options = {}) {
        const { kollektiv, extension, chartName, tableName, studyId, sectionName, lang } = options;
        const dateStr = utils.getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = utils.getKollektivDisplayName(kollektiv).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        let filenameType = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[typeKey] || typeKey || 'Export';

        if (chartName) filenameType = filenameType.replace('{ChartName}', chartName.replace(/[^a-z0-9_-]/gi, '_'));
        if (tableName) filenameType = filenameType.replace('{TableName}', tableName.replace(/[^a-z0-9_-]/gi, '_'));
        if (studyId) filenameType = filenameType.replace('{StudyID}', String(studyId).replace(/[^a-z0-9_-]/gi, '_'));
        if (sectionName) filenameType = filenameType.replace('{SectionName}', String(sectionName).replace(/[^a-z0-9_-]/gi, '_'));
        
        const finalFilename = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE
            .replace('{TYPE}', filenameType)
            .replace('{KOLLEKTIV}', safeKollektiv)
            .replace('{DATE}', dateStr)
            .replace('{EXT}', extension)
            .replace(/_{2,}/g, '_').replace(/_./, (m) => m.toUpperCase()).replace(/_([a-z])/g, (m, p1) => p1.toUpperCase());
        
        return lang ? `${finalFilename}_${lang}` : finalFilename;
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

    function _getPublicationContext() {
        const allProcessedData = mainApp.getGlobalEvaluatedData();
        const lang = stateManager.getCurrentPublikationLang();
        const bfMetric = stateManager.getPublikationBfMetric();
        const appliedT2Criteria = t2CriteriaManager.getCriteria();
        const appliedT2Logic = t2CriteriaManager.getLogic();

        const stats = {};
        const kollektive = dataProcessor.getAvailableKollektive();
        kollektive.forEach(k => {
            const filteredData = dataProcessor.filterDataByKollektiv(allProcessedData, k);
            stats[k] = statisticsService.calculateAllStats(filteredData, appliedT2Criteria, appliedT2Logic);
        });
        
        const bfResult = bruteForceManager.getResultsForKollektiv('Gesamt');
        let bfStats = null;
        if (bfResult && bfResult.bestResult) {
            const gesamtData = dataProcessor.filterDataByKollektiv(allProcessedData, 'Gesamt');
            const bfEvaluated = t2CriteriaManager.evaluateDatasetWithCriteria(gesamtData, bfResult.bestResult.criteria, bfResult.bestResult.logic);
            bfStats = statisticsService.calculateDiagnosticPerformance(bfEvaluated, 't2', 'n');
        }

        if (stats.Gesamt) {
            stats.Gesamt.bruteforce = bfStats;
            if (bfResult && bfResult.bestResult) {
                const gesamtData = dataProcessor.filterDataByKollektiv(allProcessedData, 'Gesamt');
                const evaluatedForComparison = t2CriteriaManager.evaluateDatasetWithCriteria(gesamtData, bfResult.bestResult.criteria, bfResult.bestResult.logic);
                stats.Gesamt.comparison_as_vs_bf = statisticsService.compareDiagnosticMethods(evaluatedForComparison, 'as', 't2', 'n');
            }
        }
        
        return { lang, stats, bruteForceResult: bfResult, bfMetric, appliedT2Criteria, appliedT2Logic };
    }

    async function _getCommonExportData() {
        const globallyEvaluatedData = mainApp.getGlobalEvaluatedData();
        const currentKollektiv = stateManager.getCurrentKollektiv();
        const filteredData = dataProcessor.filterDataByKollektiv(globallyEvaluatedData, currentKollektiv);
        const appliedCriteria = t2CriteriaManager.getCriteria();
        const appliedLogic = t2CriteriaManager.getLogic();
        const stats = statisticsService.calculateAllStats(filteredData, appliedCriteria, appliedLogic);
        const bfResult = bruteForceManager.getResultsForKollektiv(currentKollektiv);
        return { currentKollektiv, filteredData, stats, bfResult };
    }

    function _generateStatistikCsv(stats) {
        if (!stats) return null;
        const csvData = [];
        const fv = (v, d = 4) => (typeof v === 'number' && isFinite(v)) ? v.toFixed(d).replace('.', ',') : 'N/A';
        csvData.push(['Kategorie', 'Metrik', 'Wert', 'CI Lower', 'CI Upper']);
        const processMetrics = (category, metricsObject) => {
            Object.entries(metricsObject).forEach(([key, metric]) => {
                if (typeof metric === 'object' && metric && typeof metric.value === 'number') {
                    csvData.push([category, key, fv(metric.value), fv(metric.ci?.lower), fv(metric.ci?.upper)]);
                }
            });
        };
        if(stats.avocadoSign) processMetrics('Avocado Sign', stats.avocadoSign);
        if(stats.t2) processMetrics('T2 Angewandt', stats.t2);
        return Papa.unparse(csvData, { delimiter: ';' });
    }

    function _generateBruteForceReportText(bfResult, kollektiv) {
        if (!bfResult || !bfResult.results || bfResult.results.length === 0) return '';
        let reportString = `Brute-Force Report für Kollektiv: ${utils.getKollektivDisplayName(kollektiv)}\n` +
                             `Optimierte Metrik: ${bfResult.metric}\n\n`;
        if (bfResult.bestResult) {
            reportString += `Bestes Ergebnis:\n` +
                            `  Metrikwert: ${utils.formatNumber(bfResult.bestResult.metricValue, 4)}\n` +
                            `  Logik: ${bfResult.bestResult.logic}\n` +
                            `  Kriterien: ${t2CriteriaManager.formatCriteriaForDisplay(bfResult.bestResult.criteria, bfResult.bestResult.logic)}\n\n`;
        }
        reportString += `Top ${Math.min(bfResult.results.length, 10)} Ergebnisse:\n`;
        bfResult.results.slice(0, 10).forEach((r, i) => {
            reportString += `  ${i+1}. Wert: ${utils.formatNumber(r.metricValue, 4)} | Logik: ${r.logic} | Kriterien: ${t2CriteriaManager.formatCriteriaForDisplay(r.criteria, r.logic)}\n`;
        });
        return reportString;
    }

    async function exportSingleChart(chartId, format) {
        const svgElement = document.querySelector(`#${chartId} svg`);
        if (!svgElement) {
            uiHelpers.showToast(`Chart-Element #${chartId} für Export nicht gefunden.`, 'danger');
            return;
        }
        const { currentKollektiv } = await _getCommonExportData();
        const chartName = svgElement.closest('.card')?.querySelector('.card-header')?.textContent.trim().split(':')[0] || chartId;
        let blob;
        if (format === 'png') {
            blob = await chartRenderer.convertSvgToPngBlob(svgElement);
        } else if (format === 'svg') {
            blob = await chartRenderer.getSvgBlob(svgElement);
        } else {
            return;
        }
        const filename = _generateFilename(format === 'png' ? 'CHART_SINGLE_PNG' : 'CHART_SINGLE_SVG', { kollektiv: currentKollektiv, extension: format, chartName });
        _downloadFile(blob, filename, blob.type);
    }

    async function exportSingleTableAsPng(tableId, tableName) {
        if (typeof html2canvas === 'undefined') {
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
        _downloadFile(blob, filename, 'image/png');
    }

    async function generateExport(format) {
        const { currentKollektiv, filteredData, stats, bfResult } = await _getCommonExportData();
        let content;
        let filename;
        let mimeType = 'text/plain;charset=utf-8';

        switch (format) {
            case 'stats-csv':
                content = _generateStatistikCsv(stats);
                filename = _generateFilename('STATS_CSV', { kollektiv: currentKollektiv, extension: 'csv' });
                mimeType = 'text/csv;charset=utf-8';
                break;
            case 'bruteforce-txt':
                content = _generateBruteForceReportText(bfResult, currentKollektiv);
                filename = _generateFilename('BRUTEFORCE_TXT', { kollektiv: currentKollektiv, extension: 'txt' });
                break;
            case 'filtered-data-csv':
                content = Papa.unparse(filteredData, { header: true, delimiter: ';' });
                filename = _generateFilename('FILTERED_DATA_CSV', { kollektiv: currentKollektiv, extension: 'csv' });
                mimeType = 'text/csv;charset=utf-8';
                break;
            case 'excel-workbook':
                await exportExcelWorkbook();
                return;
            case 'all-zip':
            case 'png-zip':
            case 'svg-zip':
                await exportCategoryZip(format);
                return;
            default:
                uiHelpers.showToast(`Unbekanntes Exportformat: ${format}`, 'warning');
                return;
        }
        _downloadFile(content, filename, mimeType);
    }

    async function exportExcelWorkbook() {
        if (typeof XLSX === 'undefined') {
            uiHelpers.showToast('Excel-Export-Bibliothek (SheetJS) nicht geladen.', 'danger');
            return;
        }
        
        const globallyEvaluatedData = mainApp.getGlobalEvaluatedData();
        const { currentKollektiv } = await _getCommonExportData();
        const filteredDataForSheet = dataProcessor.filterDataByKollektiv(globallyEvaluatedData, currentKollektiv);

        const appliedCriteria = t2CriteriaManager.getCriteria();
        const appliedLogic = t2CriteriaManager.getLogic();
        const stats = statisticsService.calculateAllStats(filteredDataForSheet, appliedCriteria, appliedLogic);
        
        const wb = XLSX.utils.book_new();

        const configSheet = XLSX.utils.aoa_to_sheet([
            ['Analyse Konfiguration'],
            ['Datum', new Date().toLocaleString('de-DE')],
            ['Kollektiv', utils.getKollektivDisplayName(currentKollektiv)],
            ['Angewandte T2 Logik', appliedLogic],
            ['Angewandte T2 Kriterien', t2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic)]
        ]);
        XLSX.utils.book_append_sheet(wb, configSheet, APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_KONFIG);
        
        const dataSheet = XLSX.utils.json_to_sheet(mainApp.getProcessedData().map(p => ({
            ...p, lymphknoten_t2: JSON.stringify(p.lymphknoten_t2)
        })));
        XLSX.utils.book_append_sheet(wb, dataSheet, APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_DATEN);
        
        const auswertungSheet = XLSX.utils.json_to_sheet(filteredDataForSheet.map(p => ({
            ...p, lymphknoten_t2: JSON.stringify(p.lymphknoten_t2), lymphknoten_t2_bewertet: JSON.stringify(p.lymphknoten_t2_bewertet)
        })));
        XLSX.utils.book_append_sheet(wb, auswertungSheet, APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_AUSWERTUNG);

        const statsCsv = _generateStatistikCsv(stats);
        if (statsCsv) {
            const statsSheet = XLSX.utils.sheet_add_csv(XLSX.utils.aoa_to_sheet([[]]), statsCsv, {delimiter: ';'});
            XLSX.utils.book_append_sheet(wb, statsSheet, APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_STATISTIK);
        }
        
        const filename = _generateFilename('XLSX_ZIP', { kollektiv: currentKollektiv, extension: 'xlsx' });
        XLSX.writeFile(wb, filename);
        uiHelpers.showToast(`Excel-Arbeitsmappe '${filename}' erfolgreich generiert.`, 'success');
    }

    async function exportCategoryZip(category) {
        if (typeof JSZip === 'undefined') {
            uiHelpers.showToast('ZIP-Export-Bibliothek (JSZip) nicht geladen.', 'danger');
            return;
        }

        const zip = new JSZip();
        const { currentKollektiv, filteredData, stats, bfResult } = await _getCommonExportData();
        const baseFilenameOptions = { kollektiv: currentKollektiv };

        try {
            if (category === 'all-zip' || category === 'png-zip' || category === 'svg-zip') {
                const format = category.includes('png') ? 'png' : 'svg';
                const chartsToExport = document.querySelectorAll('.chart-container svg');
                if (chartsToExport.length > 0) {
                    const chartFolder = zip.folder("charts");
                    for (const svgElement of Array.from(chartsToExport)) {
                        const chartId = svgElement.closest('.chart-container').id;
                        const chartName = svgElement.closest('.card')?.querySelector('.card-header')?.textContent.trim().split(':')[0] || chartId;
                        let blob;
                        if (format === 'png') {
                            blob = await chartRenderer.convertSvgToPngBlob(svgElement);
                        } else {
                            blob = await chartRenderer.getSvgBlob(svgElement);
                        }
                        if (blob) {
                            chartFolder.file(`${chartName.replace(/[^a-zA-Z0-9_-]/gi, '_')}.${format}`, blob);
                        }
                    }
                }
            }

            if (category === 'all-zip') {
                const statsCsv = _generateStatistikCsv(stats);
                if (statsCsv) zip.file(_generateFilename('STATS_CSV', { ...baseFilenameOptions, extension: 'csv' }), statsCsv);
                
                const bfReportString = _generateBruteForceReportText(bfResult, currentKollektiv);
                if (bfReportString) zip.file(_generateFilename('BRUTEFORCE_TXT', { ...baseFilenameOptions, extension: 'txt' }), bfReportString);

                const dataCsv = Papa.unparse(filteredData, { header: true, delimiter: ';' });
                zip.file(_generateFilename('FILTERED_DATA_CSV', { ...baseFilenameOptions, extension: 'csv' }), dataCsv);

                const pubContext = _getPublicationContext();
                const pubFolder = zip.folder("publication_markdown");
                for (const section of PUBLICATION_CONFIG.sections) {
                    const contentDe = publicationGeneratorService.generateSection(section.id, { ...pubContext, lang: 'de' }, 'md');
                    if (contentDe) pubFolder.file(`${section.id}_de.md`, contentDe);
                    const contentEn = publicationGeneratorService.generateSection(section.id, { ...pubContext, lang: 'en' }, 'md');
                    if (contentEn) pubFolder.file(`${section.id}_en.md`, contentEn);
                }
            }
            
            const zipFilename = _generateFilename(category.toUpperCase().replace('-', '_'), { kollektiv: currentKollektiv, extension: 'zip' });
            const content = await zip.generateAsync({ type: "blob" });
            _downloadFile(content, zipFilename, 'application/zip');

        } catch (error) {
            console.error(`Fehler beim Erstellen des ZIP-Archivs für Kategorie ${category}:`, error);
            uiHelpers.showToast(`Export für '${category}' fehlgeschlagen. Details in der Konsole.`, 'danger');
        }
    }

    async function exportPublicationSection(sectionId, lang) {
        const pubContext = _getPublicationContext();
        const content = publicationGeneratorService.generateSection(sectionId, { ...pubContext, lang: lang }, 'md');
        if (content) {
            const filename = _generateFilename(`PUBLIKATION_SECTION_MD`, { 
                kollektiv: stateManager.getCurrentKollektiv(), 
                extension: 'md', 
                sectionName: sectionId,
                lang: lang 
            });
            _downloadFile(content, filename, 'text/markdown;charset=utf-8');
        } else {
            uiHelpers.showToast(`Inhalt für Sektion '${sectionId}' konnte nicht generiert werden.`, 'warning');
        }
    }

    return Object.freeze({
        init,
        generateExport,
        exportSingleChart,
        exportSingleTableAsPng,
        exportPublicationSection
    });

})();
