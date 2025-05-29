const exportService = (() => {

    function _generateFilename(typeKey, kollektiv, extensionOverride = null, customNamePart = null) {
        const typeConfigEntry = Object.entries(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES)
                                     .find(([key, value]) => key === typeKey || value === typeKey);

        const typeValue = typeConfigEntry ? typeConfigEntry[1] : typeKey.replace(/[^a-zA-Z0-9_-]/g, '');

        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(kollektiv || state.getCurrentKollektiv()).replace(/[^a-zA-Z0-9_-]/gi, '').replace(/_+/g, '_');
        const ext = extensionOverride || typeKey.split('_').pop().toLowerCase() || 'txt';

        let finalTypeValue = typeValue;
        if (customNamePart) {
             const placeholderRegex = /\{(ChartName|TableName|SectionName)\}/i;
             if(placeholderRegex.test(finalTypeValue)){
                finalTypeValue = finalTypeValue.replace(placeholderRegex, customNamePart.replace(/[^a-zA-Z0-9_-]/gi, '').substring(0,30));
             } else {
                finalTypeValue = `${finalTypeValue}_${customNamePart.replace(/[^a-zA-Z0-9_-]/gi, '').substring(0,30)}`;
             }
        } else {
             finalTypeValue = finalTypeValue.replace(/\{(ChartName|TableName|SectionName)\}/i, 'Allgemein');
        }


        return APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE
            .replace('{TYPE}', finalTypeValue)
            .replace('{KOLLEKTIV}', safeKollektiv)
            .replace('{DATE}', dateStr)
            .replace('{EXT}', ext);
    }

    function _triggerDownload(blob, filename) {
        if (!blob || !filename) {
            console.error("Export Service: Blob oder Dateiname fehlt für Download.");
            ui_helpers.showToast("Download konnte nicht gestartet werden (fehlende Daten).", "danger");
            return;
        }
        try {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            ui_helpers.showToast(`Datei '${filename}' erfolgreich heruntergeladen.`, "success");
        } catch (error) {
            console.error("Fehler beim Auslösen des Downloads:", error);
            ui_helpers.showToast(`Fehler beim Download der Datei '${filename}'.`, "danger");
        }
    }

    function _getSVGString(svgNode) {
        if (!svgNode || typeof svgNode.outerHTML !== 'string') return null;
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgNode);
        svgString = svgString.replace(/(\w+)?:?href=/g, 'xlink:href=');
        return svgString;
    }

    async function _convertSVGToDataURL(svgNode) {
        return new Promise((resolve, reject) => {
            const svgString = _getSVGString(svgNode);
            if (!svgString) { reject(new Error("SVG-Serialisierung fehlgeschlagen.")); return; }

            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const rect = svgNode.getBoundingClientRect();
                const scale = APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE || 2;
                canvas.width = (rect.width || parseInt(svgNode.getAttribute('width')) || 300) * scale;
                canvas.height = (rect.height || parseInt(svgNode.getAttribute('height')) || 150) * scale;
                const ctx = canvas.getContext('2d');
                if (!ctx) { reject(new Error("Canvas 2D Kontext nicht verfügbar.")); return; }
                ctx.scale(scale, scale);
                ctx.drawImage(image, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            image.onerror = (e) => reject(new Error(`Fehler beim Laden des SVG-Bildes: ${e.type || 'Unbekannter Fehler'}`));
            image.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        });
    }

    function _exportDataAsCSV(data, filename, delimiter = APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ';') {
        if (!Array.isArray(data) || data.length === 0) { ui_helpers.showToast("Keine Daten für CSV-Export vorhanden.", "warning"); return; }
        try {
            const flattenObject = (obj, prefix = '') => {
                return Object.keys(obj).reduce((acc, k) => {
                    const pre = prefix.length ? prefix + '.' : '';
                    if (obj[k] !== null && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
                        Object.assign(acc, flattenObject(obj[k], pre + k));
                    } else if (Array.isArray(obj[k])) {
                        acc[pre + k] = obj[k].map(item => (typeof item === 'object' ? JSON.stringify(item) : item)).join(', ');
                    } else {
                        acc[pre + k] = obj[k];
                    }
                    return acc;
                }, {});
            };

            const flattenedData = data.map(row => flattenObject(row || {}));
            const headers = [...new Set(flattenedData.flatMap(obj => Object.keys(obj)))];
            let csvContent = headers.join(delimiter) + '\r\n';

            flattenedData.forEach(row => {
                const line = headers.map(header => {
                    let cell = row[header];
                    if (cell === null || cell === undefined) cell = '';
                    else if (typeof cell === 'string') cell = `"${cell.replace(/"/g, '""')}"`;
                    else cell = String(cell);
                    return cell;
                }).join(delimiter);
                csvContent += line + '\r\n';
            });
            const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
            _triggerDownload(blob, filename);
        } catch (error) {
            console.error("Fehler beim Erstellen der CSV-Datei:", error);
            ui_helpers.showToast("Fehler beim Erstellen der CSV-Datei.", "danger");
        }
    }

    async function _exportDataAsXLSX(sheetsData, filename) {
        if (!Array.isArray(sheetsData) || sheetsData.length === 0) { ui_helpers.showToast("Keine Daten für XLSX-Export vorhanden.", "warning"); return; }
        if (typeof XLSX === 'undefined') { ui_helpers.showToast("XLSX Export-Bibliothek nicht geladen.", "danger"); console.error("SheetJS (XLSX) nicht gefunden."); return; }

        try {
            const wb = XLSX.utils.book_new();
            sheetsData.forEach(sheetInfo => {
                if (sheetInfo && sheetInfo.data && Array.isArray(sheetInfo.data) && sheetInfo.data.length > 0 && sheetInfo.sheetName) {
                    const ws = XLSX.utils.json_to_sheet(sheetInfo.data);
                    XLSX.utils.book_append_sheet(wb, ws, String(sheetInfo.sheetName).substring(0,30));
                }
            });
            if (wb.SheetNames.length === 0) { ui_helpers.showToast("Keine validen Datenblätter für XLSX-Export.", "warning"); return; }

            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            _triggerDownload(blob, filename);
        } catch (error) {
            console.error("Fehler beim Erstellen der XLSX-Datei:", error);
            ui_helpers.showToast("Fehler beim Erstellen der XLSX-Datei.", "danger");
        }
    }


    function _exportText(text, filename) {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
        _triggerDownload(blob, filename);
    }

    function _exportHTML(htmlContent, filename) {
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
        _triggerDownload(blob, filename);
    }

    function _exportSVG(svgNode, filename) {
        const svgString = _getSVGString(svgNode);
        if (!svgString) { ui_helpers.showToast("Fehler beim SVG-Export (Serialisierung).", "warning"); return; }
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8;' });
        _triggerDownload(blob, filename);
    }

    async function _exportPNG(svgNodeOrCanvas, filename, scale = APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE || 2) {
        try {
            let dataUrl;
            if (svgNodeOrCanvas.tagName?.toLowerCase() === 'svg') {
                const svgString = _getSVGString(svgNodeOrCanvas);
                if (!svgString) throw new Error("SVG-Serialisierung fehlgeschlagen.");

                const image = new Image();
                const p = new Promise((resolve, reject) => {
                    image.onload = () => {
                        const canvas = document.createElement('canvas');
                        const rect = svgNodeOrCanvas.getBoundingClientRect();
                        const svgWidth = rect.width || parseInt(svgNodeOrCanvas.getAttribute('width')) || 300;
                        const svgHeight = rect.height || parseInt(svgNodeOrCanvas.getAttribute('height')) || 150;

                        canvas.width = svgWidth * scale;
                        canvas.height = svgHeight * scale;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) { reject(new Error("Canvas 2D Kontext nicht verfügbar.")); return; }

                        ctx.clearRect(0,0,canvas.width,canvas.height);
                        if (APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR && APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR !== 'transparent') {
                            ctx.fillStyle = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR;
                            ctx.fillRect(0,0,canvas.width,canvas.height);
                        }

                        ctx.scale(scale, scale);
                        ctx.drawImage(image, 0, 0, svgWidth, svgHeight);
                        resolve(canvas.toDataURL('image/png'));
                    };
                    image.onerror = (e) => reject(new Error(`Fehler beim Laden des SVG-Bildes: ${e.type || 'Unbekannter SVG Ladefehler'}`));
                    image.src = 'data:image/svg+xml;charset=utf-8;base64,' + btoa(unescape(encodeURIComponent(svgString)));
                });
                dataUrl = await p;

            } else if (svgNodeOrCanvas.tagName?.toLowerCase() === 'canvas') {
                dataUrl = svgNodeOrCanvas.toDataURL('image/png');
            } else {
                throw new Error("Ungültiges Element für PNG-Export. SVG oder Canvas erwartet.");
            }

            if (!dataUrl) throw new Error("Konnte keine Data URL für PNG erstellen.");
            const blob = await (await fetch(dataUrl)).blob();
            _triggerDownload(blob, filename);

        } catch (error) {
            console.error("Fehler beim PNG-Export:", error);
            ui_helpers.showToast(`PNG-Export für '${filename}' fehlgeschlagen. ${error.message || ''}`, "danger");
        }
    }

    function _generateMarkdownTable(headers, rows) {
        if (!Array.isArray(headers) || !Array.isArray(rows)) return '';
        let md = '| ' + headers.join(' | ') + ' |\n';
        md += '|' + headers.map(() => '---').join('|') + '|\n';
        rows.forEach(row => {
            md += '| ' + row.map(cell => (cell === null || cell === undefined) ? '' : String(cell).replace(/\|/g, '\\|')).join(' | ') + ' |\n';
        });
        return md;
    }

    function _generateComprehensiveReportHTML(appState, allData, bfDataForReport) {
        const currentKollektiv = appState.currentKollektiv;
        const kollektivDisplayName = getKollektivDisplayName(currentKollektiv);
        const appliedT2 = appState.appliedT2Criteria;
        const appliedLogic = appState.appliedT2Logic;
        const dateGenerated = getCurrentDateString('DD.MM.YYYY HH:mm:ss');

        const stats = statisticsService.calculateAllStatsForPublication(allData, appliedT2, appliedLogic, bfDataForReport);
        const deskriptivStats = stats?.[currentKollektiv]?.deskriptiv;
        const gueteAS = stats?.[currentKollektiv]?.gueteAS;
        const gueteT2 = stats?.[currentKollektiv]?.gueteT2_angewandt;
        const vergleichASvsT2 = stats?.[currentKollektiv]?.vergleichASvsT2_angewandt;
        const assoziationen = stats?.[currentKollektiv]?.assoziation_angewandt;
        const bfResult = bfDataForReport?.[currentKollektiv]?.bestResult;

        let html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>${APP_CONFIG.REPORT_SETTINGS.REPORT_TITLE} (${kollektivDisplayName})</title>`;
        html += `<style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
            h1, h2, h3 { color: #2c3e50; margin-top: 1.5em; margin-bottom: 0.5em; }
            h1 { font-size: 1.8em; border-bottom: 2px solid #3498db; padding-bottom: 0.3em;}
            h2 { font-size: 1.5em; border-bottom: 1px solid #bdc3c7; padding-bottom: 0.2em;}
            h3 { font-size: 1.2em; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 1em; font-size: 0.9em;}
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .chart-container { margin: 20px 0; padding: 10px; border: 1px solid #eee; text-align: center;}
            .small { font-size: 0.85em; } .text-muted { color: #777; }
            .config-section { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom:1em;}
            .metric-value { font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 0.8em; text-align: center; }
        </style></head><body>`;
        html += `<h1>${APP_CONFIG.REPORT_SETTINGS.REPORT_TITLE}</h1>`;
        html += `<p class="small text-muted">Generiert am: ${dateGenerated} | Anwendung: ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION} | ${APP_CONFIG.REPORT_SETTINGS.REPORT_AUTHOR}</p>`;
        html += `<div class="config-section"><h2>Konfiguration der Analyse</h2>`;
        html += `<p><strong>Ausgewähltes Kollektiv:</strong> ${kollektivDisplayName} (N=${allData?.length || 0})</p>`;
        html += `<p><strong>Angewandte T2-Kriterien:</strong> ${studyT2CriteriaManager.formatCriteriaForDisplay(appliedT2, appliedLogic)}</p></div>`;

        if (APP_CONFIG.REPORT_SETTINGS.INCLUDE_DESCRIPTIVES_TABLE && deskriptivStats) {
            html += `<h2>Deskriptive Statistik (${kollektivDisplayName})</h2>`;
            html += tableRenderer.renderDescriptiveStatsTable(deskriptivStats, kollektivDisplayName, 'de');
        }
         if (APP_CONFIG.REPORT_SETTINGS.INCLUDE_AS_PERFORMANCE_TABLE && gueteAS) {
            html += `<h2>Diagnostische Güte: Avocado Sign (${kollektivDisplayName})</h2>`;
            html += tableRenderer.renderDiagnosticPerformanceTable(gueteAS, 'Avocado Sign', kollektivDisplayName, 'de');
        }
        if (APP_CONFIG.REPORT_SETTINGS.INCLUDE_T2_PERFORMANCE_TABLE && gueteT2) {
            html += `<h2>Diagnostische Güte: T2-Kriterien (Angewandt, ${kollektivDisplayName})</h2>`;
            html += tableRenderer.renderDiagnosticPerformanceTable(gueteT2, 'T2 (Angewandt)', kollektivDisplayName, 'de');
        }
        if (APP_CONFIG.REPORT_SETTINGS.INCLUDE_AS_VS_T2_COMPARISON_TABLE && vergleichASvsT2) {
             html += `<h2>Vergleich: AS vs. T2 (Angewandt, ${kollektivDisplayName})</h2>`;
             html += tableRenderer.renderComparisonTable(vergleichASvsT2, 'Avocado Sign', 'T2 (Angewandt)', kollektivDisplayName, 'de');
        }
        if (APP_CONFIG.REPORT_SETTINGS.INCLUDE_ASSOCIATIONS_TABLE && assoziationen) {
             html += `<h2>Assoziationen mit N-Status (${kollektivDisplayName})</h2>`;
             html += tableRenderer.renderAssociationsTable(assoziationen, kollektivDisplayName, 'de');
        }
        if (APP_CONFIG.REPORT_SETTINGS.INCLUDE_BRUTEFORCE_BEST_RESULT && bfResult) {
            html += `<h2>Bestes Brute-Force Ergebnis (${kollektivDisplayName}, Ziel: ${bfDataForReport?.[currentKollektiv]?.metric || 'N/A'})</h2>`;
            html += `<p><strong>Wert:</strong> ${formatNumber(bfResult.metricValue, 4)} | <strong>Logik:</strong> ${bfResult.logic} | <strong>Kriterien:</strong> ${studyT2CriteriaManager.formatCriteriaForDisplay(bfResult.criteria, bfResult.logic)}</p>`;
        }
        html += `<div class="footer"><p>Ende des Berichts.</p></div></body></html>`;
        return html;
    }


    async function _addFileToZip(zip, filename, contentOrBlob) {
        if (contentOrBlob instanceof Blob) {
            zip.file(filename, contentOrBlob);
        } else if (typeof contentOrBlob === 'string') {
            zip.file(filename, contentOrBlob);
        } else {
            console.warn(`_addFileToZip: Ungültiger Inhaltstyp für ${filename}.`);
        }
    }


    function exportStatisticsAsCSV(statsData, kollektiv) {
        if (!statsData || Object.keys(statsData).length === 0) { ui_helpers.showToast("Keine Statistikdaten zum Exportieren.", "warning"); return; }
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.STATS_CSV, kollektiv, 'csv');
        const rows = [];
        Object.keys(statsData).forEach(sectionKey => {
            Object.keys(statsData[sectionKey]).forEach(itemKey => {
                 const item = statsData[sectionKey][itemKey];
                 if(item && typeof item === 'object' && item.value !== undefined) {
                     rows.push({
                         Sektion: sectionKey,
                         Item: itemKey,
                         Wert: item.value,
                         KI_Unter: item.ci?.lower,
                         KI_Ober: item.ci?.upper,
                         Methode_KI: item.method,
                         P_Wert: item.pValue,
                         Teststatistik: item.statistic,
                         Test_Z: item.Z,
                         Testmethode: item.testName || item.methodTest,
                         FeatureName: item.featureName
                     });
                 } else if (item && typeof item === 'object' && item.or?.value !== undefined) {
                      rows.push({
                         Sektion: sectionKey, Item: itemKey + " (OR)", Wert: item.or.value, KI_Unter: item.or.ci?.lower, KI_Ober: item.or.ci?.upper, Methode_KI: item.or.method, P_Wert: item.pValue, Testmethode: item.testName, FeatureName: item.featureName
                      });
                      rows.push({
                         Sektion: sectionKey, Item: itemKey + " (RD)", Wert: item.rd.value, KI_Unter: item.rd.ci?.lower, KI_Ober: item.rd.ci?.upper, Methode_KI: item.rd.method, P_Wert: item.pValue, Testmethode: item.testName, FeatureName: item.featureName
                      });
                       rows.push({
                         Sektion: sectionKey, Item: itemKey + " (Phi)", Wert: item.phi.value, P_Wert: item.pValue, Testmethode: item.testName, FeatureName: item.featureName
                      });
                 }
            });
        });
        _exportDataAsCSV(rows, filename);
    }

     function exportStatisticsAsXLSX(statsData, kollektiv) {
        if (!statsData || Object.keys(statsData).length === 0) { ui_helpers.showToast("Keine Statistikdaten für XLSX-Export.", "warning"); return; }
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.STATISTIK_XLSX, kollektiv, 'xlsx');
        const rows = [];
        const sheetName = APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAMES.STATISTIK || 'Statistik';
        Object.keys(statsData).forEach(sectionKey => {
            Object.keys(statsData[sectionKey]).forEach(itemKey => {
                 const item = statsData[sectionKey][itemKey];
                 if(item && typeof item === 'object' && item.value !== undefined) {
                     rows.push({
                         Sektion: sectionKey, Item: itemKey, Wert: item.value, '95% KI Unter': item.ci?.lower, '95% KI Ober': item.ci?.upper, 'Methode KI': item.method, 'p-Wert': item.pValue, 'Teststatistik': item.statistic, 'Z-Wert': item.Z, 'Testmethode': item.testName || item.methodTest, 'Merkmal': item.featureName
                     });
                 } else if (item && typeof item === 'object' && item.or?.value !== undefined) {
                      rows.push({ Sektion: sectionKey, Item: itemKey + " (OR)", Wert: item.or.value, '95% KI Unter': item.or.ci?.lower, '95% KI Ober': item.or.ci?.upper, 'Methode KI': item.or.method, 'p-Wert': item.pValue, 'Testmethode': item.testName, 'Merkmal': item.featureName });
                      rows.push({ Sektion: sectionKey, Item: itemKey + " (RD)", Wert: item.rd.value, '95% KI Unter': item.rd.ci?.lower, '95% KI Ober': item.rd.ci?.upper, 'Methode KI': item.rd.method, 'p-Wert': item.pValue, 'Testmethode': item.testName, 'Merkmal': item.featureName });
                      rows.push({ Sektion: sectionKey, Item: itemKey + " (Phi)", Wert: item.phi.value, 'p-Wert': item.pValue, 'Testmethode': item.testName, 'Merkmal': item.featureName });
                 }
            });
        });
        _exportDataAsXLSX([{ sheetName: sheetName, data: rows }], filename);
    }

    function exportBruteForceReport(bfData, kollektiv) {
        if (!bfData || !bfData.bestResult) { ui_helpers.showToast("Keine Brute-Force-Ergebnisse zum Exportieren.", "warning"); return; }
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.BRUTEFORCE_TXT, kollektiv, 'txt');
        let report = `Brute-Force Optimierungsbericht\n`;
        report += `Kollektiv: ${getKollektivDisplayName(kollektiv)} (N=${bfData.nGesamt}, N+=${bfData.nPlus}, N-=${bfData.nMinus})\n`;
        report += `Zielmetrik: ${bfData.metric}\n`;
        report += `Dauer: ${formatNumber(bfData.duration / 1000, 2)} Sekunden\n`;
        report += `Getestete Kombinationen: ${formatNumber(bfData.totalTested, 0)}\n\n`;
        report += `Bestes Ergebnis:\n`;
        report += `  Wert (${bfData.metric}): ${formatNumber(bfData.bestResult.metricValue, 5)}\n`;
        report += `  Logik: ${bfData.bestResult.logic}\n`;
        report += `  Kriterien: ${studyT2CriteriaManager.formatCriteriaForDisplay(bfData.bestResult.criteria, bfData.bestResult.logic, false)}\n`;
        report += `  Sens: ${formatPercent(bfData.bestResult.sens, 1)}, Spez: ${formatPercent(bfData.bestResult.spez, 1)}, PPV: ${formatPercent(bfData.bestResult.ppv, 1)}, NPV: ${formatPercent(bfData.bestResult.npv, 1)}, Acc: ${formatPercent(bfData.bestResult.acc, 1)}, BalAcc: ${formatNumber(bfData.bestResult.balAcc, 3)}, F1: ${formatNumber(bfData.bestResult.f1, 3)}\n\n`;
        report += `Top Ergebnisse:\n`;
        report += `Rang | ${bfData.metric} | Sens. | Spez. | PPV | NPV | Logik | Kriterien\n`;
        let rank = 1, lastVal = -Infinity;
        bfData.results.slice(0,100).forEach((res, idx) => {
            if(idx > 0 && Math.abs(res.metricValue - lastVal) > 1e-8) rank = idx + 1;
            if(rank > 10 && idx >= 10 && Math.abs(res.metricValue - lastVal) > 1e-8) return;
            report += `${rank}. | ${formatNumber(res.metricValue, 4)} | ${formatPercent(res.sens,1)} | ${formatPercent(res.spez,1)} | ${formatPercent(res.ppv,1)} | ${formatPercent(res.npv,1)} | ${res.logic} | ${studyT2CriteriaManager.formatCriteriaForDisplay(res.criteria, res.logic, true)}\n`;
            lastVal = res.metricValue;
        });
        _exportText(report, filename);
    }

     function exportBruteForceResultsXLSX(bfData, kollektiv) {
        if (!bfData || !Array.isArray(bfData.results) || bfData.results.length === 0) { ui_helpers.showToast("Keine Brute-Force-Ergebnisse für XLSX-Export.", "warning"); return; }
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.BRUTEFORCE_XLSX || 'BRUTEFORCE_XLSX_Fallback', kollektiv, 'xlsx');
        const sheetName = APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAMES.BRUTE_FORCE_RESULTS || 'BruteForce';

        let rank = 1, lastVal = -Infinity;
        const xlsxData = bfData.results.map((res, idx) => {
            if(idx > 0 && Math.abs(res.metricValue - lastVal) > 1e-8) rank = idx + 1;
            lastVal = res.metricValue;
            return {
                Rang: rank,
                [bfData.metric]: res.metricValue,
                Sensitivitaet: res.sens,
                Spezifitaet: res.spez,
                PPV: res.ppv,
                NPV: res.npv,
                Accuracy: res.acc,
                BalancedAccuracy: res.balAcc,
                F1_Score: res.f1,
                Logik: res.logic,
                Kriterien: studyT2CriteriaManager.formatCriteriaForDisplay(res.criteria, res.logic, false)
            };
        });
        _exportDataAsXLSX([{sheetName: sheetName, data: xlsxData}], filename);
    }


    function exportDescriptiveStatsMD(deskriptivStats, kollektiv) {
        if (!deskriptivStats) { ui_helpers.showToast("Keine deskriptiven Daten zum Exportieren.", "warning"); return; }
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.DESKRIPTIV_MD, kollektiv, 'md');
        const md = tableRenderer.renderDescriptiveStatsTable(deskriptivStats, getKollektivDisplayName(kollektiv), 'md');
        _exportText(md, filename);
    }

    function exportDatenlisteMD(data, kollektiv) {
        if (!data || data.length === 0) { ui_helpers.showToast("Keine Daten für Datenlisten-Export.", "warning"); return; }
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.DATEN_MD, kollektiv, 'md');
        const headers = Object.keys(data[0] || {}).filter(k => k !== 'lymphknoten_t2' && k !== 'lymphknoten_t2_bewertet');
        const rows = data.map(row => headers.map(h => (row[h] === null || row[h] === undefined) ? '' : String(row[h])));
        const md = `# Datenliste: ${getKollektivDisplayName(kollektiv)}\n\n` + _generateMarkdownTable(headers, rows);
        _exportText(md, filename);
    }

    function exportAuswertungMD(data, kollektiv) {
        if (!data || data.length === 0) { ui_helpers.showToast("Keine Daten für Auswertungs-Export.", "warning"); return; }
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.AUSWERTUNG_MD, kollektiv, 'md');
        const headers = ['Nr', 'Name', 'Therapie', 'N', 'AS', 'T2', 'N+ LK/Ges.', 'AS+ LK/Ges.', 'T2+ LK/Ges.'];
        const rows = data.map(p => [p.nr, p.name, p.therapie, p.n, p.as, p.t2, `${p.anzahl_patho_n_plus_lk}/${p.anzahl_patho_lk}`, `${p.anzahl_as_plus_lk}/${p.anzahl_as_lk}`, `${p.anzahl_t2_plus_lk}/${p.anzahl_t2_lk}`]);
        const md = `# Auswertungstabelle: ${getKollektivDisplayName(kollektiv)}\n\n` + _generateMarkdownTable(headers, rows);
        _exportText(md, filename);
    }

    function exportFilteredDataCSV(data, kollektiv) {
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.FILTERED_DATA_CSV, kollektiv, 'csv');
        _exportDataAsCSV(data, filename);
    }
    function exportFilteredDataXLSX(data, kollektiv) {
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.FILTERED_DATA_XLSX, kollektiv, 'xlsx');
        const sheetName = APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAMES.FILTERED_DATA || 'Gefilterte_Daten';
        _exportDataAsXLSX([{sheetName: sheetName, data: data}], filename);
    }
     function exportDatenlisteXLSX(data, kollektiv) {
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.DATEN_XLSX, kollektiv, 'xlsx');
        const sheetName = APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAMES.DATEN || 'Datenliste';
        const processedData = data.map(p => ({...p, lymphknoten_t2: JSON.stringify(p.lymphknoten_t2), lymphknoten_t2_bewertet: JSON.stringify(p.lymphknoten_t2_bewertet)}));
        _exportDataAsXLSX([{sheetName: sheetName, data: processedData}], filename);
    }
     function exportAuswertungXLSX(data, kollektiv) {
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.AUSWERTUNG_XLSX, kollektiv, 'xlsx');
        const sheetName = APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAMES.AUSWERTUNG || 'Auswertung';
        const processedData = data.map(p => ({Nr:p.nr, Name:p.name, Therapie:p.therapie, N_Status:p.n, AS_Status:p.as, T2_Status:p.t2, N_LK_Counts:`${p.anzahl_patho_n_plus_lk}/${p.anzahl_patho_lk}`, AS_LK_Counts:`${p.anzahl_as_plus_lk}/${p.anzahl_as_lk}`, T2_LK_Counts:`${p.anzahl_t2_plus_lk}/${p.anzahl_t2_lk}`}));
        _exportDataAsXLSX([{sheetName: sheetName, data: processedData}], filename);
    }

    function exportComprehensiveReport(appState, allData, bfDataForReport) {
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.COMPREHENSIVE_REPORT_HTML, appState.currentKollektiv, 'html');
        const htmlContent = _generateComprehensiveReportHTML(appState, allData, bfDataForReport);
        _exportHTML(htmlContent, filename);
    }

    async function exportChartAsPNG(chartId, chartName, kollektiv) {
        const chartNode = document.getElementById(chartId)?.querySelector('svg');
        if (!chartNode) { ui_helpers.showToast(`Diagramm '${chartName}' (ID: ${chartId}) für PNG-Export nicht gefunden.`, "warning"); return;}
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG, kollektiv, 'png', chartName);
        await _exportPNG(chartNode, filename);
    }

    function exportChartAsSVG(chartId, chartName, kollektiv) {
        const chartNode = document.getElementById(chartId)?.querySelector('svg');
        if (!chartNode) { ui_helpers.showToast(`Diagramm '${chartName}' (ID: ${chartId}) für SVG-Export nicht gefunden.`, "warning"); return;}
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG, kollektiv, 'svg', chartName);
        _exportSVG(chartNode, filename);
    }

    async function exportTableAsPNG(tableId, tableName, kollektiv) {
         const tableNode = document.getElementById(tableId);
         if (!tableNode || typeof html2canvas === 'undefined') {
             ui_helpers.showToast(`Tabelle '${tableName}' (ID: ${tableId}) für PNG-Export nicht gefunden oder html2canvas nicht geladen.`, "warning"); return;
         }
         const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.TABLE_PNG_EXPORT, kollektiv, 'png', tableName);
         try {
             ui_helpers.showToast("PNG-Export für Tabelle wird vorbereitet...", "info", 2000);
             const canvas = await html2canvas(tableNode, {
                 scale: APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE || 2,
                 logging: false,
                 useCORS: true,
                 backgroundColor: window.getComputedStyle(document.body).getPropertyValue('background-color') || '#ffffff'
             });
             await _exportPNG(canvas, filename);
         } catch(error) {
             console.error(`Fehler beim PNG-Export der Tabelle ${tableId}:`, error);
             ui_helpers.showToast(`PNG-Export für Tabelle '${tableName}' fehlgeschlagen.`, "danger");
         }
    }

    async function exportPublicationToDocx(markdownContent, title, lang, kollektiv) {
        if (typeof htmlDocx === 'undefined' || typeof marked === 'undefined') {
            console.error("html-to-docx oder marked Bibliothek nicht geladen.");
            ui_helpers.showToast("DOCX Export-Funktion ist nicht verfügbar.", "danger");
            return;
        }
        if (!markdownContent || markdownContent.trim() === "") {
            ui_helpers.showToast("Kein Inhalt für DOCX-Export.", "warning");
            return;
        }
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PUBLIKATION_DOCX || 'PUBLIKATION_DOCX', kollektiv, 'docx', title);
        try {
            const htmlContentFromMarkdown = marked.parse(markdownContent);
            const fullHtml = `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><title>${title}</title><style>body{font-family:Calibri,sans-serif;font-size:11pt;} h1{font-size:16pt;font-weight:bold;} h2{font-size:14pt;font-weight:bold;} h3{font-size:12pt;font-weight:bold;} p{margin-bottom:6pt;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid black;padding:4px;} th{background-color:#f2f2f2;font-weight:bold;} ol,ul{margin-bottom:6pt;} li{margin-bottom:3pt;}</style></head><body><h1>${title}</h1>${htmlContentFromMarkdown}</body></html>`;
            const fileBuffer = await htmlDocx.asBlob(fullHtml, { orientation: 'portrait', margins: { top: 720, right: 720, bottom: 720, left: 720 } });
            _triggerDownload(fileBuffer, filename);
        } catch (error) {
            console.error("Fehler beim Erstellen der DOCX-Datei:", error);
            ui_helpers.showToast("Fehler beim Erstellen der DOCX-Datei.", "danger");
        }
    }


    async function exportAllDataAsZip(appState, allData, bfData) {
        if (typeof JSZip === 'undefined') { ui_helpers.showToast("ZIP-Funktion nicht verfügbar.", "danger"); console.error("JSZip nicht gefunden."); return; }
        const zip = new JSZip();
        const kollektiv = appState.currentKollektiv;
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.ALL_ZIP, kollektiv, 'zip');

        ui_helpers.showToast("ZIP-Export wird vorbereitet...", "info", 3000);

        const stats = statisticsService.calculateAllStatsForPublication(allData, appState.appliedT2Criteria, appState.appliedT2Logic, bfData);
        const csvStats = [];
        Object.keys(stats[kollektiv] || {}).forEach(sectionKey => { Object.keys(stats[kollektiv][sectionKey] || {}).forEach(itemKey => { const item = stats[kollektiv][sectionKey][itemKey]; if(item && typeof item === 'object' && item.value !== undefined) { csvStats.push({ Sektion: sectionKey, Item: itemKey, Wert: item.value, KI_Unter: item.ci?.lower, KI_Ober: item.ci?.upper, Methode_KI: item.method, P_Wert: item.pValue, Teststatistik: item.statistic, Test_Z: item.Z, Testmethode: item.testName || item.methodTest, FeatureName: item.featureName });} else if (item && typeof item === 'object' && item.or?.value !== undefined) { csvStats.push({ Sektion: sectionKey, Item: itemKey + " (OR)", Wert: item.or.value, KI_Unter: item.or.ci?.lower, KI_Ober: item.or.ci?.upper, Methode_KI: item.or.method, P_Wert: item.pValue, Testmethode: item.testName, FeatureName: item.featureName }); csvStats.push({ Sektion: sectionKey, Item: itemKey + " (RD)", Wert: item.rd.value, KI_Unter: item.rd.ci?.lower, KI_Ober: item.rd.ci?.upper, Methode_KI: item.rd.method, P_Wert: item.pValue, Testmethode: item.testName, FeatureName: item.featureName }); csvStats.push({ Sektion: sectionKey, Item: itemKey + " (Phi)", Wert: item.phi.value, P_Wert: item.pValue, Testmethode: item.testName, FeatureName: item.featureName });}});});
        await _addFileToZip(zip, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.STATS_CSV, kollektiv, 'csv'), new Blob([`\uFEFF${ Papa.unparse(csvStats, {delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ';'})}`], {type:'text/csv;charset=utf-8;'}));
        if (typeof XLSX !== 'undefined') {
            const xlsxStatsRows = [];
            Object.keys(stats[kollektiv] || {}).forEach(sectionKey => { Object.keys(stats[kollektiv][sectionKey] || {}).forEach(itemKey => { const item = stats[kollektiv][sectionKey][itemKey]; if(item && typeof item === 'object' && item.value !== undefined) { xlsxStatsRows.push({ Sektion: sectionKey, Item: itemKey, Wert: item.value, '95% KI Unter': item.ci?.lower, '95% KI Ober': item.ci?.upper, 'Methode KI': item.method, 'p-Wert': item.pValue, 'Teststatistik': item.statistic, 'Z-Wert': item.Z, 'Testmethode': item.testName || item.methodTest, 'Merkmal': item.featureName });} else if (item && typeof item === 'object' && item.or?.value !== undefined) { xlsxStatsRows.push({ Sektion: sectionKey, Item: itemKey + " (OR)", Wert: item.or.value, '95% KI Unter': item.or.ci?.lower, '95% KI Ober': item.or.ci?.upper, 'Methode KI': item.or.method, 'p-Wert': item.pValue, 'Testmethode': item.testName, 'Merkmal': item.featureName }); xlsxStatsRows.push({ Sektion: sectionKey, Item: itemKey + " (RD)", Wert: item.rd.value, '95% KI Unter': item.rd.ci?.lower, '95% KI Ober': item.rd.ci?.upper, 'Methode KI': item.rd.method, 'p-Wert': item.pValue, 'Testmethode': item.testName, 'Merkmal': item.featureName }); xlsxStatsRows.push({ Sektion: sectionKey, Item: itemKey + " (Phi)", Wert: item.phi.value, 'p-Wert': item.pValue, 'Testmethode': item.testName, 'Merkmal': item.featureName });}});});
            const wbStats = XLSX.utils.book_new(); const wsStats = XLSX.utils.json_to_sheet(xlsxStatsRows); XLSX.utils.book_append_sheet(wbStats, wsStats, APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAMES.STATISTIK || 'Statistik');
            await _addFileToZip(zip, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.STATISTIK_XLSX, kollektiv, 'xlsx'), XLSX.write(wbStats, {bookType:'xlsx', type: 'array'}));
        }

        if (bfData && bfData[kollektiv]?.bestResult) {
             let report = `Brute-Force Optimierungsbericht...\nKollektiv: ${getKollektivDisplayName(kollektiv)}...\n`; // Simplified
             await _addFileToZip(zip, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.BRUTEFORCE_TXT, kollektiv, 'txt'), report);
             if (typeof XLSX !== 'undefined' && bfData[kollektiv].results) {
                const xlsxBfData = bfData[kollektiv].results.map(r => ({[bfData[kollektiv].metric]:r.metricValue, Sens:r.sens, Spez:r.spez, Logik:r.logic, Kriterien:studyT2CriteriaManager.formatCriteriaForDisplay(r.criteria,r.logic,false)}));
                const wbBf = XLSX.utils.book_new(); const wsBf = XLSX.utils.json_to_sheet(xlsxBfData); XLSX.utils.book_append_sheet(wbBf, wsBf, APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAMES.BRUTE_FORCE_RESULTS || 'BruteForce');
                await _addFileToZip(zip, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.BRUTEFORCE_XLSX || 'BRUTEFORCE_XLSX_Fallback', kollektiv, 'xlsx'), XLSX.write(wbBf, {bookType:'xlsx', type: 'array'}));
             }
        }
        const filteredData = dataProcessor.filterDataByKollektiv(allData, kollektiv);
        await _addFileToZip(zip, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.FILTERED_DATA_CSV, kollektiv, 'csv'), new Blob([`\uFEFF${ Papa.unparse(filteredData, {delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ';'})}`], {type:'text/csv;charset=utf-8;'}));
         if (typeof XLSX !== 'undefined') {
            const wbData = XLSX.utils.book_new(); const wsData = XLSX.utils.json_to_sheet(filteredData.map(p => ({...p, lymphknoten_t2: JSON.stringify(p.lymphknoten_t2), lymphknoten_t2_bewertet: JSON.stringify(p.lymphknoten_t2_bewertet)}))); XLSX.utils.book_append_sheet(wbData, wsData, APP_CONFIG.EXPORT_SETTINGS.EXCEL_SHEET_NAMES.FILTERED_DATA || 'Gefilterte_Daten');
            await _addFileToZip(zip, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.FILTERED_DATA_XLSX, kollektiv, 'xlsx'), XLSX.write(wbData, {bookType:'xlsx', type: 'array'}));
        }

        await _addFileToZip(zip, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.COMPREHENSIVE_REPORT_HTML, kollektiv, 'html'), _generateComprehensiveReportHTML(appState, allData, bfData));

        const zipContent = await zip.generateAsync({ type: "blob" });
        _triggerDownload(zipContent, filename);
    }

     async function exportSpecificFilesAsZip(type, appState, allData, bfData, filenameKey, includeStats, includeBF, includeData, includeAuswertung, includeReport) {
        if (typeof JSZip === 'undefined') { ui_helpers.showToast("ZIP-Funktion nicht verfügbar.", "danger"); return; }
        const zip = new JSZip();
        const kollektiv = appState.currentKollektiv;
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[filenameKey], kollektiv, 'zip');
        ui_helpers.showToast(`ZIP-Paket '${type}' wird vorbereitet...`, "info", 3000);
        const filteredData = dataProcessor.filterDataByKollektiv(allData, kollektiv);
        const evaluatedData = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), appState.appliedT2Criteria, appState.appliedT2Logic);

        if (includeStats) {
            const stats = statisticsService.calculateAllStatsForPublication(allData, appState.appliedT2Criteria, appState.appliedT2Logic, bfData);
            if (type === 'CSV' || type === 'ALL') { /* CSV anpassen*/}
            if (type === 'XLSX' || type === 'ALL') { /* XLSX anpassen*/}
            if (type === 'MD' || type === 'ALL') { /* MD anpassen*/}
        }
        if (includeBF && bfData && bfData[kollektiv]?.bestResult) { /* ... */ }
        if (includeData) { /* ... */}
        if (includeAuswertung) { /* ... */}
        if (includeReport && (type === 'ALL')) { await _addFileToZip(zip, _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.COMPREHENSIVE_REPORT_HTML, kollektiv, 'html'), _generateComprehensiveReportHTML(appState, allData, bfData)); }


        const zipContent = await zip.generateAsync({ type: "blob" });
        if (Object.keys(zip.files).length === 0) { ui_helpers.showToast("Keine Dateien für dieses ZIP-Paket gefunden.", "warning"); return; }
        _triggerDownload(zipContent, filename);
    }


    async function exportCSVFilesAsZip(appState, allData) { await exportSpecificFilesAsZip('CSV', appState, allData, null, 'CSV_ZIP', true, false, true, false, false); }
    async function exportXLSXFilesAsZip(appState, allData, bfData) { await exportSpecificFilesAsZip('XLSX', appState, allData, bfData, 'XLSX_ZIP', true, true, true, true, false); }
    async function exportMDFilesAsZip(appState, allData, bfData) { await exportSpecificFilesAsZip('MD', appState, allData, bfData, 'MD_ZIP', true, false, true, true, false); }

    async function exportImagesAsZip(format, appState, filenameKey) {
        if (typeof JSZip === 'undefined') { ui_helpers.showToast("ZIP-Funktion nicht verfügbar.", "danger"); return; }
        const zip = new JSZip();
        const kollektiv = appState.currentKollektiv;
        const filename = _generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[filenameKey], kollektiv, 'zip');
        ui_helpers.showToast(`${format.toUpperCase()}-ZIP Export wird vorbereitet...`, "info", 3000);

        const chartContainers = document.querySelectorAll('.dashboard-chart-container, .stat-card .chart-container, #praesentation-charts .chart-container-praes, #publikation-content-area .chart-container');
        for (const container of chartContainers) {
            const svgNode = container.querySelector('svg');
            const chartId = container.id;
            let chartName = container.closest('.card')?.querySelector('.card-header span:not(.card-header-buttons)')?.textContent.trim() || container.closest('.chart-container-praes')?.previousElementSibling?.textContent.trim() || chartId || 'Diagramm';
            chartName = chartName.replace(/[^a-zA-Z0-9_-]/gi, '_').substring(0,50);

            if (svgNode && chartId) {
                try {
                    if (format === 'svg') {
                        const svgString = _getSVGString(svgNode);
                        if (svgString) await _addFileToZip(zip, `${chartName}.svg`, svgString);
                    } else if (format === 'png') {
                        const dataUrl = await _convertSVGToDataURL(svgNode);
                        const blob = await (await fetch(dataUrl)).blob();
                        await _addFileToZip(zip, `${chartName}.png`, blob);
                    }
                } catch (e) { console.warn(`Fehler beim Hinzufügen von ${chartName} zum ${format.toUpperCase()}-ZIP: `, e); }
            }
        }
        if (format === 'png' && APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT && typeof html2canvas !== 'undefined') {
            const tableContainers = document.querySelectorAll('table.table:not(.bruteforce-modal-table)');
            for (const tableNode of tableContainers) {
                const tableId = tableNode.id || `table_${generateUUID().substring(0,8)}`;
                let tableName = tableNode.closest('.card')?.querySelector('.card-header span:not(.card-header-buttons)')?.textContent.trim() || tableNode.closest('.table-responsive')?.previousElementSibling?.textContent.trim() || tableId;
                tableName = tableName.replace(/[^a-zA-Z0-9_-]/gi, '_').substring(0,50);
                try {
                    const canvas = await html2canvas(tableNode, {scale: APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE, logging:false, useCORS: true, backgroundColor: window.getComputedStyle(document.body).getPropertyValue('background-color') || '#ffffff'});
                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                    if (blob) await _addFileToZip(zip, `Tabelle_${tableName}.png`, blob);
                } catch(e){ console.warn(`Fehler beim Hinzufügen von Tabelle ${tableName} zum PNG-ZIP:`, e);}
            }
        }

        if (Object.keys(zip.files).length === 0) { ui_helpers.showToast(`Keine ${format.toUpperCase()}-Dateien zum Zippen gefunden.`, "warning"); return; }
        const zipContent = await zip.generateAsync({ type: "blob" });
        _triggerDownload(zipContent, filename);
    }
    async function exportPNGImagesAsZip(appState) { await exportImagesAsZip('png', appState, 'PNG_ZIP'); }
    async function exportSVGImagesAsZip(appState) { await exportImagesAsZip('svg', appState, 'SVG_ZIP'); }


    return Object.freeze({
        exportStatisticsAsCSV,
        exportStatisticsAsXLSX,
        exportBruteForceReport,
        exportBruteForceResultsXLSX,
        exportDescriptiveStatsMD,
        exportDatenlisteMD,
        exportDatenlisteXLSX,
        exportAuswertungMD,
        exportAuswertungXLSX,
        exportFilteredDataCSV,
        exportFilteredDataXLSX,
        exportComprehensiveReport,
        exportChartAsPNG,
        exportChartAsSVG,
        exportTableAsPNG,
        exportPublicationToDocx,
        exportAllDataAsZip,
        exportCSVFilesAsZip,
        exportXLSXFilesAsZip,
        exportMDFilesAsZip,
        exportPNGImagesAsZip,
        exportSVGImagesAsZip,
        _generateFilename
    });

})();
