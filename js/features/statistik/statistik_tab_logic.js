const statistikTabLogic = (() => {

    function renderStatistikContent(processedData, appliedCriteria, appliedLogic, layout, kollektiv1Id, kollektiv2Id, currentGlobalKollektiv) {
        let html = '<div class="row g-3">';
        const chartsToRender = [];
        const downloadButtonsConfig = APP_CONFIG.EXPORT_SETTINGS.DEFAULT_CHART_DOWNLOAD_BUTTONS || [
            { id: 'dl-chart-png', icon: 'fa-image', tooltip: 'Als PNG herunterladen', format: 'png' },
            { id: 'dl-chart-svg', icon: 'fa-file-code', tooltip: 'Als SVG herunterladen', format: 'svg' }
        ];

        const renderSingleKollektivStats = (kollektivId, indexSuffix = '0') => {
            const kollektivData = dataProcessor.filterDataByKollektiv(processedData, kollektivId);
            if (!kollektivData || kollektivData.length === 0) {
                return `<div class="col-12"><div class="alert alert-warning">Keine Daten für Kollektiv '${getKollektivDisplayName(kollektivId)}' verfügbar.</div></div>`;
            }

            const evaluatedKollektivData = t2CriteriaManager.evaluateDataset(cloneDeep(kollektivData), appliedCriteria, appliedLogic);
            const stats = statisticsService.calculateStatsForExport(evaluatedKollektivData, appliedCriteria, appliedLogic);
            if (!stats) return `<div class="col-12"><div class="alert alert-danger">Fehler bei der Statistikberechnung für Kollektiv '${getKollektivDisplayName(kollektivId)}'.</div></div>`;

            let kollektivHTML = `<div class="col-12"><h2>Statistik für Kollektiv: ${getKollektivDisplayName(kollektivId)} (N=${evaluatedKollektivData.length})</h2></div>`;

            const deskriptivContent = uiViewLogic.createDeskriptiveStatistikContentHTML(stats.deskriptiv, indexSuffix, getKollektivDisplayName(kollektivId));
            kollektivHTML += uiComponents.createStatistikCard(`deskriptiv-stats-${indexSuffix}`, `Deskriptive Statistik`, deskriptivContent, true, 'deskriptiveStatistik', downloadButtonsConfig.map(b => ({...b, id: `dl-deskriptiv-${indexSuffix}-${b.format}`})), `table-deskriptiv-demographie-${indexSuffix}`);
            chartsToRender.push({
                type: 'ageDistribution', data: stats.deskriptiv.alterData, targetId: `chart-stat-age-${indexSuffix}`,
                options: { margin: { bottom: 40, left: 50 }, useCompactMargins: false }
            });
            chartsToRender.push({
                type: 'pie', data: [{label:UI_TEXTS.legendLabels.male, value: stats.deskriptiv.geschlecht?.m || 0}, {label:UI_TEXTS.legendLabels.female, value: stats.deskriptiv.geschlecht?.f || 0}], targetId: `chart-stat-gender-${indexSuffix}`,
                options: { useCompactMargins: true, legendBelow: true, innerRadiusFactor: 0, outerRadiusFactor: 0.8, cornerRadius: 0, labelThreshold: 0.08 }
            });

            const gueteASContent = uiViewLogic.createGueteContentHTML(stats.gueteAS, 'AS', getKollektivDisplayName(kollektivId));
            kollektivHTML += uiComponents.createStatistikCard(`guete-as-${indexSuffix}`, `Diagnostische Güte: Avocado Sign (AS) vs. N`, gueteASContent, false, 'diagnostischeGueteAS', downloadButtonsConfig.map(b => ({...b, id: `dl-guete-as-${indexSuffix}-${b.format}`})), `table-guete-metrics-AS-${getKollektivDisplayName(kollektivId).replace(/\s+/g, '_')}`);
            chartsToRender.push({
                 type: 'rocCurve', data: [{fpr: 0, tpr: 0}, {fpr: 1 - (stats.gueteAS?.spez?.value ?? 0), tpr: stats.gueteAS?.sens?.value ?? 0}, {fpr: 1, tpr: 1}],
                 targetId: `roc-as-${indexSuffix}`, options: { aucValue: stats.gueteAS?.auc?.value, aucCI: stats.gueteAS?.auc?.ci, lineColor: APP_CONFIG.CHART_SETTINGS.AS_COLOR, showPoints: true, margin: {bottom: 40, left: 50}},
                 title: `ROC Kurve: AS vs. N (${getKollektivDisplayName(kollektivId)})`
            });


            const gueteT2Content = uiViewLogic.createGueteContentHTML(stats.gueteT2, 'T2', getKollektivDisplayName(kollektivId));
            kollektivHTML += uiComponents.createStatistikCard(`guete-t2-${indexSuffix}`, `Diagnostische Güte: T2 (angewandt) vs. N`, gueteT2Content, false, 'diagnostischeGueteT2', downloadButtonsConfig.map(b => ({...b, id: `dl-guete-t2-${indexSuffix}-${b.format}`})), `table-guete-metrics-T2-${getKollektivDisplayName(kollektivId).replace(/\s+/g, '_')}`);
            chartsToRender.push({
                 type: 'rocCurve', data: [{fpr: 0, tpr: 0}, {fpr: 1 - (stats.gueteT2?.spez?.value ?? 0), tpr: stats.gueteT2?.sens?.value ?? 0}, {fpr: 1, tpr: 1}],
                 targetId: `roc-t2-${indexSuffix}`, options: { aucValue: stats.gueteT2?.auc?.value, aucCI: stats.gueteT2?.auc?.ci, lineColor: APP_CONFIG.CHART_SETTINGS.T2_COLOR, showPoints: true, margin: {bottom: 40, left: 50}},
                 title: `ROC Kurve: T2 vs. N (${getKollektivDisplayName(kollektivId)})`
            });

            const vergleichContent = uiViewLogic.createVergleichContentHTML(stats.vergleichASvsT2, getKollektivDisplayName(kollektivId));
            kollektivHTML += uiComponents.createStatistikCard(`vergleich-as-t2-${indexSuffix}`, `Statistischer Vergleich: AS vs. T2 (angewandt)`, vergleichContent, false, 'statistischerVergleichASvsT2', downloadButtonsConfig.map(b => ({...b, id: `dl-vergleich-${indexSuffix}-${b.format}`})), `table-vergleich-as-vs-t2-${getKollektivDisplayName(kollektivId).replace(/\s+/g, '_')}`);
            const comparisonChartData = [
                 { metric: 'Sens', AS: stats.gueteAS?.sens?.value ?? 0, T2: stats.gueteT2?.sens?.value ?? 0 },
                 { metric: 'Spez', AS: stats.gueteAS?.spez?.value ?? 0, T2: stats.gueteT2?.spez?.value ?? 0 },
                 { metric: 'PPV', AS: stats.gueteAS?.ppv?.value ?? 0, T2: stats.gueteT2?.ppv?.value ?? 0 },
                 { metric: 'NPV', AS: stats.gueteAS?.npv?.value ?? 0, T2: stats.gueteT2?.npv?.value ?? 0 },
                 { metric: 'Acc', AS: stats.gueteAS?.acc?.value ?? 0, T2: stats.gueteT2?.acc?.value ?? 0 },
                 { metric: 'AUC', AS: stats.gueteAS?.auc?.value ?? 0, T2: stats.gueteT2?.auc?.value ?? 0 }
            ];
            chartsToRender.push({ type: 'comparisonBar', data: comparisonChartData, targetId: `stat-comp-bar-${indexSuffix}`, options: { margin: { bottom: 60, left: 50 } }, label: 'T2 (angewandt)' });


            const assoziationContent = uiViewLogic.createAssoziationContentHTML(stats.assoziation, getKollektivDisplayName(kollektivId), appliedCriteria);
            kollektivHTML += uiComponents.createStatistikCard(`assoziation-${indexSuffix}`, `Assoziation: Merkmale vs. N-Status`, assoziationContent, false, 'assoziationEinzelkriterien', downloadButtonsConfig.map(b => ({...b, id: `dl-assoziation-${indexSuffix}-${b.format}`})), `table-assoziation-${getKollektivDisplayName(kollektivId).replace(/\s+/g, '_')}`);

            const criteriaComparisonData = studyT2CriteriaManager.getAllStudyCriteriaSets()
                .filter(set => set.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID || set.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID || (set.applicableKollektiv === kollektivId || set.applicableKollektiv === 'Gesamt'))
                .map(set => {
                    let perfData;
                    if (set.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) {
                        perfData = stats.gueteAS;
                    } else if (set.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                        perfData = stats.gueteT2;
                    } else {
                        const evaluatedForStudySet = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(kollektivData), set);
                        perfData = statisticsService.calculateDiagnosticPerformance(evaluatedForStudySet, 't2', 'n');
                    }
                    return {
                        id: set.id,
                        name: set.displayShortName || set.name,
                        sens: perfData?.sens?.value ?? NaN,
                        spez: perfData?.spez?.value ?? NaN,
                        ppv: perfData?.ppv?.value ?? NaN,
                        npv: perfData?.npv?.value ?? NaN,
                        acc: perfData?.acc?.value ?? NaN,
                        auc: perfData?.auc?.value ?? NaN
                    };
                });

            const criteriaCompContent = uiViewLogic.createCriteriaComparisonTableHTML(criteriaComparisonData, getKollektivDisplayName(kollektivId));
            kollektivHTML += uiComponents.createStatistikCard(`kriterien-vergleich-${indexSuffix}`, `Vergleich Kriteriensätze`, criteriaCompContent, false, 'criteriaComparisonTable', downloadButtonsConfig.map(b => ({...b, id: `dl-kriterien-vgl-${indexSuffix}-${b.format}`})), `table-kriterien-vergleich`);

            return kollektivHTML;
        };

        if (layout === 'einzel') {
            html += renderSingleKollektivStats(currentGlobalKollektiv, '0');
        } else if (layout === 'vergleich') {
            html += `<div class="col-lg-6">${renderSingleKollektivStats(kollektiv1Id, '1')}</div>`;
            html += `<div class="col-lg-6">${renderSingleKollektivStats(kollektiv2Id, '2')}</div>`;

            const data1 = dataProcessor.filterDataByKollektiv(processedData, kollektiv1Id);
            const data2 = dataProcessor.filterDataByKollektiv(processedData, kollektiv2Id);
            if (data1.length > 0 && data2.length > 0) {
                const evaluatedData1 = t2CriteriaManager.evaluateDataset(cloneDeep(data1), appliedCriteria, appliedLogic);
                const evaluatedData2 = t2CriteriaManager.evaluateDataset(cloneDeep(data2), appliedCriteria, appliedLogic);
                const vergleichKollektiveStats = statisticsService.compareCohorts(evaluatedData1, evaluatedData2, appliedCriteria, appliedLogic);
                const vergleichKollektiveContent = uiViewLogic.createVergleichKollektiveContentHTML(vergleichKollektiveStats, getKollektivDisplayName(kollektiv1Id), getKollektivDisplayName(kollektiv2Id));
                html += `<div class="col-12">${uiComponents.createStatistikCard('vergleich-kollektive', `Statistischer Vergleich: ${getKollektivDisplayName(kollektiv1Id)} vs. ${getKollektivDisplayName(kollektiv2Id)}`, vergleichKollektiveContent, false, 'vergleichKollektive', downloadButtonsConfig.map(b => ({...b, id: `dl-vergl-koll-${b.format}`})), `table-vergleich-kollektive-${getKollektivDisplayName(kollektiv1Id).replace(/\s+/g, '_')}-vs-${getKollektivDisplayName(kollektiv2Id).replace(/\s+/g, '_')}`)}</div>`;
            }
        }
        html += '</div>';

        setTimeout(() => {
            chartsToRender.forEach(chart => {
                const container = document.getElementById(chart.targetId);
                if(container) {
                    if(chart.type === 'ageDistribution') chartRenderer.renderAgeDistributionChart(chart.data, chart.targetId, chart.options);
                    else if (chart.type === 'pie') chartRenderer.renderPieChart(chart.data, chart.targetId, chart.options);
                    else if (chart.type === 'comparisonBar') chartRenderer.renderComparisonBarChart(chart.data, chart.targetId, chart.options, chart.label);
                    else if (chart.type === 'rocCurve') chartRenderer.renderROCCurve(chart.data, chart.targetId, chart.options);
                } else {
                    console.warn(`Chart Container #${chart.targetId} nicht im DOM gefunden.`);
                }
            });
            ui_helpers.initializeTooltips(document.getElementById('statistik-tab-pane'));
        }, 0);

        return html;
    }


    function render(processedData, appliedCriteria, appliedLogic, layout, kollektiv1Id, kollektiv2Id, currentGlobalKollektiv) {
        const selectorHTML = `
            <div class="row mb-3 align-items-center">
                <div class="col-md-auto mb-2 mb-md-0">
                    <div class="btn-group btn-group-sm" role="group" aria-label="Statistik Ansicht">
                        <button type="button" class="btn ${layout === 'einzel' ? 'btn-primary' : 'btn-outline-primary'}" id="statistik-toggle-einzel" data-layout="einzel" data-tippy-content="Zeigt detaillierte Statistiken für das global im Header gewählte Kollektiv.">Einzelansicht</button>
                        <button type="button" class="btn ${layout === 'vergleich' ? 'btn-primary' : 'btn-outline-primary'}" id="statistik-toggle-vergleich" data-layout="vergleich" data-tippy-content="Ermöglicht den direkten statistischen Vergleich zweier ausgewählter Kollektive.">Vergleich</button>
                    </div>
                </div>
                <div class="col-md ps-md-0" id="statistik-kollektiv-select-1-container" style="${layout === 'vergleich' ? '' : 'display:none;'}">
                     <select class="form-select form-select-sm" id="statistik-kollektiv-select-1" data-tippy-content="${TOOLTIP_CONTENT.statistikKollektiv1?.description || 'Erstes Kollektiv für Vergleich'}">
                        <option value="Gesamt" ${kollektiv1Id === 'Gesamt' ? 'selected' : ''}>Gesamt</option>
                        <option value="direkt OP" ${kollektiv1Id === 'direkt OP' ? 'selected' : ''}>Direkt OP</option>
                        <option value="nRCT" ${kollektiv1Id === 'nRCT' ? 'selected' : ''}>nRCT</option>
                    </select>
                </div>
                 <div class="col-md-auto text-center px-0" id="statistik-vs-label" style="line-height: 31px; ${layout === 'vergleich' ? '' : 'display:none;'}">
                    <span class="fw-bold">vs.</span>
                </div>
                <div class="col-md ps-md-0" id="statistik-kollektiv-select-2-container" style="${layout === 'vergleich' ? '' : 'display:none;'}">
                     <select class="form-select form-select-sm" id="statistik-kollektiv-select-2" data-tippy-content="${TOOLTIP_CONTENT.statistikKollektiv2?.description || 'Zweites Kollektiv für Vergleich'}">
                        <option value="Gesamt" ${kollektiv2Id === 'Gesamt' ? 'selected' : ''}>Gesamt</option>
                        <option value="direkt OP" ${kollektiv2Id === 'direkt OP' ? 'selected' : ''}>Direkt OP</option>
                        <option value="nRCT" ${kollektiv2Id === 'nRCT' ? 'selected' : ''}>nRCT</option>
                    </select>
                </div>
            </div>`;

        const contentHTML = renderStatistikContent(processedData, appliedCriteria, appliedLogic, layout, kollektiv1Id, kollektiv2Id, currentGlobalKollektiv);
        return selectorHTML + `<div id="statistik-content-area">${contentHTML}</div>`;
    }

    return Object.freeze({
        render
    });

})();