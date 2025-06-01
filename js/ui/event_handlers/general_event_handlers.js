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

        if (tableId && tableId.startsWith('daten-table')) {
            currentSortState = state.getCurrentDatenSortState();
            sortStateUpdater = (newState) => state.setCurrentDatenSortState(newState);
        } else if (tableId && tableId.startsWith('auswertung-table')) {
            currentSortState = state.getCurrentAuswertungSortState();
            sortStateUpdater = (newState) => state.setCurrentAuswertungSortState(newState);
        } else {
            // console.warn(`Sortierung für unbekannte Tabelle ${tableId} nicht implementiert.`);
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
        const currentKollektiv = state.getCurrentKollektiv();

        if (chartId && format && typeof exportService !== 'undefined' && typeof exportService.exportSingleChart === 'function') {
            exportService.exportSingleChart(chartId, format, currentKollektiv, { chartName });
        } else {
            console.warn("Chart-Download fehlgeschlagen: Fehlende Datenattribute oder ExportService nicht verfügbar.", button.dataset);
            ui_helpers.showToast("Fehler beim Vorbereiten des Chart-Downloads.", "warning");
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
                ui_helpers.showToast(`Tabelle mit ID '${tableId}' für PNG-Export nicht im DOM gefunden.`, "warning");
                return;
             }
            exportService.exportTablePNG(tableId, currentKollektiv, typeKey, tableName);
        } else {
            console.warn("Tabellen-PNG-Download fehlgeschlagen: Fehlende Datenattribute oder ExportService nicht verfügbar.", button.dataset);
            ui_helpers.showToast("Fehler beim Vorbereiten des Tabellen-PNG-Downloads.", "warning");
        }
    }
    
    function _addGlobalClickListener() {
        document.body.addEventListener('click', function(event) {
            if (event.target.closest('.chart-download-btn')) {
                _handleChartDownload(event);
            } else if (event.target.closest('.table-download-png-btn')) {
                _handleTablePngDownload(event);
            } else if (event.target.closest('th[data-sort-key]')) {
                 _handleTableSort(event);
            } else if (event.target.closest('#daten-toggle-details')) {
                ui_helpers.toggleAllDetails('daten-table-body', 'daten-toggle-details');
            } else if (event.target.closest('#auswertung-toggle-details')) {
                ui_helpers.toggleAllDetails('auswertung-table-body', 'auswertung-toggle-details');
            }
        });
    }


    function initialize(appInterface) {
        _mainAppInterface = appInterface;
        _addGlobalClickListener();
    }

    return Object.freeze({
        initialize
    });
})();
