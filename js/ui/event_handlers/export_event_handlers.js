const exportEventHandlers = (() => {
    const exportButtonIds = [
        'export-statistik-csv',
        'export-bruteforce-txt',
        'export-deskriptiv-md',
        'export-daten-md',
        'export-auswertung-md',
        'export-filtered-data-csv',
        'export-comprehensive-report-html',
        'export-charts-png',
        'export-charts-svg',
        'export-all-zip',
        'export-csv-zip',
        'export-md-zip',
        'export-png-zip',
        'export-svg-zip'
    ];
    
    const publicationExportButtonIdsAndTypes = [
        { idPrefix: 'export-pub-meth-', typeBase: 'publikationMethodenMD' },
        { idPrefix: 'export-pub-ergeb-', typeBase: 'publikationErgebnisseMD' },
        { id: 'export-pub-refs-md', type: 'publikationReferenzenMD', sectionName: 'referenzen_liste' },
        { id: 'export-pub-refs-bib', type: 'referencesBibTeX' },
        { idPrefix: 'export-pub-table-tsv-', typeBase: 'publicationTableTSV' }
    ];


    function _handleStandardExport(event) {
        if (!mainAppInterface || typeof mainAppInterface.handleExportRequest !== 'function') {
            console.error("mainAppInterface.handleExportRequest ist nicht verfügbar.");
            ui_helpers.showToast("Exportfunktion ist nicht bereit.", "danger");
            return;
        }
        const buttonId = event.currentTarget.id;
        const exportType = buttonId.replace('export-', '');
        
        let options = {};
        if (exportType === 'bruteforce-txt') {
            options.kollektiv = bruteForceManager.getCurrentKollektiv() || stateManager.getCurrentKollektiv();
            options.metric = bruteForceManager.getCurrentTargetMetric() || stateManager.getBruteForceMetric();
        }
        
        mainAppInterface.handleExportRequest(exportType, options);
    }

    function _handleDynamicExport(event) {
        if (!mainAppInterface || typeof mainAppInterface.handleExportRequest !== 'function') {
            console.error("mainAppInterface.handleExportRequest ist nicht verfügbar.");
            ui_helpers.showToast("Exportfunktion ist nicht bereit.", "danger");
            return;
        }
        const button = event.target.closest('button');
        if (!button) return;

        const chartId = button.dataset.chartId;
        const tableId = button.dataset.tableId;
        const format = button.dataset.format;
        const chartName = button.dataset.chartName || button.dataset.defaultName || 'Diagramm';
        const tableName = button.dataset.tableName || button.dataset.defaultName || 'Tabelle';

        if (chartId && format) {
            const exportType = format === 'png' ? 'chartSinglePNG' : 'chartSingleSVG';
            mainAppInterface.handleExportRequest(exportType, { chartId: chartId, chartName: chartName, format: format });
        } else if (tableId && format === 'png') {
             mainAppInterface.handleExportRequest('tableSinglePNG', { tableId: tableId, tableName: tableName, format: format });
        }
    }
    
    function _handlePublicationExport(event) {
        if (!mainAppInterface || typeof mainAppInterface.handleExportRequest !== 'function') {
            console.error("mainAppInterface.handleExportRequest ist nicht verfügbar.");
            ui_helpers.showToast("Exportfunktion ist nicht bereit.", "danger");
            return;
        }
        const buttonId = event.currentTarget.id;
        let exportType = '';
        let options = {};

        publicationExportButtonIdsAndTypes.forEach(config => {
            if (config.id === buttonId) {
                exportType = config.type;
                if (config.sectionName) options.sectionName = config.sectionName;
                if (config.tableKey) options.tableKey = config.tableKey;
            } else if (config.idPrefix && buttonId.startsWith(config.idPrefix)) {
                exportType = config.typeBase;
                options.sectionName = buttonId.substring(config.idPrefix.length);
                 if(config.typeBase === 'publicationTableTSV') {
                    options.tableKey = options.sectionName; 
                 }
            }
        });
        
        if (exportType) {
            mainAppInterface.handleExportRequest(exportType, options);
        } else {
            console.warn(`Unbekannter Publikations-Export-Button geklickt: ${buttonId}`);
        }
    }


    function register() {
        const exportTabPane = document.getElementById('export-tab-pane');
        if (exportTabPane) {
            exportButtonIds.forEach(id => {
                const button = document.getElementById(id);
                if (button) {
                    button.removeEventListener('click', _handleStandardExport); 
                    button.addEventListener('click', _handleStandardExport);
                } else {
                    console.warn(`Export-Button mit ID '${id}' nicht im DOM gefunden.`);
                }
            });
        } else {
             console.warn("Export-Tab-Pane 'export-tab-pane' nicht gefunden. Standard-Export-Handler nicht registriert.");
        }
        
        const publicationTabPane = document.getElementById('publikation-tab-pane');
        if (publicationTabPane) {
            publicationExportButtonIdsAndTypes.forEach(config => {
                if (config.id) {
                    const button = document.getElementById(config.id);
                    if (button) {
                        button.removeEventListener('click', _handlePublicationExport);
                        button.addEventListener('click', _handlePublicationExport);
                    }
                } else if (config.idPrefix) {
                    // Für dynamisch generierte Buttons mit Präfix (z.B. pro Sektion)
                    // Diese müssen entweder hier explizit gesucht werden oder besser:
                    // ein delegierter Event-Listener wird auf publicationTabPane gesetzt.
                    // Für jetzt gehen wir davon aus, dass die Buttons bei Bedarf neu registriert werden.
                }
            });
        }


        document.body.removeEventListener('click', _handleDynamicExportDelegated);
        document.body.addEventListener('click', _handleDynamicExportDelegated);
    }
    
    function _handleDynamicExportDelegated(event) {
        const chartDownloadBtn = event.target.closest('.chart-download-btn');
        const tableDownloadPngBtn = event.target.closest('.table-download-png-btn');

        if (chartDownloadBtn) {
            _handleDynamicExport({ target: chartDownloadBtn });
        } else if (tableDownloadPngBtn) {
            _handleDynamicExport({ target: tableDownloadPngBtn });
        }
    }

    return {
        register
    };
})();
