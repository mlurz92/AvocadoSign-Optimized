const exportService = (() => {

    function generateFilename(typeKey, kollektiv, extension, options = {}) {
        const langForFilename = options.lang || 'de'; // Use provided lang or default to 'de' for display name
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(kollektiv, langForFilename).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
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
        
        let filename = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE
            .replace('{TYPE}', filenameType)
            .replace('{KOLLEKTIV}', safeKollektiv)
            .replace('{DATE}', dateStr)
            .replace('{EXT}', extension);
        
        if (options.lang && options.lang !== 'de' && APP_CONFIG.EXPORT_SETTINGS.APPEND_LANG_TO_FILENAME) {
            filename = filename.replace(`.${extension}`, `_${options.lang}.${extension}`);
        }

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

    async function convertSvgToPngBlob(svgElement, targetWidth = 800) {
        return new Promise((resolve, reject) => {
            if (!svgElement || typeof svgElement.cloneNode !== 'function') {
                return reject(new Error("Ungültiges SVG Element für PNG Konvertierung."));
            }
            try {
                const svgClone = svgElement.cloneNode(true);
                svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                svgClone.setAttribute('version', '1.1');
                svgClone.style.backgroundColor = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff';
                const styles = getComputedStyle(svgElement);
                const viewBox = svgElement.viewBox?.baseVal;
                let sourceWidth = parseFloat(svgClone.getAttribute('width')) || parseFloat(styles.width) || svgElement.width?.baseVal?.value || viewBox?.width || targetWidth;
                let sourceHeight = parseFloat(svgClone.getAttribute('height')) || parseFloat(styles.height) || svgElement.height?.baseVal?.value || viewBox?.height || (targetWidth * 0.75);

                if (sourceWidth <= 0 || sourceHeight <= 0) { sourceWidth = viewBox?.width || targetWidth; sourceHeight = viewBox?.height || (targetWidth * 0.75); }
                if (sourceWidth <= 0 || sourceHeight <= 0) { return reject(new Error("SVG-Dimensionen konnten nicht ermittelt werden.")); }

                const scaleFactor = targetWidth / sourceWidth;
                const targetHeight = sourceHeight * scaleFactor;

                svgClone.setAttribute('width', String(targetWidth));
                svgClone.setAttribute('height', String(targetHeight));

                const elementsToStyle = svgClone.querySelectorAll('*');
                elementsToStyle.forEach(el => {
                    const computed = window.getComputedStyle(el);
                    const styleProps = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'text-anchor', 'dominant-baseline', 'opacity', 'stroke-dasharray'];
                    let styleString = el.getAttribute('style') || '';
                    styleProps.forEach(prop => {
                        if (computed[prop] && computed[prop] !== 'none' && computed[prop] !== '0px' && computed[prop] !== 'auto') {
                            styleString += `${prop}:${computed[prop]}; `;
                        }
                    });
                    if (styleString) el.setAttribute('style', styleString);
                });

                const svgXml = new XMLSerializer().serializeToString(svgClone);
                const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgXml)))}`;

                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) { return reject(new Error("Canvas Context nicht verfügbar.")); }
                    ctx.fillStyle = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        if (blob) { resolve(blob); }
                        else { reject(new Error("Canvas toBlob fehlgeschlagen.")); }
                    }, 'image/png');
                };
                img.onerror = (err) => {
                    console.error("Image load error for SVG conversion:", err, svgDataUrl.substring(0,100));
                    reject(new Error("Fehler beim Laden des SVG-Bildes für PNG-Konvertierung."));
                };
                img.src = svgDataUrl;
            } catch (error) {
                reject(new Error(`Fehler bei SVG-zu-PNG Konvertierung: ${error.message}`));
            }
        });
    }

     async function convertSvgToSvgBlob(svgElement) {
         return new Promise((resolve, reject) => {
             if (!svgElement || typeof svgElement.cloneNode !== 'function') return reject(new Error("Ungültiges SVG Element für SVG Export."));
              try {
                 const svgClone = svgElement.cloneNode(true);
                 svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                 svgClone.setAttribute('version', '1.1');
                 const elementsToStyle = svgClone.querySelectorAll('*');
                 elementsToStyle.forEach(el => {
                    const computed = window.getComputedStyle(el);
                    const styleProps = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'text-anchor', 'dominant-baseline', 'opacity', 'stroke-dasharray'];
                    let styleString = el.getAttribute('style') || '';
                    styleProps.forEach(prop => {
                        if (computed[prop] && computed[prop] !== 'none' && computed[prop] !== '0px' && computed[prop] !== 'auto') {
                            styleString += `${prop}:${computed[prop]}; `;
                        }
                    });
                    if (styleString) el.setAttribute('style', styleString);
                });

                 const svgXml = new XMLSerializer().serializeToString(svgClone);
                 const blob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
                 resolve(blob);
              } catch(error) {
                 reject(new Error(`Fehler bei SVG-zu-SVG Blob Konvertierung: ${error.message}`));
              }
         });
     }

    function generateStatistikCSVString(stats, kollektiv, criteria, logic, lang = 'de') {
        if (!stats || !stats.deskriptiv) return null;
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l, s, lg) => 'N/A';
        const csvData = []; const na = 'N/A';
        const fv = (v, d, p) => formatNumber(v, d, na, false, lang);
        const fp = (v, d) => formatPercent(v, d, na, lang);
        const fCI = (o, d, p) => !o || typeof o !== 'object' || o.lower === null || o.upper === null || isNaN(o.lower) || isNaN(o.upper) ? [na, na] : [fv(o.lower, d, p), fv(o.upper, d, p)];
        const fPVal = (p) => getPValueText(p, lang);

        try {
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.parameter || 'Parameter', UI_TEXTS.exportTab[lang]?.csvHeaders?.value || 'Wert']);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.cohort || 'Kollektiv', getKollektivDisplayName(kollektiv, lang)]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.appliedT2Logic || 'Angewandte T2 Logik', UI_TEXTS.t2LogicDisplayNames[lang]?.[logic] || logic]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.appliedT2Criteria || 'Angewandte T2 Kriterien', formatCriteriaFunc(criteria, logic, false, lang)]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.patientCount || 'Anzahl Patienten', stats.deskriptiv.anzahlPatienten]);
            csvData.push([]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.descriptiveMetric || 'Metrik (Deskriptiv)', UI_TEXTS.exportTab[lang]?.csvHeaders?.valueMedian || 'Wert (Median)', 'Mean', 'SD', 'Min', 'Max']); const d = stats.deskriptiv;
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.ageYears || 'Alter (Jahre)', fv(d.alter?.median, 1), fv(d.alter?.mean, 1), fv(d.alter?.sd, 1), fv(d.alter?.min, 0), fv(d.alter?.max, 0)]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.genderMaleNPerc || `Geschlecht ${UI_TEXTS.genderDisplayNames[lang]?.m || 'Männlich'} (n / %)`, `${d.geschlecht?.m ?? 0} / ${fp(d.anzahlPatienten > 0 ? (d.geschlecht?.m ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.genderFemaleNPerc || `Geschlecht ${UI_TEXTS.genderDisplayNames[lang]?.f || 'Weiblich'} (n / %)`, `${d.geschlecht?.f ?? 0} / ${fp(d.anzahlPatienten > 0 ? (d.geschlecht?.f ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.therapyUpfrontSurgeryNPerc || `Therapie ${getKollektivDisplayName('direkt OP', lang)} (n / %)`, `${d.therapie?.['direkt OP'] ?? 0} / ${fp(d.anzahlPatienten > 0 ? (d.therapie?.['direkt OP'] ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.therapyNRCTNPerc || `Therapie ${getKollektivDisplayName('nRCT', lang)} (n / %)`, `${d.therapie?.nRCT ?? 0} / ${fp(d.anzahlPatienten > 0 ? (d.therapie?.nRCT ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.nStatusPositivePerc || `N Status (+ / %)`, `${d.nStatus?.plus ?? 0} / ${fp(d.anzahlPatienten > 0 ? (d.nStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.asStatusPositivePerc || `AS Status (+ / %)`, `${d.asStatus?.plus ?? 0} / ${fp(d.anzahlPatienten > 0 ? (d.asStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.t2StatusPositivePerc || `T2 Status (+ / %)`, `${d.t2Status?.plus ?? 0} / ${fp(d.anzahlPatienten > 0 ? (d.t2Status?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            const fLKRowMD = (lk) => [fv(lk?.median, 1), fv(lk?.mean, 1), fv(lk?.sd, 1), fv(lk?.min, 0), fv(lk?.max, 0)];
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.lkNTotalMedian || 'LK N gesamt (Median)', ...fLKRowMD(d.lkAnzahlen?.n?.total)]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.lkNPositiveMedian || 'LK N+ (Median, nur N+ Pat.)', ...fLKRowMD(d.lkAnzahlen?.n?.plus)]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.lkASTotalMedian || 'LK AS gesamt (Median)', ...fLKRowMD(d.lkAnzahlen?.as?.total)]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.lkASPositiveMedian || 'LK AS+ (Median, nur AS+ Pat.)', ...fLKRowMD(d.lkAnzahlen?.as?.plus)]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.lkT2TotalMedian || 'LK T2 gesamt (Median)', ...fLKRowMD(d.lkAnzahlen?.t2?.total)]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.lkT2PositiveMedian || 'LK T2+ (Median, nur T2+ Pat.)', ...fLKRowMD(d.lkAnzahlen?.t2?.plus)]);
            csvData.push([]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.diagnosticMetric || 'Metrik (Diagnostik)', UI_TEXTS.exportTab[lang]?.csvHeaders?.method || 'Methode', UI_TEXTS.exportTab[lang]?.csvHeaders?.value || 'Wert', UI_TEXTS.exportTab[lang]?.csvHeaders?.ciLower || '95% CI Lower', UI_TEXTS.exportTab[lang]?.csvHeaders?.ciUpper || '95% CI Upper', UI_TEXTS.exportTab[lang]?.csvHeaders?.seBootstrap || 'SE (Bootstrap)', UI_TEXTS.exportTab[lang]?.csvHeaders?.ciMethod || 'CI Methode']); const addPerfRow = (metricKey, metricName, objAS, objT2) => { const isRate = !(metricKey === 'auc' || metricKey === 'f1'); const digits = isRate ? 1 : 3; const ciAS = fCI(objAS?.ci, digits, isRate); const ciT2 = fCI(objT2?.ci, digits, isRate); const valAS = isRate ? fp(objAS?.value, digits) : fv(objAS?.value, digits, isRate); const valT2 = isRate ? fp(objT2?.value, digits) : fv(objT2?.value, digits, isRate); const metricNameLocalized = UI_TEXTS?.statMetrics?.[lang]?.[metricKey]?.name || UI_TEXTS?.statMetrics?.de?.[metricKey]?.name || metricName; csvData.push([metricNameLocalized, 'AS', valAS, ciAS[0], ciAS[1], fv(objAS?.se, 4, false), objAS?.method || na]); csvData.push([metricNameLocalized, 'T2', valT2, ciT2[0], ciT2[1], fv(objT2?.se, 4, false), objT2?.method || na]); }; const gAS = stats.gueteAS, gT2 = stats.gueteT2_angewandt || stats.gueteT2; addPerfRow('sens', 'Sensitivität', gAS?.sens, gT2?.sens); addPerfRow('spez', 'Spezifität', gAS?.spez, gT2?.spez); addPerfRow('ppv', 'PPV', gAS?.ppv, gT2?.ppv); addPerfRow('npv', 'NPV', gAS?.npv, gT2?.npv); addPerfRow('acc', 'Accuracy', gAS?.acc, gT2?.acc); addPerfRow('balAcc', 'Balanced Accuracy', gAS?.balAcc, gT2?.balAcc); addPerfRow('f1', 'F1-Score', gAS?.f1, gT2?.f1); addPerfRow('auc', 'AUC', gAS?.auc, gT2?.auc); csvData.push([]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.comparisonTestAST2 || 'Vergleichstest (AS vs. T2)', UI_TEXTS.exportTab[lang]?.csvHeaders?.testStatistic || 'Test Statistik', UI_TEXTS.exportTab[lang]?.csvHeaders?.pValue || 'p-Wert', UI_TEXTS.exportTab[lang]?.csvHeaders?.method || 'Methode']); const v = stats.vergleichASvsT2_angewandt || stats.vergleichASvsT2; csvData.push([UI_TEXTS.statMetrics[lang]?.mcnemar?.name || UI_TEXTS.statMetrics.de.mcnemar.name || 'Accuracy (McNemar)', fv(v?.mcnemar?.statistic, 3, false), fPVal(v?.mcnemar?.pValue), v?.mcnemar?.method || na]); csvData.push([UI_TEXTS.statMetrics[lang]?.delong?.name || UI_TEXTS.statMetrics.de.delong.name || 'AUC (DeLong)', fv(v?.delong?.Z, 3, false), fPVal(v?.delong?.pValue), v?.delong?.method || na]); csvData.push([]);
            csvData.push([UI_TEXTS.exportTab[lang]?.csvHeaders?.associationNStatus || 'Assoziation mit N-Status', UI_TEXTS.exportTab[lang]?.csvHeaders?.featureKey || 'Merkmal Key', UI_TEXTS.exportTab[lang]?.csvHeaders?.featureName || 'Merkmal Name', 'OR', 'OR CI Lower', 'OR CI Upper', 'RD', 'RD CI Lower', 'RD CI Upper', 'Phi', UI_TEXTS.exportTab[lang]?.csvHeaders?.testStatistic || 'Test Statistik', UI_TEXTS.exportTab[lang]?.csvHeaders?.pValue || 'p-Wert', UI_TEXTS.exportTab[lang]?.csvHeaders?.testMethod || 'Test Methode']); const addAssocRow = (key, name, obj) => { if (!obj) return; const orCI = fCI(obj.or?.ci, 2, false); const rdCI = fCI(obj.rd?.ci, 3, false); csvData.push([ key, name, fv(obj.or?.value, 2, false), orCI[0], orCI[1], fv(obj.rd?.value, 3, false), rdCI[0], rdCI[1], fv(obj.phi?.value, 2, false), fv(obj.statistic ?? NaN, 2, false), fPVal(obj.pValue), obj.testName || na ]); }; const a = stats.assoziation_angewandt || stats.assoziation; addAssocRow('as', a?.as?.featureName || 'AS Positiv', a?.as); if(a?.size_mwu) { csvData.push(['size_mwu', a.size_mwu.featureName || 'LK Größe MWU', na, na, na, na, na, na, na, fv(a.size_mwu.statistic, 2, false), fPVal(a.size_mwu.pValue), a.size_mwu.testName || na ]); } ['size', 'form', 'kontur', 'homogenitaet', 'signal'].forEach(fKey => { if(a && a[fKey]) { addAssocRow(fKey, a[fKey].featureName || `T2 ${fKey}`, a[fKey]); } });
            return Papa.unparse(csvData, { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" });
        } catch (error) {
             console.error("Fehler in generateStatistikCSVString:", error);
             return null;
        }
    }

    function generateBruteForceTXTString(resultsData, kollektiv, lang = 'de') {
        if (!resultsData || !resultsData.results || resultsData.results.length === 0) return lang === 'de' ? "Keine Brute-Force-Ergebnisse vorhanden." : "No brute-force results available.";
        try {
            const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l, s, lg) => 'Formatierungsfehler';
            const { results, metric, duration, totalTested, kollektiv: bfKollektiv } = resultsData;
            const kollektivName = getKollektivDisplayName(bfKollektiv || kollektiv, lang);
            const bestResult = results[0];
            const headers = UI_TEXTS?.exportTab?.[lang]?.bruteForceReportHeaders || {
                title: "Brute-Force Optimierungsbericht",
                date: "Datum der Analyse",
                cohort: "Analysiertes Kollektiv",
                targetMetric: "Optimierte Zielmetrik",
                duration: "Gesamtdauer",
                combinations: "Getestete Kombinationen",
                bestResultTitle: "--- Bestes Ergebnis ---",
                logic: "Logik",
                criteria: "Kriterien",
                achievedMetric: `Erreichter ${metric}`,
                top10Title: "--- Top 10 Ergebnisse (inklusive identischer Werte) ---",
                rank: "Rang"
            };

            let report = `${headers.title}\r\n==================================================\r\n`;
            report += `${headers.date}: ${new Date().toLocaleString(lang === 'en' ? 'en-US' : 'de-DE')}\r\n`;
            report += `${headers.cohort}: ${kollektivName}\r\n`;
            report += `${headers.targetMetric}: ${metric}\r\n`;
            report += `${headers.duration}: ${formatNumber((duration || 0) / 1000, 1, '--', false, lang)} ${lang === 'de' ? 'Sekunden' : 'seconds'}\r\n`;
            report += `${headers.combinations}: ${formatNumber(totalTested, 0, '--', false, lang)}\r\n`;
            report += `==================================================\r\n\r\n`;
            report += `${headers.bestResultTitle}\r\n`;
            report += `${headers.logic}: ${bestResult.logic.toUpperCase()}\r\n`;
            report += `${headers.criteria}: ${formatCriteriaFunc(bestResult.criteria, bestResult.logic, false, lang)}\r\n`;
            report += `${headers.achievedMetric.replace(metric, metric)}: ${formatNumber(bestResult.metricValue, 4, '--', false, lang)}\r\n\r\n`;
            report += `${headers.top10Title}\r\n`;
            report += `${headers.rank.padEnd(5)} | ${metric.padEnd(12)} | ${headers.logic.padEnd(7)} | ${headers.criteria}\r\n`;
            report += `-----|--------------|---------|------------------------------------------\r\n`;

            let rank = 1, displayedCount = 0, lastMetricValue = -Infinity; const precision = 8;
            for (let i = 0; i < results.length; i++) { const result = results[i]; if (!result || typeof result.metricValue !== 'number' || !isFinite(result.metricValue)) continue; const currentMetricValueRounded = parseFloat(result.metricValue.toFixed(precision)); const lastMetricValueRounded = parseFloat(lastMetricValue.toFixed(precision)); let currentRank = rank; const isNewRank = Math.abs(currentMetricValueRounded - lastMetricValueRounded) > 1e-8; if (i > 0 && isNewRank) { rank = displayedCount + 1; currentRank = rank; } else if (i > 0) { currentRank = rank; } if (rank > 10 && isNewRank) break; report += `${String(currentRank).padEnd(4)} | ${formatNumber(result.metricValue, 4, '--', false, lang).padEnd(12)} | ${result.logic.toUpperCase().padEnd(7)} | ${formatCriteriaFunc(result.criteria, result.logic, false, lang)}\r\n`; if (isNewRank || i === 0) { lastMetricValue = result.metricValue; } displayedCount++; }
            report += `==================================================\r\n`; return report;
        } catch (error) {
             console.error("Fehler in generateBruteForceTXTString:", error);
             return null;
        }
    }

    function generateMarkdownTableString(dataOrStats, tableType, kollektiv, criteria = null, logic = null, options = {}) {
        const lang = options.lang || 'de';
        try {
            let headers = [], rows = [], title = ''; const kollektivDisplayName = getKollektivDisplayName(kollektiv, lang); const escMD = ui_helpers.escapeMarkdown; const na = '--'; const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l, s, lg) => 'N/A'; const t2CriteriaLabelShort = options.t2CriteriaLabelShort || 'T2';
            const defaultErrorMsg = lang === 'de' ? 'Fehler: Ungültige Daten.' : 'Error: Invalid data.';
            const noDataMsg = lang === 'de' ? 'Keine Daten verfügbar.' : 'No data available.';

            const getLocalizedHeader = (type, subKey) => UI_TEXTS?.exportTab?.[lang]?.mdHeaders?.[type]?.[subKey] || subKey;

            if (tableType === 'daten') { title = UI_TEXTS.exportTab[lang]?.mdTitles?.daten || 'Datenliste'; headers = ['Nr', getLocalizedHeader('daten','name'), getLocalizedHeader('daten','vorname'), getLocalizedHeader('daten','geschl'), getLocalizedHeader('daten','alter'), getLocalizedHeader('daten','therapie'), 'N', 'AS', 'T2', getLocalizedHeader('daten','bemerkung')]; if(!Array.isArray(dataOrStats)) return `# ${title}...\n\n${defaultErrorMsg}`; rows = dataOrStats.map(p => [p.nr, p.name || '', p.vorname || '', getKollektivDisplayName(p.geschlecht, lang), p.alter ?? '', getKollektivDisplayName(p.therapie, lang), p.n ?? na, p.as ?? na, p.t2 ?? na, p.bemerkung || ''].map(escMD)); }
            else if (tableType === 'auswertung') { title = UI_TEXTS.exportTab[lang]?.mdTitles?.auswertung || 'Auswertungstabelle'; headers = ['Nr', getLocalizedHeader('auswertung','name'), getLocalizedHeader('auswertung','therapie'), 'N', 'AS', 'T2', getLocalizedHeader('auswertung','nCounts'), getLocalizedHeader('auswertung','asCounts'), getLocalizedHeader('auswertung','t2Counts')]; if(!Array.isArray(dataOrStats)) return `# ${title}...\n\n${defaultErrorMsg}`; rows = dataOrStats.map(p => [p.nr, p.name || '', getKollektivDisplayName(p.therapie, lang), p.n ?? na, p.as ?? na, p.t2 ?? na, `${formatNumber(p.anzahl_patho_n_plus_lk, 0, '-', false, lang)} / ${formatNumber(p.anzahl_patho_lk, 0, '-', false, lang)}`, `${formatNumber(p.anzahl_as_plus_lk, 0, '-', false, lang)} / ${formatNumber(p.anzahl_as_lk, 0, '-', false, lang)}`, `${formatNumber(p.anzahl_t2_plus_lk, 0, '-', false, lang)} / ${formatNumber(p.anzahl_t2_lk, 0, '-', false, lang)}`].map(escMD)); }
            else if (tableType === 'deskriptiv') { title = UI_TEXTS.exportTab[lang]?.mdTitles?.deskriptiv || 'Deskriptive Statistik'; const stats = dataOrStats; if (!stats || !stats.anzahlPatienten) return `# ${title} (${lang === 'de' ? 'Kollektiv' : 'Cohort'}: ${kollektivDisplayName})\n\n${noDataMsg}`; const total = stats.anzahlPatienten; headers = [getLocalizedHeader('deskriptiv','metric'), getLocalizedHeader('deskriptiv','value')]; const fLKRowMD = (lk) => `${formatNumber(lk?.median, 1, na, false, lang)} (${formatNumber(lk?.min, 0, na, false, lang)}-${formatNumber(lk?.max, 0, na, false, lang)}) \\[Mean: ${formatNumber(lk?.mean, 1, na, false, lang)} ± ${formatNumber(lk?.sd, 1, na, false, lang)}\\]`; const descRows = UI_TEXTS?.exportTab?.[lang]?.mdDeskriptivRows || {}; rows = [ [descRows.patientCount || 'Anzahl Patienten', total], [descRows.ageMedian || 'Median Alter (Min-Max) \\[Mean ± SD\\]', `${formatNumber(stats.alter?.median, 1, na, false, lang)} (${formatNumber(stats.alter?.min, 0, na, false, lang)} - ${formatNumber(stats.alter?.max, 0, na, false, lang)}) \\[${formatNumber(stats.alter?.mean, 1, na, false, lang)} ± ${formatNumber(stats.alter?.sd, 1, na, false, lang)}\\]`], [descRows.genderNPerc || `Geschlecht (${UI_TEXTS.genderDisplayNames[lang]?.m}/${UI_TEXTS.genderDisplayNames[lang]?.f}) (n / %)`, `${stats.geschlecht?.m ?? 0} / ${stats.geschlecht?.f ?? 0} (${formatPercent((stats.geschlecht?.m ?? 0) / total, 1, lang)} / ${formatPercent((stats.geschlecht?.f ?? 0) / total, 1, lang)})`], [descRows.therapyNPerc || `Therapie (${getKollektivDisplayName('direkt OP',lang)} / ${getKollektivDisplayName('nRCT',lang)}) (n / %)`, `${stats.therapie?.['direkt OP'] ?? 0} / ${stats.therapie?.nRCT ?? 0} (${formatPercent((stats.therapie?.['direkt OP'] ?? 0) / total, 1, lang)} / ${formatPercent((stats.therapie?.nRCT ?? 0) / total, 1, lang)})`], [descRows.nStatusNPerc || `N Status (+ / -) (n / %)`, `${stats.nStatus?.plus ?? 0} / ${stats.nStatus?.minus ?? 0} (${formatPercent((stats.nStatus?.plus ?? 0) / total, 1, lang)} / ${formatPercent((stats.nStatus?.minus ?? 0) / total, 1, lang)})`], [descRows.asStatusNPerc || `AS Status (+ / -) (n / %)`, `${stats.asStatus?.plus ?? 0} / ${stats.asStatus?.minus ?? 0} (${formatPercent((stats.asStatus?.plus ?? 0) / total, 1, lang)} / ${formatPercent((stats.asStatus?.minus ?? 0) / total, 1, lang)})`], [descRows.t2StatusNPerc || `T2 Status (+ / -) (n / %)`, `${stats.t2Status?.plus ?? 0} / ${stats.t2Status?.minus ?? 0} (${formatPercent((stats.t2Status?.plus ?? 0) / total, 1, lang)} / ${formatPercent((stats.t2Status?.minus ?? 0) / total, 1, lang)})`], [descRows.medianLkNTotal || 'Median LK N ges. (Min-Max) \\[Mean ± SD\\]', fLKRowMD(stats.lkAnzahlen?.n?.total)], [descRows.medianLkNPositive || 'Median LK N+ (Min-Max) \\[Mean ± SD\\] (nur N+ Pat.)', fLKRowMD(stats.lkAnzahlen?.n?.plus)], [descRows.medianLkASTotal || 'Median LK AS ges. (Min-Max) \\[Mean ± SD\\]', fLKRowMD(stats.lkAnzahlen?.as?.total)], [descRows.medianLkASPositive || 'Median LK AS+ (Min-Max) \\[Mean ± SD\\] (nur AS+ Pat.)', fLKRowMD(stats.lkAnzahlen?.as?.plus)], [descRows.medianLkT2Total || 'Median LK T2 ges. (Min-Max) \\[Mean ± SD\\]', fLKRowMD(stats.lkAnzahlen?.t2?.total)], [descRows.medianLkT2Positive || 'Median LK T2+ (Min-Max) \\[Mean ± SD\\] (nur T2+ Pat.)', fLKRowMD(stats.lkAnzahlen?.t2?.plus)] ].map(r => r.map(escMD)); }
            else if (tableType === 'praes_as_perf') { title = UI_TEXTS.exportTab[lang]?.mdTitles?.praesAsPerf || `Diagnostische Güte (AS) für Kollektive`; const { statsGesamt, statsDirektOP, statsNRCT } = dataOrStats || {}; if (!statsGesamt && !statsDirektOP && !statsNRCT) return `# ${title}\n\n${defaultErrorMsg}`; headers = [getLocalizedHeader('praesAsPerf','cohort'), getLocalizedHeader('praesAsPerf','sens'), getLocalizedHeader('praesAsPerf','spec'), getLocalizedHeader('praesAsPerf','ppv'), getLocalizedHeader('praesAsPerf','npv'), getLocalizedHeader('praesAsPerf','acc'), getLocalizedHeader('praesAsPerf','auc')]; const fRow = (s, k) => { const d = getKollektivDisplayName(k, lang); if (!s || typeof s.matrix !== 'object') return [d + ' (N=?)', na, na, na, na, na, na].map(escMD); const n = s.matrix ? (s.matrix.rp + s.matrix.fp + s.matrix.fn + s.matrix.rn) : 0; const fCI_p = (m, ky) => { const dig = (ky === 'f1' || ky === 'auc') ? 3 : 1; const isP = !(ky === 'f1' || ky === 'auc'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, dig, isP, na, lang); }; return [`${d} (N=${n})`, fCI_p(s.sens, 'sens'), fCI_p(s.spez, 'spez'), fCI_p(s.ppv, 'ppv'), fCI_p(s.npv, 'npv'), fCI_p(s.acc, 'acc'), fCI_p(s.auc, 'auc')].map(escMD); }; rows = [ fRow(statsGesamt, 'Gesamt'), fRow(statsDirektOP, 'direkt OP'), fRow(statsNRCT, 'nRCT') ]; }
            else if (tableType === 'praes_as_vs_t2_perf' || tableType === 'praes_as_vs_t2_comp') { const { statsAS, statsT2 } = dataOrStats || {}; title = (UI_TEXTS.exportTab[lang]?.mdTitles?.praesAsVsT2Perf || `Vergleich Diagnostische Güte (AS vs. ${escMD(t2CriteriaLabelShort)})`); if (!statsAS || !statsT2) return `# ${title} (${lang==='de'?'Kollektiv':'Cohort'}: ${kollektivDisplayName})\n\n${defaultErrorMsg}`; headers = [getLocalizedHeader('praesAsVsT2Perf','metric'), getLocalizedHeader('praesAsVsT2Perf','asValue'), `${escMD(t2CriteriaLabelShort)} ${getLocalizedHeader('praesAsVsT2Perf','t2ValueSuffix')}`]; const fRow = (mKey, nmKey, isP = true, d = 1) => { const mAS = statsAS[mKey]; const mT2 = statsT2[mKey]; const dig = (mKey === 'auc' || mKey === 'f1') ? 3 : d; const vAS = formatCI(mAS?.value, mAS?.ci?.lower, mAS?.ci?.upper, dig, isP, na, lang); const vT2 = formatCI(mT2?.value, mT2?.ci?.lower, mT2?.ci?.upper, dig, isP, na, lang); const metricName = UI_TEXTS.statMetrics[lang]?.[mKey]?.name || UI_TEXTS.statMetrics.de[mKey]?.name || mKey; return [metricName, vAS, vT2]; }; rows = [ fRow('sens', 'sens'), fRow('spez', 'spez'), fRow('ppv', 'ppv'), fRow('npv', 'npv'), fRow('acc', 'acc'), fRow('balAcc', 'balAcc'), fRow('f1', 'f1', false, 3), fRow('auc', 'auc', false, 3) ].map(r => r.map(escMD)); }
            else if (tableType === 'praes_as_vs_t2_tests') { const { vergleich } = dataOrStats || {}; title = (UI_TEXTS.exportTab[lang]?.mdTitles?.praesAsVsT2Tests || `Statistischer Vergleich (AS vs. ${escMD(t2CriteriaLabelShort)})`); if (!vergleich) return `# ${title} (${lang==='de'?'Kollektiv':'Cohort'}: ${kollektivDisplayName})\n\n${defaultErrorMsg}`; headers = [getLocalizedHeader('praesAsVsT2Tests','test'), getLocalizedHeader('praesAsVsT2Tests','statistic'), getLocalizedHeader('praesAsVsT2Tests','pValue'), getLocalizedHeader('praesAsVsT2Tests','method')]; const fP = (p) => getPValueText(p, lang); rows = [ [UI_TEXTS.statMetrics[lang]?.mcnemar?.name || 'McNemar (Accuracy)', `${formatNumber(vergleich?.mcnemar?.statistic, 3, na, false, lang)} (df=${vergleich?.mcnemar?.df || na})`, `${fP(vergleich?.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(vergleich?.mcnemar?.pValue)}`, `${vergleich?.mcnemar?.method || na}`], [UI_TEXTS.statMetrics[lang]?.delong?.name || 'DeLong (AUC)', `Z=${formatNumber(vergleich?.delong?.Z, 3, na, false, lang)}`, `${fP(vergleich?.delong?.pValue)} ${getStatisticalSignificanceSymbol(vergleich?.delong?.pValue)}`, `${vergleich?.delong?.method || na}`] ].map(r => r.map(escMD)); }
            else if (tableType === 'criteria_comparison') { title = UI_TEXTS.exportTab[lang]?.mdTitles?.criteriaComparison || `Vergleich diagnostischer Güte verschiedener Methoden`; const results = dataOrStats; if (!Array.isArray(results) || results.length === 0) return `# ${title} (${lang==='de'?'Kollektiv':'Cohort'}: ${kollektivDisplayName})\n\n${noDataMsg}`; headers = [getLocalizedHeader('criteriaComparison','methodSet'), getLocalizedHeader('criteriaComparison','sens'), getLocalizedHeader('criteriaComparison','spec'), getLocalizedHeader('criteriaComparison','ppv'), getLocalizedHeader('criteriaComparison','npv'), getLocalizedHeader('criteriaComparison','acc'), getLocalizedHeader('criteriaComparison','auc')]; rows = results.map(r => { let name = r.name || (lang==='de'?'Unbekannt':'Unknown'); if (r.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) name = getKollektivDisplayName(APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, lang); else if (r.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) name = getKollektivDisplayName(APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID, lang); return [name, formatPercent(r.sens, 1, lang), formatPercent(r.spez, 1, lang), formatPercent(r.ppv, 1, lang), formatPercent(r.npv, 1, lang), formatPercent(r.acc, 1, lang), formatNumber(r.auc, 3, '--', false, lang)].map(escMD); }); }
            else { return `# ${lang === 'de' ? 'Unbekannter Tabellentyp' : 'Unknown table type'} für Markdown: ${tableType}`; }

            const headerLine = `| ${headers.join(' | ')} |`; const separatorLine = `|${headers.map(() => '---').join('|')}|`; const bodyLines = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
            let metaInfo = `# ${title}`; if (!['daten', 'auswertung', 'praes_as_perf', 'criteria_comparison'].includes(tableType)) metaInfo += ` (${lang==='de'?'Kollektiv':'Cohort'}: ${kollektivDisplayName})`; else if (tableType === 'criteria_comparison') metaInfo += ` (${lang==='de'?'für Kollektiv':'for cohort'}: ${kollektivDisplayName})`; metaInfo += '\n'; if(criteria && logic && ['auswertung', 'deskriptiv'].includes(tableType)) metaInfo += `\n_${lang==='de'?'T2-Basis (angewandt)':'T2-Basis (applied)'}: ${escMD(formatCriteriaFunc(criteria, logic, false, lang))}_\n\n`; else if (options.t2CriteriaLabelFull && ['praes_as_vs_t2_perf', 'praes_as_vs_t2_tests', 'praes_as_vs_t2_comp'].includes(tableType)) metaInfo += `\n_${lang==='de'?'T2-Basis (Vergleich)':'T2-Basis (Comparison)'}: ${escMD(options.t2CriteriaLabelFull)}_\n\n`; else metaInfo += '\n';
            return `${metaInfo}${headerLine}\n${separatorLine}\n${bodyLines}`;
        } catch (error) {
            console.error(`Fehler in generateMarkdownTableString for type ${tableType}:`, error);
            return `# ${lang === 'de' ? 'Fehler bei der Generierung der Markdown-Tabelle für' : 'Error generating Markdown table for'} ${tableType}.`;
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

    function _getPublicationSectionContentForExport(sectionId, lang, allKollektivStats, commonData, appliedCriteria, appliedLogic) {
        try {
            if (typeof publicationTextGenerator !== 'undefined' && typeof publicationTextGenerator.getSectionTextAsMarkdown === 'function') {
                 return publicationTextGenerator.getSectionTextAsMarkdown(sectionId, lang, allKollektivStats, allKollektivStats, commonData, appliedCriteria, appliedLogic);
            }
            const fallbackMsg = lang === 'en' ? `Text content for section '${sectionId}' in language '${lang}' (placeholder).` : `Textinhalt für Sektion '${sectionId}' in Sprache '${lang}' (Platzhalter).`;
            return fallbackMsg;
        } catch (e) {
            console.error(`Error generating markdown for publication section ${sectionId}:`, e);
            const errorMsg = lang === 'en' ? `Error generating content for section ${sectionId}` : `Fehler bei Generierung für Sektion ${sectionId}`;
            return `# ${errorMsg}\n\n${e.message}`;
        }
    }

    function generateComprehensiveReportHTML(data, bfResultsForCurrentKollektiv, kollektiv, criteria, logic, lang = 'de') {
        const errorTitle = lang === 'de' ? 'Fehler' : 'Error';
        const errorBody = lang === 'de' ? 'Fehler: Notwendige Daten für Report fehlen.' : 'Error: Necessary data for report is missing.';
        const errorRenderBody = lang === 'de' ? 'Fehler bei der Reporterstellung.' : 'Error during report generation.';
        try {
            const allBruteForceResults = typeof bruteForceManager !== 'undefined' ? bruteForceManager.getAllResults() : ( bfResultsForCurrentKollektiv ? {[kollektiv]: bfResultsForCurrentKollektiv} : null );
            const statsDataForAllKollektive = statisticsService.calculateAllStatsForPublication(data, criteria, logic, allBruteForceResults);

            if (!data || !statsDataForAllKollektive || !criteria || !logic) return `<html><head><title>${errorTitle}</title></head><body>${errorBody}</body></html>`;

            const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l, s, lg) => 'N/A';
            const config = APP_CONFIG.REPORT_SETTINGS; const kollektivName = getKollektivDisplayName(kollektiv, lang); const timestamp = new Date().toLocaleString(lang === 'en' ? 'en-US' : 'de-DE', { dateStyle: 'long', timeStyle: 'medium'}); const criteriaString = formatCriteriaFunc(criteria, logic, false, lang); const appliedCriteriaDisplayName = getKollektivDisplayName(APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, lang); let chartSVGs = {};
            const getChartSVG = (chartId) => { const el = document.getElementById(chartId)?.querySelector('svg'); if(!el) return `<p class="text-muted small">[${lang==='de'?'Diagramm':'Chart'} ${chartId} ${lang==='de'?'nicht renderbar/gefunden':'not renderable/found'}]</p>`; try { const clone = el.cloneNode(true); clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); clone.setAttribute('version', '1.1'); clone.style.backgroundColor = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff'; const vb = clone.getAttribute('viewBox')?.split(' '); let w = clone.getAttribute('width'), h = clone.getAttribute('height'); if (vb && vb.length === 4 && parseFloat(vb[2]) > 0 && parseFloat(vb[3]) > 0) { clone.setAttribute('width', vb[2]); clone.setAttribute('height', vb[3]); } else if (!w || !h || parseFloat(w) <= 0 || parseFloat(h) <= 0) { clone.setAttribute('width', '400'); clone.setAttribute('height', '300'); } const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style"); styleEl.textContent = `svg { font-family: ${getComputedStyle(document.body).fontFamily || 'sans-serif'}; } .axis path, .axis line { fill: none; stroke: #6c757d; shape-rendering: crispEdges; stroke-width: 1px; } .axis text { font-size: 10px; fill: #212529; } .axis-label { font-size: 11px; fill: #212529; text-anchor: middle; } .grid .tick { stroke: #dee2e6; stroke-opacity: 0.6; } .grid path { stroke-width: 0; } .legend { font-size: 10px; fill: #212529; } .bar { opacity: 0.9; } .roc-curve { fill: none; stroke-width: 2px; } .reference-line { stroke: #adb5bd; stroke-width: 1px; stroke-dasharray: 4 2; } .auc-label { font-weight: bold; font-size: 11px; }`; clone.prepend(styleEl); return clone.outerHTML; } catch (e) { return `<p class="text-danger small">[${lang==='de'?'Fehler beim Einbetten von Diagramm':'Error embedding chart'} ${chartId}: ${e.message}]</p>`; } };
            const chartIdsToCapture = [];
            const statsDataForCurrentKollektiv = statsDataForAllKollektive[kollektiv];

            if (config.INCLUDE_DESCRIPTIVES_CHARTS) { chartIdsToCapture.push(PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id, PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id); }
            if (config.INCLUDE_AS_VS_T2_COMPARISON_CHART) { const p = ['praes-comp-chart-container'].find(id => document.getElementById(id)?.querySelector('svg')); if(p) chartIdsToCapture.push(p); } chartIdsToCapture.forEach(id => { const actualId = document.getElementById(id) ? id : (id.endsWith('-0') && document.getElementById(id.replace('-0','')) ? id.replace('-0','') : null); if (actualId && document.getElementById(actualId)) chartSVGs[actualId] = getChartSVG(actualId); else console.warn(`SVG für Chart-ID ${id} (oder ${actualId}) nicht gefunden für Report.`); });
            let html = `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><title>${config.REPORT_TITLE} - ${kollektivName}</title>`; html += `<style> body { font-family: sans-serif; font-size: 10pt; line-height: 1.4; padding: 25px; max-width: 800px; margin: auto; color: #212529; background-color: #fff;} h1, h2, h3 { color: #333; margin-top: 1.2em; margin-bottom: 0.6em; padding-bottom: 0.2em; border-bottom: 1px solid #ccc; page-break-after: avoid; } h1 { font-size: 16pt; border-bottom-width: 2px; } h2 { font-size: 14pt; } h3 { font-size: 12pt; font-weight: bold; border-bottom: none; margin-bottom: 0.4em; } table { border-collapse: collapse; width: 100%; margin-bottom: 1em; font-size: 9pt; page-break-inside: avoid; } th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; vertical-align: top; word-wrap: break-word; } th { background-color: #f2f2f2; font-weight: bold; } .chart-container { text-align: center; margin: 1em 0; page-break-inside: avoid; background-color: #fff; padding: 10px; border: 1px solid #eee; max-width: 100%; overflow: hidden; } .chart-container svg { max-width: 100%; height: auto; display: block; margin: auto; } .meta-info { background-color: #f9f9f9; border: 1px solid #eee; padding: 10px 15px; margin-bottom: 1.5em; font-size: 9pt; } .meta-info ul { list-style: none; padding: 0; margin: 0; } .meta-info li { margin-bottom: 0.3em; } .small { font-size: 8pt; } .text-muted { color: #6c757d; } ul { padding-left: 20px; margin-top: 0.5em;} li { margin-bottom: 0.2em; } .report-footer { margin-top: 2em; padding-top: 1em; border-top: 1px solid #ccc; font-size: 8pt; color: #888; text-align: center; } .no-print { display: none; } @media print { body { padding: 10px; } .meta-info { background-color: #fff; border: none; padding: 0 0 1em 0;} } </style></head><body>`;
            html += `<h1>${config.REPORT_TITLE}</h1>`; if (config.INCLUDE_APP_VERSION) html += `<p class="text-muted small">${lang === 'de' ? 'Generiert mit' : 'Generated with'}: ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION}</p>`; if (config.INCLUDE_GENERATION_TIMESTAMP) html += `<p class="text-muted small">${lang === 'de' ? 'Erstellt am' : 'Created on'}: ${timestamp}</p>`;
            html += `<div class="meta-info"><h3>${lang === 'de' ? 'Analysekonfiguration':'Analysis Configuration'}</h3><ul>`; if (config.INCLUDE_KOLLEKTIV_INFO) html += `<li><strong>${lang === 'de' ? 'Analysiertes Kollektiv':'Analyzed Cohort'}:</strong> ${kollektivName} (N=${statsDataForCurrentKollektiv?.deskriptiv?.anzahlPatienten || 0})</li>`; if (config.INCLUDE_T2_CRITERIA) html += `<li><strong>${lang === 'de' ? 'Angewandte T2-Kriterien':'Applied T2 Criteria'} ('${appliedCriteriaDisplayName}'):</strong> ${lang==='de'?'Logik':'Logic'}: ${UI_TEXTS.t2LogicDisplayNames[lang]?.[logic] || logic}, ${lang==='de'?'Kriterien':'Criteria'}: ${criteriaString}</li>`; html += `</ul></div>`;
            const descHeaders = UI_TEXTS?.exportTab?.[lang]?.htmlReport?.descriptiveHeaders || { metric: 'Metrik', valueMedian: 'Wert (Median)', mean: 'Mean', sd: 'SD', min: 'Min', max: 'Max'};
            if (config.INCLUDE_DESCRIPTIVES_TABLE && statsDataForCurrentKollektiv?.deskriptiv) { html += `<h2>${lang === 'de' ? 'Deskriptive Statistik':'Descriptive Statistics'}</h2>`; html += `<table><thead><tr><th>${descHeaders.metric}</th><th>${descHeaders.valueMedian}</th><th>${descHeaders.mean}</th><th>${descHeaders.sd}</th><th>${descHeaders.min}</th><th>${descHeaders.max}</th></tr></thead><tbody>`; const d = statsDataForCurrentKollektiv.deskriptiv; const na = '--'; const fv = (v, dig = 1) => formatNumber(v, dig, na, false, lang); const fP = (v, dig = 1) => formatPercent(v, dig, na, lang); const addRowHTML = (l, vl=na, m=na, s=na, mn=na, mx=na) => `<tr><td>${l}</td><td>${vl}</td><td>${m}</td><td>${s}</td><td>${mn}</td><td>${mx}</td></tr>`; html += addRowHTML(UI_TEXTS.exportTab[lang]?.csvHeaders?.ageYears || 'Alter (Jahre)', fv(d.alter?.median, 1), fv(d.alter?.mean, 1), fv(d.alter?.sd, 1), fv(d.alter?.min, 0), fv(d.alter?.max, 0)); html += addRowHTML(UI_TEXTS.exportTab[lang]?.csvHeaders?.genderMaleNPerc || 'Geschlecht Männlich (n / %)', `${d.geschlecht?.m ?? 0} / ${fP(d.anzahlPatienten > 0 ? (d.geschlecht?.m ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML(UI_TEXTS.exportTab[lang]?.csvHeaders?.genderFemaleNPerc || 'Geschlecht Weiblich (n / %)', `${d.geschlecht?.f ?? 0} / ${fP(d.anzahlPatienten > 0 ? (d.geschlecht?.f ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML(UI_TEXTS.exportTab[lang]?.csvHeaders?.therapyUpfrontSurgeryNPerc || 'Therapie Direkt OP (n / %)', `${d.therapie?.['direkt OP'] ?? 0} / ${fP(d.anzahlPatienten > 0 ? (d.therapie?.['direkt OP'] ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML(UI_TEXTS.exportTab[lang]?.csvHeaders?.therapyNRCTNPerc || 'Therapie nRCT (n / %)', `${d.therapie?.nRCT ?? 0} / ${fP(d.anzahlPatienten > 0 ? (d.therapie?.nRCT ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML(UI_TEXTS.exportTab[lang]?.csvHeaders?.nStatusPositivePerc || 'N Status (+ / %)', `${d.nStatus?.plus ?? 0} / ${fP(d.anzahlPatienten > 0 ? (d.nStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML(UI_TEXTS.exportTab[lang]?.csvHeaders?.asStatusPositivePerc || 'AS Status (+ / %)', `${d.asStatus?.plus ?? 0} / ${fP(d.anzahlPatienten > 0 ? (d.asStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML(UI_TEXTS.exportTab[lang]?.csvHeaders?.t2StatusPositivePerc || 'T2 Status (+ / %)', `${d.t2Status?.plus ?? 0} / ${fP(d.anzahlPatienten > 0 ? (d.t2Status?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`); const fLK = (lk) => `${fv(lk?.median,1)} (${fv(lk?.min,0)}-${fv(lk?.max,0)})`; html += addRowHTML(UI_TEXTS.exportTab[lang]?.csvHeaders?.lkNTotalMedian || 'LK N gesamt (Median (Min-Max))', fLK(d.lkAnzahlen?.n?.total), fv(d.lkAnzahlen?.n?.total?.mean,1), fv(d.lkAnzahlen?.n?.total?.sd,1),fv(d.lkAnzahlen?.n?.total?.min,0), fv(d.lkAnzahlen?.n?.total?.max,0)); html += addRowHTML(UI_TEXTS.exportTab[lang]?.csvHeaders?.lkNPositiveMedian || 'LK N+ (Median (Min-Max), nur N+ Pat.)', fLK(d.lkAnzahlen?.n?.plus), fv(d.lkAnzahlen?.n?.plus?.mean,1), fv(d.lkAnzahlen?.n?.plus?.sd,1),fv(d.lkAnzahlen?.n?.plus?.min,0), fv(d.lkAnzahlen?.n?.plus?.max,0)); html += addRowHTML(UI_TEXTS.exportTab[lang]?.csvHeaders?.lkASTotalMedian || 'LK AS gesamt (Median (Min-Max))', fLK(d.lkAnzahlen?.as?.total), fv(d.lkAnzahlen?.as?.total?.mean,1), fv(d.lkAnzahlen?.as?.total?.sd,1),fv(d.lkAnzahlen?.as?.total?.min,0), fv(d.lkAnzahlen?.as?.total?.max,0)); html += addRowHTML(UI_TEXTS.exportTab[lang]?.csvHeaders?.lkASPositiveMedian || 'LK AS+ (Median (Min-Max), nur AS+ Pat.)', fLK(d.lkAnzahlen?.as?.plus), fv(d.lkAnzahlen?.as?.plus?.mean,1), fv(d.lkAnzahlen?.as?.plus?.sd,1),fv(d.lkAnzahlen?.as?.plus?.min,0), fv(d.lkAnzahlen?.as?.plus?.max,0)); html += addRowHTML(UI_TEXTS.exportTab[lang]?.csvHeaders?.lkT2TotalMedian || 'LK T2 gesamt (Median (Min-Max))', fLK(d.lkAnzahlen?.t2?.total), fv(d.lkAnzahlen?.t2?.total?.mean,1), fv(d.lkAnzahlen?.t2?.total?.sd,1),fv(d.lkAnzahlen?.t2?.total?.min,0), fv(d.lkAnzahlen?.t2?.total?.max,0)); html += addRowHTML(UI_TEXTS.exportTab[lang]?.csvHeaders?.lkT2PositiveMedian || 'LK T2+ (Median (Min-Max), nur T2+ Pat.)', fLK(d.lkAnzahlen?.t2?.plus), fv(d.lkAnzahlen?.t2?.plus?.mean,1), fv(d.lkAnzahlen?.t2?.plus?.sd,1),fv(d.lkAnzahlen?.t2?.plus?.min,0), fv(d.lkAnzahlen?.t2?.plus?.max,0)); html += `</tbody></table>`; }
            const descChartTitleAge = UI_TEXTS?.publikationTab?.figureCaptions?.[lang]?.[PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.captionKey]?.replace('[KOLLEKTIV]', kollektivName) || 'Altersverteilung';
            const descChartTitleGender = UI_TEXTS?.publikationTab?.figureCaptions?.[lang]?.[PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.captionKey]?.replace('[KOLLEKTIV]', kollektivName) || 'Geschlechterverteilung';
            if (config.INCLUDE_DESCRIPTIVES_CHARTS) { html += `<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 1em; justify-content: space-around;">`; if (chartSVGs[PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id]) html += `<div class="chart-container" style="flex: 1 1 45%; min-width: 300px;"><h3>${descChartTitleAge}</h3>${chartSVGs[PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id]}</div>`; if (chartSVGs[PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id]) html += `<div class="chart-container" style="flex: 1 1 45%; min-width: 300px;"><h3>${descChartTitleGender}</h3>${chartSVGs[PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id]}</div>`; html += `</div>`; }
            const perfHeaders = UI_TEXTS?.exportTab?.[lang]?.htmlReport?.performanceHeaders || { metric: 'Metrik', valueCI: 'Wert (95% CI)', ciMethod: 'CI Methode' };
            const addPerfSectionHTML = (title, statsObj) => { if (!statsObj) return ''; let sHtml = `<h2>${title}</h2><table><thead><tr><th>${perfHeaders.metric}</th><th>${perfHeaders.valueCI}</th><th>${perfHeaders.ciMethod}</th></tr></thead><tbody>`; const fCI_local = (m, d=1, p=true) => formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, '--', lang); const na = '--'; const addPerfRowHTML = (metricKey, metricNameLocalized) => { sHtml += `<tr><td>${metricNameLocalized}</td><td>${fCI_local(statsObj[metricKey], (metricKey==='f1'||metricKey==='auc'?3:1), !(metricKey==='f1'||metricKey==='auc'))}</td><td>${statsObj[metricKey]?.method || na}</td></tr>`;}; addPerfRowHTML('sens', UI_TEXTS.statMetrics[lang]?.sens?.name || 'Sensitivität'); addPerfRowHTML('spez', UI_TEXTS.statMetrics[lang]?.spez?.name || 'Spezifität'); addPerfRowHTML('ppv', UI_TEXTS.statMetrics[lang]?.ppv?.name || 'PPV'); addPerfRowHTML('npv', UI_TEXTS.statMetrics[lang]?.npv?.name || 'NPV'); addPerfRowHTML('acc', UI_TEXTS.statMetrics[lang]?.acc?.name || 'Accuracy'); addPerfRowHTML('balAcc', UI_TEXTS.statMetrics[lang]?.balAcc?.name || 'Balanced Accuracy'); addPerfRowHTML('f1', UI_TEXTS.statMetrics[lang]?.f1?.name || 'F1-Score'); addPerfRowHTML('auc', UI_TEXTS.statMetrics[lang]?.auc?.name || 'AUC'); sHtml += `</tbody></table>`; return sHtml; };
            const asTitle = lang === 'de' ? 'Diagnostische Güte: Avocado Sign (vs. N)' : 'Diagnostic Performance: Avocado Sign (vs. N)';
            if (config.INCLUDE_AS_PERFORMANCE_TABLE && statsDataForCurrentKollektiv?.gueteAS) { html += addPerfSectionHTML(asTitle, statsDataForCurrentKollektiv.gueteAS); }
            const t2AppliedTitle = lang === 'de' ? `Diagnostische Güte: T2 ('${appliedCriteriaDisplayName}' vs. N)` : `Diagnostic Performance: T2 ('${appliedCriteriaDisplayName}' vs. N)`;
            if (config.INCLUDE_T2_PERFORMANCE_TABLE && statsDataForCurrentKollektiv?.gueteT2_angewandt) { html += addPerfSectionHTML(t2AppliedTitle, statsDataForCurrentKollektiv.gueteT2_angewandt); }
            const comparisonHeaders = UI_TEXTS?.exportTab?.[lang]?.htmlReport?.comparisonHeaders || { test: 'Test', statistic: 'Statistik', pValue: 'p-Wert', method: 'Methode'};
            const asVsT2Title = lang === 'de' ? `Statistischer Vergleich: AS vs. T2 ('${appliedCriteriaDisplayName}')` : `Statistical Comparison: AS vs. T2 ('${appliedCriteriaDisplayName}')`;
            if (config.INCLUDE_AS_VS_T2_COMPARISON_TABLE && statsDataForCurrentKollektiv?.vergleichASvsT2_angewandt) { html += `<h2>${asVsT2Title}</h2><table><thead><tr><th>${comparisonHeaders.test}</th><th>${comparisonHeaders.statistic}</th><th>${comparisonHeaders.pValue}</th><th>${comparisonHeaders.method}</th></tr></thead><tbody>`; const v = statsDataForCurrentKollektiv.vergleichASvsT2_angewandt; const fP = (p) => getPValueText(p, lang); const na = '--'; html += `<tr><td>${UI_TEXTS.statMetrics[lang]?.mcnemar?.name || 'Accuracy (McNemar)'}</td><td>${formatNumber(v?.mcnemar?.statistic, 3, na, false, lang)} (df=${v?.mcnemar?.df || na})</td><td>${fP(v?.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(v?.mcnemar?.pValue)}</td><td>${v?.mcnemar?.method || na}</td></tr>`; html += `<tr><td>${UI_TEXTS.statMetrics[lang]?.delong?.name || 'AUC (DeLong)'}</td><td>Z=${formatNumber(v?.delong?.Z, 3, na, false, lang)}</td><td>${fP(v?.delong?.pValue)} ${getStatisticalSignificanceSymbol(v?.delong?.pValue)}</td><td>${v?.delong?.method || na}</td></tr>`; html += `</tbody></table>`; }
            const comparisonChartTitle = lang === 'de' ? `Vergleich ausgewählter Metriken (AS vs T2 - '${appliedCriteriaDisplayName}')` : `Comparison of selected Metrics (AS vs T2 - '${appliedCriteriaDisplayName}')`;
            if (config.INCLUDE_AS_VS_T2_COMPARISON_CHART) { const chartKey = Object.keys(chartSVGs).find(k => k.startsWith('praes-comp-chart') || k.startsWith('stat-comp-bar')); if(chartSVGs[chartKey]) { html += `<div class="chart-container"><h3>${comparisonChartTitle}</h3>${chartSVGs[chartKey]}</div>`; } }
            const assocHeaders = UI_TEXTS?.exportTab?.[lang]?.htmlReport?.associationHeaders || {feature:'Merkmal', or:'OR (95% CI)', rd:'RD (%) (95% CI)', phi:'Phi', pValue:'p-Wert', test:'Test'};
            if (config.INCLUDE_ASSOCIATIONS_TABLE && statsDataForCurrentKollektiv?.assoziation_angewandt && Object.keys(statsDataForCurrentKollektiv.assoziation_angewandt).length > 0) { html += `<h2>${lang === 'de' ? 'Assoziation mit N-Status':'Association with N-Status'}</h2><table><thead><tr><th>${assocHeaders.feature}</th><th>${assocHeaders.or}</th><th>${assocHeaders.rd}</th><th>${assocHeaders.phi}</th><th>${assocHeaders.pValue}</th><th>${assocHeaders.test}</th></tr></thead><tbody>`; const a = statsDataForCurrentKollektiv.assoziation_angewandt; const na = '--'; const fP = (p) => getPValueText(p, lang); const fRowAssoc = (nm, obj) => { if (!obj) return ''; const orS = formatCI(obj.or?.value, obj.or?.ci?.lower, obj.or?.ci?.upper, 2, false, na, lang); const rdV = formatNumber(obj.rd?.value !== null && !isNaN(obj.rd?.value) ? obj.rd.value * 100 : NaN, 1, na, false, lang); const rdL = formatNumber(obj.rd?.ci?.lower !== null && !isNaN(obj.rd?.ci?.lower) ? obj.rd.ci.lower * 100 : NaN, 1, na, false, lang); const rdU = formatNumber(obj.rd?.ci?.upper !== null && !isNaN(obj.rd?.ci?.upper) ? obj.rd.ci.upper * 100 : NaN, 1, na, false, lang); const rdS = rdV !== na ? `${rdV}% (${rdL}% - ${rdU}%)` : na; const phiS = formatNumber(obj.phi?.value, 2, na, false, lang); const pS = fP(obj.pValue) + ' ' + getStatisticalSignificanceSymbol(obj.pValue); const tN = obj.testName || na; return `<tr><td>${nm}</td><td>${orS}</td><td>${rdS}</td><td>${phiS}</td><td>${pS}</td><td>${tN}</td></tr>`; }; html += fRowAssoc(a?.as?.featureName || (lang==='de'?'AS Positiv':'AS Positive'), a?.as); if (a?.size_mwu) html += `<tr><td>${a.size_mwu.featureName || (lang==='de'?'LK Größe (Median Vgl.)':'LN Size (Median Comp.)')}</td><td>${na}</td><td>${na}</td><td>${na}</td><td>${fP(a.size_mwu.pValue)} ${getStatisticalSignificanceSymbol(a.size_mwu.pValue)}</td><td>${a.size_mwu.testName || na}</td></tr>`; ['size', 'form', 'kontur', 'homogenitaet', 'signal'].forEach(k => { if (a && a[k]) { const isActive = criteria[k]?.active === true; html += fRowAssoc(a[k].featureName + (isActive ? '' : (lang==='de'?' (inaktiv)':' (inactive)')), a[k]); } }); html += `</tbody></table>`; }
            const currentKollektivBfResult = allBruteForceResults ? allBruteForceResults[kollektiv] : null;
            const bfReportHeaders = UI_TEXTS?.exportTab?.[lang]?.bruteForceReportHeaders || { title: "Brute-Force Optimierungsbericht", targetMetric: "Optimierte Zielmetrik", bestValue: "Bester Wert", logic: "Logik", criteria: "Kriterien"};
            if (config.INCLUDE_BRUTEFORCE_BEST_RESULT && currentKollektivBfResult?.results && currentKollektivBfResult.results.length > 0 && currentKollektivBfResult.bestResult) { html += `<h2>${bfReportHeaders.title} (${lang==='de'?'für Kollektiv':'for Cohort'}: ${kollektivName})</h2><div class="meta-info"><ul>`; const best = currentKollektivBfResult.bestResult; html += `<li><strong>${bfReportHeaders.targetMetric}:</strong> ${currentKollektivBfResult.metric}</li><li><strong>${bfReportHeaders.bestValue}:</strong> ${formatNumber(best.metricValue, 4, '--', false, lang)}</li><li><strong>${bfReportHeaders.logic}:</strong> ${UI_TEXTS.t2LogicDisplayNames[lang]?.[best.logic.toUpperCase()] || best.logic.toUpperCase()}</li><li><strong>${bfReportHeaders.criteria}:</strong> ${formatCriteriaFunc(best.criteria, best.logic, false, lang)}</li></ul></div>`; }
            html += `<div class="report-footer">${config.REPORT_AUTHOR} - ${timestamp}</div></body></html>`; return html;
        } catch (error) {
             console.error("Fehler in generateComprehensiveReportHTML:", error);
             return `<html><head><title>${errorTitle}</title></head><body>${errorRenderBody}</body></html>`;
        }
    }

    async function convertTableToPngBlob(tableElementId, baseWidth = 800, lang = 'de') {
        const scale = APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE || 2;
        const targetWidth = baseWidth * scale;
        const errorMsgPrefix = lang === 'de' ? 'Tabelle' : 'Table';
        const errorMsgSuffix = lang === 'de' ? 'nicht gefunden.' : 'not found.';
        const errorMsgNoDims = lang === 'de' ? 'hat keine validen Dimensionen.' : 'has no valid dimensions.';
        const errorMsgCanvas = lang === 'de' ? 'Canvas Context nicht verfügbar.' : 'Canvas context not available.';
        const errorMsgToBlob = lang === 'de' ? 'Canvas toBlob für Tabelle fehlgeschlagen.' : 'Canvas toBlob for table failed.';

        return new Promise((resolve, reject) => {
            const table = document.getElementById(tableElementId);
            if (!table || !(table instanceof HTMLTableElement)) return reject(new Error(`${errorMsgPrefix} '${tableElementId}' ${errorMsgSuffix}`));
            try {
                 const tableBCR = table.getBoundingClientRect();
                 let tableRect = {width: tableBCR.width, height: tableBCR.height, left: tableBCR.left, top: tableBCR.top};
                if(tableRect.width <= 0 || tableRect.height <= 0) {
                    tableRect.width = table.offsetWidth || baseWidth;
                    tableRect.height = table.offsetHeight || (baseWidth * 0.5);
                     if(tableRect.width <= 0 || tableRect.height <= 0) return reject(new Error(`${errorMsgPrefix} '${tableElementId}' ${errorMsgNoDims}`));
                    tableRect.left = table.offsetLeft || 0;
                    tableRect.top = table.offsetTop || 0;
                }

                const effectiveScale = Math.min(scale, targetWidth / tableRect.width);
                const canvas = document.createElement('canvas');
                const targetHeight = tableRect.height * effectiveScale;
                canvas.width = tableRect.width * effectiveScale;
                canvas.height = targetHeight;

                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error(errorMsgCanvas));

                ctx.fillStyle = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.scale(effectiveScale, effectiveScale);

                const tableClone = table.cloneNode(true);
                const tableWrapper = document.createElement('div');
                tableWrapper.style.position = 'absolute';
                tableWrapper.style.left = '-9999px'; // Off-screen
                tableWrapper.appendChild(tableClone);
                document.body.appendChild(tableWrapper);

                const rows = Array.from(tableClone.rows);
                let currentY = 0;
                rows.forEach(row => {
                    const cells = Array.from(row.cells);
                    let currentX = 0;
                    let maxHeightInRow = 0;
                    cells.forEach(cell => {
                        const computedStyle = getComputedStyle(cell);
                        const cellWidth = cell.offsetWidth;
                        const cellHeight = cell.offsetHeight;
                        maxHeightInRow = Math.max(maxHeightInRow, cellHeight);

                        ctx.fillStyle = computedStyle.backgroundColor || 'transparent';
                        if (ctx.fillStyle && ctx.fillStyle !== 'rgba(0, 0, 0, 0)' && ctx.fillStyle !== 'transparent') ctx.fillRect(currentX, currentY, cellWidth, cellHeight);

                        const borderWeight = 1;
                        ctx.strokeStyle = computedStyle.borderTopColor || '#ccc';
                        ctx.lineWidth = borderWeight;
                        ctx.beginPath();
                        ctx.moveTo(currentX, currentY); ctx.lineTo(currentX + cellWidth, currentY);
                        ctx.moveTo(currentX, currentY + cellHeight); ctx.lineTo(currentX + cellWidth, currentY + cellHeight);
                        ctx.moveTo(currentX, currentY); ctx.lineTo(currentX, currentY + cellHeight);
                        ctx.moveTo(currentX + cellWidth, currentY); ctx.lineTo(currentX + cellWidth, currentY + cellHeight);
                        ctx.stroke();

                        ctx.fillStyle = computedStyle.color || '#000';
                        ctx.font = `${computedStyle.fontStyle || 'normal'} ${computedStyle.fontWeight || 'normal'} ${parseFloat(computedStyle.fontSize)}px ${computedStyle.fontFamily || 'sans-serif'}`;
                        ctx.textAlign = computedStyle.textAlign === 'right' ? 'right' : computedStyle.textAlign === 'center' ? 'center' : 'left';
                        ctx.textBaseline = 'middle';

                        const text = cell.innerText || cell.textContent || '';
                        const padL = parseFloat(computedStyle.paddingLeft) || 5;
                        const padR = parseFloat(computedStyle.paddingRight) || 5;
                        const textX = (ctx.textAlign === 'right') ? currentX + cellWidth - padR : (ctx.textAlign === 'center') ? currentX + cellWidth / 2 : currentX + padL;
                        const textY = currentY + cellHeight / 2;
                        ctx.fillText(text.trim(), textX, textY);
                        currentX += cellWidth;
                    });
                    currentY += maxHeightInRow;
                });

                document.body.removeChild(tableWrapper);
                ctx.restore();
                canvas.toBlob((blob) => {
                    if (blob) { resolve(blob); }
                    else { reject(new Error(errorMsgToBlob)); }
                }, 'image/png');
            } catch (error) { reject(error); }
        });
    }

    function exportStatistikCSV(data, kollektiv, criteria, logic, lang = 'de') {
        let stats = null, csvString = null;
        const allBruteForceResults = typeof bruteForceManager !== 'undefined' ? bruteForceManager.getAllResults() : null;
        try { stats = statisticsService.calculateAllStatsForPublication(data, criteria, logic, allBruteForceResults)[kollektiv]; } catch(e) { ui_helpers.showToast(lang==='de'?"Fehler bei Statistikberechnung für CSV.":"Error during statistics calculation for CSV.", "danger"); return; }
        if (!stats) { ui_helpers.showToast(lang==='de'?"Keine Statistikdaten zum Exportieren für dieses Kollektiv.":"No statistics data to export for this cohort.", "warning"); return; }
        try { csvString = generateStatistikCSVString(stats, kollektiv, criteria, logic, lang); } catch(e) { ui_helpers.showToast(lang==='de'?"Fehler bei CSV-Erstellung.":"Error during CSV creation.", "danger"); return; }
        if (csvString === null || csvString.length === 0) { ui_helpers.showToast(lang==='de'?"CSV-Generierung ergab leere Datei.":"CSV generation resulted in an empty file.", "warning"); return; }
        const filename = generateFilename('STATS_CSV', kollektiv, 'csv', {lang: lang});
        if(downloadFile(csvString, filename, 'text/csv;charset=utf-8;')) ui_helpers.showToast(`${lang==='de'?'Statistik':'Statistics'} ${lang==='de'?'als':'as'} CSV ${lang==='de'?'exportiert':'exported'}: ${filename}`, 'success');
    }

    function exportBruteForceReport(resultsData, kollektiv, lang = 'de') {
        if (!resultsData) { ui_helpers.showToast(lang==='de'?"Keine Brute-Force Ergebnisse zum Exportieren vorhanden.":"No Brute-Force results available for export.", "warning"); return; }
        let txtString = null;
        try { txtString = generateBruteForceTXTString(resultsData, kollektiv, lang); } catch(e) { ui_helpers.showToast(lang==='de'?"Fehler bei TXT-Erstellung.":"Error during TXT creation.", "danger"); return; }
        if (txtString === null || txtString.length === 0) { ui_helpers.showToast(lang==='de'?"TXT-Generierung ergab leere Datei.":"TXT generation resulted in an empty file.", "warning"); return; }
        const filename = generateFilename('BRUTEFORCE_TXT', kollektiv, 'txt', {lang: lang});
        if(downloadFile(txtString, filename, 'text/plain;charset=utf-8;')) ui_helpers.showToast(`${lang==='de'?'Brute-Force Bericht':'Brute-Force Report'} ${lang==='de'?'exportiert':'exported'}: ${filename}`, 'success');
    }

    function exportTableMarkdown(dataOrStats, tableType, kollektiv, criteria = null, logic = null, options = {}) {
        const lang = options.lang || 'de';
        let mdString = null; let typeKey = `UnknownTable_${tableType}_MD`, title = tableType;
        try { mdString = generateMarkdownTableString(dataOrStats, tableType, kollektiv, criteria, logic, options); } catch(e) { ui_helpers.showToast(`${lang==='de'?'Fehler bei MD-Erstellung':'Error during MD creation'} (${tableType}).`, "danger"); return; }
        if (mdString === null || mdString.length === 0 || mdString.startsWith('# Fehler') || mdString.startsWith('# Error')) { ui_helpers.showToast(`${lang==='de'?'MD-Generierung ergab leere oder fehlerhafte Datei':'MD generation resulted in empty or faulty file'} (${tableType}).`, "warning"); return; }


        if(tableType === 'daten') { typeKey = 'DATEN_MD'; title = lang==='de'?'Datenliste':'Data List'; }
        else if(tableType === 'auswertung') { typeKey = 'AUSWERTUNG_MD'; title = lang==='de'?'Auswertungstabelle':'Evaluation Table'; }
        else if(tableType === 'deskriptiv') { typeKey = 'DESKRIPTIV_MD'; title = lang==='de'?'Deskriptive Statistik':'Descriptive Statistics'; }
        else if(tableType === 'praes_as_perf') { typeKey = 'PRAES_AS_PERF_MD'; title = lang==='de'?'AS Performance':'AS Performance'; }
        else if(tableType === 'praes_as_vs_t2_perf' || tableType === 'praes_as_vs_t2_comp') { typeKey = 'PRAES_AS_VS_T2_COMP_MD'; title = lang==='de'?'AS vs T2 Metriken':'AS vs T2 Metrics'; }
        else if(tableType === 'praes_as_vs_t2_tests') { typeKey = 'PRAES_AS_VS_T2_TESTS_MD'; title = lang==='de'?'AS vs T2 Tests':'AS vs T2 Tests'; }
        else if(tableType === 'criteria_comparison') { typeKey = 'CRITERIA_COMPARISON_MD'; title = lang==='de'?'Kriterienvergleich':'Criteria Comparison'; }
        else if(tableType === 'publikation_methoden') { typeKey = 'PUBLIKATION_METHODEN_MD'; title = lang==='de'?'Publikation Methoden':'Publication Methods'; options.sectionName = options.sectionName || (lang==='de'?'Methoden':'Methods');}
        else if(tableType === 'publikation_ergebnisse') { typeKey = 'PUBLIKATION_ERGEBNISSE_MD'; title = lang==='de'?'Publikation Ergebnisse':'Publication Results'; options.sectionName = options.sectionName || (lang==='de'?'Ergebnisse':'Results');}


        const filename = generateFilename(typeKey, kollektiv, 'md', { studyId: options?.comparisonCriteriaSet?.id, sectionName: options?.sectionName, lang: lang });
        if(downloadFile(mdString, filename, 'text/markdown;charset=utf-8;')) ui_helpers.showToast(`${title} ${lang==='de'?'als':'as'} Markdown ${lang==='de'?'exportiert':'exported'}: ${filename}`, 'success');
    }

    function exportFilteredDataCSV(data, kollektiv, lang = 'de') {
       let csvString = null;
       try { csvString = generateFilteredDataCSVString(data); } catch(e) { ui_helpers.showToast(lang==='de'?"Fehler bei Rohdaten-CSV-Erstellung.":"Error during raw data CSV creation.", "danger"); return; }
       if (csvString === null || csvString.length === 0) { ui_helpers.showToast(lang==='de'?"Rohdaten-CSV-Generierung ergab leere Datei.":"Raw data CSV generation resulted in an empty file.", "warning"); return; }
       const filename = generateFilename('FILTERED_DATA_CSV', kollektiv, 'csv', {lang: lang});
       if(downloadFile(csvString, filename, 'text/csv;charset=utf-8;')) ui_helpers.showToast(`${lang==='de'?'Gefilterte Daten':'Filtered Data'} ${lang==='de'?'als':'as'} CSV ${lang==='de'?'exportiert':'exported'}: ${filename}`, 'success');
   }

    function exportComprehensiveReportHTML(data, bfResultsForCurrentKollektiv, kollektiv, criteria, logic, lang = 'de') {
        let htmlString = null;
        try { htmlString = generateComprehensiveReportHTML(data, bfResultsForCurrentKollektiv, kollektiv, criteria, logic, lang); } catch(e) { ui_helpers.showToast(lang==='de'?"Fehler bei HTML-Report-Erstellung.":"Error during HTML report creation.", "danger"); return; }
        if (htmlString === null || htmlString.length === 0 || htmlString.includes(lang==='de'?'Fehler: Notwendige Daten für Report fehlen.':'Error: Necessary data for report is missing.')) { ui_helpers.showToast(lang==='de'?"HTML-Report-Generierung ergab leere oder fehlerhafte Datei.":"HTML report generation resulted in an empty or faulty file.", "warning"); return; }
        const filename = generateFilename('COMPREHENSIVE_REPORT_HTML', kollektiv, 'html', {lang: lang});
        if(downloadFile(htmlString, filename, 'text/html;charset=utf-8;')) ui_helpers.showToast(`${lang==='de'?'Umfassender Bericht':'Comprehensive Report'} ${lang==='de'?'exportiert':'exported'}: ${filename}`, 'success');
    }

    async function exportSingleChart(chartElementId, format, kollektiv, options = {}) {
         const lang = options.lang || 'de';
         const svgElement = document.getElementById(chartElementId)?.querySelector('svg'); if (!svgElement) { ui_helpers.showToast(`${lang==='de'?"Diagramm":"Chart"} '${chartElementId}' ${lang==='de'?"für Export nicht gefunden.":"not found for export."}`, 'danger'); return; }
         const chartName = options.chartName || chartElementId.replace(/^chart-/, '').replace(/-container$/, '').replace(/-content$/, '').replace(/-[0-9]+$/, '');
         try {
             let blob = null, filenameKey, mimeType, ext;
             const toastMsgGenerating = lang === 'de' ? `Generiere ${format.toUpperCase()} für Chart ${chartName}...` : `Generating ${format.toUpperCase()} for chart ${chartName}...`;
             ui_helpers.showToast(toastMsgGenerating, 'info', 1500);
             if (format === 'png') { blob = await convertSvgToPngBlob(svgElement); filenameKey = 'CHART_SINGLE_PNG'; mimeType = 'image/png'; ext = 'png'; }
             else if (format === 'svg') { blob = await convertSvgToSvgBlob(svgElement); filenameKey = 'CHART_SINGLE_SVG'; mimeType = 'image/svg+xml;charset=utf-8'; ext = 'svg'; }
             else { throw new Error(`${lang==='de'?"Ungültiges Exportformat":"Invalid export format"}: ${format}`); }
             if (blob) {
                const filename = generateFilename(filenameKey, kollektiv, ext, { chartName, ...options, lang: lang }); // Pass lang for filename generation if needed
                if (downloadFile(blob, filename, mimeType)) ui_helpers.showToast(`${lang==='de'?"Chart":"Chart"} ${chartName} ${lang==='de'?"als":"as"} ${format.toUpperCase()} ${lang==='de'?"exportiert":"exported"}.`, 'success');
             } else {
                 throw new Error(lang==='de'?"Blob-Generierung fehlgeschlagen.":"Blob generation failed.");
             }
         } catch (error) { console.error(`Fehler beim Chart-Export (${chartName}, ${format}):`, error); ui_helpers.showToast(`${lang==='de'?"Fehler beim Chart-Export":"Error during chart export"} (${format.toUpperCase()}).`, 'danger'); }
    }

     async function exportTablePNG(tableElementId, kollektiv, typeKey, tableName = 'Tabelle', lang = 'de') {
         const toastMsgGenerating = lang === 'de' ? `Generiere PNG für Tabelle ${tableName}...` : `Generating PNG for table ${tableName}...`;
         ui_helpers.showToast(toastMsgGenerating, 'info', 1500);
         try {
             const tableElement = document.getElementById(tableElementId); const baseWidth = tableElement?.offsetWidth || 800;
             const blob = await convertTableToPngBlob(tableElementId, baseWidth, lang);
             if (blob) {
                const filename = generateFilename(typeKey, kollektiv, 'png', {tableName: tableName, tableId: tableElementId, lang: lang});
                if(downloadFile(blob, filename, 'image/png')) ui_helpers.showToast(`${lang==='de'?"Tabelle":"Table"} '${tableName}' ${lang==='de'?"als":"as"} PNG ${lang==='de'?"exportiert":"exported"}.`, 'success');
             } else {
                throw new Error(lang==='de'?"Tabellen-Blob-Generierung fehlgeschlagen.":"Table blob generation failed.");
             }
         } catch(error) { console.error(`Fehler beim Tabellen-PNG-Export für '${tableName}':`, error); ui_helpers.showToast(`${lang==='de'?"Fehler beim Tabellen-PNG-Export für":"Error during table PNG export for"} '${tableName}'.`, 'danger'); }
     }

    async function exportChartsZip(scopeSelector, zipTypeKey, kollektiv, format, lang = 'de') {
         const toastMsgStart = lang === 'de' ? `Starte ${format.toUpperCase()}-Export für sichtbare Charts & Tabellen...` : `Starting ${format.toUpperCase()} export for visible charts & tables...`;
         ui_helpers.showToast(toastMsgStart, 'info', 2000);
         if (!window.JSZip) { ui_helpers.showToast(lang==='de'?"JSZip Bibliothek nicht geladen.":"JSZip library not loaded.", "danger"); return; }
         const zip = new JSZip(); const promises = []; let successCount = 0;
         const chartContainers = document.querySelectorAll(scopeSelector + ' [id^="chart-"][style*="height"] svg');
         const tableSelectors = [
            scopeSelector + ' table[id^="table-"]',
            scopeSelector + ' table#auswertung-table',
            scopeSelector + ' table#daten-table',
            scopeSelector + ' table#bruteforce-results-table',
            scopeSelector + ' table#praes-as-vs-t2-comp-table'
         ];
         const tableContainers = (format === 'png' && APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT) ? document.querySelectorAll(tableSelectors.join(', ')) : [];

         if (chartContainers.length === 0 && tableContainers.length === 0) { ui_helpers.showToast(lang==='de'?'Keine Diagramme oder Tabellen im aktuellen Sichtbereich gefunden.':'No charts or tables found in the current view.', 'warning'); return; }

         chartContainers.forEach((svgElement, index) => {
             const chartId = svgElement.closest('[id^="chart-"]')?.id || `chart_${index + 1}`;
             const chartName = chartId.replace(/^chart-/, '').replace(/-container$/, '').replace(/-content$/, '').replace(/-[0-9]+$/, '');
             let filenameKey, conversionPromise, ext;
             if (format === 'png') { filenameKey = 'CHART_SINGLE_PNG'; ext = 'png'; conversionPromise = convertSvgToPngBlob(svgElement).catch(e => { console.error(`PNG Konvertierung für ${chartName} fehlgeschlagen:`, e); return null; }); }
             else if (format === 'svg') { filenameKey = 'CHART_SINGLE_SVG'; ext = 'svg'; conversionPromise = convertSvgToSvgBlob(svgElement).catch(e => { console.error(`SVG Konvertierung für ${chartName} fehlgeschlagen:`, e); return null; }); }
             else { return; }
             const filename = generateFilename(filenameKey, kollektiv, ext, { chartName, lang: lang });
             promises.push(conversionPromise.then(blob => (blob ? { blob, filename } : { error: new Error("Blob is null for chart"), filename })));
         });

         tableContainers.forEach((table, index) => {
              if (format !== 'png') return;
              const tableId = table.id || `exportable-table-${generateUUID()}`; table.id = tableId;
              let tableName = table.closest('.card')?.querySelector('.card-header')?.firstChild?.textContent?.trim() || table.caption?.textContent.trim() || table.id;
              tableName = tableName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
              const typeKey = 'TABLE_PNG_EXPORT';
              const filename = generateFilename(typeKey, kollektiv, 'png', {tableName, tableId, lang: lang});
              const baseWidth = table.offsetWidth || 800;
              promises.push(convertTableToPngBlob(tableId, baseWidth, lang).catch(e => { console.error(`Tabellen-PNG Konvertierung für ${tableName} fehlgeschlagen:`, e); return null; }).then(blob => (blob ? { blob, filename } : { error: new Error("Table Blob is null"), filename })));
         });

         try {
             const results = await Promise.all(promises);
             results.forEach(result => { if (result && result.blob) { zip.file(result.filename, result.blob); successCount++; } else if (result && result.error) { console.error(`Fehler bei Konvertierung für ${result.filename}:`, result.error); } });
             const successMsg = lang === 'de' ? `${successCount} Objekt(e) erfolgreich als ${format.toUpperCase()} exportiert (ZIP).` : `${successCount} object(s) successfully exported as ${format.toUpperCase()} (ZIP).`;
             const errorMsgNoConvert = lang === 'de' ? `Export (${format.toUpperCase()}) fehlgeschlagen: Keine Objekte konnten konvertiert werden.` : `Export (${format.toUpperCase()}) failed: No objects could be converted.`;
             if (successCount > 0) {
                 const zipFilename = generateFilename(zipTypeKey, kollektiv, 'zip', {lang: lang}); const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
                 if (downloadFile(content, zipFilename, "application/zip")) ui_helpers.showToast(successMsg, 'success');
             } else { ui_helpers.showToast(errorMsgNoConvert, 'danger'); }
         } catch (error) {
            const errorMsgZip = lang === 'de' ? `Fehler beim Erstellen des ${format.toUpperCase()} ZIPs.` : `Error creating ${format.toUpperCase()} ZIP.`;
            console.error(errorMsgZip, error); ui_helpers.showToast(errorMsgZip, 'danger');
        }
     }

     async function exportCategoryZip(category, data, bfResults, kollektiv, criteria, logic, lang = 'de') {
         const toastMsgStart = lang === 'de' ? `Generiere ${category.toUpperCase()} ZIP-Paket...` : `Generating ${category.toUpperCase()} ZIP package...`;
         ui_helpers.showToast(toastMsgStart, 'info', 2000);
          if (!window.JSZip) { ui_helpers.showToast(lang==='de'?"JSZip Bibliothek nicht geladen.":"JSZip library not loaded.", "danger"); return; }
         const zip = new JSZip(); let filesAdded = 0; let statsDataForAllKollektive = null;

         const needsStats = ['all-zip', 'csv-zip', 'md-zip', 'html', 'publikation-md-zip'].includes(category);
         if(needsStats && data && data.length > 0 && criteria && logic) {
             try {
                statsDataForAllKollektive = statisticsService.calculateAllStatsForPublication(data, criteria, logic, bfResults);
             } catch(e) { ui_helpers.showToast(`${lang==='de'?"Fehler bei Statistikberechnung für":"Error during statistics calculation for"} ${category.toUpperCase()} ZIP.`, 'danger'); return; }
             if (!statsDataForAllKollektive || !statsDataForAllKollektive[kollektiv]) {
                 ui_helpers.showToast(`${lang==='de'?"Statistikberechnung ergab keine Daten für":"Statistics calculation yielded no data for"} ${category.toUpperCase()} ZIP ${lang==='de'?'für Kollektiv':'for cohort'} ${getKollektivDisplayName(kollektiv, lang)}.`, 'warning');
                 if (category === 'csv-zip' || category === 'html') return;
             }
         }
         const currentKollektivStats = statsDataForAllKollektive ? statsDataForAllKollektive[kollektiv] : null;

         const addFile = (filename, content) => { if (content !== null && content !== undefined && String(content).length > 0) { zip.file(filename, content); filesAdded++; return true; } console.warn(`Überspringe leere oder ungültige Datei: ${filename}`); return false; };
         try {
             if (['all-zip', 'csv-zip'].includes(category)) {
                 if (currentKollektivStats) addFile(generateFilename('STATS_CSV', kollektiv, 'csv', {lang: lang}), generateStatistikCSVString(currentKollektivStats, kollektiv, criteria, logic, lang));
                 if (data && data.length > 0) addFile(generateFilename('FILTERED_DATA_CSV', kollektiv, 'csv', {lang: lang}), generateFilteredDataCSVString(dataProcessor.filterDataByKollektiv(data, kollektiv)));
             }
             if (['all-zip', 'md-zip', 'publikation-md-zip'].includes(category)) {
                 const mdOptions = {lang: lang};
                 if (currentKollektivStats?.deskriptiv) addFile(generateFilename('DESKRIPTIV_MD', kollektiv, 'md', mdOptions), generateMarkdownTableString(currentKollektivStats.deskriptiv, 'deskriptiv', kollektiv, null, null, mdOptions));
                 if (data && data.length > 0) addFile(generateFilename('DATEN_MD', kollektiv, 'md', mdOptions), generateMarkdownTableString(dataProcessor.filterDataByKollektiv(data, kollektiv), 'daten', kollektiv, null, null, mdOptions));
                 if (data && data.length > 0) addFile(generateFilename('AUSWERTUNG_MD', kollektiv, 'md', mdOptions), generateMarkdownTableString(dataProcessor.filterDataByKollektiv(data, kollektiv), 'auswertung', kollektiv, criteria, logic, mdOptions));

                 if (category === 'publikation-md-zip' || category === 'all-zip') {
                     if (typeof publicationTextGenerator !== 'undefined' && statsDataForAllKollektive && state) {
                         const commonDataForPub = {
                            appName: APP_CONFIG.APP_NAME, appVersion: APP_CONFIG.APP_VERSION, currentKollektivName: getKollektivDisplayName(kollektiv, lang),
                            nGesamt: statsDataForAllKollektive.Gesamt?.deskriptiv?.anzahlPatienten || 0,
                            nDirektOP: statsDataForAllKollektive['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
                            nNRCT: statsDataForAllKollektive.nRCT?.deskriptiv?.anzahlPatienten || 0,
                            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
                            ethicsVote: lang === 'de' ? "Ethikvotum Nr. XYZ/2020, Klinikum St. Georg, Leipzig" : "Ethics vote No. XYZ/2020, St. Georg Hospital, Leipzig",
                            references: APP_CONFIG.REPORT_SETTINGS.REFERENCES_FOR_PUBLICATION || { lurzSchaefer2025: "Lurz & Schäfer (2025)" }
                         };
                         PUBLICATION_CONFIG.sections.forEach(mainSection => {
                             mainSection.subSections.forEach(subSection => {
                                const mdContent = _getPublicationSectionContentForExport(subSection.id, lang, statsDataForAllKollektive, commonDataForPub, criteria, logic);
                                const typeKey = subSection.id.startsWith('methoden') ? 'PUBLIKATION_METHODEN_MD' : (subSection.id.startsWith('ergebnisse') ? 'PUBLIKATION_ERGEBNISSE_MD' : 'PUBLIKATION_SONSTIGES_MD');
                                const sectionFilename = generateFilename(typeKey, kollektiv, 'md', {sectionName: subSection.id.replace(/^(methoden_|ergebnisse_)/, ''), lang: lang});
                                addFile(sectionFilename, mdContent);
                             });
                         });
                     }
                 }
             }
             if (['all-zip'].includes(category) && bfResults && bfResults[kollektiv]) { addFile(generateFilename('BRUTEFORCE_TXT', kollektiv, 'txt', {lang: lang}), generateBruteForceTXTString(bfResults[kollektiv], kollektiv, lang)); }
             if (['all-zip', 'html'].includes(category) && data && data.length > 0 ) { addFile(generateFilename('COMPREHENSIVE_REPORT_HTML', kollektiv, 'html', {lang: lang}), generateComprehensiveReportHTML(localRawData, bfResults ? bfResults[kollektiv] : null, kollektiv, criteria, logic, lang)); }

             if (['png-zip'].includes(category)) { await exportChartsZip('#app-container', 'PNG_ZIP', kollektiv, 'png', lang); return; }
             if (['svg-zip'].includes(category)) { await exportChartsZip('#app-container', 'SVG_ZIP', kollektiv, 'svg', lang); return; }

            const successMsg = lang === 'de' ? `${filesAdded} Datei(en) erfolgreich im ${category.toUpperCase()} ZIP-Paket exportiert.` : `${filesAdded} file(s) successfully exported in ${category.toUpperCase()} ZIP package.`;
            const noFilesMsg = lang === 'de' ? `Keine Dateien für das ${category.toUpperCase()} ZIP-Paket gefunden oder generiert.` : `No files found or generated for the ${category.toUpperCase()} ZIP package.`;
            if (filesAdded > 0) {
                const zipFilename = generateFilename(`${category.toUpperCase()}_PAKET`, kollektiv, 'zip', {lang: lang});
                const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
                if (downloadFile(content, zipFilename, "application/zip")) ui_helpers.showToast(successMsg, 'success');
            } else { ui_helpers.showToast(noFilesMsg, 'warning'); }
         } catch (error) {
            const errorMsgZip = lang === 'de' ? `Fehler beim Erstellen des ${category.toUpperCase()} ZIP-Pakets.` : `Error creating ${category.toUpperCase()} ZIP package.`;
            console.error(errorMsgZip, error); ui_helpers.showToast(errorMsgZip, 'danger');
        }
     }

     function exportPraesentationData(actionId, presentationData, kollektiv) {
            const lang = state.getCurrentPublikationLang ? state.getCurrentPublikationLang() : 'de'; // Use publication lang if on that tab, else default.
            let content = null, filenameKey = null, extension = null, mimeType = null, options = {lang: lang}, success = false; const na = '--';
            if (!presentationData) { ui_helpers.showToast(lang==='de'?"Keine Daten für Präsentationsexport verfügbar.":"No data available for presentation export.", "warning"); return; }
            const { statsAS, statsT2, vergleich, comparisonCriteriaSet, patientCount, statsGesamt, statsDirektOP, statsNRCT } = presentationData;
            const isAsPurView = actionId.includes('-as-pur-');
            const isAsVsT2View = actionId.includes('-as-vs-t2-');
            options.studyId = comparisonCriteriaSet?.id || null;
            if (presentationData.t2CriteriaLabelShort) options.t2CriteriaLabelShort = presentationData.t2CriteriaLabelShort; // Already language-aware from praesentation_tab_logic
            if (presentationData.t2CriteriaLabelFull) options.t2CriteriaLabelFull = presentationData.t2CriteriaLabelFull; // Already language-aware

            try {
                if (isAsPurView && actionId === 'download-performance-as-pur-csv') {
                     const allStatsData = { statsGesamt, statsDirektOP, statsNRCT };
                     const csvHeaders = UI_TEXTS?.exportTab?.[lang]?.praesAsPerfCsvHeaders || { cohort: "Kollektiv", n: "N", sens: "Sens", sensCiLow: "Sens CI Low", sensCiHigh: "Sens CI High", spec: "Spez", specCiLow: "Spez CI Low", specCiHigh: "Spez CI High", ppv: "PPV", ppvCiLow: "PPV CI Low", ppvCiHigh: "PPV CI High", npv: "NPV", npvCiLow: "NPV CI Low", npvCiHigh: "NPV CI High", acc: "Acc", accCiLow: "Acc CI Low", accCiHigh: "Acc CI High", balAcc: "BalAcc", balAccCiLow: "BalAcc CI Low", balAccCiHigh: "BalAcc CI High", f1: "F1", f1CiLow: "F1 CI Low", f1CiHigh: "F1 CI High", auc: "AUC", aucCiLow: "AUC CI Low", aucCiHigh: "AUC CI High", ciMethod: "CI Method" };
                     const headers = Object.values(csvHeaders);
                     const fVal = (v, d=1) => formatNumber(v, d, na, false, lang);
                     const rows = Object.entries(allStatsData).map(([key, stats]) => { let k = key.replace('stats',''); let dN = (k === 'DirektOP') ? 'direkt OP' : (k === 'NRCT') ? 'nRCT' : k; if (!stats || typeof stats.matrix !== 'object') return [getKollektivDisplayName(dN, lang), 0, ...Array(24).fill(na), na]; const n = stats.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : 0; const fRowData = (m, metric_k) => { const dig = (metric_k === 'f1' || metric_k === 'auc') ? 3 : 1; return [fVal(m?.value, dig), fVal(m?.ci?.lower, dig), fVal(m?.ci?.upper, dig)]; }; return [ getKollektivDisplayName(dN, lang), n, ...fRowData(stats.sens, 'sens'), ...fRowData(stats.spez, 'spez'), ...fRowData(stats.ppv, 'ppv'), ...fRowData(stats.npv, 'npv'), ...fRowData(stats.acc, 'acc'), ...fRowData(stats.balAcc, 'balAcc'), ...fRowData(stats.f1, 'f1'), ...fRowData(stats.auc, 'auc'), stats.sens?.method || na ]; });
                     content = Papa.unparse([headers, ...rows], { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" }); filenameKey = 'PRAES_AS_PERF_CSV'; extension = 'csv'; mimeType = 'text/csv;charset=utf-8;';
                } else if (isAsPurView && actionId === 'download-performance-as-pur-md') { options.kollektiv = kollektiv; content = generateMarkdownTableString(presentationData, 'praes_as_perf', kollektiv, null, null, options); filenameKey = 'PRAES_AS_PERF_MD'; extension = 'md'; mimeType = 'text/markdown;charset=utf-8;';
                } else if (isAsVsT2View && actionId === 'download-performance-as-vs-t2-csv') { if (!statsAS || !statsT2) { ui_helpers.showToast(lang==='de'?"Vergleichsdaten für CSV fehlen.":"Comparison data for CSV missing.", "warning"); return; } const csvHeaders = UI_TEXTS?.exportTab?.[lang]?.praesAsVsT2PerfCsvHeaders || { metric: "Metrik", asValue: "AS (Wert)", asCI: "AS (95% CI)", t2Value: "T2 (Wert)", t2CI: "T2 (95% CI)", ciMethodAS: "CI Methode AS", ciMethodT2: "CI Methode T2"}; const headers = Object.values(csvHeaders); const fRow = (mKey, nm, isP = true, d = 1) => { const mAS = statsAS[mKey]; const mT2 = statsT2[mKey]; const dig = (mKey === 'auc' || mKey === 'f1') ? 3 : d; const ciAS = `(${formatNumber(mAS?.ci?.lower, dig, na, false, lang)} - ${formatNumber(mAS?.ci?.upper, dig, na, false, lang)})`; const ciT2 = `(${formatNumber(mT2?.ci?.lower, dig, na, false, lang)} - ${formatNumber(mT2?.ci?.upper, dig, na, false, lang)})`; const valAS = formatNumber(mAS?.value, dig, na, false, lang); const valT2 = formatNumber(mT2?.value, dig, na, false, lang); const metricNameLocalized = UI_TEXTS.statMetrics[lang]?.[mKey]?.name || UI_TEXTS.statMetrics.de[mKey]?.name || nm; return [metricNameLocalized, valAS, ciAS, valT2, ciT2, mAS?.method || na, mT2?.method || na]; }; const rows = [ fRow('sens', 'Sensitivität'), fRow('spez', 'Spezifität'), fRow('ppv', 'PPV'), fRow('npv', 'NPV'), fRow('acc', 'Accuracy'), fRow('balAcc', 'Balanced Accuracy'), fRow('f1', 'F1-Score', false, 3), fRow('auc', 'AUC', false, 3) ]; content = Papa.unparse([headers, ...rows], { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" }); filenameKey = 'PRAES_AS_VS_T2_PERF_CSV'; extension = 'csv'; mimeType = 'text/csv;charset=utf-8;';
                } else if (isAsVsT2View && actionId === 'download-comp-table-as-vs-t2-md') { content = generateMarkdownTableString(presentationData, 'praes_as_vs_t2_comp', kollektiv, null, null, options); filenameKey = 'PRAES_AS_VS_T2_COMP_MD'; extension = 'md'; mimeType = 'text/markdown;charset=utf-8;';
                } else if (isAsVsT2View && actionId === 'download-tests-as-vs-t2-md') { content = generateMarkdownTableString(presentationData, 'praes_as_vs_t2_tests', kollektiv, null, null, options); filenameKey = 'PRAES_AS_VS_T2_TESTS_MD'; extension = 'md'; mimeType = 'text/markdown;charset=utf-8;';
                } else if (actionId.includes('-chart-') || actionId.startsWith('dl-praes-')) { ui_helpers.showToast(lang==='de'?"Chart-Export wird über die Buttons am Chart selbst ausgelöst.":"Chart export is triggered via buttons on the chart itself.", "info"); return; }
            } catch(error) {
                console.error(`Fehler bei Präsentationsexport ${actionId}:`, error);
                ui_helpers.showToast(`${lang==='de'?"Fehler bei Präsentationsexport":"Error during presentation export"} (${actionId}).`, "danger");
                return;
            }

            if(content !== null && filenameKey && extension && mimeType) { const filename = generateFilename(filenameKey, kollektiv, extension, options); success = downloadFile(content, filename, mimeType); if(success) ui_helpers.showToast(`${lang==='de'?"Präsentationsdaten":"Presentation data"} (${extension}) ${lang==='de'?"exportiert":"exported"}: ${filename}`, 'success'); }
            else if(!actionId.includes('-chart-') && !actionId.startsWith('dl-') ) { ui_helpers.showToast(lang==='de'?"Export für diese Option nicht verfügbar oder Daten fehlen/Fehler bei Generierung.":"Export for this option not available or data missing/error during generation.", "warning"); }
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
        generateFilename
    });

})();
