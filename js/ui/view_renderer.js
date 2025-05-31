const viewRenderer = (() => {
    let _currentVisibleTabId = null;
    const _tabRenderFunctions = {};

    function _showLoadingIndicator(tabPaneId) {
        const tabPane = document.getElementById(tabPaneId);
        if (tabPane) {
            tabPane.innerHTML = `
                <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Laden...</span>
                    </div>
                    <p class="ms-3 mb-0">Inhalt wird geladen...</p>
                </div>`;
        }
    }

    function _renderDatenTab(tabPaneId, data, sortState) {
        const tabPane = document.getElementById(tabPaneId);
        if (!tabPane) return;
        tabPane.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <span>Patienten- und Lymphknotendaten (Kollektiv: <strong id="daten-tab-kollektiv-name"></strong>)</span>
                            <button class="btn btn-sm btn-outline-secondary" id="daten-toggle-details" data-action="expand" data-tippy-content="${TOOLTIP_CONTENT.datenTable.expandAll}">
                                Alle Details Einblenden <i class="fas fa-chevron-down ms-1"></i>
                            </button>
                        </div>
                        <div class="card-body p-0">
                            <div id="daten-table-container" class="table-responsive">
                                </div>
                        </div>
                        <div class="card-footer text-muted small">
                            Klicken Sie auf eine Zeile oder den Pfeil-Button, um T2-Lymphknotendetails anzuzeigen/auszublenden.
                        </div>
                    </div>
                </div>
            </div>`;
        dataTabLogic.initializeTab(data, sortState);
    }

    function _renderAuswertungDashboard(containerId, statsAS, statsT2, kollektivName) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = ''; // Clear previous dashboard

        if (!statsAS && !statsT2) {
             container.innerHTML = `<p class="text-muted text-center p-3">Keine Dashboard-Daten für Kollektiv '${getKollektivDisplayName(kollektivName)}' verfügbar. Bitte Kriterien anwenden.</p>`;
             return;
        }

        const na = 'N/A';
        const createMetricContent = (metricObj, key, isRate = true, digits = 1) => {
            const value = metricObj?.[key]?.value;
            const ci = metricObj?.[key]?.ci;
            const formattedValue = formatCI(value, ci?.lower, ci?.upper, (key === 'f1' || key === 'auc') ? 3: digits, isRate, na);
            const interpretation = ui_helpers.getMetricInterpretationHTML(key, metricObj?.[key], '', kollektivName);
            return `<span class="display-6 fw-light" data-tippy-content="${interpretation}">${formattedValue}</span>`;
        };
        
        const t2MetricsOverviewHTML = uiComponents.createT2MetricsOverview(statsT2, kollektivName);
        const dashboardRow = document.createElement('div');
        dashboardRow.className = 'row g-3'; // mb-3 entfernt, da Karten selbst einen haben
        dashboardRow.innerHTML += uiComponents.createDashboardCard('Avocado Sign (AS)', '', 'chart-dash-as-status', 'bg-light-as');
        dashboardRow.innerHTML += uiComponents.createDashboardCard(`T2 (${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME})`, '', 'chart-dash-t2-status', 'bg-light-t2');

        if(statsAS) {
             dashboardRow.innerHTML += uiComponents.createDashboardCard(
                UI_TEXTS.statMetrics.sens.name + ' (AS)',
                createMetricContent(statsAS, 'sens'),
                null, 'metric-card'
            );
            dashboardRow.innerHTML += uiComponents.createDashboardCard(
                UI_TEXTS.statMetrics.spez.name + ' (AS)',
                createMetricContent(statsAS, 'spez'),
                null, 'metric-card'
            );
             dashboardRow.innerHTML += uiComponents.createDashboardCard(
                'AUC (AS)',
                createMetricContent(statsAS, 'auc', false, 3),
                null, 'metric-card'
            );
        } else {
             dashboardRow.innerHTML += `<div class="col-12 text-center text-muted small p-2">AS Metriken nicht verfügbar.</div>`;
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


        // Render pie charts for AS and T2 status
        if (statsAS?.matrix) {
             const totalAS = statsAS.matrix.rp + statsAS.matrix.fp + statsAS.matrix.fn + statsAS.matrix.rn;
             const asPieData = [
                { label: UI_TEXTS.legendLabels.asPositive, value: statsAS.matrix.rp + statsAS.matrix.fp, color: APP_CONFIG.CHART_SETTINGS.AS_COLOR },
                { label: UI_TEXTS.legendLabels.asNegative, value: statsAS.matrix.fn + statsAS.matrix.rn, color: d3.color(APP_CONFIG.CHART_SETTINGS.AS_COLOR).brighter(1.5).formatHex() }
             ].filter(d => d.value > 0 && totalAS > 0);
            if (asPieData.length > 0) chart_renderer.renderPieChart('chart-dash-as-status', asPieData, { compact: true, donut: true, title: '' });
            else document.getElementById('chart-dash-as-status')?.closest('.dashboard-card-col')?.classList.add('d-none');
        } else { document.getElementById('chart-dash-as-status')?.closest('.dashboard-card-col')?.classList.add('d-none'); }

        if (statsT2?.matrix) {
            const totalT2 = statsT2.matrix.rp + statsT2.matrix.fp + statsT2.matrix.fn + statsT2.matrix.rn;
            const t2PieData = [
                { label: UI_TEXTS.legendLabels.t2Positive, value: statsT2.matrix.rp + statsT2.matrix.fp, color: APP_CONFIG.CHART_SETTINGS.T2_COLOR },
                { label: UI_TEXTS.legendLabels.t2Negative, value: statsT2.matrix.fn + statsT2.matrix.rn, color: d3.color(APP_CONFIG.CHART_SETTINGS.T2_COLOR).brighter(1.5).formatHex() }
            ].filter(d => d.value > 0 && totalT2 > 0);
             if (t2PieData.length > 0) chart_renderer.renderPieChart('chart-dash-t2-status', t2PieData, { compact: true, donut: true, title: '' });
             else document.getElementById('chart-dash-t2-status')?.closest('.dashboard-card-col')?.classList.add('d-none');
        } else { document.getElementById('chart-dash-t2-status')?.closest('.dashboard-card-col')?.classList.add('d-none'); }
    }


    function _renderAuswertungTab(tabPaneId, data, currentKollektiv, appliedT2Criteria, appliedT2Logic, sortState, bruteForceState, bruteForceData, workerAvailable) {
        const tabPane = document.getElementById(tabPaneId);
        if (!tabPane) return;

        tabPane.innerHTML = `
            <div class="row">
                <div class="col-lg-5 col-xl-4 mb-3 mb-lg-0">
                    ${uiComponents.createT2CriteriaControls(appliedT2Criteria, appliedT2Logic)}
                    <div class="mt-3">
                         ${uiComponents.createBruteForceCard(currentKollektiv, workerAvailable)}
                    </div>
                </div>
                <div class="col-lg-7 col-xl-8">
                    <div class="row" id="auswertung-dashboard-container">
                         </div>
                    <div class="card mt-3">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <span>Auswertungsergebnisse (Kollektiv: <strong id="auswertung-tab-kollektiv-name"></strong>)</span>
                             <button class="btn btn-sm btn-outline-secondary" id="auswertung-toggle-details" data-action="expand" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.expandAll}">
                                Alle Details Einblenden <i class="fas fa-chevron-down ms-1"></i>
                            </button>
                        </div>
                        <div class="card-body p-0">
                            <div id="auswertung-table-container" class="table-responsive">
                                </div>
                        </div>
                        <div class="card-footer text-muted small">
                             Details zur T2-Bewertung pro Lymphknoten durch Klick auf Zeile oder Pfeil-Button ein-/ausblenden. Erfüllte Positiv-Kriterien sind hervorgehoben.
                        </div>
                    </div>
                </div>
            </div>`;
        auswertungTabLogic.initializeTab(data, currentKollektiv, appliedT2Criteria, appliedT2Logic, sortState, bruteForceState, bruteForceData, workerAvailable);
        _renderAuswertungDashboard('auswertung-dashboard-container', 
            auswertungTabLogic.getCurrentASPerformance(), 
            auswertungTabLogic.getCurrentT2Performance(), 
            currentKollektiv
        );
    }

    function _renderStatistikTab(tabPaneId, data, currentKollektiv, appliedT2Criteria, appliedT2Logic, statsLayout, statsKollektiv1, statsKollektiv2) {
        const tabPane = document.getElementById(tabPaneId);
        if (!tabPane) return;
        const currentKollektivName = getKollektivDisplayName(currentKollektiv);

        tabPane.innerHTML = `
            <div class="row mb-3">
                <div class="col-md-auto mb-2 mb-md-0">
                    <button class="btn btn-sm btn-outline-primary" id="statistik-toggle-vergleich" data-tippy-content="${TOOLTIP_CONTENT.statistikLayout.description}">
                        ${statsLayout === 'vergleich' ? '<i class="fas fa-users-cog me-1"></i> Vergleich Aktiv' : '<i class="fas fa-user-cog me-1"></i> Einzelansicht Aktiv'}
                    </button>
                </div>
                <div class="col-md ms-md-2 ${statsLayout === 'vergleich' ? '' : 'd-none'}" id="statistik-kollektiv-select-1-container">
                    <label for="statistik-kollektiv-select-1" class="form-label form-label-sm">Kollektiv 1:</label>
                    <select class="form-select form-select-sm" id="statistik-kollektiv-select-1" data-tippy-content="${TOOLTIP_CONTENT.statistikKollektiv1.description}">
                        <option value="Gesamt" ${statsKollektiv1 === 'Gesamt' ? 'selected' : ''}>Gesamt</option>
                        <option value="direkt OP" ${statsKollektiv1 === 'direkt OP' ? 'selected' : ''}>Direkt OP</option>
                        <option value="nRCT" ${statsKollektiv1 === 'nRCT' ? 'selected' : ''}>nRCT</option>
                    </select>
                </div>
                <div class="col-md ms-md-2 ${statsLayout === 'vergleich' ? '' : 'd-none'}" id="statistik-kollektiv-select-2-container">
                    <label for="statistik-kollektiv-select-2" class="form-label form-label-sm">Kollektiv 2:</label>
                    <select class="form-select form-select-sm" id="statistik-kollektiv-select-2" data-tippy-content="${TOOLTIP_CONTENT.statistikKollektiv2.description}">
                        <option value="Gesamt" ${statsKollektiv2 === 'Gesamt' ? 'selected' : ''}>Gesamt</option>
                        <option value="direkt OP" ${statsKollektiv2 === 'direkt OP' ? 'selected' : ''}>Direkt OP</option>
                        <option value="nRCT" ${statsKollektiv2 === 'nRCT' ? 'selected' : ''}>nRCT</option>
                    </select>
                </div>
            </div>
            <div id="statistik-content-area" class="row g-3">
                </div>`;
        statistikTabLogic.initializeTab(data, currentKollektiv, appliedT2Criteria, appliedT2Logic, statsLayout, statsKollektiv1, statsKollektiv2);
    }

    function _renderPraesentationTab(tabPaneId, data, currentKollektiv, appliedT2Criteria, appliedT2Logic, currentView, currentStudyId) {
        const tabPane = document.getElementById(tabPaneId);
        if (!tabPane) return;
        const studyOptionsHTML = studyT2CriteriaManager.getAllStudyCriteriaSets(true).map(set => {
            const displayName = set.name || set.id;
            return `<option value="${set.id}" ${currentStudyId === set.id ? 'selected' : ''}>${displayName}</option>`;
        }).join('');

        tabPane.innerHTML = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label form-label-sm">Ansicht wählen:</label>
                    <div class="btn-group w-100" role="group" aria-label="Präsentationsansicht wählen" data-tippy-content="${TOOLTIP_CONTENT.praesentation.viewSelect.description}">
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as-pur" value="as-pur" ${currentView === 'as-pur' ? 'checked' : ''} autocomplete="off">
                        <label class="btn btn-sm btn-outline-primary" for="praes-ansicht-as-pur">Avocado Sign (Performance)</label>
                        
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as-vs-t2" value="as-vs-t2" ${currentView === 'as-vs-t2' ? 'checked' : ''} autocomplete="off">
                        <label class="btn btn-sm btn-outline-primary" for="praes-ansicht-as-vs-t2">AS vs. T2 (Vergleich)</label>
                    </div>
                </div>
                <div class="col-md-6" id="praes-study-select-container" style="display: ${currentView === 'as-vs-t2' ? '' : 'none'};">
                     <label for="praes-study-select" class="form-label form-label-sm">T2-Vergleichsbasis wählen:</label>
                     <select class="form-select form-select-sm" id="praes-study-select" data-tippy-content="${TOOLTIP_CONTENT.praesentation.studySelect.description}">
                         <option value="${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID}" ${currentStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID ? 'selected' : ''}>${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME}</option>
                         ${studyOptionsHTML}
                     </select>
                </div>
            </div>
            <div id="praesentation-content-area" class="row g-3">
                </div>`;
        praesentationTabLogic.initializeTab(data, currentKollektiv, appliedT2Criteria, appliedT2Logic, currentView, currentStudyId);
    }

    function _renderPublikationTab(tabPaneId, rawData, appliedT2Criteria, appliedT2Logic, bruteForceResults) {
        const tabPane = document.getElementById(tabPaneId);
        if (!tabPane) return;
        tabPane.innerHTML = publicationComponents.createPublikationTabHeader();
        publikationTabLogic.initializeTab(rawData, appliedT2Criteria, appliedT2Logic, bruteForceResults);
    }

    function _renderExportTab(tabPaneId, currentKollektiv) {
        const tabPane = document.getElementById(tabPaneId);
        if (!tabPane) return;
        tabPane.innerHTML = uiComponents.createExportOptions(currentKollektiv);
        ui_helpers.updateExportButtonStates(state.getActiveTabId(), bruteForceManager.hasResults(currentKollektiv), true);
    }


    function renderTabContent(tabId, data, stateSnapshot) {
        const tabPaneId = `${tabId}-pane`;
        if (_currentVisibleTabId === tabPaneId && !stateSnapshot.forceTabRefresh) {
            console.log(`Tab ${tabId} ist bereits sichtbar und kein Refresh erzwungen.`);
            if (typeof mainAppInterface !== 'undefined') mainAppInterface.hideLoadingOverlay();
            return;
        }

        _showLoadingIndicator(tabPaneId);
        _currentVisibleTabId = tabPaneId; // Setze den aktuell sichtbaren Tab
        chart_renderer.clearAllCharts(); // Wichtig: Resize Listener von vorherigen Charts entfernen

        const { rawData, currentKollektiv, appliedT2Criteria, appliedT2Logic,
                datenSortState, bruteForceState, bruteForceResults,
                statsLayout, statsKollektiv1, statsKollektiv2,
                praesentationView, praesentationStudyId,
                forceTabRefresh
              } = stateSnapshot;


        setTimeout(() => { // Leichte Verzögerung, um UI-Blockaden zu minimieren
            try {
                switch (tabId) {
                    case 'daten-tab':
                        _renderDatenTab(tabPaneId, rawData, datenSortState);
                        break;
                    case 'auswertung-tab':
                         _renderAuswertungTab(tabPaneId, rawData, currentKollektiv, appliedT2Criteria, appliedT2Logic, datenSortState, bruteForceState, bruteForceResults ? bruteForceResults[currentKollektiv] : null, bruteForceManager.isWorkerAvailable());
                        break;
                    case 'statistik-tab':
                        _renderStatistikTab(tabPaneId, rawData, currentKollektiv, appliedT2Criteria, appliedT2Logic, statsLayout, statsKollektiv1, statsKollektiv2);
                        break;
                    case 'praesentation-tab':
                        _renderPraesentationTab(tabPaneId, rawData, currentKollektiv, appliedT2Criteria, appliedT2Logic, praesentationView, praesentationStudyId);
                        break;
                    case 'publikation-tab':
                        _renderPublikationTab(tabPaneId, rawData, appliedT2Criteria, appliedT2Logic, bruteForceResults);
                        break;
                    case 'export-tab':
                         _renderExportTab(tabPaneId, currentKollektiv);
                        break;
                    default:
                        const tabPane = document.getElementById(tabPaneId);
                        if (tabPane) tabPane.innerHTML = `<p class="p-3">Inhalt für Tab "${tabId}" noch nicht implementiert.</p>`;
                }
                 ui_helpers.initializeTooltips(document.getElementById(tabPaneId));
                 state.clearForceTabRefresh(); // Refresh-Flag zurücksetzen
            } catch (error) {
                console.error(`Fehler beim Rendern von Tab ${tabId}:`, error);
                const tabPane = document.getElementById(tabPaneId);
                if (tabPane) tabPane.innerHTML = `<div class="alert alert-danger m-3" role="alert">Fehler beim Laden des Tabs: ${error.message}. Details siehe Konsole.</div>`;
            } finally {
                 if (typeof mainAppInterface !== 'undefined') mainAppInterface.hideLoadingOverlay();
            }
        }, 50); // Gibt dem Browser Zeit für den Ladeindikator
    }

    return Object.freeze({
        renderTabContent
    });

})();
