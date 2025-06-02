const exportService = (() => {
    let _mainAppInterface = null;
    let _initialized = false;

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
        _initialized = true;
    }

    function _getFormattedTimestamp(format = "YYYYMMDD_HHmm") {
        const now = new Date();
        const parts = {
            YYYY: now.getFullYear(),
            MM: String(now.getMonth() + 1).padStart(2, '0'),
            DD: String(now.getDate()).padStart(2, '0'),
            HH: String(now.getHours()).padStart(2, '0'),
            mm: String(now.getMinutes()).padStart(2, '0'),
            ss: String(now.getSeconds()).padStart(2, '0')
        };
        let timestamp = format;
        for (const key in parts) {
            timestamp = timestamp.replace(key, parts[key]);
        }
        return timestamp;
    }

    function _getFilename(typeKey, kollektivId = null, overrideExtension = null) {
        const stateSnapshot = _mainAppInterface?.getStateSnapshot ? _mainAppInterface.getStateSnapshot() : {};
        const appConfig = stateSnapshot.appConfig || APP_CONFIG; 
        const exportSettings = appConfig.EXPORT_SETTINGS;
        
        const type = exportSettings.FILENAME_TYPES[typeKey] || typeKey.replace(/[^a-zA-Z0-9]/g, '_');
        const dateStr = _getFormattedTimestamp(exportSettings.DATE_FORMAT);
        const currentKollektiv = kollektivId || stateSnapshot.currentKollektiv || 'Unbekannt';
        const safeKollektiv = getKollektivDisplayName(currentKollektiv).replace(/[^a-z0-9_ .()-]/gi, '_').replace(/[\s.]+/g, '_');
        
        let extension = 'txt';
        if (overrideExtension) {
            extension = overrideExtension;
        } else {
            const typeKeyLower = String(typeKey).toLowerCase();
            if (typeKeyLower.includes('csv')) extension = 'csv';
            else if (typeKeyLower.includes('md')) extension = 'md';
            else if (typeKeyLower.includes('html')) extension = 'html';
            else if (typeKeyLower.includes('png')) extension = 'png';
            else if (typeKeyLower.includes('svg')) extension = 'svg';
            else if (typeKeyLower.includes('zip')) extension = 'zip';
        }
        
        return exportSettings.FILENAME_TEMPLATE
            .replace('{TYPE}', type)
            .replace('{KOLLEKTIV}', safeKollektiv)
            .replace('{DATE}', dateStr)
            .replace('{EXT}', extension)
            .replace(/__+/g, '_').replace(/_$/,'').replace(/^_/, '');
    }

    function _triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (_mainAppInterface?.getUiHelpers()) {
            _mainAppInterface.getUiHelpers().showToast(`Datei '${filename}' erfolgreich heruntergeladen.`, 'success');
        }
    }

    function _convertToCSV(dataArray, delimiter = ';') {
        if (!Array.isArray(dataArray) || dataArray.length === 0) return "";
        try {
            return Papa.unparse(dataArray, { delimiter });
        } catch (e) {
            console.error("Fehler beim Konvertieren zu CSV mit PapaParse:", e);
            const header = Object.keys(dataArray[0]).join(delimiter);
            const rows = dataArray.map(row =>
                Object.values(row).map(value => {
                    const strValue = String(value === null || value === undefined ? '' : value);
                    return strValue.includes(delimiter) || strValue.includes('\n') || strValue.includes('"') ? `"${strValue.replace(/"/g, '""')}"` : strValue;
                }).join(delimiter)
            );
            return `${header}\n${rows.join('\n')}`;
        }
    }
    
    function _convertToMarkdownTable(dataArray, headersMap = null) {
        if (!Array.isArray(dataArray) || dataArray.length === 0) return "| Keine Daten verfügbar |\n|---|";
        
        const keys = Object.keys(dataArray[0]);
        const displayHeaders = keys.map(key => (headersMap && headersMap[key]) ? headersMap[key] : key.charAt(0).toUpperCase() + key.slice(1));

        let table = `| ${displayHeaders.join(' | ')} |\n`;
        table += `| ${displayHeaders.map(() => '---').join(' | ')} |\n`;

        dataArray.forEach(row => {
            const rowValues = keys.map(key => {
                let value = row[key];
                if (value === null || value === undefined) value = '';
                else if (typeof value === 'number' && !Number.isInteger(value)) value = formatNumber(value, 3, '', false);
                else if (typeof value === 'boolean') value = value ? 'Ja' : 'Nein';
                return String(value).replace(/\|/g, '\\|');
            });
            table += `| ${rowValues.join(' | ')} |\n`;
        });
        return table;
    }

    function exportStatisticsToCSV(allStats, currentKollektiv) {
        if (!allStats || typeof statisticsService === 'undefined' || typeof studyT2CriteriaManager === 'undefined' || typeof t2CriteriaManager === 'undefined') {
             _mainAppInterface.getUiHelpers().showToast("Statistikdaten oder benötigte Module für CSV-Export nicht verfügbar.", "warning");
            return;
        }
        const rows = [];
        const stateSnapshot = _mainAppInterface.getStateSnapshot();
        const bruteForceMetric = stateSnapshot.currentBruteForceMetric;

        rows.push(["Kategorie", "Subkategorie", "Kollektiv", "Metrik", "Wert", "KI Untere Grenze", "KI Obere Grenze", "Methode/Details"]);

        for (const kollektivId in allStats) {
            if (allStats.hasOwnProperty(kollektivId)) {
                const kollStats = allStats[kollektivId];
                const kollName = getKollektivDisplayName(kollektivId);

                if (kollStats.deskriptiv) {
                    rows.push(["Deskriptiv", "Anzahl Patienten", kollName, "N", kollStats.deskriptiv.anzahlPatienten]);
                    if(kollStats.deskriptiv.alter) {
                        rows.push(["Deskriptiv", "Alter", kollName, "Mean", formatNumber(kollStats.deskriptiv.alter.mean,2, '', false)]);
                        rows.push(["Deskriptiv", "Alter", kollName, "SD", formatNumber(kollStats.deskriptiv.alter.sd,2, '', false)]);
                        rows.push(["Deskriptiv", "Alter", kollName, "Median", formatNumber(kollStats.deskriptiv.alter.median,2, '', false)]);
                    }
                }

                const processGuete = (gueteData, methodenName, subKatPrefix = "Diagnostische Güte") => {
                    if (!gueteData) return;
                    for(const metricKey in gueteData) {
                        if (metricKey !== 'matrix' && gueteData[metricKey] && typeof gueteData[metricKey].value === 'number') {
                            rows.push([
                                subKatPrefix, methodenName, kollName, metricKey.toUpperCase(), 
                                formatNumber(gueteData[metricKey].value, 4, '', false), 
                                gueteData[metricKey].ci ? formatNumber(gueteData[metricKey].ci.lower, 4, '', false) : '',
                                gueteData[metricKey].ci ? formatNumber(gueteData[metricKey].ci.upper, 4, '', false) : '',
                                gueteData[metricKey].method || ''
                            ]);
                        }
                    }
                };
                
                processGuete(kollStats.gueteAS, "Avocado Sign");
                processGuete(kollStats.gueteT2_angewandt, "T2 Angewandt");

                if (kollStats.gueteT2_literatur) {
                    for (const studyId in kollStats.gueteT2_literatur) {
                        const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId);
                        processGuete(kollStats.gueteT2_literatur[studyId], `T2 Literatur (${studySet?.shortName || studyId})`);
                    }
                }
                const bfGueteKey = `gueteT2_bruteforce_metric_${bruteForceMetric.replace(/\s+/g, '_')}`;
                if (kollStats[bfGueteKey]) {
                     processGuete(kollStats[bfGueteKey], `T2 Optimiert (${bruteForceMetric})`);
                }

                const processVergleich = (vergleichData, methode1, methode2, subKatPrefix = "Vergleich") => {
                    if (!vergleichData) return;
                    if(vergleichData.mcnemar) {
                        rows.push([subKatPrefix, `${methode1} vs ${methode2}`, kollName, "McNemar Chi2", formatNumber(vergleichData.mcnemar.chi2,4,'',false)]);
                        rows.push([subKatPrefix, `${methode1} vs ${methode2}`, kollName, "McNemar p-Wert", formatPValue(vergleichData.mcnemar.pValue, stateSnapshot.appConfig.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, 'de', true)]);
                    }
                     if(vergleichData.delong) {
                        rows.push([subKatPrefix, `${methode1} vs ${methode2}`, kollName, "DeLong Z", formatNumber(vergleichData.delong.Z,4,'',false)]);
                        rows.push([subKatPrefix, `${methode1} vs ${methode2}`, kollName, "DeLong p-Wert", formatPValue(vergleichData.delong.pValue, stateSnapshot.appConfig.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, 'de', true)]);
                    }
                };
                
                const t2StdStudyId = APP_CONFIG.LITERATURE_T2_CRITERIA_SETS.find(s => s.isDefaultComparison)?.id || 'beets_tan_2018_esgar';
                const t2StdName = studyT2CriteriaManager.getStudyCriteriaSetById(t2StdStudyId)?.shortName || t2StdStudyId;

                if(kollStats.vergleich_AS_vs_T2Std && kollStats.vergleich_AS_vs_T2Std[t2StdStudyId]){
                     processVergleich(kollStats.vergleich_AS_vs_T2Std[t2StdStudyId], "AS", `T2-Std (${t2StdName})`);
                }
                const bfVergleichKey = `vergleich_AS_vs_T2Opt_metric_${bruteForceMetric.replace(/\s+/g, '_')}`;
                 if(kollStats[bfVergleichKey]){
                     processVergleich(kollStats[bfVergleichKey], "AS", `T2-Opt (${bruteForceMetric})`);
                }
            }
        }
        const csvContent = _convertToCSV(rows);
        _triggerDownload(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), _getFilename('STATS_CSV', currentKollektiv));
    }

    function exportBruteForceResults(bruteForceState, kollektivId, metricName) {
        if (!bruteForceState || !bruteForceState.results || bruteForceState.results.length === 0) {
            _mainAppInterface.getUiHelpers().showToast("Keine Brute-Force Ergebnisse zum Exportieren vorhanden.", "warning");
            return;
        }
        const { results, bestResult, duration, totalTested, nGesamt, nPlus, nMinus } = bruteForceState;
        let content = `Brute-Force Optimierungsbericht\n`;
        content += `Kollektiv: ${getKollektivDisplayName(kollektivId)}\n`;
        content += `Zielmetrik: ${metricName}\n`;
        content += `Dauer: ${formatNumber(duration / 1000, 2, '--', false)} Sekunden\n`;
        content += `Getestete Kombinationen: ${totalTested}\n`;
        content += `Kollektivgröße: N=${nGesamt} (N+: ${nPlus}, N-: ${nMinus})\n\n`;
        content += `Bestes Ergebnis:\n`;
        content += `  Wert (${metricName}): ${formatNumber(bestResult.metricValue, 4, '--', false)}\n`;
        content += `  Logik: ${bestResult.logic}\n`;
        content += `  Kriterien: ${studyT2CriteriaManager.formatCriteriaForDisplay(bestResult.criteria, bestResult.logic, true)}\n`;
        content += `  Performance: Sens ${formatPercent(bestResult.sens,1)}, Spez ${formatPercent(bestResult.spez,1)}, PPV ${formatPercent(bestResult.ppv,1)}, NPV ${formatPercent(bestResult.npv,1)}, Acc ${formatPercent(bestResult.acc,1)}\n\n`;
        
        content += `Top ${results.length} Ergebnisse (sortiert nach ${metricName}):\n`;
        content += `Rang; ${metricName}; Sens; Spez; PPV; NPV; Acc; Logik; Kriterien\n`;
        results.forEach((res, index) => {
            content += `${index + 1}; ${formatNumber(res.metricValue, 4, '', false)}; ${formatPercent(res.sens,1)}; ${formatPercent(res.spez,1)}; ${formatPercent(res.ppv,1)}; ${formatPercent(res.npv,1)}; ${formatPercent(res.acc,1)}; ${res.logic}; "${studyT2CriteriaManager.formatCriteriaForDisplay(res.criteria, res.logic, true)}"\n`;
        });

        _triggerDownload(new Blob([content], { type: 'text/plain;charset=utf-8;' }), _getFilename('BRUTEFORCE_TXT', kollektivId));
    }

    function exportFilteredDataToCSV(filteredData, currentKollektiv) {
        if (!filteredData || filteredData.length === 0) {
            _mainAppInterface.getUiHelpers().showToast("Keine Daten für CSV-Export vorhanden.", "warning");
            return;
        }
        const dataForExport = filteredData.map(p => {
            const patientCopy = { ...p };
            delete patientCopy.t2_lymphknoten; 
            delete patientCopy.avocado_sign_lymphknoten;
            return patientCopy;
        });
        const csvContent = _convertToCSV(dataForExport);
        _triggerDownload(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), _getFilename('FILTERED_DATA_CSV', currentKollektiv));
    }

    function exportDeskriptiveStatistikToMD(deskriptiveStats, currentKollektiv) {
        if (!deskriptiveStats) {
             _mainAppInterface.getUiHelpers().showToast("Keine deskriptiven Statistikdaten für MD-Export vorhanden.", "warning");
            return;
        }
        let md = `## Deskriptive Statistik für Kollektiv: ${getKollektivDisplayName(currentKollektiv)}\n\n`;
        const data = [
            { Metrik: 'Anzahl Patienten', Wert: formatNumber(deskriptiveStats.anzahlPatienten,0,'',false) },
            { Metrik: 'Alter Mittelwert (SD)', Wert: `${formatNumber(deskriptiveStats.alter?.mean,1,'',false)} (± ${formatNumber(deskriptiveStats.alter?.sd,1,'',false)})` },
            { Metrik: 'Alter Median (IQR)', Wert: `${formatNumber(deskriptiveStats.alter?.median,1,'',false)} (${formatNumber(deskriptiveStats.alter?.q1,1,'',false)}–${formatNumber(deskriptiveStats.alter?.q3,1,'',false)})` },
            { Metrik: 'Geschlecht (m/f/u)', Wert: `${deskriptiveStats.geschlecht?.m || 0} / ${deskriptiveStats.geschlecht?.f || 0} / ${deskriptiveStats.geschlecht?.unbekannt || 0}` },
            { Metrik: 'N-Status (Pos/Neg)', Wert: `${deskriptiveStats.nStatus?.pos || 0} / ${deskriptiveStats.nStatus?.neg || 0}` },
            { Metrik: 'AS-Status (Pos/Neg)', Wert: `${deskriptiveStats.asStatus?.pos || 0} / ${deskriptiveStats.asStatus?.neg || 0}` },
            { Metrik: 'T2-Status angew. (Pos/Neg)', Wert: `${deskriptiveStats.t2Status?.pos || 0} / ${deskriptiveStats.t2Status?.neg || 0}` }
        ];
        md += _convertToMarkdownTable(data);
        _triggerDownload(new Blob([md], { type: 'text/markdown;charset=utf-8;' }), _getFilename('DESKRIPTIV_MD', currentKollektiv));
    }

    function exportDatenToMD(patientData, currentKollektiv) {
         if (!patientData || patientData.length === 0) {
            _mainAppInterface.getUiHelpers().showToast("Keine Patientendaten für MD-Export vorhanden.", "warning");
            return;
        }
        let md = `## Patientendaten für Kollektiv: ${getKollektivDisplayName(currentKollektiv)}\n\n`;
        const dataForTable = patientData.map(p => ({
            ID: p.id_patient,
            Alter: p.alter,
            Geschlecht: p.geschlecht,
            Therapie: getKollektivDisplayName(p.therapie),
            'N-Status': p.n_status_patient === 1 ? 'N+' : 'N-',
            'AS-Status': p.as_status_patient === 1 ? 'AS+' : 'AS-',
            'T2-Status': p.t2_status_patient === 1 ? 'T2+' : 'T2-',
            Bemerkung: p.bemerkung || ''
        }));
        const headers = { ID: 'Pat. ID', 'N-Status': 'N (Patho)', 'AS-Status':'AS', 'T2-Status': 'T2 (angew.)' };
        md += _convertToMarkdownTable(dataForTable, headers);
        _triggerDownload(new Blob([md], { type: 'text/markdown;charset=utf-8;' }), _getFilename('DATEN_MD', currentKollektiv));
    }
    
    function exportAuswertungToMD(auswertungData, currentKollektiv) {
        if (!auswertungData || auswertungData.length === 0) {
             _mainAppInterface.getUiHelpers().showToast("Keine Auswertungsdaten für MD-Export vorhanden.", "warning");
            return;
        }
        let md = `## Auswertungstabelle für Kollektiv: ${getKollektivDisplayName(currentKollektiv)}\n\n`;
        const dataForTable = auswertungData.map(p => ({
            ID: p.id_patient,
            Therapie: getKollektivDisplayName(p.therapie),
            'N (Patho)': p.n_status_patient === 1 ? 'N+' : 'N-',
            AS: p.as_status_patient === 1 ? 'AS+' : 'AS-',
            T2: p.t2_status_patient === 1 ? 'T2+' : 'T2-',
            'N LK (Pos/Ges)': `${p.n_lk_pos || 0}/${p.n_lk_gesamt || 0}`,
            'AS LK (Pos/Ges)': `${p.as_lk_pos || 0}/${p.as_lk_gesamt || 0}`,
            'T2 LK (Pos/Ges)': `${p.t2_lk_pos_calc || 0}/${p.t2_lk_gesamt_calc || 0}`
        }));
         const headers = { ID: 'Pat. ID', 'N (Patho)': 'N (Patho)', 'AS':'AS (Pat.)', 'T2': 'T2 (Pat., angew.)' };
        md += _convertToMarkdownTable(dataForTable, headers);
        _triggerDownload(new Blob([md], { type: 'text/markdown;charset=utf-8;' }), _getFilename('AUSWERTUNG_MD', currentKollektiv));
    }

    function exportFullPublicationToMD(publicationSectionsContent, currentKollektiv, lang) {
        if (!publicationSectionsContent || publicationSectionsContent.length === 0) {
            _mainAppInterface.getUiHelpers().showToast("Kein Inhalt für Publikationsexport vorhanden.", "warning");
            return;
        }
        let fullMd = `# Publikationsentwurf (${getKollektivDisplayName(currentKollektiv)}, Sprache: ${lang.toUpperCase()})\n\n`;
        publicationSectionsContent.forEach(section => {
            fullMd += `## ${section.title}\n\n${section.content}\n\n`;
        });
        _triggerDownload(new Blob([fullMd], { type: 'text/markdown;charset=utf-8;' }), _getFilename('PUBLIKATION_GESAMT_MD', currentKollektiv));
    }

    async function exportChartToPNG(chartContainerId, filenamePrefix = 'chart') {
        const chartElement = document.getElementById(chartContainerId);
        if (!chartElement || !chartElement.querySelector('svg')) {
            _mainAppInterface.getUiHelpers().showToast(`Diagramm-Container #${chartContainerId} nicht gefunden oder leer für PNG-Export.`, 'warning');
            return;
        }
        const svgElement = chartElement.querySelector('svg');
        try {
            const scale = APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_SCALE_FACTOR || 2;
            const canvas = await html2canvas(svgElement, { 
                backgroundColor: APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#FFFFFF',
                scale: scale,
                logging: false,
                useCORS: true,
                onclone: (doc) => { 
                    const clonedSvg = doc.querySelector('svg');
                    if (clonedSvg) {
                    }
                }
            });
            const filename = _getFilename('CHART_SINGLE_PNG', null, 'png').replace('Diagramm', filenamePrefix);
            canvas.toBlob(blob => _triggerDownload(blob, filename), 'image/png');
        } catch (error) {
            console.error(`Fehler beim Exportieren von Diagramm #${chartContainerId} als PNG:`, error);
            _mainAppInterface.getUiHelpers().showToast(`Fehler beim PNG-Export von #${chartContainerId}: ${error.message}`, 'error');
        }
    }

    function exportChartToSVG(chartContainerId, filenamePrefix = 'chart') {
        const chartElement = document.getElementById(chartContainerId);
        if (!chartElement || !chartElement.querySelector('svg')) {
            _mainAppInterface.getUiHelpers().showToast(`Diagramm-Container #${chartContainerId} nicht gefunden oder leer für SVG-Export.`, 'warning');
            return;
        }
        const svgElement = chartElement.querySelector('svg');
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svgElement);
        
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
        const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
        const filename = _getFilename('CHART_SINGLE_SVG', null, 'svg').replace('Diagramm_Vektor', filenamePrefix);
        _triggerDownload(blob, filename);
    }
    
    async function exportTableToPNG(tableContainerId, filenamePrefix = 'table') {
        const tableElement = document.getElementById(tableContainerId);
        if (!tableElement) {
            _mainAppInterface.getUiHelpers().showToast(`Tabellen-Container #${tableContainerId} nicht gefunden für PNG-Export.`, 'warning');
            return;
        }
        try {
            const scale = APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_SCALE_FACTOR || 1.5;
            const canvas = await html2canvas(tableElement, {
                 backgroundColor: APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_BACKGROUND_COLOR || '#FFFFFF',
                 scale: scale,
                 logging: false,
                 useCORS: true
            });
            const filename = _getFilename('TABLE_PNG_EXPORT', null, 'png').replace('Tabelle', filenamePrefix);
            canvas.toBlob(blob => _triggerDownload(blob, filename), 'image/png');
        } catch (error) {
            console.error(`Fehler beim Exportieren von Tabelle #${tableContainerId} als PNG:`, error);
            _mainAppInterface.getUiHelpers().showToast(`Fehler beim PNG-Export von #${tableContainerId}: ${error.message}`, 'error');
        }
    }

    function exportPraesentationAsPurToCSV(dataAsPur, currentKollektiv) {
        if (!dataAsPur) { _mainAppInterface.getUiHelpers().showToast("Keine Daten für Präsentation (AS Pur) CSV-Export.", "warning"); return;}
        const rows = [];
        rows.push(["Kollektiv", "N", "Sens", "Sens CI Lower", "Sens CI Upper", "Spez", "Spez CI Lower", "Spez CI Upper", "PPV", "PPV CI Lower", "PPV CI Upper", "NPV", "NPV CI Lower", "NPV CI Upper", "Acc", "Acc CI Lower", "Acc CI Upper", "AUC", "AUC CI Lower", "AUC CI Upper"]);
        
        const processStats = (stats, kollektivLabel) => {
            if (!stats || !stats.sens) return;
            rows.push([
                kollektivLabel, stats.matrix ? (stats.matrix.tp + stats.matrix.fp + stats.matrix.fn + stats.matrix.tn) : 'N/A',
                formatNumber(stats.sens.value, 4, '', false), formatNumber(stats.sens.ci?.lower, 4, '', false), formatNumber(stats.sens.ci?.upper, 4, '', false),
                formatNumber(stats.spez.value, 4, '', false), formatNumber(stats.spez.ci?.lower, 4, '', false), formatNumber(stats.spez.ci?.upper, 4, '', false),
                formatNumber(stats.ppv.value, 4, '', false), formatNumber(stats.ppv.ci?.lower, 4, '', false), formatNumber(stats.ppv.ci?.upper, 4, '', false),
                formatNumber(stats.npv.value, 4, '', false), formatNumber(stats.npv.ci?.lower, 4, '', false), formatNumber(stats.npv.ci?.upper, 4, '', false),
                formatNumber(stats.acc.value, 4, '', false), formatNumber(stats.acc.ci?.lower, 4, '', false), formatNumber(stats.acc.ci?.upper, 4, '', false),
                formatNumber(stats.auc.value, 4, '', false), formatNumber(stats.auc.ci?.lower, 4, '', false), formatNumber(stats.auc.ci?.upper, 4, '', false)
            ]);
        };
        processStats(dataAsPur.statsGesamt, getKollektivDisplayName('Gesamt'));
        processStats(dataAsPur.statsDirektOP, getKollektivDisplayName('direkt OP'));
        processStats(dataAsPur.statsNRCT, getKollektivDisplayName('nRCT'));
        
        const csvContent = _convertToCSV(rows);
        _triggerDownload(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), _getFilename('PRAES_AS_PUR_CSV', currentKollektiv));
    }
    function exportPraesentationAsPurToMD(dataAsPur, currentKollektiv) {
        if (!dataAsPur) { _mainAppInterface.getUiHelpers().showToast("Keine Daten für Präsentation (AS Pur) MD-Export.", "warning"); return;}
        let md = `## Performance Avocado Sign (AS) vs. N-Status\n\n`;
        const tableData = [];
        const kollektive = [
            { label: getKollektivDisplayName('Gesamt'), stats: dataAsPur.statsGesamt},
            { label: getKollektivDisplayName('direkt OP'), stats: dataAsPur.statsDirektOP},
            { label: getKollektivDisplayName('nRCT'), stats: dataAsPur.statsNRCT}
        ];
        kollektive.forEach(item => {
            if (!item.stats || !item.stats.sens) return;
            const s = item.stats;
            const fValCI = (m, d=1, p=true) => `${formatNumber(m?.value, d, '--', p)} (${formatNumber(m?.ci?.lower,d,'--',p)}-${formatNumber(m?.ci?.upper,d,'--',p)})`;
            tableData.push({
                'Kollektiv (N)': `${item.label} (N=${s.matrix ? (s.matrix.tp + s.matrix.fp + s.matrix.fn + s.matrix.tn) : 'N/A'})`,
                'Sens. (95% CI)': fValCI(s.sens),
                'Spez. (95% CI)': fValCI(s.spez),
                'PPV (95% CI)': fValCI(s.ppv),
                'NPV (95% CI)': fValCI(s.npv),
                'Acc. (95% CI)': fValCI(s.acc),
                'AUC (95% CI)': fValCI(s.auc,3,false),
            });
        });
        md += _convertToMarkdownTable(tableData);
        _triggerDownload(new Blob([md], { type: 'text/markdown;charset=utf-8;' }), _getFilename('PRAES_AS_PUR_MD', currentKollektiv));
    }

    function exportPraesentationAsVsT2ToCSV(dataAsVsT2, currentKollektiv) {
        if (!dataAsVsT2 || !dataAsVsT2.statsAS || !dataAsVsT2.statsT2) { _mainAppInterface.getUiHelpers().showToast("Keine Daten für Präsentation (AS vs T2) CSV-Export.", "warning"); return;}
        const rows = [];
        rows.push(["Metrik", "Avocado Sign Wert", "AS CI Lower", "AS CI Upper", `${dataAsVsT2.t2CriteriaLabelShort || 'T2'} Wert`, "T2 CI Lower", "T2 CI Upper", "Vergleichskollektiv", "N"]);
        const metricsToCompare = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
        metricsToCompare.forEach(key => {
            if (dataAsVsT2.statsAS[key] && dataAsVsT2.statsT2[key]) {
                rows.push([
                    UI_TEXTS.statMetrics[key]?.name || key.toUpperCase(),
                    formatNumber(dataAsVsT2.statsAS[key].value, 4, '', false), formatNumber(dataAsVsT2.statsAS[key].ci?.lower, 4, '', false), formatNumber(dataAsVsT2.statsAS[key].ci?.upper, 4, '', false),
                    formatNumber(dataAsVsT2.statsT2[key].value, 4, '', false), formatNumber(dataAsVsT2.statsT2[key].ci?.lower, 4, '', false), formatNumber(dataAsVsT2.statsT2[key].ci?.upper, 4, '', false),
                    getKollektivDisplayName(dataAsVsT2.kollektivForComparison), dataAsVsT2.patientCountForComparison
                ]);
            }
        });
        if (dataAsVsT2.vergleich) {
            rows.push([]);
            rows.push(["Test", "Statistik Wert", "p-Wert", "Methode"]);
            if(dataAsVsT2.vergleich.mcnemar) rows.push(["McNemar (Accuracy)", formatNumber(dataAsVsT2.vergleich.mcnemar.chi2, 4, '', false), formatPValue(dataAsVsT2.vergleich.mcnemar.pValue, APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, 'de', true), dataAsVsT2.vergleich.mcnemar.method]);
            if(dataAsVsT2.vergleich.delong) rows.push(["DeLong (AUC)", formatNumber(dataAsVsT2.vergleich.delong.Z, 4, '', false), formatPValue(dataAsVsT2.vergleich.delong.pValue, APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, 'de', true), dataAsVsT2.vergleich.delong.method]);
        }
        const csvContent = _convertToCSV(rows);
        _triggerDownload(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), _getFilename('PRAES_AS_VS_T2_CSV', dataAsVsT2.kollektivForComparison || currentKollektiv));
    }
    function exportPraesentationAsVsT2ToMD(dataAsVsT2, currentKollektiv) {
        if (!dataAsVsT2 || !dataAsVsT2.statsAS || !dataAsVsT2.statsT2) { _mainAppInterface.getUiHelpers().showToast("Keine Daten für Präsentation (AS vs T2) MD-Export.", "warning"); return;}
        let md = `## Vergleich Performance: AS vs. ${dataAsVsT2.t2CriteriaLabelShort}\n`;
        md += `Kollektiv: ${getKollektivDisplayName(dataAsVsT2.kollektivForComparison)} (N=${dataAsVsT2.patientCountForComparison})\n\n`;
        const tableData = [];
        const metricsToCompare = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
        metricsToCompare.forEach(key => {
            if (dataAsVsT2.statsAS[key] && dataAsVsT2.statsT2[key]) {
                const d = (key === 'auc' || key === 'f1' || key === 'balAcc') ? 3:1; const p = !(key === 'auc' || key === 'f1' || key === 'balAcc');
                tableData.push({
                    'Metrik': UI_TEXTS.statMetrics[key]?.name || key.toUpperCase(),
                    'AS (95% CI)': `${formatNumber(dataAsVsT2.statsAS[key].value, d, '--', p)} (${formatNumber(dataAsVsT2.statsAS[key].ci?.lower, d, '--', p)}-${formatNumber(dataAsVsT2.statsAS[key].ci?.upper, d, '--', p)})`,
                    [`${dataAsVsT2.t2CriteriaLabelShort} (95% CI)`]: `${formatNumber(dataAsVsT2.statsT2[key].value, d, '--', p)} (${formatNumber(dataAsVsT2.statsT2[key].ci?.lower, d, '--', p)}-${formatNumber(dataAsVsT2.statsT2[key].ci?.upper, d, '--', p)})`
                });
            }
        });
        md += _convertToMarkdownTable(tableData);
        _triggerDownload(new Blob([md], { type: 'text/markdown;charset=utf-8;' }), _getFilename('PRAES_AS_VS_T2_MD', dataAsVsT2.kollektivForComparison || currentKollektiv));
    }
    function exportPraesentationComparisonTestsToMD(dataAsVsT2, currentKollektiv) {
        if (!dataAsVsT2 || !dataAsVsT2.vergleich) { _mainAppInterface.getUiHelpers().showToast("Keine Vergleichstestdaten für MD-Export vorhanden.", "warning"); return;}
        let md = `## Statistische Tests: AS vs. ${dataAsVsT2.t2CriteriaLabelShort}\n`;
        md += `Kollektiv: ${getKollektivDisplayName(dataAsVsT2.kollektivForComparison)} (N=${dataAsVsT2.patientCountForComparison})\n\n`;
        const testData = [];
        const v = dataAsVsT2.vergleich;
        if(v.mcnemar) testData.push({'Test': v.mcnemar.method || "McNemar (Accuracy)", 'Statistik': `${formatNumber(v.mcnemar.chi2, 2)} (df=${v.mcnemar.df || 1})`, 'p-Wert': formatPValue(v.mcnemar.pValue, APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,'de',true) });
        if(v.delong) testData.push({'Test': v.delong.method || "DeLong (AUC)", 'Statistik': `Z=${formatNumber(v.delong.Z, 2)}`, 'p-Wert': formatPValue(v.delong.pValue, APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, 'de', true) });
        md += _convertToMarkdownTable(testData);
        _triggerDownload(new Blob([md], { type: 'text/markdown;charset=utf-8;' }), _getFilename('PRAES_COMP_TESTS_MD', dataAsVsT2.kollektivForComparison || currentKollektiv));
    }
    
    async function exportComprehensiveReportToHTML() {
        const stateSnapshot = _mainAppInterface.getStateSnapshot();
        const uiHelpers = _mainAppInterface.getUiHelpers();
        const allStats = await _mainAppInterface.getPublicationStats(); 
        const currentKollektiv = stateSnapshot.currentKollektiv;
        let html = `<html><head><title>Analysebericht</title><meta charset="UTF-8"><style>body{font-family:sans-serif; margin:20px;} table{border-collapse:collapse; margin-bottom:15px;} th,td{border:1px solid #ccc;padding:5px;text-align:left;} th{background-color:#f0f0f0;} h1,h2,h3{color:#337ab7;}</style></head><body>`;
        html += `<h1>Analysebericht - ${getKollektivDisplayName(currentKollektiv)}</h1>`;
        html += `<p>Datum: ${_getFormattedTimestamp("YYYY-MM-DD HH:mm")}</p>`;
        html += `<p>App Version: ${APP_CONFIG.APP_VERSION}</p>`;
        
        if(allStats && allStats[currentKollektiv] && allStats[currentKollektiv].deskriptiv){
            html += `<h2>Deskriptive Statistik (${getKollektivDisplayName(currentKollektiv)})</h2>`;
            const desc = allStats[currentKollektiv].deskriptiv;
            html += _convertToMarkdownTable([
                { Metrik: 'Anzahl Patienten', Wert: formatNumber(desc.anzahlPatienten,0,'',false) },
                { Metrik: 'Alter Mittelwert (SD)', Wert: `${formatNumber(desc.alter?.mean,1,'',false)} (± ${formatNumber(desc.alter?.sd,1,'',false)})` },
                { Metrik: 'Geschlecht (m/f/u)', Wert: `${desc.geschlecht?.m || 0}/${desc.geschlecht?.f || 0}/${desc.geschlecht?.unbekannt || 0}` }
            ]).replace(/\|---/g, '<th style="text-align:left;">---').replace(/\|/g, '</td><td style="border:1px solid #ccc;padding:5px;">').replace(/<\/td><td style="border:1px solid #ccc;padding:5px;">\n<td>/g, '</tr><tr><td>').replace(/^<td>/, '<table><thead><tr><th>').replace(/<\/td><\/tr>$/, '</td></tr></thead><tbody>').replace(/<\/tbody>$/, '</tbody></table>').replace(/\n<\/td>/g,'</td>');
        }
        
        html += `<p class="small text-muted mt-5">Hinweis: Dies ist ein vereinfachter HTML-Bericht. Diagramme und komplexe Tabellen sind hier nicht vollständig abgebildet. Für detaillierte Exporte nutzen Sie bitte die spezifischen Exportoptionen.</p>`;
        html += `</body></html>`;
        _triggerDownload(new Blob([html], { type: 'text/html;charset=utf-8;' }), _getFilename('COMPREHENSIVE_REPORT_HTML', currentKollektiv));
    }

    async function _generateAllBlobsForZip(exportTypes) {
        const blobs = {};
        const stateSnapshot = _mainAppInterface.getStateSnapshot();
        const currentKollektiv = stateSnapshot.currentKollektiv;
        const allStats = _mainAppInterface.getPublicationStats(); 
        const filteredData = _mainAppInterface.getFilteredData(currentKollektiv);
        const auswertungData = (typeof auswertungTabLogic !== 'undefined' && auswertungTabLogic.isInitialized() && typeof auswertungTabLogic.getCurrentAuswertungData === 'function') ? auswertungTabLogic.getCurrentAuswertungData() : filteredData;
        
        for (const type of exportTypes) {
            let contentBlob = null;
            let filename = '';
            try {
                switch (type) {
                    case 'STATS_CSV':
                        if (allStats) {
                            const rows = []; 
                            rows.push(["Kategorie", "Kollektiv", "Metrik", "Wert"]);
                            if(allStats[currentKollektiv]?.gueteAS?.sens) rows.push(["Güte AS", currentKollektiv, "Sensitivität", formatNumber(allStats[currentKollektiv].gueteAS.sens.value,4,'',false)]);
                            const csv = _convertToCSV(rows);
                            contentBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            filename = _getFilename('STATS_CSV', currentKollektiv);
                        }
                        break;
                    case 'FILTERED_DATA_CSV':
                        if (filteredData) {
                            const dataForExport = filteredData.map(p => { const pc = {...p}; delete pc.t2_lymphknoten; delete pc.avocado_sign_lymphknoten; return pc;});
                            const csv = _convertToCSV(dataForExport);
                            contentBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            filename = _getFilename('FILTERED_DATA_CSV', currentKollektiv);
                        }
                        break;
                    case 'DESKRIPTIV_MD':
                        if(allStats && allStats[currentKollektiv]?.deskriptiv) {
                             let md = `## Deskriptive Statistik (${getKollektivDisplayName(currentKollektiv)})\n\n`;
                             md += _convertToMarkdownTable([{ Metrik: 'Anzahl Patienten', Wert: allStats[currentKollektiv].deskriptiv.anzahlPatienten }]);
                             contentBlob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
                             filename = _getFilename('DESKRIPTIV_MD', currentKollektiv);
                        }
                        break;
                    case 'DATEN_MD':
                         if (filteredData) {
                            let md = `## Patientendaten (${getKollektivDisplayName(currentKollektiv)})\n\n`;
                            md += _convertToMarkdownTable(filteredData.map(p=>({ID: p.id_patient, Alter:p.alter, N:p.n_status_patient})), {ID:"Pat.ID"});
                            contentBlob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
                            filename = _getFilename('DATEN_MD', currentKollektiv);
                         }
                         break;
                    case 'AUSWERTUNG_MD':
                        if (auswertungData) {
                            let md = `## Auswertungstabelle (${getKollektivDisplayName(currentKollektiv)})\n\n`;
                            md += _convertToMarkdownTable(auswertungData.map(p=>({ID:p.id_patient, N:p.n_status_patient, AS:p.as_status_patient, T2:p.t2_status_patient})),{ID:"Pat.ID"});
                            contentBlob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
                            filename = _getFilename('AUSWERTUNG_MD', currentKollektiv);
                        }
                        break;
                }
                if (contentBlob && filename) {
                    blobs[filename] = contentBlob;
                }
            } catch (e) { console.error(`Fehler beim Erstellen von Blob für ${type}:`, e); }
        }
        return blobs;
    }
    
    async function _generateZip(filenameKey, blobGeneratorConfig) {
        if (typeof JSZip === 'undefined') {
            _mainAppInterface.getUiHelpers().showToast("JSZip Bibliothek nicht geladen. ZIP-Export nicht möglich.", "error");
            return;
        }
        _mainAppInterface.getUiHelpers().showToast("ZIP-Archiv wird erstellt...", "info", 2000);
        const zip = new JSZip();
        let blobsToZip = {};

        if (blobGeneratorConfig.individualFiles) {
            const individualBlobs = await _generateAllBlobsForZip(blobGeneratorConfig.individualFiles);
            blobsToZip = {...blobsToZip, ...individualBlobs};
        }
        
        if (blobGeneratorConfig.includeChartsPNG || blobGeneratorConfig.includeChartsSVG || blobGeneratorConfig.includeTablesPNG) {
            const chartContainers = Array.from(document.querySelectorAll('.statistik-chart-container[id], .dashboard-chart-container[id], #praes-as-performance-chart[id], #praes-comp-chart-container[id], #pub-chart-age[id], #pub-chart-gender[id], .pub-vergleich-chart[id]'));
            for (const container of chartContainers) {
                if (container.offsetParent === null || !container.querySelector('svg')) continue; 
                const chartId = container.id;
                const chartName = container.closest('.card')?.querySelector('.card-header')?.textContent.trim().replace(/\s+/g,'_') || chartId || "chart";
                 if (blobGeneratorConfig.includeChartsPNG) {
                    try {
                        const canvas = await html2canvas(container.querySelector('svg'), {backgroundColor: APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR, scale:2, logging: false});
                        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                        if(blob) blobsToZip[`charts_png/${chartName}.png`] = blob;
                    } catch(e) { console.error("Fehler beim PNG Export von Chart:", chartId, e); }
                }
                if (blobGeneratorConfig.includeChartsSVG) {
                    const svgElement = container.querySelector('svg');
                    if(svgElement){
                        const serializer = new XMLSerializer();
                        let source = serializer.serializeToString(svgElement);
                        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
                        blobsToZip[`charts_svg/${chartName}.svg`] = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
                    }
                }
            }
             if (blobGeneratorConfig.includeTablesPNG) {
                const tableContainers = Array.from(document.querySelectorAll('.publication-table[id], .table-exportable[id]')); 
                for (const tableEl of tableContainers) {
                     if (tableEl.offsetParent === null) continue;
                     const tableName = tableEl.closest('.card')?.querySelector('.card-header')?.textContent.trim().replace(/\s+/g,'_') || tableEl.id || 'table';
                     try {
                        const canvas = await html2canvas(tableEl, {scale:1.5, backgroundColor: APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_BACKGROUND_COLOR, logging: false});
                        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                        if(blob) blobsToZip[`tables_png/${tableName}.png`] = blob;
                     } catch(e) { console.error("Fehler beim PNG Export von Tabelle:", tableEl.id, e); }
                }
            }
        }


        if (Object.keys(blobsToZip).length === 0) {
            _mainAppInterface.getUiHelpers().showToast("Keine Dateien zum Zippen gefunden.", "warning");
            return;
        }

        for (const name in blobsToZip) {
            zip.file(name, blobsToZip[name]);
        }

        zip.generateAsync({ type: "blob" })
            .then(function(content) {
                _triggerDownload(content, _getFilename(filenameKey, _mainAppInterface.getStateSnapshot().currentKollektiv));
            })
            .catch(err => {
                console.error("Fehler beim Generieren des ZIP-Archivs:", err);
                _mainAppInterface.getUiHelpers().showToast("Fehler beim Erstellen des ZIP-Archivs.", "error");
            });
    }


    function triggerExport(exportType) {
        if (!_initialized || !_mainAppInterface) {
            console.error("ExportService nicht initialisiert oder MainAppInterface fehlt.");
            if (typeof ui_helpers !== 'undefined' && ui_helpers.showToast) { // Direct call if interface fails
                ui_helpers.showToast("ExportService ist nicht bereit.", "error");
            } else {
                alert("ExportService ist nicht bereit. Bitte laden Sie die Seite neu.");
            }
            return;
        }
        const stateSnapshot = _mainAppInterface.getStateSnapshot();
        const currentKollektiv = stateSnapshot.currentKollektiv;
        const allStats = _mainAppInterface.getPublicationStats(); 
        const filteredData = _mainAppInterface.getFilteredData(currentKollektiv);
        const auswertungData = (typeof auswertungTabLogic !== 'undefined' && auswertungTabLogic.isInitialized() && typeof auswertungTabLogic.getCurrentAuswertungData === 'function') 
                                ? auswertungTabLogic.getCurrentAuswertungData() 
                                : (filteredData || []); // Fallback for auswertungData
        const praesentationData = _mainAppInterface.getPraesentationData();


        switch (exportType) {
            case 'STATS_CSV': exportStatisticsToCSV(allStats, currentKollektiv); break;
            case 'BRUTEFORCE_TXT': exportBruteForceResults(stateSnapshot.bruteForceResults, currentKollektiv, stateSnapshot.currentBruteForceMetric); break;
            case 'DESKRIPTIV_MD': exportDeskriptiveStatistikToMD(allStats?.[currentKollektiv]?.deskriptiv, currentKollektiv); break;
            case 'DATEN_MD': exportDatenToMD(filteredData, currentKollektiv); break;
            case 'AUSWERTUNG_MD': exportAuswertungToMD(auswertungData, currentKollektiv); break;
            case 'FILTERED_DATA_CSV': exportFilteredDataToCSV(filteredData, currentKollektiv); break;
            case 'COMPREHENSIVE_REPORT_HTML': exportComprehensiveReportToHTML(); break;
            case 'PUBLIKATION_GESAMT_MD':
                const pubCommonData = (typeof publicationTabLogic !== 'undefined' && publicationTabLogic.isInitialized() && typeof publicationTabLogic._getCommonDataForTextGenerator === 'function') 
                                    ? publicationTabLogic._getCommonDataForTextGenerator() 
                                    : _mainAppInterface.getPublicationStats()?._getCommonDataForTextGenerator() || {};
                const pubSections = (typeof publicationTabLogic !== 'undefined' && publicationTabLogic.isInitialized() && typeof publicationTextGenerator !== 'undefined')
                    ? PUBLICATION_CONFIG.sections.flatMap(s => s.subSections ? s.subSections : [s]).map(sec => {
                        const secLabelObj = sec.labels || {};
                        return {
                            title: secLabelObj[stateSnapshot.publikationLang] || secLabelObj.de || sec.id, 
                            content: publicationTextGenerator.getSectionText(sec.id, stateSnapshot.publikationLang, allStats, pubCommonData, {bruteForceMetric: stateSnapshot.publikationBruteForceMetric}) 
                        };
                    })
                    : [];
                exportFullPublicationToMD(pubSections, currentKollektiv, stateSnapshot.publikationLang);
                break;
            case 'PNG_ZIP': _generateZip('PNG_ZIP', { includeChartsPNG: true, includeTablesPNG: true}); break;
            case 'SVG_ZIP': _generateZip('SVG_ZIP', { includeChartsSVG: true }); break;
            case 'ALL_ZIP': _generateZip('ALL_ZIP', { individualFiles: ['STATS_CSV', 'FILTERED_DATA_CSV', 'DESKRIPTIV_MD', 'DATEN_MD', 'AUSWERTUNG_MD'], includeChartsPNG: true, includeTablesPNG: true }); break;
            case 'CSV_ZIP': _generateZip('CSV_ZIP', { individualFiles: ['STATS_CSV', 'FILTERED_DATA_CSV'] }); break;
            case 'MD_ZIP': _generateZip('MD_ZIP', { individualFiles: ['DESKRIPTIV_MD', 'DATEN_MD', 'AUSWERTUNG_MD']}); break;

            default:
                 _mainAppInterface.getUiHelpers().showToast(`Unbekannter Exporttyp: ${exportType}`, 'warning');
        }
    }


    return Object.freeze({
        initialize,
        triggerExport,
        exportChartToPNG, 
        exportChartToSVG,
        exportTableToPNG,
        exportBruteForceResults, 
        exportPraesentationAsPurToCSV,
        exportPraesentationAsPurToMD,
        exportPraesentationAsVsT2ToCSV,
        exportPraesentationAsVsT2ToMD,
        exportPraesentationComparisonTestsToMD
    });
})();
