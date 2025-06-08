const generalEventHandlers = (() => {

    function handleKollektivChange(newKollektiv, appController) {
        if (appController && typeof appController.handleGlobalKollektivChange === 'function') {
            appController.handleGlobalKollektivChange(newKollektiv, "user");
        }
    }

    function handleTabShownEvent(event, appController) {
        if (event.target && event.target.id && appController && typeof appController.processTabChange === 'function') {
            appController.processTabChange(event.target.id);
        }
    }

    function handleSortClick(sortHeader, sortSubHeader, appController) {
        const key = sortHeader?.dataset.sortKey;
        if (!key || !appController || typeof appController.handleSortRequest !== 'function') {
            return;
        }
        const subKey = sortSubHeader?.dataset.subKey || null;
        const tableBody = sortHeader.closest('table')?.querySelector('tbody');
        let tableContext = null;

        if (tableBody?.id === 'daten-table-body') {
            tableContext = 'daten';
        } else if (tableBody?.id === 'auswertung-table-body') {
            tableContext = 'auswertung';
        }

        if (tableContext) {
            appController.handleSortRequest(tableContext, key, subKey);
        }
    }

    function handleSingleChartDownload(button) {
        const chartId = button.dataset.chartId;
        const format = button.dataset.format;
        const chartName = button.dataset.chartName || chartId.replace(/[^a-zA-Z0-9]/g, '_');
        const currentKollektiv = state.getCurrentKollektiv();

        if (chartId && (format === 'png' || format === 'svg')) {
            exportService.exportSingleChart(chartId, format, currentKollektiv, { chartName });
        } else {
            ui_helpers.showToast("Fehler beim Chart-Download: Ungültige Parameter.", "danger");
        }
    }

    function handleSingleTableDownload(button) {
        const tableId = button.dataset.tableId;
        const tableName = button.dataset.tableName || tableId;
        const currentKollektiv = state.getCurrentKollektiv();

        if (tableId && APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT) {
            exportService.exportTablePNG(tableId, currentKollektiv, 'TABLE_PNG_EXPORT', tableName);
        } else if (!tableId) {
            ui_helpers.showToast(`Fehler: Tabellen-ID für PNG-Export nicht gefunden.`, "danger");
        }
    }

    function handleToggleAllDetailsClick(buttonId, tableBodyId) {
        ui_helpers.toggleAllDetails(tableBodyId, buttonId);
    }

    function handleKurzanleitungClick() {
        ui_helpers.showKurzanleitung();
    }

    function handleModalExportBruteForceClick() {
        const currentKollektiv = state.getCurrentKollektiv();
        const resultsData = bruteForceManager.getResultsForKollektiv(currentKollektiv);
        if (resultsData && resultsData.results && resultsData.results.length > 0) {
            exportService.exportBruteForceReport(resultsData);
        } else {
            ui_helpers.showToast("Keine Brute-Force-Ergebnisse für den Export vorhanden.", "warning");
        }
    }

    return Object.freeze({
        handleKollektivChange,
        handleTabShownEvent,
        handleSortClick,
        handleSingleChartDownload,
        handleSingleTableDownload,
        handleToggleAllDetailsClick,
        handleKurzanleitungClick,
        handleModalExportBruteForceClick
    });
})();
