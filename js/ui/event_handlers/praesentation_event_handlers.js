const praesentationTabEventHandlers = (() => {

    function handleViewChange(event) {
        if (typeof state === 'undefined' || typeof praesentationTabLogic === 'undefined') {
            console.error("Präsentation Event Handler: State oder PraesentationTabLogic nicht initialisiert.");
            return;
        }
        const target = event.target;
        if (target.name === 'praesentationAnsicht' && target.checked) {
            state.setPresentationView(target.value);
            praesentationTabLogic.renderTabContent();
        }
    }

    function handleStudySelectChange(event) {
        if (typeof state === 'undefined' || typeof praesentationTabLogic === 'undefined') {
            console.error("Präsentation Event Handler: State oder PraesentationTabLogic nicht initialisiert.");
            return;
        }
        const selectedStudyId = event.target.value;
        if (selectedStudyId === "null" || selectedStudyId === "") {
             state.setPresentationStudyId(null);
        } else {
             state.setPresentationStudyId(selectedStudyId);
        }
        praesentationTabLogic.renderTabContent();
    }

    async function handlePraesentationDownloadClick(event) {
        const button = event.target.closest('button[id^="download-praes-"]');
        if (!button || button.disabled || typeof exportService === 'undefined' || typeof state === 'undefined' || typeof praesentationTabLogic === 'undefined') {
            if (typeof ui_helpers !== 'undefined' && ui_helpers.showToast) {
                 ui_helpers.showToast("Exportfunktion nicht bereit oder Button ungültig.", "warning");
            }
            return;
        }

        const buttonId = button.id;
        const currentView = state.getCurrentPresentationView();
        const currentStudyId = state.getCurrentPresentationStudyId();
        const currentKollektiv = state.getCurrentKollektiv();
        const lang = state.getCurrentPublikationLang();
        const exportData = praesentationTabLogic.getPresentationDataForExport(currentView, currentStudyId);

        let filenameType = null;
        let contentToExport = null;
        let exportFunctionName = null;
        let customNamePart = '';
        let fileExtension = '';

        ui_helpers.showToast(`Export '${buttonId}' wird vorbereitet...`, 'info', 1500);

        try {
            switch (buttonId) {
                case 'download-praes-demo-md':
                    filenameType = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PRAES_AS_PERF_MD;
                    contentToExport = tableRenderer.renderDescriptiveStatsTable(exportData.tables.find(t=>t.name === 'Deskriptive_Statistik_AS_Basis')?.data[0], exportData.kollektiv, lang, true);
                    exportFunctionName = '_exportText';
                    customNamePart = 'Demographie_AS_Basis';
                    fileExtension = 'md';
                    break;
                case 'download-praes-perf-as-pur-csv':
                    filenameType = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PRAES_AS_PERF_CSV;
                    contentToExport = exportData.tables.find(t => t.name === 'AS_Performance_Uebersicht')?.data;
                    exportFunctionName = '_exportDataAsCSV';
                    customNamePart = 'Performance_AS_Pur';
                    fileExtension = 'csv';
                    break;
                case 'download-praes-perf-as-pur-md':
                     filenameType = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PRAES_AS_PERF_MD; // Reuse MD type
                     let mdContentASPerf = `### ${lang === 'de' ? 'Diagnostische Güte Avocado Sign' : 'Diagnostic Performance Avocado Sign'}\n\n`;
                     const asPerfData = exportData.tables.find(t => t.name === 'AS_Performance_Uebersicht');
                     if(asPerfData) mdContentASPerf += ui_helpers.escapeMarkdown(tableRenderer._createSimpleTable('temp-as-perf', asPerfData.headers.map(h=>({text:h})), asPerfData.data, '', null, [], 'table-sm', Object.keys(asPerfData.data[0]||{})));
                     contentToExport = mdContentASPerf;
                     exportFunctionName = '_exportText';
                     customNamePart = 'Performance_AS_Pur';
                     fileExtension = 'md';
                    break;
                case 'download-praes-perf-as-vs-t2-csv':
                    filenameType = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PRAES_AS_VS_T2_PERF_CSV;
                    contentToExport = exportData.tables.find(t => t.name.startsWith('Performance_AS_vs_'))?.data;
                    exportFunctionName = '_exportDataAsCSV';
                    customNamePart = `Performance_AS_vs_${exportData.studyId || 'T2'}`;
                    fileExtension = 'csv';
                    break;
                case 'download-praes-comp-table-as-vs-t2-md':
                    filenameType = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PRAES_AS_VS_T2_COMP_MD;
                    let mdContentCompTable = `### ${lang === 'de' ? 'Vergleich Metriken: AS vs.' : 'Comparison Metrics: AS vs.'} ${exportData.studyId || 'T2'}\n\n`;
                    const compTableData = exportData.tables.find(t => t.name.startsWith('Performance_AS_vs_'));
                    if(compTableData) mdContentCompTable += ui_helpers.escapeMarkdown(tableRenderer._createSimpleTable('temp-comp-table', compTableData.headers.map(h=>({text:h})), compTableData.data, '', null, [], 'table-sm', Object.keys(compTableData.data[0]||{})));
                    contentToExport = mdContentCompTable;
                    exportFunctionName = '_exportText';
                    customNamePart = `Vergleich_Metriken_AS_vs_${exportData.studyId || 'T2'}`;
                    fileExtension = 'md';
                    break;
                case 'download-praes-tests-as-vs-t2-md':
                    filenameType = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PRAES_AS_VS_T2_TESTS_MD;
                     let mdContentTests = `### ${lang === 'de' ? 'Statistische Tests: AS vs.' : 'Statistical Tests: AS vs.'} ${exportData.studyId || 'T2'}\n\n`;
                     const testsData = exportData.tables.find(t => t.name.startsWith('Vergleichstests_AS_vs_'));
                     if(testsData) mdContentTests += ui_helpers.escapeMarkdown(tableRenderer._createSimpleTable('temp-tests-table', testsData.headers.map(h=>({text:h})), testsData.data, '', null, [], 'table-sm', Object.keys(testsData.data[0]||{})));
                    contentToExport = mdContentTests;
                    exportFunctionName = '_exportText';
                    customNamePart = `Vergleich_Tests_AS_vs_${exportData.studyId || 'T2'}`;
                    fileExtension = 'md';
                    break;
                default:
                    if (button.classList.contains('chart-download-btn') || button.classList.contains('table-download-png-btn')) {
                         return;
                    }
                    ui_helpers.showToast(`Unbekannter Download-Button-ID: ${buttonId}`, "warning");
                    return;
            }

            if (contentToExport !== null && contentToExport !== undefined) {
                const filename = exportService._generateFilename(filenameType, exportData.kollektiv || currentKollektiv, fileExtension, customNamePart);
                if (exportFunctionName === '_exportDataAsCSV') {
                    exportService._exportDataAsCSV(contentToExport, filename);
                } else if (exportFunctionName === '_exportText') {
                    exportService._exportText(contentToExport, filename);
                }
            } else {
                ui_helpers.showToast("Keine Daten für diesen Export verfügbar.", "warning");
            }

        } catch (error) {
            console.error(`Fehler beim Präsentation-Export '${buttonId}':`, error);
            ui_helpers.showToast(`Fehler beim Export: ${error.message}`, "danger");
        }
    }


    function initialize() {
        const viewSelectorContainer = document.getElementById('praesentation-view-selector');
        if (viewSelectorContainer) {
            viewSelectorContainer.removeEventListener('change', handleViewChange);
            viewSelectorContainer.addEventListener('change', handleViewChange);
        } else {
            console.warn("Präsentation Ansichtsauswahl-Container nicht gefunden für Event Listener.");
        }

        const studySelectElement = document.getElementById('praes-study-select');
        if (studySelectElement) {
            studySelectElement.removeEventListener('change', handleStudySelectChange);
            studySelectElement.addEventListener('change', handleStudySelectChange);
        } else {
            console.warn("Präsentation Studienauswahl nicht gefunden für Event Listener.");
        }

        const tabContentElement = document.getElementById('praesentation-tab-content');
        if (tabContentElement) {
             tabContentElement.removeEventListener('click', handlePraesentationDownloadClick);
             tabContentElement.addEventListener('click', handlePraesentationDownloadClick);
        } else {
            console.warn("Präsentation Tab-Inhaltscontainer nicht gefunden für Download-Event Listener.");
        }
    }

    return Object.freeze({
        initialize
    });

})();
