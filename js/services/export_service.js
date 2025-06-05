const exportService = (() => {
    const DEFAULT_SCALE_PNG = APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE || 2;

    function generateFilename(typeKey, kollektivId, fileExtension, additionalContext = {}) {
        let typeStr = typeKey;
        if (APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[typeKey]) {
            typeStr = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[typeKey];
        }

        typeStr = typeStr.replace('{ChartName}', additionalContext.chartName || 'Chart')
                         .replace('{TableName}', additionalContext.tableName || 'Table')
                         .replace('{StudyID}', additionalContext.studyId || '')
                         .replace('{SectionName}', additionalContext.sectionName || 'Section')
                         .replace('{Kollektiv}', getKollektivDisplayName(kollektivId || राज्य.currentKollektiv).replace(/\s+/g, '_'))
                         .replace(/\s+/g, '_');


        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const kollektivStr = getKollektivDisplayName(kollektivId || राज्य.currentKollektiv).replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 20);

        let baseFilename = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE
            .replace('{TYPE}', typeStr)
            .replace('{KOLLEKTIV}', kollektivStr)
            .replace('{DATE}', dateStr)
            .replace('{EXT}', fileExtension.toLowerCase());

        if (APP_CONFIG.EXPORT_SETTINGS.INCLUDE_TIMESTAMP_IN_FILENAME) {
            const time = new Date();
            const timestamp = `${time.getHours().toString().padStart(2, '0')}${time.getMinutes().toString().padStart(2, '0')}${time.getSeconds().toString().padStart(2, '0')}`;
            baseFilename = baseFilename.replace(`.${fileExtension.toLowerCase()}`, `_${timestamp}.${fileExtension.toLowerCase()}`);
        }
        return baseFilename.replace(/__+/g, '_');
    }

    function exportCSV(data, filename) {
        try {
            if (!Array.isArray(data) || data.length === 0) {
                ui_helpers.showToast(UI_TEXTS.TOOLTIP_CONTENT.exportTab?.noDataToExport?.de || 'Keine Daten zum Exportieren.', 'warning');
                return;
            }
            const csv = Papa.unparse(data, { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" });
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            saveAs(blob, filename);
        } catch (error) {
            console.error("ExportService: CSV Export Fehler", error);
            ui_helpers.showToast(UI_TEXTS.TOOLTIP_CONTENT.exportTab?.exportError?.de || 'CSV-Export fehlgeschlagen.', 'danger');
        }
    }

    function exportText(textData, filename, mimeType = "text/plain;charset=utf-8;") {
        try {
            if (typeof textData !== 'string' || textData.length === 0) {
                ui_helpers.showToast(UI_TEXTS.TOOLTIP_CONTENT.exportTab?.noDataToExport?.de || 'Keine Daten zum Exportieren.', 'warning');
                return;
            }
            const blob = new Blob([textData], { type: mimeType });
            saveAs(blob, filename);
        } catch (error) {
            console.error("ExportService: Text Export Fehler", error);
            ui_helpers.showToast(UI_TEXTS.TOOLTIP_CONTENT.exportTab?.exportError?.de || 'Text-Export fehlgeschlagen.', 'danger');
        }
    }
    
    function exportMarkdown(markdownString, filename) {
        exportText(markdownString, filename, "text/markdown;charset=utf-8;");
    }

    function exportPublicationSectionMarkdown(sectionContent, sectionName, kollektivId, lang) {
        const filename = generateFilename('PUBLIKATION_SECTION_MD', kollektivId, 'md', { sectionName: sectionName.replace(/\s+/g, '_') });
        exportMarkdown(sectionContent, filename);
    }

    function exportFullPublicationMarkdown(fullContent, kollektivId, lang) {
        const filename = generateFilename('PUBLIKATION_MAIN_MD', kollektivId, 'md');
        exportMarkdown(fullContent, filename);
    }


    function convertSvgToPng(svgElement, scale, callback) {
        if (!(svgElement instanceof SVGElement)) {
            console.error("ExportService: Ungültiges SVG-Element für PNG-Konvertierung.", svgElement);
            if (callback) callback(null);
            return;
        }
        try {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const svgSize = svgElement.getBoundingClientRect();

            const effectiveScale = Math.max(1, parseFloat(scale) || DEFAULT_SCALE_PNG);
            
            canvas.width = (svgSize.width || parseInt(svgElement.getAttribute('width')) || 300) * effectiveScale;
            canvas.height = (svgSize.height || parseInt(svgElement.getAttribute('height')) || 200) * effectiveScale;

            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (svgElement.style.backgroundColor && svgElement.style.backgroundColor !== 'transparent') {
                    ctx.fillStyle = svgElement.style.backgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                } else if (APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR && APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR !== 'transparent') {
                    ctx.fillStyle = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR;
                     ctx.fillRect(0, 0, canvas.width, canvas.height);
                }


                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                if (callback) callback(canvas.toDataURL("image/png"));
            };
            img.onerror = (err) => {
                console.error("ExportService: Fehler beim Laden des SVG als Bild für PNG-Konvertierung.", err);
                 if (callback) callback(null);
            };
            img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
        } catch (error) {
            console.error("ExportService: Fehler bei SVG zu PNG Konvertierung.", error);
            if (callback) callback(null);
        }
    }

    function exportChart(targetElementId, chartName, format = "svg", kollektivId, scaleForPng = DEFAULT_SCALE_PNG) {
        const svgElement = document.querySelector(`#${targetElementId} svg`);
        if (!svgElement) {
            console.error(`ExportService: SVG-Element in #${targetElementId} nicht gefunden.`);
            ui_helpers.showToast(`Export von Chart '${chartName}' fehlgeschlagen: SVG nicht gefunden.`, 'danger');
            return;
        }

        const filenameKey = format.toUpperCase() === "SVG" ? 'CHART_SINGLE_SVG' : 'CHART_SINGLE_PNG';
        const filename = generateFilename(filenameKey, kollektivId, format, { chartName: chartName.replace(/\s+/g, '_') });

        if (format.toLowerCase() === "svg") {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            saveAs(blob, filename);
        } else if (format.toLowerCase() === "png") {
            convertSvgToPng(svgElement, scaleForPng, (dataUrl) => {
                if (dataUrl) {
                    saveAs(dataUrl, filename);
                } else {
                    ui_helpers.showToast(`PNG Export für '${chartName}' fehlgeschlagen.`, 'danger');
                }
            });
        } else {
            console.warn(`ExportService: Unbekanntes Exportformat für Chart: ${format}`);
        }
    }
    
    function exportTableAsPng(tableElementId, tableName, kollektivId, scale = DEFAULT_SCALE_PNG) {
        const tableElement = document.getElementById(tableElementId);
        if (!tableElement || typeof html2canvas === 'undefined') {
            ui_helpers.showToast(`Export von Tabelle '${tableName}' als PNG fehlgeschlagen: ${typeof html2canvas === 'undefined' ? 'Bibliothek html2canvas nicht geladen.' : 'Tabelle nicht gefunden.'}`, 'danger');
            return;
        }
        
        const filename = generateFilename('TABLE_PNG_EXPORT', kollektivId, 'png', { tableName: tableName.replace(/\s+/g, '_') });

        html2canvas(tableElement, {
            scale: Math.max(1, parseFloat(scale) || DEFAULT_SCALE_PNG),
            useCORS: true,
            logging: false,
            backgroundColor: window.getComputedStyle(tableElement).backgroundColor || '#ffffff'
        }).then(canvas => {
            saveAs(canvas.toDataURL('image/png'), filename);
        }).catch(err => {
            console.error("ExportService: Fehler beim Exportieren der Tabelle als PNG mit html2canvas:", err);
            ui_helpers.showToast(`PNG Export für Tabelle '${tableName}' fehlgeschlagen.`, 'danger');
        });
    }

    async function createDataPackages() {
        const zip = new JSZip();
        const currentKollektiv = राज्य.currentKollektiv;
        const appliedT2Criteria = राज्य.appliedT2Criteria;
        const appliedT2Logic = राज्य.appliedT2Logic;
        const allProcessedData = dataProcessor.getProcessedData(window.PATIENT_RAW_DATA, appliedT2Criteria, appliedT2Logic);
        const currentKollektivData = dataProcessor.filterDataByKollektiv(allProcessedData, currentKollektiv);

        const packages = {
            all: { filename: generateFilename('ALL_ZIP', currentKollektiv, 'zip'), types: [] },
            csv: { filename: generateFilename('CSV_ZIP', currentKollektiv, 'zip'), types: [] },
            md: { filename: generateFilename('MD_ZIP', currentKollektiv, 'zip'), types: [] },
            xlsx: { filename: generateFilename('XLSX_ZIP', currentKollektiv, 'zip'), types: [] }
        };
        
        const addFileToZip = async (packageKeys, filename, content, type = "text/plain") => {
            if (content) {
                packageKeys.forEach(key => {
                    if (packages[key]) {
                        packages[key].types.push({ filename, content, type });
                    }
                });
            }
        };

        // CSV Data
        if (currentKollektivData.length > 0) {
            const csvData = Papa.unparse(currentKollektivData.map(p => dataProcessor.flattenPatientDataForExport(p)), { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER });
            await addFileToZip(['all', 'csv'], generateFilename('FILTERED_DATA_CSV', currentKollektiv, 'csv'), csvData, "text/csv");
        }

        const statsForExport = await statisticsService.getCompleteStatisticsForExport(currentKollektiv, appliedT2Criteria, appliedT2Logic, राज्य.bruteForceResults);
        if (statsForExport.csv) {
            await addFileToZip(['all', 'csv'], generateFilename('STATS_CSV', currentKollektiv, 'csv'), statsForExport.csv, "text/csv");
        }
        if (statsForExport.md) {
            await addFileToZip(['all', 'md'], generateFilename('DESKRIPTIV_MD', currentKollektiv, 'md'), statsForExport.md.deskriptiv);
        }
        
        // Data Tab & Auswertung Tab MD
        const datenTabHtml = document.getElementById('daten-tabelle-content')?.innerHTML || '';
        if (datenTabHtml) await addFileToZip(['all', 'md'], generateFilename('DATEN_MD', currentKollektiv, 'md'), ui_helpers.htmlToMarkdown(datenTabHtml));
        
        const auswertungTabHtml = document.getElementById('auswertung-tabelle-content')?.innerHTML || '';
        if(auswertungTabHtml) await addFileToZip(['all', 'md'], generateFilename('AUSWERTUNG_MD', currentKollektiv, 'md'), ui_helpers.htmlToMarkdown(auswertungTabHtml));

        // Brute Force Report
        const bfResult = stateManager.getBruteForceResultForKollektiv(currentKollektiv);
        if (bfResult && bfResult.report) {
            await addFileToZip(['all'], generateFilename('BRUTEFORCE_TXT', currentKollektiv, 'txt'), bfResult.report);
        }

        // Publication Markdown (if available and relevant section is visible)
        const pubContentArea = document.getElementById('publikation-content-area');
        if (pubContentArea && pubContentArea.dataset.currentSectionId) {
            const pubSectionId = pubContentArea.dataset.currentSectionId;
            const pubLang = राज्य.userSettings.publikationLang || 'de';
            if (typeof publicationTabLogic !== 'undefined' && publicationTabLogic.currentAggregatedPublicationData) {
                 // Get the HTML first
                const fullHtml = publicationMainController.getFullPublicationSectionHTML(publicationTabLogic.currentAggregatedPublicationData, pubSectionId, pubLang);
                const plainTextApproximation = ui_helpers.htmlToMarkdown(fullHtml); // Or a more sophisticated HTML to MD
                if (plainTextApproximation) {
                     await addFileToZip(['all', 'md'], generateFilename('PUBLIKATION_SECTION_MD', currentKollektiv, 'md', { sectionName: pubSectionId }), plainTextApproximation);
                }
            }
        }
        
        // XLSX package
        const xlsxBlobs = await exportService.createXLSXBlobs(currentKollektiv, appliedT2Criteria, appliedT2Logic, currentKollektivData, statsForExport.dataForExcel);
        if (xlsxBlobs.allInOne) {
            await addFileToZip(['all', 'xlsx'], generateFilename('STATISTIK_XLSX', currentKollektiv, 'xlsx'), xlsxBlobs.allInOne, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        }


        for (const packKey in packages) {
            if (packages[packKey].types.length > 0) {
                const currentZip = new JSZip();
                packages[packKey].types.forEach(file => {
                    currentZip.file(file.filename, file.content, { binary: file.type.startsWith("image/") || file.type.startsWith("application/") });
                });
                try {
                    const content = await currentZip.generateAsync({ type: "blob" });
                    saveAs(content, packages[packKey].filename);
                } catch (error) {
                    console.error(`ExportService: ZIP Generierungsfehler für ${packKey}`, error);
                    ui_helpers.showToast(`ZIP-Export für ${packKey.toUpperCase()} fehlgeschlagen.`, 'danger');
                }
            }
        }
    }
    
    async function createXLSXBlobs(kollektivId, t2Criteria, t2Logic, filteredPatientData, statsDataForExcel) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = APP_CONFIG.APP_NAME;
        workbook.lastModifiedBy = APP_CONFIG.APP_NAME;
        workbook.created = new Date();
        workbook.modified = new Date();

        const addSheet = (name, columns, dataRows) => {
            const sheet = workbook.addWorksheet(name);
            sheet.columns = columns;
            dataRows.forEach(row => sheet.addRow(row));
            sheet.getRow(1).font = { bold: true };
             sheet.columns.forEach(column => {
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, function(cell) {
                    let columnLength = cell.value ? cell.value.toString().length : 10;
                    if (cell.font && cell.font.bold) columnLength +=2; // Make bold columns wider
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
                column.width = maxLength < 10 ? 10 : (maxLength > 50 ? 50 : maxLength + 2);
            });
        };

        // Datenliste
        if (filteredPatientData && filteredPatientData.length > 0) {
            const dataSheetCols = [
                { header: 'Nr', key: 'nr', width: 5 },
                { header: 'Name', key: 'name', width: 15 },
                { header: 'Vorname', key: 'vorname', width: 15 },
                { header: 'Geschlecht', key: 'geschlecht', width: 10 },
                { header: 'Alter', key: 'alter', width: 8 },
                { header: 'Therapie', key: 'therapie', width: 12 },
                { header: 'N Patho', key: 'n_patho_status', width: 10 },
                { header: 'N AS', key: 'n_as_status', width: 8 },
                { header: 'N T2', key: 'n_t2_status', width: 8 },
                { header: 'Anz. Patho LK', key: 'anzahl_patho_lk', width:12 },
                { header: 'Anz. Patho N+ LK', key: 'anzahl_patho_n_plus_lk', width:15 },
            ];
            const dataSheetRows = filteredPatientData.map(p => ({
                nr: p.nr, name: p.name, vorname: p.vorname, geschlecht: p.geschlecht, alter: p.alter,
                therapie: p.therapie, n_patho_status: p.n_patho_status, n_as_status: p.n_as_status, n_t2_status: p.n_t2_status,
                anzahl_patho_lk: p.anzahl_patho_lk, anzahl_patho_n_plus_lk: p.anzahl_patho_n_plus_lk
            }));
            addSheet(APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_FILTERED, dataSheetCols, dataSheetRows);
        }
        
        // Statistische Übersicht
        if(statsDataForExcel && statsDataForExcel.length > 0) {
            const statsSheetCols = [
                { header: 'Kategorie', key: 'category', width: 30 },
                { header: 'Metrik', key: 'metric', width: 35 },
                { header: 'Wert', key: 'value', width: 20 },
                { header: '95% CI Untere', key: 'ci_lower', width: 15 },
                { header: '95% CI Obere', key: 'ci_upper', width: 15 },
                { header: 'P-Wert', key: 'p_value', width: 12 },
                { header: 'Details', key: 'details', width: 40 }
            ];
            addSheet(APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_STATISTIK, statsSheetCols, statsDataForExcel);
        }
        
        // Konfigurationsblatt
        const configSheetCols = [ {header: 'Parameter', key: 'param', width: 40}, {header: 'Wert', key: 'val', width: 60} ];
        const configSheetRows = [
            {param: 'App Name', val: APP_CONFIG.APP_NAME}, {param: 'App Version', val: APP_CONFIG.APP_VERSION},
            {param: 'Export Datum', val: getCurrentDateString('DD.MM.YYYY HH:mm:ss')},
            {param: 'Aktives Kollektiv', val: getKollektivDisplayName(kollektivId)},
            {param: 'Angewandte T2 Logik', val: t2Logic},
        ];
        if (t2Criteria) {
            Object.entries(t2Criteria).forEach(([key, crit]) => {
                 if(typeof crit === 'object' && crit !== null && 'active' in crit && 'threshold' in crit){
                     configSheetRows.push({param: `T2 Kriterium: ${key} - Aktiv`, val: crit.active.toString()});
                     configSheetRows.push({param: `T2 Kriterium: ${key} - Schwellwert`, val: crit.threshold?.toString()});
                     configSheetRows.push({param: `T2 Kriterium: ${key} - Bedingung`, val: crit.condition?.toString()});
                 } else if (typeof crit === 'object' && crit !== null && 'active' in crit && 'value' in crit){
                     configSheetRows.push({param: `T2 Kriterium: ${key} - Aktiv`, val: crit.active.toString()});
                     configSheetRows.push({param: `T2 Kriterium: ${key} - Wert`, val: crit.value?.toString()});
                 }
            });
        }
        addSheet(APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_KONFIG, configSheetCols, configSheetRows);

        const buffer = await workbook.xlsx.writeBuffer();
        return {
            allInOne: new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
        };
    }


    return Object.freeze({
        generateFilename,
        exportCSV,
        exportText,
        exportMarkdown,
        exportPublicationSectionMarkdown,
        exportFullPublicationMarkdown,
        exportChart,
        exportTableAsPng,
        convertSvgToPng,
        createDataPackages,
        createXLSXBlobs
    });
})();
