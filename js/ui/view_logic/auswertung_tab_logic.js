const auswertungTabLogic = (() => {
    let _mainAppInterface = null;
    let _currentData = [];
    let _currentKollektiv = '';
    let _appliedT2Criteria = null;
    let _appliedT2Logic = '';
    let _sortState = null;
    let _bruteForceStateGlobal = 'idle';
    let _bruteForceDataGlobal = null;
    let _workerAvailableGlobal = false;
    let _isInitialized = false;
    let _isDataStale = true;

    let _currentASPerformance = null;
    let _currentT2Performance = null;

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
    }

    function setDataStale() {
        _isDataStale = true;
        _currentASPerformance = null;
        _currentT2Performance = null;
    }

    function isInitialized() {
        return _isInitialized;
    }

    function getCurrentASPerformance() {
        if (!_mainAppInterface || typeof dataProcessor === 'undefined' || typeof statisticsService === 'undefined') {
            console.error("auswertungTabLogic.getCurrentASPerformance: Kritische Module nicht verfügbar.");
            return null;
        }
        if (_isDataStale || !_currentASPerformance) {
            if (_currentData && Array.isArray(_currentData) && _currentKollektiv) {
                const filteredData = dataProcessor.filterDataByKollektiv(cloneDeep(_currentData), _currentKollektiv);
                _currentASPerformance = statisticsService.calculateDiagnosticPerformance(filteredData, 'as', 'n_status_patient');
            } else {
                _currentASPerformance = null;
            }
        }
        return cloneDeep(_currentASPerformance);
    }

    function getCurrentT2Performance() {
        if (!_mainAppInterface || typeof dataProcessor === 'undefined' || typeof t2CriteriaManager === 'undefined' || typeof statisticsService === 'undefined') {
            console.error("auswertungTabLogic.getCurrentT2Performance: Kritische Module nicht verfügbar.");
            return null;
        }
        if (_isDataStale || !_currentT2Performance) {
            if (_currentData && Array.isArray(_currentData) && _currentKollektiv && _appliedT2Criteria && _appliedT2Logic) {
                const filteredData = dataProcessor.filterDataByKollektiv(cloneDeep(_currentData), _currentKollektiv);
                const evaluatedData = t2CriteriaManager.evaluateDataset(filteredData, _appliedT2Criteria, _appliedT2Logic);
                _currentT2Performance = statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n_status_patient');
            } else {
                _currentT2Performance = null;
            }
        }
        return cloneDeep(_currentT2Performance);
    }

    function _renderAuswertungDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`AuswertungTabLogic: Dashboard-Container '${containerId}' nicht gefunden.`);
            return;
        }
        container.innerHTML = '';

        const statsAS = getCurrentASPerformance();
        const statsT2 = getCurrentT2Performance();
        const stateSnapshot = _mainAppInterface.getStateSnapshot();
        const appConfig = stateSnapshot.appConfig;
        const uiTexts = stateSnapshot.uiTexts;
        const tooltipContent = stateSnapshot.tooltipContent;

        const currentAppliedCriteriaFromManager = _mainAppInterface.getT2CriteriaManager().getAppliedCriteria();
        const activeCriteriaCount = currentAppliedCriteriaFromManager ? Object.values(currentAppliedCriteriaFromManager).filter(c => c && typeof c === 'object' && c.active).length : 0;

        if (!statsAS && !statsT2 && (!_currentData || _currentData.length === 0)) {
             container.innerHTML = `<div class="col-12"><p class="text-muted text-center p-3">Keine Daten für Kollektiv '${getKollektivDisplayName(_currentKollektiv)}' verfügbar, um Dashboard anzuzeigen.</p></div>`;
             return;
        }
        if (!statsT2 && activeCriteriaCount === 0){
             container.innerHTML = `<div class="col-12"><p class="text-muted text-center p-3">Bitte T2-Kriterien definieren und anwenden, um das Dashboard und die T2-Metriken anzuzeigen.</p></div>`;
             if (!statsAS) return;
        }

        const na = 'N/A';
        const createMetricContent = (metricObj, key, isRate = true, digits = 1) => {
            if (!metricObj || !metricObj[key]) return `<span class="display-6 fw-light" data-tippy-content="Wert nicht verfügbar">${na}</span>`;
            const value = metricObj[key]?.value;
            const ci = metricObj[key]?.ci;
            const formattedValue = formatCI(value, ci?.lower, ci?.upper, (key === 'f1' || key === 'auc') ? 3: digits, isRate, na);
            const interpretation = (typeof ui_helpers !== 'undefined' && typeof ui_helpers.getMetricInterpretationHTML === 'function') ? ui_helpers.getMetricInterpretationHTML(key, metricObj[key], '', _currentKollektiv) : "Keine Interpretation verfügbar";
            return `<span class="display-6 fw-light" data-tippy-content="${interpretation}">${formattedValue}</span>`;
        };

        let t2MetricsOverviewHTML = '';
        if (typeof uiComponents !== 'undefined' && typeof uiComponents.createT2MetricsOverview === 'function') {
            t2MetricsOverviewHTML = uiComponents.createT2MetricsOverview(statsT2, _currentKollektiv);
        } else {
            t2MetricsOverviewHTML = '<p class="text-danger">Fehler: T2 Metrik Übersichtskomponente nicht verfügbar.</p>';
        }

        const dashboardRow = document.createElement('div');
        dashboardRow.className = 'row g-3';

        const sensName = (uiTexts?.statMetrics?.sens?.name) || 'Sensitivität';
        const spezName = (uiTexts?.statMetrics?.spez?.name) || 'Spezifität';
        const aucName = (uiTexts?.statMetrics?.auc?.name) || 'AUC';
        const t2DisplayNameString = (appConfig?.SPECIAL_IDS?.APPLIED_CRITERIA_DISPLAY_NAME) || 'Angew. Kriterien';

        if (typeof uiComponents !== 'undefined' && typeof uiComponents.createDashboardCard === 'function') {
            dashboardRow.innerHTML += uiComponents.createDashboardCard('Avocado Sign (AS)', '', 'chart-dash-as-status', 'bg-light-as', '', '', [{chartId: 'chart-dash-as-status', format:'png'}, {chartId: 'chart-dash-as-status', format:'svg'}]);
            dashboardRow.innerHTML += uiComponents.createDashboardCard(`T2 (${t2DisplayNameString})`, '', 'chart-dash-t2-status', 'bg-light-t2', '', '', [{chartId: 'chart-dash-t2-status', format:'png'}, {chartId: 'chart-dash-t2-status', format:'svg'}]);

            if(statsAS) {
                 dashboardRow.innerHTML += uiComponents.createDashboardCard(
                    sensName + ' (AS)',
                    createMetricContent(statsAS, 'sens'),
                    null, 'metric-card'
                );
                dashboardRow.innerHTML += uiComponents.createDashboardCard(
                    spezName + ' (AS)',
                    createMetricContent(statsAS, 'spez'),
                    null, 'metric-card'
                );
                 dashboardRow.innerHTML += uiComponents.createDashboardCard(
                    aucName + ' (AS)',
                    createMetricContent(statsAS, 'auc', false, 3),
                    null, 'metric-card'
                );
            } else {
                 let asMetricsPlaceholder = `<div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 dashboard-card-col metric-card"><div class="card h-100 dashboard-card"><div class="card-header">${sensName} (AS)</div><div class="card-body"><span class="display-6 fw-light">${na}</span></div></div></div>`;
                 asMetricsPlaceholder += `<div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 dashboard-card-col metric-card"><div class="card h-100 dashboard-card"><div class="card-header">${spezName} (AS)</div><div class="card-body"><span class="display-6 fw-light">${na}</span></div></div></div>`;
                 asMetricsPlaceholder += `<div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 dashboard-card-col metric-card"><div class="card h-100 dashboard-card"><div class="card-header">${aucName} (AS)</div><div class="card-body"><span class="display-6 fw-light">${na}</span></div></div></div>`;
                 dashboardRow.innerHTML += asMetricsPlaceholder;
            }
        } else {
             dashboardRow.innerHTML = '<div class="col-12"><p class="text-danger">Fehler: Dashboard Karten Komponente nicht verfügbar.</p></div>';
        }

        container.innerHTML = `
            <div class="col-12 mb-3">
                ${t2MetricsOverviewHTML}
            </div>
            <div class="col-12">
                <div class="row g-3">
                    ${dashboardRow.innerHTML}
                </div>
            </div>`;

        if (statsAS?.matrix && typeof chart_renderer !== 'undefined' && typeof chart_renderer.renderPieChart === 'function' && uiTexts?.legendLabels && appConfig?.CHART_SETTINGS) {
             const totalAS = statsAS.matrix.tp + statsAS.matrix.fp + statsAS.matrix.fn + statsAS.matrix.tn;
             const asPieData = [
                { label: uiTexts.legendLabels.asPositive || 'AS+', value: statsAS.matrix.tp + statsAS.matrix.fp, color: appConfig.CHART_SETTINGS.AS_COLOR },
                { label: uiTexts.legendLabels.asNegative || 'AS-', value: statsAS.matrix.fn + statsAS.matrix.tn, color: d3.color(appConfig.CHART_SETTINGS.AS_COLOR).brighter(1.5).formatHex() }
             ].filter(d => d.value > 0 && totalAS > 0);
            const asChartEl = document.getElementById('chart-dash-as-status');
            if (asChartEl && asPieData.length > 0) {
                chart_renderer.renderPieChart('chart-dash-as-status', asPieData, { compact: true, donut: true, title: '' });
            } else if (asChartEl) {
                asChartEl.innerHTML = '<p class="text-muted small p-1">Keine AS Daten für Chart.</p>';
                asChartEl.closest('.dashboard-card-col')?.classList.add('d-none'); // Hide card if no chart data
            }
        } else {
            const asChartEl = document.getElementById('chart-dash-as-status');
            if(asChartEl) {
                asChartEl.innerHTML = '<p class="text-muted small p-1">AS Chart nicht renderbar.</p>';
                asChartEl.closest('.dashboard-card-col')?.classList.add('d-none');
            }
        }

        if (statsT2?.matrix && typeof chart_renderer !== 'undefined' && typeof chart_renderer.renderPieChart === 'function' && uiTexts?.legendLabels && appConfig?.CHART_SETTINGS) {
            const totalT2 = statsT2.matrix.tp + statsT2.matrix.fp + statsT2.matrix.fn + statsT2.matrix.tn;
            const t2PieData = [
                { label: uiTexts.legendLabels.t2Positive || 'T2+', value: statsT2.matrix.tp + statsT2.matrix.fp, color: appConfig.CHART_SETTINGS.T2_COLOR },
                { label: uiTexts.legendLabels.t2Negative || 'T2-', value: statsT2.matrix.fn + statsT2.matrix.tn, color: d3.color(appConfig.CHART_SETTINGS.T2_COLOR).brighter(1.5).formatHex() }
            ].filter(d => d.value > 0 && totalT2 > 0);
            const t2ChartEl = document.getElementById('chart-dash-t2-status');
             if (t2ChartEl && t2PieData.length > 0) {
                chart_renderer.renderPieChart('chart-dash-t2-status', t2PieData, { compact: true, donut: true, title: '' });
             } else if (t2ChartEl) {
                t2ChartEl.innerHTML = '<p class="text-muted small p-1">Keine T2 Daten für Chart.</p>';
                t2ChartEl.closest('.dashboard-card-col')?.classList.add('d-none');
             }
        } else {
             const t2ChartEl = document.getElementById('chart-dash-t2-status');
             if(t2ChartEl) {
                t2ChartEl.innerHTML = '<p class="text-muted small p-1">T2 Chart nicht renderbar.</p>';
                t2ChartEl.closest('.dashboard-card-col')?.classList.add('d-none');
             }
        }
        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.initializeTooltips === 'function') {
            ui_helpers.initializeTooltips(container);
        }
    }

    function _createTableHeaderHTML(tableId, currentSortState, columns, tooltipContentSource) {
        let headerHTML = `<thead class="small sticky-top bg-light" id="${tableId}-header"><tr>`;
        columns.forEach(col => {
            let sortIconHTML = '';
            let thClass = col.textAlign ? `text-${col.textAlign}` : '';
            thClass += col.class ? ` ${col.class}` : '';
            let thStyle = col.width ? `style="width: ${col.width};"` : '';
            let isMainKeyActiveSort = false;
            let activeSubKey = null;

            if (currentSortState && currentSortState.key === col.key) {
                if (col.subKeys && col.subKeys.some(sk => sk.key === currentSortState.subKey)) {
                    isMainKeyActiveSort = true;
                    activeSubKey = currentSortState.subKey;
                    sortIconHTML = `<i class="fas ${currentSortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                } else if (!col.subKeys && (currentSortState.subKey === null || currentSortState.subKey === undefined)) {
                    isMainKeyActiveSort = true;
                    sortIconHTML = `<i class="fas ${currentSortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                    let currentStyleValue = thStyle.includes('style="') ? thStyle.substring(thStyle.indexOf('style="') + 7, thStyle.lastIndexOf('"')) : '';
                    if (currentStyleValue && !currentStyleValue.endsWith(';')) currentStyleValue += '; ';
                    currentStyleValue += 'color: var(--primary-color); font-weight: bold;';
                    thStyle = `style="${currentStyleValue}"`;
                }
            }
            if (!isMainKeyActiveSort && col.key !== 'details' && col.sortable !== false) {
                sortIconHTML = '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>';
            }

            const baseTooltip = (tooltipContentSource && tooltipContentSource[col.key]) || col.tooltip || col.label;
            const subHeadersHTML = col.subKeys ? col.subKeys.map(sk => {
                 const isActiveSubSort = activeSubKey === sk.key;
                 const style = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                 const subLabel = sk.label || sk.key.toUpperCase();
                 const subTooltip = `Sortieren nach Status ${subLabel}. ${baseTooltip}`;
                 return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}" data-tippy-content="${subTooltip}">${subLabel}</span>`;
             }).join(' / ') : '';

            const mainTooltip = col.subKeys ? `${baseTooltip}` : (col.key === 'details' ? (tooltipContentSource?.expandRow || 'Details ein-/ausblenden') : `Sortieren nach ${col.label}. ${baseTooltip}`);
            const sortAttributes = col.sortable !== false ? `data-sort-key="${col.key}" ${col.subKeys || col.key === 'details' ? '' : 'style="cursor: pointer;"'}` : '';

            let thContent = col.label;
            if (col.subKeys) {
                thContent = `${col.label} (${subHeadersHTML})`;
                thContent += (isMainKeyActiveSort && activeSubKey) ? sortIconHTML : ' <i class="fas fa-sort text-muted opacity-50 ms-1"></i>';
            } else if (col.key !== 'details' && col.sortable !== false) {
                 thContent += sortIconHTML;
            }

            headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} data-tippy-content="${mainTooltip}" ${thStyle}>${thContent}</th>`;
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }

    function _createAuswertungTableHTML(data, currentSortState, currentAppliedCriteria, currentAppliedLogic) {
        if (!Array.isArray(data)) {
            console.error("AuswertungTabLogic._createAuswertungTableHTML: Ungültige Daten, Array erwartet.");
            return '<p class="text-danger">Fehler: Ungültige Auswertungsdaten für Tabelle.</p>';
        }
        const stateSnapshot = _mainAppInterface.getStateSnapshot();
        const tooltipContentSource = stateSnapshot.tooltipContent?.auswertungTable || {};

        const tableId = 'auswertung-table';
        const columns = [
            { key: 'nr', label: 'Nr', tooltip: tooltipContentSource.nr || 'Lfd. Nr.', class: 'col-nr', sortable: true },
            { key: 'name', label: 'Name', tooltip: tooltipContentSource.name || 'Name (kodiert).', class: 'col-name', sortable: true  },
            { key: 'therapie', label: 'Therapie', tooltip: tooltipContentSource.therapie || 'Therapie.', class: 'col-therapie', sortable: true  },
            { key: 'status', label: 'N/AS/T2', tooltip: tooltipContentSource.n_as_t2 || 'Status: N/AS/T2.', class: 'text-center col-status', subKeys: [{key: 'n_status_patient', label: 'N'}, {key: 'as_status_patient', label: 'AS'}, {key: 't2_status_patient', label: 'T2'}], sortable: true },
            { key: 'anzahl_patho_lk', label: 'N+/N ges.', tooltip: tooltipContentSource.n_counts || 'N+ LKs / N gesamt LKs.', class: 'text-center col-lk-count', sortable: true  },
            { key: 'anzahl_as_lk', label: 'AS+/AS ges.', tooltip: tooltipContentSource.as_counts || 'AS+ LKs / AS gesamt LKs.', class: 'text-center col-lk-count', sortable: true  },
            { key: 'anzahl_t2_lk', label: 'T2+/T2 ges.', tooltip: tooltipContentSource.t2_counts || 'T2+ LKs / T2 gesamt LKs.', class: 'text-center col-lk-count', sortable: true  },
            { key: 'details', label: '', width: '30px', tooltip: tooltipContentSource.expandRow || 'Details.', class: 'col-details', sortable: false }
        ];

        let tableHTML = `<table class="table table-sm table-hover table-striped data-table ${stateSnapshot.appConfig.UI_SETTINGS.STICKY_FIRST_COL_AUSWERTUNG ? 'sticky-first-col' : ''}" id="${tableId}">`;
        tableHTML += `<caption class="small text-muted">Patientenübersicht für Kollektiv: ${getKollektivDisplayName(_currentKollektiv)} (N=${data.length})</caption>`;
        tableHTML += _createTableHeaderHTML(tableId, currentSortState, columns, tooltipContentSource);
        tableHTML += `<tbody id="${tableId}-body">`;

        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">Keine Patienten im ausgewählten Kollektiv gefunden.</td></tr>`;
        } else {
            const sortedData = [...data].sort(getSortFunction(currentSortState.key, currentSortState.direction, currentSortState.subKey));
            sortedData.forEach(patient => {
                if (typeof tableRenderer !== 'undefined' && typeof tableRenderer.createAuswertungTableRow === 'function') {
                    tableHTML += tableRenderer.createAuswertungTableRow(patient, currentAppliedCriteria, currentAppliedLogic);
                } else {
                    tableHTML += `<tr><td colspan="${columns.length}" class="text-danger">Fehler: Tabellenzeilen-Renderer nicht verfügbar.</td></tr>`;
                }
            });
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    function _refreshUIComponents() {
        const dashboardContainer = document.getElementById('auswertung-dashboard-container');
        const tableContainer = document.getElementById('auswertung-table-container');
        const kollektivNameDisplay = document.getElementById('auswertung-tab-kollektiv-name');

        if (dashboardContainer) {
            _renderAuswertungDashboard('auswertung-dashboard-container');
        }
        if (tableContainer) {
            tableContainer.innerHTML = _createAuswertungTableHTML(_currentData, _sortState, _appliedT2Criteria, _appliedT2Logic);
            const tableBodyElement = document.getElementById('auswertung-table-body');
            if (tableBodyElement && typeof ui_helpers !== 'undefined' && typeof ui_helpers.attachRowCollapseListeners === 'function') {
                ui_helpers.attachRowCollapseListeners(tableBodyElement);
            }
        }
        if (kollektivNameDisplay) {
            ui_helpers.updateElementText('auswertung-tab-kollektiv-name', getKollektivDisplayName(_currentKollektiv));
        }

        if (typeof ui_helpers !== 'undefined') {
            const auswertungTableHeader = document.getElementById('auswertung-table-header');
            if (auswertungTableHeader && typeof ui_helpers.updateSortIcons === 'function') {
                ui_helpers.updateSortIcons('auswertung-table-header', _sortState);
            }
            ui_helpers.initializeTooltips(document.getElementById('auswertung-content-area'));
        }
    }

    function updateT2CriteriaUI(criteria, logic) {
        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.updateT2CriteriaControlsUI === 'function') {
            ui_helpers.updateT2CriteriaControlsUI(criteria, logic);
        }
    }
    
    function refreshAuswertungTableAndDashboard() {
        setDataStale(); // Markiert, dass Performance-Metriken neu berechnet werden müssen
        _currentData = _mainAppInterface.getFilteredData(_currentKollektiv); // Hole potenziell neu gefilterte oder prozessierte Daten
        _currentData = t2CriteriaManager.evaluateDataset(cloneDeep(_currentData), _appliedT2Criteria, _appliedT2Logic); // Evaluiere mit aktuellen Kriterien
        _refreshUIComponents(); // Rendere UI neu
    }


    function initializeTab(data, currentKollektiv, appliedT2Criteria, appliedT2Logic, currentSortState, bruteForceState, bruteForceDataForKollektiv, workerAvailable) {
        _currentData = Array.isArray(data) ? data : [];
        _currentKollektiv = currentKollektiv;
        _appliedT2Criteria = cloneDeep(appliedT2Criteria);
        _appliedT2Logic = appliedT2Logic;
        _sortState = currentSortState || (_mainAppInterface.getStateSnapshot().auswertungSortState || { key: 'nr', direction: 'asc', subKey: null });
        _bruteForceStateGlobal = bruteForceState;
        _bruteForceDataGlobal = bruteForceDataForKollektiv;
        _workerAvailableGlobal = workerAvailable;

        setDataStale();

        const contentArea = document.getElementById('auswertung-content-area');
        if (!contentArea) {
            console.error("AuswertungTabLogic: Haupt-Content-Bereich 'auswertung-content-area' nicht gefunden.");
            if (_mainAppInterface.getUiHelpers()) _mainAppInterface.getUiHelpers().showToast("Auswertungs-Tab konnte nicht vollständig initialisiert werden (Container fehlt).", "error");
            return;
        }

        const stateSnapshot = _mainAppInterface.getStateSnapshot();
        const appConfig = stateSnapshot.appConfig;
        const tooltipContent = stateSnapshot.tooltipContent;

        let t2ControlsHTML = '';
        if (typeof uiComponents !== 'undefined' && typeof uiComponents.createT2CriteriaControls === 'function' && _appliedT2Criteria && _appliedT2Logic) {
            t2ControlsHTML = uiComponents.createT2CriteriaControls(_appliedT2Criteria, _appliedT2Logic);
        } else {
            t2ControlsHTML = '<p class="text-danger">Fehler: T2 Kriterien Steuerungskomponente nicht verfügbar.</p>';
        }

        let bruteForceCardHTML = '';
        if (typeof uiComponents !== 'undefined' && typeof uiComponents.createBruteForceCard === 'function') {
            bruteForceCardHTML = uiComponents.createBruteForceCard(_currentKollektiv, _workerAvailableGlobal);
        } else {
            bruteForceCardHTML = '<p class="text-danger">Fehler: Brute-Force Karten Komponente nicht verfügbar.</p>';
        }

        const auswertungTabKollektivName = getKollektivDisplayName(_currentKollektiv);
        const auswertungToggleDetailsTooltip = tooltipContent?.auswertungTable?.expandAll || 'Alle Details ein-/ausblenden';

        contentArea.innerHTML = `
            <div class="row">
                <div class="col-lg-7">
                    <div id="auswertung-dashboard-container" class="mb-3"></div>
                    <div id="t2-criteria-controls-placeholder" class="mb-3">
                        ${t2ControlsHTML}
                    </div>
                </div>
                <div class="col-lg-5">
                    <div id="brute-force-card-placeholder" class="mb-3">
                        ${bruteForceCardHTML}
                    </div>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                         <h5 class="mb-0">Patienten-Auswertungstabelle (<span id="auswertung-tab-kollektiv-name">${auswertungTabKollektivName}</span>)</h5>
                         <button class="btn btn-sm btn-outline-secondary" id="auswertung-toggle-details" data-action="expand" data-tippy-content="${auswertungToggleDetailsTooltip}">
                             Alle Details Einblenden <i class="fas fa-chevron-down ms-1"></i>
                         </button>
                    </div>
                    <div id="auswertung-table-container" class="table-responsive">
                    </div>
                </div>
            </div>
        `;

        _refreshUIComponents();


        if (typeof ui_helpers !== 'undefined') {
            ui_helpers.updateT2CriteriaControlsUI(_appliedT2Criteria, _appliedT2Logic);
            ui_helpers.markCriteriaSavedIndicator(typeof t2CriteriaManager !== 'undefined' ? t2CriteriaManager.isUnsaved() : false);
            ui_helpers.updateBruteForceUI(_bruteForceStateGlobal, _bruteForceDataGlobal || {}, _workerAvailableGlobal, _currentKollektiv);
        }

        const bruteForceMetricSelect = document.getElementById('brute-force-metric');
        if (bruteForceMetricSelect) {
            bruteForceMetricSelect.value = _bruteForceDataGlobal?.metric || (appConfig?.DEFAULT_SETTINGS?.BRUTE_FORCE_METRIC || 'Balanced Accuracy');
        }

        _isInitialized = true;
        _isDataStale = false;
         if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.initializeTooltips === 'function') {
            ui_helpers.initializeTooltips(contentArea);
        }
    }
    
    function getCurrentAuswertungData() {
        return cloneDeep(_currentData);
    }


    return Object.freeze({
        initialize,
        initializeTab,
        isInitialized,
        setDataStale,
        getCurrentASPerformance,
        getCurrentT2Performance,
        updateT2CriteriaUI,
        refreshAuswertungTableAndDashboard,
        getCurrentAuswertungData
    });

})();
