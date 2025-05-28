window.praesentationTabLogic = (() => {
    const TAB_ID = 'praesentation-tab-pane';
    let currentView = APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW;
    let currentStudyId = APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID;
    let currentPresentationData = null;
    let currentKollektivForComparison = null;

    function initializePraesentationTab() {
        currentView = state.getCurrentPresentationView() || APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW;
        currentStudyId = state.getCurrentPresentationStudyId();
        if (currentView === 'as-vs-t2' && currentStudyId === null) {
            currentStudyId = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
            state.setCurrentPresentationStudyId(currentStudyId);
        }

        preparePresentationData();
        renderPraesentationTab();
        if (typeof praesentationEventHandlers !== 'undefined' && typeof praesentationEventHandlers.setupPraesentationTabEventHandlers === 'function') {
            praesentationEventHandlers.setupPraesentationTabEventHandlers();
        }
    }

    function preparePresentationData() {
        const allRawData = kollektivStore.getAllProcessedData();
        const appliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
        const appliedT2Logic = t2CriteriaManager.getAppliedLogic();
        const allBruteForceResults = bruteForceManager.getAllResults();
        const allStats = statisticsService.calculateAllStatsForPublication(allRawData, appliedT2Criteria, appliedT2Logic, allBruteForceResults);

        if (!allStats) {
            currentPresentationData = null;
            return;
        }

        const currentGlobalKollektiv = state.getCurrentKollektiv();
        currentPresentationData = {
            statsGesamt: allStats.Gesamt,
            statsDirektOP: allStats['direkt OP'],
            statsNRCT: allStats.nRCT,
            kollektiv: currentGlobalKollektiv,
            patientCount: allStats[currentGlobalKollektiv]?.deskriptiv?.anzahlPatienten || 0,
            statsCurrentKollektiv: allStats[currentGlobalKollektiv]?.gueteAS
        };

        if (currentView === 'as-vs-t2') {
            let comparisonCriteriaSet = null;
            let kollektivForEval = currentGlobalKollektiv;
            let t2CriteriaLabelShort = 'T2 (unbekannt)';
            let t2CriteriaLabelFull = 'T2-Kriterien nicht spezifiziert';


            if (currentStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                comparisonCriteriaSet = {
                    id: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID,
                    name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                    displayShortName: 'Angew. T2',
                    criteria: appliedT2Criteria,
                    logic: appliedT2Logic,
                    studyInfo: { reference: 'Aktuell in der Anwendung definierte und angewendete Kriterien.' }
                };
                currentPresentationData.statsT2 = allStats[kollektivForEval]?.gueteT2_angewandt;
                currentPresentationData.vergleich = allStats[kollektivForEval]?.vergleichASvsT2_angewandt;
                t2CriteriaLabelShort = comparisonCriteriaSet.displayShortName;
                t2CriteriaLabelFull = studyT2CriteriaManager.formatCriteriaForDisplay(appliedT2Criteria, appliedT2Logic, false);

            } else if (currentStudyId && typeof studyT2CriteriaManager !== 'undefined') {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(currentStudyId);
                if (studySet) {
                    comparisonCriteriaSet = studySet;
                    kollektivForEval = studySet.applicableKollektiv || currentGlobalKollektiv;
                    currentPresentationData.statsT2 = allStats[kollektivForEval]?.gueteT2_literatur?.[currentStudyId];
                    currentPresentationData.vergleich = allStats[kollektivForEval]?.[`vergleichASvsT2_literatur_${currentStudyId}`];
                    t2CriteriaLabelShort = studySet.displayShortName || studySet.name;
                    t2CriteriaLabelFull = studyT2CriteriaManager.formatStudyCriteriaForDisplay(studySet);
                }
            }
            currentPresentationData.comparisonCriteriaSet = comparisonCriteriaSet;
            currentPresentationData.kollektivForComparison = kollektivForEval;
            currentPresentationData.patientCountForComparison = allStats[kollektivForEval]?.deskriptiv?.anzahlPatienten || 0;
            currentPresentationData.statsAS = allStats[kollektivForEval]?.gueteAS;
            currentPresentationData.t2CriteriaLabelShort = t2CriteriaLabelShort;
            currentPresentationData.t2CriteriaLabelFull = t2CriteriaLabelFull;
            currentKollektivForComparison = kollektivForEval;
        } else {
            currentKollektivForComparison = currentGlobalKollektiv;
        }
    }


    function renderPraesentationTab() {
        const tabContainer = document.getElementById(TAB_ID);
        if (!tabContainer) {
            ui_helpers.showLoadingSpinner(TAB_ID, `Container '${TAB_ID}' nicht gefunden.`);
            return;
        }
        ui_helpers.showLoadingSpinner(TAB_ID, 'Lade Präsentationsdaten...');

        if (!currentPresentationData) {
            preparePresentationData();
        }

        if (!currentPresentationData || !currentPresentationData.statsGesamt) {
            tabContainer.innerHTML = '<p class="text-center text-muted p-5">Fehler beim Laden der Präsentationsdaten oder Statistiken nicht verfügbar.</p>';
            ui_helpers.hideLoadingSpinner(TAB_ID);
            return;
        }

        tabContainer.innerHTML = '';
        const currentGlobalKollektiv = state.getCurrentKollektiv();
        const contentHTML = _createPresentationTabContent(currentView, currentPresentationData, currentStudyId, currentGlobalKollektiv);
        tabContainer.innerHTML = contentHTML;

        if (currentView === 'as-pur' && currentPresentationData.statsCurrentKollektiv) {
            renderASPurPerformanceChart(currentPresentationData.statsCurrentKollektiv, currentPresentationData.kollektiv);
        } else if (currentView === 'as-vs-t2' && currentPresentationData.statsAS && currentPresentationData.statsT2) {
            renderASvsT2ComparisonChart(currentPresentationData.statsAS, currentPresentationData.statsT2, currentPresentationData.kollektivForComparison, currentPresentationData.t2CriteriaLabelShort);
        }
        
        ui_helpers.initTooltips(tabContainer);
        ui_helpers.hideLoadingSpinner(TAB_ID);
    }

    function renderASPurPerformanceChart(stats, kollektivId) {
        const chartContainerId = "praes-as-pur-perf-chart";
        const chartContainer = document.getElementById(chartContainerId);
        if (!chartContainer || !stats || !stats.matrix) {
            if(chartContainer) chartContainer.innerHTML = `<p class="text-muted text-center p-3">Keine Daten für Performance Chart (${getKollektivDisplayName(kollektivId)}).</p>`;
            return;
        }
        chartContainer.innerHTML = '';

        const metrics = [
            { label: 'Sens', value: stats.sens?.value, ci: stats.sens?.ci },
            { label: 'Spez', value: stats.spez?.value, ci: stats.spez?.ci },
            { label: 'PPV', value: stats.ppv?.value, ci: stats.ppv?.ci },
            { label: 'NPV', value: stats.npv?.value, ci: stats.npv?.ci },
            { label: 'Acc', value: stats.acc?.value, ci: stats.acc?.ci },
            { label: 'AUC', value: stats.auc?.value, ci: stats.auc?.ci, digits: 3 }
        ];

        const chartData = metrics.map(m => ({
            label: m.label,
            value: (m.value !== null && !isNaN(m.value)) ? m.value : 0,
            ci_lower: m.ci?.lower,
            ci_upper: m.ci?.upper,
            displayValue: (m.value !== null && !isNaN(m.value)) ? formatPercent(m.value, m.digits || 1) : '--',
            tooltipText: `${m.label}: ${formatCI(m.value, m.ci?.lower, m.ci?.upper, m.digits || 1, true, '--')}`
        }));
        
        const chartOptions = {
            yAxisLabel: 'Wert',
            title: `Performance AS (Kollektiv: ${getKollektivDisplayName(kollektivId)})`,
            kollektivForExport: kollektivId,
            chartNameForFilename: `AS_Performance_${kollektivId.replace(/\s+/g, '_')}`,
            colorScale: (label) => {
                const colorMap = { 'Sens': '#4472C4', 'Spez': '#ED7D31', 'PPV': '#A5A5A5', 'NPV': '#FFC000', 'Acc': '#5B9BD5', 'AUC': '#70AD47'};
                return colorMap[label] || APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE;
            },
            tooltipKey: 'tooltip.chart.barValueWithCI',
            showErrorBars: true
        };
        chartManager.manageChartContainer(chartContainerId, chartRenderer.renderBarChart, chartData, chartOptions);
    }

    function renderASvsT2ComparisonChart(statsAS, statsT2, kollektivId, t2ShortName) {
        const chartContainerId = "praes-comp-chart-container";
        const chartContainer = document.getElementById(chartContainerId);
        if (!chartContainer || !statsAS || !statsT2) {
            if(chartContainer) chartContainer.innerHTML = `<p class="text-muted text-center p-3">Daten für Vergleichschart unvollständig (${getKollektivDisplayName(kollektivId)}).</p>`;
            return;
        }
        chartContainer.innerHTML = '';

        const metrics = [
            { key: 'sens', name: 'Sensitivität' },
            { key: 'spez', name: 'Spezifität' },
            { key: 'ppv', name: 'PPV' },
            { key: 'npv', name: 'NPV' },
            { key: 'acc', name: 'Accuracy' },
            { key: 'auc', name: 'AUC', digits: 3 }
        ];

        const chartData = metrics.flatMap(metric => [
            {
                label: `${metric.name} (AS)`,
                value: (statsAS[metric.key]?.value !== null && !isNaN(statsAS[metric.key]?.value)) ? statsAS[metric.key].value : 0,
                group: metric.name,
                method: 'AS',
                ci_lower: statsAS[metric.key]?.ci?.lower,
                ci_upper: statsAS[metric.key]?.ci?.upper,
                tooltipText: `${metric.name} (AS): ${formatCI(statsAS[metric.key]?.value, statsAS[metric.key]?.ci?.lower, statsAS[metric.key]?.ci?.upper, metric.digits || 1, true, '--')}`
            },
            {
                label: `${metric.name} (${t2ShortName})`,
                value: (statsT2[metric.key]?.value !== null && !isNaN(statsT2[metric.key]?.value)) ? statsT2[metric.key].value : 0,
                group: metric.name,
                method: t2ShortName,
                ci_lower: statsT2[metric.key]?.ci?.lower,
                ci_upper: statsT2[metric.key]?.ci?.upper,
                tooltipText: `${metric.name} (${t2ShortName}): ${formatCI(statsT2[metric.key]?.value, statsT2[metric.key]?.ci?.lower, statsT2[metric.key]?.ci?.upper, metric.digits || 1, true, '--')}`
            }
        ]);
        
        const colorScale = d3.scaleOrdinal()
            .domain(['AS', t2ShortName])
            .range([APP_CONFIG.CHART_SETTINGS.AS_COLOR, APP_CONFIG.CHART_SETTINGS.T2_COLOR]);

        const chartOptions = {
            yAxisLabel: 'Wert',
            title: `Vergleich AS vs. ${t2ShortName} (Kollektiv: ${getKollektivDisplayName(kollektivId)})`,
            kollektivForExport: kollektivId,
            chartNameForFilename: `AS_vs_${t2ShortName.replace(/\s+/g, '_')}_${kollektivId.replace(/\s+/g, '_')}`,
            colorScale: (label) => {
                const method = label.includes('(AS)') ? 'AS' : t2ShortName;
                return colorScale(method);
            },
            tooltipKey: 'tooltip.chart.barValueWithCI',
            showErrorBars: true,
            groupPadding: 0.2
        };
        chartManager.manageChartContainer(chartContainerId, chartRenderer.renderGroupedBarChart, chartData, chartOptions);
    }

    function handleViewChange(newView) {
        if (currentView !== newView) {
            state.setCurrentPresentationView(newView);
            currentView = newView;
            if (newView === 'as-vs-t2' && currentStudyId === null) {
                currentStudyId = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
                state.setCurrentPresentationStudyId(currentStudyId);
            }
            preparePresentationData();
            renderPraesentationTab();
        }
    }

    function handleStudyChange(newStudyId) {
        const studyIdToSet = (newStudyId === "" || newStudyId === undefined) ? null : newStudyId;
        if (currentStudyId !== studyIdToSet) {
            if(state.setCurrentPresentationStudyId(studyIdToSet)){
                currentStudyId = studyIdToSet;
                if (currentView === 'as-vs-t2') {
                    preparePresentationData();
                    renderPraesentationTab();
                }
            }
        }
    }
    
    function handleExportAction(actionId) {
        if (typeof exportService !== 'undefined' && typeof exportService.exportPraesentationData === 'function') {
            exportService.exportPraesentationData(actionId, currentPresentationData, state.getCurrentKollektiv());
        } else {
            ui_helpers.showToast("Export-Service nicht verfügbar.", "danger");
        }
    }

    function handleGlobalDataChange() {
        const tabPane = document.getElementById(TAB_ID);
        const isActive = tabPane && tabPane.classList.contains('active') && tabPane.classList.contains('show');
        
        preparePresentationData();
        if (isActive) {
            renderPraesentationTab();
        }
    }
    
    function getCurrentComparisonKollektiv() {
        return currentKollektivForComparison || state.getCurrentKollektiv();
    }


    return {
        init: initializePraesentationTab,
        render: renderPraesentationTab,
        refresh: renderPraesentationTab,
        handleViewChange,
        handleStudyChange,
        handleExportAction,
        handleGlobalDataChange,
        getCurrentComparisonKollektiv,
        _createPresentationTabContent: praesentationTabLogicExternal._createPresentationTabContent 
    };
})();

const praesentationTabLogicExternal = praesentationTabLogic;
