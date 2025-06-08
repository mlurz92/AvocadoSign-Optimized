const exportService = (() => {

    // Funktion zum Konvertieren von HTML-Tabellen in CSV
    function tableToCSV(tableId, delimiter = ';') {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error(`Tabelle mit ID '${tableId}' nicht gefunden für CSV Export.`);
            return '';
        }

        let csv = [];
        const rows = table.querySelectorAll('tr');

        rows.forEach(row => {
            let rowData = [];
            row.querySelectorAll('th, td').forEach(cell => {
                // Bereinigen von HTML und Trimmen von Leerzeichen
                let text = cell.innerText.trim();
                // Anführungszeichen escapen und Zelle in Anführungszeichen setzen, wenn sie das Trennzeichen enthält
                if (text.includes(delimiter) || text.includes('\n') || text.includes('"')) {
                    text = '"' + text.replace(/"/g, '""') + '"';
                }
                rowData.push(text);
            });
            csv.push(rowData.join(delimiter));
        });
        return csv.join('\n');
    }

    // Funktion zum Konvertieren von Datenobjekten in CSV (generische Funktion)
    function dataToCSV(data, columns, delimiter = ';') {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }

        let csv = [];
        const header = columns.map(col => col.label).join(delimiter);
        csv.push(header);

        data.forEach(row => {
            let rowData = [];
            columns.forEach(col => {
                let value = row[col.key];
                if (typeof value === 'object' && value !== null) {
                    // Spezielle Handhabung für verschachtelte Objekte, z.B. für T2-Kriterien oder Metriken
                    if (col.key.startsWith('t2Criteria_')) {
                        const criterionKey = col.key.substring('t2Criteria_'.length);
                        if (value[criterionKey] && value[criterionKey].active) {
                            if (criterionKey === 'size') {
                                value = `Size>=${value[criterionKey].threshold}`;
                            } else {
                                value = value[criterionKey].value;
                            }
                        } else {
                            value = ''; // Kriterium inaktiv
                        }
                    } else if (value.value !== undefined) {
                        value = formatNumber(value.value, 3, ''); // Metrik-Werte
                    } else {
                        value = JSON.stringify(value); // Fallback für generische Objekte
                    }
                } else if (value === null || value === undefined) {
                    value = '';
                } else if (typeof value === 'string' && (value.includes(delimiter) || value.includes('\n') || value.includes('"'))) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                rowData.push(value);
            });
            csv.push(rowData.join(delimiter));
        });
        return csv.join('\n');
    }

    // Exportieren von Inhalten als Datei
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Dateinamen generieren
    function generateFilename(type, kollektiv, studyId = null, chartName = null, tableName = null) {
        let filename = APP_CONFIG.EXPORT.FILENAME_TEMPLATE;
        const date = getCurrentDateString(APP_CONFIG.EXPORT.DATE_FORMAT);
        const ext = APP_CONFIG.EXPORT.FILENAME_TYPES[type]?.ext || type.split('.').pop() || 'txt';
        let typeName = APP_CONFIG.EXPORT.FILENAME_TYPES[type] || type;

        if (studyId && typeName.includes('{StudyID}')) {
            typeName = typeName.replace('{StudyID}', studyId);
        }
        if (chartName && typeName.includes('{ChartName}')) {
            typeName = typeName.replace('{ChartName}', chartName);
        }
        if (tableName && typeName.includes('{TableName}')) {
            typeName = typeName.replace('{TableName}', tableName);
        }

        filename = filename
            .replace('{TYPE}', typeName)
            .replace('{KOLLEKTIV}', kollektiv.replace(/\s+/g, '_'))
            .replace('{DATE}', date)
            .replace('{EXT}', ext);

        return filename;
    }

    // Export als CSV
    function exportCSV(tableId, data, columns, kollektiv, type, filenameSuffix = '') {
        const content = tableId ? tableToCSV(tableId, APP_CONFIG.EXPORT.CSV_DELIMITER) : dataToCSV(data, columns, APP_CONFIG.EXPORT.CSV_DELIMITER);
        const filename = generateFilename(type, kollektiv, null, null, filenameSuffix);
        downloadFile(content, filename, 'text/csv;charset=utf-8;');
        ui_helpers.showToast(`'${filename}' erfolgreich exportiert!`, 'success');
    }

    // Export als Markdown
    function exportMarkdown(content, kollektiv, type, filenameSuffix = '') {
        const filename = generateFilename(type, kollektiv, null, null, filenameSuffix);
        downloadFile(content, filename, 'text/markdown;charset=utf-8;');
        ui_helpers.showToast(`'${filename}' erfolgreich exportiert!`, 'success');
    }
    
    // Export als Text (für Brute-Force Report)
    function exportText(content, kollektiv, type, filenameSuffix = '') {
        const filename = generateFilename(type, kollektiv, null, null, filenameSuffix);
        downloadFile(content, filename, 'text/plain;charset=utf-8;');
        ui_helpers.showToast(`'${filename}' erfolgreich exportiert!`, 'success');
    }

    // Export als PNG für Charts oder Tabellen
    async function exportPng(elementId, kollektiv, type, filenameSuffix = '') {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element mit ID '${elementId}' nicht gefunden für PNG Export.`);
            ui_helpers.showToast('Fehler beim Exportieren als PNG: Element nicht gefunden.', 'danger');
            return;
        }

        try {
            const canvas = await html2canvas(element, { scale: APP_CONFIG.EXPORT.TABLE_PNG_SCALE, useCORS: true, logging: false });
            const dataURL = canvas.toDataURL('image/png');
            const filename = generateFilename(type, kollektiv, null, filenameSuffix, filenameSuffix);
            downloadFile(dataURL, filename, 'image/png');
            ui_helpers.showToast(`'${filename}' erfolgreich exportiert!`, 'success');
        } catch (error) {
            console.error('Fehler beim Exportieren des PNG:', error);
            ui_helpers.showToast(`Fehler beim Exportieren von '${filenameSuffix}' als PNG.`, 'danger');
        }
    }

    // Export als SVG (nur für D3.js SVGs)
    function exportSvg(elementId, kollektiv, type, filenameSuffix = '') {
        const container = document.getElementById(elementId);
        if (!container) {
            console.error(`SVG-Container mit ID '${elementId}' nicht gefunden für SVG Export.`);
            ui_helpers.showToast('Fehler beim Exportieren als SVG: Element nicht gefunden.', 'danger');
            return;
        }
        
        const svgElement = container.querySelector('svg');
        if (!svgElement) {
            console.error(`SVG-Element nicht gefunden innerhalb des Containers mit ID '${elementId}'.`);
            ui_helpers.showToast('Fehler beim Exportieren als SVG: SVG-Element nicht gefunden.', 'danger');
            return;
        }

        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgElement);

        // Hinzufügen des XML-Headers und DTD für standalone SVG
        svgString = '<?xml version="1.0" standalone="no"?>\n' +
                    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
                    svgString;

        const filename = generateFilename(type, kollektiv, null, filenameSuffix, filenameSuffix);
        downloadFile(svgString, filename, 'image/svg+xml;charset=utf-8;');
        ui_helpers.showToast(`'${filename}' erfolgreich exportiert!`, 'success');
    }

    // Bündel-Export als ZIP-Archiv
    async function exportCategoryZip(category, allRawData, bruteForceResults, currentKollektiv, appliedCriteria, appliedLogic) {
        const zip = new JSZip();
        const date = getCurrentDateString(APP_CONFIG.EXPORT.DATE_FORMAT);
        const kollektivFormatted = currentKollektiv.replace(/\s+/g, '_');
        const filename = APP_CONFIG.EXPORT.FILENAME_TEMPLATE
                            .replace('{TYPE}', APP_CONFIG.EXPORT.FILENAME_TYPES[`ZIP_${category.toUpperCase()}`] || `Export_${category}`)
                            .replace('{KOLLEKTIV}', kollektivFormatted)
                            .replace('{DATE}', date)
                            .replace('{EXT}', 'zip');

        ui_helpers.showToast(`Erstelle ZIP-Archiv für '${category}'...`, 'info', 5000);

        try {
            const dataForKollektiv = dataManager.filterDataByKollektiv(allRawData, currentKollektiv);
            const evaluatedDataForKollektiv = t2CriteriaManager.evaluateDataset(dataForKollektiv, appliedCriteria, appliedLogic);
            const allStats = statisticsService.calculateAllStatsForPublication(allRawData, appliedCriteria, appliedLogic, bruteForceResults);
            const currentStats = allStats[currentKollektiv];
            const currentKollektivStatsForPub = allStats[currentKollektiv];

            switch (category) {
                case 'csv':
                    if (currentStats) {
                        const statsCsvContent = statisticsService.getAllStatsAsCSV(currentStats, currentKollektiv, appliedCriteria, appliedLogic, bruteForceResults);
                        zip.file(generateFilename(APP_CONFIG.EXPORT.FILENAME_TYPES.STATS_CSV, currentKollektiv), statsCsvContent);
                    }
                    if (evaluatedDataForKollektiv) {
                        const patientDataColumns = [
                            { key: 'nr', label: 'Nr' }, { key: 'name', label: 'Name' }, { key: 'vorname', label: 'Vorname' },
                            { key: 'geschlecht', label: 'Geschlecht' }, { key: 'alter', label: 'Alter' }, { key: 'therapie', label: 'Therapie' },
                            { key: 'n', label: 'N_Status_Patho' }, { key: 'as', label: 'AS_Status' }, { key: 't2', label: 'T2_Status_Applied' },
                            { key: 'anzahl_patho_n_plus_lk', label: 'Anzahl_Patho_Nplus_LK' }, { key: 'anzahl_patho_lk', label: 'Anzahl_Patho_LK_Gesamt' },
                            { key: 'anzahl_as_plus_lk', label: 'Anzahl_ASplus_LK' }, { key: 'anzahl_as_lk', label: 'Anzahl_AS_LK_Gesamt' },
                            { key: 'anzahl_t2_plus_lk', label: 'Anzahl_T2plus_LK_Applied' }, { key: 'anzahl_t2_lk', label: 'Anzahl_T2_LK_Gesamt' },
                            { key: 'bemerkung', label: 'Bemerkung' }
                        ];
                        const patientDataCsvContent = dataToCSV(evaluatedDataForKollektiv, patientDataColumns, APP_CONFIG.EXPORT.CSV_DELIMITER);
                        zip.file(generateFilename(APP_CONFIG.EXPORT.FILENAME_TYPES.FILTERED_DATA_CSV, currentKollektiv), patientDataCsvContent);
                    }
                    break;

                case 'md':
                    if (currentStats) {
                        const deskriptivMdContent = publicationTextGenerator.getSectionText('ergebnisse_patientencharakteristika', 'de', allStats, { bruteForceMetricForPublication: 'Balanced Accuracy' });
                        zip.file(generateFilename(APP_CONFIG.EXPORT.FILENAME_TYPES.DESKRIPTIV_MD, currentKollektiv), deskriptivMdContent);
                    }
                    const dataTabContent = dataTab.render(evaluatedDataForKollektiv, { key: null, direction: 'asc' });
                    const dataTable = document.createElement('div');
                    dataTable.innerHTML = dataTabContent;
                    zip.file(generateFilename(APP_CONFIG.EXPORT.FILENAME_TYPES.DATEN_MD, currentKollektiv), common.convertHtmlTableToMarkdown(dataTable.querySelector('#daten-table')));

                    const auswertungTabContent = auswertungTab.render(evaluatedDataForKollektiv, appliedCriteria, appliedLogic, { key: null, direction: 'asc' }, currentKollektiv);
                    const auswertungTable = document.createElement('div');
                    auswertungTable.innerHTML = auswertungTabContent;
                    zip.file(generateFilename(APP_CONFIG.EXPORT.FILENAME_TYPES.AUSWERTUNG_MD, currentKollektiv), common.convertHtmlTableToMarkdown(auswertungTable.querySelector('#auswertung-table')));

                    const publicationTextContent = publicationRenderer.renderSectionContent('all', 'de', allStats, { bruteForceMetricForPublication: PUBLICATION_CONFIG.defaultBruteForceMetricForPublication }, { currentKollektiv: currentKollektiv });
                    zip.file(generateFilename(APP_CONFIG.EXPORT.FILENAME_TYPES.PUBLICATION_FULL_MD, currentKollektiv), publicationTextContent);
                    break;

                case 'png':
                case 'svg':
                    const chartIds = [
                        'chart-dash-age', 'chart-dash-gender', 'chart-dash-therapy',
                        'chart-dash-status-n', 'chart-dash-status-as', 'chart-dash-status-t2',
                        'matrix-AS-0', 'roc-AS-0', 'matrix-T2-0', 'roc-T2-0',
                        'matrix-AS-1', 'roc-AS-1', 'matrix-T2-1', 'roc-T2-1',
                        'praes-as-pur-perf-chart', 'praes-comp-chart-container'
                    ];
                    
                    const tableIds = [
                        'praes-as-pur-perf-table', 'praes-as-vs-t2-comp-table', 'praes-as-vs-t2-test-table'
                    ];

                    for (const id of chartIds) {
                        const element = document.getElementById(id);
                        if (element && element.querySelector('svg')) {
                            const filename = id.includes('dash') ? `Dashboard_${id.replace('chart-dash-', '')}` : id;
                            if (category === 'png') {
                                const canvas = await html2canvas(element, { scale: APP_CONFIG.EXPORT.TABLE_PNG_SCALE, useCORS: true, logging: false });
                                zip.file(generateFilename(APP_CONFIG.EXPORT.FILENAME_TYPES.CHART_PNG, currentKollektiv, null, filename), canvas.toDataURL('image/png').split('base64,')[1], { base64: true });
                            } else { // SVG
                                const svgElement = element.querySelector('svg');
                                const serializer = new XMLSerializer();
                                let svgString = serializer.serializeToString(svgElement);
                                svgString = '<?xml version="1.0" standalone="no"?>\n' +
                                            '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
                                            svgString;
                                zip.file(generateFilename(APP_CONFIG.EXPORT.FILENAME_TYPES.CHART_SVG, currentKollektiv, null, filename), svgString);
                            }
                        }
                    }

                    if (category === 'png') {
                        for (const id of tableIds) {
                            const element = document.getElementById(id);
                             if (element) {
                                const filename = id.replace('praes-', '').replace('-table', '');
                                const canvas = await html2canvas(element, { scale: APP_CONFIG.EXPORT.TABLE_PNG_SCALE, useCORS: true, logging: false });
                                zip.file(generateFilename(APP_CONFIG.EXPORT.FILENAME_TYPES.TABLE_PNG, currentKollektiv, null, filename), canvas.toDataURL('image/png').split('base64,')[1], { base64: true });
                            }
                        }
                    }
                    break;
                case 'all':
                    // Rekursiver Aufruf, um alle Kategorien zu zippen
                    await exportCategoryZip('csv', allRawData, bruteForceResults, currentKollektiv, appliedCriteria, appliedLogic).then(csvZip => {
                        zip.file('csv_exports.zip', csvZip);
                    });
                    await exportCategoryZip('md', allRawData, bruteForceResults, currentKollektiv, appliedCriteria, appliedLogic).then(mdZip => {
                        zip.file('markdown_exports.zip', mdZip);
                    });
                    await exportCategoryZip('png', allRawData, bruteForceResults, currentKollektiv, appliedCriteria, appliedLogic).then(pngZip => {
                        zip.file('png_exports.zip', pngZip);
                    });
                    await exportCategoryZip('svg', allRawData, bruteForceResults, currentKollektiv, appliedCriteria, appliedLogic).then(svgZip => {
                        zip.file('svg_exports.zip', svgZip);
                    });
                    // Direkte Dateien hinzufügen, die nicht in Kategorien fallen
                    if (bruteForceResults && bruteForceResults[currentKollektiv]) {
                        const bfReportContent = bruteForceManager.getBruteForceReportContent(bruteForceResults[currentKollektiv], currentKollektiv, 'de');
                        zip.file(generateFilename(APP_CONFIG.EXPORT.FILENAME_TYPES.BRUTEFORCE_TXT, currentKollektiv), bfReportContent);
                    }
                    break;
                default:
                    ui_helpers.showToast(`Unbekannte Export-Kategorie: ${category}`, 'danger');
                    return;
            }

            zip.generateAsync({ type: "blob" }).then(content => {
                downloadFile(content, filename, 'application/zip');
                ui_helpers.showToast(`ZIP-Archiv '${filename}' erfolgreich erstellt und heruntergeladen.`, 'success', 5000);
            }).catch(error => {
                console.error("Fehler beim Erstellen des ZIP-Archivs:", error);
                ui_helpers.showToast('Fehler beim Erstellen des ZIP-Archivs.', 'danger');
            });

        } catch (error) {
            console.error(`Fehler beim Exportieren der Kategorie '${category}':`, error);
            ui_helpers.showToast(`Fehler beim Exportieren der Kategorie '${category}'.`, 'danger');
        }
    }


    return Object.freeze({
        exportCSV,
        exportMarkdown,
        exportText,
        exportPng,
        exportSvg,
        exportCategoryZip
    });

})();
