const generalEventHandlers = (() => {

    function updateKollektivButtons(activeKollektiv) {
        document.querySelectorAll('.btn-group[aria-label="Kollektiv Auswahl"] .btn').forEach(btn => {
            btn.classList.remove('active', 'btn-primary');
            btn.classList.add('btn-outline-primary');
            if (btn.dataset.kollektiv === activeKollektiv) {
                btn.classList.add('active', 'btn-primary');
                btn.classList.remove('btn-outline-primary');
            }
        });
    }

    async function updateHeaderStats() {
        const currentKollektiv = state.getCurrentKollektiv();
        const headerKollektivEl = document.getElementById('header-kollektiv');
        const headerAnzahlEl = document.getElementById('header-anzahl-patienten');
        const headerStatusNEl = document.getElementById('header-status-n');
        const headerStatusASEl = document.getElementById('header-status-as');
        const headerStatusT2El = document.getElementById('header-status-t2');

        if (!headerKollektivEl || !headerAnzahlEl || !headerStatusNEl || !headerStatusASEl || !headerStatusT2El) return;

        headerKollektivEl.textContent = getKollektivDisplayName(currentKollektiv) || '--';

        const allProcessedData = kollektivStore.getAllProcessedData();
        const rawDataForKollektiv = dataProcessor.filterDataByKollektiv(allProcessedData, currentKollektiv);
        
        headerAnzahlEl.textContent = rawDataForKollektiv.length.toString();

        if (rawDataForKollektiv.length === 0) {
            headerStatusNEl.textContent = '--';
            headerStatusASEl.textContent = '--';
            headerStatusT2El.textContent = '--';
            return;
        }

        const appliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
        const appliedT2Logic = t2CriteriaManager.getAppliedLogic();
        const evaluatedData = t2CriteriaManager.evaluateDataset(cloneDeep(rawDataForKollektiv), appliedT2Criteria, appliedT2Logic);

        let nPlusCount = 0, asPlusCount = 0, t2PlusCount = 0;
        let validNCount = 0, validASCount = 0, validT2Count = 0;

        evaluatedData.forEach(p => {
            if (p && typeof p === 'object') {
                if (p.n === '+') { nPlusCount++; validNCount++; }
                else if (p.n === '-') { validNCount++;}

                if (p.as === '+') { asPlusCount++; validASCount++; }
                else if (p.as === '-') { validASCount++;}

                if (p.t2 === '+') { t2PlusCount++; validT2Count++; }
                else if (p.t2 === '-') { validT2Count++;}
            }
        });

        headerStatusNEl.textContent = validNCount > 0 ? `${formatPercent(nPlusCount / validNCount, 0)} (+)` : '--';
        headerStatusASEl.textContent = validASCount > 0 ? `${formatPercent(asPlusCount / validASCount, 0)} (+)` : '--';
        headerStatusT2El.textContent = validT2Count > 0 ? `${formatPercent(t2PlusCount / validT2Count, 0)} (+)` : '--';
    }


    function setupGeneralEventHandlers() {
        const mainTabList = document.querySelectorAll('#mainTab button[data-bs-toggle="tab"]');
        mainTabList.forEach(tabEl => {
            tabEl.addEventListener('shown.bs.tab', async (event) => {
                const newTabId = event.target.getAttribute('aria-controls');
                // const previousTabId = event.relatedTarget ? event.relatedTarget.getAttribute('aria-controls') : null;

                if (state.setActiveTabId(newTabId)) {
                    await viewRenderer.renderView(newTabId);
                }
            });
        });

        document.querySelectorAll('.btn-group[aria-label="Kollektiv Auswahl"] .btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const selectedKollektiv = event.target.dataset.kollektiv;
                if (state.setCurrentKollektiv(selectedKollektiv)) {
                    updateKollektivButtons(selectedKollektiv);
                    updateHeaderStats();

                    const currentActiveTabId = state.getActiveTabId();
                    if (currentActiveTabId) { // Ensure there is an active tab
                        await viewRenderer.refreshView(currentActiveTabId); // Use refreshView for existing tabs
                        await viewRenderer.updateAllViews(currentActiveTabId);
                    }

                    const kollektivChangedEvent = new CustomEvent('kollektivChanged', { detail: { kollektiv: selectedKollektiv } });
                    document.dispatchEvent(kollektivChangedEvent);
                }
            });
        });

        const kurzanleitungButton = document.getElementById('btn-kurzanleitung');
        if (kurzanleitungButton) {
            kurzanleitungButton.addEventListener('click', () => {
                const modalElement = document.getElementById('kurzanleitung-modal');
                const modalBody = modalElement?.querySelector('.modal-body');
                if (modalBody && UI_TEXTS?.kurzanleitung?.content) {
                    let content = UI_TEXTS.kurzanleitung.content;
                    content = content.replace(/{APP_VERSION}/g, APP_CONFIG.APP_VERSION);
                    content = content.replace(/{SIGNIFICANCE_LEVEL}/g, formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, 3, undefined, true));
                    modalBody.innerHTML = content; // Ensure HTML is rendered
                }
                const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
                if (modalInstance) modalInstance.show();
            });
        }
        updateKollektivButtons(state.getCurrentKollektiv());
        updateHeaderStats();
        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.initTooltips === 'function'){
            ui_helpers.initTooltips(document.body);
        }
    }

    return Object.freeze({
        setupGeneralEventHandlers,
        updateHeaderStats,
        updateKollektivButtons
    });

})();
