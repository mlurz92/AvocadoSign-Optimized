const statistikRenderer = (() => {

    function _createDeskriptivTabelleHTML(data, kollektiv) {
        if (!data || !data.count) return '<p class="text-muted p-2">Keine deskriptiven Daten verfügbar.</p>';
        
        const rows = [
            { label: 'Anzahl Patienten', value: formatNumber(data.count, 0) },
            { label: 'Alter (Median, IQR)', value: `${formatNumber(data.age.median, 0)} (${formatNumber(data.age.q1, 0)} - ${formatNumber(data.age.q3, 0)})` },
            { label: 'Geschlechterverteilung (m/w)', value: `${data.gender.m || 0} / ${data.gender.f || 0}` },
            { label: 'Therapie (Direkt OP/nRCT)', value: `${data.therapy['direkt OP'] || 0} / ${data.therapy.nRCT || 0}` }
        ];

        let tableHTML = '<table class="table table-sm table-borderless table-striped mb-0">';
        rows.forEach(row => {
            tableHTML += `<tr><td class="small">${row.label}</td><td class="text-end small"><strong>${row.value}</strong></td></tr>`;
        });
        return `${tableHTML}</table>`;
    }
    
    function _createKonfusionsmatrixHTML(matrix, title) {
        if (!matrix) return '';
        const { rp, fp, fn, rn } = matrix;
        return `
            <h6 class="mt-3 mb-1 small text-muted text-center">${title}</h6>
            <table class="table table-sm table-bordered text-center small mb-0">
                <thead class="table-light">
                    <tr><th></th><th scope="col">Patho N+</th><th scope="col">Patho N-</th></tr>
                </thead>
                <tbody>
                    <tr><th scope="row">Test +</th><td>${rp} (RP)</td><td>${fp} (FP)</td></tr>
                    <tr><th scope="row">Test -</th><td>${fn} (FN)</td><td>${rn} (RN)</td></tr>
                </tbody>
            </table>`;
    }

    function _createPerformanceTabelleHTML(data, key, kollektiv, title) {
        if (!data || !data.matrix) return `<p class="text-muted p-2">Keine Performancedaten für ${title} verfügbar.</p>`;
        const kollektivName = getKollektivDisplayName(kollektiv);

        const metrics = [
            { key: 'sens', label: 'Sensitivität' }, { key: 'spez', label: 'Spezifität' },
            { key: 'ppv', label: 'PPV' }, { key: 'npv', label: 'NPV' },
            { key: 'acc', label: 'Accuracy' }, { key: 'balAcc', label: 'Balanced Accuracy' },
            { key: 'f1', label: 'F1-Score' }, { key: 'auc', label: 'AUC' }
        ];

        let tableHTML = '<table class="table table-sm table-borderless table-striped mb-0">';
        metrics.forEach(metric => {
            const metricData = data[metric.key];
            if (!metricData) return;
            
            const isPercent = metric.key !== 'auc' && metric.key !== 'f1';
            const digits = isPercent ? 1 : 3;
            const formattedValue = formatCI(metricData.value, metricData.ci?.lower, metricData.ci?.upper, digits, isPercent, '--');
            const tooltipDesc = getMetricDescriptionHTML(metric.key, title);
            const tooltipInterp = getMetricInterpretationHTML(metric.key, metricData, title, kollektivName);

            tableHTML += `<tr>
                <td class="small" data-tippy-content="${tooltipDesc}">${metric.label}</td>
                <td class="text-end small" data-tippy-content="${tooltipInterp}"><strong>${formattedValue}</strong></td>
            </tr>`;
        });
        tableHTML += '</table>';
        tableHTML += _createKonfusionsmatrixHTML(data.matrix, `Konfusionsmatrix: ${title}`);
        return tableHTML;
    }

    function _createVergleichstestsTabelleHTML(data, kollektiv) {
        if (!data || !data.mcnemar || !data.delong) return '<p class="text-muted p-2">Keine Vergleichsdaten verfügbar.</p>';
        const kollektivName = getKollektivDisplayName(kollektiv);
        const tests = [
            { key: 'mcnemar', label: 'McNemar-Test (Sens/Spez)', data: data.mcnemar },
            { key: 'delong', label: 'DeLong-Test (AUC)', data: data.delong }
        ];

        let tableHTML = '<table class="table table-sm table-borderless table-striped mb-0">';
        tests.forEach(test => {
            const pValueFormatted = getPValueText(test.data.pValue);
            const tooltipDesc = getTestDescriptionHTML(test.key, 'T2');
            const tooltipInterp = getTestInterpretationHTML(test.key, test.data, kollektivName, 'Avocado Sign', 'T2');

            tableHTML += `<tr>
                <td class="small" data-tippy-content="${tooltipDesc}">${test.label}</td>
                <td class="text-end small" data-tippy-content="${tooltipInterp}"><strong>${pValueFormatted}</strong></td>
            </tr>`;
        });
        return `${tableHTML}</table>`;
    }

    function _createAssoziationsTabelleHTML(data, kollektiv) {
        if (!data) return '<p class="text-muted p-2">Keine Assoziationsdaten verfügbar.</p>';
        const kollektivName = getKollektivDisplayName(kollektiv);
        
        const tests = ['size_mwu', 'form', 'kontur', 'homogenitaet', 'signal'].map(key => {
            if (!data[key]) return null;
            return {
                key,
                label: data[key].featureName || key,
                data: data[key]
            };
        }).filter(Boolean);

        let tableHTML = '<table class="table table-sm table-borderless table-striped mb-0">';
        tests.forEach(test => {
            const pValueFormatted = getPValueText(test.data.pValue);
            const tooltipDesc = getTestDescriptionHTML(test.key, 'N-Status');
            const tooltipInterp = getAssociationInterpretationHTML(test.key, test.data, test.label, kollektivName);

            tableHTML += `<tr>
                <td class="small" data-tippy-content="${tooltipDesc}">${test.label}</td>
                <td class="text-end small" data-tippy-content="${tooltipInterp}"><strong>${pValueFormatted}</strong></td>
            </tr>`;
        });
        return `${tableHTML}</table>`;
    }

    function _renderEinzelLayout(stats, kollektiv) {
        const kollektivName = getKollektivDisplayName(kollektiv);
        const chartDownloadButtons = [
            { format: 'png', chartId: `chart-as-vs-t2-${kollektiv}`, chartName: `Performance_Vergleich_${kollektiv}` },
            { format: 'svg', chartId: `chart-as-vs-t2-${kollektiv}`, chartName: `Performance_Vergleich_${kollektiv}` }
        ];

        return `
            <div class="row g-4">
                <div class="col-lg-6 col-xl-4">${uiComponents.createStatistikCard(`deskriptiv-${kollektiv}`, `Deskriptive Statistik`, _createDeskriptivTabelleHTML(stats.descriptive, kollektiv), true, 'deskriptiveStatistikCard')}</div>
                <div class="col-lg-6 col-xl-4">${uiComponents.createStatistikCard(`performance-as-${kollektiv}`, `Performance Avocado Sign`, _createPerformanceTabelleHTML(stats.avocadoSign, 'as', kollektiv, 'Avocado Sign'), true, 'diagnostischeGueteASCard')}</div>
                <div class="col-lg-6 col-xl-4">${uiComponents.createStatistikCard(`performance-t2-${kollektiv}`, `Performance T2 (angewandt)`, _createPerformanceTabelleHTML(stats.t2, 't2', kollektiv, 'T2'), true, 'diagnostischeGueteT2Card')}</div>
                <div class="col-lg-6 col-xl-6">${uiComponents.createStatistikCard(`vergleich-as-t2-${kollektiv}`, `Vergleich: AS vs. T2`, _createVergleichstestsTabelleHTML(stats.comparison, kollektiv), true, 'statistischerVergleichASvsT2Card')}</div>
                <div class="col-lg-6 col-xl-6">${uiComponents.createStatistikCard(`chart-container-as-vs-t2-${kollektiv}`, `Performance-Vergleich: ${kollektivName}`, `<div id="chart-as-vs-t2-${kollektiv}" class="chart-container"></div>`, false, 'kriterienVergleichstabelleCard', chartDownloadButtons)}</div>
            </div>`;
    }

    function _renderVergleichLayout(stats, kollektiv1, kollektiv2) {
        if (!stats.kollektiv1 || !stats.kollektiv2) {
            return `<p class="p-3 text-center text-muted">Statistikdaten für den Vergleichsmodus konnten nicht geladen werden.</p>`;
        }
        const kollektiv1Name = getKollektivDisplayName(kollektiv1);
        const kollektiv2Name = getKollektivDisplayName(kollektiv2);

        return `
            <div class="row g-4">
                <div class="col-lg-6">
                    <div class="p-2 border rounded h-100">
                        <h4 class="text-center mb-3">Kollektiv: ${kollektiv1Name}</h4>
                        ${_renderEinzelLayout(stats.kollektiv1, kollektiv1)}
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="p-2 border rounded h-100">
                        <h4 class="text-center mb-3">Kollektiv: ${kollektiv2Name}</h4>
                        ${_renderEinzelLayout(stats.kollektiv2, kollektiv2)}
                    </div>
                </div>
            </div>`;
    }

    function render(stats, layout, kollektiv1, kollektiv2) {
        const selectorHTML = `
            <div class="d-flex justify-content-end align-items-center mb-3">
                <div id="statistik-kollektiv-select-1-container" class="me-2 ${layout === 'vergleich' ? '' : 'd-none'}">
                    <label for="statistik-kollektiv-select-1" class="form-label form-label-sm me-1">Kollektiv 1:</label>
                    <select id="statistik-kollektiv-select-1" class="form-select form-select-sm" style="width: auto; display: inline-block;"></select>
                </div>
                <div id="statistik-kollektiv-select-2-container" class="me-3 ${layout === 'vergleich' ? '' : 'd-none'}">
                    <label for="statistik-kollektiv-select-2" class="form-label form-label-sm me-1">Kollektiv 2:</label>
                    <select id="statistik-kollektiv-select-2" class="form-select form-select-sm" style="width: auto; display: inline-block;"></select>
                </div>
                <button id="statistik-toggle-vergleich" class="btn btn-sm btn-outline-primary" data-tippy-content="${TOOLTIP_CONTENT.statistikToggleVergleich.description}">
                    <i class="fas fa-columns me-1"></i> Einzelansicht Aktiv
                </button>
            </div>`;

        let content;
        if (!stats) {
            content = '<p class="p-3 text-center text-muted">Keine Statistikdaten zum Anzeigen vorhanden. Bitte wählen Sie ein Kollektiv aus.</p>';
        } else if (layout === 'vergleich') {
            content = _renderVergleichLayout(stats, kollektiv1, kollektiv2);
        } else {
            content = _renderEinzelLayout(stats, kollektiv1);
        }
        return selectorHTML + content;
    }

    return Object.freeze({
        render
    });

})();
