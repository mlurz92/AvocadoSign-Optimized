const exportController = (() => {

    let mainApp = null;
    let isInitialized = false;

    function _handleExportClick(event) {
        const button = event.target.closest('.export-btn');
        if (!button || button.disabled) return;

        const format = button.dataset.format;
        if (!format) return;
        
        uiHelpers.showToast(`Export für '${format}' wird generiert...`, 'info', 2000);

        try {
            switch (format) {
                case 'stats-csv':
                    exportService.exportStatistikCsv();
                    break;
                case 'bruteforce-txt':
                    exportService.exportBruteForceTxt();
                    break;
                case 'filtered-data-csv':
                    exportService.exportFilteredDataAsCsv();
                    break;
                case 'comprehensive-report-html':
                    exportService.exportComprehensiveReport();
                    break;
                case 'all-zip':
                    exportService.exportAllAsZip();
                    break;
                case 'csv-zip':
                    exportService.exportAllCsvAsZip();
                    break;
                case 'md-zip':
                    exportService.exportAllMarkdownAsZip();
                    break;
                case 'png-zip':
                    exportService.exportAllChartsAsZip('png');
                    break;
                case 'svg-zip':
                    exportService.exportAllChartsAsZip('svg');
                    break;
                case 'xlsx-zip':
                     exportService.exportAllExcelAsZip();
                    break;
                default:
                    uiHelpers.showToast(`Unbekanntes Exportformat: ${format}`, 'warning');
                    break;
            }
        } catch (error) {
            console.error(`Fehler beim Exportieren des Formats ${format}:`, error);
            uiHelpers.showToast(`Export für '${format}' fehlgeschlagen. Siehe Konsole für Details.`, 'danger');
        }
    }

    function _handleGlobalExportClick(event) {
        const button = event.target.closest('.chart-download-btn, .table-download-png-btn');
        if (!button || button.disabled) return;
        
        const { format, chartId, chartName, tableId, tableName } = button.dataset;
        if (!format) return;

        uiHelpers.showToast(`Export für '${format}' wird generiert...`, 'info', 2000);

        try {
            if (chartId) {
                exportService.exportSingleChart(chartId, chartName, format);
            } else if (tableId) {
                 exportService.exportSingleTable(tableId, tableName, format);
            }
        } catch (error) {
            console.error(`Fehler beim globalen Export des Formats ${format}:`, error);
            uiHelpers.showToast(`Export für '${format}' fehlgeschlagen. Siehe Konsole für Details.`, 'danger');
        }
    }

    function updateView() {
        const hasBruteForceResults = bruteForceManager.hasResults();
        const canExportDataDependent = dataProcessor.isDataLoaded();

        const buttons = document.querySelectorAll('#export-tab-pane .export-btn');
        buttons.forEach(button => {
            const format = button.dataset.format;
            let isDisabled = false;
            switch(format) {
                case 'bruteforce-txt':
                    isDisabled = !hasBruteForceResults;
                    break;
                case 'all-zip':
                    isDisabled = !canExportDataDependent && !hasBruteForceResults;
                    break;
                default:
                    isDisabled = !canExportDataDependent;
                    break;
            }
            button.disabled = isDisabled;
        });
    }

    function init(appInterface) {
        if (isInitialized) return;
        mainApp = appInterface;
        
        const pane = document.getElementById('export-tab-pane');
        if (pane) {
            pane.addEventListener('click', _handleExportClick);
        }

        document.body.addEventListener('click', _handleGlobalExportClick);

        isInitialized = true;
    }

    return Object.freeze({
        init,
        updateView
    });

})();
