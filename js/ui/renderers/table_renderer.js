const tableRenderer = (() => {

    function _createPatientRowDetailsHTML(patient) {
        if (!patient || !Array.isArray(patient.lymphknoten_t2_bewertet) || patient.lymphknoten_t2_bewertet.length === 0) {
            return `
                <tr class="sub-row">
                    <td colspan="9" class="p-0">
                        <div class="collapse p-2" id="patient-details-${patient.nr}">
                            <div class="alert alert-info py-2 px-3 m-0 small">${APP_CONFIG.UI_TEXTS.global.noT2LNNodesFound}</div>
                        </div>
                    </td>
                </tr>`;
        }

        const lkDetailsHTML = patient.lymphknoten_t2_bewertet.map((lk, index) => {
            if (!lk) return `<tr><td colspan="7" class="text-muted small">${APP_CONFIG.UI_TEXTS.global.invalidLKData}</td></tr>`;

            const criteriaChecks = lk.checkResult || {};
            const isPositive = lk.isPositive;
            const rowClass = isPositive ? 'table-warning' : ''; // Highlight if node is positive based on applied criteria

            return `
                <tr class="${rowClass}">
                    <td class="text-center small">${index + 1}</td>
                    <td class="small">${formatNumber(lk.groesse, 1)} mm ${ui_helpers.getT2IconSVG('ruler-horizontal')}</td>
                    <td class="small text-center ${criteriaChecks.form === true ? 'text-success fw-bold' : (criteriaChecks.form === false ? 'text-danger' : 'text-muted')}">${lk.form || APP_CONFIG.UI_TEXTS.global.notApplicableShort} ${ui_helpers.getT2IconSVG('form', lk.form)}</td>
                    <td class="small text-center ${criteriaChecks.kontur === true ? 'text-success fw-bold' : (criteriaChecks.kontur === false ? 'text-danger' : 'text-muted')}">${lk.kontur || APP_CONFIG.UI_TEXTS.global.notApplicableShort} ${ui_helpers.getT2IconSVG('kontur', lk.kontur)}</td>
                    <td class="small text-center ${criteriaChecks.homogenitaet === true ? 'text-success fw-bold' : (criteriaChecks.homogenitaet === false ? 'text-danger' : 'text-muted')}">${lk.homogenitaet || APP_CONFIG.UI_TEXTS.global.notApplicableShort} ${ui_helpers.getT2IconSVG('homogenitaet', lk.homogenitaet)}</td>
                    <td class="small text-center ${criteriaChecks.signal === true ? 'text-success fw-bold' : (criteriaChecks.signal === false ? 'text-danger' : 'text-muted')}">${lk.signal || APP_CONFIG.UI_TEXTS.global.notApplicableShort} ${ui_helpers.getT2IconSVG('signal', lk.signal)}</td>
                    <td class="text-center small">
                        ${isPositive ? `<span class="badge bg-danger">${APP_CONFIG.UI_TEXTS.global.positiveShort}</span>` : `<span class="badge bg-success">${APP_CONFIG.UI_TEXTS.global.negativeShort}</span>`}
                    </td>
                </tr>`;
        }).join('');

        const tableHeader = `
            <thead>
                <tr class="table-active">
                    <th class="small text-center" style="width: 5%;">#</th>
                    <th class="small" style="width: 15%;">${APP_CONFIG.UI_TEXTS.global.size}</th>
                    <th class="small text-center" style="width: 15%;">${APP_CONFIG.UI_TEXTS.global.form}</th>
                    <th class="small text-center" style="width: 15%;">${APP_CONFIG.UI_TEXTS.global.contour}</th>
                    <th class="small text-center" style="width: 20%;">${APP_CONFIG.UI_TEXTS.global.homogeneity}</th>
                    <th class="small text-center" style="width: 20%;">${APP_CONFIG.UI_TEXTS.global.signal}</th>
                    <th class="small text-center" style="width: 10%;">${APP_CONFIG.UI_TEXTS.global.t2Status}</th>
                </tr>
            </thead>`;

        return `
            <tr class="sub-row">
                <td colspan="9" class="p-0">
                    <div class="collapse p-2" id="patient-details-${patient.nr}">
                        <div class="card card-body p-0 small">
                            <h6 class="ps-3 pt-2 mb-1">${APP_CONFIG.UI_TEXTS.global.evaluatedT2LNNodes} (${patient.lymphknoten_t2_bewertet.length}):</h6>
                            <div class="table-responsive">
                                <table class="table table-bordered table-sm m-0">
                                    ${tableHeader}
                                    <tbody>
                                        ${lkDetailsHTML}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>`;
    }

    function renderDataTable(patients, currentSort) {
        const tableBody = document.getElementById('daten-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (!Array.isArray(patients) || patients.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-3">${APP_CONFIG.UI_TEXTS.global.noDataAvailable}</td></tr>`;
            return;
        }

        const sortedPatients = [...patients].sort(getSortFunction(currentSort.key, currentSort.direction, currentSort.subKey));

        const rowsHTML = sortedPatients.map(p => {
            const rowId = `patient-row-${p.nr}`;
            const detailsId = `patient-details-${p.nr}`;
            const hasT2Data = Array.isArray(p.lymphknoten_t2) && p.lymphknoten_t2.length > 0;
            const collapseToggleHTML = hasT2Data ? `
                <button class="btn btn-sm btn-link p-0 ps-2" type="button" data-bs-toggle="collapse" data-bs-target="#${detailsId}" aria-expanded="false" aria-controls="${detailsId}" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.datenTable.expandRow}">
                    <i class="fas fa-chevron-down row-toggle-icon"></i>
                </button>` : '';

            const statusNClass = p.n === '+' ? 'text-danger' : (p.n === '-' ? 'text-success' : 'text-muted');
            const statusASClass = p.as === '+' ? 'text-danger' : (p.as === '-' ? 'text-success' : 'text-muted');
            const statusT2Class = p.t2 === '+' ? 'text-danger' : (p.t2 === '-' ? 'text-success' : 'text-muted');

            return `
                <tr id="${rowId}" data-bs-toggle="collapse" data-bs-target="#${detailsId}" aria-expanded="false" aria-controls="${detailsId}" role="button" class="clickable-row">
                    <td>${p.nr}</td>
                    <td>${p.name}</td>
                    <td>${p.vorname || APP_CONFIG.UI_TEXTS.global.notApplicableShort}</td>
                    <td>${p.geschlecht || APP_CONFIG.UI_TEXTS.global.notApplicableShort}</td>
                    <td>${formatNumber(p.alter, 0, APP_CONFIG.UI_TEXTS.global.notApplicableShort)}</td>
                    <td>${p.therapie || APP_CONFIG.UI_TEXTS.global.notApplicableShort}</td>
                    <td>
                        <span class="${statusNClass}">${p.n || APP_CONFIG.UI_TEXTS.global.notApplicableShort}</span> /
                        <span class="${statusASClass}">${p.as || APP_CONFIG.UI_TEXTS.global.notApplicableShort}</span> /
                        <span class="${statusT2Class}">${p.t2 || APP_CONFIG.UI_TEXTS.global.notApplicableShort}
                        ${collapseToggleHTML}
                    </td>
                    <td>${p.anzahl_patho_n_plus_lk}/${p.anzahl_patho_lk}</td>
                    <td>${p.bemerkung || APP_CONFIG.UI_TEXTS.global.none}</td>
                </tr>
                ${_createPatientRowDetailsHTML(p)}`;
        }).join('');

        tableBody.innerHTML = rowsHTML;
        ui_helpers.attachRowCollapseListeners(tableBody);
        ui_helpers.initializeTooltips(tableBody);
    }

    function renderAuswertungTable(patients, currentSort) {
        const tableBody = document.getElementById('auswertung-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (!Array.isArray(patients) || patients.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-3">${APP_CONFIG.UI_TEXTS.global.noDataAvailable}</td></tr>`;
            return;
        }
        const sortedPatients = [...patients].sort(getSortFunction(currentSort.key, currentSort.direction, currentSort.subKey));

        const rowsHTML = sortedPatients.map(p => {
            const rowId = `auswertung-patient-row-${p.nr}`;
            const detailsId = `patient-details-${p.nr}`;
            const hasT2Data = Array.isArray(p.lymphknoten_t2_bewertet) && p.lymphknoten_t2_bewertet.length > 0;
            const collapseToggleHTML = hasT2Data ? `
                <button class="btn btn-sm btn-link p-0 ps-2" type="button" data-bs-toggle="collapse" data-bs-target="#${detailsId}" aria-expanded="false" aria-controls="${detailsId}" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.auswertungTable.expandRow}">
                    <i class="fas fa-chevron-down row-toggle-icon"></i>
                </button>` : '';

            const statusNClass = p.n === '+' ? 'text-danger' : (p.n === '-' ? 'text-success' : 'text-muted');
            const statusASClass = p.as === '+' ? 'text-danger' : (p.as === '-' ? 'text-success' : 'text-muted');
            const statusT2Class = p.t2 === '+' ? 'text-danger' : (p.t2 === '-' ? 'text-success' : 'text-muted');

            return `
                <tr id="${rowId}" data-bs-toggle="collapse" data-bs-target="#${detailsId}" aria-expanded="false" aria-controls="${detailsId}" role="button" class="clickable-row">
                    <td>${p.nr}</td>
                    <td>${p.name}</td>
                    <td>${p.therapie || APP_CONFIG.UI_TEXTS.global.notApplicableShort}</td>
                    <td>
                        <span class="${statusNClass}">${p.n || APP_CONFIG.UI_TEXTS.global.notApplicableShort}</span> /
                        <span class="${statusASClass}">${p.as || APP_CONFIG.UI_TEXTS.global.notApplicableShort}</span> /
                        <span class="${statusT2Class}">${p.t2 || APP_CONFIG.UI_TEXTS.global.notApplicableShort}</span>
                        ${collapseToggleHTML}
                    </td>
                    <td>${p.anzahl_patho_n_plus_lk}/${p.anzahl_patho_lk}</td>
                    <td>${p.anzahl_as_plus_lk}/${p.anzahl_as_lk}</td>
                    <td>${p.anzahl_t2_plus_lk}/${p.anzahl_t2_lk}</td>
                </tr>
                ${_createPatientRowDetailsHTML(p)}`;
        }).join('');

        tableBody.innerHTML = rowsHTML;
        ui_helpers.attachRowCollapseListeners(tableBody);
        ui_helpers.initializeTooltips(tableBody);
    }

    function renderDescriptiveStatsTable(descriptiveStats, targetElementId, options = {}) {
        const tableBody = document.getElementById(targetElementId);
        if (!tableBody) return;
        tableBody.innerHTML = '';

        const data = descriptiveStats;
        const totalPatients = data.anzahlPatienten;

        const formatCountPercent = (count, total, placeholder = APP_CONFIG.UI_TEXTS.global.notApplicApplicableShort) => {
            if (total === 0) return placeholder;
            return `${formatNumber(count, 0)} (${formatPercent(count / total, 1)})`;
        };

        const renderRow = (label, value1, value2, tooltipKey = null) => {
            const tooltipContent = tooltipKey ? APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.deskriptiveStatistik[tooltipKey]?.description || '' : '';
            return `<tr>
                        <td class="small ${tooltipContent ? 'has-tooltip' : ''}" ${tooltipContent ? `data-tippy-content="${tooltipContent}"` : ''}>${label}</td>
                        <td class="small text-end">${value1}</td>
                        <td class="small text-end">${value2 || APP_CONFIG.UI_TEXTS.global.notApplicableShort}</td>
                    </tr>`;
        };

        let html = '';

        if (totalPatients === 0) {
            html += `<tr><td colspan="3" class="text-center text-muted small py-3">${APP_CONFIG.UI_TEXTS.global.noDataAvailable}</td></tr>`;
        } else {
            // Age
            const ageStats = data.alter;
            html += renderRow(
                APP_CONFIG.UI_TEXTS.deskriptiveStatistik.age,
                `${formatNumber(ageStats.median, 0, APP_CONFIG.UI_TEXTS.global.notApplicableShort)} (${formatNumber(ageStats.min, 0, APP_CONFIG.UI_TEXTS.global.notApplicableShort)}-${formatNumber(ageStats.max, 0, APP_CONFIG.UI_TEXTS.global.notApplicableShort)})`,
                `[${formatNumber(ageStats.mean, 1, APP_CONFIG.UI_TEXTS.global.notApplicableShort)} ± ${formatNumber(ageStats.sd, 1, APP_CONFIG.UI_TEXTS.global.notApplicableShort)}]`,
                'alterMedian'
            );

            // Gender
            html += renderRow(
                APP_CONFIG.UI_TEXTS.deskriptiveStatistik.gender,
                `${formatCountPercent(data.geschlecht.m, totalPatients)} ${APP_CONFIG.UI_TEXTS.legendLabels.male}`,
                `${formatCountPercent(data.geschlecht.f, totalPatients)} ${APP_CONFIG.UI_TEXTS.legendLabels.female}`,
                'geschlecht'
            );

            // Therapy
            html += renderRow(
                APP_CONFIG.UI_TEXTS.deskriptiveStatistik.therapy,
                `${formatCountPercent(data.therapie['direkt OP'], totalPatients)} ${APP_CONFIG.UI_TEXTS.legendLabels.direktOP}`,
                `${formatCountPercent(data.therapie.nRCT, totalPatients)} ${APP_CONFIG.UI_TEXTS.legendLabels.nRCT}`,
                'therapie'
            );

            // N-Status
            html += renderRow(
                APP_CONFIG.UI_TEXTS.deskriptiveStatistik.nStatus,
                `${formatCountPercent(data.nStatus.plus, totalPatients)} ${APP_CONFIG.UI_TEXTS.global.nPositive}`,
                `${formatCountPercent(data.nStatus.minus, totalPatients)} ${APP_CONFIG.UI_TEXTS.global.nNegative}`,
                'nStatus'
            );

            // AS-Status
            html += renderRow(
                APP_CONFIG.UI_TEXTS.deskriptiveStatistik.asStatus,
                `${formatCountPercent(data.asStatus.plus, totalPatients)} ${APP_CONFIG.UI_TEXTS.global.asPositive}`,
                `${formatCountPercent(data.asStatus.minus, totalPatients)} ${APP_CONFIG.UI_TEXTS.global.asNegative}`,
                'asStatus'
            );

            // T2-Status
            html += renderRow(
                APP_CONFIG.UI_TEXTS.deskriptiveStatistik.t2Status,
                `${formatCountPercent(data.t2Status.plus, totalPatients)} ${APP_CONFIG.UI_TEXTS.global.t2Positive}`,
                `${formatCountPercent(data.t2Status.minus, totalPatients)} ${APP_CONFIG.UI_TEXTS.global.t2Negative}`,
                't2Status'
            );

            // Lymph Node Counts
            const lkTypes = ['n', 'as', 't2'];
            const lkLabels = {
                n: APP_CONFIG.UI_TEXTS.deskriptiveStatistik.lkAnzahlPatho,
                as: APP_CONFIG.UI_TEXTS.deskriptiveStatistik.lkAnzahlAS,
                t2: APP_CONFIG.UI_TEXTS.deskriptiveStatistik.lkAnzahlT2
            };
            const lkTooltips = {
                 n: 'lkAnzahlPatho',
                 as: 'lkAnzahlAS',
                 t2: 'lkAnzahlT2'
            };

            lkTypes.forEach(type => {
                const lkStats = data.lkAnzahlen[type];
                if (lkStats && lkStats.total && lkStats.total.n > 0) {
                    html += renderRow(
                        lkLabels[type],
                        `${formatNumber(lkStats.total.median, 0)} (${formatNumber(lkStats.total.min, 0)}-${formatNumber(lkStats.total.max, 0)})`,
                        `[${formatNumber(lkStats.total.mean, 1)} ± ${formatNumber(lkStats.total.sd, 1)}]`,
                        lkTooltips[type]
                    );
                }
            });
        }
        tableBody.innerHTML = html;
        ui_helpers.initializeTooltips(tableBody);
    }

    function renderDiagnosticPerformanceTable(performanceData, targetElementId, options = {}) {
        const tableBody = document.getElementById(targetElementId);
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (!performanceData || performanceData.matrix === undefined || performanceData.matrix.rp === undefined) {
             tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted small py-3">${APP_CONFIG.UI_TEXTS.global.noDataAvailable}</td></tr>`;
             return;
        }

        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
        const formatForDisplay = (valObj, lang = 'de') => {
            if (!valObj) return APP_CONFIG.UI_TEXTS.global.notApplicableShort;
            const digits = (valObj.name === APP_CONFIG.UI_TEXTS.t2MetricsOverview.f1Short || valObj.name === APP_CONFIG.UI_TEXTS.t2MetricsOverview.aucShort || valObj.name === APP_CONFIG.UI_TEXTS.t2MetricsOverview.aucShort) ? 3 : 1;
            const isPercent = !(valObj.name === APP_CONFIG.UI_TEXTS.t2MetricsOverview.f1Short || valObj.name === APP_CONFIG.UI_TEXTS.t2MetricsOverview.aucShort || valObj.name === APP_CONFIG.UI_TEXTS.t2MetricsOverview.aucShort);
            return formatCI(valObj.value, valObj.ci?.lower, valObj.ci?.upper, digits, isPercent, APP_CONFIG.UI_TEXTS.global.notApplicableShort, lang);
        };

        const renderRow = (metricKey, metricDisplayName, predictionMethod, currentKollektiv) => {
            const metricData = performanceData[metricKey];
            if (!metricData) return '';
            const descriptionHTML = ui_helpers.getMetricDescriptionHTML(metricKey, predictionMethod);
            const interpretationHTML = ui_helpers.getMetricInterpretationHTML(metricKey, metricData, predictionMethod, currentKollektiv);
            return `
                <tr>
                    <td class="small has-tooltip" data-tippy-content="${descriptionHTML}">${metricDisplayName}</td>
                    <td class="small text-end has-tooltip" data-tippy-content="${interpretationHTML}">${formatForDisplay(metricData)}</td>
                </tr>`;
        };

        const currentKollektiv = options.kollektiv || APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
        const predictionMethod = options.predictionMethod || APP_CONFIG.UI_TEXTS.global.unknownMethod;

        let html = '';
        html += renderRow('sens', APP_CONFIG.UI_TEXTS.t2MetricsOverview.sensShort, predictionMethod, currentKollektiv);
        html += renderRow('spez', APP_CONFIG.UI_TEXTS.t2MetricsOverview.spezShort, predictionMethod, currentKollektiv);
        html += renderRow('ppv', APP_CONFIG.UI_TEXTS.t2MetricsOverview.ppvShort, predictionMethod, currentKollektiv);
        html += renderRow('npv', APP_CONFIG.UI_TEXTS.t2MetricsOverview.npvShort, predictionMethod, currentKollektiv);
        html += renderRow('acc', APP_CONFIG.UI_TEXTS.t2MetricsOverview.accShort, predictionMethod, currentKollektiv);
        html += renderRow('balAcc', APP_CONFIG.UI_TEXTS.t2MetricsOverview.balAccShort, predictionMethod, currentKollektiv);
        html += renderRow('f1', APP_CONFIG.UI_TEXTS.t2MetricsOverview.f1Short, predictionMethod, currentKollektiv);
        html += renderRow('auc', APP_CONFIG.UI_TEXTS.t2MetricsOverview.aucShort, predictionMethod, currentKollektiv);

        tableBody.innerHTML = html;
        ui_helpers.initializeTooltips(tableBody);
    }

    function renderStatisticalComparisonTable(comparisonData, targetElementId, options = {}) {
        const tableBody = document.getElementById(targetElementId);
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (!comparisonData || (!comparisonData.mcnemar && !comparisonData.delong)) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted small py-3">${APP_CONFIG.UI_TEXTS.global.noDataAvailable}</td></tr>`;
            return;
        }

        const currentKollektiv = options.kollektiv || APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
        const t2ShortName = options.t2ShortName || APP_CONFIG.UI_TEXTS.global.t2Applied;

        const renderRow = (testKey, displayName, testData) => {
            if (!testData || isNaN(testData.pValue)) return '';
            const descriptionHTML = ui_helpers.getTestDescriptionHTML(testKey, t2ShortName);
            const interpretationHTML = ui_helpers.getTestInterpretationHTML(testKey, testData, currentKollektiv, t2ShortName);
            const pValueText = getPValueText(testData.pValue);
            const pValueSymbol = getStatisticalSignificanceSymbol(testData.pValue);

            let valueDisplay = testData.statistic !== undefined && !isNaN(testData.statistic) ? formatNumber(testData.statistic, 2) : (testData.Z !== undefined && !isNaN(testData.Z) ? formatNumber(testData.Z, 2) : APP_CONFIG.UI_TEXTS.global.notApplicableShort);
            if (testKey === 'delong' && testData.diffAUC !== undefined && !isNaN(testData.diffAUC)) {
                valueDisplay += ` (${APP_CONFIG.UI_TEXTS.global.diffAUCShort}: ${formatNumber(testData.diffAUC, 3)})`;
            }

            return `
                <tr>
                    <td class="small has-tooltip" data-tippy-content="${descriptionHTML}">${displayName}</td>
                    <td class="small text-end">${valueDisplay}</td>
                    <td class="small text-end has-tooltip" data-tippy-content="${interpretationHTML}">${pValueText} ${pValueSymbol}</td>
                </tr>`;
        };

        let html = '';
        html += renderRow('mcnemar', APP_CONFIG.UI_TEXTS.statMetrics.mcnemar.name, comparisonData.mcnemar);
        html += renderRow('delong', APP_CONFIG.UI_TEXTS.statMetrics.delong.name, comparisonData.delong);
        tableBody.innerHTML = html;
        ui_helpers.initializeTooltips(tableBody);
    }

    function renderAssociationsTable(associationsData, targetElementId, options = {}) {
        const tableBody = document.getElementById(targetElementId);
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (!associationsData || Object.keys(associationsData).length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted small py-3">${APP_CONFIG.UI_TEXTS.global.noDataAvailable}</td></tr>`;
            return;
        }

        const currentKollektiv = options.kollektiv || APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;

        const renderRow = (assocObj, featureName) => {
            if (!assocObj || isNaN(assocObj.pValue)) return '';

            const pValueText = getPValueText(assocObj.pValue);
            const pValueSymbol = getStatisticalSignificanceSymbol(assocObj.pValue);

            const formatOddsRatio = (orData) => {
                const desc = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.statMetrics.or.description;
                const interpretation = ui_helpers.getAssociationInterpretationHTML('or', assocObj, featureName, currentKollektiv);
                return `<span class="has-tooltip" data-tippy-content="${desc}">${formatCI(orData?.value, orData?.ci?.lower, orData?.ci?.upper, 2, false, APP_CONFIG.UI_TEXTS.global.notApplicableShort)}</span> <span class="has-tooltip" data-tippy-content="${interpretation}">${pValueText} ${pValueSymbol}</span>`;
            };

            const formatRiskDiff = (rdData) => {
                const desc = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.statMetrics.rd.description;
                const interpretation = ui_helpers.getAssociationInterpretationHTML('rd', assocObj, featureName, currentKollektiv);
                return `<span class="has-tooltip" data-tippy-content="${desc}">${formatCI(rdData?.value * 100, rdData?.ci?.lower * 100, rdData?.ci?.upper * 100, 1, false, APP_CONFIG.UI_TEXTS.global.notApplicableShort)}%</span> <span class="has-tooltip" data-tippy-content="${interpretation}">${pValueText} ${pValueSymbol}</span>`;
            };

            const formatPhi = (phiData) => {
                const desc = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.statMetrics.phi.description;
                const interpretation = ui_helpers.getAssociationInterpretationHTML('phi', assocObj, featureName, currentKollektiv);
                return `<span class="has-tooltip" data-tippy-content="${desc}">${formatNumber(phiData?.value, 2, APP_CONFIG.UI_TEXTS.global.notApplicableShort)}</span>`;
            };

            const formatFisherMWU = (data) => {
                const key = data.testName.includes('Fisher') ? 'fisher' : (data.testName.includes('Mann-Whitney') ? 'size_mwu' : 'defaultP');
                const desc = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.statMetrics[key]?.description || key;
                const interpretation = ui_helpers.getAssociationInterpretationHTML(key, assocObj, featureName, currentKollektiv);
                return `<span class="has-tooltip" data-tippy-content="${desc}">${pValueText} ${pValueSymbol}</span> <span class="has-tooltip" data-tippy-content="${interpretation}"><i class="fas fa-info-circle text-muted"></i></span>`;
            };

            const totalInMatrix = (assocObj.matrix?.rp ?? 0) + (assocObj.matrix?.fp ?? 0) + (assocObj.matrix?.fn ?? 0) + (assocObj.matrix?.rn ?? 0);
            const countsDisplay = totalInMatrix > 0 ? `${assocObj.matrix.rp + assocObj.matrix.rn}/${totalInMatrix} (Corr.)` : APP_CONFIG.UI_TEXTS.global.notApplicableShort;
            const rpDisplay = (assocObj.matrix?.rp !== undefined && assocObj.matrix?.fp !== undefined && assocObj.matrix?.fn !== undefined && assocObj.matrix?.rn !== undefined)
                                ? `${assocObj.matrix.rp}/${assocObj.matrix.fp}/${assocObj.matrix.fn}/${assocObj.matrix.rn}`
                                : APP_CONFIG.UI_TEXTS.global.notApplicableShort;

            return `
                <tr>
                    <td class="small">${featureName}</td>
                    <td class="small text-center has-tooltip" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.statMetrics.konfusionsmatrix.description.replace('[METHODE]', featureName)}">${rpDisplay}</td>
                    <td class="small text-center">${countsDisplay}</td>
                    <td class="small text-end">${formatOddsRatio(assocObj.or)}</td>
                    <td class="small text-end">${formatRiskDiff(assocObj.rd)}</td>
                    <td class="small text-end">${formatPhi(assocObj.phi)}</td>
                    <td class="small text-end">${formatFisherMWU(assocObj)}</td>
                </tr>`;
        };

        html += renderRow(associationsData.as, APP_CONFIG.UI_TEXTS.statMetrics.asFeatureName || 'Avocado Sign');
        html += renderRow(associationsData.size_mwu, APP_CONFIG.UI_TEXTS.statMetrics.sizeMwuFeatureName || 'LK Größe (Median)');

        const t2FeaturesOrder = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
        t2FeaturesOrder.forEach(key => {
            if (associationsData[key]) {
                html += renderRow(associationsData[key], associationsData[key].featureName || APP_CONFIG.UI_TEXTS.global.unknownFeature);
            }
        });

        tableBody.innerHTML = html;
        ui_helpers.initializeTooltips(tableBody);
    }

    function renderCohortComparisonTable(comparisonData, targetElementId, options = {}) {
        const tableBody = document.getElementById(targetElementId);
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (!comparisonData || (!comparisonData.accuracyComparison && !comparisonData.aucComparison)) {
             tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted small py-3">${APP_CONFIG.UI_TEXTS.global.noDataAvailable}</td></tr>`;
             return;
        }

        const kollektiv1 = options.kollektiv1 || APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1;
        const kollektiv2 = options.kollektiv2 || APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2;

        const renderRow = (metricName, asComp, t2Comp, currentKollektiv1, currentKollektiv2) => {
            const getCompTestInterpretation = (key, data, method, kol1, kol2) => {
                if (!data || isNaN(data.pValue)) return APP_CONFIG.UI_TEXTS.global.noInterpretationAvailable;
                const pStr = getPValueText(data.pValue);
                const sigText = getStatisticalSignificanceText(data.pValue);
                const desc = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.statMetrics[key]?.description || key;
                const interpretation = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.statMetrics[key]?.interpretation || key;

                return `
                    <p class="mb-0 small">${desc.replace('[METHODE]', method)}</p>
                    <hr class="my-1">
                    <p class="mb-0 small">
                        ${interpretation
                            .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
                            .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                            .replace(/\[METHODE\]/g, `<strong>${method}</strong>`)
                            .replace(/\[KOLLEKTIV1\]/g, `<strong>${getKollektivDisplayName(kol1)}</strong>`)
                            .replace(/\[KOLLEKTIV2\]/g, `<strong>${getKollektivDisplayName(kol2)}</strong>`)
                        }
                    </p>
                `;
            };

            const pValueAS = getPValueText(asComp?.pValue);
            const pValueT2 = getPValueText(t2Comp?.pValue);
            const pSymbolAS = getStatisticalSignificanceSymbol(asComp?.pValue);
            const pSymbolT2 = getStatisticalSignificanceSymbol(t2Comp?.pValue);

            return `
                <tr>
                    <td class="small">${metricName}</td>
                    <td class="small text-end has-tooltip" data-tippy-content="${getCompTestInterpretation('accComp', asComp, APP_CONFIG.UI_TEXTS.legendLabels.avocadoSign, kollektiv1, kollektiv2)}">${pValueAS} ${pSymbolAS}</td>
                    <td class="small text-end has-tooltip" data-tippy-content="${getCompTestInterpretation('aucComp', t2Comp, APP_CONFIG.UI_TEXTS.legendLabels.currentT2, kollektiv1, kollektiv2)}">${pValueT2} ${pSymbolT2}</td>
                </tr>`;
        };

        let html = '';
        html += renderRow(APP_CONFIG.UI_TEXTS.global.accuracyShort, comparisonData.accuracyComparison?.as, comparisonData.accuracyComparison?.t2, kollektiv1, kollektiv2);
        html += renderRow(APP_CONFIG.UI_TEXTS.global.aucShort, comparisonData.aucComparison?.as, comparisonData.aucComparison?.t2, kollektiv1, kollektiv2);

        tableBody.innerHTML = html;
        ui_helpers.initializeTooltips(tableBody);
    }

    function renderCriteriaComparisonTable(comparisonResults, targetElementId, options = {}) {
        const tableBody = document.getElementById(targetElementId);
        if (!tableBody) return;
        tableBody.innerHTML = '';
        if (!comparisonResults || Object.keys(comparisonResults).length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted small py-3">${APP_CONFIG.UI_TEXTS.global.noDataAvailable}</td></tr>`;
            return;
        }

        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc']; // Use AUC for BalAcc display
        const currentKollektiv = options.kollektiv || APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
        const displayKollektivName = getKollektivDisplayName(currentKollektiv);

        const renderRow = (methodId, methodDisplayName, methodKollektiv, stats) => {
            const isT2Method = methodId !== APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID;
            const effectiveKollektivName = getKollektivDisplayName(methodKollektiv);
            const displayKollektiv = (methodKollektiv && methodKollektiv !== currentKollektiv) ? ` (${effectiveKollektivName} N)` : '';

            let rowHtml = `
                <tr>
                    <td class="small">${methodDisplayName}${displayKollektiv}</td>`;
            metrics.forEach(metricKey => {
                const val = stats?.[metricKey]?.value;
                const digits = (metricKey === 'auc') ? 3 : 1;
                const isPercent = !(metricKey === 'auc'); // Only AUC is not percent
                rowHtml += `<td class="small text-end">${isPercent ? formatPercent(val, digits, '--%') : formatNumber(val, digits, '--')}</td>`;
            });
            rowHtml += `</tr>`;
            return rowHtml;
        };

        let html = '';
        html += renderRow(
            APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID,
            APP_CONFIG.UI_TEXTS.legendLabels.avocadoSign,
            currentKollektiv,
            comparisonResults[APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID]
        );

        if (options.showAppliedCriteria) {
            html += renderRow(
                APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID,
                APP_CONFIG.UI_TEXTS.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                currentKollektiv,
                comparisonResults[APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID]
            );
        }

        APP_CONFIG.PUBLICATION_CONFIG.literatureCriteriaSets.forEach(studySet => {
            html += renderRow(
                studySet.id,
                studySet.displayShortName || studySet.name,
                studySet.applicableKollektiv || currentKollektiv, // Use defined applicableKollektiv
                comparisonResults[studySet.id]
            );
        });

        tableBody.innerHTML = html;
        ui_helpers.initializeTooltips(tableBody);
    }


    return Object.freeze({
        renderDataTable,
        renderAuswertungTable,
        renderDescriptiveStatsTable,
        renderDiagnosticPerformanceTable,
        renderStatisticalComparisonTable,
        renderAssociationsTable,
        renderCohortComparisonTable,
        renderCriteriaComparisonTable
    });

})();
