const tableRenderer = (() => {

    function _createDatenTableRow(patient, index, columns) {
        if (!patient || typeof patient !== 'object') return '';
        const collapseId = `details-data-${patient.nr || index}`;
        let rowHTML = `<tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}" class="accordion-toggle" data-tippy-content="${TOOLTIP_CONTENT.datenTable.expandRow?.description || 'Details ein-/ausklappen'}">`;

        columns.forEach(col => {
            let cellValue = '';
            switch (col.key) {
                case 'nr': cellValue = patient.nr || (index + 1); break;
                case 'name': cellValue = `${patient.name || ''}, ${patient.vorname || ''}`.replace(/^, |^ |,$|,$/g, '') || 'N/A'; break;
                case 'geschlecht': cellValue = patient.geschlecht || 'N/A'; break;
                case 'alter': cellValue = formatNumber(patient.alter, 0, 'N/A'); break;
                case 'therapie': cellValue = getKollektivDisplayName(patient.therapie) || 'N/A'; break;
                case 'n_as_t2':
                    cellValue = `<span class="status-indicator status-${(patient.n === '+') ? 'pos' : (patient.n === '-' ? 'neg' : 'unk')}">${patient.n || '?'}</span> /
                                 <span class="status-indicator status-${(patient.as === '+') ? 'pos' : (patient.as === '-' ? 'neg' : 'unk')}">${patient.as || '?'}</span> /
                                 <span class="status-indicator status-${(patient.t2 === '+') ? 'pos' : (patient.t2 === '-' ? 'neg' : 'unk')}">${patient.t2 || '?'}</span>`;
                    break;
                case 'bemerkung': cellValue = patient.bemerkung || ''; break;
                default: cellValue = getObjectValueByPath(patient, col.key) ?? 'N/A';
            }
            rowHTML += `<td>${cellValue}</td>`;
        });
        rowHTML += `<td><button class="btn btn-sm btn-outline-secondary p-0 row-toggle-icon" aria-label="Details"><i class="fas fa-chevron-down"></i></button></td></tr>`;

        rowHTML += `<tr class="sub-row"><td colspan="${columns.length + 1}" class="p-0"><div id="${collapseId}" class="collapse">`;
        if (patient.lymphknoten_t2 && patient.lymphknoten_t2.length > 0) {
            rowHTML += `<div class="p-2 bg-light-subtle border-top border-bottom"><strong class="small d-block mb-1">T2 Lymphknoten-Details (${patient.lymphknoten_t2.length}):</strong><div class="d-flex flex-wrap">`;
            patient.lymphknoten_t2.forEach((lk, lkIdx) => {
                rowHTML += `<div class="border rounded p-1 me-1 mb-1 small bg-white t2-lk-detail-item" data-tippy-content="LK #${lkIdx + 1}: Größe ${formatNumber(lk.groesse,1)}mm, Form: ${lk.form||'N/A'}, Kontur: ${lk.kontur||'N/A'}, Homogen.: ${lk.homogenitaet||'N/A'}, Signal: ${lk.signal||'N/A'}">`;
                rowHTML += `${ui_helpers.getT2IconSVG('ruler-horizontal', null)} ${formatNumber(lk.groesse,1,'?')}mm `;
                rowHTML += `${ui_helpers.getT2IconSVG('form', lk.form)} `;
                rowHTML += `${ui_helpers.getT2IconSVG('kontur', lk.kontur)} `;
                rowHTML += `${ui_helpers.getT2IconSVG('homogenitaet', lk.homogenitaet)} `;
                rowHTML += `${ui_helpers.getT2IconSVG('signal', lk.signal)}`;
                rowHTML += `</div>`;
            });
            rowHTML += `</div></div>`;
        } else {
            rowHTML += `<div class="p-2 text-muted small">Keine T2 Lymphknoten-Details für diesen Patienten verfügbar.</div>`;
        }
        rowHTML += `</div></td></tr>`;
        return rowHTML;
    }

    function renderDatenTabelle(data, currentPage, rowsPerPage, sortState, columns) {
        const tableBody = document.getElementById('daten-tabelle-body');
        const paginationControls = document.getElementById('daten-pagination');
        const anzahlPatientenInfo = document.getElementById('daten-anzahl-patienten-info');

        if (!tableBody || !paginationControls || !anzahlPatientenInfo) return;
        tableBody.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            anzahlPatientenInfo.textContent = 'Keine Patienten im aktuellen Kollektiv.';
            tableBody.innerHTML = `<tr><td colspan="${columns.length + 1}" class="text-center text-muted">Keine Daten verfügbar.</td></tr>`;
            paginationControls.innerHTML = '';
            return;
        }

        const sortedData = data.slice().sort(getSortFunction(sortState.key, sortState.direction, sortState.subKey));
        const totalRows = sortedData.length;
        const totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = Math.min(Math.max(1, currentPage), totalPages);
        const startRow = (currentPage - 1) * rowsPerPage;
        const endRow = Math.min(startRow + rowsPerPage, totalRows);
        const paginatedData = sortedData.slice(startRow, endRow);

        paginatedData.forEach((patient, index) => {
            tableBody.insertAdjacentHTML('beforeend', _createDatenTableRow(patient, startRow + index, columns));
        });

        anzahlPatientenInfo.textContent = `Zeige ${startRow + 1}-${endRow} von ${totalRows} Patienten.`;
        paginationControls.innerHTML = uiComponents.createPaginationControls(currentPage, totalPages, 'daten-page-change');
        ui_helpers.attachRowCollapseListeners(tableBody);
    }

    function _createAuswertungTableRow(patient, index, columns) {
        if (!patient || typeof patient !== 'object') return '';
        const collapseId = `details-auswertung-${patient.nr || index}`;
        let rowHTML = `<tr data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}" class="accordion-toggle" data-tippy-content="${TOOLTIP_CONTENT.auswertungTable.expandRow?.description || 'Details ein-/ausklappen'}">`;

        columns.forEach(col => {
            let cellValue = '';
            switch (col.key) {
                case 'nr': cellValue = patient.nr || (index + 1); break;
                case 'name': cellValue = `${patient.name || ''}, ${patient.vorname || ''}`.replace(/^, |^ |,$|,$/g, '') || 'N/A'; break;
                case 'therapie': cellValue = getKollektivDisplayName(patient.therapie) || 'N/A'; break;
                case 'n_as_t2':
                    cellValue = `<span class="status-indicator status-${(patient.n === '+') ? 'pos' : (patient.n === '-' ? 'neg' : 'unk')}">${patient.n || '?'}</span> /
                                 <span class="status-indicator status-${(patient.as === '+') ? 'pos' : (patient.as === '-' ? 'neg' : 'unk')}">${patient.as || '?'}</span> /
                                 <span class="status-indicator status-${(patient.t2 === '+') ? 'pos' : (patient.t2 === '-' ? 'neg' : 'unk')}">${patient.t2 || '?'}</span>`;
                    break;
                case 'n_counts': cellValue = `${patient.anzahl_patho_n_plus_lk || 0} / ${patient.anzahl_patho_lk || 0}`; break;
                case 'as_counts': cellValue = `${patient.anzahl_as_plus_lk || 0} / ${patient.anzahl_as_lk || 0}`; break;
                case 't2_counts': cellValue = `${patient.anzahl_t2_plus_lk || 0} / ${patient.anzahl_t2_lk || 0}`; break;
                default: cellValue = getObjectValueByPath(patient, col.key) ?? 'N/A';
            }
            rowHTML += `<td>${cellValue}</td>`;
        });
        rowHTML += `<td><button class="btn btn-sm btn-outline-secondary p-0 row-toggle-icon" aria-label="Details"><i class="fas fa-chevron-down"></i></button></td></tr>`;

        rowHTML += `<tr class="sub-row"><td colspan="${columns.length + 1}" class="p-0"><div id="${collapseId}" class="collapse">`;
        if (patient.lymphknoten_t2_bewertet && patient.lymphknoten_t2_bewertet.length > 0) {
            rowHTML += `<div class="p-2 bg-light-subtle border-top border-bottom"><strong class="small d-block mb-1">Bewertete T2 Lymphknoten (${patient.lymphknoten_t2_bewertet.length}):</strong><div class="d-flex flex-wrap">`;
            patient.lymphknoten_t2_bewertet.forEach((lk, lkIdx) => {
                const statusClass = lk.isPositive ? 't2-lk-positive' : 't2-lk-negative';
                let criteriaMetTooltip = `LK #${lkIdx + 1} (T2 ${lk.isPositive ? '+' : '-'}): Größe ${formatNumber(lk.groesse,1,'?')}mm. `;
                if(lk.checkResult) {
                    if (lk.checkResult.esgarCategory) criteriaMetTooltip += `ESGAR Kat.: ${lk.checkResult.esgarCategory}, Morph. Kriterien: ${lk.checkResult.esgarMorphologyCount}. `;
                    else {
                        const metCriteria = Object.entries(lk.checkResult).filter(([key, val]) => val === true && key !== 'isPositive' && key.indexOf('_val') === -1 && key.indexOf('_met') === -1).map(([key]) => key).join(', ');
                        criteriaMetTooltip += `Erfüllte Kriterien: ${metCriteria || 'Keine'}. `;
                    }
                }
                rowHTML += `<div class="border rounded p-1 me-1 mb-1 small bg-white t2-lk-detail-item ${statusClass}" data-tippy-content="${criteriaMetTooltip}">`;
                rowHTML += `<span class="badge ${lk.isPositive ? 'bg-danger-subtle text-danger-emphasis' : 'bg-success-subtle text-success-emphasis'} me-1">T2 ${lk.isPositive ? '+' : '-'}</span>`;
                rowHTML += `${ui_helpers.getT2IconSVG('ruler-horizontal', null)} ${formatNumber(lk.groesse,1,'?')}mm `;
                if (lk.checkResult?.form_met !== undefined) rowHTML += `<span class="${lk.checkResult.form_met ? 'criteria-met-icon' : ''}">${ui_helpers.getT2IconSVG('form', lk.form)}</span> `;
                if (lk.checkResult?.kontur_met !== undefined) rowHTML += `<span class="${lk.checkResult.kontur_met ? 'criteria-met-icon' : ''}">${ui_helpers.getT2IconSVG('kontur', lk.kontur)}</span> `;
                if (lk.checkResult?.homogenitaet_met !== undefined) rowHTML += `<span class="${lk.checkResult.homogenitaet_met ? 'criteria-met-icon' : ''}">${ui_helpers.getT2IconSVG('homogenitaet', lk.homogenitaet)}</span> `;
                if (lk.checkResult?.signal_met !== undefined) rowHTML += `<span class="${lk.checkResult.signal_met ? 'criteria-met-icon' : ''}">${ui_helpers.getT2IconSVG('signal', lk.signal)}</span>`;
                rowHTML += `</div>`;
            });
            rowHTML += `</div></div>`;
        } else {
            rowHTML += `<div class="p-2 text-muted small">Keine bewerteten T2 Lymphknoten-Details für diesen Patienten verfügbar.</div>`;
        }
        rowHTML += `</div></td></tr>`;
        return rowHTML;
    }

    function renderAuswertungTabelle(data, currentPage, rowsPerPage, sortState, columns) {
        const tableBody = document.getElementById('auswertung-tabelle-body');
        const paginationControls = document.getElementById('auswertung-pagination');
        const anzahlPatientenInfo = document.getElementById('auswertung-anzahl-patienten-info');

        if (!tableBody || !paginationControls || !anzahlPatientenInfo) return;
        tableBody.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            anzahlPatientenInfo.textContent = 'Keine Patienten im aktuellen Kollektiv.';
            tableBody.innerHTML = `<tr><td colspan="${columns.length + 1}" class="text-center text-muted">Keine Daten verfügbar.</td></tr>`;
            paginationControls.innerHTML = '';
            return;
        }

        const sortedData = data.slice().sort(getSortFunction(sortState.key, sortState.direction, sortState.subKey));
        const totalRows = sortedData.length;
        const totalPages = Math.ceil(totalRows / rowsPerPage);
        currentPage = Math.min(Math.max(1, currentPage), totalPages);
        const startRow = (currentPage - 1) * rowsPerPage;
        const endRow = Math.min(startRow + rowsPerPage, totalRows);
        const paginatedData = sortedData.slice(startRow, endRow);

        paginatedData.forEach((patient, index) => {
            tableBody.insertAdjacentHTML('beforeend', _createAuswertungTableRow(patient, startRow + index, columns));
        });

        anzahlPatientenInfo.textContent = `Zeige ${startRow + 1}-${endRow} von ${totalRows} Patienten.`;
        paginationControls.innerHTML = uiComponents.createPaginationControls(currentPage, totalPages, 'auswertung-page-change');
        ui_helpers.attachRowCollapseListeners(tableBody);
    }

    function _createSimpleTableRow(rowData, columnKeys, cellFormatters = {}) {
        let rowHTML = '<tr>';
        columnKeys.forEach(key => {
            const value = getObjectValueByPath(rowData, key);
            const formattedValue = cellFormatters[key] ? cellFormatters[key](value, rowData) : (value ?? 'N/A');
            rowHTML += `<td>${formattedValue}</td>`;
        });
        rowHTML += '</tr>';
        return rowHTML;
    }

    function _createSimpleTable(id, headersConfig, rowsData, cardTitle, cardTooltipKey = null, downloadButtons = [], tableClass = 'table-sm table-striped table-hover', columnKeys = null) {
        const tableId = `table-${id}`;
        let tableHTML = `<div class="table-responsive"><table class="table ${tableClass}" id="${tableId}"><thead><tr>`;
        headersConfig.forEach(header => {
            const headerTooltip = header.tooltip ? `data-tippy-content="${header.tooltip}"` : '';
            tableHTML += `<th ${headerTooltip}>${header.text}</th>`;
        });
        tableHTML += `</tr></thead><tbody>`;
        const keysToRender = columnKeys || headersConfig.map(h => h.key);
        rowsData.forEach(rowData => {
            tableHTML += '<tr>';
            keysToRender.forEach(key => {
                 const value = getObjectValueByPath(rowData, key);
                 const cellContent = (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) ? 'N/A' : String(value);
                 tableHTML += `<td>${cellContent}</td>`;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table></div>';

        const tooltip = cardTooltipKey && TOOLTIP_CONTENT[cardTooltipKey] ? TOOLTIP_CONTENT[cardTooltipKey].cardTitle : cardTitle;
        return uiComponents.createStatistikCard(id, cardTitle, tableHTML, false, cardTooltipKey, downloadButtons, tableId);
    }


    function renderDescriptiveStatsTable(stats, kollektivName, lang = 'de', forExport = false) {
        if (!stats) return forExport ? 'Keine deskriptiven Daten verfügbar.' : uiComponents.createStatistikCard('deskriptive-statistik', `Deskriptive Statistik (${getKollektivDisplayName(kollektivName)})`, '<p class="text-muted">Keine Daten.</p>', true, 'deskriptiveStatistik');
        const na = 'N/A';
        const fNum = (val, dig=1) => formatNumber(val, dig, na, true);
        const fPerc = (count, total, dig=0) => (total > 0 && count !== undefined) ? `${fNum(count,0)} (${formatPercent(count/total, dig)})` : `${fNum(count,0)} (${na})`;

        const headers = [
            { key: 'merkmal', text: lang === 'de' ? 'Merkmal' : 'Characteristic', tooltip: lang === 'de' ? 'Demographisches oder klinisches Merkmal.' : 'Demographic or clinical characteristic.' },
            { key: 'wert', text: lang === 'de' ? 'Wert' : 'Value', tooltip: lang === 'de' ? 'Statistischer Wert des Merkmals.' : 'Statistical value of the characteristic.' }
        ];
        const rows = [
            { merkmal: lang === 'de' ? 'Patienten gesamt (N)' : 'Total Patients (n)', wert: fNum(stats.anzahlPatienten, 0) },
            { merkmal: lang === 'de' ? 'Alter, Median (Min-Max) [Jahre]' : 'Age, Median (Min-Max) [Years]', wert: stats.alter ? `${fNum(stats.alter.median)} (${fNum(stats.alter.min,0)}-${fNum(stats.alter.max,0)})` : na },
            { merkmal: lang === 'de' ? 'Alter, Mittelwert (SD) [Jahre]' : 'Age, Mean (SD) [Years]', wert: stats.alter ? `${fNum(stats.alter.mean)} (${fNum(stats.alter.sd)})` : na },
            { merkmal: lang === 'de' ? 'Geschlecht, männlich [n (%)]' : 'Sex, male [n (%)]', wert: fPerc(stats.geschlecht?.m, stats.anzahlPatienten) },
            { merkmal: lang === 'de' ? 'Geschlecht, weiblich [n (%)]' : 'Sex, female [n (%)]', wert: fPerc(stats.geschlecht?.f, stats.anzahlPatienten) },
            { merkmal: lang === 'de' ? 'Therapie, Direkt OP [n (%)]' : 'Therapy, Upfront Surgery [n (%)]', wert: fPerc(stats.therapie?.['direkt OP'], stats.anzahlPatienten) },
            { merkmal: lang === 'de' ? 'Therapie, nRCT [n (%)]' : 'Therapy, nRCT [n (%)]', wert: fPerc(stats.therapie?.nRCT, stats.anzahlPatienten) },
            { merkmal: lang === 'de' ? 'N-Status (Patho), Positiv (+) [n (%)]' : 'N-Status (Path.), Positive (+) [n (%)]', wert: fPerc(stats.nStatus?.plus, stats.anzahlPatienten) },
            { merkmal: lang === 'de' ? 'AS-Status (MRT), Positiv (+) [n (%)]' : 'AS-Status (MRI), Positive (+) [n (%)]', wert: fPerc(stats.asStatus?.plus, stats.anzahlPatienten) },
            { merkmal: lang === 'de' ? 'T2-Status (Angewandt), Positiv (+) [n (%)]' : 'T2-Status (Applied), Positive (+) [n (%)]', wert: fPerc(stats.t2Status?.plus, stats.anzahlPatienten) },
            { merkmal: lang === 'de' ? 'LK Patho/Pat., Median (Min-Max)' : 'LNs Path./Patient, Median (Min-Max)', wert: stats.lkAnzahlen?.n?.total ? `${fNum(stats.lkAnzahlen.n.total.median,0)} (${fNum(stats.lkAnzahlen.n.total.min,0)}-${fNum(stats.lkAnzahlen.n.total.max,0)})` : na},
            { merkmal: lang === 'de' ? 'LK N+/Pat. (bei N+ Pat.), Median (Min-Max)' : 'LNs N+/Patient (in N+ Pat.), Median (Min-Max)', wert: stats.lkAnzahlen?.n?.plus ? `${fNum(stats.lkAnzahlen.n.plus.median,0)} (${fNum(stats.lkAnzahlen.n.plus.min,0)}-${fNum(stats.lkAnzahlen.n.plus.max,0)})` : na}
        ];
        const cardTitle = `${lang === 'de' ? 'Deskriptive Statistik' : 'Descriptive Statistics'} (${getKollektivDisplayName(kollektivName)})`;
        const downloadButtons = [{ id: 'dl-deskriptiv-md', icon: 'fab fa-markdown', format: 'md', tooltip: TOOLTIP_CONTENT.exportTab.deskriptivMD.description }];

        if (forExport) {
            let html = `<h3>${cardTitle}</h3>`;
            html += `<div class="table-responsive"><table class="table table-sm table-bordered"><thead><tr>${headers.map(h=>`<th>${h.text}</th>`).join('')}</tr></thead><tbody>`;
            rows.forEach(r => html += `<tr><td>${r.merkmal}</td><td>${r.wert}</td></tr>`);
            html += `</tbody></table></div>`;
            return html;
        }
        return _createSimpleTable('deskriptive-statistik', headers, rows, cardTitle, 'deskriptiveStatistik', downloadButtons, 'table-sm table-bordered', ['merkmal', 'wert']);
    }

    function renderDiagnosticPerformanceTable(performance, methodName, kollektivName, lang = 'de', forExport = false, forPresentation = false) {
        if (!performance || !performance.matrix) return forExport ? `Keine Performance-Daten für ${methodName} verfügbar.` : uiComponents.createStatistikCard(`diagnostische-guete-${methodName.toLowerCase().replace(/\s+/g, '-')}`, `Diagnostische Güte: ${methodName} (${getKollektivDisplayName(kollektivName)})`, '<p class="text-muted">Keine Daten.</p>', true, `diagnostischeGuete${methodName === 'Avocado Sign' ? 'AS' : 'T2'}`);
        const na = 'N/A';
        const { rp, fp, fn, rn } = performance.matrix;
        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
        const displayNames = { sens: 'Sensitivität', spez: 'Spezifität', ppv: 'PPV', npv: 'NPV', acc: 'Accuracy', balAcc: 'Bal. Acc.', f1: 'F1-Score', auc: 'AUC' };
        if (lang === 'en') { Object.assign(displayNames, { sens: 'Sensitivity', spez: 'Specificity', balAcc: 'Bal. Acc.'}); }

        const headers = [
            { text: lang === 'de' ? 'Metrik' : 'Metric', key: 'metric', tooltip: lang === 'de' ? 'Diagnostisches Gütemaß.' : 'Diagnostic performance metric.' },
            { text: lang === 'de' ? 'Wert (95%-KI)' : 'Value (95% CI)', key: 'value', tooltip: lang === 'de' ? 'Berechneter Wert der Metrik mit 95% Konfidenzintervall.' : 'Calculated value of the metric with 95% confidence interval.'}
        ];
         if (!forPresentation) {
            headers.push({ text: lang === 'de' ? 'Interpretation' : 'Interpretation', key: 'interpretation', tooltip: lang === 'de' ? 'Klinische Interpretation des Wertes.' : 'Clinical interpretation of the value.' });
         }
        headers.push({ text: 'RP/FP/FN/RN', key: 'matrix', tooltip: 'Konfusionsmatrix: Richtig Positiv / Falsch Positiv / Falsch Negativ / Richtig Negativ.'});


        const rows = metrics.map(key => {
            const metricData = performance[key];
            const isRate = !(key === 'f1' || key === 'auc');
            const digits = (key === 'f1' || key === 'auc' || key === 'balAcc') ? 3 : 1;
            const row = {
                metric: `<span data-tippy-content="${ui_helpers.getMetricDescriptionHTML(key, methodName)}">${displayNames[key]}</span>`,
                value: _formatMetricForTableDisplay(metricData, isRate, digits, lang, na),
                matrix: `${rp}/${fp}/${fn}/${rn}`
            };
             if (!forPresentation) {
                row.interpretation = ui_helpers.getMetricInterpretationHTML(key, metricData, methodName, kollektivName);
             }
            return row;
        });

        const cardIdSuffix = methodName.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g,'');
        const cardTitle = `${lang === 'de' ? 'Diagnostische Güte' : 'Diagnostic Performance'}: ${methodName} (${getKollektivDisplayName(kollektivName)})`;
        const cardTooltipKey = `diagnostischeGuete${methodName === 'Avocado Sign' ? 'AS' : (methodName.includes('T2') ? 'T2' : '')}`;
        const downloadButtons = [
            { id: `dl-perf-${cardIdSuffix}-csv`, icon: 'fas fa-file-csv', format: 'csv', tooltip: `Tabelle als CSV herunterladen (Performance ${methodName})`},
            { id: `dl-perf-${cardIdSuffix}-md`, icon: 'fab fa-markdown', format: 'md', tooltip: `Tabelle als Markdown herunterladen (Performance ${methodName})`}
        ];

        if (forExport) {
            let html = `<h3>${cardTitle}</h3>`;
            html += `<div class="table-responsive"><table class="table table-sm table-bordered"><thead><tr>${headers.map(h=>`<th>${h.text}</th>`).join('')}</tr></thead><tbody>`;
            rows.forEach(r => { html += `<tr><td>${r.metric.replace(/<span data-tippy-content=".*?">|<\/span>/g,'')}</td><td>${r.value}</td>${forPresentation ? '' : `<td>${r.interpretation}</td>`}<td>${r.matrix}</td></tr>`;});
            html += `</tbody></table></div>`;
            return html;
        }
         return _createSimpleTable(`diagnostische-guete-${cardIdSuffix}`, headers, rows, cardTitle, cardTooltipKey, downloadButtons, 'table-sm table-bordered', ['metric', 'value'].concat(forPresentation?[]:['interpretation']).concat(['matrix']));
    }

    function renderComparisonTable(comparisonData, method1Name, method2Name, kollektivName, lang = 'de', forExport = false) {
        if (!comparisonData || !comparisonData.mcnemar || !comparisonData.delong) return forExport ? `Keine Vergleichsdaten verfügbar.` : uiComponents.createStatistikCard(`vergleich-${method1Name.toLowerCase()}-vs-${method2Name.toLowerCase()}`, `Vergleich: ${method1Name} vs. ${method2Name} (${getKollektivDisplayName(kollektivName)})`, '<p class="text-muted">Keine Daten.</p>', true, `statistischerVergleich${method1Name==='Avocado Sign' ? 'ASvsT2' : 'Methods'}`);
        const na = 'N/A';
        const headers = [
            { text: lang === 'de' ? 'Test' : 'Test', key: 'test', tooltip: lang === 'de' ? 'Angewandter statistischer Test.' : 'Applied statistical test.'},
            { text: lang === 'de' ? 'p-Wert' : 'p-value', key: 'pValue', tooltip: lang === 'de' ? 'Resultierender p-Wert des Tests.' : 'Resulting p-value of the test.'},
            { text: lang === 'de' ? 'Statistik' : 'Statistic', key: 'statistic', tooltip: lang === 'de' ? 'Wert der Teststatistik (z.B. Chi-Quadrat, Z-Wert).' : 'Value of the test statistic (e.g., Chi-square, Z-value).'},
            { text: lang === 'de' ? 'Interpretation' : 'Interpretation', key: 'interpretation', tooltip: lang === 'de' ? 'Klinische Interpretation des Testergebnisses.' : 'Clinical interpretation of the test result.'}
        ];
        const rows = [
            {
                test: `<span data-tippy-content="${ui_helpers.getTestDescriptionHTML('mcnemar', method2Name)}">McNemar (Accuracy)</span>`,
                pValue: `${getPValueText(comparisonData.mcnemar.pValue, lang)} ${getStatisticalSignificanceSymbol(comparisonData.mcnemar.pValue)}`,
                statistic: `${lang === 'de' ? 'Χ²' : 'χ²'}=${formatNumber(comparisonData.mcnemar.statistic, 2, na, true)}, df=${comparisonData.mcnemar.df || 1}`,
                interpretation: ui_helpers.getTestInterpretationHTML('mcnemar', comparisonData.mcnemar, kollektivName, method2Name)
            },
            {
                test: `<span data-tippy-content="${ui_helpers.getTestDescriptionHTML('delong', method2Name)}">DeLong (AUC)</span>`,
                pValue: `${getPValueText(comparisonData.delong.pValue, lang)} ${getStatisticalSignificanceSymbol(comparisonData.delong.pValue)}`,
                statistic: `Z=${formatNumber(comparisonData.delong.Z, 2, na, true)}, Diff. AUC=${formatNumber(comparisonData.delong.diffAUC, 3, na, true)}`,
                interpretation: ui_helpers.getTestInterpretationHTML('delong', comparisonData.delong, kollektivName, method2Name)
            }
        ];
        const cardIdSuffix = `${method1Name.toLowerCase().replace(/\s+/g, '-')}-vs-${method2Name.toLowerCase().replace(/\s+/g, '-')}`;
        const cardTitle = `${lang === 'de' ? 'Stat. Vergleich' : 'Stat. Comparison'}: ${method1Name} vs. ${method2Name} (${getKollektivDisplayName(kollektivName)})`;
        const cardTooltipKey = `statistischerVergleich${method1Name === 'Avocado Sign' ? 'ASvsT2' : 'Methods'}`;
        const downloadButtons = [ { id: `dl-comp-${cardIdSuffix}-csv`, icon: 'fas fa-file-csv', format: 'csv', tooltip: `Tabelle als CSV herunterladen (Vergleich ${method1Name} vs ${method2Name})` }, { id: `dl-comp-${cardIdSuffix}-md`, icon: 'fab fa-markdown', format: 'md', tooltip: `Tabelle als Markdown herunterladen (Vergleich ${method1Name} vs ${method2Name})` } ];

        if (forExport) {
            let html = `<h3>${cardTitle}</h3>`;
            html += `<div class="table-responsive"><table class="table table-sm table-bordered"><thead><tr>${headers.map(h=>`<th>${h.text}</th>`).join('')}</tr></thead><tbody>`;
            rows.forEach(r => { html += `<tr><td>${r.test.replace(/<span data-tippy-content=".*?">|<\/span>/g,'')}</td><td>${r.pValue}</td><td>${r.statistic}</td><td>${r.interpretation}</td></tr>`; });
            html += `</tbody></table></div>`;
            return html;
        }
        return _createSimpleTable(`vergleich-${cardIdSuffix}`, headers, rows, cardTitle, cardTooltipKey, downloadButtons, 'table-sm table-bordered');
    }

    function renderAssociationsTable(associations, kollektivName, lang = 'de', forExport = false) {
        if (!associations || Object.keys(associations).length === 0) return forExport ? 'Keine Assoziationsdaten verfügbar.' : uiComponents.createStatistikCard('assoziationen-kriterien', `Assoziationen mit N-Status (${getKollektivDisplayName(kollektivName)})`, '<p class="text-muted">Keine Daten.</p>', true, 'assoziationEinzelkriterien');
        const na = 'N/A';
        const headers = [
            { text: lang === 'de' ? 'Merkmal' : 'Feature', key: 'merkmal', tooltip: lang === 'de' ? 'Untersuchtes Merkmal (AS oder T2-Eigenschaft).' : 'Investigated feature (AS or T2 property).' },
            { text: lang === 'de' ? 'OR (95%-KI)' : 'OR (95% CI)', key: 'or', tooltip: lang === 'de' ? 'Odds Ratio mit 95% Konfidenzintervall.' : 'Odds Ratio with 95% confidence interval.' },
            { text: lang === 'de' ? 'RD (95%-KI) [%]' : 'RD (95% CI) [%]', key: 'rd', tooltip: lang === 'de' ? 'Risikodifferenz mit 95% Konfidenzintervall, in Prozentpunkten.' : 'Risk Difference with 95% confidence interval, in percentage points.' },
            { text: lang === 'de' ? 'Phi (φ)' : 'Phi (φ)', key: 'phi', tooltip: lang === 'de' ? 'Phi-Koeffizient als Maß der Assoziationsstärke.' : 'Phi coefficient as a measure of association strength.' },
            { text: lang === 'de' ? 'p-Wert (Test)' : 'p-value (Test)', key: 'pValue', tooltip: lang === 'de' ? 'p-Wert des statistischen Tests (Fisher für binäre Merkmale, Mann-Whitney U für LK Größe).' : 'p-value of the statistical test (Fisher for binary features, Mann-Whitney U for LN size).' },
            { text: lang === 'de' ? 'Interpretation' : 'Interpretation', key: 'interpretation', tooltip: lang === 'de' ? 'Klinische Interpretation der Assoziation.' : 'Clinical interpretation of the association.'}
        ];
        const rows = Object.entries(associations).map(([key, assocObj]) => {
            if (!assocObj) return { merkmal: key, or: na, rd: na, phi: na, pValue: na, interpretation: na};
            const metricKeyForTest = (key === 'size_mwu') ? 'mannwhitney' : 'fisher';
             return {
                merkmal: assocObj.featureName || key,
                or: assocObj.or ? _formatMetricForTableDisplay(assocObj.or, false, 2, lang, na) : na,
                rd: assocObj.rd ? _formatMetricForTableDisplay({value: assocObj.rd.value, ci: assocObj.rd.ci, method: assocObj.rd.method}, true, 1, lang, na) : na,
                phi: assocObj.phi ? formatNumber(assocObj.phi.value, 2, na, true) : na,
                pValue: `${getPValueText(assocObj.pValue, lang)} ${getStatisticalSignificanceSymbol(assocObj.pValue)} (${assocObj.testName || metricKeyForTest})`,
                interpretation: ui_helpers.getAssociationInterpretationHTML(metricKeyForTest, assocObj, assocObj.featureName || key, kollektivName)
            };
        }).filter(r => r.merkmal !== 'N/A');

        const cardTitle = `${lang === 'de' ? 'Assoziationen mit N-Status' : 'Associations with N-Status'} (${getKollektivDisplayName(kollektivName)})`;
        const downloadButtons = [ { id: 'dl-assoc-csv', icon: 'fas fa-file-csv', format: 'csv', tooltip: `Tabelle als CSV herunterladen (Assoziationen)` }, { id: 'dl-assoc-md', icon: 'fab fa-markdown', format: 'md', tooltip: `Tabelle als Markdown herunterladen (Assoziationen)` } ];

        if (forExport) {
            let html = `<h3>${cardTitle}</h3>`;
            html += `<div class="table-responsive"><table class="table table-sm table-bordered"><thead><tr>${headers.map(h=>`<th>${h.text}</th>`).join('')}</tr></thead><tbody>`;
            rows.forEach(r => { html += `<tr><td>${r.merkmal}</td><td>${r.or}</td><td>${r.rd}</td><td>${r.phi}</td><td>${r.pValue}</td><td>${r.interpretation}</td></tr>`; });
            html += `</tbody></table></div>`;
            return html;
        }
        return _createSimpleTable('assoziationen-kriterien', headers, rows, cardTitle, 'assoziationEinzelkriterien', downloadButtons, 'table-sm table-bordered');
    }

    function renderCriteriaComparisonTable(comparisonData, kollektivName, appliedCriteriaData) {
        if (!comparisonData || comparisonData.length === 0) return uiComponents.createStatistikCard('kriterien-vergleich', UI_TEXTS.criteriaComparison.title + ` (${getKollektivDisplayName(kollektivName)})`, '<p class="text-muted">Keine Vergleichsdaten verfügbar.</p>', true, 'criteriaComparisonTable');
        const lang = state.getCurrentPublikationLang() || 'de';
        const na = 'N/A';
        const headersConfig = [
            { text: UI_TEXTS.criteriaComparison.tableHeaderSet, key: 'name', tooltip: lang === 'de' ? 'Name des Kriteriensets.' : 'Name of the criteria set.'},
            { text: UI_TEXTS.criteriaComparison.tableHeaderSens, key: 'sens', tooltip: lang === 'de' ? 'Sensitivität.' : 'Sensitivity.'},
            { text: UI_TEXTS.criteriaComparison.tableHeaderSpez, key: 'spez', tooltip: lang === 'de' ? 'Spezifität.' : 'Specificity.'},
            { text: UI_TEXTS.criteriaComparison.tableHeaderPPV, key: 'ppv', tooltip: lang === 'de' ? 'Positiver Prädiktiver Wert.' : 'Positive Predictive Value.'},
            { text: UI_TEXTS.criteriaComparison.tableHeaderNPV, key: 'npv', tooltip: lang === 'de' ? 'Negativer Prädiktiver Wert.' : 'Negative Predictive Value.'},
            { text: UI_TEXTS.criteriaComparison.tableHeaderAcc, key: 'acc', tooltip: lang === 'de' ? 'Accuracy (Gesamtgenauigkeit).' : 'Accuracy.'},
            { text: UI_TEXTS.criteriaComparison.tableHeaderAUC, key: 'auc', tooltip: lang === 'de' ? 'AUC (Fläche unter ROC-Kurve) / Balanced Accuracy.' : 'AUC (Area Under ROC Curve) / Balanced Accuracy.'}
        ];

        const rows = comparisonData.map(item => {
            const perf = item.performance;
            let nameDisplay = item.name;
            if (item.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID && appliedCriteriaData) {
                 nameDisplay += ` (${studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteriaData.criteria, appliedCriteriaData.logic, true)})`;
            }
            let evalKollektivText = '';
            if (item.evalKollektiv && item.evalKollektiv !== kollektivName) {
                 evalKollektivText = ` (${lang === 'de' ? 'Eval. auf' : 'Eval. on'} ${getKollektivDisplayName(item.evalKollektiv)}, N=${item.nPatInEvalKollektiv || '?'})`;
            } else if (item.evalKollektiv) {
                 evalKollektivText = ` (N=${item.nPatInEvalKollektiv || '?'})`;
            }


            return {
                name: `${nameDisplay}${evalKollektivText}`,
                sens: perf ? formatPercent(perf.sens?.value, 1, na) : na,
                spez: perf ? formatPercent(perf.spez?.value, 1, na) : na,
                ppv: perf ? formatPercent(perf.ppv?.value, 1, na) : na,
                npv: perf ? formatPercent(perf.npv?.value, 1, na) : na,
                acc: perf ? formatPercent(perf.acc?.value, 1, na) : na,
                auc: perf ? formatNumber(perf.auc?.value, 3, na, true) : na
            };
        });

        const cardTitle = UI_TEXTS.criteriaComparison.title + ` (${getKollektivDisplayName(kollektivName)})`;
        const downloadButtons = [{ id: 'dl-critcomp-md', icon: 'fab fa-markdown', format: 'md', tooltip: TOOLTIP_CONTENT.exportTab.criteriaComparisonMD.description }];

        return _createSimpleTable('kriterien-vergleich', headersConfig, rows, cardTitle, 'criteriaComparisonTable', downloadButtons, 'table-sm table-bordered table-hover');
    }


    return Object.freeze({
        renderDatenTabelle,
        renderAuswertungTabelle,
        renderDescriptiveStatsTable,
        renderDiagnosticPerformanceTable,
        renderComparisonTable,
        renderAssociationsTable,
        renderCriteriaComparisonTable
    });

})();
