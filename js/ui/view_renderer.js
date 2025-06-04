const viewRenderer = (() => {
    let currentKollektiv = APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
    let currentData = [];
    let currentAppliedCriteria = {};
    let currentAppliedLogic = APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
    let bruteForceManagerInstance = null;

    function initialize(initialData, initialKollektiv, initialCriteria, initialLogic, bfManager) {
        currentData = initialData;
        currentKollektiv = initialKollektiv;
        currentAppliedCriteria = initialCriteria;
        currentAppliedLogic = initialLogic;
        bruteForceManagerInstance = bfManager;
        _updateAllDynamicCounts(currentData);
    }

    function _updateAllDynamicCounts(data) {
        if(!data) return;
        const gesamtCount = data.length;
        const direktOPCount = data.filter(p => p.therapie === 'direkt OP').length;
        const nRCTCount = data.filter(p => p.therapie === 'nRCT').length;
        ui_helpers.updateElementText('n-gesamt-count', gesamtCount);
        ui_helpers.updateElementText('n-direktop-count', direktOPCount);
        ui_helpers.updateElementText('n-nrct-count', nRCTCount);

        const kollektivButtons = document.querySelectorAll('header .btn-group[aria-label="Kollektiv Auswahl"] button[data-kollektiv]');
        kollektivButtons.forEach(btn => {
            const kollektiv = btn.dataset.kollektiv;
            let count = 0;
            if (kollektiv === 'Gesamt') count = gesamtCount;
            else if (kollektiv === 'direkt OP') count = direktOPCount;
            else if (kollektiv === 'nRCT') count = nRCTCount;
            
            const currentTitle = btn.getAttribute('data-bs-title');
            if (currentTitle) {
                const newTitle = currentTitle.replace(/N=\d+|N=\?/, `N=${count}`);
                btn.setAttribute('data-bs-title', newTitle);
                if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                    const tooltipInstance = bootstrap.Tooltip.getInstance(btn);
                    if (tooltipInstance) {
                        tooltipInstance.setContent({ '.tooltip-inner': newTitle });
                    }
                }
            }
        });
    }

    function renderTabContent(tabId, content, options = {}) {
        const tabPaneContentContainer = document.getElementById(tabId);
        if (!tabPaneContentContainer) {
            console.error(`renderTabContent: Tab-Container mit ID '${tabId}' nicht gefunden.`);
            return;
        }
        ui_helpers.updateElementHTML(tabPaneContentContainer.id, content);

        setTimeout(() => {
            if (options.afterRender && typeof options.afterRender === 'function') {
                options.afterRender();
            }
            ui_helpers.initializeTooltips(tabPaneContentContainer);
        }, 0);
    }

    function renderDatenTab() {
        const filteredData = dataTabLogic.getFilteredData ? dataTabLogic.getFilteredData(currentKollektiv) : currentData.filter(p => currentKollektiv === 'Gesamt' || p.therapie === currentKollektiv);
        const sortState = stateManager.getDatenTableSort();
        
        const tableHTML = uiComponents.createPatientenTableHTML(filteredData, sortState);
        const toggleButtonId = 'daten-toggle-details';
        const currentLang = (typeof stateManager !== 'undefined' && typeof stateManager.getCurrentPublikationLang === 'function') ? stateManager.getCurrentPublikationLang() : 'de';
        
        const toggleButtonText = UI_TEXTS?.datenTab?.toggleDetailsButton?.expand || (currentLang === 'de' ? 'Alle Details Anzeigen' : 'Expand All Details');
        const toggleButtonTooltip = TOOLTIP_CONTENT?.datenTable?.expandAll || (currentLang === 'de' ? 'Alle Details ein-/ausblenden' : 'Expand/collapse all details');

        let content = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="h4 mb-0">Patientenliste (${getKollektivDisplayName(currentKollektiv)}, N=${filteredData.length})</h2>
                <button class="btn btn-sm btn-outline-secondary" id="${toggleButtonId}" data-action="expand" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${toggleButtonTooltip}">
                    ${toggleButtonText} <i class="fas fa-chevron-down ms-1"></i>
                </button>
            </div>
            <div class="table-responsive">
                ${tableHTML}
            </div>`;
        renderTabContent('daten-tab-pane', content, {
            afterRender: () => {
                if (typeof dataTabEventHandlers !== 'undefined' && dataTabEventHandlers.register) {
                    dataTabEventHandlers.register();
                }
                const tableBodyElement = document.getElementById('daten-table-body');
                if (tableBodyElement) {
                    ui_helpers.attachRowCollapseListeners(tableBodyElement);
                }
                 _updateAllDynamicCounts(currentData);
            }
        });
    }

    function renderAuswertungTab(initialData, bruteForceManagerInstanceParam) {
        const currentAppliedCriteria = t2CriteriaManager.getAppliedCriteria();
        const currentAppliedLogic = t2CriteriaManager.getAppliedLogic();
        const controlsHTML = uiComponents.createT2CriteriaControls(currentAppliedCriteria, currentAppliedLogic);
        const bruteForceHTML = uiComponents.createBruteForceCard(currentKollektiv, bruteForceManagerInstanceParam && bruteForceManagerInstanceParam.isWorkerAvailable());
        
        const filteredData = auswertungTabLogic.getFilteredData ? auswertungTabLogic.getFilteredData(currentKollektiv) : initialData.filter(p => currentKollektiv === 'Gesamt' || p.therapie === currentKollektiv);
        const sortState = stateManager.getAuswertungTableSort();
        
        const tableHTML = uiComponents.createAuswertungTableHTML(filteredData, sortState, currentAppliedCriteria, currentAppliedLogic);
        const toggleButtonId = 'auswertung-toggle-details';
        const currentLang = (typeof stateManager !== 'undefined' && typeof stateManager.getCurrentPublikationLang === 'function') ? stateManager.getCurrentPublikationLang() : 'de';

        const toggleButtonText = UI_TEXTS?.auswertungTab?.toggleDetailsButton?.expand || (currentLang === 'de' ? 'Alle Details Anzeigen' : 'Expand All Details');
        const toggleButtonTooltip = TOOLTIP_CONTENT?.auswertungTable?.expandAll || (currentLang === 'de' ? 'Alle Details ein-/ausblenden' : 'Expand/collapse all details');

        let content = `
            <div class="row">
                <div class="col-lg-5 col-xl-4 mb-3 mb-lg-0">
                    ${controlsHTML}
                    ${bruteForceHTML}
                </div>
                <div class="col-lg-7 col-xl-8">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                             <h4 class="h5 mb-0">Auswertungstabelle (${getKollektivDisplayName(currentKollektiv)}, N=${filteredData.length})</h4>
                             <button class="btn btn-sm btn-outline-secondary" id="${toggleButtonId}" data-action="expand" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${toggleButtonTooltip}">
                                ${toggleButtonText} <i class="fas fa-chevron-down ms-1"></i>
                             </button>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive" id="auswertung-table-container">
                                ${tableHTML}
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        renderTabContent('auswertung-tab-pane', content, {
            afterRender: () => {
                if (typeof auswertungTabLogic !== 'undefined' && typeof auswertungTabLogic.initialize === 'function') {
                    auswertungTabLogic.initialize(initialData, bruteForceManagerInstanceParam);
                }
                if (typeof auswertungEventHandlers !== 'undefined' && auswertungEventHandlers.register) {
                    auswertungEventHandlers.register(bruteForceManagerInstanceParam);
                }
                if (typeof auswertungTabLogic !== 'undefined' && typeof auswertungTabLogic.refreshUI === 'function') {
                    auswertungTabLogic.refreshUI();
                }
                const tableBodyElement = document.getElementById('auswertung-table-body');
                if (tableBodyElement) {
                    ui_helpers.attachRowCollapseListeners(tableBodyElement);
                }
                 _updateAllDynamicCounts(currentData);
            }
        });
    }

    function renderStatistikTab(statsEinze, statsVergleich, layout, kollektiv1, kollektiv2, currentKollektivForContext) {
        const currentKollektiv = currentKollektivForContext || stateManager.getCurrentKollektiv();
        const layoutIsVergleich = layout === 'vergleich';
        const currentLang = stateManager.getCurrentPublikationLang();

        const buttonText = layoutIsVergleich ? (UI_TEXTS?.statistikTab?.layoutSwitchLabel?.vergleich || 'Vergleich Aktiv') : (UI_TEXTS?.statistikTab?.layoutSwitchLabel?.einzel || 'Einzelansicht Aktiv');
        const tooltipTextKey = layoutIsVergleich ? 'vergleich' : 'einzel';
        const tooltipText = (TOOLTIP_CONTENT?.statistikLayoutSwitch?.[tooltipTextKey] || (currentLang === 'de' ? 'Layout umschalten.' : 'Toggle layout.'));
        
        const kollektivOptions = dataProcessor.getAvailableTherapies().map(k => `<option value="${k}">${getKollektivDisplayName(k)}</option>`).join('');
        const allOptions = `<option value="Gesamt">${getKollektivDisplayName('Gesamt')}</option>${kollektivOptions}`;

        let content = `
            <div class="row mb-3 align-items-center">
                <div class="col-auto">
                    <button class="btn btn-sm ${layoutIsVergleich ? 'btn-primary' : 'btn-outline-primary'}" id="statistik-toggle-vergleich" aria-pressed="${layoutIsVergleich}" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true" data-bs-title="${tooltipText}">
                       ${buttonText}
                    </button>
                </div>
                <div class="col-auto ${layoutIsVergleich ? 'd-none' : ''}" id="statistik-kollektiv-select-einzel-container">
                    <div class="input-group input-group-sm">
                        <label class="input-group-text" for="statistik-kollektiv-select-einzel">${UI_TEXTS?.statistikTab?.kollektivSelectLabel || 'Kollektiv:'}</label>
                        <select class="form-select" id="statistik-kollektiv-select-einzel" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT?.statistikKollektivSelect?.einzel || 'Kollektiv für Einzelansicht wählen'}">
                            ${allOptions}
                        </select>
                    </div>
                </div>
                <div class="col-auto ${layoutIsVergleich ? '' : 'd-none'}" id="statistik-kollektiv-select-1-container">
                     <div class="input-group input-group-sm">
                        <label class="input-group-text" for="statistik-kollektiv-select-1">${UI_TEXTS?.statistikTab?.kollektivSelectLabel1 || 'Kollektiv 1:'}</label>
                        <select class="form-select" id="statistik-kollektiv-select-1" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT?.statistikKollektivSelect?.kollektiv1 || 'Erstes Kollektiv für Vergleich wählen'}">
                             ${allOptions}
                        </select>
                    </div>
                </div>
                <div class="col-auto ${layoutIsVergleich ? '' : 'd-none'}" id="statistik-kollektiv-select-2-container">
                     <div class="input-group input-group-sm">
                        <label class="input-group-text" for="statistik-kollektiv-select-2">${UI_TEXTS?.statistikTab?.kollektivSelectLabel2 || 'Kollektiv 2:'}</label>
                        <select class="form-select" id="statistik-kollektiv-select-2" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT?.statistikKollektivSelect?.kollektiv2 || 'Zweites Kollektiv für Vergleich wählen'}">
                            ${allOptions}
                        </select>
                    </div>
                </div>
            </div>
            <div id="statistik-content-area"></div>`;

        renderTabContent('statistik-tab-pane', content, {
            afterRender: () => {
                ui_helpers.updateStatistikSelectorsUI(layout, kollektiv1, kollektiv2);
                if (typeof statistikEventHandlers !== 'undefined' && statistikEventHandlers.register) {
                    statistikEventHandlers.register();
                }
                const statsContentArea = document.getElementById('statistik-content-area');
                if (statsContentArea) {
                    ui_helpers.updateElementHTML('statistik-content-area', _buildStatistikContent(statsEinze, statsVergleich, layout, kollektiv1, kollektiv2, currentKollektiv));
                    ui_helpers.initializeTooltips(statsContentArea);
                    if(layout === 'einzel' && statsEinze?.deskriptiv?.alter?.alterData && statsEinze?.deskriptiv?.geschlecht) {
                        chartRenderer.renderAgeDistributionChart(`chart-stat-age-0`, statsEinze.deskriptiv.alter.alterData, getKollektivDisplayName(currentKollektiv));
                        chartRenderer.renderGenderDistributionChart(`chart-stat-gender-0`, statsEinze.deskriptiv.geschlecht, getKollektivDisplayName(currentKollektiv));
                    }
                }
                _updateAllDynamicCounts(currentData);
            }
        });
    }

    function _buildStatistikContent(statsEinze, statsVergleich, layout, kollektiv1, kollektiv2, currentKollektivForContext) {
        let statistikHTML = '';
        const currentKollektiv = currentKollektivForContext || stateManager.getCurrentKollektiv();
        const t2Criteria = t2CriteriaManager.getAppliedCriteria();
        const t2Logic = t2CriteriaManager.getAppliedLogic();
        const t2ShortName = studyT2CriteriaManager.formatCriteriaForDisplay(t2Criteria, t2Logic, true);

        if (layout === 'einzel' && statsEinze) {
            const dlButtonsDeskriptiv = [{ id: 'export-deskriptiv-stats-md', icon: 'fab fa-markdown', tooltip: (TOOLTIP_CONTENT?.exportTab?.deskriptivMD?.description || 'Deskriptive Statistik als MD'), format: 'md' }];
            const dlButtonsGueteAS = [{ id: 'export-guete-as-md', icon: 'fab fa-markdown', tooltip: (TOOLTIP_CONTENT?.exportTab?.gueteASMD?.description || 'Güte (AS) als MD'), format: 'md' }];
            const dlButtonsGueteT2 = [{ id: 'export-guete-t2-md', icon: 'fab fa-markdown', tooltip: (TOOLTIP_CONTENT?.exportTab?.gueteT2MD?.description || 'Güte (T2) als MD').replace('[T2_SHORT_NAME]',t2ShortName), format: 'md' }];
            const dlButtonsVergleich = [{ id: 'export-vergleich-as-t2-md', icon: 'fab fa-markdown', tooltip: (TOOLTIP_CONTENT?.exportTab?.vergleichMD?.description || 'Vergleich AS vs. T2 als MD').replace('[T2_SHORT_NAME]',t2ShortName), format: 'md' }];
            const dlButtonsAsso = [{ id: 'export-assoziation-md', icon: 'fab fa-markdown', tooltip: (TOOLTIP_CONTENT?.exportTab?.assoziationMD?.description || 'Assoziationsanalyse als MD'), format: 'md' }];
            const dlButtonsKriterienVergleich = [{ id: 'export-kriterien-vergleich-md', icon: 'fab fa-markdown', tooltip: (TOOLTIP_CONTENT?.exportTab?.criteriaComparisonMD?.description || 'Kriterienvergleich als MD'), format: 'md' }];
            
            const deskriptivHTML = uiComponents.createDeskriptiveStatistikContentHTML(statsEinze, '0', currentKollektiv);
            const gueteASHTML = uiComponents.createGueteContentHTML(statsEinze.gueteAS, 'AS', currentKollektiv);
            const gueteT2HTML = uiComponents.createGueteContentHTML(statsEinze.gueteT2_angewandt, t2ShortName, currentKollektiv);
            const vergleichHTML = uiComponents.createVergleichContentHTML(statsEinze.vergleichASvsT2_angewandt, currentKollektiv, t2ShortName);
            const assoziationHTML = uiComponents.createAssoziationContentHTML(statsEinze.assoziationen, currentKollektiv, t2Criteria);
            const kriterienVergleichHTML = uiComponents.createCriteriaComparisonTableHTML(statsEinze.kriterienVergleich, currentKollektiv);

            statistikHTML += `<div class="row g-3">
                ${uiComponents.createStatistikCard('deskriptiv', 'Deskriptive Statistik', deskriptivHTML, true, 'deskriptiveStatistik', dlButtonsDeskriptiv, `table-deskriptiv-demographie-0`)}
                ${uiComponents.createStatistikCard('guete-as', 'Diagnostische Güte (AS vs. N)', gueteASHTML, false, 'diagnostischeGuete.cardTitleAS', dlButtonsGueteAS, `table-guete-metrics-AS-${currentKollektiv.replace(/\s+/g, '_')}`)}
                ${uiComponents.createStatistikCard('guete-t2', `Diagnostische Güte (${t2ShortName} vs. N)`, gueteT2HTML, false, 'diagnostischeGuete.cardTitleT2Angewandt', dlButtonsGueteT2, `table-guete-metrics-${t2ShortName.replace(/\s+/g, '_')}-${currentKollektiv.replace(/\s+/g, '_')}`)}
                ${uiComponents.createStatistikCard('vergleich-as-t2', `Statistischer Vergleich (AS vs. ${t2ShortName})`, vergleichHTML, false, 'vergleichASvsT2.cardTitle', dlButtonsVergleich, `table-vergleich-as-vs-t2-${currentKollektiv.replace(/\s+/g, '_')}`)}
                ${uiComponents.createStatistikCard('assoziation', 'Assoziationsanalyse (Merkmale vs. N)', assoziationHTML, false, 'assoziationMerkmal.cardTitle', dlButtonsAsso, `table-assoziation-${currentKollektiv.replace(/\s+/g, '_')}`)}
                ${uiComponents.createStatistikCard('kriterien-vergleich', 'Vergleich Kriteriensätze', kriterienVergleichHTML, false, 'criteriaComparisonTable', dlButtonsKriterienVergleich, 'table-kriterien-vergleich')}
             </div>`;
        } else if (layout === 'vergleich' && statsVergleich && kollektiv1 && kollektiv2) {
            const vergleichKollektiveHTML = uiComponents.createVergleichKollektiveContentHTML(statsVergleich, kollektiv1, kollektiv2);
            const dlButtonsKollVergleich = [{ id: 'export-vergleich-kollektive-md', icon: 'fab fa-markdown', tooltip: (TOOLTIP_CONTENT?.exportTab?.kollektivVergleichMD?.description || 'Kollektivvergleich als MD'), format: 'md' }];
            
            statistikHTML += `<div class="row g-3">
                ${uiComponents.createStatistikCard('vergleich-kollektive', `Vergleich ${getKollektivDisplayName(kollektiv1)} vs. ${getKollektivDisplayName(kollektiv2)}`, vergleichKollektiveHTML, false, 'kollektivVergleich', dlButtonsKollVergleich, `table-vergleich-kollektive-${kollektiv1.replace(/\s+/g, '_')}-vs-${kollektiv2.replace(/\s+/g, '_')}`)}
             </div>`;
        } else {
            statistikHTML = '<p class="text-muted p-3">Bitte wählen Sie eine Ansicht und/oder Kollektive aus.</p>';
        }
        return statistikHTML;
    }


    function renderPraesentationTab(view, presentationData, selectedStudyId = null, currentGlobalKollektiv = 'Gesamt') {
        const ttContextViewSelect = TOOLTIP_CONTENT.praesentationTabTooltips.viewSelect || {}; // Corrected path
        let viewSelectorHTML = `
            <div class="row mb-4">
                <div class="col-12 d-flex justify-content-center">
                    <div class="btn-group btn-group-sm" role="group" aria-label="Präsentationsansicht Auswahl" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true" data-bs-title="${ttContextViewSelect.description || 'Wählen Sie die Präsentationsansicht.'}">
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="ansicht-as-pur" autocomplete="off" value="as-pur" ${view === 'as-pur' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary praes-view-btn" for="ansicht-as-pur"><i class="fas fa-star me-1"></i> Avocado Sign (Performance)</label>
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="ansicht-as-vs-t2" value="as-vs-t2" autocomplete="off" ${view === 'as-vs-t2' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary praes-view-btn" for="ansicht-as-vs-t2"><i class="fas fa-exchange-alt me-1"></i> AS vs. T2 (Vergleich)</label>
                    </div>
                </div>
            </div>`;

        let contentHTML = '';
        if (view === 'as-pur') {
            contentHTML = _createPresentationView_ASPUR_HTML(presentationData);
        } else if (view === 'as-vs-t2') {
            contentHTML = _createPresentationView_ASvsT2_HTML(presentationData, selectedStudyId, currentGlobalKollektiv);
        } else {
            contentHTML = '<div class="alert alert-warning">Unbekannte Ansicht ausgewählt.</div>';
        }
        renderTabContent('praesentation-tab-pane', contentHTML, {
            afterRender: () => {
                if (typeof praesentationEventHandlers !== 'undefined' && praesentationEventHandlers.register) {
                    praesentationEventHandlers.register();
                }
                if (view === 'as-pur' && presentationData?.statsCurrentKollektiv?.matrix && (presentationData.patientCount > 0 || (presentationData.statsCurrentKollektiv.matrix.rp + presentationData.statsCurrentKollektiv.matrix.fp + presentationData.statsCurrentKollektiv.matrix.fn + presentationData.statsCurrentKollektiv.matrix.rn) > 0)) {
                     chartRenderer.renderASPerformanceBarChart('praes-as-pur-perf-chart', presentationData.statsCurrentKollektiv, getKollektivDisplayName(presentationData.kollektiv));
                } else if (view === 'as-vs-t2' && presentationData?.statsAS && presentationData?.statsT2 && presentationData.patientCountForComparison > 0) {
                     chartRenderer.renderASvsT2ComparisonBarChart('praes-comp-chart-container', presentationData.statsAS, presentationData.statsT2, presentationData.t2CriteriaLabelShort, getKollektivDisplayName(presentationData.kollektivForComparison));
                }
                _updateAllDynamicCounts(currentData);
            }
        });
    }

    function _createPresentationView_ASPUR_HTML(presentationData) {
        const { statsGesamt, statsDirektOP, statsNRCT, kollektiv, statsCurrentKollektiv, patientCount } = presentationData || {};
        const kollektives = ['Gesamt', 'direkt OP', 'nRCT'];
        const statsMap = { 'Gesamt': statsGesamt, 'direkt OP': statsDirektOP, 'nRCT': statsNRCT };
        const currentKollektivName = getKollektivDisplayName(kollektiv);
        const displayPatientCount = patientCount > 0 ? patientCount : (statsCurrentKollektiv?.matrix?.rp + statsCurrentKollektiv?.matrix?.fp + statsCurrentKollektiv?.matrix?.fn + statsCurrentKollektiv?.matrix?.rn) || 0;
        const hasDataForCurrent = !!(statsCurrentKollektiv && statsCurrentKollektiv.matrix && statsCurrentKollektiv.matrix.rp !== undefined && displayPatientCount > 0);

        const createPerfTableRow = (stats, kollektivKey) => {
            const kollektivDisplayName = getKollektivDisplayName(kollektivKey);
            const na = '--';
            const fCI_p = (m, k) => { const d = (k === 'auc'||k==='f1') ? 3 : 1; const p = !(k === 'auc'||k==='f1'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, na); };
            const getInterpretationTT = (mk, stData) => { return ui_helpers.getMetricInterpretationHTML(mk, stData, 'AS', kollektivDisplayName); };
            const ttContext = TOOLTIP_CONTENT.praesentation.asPurPerfTable || {};

            if (!stats || typeof stats.matrix !== 'object') {
                const nPatientsForThisKollektivData = (kollektivKey === 'Gesamt' ? presentationData.statsGesamt?.matrix : (kollektivKey === 'direkt OP' ? presentationData.statsDirektOP?.matrix : presentationData.statsNRCT?.matrix));
                const countN = nPatientsForThisKollektivData ? (nPatientsForThisKollektivData.rp + nPatientsForThisKollektivData.fp + nPatientsForThisKollektivData.fn + nPatientsForThisKollektivData.rn) : '?';
                return `<tr><td class="fw-bold" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ttContext.kollektiv || 'Kollektiv'}">${kollektivDisplayName} (N=${countN})</td><td colspan="6" class="text-muted text-center">Daten fehlen</td></tr>`;
            }
            const count = stats.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : 0;
            return `<tr>
                        <td class="fw-bold" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ttContext.kollektiv || 'Patientenkollektiv und dessen Größe (N).'}">${kollektivDisplayName} (N=${count})</td>
                        <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getInterpretationTT('sens', stats.sens)}">${fCI_p(stats.sens, 'sens')}</td>
                        <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getInterpretationTT('spez', stats.spez)}">${fCI_p(stats.spez, 'spez')}</td>
                        <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getInterpretationTT('ppv', stats.ppv)}">${fCI_p(stats.ppv, 'ppv')}</td>
                        <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getInterpretationTT('npv', stats.npv)}">${fCI_p(stats.npv, 'npv')}</td>
                        <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getInterpretationTT('acc', stats.acc)}">${fCI_p(stats.acc, 'acc')}</td>
                        <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getInterpretationTT('auc', stats.auc)}">${fCI_p(stats.auc, 'auc')}</td>
                    </tr>`;
        };

        const perfCSVTooltip = TOOLTIP_CONTENT.praesentation.downloadPerformanceCSV?.description || "Performance-Tabelle als CSV";
        const perfMDTooltip = TOOLTIP_CONTENT.praesentation.downloadPerformanceMD?.description || "Performance-Tabelle als Markdown";
        const tablePNGTooltip = TOOLTIP_CONTENT.praesentation.downloadTablePNG?.description || "Tabelle als PNG";
        const perfChartPNGTooltip = `Chart ('${currentKollektivName}') als PNG herunterladen.`;
        const perfChartSVGTooltip = `Chart ('${currentKollektivName}') als SVG (Vektorgrafik) herunterladen.`;
        const chartId = "praes-as-pur-perf-chart";
        const tableId = "praes-as-pur-perf-table";
        const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image':'fa-download';
        const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code':'fa-download';

        const tooltipKeys = ['kollektiv', 'sens', 'spez', 'ppv', 'npv', 'acc', 'auc'];
        let tableHeaderHTML = tooltipKeys.map((key, index) => {
            const label = index === 0 ? 'Kollektiv' : (key.charAt(0).toUpperCase() + key.slice(1) + '. (95% CI)');
            const tooltip = TOOLTIP_CONTENT.praesentation.asPurPerfTable?.[key] || ui_helpers.getMetricDescriptionHTML(key, 'AS') || '';
            return `<th data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltip}">${label}</th>`;
        }).join('');

        let tableHTML = `
            <div class="col-12">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>AS Performance vs. N für alle Kollektive</span>
                        <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="dl-${tableId}-png" data-table-id="${tableId}" data-table-name="Praes_AS_Perf_Uebersicht" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tablePNGTooltip}"><i class="fas fa-image"></i></button>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover table-sm small mb-0" id="${tableId}">
                                <thead class="small">
                                    <tr>${tableHeaderHTML}</tr>
                                </thead>
                                <tbody>${kollektives.map(k => createPerfTableRow(statsMap[k], k)).join('')}</tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer text-end p-1">
                        <button class="btn btn-sm btn-outline-secondary me-1" id="download-performance-as-pur-csv" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${perfCSVTooltip}"><i class="fas fa-file-csv me-1"></i>CSV</button>
                        <button class="btn btn-sm btn-outline-secondary" id="download-performance-as-pur-md" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${perfMDTooltip}"><i class="fab fa-markdown me-1"></i>MD</button>
                    </div>
                </div>
            </div>`;

        let chartHTML = `
            <div class="col-lg-8 offset-lg-2">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>Visualisierung Güte (AS vs. N) - Kollektiv: ${currentKollektivName}</span>
                        <span class="card-header-buttons">
                            <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="dl-${chartId}-png" data-chart-id="${chartId}" data-format="png" data-chart-name="AS_Performance_${currentKollektivName.replace(/\s+/g, '_')}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${perfChartPNGTooltip}"><i class="fas ${dlIconPNG}"></i></button>
                            <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="dl-${chartId}-svg" data-chart-id="${chartId}" data-format="svg" data-chart-name="AS_Performance_${currentKollektivName.replace(/\s+/g, '_')}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${perfChartSVGTooltip}"><i class="fas ${dlIconSVG}"></i></button>
                        </span>
                    </div>
                    <div class="card-body p-1">
                        <div id="${chartId}" class="praes-chart-container border rounded" style="min-height: 280px;" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="Balkendiagramm der diagnostischen Gütekriterien für Avocado Sign (AS) vs. pathologischen N-Status für das Kollektiv ${currentKollektivName}.">
                            ${hasDataForCurrent ? '' : `<p class="text-center text-muted p-3">Keine Daten für Chart (${currentKollektivName}).</p>`}
                        </div>
                    </div>
                </div>
            </div>`;

        return `<div class="row g-3"><div class="col-12"><h3 class="text-center mb-3">Diagnostische Güte - Avocado Sign</h3></div>${tableHTML}${chartHTML}</div>`;
    }

    function _createPresentationView_ASvsT2_HTML(presentationData, selectedStudyId = null, currentGlobalKollektiv = 'Gesamt') {
        const { statsAS, statsT2, vergleich, comparisonCriteriaSet, kollektivForComparison, patientCountForComparison, t2CriteriaLabelShort, t2CriteriaLabelFull } = presentationData || {};
        const displayKollektivForComparison = getKollektivDisplayName(kollektivForComparison);
        const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
        const appliedName = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME || "Eingestellte Kriterien";
        const t2ShortNameEffective = t2CriteriaLabelShort || (comparisonCriteriaSet?.displayShortName || 'T2');

        let comparisonBasisName = "N/A";
        let comparisonInfoHTML = '<p class="text-muted small">Bitte wählen Sie eine Vergleichsbasis für die T2-Kriterien.</p>';
        const ttContextBasisInfo = TOOLTIP_CONTENT.praesentation.t2BasisInfoCard || {};

        if (selectedStudyId && comparisonCriteriaSet) {
            const studyInfo = comparisonCriteriaSet.studyInfo;
            comparisonBasisName = comparisonCriteriaSet.displayShortName || comparisonCriteriaSet.name || (isApplied ? appliedName : selectedStudyId);
            let criteriaHTML = '<span class="text-muted">Keine Kriteriendetails verfügbar.</span>';

            if (comparisonCriteriaSet.id === 'rutegard_et_al_esgar' && studyInfo?.keyCriteriaSummary) {
                 criteriaHTML = studyInfo.keyCriteriaSummary;
            } else if (comparisonCriteriaSet.criteria) {
                 criteriaHTML = studyT2CriteriaManager.formatCriteriaForDisplay(comparisonCriteriaSet.criteria, comparisonCriteriaSet.logic, false);
                 if (criteriaHTML === 'Keine aktiven Kriterien' && comparisonCriteriaSet.logic) criteriaHTML += ` (Logik: ${UI_TEXTS.t2LogicDisplayNames[comparisonCriteriaSet.logic] || comparisonCriteriaSet.logic})`;
                 else if (criteriaHTML !== 'Keine aktiven Kriterien' && comparisonCriteriaSet.logic && comparisonCriteriaSet.logic !== 'KOMBINIERT') criteriaHTML = `<strong>Logik:</strong> ${UI_TEXTS.t2LogicDisplayNames[comparisonCriteriaSet.logic] || comparisonCriteriaSet.logic}<br><strong>Regel(n):</strong> ${criteriaHTML}`;
            }

            comparisonInfoHTML = `<dl class="row small mb-0">
                                    <dt class="col-sm-4" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(ttContextBasisInfo.reference || 'Quelle/Publikation der Kriterien.')}">${ttContextBasisInfo.reference ? 'Referenz:' : 'Referenz:'}</dt><dd class="col-sm-8">${studyInfo?.reference || (isApplied ? 'Benutzerdefiniert (aktuell im Auswertungstab eingestellt)' : 'N/A')}</dd>
                                    <dt class="col-sm-4" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(ttContextBasisInfo.patientCohort || 'Ursprüngliche Studienkohorte bzw. aktuelles Vergleichskollektiv.')}">${ttContextBasisInfo.patientCohort ? 'Orig.-Kohorte / Vergleichsbasis:' : 'Orig.-Kohorte / Vergleichsbasis:'}</dt><dd class="col-sm-8">${studyInfo?.patientCohort || `Aktuell: ${displayKollektivForComparison} (N=${patientCountForComparison || '?'})`}</dd>
                                    <dt class="col-sm-4" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(ttContextBasisInfo.investigationType || 'Art der Untersuchung in der Originalstudie (z.B. Primärstaging).')}">${ttContextBasisInfo.investigationType ? 'Untersuchungstyp:' : 'Untersuchungstyp:'}</dt><dd class="col-sm-8">${studyInfo?.investigationType || 'N/A'}</dd>
                                    <dt class="col-sm-4" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(ttContextBasisInfo.focus || 'Hauptfokus der Originalstudie bzgl. dieser Kriterien.')}">${ttContextBasisInfo.focus ? 'Studienfokus:' : 'Studienfokus:'}</dt><dd class="col-sm-8">${studyInfo?.focus || 'N/A'}</dd>
                                    <dt class="col-sm-4" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(ttContextBasisInfo.keyCriteriaSummary || 'Zusammenfassung der angewendeten T2-Kriterien und deren Logik.')}">${ttContextBasisInfo.keyCriteriaSummary ? 'Kriterien:' : 'Kriterien:'}</dt><dd class="col-sm-8">${criteriaHTML}</dd>
                                </dl>`;
        }

        const studySets = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.getAllStudyCriteriaSets() : [];
        const appliedOptionHTML = `<option value="${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID}" ${isApplied ? 'selected' : ''}>-- ${appliedName} --</option>`;
        const studyOptionsHTML = studySets.map(set => `<option value="${set.id}" ${selectedStudyId === set.id ? 'selected' : ''}>${set.name || set.id}</option>`).join('');

        let resultsHTML = '';
        const canDisplayResults = !!(selectedStudyId && presentationData && statsAS && statsT2 && vergleich && comparisonCriteriaSet && patientCountForComparison > 0);
        const na = '--';
        const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image':'fa-download';
        const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code':'fa-download';
        const ttContextStudySelect = TOOLTIP_CONTENT.praesentationTabTooltips.studySelect || {}; // Corrected path

        if (canDisplayResults) {
            const fPVal = (r,d=3) => { const p = r?.pValue; return (p !== null && !isNaN(p)) ? (p < 0.001 ? '&lt;0.001' : formatNumber(p, d, na)) : na; };
            const perfCSV = TOOLTIP_CONTENT.praesentation.downloadPerformanceCSV?.description || "Vergleichs-Performance-Tabelle als CSV";
            const compTableMD = TOOLTIP_CONTENT.praesentation.downloadCompTableMD?.description || "Vergleichs-Metriken als Markdown";
            const testsMD = TOOLTIP_CONTENT.praesentation.downloadCompTestsMD?.description || "Statistische Vergleichstests als Markdown";

            const chartPNG = TOOLTIP_CONTENT.praesentation.downloadCompChartPNG?.description || `Chart (AS vs. ${t2ShortNameEffective}) als PNG`;
            const chartSVG = TOOLTIP_CONTENT.praesentation.downloadCompChartSVG?.description || `Chart (AS vs. ${t2ShortNameEffective}) als SVG`;
            const tablePNG = TOOLTIP_CONTENT.praesentation.downloadTablePNG?.description || "Tabelle als PNG";
            const compTablePNG = TOOLTIP_CONTENT.praesentation.downloadCompTablePNG?.description || `Vergleichs-Metrik-Tabelle (AS vs. ${t2ShortNameEffective}) als PNG`;

            const compTitle = `Stat. Vergleich (AS vs. ${t2ShortNameEffective})`;
            const perfTitle = `Vergleich Metriken (AS vs. ${t2ShortNameEffective})`;
            const chartTitle = `Vergleichs-Chart (AS vs. ${t2ShortNameEffective})`;
            const perfTableId = "praes-as-vs-t2-comp-table";
            const testTableId = "praes-as-vs-t2-test-table";
            const infoCardId = "praes-t2-basis-info-card";
            const chartContainerId = "praes-comp-chart-container";
            const chartBaseName = `AS_vs_${(comparisonCriteriaSet?.id || selectedStudyId || 'T2').replace(/\s+/g, '_')}_Koll_${displayKollektivForComparison.replace(/\s+/g, '_')}`;
            const ttContextStudySelect = TOOLTIP_CONTENT.praesentationTabTooltips.studySelect || {};

            let comparisonTableHTML = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0" id="${perfTableId}"><thead class="small"><tr><th data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(ttContextPerfTable.metric || 'Diagnostische Metrik.')}">Metrik</th><th data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(ttContextPerfTable.asValue || 'Wert für Avocado Sign (AS).')}">AS (Wert, 95% CI)</th><th data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(ttContextPerfTable.t2Value || 'Wert für die ausgewählte T2-Basis.').replace('[T2_SHORT_NAME]', `<strong>${t2ShortNameEffective}</strong>`)}">${t2ShortNameEffective} (Wert, 95% CI)</th></tr></thead><tbody>`;
            const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
            const metricNames = { sens: 'Sensitivität', spez: 'Spezifität', ppv: 'PPV', npv: 'NPV', acc: 'Accuracy', balAcc: 'Bal. Accuracy', f1: 'F1-Score', auc: 'AUC' };
            metrics.forEach(key => {
                 const isRate = !(key === 'f1' || key === 'auc'); const digits = isRate ? 1 : 3;
                 const valAS = formatCI(statsAS[key]?.value, statsAS[key]?.ci?.lower, statsAS[key]?.ci?.upper, digits, isRate, na);
                 const valT2 = formatCI(statsT2[key]?.value, statsT2[key]?.ci?.lower, statsT2[key]?.ci?.upper, digits, isRate, na);
                 const tooltipDesc = ui_helpers.getMetricDescriptionHTML(key, 'Wert');
                 const tooltipAS = ui_helpers.getMetricInterpretationHTML(key, statsAS[key], 'AS', displayKollektivForComparison);
                 const tooltipT2 = ui_helpers.getMetricInterpretationHTML(key, statsT2[key], t2ShortNameEffective, displayKollektivForComparison);
                 comparisonTableHTML += `<tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltipDesc}">${metricNames[key]}</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltipAS}">${valAS}</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltipT2}">${valT2}</td></tr>`;
            });
            comparisonTableHTML += `</tbody></table></div>`;
            const compTableDownloadBtns = [ {id: `dl-${perfTableId}-png`, icon: 'fa-image', tooltip: compTablePNG, format: 'png', tableId: perfTableId, tableName: `Praes_ASvsT2_Metrics_${(comparisonCriteriaSet?.id || selectedStudyId || 'T2').replace(/\s+/g, '_')}`} ];
            const comparisonTableCardHTML = uiComponents.createStatistikCard(perfTableId+'_card', perfTitle, comparisonTableHTML, false, 'praesentation.comparisonTableCard', compTableDownloadBtns, perfTableId);

            let testsTableHTML = `<table class="table table-sm table-striped small mb-0" id="${testTableId}"><thead class="small visually-hidden"><tr><th>Test</th><th>Statistik</th><th>p-Wert</th><th>Methode</th></tr></thead><tbody>`;
            const mcNemarDesc = ui_helpers.getTestDescriptionHTML('mcnemar', t2ShortNameEffective);
            const mcNemarInterp = ui_helpers.getTestInterpretationHTML('mcnemar', vergleich?.mcnemar, displayKollektivForComparison, t2ShortNameEffective);
            const delongDesc = ui_helpers.getTestDescriptionHTML('delong', t2ShortNameEffective);
            const delongInterp = ui_helpers.getTestInterpretationHTML('delong', vergleich?.delong, displayKollektivForComparison, t2ShortNameEffective);
            testsTableHTML += `<tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${mcNemarDesc}">McNemar (Acc)</td><td>${formatNumber(vergleich?.mcnemar?.statistic, 3, '--')} (df=${vergleich?.mcnemar?.df || '--'})</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${mcNemarInterp}"> ${fPVal(vergleich?.mcnemar)} ${getStatisticalSignificanceSymbol(vergleich?.mcnemar?.pValue)}</td><td class="text-muted">${vergleich?.mcnemar?.method || '--'}</td></tr>`;
            testsTableHTML += `<tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${delongDesc}">DeLong (AUC)</td><td>Z=${formatNumber(vergleich?.delong?.Z, 3, '--')}</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${delongInterp}"> ${fPVal(vergleich?.delong)} ${getStatisticalSignificanceSymbol(vergleich?.delong?.pValue)}</td><td class="text-muted">${vergleich?.delong?.method || '--'}</td></tr>`;
            testsTableHTML += `</tbody></table>`;
            const testTableDownloadBtns = [ {id: `dl-${testTableId}-png`, icon: 'fa-image', tooltip: tablePNG, format: 'png', tableId: testTableId, tableName: `Praes_ASvsT2_Tests_${(comparisonCriteriaSet?.id || selectedStudyId || 'T2').replace(/\s+/g, '_')}`} ];
            const testsCardHTML = uiComponents.createStatistikCard(testTableId+'_card', compTitle, testsTableHTML, false, null, testTableDownloadBtns, testTableId);

            resultsHTML = `
                <div class="row g-3 presentation-comparison-row">
                     <div class="col-lg-7 col-xl-7 presentation-comparison-col-left">
                        <div class="card h-100">
                             <div class="card-header d-flex justify-content-between align-items-center">
                                 <span>${chartTitle}</span>
                                 <span class="card-header-buttons">
                                     <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="download-chart-as-vs-t2-png" data-chart-id="${chartContainerId}" data-format="png" data-chart-name="${chartBaseName}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${chartPNG}"><i class="fas ${dlIconPNG}"></i></button>
                                     <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="download-chart-as-vs-t2-svg" data-chart-id="${chartContainerId}" data-format="svg" data-chart-name="${chartBaseName}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${chartSVG}"><i class="fas ${dlIconSVG}"></i></button>
                                 </span>
                             </div>
                            <div class="card-body p-1 d-flex align-items-center justify-content-center">
                                 <div id="${chartContainerId}" class="praes-chart-container w-100" style="min-height: 300px;" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="Balkendiagramm: Vergleich der Gütekriterien (AS vs. ${t2ShortNameEffective}) für Kollektiv ${displayKollektivForComparison}.">
                                     <p class="text-muted small text-center p-3">Lade Vergleichschart...</p>
                                 </div>
                            </div>
                             <div class="card-footer text-end p-1">
                                <button class="btn btn-sm btn-outline-secondary me-1" id="download-performance-as-vs-t2-csv" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${perfCSV}"><i class="fas fa-file-csv me-1"></i>Tabelle (CSV)</button>
                                <button class="btn btn-sm btn-outline-secondary" id="download-comp-table-as-vs-t2-md" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${compTableMD}"><i class="fab fa-markdown me-1"></i>Metriken (MD)</button>
                           </div>
                        </div>
                    </div>
                    <div class="col-lg-5 col-xl-5 presentation-comparison-col-right d-flex flex-column">
                         <div class="card mb-3 flex-shrink-0 praes-t2-basis-info-card" id="${infoCardId}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(ttContextBasisInfo.description || 'Details zur ausgewählten T2-Vergleichsbasis und dem aktuellen Vergleichskollektiv.')}">
                            <div class="card-header card-header-sm">${ttContextBasisInfo.title || 'Details zur T2-Vergleichsbasis'}</div>
                            <div class="card-body p-2">${comparisonInfoHTML}</div>
                         </div>
                         <div class="card mb-3 flex-grow-0">
                             ${comparisonTableCardHTML}
                         </div>
                         <div class="card flex-grow-1">
                              ${testsCardHTML}
                             <div class="card-footer text-end p-1">
                                <button class="btn btn-sm btn-outline-secondary" id="download-tests-as-vs-t2-md" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${testsMD}"><i class="fab fa-markdown me-1"></i>Tests (MD)</button>
                            </div>
                         </div>
                    </div>
                </div>`;
        } else if (selectedStudyId && presentationData && patientCountForComparison === 0) {
            resultsHTML = `<div class="alert alert-warning">Keine Patientendaten für Kollektiv (<strong>${displayKollektivForComparison}</strong>) für diesen Vergleich vorhanden.</div>`;
        } else if (selectedStudyId && !comparisonCriteriaSet) {
            resultsHTML = `<div class="alert alert-danger">Fehler: Vergleichs-Kriterien (ID: ${selectedStudyId}) nicht gefunden.</div>`;
        } else {
            resultsHTML = `<div class="alert alert-info">Bitte wählen Sie oben eine Vergleichsbasis für das Kollektiv '<strong>${displayKollektivForComparison}</strong>'.</div>`;
        }
        const displayGlobalKollektivForContext = getKollektivDisplayName(currentGlobalKollektiv);
        const kollektivHinweis = (kollektivForComparison !== currentGlobalKollektiv)
            ? `(Globales Kollektiv: <strong>${displayGlobalKollektivForContext}</strong>. T2-Vergleichsbasis evaluiert auf <strong>${displayKollektivForComparison}</strong>, N=${patientCountForComparison || '?'}).`
            : `(N=${patientCountForComparison || '?'})`;


        return `<div class="row mb-4"><div class="col-12"><h4 class="text-center mb-1">Vergleich: Avocado Sign vs. T2-Kriterien</h4><p class="text-center text-muted small mb-3">Aktuelles Vergleichskollektiv: <strong>${displayKollektivForComparison}</strong> ${kollektivHinweis}</p><div class="row justify-content-center"><div class="col-md-9 col-lg-7" id="praes-study-select-container"><div class="input-group input-group-sm"><label class="input-group-text" for="praes-study-select">T2-Vergleichsbasis:</label><select class="form-select" id="praes-study-select" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true" data-bs-title="${ttContextStudySelect.description || 'Wählen Sie ein T2-Kriterienset für den Vergleich.'}"><option value="" ${!selectedStudyId ? 'selected' : ''} disabled>-- Bitte wählen --</option>${appliedOptionHTML}<option value="" disabled>--- Publizierte Kriterien ---</option>${studyOptionsHTML}</select></div><div id="praes-study-description" class="mt-2 small text-muted">${comparisonBasisName === 'N/A' ? 'Keine Basis gewählt' : `Aktuelle T2 Basis: <strong>${comparisonBasisName}</strong>`}</div></div></div></div></div><div id="praesentation-as-vs-t2-results">${resultsHTML}</div>`;
    }

    function renderPublikationTab() {
        const content = uiComponents.createPublikationTabHeader();
        renderTabContent('publikation-tab-pane', content, {
             afterRender: () => {
                if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.initializeData === 'function') {
                    publikationTabLogic.initializeData(
                        dataProcessor.getRawData(),
                        t2CriteriaManager.getAppliedCriteria(),
                        t2CriteriaManager.getAppliedLogic(),
                        bruteForceManager.getAllStoredResults()
                    );
                }
                if (typeof publikationEventHandlers !== 'undefined' && typeof publikationEventHandlers.register === 'function') {
                    publikationEventHandlers.register();
                }
                if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.handlePublikationSettingsChange === 'function') {
                    mainAppInterface.handlePublikationSettingsChange();
                }
                 _updateAllDynamicCounts(currentData);
            }
        });
    }

    function renderExportTab(currentKollektivForContext) {
        const currentKollektivToUse = currentKollektivForContext || stateManager.getCurrentKollektiv();
        const content = uiComponents.createExportOptions(currentKollektivToUse);
        renderTabContent('export-tab-pane', content, {
            afterRender: () => {
                if (typeof exportEventHandlers !== 'undefined' && exportEventHandlers.register) {
                    exportEventHandlers.register();
                }
                _updateAllDynamicCounts(currentData);
            }
        });
    }

    function updateData(newData) {
        currentData = newData;
        _updateAllDynamicCounts(currentData);
    }

    function updateKollektiv(newKollektiv) {
        currentKollektiv = newKollektiv;
        _updateAllDynamicCounts(currentData);
    }
    
    function updateAppliedCriteria(newCriteria, newLogic) {
        currentAppliedCriteria = newCriteria;
        currentAppliedLogic = newLogic;
    }


    return Object.freeze({
        initialize,
        renderDatenTab,
        renderAuswertungTab,
        renderStatistikTab,
        renderPraesentationTab,
        renderPublikationTab,
        renderExportTab,
        updateData,
        updateKollektiv,
        updateAppliedCriteria,
        renderTabContent 
    });
})();

window.viewRenderer = viewRenderer;
