const praesentationTabLogic = (() => {

    function _createPresentationView_ASPUR_HTML(presentationData) {
        const { statsGesamt, statsDirektOP, statsNRCT, kollektiv, statsCurrentKollektiv } = presentationData || {};
        const kollektives = ['Gesamt', 'direkt OP', 'nRCT'];
        const statsMap = { 'Gesamt': statsGesamt, 'direkt OP': statsDirektOP, 'nRCT': statsNRCT };
        const currentKollektivName = utils.getKollektivDisplayName(kollektiv);
        
        const createPerfTableRow = (stats, kollektivKey) => {
            const kollektivDisplayName = utils.getKollektivDisplayName(kollektivKey);
            const na = '--';
            const fCI_p = (m, k) => utils.formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, (k === 'auc'||k==='f1') ? 3 : 1, !(k === 'auc'||k==='f1'), na);
            const tt = TOOLTIP_CONTENT.praesentation.asPurPerfTable || {};
            if (!stats || !stats.matrix) {
                const n = allKollektivStats?.[kollektivKey]?.deskriptiv?.anzahlPatienten || '?';
                return `<tr><td class="fw-bold" data-tippy-content="${tt.kollektiv || ''}">${kollektivDisplayName} (N=${n})</td><td colspan="6" class="text-muted text-center">Keine validen Daten</td></tr>`;
            }
            const count = stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn;
            return `<tr>
                        <td class="fw-bold" data-tippy-content="${tt.kollektiv || ''}">${kollektivDisplayName} (N=${count})</td>
                        <td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('sens', stats.sens, 'AS', kollektivDisplayName)}">${fCI_p(stats.sens, 'sens')}</td>
                        <td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('spez', stats.spez, 'AS', kollektivDisplayName)}">${fCI_p(stats.spez, 'spez')}</td>
                        <td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('ppv', stats.ppv, 'AS', kollektivDisplayName)}">${fCI_p(stats.ppv, 'ppv')}</td>
                        <td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('npv', stats.npv, 'AS', kollektivDisplayName)}">${fCI_p(stats.npv, 'npv')}</td>
                        <td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('acc', stats.acc, 'AS', kollektivDisplayName)}">${fCI_p(stats.acc, 'acc')}</td>
                        <td data-tippy-content="${ui_helpers.getMetricInterpretationHTML('auc', stats.auc, 'AS', kollektivDisplayName)}">${fCI_p(stats.auc, 'auc')}</td>
                    </tr>`;
        };
        
        const tableId = "praes-as-pur-perf-table";
        const chartId = "praes-as-pur-perf-chart";

        return `<div class="row g-3">
                    <div class="col-12"><h3 class="text-center mb-3">Diagnostische Güte - Avocado Sign</h3></div>
                    <div class="col-12">
                        <div class="card h-100">
                            <div class="card-header">AS Performance vs. N für alle Kollektive</div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-striped table-hover table-sm small mb-0" id="${tableId}">
                                        <thead><tr><th>Kollektiv</th><th>Sens. (95%-KI)</th><th>Spez. (95%-KI)</th><th>PPV (95%-KI)</th><th>NPV (95%-KI)</th><th>Acc. (95%-KI)</th><th>AUC (95%-KI)</th></tr></thead>
                                        <tbody>${kollektives.map(k => createPerfTableRow(statsMap[k], k)).join('')}</tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-8 offset-lg-2">
                        <div class="card">
                            <div class="card-header">Visualisierung Güte (AS vs. N) - Kollektiv: ${currentKollektivName}</div>
                            <div class="card-body p-1">
                                <div id="${chartId}" class="praes-chart-container"></div>
                            </div>
                        </div>
                    </div>
                </div>`;
    }

    function _createPresentationView_ASvsT2_HTML(presentationData, selectedStudyId, currentGlobalKollektivForContext) {
        const { statsAS, statsT2, vergleich, comparisonCriteriaSet, kollektivForComparison, t2CriteriaLabelShort, t2CriteriaLabelFull } = presentationData || {};
        const displayKollektivForComparison = utils.getKollektivDisplayName(kollektivForComparison);
        const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
        let comparisonInfoHTML = '<p class="text-muted small">Bitte wählen Sie eine Vergleichsbasis.</p>';

        if (selectedStudyId && comparisonCriteriaSet) {
            const studyInfo = comparisonCriteriaSet.studyInfo;
            const criteriaHTML = studyT2CriteriaManager.formatCriteriaForDisplay(comparisonCriteriaSet.criteria, comparisonCriteriaSet.logic, false);
            comparisonInfoHTML = `<dl class="row small mb-0">
                                    <dt class="col-sm-4">Referenz:</dt><dd class="col-sm-8">${studyInfo?.reference || (isApplied ? 'Benutzerdefiniert' : 'N/A')}</dd>
                                    <dt class="col-sm-4">Vergleichsbasis:</dt><dd class="col-sm-8">${studyInfo?.patientCohort || `Aktuell: ${displayKollektivForComparison}`}</dd>
                                    <dt class="col-sm-4">Kriterien:</dt><dd class="col-sm-8">${criteriaHTML}</dd>
                                </dl>`;
        }

        const studySets = studyT2CriteriaManager.getAllStudyCriteriaSets();
        const appliedOptionHTML = `<option value="${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID}" ${isApplied ? 'selected' : ''}>-- ${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME} --</option>`;
        const studyOptionsHTML = studySets.map(set => `<option value="${set.id}" ${selectedStudyId === set.id ? 'selected' : ''}>${set.name}</option>`).join('');

        let resultsHTML = '';
        if (statsAS && statsT2 && vergleich && comparisonCriteriaSet) {
            const na = '--';
            const fCI = (m, k) => utils.formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, (k === 'f1' || k === 'auc') ? 3 : 1, !(k === 'f1' || k === 'auc'), na);
            const t2Name = t2CriteriaLabelShort || 'T2';
            
            const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
            const metricNames = { sens: 'Sensitivität', spez: 'Spezifität', ppv: 'PPV', npv: 'NPV', acc: 'Accuracy', balAcc: 'Bal. Accuracy', f1: 'F1-Score', auc: 'AUC' };
            
            let comparisonTableHTML = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0" id="praes-as-vs-t2-comp-table"><thead><tr><th>Metrik</th><th>AS (Wert, 95%-KI)</th><th>${t2Name} (Wert, 95%-KI)</th></tr></thead><tbody>`;
            metrics.forEach(key => {
                 comparisonTableHTML += `<tr><td>${metricNames[key]}</td><td>${fCI(statsAS[key], key)}</td><td>${fCI(statsT2[key], key)}</td></tr>`;
            });
            comparisonTableHTML += `</tbody></table></div>`;

            let testsTableHTML = `<table class="table table-sm table-striped small mb-0" id="praes-as-vs-t2-test-table"><thead><tr><th>Test</th><th>Statistik</th><th>p-Wert</th></tr></thead><tbody>`;
            testsTableHTML += `<tr><td>McNemar (Acc)</td><td>${utils.formatNumber(vergleich.mcnemar?.statistic, 3, na)}</td><td>${utils.getPValueText(vergleich.mcnemar?.pValue)} ${utils.getStatisticalSignificanceSymbol(vergleich.mcnemar?.pValue)}</td></tr>`;
            testsTableHTML += `<tr><td>DeLong (AUC)</td><td>Z=${utils.formatNumber(vergleich.delong?.Z, 3, na)}</td><td>${utils.getPValueText(vergleich.delong?.pValue)} ${utils.getStatisticalSignificanceSymbol(vergleich.delong?.pValue)}</td></tr>`;
            testsTableHTML += `</tbody></table>`;
            
            resultsHTML = `
                <div class="row g-3">
                    <div class="col-lg-7"><div class="card h-100"><div class="card-header">Vergleichs-Chart</div><div class="card-body p-1"><div id="praes-comp-chart-container" class="praes-chart-container"></div></div></div></div>
                    <div class="col-lg-5 d-flex flex-column">
                         <div class="card mb-3"><div class="card-header card-header-sm">Details zur T2-Basis</div><div class="card-body p-2">${comparisonInfoHTML}</div></div>
                         <div class="card mb-3"><div class="card-header card-header-sm">Vergleichsmetriken</div><div class="card-body p-0">${comparisonTableHTML}</div></div>
                         <div class="card flex-grow-1"><div class="card-header card-header-sm">Statistische Tests</div><div class="card-body p-0">${testsTableHTML}</div></div>
                    </div>
                </div>`;
        } else {
             resultsHTML = `<div class="alert alert-info">Bitte wählen Sie eine Vergleichsbasis für das Kollektiv '<strong>${displayKollektivForComparison}</strong>'.</div>`;
        }
        
        return `<div class="row mb-4"><div class="col-12"><h4 class="text-center mb-3">Vergleich: Avocado Sign vs. T2-Kriterien</h4><div class="row justify-content-center"><div class="col-md-9 col-lg-7"><div class="input-group input-group-sm"><label class="input-group-text" for="praes-study-select">T2-Vergleichsbasis:</label><select class="form-select" id="praes-study-select"><option value="" ${!selectedStudyId ? 'selected' : ''} disabled>-- Bitte wählen --</option>${appliedOptionHTML}<option value="" disabled>--- Literatur ---</option>${studyOptionsHTML}</select></div></div></div></div></div><div id="praesentation-as-vs-t2-results">${resultsHTML}</div>`;
    }

    function createPresentationTabContent(view, presentationData, selectedStudyId = null, currentGlobalKollektiv = 'Gesamt') {
        let viewSelectorHTML = `
            <div class="row mb-4">
                <div class="col-12 d-flex justify-content-center">
                    <div class="btn-group btn-group-sm" role="group">
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="ansicht-as-pur" value="as-pur" ${view === 'as-pur' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary" for="ansicht-as-pur">AS Performance</label>
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="ansicht-as-vs-t2" value="as-vs-t2" ${view === 'as-vs-t2' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary" for="ansicht-as-vs-t2">AS vs. T2 Vergleich</label>
                    </div>
                </div>
            </div>`;

        let contentHTML = '';
        if (view === 'as-pur') {
            contentHTML = _createPresentationView_ASPUR_HTML(presentationData);
        } else if (view === 'as-vs-t2') {
            contentHTML = _createPresentationView_ASvsT2_HTML(presentationData, selectedStudyId, currentGlobalKollektiv);
        } else {
            contentHTML = '<div class="alert alert-warning">Unbekannte Ansicht.</div>';
        }
        return viewSelectorHTML + `<div id="praesentation-content-area">${contentHTML}</div>`;
    }

    return Object.freeze({
        createPresentationTabContent
    });

})();
