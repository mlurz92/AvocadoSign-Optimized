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
            await exportService.generateExport(format);
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
            } else if (tableId && tableName && format === 'png') {
                await exportService.exportSingleTableAsPng(tableId, tableName);
            }
        } catch (error) {
            console.error(`Fehler beim globalen Export des Formats ${format} für Element #${chartId || tableId}:`, error);
            uiHelpers.showToast(`Export fehlgeschlagen. Details in der Konsole.`, 'danger');
        }
    }

    function updateView() {
        const hasBruteForceResults = Object.keys(bruteForceManager.getAllResults()).length > 0;
        const hasData = mainApp.getProcessedData().length > 0;

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
        
        exportService.init(mainApp);

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
