const auswertungTabLogic = (() => {

    function _createDashboardHTML(headerStats) {
        if (!headerStats || typeof headerStats !== 'object') {
            return '<p class="text-danger">Fehler: Dashboard-Daten konnten nicht geladen werden.</p>';
        }

        const dashboardItems = [
            { title: 'Fälle Gesamt', value: headerStats.anzahlPatienten || 0, chartId: null, tooltipKey: 'anzahlPatienten' },
            { title: 'N-Status Positiv', value: `${headerStats.nPos || 0} (${formatPercent((headerStats.nPos || 0) / (headerStats.anzahlPatienten || 1))})`, chartId: 'chart-n-status-pie', data: [{label:'N+', value: headerStats.nPos || 0}, {label:'N-', value: headerStats.nNeg || 0}], tooltipKey: 'statusN' },
            { title: 'AS-Status Positiv', value: `${headerStats.asPos || 0} (${formatPercent((headerStats.asPos || 0) / (headerStats.anzahlPatienten || 1))})`, chartId: 'chart-as-status-pie', data: [{label:'AS+', value: headerStats.asPos || 0}, {label:'AS-', value: headerStats.asNeg || 0}], tooltipKey: 'statusAS' },
            { title: 'T2-Status Positiv', value: `${headerStats.t2Pos || 0} (${formatPercent((headerStats.t2Pos || 0) / (headerStats.anzahlPatienten || 1))})`, chartId: 'chart-t2-status-pie', data: [{label:'T2+', value: headerStats.t2Pos || 0}, {label:'T2-', value: headerStats.t2Neg || 0}], tooltipKey: 'statusT2' },
            { title: 'Therapie: Direkt OP', value: `${headerStats.therapie?.['direkt OP'] || 0} (${formatPercent((headerStats.therapie?.['direkt OP'] || 0) / (headerStats.anzahlPatienten || 1))})`, chartId: 'chart-therapie-pie', data: [{label:'Direkt OP', value: headerStats.therapie?.['direkt OP'] || 0}, {label:'nRCT', value: headerStats.therapie?.nRCT || 0}], tooltipKey: 'therapie' }
        ];
        if(headerStats.alterData && headerStats.alterData.length > 0) {
            dashboardItems.unshift({ title: 'Alter Median (Range)', value: `${formatNumber(headerStats.alter?.median, 1)} (${formatNumber(headerStats.alter?.min,0)}-${formatNumber(headerStats.alter?.max,0)})`, chartId: 'chart-age-distribution', data: headerStats.alterData, tooltipKey: 'alterMedian'});
        }


        let html = '<div class="row g-3 mb-4">';
        dashboardItems.forEach(item => {
            const content = `<p class="fs-5 fw-bold mb-0 text-primary">${item.value}</p>`;
            const downloadButtons = item.chartId ? [
                { id: `dl-${item.chartId}-png`, icon: 'fa-image', tooltip: `Chart '${item.title}' als PNG`, format: 'png'},
                { id: `dl-${item.chartId}-svg`, icon: 'fa-file-code', tooltip: `Chart '${item.title}' als SVG`, format: 'svg'}
            ] : [];
            html += uiComponents.createDashboardCard(item.title, content, item.chartId, '', 'bg-white', 'align-items-center text-center', downloadButtons);
        });
        html += '</div>';
        return html;
    }

    function renderDashboardCharts(headerStats) {
        if (!headerStats || typeof headerStats !== 'object') return;
        if (headerStats.alterData && headerStats.alterData.length > 0 && document.getElementById('chart-age-distribution')) {
            chartRenderer.renderAgeDistributionChart(headerStats.alterData, 'chart-age-distribution', { useCompactMargins: true, outerRadiusFactor: 0.9, labelThreshold: 0.08 });
        }
        const pieChartConfigs = [
            { id: 'chart-n-status-pie', data: [{label:'N+', value: headerStats.nPos || 0}, {label:'N-', value: headerStats.nNeg || 0}], options: { legendBelow: true, useCompactMargins: true, innerRadiusFactor: 0, outerRadiusFactor: 0.8, cornerRadius: 0, labelThreshold: 0.08 } },
            { id: 'chart-as-status-pie', data: [{label:'AS+', value: headerStats.asPos || 0}, {label:'AS-', value: headerStats.asNeg || 0}], options: { legendBelow: true, useCompactMargins: true, innerRadiusFactor: 0, outerRadiusFactor: 0.8, cornerRadius: 0, labelThreshold: 0.08 } },
            { id: 'chart-t2-status-pie', data: [{label:'T2+', value: headerStats.t2Pos || 0}, {label:'T2-', value: headerStats.t2Neg || 0}], options: { legendBelow: true, useCompactMargins: true, innerRadiusFactor: 0, outerRadiusFactor: 0.8, cornerRadius: 0, labelThreshold: 0.08 } },
            { id: 'chart-therapie-pie', data: [{label:'Direkt OP', value: headerStats.therapie?.['direkt OP'] || 0}, {label:'nRCT', value: headerStats.therapie?.nRCT || 0}], options: { legendBelow: true, useCompactMargins: true, innerRadiusFactor: 0, outerRadiusFactor: 0.8, cornerRadius: 0, labelThreshold: 0.08 } }
        ];
        pieChartConfigs.forEach(config => {
            if (document.getElementById(config.id) && config.data.some(d => d.value > 0)) {
                chartRenderer.renderPieChart(config.data, config.id, config.options);
            } else if(document.getElementById(config.id)) {
                 document.getElementById(config.id).innerHTML = '<p class="text-muted small text-center p-2">Keine Daten für Diagramm.</p>';
            }
        });
    }


    function render(data, currentCriteria, currentLogic, sortState, currentKollektiv, workerAvailable, lastBfResults) {
        let html = '<div class="row gy-4">';

        const headerStats = dataProcessor.calculateHeaderStats(data, currentKollektiv);
        html += `<div class="col-12">${_createDashboardHTML(headerStats)}</div>`;

        html += `<div class="col-lg-6">${uiComponents.createT2CriteriaControls(currentCriteria, currentLogic)}</div>`;

        html += `<div class="col-lg-6 d-flex flex-column">
                    <div class="mb-4">${uiComponents.createT2MetricsOverview(statisticsService.calculateDiagnosticPerformance(data, 't2', 'n'), getKollektivDisplayName(currentKollektiv))}</div>
                    <div class="flex-grow-1">${uiComponents.createBruteForceCard(getKollektivDisplayName(currentKollektiv), workerAvailable)}</div>
                 </div>`;

        html += `<div class="col-12">${uiViewLogic.createAuswertungTableCardHTML(data, sortState, currentCriteria, currentLogic)}</div>`;

        html += '</div>';

        setTimeout(() => {
            renderDashboardCharts(headerStats);
            ui_helpers.updateT2CriteriaControlsUI(currentCriteria, currentLogic);
            ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
            const tableBodyAuswertung = document.getElementById('auswertung-table-body');
            if(tableBodyAuswertung) ui_helpers.attachRowCollapseListeners(tableBodyAuswertung);
            ui_helpers.updateSortIcons('auswertung-table-header', sortState);
            if(lastBfResults) {
                ui_helpers.updateBruteForceUI('result', lastBfResults, workerAvailable, currentKollektiv, studyT2CriteriaManager.formatCriteriaForDisplay);
                 const modalBody = document.querySelector('#brute-force-modal .modal-body');
                 if (modalBody && lastBfResults.results && lastBfResults.results.length > 0) {
                     modalBody.innerHTML = uiComponents.createBruteForceModalContent(lastBfResults.results, lastBfResults.metric, lastBfResults.kollektiv, lastBfResults.duration, lastBfResults.totalTested);
                     ui_helpers.initializeTooltips(modalBody);
                 }
            } else {
                ui_helpers.updateBruteForceUI('idle', {}, workerAvailable, currentKollektiv);
            }
        }, 0);

        return html;
    }

    return Object.freeze({
        render
    });

})();