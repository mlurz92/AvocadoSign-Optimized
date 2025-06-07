const praesentationTabLogic = (() => {

    let currentPresentationView = APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW;
    let currentPresentationStudyId = APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID;

    function init() {
        _attachEventListeners();
        _populateStudySelect();
        ui_helpers.updatePresentationViewSelectorUI(currentPresentationView);
        ui_helpers.initializeTooltips(document.getElementById('praesentation-tab-pane'));
    }

    function _attachEventListeners() {
        document.querySelectorAll('input[name="praesentationAnsicht"]').forEach(radio => {
            radio.addEventListener('change', (event) => {
                currentPresentationView = event.target.value;
                state.setPresentationView(currentPresentationView);
                ui_helpers.updatePresentationViewSelectorUI(currentPresentationView);
                render(state.getProcessedData());
            });
        });

        document.getElementById('praes-study-select')?.addEventListener('change', (event) => {
            currentPresentationStudyId = event.target.value;
            state.setPresentationStudyId(currentPresentationStudyId);
            render(state.getProcessedData());
        });
    }

    function _populateStudySelect() {
        const select = document.getElementById('praes-study-select');
        if (!select) return;

        let optionsHtml = `<option value="">${APP_CONFIG.UI_TEXTS.praesentation.selectStudyPrompt}</option>`;
        optionsHtml += `<option value="${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID}" ${currentPresentationStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID ? 'selected' : ''}>${APP_CONFIG.UI_TEXTS.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME}</option>`;

        APP_CONFIG.PUBLICATION_CONFIG.literatureCriteriaSets.forEach(studySet => {
            optionsHtml += `<option value="${studySet.id}" ${currentPresentationStudyId === studySet.id ? 'selected' : ''}>${studySet.name}</option>`;
        });
        select.innerHTML = optionsHtml;
    }

    function _renderASPerformanceView(processedData) {
        const targetElement = document.getElementById('praesentation-content');
        if (!targetElement) return;

        const currentKollektiv = state.getCurrentKollektiv();
        const dataForKollektiv = dataProcessor.filterDataByKollektiv(processedData, currentKollektiv);
        const asPerformance = statisticsService.calculateDiagnosticPerformance(dataForKollektiv, 'as', 'n');
        const deskriptivStats = statisticsService.calculateDescriptiveStats(dataForKollektiv);

        const cardContent = `
            <div class="row g-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <span>${APP_CONFIG.UI_TEXTS.praesentation.asPerformanceTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektiv))}</span>
                            <span class="card-header-buttons">
                                ${ui_helpers.createHeaderButtonHTML([
                                    { format: 'md', id: 'download-performance-as-pur-md', icon: 'fab fa-markdown', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.praesentation.downloadPerformanceMD },
                                    { format: 'csv', id: 'download-performance-as-pur-csv', icon: 'fas fa-file-csv', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.praesentation.downloadPerformanceCSV },
                                    { format: 'png', tableId: 'praes-as-performance-table-body', tableName: APP_CONFIG.UI_TEXTS.praesentation.asPerformanceTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektiv)), tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.praesentation.downloadTablePNG }
                                ], 'praes-as-perf-header', APP_CONFIG.UI_TEXTS.praesentation.asPerformanceTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektiv)))}
                            </span>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-sm table-striped">
                                    <thead>
                                        <tr>
                                            <th>${APP_CONFIG.UI_TEXTS.global.metric}</th>
                                            <th class="text-end">${APP_CONFIG.UI_TEXTS.global.value} (95% CI)</th>
                                        </tr>
                                    </thead>
                                    <tbody id="praes-as-performance-table-body"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <span>${APP_CONFIG.UI_TEXTS.praesentation.demographicsTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektiv))}</span>
                            <span class="card-header-buttons">
                                ${ui_helpers.createHeaderButtonHTML([
                                    { format: 'md', id: 'download-demographics-as-pur-md', icon: 'fab fa-markdown', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.praesentation.downloadDemographicsMD },
                                    { format: 'png', tableId: 'praes-demographics-table-body', tableName: APP_CONFIG.UI_TEXTS.praesentation.demographicsTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektiv)), tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.praesentation.downloadTablePNG }
                                ], 'praes-demographics-header', APP_CONFIG.UI_TEXTS.praesentation.demographicsTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(currentKollektiv)))}
                            </span>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-sm table-striped">
                                    <thead>
                                        <tr>
                                            <th style="width:50%;">${APP_CONFIG.UI_TEXTS.global.variable}</th>
                                            <th class="text-end">${APP_CONFIG.UI_TEXTS.global.value}</th>
                                            <th class="text-end">${APP_CONFIG.UI_TEXTS.global.value2}</th>
                                        </tr>
                                    </thead>
                                    <tbody id="praes-demographics-table-body"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        targetElement.innerHTML = cardContent;

        tableRenderer.renderDiagnosticPerformanceTable(asPerformance, 'praes-as-performance-table-body', { predictionMethod: APP_CONFIG.UI_TEXTS.legendLabels.avocadoSign, kollektiv: currentKollektiv });
        tableRenderer.renderDescriptiveStatsTable(deskriptivStats, 'praes-demographics-table-body');
        ui_helpers.initializeTooltips(targetElement);
    }

    function _renderASvsT2ComparisonView(processedData) {
        const targetElement = document.getElementById('praesentation-content');
        if (!targetElement) return;

        const selectedStudyId = currentPresentationStudyId;
        let t2CriteriaSet = null;
        let t2DisplayName = '';
        let t2Kollektiv = state.getCurrentKollektiv();

        if (selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
            t2CriteriaSet = t2CriteriaManager.getAppliedCriteria();
            t2DisplayName = APP_CONFIG.UI_TEXTS.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
            t2Kollektiv = state.getCurrentKollektiv(); // Applied criteria always on current global collective
        } else if (selectedStudyId) {
            t2CriteriaSet = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
            if (t2CriteriaSet) {
                t2DisplayName = t2CriteriaSet.displayShortName || t2CriteriaSet.name;
                t2Kollektiv = t2CriteriaSet.applicableKollektiv || state.getCurrentKollektiv();
            }
        }

        const dataForKollektiv = dataProcessor.filterDataByKollektiv(processedData, t2Kollektiv);

        let evaluatedDataT2 = dataForKollektiv;
        if (t2CriteriaSet) {
            if (selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(dataForKollektiv), t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
            } else if (t2CriteriaSet.logic === 'KOMBINIERT' && t2CriteriaSet.id === 'rutegard_et_al_esgar') {
                 evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataForKollektiv), t2CriteriaSet);
            } else {
                 evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(dataForKollektiv), t2CriteriaSet.criteria, t2CriteriaSet.logic);
            }
        } else {
            evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(dataForKollektiv), {}, 'UND'); // Evaluate with empty criteria
        }

        const asPerformance = statisticsService.calculateDiagnosticPerformance(dataForKollektiv, 'as', 'n');
        const t2Performance = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n');
        const comparisonASvsT2 = statisticsService.compareDiagnosticMethods(evaluatedDataT2, 'as', 't2', 'n');

        const metricsToCompare = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'];
        const chartData = metricsToCompare.map(metricKey => {
            const asVal = asPerformance?.[metricKey]?.value ?? NaN;
            const t2Val = t2Performance?.[metricKey]?.value ?? NaN;
            let displayName = APP_CONFIG.UI_TEXTS.t2MetricsOverview[metricKey + 'Short'] || metricKey;
            return { metric: displayName, AS: asVal, T2: t2Val };
        }).filter(d => !isNaN(d.AS) || !isNaN(d.T2));

        const studyInfoHtml = t2CriteriaSet && t2CriteriaSet.studyInfo ? `
            <p class="small mb-1"><strong>${APP_CONFIG.UI_TEXTS.praesentation.t2BasisInfoCard.reference}:</strong> ${t2CriteriaSet.studyInfo.reference || APP_CONFIG.UI_TEXTS.global.notApplicableShort}</p>
            <p class="small mb-1"><strong>${APP_CONFIG.UI_TEXTS.praesentation.t2BasisInfoCard.patientCohort}:</strong> ${t2CriteriaSet.studyInfo.patientCohort || APP_CONFIG.UI_TEXTS.global.notApplicableShort}</p>
            <p class="small mb-1"><strong>${APP_CONFIG.UI_TEXTS.praesentation.t2BasisInfoCard.investigationType}:</strong> ${t2CriteriaSet.studyInfo.investigationType || APP_CONFIG.UI_TEXTS.global.notApplicableShort}</p>
            <p class="small mb-1"><strong>${APP_CONFIG.UI_TEXTS.praesentation.t2BasisInfoCard.focus}:</strong> ${t2CriteriaSet.studyInfo.focus || APP_CONFIG.UI_TEXTS.global.notApplicableShort}</p>
            <p class="small mb-0"><strong>${APP_CONFIG.UI_TEXTS.praesentation.t2BasisInfoCard.keyCriteriaSummary}:</strong> ${studyT2CriteriaManager.formatCriteriaForDisplay(t2CriteriaSet.criteria, t2CriteriaSet.logic) || APP_CONFIG.UI_TEXTS.global.notApplicableShort}</p>
        ` : `<p class="text-muted small">${APP_CONFIG.UI_TEXTS.praesentation.noStudySelected}</p>`;


        const cardContent = `
            <div class="row g-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.praesentation.t2BasisInfoCard.description}">
                            ${APP_CONFIG.UI_TEXTS.praesentation.t2BasisInfoCard.title} (<span class="fw-bold">${t2DisplayName}</span>)
                        </div>
                        <div class="card-body">
                            ${studyInfoHtml}
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <span>${APP_CONFIG.UI_TEXTS.praesentation.comparisonTableTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(t2Kollektiv))}</span>
                            <span class="card-header-buttons">
                                ${ui_helpers.createHeaderButtonHTML([
                                    { format: 'md', id: `download-comp-table-as-vs-t2-md-${selectedStudyId}`, icon: 'fab fa-markdown', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.praesentation.downloadCompTableMD },
                                    { format: 'csv', id: `download-performance-as-vs-t2-csv-${selectedStudyId}`, icon: 'fas fa-file-csv', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.praesentation.downloadPerformanceCSV },
                                    { format: 'png', tableId: 'praes-as-vs-t2-performance-table-body', tableName: APP_CONFIG.UI_TEXTS.praesentation.comparisonTableTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(t2Kollektiv)), tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.praesentation.downloadCompTablePNG }
                                ], 'praes-as-vs-t2-comp-header', APP_CONFIG.UI_TEXTS.praesentation.comparisonTableTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(t2Kollektiv)))}
                            </span>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-sm table-striped">
                                    <thead>
                                        <tr>
                                            <th>${APP_CONFIG.UI_TEXTS.praesentation.asVsT2PerfTable.metric}</th>
                                            <th class="text-end">${APP_CONFIG.UI_TEXTS.praesentation.asVsT2PerfTable.asValue.replace('[KOLLEKTIV_NAME_VERGLEICH]', ui_helpers.getKollektivDisplayName(t2Kollektiv))}</th>
                                            <th class="text-end">${APP_CONFIG.UI_TEXTS.praesentation.asVsT2PerfTable.t2Value.replace('[T2_SHORT_NAME]', t2DisplayName).replace('[KOLLEKTIV_NAME_VERGLEICH]', ui_helpers.getKollektivDisplayName(t2Kollektiv))}</th>
                                        </tr>
                                    </thead>
                                    <tbody id="praes-as-vs-t2-performance-table-body"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                 <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <span>${APP_CONFIG.UI_TEXTS.praesentation.statisticalTestsTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(t2Kollektiv))}</span>
                            <span class="card-header-buttons">
                                ${ui_helpers.createHeaderButtonHTML([
                                    { format: 'md', id: `download-tests-as-vs-t2-md-${selectedStudyId}`, icon: 'fab fa-markdown', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.praesentation.downloadCompTestsMD }
                                ], 'praes-as-vs-t2-tests-header', APP_CONFIG.UI_TEXTS.praesentation.statisticalTestsTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(t2Kollektiv)))}
                            </span>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-sm table-striped">
                                    <thead>
                                        <tr>
                                            <th>${APP_CONFIG.UI_TEXTS.praesentation.asVsT2TestTable.test}</th>
                                            <th class="text-end">${APP_CONFIG.UI_TEXTS.praesentation.asVsT2TestTable.statistic}</th>
                                            <th class="text-end">${APP_CONFIG.UI_TEXTS.praesentation.asVsT2TestTable.pValue}</th>
                                        </tr>
                                    </thead>
                                    <tbody id="praes-as-vs-t2-tests-table-body"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <span>${APP_CONFIG.UI_TEXTS.praesentation.comparisonChartTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(t2Kollektiv))}</span>
                            <span class="card-header-buttons">
                                ${ui_helpers.createHeaderButtonHTML([
                                    { format: 'png', id: `download-comp-chart-as-vs-t2-png-${selectedStudyId}`, icon: 'fas fa-image', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.praesentation.downloadCompChartPNG, chartId: `praes-comparison-chart`, chartName: `Vergleich AS vs ${t2DisplayName}` },
                                    { format: 'svg', id: `download-comp-chart-as-vs-t2-svg-${selectedStudyId}`, icon: 'fas fa-file-code', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.praesentation.downloadCompChartSVG, chartId: `praes-comparison-chart`, chartName: `Vergleich AS vs ${t2DisplayName}` }
                                ], 'praes-as-vs-t2-chart-header', APP_CONFIG.UI_TEXTS.praesentation.comparisonChartTitle.replace('[KOLLEKTIV]', ui_helpers.getKollektivDisplayName(t2Kollektiv)))}
                            </span>
                        </div>
                        <div class="card-body">
                            <div id="praes-comparison-chart" style="width: 100%; height: 350px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        targetElement.innerHTML = cardContent;

        const formatForDisplay = (valObj, lang = 'de') => {
            if (!valObj) return APP_CONFIG.UI_TEXTS.global.notApplicableShort;
            const digits = (valObj.name === APP_CONFIG.UI_TEXTS.t2MetricsOverview.f1Short || valObj.name === APP_CONFIG.UI_TEXTS.t2MetricsOverview.aucShort || valObj.name === APP_CONFIG.UI_TEXTS.t2MetricsOverview.aucShort) ? 3 : 1;
            const isPercent = !(valObj.name === APP_CONFIG.UI_TEXTS.t2MetricsOverview.f1Short || valObj.name === APP_CONFIG.UI_TEXTS.t2MetricsOverview.aucShort || valObj.name === APP_CONFIG.UI_TEXTS.t2MetricsOverview.aucShort);
            return formatCI(valObj.value, valObj.ci?.lower, valObj.ci?.upper, digits, isPercent, APP_CONFIG.UI_TEXTS.global.notApplicableShort, lang);
        };

        const renderComparisonMetricsTable = (targetTableId, asData, t2Data, comparisonMetrics) => {
            const tableBody = document.getElementById(targetTableId);
            if (!tableBody) return;
            let html = '';
            comparisonMetrics.forEach(metricKey => {
                const asMetric = asData?.[metricKey];
                const t2Metric = t2Data?.[metricKey];
                let displayName = APP_CONFIG.UI_TEXTS.t2MetricsOverview[metricKey + 'Short'] || metricKey;
                
                const asInterpretation = ui_helpers.getMetricInterpretationHTML(metricKey, asMetric, APP_CONFIG.UI_TEXTS.legendLabels.avocadoSign, t2Kollektiv);
                const t2Interpretation = ui_helpers.getMetricInterpretationHTML(metricKey, t2Metric, t2DisplayName, t2Kollektiv);

                html += `
                    <tr>
                        <td class="small">${displayName}</td>
                        <td class="small text-end has-tooltip" data-tippy-content="${asInterpretation}">${formatForDisplay(asMetric)}</td>
                        <td class="small text-end has-tooltip" data-tippy-content="${t2Interpretation}">${formatForDisplay(t2Metric)}</td>
                    </tr>`;
            });
            tableBody.innerHTML = html;
        };
        
        renderComparisonMetricsTable('praes-as-vs-t2-performance-table-body', asPerformance, t2Performance, metricsToCompare);
        tableRenderer.renderStatisticalComparisonTable(comparisonASvsT2, 'praes-as-vs-t2-tests-table-body', { kollektiv: t2Kollektiv, t2ShortName: t2DisplayName });
        chartRenderer.renderComparisonBarChart(chartData, 'praes-comparison-chart', { t2Label: t2DisplayName });

        ui_helpers.initializeTooltips(targetElement);
    }


    function render(processedData) {
        ui_helpers.updatePresentationViewSelectorUI(currentPresentationView); // Update radio buttons state
        _populateStudySelect(); // Ensure select is updated with current value

        if (currentPresentationView === 'as-pur') {
            _renderASPerformanceView(processedData);
        } else if (currentPresentationView === 'as-vs-t2') {
            _renderASvsT2ComparisonView(processedData);
        }
        ui_helpers.initializeTooltips(document.getElementById('praesentation-tab-pane'));
    }

    return Object.freeze({
        init,
        render
    });

})();
