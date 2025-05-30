const uiComponents = (() => {

    function _createHeaderButtonHTML(buttons, targetId, defaultTitle = 'Element') {
        let headerButtonHtml = '';
        if (buttons && Array.isArray(buttons) && buttons.length > 0 && targetId) {
            headerButtonHtml = buttons.map(btn => {
                const btnId = btn.id || `dl-${String(targetId).replace(/[^a-zA-Z0-9_-]/g, '')}-${btn.format || 'action'}`;
                const iconClass = btn.icon || 'fa-download';
                let tooltip = btn.tooltip || `Als ${String(btn.format || 'Aktion').toUpperCase()} herunterladen`;

                const safeDefaultTitle = String(defaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);
                const safeChartName = String(btn.chartName || safeDefaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);
                const safeTableName = String(btn.tableName || safeDefaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);

                if (typeof TOOLTIP_CONTENT !== 'undefined' && TOOLTIP_CONTENT.exportTab) {
                    if (btn.format === 'png' && btn.chartId && TOOLTIP_CONTENT.exportTab.chartSinglePNG?.description) {
                        tooltip = TOOLTIP_CONTENT.exportTab.chartSinglePNG.description.replace('{ChartName}', `<strong>${safeChartName}</strong>`);
                    } else if (btn.format === 'svg' && btn.chartId && TOOLTIP_CONTENT.exportTab.chartSingleSVG?.description) {
                        tooltip = TOOLTIP_CONTENT.exportTab.chartSingleSVG.description.replace('{ChartName}', `<strong>${safeChartName}</strong>`);
                    } else if (btn.format === 'png' && btn.tableId && TOOLTIP_CONTENT.exportTab.tableSinglePNG?.description) {
                        tooltip = TOOLTIP_CONTENT.exportTab.tableSinglePNG.description.replace('{TableName}', `<strong>${safeTableName}</strong>`);
                    }
                }


                const dataAttributes = [];
                if (btn.chartId) dataAttributes.push(`data-chart-id="${btn.chartId}"`);
                if (btn.tableId) dataAttributes.push(`data-table-id="${btn.tableId}"`);

                if (btn.tableName) dataAttributes.push(`data-table-name="${safeTableName.replace(/\s/g, '_')}"`);
                else if (btn.chartName) dataAttributes.push(`data-chart-name="${safeChartName.replace(/\s/g, '_')}"`);
                else dataAttributes.push(`data-default-name="${safeDefaultTitle.replace(/\s/g, '_')}"`);


                if (btn.format) dataAttributes.push(`data-format="${btn.format}"`);

                return `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 ${btn.tableId ? 'table-download-png-btn' : (btn.chartId ? 'chart-download-btn' : '')}" id="${btnId}" ${dataAttributes.join(' ')} data-tippy-content="${tooltip}"><i class="fas ${iconClass}"></i></button>`;
            }).join('');
        }
        return headerButtonHtml;
    }

    function createDashboardCard(title, content, chartId = null, cardClasses = '', headerClasses = '', bodyClasses = '', downloadButtons = []) {
        const headerButtonHtml = _createHeaderButtonHTML(downloadButtons, chartId || String(title).replace(/[^a-z0-9]/gi, '_'), title);
        const tooltipKey = chartId ? chartId.replace(/^chart-dash-/, '') : String(title).toLowerCase().replace(/\s+/g, '');
        let tooltipContent = (typeof TOOLTIP_CONTENT !== 'undefined' && TOOLTIP_CONTENT.deskriptiveStatistik && TOOLTIP_CONTENT.deskriptiveStatistik[tooltipKey]?.description) || title || '';

        if (typeof TOOLTIP_CONTENT !== 'undefined' && TOOLTIP_CONTENT.deskriptiveStatistik) {
            if(tooltipKey === 'ageDistribution' || tooltipKey === 'alter') tooltipContent = TOOLTIP_CONTENT.deskriptiveStatistik.chartAge?.description || title;
            else if(tooltipKey === 'genderDistribution' || tooltipKey === 'geschlecht') tooltipContent = TOOLTIP_CONTENT.deskriptiveStatistik.chartGender?.description || title;
        }


        return `
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 dashboard-card-col ${cardClasses}">
                <div class="card h-100 dashboard-card">
                    <div class="card-header ${headerClasses} d-flex justify-content-between align-items-center" data-tippy-content="${tooltipContent.replace('[KOLLEKTIV]', '<strong>dem aktuellen Kollektiv</strong>')}">
                        <span class="text-truncate">${title}</span>
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
        if (!initialCriteria || !initialLogic || typeof APP_CONFIG === 'undefined' || typeof getDefaultT2Criteria !== 'function' || typeof ui_helpers === 'undefined' || typeof TOOLTIP_CONTENT === 'undefined') {
            return '<p class="text-danger">Fehler: Initialkriterien oder benötigte Konfigurationen konnten nicht geladen werden.</p>';
        }
        const logicChecked = initialLogic === 'ODER';
        const defaultCriteriaForSize = getDefaultT2Criteria();
        const sizeThreshold = initialCriteria.size?.threshold ?? defaultCriteriaForSize?.size?.threshold ?? 5.0;
        const sizeMin = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min;
        const sizeMax = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max;
        const sizeStep = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step;
        const formattedThreshold = typeof formatNumber === 'function' ? formatNumber(sizeThreshold, 1, '5.0', true) : String(sizeThreshold.toFixed(1));

        const createButtonOptions = (key, isChecked, criterionLabel) => {
            const valuesKey = key.toUpperCase() + '_VALUES';
            const values = APP_CONFIG.T2_CRITERIA_SETTINGS[valuesKey] || [];
            const currentValue = initialCriteria[key]?.value;
            return values.map(value => {
                const isActiveValue = isChecked && currentValue === value;
                const icon = ui_helpers.getT2IconSVG(key, value);
                const buttonTooltip = `Kriterium '${criterionLabel}' auf '${value}' setzen. ${isChecked ? '' : '(Kriterium ist derzeit inaktiv)'}`;
                return `<button class="btn t2-criteria-button criteria-icon-button ${isActiveValue ? 'active' : ''} ${isChecked ? '' : 'inactive-option'}" data-criterion="${key}" data-value="${value}" data-tippy-content="${buttonTooltip}" ${isChecked ? '' : 'disabled'}>${icon}</button>`;
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
                         <span data-tippy-content="${tooltip}"> <i class="fas fa-info-circle text-muted ms-1"></i></span>
                    </div>
                    <div class="criteria-options-container ps-3">
                        ${contentGenerator(key, isChecked, label)}
                    </div>
                </div>`;
        };
        const currentFormattedThreshold = typeof formatNumber === 'function' ? formatNumber(sizeThreshold, 1) : String(sizeThreshold.toFixed(1));
        return `
            <div class="card criteria-card" id="t2-criteria-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>T2 Malignitäts-Kriterien Definieren</span>
                    <div class="form-check form-switch" data-tippy-content="${TOOLTIP_CONTENT.t2Logic.description}">
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
                                 <span class="criteria-value-display text-end me-1 fw-bold" id="value-size">${currentFormattedThreshold}</span><span class="me-2 small text-muted">mm</span>
                                 <input type="number" class="form-control form-control-sm criteria-input-manual" id="input-size" min="${sizeMin}" max="${sizeMax}" step="${sizeStep}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} style="width: 70px;" aria-label="Größe manuell eingeben" data-tippy-content="Schwellenwert manuell eingeben oder anpassen.">
                            </div>
                        `)}
                        ${createCriteriaGroup('form', 'Form', 't2Form', createButtonOptions)}
                        ${createCriteriaGroup('kontur', 'Kontur', 't2Kontur', createButtonOptions)}
                        ${createCriteriaGroup('homogenitaet', 'Homogenität', 't2Homogenitaet', createButtonOptions)}
                        ${createCriteriaGroup('signal', 'Signal', 't2Signal', (key, isChecked, label) => `
                            <div>${createButtonOptions(key, isChecked, label)}</div>
                            <small class="text-muted d-block mt-1">Hinweis: Lymphknoten mit Signal 'null' (d.h. nicht beurteilbar/nicht vorhanden) erfüllen das Signal-Kriterium nie.</small>
                        `)}
                        <div class="col-12 d-flex justify-content-end align-items-center border-top pt-3 mt-3">
                            <button class="btn btn-sm btn-outline-secondary me-2" id="btn-reset-criteria" data-tippy-content="${TOOLTIP_CONTENT.t2Actions.reset}">
                                <i class="fas fa-undo me-1"></i> Zurücksetzen (Standard)
                            </button>
                            <button class="btn btn-sm btn-primary" id="btn-apply-criteria" data-tippy-content="${TOOLTIP_CONTENT.t2Actions.apply}">
                                <i class="fas fa-check me-1"></i> Anwenden & Speichern
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function createBruteForceCard(currentKollektivName, workerAvailable) {
        if (typeof APP_CONFIG === 'undefined' || typeof TOOLTIP_CONTENT === 'undefined' || typeof getKollektivDisplayName !== 'function') {
             return '<p class="text-danger">Fehler: Brute-Force-Konfigurationen konnten nicht geladen werden.</p>';
        }
        const disabledAttribute = !workerAvailable ? 'disabled' : '';
        const startButtonText = workerAvailable ? '<i class="fas fa-cogs me-1"></i> Optimierung starten' : '<i class="fas fa-times-circle me-1"></i> Worker nicht verfügbar';
        const statusText = workerAvailable ? 'Bereit.' : 'Worker konnte nicht initialisiert werden.';
        const defaultMetric = APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC || 'Balanced Accuracy';
        const displayKollektivName = getKollektivDisplayName(currentKollektivName);
        const resultContainerTooltip = (TOOLTIP_CONTENT.bruteForceResult.description || 'Ergebnis der Optimierung.')
                                      .replace('[N_GESAMT]', '--')
                                      .replace('[N_PLUS]', '--')
                                      .replace('[N_MINUS]', '--');

        return `
        <div class="col-12">
            <div class="card">
                <div class="card-header">Kriterien-Optimierung (Brute-Force)</div>
                <div class="card-body">
                    <p class="card-text small">Findet automatisch die Kombination von T2-Kriterien (Größe, Form, Kontur, Homogenität, Signal) und Logik (UND/ODER), die eine gewählte diagnostische Metrik im Vergleich zum N-Status maximiert.</p>
                    <div class="row g-3 align-items-end mb-3">
                        <div class="col-md-4">
                            <label for="brute-force-metric" class="form-label form-label-sm">Zielmetrik:</label>
                            <select class="form-select form-select-sm" id="brute-force-metric" data-tippy-content="${TOOLTIP_CONTENT.bruteForceMetric.description}">
                                <option value="Accuracy" ${defaultMetric === 'Accuracy' ? 'selected' : ''}>Accuracy</option>
                                <option value="Balanced Accuracy" ${defaultMetric === 'Balanced Accuracy' ? 'selected' : ''}>Balanced Accuracy</option>
                                <option value="F1-Score" ${defaultMetric === 'F1-Score' ? 'selected' : ''}>F1-Score</option>
                                <option value="PPV" ${defaultMetric === 'PPV' ? 'selected' : ''}>Positiver Prädiktiver Wert (PPV)</option>
                                <option value="NPV" ${defaultMetric === 'NPV' ? 'selected' : ''}>Negativer Prädiktiver Wert (NPV)</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                             <button class="btn btn-primary btn-sm w-100" id="btn-start-brute-force" data-tippy-content="${TOOLTIP_CONTENT.bruteForceStart.description}" ${disabledAttribute}>
                                 ${startButtonText}
                             </button>
                        </div>
                         <div class="col-md-4">
                             <div id="brute-force-info" class="text-muted small text-md-end" data-tippy-content="${(TOOLTIP_CONTENT.bruteForceInfo.description || 'Status des Optimierungs-Workers und aktuelles Kollektiv.').replace('[KOLLEKTIV_NAME]', `<strong>${displayKollektivName}</strong>`)}">
                                 Status: <span id="bf-status-text" class="fw-bold">${statusText}</span><br>Kollektiv: <strong id="bf-kollektiv-info">${displayKollektivName}</strong>
                             </div>
                         </div>
                    </div>
                     <div id="brute-force-progress-container" class="mt-3 d-none" data-tippy-content="${(TOOLTIP_CONTENT.bruteForceProgress.description || 'Fortschritt der laufenden Optimierung.').replace('[TOTAL]', '0')}">
                         <div class="d-flex justify-content-between mb-1 small">
                            <span>Fortschritt: <span id="bf-tested-count">0</span> / <span id="bf-total-count">0</span></span>
                            <span id="bf-progress-percent">0%</span>
                         </div>
                         <div class="progress" style="height: 8px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" id="bf-progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                         </div>
                         <div class="mt-2 small">
                            Beste <span id="bf-metric-label" class="fw-bold">Metrik</span> bisher: <span id="bf-best-metric" class="fw-bold" data-tippy-content="Bester bisher gefundener Wert für die Zielmetrik.">--</span>
                            <div id="bf-best-criteria" class="mt-1 text-muted" style="word-break: break-word;" data-tippy-content="Kriterienkombination und Logik für den besten bisherigen Metrikwert.">Beste Kriterien: --</div>
                         </div>
                          <button class="btn btn-danger btn-sm mt-2 d-none" id="btn-cancel-brute-force" data-tippy-content="Bricht die laufende Brute-Force-Optimierung ab. Bereits gefundene Ergebnisse gehen verloren.">
                            <i class="fas fa-times me-1"></i> Abbrechen
                         </button>
                     </div>
                     <div id="brute-force-result-container" class="mt-3 d-none alert alert-success p-2" role="alert" data-tippy-content="${resultContainerTooltip}">
                         <h6 class="alert-heading small">Optimierung Abgeschlossen</h6>
                         <p class="mb-1 small">Beste Kombi für <strong id="bf-result-metric"></strong> (Koll.: <strong id="bf-result-kollektiv"></strong>):</p>
                         <ul class="list-unstyled mb-1 small">
                            <li><strong>Wert:</strong> <span id="bf-result-value" class="fw-bold"></span></li>
                            <li><strong>Logik:</strong> <span id="bf-result-logic" class="fw-bold"></span></li>
                            <li style="word-break: break-word;"><strong>Kriterien:</strong> <span id="bf-result-criteria" class="fw-bold"></span></li>
                         </ul>
                         <p class="mb-1 small text-muted">Dauer: <span id="bf-result-duration"></span>s | Getestet: <span id="bf-result-total-tested"></span></p>
                         <p class="mb-0 small text-muted" data-tippy-content="${TOOLTIP_CONTENT.bruteForceResult.kollektivStats || 'Statistik des für diese Optimierung verwendeten Kollektivs.'}">Kollektiv N: <span id="bf-result-kollektiv-n">--</span> (N+: <span id="bf-result-kollektiv-nplus">--</span>, N-: <span id="bf-result-kollektiv-nminus">--</span>)</p>
                         <hr class="my-1">
                         <button class="btn btn-success btn-sm me-2" id="btn-apply-best-bf-criteria" data-tippy-content="Wendet die beste gefundene Kriterienkombination an und speichert sie. Die Auswertungstabelle und alle Statistiken werden aktualisiert.">
                             <i class="fas fa-check me-1"></i> Anwenden
                         </button>
                         <button class="btn btn-outline-secondary btn-sm" id="btn-show-brute-force-details" data-bs-toggle="modal" data-bs-target="#brute-force-modal" data-tippy-content="${TOOLTIP_CONTENT.bruteForceDetailsButton.description || 'Zeigt die Top 10 Ergebnisse und weitere Details.'}">
                             <i class="fas fa-list-ol me-1"></i> Top 10
                         </button>
                     </div>
                </div>
            </div>
        </div>
        `;
    }

    function createStatistikCard(id, title, content = '', addPadding = true, tooltipKey = null, downloadButtons = [], tableId = null) {
        let cardTooltipHtml = `data-tippy-content="${title}"`;
        if (tooltipKey && typeof TOOLTIP_CONTENT !== 'undefined' && TOOLTIP_CONTENT[tooltipKey]?.cardTitle) {
            cardTooltipHtml = `data-tippy-content="${(TOOLTIP_CONTENT[tooltipKey].cardTitle || title).replace('[KOLLEKTIV]', '<strong>[KOLLEKTIV_PLACEHOLDER]</strong>')}"`;
        }

        const headerButtonHtml = _createHeaderButtonHTML(downloadButtons, id + '-content', title);
        let finalButtonHtml = headerButtonHtml;

        if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT && tableId && !downloadButtons.some(b => b.tableId === tableId)) {
             const pngExportButton = { id: `dl-card-${id}-${tableId}-png`, icon: 'fa-image', tooltip: `Tabelle '${title}' als PNG herunterladen.`, format: 'png', tableId: tableId, tableName: title };
             finalButtonHtml += _createHeaderButtonHTML([pngExportButton], tableId, title);
        }

        return `
            <div class="col-12 stat-card" id="${id}-card-container">
                <div class="card h-100">
                    <div class="card-header" ${cardTooltipHtml}>
                         ${title}
                         <span class="float-end card-header-buttons">
                            ${finalButtonHtml}
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
        if (typeof APP_CONFIG === 'undefined' || typeof TOOLTIP_CONTENT === 'undefined' || typeof getCurrentDateString !== 'function' || typeof getKollektivDisplayName !== 'function') {
            return '<p class="text-danger">Fehler: Export-Konfigurationen konnten nicht geladen werden.</p>';
        }
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(currentKollektiv).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        const fileNameTemplate = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE;

        const generateButtonHTML = (idSuffix, iconClass, text, tooltipKey, disabled = false, experimental = false) => {
            const config = TOOLTIP_CONTENT.exportTab[tooltipKey]; if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) return ``;
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]; const ext = config.ext; const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeKollektiv).replace('{DATE}', dateStr).replace('{EXT}', ext); const tooltipHtml = `data-tippy-content="${config.description}<br><small>Datei: ${filename}</small>"`; const disabledAttr = disabled ? 'disabled' : ''; const experimentalBadge = experimental ? '<span class="badge bg-warning text-dark ms-1 small">Experimentell</span>' : ''; const buttonClass = disabled ? 'btn-outline-secondary' : 'btn-outline-primary';
            return `<button class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabledAttr}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${text} (.${ext})</span> ${experimentalBadge}</button>`;
        };

         const generateZipButtonHTML = (idSuffix, iconClass, text, tooltipKey, disabled = false) => {
            const config = TOOLTIP_CONTENT.exportTab[tooltipKey]; if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) return ``;
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]; const ext = config.ext; const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeKollektiv).replace('{DATE}', dateStr).replace('{EXT}', ext); const tooltipHtml = `data-tippy-content="${config.description}<br><small>Datei: ${filename}</small>"`; const disabledAttr = disabled ? 'disabled' : ''; const buttonClass = idSuffix === 'all-zip' ? 'btn-primary' : 'btn-outline-secondary';
            return `<button class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabledAttr}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${text} (.${ext})</span></button>`;
         };

        const exportDesc = TOOLTIP_CONTENT.exportTab.description.replace('[KOLLEKTIV]', `<strong>${getKollektivDisplayName(currentKollektiv)}</strong>`);

        return `
            <div class="row export-options-container">
                <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${TOOLTIP_CONTENT.exportTab.singleExports}</div>
                        <div class="card-body">
                            <p class="small text-muted mb-3">${exportDesc}</p>
                            <h6 class="text-muted small text-uppercase mb-2">Berichte & Statistiken</h6>
                            ${generateButtonHTML('statistik-csv', 'fas fa-file-csv', 'Statistik Ergebnisse', 'statsCSV')}
                            ${generateButtonHTML('bruteforce-txt', 'fas fa-file-alt', 'Brute-Force Bericht', 'bruteForceTXT', true)}
                            ${generateButtonHTML('deskriptiv-md', 'fab fa-markdown', 'Deskriptive Statistik', 'deskriptivMD')}
                            ${generateButtonHTML('comprehensive-report-html', 'fas fa-file-invoice', 'Umfassender Bericht', 'comprehensiveReportHTML')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">Tabellen & Rohdaten</h6>
                             ${generateButtonHTML('daten-md', 'fab fa-markdown', 'Datenliste', 'datenMD')}
                             ${generateButtonHTML('auswertung-md', 'fab fa-markdown', 'Auswertungstabelle', 'auswertungMD')}
                             ${generateButtonHTML('filtered-data-csv', 'fas fa-database', 'Gefilterte Rohdaten', 'filteredDataCSV')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">Publikationsentwurf (Methoden & Ergebnisse)</h6>
                             ${generateButtonHTML('publication-md', 'fas fa-file-medical-alt', 'Publikation (MD)', 'publicationMD')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">Diagramme & Tabellen (als Bilder)</h6>
                             ${generateButtonHTML('charts-png', 'fas fa-images', 'Diagramme & Tabellen (PNG)', 'pngZIP')}
                             ${generateButtonHTML('charts-svg', 'fas fa-file-code', 'Diagramme (SVG)', 'svgZIP')}
                        </div>
                    </div>
                </div>
                 <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${TOOLTIP_CONTENT.exportTab.exportPackages}</div>
                        <div class="card-body">
                             <p class="small text-muted mb-3">Bündelt mehrere thematisch zusammengehörige Exportdateien in einem ZIP-Archiv für das Kollektiv <strong>${getKollektivDisplayName(currentKollektiv)}</strong>.</p>
                            ${generateZipButtonHTML('all-zip', 'fas fa-file-archive', 'Gesamtpaket (Alle Dateien)', 'allZIP')}
                            ${generateZipButtonHTML('csv-zip', 'fas fa-file-csv', 'Nur CSVs', 'csvZIP')}
                            ${generateZipButtonHTML('md-zip', 'fab fa-markdown', 'Nur Markdown', 'mdZIP')}
                            ${generateZipButtonHTML('png-zip', 'fas fa-images', 'Nur Diagramm/Tabellen-PNGs', 'pngZIP')}
                            ${generateZipButtonHTML('svg-zip', 'fas fa-file-code', 'Nur Diagramm-SVGs', 'svgZIP')}
                        </div>
                    </div>
                </div>
                <div class="col-lg-12 col-xl-4 mb-3">
                   <div class="card h-100"> <div class="card-header">Hinweise zum Export</div> <div class="card-body small"> <ul class="list-unstyled mb-0"> <li class="mb-2"><i class="fas fa-info-circle fa-fw me-1 text-primary"></i>Alle Exporte basieren auf dem aktuell gewählten Kollektiv und den zuletzt **angewendeten** T2-Kriterien.</li> <li class="mb-2"><i class="fas fa-table fa-fw me-1 text-primary"></i>**CSV:** Für Statistiksoftware; Trennzeichen: Semikolon (;). Zahlen im internationalen Format (Punkt als Dezimaltrenner).</li> <li class="mb-2"><i class="fab fa-markdown fa-fw me-1 text-primary"></i>**MD:** Für Dokumentation und Weiterverarbeitung (z.B. mit Pandoc).</li> <li class="mb-2"><i class="fas fa-file-alt fa-fw me-1 text-primary"></i>**TXT:** Brute-Force-Bericht.</li> <li class="mb-2"><i class="fas fa-file-invoice fa-fw me-1 text-primary"></i>**HTML Bericht:** Umfassend, druckbar.</li> <li class="mb-2"><i class="fas fa-images fa-fw me-1 text-primary"></i>**PNG:** Pixelbasiert (Diagramme/Tabellen).</li> <li class="mb-2"><i class="fas fa-file-code fa-fw me-1 text-primary"></i>**SVG:** Vektorbasiert (Diagramme), skalierbar, ideal für Publikationen.</li> <li class="mb-0"><i class="fas fa-exclamation-triangle fa-fw me-1 text-warning"></i>ZIP-Exporte für Diagramme/Tabellen erfassen nur aktuell im Statistik-, Auswertungs- oder Präsentationstab sichtbare/gerenderte Elemente. Einzel-Downloads sind direkt am Element möglich.</li> </ul> </div> </div>
                </div>
            </div>
        `;
    }

    function createT2MetricsOverview(stats, kollektivName) {
        const getDisplayNameFunc = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName : (k) => k;
        const displayKollektivName = getDisplayNameFunc(kollektivName);
        const cardTooltip = ((typeof TOOLTIP_CONTENT !== 'undefined' && TOOLTIP_CONTENT.t2MetricsOverview?.cardTitle) || 'Kurzübersicht der diagnostischen Güte (T2 vs. N) für Kollektiv [KOLLEKTIV].').replace('[KOLLEKTIV]', `<strong>${displayKollektivName}</strong>`);

        if (!stats || !stats.matrix || stats.matrix.rp === undefined) {
             return `<div class="card bg-light border-secondary" data-tippy-content="${cardTooltip}"><div class="card-header card-header-sm bg-secondary text-white">Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)</div><div class="card-body p-2"><p class="m-0 text-muted small">Metriken für T2 nicht verfügbar für Kollektiv ${displayKollektivName}.</p></div></div>`;
        }
        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc', 'lr_pos', 'lr_neg', 'youden'];
        const metricDisplayNames = { sens: 'Sens', spez: 'Spez', ppv: 'PPV', npv: 'NPV', acc: 'Acc', balAcc: 'BalAcc', f1: 'F1', auc: 'AUC', lr_pos: 'LR+', lr_neg: 'LR-', youden: 'Youden J' };
        const na = '--';

        let contentHTML = '<div class="d-flex flex-wrap justify-content-around small text-center">';
        const statMetricTooltips = (typeof TOOLTIP_CONTENT !== 'undefined' && TOOLTIP_CONTENT.statMetrics) || {};

        metrics.forEach((key, index) => {
            const metricData = stats[key];
            const metricDescription = ( (typeof TOOLTIP_CONTENT !== 'undefined' && TOOLTIP_CONTENT.t2MetricsOverview?.[key]) || statMetricTooltips[key]?.description || key).replace(/\[METHODE\]/g, '<strong>T2 (angewandt)</strong>');
            const interpretationHTML = (typeof ui_helpers !== 'undefined' && typeof ui_helpers.getMetricInterpretationHTML === 'function') ? ui_helpers.getMetricInterpretationHTML(key, metricData, 'T2 (angewandt)', displayKollektivName) : 'Keine Interpretation verfügbar.';
            let digits = (key === 'f1' || key === 'auc' || key === 'youden') ? ((typeof APP_CONFIG !== 'undefined' && APP_CONFIG.STATISTICAL_CONSTANTS?.METRIC_RATE_DECIMALS) || 3) : ((typeof APP_CONFIG !== 'undefined' && APP_CONFIG.STATISTICAL_CONSTANTS?.METRIC_PERCENT_DECIMALS) || 1);
            if (key === 'lr_pos' || key === 'lr_neg') digits = 2;
            const isPercent = ['sens', 'spez', 'ppv', 'npv', 'acc'].includes(key);

            const formattedValue = typeof formatCI === 'function' ? formatCI(metricData?.value, metricData?.ci?.lower, metricData?.ci?.upper, digits, isPercent, na) : na;

            contentHTML += `
                <div class="p-1 flex-fill bd-highlight ${index > 0 ? 'border-start' : ''}">
                    <strong data-tippy-content="${metricDescription}">${metricDisplayNames[key] || key.toUpperCase()}:</strong>
                    <span data-tippy-content="${interpretationHTML}"> ${formattedValue}</span>
                </div>`;
        });

        contentHTML += '</div>';

        return `<div class="card bg-light border-secondary" data-tippy-content="${cardTooltip}"><div class="card-header card-header-sm bg-secondary text-white">Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)</div><div class="card-body p-2">${contentHTML}</div></div>`;
    }

    function createBruteForceModalContent(resultsData) {
        if (!resultsData || !resultsData.results || resultsData.results.length === 0) return '<p class="text-muted">Keine Ergebnisse gefunden.</p>';

        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'Formatierungsfehler';
        const getKollektivNameFunc = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName : (k) => k;
        const { results, metric, kollektiv, duration, totalTested, nGesamt, nPlus, nMinus } = resultsData;
        const bestResult = results[0];
        const kollektivName = getKollektivNameFunc(kollektiv);
        const metricDisplayName = metric === 'PPV' ? 'PPV' : metric === 'NPV' ? 'NPV' : metric;
        const resultContainerTooltip = ((typeof TOOLTIP_CONTENT !== 'undefined' && TOOLTIP_CONTENT.bruteForceResult?.description) || 'Ergebnis der Optimierung.')
                                      .replace('[N_GESAMT]', typeof formatNumber === 'function' ? formatNumber(nGesamt,0,'?') : '?')
                                      .replace('[N_PLUS]', typeof formatNumber === 'function' ? formatNumber(nPlus,0,'?') : '?')
                                      .replace('[N_MINUS]', typeof formatNumber === 'function' ? formatNumber(nMinus,0,'?') : '?');
        const kollektivStatsTooltip = (typeof TOOLTIP_CONTENT !== 'undefined' && TOOLTIP_CONTENT.bruteForceResult?.kollektivStats) || 'Statistik des für diese Optimierung verwendeten Kollektivs.';


        let tableHTML = `
            <div class="alert alert-light small p-2 mb-3" data-tippy-content="${resultContainerTooltip}">
                <p class="mb-1"><strong>Beste Kombi für '${metricDisplayName}' (Koll.: '${kollektivName}'):</strong></p>
                <ul class="list-unstyled mb-1">
                    <li><strong>Wert:</strong> ${typeof formatNumber === 'function' ? formatNumber(bestResult.metricValue, 4) : bestResult.metricValue}</li>
                    <li><strong>Logik:</strong> ${bestResult.logic.toUpperCase()}</li>
                    <li><strong>Kriterien:</strong> ${formatCriteriaFunc(bestResult.criteria, bestResult.logic)}</li>
                </ul>
                <p class="mb-1 text-muted"><small>Dauer: ${typeof formatNumber === 'function' ? formatNumber((duration || 0) / 1000, 1) : (duration/1000)}s | Getestet: ${typeof formatNumber === 'function' ? formatNumber(totalTested, 0) : totalTested}</small></p>
                <p class="mb-0 text-muted" data-tippy-content="${kollektivStatsTooltip}"><small>Kollektiv N=${typeof formatNumber === 'function' ? formatNumber(nGesamt,0,'N/A') : 'N/A'} (N+: ${typeof formatNumber === 'function' ? formatNumber(nPlus,0,'N/A') : 'N/A'}, N-: ${typeof formatNumber === 'function' ? formatNumber(nMinus,0,'N/A') : 'N/A'})</small></p>
            </div>
            <h6 class="mb-2">Top Ergebnisse (inkl. identischer Werte):</h6>
            <div class="table-responsive">
                <table class="table table-sm table-striped table-hover small" id="bruteforce-results-table">
                    <thead class="small">
                        <tr>
                            <th data-tippy-content="Rang des Ergebnisses.">Rang</th>
                            <th data-tippy-content="Erreichter Wert der Zielmetrik (${metricDisplayName}). Höher ist besser.">${metricDisplayName}</th>
                            <th data-tippy-content="Sensitivität dieser Kriterienkombination.">Sens.</th>
                            <th data-tippy-content="Spezifität dieser Kriterienkombination.">Spez.</th>
                            <th data-tippy-content="Positiver Prädiktiver Wert dieser Kriterienkombination.">PPV</th>
                            <th data-tippy-content="Negativer Prädiktiver Wert dieser Kriterienkombination.">NPV</th>
                            <th data-tippy-content="Verwendete logische Verknüpfung (UND/ODER).">Logik</th>
                            <th data-tippy-content="Kombination der T2-Malignitätskriterien.">Kriterien</th>
                        </tr>
                    </thead>
                    <tbody>`;

        let rank = 1, displayedCount = 0, lastMetricValue = -Infinity;
        const precision = 8;

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (!result || typeof result.metricValue !== 'number' || !isFinite(result.metricValue)) continue;

            const currentMetricValueRounded = parseFloat(result.metricValue.toFixed(precision));
            const lastMetricValueRounded = parseFloat(lastMetricValue.toFixed(precision));
            let currentRank = rank;

            const isNewRank = Math.abs(currentMetricValueRounded - lastMetricValueRounded) > 1e-8;

            if (i > 0 && isNewRank) {
                rank = displayedCount + 1;
                currentRank = rank;
            } else if (i > 0) {
                currentRank = rank;
            }

            if (rank > 10 && isNewRank && i >=10 ) break;

            tableHTML += `
                <tr>
                    <td>${currentRank}.</td>
                    <td>${typeof formatNumber === 'function' ? formatNumber(result.metricValue, 4) : result.metricValue}</td>
                    <td>${result.sens !== undefined && typeof formatPercent === 'function' ? formatPercent(result.sens, 1) : 'N/A'}</td>
                    <td>${result.spez !== undefined && typeof formatPercent === 'function' ? formatPercent(result.spez, 1) : 'N/A'}</td>
                    <td>${result.ppv !== undefined && typeof formatPercent === 'function' ? formatPercent(result.ppv, 1) : 'N/A'}</td>
                    <td>${result.npv !== undefined && typeof formatPercent === 'function' ? formatPercent(result.npv, 1) : 'N/A'}</td>
                    <td>${result.logic.toUpperCase()}</td>
                    <td>${formatCriteriaFunc(result.criteria, result.logic)}</td>
                </tr>`;

            if (isNewRank || i === 0) {
                lastMetricValue = result.metricValue;
            }
            displayedCount++;
        }
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function createPublikationTabHeader() {
        if (typeof state === 'undefined' || typeof PUBLICATION_CONFIG === 'undefined' || typeof UI_TEXTS === 'undefined' || typeof TOOLTIP_CONTENT === 'undefined') {
            return '<p class="text-danger">Fehler: Publikations-Header Konfigurationen konnten nicht geladen werden.</p>';
        }
        const lang = state.getCurrentPublikationLang() || PUBLICATION_CONFIG.defaultLanguage;
        const currentBfMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const sectionNavItems = PUBLICATION_CONFIG.sections.map(mainSection => {
            const sectionTooltip = TOOLTIP_CONTENT.publikationTabTooltips[mainSection.id]?.description || UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey;
            let subSectionLinks = '';
            if(mainSection.subSections && mainSection.subSections.length > 0){
                subSectionLinks = '<ul class="nav flex-column ps-3 nav-pills-nested">';
                mainSection.subSections.forEach(subSect => {
                     const subSectionTooltip = (TOOLTIP_CONTENT.publikationTabTooltips[mainSection.id] && TOOLTIP_CONTENT.publikationTabTooltips[mainSection.id][subSect.id]) || subSect.label;
                     subSectionLinks += `
                        <li class="nav-item">
                            <a class="nav-link py-1 publikation-section-link" href="#" data-section-id="${subSect.id}" data-tippy-content="${subSectionTooltip}">
                                ${subSect.label}
                            </a>
                        </li>`;
                });
                subSectionLinks += '</ul>';
            }

            return `
                <li class="nav-item">
                    <a class="nav-link py-2 publikation-main-section-link disabled" href="#" data-main-section-id="${mainSection.id}" data-tippy-content="${sectionTooltip}">
                        ${UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey}
                    </a>
                    ${subSectionLinks}
                </li>`;
        }).join('');

        const bfMetricOptions = PUBLICATION_CONFIG.bruteForceMetricsForPublication.map(opt =>
            `<option value="${opt.value}" ${opt.value === currentBfMetric ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        return `
            <div class="row mb-3 sticky-top bg-light py-2 shadow-sm" style="top: var(--sticky-header-offset); z-index: 1015;">
                <div class="col-md-3">
                    <h5 class="mb-2">${UI_TEXTS.publikationTab.sectionLabels.methoden} & ${UI_TEXTS.publikationTab.sectionLabels.ergebnisse}</h5>
                    <nav id="publikation-sections-nav" class="nav flex-column nav-pills" data-tippy-content="${TOOLTIP_CONTENT.publikationTabTooltips.sectionSelect?.description || 'Wählen Sie einen Publikationsabschnitt.'}">
                        ${sectionNavItems}
                    </nav>
                     <hr class="my-3">
                     <h5 class="mb-2">${UI_TEXTS.publikationTab.sectionLabels.referenzen}</h5>
                     <nav class="nav flex-column nav-pills">
                        <li class="nav-item">
                             <a class="nav-link py-1 publikation-section-link" href="#" data-section-id="referenzen_liste" data-tippy-content="Zeigt die automatisch generierte Referenzliste.">
                                Literaturverzeichnis
                            </a>
                        </li>
                     </nav>
                </div>
                <div class="col-md-9">
                    <div class="d-flex justify-content-end align-items-center mb-2">
                        <div class="me-3">
                           <label for="publikation-bf-metric-select" class="form-label form-label-sm mb-0 me-1">${UI_TEXTS.publikationTab.bruteForceMetricSelectLabel}</label>
                           <select class="form-select form-select-sm d-inline-block" id="publikation-bf-metric-select" style="width: auto;" data-tippy-content="${TOOLTIP_CONTENT.publikationTabTooltips.bruteForceMetricSelect.description}">
                               ${bfMetricOptions}
                           </select>
                        </div>
                        <div class="form-check form-switch" data-tippy-content="${TOOLTIP_CONTENT.publikationTabTooltips.spracheSwitch.description}">
                            <input class="form-check-input" type="checkbox" role="switch" id="publikation-sprache-switch" ${lang === 'en' ? 'checked' : ''}>
                            <label class="form-check-label fw-bold" for="publikation-sprache-switch" id="publikation-sprache-label">${UI_TEXTS.publikationTab.spracheSwitchLabel[lang]}</label>
                        </div>
                    </div>
                    <div id="publikation-content-area" class="bg-white p-3 border rounded" style="min-height: 400px; max-height: calc(100vh - var(--sticky-header-offset) - 4rem - 2rem); overflow-y: auto;">
                        <p class="text-muted">Bitte wählen Sie einen Abschnitt aus der Navigation.</p>
                    </div>
                </div>
            </div>`;
    }

    return Object.freeze({
        createDashboardCard,
        createT2CriteriaControls,
        createBruteForceCard,
        createStatistikCard,
        createExportOptions,
        createT2MetricsOverview,
        createBruteForceModalContent,
        createPublikationTabHeader
    });

})();
