const uiComponents = (() => {

    function createDashboardCard(title, content, chartId = null, cardClasses = '', headerClasses = '', bodyClasses = '', downloadButtons = []) {
        const currentLang = state.getCurrentPublikationLang() || 'de';
        const langUiTexts = getUiTexts(currentLang); // Holt DE oder EN Texte
        const langTooltipContent = getTooltipContent(currentLang);

        let headerButtonHtml = '';
         if(downloadButtons && downloadButtons.length > 0 && chartId) {
             headerButtonHtml = downloadButtons.map(btn => {
                 const tooltipText = btn.tooltip || (langTooltipContent.singleChartDownload && langTooltipContent.singleChartDownload[btn.format === 'png' ? 'pngLabel' : 'svgLabel']) || `Als ${btn.format.toUpperCase()} herunterladen`;
                 return `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${btn.id}" data-chart-id="${chartId}" data-format="${btn.format}" data-tippy-content="${tooltipText}"> <i class="fas ${btn.icon || 'fa-download'}"></i></button>`
             }).join('');
        }
        const tooltipContent = (langTooltipContent.deskriptiveStatistik && langTooltipContent.deskriptiveStatistik[chartId]?.description) || title || '';
        const cardTitleText = title; // Title wird als Parameter übergeben, sollte schon sprachspezifisch sein

        return `
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 dashboard-card-col ${cardClasses}">
                <div class="card h-100 dashboard-card">
                    <div class="card-header ${headerClasses} d-flex justify-content-between align-items-center" data-tippy-content="${tooltipContent}">
                        <span class="text-truncate">${cardTitleText}</span>
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
        const currentLang = state.getCurrentPublikationLang() || 'de'; // Standard UI Sprache
        const langUiTexts = getUiTexts(currentLang);
        const langTooltipContent = getTooltipContent(currentLang);

        if (!initialCriteria || !initialLogic) return `<p class="text-danger">${langUiTexts.t2CriteriaControls?.loadError || 'Fehler: Initialkriterien konnten nicht geladen werden.'}</p>`;
        const logicChecked = initialLogic === 'ODER';
        const defaultCriteriaForSize = getDefaultT2Criteria();
        const sizeThreshold = initialCriteria.size?.threshold ?? defaultCriteriaForSize?.size?.threshold ?? 5.0;
        const sizeMin = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min;
        const sizeMax = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max;
        const sizeStep = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step;
        const formattedThreshold = formatNumber(sizeThreshold, 1, '5.0', true, currentLang);
        const t2ControlsTexts = langUiTexts.t2CriteriaControls || {};
        const t2TooltipTexts = langTooltipContent.t2Actions || {};

        const createButtonOptions = (key, isChecked, criterionLabel) => {
            const valuesKey = key.toUpperCase() + '_VALUES';
            const values = APP_CONFIG.T2_CRITERIA_SETTINGS[valuesKey] || [];
            const currentValue = initialCriteria[key]?.value;
            return values.map(value => {
                const isActiveValue = isChecked && currentValue === value;
                const icon = ui_helpers.getT2IconSVG(key, value);
                const baseTooltip = langTooltipContent[('t2' + key.charAt(0).toUpperCase() + key.slice(1))]?.buttonTooltip || `Kriterium '${criterionLabel}' auf '${value}' setzen.`;
                const buttonTooltip = `${baseTooltip} ${isChecked ? '' : (t2ControlsTexts.inactiveCriterionTooltipSuffix || '(Kriterium ist derzeit inaktiv)')}`;
                return `<button class="btn t2-criteria-button criteria-icon-button ${isActiveValue ? 'active' : ''} ${isChecked ? '' : 'inactive-option'}" data-criterion="${key}" data-value="${value}" data-tippy-content="${buttonTooltip}" ${isChecked ? '' : 'disabled'}>${icon}</button>`;
            }).join('');
        };

        const createCriteriaGroup = (key, labelKey, tooltipKey, contentGenerator) => {
            const label = t2ControlsTexts.criterionLabels?.[labelKey] || labelKey;
            const isChecked = initialCriteria[key]?.active === true;
            const tooltip = (langTooltipContent[tooltipKey]?.description || label).replace('${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min}', sizeMin).replace('${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max}', sizeMax);
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
                    <span>${t2ControlsTexts.cardTitle || 'T2 Malignitäts-Kriterien Definieren'}</span>
                    <div class="form-check form-switch" data-tippy-content="${langTooltipContent.t2Logic?.description || ''}">
                         <label class="form-check-label small me-2" for="t2-logic-switch" id="t2-logic-label-prefix">${t2ControlsTexts.logicLabelPrefix || 'Logik:'}</label>
                         <input class="form-check-input" type="checkbox" role="switch" id="t2-logic-switch" ${logicChecked ? 'checked' : ''}>
                         <label class="form-check-label fw-bold" for="t2-logic-switch" id="t2-logic-label">${langUiTexts.t2LogicDisplayNames?.[initialLogic] || initialLogic}</label>
                     </div>
                </div>
                <div class="card-body">
                     <div class="row g-4">
                        ${createCriteriaGroup('size', 'size', 't2Size', (key, isChecked) => `
                            <div class="d-flex align-items-center flex-wrap">
                                 <span class="me-1 small text-muted">≥</span>
                                 <input type="range" class="form-range criteria-range flex-grow-1 me-2" id="range-size" min="${sizeMin}" max="${sizeMax}" step="${sizeStep}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} data-tippy-content="${langTooltipContent.t2Size?.sliderTooltip || 'Schwellenwert für Kurzachsendurchmesser (≥) einstellen.'}">
                                 <span class="criteria-value-display text-end me-1 fw-bold" id="value-size">${formatNumber(sizeThreshold, 1, '--', false, currentLang)}</span><span class="me-2 small text-muted">mm</span>
                                 <input type="number" class="form-control form-control-sm criteria-input-manual" id="input-size" min="${sizeMin}" max="${sizeMax}" step="${sizeStep}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} style="width: 70px;" aria-label="${t2ControlsTexts.sizeManualInputLabel || 'Größe manuell eingeben'}" data-tippy-content="${langTooltipContent.t2Size?.inputTooltip || 'Schwellenwert manuell eingeben oder anpassen.'}">
                            </div>
                        `)}
                        ${createCriteriaGroup('form', 'form', 't2Form', createButtonOptions)}
                        ${createCriteriaGroup('kontur', 'kontur', 't2Kontur', createButtonOptions)}
                        ${createCriteriaGroup('homogenitaet', 'homogenitaet', 't2Homogenitaet', createButtonOptions)}
                        ${createCriteriaGroup('signal', 'signal', 't2Signal', (key, isChecked, label) => `
                            <div>${createButtonOptions(key, isChecked, label)}</div>
                            <small class="text-muted d-block mt-1">${t2ControlsTexts.signalNote || 'Hinweis: Lymphknoten mit Signal \'null\' (d.h. nicht beurteilbar/nicht vorhanden) erfüllen das Signal-Kriterium nie.'}</small>
                        `)}
                        <div class="col-12 d-flex justify-content-end align-items-center border-top pt-3 mt-3">
                            <button class="btn btn-sm btn-outline-secondary me-2" id="btn-reset-criteria" data-tippy-content="${t2TooltipTexts.reset || ''}">
                                <i class="fas fa-undo me-1"></i> ${t2ControlsTexts.resetButton || 'Zurücksetzen (Standard)'}
                            </button>
                            <button class="btn btn-sm btn-primary" id="btn-apply-criteria" data-tippy-content="${t2TooltipTexts.apply || ''}">
                                <i class="fas fa-check me-1"></i> ${t2ControlsTexts.applyButton || 'Anwenden & Speichern'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function createBruteForceCard(currentKollektivName, workerAvailable) {
        const currentLang = state.getCurrentPublikationLang() || 'de';
        const langUiTexts = getUiTexts(currentLang);
        const langTooltipContent = getTooltipContent(currentLang);
        const bfCardTexts = langUiTexts.bruteForceCard || {};
        const bfTooltipTexts = langTooltipContent.bruteForceMetric || {};

        const disabledAttribute = !workerAvailable ? 'disabled' : '';
        const startButtonText = workerAvailable ? `<i class="fas fa-cogs me-1"></i> ${bfCardTexts.startButton || 'Optimierung starten'}` : `<i class="fas fa-times-circle me-1"></i> ${bfCardTexts.startButtonWorkerMissing || 'Worker nicht verfügbar'}`;
        const statusText = workerAvailable ? (bfCardTexts.statusReady || 'Bereit.') : (bfCardTexts.statusWorkerMissing || 'Worker konnte nicht initialisiert werden.');
        const defaultMetric = APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC || 'Balanced Accuracy';
        const metricOptions = (langUiTexts.bruteForceMetricOptions || [
            { value: "Accuracy", label: "Accuracy" },
            { value: "Balanced Accuracy", label: "Balanced Accuracy" },
            { value: "F1-Score", label: "F1-Score" },
            { value: "PPV", label: "Positiver Prädiktiver Wert (PPV)" },
            { value: "NPV", label: "Negativer Prädiktiver Wert (NPV)" }
        ]).map(opt => `<option value="${opt.value}" ${defaultMetric === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('');


        return `
        <div class="col-12">
            <div class="card">
                <div class="card-header">${bfCardTexts.cardTitle || 'Kriterien-Optimierung (Brute-Force)'}</div>
                <div class="card-body">
                    <p class="card-text small">${bfCardTexts.description || 'Findet automatisch die Kombination von T2-Kriterien (Größe, Form, Kontur, Homogenität, Signal) und Logik (UND/ODER), die eine gewählte diagnostische Metrik im Vergleich zum N-Status maximiert.'}</p>
                    <div class="row g-3 align-items-end mb-3">
                        <div class="col-md-4">
                            <label for="brute-force-metric" class="form-label form-label-sm">${bfCardTexts.metricSelectLabel || 'Zielmetrik:'}</label>
                            <select class="form-select form-select-sm" id="brute-force-metric" data-tippy-content="${bfTooltipTexts.description || ''}">
                                ${metricOptions}
                            </select>
                        </div>
                        <div class="col-md-4">
                             <button class="btn btn-primary btn-sm w-100" id="btn-start-brute-force" data-tippy-content="${langTooltipContent.bruteForceStart?.description || ''}" ${disabledAttribute}>
                                 ${startButtonText}
                             </button>
                        </div>
                         <div class="col-md-4">
                             <div id="brute-force-info" class="text-muted small text-md-end" data-tippy-content="${langTooltipContent.bruteForceInfo?.description || ''}">
                                 ${bfCardTexts.statusLabel || 'Status:'} <span id="bf-status-text" class="fw-bold">${statusText}</span><br>${bfCardTexts.kollektivLabel || 'Kollektiv:'} <strong id="bf-kollektiv-info">${getKollektivDisplayName(currentKollektivName, currentLang)}</strong>
                             </div>
                         </div>
                    </div>
                     <div id="brute-force-progress-container" class="mt-3 d-none" data-tippy-content="${langTooltipContent.bruteForceProgress?.description || ''}">
                         <div class="d-flex justify-content-between mb-1 small">
                            <span>${bfCardTexts.progressLabel || 'Fortschritt:'} <span id="bf-tested-count">0</span> / <span id="bf-total-count">0</span></span>
                            <span id="bf-progress-percent">0%</span>
                         </div>
                         <div class="progress" style="height: 8px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" id="bf-progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                         </div>
                         <div class="mt-2 small">
                            ${bfCardTexts.currentBestMetricLabel || 'Beste'} <span id="bf-metric-label" class="fw-bold">${defaultMetric}</span> ${bfCardTexts.currentBestMetricSuffix || 'bisher:'} <span id="bf-best-metric" class="fw-bold">--</span>
                            <div id="bf-best-criteria" class="mt-1 text-muted" style="word-break: break-word;">${bfCardTexts.currentBestCriteriaLabel || 'Beste Kriterien:'} --</div>
                         </div>
                          <button class="btn btn-danger btn-sm mt-2 d-none" id="btn-cancel-brute-force" data-tippy-content="${langTooltipContent.bruteForceCancel?.description || 'Bricht die laufende Brute-Force-Optimierung ab.'}">
                            <i class="fas fa-times me-1"></i> ${bfCardTexts.cancelButton || 'Abbrechen'}
                         </button>
                     </div>
                     <div id="brute-force-result-container" class="mt-3 d-none alert alert-success p-2" role="alert" data-tippy-content="${langTooltipContent.bruteForceResult?.description || ''}">
                         <h6 class="alert-heading small">${bfCardTexts.optimizationCompleteTitle || 'Optimierung Abgeschlossen'}</h6>
                         <p class="mb-1 small">${bfCardTexts.bestResultForLabel || 'Beste Kombi für'} <strong id="bf-result-metric"></strong> (${bfCardTexts.kollektivLabel || 'Koll.'}: <strong id="bf-result-kollektiv"></strong>):</p>
                         <ul class="list-unstyled mb-1 small">
                            <li><strong>${bfCardTexts.valueLabel || 'Wert:'}</strong> <span id="bf-result-value" class="fw-bold"></span></li>
                            <li><strong>${bfCardTexts.logicLabel || 'Logik:'}</strong> <span id="bf-result-logic" class="fw-bold"></span></li>
                            <li style="word-break: break-word;"><strong>${bfCardTexts.criteriaLabel || 'Kriterien:'}</strong> <span id="bf-result-criteria" class="fw-bold"></span></li>
                         </ul>
                         <p class="mb-1 small text-muted">${bfCardTexts.durationLabel || 'Dauer:'} <span id="bf-result-duration"></span>s | ${bfCardTexts.totalTestedLabel || 'Getestet:'} <span id="bf-result-total-tested"></span></small></p>
                         <hr class="my-1">
                         <button class="btn btn-success btn-sm me-2" id="btn-apply-best-bf-criteria" data-tippy-content="${langTooltipContent.bruteForceApply?.description || 'Wendet die beste gefundene Kriterienkombination an und speichert sie.'}">
                             <i class="fas fa-check me-1"></i> ${bfCardTexts.applyButton || 'Anwenden'}
                         </button>
                         <button class="btn btn-outline-secondary btn-sm" id="btn-show-brute-force-details" data-bs-toggle="modal" data-bs-target="#brute-force-modal" data-tippy-content="${langTooltipContent.bruteForceDetailsButton?.description || ''}">
                             <i class="fas fa-list-ol me-1"></i> ${bfCardTexts.top10Button || 'Top 10'}
                         </button>
                     </div>
                </div>
            </div>
        </div>
        `;
    }

    function createStatistikCard(id, title, content = '', addPadding = true, tooltipKey = null, downloadButtons = [], tableId = null) {
        const currentLang = state.getCurrentPublikationLang() || 'de';
        const langTooltipContent = getTooltipContent(currentLang);
        const langUiTexts = getUiTexts(currentLang);

        const cardTooltipHtml = tooltipKey && langTooltipContent[tooltipKey]?.cardTitle
            ? `data-tippy-content="${langTooltipContent[tooltipKey].cardTitle.replace(/\[KOLLEKTIV\]/g, '{KOLLEKTIV_PLACEHOLDER}')}"`
            : '';

        let headerButtonHtml = downloadButtons.map(btn => {
            const tooltipText = btn.tooltip || `${(langUiTexts.statCard?.downloadTablePNG || 'Tabelle als PNG')}`;
            if (btn.tableId) {
                return `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${btn.id}" data-table-id="${btn.tableId}" data-table-name="${btn.tableName || title.replace(/[^a-z0-9]/gi, '_').substring(0,30)}" data-tippy-content="${tooltipText}"><i class="fas ${btn.icon || 'fa-image'}"></i></button>`;
            } else {
                 const chartTooltipText = btn.tooltip || `${(langTooltipContent.singleChartDownload && langTooltipContent.singleChartDownload[btn.format === 'png' ? 'pngLabel' : 'svgLabel']) || `Als ${btn.format.toUpperCase()}`}`;
                 return `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${btn.id}" data-chart-id="${btn.chartId || id+'-content'}" data-format="${btn.format}" data-tippy-content="${chartTooltipText}"><i class="fas ${btn.icon || 'fa-download'}"></i></button>`;
            }
        }).join('');


        if (APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT && tableId && !downloadButtons.some(b => b.tableId === tableId)) {
             const pngExportButtonTooltip = (langUiTexts.statCard?.downloadTablePNGTooltip || "Tabelle '{TABLE_NAME}' als PNG herunterladen.").replace('{TABLE_NAME}', title);
             const pngExportButton = { id: `dl-card-${id}-${tableId}-png`, icon: 'fa-image', tooltip: pngExportButtonTooltip, format: 'png', tableId: tableId, tableName: title.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').substring(0,30) };
             headerButtonHtml += `
                 <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${pngExportButton.id}" data-table-id="${pngExportButton.tableId}" data-table-name="${pngExportButton.tableName}" data-tippy-content="${pngExportButton.tooltip}">
                     <i class="fas ${pngExportButton.icon}"></i>
                 </button>`;
        }


        return `
            <div class="col-12 stat-card" id="${id}-card-container">
                <div class="card h-100">
                    <div class="card-header" ${cardTooltipHtml}>
                         ${title}
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
        const currentLang = state.getCurrentPublikationLang() || 'de';
        const langUiTexts = getUiTexts(currentLang);
        const langTooltipContent = getTooltipContent(currentLang);
        const exportTabTexts = langUiTexts.exportTab || {};
        const exportTabTooltips = langTooltipContent.exportTab || {};

        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(currentKollektiv, currentLang).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        const fileNameTemplate = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE;

        const generateButtonHTML = (idSuffix, iconClass, textKey, tooltipKey, disabled = false, experimental = false) => {
            const text = exportTabTexts[textKey] || textKey;
            const config = exportTabTooltips[tooltipKey]; if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) return ``;
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]; const ext = config.ext; const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeKollektiv).replace('{DATE}', dateStr).replace('{EXT}', ext); const tooltipHtml = `data-tippy-content="${config.description}<br><small>${exportTabTexts.fileLabel || 'Datei'}: ${filename}</small>"`; const disabledAttr = disabled ? 'disabled' : ''; const experimentalBadge = experimental ? `<span class="badge bg-warning text-dark ms-1 small">${exportTabTexts.experimentalBadge || 'Experimentell'}</span>` : ''; const buttonClass = disabled ? 'btn-outline-secondary' : 'btn-outline-primary';
            return `<button class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabledAttr}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${text} (.${ext})</span> ${experimentalBadge}</button>`;
        };

         const generateZipButtonHTML = (idSuffix, iconClass, textKey, tooltipKey, disabled = false) => {
            const text = exportTabTexts[textKey] || textKey;
            const config = exportTabTooltips[tooltipKey]; if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) return ``;
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]; const ext = config.ext; const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeKollektiv).replace('{DATE}', dateStr).replace('{EXT}', ext); const tooltipHtml = `data-tippy-content="${config.description}<br><small>${exportTabTexts.fileLabel || 'Datei'}: ${filename}</small>"`; const disabledAttr = disabled ? 'disabled' : ''; const buttonClass = idSuffix === 'all-zip' ? 'btn-primary' : 'btn-outline-secondary';
            return `<button class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabledAttr}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${text} (.${ext})</span></button>`;
         };

        const exportDesc = (exportTabTooltips.description || '').replace('[KOLLEKTIV]', `<strong>${safeKollektiv}</strong>`);

        return `
            <div class="row export-options-container">
                <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${exportTabTexts.singleExportsTitle || 'Einzelexporte'}</div>
                        <div class="card-body">
                            <p class="small text-muted mb-3">${exportDesc}</p>
                            <h6 class="text-muted small text-uppercase mb-2">${exportTabTexts.reportsAndStatsHeading || 'Berichte & Statistiken'}</h6>
                            ${generateButtonHTML('statistik-csv', 'fas fa-file-csv', 'statsCSVText', 'statsCSV')}
                            ${generateButtonHTML('bruteforce-txt', 'fas fa-file-alt', 'bruteForceTXTText', 'bruteForceTXT', true)}
                            ${generateButtonHTML('deskriptiv-md', 'fab fa-markdown', 'deskriptivMDText', 'deskriptivMD')}
                            ${generateButtonHTML('comprehensive-report-html', 'fas fa-file-invoice', 'comprehensiveReportHTMLText', 'comprehensiveReportHTML')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">${exportTabTexts.tablesAndRawDataHeading || 'Tabellen & Rohdaten'}</h6>
                             ${generateButtonHTML('daten-md', 'fab fa-markdown', 'datenMDText', 'datenMD')}
                             ${generateButtonHTML('auswertung-md', 'fab fa-markdown', 'auswertungMDText', 'auswertungMD')}
                             ${generateButtonHTML('filtered-data-csv', 'fas fa-database', 'filteredDataCSVText', 'filteredDataCSV')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">${exportTabTexts.chartsAndTablesImageHeading || 'Diagramme & Tabellen (als Bilder)'}</h6>
                             ${generateButtonHTML('charts-png', 'fas fa-images', 'chartsPNGText', 'pngZIP')}
                             ${generateButtonHTML('charts-svg', 'fas fa-file-code', 'chartsSVGText', 'svgZIP')}
                        </div>
                    </div>
                </div>
                 <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${exportTabTexts.exportPackagesTitle || 'Export-Pakete (.zip)'}</div>
                        <div class="card-body">
                             <p class="small text-muted mb-3">${(exportTabTexts.exportPackagesDescription || 'Bündelt mehrere thematisch zusammengehörige Exportdateien in einem ZIP-Archiv für das Kollektiv <strong>{KOLLEKTIV}</strong>.').replace('{KOLLEKTIV}', safeKollektiv)}</p>
                            ${generateZipButtonHTML('all-zip', 'fas fa-file-archive', 'allZIPText', 'allZIP')}
                            ${generateZipButtonHTML('csv-zip', 'fas fa-file-csv', 'csvZIPText', 'csvZIP')}
                            ${generateZipButtonHTML('md-zip', 'fab fa-markdown', 'mdZIPText', 'mdZIP')}
                            ${generateZipButtonHTML('png-zip', 'fas fa-images', 'pngZIPText', 'pngZIP')}
                            ${generateZipButtonHTML('svg-zip', 'fas fa-file-code', 'svgZIPText', 'svgZIP')}
                        </div>
                    </div>
                </div>
                <div class="col-lg-12 col-xl-4 mb-3">
                   <div class="card h-100"> <div class="card-header">${exportTabTexts.exportNotesTitle || 'Hinweise zum Export'}</div> <div class="card-body small"> <ul class="list-unstyled mb-0"> ${ (exportTabTexts.exportNotesList || []).map(note => `<li class="mb-2"><i class="${note.icon || 'fas fa-info-circle fa-fw me-1 text-primary'}"></i>${note.text}</li>`).join('') || `<li>Keine Hinweise.</li>` } </ul> </div> </div>
                </div>
            </div>
        `;
    }

    function createT2MetricsOverview(stats, kollektivName) {
        const currentLang = state.getCurrentPublikationLang() || 'de';
        const langUiTexts = getUiTexts(currentLang);
        const langTooltipContent = getTooltipContent(currentLang);
        const t2MetricsTexts = langUiTexts.t2MetricsOverview || {};
        const statMetricsTooltips = langTooltipContent.statMetrics || {};

        const cardTooltip = (langTooltipContent.t2MetricsOverview?.cardTitle || '').replace('[KOLLEKTIV]', `<strong>${kollektivName}</strong>`);
        if (!stats || !stats.matrix || stats.matrix.rp === undefined) {
             return `<div class="card bg-light border-secondary" data-tippy-content="${cardTooltip}"><div class="card-header card-header-sm bg-secondary text-white">${t2MetricsTexts.cardTitleNoData || 'Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)'}</div><div class="card-body p-2"><p class="m-0 text-muted small">${t2MetricsTexts.noDataMessage || 'Metriken für T2 nicht verfügbar.'}</p></div></div>`;
        }
        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
        const metricDisplayNames = t2MetricsTexts.metricDisplayNames || { sens: 'Sens', spez: 'Spez', ppv: 'PPV', npv: 'NPV', acc: 'Acc', balAcc: 'BalAcc', f1: 'F1', auc: 'AUC' };
        const na = '--';

        let contentHTML = '<div class="d-flex flex-wrap justify-content-around small text-center">';

        metrics.forEach((key, index) => {
            const metricData = stats[key];
            const metricDescription = (langTooltipContent.t2MetricsOverview?.[key] || statMetricsTooltips[key]?.description || key).replace(/\[METHODE\]/g, 'T2');
            const interpretationTemplate = statMetricsTooltips[key]?.interpretation || (langUiTexts.noInterpretation || 'Keine Interpretation verfügbar.');
            const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
            const isPercent = !(key === 'f1' || key === 'auc');
            const formattedValue = formatCI(metricData?.value, metricData?.ci?.lower, metricData?.ci?.upper, digits, isPercent, na, currentLang);
            const valueStr = formatNumber(metricData?.value, digits, na, false, currentLang);
            const lowerStr = formatNumber(metricData?.ci?.lower, digits, na, false, currentLang);
            const upperStr = formatNumber(metricData?.ci?.upper, digits, na, false, currentLang);
            const ciMethodStr = metricData?.method || na;
            const bewertungStr = (key === 'auc') ? getAUCBewertung(metricData?.value, currentLang) : '';

            let filledInterpretation = interpretationTemplate
                .replace(/\[METHODE\]/g, 'T2')
                .replace(/\[WERT\]/g, `<strong>${valueStr}${isPercent && valueStr !== na ? '%' : ''}</strong>`)
                .replace(/\[LOWER\]/g, lowerStr)
                .replace(/\[UPPER\]/g, upperStr)
                .replace(/\[METHOD_CI\]/g, ciMethodStr)
                .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
                .replace(/\[BEWERTUNG\]/g, `<strong>${bewertungStr}</strong>`);

            if (lowerStr === na || upperStr === na || ciMethodStr === na) {
                 filledInterpretation = filledInterpretation.replace(/\(95% CI nach .*?: .*? - .*?\)/g, (t2MetricsTexts.noCIData || '(Keine CI-Daten verfügbar)'));
                 filledInterpretation = filledInterpretation.replace(/nach \[METHOD_CI\]:/g, '');
            }
            filledInterpretation = filledInterpretation.replace(/<hr.*?>.*$/, '');

            contentHTML += `
                <div class="p-1 flex-fill bd-highlight ${index > 0 ? 'border-start' : ''}">
                    <strong data-tippy-content="${metricDescription}">${metricDisplayNames[key]}:</strong>
                    <span data-tippy-content="${filledInterpretation}"> ${formattedValue}</span>
                </div>`;
        });

        contentHTML += '</div>';

        return `<div class="card bg-light border-secondary" data-tippy-content="${cardTooltip}"><div class="card-header card-header-sm bg-secondary text-white">${t2MetricsTexts.cardTitle || 'Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)'}</div><div class="card-body p-2">${contentHTML}</div></div>`;
    }

    function createBruteForceModalContent(results, metric, kollektiv, duration, totalTested) {
        const currentLang = state.getCurrentPublikationLang() || 'de';
        const langUiTexts = getUiTexts(currentLang);
        const modalTexts = langUiTexts.bruteForceModal || {};

        if (!results || results.length === 0) return `<p class="text-muted">${modalTexts.noResults || 'Keine Ergebnisse gefunden.'}</p>`;
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'Formatierungsfehler';
        const bestResult = results[0];
        const kollektivName = getKollektivDisplayName(kollektiv, currentLang);
        const metricDisplayName = (langUiTexts.bruteForceMetricDisplayNames || {})[metric] || metric;

        let tableHTML = `
            <div class="alert alert-light small p-2 mb-3">
                <p class="mb-1"><strong>${(modalTexts.bestResultForLabel || 'Beste Kombi für \'{METRIC}\' (Koll.: \'{KOLLEKTIV}\'):').replace('{METRIC}', metricDisplayName).replace('{KOLLEKTIV}', kollektivName)}</strong></p>
                <ul class="list-unstyled mb-1">
                    <li><strong>${modalTexts.valueLabel || 'Wert:'}</strong> ${formatNumber(bestResult.metricValue, 4, '--', false, currentLang)}</li>
                    <li><strong>${modalTexts.logicLabel || 'Logik:'}</strong> ${bestResult.logic.toUpperCase()}</li>
                    <li><strong>${modalTexts.criteriaLabel || 'Kriterien:'}</strong> ${formatCriteriaFunc(bestResult.criteria, bestResult.logic)}</li>
                </ul>
                <p class="mb-0 text-muted"><small>${modalTexts.durationLabel || 'Dauer:'} ${formatNumber(duration / 1000, 1, '--', false, currentLang)}s | ${modalTexts.totalTestedLabel || 'Getestet:'} ${formatNumber(totalTested, 0, '--', false, currentLang)}</small></p>
            </div>
            <h6 class="mb-2">${modalTexts.top10Title || 'Top 10 Ergebnisse (inkl. identischer Werte):'}</h6>
            <div class="table-responsive">
                <table class="table table-sm table-striped table-hover small" id="bruteforce-results-table">
                    <thead class="small">
                        <tr>
                            <th data-tippy-content="${langTooltipContent.bruteForceModal?.rankHeaderTooltip || 'Rang'}">${modalTexts.rankHeader || 'Rang'}</th>
                            <th data-tippy-content="${(langTooltipContent.bruteForceModal?.metricHeaderTooltip || 'Wert der Zielmetrik ({METRIC_NAME})').replace('{METRIC_NAME}', metricDisplayName)}">${metricDisplayName}</th>
                            <th data-tippy-content="${langTooltipContent.bruteForceModal?.logicHeaderTooltip || 'Logik'}">${modalTexts.logicHeader || 'Logik'}</th>
                            <th data-tippy-content="${langTooltipContent.bruteForceModal?.criteriaHeaderTooltip || 'Kriterienkombination'}">${modalTexts.criteriaHeader || 'Kriterien'}</th>
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

            if (rank > 10 && isNewRank) break;

            tableHTML += `
                <tr>
                    <td>${currentRank}.</td>
                    <td>${formatNumber(result.metricValue, 4, '--', false, currentLang)}</td>
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
        const lang = state.getCurrentPublikationLang() || PUBLICATION_CONFIG.defaultLanguage;
        const currentBfMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const langUiTexts = getUiTexts(lang);
        const pubTabTexts = langUiTexts.publikationTab || {};
        const tooltipContent = getTooltipContent(lang).publikationTabTooltips || {};

        const sectionNavItems = PUBLICATION_CONFIG.sections.map(mainSection => {
            const mainSectionLabel = pubTabTexts.sectionLabels?.[mainSection.labelKey] || mainSection.labelKey;
            let subSectionHtml = '';
            if (mainSection.subSections && mainSection.subSections.length > 0) {
                subSectionHtml = `<ul class="nav flex-column ms-3">`;
                mainSection.subSections.forEach(subSec => {
                    const subSectionLabel = (pubTabTexts.subSectionLabels || {})[subSec.labelKey] || subSec.labelKey;
                     subSectionHtml += `
                        <li class="nav-item">
                            <a class="nav-link py-1 publikation-section-link" href="#" data-section-id="${subSec.id}">
                                ${subSectionLabel}
                            </a>
                        </li>`;
                });
                subSectionHtml += `</ul>`;
            }
            return `
                <li class="nav-item">
                    <a class="nav-link py-2 publikation-section-link fw-bold disabled" href="#" data-section-id="${mainSection.id}">
                        ${mainSectionLabel}
                    </a>
                    ${subSectionHtml}
                </li>`;
        }).join('');

        const bfMetricOptions = PUBLICATION_CONFIG.bruteForceMetricsForPublication.map(opt => {
            const label = (pubTabTexts.bruteForceMetricLabels || {})[opt.labelKey] || opt.labelKey;
            return `<option value="${opt.value}" ${opt.value === currentBfMetric ? 'selected' : ''}>${label}</option>`
        }).join('');

        return `
            <div class="row mb-3 sticky-top bg-light py-2 shadow-sm" style="top: calc(var(--header-height) + var(--nav-height)); z-index: 1010;">
                <div class="col-md-3">
                    <h5 class="mb-2">${pubTabTexts.sectionLabels?.sectionsNavTitle || 'Abschnitte'}</h5>
                    <nav id="publikation-sections-nav" class="nav flex-column nav-pills">
                        ${sectionNavItems}
                    </nav>
                </div>
                <div class="col-md-9">
                    <div class="d-flex justify-content-end align-items-center mb-2">
                        <div class="me-3">
                           <label for="publikation-bf-metric-select" class="form-label form-label-sm mb-0 me-1">${pubTabTexts.bruteForceMetricSelectLabel}</label>
                           <select class="form-select form-select-sm d-inline-block" id="publikation-bf-metric-select" style="width: auto;" data-tippy-content="${tooltipContent.bruteForceMetricSelect?.description || ''}">
                               ${bfMetricOptions}
                           </select>
                        </div>
                        <div class="form-check form-switch" data-tippy-content="${tooltipContent.spracheSwitch?.description || ''}">
                            <input class="form-check-input" type="checkbox" role="switch" id="publikation-sprache-switch" ${lang === 'en' ? 'checked' : ''}>
                            <label class="form-check-label fw-bold" for="publikation-sprache-switch" id="publikation-sprache-label">${pubTabTexts.spracheSwitchLabel}</label>
                        </div>
                    </div>
                    <div id="publikation-content-area" class="bg-white p-3 border rounded" style="min-height: 400px; max-height: calc(100vh - var(--header-height) - var(--nav-height) - 70px); overflow-y: auto;">
                        <p class="text-muted">${pubTabTexts.noSectionSelected || 'Bitte wählen Sie einen Abschnitt aus der Navigation.'}</p>
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
