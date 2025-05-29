const generalEventHandlers = (() => {
    let mainAppInterfaceRef = null;

    function handleKollektivChange(event) {
        const kollektivId = event.target.dataset.kollektiv;
        if (kollektivId && typeof state !== 'undefined' && mainAppInterfaceRef) {
            if (state.getCurrentKollektiv() !== kollektivId) {
                state.setCurrentKollektiv(kollektivId);
                mainAppInterfaceRef.refreshAllTabs();
                ui_helpers.showToast(`Kollektiv auf '${getKollektivDisplayName(kollektivId)}' umgeschaltet.`, 'info', 2500);
            }
        }
    }

    function handleTabChange(event) {
        event.preventDefault();
        const tabButton = event.target.closest('.nav-link');
        if (tabButton && tabButton.dataset.tabId && typeof state !== 'undefined' && mainAppInterfaceRef) {
            const newTabId = tabButton.dataset.tabId;
            if (state.getActiveTabId() !== newTabId) {
                state.setActiveTabId(newTabId);
                mainAppInterfaceRef.renderCurrentTabContent();
            }
        }
    }

    function handleTableSort(event) {
        const th = event.target.closest('th[data-sort-key]');
        const targetTabLogic = event.target.closest('#daten-tabelle-header') ? dataTabLogic : (event.target.closest('#auswertung-tabelle-header') ? auswertungTabLogic : null);

        if (th && targetTabLogic && typeof targetTabLogic.setSort === 'function') {
            const sortKey = th.dataset.sortKey;
            let subKey = null;
            if (event.target.closest('.sortable-sub-header')) {
                subKey = event.target.closest('.sortable-sub-header').dataset.subKey;
            }
            targetTabLogic.setSort(sortKey, subKey);
        }
    }

    function handleTablePagination(event) {
        event.preventDefault();
        const pageLink = event.target.closest('.page-link');
        const targetTabLogic = event.target.closest('#daten-pagination') ? dataTabLogic : (event.target.closest('#auswertung-pagination') ? auswertungTabLogic : null);

        if (pageLink && pageLink.dataset.page && targetTabLogic && typeof targetTabLogic.setCurrentPage === 'function') {
            const page = parseInt(pageLink.dataset.page, 10);
            if (!isNaN(page)) {
                targetTabLogic.setCurrentPage(page);
            }
        }
    }

    function handleToggleAllDetails(event) {
        const button = event.target.closest('button[id$="-toggle-details"]');
        if (button && typeof ui_helpers !== 'undefined' && typeof ui_helpers.toggleAllDetails === 'function') {
            const tableBodyId = button.id === 'daten-toggle-details' ? 'daten-tabelle-body' : 'auswertung-tabelle-body';
            ui_helpers.toggleAllDetails(tableBodyId, button.id);
        }
    }

    async function handleExportButtonClick(event) {
        const button = event.target.closest('button[id^="export-"]');
        if (!button || button.disabled || typeof exportService === 'undefined' || typeof state === 'undefined') return;

        const exportType = button.id.replace('export-', '');
        const currentKollektiv = state.getCurrentKollektiv();
        const appState = state.getAllState();
        const allData = mainAppInterfaceRef?.getAllData ? mainAppInterfaceRef.getAllData() : [];
        const bfData = typeof bruteForceManager !== 'undefined' ? bruteForceManager.getAllResults() : null;
        const lang = state.getCurrentPublikationLang();

        ui_helpers.showToast(`Export '${exportType.toUpperCase()}' wird vorbereitet...`, 'info', 2000);

        try {
            switch (exportType) {
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.STATS_CSV.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                    if (typeof statistikTabLogic !== 'undefined') exportService.exportStatisticsAsCSV(statistikTabLogic.getStatisticsDataForExport(), currentKollektiv);
                    break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.STATISTIK_XLSX.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                    if (typeof statistikTabLogic !== 'undefined') exportService.exportStatisticsAsXLSX(statistikTabLogic.getStatisticsDataForExport(), currentKollektiv);
                    break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.BRUTEFORCE_TXT.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                    if (bfData && bfData[currentKollektiv]) exportService.exportBruteForceReport(bfData[currentKollektiv], currentKollektiv);
                    else ui_helpers.showToast("Keine Brute-Force Daten für Export.", "warning");
                    break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.BRUTEFORCE_XLSX?.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                     if (bfData && bfData[currentKollektiv] && bfData[currentKollektiv].results) exportService.exportBruteForceResultsXLSX(bfData[currentKollektiv], currentKollektiv);
                     else ui_helpers.showToast("Keine Brute-Force Detailergebnisse für XLSX-Export.", "warning");
                     break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.DESKRIPTIV_MD.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                     if (typeof statistikTabLogic !== 'undefined' && statistikTabLogic.getStatisticsDataForExport()?.deskriptiv) exportService.exportDescriptiveStatsMD(statistikTabLogic.getStatisticsDataForExport().deskriptiv, currentKollektiv);
                    break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.DATEN_MD.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                    if (typeof dataTabLogic !== 'undefined') exportService.exportDatenlisteMD(dataTabLogic.getFilteredDataForExport(), currentKollektiv);
                    break;
                 case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.DATEN_XLSX.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                    if (typeof dataTabLogic !== 'undefined') exportService.exportDatenlisteXLSX(dataTabLogic.getFilteredDataForExport(), currentKollektiv);
                    break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.AUSWERTUNG_MD.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                    if (typeof auswertungTabLogic !== 'undefined') exportService.exportAuswertungMD(auswertungTabLogic.getAuswertungsDataForExport(), currentKollektiv);
                    break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.AUSWERTUNG_XLSX.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                    if (typeof auswertungTabLogic !== 'undefined') exportService.exportAuswertungXLSX(auswertungTabLogic.getAuswertungsDataForExport(), currentKollektiv);
                    break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.FILTERED_DATA_CSV.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                    exportService.exportFilteredDataCSV(dataProcessor.filterDataByKollektiv(allData, currentKollektiv), currentKollektiv);
                    break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.FILTERED_DATA_XLSX.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                    exportService.exportFilteredDataXLSX(dataProcessor.filterDataByKollektiv(allData, currentKollektiv), currentKollektiv);
                    break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.COMPREHENSIVE_REPORT_HTML.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                    exportService.exportComprehensiveReport(appState, allData, bfData);
                    break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.ALL_ZIP.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                    await exportService.exportAllDataAsZip(appState, allData, bfData);
                    break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CSV_ZIP.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                    await exportService.exportCSVFilesAsZip(appState, allData);
                    break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.XLSX_ZIP.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                     await exportService.exportXLSXFilesAsZip(appState, allData, bfData);
                     break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.MD_ZIP.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                     await exportService.exportMDFilesAsZip(appState, allData, bfData);
                     break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PNG_ZIP.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                    await exportService.exportPNGImagesAsZip(appState);
                    break;
                case APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.SVG_ZIP.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase():
                    await exportService.exportSVGImagesAsZip(appState);
                    break;
                default:
                    ui_helpers.showToast(`Unbekannter Export-Typ: ${exportType}`, "warning");
            }
        } catch (error) {
            console.error(`Fehler beim Export-Vorgang '${exportType}':`, error);
            ui_helpers.showToast(`Fehler beim Export: ${error.message}`, "danger");
        }
    }

    async function handleSingleElementDownload(event) {
        const button = event.target.closest('.chart-download-btn, .table-download-png-btn');
        if (!button || button.disabled || typeof exportService === 'undefined' || typeof state === 'undefined') return;

        const chartId = button.dataset.chartId;
        const tableId = button.dataset.tableId;
        const format = button.dataset.format;
        const chartName = button.dataset.chartName || button.dataset.defaultName || (chartId ? chartId.replace('chart-','') : 'Diagramm');
        const tableName = button.dataset.tableName || button.dataset.defaultName || (tableId ? tableId.replace('table-','') : 'Tabelle');
        const currentKollektiv = state.getCurrentKollektiv();

        ui_helpers.showToast(`Export von '${chartName || tableName}' als ${format.toUpperCase()} wird vorbereitet...`, 'info', 1500);

        try {
            if (chartId && format === 'png') {
                await exportService.exportChartAsPNG(chartId, chartName, currentKollektiv);
            } else if (chartId && format === 'svg') {
                exportService.exportChartAsSVG(chartId, chartName, currentKollektiv);
            } else if (tableId && format === 'png') {
                await exportService.exportTableAsPNG(tableId, tableName, currentKollektiv);
            } else {
                ui_helpers.showToast(`Unbekannter Download-Typ für Element. Format: ${format}`, "warning");
            }
        } catch (error) {
            console.error(`Fehler beim Einzel-Download für '${chartName || tableName}':`, error);
            ui_helpers.showToast(`Fehler beim Download: ${error.message}`, "danger");
        }
    }


    function initialize(mainAppInterface) {
        if (!mainAppInterface) {
            console.error("generalEventHandlers: mainAppInterface ist nicht initialisiert.");
            return;
        }
        mainAppInterfaceRef = mainAppInterface;

        const kollektivButtonGroup = document.getElementById('kollektiv-button-group');
        if (kollektivButtonGroup) kollektivButtonGroup.addEventListener('click', handleKollektivChange);

        const mainNavTabs = document.getElementById('main-nav-tabs');
        if (mainNavTabs) mainNavTabs.addEventListener('click', handleTabChange);
        const moreTabsDropdownMenu = document.querySelector('#more-tabs-dropdown-nav + .dropdown-menu');
        if(moreTabsDropdownMenu) moreTabsDropdownMenu.addEventListener('click', handleTabChange);


        const datenTableHeader = document.getElementById('daten-tabelle-header');
        if (datenTableHeader) datenTableHeader.addEventListener('click', handleTableSort);
        const auswertungTableHeader = document.getElementById('auswertung-tabelle-header');
        if (auswertungTableHeader) auswertungTableHeader.addEventListener('click', handleTableSort);

        const datenPagination = document.getElementById('daten-pagination');
        if (datenPagination) datenPagination.addEventListener('click', handleTablePagination);
        const auswertungPagination = document.getElementById('auswertung-pagination');
        if (auswertungPagination) auswertungPagination.addEventListener('click', handleTablePagination);

        const datenToggleDetails = document.getElementById('daten-toggle-details');
        if (datenToggleDetails) datenToggleDetails.addEventListener('click', handleToggleAllDetails);
        const auswertungToggleDetails = document.getElementById('auswertung-toggle-details');
        if (auswertungToggleDetails) auswertungToggleDetails.addEventListener('click', handleToggleAllDetails);

        const kurzanleitungButton = document.getElementById('btn-kurzanleitung');
        if (kurzanleitungButton) kurzanleitungButton.addEventListener('click', ui_helpers.showKurzanleitung);

        const exportTabContent = document.getElementById('export-tab-content');
        if (exportTabContent) exportTabContent.addEventListener('click', handleExportButtonClick);

        document.body.addEventListener('click', function(event){
            if (event.target.closest('.chart-download-btn') || event.target.closest('.table-download-png-btn')) {
                handleSingleElementDownload(event);
            }
        });
    }

    return Object.freeze({
        initialize
    });

})();
