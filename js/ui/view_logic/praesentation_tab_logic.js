const praesentationTabLogic = (() => {

    function _createPresentationView_ASPUR_HTML(presentationData) {
        const { statsGesamt, statsDirektOP, statsNRCT, kollektiv, statsCurrentKollektiv, patientCount } = presentationData || {};
        const langKey = state.getCurrentPublikationLang() || 'de';
        const kollektives = ['Gesamt', 'direkt OP', 'nRCT'];
        const statsMap = { 'Gesamt': statsGesamt, 'direkt OP': statsDirektOP, 'nRCT': statsNRCT };
        const currentKollektivName = getKollektivDisplayName(kollektiv, langKey);

        const hasDataForCurrent = !!(statsCurrentKollektiv && statsCurrentKollektiv.matrix && statsCurrentKollektiv.matrix.rp !== undefined && (statsCurrentKollektiv.matrix.rp + statsCurrentKollektiv.matrix.fp + statsCurrentKollektiv.matrix.fn + statsCurrentKollektiv.matrix.rn) > 0);

        const createPerfTableRow = (stats, kollektivKey) => {
            const kollektivDisplayName = getKollektivDisplayName(kollektivKey, langKey);
            const na = '--';
            const fCI_p = (m, k) => { const d = (k === 'auc'||k==='f1') ? 3 : 1; const p = !(k === 'auc'||k==='f1'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, na, langKey); };
            const getInterpretationTT = (mk, st) => { return ui_helpers.getMetricInterpretationHTML(mk, st, 'AS', kollektivDisplayName, langKey); };

            if (!stats || typeof stats.matrix !== 'object') {
                return `<tr><td class="fw-bold" data-tippy-content="${(TOOLTIP_CONTENT.praesentation.asPurPerfTable?.kollektiv?.[langKey] || TOOLTIP_CONTENT.praesentation.asPurPerfTable?.kollektiv?.['de'] || 'Kollektiv')}">${kollektivDisplayName} (N=?)</td><td colspan="6" class="text-muted text-center">${langKey === 'de' ? 'Daten fehlen' : 'Data missing'}</td></tr>`;
            }
            const count = stats.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : 0;
            return `<tr>
                        <td class="fw-bold" data-tippy-content="${(TOOLTIP_CONTENT.praesentation.asPurPerfTable?.kollektiv?.[langKey] || TOOLTIP_CONTENT.praesentation.asPurPerfTable?.kollektiv?.['de'] || 'Kollektiv')}">${kollektivDisplayName} (N=${count})</td>
                        <td data-tippy-content="${getInterpretationTT('sens', stats.sens)}">${fCI_p(stats.sens, 'sens')}</td>
                        <td data-tippy-content="${getInterpretationTT('spez', stats.spez)}">${fCI_p(stats.spez, 'spez')}</td>
                        <td data-tippy-content="${getInterpretationTT('ppv', stats.ppv)}">${fCI_p(stats.ppv, 'ppv')}</td>
                        <td data-tippy-content="${getInterpretationTT('npv', stats.npv)}">${fCI_p(stats.npv, 'npv')}</td>
                        <td data-tippy-content="${getInterpretationTT('acc', stats.acc)}">${fCI_p(stats.acc, 'acc')}</td>
                        <td data-tippy-content="${getInterpretationTT('auc', stats.auc)}">${fCI_p(stats.auc, 'auc')}</td>
                    </tr>`;
        };

        const perfCSVTooltipBase = TOOLTIP_CONTENT.praesentation.downloadPerformanceCSV?.description;
        const perfCSVTooltip = (typeof perfCSVTooltipBase === 'object' ? perfCSVTooltipBase[langKey] : perfCSVTooltipBase) || perfCSVTooltipBase?.['de'] || "CSV";
        const perfMDTooltipBase = TOOLTIP_CONTENT.praesentation.downloadPerformanceMD?.description;
        const perfMDTooltip = (typeof perfMDTooltipBase === 'object' ? perfMDTooltipBase[langKey] : perfMDTooltipBase) || perfMDTooltipBase?.['de'] || "MD";
        const tablePNGTooltipBase = TOOLTIP_CONTENT.praesentation.downloadTablePNG?.description;
        const tablePNGTooltip = (typeof tablePNGTooltipBase === 'object' ? tablePNGTooltipBase[langKey] : tablePNGTooltipBase) || tablePNGTooltipBase?.['de'] || "Tabelle als PNG";

        const perfChartPNGTooltip = `${langKey === 'de' ? 'Chart' : 'Chart'} (${currentKollektivName}) PNG`;
        const perfChartSVGTooltip = `${langKey === 'de' ? 'Chart' : 'Chart'} (${currentKollektivName}) SVG`;
        const chartId = "praes-as-pur-perf-chart";
        const tableId = "praes-as-pur-perf-table";
        const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image':'fa-download';
        const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code':'fa-download';

        const tooltipKeys = ['kollektiv', 'sens', 'spez', 'ppv', 'npv', 'acc', 'auc'];
        const tableHeaderHTML = tooltipKeys.map((key, index) => {
            const labelKey = key.charAt(0).toUpperCase() + key.slice(1);
            const headerLabelText = index === 0 ? (langKey === 'de' ? 'Kollektiv' : 'Cohort') : `${labelKey}. (95% CI)`;
            const tooltipBase = TOOLTIP_CONTENT.praesentation.asPurPerfTable?.[key];
            let tooltipText = '';
            if (typeof tooltipBase === 'object' && tooltipBase !== null) {
                tooltipText = tooltipBase[langKey] || tooltipBase['de'] || (ui_helpers.getMetricDescriptionHTML(key, 'AS', langKey) || '');
            } else if (typeof tooltipBase === 'string') {
                tooltipText = tooltipBase;
            } else {
                tooltipText = ui_helpers.getMetricDescriptionHTML(key, 'AS', langKey) || '';
            }
            return `<th data-tippy-content="${tooltipText}">${headerLabelText}</th>`;
        }).join('');


        let tableHTML = `
            <div class="col-12">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>${langKey === 'de' ? 'AS Performance vs. N für alle Kollektive' : 'AS Performance vs. N for all Cohorts'}</span>
                        <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="dl-${tableId}-png" data-table-id="${tableId}" data-table-name="Praes_AS_Perf_Uebersicht" data-tippy-content="${tablePNGTooltip}"><i class="fas fa-image"></i></button>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover table-sm small mb-0" id="${tableId}">
                                <thead class="small">
                                    <tr>${tableHeaderHTML}</tr>
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

        const chartCardTitle = langKey === 'de' ? `Visualisierung Güte (AS vs. N) - Kollektiv: ${currentKollektivName}` : `Performance Visualization (AS vs. N) - Cohort: ${currentKollektivName}`;
        const chartTippyContent = (langKey === 'de' ? `Balkendiagramm der Gütekriterien für AS vs. N für Kollektiv ${currentKollektivName}.` : `Bar chart of performance metrics for AS vs. N for cohort ${currentKollektivName}.`);

        let chartHTML = `
            <div class="col-lg-8 offset-lg-2">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>${chartCardTitle}</span>
                        <span class="card-header-buttons">
                            <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="dl-${chartId}-png" data-chart-id="${chartId}" data-format="png" data-tippy-content="${perfChartPNGTooltip}"><i class="fas ${dlIconPNG}"></i></button>
                            <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="dl-${chartId}-svg" data-chart-id="${chartId}" data-format="svg" data-tippy-content="${perfChartSVGTooltip}"><i class="fas ${dlIconSVG}"></i></button>
                        </span>
                    </div>
                    <div class="card-body p-1">
                        <div id="${chartId}" class="praes-chart-container border rounded" style="min-height: 280px;" data-tippy-content="${chartTippyContent}">
                            ${hasDataForCurrent ? '' : `<p class="text-center text-muted p-3">${langKey === 'de' ? 'Keine Daten für Chart' : 'No data for chart'} (${currentKollektivName}).</p>`}
                        </div>
                    </div>
                </div>
            </div>`;

        const mainTitle = langKey === 'de' ? 'Diagnostische Güte - Avocado Sign' : 'Diagnostic Performance - Avocado Sign';
        return `<div class="row g-3"><div class="col-12"><h3 class="text-center mb-3">${mainTitle}</h3></div>${tableHTML}${chartHTML}</div>`;
    }

    function _createPresentationView_ASvsT2_HTML(presentationData, selectedStudyId = null, currentKollektiv = 'Gesamt') {
        const { statsAS, statsT2, vergleich, comparisonCriteriaSet, kollektiv, patientCount, t2CriteriaLabelShort, t2CriteriaLabelFull } = presentationData || {};
        const langKey = state.getCurrentPublikationLang() || 'de';
        const kollektivName = getKollektivDisplayName(kollektiv, langKey);
        const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
        const appliedName = UI_TEXTS.kollektivDisplayNames.applied_criteria[langKey] || APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
        const t2ShortNameEffective = t2CriteriaLabelShort || 'T2';

        let comparisonBasisName = "N/A";
        let comparisonInfoHTML = `<p class="text-muted small">${langKey === 'de' ? 'Bitte wählen Sie eine Vergleichsbasis.' : 'Please select a comparison basis.'}</p>`;

        if (selectedStudyId && comparisonCriteriaSet) {
            const studyInfo = comparisonCriteriaSet.studyInfo;
            comparisonBasisName = comparisonCriteriaSet.displayShortName || comparisonCriteriaSet.name || (isApplied ? appliedName : selectedStudyId);
            let criteriaHTML = `<span class="text-muted">${langKey === 'de' ? 'Keine Kriteriendetails.' : 'No criteria details.'}</span>`;
            let criteriaSourceForFormatting = comparisonCriteriaSet.criteria;
            let logicSourceForFormatting = comparisonCriteriaSet.logic;

            if (comparisonCriteriaSet.id === 'rutegard_et_al_esgar' && studyInfo?.keyCriteriaSummary) {
                 criteriaHTML = studyInfo.keyCriteriaSummary;
            } else if (criteriaSourceForFormatting) {
                 criteriaHTML = studyT2CriteriaManager.formatCriteriaForDisplay(criteriaSourceForFormatting, logicSourceForFormatting, false, langKey);
                 if (criteriaHTML === (UI_TEXTS.noActiveCriteria[langKey] || UI_TEXTS.noActiveCriteria.de) && logicSourceForFormatting) criteriaHTML += ` (${langKey === 'de' ? 'Logik' : 'Logic'}: ${UI_TEXTS.t2LogicDisplayNames[logicSourceForFormatting]?.[langKey] || logicSourceForFormatting})`;
                 else if (criteriaHTML !== (UI_TEXTS.noActiveCriteria[langKey] || UI_TEXTS.noActiveCriteria.de) && logicSourceForFormatting) criteriaHTML = `<strong>${langKey === 'de' ? 'Logik' : 'Logic'}:</strong> ${UI_TEXTS.t2LogicDisplayNames[logicSourceForFormatting]?.[langKey] || logicSourceForFormatting}<br><strong>${langKey === 'de' ? 'Regel(n)' : 'Rule(s)'}:</strong> ${criteriaHTML}`;
            }
            const t2BasisInfoTooltips = TOOLTIP_CONTENT.praesentation.t2BasisInfoCard || {};
            comparisonInfoHTML = `<dl class="row small mb-0">
                                    <dt class="col-sm-4" data-tippy-content="${t2BasisInfoTooltips.reference?.[langKey] || t2BasisInfoTooltips.reference?.['de']}">${langKey === 'de' ? 'Referenz:' : 'Reference:'}</dt><dd class="col-sm-8">${studyInfo?.reference || (isApplied ? (langKey === 'de' ? 'Benutzerdefiniert' : 'User-defined') : 'N/A')}</dd>
                                    <dt class="col-sm-4" data-tippy-content="${t2BasisInfoTooltips.patientCohort?.[langKey] || t2BasisInfoTooltips.patientCohort?.['de']}">${langKey === 'de' ? 'Orig.-Kohorte:' : 'Orig. Cohort:'}</dt><dd class="col-sm-8">${studyInfo?.patientCohort || 'N/A'}</dd>
                                    <dt class="col-sm-4" data-tippy-content="${t2BasisInfoTooltips.investigationType?.[langKey] || t2BasisInfoTooltips.investigationType?.['de']}">${langKey === 'de' ? 'Untersuchung:' : 'Investigation:'}</dt><dd class="col-sm-8">${studyInfo?.investigationType || 'N/A'}</dd>
                                    <dt class="col-sm-4" data-tippy-content="${t2BasisInfoTooltips.focus?.[langKey] || t2BasisInfoTooltips.focus?.['de']}">${langKey === 'de' ? 'Studienfokus:' : 'Study Focus:'}</dt><dd class="col-sm-8">${studyInfo?.focus || 'N/A'}</dd>
                                    <dt class="col-sm-4" data-tippy-content="${t2BasisInfoTooltips.keyCriteriaSummary?.[langKey] || t2BasisInfoTooltips.keyCriteriaSummary?.['de']}">${langKey === 'de' ? 'Kriterien:' : 'Criteria:'}</dt><dd class="col-sm-8">${criteriaHTML}</dd>
                                </dl>`;
        }

        const studySets = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.getAllStudyCriteriaSets() : [];
        const appliedOptionHTML = `<option value="${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID}" ${isApplied ? 'selected' : ''}>-- ${appliedName} --</option>`;
        const studyOptionsHTML = studySets.map(set => {
            const setNameBase = UI_TEXTS.literatureSetNames?.[set.id];
            const setName = (typeof setNameBase === 'object' ? setNameBase[langKey] : setNameBase) || set.name || set.id;
            return `<option value="${set.id}" ${selectedStudyId === set.id ? 'selected' : ''}>${setName}</option>`;
        }).join('');


        let resultsHTML = '';
        const canDisplayResults = !!(selectedStudyId && presentationData && statsAS && statsT2 && vergleich && comparisonCriteriaSet && patientCount > 0);
        const na = '--';
        const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image':'fa-download';
        const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code':'fa-download';

        if (canDisplayResults) {
            const fPVal = (r,d=3) => { const p = r?.pValue; return (p !== null && !isNaN(p)) ? (p < 0.001 ? (langKey === 'de' ? '&lt;0,001' : '&lt;.001') : formatNumber(p, d, na, false, langKey)) : na; };

            const getTooltipText = (tooltipKey, subKey, defaultValue) => {
                const base = TOOLTIP_CONTENT.praesentation[tooltipKey]?.[subKey];
                return (typeof base === 'object' ? base[langKey] : base) || base?.['de'] || defaultValue;
            };

            const perfCSV = getTooltipText('downloadPerformanceCSV', 'description', "CSV");
            const perfMD = getTooltipText('downloadPerformanceMD', 'description', "MD");
            const testsMD = getTooltipText('downloadCompTestsMD', 'description', "Tests MD");
            const compTableMD = getTooltipText('downloadCompTableMD', 'description', "Metriken MD");

            const chartPNG = getTooltipText('downloadCompChartPNG', 'description', "Chart PNG");
            const chartSVG = getTooltipText('downloadCompChartSVG', 'description', "Chart SVG");
            const tablePNG = getTooltipText('downloadTablePNG', 'description', "Tabelle als PNG");
            const compTablePNG = getTooltipText('downloadCompTablePNG', 'description', "Vergleichstabelle PNG");

            const compTitle = langKey === 'de' ? `Stat. Vergleich (AS vs. ${t2ShortNameEffective})` : `Stat. Comparison (AS vs. ${t2ShortNameEffective})`;
            const perfTitle = langKey === 'de' ? `Vergleich Metriken (AS vs. ${t2ShortNameEffective})` : `Comparison Metrics (AS vs. ${t2ShortNameEffective})`;
            const chartTitle = langKey === 'de' ? `Vergleichs-Chart (AS vs. ${t2ShortNameEffective})` : `Comparison Chart (AS vs. ${t2ShortNameEffective})`;

            const perfTableId = "praes-as-vs-t2-comp-table";
            const testTableId = "praes-as-vs-t2-test-table";
            const infoCardId = "praes-t2-basis-info-card";
            const chartContainerId = "praes-comp-chart-container";

            const asVsT2PerfTableTooltips = TOOLTIP_CONTENT.praesentation.asVsT2PerfTable || {};

            const metricHeaderTooltipBase = asVsT2PerfTableTooltips.metric;
            let metricHeaderTooltip = (typeof metricHeaderTooltipBase === 'object' && metricHeaderTooltipBase !== null) ? (metricHeaderTooltipBase[langKey] || metricHeaderTooltipBase['de']) : (typeof metricHeaderTooltipBase === 'string' ? metricHeaderTooltipBase : (langKey === 'de' ? 'Metrik' : 'Metric'));

            const asValueTooltipBase = asVsT2PerfTableTooltips.asValue;
            let asValueTooltip = '';
            if (typeof asValueTooltipBase === 'object' && asValueTooltipBase !== null) { asValueTooltip = (asValueTooltipBase[langKey] || asValueTooltipBase['de'] || 'AS Wert (vs. N) im Kollektiv [KOLLEKTIV], inkl. 95% CI.').replace('[KOLLEKTIV]', kollektivName);
            } else if (typeof asValueTooltipBase === 'string') { asValueTooltip = asValueTooltipBase.replace('[KOLLEKTIV]', kollektivName);
            } else { asValueTooltip = `AS Wert (vs. N) im Kollektiv ${kollektivName}, inkl. 95% CI.`; }

            const t2ValueTooltipBase = asVsT2PerfTableTooltips.t2Value;
            let t2ValueTooltip = '';
            if (typeof t2ValueTooltipBase === 'object' && t2ValueTooltipBase !== null) { t2ValueTooltip = (t2ValueTooltipBase[langKey] || t2ValueTooltipBase['de'] || `Wert für [T2_SHORT_NAME] (vs. N) im Kollektiv [KOLLEKTIV], inkl. 95% CI.`).replace('[T2_SHORT_NAME]', t2ShortNameEffective).replace('[KOLLEKTIV]', kollektivName);
            } else if (typeof t2ValueTooltipBase === 'string') { t2ValueTooltip = t2ValueTooltipBase.replace('[T2_SHORT_NAME]', t2ShortNameEffective).replace('[KOLLEKTIV]', kollektivName);
            } else { t2ValueTooltip = `Wert für ${t2ShortNameEffective} (vs. N) im Kollektiv ${kollektivName}, inkl. 95% CI.`; }


            let comparisonTableHTML = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0" id="${perfTableId}"><thead class="small"><tr><th data-tippy-content="${metricHeaderTooltip}">${langKey === 'de' ? 'Metrik' : 'Metric'}</th><th data-tippy-content="${asValueTooltip}">AS (Wert, 95% CI)</th><th data-tippy-content="${t2ValueTooltip}">${t2ShortNameEffective} (Wert, 95% CI)</th></tr></thead><tbody>`;
            const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
            const metricDisplayNames = {};
            metrics.forEach(key => { const baseName = TOOLTIP_CONTENT.statMetrics[key]?.name; if (typeof baseName === 'object' && baseName !== null) { metricDisplayNames[key] = baseName[langKey] || baseName['de'] || key.charAt(0).toUpperCase() + key.slice(1); } else { metricDisplayNames[key] = key.charAt(0).toUpperCase() + key.slice(1); }});

            metrics.forEach(key => {
                 const isRate = !(key === 'f1' || key === 'auc'); const digits = isRate ? 1 : 3;
                 const valAS = formatCI(statsAS[key]?.value, statsAS[key]?.ci?.lower, statsAS[key]?.ci?.upper, digits, isRate, na, langKey);
                 const valT2 = formatCI(statsT2[key]?.value, statsT2[key]?.ci?.lower, statsT2[key]?.ci?.upper, digits, isRate, na, langKey);
                 const tooltipDesc = ui_helpers.getMetricDescriptionHTML(key, 'Wert', langKey);
                 const tooltipAS = ui_helpers.getMetricInterpretationHTML(key, statsAS[key], 'AS', kollektivName, langKey);
                 const tooltipT2 = ui_helpers.getMetricInterpretationHTML(key, statsT2[key], t2ShortNameEffective, kollektivName, langKey);
                 comparisonTableHTML += `<tr><td data-tippy-content="${tooltipDesc}">${metricDisplayNames[key]}</td><td data-tippy-content="${tooltipAS}">${valAS}</td><td data-tippy-content="${tooltipT2}">${valT2}</td></tr>`;
            });
            comparisonTableHTML += `</tbody></table></div>`;
            const compTableDownloadBtns = [ {id: `dl-${perfTableId}-png`, icon: 'fa-image', tooltip: compTablePNG, format: 'png', tableId: perfTableId, tableName: `Praes_ASvsT2_Metrics_${selectedStudyId || 'none'}`} ];
            const comparisonTableCardHTML = uiComponents.createStatistikCard(perfTableId+'_card', perfTitle, comparisonTableHTML, false, 'praesentation.comparisonTableCard', compTableDownloadBtns, perfTableId);

            let testsTableHTML = `<table class="table table-sm table-striped small mb-0" id="${testTableId}"><thead class="small visually-hidden"><tr><th>Test</th><th>Statistik</th><th>p-Wert</th><th>Methode</th></tr></thead><tbody>`;
            const mcNemarDesc = ui_helpers.getTestDescriptionHTML('mcnemar', t2ShortNameEffective, langKey);
            const mcNemarInterp = ui_helpers.getTestInterpretationHTML('mcnemar', vergleich?.mcnemar, kollektivName, t2ShortNameEffective, langKey);
            const delongDesc = ui_helpers.getTestDescriptionHTML('delong', t2ShortNameEffective, langKey);
            const delongInterp = ui_helpers.getTestInterpretationHTML('delong', vergleich?.delong, kollektivName, t2ShortNameEffective, langKey);
            testsTableHTML += `<tr><td data-tippy-content="${mcNemarDesc}">${langKey === 'de' ? 'McNemar (Acc)' : "McNemar's (Acc)"}</td><td>${formatNumber(vergleich?.mcnemar?.statistic, 3, '--', false, langKey)} (df=${vergleich?.mcnemar?.df || '--'})</td><td data-tippy-content="${mcNemarInterp}"> ${fPVal(vergleich?.mcnemar)} ${getStatisticalSignificanceSymbol(vergleich?.mcnemar?.pValue)}</td><td class="text-muted">${vergleich?.mcnemar?.method || '--'}</td></tr>`;
            testsTableHTML += `<tr><td data-tippy-content="${delongDesc}">${langKey === 'de' ? 'DeLong (AUC)' : "DeLong's (AUC)"}</td><td>Z=${formatNumber(vergleich?.delong?.Z, 3, '--', false, langKey)}</td><td data-tippy-content="${delongInterp}"> ${fPVal(vergleich?.delong)} ${getStatisticalSignificanceSymbol(vergleich?.delong?.pValue)}</td><td class="text-muted">${vergleich?.delong?.method || '--'}</td></tr>`;
            testsTableHTML += `</tbody></table>`;
            const testTableDownloadBtns = [ {id: `dl-${testTableId}-png`, icon: 'fa-image', tooltip: tablePNG, format: 'png', tableId: testTableId, tableName: `Praes_ASvsT2_Tests_${selectedStudyId || 'none'}`} ];
            const testsCardHTML = uiComponents.createStatistikCard(testTableId+'_card', compTitle, testsTableHTML, false, null, testTableDownloadBtns, testTableId);

            const chartTippyContent = (langKey === 'de' ? `Balkendiagramm: Vergleich der Gütekriterien (AS vs. ${t2ShortNameEffective}).` : `Bar chart: Comparison of performance metrics (AS vs. ${t2ShortNameEffective}).`);
            resultsHTML = `
                <div class="row g-3 presentation-comparison-row">
                     <div class="col-lg-7 col-xl-7 presentation-comparison-col-left">
                        <div class="card h-100">
                             <div class="card-header d-flex justify-content-between align-items-center">
                                 <span>${chartTitle}</span>
                                 <span class="card-header-buttons">
                                     <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="download-chart-as-vs-t2-png" data-chart-id="${chartContainerId}" data-format="png" data-tippy-content="${chartPNG}"><i class="fas ${dlIconPNG}"></i></button>
                                     <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="download-chart-as-vs-t2-svg" data-chart-id="${chartContainerId}" data-format="svg" data-tippy-content="${chartSVG}"><i class="fas ${dlIconSVG}"></i></button>
                                 </span>
                             </div>
                            <div class="card-body p-1 d-flex align-items-center justify-content-center">
                                 <div id="${chartContainerId}" class="praes-chart-container w-100" style="min-height: 300px;" data-tippy-content="${chartTippyContent}">
                                     <p class="text-muted small text-center p-3">${langKey === 'de' ? 'Lade Vergleichschart...' : 'Loading comparison chart...'}</p>
                                 </div>
                            </div>
                             <div class="card-footer text-end p-1">
                                <button class="btn btn-sm btn-outline-secondary me-1" id="download-performance-as-vs-t2-csv" data-tippy-content="${perfCSV}"><i class="fas fa-file-csv me-1"></i>${langKey === 'de' ? 'Tabelle (CSV)' : 'Table (CSV)'}</button>
                                <button class="btn btn-sm btn-outline-secondary" id="download-comp-table-as-vs-t2-md" data-tippy-content="${compTableMD}"><i class="fab fa-markdown me-1"></i>${langKey === 'de' ? 'Metriken (MD)' : 'Metrics (MD)'}</button>
                           </div>
                        </div>
                    </div>
                    <div class="col-lg-5 col-xl-5 presentation-comparison-col-right d-flex flex-column">
                         <div class="card mb-3 flex-shrink-0 praes-t2-basis-info-card" id="${infoCardId}" data-tippy-content="${(TOOLTIP_CONTENT.praesentation.t2BasisInfoCard?.description?.[langKey] || TOOLTIP_CONTENT.praesentation.t2BasisInfoCard?.description?.['de'] || '')}">
                            <div class="card-header card-header-sm">${(TOOLTIP_CONTENT.praesentation.t2BasisInfoCard?.title?.[langKey] || TOOLTIP_CONTENT.praesentation.t2BasisInfoCard?.title?.['de'] || '')}</div>
                            <div class="card-body p-2">${comparisonInfoHTML}</div>
                         </div>
                         <div class="card mb-3 flex-grow-0">
                             ${comparisonTableCardHTML}
                         </div>
                         <div class="card flex-grow-1">
                              ${testsCardHTML}
                             <div class="card-footer text-end p-1">
                                <button class="btn btn-sm btn-outline-secondary" id="download-tests-as-vs-t2-md" data-tippy-content="${testsMD}"><i class="fab fa-markdown me-1"></i>${langKey === 'de' ? 'Tests (MD)' : 'Tests (MD)'}</button>
                            </div>
                         </div>
                    </div>
                </div>`;
        } else if (selectedStudyId && presentationData && patientCount === 0) {
            resultsHTML = `<div class="alert alert-warning">${langKey === 'de' ? 'Keine Patientendaten für Kollektiv' : 'No patient data for cohort'} (${kollektivName}) ${langKey === 'de' ? 'für Vergleich vorhanden.' : 'available for comparison.'}</div>`;
        } else if (selectedStudyId && !comparisonCriteriaSet) {
            resultsHTML = `<div class="alert alert-danger">${langKey === 'de' ? 'Fehler: Vergleichs-Kriterien' : 'Error: Comparison criteria'} (ID: ${selectedStudyId}) ${langKey === 'de' ? 'nicht gefunden.' : 'not found.'}</div>`;
        } else {
            resultsHTML = `<div class="alert alert-info">${langKey === 'de' ? 'Bitte wählen Sie oben eine Vergleichsbasis für Kollektiv' : 'Please select a comparison basis above for cohort'} '${kollektivName}'.</div>`;
        }

        const mainTitle = langKey === 'de' ? 'Vergleich: Avocado Sign vs. T2-Kriterien' : 'Comparison: Avocado Sign vs. T2 Criteria';
        const currentKollektivText = langKey === 'de' ? 'Aktuelles Kollektiv:' : 'Current Cohort:';
        const selectLabel = langKey === 'de' ? 'T2-Vergleichsbasis:' : 'T2 Comparison Basis:';
        const selectPlaceholder = langKey === 'de' ? '-- Bitte wählen --' : '-- Please select --';
        const pubCriteriaPlaceholder = langKey === 'de' ? '--- Publizierte Kriterien ---' : '--- Published Criteria ---';
        const currentBasisText = langKey === 'de' ? 'Aktuelle T2 Basis:' : 'Current T2 Basis:';
        const noBasisText = langKey === 'de' ? 'Keine Basis gewählt' : 'No basis selected';
        const selectTippyBase = TOOLTIP_CONTENT.praesentation.studySelect.description;
        const selectTippy = (typeof selectTippyBase === 'object' ? selectTippyBase[langKey] : selectTippyBase) || selectTippyBase?.['de'] || '';


        return `<div class="row mb-4"><div class="col-12"><h4 class="text-center mb-1">${mainTitle}</h4><p class="text-center text-muted small mb-3">${currentKollektivText} <strong>${kollektivName}</strong> (N=${patientCount ?? '?'})</p><div class="row justify-content-center"><div class="col-md-9 col-lg-7" id="praes-study-select-container"><div class="input-group input-group-sm"><label class="input-group-text" for="praes-study-select">${selectLabel}</label><select class="form-select" id="praes-study-select" data-tippy-content="${selectTippy}"><option value="" ${!selectedStudyId ? 'selected' : ''} disabled>${selectPlaceholder}</option>${appliedOptionHTML}<option value="" disabled>${pubCriteriaPlaceholder}</option>${studyOptionsHTML}</select></div><div id="praes-study-description" class="mt-2 small text-muted">${comparisonBasisName === 'N/A' ? noBasisText : `${currentBasisText} <strong>${comparisonBasisName}</strong>`}</div></div></div></div></div><div id="praesentation-as-vs-t2-results">${resultsHTML}</div>`;
    }

    function createPresentationTabContent(view, presentationData, selectedStudyId = null, currentKollektiv = 'Gesamt') {
        const langKey = state.getCurrentPublikationLang() || 'de';
        const viewSelectTippyBase = TOOLTIP_CONTENT.praesentation.viewSelect.description;
        const viewSelectTippy = (typeof viewSelectTippyBase === 'object' ? viewSelectTippyBase[langKey] : viewSelectTippyBase) || viewSelectTippyBase?.['de'] || '';
        const labelASPUR = langKey === 'de' ? 'Avocado Sign (Daten)' : 'Avocado Sign (Data)';
        const labelASvsT2 = langKey === 'de' ? 'AS vs. T2 (Vergleich)' : 'AS vs. T2 (Comparison)';


        let viewSelectorHTML = `
            <div class="row mb-4">
                <div class="col-12 d-flex justify-content-center">
                    <div class="btn-group btn-group-sm" role="group" aria-label="${langKey === 'de' ? 'Präsentationsansicht Auswahl' : 'Presentation View Selection'}" data-tippy-content="${viewSelectTippy}">
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="ansicht-as-pur" autocomplete="off" value="as-pur" ${view === 'as-pur' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary praes-view-btn" for="ansicht-as-pur"><i class="fas fa-star me-1"></i> ${labelASPUR}</label>
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="ansicht-as-vs-t2" value="as-vs-t2" autocomplete="off" ${view === 'as-vs-t2' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary praes-view-btn" for="ansicht-as-vs-t2"><i class="fas fa-exchange-alt me-1"></i> ${labelASvsT2}</label>
                    </div>
                </div>
            </div>`;

        let contentHTML = '';
        if (view === 'as-pur') {
            contentHTML = _createPresentationView_ASPUR_HTML(presentationData);
        } else if (view === 'as-vs-t2') {
            contentHTML = _createPresentationView_ASvsT2_HTML(presentationData, selectedStudyId, currentKollektiv);
        } else {
            contentHTML = `<div class="alert alert-warning">${langKey === 'de' ? 'Unbekannte Ansicht ausgewählt.' : 'Unknown view selected.'}</div>`;
        }
        return viewSelectorHTML + `<div id="praesentation-content-area">${contentHTML}</div>`;
    }

    return Object.freeze({
        createPresentationTabContent
    });

})();
