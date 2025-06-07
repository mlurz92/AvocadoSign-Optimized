const auswertungTabLogic = (() => {

    const auswertungTableId = 'auswertung-table-body';
    const auswertungTableHeaderId = 'auswertung-table-header';
    let currentSortState = APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT;

    function init() {
        _attachEventListeners();
        ui_helpers.updateSortIcons(auswertungTableHeaderId, currentSortState);
        ui_helpers.initializeTooltips(document.getElementById('auswertung-tab-pane'));
        _renderT2CriteriaControls();
        _renderBruteForceCard();
    }

    function _attachEventListeners() {
        const tableHeader = document.getElementById(auswertungTableHeaderId);
        if (tableHeader) {
            tableHeader.querySelectorAll('th[data-sort-key]').forEach(header => {
                header.addEventListener('click', (event) => {
                    const sortKey = header.dataset.sortKey;
                    let subKey = header.dataset.subKey;
                    
                    const clickedElement = event.target.closest('[data-sub-key]');
                    if (clickedElement) {
                        subKey = clickedElement.dataset.subKey;
                    } else if (sortKey === 'n_as_t2') {
                        subKey = null; // Reset subKey if parent header is clicked again without specific sub-element
                    }

                    if (currentSortState.key === sortKey && currentSortState.subKey === subKey) {
                        currentSortState.direction = currentSortState.direction === 'asc' ? 'desc' : 'asc';
                    } else {
                        currentSortState.key = sortKey;
                        currentSortState.subKey = subKey;
                        currentSortState.direction = 'asc';
                    }
                    render(state.getProcessedData());
                });
            });
        }

        const toggleDetailsBtn = document.getElementById('auswertung-toggle-details');
        if (toggleDetailsBtn) {
            toggleDetailsBtn.addEventListener('click', () => {
                ui_helpers.toggleAllDetails(auswertungTableId, 'auswertung-toggle-details');
            });
        }
        
        const t2LogicSwitch = document.getElementById('t2-logic-switch');
        if (t2LogicSwitch) {
            t2LogicSwitch.addEventListener('change', (event) => {
                const newLogic = event.target.checked ? 'ODER' : 'UND';
                if (t2CriteriaManager.updateLogic(newLogic)) {
                    _renderT2CriteriaControls();
                    ui_helpers.markCriteriaSavedIndicator(true);
                }
            });
        }

        document.querySelectorAll('.criteria-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                const key = event.target.value;
                const isActive = event.target.checked;
                if (t2CriteriaManager.toggleCriterionActive(key, isActive)) {
                    _renderT2CriteriaControls();
                    ui_helpers.markCriteriaSavedIndicator(true);
                }
            });
        });

        document.querySelectorAll('.criteria-range, .criteria-input-manual').forEach(input => {
            input.addEventListener('input', debounce((event) => {
                const value = parseFloat(event.target.value);
                if (t2CriteriaManager.updateCriterionThreshold(value)) {
                     const currentCriteria = t2CriteriaManager.getCurrentCriteria();
                     const range = document.getElementById('range-size');
                     const inputManual = document.getElementById('input-size');
                     const valueDisplay = document.getElementById('value-size');
                     if (range) range.value = formatNumber(currentCriteria.size.threshold, 1, '', true);
                     if (inputManual) inputManual.value = formatNumber(currentCriteria.size.threshold, 1, '', true);
                     if (valueDisplay) valueDisplay.textContent = formatNumber(currentCriteria.size.threshold, 1);
                     ui_helpers.markCriteriaSavedIndicator(true);
                }
            }, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS));
        });

        document.querySelectorAll('.t2-criteria-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const key = event.currentTarget.dataset.criterion;
                const value = event.currentTarget.dataset.value;
                if (t2CriteriaManager.updateCriterionValue(key, value)) {
                    _renderT2CriteriaControls();
                    ui_helpers.markCriteriaSavedIndicator(true);
                }
            });
        });

        document.getElementById('btn-reset-criteria')?.addEventListener('click', () => {
            t2CriteriaManager.resetCriteria();
            _renderT2CriteriaControls();
            ui_helpers.markCriteriaSavedIndicator(true);
        });

        document.getElementById('btn-apply-criteria')?.addEventListener('click', () => {
            t2CriteriaManager.applyCriteria();
            state.applyT2CriteriaAndRefresh(); // Aktualisiere Daten und render neu
            ui_helpers.markCriteriaSavedIndicator(false);
            ui_helpers.showToast(APP_CONFIG.UI_TEXTS.auswertungTab.criteriaAppliedSuccess, 'success');
        });

        const bruteForceMetricSelect = document.getElementById('brute-force-metric');
        if (bruteForceMetricSelect) {
             bruteForceMetricSelect.addEventListener('change', (event) => {
                bruteForceManager.setTargetMetric(event.target.value);
             });
        }
        
        document.getElementById('btn-start-brute-force')?.addEventListener('click', () => {
             const currentKollektiv = state.getCurrentKollektiv();
             const filteredData = dataProcessor.filterDataByKollektiv(state.getRawData(), currentKollektiv);
             bruteForceManager.startOptimization(filteredData, currentKollektiv, APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE);
        });

        document.getElementById('btn-cancel-brute-force')?.addEventListener('click', () => {
            bruteForceManager.cancelOptimization();
        });

        document.getElementById('btn-show-brute-force-details')?.addEventListener('click', () => {
             const resultsData = bruteForceManager.getBruteForceResults();
             const modalContent = uiComponents.createBruteForceModalContent(resultsData);
             ui_helpers.updateElementHTML('brute-force-modal-body', modalContent);
             ui_helpers.initializeTooltips(document.getElementById('brute-force-modal-body'));
             // Re-initialize tooltips for the modal content
             const bruteForceModal = new bootstrap.Modal(document.getElementById('brute-force-modal'));
             bruteForceModal.show();
        });

        document.getElementById('btn-apply-best-bf-criteria')?.addEventListener('click', () => {
            const bestResult = bruteForceManager.getBruteForceResults()?.bestResult;
            if (bestResult && bestResult.criteria) {
                const currentCriteria = t2CriteriaManager.getCurrentCriteria();
                // Update current criteria to match best BF result
                Object.keys(currentCriteria).forEach(key => {
                    if (key !== 'logic' && bestResult.criteria[key]) {
                        if (bestResult.criteria[key].active !== undefined) {
                            t2CriteriaManager.toggleCriterionActive(key, bestResult.criteria[key].active);
                        }
                        if (key === 'size' && bestResult.criteria[key].threshold !== undefined) {
                            t2CriteriaManager.updateCriterionThreshold(bestResult.criteria[key].threshold);
                        } else if (bestResult.criteria[key].value !== undefined) {
                            t2CriteriaManager.updateCriterionValue(key, bestResult.criteria[key].value);
                        }
                    }
                });
                t2CriteriaManager.updateLogic(bestResult.logic);

                t2CriteriaManager.applyCriteria();
                state.applyT2CriteriaAndRefresh();
                ui_helpers.markCriteriaSavedIndicator(false);
                ui_helpers.showToast(APP_CONFIG.UI_TEXTS.auswertungTab.bfCriteriaAppliedSuccess, 'success');
            } else {
                ui_helpers.showToast(APP_CONFIG.UI_TEXTS.auswertungTab.noBFCriteriaToApply, 'warning');
            }
        });

    }

    function _renderDashboard(currentKollektivData, currentKollektivId) {
        const dashboardContainer = document.getElementById('auswertung-dashboard-container');
        if (!dashboardContainer) return;
        dashboardContainer.innerHTML = '';

        const deskriptivStats = statisticsService.calculateDescriptiveStats(currentKollektivData);

        const createDashboardCardHtml = (title, content, chartId = null, cardClasses = '', headerClasses = '', bodyClasses = '', downloadButtons = []) => {
            return uiComponents.createDashboardCard(title, content, chartId, cardClasses, headerClasses, bodyClasses, downloadButtons);
        };

        const renderChartSafely = (chartFn, chartId, data, options) => {
             const chartElement = document.getElementById(chartId);
             if (chartElement) {
                 const containerRect = chartElement.getBoundingClientRect();
                 const containerWidth = containerRect.width > 0 ? containerRect.width : APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
                 const containerHeight = containerRect.height > 0 ? containerRect.height : APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT;
                 chartFn(data, chartId, {...options, width: containerWidth, height: containerHeight});
             }
        };

        // Age Distribution Card
        dashboardContainer.innerHTML += createDashboardCardHtml(
            APP_CONFIG.UI_TEXTS.chartTitles.ageDistribution,
            `<p class="m-0 small">${APP_CONFIG.UI_TEXTS.deskriptiveStatistik.median}: <strong>${formatNumber(deskriptivStats.alter.median, 0, '--')}</strong> (${formatNumber(deskriptivStats.alter.min, 0, '--')}–${formatNumber(deskriptivStats.alter.max, 0, '--')}) ${APP_CONFIG.UI_TEXTS.deskriptiveStatistik.ageUnit}</p>
             <p class="m-0 small">[${formatNumber(deskriptivStats.alter.mean, 1, '--')} ± ${formatNumber(deskriptivStats.alter.sd, 1, '--')}]</p>`,
            'chart-dash-age', 'col-xxl-3 col-xl-4 col-lg-6 col-md-6', 'py-2', 'd-flex flex-column pt-2',
            [{ format: 'png', chartId: 'chart-dash-age', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSinglePNG.description, chartName: APP_CONFIG.UI_TEXTS.chartTitles.ageDistribution },
             { format: 'svg', chartId: 'chart-dash-age', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSingleSVG.description, chartName: APP_CONFIG.UI_TEXTS.chartTitles.ageDistribution }]
        );

        // Gender Distribution Card
        dashboardContainer.innerHTML += createDashboardCardHtml(
            APP_CONFIG.UI_TEXTS.chartTitles.genderDistribution,
            `<p class="m-0 small"><strong>${formatCountPercent(deskriptivStats.geschlecht.m, deskriptivStats.anzahlPatienten)}</strong> ${APP_CONFIG.UI_TEXTS.legendLabels.male}<br><strong>${formatCountPercent(deskriptivStats.geschlecht.f, deskriptivStats.anzahlPatienten)}</strong> ${APP_CONFIG.UI_TEXTS.legendLabels.female}</p>`,
            'chart-dash-gender', 'col-xxl-3 col-xl-4 col-lg-6 col-md-6', 'py-2', 'd-flex flex-column pt-2',
            [{ format: 'png', chartId: 'chart-dash-gender', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSinglePNG.description, chartName: APP_CONFIG.UI_TEXTS.chartTitles.genderDistribution },
             { format: 'svg', chartId: 'chart-dash-gender', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSingleSVG.description, chartName: APP_CONFIG.UI_TEXTS.chartTitles.genderDistribution }]
        );

        // Therapy Distribution Card
        dashboardContainer.innerHTML += createDashboardCardHtml(
            APP_CONFIG.UI_TEXTS.chartTitles.therapyDistribution,
            `<p class="m-0 small"><strong>${formatCountPercent(deskriptivStats.therapie['direkt OP'], deskriptivStats.anzahlPatienten)}</strong> ${APP_CONFIG.UI_TEXTS.legendLabels.direktOP}<br><strong>${formatCountPercent(deskriptivStats.therapie.nRCT, deskriptivStats.anzahlPatienten)}</strong> ${APP_CONFIG.UI_TEXTS.legendLabels.nRCT}</p>`,
            'chart-dash-therapy', 'col-xxl-3 col-xl-4 col-lg-6 col-md-6', 'py-2', 'd-flex flex-column pt-2',
            [{ format: 'png', chartId: 'chart-dash-therapy', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSinglePNG.description, chartName: APP_CONFIG.UI_TEXTS.chartTitles.therapyDistribution },
             { format: 'svg', chartId: 'chart-dash-therapy', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSingleSVG.description, chartName: APP_CONFIG.UI_TEXTS.chartTitles.therapyDistribution }]
        );

        // N-Status Card
        dashboardContainer.innerHTML += createDashboardCardHtml(
            APP_CONFIG.UI_TEXTS.chartTitles.statusN,
            `<p class="m-0 small"><strong>${formatCountPercent(deskriptivStats.nStatus.plus, deskriptivStats.anzahlPatienten)}</strong> ${APP_CONFIG.UI_TEXTS.legendLabels.nPositive}<br><strong>${formatCountPercent(deskriptivStats.nStatus.minus, deskriptivStats.anzahlPatienten)}</strong> ${APP_CONFIG.UI_TEXTS.legendLabels.nNegative}</p>`,
            'chart-dash-n-status', 'col-xxl-3 col-xl-4 col-lg-6 col-md-6', 'py-2', 'd-flex flex-column pt-2',
            [{ format: 'png', chartId: 'chart-dash-n-status', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSinglePNG.description, chartName: APP_CONFIG.UI_TEXTS.chartTitles.statusN },
             { format: 'svg', chartId: 'chart-dash-n-status', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSingleSVG.description, chartName: APP_CONFIG.UI_TEXTS.chartTitles.statusN }]
        );

        // AS-Status Card
        dashboardContainer.innerHTML += createDashboardCardHtml(
            APP_CONFIG.UI_TEXTS.chartTitles.statusAS,
            `<p class="m-0 small"><strong>${formatCountPercent(deskriptivStats.asStatus.plus, deskriptivStats.anzahlPatienten)}</strong> ${APP_CONFIG.UI_TEXTS.legendLabels.asPositive}<br><strong>${formatCountPercent(deskriptivStats.asStatus.minus, deskriptivStats.anzahlPatienten)}</strong> ${APP_CONFIG.UI_TEXTS.legendLabels.asNegative}</p>`,
            'chart-dash-as-status', 'col-xxl-3 col-xl-4 col-lg-6 col-md-6', 'py-2', 'd-flex flex-column pt-2',
            [{ format: 'png', chartId: 'chart-dash-as-status', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSinglePNG.description, chartName: APP_CONFIG.UI_TEXTS.chartTitles.statusAS },
             { format: 'svg', chartId: 'chart-dash-as-status', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSingleSVG.description, chartName: APP_CONFIG.UI_TEXTS.chartTitles.statusAS }]
        );

        // T2-Status Card
        dashboardContainer.innerHTML += createDashboardCardHtml(
            APP_CONFIG.UI_TEXTS.chartTitles.statusT2,
            `<p class="m-0 small"><strong>${formatCountPercent(deskriptivStats.t2Status.plus, deskriptivStats.anzahlPatienten)}</strong> ${APP_CONFIG.UI_TEXTS.legendLabels.t2Positive}<br><strong>${formatCountPercent(deskriptivStats.t2Status.minus, deskriptivStats.anzahlPatienten)}</strong> ${APP_CONFIG.UI_TEXTS.legendLabels.t2Negative}</p>`,
            'chart-dash-t2-status', 'col-xxl-3 col-xl-4 col-lg-6 col-md-6', 'py-2', 'd-flex flex-column pt-2',
            [{ format: 'png', chartId: 'chart-dash-t2-status', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSinglePNG.description, chartName: APP_CONFIG.UI_TEXTS.chartTitles.statusT2 },
             { format: 'svg', chartId: 'chart-dash-t2-status', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSingleSVG.description, chartName: APP_CONFIG.UI_TEXTS.chartTitles.statusT2 }]
        );

        // Render charts
        renderChartSafely(chartRenderer.renderAgeDistributionChart, 'chart-dash-age', deskriptivStats.alterData, {useCompactMargins: true, backgroundColor: 'transparent'});
        renderChartSafely(chartRenderer.renderPieChart, 'chart-dash-gender', [
            { label: APP_CONFIG.UI_TEXTS.legendLabels.male, value: deskriptivStats.geschlecht.m },
            { label: APP_CONFIG.UI_TEXTS.legendLabels.female, value: deskriptivStats.geschlecht.f }
        ], { useCompactMargins: true, backgroundColor: 'transparent' });
        renderChartSafely(chartRenderer.renderPieChart, 'chart-dash-therapy', [
            { label: APP_CONFIG.UI_TEXTS.legendLabels.direktOP, value: deskriptivStats.therapie['direkt OP'] },
            { label: APP_CONFIG.UI_TEXTS.legendLabels.nRCT, value: deskriptivStats.therapie.nRCT }
        ], { useCompactMargins: true, backgroundColor: 'transparent' });
        renderChartSafely(chartRenderer.renderPieChart, 'chart-dash-n-status', [
            { label: APP_CONFIG.UI_TEXTS.legendLabels.nPositive, value: deskriptivStats.nStatus.plus },
            { label: APP_CONFIG.UI_TEXTS.legendLabels.nNegative, value: deskriptivStats.nStatus.minus }
        ], { useCompactMargins: true, backgroundColor: 'transparent' });
        renderChartSafely(chartRenderer.renderPieChart, 'chart-dash-as-status', [
            { label: APP_CONFIG.UI_TEXTS.legendLabels.asPositive, value: deskriptivStats.asStatus.plus },
            { label: APP_CONFIG.UI_TEXTS.legendLabels.asNegative, value: deskriptivStats.asStatus.minus }
        ], { useCompactMargins: true, backgroundColor: 'transparent' });
        renderChartSafely(chartRenderer.renderPieChart, 'chart-dash-t2-status', [
            { label: APP_CONFIG.UI_TEXTS.legendLabels.t2Positive, value: deskriptivStats.t2Status.plus },
            { label: APP_CONFIG.UI_TEXTS.legendLabels.t2Negative, value: deskriptivStats.t2Status.minus }
        ], { useCompactMargins: true, backgroundColor: 'transparent' });

        ui_helpers.initializeTooltips(dashboardContainer);
    }

    function _renderT2MetricsOverview(currentKollektivData, currentKollektivId) {
        const t2Performance = statisticsService.calculateDiagnosticPerformance(currentKollektivData, 't2', 'n');
        const t2MetricsOverviewContainer = document.getElementById('t2-metrics-overview-container');
        if (t2MetricsOverviewContainer) {
            t2MetricsOverviewContainer.innerHTML = uiComponents.createT2MetricsOverview(t2Performance, currentKollektivId);
            ui_helpers.initializeTooltips(t2MetricsOverviewContainer);
        }
    }

    function _renderT2CriteriaControls() {
        const currentCriteria = t2CriteriaManager.getCurrentCriteria();
        const currentLogic = t2CriteriaManager.getCurrentLogic();
        const criteriaControlContainer = document.getElementById('t2-criteria-control-container');
        if (criteriaControlContainer) {
             criteriaControlContainer.innerHTML = uiComponents.createT2CriteriaControls(currentCriteria, currentLogic);
        }
        ui_helpers.updateT2CriteriaControlsUI(currentCriteria, currentLogic);
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
        ui_helpers.initializeTooltips(criteriaControlContainer);
    }

    function _renderBruteForceCard() {
        const bruteForceContainer = document.getElementById('brute-force-optimization-container');
        if (bruteForceContainer) {
            bruteForceContainer.innerHTML = uiComponents.createBruteForceCard(state.getCurrentKollektiv(), bruteForceManager.isWorkerAvailable());
            ui_helpers.updateBruteForceUI(bruteForceManager.getStatus(), bruteForceManager.getBruteForceResults(), bruteForceManager.isWorkerAvailable(), state.getCurrentKollektiv());
            ui_helpers.initializeTooltips(bruteForceContainer);
        }
    }

    function render(processedData) {
        const currentKollektivId = state.getCurrentKollektiv();
        const currentKollektivData = dataProcessor.filterDataByKollektiv(processedData, currentKollektivId);

        _renderDashboard(currentKollektivData, currentKollektivId);
        _renderT2CriteriaControls(); // Ensure controls are up-to-date
        _renderT2MetricsOverview(currentKollektivData, currentKollektivId);
        _renderBruteForceCard(); // Ensure BF card is rendered
        
        tableRenderer.renderAuswertungTable(currentKollektivData, currentSortState);
        ui_helpers.updateSortIcons(auswertungTableHeaderId, currentSortState);
        ui_helpers.initializeTooltips(document.getElementById('auswertung-tab-pane'));
    }

    return Object.freeze({
        init,
        render,
        updateBruteForceUI: ui_helpers.updateBruteForceUI // Expose for bruteForceManager events
    });

})();
