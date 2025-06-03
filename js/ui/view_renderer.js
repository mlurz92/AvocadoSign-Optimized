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
                const tooltipInstance = bootstrap.Tooltip.getInstance(btn);
                if (tooltipInstance) {
                    tooltipInstance.setContent({ '.tooltip-inner': newTitle });
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
        ui_helpers.updateElementHTML(tabId, content);

        if (options.afterRender && typeof options.afterRender === 'function') {
            options.afterRender();
        }
        ui_helpers.initializeTooltips(tabPaneContentContainer);
        if (typeof generalEventHandlers !== 'undefined' && typeof generalEventHandlers.attachCommonEventListeners === 'function') {
            generalEventHandlers.attachCommonEventListeners(tabPaneContentContainer);
        }
    }

    function renderDatenTab() {
        const filteredData = dataTabLogic.getFilteredData ? dataTabLogic.getFilteredData(currentKollektiv, currentData) : currentData.filter(p => currentKollektiv === 'Gesamt' || p.therapie === currentKollektiv);
        const sortState = stateManager.getDatenTableSort() || cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT);
        const tableHTML = dataTabLogic.createDatenTableHTML(filteredData, sortState);
        const toggleButtonId = 'daten-toggle-details';
        const currentLang = stateManager.getCurrentPublikationLang() || 'de';
        const toggleButtonText = UI_TEXTS.datenTab.toggleDetailsButton.expand || (currentLang === 'de' ? 'Alle Details Anzeigen' : 'Expand All Details');
        const toggleButtonTooltip = TOOLTIP_CONTENT.datenTable.expandAll || (currentLang === 'de' ? 'Alle Details ein-/ausblenden' : 'Expand/collapse all details');

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
                if (typeof dataTabEventHandlers !== 'undefined' && dataTabEventHandlers.attachDatenTableEventListeners) {
                    dataTabEventHandlers.attachDatenTableEventListeners(filteredData, sortState);
                }
                const tableBodyElement = document.getElementById('daten-table-body');
                if (tableBodyElement) {
                    ui_helpers.attachRowCollapseListeners(tableBodyElement);
                }
                 _updateAllDynamicCounts(currentData);
            }
        });
    }

    function renderAuswertungTab(initialData, bruteForceManagerInstance) {
        const currentAppliedCriteria = t2CriteriaManager.getAppliedCriteria();
        const currentAppliedLogic = t2CriteriaManager.getAppliedLogic();
        const controlsHTML = uiComponents.createT2CriteriaControls(currentAppliedCriteria, currentAppliedLogic);
        const bruteForceHTML = uiComponents.createBruteForceCard(currentKollektiv, bruteForceManagerInstance && bruteForceManagerInstance.isWorkerAvailable());
        
        const filteredData = auswertungTabLogic.getFilteredData ? auswertungTabLogic.getFilteredData(currentKollektiv, initialData) : initialData.filter(p => currentKollektiv === 'Gesamt' || p.therapie === currentKollektiv);
        const sortState = stateManager.getAuswertungTableSort() || cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT);
        
        if (!window.auswertungTableConfig && typeof initializeAuswertungTableConfig === "function") {
             initializeAuswertungTableConfig();
        }
        const tableHTML = auswertungTableConfig.createTableHTML(filteredData, sortState, currentAppliedCriteria, currentAppliedLogic);
        const toggleButtonId = 'auswertung-toggle-details';
        const currentLang = stateManager.getCurrentPublikationLang() || 'de';
        const toggleButtonText = UI_TEXTS.auswertungTab.toggleDetailsButton.expand || (currentLang === 'de' ? 'Alle Details Anzeigen' : 'Expand All Details');
        const toggleButtonTooltip = TOOLTIP_CONTENT.auswertungTable.expandAll || (currentLang === 'de' ? 'Alle Details ein-/ausblenden' : 'Expand/collapse all details');

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
                if (typeof auswertungEventHandlers !== 'undefined' && auswertungEventHandlers.attachAuswertungEventListeners) {
                    auswertungEventHandlers.attachAuswertungEventListeners(initialData, bruteForceManagerInstance);
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
        const currentKollektiv = currentKollektivForContext || stateManager.getCurrentKollektiv() || APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
        const layoutIsVergleich = layout === 'vergleich';
        const currentLang = stateManager.getCurrentPublikationLang() || 'de';
        const buttonText = layoutIsVergleich ? (UI_TEXTS.statistikTab.layoutSwitchLabel.vergleich || 'Vergleich Aktiv') : (UI_TEXTS.statistikTab.layoutSwitchLabel.einzel || 'Einzelansicht Aktiv');
        const tooltipTextKey = layoutIsVergleich ? 'vergleich' : 'einzel';
        const tooltipText = (TOOLTIP_CONTENT.statistikLayoutSwitch?.[tooltipTextKey] || (currentLang === 'de' ? 'Layout umschalten.' : 'Toggle layout.'));
        
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
                        <label class="input-group-text" for="statistik-kollektiv-select-einzel">${UI_TEXTS.statistikTab.kollektivSelectLabel}</label>
                        <select class="form-select" id="statistik-kollektiv-select-einzel" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.statistikTab.kollektivSelectEinzel.description}">
                            ${allOptions}
                        </select>
                    </div>
                </div>
                <div class="col-auto ${layoutIsVergleich ? '' : 'd-none'}" id="statistik-kollektiv-select-1-container">
                     <div class="input-group input-group-sm">
                        <label class="input-group-text" for="statistik-kollektiv-select-1">${UI_TEXTS.statistikTab.kollektivSelectLabel1}</label>
                        <select class="form-select" id="statistik-kollektiv-select-1" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.statistikTab.kollektivSelect1.description}">
                             ${allOptions}
                        </select>
                    </div>
                </div>
                <div class="col-auto ${layoutIsVergleich ? '' : 'd-none'}" id="statistik-kollektiv-select-2-container">
                     <div class="input-group input-group-sm">
                        <label class="input-group-text" for="statistik-kollektiv-select-2">${UI_TEXTS.statistikTab.kollektivSelectLabel2}</label>
                        <select class="form-select" id="statistik-kollektiv-select-2" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.statistikTab.kollektivSelect2.description}">
                            ${allOptions}
                        </select>
                    </div>
                </div>
            </div>
            <div id="statistik-content-area"></div>`;

        renderTabContent('statistik-tab-pane', content, {
            afterRender: () => {
                ui_helpers.updateStatistikSelectorsUI(layout, kollektiv1, kollektiv2);
                if (typeof statistikEventHandlers !== 'undefined' && statistikEventHandlers.attachStatistikEventListeners) {
                    statistikEventHandlers.attachStatistikEventListeners(statsEinze, statsVergleich);
                }
                const statsContentArea = document.getElementById('statistik-content-area');
                if (statsContentArea) {
                    ui_helpers.updateElementHTML('statistik-content-area', _buildStatistikContent(statsEinze, statsVergleich, layout, kollektiv1, kollektiv2, currentKollektiv));
                    ui_helpers.initializeTooltips(statsContentArea);
                    if(layout === 'einzel' && statsEinze?.deskriptiv?.alter?.verteilung && statsEinze?.deskriptiv?.geschlecht?.verteilung) {
                        chartRenderer.renderAgeDistributionChart(`chart-stat-age-0`, statsEinze.deskriptiv.alter.verteilung, getKollektivDisplayName(currentKollektiv));
                        chartRenderer.renderGenderDistributionChart(`chart-stat-gender-0`, statsEinze.deskriptiv.geschlecht.verteilung, getKollektivDisplayName(currentKollektiv));
                    }
                }
                _updateAllDynamicCounts(currentData);
            }
        });
    }

    function _buildStatistikContent(statsEinze, statsVergleich, layout, kollektiv1, kollektiv2, currentKollektivForContext) {
        let statistikHTML = '';
        const currentKollektiv = currentKollektivForContext || stateManager.getCurrentKollektiv() || APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
        const t2Criteria = t2CriteriaManager.getAppliedCriteria();
        const t2Logic = t2CriteriaManager.getAppliedLogic();
        const t2ShortName = studyT2CriteriaManager.formatCriteriaForDisplay(t2Criteria, t2Logic, true);

        if (layout === 'einzel' && statsEinze) {
            const dlButtonsDeskriptiv = [{ id: 'export-deskriptiv-stats-md', icon: 'fab fa-markdown', tooltip: (TOOLTIP_CONTENT.exportTab.deskriptivMD?.descriptionStatsTab || 'Deskriptive Statistik als MD'), format: 'md' }];
            const dlButtonsGueteAS = [{ id: 'export-guete-as-md', icon: 'fab fa-markdown', tooltip: (TOOLTIP_CONTENT.exportTab.gueteASMD?.description || 'Güte (AS) als MD'), format: 'md' }];
            const dlButtonsGueteT2 = [{ id: 'export-guete-t2-md', icon: 'fab fa-markdown', tooltip: (TOOLTIP_CONTENT.exportTab.gueteT2MD?.description || 'Güte (T2) als MD').replace('[T2_SHORT_NAME]',t2ShortName), format: 'md' }];
            const dlButtonsVergleich = [{ id: 'export-vergleich-as-t2-md', icon: 'fab fa-markdown', tooltip: (TOOLTIP_CONTENT.exportTab.vergleichMD?.description || 'Vergleich AS vs. T2 als MD').replace('[T2_SHORT_NAME]',t2ShortName), format: 'md' }];
            const dlButtonsAsso = [{ id: 'export-assoziation-md', icon: 'fab fa-markdown', tooltip: (TOOLTIP_CONTENT.exportTab.assoziationMD?.description || 'Assoziationsanalyse als MD'), format: 'md' }];
            const dlButtonsKriterienVergleich = [{ id: 'export-kriterien-vergleich-md', icon: 'fab fa-markdown', tooltip: (TOOLTIP_CONTENT.exportTab.criteriaComparisonMD?.description || 'Kriterienvergleich als MD'), format: 'md' }];
            
            const deskriptivHTML = statistikTabLogic.createDeskriptiveStatistikContentHTML(statsEinze, '0', currentKollektiv);
            const gueteASHTML = statistikTabLogic.createGueteContentHTML(statsEinze.as, 'AS', currentKollektiv);
            const gueteT2HTML = statistikTabLogic.createGueteContentHTML(statsEinze.t2, t2ShortName, currentKollektiv);
            const vergleichHTML = statistikTabLogic.createVergleichContentHTML(statsEinze.vergleich_as_t2, currentKollektiv, t2ShortName);
            const assoziationHTML = statistikTabLogic.createAssoziationContentHTML(statsEinze.assoziationen, currentKollektiv, t2Criteria);
            const kriterienVergleichHTML = statistikTabLogic.createCriteriaComparisonTableHTML(statsEinze.kriterienVergleich, currentKollektiv);

            statistikHTML += `<div class="row g-3">
                ${uiComponents.createStatistikCard('deskriptiv', 'Deskriptive Statistik', deskriptivHTML, true, 'deskriptiveStatistik', dlButtonsDeskriptiv, `table-deskriptiv-demographie-0`)}
                ${uiComponents.createStatistikCard('guete-as', 'Diagnostische Güte (AS vs. N)', gueteASHTML, false, 'guetekriterien.as', dlButtonsGueteAS, `table-guete-metrics-AS-${currentKollektiv.replace(/\s+/g, '_')}`)}
                ${uiComponents.createStatistikCard('guete-t2', `Diagnostische Güte (${t2ShortName} vs. N)`, gueteT2HTML, false, 'guetekriterien.t2', dlButtonsGueteT2, `table-guete-metrics-${t2ShortName.replace(/\s+/g, '_')}-${currentKollektiv.replace(/\s+/g, '_')}`)}
                ${uiComponents.createStatistikCard('vergleich-as-t2', `Statistischer Vergleich (AS vs. ${t2ShortName})`, vergleichHTML, false, 'vergleichTests', dlButtonsVergleich, `table-vergleich-as-vs-t2-${currentKollektiv.replace(/\s+/g, '_')}`)}
                ${uiComponents.createStatistikCard('assoziation', 'Assoziationsanalyse (Merkmale vs. N)', assoziationHTML, false, 'assoziationsanalyse', dlButtonsAsso, `table-assoziation-${currentKollektiv.replace(/\s+/g, '_')}`)}
                ${uiComponents.createStatistikCard('kriterien-vergleich', 'Vergleich Kriteriensätze', kriterienVergleichHTML, false, 'criteriaComparisonTable.cardTitle', dlButtonsKriterienVergleich, 'table-kriterien-vergleich')}
             </div>`;
        } else if (layout === 'vergleich' && statsVergleich && kollektiv1 && kollektiv2) {
            const vergleichKollektiveHTML = statistikTabLogic.createVergleichKollektiveContentHTML(statsVergleich, kollektiv1, kollektiv2);
            const dlButtonsKollVergleich = [{ id: 'export-vergleich-kollektive-md', icon: 'fab fa-markdown', tooltip: (TOOLTIP_CONTENT.exportTab.kollektivVergleichMD?.description || 'Kollektivvergleich als MD'), format: 'md' }];
            
            statistikHTML += `<div class="row g-3">
                ${uiComponents.createStatistikCard('vergleich-kollektive', `Vergleich ${getKollektivDisplayName(kollektiv1)} vs. ${getKollektivDisplayName(kollektiv2)}`, vergleichKollektiveHTML, false, 'kollektivVergleich', dlButtonsKollVergleich, `table-vergleich-kollektive-${kollektiv1.replace(/\s+/g, '_')}-vs-${kollektiv2.replace(/\s+/g, '_')}`)}
             </div>`;
        } else {
            statistikHTML = '<p class="text-muted p-3">Bitte wählen Sie eine Ansicht und/oder Kollektive aus.</p>';
        }
        return statistikHTML;
    }


    function renderPraesentationTab(view, presentationData, selectedStudyId = null, currentGlobalKollektiv = 'Gesamt') {
        const contentHTML = praesentationTabLogic.createPresentationTabContent(view, presentationData, selectedStudyId, currentGlobalKollektiv);
        renderTabContent('praesentation-tab-pane', contentHTML, {
            afterRender: () => {
                if (typeof praesentationEventHandlers !== 'undefined' && praesentationEventHandlers.attachPraesentationEventListeners) {
                    praesentationEventHandlers.attachPraesentationEventListeners(presentationData);
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

    function renderPublikationTab() {
        const content = uiComponents.createPublikationTabHeader();
        renderTabContent('publikation-tab-pane', content, {
             afterRender: () => {
                if (typeof publikationTabLogic !== 'undefined' && typeof publikationTabLogic.initialize === 'function') {
                    publikationTabLogic.initialize(currentData);
                }
                if (typeof publikationEventHandlers !== 'undefined' && typeof publikationEventHandlers.attachPublikationEventListeners === 'function') {
                    publikationEventHandlers.attachPublikationEventListeners();
                }
                 _updateAllDynamicCounts(currentData);
            }
        });
    }

    function renderExportTab(currentKollektivForContext) {
        const currentKollektivToUse = currentKollektivForContext || stateManager.getCurrentKollektiv() || APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
        const content = uiComponents.createExportOptions(currentKollektivToUse);
        renderTabContent('export-tab-pane', content, {
            afterRender: () => {
                if (typeof exportEventHandlers !== 'undefined' && exportEventHandlers.attachExportEventListeners) {
                    exportEventHandlers.attachExportEventListeners();
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
