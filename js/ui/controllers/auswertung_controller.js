const auswertungController = (() => {

    let mainApp = null;
    let isInitialized = false;
    let unsavedCriteria = null;
    let unsavedLogic = null;

    function _updateUnsavedState(newCriteria, newLogic) {
        if (!unsavedCriteria) {
            unsavedCriteria = cloneDeep(t2CriteriaManager.getCriteria());
        }
        if (unsavedLogic === null) {
            unsavedLogic = t2CriteriaManager.getLogic();
        }

        if (newCriteria) {
            Object.assign(unsavedCriteria, cloneDeep(newCriteria));
        }
        if (newLogic !== undefined) {
            unsavedLogic = newLogic;
        }

        const hasUnsavedChanges = JSON.stringify(unsavedCriteria) !== JSON.stringify(t2CriteriaManager.getCriteria()) ||
                                  unsavedLogic !== t2CriteriaManager.getLogic();

        _updateCriteriaControlsUI();
        uiHelpers.setElementDisabled('btn-apply-criteria', !hasUnsavedChanges);
        uiHelpers.toggleElementClass('t2-criteria-unsaved-indicator', 'd-none', !hasUnsavedChanges);
    }
    
    function _updateCriteriaControlsUI() {
        const criteria = unsavedCriteria || t2CriteriaManager.getCriteria();
        const logic = unsavedLogic !== null ? unsavedLogic : t2CriteriaManager.getLogic();
        
        Object.keys(criteria).forEach(key => {
            if (key === 'logic') return;
            const criterion = criteria[key];
            const checkbox = document.getElementById(`check-${key}`);
            if (checkbox) checkbox.checked = criterion.active;
            
            const optionsContainer = checkbox?.closest('.criteria-group')?.querySelector('.criteria-options-container');
            if (optionsContainer) {
                const dependentElements = optionsContainer.querySelectorAll('input, button, select');
                dependentElements.forEach(el => {
                    el.disabled = !criterion.active;
                    el.classList.toggle('disabled-criterion-control', !criterion.active);
                    if (el.matches('.t2-criteria-button')) {
                        el.classList.toggle('inactive-option', !criterion.active);
                        el.classList.toggle('active', criterion.active && criteria[el.dataset.criterion]?.value === el.dataset.value);
                    }
                });
            }
        });

        const sizeRange = document.getElementById('range-size');
        const sizeInput = document.getElementById('input-size');
        const sizeValue = document.getElementById('value-size');
        if (sizeRange && sizeInput && sizeValue) {
            const threshold = criteria.size.threshold;
            sizeRange.value = threshold;
            sizeInput.value = threshold;
            sizeValue.textContent = formatNumber(threshold, 1);
        }
        
        const logicSwitch = document.getElementById('t2-logic-switch');
        const logicLabel = document.getElementById('t2-logic-label');
        if (logicSwitch && logicLabel) {
            logicSwitch.checked = logic === 'ODER';
            logicLabel.textContent = logic;
        }
    }

    function _handleCriteriaChange(target) {
        const group = target.closest('.criteria-group');
        if (!group) return;

        if (target.matches('.criteria-checkbox')) {
            _updateUnsavedState({ [target.value]: { ...unsavedCriteria[target.value], active: target.checked } });
        } else if (target.matches('.t2-criteria-button')) {
            const { criterion, value } = target.dataset;
            _updateUnsavedState({ [criterion]: { ...unsavedCriteria[criterion], value: value } });
        }
    }

    function _handleSizeChange(target) {
        const value = parseFloat(target.value);
        if (!isNaN(value)) {
            _updateUnsavedState({ size: { ...unsavedCriteria.size, threshold: value } });
        }
    }

    function _handleLogicSwitch(target) {
        _updateUnsavedState(null, target.checked ? 'ODER' : 'UND');
    }

    function _handleResetCriteria() {
        unsavedCriteria = null;
        unsavedLogic = null;
        _updateUnsavedState(); 
        uiHelpers.showToast('Kriterien auf den letzten gespeicherten Stand zurückgesetzt.', 'info');
    }

    function _handleApplyCriteria() {
        if (unsavedCriteria && unsavedLogic !== null) {
            t2CriteriaManager.setCriteria(unsavedCriteria, unsavedLogic);
            unsavedCriteria = null;
            unsavedLogic = null;
            _updateUnsavedState(); 
            mainApp.updateAndRender();
            uiHelpers.showToast('Neue T2-Kriterien erfolgreich angewendet und gespeichert.', 'success');
        }
    }

    function _handleStartBruteForce() {
        const metric = document.getElementById('brute-force-metric')?.value;
        if (metric) {
            bruteForceManager.start(stateManager.getCurrentKollektiv(), metric);
        }
    }

    function _handlePaneClick(event) {
        const target = event.target;
        const button = target.closest('button');

        if (target.closest('.criteria-group')) {
            _handleCriteriaChange(target.closest('.t2-criteria-button, .criteria-checkbox'));
        } else if (target.id === 't2-logic-switch') {
            _handleLogicSwitch(target);
        } else if (button) {
            switch (button.id) {
                case 'btn-reset-criteria': _handleResetCriteria(); break;
                case 'btn-apply-criteria': _handleApplyCriteria(); break;
                case 'btn-start-brute-force': _handleStartBruteForce(); break;
                case 'btn-cancel-brute-force': bruteForceManager.cancel(); break;
                case 'btn-apply-best-bf-criteria':
                    const best = bruteForceManager.getBestResult();
                    if (best) {
                        t2CriteriaManager.setCriteria(best.criteria, best.logic);
                        mainApp.updateAndRender();
                        uiHelpers.showToast('Beste Brute-Force Kriterien angewendet.', 'success');
                    }
                    break;
            }
        }
    }

    function updateBruteForceUI(state, data) {
        const elements = {
            startBtn: document.getElementById('btn-start-brute-force'),
            cancelBtn: document.getElementById('btn-cancel-brute-force'),
            progressContainer: document.getElementById('brute-force-progress-container'),
            resultContainer: document.getElementById('brute-force-result-container'),
            infoText: document.getElementById('brute-force-info')
        };
        const isRunning = state === 'start' || state === 'started' || state === 'progress';
        
        uiHelpers.toggleElementClass(elements.startBtn.id, 'd-none', isRunning);
        uiHelpers.toggleElementClass(elements.cancelBtn.id, 'd-none', !isRunning);
        
        switch(state) {
            case 'progress':
                elements.progressContainer.innerHTML = `<div class="progress" style="height: 20px;"><div id="bf-progress-bar" class="progress-bar" role="progressbar" style="width: ${data.percent}%;" aria-valuenow="${data.percent}" aria-valuemin="0" aria-valuemax="100">${data.percent}%</div></div><p class="text-center small mt-1">${data.tested} / ${data.total} getestet</p>`;
                break;
            case 'result':
                const best = data.bestResult;
                elements.resultContainer.innerHTML = `<div class="alert alert-success"><h5 class="alert-heading">Bestes Ergebnis:</h5><p><strong>Metrik:</strong> ${data.metric} | <strong>Wert:</strong> ${formatNumber(best.metricValue, 4)}</p><p><strong>Kriterien:</strong> ${t2CriteriaManager.formatCriteriaForDisplay(best.criteria, best.logic)}</p><hr><p class="mb-0">Dauer: ${formatNumber(data.duration / 1000, 1)}s. Getestete Kombinationen: ${formatNumber(data.totalTested, 0)}.</p><button id="btn-apply-best-bf-criteria" class="btn btn-sm btn-success mt-2">Diese Kriterien anwenden</button></div>`;
                break;
            case 'cancelled':
                elements.infoText.innerHTML = `Status: Lauf abgebrochen.`;
                break;
            case 'error':
                 elements.infoText.innerHTML = `Status: Ein Fehler ist aufgetreten: ${data.message}`;
                break;
        }
    }

    function init(appInterface) {
        if (isInitialized) return;
        mainApp = appInterface;
        const pane = document.getElementById('auswertung-tab-pane');
        if (pane) {
            pane.addEventListener('click', _handlePaneClick);
            pane.addEventListener('input', (event) => {
                if(event.target.id === 'range-size' || event.target.id === 'input-size') {
                    _handleSizeChange(event.target);
                }
            });
            bruteForceManager.setUpdateCallback(updateBruteForceUI);
            isInitialized = true;
        }
    }

    return Object.freeze({
        init
    });

})();
