window.statistikTabLogic = (() => {
    const TAB_ID = 'statistik-tab-pane';
    let currentStatsData = null;
    let currentSelectedKollektivEinzel = null;
    let currentSelectedKollektiv1 = null;
    let currentSelectedKollektiv2 = null;
    let currentLayout = 'einzel';

    function initializeStatistikTab() {
        currentLayout = state.getCurrentStatsLayout() || 'einzel';
        currentSelectedKollektivEinzel = state.getCurrentKollektiv();
        currentSelectedKollektiv1 = state.getCurrentStatsKollektiv1() || 'Gesamt';
        currentSelectedKollektiv2 = state.getCurrentStatsKollektiv2() || 'nRCT';

        renderStatistikTab();
        if (typeof statistikEventHandlers !== 'undefined' && typeof statistikEventHandlers.setupStatistikTabEventHandlers === 'function') {
            statistikEventHandlers.setupStatistikTabEventHandlers();
        }
    }

    function renderStatistikTab() {
        const tabContainer = document.getElementById(TAB_ID);
        if (!tabContainer) {
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showLoadingSpinner === 'function') {
                ui_helpers.showLoadingSpinner(TAB_ID, `Container '${TAB_ID}' nicht gefunden.`);
            }
            return;
        }
        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showLoadingSpinner === 'function') {
            ui_helpers.showLoadingSpinner(TAB_ID, 'Lade Statistikdaten...');
        }

        const allRawData = kollektivStore.getAllProcessedData();
        const appliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
        const appliedT2Logic = t2CriteriaManager.getAppliedLogic();
        const allBruteForceResults = bruteForceManager.getAllResults();

        if (typeof statisticsService !== 'undefined' && typeof statisticsService.calculateAllStatsForPublication === 'function') {
            currentStatsData = statisticsService.calculateAllStatsForPublication(allRawData, appliedT2Criteria, appliedT2Logic, allBruteForceResults);
        } else {
            currentStatsData = null;
            console.error("statisticsService.calculateAllStatsForPublication ist nicht verfügbar.");
        }


        if (!currentStatsData) {
            tabContainer.innerHTML = '<p class="text-center text-muted p-5">Fehler beim Laden der Statistikdaten oder Statistik-Service nicht verfügbar.</p>';
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.hideLoadingSpinner === 'function') {
                 ui_helpers.hideLoadingSpinner(TAB_ID);
            }
            return;
        }
        tabContainer.innerHTML = '';

        const layoutControls = createLayoutControls();
        tabContainer.appendChild(layoutControls);

        const contentWrapper = ui_helpers.createElementWithAttributes('div', { id: 'statistik-content-wrapper' });
        tabContainer.appendChild(contentWrapper);

        updateStatistikContent();
        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.initTooltips === 'function') {
            ui_helpers.initTooltips(tabContainer);
        }
         if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.hideLoadingSpinner === 'function') {
            ui_helpers.hideLoadingSpinner(TAB_ID);
        }
    }

    function createLayoutControls() {
        const wrapper = ui_helpers.createElementWithAttributes('div', { class: 'mb-3 p-3 border rounded bg-light-subtle shadow-sm' });
        const form = ui_helpers.createElementWithAttributes('form', { class: 'row gy-2 gx-3 align-items-center' });

        const layoutGroup = ui_helpers.createElementWithAttributes('div', { class: 'col-auto' });
        layoutGroup.appendChild(ui_helpers.createElementWithAttributes('label', { class: 'form-label me-2 d-block' }, 'Ansicht:'));
        const radioEinzel = uiComponents.createCheckbox({ id: 'stats-layout-einzel', name: 'statsLayout', label: 'Einzelnes Kollektiv', value: 'einzel', checked: currentLayout === 'einzel', wrapperClass: 'form-check form-check-inline', onChange: handleLayoutChange });
        const radioVergleich = uiComponents.createCheckbox({ id: 'stats-layout-vergleich', name: 'statsLayout', label: 'Kollektivvergleich', value: 'vergleich', checked: currentLayout === 'vergleich', wrapperClass: 'form-check form-check-inline', onChange: handleLayoutChange });
        layoutGroup.appendChild(radioEinzel);
        layoutGroup.appendChild(radioVergleich);
        form.appendChild(layoutGroup);

        const kollektivOptions = [
            { value: 'Gesamt', text: getKollektivDisplayName('Gesamt') || 'Gesamt' },
            { value: 'direkt OP', text: getKollektivDisplayName('direkt OP') || 'Direkt OP' },
            { value: 'nRCT', text: getKollektivDisplayName('nRCT') || 'nRCT' }
        ];

        const kollektivEinzelGroup = ui_helpers.createElementWithAttributes('div', { class: 'col-auto', id: 'stats-kollektiv-einzel-group' });
        kollektivEinzelGroup.appendChild(uiComponents.createSelect({ id: 'stats-kollektiv-einzel-select', name: 'statsKollektivEinzel', label: 'Kollektiv (Einzelansicht):', selectOptions: kollektivOptions, value: currentSelectedKollektivEinzel, selectClass: 'form-select-sm', wrapperClass: 'mb-0', onChange: handleKollektivEinzelChange, tooltipKey: 'tooltip.statistikKollektiv1'}));
        form.appendChild(kollektivEinzelGroup);

        const kollektiv1Group = ui_helpers.createElementWithAttributes('div', { class: 'col-auto', id: 'stats-kollektiv1-group' });
        kollektiv1Group.appendChild(uiComponents.createSelect({ id: 'stats-kollektiv1-select', name: 'statsKollektiv1', label: 'Kollektiv 1:', selectOptions: kollektivOptions, value: currentSelectedKollektiv1, selectClass: 'form-select-sm', wrapperClass: 'mb-0', onChange: handleKollektiv1Change, tooltipKey: 'tooltip.statistikKollektiv1' }));
        form.appendChild(kollektiv1Group);

        const kollektiv2Group = ui_helpers.createElementWithAttributes('div', { class: 'col-auto', id: 'stats-kollektiv2-group' });
        kollektiv2Group.appendChild(uiComponents.createSelect({ id: 'stats-kollektiv2-select', name: 'statsKollektiv2', label: 'Kollektiv 2:', selectOptions: kollektivOptions, value: currentSelectedKollektiv2, selectClass: 'form-select-sm', wrapperClass: 'mb-0', onChange: handleKollektiv2Change, tooltipKey: 'tooltip.statistikKollektiv2' }));
        form.appendChild(kollektiv2Group);

        wrapper.appendChild(form);
        toggleKollektivSelectsVisibility();
        return wrapper;
    }

    function toggleKollektivSelectsVisibility() {
        const kollektivEinzelGroup = document.getElementById('stats-kollektiv-einzel-group');
        const kollektiv1Group = document.getElementById('stats-kollektiv1-group');
        const kollektiv2Group = document.getElementById('stats-kollektiv2-group');

        if (kollektivEinzelGroup) {
            kollektivEinzelGroup.style.display = currentLayout === 'einzel' ? 'block' : 'none';
        }
        if (kollektiv1Group) {
            kollektiv1Group.style.display = currentLayout === 'vergleich' ? 'block' : 'none';
        }
        if (kollektiv2Group) {
            kollektiv2Group.style.display = currentLayout === 'vergleich' ? 'block' : 'none';
        }
    }

    function updateStatistikContent() {
        const contentWrapper = document.getElementById('statistik-content-wrapper');
        if (!contentWrapper || !currentStatsData) return;

        contentWrapper.innerHTML = '';
        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showLoadingSpinner === 'function') {
            ui_helpers.showLoadingSpinner('statistik-content-wrapper', 'Statistiken werden aufbereitet...');
        }

        setTimeout(() => {
            if (currentLayout === 'einzel') {
                const dataForKollektiv = currentStatsData[currentSelectedKollektivEinzel];
                if (dataForKollektiv) {
                    contentWrapper.appendChild(renderSingleKollektivStats(dataForKollektiv, currentSelectedKollektivEinzel));
                } else {
                    contentWrapper.innerHTML = `<p class="text-center text-muted p-4">Keine Daten für Kollektiv '${getKollektivDisplayName(currentSelectedKollektivEinzel)}' verfügbar.</p>`;
                }
            } else if (currentLayout === 'vergleich') {
                const dataKoll1 = currentStatsData[currentSelectedKollektiv1];
                const dataKoll2 = currentStatsData[currentSelectedKollektiv2];
                if (dataKoll1 && dataKoll2) {
                    const allRawData = kollektivStore.getAllProcessedData();
                    const data1Filtered = dataProcessor.filterDataByKollektiv(allRawData, currentSelectedKollektiv1);
                    const data2Filtered = dataProcessor.filterDataByKollektiv(allRawData, currentSelectedKollektiv2);
                    contentWrapper.appendChild(renderVergleichKollektivStats(dataKoll1, dataKoll2, currentSelectedKollektiv1, currentSelectedKollektiv2, data1Filtered, data2Filtered));
                } else {
                    contentWrapper.innerHTML = `<p class="text-center text-muted p-4">Nicht genügend Daten für Kollektivvergleich vorhanden.</p>`;
                }
            }
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.initTooltips === 'function') {
                ui_helpers.initTooltips(contentWrapper);
            }
            if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.hideLoadingSpinner === 'function') {
                ui_helpers.hideLoadingSpinner('statistik-content-wrapper');
            }
        }, 50);
    }

    function renderSingleKollektivStats(stats, kollektivId) {
        const fragment = document.createDocumentFragment();
        if (!stats) {
             fragment.appendChild(ui_helpers.createElementWithAttributes('p', {class: 'text-muted p-3'}, `Keine Statistikdaten für Kollektiv '${getKollektivDisplayName(kollektivId)}'.`));
             return fragment;
        }

        const appliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
        const appliedCriteriaDisplayName = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
        const kollektivDisplayName = getKollektivDisplayName(kollektivId);

        fragment.appendChild(createSectionCard('Deskriptive Statistik', renderDescriptiveStatsSection(stats.deskriptiv, kollektivId), 'tooltip.deskriptiveStatistik.cardTitle', {KOLLEKTIV: kollektivDisplayName}));
        fragment.appendChild(createSectionCard('Diagnostische Güte: Avocado Sign (AS)', renderDiagnosticPerformanceSection(stats.gueteAS, 'AS', kollektivId, 'as'), 'tooltip.diagnostischeGueteAS.cardTitle', {KOLLEKTIV: kollektivDisplayName}));
        fragment.appendChild(createSectionCard(`Diagnostische Güte: ${appliedCriteriaDisplayName}`, renderDiagnosticPerformanceSection(stats.gueteT2_angewandt, appliedCriteriaDisplayName, kollektivId, 't2_applied'), 'tooltip.diagnostischeGueteT2.cardTitle', {KOLLEKTIV: kollektivDisplayName}));
        fragment.appendChild(createSectionCard(`Statistischer Vergleich: AS vs. ${appliedCriteriaDisplayName}`, renderComparisonSection(stats.vergleichASvsT2_angewandt, 'AS', appliedCriteriaDisplayName, kollektivId), 'tooltip.statistischerVergleichASvsT2.cardTitle', {KOLLEKTIV: kollektivDisplayName}));
        fragment.appendChild(createSectionCard('Assoziation mit N-Status', renderAssociationSection(stats.assoziation_angewandt, kollektivId, appliedT2Criteria), 'tooltip.assoziationEinzelkriterien.cardTitle', {KOLLEKTIV: kollektivDisplayName}));
        fragment.appendChild(createSectionCard('Explorative Lymphknoten-Ebene Analyse', renderLymphNodeLevelSection(stats.lymphknotenEbene, kollektivId), 'tooltip.explorativeLKAnalyse.cardTitle', {KOLLEKTIV: kollektivDisplayName}));
        fragment.appendChild(createSectionCard('Vergleich verschiedener Kriteriensets', renderCriteriaComparisonSection(currentStatsData, kollektivId), 'tooltip.criteriaComparisonTable.cardTitle', {GLOBAL_KOLLEKTIV_NAME: kollektivDisplayName}));

        return fragment;
    }

    function renderVergleichKollektivStats(statsKoll1, statsKoll2, kollektivId1, kollektivId2, rawDataKoll1, rawDataKoll2) {
        const fragment = document.createDocumentFragment();
        if (!statsKoll1 || !statsKoll2) {
            fragment.appendChild(ui_helpers.createElementWithAttributes('p', {class: 'text-muted p-3'}, 'Daten für Kollektivvergleich unvollständig.'));
            return fragment;
        }

        const comparisonResults = statisticsService.compareCohorts(
            rawDataKoll1,
            rawDataKoll2,
            t2CriteriaManager.getAppliedCriteria(),
            t2CriteriaManager.getAppliedLogic()
        );

        fragment.appendChild(createSectionCard(`Kollektivvergleich: ${getKollektivDisplayName(kollektivId1)} vs. ${getKollektivDisplayName(kollektivId2)}`, renderCohortComparisonSection(comparisonResults, kollektivId1, kollektivId2), 'tooltip.vergleichKollektive.cardTitle', {KOLLEKTIV1: getKollektivDisplayName(kollektivId1), KOLLEKTIV2: getKollektivDisplayName(kollektivId2)}));

        const headerKoll1 = `Details für Kollektiv 1: ${getKollektivDisplayName(kollektivId1)}`;
        const sectionKoll1 = ui_helpers.createElementWithAttributes('div', {class: 'mt-4'});
        sectionKoll1.appendChild(ui_helpers.createElementWithAttributes('h3', {class: 'mb-3 h5'}, headerKoll1));
        sectionKoll1.appendChild(renderSingleKollektivStats(statsKoll1, kollektivId1));
        fragment.appendChild(sectionKoll1);

        const headerKoll2 = `Details für Kollektiv 2: ${getKollektivDisplayName(kollektivId2)}`;
        const sectionKoll2 = ui_helpers.createElementWithAttributes('div', {class: 'mt-4'});
        sectionKoll2.appendChild(ui_helpers.createElementWithAttributes('h3', {class: 'mb-3 h5'}, headerKoll2));
        sectionKoll2.appendChild(renderSingleKollektivStats(statsKoll2, kollektivId2));
        fragment.appendChild(sectionKoll2);

        return fragment;
    }

    function createSectionCard(headerText, bodyElement, tooltipKey = null, tooltipReplacements = {}) {
        return uiComponents.createCard({
            headerText: headerText,
            bodyContent: bodyElement,
            cardClass: 'mb-3 shadow-sm stats-section-card',
            bodyClass: 'p-3',
            headerClass: 'bg-primary-light',
            extraAttributes: tooltipKey ? { 'data-tippy-content-key': tooltipKey, 'data-tippy-replacements': JSON.stringify(tooltipReplacements) } : {}
        });
    }

    function renderDescriptiveStatsSection(deskriptivStats, kollektivId) {
        const wrapper = document.createDocumentFragment();
        if (!deskriptivStats) { wrapper.appendChild(ui_helpers.createElementWithAttributes('p', {class:'text-muted'}, 'Deskriptive Daten nicht verfügbar.')); return wrapper; }

        const table = uiComponents.createPatientCharacteristicTable(deskriptivStats, `table-desc-${kollektivId.replace(/\s/g,'_')}`, `Patientencharakteristika für Kollektiv: ${getKollektivDisplayName(kollektivId)}`);
        wrapper.appendChild(table);

        const chartRow = ui_helpers.createElementWithAttributes('div', {class: 'row mt-3 g-3'});
        const ageChartCol = ui_helpers.createElementWithAttributes('div', {class: 'col-md-6'});
        const ageChartContainerId = `chart-stat-age-${kollektivId.replace(/\s/g,'_')}`;
        ageChartCol.appendChild(ui_helpers.createElementWithAttributes('div', {id: ageChartContainerId, class: 'chart-container-wrapper', style: 'min-height: 300px'}));
        chartRow.appendChild(ageChartCol);

        setTimeout(() => chartManager.manageChartContainer(ageChartContainerId, chartRenderer.renderHistogram, deskriptivStats.alterData || [], {xAxisLabel: UI_TEXTS.axisLabels.age, yAxisLabel: UI_TEXTS.axisLabels.patientCount, title: UI_TEXTS.chartTitles.ageDistribution.replace('{Kollektiv}', getKollektivDisplayName(kollektivId)), kollektivForExport: kollektivId, chartNameForFilename: 'Altersverteilung'}), 0);

        const genderChartCol = ui_helpers.createElementWithAttributes('div', {class: 'col-md-6'});
        const genderChartContainerId = `chart-stat-gender-${kollektivId.replace(/\s/g,'_')}`;
        genderChartCol.appendChild(ui_helpers.createElementWithAttributes('div', {id: genderChartContainerId, class: 'chart-container-wrapper', style: 'min-height: 300px'}));
        chartRow.appendChild(genderChartCol);
        const genderData = [{label: UI_TEXTS.legendLabels.male, value: deskriptivStats.geschlecht.m}, {label: UI_TEXTS.legendLabels.female, value: deskriptivStats.geschlecht.f}];
        if(deskriptivStats.geschlecht.unbekannt > 0) genderData.push({label: UI_TEXTS.legendLabels.unknownGender, value: deskriptivStats.geschlecht.unbekannt});
        setTimeout(() => chartManager.manageChartContainer(genderChartContainerId, chartRenderer.renderPieChart, genderData, {title: UI_TEXTS.chartTitles.genderDistribution.replace('{Kollektiv}', getKollektivDisplayName(kollektivId)), kollektivForExport: kollektivId, chartNameForFilename: 'Geschlechterverteilung'}), 0);

        wrapper.appendChild(chartRow);
        return wrapper;
    }

    function renderDiagnosticPerformanceSection(performanceData, methodName, kollektivId, methodKey) {
        const wrapper = document.createDocumentFragment();
        if (!performanceData) { wrapper.appendChild(ui_helpers.createElementWithAttributes('p', {class:'text-muted'}, `Diagnostische Gütedaten für ${methodName} nicht verfügbar.`)); return wrapper; }

        const tableId = `table-perf-${methodKey}-${kollektivId.replace(/\s/g,'_')}`;
        const table = uiComponents.createPerformanceTable(performanceData, methodName, tableId, `Diagnostische Güte für ${methodName} (vs. N)`);
        wrapper.appendChild(table);

        const rocData = {
            points: dataProcessor.generateROCPointsFromConfusionMatrix(performanceData.matrix, methodName),
            auc: performanceData.auc?.value,
            auc_ci_lower: performanceData.auc?.ci?.lower,
            auc_ci_upper: performanceData.auc?.ci?.upper,
        };
        const rocChartContainerId = `chart-roc-${methodKey}-${kollektivId.replace(/\s/g,'_')}`;
        wrapper.appendChild(ui_helpers.createElementWithAttributes('div', {id: rocChartContainerId, class: 'chart-container-wrapper mt-3', style: 'min-height: 350px'}));
        setTimeout(() => chartManager.manageChartContainer(rocChartContainerId, chartRenderer.renderROCCurve, rocData, {title: `${UI_TEXTS.chartTitles.rocCurve.replace('{Method}', methodName)}`, kollektivForExport: kollektivId, chartNameForFilename: `ROC_${methodName}`}), 0);

        return wrapper;
    }

    function renderComparisonSection(comparisonData, method1Name, method2Name, kollektivId) {
        const wrapper = document.createDocumentFragment();
        if (!comparisonData) { wrapper.appendChild(ui_helpers.createElementWithAttributes('p', {class:'text-muted'}, `Vergleichsdaten nicht verfügbar.`)); return wrapper; }

        const tableId = `table-comp-${method1Name.replace(/\W/g,'')}-${method2Name.replace(/\W/g,'')}-${kollektivId.replace(/\s/g,'_')}`;
        const table = uiComponents.createComparisonTestTable(comparisonData, method1Name, method2Name, tableId, `Statistischer Vergleich: ${method1Name} vs. ${method2Name}`);
        wrapper.appendChild(table);
        return wrapper;
    }

    function renderAssociationSection(associationData, kollektivId, currentT2Criteria) {
        const wrapper = document.createDocumentFragment();
        if (!associationData || Object.keys(associationData).length === 0) { wrapper.appendChild(ui_helpers.createElementWithAttributes('p', {class:'text-muted'}, `Assoziationsdaten nicht verfügbar.`)); return wrapper; }

        const tableId = `table-assoc-${kollektivId.replace(/\s/g,'_')}`;
        const table = ui_helpers.createElementWithAttributes('table', {class: 'table table-sm table-bordered data-table publication-table', id: tableId});
        const caption = ui_helpers.createElementWithAttributes('caption', {}, `Assoziation verschiedener Merkmale mit dem pathologischen N-Status`); table.appendChild(caption);
        const thead = document.createElement('thead'); const tbody = document.createElement('tbody');
        const headers = ['Merkmal', 'OR (95% CI)', 'RD (%) (95% CI)', 'Phi', 'p-Wert (Test)']; const headerRow = document.createElement('tr'); headers.forEach(h => headerRow.appendChild(ui_helpers.createElementWithAttributes('th',{},h))); thead.appendChild(headerRow);
        table.appendChild(thead);

        const forestPlotDataOR = [];
        const forestPlotDataRD = [];

        const addRow = (featureName, assocObj) => {
            if(!assocObj) return;
            const r = document.createElement('tr');
            r.appendChild(ui_helpers.createElementWithAttributes('td',{}, ui_helpers.escapeHTML(featureName)));
            r.appendChild(ui_helpers.createElementWithAttributes('td',{}, formatCI(assocObj.or?.value, assocObj.or?.ci?.lower, assocObj.or?.ci?.upper, 2, false, '--')));
            const rdVal = assocObj.rd?.value !== null && !isNaN(assocObj.rd.value) ? assocObj.rd.value * 100 : NaN;
            const rdLow = assocObj.rd?.ci?.lower !== null && !isNaN(assocObj.rd.ci.lower) ? assocObj.rd.ci.lower * 100 : NaN;
            const rdHigh = assocObj.rd?.ci?.upper !== null && !isNaN(assocObj.rd.ci.upper) ? assocObj.rd.ci.upper * 100 : NaN;
            r.appendChild(ui_helpers.createElementWithAttributes('td',{}, formatCI(rdVal, rdLow, rdHigh, 1, false, '--') + (isNaN(rdVal) ? '' : '%')));
            r.appendChild(ui_helpers.createElementWithAttributes('td',{}, formatNumber(assocObj.phi?.value, 2, '--')));
            r.appendChild(ui_helpers.createElementWithAttributes('td',{}, `${getPValueText(assocObj.pValue)} ${getStatisticalSignificanceSymbol(assocObj.pValue)} (${ui_helpers.escapeHTML(assocObj.testName || '--')})`));
            tbody.appendChild(r);

            if (assocObj.or && !isNaN(assocObj.or.value) && assocObj.or.ci && !isNaN(assocObj.or.ci.lower) && !isNaN(assocObj.or.ci.upper)) {
                forestPlotDataOR.push({name: featureName, value: assocObj.or.value, lower: assocObj.or.ci.lower, upper: assocObj.or.ci.upper, pValue: assocObj.pValue });
            }
            if (assocObj.rd && !isNaN(assocObj.rd.value) && assocObj.rd.ci && !isNaN(assocObj.rd.ci.lower) && !isNaN(assocObj.rd.ci.upper)) {
                forestPlotDataRD.push({name: featureName, value: rdVal, lower: rdLow, upper: rdHigh, pValue: assocObj.pValue });
            }
        };

        if(associationData.as) addRow(associationData.as.featureName || 'AS Positiv', associationData.as);
        if(associationData.size_mwu && associationData.size_mwu.testName && !associationData.size_mwu.testName.toLowerCase().includes('nicht definiert')) {
             const r = document.createElement('tr');
             r.appendChild(ui_helpers.createElementWithAttributes('td',{}, ui_helpers.escapeHTML(associationData.size_mwu.featureName || 'LK Größe MWU')));
             r.appendChild(ui_helpers.createElementWithAttributes('td',{colspan: '3'}, `Statistik: U=${formatNumber(associationData.size_mwu.statistic,0)}, Z=${formatNumber(associationData.size_mwu.Z,2)}`));
             r.appendChild(ui_helpers.createElementWithAttributes('td',{}, `${getPValueText(associationData.size_mwu.pValue)} ${getStatisticalSignificanceSymbol(associationData.size_mwu.pValue)} (${ui_helpers.escapeHTML(associationData.size_mwu.testName || '--')})`));
             tbody.appendChild(r);
        }

        ['size', 'form', 'kontur', 'homogenitaet', 'signal'].forEach(key => {
            if(associationData[key] && associationData[key].testName && !associationData[key].testName.toLowerCase().includes('nicht definiert') && currentT2Criteria[key]?.active) {
                addRow(associationData[key].featureName || `T2 ${key}`, associationData[key]);
            } else if (associationData[key] && currentT2Criteria[key]?.active) {
                 const r = document.createElement('tr');
                 r.appendChild(ui_helpers.createElementWithAttributes('td',{}, ui_helpers.escapeHTML(associationData[key].featureName || `T2 ${key}`)));
                 r.appendChild(ui_helpers.createElementWithAttributes('td',{colspan: '4'}, associationData[key].testName || 'Keine validen Daten für Test'));
                 tbody.appendChild(r);
            }
        });
        table.appendChild(tbody);
        wrapper.appendChild(table);

        if (forestPlotDataOR.length > 0) {
            const forestORContainerId = `chart-forest-or-${kollektivId.replace(/\s/g,'_')}`;
            wrapper.appendChild(ui_helpers.createElementWithAttributes('div', {id: forestORContainerId, class: 'chart-container-wrapper mt-3', style: 'min-height: 300px'}));
            setTimeout(() => chartManager.manageChartContainer(forestORContainerId, chartRenderer.renderForestPlot, forestPlotDataOR, { title: 'Forest Plot: Odds Ratios vs. N-Status', xAxisLabel: UI_TEXTS.axisLabels.oddsRatio, effectMeasureName: 'OR', logScale: true, kollektivForExport: kollektivId, chartNameForFilename: `Forest_OR`}), 0);
        }
        if (forestPlotDataRD.length > 0) {
            const forestRDContainerId = `chart-forest-rd-${kollektivId.replace(/\s/g,'_')}`;
            wrapper.appendChild(ui_helpers.createElementWithAttributes('div', {id: forestRDContainerId, class: 'chart-container-wrapper mt-3', style: 'min-height: 300px'}));
            setTimeout(() => chartManager.manageChartContainer(forestRDContainerId, chartRenderer.renderForestPlot, forestPlotDataRD, { title: 'Forest Plot: Risk Differences vs. N-Status', xAxisLabel: UI_TEXTS.axisLabels.riskDifference, effectMeasureName: 'RD (%)', logScale: false, kollektivForExport: kollektivId, chartNameForFilename: `Forest_RD`}), 0);
        }
        return wrapper;
    }

    function renderLymphNodeLevelSection(lymphknotenStats, kollektivId) {
        const wrapper = document.createDocumentFragment();
        if (!lymphknotenStats) { wrapper.appendChild(ui_helpers.createElementWithAttributes('p', {class:'text-muted'}, `Lymphknoten-Level Daten nicht verfügbar.`)); return wrapper; }

        const createLNStatsTable = (data, title, tableIdSuffix) => {
            if (!data) return ui_helpers.createElementWithAttributes('p', {class:'text-muted small'}, `Keine Daten für '${title}'.`);
            const tableId = `table-ln-${tableIdSuffix}-${kollektivId.replace(/\s/g,'_')}`;
            const table = ui_helpers.createElementWithAttributes('table', {class: 'table table-sm table-bordered data-table publication-table', id: tableId});
            const caption = ui_helpers.createElementWithAttributes('caption', {}, title + ` (Anzahl LK: ${formatNumber(data.count,0)})`); table.appendChild(caption);
            const thead = document.createElement('thead'); const tbody = document.createElement('tbody');
            const headers = ['Merkmal', 'Wert']; const headerRow = document.createElement('tr'); headers.forEach(h => headerRow.appendChild(ui_helpers.createElementWithAttributes('th',{},h))); thead.appendChild(headerRow);
            table.appendChild(thead);
            const addRow = (label, value) => { const r = document.createElement('tr'); r.appendChild(ui_helpers.createElementWithAttributes('td',{},label)); r.appendChild(ui_helpers.createElementWithAttributes('td',{},value)); tbody.appendChild(r);};
            if(data.sizeStats) { addRow('Größe (mm) Median [Min-Max]', `${formatNumber(data.sizeStats.median,1)} [${formatNumber(data.sizeStats.min,1)}-${formatNumber(data.sizeStats.max,1)}]`); addRow('Größe (mm) Mean ± SD', `${formatNumber(data.sizeStats.mean,1)} ± ${formatNumber(data.sizeStats.sd,1)}`);} else {addRow('Größe (mm)', '--');}
            ['form', 'kontur', 'homogenitaet', 'signal'].forEach(key => {
                if (data[`${key}Counts`]) {
                    const countsString = Object.entries(data[`${key}Counts`]).map(([val, count]) => `${ui_helpers.escapeHTML(val)}: ${count}`).join(', ');
                    addRow(key.charAt(0).toUpperCase() + key.slice(1) + ' (Verteilung)', countsString || '--');
                }
            });
            table.appendChild(tbody); return table;
        };

        wrapper.appendChild(createLNStatsTable(lymphknotenStats.allLNs_t2, 'Alle T2-sichtbaren Lymphknoten', 'all'));
        wrapper.appendChild(createLNStatsTable(lymphknotenStats.nPlusLNs_t2, 'T2-sichtbare Lymphknoten bei N+ Patienten', 'nplus'));
        wrapper.appendChild(createLNStatsTable(lymphknotenStats.nMinusLNs_t2, 'T2-sichtbare Lymphknoten bei N- Patienten', 'nminus'));

        return wrapper;
    }

    function renderCriteriaComparisonSection(allStats, currentKollektivId) {
        const wrapper = ui_helpers.createElementWithAttributes('div');
        const dataForTable = [];
        const kollektivDisplayName = getKollektivDisplayName(currentKollektivId);

        if(allStats[currentKollektivId]?.gueteAS) {
            const asPerf = allStats[currentKollektivId].gueteAS;
            dataForTable.push({
                id: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID, name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME,
                sens: asPerf.sens.value, spez: asPerf.spez.value, ppv: asPerf.ppv.value, npv: asPerf.npv.value, acc: asPerf.acc.value, auc: asPerf.auc.value,
                specificKollektivN: allStats[currentKollektivId].deskriptiv?.anzahlPatienten, specificKollektivName: kollektivDisplayName
            });
        }
        if(allStats[currentKollektivId]?.gueteT2_angewandt) {
            const t2Perf = allStats[currentKollektivId].gueteT2_angewandt;
            dataForTable.push({
                id: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                sens: t2Perf.sens.value, spez: t2Perf.spez.value, ppv: t2Perf.ppv.value, npv: t2Perf.npv.value, acc: t2Perf.acc.value, auc: t2Perf.auc.value,
                specificKollektivN: allStats[currentKollektivId].deskriptiv?.anzahlPatienten, specificKollektivName: kollektivDisplayName
            });
        }
        if (allStats[currentKollektivId]?.gueteT2_literatur) {
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(studySetConf => {
                const studyDetails = studyT2CriteriaManager.getStudyCriteriaSetById(studySetConf.id);
                let kollektivForEval = studyDetails?.applicableKollektiv || currentKollektivId;
                const perfData = allStats[kollektivForEval]?.gueteT2_literatur?.[studySetConf.id];

                if (perfData) {
                    let nForEval = allStats[kollektivForEval]?.deskriptiv?.anzahlPatienten;
                    dataForTable.push({
                        id: studySetConf.id, name: studyDetails?.name || studySetConf.id,
                        sens: perfData.sens.value, spez: perfData.spez.value, ppv: perfData.ppv.value, npv: perfData.npv.value, acc: perfData.acc.value, auc: perfData.auc.value,
                        specificKollektivName: getKollektivDisplayName(kollektivForEval),
                        specificKollektivN: nForEval
                    });
                }
            });
        }
        if (dataForTable.length > 0) {
            wrapper.appendChild(uiComponents.createCriteriaComparisonTable(dataForTable, currentKollektivId));
        } else {
             wrapper.appendChild(ui_helpers.createElementWithAttributes('p', {class:'text-muted'}, `Keine Daten für Kriterienvergleich verfügbar.`));
        }
        return wrapper;
    }

    function renderCohortComparisonSection(comparisonResults, kollektivId1, kollektivId2) {
        const wrapper = document.createDocumentFragment();
        if (!comparisonResults) { wrapper.appendChild(ui_helpers.createElementWithAttributes('p', {class:'text-muted'}, `Vergleichsdaten für Kollektive nicht verfügbar.`)); return wrapper; }

        const table = ui_helpers.createElementWithAttributes('table', {class: 'table table-sm table-bordered data-table publication-table'});
        const caption = ui_helpers.createElementWithAttributes('caption', {}, `Statistischer Vergleich ausgewählter Metriken zwischen ${getKollektivDisplayName(kollektivId1)} (N=${currentStatsData[kollektivId1]?.deskriptiv?.anzahlPatienten || '?'}) und ${getKollektivDisplayName(kollektivId2)} (N=${currentStatsData[kollektivId2]?.deskriptiv?.anzahlPatienten || '?'})`); table.appendChild(caption);
        const thead = document.createElement('thead'); const tbody = document.createElement('tbody');
        const headers = ['Metrik', 'Methode', 'p-Wert (Unterschied)', 'Test Methode']; const headerRow = document.createElement('tr'); headers.forEach(h => headerRow.appendChild(ui_helpers.createElementWithAttributes('th',{},h))); thead.appendChild(headerRow);
        table.appendChild(thead);
        const addRow = (metricName, method, compObj) => { const r = document.createElement('tr'); r.appendChild(ui_helpers.createElementWithAttributes('td',{},metricName)); r.appendChild(ui_helpers.createElementWithAttributes('td',{},method)); r.appendChild(ui_helpers.createElementWithAttributes('td',{},`${getPValueText(compObj?.pValue)} ${getStatisticalSignificanceSymbol(compObj?.pValue)}`)); r.appendChild(ui_helpers.createElementWithAttributes('td',{},compObj?.testName || '--')); tbody.appendChild(r);};

        ['Accuracy', 'AUC', 'Sensitivität', 'Spezifität'].forEach(metricDisplayName => {
            const metricKeyLookup = { 'Accuracy': 'accuracyComparison', 'AUC': 'aucComparison', 'Sensitivität': 'sensitivityComparison', 'Spezifität': 'specificityComparison'};
            const metricKey = metricKeyLookup[metricDisplayName];
            if (comparisonResults[metricKey]) {
                if(comparisonResults[metricKey].as) addRow(metricDisplayName, 'AS', comparisonResults[metricKey].as);
                if(comparisonResults[metricKey].t2) addRow(metricDisplayName, 'T2 (angewandt)', comparisonResults[metricKey].t2);
            }
        });
        table.appendChild(tbody);
        wrapper.appendChild(table);
        return wrapper;
    }

    function handleLayoutChange(event) {
        const newLayout = event.target.value;
        if (newLayout !== currentLayout) {
            state.setCurrentStatsLayout(newLayout);
            currentLayout = newLayout;
            toggleKollektivSelectsVisibility();
            updateStatistikContent();
        }
    }
    function handleKollektivEinzelChange(event) {
        const newKollektiv = event.target.value;
        if (currentSelectedKollektivEinzel !== newKollektiv) {
            currentSelectedKollektivEinzel = newKollektiv;
            if (currentLayout === 'einzel') {
                updateStatistikContent();
            }
        }
    }
    function handleKollektiv1Change(event) {
        const newKollektiv = event.target.value;
         if (state.setCurrentStatsKollektiv1(newKollektiv)) { 
            currentSelectedKollektiv1 = newKollektiv;
            if (currentLayout === 'vergleich') updateStatistikContent();
        }
    }
    function handleKollektiv2Change(event) {
        const newKollektiv = event.target.value;
         if (state.setCurrentStatsKollektiv2(newKollektiv)) { 
            currentSelectedKollektiv2 = newKollektiv;
            if (currentLayout === 'vergleich') updateStatistikContent();
        }
    }
     function handleGlobalDataChange() {
        const newGlobalKollektiv = state.getCurrentKollektiv();
        if (currentSelectedKollektivEinzel !== newGlobalKollektiv) {
            currentSelectedKollektivEinzel = newGlobalKollektiv;
            if (currentLayout === 'einzel') {
                 if (document.getElementById(TAB_ID)?.classList.contains('active')) {
                    renderStatistikTab();
                 }
            }
        } else if (document.getElementById(TAB_ID)?.classList.contains('active')) {
             renderStatistikTab();
        }
    }

    return {
        init: initializeStatistikTab,
        render: renderStatistikTab,
        refresh: renderStatistikTab,
        handleGlobalDataChange
    };
})();
