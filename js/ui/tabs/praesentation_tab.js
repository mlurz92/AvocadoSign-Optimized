const praesentationTab = (() => {

    function _createViewSelectorHTML(view) {
        const tooltipText = TEXT_CONFIG.de.tooltips.praesentation.viewSelect;
        return `
            <div class="row mb-4">
                <div class="col-12 d-flex justify-content-center">
                    <div class="btn-group btn-group-sm" role="group" aria-label="Präsentationsansicht Auswahl" data-tippy-content="${tooltipText}">
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="ansicht-as-pur" value="as-pur" ${view === 'as-pur' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary praes-view-btn" for="ansicht-as-pur"><i class="fas fa-star me-1"></i> Avocado Sign Performance</label>
                        
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="ansicht-as-vs-t2" value="as-vs-t2" ${view === 'as-vs-t2' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary praes-view-btn" for="ansicht-as-vs-t2"><i class="fas fa-exchange-alt me-1"></i> AS vs. T2 Vergleich</label>
                    </div>
                </div>
            </div>`;
    }
    
    function _createASPURExportButtons() {
        const perfCSVTooltip = TEXT_CONFIG.de.tooltips.praesentation.downloadPerformanceCSV;
        const perfMDTooltip = TEXT_CONFIG.de.tooltips.praesentation.downloadPerformanceMD;
        
        return `
            <button class="btn btn-sm btn-outline-secondary me-1" id="download-performance-as-pur-csv" data-tippy-content="${perfCSVTooltip}"><i class="fas fa-file-csv me-1"></i>CSV</button>
            <button class="btn btn-sm btn-outline-secondary" id="download-performance-as-pur-md" data-tippy-content="${perfMDTooltip}"><i class="fab fa-markdown me-1"></i>MD</button>
        `;
    }
    
    function _createASPURView(presentationData) {
        const { statsGesamt, statsDirektOP, statsNRCT, kollektiv, statsCurrentKollektiv } = presentationData;
        const kollektives = [CONSTANTS.KOLEKTIV.GESAMT, CONSTANTS.KOLEKTIV.DIREKT_OP, CONSTANTS.KOLEKTIV.NRCT];
        const statsMap = { [CONSTANTS.KOLEKTIV.GESAMT]: statsGesamt, [CONSTANTS.KOLEKTIV.DIREKT_OP]: statsDirektOP, [CONSTANTS.KOLEKTIV.NRCT]: statsNRCT };
        const currentKollektivName = getKollektivDisplayName(kollektiv);

        const createPerfTableRow = (stats, kollektivKey) => {
            const kollektivDisplayName = getKollektivDisplayName(kollektivKey);
            const na = '--';
            const nPat = stats?.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : 0;
            const rowData = [
                `<strong>${kollektivDisplayName}</strong> (N=${nPat})`,
                formatCI(stats?.sens?.value, stats?.sens?.ci?.lower, stats?.sens?.ci?.upper, 1, true, na),
                formatCI(stats?.spez?.value, stats?.spez?.ci?.lower, stats?.spez?.ci?.upper, 1, true, na),
                formatCI(stats?.ppv?.value, stats?.ppv?.ci?.lower, stats?.ppv?.ci?.upper, 1, true, na),
                formatCI(stats?.npv?.value, stats?.npv?.ci?.lower, stats?.npv?.ci?.upper, 1, true, na),
                formatCI(stats?.acc?.value, stats?.acc?.ci?.lower, stats?.acc?.ci?.upper, 1, true, na),
                formatCI(stats?.auc?.value, stats?.auc?.ci?.lower, stats?.auc?.ci?.upper, 3, false, na)
            ];
            return `<tr>${rowData.map(td => `<td>${td}</td>`).join('')}</tr>`;
        };

        const tableHeader = `<thead><tr><th>Kollektiv</th><th>Sens. (95% KI)</th><th>Spez. (95% KI)</th><th>PPV (95% KI)</th><th>NPV (95% KI)</th><th>Acc. (95% KI)</th><th>AUC (95% KI)</th></tr></thead>`;
        const tableBody = `<tbody>${kollektives.map(k => createPerfTableRow(statsMap[k], k)).join('')}</tbody>`;
        const tableContent = `<div class="table-responsive"><table class="table table-striped table-hover table-sm small mb-0">${tableHeader}${tableBody}</table></div>`;
        const tableCard = commonComponents.createCard('praes-as-pur-table-card', 'Performance Avocado Sign vs. N-Status', tableContent, { footerContent: _createASPURExportButtons(), bodyClass: 'p-0' });

        const chartCard = commonComponents.createCard('praes-as-pur-chart-card', `Visualisierung für Kollektiv: ${getKollektivDisplayName(kollektiv)}`, `<div id="praes-as-pur-perf-chart" class="praes-chart-container"></div>`);

        return `<div class="row g-3"><div class="col-12">${tableCard}</div><div class="col-lg-8 offset-lg-2">${chartCard}</div></div>`;
    }

    function _createASvsT2ExportButtons() {
        return `
            <button class="btn btn-sm btn-outline-secondary me-1" id="download-performance-as-vs-t2-csv" data-tippy-content="${TEXT_CONFIG.de.tooltips.praesentation.downloadPerformanceCSV}"><i class="fas fa-file-csv me-1"></i>Metriken (CSV)</button>
            <button class="btn btn-sm btn-outline-secondary me-1" id="download-comp-table-as-vs-t2-md" data-tippy-content="${TEXT_CONFIG.de.tooltips.praesentation.downloadCompTableMD}"><i class="fab fa-markdown me-1"></i>Metriken (MD)</button>
            <button class="btn btn-sm btn-outline-secondary" id="download-tests-as-vs-t2-md" data-tippy-content="${TEXT_CONFIG.de.tooltips.praesentation.downloadCompTestsMD}"><i class="fab fa-markdown me-1"></i>Tests (MD)</button>
        `;
    }

    function _createASvsT2View(presentationData, selectedStudyId) {
        const { statsAS, statsT2, vergleich, comparisonCriteriaSet, kollektivForComparison, t2CriteriaLabelShort } = presentationData;

        const infoCardContent = 'Bitte wählen Sie eine T2-Vergleichsbasis.';
        const infoCard = commonComponents.createCard('praes-t2-basis-info-card', 'Informationen zur T2-Vergleichsbasis', infoCardContent, {headerClass: 'card-header-sm'});

        const metricsTableBody = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'].map(key => {
            const metricName = TEXT_CONFIG.de.statMetrics[key]?.name || key.toUpperCase();
            const valAS = formatCI(statsAS?.[key]?.value, statsAS?.[key]?.ci?.lower, statsAS?.[key]?.ci?.upper, key === 'auc' ? 3 : 1, key !== 'auc', '--');
            const valT2 = formatCI(statsT2?.[key]?.value, statsT2?.[key]?.ci?.lower, statsT2?.[key]?.ci?.upper, key === 'auc' ? 3 : 1, key !== 'auc', '--');
            return `<tr><td>${metricName}</td><td>${valAS}</td><td>${valT2}</td></tr>`;
        }).join('');
        const metricsTable = `<div class="table-responsive"><table class="table table-sm small"><thead><tr><th>Metrik</th><th>AS (95% KI)</th><th>${t2CriteriaLabelShort} (95% KI)</th></tr></thead><tbody>${metricsTableBody}</tbody></table></div>`;
        const metricsCard = commonComponents.createCard('praes-metrics-card', `Vergleichsmetriken (Kollektiv: ${getKollektivDisplayName(kollektivForComparison)})`, metricsTable, { bodyClass: 'p-0', footerContent: _createASvsT2ExportButtons()});
        
        const pValMcNemar = getPValueText(vergleich?.mcnemar?.pValue);
        const pValDeLong = getPValueText(vergleich?.delong?.pValue);
        const testsTable = `
            <table class="table table-sm small">
                <tbody>
                    <tr><td data-tippy-content="${tooltip.getTestDescriptionHTML('mcnemar', t2CriteriaLabelShort)}">McNemar (Accuracy)</td><td>p = ${pValMcNemar}</td></tr>
                    <tr><td data-tippy-content="${tooltip.getTestDescriptionHTML('delong', t2CriteriaLabelShort)}">DeLong (AUC)</td><td>p = ${pValDeLong}</td></tr>
                </tbody>
            </table>`;
        const testsCard = commonComponents.createCard('praes-tests-card', 'Statistische Tests', testsTable, {bodyClass: 'p-2'});

        const chartCard = commonComponents.createCard('praes-chart-card', 'Vergleichs-Chart', `<div id="praes-comp-chart-container" class="praes-chart-container"></div>`);
        
        const studySets = studyT2CriteriaManager.getAllStudyCriteriaSets();
        const appliedOptionHTML = `<option value="${CONSTANTS.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID}" ${selectedStudyId === CONSTANTS.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID ? 'selected' : ''}>-- Angewandte Kriterien --</option>`;
        const studyOptionsHTML = studySets.map(set => `<option value="${set.id}" ${selectedStudyId === set.id ? 'selected' : ''}>${set.name}</option>`).join('');

        return `
            <div class="row mb-3">
                <div class="col-md-8 offset-md-2">
                    <div class="input-group input-group-sm">
                        <label class="input-group-text" for="${CONSTANTS.SELECTORS.PRAESENTATION_STUDY_SELECT.substring(1)}">T2-Vergleichsbasis:</label>
                        <select class="form-select" id="${CONSTANTS.SELECTORS.PRAESENTATION_STUDY_SELECT.substring(1)}">
                            <option value="" disabled ${!selectedStudyId ? 'selected' : ''}>Bitte wählen</option>
                            ${appliedOptionHTML}
                            <option value="" disabled>--- Literatur ---</option>
                            ${studyOptionsHTML}
                        </select>
                    </div>
                </div>
            </div>
            <div class="row g-3">
                <div class="col-lg-6">${infoCard}</div>
                <div class="col-lg-6">${testsCard}</div>
                <div class="col-12">${metricsCard}</div>
                <div class="col-lg-8 offset-lg-2">${chartCard}</div>
            </div>
        `;
    }

    function render(view, presentationData, selectedStudyId, currentGlobalKollektiv) {
        let contentHTML;
        const viewSelectorHTML = _createViewSelectorHTML(view);

        if (view === 'as-pur') {
            contentHTML = _createASPURView(presentationData);
        } else if (view === 'as-vs-t2') {
            contentHTML = _createASvsT2View(presentationData, selectedStudyId);
        } else {
            contentHTML = '<div class="alert alert-warning">Unbekannte Ansicht ausgewählt.</div>';
        }
        
        return viewSelectorHTML + `<div id="praesentation-content-area">${contentHTML}</div>`;
    }

    return Object.freeze({
        render
    });
})();
