window.auswertungTabLogic = (() => {
    const TAB_ID = 'auswertung-tab-pane';
    let currentData = [];
    let appliedT2CriteriaForTable = null;
    let appliedT2LogicForTable = null;

    function initializeAuswertungTab() {
        renderAuswertungTab();
        auswertungEventHandlers.setupAuswertungTabEventHandlers();
        updateBruteForceUI();
    }

    function renderAuswertungTab(sortConfig = state.getAuswertungTableSort()) {
        const currentKollektiv = state.getCurrentKollektiv();
        currentData = dataProcessor.filterDataByKollektiv(kollektivStore.getAllProcessedData(), currentKollektiv);
        appliedT2CriteriaForTable = t2CriteriaManager.getAppliedCriteria();
        appliedT2LogicForTable = t2CriteriaManager.getAppliedLogic();

        const evaluatedDataForTable = t2CriteriaManager.evaluateDataset(cloneDeep(currentData), appliedT2CriteriaForTable, appliedT2LogicForTable);
        const tabContainer = document.getElementById(TAB_ID);

        if (!tabContainer) {
            ui_helpers.showLoadingSpinner(TAB_ID, `Container '${TAB_ID}' nicht gefunden.`);
            return;
        }
        tabContainer.innerHTML = '';

        const row = ui_helpers.createElementWithAttributes('div', { class: 'row g-3' });
        const leftCol = ui_helpers.createElementWithAttributes('div', { class: 'col-lg-4 col-md-5' });
        const rightCol = ui_helpers.createElementWithAttributes('div', { class: 'col-lg-8 col-md-7' });

        leftCol.appendChild(renderT2CriteriaControlsSection());
        leftCol.appendChild(renderBruteForceSection());

        rightCol.appendChild(renderDashboardSection(evaluatedDataForTable, appliedT2CriteriaForTable, appliedT2LogicForTable));
        rightCol.appendChild(renderAuswertungTableSection(evaluatedDataForTable, sortConfig));

        row.appendChild(leftCol);
        row.appendChild(rightCol);
        tabContainer.appendChild(row);

        ui_helpers.initTooltips(tabContainer);
        tableManager.initializeTableEventListeners('auswertung-table', 'getAuswertungTableSort', handleSortAuswertungTable);
        updateUnsavedIndicator();
        updateCumulativeLogicDisplay();
    }

    function renderT2CriteriaControlsSection() {
        const currentT2Criteria = t2CriteriaManager.getCurrentCriteria();
        const currentT2Logic = t2CriteriaManager.getCurrentLogic();

        const card = uiComponents.createCard({
            id: 't2-criteria-card',
            headerText: 'T2-Malignitätskriterien definieren',
            cardClass: `shadow-sm ${t2CriteriaManager.isUnsaved() ? 'criteria-unsaved-indicator' : ''}`,
            bodyClass: 'p-3'
        });
        const cardBody = card.querySelector('.card-body');

        const unsavedInfo = ui_helpers.createElementWithAttributes('p', { class: 'small text-warning mb-2 d-none', id: 't2-unsaved-indicator-text' }, UI_TEXTS.tooltips.t2CriteriaCard.unsavedIndicator);
        cardBody.appendChild(unsavedInfo);

        const appliedInfo = ui_helpers.createElementWithAttributes('p', { class: 'small text-muted mb-2', id: 't2-applied-info-text' });
        cardBody.appendChild(appliedInfo);
        updateAppliedCriteriaDisplay();


        const logicGroup = ui_helpers.createElementWithAttributes('div', { class: 'mb-3' });
        const logicLabel = ui_helpers.createElementWithAttributes('label', { class: 'form-label d-block' }, 'Logische Verknüpfung der Kriterien:');
        logicGroup.appendChild(logicLabel);
        logicGroup.setAttribute('data-tippy-content-key', 'tooltip.t2Logic');

        ['UND', 'ODER'].forEach(logicValue => {
            const radioWrapper = ui_helpers.createElementWithAttributes('div', { class: 'form-check form-check-inline' });
            const radioInput = ui_helpers.createElementWithAttributes('input', { class: 'form-check-input', type: 'radio', name: 't2LogicRadio', id: `t2Logic-${logicValue.toLowerCase()}`, value: logicValue });
            if (currentT2Logic === logicValue) radioInput.checked = true;
            const radioLabel = ui_helpers.createElementWithAttributes('label', { class: 'form-check-label', for: `t2Logic-${logicValue.toLowerCase()}` }, logicValue);
            radioWrapper.appendChild(radioInput);
            radioWrapper.appendChild(radioLabel);
            logicGroup.appendChild(radioWrapper);
        });
        cardBody.appendChild(logicGroup);

        const cumulativeLogicDisplay = ui_helpers.createElementWithAttributes('div', { id: 't2-cumulative-logic-display', class: 'alert alert-secondary small p-2 mb-3', role: 'status', 'aria-live': 'polite' });
        cardBody.appendChild(cumulativeLogicDisplay);


        const criteriaKeys = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
        criteriaKeys.forEach(key => {
            const config = APP_CONFIG.T2_CRITERIA_SETTINGS[key.toUpperCase() + '_VALUES']
                ? { label: key.charAt(0).toUpperCase() + key.slice(1), options: APP_CONFIG.T2_CRITERIA_SETTINGS[key.toUpperCase() + '_VALUES'] }
                : { label: key.charAt(0).toUpperCase() + key.slice(1) }; 

            const control = uiComponents.createT2CriteriaControl(key, config, currentT2Criteria[key] || {}, {
                onActiveChange: auswertungEventHandlers.handleT2CriterionActiveChange,
                onValueChange: auswertungEventHandlers.handleT2CriterionValueChange,
                onThresholdChange: auswertungEventHandlers.handleT2CriterionThresholdChange
            });
            cardBody.appendChild(control);
        });

        const studySetOptions = studyT2CriteriaManager.getAllStudyCriteriaSets().map(set => ({
            value: set.id,
            text: `${set.name} (${set.referenceShort || set.id})`
        }));
        studySetOptions.unshift({value: "", text: "Literatur-Set laden...", disabled: true});

        const loadSetSelect = uiComponents.createSelect({
            id: 't2-load-study-set-select',
            label: 'Vordefinierte T2-Kriteriensets laden:',
            selectOptions: studySetOptions,
            value: "",
            wrapperClass: 'mt-3 mb-2',
            onChange: auswertungEventHandlers.handleLoadStudySet
        });
        cardBody.appendChild(loadSetSelect);


        const actionsRow = ui_helpers.createElementWithAttributes('div', { class: 'd-flex justify-content-between mt-3' });
        actionsRow.appendChild(uiComponents.createButton({ id: 'btn-t2-reset', text: 'Zurücksetzen', btnClass: 'btn-outline-secondary btn-sm', tooltipKey: 'tooltip.t2Actions.reset' }));
        actionsRow.appendChild(uiComponents.createButton({ id: 'btn-t2-apply', text: 'Anwenden & Speichern', btnClass: 'btn-primary btn-sm', tooltipKey: 'tooltip.t2Actions.apply' }));
        cardBody.appendChild(actionsRow);

        return card;
    }

     function updateUnsavedIndicator() {
        const card = document.getElementById('t2-criteria-card');
        const unsavedText = document.getElementById('t2-unsaved-indicator-text');
        if (card && unsavedText) {
            const isUnsaved = t2CriteriaManager.isUnsaved();
            card.classList.toggle('criteria-unsaved-indicator', isUnsaved);
            unsavedText.classList.toggle('d-none', !isUnsaved);
        }
    }

    function updateAppliedCriteriaDisplay() {
        const appliedInfoText = document.getElementById('t2-applied-info-text');
        if(appliedInfoText) {
            const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
            const appliedLogic = t2CriteriaManager.getAppliedLogic();
            const formatFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c,l) => 'N/A';
            const appliedString = formatFunc(appliedCriteria, appliedLogic);
            appliedInfoText.innerHTML = `<strong>Angewandt:</strong> ${ui_helpers.escapeHTML(appliedString) || 'Keine spezifischen Kriterien angewandt.'}`;
        }
    }

    function updateCumulativeLogicDisplay() {
        const displayElement = document.getElementById('t2-cumulative-logic-display');
        if (displayElement) {
            const currentCriteria = t2CriteriaManager.getCurrentCriteria();
            const currentLogic = t2CriteriaManager.getCurrentLogic();
            const formatFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c,l) => 'N/A';
            const cumulativeString = formatFunc(currentCriteria, currentLogic);
            displayElement.textContent = cumulativeString;
        }
    }

    function renderBruteForceSection() {
        const card = uiComponents.createCard({
            id: 'bruteforce-card',
            headerText: 'Brute-Force T2-Kriterien Optimierung',
            cardClass: 'shadow-sm',
            bodyClass: 'p-3'
        });
        const cardBody = card.querySelector('.card-body');

        const metricOptions = [
            { value: 'Accuracy', text: 'Accuracy' },
            { value: 'Balanced Accuracy', text: 'Balanced Accuracy (Standard)' },
            { value: 'F1-Score', text: 'F1-Score' },
            { value: 'PPV', text: 'PPV' },
            { value: 'NPV', text: 'NPV' }
        ];
        const defaultMetric = APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
        const metricSelect = uiComponents.createSelect({
            id: 'bruteforce-metric-select',
            label: 'Zielmetrik für Optimierung:',
            selectOptions: metricOptions,
            value: defaultMetric,
            wrapperClass: 'mb-3',
            tooltipKey: 'tooltip.bruteForceMetric'
        });
        cardBody.appendChild(metricSelect);

        const statusDiv = ui_helpers.createElementWithAttributes('div', { id: 'bruteforce-status', class: 'mb-2 small' });
        cardBody.appendChild(statusDiv);

        const progressDiv = ui_helpers.createElementWithAttributes('div', { id: 'bruteforce-progress', class: 'mb-2 small' });
        cardBody.appendChild(progressDiv);

        const resultDiv = ui_helpers.createElementWithAttributes('div', { id: 'bruteforce-result', class: 'mb-2 small' });
        cardBody.appendChild(resultDiv);

        const actionsRow = ui_helpers.createElementWithAttributes('div', { class: 'd-flex justify-content-between' });
        actionsRow.appendChild(uiComponents.createButton({ id: 'btn-bruteforce-start', text: 'Optimierung starten', iconClass: 'fas fa-cogs', btnClass: 'btn-success btn-sm', tooltipKey: 'tooltip.bruteForceStart' }));
        actionsRow.appendChild(uiComponents.createButton({ id: 'btn-bruteforce-cancel', text: 'Abbrechen', iconClass: 'fas fa-times-circle', btnClass: 'btn-danger btn-sm d-none' }));
        cardBody.appendChild(actionsRow);

        return card;
    }

    function updateBruteForceUI(payload = null) {
        const statusDiv = document.getElementById('bruteforce-status');
        const progressDiv = document.getElementById('bruteforce-progress');
        const resultDiv = document.getElementById('bruteforce-result');
        const startButton = document.getElementById('btn-bruteforce-start');
        const cancelButton = document.getElementById('btn-bruteforce-cancel');
        const metricSelect = document.getElementById('bruteforce-metric-select');

        if (!statusDiv || !progressDiv || !resultDiv || !startButton || !cancelButton || !metricSelect) return;

        const currentKollektiv = state.getCurrentKollektiv();
        const isRunning = bruteForceManager.isRunning();
        const resultsForKollektiv = bruteForceManager.getResultsForKollektiv(currentKollektiv);

        startButton.disabled = isRunning;
        metricSelect.disabled = isRunning;
        cancelButton.classList.toggle('d-none', !isRunning);

        if (isRunning) {
            statusDiv.innerHTML = `<span class="text-primary">${ui_helpers.getIcon('fas fa-spinner fa-spin', {class: 'me-1'})} Optimierung für Kollektiv '${ui_helpers.escapeHTML(getKollektivDisplayName(currentKollektiv))}' läuft...</span>`;
            if (payload && payload.tested !== undefined) {
                const percent = payload.total > 0 ? (payload.tested / payload.total) * 100 : 0;
                progressDiv.innerHTML = `Fortschritt: ${formatNumber(payload.tested,0)} / ${formatNumber(payload.total,0)} (${formatPercent(percent/100, 1)})`;
                if (payload.currentBest) {
                    const formatFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c,l) => 'N/A';
                    resultDiv.innerHTML = `Akt. Bestes (${ui_helpers.escapeHTML(payload.metric || targetMetric)}): ${formatNumber(payload.currentBest.metricValue, 4)}<br><small class="text-muted">${formatFunc(payload.currentBest.criteria, payload.currentBest.logic)}</small>`;
                }
            } else {
                progressDiv.textContent = 'Initialisiere...';
            }
        } else {
            statusDiv.textContent = `Bereit für Optimierung des Kollektivs '${ui_helpers.escapeHTML(getKollektivDisplayName(currentKollektiv))}'.`;
            progressDiv.textContent = '';
            if (resultsForKollektiv && resultsForKollektiv.bestResult) {
                const formatFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c,l) => 'N/A';
                resultDiv.innerHTML = `
                    <strong>Letztes Bestes Ergebnis (${ui_helpers.escapeHTML(resultsForKollektiv.metric)}):</strong> ${formatNumber(resultsForKollektiv.bestResult.metricValue, 4)}<br>
                    <small class="text-muted">${formatFunc(resultsForKollektiv.bestResult.criteria, resultsForKollektiv.bestResult.logic)}</small><br>
                    <button class="btn btn-link btn-sm p-0 mt-1" id="btn-bruteforce-details">Details anzeigen</button>`;
                resultDiv.querySelector('#btn-bruteforce-details').addEventListener('click', auswertungEventHandlers.handleShowBruteForceDetails);

            } else {
                resultDiv.textContent = 'Keine vorherigen Ergebnisse für dieses Kollektiv.';
            }
        }
    }


    function renderDashboardSection(evaluatedData, criteria, logic) {
        const section = ui_helpers.createElementWithAttributes('section', { id: 'auswertung-dashboard-section', class: 'mb-3' });
        const row = ui_helpers.createElementWithAttributes('div', { class: 'row g-3' });

        const performanceStats = statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n');
        const dashboardCards = [
            { id: 'sens', title: 'Sensitivität (T2)', value: formatPercent(performanceStats.sens.value, 1), tooltip: 'tooltip.t2MetricsOverview.sens' },
            { id: 'spez', title: 'Spezifität (T2)', value: formatPercent(performanceStats.spez.value, 1), tooltip: 'tooltip.t2MetricsOverview.spez' },
            { id: 'acc', title: 'Accuracy (T2)', value: formatPercent(performanceStats.acc.value, 1), tooltip: 'tooltip.t2MetricsOverview.acc' },
            { id: 'balacc', title: 'Bal. Accuracy (T2)', value: formatNumber(performanceStats.balAcc.value, 3), tooltip: 'tooltip.t2MetricsOverview.balAcc' },
        ];

        dashboardCards.forEach(cardInfo => {
            const col = ui_helpers.createElementWithAttributes('div', { class: 'col-xl-3 col-md-6 dashboard-card-col' });
            const cardElement = uiComponents.createCard({
                headerText: cardInfo.title,
                bodyContent: `<h4 class="display-6 my-2">${cardInfo.value || '--'}</h4>`,
                cardClass: 'dashboard-card shadow-sm h-100 text-center',
                bodyClass: 'd-flex align-items-center justify-content-center',
                extraAttributes: {'data-tippy-content-key': cardInfo.tooltip, 'data-tippy-placement': 'bottom'}
            });
            col.appendChild(cardElement);
            row.appendChild(col);
        });

        section.appendChild(row);
        return section;
    }

    function renderAuswertungTableSection(evaluatedData, sortConfig) {
        const section = ui_helpers.createElementWithAttributes('section', { id: 'auswertung-table-section' });
        const card = uiComponents.createCard({ headerText: `Patientenauswertung (Kollektiv: ${getKollektivDisplayName(state.getCurrentKollektiv())})`, bodyClass: 'p-0' });
        const tableContainer = ui_helpers.createElementWithAttributes('div', { class: 'table-responsive' });

        const sortedData = dataProcessor.sortData(evaluatedData, sortConfig.key, sortConfig.direction, sortConfig.subKey);
        const table = tableRenderer.createAuswertungTable(sortedData, appliedT2CriteriaForTable, appliedT2LogicForTable);
        tableContainer.appendChild(table);
        card.querySelector('.card-body').appendChild(tableContainer);
        section.appendChild(card);
        return section;
    }

    function handleSortAuswertungTable(sortKey, subKey = null) {
        const currentSort = state.getAuswertungTableSort();
        if (currentSort.key === sortKey && currentSort.subKey === subKey) {
            state.updateAuswertungTableSortDirection(sortKey, subKey);
        } else {
            state.updateAuswertungTableSortDirection(sortKey, subKey);
        }
        renderAuswertungTab(state.getAuswertungTableSort());
    }

    function refreshAuswertungTab() {
        renderAuswertungTab(state.getAuswertungTableSort());
        updateBruteForceUI();
    }


    return {
        init: initializeAuswertungTab,
        render: renderAuswertungTab,
        refresh: refreshAuswertungTab,
        updateUnsavedIndicator,
        updateAppliedCriteriaDisplay,
        updateCumulativeLogicDisplay,
        updateBruteForceUI
    };
})();
