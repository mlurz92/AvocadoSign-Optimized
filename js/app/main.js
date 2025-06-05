let app = {
    state: state,
    data: null,
    processedData: null,
    listenersInitialized: false,
    bruteForceWorker: null,
    bruteForceManager: bruteForceManager,
    ui_helpers: ui_helpers,
    initialized: false,
    currentTab: 'daten-tab',
    t2CriteriaManager: t2CriteriaManager,
    dataProcessor: dataProcessor,
    statisticsService: statisticsService,
    exportService: exportService
};

const mainAppInterface = (() => {

    async function loadData() {
        try {
            const response = await fetch('data/data.js');
            let data = await response.text();
            data = data.replace(/^const patientDataRaw = /m, '').replace(/,\s*\]\s*;?$/m, ']').replace(/;$/m, '');
            app.data = JSON.parse(data);
            app.processedData = app.data;
        } catch (error) {
            ui_helpers.showToast('Fehler beim Laden der Daten: ' + error.message, 'danger');
            app.data = [];
            app.processedData = [];
        }
    }

    function applyT2CriteriaAndRecalculate() {
        const currentCriteria = app.state.getAppliedT2Criteria();
        const currentLogic = app.state.getAppliedT2Logic();
        app.processedData = app.t2CriteriaManager.evaluateDataset(cloneDeep(app.data), currentCriteria, currentLogic);
        ui_helpers.markCriteriaSavedIndicator(false);
        updateUI();
    }

    function updateUI() {
        const currentKollektiv = app.state.getCurrentKollektiv();
        const appliedCriteria = app.state.getAppliedT2Criteria();
        const appliedLogic = app.state.getAppliedT2Logic();
        const statsLayout = app.state.getCurrentStatsLayout();
        const statsKollektiv1 = app.state.getCurrentStatsKollektiv1();
        const statsKollektiv2 = app.state.getCurrentStatsKollektiv2();
        const presentationView = app.state.getCurrentPresentationView();
        const presentationStudyId = app.state.getCurrentPresentationStudyId();
        const publikationLang = app.state.getCurrentPublikationLang();
        const publikationSection = app.state.getCurrentPublikationSection();
        const rawDataForPublikation = app.data;
        const bruteForceResultsForPublikation = app.bruteForceManager.getResults();

        ui_helpers.updateHeaderStatsUI({
            kollektiv: getKollektivDisplayName(currentKollektiv),
            anzahlPatienten: app.dataProcessor.filterDataByKollektiv(app.processedData, currentKollektiv).length,
            statusN: app.dataProcessor.getNStatusSummary(app.dataProcessor.filterDataByKollektiv(app.processedData, currentKollektiv)),
            statusAS: app.dataProcessor.getASStatusSummary(app.dataProcessor.filterDataByKollektiv(app.processedData, currentKollektiv)),
            statusT2: app.dataProcessor.getT2StatusSummary(app.dataProcessor.filterDataByKollektiv(app.processedData, currentKollektiv))
        });

        ui_helpers.updateKollektivButtonsUI(currentKollektiv);
        ui_helpers.updateExportButtonStates(app.currentTab, app.bruteForceManager.hasResults(), app.processedData && app.processedData.length > 0);
        ui_helpers.updateT2CriteriaControlsUI(appliedCriteria, appliedLogic);
        ui_helpers.updateStatistikSelectorsUI(statsLayout, statsKollektiv1, statsKollektiv2);
        ui_helpers.updatePresentationViewSelectorUI(presentationView);
        ui_helpers.updatePublikationUI(publikationLang, publikationSection, app.state.getCurrentPublikationBruteForceMetric());
        
        refreshCurrentTab();
    }

    function refreshCurrentTab() {
        const currentKollektiv = app.state.getCurrentKollektiv();
        const currentSortState = app.state.getDatenTableSort();
        const appliedCriteria = app.state.getAppliedT2Criteria();
        const appliedLogic = app.state.getAppliedT2Logic();
        const bfWorkerAvailable = app.bruteForceManager.isWorkerAvailable();
        const statsLayout = app.state.getCurrentStatsLayout();
        const statsKollektiv1 = app.state.getCurrentStatsKollektiv1();
        const statsKollektiv2 = app.state.getCurrentStatsKollektiv2();
        const presentationView = app.state.getCurrentPresentationView();
        const presentationStudyId = app.state.getCurrentPresentationStudyId();
        const publikationLang = app.state.getCurrentPublikationLang();
        const publikationSection = app.state.getCurrentPublikationSection();
        const rawDataForPublikation = app.data;
        const bruteForceResultsForPublikation = app.bruteForceManager.getResults();

        const filteredData = app.dataProcessor.filterDataByKollektiv(app.processedData, currentKollektiv);
        const allPatientData = app.data;

        switch (app.currentTab) {
            case 'daten-tab':
                viewRenderer.renderDatenTab(filteredData, currentSortState);
                break;
            case 'auswertung-tab':
                viewRenderer.renderAuswertungTab(filteredData, appliedCriteria, appliedLogic, currentSortState, currentKollektiv, bfWorkerAvailable);
                break;
            case 'statistik-tab':
                viewRenderer.renderStatistikTab(app.processedData, appliedCriteria, appliedLogic, statsLayout, statsKollektiv1, statsKollektiv2, currentKollektiv);
                break;
            case 'praesentation-tab':
                viewRenderer.renderPresentationTab(presentationView, presentationStudyId, currentKollektiv, app.processedData, appliedCriteria, appliedLogic);
                break;
            case 'publikation-tab':
                viewRenderer.renderPublikationTab(publikationLang, publikationSection, currentKollektiv, rawDataForPublikation, bruteForceResultsForPublikation);
                // Wichtig: Charts und Tooltips erst initialisieren, nachdem HTML im DOM ist
                // Dies wird nun von publikationTabLogic.updateDynamicChartsForPublicationTab übernommen,
                // welche von renderPublikationTab aufgerufen wird
                break;
            case 'export-tab':
                viewRenderer.renderExportTab(currentKollektiv);
                break;
            default:
                break;
        }
    }

    function initializeListeners() {
        if (app.listenersInitialized) return;

        document.querySelectorAll('.nav-link[data-bs-toggle="tab"]').forEach(tabLink => {
            tabLink.addEventListener('shown.bs.tab', function (event) {
                app.currentTab = event.target.id;
                app.state.setActiveTabId(app.currentTab);
                updateUI();
            });
        });

        document.querySelectorAll('header .btn-group button').forEach(button => {
            button.addEventListener('click', function () {
                const kollektiv = this.dataset.kollektiv;
                if (kollektiv) {
                    app.state.setCurrentKollektiv(kollektiv);
                    updateUI();
                }
            });
        });

        document.getElementById('kurzanleitung-button').addEventListener('click', ui_helpers.showKurzanleitung);

        document.getElementById('btn-apply-criteria').addEventListener('click', applyT2CriteriaAndRecalculate);
        document.getElementById('btn-reset-criteria').addEventListener('click', () => {
            app.state.resetT2Criteria();
            ui_helpers.showToast("T2-Kriterien auf Standard zurückgesetzt. Klicken Sie auf 'Anwenden & Speichern'.", "info");
            ui_helpers.updateT2CriteriaControlsUI(app.state.getAppliedT2Criteria(), app.state.getAppliedT2Logic());
            ui_helpers.markCriteriaSavedIndicator(true);
        });

        document.getElementById('t2-logic-switch').addEventListener('change', function() {
            const newLogic = this.checked ? 'ODER' : 'UND';
            app.state.setAppliedT2Logic(newLogic);
            ui_helpers.updateT2CriteriaControlsUI(app.state.getAppliedT2Criteria(), app.state.getAppliedT2Logic());
            ui_helpers.markCriteriaSavedIndicator(true);
        });
        document.querySelectorAll('.t2-criteria-button').forEach(button => {
            button.addEventListener('click', function() {
                const criterion = this.dataset.criterion;
                const value = this.dataset.value;
                app.state.updateT2CriterionValue(criterion, value);
                ui_helpers.updateT2CriteriaControlsUI(app.state.getAppliedT2Criteria(), app.state.getAppliedT2Logic());
                ui_helpers.markCriteriaSavedIndicator(true);
            });
        });
        document.querySelectorAll('input.criteria-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const criterion = this.value;
                const isActive = this.checked;
                app.state.setT2CriterionActive(criterion, isActive);
                ui_helpers.updateT2CriteriaControlsUI(app.state.getAppliedT2Criteria(), app.state.getAppliedT2Logic());
                ui_helpers.markCriteriaSavedIndicator(true);
            });
        });
        document.getElementById('input-size').addEventListener('change', function() {
            const size = parseFloat(this.value);
            if (!isNaN(size) && size >= APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min && size <= APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max) {
                app.state.updateT2CriterionSize(size);
                ui_helpers.updateT2CriteriaControlsUI(app.state.getAppliedT2Criteria(), app.state.getAppliedT2Logic());
                ui_helpers.markCriteriaSavedIndicator(true);
            } else {
                 ui_helpers.showToast(`Ungültige Größe. Bereich: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min}-${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm.`, 'warning');
                 this.value = app.state.getAppliedT2Criteria().size.threshold;
            }
        });
        document.getElementById('range-size').addEventListener('input', function() {
            const size = parseFloat(this.value);
            if (!isNaN(size)) {
                app.state.updateT2CriterionSize(size);
                ui_helpers.updateT2CriteriaControlsUI(app.state.getAppliedT2Criteria(), app.state.getAppliedT2Logic());
                ui_helpers.markCriteriaSavedIndicator(true);
            }
        });


        document.getElementById('statistik-toggle-vergleich').addEventListener('click', function() {
            const currentLayout = app.state.getCurrentStatsLayout();
            const newLayout = currentLayout === 'einzel' ? 'vergleich' : 'einzel';
            app.state.setCurrentStatsLayout(newLayout);
            updateUI();
        });
        document.getElementById('statistik-kollektiv-select-1').addEventListener('change', function() {
            app.state.setCurrentStatsKollektiv1(this.value);
            updateUI();
        });
        document.getElementById('statistik-kollektiv-select-2').addEventListener('change', function() {
            app.state.setCurrentStatsKollektiv2(this.value);
            updateUI();
        });

        document.querySelectorAll('input[name="praesentationAnsicht"]').forEach(radio => {
            radio.addEventListener('change', function() {
                app.state.setCurrentPresentationView(this.value);
                updateUI();
            });
        });
        document.getElementById('praes-study-select').addEventListener('change', function() {
            app.state.setCurrentPresentationStudyId(this.value);
            updateUI();
        });

        document.getElementById('btn-start-brute-force').addEventListener('click', async () => {
            ui_helpers.showToast("Brute-Force-Optimierung gestartet. Dies kann einige Minuten dauern. Bitte warten Sie.", "info", 6000);
            const currentKollektiv = app.state.getCurrentKollektiv();
            const targetMetric = document.getElementById('brute-force-metric').value;
            ui_helpers.updateBruteForceUI('start', { kollektiv: currentKollektiv, metric: targetMetric }, app.bruteForceManager.isWorkerAvailable(), currentKollektiv);
            try {
                const results = await app.bruteForceManager.startOptimization(app.dataProcessor.filterDataByKollektiv(app.data, currentKollektiv), targetMetric);
                app.state.setBruteForceResults(currentKollektiv, results, targetMetric); // Speichern der Ergebnisse im State
                ui_helpers.updateBruteForceUI('result', app.bruteForceManager.getResultsForKollektiv(currentKollektiv), app.bruteForceManager.isWorkerAvailable(), currentKollektiv);
                ui_helpers.showToast("Brute-Force-Optimierung abgeschlossen!", "success");
                updateUI(); // UI aktualisieren, um ggf. neue Stats anzuzeigen
            } catch (error) {
                ui_helpers.showToast(`Brute-Force-Optimierung fehlgeschlagen: ${error.message}`, 'danger');
                app.bruteForceManager.cancelOptimization();
                ui_helpers.updateBruteForceUI('error', { message: error.message, kollektiv: currentKollektiv, metric: targetMetric }, app.bruteForceManager.isWorkerAvailable(), currentKollektiv);
            }
        });
        document.getElementById('btn-cancel-brute-force').addEventListener('click', () => {
            app.bruteForceManager.cancelOptimization();
            ui_helpers.showToast("Brute-Force-Optimierung abgebrochen.", "warning");
            ui_helpers.updateBruteForceUI('cancelled', {}, app.bruteForceManager.isWorkerAvailable(), app.state.getCurrentKollektiv());
        });
        app.bruteForceManager.onProgress((progress) => {
            ui_helpers.updateBruteForceUI('progress', progress, app.bruteForceManager.isWorkerAvailable(), app.state.getCurrentKollektiv());
        });
        document.getElementById('btn-show-brute-force-details').addEventListener('click', () => {
            const bfResults = app.bruteForceManager.getResultsForKollektiv(app.state.getCurrentKollektiv());
            if (bfResults) {
                const modalBody = document.getElementById('brute-force-modal-body');
                if (modalBody) {
                    modalBody.innerHTML = uiComponents.createBruteForceModalContent(bfResults);
                    ui_helpers.initializeTooltips(modalBody);
                }
            }
        });
        document.getElementById('btn-apply-best-bf-criteria').addEventListener('click', () => {
             const currentKollektiv = app.state.getCurrentKollektiv();
             const bfResults = app.bruteForceManager.getResultsForKollektiv(currentKollektiv);
             if (bfResults?.bestResult?.criteria) {
                 app.state.setAppliedT2Criteria(bfResults.bestResult.criteria);
                 app.state.setAppliedT2Logic(bfResults.bestResult.logic);
                 ui_helpers.showToast("Beste Brute-Force-Kriterien angewendet und gespeichert!", "success");
                 applyT2CriteriaAndRecalculate(); // Re-evaluate and update UI
             } else {
                 ui_helpers.showToast("Keine optimalen Kriterien zum Anwenden gefunden.", "warning");
             }
        });
        document.getElementById('brute-force-metric').addEventListener('change', function() {
            const newMetric = this.value;
            app.state.setBruteForceMetric(newMetric);
        });

        // Publikation Tab Listeners
        document.getElementById('publikation-sprache-switch').addEventListener('change', function() {
            const newLang = this.checked ? 'en' : 'de';
            app.state.setCurrentPublikationLang(newLang);
            updateUI();
        });
        document.getElementById('publikation-bf-metric-select').addEventListener('change', function() {
            const newMetric = this.value;
            app.state.setCurrentPublikationBruteForceMetric(newMetric);
            updateUI();
        });
        document.querySelectorAll('.publikation-section-link').forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const sectionId = this.dataset.sectionId;
                if (sectionId) {
                    app.state.setCurrentPublikationSection(sectionId);
                    updateUI();
                }
            });
        });


        // Export Button Listeners
        document.getElementById('export-statistik-csv').addEventListener('click', () => exportService.exportTableToCsv('statistik-table-container', 'STATS_CSV', app.state.getCurrentKollektiv()));
        document.getElementById('export-deskriptiv-md').addEventListener('click', () => {
             const currentKollektiv = app.state.getCurrentKollektiv();
             const stats = app.statisticsService.calculateDescriptiveStats(app.dataProcessor.filterDataByKollektiv(app.processedData, currentKollektiv));
             const mdContent = statistikTabLogic.createDeskriptiveStatistikContentMarkdown(stats, currentKollektiv);
             exportService.exportMarkdown(mdContent, 'DESKRIPTIV_MD', currentKollektiv);
        });
        document.getElementById('export-daten-md').addEventListener('click', () => {
            const currentKollektiv = app.state.getCurrentKollektiv();
            const mdContent = dataTabLogic.createDatenTableMarkdown(app.dataProcessor.filterDataByKollektiv(app.data, currentKollektiv), app.state.getDatenTableSort());
            exportService.exportMarkdown(mdContent, 'DATEN_MD', currentKollektiv);
        });
        document.getElementById('export-auswertung-md').addEventListener('click', () => {
            const currentKollektiv = app.state.getCurrentKollektiv();
            const mdContent = auswertungTabLogic.createAuswertungTableMarkdown(app.dataProcessor.filterDataByKollektiv(app.processedData, currentKollektiv), app.state.getDatenTableSort(), app.state.getAppliedT2Criteria(), app.state.getAppliedT2Logic());
            exportService.exportMarkdown(mdContent, 'AUSWERTUNG_MD', currentKollektiv);
        });
        document.getElementById('export-bruteforce-txt').addEventListener('click', () => {
             const currentKollektiv = app.state.getCurrentKollektiv();
             const bfResults = app.bruteForceManager.getResultsForKollektiv(currentKollektiv);
             if (bfResults) {
                 const textContent = bruteForceManager.createBruteForceReportText(bfResults);
                 exportService.exportTextFile(textContent, 'BRUTEFORCE_TXT', currentKollektiv);
             } else {
                 ui_helpers.showToast("Keine Brute-Force-Ergebnisse zum Exportieren vorhanden.", "warning");
             }
        });
        document.getElementById('export-filtered-data-csv').addEventListener('click', () => {
            const currentKollektiv = app.state.getCurrentKollektiv();
            const csvContent = dataProcessor.exportFilteredDataCsv(app.dataProcessor.filterDataByKollektiv(app.processedData, currentKollektiv));
            exportService.exportTextFile(csvContent, 'FILTERED_DATA_CSV', currentKollektiv);
        });
        document.getElementById('export-comprehensive-report-html').addEventListener('click', () => {
             const currentKollektiv = app.state.getCurrentKollektiv();
             const stats = app.statisticsService.calculateDescriptiveStats(app.dataProcessor.filterDataByKollektiv(app.processedData, currentKollektiv));
             const reportHtml = exportReportGenerator.generateComprehensiveReport(app.processedData, app.bruteForceManager.getResultsForKollektiv(currentKollektiv), app.state.getAppliedT2Criteria(), app.state.getAppliedT2Logic(), app.state.getCurrentKollektiv());
             exportService.exportHtmlReport(reportHtml, 'COMPREHENSIVE_REPORT_HTML', currentKollektiv);
        });


        document.querySelectorAll('.chart-download-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const chartId = this.dataset.chartId;
                const format = this.dataset.format;
                const chartName = this.dataset.chartName; // Use the specific chartName
                if (chartId && format) {
                     exportService.exportChartAsImage(chartId, format, `CHART_SINGLE_${format.toUpperCase()}`, app.state.getCurrentKollektiv(), chartName);
                }
            });
        });

        document.querySelectorAll('.table-download-png-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tableId = this.dataset.tableId;
                const tableName = this.dataset.tableName;
                if (tableId) {
                    exportService.exportTableAsPng(tableId, 'TABLE_PNG_EXPORT', app.state.getCurrentKollektiv(), tableName);
                }
            });
        });

        // ZIP Exports
        document.getElementById('export-all-zip').addEventListener('click', async () => {
            const currentKollektiv = app.state.getCurrentKollektiv();
            const zipFilename = exportService.generateFilename('ALL_ZIP', currentKollektiv, null, null, null);
            const stats = app.statisticsService.calculateDescriptiveStats(app.dataProcessor.filterDataByKollektiv(app.processedData, currentKollektiv));
            const bfResults = app.bruteForceManager.getResultsForKollektiv(currentKollektiv);

            const filePromises = [];

            // Add basic data/reports
            filePromises.push(Promise.resolve({
                content: dataTabLogic.createDatenTableMarkdown(app.dataProcessor.filterDataByKollektiv(app.data, currentKollektiv), app.state.getDatenTableSort()),
                filename: exportService.generateFilename('DATEN_MD', currentKollektiv).replace('.md', ''),
                folder: 'markdown/'
            }));
            filePromises.push(Promise.resolve({
                content: auswertungTabLogic.createAuswertungTableMarkdown(app.dataProcessor.filterDataByKollektiv(app.processedData, currentKollektiv), app.state.getDatenTableSort(), app.state.getAppliedT2Criteria(), app.state.getAppliedT2Logic()),
                filename: exportService.generateFilename('AUSWERTUNG_MD', currentKollektiv).replace('.md', ''),
                folder: 'markdown/'
            }));
            filePromises.push(Promise.resolve({
                content: statistikTabLogic.createDeskriptiveStatistikContentMarkdown(stats, currentKollektiv),
                filename: exportService.generateFilename('DESKRIPTIV_MD', currentKollektiv).replace('.md', ''),
                folder: 'markdown/'
            }));
            filePromises.push(Promise.resolve({
                content: exportReportGenerator.generateComprehensiveReport(app.processedData, bfResults, app.state.getAppliedT2Criteria(), app.state.getAppliedT2Logic(), app.state.getCurrentKollektiv()),
                filename: exportService.generateFilename('COMPREHENSIVE_REPORT_HTML', currentKollektiv).replace('.html', ''),
                folder: 'html/'
            }));
            filePromises.push(Promise.resolve({
                content: app.dataProcessor.exportFilteredDataCsv(app.dataProcessor.filterDataByKollektiv(app.processedData, currentKollektiv)),
                filename: exportService.generateFilename('FILTERED_DATA_CSV', currentKollektiv).replace('.csv', ''),
                folder: 'csv/'
            }));
            filePromises.push(Promise.resolve({
                content: statistikTabLogic.createAllStatsToCsv(app.processedData, app.state.getAppliedT2Criteria(), app.state.getAppliedT2Logic(), app.state.getCurrentKollektiv()),
                filename: exportService.generateFilename('STATS_CSV', currentKollektiv).replace('.csv', ''),
                folder: 'csv/'
            }));

            if (bfResults) {
                filePromises.push(Promise.resolve({
                    content: bruteForceManager.createBruteForceReportText(bfResults),
                    filename: exportService.generateFilename('BRUTEFORCE_TXT', currentKollektiv).replace('.txt', ''),
                    folder: 'text/'
                }));
            }

            // Add publication markdown sections
            const publicationSections = PUBLICATION_CONFIG.sections.flatMap(s => s.subSections.map(sub => sub.id));
            publicationSections.forEach(sectionId => {
                filePromises.push(Promise.resolve({
                    content: publicationTextGenerator.getSectionTextAsMarkdown(sectionId, app.state.getCurrentPublikationLang(), publikationTabLogic.allKollektivStats, {
                        appName: APP_CONFIG.APP_NAME,
                        appVersion: APP_CONFIG.APP_VERSION,
                        nGesamt: app.data.length, // use total count for common data in publication texts
                        nDirektOP: app.dataProcessor.filterDataByKollektiv(app.data, 'direkt OP').length,
                        nNRCT: app.dataProcessor.filterDataByKollektiv(app.data, 'nRCT').length,
                        t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
                        t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
                        bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
                        significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
                        references: APP_CONFIG.REFERENCES_FOR_PUBLICATION,
                        bruteForceMetricForPublication: app.state.getCurrentPublikationBruteForceMetric(),
                        rawData: app.data
                    }),
                    filename: exportService.generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PUBLIKATION_ABSTRACT_MD, currentKollektiv, sectionId).replace('.md', ''),
                    folder: 'publication_markdown/'
                }));
            });

            // Add all rendered charts (PNG & SVG) - this assumes they are rendered on a tab
            const chartIds = [];
            document.querySelectorAll('.chart-container[id]').forEach(el => chartIds.push(el.id));
            document.querySelectorAll('.dashboard-chart-container[id]').forEach(el => chartIds.push(el.id)); // Also for dashboard charts

            for (const chartId of chartIds) {
                const chartElement = document.getElementById(chartId);
                const svgElement = chartElement ? chartElement.querySelector('svg') : null;
                if (svgElement) {
                    const chartName = chartId.replace(/-chart-area$/, '');
                    filePromises.push(exportService.exportChartAsImage(chartId, 'png', `CHART_SINGLE_PNG`, currentKollektiv, chartName).then(blob => ({ content: blob, filename: exportService.generateFilename(`CHART_SINGLE_PNG`, currentKollektiv, null, chartName).replace('.png', ''), folder: 'charts_png/' })));
                    filePromises.push(exportService.exportChartAsImage(chartId, 'svg', `CHART_SINGLE_SVG`, currentKollektiv, chartName).then(blob => ({ content: blob, filename: exportService.generateFilename(`CHART_SINGLE_SVG`, currentKollektiv, null, chartName).replace('.svg', ''), folder: 'charts_svg/' })));
                }
            }

             // Add all rendered tables as PNG
            const tableIds = [];
            document.querySelectorAll('.publication-table[id], .table-responsive table[id]').forEach(el => tableIds.push(el.id));
            for (const tableId of tableIds) {
                const tableElement = document.getElementById(tableId);
                if (tableElement) {
                     const tableName = tableId;
                     filePromises.push(exportService.exportTableAsPng(tableId, 'TABLE_PNG_EXPORT', currentKollektiv, tableName).then(blob => ({ content: blob, filename: exportService.generateFilename('TABLE_PNG_EXPORT', currentKollektiv, null, null, tableName).replace('.png', ''), folder: 'tables_png/' })));
                }
            }


            exportService.exportMultipleFilesAsZip(filePromises, zipFilename);
        });

        document.getElementById('export-csv-zip').addEventListener('click', async () => {
             const currentKollektiv = app.state.getCurrentKollektiv();
             const zipFilename = exportService.generateFilename('CSV_ZIP', currentKollektiv, null, null, null);
             const filePromises = [
                 Promise.resolve({ content: app.dataProcessor.exportFilteredDataCsv(app.dataProcessor.filterDataByKollektiv(app.processedData, currentKollektiv)), filename: exportService.generateFilename('FILTERED_DATA_CSV', currentKollektiv).replace('.csv', ''), folder: '' }),
                 Promise.resolve({ content: statistikTabLogic.createAllStatsToCsv(app.processedData, app.state.getAppliedT2Criteria(), app.state.getAppliedT2Logic(), app.state.getCurrentKollektiv()), filename: exportService.generateFilename('STATS_CSV', currentKollektiv).replace('.csv', ''), folder: '' })
             ];
             exportService.exportMultipleFilesAsZip(filePromises, zipFilename);
        });

        document.getElementById('export-md-zip').addEventListener('click', async () => {
             const currentKollektiv = app.state.getCurrentKollektiv();
             const zipFilename = exportService.generateFilename('MD_ZIP', currentKollektiv, null, null, null);
             const stats = app.statisticsService.calculateDescriptiveStats(app.dataProcessor.filterDataByKollektiv(app.processedData, currentKollektiv));

             const filePromises = [
                 Promise.resolve({ content: dataTabLogic.createDatenTableMarkdown(app.dataProcessor.filterDataByKollektiv(app.data, currentKollektiv), app.state.getDatenTableSort()), filename: exportService.generateFilename('DATEN_MD', currentKollektiv).replace('.md', ''), folder: 'data/' }),
                 Promise.resolve({ content: auswertungTabLogic.createAuswertungTableMarkdown(app.dataProcessor.filterDataByKollektiv(app.processedData, currentKollektiv), app.state.getDatenTableSort(), app.state.getAppliedT2Criteria(), app.state.getAppliedT2Logic()), filename: exportService.generateFilename('AUSWERTUNG_MD', currentKollektiv).replace('.md', ''), folder: 'evaluation/' }),
                 Promise.resolve({ content: statistikTabLogic.createDeskriptiveStatistikContentMarkdown(stats, currentKollektiv), filename: exportService.generateFilename('DESKRIPTIV_MD', currentKollektiv).replace('.md', ''), folder: 'statistics/' })
             ];

             const publicationSections = PUBLICATION_CONFIG.sections.flatMap(s => s.subSections.map(sub => sub.id));
             publicationSections.forEach(sectionId => {
                 filePromises.push(Promise.resolve({
                     content: publicationTextGenerator.getSectionTextAsMarkdown(sectionId, app.state.getCurrentPublikationLang(), publikationTabLogic.allKollektivStats, {
                         appName: APP_CONFIG.APP_NAME,
                         appVersion: APP_CONFIG.APP_VERSION,
                         nGesamt: app.data.length, // use total count for common data in publication texts
                         nDirektOP: app.dataProcessor.filterDataByKollektiv(app.data, 'direkt OP').length,
                         nNRCT: app.dataProcessor.filterDataByKollektiv(app.data, 'nRCT').length,
                         t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
                         t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
                         bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
                         significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
                         references: APP_CONFIG.REFERENCES_FOR_PUBLICATION,
                         bruteForceMetricForPublication: app.state.getCurrentPublikationBruteForceMetric(),
                         rawData: app.data
                     }),
                     filename: exportService.generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PUBLIKATION_ABSTRACT_MD, currentKollektiv, sectionId).replace('.md', ''),
                     folder: 'publication/'
                 }));
             });
             exportService.exportMultipleFilesAsZip(filePromises, zipFilename);
        });

        document.getElementById('export-png-zip').addEventListener('click', async () => {
            const currentKollektiv = app.state.getCurrentKollektiv();
            const zipFilename = exportService.generateFilename('PNG_ZIP', currentKollektiv, null, null, null);
            const filePromises = [];

            const chartIds = [];
            document.querySelectorAll('.chart-container[id]').forEach(el => chartIds.push(el.id));
            document.querySelectorAll('.dashboard-chart-container[id]').forEach(el => chartIds.push(el.id));

            for (const chartId of chartIds) {
                const chartElement = document.getElementById(chartId);
                const svgElement = chartElement ? chartElement.querySelector('svg') : null;
                if (svgElement) {
                    const chartName = chartId.replace(/-chart-area$/, '');
                    filePromises.push(exportService.exportChartAsImage(chartId, 'png', `CHART_SINGLE_PNG`, currentKollektiv, chartName).then(blob => ({ content: blob, filename: exportService.generateFilename(`CHART_SINGLE_PNG`, currentKollektiv, null, chartName).replace('.png', ''), folder: 'charts/' })));
                }
            }

            const tableIds = [];
            document.querySelectorAll('.publication-table[id], .table-responsive table[id]').forEach(el => tableIds.push(el.id));
            for (const tableId of tableIds) {
                const tableElement = document.getElementById(tableId);
                if (tableElement) {
                     const tableName = tableId;
                     filePromises.push(exportService.exportTableAsPng(tableId, 'TABLE_PNG_EXPORT', currentKollektiv, tableName).then(blob => ({ content: blob, filename: exportService.generateFilename('TABLE_PNG_EXPORT', currentKollektiv, null, null, tableName).replace('.png', ''), folder: 'tables/' })));
                }
            }
            exportService.exportMultipleFilesAsZip(filePromises, zipFilename);
        });

        document.getElementById('export-svg-zip').addEventListener('click', async () => {
            const currentKollektiv = app.state.getCurrentKollektiv();
            const zipFilename = exportService.generateFilename('SVG_ZIP', currentKollektiv, null, null, null);
            const filePromises = [];

            const chartIds = [];
            document.querySelectorAll('.chart-container[id]').forEach(el => chartIds.push(el.id));
            document.querySelectorAll('.dashboard-chart-container[id]').forEach(el => chartIds.push(el.id));

            for (const chartId of chartIds) {
                const chartElement = document.getElementById(chartId);
                const svgElement = chartElement ? chartElement.querySelector('svg') : null;
                if (svgElement) {
                    const chartName = chartId.replace(/-chart-area$/, '');
                    filePromises.push(exportService.exportChartAsImage(chartId, 'svg', `CHART_SINGLE_SVG`, currentKollektiv, chartName).then(blob => ({ content: blob, filename: exportService.generateFilename(`CHART_SINGLE_SVG`, currentKollektiv, null, chartName).replace('.svg', ''), folder: 'charts/' })));
                }
            }
            exportService.exportMultipleFilesAsZip(filePromises, zipFilename);
        });


        // Add event listeners for dynamic download buttons (from charts/tables in other tabs)
        document.addEventListener('click', function(event) {
            if (event.target.closest('.chart-download-btn')) {
                const btn = event.target.closest('.chart-download-btn');
                const chartId = btn.dataset.chartId;
                const format = btn.dataset.format;
                const chartName = btn.dataset.chartName;
                if (chartId && format) {
                    exportService.exportChartAsImage(chartId, format, `CHART_SINGLE_${format.toUpperCase()}`, app.state.getCurrentKollektiv(), chartName);
                }
            } else if (event.target.closest('.table-download-png-btn')) {
                const btn = event.target.closest('.table-download-png-btn');
                const tableId = btn.dataset.tableId;
                const tableName = btn.dataset.tableName;
                if (tableId) {
                    exportService.exportTableAsPng(tableId, 'TABLE_PNG_EXPORT', app.state.getCurrentKollektiv(), tableName);
                }
            }
        });


        app.listenersInitialized = true;
    }

    async function init() {
        if (app.initialized) return;

        await loadData();
        app.t2CriteriaManager.loadAppliedCriteria();
        app.bruteForceManager.initializeWorker(); // Worker initialisieren

        app.bruteForceManager.onProgress((progress) => {
            ui_helpers.updateBruteForceUI('progress', progress, app.bruteForceManager.isWorkerAvailable(), app.state.getCurrentKollektiv());
        });

        // Initialize publication tab logic's internal data for all collective stats
        publikationTabLogic.initializeData(
            app.data,
            app.state.getAppliedT2Criteria(),
            app.state.getAppliedT2Logic(),
            app.bruteForceManager.getResults()
        );

        initializeListeners();
        updateUI();

        const initialTabId = app.state.getActiveTabId() || 'publikation-tab'; // Standard auf Publikationstab
        const tabTrigger = document.getElementById(initialTabId);
        if (tabTrigger) {
            if (!tabTrigger.classList.contains('active')) {
                const bsTab = new bootstrap.Tab(tabTrigger);
                bsTab.show();
            } else {
                refreshCurrentTab();
            }
        } else {
             const defaultTabTrigger = document.getElementById('publikation-tab');
             if (defaultTabTrigger && !defaultTabTrigger.classList.contains('active')) {
                 new bootstrap.Tab(defaultTabTrigger).show();
             }
        }
        
        // Check if it's the very first start of the app (based on a new storage key)
        const firstStartKey = APP_CONFIG.STORAGE_KEYS.FIRST_APP_START;
        const isFirstAppStart = loadFromLocalStorage(firstStartKey) === null;
        if (isFirstAppStart) {
            ui_helpers.showKurzanleitung();
            saveToLocalStorage(firstStartKey, false); // Mark first start as done
        }

        app.initialized = true;
    }

    return {
        init: init,
        updateUI: updateUI,
        refreshCurrentTab: refreshCurrentTab
    };

})();

document.addEventListener('DOMContentLoaded', mainAppInterface.init);
