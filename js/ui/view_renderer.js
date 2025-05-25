const viewRenderer = (() => {

    function _renderTabContent(tabId, renderFunction, ...args) {
        const lang = state.getCurrentPublikationLang() || 'de';
        const localizedTexts = getLocalizedUITexts(lang);
        const generalTexts = localizedTexts.general || {};

        const containerId = `${tabId}-pane`;
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container #${containerId} nicht gefunden für Tab ${tabId}.`);
            return;
        }
        const loadingText = generalTexts.loading || (lang === 'de' ? 'Lade Inhalt...' : 'Loading content...');
        ui_helpers.updateElementHTML(containerId, `<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">${loadingText}</span></div></div>`);
        
        try {
            const contentHTML = renderFunction(...args, lang, localizedTexts); // Pass lang and localizedTexts
            const noContentGeneratedText = generalTexts.noData || (lang === 'de' ? 'Kein Inhalt generiert.' : 'No content generated.');
            ui_helpers.updateElementHTML(containerId, contentHTML || `<p class="text-muted p-3">${noContentGeneratedText}</p>`);
            ui_helpers.initializeTooltips(container);
        } catch (error) {
            console.error(`Fehler beim Rendern von Tab ${tabId}:`, error);
            const errorLoadingTabText = lang === 'de' ? `Fehler beim Laden des Tabs: ${error.message}` : `Error loading tab: ${error.message}`;
            const errorMessage = `<div class="alert alert-danger m-3">${errorLoadingTabText}</div>`;
            ui_helpers.updateElementHTML(containerId, errorMessage);
            const errorToastText = (lang === 'de' ? `Fehler beim Laden des Tabs '${tabId}'.` : `Error loading tab '${tabId}'.`);
            ui_helpers.showToast(errorToastText, 'danger');
        }
    }

    function renderDatenTab(data, sortState, lang, localizedTexts) {
        _renderTabContent('daten-tab', () => {
             if (!data) throw new Error(lang === 'de' ? "Daten für Datentabelle nicht verfügbar." : "Data for data table not available.");
             
             const tooltipExpandAll = (TOOLTIP_CONTENT.datenTable?.expandAll ? (TOOLTIP_CONTENT.datenTable.expandAll[lang] || TOOLTIP_CONTENT.datenTable.expandAll) : null) || (lang === 'de' ? 'Alle Details ein-/ausblenden' : 'Expand/collapse all details');
             const buttonTextExpandAll = lang === 'de' ? 'Alle Details' : 'All Details';

             const toggleButtonHTML = `
                 <div class="d-flex justify-content-end mb-3" id="daten-toggle-button-container">
                     <button id="daten-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${tooltipExpandAll}">
                        ${buttonTextExpandAll} <i class="fas fa-chevron-down ms-1"></i>
                    </button>
                 </div>`;
            const tableHTML = dataTabLogic.createDatenTableHTML(data, sortState, lang, localizedTexts);
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

    function _renderAuswertungDashboardCharts(stats, lang, localizedTexts) {
        const ids = ['chart-dash-age', 'chart-dash-gender', 'chart-dash-therapy', 'chart-dash-status-n', 'chart-dash-status-as', 'chart-dash-status-t2'];
        const generalTexts = localizedTexts.general || {};
        const legendLabels = localizedTexts.legendLabels || {};
        const chartTitles = localizedTexts.chartTitles || {};

        if (!stats || stats.anzahlPatienten === 0) { 
            const noDataText = generalTexts.notApplicable || 'N/A';
            ids.forEach(id => ui_helpers.updateElementHTML(id, `<p class="text-muted small text-center p-2">${noDataText}</p>`)); 
            return; 
        };
        const histOpts = { height: 130, margin: { top: 5, right: 10, bottom: 25, left: 35 }, useCompactMargins: true, lang: lang };
        const pieOpts = { height: 130, margin: { top: 5, right: 5, bottom: 35, left: 5 }, innerRadiusFactor: 0.45, outerRadiusFactor: 0.95, fontSize: '8px', useCompactMargins: true, legendBelow: true, lang: lang };
        
        const genderData = [
            {label: legendLabels.male || 'Männlich', value: stats.geschlecht?.m ?? 0}, 
            {label: legendLabels.female || 'Weiblich', value: stats.geschlecht?.f ?? 0}
        ];
        if(stats.geschlecht?.unbekannt > 0) genderData.push({label: legendLabels.unknownGender || 'Unbekannt', value: stats.geschlecht.unbekannt });
        
        const therapyData = [
            {label: legendLabels.direktOP || 'Direkt OP', value: stats.therapie?.['direkt OP'] ?? 0}, 
            {label: legendLabels.nRCT || 'nRCT', value: stats.therapie?.nRCT ?? 0}
        ];
        try {
            chartRenderer.renderAgeDistributionChart(stats.alterData || [], ids[0], histOpts);
            chartRenderer.renderPieChart(genderData, ids[1], {...pieOpts, legendItemCount: genderData.length});
            chartRenderer.renderPieChart(therapyData, ids[2], {...pieOpts, legendItemCount: therapyData.length});
            chartRenderer.renderPieChart([{label: legendLabels.nPositive || 'N+', value: stats.nStatus?.plus ?? 0}, {label: legendLabels.nNegative || 'N-', value: stats.nStatus?.minus ?? 0}], ids[3], {...pieOpts, legendItemCount: 2});
            chartRenderer.renderPieChart([{label: legendLabels.asPositive || 'AS+', value: stats.asStatus?.plus ?? 0}, {label: legendLabels.asNegative || 'AS-', value: stats.asStatus?.minus ?? 0}], ids[4], {...pieOpts, legendItemCount: 2});
            chartRenderer.renderPieChart([{label: legendLabels.t2Positive || 'T2+', value: stats.t2Status?.plus ?? 0}, {label: legendLabels.t2Negative || 'T2-', value: stats.t2Status?.minus ?? 0}], ids[5], {...pieOpts, legendItemCount: 2});
        }
        catch(error) { 
            console.error("Fehler bei Chart-Rendering im Dashboard:", error); 
            const chartErrorText = lang === 'de' ? 'Chart Fehler' : 'Chart Error';
            ids.forEach(id => ui_helpers.updateElementHTML(id, `<p class="text-danger small text-center p-2">${chartErrorText}</p>`)); 
        }
    }

     function _renderCriteriaComparisonTable(containerId, data, kollektiv, lang, localizedTexts) {
         const container = document.getElementById(containerId); if (!container) return;
         const pubTabTexts = localizedTexts.publikationTab || {}; // Assuming criteria comparison titles might be there
         const criteriaCompTexts = localizedTexts.criteriaComparison || {};
         const generalTexts = localizedTexts.general || {};

         const title = criteriaCompTexts.title || (lang === 'de' ? 'Vergleich diagnostischer Güte verschiedener Methoden' : 'Comparison of Diagnostic Performance of Different Methods');
         const invalidDataText = generalTexts.noData || (lang === 'de' ? 'Ungültige Daten für Vergleich.' : 'Invalid data for comparison.');

         if (!Array.isArray(data)) { 
             container.innerHTML = uiComponents.createStatistikCard('criteriaComparisonTable', title, `<p class="p-3 text-muted small">${invalidDataText}</p>`, false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich', lang); 
             return; 
         }

         const comparisonSetIds = APP_CONFIG.DEFAULT_SETTINGS.CRITERIA_COMPARISON_SETS || [];
         const results = []; const baseDataClone = cloneDeep(data);

         comparisonSetIds.forEach(setId => {
            let perf = null; let setName = generalTexts.unknown || 'Unbekannt'; let setIdUsed = setId;
            try {
                if (setId === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) {
                    perf = statisticsService.calculateDiagnosticPerformance(baseDataClone, 'as', 'n'); 
                    setName = getKollektivDisplayName(APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID, lang, localizedTexts);
                } else if (setId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                    perf = statisticsService.calculateDiagnosticPerformance(baseDataClone, 't2', 'n'); 
                    setName = getKollektivDisplayName(APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, lang, localizedTexts);
                } else {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(setId);
                    if (studySet) { 
                        const evaluatedData = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(baseDataClone), studySet); 
                        perf = statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n'); 
                        setName = studySet.name; 
                    } else { console.warn(`Kriterienset ${setId} für Vergleich nicht gefunden.`); }
                }
            } catch (error) { console.error(`Fehler bei Berechnung für Vergleichsset ${setId}:`, error); }

            if (perf && perf.auc && !isNaN(perf.auc.value)) { results.push({ id: setIdUsed, name: setName, sens: perf.sens?.value, spez: perf.spez?.value, ppv: perf.ppv?.value, npv: perf.npv?.value, acc: perf.acc?.value, auc: perf.auc?.value }); }
            else { results.push({ id: setIdUsed, name: setName, sens: NaN, spez: NaN, ppv: NaN, npv: NaN, acc: NaN, auc: NaN }); }
         });

         results.sort((a, b) => { 
             if (a.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) return -1; 
             if (b.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) return 1; 
             if (a.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) return -1; 
             if (b.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) return 1; 
             return (a.name || '').localeCompare(b.name || '', lang); 
         });
         const tableHTML = statistikTabLogic.createCriteriaComparisonTableHTML(results, getKollektivDisplayName(kollektiv, lang, localizedTexts), lang, localizedTexts);
         container.innerHTML = uiComponents.createStatistikCard('criteriaComparisonTable', title, tableHTML, false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich', lang);
    }


    function renderAuswertungTab(data, currentCriteria, currentLogic, sortState, currentKollektiv, bfWorkerAvailable, lang, localizedTexts) {
         _renderTabContent('auswertung-tab', () => {
             const errorDataNotAvailable = lang === 'de' ? "Daten oder Kriterien für Auswertungstab nicht verfügbar." : "Data or criteria for analysis tab not available.";
             if (!data || !currentCriteria || !currentLogic) throw new Error(errorDataNotAvailable);

             const dashboardContainerId = 'auswertung-dashboard';
             const metricsOverviewContainerId = 't2-metrics-overview';
             const bruteForceCardContainerId = 'brute-force-card-container';
             const tableCardContainerId = 'auswertung-table-card-container';
             const generalTexts = localizedTexts.general || {};

             const criteriaControlsHTML = uiComponents.createT2CriteriaControls(currentCriteria, currentLogic); // Already uses lang from state via its own call
             const bruteForceCardHTML = uiComponents.createBruteForceCard(getKollektivDisplayName(currentKollektiv, lang, localizedTexts), bfWorkerAvailable); // lang passed for getKollektivDisplayName
             const auswertungTableCardHTML = auswertungTabLogic.createAuswertungTableCardHTML(data, sortState, currentCriteria, currentLogic, lang, localizedTexts);


             let finalHTML = `
                 <div class="row g-2 mb-3" id="${dashboardContainerId}">
                     <div class="col-12"><p class="text-muted text-center small p-3">${generalTexts.loading || 'Lade Dashboard...'}</p></div>
                 </div>
                 <div class="row g-4">
                     <div class="col-12">${criteriaControlsHTML}</div>
                     <div class="col-12 mb-3" id="${metricsOverviewContainerId}">
                         <p class="text-muted small p-3">${lang === 'de' ? 'Lade Metrikübersicht...' : 'Loading metrics overview...'}</p>
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
                         const chartTitles = localizedTexts.chartTitles || {};
                         if (!stats || stats.anzahlPatienten === 0) {
                             const noDataText = lang === 'de' ? 'Keine Daten für Dashboard.' : 'No data for dashboard.';
                             ui_helpers.updateElementHTML(dashboardContainerId, `<div class="col-12"><p class="text-muted text-center small p-3">${noDataText}</p></div>`);
                         } else {
                             const downloadIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image' : 'fa-download';
                             const downloadIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code' : 'fa-download';
                             const pngTooltip = (TOOLTIP_CONTENT.exportTab.chartSinglePNG?.description ? (TOOLTIP_CONTENT.exportTab.chartSinglePNG.description[lang] || TOOLTIP_CONTENT.exportTab.chartSinglePNG.description) : null) || (lang === 'de' ? 'Als PNG' : 'As PNG');
                             const svgTooltip = (TOOLTIP_CONTENT.exportTab.chartSingleSVG?.description ? (TOOLTIP_CONTENT.exportTab.chartSingleSVG.description[lang] || TOOLTIP_CONTENT.exportTab.chartSingleSVG.description) : null) || (lang === 'de' ? 'Als SVG' : 'As SVG');
                             const createDlBtns = (baseId) => [{id:`dl-${baseId}-png`, icon: downloadIconPNG, tooltip: pngTooltip, format:'png'}, {id:`dl-${baseId}-svg`, icon: downloadIconSVG, tooltip: svgTooltip, format:'svg'}];

                             dashboardContainer.innerHTML = `
                                ${uiComponents.createDashboardCard(chartTitles.ageDistribution || 'Altersverteilung', `<p class="mb-0 small">Median: ${formatNumber(stats.alter?.median, 1, '--', lang === 'en')} (${formatNumber(stats.alter?.min, 0, '--', lang === 'en')} - ${formatNumber(stats.alter?.max, 0, '--', lang === 'en')})</p>`, 'chart-dash-age', '', '', 'p-1', createDlBtns('chart-dash-age'))}
                                ${uiComponents.createDashboardCard(chartTitles.genderDistribution || 'Geschlecht', `<p class="mb-0 small">M: ${stats.geschlecht?.m ?? 0} W: ${stats.geschlecht?.f ?? 0}</p>`, 'chart-dash-gender', '', '', 'p-1', createDlBtns('chart-dash-gender'))}
                                ${uiComponents.createDashboardCard(chartTitles.therapyDistribution || 'Therapie', `<p class="mb-0 small">OP: ${stats.therapie?.['direkt OP'] ?? 0} nRCT: ${stats.therapie?.nRCT ?? 0}</p>`, 'chart-dash-therapy', '', '', 'p-1', createDlBtns('chart-dash-therapy'))}
                                ${uiComponents.createDashboardCard(chartTitles.statusN || 'N-Status (Patho)', `<p class="mb-0 small">N+: ${stats.nStatus?.plus ?? 0} N-: ${stats.nStatus?.minus ?? 0}</p>`, 'chart-dash-status-n', '', '', 'p-1', createDlBtns('chart-dash-status-n'))}
                                ${uiComponents.createDashboardCard(chartTitles.statusAS || 'AS-Status', `<p class="mb-0 small">AS+: ${stats.asStatus?.plus ?? 0} AS-: ${stats.asStatus?.minus ?? 0}</p>`, 'chart-dash-status-as', '', '', 'p-1', createDlBtns('chart-dash-status-as'))}
                                ${uiComponents.createDashboardCard(chartTitles.statusT2 || 'T2-Status', `<p class="mb-0 small">T2+: ${stats.t2Status?.plus ?? 0} T2-: ${stats.t2Status?.minus ?? 0}</p>`, 'chart-dash-status-t2', '', '', 'p-1', createDlBtns('chart-dash-status-t2'))}
                             `;
                              _renderAuswertungDashboardCharts(stats, lang, localizedTexts);
                         }
                     } catch (error) { console.error("Fehler _renderAuswertungDashboard:", error); ui_helpers.updateElementHTML(dashboardContainerId, `<div class="col-12"><div class="alert alert-danger">${lang === 'de' ? 'Dashboard Fehler.' : 'Dashboard Error.'}</div></div>`); }
                 }

                 if (metricsOverviewContainer) {
                     try {
                        const statsT2 = statisticsService.calculateDiagnosticPerformance(data, 't2', 'n');
                        ui_helpers.updateElementHTML(metricsOverviewContainer.id, uiComponents.createT2MetricsOverview(statsT2, getKollektivDisplayName(currentKollektiv, lang, localizedTexts)));
                     } catch (error) { 
                         console.error("Fehler beim Rendern der T2 Metrikübersicht:", error); 
                         const errorText = lang === 'de' ? 'Fehler T2-Metriken.' : 'Error T2-Metrics.';
                         ui_helpers.updateElementHTML(metricsOverviewContainer.id, `<div class="alert alert-warning p-2 small">${errorText}</div>`); 
                     }
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

             }, 10);

             return finalHTML;
        });
    }

    function renderStatistikTab(processedDataFull, appliedCriteria, appliedLogic, layout, kollektiv1, kollektiv2, currentGlobalKollektiv, lang, localizedTexts) {
        _renderTabContent('statistik-tab', () => {
             if (!processedDataFull) throw new Error(lang === 'de' ? "Statistik-Daten nicht verfügbar." : "Statistics data not available.");

             let datasets = [], kollektivNames = [], kollektivDisplayNames = [];
             let baseEvaluatedData = [];
             try {
                  baseEvaluatedData = t2CriteriaManager.evaluateDataset(cloneDeep(processedDataFull), appliedCriteria, appliedLogic);
             } catch(e) { console.error("Fehler bei der T2 Evaluierung für Statistik:", e); }

             if (layout === 'einzel') { 
                 const singleData = dataProcessor.filterDataByKollektiv(baseEvaluatedData, currentGlobalKollektiv); 
                 datasets.push(singleData); 
                 kollektivNames.push(currentGlobalKollektiv); 
                 kollektivDisplayNames.push(getKollektivDisplayName(currentGlobalKollektiv, lang, localizedTexts)); 
             } else { 
                 const data1 = dataProcessor.filterDataByKollektiv(baseEvaluatedData, kollektiv1); 
                 const data2 = dataProcessor.filterDataByKollektiv(baseEvaluatedData, kollektiv2); 
                 datasets.push(data1); datasets.push(data2); 
                 kollektivNames.push(kollektiv1); kollektivNames.push(kollektiv2); 
                 kollektivDisplayNames.push(getKollektivDisplayName(kollektiv1, lang, localizedTexts)); 
                 kollektivDisplayNames.push(getKollektivDisplayName(kollektiv2, lang, localizedTexts)); 
            }

             const noDataAvailableText = lang === 'de' ? 'Keine Daten für Statistik-Auswahl verfügbar.' : 'No data available for statistics selection.';
             if (datasets.length === 0 || datasets.every(d => !Array.isArray(d) || d.length === 0)) { 
                 return `<div class="col-12"><div class="alert alert-warning">${noDataAvailableText}</div></div>`; 
             }

             const outerRow = document.createElement('div'); outerRow.className = 'row g-4';
             const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image':'fa-download'; 
             const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code':'fa-download'; 
             const pngTTBase = (TOOLTIP_CONTENT.exportTab.chartSinglePNG?.description ? (TOOLTIP_CONTENT.exportTab.chartSinglePNG.description[lang] || TOOLTIP_CONTENT.exportTab.chartSinglePNG.description) : null) || (lang === 'de' ? 'PNG' : 'PNG');
             const svgTTBase = (TOOLTIP_CONTENT.exportTab.chartSingleSVG?.description ? (TOOLTIP_CONTENT.exportTab.chartSingleSVG.description[lang] || TOOLTIP_CONTENT.exportTab.chartSingleSVG.description) : null) || (lang === 'de' ? 'SVG' : 'SVG');
             const createChartDlBtns = (baseId, chartNamePlaceholderDe, chartNamePlaceholderEn) => {
                 const chartName = lang === 'de' ? chartNamePlaceholderDe : chartNamePlaceholderEn;
                 return [
                     {id:`dl-${baseId}-png`,icon:dlIconPNG,tooltip: `${pngTTBase} (${chartName})`,format:'png', chartId: baseId},
                     {id:`dl-${baseId}-svg`,icon:dlIconSVG,tooltip: `${svgTTBase} (${chartName})`,format:'svg', chartId: baseId}
                 ];
             };
             const createTableDlBtn = (tableId, tableNameDe, tableNameEn) => {
                 const tableName = lang === 'de' ? tableNameDe : tableNameEn;
                 const tooltipText = (lang === 'de' ? `Tabelle '${tableName}' PNG` : `Table '${tableName}' PNG`);
                 return {id: `dl-${tableId}-png`, icon: 'fa-image', tooltip: tooltipText, format: 'png', tableId: tableId, tableName: tableName};
             };
            const legendLabels = localizedTexts.legendLabels || {};


             datasets.forEach((data, i) => {
                 const kollektivNameDisplay = kollektivDisplayNames[i]; 
                 const col = document.createElement('div'); 
                 col.className = layout === 'vergleich' ? 'col-xl-6' : 'col-12'; 
                 const cohortLabel = lang === 'de' ? 'Kollektiv' : 'Cohort';
                 const innerRowId = `inner-stat-row-${i}`; 
                 col.innerHTML = `<h4 class="mb-3">${cohortLabel}: ${kollektivNameDisplay} (N=${data.length})</h4><div class="row g-3" id="${innerRowId}"></div>`; 
                 outerRow.appendChild(col); 
                 const innerContainer = col.querySelector(`#${innerRowId}`);
                 
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

                     const errorCalcText = lang === 'de' ? 'Fehler bei Statistikberechnung.' : 'Error in statistics calculation.';
                     if (!stats) { innerContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">${errorCalcText}</div></div>`; return; }
                     
                     const descCardId=`deskriptiveStatistik-${i}`; 
                     const gueteASCardId=`diagnostischeGueteAS-${i}`; 
                     const gueteT2CardId=`diagnostischeGueteT2-${i}`; 
                     const vergleichASvsT2CardId=`statistischerVergleichASvsT2-${i}`; 
                     const assoziationCardId=`assoziationEinzelkriterien-${i}`;
                     
                     const deskStatTitle = lang === 'de' ? `Deskriptive Statistik` : `Descriptive Statistics`;
                     const gueteASTitle = lang === 'de' ? `Güte - Avocado Sign (vs. N)` : `Performance - Avocado Sign (vs. N)`;
                     const gueteT2Title = lang === 'de' ? `Güte - T2 (angewandt vs. N)` : `Performance - T2 (applied vs. N)`;
                     const vergleichTitle = lang === 'de' ? `Vergleich - AS vs. T2 (angewandt)` : `Comparison - AS vs. T2 (applied)`;
                     const assoziationTitle = lang === 'de' ? `Assoziation Merkmale vs. N-Status` : `Association Features vs. N-Status`;


                     innerContainer.innerHTML += uiComponents.createStatistikCard(descCardId, deskStatTitle, statistikTabLogic.createDeskriptiveStatistikContentHTML(stats, i, kollektivNameDisplay, lang, localizedTexts), false, 'deskriptiveStatistik', [], `table-deskriptiv-demographie-${i}`, lang);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(gueteASCardId, gueteASTitle, statistikTabLogic.createGueteContentHTML(stats.gueteAS, 'AS', kollektivNameDisplay, lang, localizedTexts), false, 'diagnostischeGueteAS', [createTableDlBtn(`table-guete-metrics-AS-${kollektivNameDisplay.replace(/\s+/g, '_')}`, 'Güte_AS', 'Performance_AS'), createTableDlBtn(`table-guete-matrix-AS-${kollektivNameDisplay.replace(/\s+/g, '_')}`, 'Matrix_AS', 'Matrix_AS')], `table-guete-metrics-AS-${kollektivNameDisplay.replace(/\s+/g, '_')}`, lang);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(gueteT2CardId, gueteT2Title, statistikTabLogic.createGueteContentHTML(stats.gueteT2, 'T2', kollektivNameDisplay, lang, localizedTexts), false, 'diagnostischeGueteT2', [createTableDlBtn(`table-guete-metrics-T2-${kollektivNameDisplay.replace(/\s+/g, '_')}`, 'Güte_T2', 'Performance_T2'), createTableDlBtn(`table-guete-matrix-T2-${kollektivNameDisplay.replace(/\s+/g, '_')}`, 'Matrix_T2', 'Matrix_T2')], `table-guete-metrics-T2-${kollektivNameDisplay.replace(/\s+/g, '_')}`, lang);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(vergleichASvsT2CardId, vergleichTitle, statistikTabLogic.createVergleichContentHTML(stats.vergleichASvsT2, kollektivNameDisplay, 'T2', lang, localizedTexts), false, 'statistischerVergleichASvsT2', [createTableDlBtn(`table-vergleich-as-vs-t2-${kollektivNameDisplay.replace(/\s+/g, '_')}`, 'Vergleich_AS_T2', 'Comparison_AS_T2')], `table-vergleich-as-vs-t2-${kollektivNameDisplay.replace(/\s+/g, '_')}`, lang);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(assoziationCardId, assoziationTitle, statistikTabLogic.createAssoziationContentHTML(stats.assoziation, kollektivNameDisplay, appliedCriteria, lang, localizedTexts), false, 'assoziationEinzelkriterien', [createTableDlBtn(`table-assoziation-${kollektivNameDisplay.replace(/\s+/g, '_')}`, 'Assoziation', 'Association')], `table-assoziation-${kollektivNameDisplay.replace(/\s+/g, '_')}`, lang);
                     
                     const ageChartId=`chart-stat-age-${i}`; 
                     const genderChartId=`chart-stat-gender-${i}`;

                     setTimeout(() => {
                         const descCardCont = document.getElementById(`${descCardId}-card-container`);
                         if (descCardCont) {
                             const hdrBtns = descCardCont.querySelector('.card-header-buttons');
                             if (hdrBtns) {
                                 const ageChartNameDe = 'Alter'; const ageChartNameEn = 'Age';
                                 const genderChartNameDe = 'Geschlecht'; const genderChartNameEn = 'Gender';
                                 const ageBtns=createChartDlBtns(ageChartId, ageChartNameDe, ageChartNameEn); 
                                 const genderBtns=createChartDlBtns(genderChartId, genderChartNameDe, genderChartNameEn);
                                 const t1PNG=createTableDlBtn(`table-deskriptiv-demographie-${i}`, 'Deskriptive_Demographie', 'Descriptive_Demographics');
                                 const t2PNG=createTableDlBtn(`table-deskriptiv-lk-${i}`, 'Deskriptive_LK', 'Descriptive_LN');
                                 hdrBtns.innerHTML = ageBtns.map(b=>`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${b.id}" data-chart-id="${b.chartId}" data-format="${b.format}" data-tippy-content="${b.tooltip}"><i class="fas ${b.icon}"></i></button>`).join('')+genderBtns.map(b=>`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${b.id}" data-chart-id="${b.chartId}" data-format="${b.format}" data-tippy-content="${b.tooltip}"><i class="fas ${b.icon}"></i></button>`).join('')+`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${t1PNG.id}" data-table-id="${t1PNG.tableId}" data-table-name="${t1PNG.tableName}" data-tippy-content="${t1PNG.tooltip}"><i class="fas ${t1PNG.icon}"></i></button>`+`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${t2PNG.id}" data-table-id="${t2PNG.tableId}" data-table-name="${t2PNG.tableName}" data-tippy-content="${t2PNG.tooltip}"><i class="fas ${t2PNG.icon}"></i></button>`;
                             }
                         }
                        const ageChartDiv = document.getElementById(ageChartId);
                        if (ageChartDiv) {
                           chartRenderer.renderAgeDistributionChart(stats.deskriptiv.alterData || [], ageChartId, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 40 }, lang: lang });
                        }
                         const genderChartDiv = document.getElementById(genderChartId);
                         if (genderChartDiv) {
                            const genderData = [
                                {label: legendLabels.male || 'Männlich', value: stats.deskriptiv.geschlecht?.m ?? 0}, 
                                {label: legendLabels.female || 'Weiblich', value: stats.deskriptiv.geschlecht?.f ?? 0}
                            ]; 
                            if(stats.deskriptiv.geschlecht?.unbekannt > 0) genderData.push({label: legendLabels.unknownGender || 'Unbekannt', value: stats.deskriptiv.geschlecht.unbekannt });
                            chartRenderer.renderPieChart(genderData, genderChartId, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderData.length, lang: lang });
                        }
                     }, 50);
                 } else { 
                     const noDataForCohortText = lang === 'de' ? 'Keine Daten für dieses Kollektiv.' : 'No data for this cohort.';
                     innerContainer.innerHTML = `<div class="col-12"><div class="alert alert-warning small p-2">${noDataForCohortText}</div></div>`; 
                 }
             });

             if (layout === 'vergleich' && datasets.length === 2 && datasets[0].length > 0 && datasets[1].length > 0) {
                 const vergleichKollektiveStats = statisticsService.compareCohorts(datasets[0], datasets[1], appliedCriteria, appliedLogic);
                 const comparisonCardContainer = document.createElement('div'); 
                 comparisonCardContainer.className = 'col-12 mt-4'; 
                 const titleDe = `Vergleich ${kollektivDisplayNames[0]} vs. ${kollektivDisplayNames[1]}`;
                 const titleEn = `Comparison ${kollektivDisplayNames[0]} vs. ${kollektivDisplayNames[1]}`;
                 const title = lang === 'de' ? titleDe : titleEn;
                 const tableIdComp = `table-vergleich-kollektive-${kollektivNames[0]}-vs-${kollektivNames[1]}`;
                 const downloadBtnComp = createTableDlBtn(tableIdComp, 'Vergleich_Kollektive', 'Comparison_Cohorts');
                 comparisonCardContainer.innerHTML = uiComponents.createStatistikCard('vergleichKollektive', title, statistikTabLogic.createVergleichKollektiveContentHTML(vergleichKollektiveStats, kollektivNames[0], kollektivNames[1], lang, localizedTexts), false, 'vergleichKollektive', [downloadBtnComp], tableIdComp, lang); 
                 outerRow.appendChild(comparisonCardContainer);
             }
             const criteriaComparisonContainer = document.createElement('div'); 
             criteriaComparisonContainer.className = 'col-12 mt-4'; 
             criteriaComparisonContainer.id = 'criteria-comparison-container'; 
             outerRow.appendChild(criteriaComparisonContainer);

             setTimeout(() => {
                  const globalKollektivData = dataProcessor.filterDataByKollektiv(baseEvaluatedData, currentGlobalKollektiv);
                 _renderCriteriaComparisonTable(criteriaComparisonContainer.id, globalKollektivData, currentGlobalKollektiv, lang, localizedTexts);
                 document.querySelectorAll('#statistik-tab-pane [data-tippy-content]').forEach(el => {
                     let currentContent = el.getAttribute('data-tippy-content') || '';
                     const kollektivToDisplay = layout === 'vergleich' ? `${kollektivDisplayNames[0]} vs. ${kollektivDisplayNames[1]}` : kollektivDisplayNames[0];
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

    function renderPresentationTab(view, selectedStudyId, currentGlobalKollektiv, processedDataFull, appliedCriteria, appliedLogic, lang, localizedTexts) {
        _renderTabContent('praesentation-tab', () => {
            if (!processedDataFull) throw new Error(lang === 'de' ? "Präsentations-Daten nicht verfügbar." : "Presentation data not available.");
            
            const generalTexts = localizedTexts.general || {};
            const legendLabels = localizedTexts.legendLabels || {};
            const chartTitles = localizedTexts.chartTitles || {};


            let presentationData = {}; 
            const filteredData = dataProcessor.filterDataByKollektiv(processedDataFull, currentGlobalKollektiv); 
            presentationData.kollektiv = currentGlobalKollektiv; 
            presentationData.patientCount = filteredData?.length ?? 0;

            if (view === 'as-pur') {
                const kollektivesToCalc = ['Gesamt', 'direkt OP', 'nRCT']; 
                let statsCurrent = null;
                kollektivesToCalc.forEach(kollektivId => { 
                    const filtered = dataProcessor.filterDataByKollektiv(processedDataFull, kollektivId); 
                    let stats = null; 
                    if (filtered && filtered.length > 0) stats = statisticsService.calculateDiagnosticPerformance(filtered, 'as', 'n'); 
                    let keyName = `stats${kollektivId}`; 
                    if (kollektivId === 'direkt OP') keyName = 'statsDirektOP'; 
                    else if (kollektivId === 'nRCT') keyName = 'statsNRCT'; 
                    presentationData[keyName] = stats; 
                    if (kollektivId === currentGlobalKollektiv) statsCurrent = stats; 
                });
                presentationData.statsCurrentKollektiv = statsCurrent;
            } else if (view === 'as-vs-t2') {
                 if (filteredData && filteredData.length > 0) {
                    presentationData.statsAS = statisticsService.calculateDiagnosticPerformance(filteredData, 'as', 'n'); 
                    let studySet = null; 
                    let evaluatedDataT2 = null; 
                    const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
                    if(isApplied) { 
                        const appliedName = getKollektivDisplayName(APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, lang, localizedTexts);
                        studySet = { 
                            criteria: appliedCriteria, 
                            logic: appliedLogic, 
                            id: selectedStudyId, 
                            name: appliedName, 
                            displayShortName: lang === 'de' ? "Angewandt" : "Applied", 
                            studyInfo: { 
                                reference: lang === 'de' ? "Benutzerdefiniert" : "User-defined", 
                                patientCohort: `${lang === 'de' ? 'Aktuell' : 'Current'}: ${getKollektivDisplayName(currentGlobalKollektiv, lang, localizedTexts)} (N=${presentationData.patientCount})`, 
                                investigationType: generalTexts.notApplicable || "N/A", 
                                focus: lang === 'de' ? "Benutzereinstellung" : "User Setting", 
                                keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic) || (lang === 'de' ? "Keine" : "None") 
                            } 
                        }; 
                        evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), studySet.criteria, studySet.logic); 
                    } else if (selectedStudyId) { 
                        studySet = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId); 
                        if(studySet) evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(filteredData), studySet); 
                    }
                    if (studySet && evaluatedDataT2) { 
                        presentationData.statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n'); 
                        evaluatedDataT2.forEach((p, i) => { if (filteredData[i]) p.as = filteredData[i].as; }); 
                        presentationData.vergleich = statisticsService.compareDiagnosticMethods(evaluatedDataT2, 'as', 't2', 'n'); 
                        presentationData.comparisonCriteriaSet = studySet; 
                        presentationData.t2CriteriaLabelShort = studySet.displayShortName || 'T2'; 
                        presentationData.t2CriteriaLabelFull = `${isApplied ? getKollektivDisplayName(APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, lang, localizedTexts) : (studySet.name || 'Studie')}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic)}`;
                    }
                }
            }
            const tabContentHTML = praesentationTabLogic.createPresentationTabContent(view, presentationData, selectedStudyId, currentGlobalKollektiv, lang, localizedTexts);

            setTimeout(() => {
                if (view === 'as-pur') {
                     const chartContainer = document.getElementById('praes-as-pur-perf-chart');
                     if (chartContainer && presentationData?.statsCurrentKollektiv && presentationData.patientCount > 0) {
                         const chartData = { overall: { sensVal: presentationData.statsCurrentKollektiv.sens?.value, spezVal: presentationData.statsCurrentKollektiv.spez?.value, ppvVal: presentationData.statsCurrentKollektiv.ppv?.value, npvVal: presentationData.statsCurrentKollektiv.npv?.value, accVal: presentationData.statsCurrentKollektiv.acc?.value, aucVal: presentationData.statsCurrentKollektiv.auc?.value }};
                         chartRenderer.renderASPerformanceChart('praes-as-pur-perf-chart', chartData, {lang: lang}, getKollektivDisplayName(currentGlobalKollektiv, lang, localizedTexts));
                     } else if (chartContainer) {
                         const noDataText = lang === 'de' ? 'Keine Daten für Performance-Chart.' : 'No data for performance chart.';
                         ui_helpers.updateElementHTML(chartContainer.id, `<p class="text-muted small text-center p-3">${noDataText}</p>`);
                     }
                } else if (view === 'as-vs-t2') {
                     const chartContainer = document.getElementById('praes-comp-chart-container');
                     if (chartContainer && presentationData?.statsAS && presentationData?.statsT2 && presentationData.patientCount > 0) {
                         const chartDataComp = [ 
                             { metric: legendLabels.sens || 'Sens', AS: presentationData.statsAS.sens?.value ?? 0, T2: presentationData.statsT2.sens?.value ?? 0 }, 
                             { metric: legendLabels.spez || 'Spez', AS: presentationData.statsAS.spez?.value ?? 0, T2: presentationData.statsT2.spez?.value ?? 0 }, 
                             { metric: legendLabels.ppv || 'PPV', AS: presentationData.statsAS.ppv?.value ?? 0, T2: presentationData.statsT2.ppv?.value ?? 0 }, 
                             { metric: legendLabels.npv || 'NPV', AS: presentationData.statsAS.npv?.value ?? 0, T2: presentationData.statsT2.npv?.value ?? 0 }, 
                             { metric: legendLabels.acc || 'Acc', AS: presentationData.statsAS.acc?.value ?? 0, T2: presentationData.statsT2.acc?.value ?? 0 }, 
                             { metric: legendLabels.auc || 'AUC', AS: presentationData.statsAS.auc?.value ?? 0, T2: presentationData.statsT2.auc?.value ?? 0 } 
                            ];
                         chartRenderer.renderComparisonBarChart(chartDataComp, 'praes-comp-chart-container', { height: 300, margin: { top: 20, right: 20, bottom: 50, left: 50 }, lang: lang }, presentationData.t2CriteriaLabelShort || 'T2', legendLabels.avocadoSign || 'Avocado Sign (AS)');
                     } else if (chartContainer) {
                         const noDataText = lang === 'de' ? 'Keine Daten für Vergleichschart.' : 'No data for comparison chart.';
                         ui_helpers.updateElementHTML(chartContainer.id, `<p class="text-muted small text-center p-3">${noDataText}</p>`);
                     }
                }
                ui_helpers.updatePresentationViewSelectorUI(view); 
                const studySelect = document.getElementById('praes-study-select'); 
                if (studySelect) studySelect.value = selectedStudyId || '';
                ui_helpers.initializeTooltips(document.getElementById('praesentation-tab-pane'));
            }, 10);

            return tabContentHTML;
        });
    }

    function renderExportTab(currentKollektiv, lang, localizedTexts) {
        _renderTabContent('export-tab', () => {
             return uiComponents.createExportOptions(currentKollektiv); // createExportOptions already fetches lang from state
        });
    }

    function renderPublikationTab(currentLang, currentSection, currentKollektiv, globalProcessedData, bruteForceResults) {
        _renderTabContent('publikation-tab', () => { // lang and localizedTexts passed by _renderTabContent
            publikationTabLogic.initializeData(
                globalProcessedData,
                t2CriteriaManager.getAppliedCriteria(),
                t2CriteriaManager.getAppliedLogic(),
                bruteForceResults
            );

            const headerHTML = uiComponents.createPublikationTabHeader(); // Already uses lang from state
            const initialContentHTML = publikationTabLogic.getRenderedSectionContent(currentSection, currentLang, currentKollektiv);

            setTimeout(() => {
                const contentArea = document.getElementById('publikation-content-area');
                if (contentArea) {
                    ui_helpers.updateElementHTML(contentArea.id, initialContentHTML);
                    publikationTabLogic.updateDynamicChartsForPublicationTab(currentSection, currentLang, currentKollektiv);
                    ui_helpers.initializeTooltips(document.getElementById('publikation-tab-pane'));
                }
                 ui_helpers.updatePublikationUI(currentLang, currentSection, state.getCurrentPublikationBruteForceMetric());
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
