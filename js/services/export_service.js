const exportService = (() => {

    function generateFilename(typeKey, kollektiv, extension, options = {}) {
        const dateStr = utils.getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = utils.getKollektivDisplayName(kollektiv).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        let filenameType = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[typeKey] || typeKey || 'Export';

        if (options.chartName) {
            filenameType = filenameType.replace('{ChartName}', options.chartName.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        }
        if (options.tableName) {
            filenameType = filenameType.replace('{TableName}', options.tableName.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        } else if (typeKey === 'TABLE_PNG_EXPORT' && options.tableId) {
             filenameType = filenameType.replace('{TableName}', options.tableId.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        }

        if (options.studyId && filenameType.includes('{StudyID}')) {
             const safeStudyId = String(options.studyId).replace(/[^a-z0-9_-]/gi, '_');
             filenameType = filenameType.replace('{StudyID}', safeStudyId);
        } else {
             filenameType = filenameType.replace('_{StudyID}', '').replace('{StudyID}', '');
        }

        if (options.sectionName && filenameType.includes('{SectionName}')) {
            const safeSectionName = String(options.sectionName).replace(/[^a-z0-9_-]/gi, '_').substring(0,20);
            filenameType = filenameType.replace('{SectionName}', safeSectionName);
        } else {
            filenameType = filenameType.replace('_{SectionName}', '').replace('{SectionName}', '');
        }

        const filename = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE
            .replace('{TYPE}', filenameType)
            .replace('{KOLLEKTIV}', safeKollektiv)
            .replace('{DATE}', dateStr)
            .replace('{EXT}', extension);
        return filename;
    }

    function _downloadFile(content, filename, mimeType) {
        try {
            if (content === null || content === undefined) {
                 ui_helpers.showToast(`Export fehlgeschlagen: Keine Daten für ${filename}.`, 'warning');
                 return false;
            }
            const blob = (content instanceof Blob) ? content : new Blob([String(content)], { type: mimeType });
            if (blob.size === 0) {
                ui_helpers.showToast(`Export fehlgeschlagen: Leere Datei für ${filename}.`, 'warning');
                return false;
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                if (document.body.contains(a)) document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 150);
            return true;
        } catch (error) {
            ui_helpers.showToast(`Fehler beim Herunterladen: ${error.message}`, 'danger');
            return false;
        }
    }

    async function _convertSvgToPngBlob(svgElement, targetWidth = 1200) {
        return new Promise((resolve, reject) => {
            if (!svgElement || typeof svgElement.cloneNode !== 'function') return reject(new Error("Ungültiges SVG Element."));
            try {
                const svgClone = svgElement.cloneNode(true);
                const styles = getComputedStyle(svgElement);
                const viewBox = svgElement.viewBox?.baseVal;
                let sourceWidth = parseFloat(svgClone.getAttribute('width')) || parseFloat(styles.width) || viewBox?.width || targetWidth;
                let sourceHeight = parseFloat(svgClone.getAttribute('height')) || parseFloat(styles.height) || viewBox?.height || (targetWidth * 0.75);

                if (sourceWidth <= 0 || sourceHeight <= 0) return reject(new Error("SVG Dimensionen ungültig."));

                const scaleFactor = targetWidth / sourceWidth;
                const targetHeight = sourceHeight * scaleFactor;

                svgClone.setAttribute('width', String(targetWidth));
                svgClone.setAttribute('height', String(targetHeight));
                svgClone.style.backgroundColor = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff';

                const svgXml = new XMLSerializer().serializeToString(svgClone);
                const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgXml)))}`;

                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject(new Error("Canvas Context nicht verfügbar."));
                    ctx.fillStyle = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => { blob ? resolve(blob) : reject(new Error("Canvas toBlob fehlgeschlagen.")); }, 'image/png');
                };
                img.onerror = () => reject(new Error("Fehler beim Laden des SVG-Bildes."));
                img.src = svgDataUrl;
            } catch (error) { reject(new Error(`Konvertierungsfehler: ${error.message}`)); }
        });
    }

     async function _convertSvgToSvgBlob(svgElement) {
         return new Promise((resolve, reject) => {
             if (!svgElement || typeof svgElement.cloneNode !== 'function') return reject(new Error("Ungültiges SVG Element."));
              try {
                 const svgClone = svgElement.cloneNode(true);
                 const styleDef = `<style>
                    .axis path, .axis line { fill: none; stroke: #6c757d; shape-rendering: crispEdges; stroke-width: 1px; }
                    .axis text { font-family: ${getComputedStyle(document.body).fontFamily}; font-size: 11px; fill: #212529; }
                    .axis-label { font-family: ${getComputedStyle(document.body).fontFamily}; font-size: 12px; fill: #212529; }
                 </style>`;
                 svgClone.insertAdjacentHTML('afterbegin', styleDef);
                 const svgXml = new XMLSerializer().serializeToString(svgClone);
                 resolve(new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' }));
              } catch(error) { reject(new Error(`SVG-Blob Erstellungsfehler: ${error.message}`)); }
         });
     }

    function _generateStatistikCSVString(stats, kollektiv, criteria, logic) {
        if (!stats || !stats.deskriptiv) return null;
        const csvData = []; const na = 'N/A';
        const fv = (v, d) => utils.formatNumber(v, d, na, true);
        const fCI = (o, d) => !o || o.lower === null || o.upper === null ? [na, na] : [fv(o.lower, d), fv(o.upper, d)];
        
        csvData.push(['Parameter', 'Wert']);
        csvData.push(['Kollektiv', utils.getKollektivDisplayName(kollektiv)]);
        csvData.push(['Angewandte T2 Logik', logic]);
        csvData.push(['Angewandte T2 Kriterien', studyT2CriteriaManager.formatCriteriaForDisplay(criteria, logic)]);
        csvData.push([]);

        return Papa.unparse(csvData, { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER });
    }

    function _generateMarkdownTableString(dataOrStats, tableType, kollektiv, criteria, logic, options) {
        let headers = [], rows = [], title = '';
        const kollektivDisplayName = utils.getKollektivDisplayName(kollektiv);
        
        if (tableType === 'daten') {
            title = 'Datenliste'; headers = ['Nr', 'Name', 'Vorname', 'Geschl.', 'Alter', 'Therapie', 'N', 'AS', 'T2', 'Bemerkung'];
            if (!Array.isArray(dataOrStats)) return `# ${title}\n\nFehler: Ungültige Daten.`;
            rows = dataOrStats.map(p => [p.nr, p.name, p.vorname, p.geschlecht, p.alter, p.therapie, p.n, p.as, p.t2, p.bemerkung]);
        }
        const headerLine = `| ${headers.join(' | ')} |`;
        const separatorLine = `|${headers.map(() => '---').join('|')}|`;
        const bodyLines = rows.map(row => `| ${row.map(cell => String(cell || '').replace(/\|/g, '\\|')).join(' | ')} |`).join('\n');
        return `# ${title} (Kollektiv: ${kollektivDisplayName})\n\n${headerLine}\n${separatorLine}\n${bodyLines}`;
    }

    function _exportSingleChart(chartElementId, format, kollektiv, options = {}) {
        const svgElement = document.getElementById(chartElementId)?.querySelector('svg');
        if (!svgElement) {
            ui_helpers.showToast(`Diagramm '${chartElementId}' nicht gefunden.`, 'danger');
            return;
        }
        const chartName = options.chartName || chartElementId;
        const conversionPromise = format === 'png' ? _convertSvgToPngBlob(svgElement) : _convertSvgToSvgBlob(svgElement);
        const filenameKey = format === 'png' ? 'CHART_SINGLE_PNG' : 'CHART_SINGLE_SVG';
        const mimeType = format === 'png' ? 'image/png' : 'image/svg+xml;charset=utf-8';
        
        ui_helpers.showToast(`Generiere ${format.toUpperCase()} für Chart ${chartName}...`, 'info', 1500);
        conversionPromise.then(blob => {
            if (blob) {
                const filename = generateFilename(filenameKey, kollektiv, format, { chartName, ...options });
                if (_downloadFile(blob, filename, mimeType)) {
                    ui_helpers.showToast(`Chart exportiert: ${filename}`, 'success');
                }
            }
        }).catch(error => ui_helpers.showToast(`Fehler bei Chart-Export: ${error.message}`, 'danger'));
    }

    function _exportCategoryZip(category, data, bfResults, kollektiv, criteria, logic) {
        if (!window.JSZip) { ui_helpers.showToast("JSZip Bibliothek nicht geladen.", "danger"); return; }
        const zip = new JSZip();
        let filesAdded = 0;
        
        const addFile = (filename, content) => {
            if (content !== null && content !== undefined && String(content).length > 0) {
                zip.file(filename, content);
                filesAdded++;
            }
        };

        if (['all-zip', 'csv-zip'].includes(category)) {
             const statsData = statisticsService.calculateAllStatsForPublication(data, criteria, logic, bfResults)[kollektiv];
             addFile(generateFilename('STATS_CSV', kollektiv, 'csv'), _generateStatistikCSVString(statsData, kollektiv, criteria, logic));
        }

        if (filesAdded > 0) {
            const zipFilename = generateFilename(`${category.toUpperCase()}_PAKET`, kollektiv, 'zip');
            zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } })
               .then(content => {
                   if (_downloadFile(content, zipFilename, "application/zip")) {
                       ui_helpers.showToast(`${filesAdded} Datei(en) im ZIP-Paket exportiert.`, 'success');
                   }
               });
        } else {
            ui_helpers.showToast(`Keine Dateien für ${category.toUpperCase()}-Paket gefunden.`, 'warning');
        }
    }

    return Object.freeze({
        exportStatistikCSV: (data, kol, crit, log) => {
            const stats = statisticsService.calculateAllStatsForPublication(data, crit, log, bruteForceManager.getAllResults())[kol];
            const csvString = _generateStatistikCSVString(stats, kol, crit, log);
            const filename = generateFilename('STATS_CSV', kol, 'csv');
            if (_downloadFile(csvString, filename, 'text/csv;charset=utf-8;')) {
                ui_helpers.showToast(`Statistik exportiert: ${filename}`, 'success');
            }
        },
        exportTableMarkdown: (dataOrStats, tableType, kollektiv, criteria, logic, options) => {
            const mdString = _generateMarkdownTableString(dataOrStats, tableType, kollektiv, criteria, logic, options);
            const typeKey = `${tableType.toUpperCase()}_MD`;
            const filename = generateFilename(typeKey, kollektiv, 'md', options);
             if (_downloadFile(mdString, filename, 'text/markdown;charset=utf-8;')) {
                ui_helpers.showToast(`Tabelle als Markdown exportiert: ${filename}`, 'success');
            }
        },
        exportSingleChart: _exportSingleChart,
        exportCategoryZip: _exportCategoryZip
    });

})();
