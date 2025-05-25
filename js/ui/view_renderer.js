const viewRenderer = (() => {

    function _renderTabContent(tabId, renderFunction, lang = 'de', ...args) {
        const containerId = `${tabId}-pane`;
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container #${containerId} nicht gefunden für Tab ${tabId}.`);
            return;
        }
        const loadingText = UI_TEXTS.general?.[lang]?.loadingContent || UI_TEXTS.general?.de?.loadingContent || "Lade Inhalt...";
        ui_helpers.updateElementHTML(containerId, `<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">${loadingText}</span></div></div>`);
        try {
            const contentHTML = renderFunction(lang, ...args); // Pass lang to the specific render function
            const noContentGeneratedText = UI_TEXTS.general?.[lang]?.noContentGenerated || UI_TEXTS.general?.de?.noContentGenerated || "Kein Inhalt generiert.";
            ui_helpers.updateElementHTML(containerId, contentHTML || `<p class="text-muted p-3">${noContentGeneratedText}</p>`);
            ui_helpers.initializeTooltips(container);
        } catch (error) {
            console.error(`Fehler beim Rendern von Tab ${tabId}:`, error);
            const errorLoadingTabText = (UI_TEXTS.general?.[lang]?.errorLoadingTab || UI_TEXTS.general?.de?.errorLoadingTab || "Fehler beim Laden des Tabs: [ERROR_MESSAGE]").replace("[ERROR_MESSAGE]", error.message);
            const errorMessage = `<div class="alert alert-danger m-3">${errorLoadingTabText}</div>`;
            ui_helpers.updateElementHTML(containerId, errorMessage);
            const errorToastText = (UI_TEXTS.general?.[lang]?.errorToastTab || UI_TEXTS.general?.de?.errorToastTab || "Fehler beim Laden des Tabs '[TAB_ID]'.").replace("[TAB_ID]", tabId);
            ui_helpers.showToast(errorToastText, 'danger');
        }
    }

    function renderDatenTab(data, sortState, lang = 'de') { // lang added, defaults to 'de'
        _renderTabContent('daten-tab', (effectiveLang) => { // Pass lang to inner function
             if (!data) throw new Error(UI_TEXTS.errors?.[effectiveLang]?.noDataForTable || UI_TEXTS.errors?.de?.noDataForTable || "Daten für Datentabelle nicht verfügbar.");
             const buttonTextExpand = UI_TEXTS.dataHandling?.[effectiveLang]?.expandAllDetails || UI_TEXTS.dataHandling?.de?.expandAllDetails || "Alle Details Einblenden";
             const tooltipExpandAll = TOOLTIP_CONTENT?.[effectiveLang]?.datenTable?.expandAll || TOOLTIP_CONTENT?.de?.datenTable?.expandAll || 'Alle Details ein-/ausblenden';
             const toggleButtonHTML = `
                 <div class="d-flex justify-content-end mb-3" id="daten-toggle-button-container">
                     <button id="daten-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${tooltipExpandAll}">
                        ${buttonTextExpand} <i class="fas fa-chevron-down ms-1"></i>
                    </button>
                 </div>`;
            const tableHTML = dataTabLogic.createDatenTableHTML(data, sortState, effectiveLang); // Pass lang to dataTabLogic
            const finalHTML = toggleButtonHTML + `<div class="table-responsive">${tableHTML}</div>`;

            setTimeout(() => {
                 const tableBody = document.getElementById('daten-table-body');
                 const tableHeader = document.getElementById('daten-table-header');
                 if (tableBody && data.length > 0) ui_helpers.attachRowCollapseListeners(tableBody);
                 if (tableHeader) ui_helpers.updateSortIcons(tableHeader.id, sortState);
            }, 0);
            return finalHTML;
        }, lang, data, sortState); // Pass lang to _renderTabContent
    }

    function _renderAuswertungDashboardCharts(stats, lang = 'de') {
        const effectiveLang = UI_TEXTS?.kollektivDisplayNames?.[lang] ? lang : 'de';
        const ids = ['chart-dash-age', 'chart-dash-gender', 'chart-dash-therapy', 'chart-dash-status-n', 'chart-dash-status-as', 'chart-dash-status-t2'];
        const noDataText = UI_TEXTS.general?.[effectiveLang]?.notAvailableShort || UI_TEXTS.general?.de?.notAvailableShort || "N/A";

        if (!stats || stats.anzahlPatienten === 0) { ids.forEach(id => ui_helpers.updateElementHTML(id, `<p class="text-muted small text-center p-2">${noDataText}</p>`)); return; };
        const histOpts = { height: 130, margin: { top: 5, right: 10, bottom: 25, left: 35 }, useCompactMargins: true, lang: effectiveLang, xAxisLabel: UI_TEXTS.axisLabels?.[effectiveLang]?.age, yAxisLabel: UI_TEXTS.axisLabels?.[effectiveLang]?.patientCount, tooltipLabels: {age: UI_TEXTS.axisLabels?.[effectiveLang]?.ageShort || 'Alter', count: UI_TEXTS.axisLabels?.[effectiveLang]?.countShort || 'Anzahl'} };
        const pieOpts = { height: 130, margin: { top: 5, right: 5, bottom: 35, left: 5 }, innerRadiusFactor: 0.45, outerRadiusFactor: 0.95, fontSize: '8px', useCompactMargins: true, legendBelow: true, lang: effectiveLang };
        
        const genderData = [
            {label: UI_TEXTS.legendLabels?.[effectiveLang]?.male || 'Männlich', value: stats.geschlecht?.m ?? 0},
            {label: UI_TEXTS.legendLabels?.[effectiveLang]?.female || 'Weiblich', value: stats.geschlecht?.f ?? 0}
        ];
        if(stats.geschlecht?.unbekannt > 0) genderData.push({label: UI_TEXTS.legendLabels?.[effectiveLang]?.unknownGender || 'Unbekannt', value: stats.geschlecht.unbekannt });

        const therapyData = [
            {label: UI_TEXTS.legendLabels?.[effectiveLang]?.direktOP || 'Direkt OP', value: stats.therapie?.['direkt OP'] ?? 0},
            {label: UI_TEXTS.legendLabels?.[effectiveLang]?.nRCT || 'nRCT', value: stats.therapie?.nRCT ?? 0}
        ];
        const chartErrorText = UI_TEXTS.errors?.[effectiveLang]?.chartError || UI_TEXTS.errors?.de?.chartError || "Chart Fehler";
        try {
            chartRenderer.renderAgeDistributionChart(stats.alterData || [], ids[0], histOpts);
            chartRenderer.renderPieChart(genderData, ids[1], {...pieOpts, legendItemCount: genderData.length});
            chartRenderer.renderPieChart(therapyData, ids[2], {...pieOpts, legendItemCount: therapyData.length});
            chartRenderer.renderPieChart([{label: UI_TEXTS.legendLabels?.[effectiveLang]?.nPositive || 'N+', value: stats.nStatus?.plus ?? 0}, {label: UI_TEXTS.legendLabels?.[effectiveLang]?.nNegative || 'N-', value: stats.nStatus?.minus ?? 0}], ids[3], {...pieOpts, legendItemCount: 2});
            chartRenderer.renderPieChart([{label: UI_TEXTS.legendLabels?.[effectiveLang]?.asPositive || 'AS+', value: stats.asStatus?.plus ?? 0}, {label: UI_TEXTS.legendLabels?.[effectiveLang]?.asNegative || 'AS-', value: stats.asStatus?.minus ?? 0}], ids[4], {...pieOpts, legendItemCount: 2});
            chartRenderer.renderPieChart([{label: UI_TEXTS.legendLabels?.[effectiveLang]?.t2Positive || 'T2+', value: stats.t2Status?.plus ?? 0}, {label: UI_TEXTS.legendLabels?.[effectiveLang]?.t2Negative || 'T2-', value: stats.t2Status?.minus ?? 0}], ids[5], {...pieOpts, legendItemCount: 2});
        }
        catch(error) { console.error("Fehler bei Chart-Rendering im Dashboard:", error); ids.forEach(id => ui_helpers.updateElementHTML(id, `<p class="text-danger small text-center p-2">${chartErrorText}</p>`)); }
    }

     function _renderCriteriaComparisonTable(containerId, data, kollektiv, lang = 'de') {
         const effectiveLang = UI_TEXTS?.kollektivDisplayNames?.[lang] ? lang : 'de';
         const container = document.getElementById(containerId); if (!container) return;
         const invalidDataText = UI_TEXTS.errors?.[effectiveLang]?.invalidDataForComparison || UI_TEXTS.errors?.de?.invalidDataForComparison || "Ungültige Daten für Vergleich.";
         if (!Array.isArray(data)) { container.innerHTML = uiComponents.createStatistikCard('criteriaComparisonTable', UI_TEXTS.criteriaComparison?.[effectiveLang]?.title || UI_TEXTS.criteriaComparison?.de?.title, `<p class="p-3 text-muted small">${invalidDataText}</p>`, false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich', effectiveLang); return; }

         const comparisonSetIds = APP_CONFIG.DEFAULT_SETTINGS.CRITERIA_COMPARISON_SETS || [];
         const results = []; const baseDataClone = cloneDeep(data);

         comparisonSetIds.forEach(setId => {
            let perf = null; let setName = getKollektivDisplayName('unbekannt', effectiveLang); let setIdUsed = setId;
            try {
                if (setId === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) {
                    perf = statisticsService.calculateDiagnosticPerformance(baseDataClone, 'as', 'n'); setName = getKollektivDisplayName(APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID, effectiveLang);
                } else if (setId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                    perf = statisticsService.calculateDiagnosticPerformance(baseDataClone, 't2', 'n'); setName = getKollektivDisplayName(APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, effectiveLang);
                } else {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(setId);
                    if (studySet) { const evaluatedData = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(baseDataClone), studySet); perf = statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n'); setName = studySet.nameKey ? (UI_TEXTS.praesentationTab?.studyNames?.[effectiveLang]?.[studySet.nameKey] || UI_TEXTS.praesentationTab?.studyNames?.de?.[studySet.nameKey] || studySet.id) : (studySet.name || studySet.id); }
                    else { console.warn(`Kriterienset ${setId} für Vergleich nicht gefunden.`); }
                }
            } catch (error) { console.error(`Fehler bei Berechnung für Vergleichsset ${setId}:`, error); }

            if (perf && perf.auc && !isNaN(perf.auc.value)) { results.push({ id: setIdUsed, name: setName, sens: perf.sens?.value, spez: perf.spez?.value, ppv: perf.ppv?.value, npv: perf.npv?.value, acc: perf.acc?.value, auc: perf.auc?.value }); }
            else { results.push({ id: setIdUsed, name: setName, sens: NaN, spez: NaN, ppv: NaN, npv: NaN, acc: NaN, auc: NaN }); }
         });

         results.sort((a, b) => { if (a.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) return -1; if (b.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) return 1; if (a.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) return -1; if (b.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) return 1; return (a.name || '').localeCompare(b.name || '', effectiveLang); });
         const tableHTML = statistikTabLogic.createCriteriaComparisonTableHTML(results, getKollektivDisplayName(kollektiv, effectiveLang), effectiveLang);
         container.innerHTML = uiComponents.createStatistikCard('criteriaComparisonTable', UI_TEXTS.criteriaComparison?.[effectiveLang]?.title || UI_TEXTS.criteriaComparison?.de?.title, tableHTML, false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich', effectiveLang);
    }

    function renderAuswertungTab(data, currentCriteria, currentLogic, sortState, currentKollektiv, bfWorkerAvailable, lang = 'de') { // lang added, defaults to 'de'
         _renderTabContent('auswertung-tab', (effectiveLang) => { // Pass lang to inner function
            const errorNoDataText = UI_TEXTS.errors?.[effectiveLang]?.noDataForEvaluation || UI_TEXTS.errors?.de?.noDataForEvaluation || "Daten oder Kriterien für Auswertungstab nicht verfügbar.";
            if (!data || !currentCriteria || !currentLogic) throw new Error(errorNoDataText);

             const dashboardContainerId = 'auswertung-dashboard';
             const metricsOverviewContainerId = 't2-metrics-overview';
             const bruteForceCardContainerId = 'brute-force-card-container';
             const tableCardContainerId = 'auswertung-table-card-container';
             
             const criteriaControlsHTML = uiComponents.createT2CriteriaControls(currentCriteria, currentLogic, effectiveLang);
             const bruteForceCardHTML = uiComponents.createBruteForceCard(getKollektivDisplayName(currentKollektiv, effectiveLang), bfWorkerAvailable, effectiveLang);
             const auswertungTableCardHTML = auswertungTabLogic.createAuswertungTableCardHTML(data, sortState, currentCriteria, currentLogic, effectiveLang);

             const loadingDashboardText = UI_TEXTS.general?.[effectiveLang]?.loadingDashboard || UI_TEXTS.general?.de?.loadingDashboard || "Lade Dashboard...";
             const loadingMetricsOverviewText = UI_TEXTS.general?.[effectiveLang]?.loadingMetricsOverview || UI_TEXTS.general?.de?.loadingMetricsOverview || "Lade Metrikübersicht...";

             let finalHTML = `
                 <div class="row g-2 mb-3" id="${dashboardContainerId}">
                     <div class="col-12"><p class="text-muted text-center small p-3">${loadingDashboardText}</p></div>
                 </div>
                 <div class="row g-4">
                     <div class="col-12">${criteriaControlsHTML}</div>
                     <div class="col-12 mb-3" id="${metricsOverviewContainerId}">
                         <p class="text-muted small p-3">${loadingMetricsOverviewText}</p>
                     </div>
                     <div class="col-12" id="${bruteForceCardContainerId}">
                         ${bruteForceCardHTML}
                     </div>
                     <div class="col-12" id="${tableCardContainerId}">
                         ${auswertungTableCardHTML}
                     </div>
                 </div>`;

             setTimeout(() => {
                 const dashboardContainer = document.getElementById(dashboardContainerId);
                 const metricsOverviewContainer = document.getElementById(metricsOverviewContainerId);
                 const tableContainer = document.getElementById('auswertung-table-container');

                 if (dashboardContainer) {
                     try {
                         const stats = statisticsService.calculateDescriptiveStats(data);
                         const noDataForDashboardText = UI_TEXTS.general?.[effectiveLang]?.noDataForDashboard || UI_TEXTS.general?.de?.noDataForDashboard || "Keine Daten für Dashboard.";
                         if (!stats || stats.anzahlPatienten === 0) {
                             ui_helpers.updateElementHTML(dashboardContainerId, `<div class="col-12"><p class="text-muted text-center small p-3">${noDataForDashboardText}</p></div>`);
                         } else {
                             const downloadIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image' : 'fa-download';
                             const downloadIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code' : 'fa-download';
                             const pngTooltip = TOOLTIP_CONTENT?.[effectiveLang]?.exportTab?.chartSinglePNG?.description || TOOLTIP_CONTENT?.de?.exportTab?.chartSinglePNG?.description || 'Als PNG';
                             const svgTooltip = TOOLTIP_CONTENT?.[effectiveLang]?.exportTab?.chartSingleSVG?.description || TOOLTIP_CONTENT?.de?.exportTab?.chartSingleSVG?.description || 'Als SVG';
                             const createDlBtns = (baseId) => [{id:`dl-${baseId}-png`, icon: downloadIconPNG, tooltip: pngTooltip, format:'png'}, {id:`dl-${baseId}-svg`, icon: downloadIconSVG, tooltip: svgTooltip, format:'svg'}];
                             const chartTitles = UI_TEXTS.chartTitles?.[effectiveLang] || UI_TEXTS.chartTitles?.de;

                             dashboardContainer.innerHTML = `
                                ${uiComponents.createDashboardCard(chartTitles.ageDistribution, `<p class="mb-0 small">${effectiveLang === 'de' ? 'Median' : 'Median'}: ${formatNumber(stats.alter?.median, 1, '--', false, effectiveLang)} (${formatNumber(stats.alter?.min, 0, '--', false, effectiveLang)} - ${formatNumber(stats.alter?.max, 0, '--', false, effectiveLang)})</p>`, 'chart-dash-age', '', '', 'p-1', createDlBtns('chart-dash-age'), effectiveLang)}
                                ${uiComponents.createDashboardCard(chartTitles.genderDistribution, `<p class="mb-0 small">${UI_TEXTS.genderDisplayNames[effectiveLang]?.m || 'M'}: ${stats.geschlecht?.m ?? 0} ${UI_TEXTS.genderDisplayNames[effectiveLang]?.f || 'W'}: ${stats.geschlecht?.f ?? 0}</p>`, 'chart-dash-gender', '', '', 'p-1', createDlBtns('chart-dash-gender'), effectiveLang)}
                                ${uiComponents.createDashboardCard(chartTitles.therapyDistribution, `<p class="mb-0 small">${getKollektivDisplayName('direkt OP', effectiveLang)}: ${stats.therapie?.['direkt OP'] ?? 0} ${getKollektivDisplayName('nRCT', effectiveLang)}: ${stats.therapie?.nRCT ?? 0}</p>`, 'chart-dash-therapy', '', '', 'p-1', createDlBtns('chart-dash-therapy'), effectiveLang)}
                                ${uiComponents.createDashboardCard(chartTitles.statusN, `<p class="mb-0 small">N+: ${stats.nStatus?.plus ?? 0} N-: ${stats.nStatus?.minus ?? 0}</p>`, 'chart-dash-status-n', '', '', 'p-1', createDlBtns('chart-dash-status-n'), effectiveLang)}
                                ${uiComponents.createDashboardCard(chartTitles.statusAS, `<p class="mb-0 small">AS+: ${stats.asStatus?.plus ?? 0} AS-: ${stats.asStatus?.minus ?? 0}</p>`, 'chart-dash-status-as', '', '', 'p-1', createDlBtns('chart-dash-status-as'), effectiveLang)}
                                ${uiComponents.createDashboardCard(chartTitles.statusT2, `<p class="mb-0 small">T2+: ${stats.t2Status?.plus ?? 0} T2-: ${stats.t2Status?.minus ?? 0}</p>`, 'chart-dash-status-t2', '', '', 'p-1', createDlBtns('chart-dash-status-t2'), effectiveLang)}
                             `;
                              _renderAuswertungDashboardCharts(stats, effectiveLang);
                         }
                     } catch (error) { console.error("Fehler _renderAuswertungDashboard:", error); ui_helpers.updateElementHTML(dashboardContainerId, `<div class="col-12"><div class="alert alert-danger">${UI_TEXTS.errors?.[effectiveLang]?.dashboardError || UI_TEXTS.errors?.de?.dashboardError || 'Dashboard Fehler.'}</div></div>`); }
                 }

                 if (metricsOverviewContainer) {
                     try {
                        const statsT2 = statisticsService.calculateDiagnosticPerformance(data, 't2', 'n');
                        ui_helpers.updateElementHTML(metricsOverviewContainer.id, uiComponents.createT2MetricsOverview(statsT2, getKollektivDisplayName(currentKollektiv, effectiveLang), effectiveLang));
                     } catch (error) { console.error("Fehler beim Rendern der T2 Metrikübersicht:", error); ui_helpers.updateElementHTML(metricsOverviewContainer.id, `<div class="alert alert-warning p-2 small">${UI_TEXTS.errors?.[effectiveLang]?.t2MetricsError || UI_TEXTS.errors?.de?.t2MetricsError || 'Fehler T2-Metriken.'}</div>`); }
                 }

                 if(tableContainer) {
                    const tableBody = tableContainer.querySelector('#auswertung-table-body');
                    const tableHeader = tableContainer.querySelector('#auswertung-table-header');
                    if (tableBody && data.length > 0) ui_helpers.attachRowCollapseListeners(tableBody);
                    if (tableHeader) ui_helpers.updateSortIcons(tableHeader.id, sortState);
                 }

                 ui_helpers.updateT2CriteriaControlsUI(currentCriteria, currentLogic);
                 ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved(), effectiveLang);
                 ui_helpers.updateBruteForceUI('idle', {}, bfWorkerAvailable, currentKollektiv, effectiveLang);

             }, 10);

             return finalHTML;
        }, lang, data, currentCriteria, currentLogic, sortState, currentKollektiv, bfWorkerAvailable); // Pass lang
    }

    function renderStatistikTab(processedDataFull, appliedCriteria, appliedLogic, layout, kollektiv1, kollektiv2, currentGlobalKollektiv, lang = 'de') { // lang added
        _renderTabContent('statistik-tab', (effectiveLang) => { // Pass lang
             const errorNoDataText = UI_TEXTS.errors?.[effectiveLang]?.noDataForStatistics || UI_TEXTS.errors?.de?.noDataForStatistics || "Statistik-Daten nicht verfügbar.";
             if (!processedDataFull) throw new Error(errorNoDataText);

             let datasets = [], kollektivNames = [], kollektivDisplayNames = [];
             let baseEvaluatedData = [];
             try {
                  baseEvaluatedData = t2CriteriaManager.evaluateDataset(cloneDeep(processedDataFull), appliedCriteria, appliedLogic);
             } catch(e) { console.error("Fehler bei der T2 Evaluierung für Statistik:", e); }

             if (layout === 'einzel') { const singleData = dataProcessor.filterDataByKollektiv(baseEvaluatedData, currentGlobalKollektiv); datasets.push(singleData); kollektivNames.push(currentGlobalKollektiv); kollektivDisplayNames.push(getKollektivDisplayName(currentGlobalKollektiv, effectiveLang)); }
             else { const data1 = dataProcessor.filterDataByKollektiv(baseEvaluatedData, kollektiv1); const data2 = dataProcessor.filterDataByKollektiv(baseEvaluatedData, kollektiv2); datasets.push(data1); datasets.push(data2); kollektivNames.push(kollektiv1); kollektivNames.push(kollektiv2); kollektivDisplayNames.push(getKollektivDisplayName(kollektiv1, effectiveLang)); kollektivDisplayNames.push(getKollektivDisplayName(kollektiv2, effectiveLang)); }
             const noDataForSelectionText = UI_TEXTS.errors?.[effectiveLang]?.noDataForStatSelection || UI_TEXTS.errors?.de?.noDataForStatSelection || "Keine Daten für Statistik-Auswahl verfügbar.";
             if (datasets.length === 0 || datasets.every(d => !Array.isArray(d) || d.length === 0)) { return `<div class="col-12"><div class="alert alert-warning">${noDataForSelectionText}</div></div>`; }

             const outerRow = document.createElement('div'); outerRow.className = 'row g-4';
             const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image':'fa-download'; const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code':'fa-download';
             const pngTT = TOOLTIP_CONTENT?.[effectiveLang]?.exportTab?.chartSinglePNG?.description || TOOLTIP_CONTENT?.de?.exportTab?.chartSinglePNG?.description || 'PNG';
             const svgTT = TOOLTIP_CONTENT?.[effectiveLang]?.exportTab?.chartSingleSVG?.description || TOOLTIP_CONTENT?.de?.exportTab?.chartSingleSVG?.description || 'SVG';
             const createChartDlBtns = (baseId) => [{id:`dl-${baseId}-png`,icon:dlIconPNG,tooltip:pngTT,format:'png', chartId: baseId},{id:`dl-${baseId}-svg`,icon:dlIconSVG,tooltip:svgTT,format:'svg', chartId: baseId}];
             const createTableDlBtn = (tableId, tableNameKey) => {
                const tableName = UI_TEXTS.exportTab?.tableNames?.[effectiveLang]?.[tableNameKey] || UI_TEXTS.exportTab?.tableNames?.de?.[tableNameKey] || tableNameKey;
                const tooltip = (TOOLTIP_CONTENT?.[effectiveLang]?.exportTab?.tableSinglePNG?.description || TOOLTIP_CONTENT?.de?.exportTab?.tableSinglePNG?.description || "Tabelle '[TABLE_NAME]' PNG").replace('[TABLE_NAME]', tableName);
                return {id: `dl-${tableId}-png`, icon: 'fa-image', tooltip: tooltip, format: 'png', tableId: tableId, tableName: tableName};
             };
             const cohortPrefix = UI_TEXTS.general?.[effectiveLang]?.cohortPrefix || UI_TEXTS.general?.de?.cohortPrefix || "Kollektiv";


             datasets.forEach((data, i) => {
                 const kollektivName = kollektivDisplayNames[i]; const col = document.createElement('div'); col.className = layout === 'vergleich' ? 'col-xl-6' : 'col-12'; const innerRowId = `inner-stat-row-${i}`; col.innerHTML = `<h4 class="mb-3">${cohortPrefix}: ${kollektivName} (N=${data.length})</h4><div class="row g-3" id="${innerRowId}"></div>`; outerRow.appendChild(col); const innerContainer = col.querySelector(`#${innerRowId}`);
                 const errorStatCalculation = UI_TEXTS.errors?.[effectiveLang]?.statCalculationError || UI_TEXTS.errors?.de?.statCalculationError || "Fehler bei Statistikberechnung.";
                 const noDataForThisCohort = UI_TEXTS.errors?.[effectiveLang]?.noDataForThisCohort || UI_TEXTS.errors?.de?.noDataForThisCohort || "Keine Daten für dieses Kollektiv.";

                 if (data.length > 0) {
                     let stats = null;
                     try {
                         stats = {
                             deskriptiv: statisticsService.calculateDescriptiveStats(data),
                             gueteAS: statisticsService.calculateDiagnosticPerformance(data, 'as', 'n'),
                             gueteT2: statisticsService.calculateDiagnosticPerformance(data, 't2', 'n'),
                             vergleichASvsT2: statisticsService.compareDiagnosticMethods(data, 'as', 't2', 'n'),
                             assoziation: statisticsService.calculateAssociations(data, appliedCriteria)
                         };
                     } catch(e) { console.error(`Statistikfehler für Kollektiv ${i}:`, e); }

                     if (!stats) { innerContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">${errorStatCalculation}</div></div>`; return; }
                     const descCardId=`deskriptiveStatistik-${i}`; const gueteASCardId=`diagnostischeGueteAS-${i}`; const gueteT2CardId=`diagnostischeGueteT2-${i}`; const vergleichASvsT2CardId=`statistischerVergleichASvsT2-${i}`; const assoziationCardId=`assoziationEinzelkriterien-${i}`;
                     const statCardTitles = UI_TEXTS.statistikTab?.cardTitles?.[effectiveLang] || UI_TEXTS.statistikTab?.cardTitles?.de || {};


                     innerContainer.innerHTML += uiComponents.createStatistikCard(descCardId, statCardTitles.descriptive || `Deskriptive Statistik`, statistikTabLogic.createDeskriptiveStatistikContentHTML(stats, i, kollektivName, effectiveLang), false, 'deskriptiveStatistik', [], `table-deskriptiv-demographie-${i}`, effectiveLang);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(gueteASCardId, statCardTitles.performanceAS || `Güte - Avocado Sign (vs. N)`, statistikTabLogic.createGueteContentHTML(stats.gueteAS, 'AS', kollektivName, effectiveLang), false, 'diagnostischeGueteAS', [createTableDlBtn(`table-guete-metrics-AS-${kollektivName.replace(/\s+/g, '_')}`, 'gueteASMetrics'), createTableDlBtn(`table-guete-matrix-AS-${kollektivName.replace(/\s+/g, '_')}`, 'gueteASMatrix')], `table-guete-metrics-AS-${kollektivName.replace(/\s+/g, '_')}`, effectiveLang);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(gueteT2CardId, statCardTitles.performanceT2 || `Güte - T2 (angewandt vs. N)`, statistikTabLogic.createGueteContentHTML(stats.gueteT2, 'T2', kollektivName, effectiveLang), false, 'diagnostischeGueteT2', [createTableDlBtn(`table-guete-metrics-T2-${kollektivName.replace(/\s+/g, '_')}`, 'gueteT2Metrics'), createTableDlBtn(`table-guete-matrix-T2-${kollektivName.replace(/\s+/g, '_')}`, 'gueteT2Matrix')], `table-guete-metrics-T2-${kollektivName.replace(/\s+/g, '_')}`, effectiveLang);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(vergleichASvsT2CardId, statCardTitles.comparisonASvsT2 || `Vergleich - AS vs. T2 (angewandt)`, statistikTabLogic.createVergleichContentHTML(stats.vergleichASvsT2, kollektivName, 'T2', effectiveLang), false, 'statistischerVergleichASvsT2', [createTableDlBtn(`table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}`, 'comparisonASvsT2')], `table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}`, effectiveLang);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(assoziationCardId, statCardTitles.associationFeatures || `Assoziation Merkmale vs. N-Status`, statistikTabLogic.createAssoziationContentHTML(stats.assoziation, kollektivName, appliedCriteria, effectiveLang), false, 'assoziationEinzelkriterien', [createTableDlBtn(`table-assoziation-${kollektivName.replace(/\s+/g, '_')}`, 'associationFeatures')], `table-assoziation-${kollektivName.replace(/\s+/g, '_')}`, effectiveLang);
                     const ageChartId=`chart-stat-age-${i}`; const genderChartId=`chart-stat-gender-${i}`;

                     setTimeout(() => {
                         const descCardCont = document.getElementById(`${descCardId}-card-container`);
                         if (descCardCont) {
                             const hdrBtns = descCardCont.querySelector('.card-header-buttons');
                             if (hdrBtns) {
                                 const ageBtns=createChartDlBtns(ageChartId); const genderBtns=createChartDlBtns(genderChartId);
                                 const t1PNG=createTableDlBtn(`table-deskriptiv-demographie-${i}`, 'descriptiveDemographics');
                                 const t2PNG=createTableDlBtn(`table-deskriptiv-lk-${i}`, 'descriptiveLN');
                                 hdrBtns.innerHTML = ageBtns.map(b=>`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${b.id}" data-chart-id="${b.chartId}" data-format="${b.format}" data-tippy-content="${b.tooltip} (${effectiveLang === 'de' ? 'Alter':'Age'})"><i class="fas ${b.icon}"></i></button>`).join('')+genderBtns.map(b=>`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${b.id}" data-chart-id="${b.chartId}" data-format="${b.format}" data-tippy-content="${b.tooltip} (${effectiveLang === 'de' ? 'Geschlecht':'Gender'})"><i class="fas ${b.icon}"></i></button>`).join('')+`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${t1PNG.id}" data-table-id="${t1PNG.tableId}" data-table-name="${t1PNG.tableName}" data-tippy-content="${t1PNG.tooltip}"><i class="fas ${t1PNG.icon}"></i></button>`+`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${t2PNG.id}" data-table-id="${t2PNG.tableId}" data-table-name="${t2PNG.tableName}" data-tippy-content="${t2PNG.tooltip}"><i class="fas ${t2PNG.icon}"></i></button>`;
                             }
                         }
                        const ageChartDiv = document.getElementById(ageChartId);
                        if (ageChartDiv) {
                           chartRenderer.renderAgeDistributionChart(stats.deskriptiv.alterData || [], ageChartId, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 40 }, lang: effectiveLang, xAxisLabel: UI_TEXTS.axisLabels?.[effectiveLang]?.age, yAxisLabel: UI_TEXTS.axisLabels?.[effectiveLang]?.patientCount, tooltipLabels: {age: UI_TEXTS.axisLabels?.[effectiveLang]?.ageShort || 'Alter', count: UI_TEXTS.axisLabels?.[effectiveLang]?.countShort || 'Anzahl'} });
                        }
                         const genderChartDiv = document.getElementById(genderChartId);
                         if (genderChartDiv) {
                            const genderData = [
                                {label: UI_TEXTS.legendLabels?.[effectiveLang]?.male, value: stats.deskriptiv.geschlecht?.m ?? 0},
                                {label: UI_TEXTS.legendLabels?.[effectiveLang]?.female, value: stats.deskriptiv.geschlecht?.f ?? 0}
                            ];
                            if(stats.deskriptiv.geschlecht?.unbekannt > 0) genderData.push({label: UI_TEXTS.legendLabels?.[effectiveLang]?.unknownGender, value: stats.deskriptiv.geschlecht.unbekannt });
                            chartRenderer.renderPieChart(genderData, genderChartId, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderData.length, lang: effectiveLang });
                        }
                     }, 50);
                 } else { innerContainer.innerHTML = `<div class="col-12"><div class="alert alert-warning small p-2">${noDataForThisCohort}</div></div>`; }
             });

             if (layout === 'vergleich' && datasets.length === 2 && datasets[0].length > 0 && datasets[1].length > 0) {
                 const vergleichKollektiveStats = statisticsService.compareCohorts(datasets[0], datasets[1], appliedCriteria, appliedLogic);
                 const comparisonCardContainer = document.createElement('div'); comparisonCardContainer.className = 'col-12 mt-4';
                 const titleText = (UI_TEXTS.statistikTab?.cardTitles?.[effectiveLang]?.cohortComparison || "Vergleich [KOLLEKTIV1] vs. [KOLLEKTIV2]").replace('[KOLLEKTIV1]', kollektivDisplayNames[0]).replace('[KOLLEKTIV2]', kollektivDisplayNames[1]);
                 const tableIdComp = `table-vergleich-kollektive-${kollektivNames[0]}-vs-${kollektivNames[1]}`;
                 const downloadBtnComp = createTableDlBtn(tableIdComp, 'cohortComparison');
                 comparisonCardContainer.innerHTML = uiComponents.createStatistikCard('vergleichKollektive', titleText, statistikTabLogic.createVergleichKollektiveContentHTML(vergleichKollektiveStats, kollektivNames[0], kollektivNames[1], effectiveLang), false, 'vergleichKollektive', [downloadBtnComp], tableIdComp, effectiveLang); outerRow.appendChild(comparisonCardContainer);
             }
             const criteriaComparisonContainer = document.createElement('div'); criteriaComparisonContainer.className = 'col-12 mt-4'; criteriaComparisonContainer.id = 'criteria-comparison-container'; outerRow.appendChild(criteriaComparisonContainer);

             setTimeout(() => {
                  const globalKollektivData = dataProcessor.filterDataByKollektiv(baseEvaluatedData, currentGlobalKollektiv);
                 _renderCriteriaComparisonTable(criteriaComparisonContainer.id, globalKollektivData, currentGlobalKollektiv, effectiveLang);
                 document.querySelectorAll('#statistik-tab-pane [data-tippy-content]').forEach(el => {
                     let currentContent = el.getAttribute('data-tippy-content') || '';
                     const kollektivToDisplay = layout === 'vergleich' ? `${kollektivDisplayNames[0]} ${effectiveLang === 'de' ? 'vs.' : 'vs.'} ${kollektivDisplayNames[1]}` : kollektivDisplayNames[0];
                     currentContent = currentContent.replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivToDisplay}</strong>`);
                     currentContent = currentContent.replace(/\[KOLLEKTIV1\]/g, `<strong>${kollektivDisplayNames[0]}</strong>`);
                     currentContent = currentContent.replace(/\[KOLLEKTIV2\]/g, `<strong>${kollektivDisplayNames[1]}</strong>`);
                     el.setAttribute('data-tippy-content', currentContent);
                     if (el._tippy) { el._tippy.setContent(currentContent); }
                 });
                 ui_helpers.initializeTooltips(document.getElementById('statistik-tab-pane'));
             }, 50);
             return outerRow.outerHTML;
        }, lang, processedDataFull, appliedCriteria, appliedLogic, layout, kollektiv1, kollektiv2, currentGlobalKollektiv); // Pass lang
    }

    function renderPresentationTab(view, selectedStudyId, currentGlobalKollektiv, processedDataFull, appliedCriteria, appliedLogic, lang = 'de') { // lang added
        _renderTabContent('praesentation-tab', (effectiveLang) => { // Pass lang
            const errorNoDataText = UI_TEXTS.errors?.[effectiveLang]?.noDataForPresentation || UI_TEXTS.errors?.de?.noDataForPresentation || "Präsentations-Daten nicht verfügbar.";
            if (!processedDataFull) throw new Error(errorNoDataText);

            let presentationData = {}; const filteredData = dataProcessor.filterDataByKollektiv(processedDataFull, currentGlobalKollektiv); presentationData.kollektiv = currentGlobalKollektiv; presentationData.patientCount = filteredData?.length ?? 0;

            if (view === 'as-pur') {
                const kollektivesToCalc = ['Gesamt', 'direkt OP', 'nRCT']; let statsCurrent = null;
                kollektivesToCalc.forEach(kollektivId => { const filtered = dataProcessor.filterDataByKollektiv(processedDataFull, kollektivId); let stats = null; if (filtered && filtered.length > 0) stats = statisticsService.calculateDiagnosticPerformance(filtered, 'as', 'n'); let keyName = `stats${kollektivId}`; if (kollektivId === 'direkt OP') keyName = 'statsDirektOP'; else if (kollektivId === 'nRCT') keyName = 'statsNRCT'; presentationData[keyName] = stats; if (kollektivId === currentGlobalKollektiv) statsCurrent = stats; });
                presentationData.statsCurrentKollektiv = statsCurrent;
            } else if (view === 'as-vs-t2') {
                 if (filteredData && filteredData.length > 0) {
                    presentationData.statsAS = statisticsService.calculateDiagnosticPerformance(filteredData, 'as', 'n'); let studySet = null; let evaluatedDataT2 = null; const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
                    const appliedCriteriaDisplayName = getKollektivDisplayName(APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, effectiveLang);
                    const userDefinedText = UI_TEXTS.praesentationTab?.asVsT2?.[effectiveLang]?.userDefined || UI_TEXTS.praesentationTab?.asVsT2?.de?.userDefined || "Benutzerdefiniert";
                    const currentCohortText = UI_TEXTS.praesentationTab?.asVsT2?.[effectiveLang]?.currentCohortText || UI_TEXTS.praesentationTab?.asVsT2?.de?.currentCohortText || "Aktuell";
                    const noCriteriaText = UI_TEXTS.praesentationTab?.asVsT2?.[effectiveLang]?.noCriteria || UI_TEXTS.praesentationTab?.asVsT2?.de?.noCriteria || "Keine";


                    if(isApplied) { studySet = { criteria: appliedCriteria, logic: appliedLogic, id: selectedStudyId, name: appliedCriteriaDisplayName, displayShortName: (effectiveLang === 'en' ? 'Applied' : 'Angewandt'), studyInfo: { reference: userDefinedText, patientCohort: `${currentCohortText}: ${getKollektivDisplayName(currentGlobalKollektiv, effectiveLang)} (N=${presentationData.patientCount})`, investigationType: "N/A", focus: userDefinedText, keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false, effectiveLang) || noCriteriaText } }; evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), studySet.criteria, studySet.logic); }
                    else if (selectedStudyId) { studySet = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId); if(studySet) evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(filteredData), studySet); }
                    if (studySet && evaluatedDataT2) { presentationData.statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n'); evaluatedDataT2.forEach((p, i) => { if (filteredData[i]) p.as = filteredData[i].as; }); presentationData.vergleich = statisticsService.compareDiagnosticMethods(evaluatedDataT2, 'as', 't2', 'n'); presentationData.comparisonCriteriaSet = studySet; presentationData.t2CriteriaLabelShort = studySet.displayShortName || 'T2'; presentationData.t2CriteriaLabelFull = `${studySet.nameKey ? (UI_TEXTS.praesentationTab?.studyNames?.[effectiveLang]?.[studySet.nameKey] || UI_TEXTS.praesentationTab?.studyNames?.de?.[studySet.nameKey] || studySet.id) : (studySet.name || studySet.id)}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, false, effectiveLang)}`; }
                }
            }
            const tabContentHTML = praesentationTabLogic.createPresentationTabContent(view, presentationData, selectedStudyId, currentGlobalKollektiv, effectiveLang);

            setTimeout(() => {
                if (view === 'as-pur') {
                     const chartContainer = document.getElementById('praes-as-pur-perf-chart');
                     const noDataChartText = (UI_TEXTS.praesentationTab?.asPur?.[effectiveLang]?.noDataForPerfChart || UI_TEXTS.praesentationTab?.asPur?.de?.noDataForPerfChart || 'Keine Daten für Performance-Chart.');
                     if (chartContainer && presentationData?.statsCurrentKollektiv && presentationData.patientCount > 0) {
                         const chartData = { overall: { sensVal: presentationData.statsCurrentKollektiv.sens?.value, spezVal: presentationData.statsCurrentKollektiv.spez?.value, ppvVal: presentationData.statsCurrentKollektiv.ppv?.value, npvVal: presentationData.statsCurrentKollektiv.npv?.value, accVal: presentationData.statsCurrentKollektiv.acc?.value, aucVal: presentationData.statsCurrentKollektiv.auc?.value }};
                         const chartTitleText = (UI_TEXTS.praesentationTab?.asPur?.[effectiveLang]?.asPerfChartTitleFull || 'AS Performance für Kollektiv: [KOLLEKTIV_NAME]').replace('[KOLLEKTIV_NAME]', getKollektivDisplayName(currentGlobalKollektiv, effectiveLang));
                         chartRenderer.renderASPerformanceChart('praes-as-pur-perf-chart', chartData, { lang: effectiveLang, chartTitle: chartTitleText, yAxisLabel: UI_TEXTS.praesentationTab?.asPur?.[effectiveLang]?.asPerfChartYAxis || 'Diagnostische Güte (AS)' }, getKollektivDisplayName(currentGlobalKollektiv, effectiveLang));
                     } else if (chartContainer) {
                         ui_helpers.updateElementHTML(chartContainer.id, `<p class="text-muted small text-center p-3">${noDataChartText}</p>`);
                     }
                } else if (view === 'as-vs-t2') {
                     const chartContainer = document.getElementById('praes-comp-chart-container');
                     const noDataChartText = (UI_TEXTS.praesentationTab?.asVsT2?.[effectiveLang]?.noDataForCompChart || UI_TEXTS.praesentationTab?.asVsT2?.de?.noDataForCompChart || 'Keine Daten für Vergleichschart.');
                     if (chartContainer && presentationData?.statsAS && presentationData?.statsT2 && presentationData.patientCount > 0) {
                         const chartDataComp = [ { metric: 'Sens', AS: presentationData.statsAS.sens?.value ?? 0, T2: presentationData.statsT2.sens?.value ?? 0 }, { metric: 'Spez', AS: presentationData.statsAS.spez?.value ?? 0, T2: presentationData.statsT2.spez?.value ?? 0 }, { metric: 'PPV', AS: presentationData.statsAS.ppv?.value ?? 0, T2: presentationData.statsT2.ppv?.value ?? 0 }, { metric: 'NPV', AS: presentationData.statsAS.npv?.value ?? 0, T2: presentationData.statsT2.npv?.value ?? 0 }, { metric: 'Acc', AS: presentationData.statsAS.acc?.value ?? 0, T2: presentationData.statsT2.acc?.value ?? 0 }, { metric: 'AUC', AS: presentationData.statsAS.auc?.value ?? 0, T2: presentationData.statsT2.auc?.value ?? 0 } ];
                         const chartTitleText = (UI_TEXTS.praesentationTab?.asVsT2?.[effectiveLang]?.compChartTitleFull || 'Vergleichs-Chart (AS vs. [T2_LABEL])').replace('[T2_LABEL]', presentationData.t2CriteriaLabelShort || 'T2');
                         chartRenderer.renderComparisonBarChart(chartDataComp, 'praes-comp-chart-container', { height: 300, margin: { top: 20, right: 20, bottom: 50, left: 50 }, lang: effectiveLang, chartTitle: chartTitleText, yAxisLabel: UI_TEXTS.axisLabels?.[effectiveLang]?.metricValue, t2LabelForLegend: presentationData.t2CriteriaLabelShort || 'T2', subgroupDisplayNames: {'AS': UI_TEXTS.legendLabels?.[effectiveLang]?.avocadoSign, 'T2': presentationData.t2CriteriaLabelShort || 'T2'} }, presentationData.t2CriteriaLabelShort || 'T2');
                     } else if (chartContainer) {
                         ui_helpers.updateElementHTML(chartContainer.id, `<p class="text-muted small text-center p-3">${noDataChartText}</p>`);
                     }
                }
                ui_helpers.updatePresentationViewSelectorUI(view, effectiveLang); const studySelect = document.getElementById('praes-study-select'); if (studySelect) studySelect.value = selectedStudyId || '';
                ui_helpers.initializeTooltips(document.getElementById('praesentation-tab-pane'));
            }, 10);

            return tabContentHTML;
        }, lang, view, selectedStudyId, currentGlobalKollektiv, processedDataFull, appliedCriteria, appliedLogic); // Pass lang
    }

    function renderExportTab(currentKollektiv, lang = 'de') { // lang added
        _renderTabContent('export-tab', (effectiveLang) => { // Pass lang
             return uiComponents.createExportOptions(currentKollektiv, effectiveLang);
        }, lang, currentKollektiv); // Pass lang
    }

    function renderPublikationTab(currentLang, currentSection, currentKollektiv, globalProcessedData, bruteForceResults) {
        // currentLang is the explicit language for this tab
        _renderTabContent('publikation-tab', (effectiveLang) => {
            publikationTabLogic.initializeData(
                globalProcessedData,
                t2CriteriaManager.getAppliedCriteria(),
                t2CriteriaManager.getAppliedLogic(),
                bruteForceResults
            );

            const headerHTML = uiComponents.createPublikationTabHeader(effectiveLang); // Pass lang
            const initialContentHTML = publikationTabLogic.getRenderedSectionContent(currentSection, effectiveLang, currentKollektiv);

            setTimeout(() => {
                const contentArea = document.getElementById('publikation-content-area');
                if (contentArea) {
                    ui_helpers.updateElementHTML(contentArea.id, initialContentHTML);
                    publikationTabLogic.updateDynamicChartsForPublicationTab(currentSection, effectiveLang, currentKollektiv);
                    ui_helpers.initializeTooltips(document.getElementById('publikation-tab-pane'));
                }
                 ui_helpers.updatePublikationUI(effectiveLang, currentSection, state.getCurrentPublikationBruteForceMetric());
            }, 10);

            return headerHTML;
        }, currentLang, currentSection, currentKollektiv, globalProcessedData, bruteForceResults); // Pass currentLang
    }

    return Object.freeze({
        renderDatenTab,
        renderAuswertungTab,
        renderStatistikTab,
        renderPresentationTab,
        renderExportTab,
        renderPublikationTab
    });
})();
