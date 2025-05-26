const praesentationTabLogic = (() => {

    function _createPresentationView_ASPUR_HTML(presentationData) {
        const { statsGesamt, statsDirektOP, statsNRCT, kollektiv, statsCurrentKollektiv, patientCount } = presentationData || {};
        const kollektives = [APP_CONFIG.KOLLEKTIV_IDS.GESAMT, APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP, APP_CONFIG.KOLLEKTIV_IDS.NRCT];
        const statsMap = {
            [APP_CONFIG.KOLLEKTIV_IDS.GESAMT]: statsGesamt,
            [APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP]: statsDirektOP,
            [APP_CONFIG.KOLLEKTIV_IDS.NRCT]: statsNRCT
        };
        const currentKollektivName = getKollektivDisplayName(kollektiv);

        const hasDataForCurrent = !!(statsCurrentKollektiv && statsCurrentKollektiv.matrix && statsCurrentKollektiv.matrix.rp !== undefined && (statsCurrentKollektiv.matrix.rp + statsCurrentKollektiv.matrix.fp + statsCurrentKollektiv.matrix.fn + statsCurrentKollektiv.matrix.rn) > 0);

        const createPerfTableRow = (stats, kollektivKey) => {
            const kollektivDisplayName = getKollektivDisplayName(kollektivKey);
            const na = '--';
            const fCI_p = (m, k) => { const d = (k === 'auc'||k==='f1') ? 3 : 1; const p = !(k === 'auc'||k==='f1'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, na); };
            const getInterpretationTT = (mk, st) => { return ui_helpers.getMetricInterpretationHTML(mk, st, 'AS', kollektivDisplayName); };

            if (!stats || typeof stats.matrix !== 'object') {
                return `<tr><td class="fw-bold" data-tippy-content="${TOOLTIP_CONTENT.praesentation.asPurPerfTable?.kollektiv || 'Kollektiv'}">${kollektivDisplayName} (N=?)</td><td colspan="6" class="text-muted text-center">Daten fehlen</td></tr>`;
            }
            const count = stats.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : 0;
            return `<tr>
                        <td class="fw-bold" data-tippy-content="${TOOLTIP_CONTENT.praesentation.asPurPerfTable?.kollektiv || 'Kollektiv'}">${kollektivDisplayName} (N=${count})</td>
                        <td data-tippy-content="${getInterpretationTT('sens', stats.sens)}">${fCI_p(stats.sens, 'sens')}</td>
                        <td data-tippy-content="${getInterpretationTT('spez', stats.spez)}">${fCI_p(stats.spez, 'spez')}</td>
                        <td data-tippy-content="${getInterpretationTT('ppv', stats.ppv)}">${fCI_p(stats.ppv, 'ppv')}</td>
                        <td data-tippy-content="${getInterpretationTT('npv', stats.npv)}">${fCI_p(stats.npv, 'npv')}</td>
                        <td data-tippy-content="${getInterpretationTT('acc', stats.acc)}">${fCI_p(stats.acc, 'acc')}</td>
                        <td data-tippy-content="${getInterpretationTT('auc', stats.auc)}">${fCI_p(stats.auc, 'auc')}</td>
                    </tr>`;
        };

        const perfCSVTooltip = TOOLTIP_CONTENT.praesentation.downloadPerformanceCSV?.description || "CSV";
        const perfMDTooltip = TOOLTIP_CONTENT.praesentation.downloadPerformanceMD?.description || "MD";
        const tablePNGTooltip = TOOLTIP_CONTENT.praesentation.downloadTablePNG?.description || "Tabelle als PNG";
        const perfChartPNGTooltip = `Chart (${currentKollektivName}) PNG`;
        const perfChartSVGTooltip = `Chart (${currentKollektivName}) SVG`;
        const chartId = "praes-as-pur-perf-chart";
        const tableId = "praes-as-pur-perf-table";
        const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG.includes('{ChartName}') ? 'fa-image':'fa-download'; // Simplified check
        const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG.includes('{ChartName}') ? 'fa-file-code':'fa-download'; // Simplified check


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
                                    <tr>${tooltipKeys.map((key, index) => `<th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asPurPerfTable?.[key]?.description || ui_helpers.getMetricDescriptionHTML(key, 'AS') || ''}">${index === 0 ? 'Kollektiv' : (key.charAt(0).toUpperCase() + key.slice(1) + '. (95% CI)')}</th>`).join('')}</tr>
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
                            <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="dl-${chartId}-png" data-chart-id="${chartId}" data-format="png" data-tippy-content="${perfChartPNGTooltip}"><i class="fas ${dlIconPNG}"></i></button>
                            <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="dl-${chartId}-svg" data-chart-id="${chartId}" data-format="svg" data-tippy-content="${perfChartSVGTooltip}"><i class="fas ${dlIconSVG}"></i></button>
                        </span>
                    </div>
                    <div class="card-body p-1">
                        <div id="${chartId}" class="praes-chart-container border rounded" style="min-height: 280px;" data-tippy-content="Balkendiagramm der Gütekriterien für AS vs. N für Kollektiv ${currentKollektivName}. Fehlerbalken zeigen 95% Konfidenzintervalle.">
                            ${hasDataForCurrent ? '' : `<p class="text-center text-muted p-3">Keine Daten für Chart (${currentKollektivName}).</p>`}
                        </div>
                    </div>
                </div>
            </div>`;

        return `<div class="row g-3"><div class="col-12"><h3 class="text-center mb-3">Diagnostische Güte - Avocado Sign</h3></div>${tableHTML}${chartHTML}</div>`;
    }

    function _createPresentationView_ASvsT2_HTML(presentationData, selectedStudyId = null, currentKollektiv = APP_CONFIG.KOLLEKTIV_IDS.GESAMT) {
        const { statsAS, statsT2, vergleich, comparisonCriteriaSet, kollektiv, patientCount, t2CriteriaLabelShort, t2CriteriaLabelFull } = presentationData || {};
        const kollektivName = getKollektivDisplayName(kollektiv);
        const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
        const appliedName = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME || "Eingestellte Kriterien";
        const t2ShortNameEffective = t2CriteriaLabelShort || 'T2';

        let comparisonBasisName = "N/A";
        let comparisonInfoHTML = '<p class="text-muted small">Bitte wählen Sie eine Vergleichsbasis.</p>';

        if (selectedStudyId && comparisonCriteriaSet) {
            const studyInfo = comparisonCriteriaSet.studyInfo;
            comparisonBasisName = comparisonCriteriaSet.displayShortName || comparisonCriteriaSet.name || (isApplied ? appliedName : selectedStudyId);
            let criteriaHTML = '<span class="text-muted">Keine Kriteriendetails.</span>';
            let criteriaSourceForFormatting = comparisonCriteriaSet.criteria;
            let logicSourceForFormatting = comparisonCriteriaSet.logic;

            if (comparisonCriteriaSet.id === 'rutegard_et_al_esgar' && studyInfo?.keyCriteriaSummary) {
                 criteriaHTML = studyInfo.keyCriteriaSummary;
            } else if (criteriaSourceForFormatting) {
                 criteriaHTML = studyT2CriteriaManager.formatCriteriaForDisplay(criteriaSourceForFormatting, logicSourceForFormatting, false);
                 if (criteriaHTML === 'Keine aktiven Kriterien' && logicSourceForFormatting) criteriaHTML += ` (Logik: ${logicSourceForFormatting})`;
                 else if (criteriaHTML !== 'Keine aktiven Kriterien' && logicSourceForFormatting && logicSourceForFormatting !== 'KOMBINIERT') criteriaHTML = `<strong>Logik:</strong> ${UI_TEXTS.t2LogicDisplayNames[logicSourceForFormatting] || logicSourceForFormatting}<br><strong>Regel(n):</strong> ${criteriaHTML}`;
                 else if (criteriaHTML !== 'Keine aktiven Kriterien' && logicSourceForFormatting === 'KOMBINIERT') criteriaHTML = `${UI_TEXTS.t2LogicDisplayNames[logicSourceForFormatting] || logicSourceForFormatting}: ${criteriaHTML}`;
            }


            comparisonInfoHTML = `<dl class="row small mb-0">
                                    <dt class="col-sm-4" data-tippy-content="${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.reference}">Referenz:</dt><dd class="col-sm-8">${studyInfo?.reference || (isApplied ? 'Benutzerdefiniert' : 'N/A')}</dd>
                                    <dt class="col-sm-4" data-tippy-content="${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.patientCohort}">Orig.-Kohorte:</dt><dd class="col-sm-8">${studyInfo?.patientCohort || 'N/A'}</dd>
                                    <dt class="col-sm-4" data-tippy-content="Untersuchungstyp der Originalstudie (Baseline oder Restaging)">Untersuchung:</dt><dd class="col-sm-8">${studyInfo?.investigationType || 'N/A'}</dd>
                                    <dt class="col-sm-4" data-tippy-content="${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.focus}">Studienfokus:</dt><dd class="col-sm-8">${studyInfo?.focus || 'N/A'}</dd>
                                    <dt class="col-sm-4" data-tippy-content="${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.keyCriteriaSummary}">Kriterien:</dt><dd class="col-sm-8">${criteriaHTML}</dd>
                                </dl>`;
        }

        const studySets = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.getAllStudyCriteriaSets() : [];
        const appliedOptionHTML = `<option value="${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID}" ${isApplied ? 'selected' : ''}>-- ${appliedName} --</option>`;
        const studyOptionsHTML = studySets.map(set => `<option value="${set.id}" ${selectedStudyId === set.id ? 'selected' : ''}>${set.name || set.id}</option>`).join('');

        let resultsHTML = '';
        const canDisplayResults = !!(selectedStudyId && presentationData && statsAS && statsT2 && vergleich && comparisonCriteriaSet && patientCount > 0);
        const na = '--';
        const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG.includes('{ChartName}') ? 'fa-image':'fa-download';
        const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG.includes('{ChartName}') ? 'fa-file-code':'fa-download';

        if (canDisplayResults) {
            const fPVal = (r,d=3) => { const p = r?.pValue; return (p !== null && !isNaN(p)) ? (p < 0.001 ? '&lt;0.001' : formatNumber(p, d, na)) : na; };
            const perfCSV = TOOLTIP_CONTENT.praesentation.downloadPerformanceCSV?.description || "CSV";
            const perfMD = TOOLTIP_CONTENT.praesentation.downloadPerformanceMD?.description || "MD";
            const testsMD = TOOLTIP_CONTENT.praesentation.downloadCompTestsMD?.description || "Tests MD";
            const compTableMD = TOOLTIP_CONTENT.praesentation.downloadCompTableMD?.description || "Metriken MD";

            const chartPNG = TOOLTIP_CONTENT.praesentation.downloadCompChartPNG?.description || "Chart PNG";
            const chartSVG = TOOLTIP_CONTENT.praesentation.downloadCompChartSVG?.description || "Chart SVG";
            const tablePNG = TOOLTIP_CONTENT.praesentation.downloadTablePNG?.description || "Tabelle als PNG";
            const compTablePNG = TOOLTIP_CONTENT.praesentation.downloadCompTablePNG?.description || "Vergleichstabelle PNG";

            const compTitle = `Stat. Vergleich (AS vs. ${t2ShortNameEffective})`;
            const perfTitle = `Vergleich Metriken (AS vs. ${t2ShortNameEffective})`;
            const chartTitle = `Vergleichs-Chart (AS vs. ${t2ShortNameEffective})`;
            const perfTableId = "praes-as-vs-t2-comp-table";
            const testTableId = "praes-as-vs-t2-test-table";
            const infoCardId = "praes-t2-basis-info-card";
            const chartContainerId = "praes-comp-chart-container";

            let comparisonTableHTML = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0" id="${perfTableId}"><thead class="small"><tr><th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asVsT2PerfTable?.metric || 'Metrik'}">Metrik</th><th data-tippy-content="${TOOLTIP_CONTENT.praesentation.asVsT2PerfTable?.asValue || 'AS Wert'}">AS (Wert, 95% CI)</th><th data-tippy-content="${(TOOLTIP_CONTENT.praesentation.asVsT2PerfTable?.t2Value || 'T2 Wert').replace('[T2_SHORT_NAME]', t2ShortNameEffective)}">${t2ShortNameEffective} (Wert, 95% CI)</th></tr></thead><tbody>`;
            const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
            const metricNames = { sens: 'Sensitivität', spez: 'Spezifität', ppv: 'PPV', npv: 'NPV', acc: 'Accuracy', balAcc: 'Bal. Accuracy', f1: 'F1-Score', auc: 'AUC' };
            metrics.forEach(key => {
                 const isRate = !(key === 'f1' || key === 'auc'); const digits = isRate ? 1 : 3;
                 const valAS = formatCI(statsAS[key]?.value, statsAS[key]?.ci?.lower, statsAS[key]?.ci?.upper, digits, isRate, na);
                 const valT2 = formatCI(statsT2[key]?.value, statsT2[key]?.ci?.lower, statsT2[key]?.ci?.upper, digits, isRate, na);
                 const tooltipDesc = ui_helpers.getMetricDescriptionHTML(key, 'Wert');
                 const tooltipAS = ui_helpers.getMetricInterpretationHTML(key, statsAS[key], 'AS', kollektivName);
                 const tooltipT2 = ui_helpers.getMetricInterpretationHTML(key, statsT2[key], t2ShortNameEffective, kollektivName);
                 comparisonTableHTML += `<tr><td data-tippy-content="${tooltipDesc}">${metricNames[key]}</td><td data-tippy-content="${tooltipAS}">${valAS}</td><td data-tippy-content="${tooltipT2}">${valT2}</td></tr>`;
            });
            comparisonTableHTML += `</tbody></table></div>`;
            const compTableDownloadBtns = [ {id: `dl-${perfTableId}-png`, icon: 'fa-image', tooltip: compTablePNG, format: 'png', tableId: perfTableId, tableName: `Praes_ASvsT2_Metrics_${selectedStudyId || 'none'}`} ];
            const comparisonTableCardHTML = uiComponents.createStatistikCard(perfTableId+'_card', perfTitle, comparisonTableHTML, false, 'praesentation.comparisonTableCard', compTableDownloadBtns, perfTableId);

            let testsTableHTML = `<table class="table table-sm table-striped small mb-0" id="${testTableId}"><thead class="small visually-hidden"><tr><th>Test</th><th>Statistik</th><th>p-Wert</th><th>Methode</th></tr></thead><tbody>`;
            const mcNemarDesc = ui_helpers.getTestDescriptionHTML('mcnemar', t2ShortNameEffective);
            const mcNemarInterp = ui_helpers.getTestInterpretationHTML('mcnemar', vergleich?.mcnemar, kollektivName, t2ShortNameEffective);
            const delongDesc = ui_helpers.getTestDescriptionHTML('delong', t2ShortNameEffective);
            const delongInterp = ui_helpers.getTestInterpretationHTML('delong', vergleich?.delong, kollektivName, t2ShortNameEffective);
            testsTableHTML += `<tr><td data-tippy-content="${mcNemarDesc}">McNemar (Acc)</td><td>${formatNumber(vergleich?.mcnemar?.statistic, 3, '--')} (df=${vergleich?.mcnemar?.df || '--'})</td><td data-tippy-content="${mcNemarInterp}"> ${fPVal(vergleich?.mcnemar)} ${getStatisticalSignificanceSymbol(vergleich?.mcnemar?.pValue)}</td><td class="text-muted">${vergleich?.mcnemar?.method || '--'}</td></tr>`;
            testsTableHTML += `<tr><td data-tippy-content="${delongDesc}">DeLong (AUC)</td><td>Z=${formatNumber(vergleich?.delong?.Z, 3, '--')} (Diff: ${formatNumber(vergleich?.delong?.diffAUC, 3, na)})</td><td data-tippy-content="${delongInterp}"> ${fPVal(vergleich?.delong)} ${getStatisticalSignificanceSymbol(vergleich?.delong?.pValue)}</td><td class="text-muted">${vergleich?.delong?.method || '--'}</td></tr>`;
            testsTableHTML += `</tbody></table>`;
            const testTableDownloadBtns = [ {id: `dl-${testTableId}-png`, icon: 'fa-image', tooltip: tablePNG, format: 'png', tableId: testTableId, tableName: `Praes_ASvsT2_Tests_${selectedStudyId || 'none'}`} ];
            const testsCardHTML = uiComponents.createStatistikCard(testTableId+'_card', compTitle, testsTableHTML, false, null, testTableDownloadBtns, testTableId);

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
                                 <div id="${chartContainerId}" class="praes-chart-container w-100" style="min-height: 300px;" data-tippy-content="Balkendiagramm: Vergleich der Gütekriterien (AS vs. ${t2ShortNameEffective}). Fehlerbalken zeigen 95% Konfidenzintervalle.">
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
                         <div class="card mb-3 flex-shrink-0 praes-t2-basis-info-card" id="${infoCardId}" data-tippy-content="${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.description}">
                            <div class="card-header card-header-sm">${TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.title}</div>
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
        } else if (selectedStudyId && presentationData && patientCount === 0) {
            resultsHTML = `<div class="alert alert-warning">Keine Patientendaten für Kollektiv (${kollektivName}) für Vergleich vorhanden.</div>`;
        } else if (selectedStudyId && !comparisonCriteriaSet) {
            resultsHTML = `<div class="alert alert-danger">Fehler: Vergleichs-Kriterien (ID: ${selectedStudyId}) nicht gefunden.</div>`;
        } else {
            resultsHTML = `<div class="alert alert-info">Bitte wählen Sie oben eine Vergleichsbasis für Kollektiv '${kollektivName}'.</div>`;
        }

        return `<div class="row mb-4"><div class="col-12"><h4 class="text-center mb-1">Vergleich: Avocado Sign vs. T2-Kriterien</h4><p class="text-center text-muted small mb-3">Aktuelles Kollektiv: <strong>${kollektivName}</strong> (N=${patientCount ?? '?'})</p><div class="row justify-content-center"><div class="col-md-9 col-lg-7" id="praes-study-select-container"><div class="input-group input-group-sm"><label class="input-group-text" for="praes-study-select">T2-Vergleichsbasis:</label><select class="form-select" id="praes-study-select" data-tippy-content="${TOOLTIP_CONTENT.praesentation.studySelect.description}"><option value="" ${!selectedStudyId ? 'selected' : ''} disabled>-- Bitte wählen --</option>${appliedOptionHTML}<option value="" disabled>--- Publizierte Kriterien ---</option>${studyOptionsHTML}</select></div><div id="praes-study-description" class="mt-2 small text-muted">${comparisonBasisName === 'N/A' ? 'Keine Basis gewählt' : `Aktuelle T2 Basis: <strong>${comparisonBasisName}</strong>`}</div></div></div></div></div><div id="praesentation-as-vs-t2-results">${resultsHTML}</div>`;
    }

    function createPresentationTabContent(view, presentationData, selectedStudyId = null, currentKollektiv = APP_CONFIG.KOLLEKTIV_IDS.GESAMT) {
        let viewSelectorHTML = `
            <div class="row mb-4">
                <div class="col-12 d-flex justify-content-center">
                    <div class="btn-group btn-group-sm" role="group" aria-label="Präsentationsansicht Auswahl" data-tippy-content="${TOOLTIP_CONTENT.praesentation.viewSelect.description}">
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="ansicht-as-pur" autocomplete="off" value="as-pur" ${view === 'as-pur' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary praes-view-btn" for="ansicht-as-pur"><i class="fas fa-star me-1"></i> Avocado Sign (Daten)</label>
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="ansicht-as-vs-t2" value="as-vs-t2" autocomplete="off" ${view === 'as-vs-t2' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary praes-view-btn" for="ansicht-as-vs-t2"><i class="fas fa-exchange-alt me-1"></i> AS vs. T2 (Vergleich)</label>
                    </div>
                </div>
            </div>`;

        let contentHTML = '';
        if (view === 'as-pur') {
            contentHTML = _createPresentationView_ASPUR_HTML(presentationData);
        } else if (view === 'as-vs-t2') {
            contentHTML = _createPresentationView_ASvsT2_HTML(presentationData, selectedStudyId, currentKollektiv);
        } else {
            contentHTML = '<div class="alert alert-warning">Unbekannte Ansicht ausgewählt.</div>';
        }
        return viewSelectorHTML + `<div id="praesentation-content-area">${contentHTML}</div>`;
    }

    return Object.freeze({
        createPresentationTabContent
    });

})();
