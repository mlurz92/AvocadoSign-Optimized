const praesentationTabLogic = (() => {
    let allProcessedData = null;
    let currentView = APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW;
    let currentStudyId = APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID;
    let currentGlobalKollektiv = APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
    let appliedT2Criteria = null;
    let appliedT2Logic = null;
    let lang = 'de';

    function initialize(processedData, initialSettings) {
        allProcessedData = processedData;
        if (initialSettings) {
            currentView = initialSettings.presentationView || currentView;
            currentStudyId = initialSettings.presentationStudyId || currentStudyId;
            currentGlobalKollektiv = initialSettings.currentKollektiv || currentGlobalKollektiv;
            appliedT2Criteria = initialSettings.appliedT2Criteria ? cloneDeep(initialSettings.appliedT2Criteria) : getDefaultT2Criteria();
            appliedT2Logic = initialSettings.appliedT2Logic || APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
            lang = initialSettings.publicationLang || 'de';
        }
    }

    function updateData(processedData, newSettings) {
        allProcessedData = processedData;
        if (newSettings) {
            currentView = newSettings.presentationView || currentView;
            currentStudyId = newSettings.presentationStudyId || currentStudyId;
            currentGlobalKollektiv = newSettings.currentKollektiv || currentGlobalKollektiv;
            if (newSettings.appliedT2Criteria) appliedT2Criteria = cloneDeep(newSettings.appliedT2Criteria);
            if (newSettings.appliedT2Logic) appliedT2Logic = newSettings.appliedT2Logic;
            lang = newSettings.publicationLang || lang;
        }
    }

    function _displayStudyInfoCard(studySet) {
        const container = document.getElementById('praes-t2-basis-info-card-content');
        if (!container || !studySet || !studySet.studyInfo) {
            if(container) ui_helpers.updateElementHTML(container.id, `<p class="text-muted small">${lang === 'de' ? 'Keine Detailinformationen für die ausgewählte T2-Basis verfügbar.' : 'No detailed information available for the selected T2 basis.'}</p>`);
            return;
        }
        const info = studySet.studyInfo;
        const citationKey = studySet.citationKey ? `[${studySet.citationKey}]` : '';
        const fullReference = PUBLICATION_CONFIG.referenceManagement.references.find(r => r.key === studySet.citationKey)?.text || info.reference || '';

        let html = `<dl class="row small mb-0">`;
        html += `<dt class="col-sm-4">${lang === 'de' ? 'Name / Quelle' : 'Name / Source'}</dt><dd class="col-sm-8">${studySet.name || 'N/A'} ${citationKey}</dd>`;
        if (fullReference) html += `<dt class="col-sm-4">${lang === 'de' ? 'Vollständige Referenz' : 'Full Reference'}</dt><dd class="col-sm-8">${fullReference}</dd>`;
        if (info.patientCohort) html += `<dt class="col-sm-4">${lang === 'de' ? 'Patientenkohorte (Orig.)' : 'Patient Cohort (Orig.)'}</dt><dd class="col-sm-8">${info.patientCohort}</dd>`;
        if (info.investigationType) html += `<dt class="col-sm-4">${lang === 'de' ? 'Untersuchungstyp' : 'Investigation Type'}</dt><dd class="col-sm-8">${info.investigationType}</dd>`;
        if (info.focus) html += `<dt class="col-sm-4">${lang === 'de' ? 'Fokus der Studie' : 'Study Focus'}</dt><dd class="col-sm-8">${info.focus}</dd>`;
        html += `<dt class="col-sm-4">${lang === 'de' ? 'Schlüsselkriterien' : 'Key Criteria'}</dt><dd class="col-sm-8">${studyT2CriteriaManager.formatStudyCriteriaForDisplay(studySet) || 'N/A'}</dd>`;
        html += `</dl>`;
        ui_helpers.updateElementHTML(container.id, html);
    }

    function _renderASPerformanceView() {
        const container = document.getElementById('praesentation-tab-content');
        if (!container || !allProcessedData) return;
        container.innerHTML = '';
        ui_helpers.updateElementHTML('praesentation-tab-content-title', lang === 'de' ? 'Performance des Avocado Signs (AS)' : 'Performance of the Avocado Sign (AS)');

        const kollektiveToDisplay = ['Gesamt', 'direkt OP', 'nRCT'];
        let performanceRowsHTML = '';
        let descriptiveContentHTML = '';

        kollektiveToDisplay.forEach(kolId => {
            const filteredData = dataProcessor.filterDataByKollektiv(allProcessedData, kolId);
            if (filteredData.length > 0) {
                const descriptiveStats = statisticsService.calculateDescriptiveStats(filteredData);
                if (descriptiveStats) {
                     descriptiveContentHTML += tableRenderer.renderDescriptiveStatsTable(descriptiveStats, kolId, lang, true);
                }
                const performanceAS = statisticsService.calculateDiagnosticPerformance(filteredData, 'as', 'n');
                if (performanceAS && performanceAS.matrix) {
                    performanceRowsHTML += `
                        <tr>
                            <td>${getKollektivDisplayName(kolId)}</td>
                            <td>${filteredData.length}</td>
                            <td>${tableRenderer._formatMetricForTableDisplay(performanceAS.sens, true, 1, lang)}</td>
                            <td>${tableRenderer._formatMetricForTableDisplay(performanceAS.spez, true, 1, lang)}</td>
                            <td>${tableRenderer._formatMetricForTableDisplay(performanceAS.ppv, true, 1, lang)}</td>
                            <td>${tableRenderer._formatMetricForTableDisplay(performanceAS.npv, true, 1, lang)}</td>
                            <td>${tableRenderer._formatMetricForTableDisplay(performanceAS.acc, true, 1, lang)}</td>
                            <td>${tableRenderer._formatMetricForTableDisplay(performanceAS.auc, false, 3, lang)}</td>
                        </tr>`;
                }
            }
        });

        const descriptiveCardId = 'praes-as-demographics';
        const performanceCardId = 'praes-as-performance';
        const descriptiveTooltip = TOOLTIP_CONTENT.deskriptiveStatistik.cardTitle.replace('[KOLLEKTIV]', lang==='de'?'Alle relevanten Kollektive':'All relevant cohorts');
        const performanceTooltip = TOOLTIP_CONTENT.diagnostischeGueteAS.cardTitle.replace('[KOLLEKTIV]', lang==='de'?'Alle relevanten Kollektive':'All relevant cohorts');
        const dlButtonsDesc = [{id:'dl-praes-demo-md', format:'md', icon:'fab fa-markdown', tooltipKey:'downloadDemographicsMD'}];
        const dlButtonsPerf = [{id:'dl-praes-perf-as-csv', format:'csv', icon:'fas fa-file-csv', tooltipKey:'downloadPerformanceCSV'}, {id:'dl-praes-perf-as-md', format:'md', icon:'fab fa-markdown', tooltipKey:'downloadPerformanceMD'}];


        let finalHTML = `<div class="row g-3">`;
        finalHTML += uiComponents.createStatistikCard(descriptiveCardId, (lang === 'de' ? 'Deskriptive Statistik (AS-Basis)' : 'Descriptive Statistics (AS Basis)'), descriptiveContentHTML, false, descriptiveTooltip, dlButtonsDesc, 'table-praes-as-demographics');

        const perfTableHTML = `<div class="table-responsive"><table class="table table-sm table-striped table-hover small" id="table-praes-as-performance">
            <thead><tr>
                <th>${lang === 'de' ? 'Kollektiv' : 'Cohort'}</th><th>N</th>
                <th>${lang === 'de' ? 'Sens. (95%-KI)' : 'Sens. (95% CI)'}</th><th>${lang === 'de' ? 'Spez. (95%-KI)' : 'Spec. (95% CI)'}</th>
                <th>PPV (95%-KI)</th><th>NPV (95%-KI)</th>
                <th>${lang === 'de' ? 'Acc. (95%-KI)' : 'Acc. (95% CI)'}</th><th>AUC (95%-KI)</th>
            </tr></thead>
            <tbody>${performanceRowsHTML}</tbody>
        </table></div>`;
        finalHTML += uiComponents.createStatistikCard(performanceCardId, (lang === 'de' ? 'Diagnostische Güte AS' : 'Diagnostic Performance AS'), perfTableHTML, false, performanceTooltip, dlButtonsPerf, 'table-praes-as-performance');
        finalHTML += `</div>`;

        container.innerHTML = finalHTML;
        ui_helpers.initializeTooltips(container);
    }

    function _renderASvsT2View() {
        const container = document.getElementById('praesentation-tab-content');
        if (!container || !allProcessedData) return;
        container.innerHTML = '';

        let t2SetToCompare = null;
        let t2DisplayName = '';
        let t2ShortName = 'T2';
        let kollektivForComparison = currentGlobalKollektiv;

        if (currentStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
            t2SetToCompare = { criteria: cloneDeep(appliedT2Criteria), logic: appliedT2Logic, id: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME, displayShortName: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME };
            t2DisplayName = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
            t2ShortName = lang === 'de' ? 'Angew. T2' : 'Applied T2';
        } else if (currentStudyId) {
            t2SetToCompare = studyT2CriteriaManager.getStudyCriteriaSetById(currentStudyId);
            if (t2SetToCompare) {
                t2DisplayName = t2SetToCompare.name;
                t2ShortName = t2SetToCompare.displayShortName;
                if (t2SetToCompare.applicableKollektiv && t2SetToCompare.applicableKollektiv !== 'Gesamt') {
                    kollektivForComparison = t2SetToCompare.applicableKollektiv;
                }
            }
        }

        ui_helpers.updateElementHTML('praesentation-tab-content-title', `${lang === 'de' ? 'Vergleich: Avocado Sign (AS) vs.' : 'Comparison: Avocado Sign (AS) vs.'} ${t2DisplayName || 'Ausgewählte T2-Basis'} (Kollektiv: ${getKollektivDisplayName(kollektivForComparison)})`);

        if (!t2SetToCompare) {
            container.innerHTML = `<p class="text-warning p-3">${lang === 'de' ? 'Bitte wählen Sie eine T2-Studienbasis für den Vergleich aus.' : 'Please select a T2 study basis for comparison.'}</p>`;
             document.getElementById('praes-t2-basis-info-card').classList.add('d-none');
            return;
        }
         document.getElementById('praes-t2-basis-info-card').classList.remove('d-none');
        _displayStudyInfoCard(t2SetToCompare);

        const filteredData = dataProcessor.filterDataByKollektiv(allProcessedData, kollektivForComparison);
        if (filteredData.length === 0) {
            container.innerHTML = `<p class="text-muted p-3">${lang === 'de' ? 'Keine Daten für das ausgewählte Vergleichskollektiv' : 'No data available for the selected comparison cohort'} '${getKollektivDisplayName(kollektivForComparison)}'.</p>`;
            return;
        }

        const evaluatedDataAS = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), t2CriteriaManager.getAppliedCriteria() /* This should be fixed for AS, as it doesn't use T2 criteria */, 'ODER'); // Placeholder for AS evaluation on this specific cohort
        const performanceAS = statisticsService.calculateDiagnosticPerformance(evaluatedDataAS, 'as', 'n');

        let evaluatedDataT2;
        if (t2SetToCompare.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
            evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), t2SetToCompare.criteria, t2SetToCompare.logic);
        } else {
            evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(filteredData), t2SetToCompare);
        }
        const performanceT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n');
        const comparisonStats = statisticsService.compareDiagnosticMethods(evaluatedDataT2, 'as', 't2', 'n'); // Data needs to have 'as' and 't2' from the same eval for paired tests

        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'];
        const metricDisplayNames = { sens: 'Sensitivität', spez: 'Spezifität', ppv: 'PPV', npv: 'NPV', acc: 'Accuracy', auc: 'AUC' };
        if(lang === 'en') {Object.assign(metricDisplayNames, {sens: 'Sensitivity', spez: 'Specificity'});}

        let performanceTableHTML = `<div class="table-responsive"><table class="table table-sm table-striped table-hover small" id="table-praes-as-vs-t2-performance">
            <thead><tr>
                <th>${lang === 'de' ? 'Metrik' : 'Metric'}</th>
                <th>AS (${lang === 'de' ? 'Wert' : 'Value'})</th>
                <th>${t2ShortName} (${lang === 'de' ? 'Wert' : 'Value'})</th>
            </tr></thead><tbody>`;

        const chartDataComp = [];

        metrics.forEach(key => {
            const isRate = key !== 'auc';
            const digits = key === 'auc' ? 3 : 1;
            const asValue = performanceAS && performanceAS[key] ? tableRenderer._formatMetricForTableDisplay(performanceAS[key], isRate, digits, lang) : 'N/A';
            const t2Value = performanceT2 && performanceT2[key] ? tableRenderer._formatMetricForTableDisplay(performanceT2[key], isRate, digits, lang) : 'N/A';
            performanceTableHTML += `<tr><td>${metricDisplayNames[key]}</td><td>${asValue}</td><td>${t2Value}</td></tr>`;
            if (key === 'sens' || key === 'spez') {
                chartDataComp.push({metric: metricDisplayNames[key], AS: performanceAS?.[key]?.value ?? NaN, T2: performanceT2?.[key]?.value ?? NaN });
            }
        });
        performanceTableHTML += `</tbody></table></div>`;

        let comparisonTestsTableHTML = `<div class="table-responsive mt-2"><table class="table table-sm table-striped table-hover small" id="table-praes-as-vs-t2-tests">
             <thead><tr>
                <th>${lang === 'de' ? 'Test' : 'Test'}</th><th>${lang === 'de' ? 'p-Wert' : 'p-value'}</th><th>${lang === 'de' ? 'Statistik' : 'Statistic'}</th>
             </tr></thead><tbody>`;
        if (comparisonStats && comparisonStats.mcnemar) {
            comparisonTestsTableHTML += `<tr><td>McNemar (Accuracy)</td><td>${getPValueText(comparisonStats.mcnemar.pValue, lang)} ${getStatisticalSignificanceSymbol(comparisonStats.mcnemar.pValue)}</td><td>${lang === 'de' ? 'Χ²' : 'χ²'}=${formatNumber(comparisonStats.mcnemar.statistic,2,'N/A',true)}, df=${comparisonStats.mcnemar.df || 1}</td></tr>`;
        }
        if (comparisonStats && comparisonStats.delong) {
             comparisonTestsTableHTML += `<tr><td>DeLong (AUC)</td><td>${getPValueText(comparisonStats.delong.pValue, lang)} ${getStatisticalSignificanceSymbol(comparisonStats.delong.pValue)}</td><td>Z=${formatNumber(comparisonStats.delong.Z,2,'N/A',true)}, Diff.AUC=${formatNumber(comparisonStats.delong.diffAUC,3,'N/A',true)}</td></tr>`;
        }
        comparisonTestsTableHTML += `</tbody></table></div>`;

        const perfCardId = 'praes-as-vs-t2-performance';
        const perfCardTitle = `${lang === 'de' ? 'Diagnostische Güte: AS vs.' : 'Diagnostic Performance: AS vs.'} ${t2ShortName}`;
        const perfCardTooltip = (TOOLTIP_CONTENT.comparisonTableCard?.description || perfCardTitle).replace('[KOLLEKTIV_PLACEHOLDER]', getKollektivDisplayName(kollektivForComparison));
        const dlButtonsPerfComp = [
            {id:'dl-praes-perf-asvst2-csv', format:'csv', icon:'fas fa-file-csv', tooltipKey:'downloadPerformanceCSV'},
            {id:'dl-praes-perf-asvst2-md', format:'md', icon:'fab fa-markdown', tooltipKey:'downloadPerformanceMD'}
        ];
        const dlButtonsTests = [{id:'dl-praes-tests-asvst2-md', format:'md', icon:'fab fa-markdown', tooltipKey:'downloadCompTestsMD'}];

        const chartCompId = 'chart-praes-as-vs-t2-comparison';
        const chartCompTitle = `${lang === 'de' ? 'Vergleich Sensitivität & Spezifität' : 'Comparison Sensitivity & Specificity'}`;
        const dlButtonsChartComp = [
            {id:'dl-praes-chart-asvst2-png', format:'png', icon:'fa-image', tooltipKey:'downloadCompChartPNG', chartId: chartCompId, chartName: `VergleichASvs${t2ShortName}`},
            {id:'dl-praes-chart-asvst2-svg', format:'svg', icon:'fa-file-code', tooltipKey:'downloadCompChartSVG', chartId: chartCompId, chartName: `VergleichASvs${t2ShortName}`}
        ];

        let finalHTML = `<div class="row g-3">`;
        finalHTML += `<div class="col-lg-6">${uiComponents.createStatistikCard(perfCardId, perfCardTitle, performanceTableHTML + comparisonTestsTableHTML, false, perfCardTooltip, [...dlButtonsPerfComp, ...dlButtonsTests], 'table-praes-as-vs-t2-performance')}</div>`;
        finalHTML += `<div class="col-lg-6">${uiComponents.createStatistikCard(chartCompId + '-card', chartCompTitle, `<div id="${chartCompId}" class="dashboard-chart-container" style="min-height: 300px;"></div>`, true, chartCompTitle, dlButtonsChartComp, null)}</div>`;
        finalHTML += `</div>`;

        container.innerHTML = finalHTML;

        if (chartDataComp.length > 0) {
            chartRenderer.renderComparisonBarChart(chartDataComp, chartCompId, { height: 350, margin: {top: 30, right: 20, bottom: 50, left: 50}, series2LegendLabel: t2ShortName }, 'AS', 'T2');
        } else {
            ui_helpers.updateElementHTML(chartCompId, `<p class="text-muted small text-center p-3">${lang === 'de' ? 'Unvollständige Daten für Vergleichschart.' : 'Incomplete data for comparison chart.'}</p>`);
        }
        ui_helpers.initializeTooltips(container);
    }

    function renderTabContent() {
        ui_helpers.updatePresentationViewSelectorUI(currentView);
        const studySelect = document.getElementById('praes-study-select');
        if(studySelect) studySelect.value = currentStudyId || APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;

        setTimeout(() => {
            try {
                if (currentView === 'as-pur') {
                    _renderASPerformanceView();
                } else if (currentView === 'as-vs-t2') {
                    _renderASvsT2View();
                }
            } catch (error) {
                console.error("Fehler im praesentationTabLogic.renderTabContent:", error);
                const container = document.getElementById('praesentation-tab-content');
                if (container) container.innerHTML = '<p class="text-danger p-3">Ein unerwarteter Fehler ist bei der Anzeige der Präsentationsdaten aufgetreten.</p>';
                ui_helpers.showToast("Fehler beim Anzeigen der Präsentationsdaten.", "danger");
            }
        }, 0);
    }

    function getPresentationDataForExport(view, studyIdToExport) {
        const exportData = { view, studyId: studyIdToExport, kollektiv: '', tables: [] };
        const currentLang = state.getCurrentPublikationLang() || 'de';

        if (view === 'as-pur') {
            exportData.kollektiv = 'Alle relevanten Kollektive';
            const perfRows = [];
            const descRows = [];
            ['Gesamt', 'direkt OP', 'nRCT'].forEach(kolId => {
                const filtered = dataProcessor.filterDataByKollektiv(allProcessedData, kolId);
                if (filtered.length > 0) {
                    const desc = statisticsService.calculateDescriptiveStats(filtered);
                    descRows.push({ Kollektiv: getKollektivDisplayName(kolId), ...desc });
                    const perfAS = statisticsService.calculateDiagnosticPerformance(filtered, 'as', 'n');
                    if (perfAS) perfRows.push({ Kollektiv: getKollektivDisplayName(kolId), N: filtered.length, ...Object.fromEntries(Object.entries(perfAS).map(([k,v]) => [k, v?.value])) });
                }
            });
            exportData.tables.push({ name: 'AS_Performance_Uebersicht', headers: ['Kollektiv', 'N', 'Sens', 'Spez', 'PPV', 'NPV', 'Acc', 'AUC'], data: perfRows});
            exportData.tables.push({ name: 'Deskriptive_Statistik_AS_Basis', headers: ['Kollektiv', 'Merkmal', 'Wert'], data: descRows.flatMap(dr => Object.entries(dr).map(([k,v])=> k !== 'Kollektiv' ? {Kollektiv: dr.Kollektiv, Merkmal: k, Wert: (typeof v === 'object' ? JSON.stringify(v) : v) } : null ).filter(x=>x)) });

        } else if (view === 'as-vs-t2') {
            let t2Set, t2Name, t2Short, kolComp;
             if (studyIdToExport === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                t2Set = { criteria: cloneDeep(appliedT2Criteria), logic: appliedT2Logic };
                t2Name = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
                t2Short = 'Angew. T2';
                kolComp = currentGlobalKollektiv;
            } else if (studyIdToExport) {
                const study = studyT2CriteriaManager.getStudyCriteriaSetById(studyIdToExport);
                if (study) { t2Set = study; t2Name = study.name; t2Short = study.displayShortName; kolComp = study.applicableKollektiv || currentGlobalKollektiv; }
            }
            exportData.kollektiv = getKollektivDisplayName(kolComp);
            if (t2Set) {
                const filtered = dataProcessor.filterDataByKollektiv(allProcessedData, kolComp);
                if (filtered.length > 0) {
                    const evalAS = t2CriteriaManager.evaluateDataset(cloneDeep(filtered), appliedT2Criteria,'ODER'); /* This needs to be fixed for AS eval */
                    const perfAS = statisticsService.calculateDiagnosticPerformance(evalAS, 'as', 'n');
                    const evalT2 = (t2Set.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) ? t2CriteriaManager.evaluateDataset(cloneDeep(filtered), t2Set.criteria, t2Set.logic) : studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(filtered), t2Set);
                    const perfT2 = statisticsService.calculateDiagnosticPerformance(evalT2, 't2', 'n');
                    const compStats = statisticsService.compareDiagnosticMethods(evalT2, 'as', 't2', 'n');

                    const rowsPerf = Object.keys(perfAS || {}).filter(k => k !== 'matrix').map(metricKey => ({ Metrik: metricKey, AS: perfAS?.[metricKey]?.value, [t2Short]: perfT2?.[metricKey]?.value }));
                    exportData.tables.push({name: `Performance_AS_vs_${t2Short.replace(/\s/g,'_')}`, headers:['Metrik', 'AS', t2Short], data: rowsPerf});
                    const rowsTests = [
                        { Test: 'McNemar (Acc)', pWert: compStats?.mcnemar?.pValue, Statistik: compStats?.mcnemar?.statistic },
                        { Test: 'DeLong (AUC)', pWert: compStats?.delong?.pValue, Statistik: compStats?.delong?.Z, DiffAUC: compStats?.delong?.diffAUC }
                    ];
                    exportData.tables.push({name: `Vergleichstests_AS_vs_${t2Short.replace(/\s/g,'_')}`, headers:['Test', 'pWert', 'Statistik', 'DiffAUC'], data: rowsTests});
                }
            }
        }
        return exportData;
    }


    return Object.freeze({
        initialize,
        updateData,
        renderTabContent,
        getPresentationDataForExport
    });

})();
