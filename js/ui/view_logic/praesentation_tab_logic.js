const praesentationTabLogic = (() => {

    function _createPresentationView_ASPUR_HTML(presentationData, lang = 'de') {
        const effectiveLang = UI_TEXTS?.praesentationTab?.asPur?.[lang] ? lang : 'de';
        const uiStrings = UI_TEXTS.praesentationTab.asPur?.[effectiveLang] || UI_TEXTS.praesentationTab.asPur?.de || {};
        const tooltipStrings = TOOLTIP_CONTENT?.[effectiveLang]?.praesentation || TOOLTIP_CONTENT?.de?.praesentation || {};

        const { statsGesamt, statsDirektOP, statsNRCT, kollektiv, statsCurrentKollektiv, patientCount } = presentationData || {};
        const kollektives = ['Gesamt', 'direkt OP', 'nRCT'];
        const statsMap = { 'Gesamt': statsGesamt, 'direkt OP': statsDirektOP, 'nRCT': statsNRCT };
        const currentKollektivName = getKollektivDisplayName(kollektiv, effectiveLang);

        const hasDataForCurrent = !!(statsCurrentKollektiv && statsCurrentKollektiv.matrix && statsCurrentKollektiv.matrix.rp !== undefined && (statsCurrentKollektiv.matrix.rp + statsCurrentKollektiv.matrix.fp + statsCurrentKollektiv.matrix.fn + statsCurrentKollektiv.matrix.rn) > 0);

        const createPerfTableRow = (stats, kollektivKey) => {
            const kollektivDisplayName = getKollektivDisplayName(kollektivKey, effectiveLang);
            const na = '--';
            const fCI_p = (m, k) => { const d = (k === 'auc'||k==='f1') ? 3 : 1; const p = !(k === 'auc'||k==='f1'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, na, effectiveLang); };
            const getInterpretationTT = (mk, st) => { return ui_helpers.getMetricInterpretationHTML(mk, st, 'AS', kollektivDisplayName, effectiveLang); };
            const noDataRowText = effectiveLang === 'de' ? 'Daten fehlen' : 'Data missing';

            if (!stats || typeof stats.matrix !== 'object') {
                return `<tr><td class="fw-bold" data-tippy-content="${tooltipStrings.asPurPerfTable?.kollektiv || ''}">${kollektivDisplayName} (N=?)</td><td colspan="6" class="text-muted text-center">${noDataRowText}</td></tr>`;
            }
            const count = stats.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : 0;
            return `<tr>
                        <td class="fw-bold" data-tippy-content="${tooltipStrings.asPurPerfTable?.kollektiv || ''}">${kollektivDisplayName} (N=${count})</td>
                        <td data-tippy-content="${getInterpretationTT('sens', stats.sens)}">${fCI_p(stats.sens, 'sens')}</td>
                        <td data-tippy-content="${getInterpretationTT('spez', stats.spez)}">${fCI_p(stats.spez, 'spez')}</td>
                        <td data-tippy-content="${getInterpretationTT('ppv', stats.ppv)}">${fCI_p(stats.ppv, 'ppv')}</td>
                        <td data-tippy-content="${getInterpretationTT('npv', stats.npv)}">${fCI_p(stats.npv, 'npv')}</td>
                        <td data-tippy-content="${getInterpretationTT('acc', stats.acc)}">${fCI_p(stats.acc, 'acc')}</td>
                        <td data-tippy-content="${getInterpretationTT('auc', stats.auc)}">${fCI_p(stats.auc, 'auc')}</td>
                    </tr>`;
        };

        const perfCSVTooltip = tooltipStrings.downloadPerformanceCSV?.description || "CSV";
        const perfMDTooltip = tooltipStrings.downloadPerformanceMD?.description || "MD";
        const tablePNGTooltip = tooltipStrings.downloadTablePNG?.description || (effectiveLang === 'de' ? "Tabelle als PNG" : "Table as PNG");
        const perfChartPNGTooltip = (tooltipStrings.downloadChartPNG?.description || "Chart ([KOLLEKTIV_NAME]) PNG").replace('[KOLLEKTIV_NAME]', currentKollektivName);
        const perfChartSVGTooltip = (tooltipStrings.downloadChartSVG?.description || "Chart ([KOLLEKTIV_NAME]) SVG").replace('[KOLLEKTIV_NAME]', currentKollektivName);

        const chartId = "praes-as-pur-perf-chart";
        const tableId = "praes-as-pur-perf-table";
        const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image':'fa-download';
        const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code':'fa-download';

        const tableHeaders = uiStrings.asPurPerfTableHeaders || { kollektiv: "Kollektiv", sens: "Sens. (95% CI)", spez: "Spez. (95% CI)", ppv: "PPV (95% CI)", npv: "NPV (95% CI)", acc: "Acc. (95% CI)", auc: "AUC (95% CI)"};
        const headerTooltips = tooltipStrings.asPurPerfTable || {};

        let tableHTML = `
            <div class="col-12">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>${uiStrings.asPurPerfTableTitle || 'AS Performance vs. N für alle Kollektive'}</span>
                        <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="dl-${tableId}-png" data-table-id="${tableId}" data-table-name="Praes_AS_Perf_Uebersicht" data-tippy-content="${tablePNGTooltip}"><i class="fas fa-image"></i></button>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover table-sm small mb-0" id="${tableId}">
                                <thead class="small">
                                    <tr>
                                        <th data-tippy-content="${headerTooltips.kollektiv || ''}">${tableHeaders.kollektiv}</th>
                                        <th data-tippy-content="${headerTooltips.sens || ui_helpers.getMetricDescriptionHTML('sens','AS',effectiveLang)}">${tableHeaders.sens}</th>
                                        <th data-tippy-content="${headerTooltips.spez || ui_helpers.getMetricDescriptionHTML('spez','AS',effectiveLang)}">${tableHeaders.spez}</th>
                                        <th data-tippy-content="${headerTooltips.ppv || ui_helpers.getMetricDescriptionHTML('ppv','AS',effectiveLang)}">${tableHeaders.ppv}</th>
                                        <th data-tippy-content="${headerTooltips.npv || ui_helpers.getMetricDescriptionHTML('npv','AS',effectiveLang)}">${tableHeaders.npv}</th>
                                        <th data-tippy-content="${headerTooltips.acc || ui_helpers.getMetricDescriptionHTML('acc','AS',effectiveLang)}">${tableHeaders.acc}</th>
                                        <th data-tippy-content="${headerTooltips.auc || ui_helpers.getMetricDescriptionHTML('auc','AS',effectiveLang)}">${tableHeaders.auc}</th>
                                    </tr>
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
        
        const chartNoDataText = hasDataForCurrent ? '' : `<p class="text-center text-muted p-3">${(uiStrings.noDataForChart || 'Keine Daten für Chart ([KOLLEKTIV_NAME]).').replace('[KOLLEKTIV_NAME]', currentKollektivName)}</p>`;
        const chartTippyContent = (tooltipStrings.asPurPerfChart?.description || "Balkendiagramm der Gütekriterien für AS vs. N für Kollektiv [KOLLEKTIV_NAME].").replace('[KOLLEKTIV_NAME]', currentKollektivName);
        let chartHTML = `
            <div class="col-lg-8 offset-lg-2">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>${(uiStrings.asPurPerfChartTitle || 'Visualisierung Güte (AS vs. N) - Kollektiv: [KOLLEKTIV_NAME]').replace('[KOLLEKTIV_NAME]', currentKollektivName)}</span>
                        <span class="card-header-buttons">
                            <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="dl-${chartId}-png" data-chart-id="${chartId}" data-format="png" data-tippy-content="${perfChartPNGTooltip}"><i class="fas ${dlIconPNG}"></i></button>
                            <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="dl-${chartId}-svg" data-chart-id="${chartId}" data-format="svg" data-tippy-content="${perfChartSVGTooltip}"><i class="fas ${dlIconSVG}"></i></button>
                        </span>
                    </div>
                    <div class="card-body p-1">
                        <div id="${chartId}" class="praes-chart-container border rounded" style="min-height: 280px;" data-tippy-content="${chartTippyContent}">
                            ${chartNoDataText}
                        </div>
                    </div>
                </div>
            </div>`;

        return `<div class="row g-3"><div class="col-12"><h3 class="text-center mb-3">${uiStrings.mainTitleAsPur || 'Diagnostische Güte - Avocado Sign'}</h3></div>${tableHTML}${chartHTML}</div>`;
    }

    function _createPresentationView_ASvsT2_HTML(presentationData, selectedStudyId = null, currentKollektiv = 'Gesamt', lang = 'de') {
        const effectiveLang = UI_TEXTS?.praesentationTab?.asVsT2?.[lang] ? lang : 'de';
        const uiStrings = UI_TEXTS.praesentationTab.asVsT2?.[effectiveLang] || UI_TEXTS.praesentationTab.asVsT2?.de || {};
        const tooltipStrings = TOOLTIP_CONTENT?.[effectiveLang]?.praesentation || TOOLTIP_CONTENT?.de?.praesentation || {};
        const tooltipStringsT2Basis = tooltipStrings.t2BasisInfoCard || {};

        const { statsAS, statsT2, vergleich, comparisonCriteriaSet, kollektiv, patientCount, t2CriteriaLabelShort, t2CriteriaLabelFull } = presentationData || {};
        const kollektivName = getKollektivDisplayName(kollektiv, effectiveLang);
        const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
        const appliedName = getKollektivDisplayName(APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, effectiveLang);
        const t2ShortNameEffective = t2CriteriaLabelShort || 'T2';

        let comparisonBasisName = "N/A";
        let comparisonInfoHTML = `<p class="text-muted small">${uiStrings.pleaseSelectComparisonBase || 'Bitte wählen Sie eine Vergleichsbasis.'}</p>`;

        if (selectedStudyId && comparisonCriteriaSet) {
            const studyInfo = comparisonCriteriaSet.studyInfo;
            comparisonBasisName = comparisonCriteriaSet.displayShortName || comparisonCriteriaSet.name || (isApplied ? appliedName : selectedStudyId);
            let criteriaHTML = `<span class="text-muted">${uiStrings.noCriteriaDetails || 'Keine Kriteriendetails.'}</span>`;
            let criteriaSourceForFormatting = comparisonCriteriaSet.criteria;
            let logicSourceForFormatting = comparisonCriteriaSet.logic;

            if (comparisonCriteriaSet.id === 'rutegard_et_al_esgar' && studyInfo?.keyCriteriaSummary) {
                 criteriaHTML = studyInfo.keyCriteriaSummary; // Assuming this is language-neutral or already prepared
            } else if (criteriaSourceForFormatting) {
                 criteriaHTML = studyT2CriteriaManager.formatCriteriaForDisplay(criteriaSourceForFormatting, logicSourceForFormatting, false, effectiveLang);
                 const noActiveCriteriaText = effectiveLang === 'de' ? 'Keine aktiven Kriterien' : 'No active criteria';
                 const logicText = UI_TEXTS.t2LogicDisplayNames[effectiveLang]?.[logicSourceForFormatting] || logicSourceForFormatting;
                 if (criteriaHTML === noActiveCriteriaText && logicSourceForFormatting) criteriaHTML += ` (${uiStrings.logicLabel || 'Logik'}: ${logicText})`;
                 else if (criteriaHTML !== noActiveCriteriaText && logicSourceForFormatting) criteriaHTML = `<strong>${uiStrings.logicLabel || 'Logik'}:</strong> ${logicText}<br><strong>${uiStrings.rulesLabel || 'Regel(n)'}:</strong> ${criteriaHTML}`;
            }

            comparisonInfoHTML = `<dl class="row small mb-0">
                                    <dt class="col-sm-4" data-tippy-content="${tooltipStringsT2Basis.reference || ''}">${uiStrings.infoCardReference || 'Referenz:'}</dt><dd class="col-sm-8">${studyInfo?.reference || (isApplied ? (uiStrings.userDefined || 'Benutzerdefiniert') : 'N/A')}</dd>
                                    <dt class="col-sm-4" data-tippy-content="${tooltipStringsT2Basis.patientCohort || ''}">${uiStrings.infoCardOrigCohort || 'Orig.-Kohorte:'}</dt><dd class="col-sm-8">${studyInfo?.patientCohort || 'N/A'}</dd>
                                    <dt class="col-sm-4" data-tippy-content="${tooltipStringsT2Basis.investigationType || ''}">${uiStrings.infoCardInvestigation || 'Untersuchung:'}</dt><dd class="col-sm-8">${studyInfo?.investigationType || 'N/A'}</dd>
                                    <dt class="col-sm-4" data-tippy-content="${tooltipStringsT2Basis.focus || ''}">${uiStrings.infoCardFocus || 'Studienfokus:'}</dt><dd class="col-sm-8">${studyInfo?.focus || 'N/A'}</dd>
                                    <dt class="col-sm-4" data-tippy-content="${tooltipStringsT2Basis.keyCriteriaSummary || ''}">${uiStrings.infoCardCriteria || 'Kriterien:'}</dt><dd class="col-sm-8">${criteriaHTML}</dd>
                                </dl>`;
        }

        const studySets = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.getAllStudyCriteriaSets() : [];
        const appliedOptionHTML = `<option value="${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID}" ${isApplied ? 'selected' : ''}>-- ${appliedName} --</option>`;
        const studyOptionsHTML = studySets.map(set => {
            const setName = set.nameKey ? (UI_TEXTS?.praesentationTab?.studyNames?.[effectiveLang]?.[set.nameKey] || UI_TEXTS?.praesentationTab?.studyNames?.de?.[set.nameKey] || set.id) : (set.name || set.id);
            return `<option value="${set.id}" ${selectedStudyId === set.id ? 'selected' : ''}>${setName}</option>`
        }).join('');
        const pleaseSelectOption = uiStrings.pleaseSelectOption || '-- Bitte wählen --';
        const publishedCriteriaOption = uiStrings.publishedCriteriaOption || '--- Publizierte Kriterien ---';


        let resultsHTML = '';
        const canDisplayResults = !!(selectedStudyId && presentationData && statsAS && statsT2 && vergleich && comparisonCriteriaSet && patientCount > 0);
        const na = '--';
        const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image':'fa-download';
        const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code':'fa-download';

        if (canDisplayResults) {
            const fPVal = (r,d=3) => { const p = r?.pValue; return getPValueText(p, effectiveLang);};
            const perfCSV = tooltipStrings.downloadPerformanceCSV?.description || "CSV";
            const perfMD = tooltipStrings.downloadPerformanceMD?.description || "MD";
            const testsMD = tooltipStrings.downloadCompTestsMD?.description || "Tests MD";
            const compTableMD = tooltipStrings.downloadCompTableMD?.description || "Metriken MD";

            const chartPNG = tooltipStrings.downloadCompChartPNG?.description || "Chart PNG";
            const chartSVG = tooltipStrings.downloadCompChartSVG?.description || "Chart SVG";
            const tablePNG = tooltipStrings.downloadTablePNG?.description || (effectiveLang === 'de' ? "Tabelle als PNG" : "Table as PNG");
            const compTablePNG = tooltipStrings.downloadCompTablePNG?.description || (effectiveLang === 'de' ? "Vergleichstabelle PNG" : "Comparison Table PNG");


            const compTitle = (uiStrings.compTitle || 'Stat. Vergleich (AS vs. [T2_SHORT_NAME])').replace('[T2_SHORT_NAME]', t2ShortNameEffective);
            const perfTitle = (uiStrings.perfTitle || 'Vergleich Metriken (AS vs. [T2_SHORT_NAME])').replace('[T2_SHORT_NAME]', t2ShortNameEffective);
            const chartTitleText = (uiStrings.chartTitle || 'Vergleichs-Chart (AS vs. [T2_SHORT_NAME])').replace('[T2_SHORT_NAME]', t2ShortNameEffective);
            const perfTableId = "praes-as-vs-t2-comp-table";
            const testTableId = "praes-as-vs-t2-test-table";
            const infoCardId = "praes-t2-basis-info-card";
            const chartContainerId = "praes-comp-chart-container";
            
            const asVsT2PerfTableHeaders = tooltipStrings.asVsT2PerfTable || {};
            let comparisonTableHTML = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0" id="${perfTableId}"><thead class="small"><tr><th data-tippy-content="${asVsT2PerfTableHeaders.metric || ''}">${uiStrings.asVsT2PerfTableMetric || 'Metrik'}</th><th data-tippy-content="${asVsT2PerfTableHeaders.asValue || ''}">${uiStrings.asVsT2PerfTableAsValue || 'AS (Wert, 95% CI)'}</th><th data-tippy-content="${(asVsT2PerfTableHeaders.t2Value || '').replace('[T2_SHORT_NAME]', t2ShortNameEffective)}">${(uiStrings.asVsT2PerfTableT2Value || '[T2_SHORT_NAME] (Wert, 95% CI)').replace('[T2_SHORT_NAME]', t2ShortNameEffective)}</th></tr></thead><tbody>`;
            const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
            const metricNames = UI_TEXTS.statMetrics?.[effectiveLang] || UI_TEXTS.statMetrics?.de;
            metrics.forEach(key => {
                 const isRate = !(key === 'f1' || key === 'auc'); const digits = isRate ? 1 : 3;
                 const valAS = formatCI(statsAS[key]?.value, statsAS[key]?.ci?.lower, statsAS[key]?.ci?.upper, digits, isRate, na, effectiveLang);
                 const valT2 = formatCI(statsT2[key]?.value, statsT2[key]?.ci?.lower, statsT2[key]?.ci?.upper, digits, isRate, na, effectiveLang);
                 const tooltipDesc = ui_helpers.getMetricDescriptionHTML(key, (effectiveLang==='de'?'Wert':'Value'), effectiveLang);
                 const tooltipAS = ui_helpers.getMetricInterpretationHTML(key, statsAS[key], 'AS', kollektivName, effectiveLang);
                 const tooltipT2 = ui_helpers.getMetricInterpretationHTML(key, statsT2[key], t2ShortNameEffective, kollektivName, effectiveLang);
                 comparisonTableHTML += `<tr><td data-tippy-content="${tooltipDesc}">${metricNames[key]?.name || key}</td><td data-tippy-content="${tooltipAS}">${valAS}</td><td data-tippy-content="${tooltipT2}">${valT2}</td></tr>`;
            });
            comparisonTableHTML += `</tbody></table></div>`;
            const compTableDownloadBtns = [ {id: `dl-${perfTableId}-png`, icon: 'fa-image', tooltip: compTablePNG, format: 'png', tableId: perfTableId, tableName: `Praes_ASvsT2_Metrics_${selectedStudyId || 'none'}`} ];
            const comparisonTableCardHTML = uiComponents.createStatistikCard(perfTableId+'_card', perfTitle, comparisonTableHTML, false, 'praesentation.comparisonTableCard', compTableDownloadBtns, perfTableId, effectiveLang);

            const asVsT2TestTableHeaders = tooltipStrings.asVsT2TestTable || {};
            let testsTableHTML = `<table class="table table-sm table-striped small mb-0" id="${testTableId}"><thead class="small visually-hidden"><tr><th>${asVsT2TestTableHeaders.test || 'Test'}</th><th>${asVsT2TestTableHeaders.statistic || 'Statistik'}</th><th>${asVsT2TestTableHeaders.pValue || 'p-Wert'}</th><th>${asVsT2TestTableHeaders.method || 'Methode'}</th></tr></thead><tbody>`;
            const mcNemarDesc = ui_helpers.getTestDescriptionHTML('mcnemar', t2ShortNameEffective, effectiveLang);
            const mcNemarInterp = ui_helpers.getTestInterpretationHTML('mcnemar', vergleich?.mcnemar, kollektivName, t2ShortNameEffective, effectiveLang);
            const delongDesc = ui_helpers.getTestDescriptionHTML('delong', t2ShortNameEffective, effectiveLang);
            const delongInterp = ui_helpers.getTestInterpretationHTML('delong', vergleich?.delong, kollektivName, t2ShortNameEffective, effectiveLang);
            const mcNemarName = UI_TEXTS.statMetrics?.[effectiveLang]?.mcnemar?.name || 'McNemar (Accuracy)';
            const deLongName = UI_TEXTS.statMetrics?.[effectiveLang]?.delong?.name || 'DeLong (AUC)';

            testsTableHTML += `<tr><td data-tippy-content="${mcNemarDesc}">${mcNemarName}</td><td>${formatNumber(vergleich?.mcnemar?.statistic, 3, '--', false, effectiveLang)} (df=${vergleich?.mcnemar?.df || '--'})</td><td data-tippy-content="${mcNemarInterp}"> ${fPVal(vergleich?.mcnemar)} ${getStatisticalSignificanceSymbol(vergleich?.mcnemar?.pValue)}</td><td class="text-muted">${vergleich?.mcnemar?.method || '--'}</td></tr>`;
            testsTableHTML += `<tr><td data-tippy-content="${delongDesc}">${deLongName}</td><td>Z=${formatNumber(vergleich?.delong?.Z, 3, '--', false, effectiveLang)}</td><td data-tippy-content="${delongInterp}"> ${fPVal(vergleich?.delong)} ${getStatisticalSignificanceSymbol(vergleich?.delong?.pValue)}</td><td class="text-muted">${vergleich?.delong?.method || '--'}</td></tr>`;
            testsTableHTML += `</tbody></table>`;
            const testTableDownloadBtns = [ {id: `dl-${testTableId}-png`, icon: 'fa-image', tooltip: tablePNG, format: 'png', tableId: testTableId, tableName: `Praes_ASvsT2_Tests_${selectedStudyId || 'none'}`} ];
            const testsCardHTML = uiComponents.createStatistikCard(testTableId+'_card', compTitle, testsTableHTML, false, null, testTableDownloadBtns, testTableId, effectiveLang);
            const chartTippy = (tooltipStrings.downloadCompChart?.description || "Balkendiagramm: Vergleich der Gütekriterien (AS vs. [T2_SHORT_NAME]).").replace('[T2_SHORT_NAME]', t2ShortNameEffective);

            resultsHTML = `
                <div class="row g-3 presentation-comparison-row">
                     <div class="col-lg-7 col-xl-7 presentation-comparison-col-left">
                        <div class="card h-100">
                             <div class="card-header d-flex justify-content-between align-items-center">
                                 <span>${chartTitleText}</span>
                                 <span class="card-header-buttons">
                                     <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="download-chart-as-vs-t2-png" data-chart-id="${chartContainerId}" data-format="png" data-tippy-content="${chartPNG}"><i class="fas ${dlIconPNG}"></i></button>
                                     <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="download-chart-as-vs-t2-svg" data-chart-id="${chartContainerId}" data-format="svg" data-tippy-content="${chartSVG}"><i class="fas ${dlIconSVG}"></i></button>
                                 </span>
                             </div>
                            <div class="card-body p-1 d-flex align-items-center justify-content-center">
                                 <div id="${chartContainerId}" class="praes-chart-container w-100" style="min-height: 300px;" data-tippy-content="${chartTippy}">
                                     <p class="text-muted small text-center p-3">${uiStrings.loadingComparisonChart || 'Lade Vergleichschart...'}</p>
                                 </div>
                            </div>
                             <div class="card-footer text-end p-1">
                                <button class="btn btn-sm btn-outline-secondary me-1" id="download-performance-as-vs-t2-csv" data-tippy-content="${perfCSV}"><i class="fas fa-file-csv me-1"></i>${uiStrings.downloadTableCSV || 'Tabelle (CSV)'}</button>
                                <button class="btn btn-sm btn-outline-secondary" id="download-comp-table-as-vs-t2-md" data-tippy-content="${compTableMD}"><i class="fab fa-markdown me-1"></i>${uiStrings.downloadMetricsMD || 'Metriken (MD)'}</button>
                           </div>
                        </div>
                    </div>
                    <div class="col-lg-5 col-xl-5 presentation-comparison-col-right d-flex flex-column">
                         <div class="card mb-3 flex-shrink-0 praes-t2-basis-info-card" id="${infoCardId}" data-tippy-content="${tooltipStringsT2Basis.description || ''}">
                            <div class="card-header card-header-sm">${tooltipStringsT2Basis.title || (uiStrings.infoCardTitle || 'Details zur T2-Vergleichsbasis')}</div>
                            <div class="card-body p-2">${comparisonInfoHTML}</div>
                         </div>
                         <div class="card mb-3 flex-grow-0">
                             ${comparisonTableCardHTML}
                         </div>
                         <div class="card flex-grow-1">
                              ${testsCardHTML}
                             <div class="card-footer text-end p-1">
                                <button class="btn btn-sm btn-outline-secondary" id="download-tests-as-vs-t2-md" data-tippy-content="${testsMD}"><i class="fab fa-markdown me-1"></i>${uiStrings.downloadTestsMD || 'Tests (MD)'}</button>
                            </div>
                         </div>
                    </div>
                </div>`;
        } else if (selectedStudyId && presentationData && patientCount === 0) {
            resultsHTML = `<div class="alert alert-warning">${(uiStrings.noPatientDataForComparison || 'Keine Patientendaten für Kollektiv ([KOLLEKTIV_NAME]) für Vergleich vorhanden.').replace('[KOLLEKTIV_NAME]', kollektivName)}</div>`;
        } else if (selectedStudyId && !comparisonCriteriaSet) {
            resultsHTML = `<div class="alert alert-danger">${(uiStrings.errorComparisonCriteriaNotFound || 'Fehler: Vergleichs-Kriterien (ID: [ID]) nicht gefunden.').replace('[ID]', selectedStudyId)}</div>`;
        } else {
            resultsHTML = `<div class="alert alert-info">${(uiStrings.pleaseSelectComparisonBaseFull || 'Bitte wählen Sie oben eine Vergleichsbasis für Kollektiv \'[KOLLEKTIV_NAME]\'.').replace('[KOLLEKTIV_NAME]', kollektivName)}</div>`;
        }
        const noBaseSelectedText = uiStrings.noBaseSelected || 'Keine Basis gewählt';
        const currentT2BaseText = (uiStrings.currentT2Base || 'Aktuelle T2 Basis: <strong>[BASIS_NAME]</strong>').replace('[BASIS_NAME]', comparisonBasisName);

        return `<div class="row mb-4"><div class="col-12"><h4 class="text-center mb-1">${uiStrings.mainTitleAsVsT2 || 'Vergleich: Avocado Sign vs. T2-Kriterien'}</h4><p class="text-center text-muted small mb-3">${(uiStrings.currentCohortLabel || 'Aktuelles Kollektiv: <strong>[KOLLEKTIV_NAME]</strong> (N=[COUNT])').replace('[KOLLEKTIV_NAME]', kollektivName).replace('[COUNT]', patientCount ?? '?')}</p><div class="row justify-content-center"><div class="col-md-9 col-lg-7" id="praes-study-select-container"><div class="input-group input-group-sm"><label class="input-group-text" for="praes-study-select">${uiStrings.t2ComparisonBaseLabel || 'T2-Vergleichsbasis:'}</label><select class="form-select" id="praes-study-select" data-tippy-content="${tooltipStrings.studySelect?.description || ''}"><option value="" ${!selectedStudyId ? 'selected' : ''} disabled>${pleaseSelectOption}</option>${appliedOptionHTML}<option value="" disabled>${publishedCriteriaOption}</option>${studyOptionsHTML}</select></div><div id="praes-study-description" class="mt-2 small text-muted">${comparisonBasisName === 'N/A' ? noBaseSelectedText : currentT2BaseText}</div></div></div></div></div><div id="praesentation-as-vs-t2-results">${resultsHTML}</div>`;
    }

    function createPresentationTabContent(view, presentationData, selectedStudyId = null, currentKollektiv = 'Gesamt', lang = 'de') {
        const effectiveLang = UI_TEXTS?.praesentationTab?.[lang] ? lang : 'de';
        const uiStrings = UI_TEXTS.praesentationTab?.[effectiveLang] || UI_TEXTS.praesentationTab?.de || {};
        const tooltipViewSelect = TOOLTIP_CONTENT?.[effectiveLang]?.praesentation?.viewSelect?.description || TOOLTIP_CONTENT?.de?.praesentation?.viewSelect?.description || '';

        let viewSelectorHTML = `
            <div class="row mb-4">
                <div class="col-12 d-flex justify-content-center">
                    <div class="btn-group btn-group-sm" role="group" aria-label="${uiStrings.viewSelectAriaLabel || 'Präsentationsansicht Auswahl'}" data-tippy-content="${tooltipViewSelect}">
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="ansicht-as-pur" autocomplete="off" value="as-pur" ${view === 'as-pur' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary praes-view-btn" for="ansicht-as-pur"><i class="fas fa-star me-1"></i> ${uiStrings.viewAsPurLabel || 'Avocado Sign (Daten)'}</label>
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="ansicht-as-vs-t2" value="as-vs-t2" autocomplete="off" ${view === 'as-vs-t2' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary praes-view-btn" for="ansicht-as-vs-t2"><i class="fas fa-exchange-alt me-1"></i> ${uiStrings.viewAsVsT2Label || 'AS vs. T2 (Vergleich)'}</label>
                    </div>
                </div>
            </div>`;

        let contentHTML = '';
        if (view === 'as-pur') {
            contentHTML = _createPresentationView_ASPUR_HTML(presentationData, effectiveLang);
        } else if (view === 'as-vs-t2') {
            contentHTML = _createPresentationView_ASvsT2_HTML(presentationData, selectedStudyId, currentKollektiv, effectiveLang);
        } else {
            contentHTML = `<div class="alert alert-warning">${uiStrings.unknownViewSelected || 'Unbekannte Ansicht ausgewählt.'}</div>`;
        }
        return viewSelectorHTML + `<div id="praesentation-content-area">${contentHTML}</div>`;
    }

    return Object.freeze({
        createPresentationTabContent
    });

})();
