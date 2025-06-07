const uiComponents = (() => {

    function _createHeaderButtonHTML(buttons, targetId, defaultTitle = APP_CONFIG.UI_TEXTS.global.element) {
        let headerButtonHtml = '';
        if (buttons && buttons.length > 0 && targetId) {
            headerButtonHtml = buttons.map(btn => {
                const btnId = btn.id || `dl-${targetId.replace(/[^a-zA-Z0-9_-]/g, '')}-${btn.format || 'action'}`;
                const iconClass = btn.icon || 'fa-download';
                let tooltip = btn.tooltip || `${APP_CONFIG.UI_TEXTS.global.downloadAs} ${String(btn.format || APP_CONFIG.UI_TEXTS.global.action).toUpperCase()}`;

                const safeDefaultTitle = String(defaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);
                const safeChartName = String(btn.chartName || safeDefaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);
                const safeTableName = String(btn.tableName || safeDefaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);

                if (btn.format === 'png' && btn.chartId && APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSinglePNG?.description) {
                    tooltip = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSinglePNG.description.replace('{ChartName}', `<strong>${safeChartName}</strong>`);
                } else if (btn.format === 'svg' && btn.chartId && APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSingleSVG?.description) {
                    tooltip = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.chartSingleSVG.description.replace('{ChartName}', `<strong>${safeChartName}</strong>`);
                } else if (btn.format === 'png' && btn.tableId && APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.tableSinglePNG?.description) {
                    tooltip = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.tableSinglePNG.description.replace('{TableName}', `<strong>${safeTableName}</strong>`);
                }


                const dataAttributes = [];
                if (btn.chartId) dataAttributes.push(`data-chart-id="${btn.chartId}"`);
                if (btn.tableId) dataAttributes.push(`data-table-id="${btn.tableId}"`);
                
                if (btn.tableName) dataAttributes.push(`data-table-name="${safeTableName.replace(/\s/g, '_')}"`);
                else if (btn.chartId) dataAttributes.push(`data-chart-name="${safeChartName.replace(/\s/g, '_')}"`);
                else dataAttributes.push(`data-default-name="${safeDefaultTitle.replace(/\s/g, '_')}"`);


                if (btn.format) dataAttributes.push(`data-format="${btn.format}"`);

                return `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 ${btn.tableId ? 'table-download-png-btn' : (btn.chartId ? 'chart-download-btn' : '')}" id="${btnId}" ${dataAttributes.join(' ')} data-tippy-content="${tooltip}"><i class="fas ${iconClass}"></i></button>`;
            }).join('');
        }
        return headerButtonHtml;
    }

    function createDashboardCard(title, content, chartId = null, cardClasses = '', headerClasses = '', bodyClasses = '', downloadButtons = []) {
        const headerButtonHtml = _createHeaderButtonHTML(downloadButtons, chartId || title.replace(/[^a-z0-9]/gi, '_'), title);
        const tooltipKey = chartId ? chartId.replace(/^chart-dash-/, '') : title.toLowerCase().replace(/\s+/g, '');
        let tooltipContent = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.deskriptiveStatistik[tooltipKey]?.description || title || '';
        if(tooltipKey === 'ageDistribution' || tooltipKey === 'alter') tooltipContent = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.deskriptiveStatistik.chartAge?.description || title;
        else if(tooltipKey === 'genderDistribution' || tooltipKey === 'geschlecht') tooltipContent = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.deskriptiveStatistik.chartGender?.description || title;


        return `
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 dashboard-card-col ${cardClasses}">
                <div class="card h-100 dashboard-card">
                    <div class="card-header ${headerClasses} d-flex justify-content-between align-items-center" data-tippy-content="${tooltipContent.replace('[KOLLEKTIV]', `<strong>${APP_CONFIG.UI_TEXTS.global.currentCollective}</strong>`)}">
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
        if (!initialCriteria || !initialLogic) return `<p class="text-danger">${APP_CONFIG.UI_TEXTS.global.initialCriteriaLoadError}</p>`;
        const logicChecked = initialLogic === 'ODER';
        const defaultCriteriaForSize = APP_CONFIG.T2_CRITERIA_SETTINGS.DEFAULT_CRITERIA;
        const sizeThreshold = initialCriteria.size?.threshold ?? defaultCriteriaForSize?.size?.threshold;
        const sizeMin = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min;
        const sizeMax = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max;
        const sizeStep = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step;
        const formattedThreshold = formatNumber(sizeThreshold, 1, '', true);

        const createButtonOptions = (key, isChecked, criterionLabel) => {
            const valuesKey = key.toUpperCase() + '_VALUES';
            const values = APP_CONFIG.T2_CRITERIA_SETTINGS[valuesKey] || [];
            const currentValue = initialCriteria[key]?.value;
            return values.map(value => {
                const isActiveValue = isChecked && currentValue === value;
                const icon = ui_helpers.getT2IconSVG(key, value);
                const buttonTooltip = `${APP_CONFIG.UI_TEXTS.criteriaDisplay.setCriterion.replace('{CRITERION_LABEL}', criterionLabel).replace('{VALUE}', value)} ${isChecked ? '' : APP_CONFIG.UI_TEXTS.criteriaDisplay.inactiveCriterion}`;
                return `<button class="btn t2-criteria-button criteria-icon-button ${isActiveValue ? 'active' : ''} ${isChecked ? '' : 'inactive-option'}" data-criterion="${key}" data-value="${value}" data-tippy-content="${buttonTooltip}" ${isChecked ? '' : 'disabled'}>${icon}</button>`;
            }).join('');
        };

        const createCriteriaGroup = (key, label, tooltipKey, contentGenerator) => {
            const isChecked = initialCriteria[key]?.active === true;
            const tooltip = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT[tooltipKey]?.description || label;
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

        return `
            <div class="card criteria-card" id="t2-criteria-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>${APP_CONFIG.UI_TEXTS.auswertungTab.defineT2Criteria}</span>
                    <div class="form-check form-switch" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.t2Logic.description}">
                         <label class="form-check-label small me-2" for="t2-logic-switch" id="t2-logic-label-prefix">${APP_CONFIG.UI_TEXTS.auswertungTab.logicLabel}</label>
                         <input class="form-check-input" type="checkbox" role="switch" id="t2-logic-switch" ${logicChecked ? 'checked' : ''}>
                         <label class="form-check-label fw-bold" for="t2-logic-switch" id="t2-logic-label">${initialLogic}</label>
                     </div>
                </div>
                <div class="card-body">
                     <div class="row g-4">
                        ${createCriteriaGroup('size', APP_CONFIG.UI_TEXTS.criteriaDisplay.sizeFull, 't2Size', (key, isChecked) => `
                            <div class="d-flex align-items-center flex-wrap">
                                 <span class="me-1 small text-muted">≥</span>
                                 <input type="range" class="form-range criteria-range flex-grow-1 me-2" id="range-size" min="${sizeMin}" max="${sizeMax}" step="${sizeStep}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} data-tippy-content="${APP_CONFIG.UI_TEXTS.t2Size.setThreshold}">
                                 <span class="criteria-value-display text-end me-1 fw-bold" id="value-size">${formatNumber(sizeThreshold, 1)}</span><span class="me-2 small text-muted">mm</span>
                                 <input type="number" class="form-control form-control-sm criteria-input-manual" id="input-size" min="${sizeMin}" max="${sizeMax}" step="${sizeStep}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} style="width: 70px;" aria-label="${APP_CONFIG.UI_TEXTS.t2Size.manualInput}" data-tippy-content="${APP_CONFIG.UI_TEXTS.t2Size.manualInputTooltip}">
                            </div>
                        `)}
                        ${createCriteriaGroup('form', APP_CONFIG.UI_TEXTS.criteriaDisplay.formFull, 't2Form', createButtonOptions)}
                        ${createCriteriaGroup('kontur', APP_CONFIG.UI_TEXTS.criteriaDisplay.contourFull, 't2Kontur', createButtonOptions)}
                        ${createCriteriaGroup('homogenitaet', APP_CONFIG.UI_TEXTS.criteriaDisplay.homogeneityFull, 't2Homogenitaet', createButtonOptions)}
                        ${createCriteriaGroup('signal', APP_CONFIG.UI_TEXTS.criteriaDisplay.signalFull, 't2Signal', (key, isChecked, label) => `
                            <div>${createButtonOptions(key, isChecked, label)}</div>
                            <small class="text-muted d-block mt-1">${APP_CONFIG.UI_TEXTS.t2Signal.note}</small>
                        `)}
                        <div class="col-12 d-flex justify-content-end align-items-center border-top pt-3 mt-3">
                            <button class="btn btn-sm btn-outline-secondary me-2" id="btn-reset-criteria" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.t2Actions.reset}">
                                <i class="fas fa-undo me-1"></i> ${APP_CONFIG.UI_TEXTS.t2Actions.resetButton}
                            </button>
                            <button class="btn btn-sm btn-primary" id="btn-apply-criteria" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.t2Actions.apply}">
                                <i class="fas fa-check me-1"></i> ${APP_CONFIG.UI_TEXTS.t2Actions.applyButton}
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function createBruteForceCard(currentKollektivName, workerAvailable) {
        const disabledAttribute = !workerAvailable ? 'disabled' : '';
        const startButtonText = workerAvailable ? `<i class="fas fa-cogs me-1"></i> ${APP_CONFIG.UI_TEXTS.bruteForceStart.optimizeButton}` : `<i class="fas fa-times-circle me-1"></i> ${APP_CONFIG.UI_TEXTS.bruteForceStart.workerMissing}`;
        const statusText = workerAvailable ? APP_CONFIG.UI_TEXTS.bruteForceInfo.ready : APP_CONFIG.UI_TEXTS.bruteForceInfo.workerNotAvailable;
        const defaultMetric = APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
        const displayKollektivName = getKollektivDisplayName(currentKollektivName);
        const resultContainerTooltip = (APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.bruteForceResult.description)
                                      .replace('[N_GESAMT]', '--')
                                      .replace('[N_PLUS]', '--')
                                      .replace('[N_MINUS]', '--');


        return `
        <div class="col-12">
            <div class="card">
                <div class="card-header">${APP_CONFIG.UI_TEXTS.auswertungTab.bruteForceOptimizationTitle}</div>
                <div class="card-body">
                    <p class="card-text small">${APP_CONFIG.UI_TEXTS.bruteForceInfo.descriptionShort}</p>
                    <div class="row g-3 align-items-end mb-3">
                        <div class="col-md-4">
                            <label for="brute-force-metric" class="form-label form-label-sm">${APP_CONFIG.UI_TEXTS.bruteForceMetric.label}</label>
                            <select class="form-select form-select-sm" id="brute-force-metric" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.bruteForceMetric.description}">
                                <option value="Accuracy" ${defaultMetric === 'Accuracy' ? 'selected' : ''}>${APP_CONFIG.UI_TEXTS.bruteForceMetric.options.accuracy}</option>
                                <option value="Balanced Accuracy" ${defaultMetric === 'Balanced Accuracy' ? 'selected' : ''}>${APP_CONFIG.UI_TEXTS.bruteForceMetric.options.balancedAccuracy}</option>
                                <option value="F1-Score" ${defaultMetric === 'F1-Score' ? 'selected' : ''}>${APP_CONFIG.UI_TEXTS.bruteForceMetric.options.f1Score}</option>
                                <option value="PPV" ${defaultMetric === 'PPV' ? 'selected' : ''}>${APP_CONFIG.UI_TEXTS.bruteForceMetric.options.ppv}</option>
                                <option value="NPV" ${defaultMetric === 'NPV' ? 'selected' : ''}>${APP_CONFIG.UI_TEXTS.bruteForceMetric.options.npv}</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                             <button class="btn btn-primary btn-sm w-100" id="btn-start-brute-force" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.bruteForceStart.description}" ${disabledAttribute}>
                                 ${startButtonText}
                             </button>
                        </div>
                         <div class="col-md-4">
                             <div id="brute-force-info" class="text-muted small text-md-end" data-tippy-content="${(APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.bruteForceInfo.description).replace('[KOLLEKTIV_NAME]', `<strong>${displayKollektivName}</strong>`)}">
                                 ${APP_CONFIG.UI_TEXTS.bruteForceInfo.statusLabel}: <span id="bf-status-text" class="fw-bold">${statusText}</span><br>${APP_CONFIG.UI_TEXTS.bruteForceInfo.kollektivLabel}: <strong id="bf-kollektiv-info">${displayKollektivName}</strong>
                             </div>
                         </div>
                    </div>
                     <div id="brute-force-progress-container" class="mt-3 d-none" data-tippy-content="${(APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.bruteForceProgress.description).replace('[TOTAL]', '0')}">
                         <div class="d-flex justify-content-between mb-1 small">
                            <span>${APP_CONFIG.UI_TEXTS.bruteForceProgress.progressLabel}: <span id="bf-tested-count">0</span> / <span id="bf-total-count">0</span></span>
                            <span id="bf-progress-percent">0%</span>
                         </div>
                         <div class="progress" style="height: 8px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" id="bf-progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                         </div>
                         <div class="mt-2 small">
                            ${APP_CONFIG.UI_TEXTS.bruteForceInfo.bestMetricSoFar}: <span id="bf-metric-label" class="fw-bold">${APP_CONFIG.UI_TEXTS.global.metric}</span>: <span id="bf-best-metric" class="fw-bold" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.bruteForceInfo.bestMetricValue}">--</span>
                            <div id="bf-best-criteria" class="mt-1 text-muted" style="word-break: break-word;" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.bruteForceInfo.bestCriteriaDetails}">${APP_CONFIG.UI_TEXTS.bruteForceInfo.bestCriteriaLabel}: --</div>
                         </div>
                          <button class="btn btn-danger btn-sm mt-2 d-none" id="btn-cancel-brute-force" data-tippy-content="${APP_CONFIG.UI_TEXTS.bruteForceStart.cancelTooltip}">
                            <i class="fas fa-times me-1"></i> ${APP_CONFIG.UI_TEXTS.bruteForceStart.cancelButton}
                         </button>
                     </div>
                     <div id="brute-force-result-container" class="mt-3 d-none alert alert-success p-2" role="alert" data-tippy-content="${resultContainerTooltip}">
                         <h6 class="alert-heading small">${APP_CONFIG.UI_TEXTS.bruteForceResult.optimizationComplete}</h6>
                         <p class="mb-1 small">${APP_CONFIG.UI_TEXTS.bruteForceResult.bestCombinationFor} <strong id="bf-result-metric"></strong> (${APP_CONFIG.UI_TEXTS.bruteForceResult.kollektivShort}: <strong id="bf-result-kollektiv"></strong>):</p>
                         <ul class="list-unstyled mb-1 small">
                            <li><strong>${APP_CONFIG.UI_TEXTS.bruteForceResult.valueLabel}:</strong> <span id="bf-result-value" class="fw-bold"></span></li>
                            <li><strong>${APP_CONFIG.UI_TEXTS.bruteForceResult.logicLabel}:</strong> <span id="bf-result-logic" class="fw-bold"></span></li>
                            <li style="word-break: break-word;"><strong>${APP_CONFIG.UI_TEXTS.bruteForceResult.criteriaLabel}:</strong> <span id="bf-result-criteria" class="fw-bold"></span></li>
                         </ul>
                         <p class="mb-1 small text-muted">${APP_CONFIG.UI_TEXTS.bruteForceResult.durationLabel}: <span id="bf-result-duration"></span>s | ${APP_CONFIG.UI_TEXTS.bruteForceResult.testedLabel}: <span id="bf-result-total-tested"></span></p>
                         <p class="mb-0 small text-muted" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.bruteForceResult.kollektivStats}">${APP_CONFIG.UI_TEXTS.bruteForceResult.kollektivNLabel}: <span id="bf-result-kollektiv-n">--</span> (N+: <span id="bf-result-kollektiv-nplus">--</span>, N-: <span id="bf-result-kollektiv-nminus">--</span>)</p>
                         <hr class="my-1">
                         <button class="btn btn-success btn-sm me-2" id="btn-apply-best-bf-criteria" data-tippy-content="${APP_CONFIG.UI_TEXTS.bruteForceResult.applyBestTooltip}">
                             <i class="fas fa-check me-1"></i> ${APP_CONFIG.UI_TEXTS.bruteForceResult.applyBestButton}
                         </button>
                         <button class="btn btn-outline-secondary btn-sm" id="btn-show-brute-force-details" data-bs-toggle="modal" data-bs-target="#brute-force-modal" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.bruteForceDetailsButton.description}">
                             <i class="fas fa-list-ol me-1"></i> ${APP_CONFIG.UI_TEXTS.bruteForceDetailsButton.label}
                         </button>
                     </div>
                </div>
            </div>
        </div>
        `;
    }

    function createStatistikCard(id, title, content = '', addPadding = true, tooltipKey = null, downloadButtons = [], tableId = null) {
        const cardTooltipHtml = tooltipKey && APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT[tooltipKey]?.cardTitle
            ? `data-tippy-content="${(APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT[tooltipKey].cardTitle).replace('[KOLLEKTIV]', `<strong>[KOLLEKTIV_PLACEHOLDER]</strong>`)}"`
            : `data-tippy-content="${title}"`;

        const headerButtonHtml = _createHeaderButtonHTML(downloadButtons, id + '-content', title);

        let finalButtonHtml = headerButtonHtml;
        if (APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT && tableId && !downloadButtons.some(b => b.tableId === tableId)) {
             const pngExportButton = { id: `dl-card-${id}-${tableId}-png`, icon: 'fa-image', tooltip: APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.tableSinglePNG.description.replace('{TableName}', `**${title}**`), format: 'png', tableId: tableId, tableName: title };
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

        const generateButtonHTML = (idSuffix, iconClass, text, tooltipKey, disabled = false, experimental = false) => {
            const config = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab[tooltipKey]; if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) return ``;
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]; const ext = config.ext; const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeKollektiv).replace('{DATE}', dateStr).replace('{EXT}', ext); const tooltipHtml = `data-tippy-content="${config.description}<br><small>${APP_CONFIG.UI_TEXTS.exportTab.fileLabel}: ${filename}</small>"`; const disabledAttr = disabled ? 'disabled' : ''; const experimentalBadge = experimental ? `<span class="badge bg-warning text-dark ms-1 small">${APP_CONFIG.UI_TEXTS.exportTab.experimentalBadge}</span>` : ''; const buttonClass = disabled ? 'btn-outline-secondary' : 'btn-outline-primary';
            return `<button class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabledAttr}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${text} (.${ext})</span> ${experimentalBadge}</button>`;
        };

         const generateZipButtonHTML = (idSuffix, iconClass, text, tooltipKey, disabled = false) => {
            const config = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab[tooltipKey]; if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) return ``;
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]; const ext = config.ext; const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeKollektiv).replace('{DATE}', dateStr).replace('{EXT}', ext); const tooltipHtml = `data-tippy-content="${config.description}<br><small>${APP_CONFIG.UI_TEXTS.exportTab.fileLabel}: ${filename}</small>"`; const disabledAttr = disabled ? 'disabled' : ''; const buttonClass = idSuffix === 'all-zip' ? 'btn-primary' : 'btn-outline-secondary';
            return `<button class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabledAttr}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${text} (.${ext})</span></button>`;
         };

        const exportDesc = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.exportTab.description.replace('[KOLLEKTIV]', `<strong>${getKollektivDisplayName(currentKollektiv)}</strong>`);

        return `
            <div class="row export-options-container">
                <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${APP_CONFIG.UI_TEXTS.exportTab.singleExports}</div>
                        <div class="card-body">
                            <p class="small text-muted mb-3">${exportDesc}</p>
                            <h6 class="text-muted small text-uppercase mb-2">${APP_CONFIG.UI_TEXTS.exportTab.reportsAndStatistics}</h6>
                            ${generateButtonHTML('statistik-csv', 'fas fa-file-csv', APP_CONFIG.UI_TEXTS.exportTab.statsCSV.label, 'statsCSV')}
                            ${generateButtonHTML('bruteforce-txt', 'fas fa-file-alt', APP_CONFIG.UI_TEXTS.exportTab.bruteForceTXT.label, 'bruteForceTXT', true)}
                            ${generateButtonHTML('deskriptiv-md', 'fab fa-markdown', APP_CONFIG.UI_TEXTS.exportTab.deskriptivMD.label, 'deskriptivMD')}
                            ${generateButtonHTML('comprehensive-report-html', 'fas fa-file-invoice', APP_CONFIG.UI_TEXTS.exportTab.comprehensiveReportHTML.label, 'comprehensiveReportHTML')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">${APP_CONFIG.UI_TEXTS.exportTab.tablesAndRawData}</h6>
                             ${generateButtonHTML('daten-md', 'fab fa-markdown', APP_CONFIG.UI_TEXTS.exportTab.datenMD.label, 'datenMD')}
                             ${generateButtonHTML('auswertung-md', 'fab fa-markdown', APP_CONFIG.UI_TEXTS.exportTab.auswertungMD.label, 'auswertungMD')}
                             ${generateButtonHTML('filtered-data-csv', 'fas fa-database', APP_CONFIG.UI_TEXTS.exportTab.filteredDataCSV.label, 'filteredDataCSV')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">${APP_CONFIG.UI_TEXTS.exportTab.chartsAndTablesAsImages}</h6>
                             ${generateButtonHTML('charts-png', 'fas fa-images', APP_CONFIG.UI_TEXTS.exportTab.chartsPNG.label, 'chartsPNG')}
                             ${generateButtonHTML('charts-svg', 'fas fa-file-code', APP_CONFIG.UI_TEXTS.exportTab.chartsSVG.label, 'chartsSVG')}
                        </div>
                    </div>
                </div>
                 <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${APP_CONFIG.UI_TEXTS.exportTab.exportPackages}</div>
                        <div class="card-body">
                             <p class="small text-muted mb-3">${APP_CONFIG.UI_TEXTS.exportTab.zipDescription.replace('[KOLLEKTIV]', `<strong>${getKollektivDisplayName(currentKollektiv)}</strong>`)}</p>
                            ${generateZipButtonHTML('all-zip', 'fas fa-file-archive', APP_CONFIG.UI_TEXTS.exportTab.allZIP.label, 'allZIP')}
                            ${generateZipButtonHTML('csv-zip', 'fas fa-file-csv', APP_CONFIG.UI_TEXTS.exportTab.csvZIP.label, 'csvZIP')}
                            ${generateZipButtonHTML('md-zip', 'fab fa-markdown', APP_CONFIG.UI_TEXTS.exportTab.mdZIP.label, 'mdZIP')}
                            ${generateZipButtonHTML('png-zip', 'fas fa-images', APP_CONFIG.UI_TEXTS.exportTab.pngZIP.label, 'pngZIP')}
                            ${generateZipButtonHTML('svg-zip', 'fas fa-file-code', APP_CONFIG.UI_TEXTS.exportTab.svgZIP.label, 'svgZIP')}
                        </div>
                    </div>
                </div>
                <div class="col-lg-12 col-xl-4 mb-3">
                   <div class="card h-100"> <div class="card-header">${APP_CONFIG.UI_TEXTS.exportTab.exportNotesTitle}</div> <div class="card-body small"> <ul class="list-unstyled mb-0"> <li class="mb-2"><i class="fas fa-info-circle fa-fw me-1 text-primary"></i>${APP_CONFIG.UI_TEXTS.exportTab.exportNotes.note1}</li> <li class="mb-2"><i class="fas fa-table fa-fw me-1 text-primary"></i>**CSV:** ${APP_CONFIG.UI_TEXTS.exportTab.exportNotes.csvNote}</li> <li class="mb-2"><i class="fab fa-markdown fa-fw me-1 text-primary"></i>**MD:** ${APP_CONFIG.UI_TEXTS.exportTab.exportNotes.mdNote}</li> <li class="mb-2"><i class="fas fa-file-alt fa-fw me-1 text-primary"></i>**TXT:** ${APP_CONFIG.UI_TEXTS.exportTab.exportNotes.txtNote}</li> <li class="mb-2"><i class="fas fa-file-invoice fa-fw me-1 text-primary"></i>**HTML Bericht:** ${APP_CONFIG.UI_TEXTS.exportTab.exportNotes.htmlReportNote}</li> <li class="mb-2"><i class="fas fa-images fa-fw me-1 text-primary"></i>**PNG:** ${APP_CONFIG.UI_TEXTS.exportTab.exportNotes.pngNote}</li> <li class="mb-2"><i class="fas fa-file-code fa-fw me-1 text-primary"></i>**SVG:** ${APP_CONFIG.UI_TEXTS.exportTab.exportNotes.svgNote}</li> <li class="mb-0"><i class="fas fa-exclamation-triangle fa-fw me-1 text-warning"></i>${APP_CONFIG.UI_TEXTS.exportTab.exportNotes.zipWarning}</li> </ul> </div> </div>
                </div>
            </div>
        `;
    }

    function createT2MetricsOverview(stats, kollektivName) {
        const displayKollektivName = getKollektivDisplayName(kollektivName);
        const cardTooltip = (APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.t2MetricsOverview.cardTitle).replace('[KOLLEKTIV]', `<strong>${displayKollektivName}</strong>`);
        if (!stats || !stats.matrix || stats.matrix.rp === undefined) {
             return `<div class="card bg-light border-secondary" data-tippy-content="${cardTooltip}"><div class="card-header card-header-sm bg-secondary text-white">${APP_CONFIG.UI_TEXTS.t2MetricsOverview.title}</div><div class="card-body p-2"><p class="m-0 text-muted small">${APP_CONFIG.UI_TEXTS.t2MetricsOverview.metricsNotAvailable.replace('{KOLLEKTIV}', displayKollektivName)}</p></div></div>`;
        }
        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
        const metricDisplayNames = { 
            sens: APP_CONFIG.UI_TEXTS.t2MetricsOverview.sensShort, 
            spez: APP_CONFIG.UI_TEXTS.t2MetricsOverview.spezShort, 
            ppv: APP_CONFIG.UI_TEXTS.t2MetricsOverview.ppvShort, 
            npv: APP_CONFIG.UI_TEXTS.t2MetricsOverview.npvShort, 
            acc: APP_CONFIG.UI_TEXTS.t2MetricsOverview.accShort, 
            balAcc: APP_CONFIG.UI_TEXTS.t2MetricsOverview.balAccShort, 
            f1: APP_CONFIG.UI_TEXTS.t2MetricsOverview.f1Short, 
            auc: APP_CONFIG.UI_TEXTS.t2MetricsOverview.aucShort 
        };
        const na = '--';

        let contentHTML = '<div class="d-flex flex-wrap justify-content-around small text-center">';

        metrics.forEach((key, index) => {
            const metricData = stats[key];
            const metricDescription = (APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.t2MetricsOverview?.[key]?.description || APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.statMetrics[key]?.description || key).replace(/\[METHODE\]/g, `<strong>${APP_CONFIG.UI_TEXTS.global.t2Applied}</strong>`);
            const interpretationHTML = getMetricInterpretationHTML(key, metricData, APP_CONFIG.UI_TEXTS.global.t2Applied, displayKollektivName);
            const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
            const isPercent = !(key === 'f1' || key === 'auc');
            const formattedValue = formatCI(metricData?.value, metricData?.ci?.lower, metricData?.ci?.upper, digits, isPercent, na);

            contentHTML += `
                <div class="p-1 flex-fill bd-highlight ${index > 0 ? 'border-start' : ''}">
                    <strong data-tippy-content="${metricDescription}">${metricDisplayNames[key]}:</strong>
                    <span data-tippy-content="${interpretationHTML}"> ${formattedValue}</span>
                </div>`;
        });

        contentHTML += '</div>';

        return `<div class="card bg-light border-secondary" data-tippy-content="${cardTooltip}"><div class="card-header card-header-sm bg-secondary text-white">${APP_CONFIG.UI_TEXTS.t2MetricsOverview.title}</div><div class="card-body p-2">${contentHTML}</div></div>`;
    }

    function createBruteForceModalContent(resultsData) {
        const { results, metric, kollektiv, duration, totalTested, nGesamt, nPlus, nMinus } = resultsData;
        if (!results || results.length === 0) return `<p class="text-muted">${APP_CONFIG.UI_TEXTS.bruteForceResult.noResultsFound}</p>`;

        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => APP_CONFIG.UI_TEXTS.global.formattingError;
        const getKollektivNameFunc = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName : (k) => k;
        const bestResult = results[0];
        const kollektivName = getKollektivNameFunc(kollektiv);
        const metricDisplayName = APP_CONFIG.UI_TEXTS.bruteForceMetric.options[metric.toLowerCase()] || metric;
        const resultContainerTooltip = (APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.bruteForceResult.description)
                                      .replace('[N_GESAMT]', formatNumber(nGesamt,0,'?'))
                                      .replace('[N_PLUS]', formatNumber(nPlus,0,'?'))
                                      .replace('[N_MINUS]', formatNumber(nMinus,0,'?'));

        let tableHTML = `
            <div class="alert alert-light small p-2 mb-3" data-tippy-content="${resultContainerTooltip}">
                <p class="mb-1"><strong>${APP_CONFIG.UI_TEXTS.bruteForceResult.bestCombinationFor.replace('{METRIC_DISPLAY_NAME}', `'${metricDisplayName}'`).replace('{KOLLEKTIV_NAME}', `'${kollektivName}'`)}:</strong></p>
                <ul class="list-unstyled mb-1">
                    <li><strong>${APP_CONFIG.UI_TEXTS.bruteForceResult.valueLabel}:</strong> ${formatNumber(bestResult.metricValue, 4)}</li>
                    <li><strong>${APP_CONFIG.UI_TEXTS.bruteForceResult.logicLabel}:</strong> ${bestResult.logic.toUpperCase()}</li>
                    <li><strong>${APP_CONFIG.UI_TEXTS.bruteForceResult.criteriaLabel}:</strong> ${formatCriteriaFunc(bestResult.criteria, bestResult.logic)}</li>
                </ul>
                <p class="mb-1 text-muted"><small>${APP_CONFIG.UI_TEXTS.bruteForceResult.durationLabel}: ${formatNumber(duration / 1000, 1)}s | ${APP_CONFIG.UI_TEXTS.bruteForceResult.testedLabel}: ${formatNumber(totalTested, 0)}</small></p>
                <p class="mb-0 text-muted" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.bruteForceResult.kollektivStats}"><small>${APP_CONFIG.UI_TEXTS.bruteForceResult.kollektivNLabel}=${formatNumber(nGesamt,0,'N/A')} (N+: ${formatNumber(nPlus,0,'N/A')}, N-: ${formatNumber(nMinus,0,'N/A')})</small></p>
            </div>
            <h6 class="mb-2">${APP_CONFIG.UI_TEXTS.bruteForceDetailsButton.topResultsLabel}</h6>
            <div class="table-responsive">
                <table class="table table-sm table-striped table-hover small" id="bruteforce-results-table">
                    <thead class="small">
                        <tr>
                            <th data-tippy-content="${APP_CONFIG.UI_TEXTS.bruteForceDetailsButton.rankTooltip}">${APP_CONFIG.UI_TEXTS.bruteForceDetailsButton.rankLabel}</th>
                            <th data-tippy-content="${APP_CONFIG.UI_TEXTS.bruteForceDetailsButton.metricValueTooltip.replace('{METRIC_DISPLAY_NAME}', metricDisplayName)}">${metricDisplayName}</th>
                            <th data-tippy-content="${APP_CONFIG.UI_TEXTS.bruteForceDetailsButton.sensTooltip}">${APP_CONFIG.UI_TEXTS.t2MetricsOverview.sensShort}</th>
                            <th data-tippy-content="${APP_CONFIG.UI_TEXTS.bruteForceDetailsButton.spezTooltip}">${APP_CONFIG.UI_TEXTS.t2MetricsOverview.spezShort}</th>
                            <th data-tippy-content="${APP_CONFIG.UI_TEXTS.bruteForceDetailsButton.ppvTooltip}">${APP_CONFIG.UI_TEXTS.t2MetricsOverview.ppvShort}</th>
                            <th data-tippy-content="${APP_CONFIG.UI_TEXTS.bruteForceDetailsButton.npvTooltip}">${APP_CONFIG.UI_TEXTS.t2MetricsOverview.npvShort}</th>
                            <th data-tippy-content="${APP_CONFIG.UI_TEXTS.bruteForceDetailsButton.logicTooltip}">${APP_CONFIG.UI_TEXTS.bruteForceResult.logicLabel}</th>
                            <th data-tippy-content="${APP_CONFIG.UI_TEXTS.bruteForceDetailsButton.criteriaTooltip}">${APP_CONFIG.UI_TEXTS.bruteForceResult.criteriaLabel}</th>
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
                    <td>${formatNumber(result.metricValue, 4)}</td>
                    <td>${result.sens !== undefined ? formatPercent(result.sens, 1) : 'N/A'}</td>
                    <td>${result.spez !== undefined ? formatPercent(result.spez, 1) : 'N/A'}</td>
                    <td>${result.ppv !== undefined ? formatPercent(result.ppv, 1) : 'N/A'}</td>
                    <td>${result.npv !== undefined ? formatPercent(result.npv, 1) : 'N/A'}</td>
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
        const lang = state.getCurrentPublikationLang() || APP_CONFIG.PUBLICATION_CONFIG.defaultLanguage;
        const currentBfMetric = state.getCurrentPublikationBruteForceMetric() || APP_CONFIG.PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const sectionNavItems = APP_CONFIG.PUBLICATION_CONFIG.sections.map(mainSection => {
            const sectionTooltip = APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.publikationTabTooltips[mainSection.id]?.description || APP_CONFIG.UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey;
            
            // For main sections like Abstract, Introduction, Discussion, References, no sub-sections are listed in the nav but they are top-level clickable.
            const isTopLevelLink = mainSection.subSections.length === 1 && mainSection.subSections[0].isTopLevel;
            const linkDataSectionId = isTopLevelLink ? mainSection.id : mainSection.subSections[0].id;
            const linkLabel = APP_CONFIG.UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey;
            
            if (mainSection.subSections.length > 0 && !isTopLevelLink) {
                 return `
                    <li class="nav-item">
                        <span class="nav-link disabled" data-tippy-content="${sectionTooltip}">${linkLabel}</span>
                        <ul class="nav flex-column ps-3">
                            ${mainSection.subSections.map(sub => `
                                <li class="nav-item">
                                    <a class="nav-link py-1 publikation-section-link" href="#" data-section-id="${sub.id}" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.publikationTabTooltips[sub.id]?.description || sub.label || sub.id}">
                                        ${sub.label}
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </li>`;
            } else {
                return `
                    <li class="nav-item">
                        <a class="nav-link publikation-section-link" href="#" data-section-id="${linkDataSectionId}" data-tippy-content="${sectionTooltip}">
                            ${linkLabel}
                        </a>
                    </li>`;
            }
        }).join('');

        const bfMetricOptions = APP_CONFIG.PUBLICATION_CONFIG.bruteForceMetricsForPublication.map(opt =>
            `<option value="${opt.value}" ${opt.value === currentBfMetric ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        return `
            <div class="row mb-3 sticky-top bg-light py-2 shadow-sm" style="top: var(--sticky-header-offset); z-index: 1015;">
                <div class="col-md-3">
                    <h5 class="mb-2">${APP_CONFIG.UI_TEXTS.publikationTab.sectionsTitle}</h5>
                    <nav id="publikation-sections-nav" class="nav flex-column nav-pills" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.publikationTabTooltips.sectionSelect.description}">
                        ${sectionNavItems}
                    </nav>
                </div>
                <div class="col-md-9">
                    <div class="d-flex justify-content-end align-items-center mb-2">
                        <div class="me-3">
                           <label for="publikation-bf-metric-select" class="form-label form-label-sm mb-0 me-1">${APP_CONFIG.UI_TEXTS.publikationTab.bruteForceMetricSelectLabel}</label>
                           <select class="form-select form-select-sm d-inline-block" id="publikation-bf-metric-select" style="width: auto;" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.publikationTabTooltips.bruteForceMetricSelect.description}">
                               ${bfMetricOptions}
                           </select>
                        </div>
                        <div class="form-check form-switch" data-tippy-content="${APP_CONFIG.UI_TEXTS.TOOLTIP_CONTENT.publikationTabTooltips.spracheSwitch.description}">
                            <input class="form-check-input" type="checkbox" role="switch" id="publikation-sprache-switch" ${lang === 'en' ? 'checked' : ''}>
                            <label class="form-check-label fw-bold" for="publikation-sprache-switch" id="publikation-sprache-label">${APP_CONFIG.UI_TEXTS.publikationTab.spracheSwitchLabel[lang]}</label>
                        </div>
                    </div>
                    <div id="publikation-content-area" class="bg-white p-3 border rounded" style="min-height: 400px; max-height: calc(100vh - var(--sticky-header-offset) - 4rem - 2rem); overflow-y: auto;">
                        <p class="text-muted">${APP_CONFIG.UI_TEXTS.publikationTab.selectSectionPrompt}</p>
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
