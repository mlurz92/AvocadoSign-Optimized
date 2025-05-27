const viewRenderer = (() => {

    function _renderTabContent(tabId, renderFunction, ...args) {
        const containerId = `${tabId}-pane`;
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container #${containerId} nicht gefunden für Tab ${tabId}.`);
            return;
        }
        ui_helpers.updateElementHTML(containerId, '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade Inhalt...</span></div></div>');
        try {
            const contentHTML = renderFunction(...args);
            ui_helpers.updateElementHTML(containerId, contentHTML || '<p class="text-muted p-3">Kein Inhalt generiert.</p>');
            ui_helpers.initializeTooltips(container);
        } catch (error) {
            console.error(`Fehler beim Rendern von Tab ${tabId}:`, error);
            const errorMessage = `<div class="alert alert-danger m-3">Fehler beim Laden des Tabs: ${error.message}</div>`;
            ui_helpers.updateElementHTML(containerId, errorMessage);
            ui_helpers.showToast(`Fehler beim Laden des Tabs '${tabId}'.`, 'danger');
        }
    }

    function renderDatenTab(data, sortState) {
        _renderTabContent('daten-tab', () => {
             if (!data) throw new Error("Daten für Datentabelle nicht verfügbar.");
             const toggleButtonHTML = `
                 <div class="d-flex justify-content-end mb-3" id="daten-toggle-button-container">
                     <button id="daten-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${TOOLTIP_CONTENT.datenTable.expandAll || 'Alle Details ein-/ausblenden'}">
                        Alle Details Anzeigen <i class="fas fa-chevron-down ms-1"></i>
                    </button>
                 </div>`;
            const tableHTML = dataTabLogic.createDatenTableHTML(data, sortState);
            const finalHTML = toggleButtonHTML + `<div class="table-responsive">${tableHTML}</div>`;

            setTimeout(() => {
                 const tableBody = document.getElementById('daten-table-body');
                 const tableHeader = document.getElementById('daten-table-header');
                 if (tableBody && data.length > 0) ui_helpers.attachRowCollapseListeners(tableBody);
                 if (tableHeader) ui_helpers.updateSortIcons(tableHeader.id, sortState);
                 ui_helpers.initializeTooltips(document.getElementById('daten-tab-pane'));
            }, 0);
            return finalHTML;
        });
    }

    function _renderAuswertungDashboardCharts(stats) {
        const ids = ['chart-dash-age', 'chart-dash-gender', 'chart-dash-therapy', 'chart-dash-status-n', 'chart-dash-status-as', 'chart-dash-status-t2'];
        if (!stats || stats.anzahlPatienten === 0) { ids.forEach(id => ui_helpers.updateElementHTML(id, '<p class="text-muted small text-center p-2">N/A</p>')); return; };
        const histOpts = { height: 130, margin: { top: 5, right: 10, bottom: 25, left: 35 }, useCompactMargins: true };
        const pieOpts = { height: 130, margin: { top: 5, right: 5, bottom: 35, left: 5 }, innerRadiusFactor: 0.45, outerRadiusFactor: 0.95, fontSize: '8px', useCompactMargins: true, legendBelow: true };
        const genderData = [{label: UI_TEXTS.legendLabels.male, value: stats.geschlecht?.m ?? 0}, {label: UI_TEXTS.legendLabels.female, value: stats.geschlecht?.f ?? 0}];
        if(stats.geschlecht?.unbekannt > 0) genderData.push({label: UI_TEXTS.legendLabels.unknownGender, value: stats.geschlecht.unbekannt });
        const therapyData = [{label: UI_TEXTS.legendLabels.direktOP, value: stats.therapie?.['direkt OP'] ?? 0}, {label: UI_TEXTS.legendLabels.nRCT, value: stats.therapie?.nRCT ?? 0}];
        try {
            chartRenderer.renderAgeDistributionChart(stats.alterData || [], ids[0], histOpts);
            chartRenderer.renderPieChart(genderData, ids[1], {...pieOpts, legendItemCount: genderData.length});
            chartRenderer.renderPieChart(therapyData, ids[2], {...pieOpts, legendItemCount: therapyData.length});
            chartRenderer.renderPieChart([{label: UI_TEXTS.legendLabels.nPositive, value: stats.nStatus?.plus ?? 0}, {label: UI_TEXTS.legendLabels.nNegative, value: stats.nStatus?.minus ?? 0}], ids[3], {...pieOpts, legendItemCount: 2});
            chartRenderer.renderPieChart([{label: UI_TEXTS.legendLabels.asPositive, value: stats.asStatus?.plus ?? 0}, {label: UI_TEXTS.legendLabels.asNegative, value: stats.asStatus?.minus ?? 0}], ids[4], {...pieOpts, legendItemCount: 2});
            chartRenderer.renderPieChart([{label: UI_TEXTS.legendLabels.t2Positive, value: stats.t2Status?.plus ?? 0}, {label: UI_TEXTS.legendLabels.t2Negative, value: stats.t2Status?.minus ?? 0}], ids[5], {...pieOpts, legendItemCount: 2});
        }
        catch(error) { console.error("Fehler bei Chart-Rendering im Dashboard:", error); ids.forEach(id => ui_helpers.updateElementHTML(id, '<p class="text-danger small text-center p-2">Chart Fehler</p>')); }
    }

     function _renderCriteriaComparisonTable(containerId, processedDataFull, globalKollektiv) {
         const container = document.getElementById(containerId); if (!container) return;
         if (!Array.isArray(processedDataFull) || processedDataFull.length === 0) {
             container.innerHTML = uiComponents.createStatistikCard('criteriaComparisonTable', UI_TEXTS.criteriaComparison.title, '<p class="p-3 text-muted small">Keine globalen Daten für Vergleich verfügbar.</p>', false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich');
             ui_helpers.initializeTooltips(container);
             return;
         }

         const comparisonSetIds = APP_CONFIG.DEFAULT_SETTINGS.CRITERIA_COMPARISON_SETS || [];
         const results = [];
         const appliedGlobalCriteria = t2CriteriaManager.getAppliedCriteria();
         const appliedGlobalLogic = t2CriteriaManager.getAppliedLogic();
         const globalKollektivData = dataProcessor.filterDataByKollektiv(processedDataFull, globalKollektiv);
         const globalKollektivDataT2Evaluated = t2CriteriaManager.evaluateDataset(cloneDeep(globalKollektivData), appliedGlobalCriteria, appliedGlobalLogic);
         const globalNCount = globalKollektivDataT2Evaluated.length;


         comparisonSetIds.forEach(setId => {
            let perf = null;
            let setName = 'Unbekannt';
            let setIdUsed = setId;
            let specificKollektivName = getKollektivDisplayName(globalKollektiv);
            let specificKollektivN = globalNCount;

            try {
                if (setId === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) {
                    perf = statisticsService.calculateDiagnosticPerformance(globalKollektivDataT2Evaluated, 'as', 'n');
                    setName = APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME;
                } else if (setId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                    perf = statisticsService.calculateDiagnosticPerformance(globalKollektivDataT2Evaluated, 't2', 'n');
                    setName = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
                } else {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(setId);
                    if (studySet) {
                        setName = studySet.name;
                        const targetKollektivForStudy = studySet.applicableKollektiv || 'Gesamt';
                        specificKollektivName = getKollektivDisplayName(targetKollektivForStudy);
                        const dataForThisStudySet = dataProcessor.filterDataByKollektiv(processedDataFull, targetKollektivForStudy);
                        specificKollektivN = dataForThisStudySet.length;

                        if (dataForThisStudySet.length > 0) {
                            const evaluatedData = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataForThisStudySet), studySet);
                            perf = statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n');
                        } else {
                            perf = null;
                        }
                    } else {
                        perf = null;
                    }
                }
            } catch (error) { console.error(`Fehler bei Berechnung für Vergleichsset ${setId}:`, error); perf = null; }

            results.push({
                id: setIdUsed,
                name: setName,
                sens: perf?.sens?.value ?? NaN,
                spez: perf?.spez?.value ?? NaN,
                ppv: perf?.ppv?.value ?? NaN,
                npv: perf?.npv?.value ?? NaN,
                acc: perf?.acc?.value ?? NaN,
                auc: perf?.auc?.value ?? NaN,
                specificKollektivName: specificKollektivName,
                specificKollektivN: specificKollektivN,
                globalN: globalNCount
            });
         });

         results.sort((a, b) => {
             if (a.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) return -1; if (b.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) return 1;
             if (a.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) return (b.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID ? 1 : -1);
             if (b.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) return (a.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID ? -1 : 1);
             return (a.name || '').localeCompare(b.name || '');
         });
         const tableHTML = statistikTabLogic.createCriteriaComparisonTableHTML(results, getKollektivDisplayName(globalKollektiv));
         const cardTooltipText = (TOOLTIP_CONTENT.criteriaComparisonTable.cardTitle || "Vergleich verschiedener Kriteriensätze")
            .replace('[GLOBAL_KOLLEKTIV_NAME]', `<strong>${getKollektivDisplayName(globalKollektiv)}</strong>`);

         container.innerHTML = uiComponents.createStatistikCard('criteriaComparisonTable', UI_TEXTS.criteriaComparison.title, tableHTML, false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich');
         const cardHeader = container.querySelector('.card-header');
         if (cardHeader) cardHeader.setAttribute('data-tippy-content', cardTooltipText);
         ui_helpers.initializeTooltips(container);
    }


    function renderAuswertungTab(data, currentCriteria, currentLogic, sortState, currentKollektiv, bfWorkerAvailable) {
         _renderTabContent('auswertung-tab', () => {
             if (!data || !currentCriteria || !currentLogic) throw new Error("Daten oder Kriterien für Auswertungstab nicht verfügbar.");

             const dashboardContainerId = 'auswertung-dashboard';
             const metricsOverviewContainerId = 't2-metrics-overview';
             const bruteForceCardContainerId = 'brute-force-card-container';
             const tableCardContainerId = 'auswertung-table-card-container';

             const criteriaControlsHTML = uiComponents.createT2CriteriaControls(currentCriteria, currentLogic);
             const bruteForceCardHTML = uiComponents.createBruteForceCard(currentKollektiv, bfWorkerAvailable); // Pass only kollektiv ID
             const auswertungTableCardHTML = auswertungTabLogic.createAuswertungTableCardHTML(data, sortState, currentCriteria, currentLogic);


             let finalHTML = `
                 <div class="row g-2 mb-3" id="${dashboardContainerId}">
                     <div class="col-12"><p class="text-muted text-center small p-3">Lade Dashboard...</p></div>
                 </div>
                 <div class="row g-4">
                     <div class="col-12">${criteriaControlsHTML}</div>
                     <div class="col-12 mb-3" id="${metricsOverviewContainerId}">
                         <p class="text-muted small p-3">Lade Metrikübersicht...</p>
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
                         if (!stats || stats.anzahlPatienten === 0) {
                             ui_helpers.updateElementHTML(dashboardContainerId, '<div class="col-12"><p class="text-muted text-center small p-3">Keine Daten für Dashboard.</p></div>');
                         } else {
                             const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image' : 'fa-download';
                             const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code' : 'fa-download';
                             const pngTooltipBase = (TOOLTIP_CONTENT.exportTab.chartSinglePNG?.description || 'Als PNG herunterladen');
                             const svgTooltipBase = (TOOLTIP_CONTENT.exportTab.chartSingleSVG?.description || 'Als SVG herunterladen');
                             const createDlBtns = (baseId, chartTitle) => [{id:`dl-${baseId}-png`, icon: dlIconPNG, tooltip: pngTooltipBase.replace('{ChartName}', chartTitle), format:'png', chartId: baseId, chartName: chartTitle}, {id:`dl-${baseId}-svg`, icon: dlIconSVG, tooltip: svgTooltipBase.replace('{ChartName}', chartTitle), format:'svg', chartId: baseId, chartName: chartTitle}];

                             dashboardContainer.innerHTML = `
                                ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.ageDistribution, `<p class="mb-0 small">Median: ${formatNumber(stats.alter?.median, 1)} (${formatNumber(stats.alter?.min, 0)} - ${formatNumber(stats.alter?.max, 0)})</p>`, 'chart-dash-age', '', '', 'p-1', createDlBtns('chart-dash-age', UI_TEXTS.chartTitles.ageDistribution))}
                                ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.genderDistribution, `<p class="mb-0 small">M: ${stats.geschlecht?.m ?? 0} W: ${stats.geschlecht?.f ?? 0}</p>`, 'chart-dash-gender', '', '', 'p-1', createDlBtns('chart-dash-gender', UI_TEXTS.chartTitles.genderDistribution))}
                                ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.therapyDistribution, `<p class="mb-0 small">OP: ${stats.therapie?.['direkt OP'] ?? 0} nRCT: ${stats.therapie?.nRCT ?? 0}</p>`, 'chart-dash-therapy', '', '', 'p-1', createDlBtns('chart-dash-therapy', UI_TEXTS.chartTitles.therapyDistribution))}
                                ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.statusN, `<p class="mb-0 small">N+: ${stats.nStatus?.plus ?? 0} N-: ${stats.nStatus?.minus ?? 0}</p>`, 'chart-dash-status-n', '', '', 'p-1', createDlBtns('chart-dash-status-n', UI_TEXTS.chartTitles.statusN))}
                                ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.statusAS, `<p class="mb-0 small">AS+: ${stats.asStatus?.plus ?? 0} AS-: ${stats.asStatus?.minus ?? 0}</p>`, 'chart-dash-status-as', '', '', 'p-1', createDlBtns('chart-dash-status-as', UI_TEXTS.chartTitles.statusAS))}
                                ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.statusT2, `<p class="mb-0 small">T2+: ${stats.t2Status?.plus ?? 0} T2-: ${stats.t2Status?.minus ?? 0}</p>`, 'chart-dash-status-t2', '', '', 'p-1', createDlBtns('chart-dash-status-t2', UI_TEXTS.chartTitles.statusT2))}
                             `;
                              _renderAuswertungDashboardCharts(stats);
                         }
                     } catch (error) { console.error("Fehler _renderAuswertungDashboard:", error); ui_helpers.updateElementHTML(dashboardContainerId, '<div class="col-12"><div class="alert alert-danger">Dashboard Fehler.</div></div>'); }
                 }

                 if (metricsOverviewContainer) {
                     try {
                        const statsT2 = statisticsService.calculateDiagnosticPerformance(data, 't2', 'n');
                        ui_helpers.updateElementHTML(metricsOverviewContainer.id, uiComponents.createT2MetricsOverview(statsT2, getKollektivDisplayName(currentKollektiv)));
                     } catch (error) { console.error("Fehler beim Rendern der T2 Metrikübersicht:", error); ui_helpers.updateElementHTML(metricsOverviewContainer.id, '<div class="alert alert-warning p-2 small">Fehler T2-Metriken.</div>'); }
                 }

                 if(tableContainer) {
                    const tableBody = tableContainer.querySelector('#auswertung-table-body');
                    const tableHeader = tableContainer.querySelector('#auswertung-table-header');
                    if (tableBody && data.length > 0) ui_helpers.attachRowCollapseListeners(tableBody);
                    if (tableHeader) ui_helpers.updateSortIcons(tableHeader.id, sortState);
                 }

                 ui_helpers.updateT2CriteriaControlsUI(currentCriteria, currentLogic);
                 ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
                 ui_helpers.updateBruteForceUI('idle', {}, bfWorkerAvailable, currentKollektiv);
                 ui_helpers.initializeTooltips(document.getElementById('auswertung-tab-pane'));
             }, 10);

             return finalHTML;
        });
    }

    function renderStatistikTab(processedDataFull, appliedCriteria, appliedLogic, layout, kollektiv1, kollektiv2, currentGlobalKollektiv) {
        _renderTabContent('statistik-tab', () => {
             if (!processedDataFull) throw new Error("Statistik-Daten nicht verfügbar.");

             let datasets = [], kollektivNames = [], kollektivDisplayNames = [];
             let baseEvaluatedData = [];
             try {
                  baseEvaluatedData = t2CriteriaManager.evaluateDataset(cloneDeep(processedDataFull), appliedCriteria, appliedLogic);
             } catch(e) { console.error("Fehler bei der T2 Evaluierung für Statistik:", e); }

             if (layout === 'einzel') { const singleData = dataProcessor.filterDataByKollektiv(baseEvaluatedData, currentGlobalKollektiv); datasets.push(singleData); kollektivNames.push(currentGlobalKollektiv); kollektivDisplayNames.push(getKollektivDisplayName(currentGlobalKollektiv)); }
             else { const data1 = dataProcessor.filterDataByKollektiv(baseEvaluatedData, kollektiv1); const data2 = dataProcessor.filterDataByKollektiv(baseEvaluatedData, kollektiv2); datasets.push(data1); datasets.push(data2); kollektivNames.push(kollektiv1); kollektivNames.push(kollektiv2); kollektivDisplayNames.push(getKollektivDisplayName(kollektiv1)); kollektivDisplayNames.push(getKollektivDisplayName(kollektiv2)); }

             if (datasets.length === 0 || datasets.every(d => !Array.isArray(d) || d.length === 0)) { return '<div class="col-12"><div class="alert alert-warning">Keine Daten für Statistik-Auswahl verfügbar.</div></div>'; }

             const outerRow = document.createElement('div'); outerRow.className = 'row g-4';
             const createChartDlBtns = (baseId, chartTitle) => [
                { id: `dl-${baseId}-png`, icon: APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image' : 'fa-download', tooltip: (TOOLTIP_CONTENT.exportTab.chartSinglePNG?.description || 'PNG').replace('{ChartName}', chartTitle), format: 'png', chartId: baseId, chartName: chartTitle },
                { id: `dl-${baseId}-svg`, icon: APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code' : 'fa-download', tooltip: (TOOLTIP_CONTENT.exportTab.chartSingleSVG?.description || 'SVG').replace('{ChartName}', chartTitle), format: 'svg', chartId: baseId, chartName: chartTitle }
             ];
             const createTableDlBtn = (tableId, tableName) => ({ id: `dl-${tableId}-png`, icon: 'fa-image', tooltip: (TOOLTIP_CONTENT.exportTab.tableSinglePNG?.description || 'Tabelle als PNG').replace('{TableName}', tableName), format: 'png', tableId: tableId, tableName: tableName });


             datasets.forEach((data, i) => {
                 const kollektivName = kollektivDisplayNames[i]; const col = document.createElement('div'); col.className = layout === 'vergleich' ? 'col-xl-6' : 'col-12'; const innerRowId = `inner-stat-row-${i}`; col.innerHTML = `<h4 class="mb-3">Kollektiv: ${kollektivName} (N=${data.length})</h4><div class="row g-3" id="${innerRowId}"></div>`; outerRow.appendChild(col); const innerContainer = col.querySelector(`#${innerRowId}`);
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

                     if (!stats) { innerContainer.innerHTML = '<div class="col-12"><div class="alert alert-danger">Fehler bei Statistikberechnung.</div></div>'; return; }
                     const descCardId=`deskriptiveStatistik-${i}`; const gueteASCardId=`diagnostischeGueteAS-${i}`; const gueteT2CardId=`diagnostischeGueteT2-${i}`; const vergleichASvsT2CardId=`statistischerVergleichASvsT2-${i}`; const assoziationCardId=`assoziationEinzelkriterien-${i}`;
                     const safeKollektivName = kollektivName.replace(/\s+/g, '_');

                     const deskriptivDlBtns = [
                         ...createChartDlBtns(`chart-stat-age-${i}`, `Altersverteilung_${safeKollektivName}`),
                         ...createChartDlBtns(`chart-stat-gender-${i}`, `Geschlechterverteilung_${safeKollektivName}`),
                         createTableDlBtn(`table-deskriptiv-demographie-${i}`, `Deskriptive_Demographie_${safeKollektivName}`),
                         createTableDlBtn(`table-deskriptiv-lk-${i}`, `Deskriptive_LK_${safeKollektivName}`)
                     ];
                     innerContainer.innerHTML += uiComponents.createStatistikCard(descCardId, `Deskriptive Statistik`, statistikTabLogic.createDeskriptiveStatistikContentHTML(stats, i, kollektivName), false, 'deskriptiveStatistik', deskriptivDlBtns, `table-deskriptiv-demographie-${i}`);

                     const gueteASDlBtns = [createTableDlBtn(`table-guete-metrics-AS-${safeKollektivName}`, `Guete_AS_${safeKollektivName}`), createTableDlBtn(`table-guete-matrix-AS-${safeKollektivName}`, `Matrix_AS_${safeKollektivName}`)];
                     innerContainer.innerHTML += uiComponents.createStatistikCard(gueteASCardId, `Güte - Avocado Sign (vs. N)`, statistikTabLogic.createGueteContentHTML(stats.gueteAS, 'AS', kollektivName), false, 'diagnostischeGueteAS', gueteASDlBtns, `table-guete-metrics-AS-${safeKollektivName}`);

                     const gueteT2DlBtns = [createTableDlBtn(`table-guete-metrics-T2-${safeKollektivName}`, `Guete_T2_${safeKollektivName}`), createTableDlBtn(`table-guete-matrix-T2-${safeKollektivName}`, `Matrix_T2_${safeKollektivName}`)];
                     innerContainer.innerHTML += uiComponents.createStatistikCard(gueteT2CardId, `Güte - T2 (angewandt vs. N)`, statistikTabLogic.createGueteContentHTML(stats.gueteT2, 'T2', kollektivName), false, 'diagnostischeGueteT2', gueteT2DlBtns, `table-guete-metrics-T2-${safeKollektivName}`);

                     const vergleichASvsT2DlBtns = [createTableDlBtn(`table-vergleich-as-vs-t2-${safeKollektivName}`, `Vergleich_AS_T2_${safeKollektivName}`)];
                     innerContainer.innerHTML += uiComponents.createStatistikCard(vergleichASvsT2CardId, `Vergleich - AS vs. T2 (angewandt)`, statistikTabLogic.createVergleichContentHTML(stats.vergleichASvsT2, kollektivName), false, 'statistischerVergleichASvsT2', vergleichASvsT2DlBtns, `table-vergleich-as-vs-t2-${safeKollektivName}`);

                     const assoziationDlBtns = [createTableDlBtn(`table-assoziation-${safeKollektivName}`, `Assoziation_${safeKollektivName}`)];
                     innerContainer.innerHTML += uiComponents.createStatistikCard(assoziationCardId, `Assoziation Merkmale vs. N-Status`, statistikTabLogic.createAssoziationContentHTML(stats.assoziation, kollektivName, appliedCriteria), false, 'assoziationEinzelkriterien', assoziationDlBtns, `table-assoziation-${safeKollektivName}`);

                     const ageChartId=`chart-stat-age-${i}`; const genderChartId=`chart-stat-gender-${i}`;

                     setTimeout(() => {
                        const ageChartDiv = document.getElementById(ageChartId);
                        if (ageChartDiv) {
                           chartRenderer.renderAgeDistributionChart(stats.deskriptiv.alterData || [], ageChartId, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 40 } });
                        }
                         const genderChartDiv = document.getElementById(genderChartId);
                         if (genderChartDiv) {
                            const genderData = [{label: UI_TEXTS.legendLabels.male, value: stats.deskriptiv.geschlecht?.m ?? 0}, {label: UI_TEXTS.legendLabels.female, value: stats.deskriptiv.geschlecht?.f ?? 0}]; if(stats.deskriptiv.geschlecht?.unbekannt > 0) genderData.push({label: UI_TEXTS.legendLabels.unknownGender, value: stats.deskriptiv.geschlecht.unbekannt });
                            chartRenderer.renderPieChart(genderData, genderChartId, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderData.length });
                        }
                     }, 50);
                 } else { innerContainer.innerHTML = '<div class="col-12"><div class="alert alert-warning small p-2">Keine Daten für dieses Kollektiv.</div></div>'; }
             });

             if (layout === 'vergleich' && datasets.length === 2 && datasets[0].length > 0 && datasets[1].length > 0) {
                 const vergleichKollektiveStats = statisticsService.compareCohorts(datasets[0], datasets[1], appliedCriteria, appliedLogic);
                 const comparisonCardContainer = document.createElement('div'); comparisonCardContainer.className = 'col-12 mt-4'; const title = `Vergleich ${kollektivDisplayNames[0]} vs. ${kollektivDisplayNames[1]}`;
                 const safeKollektiv1Name = kollektivNames[0].replace(/\s+/g, '_');
                 const safeKollektiv2Name = kollektivNames[1].replace(/\s+/g, '_');
                 const tableIdComp = `table-vergleich-kollektive-${safeKollektiv1Name}-vs-${safeKollektiv2Name}`;
                 const downloadBtnComp = createTableDlBtn(tableIdComp, `Vergleich_Kollektive_${safeKollektiv1Name}_vs_${safeKollektiv2Name}`);
                 comparisonCardContainer.innerHTML = uiComponents.createStatistikCard('vergleichKollektive', title, statistikTabLogic.createVergleichKollektiveContentHTML(vergleichKollektiveStats, kollektivNames[0], kollektivNames[1]), false, 'vergleichKollektive', [downloadBtnComp], tableIdComp); outerRow.appendChild(comparisonCardContainer);
             }
             const criteriaComparisonContainer = document.createElement('div'); criteriaComparisonContainer.className = 'col-12 mt-4'; criteriaComparisonContainer.id = 'criteria-comparison-container'; outerRow.appendChild(criteriaComparisonContainer);

             setTimeout(() => {
                 _renderCriteriaComparisonTable(criteriaComparisonContainer.id, processedDataFull, currentGlobalKollektiv);
                 document.querySelectorAll('#statistik-tab-pane [data-tippy-content]').forEach(el => {
                     let currentContent = el.getAttribute('data-tippy-content') || '';
                     const kollektivToDisplay = layout === 'vergleich' ? `${kollektivDisplayNames[0]} vs. ${kollektivDisplayNames[1]}` : kollektivDisplayNames[0];
                     currentContent = currentContent.replace(/\[KOLLEKTIV_PLACEHOLDER\]/g, `<strong>${kollektivToDisplay}</strong>`);
                     currentContent = currentContent.replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivToDisplay}</strong>`);
                     currentContent = currentContent.replace(/\[KOLLEKTIV1\]/g, `<strong>${kollektivDisplayNames[0]}</strong>`);
                     currentContent = currentContent.replace(/\[KOLLEKTIV2\]/g, `<strong>${kollektivDisplayNames[1]}</strong>`);
                     el.setAttribute('data-tippy-content', currentContent);
                     if (el._tippy) { el._tippy.setContent(currentContent); }
                 });
                 ui_helpers.initializeTooltips(document.getElementById('statistik-tab-pane'));
             }, 50);
             return outerRow.outerHTML;
        });
    }

    function renderPresentationTab(view, selectedStudyId, currentGlobalKollektiv, processedDataFull, appliedCriteria, appliedLogic) {
        _renderTabContent('praesentation-tab', () => {
            if (!processedDataFull) throw new Error("Präsentations-Daten nicht verfügbar.");

            let presentationData = {};
            const globalKollektivDaten = dataProcessor.filterDataByKollektiv(processedDataFull, currentGlobalKollektiv);
            presentationData.kollektiv = currentGlobalKollektiv;
            presentationData.patientCount = globalKollektivDaten?.length ?? 0;

            if (view === 'as-pur') {
                presentationData.statsGesamt = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'Gesamt'), 'as', 'n');
                presentationData.statsDirektOP = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'direkt OP'), 'as', 'n');
                presentationData.statsNRCT = statisticsService.calculateDiagnosticPerformance(dataProcessor.filterDataByKollektiv(processedDataFull, 'nRCT'), 'as', 'n');
                presentationData.statsCurrentKollektiv = statisticsService.calculateDiagnosticPerformance(globalKollektivDaten, 'as', 'n');
            } else if (view === 'as-vs-t2') {
                 let comparisonCohortData = globalKollektivDaten;
                 let comparisonKollektivName = currentGlobalKollektiv;

                 if (selectedStudyId && selectedStudyId !== APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                     const studySetForKollektiv = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
                     if (studySetForKollektiv?.applicableKollektiv && studySetForKollektiv.applicableKollektiv !== currentGlobalKollektiv) {
                         comparisonKollektivName = studySetForKollektiv.applicableKollektiv;
                         comparisonCohortData = dataProcessor.filterDataByKollektiv(processedDataFull, comparisonKollektivName);
                     }
                 }
                 presentationData.kollektivForComparison = comparisonKollektivName;
                 presentationData.patientCountForComparison = comparisonCohortData?.length ?? 0;


                 if (comparisonCohortData && comparisonCohortData.length > 0) {
                    presentationData.statsAS = statisticsService.calculateDiagnosticPerformance(comparisonCohortData, 'as', 'n');
                    let studySet = null;
                    let evaluatedDataT2 = null;
                    const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;

                    if(isApplied) {
                        studySet = { criteria: appliedCriteria, logic: appliedLogic, id: selectedStudyId, name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME, displayShortName: "Angewandt", studyInfo: { reference: "Benutzerdefiniert (aktuell im Auswertungstab eingestellt)", patientCohort: `Vergleichskollektiv: ${getKollektivDisplayName(comparisonKollektivName)} (N=${presentationData.patientCountForComparison})`, investigationType: "N/A", focus: "Benutzereinstellung", keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic) || "Keine" } };
                        evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(comparisonCohortData), studySet.criteria, studySet.logic);
                    } else if (selectedStudyId) {
                        studySet = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
                        if(studySet) {
                           evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(comparisonCohortData), studySet);
                        }
                    }

                    if (studySet && evaluatedDataT2 && evaluatedDataT2.length > 0) {
                        presentationData.statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n');
                        let asDataForDirectComparison = cloneDeep(comparisonCohortData);
                        evaluatedDataT2.forEach((p, i) => { if (asDataForDirectComparison[i]) p.as = asDataForDirectComparison[i].as; });
                        presentationData.vergleich = statisticsService.compareDiagnosticMethods(evaluatedDataT2, 'as', 't2', 'n');

                        presentationData.comparisonCriteriaSet = studySet;
                        presentationData.t2CriteriaLabelShort = studySet.displayShortName || 'T2';
                        presentationData.t2CriteriaLabelFull = `${studySet.name}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic)}`;
                    } else if (studySet) {
                        presentationData.statsT2 = null;
                        presentationData.vergleich = null;
                        presentationData.comparisonCriteriaSet = studySet;
                        presentationData.t2CriteriaLabelShort = studySet.displayShortName || 'T2';
                        presentationData.t2CriteriaLabelFull = `${studySet.name}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic)}`;
                    }
                } else {
                     presentationData.statsAS = null;
                     presentationData.statsT2 = null;
                     presentationData.vergleich = null;
                     if(selectedStudyId) presentationData.comparisonCriteriaSet = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId) || {name: selectedStudyId, displayShortName: 'Unbekannt', criteria: {}, logic: 'ODER', studyInfo:{}};
                }
            }
            const tabContentHTML = praesentationTabLogic.createPresentationTabContent(view, presentationData, selectedStudyId, currentGlobalKollektiv);


            setTimeout(() => {
                if (view === 'as-pur') {
                     const chartContainer = document.getElementById('praes-as-pur-perf-chart');
                     if (chartContainer && presentationData?.statsCurrentKollektiv && (presentationData?.statsCurrentKollektiv?.matrix?.rp + presentationData?.statsCurrentKollektiv?.matrix?.fp + presentationData?.statsCurrentKollektiv?.matrix?.fn + presentationData?.statsCurrentKollektiv?.matrix?.rn > 0) ) {
                         const chartData = { overall: { sensVal: presentationData.statsCurrentKollektiv.sens?.value, spezVal: presentationData.statsCurrentKollektiv.spez?.value, ppvVal: presentationData.statsCurrentKollektiv.ppv?.value, npvVal: presentationData.statsCurrentKollektiv.npv?.value, accVal: presentationData.statsCurrentKollektiv.acc?.value, aucVal: presentationData.statsCurrentKollektiv.auc?.value }};
                         chartRenderer.renderASPerformanceChart('praes-as-pur-perf-chart', chartData, {}, getKollektivDisplayName(currentGlobalKollektiv));
                     } else if (chartContainer) {
                         ui_helpers.updateElementHTML(chartContainer.id, '<p class="text-muted small text-center p-3">Keine Daten für Performance-Chart.</p>');
                     }
                } else if (view === 'as-vs-t2') {
                     const chartContainer = document.getElementById('praes-comp-chart-container');
                     if (chartContainer && presentationData?.statsAS && presentationData?.statsT2 && presentationData.patientCountForComparison > 0) {
                         const chartDataComp = [
                             { metric: 'Sens', AS: presentationData.statsAS.sens?.value ?? NaN, T2: presentationData.statsT2.sens?.value ?? NaN },
                             { metric: 'Spez', AS: presentationData.statsAS.spez?.value ?? NaN, T2: presentationData.statsT2.spez?.value ?? NaN },
                             { metric: 'PPV',  AS: presentationData.statsAS.ppv?.value ?? NaN,  T2: presentationData.statsT2.ppv?.value ?? NaN },
                             { metric: 'NPV',  AS: presentationData.statsAS.npv?.value ?? NaN,  T2: presentationData.statsT2.npv?.value ?? NaN },
                             { metric: 'Acc',  AS: presentationData.statsAS.acc?.value ?? NaN,  T2: presentationData.statsT2.acc?.value ?? NaN },
                             { metric: 'AUC',  AS: presentationData.statsAS.auc?.value ?? NaN,  T2: presentationData.statsT2.auc?.value ?? NaN }
                         ].filter(d => !isNaN(d.AS) && !isNaN(d.T2));

                         if (chartDataComp.length > 0) {
                            chartRenderer.renderComparisonBarChart(chartDataComp, 'praes-comp-chart-container', { height: 300, margin: { top: 20, right: 20, bottom: 50, left: 50 } }, presentationData.t2CriteriaLabelShort || 'T2');
                         } else {
                            ui_helpers.updateElementHTML(chartContainer.id, '<p class="text-muted small text-center p-3">Unvollständige oder keine validen Daten für Vergleichschart.</p>');
                         }
                     } else if (chartContainer) {
                         ui_helpers.updateElementHTML(chartContainer.id, '<p class="text-muted small text-center p-3">Keine Daten für Vergleichschart.</p>');
                     }
                }
                ui_helpers.updatePresentationViewSelectorUI(view); const studySelect = document.getElementById('praes-study-select'); if (studySelect) studySelect.value = selectedStudyId || '';
                ui_helpers.initializeTooltips(document.getElementById('praesentation-tab-pane'));
            }, 10);

            return tabContentHTML;
        });
    }

    function renderExportTab(currentKollektiv) {
        _renderTabContent('export-tab', () => {
             const exportOptionsHTML = uiComponents.createExportOptions(currentKollektiv);
             setTimeout(() => {
                ui_helpers.initializeTooltips(document.getElementById('export-tab-pane'));
             }, 0);
             return exportOptionsHTML;
        });
    }

    function renderPublikationTab(currentLang, currentSection, currentKollektiv, globalProcessedData, bruteForceResults) {
        _renderTabContent('publikation-tab', () => {
            publikationTabLogic.initializeData(
                globalProcessedData,
                t2CriteriaManager.getAppliedCriteria(),
                t2CriteriaManager.getAppliedLogic(),
                bruteForceResults
            );

            const headerHTML = uiComponents.createPublikationTabHeader();
            const initialContentHTML = publikationTabLogic.getRenderedSectionContent(currentSection, currentLang, currentKollektiv);

            setTimeout(() => {
                const contentArea = document.getElementById('publikation-content-area');
                if (contentArea) {
                    ui_helpers.updateElementHTML(contentArea.id, initialContentHTML);
                    publikationTabLogic.updateDynamicChartsForPublicationTab(currentSection, currentLang, currentKollektiv);
                }
                 ui_helpers.updatePublikationUI(currentLang, currentSection, state.getCurrentPublikationBruteForceMetric());
                 ui_helpers.initializeTooltips(document.getElementById('publikation-tab-pane'));
            }, 10);

            return headerHTML;
        });
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
