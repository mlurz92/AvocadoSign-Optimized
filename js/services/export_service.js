const exportService = (() => {
    let _currentKollektiv = APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
    let _zipInstance = null;

    function _generateFilename(typeKey, kollektivName, extension, customName = null) {
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(kollektivName).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        let baseType = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[typeKey] || typeKey;

        if (customName) {
            baseType = baseType.replace('{ChartName}', customName.replace(/[^a-zA-Z0-9_-]/g, '_'))
                               .replace('{TableName}', customName.replace(/[^a-zA-Z0-9_-]/g, '_'));
        } else {
             baseType = baseType.replace('{ChartName}', 'Diagramm').replace('{TableName}', 'Tabelle');
        }

        let filename = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE
            .replace('{TYPE}', baseType)
            .replace('{KOLLEKTIV}', safeKollektiv)
            .replace('{DATE}', dateStr)
            .replace('{EXT}', extension);
        
        if(APP_CONFIG.EXPORT_SETTINGS.INCLUDE_TIMESTAMP_IN_FILENAME){
            const timeStr = getCurrentTimeString();
            filename = filename.replace(`.${extension}`, `_${timeStr}.${extension}`);
        }
        return filename;
    }

    function _getMarkdownFromTable(tableElement) {
        if (!tableElement) return '';
        let md = '';
        const headers = Array.from(tableElement.querySelectorAll('thead th')).map(th => th.textContent.trim());
        md += `| ${headers.join(' | ')} |\n`;
        md += `| ${headers.map(() => '---').join(' | ')} |\n`;
        const rows = Array.from(tableElement.querySelectorAll('tbody tr'));
        rows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('td, th')).map(cell => (cell.textContent || '').trim().replace(/\|/g, '\\|'));
            md += `| ${cells.join(' | ')} |\n`;
        });
        const caption = tableElement.querySelector('caption');
        if (caption && caption.textContent) {
            md = `**${caption.textContent.trim()}**\n\n${md}`;
        }
        return md;
    }

    function _getCSVFromTable(tableElement) {
        if (!tableElement) return '';
        let csv = '';
        const delimiter = APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ';';
        const rows = Array.from(tableElement.querySelectorAll('tr'));
        rows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('th, td')).map(cell => {
                let cellText = (cell.textContent || '').trim();
                if (cellText.includes(delimiter) || cellText.includes('"') || cellText.includes('\n')) {
                    cellText = `"${cellText.replace(/"/g, '""')}"`;
                }
                return cellText;
            });
            csv += cells.join(delimiter) + '\n';
        });
        const caption = tableElement.querySelector('caption');
        if (caption && caption.textContent) {
            csv = `# ${caption.textContent.trim()}\n${csv}`;
        }
        return csv;
    }

    function _getXLSXFromTable(tableElement, sheetName = 'Daten') {
        if (!tableElement || typeof XLSX === 'undefined') return null;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.table_to_sheet(tableElement, {raw: true, cellDates:true, dateNF:'dd.mm.yyyy'});
        const sheetNameToUse = sheetName.substring(0,30); // Max 31 chars for sheet names
        XLSX.utils.book_append_sheet(wb, ws, sheetNameToUse);
        const caption = tableElement.querySelector('caption');
        if (caption && caption.textContent) {
             if(!wb.Props) wb.Props = {};
             wb.Props.Title = caption.textContent.trim();
        }
        return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    }

    async function _convertSvgToPngBlob(svgElement, scale = 1, targetWidthPx = null) {
        if (!svgElement || typeof html2canvas === 'undefined') return null;
        try {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const tempImg = new Image();
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            return new Promise((resolve) => {
                tempImg.onload = async () => {
                    let canvasWidth = tempImg.width;
                    let canvasHeight = tempImg.height;
                    let effectiveScale = scale;

                    if (targetWidthPx && tempImg.width > 0) {
                        effectiveScale = targetWidthPx / tempImg.width;
                    }
                    
                    canvasWidth = Math.round(tempImg.width * effectiveScale);
                    canvasHeight = Math.round(tempImg.height * effectiveScale);

                    const canvas = document.createElement('canvas');
                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;
                    const ctx = canvas.getContext('2d');
                    
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.scale(effectiveScale, effectiveScale);
                    ctx.drawImage(tempImg, 0, 0);
                    URL.revokeObjectURL(url);

                    canvas.toBlob(resolve, 'image/png');
                };
                tempImg.onerror = () => {
                    URL.revokeObjectURL(url);
                    resolve(null);
                };
                tempImg.src = url;
            });
        } catch (e) {
            console.error("Fehler bei SVG zu PNG Konvertierung:", e);
            return null;
        }
    }
    
    function _convertSvgToSvgBlob(svgElement) {
        if (!svgElement) return null;
        try {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            return new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        } catch(e) {
            console.error("Fehler bei SVG zu Blob Konvertierung:", e);
            return null;
        }
    }

    async function exportSingleChart(chartId, format = 'png', chartNameFromButton = 'Diagramm', isPublicationExport = false) {
        const chartContainer = document.getElementById(chartId);
        if (!chartContainer) {
            ui_helpers.showToast(`Diagramm-Container '${chartId}' nicht gefunden.`, 'danger');
            return;
        }
        let svgElementToExport = chartContainer.querySelector('svg');
        let tempSvgContainer = null;
        
        const exportStyleOptions = {
            lang: 'en', // Always English for publication-style export
            grayscale: isPublicationExport ? (state.getCurrentChartSettings().grayscaleExportForPublication ?? false) : (state.getCurrentChartSettings().grayscaleExport ?? false),
            styleProfile: isPublicationExport ? 'journal' : 'appInternal',
            renderingContext: 'svg'
        };

        if (isPublicationExport && chartContainer.dataset.renderFunction && chartContainer.dataset.renderArgs) {
            try {
                const renderFunctionName = chartContainer.dataset.renderFunction;
                const renderArgs = JSON.parse(chartContainer.dataset.renderArgs);
                
                if (typeof chartRenderer[renderFunctionName] === 'function') {
                    tempSvgContainer = document.createElement('div');
                    tempSvgContainer.style.position = 'absolute';
                    tempSvgContainer.style.left = '-9999px'; // Off-screen
                    tempSvgContainer.style.width = `${JOURNAL_STYLE_CONFIG.SIZES.PNG_EXPORT_TARGET_WIDTH_SINGLE_COL_PX || 800}px`; // Define a fixed width for temp rendering
                    tempSvgContainer.style.height = `${(JOURNAL_STYLE_CONFIG.SIZES.PNG_EXPORT_TARGET_WIDTH_SINGLE_COL_PX || 800) * 0.75}px`;
                    tempSvgContainer.id = `temp-export-${chartId}`;
                    document.body.appendChild(tempSvgContainer);

                    // Re-render the chart with export styles in the temporary container
                    chartRenderer[renderFunctionName](
                        renderArgs.data, // Assuming data is part of renderArgs
                        tempSvgContainer.id,
                        renderArgs.options || {},
                        exportStyleOptions
                    );
                    svgElementToExport = tempSvgContainer.querySelector('svg');
                } else {
                     console.warn(`Render-Funktion ${renderFunctionName} nicht in chartRenderer gefunden. Exportiere sichtbares SVG.`);
                }
            } catch (e) {
                console.error(`Fehler beim Neu-Rendern des Diagramms ${chartId} für den Export:`, e);
            }
        } else if (!svgElementToExport && !isPublicationExport) {
            // If not a publication export and no svg found, try to render with current app settings
            // This part needs more robust logic if we want on-the-fly rendering for non-publication charts too
            // For now, we assume it is rendered for non-publication context.
             console.warn(`Sichtbares SVG für ${chartId} nicht gefunden und kein Re-Render für App-internen Export implementiert.`);
        }


        if (!svgElementToExport) {
            ui_helpers.showToast(`SVG-Element für Diagramm '${chartId}' nicht gefunden oder konnte nicht generiert werden.`, 'danger');
            if (tempSvgContainer) tempSvgContainer.remove();
            return;
        }
        
        const filename = _generateFilename('CHART_SINGLE', _currentKollektiv, format, chartNameFromButton);
        let blob = null;

        if (format === 'png') {
            const targetWidth = (exportStyleOptions.styleProfile === 'journal') 
                ? JOURNAL_STYLE_CONFIG.SIZES.PNG_EXPORT_TARGET_WIDTH_SINGLE_COL_PX 
                : (svgElementToExport.clientWidth || APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH);
            blob = await _convertSvgToPngBlob(svgElementToExport, 1, targetWidth);
        } else if (format === 'svg') {
            blob = _convertSvgToSvgBlob(svgElementToExport);
        }

        if (blob) {
            saveAs(blob, filename);
            ui_helpers.showToast(`${filename} erfolgreich heruntergeladen.`, 'success');
        } else {
            ui_helpers.showToast(`Fehler beim Erstellen der ${format.toUpperCase()}-Datei.`, 'danger');
        }
        if (tempSvgContainer) tempSvgContainer.remove();
    }
    
    async function exportTableAsPng(tableId, tableNameFromButton = 'Tabelle') {
        const tableElement = document.getElementById(tableId);
        if (!tableElement || typeof html2canvas === 'undefined') {
            ui_helpers.showToast(`Tabelle '${tableId}' nicht gefunden oder html2canvas fehlt.`, 'danger');
            return;
        }
        try {
            const scale = APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE;
            const canvas = await html2canvas(tableElement, {
                scale: scale,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const clonedTable = clonedDoc.getElementById(tableId);
                    if(clonedTable) {
                        clonedTable.style.boxShadow = 'none';
                        clonedTable.style.border = '1px solid #dee2e6'; // Add a border for better PNG output
                        clonedTable.querySelectorAll('th, td').forEach(cell => cell.style.border = '1px solid #dee2e6');
                    }
                }
            });
            const filename = _generateFilename('TABLE_PNG_EXPORT', _currentKollektiv, 'png', tableNameFromButton);
            canvas.toBlob(function(blob) {
                if (blob) {
                    saveAs(blob, filename);
                    ui_helpers.showToast(`${filename} erfolgreich heruntergeladen.`, 'success');
                } else {
                     ui_helpers.showToast('Fehler beim Erstellen des PNG-Blobs für die Tabelle.', 'danger');
                }
            }, 'image/png');
        } catch (e) {
            console.error("Fehler beim Exportieren der Tabelle als PNG:", e);
            ui_helpers.showToast(`Fehler beim Export der Tabelle ${tableNameFromButton}: ${e.message}`, 'danger');
        }
    }

    function exportData(type, currentData, appliedCriteria, appliedLogic, bruteForceResults, statistikData, currentKollektiv, filenameSuffix = null) {
        _currentKollektiv = currentKollektiv || _currentKollektiv;
        let content = '', filename = '', mimeType = 'text/plain;charset=utf-8';
        const filenameTypeKey = type.toUpperCase().replace(/-/g, '_');
        const na = '--';

        switch (type) {
            case 'statistik-csv':
                content = statistikExporter.generateStatistikCSV(statistikData, _currentKollektiv);
                filename = _generateFilename(filenameTypeKey, _currentKollektiv, 'csv');
                mimeType = 'text/csv;charset=utf-8';
                break;
            case 'bruteforce-txt':
                const bfResult = bruteForceResults ? bruteForceResults[_currentKollektiv] : null;
                content = statistikExporter.generateBruteForceReportTXT(bfResult, _currentKollektiv);
                filename = _generateFilename(filenameTypeKey, _currentKollektiv, 'txt');
                break;
            case 'deskriptiv-md':
                const tableDeskriptiv = document.getElementById(`table-deskriptiv-demographie-${_currentKollektiv === state.getStatistikKollektiv1() ? '1' : (_currentKollektiv === state.getStatistikKollektiv2() && state.getStatistikLayout()==='vergleich' ? '2' : '0')}`) 
                                     || document.getElementById('table-deskriptiv-demographie-0'); // Fallback to general one
                const tableLK = document.getElementById(`table-deskriptiv-lk-${_currentKollektiv === state.getStatistikKollektiv1() ? '1' : (_currentKollektiv === state.getStatistikKollektiv2() && state.getStatistikLayout()==='vergleich' ? '2' : '0')}`)
                                     || document.getElementById('table-deskriptiv-lk-0');
                content = `# Deskriptive Statistik für Kollektiv: ${getKollektivDisplayName(_currentKollektiv)}\n\n`;
                if (tableDeskriptiv) content += _getMarkdownFromTable(tableDeskriptiv) + '\n';
                if (tableLK) content += _getMarkdownFromTable(tableLK) + '\n';
                filename = _generateFilename(filenameTypeKey, _currentKollektiv, 'md');
                break;
            case 'daten-md':
                const tableDaten = document.getElementById('daten-table');
                content = `# Datenliste für Kollektiv: ${getKollektivDisplayName(_currentKollektiv)}\n\n` + _getMarkdownFromTable(tableDaten);
                filename = _generateFilename(filenameTypeKey, _currentKollektiv, 'md');
                break;
            case 'auswertung-md':
                const tableAuswertung = document.getElementById('auswertung-table');
                content = `# Auswertungstabelle für Kollektiv: ${getKollektivDisplayName(_currentKollektiv)}\n\n`;
                content += `**Angewandte T2-Kriterien:** ${t2CriteriaManager.formatAppliedCriteriaForDisplay(true)}\n\n`;
                content += _getMarkdownFromTable(tableAuswertung);
                filename = _generateFilename(filenameTypeKey, _currentKollektiv, 'md');
                break;
             case 'filtered-data-csv':
                const dataToExport = dataProcessor.filterDataByKollektiv(currentData, _currentKollektiv);
                content = statistikExporter.generatePatientDataCSV(dataToExport);
                filename = _generateFilename(filenameTypeKey, _currentKollektiv, 'csv');
                mimeType = 'text/csv;charset=utf-8';
                break;
            case 'comprehensive-report-html':
                content = statistikExporter.generateComprehensiveReportHTML(currentData, appliedCriteria, appliedLogic, bruteForceResults, statistikData, _currentKollektiv);
                filename = _generateFilename(filenameTypeKey, _currentKollektiv, 'html');
                mimeType = 'text/html;charset=utf-8';
                break;
             case 'publikation-methoden-md':
             case 'publikation-ergebnisse-md':
                const sectionId = type.includes('methoden') ? 'methoden' : 'ergebnisse';
                const pubData = { allKollektivStats: statistikData, currentLang: state.getCurrentPublikationLang(), currentSectionId: sectionId, currentBruteForceMetric: state.getCurrentPublikationBruteForceMetric(), config: PUBLICATION_CONFIG, appConfig: APP_CONFIG };
                content = publicationTextGenerator.generateSectionText(pubData);
                filename = _generateFilename(filenameTypeKey.replace("PUBLIKATION_","").replace("_MD",""), _currentKollektiv, 'md', sectionId.charAt(0).toUpperCase() + sectionId.slice(1));
                mimeType = 'text/markdown;charset=utf-8';
                break;
            default:
                ui_helpers.showToast(`Unbekannter Exporttyp: ${type}`, 'danger'); return;
        }
        if (content && filename) {
            const blob = new Blob([content], { type: mimeType });
            saveAs(blob, filename);
            ui_helpers.showToast(`${filename} erfolgreich heruntergeladen.`, 'success');
        } else {
            ui_helpers.showToast(`Fehler beim Erstellen der Datei für Exporttyp '${type}'. Inhalt oder Dateiname fehlt.`, 'danger');
        }
    }

    async function _collectChartsForZip(zip, type = 'png', includePublicationCharts = false) {
        const chartSelectors = [
            '#chart-stat-age-0 svg', '#chart-stat-gender-0 svg', // Statistik Tab (Einzelansicht)
            '#chart-stat-age-1 svg', '#chart-stat-gender-1 svg', // Statistik Tab (Vergleich 1)
            '#chart-stat-age-2 svg', '#chart-stat-gender-2 svg', // Statistik Tab (Vergleich 2)
            '#chart-vergleich-as-t2-0 svg', '#chart-as-performance-0 svg', // Statistik Einzelansicht
            '#chart-vergleich-as-t2-1 svg', '#chart-as-performance-1 svg', // Statistik Vergleich 1
            '#chart-vergleich-as-t2-2 svg', '#chart-as-performance-2 svg', // Statistik Vergleich 2
            '#chart-dash-age svg', '#chart-dash-gender svg', '#chart-dash-therapy svg', // Auswertung Dashboard
            '#chart-dash-statusN svg', '#chart-dash-statusAS svg', '#chart-dash-statusT2 svg',
            '#praes-vergleich-chart-container svg', // Präsentation
        ];
        if (includePublicationCharts) {
            Object.values(PUBLICATION_CONFIG.publicationElements.ergebnisse).forEach(el => {
                if (el.id.startsWith('pub-chart-')) {
                    chartSelectors.push(`#${el.id}-chartarea svg`); // Assuming chart is rendered in a div with -chartarea suffix
                }
            });
        }

        for (const selector of chartSelectors) {
            const svgElement = document.querySelector(selector);
            const chartContainer = svgElement?.closest('[id^="chart-"], [id^="pub-chart-"]');
            if (svgElement && chartContainer) {
                const chartId = chartContainer.id.replace('-chartarea', ''); // Get base ID
                const isPublicationChart = chartId.startsWith('pub-chart-');
                
                // Try to get a descriptive name
                let chartName = chartId.replace(/^chart-stat-|^chart-dash-|^chart-vergleich-|^chart-as-performance-|^praes-vergleich-chart-container$|^pub-chart-/, '');
                chartName = chartName.replace(/-\d$/, ''); // remove index suffix like -0, -1
                if (isPublicationChart) {
                     const elementConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse[chartId] || PUBLICATION_CONFIG.publicationElements.methoden[chartId];
                     chartName = elementConfig ? (elementConfig.referenceLabel || chartId).replace(/\s+/g, '_') : chartId;
                }
                chartName = chartName || 'UnbenanntesDiagramm';


                const exportStyleOptions = {
                    lang: 'en',
                    grayscale: state.getCurrentChartSettings().grayscaleExportForPublication || false, // Default to pub settings for zip
                    styleProfile: 'journal',
                    renderingContext: 'svg'
                };
                let svgToExport = svgElement;
                let tempContainer = null;

                if (chartContainer.dataset.renderFunction && chartContainer.dataset.renderArgs) {
                    try {
                        const renderFnName = chartContainer.dataset.renderFunction;
                        const renderArgs = JSON.parse(chartContainer.dataset.renderArgs);
                        if (typeof chartRenderer[renderFnName] === 'function') {
                            tempContainer = document.createElement('div');
                            tempContainer.id = `temp-zip-export-${chartId}`;
                            tempContainer.style.position = 'absolute'; tempContainer.style.left = '-9999px';
                            tempContainer.style.width = `${JOURNAL_STYLE_CONFIG.SIZES.PNG_EXPORT_TARGET_WIDTH_SINGLE_COL_PX || 800}px`;
                            tempContainer.style.height = `${(JOURNAL_STYLE_CONFIG.SIZES.PNG_EXPORT_TARGET_WIDTH_SINGLE_COL_PX || 800) * 0.75}px`;
                            document.body.appendChild(tempContainer);
                            chartRenderer[renderFnName](renderArgs.data, tempContainer.id, renderArgs.options || {}, exportStyleOptions);
                            svgToExport = tempContainer.querySelector('svg');
                        }
                    } catch (e) { console.warn(`ZIP Export: Fehler beim Neu-Rendern von ${chartId}`, e); }
                }

                if (svgToExport) {
                    let blob;
                    if (type === 'png') {
                        const targetWidth = JOURNAL_STYLE_CONFIG.SIZES.PNG_EXPORT_TARGET_WIDTH_SINGLE_COL_PX;
                        blob = await _convertSvgToPngBlob(svgToExport, 1, targetWidth);
                    } else {
                        blob = _convertSvgToSvgBlob(svgToExport);
                    }
                    if (blob) {
                        const filename = _generateFilename('CHART_SINGLE', _currentKollektiv, type, chartName);
                        zip.file(filename, blob);
                    }
                }
                if (tempContainer) tempContainer.remove();
            }
        }
    }

    async function _collectTablesForZip(zip) {
        // Export visible tables from Statistik and Auswertung as PNG
        const tableSelectors = [
            {id: 'table-deskriptiv-demographie-0', name: 'Deskriptiv_Demographie'}, {id: 'table-deskriptiv-lk-0', name: 'Deskriptiv_Lymphknoten'},
            {id: 'table-deskriptiv-demographie-1', name: 'Deskriptiv_Demographie_K1'}, {id: 'table-deskriptiv-lk-1', name: 'Deskriptiv_Lymphknoten_K1'},
            {id: 'table-deskriptiv-demographie-2', name: 'Deskriptiv_Demographie_K2'}, {id: 'table-deskriptiv-lk-2', name: 'Deskriptiv_Lymphknoten_K2'},
            {id: 'table-guete-matrix-AS-0', name: 'Guete_Matrix_AS'}, {id: 'table-guete-metrics-AS-0', name: 'Guete_Metriken_AS'},
            {id: 'table-guete-matrix-T2-0', name: 'Guete_Matrix_T2'}, {id: 'table-guete-metrics-T2-0', name: 'Guete_Metriken_T2'},
            {id: 'table-vergleich-as-vs-t2-0', name: 'Vergleich_ASvsT2'},
            {id: 'table-assoziation-0', name: 'Assoziationen'},
            {id: 'table-vergleich-kollektive-0', name: 'Vergleich_Kollektive'},
            {id: 'table-kriterien-vergleich', name: 'Kriterien_Vergleich_Statistik'},
            {id: 'auswertung-table', name: 'Auswertungstabelle_Patienten'},
            // Add publication tables
            ...Object.values(PUBLICATION_CONFIG.publicationElements.methoden)
                .filter(el => el.id.startsWith('pub-table-'))
                .map(el => ({id: `${el.id}-content-table`, name: (el.referenceLabel || el.id).replace(/\s+/g, '_')})),
            ...Object.values(PUBLICATION_CONFIG.publicationElements.ergebnisse)
                .filter(el => el.id.startsWith('pub-table-'))
                .map(el => ({id: `${el.id}-content-table`, name: (el.referenceLabel || el.id).replace(/\s+/g, '_')}))
        ];

        for (const {id, name} of tableSelectors) {
            const tableElement = document.getElementById(id);
            if (tableElement && typeof html2canvas !== 'undefined') {
                 try {
                    const canvas = await html2canvas(tableElement, { scale: APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE, useCORS: true, backgroundColor: '#ffffff', onclone: (clonedDoc) => { const clonedTable = clonedDoc.getElementById(id); if(clonedTable){ clonedTable.style.boxShadow = 'none'; clonedTable.style.border = '1px solid #dee2e6'; clonedTable.querySelectorAll('th,td').forEach(c => c.style.border = '1px solid #dee2e6'); } }});
                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                    if (blob) {
                        const filename = _generateFilename('TABLE_PNG_EXPORT', _currentKollektiv, 'png', name);
                        zip.file(filename, blob);
                    }
                } catch (e) { console.warn(`Fehler beim PNG-Export von Tabelle ${id}:`, e); }
            }
        }
    }

    function _collectMarkdownForZip(zip, statistikData, currentData, appliedCriteria, appliedLogic) {
        const mdTypes = ['deskriptiv-md', 'daten-md', 'auswertung-md'];
        if (document.getElementById('publikation-tab-pane')) { // Check if pub tab exists
             mdTypes.push('publikation-methoden-md');
             mdTypes.push('publikation-ergebnisse-md');
        }

        mdTypes.forEach(type => {
            let content = '', filename = '', mimeType = 'text/markdown;charset=utf-8';
            const filenameTypeKey = type.toUpperCase().replace(/-/g, '_');
            const isPubExport = type.startsWith('publikation-');
            const na = '--';

            switch (type) {
                 case 'deskriptiv-md':
                    const tableDeskriptiv = document.getElementById('table-deskriptiv-demographie-0');
                    const tableLK = document.getElementById('table-deskriptiv-lk-0');
                    content = `# Deskriptive Statistik für Kollektiv: ${getKollektivDisplayName(_currentKollektiv)}\n\n`;
                    if (tableDeskriptiv) content += _getMarkdownFromTable(tableDeskriptiv) + '\n';
                    if (tableLK) content += _getMarkdownFromTable(tableLK) + '\n';
                    filename = _generateFilename(filenameTypeKey, _currentKollektiv, 'md');
                    break;
                case 'daten-md':
                    const tableDaten = document.getElementById('daten-table');
                    content = `# Datenliste für Kollektiv: ${getKollektivDisplayName(_currentKollektiv)}\n\n` + _getMarkdownFromTable(tableDaten);
                    filename = _generateFilename(filenameTypeKey, _currentKollektiv, 'md');
                    break;
                case 'auswertung-md':
                    const tableAuswertung = document.getElementById('auswertung-table');
                    content = `# Auswertungstabelle für Kollektiv: ${getKollektivDisplayName(_currentKollektiv)}\n\n`;
                    content += `**Angewandte T2-Kriterien:** ${t2CriteriaManager.formatAppliedCriteriaForDisplay(true)}\n\n`;
                    content += _getMarkdownFromTable(tableAuswertung);
                    filename = _generateFilename(filenameTypeKey, _currentKollektiv, 'md');
                    break;
                case 'publikation-methoden-md':
                case 'publikation-ergebnisse-md':
                    const sectionId = type.includes('methoden') ? 'methoden' : 'ergebnisse';
                    const pubData = { allKollektivStats: statistikData, currentLang: state.getCurrentPublikationLang(), currentSectionId: sectionId, currentBruteForceMetric: state.getCurrentPublikationBruteForceMetric(), config: PUBLICATION_CONFIG, appConfig: APP_CONFIG };
                    content = publicationTextGenerator.generateSectionText(pubData);
                    filename = _generateFilename(filenameTypeKey.replace("PUBLIKATION_","").replace("_MD",""), _currentKollektiv, 'md', sectionId.charAt(0).toUpperCase() + sectionId.slice(1));
                    break;
            }
            if (content && filename) {
                zip.file(filename, content, {binary: false});
            }
        });
    }

    function _collectCSVForZip(zip, statistikData, currentData) {
        const csvTypes = ['statistik-csv', 'filtered-data-csv'];
        csvTypes.forEach(type => {
            let content = '', filename = '', mimeType = 'text/csv;charset=utf-8';
            const filenameTypeKey = type.toUpperCase().replace(/-/g, '_');
            switch (type) {
                 case 'statistik-csv':
                    content = statistikExporter.generateStatistikCSV(statistikData, _currentKollektiv);
                    filename = _generateFilename(filenameTypeKey, _currentKollektiv, 'csv');
                    break;
                case 'filtered-data-csv':
                    const dataToExport = dataProcessor.filterDataByKollektiv(currentData, _currentKollektiv);
                    content = statistikExporter.generatePatientDataCSV(dataToExport);
                    filename = _generateFilename(filenameTypeKey, _currentKollektiv, 'csv');
                    break;
            }
             if (content && filename) {
                zip.file(filename, content, {binary: false});
            }
        });
    }
    
    function _collectXLSXForZip(zip, xlsxDataPackage) {
        if (!xlsxDataPackage || typeof XLSX === 'undefined') return;
        const wb = XLSX.utils.book_new();
        if(xlsxDataPackage.daten) XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(xlsxDataPackage.daten, {raw:true, cellDates:true, dateNF:'dd.mm.yyyy'}), APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_DATEN);
        if(xlsxDataPackage.auswertung) XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(xlsxDataPackage.auswertung, {raw:true, cellDates:true, dateNF:'dd.mm.yyyy'}), APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_AUSWERTUNG);
        if(xlsxDataPackage.statistik) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(xlsxDataPackage.statistik), APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_STATISTIK); // statistik is AoA
        if(xlsxDataPackage.filtered) XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(xlsxDataPackage.filtered, {raw:true, cellDates:true, dateNF:'dd.mm.yyyy'}), APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_FILTERED);
        if(xlsxDataPackage.config) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(xlsxDataPackage.config), APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAME_KONFIG);

        const filename = _generateFilename('XLSX_ZIP', _currentKollektiv, 'xlsx', 'Gesamtdaten'); // Special case, one XLSX file in ZIP
        const xlsxContent = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        if (xlsxContent) {
            zip.file(filename, new Uint8Array(xlsxContent), {binary: true});
        }
    }


    async function exportFilesAsZip(zipType, currentData, appliedCriteria, appliedLogic, bruteForceResults, statistikData, currentKollektiv, xlsxDataForZip = null) {
        if (typeof JSZip === 'undefined') { ui_helpers.showToast('JSZip Bibliothek nicht geladen. ZIP-Export nicht möglich.', 'danger'); return; }
        _currentKollektiv = currentKollektiv || _currentKollektiv;
        _zipInstance = new JSZip();

        const filenameTypeKey = zipType.toUpperCase().replace(/-/g, '_');
        let exportNameBase = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[filenameTypeKey] || zipType;
        let filename = _generateFilename(filenameTypeKey, _currentKollektiv, 'zip', exportNameBase);
        ui_helpers.showToast(`ZIP-Archiv '${filename}' wird erstellt...`, 'info', 6000);

        try {
            if (zipType === 'all-zip' || zipType === 'csv-zip') {
                _collectCSVForZip(_zipInstance, statistikData, currentData);
            }
            if (zipType === 'all-zip' || zipType === 'md-zip') {
                _collectMarkdownForZip(_zipInstance, statistikData, currentData, appliedCriteria, appliedLogic);
                const bfResult = bruteForceResults ? bruteForceResults[_currentKollektiv] : null;
                if (bfResult) {
                    const bfContent = statistikExporter.generateBruteForceReportTXT(bfResult, _currentKollektiv);
                    const bfFilename = _generateFilename('BRUTEFORCE_TXT', _currentKollektiv, 'txt');
                    _zipInstance.file(bfFilename, bfContent);
                }
            }
            if (zipType === 'all-zip') { // HTML Report nur im All-Zip
                 const htmlReportContent = statistikExporter.generateComprehensiveReportHTML(currentData, appliedCriteria, appliedLogic, bruteForceResults, statistikData, _currentKollektiv);
                 const htmlReportFilename = _generateFilename('COMPREHENSIVE_REPORT_HTML', _currentKollektiv, 'html');
                 _zipInstance.file(htmlReportFilename, htmlReportContent);
            }

            if (zipType === 'all-zip' || zipType === 'png-zip') {
                await _collectChartsForZip(_zipInstance, 'png', true); // Include publication charts for all-zip and png-zip
                await _collectTablesForZip(_zipInstance);
            }
            if (zipType === 'all-zip' || zipType === 'svg-zip') {
                await _collectChartsForZip(_zipInstance, 'svg', true);
            }
            
            // XLSX ZIP is special, it collects various tables into one XLSX file, then zips that single file.
            // The original logic seems to have intended separate handling.
            // For now, if zipType is xlsx-zip, we assume xlsxDataForZip is provided correctly
            if (zipType === 'xlsx-zip' && xlsxDataForZip) {
                _collectXLSXForZip(_zipInstance, xlsxDataForZip);
            }


            if (Object.keys(_zipInstance.files).length > 0) {
                const content = await _zipInstance.generateAsync({ type: "blob" });
                saveAs(content, filename);
                ui_helpers.showToast(`${filename} erfolgreich heruntergeladen.`, 'success');
            } else {
                ui_helpers.showToast(`Keine Dateien zum Zippen für Typ '${zipType}' gefunden.`, 'warning');
            }
        } catch (e) {
            console.error(`Fehler beim Erstellen des ZIP-Archivs (${zipType}):`, e);
            ui_helpers.showToast(`ZIP-Erstellung fehlgeschlagen: ${e.message}`, 'danger');
        } finally {
            _zipInstance = null;
        }
    }

    function exportCurrentComprehensiveReport(currentData, appliedCriteria, appliedLogic, bruteForceResults, statistikData, currentKollektiv) {
         _currentKollektiv = currentKollektiv;
         exportData('comprehensive-report-html', currentData, appliedCriteria, appliedLogic, bruteForceResults, statistikData, _currentKollektiv);
    }


    return Object.freeze({
        exportData,
        exportSingleChart,
        exportTableAsPng,
        exportFilesAsZip,
        exportCurrentComprehensiveReport,
        setCurrentKollektiv: (k) => { _currentKollektiv = k; }
    });

})();
