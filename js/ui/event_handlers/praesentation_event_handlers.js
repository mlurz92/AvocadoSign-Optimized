const praesentationEventHandlers = (() => {
    let _mainAppInterface = null;

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
    }

    function handlePresentationViewChange(event) {
        if (!event || !event.target || typeof state === 'undefined' || typeof ui_helpers === 'undefined') return;
        const newView = event.target.value;
        state.setCurrentPresentationView(newView);
        ui_helpers.updatePresentationControlsUI(newView, state.getCurrentPresentationStudyId());
    }

    function handlePresentationStudyChange(event) {
        if (!event || !event.target || typeof state === 'undefined') return;
        const newStudyId = event.target.value;
        state.setCurrentPresentationStudyId(newStudyId);
    }

    function _handleDownload(event) {
        if (!event || !event.currentTarget || typeof exportService === 'undefined' || typeof state === 'undefined') return;
        event.preventDefault();
        const button = event.currentTarget;
        const format = button.dataset.format;
        const chartId = button.dataset.chartId;
        const tableId = button.dataset.tableId;
        const chartName = button.dataset.chartName || button.dataset.defaultName || 'chart';
        const tableName = button.dataset.tableName || button.dataset.defaultName || 'table';
        const stateSnapshot = state.getStateSnapshot();
        const praesentationData = _mainAppInterface.getPraesentationData();

        try {
            if (format === 'csv') {
                if (button.id === 'download-performance-as-pur-csv' && praesentationData?.asPur) {
                    exportService.exportPraesentationAsPurToCSV(praesentationData.asPur, stateSnapshot.currentKollektiv);
                } else if (button.id === 'download-performance-as-vs-t2-csv' && praesentationData?.asVsT2) {
                    exportService.exportPraesentationAsVsT2ToCSV(praesentationData.asVsT2, stateSnapshot.currentKollektiv);
                }
            } else if (format === 'md') {
                 if (button.id === 'download-comp-table-as-vs-t2-md' && praesentationData?.asVsT2) {
                    exportService.exportPraesentationAsVsT2ToMD(praesentationData.asVsT2, stateSnapshot.currentKollektiv);
                } else if (button.id === 'download-tests-as-vs-t2-md' && praesentationData?.asVsT2?.vergleich) {
                    exportService.exportPraesentationComparisonTestsToMD(praesentationData.asVsT2, stateSnapshot.currentKollektiv);
                } else if (button.id === 'dl-praes-as-pur-md' && praesentationData?.asPur) {
                    exportService.exportPraesentationAsPurToMD(praesentationData.asPur, stateSnapshot.currentKollektiv);
                }
            } else if (format === 'png' && chartId) {
                exportService.exportChartToPNG(chartId, chartName);
            } else if (format === 'svg' && chartId) {
                exportService.exportChartToSVG(chartId, chartName);
            } else if (format === 'png' && tableId) {
                 exportService.exportTableToPNG(tableId, tableName);
            } else {
                console.warn('Unbekanntes Download-Format oder fehlende Daten für Präsentationsexport:', button.id);
                ui_helpers.showToast(`Export für ${button.id} nicht implementiert oder Daten fehlen.`, 'warning');
            }
        } catch (error) {
            console.error('Fehler beim Präsentationsexport:', error);
            ui_helpers.showToast(`Fehler beim Export: ${error.message}`, 'error');
        }
    }


    function attachPraesentationEventListeners(containerId = 'praesentation-tab-pane') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container #${containerId} für Präsentations-Event-Listener nicht gefunden.`);
            return;
        }

        const viewRadios = container.querySelectorAll('input[name="praesentationAnsicht"]');
        viewRadios.forEach(radio => {
            radio.removeEventListener('change', handlePresentationViewChange); 
            radio.addEventListener('change', handlePresentationViewChange);
        });

        const studySelect = container.querySelector('#praes-study-select');
        if (studySelect) {
            studySelect.removeEventListener('change', handlePresentationStudyChange); 
            studySelect.addEventListener('change', handlePresentationStudyChange);
        }
        
        const downloadButtons = container.querySelectorAll('.chart-download-btn, .table-download-png-btn, #download-performance-as-pur-csv, #dl-praes-as-pur-md, #download-performance-as-vs-t2-csv, #download-comp-table-as-vs-t2-md, #download-tests-as-vs-t2-md');
        downloadButtons.forEach(button => {
            button.removeEventListener('click', _handleDownload);
            button.addEventListener('click', _handleDownload);
        });
    }

    return Object.freeze({
        initialize,
        attachPraesentationEventListeners,
        handlePresentationViewChange,
        handlePresentationStudyChange
    });
})();
