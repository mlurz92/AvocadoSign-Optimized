const generalEventHandlers = (() => {
    let _mainAppInterface = null;

    function _handleTableSort(event) {
        if (!_mainAppInterface) return;
        const th = event.target.closest('th[data-sort-key]');
        if (!th) return;

        const table = th.closest('table');
        if (!table) return;
        
        const tableId = table.id;
        let currentSortState;
        let sortStateUpdater;

        if (tableId && tableId.startsWith('daten-table')) { // Gilt für daten-table und daten-table-sub (falls Sub-Tabellen eigene Sortierung hätten)
            currentSortState = state.getCurrentDatenSortState();
            sortStateUpdater = (newState) => state.setCurrentDatenSortState(newState);
        } else if (tableId && tableId.startsWith('auswertung-table')) {
            currentSortState = state.getCurrentAuswertungSortState();
            sortStateUpdater = (newState) => state.setCurrentAuswertungSortState(newState);
        } else {
            return; 
        }

        const key = th.dataset.sortKey;
        let subKey = null;
        let newDirection = 'asc';

        const targetSpan = event.target.closest('span[data-sub-key]');
        if (targetSpan) {
            subKey = targetSpan.dataset.subKey;
        }
        
        if (currentSortState && currentSortState.key === key && currentSortState.subKey === subKey) {
            newDirection = currentSortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
            newDirection = 'asc';
        }
        
        const newSortState = { key, direction: newDirection, subKey };
        if(sortStateUpdater) sortStateUpdater(newSortState);
        
        if (typeof _mainAppInterface.refreshCurrentTab === 'function') {
            // Bei Tabellen-Sortierung nur dann forceDataRefresh=true, wenn es sich um eine Tabelle handelt,
            // deren Daten direkt von der Sortierung abhängen und neu vom Server/Logik geholt werden müssten.
            // Für Client-seitige Sortierung ist forceDataRefresh=false ausreichend.
            // Da unsere Sortierung die Daten im Client neu anordnet, ist false hier korrekt.
            _mainAppInterface.refreshCurrentTab(false, newSortState); 
        }
    }

    function _handleChartDownload(event) {
        if (!_mainAppInterface) return;
        const button = event.target.closest('.chart-download-btn');
        if (!button) return;

        const chartId = button.dataset.chartId;
        const format = button.dataset.format;
        const chartName = button.dataset.chartName || button.dataset.defaultName || chartId || 'chart';
        const currentKollektiv = state.getCurrentKollektiv(); // state ist global verfügbar

        if (chartId && format && typeof exportService !== 'undefined' && typeof exportService.exportSingleChart === 'function') {
            exportService.exportSingleChart(chartId, format, currentKollektiv, { chartName });
        } else {
            console.warn("Chart-Download fehlgeschlagen: Fehlende Datenattribute oder ExportService nicht verfügbar.", button.dataset);
            if (typeof ui_helpers !== 'undefined' && ui_helpers.showToast) ui_helpers.showToast("Fehler beim Vorbereiten des Chart-Downloads.", "warning");
        }
    }

    function _handleTablePngDownload(event) {
        if (!_mainAppInterface) return;
        const button = event.target.closest('.table-download-png-btn');
        if (!button) return;

        const tableId = button.dataset.tableId;
        const tableName = button.dataset.tableName || button.dataset.defaultName || tableId || 'table';
        const currentKollektiv = state.getCurrentKollektiv();
        const typeKey = button.dataset.typeKey || 'TABLE_PNG_EXPORT';


        if (tableId && typeof exportService !== 'undefined' && typeof exportService.exportTablePNG === 'function') {
             if (!document.getElementById(tableId)) {
                if (typeof ui_helpers !== 'undefined' && ui_helpers.showToast) ui_helpers.showToast(`Tabelle mit ID '${tableId}' für PNG-Export nicht im DOM gefunden.`, "warning");
                return;
             }
            exportService.exportTablePNG(tableId, currentKollektiv, typeKey, tableName);
        } else {
            console.warn("Tabellen-PNG-Download fehlgeschlagen: Fehlende Datenattribute oder ExportService nicht verfügbar.", button.dataset);
            if (typeof ui_helpers !== 'undefined' && ui_helpers.showToast) ui_helpers.showToast("Fehler beim Vorbereiten des Tabellen-PNG-Downloads.", "warning");
        }
    }
    
    function _addGlobalClickListener() {
        document.body.addEventListener('click', function(event) {
            // Event-Delegation für dynamisch hinzugefügte Elemente
            const targetElement = event.target;

            if (targetElement.closest('.chart-download-btn')) {
                _handleChartDownload(event);
            } else if (targetElement.closest('.table-download-png-btn')) {
                _handleTablePngDownload(event);
            } else if (targetElement.closest('th[data-sort-key]')) {
                 _handleTableSort(event);
            } else if (targetElement.closest('#daten-toggle-details')) {
                if (typeof ui_helpers !== 'undefined' && ui_helpers.toggleAllDetails) ui_helpers.toggleAllDetails('daten-table-body', 'daten-toggle-details');
            } else if (targetElement.closest('#auswertung-toggle-details')) {
                if (typeof ui_helpers !== 'undefined' && ui_helpers.toggleAllDetails) ui_helpers.toggleAllDetails('auswertung-table-body', 'auswertung-toggle-details');
            }
        });
    }


    function initialize(appInterface) {
        _mainAppInterface = appInterface;
        _addGlobalClickListener();
        // Hier könnten weitere globale Listener initialisiert werden, falls nötig.
    }

    return Object.freeze({
        initialize
    });
})();
