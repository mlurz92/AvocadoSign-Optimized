const publicationFigures = (() => {

    function renderPatientCharacteristicsFigures(context) {
        const lang = context.currentLanguage;
        const totalPatientsOverall = context.allStats.Gesamt.anzahlPatienten;
        const totalPatientsDirektOP = context.allStats['direkt OP']?.anzahlPatienten || 0;
        const totalPatientsNRCT = context.allStats.nRCT?.anzahlPatienten || 0;

        // Age Distribution Chart
        const ageChartContainerId = 'results_age_distribution_chart_container';
        const ageChartId = APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id;
        const ageChartTitle = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.captionDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.captionEn;
        const ageChartHtml = `
            <figure class="figure-container">
                <div id="${ageChartId}" class="publication-chart-placeholder"></div>
                <figcaption class="figure-caption text-center small mt-2">${ageChartTitle.replace('[TOTAL_PATIENTS_OVERALL]', totalPatientsOverall)}</figcaption>
            </figure>`;
        document.getElementById(ageChartContainerId).innerHTML = ageChartHtml;
        chartRenderer.renderAgeDistributionChart(context.allStats.Gesamt.alterData, ageChartId, {
            width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH + 100,
            height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT,
            margin: { top: 20, right: 20, bottom: 50, left: 50 }
        });


        // Gender Distribution Chart
        const genderChartContainerId = 'results_gender_distribution_chart_container';
        const genderChartId = APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id;
        const genderChartTitle = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.captionDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.captionEn;
        const genderChartHtml = `
            <figure class="figure-container">
                <div id="${genderChartId}" class="publication-chart-placeholder"></div>
                <figcaption class="figure-caption text-center small mt-2">${genderChartTitle.replace('[TOTAL_PATIENTS_OVERALL]', totalPatientsOverall)}</figcaption>
            </figure>`;
        document.getElementById(genderChartContainerId).innerHTML = genderChartHtml;
        chartRenderer.renderPieChart(
            [
                { label: lang === 'de' ? APP_CONFIG.UI_TEXTS.legendLabels.male : 'Male', value: context.allStats.Gesamt.geschlecht.m },
                { label: lang === 'de' ? APP_CONFIG.UI_TEXTS.legendLabels.female : 'Female', value: context.allStats.Gesamt.geschlecht.f }
            ],
            genderChartId,
            {
                width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - 50,
                height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - 50,
                margin: { top: 20, right: 20, bottom: 20, left: 20 },
                legendBelow: true,
                outerRadiusFactor: 0.8
            }
        );
    }

    function renderComparisonCharts(context) {
        const lang = context.currentLanguage;
        const bfMetricDisplayName = APP_CONFIG.PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === context.currentBruteForceMetric)?.label || context.currentBruteForceMetric;

        const metricsToCompare = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'];
        const getChartData = (stats, lang) => {
            if (!stats?.gueteAS || !stats?.gueteT2_bruteforce) return [];
            return metricsToCompare.map(metricKey => {
                const asVal = stats.gueteAS?.[metricKey]?.value ?? NaN;
                const t2Val = stats.gueteT2_bruteforce?.[metricKey]?.value ?? NaN;
                let displayName = APP_CONFIG.UI_TEXTS.t2MetricsOverview[metricKey + 'Short'] || metricKey;
                if (lang === 'de') {
                     // Translate metric names for German charts if necessary
                     if (metricKey === 'sens') displayName = 'Sens.';
                     else if (metricKey === 'spez') displayName = 'Spez.';
                     else if (metricKey === 'acc') displayName = 'Acc.';
                     else if (metricKey === 'balAcc') displayName = 'Bal. Acc.';
                }

                return { metric: displayName, AS: asVal, T2: t2Val };
            }).filter(d => !isNaN(d.AS) || !isNaN(d.T2));
        };

        const renderSingleComparisonChart = (kollektivId, chartElementId, captionElementId, titleKey, totalPatients) => {
            const stats = context.allStats[kollektivId];
            if (!stats) {
                 document.getElementById(chartElementId).innerHTML = `<p class="text-muted small text-center p-2">${lang === 'de' ? 'Daten für dieses Kollektiv nicht verfügbar.' : 'Data not available for this cohort.'}</p>`;
                 document.getElementById(captionElementId).textContent = '';
                 return;
            }

            const chartData = getChartData(stats, lang);
            const caption = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse[titleKey].captionDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse[titleKey].captionEn;
            const formattedCaption = caption
                .replace('[TOTAL_PATIENTS_OVERALL]', totalPatients)
                .replace('[TOTAL_PATIENTS_DIREKTOP]', totalPatients)
                .replace('[TOTAL_PATIENTS_NRCT]', totalPatients); // Need to make this dynamic to specific subgroup count
            
            let finalCaption = formattedCaption;
            if (kollektivId === 'Gesamt') finalCaption = formattedCaption.replace('N=[TOTAL_PATIENTS_OVERALL]', `N=${context.allStats.Gesamt.anzahlPatienten}`);
            if (kollektivId === 'direkt OP') finalCaption = formattedCaption.replace('N=[TOTAL_PATIENTS_DIREKTOP]', `N=${context.allStats['direkt OP']?.anzahlPatienten}`);
            if (kollektivId === 'nRCT') finalCaption = formattedCaption.replace('N=[TOTAL_PATIENTS_NRCT]', `N=${context.allStats.nRCT?.anzahlPatienten}`);


            document.getElementById(captionElementId).textContent = finalCaption;
            chartRenderer.renderComparisonBarChart(chartData, chartElementId, {
                t2Label: lang === 'de' ? `Opt. T2 (${bfMetricDisplayName})` : `Opt. T2 (${bfMetricDisplayName})`,
                width: APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH + 150,
                height: APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT + 50,
                margin: { top: 20, right: 20, bottom: 60, left: 60 }
            });
        };

        // Overall Cohort Chart
        const overallChartContainerId = 'results_comparison_chart_gesamt_container';
        const overallChartId = APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.id;
        const overallChartTitle = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.captionDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.captionEn;
        const overallHtml = `
            <figure class="figure-container">
                <div id="${overallChartId}" class="publication-chart-placeholder"></div>
                <figcaption class="figure-caption text-center small mt-2" id="${overallChartId}-caption">${overallChartTitle}</figcaption>
            </figure>`;
        document.getElementById(overallChartContainerId).innerHTML = overallHtml;
        renderSingleComparisonChart('Gesamt', overallChartId, `${overallChartId}-caption`, 'vergleichPerformanceChartGesamt', context.allStats.Gesamt.anzahlPatienten);


        // Upfront Surgery Cohort Chart
        const direktOPChartContainerId = 'results_comparison_chart_direkt_op_container';
        const direktOPChartId = APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartdirektOP.id;
        const direktOPChartTitle = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartdirektOP.captionDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartdirektOP.captionEn;
        const direktOPHtml = `
            <figure class="figure-container">
                <div id="${direktOPChartId}" class="publication-chart-placeholder"></div>
                <figcaption class="figure-caption text-center small mt-2" id="${direktOPChartId}-caption">${direktOPChartTitle}</figcaption>
            </figure>`;
        document.getElementById(direktOPChartContainerId).innerHTML = direktOPHtml;
        renderSingleComparisonChart('direkt OP', direktOPChartId, `${direktOPChartId}-caption`, 'vergleichPerformanceChartdirektOP', context.allStats['direkt OP']?.anzahlPatienten);

        // nRCT Cohort Chart
        const nRCTChartContainerId = 'results_comparison_chart_nrct_container';
        const nRCTChartId = APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartnRCT.id;
        const nRCTChartTitle = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartnRCT.captionDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartnRCT.captionEn;
        const nRCTHtml = `
            <figure class="figure-container">
                <div id="${nRCTChartId}" class="publication-chart-placeholder"></div>
                <figcaption class="figure-caption text-center small mt-2" id="${nRCTChartId}-caption">${nRCTChartTitle}</figcaption>
            </figure>`;
        document.getElementById(nRCTChartContainerId).innerHTML = nRCTHtml;
        renderSingleComparisonChart('nRCT', nRCTChartId, `${nRCTChartId}-caption`, 'vergleichPerformanceChartnRCT', context.allStats.nRCT?.anzahlPatienten);

    }

    function renderMethodsFlowchart(context) {
        const lang = context.currentLanguage;
        const totalPatients = context.rawData.length;
        const caption = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.captionDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.captionEn;
        const formattedCaption = caption.replace('[TOTAL_PATIENTS_ALL_COLLECTIVE]', totalPatients);

        const flowChartHtml = `
            <figure class="figure-container">
                <div id="flowchart-diagram" style="width: 100%; height: 250px;">
                    <p class="text-center text-muted small">${lang === 'de' ? 'Flussdiagramm Platzhalter' : 'Flowchart placeholder'}</p>
                    <p class="text-center text-muted small"><em>${lang === 'de' ? '(Diese Abbildung müsste manuell erstellt und hier platziert werden, z.B. als SVG/PNG)' : '(This figure would need to be manually created and placed here, e.g., as SVG/PNG)'}</em></p>
                </div>
                <figcaption class="figure-caption text-center small mt-2">${formattedCaption}</figcaption>
            </figure>
        `;
        document.getElementById('methoden_patienten_flow_chart_container').innerHTML = flowChartHtml;
    }


    return Object.freeze({
        renderPatientCharacteristicsFigures,
        renderComparisonCharts,
        renderMethodsFlowchart
    });

})();
