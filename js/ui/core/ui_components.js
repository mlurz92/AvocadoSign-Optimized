const uiComponents = (() => {

    function createDashboardCard(title, content, chartId = null, cardClasses = '', headerClasses = '', bodyClasses = '', downloadButtons = []) {
        let headerButtonHtml = '';
         if(downloadButtons && downloadButtons.length > 0 && chartId) {
             headerButtonHtml = downloadButtons.map(btn =>
                 `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${btn.id}" data-chart-id="${chartId}" data-format="${btn.format}" data-tippy-content="${ui_helpers.escapeMarkdown(btn.tooltip || `Als ${btn.format.toUpperCase()} herunterladen`)}"> <i class="fas ${btn.icon || 'fa-download'}"></i></button>`
             ).join('');
        }
        const tooltipKey = chartId ? chartId.replace(/^chart-/, 'chart') : (title.toLowerCase().replace(/\s+/g, ''));
        const tooltipContent = TOOLTIP_CONTENT.deskriptiveStatistik[tooltipKey]?.description || title || '';

        return `
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 dashboard-card-col ${cardClasses}">
                <div class="card h-100 dashboard-card">
                    <div class="card-header ${headerClasses} d-flex justify-content-between align-items-center" data-tippy-content="${ui_helpers.escapeMarkdown(tooltipContent)}">
                        <span class="text-truncate">${ui_helpers.escapeMarkdown(title)}</span>
                        <span class="card-header-buttons flex-shrink-0 ps-1">${headerButtonHtml}</span>
                    </div>
                    <div class="card-body d-flex flex-column justify-content-between ${bodyClasses}">
                        <div class="dashboard-card-content">${content}</div>
                        ${chartId ? `<div id="${chartId}" class="mt-1 w-100 dashboard-chart-container" style="min-height: 120px; flex-grow: 1;"></div>` : ''}
                    </div>
                </div>
            </div>`;
    }

    function createT2CriteriaControls(initialCriteria, initialLogic) {
        if (!initialCriteria || !initialLogic) return '<p class="text-danger">Fehler: Initialkriterien konnten nicht geladen werden.</p>';
        const logicChecked = initialLogic === 'ODER';
        const defaultCriteriaForSize = getDefaultT2Criteria();
        const sizeThreshold = initialCriteria.size?.threshold ?? defaultCriteriaForSize?.size?.threshold ?? 5.0;
        const sizeMin = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min;
        const sizeMax = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max;
        const sizeStep = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step;
        const formattedThreshold = formatNumber(sizeThreshold, 1, '5.0', true);

        const createButtonOptions = (key, isChecked, criterionLabel) => {
            const valuesKey = key.toUpperCase() + '_VALUES';
            const values = APP_CONFIG.T2_CRITERIA_SETTINGS[valuesKey] || [];
            const currentValue = initialCriteria[key]?.value;
            return values.map(value => {
                const isActiveValue = isChecked && currentValue === value;
                const icon = ui_helpers.getT2IconSVG(key, value);
                const buttonTooltip = `Kriterium '${criterionLabel}' auf '${value}' setzen. ${isChecked ? '' : '(Kriterium ist derzeit inaktiv)'}`;
                return `<button class="btn t2-criteria-button criteria-icon-button ${isActiveValue ? 'active' : ''} ${isChecked ? '' : 'inactive-option'}" data-criterion="${key}" data-value="${value}" data-tippy-content="${ui_helpers.escapeMarkdown(buttonTooltip)}" ${isChecked ? '' : 'disabled'}>${icon}</button>`;
            }).join('');
        };

        const createCriteriaGroup = (key, label, tooltipKey, contentGenerator) => {
            const isChecked = initialCriteria[key]?.active === true;
            const tooltip = TOOLTIP_CONTENT[tooltipKey]?.description || label;
            return `
                <div class="col-md-6 criteria-group">
                    <div class="form-check mb-2">
                        <input class="form-check-input criteria-checkbox" type="checkbox" value="${key}" id="check-${key}" ${isChecked ? 'checked' : ''}>
                        <label class="form-check-label fw-bold" for="check-${key}">${label}</label>
                         <span data-tippy-content="${ui_helpers.escapeMarkdown(tooltip)}"> <i class="fas fa-info-circle text-muted ms-1"></i></span>
                    </div>
                    <div class="criteria-options-container ps-3">
                        ${contentGenerator(key, isChecked, label)}
                    </div>
                </div>`;
        };

        return `
            <div class="card criteria-card" id="t2-criteria-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>T2 Malignitäts-Kriterien Definieren</span>
                    <div class="form-check form-switch" data-tippy-content="${ui_helpers.escapeMarkdown(TOOLTIP_CONTENT.t2Logic.description)}">
                         <label class="form-check-label small me-2" for="t2-logic-switch" id="t2-logic-label-prefix">Logik:</label>
                         <input class="form-check-input" type="checkbox" role="switch" id="t2-logic-switch" ${logicChecked ? 'checked' : ''}>
                         <label class="form-check-label fw-bold" for="t2-logic-switch" id="t2-logic-label">${initialLogic}</label>
                     </div>
                </div>
                <div class="card-body">
                     <div class="row g-4">
                        ${createCriteriaGroup('size', 'Größe', 't2Size', (key, isChecked) => `
                            <div class="d-flex align-items-center flex-wrap">
                                 <span class="me-1 small text-muted">≥</span>
                                 <input type="range" class="form-range criteria-range flex-grow-1 me-2" id="range-size" min="${sizeMin}" max="${sizeMax}" step="${sizeStep}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} data-tippy-content="Schwellenwert für Kurzachsendurchmesser (≥) einstellen.">
                                 <span class="criteria-value-display text-end me-1 fw-bold" id="value-size">${formatNumber(sizeThreshold, 1)}</span><span class="me-2 small text-muted">mm</span>
                                 <input type="number" class="form-control form-control-sm criteria-input-manual" id="input-size" min="${sizeMin}" max="${sizeMax}" step="${sizeStep}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} style="width: 70px;" aria-label="Größe manuell eingeben" data-tippy-content="Schwellenwert manuell eingeben oder anpassen.">
                            </div>
                        `)}
                        ${createCriteriaGroup('form', 'Form', 't2Form', createButtonOptions)}
                        ${createCriteriaGroup('kontur', 'Kontur', 't2Kontur', createButtonOptions)}
                        ${createCriteriaGroup('homogenitaet', 'Homogenität', 't2Homogenitaet', createButtonOptions)}
                        ${createCriteriaGroup('signal', 'Signal', 't2Signal', (key, isChecked, label) => `
                            <div>${createButtonOptions(key, isChecked, label)}</div>
                            <small class="text-muted d-block mt-1">Hinweis: Lymphknoten mit Signal 'null' erfüllen das Signal-Kriterium nie.</small>
                        `)}
                        <div class="col-12 d-flex justify-content-end align-items-center border-top pt-3 mt-3">
                            <button class="btn btn-sm btn-outline-secondary me-2" id="btn-reset-criteria" data-tippy-content="${ui_helpers.escapeMarkdown(TOOLTIP_CONTENT.t2Actions.reset)}">
                                <i class="fas fa-undo me-1"></i> Zurücksetzen (Standard)
                            </button>
                            <button class="btn btn-sm btn-primary" id="btn-apply-criteria" data-tippy-content="${ui_helpers.escapeMarkdown(TOOLTIP_CONTENT.t2Actions.apply)}">
                                <i class="fas fa-check me-1"></i> Anwenden & Speichern
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function createBruteForceCard(currentKollektivName, workerAvailable) {
        const disabledAttribute = !workerAvailable ? 'disabled' : '';
        const startButtonText = workerAvailable ? '<i class="fas fa-cogs me-1"></i> Optimierung starten' : '<i class="fas fa-times-circle me-1"></i> Worker nicht verfügbar';
        const statusText = workerAvailable ? 'Bereit.' : 'Worker konnte nicht initialisiert werden.';
        const defaultMetric = APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC || 'Balanced Accuracy';

        return `
        <div class="col-12">
            <div class="card">
                <div class="card-header">Kriterien-Optimierung (Brute-Force)</div>
                <div class="card-body">
                    <p class="card-text small">Findet automatisch die Kombination von T2-Kriterien (Größe, Form, Kontur, Homogenität, Signal) und Logik (UND/ODER), die eine gewählte diagnostische Metrik im Vergleich zum N-Status maximiert.</p>
                    <div class="row g-3 align-items-end mb-3">
                        <div class="col-md-4">
                            <label for="brute-force-metric" class="form-label form-label-sm">Zielmetrik:</label>
                            <select class="form-select form-select-sm" id="brute-force-metric" data-tippy-content="${ui_helpers.escapeMarkdown(TOOLTIP_CONTENT.bruteForceMetric.description)}">
                                <option value="Accuracy" ${defaultMetric === 'Accuracy' ? 'selected' : ''}>Accuracy</option>
                                <option value="Balanced Accuracy" ${defaultMetric === 'Balanced Accuracy' ? 'selected' : ''}>Balanced Accuracy</option>
                                <option value="F1-Score" ${defaultMetric === 'F1-Score' ? 'selected' : ''}>F1-Score</option>
                                <option value="PPV" ${defaultMetric === 'PPV' ? 'selected' : ''}>Positiver Prädiktiver Wert (PPV)</option>
                                <option value="NPV" ${defaultMetric === 'NPV' ? 'selected' : ''}>Negativer Prädiktiver Wert (NPV)</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                             <button class="btn btn-primary btn-sm w-100" id="btn-start-brute-force" data-tippy-content="${ui_helpers.escapeMarkdown(TOOLTIP_CONTENT.bruteForceStart.description)}" ${disabledAttribute}>
                                 ${startButtonText}
                             </button>
                        </div>
                         <div class="col-md-4">
                             <div id="brute-force-info" class="text-muted small text-md-end" data-tippy-content="${ui_helpers.escapeMarkdown(TOOLTIP_CONTENT.bruteForceInfo.description)}">
                                 Status: <span id="bf-status-text" class="fw-bold">${statusText}</span><br>Kollektiv: <strong id="bf-kollektiv-info">${ui_helpers.escapeMarkdown(currentKollektivName)}</strong>
                             </div>
                         </div>
                    </div>
                     <div id="brute-force-progress-container" class="mt-3 d-none" data-tippy-content="${ui_helpers.escapeMarkdown(TOOLTIP_CONTENT.bruteForceProgress.description)}">
                         <div class="d-flex justify-content-between mb-1 small">
                            <span>Fortschritt: <span id="bf-tested-count">0</span> / <span id="bf-total-count">0</span></span>
                            <span id="bf-progress-percent">0%</span>
                         </div>
                         <div class="progress" style="height: 8px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" id="bf-progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                         </div>
                         <div class="mt-2 small">
                            Beste <span id="bf-metric-label" class="fw-bold">Metrik</span> bisher: <span id="bf-best-metric" class="fw-bold">--</span>
                            <div id="bf-best-criteria" class="mt-1 text-muted" style="word-break: break-word;">Beste Kriterien: --</div>
                         </div>
                          <button class="btn btn-danger btn-sm mt-2 d-none" id="btn-cancel-brute-force" data-tippy-content="Bricht die laufende Brute-Force-Optimierung ab.">
                            <i class="fas fa-times me-1"></i> Abbrechen
                         </button>
                     </div>
                     <div id="brute-force-result-container" class="mt-3 d-none alert alert-success p-2" role="alert" data-tippy-content="${ui_helpers.escapeMarkdown(TOOLTIP_CONTENT.bruteForceResult.description)}">
                         <h6 class="alert-heading small">Optimierung Abgeschlossen</h6>
                         <p class="mb-1 small">Beste Kombi für <strong id="bf-result-metric"></strong> (Koll.: <strong id="bf-result-kollektiv"></strong>):</p>
                         <ul class="list-unstyled mb-1 small">
                            <li><strong>Wert:</strong> <span id="bf-result-value" class="fw-bold"></span></li>
                            <li><strong>Logik:</strong> <span id="bf-result-logic" class="fw-bold"></span></li>
                            <li style="word-break: break-word;"><strong>Kriterien:</strong> <span id="bf-result-criteria" class="fw-bold"></span></li>
                         </ul>
                         <p class="mb-1 small text-muted">Dauer: <span id="bf-result-duration"></span>s | Getestet: <span id="bf-result-total-tested"></span></small></p>
                         <hr class="my-1">
                         <button class="btn btn-success btn-sm me-2" id="btn-apply-best-bf-criteria" data-tippy-content="Wendet die beste gefundene Kriterienkombination an und speichert sie.">
                             <i class="fas fa-check me-1"></i> Anwenden
                         </button>
                         <button class="btn btn-outline-secondary btn-sm" id="btn-show-brute-force-details" data-bs-toggle="modal" data-bs-target="#brute-force-modal" data-tippy-content="${ui_helpers.escapeMarkdown(TOOLTIP_CONTENT.bruteForceDetailsButton.description)}">
                             <i class="fas fa-list-ol me-1"></i> Top 10
                         </button>
                     </div>
                </div>
            </div>
        </div>
        `;
    }

    function createStatistikCard(id, title, content = '', addPadding = true, tooltipKey = null, downloadButtons = [], tableId = null) {
        const cardTooltipHtml = tooltipKey && TOOLTIP_CONTENT[tooltipKey]?.cardTitle
            ? `data-tippy-content="${ui_helpers.escapeMarkdown(TOOLTIP_CONTENT[tooltipKey].cardTitle.replace(/\[KOLLEKTIV\]/g, '{KOLLEKTIV_PLACEHOLDER}'))}"`
            : '';

        let headerButtonHtml = downloadButtons.map(btn => `
            <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${btn.id}" data-chart-id="${id}-content" data-format="${btn.format}" data-tippy-content="${ui_helpers.escapeMarkdown(btn.tooltip)}">
                <i class="fas ${btn.icon}"></i>
            </button>`).join('');

        if (APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT && tableId) {
             const pngExportButton = { id: `dl-${id}-table-png`, icon: 'fa-image', tooltip: `Tabelle '${title}' als PNG herunterladen.`, format: 'png', tableId: tableId, tableName: title.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').substring(0,30) };
             headerButtonHtml += `
                 <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${pngExportButton.id}" data-table-id="${pngExportButton.tableId}" data-table-name="${pngExportButton.tableName}" data-tippy-content="${ui_helpers.escapeMarkdown(pngExportButton.tooltip)}">
                     <i class="fas ${pngExportButton.icon}"></i>
                 </button>`;
        }

        return `
            <div class="col-12 stat-card" id="${id}-card-container">
                <div class="card h-100">
                    <div class="card-header" ${cardTooltipHtml}>
                         ${ui_helpers.escapeMarkdown(title)}
                         <span class="float-end card-header-buttons">
                            ${headerButtonHtml}
                         </span>
                     </div>
                    <div class="card-body ${addPadding ? '' : 'p-0'}" style="overflow-y: auto; overflow-x: hidden;">
                        <div id="${id}-content">
                            ${content}
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function createExportOptions(currentKollektiv) {
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(currentKollektiv).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        const fileNameTemplate = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE;

        const generateButtonHTML = (idSuffix, iconClass, text, tooltipKey, disabled = false, experimental = false) => {
            const config = TOOLTIP_CONTENT.exportTab[tooltipKey]; if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) return ``;
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]; const ext = config.ext; const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeKollektiv).replace('{DATE}', dateStr).replace('{EXT}', ext); const tooltipHtml = `data-tippy-content="${ui_helpers.escapeMarkdown(config.description)}<br><small>Datei: ${ui_helpers.escapeMarkdown(filename)}</small>"`; const disabledAttr = disabled ? 'disabled' : ''; const experimentalBadge = experimental ? '<span class="badge bg-warning text-dark ms-1 small">Experimentell</span>' : ''; const buttonClass = disabled ? 'btn-outline-secondary' : 'btn-outline-primary';
            return `<button class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabledAttr}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${ui_helpers.escapeMarkdown(text)} (.${ext})</span> ${experimentalBadge}</button>`;
        };

         const generateZipButtonHTML = (idSuffix, iconClass, text, tooltipKey, disabled = false) => {
            const config = TOOLTIP_CONTENT.exportTab[tooltipKey]; if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) return ``;
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]; const ext = config.ext; const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeKollektiv).replace('{DATE}', dateStr).replace('{EXT}', ext); const tooltipHtml = `data-tippy-content="${ui_helpers.escapeMarkdown(config.description)}<br><small>Datei: ${ui_helpers.escapeMarkdown(filename)}</small>"`; const disabledAttr = disabled ? 'disabled' : ''; const buttonClass = idSuffix === 'all-zip' ? 'btn-primary' : 'btn-outline-secondary';
            return `<button class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabledAttr}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${ui_helpers.escapeMarkdown(text)} (.${ext})</span></button>`;
         };

        const exportDesc = TOOLTIP_CONTENT.exportTab.description.replace('[KOLLEKTIV]', `<strong>${ui_helpers.escapeMarkdown(safeKollektiv)}</strong>`);

        return `
            <div class="row export-options-container">
                <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${ui_helpers.escapeMarkdown(TOOLTIP_CONTENT.exportTab.singleExports)}</div>
                        <div class="card-body">
                            <p class="small text-muted mb-3">${exportDesc}</p>
                            <h6 class="text-muted small text-uppercase mb-2">Berichte & Statistiken</h6>
                            ${generateButtonHTML('statistik-csv', 'fas fa-file-csv', 'Statistik Ergebnisse', 'statsCSV')}
                            ${generateButtonHTML('bruteforce-txt', 'fas fa-file-alt', 'Brute-Force Bericht', 'bruteForceTXT', true)}
                            ${generateButtonHTML('deskriptiv-md', 'fab fa-markdown', 'Deskriptive Statistik', 'deskriptivMD')}
                            ${generateButtonHTML('comprehensive-report-html', 'fas fa-file-invoice', 'Umfassender Bericht', 'comprehensiveReportHTML')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">Tabellen & Rohdaten</h6>
                             ${generateButtonHTML('patienten-md', 'fab fa-markdown', 'Datenliste', 'patientenMD')}
                             ${generateButtonHTML('auswertung-md', 'fab fa-markdown', 'Auswertungstabelle', 'auswertungMD')}
                             ${generateButtonHTML('filtered-data-csv', 'fas fa-database', 'Gefilterte Rohdaten', 'filteredDataCSV')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">Diagramme & Tabellen (als Bilder)</h6>
                             ${generateButtonHTML('charts-png', 'fas fa-images', 'Diagramme & Tabellen (PNG)', 'pngZIP')}
                             ${generateButtonHTML('charts-svg', 'fas fa-file-code', 'Diagramme (SVG)', 'svgZIP')}
                        </div>
                    </div>
                </div>
                 <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${ui_helpers.escapeMarkdown(TOOLTIP_CONTENT.exportTab.exportPackages)}</div>
                        <div class="card-body">
                             <p class="small text-muted mb-3">Bündelt mehrere thematisch zusammengehörige Exportdateien in einem ZIP-Archiv für das Kollektiv <strong>${ui_helpers.escapeMarkdown(safeKollektiv)}</strong>.</p>
                            ${generateZipButtonHTML('all-zip', 'fas fa-file-archive', 'Gesamtpaket (Alle Dateien)', 'allZIP')}
                            ${generateZipButtonHTML('csv-zip', 'fas fa-file-csv', 'Nur CSVs', 'csvZIP')}
                            ${generateZipButtonHTML('md-zip', 'fab fa-markdown', 'Nur Markdown', 'mdZIP')}
                            ${generateZipButtonHTML('png-zip', 'fas fa-images', 'Nur Diagramm/Tabellen-PNGs', 'pngZIP')}
                            ${generateZipButtonHTML('svg-zip', 'fas fa-file-code', 'Nur Diagramm-SVGs', 'svgZIP')}
                        </div>
                    </div>
                </div>
                <div class="col-lg-12 col-xl-4 mb-3">
                   <div class="card h-100"> <div class="card-header">Hinweise zum Export</div> <div class="card-body small"> <ul class="list-unstyled mb-0"> <li class="mb-2"><i class="fas fa-info-circle fa-fw me-1 text-primary"></i>Alle Exporte basieren auf dem aktuell gewählten Kollektiv und den zuletzt <strong>angewendeten</strong> T2-Kriterien.</li> <li class="mb-2"><i class="fas fa-table fa-fw me-1 text-primary"></i><strong>CSV:</strong> Für Statistiksoftware; Trennzeichen: Semikolon (;).</li> <li class="mb-2"><i class="fab fa-markdown fa-fw me-1 text-primary"></i><strong>MD:</strong> Für Dokumentation.</li> <li class="mb-2"><i class="fas fa-file-alt fa-fw me-1 text-primary"></i><strong>TXT:</strong> Brute-Force-Bericht.</li> <li class="mb-2"><i class="fas fa-file-invoice fa-fw me-1 text-primary"></i><strong>HTML Bericht:</strong> Umfassend, druckbar.</li> <li class="mb-2"><i class="fas fa-images fa-fw me-1 text-primary"></i><strong>PNG:</strong> Pixelbasiert (Diagramme/Tabellen).</li> <li class="mb-2"><i class="fas fa-file-code fa-fw me-1 text-primary"></i><strong>SVG:</strong> Vektorbasiert (Diagramme), skalierbar.</li> <li class="mb-0"><i class="fas fa-exclamation-triangle fa-fw me-1 text-warning"></i>ZIP-Exporte für Diagramme/Tabellen erfassen nur aktuell im DOM sichtbare Elemente. Einzel-Downloads sind direkt am Element in den jeweiligen Tabs möglich.</li> </ul> </div> </div>
                </div>
            </div>
        `;
    }

    function createT2MetricsOverview(stats, kollektivName) {
        const cardTooltip = (TOOLTIP_CONTENT.t2MetricsOverview.cardTitle || '').replace('[KOLLEKTIV]', `<strong>${ui_helpers.escapeMarkdown(kollektivName)}</strong>`);
        if (!stats || !stats.matrix || stats.matrix.rp === undefined) {
             return `<div class="card bg-light border-secondary" data-tippy-content="${ui_helpers.escapeMarkdown(cardTooltip)}"><div class="card-header card-header-sm bg-secondary text-white">Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)</div><div class="card-body p-2"><p class="m-0 text-muted small">Metriken für T2 nicht verfügbar.</p></div></div>`;
        }
        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
        const metricDisplayNames = { sens: 'Sens', spez: 'Spez', ppv: 'PPV', npv: 'NPV', acc: 'Acc', balAcc: 'BalAcc', f1: 'F1', auc: 'AUC' };
        const na = '--';

        let contentHTML = '<div class="d-flex flex-wrap justify-content-around small text-center">';

        metrics.forEach((key, index) => {
            const metricData = stats[key];
            const metricDescription = (TOOLTIP_CONTENT.t2MetricsOverview?.[key] || TOOLTIP_CONTENT.statMetrics[key]?.description || key).replace(/\[METHODE\]/g, 'T2');
            const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[key]?.interpretation || 'Keine Interpretation verfügbar.';
            const digits = (key === 'f1' || key === 'auc' || key === 'balAcc') ? 3 : 1;
            const isPercent = !(key === 'f1' || key === 'auc' || key === 'balAcc');
            const formattedValue = formatCI(metricData?.value, metricData?.ci?.lower, metricData?.ci?.upper, digits, isPercent, na);
            const valueStr = formatNumber(metricData?.value, digits, na, isPercent);
            const lowerStr = formatNumber(metricData?.ci?.lower, digits, na, isPercent);
            const upperStr = formatNumber(metricData?.ci?.upper, digits, na, isPercent);
            const ciMethodStr = metricData?.method || na;
            const bewertungStr = (key === 'auc' || key === 'balAcc') ? getAUCBewertung(metricData?.value) : '';

            const filledInterpretation = interpretationTemplate
                .replace(/\[METHODE\]/g, 'T2')
                .replace(/\[WERT\]/g, `<strong>${valueStr}${isPercent ? '%' : ''}</strong>`)
                .replace(/\[LOWER\]/g, lowerStr.replace('%',''))
                .replace(/\[UPPER\]/g, upperStr.replace('%',''))
                .replace(/\[METHOD_CI\]/g, ciMethodStr)
                .replace(/\[KOLLEKTIV\]/g, `<strong>${ui_helpers.escapeMarkdown(kollektivName)}</strong>`)
                .replace(/\[BEWERTUNG\]/g, `<strong>${ui_helpers.escapeMarkdown(bewertungStr)}</strong>`)
                .replace(/<hr.*?>.*$/, '');

            contentHTML += `
                <div class="p-1 flex-fill bd-highlight ${index > 0 ? 'border-start' : ''}">
                    <strong data-tippy-content="${ui_helpers.escapeMarkdown(metricDescription)}">${metricDisplayNames[key]}:</strong>
                    <span data-tippy-content="${ui_helpers.escapeMarkdown(filledInterpretation)}"> ${formattedValue}</span>
                </div>`;
        });

        contentHTML += '</div>';

        return `<div class="card bg-light border-secondary" data-tippy-content="${ui_helpers.escapeMarkdown(cardTooltip)}"><div class="card-header card-header-sm bg-secondary text-white">Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)</div><div class="card-body p-2">${contentHTML}</div></div>`;
    }

    function createBruteForceModalContent(results, metric, kollektiv, duration, totalTested) {
        if (!results || results.length === 0) return '<p class="text-muted">Keine Ergebnisse gefunden.</p>';
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'Formatierungsfehler';
        const getKollektivNameFunc = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName : (k) => k;
        const bestResult = results[0]; const kollektivName = getKollektivNameFunc(kollektiv); const metricDisplayName = metric === 'PPV' ? 'PPV' : metric === 'NPV' ? 'NPV' : metric;
        let tableHTML = `<div class="alert alert-light small p-2 mb-3"><p class="mb-1"><strong>Beste Kombi für '${ui_helpers.escapeMarkdown(metricDisplayName)}' (Koll.: '${ui_helpers.escapeMarkdown(kollektivName)}'):</strong></p><ul class="list-unstyled mb-1"><li><strong>Wert:</strong> ${formatNumber(bestResult.metricValue, 4)}</li><li><strong>Logik:</strong> ${ui_helpers.escapeMarkdown(bestResult.logic.toUpperCase())}</li><li><strong>Kriterien:</strong> ${ui_helpers.escapeMarkdown(formatCriteriaFunc(bestResult.criteria, bestResult.logic))}</li></ul><p class="mb-0 text-muted"><small>Dauer: ${formatNumber(duration / 1000, 1)}s | Getestet: ${formatNumber(totalTested, 0)}</small></p></div><h6 class="mb-2">Top Ergebnisse (Ranking berücksichtigt bis zu 10 Ränge, ggf. mehr Einträge bei identischen Werten):</h6><div class="table-responsive"><table class="table table-sm table-striped table-hover small" id="bruteforce-results-table"><thead class="small"><tr><th data-tippy-content="Rang">Rang</th><th data-tippy-content="Wert der Zielmetrik (${ui_helpers.escapeMarkdown(metricDisplayName)})">${ui_helpers.escapeMarkdown(metricDisplayName)}</th><th data-tippy-content="Logik">Logik</th><th data-tippy-content="Kriterienkombination">Kriterien</th></tr></thead><tbody>`;
        let rank = 1, displayedCount = 0, lastMetricValue = -Infinity; const precision = 1e-8;
        for (let i = 0; i < results.length; i++) { const result = results[i]; if (!result || typeof result.metricValue !== 'number' || !isFinite(result.metricValue)) continue; const currentMetricValueRounded = parseFloat(result.metricValue.toFixed(precision)); const lastMetricValueRounded = parseFloat(lastMetricValue.toFixed(precision)); let currentRank = rank; const isNewRank = Math.abs(currentMetricValueRounded - lastMetricValueRounded) > precision; if (i > 0 && isNewRank) { rank = displayedCount + 1; currentRank = rank; } else if (i > 0) { currentRank = rank; } if (rank > 10 && isNewRank) break; tableHTML += `<tr><td>${currentRank}.</td><td>${formatNumber(result.metricValue, 4)}</td><td>${ui_helpers.escapeMarkdown(result.logic.toUpperCase())}</td><td>${ui_helpers.escapeMarkdown(formatCriteriaFunc(result.criteria, result.logic))}</td></tr>`; if (isNewRank || i === 0) { lastMetricValue = result.metricValue; } displayedCount++; }
        tableHTML += `</tbody></table></div>`; return tableHTML;
    }

    function createPublikationTabSteuerung(currentSectionId, currentLang) {
        let sectionButtonsHTML = APP_CONFIG.UI_SETTINGS.PUBLIKATION_SECTIONS.map(section => {
            const label = UI_TEXTS.publikationTab.sectionLabels[section.id] || section[`label_${currentLang}`] || section.label_de || section.id;
            const isActive = section.id === currentSectionId;
            const tooltipKey = `sectionButton${section.id.charAt(0).toUpperCase() + section.id.slice(1)}`;
            const tooltip = TOOLTIP_CONTENT.publikationTab[tooltipKey] || `Zeige Abschnitt: ${label}`;
            return `<button class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-secondary'} pub-section-btn" data-section-id="${section.id}" data-tippy-content="${ui_helpers.escapeMarkdown(tooltip)}">
                        <i class="${section.icon || 'fas fa-file-alt'} fa-fw me-1"></i>${ui_helpers.escapeMarkdown(label)}
                    </button>`;
        }).join('');

        const langSwitchChecked = currentLang === 'en';
        const langSwitchLabel = UI_TEXTS.publikationTab.spracheSwitchLabel[currentLang] || (currentLang === 'en' ? 'English' : 'Deutsch');
        const langSwitchTooltip = TOOLTIP_CONTENT.publikationTab.languageSwitch || 'Sprache wechseln';

        return `
            <div class="publication-tab-controls sticky-top">
                <div class="btn-group" role="group" aria-label="Publikationsabschnitte">
                    ${sectionButtonsHTML}
                </div>
                <div class="form-check form-switch" data-tippy-content="${ui_helpers.escapeMarkdown(langSwitchTooltip)}">
                    <input class="form-check-input" type="checkbox" role="switch" id="publikation-sprache-switch" ${langSwitchChecked ? 'checked' : ''}>
                    <label class="form-check-label small fw-bold" for="publikation-sprache-switch" id="publikation-sprache-label">${ui_helpers.escapeMarkdown(langSwitchLabel)}</label>
                </div>
            </div>
        `;
    }

    function createPublikationSectionTextCard(titleKey, htmlContent, cardId, cardTooltipKey = null, lang = 'de') {
        const title = UI_TEXTS.publikationTab[titleKey]?.[lang] || (lang === 'de' ? 'Textabschnitt' : 'Text Section');
        const tooltip = cardTooltipKey && TOOLTIP_CONTENT.publikationTab[cardTooltipKey]?.[lang] ? TOOLTIP_CONTENT.publikationTab[cardTooltipKey][lang] : title;
        return `
            <div class="card publication-section-card mb-4" id="${cardId}">
                <div class="card-header" data-tippy-content="${ui_helpers.escapeMarkdown(tooltip)}">
                    ${ui_helpers.escapeMarkdown(title)}
                </div>
                <div class="card-body">
                    <div class="publication-prose">
                        ${htmlContent}
                    </div>
                </div>
            </div>
        `;
    }
    function createPublikationSectionDataCard(titleKey, htmlContent, cardId, cardTooltipKey = null, lang = 'de') {
        const title = UI_TEXTS.publikationTab[titleKey]?.[lang] || (lang === 'de' ? 'Daten & Visualisierungen' : 'Data & Visualizations');
        const tooltip = cardTooltipKey && TOOLTIP_CONTENT.publikationTab[cardTooltipKey]?.[lang] ? TOOLTIP_CONTENT.publikationTab[cardTooltipKey][lang] : title;
         return `
            <div class="card publication-section-card" id="${cardId}">
                <div class="card-header" data-tippy-content="${ui_helpers.escapeMarkdown(tooltip)}">
                    ${ui_helpers.escapeMarkdown(title)}
                </div>
                <div class="card-body">
                    ${htmlContent}
                </div>
            </div>
        `;
    }


    return Object.freeze({
        createDashboardCard,
        createT2CriteriaControls,
        createBruteForceCard,
        createStatistikCard,
        createExportOptions,
        createT2MetricsOverview,
        createBruteForceModalContent,
        createPublikationTabSteuerung,
        createPublikationSectionTextCard,
        createPublikationSectionDataCard
    });

})();