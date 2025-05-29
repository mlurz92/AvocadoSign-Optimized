const statistikTabLogic = (() => {
    let allProcessedData = null;
    let currentStatsLayout = APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT;
    let currentKollektiv1 = APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1;
    let currentKollektiv2 = APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2;
    let currentGlobalKollektiv = APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
    let appliedT2Criteria = null;
    let appliedT2Logic = null;
    let allStatsData = null;

    function initialize(processedData, initialSettings) {
        allProcessedData = processedData;
        if (initialSettings) {
            currentStatsLayout = initialSettings.statsLayout || currentStatsLayout;
            currentKollektiv1 = initialSettings.statsKollektiv1 || currentKollektiv1;
            currentKollektiv2 = initialSettings.statsKollektiv2 || currentKollektiv2;
            currentGlobalKollektiv = initialSettings.currentKollektiv || currentGlobalKollektiv;
            appliedT2Criteria = initialSettings.appliedT2Criteria ? cloneDeep(initialSettings.appliedT2Criteria) : getDefaultT2Criteria();
            appliedT2Logic = initialSettings.appliedT2Logic || APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
        }
    }

    function updateData(processedData, newSettings) {
        allProcessedData = processedData;
        if (newSettings) {
            currentStatsLayout = newSettings.statsLayout || currentStatsLayout;
            currentKollektiv1 = newSettings.statsKollektiv1 || currentKollektiv1;
            currentKollektiv2 = newSettings.statsKollektiv2 || currentKollektiv2;
            currentGlobalKollektiv = newSettings.currentKollektiv || currentGlobalKollektiv;
            if (newSettings.appliedT2Criteria) appliedT2Criteria = cloneDeep(newSettings.appliedT2Criteria);
            if (newSettings.appliedT2Logic) appliedT2Logic = newSettings.appliedT2Logic;
        }
    }

    function _calculateAndRenderStats() {
        if (!allProcessedData || !appliedT2Criteria || !appliedT2Logic) {
            console.warn("StatistikTabLogic: Daten oder T2 Kriterien nicht initialisiert.");
            ui_helpers.updateElementHTML('statistik-tab-content', '<p class="text-danger p-3">Notwendige Daten für Statistik-Tab nicht vollständig geladen. Bitte laden Sie die Seite neu oder überprüfen Sie die Anwendungskonfiguration.</p>');
            return;
        }

        const lang = state.getCurrentPublikationLang() || 'de';
        allStatsData = {};

        const container = document.getElementById('statistik-tab-content');
        if (!container) return;
        container.innerHTML = '';

        let filteredData1, evaluatedData1, kollektivName1;
        let filteredData2 = null, evaluatedData2 = null, kollektivName2 = null;

        if (currentStatsLayout === 'einzel') {
            kollektivName1 = currentGlobalKollektiv;
            filteredData1 = dataProcessor.filterDataByKollektiv(allProcessedData, kollektivName1);
            evaluatedData1 = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData1), appliedT2Criteria, appliedT2Logic);
            ui_helpers.updateElementHTML('statistik-tab-content-title', `Statistische Auswertung für Kollektiv: ${getKollektivDisplayName(kollektivName1)}`);
        } else {
            kollektivName1 = currentKollektiv1;
            kollektivName2 = currentKollektiv2;
            filteredData1 = dataProcessor.filterDataByKollektiv(allProcessedData, kollektivName1);
            filteredData2 = dataProcessor.filterDataByKollektiv(allProcessedData, kollektivName2);
            evaluatedData1 = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData1), appliedT2Criteria, appliedT2Logic);
            evaluatedData2 = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData2), appliedT2Criteria, appliedT2Logic);
            ui_helpers.updateElementHTML('statistik-tab-content-title', `Vergleich: ${getKollektivDisplayName(kollektivName1)} vs. ${getKollektivDisplayName(kollektivName2)}`);
        }

        if (!evaluatedData1 || evaluatedData1.length === 0) {
            container.innerHTML = `<p class="text-muted p-3">Keine Daten für das ausgewählte Kollektiv '${getKollektivDisplayName(kollektivName1)}' verfügbar.</p>`;
            return;
        }

        const deskriptivStats1 = statisticsService.calculateDescriptiveStats(evaluatedData1);
        allStatsData.deskriptiv = deskriptivStats1;
        container.insertAdjacentHTML('beforeend', tableRenderer.renderDescriptiveStatsTable(deskriptivStats1, kollektivName1, lang));

        const ageChartId = 'chart-deskriptiv-alter';
        container.insertAdjacentHTML('beforeend', `<div class="col-12 stat-card" id="${ageChartId}-card"><div class="card h-100"><div class="card-header" data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.chartAge.description.replace('[KOLLEKTIV]', getKollektivDisplayName(kollektivName1))}">${UI_TEXTS.chartTitles.ageDistribution} (${getKollektivDisplayName(kollektivName1)}) <span class="float-end card-header-buttons">${uiComponents.createDashboardCard('','','', '', '', '', [{icon:'fa-image', format:'png', chartId:ageChartId, chartName: 'Altersverteilung'},{icon:'fa-file-code', format:'svg', chartId:ageChartId, chartName:'Altersverteilung'}]).match(/<span class="card-header-buttons.*?span>/s)?.[0] || ''}</span></div><div class="card-body"><div id="${ageChartId}" class="dashboard-chart-container" style="min-height: 250px;"></div></div></div></div>`);
        if (deskriptivStats1 && deskriptivStats1.alterData && deskriptivStats1.alterData.length > 0) {
            chartRenderer.renderAgeDistributionChart(deskriptivStats1.alterData, ageChartId, { height: 300, margin: { top: 20, right: 20, bottom: 50, left: 50 } });
        } else {
            ui_helpers.updateElementHTML(ageChartId, `<p class="text-muted small text-center p-3">Keine Daten für Altersverteilung.</p>`);
        }

        const genderChartId = 'chart-deskriptiv-geschlecht';
        container.insertAdjacentHTML('beforeend', `<div class="col-12 stat-card" id="${genderChartId}-card"><div class="card h-100"><div class="card-header" data-tippy-content="${TOOLTIP_CONTENT.deskriptiveStatistik.chartGender.description.replace('[KOLLEKTIV]', getKollektivDisplayName(kollektivName1))}">${UI_TEXTS.chartTitles.genderDistribution} (${getKollektivDisplayName(kollektivName1)}) <span class="float-end card-header-buttons">${uiComponents.createDashboardCard('','','', '', '', '', [{icon:'fa-image', format:'png', chartId:genderChartId, chartName: 'Geschlechterverteilung'},{icon:'fa-file-code', format:'svg', chartId:genderChartId, chartName:'Geschlechterverteilung'}]).match(/<span class="card-header-buttons.*?span>/s)?.[0] || ''}</span></div><div class="card-body"><div id="${genderChartId}" class="dashboard-chart-container" style="min-height: 250px;"></div></div></div></div>`);
        if (deskriptivStats1 && deskriptivStats1.geschlecht) {
             const genderData = [
                 { label: UI_TEXTS.legendLabels.male, value: deskriptivStats1.geschlecht.m || 0 },
                 { label: UI_TEXTS.legendLabels.female, value: deskriptivStats1.geschlecht.f || 0 }
             ];
             if (deskriptivStats1.geschlecht.unbekannt > 0) genderData.push({ label: UI_TEXTS.legendLabels.unknownGender, value: deskriptivStats1.geschlecht.unbekannt});
             if (genderData.some(d => d.value > 0)) {
                chartRenderer.renderPieChart(genderData, genderChartId, {height: 300, margin: APP_CONFIG.CHART_SETTINGS.COMPACT_PIE_MARGIN, legendBelow: true });
             } else {
                ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung.</p>`);
             }
        } else {
             ui_helpers.updateElementHTML(genderChartId, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung.</p>`);
        }


        const gueteAS1 = statisticsService.calculateDiagnosticPerformance(evaluatedData1, 'as', 'n');
        allStatsData.gueteAS = gueteAS1;
        container.insertAdjacentHTML('beforeend', tableRenderer.renderDiagnosticPerformanceTable(gueteAS1, 'Avocado Sign', kollektivName1, lang));

        const gueteT2_1 = statisticsService.calculateDiagnosticPerformance(evaluatedData1, 't2', 'n');
        allStatsData.gueteT2 = gueteT2_1;
        container.insertAdjacentHTML('beforeend', tableRenderer.renderDiagnosticPerformanceTable(gueteT2_1, 'T2 (Angewandt)', kollektivName1, lang));

        const vergleichASvsT2_1 = statisticsService.compareDiagnosticMethods(evaluatedData1, 'as', 't2', 'n');
        allStatsData.vergleichASvsT2 = vergleichASvsT2_1;
        container.insertAdjacentHTML('beforeend', tableRenderer.renderComparisonTable(vergleichASvsT2_1, 'Avocado Sign', 'T2 (Angewandt)', kollektivName1, lang));

        const assoziationen1 = statisticsService.calculateAssociations(evaluatedData1, appliedT2Criteria);
        allStatsData.assoziationen = assoziationen1;
        container.insertAdjacentHTML('beforeend', tableRenderer.renderAssociationsTable(assoziationen1, kollektivName1, lang));


        if (currentStatsLayout === 'vergleich' && evaluatedData2 && evaluatedData2.length > 0) {
            const vergleichKollektive = statisticsService.compareCohorts(evaluatedData1, evaluatedData2, appliedT2Criteria, appliedT2Logic);
            allStatsData.vergleichKollektive = vergleichKollektive;

            const headersCompare = [
                { text: lang === 'de' ? 'Vergleichsaspekt' : 'Comparison Aspect', key: 'aspekt' },
                { text: lang === 'de' ? 'p-Wert' : 'p-value', key: 'pValue' },
                { text: lang === 'de' ? 'Testmethode' : 'Test Method', key: 'methode' }
            ];
            const rowsCompare = [
                { aspekt: `Accuracy (AS) ${getKollektivDisplayName(kollektivName1)} vs. ${getKollektivDisplayName(kollektivName2)}`, pValue: `${getPValueText(vergleichKollektive?.accuracyComparison?.as?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichKollektive?.accuracyComparison?.as?.pValue)}`, methode: vergleichKollektive?.accuracyComparison?.as?.testName },
                { aspekt: `Accuracy (T2) ${getKollektivDisplayName(kollektivName1)} vs. ${getKollektivDisplayName(kollektivName2)}`, pValue: `${getPValueText(vergleichKollektive?.accuracyComparison?.t2?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichKollektive?.accuracyComparison?.t2?.pValue)}`, methode: vergleichKollektive?.accuracyComparison?.t2?.testName },
                { aspekt: `AUC (AS) ${getKollektivDisplayName(kollektivName1)} vs. ${getKollektivDisplayName(kollektivName2)}`, pValue: `${getPValueText(vergleichKollektive?.aucComparison?.as?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichKollektive?.aucComparison?.as?.pValue)}`, methode: vergleichKollektive?.aucComparison?.as?.method },
                { aspekt: `AUC (T2) ${getKollektivDisplayName(kollektivName1)} vs. ${getKollektivDisplayName(kollektivName2)}`, pValue: `${getPValueText(vergleichKollektive?.aucComparison?.t2?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichKollektive?.aucComparison?.t2?.pValue)}`, methode: vergleichKollektive?.aucComparison?.t2?.method }
            ];
            const cardTitleComp = `${lang === 'de' ? 'Vergleich der Kollektive' : 'Cohort Comparison'}: ${getKollektivDisplayName(kollektivName1)} vs. ${getKollektivDisplayName(kollektivName2)}`;
            container.insertAdjacentHTML('beforeend', tableRenderer._createSimpleTable('vergleich-kollektive-stats', headersCompare, rowsCompare, cardTitleComp, 'vergleichKollektive', [], 'table-sm table-bordered'));
        } else if (currentStatsLayout === 'vergleich' && (!evaluatedData2 || evaluatedData2.length === 0)) {
            const cardTitleComp = `${lang === 'de' ? 'Vergleich der Kollektive' : 'Cohort Comparison'}: ${getKollektivDisplayName(kollektivName1)} vs. ${getKollektivDisplayName(kollektivName2)}`;
            container.insertAdjacentHTML('beforeend', uiComponents.createStatistikCard('vergleich-kollektive-stats', cardTitleComp, `<p class="text-muted">Keine Daten für Kollektiv '${getKollektivDisplayName(kollektivName2)}' verfügbar für Vergleich.</p>`, true, 'vergleichKollektive'));
        }

        const criteriaCompData = [];
        const globalKollektivForCompTable = currentGlobalKollektiv;
        const dataForGlobalKollektiv = dataProcessor.filterDataByKollektiv(allProcessedData, globalKollektivForCompTable);

        const asPerfGlobal = statisticsService.calculateDiagnosticPerformance(t2CriteriaManager.evaluateDataset(cloneDeep(dataForGlobalKollektiv), appliedT2Criteria, appliedT2Logic), 'as', 'n'); // AS eval on globalKollektivForCompTable
        criteriaCompData.push({ id: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID, name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME, performance: asPerfGlobal, evalKollektiv: globalKollektivForCompTable, nPatInEvalKollektiv: dataForGlobalKollektiv.length });

        const appliedT2PerfGlobal = statisticsService.calculateDiagnosticPerformance(t2CriteriaManager.evaluateDataset(cloneDeep(dataForGlobalKollektiv), appliedT2Criteria, appliedT2Logic), 't2', 'n');
        criteriaCompData.push({ id: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME, performance: appliedT2PerfGlobal, evalKollektiv: globalKollektivForCompTable, nPatInEvalKollektiv: dataForGlobalKollektiv.length });

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(studyConf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyConf.id);
            if (studySet) {
                 const dataForThisStudyEval = dataProcessor.filterDataByKollektiv(allProcessedData, studySet.applicableKollektiv || globalKollektivForCompTable);
                 const evaluatedDataStudy = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataForThisStudyEval), studySet);
                 const perfStudy = statisticsService.calculateDiagnosticPerformance(evaluatedDataStudy, 't2', 'n');
                 criteriaCompData.push({id: studySet.id, name: studySet.name, performance: perfStudy, evalKollektiv: studySet.applicableKollektiv || globalKollektivForCompTable, nPatInEvalKollektiv: dataForThisStudyEval.length });
            }
        });
        container.insertAdjacentHTML('beforeend', tableRenderer.renderCriteriaComparisonTable(criteriaCompData, globalKollektivForCompTable, {criteria: appliedT2Criteria, logic: appliedT2Logic}));


        ui_helpers.initializeTooltips(container);
    }

    function renderTabContent() {
        ui_helpers.updateStatistikSelectorsUI(currentStatsLayout, currentKollektiv1, currentKollektiv2);
        setTimeout(() => {
            try {
                _calculateAndRenderStats();
            } catch (error) {
                console.error("Fehler im StatistikTabLogic.renderTabContent/_calculateAndRenderStats:", error);
                const container = document.getElementById('statistik-tab-content');
                if (container) container.innerHTML = '<p class="text-danger p-3">Ein unerwarteter Fehler ist bei der Anzeige der Statistiken aufgetreten. Bitte überprüfen Sie die Konsole für Details.</p>';
                ui_helpers.showToast("Fehler beim Anzeigen der Statistiken.", "danger");
            }
        }, 0);
    }

    function getStatisticsDataForExport() {
        return allStatsData ? cloneDeep(allStatsData) : null;
    }

    return Object.freeze({
        initialize,
        updateData,
        renderTabContent,
        getStatisticsDataForExport
    });
})();
