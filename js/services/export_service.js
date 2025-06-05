const exportService = (() => {

    function _generateFilename(type, kollektiv, sectionId = null, chartName = null, tableName = null) {
        let filename = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE;
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(kollektiv).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');

        let actualType = type;
        if (APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[type]) {
            actualType = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[type];
        }

        filename = filename.replace('{TYPE}', actualType);
        filename = filename.replace('{KOLLEKTIV}', safeKollektiv);
        filename = filename.replace('{DATE}', dateStr);

        if (sectionId) {
            filename = filename.replace('{SectionName}', sectionId.replace(/_/g, '-'));
        }
        if (chartName) {
            filename = filename.replace('{ChartName}', chartName);
        }
        if (tableName) {
            filename = filename.replace('{TableName}', tableName);
        }
        return filename;
    }

    function _downloadFile(content, filename, mimeType) {
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

    function _convertTableToCsv(tableElement, delimiter = ';') {
        const rows = tableElement.querySelectorAll('tr');
        let csv = [];

        rows.forEach(row => {
            let rowData = [];
            row.querySelectorAll('th, td').forEach(cell => {
                let text = cell.textContent.trim().replace(/"/g, '""');
                if (text.includes(delimiter) || text.includes('\n') || text.includes('"')) {
                    text = `"${text}"`;
                }
                rowData.push(text);
            });
            csv.push(rowData.join(delimiter));
        });
        return csv.join('\n');
    }

    async function _convertTableToPngBlob(tableElement, scale = 2) {
        if (!window.html2canvas) {
            throw new Error("html2canvas Bibliothek ist nicht geladen.");
        }
        return new Promise((resolve, reject) => {
            html2canvas(tableElement, {
                scale: scale,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                ignoreElements: (element) => {
                    return element.classList.contains('no-export');
                }
            }).then(canvas => {
                canvas.toBlob(blob => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Fehler: Konnte kein PNG-Blob aus Tabelle erstellen."));
                    }
                }, 'image/png');
            }).catch(error => {
                reject(error);
            });
        });
    }

    function exportTableToCsv(tableId, filenameType, kollektiv) {
        const table = document.getElementById(tableId);
        if (table) {
            const csvContent = _convertTableToCsv(table, APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER);
            const filename = _generateFilename(filenameType, kollektiv);
            _downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
            ui_helpers.showToast(`Tabelle "${tableId}" als CSV exportiert.`, 'success');
        } else {
            ui_helpers.showToast(`Tabelle "${tableId}" nicht gefunden.`, 'danger');
        }
    }

    function exportMarkdown(markdownContent, filenameType, kollektiv, sectionId = null) {
        const filename = _generateFilename(filenameType, kollektiv, sectionId);
        _downloadFile(markdownContent, `${filename}.md`, 'text/markdown;charset=utf-8;');
        ui_helpers.showToast(`Markdown-Inhalt als ${filenameType} exportiert.`, 'success');
    }

    function exportTextFile(textContent, filenameType, kollektiv) {
        const filename = _generateFilename(filenameType, kollektiv);
        _downloadFile(textContent, `${filename}.txt`, 'text/plain;charset=utf-8;');
        ui_helpers.showToast(`Textdatei als ${filenameType} exportiert.`, 'success');
    }

    function exportHtmlReport(reportHtml, filenameType, kollektiv) {
        const filename = _generateFilename(filenameType, kollektiv);
        _downloadFile(reportHtml, `${filename}.html`, 'text/html;charset=utf-8;');
        ui_helpers.showToast(`HTML-Report als ${filenameType} exportiert.`, 'success');
    }

    async function exportChartAsImage(chartId, format, filenameType, kollektiv, chartNameOverride = null) {
        const chartElement = document.getElementById(chartId);
        if (!chartElement) {
            ui_helpers.showToast(`Diagramm "${chartId}" nicht gefunden.`, 'danger');
            return;
        }

        const svgElement = chartElement.querySelector('svg');
        if (!svgElement) {
            ui_helpers.showToast(`SVG-Element in Diagramm "${chartId}" nicht gefunden.`, 'danger');
            return;
        }

        const filename = _generateFilename(filenameType, kollektiv, null, chartNameOverride || chartId);
        let mimeType = '';
        let content = '';

        if (format === 'svg') {
            mimeType = 'image/svg+xml;charset=utf-8;';
            const serializer = new XMLSerializer();
            content = serializer.serializeToString(svgElement);
            _downloadFile(content, `${filename}.svg`, mimeType);
            ui_helpers.showToast(`Diagramm "${chartNameOverride || chartId}" als SVG exportiert.`, 'success');
        } else if (format === 'png') {
            mimeType = 'image/png';
            try {
                const svgData = new XMLSerializer().serializeToString(svgElement);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8;' });
                const svgUrl = URL.createObjectURL(svgBlob);

                const img = new Image();
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = svgElement.clientWidth * 2;
                    canvas.height = svgElement.clientHeight * 2;
                    const ctx = canvas.getContext('2d');
                    ctx.scale(2, 2);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob(blob => {
                        if (blob) {
                            _downloadFile(blob, `${filename}.png`, mimeType);
                            ui_helpers.showToast(`Diagramm "${chartNameOverride || chartId}" als PNG exportiert.`, 'success');
                        } else {
                            ui_helpers.showToast(`Fehler beim Erstellen des PNG-Blobs für "${chartId}".`, 'danger');
                        }
                        URL.revokeObjectURL(svgUrl);
                    }, mimeType);
                };
                img.onerror = (e) => {
                    URL.revokeObjectURL(svgUrl);
                    ui_helpers.showToast(`Fehler beim Laden des SVG als Bild für "${chartId}".`, 'danger');
                };
                img.src = svgUrl;
            } catch (error) {
                ui_helpers.showToast(`Fehler beim Export von "${chartId}" als PNG: ${error.message}`, 'danger');
            }
        }
    }

    async function exportTableAsPng(tableId, filenameType, kollektiv, tableNameOverride = null) {
        const tableElement = document.getElementById(tableId);
        if (!tableElement) {
            ui_helpers.showToast(`Tabelle "${tableId}" nicht gefunden.`, 'danger');
            return;
        }
        const filename = _generateFilename(filenameType, kollektiv, null, null, tableNameOverride || tableId);
        try {
            const blob = await _convertTableToPngBlob(tableElement, APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE);
            _downloadFile(blob, `${filename}.png`, 'image/png');
            ui_helpers.showToast(`Tabelle "${tableNameOverride || tableId}" als PNG exportiert.`, 'success');
        } catch (error) {
            ui_helpers.showToast(`Fehler beim Export von Tabelle "${tableNameOverride || tableId}" als PNG: ${error.message}`, 'danger');
        }
    }

    async function exportMultipleFilesAsZip(filePromises, zipFilename) {
        if (!window.JSZip) {
            ui_helpers.showToast("JSZip Bibliothek ist nicht geladen. ZIP-Export nicht möglich.", "danger");
            return;
        }
        ui_helpers.showToast("Starte ZIP-Export...", "info", 5000);
        const zip = new JSZip();

        try {
            const results = await Promise.allSettled(filePromises);
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    const { content, filename, folder = '' } = result.value;
                    if (content instanceof Blob) {
                        zip.file(`${folder}${filename}`, content);
                    } else {
                        zip.file(`${folder}${filename}`, new Blob([content], { type: 'text/plain' }));
                    }
                } else if (result.status === 'rejected') {
                    // console.error("Fehler beim Vorbereiten einer Datei für ZIP-Export:", result.reason);
                }
            });

            const zipBlob = await zip.generateAsync({ type: "blob" });
            _downloadFile(zipBlob, zipFilename, "application/zip");
            ui_helpers.showToast("ZIP-Export erfolgreich!", "success");

        } catch (error) {
            ui_helpers.showToast(`Fehler beim ZIP-Export: ${error.message}`, "danger");
        }
    }


    return Object.freeze({
        exportTableToCsv,
        exportMarkdown,
        exportTextFile,
        exportHtmlReport,
        exportChartAsImage,
        exportTableAsPng,
        exportMultipleFilesAsZip,
        generateFilename: _generateFilename
    });

})();
