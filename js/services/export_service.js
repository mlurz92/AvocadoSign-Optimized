const exportService = (() => {
    
    function generateFilename(typeKey, kollektivId = 'Gesamt', extension = 'txt', options = {}) {
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(kollektivId).replace(/[^a-zA-Z0-9_-]/gi, '_').replace(/_+/g, '_');
        let filename = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE
            .replace('{TYPE}', typeKey)
            .replace('{KOLLEKTIV}', safeKollektiv)
            .replace('{DATE}', dateStr)
            .replace('{EXT}', extension);

        if (options.chartName) {
            filename = filename.replace(typeKey, APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG.replace('{ChartName}', options.chartName.replace(/[^a-zA-Z0-9_-]/gi, '_')));
        } else if (options.tableName) {
             filename = filename.replace(typeKey, APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.TABLE_PNG_EXPORT.replace('{TableName}', options.tableName.replace(/[^a-zA-Z0-9_-]/gi, '_')));
        } else if (options.studyId) {
            filename = filename.replace('{StudyID}', options.studyId.replace(/[^a-zA-Z0-9_-]/gi, '_'));
        } else if (options.sectionName) {
            filename = filename.replace('{SectionName}', options.sectionName.replace(/[^a-zA-Z0-9_-]/gi, '_'));
        }

        if (APP_CONFIG.EXPORT_SETTINGS.INCLUDE_TIMESTAMP_IN_FILENAME) {
            const timeStr = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '');
            filename = filename.replace(`.${extension}`, `_${timeStr}.${extension}`);
        }
        return filename;
    }

    function _downloadFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
        if (typeof content !== 'string' && !(content instanceof Blob)) {
            console.error("Ungültiger Inhalt für Download:", content);
            ui_helpers.showToast("Fehler beim Vorbereiten der Datei für den Download.", "danger");
            return;
        }
        try {
            const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
            saveAs(blob, filename);
        } catch (e) {
            console.error("Fehler beim Auslösen des Downloads:", e);
            ui_helpers.showToast("Download fehlgeschlagen. Bitte versuchen Sie es erneut oder prüfen Sie die Browser-Konsole.", "danger");
        }
    }

    function _createCSVString(data, delimiter = APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER) {
        if (!Array.isArray(data) || data.length === 0) return "";
        try {
            return Papa.unparse(data, { delimiter: delimiter, header: true, escapeFormulae: true });
        } catch (e) {
            console.error("Fehler beim Erstellen des CSV-Strings:", e);
            return "Fehler bei CSV-Erstellung";
        }
    }
    
    function _createTSVString(data) {
        if (!Array.isArray(data) || data.length === 0) return "";
        try {
            return Papa.unparse(data, { delimiter: "\t", header: true, escapeFormulae: true });
        } catch (e) {
            console.error("Fehler beim Erstellen des TSV-Strings:", e);
            return "Fehler bei TSV-Erstellung";
        }
    }

    function _createMarkdownTableStringFromObjects(dataObjects, headersOrder = null) {
        if (!Array.isArray(dataObjects) || dataObjects.length === 0) return "";
        const headers = headersOrder || Object.keys(dataObjects[0]);
        let tableString = `| ${headers.join(' | ')} |\n`;
        tableString += `| ${headers.map(() => '---').join(' | ')} |\n`;
        dataObjects.forEach(obj => {
            const row = headers.map(header => {
                let value = obj[header];
                if (value === null || value === undefined) value = '';
                else if (typeof value === 'number' && !Number.isInteger(value)) value = formatNumber(value, 4, '', 'en'); 
                else if (typeof value === 'boolean') value = value ? 'Ja' : 'Nein';
                return String(value).replace(/\|/g, '\\|');
            }).join(' | ');
            tableString += `| ${row} |\n`;
        });
        return tableString;
    }
    
    function _formatPValueForExport(pValue, lang = 'de') {
        if (pValue === null || pValue === undefined || isNaN(pValue) || !isFinite(pValue)) return 'N/A';
        return parseFloat(pValue.toPrecision(8)); 
    }

    function exportStatistikCSV(allStats, kollektivId, currentT2Criteria, currentT2Logic) {
        const stats = allStats[kollektivId];
        if (!stats) { ui_helpers.showToast("Keine Statistikdaten für Export verfügbar.", "warning"); return; }

        const dataToExport = [];
        const kollektivName = getKollektivDisplayName(kollektivId);
        
        const addMetricRows = (metricType, metricData, criteriaInfo = null) => {
            if (!metricData || Object.keys(metricData).length === 0) return;
            const baseInfo = { Kollektiv: kollektivName, Methode: metricType };
            if (criteriaInfo) {
                baseInfo.Kriterien = criteriaInfo.definition;
                baseInfo.Logik = criteriaInfo.logic;
            }
            const metricsOrder = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'auc', 'f1', 'mcc'];
            metricsOrder.forEach(key => {
                const m = metricData[key];
                if (m && m.value !== undefined) {
                    dataToExport.push({
                        ...baseInfo,
                        Metrik: key.toUpperCase(),
                        Wert: formatNumber(m.value, 6, '', 'en'), 
                        CI_lower: formatNumber(m.ci?.lower, 6, '', 'en'),
                        CI_upper: formatNumber(m.ci?.upper, 6, '', 'en'),
                        CI_Methode: m.method || '',
                        N_Trials: m.n_trials || (m.matrix_components ? mc.total : '')
                    });
                }
            });
            if(metricData.matrix_components) {
                const mc = metricData.matrix_components;
                ['rp', 'fp', 'fn', 'rn', 'total'].forEach(compKey => {
                     dataToExport.push({ ...baseInfo, Metrik: `Matrix_${compKey}`, Wert: mc[compKey] });
                });
            }
        };

        addMetricRows("Avocado Sign", stats.gueteAS);
        addMetricRows("T2 (angewandt)", stats.gueteT2_angewandt, { 
            definition: studyT2CriteriaManager.formatCriteriaForDisplay(currentT2Criteria, currentT2Logic, false),
            logic: currentT2Logic
        });

        Object.keys(stats.gueteT2_literatur || {}).forEach(studyId => {
            const studyData = stats.gueteT2_literatur[studyId];
            addMetricRows(`T2 (${studyData.studyInfo?.name || studyId})`, studyData, {
                definition: studyT2CriteriaManager.formatCriteriaForDisplay(studyData.criteria, studyData.logic, false),
                logic: studyData.logic
            });
        });
        if(stats.bruteforce_definition && stats.gueteT2_bruteforce && stats.bruteforce_definition.criteria) {
            addMetricRows(`T2 (Brute-Force Opt. für ${stats.bruteforce_definition.metricName})`, stats.gueteT2_bruteforce, {
                definition: studyT2CriteriaManager.formatCriteriaForDisplay(stats.bruteforce_definition.criteria, stats.bruteforce_definition.logic, false),
                logic: stats.bruteforce_definition.logic
            });
        }
        
        Object.keys(stats).forEach(key => {
            if (key.startsWith('vergleichASvs')) {
                const compData = stats[key];
                const t2SetName = key.replace('vergleichASvsT2_', '').replace('literatur_', 'Lit: ').replace('bruteforce', 'BF Opt.');
                if(compData.mcnemar) {
                    dataToExport.push({ Kollektiv: kollektivName, Methode: `Vergleich AS vs ${t2SetName}`, Metrik: 'McNemar_chiSquared', Wert: formatNumber(compData.mcnemar.chiSquared,4,'','en'), P_Value: _formatPValueForExport(compData.mcnemar.pValue) });
                }
                 if(compData.delong) {
                    dataToExport.push({ Kollektiv: kollektivName, Methode: `Vergleich AS vs ${t2SetName}`, Metrik: 'DeLong_zStat', Wert: formatNumber(compData.delong.zStat,4,'','en'), P_Value: _formatPValueForExport(compData.delong.pValue), Diff_AUC: formatNumber(compData.delong.diffAUC, 4,'','en') });
                }
            }
        });
        if (stats.assoziationen) {
             Object.keys(stats.assoziationen).forEach(merkmal => {
                const assoc = stats.assoziationen[merkmal];
                if (assoc.or) dataToExport.push({ Kollektiv: kollektivName, Methode: 'Assoziation', Metrik: `OR (${merkmal})`, Wert: formatNumber(assoc.or.value,4,'','en'), CI_lower: formatNumber(assoc.or.ci?.lower,4,'','en'), CI_upper: formatNumber(assoc.or.ci?.upper,4,'','en'), P_Value: _formatPValueForExport(assoc.or.pValue)});
                if (assoc.rd) dataToExport.push({ Kollektiv: kollektivName, Methode: 'Assoziation', Metrik: `RD (${merkmal})`, Wert: formatNumber(assoc.rd.value,4,'','en'), CI_lower: formatNumber(assoc.rd.ci?.lower,4,'','en'), CI_upper: formatNumber(assoc.rd.ci?.upper,4,'','en')});
                if (assoc.phi) dataToExport.push({ Kollektiv: kollektivName, Methode: 'Assoziation', Metrik: `Phi (${merkmal})`, Wert: formatNumber(assoc.phi.value,4,'','en')});
                if (assoc.fisher) dataToExport.push({ Kollektiv: kollektivName, Methode: 'Assoziation', Metrik: `Fisher (${merkmal})`, P_Value: _formatPValueForExport(assoc.fisher.pValue)});
                if (assoc.uValue) dataToExport.push({ Kollektiv: kollektivName, Methode: 'Assoziation', Metrik: `Mann-Whitney U (${merkmal})`, U_Value: formatNumber(assoc.uValue,4,'','en'), Z_Value: formatNumber(assoc.zValue,4,'','en'), P_Value: _formatPValueForExport(assoc.pValue)});
             });
        }


        const csvString = _createCSVString(dataToExport);
        const filename = generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.STATS_CSV, kollektivId, 'csv');
        _downloadFile(filename, csvString, 'text/csv;charset=utf-8;');
    }

    function exportBruteForceTXT(resultsData) {
        if (!resultsData || !resultsData.results || resultsData.results.length === 0) {
            ui_helpers.showToast("Keine Brute-Force-Ergebnisse für Export verfügbar.", "warning"); return;
        }
        const { results, metric, kollektiv, duration, totalTested, nGesamt, nPlus, nMinus, bestResult } = resultsData;
        const kollektivName = getKollektivDisplayName(kollektiv);
        let txt = `Brute-Force Optimierungsergebnisse\n`;
        txt += `===================================\n`;
        txt += `Kollektiv: ${kollektivName} (N=${nGesamt}, N+=${nPlus}, N-=${nMinus})\n`;
        txt += `Zielmetrik: ${metric}\n`;
        txt += `Dauer: ${formatNumber(duration / 1000, 2, '--', 'en')} Sekunden\n`;
        txt += `Getestete Kombinationen: ${formatNumber(totalTested, 0, '--', 'en')}\n\n`;

        txt += `Bestes Ergebnis:\n`;
        txt += `----------------\n`;
        if (bestResult) {
            txt += `  Metrikwert (${metric}): ${formatNumber(bestResult.metricValue, 6, '--', 'en')}\n`;
            txt += `  Sensitivität: ${formatPercent(bestResult.sens, 2, '--', 'en')}\n`;
            txt += `  Spezifität: ${formatPercent(bestResult.spez, 2, '--', 'en')}\n`;
            txt += `  PPV: ${formatPercent(bestResult.ppv, 2, '--', 'en')}\n`;
            txt += `  NPV: ${formatPercent(bestResult.npv, 2, '--', 'en')}\n`;
            txt += `  Accuracy: ${formatPercent(bestResult.acc, 2, '--', 'en')}\n`;
            txt += `  Balanced Acc: ${formatPercent(bestResult.balAcc, 2, '--', 'en')}\n`;
            txt += `  F1-Score: ${formatNumber(bestResult.f1, 4, '--', 'en')}\n`;
            txt += `  Logik: ${bestResult.logic.toUpperCase()}\n`;
            txt += `  Kriterien: ${studyT2CriteriaManager.formatCriteriaForDisplay(bestResult.criteria, bestResult.logic, false)}\n`;
            txt += `  Matrix (RP/FP/FN/RN): ${bestResult.matrix.rp}/${bestResult.matrix.fp}/${bestResult.matrix.fn}/${bestResult.matrix.rn}\n\n`;
        } else {
            txt += `  Kein valides bestes Ergebnis gefunden.\n\n`;
        }
        
        txt += `Top Ergebnisse (max. 10 oder bis Rang > 10):\n`;
        txt += `-------------------------------------------\n`;
        txt += `Rang | ${metric.padEnd(12)} | Sens.    | Spez.    | PPV      | NPV      | Logik | Kriterien\n`;
        txt += `-----|----------------|----------|----------|----------|----------|-------|----------\n`;
        
        let rank = 1, displayedCount = 0, lastMetricValue = -Infinity;
        const precision = 8;

        for (let i = 0; i < results.length; i++) {
            const res = results[i];
            if (!res || typeof res.metricValue !== 'number' || !isFinite(res.metricValue)) continue;

            const currentMetricValueRounded = parseFloat(res.metricValue.toFixed(precision));
            const lastMetricValueRounded = parseFloat(lastMetricValue.toFixed(precision));
            let currentRank = rank;

            if (i > 0 && Math.abs(currentMetricValueRounded - lastMetricValueRounded) > 1e-8) {
                rank = displayedCount + 1;
                currentRank = rank;
            } else if (i > 0) {
                currentRank = rank;
            }
            
            txt += `${String(currentRank).padEnd(4)} | ` +
                   `${formatNumber(res.metricValue, 6, '', 'en').padEnd(12)} | ` +
                   `${formatPercent(res.sens, 1, '--', 'en').padEnd(8)} | ` +
                   `${formatPercent(res.spez, 1, '--', 'en').padEnd(8)} | ` +
                   `${formatPercent(res.ppv, 1, '--', 'en').padEnd(8)} | ` +
                   `${formatPercent(res.npv, 1, '--', 'en').padEnd(8)} | ` +
                   `${res.logic.toUpperCase().padEnd(5)} | ` +
                   `${studyT2CriteriaManager.formatCriteriaForDisplay(res.criteria, res.logic, false)}\n`;
            
            if (isNewRank || i === 0) {
                lastMetricValue = res.metricValue;
            }
            displayedCount++;
            if (rank > 10 && displayedCount >=10 && (Math.abs(currentMetricValueRounded - lastMetricValueRounded) > 1e-8) ) break;
        }

        const filename = generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.BRUTEFORCE_TXT, kollektiv, 'txt');
        _downloadFile(filename, txt);
    }

    function exportPublikationSectionMarkdown(sectionType, sectionName, lang, allKollektivStats, commonData, options) {
        if (!publicationTextGenerator || typeof publicationTextGenerator.getSectionTextAsMarkdown !== 'function') {
            ui_helpers.showToast("Markdown-Generator für Publikation nicht verfügbar.", "danger");
            return;
        }
        const markdownContent = publicationTextGenerator.getSectionTextAsMarkdown(sectionName, lang, allKollektivStats, commonData, options);
        const filenameType = sectionType === 'methoden' ? APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PUBLIKATION_METHODEN_MD :
                             sectionType === 'ergebnisse' ? APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PUBLIKATION_ERGEBNISSE_MD :
                             APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PUBLIKATION_REFERENZEN_MD;

        const filename = generateFilename(filenameType, 'Publikation', 'md', { sectionName: sectionName });
        _downloadFile(filename, markdownContent, 'text/markdown;charset=utf-8;');
    }
    
    function _createPublicationTableTSV(allKollektivStats, lang, tableKey, commonData) {
        let dataForTsv = [];
        let headers = [];
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const na = 'N/A';
        const langForNum = lang === 'en' ? 'en' : 'de';

        const formatMetricForTsv = (metricData, isRate = true, digits = 1) => {
            if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value)) return `${na}\t${na}\t${na}`;
            const val = formatNumber(metricData.value * (isRate ? 100 : 1), digits, na, langForNum);
            const lower = formatNumber(metricData.ci?.lower * (isRate ? 100 : 1), digits, na, langForNum);
            const upper = formatNumber(metricData.ci?.upper * (isRate ? 100 : 1), digits, na, langForNum);
            return `${val}\t${lower}\t${upper}`;
        };

        if (tableKey === 'patientenCharakteristikaTabelle') {
            headers = ['Merkmal', `Gesamt (N=${allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0})`, `Direkt OP (N=${allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0})`, `nRCT (N=${allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0})`];
            const fVal = (val, dig = 1) => formatNumber(val, dig, na, langForNum);
            const fPerc = (count, total, dig = 1) => (total > 0 && count !== undefined && count !== null && !isNaN(count)) ? `${count} (${formatPercent(count / total, dig, na, lang)})` : na;
            
            dataForTsv.push({
                'Merkmal': 'Alter, Median (Min–Max) [Jahre]',
                [`Gesamt (N=${allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0})`]: `${fVal(allKollektivStats.Gesamt?.deskriptiv?.alter?.median,1)} (${fVal(allKollektivStats.Gesamt?.deskriptiv?.alter?.min,0)}–${fVal(allKollektivStats.Gesamt?.deskriptiv?.alter?.max,0)})`,
                [`Direkt OP (N=${allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0})`]: `${fVal(allKollektivStats['direkt OP']?.deskriptiv?.alter?.median,1)} (${fVal(allKollektivStats['direkt OP']?.deskriptiv?.alter?.min,0)}–${fVal(allKollektivStats['direkt OP']?.deskriptiv?.alter?.max,0)})`,
                [`nRCT (N=${allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0})`]: `${fVal(allKollektivStats.nRCT?.deskriptiv?.alter?.median,1)} (${fVal(allKollektivStats.nRCT?.deskriptiv?.alter?.min,0)}–${fVal(allKollektivStats.nRCT?.deskriptiv?.alter?.max,0)})`
            });
            dataForTsv.push({
                'Merkmal': 'Geschlecht, männlich [n (%)]',
                [`Gesamt (N=${allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0})`]: fPerc(allKollektivStats.Gesamt?.deskriptiv?.geschlecht?.m, allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten),
                [`Direkt OP (N=${allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0})`]: fPerc(allKollektivStats['direkt OP']?.deskriptiv?.geschlecht?.m, allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten),
                [`nRCT (N=${allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0})`]: fPerc(allKollektivStats.nRCT?.deskriptiv?.geschlecht?.m, allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten)
            });
            dataForTsv.push({
                'Merkmal': 'Pathologischer N-Status, positiv [n (%)]',
                [`Gesamt (N=${allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0})`]: fPerc(allKollektivStats.Gesamt?.deskriptiv?.nStatus?.plus, allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten),
                [`Direkt OP (N=${allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0})`]: fPerc(allKollektivStats['direkt OP']?.deskriptiv?.nStatus?.plus, allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten),
                [`nRCT (N=${allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0})`]: fPerc(allKollektivStats.nRCT?.deskriptiv?.nStatus?.plus, allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten)
            });
        } else if (['diagnostischeGueteASTabelle', 'diagnostischeGueteLiteraturT2Tabelle', 'diagnostischeGueteOptimierteT2Tabelle'].includes(tableKey)) {
            headers = ['Methode/Kriteriensatz', 'Angew. Kollektiv', 'Sens (%)', 'Sens CI_low', 'Sens CI_up', 'Spez (%)', 'Spez CI_low', 'Spez CI_up', 'PPV (%)', 'PPV CI_low', 'PPV CI_up', 'NPV (%)', 'NPV CI_low', 'NPV CI_up', 'Acc (%)', 'Acc CI_low', 'Acc CI_up', 'AUC', 'AUC CI_low', 'AUC CI_up'];
            const addRows = (methodName, kolId, stats) => {
                if (stats && stats.matrix_components) {
                    dataForTsv.push({
                        'Methode/Kriteriensatz': methodName,
                        'Angew. Kollektiv': getKollektivDisplayName(kolId),
                        'Sens (%)': formatMetricForTsv(stats.sens, true, 1).split('\t')[0], 'Sens CI_low': formatMetricForTsv(stats.sens, true, 1).split('\t')[1], 'Sens CI_up': formatMetricForTsv(stats.sens, true, 1).split('\t')[2],
                        'Spez (%)': formatMetricForTsv(stats.spez, true, 1).split('\t')[0], 'Spez CI_low': formatMetricForTsv(stats.spez, true, 1).split('\t')[1], 'Spez CI_up': formatMetricForTsv(stats.spez, true, 1).split('\t')[2],
                        'PPV (%)': formatMetricForTsv(stats.ppv, true, 1).split('\t')[0], 'PPV CI_low': formatMetricForTsv(stats.ppv, true, 1).split('\t')[1], 'PPV CI_up': formatMetricForTsv(stats.ppv, true, 1).split('\t')[2],
                        'NPV (%)': formatMetricForTsv(stats.npv, true, 1).split('\t')[0], 'NPV CI_low': formatMetricForTsv(stats.npv, true, 1).split('\t')[1], 'NPV CI_up': formatMetricForTsv(stats.npv, true, 1).split('\t')[2],
                        'Acc (%)': formatMetricForTsv(stats.acc, true, 1).split('\t')[0], 'Acc CI_low': formatMetricForTsv(stats.acc, true, 1).split('\t')[1], 'Acc CI_up': formatMetricForTsv(stats.acc, true, 1).split('\t')[2],
                        'AUC': formatMetricForTsv(stats.auc, false, 3).split('\t')[0], 'AUC CI_low': formatMetricForTsv(stats.auc, false, 3).split('\t')[1], 'AUC CI_up': formatMetricForTsv(stats.auc, false, 3).split('\t')[2]
                    });
                }
            };
            if (tableKey === 'diagnostischeGueteASTabelle') {
                kollektive.forEach(kolId => addRows('Avocado Sign', kolId, allKollektivStats[kolId]?.gueteAS));
            } else if (tableKey === 'diagnostischeGueteLiteraturT2Tabelle') {
                 PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
                    if(studySet){
                        const targetKollektivForStudy = studySet.applicableKollektiv || 'Gesamt';
                        addRows(studySet.name, targetKollektivForStudy, allKollektivStats[targetKollektivForStudy]?.gueteT2_literatur?.[conf.id]);
                    }
                });
            } else if (tableKey === 'diagnostischeGueteOptimierteT2Tabelle') {
                kollektive.forEach(kolId => addRows(`Optimiert für ${bfZielMetric}`, kolId, allKollektivStats[kolId]?.gueteT2_bruteforce));
            }
        } else if (tableKey === 'statistischerVergleichAST2Tabelle') {
            headers = ['Vergleich', 'Kollektiv', 'Methode 1', 'AUC M1', 'Methode 2', 'AUC M2', 'Diff. AUC (M1-M2)', 'DeLong p-Wert (AUC)', 'DeLong Z-Stat', 'McNemar p-Wert (Acc.)', 'McNemar Chi²'];
            kollektive.forEach(kolId => {
                const asStats = allKollektivStats[kolId]?.gueteAS;
                const litSetConf = PUBLICATION_CONFIG.literatureCriteriaSets.find(lc => {const s=studyT2CriteriaManager.getStudyCriteriaSetById(lc.id); return s && (s.applicableKollektiv===kolId || (s.applicableKollektiv==='Gesamt' && kolId==='Gesamt'));});
                const litStats = litSetConf ? allKollektivStats[kolId]?.gueteT2_literatur?.[litSetConf.id] : null;
                const bfStats = allKollektivStats[kolId]?.gueteT2_bruteforce;
                const bfDef = allKollektivStats[kolId]?.bruteforce_definition;
                const vglASLit = litSetConf ? allKollektivStats[kolId]?.[`vergleichASvsT2_literatur_${litSetConf.id}`] : null;
                const vglASBF = allKollektivStats[kolId]?.vergleichASvsT2_bruteforce;

                if(asStats && litStats && vglASLit) {
                    dataForTsv.push({
                        'Vergleich': `AS vs. Lit. (${studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id)?.displayShortName || litSetConf.id})`, 'Kollektiv': getKollektivDisplayName(kolId),
                        'Methode 1': 'AS', 'AUC M1': formatNumber(asStats.auc?.value, 4, na, langForNum),
                        'Methode 2': `Lit. (${studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id)?.displayShortName || litSetConf.id})`, 'AUC M2': formatNumber(litStats.auc?.value, 4, na, langForNum),
                        'Diff. AUC (M1-M2)': formatNumber(vglASLit.delong?.diffAUC, 4, na, langForNum),
                        'DeLong p-Wert (AUC)': _formatPValueForExport(vglASLit.delong?.pValue), 'DeLong Z-Stat': formatNumber(vglASLit.delong?.zStat, 3, na, langForNum),
                        'McNemar p-Wert (Acc.)': _formatPValueForExport(vglASLit.mcnemar?.pValue), 'McNemar Chi²': formatNumber(vglASLit.mcnemar?.chiSquared, 3, na, langForNum)
                    });
                }
                 if(asStats && bfStats && vglASBF && bfDef) {
                    dataForTsv.push({
                        'Vergleich': `AS vs. BF-Opt. (${bfDef.metricName || bfZielMetric})`, 'Kollektiv': getKollektivDisplayName(kolId),
                        'Methode 1': 'AS', 'AUC M1': formatNumber(asStats.auc?.value, 4, na, langForNum),
                        'Methode 2': `BF-Opt. (${bfDef.metricName || bfZielMetric})`, 'AUC M2': formatNumber(bfStats.auc?.value, 4, na, langForNum),
                        'Diff. AUC (M1-M2)': formatNumber(vglASBF.delong?.diffAUC, 4, na, langForNum),
                        'DeLong p-Wert (AUC)': _formatPValueForExport(vglASBF.delong?.pValue), 'DeLong Z-Stat': formatNumber(vglASBF.delong?.zStat, 3, na, langForNum),
                        'McNemar p-Wert (Acc.)': _formatPValueForExport(vglASBF.mcnemar?.pValue), 'McNemar Chi²': formatNumber(vglASBF.mcnemar?.chiSquared, 3, na, langForNum)
                    });
                }
            });
        }
        return _createTSVString(dataForTsv.map(row => { 
            const orderedRow = {};
            headers.forEach(h => orderedRow[h] = row[h] !== undefined ? row[h] : na);
            return orderedRow;
        }));
    }

    function exportPublicationTableTSV(allKollektivStats, lang, tableKey, commonData) {
        const tsvContent = _createPublicationTableTSV(allKollektivStats, lang, tableKey, commonData);
        if (!tsvContent) { ui_helpers.showToast(`Keine Daten für TSV-Export der Tabelle '${tableKey}'.`, "warning"); return; }
        
        const pubElement = PUBLICATION_CONFIG.publicationElements.ergebnisse[tableKey] || PUBLICATION_CONFIG.publicationElements.methoden[tableKey];
        const baseFilename = pubElement ? (lang === 'de' ? pubElement.titleDe : pubElement.titleEn).replace(/[^a-zA-Z0-9_-]/gi, '_') : tableKey;
        const filename = generateFilename(baseFilename, 'Publikation', 'tsv');
        _downloadFile(filename, tsvContent, 'text/tab-separated-values;charset=utf-8;');
    }

    function exportReferencesBibTeX() {
        const refs = APP_CONFIG.REFERENCES_FOR_PUBLICATION;
        if (!refs || Object.keys(refs).length === 0) {
            ui_helpers.showToast("Keine Referenzen für BibTeX-Export verfügbar.", "warning");
            return;
        }
        let bibtexString = "";
        for (const key in refs) {
            const ref = refs[key];
            let entry = `@article{${key},\n`;
            const titleMatch = ref.fullCitation.match(/"(.*?)"|“(.*?)”|'(.*?)'|‘(.*?)’/); 
            let parsedTitle = titleMatch ? (titleMatch[1] || titleMatch[2] || titleMatch[3] || titleMatch[4]) : ref.fullCitation.split('.')[1]?.trim();
            if (!parsedTitle) parsedTitle = "Unknown Title";

            const authorsMatch = ref.fullCitation.match(/^(.*?)\.\s*"/);
            let authors = authorsMatch ? authorsMatch[1].replace(/\.$/, '').replace(/, et al$/, ' and others') : "Unknown Author(s)";
            
            const journalMatch = ref.fullCitation.match(/\.\s*([A-Za-z\s&]+)\.\s*\d{4}/);
            let journal = journalMatch ? journalMatch[1].trim() : "Unknown Journal";

            const yearMatch = ref.fullCitation.match(/(\d{4});/);
            let year = yearMatch ? yearMatch[1] : "Unknown Year";
            
            const volumeMatch = ref.fullCitation.match(/;\s*(\d+)(\(\d+\))?:/);
            let volume = volumeMatch ? volumeMatch[1] : "";
            let number = volumeMatch && volumeMatch[2] ? volumeMatch[2].replace(/[()]/g, '') : "";
            
            const pagesMatch = ref.fullCitation.match(/:\s*([\d-]+)\.?$/);
            let pages = pagesMatch ? pagesMatch[1] : "";


            entry += `  author    = {${authors}},\n`;
            entry += `  title     = {${parsedTitle}},\n`;
            entry += `  journal   = {${journal}},\n`;
            entry += `  year      = {${year}},\n`;
            if (volume) entry += `  volume    = {${volume}},\n`;
            if (number) entry += `  number    = {${number}},\n`;
            if (pages) entry += `  pages     = {${pages}},\n`;
            if (ref.doi) entry += `  doi       = {${ref.doi}},\n`;
            entry += `}\n\n`;
            bibtexString += entry;
        }
        const filename = generateFilename('Referenzen', 'Publikation', 'bib');
        _downloadFile(filename, bibtexString, 'application/x-bibtex;charset=utf-8;');
    }

    function exportAllToZip(exportFunctions, kollektivId, currentLang, allStats, commonData, options, t2Criteria, t2Logic) {
        const zip = new JSZip();
        const safeKollektiv = getKollektivDisplayName(kollektivId).replace(/[^a-z0-9_-]/gi, '_');

        const addFileToZip = (filename, content, mimeType) => {
            if (content) {
                zip.file(filename, content, { binary: mimeType && mimeType.startsWith('image/') });
            }
        };
        
        if (exportFunctions.statistikCSV) addFileToZip(generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.STATS_CSV, kollektivId, 'csv'), _createCSVString(exportFunctions.statistikCSV.data));
        if (exportFunctions.bruteForceTXT && bruteForceManager.getResultsForKollektiv(kollektivId, stateManager.getBruteForceMetric())) {
            const bfResults = bruteForceManager.getResultsForKollektiv(kollektivId, stateManager.getBruteForceMetric());
            let bfTxt = `Brute-Force Optimierungsergebnisse...\nKollektiv: ${safeKollektiv}\nZielmetrik: ${bfResults.metric}\n...\n`;
            bfResults.results.forEach(r => { bfTxt += `${r.metricValue}\t${r.logic}\t${studyT2CriteriaManager.formatCriteriaForDisplay(r.criteria,r.logic,false)}\n`; });
            addFileToZip(generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.BRUTEFORCE_TXT, kollektivId, 'txt'), bfTxt);
        }
        if (exportFunctions.deskriptiveStatistikMD) addFileToZip(generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.DESKRIPTIV_MD, kollektivId, 'md'), exportFunctions.deskriptiveStatistikMD.content);
        if (exportFunctions.datenMD) addFileToZip(generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.DATEN_MD, kollektivId, 'md'), exportFunctions.datenMD.content);
        if (exportFunctions.auswertungMD) addFileToZip(generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.AUSWERTUNG_MD, kollektivId, 'md'), exportFunctions.auswertungMD.content);
        if (exportFunctions.filteredDataCSV) addFileToZip(generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.FILTERED_DATA_CSV, kollektivId, 'csv'), _createCSVString(exportFunctions.filteredDataCSV.data));
        
        PUBLICATION_CONFIG.sections.forEach(mainSection => {
            mainSection.subSections.forEach(subSection => {
                const markdownContent = publicationTextGenerator.getSectionTextAsMarkdown(subSection.id, currentLang, allStats, commonData, options);
                const filenameType = mainSection.id === 'methoden' ? APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PUBLIKATION_METHODEN_MD :
                                     mainSection.id === 'ergebnisse' ? APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PUBLIKATION_ERGEBNISSE_MD :
                                     (mainSection.id === 'referenzen' ? APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.PUBLIKATION_REFERENZEN_MD : null);
                if (filenameType) {
                     addFileToZip(generateFilename(filenameType, 'Publikation', 'md', { sectionName: subSection.id }), markdownContent);
                }
            });
        });
        
        const pubTableKeys = [
            'literaturT2KriterienTabelle', 'patientenCharakteristikaTabelle', 
            'diagnostischeGueteASTabelle', 'diagnostischeGueteLiteraturT2Tabelle', 
            'diagnostischeGueteOptimierteT2Tabelle', 'statistischerVergleichAST2Tabelle'
        ];
        pubTableKeys.forEach(key => {
            const tsvContent = _createPublicationTableTSV(allStats, currentLang, key, commonData);
            const pubElement = PUBLICATION_CONFIG.publicationElements.ergebnisse[key] || PUBLICATION_CONFIG.publicationElements.methoden[key];
            const baseFilename = pubElement ? (currentLang === 'de' ? pubElement.titleDe : pubElement.titleEn).replace(/[^a-zA-Z0-9_-]/gi, '_') : key;
            addFileToZip(generateFilename(baseFilename, 'Publikation_Tabelle', 'tsv'), tsvContent);
        });

        zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: {level: 6} })
            .then(function(content) {
                _downloadFile(generateFilename(APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.ALL_ZIP, kollektivId, 'zip'), content, 'application/zip');
            }).catch(err => {
                console.error("Fehler beim Erstellen des ZIP-Archivs:", err);
                ui_helpers.showToast("ZIP-Export fehlgeschlagen.", "danger");
            });
    }


    return Object.freeze({
        generateFilename,
        exportStatistikCSV,
        exportBruteForceTXT,
        exportPublikationSectionMarkdown,
        exportPublicationTableTSV,
        exportReferencesBibTeX,
        exportAllToZip
    });

})();

window.exportService = exportService;
