const generalEventHandlers = (() => {

    function handleKollektivChange(newKollektiv, mainAppInterface) {
        if (mainAppInterface && typeof mainAppInterface.handleGlobalKollektivChange === 'function') {
            mainAppInterface.handleGlobalKollektivChange(newKollektiv, "user");
        } else {
            console.error("generalEventHandlers.handleKollektivChange: mainAppInterface.handleGlobalKollektivChange ist nicht definiert.");
        }
    }

    function handleTabShownEvent(event, mainAppInterface) {
        if (event.target && event.target.id && mainAppInterface && typeof mainAppInterface.processTabChange === 'function') {
            mainAppInterface.processTabChange(event.target.id);
        } else {
             console.error("generalEventHandlers.handleTabShownEvent: Event-Ziel oder mainAppInterface.processTabChange ist nicht definiert.");
        }
    }

    function handleSortClick(sortHeader, sortSubHeader, mainAppInterface) {
        const key = sortHeader?.dataset.sortKey;
        if (!key || !mainAppInterface || typeof mainAppInterface.handleSortRequest !== 'function') {
            if(!key) console.warn("Sort Key nicht gefunden im Header-Element.");
            if(!mainAppInterface || typeof mainAppInterface.handleSortRequest !== 'function') console.error("mainAppInterface.handleSortRequest ist nicht definiert.");
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
            mainAppInterface.handleSortRequest(tableContext, key, subKey);
        } else {
            console.warn("Unbekannter Tabellenkontext für Sortierung:", tableBody?.id);
        }
    }

    function handleSingleChartDownload(button) {
        const chartId = button.dataset.chartId;
        const format = button.dataset.format;
        const chartName = button.dataset.chartName || button.dataset.defaultName || chartId.replace(/^chart-/, '').replace(/-container$/, '').replace(/-content$/, '').replace(/-[0-9]+$/, '');
        const currentKollektiv = state.getCurrentKollektiv();

        if (chartId && (format === 'png' || format === 'svg')) {
            exportService.exportSingleChart(chartId, format, currentKollektiv, { chartName: chartName });
        } else {
            ui_helpers.showToast("Fehler beim Chart-Download: Ungültige Parameter.", "danger");
            console.error("handleSingleChartDownload: Ungültige Parameter", {chartId, format});
        }
    }

    function handleSingleTableDownload(button) {
        const tableId = button.dataset.tableId;
        const tableName = button.dataset.tableName || button.dataset.defaultName || 'Tabelle';
        const currentKollektiv = state.getCurrentKollektiv();

        if (tableId && APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT) {
            exportService.exportTablePNG(tableId, currentKollektiv, 'TABLE_PNG_EXPORT', tableName);
        } else if (!tableId) {
            ui_helpers.showToast(`Fehler: Tabellen-ID für PNG-Export nicht gefunden für '${tableName}'.`, "danger");
        } else if (!APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT) {
            ui_helpers.showToast("Tabellen-PNG-Export ist derzeit deaktiviert.", "info");
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
