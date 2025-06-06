const auswertungTabRenderer = (() => {

    function _createDashboardHTML(currentKollektiv) {
        const kollektivName = window.getKollektivDisplayName(currentKollektiv);
        const chartHeight = "150px";
        const cardPadding = "p-2";
        const headerPadding = "p-1";

        const chartPlaceholders = [
            { id: 'dashboard-chart-age', title: window.UI_TEXTS.chartTitles.ageDistribution, tooltipKey: 'chartAge' },
            { id: 'dashboard-chart-gender', title: window.UI_TEXTS.chartTitles.genderDistribution, tooltipKey: 'chartGender' },
            { id: 'dashboard-chart-therapy', title: window.UI_TEXTS.chartTitles.therapyDistribution, tooltipKey: 'chartTherapy' },
            { id: 'dashboard-chart-status-n', title: window.UI_TEXTS.chartTitles.statusN, tooltipKey: 'chartNStatus' },
            { id: 'dashboard-chart-status-as', title: window.UI_TEXTS.chartTitles.statusAS, tooltipKey: 'chartASStatus' },
            { id: 'dashboard-chart-status-t2', title: window.UI_TEXTS.chartTitles.statusT2, tooltipKey: 'chartT2Status' }
        ];

        let dashboardHtml = `<h3 class="mb-3">Dashboard: Kollektiv ${kollektivName}</h3><div class="row g-3">`;

        chartPlaceholders.forEach(chart => {
            const tooltipText = window.TOOLTIP_CONTENT.deskriptiveStatistik[chart.tooltipKey]?.description.replace('[KOLLEKTIV]', kollektivName) || chart.title;
            dashboardHtml += `
                <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 dashboard-card-col">
                    <div class="card dashboard-card h-100" data-tippy-content="${tooltipText}">
                        <div class="card-header card-header-sm ${headerPadding}">${chart.title}</div>
                        <div class="card-body ${cardPadding}">
                            <div id="${chart.id}" class="dashboard-chart-container" style="min-height: ${chartHeight};">
                                <p class="text-center text-muted small pt-4">Lade Diagramm...</p>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
        dashboardHtml += `</div><hr class="my-4">`;
        return dashboardHtml;
    }

    function _createT2KriterienDefinitionHTML(currentCriteria, currentLogic) {
        if (typeof window.uiComponents === 'undefined' || typeof window.t2CriteriaManager === 'undefined' || typeof window.TOOLTIP_CONTENT === 'undefined') {
            return '<p class="text-danger">Fehler: UI Komponenten oder Kriterien-Manager nicht geladen.</p>';
        }
        const criteriaDisplay = window.t2CriteriaManager.getCriteriaDisplayValues(currentCriteria);

        let html = `<div class="row">
                        <div class="col-lg-8">
                            <h3 class="mb-3">T2-Kriterien Definition</h3>
                        </div>
                        <div class="col-lg-4 text-lg-end">
                             <span id="t2-criteria-unsaved-indicator" class="badge bg-warning text-dark p-2 d-none" data-tippy-content="${window.TOOLTIP_CONTENT.t2CriteriaCard.unsavedIndicator}">Ungespeicherte Änderungen!</span>
                        </div>
                    </div>
                    <div class="card t2-criteria-card mb-4" id="t2-criteria-definition-card">
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-md-6 col-lg-3 criteria-group">
                                    ${window.uiComponents.createCriteriaToggle('size', currentCriteria.size.active, window.TOOLTIP_CONTENT.t2Size.description)}
                                    ${window.uiComponents.createRangeSlider('size', criteriaDisplay.size.threshold, APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE, currentCriteria.size.active, window.TOOLTIP_CONTENT.t2Size.description)}
                                </div>
                                <div class="col-md-6 col-lg-2 criteria-group">
                                    ${window.uiComponents.createCriteriaToggle('form', currentCriteria.form.active, window.TOOLTIP_CONTENT.t2Form.description)}
                                    ${window.uiComponents.createRadioOptions('form', APP_CONFIG.T2_CRITERIA_SETTINGS.FORM_VALUES, criteriaDisplay.form.value, currentCriteria.form.active, window.TOOLTIP_CONTENT.t2Form.description)}
                                </div>
                                <div class="col-md-6 col-lg-2 criteria-group">
                                    ${window.uiComponents.createCriteriaToggle('kontur', currentCriteria.kontur.active, window.TOOLTIP_CONTENT.t2Kontur.description)}
                                    ${window.uiComponents.createRadioOptions('kontur', APP_CONFIG.T2_CRITERIA_SETTINGS.KONTUR_VALUES, criteriaDisplay.kontur.value, currentCriteria.kontur.active, window.TOOLTIP_CONTENT.t2Kontur.description)}
                                </div>
                                <div class="col-md-6 col-lg-2 criteria-group">
                                    ${window.uiComponents.createCriteriaToggle('homogenitaet', currentCriteria.homogenitaet.active, window.TOOLTIP_CONTENT.t2Homogenitaet.description)}
                                    ${window.uiComponents.createRadioOptions('homogenitaet', APP_CONFIG.T2_CRITERIA_SETTINGS.HOMOGENITAET_VALUES, criteriaDisplay.homogenitaet.value, currentCriteria.homogenitaet.active, window.TOOLTIP_CONTENT.t2Homogenitaet.description)}
                                </div>
                                <div class="col-md-6 col-lg-3 criteria-group">
                                    ${window.uiComponents.createCriteriaToggle('signal', currentCriteria.signal.active, window.TOOLTIP_CONTENT.t2Signal.description)}
                                    ${window.uiComponents.createRadioOptions('signal', APP_CONFIG.T2_CRITERIA_SETTINGS.SIGNAL_VALUES, criteriaDisplay.signal.value, currentCriteria.signal.active, window.TOOLTIP_CONTENT.t2Signal.description)}
                                </div>
                            </div>
                            <hr class="my-3">
                            <div class="d-flex flex-wrap justify-content-between align-items-center">
                                <div class="me-3 mb-2 mb-md-0">
                                    ${window.uiComponents.createLogicSwitch(currentLogic, window.TOOLTIP_CONTENT.t2Logic.description)}
                                </div>
                                <div class="btn-toolbar" role="toolbar">
                                    <button class="btn btn-sm btn-outline-secondary me-2" id="btn-reset-criteria" data-tippy-content="${window.TOOLTIP_CONTENT.t2Actions.reset}"><i class="fas fa-undo fa-fw me-1"></i>Zurücksetzen</button>
                                    <button class="btn btn-sm btn-primary" id="btn-apply-criteria" data-tippy-content="${window.TOOLTIP_CONTENT.t2Actions.apply}"><i class="fas fa-check-circle fa-fw me-1"></i>Anwenden & Speichern</button>
                                </div>
                            </div>
                        </div>
                    </div>`;
        return html;
    }

    function _createT2MetricsOverviewHTML(currentKollektiv) {
        const kollektivName = window.getKollektivDisplayName(currentKollektiv);
        const cardTitle = window.TOOLTIP_CONTENT.t2MetricsOverview.cardTitle.replace('[KOLLEKTIV]', kollektivName);
        let html = `<h3 class="mb-3">T2 Metrik-Übersicht (Angewandte Kriterien)</h3>
                    <div class="card mb-4" data-tippy-content="${cardTitle}">
                        <div class="card-body">
                            <div id="t2-metrics-overview-content" class="row g-2">
                                <p class="text-muted text-center p-3">Statistiken werden nach Anwendung der Kriterien geladen...</p>
                            </div>
                        </div>
                    </div><hr class="my-4">`;
        return html;
    }

    function _createBruteForcePanelHTML(isWorkerAvailable, currentKollektiv) {
        const kollektivName = window.getKollektivDisplayName(currentKollektiv);
        const defaultMetric = window.stateManager.getBruteForceMetric() || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
        const metricOptions = METRIC_OPTIONS.map(opt => `<option value="${opt.value}" ${opt.value === defaultMetric ? 'selected' : ''}>${opt.label}</option>`).join('');

        let html = `<h3 class="mb-3">Brute-Force Optimierung für T2-Kriterien</h3>
                    <div class="card mb-4">
                        <div class="card-body">
                            <div class="row g-3 align-items-end">
                                <div class="col-md-5 col-lg-4">
                                    <label for="brute-force-metric" class="form-label form-label-sm">Zielmetrik:</label>
                                    <select class="form-select form-select-sm" id="brute-force-metric" data-tippy-content="${window.TOOLTIP_CONTENT.bruteForceMetric.description}">
                                        ${metricOptions}
                                    </select>
                                </div>
                                <div class="col-md-4 col-lg-3">
                                    <button class="btn btn-primary btn-sm w-100" id="btn-start-brute-force" ${!isWorkerAvailable ? 'disabled' : ''} data-tippy-content="${window.TOOLTIP_CONTENT.bruteForceStart.description}">
                                        <i class="fas fa-cogs fa-fw me-1"></i>Optimierung Starten
                                    </button>
                                </div>
                                 <div class="col-md-3 col-lg-2">
                                    <button class="btn btn-danger btn-sm w-100" id="btn-cancel-brute-force" disabled data-tippy-content="Aktuelle Optimierung abbrechen">
                                        <i class="fas fa-stop-circle fa-fw me-1"></i>Stopp
                                    </button>
                                </div>
                            </div>
                            <div id="brute-force-status-info" class="mt-3 small text-muted" data-tippy-content="${window.TOOLTIP_CONTENT.bruteForceInfo.description}">
                                Status: Bereit für Kollektiv <strong>${kollektivName}</strong>.
                            </div>
                            <div id="brute-force-progress-container" class="mt-2" data-tippy-content="${window.TOOLTIP_CONTENT.bruteForceProgress.description}">
                                <!-- Progress bar and text updated by JS -->
                            </div>
                            <div id="brute-force-result-container" class="mt-3">
                                <!-- Best result and apply button updated by JS -->
                            </div>
                        </div>
                    </div><hr class="my-4">`;
        return html;
    }

    function _createAuswertungT2LymphknotenDetailHTML(lymphknotenT2BewertetArray, currentCriteria, currentLogic) {
        if (!Array.isArray(lymphknotenT2BewertetArray) || lymphknotenT2BewertetArray.length === 0) {
            return `<div class="p-2 text-muted small"><em>Keine T2-Lymphknoten für diesen Patienten bewertet oder vorhanden.</em></div>`;
        }

        let detailHtml = '<div class="sub-row-content container-fluid"><div class="row g-2">';
        const anyActiveNonSizeCriteria = Object.keys(currentCriteria).some(key => key !== 'size' && currentCriteria[key].active);

        lymphknotenT2BewertetArray.forEach((lkBewertet, index) => {
            if (!lkBewertet || !lkBewertet.lk) return;
            const lk = lkBewertet.lk;
            const evaluationDetails = lkBewertet.evaluationDetails || {};
            const passesOverall = lkBewertet.passes;

            detailHtml += `<div class="col-12 col-md-6 col-lg-4">
                            <div class="sub-row-item border rounded ${passesOverall ? 'bg-status-red-light' : ''}">
                                <strong class="me-2">LK #${index + 1} (${passesOverall ? 'Positiv' : 'Negativ'}):</strong>`;

            const criteriaKeys = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
            criteriaKeys.forEach(key => {
                if (currentCriteria[key]?.active) {
                    const displayValue = lk[key] !== null && lk[key] !== undefined ? (key === 'size' ? `${window.formatNumber(lk[key], 1)}mm` : lk[key]) : 'N/A';
                    const criterionMet = evaluationDetails[key]?.met; // Changed from .metOverall to .met
                    let icon = window.uiComponents.getIconForT2Feature(key, lk[key], criterionMet);
                    let textClass = '';
                     if (criterionMet !== undefined) {
                         if (currentLogic === 'UND' && !criterionMet) { textClass = 'highlight-failed-feature'; }
                         else if (criterionMet) { textClass = 'highlight-suspekt-feature'; }
                     } else if (!anyActiveNonSizeCriteria && key !== 'size' && currentLogic === 'UND') {
                         // If only size is active and it's an AND logic, other features don't "fail" the overall
                     } else if (currentLogic === 'ODER' && !anyActiveNonSizeCriteria && key !== 'size'){
                        // If only size is active and it's an OR logic
                     }

                    const labelText = { size: 'Größe', form: 'Form', kontur: 'Kontur', homogenitaet: 'Homogenität', signal: 'Signal' }[key] || key;
                    detailHtml += `<span class="me-2 ${textClass}">${icon}${labelText}: ${displayValue}</span>`;
                }
            });
            detailHtml += `</div></div>`;
        });
        detailHtml += '</div></div>';
        return detailHtml;
    }

    function renderAuswertungTab(data, currentT2Criteria, currentT2Logic, sortState, currentKollektiv, isBruteForceWorkerAvailable) {
        if (typeof window.tableRenderer === 'undefined' || typeof window.uiComponents === 'undefined' || typeof window.TOOLTIP_CONTENT === 'undefined' || typeof window.APP_CONFIG === 'undefined' || typeof window.stateManager === 'undefined') {
            console.error("Abhängigkeiten für auswertungTabRenderer nicht vollständig geladen.");
            return '<p class="text-danger p-3">Fehler: Wichtige Komponenten für den Auswertung-Tab nicht geladen.</p>';
        }

        let html = _createDashboardHTML(currentKollektiv);
        html += _createT2KriterienDefinitionHTML(currentT2Criteria, currentT2Logic);
        html += _createT2MetricsOverviewHTML(currentKollektiv);
        html += _createBruteForcePanelHTML(isBruteForceWorkerAvailable, currentKollektiv);

        html += `<h3 class="mb-3">Patienten-Auswertungstabelle</h3>`;
        html += `<div class="d-flex justify-content-end mb-2">
                    <button class="btn btn-sm btn-outline-secondary" id="auswertung-toggle-details" data-tippy-content="${window.TOOLTIP_CONTENT.auswertungTable.expandAll.description}">
                        <i class="fas fa-plus-square me-1"></i>Alle Details Anzeigen
                    </button>
                 </div>`;

        const tableId = "auswertung-table";
        const tableBodyId = "auswertung-table-body";
        const noDataMessage = '<td colspan="7" class="text-center text-muted p-3">Keine Patientendaten für das aktuelle Kollektiv und die eingestellten Kriterien verfügbar.</td>';
        html += `<div class="table-responsive"><table class="table table-sm table-hover data-table" id="${tableId}">`;

        const headers = [
            { key: 'expand', label: '', sortable: false, class: 'text-center p-1', style: 'width: 40px;' },
            { key: 'nr', label: 'Nr.', sortable: true, tooltip: window.TOOLTIP_CONTENT.auswertungTable.nr.description },
            { key: 'name', label: 'Name', sortable: true, tooltip: window.TOOLTIP_CONTENT.auswertungTable.name.description },
            { key: 'therapie', label: 'Therapie', sortable: true, tooltip: window.TOOLTIP_CONTENT.auswertungTable.therapie.description },
            { key: 'n_as_t2', label: 'N | AS | T2', sortable: true, subSortKeys: ['n', 'as', 't2'], tooltip: window.TOOLTIP_CONTENT.auswertungTable.n_as_t2.description, class: 'text-center' },
            { key: 'n_counts', label: 'N LK (+/ges)', sortable: true, tooltip: window.TOOLTIP_CONTENT.auswertungTable.n_counts.description, class: 'text-center' },
            { key: 'as_counts', label: 'AS LK (+/ges)', sortable: true, tooltip: window.TOOLTIP_CONTENT.auswertungTable.as_counts.description, class: 'text-center' },
            { key: 't2_counts', label: 'T2 LK (+/ges)', sortable: true, tooltip: window.TOOLTIP_CONTENT.auswertungTable.t2_counts.description, class: 'text-center' }
        ];

        html += window.tableRenderer.createSortableTableHeaders(headers, sortState);
        html += `<tbody id="${tableBodyId}">`;

        if (!data || data.length === 0) {
            html += `<tr>${noDataMessage.replace('colspan="7"','colspan="'+headers.length+'"')}</tr>`;
        } else {
            data.forEach((patient, index) => {
                const rowId = `auswertung-patient-row-${patient.nr || index}`;
                const collapseId = `auswertung-collapse-details-${patient.nr || index}`;
                const hasT2BewertetData = patient.lymphknoten_t2_bewertet && patient.lymphknoten_t2_bewertet.length > 0;

                html += `<tr id="${rowId}" class="${hasT2BewertetData ? 'clickable-row' : ''}" ${hasT2BewertetData ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}"` : ''} data-patient-id="${patient.nr || index}">
                            <td class="text-center p-1">
                                ${hasT2BewertetData ? `<button class="btn btn-sm row-toggle-button" aria-label="Details anzeigen/ausblenden" data-tippy-content="${window.TOOLTIP_CONTENT.auswertungTable.expandRow.description}"><i class="fas fa-chevron-down row-toggle-icon"></i></button>` : ''}
                            </td>
                            <td>${patient.nr !== undefined ? patient.nr : 'N/A'}</td>
                            <td>${patient.name || 'N/A'}</td>
                            <td>${patient.therapie || 'N/A'}</td>
                            <td class="text-center">
                                <span class="status-badge ${window.getStatusClass(patient.n)}">${patient.n || '?'}</span> |
                                <span class="status-badge ${window.getStatusClass(patient.as)}">${patient.as || '?'}</span> |
                                <span class="status-badge ${window.getStatusClass(patient.t2)}">${patient.t2 || '?'}</span>
                            </td>
                            <td class="text-center">${window.formatNumber(patient.anzahl_patho_n_plus_lk,0,'0')}/${window.formatNumber(patient.anzahl_patho_lk,0,'0')}</td>
                            <td class="text-center">${window.formatNumber(patient.anzahl_as_plus_lk,0,'0')}/${window.formatNumber(patient.anzahl_as_lk,0,'0')}</td>
                            <td class="text-center">${window.formatNumber(patient.anzahl_t2_plus_lk,0,'0')}/${window.formatNumber(patient.anzahl_t2_lk,0,'0')}</td>
                          </tr>`;
                if (hasT2BewertetData) {
                    html += `<tr class="sub-row">
                                <td colspan="${headers.length}" class="p-0">
                                    <div class="collapse" id="${collapseId}">
                                        ${_createAuswertungT2LymphknotenDetailHTML(patient.lymphknoten_t2_bewertet, currentT2Criteria, currentT2Logic)}
                                    </div>
                                </td>
                              </tr>`;
                }
            });
        }
        html += `</tbody></table></div>`;
        return html;
    }

    return Object.freeze({
        renderAuswertungTab
    });

})();
