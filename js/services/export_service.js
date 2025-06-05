const exportService = (() => {

    const CSV_DELIMITER = APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ';';
    const FILENAME_TEMPLATE = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE;
    const DATE_FORMAT = APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT;
    const INCLUDE_TIMESTAMP = APP_CONFIG.EXPORT_SETTINGS.INCLUDE_TIMESTAMP_IN_FILENAME;

    function _generateFilename(typeKey, kollektiv, sectionName = null) {
        const dateStr = getCurrentDateString(DATE_FORMAT);
        const kollektivName = getKollektivDisplayName(kollektiv).replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
        const fileType = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[typeKey];
        const ext = fileType.substring(fileType.lastIndexOf('.') + 1);
        let name = FILENAME_TEMPLATE
            .replace('{TYPE}', fileType.replace(`.${ext}`, ''))
            .replace('{KOLLEKTIV}', kollektivName)
            .replace('{DATE}', dateStr)
            .replace('{EXT}', ext);

        if (sectionName) {
            name = name.replace('{SectionName}', sectionName.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_'));
        }
        if (INCLUDE_TIMESTAMP) {
            name = name.replace('.{EXT}', `_${Date.now()}.{EXT}`);
        }
        return name;
    }

    function _convertArrayOfObjectsToCSV(data, delimiter = CSV_DELIMITER) {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }

        const allKeys = new Set();
        data.forEach(obj => {
            Object.keys(obj).forEach(key => allKeys.add(key));
        });
        const headers = Array.from(allKeys);

        let csv = headers.map(header => `"${header}"`).join(delimiter) + '\n';

        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) {
                    return '';
                }
                if (typeof value === 'string') {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csv += values.join(delimiter) + '\n';
        });

        return csv;
    }

    function _downloadFile(content, filename, mimeType) {
        try {
            const blob = new Blob([content], { type: mimeType });
            saveAs(blob, filename); // Uses FileSaver.js
            ui_helpers.showToast(`Datei '${filename}' erfolgreich exportiert.`, 'success');
        } catch (e) {
            console.error("Fehler beim Speichern der Datei:", e);
            ui_helpers.showToast(`Fehler beim Export von '${filename}'.`, 'danger');
        }
    }
    
    async function exportTableAsPng(tableId, tableName, kollektiv, scale = APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE) {
        const tableElement = document.getElementById(tableId);
        if (!tableElement) {
            ui_helpers.showToast(`Tabelle mit ID '${tableId}' nicht gefunden zum Exportieren.`, 'warning');
            return;
        }

        ui_helpers.showLoadingOverlay(true, 'Generiere Tabelle als Bild...');
        try {
            const filename = _generateFilename('TABLE_PNG_EXPORT', kollektiv).replace('{TableName}', tableName);
            const canvas = await html2canvas(tableElement, { scale: scale, backgroundColor: '#ffffff' });
            canvas.toBlob(function(blob) {
                saveAs(blob, filename);
                ui_helpers.showToast(`Tabelle '${tableName}' als PNG exportiert.`, 'success');
            });
        } catch (error) {
            console.error("Fehler beim Exportieren der Tabelle als PNG:", error);
            ui_helpers.showToast(`Fehler beim Export der Tabelle '${tableName}' als PNG.`, 'danger');
        } finally {
            ui_helpers.showLoadingOverlay(false);
        }
    }

    async function exportChart(chartId, chartName, format, kollektiv, scale = 1) {
        const chartContainer = document.getElementById(chartId);
        if (!chartContainer) {
            ui_helpers.showToast(`Diagramm mit ID '${chartId}' nicht gefunden zum Exportieren.`, 'warning');
            return;
        }
        ui_helpers.showLoadingOverlay(true, `Generiere Diagramm als ${format.toUpperCase()}...`);

        try {
            const filename = _generateFilename(format.toUpperCase() === 'PNG' ? 'CHART_SINGLE_PNG' : 'CHART_SINGLE_SVG', kollektiv).replace('{ChartName}', chartName);
            if (format === 'png') {
                const canvas = await html2canvas(chartContainer, { scale: scale, backgroundColor: '#ffffff', useCORS: true });
                canvas.toBlob(function(blob) {
                    saveAs(blob, filename);
                    ui_helpers.showToast(`Diagramm '${chartName}' als PNG exportiert.`, 'success');
                });
            } else if (format === 'svg') {
                const svgElement = chartContainer.querySelector('svg');
                if (!svgElement) throw new Error('SVG Element nicht gefunden.');
                const svgString = new XMLSerializer().serializeToString(svgElement);
                _downloadFile(svgString, filename, 'image/svg+xml');
            } else {
                ui_helpers.showToast("Unbekanntes Exportformat für Diagramm.", "warning");
            }
        } catch (error) {
            console.error(`Fehler beim Exportieren von Diagramm '${chartName}' als ${format}:`, error);
            ui_helpers.showToast(`Fehler beim Export von Diagramm '${chartName}' als ${format}.`, 'danger');
        } finally {
            ui_helpers.showLoadingOverlay(false);
        }
    }

    function exportStatsCSV(mainAppInterface) {
        if (!mainAppInterface || typeof mainAppInterface.getProcessedData !== 'function') {
            ui_helpers.showToast("Fehler beim Export: Datenquelle nicht verfügbar.", "danger");
            return;
        }
        const data = mainAppInterface.getProcessedData();
        const currentKollektiv = stateManager.getCurrentKollektiv();
        const stats = statisticsService.calculateAllStatsForPublication(data, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), stateManager.getAllBruteForceResults(), stateManager.getCurrentPublikationBruteForceMetric());
        
        if (!stats) {
             ui_helpers.showToast("Keine statistischen Daten zum Exportieren.", "warning");
             return;
        }
        
        const flatStats = [];
        for (const kollektiv in stats) {
            if (Object.prototype.hasOwnProperty.call(stats, kollektiv)) {
                const kolStats = stats[kollektiv];
                const base = { Kollektiv: getKollektivDisplayName(kollektiv), Patienten_N: kolStats.deskriptiv?.anzahlPatienten || 0 };
                
                // Add descriptive stats
                if (kolStats.deskriptiv) {
                    base.Alter_Median = kolStats.deskriptiv.alter?.median;
                    base.Alter_IQR_Q1 = kolStats.deskriptiv.alter?.q1;
                    base.Alter_IQR_Q3 = kolStats.deskriptiv.alter?.q3;
                    base.Geschlecht_Maennlich_n = kolStats.deskriptiv.geschlecht?.m;
                    base.Geschlecht_Weiblich_n = kolStats.deskriptiv.geschlecht?.f;
                    base.N_Pos_n = kolStats.deskriptiv.nStatus?.plus;
                    base.N_Neg_n = kolStats.deskriptiv.nStatus?.minus;
                    base.AS_Pos_n = kolStats.deskriptiv.asStatus?.plus;
                    base.AS_Neg_n = kolStats.deskriptiv.asStatus?.minus;
                    base.T2_Pos_n = kolStats.deskriptiv.t2Status?.plus;
                    base.T2_Neg_n = kolStats.deskriptiv.t2Status?.minus;
                }

                // Add diagnostic performance (AS)
                if (kolStats.gueteAS) {
                    base.AS_Sens = kolStats.gueteAS.sens?.value;
                    base.AS_Sens_CI_Lower = kolStats.gueteAS.sens?.ci?.lower;
                    base.AS_Sens_CI_Upper = kolStats.gueteAS.sens?.ci?.upper;
                    base.AS_Spez = kolStats.gueteAS.spez?.value;
                    base.AS_Spez_CI_Lower = kolStats.gueteAS.spez?.ci?.lower;
                    base.AS_Spez_CI_Upper = kolStats.gueteAS.spez?.ci?.upper;
                    base.AS_AUC = kolStats.gueteAS.auc?.value;
                    base.AS_AUC_CI_Lower = kolStats.gueteAS.auc?.ci?.lower;
                    base.AS_AUC_CI_Upper = kolStats.gueteAS.auc?.ci?.upper;
                    base.AS_Acc = kolStats.gueteAS.acc?.value;
                    base.AS_BalAcc = kolStats.gueteAS.balAcc?.value;
                    base.AS_F1 = kolStats.gueteAS.f1?.value;
                }

                // Add diagnostic performance (T2 Applied)
                if (kolStats.gueteT2) {
                    base.T2Appl_Sens = kolStats.gueteT2.sens?.value;
                    base.T2Appl_Spez = kolStats.gueteT2.spez?.value;
                    base.T2Appl_AUC = kolStats.gueteT2.auc?.value;
                    base.T2Appl_Acc = kolStats.gueteT2.acc?.value;
                    base.T2Appl_BalAcc = kolStats.gueteT2.balAcc?.value;
                    base.T2Appl_F1 = kolStats.gueteT2.f1?.value;
                }
                
                // Add diagnostic performance (T2 BruteForce)
                if (kolStats.gueteT2_bruteforce) {
                    base.T2BF_Sens = kolStats.gueteT2_bruteforce.sens?.value;
                    base.T2BF_Spez = kolStats.gueteT2_bruteforce.spez?.value;
                    base.T2BF_AUC = kolStats.gueteT2_bruteforce.auc?.value;
                    base.T2BF_Acc = kolStats.gueteT2_bruteforce.acc?.value;
                    base.T2BF_BalAcc = kolStats.gueteT2_bruteforce.balAcc?.value;
                    base.T2BF_F1 = kolStats.gueteT2_bruteforce.f1?.value;
                    base.T2BF_Criteria_Logic = kolStats.bruteforce_definition?.bestResult?.logic;
                    base.T2BF_Criteria_Size = kolStats.bruteforce_definition?.bestResult?.criteria?.size?.threshold;
                    base.T2BF_Criteria_Form = kolStats.bruteforce_definition?.bestResult?.criteria?.form?.value;
                    base.T2BF_Criteria_Kontur = kolStats.bruteforce_definition?.bestResult?.criteria?.kontur?.value;
                    base.T2BF_Criteria_Homogenitaet = kolStats.bruteforce_definition?.bestResult?.criteria?.homogenitaet?.value;
                    base.T2BF_Criteria_Signal = kolStats.bruteforce_definition?.bestResult?.criteria?.signal?.value;
                }

                // Add comparison stats (AS vs T2 BruteForce)
                if (kolStats.vergleichASvsT2_bruteforce) {
                    base.Comp_Delong_PValue = kolStats.vergleichASvsT2_bruteforce.delong?.pValue;
                    base.Comp_McNemar_PValue = kolStats.vergleichASvsT2_bruteforce.mcnemar?.pValue;
                }
                flatStats.push(base);
            }
        }
        const csvContent = Papa.unparse(flatStats, { delimiter: CSV_DELIMITER, header: true });
        const filename = _generateFilename('STATS_CSV', currentKollektiv);
        _downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    }

    function exportBruteForceTXT(mainAppInterface) {
        const currentKollektiv = stateManager.getCurrentKollektiv();
        const bfResult = bruteForceManager.getResultsForKollektiv(currentKollektiv);
        if (!bfResult || !bfResult.report) {
            ui_helpers.showToast("Keine Brute-Force-Ergebnisse für den Export vorhanden.", "warning");
            return;
        }
        const filename = _generateFilename('BRUTEFORCE_TXT', currentKollektiv);
        _downloadFile(bfResult.report, filename, 'text/plain;charset=utf-8;');
    }
    
    function exportDeskriptivMD(mainAppInterface) {
        if (!mainAppInterface || typeof mainAppInterface.getCurrentFilteredData !== 'function' || typeof statisticsService.calculateDescriptiveStats !== 'function') {
            ui_helpers.showToast("Fehler beim Export: Datenquelle nicht verfügbar.", "danger");
            return;
        }
        const data = mainAppInterface.getCurrentFilteredData();
        const currentKollektiv = stateManager.getCurrentKollektiv();
        const stats = statisticsService.calculateDescriptiveStats(data);
        
        let markdown = `# Deskriptive Statistik für Kollektiv: ${getKollektivDisplayName(currentKollektiv)}\n\n`;
        markdown += `* Anzahl Patienten: ${stats.anzahlPatienten}\n`;
        markdown += `* Alter (Median): ${formatNumber(stats.alter?.median, 1, 'N/A')} Jahre (IQR: ${formatNumber(stats.alter?.q1, 0, 'N/A')}-${formatNumber(stats.alter?.q3, 0, 'N/A')})\n`;
        markdown += `* Alter (Mittelwert ± SD): ${formatNumber(stats.alter?.mean, 1, 'N/A')} ± ${formatNumber(stats.alter?.sd, 1, 'N/A')} Jahre\n`;
        markdown += `* Geschlecht: Männlich ${stats.geschlecht?.m || 0}, Weiblich ${stats.geschlecht?.f || 0}\n`;
        markdown += `* Therapie: Direkt OP ${stats.therapie?.['direkt OP'] || 0}, nRCT ${stats.therapie?.nRCT || 0}\n`;
        markdown += `* N-Status (Patho): Positiv ${stats.nStatus?.plus || 0}, Negativ ${stats.nStatus?.minus || 0}\n`;
        markdown += `* AS-Status: Positiv ${stats.asStatus?.plus || 0}, Negativ ${stats.asStatus?.minus || 0}\n`;
        markdown += `* T2-Status (angewandt): Positiv ${stats.t2Status?.plus || 0}, Negativ ${stats.t2Status?.minus || 0}\n`;

        const filename = _generateFilename('DESKRIPTIV_MD', currentKollektiv);
        _downloadFile(markdown, filename, 'text/markdown;charset=utf-8;');
    }

    function exportComprehensiveHTML(mainAppInterface) {
        ui_helpers.showToast("Der umfassende HTML-Bericht ist noch in Entwicklung. Bitte nutzen Sie die Einzel-Exporte oder ZIP-Pakete.", "info", 6000);
    }
    
    function exportDatenMD(mainAppInterface) {
        const data = mainAppInterface.getCurrentFilteredData();
        if (!data || data.length === 0) { ui_helpers.showToast("Keine Daten zum Exportieren im aktuellen Kollektiv.", "warning"); return; }
        let markdown = `# Patientendaten (Kollektiv: ${getKollektivDisplayName(stateManager.getCurrentKollektiv())})\n\n`;
        markdown += tableRenderer.createDatenTableHTML(data, stateManager.getUserSettings().datenTableSort, true); // true for markdown friendly
        const filename = _generateFilename('DATEN_MD', stateManager.getCurrentKollektiv());
        _downloadFile(markdown, filename, 'text/markdown;charset=utf-8;');
    }
    
    function exportAuswertungMD(mainAppInterface) {
        const data = mainAppInterface.getCurrentFilteredData();
        if (!data || data.length === 0) { ui_helpers.showToast("Keine Daten zum Exportieren im aktuellen Kollektiv.", "warning"); return; }
        const currentCriteria = t2CriteriaManager.getAppliedCriteria();
        const currentLogic = t2CriteriaManager.getAppliedLogic();
        let markdown = `# Auswertungstabelle (Kollektiv: ${getKollektivDisplayName(stateManager.getCurrentKollektiv())})\n\n`;
        markdown += `Angewendete T2-Kriterien: ${studyT2CriteriaManager.formatCriteriaForDisplay(currentCriteria, currentLogic, false)}\n\n`;
        markdown += tableRenderer.createAuswertungTableHTML(data, stateManager.getUserSettings().auswertungTableSort, currentCriteria, currentLogic, true); // true for markdown friendly
        const filename = _generateFilename('AUSWERTUNG_MD', stateManager.getCurrentKollektiv());
        _downloadFile(markdown, filename, 'text/markdown;charset=utf-8;');
    }

    function exportFilteredDataCSV(mainAppInterface) {
        const data = mainAppInterface.getCurrentFilteredData();
        if (!data || data.length === 0) { ui_helpers.showToast("Keine Daten zum Exportieren im aktuellen Kollektiv.", "warning"); return; }
        const flattenedData = data.map(p => dataProcessor.flattenPatientDataForExport(p));
        const csvContent = Papa.unparse(flattenedData, { delimiter: CSV_DELIMITER, header: true });
        const filename = _generateFilename('FILTERED_DATA_CSV', stateManager.getCurrentKollektiv());
        _downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    }

    async function exportAllChartsPNG(mainAppInterface) {
        ui_helpers.showLoadingOverlay(true, 'Generiere alle Diagramme als PNG...');
        const zip = new JSZip();
        const chartsToExport = document.querySelectorAll('.dashboard-chart-container, .chart-container');
        let exportCount = 0;

        for (const chartDiv of chartsToExport) {
            const chartId = chartDiv.id;
            if (!chartId) continue;
            try {
                const canvas = await html2canvas(chartDiv, { scale: APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE, backgroundColor: '#ffffff', useCORS: true });
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const filename = `${chartId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${_generateFilename('CHART_SINGLE_PNG', stateManager.getCurrentKollektiv(), null).replace(/.png$/, '')}.png`;
                zip.file(filename, blob);
                exportCount++;
            } catch (error) {
                console.error(`Fehler beim Exportieren von Chart ${chartId} als PNG:`, error);
            }
        }
        if (exportCount > 0) {
            const zipFilename = _generateFilename('PNG_ZIP', stateManager.getCurrentKollektiv());
            zip.generateAsync({ type: "blob" }).then(function(content) {
                saveAs(content, zipFilename);
                ui_helpers.showToast(`${exportCount} Diagramme als PNG-ZIP exportiert.`, 'success');
            });
        } else {
            ui_helpers.showToast("Keine Diagramme zum Exportieren gefunden.", "warning");
        }
        ui_helpers.showLoadingOverlay(false);
    }

    async function exportAllChartsSVG(mainAppInterface) {
        ui_helpers.showLoadingOverlay(true, 'Generiere alle Diagramme als SVG...');
        const zip = new JSZip();
        const svgsToExport = document.querySelectorAll('.dashboard-chart-container svg, .chart-container svg');
        let exportCount = 0;

        for (const svgElement of svgsToExport) {
            const parentId = svgElement.closest('.dashboard-chart-container, .chart-container')?.id;
            if (!parentId) continue;
            try {
                const svgString = new XMLSerializer().serializeToString(svgElement);
                const filename = `${parentId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${_generateFilename('CHART_SINGLE_SVG', stateManager.getCurrentKollektiv(), null).replace(/.svg$/, '')}.svg`;
                zip.file(filename, svgString);
                exportCount++;
            } catch (error) {
                console.error(`Fehler beim Exportieren von SVG ${parentId}:`, error);
            }
        }
        if (exportCount > 0) {
            const zipFilename = _generateFilename('SVG_ZIP', stateManager.getCurrentKollektiv());
            zip.generateAsync({ type: "blob" }).then(function(content) {
                saveAs(content, zipFilename);
                ui_helpers.showToast(`${exportCount} Diagramme als SVG-ZIP exportiert.`, 'success');
            });
        } else {
            ui_helpers.showToast("Keine Diagramme zum Exportieren gefunden.", "warning");
        }
        ui_helpers.showLoadingOverlay(false);
    }

    async function createDataPackages(mainAppInterface, packageType) {
        ui_helpers.showLoadingOverlay(true, 'Erstelle Export-Paket...');
        const zip = new JSZip();
        const currentKollektiv = stateManager.getCurrentKollektiv();
        let exportCount = 0;
        let errors = [];

        try {
            // Raw data (always included if available)
            const filteredData = mainAppInterface.getCurrentFilteredData();
            if (filteredData && filteredData.length > 0) {
                const flattenedData = filteredData.map(p => dataProcessor.flattenPatientDataForExport(p));
                if (packageType === 'all' || packageType === 'csv') {
                    zip.file(_generateFilename('FILTERED_DATA_CSV', currentKollektiv), Papa.unparse(flattenedData, { delimiter: CSV_DELIMITER, header: true }));
                    exportCount++;
                }
                if (packageType === 'all' || packageType === 'xlsx') {
                    const workbook = new ExcelJS.Workbook();
                    const worksheet = workbook.addWorksheet(APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_FILTERED);
                    worksheet.columns = Object.keys(flattenedData[0]).map(key => ({ header: key, key: key, width: 15 }));
                    worksheet.addRows(flattenedData);
                    const buffer = await workbook.xlsx.writeBuffer();
                    zip.file(_generateFilename('FILTERED_DATA_XLSX', currentKollektiv), buffer);
                    exportCount++;
                }
            } else {
                errors.push("Keine gefilterten Daten vorhanden.");
            }

            // Statistics CSV
            if (packageType === 'all' || packageType === 'csv') {
                try {
                    const data = mainAppInterface.getProcessedData();
                    const stats = statisticsService.calculateAllStatsForPublication(data, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic(), stateManager.getAllBruteForceResults(), stateManager.getCurrentPublikationBruteForceMetric());
                    if (stats) {
                        const flatStats = [];
                        for (const kollektiv in stats) {
                             if (Object.prototype.hasOwnProperty.call(stats, kollektiv)) {
                                 const kolStats = stats[kollektiv];
                                 const base = { Kollektiv: getKollektivDisplayName(kollektiv), Patienten_N: kolStats.deskriptiv?.anzahlPatienten || 0 };
                                 if (kolStats.deskriptiv) { base.Alter_Median = kolStats.deskriptiv.alter?.median; base.Geschlecht_Maennlich_n = kolStats.deskriptiv.geschlecht?.m; }
                                 if (kolStats.gueteAS) { base.AS_Sens = kolStats.gueteAS.sens?.value; base.AS_Spez = kolStats.gueteAS.spez?.value; base.AS_AUC = kolStats.gueteAS.auc?.value; }
                                 if (kolStats.gueteT2) { base.T2Appl_Sens = kolStats.gueteT2.sens?.value; base.T2Appl_Spez = kolStats.gueteT2.spez?.value; base.T2Appl_AUC = kolStats.gueteT2.auc?.value; }
                                 if (kolStats.gueteT2_bruteforce) { base.T2BF_Sens = kolStats.gueteT2_bruteforce.sens?.value; base.T2BF_Spez = kolStats.gueteT2_bruteforce.spez?.value; base.T2BF_AUC = kolStats.gueteT2_bruteforce.auc?.value; }
                                 flatStats.push(base);
                             }
                        }
                        zip.file(_generateFilename('STATS_CSV', currentKollektiv), Papa.unparse(flatStats, { delimiter: CSV_DELIMITER, header: true }));
                        exportCount++;
                    }
                } catch (e) { errors.push(`Fehler beim Export der Statistik-CSV: ${e.message}`); }
            }
            
            // Brute Force TXT
            if (packageType === 'all' || packageType === 'txt') {
                 try {
                     const bfResult = bruteForceManager.getResultsForKollektiv(currentKollektiv);
                     if (bfResult && bfResult.report) {
                         zip.file(_generateFilename('BRUTEFORCE_TXT', currentKollektiv), bfResult.report);
                         exportCount++;
                     }
                 } catch (e) { errors.push(`Fehler beim Export des Brute-Force-Berichts: ${e.message}`); }
            }

            // Markdown files (Deskriptiv, Daten, Auswertung, Publikation Sektion)
            if (packageType === 'all' || packageType === 'md') {
                try {
                    const deskriptivMd = await new Promise(resolve => exportDeskriptivMDInternal(mainAppInterface, resolve));
                    if (deskriptivMd) { zip.file(_generateFilename('DESKRIPTIV_MD', currentKollektiv), deskriptivMd); exportCount++; }
                } catch (e) { errors.push(`Fehler beim Export der deskriptiven Statistik (MD): ${e.message}`); }

                try {
                    const datenMd = await new Promise(resolve => exportDatenMDInternal(mainAppInterface, resolve));
                    if (datenMd) { zip.file(_generateFilename('DATEN_MD', currentKollektiv), datenMd); exportCount++; }
                } catch (e) { errors.push(`Fehler beim Export der Datenliste (MD): ${e.message}`); }

                try {
                    const auswertungMd = await new Promise(resolve => exportAuswertungMDInternal(mainAppInterface, resolve));
                    if (auswertungMd) { zip.file(_generateFilename('AUSWERTUNG_MD', currentKollektiv), auswertungMd); exportCount++; }
                } catch (e) { errors.push(`Fehler beim Export der Auswertungstabelle (MD): ${e.message}`); }
                
                try {
                    const publicationSectionMd = await new Promise(resolve => exportPublicationSectionMarkdownInternal(stateManager.getUserSettings().publikationSection, stateManager.getUserSettings().publikationLang, resolve));
                    if (publicationSectionMd) { zip.file(_generateFilename('PUBLIKATION_SECTION_MD', currentKollektiv, stateManager.getUserSettings().publikationSection), publicationSectionMd); exportCount++; }
                } catch (e) { errors.push(`Fehler beim Export des Publikationsabschnitts (MD): ${e.message}`); }
            }

            // Charts (PNG/SVG)
            if (packageType === 'all' || packageType === 'png') {
                const chartsToExport = document.querySelectorAll('.dashboard-chart-container, .chart-container');
                for (const chartDiv of chartsToExport) {
                    const chartId = chartDiv.id;
                    if (!chartId) continue;
                    try {
                        const canvas = await html2canvas(chartDiv, { scale: APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE, backgroundColor: '#ffffff', useCORS: true });
                        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                        const filename = `${chartId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${_generateFilename('CHART_SINGLE_PNG', currentKollektiv).replace(/.png$/, '')}.png`;
                        zip.file(filename, blob);
                        exportCount++;
                    } catch (e) { errors.push(`Fehler beim Export von Chart ${chartId} (PNG): ${e.message}`); }
                }
            }

            if (packageType === 'all' || packageType === 'svg') {
                const svgsToExport = document.querySelectorAll('.dashboard-chart-container svg, .chart-container svg');
                for (const svgElement of svgsToExport) {
                    const parentId = svgElement.closest('.dashboard-chart-container, .chart-container')?.id;
                    if (!parentId) continue;
                    try {
                        const svgString = new XMLSerializer().serializeToString(svgElement);
                        const filename = `${parentId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${_generateFilename('CHART_SINGLE_SVG', currentKollektiv).replace(/.svg$/, '')}.svg`;
                        zip.file(filename, svgString);
                        exportCount++;
                    } catch (e) { errors.push(`Fehler beim Export von SVG ${parentId}: ${e.message}`); }
                }
            }

            // Generate ZIP
            if (exportCount > 0) {
                const zipFilename = _generateFilename(packageType.toUpperCase() + '_ZIP', currentKollektiv);
                zip.generateAsync({ type: "blob" }).then(function(content) {
                    saveAs(content, zipFilename);
                    ui_helpers.showToast(`${exportCount} Dateien als ZIP exportiert.`, 'success');
                });
            } else {
                ui_helpers.showToast("Keine Dateien zum Exportieren gefunden.", "warning");
            }

        } catch (error) {
            console.error("Fehler beim Erstellen des Datenpakets:", error);
            ui_helpers.showToast(`Fehler beim Erstellen des Export-Pakets: ${error.message}.`, 'danger');
        } finally {
            ui_helpers.showLoadingOverlay(false);
            if (errors.length > 0) {
                console.error("Fehlerdetails beim ZIP-Export:", errors);
                ui_helpers.showToast(`Warnung: Es gab ${errors.length} Fehler bei einzelnen Exporten im ZIP-Paket. Details in Konsole.`, 'warning', 8000);
            }
        }
    }

    // Internal versions for use within ZIP creation that don't directly download
    async function exportDeskriptivMDInternal(mainAppInterface) {
        const data = mainAppInterface.getCurrentFilteredData();
        const currentKollektiv = stateManager.getCurrentKollektiv();
        const stats = statisticsService.calculateDescriptiveStats(data);
        let markdown = `# Deskriptive Statistik für Kollektiv: ${getKollektivDisplayName(currentKollektiv)}\n\n`;
        markdown += `* Anzahl Patienten: ${stats.anzahlPatienten}\n`;
        markdown += `* Alter (Median): ${formatNumber(stats.alter?.median, 1, 'N/A')} Jahre (IQR: ${formatNumber(stats.alter?.q1, 0, 'N/A')}-${formatNumber(stats.alter?.q3, 0, 'N/A')})\n`;
        markdown += `* Alter (Mittelwert ± SD): ${formatNumber(stats.alter?.mean, 1, 'N/A')} ± ${formatNumber(stats.alter?.sd, 1, 'N/A')} Jahre\n`;
        markdown += `* Geschlecht: Männlich ${stats.geschlecht?.m || 0}, Weiblich ${stats.geschlecht?.f || 0}\n`;
        markdown += `* Therapie: Direkt OP ${stats.therapie?.['direkt OP'] || 0}, nRCT ${stats.therapie?.nRCT || 0}\n`;
        markdown += `* N-Status (Patho): Positiv ${stats.nStatus?.plus || 0}, Negativ ${stats.nStatus?.minus || 0}\n`;
        markdown += `* AS-Status: Positiv ${stats.asStatus?.plus || 0}, Negativ ${stats.asStatus?.minus || 0}\n`;
        markdown += `* T2-Status (angewandt): Positiv ${stats.t2Status?.plus || 0}, Negativ ${stats.t2Status?.minus || 0}\n`;
        return markdown;
    }

    async function exportDatenMDInternal(mainAppInterface) {
        const data = mainAppInterface.getCurrentFilteredData();
        if (!data || data.length === 0) return '';
        let markdown = `# Patientendaten (Kollektiv: ${getKollektivDisplayName(stateManager.getCurrentKollektiv())})\n\n`;
        markdown += tableRenderer.createDatenTableHTML(data, stateManager.getUserSettings().datenTableSort, true);
        return markdown;
    }

    async function exportAuswertungMDInternal(mainAppInterface) {
        const data = mainAppInterface.getCurrentFilteredData();
        if (!data || data.length === 0) return '';
        const currentCriteria = t2CriteriaManager.getAppliedCriteria();
        const currentLogic = t2CriteriaManager.getAppliedLogic();
        let markdown = `# Auswertungstabelle (Kollektiv: ${getKollektivDisplayName(stateManager.getCurrentKollektiv())})\n\n`;
        markdown += `Angewendete T2-Kriterien: ${studyT2CriteriaManager.formatCriteriaForDisplay(currentCriteria, currentLogic, false)}\n\n`;
        markdown += tableRenderer.createAuswertungTableHTML(data, stateManager.getUserSettings().auswertungTableSort, currentCriteria, currentLogic, true);
        return markdown;
    }
    
    async function exportPublicationSectionMarkdown(sectionId, lang) {
        if (!publicationTabLogic || !publicationTabLogic.currentAggregatedPublicationData || !publicationMainController || !ui_helpers) {
            console.error("ExportPublicationSectionMarkdown: Abhängigkeiten fehlen.");
            return '';
        }
        
        const sectionHtmlContent = publicationMainController.getFullPublicationSectionHTML(
            publicationTabLogic.currentAggregatedPublicationData, 
            sectionId, 
            lang
        );
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sectionHtmlContent;
        
        // Remove figures and replace with placeholders
        tempDiv.querySelectorAll('.figure-content').forEach(el => {
            const figurePlaceholderContainer = el.querySelector('.figure-placeholder');
            const figurePlaceholderText = figurePlaceholderContainer ? figurePlaceholderContainer.textContent : (lang === 'de' ? '[Abbildung an dieser Stelle]' : '[Figure at this position]');
            el.innerHTML = `<p><em>${figurePlaceholderText}</em></p>`;
        });
        // Remove tables and replace with placeholders
        tempDiv.querySelectorAll('.publication-table-container').forEach(el => {
             const tableTitleEl = el.querySelector('.publication-table-title strong');
             const tableTitle = tableTitleEl ? tableTitleEl.textContent : (lang === 'de' ? 'Tabelle an dieser Stelle' : 'Table at this position');
             el.innerHTML = `<p><em>[${tableTitle}]</em></p>`;
        });


        tempDiv.querySelectorAll('button, .btn, [data-bs-toggle="tooltip"], .tooltip, style, script, .publication-subsection-title, h1.display-6, h2.publication-subsection-title').forEach(el => el.remove());
        
        let markdownContent = ui_helpers.htmlToMarkdown(tempDiv.innerHTML);
        markdownContent = markdownContent.replace(/\n{3,}/g, '\n\n'); 

        return markdownContent;
    }


    async function exportPraesentationData(actionId, presentationData, currentKollektiv) {
        if (!presentationData) {
            ui_helpers.showToast("Keine Präsentationsdaten zum Exportieren verfügbar.", "warning");
            return;
        }

        let content = '';
        let filename = '';
        let mimeType = '';
        const currentLang = stateManager.getUserSettings().praesentationLang || 'de';
        const t2ShortName = presentationData.t2CriteriaLabelShort || 'T2';
        const studyIdForFilename = presentationData.comparisonCriteriaSet?.id || 'Applied';

        ui_helpers.showLoadingOverlay(true, `Exportiere ${actionId.split('-').pop().toUpperCase()}...`);

        try {
            switch (actionId) {
                case 'download-performance-as-pur-csv':
                    filename = _generateFilename('PRAES_AS_PERF_CSV', currentKollektiv);
                    const asPurData = [
                        { Kollektiv: getKollektivDisplayName(currentKollektiv),
                          N_Patienten: presentationData.patientCount,
                          Sensitivitaet: presentationData.statsCurrentKollektiv?.sens?.value,
                          Spezifitaet: presentationData.statsCurrentKollektiv?.spez?.value,
                          PPV: presentationData.statsCurrentKollektiv?.ppv?.value,
                          NPV: presentationData.statsCurrentKollektiv?.npv?.value,
                          Accuracy: presentationData.statsCurrentKollektiv?.acc?.value,
                          AUC: presentationData.statsCurrentKollektiv?.auc?.value,
                          BalancedAccuracy: presentationData.statsCurrentKollektiv?.balAcc?.value,
                          F1_Score: presentationData.statsCurrentKollektiv?.f1?.value
                        }
                    ];
                    content = Papa.unparse(asPurData, { delimiter: CSV_DELIMITER, header: true });
                    mimeType = 'text/csv;charset=utf-8;';
                    break;
                case 'download-performance-as-pur-md':
                    filename = _generateFilename('PRAES_AS_PERF_MD', currentKollektiv);
                    content = praesentationTabLogic.createASPerformanceOverviewTable(presentationData.statsCurrentKollektiv, currentLang, true, false); // true for markdown, false for no downloads
                    mimeType = 'text/markdown;charset=utf-8;';
                    break;
                case 'download-performance-as-vs-t2-csv':
                    filename = _generateFilename('PRAES_AS_VS_T2_PERF_CSV', currentKollektiv).replace('{StudyID}', studyIdForFilename);
                    const asVsT2Data = [
                        { Kollektiv: getKollektivDisplayName(currentKollektiv),
                          N_Patienten: presentationData.patientCountForComparison,
                          Methode: 'Avocado Sign',
                          Sensitivitaet: presentationData.statsAS?.sens?.value,
                          Spezifitaet: presentationData.statsAS?.spez?.value,
                          PPV: presentationData.statsAS?.ppv?.value,
                          NPV: presentationData.statsAS?.npv?.value,
                          Accuracy: presentationData.statsAS?.acc?.value,
                          AUC: presentationData.statsAS?.auc?.value,
                          BalancedAccuracy: presentationData.statsAS?.balAcc?.value,
                          F1_Score: presentationData.statsAS?.f1?.value
                        },
                         { Kollektiv: getKollektivDisplayName(currentKollektiv),
                           N_Patienten: presentationData.patientCountForComparison,
                           Methode: t2ShortName,
                           Sensitivitaet: presentationData.statsT2?.sens?.value,
                           Spezifitaet: presentationData.statsT2?.spez?.value,
                           PPV: presentationData.statsT2?.ppv?.value,
                           NPV: presentationData.statsT2?.npv?.value,
                           Accuracy: presentationData.statsT2?.acc?.value,
                           AUC: presentationData.statsT2?.auc?.value,
                           BalancedAccuracy: presentationData.statsT2?.balAcc?.value,
                           F1_Score: presentationData.statsT2?.f1?.value
                         }
                    ];
                    content = Papa.unparse(asVsT2Data, { delimiter: CSV_DELIMITER, header: true });
                    mimeType = 'text/csv;charset=utf-8;';
                    break;
                case 'download-comp-table-as-vs-t2-md':
                    filename = _generateFilename('PRAES_AS_VS_T2_COMP_MD', currentKollektiv).replace('{StudyID}', studyIdForFilename);
                    content = praesentationTabLogic.createASVsT2MetricsComparisonTableHTML(presentationData.statsAS, presentationData.statsT2, currentLang, t2ShortName, true, false);
                    mimeType = 'text/markdown;charset=utf-8;';
                    break;
                case 'download-tests-as-vs-t2-md':
                    filename = _generateFilename('PRAES_AS_VS_T2_TESTS_MD', currentKollektiv).replace('{StudyID}', studyIdForFilename);
                    content = praesentationTabLogic.createASVsT2StatisticalTestsTableHTML(presentationData.vergleich, currentLang, t2ShortName, true, false);
                    mimeType = 'text/markdown;charset=utf-8;';
                    break;
                case 'download-chart-as-pur-perf-chart-png':
                    await exportChart('praes-as-pur-perf-chart', `AS_Performance_${getKollektivDisplayName(currentKollektiv)}`, 'png', currentKollektiv, APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE);
                    break;
                case 'download-chart-as-pur-perf-chart-svg':
                    await exportChart('praes-as-pur-perf-chart', `AS_Performance_${getKollektivDisplayName(currentKollektiv)}`, 'svg', currentKollektiv);
                    break;
                case 'download-chart-as-vs-t2-png':
                    await exportChart('praes-comp-chart-container', `AS_vs_T2_${t2ShortName}_${getKollektivDisplayName(currentKollektiv)}`, 'png', currentKollektiv, APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE);
                    break;
                case 'download-chart-as-vs-t2-svg':
                    await exportChart('praes-comp-chart-container', `AS_vs_T2_${t2ShortName}_${getKollektivDisplayName(currentKollektiv)}`, 'svg', currentKollektiv);
                    break;
                default:
                    ui_helpers.showToast("Unbekannter Export-Typ für Präsentation.", "warning");
                    break;
            }
            if (content && filename && mimeType) {
                _downloadFile(content, filename, mimeType);
            }
        } catch (error) {
            console.error("Fehler beim Exportieren der Präsentationsdaten:", error);
            ui_helpers.showToast(`Fehler beim Präsentationsexport: ${error.message}`, "danger");
        } finally {
            ui_helpers.showLoadingOverlay(false);
        }
    }

    return Object.freeze({
        exportStatsCSV,
        exportBruteForceTXT,
        exportDeskriptivMD,
        exportComprehensiveHTML,
        exportDatenMD,
        exportAuswertungMD,
        exportFilteredDataCSV,
        exportAllChartsPNG,
        exportAllChartsSVG,
        createDataPackages,
        exportChart, // Export for single chart downloads (used by generalEventHandlers)
        exportTableAsPng, // Export for single table downloads (used by generalEventHandlers)
        exportPraesentationData // Export for presentation tab downloads
    });
})();
