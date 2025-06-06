const auswertungRenderer = (() => {

    function _createDashboardHTML(dashboardStats, kollektivName) {
        const displayName = getKollektivDisplayName(kollektivName);
        let html = `<h3 class="mb-3">Dashboard: Kollektiv ${displayName}</h3><div class="row g-3">`;

        if (!dashboardStats) {
            html += `<div class="col-12"><p class="text-center text-muted p-3">Keine Dashboard-Daten verfügbar.</p></div>`;
            html += `</div><hr class="my-4">`;
            return html;
        }

        const cards = [
            { id: 'dashboard-chart-age', title: UI_TEXTS.chartTitles.ageDistribution, tooltipKey: 'chartAge' },
            { id: 'dashboard-chart-gender', title: UI_TEXTS.chartTitles.genderDistribution, tooltipKey: 'chartGender' },
            { id: 'dashboard-chart-therapy', title: UI_TEXTS.chartTitles.therapyDistribution, tooltipKey: 'chartTherapy' },
            { id: 'dashboard-chart-status-n', title: UI_TEXTS.chartTitles.statusN, tooltipKey: 'chartNStatus' },
            { id: 'dashboard-chart-status-as', title: UI_TEXTS.chartTitles.statusAS, tooltipKey: 'chartASStatus' },
            { id: 'dashboard-chart-status-t2', title: UI_TEXTS.chartTitles.statusT2, tooltipKey: 'chartT2Status' }
        ];

        cards.forEach(card => {
            const tooltipText = (TOOLTIP_CONTENT.deskriptiveStatistik[card.tooltipKey]?.description || card.title).replace('[KOLLEKTIV]', `<strong>${displayName}</strong>`);
            html += `
                <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 dashboard-card-col">
                    <div class="card dashboard-card h-100" data-tippy-content="${tooltipText}">
                        <div class="card-header card-header-sm p-1">${card.title}</div>
                        <div class="card-body p-2">
                            <div id="${card.id}" class="dashboard-chart-container" style="min-height: 150px;">
                                <p class="text-center text-muted small pt-4">Lade Diagramm...</p>
                            </div>
                        </div>
                    </div>
                </div>`;
        });

        html += `</div><hr class="my-4">`;
        return html;
    }

    function _createT2KriterienDefinitionHTML(currentCriteria, currentLogic) {
        let html = `
            <div class="row">
                <div class="col-lg-8">
                    <h3 class="mb-3">T2-Kriterien Definition</h3>
                </div>
                <div class="col-lg-4 text-lg-end">
                     <span id="t2-criteria-unsaved-indicator" class="badge bg-warning text-dark p-2 d-none" data-tippy-content="${TOOLTIP_CONTENT.t2CriteriaCard.unsavedIndicator}">Ungespeicherte Änderungen!</span>
                </div>
            </div>
            <div class="card t2-criteria-card mb-4" id="t2-criteria-definition-card">
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-6 col-lg-3 criteria-group">
                            ${uiComponents.createCriteriaToggle('size', currentCriteria.size.active, TOOLTIP_CONTENT.t2Size.description)}
                            ${uiComponents.createRangeSlider('size', currentCriteria.size.threshold, APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE, currentCriteria.size.active)}
                        </div>
                        <div class="col-md-6 col-lg-2 criteria-group">
                            ${uiComponents.createCriteriaToggle('form', currentCriteria.form.active, TOOLTIP_CONTENT.t2Form.description)}
                            ${uiComponents.createRadioOptions('form', APP_CONFIG.T2_CRITERIA_SETTINGS.FORM_VALUES, currentCriteria.form.value, currentCriteria.form.active)}
                        </div>
                        <div class="col-md-6 col-lg-2 criteria-group">
                            ${uiComponents.createCriteriaToggle('kontur', currentCriteria.kontur.active, TOOLTIP_CONTENT.t2Kontur.description)}
                            ${uiComponents.createRadioOptions('kontur', APP_CONFIG.T2_CRITERIA_SETTINGS.KONTUR_VALUES, currentCriteria.kontur.value, currentCriteria.kontur.active)}
                        </div>
                        <div class="col-md-6 col-lg-2 criteria-group">
                            ${uiComponents.createCriteriaToggle('homogenitaet', currentCriteria.homogenitaet.active, TOOLTIP_CONTENT.t2Homogenitaet.description)}
                            ${uiComponents.createRadioOptions('homogenitaet', APP_CONFIG.T2_CRITERIA_SETTINGS.HOMOGENITAET_VALUES, currentCriteria.homogenitaet.value, currentCriteria.homogenitaet.active)}
                        </div>
                        <div class="col-md-6 col-lg-3 criteria-group">
                            ${uiComponents.createCriteriaToggle('signal', currentCriteria.signal.active, TOOLTIP_CONTENT.t2Signal.description)}
                            ${uiComponents.createRadioOptions('signal', APP_CONFIG.T2_CRITERIA_SETTINGS.SIGNAL_VALUES, currentCriteria.signal.value, currentCriteria.signal.active)}
                        </div>
                    </div>
                    <hr class="my-3">
                    <div class="d-flex flex-wrap justify-content-between align-items-center">
                        <div class="me-3 mb-2 mb-md-0">
                            ${uiComponents.createLogicSwitch(currentLogic, TOOLTIP_CONTENT.t2Logic.description)}
                        </div>
                        <div class="btn-toolbar" role="toolbar">
                            <button class="btn btn-sm btn-outline-secondary me-2" id="btn-reset-criteria" data-tippy-content="${TOOLTIP_CONTENT.t2Actions.reset}"><i class="fas fa-undo fa-fw me-1"></i>Zurücksetzen</button>
                            <button class="btn btn-sm btn-primary" id="btn-apply-criteria" data-tippy-content="${TOOLTIP_CONTENT.t2Actions.apply}"><i class="fas fa-check-circle fa-fw me-1"></i>Anwenden & Speichern</button>
                        </div>
                    </div>
                </div>
            </div>`;
        return html;
    }

    function _createT2MetricsOverviewHTML(stats, kollektivName) {
        const displayName = getKollektivDisplayName(kollektivName);
        let contentHTML;

        if (!stats || !stats.matrix || stats.matrix.rp === undefined) {
            contentHTML = `<p class="m-0 text-muted small">Metriken für angewandte T2-Kriterien sind für das Kollektiv ${displayName} nicht verfügbar. Bitte Kriterien anwenden.</p>`;
        } else {
            const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc'];
            const metricDisplayNames = { sens: 'Sens', spez: 'Spez', ppv: 'PPV', npv: 'NPV', acc: 'Acc', balAcc: 'BalAcc' };
            contentHTML = '<div class="d-flex flex-wrap justify-content-around small text-center">';
            metrics.forEach((key, index) => {
                const metricData = stats[key];
                const interpretationHTML = uiHelpers.getMetricInterpretationHTML(key, metricData, 'T2 (angewandt)', displayName);
                const formattedValue = formatCI(metricData?.value, metricData?.ci?.lower, metricData?.ci?.upper, 1, true, '--');
                contentHTML += `
                    <div class="p-1 flex-fill bd-highlight ${index > 0 ? 'border-start' : ''}">
                        <strong data-tippy-content="${uiHelpers.getMetricDescriptionHTML(key, 'T2 (angewandt)')}">${metricDisplayNames[key]}:</strong>
                        <span data-tippy-content="${interpretationHTML}"> ${formattedValue}</span>
                    </div>`;
            });
            contentHTML += '</div>';
        }

        return `<h3 class="mb-3">T2 Metrik-Übersicht (Angewandte Kriterien)</h3>
                <div class="card mb-4" data-tippy-content="${(TOOLTIP_CONTENT.t2MetricsOverview.cardTitle || 'Kurzübersicht').replace('[KOLLEKTIV]', `<strong>${displayName}</strong>`)}">
                    <div class="card-body p-2">${contentHTML}</div>
                </div><hr class="my-4">`;
    }

    function _createBruteForcePanelHTML(isWorkerAvailable, kollektivName) {
        const metricOptions = METRIC_OPTIONS.map(opt => `<option value="${opt.value}" ${opt.value === APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC ? 'selected' : ''}>${opt.label}</option>`).join('');
        return `
            <h3 class="mb-3">Brute-Force Optimierung für T2-Kriterien</h3>
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row g-3 align-items-end">
                        <div class="col-md-5 col-lg-4">
                            <label for="brute-force-metric" class="form-label form-label-sm">Zielmetrik:</label>
                            <select class="form-select form-select-sm" id="brute-force-metric" data-tippy-content="${TOOLTIP_CONTENT.bruteForceMetric.description}">${metricOptions}</select>
                        </div>
                        <div class="col-md-4 col-lg-3">
                            <button class="btn btn-primary btn-sm w-100" id="btn-start-brute-force" ${!isWorkerAvailable ? 'disabled' : ''} data-tippy-content="${TOOLTIP_CONTENT.bruteForceStart.description}">
                                <i class="fas fa-cogs fa-fw me-1"></i>Optimierung starten
                            </button>
                        </div>
                        <div class="col-md-3 col-lg-2">
                            <button class="btn btn-danger btn-sm w-100 d-none" id="btn-cancel-brute-force" data-tippy-content="Aktuelle Optimierung abbrechen">
                                <i class="fas fa-stop-circle fa-fw me-1"></i>Stopp
                            </button>
                        </div>
                    </div>
                    <div id="brute-force-info" class="mt-3 small text-muted">
                        Status: Bereit für Kollektiv <strong>${getKollektivDisplayName(kollektivName)}</strong>.
                    </div>
                    <div id="brute-force-progress-container" class="mt-2 d-none"></div>
                    <div id="brute-force-result-container" class="mt-3 d-none"></div>
                </div>
            </div><hr class="my-4">`;
    }

    function _createAuswertungTableHTML(data, sortState, appliedCriteria, appliedLogic) {
        const tableId = 'auswertung-table';
        const tableBodyId = 'auswertung-table-body';
        const noDataMessage = `<td colspan="8" class="text-center text-muted p-3">Keine Patientendaten für das aktuelle Kollektiv verfügbar.</td>`;

        const headers = [
            { key: 'expand', label: '', sortable: false, class: 'text-center p-1', style: 'width: 40px;' },
            { key: 'nr', label: 'Nr.', sortable: true, tooltip: TOOLTIP_CONTENT.auswertungTable.nr.description },
            { key: 'name', label: 'Name', sortable: true, tooltip: TOOLTIP_CONTENT.auswertungTable.name.description },
            { key: 'therapie', label: 'Therapie', sortable: true, tooltip: TOOLTIP_CONTENT.auswertungTable.therapie.description },
            { key: 'status', label: 'N | AS | T2', sortable: true, subSortKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}], tooltip: TOOLTIP_CONTENT.auswertungTable.n_as_t2.description, class: 'text-center' },
            { key: 'anzahl_patho_lk', label: 'N+ / ges', sortable: true, tooltip: TOOLTIP_CONTENT.auswertungTable.n_counts.description, class: 'text-center' },
            { key: 'anzahl_as_lk', label: 'AS+ / ges', sortable: true, tooltip: TOOLTIP_CONTENT.auswertungTable.as_counts.description, class: 'text-center' },
            { key: 'anzahl_t2_lk', label: 'T2+ / ges', sortable: true, tooltip: TOOLTIP_CONTENT.auswertungTable.t2_counts.description, class: 'text-center' }
        ];

        const tableHeaderHTML = tableRenderer.createSortableTableHeaders(headers, sortState);
        let tableBodyHTML = '';
        if (!data || data.length === 0) {
            tableBodyHTML = `<tr>${noDataMessage}</tr>`;
        } else {
            tableBodyHTML = data.map(patient => tableRenderer.createAuswertungTableRow(patient, appliedCriteria, appliedLogic)).join('');
        }

        return `
            <h3 class="mb-3">Patienten-Auswertungstabelle</h3>
            <div class="d-flex justify-content-end mb-2">
                <button class="btn btn-sm btn-outline-secondary" id="auswertung-toggle-details" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.expandAll.description}" data-action="expand">
                    <i class="fas fa-chevron-down me-1"></i>Alle Details Anzeigen
                </button>
            </div>
            <div class="table-responsive">
                <table class="table table-sm table-hover data-table" id="${tableId}">
                    ${tableHeaderHTML}
                    <tbody id="${tableBodyId}">${tableBodyHTML}</tbody>
                </table>
            </div>`;
    }

    function render(data, dashboardStats, currentT2Criteria, currentT2Logic, sortState, currentKollektiv, isBruteForceWorkerAvailable, t2MetricsStats) {
        let html = _createDashboardHTML(dashboardStats, currentKollektiv);
        html += _createT2KriterienDefinitionHTML(currentT2Criteria, currentT2Logic);
        html += _createT2MetricsOverviewHTML(t2MetricsStats, currentKollektiv);
        html += _createBruteForcePanelHTML(isBruteForceWorkerAvailable, currentKollektiv);
        html += _createAuswertungTableHTML(data, sortState, currentT2Criteria, currentT2Logic);
        return html;
    }

    return Object.freeze({
        render
    });

})();
