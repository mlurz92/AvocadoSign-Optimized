const exportService = (() => {

    function generateFilename(typeKey, kollektiv, extension, options = {}) {
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(kollektiv).replace(/[^a-z0-9_ .()-]/gi, '_').replace(/[\s.]+/g, '_');
        let filenameType = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[typeKey] || typeKey || 'Export';

        if (options.chartName) {
            filenameType = filenameType.replace('{ChartName}', options.chartName.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        } else {
            filenameType = filenameType.replace('_{ChartName}', '').replace('{ChartName}', '');
        }

        if (options.tableName) {
            filenameType = filenameType.replace('{TableName}', options.tableName.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        } else if (typeKey === 'TABLE_PNG_EXPORT' && options.tableId) {
             filenameType = filenameType.replace('{TableName}', options.tableId.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        } else {
            filenameType = filenameType.replace('_{TableName}', '').replace('{TableName}', '');
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
            .replace('{EXT}', extension)
            .replace(/__+/g, '_') // Ersetze doppelte Unterstriche
            .replace(/_$/,''); // Entferne endständigen Unterstrich

        return filename;
    }

    function downloadFile(content, filename, mimeType) {
        try {
            if (content === null || content === undefined) {
                 console.warn(`downloadFile: Ungültiger Inhalt für ${filename}.`);
                 ui_helpers.showToast(`Export fehlgeschlagen: Keine Daten für ${filename} generiert.`, 'warning');
                 return false;
            }
            let blob;
            if (content instanceof Blob) {
                blob = content;
                if (blob.size === 0) {
                    console.warn(`downloadFile: Generierter Blob für ${filename} ist leer.`);
                    ui_helpers.showToast(`Export fehlgeschlagen: Leere Datei für ${filename} generiert.`, 'warning');
                    return false;
                }
            } else {
                 const stringContent = String(content);
                 if (stringContent.length === 0) {
                    console.warn(`downloadFile: Generierter String für ${filename} ist leer.`);
                    ui_helpers.showToast(`Export fehlgeschlagen: Leere Datei für ${filename} generiert.`, 'warning');
                    return false;
                 }
                 blob = new Blob([stringContent], { type: mimeType });
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                if (document.body.contains(a)) {
                    document.body.removeChild(a);
                }
                window.URL.revokeObjectURL(url);
            }, 150);
            return true;
        } catch (error) {
            console.error(`Download fehlgeschlagen für ${filename}:`, error);
            ui_helpers.showToast(`Fehler beim Herunterladen der Datei '${filename}'.`, 'danger');
            return false;
        }
    }

    async function convertSvgToPngBlob(svgElement, targetWidth = 800, options = {}) {
        return new Promise((resolve, reject) => {
            if (!svgElement || typeof svgElement.cloneNode !== 'function') {
                return reject(new Error("Ungültiges SVG Element für PNG Konvertierung."));
            }
            try {
                const svgClone = svgElement.cloneNode(true);
                svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                svgClone.setAttribute('version', '1.1');
                const backgroundColor = options.backgroundColor || APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff';
                svgClone.style.backgroundColor = backgroundColor;

                const styles = getComputedStyle(svgElement);
                const viewBox = svgElement.viewBox?.baseVal;

                let sourceWidth = parseFloat(svgClone.getAttribute('width')) || parseFloat(styles.width) || svgElement.width?.baseVal?.value || viewBox?.width || targetWidth;
                let sourceHeight = parseFloat(svgClone.getAttribute('height')) || parseFloat(styles.height) || svgElement.height?.baseVal?.value || viewBox?.height || (targetWidth * 0.75);

                if (sourceWidth <= 0 || sourceHeight <= 0) {
                    sourceWidth = viewBox?.width || targetWidth;
                    sourceHeight = viewBox?.height || (targetWidth * (viewBox ? (viewBox.height / viewBox.width) : 0.75));
                }
                if (sourceWidth <= 0 || sourceHeight <= 0) {
                    return reject(new Error("SVG-Dimensionen konnten nicht ermittelt werden oder sind ungültig."));
                }

                const scaleFactor = targetWidth / sourceWidth;
                const targetHeight = sourceHeight * scaleFactor;

                svgClone.setAttribute('width', String(targetWidth));
                svgClone.setAttribute('height', String(targetHeight));
                
                const explicitStyles = document.createElementNS("http://www.w3.org/2000/svg", "style");
                explicitStyles.textContent = `
                    svg { font-family: ${APP_CONFIG.CHART_SETTINGS.RSNA_CHART_FONT_FAMILY || 'Arial, sans-serif'}; }
                    .axis path, .axis line { fill: none; stroke: ${APP_CONFIG.CHART_SETTINGS.CHART_AXIS_COLOR || '#333'}; shape-rendering: crispEdges; stroke-width: 1px; }
                    .axis text { font-size: ${APP_CONFIG.CHART_SETTINGS.RSNA_CHART_TICK_LABEL_FONT_SIZE || '9pt'}; fill: ${APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || '#000'}; }
                    .axis-label { font-size: ${APP_CONFIG.CHART_SETTINGS.RSNA_CHART_AXIS_LABEL_FONT_SIZE || '10pt'}; fill: ${APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || '#000'}; text-anchor: middle; }
                    .grid .tick { stroke: ${APP_CONFIG.CHART_SETTINGS.GRIDLINE_COLOR || '#ccc'}; stroke-opacity: 0.6; }
                    .grid path { stroke-width: 0; }
                    .legend text { font-size: ${APP_CONFIG.CHART_SETTINGS.RSNA_CHART_LEGEND_FONT_SIZE || '9pt'}; fill: ${APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || '#000'};}
                    .title-text { font-size: ${APP_CONFIG.CHART_SETTINGS.RSNA_CHART_TITLE_FONT_SIZE || '12pt'}; font-weight: bold; text-anchor: middle; fill: ${APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || '#000'};}
                `;
                svgClone.prepend(explicitStyles);


                const svgXml = new XMLSerializer().serializeToString(svgClone);
                const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgXml)))}`;

                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) { return reject(new Error("Canvas Context nicht verfügbar.")); }
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        if (blob) { resolve(blob); }
                        else { reject(new Error("Canvas toBlob fehlgeschlagen.")); }
                    }, 'image/png');
                };
                img.onerror = (err) => {
                    console.error("Image load error for SVG to PNG conversion:", err, svgDataUrl.substring(0,100));
                    reject(new Error("Fehler beim Laden des SVG-Bildes für PNG-Konvertierung."));
                };
                img.src = svgDataUrl;
            } catch (error) {
                reject(new Error(`Fehler bei SVG-zu-PNG Konvertierung: ${error.message}`));
            }
        });
    }

     async function convertSvgToSvgBlob(svgElement, options = {}) {
         return new Promise((resolve, reject) => {
             if (!svgElement || typeof svgElement.cloneNode !== 'function') return reject(new Error("Ungültiges SVG Element für SVG Export."));
              try {
                 const svgClone = svgElement.cloneNode(true);
                 svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                 svgClone.setAttribute('version', '1.1');
                 
                 const explicitStyles = document.createElementNS("http://www.w3.org/2000/svg", "style");
                 explicitStyles.textContent = `
                    svg { font-family: ${APP_CONFIG.CHART_SETTINGS.RSNA_CHART_FONT_FAMILY || 'Arial, sans-serif'}; }
                    .axis path, .axis line { fill: none; stroke: ${APP_CONFIG.CHART_SETTINGS.CHART_AXIS_COLOR || '#333'}; shape-rendering: crispEdges; stroke-width: 1px; }
                    .axis text { font-size: ${APP_CONFIG.CHART_SETTINGS.RSNA_CHART_TICK_LABEL_FONT_SIZE || '9pt'}; fill: ${APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || '#000'}; }
                    .axis-label { font-size: ${APP_CONFIG.CHART_SETTINGS.RSNA_CHART_AXIS_LABEL_FONT_SIZE || '10pt'}; fill: ${APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || '#000'}; text-anchor: middle; }
                    .grid .tick { stroke: ${APP_CONFIG.CHART_SETTINGS.GRIDLINE_COLOR || '#ccc'}; stroke-opacity: 0.6; }
                    .grid path { stroke-width: 0; }
                    .legend text { font-size: ${APP_CONFIG.CHART_SETTINGS.RSNA_CHART_LEGEND_FONT_SIZE || '9pt'}; fill: ${APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || '#000'};}
                    .title-text { font-size: ${APP_CONFIG.CHART_SETTINGS.RSNA_CHART_TITLE_FONT_SIZE || '12pt'}; font-weight: bold; text-anchor: middle; fill: ${APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || '#000'};}
                 `;
                 svgClone.prepend(explicitStyles);


                 const svgXml = new XMLSerializer().serializeToString(svgClone);
                 const blob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
                 resolve(blob);
              } catch(error) {
                 reject(new Error(`Fehler bei SVG-zu-SVG Blob Konvertierung: ${error.message}`));
              }
         });
     }

    function generateStatistikCSVString(stats, kollektiv, criteria, logic) {
        if (!stats || !stats.deskriptiv) return null;
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'N/A';
        const csvData = []; const na = 'N/A';
        const fv = (v, d, useStd = true) => formatNumber(v, d, na, useStd); // useStd = true für CSV (Punkt als Dezimaltrenner)
        const fp = (v, d) => formatPercent(v, d, na);
        const fCI = (o, d, isP) => !o || typeof o !== 'object' || o.lower === null || o.upper === null || isNaN(o.lower) || isNaN(o.upper) ? [na, na] : [fv(o.lower, d, true), fv(o.upper, d, true)];
        const fPVal = (p) => (p !== null && !isNaN(p)) ? (p < APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_THRESHOLD_LESS_THAN ? `<${fv(APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_THRESHOLD_LESS_THAN, APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_CSV, true)}` : fv(p, APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_CSV, true)) : na;

        try {
            csvData.push(['Parameter', 'Wert']); csvData.push(['Kollektiv', getKollektivDisplayName(kollektiv)]); csvData.push(['Angewandte T2 Logik', logic]); csvData.push(['Angewandte T2 Kriterien', formatCriteriaFunc(criteria, logic)]); csvData.push(['Anzahl Patienten', stats.deskriptiv.anzahlPatienten]); csvData.push([]);
            csvData.push(['Metrik (Deskriptiv)', 'Wert (Median)', 'Mean', 'SD', 'Min', 'Max']); const d = stats.deskriptiv;
            csvData.push(['Alter (Jahre)', fv(d.alter?.median, 1), fv(d.alter?.mean, 1), fv(d.alter?.sd, 1), fv(d.alter?.min, 0), fv(d.alter?.max, 0)]);
            csvData.push(['Geschlecht Männlich (n)', `${d.geschlecht?.m ?? 0}`]); csvData.push(['Geschlecht Männlich (%)', `${fp(d.anzahlPatienten > 0 ? (d.geschlecht?.m ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push(['Therapie direkt OP (n)', `${d.therapie?.['direkt OP'] ?? 0}`]); csvData.push(['Therapie direkt OP (%)', `${fp(d.anzahlPatienten > 0 ? (d.therapie?.['direkt OP'] ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push(['Therapie nRCT (n)', `${d.therapie?.nRCT ?? 0}`]); csvData.push(['Therapie nRCT (%)', `${fp(d.anzahlPatienten > 0 ? (d.therapie?.nRCT ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push(['N Status (+)', `${d.nStatus?.plus ?? 0}`]); csvData.push(['N Status (+ / %)', `${fp(d.anzahlPatienten > 0 ? (d.nStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push(['AS Status (+)', `${d.asStatus?.plus ?? 0}`]); csvData.push(['AS Status (+ / %)', `${fp(d.anzahlPatienten > 0 ? (d.asStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push(['T2 Status (+)', `${d.t2Status?.plus ?? 0}`]); csvData.push(['T2 Status (+ / %)', `${fp(d.anzahlPatienten > 0 ? (d.t2Status?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            const fLKRowCSV = (lk) => [fv(lk?.median, 1), fv(lk?.mean, 1), fv(lk?.sd, 1), fv(lk?.min, 0), fv(lk?.max, 0)];
            csvData.push(['LK N gesamt (Median)', ...fLKRowCSV(d.lkAnzahlen?.n?.total)]); csvData.push(['LK N+ (Median, nur N+ Pat.)', ...fLKRowCSV(d.lkAnzahlen?.n?.plus)]);
            csvData.push(['LK AS gesamt (Median)', ...fLKRowCSV(d.lkAnzahlen?.as?.total)]); csvData.push(['LK AS+ (Median, nur AS+ Pat.)', ...fLKRowCSV(d.lkAnzahlen?.as?.plus)]);
            csvData.push(['LK T2 gesamt (Median)', ...fLKRowCSV(d.lkAnzahlen?.t2?.total)]); csvData.push(['LK T2+ (Median, nur T2+ Pat.)', ...fLKRowCSV(d.lkAnzahlen?.t2?.plus)]); csvData.push([]);
            csvData.push(['Metrik (Diagnostik)', 'Methode', 'Wert', '95% CI Lower', '95% CI Upper', 'SE (Bootstrap)', 'CI Methode']); const addPerfRow = (metricKey, metricName, objAS, objT2) => { const isRate = !(metricKey === 'auc' || metricKey === 'f1'); const digits = isRate ? 1 : (metricKey === 'auc' || metricKey === 'f1' ? APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_CSV : 3) ; const ciAS = fCI(objAS?.ci, digits, isRate); const ciT2 = fCI(objT2?.ci, digits, isRate); const valAS = fv(objAS?.value, digits); const valT2 = fv(objT2?.value, digits); csvData.push([metricName, 'AS', valAS, ciAS[0], ciAS[1], fv(objAS?.se, 4), objAS?.method || na]); csvData.push([metricName, 'T2', valT2, ciT2[0], ciT2[1], fv(objT2?.se, 4), objT2?.method || na]); }; const gAS = stats.gueteAS, gT2 = stats.gueteT2_angewandt; addPerfRow('sens', 'Sensitivität', gAS?.sens, gT2?.sens); addPerfRow('spez', 'Spezifität', gAS?.spez, gT2?.spez); addPerfRow('ppv', 'PPV', gAS?.ppv, gT2?.ppv); addPerfRow('npv', 'NPV', gAS?.npv, gT2?.npv); addPerfRow('acc', 'Accuracy', gAS?.acc, gT2?.acc); addPerfRow('balAcc', 'Balanced Accuracy', gAS?.balAcc, gT2?.balAcc); addPerfRow('f1', 'F1-Score', gAS?.f1, gT2?.f1); addPerfRow('auc', 'AUC', gAS?.auc, gT2?.auc); csvData.push([]);
            csvData.push(['Vergleichstest (AS vs. T2 angewandt)', 'Test Statistik', 'p-Wert', 'Methode']); const v = stats.vergleichASvsT2_angewandt; csvData.push(['Accuracy (McNemar)', fv(v?.mcnemar?.statistic, 3), fPVal(v?.mcnemar?.pValue), v?.mcnemar?.method || na]); csvData.push(['AUC (DeLong)', fv(v?.delong?.Z, 3), fPVal(v?.delong?.pValue), v?.delong?.method || na]); csvData.push([]);
            csvData.push(['Assoziation mit N-Status', 'Merkmal Key', 'Merkmal Name', 'OR', 'OR CI Lower', 'OR CI Upper', 'RD', 'RD CI Lower', 'RD CI Upper', 'Phi', 'Phi CI Lower', 'Phi CI Upper', 'Test Statistik', 'p-Wert', 'Test Methode']); const addAssocRow = (key, name, obj) => { if (!obj) return; const orCI = fCI(obj.or?.ci, 2, false); const rdCI = fCI(obj.rd?.ci, 3, false); const phiCI = fCI(obj.phi?.ci, 2, false); csvData.push([ key, name, fv(obj.or?.value, 2), orCI[0], orCI[1], fv(obj.rd?.value, 3), rdCI[0], rdCI[1], fv(obj.phi?.value, 2), phiCI[0], phiCI[1], fv(obj.statistic ?? NaN, 2), fPVal(obj.pValue), obj.testName || na ]); }; const a = stats.assoziation_angewandt; addAssocRow('as', a?.as?.featureName || 'AS Positiv', a?.as); if(a?.size_mwu) { csvData.push(['size_mwu', a.size_mwu.featureName || 'LK Größe MWU', na,na,na,na,na,na,na,na,na, fv(a.size_mwu.statistic, 2), fPVal(a.size_mwu.pValue), a.size_mwu.testName || na ]); } ['size', 'form', 'kontur', 'homogenitaet', 'signal'].forEach(fKey => { if(a && a[fKey]) { addAssocRow(fKey, a[fKey].featureName || `T2 ${fKey}`, a[fKey]); } });
            return Papa.unparse(csvData, { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" });
        } catch (error) {
             console.error("Fehler in generateStatistikCSVString:", error);
             return null;
        }
    }

    function generateBruteForceTXTString(resultsData) {
        if (!resultsData || !resultsData.results || resultsData.results.length === 0) return "Keine Brute-Force-Ergebnisse vorhanden.";
        try {
            const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'Formatierungsfehler';
            const { results, metric, duration, totalTested, kollektiv, nGesamt, nPlus, nMinus } = resultsData;
            const kollektivName = getKollektivDisplayName(kollektiv);
            const bestResult = results[0];
            let report = `Brute-Force Optimierungsbericht\r\n==================================================\r\n`;
            report += `Datum der Analyse: ${new Date().toLocaleString('de-DE')}\r\n`;
            report += `Analysiertes Kollektiv: ${kollektivName}\r\n`;
            report += `   - Gesamtzahl Patienten: ${formatNumber(nGesamt, 0, 'N/A')}\r\n`;
            report += `   - N+ Patienten: ${formatNumber(nPlus, 0, 'N/A')}\r\n`;
            report += `   - N- Patienten: ${formatNumber(nMinus, 0, 'N/A')}\r\n`;
            report += `Optimierte Zielmetrik: ${metric}\r\n`;
            report += `Gesamtdauer: ${formatNumber((duration || 0) / 1000, 1, true)} Sekunden\r\n`;
            report += `Getestete Kombinationen: ${formatNumber(totalTested, 0, true)}\r\n`;
            report += `==================================================\r\n\r\n`;
            report += `--- Bestes Ergebnis ---\r\n`;
            report += `Logik: ${bestResult.logic.toUpperCase()}\r\n`;
            report += `Kriterien: ${formatCriteriaFunc(bestResult.criteria, bestResult.logic)}\r\n`;
            report += `Erreichter ${metric}: ${formatNumber(bestResult.metricValue, 4, true)}\r\n\r\n`;
            report += `--- Top Ergebnisse (inklusive identischer Werte) ---\r\n`;
            report += `Rang | ${metric.padEnd(12)} | Sens.   | Spez.   | PPV     | NPV     | Logik | Kriterien\r\n`;
            report += `-----|--------------|---------|---------|---------|---------|-------|------------------------------------------\r\n`;

            let rank = 1, displayedCount = 0, lastMetricValue = -Infinity; const precision = 8;
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (!result || typeof result.metricValue !== 'number' || !isFinite(result.metricValue)) continue;
                const currentMetricValueRounded = parseFloat(result.metricValue.toFixed(precision));
                const lastMetricValueRounded = parseFloat(lastMetricValue.toFixed(precision));
                let currentRank = rank;
                const isNewRank = Math.abs(currentMetricValueRounded - lastMetricValueRounded) > 1e-8;
                if (i > 0 && isNewRank) { rank = displayedCount + 1; currentRank = rank; }
                else if (i > 0) { currentRank = rank; }
                if (rank > 10 && isNewRank && i >=10 ) break;
                const sensStr = result.sens !== undefined ? formatPercent(result.sens, 1).padEnd(7) : 'N/A'.padEnd(7);
                const spezStr = result.spez !== undefined ? formatPercent(result.spez, 1).padEnd(7) : 'N/A'.padEnd(7);
                const ppvStr = result.ppv !== undefined ? formatPercent(result.ppv, 1).padEnd(7) : 'N/A'.padEnd(7);
                const npvStr = result.npv !== undefined ? formatPercent(result.npv, 1).padEnd(7) : 'N/A'.padEnd(7);

                report += `${String(currentRank).padEnd(4)} | ${formatNumber(result.metricValue, 4, true).padEnd(12)} | ${sensStr} | ${spezStr} | ${ppvStr} | ${npvStr} | ${result.logic.toUpperCase().padEnd(5)} | ${formatCriteriaFunc(result.criteria, result.logic)}\r\n`;
                if (isNewRank || i === 0) { lastMetricValue = result.metricValue; }
                displayedCount++;
            }
            report += `==================================================\r\n`;
            return report;
        } catch (error) {
             console.error("Fehler in generateBruteForceTXTString:", error);
             return null;
        }
    }

    function generateMarkdownTableString(dataOrStats, tableType, kollektiv, criteria = null, logic = null, options = {}) {
        try {
            let headers = [], rows = [], title = ''; const kollektivDisplayName = getKollektivDisplayName(kollektiv); const escMD = ui_helpers.escapeMarkdown; const na = '--'; const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'N/A'; const t2CriteriaLabelShort = options.t2CriteriaLabelShort || 'T2';
            if (tableType === 'daten') { title = 'Datenliste'; headers = ['Nr', 'Name', 'Vorname', 'Geschl.', 'Alter', 'Therapie', 'N', 'AS', 'T2', 'Bemerkung']; if(!Array.isArray(dataOrStats)) return `# ${title}...\n\nFehler: Ungültige Daten.`; rows = dataOrStats.map(p => [p.nr, p.name || '', p.vorname || '', p.geschlecht || '', p.alter ?? '', getKollektivDisplayName(p.therapie), p.n ?? na, p.as ?? na, p.t2 ?? na, p.bemerkung || ''].map(escMD)); }
            else if (tableType === 'auswertung') { title = 'Auswertungstabelle'; headers = ['Nr', 'Name', 'Therapie', 'N', 'AS', 'T2', 'N+/N ges', 'AS+/AS ges', 'T2+/T2 ges']; if(!Array.isArray(dataOrStats)) return `# ${title}...\n\nFehler: Ungültige Daten.`; rows = dataOrStats.map(p => [p.nr, p.name || '', getKollektivDisplayName(p.therapie), p.n ?? na, p.as ?? na, p.t2 ?? na, `${formatNumber(p.anzahl_patho_n_plus_lk, 0, '-')} / ${formatNumber(p.anzahl_patho_lk, 0, '-')}`, `${formatNumber(p.anzahl_as_plus_lk, 0, '-')} / ${formatNumber(p.anzahl_as_lk, 0, '-')}`, `${formatNumber(p.anzahl_t2_plus_lk, 0, '-')} / ${formatNumber(p.anzahl_t2_lk, 0, '-')}`].map(escMD)); }
            else if (tableType === 'deskriptiv') { title = 'Deskriptive Statistik'; const stats = dataOrStats; if (!stats || !stats.anzahlPatienten) return `# ${title} (Kollektiv: ${kollektivDisplayName})\n\nKeine Daten verfügbar.`; const total = stats.anzahlPatienten; headers = ['Metrik', 'Wert']; const fLKRowMD = (lk) => `${formatNumber(lk?.median, 1, na)} (${formatNumber(lk?.min, 0, na)}-${formatNumber(lk?.max, 0, na)}) \\[Mean: ${formatNumber(lk?.mean, 1, na)} ± ${formatNumber(lk?.sd, 1, na)}\\]`; rows = [ ['Anzahl Patienten', total], ['Median Alter (Min–Max) \\[Mean ± SD\\]', `${formatNumber(stats.alter?.median, 1, na)} (${formatNumber(stats.alter?.min, 0, na)} - ${formatNumber(stats.alter?.max, 0, na)}) \\[${formatNumber(stats.alter?.mean, 1, na)} ± ${formatNumber(stats.alter?.sd, 1, na)}\\]`], ['Geschlecht (m/w) (n / %)', `${stats.geschlecht?.m ?? 0} / ${stats.geschlecht?.f ?? 0} (${formatPercent((stats.geschlecht?.m ?? 0) / total, 1)} / ${formatPercent((stats.geschlecht?.f ?? 0) / total, 1)})`], ['Therapie (direkt OP / nRCT) (n / %)', `${stats.therapie?.['direkt OP'] ?? 0} / ${stats.therapie?.nRCT ?? 0} (${formatPercent((stats.therapie?.['direkt OP'] ?? 0) / total, 1)} / ${formatPercent((stats.therapie?.nRCT ?? 0) / total, 1)})`], ['N Status (+ / -) (n / %)', `${stats.nStatus?.plus ?? 0} / ${stats.nStatus?.minus ?? 0} (${formatPercent((stats.nStatus?.plus ?? 0) / total, 1)} / ${formatPercent((stats.nStatus?.minus ?? 0) / total, 1)})`], ['AS Status (+ / -) (n / %)', `${stats.asStatus?.plus ?? 0} / ${stats.asStatus?.minus ?? 0} (${formatPercent((stats.asStatus?.plus ?? 0) / total, 1)} / ${formatPercent((stats.asStatus?.minus ?? 0) / total, 1)})`], ['T2 Status (+ / -) (n / %)', `${stats.t2Status?.plus ?? 0} / ${stats.t2Status?.minus ?? 0} (${formatPercent((stats.t2Status?.plus ?? 0) / total, 1)} / ${formatPercent((stats.t2Status?.minus ?? 0) / total, 1)})`], ['Median LK N ges. (Min-Max) \\[Mean ± SD\\]', fLKRowMD(stats.lkAnzahlen?.n?.total)], ['Median LK N+ (Min-Max) \\[Mean ± SD\\] (nur N+ Pat.)', fLKRowMD(stats.lkAnzahlen?.n?.plus)], ['Median LK AS ges. (Min-Max) \\[Mean ± SD\\]', fLKRowMD(stats.lkAnzahlen?.as?.total)], ['Median LK AS+ (Min-Max) \\[Mean ± SD\\] (nur AS+ Pat.)', fLKRowMD(stats.lkAnzahlen?.as?.plus)], ['Median LK T2 ges. (Min-Max) \\[Mean ± SD\\]', fLKRowMD(stats.lkAnzahlen?.t2?.total)], ['Median LK T2+ (Min-Max) \\[Mean ± SD\\] (nur T2+ Pat.)', fLKRowMD(stats.lkAnzahlen?.t2?.plus)] ].map(r => r.map(escMD)); }
            else if (tableType === 'praes_as_perf') { title = `Diagnostische Güte (AS) für Kollektive`; const { statsGesamt, statsDirektOP, statsNRCT } = dataOrStats || {}; if (!statsGesamt && !statsDirektOP && !statsNRCT) return `# ${title}\n\nFehler: Ungültige Daten.`; headers = ['Kollektiv', 'Sens. (95% CI)', 'Spez. (95% CI)', 'PPV (95% CI)', 'NPV (95% CI)', 'Acc. (95% CI)', 'AUC (95% CI)']; const fRow = (s, k) => { const d = getKollektivDisplayName(k); if (!s || typeof s.matrix !== 'object') return [d + ' (N=?)', na, na, na, na, na, na].map(escMD); const n = s.matrix ? (s.matrix.rp + s.matrix.fp + s.matrix.fn + s.matrix.rn) : 0; const fCI_p = (m, ky) => { const dig = (ky === 'f1' || ky === 'auc') ? 3 : 1; const isP = !(ky === 'f1' || ky === 'auc'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, dig, isP, na); }; return [`${d} (N=${n})`, fCI_p(s.sens, 'sens'), fCI_p(s.spez, 'spez'), fCI_p(s.ppv, 'ppv'), fCI_p(s.npv, 'npv'), fCI_p(s.acc, 'acc'), fCI_p(s.auc, 'auc')].map(escMD); }; rows = [ fRow(statsGesamt, 'Gesamt'), fRow(statsDirektOP, 'direkt OP'), fRow(statsNRCT, 'nRCT') ]; }
            else if (tableType === 'praes_as_vs_t2_comp' || tableType === 'praes_as_vs_t2_perf' ) { const { statsAS, statsT2 } = dataOrStats || {}; title = `Vergleich Diagnostische Güte (AS vs. ${escMD(t2CriteriaLabelShort)})`; if (!statsAS || !statsT2) return `# ${title} (Kollektiv: ${kollektivDisplayName})\n\nFehler: Ungültige Daten für Vergleich.`; headers = ['Metrik', 'AS (Wert, 95% CI)', `${escMD(t2CriteriaLabelShort)} (Wert, 95% CI)`]; const fRow = (mKey, nm, isP = true, d = 1) => { const mAS = statsAS[mKey]; const mT2 = statsT2[mKey]; const dig = (mKey === 'auc' || mKey === 'f1') ? 3 : d; const vAS = formatCI(mAS?.value, mAS?.ci?.lower, mAS?.ci?.upper, dig, isP, na); const vT2 = formatCI(mT2?.value, mT2?.ci?.lower, mT2?.ci?.upper, dig, isP, na); return [nm, vAS, vT2]; }; rows = [ fRow('sens', 'Sensitivität'), fRow('spez', 'Spezifität'), fRow('ppv', 'PPV'), fRow('npv', 'NPV'), fRow('acc', 'Accuracy'), fRow('balAcc', 'Balanced Accuracy'), fRow('f1', 'F1-Score', false, 3), fRow('auc', 'AUC', false, 3) ].map(r => r.map(escMD)); }
            else if (tableType === 'praes_as_vs_t2_tests') { const { vergleich } = dataOrStats || {}; title = `Statistischer Vergleich (AS vs. ${escMD(t2CriteriaLabelShort)})`; if (!vergleich) return `# ${title} (Kollektiv: ${kollektivDisplayName})\n\nFehler: Ungültige Daten für Vergleichstests.`; headers = ['Test', 'Statistikwert', 'p-Wert', 'Methode']; const fP = (p) => (p !== null && !isNaN(p)) ? (p < APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_THRESHOLD_LESS_THAN ? `<${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_THRESHOLD_LESS_THAN, APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_TEXT, na, true)}` : formatNumber(p, APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_TEXT, na, true)) : na; rows = [ ['McNemar (Accuracy)', `${formatNumber(vergleich?.mcnemar?.statistic, 3, na)} (df=${vergleich?.mcnemar?.df || na})`, `${fP(vergleich?.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(vergleich?.mcnemar?.pValue)}`, `${vergleich?.mcnemar?.method || na}`], ['DeLong (AUC)', `Z=${formatNumber(vergleich?.delong?.Z, 3, na)}`, `${fP(vergleich?.delong?.pValue)} ${getStatisticalSignificanceSymbol(vergleich?.delong?.pValue)}`, `${vergleich?.delong?.method || na}`] ].map(r => r.map(escMD)); }
            else if (tableType === 'criteria_comparison') { title = `Vergleich diagnostischer Güte verschiedener Methoden`; const results = dataOrStats; if (!Array.isArray(results) || results.length === 0) return `# ${title} (Kollektiv: ${kollektivDisplayName})\n\nKeine Daten verfügbar.`; headers = ['Methode/Kriteriensatz', 'Sens.', 'Spez.', 'PPV', 'NPV', 'Acc.', 'AUC/BalAcc']; rows = results.map(r => { let name = r.name || 'Unbekannt'; if (r.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) name = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME; else if (r.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) name = APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME; let nameSuffix = ` (N=${r.specificKollektivN !== undefined ? r.specificKollektivN : (r.globalN || '?')})`; if (r.specificKollektivName && r.specificKollektivName !== kollektiv) { nameSuffix = ` (eval. auf ${getKollektivDisplayName(r.specificKollektivName)}, N=${r.specificKollektivN || '?'})` } return [`${name}${nameSuffix}`, formatPercent(r.sens, 1), formatPercent(r.spez, 1), formatPercent(r.ppv, 1), formatPercent(r.npv, 1), formatPercent(r.acc, 1), formatNumber(r.auc, 3)].map(escMD); }); }
            else { return `# Unbekannter Tabellentyp für Markdown: ${tableType}`; }
            const headerLine = `| ${headers.join(' | ')} |`; const separatorLine = `|${headers.map(() => '---').join('|')}|`; const bodyLines = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
            let metaInfo = `# ${title}`; if (!['daten', 'auswertung', 'praes_as_perf', 'criteria_comparison'].includes(tableType)) metaInfo += ` (Kollektiv: ${kollektivDisplayName})`; else if (tableType === 'criteria_comparison') metaInfo += ` (für Kollektiv: ${kollektivDisplayName})`; metaInfo += '\n'; if(criteria && logic && ['auswertung', 'deskriptiv'].includes(tableType)) metaInfo += `\n_T2-Basis (angewandt): ${escMD(formatCriteriaFunc(criteria, logic))}_\n\n`; else if (options.t2CriteriaLabelFull && ['praes_as_vs_t2_perf', 'praes_as_vs_t2_tests', 'praes_as_vs_t2_comp'].includes(tableType)) metaInfo += `\n_T2-Basis (Vergleich): ${escMD(options.t2CriteriaLabelFull)}_\n\n`; else metaInfo += '\n';
            return `${metaInfo}${headerLine}\n${separatorLine}\n${bodyLines}`;
        } catch (error) {
            console.error(`Fehler in generateMarkdownTableString for type ${tableType}:`, error);
            return `# Fehler bei der Generierung der Markdown-Tabelle für ${tableType}.`;
        }
   }

    function generateFilteredDataCSVString(data) {
       if (!Array.isArray(data) || data.length === 0) return null;
       try {
           const columns = ["nr", "name", "vorname", "geburtsdatum", "geschlecht", "alter", "therapie", "untersuchungsdatum", "n", "anzahl_patho_lk", "anzahl_patho_n_plus_lk", "as", "anzahl_as_lk", "anzahl_as_plus_lk", "t2", "anzahl_t2_lk", "anzahl_t2_plus_lk", "bemerkung"];
           const csvData = data.map(p => { const row = {}; columns.forEach(col => { row[col] = p[col] ?? ''; }); return row; });
           return Papa.unparse(csvData, { header: true, delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" });
       } catch (error) {
           console.error("Fehler in generateFilteredDataCSVString:", error);
           return null;
       }
   }

    function _generateFullPublicationMarkdownString(allKollektivStats, commonDataFromLogic, lang) {
        if (!allKollektivStats || !commonDataFromLogic || !lang) return "# Fehler: Fehlende Daten für Publikationsentwurf.";
        let fullMarkdown = `# Manuskriptentwurf: ${APP_CONFIG.APP_NAME} - ${getCurrentDateString('DD.MM.YYYY')}\n\n`;
        fullMarkdown += `**Sprache:** ${lang === 'de' ? 'Deutsch' : 'Englisch'}\n`;
        fullMarkdown += `**Optimierungsmetrik für T2 (Brute-Force) im Fokus:** ${commonDataFromLogic.bruteForceMetricForPublication}\n\n`;

        PUBLICATION_CONFIG.sections.forEach(mainSection => {
            fullMarkdown += `## ${UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey}\n\n`;
            mainSection.subSections.forEach(subSection => {
                fullMarkdown += `### ${subSection.label}\n\n`;
                const sectionText = publicationTextGenerator.getSectionTextAsMarkdown(subSection.id, lang, allKollektivStats, commonDataFromLogic);
                fullMarkdown += `${sectionText}\n\n`;

                // Add tables or chart references if they are part of this subsection's config
                const pubElements = PUBLICATION_CONFIG.publicationElements;
                if (subSection.id === 'methoden_t2_definition' && pubElements.methoden?.literaturT2KriterienTabelle) {
                    const tableId = pubElements.methoden.literaturT2KriterienTabelle.id;
                    const tableTitle = lang === 'de' ? pubElements.methoden.literaturT2KriterienTabelle.titleDe : pubElements.methoden.literaturT2KriterienTabelle.titleEn;
                    fullMarkdown += `*(Siehe ${tableTitle} - Tabelle wird dynamisch im Tab 'Publikation' generiert und muss ggf. manuell hier eingefügt oder als separate Datei exportiert werden.)*\n\n`;
                } else if (subSection.id === 'ergebnisse_patientencharakteristika' && pubElements.ergebnisse) {
                    const table1 = pubElements.ergebnisse.patientenCharakteristikaTabelle;
                    const fig1a = pubElements.ergebnisse.alterVerteilungChart;
                    const fig1b = pubElements.ergebnisse.geschlechtVerteilungChart;
                    fullMarkdown += `*(Siehe ${lang==='de'? table1.titleDe:table1.titleEn} - Tabelle wird dynamisch im Tab 'Publikation' generiert.)*\n\n`;
                    fullMarkdown += `*(Siehe ${lang==='de'? fig1a.titleDe:fig1a.titleEn} und ${lang==='de'? fig1b.titleDe:fig1b.titleEn} - Diagramme werden dynamisch im Tab 'Publikation' generiert.)*\n\n`;
                } else if (['ergebnisse_as_performance', 'ergebnisse_literatur_t2_performance', 'ergebnisse_optimierte_t2_performance', 'ergebnisse_vergleich_performance'].includes(subSection.id) && pubElements.ergebnisse) {
                    let tableConf;
                    if(subSection.id === 'ergebnisse_as_performance') tableConf = pubElements.ergebnisse.diagnostischeGueteASTabelle;
                    else if(subSection.id === 'ergebnisse_literatur_t2_performance') tableConf = pubElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle;
                    else if(subSection.id === 'ergebnisse_optimierte_t2_performance') tableConf = pubElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle;
                    else if(subSection.id === 'ergebnisse_vergleich_performance') tableConf = pubElements.ergebnisse.statistischerVergleichAST2Tabelle;
                    if(tableConf) {
                        const tableTitle = lang === 'de' ? tableConf.titleDe : tableConf.titleEn;
                        fullMarkdown += `*(Siehe ${tableTitle.replace('{BF_METRIC}', commonDataFromLogic.bruteForceMetricForPublication)} - Tabelle wird dynamisch im Tab 'Publikation' generiert.)*\n\n`;
                    }
                     if (subSection.id === 'ergebnisse_vergleich_performance') {
                         fullMarkdown += `*(Siehe ${lang==='de' ? pubElements.ergebnisse.vergleichPerformanceChartGesamt.titleDe : pubElements.ergebnisse.vergleichPerformanceChartGesamt.titleEn}, ${lang==='de' ? pubElements.ergebnisse.vergleichPerformanceChartDirektOP.titleDe : pubElements.ergebnisse.vergleichPerformanceChartDirektOP.titleEn}, und ${lang==='de' ? pubElements.ergebnisse.vergleichPerformanceChartNRCT.titleDe : pubElements.ergebnisse.vergleichPerformanceChartNRCT.titleEn} - Diagramme werden dynamisch im Tab 'Publikation' generiert.)*\n\n`;
                     }
                }
            });
        });
        return fullMarkdown;
    }

    function generateComprehensiveReportHTML(data, bfResultsForCurrentKollektiv, kollektiv, criteria, logic) {
        try {
            const allBruteForceResults = typeof bruteForceManager !== 'undefined' ? bruteForceManager.getAllResults() : ( bfResultsForCurrentKollektiv ? {[kollektiv]: bfResultsForCurrentKollektiv} : {} );
            const statsDataForAllKollektive = statisticsService.calculateAllStatsForPublication(data, criteria, logic, allBruteForceResults);

            if (!data || !statsDataForAllKollektive || !criteria || !logic) return '<html><head><title>Fehler</title></head><body>Fehler: Notwendige Daten für Report fehlen.</body></html>';

            const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'N/A';
            const config = APP_CONFIG.REPORT_SETTINGS; const kollektivName = getKollektivDisplayName(kollektiv); const timestamp = new Date().toLocaleString('de-DE', { dateStyle: 'long', timeStyle: 'medium'}); const criteriaString = formatCriteriaFunc(criteria, logic); const appliedCriteriaDisplayName = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME; let chartSVGs = {};
            
            const getChartSVGString = (chartId, chartTitleText = "Diagramm") => {
                const el = document.getElementById(chartId)?.querySelector('svg');
                if (!el) return `<p class="text-muted small">[Diagramm ${chartId} nicht renderbar/gefunden für Report]</p>`;
                try {
                    const clone = el.cloneNode(true);
                    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                    clone.setAttribute('version', '1.1');
                    clone.style.backgroundColor = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff';
                    
                    const viewBox = clone.getAttribute('viewBox')?.split(' ');
                    let width = clone.getAttribute('width') || (viewBox ? viewBox[2] : null) || '450';
                    let height = clone.getAttribute('height') || (viewBox ? viewBox[3] : null) || '300';
                    clone.setAttribute('width', width);
                    clone.setAttribute('height', height);

                    const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
                    styleEl.textContent = `
                        svg { font-family: ${APP_CONFIG.CHART_SETTINGS.RSNA_CHART_FONT_FAMILY || 'Arial, sans-serif'}; }
                        .axis path, .axis line { fill: none; stroke: ${APP_CONFIG.CHART_SETTINGS.CHART_AXIS_COLOR || '#333'}; shape-rendering: crispEdges; stroke-width: 1px; }
                        .axis text { font-size: ${APP_CONFIG.CHART_SETTINGS.RSNA_CHART_TICK_LABEL_FONT_SIZE || '9pt'}; fill: ${APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || '#000'}; }
                        .axis-label { font-size: ${APP_CONFIG.CHART_SETTINGS.RSNA_CHART_AXIS_LABEL_FONT_SIZE || '10pt'}; fill: ${APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || '#000'}; text-anchor: middle; }
                        .grid .tick { stroke: ${APP_CONFIG.CHART_SETTINGS.GRIDLINE_COLOR || '#ccc'}; stroke-opacity: 0.6; }
                        .grid path { stroke-width: 0; }
                        .legend text { font-size: ${APP_CONFIG.CHART_SETTINGS.RSNA_CHART_LEGEND_FONT_SIZE || '9pt'}; fill: ${APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || '#000'};}
                        .bar { opacity: 0.9; }
                        .roc-curve { fill: none; stroke-width: ${APP_CONFIG.CHART_SETTINGS.LINE_STROKE_WIDTH || 2}px; }
                        .reference-line { stroke: #adb5bd; stroke-width: 1px; stroke-dasharray: 4 2; }
                        .auc-label { font-weight: bold; font-size: ${APP_CONFIG.CHART_SETTINGS.AXIS_LABEL_FONT_SIZE || '11px'}; }
                        .title-text { font-size: ${APP_CONFIG.CHART_SETTINGS.RSNA_CHART_TITLE_FONT_SIZE || '12pt'}; font-weight: bold; text-anchor: middle; fill: ${APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || '#000'};}
                    `;
                    clone.prepend(styleEl);
                    return clone.outerHTML;
                } catch (e) { return `<p class="text-danger small">[Fehler beim Einbetten von Diagramm ${chartId}: ${e.message}]</p>`; }
            };

            const statsDataForCurrentKollektiv = statsDataForAllKollektive[kollektiv];

            if (config.INCLUDE_DESCRIPTIVES_CHARTS && statsDataForCurrentKollektiv?.deskriptiv) {
                 chartSVGs['chart-stat-age-0'] = getChartSVGString('chart-stat-age-0', UI_TEXTS.chartTitles.ageDistribution);
                 chartSVGs['chart-stat-gender-0'] = getChartSVGString('chart-stat-gender-0', UI_TEXTS.chartTitles.genderDistribution);
            }
            if (config.INCLUDE_AS_VS_T2_COMPARISON_CHART) {
                const praesCompChartElement = document.getElementById('praes-comp-chart-container');
                if(praesCompChartElement && praesCompChartElement.querySelector('svg')) {
                    chartSVGs['praes-comp-chart-container'] = getChartSVGString('praes-comp-chart-container', UI_TEXTS.chartTitles.comparisonBar.replace('{T2Name}', 'T2'));
                }
            }
            
            let html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>${config.REPORT_TITLE} - ${kollektivName}</title>`;
            html += `<style> body { font-family: sans-serif; font-size: 10pt; line-height: 1.4; padding: 25px; max-width: 800px; margin: auto; color: #212529; background-color: #fff;} h1, h2, h3 { color: #333; margin-top: 1.2em; margin-bottom: 0.6em; padding-bottom: 0.2em; border-bottom: 1px solid #ccc; page-break-after: avoid; } h1 { font-size: 16pt; border-bottom-width: 2px; } h2 { font-size: 14pt; } h3 { font-size: 12pt; font-weight: bold; border-bottom: none; margin-bottom: 0.4em; } table { border-collapse: collapse; width: 100%; margin-bottom: 1em; font-size: 9pt; page-break-inside: avoid; } th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; vertical-align: top; word-wrap: break-word; } th { background-color: #f2f2f2; font-weight: bold; } .chart-container { text-align: center; margin: 1em 0; page-break-inside: avoid; background-color: #fff; padding: 10px; border: 1px solid #eee; max-width: 100%; overflow: hidden; } .chart-container svg { max-width: 100%; height: auto; display: block; margin: auto; } .meta-info { background-color: #f9f9f9; border: 1px solid #eee; padding: 10px 15px; margin-bottom: 1.5em; font-size: 9pt; } .meta-info ul { list-style: none; padding: 0; margin: 0; } .meta-info li { margin-bottom: 0.3em; } .small { font-size: 8pt; } .text-muted { color: #6c757d; } ul { padding-left: 20px; margin-top: 0.5em;} li { margin-bottom: 0.2em; } .report-footer { margin-top: 2em; padding-top: 1em; border-top: 1px solid #ccc; font-size: 8pt; color: #888; text-align: center; } .no-print { display: none; } @media print { body { padding: 10px; } .meta-info { background-color: #fff; border: none; padding: 0 0 1em 0;} } </style></head><body>`;
            html += `<h1>${config.REPORT_TITLE}</h1>`; if (config.INCLUDE_APP_VERSION) html += `<p class="text-muted small">Generiert mit: ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION}</p>`; if (config.INCLUDE_GENERATION_TIMESTAMP) html += `<p class="text-muted small">Erstellt am: ${timestamp}</p>`;
            html += `<div class="meta-info"><h3>Analysekonfiguration</h3><ul>`; if (config.INCLUDE_KOLLEKTIV_INFO) html += `<li><strong>Analysiertes Kollektiv:</strong> ${kollektivName} (N=${statsDataForCurrentKollektiv?.deskriptiv?.anzahlPatienten || 0})</li>`; if (config.INCLUDE_T2_CRITERIA) html += `<li><strong>Angewandte T2-Kriterien ('${appliedCriteriaDisplayName}'):</strong> Logik: ${logic}, Kriterien: ${criteriaString}</li>`; html += `</ul></div>`;
            if (config.INCLUDE_DESCRIPTIVES_TABLE && statsDataForCurrentKollektiv?.deskriptiv) { html += `<h2>Deskriptive Statistik</h2>`; html += `<table><thead><tr><th>Metrik</th><th>Wert (Median)</th><th>Mean</th><th>SD</th><th>Min</th><th>Max</th></tr></thead><tbody>`; const d = statsDataForCurrentKollektiv.deskriptiv; const na = '--'; const fv = (v, dig = 1, useStd = false) => formatNumber(v, dig, na, useStd); const fP = (v, dig = 1) => formatPercent(v, dig, na); const addRowHTML = (l, vl=na, m=na, s=na, mn=na, mx=na) => `<tr><td>${l}</td><td>${vl}</td><td>${m}</td><td>${s}</td><td>${mn}</td><td>${mx}</td></tr>`; html += addRowHTML('Alter (Jahre)', fv(d.alter?.median, 1), fv(d.alter?.mean, 1), fv(d.alter?.sd, 1), fv(d.alter?.min, 0), fv(d.alter?.max, 0)); html += addRowHTML('Geschlecht Männlich (n / %)', `${d.geschlecht?.m ?? 0} / ${fP(d.anzahlPatienten > 0 ? (d.geschlecht?.m ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML('Therapie direkt OP (n / %)', `${d.therapie?.['direkt OP'] ?? 0} / ${fP(d.anzahlPatienten > 0 ? (d.therapie?.['direkt OP'] ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML('Therapie nRCT (n / %)', `${d.therapie?.nRCT ?? 0} / ${fP(d.anzahlPatienten > 0 ? (d.therapie?.nRCT ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML('N Status (+ / %)', `${d.nStatus?.plus ?? 0} / ${fP(d.anzahlPatienten > 0 ? (d.nStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML('AS Status (+ / %)', `${d.asStatus?.plus ?? 0} / ${fP(d.anzahlPatienten > 0 ? (d.asStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML('T2 Status (+ / %)', `${d.t2Status?.plus ?? 0} / ${fP(d.anzahlPatienten > 0 ? (d.t2Status?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`); const fLK = (lk) => `${fv(lk?.median,1)} (${fv(lk?.min,0)}-${fv(lk?.max,0)})`; html += addRowHTML('LK N gesamt (Median (Min-Max))', fLK(d.lkAnzahlen?.n?.total), fv(d.lkAnzahlen?.n?.total?.mean,1), fv(d.lkAnzahlen?.n?.total?.sd,1),fv(d.lkAnzahlen?.n?.total?.min,0), fv(d.lkAnzahlen?.n?.total?.max,0)); html += `</tbody></table>`; }
            if (config.INCLUDE_DESCRIPTIVES_CHARTS) { html += `<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 1em; justify-content: space-around;">`; if (chartSVGs['chart-stat-age-0']) html += `<div class="chart-container" style="flex: 1 1 45%; min-width: 300px;"><h3>Altersverteilung</h3>${chartSVGs['chart-stat-age-0']}</div>`; if (chartSVGs['chart-stat-gender-0']) html += `<div class="chart-container" style="flex: 1 1 45%; min-width: 300px;"><h3>Geschlechterverteilung</h3>${chartSVGs['chart-stat-gender-0']}</div>`; html += `</div>`; }
            const addPerfSectionHTML = (title, statsObj) => { if (!statsObj) return ''; let sHtml = `<h2>${title}</h2><table><thead><tr><th>Metrik</th><th>Wert (95% CI)</th><th>CI Methode</th></tr></thead><tbody>`; const fCI_local = (m, d=1, p=true) => formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, '--'); const na = '--'; sHtml += `<tr><td>Sensitivität</td><td>${fCI_local(statsObj.sens)}</td><td>${statsObj.sens?.method || na}</td></tr>`; sHtml += `<tr><td>Spezifität</td><td>${fCI_local(statsObj.spez)}</td><td>${statsObj.spez?.method || na}</td></tr>`; sHtml += `<tr><td>PPV</td><td>${fCI_local(statsObj.ppv)}</td><td>${statsObj.ppv?.method || na}</td></tr>`; sHtml += `<tr><td>NPV</td><td>${fCI_local(statsObj.npv)}</td><td>${statsObj.npv?.method || na}</td></tr>`; sHtml += `<tr><td>Accuracy</td><td>${fCI_local(statsObj.acc)}</td><td>${statsObj.acc?.method || na}</td></tr>`; sHtml += `<tr><td>Balanced Accuracy</td><td>${fCI_local(statsObj.balAcc)}</td><td>${statsObj.balAcc?.method || na}</td></tr>`; sHtml += `<tr><td>F1-Score</td><td>${fCI_local(statsObj.f1, APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_CSV, false)}</td><td>${statsObj.f1?.method || na}</td></tr>`; sHtml += `<tr><td>AUC</td><td>${fCI_local(statsObj.auc, APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_CSV, false)}</td><td>${statsObj.auc?.method || na}</td></tr>`; sHtml += `</tbody></table>`; return sHtml; };
            if (config.INCLUDE_AS_PERFORMANCE_TABLE && statsDataForCurrentKollektiv?.gueteAS) { html += addPerfSectionHTML('Diagnostische Güte: Avocado Sign (vs. N)', statsDataForCurrentKollektiv.gueteAS); }
            if (config.INCLUDE_T2_PERFORMANCE_TABLE && statsDataForCurrentKollektiv?.gueteT2_angewandt) { html += addPerfSectionHTML(`Diagnostische Güte: T2 ('${appliedCriteriaDisplayName}' vs. N)`, statsDataForCurrentKollektiv.gueteT2_angewandt); }
            if (config.INCLUDE_AS_VS_T2_COMPARISON_TABLE && statsDataForCurrentKollektiv?.vergleichASvsT2_angewandt) { html += `<h2>Statistischer Vergleich: AS vs. T2 ('${appliedCriteriaDisplayName}')</h2><table><thead><tr><th>Test</th><th>Statistik</th><th>p-Wert</th><th>Methode</th></tr></thead><tbody>`; const v = statsDataForCurrentKollektiv.vergleichASvsT2_angewandt; const fPValHTML = (p) => (p !== null && !isNaN(p)) ? (p < APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_THRESHOLD_LESS_THAN ? `&lt;${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_THRESHOLD_LESS_THAN, APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_CSV, '--', true)}` : formatNumber(p, APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_CSV, '--', true)) : '--'; const na = '--'; html += `<tr><td>Accuracy (McNemar)</td><td>${formatNumber(v?.mcnemar?.statistic, 3, na, true)} (df=${v?.mcnemar?.df || na})</td><td>${fPValHTML(v?.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(v?.mcnemar?.pValue)}</td><td>${v?.mcnemar?.method || na}</td></tr>`; html += `<tr><td>AUC (DeLong)</td><td>Z=${formatNumber(v?.delong?.Z, 3, na, true)}</td><td>${fPValHTML(v?.delong?.pValue)} ${getStatisticalSignificanceSymbol(v?.delong?.pValue)}</td><td>${v?.delong?.method || na}</td></tr>`; html += `</tbody></table>`; }
            if (config.INCLUDE_AS_VS_T2_COMPARISON_CHART) { const chartKey = Object.keys(chartSVGs).find(k => k.startsWith('praes-comp-chart')); if(chartSVGs[chartKey]) { html += `<div class="chart-container"><h3>Vergleich ausgewählter Metriken (AS vs T2 - '${appliedCriteriaDisplayName}')</h3>${chartSVGs[chartKey]}</div>`; } }
            const currentKollektivBfResult = allBruteForceResults ? allBruteForceResults[kollektiv] : null;
            if (config.INCLUDE_BRUTEFORCE_BEST_RESULT && currentKollektivBfResult?.results && currentKollektivBfResult.results.length > 0 && currentKollektivBfResult.bestResult) { html += `<h2>Bestes Brute-Force Ergebnis (für Kollektiv: ${kollektivName})</h2><div class="meta-info"><ul>`; const best = currentKollektivBfResult.bestResult; html += `<li><strong>Optimierte Metrik:</strong> ${currentKollektivBfResult.metric}</li><li><strong>Bester Wert:</strong> ${formatNumber(best.metricValue, 4, '--', true)}</li><li><strong>Logik:</strong> ${best.logic?.toUpperCase()}</li><li><strong>Kriterien:</strong> ${formatCriteriaFunc(best.criteria, best.logic)}</li></ul><p class="small text-muted">Kollektiv N=${formatNumber(currentKollektivBfResult.nGesamt, 0, 'N/A')} (N+: ${formatNumber(currentKollektivBfResult.nPlus, 0, 'N/A')}, N-: ${formatNumber(currentKollektivBfResult.nMinus, 0, 'N/A')})</p></div>`; }
            html += `<div class="report-footer">${config.REPORT_AUTHOR.replace("2.3.0", APP_CONFIG.APP_VERSION)} - ${timestamp}</div></body></html>`; return html;
        } catch (error) {
             console.error("Fehler in generateComprehensiveReportHTML:", error);
             return '<html><head><title>Fehler</title></head><body>Fehler bei der Reporterstellung.</body></html>';
        }
    }

    async function convertTableToPngBlob(tableElementId, baseWidth = 800) {
        const scale = APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE || 2;
        return new Promise((resolve, reject) => {
            const table = document.getElementById(tableElementId);
            if (!table || !(table instanceof HTMLTableElement)) return reject(new Error(`Tabelle mit ID '${tableElementId}' nicht gefunden.`));
            try {
                 if (!window.html2canvas) {
                     console.warn("html2canvas nicht verfügbar. Tabellen-PNG-Export könnte unvollständig sein.");
                     return reject(new Error("html2canvas nicht verfügbar."));
                 }
                html2canvas(table, {
                    scale: scale,
                    backgroundColor: APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff',
                    logging: false,
                    useCORS: true,
                    windowWidth: table.scrollWidth,
                    windowHeight: table.scrollHeight,
                    width: table.offsetWidth,
                    height: table.offsetHeight
                }).then(canvas => {
                    canvas.toBlob((blob) => {
                        if (blob) { resolve(blob); }
                        else { reject(new Error("Canvas toBlob für Tabelle fehlgeschlagen.")); }
                    }, 'image/png');
                }).catch(err => reject(err));
            } catch (error) { reject(error); }
        });
    }

    function exportStatistikCSV(data, kollektiv, criteria, logic) {
        let stats = null, csvString = null;
        const allBruteForceResults = typeof bruteForceManager !== 'undefined' ? bruteForceManager.getAllResults() : {};
        try { stats = statisticsService.calculateAllStatsForPublication(data, criteria, logic, allBruteForceResults)[kollektiv]; } catch(e) { ui_helpers.showToast("Fehler bei Statistikberechnung für CSV.", "danger"); return; }
        if (!stats) { ui_helpers.showToast("Keine Statistikdaten zum Exportieren für dieses Kollektiv.", "warning"); return; }
        try { csvString = generateStatistikCSVString(stats, kollektiv, criteria, logic); } catch(e) { ui_helpers.showToast("Fehler bei CSV-Erstellung.", "danger"); return; }
        if (csvString === null || csvString.length === 0) { ui_helpers.showToast("CSV-Generierung ergab leere Datei.", "warning"); return; }
        const filename = generateFilename('STATS_CSV', kollektiv, 'csv');
        if(downloadFile(csvString, filename, 'text/csv;charset=utf-8;')) ui_helpers.showToast(`Statistik als CSV exportiert: ${filename}`, 'success');
    }

    function exportBruteForceReport(resultsData) {
        if (!resultsData || !resultsData.results || resultsData.results.length === 0) {
             ui_helpers.showToast("Keine Brute-Force Ergebnisse zum Exportieren vorhanden.", "warning");
             return;
        }
        let txtString = null;
        try {
            txtString = generateBruteForceTXTString(resultsData);
        } catch(e) {
            ui_helpers.showToast("Fehler bei TXT-Erstellung.", "danger");
            return;
        }
        if (txtString === null || txtString.length === 0) {
            ui_helpers.showToast("TXT-Generierung ergab leere Datei.", "warning");
            return;
        }
        const filename = generateFilename('BRUTEFORCE_TXT', resultsData.kollektiv, 'txt');
        if(downloadFile(txtString, filename, 'text/plain;charset=utf-8;')) {
            ui_helpers.showToast(`Brute-Force Bericht exportiert: ${filename}`, 'success');
        }
    }


    function exportTableMarkdown(dataOrStats, tableType, kollektiv, criteria = null, logic = null, options = {}) {
        let mdString = null; let typeKey = `UnknownTable_${tableType}_MD`, title = tableType;
        try { mdString = generateMarkdownTableString(dataOrStats, tableType, kollektiv, criteria, logic, options); } catch(e) { ui_helpers.showToast(`Fehler bei MD-Erstellung (${tableType}).`, "danger"); return; }
        if (mdString === null || mdString.length === 0) { ui_helpers.showToast(`MD-Generierung ergab leere Datei (${tableType}).`, "warning"); return; }

        if(tableType === 'daten') { typeKey = 'DATEN_MD'; title = 'Datenliste'; }
        else if(tableType === 'auswertung') { typeKey = 'AUSWERTUNG_MD'; title = 'Auswertungstabelle'; }
        else if(tableType === 'deskriptiv') { typeKey = 'DESKRIPTIV_MD'; title = 'Deskriptive Statistik'; }
        else if(tableType === 'praes_as_perf') { typeKey = 'PRAES_AS_PERF_MD'; title = 'AS Performance'; }
        else if(tableType === 'praes_as_vs_t2_perf' || tableType === 'praes_as_vs_t2_comp') { typeKey = 'PRAES_AS_VS_T2_COMP_MD'; title = 'AS vs T2 Metriken'; }
        else if(tableType === 'praes_as_vs_t2_tests') { typeKey = 'PRAES_AS_VS_T2_TESTS_MD'; title = 'AS vs T2 Tests'; }
        else if(tableType === 'criteria_comparison') { typeKey = 'CRITERIA_COMPARISON_MD'; title = 'Kriterienvergleich'; }
        else if(tableType === 'publikation_methoden') { typeKey = 'PUBLIKATION_METHODEN_MD'; title = `Publikation ${options.sectionName || 'Methoden'}`; }
        else if(tableType === 'publikation_ergebnisse') { typeKey = 'PUBLIKATION_ERGEBNISSE_MD'; title = `Publikation ${options.sectionName || 'Ergebnisse'}`; }
        else if(tableType === 'publikation_gesamt') { typeKey = 'PUBLIKATION_GESAMT_MD'; title = 'Publikation Gesamtentwurf'; }


        const filename = generateFilename(typeKey, kollektiv, 'md', { studyId: options?.comparisonCriteriaSet?.id, sectionName: options?.sectionName });
        if(downloadFile(mdString, filename, 'text/markdown;charset=utf-8;')) ui_helpers.showToast(`${title} als Markdown exportiert: ${filename}`, 'success');
    }

    function exportFilteredDataCSV(data, kollektiv) {
       let csvString = null;
       try { csvString = generateFilteredDataCSVString(data); } catch(e) { ui_helpers.showToast("Fehler bei Rohdaten-CSV-Erstellung.", "danger"); return; }
       if (csvString === null || csvString.length === 0) { ui_helpers.showToast("Rohdaten-CSV-Generierung ergab leere Datei.", "warning"); return; }
       const filename = generateFilename('FILTERED_DATA_CSV', kollektiv, 'csv');
       if(downloadFile(csvString, filename, 'text/csv;charset=utf-8;')) ui_helpers.showToast(`Gefilterte Daten als CSV exportiert: ${filename}`, 'success');
   }

    function exportComprehensiveReportHTML(data, bfResultsForCurrentKollektiv, kollektiv, criteria, logic) {
        let htmlString = null;
        try { htmlString = generateComprehensiveReportHTML(data, bfResultsForCurrentKollektiv, kollektiv, criteria, logic); } catch(e) { ui_helpers.showToast("Fehler bei HTML-Report-Erstellung.", "danger"); return; }
        if (htmlString === null || htmlString.length === 0) { ui_helpers.showToast("HTML-Report-Generierung ergab leere Datei.", "warning"); return; }
        const filename = generateFilename('COMPREHENSIVE_REPORT_HTML', kollektiv, 'html');
        if(downloadFile(htmlString, filename, 'text/html;charset=utf-8;')) ui_helpers.showToast(`Umfassender Bericht exportiert: ${filename}`, 'success');
    }

    async function exportSingleChart(chartElementId, format, kollektiv, options = {}) {
         const svgElement = document.getElementById(chartElementId)?.querySelector('svg'); if (!svgElement) { ui_helpers.showToast(`Diagramm '${chartElementId}' für Export nicht gefunden.`, 'danger'); return; }
         const chartName = options.chartName || chartElementId.replace(/^chart-/, '').replace(/-container$/, '').replace(/-content$/, '').replace(/-[0-9]+$/, '');
         try {
             let blob = null, filenameKey, mimeType, ext;
             if (format === 'png') { ui_helpers.showToast(`Generiere PNG für Chart ${chartName}...`, 'info', 1500); blob = await convertSvgToPngBlob(svgElement, APP_CONFIG.EXPORT_SETTINGS.CHART_PNG_TARGET_WIDTH || 1000, options); filenameKey = 'CHART_SINGLE_PNG'; mimeType = 'image/png'; ext = 'png'; }
             else if (format === 'svg') { ui_helpers.showToast(`Generiere SVG für Chart ${chartName}...`, 'info', 1500); blob = await convertSvgToSvgBlob(svgElement, options); filenameKey = 'CHART_SINGLE_SVG'; mimeType = 'image/svg+xml;charset=utf-8'; ext = 'svg'; }
             else { throw new Error(`Ungültiges Exportformat: ${format}`); }
             if (blob) {
                const filename = generateFilename(filenameKey, kollektiv, ext, { chartName, ...options });
                if (downloadFile(blob, filename, mimeType)) ui_helpers.showToast(`Chart ${chartName} als ${format.toUpperCase()} exportiert.`, 'success');
             } else {
                 throw new Error("Blob-Generierung fehlgeschlagen.");
             }
         } catch (error) { console.error(`Fehler beim Chart-Export (${chartName}, ${format}):`, error); ui_helpers.showToast(`Fehler beim Chart-Export (${format.toUpperCase()}).`, 'danger'); }
    }

     async function exportTablePNG(tableElementId, kollektiv, typeKey, tableName = 'Tabelle') {
         ui_helpers.showToast(`Generiere PNG für Tabelle ${tableName}...`, 'info', 1500);
         try {
             const tableElement = document.getElementById(tableElementId);
             if (!tableElement) throw new Error(`Tabelle ${tableElementId} nicht gefunden.`);
             const baseWidth = tableElement.offsetWidth || 800;
             const blob = await convertTableToPngBlob(tableElementId, baseWidth);
             if (blob) {
                const filename = generateFilename(typeKey, kollektiv, 'png', {tableName: tableName, tableId: tableElementId});
                if(downloadFile(blob, filename, 'image/png')) ui_helpers.showToast(`Tabelle '${tableName}' als PNG exportiert.`, 'success');
             } else {
                throw new Error("Tabellen-Blob-Generierung fehlgeschlagen.");
             }
         } catch(error) { console.error(`Fehler beim Tabellen-PNG-Export für '${tableName}':`, error); ui_helpers.showToast(`Fehler beim Tabellen-PNG-Export für '${tableName}'. Grund: ${error.message}`, 'danger'); }
     }

    async function exportChartsZip(scopeSelector, zipTypeKey, kollektiv, format) {
         ui_helpers.showToast(`Starte ${format.toUpperCase()}-Export für sichtbare Charts & Tabellen...`, 'info', 2000);
         if (!window.JSZip) { ui_helpers.showToast("JSZip Bibliothek nicht geladen.", "danger"); return; }
         const zip = new JSZip(); const promises = []; let successCount = 0;
         const chartContainers = document.querySelectorAll(scopeSelector + ' [id^="chart-"][style*="height"] svg'); // Sucht nach SVGs in Containern mit ID "chart-"
         const tableSelectors = [ // Selektoren für Tabellen, die als PNG exportiert werden sollen
            scopeSelector + ' table[id^="table-"]', // Alle Tabellen mit ID, die mit "table-" beginnt
            scopeSelector + ' table#auswertung-table',
            scopeSelector + ' table#daten-table',
            scopeSelector + ' table#bruteforce-results-table',
            scopeSelector + ' table#praes-as-vs-t2-comp-table',
            scopeSelector + ' table#praes-as-vs-t2-test-table',
            scopeSelector + ' table#praes-as-pur-perf-table',
            scopeSelector + ' table#table-kriterien-vergleich',
            // Spezifische Tabellen aus dem Publikationstab (deren IDs sind in PUBLICATION_CONFIG definiert)
            `#${PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id}`,
            `#${PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id}`,
            `#${PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.id}`,
            `#${PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id}`,
            `#${PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id}`,
            `#${PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.id}`
         ];
         const tableContainers = (format === 'png' && APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT) ? Array.from(document.querySelectorAll(tableSelectors.join(', '))).filter(el => el) : [];


         if (chartContainers.length === 0 && tableContainers.length === 0) { ui_helpers.showToast('Keine Diagramme oder Tabellen im aktuellen Sichtbereich gefunden.', 'warning'); return; }

         chartContainers.forEach((svgElement, index) => {
             const chartContainerDiv = svgElement.closest('[id^="chart-"]');
             const chartId = chartContainerDiv?.id || `chart_export_${index + 1}`;
             let chartName = chartContainerDiv?.closest('.card')?.querySelector('.card-header > span:first-child')?.textContent?.trim() ||
                             chartContainerDiv?.closest('.chart-container')?.querySelector('h5')?.textContent?.trim() ||
                             chartId.replace(/^chart-/, '').replace(/-container$/, '').replace(/-content$/, '').replace(/-[0-9]+$/, '');
             chartName = chartName.replace(/\s*\(.*?\)\s*/g, '').trim(); // Remove text in parentheses like (Gesamtkollektiv)
             
             let filenameKey, conversionPromise, ext;
             const exportOptions = { chartName, backgroundColor: APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR };

             if (format === 'png') { filenameKey = 'CHART_SINGLE_PNG'; ext = 'png'; conversionPromise = convertSvgToPngBlob(svgElement, APP_CONFIG.EXPORT_SETTINGS.CHART_PNG_TARGET_WIDTH || 1000, exportOptions).catch(e => { console.error(`PNG Konvertierung für ${chartName} fehlgeschlagen:`, e); return null; }); }
             else if (format === 'svg') { filenameKey = 'CHART_SINGLE_SVG'; ext = 'svg'; conversionPromise = convertSvgToSvgBlob(svgElement, exportOptions).catch(e => { console.error(`SVG Konvertierung für ${chartName} fehlgeschlagen:`, e); return null; }); }
             else { return; }
             const filename = generateFilename(filenameKey, kollektiv, ext, { chartName });
             promises.push(conversionPromise.then(blob => (blob ? { blob, filename } : { error: new Error("Blob is null for chart"), filename })));
         });

         tableContainers.forEach((table, index) => {
              if (format !== 'png' || !table.id) return; // Tabelle muss eine ID haben
              let tableName = table.closest('.card')?.querySelector('.card-header > span:first-child')?.textContent?.trim() || table.caption?.textContent?.trim() || table.id;
              tableName = tableName.replace(/\s*\(.*?\)\s*/g, '').trim(); // Remove text in parentheses
              const typeKey = 'TABLE_PNG_EXPORT';
              const filename = generateFilename(typeKey, kollektiv, 'png', {tableName, tableId: table.id});
              const baseWidth = table.offsetWidth || 800;
              promises.push(convertTableToPngBlob(table.id, baseWidth).catch(e => { console.error(`Tabellen-PNG Konvertierung für ${tableName} fehlgeschlagen:`, e); return null; }).then(blob => (blob ? { blob, filename } : { error: new Error("Table Blob is null"), filename })));
         });

         try {
             const results = await Promise.all(promises);
             results.forEach(result => { if (result && result.blob) { zip.file(result.filename, result.blob); successCount++; } else if (result && result.error) { console.error(`Fehler bei Konvertierung für ${result.filename}:`, result.error); } });
             if (successCount > 0) {
                 const zipFilename = generateFilename(zipTypeKey, kollektiv, 'zip'); const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
                 if (downloadFile(content, zipFilename, "application/zip")) ui_helpers.showToast(`${successCount} Objekt(e) erfolgreich als ${format.toUpperCase()} exportiert (ZIP).`, 'success');
             } else { ui_helpers.showToast(`Export (${format.toUpperCase()}) fehlgeschlagen: Keine Objekte konnten konvertiert werden.`, 'danger'); }
         } catch (error) { console.error(`Fehler beim Erstellen des ${format.toUpperCase()} ZIPs:`, error); ui_helpers.showToast(`Fehler beim Erstellen des ${format.toUpperCase()} ZIPs.`, 'danger'); }
     }

     async function exportCategoryZip(category, globalRawData, bruteForceResults, currentKollektiv, appliedCriteria, appliedLogic) {
         ui_helpers.showToast(`Generiere ${category.toUpperCase()} ZIP-Paket...`, 'info', 2000);
          if (!window.JSZip) { ui_helpers.showToast("JSZip Bibliothek nicht geladen.", "danger"); return; }
         const zip = new JSZip(); let filesAdded = 0; let statsDataForAllKollektive = null;

         const needsStats = ['all-zip', 'csv-zip', 'md-zip', 'html', 'publication-gesamt-md'].includes(category);
         if(needsStats && globalRawData && globalRawData.length > 0 && appliedCriteria && appliedLogic) {
             try {
                statsDataForAllKollektive = statisticsService.calculateAllStatsForPublication(globalRawData, appliedCriteria, appliedLogic, bruteForceResults);
             } catch(e) { ui_helpers.showToast(`Fehler bei Statistikberechnung für ${category.toUpperCase()} ZIP.`, 'danger'); return; }
             if (!statsDataForAllKollektive || !statsDataForAllKollektive[currentKollektiv]) {
                 ui_helpers.showToast(`Statistikberechnung ergab keine Daten für ${category.toUpperCase()} ZIP für Kollektiv ${getKollektivDisplayName(currentKollektiv)}.`, 'warning');
                 if (['csv-zip', 'html', 'publication-gesamt-md'].includes(category) && category !== 'md-zip') return; // MD-Zip kann noch Basis-Tabellen enthalten
             }
         }
         const currentKollektivStats = statsDataForAllKollektive ? statsDataForAllKollektive[currentKollektiv] : null;
         const currentKollektivBfResult = bruteForceResults ? bruteForceResults[currentKollektiv] : null;
         const currentKollektivFilteredData = dataProcessor.filterDataByKollektiv(globalRawData, currentKollektiv);
         const currentKollektivEvaluatedData = t2CriteriaManager.evaluateDataset(cloneDeep(currentKollektivFilteredData), appliedCriteria, appliedLogic);


         const addFile = (filename, content) => { if (content !== null && content !== undefined && String(content).length > 0) { zip.file(filename, content); filesAdded++; return true; } console.warn(`Überspringe leere oder ungültige Datei: ${filename}`); return false; };
         try {
             if (['all-zip', 'csv-zip'].includes(category)) {
                 if (currentKollektivStats) addFile(generateFilename('STATS_CSV', currentKollektiv, 'csv'), generateStatistikCSVString(currentKollektivStats, currentKollektiv, appliedCriteria, appliedLogic));
                 if (currentKollektivFilteredData.length > 0) addFile(generateFilename('FILTERED_DATA_CSV', currentKollektiv, 'csv'), generateFilteredDataCSVString(currentKollektivFilteredData));
             }
             if (['all-zip', 'md-zip'].includes(category)) {
                 if (currentKollektivStats?.deskriptiv) addFile(generateFilename('DESKRIPTIV_MD', currentKollektiv, 'md'), generateMarkdownTableString(currentKollektivStats.deskriptiv, 'deskriptiv', currentKollektiv));
                 if (currentKollektivFilteredData.length > 0) addFile(generateFilename('DATEN_MD', currentKollektiv, 'md'), generateMarkdownTableString(currentKollektivFilteredData, 'daten', currentKollektiv));
                 if (currentKollektivEvaluatedData.length > 0) addFile(generateFilename('AUSWERTUNG_MD', currentKollektiv, 'md'), generateMarkdownTableString(currentKollektivEvaluatedData, 'auswertung', currentKollektiv, appliedCriteria, appliedLogic));
             }
             if (['all-zip', 'md-zip', 'publication-gesamt-md'].includes(category) && category === 'publication-gesamt-md' || category === 'all-zip' || category === 'md-zip') { // Ensure it's also added to general md-zip
                if (typeof publicationTextGenerator !== 'undefined' && statsDataForAllKollektive && state) {
                    const commonDataForPub = {
                        appName: APP_CONFIG.APP_NAME, appVersion: APP_CONFIG.APP_VERSION,
                        nGesamt: statsDataForAllKollektive.Gesamt?.deskriptiv?.anzahlPatienten || 0,
                        nDirektOP: statsDataForAllKollektive['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
                        nNRCT: statsDataForAllKollektive.nRCT?.deskriptiv?.anzahlPatienten || 0,
                        significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
                        references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
                        bruteForceMetricForPublication: state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication
                    };
                    const fullPubMd = _generateFullPublicationMarkdownString(statsDataForAllKollektive, commonDataForPub, state.getCurrentPublikationLang());
                    addFile(generateFilename('PUBLIKATION_GESAMT_MD', currentKollektiv, 'md'), fullPubMd);
                }
             }
             if (['all-zip'].includes(category) && currentKollektivBfResult) { addFile(generateFilename('BRUTEFORCE_TXT', currentKollektiv, 'txt'), generateBruteForceTXTString(currentKollektivBfResult)); }
             if (['all-zip', 'html'].includes(category) && globalRawData.length > 0 ) { addFile(generateFilename('COMPREHENSIVE_REPORT_HTML', currentKollektiv, 'html'), generateComprehensiveReportHTML(globalRawData, currentKollektivBfResult, currentKollektiv, appliedCriteria, appliedLogic)); }

             if (['png-zip'].includes(category)) { await exportChartsZip('#app-container', 'PNG_ZIP', currentKollektiv, 'png'); return; }
             if (['svg-zip'].includes(category)) { await exportChartsZip('#app-container', 'SVG_ZIP', currentKollektiv, 'svg'); return; }


            if (filesAdded > 0) {
                const zipFilename = generateFilename(`${category.toUpperCase().replace(/-/g,'_')}_PAKET`, currentKollektiv, 'zip');
                const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
                if (downloadFile(content, zipFilename, "application/zip")) ui_helpers.showToast(`${filesAdded} Datei(en) erfolgreich im ${category.toUpperCase()} ZIP-Paket exportiert.`, 'success');
            } else { ui_helpers.showToast(`Keine Dateien für das ${category.toUpperCase()} ZIP-Paket gefunden oder generiert.`, 'warning'); }
         } catch (error) { console.error(`Fehler beim Erstellen des ${category.toUpperCase()} ZIP-Pakets:`, error); ui_helpers.showToast(`Fehler beim Erstellen des ${category.toUpperCase()} ZIP-Pakets.`, 'danger'); }
     }

     function exportPraesentationData(actionId, presentationData, kollektiv) {
            let content = null, filenameKey = null, extension = null, mimeType = null, options = {}, success = false; const na = '--';
            if (!presentationData) { ui_helpers.showToast("Keine Daten für Präsentationsexport verfügbar.", "warning"); return; }

            const { statsAS, statsT2, vergleich, comparisonCriteriaSet, kollektivForComparison, patientCountForComparison, t2CriteriaLabelShort, t2CriteriaLabelFull, statsGesamt, statsDirektOP, statsNRCT } = presentationData;
            const isAsPurView = actionId.includes('-as-pur-');
            const isAsVsT2View = actionId.includes('-as-vs-t2-');
            options.studyId = comparisonCriteriaSet?.id || null;

            if (presentationData.t2CriteriaLabelShort) options.t2CriteriaLabelShort = presentationData.t2CriteriaLabelShort;
            if (presentationData.t2CriteriaLabelFull) options.t2CriteriaLabelFull = presentationData.t2CriteriaLabelFull;
            
            // Das Kollektiv für den Dateinamen sollte dem Kontext des Exports entsprechen
            const exportKollektiv = isAsVsT2View ? (kollektivForComparison || kollektiv) : kollektiv;


            try {
                if (isAsPurView && actionId === 'download-performance-as-pur-csv') {
                     const allStatsData = { Gesamt: statsGesamt, 'direkt OP': statsDirektOP, nRCT: statsNRCT }; const headers = ['Kollektiv', 'N', 'Sens', 'Sens CI Low', 'Sens CI High', 'Spez', 'Spez CI Low', 'Spez CI High', 'PPV', 'PPV CI Low', 'PPV CI High', 'NPV', 'NPV CI Low', 'NPV CI High', 'Acc', 'Acc CI Low', 'Acc CI High', 'BalAcc', 'BalAcc CI Low', 'BalAcc CI High', 'F1', 'F1 CI Low', 'F1 CI High', 'AUC', 'AUC CI Low', 'AUC CI High', 'CI Method']; const fVal = (v, d=1, useStd = true) => formatNumber(v, d, na, useStd);
                     const rows = Object.entries(allStatsData).map(([key, stats]) => { if (!stats || typeof stats.matrix !== 'object') return [getKollektivDisplayName(key), 0, ...Array(21).fill(na), na]; const n = stats.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : 0; const fRowData = (m, metric_k) => { const dig = (metric_k === 'f1' || metric_k === 'auc') ? APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_CSV : 1; return [fVal(m?.value, dig), fVal(m?.ci?.lower, dig), fVal(m?.ci?.upper, dig)]; }; return [ getKollektivDisplayName(key), n, ...fRowData(stats.sens, 'sens'), ...fRowData(stats.spez, 'spez'), ...fRowData(stats.ppv, 'ppv'), ...fRowData(stats.npv, 'npv'), ...fRowData(stats.acc, 'acc'), ...fRowData(stats.balAcc, 'balAcc'), ...fRowData(stats.f1, 'f1'), ...fRowData(stats.auc, 'auc'), stats.sens?.method || na ]; });
                     content = Papa.unparse([headers, ...rows], { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" }); filenameKey = 'PRAES_AS_PERF_CSV'; extension = 'csv'; mimeType = 'text/csv;charset=utf-8;';
                } else if (isAsPurView && actionId === 'download-performance-as-pur-md') { content = generateMarkdownTableString(presentationData, 'praes_as_perf', exportKollektiv, null, null, options); filenameKey = 'PRAES_AS_PERF_MD'; extension = 'md'; mimeType = 'text/markdown;charset=utf-8;';
                } else if (isAsVsT2View && actionId === 'download-performance-as-vs-t2-csv') { if (!statsAS || !statsT2) { ui_helpers.showToast("Vergleichsdaten für CSV fehlen.", "warning"); return; } const headers = ['Metrik', 'AS (Wert)', 'AS (95% CI)', `${t2CriteriaLabelShort || 'T2'} (Wert)`, `${t2CriteriaLabelShort || 'T2'} (95% CI)`, 'CI Methode AS', 'CI Methode T2']; const fRow = (mKey, nm, isP = true, d = 1) => { const mAS = statsAS[mKey]; const mT2 = statsT2[mKey]; const dig = (mKey === 'auc' || mKey === 'f1') ? APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_CSV : d; const ciAS = `(${formatNumber(mAS?.ci?.lower, dig, na, true)} - ${formatNumber(mAS?.ci?.upper, dig, na, true)})`; const ciT2 = `(${formatNumber(mT2?.ci?.lower, dig, na, true)} - ${formatNumber(mT2?.ci?.upper, dig, na, true)})`; const valAS = formatNumber(mAS?.value, dig, na, true); const valT2 = formatNumber(mT2?.value, dig, na, true); return [nm, valAS, ciAS, valT2, ciT2, mAS?.method || na, mT2?.method || na]; }; const rows = [ fRow('sens', 'Sensitivität'), fRow('spez', 'Spezifität'), fRow('ppv', 'PPV'), fRow('npv', 'NPV'), fRow('acc', 'Accuracy'), fRow('balAcc', 'Balanced Accuracy'), fRow('f1', 'F1-Score', false, 3), fRow('auc', 'AUC', false, 3) ]; content = Papa.unparse([headers, ...rows], { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" }); filenameKey = 'PRAES_AS_VS_T2_PERF_CSV'; extension = 'csv'; mimeType = 'text/csv;charset=utf-8;';
                } else if (isAsVsT2View && actionId === 'download-comp-table-as-vs-t2-md') { content = generateMarkdownTableString(presentationData, 'praes_as_vs_t2_comp', exportKollektiv, null, null, options); filenameKey = 'PRAES_AS_VS_T2_COMP_MD'; extension = 'md'; mimeType = 'text/markdown;charset=utf-8;';
                } else if (isAsVsT2View && actionId === 'download-tests-as-vs-t2-md') { content = generateMarkdownTableString(presentationData, 'praes_as_vs_t2_tests', exportKollektiv, null, null, options); filenameKey = 'PRAES_AS_VS_T2_TESTS_MD'; extension = 'md'; mimeType = 'text/markdown;charset=utf-8;';
                }
            } catch(error) {
                console.error(`Fehler bei Präsentationsexport ${actionId}:`, error);
                ui_helpers.showToast(`Fehler bei Präsentationsexport (${actionId}).`, "danger");
                return;
            }

            if(content !== null && filenameKey && extension && mimeType) { const filename = generateFilename(filenameKey, exportKollektiv, extension, options); success = downloadFile(content, filename, mimeType); if(success) ui_helpers.showToast(`Präsentationsdaten (${extension}) exportiert: ${filename}`, 'success'); }
            else if(!actionId.includes('-chart-') && !actionId.startsWith('dl-praes-')) { ui_helpers.showToast("Export für diese Option nicht verfügbar oder Daten fehlen/Fehler bei Generierung.", "warning"); }
      }

    return Object.freeze({
        exportStatistikCSV,
        exportBruteForceReport,
        exportTableMarkdown,
        exportFilteredDataCSV,
        exportComprehensiveReportHTML,
        exportSingleChart,
        exportTablePNG,
        exportChartsZip,
        exportCategoryZip,
        exportPraesentationData,
        generateFilename // Auch extern verfügbar machen, falls nützlich
    });

})();
