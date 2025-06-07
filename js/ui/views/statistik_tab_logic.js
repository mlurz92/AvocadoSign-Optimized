const statistikTabLogic = (() => {

    let currentStatsLayout = APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT;
    let currentStatsKollektiv1 = APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1;
    let currentStatsKollektiv2 = APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2;
    let currentCriteriaComparisonSets = APP_CONFIG.DEFAULT_SETTINGS.CRITERIA_COMPARISON_SETS;
    let showAppliedCriteriaInComparison = true;


    function init() {
        _attachEventListeners();
        _populateKollektivSelects();
        ui_helpers.updateStatistikSelectorsUI(currentStatsLayout, currentStatsKollektiv1, currentStatsKollektiv2);
        _populateCriteriaComparisonSelect();
        ui_helpers.initializeTooltips(document.getElementById('statistik-tab-pane'));
    }

    function _attachEventListeners() {
        document.getElementById('statistik-toggle-vergleich')?.addEventListener('click', (event) => {
            currentStatsLayout = event.target.classList.contains('active') ? 'einzel' : 'vergleich';
            ui_helpers.updateStatistikSelectorsUI(currentStatsLayout, currentStatsKollektiv1, currentStatsKollektiv2);
            state.setStatsLayout(currentStatsLayout);
            render(state.getProcessedData());
        });

        document.getElementById('statistik-kollektiv-select-1')?.addEventListener('change', (event) => {
            currentStatsKollektiv1 = event.target.value;
            state.setStatsKollektiv1(currentStatsKollektiv1);
            render(state.getProcessedData());
        });

        document.getElementById('statistik-kollektiv-select-2')?.addEventListener('change', (event) => {
            currentStatsKollektiv2 = event.target.value;
            state.setStatsKollektiv2(currentStatsKollektiv2);
            render(state.getProcessedData());
        });

        document.getElementById('criteria-comparison-select')?.addEventListener('change', (event) => {
            currentCriteriaComparisonSets = Array.from(event.target.selectedOptions).map(option => option.value);
            if (currentCriteriaComparisonSets.includes(APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID)) {
                showAppliedCriteriaInComparison = true;
                currentCriteriaComparisonSets = currentCriteriaComparisonSets.filter(id => id !== APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID);
            } else {
                showAppliedCriteriaInComparison = false;
            }
            state.setCriteriaComparisonSets(currentCriteriaComparisonSets);
            render(state.getProcessedData());
        });

        document.getElementById('show-applied-criteria-checkbox')?.addEventListener('change', (event) => {
            showAppliedCriteriaInComparison = event.target.checked;
            render(state.getProcessedData());
        });
    }

    function _populateKollektivSelects() {
        const select1 = document.getElementById('statistik-kollektiv-select-1');
        const select2 = document.getElementById('statistik-kollektiv-select-2');
        if (select1 && select2) {
            const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
            const optionsHtml = kollektive.map(k => `<option value="${k}">${APP_CONFIG.UI_TEXTS.kollektivDisplayNames[k]}</option>`).join('');
            select1.innerHTML = optionsHtml;
            select2.innerHTML = optionsHtml;
            select1.value = currentStatsKollektiv1;
            select2.value = currentStatsKollektiv2;
        }
    }

    function _populateCriteriaComparisonSelect() {
        const select = document.getElementById('criteria-comparison-select');
        if (!select) return;

        let optionsHtml = '';
        APP_CONFIG.PUBLICATION_CONFIG.literatureCriteriaSets.forEach(studySet => {
            const isSelected = currentCriteriaComparisonSets.includes(studySet.id);
            optionsHtml += `<option value="${studySet.id}" ${isSelected ? 'selected' : ''}>${studySet.name}</option>`;
        });
        select.innerHTML = optionsHtml;
        document.getElementById('show-applied-criteria-checkbox').checked = showAppliedCriteriaInComparison;
    }

    function _renderSingleView(processedData, currentKollektivId) {
        const currentKollektivData = dataProcessor.filterDataByKollektiv(processedData, currentKollektivId);

        const deskriptivStats = statisticsService.calculateDescriptiveStats(currentKollektivData);
        const asPerformance = statisticsService.calculateDiagnosticPerformance(currentKollektivData, 'as', 'n');
        const t2Performance = statisticsService.calculateDiagnosticPerformance(currentKollektivData, 't2', 'n');
        const comparisonASvsT2 = statisticsService.compareDiagnosticMethods(currentKollektivData, 'as', 't2', 'n');
        const associations = statisticsService.calculateAssociations(currentKollektivData, t2CriteriaManager.getAppliedCriteria());

        const renderChartSafely = (chartFn, chartId, data, options) => {
             const chartElement = document.getElementById(chartId);
             if (chartElement) {
                 const containerRect = chartElement.getBoundingClientRect();
                 const containerWidth = containerRect.width > 0 ? containerRect.width : APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
                 const containerHeight = containerRect.height > 0 ? containerRect.height : APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT;
                 chartFn(data, chartId, {...options, width: containerWidth, height: containerHeight});
             }
        };

        const statsContent = `
            <div class="row g-4">
                ${uiComponents.createStatistikCard('deskriptive-statistik', APP_CONFIG.UI_TEXTS.statistikTab.descriptiveStatsTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektivId)), `<div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th style="width:50%;">${APP_CONFIG.UI_TEXTS.global.variable}</th><th class="text-end">${APP_CONFIG.UI_TEXTS.global.kollektiv} ${ui_helpers.getKollektivDisplayName(currentKollektivId)}</th><th class="text-end">${APP_CONFIG.UI_TEXTS.global.kollektiv2}</th></tr></thead><tbody id="deskriptive-statistik-table-body"></tbody></table></div>`, true, 'deskriptiveStatistik', [{ format: 'png', tableId: 'deskriptive-statistik-table-body', tableName: APP_CONFIG.UI_TEXTS.statistikTab.descriptiveStatsTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektivId)) }])}
                ${uiComponents.createStatistikCard('diagnostische-guete-as', APP_CONFIG.UI_TEXTS.statistikTab.diagnosticPerformanceASTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektivId)), `<div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th>${APP_CONFIG.UI_TEXTS.global.metric}</th><th class="text-end">${APP_CONFIG.UI_TEXTS.global.value} (95% CI)</th></tr></thead><tbody id="diagnostische-guete-as-table-body"></tbody></table></div>`, true, 'diagnostischeGueteAS', [{ format: 'png', tableId: 'diagnostische-guete-as-table-body', tableName: APP_CONFIG.UI_TEXTS.statistikTab.diagnosticPerformanceASTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektivId)) }])}
                ${uiComponents.createStatistikCard('diagnostische-guete-t2', APP_CONFIG.UI_TEXTS.statistikTab.diagnosticPerformanceT2Title.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektivId)), `<div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th>${APP_CONFIG.UI_TEXTS.global.metric}</th><th class="text-end">${APP_CONFIG.UI_TEXTS.global.value} (95% CI)</th></tr></thead><tbody id="diagnostische-guete-t2-table-body"></tbody></table></div>`, true, 'diagnostischeGueteT2', [{ format: 'png', tableId: 'diagnostische-guete-t2-table-body', tableName: APP_CONFIG.UI_TEXTS.statistikTab.diagnosticPerformanceT2Title.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektivId)) }])}
                ${uiComponents.createStatistikCard('statistischer-vergleich-as-vs-t2', APP_CONFIG.UI_TEXTS.statistikTab.statisticalComparisonASvsT2Title.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektivId)), `<div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th>${APP_CONFIG.UI_TEXTS.global.test}</th><th class="text-end">${APP_CONFIG.UI_TEXTS.global.statistic}</th><th class="text-end">${APP_CONFIG.UI_TEXTS.global.pValue}</th></tr></thead><tbody id="statistischer-vergleich-as-vs-t2-table-body"></tbody></table></div>`, true, 'statistischerVergleichASvsT2', [{ format: 'png', tableId: 'statistischer-vergleich-as-vs-t2-table-body', tableName: APP_CONFIG.UI_TEXTS.statistikTab.statisticalComparisonASvsT2Title.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektivId)) }])}
                ${uiComponents.createStatistikCard('assoziation-einzelkriterien', APP_CONFIG.UI_TEXTS.statistikTab.associationIndividualCriteriaTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektivId)), `<div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th style="width:20%;">${APP_CONFIG.UI_TEXTS.global.feature}</th><th class="text-center" style="width:10%;">${APP_CONFIG.UI_TEXTS.global.rpfpfnrn}</th><th class="text-center" style="width:10%;">${APP_CONFIG.UI_TEXTS.global.correctRatio}</th><th class="text-end" style="width:20%;">${APP_CONFIG.UI_TEXTS.global.oddsRatio} (95% CI)</th><th class="text-end" style="width:15%;">${APP_CONFIG.UI_TEXTS.global.riskDifference} (95% CI)</th><th class="text-end" style="width:10%;">${APP_CONFIG.UI_TEXTS.global.phi}</th><th class="text-end" style="width:15%;">${APP_CONFIG.UI_TEXTS.global.pValue}</th></tr></thead><tbody id="assoziation-einzelkriterien-table-body"></tbody></table></div>`, true, 'assoziationEinzelkriterien', [{ format: 'png', tableId: 'assoziation-einzelkriterien-table-body', tableName: APP_CONFIG.UI_TEXTS.statistikTab.associationIndividualCriteriaTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektivId)) }])}
                <div class="col-12 mt-4">
                    <div class="card">
                        <div class="card-header" data-tippy-content="${(APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.criteriaComparisonTable.cardTitle || '').replace('[GLOBAL_KOLLEKTIV_NAME]', ui_helpers.getKollektivDisplayName(currentKollektivId))}">
                            ${APP_CONFIG.UI_TEXTS.criteriaComparison.title}
                            <span class="float-end card-header-buttons">
                                <label class="form-check-label me-2 small" for="show-applied-criteria-checkbox">${APP_CONFIG.UI_TEXTS.criteriaComparison.showAppliedLabel}</label>
                                <input class="form-check-input" type="checkbox" id="show-applied-criteria-checkbox" ${showAppliedCriteriaInComparison ? 'checked' : ''}>
                                ${ui_helpers.getT2IconSVG('ruler-horizontal')}
                                ${ui_helpers.createHeaderButtonHTML([{format: 'png', tableId: 'criteria-comparison-table-body', tableName: 'Kriterienvergleich'}], 'criteria-comparison-table-header', 'Kriterienvergleich')}
                            </span>
                        </div>
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="criteria-comparison-select" class="form-label form-label-sm">${APP_CONFIG.UI_TEXTS.criteriaComparison.selectLabel}</label>
                                    <select multiple class="form-select form-select-sm" id="criteria-comparison-select">
                                    </select>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-sm table-striped">
                                    <thead>
                                        <tr>
                                            <th class="small">${APP_CONFIG.UI_TEXTS.criteriaComparison.tableHeaderSet}</th>
                                            <th class="small text-end">${APP_CONFIG.UI_TEXTS.criteriaComparison.tableHeaderSens}</th>
                                            <th class="small text-end">${APP_CONFIG.UI_TEXTS.criteriaComparison.tableHeaderSpez}</th>
                                            <th class="small text-end">${APP_CONFIG.UI_TEXTS.criteriaComparison.tableHeaderPPV}</th>
                                            <th class="small text-end">${APP_CONFIG.UI_TEXTS.criteriaComparison.tableHeaderNPV}</th>
                                            <th class="small text-end">${APP_CONFIG.UI_TEXTS.criteriaComparison.tableHeaderAcc}</th>
                                            <th class="small text-end">${APP_CONFIG.UI_TEXTS.criteriaComparison.tableHeaderAUC}</th>
                                        </tr>
                                    </thead>
                                    <tbody id="criteria-comparison-table-body"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('statistik-content').innerHTML = statsContent;

        // Render tables
        tableRenderer.renderDescriptiveStatsTable(deskriptivStats, 'deskriptive-statistik-table-body');
        tableRenderer.renderDiagnosticPerformanceTable(asPerformance, 'diagnostische-guete-as-table-body', { predictionMethod: APP_CONFIG.UI_TEXTS.legendLabels.avocadoSign, kollektiv: currentKollektivId });
        tableRenderer.renderDiagnosticPerformanceTable(t2Performance, 'diagnostische-guete-t2-table-body', { predictionMethod: APP_CONFIG.UI_TEXTS.legendLabels.currentT2, kollektiv: currentKollektivId });
        tableRenderer.renderStatisticalComparisonTable(comparisonASvsT2, 'statistischer-vergleich-as-vs-t2-table-body', { kollektiv: currentKollektivId, t2ShortName: APP_CONFIG.UI_TEXTS.legendLabels.currentT2 });
        tableRenderer.renderAssociationsTable(associations, 'assoziation-einzelkriterien-table-body', { kollektiv: currentKollektivId, t2Criteria: t2CriteriaManager.getAppliedCriteria() });

        _renderCriteriaComparisonTable(processedData, currentKollektivId);

        ui_helpers.initializeTooltips(document.getElementById('statistik-tab-pane'));
    }

    function _renderComparisonView(processedData, kollektiv1Id, kollektiv2Id) {
        const dataKollektiv1 = dataProcessor.filterDataByKollektiv(processedData, kollektiv1Id);
        const dataKollektiv2 = dataProcessor.filterDataByKollektiv(processedData, kollektiv2Id);

        const comparisonResults = statisticsService.compareCohorts(dataKollektiv1, dataKollektiv2, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());

        const statsContent = `
            <div class="row g-4">
                ${uiComponents.createStatistikCard('vergleich-kollektive', APP_CONFIG.UI_TEXTS.statistikTab.cohortComparisonTitle.replace('[KOLLEKTIV1]', ui_helpers.getKollektivDisplayName(kollektiv1Id)).replace('[KOLLEKTIV2]', ui_helpers.getKollektivDisplayName(kollektiv2Id)), `<div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th style="width:40%;">${APP_CONFIG.UI_TEXTS.global.metric}</th><th class="text-end" style="width:30%;">${APP_CONFIG.UI_TEXTS.global.asVsN} ${ui_helpers.getKollektivDisplayName(kollektiv1Id)} vs ${ui_helpers.getKollektivDisplayName(kollektiv2Id)}</th><th class="text-end" style="width:30%;">${APP_CONFIG.UI_TEXTS.global.t2VsN} ${ui_helpers.getKollektivDisplayName(kollektiv1Id)} vs ${ui_helpers.getKollektivDisplayName(kollektiv2Id)}</th></tr></thead><tbody id="vergleich-kollektive-table-body"></tbody></table></div>`, true, 'vergleichKollektive', [{ format: 'png', tableId: 'vergleich-kollektive-table-body', tableName: APP_CONFIG.UI_TEXTS.statistikTab.cohortComparisonTitle.replace('[KOLLEKTIV1]', ui_helpers.getKollektivDisplayName(kollektiv1Id)).replace('[KOLLEKTIV2]', ui_helpers.getKollektivDisplayName(kollektiv2Id)) }])}
            </div>
        `;
        document.getElementById('statistik-content').innerHTML = statsContent;

        tableRenderer.renderCohortComparisonTable(comparisonResults, 'vergleich-kollektive-table-body', { kollektiv1: kollektiv1Id, kollektiv2: kollektiv2Id });

        ui_helpers.initializeTooltips(document.getElementById('statistik-tab-pane'));
    }

    function _renderCriteriaComparisonTable(processedData, currentKollektivId) {
        const comparisonResults = {};
        const dataForGlobalKollektiv = dataProcessor.filterDataByKollektiv(processedData, currentKollektivId);

        // Add Avocado Sign
        comparisonResults[APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID] = statisticsService.calculateDiagnosticPerformance(dataForGlobalKollektiv, 'as', 'n');

        // Add currently applied criteria
        if (showAppliedCriteriaInComparison) {
            const evaluatedDataApplied = t2CriteriaManager.evaluateDataset(cloneDeep(dataForGlobalKollektiv), t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
            comparisonResults[APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID] = statisticsService.calculateDiagnosticPerformance(evaluatedDataApplied, 't2', 'n');
        }

        // Add selected literature criteria sets
        currentCriteriaComparisonSets.forEach(studyId => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId);
            if (studySet) {
                 const dataForStudyEvaluation = dataProcessor.filterDataByKollektiv(processedData, studySet.applicableKollektiv || currentKollektivId);
                 const evaluatedDataStudy = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataForStudyEvaluation), studySet);
                 comparisonResults[studyId] = statisticsService.calculateDiagnosticPerformance(evaluatedDataStudy, 't2', 'n');
            }
        });

        tableRenderer.renderCriteriaComparisonTable(comparisonResults, 'criteria-comparison-table-body', { kollektiv: currentKollektivId, showAppliedCriteria: showAppliedCriteriaInComparison });
    }

    function render(processedData) {
        if (currentStatsLayout === 'einzel') {
            _renderSingleView(processedData, state.getCurrentKollektiv());
        } else {
            _renderComparisonView(processedData, currentStatsKollektiv1, currentStatsKollektiv2);
        }
        ui_helpers.initializeTooltips(document.getElementById('statistik-tab-pane'));
    }

    return Object.freeze({
        init,
        render
    });

})();
