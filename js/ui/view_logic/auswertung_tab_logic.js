const auswertungTabLogic = (() => {
    let allProcessedData = null;
    let currentKollektiv = APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
    let currentPage = 1;
    let rowsPerPage = APP_CONFIG.UI_SETTINGS.DEFAULT_TABLE_ROWS_PER_PAGE;
    let sortState = cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT);
    let evaluatedDataForTable = [];
    let mainAppInterfaceRef = null;

    const columns = Object.freeze([
        Object.freeze({ key: 'nr', label: 'Nr.', sortable: true, tooltipKey: 'auswertungTable.nr' }),
        Object.freeze({ key: 'name', label: 'Name, Vorname', sortable: true, tooltipKey: 'auswertungTable.name' }),
        Object.freeze({ key: 'therapie', label: 'Therapie', sortable: true, tooltipKey: 'auswertungTable.therapie' }),
        Object.freeze({ key: 'n_as_t2', label: 'N / AS / T2', sortable: true, isStatusColumn: true, subSortKeys: ['n', 'as', 't2'], tooltipKey: 'auswertungTable.n_as_t2' }),
        Object.freeze({ key: 'n_counts', label: 'N LK (+/Ges.)', sortable: true, tooltipKey: 'auswertungTable.n_counts' }),
        Object.freeze({ key: 'as_counts', label: 'AS LK (+/Ges.)', sortable: true, tooltipKey: 'auswertungTable.as_counts' }),
        Object.freeze({ key: 't2_counts', label: 'T2 LK (+/Ges.)', sortable: true, tooltipKey: 'auswertungTable.t2_counts' })
    ]);

    function initialize(processedData, initialSettings, mainAppInterface) {
        allProcessedData = processedData;
        mainAppInterfaceRef = mainAppInterface;
        if (initialSettings) {
            currentKollektiv = initialSettings.currentKollektiv || currentKollektiv;
            const savedSortState = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_SORT);
            if (savedSortState) {
                sortState = savedSortState;
            }
        }
        currentPage = 1;
        t2CriteriaManager.initialize();
        bruteForceManager.initialize(
            () => dataProcessor.filterDataByKollektiv(allProcessedData, state.getCurrentKollektiv()),
            (uiState, data) => ui_helpers.updateBruteForceUI(uiState, data, bruteForceManager.isWorkerAvailable(), state.getCurrentKollektiv()),
            (bestResultData) => {
                ui_helpers.showToast(`Brute-Force Optimierung abgeschlossen. Beste Metrik: ${formatNumber(bestResultData.metricValue, 4)}.`, 'success');
                if (mainAppInterfaceRef && typeof mainAppInterfaceRef.refreshSpecificTabs === 'function') {
                     mainAppInterfaceRef.refreshSpecificTabs(['statistik-tab', 'praesentation-tab', 'publikation-tab']);
                }
            },
            mainAppInterfaceRef
        );
    }

    function updateData(processedData, newSettings) {
        allProcessedData = processedData;
        if (newSettings) {
            currentKollektiv = newSettings.currentKollektiv || currentKollektiv;
            const savedSortState = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_SORT);
            sortState = savedSortState || cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT);
        }
        currentPage = 1;
        bruteForceManager.updateKollektivData(() => dataProcessor.filterDataByKollektiv(allProcessedData, state.getCurrentKollektiv()));
    }

    function setSort(key, subKey = null) {
        if (sortState.key === key && sortState.subKey === subKey) {
            sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
            sortState.key = key;
            sortState.subKey = subKey;
            sortState.direction = 'asc';
        }
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_SORT, sortState);
        currentPage = 1;
        renderTabContent();
    }

    function setCurrentPage(page) {
        const totalPages = Math.ceil((evaluatedDataForTable?.length || 0) / rowsPerPage);
        currentPage = Math.max(1, Math.min(page, totalPages || 1));
        renderTabContent();
    }

    function _renderDashboard() {
        const dashboardContainer = document.getElementById('auswertung-dashboard-content');
        if (!dashboardContainer || !evaluatedDataForTable) return;

        dashboardContainer.innerHTML = '';
        const kollektivName = currentKollektiv;
        const stats = statisticsService.calculateDescriptiveStats(evaluatedDataForTable);

        const cards = [
            { title: UI_TEXTS.chartTitles.statusN, content: `<h3 class="metric-value">${stats.nStatus?.plus || 0} <span class="small">N+</span> / ${stats.nStatus?.minus || 0} <span class="small">N-</span></h3>`, chartId: null, tooltipKey: 'headerStats.statusN' },
            { title: UI_TEXTS.chartTitles.statusAS, content: `<h3 class="metric-value">${stats.asStatus?.plus || 0} <span class="small">AS+</span> / ${stats.asStatus?.minus || 0} <span class="small">AS-</span></h3>`, chartId: null, tooltipKey: 'headerStats.statusAS' },
            { title: UI_TEXTS.chartTitles.statusT2, content: `<h3 class="metric-value">${stats.t2Status?.plus || 0} <span class="small">T2+</span> / ${stats.t2Status?.minus || 0} <span class="small">T2-</span></h3>`, chartId: null, tooltipKey: 'headerStats.statusT2' },
            { title: UI_TEXTS.chartTitles.ageDistribution, content: '', chartId: 'chart-dash-age', tooltipKey: 'deskriptiveStatistik.chartAge' },
            { title: UI_TEXTS.chartTitles.genderDistribution, content: '', chartId: 'chart-dash-gender', tooltipKey: 'deskriptiveStatistik.chartGender' },
            { title: UI_TEXTS.chartTitles.therapyDistribution, content: '', chartId: 'chart-dash-therapy', tooltipKey: 'deskriptiveStatistik.therapie' }
        ];

        cards.forEach(card => {
            const downloadButtons = card.chartId ? [
                {icon:'fa-image', format:'png', chartId:card.chartId, chartName: card.title.replace(/\s+/g,'_')},
                {icon:'fa-file-code', format:'svg', chartId:card.chartId, chartName: card.title.replace(/\s+/g,'_')}
            ] : [];
            dashboardContainer.insertAdjacentHTML('beforeend', uiComponents.createDashboardCard(card.title, card.content, card.chartId, 'mb-3', '', 'p-2', downloadButtons));
        });

        if (stats.alterData && stats.alterData.length > 0) {
            chartRenderer.renderAgeDistributionChart(stats.alterData, 'chart-dash-age', { height: 180 });
        }
        if (stats.geschlecht) {
            const genderData = [
                { label: UI_TEXTS.legendLabels.male, value: stats.geschlecht.m || 0 },
                { label: UI_TEXTS.legendLabels.female, value: stats.geschlecht.f || 0 },
            ];
             if (stats.geschlecht.unbekannt > 0) genderData.push({ label: UI_TEXTS.legendLabels.unknownGender, value: stats.geschlecht.unbekannt});
             if(genderData.some(d => d.value > 0)) chartRenderer.renderPieChart(genderData, 'chart-dash-gender', { height: 180, innerRadiusFactor: 0, margin: APP_CONFIG.CHART_SETTINGS.COMPACT_PIE_MARGIN });
        }
         if (stats.therapie) {
             const therapyData = [
                 { label: getKollektivDisplayName('direkt OP'), value: stats.therapie['direkt OP'] || 0 },
                 { label: getKollektivDisplayName('nRCT'), value: stats.therapie.nRCT || 0 }
             ];
              if (stats.therapie.unbekannt > 0) therapyData.push({ label: 'Unbekannt', value: stats.therapie.unbekannt});
              if(therapyData.some(d=>d.value > 0)) chartRenderer.renderPieChart(therapyData, 'chart-dash-therapy', { height: 180, innerRadiusFactor: 0, margin: APP_CONFIG.CHART_SETTINGS.COMPACT_PIE_MARGIN });
         }
    }

    function _applyAndReEvaluateData() {
        const filteredData = dataProcessor.filterDataByKollektiv(allProcessedData, currentKollektiv);
        evaluatedDataForTable = t2CriteriaManager.evaluateDataset(filteredData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
    }


    function renderTabContent() {
        if (!allProcessedData) {
            console.warn("AuswertungTabLogic: allProcessedData ist nicht initialisiert.");
             const container = document.getElementById('auswertung-tab-content');
             if(container) ui_helpers.updateElementHTML('auswertung-tab-content', '<p class="text-danger p-3">Keine Daten zum Anzeigen vorhanden. Bitte laden Sie die Seite neu.</p>');
            return;
        }

        const t2CriteriaContainer = document.getElementById('t2-criteria-definition-container');
        if (t2CriteriaContainer) {
            t2CriteriaContainer.innerHTML = uiComponents.createT2CriteriaControls(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
        }

        const bruteForceContainer = document.getElementById('brute-force-container');
        if (bruteForceContainer) {
             bruteForceContainer.innerHTML = uiComponents.createBruteForceCard(currentKollektiv, bruteForceManager.isWorkerAvailable());
             ui_helpers.updateBruteForceUI(bruteForceManager.getCurrentState(), bruteForceManager.getCurrentData(), bruteForceManager.isWorkerAvailable(), currentKollektiv);
        }

        _applyAndReEvaluateData();
        _renderDashboard();

        const t2MetricsContainer = document.getElementById('t2-metrics-overview-container');
        if (t2MetricsContainer && evaluatedDataForTable.length > 0) {
            const t2Performance = statisticsService.calculateDiagnosticPerformance(evaluatedDataForTable, 't2', 'n');
            t2MetricsContainer.innerHTML = uiComponents.createT2MetricsOverview(t2Performance, currentKollektiv);
        } else if (t2MetricsContainer) {
            t2MetricsContainer.innerHTML = uiComponents.createT2MetricsOverview(null, currentKollektiv);
        }

        const tableHeaderId = 'auswertung-tabelle-header';
        tableRenderer.renderAuswertungTabelle(evaluatedDataForTable, currentPage, rowsPerPage, sortState, columns);
        ui_helpers.updateSortIcons(tableHeaderId, sortState);
        ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());

        const tabContentElement = document.getElementById('auswertung-tab-pane');
        if (tabContentElement) ui_helpers.initializeTooltips(tabContentElement);

    }

    function getAuswertungsDataForExport() {
        if (!evaluatedDataForTable) return [];
        return evaluatedDataForTable.slice().sort(getSortFunction(sortState.key, sortState.direction, sortState.subKey));
    }

    return Object.freeze({
        initialize,
        updateData,
        setSort,
        setCurrentPage,
        renderTabContent,
        getAuswertungsDataForExport,
        getColumns: () => columns
    });
})();
