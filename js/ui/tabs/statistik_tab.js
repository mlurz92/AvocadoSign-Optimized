const statistikTab = (() => {

    function _getTooltipContent(key, metricData, methode, kollektivName) {
        const description = tooltip.getMetricDescriptionHTML(key, methode);
        const interpretation = tooltip.getMetricInterpretationHTML(key, metricData, methode, kollektivName);
        return `${description}<hr class='my-1'>${interpretation}`;
    }

    function _createGueteContent(stats, methode, kollektivName) {
        if (!stats || !stats.matrix) return '<p class="text-muted small p-3">Keine Gütedaten verfügbar.</p>';
        const { matrix } = stats;
        const matrixId = `matrix-${methode}-${kollektivName.replace(/\s/g, '')}`;
        const rocId = `roc-${methode}-${kollektivName.replace(/\s/g, '')}`;
        
        let matrixHTML = `<div class="col-md-5" id="${matrixId}"></div>`;
        let rocHTML = `<div class="col-md-7" id="${rocId}"></div>`;
        
        const metricsHTML = `
            <div class="col-12 mt-3">
                <table class="table table-sm table-striped small">
                    <thead><tr><th>Metrik</th><th>Wert (95% KI)</th></tr></thead>
                    <tbody>
                        <tr><td>Sensitivität</td><td data-tippy-content="${_getTooltipContent('sens', stats.sens, methode, kollektivName)}">${formatCI(stats.sens.value, stats.sens.ci.lower, stats.sens.ci.upper, 1, true)}</td></tr>
                        <tr><td>Spezifität</td><td data-tippy-content="${_getTooltipContent('spez', stats.spez, methode, kollektivName)}">${formatCI(stats.spez.value, stats.spez.ci.lower, stats.spez.ci.upper, 1, true)}</td></tr>
                        <tr><td>PPV</td><td data-tippy-content="${_getTooltipContent('ppv', stats.ppv, methode, kollektivName)}">${formatCI(stats.ppv.value, stats.ppv.ci.lower, stats.ppv.ci.upper, 1, true)}</td></tr>
                        <tr><td>NPV</td><td data-tippy-content="${_getTooltipContent('npv', stats.npv, methode, kollektivName)}">${formatCI(stats.npv.value, stats.npv.ci.lower, stats.npv.ci.upper, 1, true)}</td></tr>
                        <tr><td>Accuracy</td><td data-tippy-content="${_getTooltipContent('acc', stats.acc, methode, kollektivName)}">${formatCI(stats.acc.value, stats.acc.ci.lower, stats.acc.ci.upper, 1, true)}</td></tr>
                        <tr><td>AUC</td><td data-tippy-content="${_getTooltipContent('auc', stats.auc, methode, kollektivName)}">${formatCI(stats.auc.value, stats.auc.ci.lower, stats.auc.ci.upper, 3, false)}</td></tr>
                    </tbody>
                </table>
            </div>`;

        return `<div class="row align-items-center">${matrixHTML}${rocHTML}${metricsHTML}</div>`;
    }

    function _createVergleichContent(stats, kollektivName, t2ShortName = 'T2') {
        if (!stats) return '<p class="text-muted small p-3">Keine Vergleichsdaten verfügbar.</p>';
        const pValMcNemar = formatNumber(stats.mcnemar?.pValue, 3, '--');
        const pValDeLong = formatNumber(stats.delong?.pValue, 3, '--');
        return `
            <table class="table table-sm small">
                <thead><tr><th>Test</th><th>Statistik</th><th>p-Wert</th></tr></thead>
                <tbody>
                    <tr><td>McNemar (Accuracy)</td><td>${formatNumber(stats.mcnemar?.statistic, 2)}</td><td data-tippy-content="${tooltip.getTestInterpretationHTML('mcnemar', stats.mcnemar, kollektivName, t2ShortName)}">${pValMcNemar}</td></tr>
                    <tr><td>DeLong (AUC)</td><td>Z = ${formatNumber(stats.delong?.Z, 2)}</td><td data-tippy-content="${tooltip.getTestInterpretationHTML('delong', stats.delong, kollektivName, t2ShortName)}">${pValDeLong}</td></tr>
                </tbody>
            </table>`;
    }
    
    function render(data, layout, kollektiv1, kollektiv2, globalKollektiv) {
        const container = document.getElementById(CONSTANTS.SELECTORS.STATISTIK_TAB_PANE);
        if (!container) return;

        const header = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="mb-0">Statistische Auswertung</h2>
                <div>
                    <button id="${CONSTANTS.SELECTORS.STATISTIK_TOGGLE_VERGLEICH.substring(1)}" class="btn btn-sm btn-outline-secondary">
                        ${layout === 'einzel' ? 'Einzelansicht' : 'Vergleichsansicht'}
                    </button>
                    <div id="${CONSTANTS.SELECTORS.STATISTIK_KOLLEKTIV_CONTAINER_1.substring(1)}" class="d-inline-block ${layout === 'einzel' ? 'd-none' : ''}">
                        <select id="${CONSTANTS.SELECTORS.STATISTIK_KOLLEKTIV_SELECT_1.substring(1)}" class="form-select form-select-sm d-inline-block w-auto ms-2"></select>
                    </div>
                    <div id="${CONSTANTS.SELECTORS.STATISTIK_KOLLEKTIV_CONTAINER_2.substring(1)}" class="d-inline-block ${layout === 'einzel' ? 'd-none' : ''}">
                        <select id="${CONSTANTS.SELECTORS.STATISTIK_KOLLEKTIV_SELECT_2.substring(1)}" class="form-select form-select-sm d-inline-block w-auto ms-2"></select>
                    </div>
                </div>
            </div>
            <div id="statistik-content" class="row g-4"></div>`;
        container.innerHTML = header;

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
            
            if (!stats) {
                col.innerHTML = `<h4>${kollektivName}</h4><p class="text-muted">Keine Daten für dieses Kollektiv.</p>`;
                contentArea.appendChild(col);
                return;
            }

            let cardsHTML = `<h4>${kollektivName} (N=${stats.deskriptiv.anzahlPatienten})</h4>`;
            cardsHTML += commonComponents.createCard(`deskriptiv-${index}`, `Deskriptive Statistik`, uiViewLogic.createDeskriptiveStatistikContentHTML(stats));
            cardsHTML += commonComponents.createCard(`guete-as-${index}`, `Güte Avocado Sign`, _createGueteContent(stats.gueteAS, 'AS', kollektivName));
            cardsHTML += commonComponents.createCard(`guete-t2-${index}`, `Güte T2-Kriterien (angewandt)`, _createGueteContent(stats.gueteT2, 'T2', kollektivName));
            cardsHTML += commonComponents.createCard(`vergleich-as-t2-${index}`, `Vergleich AS vs. T2`, _createVergleichContent(stats.vergleichASvsT2, kollektivName));
            
            col.innerHTML = cardsHTML;
            contentArea.appendChild(col);
            
            charts.renderConfusionMatrix(stats.gueteAS.matrix, `matrix-AS-${kollektivName.replace(/\s/g, '')}`);
            charts.renderROCCurve(stats.rocAS, `roc-AS-${kollektivName.replace(/\s/g, '')}`, { auc: stats.gueteAS.auc.value });
            charts.renderConfusionMatrix(stats.gueteT2.matrix, `matrix-T2-${kollektivName.replace(/\s/g, '')}`);
            charts.renderROCCurve(stats.rocT2, `roc-T2-${kollektivName.replace(/\s/g, '')}`, { auc: stats.gueteT2.auc.value, color: APP_CONFIG.CHART_SETTINGS.T2_COLOR });
        });
    }

    return Object.freeze({
        render
    });
})();
