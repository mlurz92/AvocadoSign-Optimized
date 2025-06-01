const praesentationTabLogic = (() => {
    let _mainAppInterface = null;
    let _globalRawData = [];
    let _currentKollektivGlobal = '';
    let _appliedT2CriteriaGlobal = null;
    let _appliedT2LogicGlobal = '';
    let _praesentationView = 'as-pur';
    let _praesentationStudyId = null;
    let _isInitialized = false;
    let _isDataStale = true;

    let _praesentationData = {};

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
    }

    function isInitialized() {
        return _isInitialized;
    }

    function setDataStale() {
        _isDataStale = true;
        _praesentationData = {};
    }

    function _prepareDatenAsPur() {
        if (!_globalRawData || _globalRawData.length === 0) return null;
        const processedDataFull = dataProcessor.processRawData(cloneDeep(_globalRawData));

        const statsGesamt = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'Gesamt'), 'as', 'n');
        const statsDirektOP = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'direkt OP'), 'as', 'n');
        const statsNRCT = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'nRCT'), 'as', 'n');
        const currentKollektivDaten = dataProcessor.filterDataByKollektiv(processedDataFull, _currentKollektivGlobal);
        const statsCurrentKollektiv = statisticsService.calculateDiagnosticPerformance(currentKollektivDaten, 'as', 'n');

        return {
            statsGesamt,
            statsDirektOP,
            statsNRCT,
            statsCurrentKollektiv,
            patientCountCurrentKollektiv: currentKollektivDaten.length
        };
    }

    function _prepareDatenAsVsT2() {
        if (!_globalRawData || _globalRawData.length === 0) return null;
        const processedDataFull = dataProcessor.processRawData(cloneDeep(_globalRawData));
        let comparisonCohortData = dataProcessor.filterDataByKollektiv(processedDataFull, _currentKollektivGlobal);
        let comparisonKollektivName = _currentKollektivGlobal;
        let studySetToUse = null;
        let isAppliedCriteria = false;

        if (_praesentationStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
            isAppliedCriteria = true;
            studySetToUse = {
                id: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID,
                name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                shortName: UI_TEXTS.kollektivDisplayNames.applied_criteria || 'Angewandt',
                applicableKollektiv: _currentKollektivGlobal,
                criteria: cloneDeep(_appliedT2CriteriaGlobal),
                logic: _appliedT2LogicGlobal,
                studyInfo: {
                    reference: "Benutzerdefiniert (aktuell im Auswertungstab eingestellt)",
                    patientCohort: `Vergleichskollektiv: ${getKollektivDisplayName(_currentKollektivGlobal)} (N=${comparisonCohortData.length})`,
                    investigationType: "N/A",
                    focus: "Benutzereinstellung",
                    keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(cloneDeep(_appliedT2CriteriaGlobal), _appliedT2LogicGlobal) || "Keine"
                }
            };
        } else if (_praesentationStudyId) {
            studySetToUse = studyT2CriteriaManager.getStudyCriteriaSetById(_praesentationStudyId);
            if (studySetToUse && studySetToUse.applicableKollektiv && studySetToUse.applicableKollektiv !== _currentKollektivGlobal) {
                comparisonKollektivName = studySetToUse.applicableKollektiv;
                comparisonCohortData = dataProcessor.filterDataByKollektiv(processedDataFull, comparisonKollektivName);
            }
        }

        if (!studySetToUse) {
             return {
                statsAS: null,
                statsT2: null,
                vergleich: null,
                comparisonCriteriaSet: null,
                kollektivForComparison: comparisonKollektivName,
                patientCountForComparison: comparisonCohortData.length,
                t2CriteriaLabelShort: 'N/A',
                t2CriteriaLabelFull: 'Keine T2-Basis ausgewählt oder gefunden.'
            };
        }
        
        const statsAS = statisticsService.calculateDiagnosticPerformance(comparisonCohortData, 'as', 'n');
        let evaluatedDataT2;

        if (isAppliedCriteria) {
            evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(comparisonCohortData), studySetToUse.criteria, studySetToUse.logic);
        } else {
            evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(comparisonCohortData), studySetToUse);
        }
        
        const statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n');

        let asDataForDirectComparison = cloneDeep(comparisonCohortData);
        let t2DataForDirectComparison = cloneDeep(evaluatedDataT2);
        
        const combinedDataForDeLong = [];
        asDataForDirectComparison.forEach(pAS => {
            const pT2 = t2DataForDirectComparison.find(pt => pt.id_patient === pAS.id_patient);
            if (pT2) {
                combinedDataForDeLong.push({
                    id_patient: pAS.id_patient,
                    n: pAS.n,
                    as: pAS.as,
                    t2: pT2.t2
                });
            }
        });

        const vergleich = statisticsService.compareDiagnosticMethods(combinedDataForDeLong, 'as', 't2', 'n');
        
        const t2CriteriaLabelShort = studySetToUse.shortName || studySetToUse.name.substring(0,15);
        const t2CriteriaLabelFull = `${isAppliedCriteria ? 'Aktuell angewandt' : (studySetToUse.name || 'Studie')}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySetToUse.criteria, studySetToUse.logic, false)}`;

        return {
            statsAS,
            statsT2,
            vergleich,
            comparisonCriteriaSet: studySetToUse,
            kollektivForComparison: comparisonKollektivName,
            patientCountForComparison: comparisonCohortData.length,
            t2CriteriaLabelShort,
            t2CriteriaLabelFull
        };
    }

    function _renderPraesentationContent() {
        const contentArea = document.getElementById('praesentation-content-area');
        if (!contentArea) {
            console.error("PraesentationTabLogic: Content-Bereich 'praesentation-content-area' nicht gefunden.");
            return;
        }
        contentArea.innerHTML = '';

        if (_isDataStale) {
            if (_praesentationView === 'as-pur') {
                _praesentationData = _prepareDatenAsPur();
            } else if (_praesentationView === 'as-vs-t2') {
                _praesentationData = _prepareDatenAsVsT2();
            }
            _isDataStale = false;
        }

        if (!_praesentationData) {
            contentArea.innerHTML = '<p class="text-center text-muted p-3">Keine Daten für die Präsentationsansicht verfügbar.</p>';
            return;
        }

        let html = '<div class="row g-3">';
        const na = '--';

        if (_praesentationView === 'as-pur') {
            const { statsGesamt, statsDirektOP, statsNRCT, statsCurrentKollektiv, patientCountCurrentKollektiv } = _praesentationData;
            const tableData = [
                { label: getKollektivDisplayName('Gesamt'), stats: statsGesamt, n: statsGesamt?.matrix ? (statsGesamt.matrix.rp + statsGesamt.matrix.fp + statsGesamt.matrix.fn + statsGesamt.matrix.rn) : 0 },
                { label: getKollektivDisplayName('direkt OP'), stats: statsDirektOP, n: statsDirektOP?.matrix ? (statsDirektOP.matrix.rp + statsDirektOP.matrix.fp + statsDirektOP.matrix.fn + statsDirektOP.matrix.rn) : 0 },
                { label: getKollektivDisplayName('nRCT'), stats: statsNRCT, n: statsNRCT?.matrix ? (statsNRCT.matrix.rp + statsNRCT.matrix.fp + statsNRCT.matrix.fn + statsNRCT.matrix.rn) : 0 }
            ];

            let tableHTML = `
                <h5 class="mt-2">Performance Avocado Sign (AS) vs. N-Status</h5>
                <table class="table table-sm table-bordered table-hover text-center small publication-table" id="praes-as-pur-perf-table">
                    <thead class="small">
                        <tr>
                            <th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asPurPerfTable.kollektiv}">Kollektiv (N)</th>
                            <th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asPurPerfTable.sens}">Sens. (95% CI)</th>
                            <th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asPurPerfTable.spez}">Spez. (95% CI)</th>
                            <th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asPurPerfTable.ppv}">PPV (95% CI)</th>
                            <th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asPurPerfTable.npv}">NPV (95% CI)</th>
                            <th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asPurPerfTable.acc}">Acc. (95% CI)</th>
                            <th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asPurPerfTable.auc}">AUC (95% CI)</th>
                        </tr>
                    </thead>
                    <tbody>`;
            tableData.forEach(item => {
                const s = item.stats;
                const fCI_p = (m, k) => { const dig = (k === 'f1' || k === 'auc') ? 3 : 1; const isP = !(k === 'f1' || k === 'auc'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, dig, isP, na); };
                tableHTML += `<tr>
                                <td>${item.label} (N=${item.n})</td>
                                <td>${fCI_p(s?.sens, 'sens')}</td><td>${fCI_p(s?.spez, 'spez')}</td>
                                <td>${fCI_p(s?.ppv, 'ppv')}</td><td>${fCI_p(s?.npv, 'npv')}</td>
                                <td>${fCI_p(s?.acc, 'acc')}</td><td>${fCI_p(s?.auc, 'auc')}</td>
                              </tr>`;
            });
            tableHTML += `</tbody></table>`;
            html += uiComponents.createStatistikCard('praes-as-pur-table-card', 'AS Performance Metriken (vs. N)', tableHTML, true, 'praesentationAsPurPerformance', [{id: 'dl-praes-as-pur-csv', format: 'csv', icon: 'fa-file-csv'}, {id: 'dl-praes-as-pur-md', format: 'md', icon: 'fa-markdown'}, {tableId: 'praes-as-pur-perf-table', format: 'png'}]);

            if (statsCurrentKollektiv) {
                const chartCard = uiComponents.createStatistikCard('praes-as-pur-chart-card', `AS Performance für ${getKollektivDisplayName(_currentKollektivGlobal)} (N=${patientCountCurrentKollektiv})`, `<div id="praes-as-performance-chart" class="statistik-chart-container border rounded" style="min-height: 350px;"></div>`, false, 'praesentationAsPurChart', [{chartId: 'praes-as-performance-chart', format: 'png'}, {chartId: 'praes-as-performance-chart', format: 'svg'}]);
                html += chartCard;
            }

        } else if (_praesentationView === 'as-vs-t2') {
            const { statsAS, statsT2, vergleich, comparisonCriteriaSet, kollektivForComparison, patientCountForComparison, t2CriteriaLabelShort, t2CriteriaLabelFull } = _praesentationData;
            
            const t2SetInfo = comparisonCriteriaSet?.studyInfo || {};
            let infoCardHTML = '<h6>Angewandte T2-Kriterien</h6>';
            if (comparisonCriteriaSet) {
                 infoCardHTML = `
                    <h6>${comparisonCriteriaSet.name || 'T2 Kriterien Set'}</h6>
                    <ul class="list-unstyled small">
                        <li data-tippy-content="${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.reference}"><strong>Referenz:</strong> ${t2SetInfo.reference || (comparisonCriteriaSet.reference || 'N/A')}</li>
                        <li data-tippy-content="${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.patientCohort}"><strong>Kollektiv (Basis):</strong> ${getKollektivDisplayName(kollektivForComparison)} (N=${patientCountForComparison || 'N/A'})</li>
                        <li data-tippy-content="${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.investigationType}"><strong>Untersuchungstyp:</strong> ${t2SetInfo.investigationType || 'N/A'}</li>
                        <li data-tippy-content="${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.focus}"><strong>Fokus:</strong> ${t2SetInfo.focus || 'N/A'}</li>
                        <li data-tippy-content="${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.keyCriteriaSummary}"><strong>Kriterien:</strong> ${t2SetInfo.keyCriteriaSummary || studyT2CriteriaManager.formatCriteriaForDisplay(comparisonCriteriaSet.criteria, comparisonCriteriaSet.logic, false) || 'Nicht spezifiziert'}</li>
                    </ul>`;
            } else {
                infoCardHTML = '<p class="text-muted">Kein T2-Kriterienset für Vergleich ausgewählt oder gültig.</p>';
            }
            html += uiComponents.createStatistikCard('praes-t2-info-card', 'Details zur T2-Vergleichsbasis', infoCardHTML, true, 'praesentationT2Info');

            if (statsAS && statsT2) {
                let perfTableHTML = `<table class="table table-sm table-bordered table-hover text-center small publication-table" id="praes-as-vs-t2-comp-table">
                                    <thead class="small">
                                        <tr>
                                            <th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asVsT2PerfTable.metric}">Metrik</th>
                                            <th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asVsT2PerfTable.asValue.replace('[KOLLEKTIV_NAME_VERGLEICH]', getKollektivDisplayName(kollektivForComparison))}">AS (95% CI)</th>
                                            <th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asVsT2PerfTable.t2Value.replace('[KOLLEKTIV_NAME_VERGLEICH]', getKollektivDisplayName(kollektivForComparison)).replace('[T2_SHORT_NAME]', t2CriteriaLabelShort)}">${t2CriteriaLabelShort} (95% CI)</th>
                                        </tr>
                                    </thead><tbody>`;
                const metricsToCompare = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
                metricsToCompare.forEach(key => {
                    const metricNameDisplay = UI_TEXTS.statMetrics[key]?.name || key.toUpperCase();
                    const isP = !(key === 'f1' || key === 'auc'); const d = (key === 'f1' || key === 'auc') ? 3 : 1;
                    perfTableHTML += `<tr><td>${metricNameDisplay}</td>
                                      <td>${formatCI(statsAS[key]?.value, statsAS[key]?.ci?.lower, statsAS[key]?.ci?.upper, d, isP, na)}</td>
                                      <td>${formatCI(statsT2[key]?.value, statsT2[key]?.ci?.lower, statsT2[key]?.ci?.upper, d, isP, na)}</td></tr>`;
                });
                perfTableHTML += `</tbody></table>`;
                html += uiComponents.createStatistikCard('praes-comp-table-card', `Vergleich Performance: AS vs. ${t2CriteriaLabelShort} (Kollektiv: ${getKollektivDisplayName(kollektivForComparison)}, N=${patientCountForComparison})`, perfTableHTML, true, 'praesentationComparisonTable', [{id: 'download-performance-as-vs-t2-csv', format: 'csv', icon: 'fa-file-csv'}, {id: 'download-comp-table-as-vs-t2-md', format: 'md', icon: 'fa-markdown'}, {tableId: 'praes-as-vs-t2-comp-table', format: 'png'}]);

                if (vergleich) {
                    let testTableHTML = `<table class="table table-sm table-bordered table-hover text-center small publication-table" id="praes-as-vs-t2-test-table">
                                        <thead class="small">
                                            <tr>
                                                <th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asVsT2TestTable.test.replace('[T2_SHORT_NAME]',t2CriteriaLabelShort)}">Test</th>
                                                <th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asVsT2TestTable.statistic}">Statistik</th>
                                                <th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asVsT2TestTable.pValue.replace('[T2_SHORT_NAME]',t2CriteriaLabelShort).replace('[ALPHA_LEVEL]', String(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL)).replace('[KOLLEKTIV_NAME_VERGLEICH]',getKollektivDisplayName(kollektivForComparison))}">p-Wert</th>
                                                <th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asVsT2TestTable.method}">Methode</th>
                                            </tr>
                                        </thead><tbody>`;
                    const fPValHTML = (p) => (p !== null && !isNaN(p)) ? (p < APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_THRESHOLD_LESS_THAN ? `&lt;${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_THRESHOLD_LESS_THAN, APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_TEXT, '--', true)}` : formatNumber(p, APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_TEXT, '--', true)) : '--';
                    testTableHTML += `<tr><td>McNemar (Accuracy)</td><td>${formatNumber(vergleich.mcnemar?.statistic, 3, na, true)} (df=${vergleich.mcnemar?.df || na})</td><td>${fPValHTML(vergleich.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(vergleich.mcnemar?.pValue)}</td><td>${vergleich.mcnemar?.method || na}</td></tr>`;
                    testTableHTML += `<tr><td>DeLong (AUC)</td><td>Z=${formatNumber(vergleich.delong?.Z, 3, na, true)}</td><td>${fPValHTML(vergleich.delong?.pValue)} ${getStatisticalSignificanceSymbol(vergleich.delong?.pValue)}</td><td>${vergleich.delong?.method || na}</td></tr>`;
                    testTableHTML += `</tbody></table>`;
                    html += uiComponents.createStatistikCard('praes-test-table-card', `Statistische Tests: AS vs. ${t2CriteriaLabelShort} (Kollektiv: ${getKollektivDisplayName(kollektivForComparison)})`, testTableHTML, true, 'praesentationComparisonTests', [{id: 'download-tests-as-vs-t2-md', format: 'md', icon: 'fa-markdown'}, {tableId: 'praes-as-vs-t2-test-table', format: 'png'}]);
                }

                const chartCard = uiComponents.createStatistikCard('praes-comp-chart-card', `Vergleich: AS vs. ${t2CriteriaLabelShort} (Kollektiv: ${getKollektivDisplayName(kollektivForComparison)}, N=${patientCountForComparison})`, `<div id="praes-comp-chart-container" class="statistik-chart-container border rounded" style="min-height: 400px;"></div>`, false, 'praesentationComparisonChart', [{id: 'dl-praes-comp-chart-png', chartId: 'praes-comp-chart-container', format: 'png', chartName: `AS_vs_${t2CriteriaLabelShort.replace(/\s+/g,'_')}_${kollektivForComparison.replace(/\s+/g,'_')}`}, {id: 'dl-praes-comp-chart-svg', chartId: 'praes-comp-chart-container', format: 'svg', chartName: `AS_vs_${t2CriteriaLabelShort.replace(/\s+/g,'_')}_${kollektivForComparison.replace(/\s+/g,'_')}`}]);
                html += chartCard;
            } else {
                 html += `<div class="col-12"><p class="text-muted text-center p-3">Statistikdaten für AS vs. ${t2CriteriaLabelShort} nicht verfügbar oder unvollständig.</p></div>`;
            }
        }
        html += '</div>';
        contentArea.innerHTML = html;

        if (_praesentationView === 'as-pur' && _praesentationData.statsCurrentKollektiv && typeof chart_renderer !== 'undefined') {
            chart_renderer.renderASPerformanceChart('praes-as-performance-chart', _praesentationData.statsCurrentKollektiv, _currentKollektivGlobal, {includeCI: true, yDomain: [0,1]});
        } else if (_praesentationView === 'as-vs-t2' && _praesentationData.statsAS && _praesentationData.statsT2 && typeof chart_renderer !== 'undefined') {
            const chartDataForComp = [
                { group: UI_TEXTS.statMetrics.sens.name || 'Sens.', AS: _praesentationData.statsAS.sens, T2: _praesentationData.statsT2.sens },
                { group: UI_TEXTS.statMetrics.spez.name || 'Spez.', AS: _praesentationData.statsAS.spez, T2: _praesentationData.statsT2.spez },
                { group: UI_TEXTS.statMetrics.ppv.name || 'PPV', AS: _praesentationData.statsAS.ppv, T2: _praesentationData.statsT2.ppv },
                { group: UI_TEXTS.statMetrics.npv.name || 'NPV', AS: _praesentationData.statsAS.npv, T2: _praesentationData.statsT2.npv },
                { group: UI_TEXTS.statMetrics.acc.name || 'Acc.', AS: _praesentationData.statsAS.acc, T2: _praesentationData.statsT2.acc },
                { group: UI_TEXTS.statMetrics.auc.name || 'AUC', AS: _praesentationData.statsAS.auc, T2: _praesentationData.statsT2.auc }
            ];
            const seriesForComp = [
                { name: UI_TEXTS.legendLabels.avocadoSign || 'AS', key: 'AS', color: APP_CONFIG.CHART_SETTINGS.AS_COLOR, showCI: true },
                { name: _praesentationData.t2CriteriaLabelShort || UI_TEXTS.legendLabels.currentT2, key: 'T2', color: APP_CONFIG.CHART_SETTINGS.T2_COLOR, showCI: true }
            ];
            chart_renderer.renderComparisonBarChart('praes-comp-chart-container', chartDataForComp, seriesForComp, { title: '', yAxisLabel: 'Wert', barType: 'grouped', groupKey: 'group', showLegend: true, legendPosition: 'bottom', includeCI: true, yDomain: [0,1] });
        }
    }


    function initializeTab(rawData, currentKollektiv, appliedT2Criteria, appliedT2Logic, praesentationView, praesentationStudyId) {
        _globalRawData = cloneDeep(rawData);
        _currentKollektivGlobal = currentKollektiv;
        _appliedT2CriteriaGlobal = cloneDeep(appliedT2Criteria);
        _appliedT2LogicGlobal = appliedT2Logic;
        _praesentationView = praesentationView;
        _praesentationStudyId = praesentationStudyId;

        setDataStale();

        const controlsContainer = document.getElementById('praesentation-controls-container');
        if (controlsContainer && typeof uiComponents !== 'undefined' && typeof uiComponents.createPresentationControls === 'function') {
            const studySetsForSelect = studyT2CriteriaManager.getAllStudyCriteriaSets(true);
            controlsContainer.innerHTML = uiComponents.createPresentationControls(_praesentationView, studySetsForSelect, _praesentationStudyId);
        } else if(controlsContainer) {
            controlsContainer.innerHTML = '<p class="text-danger">Fehler: Präsentations-Steuerungskomponente nicht verfügbar.</p>';
        }

        _renderPraesentationContent();
        _isInitialized = true;

        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.initializeTooltips === 'function') {
             ui_helpers.initializeTooltips(document.getElementById('praesentation-tab-pane'));
        }
    }

    return Object.freeze({
        initialize,
        isInitialized,
        setDataStale,
        initializeTab
    });
})();
