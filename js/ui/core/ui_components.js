const uiComponents = (() => {

    function _createHeaderButtonHTML(buttons, targetId, defaultTitle = 'Element') {
        let headerButtonHtml = '';
        if (buttons && buttons.length > 0 && targetId) {
            headerButtonHtml = buttons.map(btn => {
                const btnId = btn.id || `dl-${targetId.replace(/[^a-zA-Z0-9_-]/g, '')}-${btn.format || 'action'}`;
                const iconClass = btn.icon || 'fa-download';
                let tooltip = btn.tooltip || `Als ${String(btn.format || 'Aktion').toUpperCase()} herunterladen`;
                const placement = btn.placement || 'top';

                const safeDefaultTitle = String(defaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);
                const chartNameForTooltip = String(btn.chartName || safeDefaultTitle);
                const tableNameForTooltip = String(btn.tableName || safeDefaultTitle);

                if (btn.format === 'png' && btn.chartId && TOOLTIP_CONTENT.exportTab.chartSinglePNG?.description) {
                    tooltip = TOOLTIP_CONTENT.exportTab.chartSinglePNG.description.replace('{ChartName}', `<strong>${chartNameForTooltip}</strong>`);
                } else if (btn.format === 'svg' && btn.chartId && TOOLTIP_CONTENT.exportTab.chartSingleSVG?.description) {
                    tooltip = TOOLTIP_CONTENT.exportTab.chartSingleSVG.description.replace('{ChartName}', `<strong>${chartNameForTooltip}</strong>`);
                } else if (btn.format === 'png' && btn.tableId && TOOLTIP_CONTENT.exportTab.tableSinglePNG?.description) {
                    tooltip = TOOLTIP_CONTENT.exportTab.tableSinglePNG.description.replace('{TableName}', `<strong>${tableNameForTooltip}</strong>`);
                }

                const dataAttributes = [];
                if (btn.chartId) dataAttributes.push(`data-chart-id="${btn.chartId}"`);
                if (btn.tableId) dataAttributes.push(`data-table-id="${btn.tableId}"`);
                
                const safeChartNameForFilename = String(btn.chartName || '').replace(/[^a-zA-Z0-9_-]/gi, '_').substring(0, 50);
                const safeTableNameForFilename = String(btn.tableName || '').replace(/[^a-zA-Z0-9_-]/gi, '_').substring(0, 50);
                const safeDefaultNameForFilename = safeDefaultTitle.replace(/\s/g, '_');

                if (btn.tableName) dataAttributes.push(`data-table-name="${safeTableNameForFilename}"`);
                else if (btn.chartName) dataAttributes.push(`data-chart-name="${safeChartNameForFilename}"`);
                else dataAttributes.push(`data-default-name="${safeDefaultNameForFilename}"`);

                if (btn.format) dataAttributes.push(`data-format="${btn.format}"`);

                return `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 ${btn.tableId ? 'table-download-png-btn' : (btn.chartId ? 'chart-download-btn' : '')}" id="${btnId}" ${dataAttributes.join(' ')} data-bs-toggle="tooltip" data-bs-placement="${placement}" data-bs-html="true" data-bs-title="${tooltip}"><i class="fas ${iconClass}"></i></button>`;
            }).join('');
        }
        return headerButtonHtml;
    }

    function createDashboardCard(title, content, chartId = null, cardClasses = '', headerClasses = '', bodyClasses = '', downloadButtons = []) {
        const headerButtonHtml = _createHeaderButtonHTML(downloadButtons, chartId || title.replace(/[^a-z0-9]/gi, '_'), title);
        const tooltipKey = chartId ? chartId.replace(/^chart-dash-/, '') : title.toLowerCase().replace(/\s+/g, '');
        let tooltipContent = TOOLTIP_CONTENT.deskriptiveStatistik[tooltipKey]?.description || title || '';
        
        if(tooltipKey === 'ageDistribution' || tooltipKey === 'alter') {
            tooltipContent = TOOLTIP_CONTENT.deskriptiveStatistik.chartAge?.description || title;
        } else if(tooltipKey === 'genderDistribution' || tooltipKey === 'geschlecht') {
            tooltipContent = TOOLTIP_CONTENT.deskriptiveStatistik.chartGender?.description || title;
        } else if (tooltipKey === 'statusN') {
            tooltipContent = TOOLTIP_CONTENT.deskriptiveStatistik.nStatus?.description || title;
        } else if (tooltipKey === 'statusAS') {
            tooltipContent = TOOLTIP_CONTENT.deskriptiveStatistik.asStatus?.description || title;
        } else if (tooltipKey === 'statusT2') {
            tooltipContent = TOOLTIP_CONTENT.deskriptiveStatistik.t2Status?.description || title;
        }

        const currentKollektivName = stateManager.getCurrentKollektiv() ? getKollektivDisplayName(stateManager.getCurrentKollektiv()) : 'dem aktuellen Kollektiv';
        const finalTooltipContent = tooltipContent.replace('[KOLLEKTIV]', `<strong>${currentKollektivName}</strong>`);

        return `
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 dashboard-card-col ${cardClasses}">
                <div class="card h-100 dashboard-card">
                    <div class="card-header ${headerClasses} d-flex justify-content-between align-items-center" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${finalTooltipContent}">
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
        if (!initialCriteria || !initialLogic) return '<p class="text-danger">Fehler: Initialkriterien konnten nicht geladen werden.</p>';
        const logicChecked = initialLogic === 'ODER';
        const defaultCriteriaForSize = getDefaultT2Criteria();
        const sizeThreshold = initialCriteria.size?.threshold ?? defaultCriteriaForSize?.size?.threshold ?? 5.0;
        const sizeMin = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min;
        const sizeMax = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max;
        const sizeStep = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step;
        const formattedThreshold = formatNumber(sizeThreshold, 1, '5.0', true);
        const lang = stateManager.getCurrentPublikationLang();

        const createButtonOptions = (key, isChecked, criterionLabel) => {
            const valuesKey = key.toUpperCase() + '_VALUES';
            const values = APP_CONFIG.T2_CRITERIA_SETTINGS[valuesKey] || [];
            const currentValue = initialCriteria[key]?.value;
            return values.map(value => {
                const isActiveValue = isChecked && currentValue === value;
                const icon = ui_helpers.getT2IconSVG(key, value);
                const buttonTooltip = (TOOLTIP_CONTENT[`t2${key.charAt(0).toUpperCase() + key.slice(1)}`]?.optionTooltips?.[value] || `Kriterium '${criterionLabel}' auf '${value}' setzen.`) + ` ${isChecked ? '' : (lang === 'de' ? '(Kriterium ist derzeit inaktiv)' : '(Criterion is currently inactive)')}`;
                return `<button class="btn t2-criteria-button criteria-icon-button ${isActiveValue ? 'active' : ''} ${isChecked ? '' : 'inactive-option'}" data-criterion="${key}" data-value="${value}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${buttonTooltip}" ${isChecked ? '' : 'disabled'}>${icon}</button>`;
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
                         <span data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltip}"> <i class="fas fa-info-circle text-muted ms-1"></i></span>
                    </div>
                    <div class="criteria-options-container ps-3">
                        ${contentGenerator(key, isChecked, label)}
                    </div>
                </div>`;
        };
        
        const appliedCriteriaDisplayId = 'applied-t2-criteria-display-text'; 
        const criteriaManager = typeof t2CriteriaManager !== 'undefined' ? t2CriteriaManager : null;
        const appliedCriteriaText = criteriaManager ? studyT2CriteriaManager.formatCriteriaForDisplay(criteriaManager.getAppliedCriteria(), criteriaManager.getAppliedLogic(), false) : 'N/A';
        const appliedCriteriaTooltip = (TOOLTIP_CONTENT.t2CriteriaCard?.appliedDisplay || 'Aktuell auf den Datensatz angewendete und gespeicherte T2-Kriterien und Logik. Diese Einstellungen beeinflussen alle Tabellen und Statistiken.');
        const cardTooltip = TOOLTIP_CONTENT.t2CriteriaCard?.description || "Definition der T2-Malignitätskriterien für Lymphknoten.";


        return `
            <div class="card criteria-card" id="t2-criteria-card" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${cardTooltip}" data-original-title="${cardTooltip}">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>T2 Malignitäts-Kriterien Definieren</span>
                    <div class="form-check form-switch" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.t2Logic.description}">
                         <label class="form-check-label small me-2" for="t2-logic-switch" id="t2-logic-label-prefix">Logik:</label>
                         <input class="form-check-input" type="checkbox" role="switch" id="t2-logic-switch" ${logicChecked ? 'checked' : ''}>
                         <label class="form-check-label fw-bold" for="t2-logic-switch" id="t2-logic-label">${UI_TEXTS.t2LogicDisplayNames[initialLogic] || initialLogic}</label>
                     </div>
                </div>
                <div class="card-body">
                     <div class="row g-4">
                        ${createCriteriaGroup('size', 'Größe', 't2Size', (key, isChecked) => `
                            <div class="d-flex align-items-center flex-wrap">
                                 <span class="me-1 small text-muted">≥</span>
                                 <input type="range" class="form-range criteria-range flex-grow-1 me-2" id="range-size" min="${sizeMin}" max="${sizeMax}" step="${sizeStep}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.t2Size.rangeSlider || 'Schwellenwert für Kurzachsendurchmesser (≥) einstellen.'}">
                                 <span class="criteria-value-display text-end me-1 fw-bold" id="value-size">${formatNumber(sizeThreshold, 1)}</span><span class="me-2 small text-muted">mm</span>
                                 <input type="number" class="form-control form-control-sm criteria-input-manual" id="input-size" min="${sizeMin}" max="${sizeMax}" step="${sizeStep}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} style="width: 70px;" aria-label="Größe manuell eingeben" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.t2Size.manualInput || 'Schwellenwert manuell eingeben oder anpassen.'}">
                            </div>
                        `)}
                        ${createCriteriaGroup('form', 'Form', 't2Form', createButtonOptions)}
                        ${createCriteriaGroup('kontur', 'Kontur', 't2Kontur', createButtonOptions)}
                        ${createCriteriaGroup('homogenitaet', 'Homogenität', 't2Homogenitaet', createButtonOptions)}
                        ${createCriteriaGroup('signal', 'Signal', 't2Signal', (key, isChecked, label) => `
                            <div>${createButtonOptions(key, isChecked, label)}</div>
                            <small class="text-muted d-block mt-1" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.t2Signal.note || 'Hinweis: Lymphknoten mit Signal \'null\' (d.h. nicht beurteilbar/nicht vorhanden) erfüllen das Signal-Kriterium nie.'}">${TOOLTIP_CONTENT.t2Signal.note || 'Hinweis: Lymphknoten mit Signal \'null\' (d.h. nicht beurteilbar/nicht vorhanden) erfüllen das Signal-Kriterium nie.'}</small>
                        `)}
                        <div class="col-12 border-top pt-3 mt-3">
                            <div class="d-flex justify-content-end align-items-center mb-2">
                                <button class="btn btn-sm btn-outline-secondary me-2" id="btn-reset-criteria" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.t2Actions.reset}">
                                    <i class="fas fa-undo me-1"></i> Zurücksetzen (Standard)
                                </button>
                                <button class="btn btn-sm btn-primary" id="btn-apply-criteria" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.t2Actions.apply}">
                                    <i class="fas fa-check me-1"></i> Anwenden & Speichern
                                </button>
                            </div>
                             <div class="mt-2 p-2 bg-light border rounded small" id="applied-t2-criteria-display" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${appliedCriteriaTooltip}">
                                <span class="fw-bold">${lang === 'de' ? 'Angewandte Kriterien:' : 'Applied Criteria:'}</span>
                                <span id="${appliedCriteriaDisplayId}">${appliedCriteriaText}</span>
                            </div>
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
        const displayKollektivName = getKollektivDisplayName(currentKollektivName);
        const resultContainerTooltip = (TOOLTIP_CONTENT.bruteForceResult.description || 'Ergebnis der Optimierung.')
                                      .replace('[N_GESAMT]', '--')
                                      .replace('[N_PLUS]', '--')
                                      .replace('[N_MINUS]', '--');

        return `
        <div class="col-12">
            <div class="card">
                <div class="card-header" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.bruteForceCard?.description || 'Kriterien-Optimierung (Brute-Force)'}">Kriterien-Optimierung (Brute-Force)</div>
                <div class="card-body">
                    <p class="card-text small">${TOOLTIP_CONTENT.bruteForceCard?.description || 'Findet automatisch die Kombination von T2-Kriterien und Logik, die eine gewählte diagnostische Metrik maximiert.'}</p>
                    <div class="row g-3 align-items-end mb-3">
                        <div class="col-md-4">
                            <label for="brute-force-metric" class="form-label form-label-sm">Zielmetrik:</label>
                            <select class="form-select form-select-sm" id="brute-force-metric" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.bruteForceMetric.description}">
                                <option value="Accuracy" ${defaultMetric === 'Accuracy' ? 'selected' : ''}>Accuracy</option>
                                <option value="Balanced Accuracy" ${defaultMetric === 'Balanced Accuracy' ? 'selected' : ''}>Balanced Accuracy</option>
                                <option value="F1-Score" ${defaultMetric === 'F1-Score' ? 'selected' : ''}>F1-Score</option>
                                <option value="PPV" ${defaultMetric === 'PPV' ? 'selected' : ''}>Positiver Prädiktiver Wert (PPV)</option>
                                <option value="NPV" ${defaultMetric === 'NPV' ? 'selected' : ''}>Negativer Prädiktiver Wert (NPV)</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                             <button class="btn btn-primary btn-sm w-100" id="btn-start-brute-force" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.bruteForceStart.description}" ${disabledAttribute}>
                                 ${startButtonText}
                             </button>
                        </div>
                         <div class="col-md-4">
                             <div id="brute-force-info" class="text-muted small text-md-end" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.bruteForceInfo.description || 'Status des Optimierungs-Workers und aktuelles Kollektiv.').replace('[KOLLEKTIV_NAME]', `<strong>${displayKollektivName}</strong>`)}">
                                 Status: <span id="bf-status-text" class="fw-bold">${statusText}</span><br>Kollektiv: <strong id="bf-kollektiv-info">${displayKollektivName}</strong>
                             </div>
                         </div>
                    </div>
                     <div id="brute-force-progress-container" class="mt-3 d-none" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.bruteForceProgress.description || 'Fortschritt der laufenden Optimierung.').replace('[TOTAL]', '0')}">
                         <div class="d-flex justify-content-between mb-1 small">
                            <span>Fortschritt: <span id="bf-tested-count">0</span> / <span id="bf-total-count">0</span></span>
                            <span id="bf-progress-percent">0%</span>
                         </div>
                         <div class="progress" style="height: 8px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" id="bf-progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                         </div>
                         <div class="mt-2 small">
                            Beste <span id="bf-metric-label" class="fw-bold">Metrik</span> bisher: <span id="bf-best-metric" class="fw-bold" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.bruteForceProgress.bestMetricValue || 'Bester bisher gefundener Wert für die Zielmetrik.'}">--</span>
                            <div id="bf-best-criteria" class="mt-1 text-muted" style="word-break: break-word;" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.bruteForceProgress.bestCriteria || 'Kriterienkombination und Logik für den besten bisherigen Metrikwert.'}">Beste Kriterien: --</div>
                         </div>
                          <button class="btn btn-danger btn-sm mt-2 d-none" id="btn-cancel-brute-force" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.bruteForceCancel.description || 'Bricht die laufende Brute-Force-Optimierung ab.'}">
                            <i class="fas fa-times me-1"></i> Abbrechen
                         </button>
                     </div>
                     <div id="brute-force-result-container" class="mt-3 d-none alert alert-success p-2" role="alert" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${resultContainerTooltip}">
                         <h6 class="alert-heading small">Optimierung Abgeschlossen</h6>
                         <p class="mb-1 small">Beste Kombi für <strong id="bf-result-metric"></strong> (Koll.: <strong id="bf-result-kollektiv"></strong>):</p>
                         <ul class="list-unstyled mb-1 small">
                            <li><strong>Wert:</strong> <span id="bf-result-value" class="fw-bold"></span></li>
                            <li><strong>Logik:</strong> <span id="bf-result-logic" class="fw-bold"></span></li>
                            <li style="word-break: break-word;"><strong>Kriterien:</strong> <span id="bf-result-criteria" class="fw-bold"></span></li>
                         </ul>
                         <p class="mb-1 small text-muted">Dauer: <span id="bf-result-duration"></span>s | Getestet: <span id="bf-result-total-tested"></span></p>
                         <p class="mb-0 small text-muted" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.bruteForceResult.kollektivStats || 'Statistik des für diese Optimierung verwendeten Kollektivs.'}">Kollektiv N: <span id="bf-result-kollektiv-n">--</span> (N+: <span id="bf-result-kollektiv-nplus">--</span>, N-: <span id="bf-result-kollektiv-nminus">--</span>)</p>
                         <hr class="my-1">
                         <button class="btn btn-success btn-sm me-2" id="btn-apply-best-bf-criteria" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.bruteForceApply.description || 'Wendet die beste gefundene Kriterienkombination an und speichert sie.'}">
                             <i class="fas fa-check me-1"></i> Anwenden
                         </button>
                         <button class="btn btn-outline-secondary btn-sm" id="btn-show-brute-force-details" data-bs-toggle="modal" data-bs-target="#brute-force-modal" data-bs-title="${TOOLTIP_CONTENT.bruteForceDetailsButton.description || 'Zeigt die Top 10 Ergebnisse und weitere Details.'}">
                             <i class="fas fa-list-ol me-1"></i> Top Ergebnisse
                         </button>
                     </div>
                </div>
            </div>
        </div>
        `;
    }

    function createStatistikCard(id, title, content = '', addPadding = true, tooltipKey = null, downloadButtons = [], tableId = null) {
        let cardTooltipText = title;
        if (tooltipKey && TOOLTIP_CONTENT[tooltipKey]?.cardTitle) {
            const currentKollektivName = stateManager.getCurrentKollektiv() ? getKollektivDisplayName(stateManager.getCurrentKollektiv()) : '[KOLLEKTIV_PLACEHOLDER]';
            cardTooltipText = TOOLTIP_CONTENT[tooltipKey].cardTitle.replace('[KOLLEKTIV]', `<strong>${currentKollektivName}</strong>`);
        }
        const cardTooltipHtml = `data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${cardTooltipText}"`;

        const headerButtonHtml = _createHeaderButtonHTML(downloadButtons, id + '-content', title);

        let finalButtonHtml = headerButtonHtml;
        if (APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT && tableId && !downloadButtons.some(b => b.tableId === tableId)) {
             const pngExportButton = { id: `dl-card-${id}-${tableId}-png`, icon: 'fa-image', tooltip: (TOOLTIP_CONTENT.exportTab.tableSinglePNG?.description || 'Tabelle als PNG').replace('{TableName}', `<strong>${title}</strong>`), format: 'png', tableId: tableId, tableName: title };
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
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(currentKollektiv).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        const fileNameTemplate = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE;
        const lang = stateManager.getCurrentPublikationLang();

        const generateButtonHTML = (idSuffix, iconClass, text, tooltipKey, disabled = false, experimental = false) => {
            const config = TOOLTIP_CONTENT.exportTab[tooltipKey]; 
            if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) {
                 console.warn(`Export config for ${tooltipKey} or FILENAME_TYPES.${config.type} not found.`);
                 return ``;
            }
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]; const ext = config.ext;
            const filenameOptions = { sectionName: idSuffix.includes('publikation') ? idSuffix.split('-').pop() : undefined };
            const filename = exportService.generateFilename(type, currentKollektiv, ext, filenameOptions);
            const tooltipHtml = `data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${config.description}<br><small>Datei: ${filename}</small>"`;
            const disabledAttr = disabled ? 'disabled' : '';
            const experimentalBadge = experimental ? '<span class="badge bg-warning text-dark ms-1 small">Experimentell</span>' : '';
            const buttonClass = disabled ? 'btn-outline-secondary' : 'btn-outline-primary';
            return `<button class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabledAttr}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${text} (.${ext})</span> ${experimentalBadge}</button>`;
        };

         const generateZipButtonHTML = (idSuffix, iconClass, text, tooltipKey, disabled = false) => {
            const config = TOOLTIP_CONTENT.exportTab[tooltipKey]; 
            if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) {
                console.warn(`Export config for ${tooltipKey} or FILENAME_TYPES.${config.type} not found.`);
                return ``;
            }
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]; const ext = config.ext;
            const filename = exportService.generateFilename(type, currentKollektiv, ext);
            const tooltipHtml = `data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${config.description}<br><small>Datei: ${filename}</small>"`;
            const disabledAttr = disabled ? 'disabled' : '';
            const buttonClass = idSuffix === 'all-zip' ? 'btn-primary' : 'btn-outline-secondary';
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
                            ${generateZipButtonHTML('md-zip', 'fab fa-markdown', 'Nur Markdown (inkl. Publikationstexte)', 'mdZIP')}
                            ${generateZipButtonHTML('png-zip', 'fas fa-images', 'Nur Diagramm/Tabellen-PNGs', 'pngZIP')}
                            ${generateZipButtonHTML('svg-zip', 'fas fa-file-code', 'Nur Diagramm-SVGs', 'svgZIP')}
                        </div>
                    </div>
                </div>
                <div class="col-lg-12 col-xl-4 mb-3">
                   <div class="card h-100"> <div class="card-header">Hinweise zum Export</div> <div class="card-body small"> <ul class="list-unstyled mb-0"> <li class="mb-2"><i class="fas fa-info-circle fa-fw me-1 text-primary"></i>Alle Exporte basieren auf dem aktuell gewählten Kollektiv und den zuletzt **angewendeten** T2-Kriterien.</li> <li class="mb-2"><i class="fas fa-table fa-fw me-1 text-primary"></i>**CSV:** Für Statistiksoftware; Trennzeichen: Semikolon (;). Enthält numerische p-Werte.</li> <li class="mb-2"><i class="fab fa-markdown fa-fw me-1 text-primary"></i>**MD:** Für Dokumentation. Der MD-ZIP Export enthält auch die generierten Texte des Publikation-Tabs.</li> <li class="mb-2"><i class="fas fa-file-alt fa-fw me-1 text-primary"></i>**TXT:** Brute-Force-Bericht.</li> <li class="mb-2"><i class="fas fa-file-invoice fa-fw me-1 text-primary"></i>**HTML Bericht:** Umfassend, druckbar.</li> <li class="mb-2"><i class="fas fa-images fa-fw me-1 text-primary"></i>**PNG:** Pixelbasiert (Diagramme/Tabellen).</li> <li class="mb-2"><i class="fas fa-file-code fa-fw me-1 text-primary"></i>**SVG:** Vektorbasiert (Diagramme), skalierbar.</li> <li class="mb-0"><i class="fas fa-exclamation-triangle fa-fw me-1 text-warning"></i>ZIP-Exporte für Diagramme/Tabellen erfassen nur aktuell im Statistik-, Auswertungs- oder Publikationstab sichtbare/gerenderte Elemente. Einzel-Downloads sind direkt an den Elementen in allen Tabs möglich.</li> </ul> </div> </div>
                </div>
            </div>
        `;
    }

    function createT2MetricsOverview(stats, kollektivName) {
        const displayKollektivName = getKollektivDisplayName(kollektivName);
        const cardTooltipText = (TOOLTIP_CONTENT.t2MetricsOverview.cardTitle || 'Kurzübersicht der diagnostischen Güte (T2 vs. N) für Kollektiv [KOLLEKTIV].').replace('[KOLLEKTIV]', `<strong>${displayKollektivName}</strong>`);
        if (!stats || !stats.matrix || stats.matrix.rp === undefined) {
             return `<div class="card bg-light border-secondary" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${cardTooltipText}"><div class="card-header card-header-sm bg-secondary text-white">Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)</div><div class="card-body p-2"><p class="m-0 text-muted small">Metriken für T2 nicht verfügbar für Kollektiv ${displayKollektivName}.</p></div></div>`;
        }
        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
        const metricDisplayNames = { sens: 'Sens', spez: 'Spez', ppv: 'PPV', npv: 'NPV', acc: 'Acc', balAcc: 'BalAcc', f1: 'F1', auc: 'AUC' };
        const na = '--';
        const currentLang = stateManager.getCurrentPublikationLang();

        let contentHTML = '<div class="d-flex flex-wrap justify-content-around small text-center">';

        metrics.forEach((key, index) => {
            const metricData = stats[key];
            const metricDescription = (TOOLTIP_CONTENT.t2MetricsOverview?.[key] || TOOLTIP_CONTENT.statMetrics[key]?.description || key).replace(/\[METHODE\]/g, '<strong>T2 (angewandt)</strong>');
            const interpretationHTML = ui_helpers.getMetricInterpretationHTML(key, metricData, 'T2 (angewandt)', displayKollektivName);
            const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
            const isPercent = !(key === 'f1' || key === 'auc');
            const formattedValue = formatCI(metricData?.value, metricData?.ci?.lower, metricData?.ci?.upper, digits, isPercent, na, currentLang === 'en');

            contentHTML += `
                <div class="p-1 flex-fill bd-highlight ${index > 0 ? 'border-start' : ''}">
                    <strong data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${metricDescription}">${metricDisplayNames[key]}:</strong>
                    <span data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${interpretationHTML}"> ${formattedValue}</span>
                </div>`;
        });

        contentHTML += '</div>';

        return `<div class="card bg-light border-secondary" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${cardTooltipText}"><div class="card-header card-header-sm bg-secondary text-white">Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)</div><div class="card-body p-2">${contentHTML}</div></div>`;
    }

    function createBruteForceModalContent(resultsData) {
        const { results, metric, kollektiv, duration, totalTested, nGesamt, nPlus, nMinus, bestResult } = resultsData;
        if (!results || results.length === 0) return '<p class="text-muted">Keine Ergebnisse gefunden.</p>';

        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'Formatierungsfehler';
        const getKollektivNameFunc = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName : (k) => k;
        
        const kollektivName = getKollektivNameFunc(kollektiv);
        const metricDisplayName = metric === 'PPV' ? 'PPV' : metric === 'NPV' ? 'NPV' : metric;
        const lang = stateManager.getCurrentPublikationLang();
        const resultContainerTooltip = (TOOLTIP_CONTENT.bruteForceResult.description || 'Ergebnis der Optimierung.')
                                      .replace('[N_GESAMT]', formatNumber(nGesamt,0,'?', lang === 'en'))
                                      .replace('[N_PLUS]', formatNumber(nPlus,0,'?', lang === 'en'))
                                      .replace('[N_MINUS]', formatNumber(nMinus,0,'?', lang === 'en'));

        let tableHTML = `
            <div class="alert alert-light small p-2 mb-3" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${resultContainerTooltip}">
                <p class="mb-1"><strong>Beste Kombi für '${metricDisplayName}' (Koll.: '${kollektivName}'):</strong></p>
                <ul class="list-unstyled mb-1">
                    <li><strong>Wert:</strong> ${formatNumber(bestResult.metricValue, 4, '--', lang === 'en')}</li>
                    <li><strong>Logik:</strong> ${bestResult.logic.toUpperCase()}</li>
                    <li><strong>Kriterien:</strong> ${formatCriteriaFunc(bestResult.criteria, bestResult.logic, false)}</li>
                </ul>
                <p class="mb-1 text-muted"><small>Dauer: ${formatNumber((duration || 0) / 1000, 1, '--', lang === 'en')}s | Getestet: ${formatNumber(totalTested, 0, '--', lang === 'en')}</small></p>
                <p class="mb-0 small text-muted" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.bruteForceResult.kollektivStats || 'Statistik des für diese Optimierung verwendeten Kollektivs.'}"><small>Kollektiv N=${formatNumber(nGesamt,0,'N/A', lang === 'en')} (N+: ${formatNumber(nPlus,0,'N/A', lang === 'en')}, N-: ${formatNumber(nMinus,0,'N/A', lang === 'en')})</small></p>
            </div>
            <h6 class="mb-2">Top Ergebnisse (inkl. identischer Werte):</h6>
            <div class="table-responsive">
                <table class="table table-sm table-striped table-hover small" id="bruteforce-results-table">
                    <thead class="small">
                        <tr>
                            <th data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Rang des Ergebnisses.">Rang</th>
                            <th data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Erreichter Wert der Zielmetrik (${metricDisplayName}). Höher ist besser.">${metricDisplayName}</th>
                            <th data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Sensitivität dieser Kriterienkombination.">Sens.</th>
                            <th data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Spezifität dieser Kriterienkombination.">Spez.</th>
                            <th data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Positiver Prädiktiver Wert dieser Kriterienkombination.">PPV</th>
                            <th data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Negativer Prädiktiver Wert dieser Kriterienkombination.">NPV</th>
                            <th data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Verwendete logische Verknüpfung (UND/ODER).">Logik</th>
                            <th data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Kombination der T2-Malignitätskriterien.">Kriterien</th>
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
            
            const showFullMetrics = result.sens !== undefined && result.spez !== undefined && result.ppv !== undefined && result.npv !== undefined;

            tableHTML += `
                <tr>
                    <td>${currentRank}.</td>
                    <td>${formatNumber(result.metricValue, 4, '--', lang === 'en')}</td>
                    <td>${showFullMetrics ? formatPercent(result.sens, 1, '--', lang) : 'N/A'}</td>
                    <td>${showFullMetrics ? formatPercent(result.spez, 1, '--', lang) : 'N/A'}</td>
                    <td>${showFullMetrics ? formatPercent(result.ppv, 1, '--', lang) : 'N/A'}</td>
                    <td>${showFullMetrics ? formatPercent(result.npv, 1, '--', lang) : 'N/A'}</td>
                    <td>${result.logic.toUpperCase()}</td>
                    <td>${formatCriteriaFunc(result.criteria, result.logic, false)}</td>
                </tr>`;

            if (isNewRank || i === 0) {
                lastMetricValue = result.metricValue;
            }
            displayedCount++;
             if (rank > 10 && displayedCount >=10 && isNewRank) break; 
        }
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function createPublikationTabHeader() {
        const currentLang = stateManager.getCurrentPublikationLang();
        const currentBfMetric = stateManager.getCurrentPublikationBruteForceMetric();

        const sectionNavItems = PUBLICATION_CONFIG.sections.map(mainSection => {
            const sectionTooltip = TOOLTIP_CONTENT.publikationTabTooltips[mainSection.id]?.description || UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey;
            return `
                <li class="nav-item">
                    <a class="nav-link py-2 publikation-section-link" href="#" data-section-id="${mainSection.id}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${sectionTooltip}">
                        ${UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey}
                    </a>
                </li>`;
        }).join('');

        const bfMetricOptions = PUBLICATION_CONFIG.bruteForceMetricsForPublication.map(opt =>
            `<option value="${opt.value}" ${opt.value === currentBfMetric ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        return `
            <div class="row mb-3 sticky-top bg-light py-2 shadow-sm" style="top: var(--sticky-header-offset); z-index: 1015;">
                <div class="col-md-3">
                    <h5 class="mb-2">Abschnitte</h5>
                    <nav id="publikation-sections-nav" class="nav flex-column nav-pills" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${TOOLTIP_CONTENT.publikationTabTooltips.sectionSelect?.description || 'Wählen Sie einen Publikationsabschnitt.'}">
                        ${sectionNavItems}
                    </nav>
                </div>
                <div class="col-md-9">
                    <div class="d-flex justify-content-end align-items-center mb-2">
                        <div class="me-3">
                           <label for="publikation-bf-metric-select" class="form-label form-label-sm mb-0 me-1">${UI_TEXTS.publikationTab.bruteForceMetricSelectLabel}</label>
                           <select class="form-select form-select-sm d-inline-block" id="publikation-bf-metric-select" style="width: auto;" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="${TOOLTIP_CONTENT.publikationTabTooltips.bruteForceMetricSelect.description}">
                               ${bfMetricOptions}
                           </select>
                        </div>
                        <div class="form-check form-switch" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="${TOOLTIP_CONTENT.publikationTabTooltips.spracheSwitch.description}">
                            <input class="form-check-input" type="checkbox" role="switch" id="publikation-sprache-switch" ${currentLang === 'en' ? 'checked' : ''}>
                            <label class="form-check-label fw-bold" for="publikation-sprache-switch" id="publikation-sprache-label">${UI_TEXTS.publikationTab.spracheSwitchLabel[currentLang]}</label>
                        </div>
                    </div>
                    <div id="publikation-content-area" class="bg-white p-3 border rounded" style="min-height: 400px; max-height: calc(100vh - var(--sticky-header-offset) - 4rem - 2rem); overflow-y: auto;">
                        <p class="text-muted">Bitte wählen Sie einen Abschnitt aus der Navigation.</p>
                    </div>
                </div>
            </div>`;
    }

    // --- Funktionen aus js/ui/ui_view_logic.js (ehemals) verschoben ---
    function createTableHeaderHTML(tableId, sortState, columns) {
        let headerHTML = `<thead class="small" id="${tableId}-header"><tr>`;
        columns.forEach(col => {
            let sortIconHTML = '<i class="fas fa-sort text-muted opacity-50"></i>';
            let mainHeaderStyle = '';
            if (sortState && sortState.key === col.key && !col.subKeys) {
                sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary"></i>`;
                mainHeaderStyle = 'style="color: var(--primary-color);"';
            }

            const subHeaders = col.subKeys ? col.subKeys.map(sk => {
                 let subIconHTML = '';
                 const isActiveSubSort = sortState && sortState.key === col.key && sortState.subKey === sk.key;
                 if(isActiveSubSort) {
                    sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary"></i>`;
                    subIconHTML = sortIconHTML;
                 }
                 const style = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                 return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="Sortieren nach ${col.label} -> ${sk.label}">${sk.label}</span>`;
             }).join(' / ') : '';
            
            const baseTooltipContent = col.tooltip || col.label;
            const mainTooltip = col.subKeys ? `${baseTooltipContent} Klicken Sie auf N, AS oder T2 für Sub-Sortierung.` : (col.key === 'details' ? (TOOLTIP_CONTENT.datenTable.expandRow || 'Details ein-/ausblenden') : `Sortieren nach ${col.label}. ${baseTooltipContent}`);
            const sortAttributes = `data-sort-key="${col.key}" ${col.key === 'details' ? '' : 'style="cursor: pointer;"'}`;
            const thClass = col.textAlign ? `text-${col.textAlign}` : '';
            const styleAttr = col.width ? `style="width: ${col.width};"` : '';

            if (col.subKeys) {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${mainTooltip}" ${styleAttr}>${col.label} ${subHeaders ? `(${subHeaders})` : ''} ${isMainKeyActiveSort && !activeSubKey ? sortIconHTML : '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>'}</th>`;
             } else {
                 headerHTML += `<th scope="col" class="${thClass}" ${sortAttributes} data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${mainTooltip}" ${styleAttr} ${mainHeaderStyle}>${col.label} ${col.key === 'details' ? '' : sortIconHTML}</th>`;
             }
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }

    function createPatientenTableHTML(data, sortState) {
        if (!Array.isArray(data)) return '<p class="text-danger">Fehler: Ungültige Patientendaten für Tabelle.</p>';

        const tableId = 'patienten-table';
        const columns = [
            { key: 'nr', label: 'Nr', tooltip: TOOLTIP_CONTENT.datenTable.nr || 'Fortlaufende Nummer des Patienten.' },
            { key: 'name', label: 'Name', tooltip: TOOLTIP_CONTENT.datenTable.name || 'Nachname des Patienten (anonymisiert/kodiert).' },
            { key: 'vorname', label: 'Vorname', tooltip: TOOLTIP_CONTENT.datenTable.vorname || 'Vorname des Patienten (anonymisiert/kodiert).' },
            { key: 'geschlecht', label: 'Geschl.', tooltip: TOOLTIP_CONTENT.datenTable.geschlecht || 'Geschlecht des Patienten (m/w/unbekannt).' },
            { key: 'alter', label: 'Alter', tooltip: TOOLTIP_CONTENT.datenTable.alter || 'Alter des Patienten zum Zeitpunkt der MRT-Untersuchung in Jahren.' },
            { key: 'therapie', label: 'Therapie', tooltip: TOOLTIP_CONTENT.datenTable.therapie || 'Angewandte Therapie vor der Operation (nRCT: neoadjuvante Radiochemotherapie, direkt OP: keine Vorbehandlung).' },
            { key: 'status', label: 'N/AS/T2', tooltip: TOOLTIP_CONTENT.datenTable.n_as_t2 || 'Status: Pathologie (N), Avocado Sign (AS), T2 (aktuelle Kriterien). Klicken Sie auf N, AS oder T2 im Spaltenkopf zur Sub-Sortierung.', subKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}] },
            { key: 'bemerkung', label: 'Bemerkung', tooltip: TOOLTIP_CONTENT.datenTable.bemerkung || 'Zusätzliche klinische oder radiologische Bemerkungen zum Patientenfall, falls vorhanden.' },
            { key: 'details', label: '', width: '30px'}
        ];

        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
        tableHTML += createTableHeaderHTML(tableId, sortState, columns);
        tableHTML += `<tbody id="${tableId}-body">`;
        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">Keine Patienten im ausgewählten Kollektiv gefunden.</td></tr>`;
        } else {
            data.forEach(patient => {
                tableHTML += tableRenderer.createDatenTableRow(patient);
            });
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    function createAuswertungTableHTML(data, sortState, appliedCriteria, appliedLogic) {
         if (!Array.isArray(data)) return '<p class="text-danger">Fehler: Ungültige Auswertungsdaten für Tabelle.</p>';

         const tableId = 'auswertung-table';
         const columns = [
             { key: 'nr', label: 'Nr', tooltip: TOOLTIP_CONTENT.auswertungTable.nr || 'Patienten-ID.' },
             { key: 'name', label: 'Name', tooltip: TOOLTIP_CONTENT.auswertungTable.name || 'Pseudonymisierter Patientenname.' },
             { key: 'therapie', label: 'Therapie', tooltip: TOOLTIP_CONTENT.auswertungTable.therapie || 'Angewandte Therapie vor der Operation.' },
             { key: 'status', label: 'N/AS/T2', tooltip: TOOLTIP_CONTENT.auswertungTable.n_as_t2 || 'Status: Pathologie (N), Avocado Sign (AS), T2 (aktuelle Kriterien).', subKeys: [{key: 'n', label: 'N'}, {key: 'as', label: 'AS'}, {key: 't2', label: 'T2'}]},
             { key: 'anzahl_patho_lk', label: 'N+/N ges.', tooltip: TOOLTIP_CONTENT.auswertungTable.n_counts || 'Anzahl pathologisch positiver Lymphknoten / Gesamtzahl pathologisch untersuchter Lymphknoten.', textAlign: 'center' },
             { key: 'anzahl_as_lk', label: 'AS+/AS ges.', tooltip: TOOLTIP_CONTENT.auswertungTable.as_counts || 'Anzahl Avocado Sign positiver Lymphknoten / Gesamtzahl im T1KM bewerteter Lymphknoten.', textAlign: 'center' },
             { key: 'anzahl_t2_lk', label: 'T2+/T2 ges.', tooltip: TOOLTIP_CONTENT.auswertungTable.t2_counts || 'Anzahl T2-positiver Lymphknoten (gemäß aktuell eingestellter Kriterien) / Gesamtzahl T2-bewerteter Lymphknoten.', textAlign: 'center' },
             { key: 'details', label: '', width: '30px'}
         ];

         let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
         tableHTML += createTableHeaderHTML(tableId, sortState, columns);
         tableHTML += `<tbody id="${tableId}-body">`;
         if (data.length === 0) {
             tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">Keine Patienten im ausgewählten Kollektiv gefunden.</td></tr>`;
         } else {
             data.forEach(patient => {
                 tableHTML += tableRenderer.createAuswertungTableRow(patient, appliedCriteria, appliedLogic);
             });
         }
         tableHTML += `</tbody></table>`;
         return tableHTML;
     }

    function createAuswertungTableCardHTML(data, sortState, appliedCriteria, appliedLogic) {
        const tableHTML = createAuswertungTableHTML(data, sortState, appliedCriteria, appliedLogic);
        return `
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>Patientenübersicht & Auswertungsergebnisse</span>
                        <button id="auswertung-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${TOOLTIP_CONTENT.auswertungTable.expandAll || 'Alle Details ein-/ausblenden'}">
                           Alle Details <i class="fas fa-chevron-down ms-1"></i>
                       </button>
                    </div>
                    <div class="card-body p-0">
                        <div id="auswertung-table-container" class="table-responsive">
                           ${tableHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function createDeskriptiveStatistikContentHTML(stats, indexSuffix = '0', kollektivName = '') {
        if (!stats || !stats.deskriptiv || !stats.deskriptiv.anzahlPatienten) return '<p class="text-muted small p-3">Keine deskriptiven Daten verfügbar.</p>';
        const total = stats.deskriptiv.anzahlPatienten;
        const na = '--';
        const lang = typeof stateManager !== 'undefined' ? stateManager.getCurrentPublikationLang() || 'de' : 'de';
        const fv = (val, dig = 1, useStd = false) => formatNumber(val, dig, na, lang === 'en' || useStd);
        const fP = (val, dig = 1) => formatPercent(val, dig, na, lang);
        const fLK = (lkData) => `${fv(lkData?.median,1)} (${fv(lkData?.min,0)}-${fv(lkData?.max,0)}) [${fv(lkData?.mean,1)} ± ${fv(lkData?.sd,1)}]`;
        const d = stats.deskriptiv;
        const ageChartId = `chart-stat-age-${indexSuffix}`;
        const genderChartId = `chart-stat-gender-${indexSuffix}`;
        const displayKollektivName = getKollektivDisplayName(kollektivName);

        let tableHTML = `
            <div class="row g-3 p-2">
                <div class="col-md-6">
                    <div class="table-responsive mb-3">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-demographie-${indexSuffix}">
                            <caption>Demographie & Status (N=${total})</caption>
                            <thead class="visually-hidden"><tr><th>Metrik</th><th>Wert</th></tr></thead>
                            <tbody>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.alterMedian?.description || 'Alter (Median, Min-Max, [Mittelwert ± SD])')}"><td>Alter Median (Min-Max) [Mean ± SD]</td><td>${fv(d.alter?.median, 1)} (${fv(d.alter?.min, 0)} - ${fv(d.alter?.max, 0)}) [${fv(d.alter?.mean, 1)} ± ${fv(d.alter?.sd, 1)}]</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.geschlecht?.description || 'Geschlechterverteilung')}"><td>Geschlecht (m / w) (n / %)</td><td>${d.geschlecht?.m ?? 0} / ${d.geschlecht?.f ?? 0} (${fP((d.anzahlPatienten > 0 ? (d.geschlecht?.m ?? 0) / d.anzahlPatienten : NaN), 1)} / ${fP((d.anzahlPatienten > 0 ? (d.geschlecht?.f ?? 0) / d.anzahlPatienten : NaN), 1)})</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.datenTable.therapie || 'Therapieverteilung')}"><td>Therapie (direkt OP / nRCT) (n / %)</td><td>${d.therapie?.['direkt OP'] ?? 0} / ${d.therapie?.nRCT ?? 0} (${fP((d.anzahlPatienten > 0 ? (d.therapie?.['direkt OP'] ?? 0) / d.anzahlPatienten : NaN), 1)} / ${fP((d.anzahlPatienten > 0 ? (d.therapie?.nRCT ?? 0) / d.anzahlPatienten : NaN), 1)})</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.nStatus?.description || 'N-Status Verteilung (Pathologie)')}"><td>N Status (+ / -) (n / %)</td><td>${d.nStatus?.plus ?? 0} / ${d.nStatus?.minus ?? 0} (${fP((d.anzahlPatienten > 0 ? (d.nStatus?.plus ?? 0) / d.anzahlPatienten : NaN), 1)} / ${fP((d.anzahlPatienten > 0 ? (d.nStatus?.minus ?? 0) / d.anzahlPatienten : NaN), 1)})</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.asStatus?.description || 'Avocado Sign Status Verteilung')}"><td>AS Status (+ / -) (n / %)</td><td>${d.asStatus?.plus ?? 0} / ${d.asStatus?.minus ?? 0} (${fP((d.anzahlPatienten > 0 ? (d.asStatus?.plus ?? 0) / d.anzahlPatienten : NaN), 1)} / ${fP((d.anzahlPatienten > 0 ? (d.asStatus?.minus ?? 0) / d.anzahlPatienten : NaN), 1)})</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.t2Status?.description || 'T2-Status Verteilung (angewandte Kriterien)')}"><td>T2 Status (+ / -) (n / %)</td><td>${d.t2Status?.plus ?? 0} / ${d.t2Status?.minus ?? 0} (${fP((d.anzahlPatienten > 0 ? (d.t2Status?.plus ?? 0) / d.anzahlPatienten : NaN), 1)} / ${fP((d.anzahlPatienten > 0 ? (d.t2Status?.minus ?? 0) / d.anzahlPatienten : NaN), 1)})</td></tr>
                            </tbody>
                        </table>
                    </div>
                     <div class="table-responsive">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-deskriptiv-lk-${indexSuffix}">
                             <caption>Lymphknotenanzahlen (Median (Min-Max) [Mean ± SD])</caption>
                             <thead class="visually-hidden"><tr><th>Metrik</th><th>Wert</th></tr></thead>
                             <tbody>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlPatho?.description || 'Gesamtzahl histopathologisch untersuchter Lymphknoten pro Patient.')}"><td>LK N gesamt</td><td>${fLK(d.lkAnzahlen?.n?.total)}</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlPathoPlus?.description || 'Anzahl pathologisch positiver (N+) Lymphknoten pro Patient, nur bei Patienten mit N+ Status (n=' + (d.nStatus?.plus ?? 0) + ').')}"><td>LK N+ <sup>*</sup></td><td>${fLK(d.lkAnzahlen?.n?.plus)}</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlAS?.description || 'Gesamtzahl im T1KM-MRT sichtbarer und bewerteter Lymphknoten pro Patient.')}"><td>LK AS gesamt</td><td>${fLK(d.lkAnzahlen?.as?.total)}</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlASPlus?.description || 'Anzahl Avocado Sign positiver (AS+) Lymphknoten pro Patient, nur bei Patienten mit AS+ Status (n=' + (d.asStatus?.plus ?? 0) + ').')}"><td>LK AS+ <sup>**</sup></td><td>${fLK(d.lkAnzahlen?.as?.plus)}</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlT2?.description || 'Gesamtzahl im T2-MRT sichtbarer und für die Kriterienbewertung herangezogener Lymphknoten pro Patient.')}"><td>LK T2 gesamt</td><td>${fLK(d.lkAnzahlen?.t2?.total)}</td></tr>
                                <tr data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.lkAnzahlT2Plus?.description || 'Anzahl T2-positiver Lymphknoten (gemäß aktueller Kriterien) pro Patient, nur bei Patienten mit T2+ Status (n=' + (d.t2Status?.plus ?? 0) + ').')}"><td>LK T2+ <sup>***</sup></td><td>${fLK(d.lkAnzahlen?.t2?.plus)}</td></tr>
                             </tbody>
                        </table>
                     </div>
                    <p class="small text-muted mt-1 mb-0"><sup>*</sup> Nur bei N+ Patienten (n=${d.nStatus?.plus ?? 0}); <sup>**</sup> Nur bei AS+ Patienten (n=${d.asStatus?.plus ?? 0}); <sup>***</sup> Nur bei T2+ Patienten (n=${d.t2Status?.plus ?? 0}).</p>
                </div>
                <div class="col-md-6 d-flex flex-column">
                    <div class="mb-2 flex-grow-1" id="${ageChartId}" style="min-height: 150px;" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.chartAge?.description || 'Altersverteilung der Patienten.').replace('[KOLLEKTIV]', `<strong>${displayKollektivName}</strong>`)}">
                       <p class="text-muted small text-center p-3">Lade Altersverteilung...</p>
                    </div>
                    <div class="flex-grow-1" id="${genderChartId}" style="min-height: 150px;" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.deskriptiveStatistik.chartGender?.description || 'Geschlechterverteilung der Patienten.').replace('[KOLLEKTIV]', `<strong>${displayKollektivName}</strong>`)}">
                       <p class="text-muted small text-center p-3">Lade Geschlechterverteilung...</p>
                    </div>
                </div>
            </div>`;
        return tableHTML;
    }

    function createGueteContentHTML(stats, methode, kollektivName) {
        if (!stats || !stats.matrix) return '<p class="text-muted small p-3">Keine Gütedaten verfügbar.</p>';
        const matrix = stats.matrix; const na = '--';
        const displayKollektivName = getKollektivDisplayName(kollektivName);
        const currentLang = typeof stateManager !== 'undefined' ? stateManager.getCurrentPublikationLang() || 'de' : 'de';
        const fCI_perf = (m, key) => {
            const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
            const isPercent = !(key === 'f1' || key === 'auc');
            return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, digits, isPercent, na, currentLang);
        };
        let matrixHTML = `<h6 class="px-2 pt-2">Konfusionsmatrix (${methode} vs. N)</h6><table class="table table-sm table-bordered text-center small mx-2 mb-3" style="width: auto;" id="table-guete-matrix-${methode}-${kollektivName.replace(/\s+/g, '_')}"><thead class="small"><tr><th></th><th>N+ (Patho)</th><th>N- (Patho)</th></tr></thead><tbody><tr><td class="fw-bold">${methode}+</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="Richtig Positiv (RP): ${methode}+ und N+. Anzahl Patienten, die von Methode ${methode} korrekt als positiv vorhergesagt wurden.">${formatNumber(matrix.rp,0,na,currentLang === 'en')}</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="Falsch Positiv (FP): ${methode}+ aber N-. Anzahl Patienten, die von Methode ${methode} fälschlicherweise als positiv vorhergesagt wurden (Typ-I-Fehler).">${formatNumber(matrix.fp,0,na,currentLang === 'en')}</td></tr><tr><td class="fw-bold">${methode}-</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="Falsch Negativ (FN): ${methode}- aber N+. Anzahl Patienten, die von Methode ${methode} fälschlicherweise als negativ vorhergesagt wurden (Typ-II-Fehler).">${formatNumber(matrix.fn,0,na,currentLang === 'en')}</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="Richtig Negativ (RN): ${methode}- und N-. Anzahl Patienten, die von Methode ${methode} korrekt als negativ vorhergesagt wurden.">${formatNumber(matrix.rn,0,na,currentLang === 'en')}</td></tr></tbody></table>`;
        let metricsHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-guete-metrics-${methode}-${kollektivName.replace(/\s+/g, '_')}"><caption>Diagnostische Gütekriterien für Methode ${methode} im Kollektiv ${displayKollektivName}</caption><thead><tr><th>Metrik</th><th>Wert (95% CI)</th><th>CI Methode</th></tr></thead><tbody>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('sens', methode)}">Sensitivität</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('sens', stats.sens, methode, displayKollektivName)}">${fCI_perf(stats.sens, 'sens')}</td><td>${stats.sens?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('spez', methode)}">Spezifität</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('spez', stats.spez, methode, displayKollektivName)}">${fCI_perf(stats.spez, 'spez')}</td><td>${stats.spez?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('ppv', methode)}">PPV</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('ppv', stats.ppv, methode, displayKollektivName)}">${fCI_perf(stats.ppv, 'ppv')}</td><td>${stats.ppv?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('npv', methode)}">NPV</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('npv', stats.npv, methode, displayKollektivName)}">${fCI_perf(stats.npv, 'npv')}</td><td>${stats.npv?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('acc', methode)}">Accuracy</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('acc', stats.acc, methode, displayKollektivName)}">${fCI_perf(stats.acc, 'acc')}</td><td>${stats.acc?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('balAcc', methode)}">Balanced Accuracy</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('balAcc', stats.balAcc, methode, displayKollektivName)}">${fCI_perf(stats.balAcc, 'balAcc')}</td><td>${stats.balAcc?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('f1', methode)}">F1-Score</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('f1', stats.f1, methode, displayKollektivName)}">${fCI_perf(stats.f1, 'f1')}</td><td>${stats.f1?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricDescriptionHTML('auc', methode)}">AUC (Bal. Acc.)</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getMetricInterpretationHTML('auc', stats.auc, methode, displayKollektivName)}">${fCI_perf(stats.auc, 'auc')}</td><td>${stats.auc?.method || na}</td></tr>
        </tbody></table></div>`;
        return matrixHTML + metricsHTML;
    }

    function createVergleichContentHTML(stats, kollektivName, t2ShortName = 'T2') {
        if (!stats) return '<p class="text-muted small p-3">Keine Vergleichsdaten verfügbar.</p>';
        const na = '--';
        const currentLang = typeof stateManager !== 'undefined' ? stateManager.getCurrentPublikationLang() || 'de' : 'de';
        const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : formatNumber(pVal, 3, na, currentLang === 'en')) : na;
        const displayKollektivName = getKollektivDisplayName(kollektivName);
        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}"><caption>Statistische Vergleiche zwischen Avocado Sign (AS) und T2-Kriterien (${t2ShortName}) im Kollektiv ${displayKollektivName}</caption><thead><tr><th>Test</th><th>Statistik</th><th>p-Wert</th><th>Methode</th></tr></thead><tbody>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getTestDescriptionHTML('mcnemar', t2ShortName)}">McNemar (Accuracy)</td><td>${formatNumber(stats.mcnemar?.statistic, 3, na, currentLang === 'en')} (df=${stats.mcnemar?.df || na})</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getTestInterpretationHTML('mcnemar', stats.mcnemar, displayKollektivName, t2ShortName)}">${fP(stats.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(stats.mcnemar?.pValue)}</td><td>${stats.mcnemar?.method || na}</td></tr>
            <tr><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getTestDescriptionHTML('delong', t2ShortName)}">DeLong (AUC)</td><td>Z=${formatNumber(stats.delong?.Z, 3, na, currentLang === 'en')}</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getTestInterpretationHTML('delong', stats.delong, displayKollektivName, t2ShortName)}">${fP(stats.delong?.pValue)} ${getStatisticalSignificanceSymbol(stats.delong?.pValue)}</td><td>${stats.delong?.method || na}</td></tr>
        </tbody></table></div>`;
        return tableHTML;
    }

    function createAssoziationContentHTML(stats, kollektivName, criteria) {
        if (!stats || Object.keys(stats).length === 0) return '<p class="text-muted small p-3">Keine Assoziationsdaten verfügbar.</p>';
        const na = '--';
        const currentLang = typeof stateManager !== 'undefined' ? stateManager.getCurrentPublikationLang() || 'de' : 'de';
        const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : formatNumber(pVal, 3, na, currentLang === 'en')) : na;
        const displayKollektivName = getKollektivDisplayName(kollektivName);
        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0 caption-top" id="table-assoziation-${kollektivName.replace(/\s+/g, '_')}"><caption>Assoziation zwischen Merkmalen und N-Status (+/-) für Kollektiv ${displayKollektivName}</caption><thead><tr><th>Merkmal</th><th>OR (95% CI)</th><th>RD (%) (95% CI)</th><th>Phi (φ)</th><th>p-Wert</th><th>Test</th></tr></thead><tbody>`;

        const getPValueInterpretationAssoc = (key, assocObj) => {
             const testName = assocObj?.testName || '';
             let pTooltipKey = 'defaultP';
             if (testName) {
                if (testName.toLowerCase().includes("fisher")) pTooltipKey = 'fisher';
                else if (testName.toLowerCase().includes("mann-whitney")) pTooltipKey = 'mannwhitney';
             } else if (key === 'size_mwu') {
                pTooltipKey = 'mannwhitney';
             }
             const merkmalName = assocObj?.featureName || key;
             return ui_helpers.getAssociationInterpretationHTML(pTooltipKey, assocObj, merkmalName, displayKollektivName);
        };
        const getTestDescriptionAssoc = (assocObj, key) => {
             const testName = assocObj?.testName || '';
             let pTooltipKey = 'defaultP';
             if (testName) {
                if (testName.toLowerCase().includes("fisher")) pTooltipKey = 'fisher';
                else if (testName.toLowerCase().includes("mann-whitney")) pTooltipKey = 'mannwhitney';
             } else if (key === 'size_mwu') {
                pTooltipKey = 'mannwhitney';
             }
             const merkmalName = assocObj?.featureName || key;
             const descriptionTemplate = TOOLTIP_CONTENT.statMetrics[pTooltipKey]?.description || TOOLTIP_CONTENT.statMetrics.defaultP.description || 'Testbeschreibung nicht verfügbar.';
             return descriptionTemplate.replace(/\[MERKMAL\]/g, `<strong>'${merkmalName}'</strong>`).replace(/\[VARIABLE\]/g, `<strong>'${merkmalName}'</strong>`);
        };

        const getMerkmalDescriptionHTMLAssoc = (key, assocObj) => {
             const baseName = TOOLTIP_CONTENT.statMetrics[key]?.name || assocObj?.featureName || key;
             const tooltipDescription = TOOLTIP_CONTENT.statMetrics[key]?.description || `Dieses Merkmal ('${baseName}') wird auf Assoziation mit dem N-Status getestet.`;
             return tooltipDescription.replace(/\[MERKMAL\]/g, `<strong>'${baseName}'</strong>`).replace(/\[METHODE\]/g, `<strong>'${baseName}'</strong>`);
        };


        const addRow = (key, assocObj, isActive = true) => {
            if (!assocObj) return '';
            const merkmalName = assocObj.featureName || key;
            const orStr = formatCI(assocObj.or?.value, assocObj.or?.ci?.lower, assocObj.or?.ci?.upper, 2, false, na, currentLang);
            const rdValPerc = formatNumber(assocObj.rd?.value !== null && !isNaN(assocObj.rd?.value) ? assocObj.rd.value * 100 : NaN, 1, na, currentLang === 'en');
            const rdCILowerPerc = formatNumber(assocObj.rd?.ci?.lower !== null && !isNaN(assocObj.rd?.ci?.lower) ? assocObj.rd.ci.lower * 100 : NaN, 1, na, currentLang === 'en');
            const rdCIUpperPerc = formatNumber(assocObj.rd?.ci?.upper !== null && !isNaN(assocObj.rd?.ci?.upper) ? assocObj.rd.ci.upper * 100 : NaN, 1, na, currentLang === 'en');
            const rdStr = rdValPerc !== na ? `${rdValPerc}% (${rdCILowerPerc}% - ${rdCIUpperPerc}%)` : na;
            const phiStr = formatNumber(assocObj.phi?.value, 2, na, currentLang === 'en');
            const pStr = fP(assocObj.pValue);
            const sigSymbol = getStatisticalSignificanceSymbol(assocObj.pValue);
            const testName = assocObj.testName || na;
            const aktivText = isActive ? '' : ' <small class="text-muted">(inaktiv in T2-Def.)</small>';

            return `<tr>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getMerkmalDescriptionHTMLAssoc(key, assocObj)}">${merkmalName}${aktivText}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getAssociationInterpretationHTML('or', assocObj, merkmalName, displayKollektivName)}">${orStr}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getAssociationInterpretationHTML('rd', assocObj, merkmalName, displayKollektivName)}">${rdStr}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${ui_helpers.getAssociationInterpretationHTML('phi', assocObj, merkmalName, displayKollektivName)}">${phiStr}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getPValueInterpretationAssoc(key, assocObj)}">${pStr} ${sigSymbol}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getTestDescriptionAssoc(assocObj, key)}">${testName}</td>
            </tr>`;
        };

        if (stats.as) tableHTML += addRow('as', stats.as);
        if (stats.size_mwu && stats.size_mwu.testName && !stats.size_mwu.testName.includes("Invalid") && !stats.size_mwu.testName.includes("Nicht genug")) {
            const mwuObj = stats.size_mwu;
            const pStr = fP(mwuObj.pValue);
            const sigSymbol = getStatisticalSignificanceSymbol(mwuObj.pValue);
            const pTooltip = getPValueInterpretationAssoc('size_mwu', mwuObj);
            const descTooltip = TOOLTIP_CONTENT.statMetrics.size_mwu.description || "Vergleich der medianen Lymphknotengröße zwischen N+ und N- Patienten mittels Mann-Whitney-U-Test.";
            const testDescTooltip = getTestDescriptionAssoc(mwuObj, 'size_mwu');
            tableHTML += `<tr>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${descTooltip}">${mwuObj.featureName || 'LK Größe (Median Vgl.)'}</td>
                <td>${na}</td><td>${na}</td><td>${na}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${pTooltip}">${pStr} ${sigSymbol}</td>
                <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${testDescTooltip}">${mwuObj.testName || na}</td>
            </tr>`;
        }
        const featureOrder = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
        featureOrder.forEach(key => {
            if (stats[key]) {
                const isActive = criteria[key]?.active === true;
                tableHTML += addRow(key, stats[key], isActive);
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function createVergleichKollektiveContentHTML(stats, kollektiv1Name, kollektiv2Name) {
        if (!stats || !stats.accuracyComparison || !stats.aucComparison) return '<p class="text-muted small p-3">Keine Kollektiv-Vergleichsdaten verfügbar.</p>';
        const na = '--';
        const currentLang = typeof stateManager !== 'undefined' ? stateManager.getCurrentPublikationLang() || 'de' : 'de';
        const fP = (pVal) => (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : formatNumber(pVal, 3, na, currentLang === 'en')) : na;
        const kollektiv1Display = getKollektivDisplayName(kollektiv1Name); const kollektiv2Display = getKollektivDisplayName(kollektiv2Name);
        const accAS = stats.accuracyComparison?.as; const accT2 = stats.accuracyComparison?.t2;
        const aucAS = stats.aucComparison?.as; const aucT2 = stats.aucComparison?.t2;

        const getPValueInterpretationComp = (pValue, testKey, methode) => {
             const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[testKey]?.interpretation || 'Keine Interpretation verfügbar.';
             const pStr = (pValue !== null && !isNaN(pValue)) ? (pValue < 0.001 ? '&lt;0.001' : formatNumber(pValue, 3, na, currentLang === 'en')) : na;
             const sigText = getStatisticalSignificanceText(pValue);
             return interpretationTemplate
                 .replace(/\[METHODE\]/g, `<strong>${methode}</strong>`)
                 .replace(/\[KOLLEKTIV1\]/g, `<strong>${kollektiv1Display}</strong>`)
                 .replace(/\[KOLLEKTIV2\]/g, `<strong>${kollektiv2Display}</strong>`)
                 .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                 .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`);
        };

        let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped small mb-0" id="table-vergleich-kollektive-${kollektiv1Name.replace(/\s+/g, '_')}-vs-${kollektiv2Name.replace(/\s+/g, '_')}"><caption>Vergleich der diagnostischen Leistung zwischen den Kollektiven ${kollektiv1Display} und ${kollektiv2Display}</caption><thead><tr><th>Vergleich</th><th>Methode</th><th>p-Wert</th><th>Test</th></tr></thead><tbody>`;
        tableHTML += `<tr><td>Accuracy</td><td>AS</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getPValueInterpretationComp(accAS?.pValue, 'accComp', 'AS')}">${fP(accAS?.pValue)} ${getStatisticalSignificanceSymbol(accAS?.pValue)}</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.statMetrics.accComp?.description || 'Vergleich Accuracy der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','AS')}">${accAS?.testName || na}</td></tr>`;
        tableHTML += `<tr><td>Accuracy</td><td>T2</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getPValueInterpretationComp(accT2?.pValue, 'accComp', 'T2')}">${fP(accT2?.pValue)} ${getStatisticalSignificanceSymbol(accT2?.pValue)}</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.statMetrics.accComp?.description || 'Vergleich Accuracy der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','T2')}">${accT2?.testName || na}</td></tr>`;
        tableHTML += `<tr><td>AUC</td><td>AS</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getPValueInterpretationComp(aucAS?.pValue, 'aucComp', 'AS')}">${fP(aucAS?.pValue)} ${getStatisticalSignificanceSymbol(aucAS?.pValue)} (Diff: ${formatNumber(aucAS?.diffAUC, 3, na, currentLang === 'en')}, Z=${formatNumber(aucAS?.Z, 2, na, currentLang === 'en')})</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.statMetrics.aucComp?.description || 'Vergleich AUC der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','AS')}">${aucAS?.method || na}</td></tr>`;
        tableHTML += `<tr><td>AUC</td><td>T2</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${getPValueInterpretationComp(aucT2?.pValue, 'aucComp', 'T2')}">${fP(aucT2?.pValue)} ${getStatisticalSignificanceSymbol(aucT2?.pValue)} (Diff: ${formatNumber(aucT2?.diffAUC, 3, na, currentLang === 'en')}, Z=${formatNumber(aucT2?.Z, 2, na, currentLang === 'en')})</td><td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${(TOOLTIP_CONTENT.statMetrics.aucComp?.description || 'Vergleich AUC der Methode [METHODE] zwischen zwei Kollektiven.').replace('[METHODE]','T2')}">${aucT2?.method || na}</td></tr>`;
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function createCriteriaComparisonTableHTML(results, globalKollektivName) {
         if (!Array.isArray(results) || results.length === 0) return '<p class="text-muted small p-3">Keine Daten für Kriterienvergleich verfügbar.</p>';
         const tc = TOOLTIP_CONTENT || {}; const cc = tc.criteriaComparisonTable || {};
         const currentLang = typeof stateManager !== 'undefined' ? stateManager.getCurrentPublikationLang() || 'de' : 'de';
         const headers = [
             { key: 'set', label: cc.tableHeaderSet || "Methode / Kriteriensatz", tooltip: cc.tableHeaderSetTooltip || "Die diagnostische Methode oder der spezifische Kriteriensatz, der evaluiert wird. 'Angewandte T2 Kriterien' sind die aktuell im Auswertungstab definierten. Literatur-Kriterien werden ggf. auf ihrem spezifischen Zielkollektiv evaluiert (in Klammern angegeben)." },
             { key: 'sens', label: cc.tableHeaderSens || "Sens.", tooltip: (cc.tableHeaderSensTooltip || "Sensitivität") + ": " + ui_helpers.getMetricDescriptionHTML('sens', 'der Methode') },
             { key: 'spez', label: cc.tableHeaderSpez || "Spez.", tooltip: (cc.tableHeaderSpezTooltip || "Spezifität") + ": " + ui_helpers.getMetricDescriptionHTML('spez', 'der Methode') },
             { key: 'ppv', label: cc.tableHeaderPPV || "PPV", tooltip: (cc.tableHeaderPPVTooltip || "PPV") + ": " + ui_helpers.getMetricDescriptionHTML('ppv', 'der Methode') },
             { key: 'npv', label: cc.tableHeaderNPV || "NPV", tooltip: (cc.tableHeaderNPVTooltip || "NPV") + ": " + ui_helpers.getMetricDescriptionHTML('npv', 'der Methode') },
             { key: 'acc', label: cc.tableHeaderAcc || "Acc.", tooltip: (cc.tableHeaderAccTooltip || "Accuracy") + ": " + ui_helpers.getMetricDescriptionHTML('acc', 'der Methode') },
             { key: 'auc', label: cc.tableHeaderAUC || "AUC/BalAcc", tooltip: (cc.tableHeaderAUCTooltip || "AUC/Bal. Accuracy") + ": " + ui_helpers.getMetricDescriptionHTML('auc', 'der Methode') }
         ];
         const tableId = "table-kriterien-vergleich";
         const displayGlobalKollektivName = getKollektivDisplayName(globalKollektivName);
         let tableHTML = `<div class="table-responsive px-2"><table class="table table-sm table-striped table-hover small caption-top" id="${tableId}"><caption>Vergleich verschiedener Kriteriensätze (vs. N) für das globale Kollektiv: ${displayGlobalKollektivName}</caption><thead class="small"><tr>`;
         headers.forEach(h => {
            const tooltipAttr = h.tooltip ? `data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${h.tooltip}"` : '';
            tableHTML += `<th ${tooltipAttr}>${h.label}</th>`;
         });
         tableHTML += `</tr></thead><tbody>`;

         results.forEach(result => {
             const isApplied = result.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
             const isAS = result.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID;
             const isLiteratur = !isApplied && !isAS;

             let rowClass = '';
             if (isApplied) rowClass = 'table-primary';
             else if (isAS) rowClass = 'table-info';

             let nameDisplay = result.name || 'Unbekannt';
             let kollektivForInterpretation = result.specificKollektivName || globalKollektivName;
             let patientCountForInterpretation = result.specificKollektivN !== undefined ? result.specificKollektivN : result.globalN;
             const displayKollektivForInterpretation = getKollektivDisplayName(kollektivForInterpretation);

             if (isApplied) nameDisplay = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
             else if (isAS) nameDisplay = APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME;

             let nameSuffix = '';
             if (isLiteratur && result.specificKollektivName && result.specificKollektivName !== globalKollektivName) {
                 nameSuffix = ` <small class="text-muted fst-italic">(eval. auf ${displayKollektivForInterpretation}, N=${patientCountForInterpretation || '?'})</small>`;
             } else if ((isApplied || isAS) && patientCountForInterpretation !== undefined) {
                 nameSuffix = ` <small class="text-muted fst-italic">(N=${patientCountForInterpretation || '?'})</small>`;
             }

             const metricForTooltipSens = { value: result.sens, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} };
             const metricForTooltipSpez = { value: result.spez, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} };
             const metricForTooltipPPV = { value: result.ppv, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} };
             const metricForTooltipNPV = { value: result.npv, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} };
             const metricForTooltipAcc = { value: result.acc, n_trials: patientCountForInterpretation, matrix_components: {total: patientCountForInterpretation} };
             const metricForTooltipAUC = { value: result.auc, matrix_components: {total: patientCountForInterpretation} };


             const tooltipSens = ui_helpers.getMetricInterpretationHTML('sens', metricForTooltipSens, nameDisplay, displayKollektivForInterpretation);
             const tooltipSpez = ui_helpers.getMetricInterpretationHTML('spez', metricForTooltipSpez, nameDisplay, displayKollektivForInterpretation);
             const tooltipPPV = ui_helpers.getMetricInterpretationHTML('ppv', metricForTooltipPPV, nameDisplay, displayKollektivForInterpretation);
             const tooltipNPV = ui_helpers.getMetricInterpretationHTML('npv', metricForTooltipNPV, nameDisplay, displayKollektivForInterpretation);
             const tooltipAcc = ui_helpers.getMetricInterpretationHTML('acc', metricForTooltipAcc, nameDisplay, displayKollektivForInterpretation);
             const tooltipAUC = ui_helpers.getMetricInterpretationHTML('auc', metricForTooltipAUC, nameDisplay, displayKollektivForInterpretation);

             tableHTML += `<tr class="${rowClass}">
                             <td class="fw-bold">${nameDisplay}${nameSuffix}</td>
                             <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltipSens}">${formatPercent(result.sens, 1, '--', currentLang)}</td>
                             <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltipSpez}">${formatPercent(result.spez, 1, '--', currentLang)}</td>
                             <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltipPPV}">${formatPercent(result.ppv, 1, '--', currentLang)}</td>
                             <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltipNPV}">${formatPercent(result.npv, 1, '--', currentLang)}</td>
                             <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltipAcc}">${formatPercent(result.acc, 1, '--', currentLang)}</td>
                             <td data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true" data-bs-title="${tooltipAUC}">${formatNumber(result.auc, 3, '--', currentLang === 'en')}</td>
                           </tr>`;
         });
         tableHTML += `</tbody></table></div>`;
         tableHTML += `<p class="small text-muted px-2 mt-1">Hinweis: Werte für Literatur-Kriteriensätze werden idealerweise auf deren spezifischem Zielkollektiv (falls von globalem Kollektiv abweichend, in Klammern angegeben) berechnet, um eine faire Vergleichbarkeit mit den Originalpublikationen zu gewährleisten. Avocado Sign und 'Angewandte T2 Kriterien' beziehen sich immer auf das für diese Zeile angegebene N (Patientenzahl des spezifischen Kollektivs).</p>`
         return tableHTML;
    }


    return Object.freeze({
        createDashboardCard,
        createT2CriteriaControls,
        createBruteForceCard,
        createStatistikCard,
        createExportOptions,
        createT2MetricsOverview,
        createBruteForceModalContent,
        createPublikationTabHeader,
        // Funktionen aus ui_view_logic.js verschoben
        createTableHeaderHTML,
        createPatientenTableHTML,
        createAuswertungTableHTML,
        createAuswertungTableCardHTML,
        createDeskriptiveStatistikContentHTML,
        createGueteContentHTML,
        createVergleichContentHTML,
        createAssoziationContentHTML,
        createVergleichKollektiveContentHTML,
        createCriteriaComparisonTableHTML
    });

})();

window.uiComponents = uiComponents;
