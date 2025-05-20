const viewRenderer = ((uiHelpers, uiComp, viewLogic, statsService, sT2CritManager, t2CritManager, dProcessor, cRenderer, pubTabRenderer) => {

    function _renderTabContent(tabId, renderFunction) {
        const containerId = `${tabId}-pane`;
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container #${containerId} nicht gefunden für Tab ${tabId}.`);
            return;
        }
        uiHelpers.updateElementHTML(containerId, '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade Inhalt...</span></div></div>');
        try {
            const contentHTML = renderFunction();
            uiHelpers.updateElementHTML(containerId, contentHTML || '<p class="text-muted p-3">Kein Inhalt generiert.</p>');
            uiHelpers.initializeTooltips(container);
        } catch (error) {
            console.error(`Fehler beim Rendern von Tab ${tabId}:`, error);
            const errorMessage = `<div class="alert alert-danger m-3">Fehler beim Laden des Tabs: ${error.message}</div>`;
            uiHelpers.updateElementHTML(containerId, errorMessage);
            uiHelpers.showToast(`Fehler beim Laden des Tabs '${tabId}'.`, 'danger');
        }
    }

    function renderDatenTab(data, sortState) {
        _renderTabContent('daten-tab', () => {
             if (!data) throw new Error("Daten für Datentabelle nicht verfügbar.");
             const toggleButtonHTML = `
                 <div class="d-flex justify-content-end mb-3" id="daten-toggle-button-container">
                     <button id="daten-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${TOOLTIP_CONTENT.datenTable.expandAll || 'Alle Details ein-/ausblenden'}">
                        Alle Details <i class="fas fa-chevron-down ms-1"></i>
                    </button>
                 </div>`;
            const tableHTML = viewLogic.createDatenTableHTML(data, sortState);
            const finalHTML = toggleButtonHTML + `<div class="table-responsive">${tableHTML}</div>`;

            setTimeout(() => {
                 const tableBody = document.getElementById('daten-table-body');
                 const tableHeader = document.getElementById('daten-table-header');
                 if (tableBody && data.length > 0) uiHelpers.attachRowCollapseListeners(tableBody);
                 if (tableHeader) uiHelpers.updateSortIcons(tableHeader.id, sortState);
            }, 0);
            return finalHTML;
        });
    }

    function _renderAuswertungDashboardCharts(stats) {
        const ids = ['chart-dash-age', 'chart-dash-gender', 'chart-dash-therapy', 'chart-dash-status-n', 'chart-dash-status-as', 'chart-dash-status-t2'];
        if (!stats || stats.anzahlPatienten === 0) { ids.forEach(id => uiHelpers.updateElementHTML(id, '<p class="text-muted small text-center p-2">N/A</p>')); return; };
        const histOpts = { height: 130, margin: { top: 5, right: 10, bottom: 25, left: 35 }, useCompactMargins: true };
        const pieOpts = { height: 130, margin: { top: 5, right: 5, bottom: 35, left: 5 }, innerRadiusFactor: 0.45, outerRadiusFactor: 0.95, fontSize: '8px', useCompactMargins: true, legendBelow: true };
        const genderData = [{label: UI_TEXTS.legendLabels.male, value: stats.geschlecht?.m ?? 0}, {label: UI_TEXTS.legendLabels.female, value: stats.geschlecht?.f ?? 0}];
        if(stats.geschlecht?.unbekannt > 0) genderData.push({label: UI_TEXTS.legendLabels.unknownGender, value: stats.geschlecht.unbekannt });
        const therapyData = [{label: UI_TEXTS.legendLabels.direktOP, value: stats.therapie?.['direkt OP'] ?? 0}, {label: UI_TEXTS.legendLabels.nRCT, value: stats.therapie?.nRCT ?? 0}];
        try {
            cRenderer.renderAgeDistributionChart(stats.alterData || [], ids[0], histOpts);
            cRenderer.renderPieChart(genderData, ids[1], {...pieOpts, legendItemCount: genderData.length});
            cRenderer.renderPieChart(therapyData, ids[2], {...pieOpts, legendItemCount: therapyData.length});
            cRenderer.renderPieChart([{label: UI_TEXTS.legendLabels.nPositive, value: stats.nStatus?.plus ?? 0}, {label: UI_TEXTS.legendLabels.nNegative, value: stats.nStatus?.minus ?? 0}], ids[3], {...pieOpts, legendItemCount: 2});
            cRenderer.renderPieChart([{label: UI_TEXTS.legendLabels.asPositive, value: stats.asStatus?.plus ?? 0}, {label: UI_TEXTS.legendLabels.asNegative, value: stats.asStatus?.minus ?? 0}], ids[4], {...pieOpts, legendItemCount: 2});
            cRenderer.renderPieChart([{label: UI_TEXTS.legendLabels.t2Positive, value: stats.t2Status?.plus ?? 0}, {label: UI_TEXTS.legendLabels.t2Negative, value: stats.t2Status?.minus ?? 0}], ids[5], {...pieOpts, legendItemCount: 2});
        }
        catch(error) { console.error("Fehler bei Chart-Rendering:", error); ids.forEach(id => uiHelpers.updateElementHTML(id, '<p class="text-danger small text-center p-2">Chart Fehler</p>')); }
    }

     function _renderCriteriaComparisonTable(containerId, data, kollektiv) {
         const container = document.getElementById(containerId); if (!container) return;
         if (!Array.isArray(data)) { container.innerHTML = uiComp.createStatistikCard('criteriaComparisonTable', UI_TEXTS.criteriaComparison.title, '<p class="p-3 text-muted small">Ungültige Daten für Vergleich.</p>', false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich'); return; }

         const comparisonSetIds = APP_CONFIG.DEFAULT_SETTINGS.CRITERIA_COMPARISON_SETS || [];
         const results = []; const baseDataClone = cloneDeep(data);

         comparisonSetIds.forEach(setId => {
            let perf = null; let setName = 'Unbekannt'; let setIdUsed = setId;
            try {
                if (setId === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) {
                    perf = statsService.calculateDiagnosticPerformance(baseDataClone, 'as', 'n'); setName = APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME;
                } else if (setId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                    perf = statsService.calculateDiagnosticPerformance(baseDataClone, 't2', 'n'); setName = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
                } else {
                    const studySet = sT2CritManager.getStudyCriteriaSetById(setId);
                    if (studySet) { const evaluatedData = sT2CritManager.applyStudyT2CriteriaToDataset(cloneDeep(baseDataClone), studySet); perf = statsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n'); setName = studySet.name; }
                    else { console.warn(`Kriterienset ${setId} für Vergleich nicht gefunden.`); }
                }
            } catch (error) { console.error(`Fehler bei Berechnung für Vergleichsset ${setId}:`, error); }

            if (perf && !isNaN(perf.auc?.value)) { results.push({ id: setIdUsed, name: setName, sens: perf.sens?.value, spez: perf.spez?.value, ppv: perf.ppv?.value, npv: perf.npv?.value, acc: perf.acc?.value, auc: perf.auc?.value }); }
            else { results.push({ id: setIdUsed, name: setName, sens: NaN, spez: NaN, ppv: NaN, npv: NaN, acc: NaN, auc: NaN }); }
         });

         results.sort((a, b) => { if (a.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) return -1; if (b.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) return 1; if (a.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) return -1; if (b.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) return 1; return (a.name || '').localeCompare(b.name || ''); });
         const tableHTML = viewLogic.createCriteriaComparisonTableHTML(results, getKollektivDisplayName(kollektiv));
         container.innerHTML = uiComp.createStatistikCard('criteriaComparisonTable', UI_TEXTS.criteriaComparison.title, tableHTML, false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich');
    }


    function renderAuswertungTab(data, currentCriteria, currentLogic, sortState, currentKollektiv, bfWorkerAvailable) {
         _renderTabContent('auswertung-tab', () => {
             if (!data || !currentCriteria || !currentLogic) throw new Error("Daten oder Kriterien für Auswertungstab nicht verfügbar.");

             const dashboardContainerId = 'auswertung-dashboard';
             const metricsOverviewContainerId = 't2-metrics-overview';
             const bruteForceCardContainerId = 'brute-force-card-container';
             const tableCardContainerId = 'auswertung-table-card-container';

             const criteriaControlsHTML = uiComp.createT2CriteriaControls(currentCriteria, currentLogic);
             const bruteForceCardHTML = uiComp.createBruteForceCard(getKollektivDisplayName(currentKollektiv), bfWorkerAvailable);
             const auswertungTableCardHTML = viewLogic.createAuswertungTableCardHTML(data, sortState, currentCriteria, currentLogic);


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
                         const stats = statsService.calculateDescriptiveStats(data);
                         if (!stats || stats.anzahlPatienten === 0) {
                             uiHelpers.updateElementHTML(dashboardContainerId, '<div class="col-12"><p class="text-muted text-center small p-3">Keine Daten für Dashboard.</p></div>');
                         } else {
                             const downloadIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image' : 'fa-download';
                             const downloadIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code' : 'fa-download';
                             const pngTooltip = TOOLTIP_CONTENT.exportTab.chartSinglePNG?.description || 'Als PNG';
                             const svgTooltip = TOOLTIP_CONTENT.exportTab.chartSingleSVG?.description || 'Als SVG';
                             const createDlBtns = (baseId) => [{id:`dl-${baseId}-png`, icon: downloadIconPNG, tooltip: pngTooltip, format:'png'}, {id:`dl-${baseId}-svg`, icon: downloadIconSVG, tooltip: svgTooltip, format:'svg'}];

                             dashboardContainer.innerHTML = `
                                ${uiComp.createDashboardCard(UI_TEXTS.chartTitles.ageDistribution, `<p class="mb-0 small">Median: ${formatNumber(stats.alter?.median, 1)} (${formatNumber(stats.alter?.min, 0)} - ${formatNumber(stats.alter?.max, 0)})</p>`, 'chart-dash-age', '', '', 'p-1', createDlBtns('chart-dash-age'))}
                                ${uiComp.createDashboardCard(UI_TEXTS.chartTitles.genderDistribution, `<p class="mb-0 small">M: ${stats.geschlecht?.m ?? 0} W: ${stats.geschlecht?.f ?? 0}</p>`, 'chart-dash-gender', '', '', 'p-1', createDlBtns('chart-dash-gender'))}
                                ${uiComp.createDashboardCard(UI_TEXTS.chartTitles.therapyDistribution, `<p class="mb-0 small">OP: ${stats.therapie?.['direkt OP'] ?? 0} nRCT: ${stats.therapie?.nRCT ?? 0}</p>`, 'chart-dash-therapy', '', '', 'p-1', createDlBtns('chart-dash-therapy'))}
                                ${uiComp.createDashboardCard(UI_TEXTS.chartTitles.statusN, `<p class="mb-0 small">N+: ${stats.nStatus?.plus ?? 0} N-: ${stats.nStatus?.minus ?? 0}</p>`, 'chart-dash-status-n', '', '', 'p-1', createDlBtns('chart-dash-status-n'))}
                                ${uiComp.createDashboardCard(UI_TEXTS.chartTitles.statusAS, `<p class="mb-0 small">AS+: ${stats.asStatus?.plus ?? 0} AS-: ${stats.asStatus?.minus ?? 0}</p>`, 'chart-dash-status-as', '', '', 'p-1', createDlBtns('chart-dash-status-as'))}
                                ${uiComp.createDashboardCard(UI_TEXTS.chartTitles.statusT2, `<p class="mb-0 small">T2+: ${stats.t2Status?.plus ?? 0} T2-: ${stats.t2Status?.minus ?? 0}</p>`, 'chart-dash-status-t2', '', '', 'p-1', createDlBtns('chart-dash-status-t2'))}
                             `;
                              _renderAuswertungDashboardCharts(stats);
                         }
                     } catch (error) { console.error("Fehler _renderAuswertungDashboard:", error); uiHelpers.updateElementHTML(dashboardContainerId, '<div class="col-12"><div class="alert alert-danger">Dashboard Fehler.</div></div>'); }
                 }

                 if (metricsOverviewContainer) {
                     try {
                        const statsT2 = statsService.calculateDiagnosticPerformance(data, 't2', 'n');
                        uiHelpers.updateElementHTML(metricsOverviewContainer.id, uiComp.createT2MetricsOverview(statsT2, getKollektivDisplayName(currentKollektiv)));
                     } catch (error) { console.error("Fehler beim Rendern der T2 Metrikübersicht:", error); uiHelpers.updateElementHTML(metricsOverviewContainer.id, '<div class="alert alert-warning p-2 small">Fehler T2-Metriken.</div>'); }
                 }

                 if(tableContainer) {
                    const tableBody = tableContainer.querySelector('#auswertung-table-body');
                    const tableHeader = tableContainer.querySelector('#auswertung-table-header');
                    if (tableBody && data.length > 0) uiHelpers.attachRowCollapseListeners(tableBody);
                    if (tableHeader) uiHelpers.updateSortIcons(tableHeader.id, sortState);
                 }

                 uiHelpers.updateT2CriteriaControlsUI(currentCriteria, currentLogic);
                 uiHelpers.markCriteriaSavedIndicator(t2CritManager.isUnsaved());
                 uiHelpers.updateBruteForceUI('idle', {}, bfWorkerAvailable, currentKollektiv);

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
                  baseEvaluatedData = t2CritManager.evaluateDataset(cloneDeep(processedDataFull), appliedCriteria, appliedLogic);
             } catch(e) { console.error("Fehler bei der T2 Evaluierung für Statistik:", e); }

             if (layout === 'einzel') { const singleData = dProcessor.filterDataByKollektiv(baseEvaluatedData, currentGlobalKollektiv); datasets.push(singleData); kollektivNames.push(currentGlobalKollektiv); kollektivDisplayNames.push(getKollektivDisplayName(currentGlobalKollektiv)); }
             else { const data1 = dProcessor.filterDataByKollektiv(baseEvaluatedData, kollektiv1); const data2 = dProcessor.filterDataByKollektiv(baseEvaluatedData, kollektiv2); datasets.push(data1); datasets.push(data2); kollektivNames.push(kollektiv1); kollektivNames.push(kollektiv2); kollektivDisplayNames.push(getKollektivDisplayName(kollektiv1)); kollektivDisplayNames.push(getKollektivDisplayName(kollektiv2)); }

             if (datasets.length === 0 || datasets.every(d => !Array.isArray(d) || d.length === 0)) { return '<div class="col-12"><div class="alert alert-warning">Keine Daten für Statistik-Auswahl verfügbar.</div></div>'; }

             const outerRow = document.createElement('div'); outerRow.className = 'row g-4';
             const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image':'fa-download'; const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code':'fa-download'; const pngTT = TOOLTIP_CONTENT.exportTab.chartSinglePNG?.description || 'PNG'; const svgTT = TOOLTIP_CONTENT.exportTab.chartSingleSVG?.description || 'SVG'; const createChartDlBtns = (baseId) => [{id:`dl-${baseId}-png`,icon:dlIconPNG,tooltip:pngTT,format:'png'},{id:`dl-${baseId}-svg`,icon:dlIconSVG,tooltip:svgTT,format:'svg'}];
             const createTableDlBtn = (tableId, tableName) => ({id: `dl-${tableId}-png`, icon: 'fa-image', tooltip: `Tabelle '${tableName}' PNG`, format: 'png', tableId: tableId, tableName: tableName});

             datasets.forEach((data, i) => {
                 const kollektivName = kollektivDisplayNames[i]; const col = document.createElement('div'); col.className = layout === 'vergleich' ? 'col-xl-6' : 'col-12'; const innerRowId = `inner-stat-row-${i}`; col.innerHTML = `<h4 class="mb-3">Kollektiv: ${kollektivName} (N=${data.length})</h4><div class="row g-3" id="${innerRowId}"></div>`; outerRow.appendChild(col); const innerContainer = col.querySelector(`#${innerRowId}`);
                 if (data.length > 0) {
                     let stats = null;
                     try {
                         stats = {
                             deskriptiv: statsService.calculateDescriptiveStats(data),
                             gueteAS: statsService.calculateDiagnosticPerformance(data, 'as', 'n'),
                             gueteT2: statsService.calculateDiagnosticPerformance(data, 't2', 'n'),
                             vergleichASvsT2: statsService.compareDiagnosticMethods(data, 'as', 't2', 'n'),
                             assoziation: statsService.calculateAssociations(data, appliedCriteria)
                         };
                     } catch(e) { console.error(`Statistikfehler für Kollektiv ${i}:`, e); }

                     if (!stats) { innerContainer.innerHTML = '<div class="col-12"><div class="alert alert-danger">Fehler bei Statistikberechnung.</div></div>'; return; }
                     const descCardId=`deskriptiveStatistik-${i}`; const gueteASCardId=`diagnostischeGueteAS-${i}`; const gueteT2CardId=`diagnostischeGueteT2-${i}`; const vergleichASvsT2CardId=`statistischerVergleichASvsT2-${i}`; const assoziationCardId=`assoziationEinzelkriterien-${i}`;
                     innerContainer.innerHTML += uiComp.createStatistikCard(descCardId, `Deskriptive Statistik`, viewLogic.createDeskriptiveStatistikContentHTML(stats, i, kollektivName), false, 'deskriptiveStatistik', [], `table-deskriptiv-demographie-${i}`);
                     innerContainer.innerHTML += uiComp.createStatistikCard(gueteASCardId, `Güte - Avocado Sign (vs. N)`, viewLogic.createGueteContentHTML(stats.gueteAS, 'AS', kollektivName), false, 'diagnostischeGueteAS', [createTableDlBtn(`table-guete-metrics-AS-${kollektivName.replace(/\s+/g, '_')}`, 'Güte_AS'), createTableDlBtn(`table-guete-matrix-AS-${kollektivName.replace(/\s+/g, '_')}`, 'Matrix_AS')], `table-guete-metrics-AS-${kollektivName.replace(/\s+/g, '_')}`);
                     innerContainer.innerHTML += uiComp.createStatistikCard(gueteT2CardId, `Güte - T2 (angewandt vs. N)`, viewLogic.createGueteContentHTML(stats.gueteT2, 'T2', kollektivName), false, 'diagnostischeGueteT2', [createTableDlBtn(`table-guete-metrics-T2-${kollektivName.replace(/\s+/g, '_')}`, 'Güte_T2'), createTableDlBtn(`table-guete-matrix-T2-${kollektivName.replace(/\s+/g, '_')}`, 'Matrix_T2')], `table-guete-metrics-T2-${kollektivName.replace(/\s+/g, '_')}`);
                     innerContainer.innerHTML += uiComp.createStatistikCard(vergleichASvsT2CardId, `Vergleich - AS vs. T2 (angewandt)`, viewLogic.createVergleichContentHTML(stats.vergleichASvsT2, kollektivName), false, 'statistischerVergleichASvsT2', [createTableDlBtn(`table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}`, 'Vergleich_AS_T2')], `table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}`);
                     innerContainer.innerHTML += uiComp.createStatistikCard(assoziationCardId, `Assoziation Merkmale vs. N-Status`, viewLogic.createAssoziationContentHTML(stats.assoziation, kollektivName, appliedCriteria), false, 'assoziationEinzelkriterien', [createTableDlBtn(`table-assoziation-${kollektivName.replace(/\s+/g, '_')}`, 'Assoziation')], `table-assoziation-${kollektivName.replace(/\s+/g, '_')}`);
                     const ageChartId=`chart-stat-age-${i}`; const genderChartId=`chart-stat-gender-${i}`;

                     setTimeout(() => {
                         const descCardCont = document.getElementById(`${descCardId}-card-container`);
                         if (descCardCont) {
                             const hdrBtns = descCardCont.querySelector('.card-header-buttons');
                             if (hdrBtns) {
                                 const ageBtns=createChartDlBtns(ageChartId); const genderBtns=createChartDlBtns(genderChartId);
                                 const t1PNG=createTableDlBtn(`table-deskriptiv-demographie-${i}`, 'Deskriptive_Demographie');
                                 const t2PNG=createTableDlBtn(`table-deskriptiv-lk-${i}`, 'Deskriptive_LK');
                                 hdrBtns.innerHTML = ageBtns.map(b=>`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${b.id}" data-chart-id="${ageChartId}" data-format="${b.format}" data-tippy-content="${b.tooltip} (Alter)"><i class="fas ${b.icon}"></i></button>`).join('')+genderBtns.map(b=>`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${b.id}" data-chart-id="${genderChartId}" data-format="${b.format}" data-tippy-content="${b.tooltip} (Geschlecht)"><i class="fas ${b.icon}"></i></button>`).join('')+`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${t1PNG.id}" data-table-id="${t1PNG.tableId}" data-table-name="${t1PNG.tableName}" data-tippy-content="${t1PNG.tooltip}"><i class="fas ${t1PNG.icon}"></i></button>`+`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${t2PNG.id}" data-table-id="${t2PNG.tableId}" data-table-name="${t2PNG.tableName}" data-tippy-content="${t2PNG.tooltip}"><i class="fas ${t2PNG.icon}"></i></button>`;
                             }
                         }
                        const ageChartDiv = document.getElementById(ageChartId);
                        if (ageChartDiv) {
                           cRenderer.renderAgeDistributionChart(stats.deskriptiv.alterData || [], ageChartId, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 40 } });
                        }
                         const genderChartDiv = document.getElementById(genderChartId);
                         if (genderChartDiv) {
                            const genderData = [{label: UI_TEXTS.legendLabels.male, value: stats.deskriptiv.geschlecht?.m ?? 0}, {label: UI_TEXTS.legendLabels.female, value: stats.deskriptiv.geschlecht?.f ?? 0}]; if(stats.deskriptiv.geschlecht?.unbekannt > 0) genderData.push({label: UI_TEXTS.legendLabels.unknownGender, value: stats.deskriptiv.geschlecht.unbekannt });
                            cRenderer.renderPieChart(genderData, genderChartId, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderData.length });
                        }
                     }, 50);
                 } else { innerContainer.innerHTML = '<div class="col-12"><div class="alert alert-warning small p-2">Keine Daten für dieses Kollektiv.</div></div>'; }
             });

             if (layout === 'vergleich' && datasets.length === 2 && datasets[0].length > 0 && datasets[1].length > 0) {
                 const vergleichKollektiveStats = statsService.compareCohorts(datasets[0], datasets[1], appliedCriteria, appliedLogic);
                 const comparisonCardContainer = document.createElement('div'); comparisonCardContainer.className = 'col-12 mt-4'; const title = `Vergleich ${kollektivDisplayNames[0]} vs. ${kollektivDisplayNames[1]}`;
                 const tableIdComp = `table-vergleich-kollektive-${kollektivNames[0]}-vs-${kollektivNames[1]}`;
                 const downloadBtnComp = createTableDlBtn(tableIdComp, 'Vergleich_Kollektive');
                 comparisonCardContainer.innerHTML = uiComp.createStatistikCard('vergleichKollektive', title, viewLogic.createVergleichKollektiveContentHTML(vergleichKollektiveStats, kollektivNames[0], kollektivNames[1]), false, 'vergleichKollektive', [downloadBtnComp], tableIdComp); outerRow.appendChild(comparisonCardContainer);
             }
             const criteriaComparisonContainer = document.createElement('div'); criteriaComparisonContainer.className = 'col-12 mt-4'; criteriaComparisonContainer.id = 'criteria-comparison-container'; outerRow.appendChild(criteriaComparisonContainer);

             setTimeout(() => {
                  const globalKollektivData = dProcessor.filterDataByKollektiv(baseEvaluatedData, currentGlobalKollektiv);
                 _renderCriteriaComparisonTable(criteriaComparisonContainer.id, globalKollektivData, currentGlobalKollektiv);
                 document.querySelectorAll('#statistik-tab-pane [data-tippy-content]').forEach(el => {
                     let currentContent = el.getAttribute('data-tippy-content') || '';
                     const kollektivToDisplay = layout === 'vergleich' ? `${kollektivDisplayNames[0]} vs. ${kollektivDisplayNames[1]}` : kollektivDisplayNames[0];
                     currentContent = currentContent.replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivToDisplay}</strong>`);
                     currentContent = currentContent.replace(/\[KOLLEKTIV1\]/g, `<strong>${kollektivDisplayNames[0]}</strong>`);
                     currentContent = currentContent.replace(/\[KOLLEKTIV2\]/g, `<strong>${kollektivDisplayNames[1]}</strong>`);
                     el.setAttribute('data-tippy-content', currentContent);
                     if (el._tippy) { el._tippy.setContent(currentContent); }
                 });
                 uiHelpers.initializeTooltips(document.getElementById('statistik-tab-pane'));
             }, 50);
             return outerRow.outerHTML;
        });
    }

    function renderPresentationTab(view, selectedStudyId, currentGlobalKollektiv, processedDataFull, appliedCriteria, appliedLogic) {
        _renderTabContent('praesentation-tab', () => {
            if (!processedDataFull) throw new Error("Präsentations-Daten nicht verfügbar.");

            let presentationData = {}; const filteredData = dProcessor.filterDataByKollektiv(processedDataFull, currentGlobalKollektiv); presentationData.kollektiv = currentGlobalKollektiv; presentationData.patientCount = filteredData?.length ?? 0;

            if (view === 'as-pur') {
                const kollektivesToCalc = ['Gesamt', 'direkt OP', 'nRCT']; let statsCurrent = null;
                kollektivesToCalc.forEach(kollektivId => { const filtered = dProcessor.filterDataByKollektiv(processedDataFull, kollektivId); let stats = null; if (filtered && filtered.length > 0) stats = statsService.calculateDiagnosticPerformance(filtered, 'as', 'n'); let keyName = `stats${kollektivId}`; if (kollektivId === 'direkt OP') keyName = 'statsDirektOP'; else if (kollektivId === 'nRCT') keyName = 'statsNRCT'; presentationData[keyName] = stats; if (kollektivId === currentGlobalKollektiv) statsCurrent = stats; });
                presentationData.statsCurrentKollektiv = statsCurrent;
            } else if (view === 'as-vs-t2') {
                 if (filteredData && filteredData.length > 0) {
                    presentationData.statsAS = statsService.calculateDiagnosticPerformance(filteredData, 'as', 'n'); let studySet = null; let evaluatedDataT2 = null; const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
                    if(isApplied) { studySet = { criteria: appliedCriteria, logic: appliedLogic, id: selectedStudyId, name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME, displayShortName: "Angewandt", studyInfo: { reference: "Benutzerdefiniert", patientCohort: `Aktuell: ${getKollektivDisplayName(currentGlobalKollektiv)} (N=${presentationData.patientCount})`, investigationType: "N/A", focus: "Benutzereinstellung", keyCriteriaSummary: sT2CritManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic) || "Keine" } }; evaluatedDataT2 = t2CritManager.evaluateDataset(cloneDeep(filteredData), studySet.criteria, studySet.logic); }
                    else if (selectedStudyId) { studySet = sT2CritManager.getStudyCriteriaSetById(selectedStudyId); if(studySet) evaluatedDataT2 = sT2CritManager.applyStudyT2CriteriaToDataset(cloneDeep(filteredData), studySet); }
                    if (studySet && evaluatedDataT2) { presentationData.statsT2 = statsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n'); evaluatedDataT2.forEach((p, i) => { if (filteredData[i]) p.as = filteredData[i].as; }); presentationData.vergleich = statsService.compareDiagnosticMethods(evaluatedDataT2, 'as', 't2', 'n'); presentationData.comparisonCriteriaSet = studySet; presentationData.t2CriteriaLabelShort = studySet.displayShortName || 'T2'; presentationData.t2CriteriaLabelFull = `${studySet.name}: ${sT2CritManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic)}`; }
                }
            }

            const tabContentHTML = viewLogic.createPresentationTabContent(view, presentationData, selectedStudyId, currentGlobalKollektiv);

            setTimeout(() => {
                if (view === 'as-pur') {
                     const chartContainer = document.getElementById('praes-as-pur-perf-chart');
                     if (chartContainer && presentationData?.statsCurrentKollektiv && presentationData.patientCount > 0) {
                         const chartData = { overall: { sensVal: presentationData.statsCurrentKollektiv.sens?.value, spezVal: presentationData.statsCurrentKollektiv.spez?.value, ppvVal: presentationData.statsCurrentKollektiv.ppv?.value, npvVal: presentationData.statsCurrentKollektiv.npv?.value, accVal: presentationData.statsCurrentKollektiv.acc?.value, aucVal: presentationData.statsCurrentKollektiv.auc?.value }};
                         cRenderer.renderASPerformanceChart('praes-as-pur-perf-chart', chartData, {}, getKollektivDisplayName(currentGlobalKollektiv));
                     } else if (chartContainer) {
                         uiHelpers.updateElementHTML(chartContainer.id, '<p class="text-muted small text-center p-3">Keine Daten für Performance-Chart.</p>');
                     }
                } else if (view === 'as-vs-t2') {
                     const chartContainer = document.getElementById('praes-comp-chart-container');
                     if (chartContainer && presentationData?.statsAS && presentationData?.statsT2 && presentationData.patientCount > 0) {
                         const chartDataComp = [ { metric: 'Sens', AS: presentationData.statsAS.sens?.value ?? 0, T2: presentationData.statsT2.sens?.value ?? 0 }, { metric: 'Spez', AS: presentationData.statsAS.spez?.value ?? 0, T2: presentationData.statsT2.spez?.value ?? 0 }, { metric: 'PPV', AS: presentationData.statsAS.ppv?.value ?? 0, T2: presentationData.statsT2.ppv?.value ?? 0 }, { metric: 'NPV', AS: presentationData.statsAS.npv?.value ?? 0, T2: presentationData.statsT2.npv?.value ?? 0 }, { metric: 'Acc', AS: presentationData.statsAS.acc?.value ?? 0, T2: presentationData.statsT2.acc?.value ?? 0 }, { metric: 'AUC', AS: presentationData.statsAS.auc?.value ?? 0, T2: presentationData.statsT2.auc?.value ?? 0 } ];
                         cRenderer.renderComparisonBarChart(chartDataComp, 'praes-comp-chart-container', { height: 300, margin: { top: 20, right: 20, bottom: 50, left: 50 } }, presentationData.t2CriteriaLabelShort || 'T2');
                     } else if (chartContainer) {
                         uiHelpers.updateElementHTML(chartContainer.id, '<p class="text-muted small text-center p-3">Keine Daten für Vergleichschart.</p>');
                     }
                }
                uiHelpers.updatePresentationViewSelectorUI(view); const studySelect = document.getElementById('praes-study-select'); if (studySelect) studySelect.value = selectedStudyId || '';
                uiHelpers.initializeTooltips(document.getElementById('praesentation-tab-pane'));
            }, 10);

            return tabContentHTML;
        });
    }

    function renderPublikationTab(processedDataFull, bruteForceResults, currentGlobalKollektiv, appliedCriteria, appliedLogic, publicationLang, activeSectionKey = 'methoden') {
        _renderTabContent('publikation-tab', () => {
            if (!processedDataFull) throw new Error("Daten für Publikation-Tab nicht verfügbar.");
            const initialHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3 p-2 border-bottom sticky-top bg-light-alpha" id="publikation-tab-header-controls">
                    ${uiComp.createPublikationTabNavigation(activeSectionKey)}
                    ${uiComp.createPublikationLanguageSwitcher(publicationLang)}
                </div>
                <div class="tab-content" id="publikationSubNavContent">
                    <div class="tab-pane fade ${activeSectionKey === 'methoden' ? 'show active' : ''}" id="pub-methoden-pane" role="tabpanel">
                        ${uiComp.createPublikationSectionWrapper('methoden', publicationLang)}
                    </div>
                    <div class="tab-pane fade ${activeSectionKey === 'ergebnisse' ? 'show active' : ''}" id="pub-ergebnisse-pane" role="tabpanel">
                        ${uiComp.createPublikationSectionWrapper('ergebnisse', publicationLang)}
                    </div>
                </div>
            `;
            setTimeout(() => {
                 pubTabRenderer.renderPublicationTabContent(processedDataFull, bruteForceResults, currentGlobalKollektiv, appliedCriteria, appliedLogic, publicationLang, activeSectionKey);
                 uiHelpers.updatePublikationLangSwitchUI(publicationLang);
                 uiHelpers.initializeTooltips(document.getElementById('publikation-tab-pane'));
            }, 10);
            return initialHTML;
        });
    }

    function renderExportTab(currentKollektiv) {
        _renderTabContent('export-tab', () => {
             return uiComp.createExportOptions(currentKollektiv);
        });
    }

    return Object.freeze({
        renderDatenTab: renderDatenTab,
        renderAuswertungTab,
        renderStatistikTab,
        renderPresentationTab,
        renderPublikationTab,
        renderExportTab
    });
})(ui_helpers, uiComponents, uiViewLogic, statisticsService, studyT2CriteriaManager, t2CriteriaManager, dataProcessor, chartRenderer, publicationTabRenderer);
