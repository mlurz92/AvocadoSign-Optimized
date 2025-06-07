const praesentationRenderer = (() => {

    function _createViewSelectorHTML(currentView, studyData, selectedStudyId) {
        const studyOptions = studyData.map(study =>
            `<option value="${study.id}" ${study.id === selectedStudyId ? 'selected' : ''}>${study.name}</option>`
        ).join('');

        return `
            <div class="d-flex flex-wrap justify-content-center align-items-center mb-4 p-2 rounded bg-light border">
                <div class="btn-group me-3 mb-2 mb-md-0" role="group" aria-label="Ansicht auswählen">
                    <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as-pur" value="as-pur" ${currentView === 'as-pur' ? 'checked' : ''}>
                    <label class="btn btn-sm btn-outline-primary" for="praes-ansicht-as-pur" data-tippy-content="Zeigt Demographie und Performance des Avocado Signs für das Gesamtkollektiv.">
                        <i class="fas fa-seedling me-1"></i>AS Pur
                    </label>
                    <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-ansicht-as-vs-t2" value="as-vs-t2" ${currentView === 'as-vs-t2' ? 'checked' : ''}>
                    <label class="btn btn-sm btn-outline-primary" for="praes-ansicht-as-vs-t2" data-tippy-content="Vergleicht die Performance des Avocado Signs mit etablierten T2-Kriterien-Sets.">
                        <i class="fas fa-balance-scale me-1"></i>AS vs. T2
                    </label>
                </div>
                <div id="praes-study-select-group" class="d-flex align-items-center ${currentView === 'as-vs-t2' ? '' : 'd-none'}">
                    <label for="praes-study-select" class="form-label form-label-sm me-2 mb-0">Vergleichsstudie:</label>
                    <select id="praes-study-select" class="form-select form-select-sm" style="width: auto;">
                        ${studyOptions}
                    </select>
                </div>
            </div>`;
    }

    function _createDemographicsTableHTML(stats) {
        if (!stats) return '<p class="text-muted p-2">Keine Demographiedaten verfügbar.</p>';
        const rows = [
            { label: 'Anzahl Patienten (n)', value: formatNumber(stats.count, 0) },
            { label: 'Medianes Alter (Jahre)', value: formatNumber(stats.age.median, 0) },
            { label: 'Interquartilsabstand Alter', value: `${formatNumber(stats.age.q1, 0)} - ${formatNumber(stats.age.q3, 0)}` },
            { label: 'Geschlecht (m / w)', value: `${formatNumber(stats.gender.m, 0)} / ${formatNumber(stats.gender.f, 0)}` },
            { label: 'Therapie (pRCT / nRCT)', value: `${formatNumber(stats.therapy['direkt OP'], 0)} / ${formatNumber(stats.therapy.nRCT, 0)}` },
            { label: 'Histologie N+ / N-', value: `${formatNumber(stats.nStatus.positive, 0)} / ${formatNumber(stats.nStatus.negative, 0)}` }
        ];
        let tableHTML = '<table class="table table-sm table-striped table-borderless mb-0">';
        rows.forEach(row => {
            tableHTML += `<tr><td class="small">${row.label}</td><td class="text-end small"><strong>${row.value}</strong></td></tr>`;
        });
        tableHTML += '</table>';
        return tableHTML;
    }

    function _createPerformanceTableHTML(stats, title, keyPrefix, kollektivName = 'Gesamt') {
        if (!stats) return `<p class="text-muted p-2">Keine Performancedaten für ${title} verfügbar.</p>`;
        const metrics = [
            { key: 'sens', label: 'Sensitivität' },
            { key: 'spez', label: 'Spezifität' },
            { key: 'ppv', label: 'PPV' },
            { key: 'npv', label: 'NPV' },
            { key: 'acc', label: 'Accuracy' },
            { key: 'balAcc', label: 'Balanced Accuracy' }
        ];
        let tableHTML = '<table class="table table-sm table-striped table-borderless mb-0">';
        metrics.forEach(metric => {
            const metricData = stats[metric.key];
            const formattedValue = formatCI(metricData?.value, metricData?.ci?.lower, metricData?.ci?.upper, 1, true, '--');
            const tooltipInterp = uiHelpers.getMetricInterpretationHTML(metric.key, metricData, title, kollektivName);
            tableHTML += `<tr><td class="small">${metric.label}</td><td class="text-end small" data-tippy-content="${tooltipInterp}"><strong>${formattedValue}</strong></td></tr>`;
        });
        tableHTML += '</table>';
        return tableHTML;
    }

    function _createComparisonTableHTML(stats, asTitle, t2Title, kollektivName = 'Gesamt') {
        if (!stats) return '<p class="text-muted p-2">Keine Vergleichsdaten verfügbar.</p>';
        const metrics = ['sens', 'spez', 'ppv', 'npv', 'balAcc', 'auc'];
        const metricLabels = { sens: 'Sensitivität', spez: 'Spezifität', ppv: 'PPV', npv: 'NPV', balAcc: 'Balanced Acc.', auc: 'AUC' };

        let tableHTML = '<table class="table table-sm table-striped table-bordered text-center mb-0">';
        tableHTML += '<thead><tr><th scope="col" class="small">Metrik</th><th scope="col" class="small">Avocado Sign</th><th scope="col" class="small">T2-Kriterien</th></tr></thead><tbody>';

        metrics.forEach(metric => {
            const asData = stats.avocadoSign?.[metric];
            const t2Data = stats.t2?.[metric];
            const isPercent = metric !== 'auc';
            const digits = metric === 'auc' ? 3 : 1;

            const asFormatted = formatCI(asData?.value, asData?.ci?.lower, asData?.ci?.upper, digits, isPercent, '--');
            const t2Formatted = formatCI(t2Data?.value, t2Data?.ci?.lower, t2Data?.ci?.upper, digits, isPercent, '--');

            const asTooltip = uiHelpers.getMetricInterpretationHTML(metric, asData, asTitle, kollektivName);
            const t2Tooltip = uiHelpers.getMetricInterpretationHTML(metric, t2Data, t2Title, kollektivName);

            tableHTML += `
                <tr>
                    <td class="small text-start"><strong>${metricLabels[metric]}</strong></td>
                    <td class="small" data-tippy-content="${asTooltip}">${asFormatted}</td>
                    <td class="small" data-tippy-content="${t2Tooltip}">${t2Formatted}</td>
                </tr>`;
        });
        tableHTML += '</tbody></table>';
        return tableHTML;
    }

    function _createComparisonTestsTableHTML(stats, kollektivName = 'Gesamt') {
        if (!stats || !stats.mcnemar || !stats.delong) return '<p class="text-muted p-2">Keine Testdaten verfügbar.</p>';
        const tests = [
            { key: 'mcnemar', label: 'McNemar-Test (Sens/Spez)', data: stats.mcnemar },
            { key: 'delong', label: 'DeLong-Test (AUC)', data: stats.delong }
        ];
        let tableHTML = '<table class="table table-sm table-striped table-borderless mb-0">';
        tests.forEach(test => {
            const pValueFormatted = getPValueText(test.data.pValue);
            const sigSymbol = getStatisticalSignificanceSymbol(test.data.pValue);
            const tooltip = uiHelpers.getTestInterpretationHTML(test.key, test.data, kollektivName, 'Avocado Sign', 'T2');
            tableHTML += `<tr><td class="small">${test.label}</td><td class="text-end small" data-tippy-content="${tooltip}">p = <strong>${pValueFormatted}</strong> ${sigSymbol}</td></tr>`;
        });
        tableHTML += '</tbody></table>';
        return tableHTML;
    }

    function _createAsPurViewHTML(stats) {
        const currentKollektiv = stateManager.getCurrentKollektiv();
        const kollektivDisplayName = getKollektivDisplayName(currentKollektiv);
        if (!stats) return '<p class="p-3 text-center text-muted">Statistikdaten für die "AS Pur"-Ansicht konnten nicht geladen werden.</p>';

        const demographicsCard = uiComponents.createStatistikCard(
            'praes-demographics-as-pur',
            'Demographie (Gesamtkollektiv)', // Title remains generic
            _createDemographicsTableHTML(stats.descriptive),
            true, 'praesentation.demographicsCard',
            [{ id: 'download-demographics-as-pur-md', format: 'md', icon: 'fa-file-alt', tooltip: TOOLTIP_CONTENT.praesentation.downloadDemographicsMD.description }]
        );

        const performanceCard = uiComponents.createStatistikCard(
            'praes-performance-as-pur',
            'Performance Avocado Sign', // Title remains generic
            _createPerformanceTableHTML(stats.avocadoSign, 'Avocado Sign', 'as', kollektivDisplayName),
            true, 'praesentation.asPerformanceCard',
            [{ id: 'download-performance-as-pur-csv', format: 'csv', icon: 'fa-file-csv', tooltip: TOOLTIP_CONTENT.praesentation.downloadPerformanceCSV.description },
             { id: 'download-performance-as-pur-md', format: 'md', icon: 'fa-file-alt', tooltip: TOOLTIP_CONTENT.praesentation.downloadPerformanceMD.description }]
        );

        const chartCard = uiComponents.createStatistikCard(
            'praes-chart-container-as-pur',
            'Performance-Chart', // Title remains generic
            '<div id="praes-chart-as-pur" class="chart-container" style="min-height: 350px;"></div>',
            true, 'praesentation.asVsT2ChartCard', // Reusing tooltip for chart card
            [{ format: 'png', chartId: 'praes-chart-as-pur', chartName: 'Performance_AS_Pur', tooltip: TOOLTIP_CONTENT.praesentation.downloadCompChartPNG.description },
             { format: 'svg', chartId: 'praes-chart-as-pur', chartName: 'Performance_AS_Pur', tooltip: TOOLTIP_CONTENT.praesentation.downloadCompChartSVG.description }]
        );

        return `<div class="row g-4">${demographicsCard}${performanceCard}${chartCard}</div>`;
    }

    function _createAsVsT2ViewHTML(stats, study) {
        const currentKollektiv = stateManager.getCurrentKollektiv(); // Use global kollektiv for overall context
        const kollektivDisplayName = getKollektivDisplayName(currentKollektiv);
        const studyDisplayName = study?.displayShortName || study?.name || 'N/A';
        const studyApplicableKollektiv = study?.applicableKollektiv;
        const displayKollektivForStudy = studyApplicableKollektiv && studyApplicableKollektiv !== currentKollektiv ?
                                         `${kollektivDisplayName} (Studie: ${getKollektivDisplayName(studyApplicableKollektiv)})` :
                                         kollektivDisplayName;
        
        if (!stats || !study) return '<p class="p-3 text-center text-muted">Vergleichsdaten für die ausgewählte Studie konnten nicht geladen werden.</p>';

        const t2BasisInfoCard = uiComponents.createStatistikCard(
            'praes-t2-basis-info',
            'Informationen zur T2-Vergleichsbasis',
            `
            <p class="small mb-1"><strong>Studien-Set:</strong> ${studyDisplayName}</p>
            <p class="small mb-1"><strong>Beschreibung:</strong> ${study.description || 'N/A'}</p>
            <p class="small mb-1"><strong>Angewandte Kriterien:</strong> ${studyCriteriaManager.formatStudyCriteriaForDisplay(study)}</p>
            <p class="small mb-0"><strong>Angewandt auf Kollektiv:</strong> ${displayKollektivForStudy}</p>
            `,
            true, 'praesentation.t2BasisInfoCard',
            [{ id: `download-praes-t2-info-md`, format: 'md', icon: 'fa-file-alt', tooltip: TOOLTIP_CONTENT.praesentation['download-praes-t2-info-md'].description }]
        );

        const comparisonTableCard = uiComponents.createStatistikCard(
            'praes-comp-table-as-vs-t2',
            `Performance-Vergleich: AS vs. ${studyDisplayName}`,
            _createComparisonTableHTML(stats, 'Avocado Sign', studyDisplayName, kollektivDisplayName),
            true, 'praesentation.asVsT2PerformanceCard',
            [{ id: 'download-performance-as-vs-t2-csv', format: 'csv', icon: 'fa-file-csv', tooltip: TOOLTIP_CONTENT.praesentation.downloadPerformanceCSV.description },
             { id: 'download-comp-table-as-vs-t2-md', format: 'md', icon: 'fa-file-alt', tooltip: TOOLTIP_CONTENT.praesentation.downloadCompTableMD.description }]
        );

        const comparisonTestsCard = uiComponents.createStatistikCard(
            'praes-comp-tests-as-vs-t2',
            'Statistische Tests',
            _createComparisonTestsTableHTML(stats.comparison, kollektivDisplayName),
            true, 'praesentation.asVsT2TestsCard',
            [{ id: 'download-tests-as-vs-t2-md', format: 'md', icon: 'fa-file-alt', tooltip: TOOLTIP_CONTENT.praesentation.downloadCompTestsMD.description }]
        );

        const chartCard = uiComponents.createStatistikCard(
            'praes-chart-container-as-vs-t2',
            `Performance-Vergleichs-Chart: AS vs. ${studyDisplayName}`,
            '<div id="praes-chart-as-vs-t2" class="chart-container" style="min-height: 400px;"></div>',
            true, 'praesentation.asVsT2ChartCard',
            [{ format: 'png', chartId: 'praes-chart-as-vs-t2', chartName: `Vergleich_AS_vs_${study.id}`, tooltip: TOOLTIP_CONTENT.praesentation.downloadCompChartPNG.description },
             { format: 'svg', chartId: 'praes-chart-as-vs-t2', chartName: `Vergleich_AS_vs_${study.id}`, tooltip: TOOLTIP_CONTENT.praesentation.downloadCompChartSVG.description }]
        );

        return `<div class="row g-4">${t2BasisInfoCard}${comparisonTableCard}${comparisonTestsCard}${chartCard}</div>`;
    }

    function render(currentView, stats, selectedStudyId) {
        const studyData = studyCriteriaManager.getStudyListForPresentation();
        let contentHTML = _createViewSelectorHTML(currentView, studyData, selectedStudyId);

        if (currentView === 'as-pur') {
            contentHTML += _createAsPurViewHTML(stats.asPur);
        } else if (currentView === 'as-vs-t2') {
            const selectedStudy = studyCriteriaManager.getStudyCriteriaSetById(selectedStudyId);
            contentHTML += _createAsVsT2ViewHTML(stats.asVsT2, selectedStudy);
        } else {
            contentHTML += '<p class="p-3 text-center text-muted">Bitte wählen Sie eine Ansicht aus.</p>';
        }

        return contentHTML;
    }

    return Object.freeze({
        render
    });

})();
