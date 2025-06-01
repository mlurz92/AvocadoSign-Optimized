const statistikTabLogic = (() => {
    let _mainAppInterface = null;
    let _globalRawData = [];
    let _currentKollektivGlobal = '';
    let _appliedT2Criteria = null;
    let _appliedT2Logic = '';
    let _statsLayout = 'einzel';
    let _statsKollektiv1 = 'Gesamt';
    let _statsKollektiv2 = 'nRCT';
    let _isInitialized = false;
    let _isDataStale = true;

    let _statsDataKollektivGlobal = null;
    let _statsDataKollektiv1 = null;
    let _statsDataKollektiv2 = null;
    let _statsVergleichKollektive = null;
    let _criteriaComparisonResults = null;

    function _createDeskriptiveStatistikContentHTML(statsData, suffix, kollektivName) {
        if (!statsData || typeof statsData !== 'object' || !statsData.deskriptiv || typeof statsData.deskriptiv !== 'object') {
             return `<p class="text-muted">Deskriptive Statistik Daten für Kollektiv '${getKollektivDisplayName(kollektivName)}' nicht verfügbar oder ungültig.</p>`;
        }
        const d = statsData.deskriptiv;
        const na = '--';
        const tooltipKeys = TOOLTIP_CONTENT.statistikTab.deskriptiv || {};

        const createRow = (label, value, unit = '', tooltipKey = '') => {
            const tooltip = tooltipKeys[tooltipKey] || label;
            return `<tr><td data-tippy-content="${tooltip}">${label}</td><td>${value !== null && value !== undefined ? value + unit : na}</td></tr>`;
        };
        
        let tableHTML = `<table class="table table-sm table-borderless table-responsive-sm small mb-2" id="table-deskriptiv-demographie-${suffix}"><tbody>`;
        tableHTML += createRow('Patienten gesamt', d.anzahlPatienten, '', 'anzahlPatienten');
        
        const alterMedianText = (d.alter && d.alter.median !== null && d.alter.median !== undefined && !isNaN(d.alter.median))
            ? `${formatNumber(d.alter.median,0,na)} (${formatNumber(d.alter.q1,0,na)}–${formatNumber(d.alter.q3,0,na)})`
            : na;
        tableHTML += createRow('Alter Median (IQR)', alterMedianText, ' Jahre', 'alterMedian');

        const alterMeanText = (d.alter && d.alter.mean !== null && d.alter.mean !== undefined && !isNaN(d.alter.mean) && d.alter.sd !== null && d.alter.sd !== undefined && !isNaN(d.alter.sd))
            ? `${formatNumber(d.alter.mean,1,na)} (±${formatNumber(d.alter.sd,1,na)})`
            : na;
        tableHTML += createRow('Alter Mittel (SD)', alterMeanText, ' Jahre', 'alterMean');

        tableHTML += createRow('Geschlecht (m/f)', `${d.geschlecht?.m || 0} / ${d.geschlecht?.f || 0}`, '', 'geschlecht');
        tableHTML += createRow('Pathologischer N-Status (+/-)', `${d.nStatus?.['+'] || 0} / ${d.nStatus?.['-'] || 0}`, '', 'nStatus');
        tableHTML += createRow('Avocado Sign (+/-)', `${d.asStatus?.['+'] || 0} / ${d.asStatus?.['-'] || 0}`, '', 'asStatus');
        
        const t2StatusKey = 't2StatusAngewandt'; // Bezieht sich auf die angewandten Kriterien, die bereits im 'd' Objekt sind.
        const t2StatusObject = d[t2StatusKey] || d.t2Status; // Fallback falls der Key anders ist
        tableHTML += createRow(`T2-Status (${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME}) (+/-)`, `${t2StatusObject?.['+'] || 0} / ${t2StatusObject?.['-'] || 0}`, '', 't2StatusAngewandt');
        
        tableHTML += `</tbody></table>`;

        let chartHTML = `<div class="row mt-2">
                            <div class="col-md-6">
                                <div id="chart-stat-age-${suffix}" class="statistik-chart-container border rounded" data-tippy-content="${tooltipKeys.alterChart || 'Altersverteilung'}"></div>
                            </div>
                            <div class="col-md-6">
                                 <div id="chart-stat-gender-${suffix}" class="statistik-chart-container border rounded" data-tippy-content="${tooltipKeys.geschlechtChart || 'Geschlechtsverteilung'}"></div>
                            </div>
                         </div>`;
        return tableHTML + chartHTML;
    }

    function _createGueteContentHTML(statsData, methodenName, kollektivName) {
        if (!statsData) return `<p class="text-muted">Güte-Daten für ${methodenName} nicht verfügbar.</p>`;
        const na = '--';
        const fCI = (metric, key, defaultDigits = 1) => {
            const isRate = !(key === 'auc' || key === 'f1');
            const digits = (key === 'auc' || key === 'f1') ? 3 : defaultDigits;
            return formatCI(metric?.value, metric?.ci?.lower, metric?.ci?.upper, digits, isRate, na);
        };
        const getInterpretationTT = (mk, st) => { return ui_helpers.getMetricInterpretationHTML(mk, st, methodenName, kollektivName);};
        const tooltipKeys = TOOLTIP_CONTENT.statistikTab.diagnostischeGuete || {};
        const matrixTableId = `table-guete-matrix-${methodenName}-${kollektivName.replace(/\s+/g, '_')}`;

        let tableHTML = `<table class="table table-sm table-borderless table-responsive-sm small mb-0"><tbody>`;
        Object.keys(UI_TEXTS.statMetrics).forEach(key => {
            if (statsData[key] && key !== 'phi') {
                const metricConfig = UI_TEXTS.statMetrics[key];
                const tooltip = tooltipKeys[key] || metricConfig.description.replace('[METHOD]', methodenName).replace('[CRITERIA_SET]', '');
                tableHTML += `<tr><td data-tippy-content="${tooltip}">${metricConfig.name}</td><td data-tippy-content="${getInterpretationTT(key, statsData[key])}">${fCI(statsData[key], key, metricConfig.digits)}</td></tr>`;
            }
        });
        tableHTML += `</tbody></table>`;

        if (statsData.matrix) {
            tableHTML += `<h6 class="mt-2 mb-1 small text-muted">Konfusionsmatrix:</h6>`;
            tableHTML += uiComponents.createConfusionMatrixHTML(statsData.matrix, methodenName, kollektivName, matrixTableId, tooltipKeys.konfusionsmatrix);
        }
        return tableHTML;
    }

    function _createVergleichContentHTML(vergleichsDaten, kollektivName, t2SetName) {
        if (!vergleichsDaten) return `<p class="text-muted">Vergleichsdaten AS vs. T2 nicht verfügbar.</p>`;
        const na = '--';
        const fPVal = (r, d=3) => { const p = r?.pValue; return (p !== null && !isNaN(p)) ? (p < 0.001 ? '&lt;0.001' : formatNumber(p, d, na, true)) : na; };
        const t2DisplayNameClean = t2SetName.replace(/\s*\(.*?\)\s*/g, '');
        const tooltipKeys = TOOLTIP_CONTENT.statistikTab.vergleichASvsT2 || {};
        const tableId = `table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}`;

        let tableHTML = `<table class="table table-sm table-borderless table-responsive-sm small mb-0" id="${tableId}"><tbody>`;
        if (vergleichsDaten.mcnemar) {
             const testDesc = ui_helpers.getTestDescriptionHTML('mcnemar', t2DisplayNameClean);
             const testInterp = ui_helpers.getTestInterpretationHTML('mcnemar', vergleichsDaten.mcnemar, kollektivName, t2DisplayNameClean);
             tableHTML += `<tr><td data-tippy-content="${testDesc || tooltipKeys.mcnemarTest || 'McNemar-Test (Accuracy)'}">McNemar (Acc)</td><td data-tippy-content="${tooltipKeys.mcnemarStatistik || 'Chi²-Wert'}">&Chi;&sup2; = ${formatNumber(vergleichsDaten.mcnemar.statistic,3,na, true)} (df=${vergleichsDaten.mcnemar.df || na})</td><td data-tippy-content="${testInterp}">${fPVal(vergleichsDaten.mcnemar)} ${getStatisticalSignificanceSymbol(vergleichsDaten.mcnemar.pValue)}</td></tr>`;
        }
        if (vergleichsDaten.delong) {
             const testDesc = ui_helpers.getTestDescriptionHTML('delong', t2DisplayNameClean);
             const testInterp = ui_helpers.getTestInterpretationHTML('delong', vergleichsDaten.delong, kollektivName, t2DisplayNameClean);
             tableHTML += `<tr><td data-tippy-content="${testDesc || tooltipKeys.delongTest || 'DeLong-Test (AUC)'}">DeLong (AUC)</td><td data-tippy-content="${tooltipKeys.delongStatistik || 'Z-Wert'}">Z = ${formatNumber(vergleichsDaten.delong.Z,3,na, true)}</td><td data-tippy-content="${testInterp}">${fPVal(vergleichsDaten.delong)} ${getStatisticalSignificanceSymbol(vergleichsDaten.delong.pValue)}</td></tr>`;
        }
        tableHTML += `</tbody></table>`;
        if (!vergleichsDaten.mcnemar && !vergleichsDaten.delong) {
            tableHTML = `<p class="text-muted small">Keine signifikanten Vergleichstests verfügbar oder berechenbar.</p>`;
        }
        return tableHTML;
    }
    
    function _createAssoziationContentHTML(assoziationsDaten, kollektivName, appliedT2Criteria) {
        if (!assoziationsDaten || Object.keys(assoziationsDaten).length === 0) return `<p class="text-muted">Assoziationsdaten nicht verfügbar.</p>`;
        const na = '--';
        const tooltipKeys = TOOLTIP_CONTENT.statistikTab.assoziationsanalyse || {};
        const tableId = `table-assoziation-${kollektivName.replace(/\s+/g, '_')}`;

        let tableHTML = `<table class="table table-sm table-striped table-hover small mb-0" id="${tableId}">
                            <thead><tr>
                                <th data-tippy-content="${tooltipKeys.kriterium || 'T2-Kriterium'}">Kriterium</th>
                                <th class="text-center" data-tippy-content="${tooltipKeys.praevalenz || 'Prävalenz des Merkmals bei N+ Patienten'}">Präv. (N+)</th>
                                <th class="text-center" data-tippy-content="${tooltipKeys.oddsRatio || 'Odds Ratio (95% CI)'}">OR (95% CI)</th>
                                <th class="text-center" data-tippy-content="${tooltipKeys.pValue || 'p-Wert'}">p-Wert</th>
                            </tr></thead><tbody>`;
        
        Object.entries(assoziationsDaten).forEach(([key, val]) => {
            if (val && appliedT2Criteria && appliedT2Criteria[key] && appliedT2Criteria[key].active) {
                const criteriaDisplayName = UI_TEXTS.t2CriteriaShort[key] || key;
                const praevalenzNplus = (val.Nplus_Merkmal && val.Nplus_Gesamt) ? formatPercent(val.Nplus_Merkmal / val.Nplus_Gesamt, 0) : na;
                const orFormatted = (val.or && val.or.value !== undefined && val.or.ci && val.or.ci.lower !== undefined) ? `${formatNumber(val.or.value,2,na,true)} (${formatNumber(val.or.ci.lower,2,na,true)}–${formatNumber(val.or.ci.upper,2,na,true)})` : na;
                const pValueFormatted = (val.pValueOR !== null && val.pValueOR !== undefined) ? (val.pValueOR < 0.001 ? '&lt;0.001' : formatNumber(val.pValueOR, 3, na, true)) : na;
                const significanceSymbol = getStatisticalSignificanceSymbol(val.pValueOR);
                const interpretation = ui_helpers.getAssociationInterpretationHTML('or', val, criteriaDisplayName, kollektivName);


                tableHTML += `<tr>
                                <td>${criteriaDisplayName}</td>
                                <td class="text-center">${praevalenzNplus}</td>
                                <td class="text-center" data-tippy-content="${interpretation}">${orFormatted}</td>
                                <td class="text-center">${pValueFormatted} ${significanceSymbol}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    function _createVergleichKollektiveContentHTML(vergleichsDaten, kollektiv1Name, kollektiv2Name) {
        if (!vergleichsDaten) return `<p class="text-muted">Daten für Kollektivvergleich nicht verfügbar.</p>`;
        const na = '--';
        const k1 = getKollektivDisplayName(kollektiv1Name);
        const k2 = getKollektivDisplayName(kollektiv2Name);
        const tooltipKeys = TOOLTIP_CONTENT.statistikTab.vergleichKollektive || {};
        const tableId = `table-vergleich-kollektive-${kollektiv1Name.replace(/\s+/g, '_')}-vs-${kollektiv2Name.replace(/\s+/g, '_')}`;

        let tableHTML = `<table class="table table-sm table-striped table-hover small mb-0" id="${tableId}">
                            <thead><tr>
                                <th data-tippy-content="${tooltipKeys.metrik || 'Diagnostische Metrik'}">Metrik</th>
                                <th data-tippy-content="${tooltipKeys.methode || 'Diagnostische Methode'}">Methode</th>
                                <th data-tippy-content="${tooltipKeys.kollektiv1Value?.replace('[KOLLEKTIV_1]', k1) || `Wert für ${k1}`}">${k1}</th>
                                <th data-tippy-content="${tooltipKeys.kollektiv2Value?.replace('[KOLLEKTIV_2]', k2) || `Wert für ${k2}`}">${k2}</th>
                                <th data-tippy-content="${tooltipKeys.pValue || 'p-Wert des Vergleichs'}">p-Wert (Diff.)</th>
                            </tr></thead><tbody>`;

        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'];
        const methods = ['AS', 'T2_angewandt'];

        methods.forEach(method => {
            const methodNameDisplay = method === 'AS' ? 'Avocado Sign' : `T2 (${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME})`;
            metrics.forEach(metricKey => {
                const metricNameDisplay = UI_TEXTS.statMetrics[metricKey]?.name || metricKey.toUpperCase();
                const data = vergleichsDaten[method]?.[metricKey];
                if (data) {
                    const val1 = formatCI(data.val1, data.ci1_lower, data.ci1_upper, (metricKey === 'auc' ? 3:1), !(metricKey === 'auc'), na);
                    const val2 = formatCI(data.val2, data.ci2_lower, data.ci2_upper, (metricKey === 'auc' ? 3:1), !(metricKey === 'auc'), na);
                    const pVal = (data.pValue !== null && data.pValue !== undefined) ? (data.pValue < 0.001 ? '&lt;0.001' : formatNumber(data.pValue, 3, na, true)) : na;
                    const sigSymbol = getStatisticalSignificanceSymbol(data.pValue);
                    const interpretation = ui_helpers.getTestInterpretationHTML('cohortComparison', data, k1, k2, methodNameDisplay, metricNameDisplay);
                    tableHTML += `<tr><td>${metricNameDisplay}</td><td>${methodNameDisplay}</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML(metricKey, {value: data.val1, ci: {lower: data.ci1_lower, upper: data.ci1_upper}}, methodNameDisplay, k1)}">${val1}</td><td data-tippy-content="${ui_helpers.getMetricInterpretationHTML(metricKey, {value: data.val2, ci: {lower: data.ci2_lower, upper: data.ci2_upper}}, methodNameDisplay, k2)}">${val2}</td><td data-tippy-content="${interpretation}">${pVal} ${sigSymbol}</td></tr>`;
                }
            });
        });
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    function _createCriteriaComparisonTableHTML(comparisonResults, globalKollektivName) {
        if (!comparisonResults || comparisonResults.length === 0) return `<p class="text-muted">Keine Daten für Kriterienvergleich verfügbar.</p>`;
        const na = '--';
        const tableId = "table-kriterien-vergleich";
        const tooltipKeys = TOOLTIP_CONTENT.statistikTab.kriterienVergleichsTabelle || {};

        let tableHTML = `<table class="table table-sm table-striped table-hover small mb-0" id="${tableId}">
                            <thead><tr>
                                <th data-tippy-content="${tooltipKeys.kriteriumName || 'Name des Kriteriensets oder Methode'}">Kriterium/Methode</th>
                                <th class="text-center" data-tippy-content="${tooltipKeys.sens || 'Sensitivität (95% CI)'}">Sens.</th>
                                <th class="text-center" data-tippy-content="${tooltipKeys.spez || 'Spezifität (95% CI)'}">Spez.</th>
                                <th class="text-center" data-tippy-content="${tooltipKeys.ppv || 'Positiver Prädiktiver Wert (95% CI)'}">PPV</th>
                                <th class="text-center" data-tippy-content="${tooltipKeys.npv || 'Negativer Prädiktiver Wert (95% CI)'}">NPV</th>
                                <th class="text-center" data-tippy-content="${tooltipKeys.acc || 'Accuracy (95% CI)'}">Acc.</th>
                                <th class="text-center" data-tippy-content="${tooltipKeys.auc || 'Area Under Curve (95% CI)'}">AUC</th>
                                <th class="text-center" data-tippy-content="${tooltipKeys.kollektiv || 'Evaluiertes Kollektiv (N)'}">Eval. Kollektiv (N)</th>
                            </tr></thead><tbody>`;
        
        comparisonResults.forEach(res => {
            const fVal = (val, d=1, isRate=true) => (val !== null && val !== undefined && !isNaN(val)) ? formatNumber(val, d, na, !isRate) + (isRate ? '%' : '') : na;
            const kollektivText = `${getKollektivDisplayName(res.specificKollektivName)} (N=${res.specificKollektivN || '?'})`;
            const tooltipText = studyT2CriteriaManager.getStudyCriteriaSetById(res.id)?.studyInfo?.keyCriteriaSummary || 
                                (res.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID ? 'Avocado Sign (AS)' : 
                                (res.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID ? studyT2CriteriaManager.formatCriteriaForDisplay(_appliedT2Criteria, _appliedT2Logic, false) : 'Details nicht verfügbar'));
            
            tableHTML += `<tr data-tippy-content="${tooltipText}">
                            <td>${res.name}</td>
                            <td class="text-center">${fVal(res.sens)}</td>
                            <td class="text-center">${fVal(res.spez)}</td>
                            <td class="text-center">${fVal(res.ppv)}</td>
                            <td class="text-center">${fVal(res.npv)}</td>
                            <td class="text-center">${fVal(res.acc)}</td>
                            <td class="text-center">${fVal(res.auc, 3, false)}</td>
                            <td class="text-center">${kollektivText}</td>
                          </tr>`;
        });
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }


    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
    }

    function setDataStale() {
        _isDataStale = true;
        _statsDataKollektivGlobal = null;
        _statsDataKollektiv1 = null;
        _statsDataKollektiv2 = null;
        _statsVergleichKollektive = null;
        _criteriaComparisonResults = null;
    }

    function isInitialized() {
        return _isInitialized;
    }

    function _getProcessedAndEvaluatedData(kollektivId) {
        if (!_globalRawData || _globalRawData.length === 0) return [];
        const filteredRaw = dataProcessor.filterDataByKollektiv(cloneDeep(_globalRawData), kollektivId);
        return t2CriteriaManager.evaluateDataset(filteredRaw, _appliedT2Criteria, _appliedT2Logic);
    }

    function _calculateStatsForKollektiv(kollektivId) {
        const evaluatedData = _getProcessedAndEvaluatedData(kollektivId);
        if (!evaluatedData || evaluatedData.length === 0) return null;

        return {
            deskriptiv: statisticsService.calculateDescriptiveStats(evaluatedData),
            gueteAS: statisticsService.calculateDiagnosticPerformance(evaluatedData, 'as', 'n'),
            gueteT2_angewandt: statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n'),
            vergleichASvsT2_angewandt: statisticsService.compareDiagnosticMethods(evaluatedData, 'as', 't2', 'n'),
            assoziation_angewandt: statisticsService.calculateAssociations(evaluatedData, _appliedT2Criteria)
        };
    }

    function _calculateCriteriaComparison(globalKollektivId) {
        const evaluatedGlobalData = _getProcessedAndEvaluatedData(globalKollektivId);
        if (!evaluatedGlobalData || evaluatedGlobalData.length === 0) return [];
        
        const results = [];
        const studySets = studyT2CriteriaManager.getAllStudyCriteriaSets(false);

        const asPerfGlobal = statisticsService.calculateDiagnosticPerformance(evaluatedGlobalData, 'as', 'n');
        if (asPerfGlobal) {
            results.push({
                id: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID, name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME,
                sens: asPerfGlobal.sens?.value, spez: asPerfGlobal.spez?.value, ppv: asPerfGlobal.ppv?.value, npv: asPerfGlobal.npv?.value, acc: asPerfGlobal.acc?.value, auc: asPerfGlobal.auc?.value,
                globalN: evaluatedGlobalData.length, specificKollektivName: globalKollektivId, specificKollektivN: evaluatedGlobalData.length
            });
        }

        const t2AppliedPerfGlobal = statisticsService.calculateDiagnosticPerformance(evaluatedGlobalData, 't2', 'n');
        if (t2AppliedPerfGlobal) {
             results.push({
                id: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                sens: t2AppliedPerfGlobal.sens?.value, spez: t2AppliedPerfGlobal.spez?.value, ppv: t2AppliedPerfGlobal.ppv?.value, npv: t2AppliedPerfGlobal.npv?.value, acc: t2AppliedPerfGlobal.acc?.value, auc: t2AppliedPerfGlobal.auc?.value,
                globalN: evaluatedGlobalData.length, specificKollektivName: globalKollektivId, specificKollektivN: evaluatedGlobalData.length
            });
        }
        
        studySets.forEach(set => {
            const targetKollektiv = set.applicableKollektiv || globalKollektivId;
            const baseDataForSet = dataProcessor.filterDataByKollektiv(cloneDeep(_globalRawData), targetKollektiv);

            if(baseDataForSet.length > 0) {
                const studyEvaluatedData = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(baseDataForSet, set);
                const perf = statisticsService.calculateDiagnosticPerformance(studyEvaluatedData, 't2', 'n');
                if(perf) {
                    results.push({
                        id: set.id, name: set.name,
                        sens: perf.sens?.value, spez: perf.spez?.value, ppv: perf.ppv?.value, npv: perf.npv?.value, acc: perf.acc?.value, auc: perf.auc?.value,
                        globalN: evaluatedGlobalData.length, specificKollektivName: targetKollektiv, specificKollektivN: baseDataForSet.length
                    });
                }
            }
        });
        results.sort((a,b) => (b.auc ?? -1) - (a.auc ?? -1));
        return results;
    }

    function _renderEinzelansicht(containerId) {
        const contentArea = document.getElementById(containerId);
        if (!contentArea) return;
        contentArea.innerHTML = '';

        if (_isDataStale || !_statsDataKollektivGlobal) {
             _statsDataKollektivGlobal = _calculateStatsForKollektiv(_currentKollektivGlobal);
        }
        if (_isDataStale || !_criteriaComparisonResults) {
            _criteriaComparisonResults = _calculateCriteriaComparison(_currentKollektivGlobal);
        }
        
        if (!_statsDataKollektivGlobal || typeof _statsDataKollektivGlobal !== 'object') {
            contentArea.innerHTML = `<p class="text-center text-muted p-3">Keine ausreichenden Daten für Kollektiv '${getKollektivDisplayName(_currentKollektivGlobal)}' vorhanden, um Statistiken zu berechnen.</p>`;
            return;
        }
        
        const deskriptivHTML = _createDeskriptiveStatistikContentHTML(_statsDataKollektivGlobal, '0', _currentKollektivGlobal);
        const gueteASHTML = _createGueteContentHTML(_statsDataKollektivGlobal.gueteAS, 'AS', _currentKollektivGlobal);
        const gueteT2HTML = _createGueteContentHTML(_statsDataKollektivGlobal.gueteT2_angewandt, `T2 (${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME})`, _currentKollektivGlobal);
        const vergleichHTML = _createVergleichContentHTML(_statsDataKollektivGlobal.vergleichASvsT2_angewandt, _currentKollektivGlobal, APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME);
        const assoziationHTML = _createAssoziationContentHTML(_statsDataKollektivGlobal.assoziation_angewandt, _currentKollektivGlobal, _appliedT2Criteria);
        const criteriaComparisonHTML = _createCriteriaComparisonTableHTML(_criteriaComparisonResults, _currentKollektivGlobal);

        const col1 = document.createElement('div'); col1.className = 'col-lg-6 d-flex flex-column';
        const col2 = document.createElement('div'); col2.className = 'col-lg-6 d-flex flex-column';
        
        col1.innerHTML += uiComponents.createStatistikCard('stat-deskriptiv', `Deskriptive Statistik (${getKollektivDisplayName(_currentKollektivGlobal)})`, deskriptivHTML, false, 'deskriptiveStatistik', [], 'table-deskriptiv-demographie-0');
        col1.innerHTML += uiComponents.createStatistikCard('stat-guete-as', `Diagnostische Güte AS (${getKollektivDisplayName(_currentKollektivGlobal)})`, gueteASHTML, false, 'diagnostischeGueteAS', [], `table-guete-matrix-AS-${_currentKollektivGlobal.replace(/\s+/g, '_')}`);
        col1.innerHTML += uiComponents.createStatistikCard('stat-assoziation', `Assoziationsanalyse (${getKollektivDisplayName(_currentKollektivGlobal)})`, assoziationHTML, false, 'assoziationEinzelkriterien', [], `table-assoziation-${_currentKollektivGlobal.replace(/\s+/g, '_')}`);
        
        col2.innerHTML += uiComponents.createStatistikCard('stat-guete-t2', `Diagnostische Güte T2 (${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME}, ${getKollektivDisplayName(_currentKollektivGlobal)})`, gueteT2HTML, false, 'diagnostischeGueteT2', [], `table-guete-matrix-T2-${_currentKollektivGlobal.replace(/\s+/g, '_')}`);
        col2.innerHTML += uiComponents.createStatistikCard('stat-vergleich-as-t2', `Vergleich AS vs. T2 (${getKollektivDisplayName(_currentKollektivGlobal)})`, vergleichHTML, false, 'statistischerVergleichASvsT2', [], `table-vergleich-as-vs-t2-${_currentKollektivGlobal.replace(/\s+/g, '_')}`);
        col2.innerHTML += uiComponents.createStatistikCard('stat-kriterien-vergleich', `Performance Vergleich (Basis: ${getKollektivDisplayName(_currentKollektivGlobal)})`, criteriaComparisonHTML, false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich');

        contentArea.appendChild(col1);
        contentArea.appendChild(col2);

        if (_statsDataKollektivGlobal.deskriptiv?.alterData && _statsDataKollektivGlobal.deskriptiv.alterData.length > 0) {
            chart_renderer.renderAgeDistributionChart('chart-stat-age-0', _statsDataKollektivGlobal.deskriptiv.alterData, _currentKollektivGlobal, {title: ''});
        }
        if (_statsDataKollektivGlobal.deskriptiv?.geschlecht) {
            const genderData = [
                { label: UI_TEXTS.legendLabels.male, value: _statsDataKollektivGlobal.deskriptiv.geschlecht.m, color: APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE },
                { label: UI_TEXTS.legendLabels.female, value: _statsDataKollektivGlobal.deskriptiv.geschlecht.f, color: APP_CONFIG.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN }
            ].filter(d => d.value > 0);
            if(genderData.length > 0) chart_renderer.renderPieChart('chart-stat-gender-0', genderData, { title: '', compact: true, donut: true, showLegend: false });
        }
    }

    function _renderVergleichsansicht(containerId) {
        const contentArea = document.getElementById(containerId);
        if (!contentArea) return;
        contentArea.innerHTML = '';

        if (_isDataStale || !_statsDataKollektiv1) _statsDataKollektiv1 = _calculateStatsForKollektiv(_statsKollektiv1);
        if (_isDataStale || !_statsDataKollektiv2) _statsDataKollektiv2 = _calculateStatsForKollektiv(_statsKollektiv2);
        
        if (_isDataStale || !_statsVergleichKollektive) {
            const data1 = _getProcessedAndEvaluatedData(_statsKollektiv1);
            const data2 = _getProcessedAndEvaluatedData(_statsKollektiv2);
            _statsVergleichKollektive = (data1 && data1.length > 0 && data2 && data2.length > 0) 
                                        ? statisticsService.compareCohorts(data1, data2, _appliedT2Criteria, _appliedT2Logic)
                                        : null;
        }
        if (_isDataStale || !_criteriaComparisonResults) {
            _criteriaComparisonResults = _calculateCriteriaComparison(_currentKollektivGlobal);
        }

        const col1 = document.createElement('div'); col1.className = 'col-lg-6 d-flex flex-column';
        const col2 = document.createElement('div'); col2.className = 'col-lg-6 d-flex flex-column';

        if (_statsDataKollektiv1 && typeof _statsDataKollektiv1 === 'object') {
            const deskHTML1 = _createDeskriptiveStatistikContentHTML(_statsDataKollektiv1, '1', _statsKollektiv1);
            const gueteASHTML1 = _createGueteContentHTML(_statsDataKollektiv1.gueteAS, 'AS', _statsKollektiv1);
            const gueteT2HTML1 = _createGueteContentHTML(_statsDataKollektiv1.gueteT2_angewandt, `T2 (${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME})`, _statsKollektiv1);
            col1.innerHTML += uiComponents.createStatistikCard('stat-deskriptiv-k1', `Deskriptiv (${getKollektivDisplayName(_statsKollektiv1)})`, deskHTML1, false, 'deskriptiveStatistik', [], 'table-deskriptiv-demographie-1');
            col1.innerHTML += uiComponents.createStatistikCard('stat-guete-as-k1', `Güte AS (${getKollektivDisplayName(_statsKollektiv1)})`, gueteASHTML1, false, 'diagnostischeGueteAS', [], `table-guete-matrix-AS-${_statsKollektiv1.replace(/\s+/g, '_')}`);
            col1.innerHTML += uiComponents.createStatistikCard('stat-guete-t2-k1', `Güte T2 (${getKollektivDisplayName(_statsKollektiv1)})`, gueteT2HTML1, false, 'diagnostischeGueteT2', [], `table-guete-matrix-T2-${_statsKollektiv1.replace(/\s+/g, '_')}`);
        } else {
            col1.innerHTML = `<p class="text-center text-muted p-3">Keine Daten für Kollektiv '${getKollektivDisplayName(_statsKollektiv1)}'.</p>`;
        }

        if (_statsDataKollektiv2 && typeof _statsDataKollektiv2 === 'object') {
            const deskHTML2 = _createDeskriptiveStatistikContentHTML(_statsDataKollektiv2, '2', _statsKollektiv2);
            const gueteASHTML2 = _createGueteContentHTML(_statsDataKollektiv2.gueteAS, 'AS', _statsKollektiv2);
            const gueteT2HTML2 = _createGueteContentHTML(_statsDataKollektiv2.gueteT2_angewandt, `T2 (${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME})`, _statsKollektiv2);
            col2.innerHTML += uiComponents.createStatistikCard('stat-deskriptiv-k2', `Deskriptiv (${getKollektivDisplayName(_statsKollektiv2)})`, deskHTML2, false, 'deskriptiveStatistik', [], 'table-deskriptiv-demographie-2');
            col2.innerHTML += uiComponents.createStatistikCard('stat-guete-as-k2', `Güte AS (${getKollektivDisplayName(_statsKollektiv2)})`, gueteASHTML2, false, 'diagnostischeGueteAS', [], `table-guete-matrix-AS-${_statsKollektiv2.replace(/\s+/g, '_')}`);
            col2.innerHTML += uiComponents.createStatistikCard('stat-guete-t2-k2', `Güte T2 (${getKollektivDisplayName(_statsKollektiv2)})`, gueteT2HTML2, false, 'diagnostischeGueteT2', [], `table-guete-matrix-T2-${_statsKollektiv2.replace(/\s+/g, '_')}`);
        } else {
            col2.innerHTML = `<p class="text-center text-muted p-3">Keine Daten für Kollektiv '${getKollektivDisplayName(_statsKollektiv2)}'.</p>`;
        }
        
        const vergleichHTML = _statsVergleichKollektive ? _createVergleichKollektiveContentHTML(_statsVergleichKollektive, _statsKollektiv1, _statsKollektiv2) : '<p class="text-muted p-3">Vergleichsdaten nicht verfügbar (ggf. fehlen Daten für eines der Kollektive).</p>';
        const vergleichCard = uiComponents.createStatistikCard('stat-vergleich-kollektive', `Vergleich Kollektiv ${getKollektivDisplayName(_statsKollektiv1)} vs. ${getKollektivDisplayName(_statsKollektiv2)}`, vergleichHTML, false, 'vergleichKollektive', [], `table-vergleich-kollektive-${_statsKollektiv1.replace(/\s+/g, '_')}-vs-${_statsKollektiv2.replace(/\s+/g, '_')}`);
        
        const criteriaComparisonHTML = _createCriteriaComparisonTableHTML(_criteriaComparisonResults, _currentKollektivGlobal);
        const criteriaCard = uiComponents.createStatistikCard('stat-kriterien-vergleich-vergl', `Performance Vergleich (Basis: ${getKollektivDisplayName(_currentKollektivGlobal)})`, criteriaComparisonHTML, false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich');

        contentArea.appendChild(col1);
        contentArea.appendChild(col2);
        const row2 = document.createElement('div'); row2.className = 'row g-3 mt-0'; 
        row2.innerHTML = vergleichCard;
        contentArea.appendChild(row2);

        const row3 = document.createElement('div'); row3.className = 'row g-3 mt-0';
        row3.innerHTML = criteriaCard;
        contentArea.appendChild(row3);

        if (_statsDataKollektiv1?.deskriptiv?.alterData && _statsDataKollektiv1.deskriptiv.alterData.length > 0) chart_renderer.renderAgeDistributionChart('chart-stat-age-1', _statsDataKollektiv1.deskriptiv.alterData, _statsKollektiv1, {title:''});
        if (_statsDataKollektiv1?.deskriptiv?.geschlecht) {
            const genderData1 = [ { label: UI_TEXTS.legendLabels.male, value: _statsDataKollektiv1.deskriptiv.geschlecht.m, color: APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE }, { label: UI_TEXTS.legendLabels.female, value: _statsDataKollektiv1.deskriptiv.geschlecht.f, color: APP_CONFIG.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN }].filter(d=>d.value > 0);
            if(genderData1.length > 0) chart_renderer.renderPieChart('chart-stat-gender-1', genderData1, {title: '', compact:true, donut:true, showLegend: false});
        }
        if (_statsDataKollektiv2?.deskriptiv?.alterData && _statsDataKollektiv2.deskriptiv.alterData.length > 0) chart_renderer.renderAgeDistributionChart('chart-stat-age-2', _statsDataKollektiv2.deskriptiv.alterData, _statsKollektiv2, {title:''});
        if (_statsDataKollektiv2?.deskriptiv?.geschlecht) {
            const genderData2 = [ { label: UI_TEXTS.legendLabels.male, value: _statsDataKollektiv2.deskriptiv.geschlecht.m, color: APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE }, { label: UI_TEXTS.legendLabels.female, value: _statsDataKollektiv2.deskriptiv.geschlecht.f, color: APP_CONFIG.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN }].filter(d=>d.value > 0);
            if(genderData2.length > 0) chart_renderer.renderPieChart('chart-stat-gender-2', genderData2, {title: '', compact:true, donut:true, showLegend: false});
        }
    }

    function initializeTab(data, currentKollektiv, appliedT2Criteria, appliedT2Logic, statsLayout, statsKollektiv1, statsKollektiv2) {
        _globalRawData = cloneDeep(data);
        _currentKollektivGlobal = currentKollektiv;
        _appliedT2Criteria = cloneDeep(appliedT2Criteria);
        _appliedT2Logic = appliedT2Logic;
        _statsLayout = statsLayout;
        _statsKollektiv1 = statsKollektiv1;
        _statsKollektiv2 = statsKollektiv2;
        
        setDataStale();

        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.updateStatistikSelectorsUI === 'function') {
            ui_helpers.updateStatistikSelectorsUI(_statsLayout, _statsKollektiv1, _statsKollektiv2);
        }

        if (_statsLayout === 'einzel') {
            _renderEinzelansicht('statistik-content-area');
        } else {
            _renderVergleichsansicht('statistik-content-area');
        }
        
        _isInitialized = true;
        _isDataStale = false;
        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.initializeTooltips === 'function') {
             ui_helpers.initializeTooltips(document.getElementById('statistik-content-area'));
        }
    }

    return Object.freeze({
        initialize,
        initializeTab,
        isInitialized,
        setDataStale
    });
})();
