const auswertungController = (() => {

    let mainApp = null;
    let isInitialized = false;

    const debouncedUpdate = utils.debounce(() => {
        if (mainApp) {
            mainApp.updateAndRender();
        }
    }, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);

    function _handleCriteriaInputChange(event) {
        const target = event.target;
        if (!target) return;

        const isChecked = target.checked;

        if (target.matches('.criteria-checkbox')) {
            const criterionKey = target.value;
            t2CriteriaManager.setCriteria({ [criterionKey]: { active: isChecked } });
            debouncedUpdate();
        } else if (target.id === 't2-logic-switch') {
            t2CriteriaManager.setCriteria(null, isChecked ? 'ODER' : 'UND');
            debouncedUpdate();
        } else if (target.matches('.criteria-range, .criteria-input-manual')) {
            const value = parseFloat(target.value);
            const min = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min;
            const max = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max;
            const clampedValue = utils.clampNumber(value, min, max);

            if (!isNaN(clampedValue)) {
                t2CriteriaManager.setCriteria({ size: { threshold: clampedValue } });
                debouncedUpdate();
            }
        }
    }

    function _handleCriteriaButtonClick(event) {
        const button = event.target.closest('.t2-criteria-button');
        if (!button) return;

        const { criterion, value } = button.dataset;
        t2CriteriaManager.setCriteria({ [criterion]: { value: value } });
        debouncedUpdate();
    }
    
    function _handleActionClick(event) {
        const button = event.target.closest('button');
        if (!button) return;

        switch (button.id) {
            case 'btn-reset-criteria-defaults':
                t2CriteriaManager.resetToDefaults();
                debouncedUpdate();
                uiHelpers.showToast('T2-Kriterien auf Standardwerte zurückgesetzt.', 'info');
                break;
            case 'btn-start-brute-force':
                const metric = document.getElementById('brute-force-metric')?.value;
                if (metric) {
                    const data = dataProcessor.filterDataByKollektiv(dataProcessor.getProcessedData(), stateManager.getCurrentKollektiv());
                    bruteForceManager.startAnalysis(data, metric, stateManager.getCurrentKollektiv());
                }
                break;
            case 'btn-cancel-brute-force':
                bruteForceManager.cancelAnalysis();
                break;
            case 'auswertung-toggle-details':
                _toggleAllDetails('auswertung-table-body', button);
                break;
        }
    }

    function _handleApplyBruteForceResult(event) {
        const button = event.target.closest('.btn-apply-bf-result');
        if (!button) return;
        
        const resultIndex = parseInt(button.dataset.index, 10);
        const resultsData = bruteForceManager.getResultsForKollektiv(stateManager.getCurrentKollektiv());

        if (resultsData && resultsData.results[resultIndex]) {
            const { criteria, logic } = resultsData.results[resultIndex];
            t2CriteriaManager.setCriteria(criteria, logic);
            debouncedUpdate();
            uiHelpers.showToast('Optimierte Kriterien erfolgreich übernommen.', 'success');
            const criteriaCard = document.getElementById('t2-criteria-definition-card');
            if(criteriaCard) {
                criteriaCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                criteriaCard.classList.add('highlight-animation');
                setTimeout(() => criteriaCard.classList.remove('highlight-animation'), 2000);
            }
        }
    }

    function _toggleAllDetails(tableBodyId, button) {
        if (!button) return;
        const tableBody = document.getElementById(tableBodyId);
        if (!tableBody) return;

        const isExpandAction = button.dataset.action === 'expand';
        const collapseElements = tableBody.querySelectorAll('.collapse');

        collapseElements.forEach(el => {
            const instance = bootstrap.Collapse.getOrCreateInstance(el);
            if (isExpandAction && !el.classList.contains('show')) {
                instance.show();
            } else if (!isExpandAction && el.classList.contains('show')) {
                instance.hide();
            }
        });

        const newAction = isExpandAction ? 'collapse' : 'expand';
        const newIconClass = isExpandAction ? 'fa-chevron-up' : 'fa-chevron-down';
        const newButtonText = isExpandAction ? 'Alle Details Ausblenden' : 'Alle Details Anzeigen';
        const tooltipContent = isExpandAction ? 
            TOOLTIP_CONTENT.auswertungTable.collapseAll.description :
            TOOLTIP_CONTENT.auswertungTable.expandAll.description;
            
        button.dataset.action = newAction;
        button.innerHTML = `<i class="fas ${newIconClass} me-1"></i>${newButtonText}`;
        button.setAttribute('data-tippy-content', tooltipContent);
        if (button._tippy) {
            button._tippy.setContent(tooltipContent);
        }
    }

    function updateBruteForceUI(state, payload) {
        const startBtn = document.getElementById('btn-start-brute-force');
        const cancelBtn = document.getElementById('btn-cancel-brute-force');
        const progressContainer = document.getElementById('brute-force-progress-container');
        const resultContainer = document.getElementById('brute-force-result-container');
        const infoText = document.getElementById('brute-force-info');

        if (!startBtn || !cancelBtn || !progressContainer || !resultContainer || !infoText) return;

        const isRunning = state === 'started' || state === 'progress';
        startBtn.classList.toggle('d-none', isRunning);
        cancelBtn.classList.toggle('d-none', !isRunning);
        progressContainer.classList.toggle('d-none', !isRunning);
        
        if(state !== 'progress' && state !== 'started') {
            resultContainer.classList.remove('d-none');
        } else {
             resultContainer.classList.add('d-none');
        }
        
        switch(state) {
            case 'started':
                infoText.innerHTML = `Status: Optimierung für Kollektiv <strong>${utils.getKollektivDisplayName(payload.kollektiv)}</strong> gestartet...`;
                resultContainer.innerHTML = '';
                break;
            case 'progress':
                const percent = payload.total > 0 ? Math.round((payload.tested / payload.total) * 100) : 0;
                progressContainer.innerHTML = `<div class="progress" style="height: 20px;"><div class="progress-bar" role="progressbar" style="width: ${percent}%;" aria-valuenow="${percent}">${percent}%</div></div><p class="text-center small mt-1 mb-0">${payload.tested} / ${payload.total} getestet</p>`;
                const currentBestMetricValue = payload.currentBest?.metricValue;
                const currentBestFormatted = (typeof currentBestMetricValue === 'number' && isFinite(currentBestMetricValue)) ? utils.formatNumber(currentBestMetricValue, 4) : 'N/A';
                infoText.innerHTML = `Status: Läuft... Aktuell Bester ${payload.metric}: <strong>${currentBestFormatted}</strong>`;
                break;
            case 'result':
                infoText.innerHTML = `Status: Abgeschlossen für Kollektiv <strong>${utils.getKollektivDisplayName(payload.kollektiv)}</strong>. Dauer: ${utils.formatNumber(payload.duration / 1000, 1)}s.`;
                _renderBruteForceResultTable(payload);
                break;
            case 'cancelled':
                infoText.innerHTML = `Status: Analyse für Kollektiv <strong>${utils.getKollektivDisplayName(payload.kollektiv)}</strong> abgebrochen.`;
                progressContainer.innerHTML = '';
                resultContainer.innerHTML = '';
                break;
            case 'error':
                 infoText.innerHTML = `<span class="text-danger">Status: Fehler bei der Optimierung.</span><p class="small text-danger mb-0">${payload.message}</p>`;
                 progressContainer.innerHTML = '';
                 resultContainer.innerHTML = '';
                break;
        }
        uiHelpers.initializeTooltips(document.getElementById('auswertung-tab-pane'));
    }
    
    function _renderBruteForceResultTable(payload) {
        const resultContainer = document.getElementById('brute-force-result-container');
        if (!resultContainer || !payload || !payload.results || payload.results.length === 0) {
            if(resultContainer) resultContainer.innerHTML = '<div class="alert alert-warning">Keine validen Ergebnisse gefunden.</div>';
            return;
        }

        let tableHTML = `<h5 class="mt-4">Top Ergebnisse (Metrik: ${payload.metric})</h5><div class="table-responsive"><table class="table table-sm table-striped table-hover"><thead><tr><th>Rang</th><th>${payload.metric}</th><th>Logik</th><th>Kriterien</th><th>Aktion</th></tr></thead><tbody>`;

        payload.results.forEach((res, index) => {
            tableHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${utils.formatNumber(res.metricValue, 4)}</td>
                    <td>${res.logic}</td>
                    <td>${t2CriteriaManager.formatCriteriaForDisplay(res.criteria, res.logic)}</td>
                    <td><button class="btn btn-sm btn-outline-primary py-0 btn-apply-bf-result" data-index="${index}" data-tippy-content="Diese Kriterien übernehmen">Übernehmen</button></td>
                </tr>`;
        });

        tableHTML += '</tbody></table></div>';
        resultContainer.innerHTML = tableHTML;
        uiHelpers.initializeTooltips(resultContainer);
    }
    
    function _addEventListeners() {
        const pane = document.getElementById('auswertung-tab-pane');
        if (!pane) return;

        pane.addEventListener('input', _handleCriteriaInputChange);
        pane.addEventListener('click', (event) => {
            _handleCriteriaButtonClick(event);
            _handleActionClick(event);
            _handleApplyBruteForceResult(event);
        });
    }

    function init(app) {
        if (isInitialized) return;
        mainApp = app;
        isInitialized = true;
    }
    
    function onTabEnter() {
       _addEventListeners();
       bruteForceManager.setCallbacks({
           onStarted: (payload) => updateBruteForceUI('started', payload),
           onProgress: (payload) => updateBruteForceUI('progress', payload),
           onResult: (payload) => updateBruteForceUI('result', payload),
           onCancelled: (payload) => updateBruteForceUI('cancelled', payload),
           onError: (payload) => updateBruteForceUI('error', payload)
       });
       if (bruteForceManager.isAnalysisRunning()) {
           updateBruteForceUI('started', { kollektiv: bruteForceManager.currentKollektivRunning || stateManager.getCurrentKollektiv() });
       } else {
           const lastResult = bruteForceManager.getResultsForKollektiv(stateManager.getCurrentKollektiv());
           if (lastResult) {
               updateBruteForceUI('result', lastResult);
           } else {
                updateBruteForceUI('ready', { kollektiv: stateManager.getCurrentKollektiv() });
           }
       }
    }
    
    function onTabExit() {
        bruteForceManager.setCallbacks({});
    }

    return Object.freeze({
        init,
        onTabEnter,
        onTabExit,
        updateBruteForceUI
    });

})();
