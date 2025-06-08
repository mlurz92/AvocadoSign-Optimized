const statistikTab = (() => {

    function _createGueteContent(stats, methode, kollektivName, index) {
        if (!stats || !stats.matrix) return '<p class="text-muted small p-3">Keine Gütedaten verfügbar.</p>';
        
        const matrixId = `matrix-${methode}-${index}`;
        const rocId = `roc-${methode}-${index}`;
        
        const metricsHTML = `
            <div class="col-12 mt-2">
                <div class="table-responsive">
                    <table class="table table-sm table-striped small mb-0">
                        <thead class="visually-hidden"><tr><th>Metrik</th><th>Wert</th></tr></thead>
                        <tbody>
                            <tr><td>Sensitivität</td><td data-tippy-content="${tooltip.getMetricInterpretationHTML('sens', stats.sens, methode, kollektivName)}">${formatCI(stats.sens.value, stats.sens.ci.lower, stats.sens.ci.upper, 1, true)}</td></tr>
                            <tr><td>Spezifität</td><td data-tippy-content="${tooltip.getMetricInterpretationHTML('spez', stats.spez, methode, kollektivName)}">${formatCI(stats.spez.value, stats.spez.ci.lower, stats.spez.ci.upper, 1, true)}</td></tr>
                            <tr><td>PPV</td><td data-tippy-content="${tooltip.getMetricInterpretationHTML('ppv', stats.ppv, methode, kollektivName)}">${formatCI(stats.ppv.value, stats.ppv.ci.lower, stats.ppv.ci.upper, 1, true)}</td></tr>
                            <tr><td>NPV</td><td data-tippy-content="${tooltip.getMetricInterpretationHTML('npv', stats.npv, methode, kollektivName)}">${formatCI(stats.npv.value, stats.npv.ci.lower, stats.npv.ci.upper, 1, true)}</td></tr>
                            <tr><td>Accuracy</td><td data-tippy-content="${tooltip.getMetricInterpretationHTML('acc', stats.acc, methode, kollektivName)}">${formatCI(stats.acc.value, stats.acc.ci.lower, stats.acc.ci.upper, 1, true)}</td></tr>
                            <tr><td>AUC</td><td data-tippy-content="${tooltip.getMetricInterpretationHTML('auc', stats.auc, methode, kollektivName)}">${formatCI(stats.auc.value, stats.auc.ci.lower, stats.auc.ci.upper, 3, false)}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>`;

        return `<div class="row align-items-center g-2"><div class="col-md-5" id="${matrixId}" style="min-height: 180px;"></div><div class="col-md-7" id="${rocId}" style="min-height: 180px;"></div>${metricsHTML}</div>`;
    }

    function _createVergleichContent(stats, kollektivName, t2ShortName = 'T2') {
        if (!stats) return '<p class="text-muted small p-3">Keine Vergleichsdaten verfügbar.</p>';
        const pValMcNemar = getPValueText(stats.mcnemar?.pValue);
        const pValDeLong = getPValueText(stats.delong?.pValue);
        return `
            <div class="table-responsive">
                <table class="table table-sm small mb-0">
                    <thead><tr><th>Test</th><th>Statistik</th><th>p-Wert</th></tr></thead>
                    <tbody>
                        <tr><td data-tippy-content="${tooltip.getTestDescriptionHTML('mcnemar', t2ShortName)}">McNemar (Accuracy)</td><td>${formatNumber(stats.mcnemar?.statistic, 2, 'N/A')}</td><td data-tippy-content="${tooltip.getTestInterpretationHTML('mcnemar', stats.mcnemar, kollektivName, t2ShortName)}">${pValMcNemar}</td></tr>
                        <tr><td data-tippy-content="${tooltip.getTestDescriptionHTML('delong', t2ShortName)}">DeLong (AUC)</td><td>Z = ${formatNumber(stats.delong?.Z, 2, 'N/A')}</td><td data-tippy-content="${tooltip.getTestInterpretationHTML('delong', stats.delong, kollektivName, t2ShortName)}">${pValDeLong}</td></tr>
                    </tbody>
                </table>
            </div>`;
    }
    
    function render(data, layout, kollektiv1, kollektiv2, globalKollektiv) {
        const container = document.getElementById(CONSTANTS.SELECTORS.STATISTIK_TAB_PANE.substring(1));
        if (!container) return;

        const kollektivOptions = [CONSTANTS.KOLEKTIV.GESAMT, CONSTANTS.KOLEKTIV.DIREKT_OP, CONSTANTS.KOLEKTIV.NRCT]
            .map(k => `<option value="${k}">${getKollektivDisplayName(k)}</option>`).join('');

        const header = `
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h2 class="mb-0 me-auto">Statistische Auswertung</h2>
                <div class="d-flex align-items-center gap-2">
                    <div id="${CONSTANTS.SELECTORS.STATISTIK_KOLLEKTIV_CONTAINER_1.substring(1)}" class="${layout === 'einzel' ? 'd-none' : ''}">
                        <select id="${CONSTANTS.SELECTORS.STATISTIK_KOLLEKTIV_SELECT_1.substring(1)}" class="form-select form-select-sm">${kollektivOptions}</select>
                    </div>
                    <div id="${CONSTANTS.SELECTORS.STATISTIK_KOLLEKTIV_CONTAINER_2.substring(1)}" class="${layout === 'einzel' ? 'd-none' : ''}">
                        <select id="${CONSTANTS.SELECTORS.STATISTIK_KOLLEKTIV_SELECT_2.substring(1)}" class="form-select form-select-sm">${kollektivOptions}</select>
                    </div>
                    <button id="${CONSTANTS.SELECTORS.STATISTIK_TOGGLE_VERGLEICH.substring(1)}" class="btn btn-sm btn-outline-secondary">
                        <i class="fas ${layout === 'einzel' ? 'fa-user-cog' : 'fa-users-cog'} me-1"></i>
                        ${layout === 'einzel' ? 'Einzelansicht' : 'Vergleichsansicht'}
                    </button>
                </div>
            </div>
            <div id="statistik-content" class="row g-4"></div>`;
        container.innerHTML = header;

        document.getElementById(CONSTANTS.SELECTORS.STATISTIK_KOLLEKTIV_SELECT_1.substring(1)).value = kollektiv1;
        document.getElementById(CONSTANTS.SELECTORS.STATISTIK_KOLLEKTIV_SELECT_2.substring(1)).value = kollektiv2;
        
        const contentArea = document.getElementById('statistik-content');
        const kollektiveToRender = layout === 'einzel' ? [globalKollektiv] : [kollektiv1, kollektiv2];

        kollektiveToRender.forEach((kolId, index) => {
            const kollektivData = dataManager.filterDataByKollektiv(data, kolId);
            const kollektivName = getKollektivDisplayName(kolId);
            const col = document.createElement('div');
            col.className = layout === 'einzel' ? 'col-12' : 'col-lg-6';
            
            const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
            const appliedLogic = t2CriteriaManager.getAppliedLogic();
            const evaluatedData = t2CriteriaManager.evaluateDataset(kollektivData, appliedCriteria, appliedLogic);
            const stats = statisticsService.calculateAllStatsForPublication(evaluatedData, appliedCriteria, appliedLogic, {})[kolId];
            
            let cardsHTML = `<h4 class="mb-3 border-bottom pb-2">${kollektivName} (N=${stats?.deskriptiv.anzahlPatienten || 0})</h4>`;
            
            if (!stats) {
                cardsHTML += `<p class="text-muted">Keine Daten für dieses Kollektiv.</p>`;
                col.innerHTML = cardsHTML;
                contentArea.appendChild(col);
                return;
            }

            cardsHTML += commonComponents.createCard(`deskriptiv-${index}`, `Deskriptive Statistik`, uiViewLogic.createDeskriptiveStatistikContentHTML(stats));
            cardsHTML += commonComponents.createCard(`guete-as-${index}`, `Güte Avocado Sign`, _createGueteContent(stats.gueteAS, 'AS', kollektivName, index));
            cardsHTML += commonComponents.createCard(`guete-t2-${index}`, `Güte T2-Kriterien (angewandt)`, _createGueteContent(stats.gueteT2_angewandt, 'T2', kollektivName, index));
            cardsHTML += commonComponents.createCard(`vergleich-as-t2-${index}`, `Vergleich AS vs. T2`, _createVergleichContent(stats.vergleichASvsT2_angewandt, kollektivName));
            
            col.innerHTML = cardsHTML;
            contentArea.appendChild(col);
            
            setTimeout(() => {
                charts.renderConfusionMatrix(stats.gueteAS.matrix, `#matrix-AS-${index}`);
                charts.renderROCCurve(stats.rocAS, `#roc-AS-${index}`, { auc: stats.gueteAS.auc.value });
                charts.renderConfusionMatrix(stats.gueteT2_angewandt.matrix, `#matrix-T2-${index}`);
                charts.renderROCCurve(stats.rocT2, `#roc-T2-${index}`, { auc: stats.gueteT2_angewandt.auc.value, color: APP_CONFIG.CHART_SETTINGS.T2_COLOR });
            }, 0);
        });
    }

    return Object.freeze({
        render
    });
})();
