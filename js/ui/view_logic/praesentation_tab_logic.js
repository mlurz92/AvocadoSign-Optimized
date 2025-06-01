const praesentationTabLogic = (() => {
    let _mainAppInterface = null;
    let _globalRawData = [];
    let _currentKollektivGlobal = '';
    let _appliedT2CriteriaGlobal = null;
    let _appliedT2LogicGlobal = '';
    let _currentView = 'as-pur';
    let _currentStudyId = null;
    let _isInitialized = false;
    let _isDataStale = true;

    let _presentationDataCache = null;

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
    }

    function setDataStale() {
        _isDataStale = true;
        _presentationDataCache = null;
    }

    function isInitialized() {
        return _isInitialized;
    }

    function _preparePresentationData() {
        if (!_isDataStale && _presentationDataCache) {
            return _presentationDataCache;
        }

        const presentationData = {};
        const processedDataFull = dataProcessor.processRawData(cloneDeep(_globalRawData));

        presentationData.kollektiv = _currentKollektivGlobal;
        const globalKollektivDaten = dataProcessor.filterDataByKollektiv(processedDataFull, _currentKollektivGlobal);
        presentationData.patientCount = globalKollektivDaten?.length ?? 0;

        if (_currentView === 'as-pur') {
            presentationData.statsGesamt = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'Gesamt'), 'as', 'n');
            presentationData.statsDirektOP = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'direkt OP'), 'as', 'n');
            presentationData.statsNRCT = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'nRCT'), 'as', 'n');
            presentationData.statsCurrentKollektiv = statisticsService.calculateDiagnosticPerformance(globalKollektivDaten, 'as', 'n');
        } else if (_currentView === 'as-vs-t2') {
            let comparisonCohortData = globalKollektivDaten;
            let comparisonKollektivName = _currentKollektivGlobal;

            const studySetForKollektiv = _currentStudyId ? studyT2CriteriaManager.getStudyCriteriaSetById(_currentStudyId) : null;

            if (studySetForKollektiv?.applicableKollektiv && studySetForKollektiv.applicableKollektiv !== _currentKollektivGlobal && studySetForKollektiv.id !== APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                comparisonKollektivName = studySetForKollektiv.applicableKollektiv;
                comparisonCohortData = dataProcessor.filterDataByKollektiv(processedDataFull, comparisonKollektivName);
            }
            presentationData.kollektivForComparison = comparisonKollektivName;
            presentationData.patientCountForComparison = comparisonCohortData?.length ?? 0;

            if (comparisonCohortData && comparisonCohortData.length > 0) {
                presentationData.statsAS = statisticsService.calculateDiagnosticPerformance(comparisonCohortData, 'as', 'n');
                let studySetToApply = null;
                let evaluatedDataT2 = null;
                const isAppliedCurrently = _currentStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;

                if (isAppliedCurrently) {
                    studySetToApply = {
                        criteria: _appliedT2CriteriaGlobal,
                        logic: _appliedT2LogicGlobal,
                        id: _currentStudyId,
                        name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                        displayShortName: "Angewandt",
                        studyInfo: {
                            reference: "Benutzerdefiniert (aktuell im Auswertungstab eingestellt)",
                            patientCohort: `Vergleichskollektiv: ${getKollektivDisplayName(comparisonKollektivName)} (N=${presentationData.patientCountForComparison})`,
                            investigationType: "N/A", focus: "Benutzereinstellung",
                            keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(_appliedT2CriteriaGlobal, _appliedT2LogicGlobal) || "Keine"
                        }
                    };
                    evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(comparisonCohortData), studySetToApply.criteria, studySetToApply.logic);
                } else if (_currentStudyId && studySetForKollektiv) {
                    studySetToApply = studySetForKollektiv;
                    evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(comparisonCohortData), studySetToApply);
                }

                if (studySetToApply && evaluatedDataT2 && evaluatedDataT2.length > 0) {
                    presentationData.statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n');
                    let asDataForDirectComparison = cloneDeep(comparisonCohortData);
                    evaluatedDataT2.forEach((p, i) => { if (asDataForDirectComparison[i]) p.as = asDataForDirectComparison[i].as; });
                    presentationData.vergleich = statisticsService.compareDiagnosticMethods(evaluatedDataT2, 'as', 't2', 'n');
                    presentationData.comparisonCriteriaSet = studySetToApply;
                    presentationData.t2CriteriaLabelShort = studySetToApply.displayShortName || studySetToApply.shortName || 'T2';
                    presentationData.t2CriteriaLabelFull = `${isAppliedCurrently ? 'Aktuell angewandt' : (studySetToApply.name || 'Studie')}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySetToApply.criteria, studySetToApply.logic || studySetToApply.criteria.logic)}`;
                } else if (studySetToApply) {
                    presentationData.statsT2 = null;
                    presentationData.vergleich = null;
                    presentationData.comparisonCriteriaSet = studySetToApply;
                    presentationData.t2CriteriaLabelShort = studySetToApply.displayShortName || studySetToApply.shortName || 'T2';
                    presentationData.t2CriteriaLabelFull = `${studySetToApply.name}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySetToApply.criteria, studySetToApply.logic || studySetToApply.criteria.logic)}`;
                }
            } else {
                presentationData.statsAS = null;
                presentationData.statsT2 = null;
                presentationData.vergleich = null;
                if (_currentStudyId && studySetForKollektiv) {
                    presentationData.comparisonCriteriaSet = studySetForKollektiv;
                } else if (_currentStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                     presentationData.comparisonCriteriaSet = { name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME, displayShortName: "Angewandt", criteria: _appliedT2CriteriaGlobal, logic: _appliedT2LogicGlobal, studyInfo:{} };
                }
            }
        }
        _presentationDataCache = presentationData;
        _isDataStale = false;
        return presentationData;
    }

    function _createPresentationView_ASPUR_HTML(presentationData) {
        const { statsGesamt, statsDirektOP, statsNRCT, kollektiv, statsCurrentKollektiv, patientCount } = presentationData || {};
        const kollektives = ['Gesamt', 'direkt OP', 'nRCT'];
        const statsMap = { 'Gesamt': statsGesamt, 'direkt OP': statsDirektOP, 'nRCT': statsNRCT };
        const currentKollektivName = getKollektivDisplayName(kollektiv);
        const displayPatientCount = patientCount > 0 ? patientCount : (statsCurrentKollektiv?.matrix?.rp + statsCurrentKollektiv?.matrix?.fp + statsCurrentKollektiv?.matrix?.fn + statsCurrentKollektiv?.matrix?.rn) || 0;
        const hasDataForCurrent = !!(statsCurrentKollektiv && statsCurrentKollektiv.matrix && statsCurrentKollektiv.matrix.rp !== undefined && displayPatientCount > 0);

        const createPerfTableRow = (stats, kollektivKey) => {
            const kollektivDisplayName = getKollektivDisplayName(kollektivKey);
            const na = '--';
            const fCI_p = (m, k) => { const d = (k === 'auc'||k==='f1') ? 3 : 1; const p = !(k === 'auc'||k==='f1'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, na); };
            const getInterpretationTT = (mk, st) => { return ui_helpers.getMetricInterpretationHTML(mk, st, 'AS', kollektivDisplayName); };
            const tt = TOOLTIP_CONTENT.praesentation.asPurPerfTable || {};

            if (!stats || typeof stats.matrix !== 'object') {
                let countN = '?';
                if (kollektivKey === 'Gesamt' && presentationData.statsGesamt?.matrix) countN = (presentationData.statsGesamt.matrix.rp + presentationData.statsGesamt.matrix.fp + presentationData.statsGesamt.matrix.fn + presentationData.statsGesamt.matrix.rn);
                else if (kollektivKey === 'direkt OP' && presentationData.statsDirektOP?.matrix) countN = (presentationData.statsDirektOP.matrix.rp + presentationData.statsDirektOP.matrix.fp + presentationData.statsDirektOP.matrix.fn + presentationData.statsDirektOP.matrix.rn);
                else if (kollektivKey === 'nRCT' && presentationData.statsNRCT?.matrix) countN = (presentationData.statsNRCT.matrix.rp + presentationData.statsNRCT.matrix.fp + presentationData.statsNRCT.matrix.fn + presentationData.statsNRCT.matrix.rn);

                return `<tr><td class="fw-bold" data-tippy-content="${tt.kollektiv || 'Kollektiv'}">${kollektivDisplayName} (N=${countN})</td><td colspan="6" class="text-muted text-center">Daten fehlen</td></tr>`;
            }
            const count = stats.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : 0;
            return `<tr>
                        <td class="fw-bold" data-tippy-content="${tt.kollektiv || 'Patientenkollektiv und dessen Größe (N).'}">${kollektivDisplayName} (N=${count})</td>
                        <td data-tippy-content="${getInterpretationTT('sens', stats.sens)}">${fCI_p(stats.sens, 'sens')}</td>
                        <td data-tippy-content="${getInterpretationTT('spez', stats.spez)}">${fCI_p(stats.spez, 'spez')}</td>
                        <td data-tippy-content="${getInterpretationTT('ppv', stats.ppv)}">${fCI_p(stats.ppv, 'ppv')}</td>
                        <td data-tippy-content="${getInterpretationTT('npv', stats.npv)}">${fCI_p(stats.npv, 'npv')}</td>
                        <td data-tippy-content="${getInterpretationTT('acc', stats.acc)}">${fCI_p(stats.acc, 'acc')}</td>
                        <td data-tippy-content="${getInterpretationTT('auc', stats.auc)}">${fCI_p(stats.auc, 'auc')}</td>
                    </tr>`;
        };

        const perfCSVTooltip = TOOLTIP_CONTENT.praesentation.downloadPerformanceCSV?.description || "Performance-Tabelle als CSV";
        const perfMDTooltip = TOOLTIP_CONTENT.praesentation.downloadPerformanceMD?.description || "Performance-Tabelle als Markdown";
        const tablePNGTooltip = TOOLTIP_CONTENT.praesentation.downloadTablePNG?.description || "Tabelle als PNG";
        const perfChartPNGTooltip = `Chart ('${currentKollektivName}') als PNG herunterladen.`;
        const perfChartSVGTooltip = `Chart ('${currentKollektivName}') als SVG (Vektorgrafik) herunterladen.`;
        const chartId = "praes-as-pur-perf-chart";
        const tableId = "praes-as-pur-perf-table";
        const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image':'fa-download';
        const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code':'fa-download';

        const tooltipKeys = ['kollektiv', 'sens', 'spez', 'ppv', 'npv', 'acc', 'auc'];
        let tableHTML = `
            <div class="col-12">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>AS Performance vs. N für alle Kollektive</span>
                        <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="dl-${tableId}-png" data-table-id="${tableId}" data-table-name="Praes_AS_Perf_Uebersicht" data-tippy-content="${tablePNGTooltip}"><i class="fas fa-image"></i></button>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover table-sm small mb-0" id="${tableId}">
                                <thead class="small">
                                    <tr>${tooltipKeys.map((key, index) => `<th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asPurPerfTable?.[key] || ui_helpers.getMetricDescriptionHTML(key, 'AS') || ''}">${index === 0 ? 'Kollektiv' : (UI_TEXTS.statMetrics[key]?.name || key.charAt(0).toUpperCase() + key.slice(1)) + '. (95% CI)'}</th>`).join('')}</tr>
                                </thead>
                                <tbody>${kollektives.map(k => createPerfTableRow(statsMap[k], k)).join('')}</tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer text-end p-1">
                        <button class="btn btn-sm btn-outline-secondary me-1" id="download-performance-as-pur-csv" data-tippy-content="${perfCSVTooltip}"><i class="fas fa-file-csv me-1"></i>CSV</button>
                        <button class="btn btn-sm btn-outline-secondary" id="download-performance-as-pur-md" data-tippy-content="${perfMDTooltip}"><i class="fab fa-markdown me-1"></i>MD</button>
                    </div>
                </div>
            </div>`;

        let chartHTML = `
            <div class="col-lg-8 offset-lg-2">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>Visualisierung Güte (AS vs. N) - Kollektiv: ${currentKollektivName}</span>
                        <span class="card-header-buttons">
                            <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="dl-${chartId}-png" data-chart-id="${chartId}" data-format="png" data-chart-name="AS_Performance_${currentKollektivName.replace(/\s+/g, '_')}" data-tippy-content="${perfChartPNGTooltip}"><i class="fas ${dlIconPNG}"></i></button>
                            <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="dl-${chartId}-svg" data-chart-id="${chartId}" data-format="svg" data-chart-name="AS_Performance_${currentKollektivName.replace(/\s+/g, '_')}" data-tippy-content="${perfChartSVGTooltip}"><i class="fas ${dlIconSVG}"></i></button>
                        </span>
                    </div>
                    <div class="card-body p-1">
                        <div id="${chartId}" class="praes-chart-container border rounded" style="min-height: 280px;" data-tippy-content="Balkendiagramm der diagnostischen Gütekriterien für Avocado Sign (AS) vs. pathologischen N-Status für das Kollektiv ${currentKollektivName}.">
                            ${hasDataForCurrent ? '' : `<p class="text-center text-muted p-3">Keine Daten für Chart (${currentKollektivName}).</p>`}
                        </div>
                    </div>
                </div>
            </div>`;

        return `<div class="row g-3"><div class="col-12"><h3 class="text-center mb-3">Diagnostische Güte - Avocado Sign</h3></div>${tableHTML}${chartHTML}</div>`;
    }

    function _createPresentationView_ASvsT2_HTML(presentationData, selectedStudyId, currentGlobalKollektivForContext) {
        const { statsAS, statsT2, vergleich, comparisonCriteriaSet, kollektivForComparison, patientCountForComparison, t2CriteriaLabelShort, t2CriteriaLabelFull } = presentationData || {};
        const displayKollektivForComparison = getKollektivDisplayName(kollektivForComparison);
        const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
        const appliedName = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME || "Eingestellte Kriterien";
        const t2ShortNameEffective = t2CriteriaLabelShort || (comparisonCriteriaSet?.displayShortName || comparisonCriteriaSet?.shortName || 'T2');

        let comparisonBasisName = "N/A";
        let comparisonInfoHTML = '<p class="text-muted small">Bitte wählen Sie eine Vergleichsbasis für die T2-Kriterien.</p>';

        if (selectedStudyId && comparisonCriteriaSet) {
            const studyInfo = comparisonCriteriaSet.studyInfo;
            comparisonBasisName = comparisonCriteriaSet.displayShortName || comparisonCriteriaSet.shortName || comparisonCriteriaSet.name || (isApplied ? appliedName : selectedStudyId);
            let criteriaHTML = '<span class="text-muted">Keine Kriteriendetails verfügbar.</span>';

            if (comparisonCriteriaSet.criteria) {
                 criteriaHTML = studyT2CriteriaManager.formatCriteriaForDisplay(comparisonCriteriaSet.criteria, comparisonCriteriaSet.logic || comparisonCriteriaSet.criteria.logic, false);
                 if (criteriaHTML === 'Keine aktiven Kriterien' && (comparisonCriteriaSet.logic || comparisonCriteriaSet.criteria.logic)) criteriaHTML += ` (Logik: ${UI_TEXTS.t2LogicDisplayNames[comparisonCriteriaSet.logic || comparisonCriteriaSet.criteria.logic] || (comparisonCriteriaSet.logic || comparisonCriteriaSet.criteria.logic)})`;
                 else if (criteriaHTML !== 'Keine aktiven Kriterien' && (comparisonCriteriaSet.logic || comparisonCriteriaSet.criteria.logic) && (comparisonCriteriaSet.logic || comparisonCriteriaSet.criteria.logic) !== 'KOMBINIERT') criteriaHTML = `<strong>Logik:</strong> ${UI_TEXTS.t2LogicDisplayNames[comparisonCriteriaSet.logic || comparisonCriteriaSet.criteria.logic] || (comparisonCriteriaSet.logic || comparisonCriteriaSet.criteria.logic)}<br><strong>Regel(n):</strong> ${criteriaHTML}`;
            }

            comparisonInfoHTML = `<dl class="row small mb-0">
                                    <dt class="col-sm-4" data-tippy-content="${(TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.reference || 'Quelle/Publikation der Kriterien.')}">${(TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.reference ? 'Referenz:' : 'Referenz:')}</dt><dd class="col-sm-8">${studyInfo?.reference || (isApplied ? 'Benutzerdefiniert (aktuell im Auswertungstab eingestellt)' : 'N/A')}</dd>
                                    <dt class="col-sm-4" data-tippy-content="${(TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.patientCohort || 'Ursprüngliche Studienkohorte bzw. aktuelles Vergleichskollektiv.')}">${(TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.patientCohort ? 'Orig.-Kohorte / Vergleichsbasis:' : 'Orig.-Kohorte / Vergleichsbasis:')}</dt><dd class="col-sm-8">${studyInfo?.patientCohort || `Aktuell: ${displayKollektivForComparison} (N=${patientCountForComparison || '?'})`}</dd>
                                    <dt class="col-sm-4" data-tippy-content="${(TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.investigationType || 'Art der Untersuchung in der Originalstudie (z.B. Primärstaging).')}">${(TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.investigationType ? 'Untersuchungstyp:' : 'Untersuchungstyp:')}</dt><dd class="col-sm-8">${studyInfo?.investigationType || 'N/A'}</dd>
                                    <dt class="col-sm-4" data-tippy-content="${(TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.focus || 'Hauptfokus der Originalstudie bzgl. dieser Kriterien.')}">${(TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.focus ? 'Studienfokus:' : 'Studienfokus:')}</dt><dd class="col-sm-8">${studyInfo?.focus || 'N/A'}</dd>
                                    <dt class="col-sm-4" data-tippy-content="${(TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.keyCriteriaSummary || 'Zusammenfassung der angewendeten T2-Kriterien und deren Logik.')}">${(TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.keyCriteriaSummary ? 'Kriterien:' : 'Kriterien:')}</dt><dd class="col-sm-8">${criteriaHTML}</dd>
                                </dl>`;
        }


        let resultsHTML = '';
        const canDisplayResults = !!(selectedStudyId && presentationData && statsAS && statsT2 && vergleich && comparisonCriteriaSet && patientCountForComparison > 0);
        const na = '--';
        const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image':'fa-download';
        const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code':'fa-download';

        if (canDisplayResults) {
            const fPVal = (r,d=3) => { const p = r?.pValue; return (p !== null && !isNaN(p)) ? (p < 0.001 ? '&lt;0.001' : formatNumber(p, d, na, true)) : na; };
            const perfCSV = TOOLTIP_CONTENT.praesentation.downloadPerformanceCSV?.description || "Vergleichs-Performance-Tabelle als CSV";
            const compTableMD = TOOLTIP_CONTENT.praesentation.downloadCompTableMD?.description || "Vergleichs-Metriken als Markdown";
            const testsMD = TOOLTIP_CONTENT.praesentation.downloadCompTestsMD?.description || "Statistische Vergleichstests als Markdown";

            const chartPNG = (TOOLTIP_CONTENT.praesentation.downloadCompChartPNG?.description || `Chart (AS vs. ${t2ShortNameEffective}) als PNG`).replace(/\[T2_SHORT_NAME\]/g, t2ShortNameEffective);
            const chartSVG = (TOOLTIP_CONTENT.praesentation.downloadCompChartSVG?.description || `Chart (AS vs. ${t2ShortNameEffective}) als SVG`).replace(/\[T2_SHORT_NAME\]/g, t2ShortNameEffective);
            const tablePNG = TOOLTIP_CONTENT.praesentation.downloadTablePNG?.description || "Tabelle als PNG";
            const compTablePNG = (TOOLTIP_CONTENT.praesentation.downloadCompTablePNG?.description || `Vergleichs-Metrik-Tabelle (AS vs. ${t2ShortNameEffective}) als PNG`).replace(/\[T2_SHORT_NAME\]/g, t2ShortNameEffective);

            const compTitle = `Stat. Vergleich (AS vs. ${t2ShortNameEffective})`;
            const perfTitle = `Vergleich Metriken (AS vs. ${t2ShortNameEffective})`;
            const chartTitle = `Vergleichs-Chart (AS vs. ${t2ShortNameEffective})`;
            const perfTableId = "praes-as-vs-t2-comp-table";
            const testTableId = "praes-as-vs-t2-test-table";
            const infoCardId = "praes-t2-basis-info-card";
            const chartContainerId = "praes-comp-chart-container";
            const chartBaseName = `AS_vs_${(comparisonCriteriaSet?.displayShortName || comparisonCriteriaSet?.shortName || selectedStudyId || 'T2').replace(/\s+/g, '_')}_Koll_${displayKollektivForComparison.replace(/\s+/g, '_')}`;

            let comparisonTableHTML = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0" id="${perfTableId}"><thead class="small"><tr><th data-tippy-content="${(TOOLTIP_CONTENT.praesentation.asVsT2PerfTable?.metric || 'Diagnostische Metrik.')}">Metrik</th><th data-tippy-content="${(TOOLTIP_CONTENT.praesentation.asVsT2PerfTable?.asValue || 'Wert für Avocado Sign (AS).')}">AS (Wert, 95% CI)</th><th data-tippy-content="${(TOOLTIP_CONTENT.praesentation.asVsT2PerfTable?.t2Value || 'Wert für die ausgewählte T2-Basis.').replace('[T2_SHORT_NAME]', `<strong>${t2ShortNameEffective}</strong>`)}">${t2ShortNameEffective} (Wert, 95% CI)</th></tr></thead><tbody>`;
            const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
            const metricNames = { sens: 'Sensitivität', spez: 'Spezifität', ppv: 'PPV', npv: 'NPV', acc: 'Accuracy', balAcc: 'Bal. Accuracy', f1: 'F1-Score', auc: 'AUC' };
            metrics.forEach(key => {
                 const isRate = !(key === 'f1' || key === 'auc'); const digits = isRate ? 1 : 3;
                 const valAS = formatCI(statsAS[key]?.value, statsAS[key]?.ci?.lower, statsAS[key]?.ci?.upper, digits, isRate, na);
                 const valT2 = formatCI(statsT2[key]?.value, statsT2[key]?.ci?.lower, statsT2[key]?.ci?.upper, digits, isRate, na);
                 const tooltipDesc = ui_helpers.getMetricDescriptionHTML(key, 'Wert');
                 const tooltipAS = ui_helpers.getMetricInterpretationHTML(key, statsAS[key], 'AS', displayKollektivForComparison);
                 const tooltipT2 = ui_helpers.getMetricInterpretationHTML(key, statsT2[key], t2ShortNameEffective, displayKollektivForComparison);
                 comparisonTableHTML += `<tr><td data-tippy-content="${tooltipDesc}">${metricNames[key]}</td><td data-tippy-content="${tooltipAS}">${valAS}</td><td data-tippy-content="${tooltipT2}">${valT2}</td></tr>`;
            });
            comparisonTableHTML += `</tbody></table></div>`;
            const compTableDownloadBtns = [ {id: `dl-${perfTableId}-png`, icon: 'fa-image', tooltip: compTablePNG, format: 'png', tableId: perfTableId, tableName: `Praes_ASvsT2_Metrics_${(comparisonCriteriaSet?.id || selectedStudyId || 'T2').replace(/\s+/g, '_')}`} ];
            const comparisonTableCardHTML = uiComponents.createStatistikCard(perfTableId+'_card', perfTitle, comparisonTableHTML, false, 'praesentation.comparisonTableCard', compTableDownloadBtns, perfTableId);

            let testsTableHTML = `<table class="table table-sm table-striped small mb-0" id="${testTableId}"><thead class="small visually-hidden"><tr><th>Test</th><th>Statistik</th><th>p-Wert</th><th>Methode</th></tr></thead><tbody>`;
            const mcNemarDesc = ui_helpers.getTestDescriptionHTML('mcnemar', t2ShortNameEffective);
            const mcNemarInterp = ui_helpers.getTestInterpretationHTML('mcnemar', vergleich?.mcnemar, displayKollektivForComparison, t2ShortNameEffective);
            const delongDesc = ui_helpers.getTestDescriptionHTML('delong', t2ShortNameEffective);
            const delongInterp = ui_helpers.getTestInterpretationHTML('delong', vergleich?.delong, displayKollektivForComparison, t2ShortNameEffective);
            testsTableHTML += `<tr><td data-tippy-content="${mcNemarDesc}">McNemar (Acc)</td><td>${formatNumber(vergleich?.mcnemar?.statistic, 3, '--', true)} (df=${vergleich?.mcnemar?.df || '--'})</td><td data-tippy-content="${mcNemarInterp}"> ${fPVal(vergleich?.mcnemar)} ${getStatisticalSignificanceSymbol(vergleich?.mcnemar?.pValue)}</td><td class="text-muted">${vergleich?.mcnemar?.method || '--'}</td></tr>`;
            testsTableHTML += `<tr><td data-tippy-content="${delongDesc}">DeLong (AUC)</td><td>Z=${formatNumber(vergleich?.delong?.Z, 3, '--', true)}</td><td data-tippy-content="${delongInterp}"> ${fPVal(vergleich?.delong)} ${getStatisticalSignificanceSymbol(vergleich?.delong?.pValue)}</td><td class="text-muted">${vergleich?.delong?.method || '--'}</td></tr>`;
            testsTableHTML += `</tbody></table>`;
            const testTableDownloadBtns = [ {id: `dl-${testTableId}-png`, icon: 'fa-image', tooltip: tablePNG, format: 'png', tableId: testTableId, tableName: `Praes_ASvsT2_Tests_${(comparisonCriteriaSet?.id || selectedStudyId || 'T2').replace(/\s+/g, '_')}`} ];
            const testsCardHTML = uiComponents.createStatistikCard(testTableId+'_card', compTitle, testsTableHTML, false, null, testTableDownloadBtns, testTableId);

            resultsHTML = `
                <div class="row g-3 presentation-comparison-row">
                     <div class="col-lg-7 col-xl-7 presentation-comparison-col-left">
                        <div class="card h-100">
                             <div class="card-header d-flex justify-content-between align-items-center">
                                 <span>${chartTitle}</span>
                                 <span class="card-header-buttons">
                                     <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="download-chart-as-vs-t2-png" data-chart-id="${chartContainerId}" data-format="png" data-chart-name="${chartBaseName}" data-tippy-content="${chartPNG}"><i class="fas ${dlIconPNG}"></i></button>
                                     <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="download-chart-as-vs-t2-svg" data-chart-id="${chartContainerId}" data-format="svg" data-chart-name="${chartBaseName}" data-tippy-content="${chartSVG}"><i class="fas ${dlIconSVG}"></i></button>
                                 </span>
                             </div>
                            <div class="card-body p-1 d-flex align-items-center justify-content-center">
                                 <div id="${chartContainerId}" class="praes-chart-container w-100" style="min-height: 300px;" data-tippy-content="Balkendiagramm: Vergleich der Gütekriterien (AS vs. ${t2ShortNameEffective}) für Kollektiv ${displayKollektivForComparison}.">
                                     <p class="text-muted small text-center p-3">Lade Vergleichschart...</p>
                                 </div>
                            </div>
                             <div class="card-footer text-end p-1">
                                <button class="btn btn-sm btn-outline-secondary me-1" id="download-performance-as-vs-t2-csv" data-tippy-content="${perfCSV}"><i class="fas fa-file-csv me-1"></i>Tabelle (CSV)</button>
                                <button class="btn btn-sm btn-outline-secondary" id="download-comp-table-as-vs-t2-md" data-tippy-content="${compTableMD}"><i class="fab fa-markdown me-1"></i>Metriken (MD)</button>
                           </div>
                        </div>
                    </div>
                    <div class="col-lg-5 col-xl-5 presentation-comparison-col-right d-flex flex-column">
                         <div class="card mb-3 flex-shrink-0 praes-t2-basis-info-card" id="${infoCardId}" data-tippy-content="${(TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.description || 'Details zur ausgewählten T2-Vergleichsbasis und dem aktuellen Vergleichskollektiv.')}">
                            <div class="card-header card-header-sm">${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.title || 'Details zur T2-Vergleichsbasis'}</div>
                            <div class="card-body p-2">${comparisonInfoHTML}</div>
                         </div>
                         <div class="card mb-3 flex-grow-0">
                             ${comparisonTableCardHTML}
                         </div>
                         <div class="card flex-grow-1">
                              ${testsCardHTML}
                             <div class="card-footer text-end p-1">
                                <button class="btn btn-sm btn-outline-secondary" id="download-tests-as-vs-t2-md" data-tippy-content="${testsMD}"><i class="fab fa-markdown me-1"></i>Tests (MD)</button>
                            </div>
                         </div>
                    </div>
                </div>`;
        } else if (selectedStudyId && presentationData && (patientCountForComparison === undefined || patientCountForComparison === 0) ) {
            resultsHTML = `<div class="alert alert-warning">Keine Patientendaten für Kollektiv (<strong>${displayKollektivForComparison}</strong>) für diesen Vergleich vorhanden.</div>`;
        } else if (selectedStudyId && !comparisonCriteriaSet) {
            resultsHTML = `<div class="alert alert-danger">Fehler: Vergleichs-Kriterien (ID: ${selectedStudyId}) nicht gefunden.</div>`;
        } else {
            resultsHTML = `<div class="alert alert-info">Bitte wählen Sie oben eine Vergleichsbasis für das Kollektiv '<strong>${displayKollektivForComparison}</strong>'.</div>`;
        }
        return resultsHTML;
    }

    function initializeTab(data, currentKollektiv, appliedT2Criteria, appliedT2Logic, currentView, currentStudyId) {
        _globalRawData = data;
        _currentKollektivGlobal = currentKollektiv;
        _appliedT2CriteriaGlobal = appliedT2Criteria;
        _appliedT2LogicGlobal = appliedT2Logic;
        _currentView = currentView;
        _currentStudyId = currentStudyId;
        setDataStale();

        const presentationData = _preparePresentationData();
        const contentArea = document.getElementById('praesentation-content-area');
        
        if (contentArea) {
            if (_currentView === 'as-pur') {
                contentArea.innerHTML = _createPresentationView_ASPUR_HTML(presentationData);
                if(presentationData.statsCurrentKollektiv && presentationData.statsCurrentKollektiv.matrix && presentationData.patientCount > 0) {
                     chart_renderer.renderASPerformanceChart('praes-as-pur-perf-chart', presentationData.statsCurrentKollektiv, getKollektivDisplayName(_currentKollektivGlobal), { includeCI: true, yDomain: [0,1]});
                }
            } else if (_currentView === 'as-vs-t2') {
                contentArea.innerHTML = _createPresentationView_ASvsT2_HTML(presentationData, _currentStudyId, _currentKollektivGlobal);
                if (presentationData.statsAS && presentationData.statsT2 && presentationData.patientCountForComparison > 0) {
                    const chartData = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'].map(key => ({
                        group: UI_TEXTS.statMetrics[key]?.name || key.toUpperCase(),
                        AS: presentationData.statsAS[key],
                        T2: presentationData.statsT2[key]
                    }));
                    const series = [
                        { name: 'AS', key: 'AS', color: APP_CONFIG.CHART_SETTINGS.AS_COLOR, showCI: true },
                        { name: presentationData.t2CriteriaLabelShort || 'T2', key: 'T2', color: APP_CONFIG.CHART_SETTINGS.T2_COLOR, showCI: true }
                    ];
                    const chartTitle = `AS vs. ${presentationData.t2CriteriaLabelShort || 'T2'} (${getKollektivDisplayName(presentationData.kollektivForComparison)})`;
                    chart_renderer.renderComparisonBarChart('praes-comp-chart-container', chartData, series, { title: chartTitle, yAxisLabel: 'Wert', barType: 'grouped', groupKey: 'group', showLegend: true, includeCI: true, yDomain: [0,1] });
                }
            } else {
                contentArea.innerHTML = '<div class="alert alert-warning">Unbekannte Ansicht ausgewählt.</div>';
            }
        }
        ui_helpers.updatePresentationViewSelectorUI(_currentView); // Ensure controls are updated
        const studySelect = document.getElementById('praes-study-select');
        if(studySelect) studySelect.value = _currentStudyId || '';

        _isInitialized = true;
        ui_helpers.initializeTooltips(contentArea);
    }


    return Object.freeze({
        initialize,
        initializeTab,
        isInitialized,
        setDataStale
    });

})();
