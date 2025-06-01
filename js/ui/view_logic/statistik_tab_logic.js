const statistikTabLogic = (() => {
    let _mainAppInterface = null;
    let _globalRawData = [];
    let _currentKollektivGlobal = ''; // Das global im Header ausgewählte Kollektiv
    let _appliedT2Criteria = null;
    let _appliedT2Logic = '';
    let _statsLayout = 'einzel';
    let _statsKollektiv1 = 'Gesamt'; // Kollektiv für linke Spalte im Vergleichsmodus
    let _statsKollektiv2 = 'nRCT';   // Kollektiv für rechte Spalte im Vergleichsmodus
    let _isInitialized = false;
    let _isDataStale = true;

    // Zwischengespeicherte Statistikobjekte
    let _statsDataKollektivGlobal = null;
    let _statsDataKollektiv1 = null;
    let _statsDataKollektiv2 = null;
    let _statsVergleichKollektive = null;
    let _criteriaComparisonResults = null;


    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
    }

    function setDataStale() {
        _isDataStale = true;
        _statsDataKollektivGlobal = null;
        _statsDataKollektiv1 = null;
        _statsDataKollektiv2 = null;
        _statsVergleichKollektive = null;
        _criteriaComparisonResults = null;
    }

    function isInitialized() {
        return _isInitialized;
    }

    function _getProcessedAndEvaluatedData(kollektivId) {
        if (!_globalRawData || _globalRawData.length === 0) return [];
        const filteredRaw = dataProcessor.filterDataByKollektiv(cloneDeep(_globalRawData), kollektivId);
        return t2CriteriaManager.evaluateDataset(filteredRaw, _appliedT2Criteria, _appliedT2Logic);
    }

    function _calculateStatsForKollektiv(kollektivId) {
        const evaluatedData = _getProcessedAndEvaluatedData(kollektivId);
        if (evaluatedData.length === 0) return null;

        return {
            deskriptiv: statisticsService.calculateDescriptiveStats(evaluatedData),
            gueteAS: statisticsService.calculateDiagnosticPerformance(evaluatedData, 'as', 'n'),
            gueteT2_angewandt: statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n'),
            vergleichASvsT2_angewandt: statisticsService.compareDiagnosticMethods(evaluatedData, 'as', 't2', 'n'),
            assoziation_angewandt: statisticsService.calculateAssociations(evaluatedData, _appliedT2Criteria)
        };
    }
    
    function _calculateCriteriaComparison(globalKollektivId) {
        const evaluatedGlobalData = _getProcessedAndEvaluatedData(globalKollektivId);
        if (evaluatedGlobalData.length === 0) return [];
        
        const results = [];
        const studySets = studyT2CriteriaManager.getAllStudyCriteriaSets(false); // Ohne 'angewandt'

        // 1. Avocado Sign
        const asPerfGlobal = statisticsService.calculateDiagnosticPerformance(evaluatedGlobalData, 'as', 'n');
        if (asPerfGlobal) {
            results.push({
                id: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID,
                name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME,
                sens: asPerfGlobal.sens?.value,
                spez: asPerfGlobal.spez?.value,
                ppv: asPerfGlobal.ppv?.value,
                npv: asPerfGlobal.npv?.value,
                acc: asPerfGlobal.acc?.value,
                auc: asPerfGlobal.auc?.value,
                globalN: evaluatedGlobalData.length,
                specificKollektivName: globalKollektivId,
                specificKollektivN: evaluatedGlobalData.length
            });
        }

        // 2. Angewandte T2 Kriterien
        const t2AppliedPerfGlobal = statisticsService.calculateDiagnosticPerformance(evaluatedGlobalData, 't2', 'n');
        if (t2AppliedPerfGlobal) {
             results.push({
                id: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID,
                name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                sens: t2AppliedPerfGlobal.sens?.value,
                spez: t2AppliedPerfGlobal.spez?.value,
                ppv: t2AppliedPerfGlobal.ppv?.value,
                npv: t2AppliedPerfGlobal.npv?.value,
                acc: t2AppliedPerfGlobal.acc?.value,
                auc: t2AppliedPerfGlobal.auc?.value,
                globalN: evaluatedGlobalData.length,
                specificKollektivName: globalKollektivId,
                specificKollektivN: evaluatedGlobalData.length
            });
        }
        
        // 3. Literatur Kriterien
        studySets.forEach(set => {
            const targetKollektiv = set.applicableKollektiv || globalKollektivId;
            const dataForSet = (targetKollektiv === globalKollektivId) ? 
                                cloneDeep(evaluatedGlobalData) : // Wenn gleiches Kollektiv, wiederverwenden
                                _getProcessedAndEvaluatedData(targetKollektiv); // Ansonsten neu evaluieren

            if(dataForSet.length > 0) {
                // Wichtig: Für Literatur-Sets müssen die T2-Werte spezifisch mit den *Studienkriterien* neu berechnet werden.
                const studyEvaluatedData = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(dataForSet, set);
                const perf = statisticsService.calculateDiagnosticPerformance(studyEvaluatedData, 't2', 'n');
                if(perf) {
                    results.push({
                        id: set.id,
                        name: set.name,
                        sens: perf.sens?.value,
                        spez: perf.spez?.value,
                        ppv: perf.ppv?.value,
                        npv: perf.npv?.value,
                        acc: perf.acc?.value,
                        auc: perf.auc?.value,
                        globalN: evaluatedGlobalData.length,
                        specificKollektivName: targetKollektiv,
                        specificKollektivN: dataForSet.length
                    });
                }
            }
        });
        results.sort((a,b) => (b.auc ?? -1) - (a.auc ?? -1));
        return results;
    }


    function _renderEinzelansicht(containerId) {
        const contentArea = document.getElementById(containerId);
        if (!contentArea) return;
        contentArea.innerHTML = ''; // Clear previous content

        if (_isDataStale || !_statsDataKollektivGlobal) {
            _statsDataKollektivGlobal = _calculateStatsForKollektiv(_currentKollektivGlobal);
        }
        if (_isDataStale || !_criteriaComparisonResults) {
            _criteriaComparisonResults = _calculateCriteriaComparison(_currentKollektivGlobal);
        }


        if (!_statsDataKollektivGlobal) {
            contentArea.innerHTML = `<p class="text-center text-muted p-3">Keine Daten für Kollektiv '${getKollektivDisplayName(_currentKollektivGlobal)}' vorhanden.</p>`;
            return;
        }
        
        const deskriptivHTML = createDeskriptiveStatistikContentHTML(_statsDataKollektivGlobal, '0', _currentKollektivGlobal);
        const gueteASHTML = createGueteContentHTML(_statsDataKollektivGlobal.gueteAS, 'AS', _currentKollektivGlobal);
        const gueteT2HTML = createGueteContentHTML(_statsDataKollektivGlobal.gueteT2_angewandt, `T2 (${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME})`, _currentKollektivGlobal);
        const vergleichHTML = createVergleichContentHTML(_statsDataKollektivGlobal.vergleichASvsT2_angewandt, _currentKollektivGlobal, APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME);
        const assoziationHTML = createAssoziationContentHTML(_statsDataKollektivGlobal.assoziation_angewandt, _currentKollektivGlobal, _appliedT2Criteria);
        const criteriaComparisonHTML = createCriteriaComparisonTableHTML(_criteriaComparisonResults, _currentKollektivGlobal);

        const col1 = document.createElement('div'); col1.className = 'col-lg-6 d-flex flex-column';
        const col2 = document.createElement('div'); col2.className = 'col-lg-6 d-flex flex-column';
        
        col1.innerHTML += uiComponents.createStatistikCard('stat-deskriptiv', `Deskriptive Statistik (${getKollektivDisplayName(_currentKollektivGlobal)})`, deskriptivHTML, false, 'deskriptiveStatistik', [], 'table-deskriptiv-demographie-0');
        col1.innerHTML += uiComponents.createStatistikCard('stat-guete-as', `Diagnostische Güte AS (${getKollektivDisplayName(_currentKollektivGlobal)})`, gueteASHTML, false, 'diagnostischeGueteAS', [], `table-guete-matrix-AS-${_currentKollektivGlobal.replace(/\s+/g, '_')}`);
        col1.innerHTML += uiComponents.createStatistikCard('stat-assoziation', `Assoziationsanalyse (${getKollektivDisplayName(_currentKollektivGlobal)})`, assoziationHTML, false, 'assoziationEinzelkriterien', [], `table-assoziation-${_currentKollektivGlobal.replace(/\s+/g, '_')}`);
        
        col2.innerHTML += uiComponents.createStatistikCard('stat-guete-t2', `Diagnostische Güte T2 (${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME}, ${getKollektivDisplayName(_currentKollektivGlobal)})`, gueteT2HTML, false, 'diagnostischeGueteT2', [], `table-guete-matrix-T2-${_currentKollektivGlobal.replace(/\s+/g, '_')}`);
        col2.innerHTML += uiComponents.createStatistikCard('stat-vergleich-as-t2', `Vergleich AS vs. T2 (${getKollektivDisplayName(_currentKollektivGlobal)})`, vergleichHTML, false, 'statistischerVergleichASvsT2', [], `table-vergleich-as-vs-t2-${_currentKollektivGlobal.replace(/\s+/g, '_')}`);
        col2.innerHTML += uiComponents.createStatistikCard('stat-kriterien-vergleich', `Performance Vergleich (Global: ${getKollektivDisplayName(_currentKollektivGlobal)})`, criteriaComparisonHTML, false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich');


        contentArea.appendChild(col1);
        contentArea.appendChild(col2);

        if (_statsDataKollektivGlobal.deskriptiv?.alterData) {
            chart_renderer.renderAgeDistributionChart('chart-stat-age-0', _statsDataKollektivGlobal.deskriptiv.alterData, _currentKollektivGlobal, {title: ''});
        }
        if (_statsDataKollektivGlobal.deskriptiv?.geschlecht) {
            const genderData = [
                { label: UI_TEXTS.legendLabels.male, value: _statsDataKollektivGlobal.deskriptiv.geschlecht.m, color: APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE },
                { label: UI_TEXTS.legendLabels.female, value: _statsDataKollektivGlobal.deskriptiv.geschlecht.f, color: APP_CONFIG.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN }
            ].filter(d => d.value > 0);
            if(genderData.length > 0) chart_renderer.renderPieChart('chart-stat-gender-0', genderData, { title: '', compact: true, donut: true, showLegend: false });
        }
    }

    function _renderVergleichsansicht(containerId) {
        const contentArea = document.getElementById(containerId);
        if (!contentArea) return;
        contentArea.innerHTML = '';

        if (_isDataStale || !_statsDataKollektiv1) _statsDataKollektiv1 = _calculateStatsForKollektiv(_statsKollektiv1);
        if (_isDataStale || !_statsDataKollektiv2) _statsDataKollektiv2 = _calculateStatsForKollektiv(_statsKollektiv2);
        if (_isDataStale || !_statsVergleichKollektive) {
            const data1 = _getProcessedAndEvaluatedData(_statsKollektiv1);
            const data2 = _getProcessedAndEvaluatedData(_statsKollektiv2);
            _statsVergleichKollektive = statisticsService.compareCohorts(data1, data2, _appliedT2Criteria, _appliedT2Logic);
        }
        if (_isDataStale || !_criteriaComparisonResults) {
             _criteriaComparisonResults = _calculateCriteriaComparison(_currentKollektivGlobal); // Vergleichstabelle bleibt global
        }


        const col1 = document.createElement('div'); col1.className = 'col-lg-6 d-flex flex-column';
        const col2 = document.createElement('div'); col2.className = 'col-lg-6 d-flex flex-column';

        if (_statsDataKollektiv1) {
            const deskHTML1 = createDeskriptiveStatistikContentHTML(_statsDataKollektiv1, '1', _statsKollektiv1);
            const gueteASHTML1 = createGueteContentHTML(_statsDataKollektiv1.gueteAS, 'AS', _statsKollektiv1);
            const gueteT2HTML1 = createGueteContentHTML(_statsDataKollektiv1.gueteT2_angewandt, `T2 (${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME})`, _statsKollektiv1);
            col1.innerHTML += uiComponents.createStatistikCard('stat-deskriptiv-k1', `Deskriptiv (${getKollektivDisplayName(_statsKollektiv1)})`, deskHTML1, false, 'deskriptiveStatistik', [], 'table-deskriptiv-demographie-1');
            col1.innerHTML += uiComponents.createStatistikCard('stat-guete-as-k1', `Güte AS (${getKollektivDisplayName(_statsKollektiv1)})`, gueteASHTML1, false, 'diagnostischeGueteAS', [], `table-guete-matrix-AS-${_statsKollektiv1.replace(/\s+/g, '_')}`);
            col1.innerHTML += uiComponents.createStatistikCard('stat-guete-t2-k1', `Güte T2 (${getKollektivDisplayName(_statsKollektiv1)})`, gueteT2HTML1, false, 'diagnostischeGueteT2', [], `table-guete-matrix-T2-${_statsKollektiv1.replace(/\s+/g, '_')}`);
        } else {
            col1.innerHTML = `<p class="text-center text-muted p-3">Keine Daten für Kollektiv '${getKollektivDisplayName(_statsKollektiv1)}'.</p>`;
        }

        if (_statsDataKollektiv2) {
            const deskHTML2 = createDeskriptiveStatistikContentHTML(_statsDataKollektiv2, '2', _statsKollektiv2);
            const gueteASHTML2 = createGueteContentHTML(_statsDataKollektiv2.gueteAS, 'AS', _statsKollektiv2);
            const gueteT2HTML2 = createGueteContentHTML(_statsDataKollektiv2.gueteT2_angewandt, `T2 (${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME})`, _statsKollektiv2);
            col2.innerHTML += uiComponents.createStatistikCard('stat-deskriptiv-k2', `Deskriptiv (${getKollektivDisplayName(_statsKollektiv2)})`, deskHTML2, false, 'deskriptiveStatistik', [], 'table-deskriptiv-demographie-2');
            col2.innerHTML += uiComponents.createStatistikCard('stat-guete-as-k2', `Güte AS (${getKollektivDisplayName(_statsKollektiv2)})`, gueteASHTML2, false, 'diagnostischeGueteAS', [], `table-guete-matrix-AS-${_statsKollektiv2.replace(/\s+/g, '_')}`);
            col2.innerHTML += uiComponents.createStatistikCard('stat-guete-t2-k2', `Güte T2 (${getKollektivDisplayName(_statsKollektiv2)})`, gueteT2HTML2, false, 'diagnostischeGueteT2', [], `table-guete-matrix-T2-${_statsKollektiv2.replace(/\s+/g, '_')}`);
        } else {
            col2.innerHTML = `<p class="text-center text-muted p-3">Keine Daten für Kollektiv '${getKollektivDisplayName(_statsKollektiv2)}'.</p>`;
        }
        
        const vergleichHTML = createVergleichKollektiveContentHTML(_statsVergleichKollektive, _statsKollektiv1, _statsKollektiv2);
        const vergleichCard = uiComponents.createStatistikCard('stat-vergleich-kollektive', `Vergleich Kollektiv ${getKollektivDisplayName(_statsKollektiv1)} vs. ${getKollektivDisplayName(_statsKollektiv2)}`, vergleichHTML, false, 'vergleichKollektive', [], `table-vergleich-kollektive-${_statsKollektiv1.replace(/\s+/g, '_')}-vs-${_statsKollektiv2.replace(/\s+/g, '_')}`);
        
        const criteriaComparisonHTML = createCriteriaComparisonTableHTML(_criteriaComparisonResults, _currentKollektivGlobal);
        const criteriaCard = uiComponents.createStatistikCard('stat-kriterien-vergleich-vergl', `Performance Vergleich (Global: ${getKollektivDisplayName(_currentKollektivGlobal)})`, criteriaComparisonHTML, false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich');


        contentArea.appendChild(col1);
        contentArea.appendChild(col2);
        const row2 = document.createElement('div'); row2.className = 'row g-3 mt-0'; // mt-0 to avoid double margin if appended directly
        row2.innerHTML = vergleichCard;
        contentArea.appendChild(row2);

        const row3 = document.createElement('div'); row3.className = 'row g-3 mt-0';
        row3.innerHTML = criteriaCard;
        contentArea.appendChild(row3);


        if (_statsDataKollektiv1?.deskriptiv?.alterData) chart_renderer.renderAgeDistributionChart('chart-stat-age-1', _statsDataKollektiv1.deskriptiv.alterData, _statsKollektiv1, {title:''});
        if (_statsDataKollektiv1?.deskriptiv?.geschlecht) {
            const genderData1 = [ { label: UI_TEXTS.legendLabels.male, value: _statsDataKollektiv1.deskriptiv.geschlecht.m, color: APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE }, { label: UI_TEXTS.legendLabels.female, value: _statsDataKollektiv1.deskriptiv.geschlecht.f, color: APP_CONFIG.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN }].filter(d=>d.value > 0);
            if(genderData1.length > 0) chart_renderer.renderPieChart('chart-stat-gender-1', genderData1, {title: '', compact:true, donut:true, showLegend: false});
        }
        if (_statsDataKollektiv2?.deskriptiv?.alterData) chart_renderer.renderAgeDistributionChart('chart-stat-age-2', _statsDataKollektiv2.deskriptiv.alterData, _statsKollektiv2, {title:''});
        if (_statsDataKollektiv2?.deskriptiv?.geschlecht) {
            const genderData2 = [ { label: UI_TEXTS.legendLabels.male, value: _statsDataKollektiv2.deskriptiv.geschlecht.m, color: APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE }, { label: UI_TEXTS.legendLabels.female, value: _statsDataKollektiv2.deskriptiv.geschlecht.f, color: APP_CONFIG.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN }].filter(d=>d.value > 0);
            if(genderData2.length > 0) chart_renderer.renderPieChart('chart-stat-gender-2', genderData2, {title: '', compact:true, donut:true, showLegend: false});
        }
    }


    function initializeTab(data, currentKollektiv, appliedT2Criteria, appliedT2Logic, statsLayout, statsKollektiv1, statsKollektiv2) {
        _globalRawData = cloneDeep(data); // Speichere die globalen Rohdaten
        _currentKollektivGlobal = currentKollektiv;
        _appliedT2Criteria = cloneDeep(appliedT2Criteria);
        _appliedT2Logic = appliedT2Logic;
        _statsLayout = statsLayout;
        _statsKollektiv1 = statsKollektiv1;
        _statsKollektiv2 = statsKollektiv2;
        
        setDataStale(); // Markiere alle gecachten Daten als veraltet

        ui_helpers.updateStatistikSelectorsUI(_statsLayout, _statsKollektiv1, _statsKollektiv2);

        if (_statsLayout === 'einzel') {
            _renderEinzelansicht('statistik-content-area');
        } else {
            _renderVergleichsansicht('statistik-content-area');
        }
        
        _isInitialized = true;
        _isDataStale = false; // Daten wurden gerade neu aufbereitet
        ui_helpers.initializeTooltips(document.getElementById('statistik-content-area'));
    }

    return Object.freeze({
        initialize,
        initializeTab,
        isInitialized,
        setDataStale,
        createDeskriptiveStatistikContentHTML, // Beibehalten, falls von anderer Stelle genutzt
        createGueteContentHTML,
        createVergleichContentHTML,
        createAssoziationContentHTML,
        createVergleichKollektiveContentHTML,
        createCriteriaComparisonTableHTML
    });

})();
