const auswertungTabLogic = (() => {
    let _mainAppInterface = null;
    let _currentData = [];
    let _currentKollektiv = '';
    let _appliedT2Criteria = null;
    let _appliedT2Logic = '';
    let _sortState = null;
    let _bruteForceState = 'idle';
    let _bruteForceData = null;
    let _workerAvailable = false;
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
        if (_isDataStale || !_currentASPerformance) {
            if (_currentData && Array.isArray(_currentData) && _currentKollektiv && 
                typeof dataProcessor !== 'undefined' && typeof dataProcessor.filterDataByKollektiv === 'function' &&
                typeof statisticsService !== 'undefined' && typeof statisticsService.calculateDiagnosticPerformance === 'function') {
                const filteredData = dataProcessor.filterDataByKollektiv(cloneDeep(_currentData), _currentKollektiv);
                _currentASPerformance = statisticsService.calculateDiagnosticPerformance(filteredData, 'as', 'n');
            } else {
                _currentASPerformance = null;
            }
        }
        return _currentASPerformance;
    }

    function getCurrentT2Performance() {
        if (_isDataStale || !_currentT2Performance) {
            if (_currentData && Array.isArray(_currentData) && _currentKollektiv && _appliedT2Criteria && _appliedT2Logic && 
                typeof dataProcessor !== 'undefined' && typeof dataProcessor.filterDataByKollektiv === 'function' &&
                typeof t2CriteriaManager !== 'undefined' && typeof t2CriteriaManager.evaluateDataset === 'function' &&
                typeof statisticsService !== 'undefined' && typeof statisticsService.calculateDiagnosticPerformance === 'function') {
                const filteredData = dataProcessor.filterDataByKollektiv(cloneDeep(_currentData), _currentKollektiv);
                const evaluatedData = t2CriteriaManager.evaluateDataset(filteredData, _appliedT2Criteria, _appliedT2Logic);
                _currentT2Performance = statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n');
            } else {
                _currentT2Performance = null;
            }
        }
        return _currentT2Performance;
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
        
        const currentAppliedCriteria = (typeof t2CriteriaManager !== 'undefined' && t2CriteriaManager.getAppliedCriteria) ? t2CriteriaManager.getAppliedCriteria() : null;
        const activeCriteriaCount = currentAppliedCriteria ? Object.values(currentAppliedCriteria).filter(c => c && typeof c === 'object' && c.active).length : 0;


        if (!statsAS && !statsT2 && (!_currentData || _currentData.length === 0)) {
             container.innerHTML = `<div class="col-12"><p class="text-muted text-center p-3">Keine Daten für Kollektiv '${getKollektivDisplayName(_currentKollektiv)}' verfügbar, um Dashboard anzuzeigen.</p></div>`;
             return;
        }
        if (!statsAS && !statsT2 && activeCriteriaCount === 0){ // Zeige Meldung, wenn keine Kriterien aktiv sind, auch wenn Daten da wären
             container.innerHTML = `<div class="col-12"><p class="text-muted text-center p-3">Bitte T2-Kriterien definieren und anwenden, um das Dashboard und die T2-Metriken anzuzeigen.</p></div>`;
             // Wir könnten hier trotzdem die AS-Karten anzeigen, wenn statsAS vorhanden ist.
             // Für Konsistenz wird das Dashboard aber erst komplett gezeigt, wenn T2-Kriterien angewendet sind und statsT2 potenziell berechnet werden kann.
             // Alternative: Nur T2-Teil ausblenden, AS-Teil zeigen.
             // Fürs Erste: Das gesamte Dashboard wird nur angezeigt, wenn T2-Kriterien potenziell Ergebnisse liefern.
             if (!statsAS) return; // Wenn auch AS nicht da, dann komplett raus.
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

        const sensName = (UI_TEXTS?.statMetrics?.sens?.name) || 'Sensitivität';
        const spezName = (UI_TEXTS?.statMetrics?.spez?.name) || 'Spezifität';
        const aucName = (UI_TEXTS?.statMetrics?.auc?.name) || 'AUC';
        const t2DisplayNameString = (APP_CONFIG?.SPECIAL_IDS?.APPLIED_CRITERIA_DISPLAY_NAME) || 'Angew. Kriterien';

        if (typeof uiComponents !== 'undefined' && typeof uiComponents.createDashboardCard === 'function') {
            dashboardRow.innerHTML += uiComponents.createDashboardCard('Avocado Sign (AS)', '', 'chart-dash-as-status', 'bg-light-as');
            dashboardRow.innerHTML += uiComponents.createDashboardCard(`T2 (${t2DisplayNameString})`, '', 'chart-dash-t2-status', 'bg-light-t2');

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
                 dashboardRow.innerHTML += `<div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 dashboard-card-col"><div class="card h-100 dashboard-card"><div class="card-header">AS Metriken</div><div class="card-body"><p class="text-muted small">Nicht verfügbar.</p></div></div></div>`;
            }
        } else {
             dashboardRow.innerHTML = '<p class="text-danger">Fehler: Dashboard Karten Komponente nicht verfügbar.</p>';
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

        if (statsAS?.matrix && typeof chart_renderer !== 'undefined' && typeof chart_renderer.renderPieChart === 'function' && typeof UI_TEXTS?.legendLabels !== 'undefined' && typeof APP_CONFIG?.CHART_SETTINGS !== 'undefined') {
             const totalAS = statsAS.matrix.rp + statsAS.matrix.fp + statsAS.matrix.fn + statsAS.matrix.rn;
             const asPieData = [
                { label: UI_TEXTS.legendLabels.asPositive || 'AS+', value: statsAS.matrix.rp + statsAS.matrix.fp, color: APP_CONFIG.CHART_SETTINGS.AS_COLOR },
                { label: UI_TEXTS.legendLabels.asNegative || 'AS-', value: statsAS.matrix.fn + statsAS.matrix.rn, color: d3.color(APP_CONFIG.CHART_SETTINGS.AS_COLOR).brighter(1.5).formatHex() }
             ].filter(d => d.value > 0 && totalAS > 0);
            const asChartEl = document.getElementById('chart-dash-as-status');
            if (asChartEl && asPieData.length > 0) {
                chart_renderer.renderPieChart('chart-dash-as-status', asPieData, { compact: true, donut: true, title: '' });
            } else if (asChartEl) {
                asChartEl.innerHTML = '<p class="text-muted small p-1">Keine AS Daten für Chart.</p>';
                asChartEl.closest('.dashboard-card-col')?.classList.add('d-none');
            }
        } else {
            const chartEl = document.getElementById('chart-dash-as-status');
            if(chartEl) {
                chartEl.innerHTML = '<p class="text-muted small p-1">AS Chart nicht renderbar.</p>';
                chartEl.closest('.dashboard-card-col')?.classList.add('d-none');
            }
        }

        if (statsT2?.matrix && typeof chart_renderer !== 'undefined' && typeof chart_renderer.renderPieChart === 'function' && typeof UI_TEXTS?.legendLabels !== 'undefined' && typeof APP_CONFIG?.CHART_SETTINGS !== 'undefined') {
            const totalT2 = statsT2.matrix.rp + statsT2.matrix.fp + statsT2.matrix.fn + statsT2.matrix.rn;
            const t2PieData = [
                { label: UI_TEXTS.legendLabels.t2Positive || 'T2+', value: statsT2.matrix.rp + statsT2.matrix.fp, color: APP_CONFIG.CHART_SETTINGS.T2_COLOR },
                { label: UI_TEXTS.legendLabels.t2Negative || 'T2-', value: statsT2.matrix.fn + statsT2.matrix.rn, color: d3.color(APP_CONFIG.CHART_SETTINGS.T2_COLOR).brighter(1.5).formatHex() }
            ].filter(d => d.value > 0 && totalT2 > 0);
            const t2ChartEl = document.getElementById('chart-dash-t2-status');
             if (t2ChartEl && t2PieData.length > 0) {
                chart_renderer.renderPieChart('chart-dash-t2-status', t2PieData, { compact: true, donut: true, title: '' });
             } else if (t2ChartEl) {
                t2ChartEl.innerHTML = '<p class="text-muted small p-1">Keine T2 Daten für Chart.</p>';
                t2ChartEl.closest('.dashboard-card-col')?.classList.add('d-none');
             }
        } else {
             const chartEl = document.getElementById('chart-dash-t2-status');
             if(chartEl) {
                chartEl.innerHTML = '<p class="text-muted small p-1">T2 Chart nicht renderbar.</p>';
                chartEl.closest('.dashboard-card-col')?.classList.add('d-none');
             }
        }
    }

    function _createTableHeaderHTML(tableId, currentSortState, columns) {
        let headerHTML = `<thead class="small sticky-top bg-light" id="${tableId}-header"><tr>`;
        columns.forEach(col => {
            let sortIconHTML = '';
            let thClass = col.textAlign ? `text-${col.textAlign}` : '';
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
                    let currentStyle = thStyle.includes('style="') ? thStyle.substring(thStyle.indexOf('style="') + 7, thStyle.lastIndexOf('"')) : '';
                    if (currentStyle && !currentStyle.endsWith(';')) {
                        currentStyle += '; ';
                    }
                    currentStyle += 'color: var(--primary-color);';
                    if (thStyle.includes('style="')) {
                        thStyle = thStyle.replace(/style=".*?"/, `style="${currentStyle}"`);
                    } else {
                        thStyle += ` style="${currentStyle}"`;
                    }
                }
            }
            if (!isMainKeyActiveSort && col.key !== 'details') {
                sortIconHTML = '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>';
            }

            const baseTooltip = (TOOLTIP_CONTENT?.auswertungTable?.[col.key] || col.tooltip || col.label);
            const subHeadersHTML = col.subKeys ? col.subKeys.map(sk => {
                 const isActiveSubSort = activeSubKey === sk.key;
                 const style = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                 const subLabel = sk.label || sk.key.toUpperCase();
                 const subTooltip = `Sortieren nach Status ${subLabel}. ${baseTooltip}`;
                 return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}" data-tippy-content="${subTooltip}">${subLabel}</span>`;
             }).join(' / ') : '';

            const mainTooltip = col.subKeys ? `${baseTooltip}` : (col.key === 'details' ? (TOOLTIP_CONTENT?.auswertungTable?.expandRow || 'Details ein-/ausblenden') : `Sortieren nach ${col.label}. ${baseTooltip}`);
            const sortAttributes = `data-sort-key="${col.key}" ${col.subKeys || col.key === 'details' ? '' : 'style="cursor: pointer;"'}`;

            let thContent = col.label;
            if (col.subKeys) {
                thContent = `${col.label} (${subHeadersHTML})`;
                thContent += (isMainKeyActiveSort && activeSubKey) ? sortIconHTML : ' <i class="fas fa-sort text-muted opacity-50 ms-1"></i>';
            } else if (col.key !== 'details') {
                 thContent += sortIconHTML;
            }

            headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} data-tippy-content="${mainTooltip}" ${thStyle}>${thContent}</th>`;
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }

    function createAuswertungTableHTML(data, currentSortState, currentAppliedCriteria, currentAppliedLogic) {
        if (!Array.isArray(data)) {
            console.error("createAuswertungTableHTML: Ungültige Daten für Auswertungstabelle, Array erwartet.");
            return '<p class="text-danger">Fehler: Ungültige Auswertungsdaten für Tabelle.</p>';
        }

        const tableId = 'auswertung-table';
        const columns = [
            { key: 'nr', label: 'Nr', tooltip: TOOLTIP_CONTENT?.auswertungTable?.nr || 'Fortlaufende Nummer des Patienten.' },
            { key: 'name', label: 'Name', tooltip: TOOLTIP_CONTENT?.auswertungTable?.name || 'Nachname des Patienten (anonymisiert/kodiert).' },
            { key: 'therapie', label: 'Therapie', tooltip: TOOLTIP_CONTENT?.auswertungTable?.therapie || 'Angewandte Therapie vor der Operation.' },
            { key: 'status', label: 'N/AS/T2', tooltip: TOOLTIP_CONTENT?.auswertungTable?.n_as_t2 || 'Status: Pathologie (N), Avocado Sign (AS), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung.', subKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}]},
            { key: 'anzahl_patho_lk', label: 'N+/N ges.', tooltip: TOOLTIP_CONTENT?.auswertungTable?.n_counts || 'Pathologisch N+ LK / Gesamt N LK.', textAlign: 'center' },
            { key: 'anzahl_as_lk', label: 'AS+/AS ges.', tooltip: TOOLTIP_CONTENT?.auswertungTable?.as_counts || 'Avocado Sign (AS)+ LK / Gesamt AS LK.', textAlign: 'center' },
            { key: 'anzahl_t2_lk', label: 'T2+/T2 ges.', tooltip: TOOLTIP_CONTENT?.auswertungTable?.t2_counts || 'T2+ LK (aktuelle Kriterien) / Gesamt T2 LK.', textAlign: 'center' },
            { key: 'details', label: '', width: '30px', tooltip: TOOLTIP_CONTENT?.auswertungTable?.expandRow || 'Details ein-/ausblenden' }
        ];

        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
        tableHTML += `<caption class="small text-muted">Patientenübersicht für Kollektiv: ${getKollektivDisplayName(_currentKollektiv)} (N=${data.length})</caption>`;
        tableHTML += _createTableHeaderHTML(tableId, currentSortState, columns);
        tableHTML += `<tbody id="${tableId}-body">`;

        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">Keine Patienten im ausgewählten Kollektiv gefunden.</td></tr>`;
        } else {
            const sortedData = [...data].sort(getSortFunction(currentSortState.key, currentSortState.direction, currentSortState.subKey));
            sortedData.forEach(patient => {
                if (typeof tableRenderer !== 'undefined' && typeof tableRenderer.createAuswertungTableRow === 'function') {
                    tableHTML += tableRenderer.createAuswertungTableRow(patient, currentAppliedCriteria, currentAppliedLogic);
                }
            });
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    function initializeTab(data, currentKollektiv, appliedT2Criteria, appliedT2Logic, currentSortState, bruteForceState, bruteForceDataForKollektiv, workerAvailable) {
        _currentData = Array.isArray(data) ? data : [];
        _currentKollektiv = currentKollektiv;
        _appliedT2Criteria = cloneDeep(appliedT2Criteria);
        _appliedT2Logic = appliedT2Logic;
        _sortState = currentSortState || (typeof state !== 'undefined' && state.getCurrentAuswertungSortState ? state.getCurrentAuswertungSortState() : { key: 'nr', direction: 'asc', subKey: null });
        _bruteForceState = bruteForceState;
        _bruteForceData = bruteForceDataForKollektiv;
        _workerAvailable = workerAvailable;

        setDataStale();

        const contentArea = document.getElementById('auswertung-content-area');
        if (!contentArea) {
            console.error("AuswertungTabLogic: Haupt-Content-Bereich 'auswertung-content-area' nicht gefunden.");
            return;
        }
        
        let t2ControlsHTML = '';
        if (typeof uiComponents !== 'undefined' && typeof uiComponents.createT2CriteriaControls === 'function' && _appliedT2Criteria && _appliedT2Logic) {
            t2ControlsHTML = uiComponents.createT2CriteriaControls(_appliedT2Criteria, _appliedT2Logic);
        } else {
            t2ControlsHTML = '<p class="text-danger">Fehler: T2 Kriterien Steuerungskomponente nicht verfügbar.</p>';
        }

        let bruteForceCardHTML = '';
        if (typeof uiComponents !== 'undefined' && typeof uiComponents.createBruteForceCard === 'function') {
            bruteForceCardHTML = uiComponents.createBruteForceCard(_currentKollektiv, _workerAvailable);
        } else {
            bruteForceCardHTML = '<p class="text-danger">Fehler: Brute-Force Karten Komponente nicht verfügbar.</p>';
        }

        const tableHTML = createAuswertungTableHTML(_currentData, _sortState, _appliedT2Criteria, _appliedT2Logic);
        const auswertungTabKollektivName = getKollektivDisplayName(_currentKollektiv);
        const auswertungToggleDetailsTooltip = TOOLTIP_CONTENT?.auswertungTable?.expandAll || 'Alle Details ein-/ausblenden';

        contentArea.innerHTML = `
            <div class="row">
                <div class="col-lg-7">
                    <div id="auswertung-dashboard-container" class="mb-3 row"></div>
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
                        ${tableHTML}
                    </div>
                </div>
            </div>
        `;
        
        _renderAuswertungDashboard('auswertung-dashboard-container');

        const tableBodyElement = document.getElementById('auswertung-table-body');
        if(tableBodyElement && typeof ui_helpers !== 'undefined' && typeof ui_helpers.attachRowCollapseListeners === 'function') {
            ui_helpers.attachRowCollapseListeners(tableBodyElement);
        }

        if (typeof ui_helpers !== 'undefined') {
            if (typeof ui_helpers.updateT2CriteriaControlsUI === 'function') {
                ui_helpers.updateT2CriteriaControlsUI(_appliedT2Criteria, _appliedT2Logic);
            }
            if (typeof ui_helpers.markCriteriaSavedIndicator === 'function') {
                ui_helpers.markCriteriaSavedIndicator(typeof t2CriteriaManager !== 'undefined' ? t2CriteriaManager.isUnsaved() : false);
            }
            if (typeof ui_helpers.updateBruteForceUI === 'function' && typeof bruteForceManager !== 'undefined') {
                 ui_helpers.updateBruteForceUI(_bruteForceState, _bruteForceData || {}, bruteForceManager.isWorkerAvailable(), _currentKollektiv);
            }
            const auswertungTableHeader = document.getElementById('auswertung-table-header');
            if (auswertungTableHeader && typeof ui_helpers.updateSortIcons === 'function') {
                ui_helpers.updateSortIcons('auswertung-table-header', _sortState);
            }
        }
        
        const bruteForceMetricSelect = document.getElementById('brute-force-metric');
        if (bruteForceMetricSelect) {
            bruteForceMetricSelect.value = _bruteForceData?.metric || (APP_CONFIG?.DEFAULT_SETTINGS?.BRUTE_FORCE_METRIC || 'Balanced Accuracy');
        }

        _isInitialized = true;
        _isDataStale = false;
         if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.initializeTooltips === 'function') {
            ui_helpers.initializeTooltips(contentArea);
        }
    }

    return Object.freeze({
        initialize,
        initializeTab,
        isInitialized,
        setDataStale,
        getCurrentASPerformance,
        getCurrentT2Performance
    });

})();
