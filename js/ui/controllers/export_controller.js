const exportController = (() => {

    let mainApp = null;
    let isInitialized = false;
    let paneElement = null;

    async function _handleExportClick(event) {
        const button = event.target.closest('.export-btn');
        if (!button || button.disabled) return;

        const format = button.dataset.format;
        if (!format) return;
        
        uiHelpers.showToast(`Export für '${format}' wird generiert...`, 'info', 2000);

        try {
            switch (format) {
                case 'stats-csv':
                    await exportService.exportStatistikCsv();
                    break;
                case 'bruteforce-txt':
                    await exportService.exportBruteForceReport();
                    break;
                case 'filtered-data-csv':
                    await exportService.exportFilteredDataAsCsv();
                    break;
                case 'comprehensive-report-html':
                    await exportService.exportComprehensiveReport();
                    break;
                case 'all-zip':
                    await exportService.exportCategoryZip('all-zip');
                    break;
                case 'png-zip':
                    await exportService.exportCategoryZip('png-zip');
                    break;
                case 'svg-zip':
                    await exportService.exportCategoryZip('svg-zip');
                    break;
                case 'excel-workbook':
                    await exportService.exportExcelWorkbook();
                    break;
                default:
                    uiHelpers.showToast(`Unbekanntes Exportformat: ${format}`, 'warning');
            }
        } catch (error) {
            console.error(`Fehler beim Exportieren des Formats ${format}:`, error);
            uiHelpers.showToast(`Export für '${format}' fehlgeschlagen. Details in der Konsole.`, 'danger');
        }
    }

    async function _handleGlobalDownloadClick(event) {
        const button = event.target.closest('.chart-download-btn, .table-download-btn');
        if (!button || button.disabled) return;
        
        const { format, chartId, chartName, tableId, tableName } = button.dataset;
        if (!format) return;

        uiHelpers.showToast(`Export für '${format}' wird generiert...`, 'info', 1500);

        try {
            if (chartId) {
                await exportService.exportSingleChart(chartId, format);
            } else if (tableId) {
                await exportService.exportSingleTable(tableId, tableName, format);
            }
        } catch (error) {
            console.error(`Fehler beim globalen Export des Formats ${format}:`, error);
            uiHelpers.showToast(`Export fehlgeschlagen. Details in der Konsole.`, 'danger');
        }
    }

    function updateView() {
        const hasBruteForceResults = Object.keys(bruteForceManager.getAllResults()).length > 0;
        const hasData = dataProcessor.getProcessedData().length > 0;

        const buttonConfigs = [
            { id: 'export-stats-csv', condition: hasData },
            { id: 'export-bruteforce-txt', condition: hasBruteForceResults },
            { id: 'export-filtered-data-csv', condition: hasData },
            { id: 'export-comprehensive-report-html', condition: hasData },
            { id: 'export-all-zip', condition: hasData },
            { id: 'export-charts-png-zip', condition: hasData },
            { id: 'export-charts-svg-zip', condition: hasData },
            { id: 'export-excel-workbook', condition: hasData }
        ];

        buttonConfigs.forEach(config => {
            const button = document.getElementById(config.id);
            if (button) {
                button.disabled = !config.condition;
            }
        });
    }

    function init(app) {
        if (isInitialized) return;
        mainApp = app;
        paneElement = document.getElementById('export-tab-pane');
        
        // Add global click listener for download buttons in cards
        document.body.addEventListener('click', _handleGlobalDownloadClick);
        isInitialized = true;
    }
    
    function onTabEnter() {
        if(paneElement) {
           paneElement.addEventListener('click', _handleExportClick);
        }
        updateView();
    }

    function onTabExit() {
        if(paneElement) {
           paneElement.removeEventListener('click', _handleExportClick);
        }
    }

    return Object.freeze({
        init,
        onTabEnter,
        onTabExit
    });

})();
