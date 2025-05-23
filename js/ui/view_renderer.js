const viewRenderer = (() => {

    function _renderTabContent(tabId, renderFunction, ...args) {
        const containerId = `${tabId}-pane`;
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container #${containerId} nicht gefunden für Tab ${tabId}.`);
            return;
        }
        const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
        const loadingText = langKey === 'de' ? 'Lade Inhalt...' : 'Loading content...';
        ui_helpers.updateElementHTML(containerId, `<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">${loadingText}</span></div></div>`);
        try {
            const contentHTML = renderFunction(...args);
            const noContentGeneratedText = langKey === 'de' ? 'Kein Inhalt generiert.' : 'No content generated.';
            ui_helpers.updateElementHTML(containerId, contentHTML || `<p class="text-muted p-3">${noContentGeneratedText}</p>`);
            ui_helpers.initializeTooltips(container);
        } catch (error) {
            console.error(`Fehler beim Rendern von Tab ${tabId}:`, error);
            const errorLoadingText = langKey === 'de' ? 'Fehler beim Laden des Tabs:' : 'Error loading tab:';
            const errorMessage = `<div class="alert alert-danger m-3">${errorLoadingText} ${error.message}</div>`;
            ui_helpers.updateElementHTML(containerId, errorMessage);
            ui_helpers.showToast(`${errorLoadingText} '${tabId}'.`, 'danger');
        }
    }

    function renderDatenTab(data, sortState) {
        _renderTabContent('daten-tab', () => {
             const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
             if (!data) {
                const errorMsg = langKey === 'de' ? "Daten für Datentabelle nicht verfügbar." : "Data for data table not available.";
                throw new Error(errorMsg);
             }
             const tooltipTextBase = TOOLTIP_CONTENT.datenTable.expandAll;
             const tooltipText = (typeof tooltipTextBase === 'object' ? tooltipTextBase[langKey] : tooltipTextBase?.[langKey]) || tooltipTextBase?.['de'] || (langKey === 'de' ? 'Alle Details ein-/ausblenden' : 'Expand/collapse all details');
             const buttonText = langKey === 'de' ? 'Alle Details' : 'All Details';

             const toggleButtonHTML = `
                 <div class="d-flex justify-content-end mb-3" id="daten-toggle-button-container">
                     <button id="daten-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${tooltipText}">
                        ${buttonText} <i class="fas fa-chevron-down ms-1"></i>
                    </button>
                 </div>`;
            const tableHTML = dataTabLogic.createDatenTableHTML(data, sortState);
            const finalHTML = toggleButtonHTML + `<div class="table-responsive">${tableHTML}</div>`;

            setTimeout(() => {
                 const tableBody = document.getElementById('daten-table-body');
                 const tableHeader = document.getElementById('daten-table-header');
                 if (tableBody && data.length > 0) ui_helpers.attachRowCollapseListeners(tableBody);
                 if (tableHeader) ui_helpers.updateSortIcons(tableHeader.id, sortState);
            }, 0);
            return finalHTML;
        });
    }

    function _renderAuswertungDashboardCharts(stats) {
        const ids = ['chart-dash-age', 'chart-dash-gender', 'chart-dash-therapy', 'chart-dash-status-n', 'chart-dash-status-as', 'chart-dash-status-t2'];
        const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';

        if (!stats || stats.anzahlPatienten === 0) {
            const noDataText = langKey === 'de' ? 'N/V' : 'N/A';
            ids.forEach(id => ui_helpers.updateElementHTML(id, `<p class="text-muted small text-center p-2">${noDataText}</p>`));
            return;
        }
        const histOpts = { height: 130, margin: { top: 5, right: 10, bottom: 25, left: 35 }, useCompactMargins: true };
        const pieOpts = { height: 130, margin: { top: 5, right: 5, bottom: 35, left: 5 }, innerRadiusFactor: 0.45, outerRadiusFactor: 0.95, fontSize: '8px', useCompactMargins: true, legendBelow: true };

        const maleLabel = UI_TEXTS.legendLabels.male[langKey] || UI_TEXTS.legendLabels.male.de;
        const femaleLabel = UI_TEXTS.legendLabels.female[langKey] || UI_TEXTS.legendLabels.female.de;
        const unknownGenderLabel = UI_TEXTS.legendLabels.unknownGender[langKey] || UI_TEXTS.legendLabels.unknownGender.de;
        const direktOPLabel = UI_TEXTS.legendLabels.direktOP[langKey] || UI_TEXTS.legendLabels.direktOP.de;
        const nRCTLabel = UI_TEXTS.legendLabels.nRCT[langKey] || UI_TEXTS.legendLabels.nRCT.de;
        const nPositiveLabel = UI_TEXTS.legendLabels.nPositive[langKey] || UI_TEXTS.legendLabels.nPositive.de;
        const nNegativeLabel = UI_TEXTS.legendLabels.nNegative[langKey] || UI_TEXTS.legendLabels.nNegative.de;
        const asPositiveLabel = UI_TEXTS.legendLabels.asPositive[langKey] || UI_TEXTS.legendLabels.asPositive.de;
        const asNegativeLabel = UI_TEXTS.legendLabels.asNegative[langKey] || UI_TEXTS.legendLabels.asNegative.de;
        const t2PositiveLabel = UI_TEXTS.legendLabels.t2Positive[langKey] || UI_TEXTS.legendLabels.t2Positive.de;
        const t2NegativeLabel = UI_TEXTS.legendLabels.t2Negative[langKey] || UI_TEXTS.legendLabels.t2Negative.de;


        const genderData = [{label: maleLabel, value: stats.geschlecht?.m ?? 0}, {label: femaleLabel, value: stats.geschlecht?.f ?? 0}];
        if(stats.geschlecht?.unbekannt > 0) genderData.push({label: unknownGenderLabel, value: stats.geschlecht.unbekannt });
        const therapyData = [{label: direktOPLabel, value: stats.therapie?.['direkt OP'] ?? 0}, {label: nRCTLabel, value: stats.therapie?.nRCT ?? 0}];

        try {
            chartRenderer.renderAgeDistributionChart(stats.alterData || [], ids[0], histOpts, langKey);
            chartRenderer.renderPieChart(genderData, ids[1], {...pieOpts, legendItemCount: genderData.length}, langKey);
            chartRenderer.renderPieChart(therapyData, ids[2], {...pieOpts, legendItemCount: therapyData.length}, langKey);
            chartRenderer.renderPieChart([{label: nPositiveLabel, value: stats.nStatus?.plus ?? 0}, {label: nNegativeLabel, value: stats.nStatus?.minus ?? 0}], ids[3], {...pieOpts, legendItemCount: 2}, langKey);
            chartRenderer.renderPieChart([{label: asPositiveLabel, value: stats.asStatus?.plus ?? 0}, {label: asNegativeLabel, value: stats.asStatus?.minus ?? 0}], ids[4], {...pieOpts, legendItemCount: 2}, langKey);
            chartRenderer.renderPieChart([{label: t2PositiveLabel, value: stats.t2Status?.plus ?? 0}, {label: t2NegativeLabel, value: stats.t2Status?.minus ?? 0}], ids[5], {...pieOpts, legendItemCount: 2}, langKey);
        }
        catch(error) {
            console.error("Fehler bei Chart-Rendering im Dashboard:", error);
            const chartErrorText = langKey === 'de' ? 'Chart Fehler' : 'Chart Error';
            ids.forEach(id => ui_helpers.updateElementHTML(id, `<p class="text-danger small text-center p-2">${chartErrorText}</p>`));
        }
    }

     function _renderCriteriaComparisonTable(containerId, data, kollektiv) {
         const container = document.getElementById(containerId); if (!container) return;
         const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
         const cardTitleBase = UI_TEXTS.criteriaComparison.title;
         const cardTitle = (typeof cardTitleBase === 'object' ? cardTitleBase[langKey] : cardTitleBase?.[langKey]) || cardTitleBase?.['de'] || (langKey === 'de' ? 'Kriterienvergleich' : 'Criteria Comparison');
         const invalidDataText = langKey === 'de' ? 'Ungültige Daten für Vergleich.' : 'Invalid data for comparison.';
         const unknownText = langKey === 'de' ? 'Unbekannt' : 'Unknown';

         if (!Array.isArray(data)) { container.innerHTML = uiComponents.createStatistikCard('criteriaComparisonTable', cardTitle, `<p class="p-3 text-muted small">${invalidDataText}</p>`, false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich'); return; }

         const comparisonSetIds = APP_CONFIG.DEFAULT_SETTINGS.CRITERIA_COMPARISON_SETS || [];
         const results = []; const baseDataClone = cloneDeep(data);

         comparisonSetIds.forEach(setId => {
            let perf = null; let setName = unknownText; let setIdUsed = setId;
            try {
                if (setId === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) {
                    perf = statisticsService.calculateDiagnosticPerformance(baseDataClone, 'as', 'n');
                    const asDisplayNameBase = UI_TEXTS.kollektivDisplayNames.avocado_sign;
                    setName = (typeof asDisplayNameBase === 'object' ? asDisplayNameBase[langKey] : asDisplayNameBase?.[langKey]) || asDisplayNameBase?.['de'] || APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME;
                } else if (setId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                    perf = statisticsService.calculateDiagnosticPerformance(baseDataClone, 't2', 'n'); // Assumes t2 is already applied in baseDataClone for this comparison
                    const appliedDisplayNameBase = UI_TEXTS.kollektivDisplayNames.applied_criteria;
                    setName = (typeof appliedDisplayNameBase === 'object' ? appliedDisplayNameBase[langKey] : appliedDisplayNameBase?.[langKey]) || appliedDisplayNameBase?.['de'] || APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
                } else {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(setId);
                    if (studySet) {
                        const evaluatedData = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(baseDataClone), studySet);
                        perf = statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n');
                        const studySetNameBase = UI_TEXTS.literatureSetNames?.[setId];
                        setName = (typeof studySetNameBase === 'object' ? studySetNameBase[langKey] : studySetNameBase?.[langKey]) || studySetNameBase?.['de'] || studySet.name;
                    }
                    else { console.warn(`Kriterienset ${setId} für Vergleich nicht gefunden.`); }
                }
            } catch (error) { console.error(`Fehler bei Berechnung für Vergleichsset ${setId}:`, error); }

            if (perf && perf.auc && !isNaN(perf.auc.value) && isFinite(perf.auc.value)) { results.push({ id: setIdUsed, name: setName, sens: perf.sens?.value, spez: perf.spez?.value, ppv: perf.ppv?.value, npv: perf.npv?.value, acc: perf.acc?.value, auc: perf.auc?.value }); }
            else { results.push({ id: setIdUsed, name: setName, sens: NaN, spez: NaN, ppv: NaN, npv: NaN, acc: NaN, auc: NaN }); }
         });

         results.sort((a, b) => {
            if (a.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) return -1;
            if (b.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) return 1;
            if (a.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) return -1;
            if (b.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) return 1;
            return (a.name || '').localeCompare(b.name || '', langKey); });
         const tableHTML = statistikTabLogic.createCriteriaComparisonTableHTML(results, getKollektivDisplayName(kollektiv, langKey));
         container.innerHTML = uiComponents.createStatistikCard('criteriaComparisonTable', cardTitle, tableHTML, false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich');
    }


    function renderAuswertungTab(data, currentCriteria, currentLogic, sortState, currentKollektiv, bfWorkerAvailable) {
         _renderTabContent('auswertung-tab', () => {
             const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
             if (!data || !currentCriteria || !currentLogic) {
                const errorMsg = langKey === 'de' ? "Daten oder Kriterien für Auswertungstab nicht verfügbar." : "Data or criteria for evaluation tab not available.";
                throw new Error(errorMsg);
             }

             const dashboardContainerId = 'auswertung-dashboard';
             const metricsOverviewContainerId = 't2-metrics-overview';
             const bruteForceCardContainerId = 'brute-force-card-container';
             const tableCardContainerId = 'auswertung-table-card-container';

             const criteriaControlsHTML = uiComponents.createT2CriteriaControls(currentCriteria, currentLogic);
             const bruteForceCardHTML = uiComponents.createBruteForceCard(getKollektivDisplayName(currentKollektiv, langKey), bfWorkerAvailable);
             const auswertungTableCardHTML = auswertungTabLogic.createAuswertungTableCardHTML(data, sortState, currentCriteria, currentLogic);

             const loadingDashboardText = langKey === 'de' ? 'Lade Dashboard...' : 'Loading dashboard...';
             const loadingMetricsText = langKey === 'de' ? 'Lade Metrikübersicht...' : 'Loading metrics overview...';

             let finalHTML = `
                 <div class="row g-2 mb-3" id="${dashboardContainerId}">
                     <div class="col-12"><p class="text-muted text-center small p-3">${loadingDashboardText}</p></div>
                 </div>
                 <div class="row g-4">
                     <div class="col-12">${criteriaControlsHTML}</div>
                     <div class="col-12 mb-3" id="${metricsOverviewContainerId}">
                         <p class="text-muted small p-3">${loadingMetricsText}</p>
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
                             const noDataDashboardText = langKey === 'de' ? 'Keine Daten für Dashboard.' : 'No data for dashboard.';
                             ui_helpers.updateElementHTML(dashboardContainerId, `<div class="col-12"><p class="text-muted text-center small p-3">${noDataDashboardText}</p></div>`);
                         } else {
                             const downloadIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image' : 'fa-download';
                             const downloadIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code' : 'fa-download';
                             const pngTooltipBase = TOOLTIP_CONTENT.exportTab.chartSinglePNG?.description;
                             const pngTooltip = (typeof pngTooltipBase === 'object' ? pngTooltipBase[langKey] : pngTooltipBase?.[langKey]) || pngTooltipBase?.['de'] || (langKey === 'de' ? 'Als PNG' : 'As PNG');
                             const svgTooltipBase = TOOLTIP_CONTENT.exportTab.chartSingleSVG?.description;
                             const svgTooltip = (typeof svgTooltipBase === 'object' ? svgTooltipBase[langKey] : svgTooltipBase?.[langKey]) || svgTooltipBase?.['de'] || (langKey === 'de' ? 'Als SVG' : 'As SVG');

                             const createDlBtns = (baseId) => [{id:`dl-${baseId}-png`, icon: downloadIconPNG, tooltip: pngTooltip, format:'png'}, {id:`dl-${baseId}-svg`, icon: downloadIconSVG, tooltip: svgTooltip, format:'svg'}];

                             const getChartTitle = (key) => {
                                 const titleBase = UI_TEXTS.chartTitles[key];
                                 return (typeof titleBase === 'object' ? titleBase[langKey] : titleBase?.[langKey]) || titleBase?.['de'] || key;
                             };

                             dashboardContainer.innerHTML = `
                                ${uiComponents.createDashboardCard(getChartTitle('ageDistribution'), `<p class="mb-0 small">${langKey==='de'?'Median:':'Median:'} ${formatNumber(stats.alter?.median, 1, '--', false, langKey)} (${formatNumber(stats.alter?.min, 0, '--', false, langKey)} - ${formatNumber(stats.alter?.max, 0, '--', false, langKey)})</p>`, 'chart-dash-age', '', '', 'p-1', createDlBtns('chart-dash-age'))}
                                ${uiComponents.createDashboardCard(getChartTitle('genderDistribution'), `<p class="mb-0 small">M: ${stats.geschlecht?.m ?? 0} W: ${stats.geschlecht?.f ?? 0}</p>`, 'chart-dash-gender', '', '', 'p-1', createDlBtns('chart-dash-gender'))}
                                ${uiComponents.createDashboardCard(getChartTitle('therapyDistribution'), `<p class="mb-0 small">OP: ${stats.therapie?.['direkt OP'] ?? 0} nRCT: ${stats.therapie?.nRCT ?? 0}</p>`, 'chart-dash-therapy', '', '', 'p-1', createDlBtns('chart-dash-therapy'))}
                                ${uiComponents.createDashboardCard(getChartTitle('statusN'), `<p class="mb-0 small">N+: ${stats.nStatus?.plus ?? 0} N-: ${stats.nStatus?.minus ?? 0}</p>`, 'chart-dash-status-n', '', '', 'p-1', createDlBtns('chart-dash-status-n'))}
                                ${uiComponents.createDashboardCard(getChartTitle('statusAS'), `<p class="mb-0 small">AS+: ${stats.asStatus?.plus ?? 0} AS-: ${stats.asStatus?.minus ?? 0}</p>`, 'chart-dash-status-as', '', '', 'p-1', createDlBtns('chart-dash-status-as'))}
                                ${uiComponents.createDashboardCard(getChartTitle('statusT2'), `<p class="mb-0 small">T2+: ${stats.t2Status?.plus ?? 0} T2-: ${stats.t2Status?.minus ?? 0}</p>`, 'chart-dash-status-t2', '', '', 'p-1', createDlBtns('chart-dash-status-t2'))}
                             `;
                              _renderAuswertungDashboardCharts(stats);
                         }
                     } catch (error) { console.error("Fehler _renderAuswertungDashboard:", error); ui_helpers.updateElementHTML(dashboardContainerId, `<div class="col-12"><div class="alert alert-danger">${langKey === 'de' ? 'Dashboard Fehler.' : 'Dashboard Error.'}</div></div>`); }
                 }

                 if (metricsOverviewContainer) {
                     try {
                        const statsT2 = statisticsService.calculateDiagnosticPerformance(data, 't2', 'n');
                        ui_helpers.updateElementHTML(metricsOverviewContainer.id, uiComponents.createT2MetricsOverview(statsT2, getKollektivDisplayName(currentKollektiv, langKey)));
                     } catch (error) { console.error("Fehler beim Rendern der T2 Metrikübersicht:", error); ui_helpers.updateElementHTML(metricsOverviewContainer.id, `<div class="alert alert-warning p-2 small">${langKey === 'de' ? 'Fehler T2-Metriken.' : 'Error T2-Metrics.'}</div>`); }
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
             const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
             if (!processedDataFull) {
                const errorMsg = langKey === 'de' ? "Statistik-Daten nicht verfügbar." : "Statistics data not available.";
                throw new Error(errorMsg);
             }

             let datasets = [], kollektivNames = [], kollektivDisplayNames = [];
             let baseEvaluatedData = [];
             try {
                  baseEvaluatedData = t2CriteriaManager.evaluateDataset(cloneDeep(processedDataFull), appliedCriteria, appliedLogic);
             } catch(e) { console.error("Fehler bei der T2 Evaluierung für Statistik:", e); }

             if (layout === 'einzel') { const singleData = dataProcessor.filterDataByKollektiv(baseEvaluatedData, currentGlobalKollektiv); datasets.push(singleData); kollektivNames.push(currentGlobalKollektiv); kollektivDisplayNames.push(getKollektivDisplayName(currentGlobalKollektiv, langKey)); }
             else { const data1 = dataProcessor.filterDataByKollektiv(baseEvaluatedData, kollektiv1); const data2 = dataProcessor.filterDataByKollektiv(baseEvaluatedData, kollektiv2); datasets.push(data1); datasets.push(data2); kollektivNames.push(kollektiv1); kollektivNames.push(kollektiv2); kollektivDisplayNames.push(getKollektivDisplayName(kollektiv1, langKey)); kollektivDisplayNames.push(getKollektivDisplayName(kollektiv2, langKey)); }

             if (datasets.length === 0 || datasets.every(d => !Array.isArray(d) || d.length === 0)) {
                const noDataMsg = langKey === 'de' ? 'Keine Daten für Statistik-Auswahl verfügbar.' : 'No data available for statistics selection.';
                return `<div class="col-12"><div class="alert alert-warning">${noDataMsg}</div></div>`;
             }

             const outerRow = document.createElement('div'); outerRow.className = 'row g-4';
             const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image':'fa-download'; const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code':'fa-download';
             const pngTTBase = TOOLTIP_CONTENT.exportTab.chartSinglePNG?.description;
             const pngTT = (typeof pngTTBase === 'object' ? pngTTBase[langKey] : pngTTBase?.[langKey]) || pngTTBase?.['de'] || (langKey === 'de' ? 'PNG' : 'PNG');
             const svgTTBase = TOOLTIP_CONTENT.exportTab.chartSingleSVG?.description;
             const svgTT = (typeof svgTTBase === 'object' ? svgTTBase[langKey] : svgTTBase?.[langKey]) || svgTTBase?.['de'] || (langKey === 'de' ? 'SVG' : 'SVG');

             const createChartDlBtns = (baseId) => [{id:`dl-${baseId}-png`,icon:dlIconPNG,tooltip:pngTT,format:'png', chartId: baseId},{id:`dl-${baseId}-svg`,icon:dlIconSVG,tooltip:svgTT,format:'svg', chartId: baseId}];
             const createTableDlBtn = (tableId, tableName) => ({id: `dl-${tableId}-png`, icon: 'fa-image', tooltip: `${langKey === 'de' ? 'Tabelle' : 'Table'} '${tableName}' PNG`, format: 'png', tableId: tableId, tableName: tableName});

             datasets.forEach((data, i) => {
                 const kollektivName = kollektivDisplayNames[i]; const col = document.createElement('div'); col.className = layout === 'vergleich' ? 'col-xl-6' : 'col-12'; const innerRowId = `inner-stat-row-${i}`; const cohortLabel = langKey === 'de' ? 'Kollektiv' : 'Cohort'; col.innerHTML = `<h4 class="mb-3">${cohortLabel}: ${kollektivName} (N=${data.length})</h4><div class="row g-3" id="${innerRowId}"></div>`; outerRow.appendChild(col); const innerContainer = col.querySelector(`#${innerRowId}`);
                 if (data.length > 0) {
                     let stats = null;
                     try {
                         stats = {
                             deskriptiv: statisticsService.calculateDescriptiveStats(data),
                             gueteAS: statisticsService.calculateDiagnosticPerformance(data, 'as', 'n'),
                             gueteT2: statisticsService.calculateDiagnosticPerformance(data, 't2', 'n'),
                             vergleichASvsT2: statisticsService.compareDiagnosticMethods(data, 'as', 't2', 'n'),
                             assoziation: statisticsService.calculateAssociations(data, appliedCriteria, langKey)
                         };
                     } catch(e) { console.error(`Statistikfehler für Kollektiv ${i}:`, e); }

                     if (!stats) {
                        const errorCalcText = langKey === 'de' ? 'Fehler bei Statistikberechnung.' : 'Error in statistics calculation.';
                        innerContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">${errorCalcText}</div></div>`; return;
                     }
                     const descCardId=`deskriptiveStatistik-${i}`; const gueteASCardId=`diagnostischeGueteAS-${i}`; const gueteT2CardId=`diagnostischeGueteT2-${i}`; const vergleichASvsT2CardId=`statistischerVergleichASvsT2-${i}`; const assoziationCardId=`assoziationEinzelkriterien-${i}`;
                     const descTitle = langKey === 'de' ? 'Deskriptive Statistik' : 'Descriptive Statistics';
                     const gueteASTitle = langKey === 'de' ? 'Güte - Avocado Sign (vs. N)' : 'Performance - Avocado Sign (vs. N)';
                     const gueteT2Title = langKey === 'de' ? 'Güte - T2 (angewandt vs. N)' : 'Performance - T2 (applied vs. N)';
                     const vergleichAST2Title = langKey === 'de' ? 'Vergleich - AS vs. T2 (angewandt)' : 'Comparison - AS vs. T2 (applied)';
                     const assoziationTitle = langKey === 'de' ? 'Assoziation Merkmale vs. N-Status' : 'Association Features vs. N-Status';

                     innerContainer.innerHTML += uiComponents.createStatistikCard(descCardId, descTitle, statistikTabLogic.createDeskriptiveStatistikContentHTML(stats, i, kollektivName), false, 'deskriptiveStatistik', [], `table-deskriptiv-demographie-${i}`);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(gueteASCardId, gueteASTitle, statistikTabLogic.createGueteContentHTML(stats.gueteAS, 'AS', kollektivName), false, 'diagnostischeGueteAS', [createTableDlBtn(`table-guete-metrics-AS-${kollektivName.replace(/\s+/g, '_')}`, 'Guete_AS'), createTableDlBtn(`table-guete-matrix-AS-${kollektivName.replace(/\s+/g, '_')}`, 'Matrix_AS')], `table-guete-metrics-AS-${kollektivName.replace(/\s+/g, '_')}`);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(gueteT2CardId, gueteT2Title, statistikTabLogic.createGueteContentHTML(stats.gueteT2, 'T2', kollektivName), false, 'diagnostischeGueteT2', [createTableDlBtn(`table-guete-metrics-T2-${kollektivName.replace(/\s+/g, '_')}`, 'Guete_T2'), createTableDlBtn(`table-guete-matrix-T2-${kollektivName.replace(/\s+/g, '_')}`, 'Matrix_T2')], `table-guete-metrics-T2-${kollektivName.replace(/\s+/g, '_')}`);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(vergleichASvsT2CardId, vergleichAST2Title, statistikTabLogic.createVergleichContentHTML(stats.vergleichASvsT2, kollektivName), false, 'statistischerVergleichASvsT2', [createTableDlBtn(`table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}`, 'Vergleich_AS_T2')], `table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}`);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(assoziationCardId, assoziationTitle, statistikTabLogic.createAssoziationContentHTML(stats.assoziation, kollektivName, appliedCriteria), false, 'assoziationEinzelkriterien', [createTableDlBtn(`table-assoziation-${kollektivName.replace(/\s+/g, '_')}`, 'Assoziation')], `table-assoziation-${kollektivName.replace(/\s+/g, '_')}`);
                     const ageChartId=`chart-stat-age-${i}`; const genderChartId=`chart-stat-gender-${i}`;

                     setTimeout(() => {
                         const descCardCont = document.getElementById(`${descCardId}-card-container`);
                         if (descCardCont) {
                             const hdrBtns = descCardCont.querySelector('.card-header-buttons');
                             if (hdrBtns) {
                                 const ageBtns=createChartDlBtns(ageChartId); const genderBtns=createChartDlBtns(genderChartId);
                                 const t1PNG=createTableDlBtn(`table-deskriptiv-demographie-${i}`, 'Deskriptive_Demographie');
                                 const t2PNG=createTableDlBtn(`table-deskriptiv-lk-${i}`, 'Deskriptive_LK');
                                 const ageLabel = langKey === 'de' ? 'Alter' : 'Age';
                                 const genderLabel = langKey === 'de' ? 'Geschlecht' : 'Gender';
                                 hdrBtns.innerHTML = ageBtns.map(b=>`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${b.id}" data-chart-id="${b.chartId}" data-format="${b.format}" data-tippy-content="${b.tooltip} (${ageLabel})"><i class="fas ${b.icon}"></i></button>`).join('')+genderBtns.map(b=>`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${b.id}" data-chart-id="${b.chartId}" data-format="${b.format}" data-tippy-content="${b.tooltip} (${genderLabel})"><i class="fas ${b.icon}"></i></button>`).join('')+`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${t1PNG.id}" data-table-id="${t1PNG.tableId}" data-table-name="${t1PNG.tableName}" data-tippy-content="${t1PNG.tooltip}"><i class="fas ${t1PNG.icon}"></i></button>`+`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${t2PNG.id}" data-table-id="${t2PNG.tableId}" data-table-name="${t2PNG.tableName}" data-tippy-content="${t2PNG.tooltip}"><i class="fas ${t2PNG.icon}"></i></button>`;
                             }
                         }
                        const ageChartDiv = document.getElementById(ageChartId);
                        if (ageChartDiv) {
                           chartRenderer.renderAgeDistributionChart(stats.deskriptiv.alterData || [], ageChartId, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 40 } }, langKey);
                        }
                         const genderChartDiv = document.getElementById(genderChartId);
                         if (genderChartDiv) {
                            const genderData = [{label: UI_TEXTS.legendLabels.male[langKey] || UI_TEXTS.legendLabels.male.de, value: stats.deskriptiv.geschlecht?.m ?? 0}, {label: UI_TEXTS.legendLabels.female[langKey] || UI_TEXTS.legendLabels.female.de, value: stats.deskriptiv.geschlecht?.f ?? 0}]; if(stats.deskriptiv.geschlecht?.unbekannt > 0) genderData.push({label: UI_TEXTS.legendLabels.unknownGender[langKey] || UI_TEXTS.legendLabels.unknownGender.de, value: stats.deskriptiv.geschlecht.unbekannt });
                            chartRenderer.renderPieChart(genderData, genderChartId, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderData.length }, langKey);
                        }
                     }, 50);
                 } else {
                    const noDataCohortText = langKey === 'de' ? 'Keine Daten für dieses Kollektiv.' : 'No data for this cohort.';
                    innerContainer.innerHTML = `<div class="col-12"><div class="alert alert-warning small p-2">${noDataCohortText}</div></div>`;
                 }
             });

             if (layout === 'vergleich' && datasets.length === 2 && datasets.some(d => d.length > 0)) { // Ensure at least one dataset has data for comparison
                 const comparisonCardContainer = document.createElement('div'); comparisonCardContainer.className = 'col-12 mt-4';
                 const title = `${langKey === 'de' ? 'Vergleich' : 'Comparison'}: ${kollektivDisplayNames[0]} vs. ${kollektivDisplayNames[1]}`;
                 const tableIdComp = `table-vergleich-kollektive-${kollektivNames[0].replace(/\s+/g, '_')}-vs-${kollektivNames[1].replace(/\s+/g, '_')}`;
                 const downloadBtnComp = createTableDlBtn(tableIdComp, `${langKey === 'de' ? 'Vergleich_Kollektive' : 'Comparison_Cohorts'}`);
                 let vergleichContent = `<p class="text-muted small p-3">${langKey === 'de' ? 'Nicht genügend Daten für direkten Kollektivvergleich.' : 'Insufficient data for direct cohort comparison.'}</p>`;
                 if (datasets[0].length > 0 && datasets[1].length > 0) {
                    const vergleichKollektiveStats = statisticsService.compareCohorts(datasets[0], datasets[1], appliedCriteria, appliedLogic);
                    vergleichContent = statistikTabLogic.createVergleichKollektiveContentHTML(vergleichKollektiveStats, kollektivNames[0], kollektivNames[1]);
                 }
                 comparisonCardContainer.innerHTML = uiComponents.createStatistikCard('vergleichKollektive', title, vergleichContent, false, 'vergleichKollektive', [downloadBtnComp], tableIdComp); outerRow.appendChild(comparisonCardContainer);
             }
             const criteriaComparisonContainer = document.createElement('div'); criteriaComparisonContainer.className = 'col-12 mt-4'; criteriaComparisonContainer.id = 'criteria-comparison-container'; outerRow.appendChild(criteriaComparisonContainer);

             setTimeout(() => {
                  const globalKollektivData = dataProcessor.filterDataByKollektiv(baseEvaluatedData, currentGlobalKollektiv);
                 _renderCriteriaComparisonTable(criteriaComparisonContainer.id, globalKollektivData, currentGlobalKollektiv);
                 document.querySelectorAll('#statistik-tab-pane [data-tippy-content]').forEach(el => {
                     let currentContent = el.getAttribute('data-tippy-content') || '';
                     const kollektivToDisplay = layout === 'vergleich' ? `${kollektivDisplayNames[0]} vs. ${kollektivDisplayNames[1]}` : kollektivDisplayNames[0];
                     currentContent = currentContent.replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivToDisplay}</strong>`);
                     currentContent = currentContent.replace(/\[KOLLEKTIV1\]/g, `<strong>${kollektivDisplayNames[0]}</strong>`);
                     currentContent = currentContent.replace(/\[KOLLEKTIV2\]/g, `<strong>${kollektivDisplayNames[1]}</strong>`);
                     el.setAttribute('data-tippy-content', currentContent);
                     if (el._tippy && el._tippy.state.isEnabled) { el._tippy.setContent(currentContent); }
                     else if(!el._tippy) { ui_helpers.initializeTooltips(el.parentElement || el); }
                 });
                 ui_helpers.initializeTooltips(document.getElementById('statistik-tab-pane'));
             }, 50);
             return outerRow.outerHTML;
        });
    }

    function renderPresentationTab(view, selectedStudyId, currentGlobalKollektiv, processedDataFull, appliedCriteria, appliedLogic) {
        _renderTabContent('praesentation-tab', () => {
            const langKey = (typeof state !== 'undefined' && typeof state.getCurrentPublikationLang === 'function') ? state.getCurrentPublikationLang() : 'de';
            if (!processedDataFull) {
                const errorMsg = langKey === 'de' ? "Präsentations-Daten nicht verfügbar." : "Presentation data not available.";
                throw new Error(errorMsg);
            }

            let presentationData = {}; const filteredData = dataProcessor.filterDataByKollektiv(processedDataFull, currentGlobalKollektiv); presentationData.kollektiv = currentGlobalKollektiv; presentationData.patientCount = filteredData?.length ?? 0;

            if (view === 'as-pur') {
                const kollektivesToCalc = ['Gesamt', 'direkt OP', 'nRCT']; let statsCurrent = null;
                kollektivesToCalc.forEach(kollektivId => { const filtered = dataProcessor.filterDataByKollektiv(processedDataFull, kollektivId); let stats = null; if (filtered && filtered.length > 0) stats = statisticsService.calculateDiagnosticPerformance(filtered, 'as', 'n'); let keyName = `stats${kollektivId.replace(/\s+/g, '')}`; if (kollektivId === 'direkt OP') keyName = 'statsDirektOP'; else if (kollektivId === 'nRCT') keyName = 'statsNRCT'; presentationData[keyName] = stats; if (kollektivId === currentGlobalKollektiv) statsCurrent = stats; });
                presentationData.statsCurrentKollektiv = statsCurrent;
            } else if (view === 'as-vs-t2') {
                 if (filteredData && filteredData.length > 0) {
                    presentationData.statsAS = statisticsService.calculateDiagnosticPerformance(filteredData, 'as', 'n'); let studySet = null; let evaluatedDataT2 = null; const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
                    const appliedCriteriaDisplayNameBase = UI_TEXTS.kollektivDisplayNames.applied_criteria;
                    const appliedCriteriaDisplayName = (typeof appliedCriteriaDisplayNameBase === 'object' ? appliedCriteriaDisplayNameBase[langKey] : appliedCriteriaDisplayNameBase?.[langKey]) || appliedCriteriaDisplayNameBase?.['de'] || APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
                    const appliedCriteriaShortName = langKey === 'de' ? 'Angewandt' : 'Applied';

                    if(isApplied) {
                        const currentAppliedCriteria = t2CriteriaManager.getAppliedCriteria(); // Get fresh applied criteria
                        const currentAppliedLogic = t2CriteriaManager.getAppliedLogic();
                        studySet = { criteria: currentAppliedCriteria, logic: currentAppliedLogic, id: selectedStudyId, name: appliedCriteriaDisplayName, displayShortName: appliedCriteriaShortName, studyInfo: { reference: (langKey === 'de' ? "Benutzerdefiniert" : "User-defined"), patientCohort: `${langKey === 'de' ? "Aktuell:" : "Current:"} ${getKollektivDisplayName(currentGlobalKollektiv, langKey)} (N=${presentationData.patientCount})`, investigationType: "N/A", focus: (langKey === 'de' ? "Benutzereinstellung" : "User Setting"), keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(currentAppliedCriteria, currentAppliedLogic, false, langKey) || (langKey === 'de' ? "Keine" : "None") } };
                        evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), studySet.criteria, studySet.logic);
                    } else if (selectedStudyId) {
                        studySet = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
                        if(studySet) evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(filteredData), studySet);
                    }
                    if (studySet && evaluatedDataT2) {
                        presentationData.statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n');
                        const dataForComparison = cloneDeep(evaluatedDataT2); // Ensure AS status is on the same evaluated dataset
                        dataForComparison.forEach((p, i) => { if (filteredData[i]) p.as = filteredData[i].as; }); // Copy AS status from original filtered (but not T2-re-evaluated) data
                        presentationData.vergleich = statisticsService.compareDiagnosticMethods(dataForComparison, 'as', 't2', 'n');
                        presentationData.comparisonCriteriaSet = studySet;
                        const studySetNameBase = UI_TEXTS.literatureSetNames?.[studySet.id];
                        const studySetName = (typeof studySetNameBase === 'object' ? studySetNameBase[langKey] : studySetNameBase?.[langKey]) || studySetNameBase?.['de'] || studySet.name;

                        presentationData.t2CriteriaLabelShort = studySet.displayShortName || (langKey==='de'?'T2 Lit.':'T2 Lit.');
                        presentationData.t2CriteriaLabelFull = `${studySetName}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, false, langKey)}`;
                    } else {
                        presentationData.statsT2 = null;
                        presentationData.vergleich = null;
                        presentationData.comparisonCriteriaSet = null;
                        presentationData.t2CriteriaLabelShort = langKey === 'de' ? 'T2 (Fehler)' : 'T2 (Error)';
                        presentationData.t2CriteriaLabelFull = langKey === 'de' ? 'Fehler beim Laden der T2 Kriterienbasis.' : 'Error loading T2 criteria basis.';
                    }
                }
            }
            const tabContentHTML = praesentationTabLogic.createPresentationTabContent(view, presentationData, selectedStudyId, currentGlobalKollektiv);

            setTimeout(() => {
                const noDataChartText = langKey === 'de' ? 'Keine Daten für Chart.' : 'No data for chart.';
                if (view === 'as-pur') {
                     const chartContainer = document.getElementById('praes-as-pur-perf-chart');
                     if (chartContainer && presentationData?.statsCurrentKollektiv && presentationData.patientCount > 0 && !isNaN(presentationData.statsCurrentKollektiv.sens?.value) && isFinite(presentationData.statsCurrentKollektiv.sens?.value)) {
                         const chartData = { overall: { sensVal: presentationData.statsCurrentKollektiv.sens?.value, spezVal: presentationData.statsCurrentKollektiv.spez?.value, ppvVal: presentationData.statsCurrentKollektiv.ppv?.value, npvVal: presentationData.statsCurrentKollektiv.npv?.value, accVal: presentationData.statsCurrentKollektiv.acc?.value, aucVal: presentationData.statsCurrentKollektiv.auc?.value }};
                         chartRenderer.renderASPerformanceChart('praes-as-pur-perf-chart', chartData, {}, getKollektivDisplayName(currentGlobalKollektiv, langKey));
                     } else if (chartContainer) {
                         ui_helpers.updateElementHTML(chartContainer.id, `<p class="text-muted small text-center p-3">${noDataChartText}</p>`);
                     }
                } else if (view === 'as-vs-t2') {
                     const chartContainer = document.getElementById('praes-comp-chart-container');
                     if (chartContainer && presentationData?.statsAS && presentationData?.statsT2 && presentationData.patientCount > 0 && !isNaN(presentationData.statsAS.sens?.value) && isFinite(presentationData.statsAS.sens?.value) && !isNaN(presentationData.statsT2.sens?.value) && isFinite(presentationData.statsT2.sens?.value)) {
                         const chartDataComp = [ { metric: 'Sens', AS: presentationData.statsAS.sens?.value ?? NaN, T2: presentationData.statsT2.sens?.value ?? NaN }, { metric: 'Spez', AS: presentationData.statsAS.spez?.value ?? NaN, T2: presentationData.statsT2.spez?.value ?? NaN }, { metric: 'PPV', AS: presentationData.statsAS.ppv?.value ?? NaN, T2: presentationData.statsT2.ppv?.value ?? NaN }, { metric: 'NPV', AS: presentationData.statsAS.npv?.value ?? NaN, T2: presentationData.statsT2.npv?.value ?? NaN }, { metric: 'Acc', AS: presentationData.statsAS.acc?.value ?? NaN, T2: presentationData.statsT2.acc?.value ?? NaN }, { metric: 'AUC', AS: presentationData.statsAS.auc?.value ?? NaN, T2: presentationData.statsT2.auc?.value ?? NaN } ].filter(d => !isNaN(d.AS) && isFinite(d.AS) && !isNaN(d.T2) && isFinite(d.T2));
                         if (chartDataComp.length > 0) {
                            chartRenderer.renderComparisonBarChart(chartDataComp, 'praes-comp-chart-container', { height: 300, margin: { top: 20, right: 20, bottom: 50, left: 55 } }, presentationData.t2CriteriaLabelShort || 'T2', langKey);
                         } else {
                            ui_helpers.updateElementHTML(chartContainer.id, `<p class="text-muted small text-center p-3">${noDataChartText}</p>`);
                         }
                     } else if (chartContainer) {
                         ui_helpers.updateElementHTML(chartContainer.id, `<p class="text-muted small text-center p-3">${noDataChartText}</p>`);
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
             return uiComponents.createExportOptions(currentKollektiv);
        });
    }

    function renderPublikationTab(currentLang, currentSection, currentKollektiv, globalProcessedData, bruteForceResults) {
        _renderTabContent('publikation-tab', () => {
            publikationTabLogic.initializeData( // Ensure data is fresh for this rendering pass
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
                    ui_helpers.initializeTooltips(document.getElementById('publikation-tab-pane'));
                }
                 ui_helpers.updatePublikationUI(currentLang, (typeof state !== 'undefined' && state.getCurrentPublikationSection) ? state.getCurrentPublikationSection() : PUBLICATION_CONFIG.defaultSection.split('_')[0] , (typeof state !== 'undefined' && state.getCurrentPublikationBruteForceMetric) ? state.getCurrentPublikationBruteForceMetric() : PUBLICATION_CONFIG.defaultBruteForceMetricForPublication);
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
