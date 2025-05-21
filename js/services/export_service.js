const exportService = (() => {

    function generateFilename(typeKey, kollektiv, extension, options = {}) {
        const langKey = state.getCurrentPublikationLang() || 'de';
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(kollektiv, langKey).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
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
            const safeSectionName = String(options.sectionName).replace(/[^a-z0-9_-]/gi, '_').substring(0,30);
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

    function downloadFile(content, filename, mimeType) {
        try {
            if (content === null || content === undefined) {
                 ui_helpers.showToast(`Export fehlgeschlagen: Keine Daten für ${filename} generiert.`, 'warning');
                 return false;
            }
            let blob;
            if (content instanceof Blob) {
                blob = content;
                if (blob.size === 0) {
                    ui_helpers.showToast(`Export fehlgeschlagen: Leere Datei für ${filename} generiert.`, 'warning');
                    return false;
                }
            } else {
                 const stringContent = String(content);
                 if (stringContent.length === 0) {
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

    function generateStatistikCSVString(stats, kollektiv, criteria, logic) {
        const langKey = state.getCurrentPublikationLang() || 'de';
        if (!stats || !stats.deskriptiv) return null;
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? (c, l) => studyT2CriteriaManager.formatCriteriaForDisplay(c, l, false, langKey) : (c, l) => 'N/A';
        const csvData = []; const na = 'N/A';
        const fv = (v, d = 1, p = false) => formatNumber(v, d, na, p, langKey);
        const fp = (v, d = 1) => formatPercent(v, d, na, langKey);
        const fCICSV = (o, d, p) => !o || typeof o !== 'object' || o.lower === null || o.upper === null || isNaN(o.lower) || isNaN(o.upper) ? [na, na] : [fv(o.lower, d, p), fv(o.upper, d, p)];
        const fPVal = (pv) => (pv !== null && !isNaN(pv)) ? (pv < 0.001 ? (langKey==='de'?'<0,001':'<.001') : formatNumber(pv, 3, na, false, langKey)) : na;

        try {
            csvData.push(['Parameter', 'Wert']); csvData.push(['Kollektiv', getKollektivDisplayName(kollektiv, langKey)]); csvData.push(['Angewandte T2 Logik', UI_TEXTS.t2LogicDisplayNames[logic]?.[langKey] || logic]); csvData.push(['Angewandte T2 Kriterien', formatCriteriaFunc(criteria, logic)]); csvData.push(['Anzahl Patienten', stats.deskriptiv.anzahlPatienten]); csvData.push([]);
            csvData.push(['Metrik (Deskriptiv)', 'Wert (Median)', 'Mean', 'SD', 'Min', 'Max']); const d = stats.deskriptiv;
            csvData.push(['Alter (Jahre)', fv(d.alter?.median, 1), fv(d.alter?.mean, 1), fv(d.alter?.sd, 1), fv(d.alter?.min, 0), fv(d.alter?.max, 0)]);
            csvData.push([`Geschlecht ${UI_TEXTS.legendLabels.male[langKey]} (n / %)`, `${d.geschlecht?.m ?? 0} / ${fp(d.anzahlPatienten > 0 ? (d.geschlecht?.m ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push([`Geschlecht ${UI_TEXTS.legendLabels.female[langKey]} (n / %)`, `${d.geschlecht?.f ?? 0} / ${fp(d.anzahlPatienten > 0 ? (d.geschlecht?.f ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push([`Therapie ${UI_TEXTS.legendLabels.direktOP[langKey]} (n / %)`, `${d.therapie?.['direkt OP'] ?? 0} / ${fp(d.anzahlPatienten > 0 ? (d.therapie?.['direkt OP'] ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push([`Therapie ${UI_TEXTS.legendLabels.nRCT[langKey]} (n / %)`, `${d.therapie?.nRCT ?? 0} / ${fp(d.anzahlPatienten > 0 ? (d.therapie?.nRCT ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push([`N Status (${UI_TEXTS.legendLabels.nPositive[langKey]} / %)`, `${d.nStatus?.plus ?? 0} / ${fp(d.anzahlPatienten > 0 ? (d.nStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push([`AS Status (${UI_TEXTS.legendLabels.asPositive[langKey]} / %)`, `${d.asStatus?.plus ?? 0} / ${fp(d.anzahlPatienten > 0 ? (d.asStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            csvData.push([`T2 Status (${UI_TEXTS.legendLabels.t2Positive[langKey]} / %)`, `${d.t2Status?.plus ?? 0} / ${fp(d.anzahlPatienten > 0 ? (d.t2Status?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`]);
            const fLKRow = (lk) => [fv(lk?.median, 1), fv(lk?.mean, 1), fv(lk?.sd, 1), fv(lk?.min, 0), fv(lk?.max, 0)];
            csvData.push(['LK N gesamt (Median)', ...fLKRow(d.lkAnzahlen?.n?.total)]); csvData.push([`LK N${UI_TEXTS.legendLabels.nPositive[langKey]} (Median, nur N+ Pat.)`, ...fLKRow(d.lkAnzahlen?.n?.plus)]); csvData.push(['LK AS gesamt (Median)', ...fLKRow(d.lkAnzahlen?.as?.total)]); csvData.push([`LK AS${UI_TEXTS.legendLabels.asPositive[langKey]} (Median, nur AS+ Pat.)`, ...fLKRow(d.lkAnzahlen?.as?.plus)]); csvData.push(['LK T2 gesamt (Median)', ...fLKRow(d.lkAnzahlen?.t2?.total)]); csvData.push([`LK T2${UI_TEXTS.legendLabels.t2Positive[langKey]} (Median, nur T2+ Pat.)`, ...fLKRow(d.lkAnzahlen?.t2?.plus)]); csvData.push([]);
            csvData.push(['Metrik (Diagnostik)', 'Methode', 'Wert', '95% CI Lower', '95% CI Upper', 'SE (Bootstrap)', 'CI Methode']); const addPerfRow = (metricKey, metricName, objAS, objT2) => { const isRate = !(metricKey === 'auc' || metricKey === 'f1'); const digits = isRate ? 1 : 3; const useStandard = metricKey === 'auc' || metricKey === 'f1'; const ciAS = fCICSV(objAS?.ci, digits, useStandard); const ciT2 = fCICSV(objT2?.ci, digits, useStandard); const valAS = isRate ? fp(objAS?.value, digits) : fv(objAS?.value, digits, useStandard); const valT2 = isRate ? fp(objT2?.value, digits) : fv(objT2?.value, digits, useStandard); csvData.push([metricName, 'AS', valAS, ciAS[0], ciAS[1], fv(objAS?.se, 4, true), objAS?.method || na]); csvData.push([metricName, 'T2', valT2, ciT2[0], ciT2[1], fv(objT2?.se, 4, true), objT2?.method || na]); }; const gAS = stats.gueteAS, gT2 = stats.gueteT2_angewandt || stats.gueteT2; addPerfRow('sens', 'Sensitivität', gAS?.sens, gT2?.sens); addPerfRow('spez', 'Spezifität', gAS?.spez, gT2?.spez); addPerfRow('ppv', 'PPV', gAS?.ppv, gT2?.ppv); addPerfRow('npv', 'NPV', gAS?.npv, gT2?.npv); addPerfRow('acc', 'Accuracy', gAS?.acc, gT2?.acc); addPerfRow('balAcc', 'Balanced Accuracy', gAS?.balAcc, gT2?.balAcc); addPerfRow('f1', 'F1-Score', gAS?.f1, gT2?.f1); addPerfRow('auc', 'AUC', gAS?.auc, gT2?.auc); csvData.push([]);
            csvData.push(['Vergleichstest (AS vs. T2 angewandt)', 'Test Statistik', 'p-Wert', 'Methode']); const v = stats.vergleichASvsT2_angewandt || stats.vergleichASvsT2; csvData.push(['Accuracy (McNemar)', fv(v?.mcnemar?.statistic, 3, true), fPVal(v?.mcnemar?.pValue), v?.mcnemar?.method || na]); csvData.push(['AUC (DeLong)', `Z=${fv(v?.delong?.Z, 3, true)} (Diff: ${fv(v?.delong?.diffAUC,3,true)})`, fPVal(v?.delong?.pValue), v?.delong?.method || na]); csvData.push([]);
            csvData.push(['Assoziation mit N-Status', 'Merkmal Key', 'Merkmal Name', 'OR', 'OR CI Lower', 'OR CI Upper', 'RD (%)', 'RD CI Lower (%)', 'RD CI Upper (%)', 'Phi', 'Test Statistik', 'p-Wert', 'Test Methode']); const addAssocRow = (key, name, obj) => { if (!obj) return; const orCI = fCICSV(obj.or?.ci, 2, true); const rdVal = obj.rd?.value !== null && !isNaN(obj.rd?.value) ? obj.rd.value * 100 : NaN; const rdCILow = obj.rd?.ci?.lower !== null && !isNaN(obj.rd?.ci?.lower) ? obj.rd.ci.lower * 100 : NaN; const rdCIUpp = obj.rd?.ci?.upper !== null && !isNaN(obj.rd?.ci?.upper) ? obj.rd.ci.upper * 100 : NaN; csvData.push([ key, name, fv(obj.or?.value, 2, true), orCI[0], orCI[1], fv(rdVal, 1), fv(rdCILow, 1), fv(rdCIUpp, 1), fv(obj.phi?.value, 2, true), fv(obj.statistic ?? NaN, 2, true), fPVal(obj.pValue), obj.testName || na ]); }; const a = stats.assoziation_angewandt || stats.assoziation; if (a) { addAssocRow('as', a?.as?.featureName || 'AS Positiv', a?.as); if(a?.size_mwu) { csvData.push(['size_mwu', a.size_mwu.featureName || 'LK Größe MWU', na, na, na, na, na, na, na, `U=${fv(a.size_mwu.statistic, 0, true)}, Z=${fv(a.size_mwu.Z,2,true)}`, fPVal(a.size_mwu.pValue), a.size_mwu.testName || na ]); } ['size', 'form', 'kontur', 'homogenitaet', 'signal'].forEach(fKey => { if(a && a[fKey]) { addAssocRow(fKey, a[fKey].featureName || `T2 ${fKey}`, a[fKey]); } }); }
            return Papa.unparse(csvData, { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" });
        } catch (error) {
             return null;
        }
    }

    function generateBruteForceTXTString(resultsData, kollektiv) {
        const langKey = state.getCurrentPublikationLang() || 'de';
        if (!resultsData || !resultsData.results || resultsData.results.length === 0) return langKey === 'de' ? "Keine Brute-Force-Ergebnisse vorhanden." : "No brute-force results available.";
        try {
            const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? (c, l) => studyT2CriteriaManager.formatCriteriaForDisplay(c, l, false, langKey) : (c, l) => 'Formatierungsfehler';
            const { results, metric, duration, totalTested, kollektiv: bfKollektiv } = resultsData; const kollektivName = getKollektivDisplayName(bfKollektiv || kollektiv, langKey); const bestResult = results[0];
            let report = `${langKey==='de'?'Brute-Force Optimierungsbericht':'Brute-Force Optimization Report'}\r\n==================================================\r\n${langKey==='de'?'Datum der Analyse:':'Date of Analysis:'} ${new Date().toLocaleString(langKey === 'de' ? 'de-DE' : 'en-US')}\r\n${langKey==='de'?'Analysiertes Kollektiv:':'Analyzed Cohort:'} ${kollektivName}\r\n${langKey==='de'?'Optimierte Zielmetrik:':'Optimized Target Metric:'} ${metric}\r\n${langKey==='de'?'Gesamtdauer:':'Total Duration:'} ${formatNumber((duration || 0) / 1000, 1, 'N/A', false, langKey)} ${langKey==='de'?'Sekunden':'seconds'}\r\n${langKey==='de'?'Getestete Kombinationen:':'Tested Combinations:'} ${formatNumber(totalTested, 0, 'N/A', false, langKey)}\r\n==================================================\r\n\r\n--- ${langKey==='de'?'Bestes Ergebnis':'Best Result'} ---\r\n${langKey==='de'?'Logik:':'Logic:'} ${UI_TEXTS.t2LogicDisplayNames[bestResult.logic.toUpperCase()]?.[langKey] || bestResult.logic.toUpperCase()}\r\n${langKey==='de'?'Kriterien:':'Criteria:'} ${formatCriteriaFunc(bestResult.criteria, bestResult.logic)}\r\n${langKey==='de'?'Erreichte':'Achieved'} ${metric}: ${formatNumber(bestResult.metricValue, 4, 'N/A', false, langKey)}\r\n\r\n--- ${langKey==='de'?'Top Ergebnisse (inklusive identischer Werte bis Rang 10+)':'Top Results (incl. identical values up to rank 10+)'} ---\r\n${langKey==='de'?'Rang':'Rank'} | ${metric.padEnd(12)} | ${langKey==='de'?'Logik':'Logic'} | ${langKey==='de'?'Kriterien':'Criteria'}\r\n-----|--------------|-------|------------------------------------------\r\n`;
            let rank = 1, displayedCount = 0, lastMetricValue = -Infinity; const precision = 1e-8;
            for (let i = 0; i < results.length; i++) { const result = results[i]; if (!result || typeof result.metricValue !== 'number' || !isFinite(result.metricValue)) continue; const currentMetricValueRounded = parseFloat(result.metricValue.toFixed(precision)); const lastMetricValueRounded = parseFloat(lastMetricValue.toFixed(precision)); let currentRankDisplay = rank; const isNewRank = Math.abs(currentMetricValueRounded - lastMetricValueRounded) > precision; if (i > 0 && isNewRank) { rank = displayedCount + 1; currentRankDisplay = rank; } else if (i > 0) { currentRankDisplay = rank; } report += `${String(currentRankDisplay).padEnd(4)} | ${formatNumber(result.metricValue, 4, 'N/A', false, langKey).padEnd(12)} | ${(UI_TEXTS.t2LogicDisplayNames[result.logic.toUpperCase()]?.[langKey] || result.logic.toUpperCase()).padEnd(5)} | ${formatCriteriaFunc(result.criteria, result.logic)}\r\n`; if (isNewRank || i === 0) { lastMetricValue = result.metricValue; } displayedCount++; }
            report += `==================================================\r\n`; return report;
        } catch (error) {
             return null;
        }
    }

    function generateMarkdownTableString(dataOrStats, tableType, kollektiv, criteria = null, logic = null, options = {}) {
        const langKey = state.getCurrentPublikationLang() || 'de';
        try {
            let headers = [], rows = [], title = ''; const kollektivDisplayName = getKollektivDisplayName(kollektiv, langKey); const escMD = ui_helpers.escapeMarkdown; const na = '--'; const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? (c, l) => studyT2CriteriaManager.formatCriteriaForDisplay(c, l, false, langKey) : (c, l) => 'N/A'; const t2CriteriaLabelShort = options.t2CriteriaLabelShort ? (UI_TEXTS.kollektivDisplayNames[options.t2CriteriaLabelShort]?.[langKey] || options.t2CriteriaLabelShort) : 'T2';
            const titleLang = (titleKey) => UI_TEXTS.publicationTableTitles?.[titleKey]?.[langKey] || (langKey==='de'?'Unbekannter Titel':'Unknown Title');

            if (tableType === 'daten') { title = langKey==='de'?'Datenliste':'Data List'; headers = [langKey==='de'?'Nr':'No', langKey==='de'?'Name':'Name', langKey==='de'?'Vorname':'First Name', langKey==='de'?'Geschl.':'Sex', langKey==='de'?'Alter':'Age', langKey==='de'?'Therapie':'Therapy', 'N', 'AS', 'T2', langKey==='de'?'Bemerkung':'Comment']; if(!Array.isArray(dataOrStats)) return `# ${title}...\n\n${langKey==='de'?'Fehler: Ungültige Daten.':'Error: Invalid data.'}`; rows = dataOrStats.map(p => [p.nr, p.name || '', p.vorname || '', p.geschlecht || '', p.alter ?? '', getKollektivDisplayName(p.therapie, langKey), p.n ?? na, p.as ?? na, p.t2 ?? na, p.bemerkung || ''].map(escMD)); }
            else if (tableType === 'auswertung') { title = langKey==='de'?'Auswertungstabelle':'Evaluation Table'; headers = [langKey==='de'?'Nr':'No', langKey==='de'?'Name':'Name', langKey==='de'?'Therapie':'Therapy', 'N', 'AS', 'T2', `N+/${langKey==='de'?'N ges':'N total'}`, `AS+/${langKey==='de'?'AS ges':'AS total'}`, `T2+/${langKey==='de'?'T2 ges':'T2 total'}`]; if(!Array.isArray(dataOrStats)) return `# ${title}...\n\n${langKey==='de'?'Fehler: Ungültige Daten.':'Error: Invalid data.'}`; rows = dataOrStats.map(p => [p.nr, p.name || '', getKollektivDisplayName(p.therapie, langKey), p.n ?? na, p.as ?? na, p.t2 ?? na, `${formatNumber(p.anzahl_patho_n_plus_lk, 0, '-', false, langKey)} / ${formatNumber(p.anzahl_patho_lk, 0, '-', false, langKey)}`, `${formatNumber(p.anzahl_as_plus_lk, 0, '-', false, langKey)} / ${formatNumber(p.anzahl_as_lk, 0, '-', false, langKey)}`, `${formatNumber(p.anzahl_t2_plus_lk, 0, '-', false, langKey)} / ${formatNumber(p.anzahl_t2_lk, 0, '-', false, langKey)}`].map(escMD)); }
            else if (tableType === 'deskriptiv') { title = langKey==='de'?'Deskriptive Statistik':'Descriptive Statistics'; const stats = dataOrStats; if (!stats || !stats.anzahlPatienten) return `# ${title} (${langKey==='de'?'Kollektiv:':'Cohort:'} ${kollektivDisplayName})\n\n${langKey==='de'?'Keine Daten verfügbar.':'No data available.'}`; const total = stats.anzahlPatienten; headers = [langKey==='de'?'Metrik':'Metric', langKey==='de'?'Wert':'Value']; const fLKRowMD = (lk) => `${formatNumber(lk?.median, 1, na, false, langKey)} (${formatNumber(lk?.min, 0, na, false, langKey)}-${formatNumber(lk?.max, 0, na, false, langKey)}) \\[Mean: ${formatNumber(lk?.mean, 1, na, false, langKey)} ± ${formatNumber(lk?.sd, 1, na, false, langKey)}\\]`; rows = [ [langKey==='de'?'Anzahl Patienten':'Number of Patients', total], [langKey==='de'?'Median Alter (Min-Max) \\[Mean ± SD\\]':'Median Age (Min-Max) \\[Mean ± SD\\]', `${formatNumber(stats.alter?.median, 1, na, false, langKey)} (${formatNumber(stats.alter?.min, 0, na, false, langKey)} - ${formatNumber(stats.alter?.max, 0, na, false, langKey)}) \\[${formatNumber(stats.alter?.mean, 1, na, false, langKey)} ± ${formatNumber(stats.alter?.sd, 1, na, false, langKey)}\\]`], [langKey==='de'?'Geschlecht (m/w) (n / %)':'Sex (m/f) (n / %)', `${stats.geschlecht?.m ?? 0} / ${stats.geschlecht?.f ?? 0} (${formatPercent((stats.geschlecht?.m ?? 0) / total, 1, na, langKey)} / ${formatPercent((stats.geschlecht?.f ?? 0) / total, 1, na, langKey)})`], [langKey==='de'?'Therapie (direkt OP / nRCT) (n / %)':'Therapy (Upfront Surgery / nCRT) (n / %)', `${stats.therapie?.['direkt OP'] ?? 0} / ${stats.therapie?.nRCT ?? 0} (${formatPercent((stats.therapie?.['direkt OP'] ?? 0) / total, 1, na, langKey)} / ${formatPercent((stats.therapie?.nRCT ?? 0) / total, 1, na, langKey)})`], [`N Status (${UI_TEXTS.legendLabels.nPositive[langKey]} / ${UI_TEXTS.legendLabels.nNegative[langKey]}) (n / %)`, `${stats.nStatus?.plus ?? 0} / ${stats.nStatus?.minus ?? 0} (${formatPercent((stats.nStatus?.plus ?? 0) / total, 1, na, langKey)} / ${formatPercent((stats.nStatus?.minus ?? 0) / total, 1, na, langKey)})`], [`AS Status (${UI_TEXTS.legendLabels.asPositive[langKey]} / ${UI_TEXTS.legendLabels.asNegative[langKey]}) (n / %)`, `${stats.asStatus?.plus ?? 0} / ${stats.asStatus?.minus ?? 0} (${formatPercent((stats.asStatus?.plus ?? 0) / total, 1, na, langKey)} / ${formatPercent((stats.asStatus?.minus ?? 0) / total, 1, na, langKey)})`], [`T2 Status (${UI_TEXTS.legendLabels.t2Positive[langKey]} / ${UI_TEXTS.legendLabels.t2Negative[langKey]}) (n / %)`, `${stats.t2Status?.plus ?? 0} / ${stats.t2Status?.minus ?? 0} (${formatPercent((stats.t2Status?.plus ?? 0) / total, 1, na, langKey)} / ${formatPercent((stats.t2Status?.minus ?? 0) / total, 1, na, langKey)})`], [langKey==='de'?'Median LK N ges. (Min-Max) \\[Mean ± SD\\]':'Median LN N total (Min-Max) \\[Mean ± SD\\]', fLKRowMD(stats.lkAnzahlen?.n?.total)], [langKey==='de'?'Median LK N+ (Min-Max) \\[Mean ± SD\\] (nur N+ Pat.)':'Median LN N+ (Min-Max) \\[Mean ± SD\\] (N+ pts only)', fLKRowMD(stats.lkAnzahlen?.n?.plus)], [langKey==='de'?'Median LK AS ges. (Min-Max) \\[Mean ± SD\\]':'Median LN AS total (Min-Max) \\[Mean ± SD\\]', fLKRowMD(stats.lkAnzahlen?.as?.total)], [langKey==='de'?'Median LK AS+ (Min-Max) \\[Mean ± SD\\] (nur AS+ Pat.)':'Median LN AS+ (Min-Max) \\[Mean ± SD\\] (AS+ pts only)', fLKRowMD(stats.lkAnzahlen?.as?.plus)], [langKey==='de'?'Median LK T2 ges. (Min-Max) \\[Mean ± SD\\]':'Median LN T2 total (Min-Max) \\[Mean ± SD\\]', fLKRowMD(stats.lkAnzahlen?.t2?.total)], [langKey==='de'?'Median LK T2+ (Min-Max) \\[Mean ± SD\\] (nur T2+ Pat.)':'Median LN T2+ (Min-Max) \\[Mean ± SD\\] (T2+ pts only)', fLKRowMD(stats.lkAnzahlen?.t2?.plus)] ].map(r => r.map(escMD)); }
            else if (tableType === 'praes_as_perf') { title = langKey === 'de' ? `Diagnostische Güte (AS) für Kollektive` : `Diagnostic Performance (AS) for Cohorts`; const { statsGesamt, statsDirektOP, statsNRCT } = dataOrStats || {}; if (!statsGesamt && !statsDirektOP && !statsNRCT) return `# ${title}\n\n${langKey==='de'?'Fehler: Ungültige Daten.':'Error: Invalid data.'}`; headers = [langKey==='de'?'Kollektiv':'Cohort', 'Sens. (95% CI)', 'Spez. (95% CI)', 'PPV (95% CI)', 'NPV (95% CI)', 'Acc. (95% CI)', 'AUC (95% CI)']; const fRow = (s, k_id) => { const d = getKollektivDisplayName(k_id, langKey); if (!s || typeof s.matrix !== 'object') return [d + ' (N=?)', na, na, na, na, na, na].map(escMD); const n = s.matrix ? (s.matrix.rp + s.matrix.fp + s.matrix.fn + s.matrix.rn) : 0; const fCI_md = (m, ky) => { const dig = (ky === 'auc' || ky === 'f1') ? 3 : 1; const isP = !(ky === 'auc' || ky === 'f1'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, dig, isP, na, langKey); }; return [`${d} (N=${n})`, fCI_md(s.sens, 'sens'), fCI_md(s.spez, 'spez'), fCI_md(s.ppv, 'ppv'), fCI_md(s.npv, 'npv'), fCI_md(s.acc, 'acc'), fCI_md(s.auc, 'auc')].map(escMD); }; rows = [ fRow(statsGesamt, 'Gesamt'), fRow(statsDirektOP, 'direkt OP'), fRow(statsNRCT, 'nRCT') ]; }
            else if (tableType === 'praes_as_vs_t2_perf' || tableType === 'praes_as_vs_t2_comp') { const { statsAS, statsT2 } = dataOrStats || {}; title = langKey==='de'?`Vergleich Diagnostische Güte (AS vs. ${escMD(t2CriteriaLabelShort)})`:`Comparison Diagnostic Performance (AS vs. ${escMD(t2CriteriaLabelShort)})`; if (!statsAS || !statsT2) return `# ${title} (${langKey==='de'?'Kollektiv:':'Cohort:'} ${kollektivDisplayName})\n\n${langKey==='de'?'Fehler: Ungültige Daten für Vergleich.':'Error: Invalid data for comparison.'}`; headers = [langKey==='de'?'Metrik':'Metric', 'AS (Wert, 95% CI)', `${escMD(t2CriteriaLabelShort)} (Wert, 95% CI)`]; const fRow = (mKey, nmDe, nmEn, isP = true, d = 1) => { const mAS = statsAS[mKey]; const mT2 = statsT2[mKey]; const dig = (mKey === 'auc' || mKey === 'f1') ? 3 : d; const vAS = formatCI(mAS?.value, mAS?.ci?.lower, mAS?.ci?.upper, dig, isP, na, langKey); const vT2 = formatCI(mT2?.value, mT2?.ci?.lower, mT2?.ci?.upper, dig, isP, na, langKey); return [langKey==='de'?nmDe:nmEn, vAS, vT2]; }; rows = [ fRow('sens', 'Sensitivität', 'Sensitivity'), fRow('spez', 'Spezifität', 'Specificity'), fRow('ppv', 'PPV', 'PPV'), fRow('npv', 'NPV', 'NPV'), fRow('acc', 'Accuracy', 'Accuracy'), fRow('balAcc', 'Balanced Accuracy', 'Balanced Accuracy'), fRow('f1', 'F1-Score', 'F1-Score', false, 3), fRow('auc', 'AUC', 'AUC', false, 3) ].map(r => r.map(escMD)); }
            else if (tableType === 'praes_as_vs_t2_tests') { const { vergleich } = dataOrStats || {}; title = langKey==='de'?`Statistischer Vergleich (AS vs. ${escMD(t2CriteriaLabelShort)})`:`Statistical Comparison (AS vs. ${escMD(t2CriteriaLabelShort)})`; if (!vergleich) return `# ${title} (${langKey==='de'?'Kollektiv:':'Cohort:'} ${kollektivDisplayName})\n\n${langKey==='de'?'Fehler: Ungültige Daten für Vergleichstests.':'Error: Invalid data for comparison tests.'}`; headers = [langKey==='de'?'Test':'Test', langKey==='de'?'Statistikwert':'Statistic Value', langKey==='de'?'p-Wert':'p-value', langKey==='de'?'Methode':'Method']; const fP = (p) => (p !== null && !isNaN(p)) ? (p < 0.001 ? (langKey==='de'?'<0,001':'<.001') : formatNumber(p, 3, na, false, langKey)) : na; rows = [ ['McNemar (Accuracy)', `${formatNumber(vergleich?.mcnemar?.statistic, 3, na, false, langKey)} (df=${vergleich?.mcnemar?.df || na})`, `${fP(vergleich?.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(vergleich?.mcnemar?.pValue)}`, `${vergleich?.mcnemar?.method || na}`], ['DeLong (AUC)', `Z=${formatNumber(vergleich?.delong?.Z, 3, na, false, langKey)}`, `${fP(vergleich?.delong?.pValue)} ${getStatisticalSignificanceSymbol(vergleich?.delong?.pValue)}`, `${vergleich?.delong?.method || na}`] ].map(r => r.map(escMD)); }
            else if (tableType === 'criteria_comparison') { title = titleLang('criteriaComparison'); const results = dataOrStats; if (!Array.isArray(results) || results.length === 0) return `# ${title} (${langKey==='de'?'für Kollektiv:':'for Cohort:'} ${kollektivDisplayName})\n\n${langKey==='de'?'Keine Daten verfügbar.':'No data available.'}`; headers = [UI_TEXTS.criteriaComparison.tableHeaderSet[langKey], 'Sens.', 'Spez.', 'PPV', 'NPV', 'Acc.', 'AUC/BalAcc']; rows = results.map(r => { let name = r.name || (langKey==='de'?'Unbekannt':'Unknown'); if (r.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) name = UI_TEXTS.kollektivDisplayNames.applied_criteria[langKey]; else if (r.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) name = UI_TEXTS.kollektivDisplayNames.avocado_sign[langKey]; return [name, formatPercent(r.sens, 1, na, langKey), formatPercent(r.spez, 1, na, langKey), formatPercent(r.ppv, 1, na, langKey), formatPercent(r.npv, 1, na, langKey), formatPercent(r.acc, 1, na, langKey), formatNumber(r.auc, 3, na, false, langKey)].map(escMD); }); }
            else { return `# ${langKey==='de'?'Unbekannter Tabellentyp für Markdown:':'Unknown table type for Markdown:'} ${tableType}`; }
            const headerLine = `| ${headers.join(' | ')} |`; const separatorLine = `|${headers.map(() => '---').join('|')}|`; const bodyLines = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
            let metaInfo = `# ${title}`; if (!['daten', 'auswertung', 'praes_as_perf', 'criteria_comparison'].includes(tableType)) metaInfo += ` (${langKey==='de'?'Kollektiv:':'Cohort:'} ${kollektivDisplayName})`; else if (tableType === 'criteria_comparison') metaInfo += ` (${langKey==='de'?'für Kollektiv:':'for Cohort:'} ${kollektivDisplayName})`; metaInfo += '\n'; if(criteria && logic && ['auswertung', 'deskriptiv'].includes(tableType)) metaInfo += `\n_${langKey==='de'?'T2-Basis (angewandt):':'T2 Basis (applied):'} ${escMD(formatCriteriaFunc(criteria, logic))}_\n\n`; else if (options.t2CriteriaLabelFull && ['praes_as_vs_t2_perf', 'praes_as_vs_t2_tests', 'praes_as_vs_t2_comp'].includes(tableType)) metaInfo += `\n_${langKey==='de'?'T2-Basis (Vergleich):':'T2 Basis (Comparison):'} ${escMD(options.t2CriteriaLabelFull)}_\n\n`; else metaInfo += '\n';
            return `${metaInfo}${headerLine}\n${separatorLine}\n${bodyLines}`;
        } catch (error) {
            return `# ${langKey==='de'?'Fehler bei der Generierung der Markdown-Tabelle für':'Error generating Markdown table for'} ${tableType}.`;
        }
   }

    function generateFilteredDataCSVString(data) {
       if (!Array.isArray(data) || data.length === 0) return null;
       try {
           const columns = ["nr", "name", "vorname", "geburtsdatum", "geschlecht", "alter", "therapie", "untersuchungsdatum", "n", "anzahl_patho_lk", "anzahl_patho_n_plus_lk", "as", "anzahl_as_lk", "anzahl_as_plus_lk", "t2", "anzahl_t2_lk", "anzahl_t2_plus_lk", "bemerkung"];
           const csvData = data.map(p => { const row = {}; columns.forEach(col => { row[col] = p[col] ?? ''; }); return row; });
           return Papa.unparse(csvData, { header: true, delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" });
       } catch (error) {
           return null;
       }
   }

    function _getPublicationSectionContentForExport(sectionId, lang, allKollektivData, commonDataForPubGen) {
        try {
            if (typeof publicationTextGenerator !== 'undefined' && typeof publicationTextGenerator.getSectionTextAsMarkdown === 'function') {
                 return publicationTextGenerator.getSectionTextAsMarkdown(sectionId, lang, allKollektivData, allKollektivData, commonDataForPubGen);
            }
            const errorMsg = lang === 'de' ? `Textinhalt für Sektion '${sectionId}' in Sprache '${lang}' konnte nicht generiert werden.` : `Text content for section '${sectionId}' in language '${lang}' could not be generated.`;
            return errorMsg;
        } catch (e) {
            return `# ${lang === 'de' ? 'Fehler bei Generierung für Sektion' : 'Error generating section'} ${sectionId}\n\n${e.message}`;
        }
    }


    function generateComprehensiveReportHTML(data, bfResultsForCurrentKollektiv, kollektiv, criteria, logic) {
        const langKey = state.getCurrentPublikationLang() || 'de';
        try {
            const statsForAllKollektive = statisticsService.calculateAllStatsForPublication(data, criteria, logic, bfResultsForCurrentKollektiv ? {[kollektiv]: bfResultsForCurrentKollektiv} : null);
            if (!data || !statsForAllKollektive || !criteria || !logic) return `<html><head><title>${langKey==='de'?'Fehler':'Error'}</title></head><body>${langKey==='de'?'Fehler: Notwendige Daten für Report fehlen.':'Error: Necessary data for report missing.'}</body></html>`;

            const statsDataForCurrentKollektiv = statsForAllKollektive[kollektiv];
            if (!statsDataForCurrentKollektiv) return `<html><head><title>${langKey==='de'?'Fehler':'Error'}</title></head><body>${langKey==='de'?'Fehler: Keine Statistikdaten für das gewählte Kollektiv vorhanden.':'Error: No statistics data available for the selected cohort.'}</body></html>`;

            const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? (c, l) => studyT2CriteriaManager.formatCriteriaForDisplay(c, l, false, langKey) : (c, l) => 'N/A';
            const config = APP_CONFIG.REPORT_SETTINGS; const kollektivName = getKollektivDisplayName(kollektiv, langKey); const timestamp = new Date().toLocaleString(langKey === 'de' ? 'de-DE' : 'en-US', { dateStyle: 'long', timeStyle: 'medium'}); const criteriaString = formatCriteriaFunc(criteria, logic); const appliedCriteriaDisplayName = UI_TEXTS.kollektivDisplayNames.applied_criteria[langKey] || APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME; let chartSVGs = {};
            const getChartSVG = (chartId) => { const el = document.getElementById(chartId)?.querySelector('svg'); if(!el) return `<p class="text-muted small">[${langKey==='de'?'Diagramm':'Chart'} ${chartId} ${langKey==='de'?'nicht renderbar/gefunden':'not renderable/found'}]</p>`; try { const clone = el.cloneNode(true); clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); clone.setAttribute('version', '1.1'); clone.style.backgroundColor = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff'; const vb = clone.getAttribute('viewBox')?.split(' '); let w = clone.getAttribute('width'), h = clone.getAttribute('height'); if (vb && vb.length === 4 && parseFloat(vb[2]) > 0 && parseFloat(vb[3]) > 0) { clone.setAttribute('width', vb[2]); clone.setAttribute('height', vb[3]); } else if (!w || !h || parseFloat(w) <= 0 || parseFloat(h) <= 0) { clone.setAttribute('width', '400'); clone.setAttribute('height', '300'); } const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style"); styleEl.textContent = `svg { font-family: ${getComputedStyle(document.body).fontFamily || 'sans-serif'}; } .axis path, .axis line { fill: none; stroke: #6c757d; shape-rendering: crispEdges; stroke-width: 1px; } .axis text { font-size: 10px; fill: #212529; } .axis-label { font-size: 11px; fill: #212529; text-anchor: middle; } .grid .tick { stroke: #dee2e6; stroke-opacity: 0.6; } .grid path { stroke-width: 0; } .legend { font-size: 10px; fill: #212529; } .bar { opacity: 0.9; } .roc-curve { fill: none; stroke-width: 2px; } .reference-line { stroke: #adb5bd; stroke-width: 1px; stroke-dasharray: 4 2; } .auc-label { font-weight: bold; font-size: 11px; }`; clone.prepend(styleEl); return clone.outerHTML; } catch (e) { return `<p class="text-danger small">[${langKey==='de'?'Fehler beim Einbetten von Diagramm':'Error embedding chart'} ${chartId}: ${e.message}]</p>`; } };

            const chartIdsToCapture = [];
            if (config.INCLUDE_DESCRIPTIVES_CHARTS) { chartIdsToCapture.push('chart-stat-age-0', 'chart-stat-gender-0'); }
            if (config.INCLUDE_AS_VS_T2_COMPARISON_CHART && state.getCurrentPresentationView() === 'as-vs-t2' && state.getCurrentKollektiv() === kollektiv) {
                const praesChartId = 'praes-comp-chart-container';
                if (document.getElementById(praesChartId)?.querySelector('svg')) chartIdsToCapture.push(praesChartId);
            }
            chartIdsToCapture.forEach(id => { if (document.getElementById(id)) chartSVGs[id] = getChartSVG(id); });

            let html = `<!DOCTYPE html><html lang="${langKey}"><head><meta charset="UTF-8"><title>${config.REPORT_TITLE} - ${kollektivName}</title>`; html += `<style> body { font-family: sans-serif; font-size: 10pt; line-height: 1.4; padding: 25px; max-width: 800px; margin: auto; color: #212529; background-color: #fff;} h1, h2, h3 { color: #333; margin-top: 1.2em; margin-bottom: 0.6em; padding-bottom: 0.2em; border-bottom: 1px solid #ccc; page-break-after: avoid; } h1 { font-size: 16pt; border-bottom-width: 2px; } h2 { font-size: 14pt; } h3 { font-size: 12pt; font-weight: bold; border-bottom: none; margin-bottom: 0.4em; } table { border-collapse: collapse; width: 100%; margin-bottom: 1em; font-size: 9pt; page-break-inside: avoid; } th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; vertical-align: top; word-wrap: break-word; } th { background-color: #f2f2f2; font-weight: bold; } .chart-container { text-align: center; margin: 1em 0; page-break-inside: avoid; background-color: #fff; padding: 10px; border: 1px solid #eee; max-width: 100%; overflow: hidden; } .chart-container svg { max-width: 100%; height: auto; display: block; margin: auto; } .meta-info { background-color: #f9f9f9; border: 1px solid #eee; padding: 10px 15px; margin-bottom: 1.5em; font-size: 9pt; } .meta-info ul { list-style: none; padding: 0; margin: 0; } .meta-info li { margin-bottom: 0.3em; } .small { font-size: 8pt; } .text-muted { color: #6c757d; } ul { padding-left: 20px; margin-top: 0.5em;} li { margin-bottom: 0.2em; } .report-footer { margin-top: 2em; padding-top: 1em; border-top: 1px solid #ccc; font-size: 8pt; color: #888; text-align: center; } .no-print { display: none; } @media print { body { padding: 10px; } .meta-info { background-color: #fff; border: none; padding: 0 0 1em 0;} } </style></head><body>`;
            html += `<h1>${config.REPORT_TITLE}</h1>`; if (config.INCLUDE_APP_VERSION) html += `<p class="text-muted small">${langKey==='de'?'Generiert mit:':'Generated with:'} ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION}</p>`; if (config.INCLUDE_GENERATION_TIMESTAMP) html += `<p class="text-muted small">${langKey==='de'?'Erstellt am:':'Created on:'} ${timestamp}</p>`;
            html += `<div class="meta-info"><h3>${langKey==='de'?'Analysekonfiguration':'Analysis Configuration'}</h3><ul>`; if (config.INCLUDE_KOLLEKTIV_INFO) html += `<li><strong>${langKey==='de'?'Analysiertes Kollektiv:':'Analyzed Cohort:'}</strong> ${kollektivName} (N=${statsDataForCurrentKollektiv?.deskriptiv?.anzahlPatienten || 0})</li>`; if (config.INCLUDE_T2_CRITERIA) html += `<li><strong>${langKey==='de'?'Angewandte T2-Kriterien':'Applied T2 Criteria'} ('${appliedCriteriaDisplayName}'):</strong> ${langKey==='de'?'Logik:':'Logic:'} ${UI_TEXTS.t2LogicDisplayNames[logic]?.[langKey] || logic}, ${langKey==='de'?'Kriterien:':'Criteria:'} ${criteriaString}</li>`; html += `</ul></div>`;
            if (config.INCLUDE_DESCRIPTIVES_TABLE && statsDataForCurrentKollektiv?.deskriptiv) { html += `<h2>${langKey==='de'?'Deskriptive Statistik':'Descriptive Statistics'}</h2>`; html += `<table><thead><tr><th>${langKey==='de'?'Metrik':'Metric'}</th><th>${langKey==='de'?'Wert (Median)':'Value (Median)'}</th><th>Mean</th><th>SD</th><th>Min</th><th>Max</th></tr></thead><tbody>`; const d = statsDataForCurrentKollektiv.deskriptiv; const na = '--'; const fvRep = (v, dig = 1) => formatNumber(v, dig, na, false, langKey); const fPRep = (v, dig = 1) => formatPercent(v, dig, na, langKey); const addRowHTML = (l, vl=na, m=na, s=na, mn=na, mx=na) => `<tr><td>${l}</td><td>${vl}</td><td>${m}</td><td>${s}</td><td>${mn}</td><td>${mx}</td></tr>`; html += addRowHTML(UI_TEXTS.axisLabels.age[langKey], fvRep(d.alter?.median, 1), fvRep(d.alter?.mean, 1), fvRep(d.alter?.sd, 1), fvRep(d.alter?.min, 0), fvRep(d.alter?.max, 0)); html += addRowHTML(`${UI_TEXTS.legendLabels.gender[langKey]} ${UI_TEXTS.legendLabels.male[langKey]} (n / %)`, `${d.geschlecht?.m ?? 0} / ${fPRep(d.anzahlPatienten > 0 ? (d.geschlecht?.m ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML(`${UI_TEXTS.legendLabels.gender[langKey]} ${UI_TEXTS.legendLabels.female[langKey]} (n / %)`, `${d.geschlecht?.f ?? 0} / ${fPRep(d.anzahlPatienten > 0 ? (d.geschlecht?.f ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML(`${UI_TEXTS.chartTitles.therapyDistribution[langKey]} ${UI_TEXTS.legendLabels.direktOP[langKey]} (n / %)`, `${d.therapie?.['direkt OP'] ?? 0} / ${fPRep(d.anzahlPatienten > 0 ? (d.therapie?.['direkt OP'] ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML(`${UI_TEXTS.chartTitles.therapyDistribution[langKey]} ${UI_TEXTS.legendLabels.nRCT[langKey]} (n / %)`, `${d.therapie?.nRCT ?? 0} / ${fPRep(d.anzahlPatienten > 0 ? (d.therapie?.nRCT ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML(`N Status (${UI_TEXTS.legendLabels.nPositive[langKey]} / %)`, `${d.nStatus?.plus ?? 0} / ${fPRep(d.anzahlPatienten > 0 ? (d.nStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML(`AS Status (${UI_TEXTS.legendLabels.asPositive[langKey]} / %)`, `${d.asStatus?.plus ?? 0} / ${fPRep(d.anzahlPatienten > 0 ? (d.asStatus?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`); html += addRowHTML(`T2 Status (${UI_TEXTS.legendLabels.t2Positive[langKey]} / %)`, `${d.t2Status?.plus ?? 0} / ${fPRep(d.anzahlPatienten > 0 ? (d.t2Status?.plus ?? 0) / d.anzahlPatienten : NaN, 1)}`); const fLKRep = (lk) => `${fvRep(lk?.median,1)} (${fvRep(lk?.min,0)}-${fvRep(lk?.max,0)})`; html += addRowHTML(`${langKey==='de'?'LK N gesamt':'LN N total'} (Median (Min-Max))`, fLKRep(d.lkAnzahlen?.n?.total), fvRep(d.lkAnzahlen?.n?.total?.mean,1), fvRep(d.lkAnzahlen?.n?.total?.sd,1),fvRep(d.lkAnzahlen?.n?.total?.min,0), fvRep(d.lkAnzahlen?.n?.total?.max,0)); html += addRowHTML(`${langKey==='de'?'LK':'LN'} N${UI_TEXTS.legendLabels.nPositive[langKey]} (Median (Min-Max), ${langKey==='de'?'nur N+ Pat.':'N+ pts only'})`, fLKRep(d.lkAnzahlen?.n?.plus), fvRep(d.lkAnzahlen?.n?.plus?.mean,1), fvRep(d.lkAnzahlen?.n?.plus?.sd,1),fvRep(d.lkAnzahlen?.n?.plus?.min,0), fvRep(d.lkAnzahlen?.n?.plus?.max,0)); html += addRowHTML(`${langKey==='de'?'LK AS gesamt':'LN AS total'} (Median (Min-Max))`, fLKRep(d.lkAnzahlen?.as?.total), fvRep(d.lkAnzahlen?.as?.total?.mean,1), fvRep(d.lkAnzahlen?.as?.total?.sd,1),fvRep(d.lkAnzahlen?.as?.total?.min,0), fvRep(d.lkAnzahlen?.as?.total?.max,0)); html += addRowHTML(`${langKey==='de'?'LK':'LN'} AS${UI_TEXTS.legendLabels.asPositive[langKey]} (Median (Min-Max), ${langKey==='de'?'nur AS+ Pat.':'AS+ pts only'})`, fLKRep(d.lkAnzahlen?.as?.plus), fvRep(d.lkAnzahlen?.as?.plus?.mean,1), fvRep(d.lkAnzahlen?.as?.plus?.sd,1),fvRep(d.lkAnzahlen?.as?.plus?.min,0), fvRep(d.lkAnzahlen?.as?.plus?.max,0)); html += addRowHTML(`${langKey==='de'?'LK T2 gesamt':'LN T2 total'} (Median (Min-Max))`, fLKRep(d.lkAnzahlen?.t2?.total), fvRep(d.lkAnzahlen?.t2?.total?.mean,1), fvRep(d.lkAnzahlen?.t2?.total?.sd,1),fvRep(d.lkAnzahlen?.t2?.total?.min,0), fvRep(d.lkAnzahlen?.t2?.total?.max,0)); html += addRowHTML(`${langKey==='de'?'LK':'LN'} T2${UI_TEXTS.legendLabels.t2Positive[langKey]} (Median (Min-Max), ${langKey==='de'?'nur T2+ Pat.':'T2+ pts only'})`, fLKRep(d.lkAnzahlen?.t2?.plus), fvRep(d.lkAnzahlen?.t2?.plus?.mean,1), fvRep(d.lkAnzahlen?.t2?.plus?.sd,1),fvRep(d.lkAnzahlen?.t2?.plus?.min,0), fvRep(d.lkAnzahlen?.t2?.plus?.max,0)); html += `</tbody></table>`; }
            if (config.INCLUDE_DESCRIPTIVES_CHARTS) { html += `<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 1em; justify-content: space-around;">`; if (chartSVGs['chart-stat-age-0']) html += `<div class="chart-container" style="flex: 1 1 45%; min-width: 300px;"><h3>${UI_TEXTS.chartTitles.ageDistribution[langKey]}</h3>${chartSVGs['chart-stat-age-0']}</div>`; if (chartSVGs['chart-stat-gender-0']) html += `<div class="chart-container" style="flex: 1 1 45%; min-width: 300px;"><h3>${UI_TEXTS.chartTitles.genderDistribution[langKey]}</h3>${chartSVGs['chart-stat-gender-0']}</div>`; html += `</div>`; }
            const addPerfSectionHTML = (title, statsObj) => { if (!statsObj) return ''; let sHtml = `<h2>${title}</h2><table><thead><tr><th>${langKey==='de'?'Metrik':'Metric'}</th><th>${langKey==='de'?'Wert (95% CI)':'Value (95% CI)'}</th><th>${langKey==='de'?'CI Methode':'CI Method'}</th></tr></thead><tbody>`; const fCIH = (m, d=1, p=true) => formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, '--', langKey); const naH = '--'; sHtml += `<tr><td>${TOOLTIP_CONTENT.statMetrics.sens.name[langKey]}</td><td>${fCIH(statsObj.sens)}</td><td>${statsObj.sens?.method || naH}</td></tr>`; sHtml += `<tr><td>${TOOLTIP_CONTENT.statMetrics.spez.name[langKey]}</td><td>${fCIH(statsObj.spez)}</td><td>${statsObj.spez?.method || naH}</td></tr>`; sHtml += `<tr><td>${TOOLTIP_CONTENT.statMetrics.ppv.name[langKey]}</td><td>${fCIH(statsObj.ppv)}</td><td>${statsObj.ppv?.method || naH}</td></tr>`; sHtml += `<tr><td>${TOOLTIP_CONTENT.statMetrics.npv.name[langKey]}</td><td>${fCIH(statsObj.npv)}</td><td>${statsObj.npv?.method || naH}</td></tr>`; sHtml += `<tr><td>${TOOLTIP_CONTENT.statMetrics.acc.name[langKey]}</td><td>${fCIH(statsObj.acc)}</td><td>${statsObj.acc?.method || naH}</td></tr>`; sHtml += `<tr><td>${TOOLTIP_CONTENT.statMetrics.balAcc.name[langKey]}</td><td>${fCIH(statsObj.balAcc)}</td><td>${statsObj.balAcc?.method || naH}</td></tr>`; sHtml += `<tr><td>${TOOLTIP_CONTENT.statMetrics.f1.name[langKey]}</td><td>${fCIH(statsObj.f1, 3, false)}</td><td>${statsObj.f1?.method || naH}</td></tr>`; sHtml += `<tr><td>${TOOLTIP_CONTENT.statMetrics.auc.name[langKey]}</td><td>${fCIH(statsObj.auc, 3, false)}</td><td>${statsObj.auc?.method || naH}</td></tr>`; sHtml += `</tbody></table>`; return sHtml; };
            if (config.INCLUDE_AS_PERFORMANCE_TABLE && statsDataForCurrentKollektiv?.gueteAS) { html += addPerfSectionHTML(`${langKey==='de'?'Diagnostische Güte: Avocado Sign (vs. N)':'Diagnostic Performance: Avocado Sign (vs. N)'}`, statsDataForCurrentKollektiv.gueteAS); }
            if (config.INCLUDE_T2_PERFORMANCE_TABLE && statsDataForCurrentKollektiv?.gueteT2_angewandt) { html += addPerfSectionHTML(`${langKey==='de'?'Diagnostische Güte: T2':'Diagnostic Performance: T2'} ('${appliedCriteriaDisplayName}' vs. N)`, statsDataForCurrentKollektiv.gueteT2_angewandt); }
            if (config.INCLUDE_AS_VS_T2_COMPARISON_TABLE && statsDataForCurrentKollektiv?.vergleichASvsT2_angewandt) { html += `<h2>${langKey==='de'?'Statistischer Vergleich: AS vs. T2':'Statistical Comparison: AS vs. T2'} ('${appliedCriteriaDisplayName}')</h2><table><thead><tr><th>${langKey==='de'?'Test':'Test'}</th><th>${langKey==='de'?'Statistik':'Statistic'}</th><th>p-${langKey==='de'?'Wert':'value'}</th><th>${langKey==='de'?'Methode':'Method'}</th></tr></thead><tbody>`; const v = statsDataForCurrentKollektiv.vergleichASvsT2_angewandt; const fPH = (p) => (p !== null && !isNaN(p)) ? (p < 0.001 ? (langKey==='de'?'<0,001':'<.001') : formatNumber(p, 3, '--', false, langKey)) : '--'; const naH = '--'; html += `<tr><td>Accuracy (McNemar)</td><td>${formatNumber(v?.mcnemar?.statistic, 3, naH, false, langKey)} (df=${v?.mcnemar?.df || naH})</td><td>${fPH(v?.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(v?.mcnemar?.pValue)}</td><td>${v?.mcnemar?.method || naH}</td></tr>`; html += `<tr><td>AUC (DeLong)</td><td>Z=${formatNumber(v?.delong?.Z, 3, naH, false, langKey)}</td><td>${fPH(v?.delong?.pValue)} ${getStatisticalSignificanceSymbol(v?.delong?.pValue)}</td><td>${v?.delong?.method || naH}</td></tr>`; html += `</tbody></table>`; }
            if (config.INCLUDE_AS_VS_T2_COMPARISON_CHART) { const chartKey = Object.keys(chartSVGs).find(k => k.startsWith('praes-comp-chart')); if(chartSVGs[chartKey]) { html += `<div class="chart-container"><h3>${langKey==='de'?'Vergleich ausgewählter Metriken (AS vs T2':'Comparison of selected metrics (AS vs T2'} - '${appliedCriteriaDisplayName}')</h3>${chartSVGs[chartKey]}</div>`; } }
            if (config.INCLUDE_ASSOCIATIONS_TABLE && statsDataForCurrentKollektiv?.assoziation_angewandt && Object.keys(statsDataForCurrentKollektiv.assoziation_angewandt).length > 0) { html += `<h2>${langKey==='de'?'Assoziation mit N-Status':'Association with N-Status'}</h2><table><thead><tr><th>${langKey==='de'?'Merkmal':'Feature'}</th><th>OR (95% CI)</th><th>RD (%) (95% CI)</th><th>Phi</th><th>p-${langKey==='de'?'Wert':'value'}</th><th>${langKey==='de'?'Test':'Test'}</th></tr></thead><tbody>`; const a = statsDataForCurrentKollektiv.assoziation_angewandt; const naH = '--'; const fPH = (p) => (p !== null && !isNaN(p)) ? (p < 0.001 ? (langKey==='de'?'<0,001':'<.001') : formatNumber(p, 3, naH, false, langKey)) : naH; const fRowAssoc = (obj) => { if (!obj || !obj.featureName) return ''; const orS = formatCI(obj.or?.value, obj.or?.ci?.lower, obj.or?.ci?.upper, 2, false, naH, langKey); const rdV = formatNumber(obj.rd?.value !== null && !isNaN(obj.rd?.value) ? obj.rd.value * 100 : NaN, 1, naH, false, langKey); const rdL = formatNumber(obj.rd?.ci?.lower !== null && !isNaN(obj.rd?.ci?.lower) ? obj.rd.ci.lower * 100 : NaN, 1, naH, false, langKey); const rdU = formatNumber(obj.rd?.ci?.upper !== null && !isNaN(obj.rd?.ci?.upper) ? obj.rd.ci.upper * 100 : NaN, 1, naH, false, langKey); const rdS = rdV !== naH ? `${rdV}% (${rdL}% - ${rdU}%)` : naH; const phiS = formatNumber(obj.phi?.value, 2, naH, false, langKey); const pS = fPH(obj.pValue) + ' ' + getStatisticalSignificanceSymbol(obj.pValue); const tN = obj.testName || naH; return `<tr><td>${obj.featureName}</td><td>${orS}</td><td>${rdS}</td><td>${phiS}</td><td>${pS}</td><td>${tN}</td></tr>`; }; html += fRowAssoc(a?.as); if (a?.size_mwu) html += `<tr><td>${a.size_mwu.featureName || (langKey==='de'?'LK Größe (Median Vgl.)':'LN Size (Median Comp.)')}</td><td>${naH}</td><td>${naH}</td><td>${naH}</td><td>${fPH(a.size_mwu.pValue)} ${getStatisticalSignificanceSymbol(a.size_mwu.pValue)}</td><td>${a.size_mwu.testName || naH}</td></tr>`; ['size', 'form', 'kontur', 'homogenitaet', 'signal'].forEach(k => { if (a && a[k]) { const isActive = criteria[k]?.active === true; html += fRowAssoc({...a[k], featureName: a[k].featureName + (isActive ? '' : (langKey === 'de' ? ' (inaktiv)' : ' (inactive)'))}); } }); html += `</tbody></table>`; }
            if (config.INCLUDE_BRUTEFORCE_BEST_RESULT && bfResultsForCurrentKollektiv?.results && bfResultsForCurrentKollektiv.results.length > 0 && bfResultsForCurrentKollektiv.bestResult) { html += `<h2>${langKey==='de'?'Bestes Brute-Force Ergebnis (für Kollektiv:':'Best Brute-Force Result (for Cohort:'} ${kollektivName})</h2><div class="meta-info"><ul>`; const best = bfResultsForCurrentKollektiv.bestResult; html += `<li><strong>${langKey==='de'?'Optimierte Metrik:':'Optimized Metric:'}</strong> ${bfResultsForCurrentKollektiv.metric}</li><li><strong>${langKey==='de'?'Bester Wert:':'Best Value:'}</strong> ${formatNumber(best.metricValue, 4, 'N/A', false, langKey)}</li><li><strong>${langKey==='de'?'Logik:':'Logic:'}</strong> ${UI_TEXTS.t2LogicDisplayNames[best.logic?.toUpperCase()]?.[langKey] || best.logic?.toUpperCase()}</li><li><strong>${langKey==='de'?'Kriterien:':'Criteria:'}</strong> ${formatCriteriaFunc(best.criteria, best.logic)}</li></ul></div>`; }
            html += `<div class="report-footer">${config.REPORT_AUTHOR} - ${timestamp}</div></body></html>`; return html;
        } catch (error) {
             return `<html><head><title>${langKey==='de'?'Fehler':'Error'}</title></head><body>${langKey==='de'?'Fehler bei der Reporterstellung.':'Error during report generation.'}</body></html>`;
        }
    }

    async function convertTableToPngBlob(tableElementId, baseWidth = 800) {
        const scale = APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE || 2;
        return new Promise((resolve, reject) => {
            const table = document.getElementById(tableElementId);
            if (!table || !(table instanceof HTMLTableElement)) return reject(new Error(`Tabelle mit ID '${tableElementId}' nicht gefunden.`));
            try {
                 const tableBCR = table.getBoundingClientRect();
                 let tableRect = {width: tableBCR.width, height: tableBCR.height, left: tableBCR.left, top: tableBCR.top};
                if(tableRect.width <= 0 || tableRect.height <= 0) {
                    tableRect.width = table.offsetWidth || baseWidth;
                    tableRect.height = table.offsetHeight || (baseWidth * 0.5);
                     if(tableRect.width <= 0 || tableRect.height <= 0) return reject(new Error(`Tabelle '${tableElementId}' hat keine validen Dimensionen.`));
                    tableRect.left = table.offsetLeft || 0;
                    tableRect.top = table.offsetTop || 0;
                }

                const effectiveScale = Math.min(scale, (baseWidth * scale) / tableRect.width);
                const canvas = document.createElement('canvas');
                canvas.width = tableRect.width * effectiveScale;
                canvas.height = tableRect.height * effectiveScale;


                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error("Canvas Context nicht verfügbar."));

                ctx.fillStyle = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.scale(effectiveScale, effectiveScale);

                const tableCloneForRender = table.cloneNode(true);
                const tableWrapperForRender = document.createElement('div');
                tableWrapperForRender.style.position = 'absolute';
                tableWrapperForRender.style.left = '-99999px';
                tableWrapperForRender.style.top = '-99999px';
                tableWrapperForRender.style.width = `${tableRect.width}px`;
                tableWrapperForRender.appendChild(tableCloneForRender);
                document.body.appendChild(tableWrapperForRender);

                const rows = Array.from(tableCloneForRender.rows);
                let currentY = 0;
                rows.forEach(row => {
                    const cells = Array.from(row.cells);
                    let currentX = 0;
                    let maxHeightInRow = 0;
                    cells.forEach(cell => {
                        const cellComputedStyle = getComputedStyle(cell);
                        const cellBCR = cell.getBoundingClientRect();
                        const cellWidth = cellBCR.width;
                        const cellHeight = cellBCR.height;
                        maxHeightInRow = Math.max(maxHeightInRow, cellHeight);

                        ctx.fillStyle = cellComputedStyle.backgroundColor || 'transparent';
                        if (ctx.fillStyle && ctx.fillStyle !== 'rgba(0, 0, 0, 0)' && ctx.fillStyle !== 'transparent') {
                            ctx.fillRect(currentX, currentY, cellWidth, cellHeight);
                        }

                        const borderWeight = 1;
                        ctx.strokeStyle = cellComputedStyle.borderTopColor || '#ccc';
                        ctx.lineWidth = borderWeight;
                        ctx.strokeRect(currentX, currentY, cellWidth, cellHeight);

                        ctx.fillStyle = cellComputedStyle.color || '#000';
                        ctx.font = `${cellComputedStyle.fontStyle || 'normal'} ${cellComputedStyle.fontWeight || 'normal'} ${parseFloat(cellComputedStyle.fontSize)}px ${cellComputedStyle.fontFamily || 'sans-serif'}`;
                        ctx.textAlign = cellComputedStyle.textAlign === 'right' ? 'right' : cellComputedStyle.textAlign === 'center' ? 'center' : 'left';
                        ctx.textBaseline = 'middle';

                        const text = cell.innerText || cell.textContent || '';
                        const padL = parseFloat(cellComputedStyle.paddingLeft) || 5;
                        const padR = parseFloat(cellComputedStyle.paddingRight) || 5;
                        const textX = (ctx.textAlign === 'right') ? currentX + cellWidth - padR : (ctx.textAlign === 'center') ? currentX + cellWidth / 2 : currentX + padL;
                        const textY = currentY + cellHeight / 2;
                        ctx.fillText(text.trim(), textX, textY);
                        currentX += cellWidth;
                    });
                    currentY += maxHeightInRow;
                });

                document.body.removeChild(tableWrapperForRender);
                ctx.restore();
                canvas.toBlob((blob) => {
                    if (blob) { resolve(blob); }
                    else { reject(new Error("Canvas toBlob für Tabelle fehlgeschlagen.")); }
                }, 'image/png');
            } catch (error) { reject(error); }
        });
    }

    function exportStatistikCSV(data, kollektiv, criteria, logic) {
        let stats = null, csvString = null;
        const langKey = state.getCurrentPublikationLang() || 'de';
        try { stats = statisticsService.calculateAllStatsForPublication(data, criteria, logic, null)[kollektiv]; } catch(e) { ui_helpers.showToast(langKey==='de'?"Fehler bei Statistikberechnung für CSV.":"Error in CSV statistics calculation.", "danger"); return; }
        if (!stats) { ui_helpers.showToast(langKey==='de'?"Keine Statistikdaten zum Exportieren für dieses Kollektiv.":"No statistics data to export for this cohort.", "warning"); return; }
        try { csvString = generateStatistikCSVString(stats, kollektiv, criteria, logic); } catch(e) { ui_helpers.showToast(langKey==='de'?"Fehler bei CSV-Erstellung.":"Error creating CSV.", "danger"); return; }
        if (csvString === null || csvString.length === 0) { ui_helpers.showToast(langKey==='de'?"CSV-Generierung ergab leere Datei.":"CSV generation resulted in an empty file.", "warning"); return; }
        const filename = generateFilename('STATS_CSV', kollektiv, 'csv');
        if(downloadFile(csvString, filename, 'text/csv;charset=utf-8;')) ui_helpers.showToast(`${langKey==='de'?'Statistik als CSV exportiert:':'Statistics exported as CSV:'} ${filename}`, 'success');
    }

    function exportBruteForceReport(resultsData, kollektiv) {
        const langKey = state.getCurrentPublikationLang() || 'de';
        if (!resultsData) { ui_helpers.showToast(langKey==='de'?"Keine Brute-Force Ergebnisse zum Exportieren vorhanden.":"No brute-force results available for export.", "warning"); return; }
        let txtString = null;
        try { txtString = generateBruteForceTXTString(resultsData, kollektiv); } catch(e) { ui_helpers.showToast(langKey==='de'?"Fehler bei TXT-Erstellung.":"Error creating TXT.", "danger"); return; }
        if (txtString === null || txtString.length === 0) { ui_helpers.showToast(langKey==='de'?"TXT-Generierung ergab leere Datei.":"TXT generation resulted in an empty file.", "warning"); return; }
        const filename = generateFilename('BRUTEFORCE_TXT', kollektiv, 'txt');
        if(downloadFile(txtString, filename, 'text/plain;charset=utf-8;')) ui_helpers.showToast(`${langKey==='de'?'Brute-Force Bericht exportiert:':'Brute-force report exported:'} ${filename}`, 'success');
    }

    function exportTableMarkdown(dataOrStats, tableType, kollektiv, criteria = null, logic = null, options = {}) {
        let mdString = null; let typeKey = `UnknownTable_${tableType}_MD`, title = tableType;
        const langKey = state.getCurrentPublikationLang() || 'de';
        try { mdString = generateMarkdownTableString(dataOrStats, tableType, kollektiv, criteria, logic, options); } catch(e) { ui_helpers.showToast(`${langKey==='de'?'Fehler bei MD-Erstellung':'Error creating MD'} (${tableType}).`, "danger"); return; }
        if (mdString === null || mdString.length === 0) { ui_helpers.showToast(`${langKey==='de'?'MD-Generierung ergab leere Datei':'MD generation resulted in empty file'} (${tableType}).`, "warning"); return; }

        if(tableType === 'daten') { typeKey = 'DATEN_MD'; title = langKey==='de'?'Datenliste':'Data List'; }
        else if(tableType === 'auswertung') { typeKey = 'AUSWERTUNG_MD'; title = langKey==='de'?'Auswertungstabelle':'Evaluation Table'; }
        else if(tableType === 'deskriptiv') { typeKey = 'DESKRIPTIV_MD'; title = langKey==='de'?'Deskriptive Statistik':'Descriptive Statistics'; }
        else if(tableType === 'praes_as_perf') { typeKey = 'PRAES_AS_PERF_MD'; title = langKey==='de'?'AS Performance':'AS Performance'; }
        else if(tableType === 'praes_as_vs_t2_perf') { typeKey = 'PRAES_AS_VS_T2_PERF_MD'; title = langKey==='de'?'AS vs T2 Performance':'AS vs T2 Performance'; }
        else if(tableType === 'praes_as_vs_t2_tests') { typeKey = 'PRAES_AS_VS_T2_TESTS_MD'; title = langKey==='de'?'AS vs T2 Tests':'AS vs T2 Tests'; }
        else if(tableType === 'praes_as_vs_t2_comp') { typeKey = 'PRAES_AS_VS_T2_COMP_MD'; title = langKey==='de'?'AS vs T2 Metriken':'AS vs T2 Metrics'; }
        else if(tableType === 'criteria_comparison') { typeKey = 'CRITERIA_COMPARISON_MD'; title = langKey==='de'?'Kriterienvergleich':'Criteria Comparison'; }
        else if(tableType === 'publication_section') {
             typeKey = options.filenameTypeKey || `PUBLIKATION_${(options.sectionName || (langKey==='de'?'Abschnitt':'Section')).toUpperCase()}_MD`;
             title = options.sectionName || (langKey==='de'?'Publikationsabschnitt':'Publication Section');
        }


        const filename = generateFilename(typeKey, kollektiv, 'md', { studyId: options?.comparisonCriteriaSet?.id, sectionName: options?.sectionName });
        if(downloadFile(mdString, filename, 'text/markdown;charset=utf-8;')) ui_helpers.showToast(`${title} ${langKey==='de'?'als Markdown exportiert:':'exported as Markdown:'} ${filename}`, 'success');
    }

    function exportFilteredDataCSV(data, kollektiv) {
       const langKey = state.getCurrentPublikationLang() || 'de';
       let csvString = null;
       try { csvString = generateFilteredDataCSVString(data); } catch(e) { ui_helpers.showToast(langKey==='de'?"Fehler bei Rohdaten-CSV-Erstellung.":"Error creating raw data CSV.", "danger"); return; }
       if (csvString === null || csvString.length === 0) { ui_helpers.showToast(langKey==='de'?"Rohdaten-CSV-Generierung ergab leere Datei.":"Raw data CSV generation resulted in an empty file.", "warning"); return; }
       const filename = generateFilename('FILTERED_DATA_CSV', kollektiv, 'csv');
       if(downloadFile(csvString, filename, 'text/csv;charset=utf-8;')) ui_helpers.showToast(`${langKey==='de'?'Gefilterte Daten als CSV exportiert:':'Filtered data exported as CSV:'} ${filename}`, 'success');
   }

    function exportComprehensiveReportHTML(data, bfResultsForCurrentKollektiv, kollektiv, criteria, logic) {
        const langKey = state.getCurrentPublikationLang() || 'de';
        let htmlString = null;
        try { htmlString = generateComprehensiveReportHTML(data, bfResultsForCurrentKollektiv, kollektiv, criteria, logic); } catch(e) { ui_helpers.showToast(langKey==='de'?"Fehler bei HTML-Report-Erstellung.":"Error creating HTML report.", "danger"); return; }
        if (htmlString === null || htmlString.length === 0 || htmlString.includes('Fehler: Notwendige Daten für Report fehlen') || htmlString.includes('Error: Necessary data for report missing')) { ui_helpers.showToast(langKey==='de'?"HTML-Report-Generierung ergab leere oder fehlerhafte Datei.":"HTML report generation resulted in an empty or erroneous file.", "warning"); return; }
        const filename = generateFilename('COMPREHENSIVE_REPORT_HTML', kollektiv, 'html');
        if(downloadFile(htmlString, filename, 'text/html;charset=utf-8;')) ui_helpers.showToast(`${langKey==='de'?'Umfassender Bericht exportiert:':'Comprehensive report exported:'} ${filename}`, 'success');
    }

    async function exportSingleChart(chartElementId, format, kollektiv, options = {}) {
         const langKey = state.getCurrentPublikationLang() || 'de';
         const svgElement = document.getElementById(chartElementId)?.querySelector('svg'); if (!svgElement) { ui_helpers.showToast(`${langKey==='de'?"Diagramm":"Chart"} '${chartElementId}' ${langKey==='de'?"für Export nicht gefunden.":"not found for export."}`, 'danger'); return; }
         const chartName = options.chartName || chartElementId.replace(/^chart-/, '').replace(/-container$/, '').replace(/-content$/, '').replace(/-[0-9]+$/, '');
         try {
             let blob = null, filenameKey, mimeType, ext;
             if (format === 'png') { ui_helpers.showToast(`${langKey==='de'?"Generiere PNG für Chart":"Generating PNG for chart"} ${chartName}...`, 'info', 1500); blob = await convertSvgToPngBlob(svgElement); filenameKey = 'CHART_SINGLE_PNG'; mimeType = 'image/png'; ext = 'png'; }
             else if (format === 'svg') { ui_helpers.showToast(`${langKey==='de'?"Generiere SVG für Chart":"Generating SVG for chart"} ${chartName}...`, 'info', 1500); blob = await convertSvgToSvgBlob(svgElement); filenameKey = 'CHART_SINGLE_SVG'; mimeType = 'image/svg+xml;charset=utf-8'; ext = 'svg'; }
             else { throw new Error(`${langKey==='de'?"Ungültiges Exportformat:":"Invalid export format:"} ${format}`); }
             if (blob) {
                const filename = generateFilename(filenameKey, kollektiv, ext, { chartName, ...options });
                if (downloadFile(blob, filename, mimeType)) ui_helpers.showToast(`${langKey==='de'?"Chart":"Chart"} ${chartName} ${langKey==='de'?"als":"as"} ${format.toUpperCase()} ${langKey==='de'?"exportiert.":"exported."}`, 'success');
             } else {
                 throw new Error(langKey==='de'?"Blob-Generierung fehlgeschlagen.":"Blob generation failed.");
             }
         } catch (error) { ui_helpers.showToast(`${langKey==='de'?"Fehler beim Chart-Export":"Error during chart export"} (${format.toUpperCase()}).`, 'danger'); }
    }

     async function exportTablePNG(tableElementId, kollektiv, typeKey = 'TABLE_PNG_EXPORT', tableName = 'Tabelle') {
         const langKey = state.getCurrentPublikationLang() || 'de';
         ui_helpers.showToast(`${langKey==='de'?"Generiere PNG für Tabelle":"Generating PNG for table"} ${tableName}...`, 'info', 1500);
         try {
             const tableElement = document.getElementById(tableElementId); const baseWidth = tableElement?.offsetWidth || 800;
             const blob = await convertTableToPngBlob(tableElementId, baseWidth);
             if (blob) {
                const filename = generateFilename(typeKey, kollektiv, 'png', {tableName: tableName, tableId: tableElementId});
                if(downloadFile(blob, filename, 'image/png')) ui_helpers.showToast(`${langKey==='de'?"Tabelle":"Table"} '${tableName}' ${langKey==='de'?"als PNG exportiert.":"exported as PNG."}`, 'success');
             } else {
                throw new Error(langKey==='de'?"Tabellen-Blob-Generierung fehlgeschlagen.":"Table blob generation failed.");
             }
         } catch(error) { ui_helpers.showToast(`${langKey==='de'?"Fehler beim Tabellen-PNG-Export für":"Error during table PNG export for"} '${tableName}'.`, 'danger'); }
     }

    async function exportChartsZip(scopeSelector, zipTypeKey, kollektiv, format) {
         const langKey = state.getCurrentPublikationLang() || 'de';
         ui_helpers.showToast(`${langKey==='de'?"Starte":"Starting"} ${format.toUpperCase()}-Export ${langKey==='de'?"für sichtbare Charts & Tabellen...":"for visible charts & tables..."}`, 'info', 2000);
         if (!window.JSZip) { ui_helpers.showToast(langKey==='de'?"JSZip Bibliothek nicht geladen.":"JSZip library not loaded.", "danger"); return; }
         const zip = new JSZip(); const promises = []; let successCount = 0;
         const chartContainers = document.querySelectorAll(scopeSelector + ' [id^="chart-"][style*="height"] svg, ' + scopeSelector + ' [id^="pub-chart-"][style*="height"] svg');
         const tableSelectors = [
            scopeSelector + ' table[id^="table-"]',
            scopeSelector + ' table.publication-table[id]',
            scopeSelector + ' table#auswertung-table',
            scopeSelector + ' table#daten-table',
            scopeSelector + ' table#bruteforce-results-table',
            scopeSelector + ' table#praes-as-vs-t2-comp-table',
            scopeSelector + ' table#praes-as-vs-t2-test-table'
         ];
         const tableContainers = (format === 'png' && APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT) ? document.querySelectorAll(tableSelectors.join(', ')) : [];

         if (chartContainers.length === 0 && tableContainers.length === 0) { ui_helpers.showToast(langKey==='de'?'Keine Diagramme oder Tabellen im aktuellen Sichtbereich gefunden.':'No charts or tables found in the current view.', 'warning'); return; }

         chartContainers.forEach((svgElement, index) => {
             const chartDiv = svgElement.closest('[id^="chart-"], [id^="pub-chart-"]');
             const chartId = chartDiv?.id || `chart_in_zip_${index + 1}`;
             const chartName = chartDiv?.querySelector('h5, .card-header > span:first-child')?.textContent.trim().replace(/[^a-z0-9_-]/gi, '_').substring(0,25) || chartId.replace(/^chart-|^pub-chart-/, '').replace(/-container$/, '').replace(/-content$/, '').replace(/-[0-9]+$/, '');
             let filenameKey, conversionPromise, ext;
             if (format === 'png') { filenameKey = 'CHART_SINGLE_PNG'; ext = 'png'; conversionPromise = convertSvgToPngBlob(svgElement).catch(e => { return null; }); }
             else if (format === 'svg') { filenameKey = 'CHART_SINGLE_SVG'; ext = 'svg'; conversionPromise = convertSvgToSvgBlob(svgElement).catch(e => { return null; }); }
             else { return; }
             const filename = generateFilename(filenameKey, kollektiv, ext, { chartName });
             promises.push(conversionPromise.then(blob => (blob ? { blob, filename } : { error: new Error("Blob is null for chart"), filename })));
         });

         tableContainers.forEach((table, index) => {
              if (format !== 'png') return;
              const tableId = table.id || `table_in_zip_${generateUUID().substring(0,8)}`; if(!table.id) table.id = tableId;
              let tableName = table.closest('.card')?.querySelector('.card-header')?.firstChild?.textContent?.trim() || table.caption?.textContent.trim() || table.id;
              tableName = tableName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
              const typeKey = 'TABLE_PNG_EXPORT';
              const filename = generateFilename(typeKey, kollektiv, 'png', {tableName, tableId});
              const baseWidth = table.offsetWidth || 800;
              promises.push(convertTableToPngBlob(tableId, baseWidth).catch(e => { return null; }).then(blob => (blob ? { blob, filename } : { error: new Error("Table Blob is null"), filename })));
         });

         try {
             const results = await Promise.all(promises);
             results.forEach(result => { if (result && result.blob) { zip.file(result.filename, result.blob); successCount++; } else if (result && result.error) { } });
             if (successCount > 0) {
                 const zipFilename = generateFilename(zipTypeKey, kollektiv, 'zip'); const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
                 if (downloadFile(content, zipFilename, "application/zip")) ui_helpers.showToast(`${successCount} ${langKey==='de'?'Objekt(e) erfolgreich als':'object(s) successfully exported as'} ${format.toUpperCase()} ${langKey==='de'?'exportiert (ZIP).':'(ZIP).'}`, 'success');
             } else { ui_helpers.showToast(`${langKey==='de'?'Export':'Export'} (${format.toUpperCase()}) ${langKey==='de'?'fehlgeschlagen: Keine Objekte konnten konvertiert werden.':'failed: No objects could be converted.'}`, 'danger'); }
         } catch (error) { ui_helpers.showToast(`${langKey==='de'?'Fehler beim Erstellen des':'Error creating the'} ${format.toUpperCase()} ZIPs.`, 'danger'); }
     }

     async function exportCategoryZip(category, allRawData, bfResults, currentKollektiv, appliedCriteria, appliedLogic) {
         const langKey = state.getCurrentPublikationLang() || 'de';
         ui_helpers.showToast(`${langKey==='de'?"Generiere":"Generating"} ${category.toUpperCase()} ${langKey==='de'?"ZIP-Paket...":"ZIP package..."}`, 'info', 2000);
          if (!window.JSZip) { ui_helpers.showToast(langKey==='de'?"JSZip Bibliothek nicht geladen.":"JSZip library not loaded.", "danger"); return; }
         const zip = new JSZip(); let filesAdded = 0;
         let statsDataForAllKollektive = null;
         const currentPubLang = state.getCurrentPublikationLang();

         const needsStats = ['all-zip', 'csv-zip', 'md-zip', 'html'].includes(category);
         if(needsStats && allRawData && allRawData.length > 0 && appliedCriteria && appliedLogic) {
             try {
                statsDataForAllKollektive = statisticsService.calculateAllStatsForPublication(allRawData, appliedCriteria, appliedLogic, bfResults);
             } catch(e) { ui_helpers.showToast(`${langKey==='de'?"Fehler bei Statistikberechnung für":"Error in statistics calculation for"} ${category.toUpperCase()} ZIP.`, 'danger'); return; }
             if (!statsDataForAllKollektive || !statsDataForAllKollektive[currentKollektiv]) {
                 ui_helpers.showToast(`${langKey==='de'?"Statistikberechnung ergab keine Daten für":"Statistics calculation yielded no data for"} ${category.toUpperCase()} ZIP ${langKey==='de'?"für Kollektiv":"for cohort"} ${getKollektivDisplayName(currentKollektiv, langKey)}.`, 'warning');
                 if (category === 'csv-zip' || category === 'html') return;
             }
         }
         const currentKollektivStats = statsDataForAllKollektive ? statsDataForAllKollektive[currentKollektiv] : null;
         const currentKollektivFilteredData = dataProcessor.filterDataByKollektiv(allRawData, currentKollektiv);


         const addFile = (filename, content) => { if (content !== null && content !== undefined && String(content).length > 0) { zip.file(filename, content); filesAdded++; return true; } return false; };
         try {
             if (['all-zip', 'csv-zip'].includes(category)) {
                 if (currentKollektivStats) addFile(generateFilename('STATS_CSV', currentKollektiv, 'csv'), generateStatistikCSVString(currentKollektivStats, currentKollektiv, appliedCriteria, appliedLogic));
                 if (currentKollektivFilteredData && currentKollektivFilteredData.length > 0) addFile(generateFilename('FILTERED_DATA_CSV', currentKollektiv, 'csv'), generateFilteredDataCSVString(currentKollektivFilteredData));
             }
             if (['all-zip', 'md-zip'].includes(category)) {
                 if (currentKollektivStats?.deskriptiv) addFile(generateFilename('DESKRIPTIV_MD', currentKollektiv, 'md'), generateMarkdownTableString(currentKollektivStats.deskriptiv, 'deskriptiv', currentKollektiv));
                 if (currentKollektivFilteredData && currentKollektivFilteredData.length > 0) addFile(generateFilename('DATEN_MD', currentKollektiv, 'md'), generateMarkdownTableString(currentKollektivFilteredData, 'daten', currentKollektiv));
                 if (currentKollektivFilteredData && currentKollektivFilteredData.length > 0) addFile(generateFilename('AUSWERTUNG_MD', currentKollektiv, 'md'), generateMarkdownTableString(currentKollektivFilteredData, 'auswertung', currentKollektiv, appliedCriteria, appliedLogic));

                 if (typeof publicationTextGenerator !== 'undefined' && statsDataForAllKollektive) {
                     const commonDataForPubGen = {
                        appName: APP_CONFIG.APP_NAME, appVersion: APP_CONFIG.APP_VERSION, currentKollektivName: getKollektivDisplayName(currentKollektiv, currentPubLang),
                        nGesamt: statsDataForAllKollektive.Gesamt?.deskriptiv?.anzahlPatienten || 0,
                        nDirektOP: statsDataForAllKollektive['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
                        nNRCT: statsDataForAllKollektive.nRCT?.deskriptiv?.anzahlPatienten || 0,
                        t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
                        t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
                        t2SizeStep: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step,
                        bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
                        significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
                        bruteForceMetricForPublication: state.getCurrentPublikationBruteForceMetric()
                     };
                     PUBLICATION_CONFIG.sections.forEach(mainSection => {
                         mainSection.subSections.forEach(subSection => {
                            const mdContent = publicationTextGenerator.getSectionTextAsMarkdown(subSection.id, currentPubLang, statsDataForAllKollektive, statsDataForAllKollektive, commonDataForPubGen);
                            const typeKey = subSection.id.startsWith('methoden') ? 'PUBLIKATION_METHODEN_MD' : 'PUBLIKATION_ERGEBNISSE_MD';
                            const sectionNameForFile = subSection.id.replace(/^(methoden_|ergebnisse_)/, '');
                            addFile(generateFilename(typeKey, currentKollektiv, 'md', {sectionName: sectionNameForFile}), mdContent);
                         });
                     });
                 }
             }
             if (['all-zip'].includes(category) && bfResults && bfResults[currentKollektiv]) { addFile(generateFilename('BRUTEFORCE_TXT', currentKollektiv, 'txt'), generateBruteForceTXTString(bfResults[currentKollektiv], currentKollektiv)); }
             if (['all-zip', 'html'].includes(category) && currentKollektivFilteredData && currentKollektivFilteredData.length > 0 ) { addFile(generateFilename('COMPREHENSIVE_REPORT_HTML', currentKollektiv, 'html'), generateComprehensiveReportHTML(allRawData, bfResults ? bfResults[currentKollektiv] : null, currentKollektiv, appliedCriteria, appliedLogic)); }

             if (['png-zip'].includes(category)) { await exportChartsZip('#app-container', 'PNG_ZIP', currentKollektiv, 'png'); return; }
             if (['svg-zip'].includes(category)) { await exportChartsZip('#app-container', 'SVG_ZIP', currentKollektiv, 'svg'); return; }


            if (filesAdded > 0) {
                const zipFilename = generateFilename(`${category.toUpperCase()}_PAKET`, currentKollektiv, 'zip');
                const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
                if (downloadFile(content, zipFilename, "application/zip")) ui_helpers.showToast(`${filesAdded} ${langKey==='de'?"Datei(en) erfolgreich im":"file(s) successfully exported in"} ${category.toUpperCase()} ${langKey==='de'?"ZIP-Paket exportiert.":"ZIP package."}`, 'success');
            } else { ui_helpers.showToast(`${langKey==='de'?"Keine Dateien für das":"No files found or generated for the"} ${category.toUpperCase()} ${langKey==='de'?"ZIP-Paket gefunden oder generiert.":"ZIP package."}`, 'warning'); }
         } catch (error) { ui_helpers.showToast(`${langKey==='de'?"Fehler beim Erstellen des":"Error creating the"} ${category.toUpperCase()} ${langKey==='de'?"ZIP-Pakets.":"ZIP package."}`, 'danger'); }
     }

     function exportPraesentationData(actionId, presentationData, kollektiv) {
            const langKey = state.getCurrentPublikationLang() || 'de';
            let content = null, filenameKey = null, extension = null, mimeType = null, options = {}, success = false; const na = '--';
            if (!presentationData) { ui_helpers.showToast(langKey==='de'?"Keine Daten für Präsentationsexport verfügbar.":"No data available for presentation export.", "warning"); return; }
            const { statsAS, statsT2, vergleich, comparisonCriteriaSet, patientCount, statsGesamt, statsDirektOP, statsNRCT } = presentationData;
            const isAsPurView = actionId.includes('-as-pur-');
            options.studyId = comparisonCriteriaSet?.id || null;
            if (presentationData.t2CriteriaLabelShort) options.t2CriteriaLabelShort = presentationData.t2CriteriaLabelShort; // This should be a key or already translated
            if (presentationData.t2CriteriaLabelFull) options.t2CriteriaLabelFull = presentationData.t2CriteriaLabelFull; // This should be a key or already translated

            try {
                if (isAsPurView && actionId === 'download-performance-as-pur-csv') {
                     const allStatsData = { statsGesamt, statsDirektOP, statsNRCT }; const headers = [langKey==='de'?'Kollektiv':'Cohort', 'N', 'Sens', 'Sens CI Low', 'Sens CI High', 'Spez', 'Spez CI Low', 'Spez CI High', 'PPV', 'PPV CI Low', 'PPV CI High', 'NPV', 'NPV CI Low', 'NPV CI High', 'Acc', 'Acc CI Low', 'Acc CI High', 'BalAcc', 'BalAcc CI Low', 'BalAcc CI High', 'F1', 'F1 CI Low', 'F1 CI High', 'AUC', 'AUC CI Low', 'AUC CI High', 'CI Method']; const fVal = (v, d=1, isStd=false) => formatNumber(v, d, na, isStd, langKey);
                     const rows = Object.entries(allStatsData).map(([key, stats]) => { let k = key.replace('stats',''); let dN = (k === 'DirektOP') ? 'direkt OP' : (k === 'NRCT') ? 'nRCT' : k; if (!stats || typeof stats.matrix !== 'object') return [getKollektivDisplayName(dN, langKey), 0, ...Array(24).fill(na), na]; const n = stats.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : 0; const fRowData = (m, metric_k) => { const dig = (metric_k === 'f1' || metric_k === 'auc') ? 3 : 1; const isStd = (metric_k === 'f1' || metric_k === 'auc'); return [fVal(m?.value, dig, isStd), fVal(m?.ci?.lower, dig, isStd), fVal(m?.ci?.upper, dig, isStd)]; }; return [ getKollektivDisplayName(dN, langKey), n, ...fRowData(stats.sens, 'sens'), ...fRowData(stats.spez, 'spez'), ...fRowData(stats.ppv, 'ppv'), ...fRowData(stats.npv, 'npv'), ...fRowData(stats.acc, 'acc'), ...fRowData(stats.balAcc, 'balAcc'), ...fRowData(stats.f1, 'f1'), ...fRowData(stats.auc, 'auc'), stats.sens?.method || na ]; });
                     content = Papa.unparse([headers, ...rows], { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" }); filenameKey = 'PRAES_AS_PERF_CSV'; extension = 'csv'; mimeType = 'text/csv;charset=utf-8;';
                } else if (isAsPurView && actionId === 'download-performance-as-pur-md') { options.kollektiv = kollektiv; content = generateMarkdownTableString(presentationData, 'praes_as_perf', kollektiv, null, null, options); filenameKey = 'PRAES_AS_PERF_MD'; extension = 'md'; mimeType = 'text/markdown;charset=utf-8;';
                } else if (actionId === 'download-performance-as-vs-t2-csv') { if (!statsAS || !statsT2) { ui_helpers.showToast(langKey==='de'?"Vergleichsdaten für CSV fehlen.":"Comparison data for CSV missing.", "warning"); return; } const headers = [langKey==='de'?'Metrik':'Metric', 'AS (Wert)', 'AS (95% CI Lower)', 'AS (95% CI Upper)', 'T2 (Wert)', 'T2 (95% CI Lower)', 'T2 (95% CI Upper)', 'CI Methode AS', 'CI Methode T2']; const fRow = (mKey, nmDe, nmEn, isP = true, d = 1) => { const mAS = statsAS[mKey]; const mT2 = statsT2[mKey]; const dig = (mKey === 'auc' || mKey === 'f1') ? 3 : d; const isStd = (mKey === 'auc' || mKey === 'f1'); const nm = langKey==='de'?nmDe:nmEn; return [nm, formatNumber(mAS?.value, dig, na, isStd, langKey), formatNumber(mAS?.ci?.lower, dig, na, isStd, langKey), formatNumber(mAS?.ci?.upper, dig, na, isStd, langKey), formatNumber(mT2?.value, dig, na, isStd, langKey), formatNumber(mT2?.ci?.lower, dig, na, isStd, langKey), formatNumber(mT2?.ci?.upper, dig, na, isStd, langKey), mAS?.method || na, mT2?.method || na]; }; const rows = [ fRow('sens', 'Sensitivität', 'Sensitivity'), fRow('spez', 'Spezifität', 'Specificity'), fRow('ppv', 'PPV', 'PPV'), fRow('npv', 'NPV', 'NPV'), fRow('acc', 'Accuracy', 'Accuracy'), fRow('balAcc', 'Balanced Accuracy', 'Balanced Accuracy'), fRow('f1', 'F1-Score', 'F1-Score', false, 3), fRow('auc', 'AUC', 'AUC', false, 3) ]; content = Papa.unparse([headers, ...rows], { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" }); filenameKey = 'PRAES_AS_VS_T2_PERF_CSV'; extension = 'csv'; mimeType = 'text/csv;charset=utf-8;';
                } else if (actionId === 'download-comp-table-as-vs-t2-md') { content = generateMarkdownTableString(presentationData, 'praes_as_vs_t2_comp', kollektiv, null, null, options); filenameKey = 'PRAES_AS_VS_T2_COMP_MD'; extension = 'md'; mimeType = 'text/markdown;charset=utf-8;';
                } else if (actionId === 'download-tests-as-vs-t2-md') { content = generateMarkdownTableString(presentationData, 'praes_as_vs_t2_tests', kollektiv, null, null, options); filenameKey = 'PRAES_AS_VS_T2_TESTS_MD'; extension = 'md'; mimeType = 'text/markdown;charset=utf-8;';
                } else if (actionId.includes('-chart-') || actionId.startsWith('dl-praes-')) { ui_helpers.showToast(langKey==='de'?"Chart-Export wird über die Buttons am Chart selbst ausgelöst.":"Chart export is triggered via buttons on the chart itself.", "info"); return; }
            } catch(error) {
                ui_helpers.showToast(`${langKey==='de'?"Fehler bei Präsentationsexport":"Error during presentation export"} (${actionId}).`, "danger");
                return;
            }

            if(content !== null && filenameKey && extension && mimeType) { const filename = generateFilename(filenameKey, kollektiv, extension, options); success = downloadFile(content, filename, mimeType); if(success) ui_helpers.showToast(`${langKey==='de'?"Präsentationsdaten":"Presentation data"} (${extension}) ${langKey==='de'?"exportiert:":"exported:"} ${filename}`, 'success'); }
            else if(!actionId.includes('-chart-') && !actionId.startsWith('dl-') && !actionId.startsWith('dl-card-') ) { ui_helpers.showToast(langKey==='de'?"Export für diese Option nicht verfügbar oder Daten fehlen/Fehler bei Generierung.":"Export for this option not available or data missing/error during generation.", "warning"); }
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
